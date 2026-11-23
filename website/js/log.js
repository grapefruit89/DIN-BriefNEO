// @ts-check
// @adr [[ADR-JS]] {Log}
// @guide [[din-5008-css-architektur]]

/**
 * @file log.js — kleiner Ringpuffer der letzten Fehler und Warnungen.
 *
 * Warum: Fehler landeten bisher nur in der Konsole und waren nach einem
 * Reload weg. Für das Debug-Panel (und für „schick mir die Fehler") braucht es
 * einen kurzen, kopierbaren Verlauf. Es gibt **keine** Änderung am Verhalten:
 * jede Meldung geht unverändert an die Konsole, zusätzlich wird sie gemerkt.
 *
 * Umfang bewusst klein: kein Log-Level, keine Dateien, kein Netz. Abgefangen
 * werden `console.error`, `console.warn`, unbehandelte Fehler (`error`) und
 * abgelehnte Promises (`unhandledrejection`).
 *
 * Einbau: `installiereLog()` einmal beim Start (main.js). Lesen:
 * `holeLog()` — z. B. im Debug-Panel.
 */

const MAX = 50;

/**
 * @typedef {object} LogEintrag
 * @property {number} nr laufende Nummer
 * @property {'error' | 'warn'} stufe
 * @property {string} text gekuerzt auf 500 Zeichen
 */

/** @type {LogEintrag[]} */
const eintraege = [];
let nummer = 0;
let installiert = false;

/**
 * @param {unknown} wert
 * @returns {string}
 */
function alsText(wert) {
  if (wert instanceof Error) return `${wert.name}: ${wert.message}`;
  if (typeof wert === 'string') return wert;
  try {
    return JSON.stringify(wert);
  } catch {
    return String(wert);
  }
}

/**
 * @param {'error' | 'warn'} stufe
 * @param {unknown[]} args
 */
function merke(stufe, args) {
  nummer += 1;
  eintraege.push({
    nr: nummer,
    stufe,
    text: args.map(alsText).join(' ').replace(/\s+/g, ' ').slice(0, 500)
  });
  if (eintraege.length > MAX) eintraege.shift();
}

/** @returns {LogEintrag[]} Kopie des Puffers (aelteste zuerst) */
export function holeLog() {
  return eintraege.map((e) => ({ ...e }));
}

/** Haengt den Puffer an die Konsole an — idempotent. */
export function installiereLog() {
  if (installiert || typeof window === 'undefined') return;
  installiert = true;

  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);
  console.error = (...args) => {
    merke('error', args);
    origError(...args);
  };
  console.warn = (...args) => {
    merke('warn', args);
    origWarn(...args);
  };

  window.addEventListener('error', (ev) => {
    merke('error', [`${ev.message} (${ev.filename || '?'}:${ev.lineno || 0})`]);
  });
  window.addEventListener('unhandledrejection', (ev) => {
    merke('error', [`Unbehandelte Promise-Ablehnung: ${alsText(ev.reason)}`]);
  });
}
