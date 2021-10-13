# AWC Form Binder
Simple to use web component that binds data to form controls with validation.

## Usage

Install core package which includes standard HTML Input control binders:
```cmd
npm i -save a-wc-form-binder
```
Optional package with Material Web Component control binders:
```cmd
npm i -save a-wc-form-binders-mwc
```

Example:
```html
<form-binder>
  <!-- Controls are bound to data by assigning a JSON pointer to the bind attribute of the control -->
  <input bind="/name/first" min-length="3" />
  <input bind="/name/second" />
  <!-- Anything can be bound to data by JSON pointer as long as a custom binder is defined to handle the case. More on custom control binders later. -->
  <div bind="/name/first"></div>
  <!-- Auxiliary attributes can also be bound. These attributes start 'bind-attr:' and are single way binders that do not use control binders -->
  <input bind="/name/second" bind-attr:disabled="/canEdit" /> <!-- Will add disabled attribute if canEdit is true -->
  <input bind="/age" bind-attr:min="/minAge" /> <!-- set the min attribute to the value of the minAge property in the data -->
</form-binder>
```
```js
// Import the binder registry and the binders you which to use.
import { binderRegistry, binders } from "a-wc-form-binder";

// And the control binders you wish to use. These can be custom.
// Here we're adding the binders for native HTML Form controls (INPUT, SELECT, etc.)
binderRegistry.add(...Object.values(binders));

const formBinder = document.querySelector('form-binder');

// Give the form-binder the data
formBinder.data = {
  name: { first: 'foo', second: 'bar' }
}

// Listen for changes to the data
formBinder.addEventListener('form-binder-change', e => console.info(e.detail.data));

// Patch data to update certain values
formBinder.patch({ name: { first: 'fred' }});

// Can also patch using a Map of JSON Pointers/values
formBinder.patch(new Map([['/name/first', 'fred']]));

// Can also patch using an Array of JSON Pointer/value Tuples
formBinder.patch([['/name/first', 'fred']]);

// Can also set the data again
formBinder.data = {
  name: { first: 'fred', second: 'bar' }
}

// Revert any user changes or patches made to the data
formBinder.reset();

// Listen for and display validation errors
formBinder.addEventListener('form-binder-report-validity', event => {
  /** @type {import('a-wc-form-binder/src/lib/control-validator').FormValidationResult} */
  const { errors, isValid, result } = event.detail;
  console.info(errors);
  // Here you would translate and display errors
  // More in-depth example later in Handling and displaying errors
});
```

Form-binder takes a JSON data object as input and outputs a CustomEvent (form-binder-change) that contains a copy of the data with any changes made it.
Form controls are bound to the data by setting the bind attribute of the form control as a JSON pointer to the data.

NOTE: The data input must serialize to valid JSON. The form binder works on a copy of the data. The copy is made using the native JSON API (stringify+parse).

## Binders

The process of binding is performed by binders. These need to be registered. When a binder is registered it is done so with a CSS selector. Any control that matches the CSS selector will use that binder for binding (see Custom control binders below for examples). a-wc-form-binder package includes binders for standard HTML form elements (input, select, text-area). To bind other controls you will need custom binders. See the a-wc-binders-mwc for Material Web Component binders.

## Material Web Component control binders

```js
import { binderRegistry } from "a-wc-form-binder";

// import Material Web Component control binders
import { binders } from 'a-wc-form-binders-mwc';

// Register all of the MWC control binders
binderRegistry.add(...Object.values(binders));

// Or just add specific binders
binderRegistry.add(binders.sliderBinder)
```

## Custom control binders

The process of binding data to controllers needs to be defined and implemented. This is done through binders.
A single binder is made up of the following parts:
- CSS Selector (controlSelector) that maps the binder to the controls. If a binder matches a control then a control binding is created
- A function (initializeEvents) to listen to value changes on the control, and pass the new data values to an onChange callback
- A function (writeValue) to write a value to the control

Here is an example binder for a using a DIV element as boolean toggle when it is clicked:

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
import { binderRegistry } from "a-wc-form-binder";

binderRegistry.add(divToggleBinding);
```

Control binders can also be removed when they are no longer needed:
```js
import { binderRegistry } from "a-wc-form-binder";

