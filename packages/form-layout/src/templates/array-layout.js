import { render, html } from "lit-html";
import { controlBinder } from "a-wc-form-binder";
import {
  getComponentTemplate,
  setComponentTemplate
} from "../lib/template-registry.js";

const gridBinder = {
  controlSelector: "[form-layout-grid]",
  initializeEvents: () => {},
  writeValue: (arrayElem, data) => {
    /** @type {import("../lib/models.js").LayoutContext<import("../lib/models.js").GridLayout>} */
    const gridLayoutContext = arrayElem.context;
    const { components, ref } = gridLayoutContext.component.properties;
    render(
      html`
        ${components.map(
          c =>
            html`
              <span
                >${("label" in c.properties && c.properties.label) || ""}</span
              >
            `
        )}
        ${data.map((item, i) => {
          return components.map(c => {
            /** @type {import("../lib/models.js").Component & {properties: {ref: string, label: string}}} context */
            const component = JSON.parse(JSON.stringify(c));
            component.properties.label = "";
            component.properties.ref = `${ref}/${i}/${component.properties.ref}`;
            const context = {
              component
            };
            return getComponentTemplate(component.template)(context);
          });
        })}
      `,
      arrayElem
    );
  }
};

controlBinder.add(gridBinder);

/**
 * @param {import("./layouts.js").LayoutContext<import("../lib/models.js").GridLayout>} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function gridTemplate(context) {
  return html`
    <div
      form-layout-grid
      name=${context.component.properties.ref}
      .context=${context}
      style="display: grid; grid-template-columns: repeat(${context.component
        .properties.components.length}, max-content)"
    ></div>
  `;
}

setComponentTemplate("GridLayout", gridTemplate);

const arrayBinder = {
  controlSelector: "[form-layout-array]",
  initializeEvents: () => {},
  writeValue: (arrayElem, data) => {
    render(
      html`
        ${data.map((item, i) => {
          // @ts-ignore
          const arrayContext = arrayElem.context;
          /** @type {import("../lib/models.js").Component & {properties: {ref: string}}} context */
          const component = JSON.parse(
            JSON.stringify(arrayContext.component.properties.component)
          );
          component.properties.ref = `${arrayContext.component.properties.ref}/${i}`;
          return getComponentTemplate(component.template)({
            component
          });
        })}
      `,
      arrayElem
    );
  }
};

controlBinder.add(arrayBinder);

/**
 * @param {import("./layouts.js").LayoutContext<import("../lib/models.js").ArrayLayout>} context
 * @returns {import('lit-html/lit-html').TemplateResult}
 */
function arrayTemplate(context) {
  return html`
    <div
      form-layout-array
      name=${context.component.properties.ref}
      .context=${context}
    ></div>
  `;
}

setComponentTemplate("ArrayLayout", arrayTemplate);
