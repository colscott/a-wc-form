/* eslint-disable no-unused-expressions */
/* global describe, before, after, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import { binderRegistry, binders } from "../../../src/index.js";

describe("Custom Binders", () => {
  before(() => {
    binderRegistry.add(...Object.values(binders));
  });
  after(() => {
    binderRegistry.remove(...Object.values(binders));
  });
  it("Should write values", () => {
    const input = document.createElement("input");
    expect(input.value).to.be.equal("");
    binders.textInputBinder.writeValue(input, "text");
    expect(input.value).to.be.equal("text");
    input.value = "";

    input.type = "number";
    binders.numberInputBinder.writeValue(input, "33");
    expect(input.value).to.be.equal("33");
    input.value = "";

    input.type = "checkbox";
    expect(input.checked).to.be.false;
    binders.checkboxInputBinder.writeValue(input, true);
    expect(input.checked).to.be.true;
    input.value = "";

    const select = document.createElement("select");
    select.innerHTML = `<option value="one">one</option><option value="two">two</option>`;
    binders.selectBinder.writeValue(select, "two");
    expect(select.value).to.be.equal("two");
  });
  it("Should listen for text changes", done => {
    const input = document.createElement("input");
    binders.textInputBinder.initializeEvents(input, value => {
      expect(value).to.be.equal("test");
      done();
    });
    input.value = "test";
    input.dispatchEvent(new Event("change"));
  });
  it("Should listen for number changes", done => {
    const input = document.createElement("input");
    binders.numberInputBinder.initializeEvents(input, value => {
      expect(value).to.be.equal(33);
      done();
    });
    input.type = "number";
    input.value = "33";
    input.dispatchEvent(new Event("change"));
  });
  it("Should listen for checkbox changes", done => {
    const input = document.createElement("input");
    binders.checkboxInputBinder.initializeEvents(input, value => {
      expect(value).to.be.true;
      done();
    });
    input.type = "checkbox";
    input.click();
    input.dispatchEvent(new Event("change"));
  });
  it("Should listen for select changes", done => {
    const select = document.createElement("select");
    select.innerHTML = `<option value="one">one</option><option value="two">two</option>`;
    binders.textInputBinder.initializeEvents(select, value => {
      expect(value).to.be.equal("two");
      done();
    });
    select.value = "two";
    select.dispatchEvent(new Event("change"));
  });
});
