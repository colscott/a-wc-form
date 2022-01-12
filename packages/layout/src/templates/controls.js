import { html } from 'lit-html/lit-html.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { setComponentTemplate } from '../lib/template-registry.js';

/** @typedef {import("../lib/models.js").Control} Control */
/** @typedef {import('../lib/models.js').LayoutContext<Control>} ControlLayoutContext */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
function label(context) {
  const { properties } = context.component;
  return html`
    ${context.component.template && properties.label
      ? html` <label for=${properties.ref} title=${ifDefined(properties.description)}>${properties.label}</label> `
      : html``}
  `;
}

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
function genericInput(context) {
  const { properties } = context.component;
  const { validation } = properties;
  return html`
    ${label(context)}<input
      type="${properties.type}"
      name="${properties.ref}"
      bind="${properties.ref}"
      aria-label=${ifDefined(properties.label)}
      aria-description=${ifDefined(properties.description)}
      minlength="${ifDefined(validation && validation.minLength)}"
      maxlength="${ifDefined(validation && validation.maxLength)}"
      min="${ifDefined(validation && validation.min)}"
      aria-valuemin=${ifDefined(validation && validation.min)}
      max="${ifDefined(validation && validation.max)}"
      aria-valuemax=${ifDefined(validation && validation.max)}
      step="${ifDefined(validation && validation.step)}"
      ?required=${!!validation && validation.required}
      aria-required="${!!validation && validation.required}"
      pattern=${ifDefined(validation && validation.pattern)}
      title="${ifDefined(properties.description)}"
      aria-readonly="${ifDefined(properties.readOnly)}"
      ?readonly=${!!properties.readOnly}
    />
  `;
}

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
function enumTemplate(context) {
  return html`
    ${label(context)}<select name="${context.component.properties.ref}" bind="${context.component.properties.ref}">
      ${context.component.properties.possibleValues.map(
        (e) =>
          html`
            <option value="${typeof e === 'string' ? e : e.value}">${typeof e === 'string' ? e : e.label}</option>
          `,
      )}
    </select>
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
  return genericInput(context);
}

setComponentTemplate('Control', controlTemplate);
