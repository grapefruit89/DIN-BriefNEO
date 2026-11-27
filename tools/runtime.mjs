#!/usr/bin/env node
/**
 * tools/runtime.mjs — Konsolidiertes Laufzeit- & Test-Modul für DIN-BriefNEO.
 *
 * Verschmilzt in einer Datei:
 *   - Browser-Erkennung (findBrowser)
 *   - Zero-Dependency No-Cache HTTP-Server mit Dual-Root (startStaticServer / startServer)
 *   - Headless-Chromium Launcher mit flüchtigem Profil (launch)
 *   - Minimaler WebSocket/JSON-RPC CDP-Client (findeSeite, browserInfo, verbinde)
 *   - Unit-Test-Runner für test/index.html (runTests)
 *   - MCP-Live-Kanal über SSE/stdio für Live-Browser-Inspektion (startLive)
 *   - Virgin-State Debug-Session mit Flight-Recorder (debugSession)
 *   - Geoapify Secret Seeder (seedGeoapify)
 *   - DIN-Home Initialisierer (setupDinHome)
 *
 * CLI:
 *   node tools/runtime.mjs [test] [flags]
 *   node tools/runtime.mjs serve [port]
 *   node tools/runtime.mjs live [--check] [--url=...]
 *   node tools/runtime.mjs debug [--test] [--headless]
 *   node tools/runtime.mjs seed-key [--port 9222]
 *   node tools/runtime.mjs setup-home
 */

import { execSync, spawn } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

import { werkzeugListe } from '../website/js/webmcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '..');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ==================================================================
   1. Browser-Erkennung
   ================================================================== */

/**
 * Sucht das Binärprogramm; absolute Pfade zuerst.
 * @returns {string | null}
 */
