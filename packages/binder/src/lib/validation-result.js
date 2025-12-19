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
   * @param {string} [message] optional message describing the validation result
   */
  constructor(name, expected, actual, valid, message) {
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
    /** @type {string} */
    this.message = message;
  }
}
