// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {LocalStoragePrimitives, ImportExport}
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

import { Constants, Events, eventBus } from './core.js';

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
  // Ein selbst eingetragenes Datum gewinnt: sonst ueberschreibt jeder Aufruf
  // die Eingabe, und sie waere nach dem Reload verloren (Befund 1.2).
  const manuallySet = el.dataset.dirty === 'true' && (el.textContent || '').trim() !== '';
  if (manuallySet) return;
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
 * @property {boolean} [marks]
 * @property {boolean} [copyfit]
 * @property {'formal' | 'polite' | 'casual' | string} formality
 * @property {{ x: number, y: number, scale: number, rot: number }} [signatureState]
 */

/**
 * Standard-Einstellungen für UI und Typografie.
 * @type {DinSettings}
 */
export const DEFAULT_SETTINGS = {
  theme: 'auto',
  layout: 'form-b',
  guides: false,
  marks: true,
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
      navigator.storage.persist().catch(err => console.debug('[Storage]', err));
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
  const lastName = (document.getElementById('rucksendeangabe')?.textContent || '').split(/[•,]/)[0].replace(/\s/g, '') || 'Absender';
  const empfName = (document.getElementById('empfaenger-name')?.textContent || '').replace(/[^\p{L}\p{N}]/gv, '').substring(0, 30);
  const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || '').replace(/[^\p{L}\p{N}]/gv, '').substring(0, 30);
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
    if (!context) return;
    document.title = context.oldTitle;
    if (context.injectedTags) {
      for (const tag of context.injectedTags) {
        tag.remove();
      }
    }
  }
};

/* =========================================================================================
 * 4. IMPORT / EXPORT (.json First-Class Format)
 * ========================================================================================= */

/** Interner Format-Tag im Header. Dateiendung ist `.json`. */
export const DINLETTER_FORMAT = 'dinletter';

/**
 * @typedef {object} DinLetterLayout
 * @property {'form-a' | 'form-b'} form
 * @property {boolean} guides
 * @property {boolean} copyfit
 * @property {boolean} marks
 */

/**
 * @typedef {object} DinLetterSignatureTransform
 * @property {number} x
 * @property {number} y
 * @property {number} scale
 * @property {number} rot
 */

/**
 * @typedef {object} DinLetterPayload
 * @property {string} format
 * @property {number} schema_version
 * @property {string} generator
 * @property {string} generated_at
 * @property {DinLetterLayout} layout
 * @property {Record<string, string | boolean>} fields
 * @property {{ transform: DinLetterSignatureTransform }} signature
 */

/**
 * @typedef {object} DinLetterParseSuccess
 * @property {true} ok
 * @property {Record<string, string | boolean>} fields
 * @property {Partial<DinLetterLayout>} [layout]
 * @property {{ transform: DinLetterSignatureTransform }} [signature]
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
 * Baut das Export-Payload (Schema v3) aus einem Draft-Objekt und den Einstellungen.
 * Nichtbinäre Anteile (Signaturbild, eigene Schrift) sind bewusst nicht enthalten —
 * sie gehören in den separaten Container. PURE — unit-testbar.
 * @param {Record<string, string | boolean>} draft
 * @param {Record<string, any> | null} [settings]
 * @returns {DinLetterPayload}
 */
export function buildDinLetterPayload(draft, settings = null) {
  /** @type {string} */
  let generatedAt;
  try {
    generatedAt = Temporal.Now.zonedDateTimeISO('Europe/Berlin').toString();
  } catch {
    generatedAt = `${currentISODate()}T00:00:00+01:00`;
  }

  const cleanFields = /** @type {Record<string, string | boolean>} */ (Object.create(null));
  if (draft && typeof draft === 'object') {
    for (const [k, v] of Object.entries(draft)) {
      if (typeof v === 'string') cleanFields[k] = v;
      else if (typeof v === 'boolean' && k.startsWith('toggle-')) cleanFields[k] = v;
    }
  }

  // Toggle-Zustaende sind im JSON Boolean — auch wenn sie als String hereinkommen.
  // `vermerke-visible` ist kein Feld mehr: die Sichtbarkeit folgt aus `vermerke`.
  delete cleanFields['vermerke-visible'];
  for (const key of ['toggle-anlagen', 'toggle-fuss']) {
    if (key in cleanFields) {
      const value = cleanFields[key];
      cleanFields[key] = value === true || value === 'true';
    }
  }

  const s = (settings && typeof settings === 'object') ? settings : {};
  const sig = s.signatureState;
  const transform = (sig && typeof sig === 'object')
    ? {
        x: Number(sig.x) || 11.9,
        y: Number(sig.y) || 96.0,
        scale: Math.max(0.15, Math.min(4.5, Number(sig.scale) || 0.5)),
        rot: Number(sig.rot) || 0
      }
    : { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };

  return {
    format: DINLETTER_FORMAT,
    schema_version: Constants.SCHEMA_VERSION,
    generator: 'DIN-BriefNEO',
    generated_at: generatedAt,
    layout: {
      form: (s.layout === 'form-a' || s.layout === 'form-b') ? s.layout : 'form-b',
      guides: typeof s.guides === 'boolean' ? s.guides : false,
      copyfit: typeof s.copyfit === 'boolean' ? s.copyfit : false,
      marks: typeof s.marks === 'boolean' ? s.marks : true
    },
    fields: cleanFields,
    signature: { transform }
  };
}

