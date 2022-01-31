import { ValidationResult } from '../validation-result.js';
import { add } from '../validator-registry.js';

/** @type {import('../validator-registry').Validator} */
export const patternValidator = {
  controlSelector: '[pattern]',
  validate: (control, value, data) => {
    const patternValue = control.getAttribute('pattern');
    return new ValidationResult('pattern', patternValidator, value, new RegExp(patternValue).test(value));
  },
};

add(patternValidator);
