#!/usr/bin/env node
// tools/mcp-dinbrief.mjs — MCP-Server (stdio) für DIN-BriefNEO.
//
// Warum: WebMCP wirkt nur in einem Client, der die Seite besucht. Ein Agent in
// der Kommandozeile (Claude Code, opencode, Codex, …) spricht MCP. Diese Datei
// ist die Brücke: sie startet oder findet ein Chrome mit DevTools-Protokoll,
// öffnet die Seite und reicht tools/list + tools/call an `window.dinBriefAgent`
// durch — dieselbe Werkzeugliste, die auch WebMCP registriert (webmcp.js).
//
// Zero-Dependency: node:fs, node:path, node:os, node:child_process sowie die
// globalen `fetch` und `WebSocket` (Node 22+). Kein npm install, kein Build.
//
// Aufruf:
//   node tools/mcp-dinbrief.mjs                 # MCP über stdio
//   node tools/mcp-dinbrief.mjs --check         # Verbindung + Werkzeuge prüfen
//   node tools/mcp-dinbrief.mjs --url=http://127.0.0.1:8088/website/index.html
//   node tools/mcp-dinbrief.mjs --no-launch     # eigenes Chrome auf :9222 nutzen

import { spawn } from 'node:child_process';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';

import { findBrowser } from './browser.mjs';

const NAME = 'din-briefneo';
const VERSION = '1.0.0';
const PROTOKOLL = '2025-06-18';
const APP_URL = 'https://grapefruit89.github.io/DIN-BriefNEO/';

/* ------------------------------------------------------------------ Optionen */

const argumente = process.argv.slice(2);
const wert = (name, fallback) => {
  const treffer = argumente.find((a) => a.startsWith(`${name}=`));
  return treffer ? treffer.slice(name.length + 1) : fallback;
};

const optionen = {
  cdp: wert('--cdp', ''),
  url: wert('--url', APP_URL),
  browser: wert('--browser', ''),
  profil: wert('--profile', ''),
  starten: !argumente.includes('--no-launch'),
  pruefen: argumente.includes('--check')
};

/* 9222 ist der dokumentierte Helium-Port; belegt ihn ein anderes Programm
   (unter Windows z. B. ein fremder Chrome), geht die Suche weiter. */
const PORT_KANDIDATEN = ['9222', '9333', '9444', '9555'];

/** @type {{ basis: string, port: string } | null} */
let ziel = null;

/**
 * @param {string} port
 * @returns {string}
 */
function cdpBasis(port) {
  return `http://127.0.0.1:${port}`;
}

/** @param {...unknown} teile */
function log(...teile) {
  process.stderr.write(`[${NAME}-mcp] ${teile.join(' ')}\n`);
}

/* ---------------------------------------------------------------- CDP-Client */

class Cdp {
  /** @param {WebSocket} socket */
  constructor(socket) {
    this.socket = socket;
    this.naechsteId = 0;
    /** @type {Map<number, {loesen: (v: any) => void, ablehnen: (e: Error) => void}>} */
    this.offen = new Map();
    socket.addEventListener('message', (ereignis) => {
      let nachricht;
      try {
        nachricht = JSON.parse(String(ereignis.data));
      } catch {
        return;
      }
      if (nachricht.id === undefined) return;
      const eintrag = this.offen.get(nachricht.id);
      if (!eintrag) return;
      this.offen.delete(nachricht.id);
      if (nachricht.error) eintrag.ablehnen(new Error(nachricht.error.message || 'CDP-Fehler'));
      else eintrag.loesen(nachricht.result ?? {});
    });
  }

  /**
   * @param {string} url
   * @returns {Promise<Cdp>}
   */
  static async verbinden(url) {
    const socket = new WebSocket(url);
    await new Promise((loesen, ablehnen) => {
      const frist = setTimeout(() => ablehnen(new Error(`CDP-WebSocket antwortet nicht: ${url}`)), 8000);
      socket.addEventListener('open', () => {
        clearTimeout(frist);
        loesen(undefined);
      });
      socket.addEventListener('error', () => {
        clearTimeout(frist);
        ablehnen(new Error(`CDP-WebSocket nicht erreichbar: ${url}`));
      });
    });
    return new Cdp(socket);
  }

