import { getSchemaValue } from "a-wc-form-binder/src/lib/json-pointer";
import { getComponentTemplate, setComponentTemplate } from "a-wc-form-layout";
import { LitElement, html } from "lit-element";
// import { jsonTypeMapping } from "../templates/controls.js";
import "../lib/layout-generator.js";
import { getLayout } from "../lib/layout-generator.js";

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
      const form = /** @type {Element&{schema: import("../lib/models").JsonSchema}} */ (closest(
        "form-layout, form-binder",
        this.parentElement ||
          /** @type {ShadowRoot} */ (this.getRootNode()).host
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
      const layout = getLayout(this.schema, this.ref);
      return getComponentTemplate(layout.template)({
        component: layout
      });
    }
    return html``;
  }
}

customElements.define("json-schema-control", JsonSchemaControl);

/**
 * @param {import("../lib/models.js").SchemaLayoutContext<import("../lib/models").JsonSchemaControl>} context
 * @returns {import('lit-html').TemplateResult}
 */
function jsonSchemaTemplate(context) {
  return html`
    <json-schema-control
      ref=${context.component.properties.ref}
      .schema=${context.component.properties.schema}
    ></json-schema-control>
  `;
  // const { ref } = context.component.properties;
  // const { schema } = context;
  // /** @type {import("../lib/models").JsonSchema} schema to generate uiSchema for */
  // const currentSchema = getSchemaValue(schema, ref);
  // return jsonTypeMapping[currentSchema.type](schema, ref);
}

setComponentTemplate("JsonSchemaControl", jsonSchemaTemplate);
