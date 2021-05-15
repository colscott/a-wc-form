export const schema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 3,
      description: "Please enter your name"
    },
    vegetarian: {
      type: "boolean"
    },
    birthDate: {
      type: "string",
      format: "date"
    },
    lunchTime: {
      type: "string",
      format: "time"
    },
    nationality: {
      type: "string",
      enum: ["DE", "IT", "JP", "US", "RU", "Other"]
    },
    // Should be vertical layout
    personalData: {
      type: "object",
      properties: {
        age: {
          type: "integer",
          description: "Please enter your age."
        },
        height: {
          type: "number"
        },
        drivingSkill: {
          type: "number",
          maximum: 10,
          minimum: 1,
          default: 7
        }
      },
      required: ["age", "height"]
    },
    occupation: {
      type: "string"
    },
    postalCode: {
      type: "string",
      maxLength: 5
    },
    // Should be vertical layout
    comments: {
      // Grid
      type: "array",
      items: {
        // Should be horizontal layout
        type: "object",
        properties: {
          date: {
            type: "string",
            format: "date-time"
          },
          message: {
            type: "string",
            maxLength: 5
          }
        }
      }
    },
    telephoneNumbers: {
      // Array
      type: "array",
      items: {
        type: "string"
      }
    },
    address: {
      // Tuple
      type: "array",
      items: [
        {
          type: "number"
        },
        {
          type: "string"
        },
        {
          type: "string",
          enum: ["Street", "Avenue", "Boulevard"]
        },
        {
          type: "string",
          enum: ["NW", "NE", "SW", "SE"]
        }
      ]
    }
  },
  required: ["occupation", "nationality"]
};

export const layout = {
  template: "VerticalLayout",
  properties: {
    components: [
      {
        template: "JsonSchemaControl",
        properties: {
          ref: "#/name"
        }
      }
    ]
  }
};
