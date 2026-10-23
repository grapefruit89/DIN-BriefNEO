// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {DraftManager}
// @adr [[ADR-JS]]
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]

/**
 * @file document.js — Konsolidierter Dokumenten- und Editor-Core für DIN-BriefNEO.
 * Bündelt:
 *  1. Native Selection- und Caret-Helfer (W3C Range / TreeWalker)
 *  2. UIProtections (Zeilenlimits, Paste-Flattening, Blockquote-Shortcut, Anlagen-Liste)
 *  3. DraftManager (Single-Writer für localStorage, Undo/Redo, Autosave, EventBus-Verträge)
 */

import { loadJSON, saveJSON, STORAGE_KEYS, isPrintTitleActive } from './persistence.js';
import { eventBus, Events, Constants } from './core.js';

/* =========================================================================================
 * 0. RICH TEXT SANITIZER (Allowlist Guard)
 * ========================================================================================= */

/**
 * Einzige Sicherheitsgrenze für Rich-Text: DOMParser + exakte Element-Allowlist.
 * Wird von DraftManager (Draft-Restore) und collectDraft genutzt.
 *
 * Bezug: Law Catalog H11 (PREFERRED) & Einleitung (FALLBACK-Klausel):
 * H11 setzt setHTML() als PREFERRED. sanitizeRichText bildet domänenspezifische
 * Anforderungen ab (vollständiges Strippen aller Inline-Attribute, Erhalt der
 * Spezialklasse <span class="brief-kommentar"> bei generischer SPAN-Entfernung,
 * Erzeugung eines DocumentFragment für replaceChildren/collectDraft), die natives
 * setHTML() nicht leistet.
 *
 * Extra-Tags (z. B. UL/LI für Listenfelder wie anlagen-text) ergänzen die
 * Basis-Allowlist (ohne Attribute).
 * @param {string} htmlString
 * @param {{ extraTags?: string[] }} [options]
 * @returns {DocumentFragment}
 */
export function sanitizeRichText(htmlString, options = {}) {
  const allowedTags = ['B', 'STRONG', 'S', 'BLOCKQUOTE', 'BR', 'DIV', 'P', ...(options.extraTags || [])];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString || '', 'text/html');

  /**
   * @param {Node} node
   * @returns {Node}
   */
  const sanitizeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createTextNode('');
    }
    const element = /** @type {Element} */ (node);
    let newNode;
    if (allowedTags.includes(element.nodeName)) {
      newNode = document.createElement(element.nodeName.toLowerCase());
    } else if (element.nodeName === 'SPAN' && element.classList.contains('brief-kommentar')) {
      newNode = document.createElement('span');
      newNode.className = 'brief-kommentar';
    } else {
      const frag = document.createDocumentFragment();
      element.childNodes.forEach((child) => {
        frag.appendChild(sanitizeNode(child));
      });
      return frag;
    }
    element.childNodes.forEach((child) => {
      newNode.appendChild(sanitizeNode(child));
    });
    return newNode;
  };

  const frag = document.createDocumentFragment();
  doc.body.childNodes.forEach((child) => {
    frag.appendChild(sanitizeNode(child));
  });
  return frag;
}

/* =========================================================================================
 * 1. SELECTION & CARET UTILITIES (W3C Standard)
 * ========================================================================================= */

/**
 * Ermittelt den relativen Zeichen-Offset des Carets innerhalb eines Elements.
 * @param {Element} element
 * @returns {number}
 */
export function getCaretCharacterOffset(element) {
  const selection = element.ownerDocument?.defaultView?.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;
  const range = selection.getRangeAt(0);
  const before = range.cloneRange();
  before.selectNodeContents(element);
  before.setEnd(range.endContainer, range.endOffset);
  return before.toString().length;
}

/**
 * Setzt das Caret präzise an einen Zeichen-Offset innerhalb eines Elements (via TreeWalker).
 * @param {HTMLElement} element
 * @param {number} offset
 */
