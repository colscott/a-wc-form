/* eslint-disable no-unused-expressions */
/* global describe, it */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { getSchemaValue, getValue, setValue, objectFlat, normalize } from '../../../src/lib/json-pointer.js';
import { data } from '../../../demo/mock.js';
import { schema } from '../../../../json-schema/demo/mock.js';

describe('JSON Pointer', () => {
  it('Should correctly map to data', async () => {
    expect(getValue(data, '#')).to.deep.equal(data);
    expect(getValue(data, '#/')).to.deep.equal(data);
    expect(getValue(data, '')).to.deep.equal(data);
    expect(getValue(data, '#/name')).to.equal(data.name);
    expect(getValue(data, '/name')).to.equal(data.name);
    expect(getValue(data, '#/personalData')).to.deep.equal(data.personalData);
    expect(getValue(data, '/personalData')).to.deep.equal(data.personalData);
    expect(getValue(data, '#/personalData/age')).to.equal(data.personalData.age);
    expect(getValue(data, '/personalData/age')).to.equal(data.personalData.age);
    expect(getValue(data, '#/comments/1')).to.deep.equal(data.comments[1]);
    expect(getValue(data, '/comments/1')).to.deep.equal(data.comments[1]);
    expect(getValue(data, '#/comments/1/date')).to.equal(data.comments[1].date);
    expect(getValue(data, '/comments/1/date')).to.equal(data.comments[1].date);
  });

  it('Should correctly map to schema', async () => {
    expect(getSchemaValue(schema, '#')).to.deep.equal(schema);
    expect(getSchemaValue(schema, '#/')).to.deep.equal(schema.properties);
    expect(getSchemaValue(schema, '#/name')).to.equal(schema.properties.name);
    expect(getSchemaValue(schema, '/name')).to.equal(schema.properties.name);
    expect(getSchemaValue(schema, '#/personalData')).to.deep.equal(schema.properties.personalData);
    expect(getSchemaValue(schema, '/personalData')).to.deep.equal(schema.properties.personalData);
    expect(getSchemaValue(schema, '#/personalData/age')).to.equal(schema.properties.personalData.properties.age);
    expect(getSchemaValue(schema, '/personalData/age')).to.equal(schema.properties.personalData.properties.age);
    expect(getSchemaValue(schema, '#/comments')).to.deep.equal(schema.properties.comments);
    expect(getSchemaValue(schema, '/comments')).to.deep.equal(schema.properties.comments);
    expect(getSchemaValue(schema, '#/comments/0/date')).to.equal(schema.properties.comments.items.properties.date);
    expect(getSchemaValue(schema, '/comments/0/date')).to.equal(schema.properties.comments.items.properties.date);
    expect(getSchemaValue(schema, '#/address/1')).to.equal(schema.properties.address.items[1]);
    expect(getSchemaValue(schema, '/address/1')).to.equal(schema.properties.address.items[1]);
    expect(getSchemaValue(schema, '#/telephoneNumbers/1')).to.equal(schema.properties.telephoneNumbers.items);
    expect(getSchemaValue(schema, '/telephoneNumbers/1')).to.equal(schema.properties.telephoneNumbers.items);
  });

  it('Should set values', () => {
    const t1 = {};
    setValue(t1, '#/name', 1);
    expect(t1).to.eql({ name: 1 });
    setValue(t1, '/name2', 1);
    expect(t1).to.eql({ name: 1, name2: 1 });
    setValue(t1, '#/nested1/age', 1);
    expect(t1).to.eql({ name: 1, name2: 1, nested1: { age: 1 } });
    setValue(t1, '/nested1/age2', 1);
    expect(t1).to.eql({ name: 1, name2: 1, nested1: { age: 1, age2: 1 } });
  });

  it('Should convert object to flat JSON Pointers', () => {
    const testData = { test: { foobar: 't1', arr1: [{ test2: 't2' }, 4] } };
    const result = objectFlat(testData);
    expect(Array.from(result.keys())).to.eql(['/test/foobar', '/test/arr1/0/test2', '/test/arr1/1']);
    expect(Array.from(result.values())).to.eql(['t1', 't2', 4]);
  });

  it('Should normalize JSON pointer references', () => {
    expect(normalize('foobar')).to.equal('/foobar');
    expect(normalize('/foobar')).to.equal('/foobar');
    expect(normalize('#/foobar')).to.equal('/foobar');
  });

  it('Should fill out data structure when setting value', () => {
    testSetValue({}, '#/name', 'fred', { name: 'fred' });
    testSetValue({}, '/name', 'fred', { name: 'fred' });
    testSetValue({}, '/names/0', 'fred', { names: ['fred'] });
    testSetValue({ names: ['bob'] }, '/names/1', 'fred', { names: ['bob', 'fred'] });
    testSetValue({ a: {} }, '/a/b', 123, { a: { b: 123 } });
    testSetValue({ a: { c: true } }, '/a/b', 123, { a: { b: 123, c: true } });
    testSetValue({}, '#/comments/1/message', 'foobar', { comments: [undefined, { message: 'foobar' }] });
  });

  it('Should return null for empty data', () => {
    expect(getValue({}, '#/name')).to.equal(undefined);
    expect(getValue({}, '/name')).to.equal(undefined);
    expect(getValue({}, 'name')).to.equal(undefined);
  });

  // xit("Should correctly set data", async () => {});
});

/**
 * @param {Object.<string, any} seedData
 * @param {string} ref
 * @param {*} value
 * @param {*} expected
 */
function testSetValue(seedData, ref, value, expected) {
  setValue(seedData, ref, value);
  expect(seedData).to.eql(expected);
}
