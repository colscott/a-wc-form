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
 * @param {{data: any; property: string;}} dataAndProperty
 * @returns {any} value
 */
const getDataProperty = dataAndProperty => {
  if (dataAndProperty.property === "#") {
    return dataAndProperty.data;
  }

  const value = dataAndProperty.data[dataAndProperty.property];
  if (value !== undefined) {
    return value;
  }

  return dataAndProperty.data;
};

/**
 * @param {any} data
 * @param {string} ref
 * @returns {any}
 */
export const getValue = (data, ref) => {
  const dataAndProperty = getDataRef(data, ref);
  return getDataProperty(dataAndProperty);
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
  return getDataProperty(dataAndProperty);
};
