/* global describe, it */
import { expect } from "@esm-bundle/chai/esm/chai.js";
import { getLayout } from "../../../src/lib/layout-generator.js";

const jsonSchema = {
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

const expectedLayout = {
  template: "VerticalLayout",
  properties: {
    components: [
      {
        properties: {
          description: undefined,
          label: undefined,
          possibleValues: undefined,
          readOnly: false,
          ref: "#/name",
          type: "text",
          validation: {
            max: undefined,
            maxLength: undefined,
            min: undefined,
            minLength: undefined,
            pattern: undefined,
            required: false,
            step: undefined
          }
        },
        template: "Control"
      },
      {
        properties: {
          description: undefined,
          label: undefined,
          possibleValues: undefined,
          readOnly: false,
          ref: "#/age",
          type: "number",
          validation: {
            max: undefined,
            maxLength: undefined,
            min: undefined,
            minLength: undefined,
            pattern: undefined,
            required: false,
            step: undefined
          }
        },
        template: "Control"
      },
      {
        properties: {
          description: undefined,
          label: undefined,
          possibleValues: undefined,
          readOnly: false,
          ref: "#/male",
          type: "checkbox",
          validation: {
            max: undefined,
            maxLength: undefined,
            min: undefined,
            minLength: undefined,
            pattern: undefined,
            required: false,
            step: undefined
          }
        },
        template: "Control"
      },
      {
        properties: {
          components: [
            {
              properties: {
                description: undefined,
                label: undefined,
                possibleValues: undefined,
                readOnly: false,
                ref: "#/children/items/name",
                type: "text",
                validation: {
                  max: undefined,
                  maxLength: undefined,
                  min: undefined,
                  minLength: undefined,
                  pattern: undefined,
                  required: false,
                  step: undefined
                }
              },
              template: "Control"
            },
            {
              properties: {
                description: undefined,
                label: undefined,
                possibleValues: undefined,
                readOnly: false,
                ref: "#/children/items/age",
                type: "number",
                validation: {
                  max: undefined,
                  maxLength: undefined,
                  min: undefined,
                  minLength: undefined,
                  pattern: undefined,
                  required: false,
                  step: undefined
                }
              },
              template: "Control"
            }
          ],
          label: undefined,
          ref: "#/children"
        },
        template: "GridLayout"
      }
    ],
    label: undefined
  }
};

describe("Layout", () => {
  it("Generate from layout", () => {
    expect(getLayout(jsonSchema)).to.deep.equal(expectedLayout);
  });
});
