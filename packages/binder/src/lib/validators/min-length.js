import { controlValidator } from "../../index.js";

/** @type {import('../control-validator').Validator} */
export const minLengthValidator = {
  controlSelector: "[minlength],[min-length]",
  validate: (control, value, data) => {
    const minLengthValue = parseInt(
      control.getAttribute("min-length")
        ? control.getAttribute("min-length")
        : control.getAttribute("minlength"),
      10
    );
    const valueLength = value.toString().length;
    return new controlValidator.ValidationResult(
      "min-length",
      minLengthValue,
      valueLength,
      valueLength >= minLengthValue
    );
  }
};
