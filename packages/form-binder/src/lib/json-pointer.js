/**
 * @param {any} data
 * @param {string} ref
 * @returns {{data: any; property: string;}}
 */
const getDataRef = (data, ref, traverseSchema) => {
  let nextData = data;
  const parts = ref.split("/").reverse();
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
 * @param {any} data
 * @param {string} ref
 * @returns {any}
 */
export const getSchemaValue = (data, ref) => {
  const dataAndProperty = getDataRef(
    data,
    ref.replace(/\//g, "/properties/").replace(/\/\d+/g, "/items"),
    true
  );
  return getDataProperty(dataAndProperty);
};