  /**
   * @param {string} method
   * @param {Record<string, unknown>} [params]
   * @param {string} [sessionId]
   * @param {number} [timeoutMs]
   * @returns {Promise<any>}
   */
  send(method, params = {}, sessionId, timeoutMs = 30000) {
    this.naechsteId += 1;
    const id = this.naechsteId;
    /** @type {Record<string, unknown>} */
    const paket = { id, method, params };
    if (sessionId) paket.sessionId = sessionId;
    return new Promise((loesen, ablehnen) => {
      const frist = setTimeout(() => {
        this.offen.delete(id);
        ablehnen(new Error(`CDP-Timeout: ${method}`));
      }, timeoutMs);
      this.offen.set(id, {
        loesen: (v) => {
          clearTimeout(frist);
          loesen(v);
        },
        ablehnen: (e) => {
          clearTimeout(frist);
          ablehnen(e);
        }
      });
      this.socket.send(JSON.stringify(paket));
    });
  }

  schliessen() {
    try {
      this.socket.close();
    } catch {
      /* egal */
    }
  }
}

/* -------------------------------------------------------------- Browserstart */

/**
 * @returns {string}
 */
function profilVerzeichnis() {
  if (optionen.profil) return path.resolve(optionen.profil);
  const basis = process.env.LOCALAPPDATA || os.homedir();
  return path.join(basis, 'din-briefneo', 'agent-profile');
}

/**
 * @param {string} basis
 * @returns {Promise<any | null>}
 */
async function cdpVersionUnter(basis) {
  try {
    const antwort = await fetch(`${basis}/json/version`, { signal: AbortSignal.timeout(1500) });
    if (!antwort.ok) return null;
    const version = await antwort.json();
    return typeof version.webSocketDebuggerUrl === 'string' ? version : null;
  } catch {
    return null;
  }
}

/**
 * Belegt? Dann darf dort kein zweiter Browser starten. Ein belegter Port ohne
 * DevTools ist der Normalfall unter Windows (fremdes Chrome auf 9222).
 * @param {string} port
 * @returns {Promise<boolean>}
 */
function portBelegt(port) {
  return new Promise((loesen) => {
    const socket = net.connect({ host: '127.0.0.1', port: Number(port) });
    const fertig = (/** @type {boolean} */ belegt) => {
      socket.destroy();
      loesen(belegt);
    };
    socket.setTimeout(800, () => fertig(false));
    socket.once('connect', () => fertig(true));
    socket.once('error', () => fertig(false));
  });
}

/**
 * Wartet bis Chrome sein DevTools-Protokoll anbietet.
 * @param {string} basis
 * @param {number} timeoutMs
 * @returns {Promise<any>}
 */
async function warteAufCdp(basis, timeoutMs = 25000) {
  const ende = Date.now() + timeoutMs;
  while (Date.now() < ende) {
    const version = await cdpVersionUnter(basis);
    if (version) return version;
    await new Promise((loesen) => setTimeout(loesen, 250));
  }
  throw new Error(`Chrome bietet CDP nicht an: ${basis}`);
}

/**
 * @param {string} port
 * @returns {Promise<any>}
 */
async function starteChrome(port) {
  const binaer = optionen.browser || findBrowser();
  if (!binaer) {
    throw new Error('Kein Chrome/Chromium gefunden. Setze --browser=<pfad> oder CHROME_BIN.');
  }

  const profil = profilVerzeichnis();
  log(`starte ${binaer} (CDP ${port}, Profil ${profil})`);
  const kind = spawn(
    binaer,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profil}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--new-window',
      optionen.url
    ],
    { detached: true, stdio: 'ignore' }
  );
  kind.unref();
  return warteAufCdp(cdpBasis(port));
}

