import { StorageManager } from './storage.js';

export class DraftManager {
  #undoStack = [];
  #redoStack = [];
  #currentStateString = null;
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

    // History Logic (Undo/Redo)
    const stateStr = JSON.stringify(draft);
    if (!this.#isRestoring && stateStr !== this.#currentStateString) {
      if (this.#currentStateString !== null) {
        this.#undoStack.push(this.#currentStateString);
        if (this.#undoStack.length > 50) this.#undoStack.shift(); // Max 50 states
      }
      this.#currentStateString = stateStr;
      this.#redoStack = []; // Clear redo on new input
    }

    // Optionaler Callback (für Abwärtskompatibilität)
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
    
    this.#currentStateString = JSON.stringify(draft);
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
    this.#redoStack.push(this.#currentStateString);
    this.#currentStateString = this.#undoStack.pop();
    this.#restoreState(JSON.parse(this.#currentStateString));
    StorageManager.saveDraft('current', JSON.parse(this.#currentStateString));
    if (this.onSaveCallback) this.onSaveCallback();
  }

  redo() {
    if (this.#redoStack.length === 0) return;
    this.#undoStack.push(this.#currentStateString);
    this.#currentStateString = this.#redoStack.pop();
    this.#restoreState(JSON.parse(this.#currentStateString));
    StorageManager.saveDraft('current', JSON.parse(this.#currentStateString));
    if (this.onSaveCallback) this.onSaveCallback();
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
