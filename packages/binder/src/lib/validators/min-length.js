import { ValidationResult } from "../control-validator.js";

/** @type {import('../control-validator').Validator} */
export const minLengthValidator = {
  controlSelector: "[minlength],[minlength]",
  validate: (control, value, data) => {
    const minLengthValue = parseInt(control.getAttribute("minlength"), 10);
    return new ValidationResult(
      "min-length",
      minLengthValue,
      value,
      value >= minLengthValue
    );
  }
};
