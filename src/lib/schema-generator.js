// @ts-check

/**
 * @param {JSONSchema} schema
 * @param {string=} baseScope JSON pointer string to use as a starting point. Use if we are generating uiSchema to be inserted into another uiSchema.
 * @returns {JsonUiSchema}
 */
export function getUiSchema(schema, baseScope) {
  return schema2UiSchema[schema.type](schema, baseScope || "#");
}

const schema2UiSchema = {
  boolean: (schema, ref) => ({
    type: "Control",
    ref
  }),
  interger: (schema, ref) => ({
    type: "Control",
    ref
  }),
  number: (schema, ref) => ({
    type: "Control",
    ref
  }),
  string: (schema, ref) => ({
    type: "Control",
    ref
  }),
  array: (schema, ref) => ({
    type: "Control",
    ref
  }),
  object: (schema, ref) => {
    const innerScope = ref;
    return {
      type: isNaN(ref.substr(ref.lastIndexOf(`/${1}`)))
        ? "VerticalLayout"
        : "HorizontalLayout",
      elements: Object.entries(schema.properties).map(entry =>
        schema2UiSchema[entry[1].type](entry[1], `${innerScope}/${entry[0]}`)
      )
    };
  }
};

/**
 * Generates JSON schema from plain data
 * @param {Object} data
 * @returns {JSONSchema}
 */
export function getSchema(data) {
  return obj2Schema[typeof data](data);
}

const obj2Schema = {
  boolean: data => ({ type: "boolean" }),
  number: data => ({ type: "number" }),
  string: data => ({ type: "string" }),
  array: data => {
    const schema = {
      type: "array",
      items: data.length ? getSchema(data[0]) : { type: "string" }
    };
    return schema;
  },
  object: data => {
    if (data instanceof Array) {
      return obj2Schema.array(data);
    }

    const schema = {
      type: "object",
      properties: {}
    };
    Object.entries(data).forEach(entry => {
      schema.properties[entry[0]] = getSchema(entry[1]);
    });
    return schema;
  }
};
