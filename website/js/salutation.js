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

import { Events, eventBus } from './core.js';
import { Field } from './field.js';
import { aktuelleStunde } from './format.js';
import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';
import { letterState, setMeta, unsetMeta } from './state.js';
import { applyValue } from './state-binding.js';
import { initVorschlagsliste } from './suggestion-list.js';

const STYLES = /** @type {const} */ (['formal', 'polite', 'casual']);

export const SALUTATION_TONES = Object.freeze(/** @type {const} */ ({
  formal: {
    salutationDefault: 'Sehr geehrte Damen und Herren,',
    salutationMale: 'Sehr geehrter Herr',
    salutationFemale: 'Sehr geehrte Frau',
    closing: 'Mit freundlichen Grüßen',
    /* Drei Grussformeln je Tonalitaet (Vorgabe 2026-11-22, 3x3). Die erste
       ist die automatische; alle drei stehen im Dropdown am Grußfeld. */
    closings: ['Mit freundlichen Grüßen', 'Mit freundlichem Gruß', 'Freundliche Grüße']
  },
  polite: {
    salutationDefault: 'Guten Tag,',
    salutationMale: 'Guten Tag Herr',
    salutationFemale: 'Guten Tag Frau',
    closing: 'Freundliche Grüße',
    closings: ['Freundliche Grüße', 'Beste Grüße', 'Viele Grüße']
  },
  casual: {
    salutationDefault: 'Hallo,',
    salutationMale: 'Hallo Herr',
    salutationFemale: 'Hallo Frau',
    closing: 'Beste Grüße',
    closings: ['Beste Grüße', 'Viele Grüße', 'Herzliche Grüße']
  }
}));

/**
 * Grussformel nach Tageszeit. Reine Funktion (Stunde wird uebergeben) und
 * damit ohne Uhr testbar.
 *   5–10 Uhr  -> "Guten Morgen"
 *   11–17 Uhr -> "Guten Tag"
 *   18–4 Uhr  -> "Guten Abend"
 * @param {number} stunde 0–23
 * @returns {'Guten Morgen' | 'Guten Tag' | 'Guten Abend'}
 */
export function tageszeitGruss(stunde) {
  if (!Number.isFinite(stunde)) return 'Guten Tag';
  if (stunde >= 5 && stunde < 11) return 'Guten Morgen';
  if (stunde >= 18 || stunde < 5) return 'Guten Abend';
  return 'Guten Tag';
}

/**
 * Alle Anrede-Varianten zum aktuellen Empfaenger, fuer die Auswahl am Feld.
 *
 * Linguistischer Hintergrund: die Toene bilden die **T-V-Unterscheidung**
 * (Distanz vs. Vertrautheit; im Deutschen Siezen/Duzen plus Titel) und das
 * **Register** des Schreibens ab — deshalb drei Stufen statt beliebig vieler
 * Formulierungen. Die Farben der drei Gruppen stehen in `sidebar.css`
 * (ordinale Skala: Blau = distanziert, Rot = vertraut).
 *
 * Mit Empfaengernamen NUR die Formen mit Namen (die allgemeinen waeren hier
 * falsch), dazu je Stil eine Variante mit anderem Tonfall (sehr verehrt /
 * liebe(r)). Ist nur eine FIRMA bekannt, kommen Team-Formen. Ohne beides nur
 * die allgemeinen Formen. Doppelte werden entfernt. Liegt eine Uhrzeit vor
 * (`stunde`), bietet der hoefliche Ton zusaetzlich die Tageszeit-Grussform an
 * (Uhr zoniert aus `format.js`, A48/A50).
 *
 * Bewusst nicht enthalten: regionale Formen (Moin/Servus), Gendern und
 * Mehrpersonen-Anreden — 80/20-Entscheidung vom 2026-11-22.
 *
 * @param {string} rawName Ansprechpartner (darf leer sein)
 * @param {string} [rawFirma] Firma/Behoerde, wenn kein Ansprechpartner bekannt ist
 * @param {number | null} [stunde] aktuelle Stunde 0-23; null = neutral
 * @returns {Array<{ anrede: string, style: 'formal'|'polite'|'casual', ton: string }>}
 */
