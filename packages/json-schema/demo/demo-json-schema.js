import { LitElement, html, css } from "lit-element";
import { data } from "a-wc-form-binder/demo/mock.js";
import {
  controlBinder as binder,
  controlBinders as binders
} from "a-wc-form-binder";
import { schema, layout } from "./mock.js";
import "../src/components/json-schema-form.js";
import "../src/components/json-schema-control.js";

binder.add(...Object.values(binders));

customElements.define(
  "test-json-ui-schema",
  class extends LitElement {
    /** @inheritdoc */
    static get styles() {
      return css`
        :host {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        :invalid {
          border: 1px solid red;
        }
      `;
    }

    /** @inheritdoc */
    static get properties() {
      return {
        data: { type: Object }
      };
    }

    /** @inheritdoc */
    constructor() {
      super();
      this.data = data;
    }

    /** @inheritdoc */
    render() {
      return html`
        <section class="examples">
          <h2>json-schema-form</h2>
          <br />
          <json-schema-form
            @form-binder:change=${e => {
              this.data = e.detail.data;
              this.requestUpdate();
            }}
            .data=${this.data}
            .schema=${schema}
          ></json-schema-form
          ><br />

          <h2>json-schema-form</h2>
          <br />
          <json-schema-form
            @form-binder:change=${e => {
              this.data = e.detail.data;
              this.requestUpdate();
            }}
            .data=${this.data}
            .schema=${schema}
            .layout=${layout}
          ></json-schema-form
          ><br />

          <h2>json-schema-form</h2>
          <br />
          <json-schema-form
            @form-binder:change=${e => {
              this.data = e.detail.data;
              this.requestUpdate();
            }}
            .data=${this.data}
            .schema=${schema}
          >
            <h2>json-schema-control</h2>
            <br />
            <json-schema-control ref="/name"></json-schema-control>
            <json-schema-control ref="/vegetarian"></json-schema-control>
            <json-schema-control ref="/postalCode"></json-schema-control>
            <json-schema-control ref="/personalData"></json-schema-control>
            <json-schema-control ref="/personalData/age"></json-schema-control>
            <json-schema-control ref="/comments"></json-schema-control>
            <json-schema-control ref="/comments/1/date"></json-schema-control>
            <json-schema-control ref="/telephoneNumbers"></json-schema-control>
            <json-schema-control
              ref="/telephoneNumbers/1"
            ></json-schema-control>
          </json-schema-form>
        </section>
        <section class="data">
          <pre>${JSON.stringify(this.data, null, 2)}</pre>
        </section>
      `;
    }
  }
);
