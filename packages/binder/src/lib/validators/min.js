import { ValidationResult } from '../validation-result.js';

/** @type {import('../validator-registry').Validator} */
export const minValidator = {
  controlSelector: '[min]',
  validate: (control, value, data) => {
    const min = control.getAttribute('min');
    const minValue = typeof value === 'number' ? parseInt(min, 10) : min;
    return new ValidationResult('min', minValue, value, value >= minValue);
  },
};
