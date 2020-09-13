import { LitElement, html } from "lit-element";
import { getLayoutTemplate } from "../lib/template-registry.js";
import "../templates/controls.js";
import "../templates/layouts.js";

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

    /** @type {JSONSchema} */
    this.schema = null;

    /** @type {JsonUiSchema} */
    this.uiSchema = null;

    /** @type {any} */
    this.data = null;
  }

  /** @returns {import('lit-element').TemplateResult} for UI */
  render() {
    if (this.schema !== null && this.uiSchema !== null && this.data !== null) {
      /** @type {JsonUiSchemeContext} */
      const context = {
        currentSchema: this.schema,
        currentUiSchema: this.uiSchema,
        currentData: this.data,
        rootSchema: this.schema,
        rootUiSchema: this.uiSchema,
        data: this.data
      };

      return getLayoutTemplate(context);
    }
    return html``;
  }
}

window.customElements.define("json-schema-ui", JsonSchemaUi);
