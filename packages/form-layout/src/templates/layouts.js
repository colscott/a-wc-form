import { ifDefined } from "lit-html/directives/if-defined.js";
import { html } from "lit-html/lit-html.js";
import {
  getComponentTemplate,
  setComponentTemplate
} from "../lib/template-registry.js";
import "./array-layout.js";

/**
 * @template TComponent
 * @typedef {import('../lib/models.js').LayoutContext<TComponent>} LayoutContext
 */

/**
 * @param {LayoutContext<import("../lib/models.js").HorizontalLayout>} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function horizontalTemplate(context) {
  const { components } = context.component.properties;

  return html`
    <div style="display:flex ">
      ${context.component.properties?.label
        ? html`
            <span>${context.component.properties.label}</span>
          `
        : html``}
      ${components.map(component =>
        getComponentTemplate(component.template)({ component })
      )}
    </div>
  `;
}

/**
 * @param {LayoutContext<import("../lib/models.js").VerticalLayout>} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function verticalTemplate(context) {
  const { components } = context.component.properties;
  return html`
    <div aria-label=${ifDefined(context.component.properties?.label)}>
      ${context.component.properties?.label
        ? html`
            <span>${context.component.properties.label}</span>
          `
        : html``}
      ${components.map(component =>
        getComponentTemplate(component.template)({ component })
      )}
    </div>
  `;
}

setComponentTemplate("HorizontalLayout", horizontalTemplate);
setComponentTemplate("VerticalLayout", verticalTemplate);
