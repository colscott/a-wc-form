/** @typedef {import("./binder-registry").ControlElement} ControlElement */
/** @typedef {import("./binder-registry").Binder} Binder */

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
      (value) => this.onChange(value),
      () => this.onTouch(),
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
