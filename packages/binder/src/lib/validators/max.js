import * as controlValidator from "../control-validator.js";

/** @type {import('../control-validator').Validator} */
export const maxValidator = {
  controlSelector: "[max]",
  validate: (control, value, data) => {
    const maxValue = parseInt(control.getAttribute("max"), 10);
    return new controlValidator.ValidationResult(
      "max",
      maxValue,
      value,
      typeof value === "number" && value <= maxValue
    );
  }
};
