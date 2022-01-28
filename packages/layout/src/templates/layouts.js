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

  const style = `display: flex; align-items: center; gap: var(--form-pad, 16px); flex-wrap: wrap; flex-basis: 100%;`;

  return html`
    ${context.component.properties && context.component.properties.label
      ? html`
          <div class="horizontal-title">${context.component.properties.label}</div>
        `
      : html``}
    <div
      class="horizontal-layout"
      style="${style}"
      aria-label=${ifDefined(context.component.properties && context.component.properties.label)}
    >
      ${components.map(component => getComponentTemplate(component.template)({ component }))}
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
  const gap = `gap: var(--form-pad, 16px);`;
  const style = `display: grid; grid-template-columns: 1fr; ${gap}`;
  return html`
    ${properties && properties.label
      ? html`
          <div class="vertical-title">${properties.label}</div>
        `
      : html``}
    <div class="vertical-layout" style="${style}" aria-label=${ifDefined(properties && properties.label)}>
      ${components.map(component => getComponentTemplate(component.template)({ component }))}
    </div>
  `;
}

setComponentTemplate('VerticalLayout', verticalTemplate);

/**
 * @param {LayoutContext<import('a-wc-form-layout/src/lib/models').GridLayout>} context
 * @returns {import('lit').TemplateResult}
 */
function gridLayoutTemplate(context) {
  const { components, dense, flow, gap, label, columns } = context.component.properties || {};
  const gridAutoFlow = `grid-auto-flow: ${flow || 'row'} ${dense ? 'dense' : ''};`;
  const gridGap = `gap: var(--form-pad, ${gap || '16px'});`;
  const gridColumns = `grid-template-columns: repeat(var(--form-grid-layout-columns, ${columns || 12}), 1fr);`;
  const gridStyle = `display: grid; ${gridColumns} ${gridAutoFlow} ${gridGap}`;
  return html`
    ${label
      ? html`
          <div class="grid-layout-title">${label}</div>
        `
      : html``}
    <div class="grid-layout" style="${gridStyle}" aria-label=${ifDefined(label)}>
      ${components.map(component => {
        // eslint-disable-next-line no-shadow
        const { columns, rows, column, row } = component;
        const componentColumn =
          column || columns ? `grid-column: ${column || 'auto'}/${columns ? `span ${columns}` : 'auto'};` : '';
        const componentRow = row || rows ? `grid-row: ${row || 'auto'}/${rows ? `span ${rows}` : 'auto'};` : '';
        const componentStyle = `${componentColumn} ${componentRow}`;
        return html`
          <div style="${componentStyle}">
            ${getComponentTemplate(component.component.template)({ component: component.component })}
          </div>
        `;
      })}
    </div>
  `;
}

setComponentTemplate('GridLayout', gridLayoutTemplate);
