# AWC Form Binder
Simple to use web component that binds data to form controls with validation.

## Usage

Install core package which includes HTML standard control binders:
```cmd
npm i -save a-wc-form-binder
```
Optional Material Web Component binders:
```cmd
npm i -save a-wc-form-binders-mwc
```

Example:
```html
<form-binder>
  <!-- controls are bound to data by assigning JSON pointers to the name of the control -->
  <input bind="/name/first" />
  <input bind="/name/second" />
  <!-- Even custom controls can be bound to data by name so long as a custom binder is defined to handle the case. More on custom control binders later. -->
  <div bind="/name/first"></div>
</form-binder>
```
```js
// Import the binder registry and the binders you which to use.
import {
  controlBinder as binder
  controlBinders as binders,
} from "a-wc-form-binder";

// And the control binders you wish to use. These can be custom.
// Here we're adding the binders for native HTML Form controls (INPUT, SELECT, etc.)
binder.add(...Object.values(binders));

const formBinder = document.querySelector('form-binder');

// Give the form-binder the data
formBinder.data = {
  name: { first: 'foo', second: 'bar' }
}

// Listen for changes to the data
formBinder.addEventListener('form-binder:change', e => console.info(e.detail.data));
```

Form-binder takes a JSON data object as input and outputs a CustomEvent (form-binder:change) that contains a copy of the data with any changes made it.
Form controls are bound to the data by setting the name of the form control as a JSON pointer to the data.

NOTE: The data input must serialize to valid JSON. The form binder works on a copy of the data. The copy is made using the native JSON API (stringify+parse).

## Binders

The process of binding is performed by control binders. These need to be registered. When a binder is registered it is done so with a CSS selector. Any control that matches the selector will use that binder for binding (see Custom control binders below for examples). a-wc-form-binder package contains binders for standard HTML form elements (input, select, text-area). To bind other controls you'll need custom binders. See the a-wc-binders-mwc for Material Web Component binders.

## Material Web Component control binders

```js
import { controlBinder as binder } from "a-wc-form-binder";

// import Material Web Component control binders
import { controlBinders as binders } from 'a-wc-form-binders-mwc';

// Register all of the MWC control binders
binder.add(...Object.values(binders));

// Or just add specific binders
binder.add(binders.sliderBinder)
```

## Custom control binders

The process of binding data to controllers needs to be defined and implemented. This is done through control binders.
A single control binder is made up of the following parts:
- CSS Selector that maps the binder to the controls
- A function (initializeEvents) to listen to value changes on the control, and pass the new data values to an onChange callback
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

form-binder loosely implements the HTML5 constraint validation methods checkValidity and reportValidity.

```js
const formBinder = document.querySelector('form-binder');
formBinder.checkValidity(); // Returns a boolean if form is valid or not
formBinder.reportValidity(); // Returns a FormValidationResult and give a message to the user if invalid
```

## Handling and displaying errors

form-binder doesn't display errors on the screen. This has to be implemented by localizing the errors and displaying them to the user.

```js
const formBinder = document.querySelector('form-binder');
formBinder.addEventListener('form-binder:report-validity', event => {
  /** @type {import('a-wc-form-binder/src/lib/control-validator').FormValidationResult} */
  const { errors, isValid, result } = event.detail;
  errors
  // Optionally only show errors for controls the user has visited/touched
  // .filter(controlValidationResult => controlValidationResult.visited)
    .forEach(controlValidationResult => {
      const { control, controlValidationResults, visited } = controlValidationResult;
      // Here you would translate the errors and output them somewhere in the UI
      // The example outputs in UI using the native API, setCustomValidity
      control.setCustomValidity(controlValidationResults
          .filter()
          .map(controlValidator => translate(controlValidator.name)) // Translate here
          .join(","));
    });
});
```

## Custom Validation

As well as trying to use native constraint validation, form-binder allows for custom validation. Just like the control binders, validators can be registered that target controls by CSS selector.

