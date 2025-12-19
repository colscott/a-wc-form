/* global describe, before, after, afterEach, it */
// @ts-check
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { binderRegistry, binders, validatorRegistry, ValidationResult } from '../../../src/index.js';
import { patternValidator } from '../../../src/lib/validators/pattern.js';
import { maxValidator } from '../../../src/lib/validators/max.js';
import { data as mockData } from '../../../demo/mock.js';
/** @typedef {import('../../../demo/mock').MockData} MockData */
/** @typedef {import('../../../src/components/form-binder.js').FormBinder<MockData>} FormBinder */
/** @typedef {import('../../../src/components/form-binder').FormBinderChangeEventDetail<MockData>} FormBinderChangeEventDetail */

/** @returns {Promise} that resolves when the form-binder:change event fires */
export function wait() {
  return new Promise(res => setTimeout(res));
}

/** @returns {Promise<{formBinder: FormBinder, eventDetail: FormBinderChangeEventDetail}>} */
async function createFormBinder(useShadowRoot = false) {
  const data = JSON.parse(JSON.stringify(mockData));
  const formBinder = /** @type {import('../../../src/components/form-binder.js').FormBinder<MockData>} */ (document.createElement(
    'form-binder',
  ));
  let container = formBinder;
  if (useShadowRoot) {
    container = document.createElement('div');
  }
  formBinder.data = data;
  document.body.appendChild(container);
  container.innerHTML = `
    <input id="name" required pattern="Fred.*" type="text" bind="/name" />
    <input id="whitelist" whitelist="bill,bob,rob" type="text" bind="#/name" />
    <div>
      <input id="age" min="18" max="65" type="number" bind="#/personalData/age" />
    </div>
    <input id="age2" min="18" max="65" type="number" bind="#/personalData/age" />
    <input id="tel" bind="telephoneNumbers/1" />
    <input id="message" bind="#/comments/1/message" />
    <input id="student" bind="#/student" type="checkbox" />
    <input id="start" type="date" bind="/start" bind-attr:max="/end" />
    <input id="end" type="date" bind="/end" bind-attr:min="/start" bind-prop:student="/student" />
    <input id="occupation" bind="/occupation" bind-attr:disabled="/student" />
  `;
  if (useShadowRoot) {
    container.attachShadow({ mode: 'open', delegatesFocus: true });
    formBinder.innerHTML = '<slot></slot>';
    container.shadowRoot.appendChild(formBinder);
  }

  /** @type {import('../../../src/components/form-binder').FormBinderChangeEventDetail<MockData>} */
  const eventDetail = { data, jsonPointer: null, value: null, validationResults: null };
  formBinder.addEventListener('form-binder:change', e => {
    const event = /** @type {import('../../../src/components/form-binder').FormBinderChangeEvent<MockData>} */ (e);
    eventDetail.data = event.detail.data;
    eventDetail.jsonPointer = event.detail.jsonPointer;
    eventDetail.value = event.detail.value;
    eventDetail.validationResults = event.detail.validationResults;
  });
  return { formBinder, eventDetail };
}

/** @type {import('../../../src/lib/validator-registry').Validator} */
const validateTextInput = {
  controlSelector: 'input[whitelist]',
  validate: (control, value, data) => {
    const whitelist = control.getAttribute('whitelist').split(',');
    const isValid = whitelist.some(v => v === value);
    return new ValidationResult('whitelist', whitelist, value, isValid);
  },
};

/**
 * @param {string} controlId
 * @param {string} value
 */
function inputValue(controlId, value) {
  const controlElement = document.getElementById(controlId);
  if (typeof value === 'boolean') {
    controlElement.checked = value;
  } else {
    controlElement.value = value;
  }
  controlElement.dispatchEvent(new Event('change'));
}

