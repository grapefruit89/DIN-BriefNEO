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
 * @property {'formal' | 'polite' | 'casual' | string} formality
 */

/**
 * System- und Validierungs-Konstanten.
 */
export const Constants = {
  LIMITS: {
    HISTORY_MAX_ITEMS: 50,    // Undo/Redo Cap
    FONT_SIZE_MAX_KB: 60      // Max size für Base64-Schriftarten (LocalStorage Limitierung)
  },
  SCHEMA_VERSION: 1,
  TOASTS: {
    FONT_SIZE_ERROR: '❌ Datei zu groß! (Schriftarten dürfen maximal 60 KB groß sein)',
    FONT_FORMAT_ERROR: '❌ Falsches Dateiformat! (Nur .woff2 Dateien erlaubt)',
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
  formality: 'formal'
};

/**
 * Zentrale LocalStorage-Schlüssel.
 */
export const STORAGE_KEYS = {
  draft: 'din_draft_current',
  settings: 'din_settings',
  font: 'din_custom_font',
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
 * Baut das Export-Payload aus einem Draft-Objekt und optionalen Einstellungen / Schriften. PURE — unit-testbar.
 * @param {Record<string, string>} draft
 * @param {Record<string, any> | null} [settings]
 * @param {string | null} [font]
 * @returns {DinLetterPayload}
 */
export function buildDinLetterPayload(draft, settings = null, font = null) {
  /** @type {DinLetterPayload} */
  const payload = {
    format: DINLETTER_FORMAT,
    schema_version: Constants.SCHEMA_VERSION,
    app: 'DIN-BriefNEO',
    created: currentISODate(),
    tool: 'https://github.com/grapefruit89/DIN-BriefNEO',
    draft
  };

  if (settings && typeof settings === 'object') {
    const cleanSettings = /** @type {Record<string, any>} */ (Object.create(null));
    if (typeof settings.theme === 'string') cleanSettings.theme = settings.theme;
    if (typeof settings.layout === 'string') cleanSettings.layout = settings.layout;
    if (typeof settings.guides === 'boolean') cleanSettings.guides = settings.guides;
    if (typeof settings.formality === 'string') cleanSettings.formality = settings.formality;
    if (typeof settings.signatureImage === 'string') cleanSettings.signatureImage = settings.signatureImage;
    if (settings.signatureState && typeof settings.signatureState === 'object') {
      cleanSettings.signatureState = {
        x: Number(settings.signatureState.x) || 0,
        y: Number(settings.signatureState.y) || 0,
        scale: Number(settings.signatureState.scale) || 1,
        rot: Number(settings.signatureState.rot) || 0
      };
    }
    if (Object.keys(cleanSettings).length > 0) {
      payload.settings = cleanSettings;
    }
  }

  if (typeof font === 'string' && font.length > 0) {
    payload.font = font;
  }

  return payload;
}

/**
 * Validiert und parsed eine DIN-Brief-JSON-Datei. PURE — unit-testbar.
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
  if (!data.draft || typeof data.draft !== 'object' || Array.isArray(data.draft)) {
    return { ok: false, reason: 'Kein Briefkern in der Datei.' };
  }
  const draft = /** @type {Record<string, string>} */ (Object.create(null));
  for (const [key, value] of Object.entries(data.draft)) {
    if (typeof value !== 'string') return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.` };
    if (key === 'constructor' || key === 'prototype' || key === '__proto__' || !/^[A-Za-z][\w-]*$/.test(key)) {
      return { ok: false, reason: `Ungültiger Feldname '${key}'.` };
    }
    draft[key] = value;
  }

  /** @type {Record<string, any> | undefined} */
  let parsedSettings;
  if (data.settings !== undefined && data.settings !== null) {
    if (typeof data.settings !== 'object' || Array.isArray(data.settings)) {
      return { ok: false, reason: 'Ungültiges settings-Objekt in der Datei.' };
    }
    const clean = /** @type {Record<string, any>} */ (Object.create(null));
    if (data.settings.theme !== undefined) {
      if (typeof data.settings.theme !== 'string' || !['auto', 'light', 'dark'].includes(data.settings.theme)) {
        return { ok: false, reason: 'Ungültiger theme-Wert in settings.' };
      }
      clean.theme = data.settings.theme;
    }
    if (data.settings.layout !== undefined) {
      if (typeof data.settings.layout !== 'string' || !['form-a', 'form-b'].includes(data.settings.layout)) {
        return { ok: false, reason: 'Ungültiger layout-Wert in settings.' };
      }
      clean.layout = data.settings.layout;
    }
    if (data.settings.guides !== undefined) {
      if (typeof data.settings.guides !== 'boolean') {
        return { ok: false, reason: 'Ungültiger guides-Wert in settings.' };
      }
      clean.guides = data.settings.guides;
    }
    if (data.settings.formality !== undefined) {
      if (typeof data.settings.formality !== 'string' || !['formal', 'polite', 'casual'].includes(data.settings.formality)) {
        return { ok: false, reason: 'Ungültiger formality-Wert in settings.' };
      }
      clean.formality = data.settings.formality;
    }
    if (data.settings.signatureImage !== undefined) {
      if (typeof data.settings.signatureImage !== 'string' || !data.settings.signatureImage.startsWith('data:image/')) {
        return { ok: false, reason: 'Ungültiges Signaturbild in settings (muss ein Bild-Data-URL sein).' };
      }
      if (data.settings.signatureImage.length > 1024 * 1024) {
        return { ok: false, reason: 'Signaturbild zu groß (maximal 1 MB erlaubt).' };
      }
      clean.signatureImage = data.settings.signatureImage;
    }
    if (data.settings.signatureState !== undefined) {
      const state = data.settings.signatureState;
      if (!state || typeof state !== 'object' || Array.isArray(state)) {
        return { ok: false, reason: 'Ungültiges signatureState in settings.' };
      }
      if (
        typeof state.x !== 'number' || !Number.isFinite(state.x) ||
        typeof state.y !== 'number' || !Number.isFinite(state.y) ||
        typeof state.scale !== 'number' || !Number.isFinite(state.scale) ||
        typeof state.rot !== 'number' || !Number.isFinite(state.rot)
      ) {
        return { ok: false, reason: 'Ungültige Koordinaten in signatureState.' };
      }
      clean.signatureState = {
        x: state.x,
        y: state.y,
        scale: Math.max(0.1, Math.min(5, state.scale)),
        rot: state.rot
      };
    }
    parsedSettings = clean;
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

  return {
    ok: true,
    draft,
    settings: parsedSettings,
    font: parsedFont,
    schemaVersion: version
  };
}

/**
 * Verdrahtet Export/Import-UI (Sidebar-Buttons, Datei-Input, Confirm-Dialog).
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

  exportBtn.addEventListener('click', () => {
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${buildLetterFileName()}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
      if (result.settings?.signatureImage) {
        details.push('Signatur');
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
