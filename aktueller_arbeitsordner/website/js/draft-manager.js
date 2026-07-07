import { StorageManager } from './storage.js';

export class DraftManager {
  constructor(onSaveCallback = null) {
    this.onSaveCallback = onSaveCallback;
    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 500; // 500ms ist ein guter Mittelweg
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

    Object.keys(draft).forEach(id => {
      const elem = document.getElementById(id);
      if (!elem) return;

      if (id === 'brieftext' || id === 'anlagen-text') {
        if (elem.setHTML) {
          try {
            elem.setHTML(draft[id], { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'] });
          } catch {
            elem.innerHTML = draft[id];
          }
        } else if (elem.setHTMLUnsafe) {
          elem.setHTMLUnsafe(draft[id]);
        } else {
          // Strict fallback without innerHTML
          elem.textContent = draft[id];
        }
      } else {
        elem.textContent = draft[id];
      }
    });

    return true;
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
