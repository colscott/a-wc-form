import { ValidationResult } from '../validation-result.js';
import { add } from '../validator-registry.js';

/** @type {import('../validator-registry').Validator} */
export const minLengthValidator = {
  controlSelector: '[minlength],[min-length]',
  validate: (control, value, data) => {
    const minLengthValue = parseInt(
      control.getAttribute('min-length') ? control.getAttribute('min-length') : control.getAttribute('minlength'),
      10,
    );
    const valueLength = value.toString().length;
    return new ValidationResult('min-length', minLengthValue, valueLength, valueLength >= minLengthValue);
  },
};

add(minLengthValidator);
