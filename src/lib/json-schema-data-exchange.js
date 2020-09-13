// @ts-check

/**
 * @param {any} data
 * @param {string} scope
 * @returns {{data: any; property: string;}}
 */
const getDataRef = (data, scope) => {
  let nextData = data;
  const parts = scope.split("/").reverse();
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
 * @param {string} scope
 * @returns {any}
 */
export const getValue = (data, scope) => {
  const dataAndProperty = getDataRef(data, scope);
  return dataAndProperty.property === "#"
    ? dataAndProperty.data
    : dataAndProperty.data[dataAndProperty.property] || "";
};

/**
 * @param {any} data
 * @param {string} scope
 * @param {any} value
 */
export const setValue = (data, scope, value) => {
  const dataAndProperty = getDataRef(data, scope);
  dataAndProperty.data[dataAndProperty.property] = value;
};