/**
 * Findet ein laufendes CDP oder startet einen eigenen Browser.
 * Der eigene Start nutzt ein eigenes Profil, damit ein bereits laufendes
 * Chrome (Standardprofil) den Debug-Port nicht stillschweigend ignoriert.
 * @returns {Promise<any>}
 */
async function sichererBrowser() {
  if (optionen.cdp) {
    const basis = optionen.cdp.replace(/\/+$/, '');
    const laufend = await cdpVersionUnter(basis);
    if (laufend) {
      ziel = { basis, port: new URL(basis).port || '9222' };
      return laufend;
    }
    if (!optionen.starten) {
      throw new Error(
        `Kein CDP unter ${basis}. Starte Chrome mit --remote-debugging-port oder lass den Server selbst starten (ohne --no-launch).`
      );
    }
    const port = new URL(basis).port || '9222';
    if (await portBelegt(port)) {
      throw new Error(
        `Port ${port} ist belegt, antwortet aber nicht als DevTools-Endpunkt. Nimm einen anderen Port: --cdp=http://127.0.0.1:9333`
      );
    }
    ziel = { basis, port };
    return starteChrome(port);
  }

  for (const port of PORT_KANDIDATEN) {
    const basis = cdpBasis(port);
    const laufend = await cdpVersionUnter(basis);
    if (laufend) {
      ziel = { basis, port };
      log(`nutze vorhandenes CDP auf ${basis}`);
      return laufend;
    }
    if (await portBelegt(port)) continue;
    if (!optionen.starten) continue;
    ziel = { basis, port };
    return starteChrome(port);
  }

  throw new Error(
    `Kein freies CDP-Ziel (${PORT_KANDIDATEN.join(', ')}). Starte Chrome mit --remote-debugging-port und --user-data-dir selbst.`
  );
}

/* ------------------------------------------------------------------ Seitensitzung */

/**
 * @param {string} kandidat
 * @returns {boolean}
 */
function istAppSeite(kandidat) {
  try {
    const ziel = new URL(optionen.url);
    const seite = new URL(kandidat);
    return seite.origin === ziel.origin && seite.pathname === ziel.pathname;
  } catch {
    return false;
  }
}

/**
 * Verankert sich an der App-Seite und wartet auf `dinBriefAgent`.
 * @param {Cdp} cdp
 * @returns {Promise<{ sessionId: string, targetId: string }>}
 */
async function seiteOeffnen(cdp) {
  const { targetInfos } = await cdp.send('Target.getTargets');
  const vorhanden = targetInfos.find((ziel) => ziel.type === 'page' && istAppSeite(ziel.url));
  const targetId = vorhanden
    ? vorhanden.targetId
    : (await cdp.send('Target.createTarget', { url: optionen.url })).targetId;

  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId).catch(() => {});

  const ende = Date.now() + 25000;
  while (Date.now() < ende) {
    const bereit = await auswerten(cdp, sessionId, 'typeof window.dinBriefAgent?.run === "function"').catch(
      () => false
    );
    if (bereit === true) return { sessionId, targetId };
    await new Promise((loesen) => setTimeout(loesen, 250));
  }
  throw new Error(
    `Die Seite meldet kein window.dinBriefAgent: ${optionen.url}. Läuft dort die aktuelle Version?`
  );
}

/**
 * @param {Cdp} cdp
 * @param {string} sessionId
 * @param {string} ausdruck
 * @returns {Promise<any>}
 */
async function auswerten(cdp, sessionId, ausdruck) {
  const antwort = await cdp.send(
    'Runtime.evaluate',
    { expression: ausdruck, awaitPromise: true, returnByValue: true },
    sessionId
  );
  if (antwort.exceptionDetails) {
    const detail = antwort.exceptionDetails;
    throw new Error(detail.exception?.description || detail.text || 'Fehler in der Seite');
  }
  return antwort.result?.value;
}

