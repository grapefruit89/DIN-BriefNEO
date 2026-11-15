// @ts-check
// @adr [[ADR-JS]]

/* addons/verlauf/verlauf.js — Brief-Verlauf und zwei Adressbücher.
 *
 * STATUS: **vorbereitet, nicht geladen.** Diese Datei wird von keiner Stelle
 * importiert: kein `<script>` in `index.html`, kein `import` in `main.js`,
 * `boot.js` oder `boot-state.js`. Wer sie scharf schaltet, folgt
 * `README.md` §6 (Aktivierung) — inklusive der dort genannten Tests.
 *
 * Warum als Addon: die Datei bringt keine Kernaufgabe mit. Ohne sie schreibt,
 * druckt und speichert die Anwendung unverändert. Sie kostet 0 Byte, solange
 * niemand sie lädt (dynamischer `import()` beim ersten Klick).
 *
 * Was hier NICHT passiert:
 * - kein DOM-Zugriff, keine Selektoren, keine Events (reine Datenschicht)
 * - kein neues Briefformat: ein Verlaufs-Eintrag ist ein **Export-Payload**
 *   (`buildDinLetterPayload`), und Wiederherstellen geht über den geprüften
 *   Import-Pfad (`parseDinLetterPayload` → `applyImportedData`)
 * - kein Signaturbild: das liegt in IndexedDB (`binary-storage.js`) und wird
 *   vom Verlauf weder kopiert noch gelöscht
 */

import {
  buildDinLetterPayload,
  loadJSON,
  parseDinLetterPayload,
  saveJSON,
} from '../../js/persistence.js';

/* =========================================================================================
 * 1. GRENZEN UND SCHLUESSEL
 * ========================================================================================= */

/** Verlaufs-Schlüssel. Bewusst NICHT `STORAGE_KEYS.*`: der Verlauf ist ein
 *  Archiv, kein Entwurf. */
export const HISTORY_KEY = 'din_history';

/** Zehn Briefe, wie im Backlog beschrieben. */
export const HISTORY_LIMIT = 10;

/** Zusätzliche Deckelung nach Bytes — ein Brief mit viel Rich-Text kann
 *  einzeln schon groß sein. 512 KiB passen sicher in die übliche 5-MB-Quota. */
export const HISTORY_BYTES = 512 * 1024;

/**
 * Eigene Schlüssel für die Adressbücher.
 *
 * Bewusst NICHT `STORAGE_KEYS.addresses` (`din_local_addresses`): dort liegt
 * die *abgeleitete* Adress-Historie aus der Suche, und `draft-manager.js`
 * löscht sie beim Zurücksetzen bewusst ("gehoert zum Brief, nicht zu den
 * Praeferenzen", Zeile 476–482). Ein Adressbuch ist dagegen vom Nutzer
 * getippt — es darf nicht verschwinden, weil jemand den Brief zurücksetzt.
 */
export const BOOK_KEYS = /** @type {const} */ ({
  sender: 'din_addressbook_sender',
  recipient: 'din_addressbook_recipient',
});

/* =========================================================================================
 * 2. BRIEF-VERLAUF
 * ========================================================================================= */

/**
 * @typedef {object} HistoryEntry
 * @property {string} id
 * @property {string} savedAt ISO-Zeitstempel
 * @property {string} label Anzeigename (Betreff, sonst Empfänger, sonst Datum)
 * @property {object} payload Export-Payload (Format `dinletter`)
 */

/**
 * Zeitstempel in Berliner Zeit. `Temporal` ist Baseline (Chrome 150+, A48/TM1);
 * die Legacy-`Date`-API ist im Projekt gesperrt. Faellt `Temporal` aus, bleibt
 * der Zeitstempel leer — die Reihenfolge haengt ohnehin an der Array-Position
 * (neueste zuerst), nicht am String.
 * @returns {string}
 */
function jetztIso() {
  try {
    return Temporal.Now.zonedDateTimeISO('Europe/Berlin').toString();
  } catch {
    return '';
  }
}

/** @param {unknown} roh */
function istEintrag(roh) {
  return Boolean(
    roh && typeof roh === 'object' &&
    /** @type {any} */ (roh).payload &&
    typeof /** @type {any} */ (roh).id === 'string' &&
    Array.isArray(/** @type {any} */ (roh).payload.fields),
  );
}

/**
 * Alle Einträge, neueste zuerst. Defekte Einträge werden verworfen, nicht
 * repariert: ein halber Payload lässt sich nicht wiederherstellen.
 * @returns {HistoryEntry[]}
 */
export function listHistory() {
  const roh = /** @type {unknown[]} */ (loadJSON(HISTORY_KEY, []));
  if (!Array.isArray(roh)) return [];
  return /** @type {HistoryEntry[]} */ (roh.filter(istEintrag));
}

