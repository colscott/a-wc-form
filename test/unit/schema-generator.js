/* global describe, beforeAll, afterAll, jasmine, it, expect */
import { getSchema, getUiSchema } from "../../src/lib/schema-generator.js";

const obj = {
  name: "Homer",
  age: 42,
  male: true,
  children: [
    {
      name: "Lisa",
      age: 8
    },
    {
      name: "Bart",
      age: 10
    }
  ]
};

const schema = {
  type: "object",
  properties: {
    name: {
      type: "string"
    },
    age: {
      type: "number"
    },
    male: {
      type: "boolean"
    },
    children: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string"
          },
          age: {
            type: "number"
          }
        }
      }
    }
  }
};

const uiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/name"
    },
    {
      type: "Control",
      scope: "#/properties/age"
    },
    {
      type: "Control",
      scope: "#/properties/male"
    },
    {
      type: "Control",
      scope: "#/properties/children"
    }
  ]
};

describe("Schema", () => {
  it("Ganerate from data", () => {
    expect(JSON.stringify(getSchema(obj))).toEqual(JSON.stringify(schema));
  });
});

describe("UiSchema", () => {
  it("Ganerate from schema", () => {
    expect(JSON.stringify(getUiSchema(schema))).toEqual(
      JSON.stringify(uiSchema)
    );
  });
});
