/**
 * Minimal DOM query/manipulation utilities.
 */
export const DomHelper = {
  qs(selector, parent = document) {
    return parent.querySelector(selector);
  },

  qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  },

  on(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },
};
