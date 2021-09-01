/* eslint-disable no-unused-expressions */
/* global describe, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import { validatorRegistry } from "../../../../src/index.js";
import * as validators from "../../../../src/lib/validators/index.js";
import {
  createFormBinder,
  standupValidatorTest
} from "../control-validator.js";

describe("validation - greater-than", () => {
  standupValidatorTest(validators.greaterThanValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById("age");
    inputAge.value = 30;
    inputAge.dispatchEvent(new Event("change"));
    const inputHeight = document.getElementById("height");
    inputHeight.value = 50;
    inputHeight.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.greaterThanValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute("greater-than", "#/personalData/height");
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = 60;
    inputAge.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe("validation - less-than", () => {
  standupValidatorTest(validators.lessThanValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById("age");
    inputAge.value = 30;
    inputAge.dispatchEvent(new Event("change"));
    const inputHeight = document.getElementById("height");
    inputHeight.value = 20;
    inputHeight.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.lessThanValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute("less-than", "#/personalData/height");
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = 15;
    inputAge.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe("validation - max-length", () => {
  standupValidatorTest(validators.maxLengthValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById("name");
    inputName.value = "Fred Blogs";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.maxLengthValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute("max-length", "8");
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = "Fred B";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe("validation - min-length", () => {
  standupValidatorTest(validators.minLengthValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById("name");
    inputName.value = "Fred Blogs";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.minLengthValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute("min-length", "11");
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = "Fred Bloggs";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe("validation - max", () => {
  standupValidatorTest(validators.maxValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById("age");
    inputAge.value = "20";
    inputAge.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.maxValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute("max", "18");
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = "17";
    inputAge.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe("validation - min", () => {
  standupValidatorTest(validators.maxValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById("age");
    inputAge.value = "16";
    inputAge.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.maxValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute("min", "18");
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = "19";
    inputAge.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe("validation - pattern", () => {
  standupValidatorTest(validators.patternValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById("name");
    inputName.value = "Fred Blogs";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.patternValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute("pattern", "^[a-z|\\s]*$");
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = "fred blogs";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe("validation - required", () => {
  standupValidatorTest(validators.requiredValidator);

  it("should validate", async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById("name");
    inputName.value = "";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.requiredValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute("required", "");
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = "fred blogs";
    inputName.dispatchEvent(new Event("change"));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});
