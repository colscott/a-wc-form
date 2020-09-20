import { LitElement, html } from "lit-element";
import { getUiSchema } from "../lib/schema-generator.js";
import { getTemplate } from "../lib/template-registry.js";
import "../templates/controls.js";
import "../templates/layouts.js";

/** @typedef {import("../lib/json-ui-schema-models.js").JsonSchema} JsonSchema */
/** @typedef {import("../lib/json-ui-schema-models.js").JsonUiSchemeContext} JsonUiSchemeContext */

/**  */
export class JsonSchemaUi extends LitElement {
  /** @inheritdoc */
  static get properties() {
    return {
      data: { type: Object },
      schema: { type: Object },
      uiSchema: { type: Object }
    };
  }

  /** @inheritdoc */
  constructor() {
    super();

    /** @type {import("../lib/json-ui-schema-models.js").JsonSchema} */
    this.schema = null;

    /** @type {import("../lib/json-ui-schema-models.js").JsonUiSchema} */
    this.uiSchema = null;

    /** @type {any} */
    this.data = null;
  }

  /** @inheritdoc */
  connectedCallback() {
    this.setAttribute("role", "form");
    super.connectedCallback();
  }

  /** @returns {import('lit-element').TemplateResult} for UI */
  render() {
    if (this.schema !== null && this.data !== null) {
      if (this.uiSchema === null) {
        this.uiSchema = getUiSchema(this.schema);
      }

      /** @type {JsonUiSchemeContext} */
      const context = {
        currentUiSchema: this.uiSchema,
        currentData: this.data,
        rootSchema: this.schema,
        rootUiSchema: this.uiSchema,
        data: this.data
      };

      return getTemplate(context);
    }
    return html``;
  }
}

window.customElements.define("json-schema-ui", JsonSchemaUi);
