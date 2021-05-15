# AWC Form Binder
Simple to use web component that binds data to form controls with validation.

## Usage

Install core package which includes HTML standard control binders:
```cmd
npm i -save a-wc-form-binder
```
Optional Material Web Component binders:
```cmd
npm i -save a-wc-form-binder-material
```

Example:
```html
<form-binder>
  <!-- controls are bound to data by assigning JSON pointers to the name of the control -->
  <input name="/name/first" />
  <input name="/name/second" />
  <!-- Even custom controls can be bound to data by name so long as a custom binder is defined to handle the case -->
  <div name="/name/first"></div>
</form-binder>
```
```js
import {
  controlBinder as binder
  controlBinders as binders,
} from "a-wc-form-binder";

// And the control binders you wish to use. These can be custom.
binder.add(...Object.values(binders));

const formBinder = document.querySelector('form-binder');

// Give the form-binder the data
formBinder.data = {
  name: { first: 'foo', second: 'bar' }
}

// Listen for changes to the data
formBinder.addEventListener('form-binder:change', e => console.info(e.detail.data));
```

The form-binder takes a JSON data object as input and outputs modifications made to the data using the form-binder:change Custom Event.
Form controls are bound to the data by setting the name of the form control as a JSON pointer to the data.
In order to be able to bind data to controls, control binders need to be registered. These control binders contain code that binds a value to a specific type of controller. This package contains binders for standard HTML form elements (input, select, text-area).

NOTE: The data input must serialize to valid JSON. The form binder works on a copy of the data. The copy is made using the native JSON API (stringify/parse).

## API
### Attributes and properties
| Name | Type | Description |
| ---- | ---- | ----------- |
| data | property | The JSON data to bind controllers to |

## Events
| Name | Detail | Description |
| ---- | ------ | ----------- |
| form-binder:change | data | event.detail.data references a copy of the original data that has new values applied to it. |

## Material Web Component control binders

```js
import { controlBinder as binder } from "a-wc-form-binder";

// import Material Web Component control binders
import 'a-wc-form-binder-material/src/lib/control-binders.js';
```

## Custom control binders

The process of binding data to controllers needs to be defined and implemented. This is done through control binders.
A singe control binder is made up of the following parts:
- CSS Selector that maps the binder to the controllers
- A function (initializeEvents) to listen to value changes and pass the new data values to an onChange callback
- A function (writeValue) to write a value to the control

Here's an example binder for a using a DIV element as boolean toggle when it is clicked:

```js
const divToggleBinding = {
  controlSelector: "div.my-toggle",
  initializeEvents: (control, onChange) =>
    control.addEventListener("click", e => {
      control.toggleValue = !control.toggleValue;
      onChange(control.toggleValue)
    }),
  writeValue: (control, value) => {
    control.toggleValue = value;
  }
};
```

Then add it whenever you want to use it:
```js
import { controlBinder as binder } from "a-wc-form-binder";

binder.add(divToggleBinding);
```

Control binders can also be removed when they are no longer needed:
```js
import { controlBinder as binder } from "a-wc-form-binder";

binder.remove(divToggleBinding);
```

NOTE: Binders are evaluated in the order they are added. The first binder with a selector that matches to control will be used to bind the control.

## Validation

form-binder implements the HTML5 constraint validation methods checkValidity and reportValidity. If there are native HTML form controls in the form the native constraint validation API will be used.

```js
const formBinder = document.querySelector('form-binder');
formBinder.checkValidity(); // Returns a boolean
formBinder.reportValidity(); // Returns a boolean and give a message to the user if invalid
```

## Custom Validation

As well as trying to use native constraint validation, form-binder allows for custom validation. Just like the control binders, validators can be registered that target controls by CSS selector:

A singe control validator is made up of the following parts:
- CSS Selector that maps the binder to the controllers to validate
- A function (checkValidity) to check if the control value is valid or not
- A function (reportValidity) to check if a value is valid or not and report any invalid value to the user

Example validator:

```js
import { controlValidator as validator } from "a-wc-form-binder";

// Define the validator
const validateLowerCase = {
  controlSelector: "[lower-case]",
  checkValidity: (control, value) => {
    // Test if value is valid
    return /^[a-z]*$/.test(value);
  },
  reportValidity: (control, value) => {
    const isValid = /^[a-z]*$/.test(value);
    // Some logic to present any validation errors to the user.
    control.setCustomValidity(isValid ? '' : `Needs to be lower-case`);
    return isValid;
  }
};

// register the validator
validator.add(validateTextInput);
// unregister the validator if required
// validator.remove(validateTextInput);
```