/**
 * Baut die Kennung. `crypto.randomUUID` ist in Chrome 150+ in sicheren
 * Kontexten vorhanden; der Fallback hält die Funktion auch auf `file://`
 * benutzbar.
 * @returns {string}
 */
function neueId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    return `h-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
  }
  return `h-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Anzeigename eines Eintrags: Betreff, sonst Empfänger, sonst Datum.
 * @param {object} payload
 * @returns {string}
 */
export function labelAusPayload(payload) {
  const felder = /** @type {any} */ (payload)?.fields;
  const schema = /** @type {any} */ (payload)?._meta?.schema;
  if (!Array.isArray(felder) || !Array.isArray(schema)) return 'Brief';
  /** @param {string} name @returns {string} */
  const lies = (name) => {
    const i = schema.indexOf(name);
    const wert = i > -1 ? felder[i] : '';
    return typeof wert === 'string' ? wert.replace(/<[^>]+>/g, '').trim() : '';
  };
  return lies('betreff') || lies('empfaenger-firma') || lies('empfaenger-name') || lies('datum') || 'Brief';
}

/**
 * Zwei Payloads beschreiben denselben Brief? Vergleich über die Feldwerte und
 * das Layout — nicht über `generated_at`, sonst wäre jeder Autosave neu.
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
function gleicherBrief(a, b) {
  try {
    return JSON.stringify({ f: /** @type {any} */ (a).fields, l: /** @type {any} */ (a).layout }) ===
      JSON.stringify({ f: /** @type {any} */ (b).fields, l: /** @type {any} */ (b).layout });
  } catch {
    return false;
  }
}

/** @param {object} payload */
function groesse(payload) {
  try {
    return JSON.stringify(payload).length;
  } catch {
    return HISTORY_BYTES + 1;
  }
}

/**
 * Legt einen Brief in den Verlauf. Ist es derselbe wie der neueste Eintrag,
 * wird nur der Zeitstempel erneuert (kein Doppel-Eintrag nach Autosave).
 *
 * @param {Record<string, string | boolean>} draft
 * @param {Record<string, any> | null} [settings]
 * @param {{ limit?: number, bytes?: number }} [optionen]
 * @returns {{ ok: boolean, eintraege: number }} `ok: false` heißt: Speicher voll
 *   oder Brief zu groß — der Verlauf bleibt dann unverändert.
 */
export function saveToHistory(draft, settings = null, optionen = {}) {
  const limit = optionen.limit ?? HISTORY_LIMIT;
  const maxBytes = optionen.bytes ?? HISTORY_BYTES;
  const payload = buildDinLetterPayload(draft, settings);
  const groesseBrief = groesse(payload);
  if (groesseBrief > maxBytes) return { ok: false, eintraege: listHistory().length };

  const bisher = listHistory();
  const kopf = bisher[0];
  /** @type {HistoryEntry} */
  const eintrag = {
    id: kopf && gleicherBrief(kopf.payload, payload) ? kopf.id : neueId(),
    savedAt: jetztIso(),
    label: labelAusPayload(payload),
    payload,
  };

  const ohneDoppel = kopf && eintrag.id === kopf.id ? bisher.slice(1) : bisher;
  const liste = [eintrag, ...ohneDoppel].slice(0, limit);

  /* Byte-Deckel: von hinten verwerfen, bis es passt. Mindestens ein Eintrag
     bleibt stehen, auch wenn er den Deckel allein überschreitet — sonst wäre
     der Verlauf bei großen Briefen dauerhaft leer. */
  const passt = () => liste.reduce((s, e) => s + groesse(e.payload), 0) <= maxBytes;
  while (liste.length > 1 && !passt()) liste.pop();

  return { ok: saveJSON(HISTORY_KEY, liste), eintraege: liste.length };
}

/**
 * @param {string} id
 * @returns {boolean} true, wenn etwas entfernt wurde
 */
export function deleteHistoryEntry(id) {
  const bisher = listHistory();
  const rest = bisher.filter((e) => e.id !== id);
  if (rest.length === bisher.length) return false;
  return saveJSON(HISTORY_KEY, rest);
}

/** @returns {boolean} */
export function clearHistory() {
  return saveJSON(HISTORY_KEY, []);
}

/**
 * Wandelt einen Verlaufseintrag in das, was `applyImportedData` erwartet.
 * Der Rückgabewert ist das Ergebnis des geprüften Parsers — kein eigener
 * Wiederherstellungsweg, keine zweite Wahrheit.
 * @param {string} id
 * @returns {import('../../js/persistence.js').DinLetterParseResult | null}
 */
export function historyToImport(id) {
  const eintrag = listHistory().find((e) => e.id === id);
  if (!eintrag) return null;
  return parseDinLetterPayload(eintrag.payload);
}

/* =========================================================================================
 * 3. ADRESSBÜCHER
 * ========================================================================================= */

