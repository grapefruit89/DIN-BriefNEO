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
import { draftFieldIds, getCaretCharacterOffset, setCaretCharacterOffset } from './document.js';
import { Field } from './field.js';
import { isPrintTitleActive, loadJSON, remove, STORAGE_KEYS, save, saveJSON } from './persistence.js';
import { applyPatch, bindIds, createState, letterState, replace, resetState, takeJournal, toWire } from './state.js';
import { render } from './state-binding.js';

export class DraftManager {
  /* Undo/Redo liegt bewusst NUR im RAM (entschieden 2026-11-13, B13).
     Der letzte Stand ist durch saveDraft() gesichert; Undo ueber einen Reload
     hinweg waere ein neues Feature und kostet Quota plus Multi-Tab-Kohaerenz.
     Wer es einbaut, muss beides mitloesen - nicht nur einen Ring schreiben. */
  /** @type {Array<{entries: import('./state.js').PatchEntry[], caretVorher: {id: string, offset: number} | null, caretNachher: {id: string, offset: number} | null}>} */
  #undoStack = [];
  /** @type {Array<{entries: import('./state.js').PatchEntry[], caretVorher: {id: string, offset: number} | null, caretNachher: {id: string, offset: number} | null}>} */
  #redoStack = [];
  /** Caret des zuletzt gespeicherten Stands — Ziel eines Undo. */
  /** @type {{id: string, offset: number} | null} */
  #letzterCaret = null;
  /** true, sobald ein Ausgangsstand feststeht (Ladepfad oder erster Save). */
  #hatBasis = false;
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
        /* Auch die interne Wahrheit setzen: vorher zeigte die Leiste "Fehler",
           waehrend `saveState` weiter "synced" meldete (B4-Review 2026-11-12,
           O1). Scheitert ein fremder Pfad (Einstellungen, Signatur), ist der
           Speicherzustand des Dokuments ebenfalls nicht mehr "synchron". */
        this.#saveState = 'error';
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
    /** @type {Record<string, string | boolean>} */
    let draft;
    let draftStr = '';
    try {
      /* D1 Stufe 3: Der Zustand ist die Quelle. Kein DOM-Scan, kein
         DOMParser im Speicherpfad. */
      draft = toWire(letterState);
      draftStr = JSON.stringify(draft);
    } catch (fehler) {
      /* NICHT speichern: fruehere Fassung schrieb '{}' und meldete Erfolg —
         der letzte gute Entwurf war damit weg, obwohl ein Fehler vorlag
         (B4-Review 2026-11-12). */
      console.error('[DraftManager] Entwurf nicht serialisierbar:', fehler);
      this.#saveState = 'error';
      try {
        this.#setSaveStatus('error');
      } catch {
        /* Status-Rendering darf den Fehlerpfad nicht abbrechen (B54) */
      }
      return false;
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

    this.#commitHistory(this.#caret());

    return saved;
  }

