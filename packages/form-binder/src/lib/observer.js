/**
 * @param {Node} node
 * @param {MutationObserver} observer
 * @param {MutationObserverInit} config
 */
function observeShadowRoots(node, observer, config) {
  observer.observe(node, config);
  if (node instanceof Element || node instanceof ShadowRoot) {
    const children = node.querySelectorAll("*");
    children.forEach(child => {
      if (child.shadowRoot) {
        observeShadowRoots(child.shadowRoot, observer, config);
      }
    });
  }
}

/** */
export class ShadowDomMuationObserver {
  /** @param {MutationCallback} callback */
  constructor(callback) {
    this.observer = new MutationObserver(callback);
  }

  /**
   *
   * @param {Node} targetNode
   * @param {MutationObserverInit} [config]
   */
  observe(targetNode, config) {
    observeShadowRoots(targetNode, this.observer, config);
  }

  /** Disconnects the mutation observer */
  disconnect() {
    this.observer.disconnect();
  }

  /** @returns {Array<MutationRecord>} */
  takeRecords() {
    return this.observer.takeRecords();
  }
}
