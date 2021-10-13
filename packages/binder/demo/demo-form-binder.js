import { html } from 'lit-element';
import { binderRegistry, binders } from '../src/index.js';

import { BaseDemo } from './base-demo.js';

binderRegistry.add(...Object.values(binders));

const errorText = {
  pattern: (error) => `${error.field} must begin with fred`,
  min: (error) => `${error.field} must be greater than ${error.expected}`,
  max: (error) => `${error.field} must be less than ${error.expected}`,
  'less-than': (error) => `${error.field} must be less than ${error.expected}`,
  'greater-than': (error) => `${error.field} must be greater than ${error.expected}`,
  rangeUnderflow: (error) => '',
};

customElements.define(
  'demo-form-binder',
  class extends BaseDemo {
    /** @return {import('lit-element').TemplateResult} */
    get renderForm() {
      return html`
        <form-binder
          @form-binder-change=${(e) => {
            this.data = e.detail.data;
            this.requestUpdate();
            this.clearErrors();
          }}
          @form-binder-report-validity=${(e) => this.handleValidation(e.detail.errors)}
        >
          <input type="text" pattern="fred.*" bind="#/name" />
          <input type="text" pattern="fred.*" bind="#/name" />
          <input type="number" min="40" max="50" step="1" bind="#/personalData/age" />
          <input bind="#/telephoneNumbers/1" />
          <input type="checkbox" id="student" bind="/student" />
          <input id="occupation" bind="/occupation" bind-attr:disabled="/student" />
          <input type="date" bind="/birthDate" bind-attr:max="/retireDate" />
          <input type="date" bind="/retireDate" bind-attr:min="/birthDate" />
          <div>
            <ul>
              ${this.errors.map((controlErrorEntry) => {
                const { controlValidationResults } = controlErrorEntry;
                return html` <ui>${controlValidationResults.map((k) => html` ${errorText[k.name](k)} `)}</ui> `;
              })}
            </ul>
          </div>
        </form-binder>
      `;
    }
  },
);