A single control validator is made up of the following parts:
- CSS Selector that maps the binder to the controllers to validate
- A function (validate) to check if the control value is valid or not and returns a ValidationResult

Example validator:

```js
import { controlValidator } from "a-wc-form-binder";

// Define the validator
const validateLowerCase = {
  controlSelector: "[lower-case]",
  validate: (control, value) => {
    const result = /^[a-z]*$/.test(value);
    return new controlValidator.ValidationResult("lower-case", true, result, result);
  }
};

// register the validator
controlValidator.add(validateLowerCase);

// unregister the validator if no longer needed
controlValidator.remove(validateLowerCase);
```
## Custom cross-field validation
Below is an example of validation that uses another field in calculating validity:
```js
import { controlValidator } from "a-wc-form-binder";

// Define the greater than validator
const greaterThanValidator = {
  controlSelector: "[greater-than]",
  validate: (control, value, data) => {
    const otherField = control.getAttribute("greater-than");
    let isValid = false;
    const otherValue = getValue(data, otherField);
    if (typeof value === "number") {
      isValid = value > otherValue;
    }
    if (isIsoDate(value) && isIsoDate(otherValue)) {
      isValid = new Date(value) > new Date(otherValue);
    }

    return new controlValidator.ValidationResult(
      "greater-than",
      otherField,
      value,
      isValid
    );
  }
};

// register the validator
controlValidator.add(greaterThanValidator);

```

Usage:
```html
<input type="number" bind="#/from" />
<input type="number" bind="#/to" greater-than="#/from" />
```

## Asynchronous validator example
form-binder also supports asynchronous validator results. Simply return a Promise from Validator validate function.
Example that asynchronously checks the value equals 'foobar'.
```js
import { controlValidator } from "a-wc-form-binder";

// Define the greater than validator
const asyncValidator = {
  controlSelector: "[async-validator-foobar]",
  validate: (control, value, data) => {
    return new Promise(resolve => {
      resolve(new controlValidator.ValidationResult(
      "async-validator-foobar",
      "foobar",
      value,
      "foobar" === value
    ));
    });
  }
};

// register the validator
controlValidator.add(asyncValidator);

```

## API
### Attributes and properties
| Name | Type | Description |
| ---- | ---- | ----------- |
| data | property | The JSON data to bind controllers to |

### Methods
| Name | Return type | Description |
| ---- | ---- | ----------- |
| getControls | Array<Element> | Gets the controls that have been bound to the form |
| patch | void | Can be passed partial data to update parts of the data model. Pass an Object that has the same structure as the data model to be changed bu only the properties you want to update are present. Alternatively, you can pass a Map\<string, unknown> where the key is JSON pointer to the data item and the key is the value to set. |
| addControl | void | Can be called to manually bind a control to a form. |
| updateControlValue | void | Manually updates a control with the value in the data. Triggers reportValidity if the user has visited/touched the control. |
| updateControlValues | void | Manually updates all bound controls with the value in the data. Triggers reportValidity if the user has visited/touched the control. |
| validateControlValue | Promise/<import("a-wc-form-binder/src/lib/control-validator.js").ValidationControlResult> | Starts a validity check of a controller. No reporting is performed. |
| validate | Promise\<import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult> | Starts a validity check of all bound controllers. No reporting is performed. |
| checkValidity | Promise\<boolean> | Starts a validity check of all bound controllers. No reporting is performed. |
| reportValidity | Promise\<import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult> | Starts a validity check of all bound controllers. Reporting is performed. |
| reportErrors | void | Given a import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult will dispatch a form-binder:report-validity event |

## Events
| Name | Detail | Description |
| ---- | ------ | ----------- |
| form-binder:change          | data              | event.detail.data references a copy of the original data that has new values applied to it. |
|                             | validationResults | event.detail.validationResults validation was performed as part of the change process.      |
| form-binder:report-validity | import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult | Should be listened to to update the UI with messages. |
