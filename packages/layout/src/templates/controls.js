import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { setComponentTemplate } from '../lib/template-registry.js';

/** @typedef {import("../lib/models.js").Control} Control */
/** @typedef {import('../lib/models.js').LayoutContext<Control>} ControlLayoutContext */
/** @typedef {import("../lib/models.js").Textarea} Textarea */
/** @typedef {import('../lib/models.js').LayoutContext<Textarea>} TextareaLayoutContext */
/** @typedef {import("../lib/models.js").ArrayComponent} ArrayComponent */
/** @typedef {import('../lib/models.js').LayoutContext<ArrayComponent>} ArrayComponentLayoutContext */
/** @typedef {import('lit').TemplateResult} TemplateResult */

/**
 * @param {ControlLayoutContext|TextareaLayoutContext|ArrayComponentLayoutContext} context
 * @returns {TemplateResult}
 */
function label(context) {
  const { properties } = context.component;
  return html`
    ${context.component.template && properties.label
      ? html`
          <label style="display: block;" for=${properties.ref} title=${ifDefined(properties.description)}
            >${properties.label}</label
          >
        `
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
    <span>
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
    </span>
  `;
}

/**
 * @param {ControlLayoutContext} context
 * @returns {TemplateResult}
 */
function enumTemplate(context) {
  return html`
    <span>
      ${label(context)}<select name="${context.component.properties.ref}" bind="${context.component.properties.ref}">
        ${context.component.properties.possibleValues.map(
          e =>
            html`
              <option value="${typeof e === 'string' ? e : e.value}">${typeof e === 'string' ? e : e.label}</option>
            `,
        )}
      </select>
    </span>
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

/**
 * @param {TextareaLayoutContext} context
 * @returns {TemplateResult} matching the context passed in
 */
function textarea(context) {
  const { properties } = context.component;
  const { validation } = properties;
  return html`
    <span
      >${label(context)}<textarea
        name="${properties.ref}"
        bind="${properties.ref}"
        aria-label=${ifDefined(properties.label)}
        aria-description=${ifDefined(properties.description)}
        rows="${ifDefined(properties.rows)}"
        cols="${ifDefined(properties.cols)}"
        minlength="${ifDefined(validation && validation.minLength)}"
        maxlength="${ifDefined(validation && validation.maxLength)}"
        ?required=${!!validation && validation.required}
        aria-required="${!!validation && validation.required}"
        aria-readonly="${ifDefined(properties.readOnly)}"
        ?readonly=${!!properties.readOnly}
      ></textarea
    ></span>
  `;
}

setComponentTemplate('Textarea', textarea);

/**
 * @param {ArrayComponentLayoutContext} context
 * @returns {TemplateResult} matching the context passed in
 */
function arrayTemplate(context) {
  const { properties } = context.component;
  const { validation } = properties;
  return html`
    <span
      >${label(context)}<select
        name="${context.component.properties.ref}"
        bind="${context.component.properties.ref}"
        ?required=${!!validation && validation.required}
        multiple
      >
        ${context.component.properties.possibleValues.map(
          e =>
            html`
              <option value="${typeof e === 'string' ? e : e.value}">${typeof e === 'string' ? e : e.label}</option>
            `,
        )}
      </select></span
    >
  `;
}

setComponentTemplate('ArrayControl', arrayTemplate);
