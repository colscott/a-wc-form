import { getSchemaValue } from "a-wc-form-binder/src/lib/json-pointer";
import { LitElement, html } from "lit-element";
import { jsonTypeMapping } from "../templates/controls.js";

/**
 * @param {string} selector CSS selector to match
 * @param {Element} startElem to search from
 * @returns {Element}
 */
function closest(selector, startElem) {
  const ancestor = startElem.closest(selector);
  if (ancestor === null) {
    const rootNode = startElem.getRootNode();
    if (rootNode instanceof ShadowRoot) {
      return closest(selector, rootNode.host);
    }
    return null;
  }
  return ancestor;
}

/** */
export class JsonSchemaControl extends LitElement {
  /** @inheritdoc */
  static get properties() {
    return {
      ref: { type: String },
      schema: { type: Object }
    };
  }

  /** @returns {import('../lib/models').JsonSchema} */
  get schema() {
    if (!this._schema) {
      const form = /** @type {import('./json-schema-form').JsonSchemaForm} */ (closest(
        "json-schema-form",
        this
      ));
      if (form) {
        this.schema = form.schema;
      }
    }
    return this._schema;
  }

  /** @param {import('../lib/models').JsonSchema} schema */
  set schema(schema) {
    this._schema = schema;
  }

  /** Initialize */
  constructor() {
    super();

    this.style.display = "contents";
    this.schema = null;

    /** @type {string} */
    this.ref = "";
  }

  /** @inheritdoc */
  createRenderRoot() {
    return this;
  }

  /** @inheritdoc */
  render() {
    if (this.ref && this.schema) {
      /** @type {{type: string}} schema to generate uiSchema for */
      const currentSchema = getSchemaValue(this.schema, this.ref);
      return jsonTypeMapping[currentSchema.type](this.schema, this.ref);
    }
    return html``;
  }
}

customElements.define("json-schema-control", JsonSchemaControl);
