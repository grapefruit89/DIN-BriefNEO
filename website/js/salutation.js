// @ts-check
// @adr [[ADR-JS]] {SalutationEngine}
// Anrede & Grußformel — bewusst klein (80/20), dafür verlässlich.
//
// Regeln:
//  1. Das Geschlecht kommt NUR aus einem expliziten "Herr/Herrn/Frau" im
//     Namensfeld. Ohne Präfix wird neutral angesprochen — lieber neutral als
//     falsch geraten. Keine Namensliste, kein Datei-Laden. Vornamen werden
//     nicht gedeutet (Entscheidung 2026-11-07, Backlog #18): eine Liste
//     deutscher Vornamen deckt weder Herkunft noch Schreibweise ab und rät
//     im Zweifel falsch.
//  2. Auto-Text wird nur geschrieben, solange das Feld leer ist oder noch genau
//     den zuletzt generierten Text enthält. Manuelle Eingaben bleiben unberührt.
//  3. derive() ist eine reine Funktion (kein DOM, kein Netz) und damit testbar.

import { Constants, Events, eventBus } from './core.js';
import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';

const STYLES = /** @type {const} */ (['formal', 'polite', 'casual']);

export const SALUTATION_TONES = Object.freeze(/** @type {const} */ ({
  formal: {
    salutationDefault: 'Sehr geehrte Damen und Herren,',
    salutationMale: 'Sehr geehrter Herr',
    salutationFemale: 'Sehr geehrte Frau',
    closing: 'Mit freundlichen Grüßen'
  },
  polite: {
    salutationDefault: 'Guten Tag,',
    salutationMale: 'Guten Tag Herr',
    salutationFemale: 'Guten Tag Frau',
    closing: 'Freundliche Grüße'
  },
  casual: {
    salutationDefault: 'Hallo,',
    salutationMale: 'Hallo Herr',
    salutationFemale: 'Hallo Frau',
    closing: 'Beste Grüße'
  }
}));

const CLOSINGS = Object.freeze({
  formal: SALUTATION_TONES.formal.closing,
  polite: SALUTATION_TONES.polite.closing,
  casual: SALUTATION_TONES.casual.closing
});

const FALLBACK = Object.freeze({
  formal: SALUTATION_TONES.formal.salutationDefault,
  polite: SALUTATION_TONES.polite.salutationDefault,
  casual: SALUTATION_TONES.casual.salutationDefault
});

const FALLBACK_SET = new Set(Object.values(FALLBACK));
const CLOSINGS_SET = new Set(Object.values(CLOSINGS));

const ORG_WORDS = new Set(['gmbh', 'ag', 'eg', 'ug', 'ev', 'kg', 'ohg', 'gbr', 'kgaa', 'ek']);
const PARTICLES = new Set(['von', 'vom', 'zu', 'zur', 'zum', 'van', 'der', 'den', 'de', 'ten', 'ter', 'la', 'le', 'du', 'di']);

/**
 * @param {string | undefined} f
 * @returns {'formal' | 'polite' | 'casual'}
 */
function toStyle(f) {
  return /** @type {any} */ (STYLES).includes(f) ? /** @type {any} */ (f) : 'formal';
}

/**
 * Leitet die Anrede nach DIN 5008 ab (KISS).
 * @param {string} [rawText]
 * @param {'formal' | 'polite' | 'casual' | string} [style]
 * @returns {string}
 */
