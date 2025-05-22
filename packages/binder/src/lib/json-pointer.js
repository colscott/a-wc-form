/**
 * @param {Object.<string, any>} data
 * @param {string} ref
 * @param {string|RegExp} [pattern='/'] pattern to split the ref on
 * @returns {{data: any; property: string;}}
 */
const getDataRef = (data, ref, pattern = '/') => {
  let nextData = data;
  const keys = ref.split(pattern).reverse();
  while (nextData && keys.length > 1) {
    const nextKey = keys.pop();

    if (nextKey in nextData) {
      nextData = nextData[nextKey];
    }
  }

  return { data: nextData, property: keys[0] };
};

const isIntRegEx = /^[0-9]+$/;

/**
 * @param {*} data
 * @param {string} ref
 */
const buildOutObject = (data, ref) => {
  const keys = ref.split(/[\/\.]/);
  let nextData = data;
  keys.forEach((key, i) => {
    if (key.length && key !== '#') {
      const nextKey = keys[i + 1];
      // If there is a next key then it is expecting either array or object
      if (nextKey && !nextData[key]) {
        nextData[key] = isIntRegEx.test(nextKey) ? [] : {};
      }
      nextData = nextData[key];
    }
  });
};

/**
 * @param {{data: any; property: string;}} dataAndProperty
 * @returns {any} value
 */
const getDataProperty = dataAndProperty => {
  if (
    !dataAndProperty.property ||
    dataAndProperty.property === '#' ||
    dataAndProperty.property === '#/' ||
    dataAndProperty.property === '/'
  ) {
    return dataAndProperty.data;
  }

  const value = dataAndProperty.data[dataAndProperty.property];
  return value;
};

/**
 * @param {any} data
 * @param {string} ref
 * @returns {any}
 */
export const getValue = (data, ref) => {
  const dataAndProperty = getDataRef(data, ref, /[\/\.]/);
  return getDataProperty(dataAndProperty);
};

/**
 * @param {any} data
 * @param {string} ref
 * @param {any} value
 */
export const setValue = (data, ref, value) => {
  buildOutObject(data, ref);
  const dataAndProperty = getDataRef(data, ref, /[\/\.]/);
  dataAndProperty.data[dataAndProperty.property] = value;
};

/**
 * @param {any} data
 * @param {string} ref
 * @returns {any}
 */
export const getSchemaValue = (data, ref) => {
  // Make sure ref starts with # or /
  let refForJsonSchema = ref && ref[0] !== '#' && ref[0] !== '/' ? `/${ref}` : ref;
  // add 'properties' and 'items' throughout the ref
  refForJsonSchema = refForJsonSchema
    .replace(/\/(\d+)/g, '/items/$1')
    .replace(/\//g, '/properties/')
    .replace('__index__', '/items/');
  const dataAndProperty = getDataRef(data, refForJsonSchema);
  // Handle Array of single type
  if (isIntRegEx.test(dataAndProperty.property) && dataAndProperty.data instanceof Array === false) {
    return dataAndProperty.data;
  }
  const result = getDataProperty(dataAndProperty);
  return result;
};

/**
 * Flattens an object into Map<JSONPointer, value>
 * @param {object|Array} item to iterate mapping the data to a flat Map of <JSONPointer, value>.
 * @param {Map<string, unknown>} [map] to add the JSON Pointers too
 * @returns {Map<string, unknown>} JSON Pointer, value entries
 */
export function objectFlat(item, map = new Map(), _ref = '') {
  if (item instanceof Array) {
    item.forEach((entry, index) => {
      objectFlat(entry, map, `${_ref}/${index}`);
    });
  } else if (item && typeof item === 'object') {
    Object.keys(item).forEach((key, index) => {
      objectFlat(item[key], map, `${_ref}/${key}`);
    });
  } else {
    map.set(_ref, item);
  }
  return map;
}

/**
 * @param {string} ref JSON pointer to normalize
 * @returns {string} the normalized JSON pointer (ensures it starts '/')
 */
export function normalize(ref) {
  if (ref[0] === '#') {
    return ref.substr(1);
  }
  if (ref[0] === '/') {
    return `${ref}`;
  }
  return `/${ref}`;
}
