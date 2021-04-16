import { html } from "lit-html/lit-html.js";
import { ifDefined } from "lit-html/directives/if-defined.js";
import "@material/mwc-checkbox/mwc-checkbox.js";
import "@material/mwc-textfield/mwc-textfield.js";
import "@material/mwc-select/mwc-select.js";
import "@material/mwc-list/mwc-list-item.js";
import {
  getValue,
  getSchema
} from "a-wc-form-binder/src/lib/json-schema-data-binder.js";
import { controlTemplates } from "a-wc-form-binder/src/lib/template-registry.js";
import {
  isRequired,
  valueChangedHandler
} from "a-wc-form-binder/src/templates/controls.js";
import { notImplementedTemplate } from "./misc.js";

/** @typedef {import('a-wc-form-binder/src/lib/json-ui-schema-models.js').JsonUiSchemeControlContext} JsonUiSchemeControlContext */
/** @typedef {import('../lib/json-ui-schema-models.js').JsonSchema} JsonSchema */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * @param {JsonUiSchemeControlContext} context
 * @param {"number" | "text" | "search" | "tel" | "url" | "email" | "password" | "date" | "month" | "week" | "time" | "datetime-local" | "color"} type HTML5 input type
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function genericInput(context, type) {
  const currentSchema = getSchema(
    context.rootSchema,
    context.currentUiSchema.ref
  );

  return html`
    <mwc-textfield
      type="${type}"
      name="${context.currentUiSchema.ref}"
      value="${getValue(context.data, context.currentUiSchema.ref)}"
      minlength="${ifDefined(currentSchema.minLength)}"
      maxlength="${ifDefined(currentSchema.maxLength)}"
      min="${ifDefined(
        currentSchema.minimum || currentSchema.exclusiveMinimum
      )}"
      max="${ifDefined(
        currentSchema.maximum || currentSchema.exclusiveMaximum
      )}"
      step="${ifDefined(currentSchema.multipleOf)}"
      ?required=${isRequired(context)}
      pattern=${ifDefined(currentSchema.pattern)}
      label=${ifDefined(currentSchema.title)}
      ?readonly=${currentSchema.readOnly === true}
      @change=${e => valueChangedHandler(e, context)}
    ></mwc-textfield>
  `;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function booleanTemplate(context) {
  return html`
    <mwc-checkbox
      ?checked=${getValue(context.data, context.currentUiSchema.ref) === true}
      ?disabled=${isRequired(context)}
      @change=${e => valueChangedHandler(e, context)}
    ></mwc-checkbox>
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
    <mwc-select>
      ${isRequired(context)
        ? html`
            <mwc-list-item></mwc-list-item>
          `
        : html``}
      ${currentSchema.enum.map(
        e =>
          html`
            <mwc-list-item value="${e.toString()}">${e}</mwc-list-item>
          `
      )}
    </mwc-select>
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

// controlTemplates.set("array", arrayTemplate);
controlTemplates.set("boolean", booleanTemplate);
controlTemplates.set("integer", integerTemplate);
controlTemplates.set("null", notImplementedTemplate);
controlTemplates.set("number", numberTemplate);
controlTemplates.set("string", stringTemplate);
controlTemplates.set("date", dateTemplate);
controlTemplates.set("date-time", dateTimeTemplate);
controlTemplates.set("time", timeTemplate);
controlTemplates.set("email", emailTemplate);
