import { controlValidator } from "../../index.js";

/** @type {import('../control-validator').Validator} */
export const requiredValidator = {
  controlSelector: "[required]",
  validate: (control, value, data) => {
    return new controlValidator.ValidationResult("required", true, value, !!value);
  }
};
