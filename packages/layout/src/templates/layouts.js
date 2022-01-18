import { ifDefined } from 'lit/directives/if-defined.js';
import { html } from 'lit';
import { getComponentTemplate, setComponentTemplate } from '../lib/template-registry.js';
import './array-layout.js';

/**
 * @template TComponent
 * @typedef {import('a-wc-form-layout/src/lib/models').LayoutContext<TComponent>} LayoutContext
 */

/**
 * @param {LayoutContext<import('a-wc-form-layout/src/lib/models').HorizontalLayout>} context
 * @returns {import('lit').TemplateResult}
 */
function horizontalTemplate(context) {
  const { components } = context.component.properties;

  return html`
    ${context.component.properties && context.component.properties.label
      ? html` <div class="horizontal-title">${context.component.properties.label}</div> `
      : html``}
    <div
      class="horizontal-layout"
      aria-label=${ifDefined(context.component.properties && context.component.properties.label)}
    >
      ${components.map((component) => getComponentTemplate(component.template)({ component }))}
    </div>
  `;
}

setComponentTemplate('HorizontalLayout', horizontalTemplate);

/**
 * @param {LayoutContext<import('a-wc-form-layout/src/lib/models').VerticalLayout>} context
 * @returns {import('lit').TemplateResult}
 */
function verticalTemplate(context) {
  const { properties } = context.component;
  const { components } = properties;
  return html`
    ${properties && properties.label ? html` <div class="vertical-title">${properties.label}</div> ` : html``}
    <div class="vertical-layout" aria-label=${ifDefined(properties && properties.label)}>
      ${components.map((component) => getComponentTemplate(component.template)({ component }))}
    </div>
  `;
}

setComponentTemplate('VerticalLayout', verticalTemplate);
