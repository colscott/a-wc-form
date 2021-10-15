import { LitElement, html, css } from 'lit-element';
import { data } from './mock.js';
import { binderRegistry, binders, formCss } from '../src/index.js';

binderRegistry.add(...Object.values(binders));

const errorText = {
  pattern: (error) => `${error.field} must begin with fred`,
  min: (error) => `${error.field} but be greater than ${error.expected}`,
  max: (error) => `${error.field} but be less than ${error.expected}`,
  'less-than': (error) => `${error.field} must be less than ${error.expected}`,
  'greater-than': (error) => `${error.field} must be greater than ${error.expected}`,
  rangeUnderflow: (error) => '',
};

/** Demo base class */
export class BaseDemo extends LitElement {
  /** @inheritdoc */
  static get properties() {
    return {
      data: { type: Object },
      errors: { type: Array },
    };
  }

  /** @inheritdoc */
  constructor() {
    super();
    this.data = data;
    /** @type {import('a-wc-form-binder/src/lib/control-validator').ValidationResults} */
    this.errors = [];
  }

  /** @inheritdoc */
  static get styles() {
    return [
      css`
        :host {
          display: grid;
          grid-template-columns: 1fr min-content min-content;
        }
      `,
      ...formCss.allCss,
    ];
  }

  /** @inheritdoc */
  render() {
    return html`
      <section>${this.renderForm}</section>
      <section>
        <h2>Original data</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </section>
      <section>
        <h2>Live data</h2>
        <pre>${JSON.stringify(this.data, null, 2)}</pre>
      </section>
    `;
  }

  /** @return {import('lit-element').TemplateResult} */
  renderForm() {
    return null;
  }

  /** @inheritdoc */
  firstUpdated() {
    super.firstUpdated();
    this.shadowRoot.querySelector('form-binder').data = this.data;
  }

  /**
   * @param {import('a-wc-form-binder/src/lib/control-validator').FormValidationResult} errors
   */
  handleValidation(errors) {
    errors
      .filter((c) => c.visited)
      .forEach((controlErrorEntry) => {
        const { control, controlValidationResults } = controlErrorEntry;
        // Here you would translate the errors and output them somewhere in the UI
        control.setCustomValidity(
          controlValidationResults // The example outputs in UI using the native API, setCustomValidity
            .map((k) => errorText[k.name](k)) // Translate here
            .join(','),
        );
      });
    this.errors = errors;
  }

  /** */
  clearErrors() {
    const form = /** @type {import('a-wc-form-binder/src/components/form-binder').FormBinder} */ (
      this.shadowRoot.querySelector('form-binder')
    );
    Array.from(form.registeredControlBinders.keys()).forEach((control) => control.setCustomValidity(''));
  }
}
