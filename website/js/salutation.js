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

/** Bekannte akademische Grade und Titel */
const KNOWN_TITLES = new Set([
  'dr', 'prof', 'dipl', 'ing', 'mag', 'med', 'jur', 'rer', 'nat',
  'msc', 'bsc', 'mba', 'phd', 'ba', 'ma', 'hc', 'mult'
]);

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

/** Namenszusätze, die zum Nachnamen gehören ("von", "van der", ...). */
const PARTICLES = new Set(['von', 'vom', 'zu', 'zur', 'zum', 'van', 'der', 'den', 'de', 'ten', 'ter', 'la', 'le', 'du', 'di']);

/** Firmen-, Behörden- und Organisations-Schlagworte für neutrale Anrede. */
const COMPANY_KEYWORDS = new Set([
  'gmbh', 'ag', 'ug', 'kg', 'ohg', 'gbr', 'corp', 'inc', 'ltd', 'llc', 'ev', 'e.v.',
  'stadtwerke', 'amt', 'gericht', 'bundesamt', 'ministerium', 'verwaltung', 'polizei',
  'feuerwehr', 'krankenhaus', 'klinik', 'universität', 'hochschule', 'schule', 'institut',
  'akademie', 'bank', 'sparkasse', 'versicherung', 'krankenkasse', 'stiftung', 'verein',
  'verband', 'genossenschaft', 'redaktion', 'service', 'team', 'abteilung'
]);


/**
 * @param {string | undefined} f
 * @returns {'formal' | 'polite' | 'casual'}
 */
function toStyle(f) {
  return /** @type {any} */ (STYLES).includes(f) ? /** @type {any} */ (f) : 'formal';
}

