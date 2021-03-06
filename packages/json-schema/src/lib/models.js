export {};

/** @typedef {import("json-schema").JSONSchema7} JsonSchema */
/** @typedef {import("json-schema").JSONSchema7TypeName} JsonSchemaTypeName */
/**
 * @template TComponent
 * @typedef {import("a-wc-form-layout/src/lib/models").LayoutContext<TComponent> & {schema: JsonSchema}} SchemaLayoutContext
 */

/**
 * @typedef {Object} JsonSchemaControlType
 * @property {'JsonSchemaControl'} template
 *
 * @typedef {Object} JsonSchemaControlValidation
 * @property {number} [minLength] for text based controls
 * @property {number} [maxLength] for text based controls
 * @property {number} [min] for number based controls
 * @property {number} [max] for number based controls
 * @property {number} [step] for number based controls
 * @property {boolean} [required=false] whether the control value is required
 * @property {string} [pattern] regular expression to validate text input values against
 *
 * @typedef {Object} JsonSchemaControlProperties
 * @property {object} properties
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {JsonSchema} properties.schema JSON Schema for validating the data structure
 * @typedef {JsonSchemaControlType & JsonSchemaControlProperties} JsonSchemaControl
 */
