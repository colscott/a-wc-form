import { getValue } from "./json-schema-data-exchange.js";
/** @type {Map<string, JsonUiSchemaTemplate>} */
// @ts-ignore
export const controlTemplates = new Map();

/** @type {Map<string, JsonUiSchemaTemplate>} */
export const layoutTemplates = new Map();

/**
 * @param {string} type
 * @returns {JsonUiSchemaTemplate}
 */
const getTemplate = type =>
  layoutTemplates.get(type) !== undefined
    ? layoutTemplates.get(type)
    : controlTemplates.get(type);

/**
 * @param {JsonUiSchemeControlContext} jsonUiSchemaContext
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function getControlTemplate(jsonUiSchemaContext) {
  // @ts-ignore
  // eslint-disable-next-line no-undef
  const jsonSchemaRefValue = getValue(
    jsonUiSchemaContext.rootSchema,
    jsonUiSchemaContext.currentUiSchema.scope
  );

  let type = jsonSchemaRefValue.type.toString();
  if (type === "string" && jsonSchemaRefValue.format != null) {
    type = jsonSchemaRefValue.format;
  }

  const template = getTemplate(type);
  const templateResult = template({
    currentSchema: jsonSchemaRefValue,
    rootSchema: jsonUiSchemaContext.rootSchema,
    currentUiSchema: jsonUiSchemaContext.currentUiSchema,
    rootUiSchema: jsonUiSchemaContext.rootUiSchema,
    currentData: jsonUiSchemaContext.currentData,
    data: jsonUiSchemaContext.data
  });
  return templateResult;
}

/**
 * @param {JsonUiSchemeContext} jsonUiSchemaContext
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function getLayoutTemplate(jsonUiSchemaContext) {
  const template = getTemplate(jsonUiSchemaContext.currentUiSchema.type);

  const templateResult = template(jsonUiSchemaContext);
  return templateResult;
}
