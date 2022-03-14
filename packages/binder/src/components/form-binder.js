import { initialize } from '../lib/binder-registry.js';
import { filterValidationResults, matchingValidators, add } from '../lib/validator-registry.js';
import '../lib/validators/index.js';
import { getValue, normalize, objectFlat, setValue } from '../lib/json-pointer.js';
import { ShadowDomMutationObserver } from '../lib/observer.js';

/** @typedef {Array<Array<*> & { 0: string, 1: any, length: 2 }>} JSONPointerValueTuple */
/**
 * @template TData
 * @typedef {{ data: TData, jsonPointer: String, value: any, validationResults: FormValidationResult}} FormBinderChangeEventDetail
 */
/**
 * @template TData
 * @typedef {CustomEvent<FormBinderChangeEventDetail<TData>>} FormBinderChangeEvent
 */
/** @typedef {import('../lib/control-binding.js').ControlBinding} ControlBinding */
/** @typedef {import("../lib/binder-registry.js").ControlElement} ControlElement */
/** @typedef {import("../lib/validator-registry.js").ValidationControlResult} ValidationControlResult */
/** @typedef {import("../lib/validator-registry.js").ValidationElement} ValidationElement */
/** @typedef {import("../lib/validator-registry.js").ValidationResults} ValidationResults */
/** @typedef {import("../lib/validator-registry.js").FormValidationResult} FormValidationResult */

const ATTRIBUTE_BINDER_PREFIX = 'bind-attr:';

/**
 * @param {Element} element to get the name for
 * @returns {string} the name assigned to the element
 */
export function getName(element) {
  // @ts-ignore
  const binderName =
    // @ts-ignore
    element.bind || element.getAttribute('bind');
  if (!binderName) {
    console.error('No binder name found for element', element);
  }
  return binderName;
}

/**
 * @param {Element} element to get the binder names for
 * @returns {Array<{jsonPointer: string, attribute: string}>}
 */
export function getAttributeBinders(element) {
  const attributes = Array.from(element.attributes);
  const attributeBinders = attributes.reduce((result, attribute) => {
    if (attribute.name.startsWith(ATTRIBUTE_BINDER_PREFIX)) {
      result.push({
        jsonPointer: normalize(attribute.value),
        attribute: attribute.name.substr(ATTRIBUTE_BINDER_PREFIX.length),
      });
    }
    return result;
  }, []);
  return attributeBinders;
}

/**
 * @param {Element} parentElement to find child Element of
 * @returns {Array<Element>} found child Elements
 */
function getChildElements(parentElement) {
  const elements = Array.from(parentElement.querySelectorAll('*'));
  return [
    ...elements,
    // Get all child shadow root elements
    ...elements.filter((element) => !!element.shadowRoot).flatMap((element) => getChildElements(element)),
    // Get all elements assigned to a slot
    ...elements.filter((element) => element instanceof HTMLSlotElement).flatMap((slot) => slot instanceof HTMLSlotElement && slot.assignedElements()),
    // Get all child elements of elements assign to a slot
    ...elements.filter((element) => element instanceof HTMLSlotElement).flatMap((slot) => {
        if (slot instanceof HTMLSlotElement) {
          return [...slot.assignedElements().flatMap(element => getChildElements(element))];
        }
        return [];
      }),
  ];
}

/** @template TData */
export class FormBinder extends HTMLElement {
  /** @returns {object} that is being bound to the form controls */
  get data() {
    return this._data;
  }

  /** @param {object} data to bind to the form controls. A copy of the data is taken. */
  set data(data) {
    this._data = JSON.parse(JSON.stringify(data));
    this._originalData = JSON.parse(JSON.stringify(data));
    this.updateControlValues();
  }

