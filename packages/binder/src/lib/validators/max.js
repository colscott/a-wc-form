import { ValidationResult } from '../validation-result.js';

/** @type {import('../validator-registry').Validator} */
export const maxValidator = {
  controlSelector: '[max]',
  validate: (control, value, data) => {
    const maxValue = parseInt(control.getAttribute('max'), 10);
    return new ValidationResult('max', maxValue, value, typeof value === 'number' && value <= maxValue);
  },
};
