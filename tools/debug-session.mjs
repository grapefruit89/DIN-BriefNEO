#!/usr/bin/env node
// tools/debug-session.mjs — sichtbare Debug-Sitzung mit Virgin-State und Flight-Recorder.
//
// Garantien:
//  - flüchtiges Browser-Profil (mkdtemp) -> kein localStorage, keine Cookies,
//    keine IndexedDB aus früheren Sitzungen; wird beim Beenden gelöscht
//  - eigener HTTP-Server mit Cache-Control: no-store auf jeder Antwort
//  - CDP bleibt offen (Default 9222), damit DevTools und MCP-Agenten andocken
//  - Konsole, Netzwerk, Storage-Änderungen und Exceptions werden mitgeschnitten
//    und beim Beenden als JSON nach test/traces/ geschrieben
//
// Aufruf:
//   node tools/debug-session.mjs                 # sichtbar, App, CDP 9222
//   node tools/debug-session.mjs --test          # sichtbar, test/index.html
//   node tools/debug-session.mjs --headless      # ohne Fenster (CI/Automation)
//   node tools/debug-session.mjs --port=8080 --cdp-port=9333
//
// Beenden: Ctrl+C im Terminal oder `q` (wenn stdin ein TTY ist).

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser } from './browser.mjs';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const hatFlag = (name) => args.includes(name);
const wert = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : fallback;
};

const headless = hatFlag('--headless');
const testModus = hatFlag('--test');
const httpWunschPort = Number(wert('--port', '0'));
const cdpStartPort = Number(wert('--cdp-port', '9222'));

const tty = Boolean(process.stdout.isTTY);
const c = {
  grau: (s) => (tty ? `\x1b[90m${s}\x1b[0m` : s),
  gruen: (s) => (tty ? `\x1b[32m${s}\x1b[0m` : s),
  rot: (s) => (tty ? `\x1b[31m${s}\x1b[0m` : s),
  gelb: (s) => (tty ? `\x1b[33m${s}\x1b[0m` : s),
  fett: (s) => (tty ? `\x1b[1m${s}\x1b[0m` : s)
};

/* ------------------------------------------------------------------ Hilfen */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @param {number} port */
function portFrei(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.once('listening', () => probe.close(() => resolve(true)));
    probe.listen(port, '127.0.0.1');
  });
}

/** @returns {string} YYYY-MM-DD-HHmmss in lokaler Zeit */
function zeitstempel() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/* ------------------------------------------------------------------ Aufbau */

const browserBin = findBrowser();
if (!browserBin) {
  console.error(c.rot('FEHLER: Kein Chromium gefunden. Setze CHROME_BIN oder installiere chromium/google-chrome.'));
  process.exit(1);
}

const statik = await startStaticServer(ROOT, httpWunschPort);
const zielUrl = `http://127.0.0.1:${statik.port}/${testModus ? 'test/index.html' : 'website/index.html'}`;

let cdpPort = cdpStartPort;
if (!(await portFrei(cdpPort))) {
  const ersatz = await new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const p = /** @type {import('node:net').AddressInfo} */ (s.address()).port;
      s.close(() => resolve(p));
    });
  });
  console.log(c.gelb(`  ! CDP-Port ${cdpPort} ist belegt (läuft dein Helium?) — nutze ${ersatz}`));
  cdpPort = ersatz;
}

const profil = mkdtempSync(path.join(os.tmpdir(), 'din-virgin-'));
const profilDateien = readdirSync(profil).length; // frisch angelegt => 0
const browserArgs = [
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profil}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-sync',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-extensions',
  'about:blank'
];
if (headless) browserArgs.unshift('--headless=new', '--disable-gpu', '--no-sandbox');

const child = spawn(browserBin, browserArgs, { stdio: 'ignore' });

/* ---------------------------------------------------------------- Recorder */

const start = Date.now();
const trace = {
  meta: {
    startedAt: new Date(start).toISOString(),
    url: zielUrl,
    headless,
    browser: '',
    cdpPort,
    httpPort: statik.port,
    profil,
    durationMs: 0,
    reason: ''
  },
  /** @type {{at: number, type: string, text: string}[]} */
  console: [],
  /** @type {{at: number, method: string, url: string, status?: number, mimeType?: string, ms?: number, fromCache?: boolean}[]} */
  network: [],
  /** @type {{at: number, key: string, bytes: number, nodes: number}[]} */
  storageMutations: [],
  /** @type {{at: number, text: string}[]} */
  errors: []
};

/** @type {import('node:net').Socket | null} */
let ws = null;
let rpcId = 0;
/** @type {Map<number, (msg: any) => void>} */
const offen = new Map();

/** @param {string} method @param {object} [params] */
function cdp(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++rpcId;
    offen.set(id, resolve);
    /** @type {WebSocket} */ (ws).send(JSON.stringify({ id, method, params }));
  });
}

/** @param {string} expression */
async function evaluiere(expression) {
  const antwort = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (antwort?.result?.exceptionDetails) return undefined;
  return antwort?.result?.result?.value;
}