export function salutationVarianten(rawName, rawFirma = '', stunde = null) {
  const name = String(rawName || '').trim();
  const firma = String(rawFirma || '').trim();
  /** @type {Array<{ anrede: string, style: 'formal'|'polite'|'casual', ton: string }>} */
  const out = [];
  const gesehen = new Set();
  /** @param {string} anrede @param {'formal'|'polite'|'casual'} style */
  /** Vergleich ohne Satzzeichen/Gross-Klein: "Guten Tag Frau X," und
   *  "Guten Tag, Frau X," sind fuer den Leser dieselbe Anrede. */
  /** @param {string} text @returns {string} */
  const schluessel = (text) => text.toLowerCase().replace(/[^a-zäöüß ]/g, '').replace(/\s+/g, ' ').trim();
  /** @param {string} anrede @param {'formal'|'polite'|'casual'} style */
  const dazu = (anrede, style) => {
    const text = String(anrede || '').trim();
    const k = schluessel(text);
    if (!text || gesehen.has(k)) return;
    gesehen.add(k);
    out.push({ anrede: text, style, ton: style });
  };
  for (const style of STYLES) {
    if (!name && firma) {
      /* Team-Formen: die Person fehlt, die Organisation ist bekannt. */
      if (style === 'formal') {
        dazu('Sehr geehrte Damen und Herren,', style);
        dazu(`Sehr geehrtes Team der ${firma},`, style);
      } else if (style === 'polite') {
        dazu('Guten Tag,', style);
        dazu('Guten Tag zusammen,', style);
      } else {
        dazu('Hallo zusammen,', style);
      }
      continue;
    }
    if (!name) {
      /* Ohne Empfaengernamen sind die allgemeinen Formen die einzigen, die
         stimmen koennen. DIN 5008 (20.9.4) zeigt fuer den hoeflichen Ton
         zusaetzlich "Guten Tag, geschaetzte Damen und Herren,". */
      dazu(SALUTATION_TONES[style].salutationDefault, style);
      if (style === 'polite') dazu('Guten Tag, geschätzte Damen und Herren,', style);
      continue;
    }
    const basis = deriveSalutation(name, style);
    dazu(basis, style);
    /* Hoeflicher Ton: zusaetzlich die Grussform der aktuellen Tageszeit
       (Vorgabe 2026-11-22; Uhr kommt zoneiert aus format.js, A48/A50). */
    if (style === 'polite' && basis.startsWith('Guten Tag') && Number.isFinite(stunde)) {
      const gruss = tageszeitGruss(/** @type {number} */ (stunde));
      if (gruss !== 'Guten Tag') dazu(basis.replace('Guten Tag', gruss), style);
    }
    /* Erweiterungen, die dieselbe Stil-Gruppe (und damit denselben Gruss)
       behalten: foermlicher bzw. persoenlicher als die Standardform. */
    if (style === 'formal') {
      if (basis.startsWith('Sehr geehrte')) dazu(basis.replace('Sehr geehrte', 'Sehr verehrte'), style);
      if (basis.startsWith('Sehr geehrter')) dazu(basis.replace('Sehr geehrter', 'Sehr verehrter'), style);
    }
    if (style === 'casual') {
      if (basis.startsWith('Hallo Frau')) dazu(basis.replace('Hallo Frau', 'Liebe Frau'), style);
      else if (basis.startsWith('Hallo Herr')) dazu(basis.replace('Hallo Herr', 'Lieber Herr'), style);
      /* Sonst NICHT ersetzen: "Hallo," wurde frueher zu "Liebe," (grammatisch
         falsch, gemeldet 2026-11-22 indirekt ueber die Firmen-Varianten). */
    }
  }
  return out;
}

const CLOSINGS = Object.freeze({
  formal: SALUTATION_TONES.formal.closing,
  polite: SALUTATION_TONES.polite.closing,
  casual: SALUTATION_TONES.casual.closing
});

/** Alle angebotenen Grussformeln (3 je Ton) - fuer #seedAuto. */
/** @type {Set<string>} */
const ALLE_GRUESSE = new Set(
  Object.values(SALUTATION_TONES).flatMap((ton) => [...ton.closings])
);

const FALLBACK = Object.freeze({
  formal: SALUTATION_TONES.formal.salutationDefault,
  polite: SALUTATION_TONES.polite.salutationDefault,
  casual: SALUTATION_TONES.casual.salutationDefault
});

