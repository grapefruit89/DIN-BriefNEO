// @ts-check
// @adr [[ADR-JS]] {Geo-Cache}
// @guide [[din-5008-css-architektur]]

/**
 * @file geo-cache.js — Ringspeicher für Geoapify-Treffer.
 *
 * Warum: Jeder Suchbegriff kostet einen Abruf (gemessen 2026-11-22: 350–550 ms,
 * mit schweren Parametern bis 1,8 s). Die Session-Map in `address.js` half nur
 * bis zum nächsten Reload. Dieser Ring hält die Treffer dauerhaft im
 * `localStorage` — strukturierte Daten gehören dort hin (Gesetz S1;
 * IndexedDB ist für strukturierte Daten per A34 verboten).
 *
 * Speicherplatz: Die Rohantwort wiegt 9,8 KB je Suchbegriff, die Felder, die
 * die Liste braucht, 0,4 KB (gemessen 2026-11-22) — der 1-MB-Ring fasst damit
 * ~2.400 Begriffe statt ~104 roh.
 *
 * KONZEPT (bewusst gewaehlt, nicht "irgendein Cache"):
 *  - Verdrängung: **LFU mit LRU-Tie-Break** — Haeufigkeit zuerst, Alter nur als
 *    Gleichstand. Reines LRU (nur Alter) war der Stand davor.
 *  - Gezaehlt wird erst die **Uebernahme ins Feld** (`geoCacheZaehle`), nicht
 *    die Suche: eine **Admission-Policy** mit implizitem Feedback. Wer sucht,
 *    aber nichts waehlt, hat nichts bewiesen.
 *  - Auch leere Trefferlisten liegen hier: **Negative-Cache** (Begriff aus dem
 *    DNS, wo NXDOMAIN-Antworten ebenfalls gecacht werden).
 *  - Nicht gebaut, weil bei ~2.400 kleinen Eintraegen ohne Gewinn: **GDSF**
 *    (Haeufigkeit pro Byte — lohnt nur bei stark unterschiedlichen Groessen),
 *    **LFUDA** (Haeufigkeit mit Alterung gegen Dauerbrenner), **TinyLFU /
 *    W-TinyLFU** (Doorkeeper, braucht Frequenz-Sketch).
 *
 * Aufbau:
 *   localStorage['geo_cache_v1:<hash>']  = der Wert (JSON)
 *   localStorage['geo_cache_index_v1']   = [{h, b, l, t}, …]  (nur Verwaltung)
 * Der Index wird im RAM geführt und verzögert geschrieben (512 KB Index bei
 * jedem Tastendruck zu serialisieren wäre teurer als der Nutzen).
 */

/** Deckel des Rings in Bytes (UTF-16, also ×2 pro Zeichen). */
export const RING_MAX_BYTES = 1024 * 1024;

const WERT_PREFIX = 'geo_cache_v1:';
const INDEX_KEY = 'geo_cache_index_v1';

/**
 * @typedef {object} IndexEintrag
 * @property {number} b Bytes (Wert + Schluessel)
 * @property {number} l Laenge des Originalschluessels (Kollisionsschutz)
 * @property {number} t Reihenfolge des Schreibens (Zaehler, keine Uhrzeit)
 * @property {number} n wie oft ein Treffer dieser Abfrage GEWAEHLT wurde
 */

/** @type {Map<string, IndexEintrag> | null} */
let index = null;
let gesamtBytes = 0;
/* Reihenfolge statt Uhrzeit: die Date-API ist im Produktcode per A48 verboten
   (Gate-Fund 2026-11-22). Ein Zaehler reicht — fuer die Verdrängung zaehlt nur,
   was frueher geschrieben wurde. */
let zaehler = 0;
/** @type {any} */
let indexTimer = null;

