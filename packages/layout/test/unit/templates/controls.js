/* global describe, it, afterEach */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { render } from 'lit-html';
import '../../../src/components/form-layout.js';
import { getComponentTemplate } from '../../../src/lib/template-registry.js';

const layoutSchema = {
  template: 'VerticalLayout',
  properties: {
    components: [
      {
        template: 'Control',
        properties: {
          description: 'name description',
          label: 'name label',
          readOnly: true,
          ref: '#/name',
          type: 'text',
          validation: {
            maxLength: 10,
            minLength: 2,
            pattern: '[a-z]',
            required: true,
          },
        },
      },
      {
        template: 'Control',
        properties: {
          description: 'age description',
          label: 'age label',
          readOnly: true,
          ref: '#/age',
          type: 'number',
          validation: {
            max: 10,
            min: 2,
            required: true,
            step: 2,
          },
        },
      },
      {
        template: 'Control',
        properties: {
          description: 'accept description',
          label: 'accept label',
          ref: '#/accept',
          type: 'checkbox',
        },
      },
      {
        template: 'Textarea',
        properties: {
          description: 'description description',
          label: 'description label',
          ref: '#/description',
          cols: 20,
          rows: 5,
          readOnly: false,
          validation: {
            minLength: 10,
            maxLength: 50,
            required: true,
          },
        },
      },
      {
        template: 'GridComponent',
        properties: {
          components: [
            {
              template: 'Control',
              properties: {
                readOnly: false,
                ref: '#/children/items/name',
                type: 'text',
              },
            },
            {
              template: 'Control',
              properties: {
                ref: '#/children/items/age',
                type: 'number',
              },
            },
          ],
          label: 'grid label',
          ref: '#/children',
        },
      },
      {
        template: 'ArrayLayout',
        properties: {
          component: {
            template: 'Control',
            properties: {
              ref: '#/telephoneNumbers/items',
              type: 'text',
            },
          },
          label: 'Array label',
          ref: '#/telephoneNumbers',
        },
      },
      {
        template: 'ArrayControl',
        properties: {
          label: 'ArrayControl label',
          description: 'ArrayControl description',
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
          label: 'Enum label',
          description: 'Enum description',
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
      {
        template: 'Control',
        properties: {
          label: 'Password label',
          description: 'Password description',
          readOnly: false,
          ref: '#/password',
          type: 'password',
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
    label: 'Vertical Layout label',
  },
};

const expectedHtml = `
<div class="vertical-title">Vertical Layout label</div>
<div class="vertical-layout" style="display: grid; grid-template-columns: 1fr; gap: var(--form-pad, 16px);" aria-label="Vertical Layout label">
  <span>
    <label style="display: block;" for="#/name" title="name description">name label</label>
    <input type="text" name="#/name" bind="#/name" aria-label="name label" aria-description="name description" minlength="2" maxlength="10" required="" aria-required="true" pattern="[a-z]" title="name description" aria-readonly="true" readonly="">
  </span>

  <span>
    <label style="display: block;" for="#/age" title="age description">age label</label>
    <input type="number" name="#/age" bind="#/age" aria-label="age label" aria-description="age description" min="2" aria-valuemin="2" max="10" aria-valuemax="10" step="2" required="" aria-required="true" title="age description" aria-readonly="true" readonly="">
  </span>

  <span>
    <label style="display: block;" for="#/accept" title="accept description">accept label</label>
    <input type="checkbox" name="#/accept" bind="#/accept" aria-label="accept label" aria-description="accept description" aria-required="false" title="accept description">
  </span>

  <span>
    <label style="display:block;" for="#/description" title="description description">description label</label>
    <textarea name="#/description" bind="#/description" aria-label="description label" aria-description="description description" rows="5" cols="20" minlength="10" maxlength="50" required="" aria-required="true" aria-readonly="false"></textarea>
  </span>
  <div class="grid-title">grid label</div>
  <div form-layout-grid="" class="grid-layout" name="#/children" bind="#/children" style="display: grid; grid-template-columns: repeat(2, minmax(max-content, 1fr)); grid-gap: var(--form-pad, 16px); align-items: center; width: max-content;"></div>
  <div class="array-title">Array label</div>
  <div form-layout-array="" class="array-layout" style="display: flex; flex-wrap: nowrap; flex-direction: column; align-content: stretch; gap: var(--form-pad, 16px);" name="#/telephoneNumbers" bind="#/telephoneNumbers"></div>

  <span>
    <label style="display:block;" for="#/favoriteFoods" title="ArrayControl description">ArrayControl label</label>
    <select multiple="" name="#/favoriteFoods" bind="#/favoriteFoods">
      <option value="pizza">pizza</option>
      <option value="cheese">cheese</option>
      <option value="humus">humus</option>
    </select>
  </span>

  <span>
    <label style="display:block; "for="#/favoriteFood" title="Enum description">Enum label</label>
    <select name="#/favoriteFood" bind="#/favoriteFood">
      <option value="pizza">pizza</option>
      <option value="cheese">cheese</option>
      <option value="humus">humus</option>
    </select>
  </span>

  <span>
    <label style="display: block;" for="#/password" title="Password description">Password label</label>
    <input type="password" name="#/password" bind="#/password" aria-label="Password label" aria-description="Password description" aria-required="false" title="Password description" aria-readonly="false">
  </span>
</div>
`;

describe('Layout', () => {
  afterEach(() => {
    const outputContainer = document.querySelector('.output-container');
    if (outputContainer) {
      outputContainer.parentElement.removeChild(outputContainer);
    }
  });
  it('Generate from layout', async () => {
    const outputContainer = document.createElement('div');
    outputContainer.className = 'output-container';
    render(
      getComponentTemplate(layoutSchema.template)({
        component: layoutSchema,
      }),
      outputContainer,
    );
    expect(outputContainer.innerHTML.replace(/<!--.*?-->/g, '').replace(/\s+/g, '')).to.deep.equal(
      expectedHtml.replace(/\s+/g, ''),
    );
  });
});
