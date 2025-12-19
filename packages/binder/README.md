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
  <input type="date" bind="/start" bind-attr:max="/end" /> <!-- Date range constraint example -->
  <input type="date" bind="/end" bind-attr:min="/start" />
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
formBinder.addEventListener('form-binder:change', e => {
  const { data, jsonPointer, value, validationResults} = e.detail; 
  console.info( data, jsonPointer, value, validationResults ));
}

// Patch data to update certain values
formBinder.patch({ name: { first: 'fred' }});

// Can also patch using a Map of JSON Pointers/values
formBinder.patch(new Map([['/name/first', 'fred']]));

// Can also patch using an Array of JSON Pointer/value Tuples
formBinder.patch([['/name/first', 'fred']]);

// Can also set the data again
formBinder.data = {
  name: { first: 'fred', second: 'bar', middle: 'foo' }
};

// Revert any user changes or patches made to the data
formBinder.rollback();

// Commit changes to create a new point that can be rolled back to
formBinder.commit();

// Get changes to data since form was created or last commit
formBinder.getPatch(); // As Object
formBinder.getPatchAsMap(); // As Map of JSONPointer/value pairs
formBinder.getPatchAsArray(); // As Array of Tuples (JSONPointer/value pairs)

// Listen for and display validation errors
formBinder.addEventListener('form-binder:report-validity', event => {
  /** @type {import('a-wc-form-binder/src/lib/control-validator').FormValidationResult} */
  const { errors, isValid, result } = event.detail;
  console.info(errors);
  // Here you would translate and display errors
  // More in-depth example later in Handling and displaying errors
});
```

Form-binder takes a JSON data object as input and outputs a CustomEvent (form-binder:change) that contains a copy of the data with any changes made it.
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
- A function (reportValidity) [optional] to report validation state and messages to the control

Here is an example binder for a using a DIV element as boolean toggle when it is clicked:

```js
const divToggleBinding = {
  controlSelector: "div.my-toggle",
  initializeEvents: (control, onChange) =>
    control.addEventListener("click", e => {
      control.toggleValue = !control.toggleValue;
      onChange(control.toggleValue);
      // Optionally pass a partial JSON pointer the the changed property
      // This can be used if the control is bing a complex object
      // such as a grid control 
      // onChange(newValue, { ref: 'nested/pointer' })
      // This nested JSON point would then get concatenated with the JSON pointer assigned to the control itself.
    }),
  writeValue: (control, value) => {
    control.toggleValue = value;
  },
  reportValidity: (control, validationResults) => {
    // Optional: Report validation state to the control
    // validationResults is an array of ValidationResult objects from all validators
    const invalid = validationResults.find(r => r.valid === false);
    if (invalid && invalid.message) {
      // Set error message on control
      control.setAttribute('data-error', invalid.message);
      control.classList.add('error');
    } else {
      // Clear error message
      control.removeAttribute('data-error');
      control.classList.remove('error');
    }
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
/** @type {import('a-wc-form-binder/src/lib/validator-registry.js').Validator} */
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

## Custom Validator Messages

Validators can optionally provide custom error messages by passing a fifth parameter to the ValidationResult constructor. These messages are then passed to the binder's `reportValidity` function, allowing the binder to display user-friendly error messages.

Example validator with custom message:

```js
import { ValidationResult, validatorRegistry } from "a-wc-form-binder";

/** @type {import('a-wc-form-binder/src/lib/validator-registry.js').Validator} */
const validateMinLength = {
  controlSelector: "[custom-min-length]",
  validate: (control, value, data) => {
    const minLength = parseInt(control.getAttribute("custom-min-length") || "0");
    const isValid = value && value.toString().length >= minLength;
    
    // Fifth parameter is the optional custom error message
    const message = isValid ? undefined : `Value must be at least ${minLength} characters`;
    
    return new ValidationResult(
      "custom-min-length",
      minLength,
      value?.length || 0,
      isValid,
      message  // Custom error message
    );
  }
};

validatorRegistry.add(validateMinLength);
```

When validation runs, the form-binder will call the binder's `reportValidity` function with all validation results for that control. The binder can then choose how to display these messages:

```js
// Example binder that uses HTML5 constraint validation API
const textInputBinder = {
  controlSelector: 'input[type=text]',
  initializeEvents: (control, onChange) => {
    control.addEventListener('change', e => onChange(e.target.value));
  },
  writeValue: (control, value) => {
    control.value = value || '';
  },
  reportValidity: (control, validationResults) => {
    // Find first invalid result
    const invalid = validationResults.find(r => r.valid === false);
    
    if (invalid && invalid.message) {
      // Set the custom validation message
      control.setCustomValidity(invalid.message);
    } else if (!invalid) {
      // Clear the message when valid
      control.setCustomValidity('');
    }
  }
};
```

The `reportValidity` function receives an array of all `ValidationResult` objects for the control, giving the binder flexibility to:
- Display the first error message
- Display all error messages
- Prioritize certain types of errors
- Implement custom UI patterns for error display

## Custom cross-field validation

Let say we want to do some cross field validation in the form:

```html
<input type="number" bind="/from" />
<input type="number" bind="/to" greater-than="/from" />
```

Below is an example of validation that uses another field in calculating validity:

```js
import { jsonPointer, validatorRegistry, ValidationResult } from "a-wc-form-binder";

// Define the greater than validator
/** @type {import('a-wc-form-binder/src/lib/validator-registry.js').Validator} */
const greaterThanValidator = {
  controlSelector: "[greater-than]",
  validate: (control, value, data) => {
    const otherField = control.getAttribute("greater-than");
    const otherValue = jsonPointer.getValue(data, otherField);
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
/** @type {import('a-wc-form-binder/src/lib/validator-registry.js').Validator} */
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

## If the control evaluates and displays its own validity

Sometimes validation and the displaying of error messages is taken care of outside of the form binder. An example might be controls handling their own validity (like HTML [constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation)) and message rendering. In these cases the form-binder validation can conflict if it also runs the same/similar validation against the component.
To resolve this we need to disable the form-binder validation. We can do this by clearing unwanted form-binder validators.

However, the form-binder still needs to be able to know if a component is valid. We can do this with a custom validator that asks the control for its current validity state.

Here is the example custom validator that simply asks the control if it is valid and assumes that the control has taken care of its own validation checks and validation message rendering.

```js
import { validatorRegistry, ValidationResult } from "a-wc-form-binder";

// Clear any validators that we don't want. Here we'll just remove them all
validatorRegistry.clear();

// For this example we assume the component uses the HTML constraint validation API and we're going to defer to it
/** @type {import('a-wc-form-binder/src/lib/validator-registry.js').Validator} */
const nativeValidityValidator = {
    // In this example we want this to apply to all controls so we use '*' CSS selector
    controlSelector: '*',
    validate: (control, value, data) => {
        // First make sure that the control is implementing the HTML 
        const input = /** @type {HTMLInputElement} */ (control);
        if (input.checkValidity) {
            // Call the HTML constraint validation API
            const isValid = input.checkValidity();
            const result = new ValidationResult('native-validity', true, isValid, isValid);
            return result;
        }
        return new ValidationResult('native-validity', null, null, true);
    },
};

// register the validator
validatorRegistry.add(nativeValidityValidator);
```

The form-binder will now use the controls own validation state to decide if the form is valid of not.
In this case form-binder would not be handling and displaying error messages as we are assuming the control does that for us.

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
| getPatch | Partial<TData> | data changed as a partial object since data was set or commit() was called. |
| getPatchAsMap | Map<string, unknown> | data changed as a JSONPoint/value Map since data was set or commit() was called. |
| getPatchAsArray | Array<[string, unknown]> | data changed as an Array or Tuple (JSONPointer/value) since data was set or commit() was called. |
| rollback | void | Reverts any user changes or patches made to the data. |
| commit | void | Clears the currently recorded changes and sets the current state as the new baseline. It does not clear the data changes themselves. You might use this if the user saves the form and you want to mark the form as unchanged. If rollback() is called the form will be reverted to the last time commit() was called. |
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

## Styles
Since there is no shadow DOM applied, you are free to style the form-binder.