// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {StorageManager, ImportExport}
// @adr [[ADR-JS]] {DateFormat, MetadataBridge}
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file persistence.js — Konsolidierter Speicher-, Datums-, Metadaten- und Export-Layer für DIN-BriefNEO.
 * Bündelt die bisherigen 4 Module:
 *  1. DateFormat (ehem. 47-date-format.js): DIN-Datum via Intl.DateTimeFormat & Temporal API.
 *  2. Storage (ehem. 51-storage.js): System-Konstanten, LocalStorage-Primitives & Migration.
 *  3. Metadata (ehem. 53-metadata.js): Dateinamen-Generierung, PDF-Metadaten & Drucktitel-Schutz.
 *  4. ImportExport (ehem. 52-import-export.js): JSON-Export/Import mit Metadaten-Header und Validierung.
 */

import { eventBus, Events } from './core.js';

/* =========================================================================================
 * 1. DATE & TIME FORMATTING (Temporal API & DIN 5008)
 * ========================================================================================= */

// dateStyle: 'long' = de-DE-ICU liefert "4. September 2026" (ohne führende Null, DIN 5008).
const letterDateFmt = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' });

/**
 * Formatiert das heutige Datum DIN-5008-konform ("4. September 2026", ohne führende Null).
 * @returns {string}
 */
export function formatLetterDate() {
  try {
    const zdt = Temporal.Now.zonedDateTimeISO('Europe/Berlin');
    return letterDateFmt.format(/** @type {any} */ (zdt.toPlainDate()));
  } catch (err) {
    console.warn('[DateFormat] formatLetterDate fehlgeschlagen:', err);
    return '';
  }
}

/**
 * Befüllt das Datumsfeld (#datum) des Briefes beim Laden.
 */
export function applyLetterDate() {
  const el = document.getElementById('datum');
  if (!el) return;
  const formatted = formatLetterDate();
  if (formatted) {
    el.textContent = formatted;
  }
}

/**
 * „Heute" als ISO-String (YYYY-MM-DD) in Berliner Zeit — Single Source of Truth
 * für alle maschinenlesbaren Datums-Ableitungen (z. B. PDF-Dateiname).
 * Bewusst zoned (nicht plainDateISO(), das UTC-basiert ist und nachts 00:00–02:00
 * deutscher Zeit den Vortag liefern würde).
 * @returns {string}
 */
export function currentISODate() {
  try {
    return Temporal.Now.zonedDateTimeISO('Europe/Berlin').toPlainDate().toString();
  } catch (err) {
    console.warn('[DateFormat] currentISODate fehlgeschlagen:', err);
    return '';
  }
}

/* =========================================================================================
 * 2. STORAGE PRIMITIVES, CONSTANTS & MIGRATION
 * ========================================================================================= */

/**
 * @typedef {object} DinSettings
 * @property {'auto' | 'light' | 'dark' | string} theme
 * @property {'form-a' | 'form-b' | string} layout
 * @property {boolean} guides
 * @property {boolean} [copyfit]
 * @property {'formal' | 'polite' | 'casual' | string} formality
 * @property {{ x: number, y: number, scale: number, rot: number }} [signatureState]
 */

/**
 * System- und Validierungs-Konstanten.
 */
export const Constants = {
  LIMITS: {
    HISTORY_MAX_ITEMS: 50,    // Undo/Redo Cap
    FONT_SIZE_MAX_KB: 80      // Max size für Base64-Schriftarten (< 80 KB)
  },
  SCHEMA_VERSION: 2,
  TOASTS: {
    FONT_SIZE_ERROR: '❌ Datei zu groß! (Schriftarten dürfen maximal 80 KB groß sein)',
    FONT_FORMAT_ERROR: '❌ Falsches Dateiformat! (Erlaubt: .woff2, .ttf, .otf)',
    SALUTATION_PUNCTUATION: '⚠️ Anrede sollte mit einem Komma enden (DIN 5008)',
    CLOSING_PUNCTUATION: '⚠️ Grußformel sollte ohne Komma oder Punkt enden (DIN 5008)',
    AUTOSAVE_ERROR: '❌ Fehler beim Speichern!'
  }
};