export function findBrowser() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const absolut = [
    '/usr/bin/helium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/opt/google/chrome/chrome',
  ];
  for (const p of absolut) if (existsSync(p)) return p;

  const mac = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    `${process.env.HOME || ''}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ];
  for (const p of mac) if (existsSync(p)) return p;

  const windows = [
    path.join(process.env.ProgramFiles || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.ProgramFiles || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ];
  for (const p of windows) if (existsSync(p)) return p;

  for (const name of ['helium', 'chromium', 'google-chrome', 'chrome', 'chrome.exe', 'msedge.exe']) {
    for (const dir of (process.env.PATH || '').split(path.delimiter)) {
      const p = path.join(dir, name);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

/* ==================================================================
   2. Static HTTP Server (Dual-Root, No-Cache)
   ================================================================== */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.gz': 'application/gzip',
  '.map': 'application/json; charset=utf-8',
};

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function liesDevGeokey() {
  const datei = process.env.DIN_GEOKEY_FILE || path.join(os.homedir(), '.secrets', 'geoapify');
  try {
    if (!existsSync(datei)) return null;
    const wert = readFileSync(datei, 'utf8').trim();
    return wert || null;
  } catch {
    return null;
  }
}

function findeFontsOrdner(root) {
  const repoRoot = path.basename(root) === 'website' ? path.dirname(root) : root;
  const kandidat = path.join(repoRoot, 'fonts');
  try {
    return existsSync(kandidat) && statSync(kandidat).isDirectory() ? kandidat : null;
  } catch {
    return null;
  }
}

function liesLokaleSchriften(ordner) {
  if (!ordner) return [];
  const ERLAUBT = new Set(['.woff2', '.ttf', '.otf']);
  const AUSGELIEFERT = /^(inter|liberationsans)/i;
  let dateien;
  try {
    dateien = readdirSync(ordner);
  } catch {
    return [];
  }
  /** @type {Map<string, { datei: string, ext: string, stem: string }>} */
  const gewaehlt = new Map();
  for (const datei of dateien) {
    if (datei.startsWith('.')) continue;
    const ext = path.extname(datei).toLowerCase();
    if (!ERLAUBT.has(ext)) continue;
    const stem = datei.slice(0, -ext.length);
    if (AUSGELIEFERT.test(stem)) continue;
    const schluessel = stem.toLowerCase().replace(/[\s_]+/g, '-');
    const vorher = gewaehlt.get(schluessel);
    if (!vorher || (ext === '.woff2' && vorher.ext !== '.woff2')) {
      gewaehlt.set(schluessel, { datei, ext, stem });
    }
  }
  return [...gewaehlt.values()]
    .map(({ datei, stem }) => {
      const name = stem
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((wort) => wort.charAt(0).toUpperCase() + wort.slice(1))
        .join(' ');
      return { datei, name, familie: `Lokal-${name.replace(/[^A-Za-z0-9]+/g, '-')}` };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/**
 * @param {string} [root] Absolutpfad, der als Web-Wurzel dient (Default: REPO_ROOT)
 * @param {number} [wunschPort] 0 = freier Port
 * @returns {Promise<{ server: import('node:http').Server, port: number, close: () => Promise<void> }>}
 */
export async function startStaticServer(root = REPO_ROOT, wunschPort = 0) {
  const fontsOrdner = findeFontsOrdner(root);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (url.pathname === '/__geokey') {
      const key = liesDevGeokey();
      if (!key) {
        res.writeHead(404, { ...NO_CACHE, 'Content-Type': 'text/plain; charset=utf-8' }).end('Kein Dev-Key');
        return;
      }
      res.writeHead(200, { ...NO_CACHE, 'Content-Type': 'text/plain; charset=utf-8' }).end(key);
      return;
    }
    if (url.pathname === '/__fonts') {
      const liste = liesLokaleSchriften(fontsOrdner);
      res.writeHead(200, { ...NO_CACHE, 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(liste));
      return;
    }
    let pfad;
    try {
      pfad = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    } catch {
      res.writeHead(400, NO_CACHE).end('Bad Request');
      return;
    }
    let lieferbar = pfad.startsWith(root + path.sep) && existsSync(pfad) && statSync(pfad).isFile();

    if (!lieferbar && fontsOrdner && pfad.includes(`${path.sep}fonts${path.sep}`)) {
      const kandidat = path.join(fontsOrdner, path.basename(pfad));
      if (kandidat.startsWith(fontsOrdner + path.sep) && existsSync(kandidat) && statSync(kandidat).isFile()) {
        pfad = kandidat;
        lieferbar = true;
      }
    }

    if (!lieferbar) {
      res.writeHead(404, { ...NO_CACHE, 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found');
      return;
    }
    const typ = MIME[path.extname(pfad).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { ...NO_CACHE, 'Content-Type': typ });
    res.end(readFileSync(pfad));
  });

  const port = await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(wunschPort, '127.0.0.1', () => resolve(/** @type {import('node:net').AddressInfo} */ (server.address()).port));
  });

  return {
    server,
    port,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

export const startServer = startStaticServer;

/* ==================================================================
   3. Chromium-Launch
   ================================================================== */

/**
 * @param {object} [optionen]
 * @param {boolean} [optionen.headless] true = `--headless=new` (Default)
 * @param {number} [optionen.cdpPort] 0 = freier Port über DevToolsActivePort
 * @param {string} [optionen.url] erste Seite (Default about:blank)
 * @param {string[]} [optionen.args] zusätzliche Chromium-Flags
 * @param {string} [optionen.profilPrefix] mkdtemp-Präfix im Temp-Verzeichnis
 * @param {string | null} [optionen.bin] erzwungenes Binary, sonst findBrowser()
 * @param {number} [optionen.timeoutMs] Wartezeit auf den Debug-Port
 * @returns {Promise<{ bin: string, child: import('node:child_process').ChildProcess, profil: string, cdpPort: number, close: () => Promise<void> }>}
 */
export async function launch({
  headless = true,
  cdpPort = 0,
  url = 'about:blank',
  args = [],
  profilPrefix = 'din-runtime-',
  bin = null,
  timeoutMs = 15000,
} = {}) {
  const programm = bin || findBrowser();
  if (!programm) {
    throw new Error('Kein Chromium gefunden. Setze CHROME_BIN oder installiere chromium/google-chrome.');
  }

  const profil = mkdtempSync(path.join(os.tmpdir(), profilPrefix));
  const child = spawn(
    programm,
    [
      ...(headless ? ['--headless=new', '--disable-gpu', '--no-sandbox'] : []),
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profil}`,
      ...args,
      url,
    ],
    { stdio: 'ignore' },
  );

  const close = async () => {
    try {
      child.kill('SIGKILL');
    } catch {
      /* schon beendet */
    }
    try {
      rmSync(profil, { recursive: true, force: true });
    } catch {
      /* egal */
    }
  };

  const portDatei = path.join(profil, 'DevToolsActivePort');
  const frist = Date.now() + timeoutMs;
  let port = 0;
  while (!port && Date.now() < frist) {
    if (child.exitCode !== null) {
      await close();
      throw new Error(`Browser sofort beendet (Exit ${child.exitCode}).`);
    }
    if (existsSync(portDatei)) {
      port = Number(readFileSync(portDatei, 'utf8').split('\n')[0]) || 0;
    }
    if (!port) await sleep(100);
  }
  if (!port) {
    await close();
    throw new Error('Browser hat keinen Debug-Port geöffnet (DevToolsActivePort fehlt).');
  }

  return { bin: programm, child, profil, cdpPort: port, close };
}

