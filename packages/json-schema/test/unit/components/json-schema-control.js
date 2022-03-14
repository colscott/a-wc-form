/* global describe, it */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import '../../../src/components/json-schema-form.js';
import '../../../src/components/json-schema-control.js';

/**
 * @typedef {Object} Child
 * @property {string} name
 * @property {number} age
 */
/**
 * @typedef {Object} MockData
 * @property {string} name
 * @property {number} age
 * @property {boolean} male
 * @property {Array<Child>} children
 */

const mockData = {
  name: 'fred',
  age: 34,
  male: true,
  children: [
    {
      name: 'bubble',
      age: 3,
    },
    {
      name: 'squeak',
      age: 6,
    },
  ],
};

const jsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    age: {
      type: 'number',
    },
    male: {
      type: 'boolean',
    },
    children: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
        },
      },
    },
  },
};

/** @returns {Promise<{jsonSchemaForm: JsonSchemaForm, eventDetail: FormBinderChangeEventDetail}>} */
async function createJsonFormBinder() {
  const data = JSON.parse(JSON.stringify(mockData));
  const formBinder = /** @type {import('../../../src/components/form-binder.js').FormBinder<MockData>} */ (document.createElement(
    'json-schema-form',
  ));
  formBinder.data = data;
  formBinder.schema = JSON.parse(JSON.stringify(jsonSchema));
  document.body.appendChild(formBinder);
  // const jsonSchemaControl = document.createElement('json-schema-control');
  // formBinder.appendChild(jsonSchemaControl);
  /** @type {import('../../../src/components/form-binder').FormBinderChangeEventDetail<MockData>} */
  const eventDetail = { data, jsonPointer: null, value: null, validationResults: null };
  formBinder.addEventListener('form-binder:change', e => {
    const event = /** @type {import('../../../src/components/form-binder').FormBinderChangeEvent<MockData>} */ (e);
    eventDetail.data = event.detail.data;
    eventDetail.jsonPointer = event.detail.jsonPointer;
    eventDetail.value = event.detail.value;
    eventDetail.validationResults = event.detail.validationResults;
  });
  return { jsonSchemaForm: formBinder, eventDetail };
}

describe('Layout', () => {
  it('Should reflect changes to the schema', async () => {
    const form = await createJsonFormBinder();
    await new Promise(res => setTimeout(res));
    let jsonSchemaControl = form.jsonSchemaForm.querySelector('json-schema-control');
    await new Promise(res => setTimeout(res));
    const inputBinders = Array.from(jsonSchemaControl.querySelectorAll('input')).map(input =>
      input.getAttribute('bind'),
    );
    expect(inputBinders.length).to.equal(7);
    expect(inputBinders).to.eql([
      '#/name',
      '#/age',
      '#/male',
      '#/children/0/name',
      '#/children/0/age',
      '#/children/1/name',
      '#/children/1/age',
    ]);
    const newSchema = JSON.parse(JSON.stringify(form.schema));
    delete newSchema.children;
    newSchema.foobar = {
      type: 'string',
    };
    form.schema = newSchema;
    await new Promise(res => setTimeout(res));
    let jsonSchemaControl = form.jsonSchemaForm.querySelector('json-schema-control');
    await new Promise(res => setTimeout(res));
    const inputBinders = Array.from(jsonSchemaControl.querySelectorAll('input')).map(input =>
      input.getAttribute('bind'),
    );
    expect(inputBinders.length).to.equal(4);
    expect(inputBinders).to.eql(['#/name', '#/age', '#/male', '#/foobar']);
  });
});
