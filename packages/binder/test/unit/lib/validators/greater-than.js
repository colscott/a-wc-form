/* eslint-disable no-unused-expressions */
/* global describe, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import { controlValidator as validator } from "../../../../src/index.js";
import { greaterThanValidator } from "../../../../src/lib/validators/greater-than.js";
import {
  createFormBinder,
  standupValidatorTest
} from "../control-validator.js";

describe("validation - greater than", () => {
  standupValidatorTest(greaterThanValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById("age");
    inputAge.value = 30;
    inputAge.dispatchEvent(new Event("change"));
    const inputHeight = document.getElementById("height");
    inputHeight.value = 50;
    inputHeight.dispatchEvent(new Event("change"));
    expect(formBinder.checkValidity()).to.be.true;
    validator.add(greaterThanValidator);
    expect(formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute("greaterthan", "#/personalData/height");
    expect(formBinder.checkValidity()).to.be.false;
    inputAge.value = 60;
    inputAge.dispatchEvent(new Event("change"));
    expect(formBinder.checkValidity()).to.be.true;
  });
});