/** @param {unknown[]} argListe */
function argsZuText(argListe) {
  return argListe
    .map((a) => {
      if (a && typeof a === 'object') {
        if ('value' in a) return String(a.value);
        if ('description' in a) return String(a.description);
        return JSON.stringify(a.preview?.properties?.map((p) => `${p.name}: ${p.value}`) ?? a.type);
      }
      return String(a);
    })
    .join(' ');
}

function uhr(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** @type {Map<string, {at: number, method: string, url: string}>} */
const anfragen = new Map();

function verbindeRecorder() {
  /** @type {WebSocket} */ (ws).onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && offen.has(msg.id)) {
      offen.get(msg.id)(msg);
      offen.delete(msg.id);
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = argsZuText(msg.params.args || []);
      const at = Date.now() - start;
      trace.console.push({ at, type: msg.params.type, text });
      const farbe = msg.params.type === 'error' ? c.rot : msg.params.type === 'warning' ? c.gelb : c.grau;
      console.log(farbe(`[${uhr(at)}] ${msg.params.type}: ${text}`.slice(0, 300)));
      return;
    }

    if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params.exceptionDetails;
      const text = details?.exception?.description || details?.text || 'Exception';
      const at = Date.now() - start;
      const stack = (details?.stackTrace?.callFrames || [])
        .slice(0, 4)
        .map((f) => `${f.functionName || '(anonym)'}@${(f.url || '').split('/').pop()}:${f.lineNumber + 1}`)
        .join(' ← ');
      trace.errors.push({ at, text, stack });
      console.log(c.rot(`[${uhr(at)}] ✗ Exception: ${String(text).split('\n')[0]}`));
      return;
    }

    if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      if (e.level === 'error') {
        const at = Date.now() - start;
        trace.errors.push({ at, text: `${e.source}: ${e.text}` });
        console.log(c.rot(`[${uhr(at)}] ✗ ${e.source}: ${e.text}`));
      }
      return;
    }

    if (msg.method === 'Network.requestWillBeSent') {
      anfragen.set(msg.params.requestId, {
        at: Date.now() - start,
        method: msg.params.request?.method || 'GET',
        url: msg.params.request?.url || ''
      });
      return;
    }

    if (msg.method === 'Network.responseReceived') {
      const r = msg.params.response || {};
      const start0 = anfragen.get(msg.params.requestId);
      trace.network.push({
        at: start0?.at ?? Date.now() - start,
        method: start0?.method ?? 'GET',
        url: r.url || start0?.url || '',
        status: r.status,
        mimeType: r.mimeType,
        ms: Date.now() - start - (start0?.at ?? 0),
        fromCache: Boolean(r.fromDiskCache || r.fromServiceWorker)
      });
      return;
    }

    if (msg.method === 'Network.loadingFailed') {
      const start0 = anfragen.get(msg.params.requestId);
      trace.errors.push({
        at: Date.now() - start,
        text: `Network ${msg.params.errorText || 'failed'}: ${start0?.url || msg.params.requestId}`
      });
      return;
    }
  };
}

/* -------------------------------------------------------------- Speicherprobe */

let letzterDraft = /** @type {string | null} */ (null);
let probeLaeuft = false;
async function probe() {
  if (probeLaeuft) return;
  probeLaeuft = true;
  try {
    const roh = await evaluiere(`JSON.stringify({
      draft: localStorage.getItem('din_draft_current'),
      keys: localStorage.length,
      nodes: document.querySelectorAll('*').length
    })`);
    if (!roh) return;
    const daten = JSON.parse(roh);
    if (letzterDraft === null) {
      letzterDraft = daten.draft;
      return;
    }
    if (daten.draft !== letzterDraft) {
      letzterDraft = daten.draft;
      trace.storageMutations.push({
        at: Date.now() - start,
        key: 'din_draft_current',
        bytes: daten.draft ? daten.draft.length : 0,
        nodes: daten.nodes
      });
      console.log(c.grau(`[${uhr(Date.now() - start)}] storage: din_draft_current ${daten.draft ? `${daten.draft.length} B` : 'gelöscht'} · ${daten.nodes} DOM-Knoten`));
    }
  } catch {
    /* Seite navigiert gerade — nächste Probe */
  } finally {
    probeLaeuft = false;
  }
}

/* ------------------------------------------------------------------- Beenden */

let beendet = false;
let pollTimer = /** @type {ReturnType<typeof setInterval> | null} */ (null);

/** @param {string} grund */
async function beenden(grund) {
  if (beendet) return;
  beendet = true;
  if (pollTimer) clearInterval(pollTimer);

  trace.meta.durationMs = Date.now() - start;
  trace.meta.reason = grund;

  try { /** @type {WebSocket} */ (ws)?.close(); } catch { /* egal */ }
  try { child.kill('SIGKILL'); } catch { /* egal */ }
  await statik.close();
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* egal */ }

  const verzeichnis = path.join(ROOT, 'test', 'traces');
  mkdirSync(verzeichnis, { recursive: true });
  const datei = path.join(verzeichnis, `session-${zeitstempel()}.json`);
  writeFileSync(datei, `${JSON.stringify(trace, null, 2)}\n`, 'utf8');

  console.log('');
  console.log(c.fett('■ Sitzung beendet') + c.grau(` (${grund}, ${Math.round(trace.meta.durationMs / 1000)} s)`));
  console.log(`  Konsole:   ${trace.console.length} Ereignisse`);
  console.log(`  Netzwerk:  ${trace.network.length} Antworten`);
  console.log(`  Storage:   ${trace.storageMutations.length} Änderungen`);
  console.log(`  Fehler:    ${trace.errors.length}`);
  console.log(`  Trace:     ${datei}`);
  process.exit(0);
}

