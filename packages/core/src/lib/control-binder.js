/**
 * @typedef {Object} Binder
 * @property {string} controlSelector css selector associated with this value accessor
 * @property {function(Element, function(any):void):void} initializeEvents should be used to bind component value change events to onChange. e.g. (control, binder) => control.addEventListener('input', () => binder.onChange())
 * @property {function(Element, string):void} writeValue responsible for writing a value to the control e.g. (control, value) => control.value = value
 */

/** @type {Array<Binder>} */
const binders = [];

/** @param {Array<Binder>} binder */
export function add(...binder) {
  binders.push(...binder);
}

/** @param {Array<Binder>} binder to remove */
export function remove(...binder) {
  binder.forEach(b => {
    const index = binders.findIndex(bc => bc === b);
    if (index > -1) {
      binders.splice(index, 1);
    }
  });
}

/**
 * Looks for a matching binder for a given control. If a binder is found it is initialized with the control to create a binding.
 * @param {Element} controlCandidate to find a binding for
 * @param {function(Element & {name:string}, any):void} onChange that will be called when the control value changes
 * @returns {ControlBinding} if a binding is found then an initialized binding is returned. If no binding was found for the control then null is returned.
 */
export function initialize(controlCandidate, onChange) {
  const binder = binders.find(b => controlCandidate.matches(b.controlSelector));
  if (binder) {
    return new ControlBinding(binder, controlCandidate, onChange);
  }
  return null;
}

/** */
export class ControlBinding {
  /** @returns {Binder} */
  get binder() {
    return this._binder;
  }

  /** @returns {function(Element, any):void} function that binds control value to the data */
  get controlValueChanged() {
    return this._controlValueChanged;
  }

  /** @param {function(Element, any):void} callback function that binds control value to the data */
  set controlValueChanged(callback) {
    this._controlValueChanged = callback;
  }

  /** @param {any} newValue */
  set value(newValue) {
    this.binder.writeValue(this.controlElement, newValue);
  }

  /**
   * @param {Binder} binder
   * @param {Element} controlElement
   * @param {function(Element, any):void} onChange
   */
  constructor(binder, controlElement, onChange) {
    this._binder = binder;
    this.controlElement = controlElement;
    this.controlValueChanged = onChange;
    this.initialize(controlElement);
  }

  /** @param {Element} controlElement */
  initialize(controlElement) {
    this.binder.initializeEvents(controlElement, value => this.onChange(value));
  }

  /** @param {any} newValue */
  onChange(newValue) {
    this.controlValueChanged(this.controlElement, newValue);
  }
}
