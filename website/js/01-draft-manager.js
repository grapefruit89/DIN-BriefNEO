// @ts-check
import { StorageManager, Constants } from './51-storage.js';
import { sanitizeRichText } from './04-sanitize.js';
import { getCaretCharacterOffset, setCaretCharacterOffset } from './selection-utils.js';
import { isPrintTitleActive } from './53-metadata.js';

const EDITABLE_FIELD_SELECTOR = '[contenteditable]:not([data-feldtyp="systemwert"]), select[data-speichern]';

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
    // Shortcuts nur innerhalb des Briefblatts abfangen; andere Inputs behalten natives Undo/Redo
    document.addEventListener('keydown', (e) => {
      const blatt = /** @type {Element | null} */ (e.target instanceof Element ? e.target.closest('din-a4') : null);
      if (!blatt || !(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.redo(); else this.undo();
      } else if (key === 'y') {
        e.preventDefault();
        this.redo();
      }
    });
  }

  saveDraft() {
    /** @type {Record<string, string>} */
    const draft = {};

    document.querySelectorAll('[contenteditable]').forEach(elem => {
      if (!elem.id || elem.getAttribute('data-feldtyp') === 'systemwert') return;
      if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
        draft[elem.id] = elem.innerHTML;
      } else {
        draft[elem.id] = elem.textContent;
      }
    });
    document.querySelectorAll('select[data-speichern]').forEach(elem => {
      const sel = /** @type {HTMLSelectElement} */ (elem);
      if (sel.id) draft[sel.id] = sel.value;
    });

    const saved = StorageManager.saveDraft('current', draft);
    this.#setSaveStatus(saved ? 'saved' : 'error');
    this.#updateDocumentTitle();

    if (this.#isRestoring) return saved;

    const draftStr = JSON.stringify(draft);
    let caretInfo = null;

    const activeElem = document.activeElement;
    if (activeElem && activeElem.hasAttribute('contenteditable') && activeElem.id && activeElem.id !== 'datum') {
      caretInfo = { id: activeElem.id, offset: getCaretCharacterOffset(activeElem) };
    }

    if (!this.#currentState) {
      this.#currentState = { draftStr, caretInfo };
    } else if (draftStr !== this.#currentState.draftStr) {
      this.#undoStack.push(this.#currentState);
      if (this.#undoStack.length > Constants.LIMITS.HISTORY_MAX_ITEMS) this.#undoStack.shift();
      this.#currentState = { draftStr, caretInfo };
      this.#redoStack = [];
    } else {
      this.#currentState.caretInfo = caretInfo;
    }

    if (this.onSaveCallback) {
      this.onSaveCallback();
    }
    return saved;
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
      /* Schutz vor UI-Zerstörung durch fremde/manipulierte IDs: nur editierbare Felder beschreiben */
      if (!elem || !elem.matches(EDITABLE_FIELD_SELECTOR)) return;
      if (elem.dataset.feldtyp === 'systemwert') return;

      if (elem instanceof HTMLSelectElement) {
        elem.value = draft[id];
        return;
      }

      // HTML-Restore ausschließlich über 04-sanitize (Allowlist)
      if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
        const extra = elem.getAttribute('data-feldtyp')?.includes('liste') ? { extraTags: ['UL', 'LI'] } : undefined;
        elem.replaceChildren(sanitizeRichText(draft[id], extra));
      } else if (!elem.querySelector('select[data-speichern]')) {
        elem.textContent = draft[id];
      }
    });
    this.#isRestoring = false;
    // Initialzustand der Statusanzeige nach dem Restore setzen
    this.#setSaveStatus('saved');
  }

  undo() {
    clearTimeout(this.debounceTimer);
    this.saveDraft();
    if (this.#undoStack.length === 0 || !this.#currentState) return;
    this.#redoStack.push(this.#currentState);
    this.#currentState = this.#undoStack.pop() || null;
    this.#applyHistoryState(this.#currentState);
  }

  redo() {
    clearTimeout(this.debounceTimer);
    this.saveDraft();
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
        setCaretCharacterOffset(elem, stateObj.caretInfo.offset);
      }
    }

    if (this.onSaveCallback) this.onSaveCallback();
  }

  resetDraft() {
    document.querySelectorAll('[contenteditable]').forEach(el => {
      if (el.getAttribute('data-feldtyp') === 'systemwert') return;
      el.replaceChildren();
      el.textContent = '';
    });
    document.querySelectorAll('select[data-speichern]').forEach(el => {
      const sel = /** @type {HTMLSelectElement} */ (el);
      sel.selectedIndex = 0;
    });
    this.saveDraft();
  }

  scheduleAutoSave() {
    this.#setSaveStatus('dirty');
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.saveDraft();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Autosave-Indikator: Status-Dot im Sidebar-Footer.
   * Zustandsgetrieben über CSS-Klassen .saved / .dirty / .error.
   * @param {'saved' | 'dirty' | 'error'} state
   */
  #setSaveStatus(state) {
    const el = /** @type {HTMLElement | null} */ (document.getElementById('save-status'));
    if (!el) return;
    el.classList.remove('saved', 'dirty', 'error');
    el.classList.add(state);
    el.dataset.state = state;
    /* Echte Text-Nodes (a11y-Doktrin 2026-09-11) — kein CSS-content. */
    const labels = { saved: 'Gespeichert', dirty: 'Speichern…', error: 'Fehler beim Speichern!' };
    el.textContent = labels[state];
    el.title = labels[state];
    /* ariaNotify (Chrome 141+, empirisch 2026-09-12): der unsichtbare Status-Dot
     * muss Save-FEHLER auditierbar machen — mit priority 'important', ohne
     * Toast/Alert (Success bleibt still). */
    if (state === 'error' && typeof document.ariaNotify === 'function') {
      document.ariaNotify('Fehler beim Speichern', { priority: 'important' });
    }
  }

  #updateDocumentTitle() {
    /* Waehrend des Druckens haelt MetadataService den Titel (Chrome leitet
     * daraus den PDF-Dateinamen ab) — ein Autosave darf ihn dann nicht
     * ueberschreiben. Siehe Guard in 53-metadata.js. */
    if (isPrintTitleActive()) return;
    const betreff = document.getElementById('betreff')?.textContent.trim() || 'Unbenannt';
    document.title = betreff;
  }
}
