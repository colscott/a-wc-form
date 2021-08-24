import { controlValidator } from "../../index.js";

/** @type {import('../control-validator').Validator} */
export const minValidator = {
  controlSelector: "[min]",
  validate: (control, value, data) => {
    const minValue = parseInt(control.getAttribute("min"), 10);
    return new controlValidator.ValidationResult("min", minValue, value, value >= minValue);
  }
};
