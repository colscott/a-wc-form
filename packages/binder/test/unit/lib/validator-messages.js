/* eslint-disable no-unused-expressions */
/* global describe, after, afterEach, beforeEach, it */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { binderRegistry, binders, validatorRegistry, ValidationResult } from '../../../src/index.js';

/**
 * Setup function to register validators and binders for testing
 * @param  {...any} validatorsToTest validators to register
 */
export function standupValidatorTest(...validatorsToTest) {
  after(() => {
    validatorsToTest.forEach(validator => validatorRegistry.remove(validator));
  });

  beforeEach(() => {
    binderRegistry.add(binders.numberInputBinder);
    binderRegistry.add(binders.textInputBinder);
    binderRegistry.add(binders.checkboxInputBinder);
    binderRegistry.add(binders.selectBinder);
  });

  afterEach(() => {
    binderRegistry.remove(binders.textInputBinder);
    binderRegistry.remove(binders.numberInputBinder);
    binderRegistry.remove(binders.checkboxInputBinder);
    binderRegistry.remove(binders.selectBinder);
  });
}

describe('Validator messages - reportValidity', () => {
  /** @type {import('../../../src/lib/validator-registry').Validator} */
  const validatorWithMessage = {
    controlSelector: '[test-with-message]',
    validate: (control, value) => {
      const isValid = value && value.toString().includes('valid');
      const message = isValid ? undefined : 'Value must contain "valid"';
      return new ValidationResult('with-message', 'contains valid', value, isValid, message);
    },
  };

  /** @type {import('../../../src/lib/validator-registry').Validator} */
  const validatorWithoutMessage = {
    controlSelector: '[test-without-message]',
    validate: (control, value) => {
      const isValid = value && value.toString().includes('test');
      return new ValidationResult('without-message', 'contains test', value, isValid);
    },
  };

  standupValidatorTest(validatorWithMessage, validatorWithoutMessage);

  describe('textInputBinder', () => {
    it('should set validationMessage when validator provides message and value is invalid', () => {
      validatorRegistry.add(validatorWithMessage);
      
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('test-with-message', '');
      input.value = 'invalid value';

      const validationResult = new ValidationResult(
        'test-validator',
        'expected',
        'actual',
        false,
        'Custom error message'
      );

      binders.textInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('Custom error message');
    });

    it('should clear validationMessage when validator provides message and value is valid', () => {
      validatorRegistry.add(validatorWithMessage);
      
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('test-with-message', '');
      input.value = 'valid value';
      
      // First set an error
      input.setCustomValidity('Previous error');
      expect(input.validationMessage).to.equal('Previous error');

      const validationResult = new ValidationResult(
        'test-validator',
        'expected',
        'actual',
        true,
        'Should be cleared'
      );

      binders.textInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('');
    });

    it('should not call setCustomValidity when validator does not provide message', () => {
      validatorRegistry.add(validatorWithoutMessage);
      
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('test-without-message', '');
      input.value = 'invalid';

      const validationResult = new ValidationResult(
        'test-validator',
        'expected',
        'actual',
        false
        // No message parameter
      );

      // Set initial state
      input.setCustomValidity('Initial error');
      const initialMessage = input.validationMessage;

      binders.textInputBinder.reportValidity(input, [validationResult]);

      // Should remain unchanged because no message was provided
      expect(input.validationMessage).to.equal(initialMessage);
    });
  });

  describe('numberInputBinder', () => {
    it('should set validationMessage when validator provides message and value is invalid', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = '10';

      const validationResult = new ValidationResult(
        'min-value',
        20,
        10,
        false,
        'Value must be at least 20'
      );

      binders.numberInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('Value must be at least 20');
    });

    it('should clear validationMessage when value becomes valid', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = '25';
      
      input.setCustomValidity('Previous error');
      expect(input.validationMessage).to.equal('Previous error');

      const validationResult = new ValidationResult(
        'min-value',
        20,
        25,
        true,
        'Valid now'
      );

      binders.numberInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('');
    });

    it('should not change validationMessage without message parameter', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = '5';

      const validationResult = new ValidationResult(
        'min-value',
        20,
        5,
        false
      );

      binders.numberInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('');
    });
  });

  describe('checkboxInputBinder', () => {
    it('should set validationMessage when validator provides message', () => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = false;

      const validationResult = new ValidationResult(
        'required',
        true,
        false,
        false,
        'This field is required'
      );

      binders.checkboxInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('This field is required');
    });

    it('should clear validationMessage when checkbox becomes valid', () => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = true;
      
      input.setCustomValidity('Must be checked');

      const validationResult = new ValidationResult(
        'required',
        true,
        true,
        true,
        'Valid'
      );

      binders.checkboxInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('');
    });

    it('should not affect validationMessage without message parameter', () => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = false;

      const validationResult = new ValidationResult(
        'required',
        true,
        false,
        false
      );

      binders.checkboxInputBinder.reportValidity(input, [validationResult]);

      expect(input.validationMessage).to.equal('');
    });
  });

  describe('selectBinder', () => {
    it('should set validationMessage when validator provides message', () => {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      option1.value = '';
      option1.textContent = 'Select...';
      const option2 = document.createElement('option');
      option2.value = 'value1';
      option2.textContent = 'Value 1';
      select.appendChild(option1);
      select.appendChild(option2);
      select.value = '';

      const validationResult = new ValidationResult(
        'required',
        'not empty',
        '',
        false,
        'Please select a value'
      );

      binders.selectBinder.reportValidity(select, [validationResult]);

      expect(select.validationMessage).to.equal('Please select a value');
    });

    it('should clear validationMessage when selection becomes valid', () => {
      const select = document.createElement('select');
      const option = document.createElement('option');
      option.value = 'value1';
      option.textContent = 'Value 1';
      select.appendChild(option);
      select.value = 'value1';
      
      select.setCustomValidity('Please select');

      const validationResult = new ValidationResult(
        'required',
        'not empty',
        'value1',
        true,
        'Valid selection'
      );

      binders.selectBinder.reportValidity(select, [validationResult]);

      expect(select.validationMessage).to.equal('');
    });

    it('should not change validationMessage without message parameter', () => {
      const select = document.createElement('select');
      const option = document.createElement('option');
      option.value = '';
      select.appendChild(option);
      select.value = '';

      const validationResult = new ValidationResult(
        'required',
        'not empty',
        '',
        false
      );

      binders.selectBinder.reportValidity(select, [validationResult]);

      expect(select.validationMessage).to.equal('');
    });
  });

  describe('Multiple validation results', () => {
    it('should report first invalid result when multiple results are provided', () => {
      const input = document.createElement('input');
      input.type = 'text';

      const results = [
        new ValidationResult('validator1', 'expected1', 'actual1', false, 'First error'),
        new ValidationResult('validator2', 'expected2', 'actual2', false, 'Second error'),
        new ValidationResult('validator3', 'expected3', 'actual3', false, 'Third error'),
      ];

      binders.textInputBinder.reportValidity(input, results);

      expect(input.validationMessage).to.equal('First error');
    });

    it('should skip valid results and report first invalid', () => {
      const input = document.createElement('input');
      input.type = 'number';

      const results = [
        new ValidationResult('validator1', 'expected1', 'actual1', true, 'Valid'),
        new ValidationResult('validator2', 'expected2', 'actual2', true, 'Also valid'),
        new ValidationResult('validator3', 'expected3', 'actual3', false, 'Invalid result'),
        new ValidationResult('validator4', 'expected4', 'actual4', false, 'Another invalid'),
      ];

      binders.numberInputBinder.reportValidity(input, results);

      expect(input.validationMessage).to.equal('Invalid result');
    });

    it('should clear message when all results are valid', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.setCustomValidity('Previous error');

      const results = [
        new ValidationResult('validator1', 'expected1', 'actual1', true, 'Valid'),
        new ValidationResult('validator2', 'expected2', 'actual2', true, 'Also valid'),
      ];

      binders.textInputBinder.reportValidity(input, results);

      expect(input.validationMessage).to.equal('');
    });

    it('should handle empty results array', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.setCustomValidity('Previous error');

      binders.textInputBinder.reportValidity(input, []);

      // Empty array means no invalid results, should clear
      expect(input.validationMessage).to.equal('');
    });
  });

  describe('Edge cases', () => {
    it('should handle control without setCustomValidity method gracefully', () => {
      const mockControl = document.createElement('div');
      // div elements don't have setCustomValidity
      
      const validationResult = new ValidationResult(
        'test',
        'expected',
        'actual',
        false,
        'This should not throw'
      );

      // Should not throw
      expect(() => {
        binders.textInputBinder.reportValidity(mockControl, [validationResult]);
      }).to.not.throw();
    });

    it('should handle undefined message in validationResult', () => {
      const input = document.createElement('input');
      input.type = 'text';

      const validationResult = new ValidationResult(
        'test',
        'expected',
        'actual',
        false,
        undefined
      );

      input.setCustomValidity('Initial');
      binders.textInputBinder.reportValidity(input, [validationResult]);

      // Should not change because message is undefined
      expect(input.validationMessage).to.equal('Initial');
    });

    it('should handle empty string message', () => {
      const input = document.createElement('input');
      input.type = 'text';

      const validationResult = new ValidationResult(
        'test',
        'expected',
        'actual',
        false,
        ''
      );

      input.setCustomValidity('Initial');
      binders.textInputBinder.reportValidity(input, [validationResult]);

      // Empty string is falsy, so should not change
      expect(input.validationMessage).to.equal('Initial');
    });
  });
});