/* ------------------------------------------------------------------ MCP-Protokoll */

/**
 * @param {any} ergebnis
 * @param {boolean} [fehler]
 */
function alsInhalt(ergebnis, fehler = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(ergebnis, null, 2) }],
    isError: fehler
  };
}

async function main() {
  const version = await sichererBrowser();
  log(`Browser: ${version.Browser || 'unbekannt'} · ${ziel?.basis ?? '?'}`);
  const cdp = await Cdp.verbinden(version.webSocketDebuggerUrl);
  const sitzung = await seiteOeffnen(cdp);
  log(`Seite: ${optionen.url}`);

  const seitenWerkzeuge = await auswerten(cdp, sitzung.sessionId, 'window.dinBriefAgent.werkzeuge()');
  if (!Array.isArray(seitenWerkzeuge) || seitenWerkzeuge.length === 0) {
    throw new Error('window.dinBriefAgent liefert keine Werkzeuge.');
  }
  /* Eine Werkzeugliste fuer beide Transporte: was die Seite kann, kann der
     Agent — nichts kommt aus der Bruecke dazu. */
  const alle = seitenWerkzeuge;
  log(`${alle.length} Werkzeuge bereit: ${alle.map((w) => w.name).join(', ')}`);

  if (optionen.pruefen) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          browser: version.Browser,
          cdp: ziel?.basis,
          url: optionen.url,
          werkzeuge: alle.map((w) => w.name),
          appVersion: await auswerten(cdp, sitzung.sessionId, 'window.dinBriefAgent.version')
        },
        null,
        2
      )}\n`
    );
    cdp.schliessen();
    return;
  }

  /**
   * @param {string} name
   * @param {Record<string, unknown>} eingabe
   * @returns {Promise<Record<string, unknown>>}
   */
  async function aufrufen(name, eingabe) {
    if (!seitenWerkzeuge.some((werkzeug) => werkzeug.name === name)) {
      return { ok: false, fehler: `unbekanntes Werkzeug "${name}"` };
    }
    // JSON.stringify ist die sichere Grenze: kein Ausdruck, den ein Agent
    // schmuggeln könnte, nur Daten.
    return auswerten(
      cdp,
      sitzung.sessionId,
      `window.dinBriefAgent.run(${JSON.stringify(name)}, ${JSON.stringify(eingabe)})`
    );
  }

  /**
   * @param {any} nachricht
   * @returns {Promise<any | null>}
   */
  async function bearbeiten(nachricht) {
    const { id, method, params = {} } = nachricht;
    if (id === undefined) return null; // Notification: keine Antwort
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
              'DIN-BriefNEO schreibt DIN-5008-Briefe im Browser. brief_schreiben füllt den ganzen Brief, brief_pruefen findet Fehler, brief_lesen liest ihn zurück. Feld-IDs liefert brief_hilfe.'
          }
        };
      }
      if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
      if (method === 'tools/list') {
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: alle }
        };
      }
      if (method === 'tools/call') {
        const name = String(params.name || '');
        const eingabe = typeof params.arguments === 'object' && params.arguments !== null ? params.arguments : {};
        const ergebnis = await aufrufen(name, eingabe);
        const fehler = ergebnis && typeof ergebnis === 'object' && ergebnis.ok === false;
        return { jsonrpc: '2.0', id, result: alsInhalt(ergebnis, Boolean(fehler)) };
      }
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Methode nicht unterstützt: ${method}` }
      };
    } catch (problem) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: problem instanceof Error ? problem.message : String(problem) }
      };
    }
  }

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
    void kette.then(() => {
      cdp.schliessen();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    cdp.schliessen();
    process.exit(0);
  });
}

main().catch((problem) => {
  log(`Fehler: ${problem instanceof Error ? problem.message : String(problem)}`);
  process.exit(1);
});
