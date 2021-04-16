import { ifDefined } from "lit-html/directives/if-defined.js";
import { html } from "lit-html/lit-html.js";
import {
  layoutTemplates,
  getControlTemplate,
  getTemplate
} from "a-wc-form-binder/src/lib/template-registry.js";
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
      ${context.currentUiSchema.label
        ? html`
            <span>${context.currentUiSchema.label}</span>
          `
        : html``}
      ${elements.map(element =>
        getTemplate({
          currentData: context.data,
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
  const elements = getElements(context);
  return html`
    <div aria-label=${ifDefined(context.currentUiSchema.label)}>
      ${context.currentUiSchema.label
        ? html`
            <span>${context.currentUiSchema.label}</span>
          `
        : html``}
      ${elements.map(element =>
        getTemplate({
          currentData: context.data,
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
    ref: null,
    label: null
  });
  return uiSchema;
}

// layoutTemplates.set("HorizontalLayout", horizontalTemplate);
// layoutTemplates.set("VerticalLayout", verticalTemplate);
