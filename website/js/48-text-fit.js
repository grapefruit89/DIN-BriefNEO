// @ts-check
// @adr [[ADR-JS]] {TextFitEngine}
// @guide [[no-scroll-techniques]]

/**
 * @typedef {Object} TextFitOptions
 * @property {(message: string, type?: string) => void} [onToast]
 * @property {() => void} [onSaveDraft]
 */

/**
 * Visuelle Schriftskalierung laeuft seit Chrome 150 ueber natives CSS
 * `text-fit: shrink` (layout.css, Untergrenze aktuell 60%, noch nicht live
 * verifiziert). Diese Klasse tut nur noch das, was CSS nicht kann: erkennen,
 * ob ein Feld selbst bei maximaler CSS-Schrumpfung noch echt ueberlaeuft,
 * und in dem Fall weitere Eingabe blockieren/zurueckrollen.
 */
export class TextFitEngine {
  /**
   * @param {TextFitOptions} [options]
   */
  constructor(options = {}) {
    /** @type {TextFitOptions} */
    this.options = options;

    /** @type {Set<HTMLElement>} */
    this.monitoredElements = new Set();

    /** @type {WeakMap<HTMLElement, string>} */
    this.lastValidText = new WeakMap();

    /** @type {boolean} */
    this.isRollingBack = false;

    /** @type {MutationObserver | null} */
    this.observer = null;
  }

  init() {
    this.scanDOM();
    this.attachEventListeners();
    this.initMutationObserver();
  }

  scanDOM() {
    this.monitoredElements.clear();
    const singleLines = document.querySelectorAll('.single-line[contenteditable]');
    singleLines.forEach(elem => {
      const el = /** @type {HTMLElement} */ (elem);
      this.monitoredElements.add(el);
      this.lastValidText.set(el, el.textContent || '');
    });
  }

  /**
   * Ist das Feld selbst nach der nativen CSS-Schrumpfung noch zu breit?
   * @param {HTMLElement} el
   * @returns {boolean}
   */
  isOverflowing(el) {
    return el.scrollWidth > el.clientWidth;
  }

  /**
   * Attach input, keydown, and focus listeners
   */
  attachEventListeners() {
    this.monitoredElements.forEach(el => {
      el.addEventListener('focus', () => {
        if (!this.isOverflowing(el)) {
          this.lastValidText.set(el, el.textContent || '');
        }
      });

      // Keydown pre-check: blockiert weitere Zeichen, wenn bereits jetzt Ueberlauf besteht
      el.addEventListener('keydown', (e) => {
        const keyboardEvent = /** @type {KeyboardEvent} */ (e);
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(keyboardEvent.key) || keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
          return;
        }

        const sel = window.getSelection();
        const hasSelection = sel ? sel.toString().length > 0 : false;
        if (this.isOverflowing(el) && !hasSelection) {
          keyboardEvent.preventDefault();
          this.notifyToast();
        }
      });

      // Input event handler: Rollback bei Ueberlauf, sonst letzten gueltigen Stand merken
      el.addEventListener('input', () => {
        if (this.isRollingBack) return;

        if (this.isOverflowing(el)) {
          this.isRollingBack = true;
          const previousText = this.lastValidText.get(el) || '';
          el.textContent = previousText;
          this.restoreCaretToEnd(el);
          this.isRollingBack = false;
          this.notifyToast();
        } else {
          this.lastValidText.set(el, el.textContent || '');
          if (this.options.onSaveDraft) {
            this.options.onSaveDraft();
          }
        }
      });
    });
  }

  notifyToast() {
    if (this.options.onToast) {
      this.options.onToast('Maximalbreite erreicht', 'warning');
    }
  }

  /**
   * Helper to restore caret to end of element
   * @param {HTMLElement} el
   */
  restoreCaretToEnd(el) {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Initialize MutationObserver to catch programmatic text changes
   */
  initMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      if (this.isRollingBack) return;
      mutations.forEach(mutation => {
        const target = /** @type {HTMLElement} */ (mutation.target);
        const singleLine = target.closest ? target.closest('.single-line[contenteditable]') : null;
        if (singleLine) {
          const el = /** @type {HTMLElement} */ (singleLine);
          if (!this.isOverflowing(el)) {
            this.lastValidText.set(el, el.textContent || '');
          }
        }
      });
    });

    this.monitoredElements.forEach(el => {
      if (this.observer) {
        this.observer.observe(el, { characterData: true, childList: true, subtree: true });
      }
    });
  }
}
