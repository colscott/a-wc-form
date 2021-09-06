export {};

// /**
//  * @template TControl
//  * @typedef {function(LayoutContext<TControl>):import('lit-html').TemplateResult|Array<import('lit-html').TemplateResult>} ComponentTemplate
//  */

/**
 * @typedef {object} HorizontalLayout
 * @property {'HorizontalLayout'} template
 * @property {object} properties
 * @property {Array<ComponentTemplate>} properties.components 
 * @property {string} [properties.label] 
 */

/**
 * @typedef {object} VerticalLayout
 * @property {'VerticalLayout'} template
 * @property {object} properties
 * @property {Array<ComponentTemplate>} properties.components 
 * @property {string} [properties.label] 
 */

/**
 * @typedef {object} ArrayLayout
 * @property {'ArrayLayout'} template
 * @property {object} properties
 * @property {ComponentTemplate} properties.component 
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {string} [properties.label] 
 */

/**
 * @typedef {object} GridLayout
 * @property {'GridLayout'} template
 * @property {object} properties
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {string} [properties.label] 
 * @property {Array<ComponentTemplate>} properties.components The JSON pointer on the child components should be relative to the GridLayout
 */

/**
 * @typedef {object} Label
 * @property {'Label'} template
 * @property {object} properties 
 * @property {string} properties.label 
 */

/**
 * @typedef {Object} ControlType Layout component that renders form controls based on data type
 * @property {'Control'} template
 *
 * @typedef {Object} ControlValidation
 * @property {number} [minLength] for text based controls
 * @property {number} [maxLength] for text based controls
 * @property {number} [min] for number based controls
 * @property {number} [max] for number based controls
 * @property {number} [step] for number based controls
 * @property {boolean} [required=false] whether the control value is required
 * @property {string} [pattern] regular expression to validate text input values against
 *
 * @typedef {Object} ControlProperties
 * @property {object} properties
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {"hidden"|"text"|"search"|"tel"|"url"|"email"|"password"|"datetime"|"date"|"month"|"week"|"time"|"datetime-local"|"number"|"range"|"color"|"checkbox"|"radio"|"file"|"submit"|"image"|"reset"|"button"} properties.type HTML5 input type
 * @property {string} [properties.label] to apply to the control as a standard label and aria
 * @property {string} [properties.description] more description for the user
 * @property {boolean} [properties.readOnly=false] whether the control is in a read only state
 * @property {Array<string|{label: string, value: string}>} [properties.possibleValues] to constrain the value to
 * @property {ControlValidation} [properties.validation]
 *
 * @typedef {ControlType & ControlProperties} Control
 */

/** @typedef {HorizontalLayout | VerticalLayout | GridLayout | Label | Control} ComponentTemplate */

// /**
//  * @typedef {Object} LayoutContext
//  * @property {Component} component currently being rendered
//  */

/**
 * @template TComponent
 * @typedef {Object} LayoutContext
 * @property {TComponent} component currently being rendered
 */
