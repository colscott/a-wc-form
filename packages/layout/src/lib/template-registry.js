/** @typedef {import('./models.js').ComponentTemplate} ComponentTemplate */
/** @typedef {import('./models.js').LayoutContext<ComponentTemplate>} LayoutContext */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

/** @type {Map<string, (LayoutContext) => TemplateResult|Array<TemplateResult>>} */
const componentTemplates = new Map();

// TODO look to merge Control and Layout
// Controls can have sub templates base on data type

/**
 * @param {string} templateName key used to reference this componentTemplate
 * @returns {(LayoutContext) => TemplateResult|Array<TemplateResult>}
 */
export function getComponentTemplate(templateName) {
  return componentTemplates.get(templateName);
}

/**
 * @param {string} templateName key used to reference this componentTemplate
 * @param {(LayoutContext) => TemplateResult|Array<TemplateResult>} componentTemplate used to render components of this type
 */
export function setComponentTemplate(templateName, componentTemplate) {
  componentTemplates.set(templateName, componentTemplate);
}

/** @param {string} templateName key of the component template to remove */
export function deleteComponentTemplate(templateName) {
  componentTemplates.delete(templateName);
}