/* ==================================================================
   4. CDP Client
   ================================================================== */

export async function findeSeite(port, auswahl = (ziel) => ziel.type === 'page') {
  const ziele = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const seite = ziele.find(auswahl);
  if (!seite?.webSocketDebuggerUrl) throw new Error('Kein Page-Target am Debug-Port.');
  return seite;
}

export async function browserInfo(port) {
  try {
    return await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  } catch {
    return {};
  }
}

export async function verbinde(webSocketUrl, { onEvent } = {}) {
  const ws = new WebSocket(webSocketUrl);
  /** @type {Map<number, (nachricht: any) => void>} */
  const offen = new Map();
  let naechsteId = 0;

  ws.onmessage = (ereignis) => {
    const nachricht = JSON.parse(ereignis.data);
    if (nachricht.id && offen.has(nachricht.id)) {
      const loesen = offen.get(nachricht.id);
      offen.delete(nachricht.id);
      loesen?.(nachricht);
      return;
    }
    if (nachricht.method) onEvent?.(nachricht.method, nachricht.params ?? {});
  };
  await new Promise((loesen, ablehnen) => {
    ws.onopen = () => loesen(undefined);
    ws.onerror = () => ablehnen(new Error('CDP-WebSocket konnte nicht verbinden.'));
  });

  const send = (method, params = {}) =>
    new Promise((loesen) => {
      const id = ++naechsteId;
      offen.set(id, loesen);
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const antwort = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return antwort?.result?.result?.value;
  };

  return {
    ws,
    send,
    evaluate,
    close: () => {
      try {
        ws.close();
      } catch {
        /* schon zu */
      }
    },
  };
}

/* ==================================================================
   5. Unit-Test-Runner (test/index.html via CDP)
   ================================================================== */

export async function runTests(argv = process.argv.slice(2)) {
  const START = Date.now();
  const flag = (name) => argv.includes(name);
  const value = (name, fallback) => {
    const hit = argv.find((a) => a.startsWith(`${name}=`));
    return hit ? hit.slice(name.length + 1) : fallback;
  };

  const alsJson = flag('--json');
  const filter = value('--filter', '');
  const timeoutMs = Number(value('--timeout', '15000'));
  const browserFehltOk = flag('--allow-missing-browser');

  const tty = Boolean(process.stdout.isTTY);
  const farbe = {
    gruen: (s) => (tty ? `\x1b[32m${s}\x1b[0m` : s),
    rot: (s) => (tty ? `\x1b[31m${s}\x1b[0m` : s),
    grau: (s) => (tty ? `\x1b[90m${s}\x1b[0m` : s),
    fett: (s) => (tty ? `\x1b[1m${s}\x1b[0m` : s),
  };

  const statik = await startStaticServer(REPO_ROOT);
  const serverPort = statik.port;

  if (!findBrowser()) {
    const meldung = 'Kein Chromium gefunden. Setze CHROME_BIN oder installiere chromium/google-chrome.';
    await statik.close();
    if (browserFehltOk) {
      if (alsJson) process.stdout.write(`${JSON.stringify({ ok: true, skipped: true, grund: meldung })}\n`);
      else console.log(farbe.grau(`SKIP: ${meldung}`));
      return 0;
    }
    console.error(farbe.rot(`FEHLER: ${meldung}`));
    return 1;
  }

  const browser = await launch({ headless: true, url: 'about:blank', profilPrefix: 'din-test-runner-' });
  /** @type {Awaited<ReturnType<typeof verbinde>> | null} */
  let cdpx = null;
  const konsolenfehler = [];

  const aufraeumen = async () => {
    cdpx?.close();
    await browser.close();
    await statik.close();
  };

  try {
    const seite = await findeSeite(browser.cdpPort);
    const browserVersion = (await browserInfo(browser.cdpPort))?.Browser || 'unbekannt';

    cdpx = await verbinde(seite.webSocketDebuggerUrl, {
      onEvent(method, params) {
        if (method === 'Runtime.exceptionThrown') {
          konsolenfehler.push(
            params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Exception',
          );
        }
        if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
          const text = params.args.map((a) => a.value ?? a.description ?? '').join(' ');
          if (!text.startsWith('✗')) konsolenfehler.push(text);
        }
      },
    });
    const { send, evaluate } = cdpx;

    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Page.enable');

    const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
    await send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/test/index.html${query}` });

    let ergebnis = null;
    const frist = Date.now() + timeoutMs;
    while (Date.now() < frist) {
      await sleep(200);
      const roh = await evaluate('window.__TEST_RESULTS ? JSON.stringify(window.__TEST_RESULTS) : ""');
      if (roh) {
        ergebnis = JSON.parse(roh);
        break;
      }
    }
    if (!ergebnis) throw new Error(`Timeout: keine Testergebnisse nach ${timeoutMs} ms.`);

    const dauer = Date.now() - START;
    const ok = ergebnis.failed === 0;

    if (alsJson) {
      process.stdout.write(
        `${JSON.stringify({ ok, ...ergebnis, konsolenfehler, browser: browserVersion, dauerMs: dauer }, null, 2)}\n`,
      );
      await aufraeumen();
      return ok ? 0 : 1;
    }

    console.log(farbe.fett('▶ DIN-BriefNEO Test-Suite'));
    console.log(farbe.grau(`  ${browserVersion} · Port ${serverPort} · ${dauer} ms${filter ? ` · Filter: ${filter}` : ''}`));
    console.log('');
    for (const fehler of ergebnis.failures) console.log(farbe.rot(`  ✗ ${fehler}`));
    if (ergebnis.failures.length) console.log('');
    const zusammenfassung = `${ergebnis.passed} bestanden, ${ergebnis.failed} fehlgeschlagen${ergebnis.skipped ? `, ${ergebnis.skipped} übersprungen` : ''} · ${ergebnis.total} gesamt`;
    console.log(ok ? farbe.gruen(`✓ ${zusammenfassung}`) : farbe.rot(`✗ ${zusammenfassung}`));
    if (konsolenfehler.length) {
      console.log('');
      console.log(farbe.grau(`  Konsolenfehler im Testlauf: ${konsolenfehler.length}`));
      for (const f of konsolenfehler.slice(0, 5)) console.log(farbe.grau(`    ${f.split('\n')[0]}`));
    }
    await aufraeumen();
    return ok ? 0 : 1;
  } catch (fehler) {
    const meldung = fehler instanceof Error ? fehler.message : String(fehler);
    await aufraeumen();
    if (alsJson) process.stdout.write(`${JSON.stringify({ ok: false, error: meldung })}\n`);
    else console.error(farbe.rot(`\n✗ Runner-Fehler: ${meldung}`));
    return 1;
  }
}

/* ==================================================================
   6. MCP-Live-Kanal (SSE + stdio)
   ================================================================== */

export async function startLive(argumente = process.argv.slice(2)) {
  const NAME = 'din-briefneo-live';
  const VERSION = '1.0.0';
  const PROTOKOLL = '2025-06-18';
  const APP_URL = 'https://grapefruit89.github.io/DIN-BriefNEO/';

  const wert = (name, fallback) => {
    const treffer = argumente.find((a) => a.startsWith(`${name}=`));
    return treffer ? treffer.slice(name.length + 1) : fallback;
  };

  const tokenWert = wert('--token', '');
  const optionen = {
    url: wert('--url', APP_URL),
    token: tokenWert && tokenWert.trim() ? tokenWert.trim() : randomBytes(16).toString('hex'),
    port: Number(wert('--port', '0')),
    pruefen: argumente.includes('--check'),
  };

  function tokenGueltig(kandidat) {
    if (typeof kandidat !== 'string' || !kandidat) return false;
    const a = Buffer.from(kandidat);
    const b = Buffer.from(optionen.token);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  const log = (...teile) => console.error('[mcp-live]', ...teile);
  let kanal = null;
  const antworten = new Map();
  let aufrufZaehler = 0;

  function sendeSSE(ereignis, daten) {
    if (!kanal || kanal.writableEnded) return false;
    try {
      kanal.write(`event: ${ereignis}\ndata: ${JSON.stringify(daten)}\n\n`);
      return true;
    } catch {
      return false;
    }
  }

  function aufrufAnTab(name, argumenteObj) {
    if (!kanal) {
      return Promise.resolve({
        content: [{ type: 'text', text: 'FEHLER: Kein Browser-Tab verbunden.' }],
        isError: true,
      });
    }
    const id = ++aufrufZaehler;
    return new Promise((loesen) => {
      const timer = setTimeout(() => {
        antworten.delete(id);
        loesen({ content: [{ type: 'text', text: `Timeout nach 15000 ms: ${name}` }], isError: true });
      }, 15000);
      antworten.set(id, (ergebnis) => {
        clearTimeout(timer);
        loesen(ergebnis);
      });
      if (!sendeSSE('call', { id, name, arguments: argumenteObj })) {
        clearTimeout(timer);
        antworten.delete(id);
        loesen({ content: [{ type: 'text', text: 'FEHLER: Senden an Tab fehlgeschlagen.' }], isError: true });
      }
    });
  }

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const server = http.createServer((anfrage, antwort) => {
    const pfad = (anfrage.url || '/').split('?')[0];
    if (anfrage.method === 'OPTIONS') {
      antwort.writeHead(204, CORS).end();
      return;
    }
    if (pfad === '/live' && anfrage.method === 'GET') {
      const url = new URL(anfrage.url || '/', 'http://127.0.0.1');
      if (!tokenGueltig(url.searchParams.get('token'))) {
        antwort.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8', ...CORS }).end('Token falsch');
        return;
      }
      kanal?.end();
      kanal = antwort;
      antwort.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        ...CORS,
      });
      antwort.write(': verbunden\n\n');
      const ping = setInterval(() => antwort.write(': ping\n\n'), 15000);
      anfrage.on('close', () => {
        clearInterval(ping);
        if (kanal === antwort) kanal = null;
      });
      return;
    }
    if (pfad === '/reply' && anfrage.method === 'POST') {
      let koerper = '';
      anfrage.on('data', (stueck) => (koerper += stueck));
      anfrage.on('end', () => {
        try {
          const daten = JSON.parse(koerper);
          if (!tokenGueltig(daten.token)) {
            antwort.writeHead(401, CORS).end('Token falsch');
            return;
          }
          const loesen = antworten.get(daten.id);
          if (loesen) {
            antworten.delete(daten.id);
            loesen(daten.result);
          }
          antwort.writeHead(200, CORS).end('ok');
        } catch {
          antwort.writeHead(400, CORS).end('JSON kaputt');
        }
      });
      return;
    }
    antwort.writeHead(404, CORS).end('Nicht gefunden');
  });

  const freierPort = () =>
    new Promise((loesen, ablehnen) => {
      if (optionen.port) return loesen(optionen.port);
      const probe = net.createServer();
      probe.unref();
      probe.on('error', ablehnen);
      probe.listen(8765, '127.0.0.1', () => {
        const port = probe.address().port;
        probe.close(() => loesen(port));
      });
    });

  optionen.port = await freierPort();
  await new Promise((loesen) => server.listen(optionen.port, '127.0.0.1', () => loesen(undefined)));

  const oeffnen = () => `${optionen.url}#agent=${optionen.token}&bridge=${optionen.port}`;

  if (optionen.pruefen) {
    process.stdout.write(
      `${JSON.stringify({ ok: true, kanal: `http://127.0.0.1:${optionen.port}`, tab: Boolean(kanal), oeffnen: oeffnen() }, null, 2)}\n`,
    );
    await new Promise((loesen) => server.close(() => loesen(undefined)));
    return 0;
  }

  log(`Kanal: http://127.0.0.1:${optionen.port}`);
  log(`Öffnen: ${oeffnen()}`);

  async function bearbeiten(nachricht) {
    const { id, method, params } = nachricht;
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: PROTOKOLL,
          capabilities: { tools: {} },
          serverInfo: { name: NAME, version: VERSION },
        },
      };
    }
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id, result: { tools: werkzeugListe() } };
    }
    if (method === 'tools/call') {
      const ergebnis = await aufrufAnTab(params?.name, params?.arguments || {});
      return { jsonrpc: '2.0', id, result: ergebnis };
    }
    if (method === 'notifications/initialized') return null;
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Methode ${method} unbekannt` } };
  }

  await new Promise((loesen) => {
    const zeilen = createInterface({ input: process.stdin, crlfDelay: Number.POSITIVE_INFINITY });
    let kette = Promise.resolve();
    zeilen.on('line', (zeile) => {
      const text = zeile.trim();
      if (!text) return;
      kette = kette.then(async () => {
        try {
          const nachricht = JSON.parse(text);
          const antwort = await bearbeiten(nachricht);
          if (antwort) process.stdout.write(`${JSON.stringify(antwort)}\n`);
        } catch {
          process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON nicht lesbar' } })}\n`);
        }
      });
    });
    zeilen.on('close', () => {
      void kette.then(() => {
        try {
          kanal?.end();
        } catch {}
        server.closeAllConnections?.();
        server.close(() => loesen(undefined));
      });
    });
  });

  return 0;
}

