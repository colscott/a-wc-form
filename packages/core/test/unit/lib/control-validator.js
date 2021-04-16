/* eslint-disable no-unused-expressions */
/* global describe, after, afterEach, beforeEach, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import {
  controlBinder as binder,
  controlBinders as binders,
  controlValidator as validator
} from "a-wc-form-binder";
import { data } from "../../../demo/mock.js";

/** @returns {import('../../../src/components/form-binder.js').FormBinder} */
async function createFormBinder() {
  const formBinder = document.createElement("form-binder");
  formBinder.data = JSON.parse(JSON.stringify(data));
  document.body.appendChild(formBinder);
  formBinder.innerHTML = `
    <input id="name" type="text" name="#/name" />
  `;
  await formBinder.updateComplete;
  return formBinder;
}

const validateLowerCase = {
  controlSelector: "[lower-case]",
  checkValidity: (control, value) => {
    return /^[a-z]*$/.test(value);
  },
  reportValidity: (control, value) => {
    control.setCustomValidity(`Needs to be one of lower-case`);
  }
};

const validateVowelsOnly = {
  controlSelector: "[vowels-only]",
  checkValidity: (control, value) => {
    return /^[a|e|i|o|u]*$/.test(value);
  },
  reportValidity: (control, value) => {
    control.setCustomValidity(`Needs to be one of only vowels`);
  }
};

describe("Custom validators", () => {
  after(() => {
    validator.remove(validateLowerCase);
    validator.remove(validateVowelsOnly);
  });

  beforeEach(() => {
    binder.add(binders.textInputBinder);
  });

  afterEach(() => {
    binder.remove(binders.textInputBinder);
    document
      .querySelectorAll("form-binder")
      .forEach(e => e.parentElement.removeChild(e));
  });

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
