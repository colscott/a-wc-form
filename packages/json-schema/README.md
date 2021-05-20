# a-wc-form-json-schema

A JSON Schema form binder web component. Can be used anywhere you can use web components.

a-wc-form-json-binder is responsible for binding and validating data to form controls.
a-wc-form-json-schema extends a-wc-form-json-binder and is responsible for rendering controls based on JSON schema and JSON ui Schema.

Extends a-wc-form-binder to use a [JSON Schema](https://json-schema.org/) to automatically create inputs based on the schema data types. Validation defined in the JSON schema can also applied to the form controls.
uiSchema JSON can be provided (similar to [JSONForms](https://jsonforms.io/docs/uischema)) which is a set of instructions on how a-wc-form-json-schema should layout the form.
Controls used for JSON schema data types can be customized.


```cmd
npm i -save a-wc-form-json-schema
```

Example excluding using ui schema:
```html
<form-binder>
  <!-- Each json-schema-control will create the control for the data type from a set  -->
  <json-schema-control ref="/name/first"></json-schema-control>
  <json-schema-control ref="/name/second"></json-schema-control>
  <!-- json-schema-control can also render branches or even the whole schema -->
  <json-schema-control ref="#"></json-schema-control>
  <!-- Bypass json-schema-form completely but still take advantage of a-wc-form-binder data binding and validation -->
  <input type="text" name="/name/middle">
</form-binder>
```
```js
import {
  controlBinder as binder
  controlBinders as binders,
} from "a-wc-form-json-schema";

// add the control binders to bind data to controls
binder.add(...Object.values(binders));

const jsonSchemaForm = document.querySelector('form-binder');

// Give json-schema-form the data
jsonSchemaForm.data = {
  firstName: 'foo', lastName: 'bar', middleName: '' }
}

// Defined the schema
const schema = {
  type: "object",
  properties: {
    firstName: {
      type: "string",
      title: "First Name",
      minLength: 3,
      description: "Please enter your first name"
    },
    lastName: {
      type: "string",
      title: "Last Name",
      minLength: 3,
      description: "Please enter your last name"
    },
    middleName: {
      type: "string",
      title: "Middle Name",
      minLength: 3,
      description: "Please enter your middle name"
    }
  },
  required: ["firstName", "lastName"]
}

// Give the json schema to each json-schema-control
document.querySelectorAll('json-schema-control').forEach(control => {
  control.schema = schema;
});

// Listen for changes to the data
jsonSchemaForm.addEventListener('form-binder:change', e => console.info(e.detail.data));
```

Example using layout and schema:
```html
<form-layout></form-layout>
```
```js
import {
  controlBinder as binder
  controlBinders as binders,
} from "a-wc-form-json-schema";

// add the control binders to bind data to controls
binder.add(...Object.values(binders));

const formLayout = document.querySelector('form-layout');

// Give json-schema-form the data
formLayout.data = {
  firstName: 'foo', lastName: 'bar', middleName: '' }
}

formLayout.layout = {
  type: "VerticalLayout",
  elements: [
    {
      // Specify the JsonSchemaControl as the component
      type: "JsonSchemaControl",
      ref: "#/firstName"
    },
    {
      type: "JsonSchemaControl",
      ref: "#/lastName"
    }
  ]
}

// Listen for changes to the data
formLayout.addEventListener('form-binder:change', e => console.info(e.detail.data));
```
## UI Schema
The UI Schema is a lot like the ui schema definition in [JSONForms](https://jsonforms.io/docs/uischema).
### Layouts
Example that has a a vertical layout containing two horizontal layouts:
```js
const uiSchema = {
  // Layouts are of type 'Horizontal'|'Vertical'|'Label' or you can create custom Layout types
  type: "Vertical", // Key to find the layout template for rendering. Custom layouts types can be added and used
  parameters: { // Parameters can be used to pass custom data to the template
    foobar: 'example parameter'
  },
  elements: [ // Nested templates to render in this layout
    {
      type: "Horizontal",
      elements: [
        {
          type: "Control", // Type Control is defers the template used to the schema data type
          ref: "#/firstName" // JSON pointer to the data 
        },
        {
          type: "Control",
          ref: "#/lastName"
        },
      ],
      parameters: { // Parameters can be used to pass data to the template
        className: '' // This is a custom 
      }
    },
    {
      type: "Horizontal",
      elements: [
        {
          type: "Control",
          ref: "#/nationality"
        },
        {
          type: "Control",
          ref: "#/occupation",
          parameters: {
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
        }
      ]
    },
}
```

### Control

## Customizing the controls
Control UI is defined using lit-html templates which are mapped to JSON schema data types. To override a template for a given data type, create a lit-html template and update the registry map.

Example mapping mwc-textfield to the data type string:
```js
import "@material/mwc-textfield/mwc-textfield.js";
import { getSchema, isRequired, controlTemplates } from "a-wc-form-json-schema";

/**
 * @param {import('a-wc-form-binder/src/lib/json-ui-schema-models').JsonUiSchemeControlContext} context
 * @returns {import('lit-html').TemplateResult}
 */
function stringControl(context) {
  const currentSchema = getSchema(
    context.rootSchema,
    context.currentUiSchema.ref
  );
  const isRequired = isRequired();
  return html`
    <mwc-textfield
      type="text"
      name="${context.currentUiSchema.ref}"
      minlength="${ifDefined(currentSchema.minLength)}"
      maxlength="${ifDefined(currentSchema.maxLength)}"
      ?required=${isRequired(context)}
      pattern=${ifDefined(currentSchema.pattern)}
      label=${ifDefined(currentSchema.title)}
      ?readonly=${currentSchema.readOnly === true}
    ></mwc-textfield>
  `;
}

controlTemplates.set("string", stringControl);
```

## Customizing layouts
Layout UI is defined using lit-html templates which are mapped to ui schema types. To override a template for a given data type, create a lit-html template and update the registry map.

Example overriding the horizontal layout:
```js
import { layoutTemplates } from "a-wc-form-json-schema";

/**
 * @param {import('a-wc-form-binder/src/lib/json-ui-schema-models').JsonUiSchemeLayoutContext} context
 * @returns {import('lit-html').TemplateResult}
 */
function horizontalTemplate(context) {
  return html`
    <div style="display:flex;">
      <span>${context.currentUiSchema.label || ''}</span>
      ${context.currentUiSchema.elements.map(element =>
        getTemplate({
          currentData: context.data,
          currentUiSchema: element,
          data: context.data,
          rootSchema: context.rootSchema,
          rootUiSchema: context.rootUiSchema
        })
      )}
    </div>
  `;
}

layoutTemplates.set("Horizontal", horizontalLayout);
```

## Extending ui schema layouts
It's possible to easily add more layouts.

Example grid layout
```js
import { layoutTemplates } from "a-wc-form-json-schema";

/**
 * @param {import('a-wc-form-binder/src/lib/json-ui-schema-models').JsonUiSchemeLayoutContext} context
 * @returns {import('lit-html').TemplateResult}
 */
function gridTemplate(context) {
  // the context gives you access to schema
  const currentUiSchema = context.currentUiSchema;

  return html`
    <div style="display:grid;">
      ${currentUiSchema.element.map(element => {
        return html`...implementation here`
      })}
    </div>
  `;
}

// Add custom ui templates to the layoutTemplates
layoutTemplates.set("Grid", gridLayout);
```