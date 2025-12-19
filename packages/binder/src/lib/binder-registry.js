import { ControlBinding } from './control-binding.js';

/** @typedef {Element} ControlElement */
/** @typedef {import('./validation-result').ValidationResult} ValidationResult */
/**
 * @typedef OnValueChangeCallbackOptions
 * @property {string} [ref] optional JSON Pointer that will be appended to the controllers JSON Pointer. This is useful if the control is responsible for many properties in the schema, like a grid.
 */
/**
 * @callback OnValueChangeCallback
 * @param {any} newValue new value to assign
 * @param {OnValueChangeCallbackOptions} [options]
 * @returns {void}
 */
/**
 * @callback OnTouchCallback
 * @returns {void}
 */

/**
 * @template {Element} [TElement=Element]
 * @template [TValue=unknown]
 * @typedef {Object} Binder
 * @property {string} controlSelector css selector associated with this value accessor
 * @property {function(TElement, OnValueChangeCallback, OnTouchCallback):void} initializeEvents should be used to bind component value change events to onChange. e.g. (control, binder) => control.addEventListener('input', () => binder.onChange())
 * @property {function(TElement, undefined|TValue):void} writeValue responsible for writing a value to the control e.g. (control, value) => control.value = value
 * @property {function(TElement, ValidationResult[]):void} [reportValidity] optional function to report validation results to the control e.g. (control, validationResult) => control.setCustomValidity(...)
 */

/** @type {Array<Binder>} */
const binders = [];

/**
 * Adds a Binder to the end of the registry.
 * It will be processed after all other binders.
 * To have the Binder be processed earlier use unshift(binder)
 * If the Binder is already in the registry it will be moved to the end
 * @param {Array<Binder>} binder */
export function add(...binder) {
  remove(...binder);
  binders.push(...binder);
}

/**
 * Use to insert binders at the start.
 * Use this to have a binder be evaluated first before other binders
 * If the Binder is already in the registry it will be moved to the start
 * @param {Array<Binder>} binder
 */
export function unshift(...binder) {
  remove(...binder);
  binders.unshift(...binder);
}

/**
 * NOTE even if a binder is removed, it will still be used for controls that have already initialized
 * @param {Array<Binder>} binder to remove
 */
export function remove(...binder) {
  binder.forEach((b) => {
    const index = binders.indexOf(b);
    if (index > -1) {
      binders.splice(index, 1);
    }
  });
}

/**
 * Looks for a matching binder for a given control. If a binder is found it is initialized with the control to create a binding.
 * @param {ControlElement} controlCandidate to find a binding for
 * @param {OnValueChangeCallback} onChange that will be called when the control value changes
 * @param {OnTouchCallback} onTouch that will be called when the control is touched
 * @returns {ControlBinding} if a binding is found then an initialized binding is returned. If no binding was found for the control then null is returned.
 */
export function initialize(controlCandidate, onChange, onTouch) {
  const binder = binders.find((b) => controlCandidate.matches(b.controlSelector));
  if (binder) {
    return new ControlBinding(binder, controlCandidate, onChange, onTouch);
  }
  return null;
}