/**
 * Standard-Einstellungen für UI und Typografie.
 * @type {DinSettings}
 */
export const DEFAULT_SETTINGS = {
  theme: 'auto',
  layout: 'form-b',
  guides: true,
  copyfit: false,
  formality: 'formal'
};

/**
 * Zentrale LocalStorage-Schlüssel.
 */
export const STORAGE_KEYS = {
  draft: 'din_draft_current',
  settings: 'din_settings',
  font: 'din_custom_font',
  signatureAsset: 'din_signature_asset',
  geoapifyKey: 'din_geoapify_key',
  addresses: 'din_local_addresses',
  senderCoords: 'din_sender_coords',
  schema: 'din_schema_version'
};

/**
 * Liest einen Rohwert (String) aus dem LocalStorage.
 * @param {string} key
 * @param {string | null} [fallback]
 * @returns {string | null}
 */
export function load(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Schreibt einen Rohwert (String) in den LocalStorage.
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
export function save(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Entfernt einen Schlüssel aus dem LocalStorage.
 * @param {string} key
 * @returns {boolean}
 */
export function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Liest ein JSON-Objekt aus dem LocalStorage.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function loadJSON(key, fallback) {
  const raw = load(key);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== typeof fallback || Array.isArray(parsed) !== Array.isArray(fallback)) {
      return fallback;
    }
    if (typeof fallback === 'object' && !Array.isArray(fallback)) {
      const clean = Object.create(null);
      for (const [k, v] of Object.entries(parsed)) {
        if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
          clean[k] = v;
        }
      }
      return /** @type {T} */ ({ ...fallback, ...clean });
    }
    return /** @type {T} */ (parsed);
  } catch {
    return fallback;
  }
}

/**
 * Serialisiert und schreibt ein JSON-Objekt in den LocalStorage.
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function saveJSON(key, value) {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }
    return save(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/**
 * Führt anstehende Schema-Migrationen sequenziell und idempotent aus.
 */
export function migrateStorage() {
  const version = Number(load(STORAGE_KEYS.schema, '0')) || 0;
  if (version === Constants.SCHEMA_VERSION) return;
  save(STORAGE_KEYS.schema, String(Constants.SCHEMA_VERSION));
}

/**
 * Schlanke Fassade für bestehende Module.
 */
export const StorageManager = {
  load,
  save,
  remove,
  loadJSON,
  saveJSON,
  migrate: migrateStorage,
  /** @param {string} key @param {any} data */
  saveDraft: (key, data) => saveJSON(key === 'current' ? STORAGE_KEYS.draft : `din_draft_${key}`, data),
  /** @param {string} key @returns {any} */
  loadDraft: (key) => loadJSON(key === 'current' ? STORAGE_KEYS.draft : `din_draft_${key}`, /** @type {any} */ (null)),
  /** @param {any} settings */
  saveSettings: (settings) => saveJSON(STORAGE_KEYS.settings, settings),
  /** @returns {DinSettings} */
  loadSettings: () => loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  /** @param {string} font */
  saveCustomFont: (font) => save(STORAGE_KEYS.font, font),
  loadCustomFont: () => load(STORAGE_KEYS.font, null),
  removeCustomFont: () => remove(STORAGE_KEYS.font),
  /** @param {string} asset */
  saveSignatureAsset: (asset) => save(STORAGE_KEYS.signatureAsset, asset),
  loadSignatureAsset: () => load(STORAGE_KEYS.signatureAsset, null),
  removeSignatureAsset: () => remove(STORAGE_KEYS.signatureAsset),
  /** @param {string} key */
  saveGeoapifyKey: (key) => save(STORAGE_KEYS.geoapifyKey, key),
  loadGeoapifyKey: () => load(STORAGE_KEYS.geoapifyKey, '') || '',
  /** @returns {Array<any>} */
  loadLocalAddresses: () => loadJSON(STORAGE_KEYS.addresses, /** @type {Array<any>} */ ([])),
  /** @param {Array<any>} book */
  saveLocalAddresses: (book) => saveJSON(STORAGE_KEYS.addresses, book),
  /** @returns {{ lat: number, lon: number } | null} */
  loadSenderCoords: () => /** @type {{ lat: number, lon: number } | null} */ (loadJSON(STORAGE_KEYS.senderCoords, /** @type {any} */ (null))),
  /** @param {{ lat: number, lon: number }} coords */
  saveSenderCoords: (coords) => saveJSON(STORAGE_KEYS.senderCoords, coords)
};

