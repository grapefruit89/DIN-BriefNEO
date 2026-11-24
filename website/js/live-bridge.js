// @ts-check
// @adr [[ADR-JS]]

/**
 * @file live-bridge.js — die Seite wählt sich bei einem lokalen Agenten ein.
 *
 * Warum es das gibt: WebMCP wirkt nur mit einem Agenten im Browser. Ein Agent
 * in der Kommandozeile braucht einen Transport — und zwar einen ohne
 * Debug-Port: **die Seite ruft an.** Mit einem Token (aus `#agent=<token>` oder
 * aus der Einstellung `agentToken`) öffnet sie einen Server-Sent-Events-Kanal
 * zu `http://127.0.0.1:8765`, empfängt Werkzeugaufrufe und antwortet per
 * `fetch`. Der Agent in der Kommandozeile spricht mit `tools/mcp-live.mjs`,
 * nicht mit dem Browser.
 *
 * Invarianten:
 * 1. **Ohne Token passiert nichts.** Kein Kanal, kein Timer, kein Netz —
 *    die veröffentlichte Seite verhält sich für Besucher exakt wie vorher.
 * 2. Ausgeführt wird über `ausfuehren()` aus webmcp.js: dieselbe Werkzeugliste,
 *    dieselbe Logik wie WebMCP.
 * 3. Kein Schreibzugriff auf Dateien, kein Upload, keine Dialoge — nur das,
 *    was auch `dinApi` kann.
 */

import { showToast } from './core.js';
import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS } from './persistence.js';
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
  const gespeichert = /** @type {{ agentKanal?: boolean, agentToken?: string }} */ (
    loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );
  const token = liveToken() || (gespeichert.agentKanal ? String(gespeichert.agentToken || '') : '');
  if (!token) return { ok: true, aktiv: false, grund: 'kein #agent=<token> in der URL und Kanal aus' };
  kanalStarten(token, livePort());
  return { ok: true, aktiv: true, token, port: livePort() };
}

/* --------------------------------------------------------------- Kanalsteuerung */

/**
 * Erzeugt einen Token in der Seite: 16 Zufallsbytes als 32 Hex-Zeichen.
 *
 * Warum in der Seite und nicht im Programm: der Nutzer soll nur einen Knopf
 * drücken und den Eintrag einfügen. `crypto.getRandomValues` ist überall da;
 * ein Fallback auf Math.random wäre schlechter als kein Token.
 * @returns {string}
 */
export function neuerToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** @type {{ token: string, port: number, beenden: () => void } | null} */
let aktuelle = null;

/** @type {(stand: { verbunden: boolean, token?: string, port?: number }) => void} */
let statusMelder = () => {};

/**
 * Meldet jeden Verbindungswechsel (verbunden/getrennt) an eine Stelle.
 * @param {(stand: { verbunden: boolean, token?: string, port?: number }) => void} melder
 * @returns {void}
 */
export function aufKanalStatus(melder) {
  statusMelder = melder;
}

/**
 * Öffnet den Kanal zum lokalen Server. Ein bereits offener Kanal wird ersetzt.
 * @param {string} token
 * @param {number} [port]
 * @returns {{ token: string, port: number }}
 */
export function kanalStarten(token, port = BRIDGE_PORT) {
  kanalStoppen();
  const basis = `http://127.0.0.1:${port}`;

  /** @type {EventSource} */
  const quelle = new EventSource(`${basis}/events?token=${encodeURIComponent(token)}`);

  quelle.addEventListener('open', () => {
    showToast('Agent verbunden — schreibbereit', 'info');
    statusMelder({ verbunden: true, token, port });
  });

  /* EventSource versucht es selbst weiter; jeder Fehlversuch ist nur ein Status. */
  quelle.addEventListener('error', () => {
    statusMelder({ verbunden: false, token, port });
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

  aktuelle = { token, port, beenden: () => quelle.close() };
  return { token, port };
}

/**
 * Schließt den Kanal. Ohne Kanal passiert nichts.
 * @returns {void}
 */
export function kanalStoppen() {
  if (!aktuelle) return;
  aktuelle.beenden();
  aktuelle = null;
  statusMelder({ verbunden: false });
}

/**
 * Steht der Kanal gerade? (Für die Anzeige, nicht für die Verbindung.)
 * @returns {boolean}
 */
export function kanalOffen() {
  return aktuelle !== null;
}
