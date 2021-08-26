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
    ref.replace(/\//g, "/properties/").replace(/\/(\d+)/g, "/items/$1"),
    true
  );
  return getDataProperty(dataAndProperty);
};

/**
 * @param {object|Array} item to iterate mapping the data to a flat Map of <JSONPointer, value>.
 * @param {Map<string, unknown>} [map] to add the JSON Pointers too
 * @returns {Map<string, unknown>} JSON Pointer, value entries
 */
export function objectToJsonPointers(item, map = new Map(), _ref = "#") {
  if (item instanceof Array) {
    item.forEach((entry, index) => {
      objectToJsonPointers(entry, map, `${_ref}/${index}`);
    });
  } else if (item && typeof item === "object") {
    Object.keys(item).forEach((key, index) => {
      objectToJsonPointers(item[key], map, `${_ref}/${key}`);
    });
  } else {
    map.set(_ref, item);
  }
  return map;
}

/**
 * 
 * @param {string} ref JSON pointer to normalize
 * @returns {string} the normalized JSON pointer (ensures it starts '#/')
 */
export function normalize(ref) {
  if (ref[0] === "#") {
    return ref;
  }
  if (ref[0] === "/") {
    return `#${ref}`;
  }
  return `#/${ref}`;
}
