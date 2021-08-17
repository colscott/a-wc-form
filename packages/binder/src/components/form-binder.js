import { initialize } from "../lib/control-binder.js";
import {
  filterValidationResults,
  matchingValidators,
  add
} from "../lib/control-validator.js";
import * as validators from "../lib/validators/index.js";
import { getValue, setValue } from "../lib/json-pointer.js";
import { ShadowDomMutationObserver } from "../lib/observer.js";

// Add built-in validators
// eslint-disable-next-line guard-for-in,no-restricted-syntax
for (const validator in validators) {
  add(validators[validator]);
}

/**
 * @param {Element} element to get the name for
 * @returns {string} the name assigned to the element
 */
export function getName(element) {
  // @ts-ignore
  return element.name || element.getAttribute("name");
}

/**
 * @param {Element} parentElement to find children for
 * @returns {Array<Element>} found children
 */
function getChildElements(parentElement) {
  const elements = Array.from(parentElement.querySelectorAll("*"));
  return [
    ...elements,
    ...elements
      .filter(element => !!element.shadowRoot)
      .flatMap(element => getChildElements(element))
  ];
}

/**  */
export class FormBinder extends HTMLElement {
  /** @returns {object} that is being bound to the form controls */
  get data() {
    return this._data;
  }

  /** @param {object} data to bind to the form controls. A copy of the data is taken. */
  set data(data) {
    this._data = JSON.parse(JSON.stringify(data));
    this.updateControlValues();
  }

  /** @inheritdoc */
  connectedCallback() {
    this.setAttribute("role", "form");
    const config = { attributes: false, childList: true, subtree: true };

    /**
     * @type {MutationCallback}
     * @param {MutationRecord[]} mutationsList .
     */
    const callback = mutationsList => {
      mutationsList.forEach(mutation => {
        mutation.addedNodes.forEach(controlCandidate => {
          if (controlCandidate instanceof Element) {
            this.addControl(controlCandidate);
            getChildElements(controlCandidate).forEach(c => this.addControl(c));
          }
        });
        mutation.removedNodes.forEach(controlCandidate => {
          if (controlCandidate instanceof Element) {
            if (this.registeredControlBinders.has(controlCandidate)) {
              this.registeredControlBinders.delete(controlCandidate);
            }
            getChildElements(controlCandidate).forEach(c => {
              if (this.registeredControlBinders.has(c)) {
                this.registeredControlBinders.delete(c);
              }
            });
          }
        });
      });
    };

    this.mutationObserver = new ShadowDomMutationObserver(callback);

    this.mutationObserver.observe(this, config);

    getChildElements(this).forEach(element => this.addControl(element));
  }

  /** @inheritdoc */
  disconnectedCallback() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  /** Initialize */
  constructor() {
    super();
    /** @type {Map<Element, import('../lib/control-binder.js').ControlBinding>} */
    this.registeredControlBinders = new Map();

    /** @type {Set<Element>} controls the user has interacted with */
    this._visitedControls = new Set();

    /** @type {Map<Element, any>} controls whose values have been changed by the user */
    this._dirtyControls = new Map();

    /** @type {object} */
    this.data = null;
  }

  /** @returns {Array<Element>} controls that have been bound to the form */
  getControls() {
    return Array.from(this.registeredControlBinders.keys());
  }

  /** @param {Element} controlCandidate to bind to the form data */
  addControl(controlCandidate) {
    if (controlCandidate instanceof HTMLElement) {
      const binder = initialize(
        controlCandidate,
        this.handleControlValueChange.bind(this),
        this.controlVisited.bind(this)
      );
      if (binder) {
        this.registeredControlBinders.set(controlCandidate, binder);
        if (this.data) {
          this.updateControlValue(controlCandidate);
        }
      }
    }
  }

