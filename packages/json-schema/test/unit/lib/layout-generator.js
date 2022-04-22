/* global describe, it */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { getLayout, isRequired, getPossibleValues } from '../../../src/lib/layout-generator.js';

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
    favoriteFoods: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['pizza', 'cheese', 'humus'],
        uniqueItems: true,
        minItems: 1,
      },
    },
    favoriteFood: {
      type: 'string',
      enum: ['pizza', 'cheese', 'humus'],
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
      {
        template: 'ArrayControl',
        properties: {
          label: undefined,
          possibleValues: ['pizza', 'cheese', 'humus'],
          readOnly: false,
          ref: '#/favoriteFoods',
          validation: {
            required: false,
          },
        },
      },
      {
        template: 'Control',
        properties: {
          description: undefined,
          label: undefined,
          possibleValues: ['pizza', 'cheese', 'humus'],
          readOnly: false,
          ref: '#/favoriteFood',
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

  it('should generate possible values', async () => {
    const actual1 = getPossibleValues({
      type: 'integer',
      oneOf: [
        { enum: [0], description: 'value0' },
        { enum: [1], description: 'value1' },
      ],
    });

    const expected = [
      { label: 'value0', value: '0' },
      { label: 'value1', value: '1' },
    ];
    expect(actual1).to.eql(expected);

    const actual2 = getPossibleValues({
      type: 'integer',
      oneOf: [
        { const: 0, description: 'value0' },
        { const: 1, description: 'value1' },
      ],
    });
    expect(actual2).to.eql(expected);

    const actual3 = getPossibleValues({ type: 'integer', enum: [0, 1], 'x-enumNames': ['value0', 'value1'] });
    expect(actual3).to.eql(expected);

    const actual4 = getPossibleValues({ type: 'integer', enum: [0, 1], 'x-enum-varnames': ['value0', 'value1'] });
    expect(actual4).to.eql(expected);

    expect(getPossibleValues({ type: 'string', enum: ['value0', 'value1'] })).to.eql(['value0', 'value1']);
  });
});
