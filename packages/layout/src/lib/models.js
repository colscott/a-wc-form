export {};

// /**
//  * @template TControl
//  * @typedef {function(LayoutContext<TControl>):import('lit').TemplateResult|Array<import('lit').TemplateResult>} ComponentTemplate
//  */

/** @typedef {Array<string|{label: string, value: string}>} PossibleValues */

// ---------- LAYOUTS ----------

/**
 * @typedef {object} HorizontalLayout
 * @property {'HorizontalLayout'} template
 * @property {object} properties
 * @property {Array<ComponentTemplate>} properties.components child Components (Controls or Layouts) that are in this layout
 * @property {string} [properties.label]
 */

/**
 * @typedef {object} VerticalLayout
 * @property {'VerticalLayout'} template
 * @property {object} properties
 * @property {Array<ComponentTemplate>} properties.components child Components (Controls or Layouts) that are in this layout
 * @property {string} [properties.label]
 */

/**
 * @typedef {object} ArrayLayout
 * @property {'ArrayLayout'} template
 * @property {object} properties
 * @property {ComponentTemplate} properties.component child Components (Controls or Layouts) that are in this layout
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {string} [properties.label]
 */

/**
 * @typedef {object} GridLayoutComponent Describes a component that goes into a GridLayout
 * @property {ComponentTemplate} component Component to show in this position in the grid
 * @property {number} [row] the row index to insert this component in the grid. Will default to the next available grid cell.
 * @property {number} [column] the column index to insert this component in the grid. Will default to the next available grid cell.
 * @property {number} [rows=1] the number of rows this component should span in the grid
 * @property {number} [columns=1] the number of columns this component should span in the grid
 */

/**
 * @typedef {object} GridLayout A Grid form layout with rows and columns
 * @property {'GridLayout'} template
 * @property {object} properties
 * @property {string} [properties.label]
 * @property {string} [properties.gap] spacing between the components in the grid. Should be a valid CSS unit. Defaults to 16px. This can be overridden with the CSS variable --form-pad.
 * @property {number} [properties.columns=12] number of columns in the grid. Defaults to a 12 column grid. This can be overridden with the CSS variable --form-grid-layout-columns.
 * @property {boolean} [properties.dense=false] set to true to try and fill in every cell in the grid where possible
 * @property {'row'|'column'} [properties.flow='row'] the direction the grid will render the component
 * @property {Array<GridLayoutComponent>} properties.components The JSON pointer on the child components should be relative to the GridLayout
 */

// ---------- COMPONENTS ----------

/**
 * @typedef {object} GridComponent a data grid component. For example, could be implemented with HTML TABLE, or AG Grid, etc.
 * @property {'GridComponent'} template
 * @property {object} properties
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {string} [properties.label]
 * @property {Array<ComponentTemplate>} properties.components The JSON pointer on the child components should be relative to the GridComponent
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
 * @property {number} [step] for number based controls. Can be used for number of decimal places or precision. Default is 1 (integer)
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
 * @property {PossibleValues} [properties.possibleValues] to constrain the value to
 * @property {ControlValidation} [properties.validation]
 *
 * @typedef {ControlType & ControlProperties} Control
 */

/**
 * @typedef {Object} TextareaType
 * @property {'Textarea'} template
 *
 * @typedef {Object} TextareaValidation
 * @property {number} [minLength] the minimum number of characters required that the user should enter.
 * @property {number} [maxLength] the maximum number of characters that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters.
 * @property {boolean} [required=false] whether the control value is required
 *
 * @typedef {Object} TextareaProperties
 * @property {Object} properties
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {string} [properties.label] to apply to the control as a standard label and aria
 * @property {string} [properties.description] more description for the user
 * @property {number} [properties.cols] the visible width of the text control, in average character widths.
 * @property {number} [properties.rows] the number of visible text lines for the control.
 * @property {boolean} [properties.readOnly=false] whether the control is in a read only state
 * @property {TextareaValidation} [properties.validation]
 *
 * @typedef {TextareaType & TextareaProperties} Textarea
 */

/**
 * @typedef {Object} ArrayType
 * @property {'ArrayControl'} template
 *
 * @typedef {Object} ArrayValidation
 * @property {boolean} [required=false] whether the control value is required
 *
 * @typedef {Object} ArrayProperties
 * @property {Object} properties
 * @property {string} properties.ref JSON pointer to the data value that will back this control
 * @property {string} [properties.label] to apply to the control as a standard label and aria
 * @property {string} [properties.description] more description for the user
 * @property {boolean} [properties.readOnly=false] whether the control is in a read only state
 * @property {PossibleValues} [properties.possibleValues] to constrain the value to
 * @property {ArrayValidation} [properties.validation]
 *
 * @typedef {ArrayType & ArrayProperties} ArrayComponent Can be thought of as a multi-select
 */

/** @typedef {HorizontalLayout | VerticalLayout | GridComponent | Label | Control | Textarea | ArrayComponent | GridLayout | ArrayLayout} ComponentTemplate */

// /**
//  * @typedef {Object} LayoutContext
//  * @property {Component} component currently being rendered
//  */

/**
 * @template TComponent
 * @typedef {Object} LayoutContext
 * @property {TComponent} component currently being rendered
 */
