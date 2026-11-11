// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {DraftManager}
// @adr [[ADR-JS]]
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @guide [[glossary]]

/**
 * @file draft-manager.js — Autosave, Undo/Redo, Mehr-Tab-Sync und der
 * Speicherzustand des Entwurfs. Aus `document.js` ausgelagert (2026-11-08):
 * die State-Machine hat nichts mit DOM- und Caret-Manipulation zu tun.
 */

import { AddressIntelligence } from './address.js';
import { Constants, Events, eventBus } from './core.js';
import { collectDraft, EDITABLE_FIELD_SELECTOR, getCaretCharacterOffset, sanitizeRichText, setCaretCharacterOffset } from './document.js';
import { Field } from './field.js';
import { isPrintTitleActive, loadJSON, remove, STORAGE_KEYS, save, saveJSON, stripHtmlToPlaintext } from './persistence.js';

export class DraftManager {
  /** @type {Array<{draftStr: string, caretInfo: {id: string, offset: number} | null}>} */
  #undoStack = [];
  /** @type {Array<{draftStr: string, caretInfo: {id: string, offset: number} | null}>} */
  #redoStack = [];
  /** @type {{draftStr: string, caretInfo: {id: string, offset: number} | null} | null} */
  #currentState = null;
  /** @type {boolean} */
  #isRestoring = false;
  /** @type {(() => void) | null} */
  #unsubSaveRequested = null;
  /** @type {(() => void) | null} */
  #unsubSaveFailed = null;
  /**
   * Deterministischer Speicherzustand:
   * pending  = Änderungen im DOM, noch nicht geschrieben
   * synced   = letzter Schreibvorgang erfolgreich
   * error    = letzter Schreibvorgang fehlgeschlagen (Quota/Serde)
   * @type {'pending' | 'synced' | 'error'}
   */
  #saveState = 'synced';

  /**
   * @param {ReturnType<typeof import('./core.js').createEventBus> | null} [bus]
   */
  constructor(bus = eventBus) {
    /** @type {ReturnType<typeof import('./core.js').createEventBus> | null} */
    this.bus = bus;
    /** @type {any} */
    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 500;
    this.#initShortcuts();
    this.#initEventBus();
    this.#initLifecycleFlush();
    this.#initMultiTabSync();
  }

