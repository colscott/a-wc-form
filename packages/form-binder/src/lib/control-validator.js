/**
 * @typedef {Object} Validator
 * @property {string} controlSelector css selector associated with this control validator
 * @property {function(Element, any):boolean} checkValidity responsible for returning whether the control is valid
 * * @property {function(Element, any):boolean} reportValidity responsible for applying validation UI to the control and returning whether the control is valid
 */

/** @type {Array<Validator>} */
const validators = [];

/**
 * @param {Validator} validator
 * @param {boolean} [addToBeginning=false] to add the binder to the start of the binders, true to insert at the start.
 */
export function add(validator, addToBeginning) {
  if (addToBeginning === true) {
    validators.unshift(validator);
  } else {
    validators.push(validator);
  }
}

/** @param {Validator} validator to remove */
export function remove(validator) {
  const index = validators.findIndex(b => b === validator);
  if (index > -1) {
    validators.splice(index, 1);
  }
}

/**
 * @param {Element} control to find validators for
 * @returns {Array<Validator>} matching validators
 */
export function matchingValidators(control) {
  return validators.filter(v => control.matches(v.controlSelector));
}
