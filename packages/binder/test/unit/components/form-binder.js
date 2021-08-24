/* global describe, before, after, afterEach, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import {
  controlBinders as binders,
  controlBinder as binder,
  controlValidator as validator
} from "../../../src/index.js";
import { patternValidator } from "../../../src/lib/validators/pattern.js";
import { maxValidator } from "../../../src/lib/validators/max.js";
import { data as mockData } from "../../../demo/mock.js";

/** @returns {Promise} that resolves when the form-binder:change event fires */
export function wait() {
  return new Promise(res => setTimeout(res, 0));
}

/** @returns {{formBinder: import('../../../src/components/form-binder.js').FormBinder, change: {data: any}}} */
async function createFormBinder() {
  const data = JSON.parse(JSON.stringify(mockData));
  const formBinder = document.createElement("form-binder");
  formBinder.data = data;
  document.body.appendChild(formBinder);
  formBinder.innerHTML = `
    <input id="name" required pattern="Fred.*" type="text" name="#/name" />
    <input id="whitelist" whitelist="bill,bob,rob" type="text" name="#/name" />
    <input id="age" min="18" max="65" type="number" name="#/personalData/age" />
    <input id="tel" name="#/telephoneNumbers/1" />
    <input id="message" name="#/comments/1/message" />
    <input id="student" name="#/student" type="checkbox" />
  `;
  const changes = { data };
  formBinder.addEventListener("form-binder:change", e => {
    changes.data = e.detail.data;
  });
  await formBinder.updateComplete;
  return { formBinder, changes };
}

/** @type {import('../../../src/lib/control-validator').Validator} */
const validateTextInput = {
  controlSelector: "input[whitelist]",
  validate: (control, value, data) => {
    const whitelist = control.getAttribute("whitelist").split(",");
    const isValid = whitelist.some(v => v === value);
    return new validator.ValidationResult(
      "whitelist",
      whitelist,
      value,
      isValid
    );
  }
};

/**
 * @param {string} controlId
 * @param {string} value
 */
function inputValue(controlId, value) {
  const controlElement = document.getElementById(controlId);
  if (typeof value === "boolean") {
    controlElement.checked = value;
  } else {
    controlElement.value = value;
  }
  controlElement.dispatchEvent(new Event("change"));
}

describe("form-binder binding tests", () => {
  before(() => {
    validator.add(validateTextInput, true);
  });
  after(() => {
    validator.remove(validateTextInput, true);
  });
  afterEach(() => {
    validator.remove(patternValidator);
    validator.remove(maxValidator);
    binder.remove(...Object.values(binders));
    document
      .querySelectorAll("form-binder")
      .forEach(e => e.parentElement.removeChild(e));
  });
  it("Should populate controls", async () => {
    binder.add(...Object.values(binders));
    await createFormBinder();
    expect(document.getElementById("name").value).to.equal("Johnny Five");
    expect(document.getElementById("age").value).to.equal("34");
    expect(document.getElementById("tel").value).to.equal("123-8901234");
    expect(document.getElementById("message").value).to.equal("Thdsdfsdfsdf");
    expect(document.getElementById("student").checked).to.equal(true);
  });
  it("Should not change value when value is invalid", async () => {
    binder.add(...Object.values(binders));
    const { changes } = await createFormBinder();
    validator.add(patternValidator, true);
    validator.add(maxValidator, true);
    inputValue("name", "Bert");
    inputValue("age", "300");
    await wait();
    expect(changes.data.name).to.equal("Johnny Five");
    expect(changes.data.personalData.age).to.equal(34);
    validator.remove(patternValidator);
    validator.remove(maxValidator);
    inputValue("name", "Fred");
    inputValue("age", "20");
    await wait();
    expect(changes.data.name).to.equal("Fred");
    expect(changes.data.personalData.age).to.equal(20);
  });
  it("Should reflect changes to data", async () => {
    binder.add(...Object.values(binders));
    const { formBinder } = await createFormBinder();
    const dataCopy = JSON.parse(JSON.stringify(formBinder.data));
    dataCopy.name = "fred123";
    dataCopy.personalData.age = 62;
    dataCopy.student = false;
    formBinder.data = dataCopy;
    await formBinder.updateComplete;
    expect(document.getElementById("name").value).to.equal("fred123");
    expect(document.getElementById("age").value).to.equal("62");
    expect(document.getElementById("student").checked).to.equal(false);
  });

  it("Should use custom validation", async () => {
    binder.add(...Object.values(binders));
    const { changes } = await createFormBinder();
    inputValue("whitelist", "Bert");
    await wait();
    expect(changes.data.name).to.equal("Johnny Five");
    inputValue("whitelist", "bill");
    await wait();
    expect(changes.data.name).to.equal("bill");
    inputValue("whitelist", "ray");
    await wait();
    expect(changes.data.name).to.equal("bill");
    inputValue("whitelist", "rob");
    await wait();
    expect(changes.data.name).to.equal("rob");
  });
  // Not currently supported as the binders get initialized with events when the control is added to the form
  // it("Should not change value when binder is removed", async () => {
  //   binder.add(binders.textInputBinder);
  //   const { formBinder, changes } = await createFormBinder();
  //   inputValue("name", "Bert");
  //   await formBinder.updateComplete;
  //   expect(changes.data.name).to.equal("Bert");

  //   binder.remove(binders.textInputBinder);
  //   inputValue("name", "Johnny Six");
  //   await formBinder.updateComplete;
  //   expect(changes.data.name).to.equal("Bert");

  //   // Not currently supported as the binders get initialized with events when the control is added to the form
  //   // The binder must currently be present when the control is added to the form
  //   // add(binders.textInputBinder);
  //   // inputValue("name", "Johnny Seven");
  //   // await formBinder.updateComplete;
  //   // expect(formBinder.data.name).to.equal("Johnny Seven");
  // });
});
