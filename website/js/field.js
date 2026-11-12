// @ts-check
/**
 * Minimale Feld-Abstraktion. Wird bei der Migration zur vollen
 * Field-API ausgebaut. Heute: input/textarea vs. contenteditable.
 */
export const Field = {
  /** @param {Node | Element | null} el */
  isNative(el) {
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
  },
  /**
   * @param {Node | Element | null} el
   * @returns {string}
   */
  getValue(el) {
    if (!el) return '';
    if (Field.isNative(el)) return /** @type {HTMLInputElement | HTMLTextAreaElement} */ (el).value;
    return el.textContent || '';
  },
  /**
   * @param {Node | Element | null} el
   * @param {string} v
   */
  setValue(el, v) {
    if (!el) return;
    if (Field.isNative(el)) {
      /** @type {HTMLInputElement | HTMLTextAreaElement} */ (el).value = v;
    } else {
      el.textContent = v;
    }
  }
};
