import { controlValidator } from "../../index.js";

/** @type {import('../control-validator').Validator} */
export const patternValidator = {
  controlSelector: "[pattern]",
  validate: (control, value, data) => {
    const patternValue = control.getAttribute("pattern");
    return new controlValidator.ValidationResult(
      "pattern",
      patternValidator,
      value,
      new RegExp(patternValue).test(value)
    );
  }
};
