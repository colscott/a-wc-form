import { LitElement, html, css } from "lit-element";
import { data } from "./mock.js";
import {
  controlBinder as binder,
  controlBinders as binders,
  formCss
} from "../src/index.js";

binder.add(...Object.values(binders));

const errorText = {
  pattern: error => `${error.field} must begin with fred`,
  min: error => `${error.field} but be greater than ${error.expected}`,
  max: error => `${error.field} but be less than ${error.expected}`,
  "less-than": error => `${error.field} must be less than ${error.expected}`,
  "greater-than": error =>
    `${error.field} must be greater than ${error.expected}`,
  rangeUnderflow: error => ""
};

customElements.define(
  "demo-form-binder",
  class extends LitElement {
    /** @inheritdoc */
    static get properties() {
      return {
        data: { type: Object },
        errors: { type: Array }
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
            grid-template-columns: 1fr min-content;
          }
        `,
        ...formCss.allCss
      ];
    }

    /** @inheritdoc */
    render() {
      return html`
        <form-binder
          @form-binder:change=${e => {
            this.data = e.detail.data;
            this.requestUpdate();
            this.clearErrors();
          }}
          @form-binder:report-validity=${e =>
            this.handleValidation(e.detail.errors)}
        >
          <section>
            <input type="text" pattern="fred.*" name="#/name" />
            <input
              type="number"
              min="40"
              max="50"
              step="1"
              name="#/personalData/age"
            />
            <input name="#/telephoneNumbers/1" />
            <input type="checkbox" id="student" name="/student" />
            <input type="date" name="/birthDate" less-than="/retireDate" />
            <input type="date" name="/retireDate" greater-than="/birthDate" />
            <div>
              <ul>
                ${this.errors.map(controlErrorEntry => {
                  const { controlValidationResults } = controlErrorEntry;
                  return html`
                    <ui
                      >${controlValidationResults.map(
                        k =>
                          html`
                            ${errorText[k.name](k)}
                          `
                      )}</ui
                    >
                    >
                  `;
                })}
              </ul>
            </div>
          </section>
          <section>
            ${JSON.stringify(this.data)}<br />${JSON.stringify(data)}
          </section>
        </form-binder>
      `;
    }

    /** @inheritdoc */
    firstUpdated() {
      super.firstUpdated();
      this.shadowRoot.querySelector("form-binder").data = this.data;
    }

    /**
     * @param {import('a-wc-form-binder/src/lib/control-validator').FormValidationResult} errors
     */
    handleValidation(errors) {
      errors
        .filter(c => c.visited)
        .forEach(controlErrorEntry => {
          const { control, controlValidationResults } = controlErrorEntry;
          // Here you would translate the errors and output them somewhere in the UI
          control.setCustomValidity(
            controlValidationResults // The example outputs in UI using the native API, setCustomValidity
              .map(k => errorText[k.name](k)) // Translate here
              .join(",")
          );
        });
      this.errors = errors;
    }

    /** */
    clearErrors() {
      const form = /** @type {import('a-wc-form-binder/src/components/form-binder').FormBinder} */ (this.shadowRoot.querySelector(
        "form-binder"
      ));
      Array.from(form.registeredControlBinders.keys()).forEach(control =>
        control.setCustomValidity("")
      );
    }
  }
);
