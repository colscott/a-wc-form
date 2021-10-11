import { ValidationResult } from '../validation-result.js';

/** @type {import('../validator-registry').Validator} */
export const maxValidator = {
  controlSelector: '[max]',
  validate: (control, value, data) => {
    const max = control.getAttribute('max');
    const maxValue = typeof value === 'number' ? parseInt(max, 10) : max;
    return new ValidationResult('max', maxValue, value, value <= maxValue);
  },
};
