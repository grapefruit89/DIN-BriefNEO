// @ts-check
import { StorageManager } from './52-storage.js';

export class DraftManager {
  /** @type {Array<{draftStr: string, caretInfo: {id: string, offset: number} | null}>} */
  #undoStack = [];
  /** @type {Array<{draftStr: string, caretInfo: {id: string, offset: number} | null}>} */
  #redoStack = [];
  /** @type {{draftStr: string, caretInfo: {id: string, offset: number} | null} | null} */
  #currentState = null;
  /** @type {boolean} */
  #isRestoring = false;

  /**
   * @param {(() => void) | null} onSaveCallback
   */
  constructor(onSaveCallback = null) {
    /** @type {(() => void) | null} */
    this.onSaveCallback = onSaveCallback;
    /** @type {any} */
    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 500;
    this.#initShortcuts();
  }

  #initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          this.undo();
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          this.redo();
        }
      }
    });
  }

  saveDraft() {
    /** @type {Record<string, string>} */
    const draft = {};

    document.querySelectorAll('[contenteditable]').forEach(elem => {
      if (!elem.id) return;
      if (elem.id === 'brieftext' || elem.id === 'anlagen-text') {
        draft[elem.id] = elem.innerHTML;
      } else {
        draft[elem.id] = elem.textContent;
      }
    });
    document.querySelectorAll('select[data-persist]').forEach(elem => {
      const sel = /** @type {HTMLSelectElement} */ (elem);
      if (sel.id) draft[sel.id] = sel.value;
    });

    StorageManager.saveDraft('current', draft);
    this._updateDocumentTitle();

    if (this.#isRestoring) return;

    const draftStr = JSON.stringify(draft);
    let caretInfo = null;

    const activeElem = document.activeElement;
    if (activeElem && activeElem.hasAttribute('contenteditable') && activeElem.id) {
      caretInfo = { id: activeElem.id, offset: this.#getCaretCharacterOffsetWithin(activeElem) };
    }

    if (!this.#currentState) {
      this.#currentState = { draftStr, caretInfo };
    } else if (draftStr !== this.#currentState.draftStr) {
      this.#undoStack.push(this.#currentState);
      if (this.#undoStack.length > 50) this.#undoStack.shift();
      this.#currentState = { draftStr, caretInfo };
      this.#redoStack = [];
    } else {
      this.#currentState.caretInfo = caretInfo;
    }

    if (this.onSaveCallback) {
      this.onSaveCallback();
    }
  }

  loadDraft() {
    const draft = StorageManager.loadDraft('current');
    if (!draft) return false;

    this.#currentState = { draftStr: JSON.stringify(draft), caretInfo: null };
    this.#restoreState(draft);
    return true;
  }

  /**
   * @param {Record<string, string>} draft
   */
  #restoreState(draft) {
    this.#isRestoring = true;
    Object.keys(draft).forEach(id => {
      const elem = document.getElementById(id);
      if (!elem) return;

      if (elem instanceof HTMLSelectElement) {
        elem.value = draft[id];
        return;
      }

      if (id === 'brieftext' || id === 'anlagen-text') {
        const elWithSetHTML = /** @type {any} */ (elem);
        if (elWithSetHTML.setHTML) {
          try {
            elWithSetHTML.setHTML(draft[id], { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'] });
          } catch {
            this.#safeFallbackParse(elem, draft[id]);
          }
        } else {
          this.#safeFallbackParse(elem, draft[id]);
        }
      } else if (!elem.querySelector('select[data-persist]')) {
        elem.textContent = draft[id];
      }
    });
    this.#isRestoring = false;
  }

  /**
   * @param {HTMLElement} elem
   * @param {string} htmlString
   */
  #safeFallbackParse(elem, htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    elem.replaceChildren(...doc.body.childNodes);
  }

  undo() {
    if (this.#undoStack.length === 0 || !this.#currentState) return;
    this.#redoStack.push(this.#currentState);
    this.#currentState = this.#undoStack.pop() || null;
    this.#applyHistoryState(this.#currentState);
  }

  redo() {
    if (this.#redoStack.length === 0 || !this.#currentState) return;
    this.#undoStack.push(this.#currentState);
    this.#currentState = this.#redoStack.pop() || null;
    this.#applyHistoryState(this.#currentState);
  }

  /**
   * @param {{draftStr: string, caretInfo: {id: string, offset: number} | null} | null} stateObj
   */
  #applyHistoryState(stateObj) {
    if (!stateObj) return;
    const draft = JSON.parse(stateObj.draftStr);
    this.#restoreState(draft);
    StorageManager.saveDraft('current', draft);

    if (stateObj.caretInfo) {
      const elem = document.getElementById(stateObj.caretInfo.id);
      if (elem) {
        elem.focus();
        this.#setCaretPosition(elem, stateObj.caretInfo.offset);
      }
    }

    if (this.onSaveCallback) this.onSaveCallback();
  }

  /**
   * @param {Element} element
   * @returns {number}
   */
  #getCaretCharacterOffsetWithin(element) {
    let caretOffset = 0;
    const doc = element.ownerDocument;
    if (!doc) return 0;
    const win = doc.defaultView;
    if (win && typeof win.getSelection !== "undefined") {
      const sel = win.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    }
    return caretOffset;
  }

  /**
   * @param {HTMLElement} elem
   * @param {number} caretPos
   */
  #setCaretPosition(elem, caretPos) {
    if (caretPos === 0) {
      elem.focus();
      return;
    }
    const doc = elem.ownerDocument;
    if (!doc) return;
    const win = doc.defaultView;
    if (!win) return;
    const sel = win.getSelection();
    if (!sel) return;
    const range = doc.createRange();

    let charIndex = 0;
    let found = false;

    /**
     * @param {Node} node
     */
    const traverseNodes = (node) => {
      if (found) return;
      if (node.nodeType === 3) {
        const length = node.textContent ? node.textContent.length : 0;
        const nextCharIndex = charIndex + length;
        if (caretPos >= charIndex && caretPos <= nextCharIndex) {
          range.setStart(node, caretPos - charIndex);
          range.collapse(true);
          found = true;
        }
        charIndex = nextCharIndex;
      } else {
        let child = node.firstChild;
        while (child) {
          traverseNodes(child);
          child = child.nextSibling;
        }
      }
    };

    traverseNodes(elem);

    if (found) {
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      elem.focus();
    }
  }

  resetDraft() {
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.replaceChildren();
      el.textContent = '';
    });
    document.querySelectorAll('select[data-persist]').forEach(el => {
      const sel = /** @type {HTMLSelectElement} */ (el);
      sel.selectedIndex = 0;
    });
    this.saveDraft();
  }

  scheduleAutoSave() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.saveDraft();
    }, this.DEBOUNCE_DELAY);
  }

  _updateDocumentTitle() {
    const betreff = document.getElementById('betreff')?.textContent.trim() || 'Unbenannt';
    document.title = betreff;
  }

  enableEventMode() {
    document.addEventListener('draft:save-request', () => {
      this.saveDraft();
    });
  }
}