/**
 * 32-Bit-FNV-1a als Base36. Reine Funktion (testbar).
 * Kollisionen sind bei ~3.000 Einträgen selten; die Laenge des
 * Originalschluessels im Index entlarvt sie zusätzlich.
 * @param {string} text
 * @returns {string}
 */
export function geoCacheHash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/**
 * Laedt den Index einmalig aus dem localStorage. Kaputte oder fremde Daten
 * werden verworfen — der Cache ist eine Beschleunigung, kein Datenbestand.
 * @returns {Map<string, IndexEintrag>}
 */
function ladeIndex() {
  if (index) return index;
  index = new Map();
  gesamtBytes = 0;
  try {
    const roh = localStorage.getItem(INDEX_KEY);
    if (!roh) return index;
    const liste = JSON.parse(roh);
    if (!Array.isArray(liste)) return index;
    for (const e of liste) {
      if (!e || typeof e.h !== 'string' || !Number.isFinite(e.b)) continue;
      const t = Number(e.t) || 0;
      if (t > zaehler) zaehler = t;
      index.set(e.h, { b: Number(e.b), l: Number(e.l) || 0, t, n: Number(e.n) || 0 });
      gesamtBytes += Number(e.b);
    }
  } catch {
    index = new Map();
    gesamtBytes = 0;
  }
  return index;
}

/** Schreibt den Index jetzt (Tests, `pagehide`). */
export function geoCacheFlush() {
  if (!index) return;
  if (indexTimer) {
    clearTimeout(indexTimer);
    indexTimer = null;
  }
  try {
    const liste = [...index.entries()].map(([h, e]) => ({ h, b: e.b, l: e.l, t: e.t, n: e.n }));
    localStorage.setItem(INDEX_KEY, JSON.stringify(liste));
  } catch {
    /* Quota oder Privatmodus: dann bleibt der Ring eben unsichtbar. */
  }
}

function planeIndex() {
  if (indexTimer) return;
  indexTimer = setTimeout(() => {
    indexTimer = null;
    geoCacheFlush();
  }, 400);
}

/**
 * Verdrängt Einträge, bis `noetig` zusätzliche Bytes hineinpassen.
 * Reihenfolge: **nie gewählte zuerst**, dann die am längsten unbenutzten.
 * Ein Begriff, dessen Treffer schon ins Feld übernommen wurde, ist mehr wert
 * als einer, den niemand angeklickt hat (Vorgabe 2026-11-22).
 * @param {number} [noetig=0]
 */
function verdraenge(noetig = 0) {
  const idx = ladeIndex();
  if (gesamtBytes + noetig <= RING_MAX_BYTES) return;
  const nachAlter = [...idx.entries()].sort((a, b) => a[1].n - b[1].n || a[1].t - b[1].t);
  for (const [h, e] of nachAlter) {
    if (gesamtBytes + noetig <= RING_MAX_BYTES) break;
    try {
      localStorage.removeItem(WERT_PREFIX + h);
    } catch {
      /* ignorieren: der Index raeumt auf */
    }
    idx.delete(h);
    gesamtBytes -= e.b;
  }
}

/**
 * Legt einen Wert in den Ring.
 * @param {string} schluessel
 * @param {unknown} wert JSON-serialisierbar
 */
export function geoCacheSetze(schluessel, wert) {
  if (!schluessel) return;
  let json = '';
  try {
    json = JSON.stringify(wert);
  } catch {
    return;
  }
  const hash = geoCacheHash(schluessel);
  const bytes = (WERT_PREFIX.length + hash.length + json.length) * 2;
  try {
    localStorage.setItem(WERT_PREFIX + hash, json);
  } catch {
    /* Quota: Platz schaffen und einmal erneut versuchen. */
    verdraenge(bytes);
    try {
      localStorage.setItem(WERT_PREFIX + hash, json);
    } catch {
      return;
    }
  }
  const idx = ladeIndex();
  const alt = idx.get(hash);
  if (alt) gesamtBytes -= alt.b;
  zaehler += 1;
  /* Zaehler NICHT zuruecksetzen: derselbe Begriff wird oft neu gesucht und
     soll dabei nicht seine Wertigkeit verlieren. */
  idx.set(hash, { b: bytes, l: schluessel.length, t: zaehler, n: alt?.n ?? 0 });
  gesamtBytes += bytes;
  verdraenge();
  planeIndex();
}

