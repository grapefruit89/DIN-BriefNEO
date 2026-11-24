// @ts-check
// @adr [[ADR-JS]]

/**
 * @file live-bridge.js — die Seite wählt sich bei einem lokalen Agenten ein.
 *
 * Warum es das gibt: WebMCP wirkt nur mit einem Agenten im Browser, und die
 * CDP-Brücke (`tools/mcp-dinbrief.mjs`) braucht einen Debug-Port. Für beides
 * gibt es einen dritten Weg, der ohne Flag und ohne Port auskommt: **die Seite
 * ruft an.** Mit `#agent=<token>` in der URL öffnet sie einen Server-Sent-
 * Events-Kanal zu `http://127.0.0.1:8765`, empfängt Werkzeugaufrufe und
 * antwortet per `fetch`. Der Agent in der Kommandozeile spricht mit
 * `tools/mcp-live.mjs`, nicht mit dem Browser.
 *
 * Invarianten:
 * 1. **Ohne `#agent=` passiert nichts.** Kein Kanal, kein Timer, kein Netz —
 *    die veröffentlichte Seite verhält sich für Besucher exakt wie vorher.
 * 2. Ausgeführt wird über `ausfuehren()` aus webmcp.js: dieselbe Werkzeugliste,
 *    dieselbe Logik wie WebMCP und die CDP-Brücke.
 * 3. Kein Schreibzugriff auf Dateien, kein Upload, keine Dialoge — nur das,
 *    was auch `dinApi` kann.
 */

import { showToast } from './core.js';
import { ausfuehren } from './webmcp.js';

/** Vorgabe-Port; die CSP erlaubt jeden Port auf 127.0.0.1. */
export const BRIDGE_PORT = 8765;

/** `#agent=<token>` oder `#agent=<token>@<port>` — Token ist ein Hex-String. */
const HASH_MUSTER = /(?:^|[#&])agent=([A-Za-z0-9._-]{4,64})(?:@(\d{2,5}))?/;

/**
 * Liest das Token aus dem URL-Hash. Exportiert, weil es pur prüfbar ist.
 * @param {string} [hash] Standard: `location.hash`
 * @returns {string} Token oder leerer String
 */
export function liveToken(hash = typeof location === 'undefined' ? '' : location.hash) {
  const treffer = String(hash || '').match(HASH_MUSTER);
  return treffer ? treffer[1] : '';
}

/**
 * Liest den Port aus dem Hash (`#agent=<token>@8766`), sonst die Vorgabe.
 * @param {string} [hash] Standard: `location.hash`
 * @returns {number}
 */
export function livePort(hash = typeof location === 'undefined' ? '' : location.hash) {
  const treffer = String(hash || '').match(HASH_MUSTER);
  const port = treffer?.[2] ? Number(treffer[2]) : BRIDGE_PORT;
  return Number.isInteger(port) && port > 1024 && port < 65536 ? port : BRIDGE_PORT;
}

/**
 * Die Adresse, die der Agent öffnen muss — als Hilfe für Doku und Konsole.
 * @param {string} token
 * @param {string} [seite] Standard: aktuelle Seite ohne Hash
 * @param {number} [port] Standard: BRIDGE_PORT
 * @returns {string}
 */
export function liveAdresse(
  token,
  seite = typeof location === 'undefined' ? '' : `${location.origin}${location.pathname}`,
  port = BRIDGE_PORT
) {
  const marker = port === BRIDGE_PORT ? '' : `@${port}`;
  return `${seite}#agent=${token}${marker}`;
}

/**
 * Verbindet die Seite mit `tools/mcp-live.mjs`, falls die URL ein Token trägt.
 * EventSource verbindet bei Abbruch selbst neu; ein eigener Retry ist unnötig.
 * @returns {{ ok: boolean, aktiv: boolean, grund?: string, token?: string, port?: number }}
 */
export function initLiveBridge() {
  const token = liveToken();
  if (!token) return { ok: true, aktiv: false, grund: 'kein #agent=<token> in der URL' };

  const port = livePort();
  const basis = `http://127.0.0.1:${port}`;
  let gemeldet = false;

  /** @type {EventSource} */
  const quelle = new EventSource(`${basis}/events?token=${encodeURIComponent(token)}`);

  quelle.addEventListener('open', () => {
    if (gemeldet) return;
    gemeldet = true;
    showToast('Agent verbunden — schreibbereit', 'info');
  });

  quelle.addEventListener('call', async (ereignis) => {
    const roh = /** @type {MessageEvent} */ (ereignis).data;
    /** @type {{ id?: string, name?: string, arguments?: Record<string, unknown> }} */
    let auftrag;
    try {
      auftrag = JSON.parse(String(roh));
    } catch {
      return;
    }
    if (!auftrag.id || !auftrag.name) return;
    const ergebnis = await ausfuehren(auftrag.name, auftrag.arguments || {});
    void fetch(`${basis}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id: auftrag.id, result: ergebnis })
    }).catch(() => {
      /* Der Agent ist weg — der nächste Aufruf kommt über den Kanal neu. */
    });
  });

  return { ok: true, aktiv: true, token, port };
}