/**
 * Validiert und parsed eine DIN-Brief-JSON-Datei (Schema v3). Ältere Versionen werden
 * abgelehnt — das Dateiformat ist nicht migrationspflichtig (der LocalStorage-Zustand
 * wird separat über `migrateStorage` behandelt). PURE — unit-testbar.
 * @param {string} text
 * @returns {DinLetterParseResult}
 */
export function parseDinLetterPayload(text) {
  text = text.replace(/^\uFEFF/, '');
  /** @type {any} */
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'Keine gültige JSON-Datei.' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'Keine gültige DIN-Brief-Datei (.json, Objekt erwartet).' };
  }
  if (data.format !== DINLETTER_FORMAT) {
    return { ok: false, reason: `Falsches Format — erwartet '${DINLETTER_FORMAT}'.` };
  }
  const version = Number(data.schema_version);
  if (!Number.isInteger(version) || version !== Constants.SCHEMA_VERSION) {
    return { ok: false, reason: `Schema v${data.schema_version} wird nicht mehr unterstützt — Datei bitte mit der aktuellen Version neu exportieren.` };
  }

  const rawFields = data.fields;
  if (!rawFields || typeof rawFields !== 'object' || Array.isArray(rawFields)) {
    return { ok: false, reason: 'Kein Briefkern in der Datei (fields fehlt).' };
  }

  const fields = /** @type {Record<string, string | boolean>} */ (Object.create(null));
  for (const [key, value] of Object.entries(rawFields)) {
    // v2-Rest: Sichtbarkeit ist aus `vermerke` ableitbar und kein Feld mehr.
    if (key === 'vermerke-visible') continue;
    const istToggle = key.startsWith('toggle-');
    if (typeof value !== 'string' && typeof value !== 'boolean') return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.` };
    if (typeof value === 'boolean' && !istToggle) return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.` };
    if (key === 'constructor' || key === 'prototype' || key === '__proto__' || !/^[A-Za-z][\w-]*$/.test(key)) {
      return { ok: false, reason: `Ungültiger Feldname '${key}'.` };
    }
    fields[key] = istToggle ? (value === true || value === 'true') : value;
  }

  /** @type {Partial<DinLetterLayout>} */
  const layout = Object.create(null);
  if (data.layout !== undefined) {
    const raw = data.layout;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ok: false, reason: 'Ungültiges layout-Objekt in der Datei.' };
    }
    if (raw.form !== undefined) {
      if (raw.form !== 'form-a' && raw.form !== 'form-b') {
        return { ok: false, reason: 'Ungültiger layout.form-Wert (form-a oder form-b erwartet).' };
      }
      layout.form = raw.form;
    }
    if (raw.guides !== undefined) {
      if (typeof raw.guides !== 'boolean') return { ok: false, reason: 'Ungültiger layout.guides-Wert (Boolean erwartet).' };
      layout.guides = raw.guides;
    }
    if (raw.copyfit !== undefined) {
      if (typeof raw.copyfit !== 'boolean') return { ok: false, reason: 'Ungültiger layout.copyfit-Wert (Boolean erwartet).' };
      layout.copyfit = raw.copyfit;
    }
    if (raw.marks !== undefined) {
      if (typeof raw.marks !== 'boolean') return { ok: false, reason: 'Ungültiger layout.marks-Wert (Boolean erwartet).' };
      layout.marks = raw.marks;
    }
  }

  /** @type {{ transform: DinLetterSignatureTransform } | undefined} */
  let signature;
  if (data.signature !== undefined && data.signature !== null) {
    if (typeof data.signature !== 'object' || Array.isArray(data.signature)) {
      return { ok: false, reason: 'Ungültiges signature-Objekt in der Datei.' };
    }
    const t = data.signature.transform;
    if (t !== undefined && t !== null) {
      if (typeof t !== 'object' || Array.isArray(t)) {
        return { ok: false, reason: 'Ungültige Signatur-Transformation.' };
      }
      if (
        typeof t.x !== 'number' || !Number.isFinite(t.x) ||
        typeof t.y !== 'number' || !Number.isFinite(t.y) ||
        typeof t.scale !== 'number' || !Number.isFinite(t.scale) ||
        typeof t.rot !== 'number' || !Number.isFinite(t.rot)
      ) {
        return { ok: false, reason: 'Ungültige Koordinaten in signature.transform.' };
      }
      signature = {
        transform: {
          x: t.x,
          y: t.y,
          scale: Math.max(0.15, Math.min(4.5, t.scale)),
          rot: t.rot
        }
      };
    }
  }

  return {
    ok: true,
    fields,
    layout: Object.keys(layout).length > 0 ? layout : undefined,
    signature,
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

  const savePicker = typeof window !== 'undefined' ? /** @type {any} */ (window).showSaveFilePicker : null;
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
      eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: Constants.TOASTS.DRAFT.EXPORT_SAVED, type: 'info' });
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
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: Constants.TOASTS.DRAFT.EXPORT_DOWNLOADED, type: 'info' });
    return true;
  } catch (err) {
    console.error('[Export] Download fehlgeschlagen:', err);
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: Constants.TOASTS.DRAFT.EXPORT_ERROR, type: 'error' });
    return false;
  }
}

