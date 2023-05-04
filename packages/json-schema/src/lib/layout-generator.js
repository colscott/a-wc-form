import { getSchemaValue } from 'a-wc-form-binder/src/lib/json-pointer.js';
import { getLayoutGenerator, setLayoutGenerator } from './layout-generator-registry.js';

/** @typedef {import('../lib/models.js').JsonSchema} JsonSchema */

/** @typedef {import("a-wc-form-layout/src/lib/models").ComponentTemplate} ComponentTemplate */
/** @typedef {import("a-wc-form-layout/src/lib/models").PossibleValues} PossibleValues */

/**
 * @param {import("./models").JsonSchema} schema to generate uiSchema for
 * @param {string} [startRef='#'] JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {ComponentTemplate} for the schema passed in
 */
export function getLayout(schema, startRef) {
  /** @type {import("../lib/models").JsonSchema} */
  const currentSchema = getSchemaValue(schema, startRef || '#');
  if (typeof currentSchema.type === 'string') {
    return getLayoutGenerator(currentSchema.type)(schema, startRef || '#');
  }
  throw new Error(`Unsupported JSON Schema type: ${currentSchema.type}`);
}

/**
 * @param {import("./models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {boolean} if the schema field is required
 */
export function isRequired(schema, ref) {
  let innerProperties = ref
    // strip the property name to get the parent
    .substring(0, ref.lastIndexOf('/'))
    // strip any trailing array indexes to get the main parent object
    .replace(/\/\d+$/, '');
  if (innerProperties.match(/\/items/)) {
    // if an Array change ref to be parent object that has the required property
    innerProperties = innerProperties.substring(0, innerProperties.lastIndexOf('/'));
  }
  /** @type {import("./models").JsonSchema} */
  const parentSchema = getSchemaValue(schema, innerProperties);
  const property = ref.substring(ref.lastIndexOf('/') + 1);
  return parentSchema.required != null && parentSchema.required.indexOf(property) > -1;
}

const typeMapping = {
  boolean: 'checkbox',
  number: 'number',
  integer: 'number',
  string: 'text',
};

const formatMapping = {
  'date-time': 'datetime-local',
  date: 'date',
  time: 'time',
  duration: 'text',
  email: 'email',
  password: 'password',
};

/**
 * Extracts the possible available values from a JSON Schema
 * @param {import("../lib/models").JsonSchema} schema
 * @return {PossibleValues}
 */
export function getPossibleValues(schema) {
  if (schema.oneOf) {
    // { type: 'integer', oneOf: [ { enum: [0], description: 'value0'}, { enum: [1], description: 'value1'} ] }
    // { type: 'integer', oneOf: [ { const: 0, description: 'value0'}, { const: 1, description: 'value1'} ] }
    return schema.oneOf
      .filter(oneOf => typeof oneOf !== 'boolean')
      .map(oneOf => {
        if (typeof oneOf !== 'boolean' && oneOf.description) {
          return {
            value: 'const' in oneOf ? oneOf.const.toString() : oneOf.enum[0].toString(),
            label: oneOf.description,
          };
        }
        return '';
      });
  }

  // Support for some proprietary libraries
  // { type: 'integer', enum: [0, 1], x-enumNames: ['zero', 'one']}
  // { type: 'integer', enum: [0, 1], x-enum-varnames: ['zero', 'one']}
  // { type: 'string', enum: ['value0', 'value1']}
  if (schema.enum instanceof Array) {
    if (schema['x-enumNames']) {
      return schema.enum.map((e, i) => ({ label: schema['x-enumNames'][i].toString(), value: e.toString() }));
    }
    if (schema['x-enum-varnames']) {
      return schema.enum.map((e, i) => ({ label: schema['x-enum-varnames'][i].toString(), value: e.toString() }));
    }
    return schema.enum.map(e => e.toString());
  }
  return [];
}

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {ComponentTemplate}
 */
