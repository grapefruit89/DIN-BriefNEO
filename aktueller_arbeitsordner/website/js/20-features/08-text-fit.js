// @ts-check
// @adr [[ADR-JS]] {TextFitEngine}
// @guide [[no-scroll-techniques]]

/**
 * @typedef {Object} TextFitOptions
 * @property {(message: string, type?: string) => void} [onToast]
 * @property {() => void} [onSaveDraft]
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

    /** @type {Set<HTMLElement>} */
    this.monitoredGroups = new Set();

    /** @type {WeakMap<HTMLElement, string>} */
    this.lastValidText = new WeakMap();

    /** @type {boolean} */
    this.isEvaluating = false;

    /** @type {boolean} */
    this.isRollingBack = false;

    /** @type {MutationObserver | null} */
    this.observer = null;
  }

  init() {
    this.scanDOM();
    this.attachEventListeners();
    this.initMutationObserver();
    this.checkAllGroups();
  }

  scanDOM() {
    this.monitoredElements.clear();
    this.monitoredGroups.clear();

    const singleLines = document.querySelectorAll('.single-line[contenteditable]');
    singleLines.forEach(elem => {
      const el = /** @type {HTMLElement} */ (elem);
      this.monitoredElements.add(el);

      const group = this.getGroupContainer(el);
      this.monitoredGroups.add(group);

      this.lastValidText.set(el, el.textContent || '');
    });
  }

  /**
   * Finds the parent container group for an element, or returns the element itself if standalone
   * @param {HTMLElement} el
   * @returns {HTMLElement}
   */
  getGroupContainer(el) {
    const group = el.closest('#empfaenger, #infoblock, #briefkern');
    return /** @type {HTMLElement} */ (group || el);
  }

  /**
   * Accurately measures element scrollWidth vs clientWidth.
   * On :focus, temporarily forces overflow: hidden and whiteSpace: nowrap
   * to guarantee accurate scrollWidth vs clientWidth measurement.
   * @param {HTMLElement} el
   * @returns {{ scrollWidth: number, clientWidth: number, isOverflowing: boolean }}
   */
  measureElement(el) {
    const origOverflow = el.style.overflow;
    const origWhiteSpace = el.style.whiteSpace;

    el.style.overflow = 'hidden';
    el.style.whiteSpace = 'nowrap';

    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;

    el.style.overflow = origOverflow;
    el.style.whiteSpace = origWhiteSpace;

    return {
      scrollWidth,
      clientWidth,
      isOverflowing: clientWidth > 0 && scrollWidth > clientWidth
    };
  }

  /**
   * Evaluates and updates the text-fit level for a group container.
   * Level 0: default (no attribute)
   * Level 1: condensed (data-text-fit="condensed")
   * Level 2: shrink (data-text-fit="shrink")
   * Returns level: 0, 1, 2, or 3 (3 means level 2 overflow / input blocked)
   * @param {HTMLElement} groupContainer
   * @returns {number}
   */
  evaluateGroupLevel(groupContainer) {
    const fields = groupContainer.classList.contains('single-line')
      ? [groupContainer]
      : Array.from(groupContainer.querySelectorAll('.single-line[contenteditable]')).map(e => /** @type {HTMLElement} */ (e));

    if (fields.length === 0) return 0;

    // 1. Test Level 0 (no attribute)
    groupContainer.removeAttribute('data-text-fit');
    let overflowAtLevel0 = false;
    for (const field of fields) {
      if (this.measureElement(field).isOverflowing) {
        overflowAtLevel0 = true;
        break;
      }
    }
    if (!overflowAtLevel0) {
      return 0;
    }

    // 2. Test Level 1 (condensed)
    groupContainer.setAttribute('data-text-fit', 'condensed');
    let overflowAtLevel1 = false;
    for (const field of fields) {
      if (this.measureElement(field).isOverflowing) {
        overflowAtLevel1 = true;
        break;
      }
    }
    if (!overflowAtLevel1) {
      return 1;
    }

    // 3. Test Level 2 (shrink)
    groupContainer.setAttribute('data-text-fit', 'shrink');
    let overflowAtLevel2 = false;
    for (const field of fields) {
      if (this.measureElement(field).isOverflowing) {
        overflowAtLevel2 = true;
        break;
      }
    }
    if (!overflowAtLevel2) {
      return 2;
    }

    // Overflows even at Level 2!
    return 3;
  }

  /**
   * Re-evaluates all registered group containers
   */
  checkAllGroups() {
    if (this.isEvaluating) return;
    this.isEvaluating = true;
    try {
      this.monitoredGroups.forEach(group => {
        this.evaluateGroupLevel(group);
      });
    } finally {
      this.isEvaluating = false;
    }
  }

  /**
   * Attach input, keydown, paste, and focus listeners
   */
  attachEventListeners() {
    this.monitoredElements.forEach(el => {
      el.addEventListener('focus', () => {
        const group = this.getGroupContainer(el);
        const currentLevel = this.evaluateGroupLevel(group);
        if (currentLevel <= 2) {
          this.lastValidText.set(el, el.textContent || '');
        }
      });

      // Keydown pre-check when Level 2 is active and field overflows
      el.addEventListener('keydown', (e) => {
        const keyboardEvent = /** @type {KeyboardEvent} */ (e);
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(keyboardEvent.key) || keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
          return;
        }

        const group = this.getGroupContainer(el);
        if (group.getAttribute('data-text-fit') === 'shrink') {
          const measurement = this.measureElement(el);
          const sel = window.getSelection();
          const hasSelection = sel ? sel.toString().length > 0 : false;
          if (measurement.isOverflowing && !hasSelection) {
            keyboardEvent.preventDefault();
            this.notifyToast();
          }
        }
      });

      // Input event handler: main escalation & rollback logic
      el.addEventListener('input', () => {
        if (this.isRollingBack) return;

        const group = this.getGroupContainer(el);
        const level = this.evaluateGroupLevel(group);

        if (level === 3) {
          // Hard Input Blocking: Rollback text change
          this.isRollingBack = true;
          const previousText = this.lastValidText.get(el) || '';
          el.textContent = previousText;

          // Re-evaluate group level to restore Level 2 state
          this.evaluateGroupLevel(group);

          // Restore cursor to end
          this.restoreCaretToEnd(el);

          this.isRollingBack = false;
          this.notifyToast();
        } else {
          // Input accepted: update last valid text
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
      if (this.isRollingBack || this.isEvaluating) return;
      mutations.forEach(mutation => {
        const target = /** @type {HTMLElement} */ (mutation.target);
        const singleLine = target.closest ? target.closest('.single-line[contenteditable]') : null;
        if (singleLine) {
          const el = /** @type {HTMLElement} */ (singleLine);
          const group = this.getGroupContainer(el);
          const level = this.evaluateGroupLevel(group);
          if (level <= 2) {
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
