import { getValue } from '../json-pointer.js';
import { ValidationResult } from '../validation-result.js';
import { add } from '../validator-registry.js';

/**
 * @param {string} yyyymmdd to convert to yyyy-mm-dd
 * @returns {string} input as yyyy-mm-dd
 */
export const convertYYYYMMDD = yyyymmdd =>
  `${yyyymmdd.substring(0, 4)}-${yyyymmdd.substring(4, 6)}-${yyyymmdd.substring(6, 8)}`;

/**
 * @param {string} string to test is date
 * @returns {boolean} if string is date like
 */
export const isIsoDate = string => /\d{4}-\d{2}-\d{2}.*/.test(string) && isNaN(Date.parse(string)) === false;

/**
 * @param {string} string to test is date
 * @returns {boolean} if string is date like
 */
export const isYyyyMmDd = string => /\d{8}/.test(string) && isNaN(Date.parse(convertYYYYMMDD(string))) === false;

/** @type {import('../validator-registry').Validator} */
export const greaterThanValidator = {
  controlSelector: '[greater-than]',
  validate: (control, value, data) => {
    const otherField = control.getAttribute('greater-than');

    return new ValidationResult(
      'greater-than',
      otherField,
      value,
      (() => {
        const otherValue = getValue(data, otherField);
        if (typeof value === 'number') {
          return value > otherValue;
        }
        if (isIsoDate(value) && isIsoDate(otherValue)) {
          return new Date(value) > new Date(otherValue);
        }
        if (isYyyyMmDd(value) && isYyyyMmDd(otherValue)) {
          return new Date(convertYYYYMMDD(value)) > new Date(convertYYYYMMDD(otherValue));
        }
        return false;
      })(),
    );
  },
};

add(greaterThanValidator);