export function deriveSalutation(rawText, style = 'formal') {
  const normStyle = toStyle(style);
  let text = String(rawText ?? '').trim();
  if (!text) return FALLBACK[normStyle];

  // 1. Präfix extrahieren (falls vor dem Komma) & Comma-Swap: "Müller, Hans" -> "Hans Müller"
  let prefix = '';
  const m = text.match(/^(herrn?|frau)\s+/i);
  if (m) {
    prefix = m[1];
    text = text.slice(m[0].length).trim();
  }
  const comma = text.indexOf(',');
  if (comma > 0) {
    text = `${text.slice(comma + 1)} ${text.slice(0, comma)}`.trim();
  }
  if (prefix) {
    text = `${prefix} ${text}`.trim();
  }

  const words = text.split(/\s+/).filter(Boolean);
  const lower = words.map((w) => w.toLowerCase().replace(/[^a-zäöüß]/g, ''));

  // 2. Präfix prüfen (Herr / Frau gewinnt immer)
  const firstLower = lower[0];
  const isFemale = firstLower === 'frau';
  const isMale = firstLower === 'herr' || firstLower === 'herrn';

  // 3. Kein Präfix -> Organisations-Check, sonst neutraler DIN-Fallback
  if ((!isFemale && !isMale) || words.length <= 1) {
    return FALLBACK[normStyle];
  }

  // Organisationsteile am Ende abschneiden (z. B. "Herr Bank eG", "Herr Mustermann e.K.")
  while (words.length > 2 && ORG_WORDS.has(lower[words.length - 1])) {
    words.pop();
    lower.pop();
  }

  // 4. Nachname inkl. Namenspartikel (von, van der, etc.)
  let lastNameIdx = words.length - 1;
  while (lastNameIdx > 1 && PARTICLES.has(lower[lastNameIdx - 1])) {
    lastNameIdx--;
  }
  const nachname = words.slice(lastNameIdx).join(' ');

  // 5. Titel zwischen Anrede und Nachname erfassen (Dr., Prof.)
  const titel = words.slice(1, lastNameIdx).filter((w) => w.includes('.')).join(' ');
  const zusatz = titel ? ` ${titel}` : '';

  let anrede = isFemale ? 'Sehr geehrte Frau' : 'Sehr geehrter Herr';
  if (normStyle === 'polite') {
    anrede = isFemale ? 'Guten Tag Frau' : 'Guten Tag Herr';
  } else if (normStyle === 'casual') {
    anrede = isFemale ? 'Hallo Frau' : 'Hallo Herr';
  }

  return `${anrede}${zusatz} ${nachname},`;
}

export const SalutationEngine = {
  CLOSINGS,
  SALUTATION_TONES,

  /**
   * Leitet die Anrede aus dem Namensfeld ab.
   * Unterstützt: "Herr/Frau Nachname", "Herrn Vorname Nachname", Titel
   * (Dr., Prof.), Namenszusätze (von, van der, ...) und "Nachname, Vorname".
   * Ohne Herr/Frau-Präfix wird kein Geschlecht geraten (DIN 5008 Fallback).
   * @param {{ rawName?: string, formality?: string } | string} [optsOrName]
   * @param {string} [maybeFormality]
   * @returns {string}
   */
  derive(optsOrName, maybeFormality) {
    if (optsOrName && typeof optsOrName === 'object') {
      return deriveSalutation(optsOrName.rawName, optsOrName.formality);
    }
    return deriveSalutation(optsOrName, maybeFormality);
  },

  /** @param {string} [formality] */
  getClosing(formality = 'formal') {
    return CLOSINGS[toStyle(formality)];
  },

  /** @param {string} [formality] */
  getFallback(formality = 'formal') {
    return FALLBACK[toStyle(formality)];
  }
};

/* @adr [[ADR-JS]] {SalutationFeature} */
export class SalutationFeature {
  /** @type {import('./settings.js').SettingsManager | null} */
  #settingsManager;
  /** Zuletzt automatisch geschriebener Text je Feld (Key = Element-ID). */
  #auto = { anrede: '', grussformel: '' };
  /** @type {(() => void) | null} */
  #unsubDocChanged = null;

  /**
   * @param {import('./settings.js').SettingsManager | null} [settingsManager]
   */
  constructor(settingsManager = null) {
    this.#settingsManager = settingsManager;
    this.settings = settingsManager ? settingsManager.settings : loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    this.settings.formality = toStyle(this.settings.formality);
  }

  init() {
    const styleSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
    if (styleSelect) {
      styleSelect.value = this.settings.formality;
      styleSelect.addEventListener('change', () => {
        this.#setStyle(toStyle(styleSelect.value));
      });
    }

    this.#seedAuto();

    document.getElementById('empfaenger-name')?.addEventListener('input', () => this.#update('anrede'));
    document.getElementById('empfaenger-firma')?.addEventListener('input', () => this.#update('anrede'));

    for (const kind of /** @type {const} */ (['anrede', 'grussformel'])) {
      const el = document.getElementById(kind);
      if (!el) continue;
      // Tippt der Nutzer etwas Eigenes, ist es kein Auto-Text mehr (Optik: [data-generated]).
      el.addEventListener('input', () => {
        const text = (el.textContent || '').trim();
        if (text && text !== this.#auto[kind]) {
          delete el.dataset.generated;
          el.dataset.dirty = 'true';
        } else {
          delete el.dataset.dirty;
          el.dataset.generated = 'true';
        }
      });
      el.addEventListener('blur', () => this.#hint(kind, el));
    }

    /* Reset und Undo/Redo melden sich als DOCUMENT_CHANGED. Ein eigener
     * Dialog-Listener waere ein zweiter Pfad fuer denselben Zustand (und ein
     * zweiter Speicherimpuls). Deshalb haengt hier beides: erst vorhandenen
     * Auto-Text als solchen markieren, dann leere Felder fuellen. */
    this.#unsubDocChanged = eventBus.subscribe(Events.DOCUMENT_CHANGED, () => {
      this.#seedAuto();
      this.refresh();
    });

    this.refresh();
  }

  destroy() {
    if (this.#unsubDocChanged) {
      this.#unsubDocChanged();
      this.#unsubDocChanged = null;
    }
  }

  /** Leere Felder mit Auto-Text füllen; Eigenes bleibt stehen. */
  refresh() {
    this.#update('anrede', true);
    this.#update('grussformel', true);
  }

  /** @param {'formal' | 'polite' | 'casual'} style */
  #setStyle(style) {
    this.settings.formality = style;
    const styleSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
    if (styleSelect?.value !== style) {
      if (styleSelect) styleSelect.value = style;
    }
    if (this.#settingsManager) {
      this.#settingsManager.updateSettings();
    } else {
      saveJSON(STORAGE_KEYS.settings, this.settings);
    }
    this.#update('anrede');
    this.#update('grussformel');
  }

