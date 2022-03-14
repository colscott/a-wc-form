/* global describe, it */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { getLayout, isRequired } from '../../../src/lib/layout-generator.js';

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
      required: ['name'],
    },
    telephoneNumbers: {
      items: {
        type: 'string',
      },
      type: 'array',
    },
  },
  required: ['name'],
};

const expectedLayout = {
  template: 'VerticalLayout',
  properties: {
    components: [
      {
        properties: {
          description: undefined,
          label: undefined,
          possibleValues: undefined,
          readOnly: false,
          ref: '#/name',
          type: 'text',
          validation: {
            max: undefined,
            maxLength: undefined,
            min: undefined,
            minLength: undefined,
            pattern: undefined,
            required: true,
            step: undefined,
          },
        },
        template: 'Control',
      },
      {
        properties: {
          description: undefined,
          label: undefined,
          possibleValues: undefined,
          readOnly: false,
          ref: '#/age',
          type: 'number',
          validation: {
            max: undefined,
            maxLength: undefined,
            min: undefined,
            minLength: undefined,
            pattern: undefined,
            required: false,
            step: undefined,
          },
        },
        template: 'Control',
      },
      {
        properties: {
          description: undefined,
          label: undefined,
          possibleValues: undefined,
          readOnly: false,
          ref: '#/male',
          type: 'checkbox',
          validation: {
            max: undefined,
            maxLength: undefined,
            min: undefined,
            minLength: undefined,
            pattern: undefined,
            required: false,
            step: undefined,
          },
        },
        template: 'Control',
      },
      {
        properties: {
          components: [
            {
              properties: {
                description: undefined,
                label: undefined,
                possibleValues: undefined,
                readOnly: false,
                ref: '#/children/items/name',
                type: 'text',
                validation: {
                  max: undefined,
                  maxLength: undefined,
                  min: undefined,
                  minLength: undefined,
                  pattern: undefined,
                  required: true,
                  step: undefined,
                },
              },
              template: 'Control',
            },
            {
              properties: {
                description: undefined,
                label: undefined,
                possibleValues: undefined,
                readOnly: false,
                ref: '#/children/items/age',
                type: 'number',
                validation: {
                  max: undefined,
                  maxLength: undefined,
                  min: undefined,
                  minLength: undefined,
                  pattern: undefined,
                  required: false,
                  step: undefined,
                },
              },
              template: 'Control',
            },
          ],
          label: undefined,
          ref: '#/children',
        },
        template: 'GridComponent',
      },
      {
        template: 'ArrayLayout',
        properties: {
          component: {
            properties: {
              description: undefined,
              label: undefined,
              possibleValues: undefined,
              readOnly: false,
              ref: '#/telephoneNumbers/items',
              type: 'text',
              validation: {
                max: undefined,
                maxLength: undefined,
                min: undefined,
                minLength: undefined,
                pattern: undefined,
                required: false,
                step: undefined,
              },
            },
            template: 'Control',
          },
          label: undefined,
          ref: '#/telephoneNumbers',
        },
      },
    ],
    label: undefined,
  },
};

describe('Layout', () => {
  it('Generate from layout', () => {
    expect(getLayout(jsonSchema)).to.deep.equal(expectedLayout);
  });

  it('Should correctly return if required', () => {
    expect(isRequired(jsonSchema, '#/name')).to.be.true;
    expect(isRequired(jsonSchema, '/name')).to.be.true;
    expect(isRequired(jsonSchema, 'name')).to.be.true;
    expect(isRequired(jsonSchema, '#/age')).to.be.false;
    expect(isRequired(jsonSchema, '/age')).to.be.false;
    expect(isRequired(jsonSchema, 'age')).to.be.false;
    expect(isRequired(jsonSchema, '#/children/1/name')).to.be.true;
    expect(isRequired(jsonSchema, '/children/1/name')).to.be.true;
    expect(isRequired(jsonSchema, 'children/1/name')).to.be.true;
    expect(isRequired(jsonSchema, '#/children/1/age')).to.be.false;
    expect(isRequired(jsonSchema, '/children/1/age')).to.be.false;
    expect(isRequired(jsonSchema, 'children/1/age')).to.be.false;
    const arraySchema = {
      type: 'object',
      properties: {
        children: {
          type: 'array',
          items: { type: 'object', properties: { name: { type: 'string' }, age: { type: 'number' } } },
          required: ['name'],
        },
      },
    };
    expect(isRequired(arraySchema, '#/children/1/name')).to.be.true;
    expect(isRequired(arraySchema, '/children/1/name')).to.be.true;
    expect(isRequired(arraySchema, 'children/1/name')).to.be.true;
    expect(isRequired(arraySchema, '#/children/1/age')).to.be.false;
    expect(isRequired(arraySchema, '/children/1/age')).to.be.false;
    expect(isRequired(arraySchema, 'children/1/age')).to.be.false;
  });
});
