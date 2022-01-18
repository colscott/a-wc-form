import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import '@material/mwc-checkbox/mwc-checkbox.js';
import '@material/mwc-formfield/mwc-formfield.js';
import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-select/mwc-select.js';
import '@material/mwc-list/mwc-list-item.js';
import { setComponentTemplate } from 'a-wc-form-layout/src/lib/template-registry.js';

/** @typedef {import("a-wc-form-layout/src/lib/models").Control} Control */
/** @typedef {import('a-wc-form-layout/src/lib/models').LayoutContext<Control>} ControlLayoutContext */
/** @typedef {import('lit').TemplateResult} TemplateResult */

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
function genericInput(context) {
  const { properties } = context.component;
  const { validation } = properties;

  return html`
    <mwc-textfield
      type="${properties.type}"
      name="${properties.ref}"
      bind="${properties.ref}"
      minlength="${ifDefined(validation && validation.minLength)}"
      maxlength="${ifDefined(validation && validation.maxLength)}"
      min="${ifDefined(validation && validation.min)}"
      max="${ifDefined(validation && validation.max)}"
      step="${ifDefined(validation && validation.step)}"
      pattern=${ifDefined(validation && validation.pattern)}
      ?required=${!!validation && validation.required}
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
      <mwc-checkbox name="${properties.ref}" bind="${properties.ref}"></mwc-checkbox>
    </mwc-formfield>
  `;
}

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
export function enumTemplate(context) {
  const { properties } = context.component;
  const { validation } = properties;
  return html`
    <mwc-select
      name="${properties.ref}"
      bind="${properties.ref}"
      label=${ifDefined(properties.label)}
      ?required=${!!validation && validation.required}
    >
      ${!(validation && validation.required) ? html`<mwc-list-item></mwc-list-item>` : html``}
      ${context.component.properties.possibleValues.map(
        (e) => html`<mwc-list-item value="${e.toString()}">${e}</mwc-list-item>`,
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