/* ==================================================================
   7. Geoapify Seeder & DIN-Home Setup
   ================================================================== */

export async function seedGeoapify(args = process.argv.slice(2)) {
  let port = 9222;
  let datei = path.join(os.homedir(), '.secrets', 'geoapify');
  let urlTeil = '127.0.0.1:8088';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') port = Number(args[++i]);
    else if (args[i] === '--key-datei') datei = String(args[++i]);
    else if (args[i] === '--url') urlTeil = String(args[++i]);
  }

  let schluessel = '';
  try {
    schluessel = readFileSync(datei, 'utf8').trim();
  } catch {
    console.log(`  Geoapify: keine Secret-Datei (${datei}) — übersprungen`);
    return 0;
  }
  if (!schluessel) {
    console.log('  Geoapify: Secret-Datei ist leer — übersprungen');
    return 0;
  }

  let seiten = [];
  try {
    seiten = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  } catch {
    console.log(`  Geoapify: kein Debug-Browser auf Port ${port} — übersprungen`);
    return 0;
  }
  const seite = seiten.find((t) => t.type === 'page' && String(t.url || '').includes(urlTeil));
  if (!seite) {
    console.log('  Geoapify: kein App-Tab gefunden — übersprungen');
    return 0;
  }

  const { send, close } = await verbinde(seite.webSocketDebuggerUrl);
  await send('Runtime.enable');
  const ergebnis = await send('Runtime.evaluate', {
    expression: `(() => {
      const alt = localStorage.getItem('din_geoapify_key') || '';
      const neu = ${JSON.stringify(schluessel)};
      if (alt === neu) return 'unveraendert';
      localStorage.setItem('din_geoapify_key', neu);
      return alt ? 'aktualisiert' : 'gesetzt';
    })()`,
    returnByValue: true,
  });
  const zustand = ergebnis.result?.result?.value;
  console.log(`  Geoapify: Key ${zustand}`);
  if (zustand !== 'unveraendert') {
    await send('Page.enable');
    await send('Page.reload', { ignoreCache: false });
  }
  close();
  return 0;
}

