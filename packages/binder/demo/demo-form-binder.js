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
          }}
          @form-binder:report-validity=${e => this.handleValidation(e)}
        >
          <section>
            <input type="text" pattern="fred.*" name="#/name" />
            <input type="text" pattern="fred.*" name="#/name" />
            <input type="text" pattern="fred.*" name="#/name" />
            <input
              type="number"
              min="40"
              max="150"
              step="1"
              name="#/personalData/age"
            />
            <input type="number" max="50" name="/personalData/age" />
            <input type="number" name="personalData/age" />
            <input name="#/telephoneNumbers/1" />
            <input type="checkbox" id="student" name="/student" />
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
     * @param {CustomEvent} event
     */
    handleValidation(event) {
      /** @type {import('a-wc-form-binder/src/lib/control-validator').FormValidationResult} */
      const { errors } = event.detail;
      errors.forEach(controlErrorEntry => {
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
  }
);
