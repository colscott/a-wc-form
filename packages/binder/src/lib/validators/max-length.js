import * as controlValidator from "../control-validator.js";

/** @type {import('../control-validator').Validator} */
export const maxLengthValidator = {
  controlSelector: "[maxlength],[max-length]",
  validate: (control, value, data) => {
    const maxLengthValue = parseInt(
      control.hasAttribute("max-length")
        ? control.getAttribute("max-length")
        : control.getAttribute("maxlength"),
      10
    );
    const valueLength = value.toString().length;
    const result = new controlValidator.ValidationResult(
      "max-length",
      maxLengthValue,
      valueLength,
      valueLength <= maxLengthValue
    );
    return result;
  }
};