  /** @inheritdoc */
  connectedCallback() {
    this.setAttribute('role', 'form');
    const config = { attributes: false, childList: true, subtree: true };

    /**
     * @type {MutationCallback}
     * @param {MutationRecord[]} mutationsList .
     */
    const callback = (mutationsList) => {
      mutationsList.forEach((mutation) => {
        mutation.addedNodes.forEach((controlCandidate) => {
          if (controlCandidate instanceof Element) {
            this.addControl(controlCandidate);
            getChildElements(controlCandidate).forEach((c) => this.addControl(c));
          }
        });
        mutation.removedNodes.forEach((controlCandidate) => {
          if (controlCandidate instanceof Element) {
            if (this.registeredControlBinders.has(controlCandidate)) {
              this.registeredControlBinders.delete(controlCandidate);
            }
            getChildElements(controlCandidate).forEach((c) => {
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

    getChildElements(this).forEach((element) => this.addControl(element));
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
    /** @type {Map<Element, ControlBinding>} */
    this.registeredControlBinders = new Map();

    /**
     * @private
     * @type {Set<Element>} controls the user has interacted with
     */
    this._visitedControls = new Set();

    /**
     * @private
     * @type {Map<Element, any>} controls whose values have been changed by the user
     */
    this._updatedControls = new Map();

    /**
     * @private
     * @type {Partial<TData>}
     */
    this._patch = {};

    /**
     * @type {object}
     * @private
     */
    this._originalData = null;

    /** @type {TData} */
    this.data = null;

    /** @private guard to prevent nested reportValidity processes */
    this._reportValidityRequested = false;
  }

  /**
   * @protected
   * Marks a JSON Pointer and value as changed and also updates the value in the data.
   * @param {string} jsonPointer to the property to set the value
   * @param {unknown} newValue to assign to the pointer
   */
  _patchValue(jsonPointer, newValue) {
    setValue(this._patch, jsonPointer, newValue);
    setValue(this.data, jsonPointer, newValue);
  }

  /** @returns {Partial<TData>} data changed as a partial object */
  getPatch() {
    return this._patch;
  }

  /** @returns {Map<string, unknown>} data changed as Map of JSONPointer/value pairs */
  getPatchAsMap() {
    return objectFlat(this.getPatch());
  }

  /** @returns {JSONPointerValueTuple} data changed as Array of JSONPointer/value pairs */
  getPatchAsArray() {
    return Array.from(this.getPatchAsMap().entries());
  }

  /**
   * Updates the form data with a partial object.
   * @param {Partial<TData>|Map<string, any>|JSONPointerValueTuple} [partialData] that will be used to update the current form data. Can be a partial object of a Map or JSON pointers and new values.
   */
  patch(partialData) {
    let jsonPointers;
    if (partialData instanceof Array) {
      jsonPointers = new Map(partialData);
    } else if (partialData instanceof Map) {
      jsonPointers = /** @type {Map<String, unknown>} */ (partialData);
    } else {
      jsonPointers = objectFlat(partialData);
    }

    jsonPointers.forEach((value, key) => {
      this._patchValue(key, value);
    });

    this.updateControlValues(Array.from(jsonPointers.keys()));
  }

  /**
   * Clears the currently recorded changes and sets the current state as the new baseline. It does not clear the data changes themselves.
   * You might use this if the user saves the form and you want to mark the form as .
   * If reset() is called the form will be reverted to the last time commitChanges() was called.
   */
  commit() {
    this._patch = {};
    this._updatedControls = new Map();
    this._originalData = JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Resets the form back to original status. All controls are marked unchanged. All patches are cleared.
   * Clears the data to the initial data value set. Reverts the data to the last time the data was set or commitChanges was called.
   */
  rollback() {
    this._patch = {};
    this._updatedControls = new Map();
    if (this._originalData) {
      this.data = this._originalData;
    }
  }

  /** @deprecated use rollback */
  reset() {
    this.rollback();
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
        this.controlVisited.bind(this),
      );
      if (binder) {
        this.registeredControlBinders.set(controlCandidate, binder);
        if (this.data) {
          this.updateControlValue(controlCandidate);
        }
      }
    }
  }

  /**
   * Update a controls model binder and attribute binders
   * @param {Element} control to update the value of. If control has been visited then validation is invoked.
   */
  updateControlValue(control) {
    getAttributeBinders(control).forEach(({ jsonPointer, attribute }) => {
      const attributeValue = getValue(this.data, jsonPointer);
      if (attributeValue == null || attributeValue === false) {
        control.removeAttribute(attribute);
      } else {
        control.setAttribute(attribute, attributeValue);
      }
    });

    const binder = this.registeredControlBinders.get(control);
    if (binder) {
      const value = getValue(this.data, getName(control));
      binder.binder.writeValue(control, value);

      if (this._reportValidityRequested === false && this._visitedControls.has(control)) {
        this._reportValidityRequested = true;
        // Run validity check as task to give custom controls chance to initialize (e.g. MWC)
        setTimeout(() => this.reportValidity());
      }
    }
  }

  /**
   * Updates the values of all control values
   * @param {Array<string>} [jsonPointers] only update controls using the passed jsonPointers
   */
  updateControlValues(jsonPointers) {
    if (!jsonPointers) {
      this.registeredControlBinders.forEach((binder, control) => {
        this.updateControlValue(control);
      });
      return;
    }

    const registeredControlBinders = Array.from(this.registeredControlBinders.entries()).map((entry) => ({
      name: normalize(getName(entry[0])),
      control: entry[0],
      binding: entry[1],
      attributeBinders: getAttributeBinders(entry[0]),
    }));

    // For each value, update the data and update the control
    jsonPointers.forEach((jsonPointer) => {
      const normalizedKey = normalize(jsonPointer);
      registeredControlBinders
        .filter(
          (binderEntry) =>
            binderEntry.name === normalizedKey ||
            binderEntry.attributeBinders.find((a) => a.jsonPointer === normalizedKey),
        )
        .forEach((binderEntry) => this.updateControlValue(binderEntry.control));
    });
  }

  /**
   * @param {ControlElement} control
   * @param {any} value
   * @param {import('../lib/binder-registry').OnValueChangeCallbackOptions} [options]
   */
  async handleControlValueChange(control, value, options) {
    const name = `${getName(control)}${options && options.ref ? `/${options.ref}` : ''}`;
    if (value !== getValue(this.data, name)) {
      this._updatedControls.set(control, value);
      this._patchValue(name, value);
      this.updateControlValues([name]);
      const data = JSON.parse(JSON.stringify(this.data));
      const validationResults = await this.controlVisited(control);
      const controlIsValid = validationResults.errors.every((error) => error.control !== control);
      if (controlIsValid) {
        /** @type {FormBinderChangeEventDetail<TData>} */
        const detail = {
          data,
          jsonPointer: normalize(name),
          value,
          validationResults,
        };
        /** @type {FormBinderChangeEvent<TData>} */
        const event = new CustomEvent('form-binder:change', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail,
        });
        this.dispatchEvent(event);
      }
    }
  }

  /**
   * @param {ControlElement} controlElement that was visited
   * @returns {Promise<FormValidationResult>} form validity result
   */
  controlVisited(controlElement) {
    this._visitedControls.add(controlElement);
    return this.reportValidity();
  }

  /**
   * @param {ValidationElement} control
   * @param {any} [value] to validate against the control. If not supplied then the value is taken from the backing data.
   * @returns {Promise<ValidationControlResult>} if valid
   */
  async validateControlValue(control, value) {
    const controlName = getName(control);
    const t = matchingValidators(control).map((validator) => {
      const result = validator.validate(
        control,
        value === undefined ? getValue(this.data, controlName) : value,
        this.data,
      );
      return result instanceof Promise ? result : Promise.resolve(result);
    });

    /** @type {ValidationResults} */
    const controlValidationResults = (await Promise.allSettled(t)).map((promiseSettled) => {
      if (promiseSettled.status === 'fulfilled') {
        return promiseSettled.value;
      }
      console.error('Validation validator failed', control, value, promiseSettled.reason);
      return null;
    });

    // Add 'field' property if missing
    controlValidationResults
      .filter((validatorResult) => validatorResult !== null)
      .forEach((validatorResult) => {
        if (!validatorResult.field) {
          validatorResult.field = controlName;
        }
      });

    return {
      control,
      controlValidationResults,
      visited: this._visitedControls.has(control),
    };
  }

  /**
   * @param {Array<ControlElement>} [controls] to validate. if not supplied then all controls are validated.
   * @returns {Promise<FormValidationResult>} result of the forms current validity
   */
  async validate(controls) {
    const result = await Promise.all(
      (controls || Array.from(this.registeredControlBinders.keys()))
        .map(async (c) => this.validateControlValue(c))
        .filter(async (e) => (await e).controlValidationResults.length > 0),
    );

    const errors = filterValidationResults(result, (validationResult) => validationResult.valid === false);

    return {
      result,
      errors,
      isValid: errors.length === 0,
    };
  }

  /**
   * @param {Array<ControlElement>} [controls] to validate. if not supplied then all controls are validated.
   * @returns {Promise<boolean>} if the control/controls in the form are all valid
   */
  async checkValidity(controls) {
    return (await this.validate(controls)).isValid;
  }

  /**
   * @param {Array<ControlElement>} [controls] to validate. if not supplied then all controls are validated.
   * @returns {Promise<FormValidationResult>} if the control/controls in the form are all valid
   */
  async reportValidity(controls) {
    const validationResults = await this.validate(controls);
    this.reportErrors(validationResults);
    this._reportValidityRequested = false;
    return validationResults;
  }

  /** @param {FormValidationResult} validationResults that to be displayed */
  reportErrors(validationResults) {
    this.dispatchEvent(
      new CustomEvent('form-binder:report-validity', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: validationResults,
      }),
    );
  }
}

window.customElements.define('form-binder', FormBinder);
