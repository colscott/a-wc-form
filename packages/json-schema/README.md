# AWC JSON Schema Form

A JSON Schema form binder web component. Can be used anywhere you can use web components.

Generates form controls, and optionally form layout, from [JSON Schema](https://json-schema.org/) data.

Extends [a-wc-form-binder](https://github.com/colscott/a-wc-form/tree/master/packages/binder) to use a [JSON Schema](https://json-schema.org/) to automatically create form controls based on the schema data types. Validation defined in the JSON schema is also applied to the form controls.
([a-wc-form-layout](https://github.com/colscott/a-wc-form/tree/master/packages/layout)) can be provided which is a set of instructions on how a-wc-form-json-schema should layout the form. Or you can create the form with normal HTML.
Controls used for JSON schema data types can be customized.

## Usage
```cmd
npm i -save a-wc-form-json-schema
```

### Using form-binder
Example of binding data to JSON Schema generated form controls. This example does not use [a-wc-form-layout](https://github.com/colscott/a-wc-form/tree/master/packages/layout) and instead relies on you to manually create the form control structure using [a-wc-form-binder](https://github.com/colscott/a-wc-form/tree/master/packages/binder).
#### HTML
```html
<form-binder>
  <!-- Each json-schema-control will create the control for the data type from a set  -->
  <json-schema-control ref="/name/first"></json-schema-control>
  <json-schema-control ref="/name/second"></json-schema-control>
  <!-- json-schema-control can also render branches or even the whole schema -->
  <json-schema-control ref="#"></json-schema-control>
  <!-- Opt out of json-schema-form but still take advantage of a-wc-form-binder data binding and validation -->
  <input type="text" bind="/name/middle">
</form-binder>
```
#### Javascript
See [a-wc-form-binder](https://github.com/colscott/a-wc-form/tree/master/packages/binder) package for more info on binders and validation.
```js
import { binderRegistry binders } from "a-wc-form-binder";
import "a-wc-form-json-schema/src/components/json-schema-control.js";

// add the control binders to bind data to controls
binderRegistry.add(...Object.values(binders));

const formBinder = document.querySelector('form-binder');

// Give form-binder the data
formBinder.data = {
  firstName: 'foo', lastName: 'bar', middleName: '' }
}

// Defined the schema - here we simply declare it inline but you might load it from somewhere like an OpenAPI spec file
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
// OR set the schema once on the form-binder
formBinder.schema = schema;

// Listen for changes to the data
jsonSchemaForm.addEventListener('form-binder:change', e => console.info(e.detail.data));
```

The json-schema-control web component uses [a-wc-form-layout](https://github.com/colscott/a-wc-form/tree/master/packages/layout) templates to render controls based on a properties data types.

### Using form-layout
A new [a-wc-form-layout](https://github.com/colscott/a-wc-form/tree/master/packages/layout) control type, JsonSchemaControl, is available. JsonSchemaControl will render the control required for the data type as defined in the [JSON Schema](https://json-schema.org/) provided.

Example showing the use of [a-wc-form-layout](https://github.com/colscott/a-wc-form/tree/master/packages/layout) with JsonSchemaControl to layout out the form controls.
#### HTML
```html
<!-- json-schema-from extends form-layout -->
<json-schema-form></json-schema-form>
```

#### Javascript
```js
import { binderRegistry, binders } from "a-wc-form-binder";
import "a-wc-form-json-schema/src/components/json-schema-form.js";

// add the control binders to bind data to controls
binderRegistry.add(...Object.values(binders));

const jsonSchemaForm = document.querySelector('json-schema-form');

// Give json-schema-form the data
jsonSchemaForm.data = {
  firstName: 'foo', lastName: 'bar', middleName: '' }
}

// Give the json-schema-form the layout
// Optional - if not supplied then a layout will be generated from the schema
jsonSchemaForm.layout = {
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

// Give json-schema-form the schema
jsonSchemaForm.schema = {
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

// Listen for changes to the data
jsonSchemaForm.addEventListener('form-binder:change', e => console.info(e.detail.data));
```

## API - json-schema-form
### Attributes and properties
| Name | Type | Description |
| ---- | ---- | ----------- |
| data | property | The JSON data to bind controllers to |
| layout | property | The JSON layout containing the component definitions |
| schema | property | JSON Schema data which will be used for determining controls and validation to use. |

## Events
| Name | Detail | Description |
| ---- | ------ | ----------- |
| form-binder:change          | data              | event.detail.data references a copy of the original data that has new values applied to it. |
|                             | validationResults | event.detail.validationResults validation was performed as part of the change process.      |
| form-binder:report-validity | import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult | Should be listened to to update the UI with messages. |

## API - json-schema-control
### Attributes and properties
| Name | Type | Description |
| ---- | ---- | ----------- |
| schema | property | JSON Schema data which will be used for determining controls and validation to use. Optional. If missing the control will look for a parent form-binder or form-layout and look for a schema property on it to use. |

## Events
| Name | Detail | Description |
| ---- | ------ | ----------- |
| form-binder:change | data | event.detail.data references a copy of the original data that has new values applied to it. |