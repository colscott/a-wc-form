import { ValidationResult } from '../validation-result.js';
import { add } from '../validator-registry.js';

/** @type {import('../validator-registry').Validator} */
export const requiredValidator = {
  controlSelector: '[required]',
  validate: (control, value, data) => {
    return new ValidationResult('required', true, value, !!value);
  },
};

add(requiredValidator);
