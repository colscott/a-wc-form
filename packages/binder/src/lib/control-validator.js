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
 * @property {function(ValidationElement, any, any):ValidationResult} validate against a control returning an empty string for valid value and non-empty string for invalid value
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
 * @param {ValidationElement} control to find validators for
 * @returns {Array<Validator>} matching validators
 */
export function matchingValidators(control) {
  return validators.filter(v => control.matches(v.controlSelector));
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
    const filteredResult = validationControlResult.controlValidationResults.filter(
      controlValidationResult => predicate(controlValidationResult)
    );
    if (filteredResult.length) {
      result.push({
        control: validationControlResult.control,
        controlValidationResults: filteredResult,
        visited: validationControlResult.visited
      });
    }
  });

  return result;
}

/**
 * @template TValue
 * Validity object
 */
export class ValidationResult {
  /**
   * @param {string} name of the validator
   * @param {TValue} expected value
   * @param {TValue} actual value
   * @param {boolean} valid is valid or not
   */
  constructor(name, expected, actual, valid) {
    /** @type {string} */
    this.name = name;
    /** @type {TValue} */
    this.expected = expected;
    /** @type {TValue} */
    this.actual = actual;
    /** @type {boolean} */
    this.valid = valid;
    /** @type {string} */
    this.field = null;
  }
}
