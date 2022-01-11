/** @typedef {import("./binder-registry").ControlElement} ControlElement */
/** @typedef {import("./binder-registry").Binder} Binder */

/**
 * @callback OnValueChangeCallback
 * @param {ControlElement} component
 * @param {any} newValue new value to assign
 * @param {import('./binder-registry').OnValueChangeCallbackOptions} [options]
 * @returns {void}
 */

/**
 * @callback OnTouchCallback
 * @param {ControlElement} component
 * @returns {void}
 */

/** */
export class ControlBinding {
  /** @returns {Binder} */
  get binder() {
    return this._binder;
  }

  /** @param {any} newValue */
  set value(newValue) {
    this.binder.writeValue(this.controlElement, newValue);
  }

  /**
   * @param {Binder} binder
   * @param {ControlElement} controlElement
   * @param {OnValueChangeCallback} onChange
   * @param {OnTouchCallback} onTouch
   */
  constructor(binder, controlElement, onChange, onTouch) {
    this._binder = binder;
    this.controlElement = controlElement;
    /** @type {OnValueChangeCallback} function that binds control value to the data */
    this.controlValueChanged = onChange;
    /** @type {OnTouchCallback} */
    this.controlTouched = onTouch;
    this.initialize(controlElement);
  }

  /** @param {ControlElement} controlElement */
  initialize(controlElement) {
    this.binder.initializeEvents(
      controlElement,
      (value, options) => this.onChange(value, options),
      () => this.onTouch(),
    );
  }

  /**
   * @param {any} newValue
   * @param {import('./binder-registry').OnValueChangeCallbackOptions} [options]
   */
  onChange(newValue, options) {
    this.controlValueChanged(this.controlElement, newValue, options);
  }

  /**  */
  onTouch() {
    this.controlTouched(this.controlElement);
  }
}