/** @type {(() => Record<string, string | boolean>) | null} */
let registeredDraftCollector = null;

/**
 * Registriert den Collector für den aktuellen DOM-Draft.
 * @param {(() => Record<string, string | boolean>) | null} collector
 */
export function registerDraftCollector(collector) {
  registeredDraftCollector = collector;
}

/**
 * Erzeugt das vollständige DIN-Letter-Payload (Objekt), wie es vom Export-Button
 * und vom Live-JSON-Debug-Panel verwendet wird. PURE / SSoT.
 * @param {(() => Record<string, string | boolean>) | null} [draftCollector]
 * @returns {DinLetterPayload}
 */
export function buildDINLetterJSON(draftCollector = null) {
  const collector = draftCollector || registeredDraftCollector;
  let draft;
  try {
    draft = typeof collector === 'function' ? collector() : loadJSON(STORAGE_KEYS.draft, {});
  } catch {
    draft = loadJSON(STORAGE_KEYS.draft, {});
  }
  const settings = loadJSON(STORAGE_KEYS.settings, null);
  return buildDinLetterPayload(draft, settings);
}

/**
 * Verdrahtet Export/Import-UI (Sidebar-Buttons, Datei-Input, Confirm-Dialog, Keyboard-Shortcut).
 * @param {{ collectDraft?: () => Record<string, string | boolean> }} [options]
 */
export function initImportExport({ collectDraft } = {}) {
  if (typeof collectDraft === 'function') {
    registerDraftCollector(collectDraft);
  }

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
    const payload = buildDINLetterJSON(collectDraft);
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
      notify(Constants.TOASTS.DRAFT.IMPORT_SIZE_ERROR, 'error');
      return;
    }
    const result = parseDinLetterPayload(await file.text());
    if (!result.ok) {
      notify(Constants.TOASTS.DRAFT.IMPORT_REJECTED(result.reason), 'error');
      return;
    }
    pendingImport = result;
    if (importFileName) {
      let info = file.name;
      const details = [];
      if (result.layout?.form) {
        details.push(`Layout: ${result.layout.form === 'form-a' ? 'Form A' : 'Form B'}`);
      }
      if (result.signature?.transform) {
        details.push('Signatur-Position');
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
      saveJSON(STORAGE_KEYS.draft, pendingImport.fields);
      const currentSettings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS) || DEFAULT_SETTINGS;
      /** @type {Record<string, any>} */
      const nextSettings = { ...currentSettings };
      const layout = pendingImport.layout;
      if (layout) {
        if (layout.form !== undefined) nextSettings.layout = layout.form;
        if (layout.guides !== undefined) nextSettings.guides = layout.guides;
        if (layout.copyfit !== undefined) nextSettings.copyfit = layout.copyfit;
        if (layout.marks !== undefined) nextSettings.marks = layout.marks;
      }
      if (pendingImport.signature?.transform) {
        nextSettings.signatureState = { ...pendingImport.signature.transform };
      }
      saveJSON(STORAGE_KEYS.settings, nextSettings);
      migrateStorage();
      pendingImport = null;
      location.reload();
    } catch {
      notify(Constants.TOASTS.DRAFT.IMPORT_STORAGE_ERROR, 'error');
    }
  });
}