  /** @param {Element} control to update the value of. If control has been visited then validation is invoked. */
  updateControlValue(control) {
    const binder = this.registeredControlBinders.get(control);
    if (binder) {
      const value = getValue(this.data, getName(control));
      binder.binder.writeValue(control, value);
      if (this._visitedControls.has(control)) {
        // Run validity check as task to give custom controls chance to initialize (e.g. MWC)
        setTimeout(() => this.reportValidity());
      }
    }
  }

  /** Updates the values of all control values */
  updateControlValues() {
    this.registeredControlBinders.forEach((binder, control) => {
      this.updateControlValue(control);
    });
  }

  /**
   * @param {import("../lib/control-binder.js").ControlElement} control
   * @param {any} newValue
   */
  handleControlValueChange(control, newValue) {
    const name = getName(control);
    if (newValue !== getValue(this.data, name)) {
      this._dirtyControls.set(control, newValue);
      setValue(this.data, name, newValue);
      const validationResults = this.controlVisited(control);
      if (this.checkValidity([control])) {
        this.dispatchEvent(
          new CustomEvent("form-binder:change", {
            detail: {
              data: JSON.parse(JSON.stringify(this.data)),
              validationResults
            }
          })
        );
      }
    }
  }

  /**
   * @param {import("../lib/control-binder.js").ControlElement} controlElement that was visited
   * @returns {import("../lib/control-validator.js").FormValidationResult} form validity result
   */
  controlVisited(controlElement) {
    this._visitedControls.add(controlElement);
    return this.reportValidity();
  }

  /**
   * @param {import("../lib/control-validator.js").ValidationElement} control
   * @param {any} [value] to validate against the control. If not supplied then the value is taken from the backing data.
   * @returns {import("../lib/control-validator.js").ValidationControlResult} if valid
   */
  validateControlValue(control, value) {
    /** @type {import("../lib/control-validator.js").ValidationResults} */
    const controlValidationResults = [];
    const controlName = getName(control);
    matchingValidators(control).forEach(validator => {
      const validatorResult = validator.validate(
        control,
        value === undefined ? getValue(this.data, controlName) : value,
        this.data
      );
      controlValidationResults.push(validatorResult);
    });

    // Add 'field' property if missing
    controlValidationResults.forEach(validatorResult => {
      if (!validatorResult.field) {
        validatorResult.field = controlName;
      }
    });

    return {
      control,
      controlValidationResults,
      visited: this._visitedControls.has(control)
    };
  }

  /**
   * @param {Array<import("../lib/control-binder.js").ControlElement>} [controls] to validate. if not supplied then all controls are validated.
   * @returns {import("../lib/control-validator.js").FormValidationResult} errors that that delegating to be displayed
   */
  validate(controls) {
    /** @type {Array<import("../lib/control-validator.js").ValidationControlResult>} */
    const result = (
      controls || Array.from(this.registeredControlBinders.keys())
    )
      .map(c => this.validateControlValue(c))
      .filter(e => e.controlValidationResults.length > 0);

    const errors = filterValidationResults(
      result,
      validationResult => validationResult.valid === false
    );

    return {
      result,
      errors,
      isValid: errors.length === 0
    };
  }

  /**
   * @param {Array<import("../lib/control-binder.js").ControlElement>} [controls] to validate. if not supplied then all controls are validated.
   * @returns {boolean} if the control/controls in the form are all valid
   */
  checkValidity(controls) {
    return this.validate(controls).isValid;
  }

  /**
   * @param {Array<import("../lib/control-binder.js").ControlElement>} [controls] to validate. if not supplied then all controls are validated.
   * @returns {import("../lib/control-validator.js").FormValidationResult} if the control/controls in the form are all valid
   */
  reportValidity(controls) {
    const validationResults = this.validate(controls);
    this.reportErrors(validationResults);
    return validationResults;
  }

  /** @param {import("../lib/control-validator.js").FormValidationResult} validationResults that to be displayed */
  reportErrors(validationResults) {
    this.dispatchEvent(
      new CustomEvent("form-binder:report-validity", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: validationResults
      })
    );
  }
}

window.customElements.define("form-binder", FormBinder);
