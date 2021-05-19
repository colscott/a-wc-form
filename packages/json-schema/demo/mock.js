/** @type {import("../src/lib/models").JsonSchema} */
export const schema = {
  type: "object",
  title: "Person",
  properties: {
    name: {
      type: "string",
      minLength: 3,
      description: "Please enter your name",
      title: "Full name"
    },
    vegetarian: {
      type: "boolean",
      title: "Vegetarian"
    },
    birthDate: {
      type: "string",
      format: "date",
      title: "Date of birth"
    },
    time: {
      type: "string",
      format: "time",
      title: "Time"
    },
    nationality: {
      type: "string",
      enum: ["DE", "IT", "JP", "US", "RU"],
      title: "Nationality"
    },
    // Should be vertical layout
    personalData: {
      type: "object",
      title: "Personal",
      properties: {
        age: {
          type: "integer",
          description: "Please enter your age.",
          title: "Age"
        },
        height: {
          type: "number",
          title: "Height"
        },
        drivingSkill: {
          type: "number",
          maximum: 10,
          minimum: 1,
          default: 7,
          title: "Driving level"
        }
      },
      required: ["age", "height"]
    },
    occupation: {
      type: "string",
      title: "Occupation"
    },
    postalCode: {
      type: "string",
      maxLength: 5,
      title: "Postal code"
    },
    // Should be vertical layout
    comments: {
      // Grid
      type: "array",
      title: "Comments",
      items: {
        // Should be horizontal layout
        type: "object",
        properties: {
          date: {
            type: "string",
            format: "date-time",
            title: "Date"
          },
          message: {
            type: "string",
            maxLength: 5,
            title: "Message"
          }
        }
      }
    },
    telephoneNumbers: {
      // Array
      type: "array",
      title: "Telephone numbers",
      items: {
        type: "string"
      }
    },
    address: {
      // Tuple
      type: "array",
      title: "Addresses",
      items: [
        {
          type: "number",
          title: "Unit"
        },
        {
          type: "string",
          title: "Street"
        },
        {
          type: "string",
          enum: ["Street", "Avenue", "Boulevard"],
          title: "Type"
        },
        {
          type: "string",
          enum: ["NW", "NE", "SW", "SE"],
          title: "Direction"
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
          ref: "#/name",
          schema
        }
      }
    ]
  }
};
