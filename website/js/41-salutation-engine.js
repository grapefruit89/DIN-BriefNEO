// @ts-check
// @adr [[ADR-JS]] {SalutationEngine}
// Anrede & Grußformel — bewusst klein (80/20), dafür verlässlich.
//
// Regeln:
//  1. Das Geschlecht kommt NUR aus einem expliziten "Herr/Herrn/Frau" im
//     Namensfeld. Ohne Präfix wird neutral angesprochen — lieber neutral als
//     falsch geraten. Keine Namensliste, kein Datei-Laden.
//  2. Auto-Text wird nur geschrieben, solange das Feld leer ist oder noch genau
//     den zuletzt generierten Text enthält. Manuelle Eingaben bleiben unberührt.
//  3. derive() ist eine reine Funktion (kein DOM, kein Netz) und damit testbar.

import { loadJSON, saveJSON, STORAGE_KEYS, DEFAULT_SETTINGS, Constants } from './51-storage.js';
import { showToast } from './32-toast.js';

const STYLES = /** @type {const} */ (['formal', 'polite', 'casual']);

const CLOSINGS = Object.freeze({
  formal: 'Mit freundlichen Grüßen',
  polite: 'Freundliche Grüße',
  casual: 'Beste Grüße'
});

const FALLBACK = Object.freeze({
  formal: 'Sehr geehrte Damen und Herren,',
  polite: 'Guten Tag,',
  casual: 'Hallo,'
});

/** Namenszusätze, die zum Nachnamen gehören ("von", "van der", ...). */
const PARTICLES = new Set(['von', 'vom', 'zu', 'zur', 'zum', 'van', 'der', 'den', 'de', 'ten', 'ter', 'la', 'le', 'du', 'di']);

/**
 * @param {string | undefined} f
 * @returns {'formal' | 'polite' | 'casual'}
 */
function toStyle(f) {
  return /** @type {any} */ (STYLES).includes(f) ? /** @type {any} */ (f) : 'formal';
}

