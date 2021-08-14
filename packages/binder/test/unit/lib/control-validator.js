/* eslint-disable no-unused-expressions */
/* global describe, after, afterEach, beforeEach, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import {
  controlBinder as binder,
  controlBinders as binders,
  controlValidator as validator
} from "../../../src/index.js";
import { data } from "../../../demo/mock.js";
import { ValidationResult } from "../../../src/lib/control-validator";

const errorText = {
  "lower-case": "Needs to be one of lower-case"
};

/** @returns {import('../../../src/components/form-binder.js').FormBinder} */
export async function createFormBinder() {
  const formBinder = document.createElement("form-binder");
  formBinder.data = JSON.parse(JSON.stringify(data));
  document.body.appendChild(formBinder);
  formBinder.innerHTML = `
    <input id="name" type="text" name="#/name" />
    <input id="age" type="number" name="#/personalData/age" />
    <input id="height" type="number" name="#/personalData/height" />
  `;
  formBinder.addEventListener("form-binder:report-validity", e => {
    /** @type {import('../../../src/lib/control-validator').FormValidationResult} */
    const { errors, isValid, result } = e.detail;
    errors
      .filter(controlValidationResult => controlValidationResult.visited)
      .forEach(controlValidationResult => {
        const {
          control,
          controlValidationResults,
          visited
        } = controlValidationResult;
        control.setCustomValidity(
          controlValidationResults
            .map(controlValidator => errorText[controlValidator.name])
            .join(",")
        );
      });
  });
  await formBinder.updateComplete;
  return formBinder;
}

/** @type {import('../../../src/lib/control-validator').Validator} */
const validateLowerCase = {
  controlSelector: "[lower-case]",
  validate: (control, value) => {
    const result = /^[a-z]*$/.test(value);
    return new ValidationResult("lower-case", true, result, result);
  }
};

/** @type {import('../../../src/lib/control-validator').Validator} */
const validateVowelsOnly = {
  controlSelector: "[vowels-only]",
  validate: (control, value) => {
    const result = /^[a|e|i|o|u]*$/.test(value);
    return new ValidationResult("vowels-only", true, result, result);
  }
};

/**
 * @param {...import('../../../src/lib/control-validator').Validator} validatorsToTest being tested
 */
export function standupValidatorTest(...validatorsToTest) {
  after(() => {
    validatorsToTest.forEach(validatorToTest =>
      validator.remove(validatorToTest)
    );
  });

  beforeEach(() => {
    binder.add(binders.numberInputBinder);
    binder.add(binders.textInputBinder);
  });

  afterEach(() => {
    binder.remove(binders.textInputBinder);
    binder.remove(binders.numberInputBinder);
    document
      .querySelectorAll("form-binder")
      .forEach(e => e.parentElement.removeChild(e));
  });
}

describe("Custom validators", () => {
  standupValidatorTest(validateLowerCase, validateVowelsOnly);

  it("Should correctly report valid state", async () => {
    const formBinder = await createFormBinder();
    const input = document.getElementById("name");
    expect(formBinder.checkValidity()).to.be.true;
    validator.add(validateLowerCase);
    expect(formBinder.checkValidity()).to.be.true;
    input.setAttribute("lower-case", "");
    expect(formBinder.checkValidity()).to.be.false;
    input.removeAttribute("lower-case");
    expect(formBinder.checkValidity()).to.be.true;
    input.setAttribute("lower-case", "");
    expect(formBinder.checkValidity()).to.be.false;
    validator.remove(validateLowerCase);
    expect(formBinder.checkValidity()).to.be.true;
    input.setAttribute("lower-case", "");
    validator.add(validateVowelsOnly);
    expect(formBinder.checkValidity()).to.be.true;
    validator.remove(validateVowelsOnly);
  });

  it("Should correctly report invalid state", async () => {
    const formBinder = await createFormBinder();
    const input = document.getElementById("name");
    expect(input.validationMessage).to.equal("");
    validator.add(validateLowerCase);
    expect(input.validationMessage).to.equal("");
    input.setAttribute("lower-case", "");
    expect(input.validationMessage).to.equal("");
    formBinder.reportValidity();
    expect(input.validationMessage).to.equal("Needs to be one of lower-case");
  });
});
