import { controlValidator } from "../../index.js";

/** @type {import('../control-validator').Validator} */
export const minLengthValidator = {
  controlSelector: "[minlength],[min-length]",
  validate: (control, value, data) => {
    const minLengthValue = parseInt(control.getAttribute("minlength"), 10);
    return new controlValidator.ValidationResult(
      "min-length",
      minLengthValue,
      value,
      value >= minLengthValue
    );
  }
};