  /**
   * Nach einem Reload steht der alte Auto-Text schon im Feld. Entspricht er
   * dem, was die Engine erzeugen würde (oder Standard-Fallbacks), bleibt er "automatisch".
   */
  #seedAuto() {
    const name = this.#nameText();
    const anredeEl = document.getElementById('anrede');
    const anrede = (anredeEl?.textContent || '').trim();
    if (anrede) {
      const isAutoAnrede = FALLBACK_SET.has(/** @type {any} */ (anrede))
        || STYLES.some((s) => SalutationEngine.derive({ rawName: name, formality: s }) === anrede);
      if (isAutoAnrede && anredeEl) {
        if (anredeEl.dataset.dirty === 'true') {
          delete anredeEl.dataset.dirty;
        }
        anredeEl.dataset.generated = 'true';
        this.#auto.anrede = anrede;
      }
    }
    const grussEl = document.getElementById('grussformel');
    const gruss = (grussEl?.textContent || '').trim();
    if (gruss) {
      const isAutoGruss = CLOSINGS_SET.has(/** @type {any} */ (gruss));
      if (isAutoGruss && grussEl) {
        if (grussEl.dataset.dirty === 'true') {
          delete grussEl.dataset.dirty;
        }
        grussEl.dataset.generated = 'true';
        this.#auto.grussformel = gruss;
      }
    }
  }

  #nameText() {
    const name = (document.getElementById('empfaenger-name')?.textContent || '').trim();
    if (name) return name;
    return (document.getElementById('empfaenger-firma')?.textContent || '').trim();
  }

  /**
   * Schreibt den Auto-Text, außer der Nutzer hat das Feld selbst befüllt.
   * @param {'anrede' | 'grussformel'} kind
   * @param {boolean} [onlyIfEmpty]
   */
  #update(kind, onlyIfEmpty = false) {
    const el = document.getElementById(kind);
    if (!el || document.activeElement === el) return;

    const current = (el.textContent || '').trim();
    if (!current) {
      delete el.dataset.dirty;
    }
    // Nutzer-Text respektieren: wenn explizit vom Nutzer manuell editiert
    if (el.dataset.dirty === 'true' && current) return;
    if (current && onlyIfEmpty) return;

    const style = this.settings.formality;
    const value = kind === 'anrede'
      ? SalutationEngine.derive({ rawName: this.#nameText(), formality: style })
      : SalutationEngine.getClosing(style);

    this.#auto[kind] = value;
    if (value === current) {
      el.dataset.generated = 'true';
      return;
    }
    el.textContent = value;
    el.dataset.generated = 'true';
    delete el.dataset.dirty;
    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
  }

  /**
   * DIN-5008-Hinweis nur für selbst getippten Text.
   * @param {'anrede' | 'grussformel'} kind
   * @param {HTMLElement} el
   */
  #hint(kind, el) {
    const text = (el.textContent || '').trim();
    if (!text || text === this.#auto[kind]) return;
    if (kind === 'anrede' && !text.endsWith(',')) {
      eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: Constants.TOASTS.SALUTATION.PUNCTUATION, type: 'warning' });
    } else if (kind === 'grussformel' && /[,.]$/.test(text)) {
      eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: Constants.TOASTS.SALUTATION.CLOSING_PUNCTUATION, type: 'warning' });
    }
  }
}