export const SalutationEngine = {
  CLOSINGS,

  /**
   * Leitet die Anrede aus dem Namensfeld ab.
   * Unterstützt: "Herr/Frau Nachname", "Herrn Vorname Nachname", Titel
   * (alles mit Punkt am Ende wird ignoriert: Dr., Prof., Dipl.-Ing., Initialen),
   * Namenszusätze (von, van der, ...) und "Nachname, Vorname".
   * @param {{ rawName?: string, formality?: string }} [opts]
   * @returns {string}
   */
  derive({ rawName = '', formality = 'formal' } = {}) {
    const style = toStyle(formality);
    let text = (rawName || '').trim();

    // 1. Explizites Herr/Frau (einziger Geschlechts-Hinweis)
    /** @type {'m' | 'f' | null} */
    let gender = null;
    const prefix = text.match(/^(herrn?|frau)(?=\s|$)/i);
    if (prefix) {
      gender = prefix[1].toLowerCase() === 'frau' ? 'f' : 'm';
      text = text.slice(prefix[0].length).trim();
    }

    // 2. "Müller, Hans" -> "Hans Müller"
    const comma = text.indexOf(',');
    if (comma > 0) text = `${text.slice(comma + 1)} ${text.slice(0, comma)}`;

    // 3. Titel und Initialen (alles mit Punkt am Ende) entfernen
    const tokens = text.split(/\s+/).filter((t) => t && !t.endsWith('.'));
    if (tokens.length === 0) return FALLBACK[style]; // leer oder nur "Herr " getippt

    // 4. Nachname inkl. Zusätze, Vorname = erstes Wort
    let i = tokens.length - 1;
    while (i > 0 && PARTICLES.has(tokens[i - 1].toLowerCase())) i--;
    const lastName = tokens.slice(i).join(' ');
    const firstName = i > 0 ? tokens[0] : '';

    // 5. Ausgabe
    if (style === 'casual') {
      if (firstName) return `Hallo ${firstName},`;
      if (gender) return `Hallo ${gender === 'f' ? 'Frau' : 'Herr'} ${lastName},`;
      return FALLBACK.casual;
    }
    if (!gender) return FALLBACK[style]; // ohne Herr/Frau: neutral

    if (style === 'polite') return `Guten Tag ${gender === 'f' ? 'Frau' : 'Herr'} ${lastName},`;
    return gender === 'f' ? `Sehr geehrte Frau ${lastName},` : `Sehr geehrter Herr ${lastName},`;
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
  /** @type {{ settings: any, save: () => void } | null} */
  #ctx;
  /** Zuletzt automatisch geschriebener Text je Feld (Key = Element-ID). */
  #auto = { anrede: '', grussformel: '' };

  /**
   * `settingsContext` ist das geteilte Settings-Objekt des SettingsManager
   * (ein Settings-Owner, kein eigener Snapshot per loadSettings()).
   * @param {(() => void) | null} saveDraftDataCallback
   * @param {{ settings: any, save: () => void } | null} [settingsContext]
   */
  constructor(saveDraftDataCallback, settingsContext = null) {
    this.saveDraftData = saveDraftDataCallback;
    this.#ctx = settingsContext;
    this.settings = settingsContext ? settingsContext.settings : loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    this.settings.formality = toStyle(this.settings.formality);
  }

  init() {
    const checked = /** @type {HTMLInputElement | null} */ (document.getElementById(`btn-style-${this.settings.formality}`));
    if (checked) checked.checked = true;

    this.#seedAuto();

    for (const style of STYLES) {
      document.getElementById(`btn-style-${style}`)?.addEventListener('change', () => this.#setStyle(style));
    }
    document.getElementById('empfaenger-namenszeile')?.addEventListener('input', () => this.#update('anrede'));

    for (const kind of /** @type {const} */ (['anrede', 'grussformel'])) {
      const el = document.getElementById(kind);
      if (!el) continue;
      // Tippt der Nutzer etwas Eigenes, ist es kein Auto-Text mehr (Optik: [data-generated]).
      el.addEventListener('input', () => {
        if ((el.textContent || '').trim() !== this.#auto[kind]) delete el.dataset.generated;
      });
      el.addEventListener('blur', () => this.#hint(kind, el));
    }

    // Nach "Brief zurücksetzen" (main.js leert vorher die Felder) wieder befüllen.
    const resetDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('reset-dialog'));
    resetDialog?.addEventListener('close', () => {
      if (resetDialog.returnValue === 'confirm') this.refresh();
    });

    this.refresh();
  }

  /** Leere Felder mit Auto-Text füllen; Eigenes bleibt stehen. */
  refresh() {
    this.#update('anrede', true);
    this.#update('grussformel', true);
  }

  /** @param {'formal' | 'polite' | 'casual'} style */
  #setStyle(style) {
    this.settings.formality = style;
    if (this.#ctx) this.#ctx.save();
    else saveJSON(STORAGE_KEYS.settings, this.settings);
    this.#update('anrede');
    this.#update('grussformel');
  }

  /**
   * Nach einem Reload steht der alte Auto-Text schon im Feld. Entspricht er
   * dem, was die Engine erzeugen würde, bleibt er "automatisch".
   */
  #seedAuto() {
    const name = this.#nameText();
    const anrede = (document.getElementById('anrede')?.textContent || '').trim();
    if (anrede && STYLES.some((s) => SalutationEngine.derive({ rawName: name, formality: s }) === anrede)) {
      this.#auto.anrede = anrede;
    }
    const gruss = (document.getElementById('grussformel')?.textContent || '').trim();
    if (gruss && /** @type {string[]} */ (Object.values(CLOSINGS)).includes(gruss)) {
      this.#auto.grussformel = gruss;
    }
  }

  #nameText() {
    return document.getElementById('empfaenger-namenszeile')?.textContent || '';
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
    if (current && (onlyIfEmpty || current !== this.#auto[kind])) return; // Nutzer-Text

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
    if (this.saveDraftData) this.saveDraftData();
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
      showToast(Constants.TOASTS.SALUTATION_PUNCTUATION, 'warning');
    } else if (kind === 'grussformel' && /[,.]$/.test(text)) {
      showToast(Constants.TOASTS.CLOSING_PUNCTUATION, 'warning');
    }
  }
}