  /**
   * Aktuelle Caret-Position des fokussierten Entwurfsfeldes.
   * @returns {{id: string, offset: number} | null}
   */
  #caret() {
    const activeElem = document.activeElement;
    /* Beide Feldtypen: nativ (input/textarea) ueber selectionStart, #text als
       Rich-Text ueber Range. Vorher war die Bedingung `hasAttribute(
       'contenteditable')` — in Einzeilern wurde der Caret nie gemerkt und
       sprang nach Undo/Redo (Befund B12/S1). */
    const istFeld = activeElem instanceof HTMLElement
      && (Field.isNative(activeElem) || activeElem.hasAttribute('contenteditable'));
    if (istFeld && activeElem.id && activeElem.id !== 'datum') {
      return { id: activeElem.id, offset: getCaretCharacterOffset(activeElem) };
    }
    return null;
  }

  /**
   * Schneidet das Journal in einen Undo-Eintrag (Patch-Stack statt Volltext).
   * Aufruf aus saveDraft(); die Einträge umfassen genau ein Save-Fenster
   * (500 ms Debounce) — dieselbe Granularität wie vorher.
   * @param {{id: string, offset: number} | null} caretNachher
   */
  #commitHistory(caretNachher) {
    const entries = takeJournal(letterState);
    if (entries.length === 0) {
      /* Kein neuer Stand: nur die Caret-Marke nachziehen. */
      this.#letzterCaret = caretNachher;
      return;
    }
    if (!this.#hatBasis) {
      /* Erster Save nach dem Kaltstart setzt den Ausgangsstand. */
      this.#hatBasis = true;
      this.#letzterCaret = caretNachher;
      return;
    }
    this.#undoStack.push({ entries, caretVorher: this.#letzterCaret, caretNachher });
    if (this.#undoStack.length > Constants.LIMITS.HISTORY_MAX_ITEMS) this.#undoStack.shift();
    this.#redoStack = [];
    this.#letzterCaret = caretNachher;
  }

  /** Persistiert den aktuellen Zustand (Undo/Redo-Pfad). */
  #persist() {
    if (!saveJSON(STORAGE_KEYS.draft, toWire(letterState))) {
      this.#saveState = 'error';
      try {
        this.#setSaveStatus('error');
      } catch {
        /* Status-Rendering darf den Fehlerpfad nicht abbrechen (B54) */
      }
    }
  }

  /**
   * @param {{id: string, offset: number} | null} caretInfo
   */
  #restoreCaret(caretInfo) {
    if (!caretInfo) return;
    const elem = document.getElementById(caretInfo.id);
    if (!elem) return;
    elem.focus();
    setCaretCharacterOffset(elem, caretInfo.offset);
  }

  /** Leert Undo/Redo (fremdes Dokument, Import). */
  clearHistory() {
    this.#undoStack = [];
    this.#redoStack = [];
    this.#letzterCaret = null;
    this.#hatBasis = true;
    takeJournal(letterState);
  }

  loadDraft() {
    const draft = loadJSON(STORAGE_KEYS.draft, null);
    if (!draft) return false;

    /* Ein fremder Stand (Reload, Multi-Tab) macht die eigene Historie
       ungueltig: ohne das holt Undo Texte aus einem anderen Dokument zurueck
       (B4-Review 2026-11-12). */
    this.#undoStack = [];
    this.#redoStack = [];
    this.#letzterCaret = null;
    this.#hatBasis = true;
    this.#loadWire(draft);
    return true;
  }

  /**
   * Stellt einen Wire-Snapshot im DOM wieder her und persistiert ihn.
   * @param {Record<string, string | boolean>} draft
   */
  restoreDraft(draft) {
    if (!draft || typeof draft !== 'object') return;
    this.#loadWire(draft);
    this.saveDraft();
  }

  /**
   * Setzt den Zustand aus einem Wire-Objekt und projiziert ihn in den DOM.
   * Enthält die beiden Daten-Migrationen, die vorher im DOM-Restore steckten.
   * @param {Record<string, string | boolean>} draft
   */
  #loadWire(draft) {
    const feldIds = draftFieldIds(document);
    const next = createState(draft, feldIds);

    /* Migration: alte Drafts kennen `toggle-fuss` nicht. Vorhandener Text in
       den Fußzeilenfeldern bedeutet "Fußzeile war an" — sonst wäre er
       unsichtbar (Befund B11). */
    if (!('toggle-fuss' in draft)) {
      const fussFelder = ['fuss-firma', 'fuss-sitz', 'fuss-gericht', 'fuss-hrb', 'fuss-vorstand', 'fuss-gf',
        'fuss-stnr', 'fuss-ustid', 'fuss-bank', 'fuss-iban', 'fuss-bic', 'fuss-anschrift'];
      next.werte['toggle-fuss'] = fussFelder.some((id) => String(next.werte[id] ?? '').trim() !== '');
      next.ids.add('toggle-fuss');
    }

    replace(letterState, next);
    bindIds(letterState, feldIds);
    AddressIntelligence.targetLock = null;
    render([...letterState.ids], 'logic');

    const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
    if (pvSelect) {
      // Auswahlliste folgt dem Feld — sonst zeigt sie nach einem Restore „kein“,
      // während der Vermerk im Brief steht.
      pvSelect.value = String(letterState.werte.vermerke ?? '').trim();
      if (pvSelect.selectedIndex === -1) pvSelect.selectedIndex = 0;
    }
    this.#setSaveStatus('saved');
  }

  undo() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    /* Anstehende Änderungen zuerst zu einem Eintrag schneiden — sonst würde
       ein Undo die halbe Tipp-Pause verwerfen (identisch zur alten Semantik). */
    this.#commitHistory(this.#caret());
    const eintrag = this.#undoStack.pop();
    if (!eintrag) return;
    this.#redoStack.push(eintrag);
    const ids = applyPatch(letterState, eintrag.entries, 'prev');
    render(ids, 'undo');
    this.#persist();
    this.#letzterCaret = eintrag.caretVorher;
    this.#restoreCaret(eintrag.caretVorher);
    if (this.bus && typeof this.bus.publish === 'function') {
      this.bus.publish(Events.DOCUMENT_CHANGED, { origin: 'undo' });
    }
  }

  redo() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    /* Ein Tippen nach dem Undo entwertet Redo: der Schnitt leert den Stack. */
    this.#commitHistory(this.#caret());
    const eintrag = this.#redoStack.pop();
    if (!eintrag) return;
    this.#undoStack.push(eintrag);
    const ids = applyPatch(letterState, eintrag.entries, 'next');
    render(ids, 'redo');
    this.#persist();
    this.#letzterCaret = eintrag.caretNachher;
    this.#restoreCaret(eintrag.caretNachher);
    if (this.bus && typeof this.bus.publish === 'function') {
      this.bus.publish(Events.DOCUMENT_CHANGED, { origin: 'redo' });
    }
  }

  /** Leert den DOM über den Zustand (ein Schreiber: render). */
  resetDraft() {
    resetState();
    render([...letterState.ids], 'reset');

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
     * schreiben ihren Folgezustand, danach wird der fertige Stand in EINEM
     * Zug gesichert. Der Publish steht im try/catch, damit ein fehlerhafter
     * Listener das Zuruecksetzen nicht unspeicherbar macht. */
    try {
      if (this.bus && typeof this.bus.publish === 'function') {
        this.bus.publish(Events.DOCUMENT_CHANGED, { draft: {}, origin: 'reset' });
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
    Field.setValue(el, labels[state]);
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
    const roh = letterState.werte.betreff;
    const betreff = String(typeof roh === 'string' ? roh : '').replace(/[\x00-\x1f\r\n]/g, ' ').replace(/\s+/g, ' ').trim() || 'Unbenannt';
    document.title = betreff;
  }
}
