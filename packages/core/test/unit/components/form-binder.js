/* global describe, before, after, afterEach, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import {
  controlBinders as binders,
  controlBinder as binder,
  controlValidator as validator
} from "../../../src/index.js";
import { data } from "../../../demo/mock.js";

/** @returns {import('../../../src/components/form-binder.js').FormBinder} */
async function createFormBinder() {
  const formBinder = document.createElement("form-binder");
  formBinder.data = JSON.parse(JSON.stringify(data));
  document.body.appendChild(formBinder);
  formBinder.innerHTML = `
    <input id="name" required pattern="Fred.*" type="text" name="#/name" />
    <input id="whitelist" whitelist="bill,bob,rob" type="text" name="#/name" />
    <input id="age" min="18" max="65" type="number" name="#/personalData/age" />
    <input id="tel" name="#/telephoneNumbers/1" />
    <input id="message" name="#/comments/1/message" />
    <input id="vegetarian" name="#/vegetarian" type="checkbox" />
  `;
  await formBinder.updateComplete;
  return formBinder;
}

const validateTextInput = {
  controlSelector: "input[whitelist]",
  checkValidity: (control, value) => {
    const whitelist = control.getAttribute("whitelist").split(",");
    return whitelist.some(v => v === value);
  },
  reportValidity: (control, value) => {
    control.setCustomValidity(
      `Needs to be one of ${control.getAttribute("whitelist")}`
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
    expect(document.getElementById("vegetarian").checked).to.equal(true);
  });
  it("Should not change value when value is invalid", async () => {
    binder.add(...Object.values(binders));
    const formBinder = await createFormBinder();
    inputValue("name", "Bert");
    inputValue("age", "300");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("Johnny Five");
    expect(formBinder.data.personalData.age).to.equal(34);
    inputValue("name", "Fred");
    inputValue("age", "20");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("Fred");
    expect(formBinder.data.personalData.age).to.equal(20);
  });
  it("Should reflect changes to data", async () => {
    binder.add(...Object.values(binders));
    const formBinder = await createFormBinder();
    const dataCopy = JSON.parse(JSON.stringify(formBinder.data));
    dataCopy.name = "fred123";
    dataCopy.personalData.age = 62;
    dataCopy.vegetarian = false;
    formBinder.data = dataCopy;
    await formBinder.updateComplete;
    expect(document.getElementById("name").value).to.equal("fred123");
    expect(document.getElementById("age").value).to.equal("62");
    expect(document.getElementById("vegetarian").checked).to.equal(false);
  });

  it("Should use custom validation", async () => {
    binder.add(...Object.values(binders));
    const formBinder = await createFormBinder();
    inputValue("whitelist", "Bert");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("Johnny Five");
    inputValue("whitelist", "bill");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("bill");
    inputValue("whitelist", "ray");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("bill");
    inputValue("whitelist", "rob");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("rob");
  });
  it("Should not change value when binder is removed", async () => {
    binder.add(binders.textInputBinder);
    const formBinder = await createFormBinder();
    inputValue("name", "Bert");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("Johnny Five");

    binder.remove(binders.textInputBinder);
    inputValue("name", "Johnny Six");
    await formBinder.updateComplete;
    expect(formBinder.data.name).to.equal("Johnny Five");

    // Not currently supported as the binders get initialized with events when the control is added to the form
    // The binder must currently be present when the control is added to the form
    // add(binders.textInputBinder);
    // inputValue("name", "Johnny Seven");
    // await formBinder.updateComplete;
    // expect(formBinder.data.name).to.equal("Johnny Seven");
  });
});
