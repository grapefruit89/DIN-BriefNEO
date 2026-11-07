#!/usr/bin/env node
// tools/test-runner.mjs — Headless-Runner für test/index.html (B48).
//
// Zero-Dependency: node:http, node:child_process, node:fs, node:path, node:url.
// Startet einen eigenen Server mit `Cache-Control: no-store` (die ?v=-Query in
// test/index.html ist dadurch nicht mehr nötig), öffnet den Browser headless,
// holt `window.__TEST_RESULTS` per CDP ab und meldet das Ergebnis über den
// Exit-Code.
//
// Aufruf:
//   node tools/test-runner.mjs
//   node tools/test-runner.mjs --json
//   node tools/test-runner.mjs --filter=Salutation
//   CHROME_BIN=/pfad/zu/chromium node tools/test-runner.mjs
//   node tools/test-runner.mjs --allow-missing-browser   (CI ohne Browser)

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser } from './browser.mjs';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const START = Date.now();

/* ------------------------------------------------------------------ Argumente */

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : fallback;
};

const alsJson = flag('--json');
const filter = value('--filter', '');
const timeoutMs = Number(value('--timeout', '15000'));
const browserFehltOk = flag('--allow-missing-browser');

/* ------------------------------------------------------------- Ausgabe-Helfer */

const tty = Boolean(process.stdout.isTTY);
const farbe = {
  gruen: (s) => (tty ? `\x1b[32m${s}\x1b[0m` : s),
  rot: (s) => (tty ? `\x1b[31m${s}\x1b[0m` : s),
  grau: (s) => (tty ? `\x1b[90m${s}\x1b[0m` : s),
  fett: (s) => (tty ? `\x1b[1m${s}\x1b[0m` : s)
};

/**
 * @param {object} ergebnis
 * @param {boolean} ergebnis.ok
 * @param {string} [ergebnis.grund]
 */
function beenden(ergebnis) {
  if (alsJson) {
    process.stdout.write(`${JSON.stringify(ergebnis, null, 2)}\n`);
  }
  process.exit(ergebnis.ok ? 0 : 1);
}

/* -------------------------------------------------------------------- Server */

const statik = await startStaticServer(ROOT);
const serverPort = statik.port;

/* ------------------------------------------------------------------- Browser */

const browserBin = findBrowser();
if (!browserBin) {
  const meldung = 'Kein Chromium gefunden. Setze CHROME_BIN oder installiere chromium/google-chrome.';
  if (browserFehltOk) {
    if (alsJson) process.stdout.write(`${JSON.stringify({ ok: true, skipped: true, grund: meldung })}\n`);
    else console.log(farbe.grau(`SKIP: ${meldung}`));
    await statik.close();
    process.exit(0);
  }
  await statik.close();
  console.error(farbe.rot(`FEHLER: ${meldung}`));
  process.exit(1);
}

const profil = mkdtempSync(path.join(os.tmpdir(), 'din-test-runner-'));
const child = spawn(browserBin, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--remote-debugging-port=0',
  `--user-data-dir=${profil}`,
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @type {import('node:net').Socket | null} */
let ws = null;
let fernaufrufId = 0;
/** @type {Map<number, (msg: any) => void>} */
const offen = new Map();
const konsolenfehler = [];

/** @param {string} method @param {object} [params] */
async function cdp(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++fernaufrufId;
    offen.set(id, resolve);
    /** @type {WebSocket} */ (ws).send(JSON.stringify({ id, method, params }));
  });
}

/** @param {string} expression */
async function evaluiere(expression) {
  const antwort = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return antwort?.result?.result?.value;
}

async function aufraeumen() {
  try { if (ws) ws.close(); } catch { /* egal */ }
  try { child.kill('SIGKILL'); } catch { /* egal */ }
  await statik.close();
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* egal */ }
}

try {
  // Auf den dynamischen Debug-Port warten (DevToolsActivePort im Profil).
  const portDatei = path.join(profil, 'DevToolsActivePort');
  let debugPort = 0;
  for (let i = 0; i < 100 && !debugPort; i++) {
    await sleep(100);
    if (existsSync(portDatei)) {
      const zeilen = readFileSync(portDatei, 'utf8').split('\n');
      debugPort = Number(zeilen[0]) || 0;
    }
  }
  if (!debugPort) throw new Error('Browser hat keinen Debug-Port geöffnet (DevToolsActivePort fehlt).');

  const ziele = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const seite = ziele.find((z) => z.type === 'page');
  if (!seite?.webSocketDebuggerUrl) throw new Error('Kein Page-Target am Debug-Port.');
  const browserVersion = (await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json())?.Browser || 'unbekannt';

  ws = new WebSocket(seite.webSocketDebuggerUrl);
  /** @type {WebSocket} */ (ws).onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && offen.has(msg.id)) {
      offen.get(msg.id)(msg);
      offen.delete(msg.id);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      konsolenfehler.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || 'Exception');
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
      // Die Suite loggt fehlgeschlagene Tests selbst per console.error — das ist
      // kein Laufzeitfehler und würde die Diagnose doppeln.
      if (!text.startsWith('✗')) konsolenfehler.push(text);
    }
  };
  await new Promise((resolve) => { /** @type {WebSocket} */ (ws).onopen = resolve; });

  await cdp('Runtime.enable');
  await cdp('Network.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Page.enable');

  const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
  await cdp('Page.navigate', { url: `http://127.0.0.1:${serverPort}/test/index.html${query}` });

  let ergebnis = null;
  const frist = Date.now() + timeoutMs;
  while (Date.now() < frist) {
    await sleep(200);
    const roh = await evaluiere('window.__TEST_RESULTS ? JSON.stringify(window.__TEST_RESULTS) : ""');
    if (roh) {
      ergebnis = JSON.parse(roh);
      break;
    }
  }
  if (!ergebnis) throw new Error(`Timeout: keine Testergebnisse nach ${timeoutMs} ms.`);

  const dauer = Date.now() - START;
  const ok = ergebnis.failed === 0;

  if (alsJson) {
    beenden({ ok, ...ergebnis, konsolenfehler, browser: browserVersion, dauerMs: dauer });
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
  process.exit(ok ? 0 : 1);
} catch (fehler) {
  const meldung = fehler instanceof Error ? fehler.message : String(fehler);
  await aufraeumen();
  if (alsJson) process.stdout.write(`${JSON.stringify({ ok: false, error: meldung })}\n`);
  else console.error(farbe.rot(`\n✗ Runner-Fehler: ${meldung}`));
  process.exit(1);
}
