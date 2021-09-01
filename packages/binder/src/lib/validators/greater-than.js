import { getValue } from "../json-pointer.js";
import * as controlValidator from "../control-validator.js";

/**
 * @param {string} string to test is date
 * @returns {boolean} f string is date like
 */
const isIsoDate = string =>
  /\d{4}-\d{2}-\d{2}.*/.test(string) && isNaN(Date.parse(string)) === false;

/** @type {import('../control-validator').Validator} */
export const greaterThanValidator = {
  controlSelector: "[greater-than]",
  validate: (control, value, data) => {
    const otherField = control.getAttribute("greater-than");

    return new controlValidator.ValidationResult(
      "greater-than",
      otherField,
      value,
      (() => {
        const otherValue = getValue(data, otherField);
        if (typeof value === "number") {
          return value > otherValue;
        }
        if (isIsoDate(value) && isIsoDate(otherValue)) {
          return new Date(value) > new Date(otherValue);
        }
        return false;
      })()
    );
  }
};
