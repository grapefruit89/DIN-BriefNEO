#!/usr/bin/env node
// tools/mcp-live.mjs — MCP-Server (stdio) für einen ganz normalen Browser-Tab.
//
// Warum: ein Agent im Terminal sieht die Seite nicht. Statt einem Browser mit
// Debug-Port dreht dieser Server die Richtung um:
// **die Seite ruft an.** Ein Tab, der mit `#agent=<token>` geöffnet wurde,
// hängt an einem Server-Sent-Events-Kanal; dieser Server nimmt MCP über stdio
// an und schiebt die Aufrufe durch den Kanal.
//
//   Agent --MCP/stdio--> mcp-live.mjs --SSE--> Tab (live-bridge.js) -> dinApi
//
// Zero-Dependency: nur node:-Module. Kein Debug-Port, kein Flag, kein npm.
//
// Aufruf:
//   node tools/mcp-live.mjs                     # startet Kanal + MCP
//   node tools/mcp-live.mjs --check             # Status und Öffnungs-URL
//   node tools/mcp-live.mjs --url=http://127.0.0.1:8088/website/index.html

import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import net from 'node:net';
import { createInterface } from 'node:readline';

import { werkzeugListe } from '../website/js/webmcp.js';

const NAME = 'din-briefneo-live';
const VERSION = '1.0.0';
const PROTOKOLL = '2025-06-18';
const PORT = 8765;
const APP_URL = 'https://grapefruit89.github.io/DIN-BriefNEO/';

const argumente = process.argv.slice(2);
const wert = (name, fallback) => {
  const treffer = argumente.find((a) => a.startsWith(`${name}=`));
  return treffer ? treffer.slice(name.length + 1) : fallback;
};

const optionen = {
  url: wert('--url', APP_URL),
  token: wert('--token', randomBytes(4).toString('hex')),
  port: Number(wert('--port', '0')),
  pruefen: argumente.includes('--check')
};

/**
 * Belegt? Ein fremdes Programm auf 8765 darf den Kanal nicht blockieren.
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function belegt(port) {
  return new Promise((loesen) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    const fertig = (/** @type {boolean} */ istBelegt) => {
      socket.destroy();
      loesen(istBelegt);
    };
    socket.setTimeout(600, () => fertig(false));
    socket.once('connect', () => fertig(true));
    socket.once('error', () => fertig(false));
  });
}

/** @returns {Promise<number>} */
async function freierPort() {
  if (optionen.port > 0) return optionen.port;
  for (const kandidat of [PORT, 8766, 8775, 8785, 8795]) {
    if (!(await belegt(kandidat))) return kandidat;
  }
  throw new Error(
    'Kein freier Port für den Kanal. Starte mit --port=<port> und öffne die Seite mit #agent=<token>@<port>.'
  );
}

/** @param {...unknown} teile */
function log(...teile) {
  process.stderr.write(`[${NAME}-mcp] ${teile.join(' ')}\n`);
}

/**
 * Die Adresse, die ein Tab öffnen muss. Der Port steht im Hash, sobald er von
 * der Vorgabe abweicht — die Seite liest beides aus `location.hash`.
 * @returns {string}
 */
function oeffnen() {
  const marker = optionen.port === PORT ? '' : `@${optionen.port}`;
  return `${optionen.url}#agent=${optionen.token}${marker}`;
}

/** @type {import('node:http').ServerResponse | null} */
let kanal = null;
/** @type {Map<string, (ergebnis: unknown) => void>} */
const offen = new Map();
let naechsteId = 0;

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} koerper
 */
function json(res, status, koerper) {
  const text = JSON.stringify(koerper);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  res.end(text);
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 */
function leer(res, status) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  });
  res.end();
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<any>}
 */
async function koerper(req) {
  /** @type {Buffer[]} */
  const teile = [];
  for await (const stueck of req) teile.push(Buffer.from(stueck));
  const text = Buffer.concat(teile).toString('utf8');
  return text ? JSON.parse(text) : {};
}

/**
 * Schickt einen Werkzeugaufruf an den Tab und wartet auf die Antwort.
 * @param {string} name
 * @param {Record<string, unknown>} eingabe
 * @param {number} timeoutMs
 * @returns {Promise<unknown>}
 */
function anSeiteSenden(name, eingabe, timeoutMs = 90000) {
  if (!kanal) {
    throw new Error(`Kein Tab verbunden. Öffne ${oeffnen()}`);
  }
  naechsteId += 1;
  const id = String(naechsteId);
  const ziel = kanal;
  return new Promise((loesen, ablehnen) => {
    const frist = setTimeout(() => {
      offen.delete(id);
      ablehnen(new Error(`Zeitüberschreitung: ${name}`));
    }, timeoutMs);
    offen.set(id, (ergebnis) => {
      clearTimeout(frist);
      loesen(ergebnis);
    });
    ziel.write(`event: call\ndata: ${JSON.stringify({ id, name, arguments: eingabe })}\n\n`);
  });
}