/* =========================================================================================
 * 3. METADATA & DOCUMENT IDENTITY BRIDGE
 * ========================================================================================= */

/**
 * @typedef {object} LetterIdentity
 * @property {string} dateStr       ISO-Datum (zoniert, via currentISODate)
 * @property {string} lastName      Absender-Kurzform für Autor/Dateiname
 * @property {string} recipientName Empfänger (Name, sonst Firma)
 * @property {string} subjectClean  Betreff, dateisystem-sicher gekürzt
 * @property {string} fileName      Zusammengesetzter Brief-Dateiname
 */

/**
 * Liest die Identitätsfelder des Schreibens (Datum, Absender, Empfänger, Betreff)
 * zentral aus dem Live-DOM und erzeugt standardisierte Metadaten und Dateinamen.
 * @returns {LetterIdentity}
 */
export function collectLetterIdentity() {
  const dateStr = currentISODate();
  const lastName = (document.getElementById('rucksendezeile')?.textContent || '').split(/[•,]/)[0].replace(/\s/g, '') || 'Absender';
  const empfName = (document.getElementById('empfaenger-namenszeile')?.textContent || '').replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '').substring(0, 30);
  const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || '').replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '').substring(0, 30);
  const recipientName = empfName || empfFirma || 'Empfaenger';
  const rawSubject = (document.getElementById('betreff')?.textContent || 'Brief').replace(/[\x00-\x1f\r\n<>:"/\\|?*]/g, ' ').replace(/\s+/g, ' ').trim();
  const subjectClean = (rawSubject || 'Brief').substring(0, 50);
  return {
    dateStr,
    lastName,
    recipientName,
    subjectClean,
    fileName: `${dateStr} - ${subjectClean} - ${lastName} an ${recipientName}`
  };
}

/**
 * Brief-Dateiname nach dem DIN-BriefNEO-Muster — Konsument von
 * collectLetterIdentity(). Genutzt von PDF-Druck und DIN-Brief-Export (.json).
 * @returns {string}
 */
export function buildLetterFileName() {
  return collectLetterIdentity().fileName;
}

/**
 * Steuerung von document.title: Gibt dem Druck-Dateinamen Vorrang vor dem
 * Autosave-Titel des DraftManagers, während der Druckdialog geöffnet ist.
 */
let printTitleActive = false;

/**
 * Darf der Draft-Autosave den Dokumenttitel gerade setzen?
 * @returns {boolean}
 */
export function isPrintTitleActive() {
  return printTitleActive;
}

export const MetadataService = {
  prepare() {
    const rucksendezeile = document.getElementById('rucksendezeile');
    if (rucksendezeile) {
      if (!rucksendezeile.textContent || !rucksendezeile.textContent.trim()) {
        rucksendezeile.classList.add('is-empty');
      } else {
        rucksendezeile.classList.remove('is-empty');
      }
    }

    const { fileName, dateStr, lastName, recipientName, subjectClean } = collectLetterIdentity();

    const oldTitle = document.title;
    document.title = fileName;
    printTitleActive = true;

    const metaData = {
      author: lastName,
      description: `DIN 5008 Brief an ${recipientName} - ${subjectClean}`,
      keywords: `DIN-Brief, BriefNEO, ${recipientName}, ${dateStr}, Platinum`,
      title: fileName
    };

    const injectedTags = this._injectMetaTags(metaData);

    return { oldTitle, injectedTags };
  },

  /**
   * @param {{ author: string, description: string, keywords: string, title: string }} data
   * @returns {HTMLMetaElement[]}
   */
  _injectMetaTags(data) {
    /** @type {HTMLMetaElement[]} */
    const tags = [];
    const mapping = {
      'author': data.author,
      'description': data.description,
      'keywords': data.keywords,
      'application-name': 'DIN-BriefNEO Platinum V5'
    };

    Object.entries(mapping).forEach(([name, content]) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      meta.setAttribute('data-injected', 'true');
      document.head.appendChild(meta);
      tags.push(meta);
    });
    return tags;
  },

  /**
   * @param {{ oldTitle: string, injectedTags: HTMLMetaElement[] } | null} context
   */
  restore(context) {
    printTitleActive = false;
    const rucksendezeile = document.getElementById('rucksendezeile');
    if (rucksendezeile) {
      rucksendezeile.classList.remove('is-empty');
    }
    if (!context) return;
    document.title = context.oldTitle;
    if (context.injectedTags) {
      context.injectedTags.forEach(tag => tag.remove());
    }
  }
};

