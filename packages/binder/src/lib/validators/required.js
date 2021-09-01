import { ValidationResult } from "../validation-result.js";

/** @type {import('../validator-registry').Validator} */
export const requiredValidator = {
  controlSelector: "[required]",
  validate: (control, value, data) => {
    return new ValidationResult("required", true, value, !!value);
  }
};
