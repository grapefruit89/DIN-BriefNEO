import { StorageManager } from '../30-utils/02-storage.js';

export class DraftManager {
  #undoStack = [];
  #redoStack = [];
  #currentState = null; // Object holding { draftStr, caretInfo }
  #isRestoring = false;

  constructor(onSaveCallback = null) {
    this.onSaveCallback = onSaveCallback;
    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 500; // 500ms ist ein guter Mittelweg
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

  /**
   * Speichert den aktuellen Zustand
   */
  saveDraft() {
    const draft = {};

    document.querySelectorAll('[contenteditable]').forEach(elem => {
      if (!elem.id) return;
      if (elem.id === 'brieftext' || elem.id === 'anlagen-text') {
        draft[elem.id] = elem.innerHTML;
      } else {
        draft[elem.id] = elem.textContent;
      }
    });

    StorageManager.saveDraft('current', draft);
    this._updateDocumentTitle();

    if (this.#isRestoring) return;

    // History Logic (Undo/Redo with Caret Preservation)
    const draftStr = JSON.stringify(draft);
    let caretInfo = null;
    
    const activeElem = document.activeElement;
    if (activeElem && activeElem.hasAttribute('contenteditable') && activeElem.id) {
      caretInfo = { id: activeElem.id, offset: this.#getCaretCharacterOffsetWithin(activeElem) };
    }

    if (!this.#currentState) {
      this.#currentState = { draftStr, caretInfo };
    } else if (draftStr !== this.#currentState.draftStr) {
      // Text changed: push old state to undo stack, set new state
      this.#undoStack.push(this.#currentState);
      if (this.#undoStack.length > 50) this.#undoStack.shift(); // Max 50 states
      this.#currentState = { draftStr, caretInfo };
      this.#redoStack = []; // Clear redo on new input
    } else {
      // Only cursor moved: update caret position of current state
      this.#currentState.caretInfo = caretInfo;
    }

    if (this.onSaveCallback) {
      this.onSaveCallback();
    }
  }

  /**
   * Lädt den Draft
   */
  loadDraft() {
    const draft = StorageManager.loadDraft('current');
    if (!draft) return false;
    
    this.#currentState = { draftStr: JSON.stringify(draft), caretInfo: null };
    this.#restoreState(draft);
    return true;
  }

  #restoreState(draft) {
    this.#isRestoring = true;
    Object.keys(draft).forEach(id => {
      const elem = document.getElementById(id);
      if (!elem) return;

      if (id === 'brieftext' || id === 'anlagen-text') {
        if (elem.setHTML) {
          try {
            elem.setHTML(draft[id], { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'] });
          } catch {
            this.#safeFallbackParse(elem, draft[id]);
          }
        } else {
          this.#safeFallbackParse(elem, draft[id]);
        }
      } else {
        elem.textContent = draft[id];
      }
    });
    this.#isRestoring = false;
  }

  #safeFallbackParse(elem, htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    elem.replaceChildren(...doc.body.childNodes);
  }

  undo() {
    if (this.#undoStack.length === 0) return;
    this.#redoStack.push(this.#currentState);
    this.#currentState = this.#undoStack.pop();
    this.#applyHistoryState(this.#currentState);
  }

  redo() {
    if (this.#redoStack.length === 0) return;
    this.#undoStack.push(this.#currentState);
    this.#currentState = this.#redoStack.pop();
    this.#applyHistoryState(this.#currentState);
  }

  #applyHistoryState(stateObj) {
    const draft = JSON.parse(stateObj.draftStr);
    this.#restoreState(draft);
    StorageManager.saveDraft('current', draft);
    
    // Restore Caret
    if (stateObj.caretInfo) {
      const elem = document.getElementById(stateObj.caretInfo.id);
      if (elem) {
        elem.focus();
        this.#setCaretPosition(elem, stateObj.caretInfo.offset);
      }
    }
    
    if (this.onSaveCallback) this.onSaveCallback();
  }

  #getCaretCharacterOffsetWithin(element) {
    let caretOffset = 0;
    const doc = element.ownerDocument || element.document;
    const win = doc.defaultView || doc.parentWindow;
    if (typeof win.getSelection !== "undefined") {
      const sel = win.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    }
    return caretOffset;
  }

  #setCaretPosition(elem, caretPos) {
    if (caretPos === 0) {
      elem.focus();
      return;
    }
    const doc = elem.ownerDocument || elem.document;
    const win = doc.defaultView || doc.parentWindow;
    const sel = win.getSelection();
    const range = doc.createRange();
    
    let charIndex = 0;
    let found = false;

    function traverseNodes(node) {
      if (found) return;
      if (node.nodeType === 3) {
        const nextCharIndex = charIndex + node.length;
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
    }

    traverseNodes(elem);

    if (found) {
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      elem.focus();
    }
  }

  /**
   * Setzt den Brief zurück
   */
  resetDraft() {
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.replaceChildren(); // Fast, native way to clear content instead of innerHTML = ''
      el.textContent = '';
    });
    this.saveDraft();
  }

  /**
   * Debounced Auto-Save
   */
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

  /**
   * Erlaubt späteres Umschalten auf Event-basiert
   */
  enableEventMode() {
    document.addEventListener('draft:save-request', () => {
      this.saveDraft();
    });
  }
}