  #initEventBus() {
    if (this.bus && typeof this.bus.subscribe === 'function') {
      this.#unsubSaveRequested = this.bus.subscribe(Events.DOCUMENT_SAVE_REQUESTED, (payload) => {
        if (payload?.debounce) {
          this.scheduleAutoSave();
        } else {
          this.saveDraft();
        }
      });
      // Auch Fehler aus anderen Speicherpfaden (z. B. Einstellungen/Signatur)
      // müssen am Status-Punkt sichtbar werden, nicht nur als Toast.
      this.#unsubSaveFailed = this.bus.subscribe(Events.DOCUMENT_SAVE_FAILED, () => {
        this.#setSaveStatus('error');
      });
    }
  }

  #initLifecycleFlush() {
    const flush = () => this.flushPendingSave();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush();
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', flush);
    }
  }

  /** Aktueller Speicherzustand (pending | synced | error). */
  get saveState() {
    return this.#saveState;
  }

  /**
   * Schreibt anstehende Änderungen sofort. No-op, wenn nichts offen ist —
   * verhindert zusätzliche Schreibvorgänge beim bloßen Tab-Wechsel.
   * @returns {boolean} true, wenn geschrieben wurde
   */
  flushPendingSave() {
    if (this.debounceTimer === null && this.#saveState === 'synced') return false;
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.saveDraft();
    return true;
  }

  /* Bewusste Entscheidung: Kein Web-Locks-Mechanismus (Over-Engineering für
   * Single-User-App). Bei fokussiertem Tab gewinnt der aktive Tab; der Toast
   * warnt vor dem Multi-Tab-Fall. Restrisiko: paralleles Tippen in 2 Tabs
   * kann den älteren Stand überschreiben — akzeptiert. */
  #initMultiTabSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEYS.draft || !event.newValue) return;
        // Wenn dieser Tab im Hintergrund ist und keine ungespeicherten Eingaben hat:
        if (typeof document !== 'undefined' && !document.hasFocus() && this.debounceTimer === null) {
          this.loadDraft();
        } else {
          eventBus.publish(Events.NOTIFICATION_REQUESTED, {
            message: Constants.TOASTS.DRAFT.MULTI_TAB,
            type: 'info'
          });
        }
      });
    }
  }

  destroy() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    if (this.#unsubSaveRequested) {
      this.#unsubSaveRequested();
      this.#unsubSaveRequested = null;
    }
    if (this.#unsubSaveFailed) {
      this.#unsubSaveFailed();
      this.#unsubSaveFailed = null;
    }
  }

  #initShortcuts() {
    // Shortcuts nur innerhalb des Briefblatts abfangen; andere Inputs behalten natives Undo/Redo
    document.addEventListener('keydown', (e) => {
      const blatt = /** @type {Element | null} */ (e.target instanceof Element ? e.target.closest('din-blatt') : null);
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
    /* Ein expliziter Save macht einen geplanten Debounce-Save gegenstandslos:
     * sonst schreibt der Timer kurz danach denselben Stand ein zweites Mal. */
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    const draft = collectDraft();
    let draftStr = '';
    try {
      draftStr = JSON.stringify(draft);
    } catch {
      draftStr = '{}';
    }

    const saved = save(STORAGE_KEYS.draft, draftStr);
    this.#saveState = saved ? 'synced' : 'error';

    try {
      this.#setSaveStatus(saved ? 'saved' : 'error');
    } catch {
      /* Status-Rendering darf den Fehlerpfad niemals abbrechen (B54) */
    }

    try {
      this.#updateDocumentTitle();
    } catch {
      /* Titel-Update darf den Fehlerpfad nicht unterbrechen */
    }

    if (this.bus && typeof this.bus.publish === 'function') {
      try {
        this.bus.publish(saved ? Events.DOCUMENT_SAVED : Events.DOCUMENT_SAVE_FAILED, { draft });
      } catch (err) {
        console.warn('[DraftManager] Event-Publish fehlgeschlagen:', err);
      }
    }

    if (this.#isRestoring) return saved;

    let caretInfo = null;

    const activeElem = document.activeElement;
    if (activeElem?.hasAttribute('contenteditable') && activeElem.id && activeElem.id !== 'datum') {
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

    return saved;
  }

  loadDraft() {
    const draft = loadJSON(STORAGE_KEYS.draft, null);
    if (!draft) return false;

    this.#currentState = { draftStr: JSON.stringify(draft), caretInfo: null };
    this.#restoreState(draft);
    return true;
  }

  /**
   * Stellt einen Snapshot (z. B. aus Undo nach Reset) im DOM wieder her und persistiert ihn.
   * @param {Record<string, string | boolean>} draft
   */
  restoreDraft(draft) {
    if (!draft || typeof draft !== 'object') return;
    this.#restoreState(draft);
    this.saveDraft();
  }

  /**
   * @param {Record<string, string | boolean>} draft
   */
  #restoreState(draft) {
    this.#isRestoring = true;
    AddressIntelligence.targetLock = null;
    Object.keys(draft).forEach(id => {
      const elem = document.getElementById(id);
      /* Schutz vor UI-Zerstörung durch fremde/manipulierte IDs: nur editierbare Felder beschreiben */
      if (!elem?.matches(EDITABLE_FIELD_SELECTOR)) return;
      if (elem.dataset.feldtyp === 'systemwert' && elem.id !== 'datum') return;
      // Boolean-Werte sind Toggle-Zustaende; sie werden weiter unten als `checked` gesetzt.
      if (typeof draft[id] !== 'string') return;

      if (elem instanceof HTMLSelectElement) {
        elem.value = draft[id];
        return;
      }

      if (Field.isNative(elem)) {
        /* Migration alter Drafts: <li>-HTML -> \n-Text (einmalig). */
        let val = draft[id];
        if (elem.id === 'anlagen-angabe' && typeof val === 'string' && val.includes('<')) {
          val = stripHtmlToPlaintext(val);
        }
        Field.setValue(elem, val);
      // HTML-Restore ausschließlich über sanitizeRichText (Allowlist)
      } else if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
        const isListe = Boolean(elem.getAttribute('data-feldtyp')?.includes('liste'));
        if (isListe && typeof draft[id] === 'string' && !draft[id].includes('<li')) {
          const lines = draft[id].split('\n').map((l) => l.trim()).filter(Boolean);
          if (lines.length > 0) {
            elem.replaceChildren(...lines.map((line) => {
              const li = document.createElement('li');
              li.textContent = line;
              return li;
            }));
          } else {
            elem.replaceChildren();
          }
        } else {
          const extra = isListe ? { extraTags: ['UL', 'OL', 'LI'] } : undefined;
          elem.replaceChildren(sanitizeRichText(draft[id], extra));
          if (isListe && elem.children.length === 0) {
            elem.replaceChildren(document.createElement('li'));
          }
        }
      } else if (!elem.querySelector('select[data-speichern]')) {
        elem.textContent = draft[id];
        if (elem.id === 'datum') {
          // Gemerkt: der Wert stammt vom Nutzer, applyLetterDate darf ihn nicht ueberschreiben.
          if ((draft[id] || '').trim() !== '') elem.dataset.dirty = 'true';
        }
      }
    });

    // Die Sichtbarkeit des Vermerks ist abgeleitet, kein gespeichertes Feld mehr:
    // leerer Vermerk = unsichtbar, gefuellter Vermerk = sichtbar.
    const postvermerk = document.getElementById('vermerke');
    if (postvermerk) {
      if ((postvermerk.textContent || '').trim() !== '') {
        postvermerk.setAttribute('data-visible', 'true');
      } else {
        postvermerk.removeAttribute('data-visible');
      }
    }
    const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
    if (pvSelect) {
      // Auswahlliste folgt dem Feld — sonst zeigt sie nach einem Restore „kein“,
      // während der Vermerk im Brief steht.
      pvSelect.value = (postvermerk?.textContent || '').trim();
      if (pvSelect.selectedIndex === -1) pvSelect.selectedIndex = 0;
    }

    const anlagenSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
    if (anlagenSwitch && 'toggle-anlagen' in draft) {
      anlagenSwitch.checked = draft['toggle-anlagen'] === true || draft['toggle-anlagen'] === 'true';
    }

    const fussSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
    if (fussSwitch) {
      if ('toggle-fuss' in draft) {
        fussSwitch.checked = draft['toggle-fuss'] === true || draft['toggle-fuss'] === 'true';
      } else {
        // Migration: alte Drafts kennen den Toggle nicht. Vorhandener Text
        // bedeutet "Fusszeile war an" - sonst waere er unsichtbar.
        fussSwitch.checked = Array.from(
          document.querySelectorAll('#geschaeftsangaben > [contenteditable]')
        ).some((sp) => (sp.textContent || '').trim() !== '');
      }
    }

    this.#isRestoring = false;
    this.#setSaveStatus('saved');
  }

  undo() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    this.saveDraft();
    if (this.#undoStack.length === 0 || !this.#currentState) return;
    this.#redoStack.push(this.#currentState);
    this.#currentState = this.#undoStack.pop() || null;
    this.#applyHistoryState(this.#currentState);
  }

  redo() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
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
    saveJSON(STORAGE_KEYS.draft, draft);

    if (stateObj.caretInfo) {
      const elem = document.getElementById(stateObj.caretInfo.id);
      if (elem) {
        elem.focus();
        setCaretCharacterOffset(elem, stateObj.caretInfo.offset);
      }
    }

    if (this.bus && typeof this.bus.publish === 'function') {
      this.bus.publish(Events.DOCUMENT_CHANGED, { draft });
    }
  }

  resetDraft() {
    document.querySelectorAll('[contenteditable], textarea[data-feldtyp]').forEach(el => {
      if (el.getAttribute('data-feldtyp') === 'systemwert') return;
      if (Field.isNative(el)) {
        Field.setValue(el, '');
      } else if (el.getAttribute('data-feldtyp')?.includes('liste')) {
        if (el.id === 'anlagen-angabe') {
          el.replaceChildren();
        } else {
          el.replaceChildren(document.createElement('li'));
        }
      } else {
        el.replaceChildren();
        el.textContent = '';
      }
    });
    document.querySelectorAll('select[data-speichern]').forEach(el => {
      const sel = /** @type {HTMLSelectElement} */ (el);
      sel.selectedIndex = 0;
    });
    const anlagenSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
    if (anlagenSwitch) {
      anlagenSwitch.checked = false;
    }
    const fussSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
    if (fussSwitch) {
      fussSwitch.checked = false;
    }
    // Datum: Markierung loeschen und Feld leeren, damit applyLetterDate wieder "heute" setzt.
    const datumEl = document.getElementById('datum');
    if (datumEl) {
      datumEl.removeAttribute('data-dirty');
      datumEl.textContent = '';
    }
    const postvermerk = document.getElementById('vermerke');
    if (postvermerk) {
      postvermerk.removeAttribute('data-visible');
    }
    const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
    if (pvSelect) {
      pvSelect.selectedIndex = 0;
    }
    AddressIntelligence.targetLock = null;
    /* Privacy: die lokale Adress-Historie haelt bis zu 50 zuletzt gewaehlte
     * Empfaengeradressen und gehoert damit zum Brief, nicht zu den
     * Praeferenzen. Der Reset muss sie mitnehmen, sonst bleiben echte
     * Adressen auf einem geteilten Rechner stehen (gemessen 2026-11-11).
     * din_settings/din_geoapify_key/din_sender_coords bleiben bewusst.
     * `remove()` faengt einen gesperrten Storage selbst ab. */
    remove(STORAGE_KEYS.addresses);
    /* Erst publizieren, dann speichern: Listener (Anrede- und Gruss-Seed)
     * schreiben ihren Folgezustand ins DOM, danach wird der fertige Stand in
     * EINEM Zug gesichert. Vorher entstanden zwei Schreibvorgaenge: leer, dann
     * geseedet. Der Publish steht im try/catch, damit ein fehlerhafter Listener
     * das Zuruecksetzen nicht unspeicherbar macht. */
    try {
      if (this.bus && typeof this.bus.publish === 'function') {
        this.bus.publish(Events.DOCUMENT_CHANGED, { draft: {} });
      }
    } catch (err) {
      console.warn('[DraftManager] DOCUMENT_CHANGED nach Reset fehlgeschlagen:', err);
    }
    this.saveDraft();
  }

  scheduleAutoSave() {
    this.#saveState = 'pending';
    this.#setSaveStatus('dirty');
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.saveDraft();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Autosave-Indikator: Status-Dot im Sidebar-Footer.
   * Zustandsgetrieben über data-state="saved" | "dirty" | "error".
   * @param {'saved' | 'dirty' | 'error'} state
   */
  #setSaveStatus(state) {
    const el = /** @type {HTMLElement | null} */ (document.getElementById('save-status'));
    if (!el) return;
    el.dataset.state = state;
    const labels = { saved: 'Gespeichert', dirty: 'Speichern…', error: 'Fehler beim Speichern!' };
    el.textContent = labels[state];
    el.title = labels[state];

    // Fallback auf ARIA-Live-Regionen (B54: Screenreader auch ohne ariaNotify informieren)
    if (state === 'error') {
      el.setAttribute('role', 'alert');
      el.setAttribute('aria-live', 'assertive');
    } else {
      /* Im Regelbetrieb keine Live-Region: sonst kuendigt jeder Autosave
       * (~500 ms) "Speichern…" und "Gespeichert" an. Nur Fehler werden
       * angekuendigt — der Status bleibt visuell unveraendert. */
      el.removeAttribute('role');
      el.removeAttribute('aria-live');
    }

    if (state === 'error') {
      try {
        if (typeof document.ariaNotify === 'function') {
          // Standard-konforme Priorität 'high' oder 'normal' (Chrome 156+, B54)
          document.ariaNotify('Fehler beim Speichern', { priority: 'high' });
        }
      } catch {
        /* Experimentelle API darf den Fehlerpfad niemals blockieren (B54) */
      }
    }
  }

  #updateDocumentTitle() {
    if (isPrintTitleActive()) return;
    const betreff = (document.getElementById('betreff')?.textContent || '').replace(/[\x00-\x1f\r\n]/g, ' ').replace(/\s+/g, ' ').trim() || 'Unbenannt';
    document.title = betreff;
  }
}