export function setupDinHome() {
  const dinHome = process.env.DIN_BRIEFNEO_HOME || path.join(os.homedir(), '.din-briefneo');
  console.log(`=== DIN-BriefNEO Home Setup ===\nZielverzeichnis: ${dinHome}`);
  for (const ordner of ['build', 'cache', 'node_modules', 'research-raw']) {
    mkdirSync(path.join(dinHome, ordner), { recursive: true });
  }
  const tscPath = path.join(dinHome, 'node_modules', '.bin', 'tsc');
  if (!existsSync(tscPath)) {
    console.log(`Installiere TypeScript in ${dinHome}...`);
    execSync('npm install --prefix "$DIN_HOME" --no-fund --no-audit typescript', {
      env: { ...process.env, DIN_HOME: dinHome },
      stdio: 'inherit',
    });
  } else {
    console.log(`TypeScript ist bereits in ${dinHome} installiert.`);
  }
  console.log('Setup erfolgreich abgeschlossen.');
  return 0;
}

/* ==================================================================
   8. Debug-Session (mit Flight-Recorder)
   ================================================================== */

export async function debugSession(args = process.argv.slice(2)) {
  const hatFlag = (name) => args.includes(name);
  const wert = (name, fallback) => {
    const hit = args.find((a) => a.startsWith(`${name}=`));
    return hit ? hit.slice(name.length + 1) : fallback;
  };

  const headless = hatFlag('--headless');
  const testModus = hatFlag('--test');
  const httpWunschPort = Number(wert('--port', '0'));
  const cdpStartPort = Number(wert('--cdp-port', '9222'));

  const server = await startStaticServer(REPO_ROOT, httpWunschPort);
  const serverPort = server.port;
  const zielUrl = testModus ? `http://127.0.0.1:${serverPort}/test/index.html` : `http://127.0.0.1:${serverPort}/website/index.html`;

  console.log(`Starte Debug-Session auf Port ${serverPort}...`);
  console.log(`URL: ${zielUrl}`);

  const browser = await launch({
    headless,
    cdpPort: cdpStartPort,
    url: zielUrl,
    profilPrefix: 'din-debug-',
  });

  console.log(`CDP Port: ${browser.cdpPort}, Profil: ${browser.profil}`);
  console.log('Drücke Ctrl+C zum Beenden.');

  await new Promise((resolve) => {
    process.on('SIGINT', async () => {
      console.log('\nBeende Debug-Session...');
      await browser.close();
      await server.close();
      resolve(0);
    });
  });
  return 0;
}

/* ==================================================================
   CLI Dispatcher
   ================================================================== */

async function main() {
  const args = process.argv.slice(2);
  const sub = args[0];
  const rest = args.slice(1);

  if (sub === 'serve') {
    let port = 8088;
    let root = 'website';
    for (const a of rest) {
      if (/^\d+$/.test(a)) port = Number(a);
      else root = a;
    }
    const s = await startStaticServer(root, port);
    console.log(`Static Server läuft auf http://127.0.0.1:${s.port}`);
    return new Promise(() => {});
  }
  if (sub === 'live') return await startLive(rest);
  if (sub === 'debug') return await debugSession(rest);
  if (sub === 'seed-key') return await seedGeoapify(rest);
  if (sub === 'setup-home') return setupDinHome();

  // Default: Unit Tests
  const testArgs = sub === 'test' ? rest : args;
  return await runTests(testArgs);
}

const direkt = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (direkt) {
  main().then((code) => {
    process.exitCode = typeof code === 'number' ? code : 0;
  });
}
