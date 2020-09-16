/**
 * @param {import("./json-ui-schema-models").JsonSchema} schema to generate uiSchema for
 * @param {string} [startRef='#'] JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {import("./json-ui-schema-models").JsonUiSchema} for the schema passed in
 */
export function getUiSchema(schema, startRef) {
  return schema2UiSchema[schema.type](schema, startRef || "#");
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
 * @param {Object} data to generate the JSONSchema for
 * @returns {import("./json-ui-schema-models").JsonSchema}
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
