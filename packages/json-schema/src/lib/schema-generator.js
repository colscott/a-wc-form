/**
 * Generates JSON schema from plain data
 * @param {Object} data to generate the JSONSchema for
 * @returns {import("./models").JsonSchema}
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
