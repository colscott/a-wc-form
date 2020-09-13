import { html } from "lit-html/lit-html.js";
import {
  layoutTemplates,
  getControlTemplate,
  getLayoutTemplate
} from "../lib/template-registry.js";
import { notImplementedTemplate } from "./misc.js";

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function controlTemplate(context) {
  return html`
    <div>${getControlTemplate(context)}</div>
  `;
}

/**
 * @param {JsonUiSchemeLayoutContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function horizontalTemplate(context) {
  const elements = getElements(context);

  return html`
    <div
      style="display:grid; grid-template-columns: repeat(${elements.length}, 1fr)"
    >
      ${elements.map(element =>
        getLayoutTemplate({
          currentData: context.data,
          currentSchema: context.currentSchema,
          currentUiSchema: element,
          data: context.data,
          rootSchema: context.rootSchema,
          rootUiSchema: context.rootUiSchema
        })
      )}
    </div>
  `;
}

/**
 * @param {JsonUiSchemeLayoutContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function verticalTemplate(context) {
  const { elements } = context.currentUiSchema;
  return html`
    <div>
      ${elements.map(element =>
        getLayoutTemplate({
          currentData: context.data,
          currentSchema: context.currentSchema,
          currentUiSchema: element,
          data: context.data,
          rootSchema: context.rootSchema,
          rootUiSchema: context.rootUiSchema
        })
      )}
    </div>
  `;
}

/**
 * @param {JsonUiSchemeLayoutContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function labelTemplate(context) {
  return html`
    <div>
      ${context.currentUiSchema.text}
    </div>
  `;
}

/**
 * @param {JsonUiSchemeLayoutContext} context
 * @returns {Array<JsonUiSchema>}
 */
function getElements(context) {
  const { currentUiSchema } = context;
  if (currentUiSchema.elements != null) {
    return currentUiSchema.elements;
  }

  return getControls(context);
}

/**
 * @param {JsonUiSchemeLayoutContext} context
 * @returns {Array<JsonUiSchema>}
 */
function getControls(context) {
  /** @type {Array<JsonUiSchema>} */
  const uiSchema = [];
  uiSchema.push({
    type: "Control",
    scope: null,
    label: null
  });
  return uiSchema;
}

layoutTemplates.set("Control", controlTemplate);
layoutTemplates.set("Label", labelTemplate);
layoutTemplates.set("Group", notImplementedTemplate);
layoutTemplates.set("HorizontalLayout", horizontalTemplate);
layoutTemplates.set("VerticalLayout", verticalTemplate);
