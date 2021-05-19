import { ifDefined } from "lit-html/directives/if-defined.js";
import { html } from "lit-html/lit-html.js";
import {
  getComponentTemplate,
  setComponentTemplate
} from "a-wc-form-layout/src/index.js";
import "./array-layout.js";

/**
 * @template TComponent
 * @typedef {import('a-wc-form-layout/src/lib/models').LayoutContext<TComponent>} LayoutContext
 */

/**
 * @param {LayoutContext<import('a-wc-form-layout/src/lib/models').HorizontalLayout>} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function horizontalTemplate(context) {
  const { components } = context.component.properties;

  return html`
    ${context.component.properties?.label
      ? html`
          <div class="horizontal-title">
            ${context.component.properties.label}
          </div>
        `
      : html``}
    <div
      class="horizontal-layout"
      aria-label=${ifDefined(context.component.properties?.label)}
    >
      ${components.map(component =>
        getComponentTemplate(component.template)({ component })
      )}
    </div>
  `;
}

setComponentTemplate("HorizontalLayout", horizontalTemplate);

/**
 * @param {LayoutContext<import('a-wc-form-layout/src/lib/models').VerticalLayout>} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function verticalTemplate(context) {
  const { components } = context.component.properties;
  return html`
    ${context.component.properties?.label
      ? html`
          <div class="vertical-title">
            ${context.component.properties.label}
          </div>
        `
      : html``}
    <div
      class="vertical-layout"
      aria-label=${ifDefined(context.component.properties?.label)}
    >
      ${components.map(component =>
        getComponentTemplate(component.template)({ component })
      )}
    </div>
  `;
}

setComponentTemplate("VerticalLayout", verticalTemplate);
