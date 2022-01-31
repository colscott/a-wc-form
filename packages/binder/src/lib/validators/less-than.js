import { ValidationResult } from '../validation-result.js';
import { getValue } from '../json-pointer.js';
import { convertYYYYMMDD, isIsoDate, isYyyyMmDd } from './greater-than.js';
import { add } from '../validator-registry.js';

/** @type {import('../validator-registry').Validator} */
export const lessThanValidator = {
  controlSelector: '[less-than]',
  validate: (control, value, data) => {
    const otherField = control.getAttribute('less-than');

    return new ValidationResult(
      'less-than',
      otherField,
      value,
      (() => {
        const otherValue = getValue(data, otherField);
        if (typeof value === 'number') {
          return value < otherValue;
        }
        if (isIsoDate(value) && isIsoDate(otherValue)) {
          return new Date(value) < new Date(otherValue);
        }
        if (isYyyyMmDd(value) && isYyyyMmDd(otherValue)) {
          return new Date(convertYYYYMMDD(value)) < new Date(convertYYYYMMDD(otherValue));
        }
        return false;
      })(),
    );
  },
};

add(lessThanValidator);
