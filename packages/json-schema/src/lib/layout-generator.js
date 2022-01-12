import { getSchemaValue } from 'a-wc-form-binder/src/lib/json-pointer.js';

/** @typedef {import('../lib/models.js').JsonSchema} JsonSchema */

/** @typedef {import("../../../layout/src/lib/models").ComponentTemplate} ComponentTemplate */

/**
 * @param {import("./models").JsonSchema} schema to generate uiSchema for
 * @param {string} [startRef='#'] JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {ComponentTemplate} for the schema passed in
 */
export function getLayout(schema, startRef) {
  /** @type {import("../lib/models").JsonSchema} */
  const currentSchema = getSchemaValue(schema, startRef || '#');
  return schema2Layout[currentSchema.type](schema, startRef || '#');
}

/**
 * @param {import("./models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {boolean} if the schema field is required
 */
function isRequired(schema, ref) {
  const innerProperties = ref.substr(0, ref.lastIndexOf('/'));
  /** @type {import("./models").JsonSchema} */
  const parentSchema = getSchemaValue(schema, innerProperties);
  const property = ref.substr(ref.lastIndexOf('/') + 1);
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
};

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {ComponentTemplate}
 */
function controlToLayout(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} */
  const currentSchema = getSchemaValue(schema, ref);

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
      possibleValues: currentSchema.enum && currentSchema.enum.map((e) => e.toString()),
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

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {import("../../../layout/src/lib/models").HorizontalLayout|import("../../../layout/src/lib/models").VerticalLayout}
 */
function objectToLayout(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} schema to generate uiSchema for */
  const currentSchema = getSchemaValue(schema, ref);
  const arrayItemIndex = ref.match(/\/(\d+)$/);
  return {
    template: arrayItemIndex && arrayItemIndex[1] ? 'HorizontalLayout' : 'VerticalLayout',
    properties: {
      components: Object.entries(currentSchema.properties).map((entry) =>
        schema2Layout[typeof entry[1] !== 'boolean' && entry[1].type](schema, `${ref}/${entry[0]}`),
      ),
      label: currentSchema.title,
    },
  };
}

/**
 * @param {import("./models").JsonSchema} schema
 * @param {string} ref JSON pointer
 * @returns {import("../../../layout/src/lib/models").GridLayout | import("../../../layout/src/lib/models").HorizontalLayout | import("../../../layout/src/lib/models").ArrayLayout}
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
        components: items
          .filter((item) => typeof item !== 'boolean')
          .map((item, i) => getLayout(schema, `${ref}/${i}`)),
      },
    };
  }
  // List
  // items: { type: object }
  // items: { type: number|string|boolean }
  // List needs access to data, layout is not known yet as it depends on the amount of data
  if (items.properties) {
    return {
      template: 'GridLayout',
      properties: {
        ref,
        label: currentSchema.title,
        components: Object.entries(items.properties).map((entry) => getLayout(schema, `${ref}/items/${entry[0]}`)),
      },
    };
  }
  return {
    template: 'ArrayLayout',
    properties: {
      ref,
      label: currentSchema.title,
      component: getLayout(schema, `${ref}/items`),
    },
  };
};

const schema2Layout = {
  boolean: controlToLayout,
  integer: controlToLayout,
  number: controlToLayout,
  string: controlToLayout,
  array: arrayToLayout,
  object: objectToLayout,
};
