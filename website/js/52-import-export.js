// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {ImportExport}
// @guide [[din-5008-css-architektur]]

/*
 * 52-import-export.js — .json als First-Class-Datenformat (DIN-Brief)
 * Simples JSON mit Metadaten-Header (format, schema_version, created, tool)
 * und dem Draft-Payload aus din_draft_current.
 */

import { loadJSON, saveJSON, migrateStorage, STORAGE_KEYS, Constants } from './51-storage.js';
import { buildLetterFileName } from './53-metadata.js';
import { currentISODate } from './47-date-format.js';

/** Interner Format-Tag im Header. Dateiendung ist `.json`; der Tag bleibt
 *  aus Rueckwaertskompatibilitaet (bereits exportierte Dateien). */
export const DINLETTER_FORMAT = 'dinletter';

/**
 * Baut das Export-Payload aus einem Draft-Objekt. PURE — unit-testbar.
 * @param {Record<string, string>} draft
 * @returns {{ format: string, schema_version: number, app: string, created: string, tool: string, draft: Record<string, string> }}
 */
export function buildDinLetterPayload(draft) {
  return {
    format: DINLETTER_FORMAT,
    schema_version: Constants.SCHEMA_VERSION,
    app: 'DIN-BriefNEO',
    // Erstellungsdatum im ISO-Format über currentISODate() (Temporal API)
    created: currentISODate(),
    tool: 'https://github.com/grapefruit89/DIN-BriefNEO',
    draft
  };
}

/**
 * Validiert und parsed eine DIN-Brief-JSON-Datei. PURE — unit-testbar.
 * @param {string} text
 * @returns {{ ok: true, draft: Record<string, string>, schemaVersion: number } | { ok: false, reason: string }}
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
  return { ok: true, draft, schemaVersion: version };
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
    const payload = buildDinLetterPayload(draft);
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

  /** @type {{ ok: boolean, draft?: Record<string, string>, reason?: string } | null} */
  let pendingImport = null;

  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    // Größenbeschränkung: Maximal 512 KB erlauben
    if (file.size > 512 * 1024) {
      onToast('❌ Import abgelehnt: Datei zu groß (max. 512 KB).', 'error');
      return;
    }
    const result = parseDinLetterPayload(await file.text());
    if (!result.ok) {
      onToast(`❌ Import abgelehnt: ${result.reason}`, 'error');
      return;
    }
    pendingImport = result;
    if (importFileName) importFileName.textContent = file.name;
    importDialog.showModal();
  });

  importDialog.addEventListener('close', () => {
    if (importDialog.returnValue !== 'confirm' || !pendingImport?.ok) {
      pendingImport = null;
      return;
    }
    try {
      saveJSON(STORAGE_KEYS.draft, pendingImport.draft);
      migrateStorage();
      pendingImport = null;
      // Durch Seiten-Reload wird der Entwurf über den regulären Boot- und Restore-Pfad geladen
      location.reload();
    } catch (e) {
      onToast('❌ Import fehlgeschlagen (Storage voll?).', 'error');
    }
  });
}
