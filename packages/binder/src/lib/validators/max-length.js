import { controlValidator } from "../../index.js";

/** @type {import('../control-validator').Validator} */
export const maxLengthValidator = {
  controlSelector: "[maxlength],[max-length]",
  validate: (control, value, data) => {
    const maxLengthValue = parseInt(control.getAttribute("maxlength"), 10);
    const result = new ValidationResult(
      "max-length",
      maxLengthValue,
      value,
      value <= maxLengthValue
    );
    return result;
  }
};
