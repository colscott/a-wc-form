// @ts-check
import { html } from "lit-html/lit-html.js";
import { ifDefined } from "lit-html/directives/if-defined.js";
import {
  controlTemplates,
  getLayoutTemplate
} from "../lib/template-registry.js";
import { getValue } from "../lib/json-schema-data-exchange.js";
import { horizontalTemplate } from "./layouts.js";
import { notImplementedTemplate } from "./misc.js";
import { getUiSchema } from "../lib/schema-generator.js";

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
  const { scope } = context.currentUiSchema;
  const innerProperties = scope.substr(0, scope.lastIndexOf("/properties"));
  /** @type {JSONSchema} */
  const schema = getValue(context.rootSchema, innerProperties);
  const property = scope.substr(scope.lastIndexOf("/") + 1);
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
      name="${context.currentUiSchema.scope}"
      value="${getValue(context.data, context.currentUiSchema.scope)}"
      minlength="${ifDefined(context.currentSchema.minLength)}"
      maxlength="${ifDefined(context.currentSchema.maxLength)}"
      title="${ifDefined(context.currentSchema.description)}"
      ?required=${isRequired(context)}
      @change=${e => valueChangedHandler(e, context)}
    />
  `;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function arrayTemplate(context) {
  const { currentSchema, currentUiSchema } = context;
  const { minItems, maxItems, uniqueItems, items } = currentSchema;

  if (typeof items === "boolean") {
    return null;
  }

  /** @type {import("json-schema").JSONSchema7[]} */
  // @ts-ignore
  const itemSchemaArray = items instanceof Array ? items : [items];

  let uiSchema = null;
  if (itemSchemaArray.length) {
    uiSchema = getUiSchema(
      itemSchemaArray[0],
      `${currentUiSchema.scope}/items`
    );
  }

  const itemDataArray = getValue(context.data, currentUiSchema.scope);

  return html`
    <table>
      <thead>
        ${html`
          <th></th>
        `}
      </thead>
      <tbody>
        ${itemDataArray.map(
          dataItem => html`
            <tr>
              ${itemSchemaArray.map(
                (schemaItem, i) => html`
                  <td>
                    ${getLayoutTemplate({
                      currentData: dataItem,
                      currentSchema: schemaItem,
                      currentUiSchema: getUiSchema(
                        itemSchemaArray[0],
                        `${currentUiSchema.scope}/items/${i}`
                      ),
                      data: context.data,
                      rootSchema: context.rootSchema,
                      rootUiSchema: context.rootUiSchema
                    })}
                  </td>
                `
              )}
            </tr>
          `
        )}
        ${itemSchemaArray.map(
          item => html`
            <tr>
              <td>
                ${horizontalTemplate({
                  currentData: {},
                  currentSchema: item,
                  currentUiSchema: uiSchema,
                  data: context.data,
                  rootSchema: context.rootSchema,
                  rootUiSchema: context.rootUiSchema
                })}
              </td>
            </tr>
          `
        )}
      </tbody>
    </table>
  `;
}

/**
 * @param {JsonUiSchemeControlContext} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
export function booleanTemplate(context) {
  return html`
    <input
      type="checkbox"
      ?checked=${getValue(context.currentData, context.currentUiSchema.scope)}
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
    <select
      value="${getValue(context.currentData, context.currentUiSchema.scope)}"
    >
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
