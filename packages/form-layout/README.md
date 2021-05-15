# AWC Form Layout
Form layout using a JSON schema.

Simple to use web component that extends awc form binder's ability to bind data to form controls with the ability to layout forms using a JSON as a layout schema.

## Usage

Install the form layout package which include basic layout templates that can be customized with CSS:
```cmd
npm i -save a-wc-form-layout
```
Optional Material Web Component layout templates:
```cmd
npm i -save a-wc-form-binder-material
```

Example:
```html
<form-layout></form-layout><br/>
```
Next we bind data and event listeners to the form just like we would with the form-binder. See AWC Form Binder for more information.
```js
import {
  controlBinder as binder,
  controlBinders as binders
} from 'a-wc-form-layout/src/index.js';

// And the control binders you wish to use. These can be custom.
binder.add(...Object.values(binders));

const formBinder = document.querySelector('form-layout');

// Give the form-layout the data
formBinder.data = {
  name: "Johnny Five", // Will require a text input
  vegetarian: true, // Will require a checkbox
  birthDate: "1985-06-02", // Will require a date input
  occupation: "Engineer", // Will require select from a list of values
  personalData: { // Nested data example
    age: 34
  },
  comments: [ // Array of objects
    {
      date: "2001-09-11",
      message: "Message one"
    },
    {
      date: "2001-10-30",
      message: "Message two"
    },
    {
      date: "2011-09-11",
      message: "Message three"
    }
  ],
  // Array of basic type
  telephoneNumbers: ["123-456-7890", "123-8901234"],
  // Tuple
  address: [12, "Place", "Street", "SW"]
};

// Listen for changes to the data
formBinder.addEventListener('form-binder:change', e => console.info(e.detail.data));
```

Next pass in the layout. Here's an exhaustive example to layout the data above:

```js
const formBinder = document.querySelector('form-layout');
formBinder.layout = {
  // A component is made up of a template name and properties to pass to the template
  // name of the template that will render the component
  template: "VerticalLayout",
  // template properties are used to configure a template, they are passed to the template as parameters
  properties: {
    // The VerticalLayout template takes an array of components that it will render vertically
    components: [
      {
        template: "HorizontalLayout",
        properties: {
          // The HorizontalLayout template takes an array of components that it will render horizontally
          components: [
            {
              // The Control component is used to render inputs
              template: "Control",
              properties: {
                ref: "#/name", // JSON pointer to data backing this control
                type: "text", // Input type
                label: "First Name", // Input label
                description: "Please enter your name", // Input description
                minLength: 3, // min text length
                maxLength: 30, // max text length
                pattern: "^[a-z|A-Z]+$" // Regex validation pattern
              }
            },
            {
              // Number input
              template: "Control",
              properties: {
                ref: "#/personalData/age",
                type: "number",
                min: 18, // min value
                max: 150, // max value
                step: 1, // incremental step size
                required: true // mark this control as required
              }
            },
            {
              // Date input
              template: "Control",
              properties: {
                ref: "#/birthDate",
                type: "date"
              }
            },
            {
              // Boolean input
              template: "Control",
              properties: {
                ref: "#/vegetarian",
                type: "checkbox"
              }
            }
          ]
        }
      },
      {
        template: "HorizontalLayout",
        properties: {
          components: [
            {
              template: "Control",
              properties: {
                ref: "#/occupation",
                possibleValues: [ // When possibleValues are supplied a select input is rendered
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
            }
          ]
        }
      },
      {
        template: "GridLayout",
        properties: {
          ref: "#/comments", // JSON pointer to the array of objects
          label: "",
          components: [
            // This component is used for column one
            {
              template: "Control",
              properties: {
                type: "date",
                label: "Date", // Label that will be used as the header for this column
                ref: "date" // relative JSON pointer to the data in the object
              }
            },
            {
              template: "Control",
              properties: {
                type: "text",
                label: "Message",
                ref: "message"
              }
            }
          ]
        }
      },
      {
        // Array
        template: "ArrayLayout",
        properties: {
          ref: "#/telephoneNumbers", // JSON pointer to the array
          component: {
            // The component to use for each entry
            template: "Control",
            properties: {
              type: "text",
              pattern: "\\d{3}-\\d{3}-\\d{4}"
            }
          }
        }
      },
      {
        // Tuple example
        template: "HorizontalLayout",
        properties: {
          components: [
            {
              template: "Control",
              properties: {
                ref: "#/address/0",
                label: "",
                type: "number"
              }
            },
            {
              template: "Control",
              properties: {
                ref: "#/address/1",
                type: "text"
              }
            },
            {
              template: "Control",
              properties: {
                ref: "#/address/2",
                possibleValues: ["Street", "Avenue", "Boulevard"]
              }
            },
            {
              template: "Control",
              properties: {
                ref: "#/address/3",
                possibleValues: ["NW", "NE", "SW", "SE"]
              }
            }
          ]
        }
      }
    ]
  }
};
```

## API
### Attributes and properties
| Name | Type | Description |
| ---- | ---- | ----------- |
| data | property | The JSON data to bind controllers to |
| layout | property | The JSON layout containing the component definitions |

## Events
| Name | Detail | Description |
| ---- | ------ | ----------- |
| form-binder:change | data | event.detail.data references a copy of the original data that has new values applied to it. |

<!-- ## Material Web Component control binders

```js
import { controlBinder as binder } from "a-wc-form-binder";

// import Material Web Component control binders
import 'a-wc-form-binder-material/src/lib/control-binders.js';
``` -->

## Custom components and templates

Create a template. Here's a div being used as a checkbox.

```js
import { setComponentTemplate } from 'a-wc-form-layout/src/index.js';

// Templates are lit-html
const toggleTemplate = (context) => html`
  <div name=${context.component.properties.ref} class="my-toggle" style="border: 1px solid black;"></div>
`;
// Register the template so that it can be used in a component in the layout
setComponentTemplate("Toggle", toggleTemplate);
```
In the above code, if there was already a template called Toggle registered it would be overwritten with the new one.

Set up data binding using awc form binder
```js
import { controlBinder as binder } from "a-wc-form-layout";

// Create the binder
const divToggleBinding = {
  controlSelector: "div.toggle",
  initializeEvents: (control, onChange) =>
    control.addEventListener("click", e => {
      control.toggleValue = !control.toggleValue;
      onChange(control.toggleValue)
    }),
  writeValue: (control, value) => {
    control.toggleValue = value;
    control.style.backgroundColor = value ? 'black' : 'transparent';
  }
};

// Register the binding:
binder.add(divToggleBinding);
```

Add the form with data and layout
```html
<form-layout></form-layout>
```

```js
const formBinder = document.querySelector('form-layout');

formBinder.data = { toggle: true };

formBinder.layout = {
  template: "Toggle",
  properties: {
    ref: "#/toggle"
  }
}
```
