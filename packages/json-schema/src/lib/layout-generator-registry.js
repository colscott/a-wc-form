/** @typedef {import("a-wc-form-layout/src/lib/models").ComponentTemplate} ComponentTemplate */

/** @typedef {import("./models").JsonSchemaTypeName} JsonSchemaTypeName */
/** @typedef {import("./models").JsonSchema} JsonSchema */

/** @type {Map<JsonSchemaTypeName, (JsonSchema, string) => ComponentTemplate>} */
const layoutGenerators = new Map();

/**
 * @param {JsonSchemaTypeName} jsonSchemaType to register this layout schema generator for
 * @returns {(JsonSchema, string) => ComponentTemplate} generator that will be able to generate layout schema for the given JSON schema type
 */
export function getLayoutGenerator(jsonSchemaType) {
  return layoutGenerators.get(jsonSchemaType);
}

/**
 * @param {JsonSchemaTypeName} jsonSchemaType to register this layout schema generator for
 * @param {(JsonSchema, string) => ComponentTemplate} layoutGenerator generator that will be able to generate layout schema for the given JSON schema type
 */
export function setLayoutGenerator(jsonSchemaType, layoutGenerator) {
  layoutGenerators.set(jsonSchemaType, layoutGenerator);
}