/* =========================================================================================
 * 4. IMPORT / EXPORT (.json First-Class Format)
 * ========================================================================================= */

/** Interner Format-Tag im Header. Dateiendung ist `.json`. */
export const DINLETTER_FORMAT = 'dinletter';

/**
 * @typedef {object} DinLetterPayload
 * @property {string} format
 * @property {number} schema_version
 * @property {string} generator
 * @property {string} timestamp
 * @property {{ layout: string, copyfit: boolean, guides: boolean, fields: Record<string, string> }} document
 * @property {{ sender?: string, theme: string, formality: string }} profile
 * @property {{ placed: boolean, transform: { x: number, y: number, scale: number, rot: number } }} signature
 * @property {string} app
 * @property {string} created
 * @property {string} tool
 * @property {Record<string, string>} draft
 * @property {Record<string, any>} [settings]
 * @property {string} [font]
 */

/**
 * @typedef {object} DinLetterParseSuccess
 * @property {true} ok
 * @property {Record<string, string>} draft
 * @property {Record<string, any>} [settings]
 * @property {string} [font]
 * @property {number} schemaVersion
 */

/**
 * @typedef {object} DinLetterParseError
 * @property {false} ok
 * @property {string} reason
 */

/**
 * @typedef {DinLetterParseSuccess | DinLetterParseError} DinLetterParseResult
 */

/**
 * Baut das Export-Payload (Schema v2 mit v1-Abwärtskompatibilität) aus einem Draft-Objekt
 * und optionalen Einstellungen / Schriften. PURE — unit-testbar.
 * @param {Record<string, string>} draft
 * @param {Record<string, any> | null} [settings]
 * @param {string | null} [font]
 * @returns {DinLetterPayload}
 */
export function buildDinLetterPayload(draft, settings = null, font = null) {
  const isoDate = currentISODate();
  let timestamp = `${isoDate}T00:00:00Z`;
  try {
    timestamp = Temporal.Now.zonedDateTimeISO('Europe/Berlin').toString();
  } catch {
    timestamp = `${isoDate}T00:00:00+01:00`;
  }

  const cleanFields = /** @type {Record<string, string>} */ (Object.create(null));
  if (draft && typeof draft === 'object') {
    for (const [k, v] of Object.entries(draft)) {
      if (typeof v === 'string') cleanFields[k] = v;
    }
  }

  const cleanSettings = /** @type {Record<string, any>} */ (Object.create(null));
  if (settings && typeof settings === 'object') {
    if (typeof settings.theme === 'string') cleanSettings.theme = settings.theme;
    if (typeof settings.layout === 'string') cleanSettings.layout = settings.layout;
    if (typeof settings.guides === 'boolean') cleanSettings.guides = settings.guides;
    if (typeof settings.copyfit === 'boolean') cleanSettings.copyfit = settings.copyfit;
    if (typeof settings.formality === 'string') cleanSettings.formality = settings.formality;
    if (settings.signatureState && typeof settings.signatureState === 'object') {
      cleanSettings.signatureState = {
        x: Number(settings.signatureState.x) || 11.9,
        y: Number(settings.signatureState.y) || 96.0,
        scale: Math.max(0.15, Math.min(4.5, Number(settings.signatureState.scale) || 0.5)),
        rot: Number(settings.signatureState.rot) || 0
      };
    }
  }

  const layout = (cleanSettings.layout === 'form-a' || cleanSettings.layout === 'form-b') ? cleanSettings.layout : 'form-b';
  const copyfit = Boolean(cleanSettings.copyfit);
  const guides = cleanSettings.guides !== undefined ? Boolean(cleanSettings.guides) : true;

  const sigPlaced = Boolean(cleanSettings.signatureState);
  const sigTransform = cleanSettings.signatureState
    ? {
        x: cleanSettings.signatureState.x,
        y: cleanSettings.signatureState.y,
        scale: cleanSettings.signatureState.scale,
        rot: cleanSettings.signatureState.rot
      }
    : { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };

  /** @type {DinLetterPayload} */
  const payload = {
    format: DINLETTER_FORMAT,
    schema_version: Constants.SCHEMA_VERSION,
    generator: 'DIN-BriefNEO',
    timestamp,
    document: {
      layout,
      copyfit,
      guides,
      fields: cleanFields
    },
    profile: {
      sender: cleanFields.absender || '',
      theme: cleanSettings.theme || 'auto',
      formality: cleanSettings.formality || 'formal'
    },
    signature: {
      placed: sigPlaced,
      transform: sigTransform
    },
    // Top-Level-Aliase für Abwärtskompatibilität und Tests:
    app: 'DIN-BriefNEO',
    created: isoDate,
    tool: 'https://github.com/grapefruit89/DIN-BriefNEO',
    draft: cleanFields
  };

  if (Object.keys(cleanSettings).length > 0) {
    payload.settings = cleanSettings;
  }

  if (typeof font === 'string' && font.length > 0) {
    payload.font = font;
  }

  return payload;
}

