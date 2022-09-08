/** @typedef {import('./validation-result').ValidationResult} ValidationResult */
/** @typedef {Element} ValidationElement */
/** @typedef {Array<ValidationResult>} ValidationResults */
/**
 * @typedef {Object} ValidationControlResult
 * @property {ValidationElement} control
 * @property {ValidationResults} controlValidationResults
 * @property {boolean} visited
 */
/**
 * @typedef {Object} FormValidationResult
 * @property {Array<ValidationControlResult>} result
 * @property {Array<ValidationControlResult>} errors
 * @property {boolean} isValid
 */
/**
 * @typedef {Object} Validator
 * @property {string} controlSelector css selector associated with this control validator
 * @property {function(ValidationElement, any, any):ValidationResult|Promise<ValidationResult>} validate against a control returning an empty string for valid value and non-empty string for invalid value
 */

/** @type {Array<Validator>} */
const validatorRegistry = [];

/**
 * @param {Validator|Array<Validator>} validator
 * @param {boolean} [addToBeginning=false] to add the binder to the start of the binders, true to insert at the start.
 */
export function add(validator, addToBeginning) {
  const validators = validator instanceof Array ? validator : [validator];
  if (addToBeginning === true) {
    validatorRegistry.unshift(...validators);
  } else {
    validatorRegistry.push(...validators);
  }
}

/** @param {Validator|Array<Validator>} validator to remove */
export function remove(validator) {
  const validators = validator instanceof Array ? validator : [validator];
  validators.forEach(_validator => {
    const index = validatorRegistry.findIndex(b => b === _validator);
    if (index > -1) {
      validatorRegistry.splice(index, 1);
    }
  });
}

/**
 * Removes all registered validators from the registry. Use this if you want to replace the existing validators.
 */
export function clear() {
  validatorRegistry.length = 0;
}

/**
 * @param {ValidationElement} control to find validators for
 * @returns {Array<Validator>} matching validators
 */
export function matchingValidators(control) {
  return validatorRegistry.filter(v => control.matches(v.controlSelector));
}

/**
 * @param {Array<ValidationControlResult>} validationResult all validation results
 * @param {function(ValidationResult):boolean} predicate to filter by
 * @returns {Array<ValidationControlResult>} input filtered so that only invalid results remain
 */
export function filterValidationResults(validationResult, predicate) {
  /** @type {Array<ValidationControlResult>} */
  const result = [];
  validationResult.forEach(validationControlResult => {
    const filteredResult = validationControlResult.controlValidationResults.filter(controlValidationResult =>
      predicate(controlValidationResult),
    );
    if (filteredResult.length) {
      result.push({
        control: validationControlResult.control,
        controlValidationResults: filteredResult,
        visited: validationControlResult.visited,
      });
    }
  });

  return result;
}
