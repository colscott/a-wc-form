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
    nationality: {
      type: "string",
      enum: ["DE", "IT", "JP", "US", "RU", "Other"]
    },
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
    comments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: {
            type: "string",
            format: "date"
          },
          message: {
            type: "string",
            maxLength: 5
          }
        }
      }
    },
    telephoneNumbers: {
      type: "array",
      items: {
        type: "string"
      }
    },
    address: {
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

/** @type {JsonUiSchema} */
export const uiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "HorizontalLayout",
      elements: [
        {
          type: "Control",
          ref: "#/name"
        },
        {
          type: "Control",
          ref: "#/personalData/age"
        },
        {
          type: "Control",
          ref: "#/birthDate"
        }
      ]
    },
    {
      type: "Label",
      text: "Additional Information"
    },
    {
      type: "HorizontalLayout",
      elements: [
        {
          type: "Control",
          ref: "#/personalData/height"
        },
        {
          type: "Control",
          ref: "#/nationality"
        },
        {
          type: "Control",
          ref: "#/occupation",
          suggestion: [
            "Accountant",
            "Engineer",
            "Freelancer",
            "Journalism",
            "Physician",
            "Student",
            "Teacher",
            "Other"
          ]
        }
      ]
    },
    {
      type: "Control",
      ref: "#/comments",
      options: {}
    },
    {
      type: "Control",
      ref: "#/telephoneNumbers",
      options: {}
    },
    {
      type: "Control",
      ref: "#/address",
      options: {}
    }
  ]
};

export const data = {
  name: "John Doe",
  vegetarian: false,
  birthDate: "1985-06-02",
  occupation: "Engineer",
  personalData: {
    age: 34,
    height: 82
  },
  postalCode: "12345",
  comments: [
    {
      date: "2001-09-11",
      message: "Th"
    },
    {
      date: "2001-10-30",
      message: "Thdsdfsdfsdf"
    },
    {
      date: "2011-09-11",
      message: "asdfasdfasdfasdf"
    }
  ],
  telephoneNumbers: ["123-456-7890", "123-8901234"],
  address: [12, "Place", "Street", "SW"]
};
