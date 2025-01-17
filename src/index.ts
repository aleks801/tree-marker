const DATA_TEST_ATTR = "data-test"

export type Marker = {
  /**
   * Attribute value
   */
  value: string

  /**
   * Attribute selector
   * @example `[data-test='${value}']`
   */
  selector: string

  /**
   * Object for convenient setting of the node attribute in tsx
   * @example { [DATA_CY_ATTR]: value }
   */
  nodeProps: {
    [DATA_TEST_ATTR]: string
  }
}

export type Schema<M extends Marker> = (value: string) => M

export type UnpackedMarkerType<S extends Schema<any>> = S extends Schema<infer M> ? M : never

export type ComplexSchema<C extends Record<string, Schema<any>>> = Schema<
  Marker & {
    [P in keyof C]: UnpackedMarkerType<C[P]>
  }
>

/**
 * Simple schema for a single marker creation
 * @param value value of data-test attribute
 * @returns Marker
 */
export const simple: Schema<Marker> = (value) => ({
  value,
  selector: `[${DATA_TEST_ATTR}='${value}']`,
  nodeProps: {
    [DATA_TEST_ATTR]: value,
  },
})

/**
 * Function that creates a complex schema containing multiple markers
 * @param nodes Dictionary of markers
 * @returns Function that creates a complex marker
 */
export function complex<C extends Record<string, Schema<any>>>(nodes: C): ComplexSchema<C> {
  return (value: string) => {
    // eslint-disable-next-line no-use-before-define
    const result = simple(value) as Marker & { [P in keyof C]: UnpackedMarkerType<C[P]> }

    Object.keys(nodes).forEach((key) => {
      const child = nodes[key]

      Object.defineProperty(result, key, {
        get: () => child(`${value}/${key}`),
      })
    })

    return result
  }
}

/**
 * Function that creates a schema for a marker with a given value and a key
 * @param schema Schema to create marker
 * @returns Marker object
 */
export function byKey<S extends Schema<any>>(schema: S) {
  return (value: string) => {
    const result = ((key: string) => schema(`${value}/${key}`)) as Marker & ((key: string) => UnpackedMarkerType<S>)
    result.value = value
    result.selector = `[${DATA_TEST_ATTR}='${value}']`

    result.nodeProps = {
      [DATA_TEST_ATTR]: value,
    }

    return result
  }
}
