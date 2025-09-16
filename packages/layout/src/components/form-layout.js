import { render } from 'lit';
import { FormBinder } from 'a-wc-form-binder/src/components/form-binder.js';
import { getComponentTemplate } from '../lib/template-registry.js';
import '../templates/controls.js';
import '../templates/layouts.js';
/** @typedef {import("../lib/models.js").LayoutContext<import("../lib/models.js").ComponentTemplate>} LayoutContext */

/**  */
export class FormLayout extends FormBinder {
  /** @returns {import("../lib/models.js").ComponentTemplate} */
  get layout() {
    return this._layout;
  }

  /** @param {import("../lib/models.js").ComponentTemplate} component to use for form layout */
  set layout(component) {
    if (this._layout !== component) {
      this._layout = component;
      this.requestUpdate();
    }
  }

  /** @inheritdoc */
  constructor() {
    super();

    this._requestedUpdate = false;
    this.layout = null;
    this.hasSlottedContent = false;
  }

  /** @inheritdoc */
  connectedCallback() {
    this.hasSlottedContent = !!this.children.length;
    this.setAttribute('role', 'form');
    super.connectedCallback();
  }

  /** @inheritdoc */
  disconnectedCallback() {
    if (this.hasSlottedContent === false) {
      render('', this);
    }
    super.disconnectedCallback();
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

  /** Renders the UI based on uiSchema only if user did not populate HTML themselves */
  render() {
    if (this.layout && this.hasSlottedContent === false && this.data !== null) {
      render(getComponentTemplate(this.context.component.template)(this.context), this);
    }
  }

  /** @returns {LayoutContext} */
  get context() {
    return {
      component: this.layout,
    };
  }
}

window.customElements.define('form-layout', FormLayout);