/**
 * Ein Adressbuch-Eintrag spiegelt **1:1 die Brief-Felder**. Es wird nichts
 * zerlegt (Straße/Hausnummer, PLZ/Ort): das ist Aufgabe des Parsers, nicht des
 * Buchs. Was der Nutzer im Brief stehen hat, steht auch hier.
 *
 * @typedef {object} BookEntry
 * @property {string} id
 * @property {'sender' | 'recipient'} kind
 * @property {string} label Anzeigename (Name, Firma oder erste Zeile)
 * @property {string} [name]
 * @property {string} [firma]
 * @property {string} [strasse]
 * @property {string} [ort]
 * @property {string} [tel]
 * @property {string} [mail]
 * @property {string} usedAt ISO-Zeitstempel der letzten Verwendung
 */

/**
 * @param {'sender' | 'recipient'} kind
 * @returns {BookEntry[]}
 */
export function listBook(kind) {
  const schluessel = BOOK_KEYS[kind];
  if (!schluessel) return [];
  const roh = /** @type {unknown[]} */ (loadJSON(schluessel, []));
  if (!Array.isArray(roh)) return [];
  return /** @type {BookEntry[]} */ (
    roh.filter((e) => Boolean(e && typeof e === 'object' && /** @type {any} */ (e).id))
  );
}

/**
 * Anzeigename: Name, sonst Firma, sonst Straße/Ort.
 * @param {Partial<BookEntry>} eintrag
 * @returns {string}
 */
export function bookLabel(eintrag) {
  return [eintrag.name, eintrag.firma, eintrag.strasse, eintrag.ort]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean) || 'Ohne Namen';
}

/**
 * Legt einen Eintrag an oder aktualisiert ihn. Gleichheit wird über die
 * Adressbestandteile geprüft, nicht über die ID — sonst entstünde bei jedem
 * Speichern ein neuer Eintrag.
 *
 * @param {'sender' | 'recipient'} kind
 * @param {{ name?: string, firma?: string, strasse?: string, ort?: string, tel?: string, mail?: string }} daten
 * @returns {{ ok: boolean, eintrag: BookEntry }}
 */
export function saveBookEntry(kind, daten) {
  const schluessel = BOOK_KEYS[kind];
  /** @type {BookEntry} */
  const eintrag = {
    id: neueId(),
    kind,
    label: '',
    name: (daten.name || '').trim(),
    firma: (daten.firma || '').trim(),
    strasse: (daten.strasse || '').trim(),
    ort: (daten.ort || '').trim(),
    tel: (daten.tel || '').trim(),
    mail: (daten.mail || '').trim(),
    usedAt: jetztIso(),
  };
  eintrag.label = bookLabel(eintrag);

  const bisher = listBook(kind);
  /** @param {BookEntry} a @param {BookEntry} b @returns {boolean} */
  const gleich = (a, b) =>
    ['name', 'firma', 'strasse', 'ort'].every(
      (k) => String(/** @type {any} */ (a)[k] || '').toLowerCase() === String(/** @type {any} */ (b)[k] || '').toLowerCase(),
    );
  const vorhanden = bisher.find((e) => gleich(e, eintrag));
  const liste = vorhanden
    ? bisher.map((e) => (e.id === vorhanden.id ? { ...eintrag, id: vorhanden.id } : e))
    : [eintrag, ...bisher];

  return { ok: saveJSON(schluessel, liste), eintrag };
}

/**
 * @param {'sender' | 'recipient'} kind
 * @param {string} id
 * @returns {boolean}
 */
export function deleteBookEntry(kind, id) {
  const bisher = listBook(kind);
  const rest = bisher.filter((e) => e.id !== id);
  if (rest.length === bisher.length) return false;
  return saveJSON(BOOK_KEYS[kind], rest);
}

/**
 * Baut aus einem Eintrag die Brief-Felder. Der Aufrufer setzt sie über
 * `Field.setValue` — hier wird nichts ins DOM geschrieben.
 * @param {'sender' | 'recipient'} kind
 * @param {BookEntry} eintrag
 * @returns {Record<string, string>}
 */
export function bookEntryToFields(kind, eintrag) {
  /* Absichtlich ausgeschrieben statt ueber eine Tabelle: die beiden Formulare
     haben unterschiedliche Felder, und eine Liste mit fuenf Namen fuer vier
     Ziel-IDs war genau die Sorte Verschiebung, die man nicht sieht. */
  if (kind === 'sender') {
    return {
      'absender-name': eintrag.name || '',
      'absender-strasse': eintrag.strasse || '',
      'absender-ort': eintrag.ort || '',
      'absender-tel': eintrag.tel || '',
      'absender-mail': eintrag.mail || '',
    };
  }
  return {
    'empfaenger-firma': eintrag.firma || '',
    'empfaenger-name': eintrag.name || '',
    'empfaenger-strasse': eintrag.strasse || '',
    'empfaenger-ort': eintrag.ort || '',
  };
}