describe('form-binder binding tests', () => {
  before(() => {
    validatorRegistry.add(validateTextInput, true);
  });
  after(() => {
    validatorRegistry.remove(validateTextInput);
  });
  afterEach(() => {
    validatorRegistry.remove(patternValidator);
    validatorRegistry.remove(maxValidator);
    binderRegistry.remove(...Object.values(binders));
    document.querySelectorAll('form-binder').forEach(e => e.parentElement.removeChild(e));
    document.querySelectorAll('div').forEach(e => e.parentElement.removeChild(e));
  });
  it('Should populate controls', async () => {
    binderRegistry.add(...Object.values(binders));
    await createFormBinder();
    expect(document.getElementById('name').value).to.equal('Johnny Five');
    expect(document.getElementById('age').value).to.equal('34');
    expect(document.getElementById('tel').value).to.equal('123-8901234');
    expect(document.getElementById('message').value).to.equal('Thdsdfsdfsdf');
    expect(document.getElementById('student').checked).to.equal(true);
  });
  it('Should populate slotted controls', async () => {
    binderRegistry.add(...Object.values(binders));
    await createFormBinder(true);
    expect(document.getElementById('name').value).to.equal('Johnny Five');
    expect(document.getElementById('age').value).to.equal('34');
    expect(document.getElementById('tel').value).to.equal('123-8901234');
    expect(document.getElementById('message').value).to.equal('Thdsdfsdfsdf');
    expect(document.getElementById('student').checked).to.equal(true);
  });
  it('Should not change value when value is invalid', async () => {
    binderRegistry.add(...Object.values(binders));
    const { eventDetail } = await createFormBinder();
    validatorRegistry.add(patternValidator, true);
    validatorRegistry.add(maxValidator, true);
    inputValue('name', 'Bert');
    inputValue('age', '300');
    await wait();
    expect(eventDetail.data.name).to.equal('Johnny Five');
    expect(eventDetail.data.personalData.age).to.equal(34);
    validatorRegistry.remove(patternValidator);
    validatorRegistry.remove(maxValidator);
    inputValue('name', 'Fred');
    inputValue('age', '20');
    await wait();
    expect(eventDetail.data.name).to.equal('Fred');
    expect(eventDetail.data.personalData.age).to.equal(20);
  });
  it('Should handle change to slotted controls', async () => {
    binderRegistry.add(...Object.values(binders));
    const { eventDetail } = await createFormBinder(true);
    validatorRegistry.add(patternValidator, true);
    validatorRegistry.add(maxValidator, true);
    inputValue('name', 'Bert');
    inputValue('age', '300');
    await wait();
    expect(eventDetail.data.name).to.equal('Johnny Five');
    expect(eventDetail.data.personalData.age).to.equal(34);
    validatorRegistry.remove(patternValidator);
    validatorRegistry.remove(maxValidator);
    inputValue('name', 'Fred');
    inputValue('age', '20');
    await wait();
    expect(eventDetail.data.name).to.equal('Fred');
    expect(eventDetail.data.personalData.age).to.equal(20);
  });
  it('Should reflect changes to data', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder } = await createFormBinder();
    const dataCopy = JSON.parse(JSON.stringify(formBinder.data));
    dataCopy.name = 'fred123';
    dataCopy.personalData.age = 62;
    dataCopy.student = false;
    formBinder.data = dataCopy;
    expect(document.getElementById('name').value).to.equal('fred123');
    expect(document.getElementById('age').value).to.equal('62');
    expect(document.getElementById('student').checked).to.equal(false);
  });

  it('Should use custom validation', async () => {
    binderRegistry.add(...Object.values(binders));
    const { eventDetail } = await createFormBinder();
    inputValue('whitelist', 'Bert');
    await wait();
    expect(eventDetail.data.name).to.equal('Johnny Five');
    inputValue('whitelist', 'bill');
    await wait();
    expect(eventDetail.data.name).to.equal('bill');
    inputValue('whitelist', 'ray');
    await wait();
    expect(eventDetail.data.name).to.equal('bill');
    inputValue('whitelist', 'rob');
    await wait();
    expect(eventDetail.data.name).to.equal('rob');
  });

  it('Should be able to patch values with object', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    inputValue('whitelist', 'Bert');
    inputValue('age', '30');
    await wait();
    formBinder.patch({ personalData: { age: 35 }, student: false });
    await wait();
    inputValue('whitelist', 'bob');
    await wait();
    expect(eventDetail.data.name).to.equal('bob');
    expect(eventDetail.data.personalData.age).to.equal(35);
    expect(eventDetail.data.student).to.equal(false);
  });

  it('Should be able to patch values with Map', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    inputValue('whitelist', 'Bert');
    inputValue('age', '30');
    await wait();
    const patchValues = new Map();
    patchValues.set('/personalData/age', 40);
    patchValues.set('#/student', false);
    formBinder.patch(patchValues);
    await wait();
    inputValue('whitelist', 'rob');
    await wait();
    expect(eventDetail.data.name).to.equal('rob');
    expect(eventDetail.data.personalData.age).to.equal(40);
    expect(eventDetail.data.student).to.equal(false);
  });

  it('Should be able to patch values with JSON pointer', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    inputValue('whitelist', 'Bert');
    inputValue('age', '30');
    await wait();
    formBinder.patch([
      ['/personalData/age', 40],
      ['#/student', false],
    ]);
    await wait();
    inputValue('whitelist', 'rob');
    await wait();
    expect(eventDetail.data.name).to.equal('rob');
    expect(eventDetail.data.personalData.age).to.equal(40);
    expect(eventDetail.data.student).to.equal(false);
  });

  it('Should update control values with patched data', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    inputValue('age', 28);
    inputValue('age2', 28);
    await wait();
    expect(document.getElementById('age').value).to.equal('28');
    expect(document.getElementById('age2').value).to.equal('28');
    formBinder.patch([['/personalData/age', 35]]);
    await wait();
    expect(document.getElementById('age').value).to.equal('35');
    expect(document.getElementById('age2').value).to.equal('35');
  });

  it('Should be able to reset data', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    inputValue('whitelist', 'Bert');
    inputValue('age', '30');
    await wait();
    const patchValues = new Map();
    patchValues.set('/personalData/age', 40);
    patchValues.set('#/student', false);
    formBinder.patch(patchValues);
    await wait();
    inputValue('whitelist', 'rob');
    await wait();
    formBinder.rollback();
    await wait();
    expect(formBinder.data).to.eql(mockData);
  });

  it('Should bind attributes and properties', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder } = await createFormBinder();
    inputValue('start', '2021-03-04');
    inputValue('end', '2021-03-10');
    await wait();
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    expect(startInput.value).to.eql('2021-03-04');
    // Test bind-attr worked
    expect(startInput.getAttribute('max')).to.eql('2021-03-10');
    expect(endInput.value).to.eql('2021-03-10');
    expect(endInput.getAttribute('min')).to.eql('2021-03-04');
    // Test bind-prop worked
    expect(endInput.student).to.be.true;
    expect(endInput.hasAttribute('student')).to.be.false;
    formBinder.patch({ student: false });
    // Test bind-prop worked
    expect(endInput.student).to.be.false;
    expect(endInput.hasAttribute('student')).to.be.false;
    await wait();
    const occupationInput = document.getElementById('occupation');
    // Test bind-prop worked
    expect(endInput.student).to.be.false;
    expect(endInput.hasAttribute('student')).to.be.false;
    expect(occupationInput.hasAttribute('disabled')).to.equal(false);
    formBinder.patch({ student: true });
    // Test bind-prop worked
    expect(endInput.student).to.be.true;
    expect(endInput.hasAttribute('student')).to.be.false;
    await wait();
    expect(occupationInput.hasAttribute('disabled')).to.equal(true);
  });

  it('Should include changed JSON pointer and value in change event', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    inputValue('whitelist', 'bob');
    await wait();
    expect(eventDetail.jsonPointer).to.equal('/name');
    expect(eventDetail.value).to.equal('bob');
    inputValue('age', '30');
    await wait();
    expect(eventDetail.jsonPointer).to.equal('/personalData/age');
    expect(eventDetail.value).to.equal(30);
  });

  it('Should keep track of changes via patch', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    expect(formBinder.getPatch()).to.eql({});
    expect(formBinder.getPatchAsArray()).to.eql([]);
    expect(formBinder.getPatchAsMap()).to.eql(new Map());
    inputValue('whitelist', 'bob');
    await wait();
    expect(formBinder.getPatch()).to.eql({ name: 'bob' });
    expect(formBinder.getPatchAsArray()).to.eql([['/name', 'bob']]);
    expect(formBinder.getPatchAsMap()).to.eql(new Map([['/name', 'bob']]));
    inputValue('age', '30');
    await wait();
    expect(eventDetail.jsonPointer).to.equal('/personalData/age');
    expect(eventDetail.value).to.equal(30);
    expect(formBinder.getPatch()).to.eql({ name: 'bob', personalData: { age: 30 } });
    expect(formBinder.getPatchAsArray()).to.eql([
      ['/name', 'bob'],
      ['/personalData/age', 30],
    ]);
    expect(formBinder.getPatchAsMap()).to.eql(
      new Map([
        ['/name', 'bob'],
        ['/personalData/age', 30],
      ]),
    );
  });

  it('Should reset to last commitChanges', async () => {
    binderRegistry.add(...Object.values(binders));
    const { formBinder, eventDetail } = await createFormBinder();
    formBinder.data = { a: 1 };
    expect(formBinder.data).to.eql({ a: 1 });
    formBinder.commit();
    formBinder.patch({ a: 2 });
    expect(formBinder.data).to.eql({ a: 2 });
    // reset
    formBinder.rollback();
    expect(formBinder.data).to.eql({ a: 1 });
  });

  // Not currently supported as the binders get initialized with events when the control is added to the form
  // it("Should not change value when binder is removed", async () => {
  //   binder.add(binders.textInputBinder);
  //   const { formBinder, eventDetail } = await createFormBinder();
  //   inputValue("name", "Bert");
  //   await formBinder.updateComplete;
  //   expect(eventDetail.data.name).to.equal("Bert");

  //   binder.remove(binders.textInputBinder);
  //   inputValue("name", "Johnny Six");
  //   await formBinder.updateComplete;
  //   expect(eventDetail.data.name).to.equal("Bert");

  //   // Not currently supported as the binders get initialized with events when the control is added to the form
  //   // The binder must currently be present when the control is added to the form
  //   // add(binders.textInputBinder);
  //   // inputValue("name", "Johnny Seven");
  //   // await formBinder.updateComplete;
  //   // expect(formBinder.data.name).to.equal("Johnny Seven");
  // });
});

