/** @typedef {Element} ControlElement */
/**
 * @typedef {Object} Binder
 * @property {string} controlSelector css selector associated with this value accessor
 * @property {function(Element, function(any):void, function():void):void} initializeEvents should be used to bind component value change events to onChange. e.g. (control, binder) => control.addEventListener('input', () => binder.onChange())
 * @property {function(Element, string):void} writeValue responsible for writing a value to the control e.g. (control, value) => control.value = value
 */

/** @type {Array<Binder>} */
const binders = [];

/** @param {Array<Binder>} binder */
export function add(...binder) {
  binders.push(...binder);
}

/**
 * NOTE even if a binder is removed, it will still be used for controls that have already initialized
 * @param {Array<Binder>} binder to remove
 */
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
 * @param {ControlElement} controlCandidate to find a binding for
 * @param {function(ControlElement, any):void} onChange that will be called when the control value changes
 * @param {function(ControlElement):void} onTouch that will be called when the control value changes
 * @returns {ControlBinding} if a binding is found then an initialized binding is returned. If no binding was found for the control then null is returned.
 */
export function initialize(controlCandidate, onChange, onTouch) {
  const binder = binders.find(b => controlCandidate.matches(b.controlSelector));
  if (binder) {
    return new ControlBinding(binder, controlCandidate, onChange, onTouch);
  }
  return null;
}

/** */
export class ControlBinding {
  /** @returns {Binder} */
  get binder() {
    return this._binder;
  }

  /** @returns {function(ControlElement, any):void} function that binds control value to the data */
  get controlValueChanged() {
    return this._controlValueChanged;
  }

  /** @param {function(ControlElement, any):void} callback function that binds control value to the data */
  set controlValueChanged(callback) {
    this._controlValueChanged = callback;
  }

  /** @param {any} newValue */
  set value(newValue) {
    this.binder.writeValue(this.controlElement, newValue);
  }

  /**
   * @param {Binder} binder
   * @param {ControlElement} controlElement
   * @param {function(ControlElement, any):void} onChange
   * @param {function(ControlElement):void} onTouch
   */
  constructor(binder, controlElement, onChange, onTouch) {
    this._binder = binder;
    this.controlElement = controlElement;
    /** @type {function(ControlElement, any):void} function that binds control value to the data */
    this.controlValueChanged = onChange;
    /** @type {function(ControlElement, any):void} function that binds control value to the data */
    this.controlTouched = onTouch;
    this.initialize(controlElement);
  }

  /** @param {ControlElement} controlElement */
  initialize(controlElement) {
    this.binder.initializeEvents(
      controlElement,
      value => this.onChange(value),
      () => this.onTouch()
    );
  }

  /** @param {any} newValue */
  onChange(newValue) {
    this.controlValueChanged(this.controlElement, newValue);
  }

  /**  */
  onTouch() {
    this.controlTouched(this.controlElement);
  }
}
