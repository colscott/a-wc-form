import { ValidationResult } from '../validation-result.js';

/** @type {import('../validator-registry').Validator} */
export const maxLengthValidator = {
  controlSelector: '[maxlength],[max-length]',
  validate: (control, value, data) => {
    const maxLengthValue = parseInt(
      control.hasAttribute('max-length') ? control.getAttribute('max-length') : control.getAttribute('maxlength'),
      10,
    );
    const valueLength = value.toString().length;
    const result = new ValidationResult('max-length', maxLengthValue, valueLength, valueLength <= maxLengthValue);
    return result;
  },
};