export function setCaretCharacterOffset(element, offset) {
  if (offset <= 0) {
    element.focus();
    return;
  }
  const documentRef = element.ownerDocument;
  const selection = documentRef.defaultView?.getSelection();
  if (!selection) return;
  const range = documentRef.createRange();
  const walker = documentRef.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let node;
  while ((node = walker.nextNode())) {
    const length = node.textContent?.length || 0;
    if (remaining <= length) {
      range.setStart(node, remaining);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    remaining -= length;
  }
  setCaretToEnd(element);
}

/**
 * Platziert das Caret am Ende des Elements.
 * @param {HTMLElement} element
 */
export function setCaretToEnd(element) {
  const selection = element.ownerDocument.defaultView?.getSelection();
  if (!selection) return;
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Formatiert deutsche Mobilfunknummern nach DIN 5008 (Vorwahl + Leerzeichen + Rufnummer).
 * Erhält einen Durchwahl-Bindestrich. Festnetz- und Sonderrufnummern bleiben unverändert.
 * @param {string | null | undefined} input
 * @returns {string}
 */
export function formatGermanMobile(input) {
  const original = String(input || '');
  const [main, dw = ''] = original.split('-', 2);
  let digits = main.replace(/[\s/.\-();]+/g, '');
  if (!digits) return original;

  const dwClean = dw.replace(/[\s/.\-();]+/g, '');
  const dwSuffix = dwClean ? `-${dwClean}` : '';

  // 1. Internationale Präfixe erkennen
  const isInternational = original.startsWith('+') || original.startsWith('0049') || original.startsWith('49');

  if (digits.startsWith('+49')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0049')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('49')) {
    if (/^1[5-7]\d/.test(digits.slice(2))) digits = digits.slice(2);
    else return original;
  }

  // Führende 0 (national oder aus "+49 (0)") abstreifen
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // 2. Deutsche Mobilfunknummer (Vorwahlen 015x, 016x, 017x)
  if (/^1[5-7]\d/.test(digits)) {
    if (isInternational) {
      return `+49 ${digits.slice(0, 3)} ${digits.slice(3)}${dwSuffix}`;
    }
    return `0${digits.slice(0, 3)} ${digits.slice(3)}${dwSuffix}`;
  }

  return original;
}

/* =========================================================================================
 * 2. UI PROTECTIONS (Zeilenlimits, Paste-Schutz, Anlagen-Struktur)
 * ========================================================================================= */

export class UIProtections {
  constructor() {
    /** @type {HTMLElement | null} */
    this.text = document.getElementById('text');
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.enforceLineLimits();
    this.protectAnlagenList();
    this.setupPrintProtection();
    this.setupMobilePhoneFormatting();
    this.initialized = true;
  }

  setupPrintProtection() {
    window.addEventListener('beforeprint', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }

  enforceLineLimits() {
    const root = document.querySelector('din-a4') || document;

    // Enter-Taste abfangen: Single-Line blockiert Umbruch, maxTwoLines begrenzt auf 2 Zeilen
    root.addEventListener('keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      const target = keyboardEvent.target instanceof Element ? keyboardEvent.target.closest('[contenteditable]') : null;
      if (!target || !(target instanceof HTMLElement)) return;

      // Rich-Text-Light: Blockquote-Shortcut (Ctrl+Q / Cmd+Q) für Text
      if (target.id === 'text' && (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'q') {
        keyboardEvent.preventDefault();
        this.#toggleBlockquote(target);
        return;
      }

      // DIN 5008 13.1: Keine Unterstreichung — Ctrl+U / Cmd+U blockieren
      if ((keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'u') {
        keyboardEvent.preventDefault();
        return;
      }

      if (keyboardEvent.key === 'Enter') {
        if (target.dataset.feldtyp?.includes('mehrzeilig')) {
          return;
        } else if (target.dataset.feldtyp?.includes('zweizeilig')) {
          const text = target.innerText || target.textContent || '';
          if (text.split('\n').length >= 2) {
            keyboardEvent.preventDefault();
          }
        } else {
          keyboardEvent.preventDefault();
        }
      }
    });

    // DIN 5008 13.1: Format-Event für Unterstreichung via Input-Events / Kontextmenü abfangen
    root.addEventListener('beforeinput', (e) => {
      const inputEvent = /** @type {InputEvent} */ (e);
      if (inputEvent.inputType === 'formatUnderline') {
        inputEvent.preventDefault();
      }
    });

    // Paste-Handling: Mehrzeiligen Text für Einzeiler einebnen, 2-Zeiler begrenzen
    root.addEventListener('paste', (e) => {
      const clipboardEvent = /** @type {ClipboardEvent} */ (e);
      const target = clipboardEvent.target instanceof Element ? clipboardEvent.target.closest('[contenteditable]') : null;
      if (!target || !(target instanceof HTMLElement)) return;

      const clipboardData = clipboardEvent.clipboardData || /** @type {any} */ (clipboardEvent).originalEvent?.clipboardData;
      let pastedText = clipboardData ? clipboardData.getData('text/plain') : '';
      if (!pastedText) return;

      // Rich-Text-Light: Plaintext-Paste im Text erhält Zeilenumbrüche, streift aber fremdes HTML/CSS ab
      if (target.id === 'text') {
        clipboardEvent.preventDefault();
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const lines = pastedText.split(/\r?\n/);
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) {
            fragment.appendChild(document.createElement('br'));
          }
          if (lines[i]) {
            fragment.appendChild(document.createTextNode(lines[i]));
          }
        }
        const lastChild = fragment.lastChild;
        range.insertNode(fragment);
        if (lastChild) {
          range.setStartAfter(lastChild);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        target.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      if (target.dataset.feldtyp?.includes('mehrzeilig')) return;

      clipboardEvent.preventDefault();
      const isTwoLine = target.dataset.feldtyp?.includes('zweizeilig');

      if (isTwoLine) {
        const maxChars = 130;
        pastedText = pastedText.split(/\r?\n/).slice(0, 2).join('\n');
        if (pastedText.length > maxChars) {
          pastedText = pastedText.substring(0, maxChars);
        }
      } else {
        pastedText = pastedText.replace(/[\r\n]+/g, ' ');
      }

      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(pastedText));
      selection.collapseToEnd();
      target.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  protectAnlagenList() {
    const anlagen = document.getElementById('anlagen-text');
    if (!anlagen) return;

    this.ensureListStructure(anlagen);

    anlagen.addEventListener('input', () => {
      this.ensureListStructure(anlagen);
    });

    anlagen.addEventListener('keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      if (keyboardEvent.key === 'Backspace' || keyboardEvent.key === 'Delete') {
        const lis = anlagen.querySelectorAll('li');
        if (lis.length === 1 && lis[0].textContent && lis[0].textContent.trim() === '') {
          keyboardEvent.preventDefault();
        }
      }
    });
  }

  /**
   * @param {HTMLElement} anlagen
   */
  ensureListStructure(anlagen) {
    if (anlagen.innerHTML.trim() === '' || anlagen.innerHTML.trim() === '<br>') {
      const li = document.createElement('li');
      anlagen.replaceChildren(li);
      this.#placeCaretIn(anlagen, li);
      return;
    }
    if (anlagen.children.length === 0) {
      const lines = (anlagen.textContent || '').split('\n').map(l => l.trim()).filter(Boolean);
      const lis = lines.map(line => {
        const li = document.createElement('li');
        li.textContent = line;
        return li;
      });
      if (lis.length) {
        anlagen.replaceChildren(...lis);
        this.#placeCaretIn(anlagen, lis[lis.length - 1]);
      }
    }
  }

  /**
   * Platziert den Caret am Ende des Elements.
   * @param {HTMLElement} anlagen
   * @param {Element} li
   */
  #placeCaretIn(anlagen, li) {
    if (document.activeElement === anlagen) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(li);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  /**
   * Rich-Text-Light: Schaltet Zitat (<blockquote>) im Text per W3C Range API um.
   * @param {HTMLElement} textEl
   */
  #toggleBlockquote(textEl) {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !textEl.contains(selection.anchorNode)) return;

    const elem = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode.parentElement;
    const bq = elem ? elem.closest('blockquote') : null;

    if (bq && textEl.contains(bq)) {
      const parent = bq.parentNode;
      if (parent) {
        const fragment = document.createDocumentFragment();
        while (bq.firstChild) {
          fragment.appendChild(bq.firstChild);
        }
        parent.replaceChild(fragment, bq);
      }
    } else {
      if (selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const newBq = document.createElement('blockquote');

      if (!selection.isCollapsed) {
        try {
          newBq.appendChild(range.extractContents());
          range.insertNode(newBq);
          selection.selectAllChildren(newBq);
        } catch (err) {
          console.warn('[RichTextLight] Blockquote wrap failed:', err);
        }
      } else {
        const br = document.createElement('br');
        newBq.appendChild(br);
        range.insertNode(newBq);
        const newRange = document.createRange();
        newRange.setStart(newBq, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    textEl.normalize();
    textEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * DIN 5008 11.3.2: Formatierung deutscher Mobilfunknummern beim Verlassen des Telefonfeldes.
   */
  setupMobilePhoneFormatting() {
    const tel = document.getElementById('absender-tel');
    if (!tel) return;
    tel.addEventListener('blur', () => {
      const current = (tel.textContent || '').trim();
      if (!current) return;
      const formatted = formatGermanMobile(current);
      if (formatted && formatted !== current) {
        tel.textContent = formatted;
        tel.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }
}

/* =========================================================================================
 * 3. DRAFT MANAGER (Single-Writer für localStorage, Undo/Redo, Autosave)
 * ========================================================================================= */

/* Komma ist CSS-Selektor-Listen-Vereinigung (ODER, nicht UND):
 * Matcht contenteditable-Blattfelder UND speicherbare Formular-Selects (z. B. Postvermerk). */
const EDITABLE_FIELD_SELECTOR = '[contenteditable]:not([data-feldtyp="systemwert"]), select[data-speichern]';

/**
 * Sammelt den aktuellen Zustand aller editierbaren Felder direkt aus dem Live-DOM.
 * Rich-Text-Felder werden vor der Ausgabe mit sanitizeRichText abgesichert.
 * @returns {Record<string, string>}
 */
export function collectDraft() {
  /** @type {Record<string, string>} */
  const draft = {};

  if (typeof document === 'undefined') return draft;

  document.querySelectorAll('[contenteditable]').forEach(elem => {
    if (!elem.id || elem.getAttribute('data-feldtyp') === 'systemwert') return;
    if (elem.id === 'anlagen-text' && !/** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'))?.checked) return;
    if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
      const isListe = Boolean(elem.getAttribute('data-feldtyp')?.includes('liste'));
      const extra = isListe ? { extraTags: ['UL', 'OL', 'LI'] } : undefined;
      const cleanFrag = sanitizeRichText(elem.innerHTML, extra);
      const container = document.createElement('div');
      container.appendChild(cleanFrag);
      draft[elem.id] = container.innerHTML;
    } else {
      draft[elem.id] = elem.textContent || '';
    }
  });

  document.querySelectorAll('select[data-speichern]').forEach(elem => {
    const sel = /** @type {HTMLSelectElement} */ (elem);
    if (sel.id) draft[sel.id] = sel.value;
  });

  const postvermerk = document.getElementById('postvermerk');
  if (postvermerk && postvermerk.getAttribute('data-visible') === 'true') {
    draft['postvermerk-visible'] = 'true';
  }

  const copyfitEl = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-copyfit'));
  if (copyfitEl) {
    draft['toggle-copyfit'] = String(copyfitEl.checked);
  }

  const anlagenSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  if (anlagenSwitch) {
    draft['toggle-anlagen'] = String(anlagenSwitch.checked);
  }

  return draft;
}

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
        if (payload && payload.debounce) {
          this.scheduleAutoSave();
        } else {
          this.saveDraft();
        }
      });
    }
  }

  #initLifecycleFlush() {
    const flush = () => {
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
        this.saveDraft();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          flush();
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', flush);
    }
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
    const draft = collectDraft();

    const saved = saveJSON(STORAGE_KEYS.draft, draft);
    this.#setSaveStatus(saved ? 'saved' : 'error');
    this.#updateDocumentTitle();

    if (this.bus && typeof this.bus.publish === 'function') {
      this.bus.publish(saved ? Events.DOCUMENT_SAVED : Events.DOCUMENT_SAVE_FAILED, { draft });
    }

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
   * @param {Record<string, string>} draft
   */
  restoreDraft(draft) {
    if (!draft || typeof draft !== 'object') return;
    this.#restoreState(draft);
    this.saveDraft();
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

      // HTML-Restore ausschließlich über sanitizeRichText (Allowlist)
      if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
        const isListe = Boolean(elem.getAttribute('data-feldtyp')?.includes('liste'));
        const extra = isListe ? { extraTags: ['UL', 'OL', 'LI'] } : undefined;
        elem.replaceChildren(sanitizeRichText(draft[id], extra));
        if (isListe && elem.children.length === 0) {
          elem.replaceChildren(document.createElement('li'));
        }
      } else if (!elem.querySelector('select[data-speichern]')) {
        elem.textContent = draft[id];
      }
    });

    const postvermerk = document.getElementById('postvermerk');
    if (postvermerk) {
      if (draft['postvermerk-visible'] === 'true') {
        postvermerk.setAttribute('data-visible', 'true');
      } else {
        postvermerk.removeAttribute('data-visible');
      }
    }
    const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
    if (pvSelect) {
      pvSelect.selectedIndex = 0;
    }

    if ('toggle-copyfit' in draft) {
      const copyfitSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-copyfit'));
      if (copyfitSwitch) {
        copyfitSwitch.checked = draft['toggle-copyfit'] === 'true';
      }
    }

    const anlagenSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
    if (anlagenSwitch) {
      if ('toggle-anlagen' in draft) {
        anlagenSwitch.checked = draft['toggle-anlagen'] === 'true';
      }
      /* Migration: alte Drafts können anlagen-text enthalten, obwohl Toggle aus ist */
      if (!anlagenSwitch.checked) {
        const anlagenEl = document.getElementById('anlagen-text');
        if (anlagenEl) anlagenEl.replaceChildren();
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
    document.querySelectorAll('[contenteditable]').forEach(el => {
      if (el.getAttribute('data-feldtyp') === 'systemwert') return;
      if (el.getAttribute('data-feldtyp')?.includes('liste')) {
        if (el.id === 'anlagen-text') {
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
    const copyfitSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-copyfit'));
    if (copyfitSwitch) {
      copyfitSwitch.checked = false;
    }
    const anlagenSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
    if (anlagenSwitch) {
      anlagenSwitch.checked = false;
    }
    const postvermerk = document.getElementById('postvermerk');
    if (postvermerk) {
      postvermerk.removeAttribute('data-visible');
    }
    const pvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
    if (pvSelect) {
      pvSelect.selectedIndex = 0;
    }
    this.saveDraft();
    if (this.bus && typeof this.bus.publish === 'function') {
      this.bus.publish(Events.DOCUMENT_CHANGED, { draft: {} });
    }
  }

  scheduleAutoSave() {
    this.#setSaveStatus('dirty');
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
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
    const labels = { saved: 'Gespeichert', dirty: 'Speichern…', error: 'Fehler beim Speichern!' };
    el.textContent = labels[state];
    el.title = labels[state];
    if (state === 'error' && typeof document.ariaNotify === 'function') {
      document.ariaNotify('Fehler beim Speichern', { priority: 'important' });
    }
  }

  #updateDocumentTitle() {
    if (isPrintTitleActive()) return;
    const betreff = (document.getElementById('betreff')?.textContent || '').replace(/[\x00-\x1f\r\n]/g, ' ').replace(/\s+/g, ' ').trim() || 'Unbenannt';
    document.title = betreff;
  }
}
