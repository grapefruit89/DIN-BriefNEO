#!/usr/bin/env node
// tools/runtime/mcp-live.mjs — MCP-Server (stdio) für einen ganz normalen Browser-Tab.
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
//   node tools/mcp-live.mjs                     (Shim; dev.sh, settings.js)
//   node tools/runtime/mcp-live.mjs --check     # Status und Öffnungs-URL
//   node tools/runtime/mcp-live.mjs --url=http://127.0.0.1:8088/website/index.html

import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

import { werkzeugListe } from '../../website/js/webmcp.js';

const NAME = 'din-briefneo-live';
const VERSION = '1.0.0';
const PROTOKOLL = '2025-06-18';
const PORT = 8765;
const APP_URL = 'https://grapefruit89.github.io/DIN-BriefNEO/';

/**
 * Startet den Live-Kanal und bedient MCP auf stdio.
 * Löst erst auf, wenn stdin schließt (Agent beendet) oder `--check` fertig ist.
 * @param {string[]} [argumente] Argumente ohne `node` und Skriptpfad
 * @returns {Promise<number>} Exit-Code
 */
export async function startLive(argumente = process.argv.slice(2)) {
  const wert = (name, fallback) => {
    const treffer = argumente.find((a) => a.startsWith(`${name}=`));
    return treffer ? treffer.slice(name.length + 1) : fallback;
  };

  const tokenWert = wert('--token', '');
  const optionen = {
    url: wert('--url', APP_URL),
    token: tokenWert && tokenWert.trim() ? tokenWert.trim() : randomBytes(16).toString('hex'),
    port: Number(wert('--port', '0')),
    pruefen: argumente.includes('--check')
  };

  /**
   * Vergleicht Tokens zeitkonstant (Schutz gegen Timing-Angriffe).
   * @param {string | null | undefined} kandidat
   * @returns {boolean}
   */
  function tokenGueltig(kandidat) {
    if (typeof kandidat !== 'string' || !kandidat) return false;
    const a = Buffer.from(kandidat);
    const b = Buffer.from(optionen.token);
    return a.length === b.length && timingSafeEqual(a, b);
  }

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

  /**
   * CORS- und PNA-Header für den lokalen Loopback-Server.
   * @param {import('node:http').IncomingMessage | null} [req]
   * @returns {Record<string, string>}
   */
  function corsHeaders(req = null) {
    const origin = req?.headers?.origin || '';
    const istErlaubt =
      !origin ||
      origin === 'null' ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://localhost:') ||
      origin === 'https://grapefruit89.github.io';
    return {
      'Access-Control-Allow-Origin': istErlaubt ? origin || '*' : 'https://grapefruit89.github.io',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Private-Network': 'true',
      'Cache-Control': 'no-store'
    };
  }

  /** @type {import('node:http').ServerResponse | null} */
  let kanal = null;
  /** @type {Map<string, { loesen: (ergebnis: unknown) => void, ablehnen: (fehler: Error) => void }>} */
  const offen = new Map();
  let naechsteId = 0;

  /**
   * @param {import('node:http').ServerResponse} res
   * @param {number} status
   * @param {unknown} koerper
   * @param {import('node:http').IncomingMessage | null} [req]
   */
  function json(res, status, koerper, req = null) {
    const text = JSON.stringify(koerper);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(text),
      ...corsHeaders(req)
    });
    res.end(text);
  }

  /**
   * @param {import('node:http').ServerResponse} res
   * @param {number} status
   * @param {import('node:http').IncomingMessage | null} [req]
   */
  function leer(res, status, req = null) {
    res.writeHead(status, corsHeaders(req));
    res.end();
  }

  /**
   * @param {import('node:http').IncomingMessage} req
   * @returns {Promise<any>}
   */
  async function koerper(req) {
    /** @type {Buffer[]} */
    const teile = [];
    let bytes = 0;
    for await (const stueck of req) {
      bytes += stueck.length;
      if (bytes > 1024 * 1024) throw new Error('Anfragekörper zu groß (> 1 MB)');
      teile.push(Buffer.from(stueck));
    }
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
      offen.set(id, {
        loesen: (ergebnis) => {
          clearTimeout(frist);
          loesen(ergebnis);
        },
        ablehnen: (fehler) => {
          clearTimeout(frist);
          ablehnen(fehler);
        }
      });
      ziel.write(`event: call\ndata: ${JSON.stringify({ id, name, arguments: eingabe })}\n\n`);
    });
  }

  /* ---------------------------------------------------------------- HTTP-Kanal */

  const server = createServer(async (req, res) => {
    let adresse;
    try {
      adresse = new URL(req.url || '/', `http://127.0.0.1:${optionen.port}`);
    } catch {
      json(res, 400, { ok: false, fehler: 'ungültige URL' }, req);
      return;
    }
    const pfad = adresse.pathname;

    if (req.method === 'OPTIONS') {
      leer(res, 204, req);
      return;
    }

    if (pfad === '/health') {
      // Sicherheitsinvariante: kein Token/URL im unauthentifizierten /health leaken!
      json(
        res,
        200,
        {
          ok: true,
          tab: Boolean(kanal),
          werkzeuge: werkzeugListe().length
        },
        req
      );
      return;
    }

    if (pfad === '/events') {
      if (!tokenGueltig(adresse.searchParams.get('token'))) {
        json(res, 403, { ok: false, fehler: 'falsches Token' }, req);
        return;
      }

      // Wenn ein neuer Tab kommt, den alten Stream sauber schließen
      if (kanal && kanal !== res && !kanal.destroyed && !kanal.writableEnded) {
        try {
          kanal.write('event: close\ndata: {"grund":"neuer Tab verbunden"}\n\n');
          kanal.end();
        } catch {
          /* ignorieren */
        }
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        ...corsHeaders(req)
      });
      res.write('event: ready\ndata: {}\n\n');
      kanal = res;
      log('Tab verbunden');

      const takt = setInterval(() => {
        if (res.writableEnded || res.destroyed) {
          clearInterval(takt);
          return;
        }
        res.write(': ping\n\n');
      }, 20000);

      req.on('close', () => {
        clearInterval(takt);
        if (kanal === res) {
          kanal = null;
          log('Tab getrennt');
          // Offene Anfragen sofort abweisen statt 90s zu warten
          for (const [id, eintrag] of offen.entries()) {
            offen.delete(id);
            eintrag.ablehnen(new Error('Tab getrennt während Werkzeugaufruf'));
          }
        }
      });
      return;
    }

    if (pfad === '/result' && req.method === 'POST') {
      try {
        const daten = await koerper(req);
        if (!tokenGueltig(daten.token)) {
          json(res, 403, { ok: false, fehler: 'falsches Token' }, req);
          return;
        }
        const eintrag = offen.get(String(daten.id));
        if (!eintrag) {
          json(res, 404, { ok: false, fehler: 'unbekannte Aufruf-ID' }, req);
          return;
        }
        offen.delete(String(daten.id));
        eintrag.loesen(daten.result);
        json(res, 200, { ok: true }, req);
      } catch (problem) {
        json(res, 400, { ok: false, fehler: problem instanceof Error ? problem.message : String(problem) }, req);
      }
      return;
    }

    json(res, 404, { ok: false, fehler: 'unbekannter Pfad' }, req);
  });

  /* ------------------------------------------------------------- MCP-Protokoll */

  /**
   * @param {any} nachricht
   * @returns {Promise<any | null>}
   */
  async function bearbeiten(nachricht) {
    if (!nachricht || typeof nachricht !== 'object' || Array.isArray(nachricht)) {
      return { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Ungültige JSON-RPC-Nachricht' } };
    }
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
        try {
          const ergebnis = await anSeiteSenden(name, eingabe);
          const fehler = ergebnis && typeof ergebnis === 'object' && /** @type {any} */ (ergebnis).ok === false;
          return {
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: JSON.stringify(ergebnis, null, 2) }], isError: Boolean(fehler) }
          };
        } catch (callProblem) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: callProblem instanceof Error ? callProblem.message : String(callProblem) }],
              isError: true
            }
          };
        }
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
    await new Promise((loesen) => server.close(() => loesen(undefined)));
    return 0;
  }

  log(`Kanal: http://127.0.0.1:${optionen.port}`);
  log(`Öffnen: ${oeffnen()}`);
  log(`${werkzeugListe().length} Werkzeuge`);

  await new Promise((loesen) => {
    const zeilen = createInterface({ input: process.stdin, crlfDelay: Number.POSITIVE_INFINITY });
    let kette = Promise.resolve();
    zeilen.on('line', (zeile) => {
      const text = zeile.trim();
      if (!text) return;
      kette = kette
        .then(async () => {
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
        })
        .catch((problem) => {
          log('Unerwarteter Stdio-Fehler:', problem instanceof Error ? problem.message : String(problem));
        });
    });
    zeilen.on('close', () => {
      void kette.then(() => {
        try {
          kanal?.end();
        } catch {
          /* egal */
        }
        server.closeAllConnections?.();
        server.close(() => loesen(undefined));
      });
    });
  });

  return 0;
}

const direkt = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direkt) process.exitCode = await startLive();
