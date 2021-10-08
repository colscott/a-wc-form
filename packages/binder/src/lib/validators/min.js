import { ValidationResult } from '../validation-result.js';

/** @type {import('../validator-registry').Validator} */
export const minValidator = {
  controlSelector: '[min]',
  validate: (control, value, data) => {
    const minValue = parseInt(control.getAttribute('min'), 10);
    return new ValidationResult('min', minValue, value, value >= minValue);
  },
};
