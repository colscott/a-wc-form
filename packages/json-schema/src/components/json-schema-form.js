import { FormLayout } from 'a-wc-form-layout/src/components/form-layout.js';
import './json-schema-control.js';

/** @typedef {import("../lib/models.js").JsonSchema} JsonSchema */

/**  */
export class JsonSchemaForm extends FormLayout {
  /** @returns {import("a-wc-form-layout/src/lib/models").ComponentTemplate} */
  get layout() {
    return (
      this._layout || {
        template: 'JsonSchemaControl',
        properties: {
          ref: '#',
          type: 'text',
        },
      }
    );
  }

  /** @param {import("a-wc-form-layout/src/lib/models").ComponentTemplate} component to use for form layout */
  set layout(component) {
    super.layout = component;
  }

  /** @returns {import("../lib/models.js").JsonSchema} JSON Schema in use */
  get schema() {
    return this._schema;
  }

  /** @param {import("../lib/models.js").JsonSchema} schema to use */
  set schema(schema) {
    if (this._schema !== schema) {
      this._schema = schema;
      setTimeout(() => this.render());
    }
  }

  /** @returns {import("../lib/models.js").SchemaLayoutContext<import("a-wc-form-layout/src/lib/models").ComponentTemplate>} */
  get context() {
    return {
      ...super.context,
      schema: this.schema,
    };
  }

  /** Renders the UI based on schema */
  render() {
    if (this.schema) {
      super.render();
    }
  }
}

window.customElements.define('json-schema-form', JsonSchemaForm);
