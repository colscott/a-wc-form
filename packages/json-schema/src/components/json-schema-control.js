import { html, render } from 'lit';
import { getComponentTemplate, setComponentTemplate } from 'a-wc-form-layout/src/lib/template-registry.js';
import { getLayout } from '../lib/layout-generator.js';

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
export class JsonSchemaControl extends HTMLElement {
  /** Set attribute changes to listen for */
  static get observedAttributes() {
    return ['ref'];
  }

  /**
   * React to attribute changes
   * @param {string} name of the attribute that changed
   * @param {string} oldValue of the attribute that changed
   * @param {string} newValue of the attribute that changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'ref' && oldValue !== newValue) {
      this.ref = newValue;
    }
  }

  /** @returns {string} the JSON Pointer this control is using to access data */
  get ref() {
    return this._ref;
  }

  /** @param {string} ref the JSON Pointer this control is using to access data */
  set ref(ref) {
    if (this.ref !== ref) {
      this._ref = ref;
      this._initLayout();
      this.requestUpdate();
    }
  }

  /** @returns {import('../lib/models').JsonSchema} */
  get schema() {
    if (!this._schema && this.isConnected) {
      const form = /** @type {Element&{schema: import("../lib/models").JsonSchema}} */ (closest(
        'json-schema-form',
        this.parentElement || /** @type {ShadowRoot} */ (this.getRootNode()).host,
      ));
      if (form) {
        this._initLayout();
        return form.schema;
      }
    }
    return this._schema;
  }

  /** @param {import('../lib/models').JsonSchema} schema */
  set schema(schema) {
    if (this.schema !== schema) {
      this._schema = schema;
      this._initLayout();
      this.requestUpdate();
    }
  }

  /** @inheritdoc */
  connectedCallback() {
    this.style.display = 'contents';
  }

  /** Initialize */
  constructor() {
    super();

    this._requestedUpdate = false;

    this.schema = null;
    /** @type {import("a-wc-form-layout/src/lib/models").ComponentTemplate} */
    this.layout = null;

    /** @type {string} */
    this.ref = null;
  }

  /** @private */
  _initLayout() {
    if (this.ref !== null && this.schema) {
      this.layout = getLayout(this.schema, this.ref);
    }
  }

  /** @protected */
  requestUpdate() {
    if (!this._requestedUpdate) {
      this._requestedUpdate = true;
      setTimeout(() => {
        this._requestedUpdate = false;
        this.render();
      });
    }
  }

  /** @inheritdoc */
  render() {
    if (this.ref && this.schema && this.layout) {
      render(getComponentTemplate(this.context.component.template)(this.context), this);
    }
  }

  /** @returns {import("a-wc-form-layout/src/lib/models").LayoutContext<import("a-wc-form-layout/src/lib/models").ComponentTemplate>} */
  get context() {
    return {
      component: this.layout,
    };
  }
}

customElements.define('json-schema-control', JsonSchemaControl);

/**
 * @param {import("../lib/models.js").SchemaLayoutContext<import("../lib/models").JsonSchemaControl>} context
 * @returns {import('lit').TemplateResult}
 */
function jsonSchemaTemplate(context) {
  return html`
    <json-schema-control
      ref=${context.component.properties.ref}
      .schema=${context.component.properties.schema}
    ></json-schema-control>
  `;
}

setComponentTemplate('JsonSchemaControl', jsonSchemaTemplate);
