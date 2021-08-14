import { ValidationResult } from "../control-validator.js";

/** @type {import('../control-validator').Validator} */
export const requiredValidator = {
  controlSelector: "[required]",
  validate: (control, value, data) => {
    return new ValidationResult("required", true, value, !!value);
  }
};
