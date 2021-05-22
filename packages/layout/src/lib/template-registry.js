/** @typedef {import('./models.js').Component} Component */
/** @typedef {import('./models.js').LayoutContext<Component>} LayoutContext */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

/** @type {Map<string, (LayoutContext) => TemplateResult|Array<TemplateResult>>} */
const componentTemplates = new Map();

// TODO look to merge Control and Layout
// Controls can have sub templates base on data type

/**
 * @param {string} template key used to reference this componentTemplate
 * @returns {(LayoutContext) => TemplateResult|Array<TemplateResult>}
 */
export function getComponentTemplate(template) {
  return componentTemplates.get(template);
}

/**
 * @param {string} template key used to reference this componentTemplate
 * @param {(LayoutContext) => TemplateResult|Array<TemplateResult>} componentTemplate used to render components of this type
 */
export function setComponentTemplate(template, componentTemplate) {
  componentTemplates.set(template, componentTemplate);
}

/** @param {string} template key of the component template to remove */
export function deleteComponentTemplate(template) {
  componentTemplates.delete(template);
}
