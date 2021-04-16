import { LitElement, html } from "lit-element";
import { getUiSchema } from "../lib/schema-generator.js";
import { getTemplate } from "../lib/template-registry.js";
import "../templates/controls.js";
import "../templates/layouts.js";

/** @typedef {import("../lib/json-ui-schema-models.js").JsonSchema} JsonSchema */
/** @typedef {import("../lib/json-ui-schema-models.js").JsonUiSchemeContext} JsonUiSchemeContext */

/**  */
class JsonSchemaForm extends LitElement {
  /** @inheritdoc */
  static get properties() {
    return {
      data: { type: Object },
      schema: { type: Object },
      uiSchema: { type: Object },
    };
  }

  /** @returns {import("../lib/json-ui-schema-models.js").JsonUiSchema} */
  get uiSchema() {
    if (!this._uiSchema) {
      this.uiSchema = getUiSchema(this.schema);
    }
    return this._uiSchema;
  }

  /** @param {import("../lib/json-ui-schema-models.js").JsonUiSchema} uiSchema to use for form layout */
  set uiSchema(uiSchema) {
    this._uiSchema = uiSchema;
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

  /** @override to remove shadow DOM */
  createRenderRoot() {
    return this;
  }

  /** @returns {import('lit-element').TemplateResult} for UI */
  render() {
    if (this.schema !== null && this.data !== null) {
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

window.customElements.define("json-schema-form", JsonSchemaForm);
