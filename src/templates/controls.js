import { html } from "lit-html/lit-html.js";
import { ifDefined } from "lit-html/directives/if-defined.js";
import {
  controlTemplates,
  getControlTemplate,
  getTemplate
} from "../lib/template-registry.js";
import { getValue, getSchema } from "../lib/json-schema-data-binder.js";
import { horizontalTemplate } from "./layouts.js";
import { notImplementedTemplate } from "./misc.js";
import { getUiSchema } from "../lib/schema-generator.js";

/** @typedef {import('../lib/json-ui-schema-models.js').JsonUiSchemeControlContext} JsonUiSchemeControlContext */
/** @typedef {import('../lib/json-ui-schema-models.js').JsonSchema} JsonSchema */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * @param {Event} changeEvent
 * @param {JsonUiSchemeControlContext} context
 */
export function valueChangedHandler(changeEvent, context) {
  const customEvent = new CustomEvent("formValueChanged", {
    bubbles: true,
    composed: true,
    detail: {
      originalEvent: changeEvent
    }
  });
  changeEvent.target.dispatchEvent(customEvent);
  changeEvent.stopPropagation();
}

/**
 * @param {JsonUiSchemeControlContext} context
 */
export function isRequired(context) {
  const { ref } = context.currentUiSchema;
  const innerProperties = ref.substr(0, ref.lastIndexOf("/"));
  /** @type {JsonSchema} */
  const schema = getSchema(context.rootSchema, innerProperties);
  const property = ref.substr(ref.lastIndexOf("/") + 1);
  return schema.required != null && schema.required.indexOf(property) > -1;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @param {string} type HTML5 input type
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function genericInput(context, type) {
  return html`
    <input
      type="${type}"
      name="${context.currentUiSchema.ref}"
      value="${getValue(context.data, context.currentUiSchema.ref)}"
      minlength="${ifDefined(context.currentSchema.minLength)}"
      maxlength="${ifDefined(context.currentSchema.maxLength)}"
      title="${ifDefined(context.currentSchema.description)}"
      ?required=${isRequired(context)}
      @change=${e => valueChangedHandler(e, context)}
    />${context.currentUiSchema.ref}
  `;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {Array<TemplateResult>}
 */
export function arrayTemplate(context) {
  const { currentSchema, currentUiSchema } = context;
  const { minItems, maxItems, uniqueItems, items } = currentSchema;

  if (typeof items === "boolean") {
    return null;
  }

  const itemDataArray = getValue(context.data, currentUiSchema.ref);

  /** @type {Array<TemplateResult>} */
  const templates = [];
  // TODO abstract the array itteration logic away from the HTML mark-up so that it can be reused.

  // object of number - infinite array - iterate data output vertical
  // object of object - infinite array
  // Array of object - finite array - iterate data same time output vertical with each obect in a horizontal row (grid)
  // Array of Array?? - finite array - iterate uiSchema and data same time output horizontal
  if (items instanceof Array) {
    // items: [{type: number},{type: number}]
    itemDataArray.forEach((dataItem, i) => {
      const item = items[i];
      if (typeof item !== "boolean") {
        const uiSchema = getUiSchema(item, `${currentUiSchema.ref}/items/${i}`);
        templates.push(
          getTemplate({
            ...context,
            currentData: dataItem,
            currentSchema: item,
            currentUiSchema: uiSchema
          })
        );
      }
    });
  } else {
    // items: { type: object }
    // items: { type: number }
    itemDataArray.forEach((dataItem, i) => {
      const uiSchema = getUiSchema(items, `${currentUiSchema.ref}/items/${i}`);
      templates.push(
        getTemplate({
          ...context,
          currentData: dataItem,
          currentSchema: items,
          currentUiSchema: uiSchema
        })
      );
    });
  }
  return templates;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function booleanTemplate(context) {
  return html`
    <input
      type="checkbox"
      ?checked=${getValue(context.data, context.currentUiSchema.ref)}
      title="${context.currentSchema.description}"
      @change=${valueChangedHandler}
    />
  `;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function integerTemplate(context) {
  return genericInput(context, "number");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function numberTemplate(context) {
  return genericInput(context, "number");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function stringTemplate(context) {
  if (context.currentSchema.enum != null) {
    return enumTemplate(context);
  }
  return genericInput(context, "text");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function enumTemplate(context) {
  return html`
    <select value="${getValue(context.data, context.currentUiSchema.ref)}">
      ${context.currentSchema.enum.map(
        e =>
          html`
            <option value="${e}">${e}</option>
          `
      )}
    </select>
  `;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function dateTimeTemplate(context) {
  return genericInput(context, "datetime-local");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function dateTemplate(context) {
  return genericInput(context, "date");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function timeTemplate(context) {
  return genericInput(context, "time");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function emailTemplate(context) {
  return genericInput(context, "email");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function objectTemplate(context) {
  return html``;
}

controlTemplates.set("array", arrayTemplate);
controlTemplates.set("boolean", booleanTemplate);
controlTemplates.set("integer", integerTemplate);
controlTemplates.set("null", notImplementedTemplate);
controlTemplates.set("number", numberTemplate);
controlTemplates.set("object", objectTemplate);
controlTemplates.set("string", stringTemplate);
controlTemplates.set("date", dateTemplate);
controlTemplates.set("date-time", dateTimeTemplate);
controlTemplates.set("time", timeTemplate);
controlTemplates.set("email", emailTemplate);
