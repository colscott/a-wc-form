/** @typedef {import('./models.js').ComponentTemplate} ComponentTemplate */
/**
 * @template {import('./models').AbstractControl} [TControl=ComponentTemplate]
 * @typedef {import('./models.js').LayoutContext<TControl>} LayoutContext */
/** @typedef {import('lit').TemplateResult} TemplateResult */

/** @type {Map<string, (LayoutContext) => TemplateResult|Array<TemplateResult>>} */
const componentTemplates = new Map();

/**
 * @param {string} templateName key used to reference this componentTemplate
 * @returns {(LayoutContext) => TemplateResult|Array<TemplateResult>}
 */
export function getComponentTemplate(templateName) {
  return componentTemplates.get(templateName);
}

/**
 * @template {import('./models').AbstractControl} [TControl=ComponentTemplate]
 * @param {string} templateName key used to reference this componentTemplate
 * @param {(context: LayoutContext<TControl>) => TemplateResult|Array<TemplateResult>} componentTemplate used to render components of this type
 */
export function setComponentTemplate(templateName, componentTemplate) {
  componentTemplates.set(templateName, componentTemplate);
}

/** @param {string} templateName key of the component template to remove */
export function deleteComponentTemplate(templateName) {
  componentTemplates.delete(templateName);
}
