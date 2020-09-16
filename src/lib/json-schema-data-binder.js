/**
 * @param {any} data
 * @param {string} ref
 * @param {boolean} [traverseSchema=false] whether we are traversing data or schema
 * @returns {{data: any; property: string;}}
 */
const getDataRef = (data, ref, traverseSchema) => {
  let nextData = data;
  const _ref = traverseSchema ? ref.replace(/\//g, "/properties/") : ref;
  const parts = _ref.split("/").reverse();
  while (nextData && parts.length > 1) {
    const nextKey = parts.pop();
    if (nextKey in nextData) {
      nextData = nextData[nextKey];
    }
  }

  return { data: nextData, property: parts[0] };
};

/**
 * @param {any} data
 * @param {string} ref
 * @returns {any}
 */
export const getValue = (data, ref) => {
  const dataAndProperty = getDataRef(data, ref);
  return dataAndProperty.property === "#"
    ? dataAndProperty.data
    : dataAndProperty.data[dataAndProperty.property] || dataAndProperty.data;
};

/**
 * @param {any} data
 * @param {string} ref
 * @param {any} value
 */
export const setValue = (data, ref, value) => {
  const dataAndProperty = getDataRef(data, ref);
  dataAndProperty.data[dataAndProperty.property] = value;
};

/**
 * @param {import("./json-ui-schema-models").JsonSchema} schema
 * @param {string} ref
 * @returns {import("json-schema").JSONSchema7}
 */
export const getSchema = (schema, ref) => {
  const dataAndProperty = getDataRef(schema, ref, true);
  return dataAndProperty.property === "#"
    ? dataAndProperty.data
    : dataAndProperty.data[dataAndProperty.property] || dataAndProperty.data;
};
