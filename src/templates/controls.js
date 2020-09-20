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
  const currentSchema = getSchema(
    context.rootSchema,
    context.currentUiSchema.ref
  );

  if (currentSchema.readOnly === true) {
    return true;
  }

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
  const currentSchema = getSchema(
    context.rootSchema,
    context.currentUiSchema.ref
  );

  return html`
    ${currentSchema.title
      ? html`
          <label
            for=${context.currentUiSchema.ref}
            title=${ifDefined(currentSchema.description)}
            >${currentSchema.title}</label
          >
        `
      : html``}
    <input
      type="${type}"
      name="${context.currentUiSchema.ref}"
      value="${getValue(context.data, context.currentUiSchema.ref)}"
      ?checked="${getValue(context.data, context.currentUiSchema.ref) === true}"
      aria-label=${ifDefined(currentSchema.title)}
      aria-description=${ifDefined(currentSchema.description)}
      minlength="${ifDefined(currentSchema.minLength)}"
      maxlength="${ifDefined(currentSchema.maxLength)}"
      min="${ifDefined(
        currentSchema.minimum || currentSchema.exclusiveMinimum
      )}"
      aria-valuemin=${ifDefined(
        currentSchema.minimum || currentSchema.exclusiveMinimum
      )}
      max="${ifDefined(
        currentSchema.maximum || currentSchema.exclusiveMaximum
      )}"
      aria-valuemax=${ifDefined(
        currentSchema.maximum || currentSchema.exclusiveMaximum
      )}
      step="${ifDefined(currentSchema.multipleOf)}"
      ?required=${isRequired(context)}
      aria-required="${ifDefined(currentSchema.required)}"
      pattern=${ifDefined(currentSchema.pattern)}
      title="${ifDefined(currentSchema.description)}"
      aria-readonly="${ifDefined(currentSchema.readOnly)}"
      ?readonly=${currentSchema.readOnly === true}
      @change=${e => valueChangedHandler(e, context)}
    />
  `;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {Array<TemplateResult>}
 */
export function arrayTemplate(context) {
  const { currentUiSchema } = context;
  const currentSchema = getSchema(
    context.rootSchema,
    context.currentUiSchema.ref
  );
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
  return genericInput(context, "checkbox");
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
  const currentSchema = getSchema(
    context.rootSchema,
    context.currentUiSchema.ref
  );
  if (currentSchema.enum != null) {
    return enumTemplate(context);
  }
  return genericInput(context, "text");
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function enumTemplate(context) {
  const currentSchema = getSchema(
    context.rootSchema,
    context.currentUiSchema.ref
  );
  return html`
    <select value="${getValue(context.data, context.currentUiSchema.ref)}">
      ${currentSchema.enum.map(
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