export const SalutationEngine = {
  CLOSINGS,
  SALUTATION_TONES,

  /**
   * Leitet die Anrede aus dem Namensfeld ab.
   * Unterstützt: "Herr/Frau Nachname", "Herrn Vorname Nachname", Titel
   * (Dr., Prof., Dipl.-Ing., etc.), Namenszusätze (von, van der, ...) und
   * "Nachname, Vorname". Ohne Herr/Frau-Präfix wird kein Geschlecht geraten.
   * @param {{ rawName?: string, formality?: string }} [opts]
   * @returns {string}
   */
  derive({ rawName = '', formality = 'formal' } = {}) {
    const style = toStyle(formality);
    let text = (rawName || '').trim();
    if (!text) return FALLBACK[style];

    // 1. Explizites Herr/Frau (Präfix mit Unicode-Grenze /v) zuerst prüfen
    /** @type {'m' | 'f' | null} */
    let gender = null;
    const prefix = text.match(/^(?:herrn?|frau)(?!\p{L})/iv);
    if (prefix) {
      gender = prefix[0].toLowerCase().startsWith('frau') ? 'f' : 'm';
      text = text.slice(prefix[0].length).trim();
    }

    // 2. Firmen-, Behörden- und Organisationsprüfung für neutrale Anrede
    // Echte Rechtsformen (GmbH, AG, SE, KG, OHG, GbR, UG, haftungsbeschränkt etc.) führen immer zur neutralen Anrede
    const hasOrgForm = /(?<!\p{L})(?:gmbh\s*&\s*co\.?\s*kg|gmbh|ag|se|kg|ohg|gbr|universit[äa]t|hochschule|verband|stiftung|beh[öo]rde|institut|verlag|haftungsbeschr[äa]nkt)(?!\p{L})/iv.test(text)
      || /(?<!\p{L})UG(?!\p{L})/v.test(text);
    if (hasOrgForm) {
      return FALLBACK[style];
    }

    // Wenn KEIN Herr/Frau-Präfix vorliegt: Auch e.V., e.K., e.G. und Keyword-Nomen (Bank, Hotel, Studio, Praxis, Verein) prüfen.
    // (Verhindert, dass "Herr Thomas Bank", "Frau Sabine Hotel" oder "Frau E. K. Meier" neutral angesprochen werden)
    if (!prefix) {
      if (/(?<!\p{L})(?:e\.\s*v\.|e\.\s*k\.|e\.\s*g\.)(?!\p{L})/iv.test(text)) {
        return FALLBACK[style];
      }
      const rawTokens = text.toLowerCase().split(/[\s,./\\-]+/).filter(Boolean);
      const hasOrgKeyword = rawTokens.some((t) => 
        COMPANY_KEYWORDS.has(t) ||
        t.endsWith('verein') ||
        t.endsWith('verband') ||
        t.endsWith('gesellschaft') ||
        t.endsWith('gemeinschaft') ||
        t.endsWith('kasse') ||
        t.endsWith('werk') ||
        t.endsWith('werke')
      );
      if (hasOrgKeyword) {
        return FALLBACK[style];
      }
    }

    // 3. "Nachname, Vorname" -> "Vorname Nachname"
    const comma = text.indexOf(',');
    if (comma > 0) text = `${text.slice(comma + 1)} ${text.slice(0, comma)}`;

    // 4. Wort-Tokenisierung & Titel-Entfernung
    // Zerlegung an Whitespace; Satzzeichen am Wortende strippen (z. B. "Dr." -> "Dr", "Müller," -> "Müller")
    // Bindestrich-Namen (Hans-Peter) bleiben dabei von Natur aus intakt.
    const nameTokens = text.trim().split(/\s+/).filter(Boolean);
    /** @type {string[]} */
    const tokens = [];

    for (const rawToken of nameTokens) {
      const cleanEnd = rawToken.replace(/^[,;:(]+|[,;:.)]+$/g, '');
      if (!cleanEnd) continue;

      // Akademische Grade mit Punkt (z. B. "Dipl.-Ing.", "M.Sc.", "B.A.", "Dr.med.", "h.c.")
      if (cleanEnd.includes('.')) {
        continue;
      }

      const lower = cleanEnd.toLowerCase();
      if (KNOWN_TITLES.has(lower)) continue;

      // Einzelne Initialen (z. B. "J." in "Hans J. Müller" oder "E." in "E. K. Meier")
      if (cleanEnd.length === 1 && (/^[A-Za-z]$/.test(cleanEnd) || rawToken.includes('.'))) {
        continue;
      }

      tokens.push(cleanEnd);
    }
    if (tokens.length === 0) return FALLBACK[style];

    // 5. Nachname inkl. Zusätze (von, van der, ...), Vorname = erstes Wort
    let i = tokens.length - 1;
    while (i > 0 && PARTICLES.has(tokens[i - 1].toLowerCase())) i--;
    const lastName = tokens.slice(i).join(' ');
    const firstName = i > 0 ? tokens[0] : '';

    // 6. Ausgabe nach Stil. Ohne Herr/Frau-Präfix bleibt das Geschlecht
    //    unbekannt — dann wird der Name genannt, aber keine Anrede geraten.
    if (style === 'casual') {
      if (firstName) return `Hallo ${firstName},`;
      if (gender) return `${SALUTATION_TONES.casual[gender === 'f' ? 'salutationFemale' : 'salutationMale']} ${lastName},`;
      return SALUTATION_TONES.casual.salutationDefault;
    }

    if (style === 'polite') {
      if (gender === 'f') return `${SALUTATION_TONES.polite.salutationFemale} ${lastName},`;
      if (gender === 'm') return `${SALUTATION_TONES.polite.salutationMale} ${lastName},`;
      if (firstName && lastName) return `Guten Tag ${firstName} ${lastName},`;
      return SALUTATION_TONES.polite.salutationDefault;
    }

    // formal
    if (gender === 'f') return `${SALUTATION_TONES.formal.salutationFemale} ${lastName},`;
    if (gender === 'm') return `${SALUTATION_TONES.formal.salutationMale} ${lastName},`;
    if (firstName && lastName) return `Guten Tag ${firstName} ${lastName},`;
    return SALUTATION_TONES.formal.salutationDefault;
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

    // Nach "Brief zurücksetzen" (main.js leert vorher die Felder) wieder befüllen.
    const resetDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('reset-dialog'));
    resetDialog?.addEventListener('close', () => {
      const confirmed = resetDialog.returnValue === 'confirm';
      queueMicrotask(() => { resetDialog.returnValue = ''; });
      if (confirmed) this.refresh();
    });

    this.#unsubDocChanged = eventBus.subscribe(Events.DOCUMENT_CHANGED, () => {
      this.#seedAuto();
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
      const isAutoAnrede = STYLES.some((s) => SalutationEngine.derive({ rawName: name, formality: s }) === anrede)
        || /** @type {string[]} */ (Object.values(FALLBACK)).includes(anrede)
        || anrede === 'Sehr geehrte Damen und Herren,'
        || anrede === 'Guten Tag,'
        || anrede === 'Hallo,';
      if (isAutoAnrede && anredeEl?.dataset.dirty !== 'true') {
        this.#auto.anrede = anrede;
        if (anredeEl) anredeEl.dataset.generated = 'true';
      }
    }
    const grussEl = document.getElementById('grussformel');
    const gruss = (grussEl?.textContent || '').trim();
    if (gruss) {
      const isAutoGruss = /** @type {string[]} */ (Object.values(CLOSINGS)).includes(gruss);
      if (isAutoGruss && grussEl?.dataset.dirty !== 'true') {
        this.#auto.grussformel = gruss;
        if (grussEl) grussEl.dataset.generated = 'true';
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
