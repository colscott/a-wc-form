/* eslint-disable no-unused-expressions */
/* global describe, it */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { validatorRegistry } from '../../../../src/index.js';
import * as validators from '../../../../src/lib/validators/index.js';
import { createFormBinder, standupValidatorTest } from '../control-validator.js';

describe('validation - greater-than', () => {
  standupValidatorTest(validators.greaterThanValidator);

  it('should validate', async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById('age');
    inputAge.value = 30;
    inputAge.dispatchEvent(new Event('change'));
    const inputHeight = document.getElementById('height');
    inputHeight.value = 50;
    inputHeight.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.greaterThanValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute('greater-than', '#/personalData/height');
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = 60;
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });

  it('should validate different date formats', async () => {
    const control = document.createElement('input');
    control.setAttribute('greater-than', 'other');
    const data = { other: '20100305' };
    let result = validators.greaterThanValidator.validate(control, '20100304', data);
    expect(result.valid).to.be.false;
    result = validators.greaterThanValidator.validate(control, '20100310', data);
    expect(result.valid).to.be.true;
    data.other = '2010-03-05';
    result = validators.greaterThanValidator.validate(control, '2010-03-04', data);
    expect(result.valid).to.be.false;
    result = validators.greaterThanValidator.validate(control, '2010-03-10', data);
    expect(result.valid).to.be.true;
    result = validators.greaterThanValidator.validate(control, '', data);
    expect(result.valid).to.be.false;
    data.other = '';
    result = validators.greaterThanValidator.validate(control, '2010-03-10', data);
    expect(result.valid).to.be.false;
    result = validators.greaterThanValidator.validate(control, '', data);
    expect(result.valid).to.be.false;
    data.other = 123;
    result = validators.greaterThanValidator.validate(control, 122, data);
    expect(result.valid).to.be.false;
    result = validators.greaterThanValidator.validate(control, 123, data);
    expect(result.valid).to.be.false;
    result = validators.greaterThanValidator.validate(control, 124, data);
    expect(result.valid).to.be.true;
  });
});

describe('validation - less-than', () => {
  standupValidatorTest(validators.lessThanValidator);

  it('should validate', async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById('age');
    inputAge.value = 30;
    inputAge.dispatchEvent(new Event('change'));
    const inputHeight = document.getElementById('height');
    inputHeight.value = 20;
    inputHeight.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.lessThanValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute('less-than', '#/personalData/height');
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = 15;
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });

  it('should validate different date formats', async () => {
    const control = document.createElement('input');
    control.setAttribute('less-than', 'other');
    const data = { other: '20100305' };
    let result = validators.lessThanValidator.validate(control, '20100304', data);
    expect(result.valid).to.be.true;
    result = validators.lessThanValidator.validate(control, '20100310', data);
    expect(result.valid).to.be.false;
    data.other = '2010-03-05';
    result = validators.lessThanValidator.validate(control, '2010-03-04', data);
    expect(result.valid).to.be.true;
    result = validators.lessThanValidator.validate(control, '2010-03-10', data);
    expect(result.valid).to.be.false;
    result = validators.lessThanValidator.validate(control, '', data);
    expect(result.valid).to.be.false;
    data.other = '';
    result = validators.lessThanValidator.validate(control, '2010-03-10', data);
    expect(result.valid).to.be.false;
    result = validators.lessThanValidator.validate(control, '', data);
    expect(result.valid).to.be.false;
    data.other = 123;
    result = validators.lessThanValidator.validate(control, 122, data);
    expect(result.valid).to.be.true;
    result = validators.lessThanValidator.validate(control, 123, data);
    expect(result.valid).to.be.false;
    result = validators.lessThanValidator.validate(control, 124, data);
    expect(result.valid).to.be.false;
  });
});

describe('validation - max-length', () => {
  standupValidatorTest(validators.maxLengthValidator);

  it('should validate', async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById('name');
    inputName.value = 'Fred Blogs';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.maxLengthValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute('max-length', '8');
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = 'Fred B';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe('validation - min-length', () => {
  standupValidatorTest(validators.minLengthValidator);

  it('should validate', async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById('name');
    inputName.value = 'Fred Blogs';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.minLengthValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute('min-length', '11');
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = 'Fred Bloggs';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe('validation - max', () => {
  standupValidatorTest(validators.maxValidator);

  it('should validate numbers', async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById('age');
    inputAge.value = '20';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.maxValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute('max', '18');
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = '17';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });

  it('should validate dates', async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById('birthDate');
    inputAge.value = '2021-05-01';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.maxValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute('max', '2021-03-01');
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = '2021-01-05';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe('validation - min', () => {
  standupValidatorTest(validators.maxValidator);

  it('should validate numbers', async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById('age');
    inputAge.value = '16';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.maxValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute('min', '18');
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = '19';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });

  it('should validate dates', async () => {
    const formBinder = await createFormBinder();
    const inputAge = document.getElementById('birthDate');
    inputAge.value = '2021-05-01';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.minValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputAge.setAttribute('min', '2021-08-01');
    expect(await formBinder.checkValidity()).to.be.false;
    inputAge.value = '2021-09-05';
    inputAge.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe('validation - pattern', () => {
  standupValidatorTest(validators.patternValidator);

  it('should validate', async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById('name');
    inputName.value = 'Fred Blogs';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.patternValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute('pattern', '^[a-z|\\s]*$');
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = 'fred blogs';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});

describe('validation - required', () => {
  standupValidatorTest(validators.requiredValidator);

  it('should validate', async () => {
    const formBinder = await createFormBinder();
    const inputName = document.getElementById('name');
    inputName.value = '';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
    validatorRegistry.add(validators.requiredValidator);
    expect(await formBinder.checkValidity()).to.be.true;
    inputName.setAttribute('required', '');
    expect(await formBinder.checkValidity()).to.be.false;
    inputName.value = 'fred blogs';
    inputName.dispatchEvent(new Event('change'));
    expect(await formBinder.checkValidity()).to.be.true;
  });
});
