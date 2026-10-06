// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {ImportExport}
// @guide [[din-5008-css-architektur]]

/*
 * 52-import-export.js — .json als First-Class-Datenformat (DIN-Brief)
 * Simples JSON mit Metadaten-Header (format, schema_version, created, tool),
 * dem Draft-Payload aus din_draft_current sowie optionalen Projekteinstellungen (din_settings, font).
 */

import { load, save, loadJSON, saveJSON, migrateStorage, STORAGE_KEYS, DEFAULT_SETTINGS, Constants } from './51-storage.js';
import { buildLetterFileName } from './53-metadata.js';
import { currentISODate } from './47-date-format.js';

/** Interner Format-Tag im Header. Dateiendung ist `.json`; der Tag bleibt
 *  aus Rueckwaertskompatibilitaet (bereits exportierte Dateien). */
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
    // Erstellungsdatum im ISO-Format über currentISODate() (Temporal API)
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
  // BOM entfernen, falls vorhanden (\uFEFF)
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
  // Prototyp-Pollution verhindern: Null-Prototyp-Objekt und Validierung der Feldnamen
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
 * @param {{ onSaveDraft: () => boolean, onToast: (msg: string, type?: string) => void }} params
 */
export function initImportExport({ onSaveDraft, onToast }) {
  const exportBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-export-dinletter'));
  const importBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-import-dinletter'));
  const importInput = /** @type {HTMLInputElement | null} */ (document.getElementById('dinletter-uploader'));
  const importDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('import-dialog'));
  const importFileName = document.getElementById('import-file-name');
  if (!exportBtn || !importBtn || !importInput || !importDialog) return;

  exportBtn.addEventListener('click', () => {
    // Vor dem Export aktuellen Stand speichern; bei Misserfolg abbrechen
    if (!onSaveDraft()) {
      onToast('❌ Export abgebrochen: Speichern fehlgeschlagen (Storage?).', 'error');
      return;
    }
    let draft;
    try {
      draft = loadJSON(STORAGE_KEYS.draft, {});
    } catch (e) {
      onToast('❌ Export fehlgeschlagen: lokaler Draft nicht lesbar.', 'error');
      return;
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
    // Größenbeschränkung: Maximal 1 MB erlauben (Text + Signaturbild + Schriftart)
    if (file.size > 1024 * 1024) {
      onToast('❌ Import abgelehnt: Datei zu groß (max. 1 MB).', 'error');
      return;
    }
    const result = parseDinLetterPayload(await file.text());
    if (!result.ok) {
      onToast(`❌ Import abgelehnt: ${result.reason}`, 'error');
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
    if (importDialog.returnValue !== 'confirm' || !pendingImport?.ok) {
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
      // Durch Seiten-Reload wird der Entwurf über den regulären Boot- und Restore-Pfad geladen
      location.reload();
    } catch (e) {
      onToast('❌ Import fehlgeschlagen (Storage voll?).', 'error');
    }
  });
}
