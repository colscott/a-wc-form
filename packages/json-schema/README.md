# a-wc-form-json-schema

A JSON Schema form binder web component. Can be used anywhere you can use web components.

a-wc-form-json-binder is responsible for binding and validating data to form controls.
a-wc-form-json-schema extends a-wc-form-json-binder and is responsible for rendering controls based on JSON schema and JSON ui Schema.

Extends a-wc-form-binder to use a [JSON Schema](https://json-schema.org/) to automatically create inputs based on the schema data types. Validation defined in the JSON schema can also applied to the form controls.
Layout can be provided which is a set of instructions on how a-wc-form-json-schema should layout the form. Or you can create the form with normal HTML.
Controls used for JSON schema data types can be customized.


```cmd
npm i -save a-wc-form-json-schema
```

Example of binding data to JSON Schema generated form controls:
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

Example of enerating a form layout from JSON Schema to create a form:
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