binderRegistry.remove(divToggleBinding);
```

NOTE: Binders are evaluated in the order they are added. The first binder with a selector that matches a control will be used to create a control binding.

## Validation

form-binder loosely implements the HTML5 constraint validation methods checkValidity and reportValidity.

```js
const formBinder = document.querySelector('form-binder');
await formBinder.checkValidity(); // Returns a Promise<boolean> if form is valid or not
await formBinder.reportValidity(); // Returns a Promise<FormValidationResult> and give a message to the user if invalid
```

## Handling and displaying errors

form-binder doesn't display errors on the screen. This has to be implemented by localizing the errors and displaying them to the user.

```js
const formBinder = document.querySelector('form-binder');
formBinder.addEventListener('form-binder-report-validity', event => {
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
          .map(controlValidator => translate(controlValidator.name)) // Translate here
          .join(","));
    });
});
```

## Validators

### Greater than
Validates that a controls value is greater than another property in the data.

```js
<input type="date" bind="/date/to" greater-than="/date/from" />
```

### Less than
Validates that a controls value is less than another property in the data.

```js
<input type="date" bind="/date/from" less-than="/date/to" />
```

### Max length
Validates that a controls value has no more characters than the value of this validator.

```js
<input bind="/name" max-length="30" />
```

### Min length
Validates that a controls value has at least the number of characters as the value of this validator.

```js
<input bind="/name" min-length="30" />
```

### Max
Validates that a controls value is no more than the value of this validator.

```js
<input type="number" bind="/age" max="20" />
```

### Min
Validates that a controls value is no less than the value of this validator.

```js
<input type="number" bind="/age" min="18" />
```

### Pattern
Validates that a controls value matches the Regular Expression value of this validator.

```js
<input bind="/lowercaseName" pattern="^[a-z]*$" />
```

### Required
Validates that a controls value is required and can not be falsy.

```js
<input bind="/lastName" required />
```

## Custom Validation

Form-binder allows for custom validation. Just like the control binders, validators can be registered that target controls by CSS selector.

A single control validator is made up of the following parts:
- CSS Selector (controlSelector) that maps the binder to the controllers to validate
- A function (validate) to check if the control value is valid or not and returns a ValidationResult.

Example validator:

```js
import { ValidationResult, validatorRegistry } from "a-wc-form-binder";

// Define the validator
const validateLowerCase = {
  controlSelector: "[lower-case]",
  validate: (control, value, data) => {
    const result = /^[a-z]*$/.test(value);
    // ValidationResult params are (unique name, expected value, actual value, is valid)
    // expected and actual values are the data values. null can be passed for expected if it is not known
    return new ValidationResult("lower-case", null, value, result);
  }
};

// register the validator
validatorRegistry.add(validateLowerCase);

// un-register the validator if no longer needed
validatorRegistry.remove(validateLowerCase);
```
## Custom cross-field validation

Let say we want to odo some cross field validation in the form:

```html
<input type="number" bind="/from" />
<input type="number" bind="/to" greater-than="/from" />
```

Below is an example of validation that uses another field in calculating validity:

```js
import { validatorRegistry, ValidationResult } from "a-wc-form-binder";

// Define the greater than validator
const greaterThanValidator = {
  controlSelector: "[greater-than]",
  validate: (control, value, data) => {
    const otherField = control.getAttribute("greater-than");
    const otherValue = getValue(data, otherField);
    const isValid = value > otherValue;

    return new ValidationResult(
      "greater-than",
      otherField,
      value,
      isValid
    );
  }
};

// register the validator
validatorRegistry.add(greaterThanValidator);

```

## Asynchronous validator example
form-binder also supports asynchronous validator results. Simply return a Promise from Validator validate function.
Example that asynchronously checks the value equals 'foobar'.
```js
import { validatorRegistry, ValidationResult } from "a-wc-form-binder";

// Define the greater than validator
const asyncValidator = {
  controlSelector: "[async-validator-foobar]",
  validate: (control, value, data) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(new ValidationResult(
        "async-validator-foobar",
        "foobar",
        value,
        "foobar" === value
      )));
    });
  }
};

// register the validator
validatorRegistry.add(asyncValidator);

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
| patch | void | Can be passed partial data to update parts of the data model. Pass an Object that has the same structure as the data model to be changed bu only the properties you want to update are present. Alternatively, you can pass a Map\<string, unknown> or an Array of Tuple<string, unknown> where the key is JSON pointer to the data item and the key is the value to set. |
| reset | void | Reverts any user changes or patches made to the data. |
| addControl | void | Can be called to manually bind a control to a form. |
| updateControlValue | void | Manually updates a control with the value in the data. Triggers reportValidity if the user has visited/touched the control. |
| updateControlValues | void | Manually updates all bound controls with the value in the data. Triggers reportValidity if the user has visited/touched the control. |
| validateControlValue | Promise/<import("a-wc-form-binder/src/lib/control-validator.js").ValidationControlResult> | Starts a validity check of a controller. No reporting is performed. |
| validate | Promise\<import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult> | Starts a validity check of all bound controllers. No reporting is performed. |
| checkValidity | Promise\<boolean> | Starts a validity check of all bound controllers. No reporting is performed. |
| reportValidity | Promise\<import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult> | Starts a validity check of all bound controllers. Reporting is performed. |
| reportErrors | void | Given a import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult will dispatch a form-binder-report-validity event |

## Events
| Name | Detail | Description |
| ---- | ------ | ----------- |
| form-binder-change          | data              | event.detail.data references a copy of the original data that has new values applied to it. |
|                             | validationResults | event.detail.validationResults validation was performed as part of the change process.      |
| form-binder-report-validity | import("a-wc-form-binder/src/lib/control-validator.js").FormValidationResult | Should be listened to to update the UI with messages. |

## Styles
Since there is no shadow DOM applied, you are free to style the form-binder.

Optional basic styling is provided via a lit-element [CSSResult](https://lit-element.polymer-project.org/api/classes/_lit_element_.cssresult.html).
If using LitElement, they can be applied like so:

```js
import { formCss } from 'a-wc-form-binder';
...
/** @inheritdoc */
    static get styles() {
      return [
        ...formCss.allCss
      ];
    }
```