/* ------------------------------------------------------------------ HTTP-Kanal */

const server = createServer(async (req, res) => {
  const adresse = new URL(req.url || '/', `http://127.0.0.1:${optionen.port}`);
  const pfad = adresse.pathname;

  if (req.method === 'OPTIONS') {
    leer(res, 204);
    return;
  }

  if (pfad === '/health') {
    json(res, 200, {
      ok: true,
      tab: Boolean(kanal),
      werkzeuge: werkzeugListe().length,
      oeffnen: oeffnen()
    });
    return;
  }

  if (pfad === '/events') {
    if (adresse.searchParams.get('token') !== optionen.token) {
      json(res, 403, { ok: false, fehler: 'falsches Token' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no'
    });
    res.write('event: ready\ndata: {}\n\n');
    kanal = res;
    log('Tab verbunden');
    const takt = setInterval(() => {
      res.write(': ping\n\n');
    }, 20000);
    req.on('close', () => {
      clearInterval(takt);
      if (kanal === res) {
        kanal = null;
        log('Tab getrennt');
      }
    });
    return;
  }

  if (pfad === '/result' && req.method === 'POST') {
    try {
      const daten = await koerper(req);
      if (daten.token !== optionen.token) {
        json(res, 403, { ok: false, fehler: 'falsches Token' });
        return;
      }
      const fertig = offen.get(String(daten.id));
      if (!fertig) {
        json(res, 404, { ok: false, fehler: 'unbekannte Aufruf-ID' });
        return;
      }
      offen.delete(String(daten.id));
      fertig(daten.result);
      json(res, 200, { ok: true });
    } catch (problem) {
      json(res, 400, { ok: false, fehler: problem instanceof Error ? problem.message : String(problem) });
    }
    return;
  }

  json(res, 404, { ok: false, fehler: 'unbekannter Pfad' });
});

/* --------------------------------------------------------------- MCP-Protokoll */

/**
 * @param {any} nachricht
 * @returns {Promise<any | null>}
 */
async function bearbeiten(nachricht) {
  const { id, method, params = {} } = nachricht;
  if (id === undefined) return null;
  try {
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: typeof params.protocolVersion === 'string' ? params.protocolVersion : PROTOKOLL,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: NAME, version: VERSION },
          instructions:
            `Schreibt DIN-5008-Briefe in einem offenen Browser-Tab. Der Tab muss ${oeffnen()} geöffnet haben. brief_schreiben füllt den Brief, brief_lesen liest ihn.`
        }
      };
    }
    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
    if (method === 'tools/list') {
      // Dieselbe Liste, die die Seite für WebMCP registriert — keine Kopie.
      return { jsonrpc: '2.0', id, result: { tools: werkzeugListe() } };
    }
    if (method === 'tools/call') {
      const name = String(params.name || '');
      const eingabe = typeof params.arguments === 'object' && params.arguments !== null ? params.arguments : {};
      const ergebnis = await anSeiteSenden(name, eingabe);
      const fehler = ergebnis && typeof ergebnis === 'object' && /** @type {any} */ (ergebnis).ok === false;
      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(ergebnis, null, 2) }], isError: Boolean(fehler) }
      };
    }
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Methode nicht unterstützt: ${method}` } };
  } catch (problem) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: problem instanceof Error ? problem.message : String(problem) }
    };
  }
}

optionen.port = await freierPort();
await new Promise((loesen) => server.listen(optionen.port, '127.0.0.1', () => loesen(undefined)));
if (optionen.pruefen) {
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        kanal: `http://127.0.0.1:${optionen.port}`,
        tab: Boolean(kanal),
        werkzeuge: werkzeugListe().map((werkzeug) => werkzeug.name),
        oeffnen: oeffnen()
      },
      null,
      2
    )}\n`
  );
  process.exit(0);
}

log(`Kanal: http://127.0.0.1:${optionen.port}`);
log(`Öffnen: ${oeffnen()}`);
log(`${werkzeugListe().length} Werkzeuge`);

const zeilen = createInterface({ input: process.stdin, crlfDelay: Number.POSITIVE_INFINITY });
let kette = Promise.resolve();
zeilen.on('line', (zeile) => {
  const text = zeile.trim();
  if (!text) return;
  kette = kette.then(async () => {
    let nachricht;
    try {
      nachricht = JSON.parse(text);
    } catch {
      process.stdout.write(
        `${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON nicht lesbar' } })}\n`
      );
      return;
    }
    const antwort = await bearbeiten(nachricht);
    if (antwort) process.stdout.write(`${JSON.stringify(antwort)}\n`);
  });
});
zeilen.on('close', () => {
  void kette.then(() => process.exit(0));
});
