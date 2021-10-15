/* eslint-disable no-unused-expressions */
/* global describe, it */
import { expect } from '@esm-bundle/chai/esm/chai.js';
import { ShadowDomMutationObserver } from '../../../src/lib/observer.js';

describe('JSON Pointer', () => {
  after(() => {});

  xit('Should observe mutations in shadow DOM', (done) => {
    const rootElem = document.createElement('div');
    rootElem.attachShadow({ mode: 'open' });

    /**
     * @type {MutationCallback}
     * @param {MutationRecord[]} mutationsList .
     */
    const callback = (mutationsList) => {
      mutationsList.forEach((mutation) => {
        mutation.addedNodes.forEach((controlCandidate) => {});
        mutation.removedNodes.forEach((controlCandidate) => {});
      });
    };

    const mutationObserver = new ShadowDomMutationObserver(callback);
    const config = { attributes: false, childList: true, subtree: true };
    mutationObserver.observe(this, config);
  });

  xit('Should observe mutations in light DOM', (done) => {});
});