/**
 * Validiert und parsed eine DIN-Brief-JSON-Datei (unterstützt Schema v1 & v2 mit automatischer Migration). PURE — unit-testbar.
 * @param {string} text
 * @returns {DinLetterParseResult}
 */
export function parseDinLetterPayload(text) {
  text = text.replace(/^\uFEFF/, '');
  /** @type {any} */
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, reason: 'Keine gültige JSON-Datei.' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'Keine gültige DIN-Brief-Datei (.json, Objekt erwartet).' };
  }
  if (data.format !== DINLETTER_FORMAT) {
    return { ok: false, reason: `Falsches Format — erwartet '${DINLETTER_FORMAT}'.` };
  }
  const version = Number(data.schema_version);
  if (!Number.isInteger(version) || version < 1 || version > Constants.SCHEMA_VERSION) {
    return { ok: false, reason: `Unbekannte schema_version ${data.schema_version} — Datei neu exportieren oder Tool aktualisieren.` };
  }

  // Schema v2 hat document.fields, Schema v1 hat data.draft
  const rawFields = data.document && typeof data.document === 'object' && !Array.isArray(data.document) && data.document.fields && typeof data.document.fields === 'object' && !Array.isArray(data.document.fields)
    ? data.document.fields
    : data.draft;

  if (!rawFields || typeof rawFields !== 'object' || Array.isArray(rawFields)) {
    return { ok: false, reason: 'Kein Briefkern in der Datei.' };
  }
  const draft = /** @type {Record<string, string>} */ (Object.create(null));
  for (const [key, value] of Object.entries(rawFields)) {
    if (typeof value !== 'string') return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.` };
    if (key === 'constructor' || key === 'prototype' || key === '__proto__' || !/^[A-Za-z][\w-]*$/.test(key)) {
      return { ok: false, reason: `Ungültiger Feldname '${key}'.` };
    }
    draft[key] = value;
  }

  /** @type {Record<string, any>} */
  const cleanSettings = Object.create(null);

  // Settings aus Schema v1 oder v2 zusammenführen
  const docObj = (data.document && typeof data.document === 'object') ? data.document : null;
  const profObj = (data.profile && typeof data.profile === 'object') ? data.profile : null;
  const assetObj = (data.assets && typeof data.assets === 'object') ? data.assets : null;
  const rawSettings = (data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)) ? data.settings : null;

  if (data.settings !== undefined && data.settings !== null && (typeof data.settings !== 'object' || Array.isArray(data.settings))) {
    return { ok: false, reason: 'Ungültiges settings-Objekt in der Datei.' };
  }

  // Layout:
  const rawLayout = docObj?.layout ?? rawSettings?.layout;
  if (rawLayout !== undefined) {
    if (typeof rawLayout !== 'string' || !['form-a', 'form-b'].includes(rawLayout)) {
      return { ok: false, reason: 'Ungültiger layout-Wert in settings.' };
    }
    cleanSettings.layout = rawLayout;
  }

  // Copyfit:
  const rawCopyfit = docObj?.copyfit ?? rawSettings?.copyfit;
  if (rawCopyfit !== undefined) {
    if (typeof rawCopyfit !== 'boolean') {
      return { ok: false, reason: 'Ungültiger copyfit-Wert in settings.' };
    }
    cleanSettings.copyfit = rawCopyfit;
  }

  // Guides:
  const rawGuides = docObj?.guides ?? rawSettings?.guides;
  if (rawGuides !== undefined) {
    if (typeof rawGuides !== 'boolean') {
      return { ok: false, reason: 'Ungültiger guides-Wert in settings.' };
    }
    cleanSettings.guides = rawGuides;
  }

  // Theme:
  const rawTheme = profObj?.theme ?? rawSettings?.theme;
  if (rawTheme !== undefined) {
    if (typeof rawTheme !== 'string' || !['auto', 'light', 'dark'].includes(rawTheme)) {
      return { ok: false, reason: 'Ungültiger theme-Wert in settings.' };
    }
    cleanSettings.theme = rawTheme;
  }

  // Formality:
  const rawFormality = profObj?.formality ?? rawSettings?.formality;
  if (rawFormality !== undefined) {
    if (typeof rawFormality !== 'string' || !['formal', 'polite', 'casual'].includes(rawFormality)) {
      return { ok: false, reason: 'Ungültiger formality-Wert in settings.' };
    }
    cleanSettings.formality = rawFormality;
  }

  // Signature (CAD-Geometrie transform):
  // Discard any incoming legacy base64 image data (assets.signature.data / signatureImage).
  const rawSigTransform = (data.signature && typeof data.signature === 'object' && data.signature.transform)
    ? data.signature.transform
    : (assetObj?.signature?.transform ?? rawSettings?.signatureState);

  if (rawSigTransform !== undefined && rawSigTransform !== null) {
    if (!rawSigTransform || typeof rawSigTransform !== 'object' || Array.isArray(rawSigTransform)) {
      return { ok: false, reason: 'Ungültiges signatureState in settings.' };
    }
    if (
      typeof rawSigTransform.x !== 'number' || !Number.isFinite(rawSigTransform.x) ||
      typeof rawSigTransform.y !== 'number' || !Number.isFinite(rawSigTransform.y) ||
      typeof rawSigTransform.scale !== 'number' || !Number.isFinite(rawSigTransform.scale) ||
      typeof rawSigTransform.rot !== 'number' || !Number.isFinite(rawSigTransform.rot)
    ) {
      return { ok: false, reason: 'Ungültige Koordinaten in signatureState.' };
    }
    cleanSettings.signatureState = {
      x: rawSigTransform.x,
      y: rawSigTransform.y,
      scale: Math.max(0.15, Math.min(4.5, rawSigTransform.scale)),
      rot: rawSigTransform.rot
    };
  }

  /** @type {string | undefined} */
  let parsedFont;
  if (data.font !== undefined && data.font !== null) {
    if (typeof data.font !== 'string' || !data.font.startsWith('data:')) {
      return { ok: false, reason: 'Ungültiges Schriftart-Format (Data-URL erwartet).' };
    }
    if (data.font.length > 256 * 1024) {
      return { ok: false, reason: 'Schriftart-Datei zu groß (maximal 256 KB erlaubt).' };
    }
    parsedFont = data.font;
  }

  const hasSettings = Object.keys(cleanSettings).length > 0;
  return {
    ok: true,
    draft,
    settings: hasSettings ? cleanSettings : undefined,
    font: parsedFont,
    schemaVersion: version
  };
}

/**
 * Exportiert das DIN-Brief-Payload über die File System Access API (showSaveFilePicker)
 * oder fällt auf einen Standard-Blob-Download über ein <a>-Element zurück.
 * @param {DinLetterPayload} payload
 * @param {string} [fileName]
 * @returns {Promise<boolean>}
 */
export async function exportDocumentToFile(payload, fileName = buildLetterFileName()) {
  const jsonContent = JSON.stringify(payload, null, 2);
  const fullName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

  const savePicker = typeof window !== 'undefined' ? /** @type {any} */ (window)['showSaveFilePicker'] : null;
  if (typeof savePicker === 'function') {
    try {
      const handle = await savePicker.call(window, {
        suggestedName: fullName,
        types: [{
          description: 'DIN-Brief Dokument',
          accept: {
            'application/json': ['.json', '.dinletter']
          }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: '💾 Brief erfolgreich gespeichert.', type: 'info' });
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return false;
      }
      console.warn('[Export] File System Access API fehlgeschlagen, Fallback auf Download:', err);
    }
  }

  // Fallback: Blob-Download über temporäres <a>-Element
  try {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fullName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: '💾 Brief heruntergeladen.', type: 'info' });
    return true;
  } catch (err) {
    console.error('[Export] Download fehlgeschlagen:', err);
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: '❌ Fehler beim Exportieren.', type: 'error' });
    return false;
  }
}

/**
 * Verdrahtet Export/Import-UI (Sidebar-Buttons, Datei-Input, Confirm-Dialog, Keyboard-Shortcut).
 * @param {{ collectDraft?: () => Record<string, string> }} [options]
 */
export function initImportExport({ collectDraft } = {}) {
  const exportBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-export-dinletter'));
  const importBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-import-dinletter'));
  const importInput = /** @type {HTMLInputElement | null} */ (document.getElementById('dinletter-uploader'));
  const importDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('import-dialog'));
  const importFileName = document.getElementById('import-file-name');
  if (!exportBtn || !importBtn || !importInput || !importDialog) return;

  /**
   * @param {string} msg
   * @param {string} [type]
   */
  const notify = (msg, type = 'info') => eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: msg, type });

  const handleExport = async () => {
    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
    let draft;
    try {
      draft = typeof collectDraft === 'function' ? collectDraft() : loadJSON(STORAGE_KEYS.draft, {});
    } catch {
      draft = loadJSON(STORAGE_KEYS.draft, {});
    }
    const settings = loadJSON(STORAGE_KEYS.settings, null);
    const font = load(STORAGE_KEYS.font, null);
    const payload = buildDinLetterPayload(draft, settings, font);
    await exportDocumentToFile(payload);
  };

  exportBtn.addEventListener('click', handleExport);

  // Globaler Tastatur-Shortcut: Ctrl + S / Cmd + S triggert exportDocumentToFile
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleExport();
    }
  });

  importBtn.addEventListener('click', () => {
    importInput.value = '';
    importInput.click();
  });

  /** @type {DinLetterParseResult | null} */
  let pendingImport = null;

  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      notify('❌ Import abgelehnt: Datei zu groß (max. 1 MB).', 'error');
      return;
    }
    const result = parseDinLetterPayload(await file.text());
    if (!result.ok) {
      notify(`❌ Import abgelehnt: ${result.reason}`, 'error');
      return;
    }
    pendingImport = result;
    if (importFileName) {
      let info = file.name;
      const details = [];
      if (result.settings?.layout) {
        details.push(`Layout: ${result.settings.layout === 'form-a' ? 'Form A' : 'Form B'}`);
      }
      if (result.settings?.signatureState) {
        details.push('Signatur-Position');
      }
      if (result.font) {
        details.push('Schriftart');
      }
      if (details.length > 0) {
        info += ` (${details.join(', ')})`;
      }
      importFileName.textContent = info;
    }
    importDialog.showModal();
  });

  importDialog.addEventListener('close', () => {
    const confirmed = importDialog.returnValue === 'confirm';
    importDialog.returnValue = '';
    if (!confirmed || !pendingImport?.ok) {
      pendingImport = null;
      return;
    }
    try {
      saveJSON(STORAGE_KEYS.draft, pendingImport.draft);
      if (pendingImport.settings) {
        const currentSettings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
        saveJSON(STORAGE_KEYS.settings, { ...currentSettings, ...pendingImport.settings });
      }
      if (pendingImport.font) {
        save(STORAGE_KEYS.font, pendingImport.font);
      }
      migrateStorage();
      pendingImport = null;
      location.reload();
    } catch (e) {
      notify('❌ Import fehlgeschlagen (Storage voll?).', 'error');
    }
  });
}