function controlToLayout(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} */
  const currentSchema = getSchemaValue(schema, ref);

  const possibleValues = getPossibleValues(currentSchema);

  /** @type {ComponentTemplate} */
  const component = {
    template: 'Control',
    properties: {
      ref,
      type:
        currentSchema.type === 'string'
          ? formatMapping[currentSchema.format] || 'text'
          : typeMapping[currentSchema.type],
      description: currentSchema.description,
      label: currentSchema.title,
      possibleValues: possibleValues.length ? possibleValues : undefined,
      readOnly: currentSchema.readOnly === true,
      validation: {
        max: currentSchema.maximum || currentSchema.exclusiveMaximum,
        min: currentSchema.minimum || currentSchema.exclusiveMinimum,
        maxLength: currentSchema.maxLength,
        minLength: currentSchema.minLength,
        required: isRequired(schema, ref),
        step: currentSchema.multipleOf || (currentSchema.type === 'integer' && 1) || undefined,
        pattern: currentSchema.pattern,
      },
    },
  };
  return component;
}

setLayoutGenerator('boolean', controlToLayout);
setLayoutGenerator('integer', controlToLayout);
setLayoutGenerator('number', controlToLayout);
setLayoutGenerator('string', controlToLayout);

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {import("a-wc-form-layout/src/lib/models").HorizontalLayout|import("a-wc-form-layout/src/lib/models").VerticalLayout}
 */
function objectToLayout(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} schema to generate uiSchema for */
  const currentSchema = getSchemaValue(schema, ref);
  const arrayItemIndex = ref.match(/\/(\d+)$/);
  return {
    template: arrayItemIndex && arrayItemIndex[1] ? 'HorizontalLayout' : 'VerticalLayout',
    properties: {
      components: Object.entries(currentSchema.properties).map(entry => {
        if (typeof entry[1] !== 'boolean' && typeof entry[1].type === 'string') {
          return getLayoutGenerator(entry[1].type)(schema, `${ref}/${entry[0]}`);
        }
        throw new Error(`Unsupported JSON Schema type: ${entry[1]}`);
      }),
      label: currentSchema.title,
    },
  };
}

setLayoutGenerator('object', objectToLayout);

/**
 * @param {import("./models").JsonSchema} schema
 * @param {string} ref JSON pointer
 * @returns {import("a-wc-form-layout/src/lib/models").GridComponent | import("a-wc-form-layout/src/lib/models").HorizontalLayout | import("a-wc-form-layout/src/lib/models").ArrayLayout | import('a-wc-form-layout/src/lib/models').ArrayComponent}
 */
const arrayToLayout = (schema, ref) => {
  /** @type {import("../lib/models").JsonSchema} */
  const currentSchema = getSchemaValue(schema, ref);
  const { minItems, maxItems, uniqueItems, items } = currentSchema;
  if (typeof items === 'boolean') {
    return null;
  }

  if (typeof items === 'boolean') {
    return null;
  }

  // object of number - infinite array - iterate data output vertical
  // object of object - infinite array
  // Array of object - finite array - iterate data same time output vertical with each object in a horizontal row (grid)
  // Array of Array?? - finite array - iterate uiSchema and data same time output horizontal
  if (items instanceof Array) {
    // Tuple
    // items: [{type: number},{type: number}]
    return {
      template: 'HorizontalLayout',
      properties: {
        label: currentSchema.title,
        components: items.filter(item => typeof item !== 'boolean').map((item, i) => getLayout(schema, `${ref}/${i}`)),
      },
    };
  }
  // List
  // items: { type: object }
  // items: { properties: { foo: { type: number|string|boolean }, bar: { type: object }, ... }
  // List needs access to data, layout is not known yet as it depends on the amount of data
  if (items.properties) {
    return {
      template: 'GridComponent',
      properties: {
        ref,
        label: currentSchema.title,
        components: Object.entries(items.properties).map(entry => getLayout(schema, `${ref}/items/${entry[0]}`)),
      },
    };
  }

  // items: { type: number|string, enum: [], uniqueItems: true, minItems: 1 }
  // Select control
  if ((items.type === 'string' || items.type === 'number') && items.enum instanceof Array) {
    return {
      template: 'ArrayControl',
      properties: {
        ref,
        label: currentSchema.title,
        readOnly: currentSchema.readOnly === true,
        possibleValues: getPossibleValues(items),
        validation: {
          required: isRequired(schema, ref),
        },
      },
    };
  }

  // items: { type: number|string|boolean }
  return {
    template: 'ArrayLayout',
    properties: {
      ref,
      label: currentSchema.title,
      component: getLayout(schema, `${ref}/items`),
    },
  };
};

setLayoutGenerator('array', arrayToLayout);
