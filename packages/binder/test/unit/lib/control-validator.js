/* eslint-disable no-unused-expressions */
/* global describe, after, afterEach, beforeEach, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import {
  binderRegistry,
  binders,
  validatorRegistry,
  ValidationResult,
} from "../../../src/index.js";
import { data } from "../../../demo/mock.js";
import { wait } from "../components/form-binder.js";

const errorText = {
  "lower-case": "Needs to be one of lower-case"
};

/** @returns {import('../../../src/components/form-binder.js').FormBinder} */
export async function createFormBinder() {
  const formBinder = document.createElement("form-binder");
  formBinder.data = JSON.parse(JSON.stringify(data));
  document.body.appendChild(formBinder);
  formBinder.innerHTML = `
    <input id="name" type="text" bind="#/name" />
    <input id="age" type="number" bind="#/personalData/age" />
    <input id="height" type="number" bind="#/personalData/height" />
    <input id="birthDate" type="date" bind="/birthDate" />
    `;
  formBinder.addEventListener("form-binder:report-validity", e => {
    /** @type {import('../../../src/lib/validator-registry').FormValidationResult} */
    const { errors, isValid, result } = e.detail;
    errors
      // .filter(controlValidationResult => controlValidationResult.visited)
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

/** @type {import('../../../src/lib/validator-registry').Validator} */
const validateLowerCase = {
  controlSelector: "[lower-case]",
  validate: (control, value) => {
    const result = /^[a-z]*$/.test(value);
    return new ValidationResult("lower-case", true, result, result);
  }
};

/** @type {import('../../../src/lib/validator-registry').Validator} */
const validateVowelsOnly = {
  controlSelector: "[vowels-only]",
  validate: (control, value) => {
    const result = /^[a|e|i|o|u]*$/.test(value);
    return new ValidationResult("vowels-only", true, result, result);
  }
};

/**
 * @param {...import('../../../src/lib/validator-registry').Validator} validatorsToTest being tested
 */
export function standupValidatorTest(...validatorsToTest) {
  after(() => {
    validatorsToTest.forEach(validatorToTest =>
      validatorRegistry.remove(validatorToTest)
    );
  });

  beforeEach(() => {
    binderRegistry.add(binders.numberInputBinder);
    binderRegistry.add(binders.textInputBinder);
  });

  afterEach(() => {
    binderRegistry.remove(binders.textInputBinder);
    binderRegistry.remove(binders.numberInputBinder);
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
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validateLowerCase);
    expect(await formBinder.checkValidity()).to.be.true;
    input.setAttribute("lower-case", "");
    expect(await formBinder.checkValidity()).to.be.false;
    input.removeAttribute("lower-case");
    expect(await formBinder.checkValidity()).to.be.true;
    input.setAttribute("lower-case", "");
    expect(await formBinder.checkValidity()).to.be.false;
    validatorRegistry.remove(validateLowerCase);
    expect(await formBinder.checkValidity()).to.be.true;
    input.setAttribute("lower-case", "");
    validatorRegistry.add(validateVowelsOnly);
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.remove(validateVowelsOnly);
  });

  it("Should correctly report invalid state", async () => {
    const formBinder = await createFormBinder();
    const input = document.getElementById("name");
    await wait();
    expect(input.validationMessage).to.equal("");
    validatorRegistry.add(validateLowerCase);
    await wait();
    expect(input.validationMessage).to.equal("");
    input.setAttribute("lower-case", "");
    await wait();
    expect(input.validationMessage).to.equal("");
    formBinder.reportValidity();
    await wait();
    expect(input.validationMessage).to.equal("Needs to be one of lower-case");
  });
});