process.on('SIGINT', () => void beenden('SIGINT'));
process.on('SIGTERM', () => void beenden('SIGTERM'));
child.on('exit', () => void beenden('browser-exit'));

/* -------------------------------------------------------------- Verbindung */

try {
  // Auf den Debug-Endpunkt warten (Chrome schreibt ihn erst nach dem Start).
  let version = null;
  for (let i = 0; i < 100 && !version; i++) {
    await sleep(100);
    try {
      version = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json();
    } catch { /* noch nicht bereit */ }
  }
  if (!version) throw new Error(`CDP antwortet nicht auf Port ${cdpPort}.`);
  trace.meta.browser = version.Browser || 'unbekannt';

  const ziele = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
  const seite = ziele.find((z) => z.type === 'page');
  if (!seite?.webSocketDebuggerUrl) throw new Error('Kein Page-Target gefunden.');

  ws = new WebSocket(seite.webSocketDebuggerUrl);
  verbindeRecorder();
  await new Promise((resolve) => { /** @type {WebSocket} */ (ws).onopen = resolve; });

  await cdp('Runtime.enable');
  await cdp('Console.enable');
  await cdp('Log.enable');
  await cdp('Network.enable');
  await cdp('Page.enable');

  const devtools = seite.devtoolsFrontendUrl
    ? `${seite.devtoolsFrontendUrl.replace(/^https?:\/\/[^/]+/, `http://127.0.0.1:${cdpPort}`)}`
    : `http://127.0.0.1:${cdpPort}/`;

  console.log(c.fett('▶ DIN-BriefNEO Debug-Session'));
  console.log(`  URL:        ${zielUrl}`);
  console.log(`  CDP:        http://127.0.0.1:${cdpPort}`);
  console.log(`  DevTools:   ${devtools}`);
  console.log(`  WebSocket:  ${seite.webSocketDebuggerUrl}`);
  console.log(`  Browser:    ${trace.meta.browser}${headless ? c.grau(' (headless)') : ''}`);
  console.log(`  Profil:     ${profil} ${c.grau(`(flüchtig, ${profilDateien} Dateien beim Start)`)}`);
  console.log(c.grau('  Beenden: Ctrl+C oder q'));

  await cdp('Page.navigate', { url: zielUrl });

  // Auf `load` warten, dann Virgin-State belegen.
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    const bereit = await evaluiere("document.readyState === 'complete'");
    if (bereit) break;
  }

  // Nach dem Laden schreibt die App ihre eigenen Startschluessel (din_settings,
  // din_schema_version) und legt die Blob-DB an. "Virgin" heisst daher: kein
  // Entwurf und kein Schluessel ausserhalb dieser Startmenge — ein Altprofil
  // wuerde hier sofort auffallen.
  const START_SCHLUESSEL = new Set(['din_settings', 'din_schema_version']);
  const zustand = await evaluiere(`(async () => JSON.stringify({
    keys: Object.keys(localStorage),
    draft: (localStorage.getItem('din_draft_current') || '').length,
    sessionStorage: sessionStorage.length,
    cookies: document.cookie ? document.cookie.split(';').length : 0,
    indexedDB: (await indexedDB.databases()).length,
    nodes: document.querySelectorAll('*').length
  }))()`);
  if (zustand) {
    const z = JSON.parse(zustand);
    const fremd = z.keys.filter((k) => !START_SCHLUESSEL.has(k));
    const leer = fremd.length === 0 && z.draft === 0;
    console.log(
      `  Virgin State: ${leer ? c.gruen('leer') : c.rot('NICHT LEER')}` +
      c.grau(` (Schluessel: ${z.keys.join(', ') || 'keine'}; Entwurf ${z.draft} B; ` +
        `sessionStorage ${z.sessionStorage}, Cookies ${z.cookies}, IndexedDB ${z.indexedDB}, ${z.nodes} DOM-Knoten)`)
    );
    if (!leer) console.log(c.rot(`  ! Altlasten gefunden: ${fremd.join(', ') || 'gespeicherter Entwurf'}`));
  }

  pollTimer = setInterval(() => void probe(), 1000);
  letzterDraft = await evaluiere("localStorage.getItem('din_draft_current')");
  if (letzterDraft === undefined) letzterDraft = null;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (daten) => {
      const t = daten.toString();
      if (t === 'q' || t === '\u0003') void beenden('quit');
    });
  }
} catch (fehler) {
  console.error(c.rot(`\n✗ Debug-Session fehlgeschlagen: ${fehler instanceof Error ? fehler.message : fehler}`));
  await beenden('fehler');
}