/**
 * Liest einen Wert aus dem Ring.
 * @param {string} schluessel
 * @returns {unknown}
 */
export function geoCacheHole(schluessel) {
  if (!schluessel) return undefined;
  const idx = ladeIndex();
  const hash = geoCacheHash(schluessel);
  const eintrag = idx.get(hash);
  /* Laenge muss passen: sonst ist es eine Hash-Kollision und kein Treffer. */
  if (!eintrag || eintrag.l !== schluessel.length) return undefined;
  let roh = null;
  try {
    roh = localStorage.getItem(WERT_PREFIX + hash);
  } catch {
    return undefined;
  }
  if (roh === null) {
    idx.delete(hash);
    gesamtBytes -= eintrag.b;
    planeIndex();
    return undefined;
  }
  try {
    return JSON.parse(roh);
  } catch {
    try {
      localStorage.removeItem(WERT_PREFIX + hash);
    } catch {
      /* ignorieren */
    }
    idx.delete(hash);
    gesamtBytes -= eintrag.b;
    planeIndex();
    return undefined;
  }
}

/**
 * Zaehlt einen Treffer als "wurde wirklich ins Feld uebernommen".
 * Nur DAS zaehlt: eine Abfrage, bei der der Nutzer nichts auswaehlt, ist fuer
 * die Verdrängung nichts wert (Vorgabe 2026-11-22).
 * @param {string} schluessel
 */
export function geoCacheZaehle(schluessel) {
  if (!schluessel) return;
  const idx = ladeIndex();
  const hash = geoCacheHash(schluessel);
  const eintrag = idx.get(hash);
  if (!eintrag || eintrag.l !== schluessel.length) return;
  eintrag.n += 1;
  planeIndex();
}

/**
 * Wie oft ein Begriff als "gewaehlt" gezaehlt wurde (0 = nie).
 * @param {string} schluessel
 * @returns {number}
 */
export function geoCacheNutzung(schluessel) {
  const idx = ladeIndex();
  const hash = geoCacheHash(schluessel);
  const eintrag = idx.get(hash);
  if (!eintrag || eintrag.l !== schluessel.length) return 0;
  return eintrag.n;
}

/**
 * Belegung des Rings (fuer Diagnose und Tests).
 * @returns {{ eintraege: number, bytes: number, maxBytes: number, gewaehlt: number }}
 */
export function geoCacheGroesse() {
  const idx = ladeIndex();
  let gewaehlt = 0;
  for (const e of idx.values()) if (e.n > 0) gewaehlt += 1;
  return { eintraege: idx.size, bytes: gesamtBytes, maxBytes: RING_MAX_BYTES, gewaehlt };
}

/** Leert den Ring vollstaendig (Einstellungen, Tests). */
export function geoCacheLeeren() {
  const idx = ladeIndex();
  for (const h of idx.keys()) {
    try {
      localStorage.removeItem(WERT_PREFIX + h);
    } catch {
      /* ignorieren */
    }
  }
  idx.clear();
  gesamtBytes = 0;
  try {
    localStorage.removeItem(INDEX_KEY);
  } catch {
    /* ignorieren */
  }
  if (indexTimer) {
    clearTimeout(indexTimer);
    indexTimer = null;
  }
}

/* Beim Verlassen der Seite den Index nachziehen: die verzögerte Schreibung
   würde sonst die letzten Suchbegriffe verlieren. `typeof window`-Guard, weil
   das Adress-Korpus-Gate (test/corpus/run.js) die Module in Node laedt. */
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', geoCacheFlush);
}
