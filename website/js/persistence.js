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

import { Constants, notify } from './core.js';
import { currentISODate } from './format.js';

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
 * @property {boolean} [sensitiveSubject]
 * @property {boolean} [pluginTestbrief]
 * @property {boolean} [pluginMultipage]
 * @property {string} [previewFont]
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
  sensitiveSubject: false,
  pluginTestbrief: true,
  pluginMultipage: true,
  previewFont: 'default',
  formality: 'formal'
};

/**
 * Zentrale LocalStorage-Schlüssel.
 */
export const STORAGE_KEYS = {
  draft: 'din_draft_current',
  settings: 'din_settings',
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
    return save(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/**
 * Fragt dauerhaften Speicher an — einmal beim Start, nicht bei jedem Schreiben.
 * saveJSON lief bisher bei jedem Tastendruck-Save durch storage.persist();
 * der Aufruf gehoert in den Boot-Pfad (Idle), nicht in den Renderpfad (#16).
 */
export function requestPersistentStorage() {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return;
  const anfragen = () => {
    navigator.storage.persist().catch((err) => console.debug('[Storage]', err));
  };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(anfragen, { timeout: 3000 });
  } else {
    setTimeout(anfragen, 0);
  }
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
 * Kontext-Stack für reentrante beforeprint/afterprint-Zyklen.
 * Verhindert Deadlocks und Metadaten-Leaks bei asynchronen oder mehrfachen beforeprint-Events.
 * @type {Array<{ oldTitle: string, injectedTags: HTMLMetaElement[] }>}
 */
const printContextStack = [];

/**
 * Darf der Draft-Autosave den Dokumenttitel gerade setzen?
 * @returns {boolean}
 */
export function isPrintTitleActive() {
  return printContextStack.length > 0;
}

export const MetadataService = {
  /**
   * Bereitet Titel und Meta-Tags vor dem Drucken vor.
   * Reentrant: Push auf den Kontext-Stack; ein verschachteltes beforeprint erbt
   * den echten Originaltitel des äußersten Aufrufs.
   */
  prepare() {
    this._cleanupInjectedTags();

    // Originaltitel: Wenn der Stack leer ist, ist document.title der echte Originaltitel.
    // Bei verschachteltem Aufruf erbt der neue Kontext den ursprünglichen Titel des ersten Eintrags.
    const currentTitle = typeof document !== 'undefined' ? document.title : '';
    const originalTitle = printContextStack.length > 0
      ? printContextStack[0].oldTitle
      : currentTitle;

    const { fileName, dateStr, lastName, recipientName, subjectClean } = collectLetterIdentity();
    if (typeof document !== 'undefined') {
      document.title = fileName;
    }

    const metaData = {
      author: lastName,
      description: `DIN 5008 Brief an ${recipientName} - ${subjectClean}`,
      keywords: `DIN-Brief, BriefNEO, ${recipientName}, ${dateStr}, Platinum`,
      title: fileName
    };

    const injectedTags = this._injectMetaTags(metaData);
    const ctx = { oldTitle: originalTitle, injectedTags };
    printContextStack.push(ctx);

    return ctx;
  },

  /**
   * Entfernt alle im Head injizierten Print-Metatags.
   */
  _cleanupInjectedTags() {
    if (typeof document === 'undefined') return;
    const existing = document.head.querySelectorAll('meta[data-injected="true"]');
    for (const tag of existing) {
      tag.remove();
    }
  },

  /**
   * @param {{ author: string, description: string, keywords: string, title: string }} data
   * @returns {HTMLMetaElement[]}
   */
  _injectMetaTags(data) {
    if (typeof document === 'undefined') return [];
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
   * Stellt Originaltitel wieder her und räumt injizierte Meta-Tags auf.
   * @param {{ oldTitle?: string, injectedTags?: HTMLMetaElement[] } | null} [context]
   */
  restore(context = null) {
    if (context && printContextStack.includes(/** @type {any} */ (context))) {
      const idx = printContextStack.indexOf(/** @type {any} */ (context));
      printContextStack.splice(idx, 1);
    } else if (printContextStack.length > 0) {
      printContextStack.pop();
    }

    this._cleanupInjectedTags();

    // Wenn der Stack wieder komplett leer ist, stellen wir den echten Originaltitel wieder her
    if (printContextStack.length === 0) {
      const restoreTitle = context?.oldTitle;
      if (restoreTitle && typeof document !== 'undefined') {
        document.title = restoreTitle;
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
 * @property {boolean} [sensitiveSubject]
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
 * @property {{ schema: string[] }} _meta
 * @property {DinLetterLayout} layout
 * @property {(string | boolean)[]} fields
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
 * @property {string} [error]
 */

/**
 * @typedef {DinLetterParseSuccess | DinLetterParseError} DinLetterParseResult
 */

/**
 * Kanonische Schema-Definition für Briefdokumente (Schema v4, Tuple-Format).
 * Definiert die exakte Index-Reihenfolge aller Dokumentenfelder im serialisierten Array.
 */
export const DOCUMENT_SCHEMA_V4 = [
  'rucksendeangabe', 'vermerke',
  'empfaenger-firma', 'empfaenger-name', 'empfaenger-strasse', 'empfaenger-ort',
  'absender-name', 'absender-strasse', 'absender-ort', 'absender-tel', 'absender-mail',
  'datum', 'spacer', 'betreff', 'teilbetreff', 'anrede', 'text', 'grussformel', 'unterschrift',
  'anlagen-angabe',
  'fuss-firma', 'fuss-sitz', 'fuss-gericht', 'fuss-hrb', 'fuss-vorstand', 'fuss-gf',
  'fuss-stnr', 'fuss-ustid', 'fuss-bank', 'fuss-iban', 'fuss-bic', 'fuss-anschrift',
  'toggle-anlagen', 'toggle-fuss', 'toggle-teilbetreff'
];

/**
 * Bereinigt HTML-Strings (wie <li> in Listenfeldern) zu lesbarem Plaintext für den JSON-Export.
 * @param {string} html
 * @returns {string}
 */
export function stripHtmlToPlaintext(html) {
  if (!html?.includes('<')) return html ? html.trim() : '';
  let str = html
    .replace(/<li[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');
  let prev;
  do {
    prev = str;
    str = str.replace(/<[^>]+>/g, '');
  } while (str !== prev);
  return str
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Baut das Export-Payload (Schema v4, Tuple-Format) aus einem Draft-Objekt und den Einstellungen.
 * Folgt derselben hocheffizienten Tabular-/Tuple-Architektur wie figuren.json (_meta.schema + Werte-Array),
 * statt redundante Feldbezeichner als Key-Value-Blob mitzuschleifen.
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

  const draftObj = (draft && typeof draft === 'object') ? draft : {};

  // Extrahiere Werte in der kanonischen Reihenfolge von DOCUMENT_SCHEMA_V4
  /** @type {(string | boolean)[]} */
  const fields = DOCUMENT_SCHEMA_V4.map((field) => {
    if (field.startsWith('toggle-')) {
      const val = draftObj[field];
      return val === true || val === 'true';
    }
    const val = draftObj[field];
    if (typeof val === 'string') {
      return field === 'anlagen-angabe' ? stripHtmlToPlaintext(val) : val.trim();
    }
    return '';
  });

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
    _meta: {
      schema: [...DOCUMENT_SCHEMA_V4]
    },
    layout: {
      form: (s.layout === 'form-a' || s.layout === 'form-b') ? s.layout : 'form-b',
      guides: typeof s.guides === 'boolean' ? s.guides : false,
      copyfit: typeof s.copyfit === 'boolean' ? s.copyfit : false,
      marks: typeof s.marks === 'boolean' ? s.marks : true,
      sensitiveSubject: typeof s.sensitiveSubject === 'boolean' ? s.sensitiveSubject : false
    },
    fields,
    signature: { transform }
  };
}

/**
 * Validiert und parsed ein DIN-Brief-JSON-Dokument (ausschließlich Schema v4 Tuple-Format).
 * Frühere Schemata werden nicht mehr unterstützt. PURE — unit-testbar.
 * @param {string | object} input
 * @returns {DinLetterParseResult}
 */
export function parseDinLetterPayload(input) {
  /** @type {any} */
  let data;
  if (typeof input === 'object' && input !== null) {
    data = input;
  } else if (typeof input === 'string') {
    const text = input.replace(/^\uFEFF/, '');
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, reason: 'Keine gültige JSON-Datei.', error: 'Keine gültige JSON-Datei.' };
    }
  } else {
    return { ok: false, reason: 'Ungültiges Argument (String oder Objekt erwartet).', error: 'Ungültiges Argument (String oder Objekt erwartet).' };
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'Keine gültige DIN-Brief-Datei (.json, Objekt erwartet).', error: 'Keine gültige DIN-Brief-Datei (.json, Objekt erwartet).' };
  }
  if (data.format !== DINLETTER_FORMAT) {
    return { ok: false, reason: `Falsches Format — erwartet '${DINLETTER_FORMAT}'.`, error: `Falsches Format — erwartet '${DINLETTER_FORMAT}'.` };
  }
  if (data.schema_version !== 4) {
    return {
      ok: false,
      reason: `Nur Schema v4 wird unterstützt (erhalten: v${data.schema_version}).`,
      error: `Nur Schema v4 wird unterstützt (erhalten: v${data.schema_version}).`
    };
  }
  if (!Array.isArray(data.fields) || !Array.isArray(data._meta?.schema)) {
    return {
      ok: false,
      reason: 'Ungültiges Schema-v4-Dokument: fields (Array) und _meta.schema (Array) sind zwingend erforderlich.',
      error: 'Ungültiges Schema-v4-Dokument: fields (Array) und _meta.schema (Array) sind zwingend erforderlich.'
    };
  }

  const schema = data._meta.schema;
  const rawFields = data.fields;
  const fields = /** @type {Record<string, string | boolean>} */ (Object.create(null));

  for (let i = 0; i < schema.length; i++) {
    const key = schema[i];
    if (typeof key !== 'string' || key === 'constructor' || key === 'prototype' || key === '__proto__' || !/^[A-Za-z][\w-]*$/.test(key)) {
      return { ok: false, reason: `Ungültiger Feldname '${key}'.`, error: `Ungültiger Feldname '${key}'.` };
    }
    const val = rawFields[i];
    const istToggle = key.startsWith('toggle-');
    if (istToggle) {
      if (val !== undefined && typeof val !== 'boolean') {
        return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.`, error: `Ungültiger Feldtyp bei '${key}'.` };
      }
      fields[key] = val === true;
    } else {
      if (val !== undefined && val !== null && typeof val !== 'string') {
        return { ok: false, reason: `Ungültiger Feldtyp bei '${key}'.`, error: `Ungültiger Feldtyp bei '${key}'.` };
      }
      fields[key] = typeof val === 'string' ? val : '';
    }
  }

  /** @type {Partial<DinLetterLayout>} */
  const layout = Object.create(null);
  if (data.layout !== undefined) {
    const raw = data.layout;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ok: false, reason: 'Ungültiges layout-Objekt in der Datei.', error: 'Ungültiges layout-Objekt in der Datei.' };
    }
    if (raw.form !== undefined) {
      if (raw.form !== 'form-a' && raw.form !== 'form-b') {
        return { ok: false, reason: 'Ungültiger layout.form-Wert (form-a oder form-b erwartet).', error: 'Ungültiger layout.form-Wert (form-a oder form-b erwartet).' };
      }
      layout.form = raw.form;
    }
    if (raw.guides !== undefined) {
      if (typeof raw.guides !== 'boolean') return { ok: false, reason: 'Ungültiger layout.guides-Wert (Boolean erwartet).', error: 'Ungültiger layout.guides-Wert (Boolean erwartet).' };
      layout.guides = raw.guides;
    }
    if (raw.copyfit !== undefined) {
      if (typeof raw.copyfit !== 'boolean') return { ok: false, reason: 'Ungültiger layout.copyfit-Wert (Boolean erwartet).', error: 'Ungültiger layout.copyfit-Wert (Boolean erwartet).' };
      layout.copyfit = raw.copyfit;
    }
    if (raw.marks !== undefined) {
      if (typeof raw.marks !== 'boolean') return { ok: false, reason: 'Ungültiger layout.marks-Wert (Boolean erwartet).', error: 'Ungültiger layout.marks-Wert (Boolean erwartet).' };
      layout.marks = raw.marks;
    }
    if (raw.sensitiveSubject !== undefined) {
      if (typeof raw.sensitiveSubject !== 'boolean') return { ok: false, reason: 'Ungültiger layout.sensitiveSubject-Wert (Boolean erwartet).', error: 'Ungültiger layout.sensitiveSubject-Wert (Boolean erwartet).' };
      layout.sensitiveSubject = raw.sensitiveSubject;
    }
  }

  /** @type {{ transform: DinLetterSignatureTransform } | undefined} */
  let signature;
  if (data.signature !== undefined && data.signature !== null) {
    if (typeof data.signature !== 'object' || Array.isArray(data.signature)) {
      return { ok: false, reason: 'Ungültiges signature-Objekt in der Datei.', error: 'Ungültiges signature-Objekt in der Datei.' };
    }
    const t = data.signature.transform;
    if (t !== undefined && t !== null) {
      if (typeof t !== 'object' || Array.isArray(t)) {
        return { ok: false, reason: 'Ungültige Signatur-Transformation.', error: 'Ungültige Signatur-Transformation.' };
      }
      if (
        typeof t.x !== 'number' || !Number.isFinite(t.x) ||
        typeof t.y !== 'number' || !Number.isFinite(t.y) ||
        typeof t.scale !== 'number' || !Number.isFinite(t.scale) ||
        typeof t.rot !== 'number' || !Number.isFinite(t.rot)
      ) {
        return { ok: false, reason: 'Ungültige Koordinaten in signature.transform.', error: 'Ungültige Koordinaten in signature.transform.' };
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
    schemaVersion: 4
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
      notify(Constants.TOASTS.DRAFT.EXPORT_SAVED, 'info');
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
    notify(Constants.TOASTS.DRAFT.EXPORT_DOWNLOADED, 'info');
    return true;
  } catch (err) {
    console.error('[Export] Download fehlgeschlagen:', err);
    notify(Constants.TOASTS.DRAFT.EXPORT_ERROR, 'error');
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
 * Wendet einen geprüften Import an und persistiert ihn im localStorage.
 * Bricht bei Speicherfehlern (saveJSON -> false) sofort ab, ohne reload auszulösen (B55).
 * @param {any} pendingImport
 * @param {{ reloadFn?: () => void }} [options]
 * @returns {boolean} true bei Erfolg, false bei Speicherfehler
 */
export function applyImportedData(pendingImport, { reloadFn = () => location.reload() } = {}) {
  if (!pendingImport?.ok) return false;
  try {
    const draftGespeichert = saveJSON(STORAGE_KEYS.draft, pendingImport.fields);
    const currentSettings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS) || DEFAULT_SETTINGS;
    /** @type {Record<string, any>} */
    const nextSettings = { ...currentSettings };
    const layout = pendingImport.layout;
    if (layout) {
      if (layout.form !== undefined) nextSettings.layout = layout.form;
      if (layout.guides !== undefined) nextSettings.guides = layout.guides;
      if (layout.copyfit !== undefined) nextSettings.copyfit = layout.copyfit;
      if (layout.marks !== undefined) nextSettings.marks = layout.marks;
      if (layout.sensitiveSubject !== undefined) nextSettings.sensitiveSubject = layout.sensitiveSubject;
    }
    if (pendingImport.signature?.transform) {
      nextSettings.signatureState = { ...pendingImport.signature.transform };
    }
    const settingsGespeichert = saveJSON(STORAGE_KEYS.settings, nextSettings);
    // saveJSON gibt bei vollem Speicher false zurück statt zu werfen (B55).
    // Ohne diese Prüfung meldet der Dialog Erfolg und der Reload verwirft den Import.
    if (!draftGespeichert || !settingsGespeichert) {
      notify(Constants.TOASTS.DRAFT.IMPORT_STORAGE_ERROR, 'error');
      return false;
    }
    if (typeof reloadFn === 'function') {
      reloadFn();
    }
    return true;
  } catch {
    notify(Constants.TOASTS.DRAFT.IMPORT_STORAGE_ERROR, 'error');
    return false;
  }
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
  const copyBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-copy-dinletter'));
  const importBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-import-dinletter'));
  const importInput = /** @type {HTMLInputElement | null} */ (document.getElementById('dinletter-uploader'));
  const importDialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('import-dialog'));
  const importFileName = document.getElementById('import-file-name');
  if (!exportBtn || !importBtn || !importInput || !importDialog) return;

  const handleExport = async () => {
    // Kein DOCUMENT_SAVE_REQUESTED: das Payload entsteht direkt aus dem DOM
    // (collectDraft). Der Request löste nur einen zweiten Speichervorgang aus (B47).
    const payload = buildDINLetterJSON(collectDraft);
    await exportDocumentToFile(payload);
  };

  exportBtn.addEventListener('click', handleExport);

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        const payload = buildDINLetterJSON(collectDraft);
        const jsonContent = JSON.stringify(payload, null, 2);
        await navigator.clipboard.writeText(jsonContent);
        notify(Constants.TOASTS.DRAFT.EXPORT_CLIPBOARD, 'info');
      } catch (err) {
        console.error('[Export] Kopieren in Zwischenablage fehlgeschlagen:', err);
        notify(Constants.TOASTS.DRAFT.EXPORT_ERROR, 'error');
      }
    });
  }

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
    const toApply = pendingImport;
    pendingImport = null;
    applyImportedData(toApply);
  });
}
