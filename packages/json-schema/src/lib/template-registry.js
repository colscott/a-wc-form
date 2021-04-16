import { getSchema } from "./json-pointer.js";

/** @typedef {import('./json-ui-schema-models.js').JsonUiSchemeContext} JsonUiSchemeContext */
/** @typedef {import('./json-ui-schema-models.js').JsonUiSchemeControlContext} JsonUiSchemeControlContext */
/** @typedef {import('./json-ui-schema-models.js').JsonUiSchemaTemplate} JsonUiSchemaTemplate */

/** @type {Map<string, JsonUiSchemaTemplate>} */
// @ts-ignore
export const controlTemplates = new Map();

/** @type {Map<string, JsonUiSchemaTemplate>} */
export const layoutTemplates = new Map();

/**
 * @param {string} type
 * @returns {JsonUiSchemaTemplate}
 */
const resolveToTemplate = type =>
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
  const jsonSchemaRefValue = getSchema(
    jsonUiSchemaContext.rootSchema,
    jsonUiSchemaContext.currentUiSchema.ref
  );

  let type = jsonSchemaRefValue.type.toString();
  if (type === "string" && jsonSchemaRefValue.format != null) {
    type = jsonSchemaRefValue.format;
  }

  const template = resolveToTemplate(type);
  const templateResult = template({
    rootSchema: jsonUiSchemaContext.rootSchema,
    currentUiSchema: jsonUiSchemaContext.currentUiSchema,
    rootUiSchema: jsonUiSchemaContext.rootUiSchema,
    currentData: jsonUiSchemaContext.currentData,
    data: jsonUiSchemaContext.data
  });
  return templateResult;
}

/**
 * @param {import("./json-ui-schema-models.js").JsonUiSchemeLayoutContext} jsonUiSchemaContext
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function getLayoutTemplate(jsonUiSchemaContext) {
  const template = resolveToTemplate(jsonUiSchemaContext.currentUiSchema.type);

  const templateResult = template(jsonUiSchemaContext);
  return templateResult;
}

/**
 * @param {JsonUiSchemeContext} jsonUiSchemaContext
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function getTemplate(jsonUiSchemaContext) {
  const { currentUiSchema } = jsonUiSchemaContext;
  if (currentUiSchema.type === "Control") {
    return getControlTemplate({ ...jsonUiSchemaContext, currentUiSchema });
  }
  return getLayoutTemplate({ ...jsonUiSchemaContext, currentUiSchema });
}
