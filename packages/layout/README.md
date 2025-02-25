# AWC Form Layout
Extends [a-wc-form-binder](https://github.com/colscott/a-wc-form/tree/master/packages/binder) to use a layout schema which generates a form layout and controls.

## Usage

Install [a-wc-form-binder](https://github.com/colscott/a-wc-form/tree/master/packages/binder) package which includes basic layout templates that can be customized with CSS:
```cmd
npm i -save a-wc-form-layout
```
Optional Material Web Component layout templates:
```cmd
npm i -save a-wc-form-binders-mwc
```

Example:
```html
<form-layout></form-layout><br/>
```
Next we bind data and event listeners to the form just like we would with the form-binder. See AWC Form Binder for more information.
```js
import { binderRegistry, binders } from 'a-wc-form-layout/src/index.js';

// And the control binders you wish to use. These can be custom.
binderRegistry.add(...Object.values(binders));

const formBinder = document.querySelector('form-layout');

// Give the form-layout the data
formBinder.data = {
  name: "Johnny Five", // Will require a text input
  student: true, // Will require a checkbox
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
  // Array of primitive type
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
    label: 'My Vertical Layout', // Optional label that will be output in the form
    // The VerticalLayout template takes an array of components that it will render vertically
    components: [
      {
        template: "HorizontalLayout",
        properties: {
          label: 'My Vertical Layout', // Optional label that will be output in the form
          // The HorizontalLayout template takes an array of components that it will render horizontally
          components: [
            {
              // The Control component is used to render controls
              template: "Control",
              properties: {
                ref: "#/name", // JSON pointer to data backing this control
                type: "text", // Control type (HTMLInputElement type in this case)
                label: "First Name", // Control label
                description: "Please enter your name", // Control description
                minLength: 3, // min text length
                maxLength: 30, // max text length
                pattern: "^[a-z|A-Z]+$" // Regex validation pattern
              }
            },
            {
              // Number control
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
              // Date control
              template: "Control",
              properties: {
                ref: "#/birthDate",
                type: "date"
              }
            },
            {
              // Boolean control
              template: "Control",
              properties: {
                ref: "#/student",
                type: "checkbox"
              }
            },
            {
              // Single select
              template: 'Control',
              properties: {
                label: 'Enum label',
                description: 'Enum description',
                possibleValues: ['pizza', 'cheese', 'humus'],
                readOnly: false,
                ref: '#/favoriteFood',
                type: 'text',
                validation: {
                  required: false,
                },
              },
            },
            {
              // Multi select
              template: 'ArrayControl',
              properties: {
                label: 'ArrayControl label',
                description: 'ArrayControl description',
                possibleValues: ['pizza', 'cheese', 'humus'],
                readOnly: false,
                ref: '#/favoriteFoods',
                validation: {
                  required: false,
                },
              },
            },
            {
              // Textarea control
              template: 'Textarea',
              properties: {
                description: 'description description',
                label: 'description label',
                ref: '#/description',
                cols: 20,
                rows: 5,
                readOnly: false,
                validation: {
                  minLength: 10,
                  maxLength: 50,
                  required: true,
                },
              },
            },
          ]
        }
      },
      {
        template: 'GridLayout', // Layout components in a CSS Grid layout
        properties: {
          columns: 16, // Optional. Change the number of columns from the default 12 column grid. Can also be set using the --form-grid-layout-columns CSS variable.
          gap: '1rem', // Optional. Change the grid gap from the default of 16px. Can also be set using the --form-pad CSS variable.
          flow: 'column', // Optional. Default 'row'. The direction the grid will render the component.
          dense: true, // Optional. Default false. CSS Grid will attempt to fill all cells with the component Will even render the component out of order to do so.
          label: 'My Grid layout', // Optional label that will be output in the form
          // The GridLayout template takes an array of components that it will render in the grid
          components: [
            {
              column: 1, // Optional. The column index to insert this component in the grid. Will default to the next available grid cell.
              columns: 1, // Optional. Default is 1. The number of columns this component should span in the grid
              row: 1, // Optional. The row index to insert this component in the grid. Will default to the next available grid cell.
              rows: 1, // Optional. The number of rows this component should span in the grid.
              // The component to insert into the grid is now defined just like in the other layouts.
              component: {
                template: "Control",
                properties: {
                  ref: "#/student",
                  type: "checkbox"
                }
              }
            },
            {
              columns: 4,
              component: {
                template: 'Control',
                properties: {
                  ref: '#/address/0',
                  label: 'Unit',
                  type: 'number',
                },
              },
            },
            {
              columns: 4,
              component: {
                template: 'Control',
                properties: {
                  type: 'text',
                  label: 'Tel #',
                  pattern: '\\d{3}-\\d{3}-\\d{4}',
                },
              },
            },
            {
              columns: 4,
              component: {
                template: 'Control',
                properties: {
                  type: 'date',
                  label: 'Date 1',
                  ref: 'date',
                },
              },
            },
            {
              columns: 4,
              component: {
                template: 'Control',
                properties: {
                  type: 'date',
                  label: 'Date 2',
                  ref: 'date',
                },
              },
            },
            {
              columns: 4,
              component: {
                template: 'Control',
                properties: {
                  type: 'date',
                  label: 'Date 3',
                  ref: 'date',
                },
              },
            },
          ],
        },
      },
      {
        template: "HorizontalLayout",
        properties: {
          components: [
            {
              template: "Control",
              properties: {
                ref: "#/occupation",
                possibleValues: [ // When possibleValues are supplied a select input is rendered by the included templates
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
        template: "GridComponent", // used to render Array of same Objects e.g. data grid
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
import { binderRegistry } from "a-wc-form-binder";

// import Material Web Component control binders
import 'a-wc-form-binders-mwc/src/lib/control-binders.js';
``` -->

## Custom components and templates

Create a template. Here's a div being used as a checkbox.

```js
import { setComponentTemplate, html } from 'a-wc-form-layout';

// Templates are lit-html
const toggleTemplate = (context) => html`
  <div bind=${context.component.properties.ref} class="my-toggle" style="border: 1px solid black;"></div>
`;
// Register the template so that it can be used in a component in the layout
setComponentTemplate("Toggle", toggleTemplate);
```
In the above code, if there was already a template called Toggle registered it would be overwritten with the new one.

Set up data binding using a-wc-form-binder
```js
import { binderRegistry } from "a-wc-form-layout";

// Create the binder
const divToggleBinding = {
  controlSelector: "div.my-toggle",
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
binderRegistry.add(divToggleBinding);
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