const FALLBACK_SET = new Set(Object.values(FALLBACK));

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

  /** @type {{ zerstoeren: () => void } | null} */
  #liste = null;

  /** @type {{ zerstoeren: () => void } | null} */
  #gruesse = null;

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
      // Tippt der Nutzer etwas Eigenes, ist es kein Auto-Text mehr.
      el.addEventListener('input', () => {
        const text = Field.getValue(el).trim();
        if (text && text !== this.#auto[kind]) {
          setMeta(letterState, kind, { userSet: true });
        } else {
          unsetMeta(letterState, kind, 'userSet');
        }
      });
    }

    this.#initVarianten();
    this.#initGruesse();

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

  /**
   * Auswahl der Anrede direkt am Feld auf dem Blatt. Bedienung (Klick,
   * Pfeile, Enter, Escape, Tippen) kommt aus `initVorschlagsliste` — hier
   * steht nur, WAS angeboten wird und was beim Klick passiert.
   */
  #initVarianten() {
    this.#liste = initVorschlagsliste({
      feld: 'anrede',
      popover: 'anrede-vorschlaege',
      /* Varianten haengen nur am Empfaengernamen; beim Tippen im Anrede-Feld
         bleibt die Liste stehen (kein Flackern, 2026-11-22). */
      statisch: true,
      hole: () =>
        salutationVarianten(this.#nameFeldText(), this.#firmaText(), aktuelleStunde()).map((v) => ({
          text: v.anrede,
          gruppe: v.ton,
          wert: v
        })),
      beiWahl: (/** @type {any} */ v) => this.#uebernehme(v.wert)
    });
  }

  /**
   * Grußfeld als Auswahl: die drei Grußformeln der aktuellen Tonalitaet
   * (Vorgabe 2026-11-22: 3x3). Eine Wahl markiert das Feld als Nutzertext,
   * damit die Automatik es danach stehen laesst.
   */
  #initGruesse() {
    this.#gruesse = initVorschlagsliste({
      feld: 'grussformel',
      popover: 'gruss-vorschlaege',
      /* Die Liste haengt nur an der Tonalitaet, nicht am Tippen. */
      statisch: true,
      hole: () => {
        const ton = toStyle(this.settings.formality);
        return SALUTATION_TONES[ton].closings.map((text) => ({ text, gruppe: ton, wert: text }));
      },
      beiWahl: (/** @type {any} */ v) => {
        applyValue('grussformel', v.text, 'logic');
        setMeta(letterState, 'grussformel', { userSet: true });
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
      }
    });
  }

  /**
   * Uebernimmt eine Variante: Stil zuerst (zieht den Gruß nach), dann die
   * Anrede — und markiert sie als Nutzerwahl, damit die Automatik sie stehen
   * laesst.
   * @param {{ anrede: string, style: 'formal'|'polite'|'casual' }} v
   */
  #uebernehme(v) {
    this.#setStyle(v.style);
    applyValue('anrede', v.anrede, 'logic');
    setMeta(letterState, 'anrede', { userSet: true });
    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
  }

  destroy() {
    if (this.#unsubDocChanged) {
      this.#unsubDocChanged();
      this.#unsubDocChanged = null;
    }
    if (this.#liste) {
      this.#liste.zerstoeren();
      this.#liste = null;
    }
    if (this.#gruesse) {
      this.#gruesse.zerstoeren();
      this.#gruesse = null;
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
    const anrede = Field.getValue(anredeEl).trim();
    if (anrede) {
      const isAutoAnrede = FALLBACK_SET.has(/** @type {any} */ (anrede))
        || STYLES.some((s) => SalutationEngine.derive({ rawName: name, formality: s }) === anrede);
      if (isAutoAnrede && anredeEl) {
        unsetMeta(letterState, 'anrede', 'userSet');
        this.#auto.anrede = anrede;
      }
    }
    const grussEl = document.getElementById('grussformel');
    const gruss = Field.getValue(grussEl).trim();
    if (gruss) {
      const isAutoGruss = ALLE_GRUESSE.has(gruss);
      if (isAutoGruss && grussEl) {
        unsetMeta(letterState, 'grussformel', 'userSet');
        this.#auto.grussformel = gruss;
      }
    }
  }

  /** Nur der Ansprechpartner (ohne Firmen-Rueckfall). @returns {string} */
  #nameFeldText() {
    return Field.getValue(document.getElementById('empfaenger-name')).trim();
  }

  /** Firma/Behoerde der Anschrift. @returns {string} */
  #firmaText() {
    return Field.getValue(document.getElementById('empfaenger-firma')).trim();
  }

  #nameText() {
    /* Field.getValue, nicht textContent: die Anschriftfelder sind seit
      2026-11-12 native <input>, dort ist textContent immer leer. Die
      automatische Anrede fiel dadurch still auf die neutrale Form zurueck
      (B5-Review 2026-11-12). */
    const name = Field.getValue(document.getElementById('empfaenger-name')).trim();
    if (name) return name;
    return Field.getValue(document.getElementById('empfaenger-firma')).trim();
  }

  /**
   * Schreibt den Auto-Text, außer der Nutzer hat das Feld selbst befüllt.
   * @param {'anrede' | 'grussformel'} kind
   * @param {boolean} [onlyIfEmpty]
   */
  #update(kind, onlyIfEmpty = false) {
    const el = document.getElementById(kind);
    if (!el || document.activeElement === el) return;

    const current = Field.getValue(el).trim();
    if (!current) {
      unsetMeta(letterState, kind, 'userSet');
    }
    // Nutzer-Text respektieren: wenn explizit vom Nutzer manuell editiert
    if (letterState.meta[kind]?.userSet === true && current) return;
    if (current && onlyIfEmpty) return;

    const style = this.settings.formality;
    const value = kind === 'anrede'
      ? SalutationEngine.derive({ rawName: this.#nameText(), formality: style })
      : SalutationEngine.getClosing(style);

    this.#auto[kind] = value;
    if (value === current) {
      return;
    }
    applyValue(kind, value, 'logic');
    unsetMeta(letterState, kind, 'userSet');
    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
  }
}
