/* eslint-disable no-unused-expressions */
/* global describe, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import {
  getSchemaValue,
  getValue,
  setValue
} from "../../../src/lib/json-pointer.js";
import { data } from "../../../demo/mock.js";
import { schema } from "../../../../json-schema/demo/mock.js";

describe("JSON Pointer", () => {
  it("Should correctly map to data", async () => {
    expect(getValue(data, "#")).to.deep.equal(data);
    expect(getValue(data, "#/")).to.deep.equal(data);
    expect(getValue(data, "")).to.deep.equal(data);
    expect(getValue(data, "#/name")).to.equal(data.name);
    expect(getValue(data, "/name")).to.equal(data.name);
    expect(getValue(data, "#/personalData")).to.deep.equal(data.personalData);
    expect(getValue(data, "/personalData")).to.deep.equal(data.personalData);
    expect(getValue(data, "#/personalData/age")).to.equal(
      data.personalData.age
    );
    expect(getValue(data, "/personalData/age")).to.equal(data.personalData.age);
    expect(getValue(data, "#/comments/1")).to.deep.equal(data.comments[1]);
    expect(getValue(data, "/comments/1")).to.deep.equal(data.comments[1]);
    expect(getValue(data, "#/comments/1/date")).to.equal(data.comments[1].date);
    expect(getValue(data, "/comments/1/date")).to.equal(data.comments[1].date);
  });

  it("Should correctly map to schema", async () => {
    expect(getSchemaValue(schema, "#")).to.deep.equal(schema);
    expect(getSchemaValue(schema, "#/")).to.deep.equal(schema.properties);
    expect(getSchemaValue(schema, "#/name")).to.equal(schema.properties.name);
    expect(getSchemaValue(schema, "/name")).to.equal(schema.properties.name);
    expect(getSchemaValue(schema, "#/personalData")).to.deep.equal(
      schema.properties.personalData
    );
    expect(getSchemaValue(schema, "/personalData")).to.deep.equal(
      schema.properties.personalData
    );
    expect(getSchemaValue(schema, "#/personalData/age")).to.equal(
      schema.properties.personalData.properties.age
    );
    expect(getSchemaValue(schema, "/personalData/age")).to.equal(
      schema.properties.personalData.properties.age
    );
    expect(getSchemaValue(schema, "#/comments")).to.deep.equal(
      schema.properties.comments
    );
    expect(getSchemaValue(schema, "/comments")).to.deep.equal(
      schema.properties.comments
    );
    expect(getSchemaValue(schema, "#/comments/0/date")).to.equal(
      schema.properties.comments.items.properties.date
    );
    expect(getSchemaValue(schema, "/comments/0/date")).to.equal(
      schema.properties.comments.items.properties.date
    );
    expect(getSchemaValue(schema, "#/address/1")).to.equal(
      schema.properties.address.items[1]
    );
    expect(getSchemaValue(schema, "/address/1")).to.equal(
      schema.properties.address.items[1]
    );
  });

  xit("Should correctly set data", async () => {});
});
