// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {ImportExport}
// @guide [[chrome-modern-css]]

/*
 * 52-import-export.js — .dinletter als First-Class-Datenformat
 * (DeepSeek-Longevity-Review 2026-09-11, Owner-Beschluss).
 * localStorage allein ist ein Ablaufdatum (Browser-Daten löschen = Brief weg).
 * Das Format ist bewusst simpel und selbst-erklärend: JSON mit Metadaten-Header
 * (format, schema_version, created, tool-Link) + dem Draft-Payload 1:1 aus
 * din_draft_current. Kein Kompression, keine Obskurität — der Brief soll auch
 * in 10 Jahren ohne dieses Tool lesbar sein.
 */

import { StorageManager, Constants } from './51-storage.js';
import { buildLetterFileName } from './53-metadata.js';
import { currentISODate } from './47-date-format.js';

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
    /* 🚨 ARCHITECTURAL GUARD (A48/A50): created NICHT mit new Date()/Date.now()
     * bauen — Temporal-only, Zeitzone explizit über currentISODate()
     * (47-date-format.js). Ein Date()-Rückfall wurde hier bereits fast
     * gebaut (2026-09-11) — der Law Catalog ist bindend, keine Ausnahme. */
    created: currentISODate(),
    tool: 'https://github.com/grapefruit89/DIN-BriefNEO',
    draft
  };
}

/**
 * Validiert und parsed einen .dinletter-Text. PURE — unit-testbar.
 * @param {string} text
 * @returns {{ ok: true, draft: Record<string, string>, schemaVersion: number } | { ok: false, reason: string }}
 */
export function parseDinLetterPayload(text) {
  /** @type {any} */
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, reason: 'Keine gültige JSON-Datei.' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'Kein gültiges .dinletter (Objekt erwartet).' };
  }
  if (data.format !== DINLETTER_FORMAT) {
    return { ok: false, reason: `Falsches Format — erwartet '${DINLETTER_FORMAT}'.` };
  }
  const version = Number(data.schema_version);
  if (!Number.isInteger(version) || version < 1 || version > Constants.SCHEMA_VERSION) {
    return { ok: false, reason: `Unbekannte schema_version ${data.schema_version} — Datei neu exportieren oder Tool aktualisieren.` };
  }
  if (!data.draft || typeof data.draft !== 'object' || Array.isArray(data.draft)) {
    return { ok: false, reason: 'Kein Briefinhalt in der Datei.' };
  }
  /** @type {Record<string, string>} */
  const draft = {};
  for (const [key, value] of Object.entries(data.draft)) {
    if (typeof value !== 'string') return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.` };
    draft[key] = value;
  }
  return { ok: true, draft, schemaVersion: version };
}

/**
 * Verdrahtet Export/Import-UI (Sidebar-Buttons, Datei-Input, Confirm-Dialog).
 * @param {{ onSaveDraft: () => void, onToast: (msg: string, type?: string) => void }} params
 */
export function initImportExport({ onSaveDraft, onToast }) {
  const exportBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-export-dinletter'));
  const importBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-import-dinletter'));
  const importInput = /** @type {HTMLInputElement | null} */ (document.getElementById('dinletter-uploader'));
  const importDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('import-dialog'));
  const importFileName = document.getElementById('import-file-name');
  if (!exportBtn || !importBtn || !importInput || !importDialog) return;

  exportBtn.addEventListener('click', () => {
    // Erst den LIVEDRAFT in den Storage schreiben, dann exportieren —
    // sonst exportiert man den letzten Autosave-Stand, nicht den aktuellen.
    onSaveDraft();
    let draft;
    try {
      draft = JSON.parse(localStorage.getItem('din_draft_current') || '{}');
    } catch (e) {
      onToast('❌ Export fehlgeschlagen: lokaler Draft nicht lesbar.', 'error');
      return;
    }
    const payload = buildDinLetterPayload(draft);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${buildLetterFileName()}.dinletter`;
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
      localStorage.setItem('din_draft_current', JSON.stringify(pendingImport.draft));
      StorageManager.migrate();
      pendingImport = null;
      onToast('✅ Brief importiert — Seite lädt neu.', 'info');
      // Reload über den Boot-Pfad: EIN Restore-Owner (DraftManager), kein
      // zweiter Import-Restore-Code (C1-Lektion: niemals HTML hier einsetzen).
      location.reload();
    } catch (e) {
      onToast('❌ Import fehlgeschlagen (Storage voll?).', 'error');
    }
  });
}
