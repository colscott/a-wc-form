export {};
/** @typedef {('Group'|'Horizontal'|'VerticalLayout'|'Label')} JsonUiSchemaLayoutType */

/**
 * @typedef {Object} JsonUiSchemaLayout
 * @property {JsonUiSchemaLayoutType} type the layout type to use for this part of the form. This will direct how the form will be rendered
 * @property {string} [label] some layout make use of the label as a UI header
 * @property {Array<JsonUiSchema>} elements
 */

/**
 * @typedef {Object} JsonUiSchemaControl
 * @property {('Control')} type the controller type
 * @property {string} [label] some layout make use of the label as a UI header
 * @property {string} ref pointer to the type in the JSON Schema that will back this value
 */

/** @typedef {JsonUiSchemaControl|JsonUiSchemaLayout} JsonUiSchema */

/** @typedef {import("json-schema").JSONSchema7} JsonSchema */

/**
 * @typedef {Object} JsonUiSchemeContext
 * @property {JsonUiSchema} rootUiSchema
 * @property {JsonUiSchema} currentUiSchema
 * @property {JsonSchema} rootSchema
 * @property {any} data
 * @property {any} currentData
 */

/**
 * @typedef {Object} JsonUiSchemeLayoutContext
 * @property {JsonUiSchema} rootUiSchema
 * @property {JsonUiSchemaLayout} currentUiSchema
 * @property {JsonSchema} rootSchema
 * @property {any} data
 * @property {any} currentData
 */

/**
 * @typedef {Object} JsonUiSchemeControlContext
 * @property {JsonUiSchema} rootUiSchema
 * @property {JsonUiSchemaControl} currentUiSchema
 * @property {JsonSchema} rootSchema
 * @property {any} data
 * @property {any} currentData
 */

/** @typedef {function(JsonUiSchemeContext):import('lit-html').TemplateResult|Array<import('lit-html').TemplateResult>} JsonUiSchemaTemplate */
