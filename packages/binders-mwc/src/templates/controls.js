import { html } from 'lit-html/lit-html.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import '@material/mwc-checkbox/mwc-checkbox.js';
import '@material/mwc-formfield/mwc-formfield.js';
import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-select/mwc-select.js';
import '@material/mwc-list/mwc-list-item.js';
import { setComponentTemplate } from 'a-wc-form-layout/src/lib/template-registry.js';

/** @typedef {import("a-wc-form-layout/src/lib/models").Control} Control */
/** @typedef {import('a-wc-form-layout/src/lib/models').LayoutContext<Control>} ControlLayoutContext */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
function genericInput(context) {
  const { properties } = context.component;

  return html`
    <mwc-textfield
      type="${properties.type}"
      name="${properties.ref}"
      bind="${properties.ref}"
      minlength="${ifDefined(properties.validation?.minLength)}"
      maxlength="${ifDefined(properties.validation?.maxLength)}"
      min="${ifDefined(properties.validation?.min)}"
      max="${ifDefined(properties.validation?.max)}"
      step="${ifDefined(properties.validation?.step)}"
      pattern=${ifDefined(properties.validation?.pattern)}
      ?required=${!!properties.validation?.required}
      label=${ifDefined(properties.label)}
      title="${ifDefined(properties.description)}"
      ?readonly=${!!properties.readOnly}
    ></mwc-textfield>
  `;
}

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
export function checkboxTemplate(context) {
  const { properties } = context.component;
  return html`
    <mwc-formfield label=${ifDefined(properties.label)}>
      <mwc-checkbox
        name="${context.component.properties.ref}"
        bind="${context.component.properties.ref}"
      ></mwc-checkbox>
    </mwc-formfield>
  `;
}

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
export function enumTemplate(context) {
  const { properties } = context.component;
  return html`
    <mwc-select
      name="${context.component.properties.ref}"
      bind="${context.component.properties.ref}"
      label=${ifDefined(properties.label)}
      ?required=${!!properties.validation?.required}
    >
      ${!context.component.properties.validation?.required ? html` <mwc-list-item></mwc-list-item> ` : html``}
      ${context.component.properties.possibleValues.map(
        (e) => html` <mwc-list-item value="${e.toString()}">${e}</mwc-list-item> `,
      )}
    </mwc-select>
  `;
}

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult} matching the context passed in
 */
function controlTemplate(context) {
  if ('possibleValues' in context.component.properties && context.component.properties.possibleValues) {
    return enumTemplate(context);
  }
  if (context.component.properties.type === 'checkbox') {
    return checkboxTemplate(context);
  }
  return genericInput(context);
}

setComponentTemplate('Control', controlTemplate);