describe('Integration: Validator messages with reportValidity', () => {
  /** @type {import('../../../src/lib/validator-registry').Validator} */
  const validatorWithMessage = {
    controlSelector: '[test-message]',
    validate: (control, value) => {
      const isValid = value && value.toString().length >= 5;
      const message = isValid ? undefined : 'Must be at least 5 characters';
      return new ValidationResult('min-length-message', 5, value?.length || 0, isValid, message);
    },
  };

  /** @type {import('../../../src/lib/validator-registry').Validator} */
  const validatorWithoutMessage = {
    controlSelector: '[test-no-message]',
    validate: (control, value) => {
      const isValid = value && value.toString().startsWith('test');
      return new ValidationResult('starts-with-test', 'test*', value, isValid);
    },
  };

  after(() => {
    validatorRegistry.remove(validatorWithMessage);
    validatorRegistry.remove(validatorWithoutMessage);
  });

  beforeEach(() => {
    binderRegistry.add(binders.textInputBinder);
    binderRegistry.add(binders.numberInputBinder);
  });

  afterEach(() => {
    binderRegistry.remove(binders.textInputBinder);
    binderRegistry.remove(binders.numberInputBinder);
    document.querySelectorAll('form-binder').forEach((e) => e.parentElement.removeChild(e));
  });

  it('should propagate validator message to control via binder.reportValidity', async () => {
    validatorRegistry.add(validatorWithMessage);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'abc' };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" test-message />
    `;
    await wait();

    const input = document.getElementById('test-input');
    expect(input.value).to.equal('abc');

    // Trigger validation
    const result = await formBinder.reportValidity();

    // Should have validation error
    expect(result.isValid).to.be.false;
    expect(result.errors).to.have.lengthOf(1);
    
    // Most importantly, the control should have the validation message
    expect(input.validationMessage).to.equal('Must be at least 5 characters');
  });

  it('should clear validation message when value becomes valid', async () => {
    validatorRegistry.add(validatorWithMessage);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'ab' };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" test-message />
    `;
    await wait();

    const input = document.getElementById('test-input');
    
    // Initial validation should fail
    await formBinder.reportValidity();
    expect(input.validationMessage).to.equal('Must be at least 5 characters');

    // Update to valid value
    input.value = 'abcdef';
    input.dispatchEvent(new Event('change'));
    await wait();

    // Validation should pass and message should be cleared
    const result = await formBinder.reportValidity();
    expect(result.isValid).to.be.true;
    expect(input.validationMessage).to.equal('');
  });

  it('should not set validation message when validator does not provide one', async () => {
    validatorRegistry.add(validatorWithoutMessage);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'invalid' };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" test-no-message />
    `;
    await wait();

    const input = document.getElementById('test-input');

    // Trigger validation
    const result = await formBinder.reportValidity();

    // Should have validation error
    expect(result.isValid).to.be.false;
    expect(result.errors).to.have.lengthOf(1);
    
    // But control should NOT have validation message (validator didn't provide one)
    expect(input.validationMessage).to.equal('');
  });

  it('should handle multiple validators with messages on same control', async () => {
    /** @type {import('../../../src/lib/validator-registry').Validator} */
    const requiredValidator = {
      controlSelector: '[required-message]',
      validate: (control, value) => {
        const isValid = value && value.toString().trim().length > 0;
        const message = isValid ? undefined : 'This field is required';
        return new ValidationResult('required', true, !!value, isValid, message);
      },
    };

    validatorRegistry.add(validatorWithMessage);
    validatorRegistry.add(requiredValidator);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'ab' };  // Changed from '' to 'ab' - too short for validatorWithMessage
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" test-message required-message />
    `;
    await wait();

    const input = document.getElementById('test-input');

    // Trigger validation - validatorWithMessage should fail (< 5 chars), requiredValidator should pass
    const result = await formBinder.reportValidity();
    expect(result.isValid).to.be.false;

    // Should show the min-length message
    expect(input.validationMessage).to.equal('Must be at least 5 characters');

    validatorRegistry.remove(requiredValidator);
  });

  it('should include message in validation result event detail', async () => {
    validatorRegistry.add(validatorWithMessage);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'ab' };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" test-message />
    `;

    let eventDetail = null;
    formBinder.addEventListener('form-binder:report-validity', (e) => {
      eventDetail = e.detail;
    });

    await wait();
    await formBinder.reportValidity();

    expect(eventDetail).to.not.be.null;
    expect(eventDetail.errors).to.have.lengthOf(1);
    
    const errorResult = eventDetail.errors[0];
    const validationResult = errorResult.controlValidationResults.find(
      (r) => r.name === 'min-length-message'
    );
    
    expect(validationResult).to.not.be.undefined;
    expect(validationResult.message).to.equal('Must be at least 5 characters');
  });

  it('should work with number inputs and validator messages', async () => {
    /** @type {import('../../../src/lib/validator-registry').Validator} */
    const minValueValidator = {
      controlSelector: '[min-value]',
      validate: (control, value) => {
        const min = parseInt(control.getAttribute('min-value'), 10);
        const numValue = typeof value === 'number' ? value : parseInt(value, 10);
        const isValid = !isNaN(numValue) && numValue >= min;
        const message = isValid ? undefined : `Value must be at least ${min}`;
        return new ValidationResult('min-value', min, numValue, isValid, message);
      },
    };

    validatorRegistry.add(minValueValidator);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { age: 15 };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="age-input" type="number" bind="#/age" min-value="18" />
    `;
    await wait();

    const input = document.getElementById('age-input');
    expect(input.value).to.equal('15');

    // Trigger validation
    const result = await formBinder.reportValidity();

    expect(result.isValid).to.be.false;
    expect(input.validationMessage).to.equal('Value must be at least 18');

    // Update to valid value
    input.value = '20';
    input.dispatchEvent(new Event('change'));
    await wait();

    const result2 = await formBinder.reportValidity();
    expect(result2.isValid).to.be.true;
    expect(input.validationMessage).to.equal('');

    validatorRegistry.remove(minValueValidator);
  });

  it('should call reportValidity automatically when visited control value changes', async () => {
    validatorRegistry.add(validatorWithMessage);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'valid value' };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" test-message />
    `;
    await wait();

    const input = document.getElementById('test-input');
    
    // Mark as visited by triggering blur
    input.dispatchEvent(new Event('blur'));
    await wait();

    // Change to invalid value - should automatically trigger reportValidity
    input.value = 'ab';
    input.dispatchEvent(new Event('change'));
    await wait();

    // Should automatically show validation message
    expect(input.validationMessage).to.equal('Must be at least 5 characters');
  });

  it('should handle validator that returns valid result without message and clears previous errors', async () => {
    /** @type {import('../../../src/lib/validator-registry').Validator} */
    const alwaysValidValidator = {
      controlSelector: '[always-valid]',
      validate: (control, value) => {
        // Returns valid result without a message
        return new ValidationResult('always-valid', 'anything', value, true);
      },
    };

    validatorRegistry.add(alwaysValidValidator);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'test' };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" always-valid />
    `;
    await wait();

    const input = document.getElementById('test-input');
    
    // Set an error manually first
    input.setCustomValidity('Previous error');
    expect(input.validationMessage).to.equal('Previous error');

    // Trigger validation with the always-valid validator (no message)
    await formBinder.reportValidity();
    
    // Should clear the previous error even though validator didn't provide a message
    expect(input.validationMessage).to.equal('');

    validatorRegistry.remove(alwaysValidValidator);
  });

  it('should handle multiple validators all returning valid and clear previous errors', async () => {
    /** @type {import('../../../src/lib/validator-registry').Validator} */
    const validator1 = {
      controlSelector: '[multi-valid]',
      validate: (control, value) => {
        const isValid = value && value.toString().length >= 5;
        const message = isValid ? undefined : 'Value must be at least 5 characters';
        return new ValidationResult('validator-1', 5, value?.length || 0, isValid, message);
      },
    };

    /** @type {import('../../../src/lib/validator-registry').Validator} */
    const validator2 = {
      controlSelector: '[multi-valid]',
      validate: (control, value) => {
        const isValid = value && value.toString().startsWith('valid');
        return new ValidationResult('validator-2', 'starts with valid', value, isValid);
      },
    };

    /** @type {import('../../../src/lib/validator-registry').Validator} */
    const validator3 = {
      controlSelector: '[multi-valid]',
      validate: (control, value) => {
        return new ValidationResult('validator-3', 'any', value, true);
      },
    };

    validatorRegistry.add(validator1);
    validatorRegistry.add(validator2);
    validatorRegistry.add(validator3);

    const formBinder = document.createElement('form-binder');
    formBinder.data = { testField: 'ab' };
    document.body.appendChild(formBinder);
    formBinder.innerHTML = `
      <input id="test-input" type="text" bind="#/testField" multi-valid />
    `;
    await wait();

    const input = document.getElementById('test-input');
    
    // First validation should fail (too short)
    await formBinder.reportValidity();
    expect(input.validationMessage).to.equal('Value must be at least 5 characters');

    // Update to valid value - all 3 validators should pass
    input.value = 'valid test';
    input.dispatchEvent(new Event('change'));
    await wait();
    
    // Should clear the error - all validators pass
    await formBinder.reportValidity();
    expect(input.validationMessage).to.equal('');

    validatorRegistry.remove(validator1);
    validatorRegistry.remove(validator2);
    validatorRegistry.remove(validator3);
  });
});
