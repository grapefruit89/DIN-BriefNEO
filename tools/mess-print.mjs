#!/usr/bin/env node
// @ts-check
/**
 * tools/mess-print.mjs — dieselben Messwerte wie tools/mess.js, aber in
 * Druck-Emulation. Fuer Geometrie-Fragen ("liegt der Betreff auf 107mm?",
 * "rutscht Seite 1 ueber?"), ohne PDF und ohne Screenshot.
 *
 * Aufruf: node tools/mess-print.mjs [url] [breite]
 *   node tools/mess-print.mjs                       # http://127.0.0.1:8088/index.html
 *   node tools/mess-print.mjs http://127.0.0.1:8088/index.html 1600
 *
 * Ausgabe: EINE Zeile JSON in Millimetern (Form wie tools/mess.js).
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const URL_ZIEL = process.argv[2] ?? 'http://127.0.0.1:8088/index.html';
const BREITE = Number(process.argv[3] ?? 1400);
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

/* Funktion aus tools/mess.js wiederverwenden: eine Quelle, keine zweite Wahrheit. */
const quelle = readFileSync(path.join(HIER, 'mess.js'), 'utf8');
const ab = quelle.indexOf('() => {');
if (ab < 0) throw new Error('tools/mess.js: Funktionsrumpf nicht gefunden');
const funktion = quelle.slice(ab);

const profil = mkdtempSync(path.join(os.tmpdir(), 'mess-print-'));
const browser = spawn(
  'helium',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--window-size=${BREITE},1000`,
    '--remote-debugging-port=0',
    `--user-data-dir=${profil}`,
    URL_ZIEL,
  ],
  { stdio: 'ignore' },
);

const portDatei = path.join(profil, 'DevToolsActivePort');
let port = 0;
for (let i = 0; i < 80 && !port; i++) {
  await schlaf(250);
  if (existsSync(portDatei)) port = Number(readFileSync(portDatei, 'utf8').split('\n')[0]);
}
if (!port) throw new Error('Browser hat keinen Debug-Port geoeffnet');

let ziel = null;
for (let i = 0; i < 80 && !ziel; i++) {
  await schlaf(250);
  try {
    const liste = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    ziel = liste.find((t) => t.type === 'page' && t.url.startsWith('http'));
  } catch {
    /* noch nicht bereit */
  }
}
if (!ziel) throw new Error('kein Tab gefunden');

const ws = new WebSocket(ziel.webSocketDebuggerUrl);
let id = 0;
/** @type {Map<number, (m: any) => void>} */
const offen = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && offen.has(m.id)) {
    offen.get(m.id)?.(m);
    offen.delete(m.id);
  }
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    offen.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
await new Promise((r) => {
  ws.onopen = r;
});
await send('Runtime.enable');

const ev = async (ausdruck) => {
  const r = await send('Runtime.evaluate', { expression: ausdruck, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'Eval-Fehler');
  return r.result?.result?.value;
};

for (let i = 0; i < 80; i++) {
  await schlaf(250);
  if (await ev(`document.documentElement.dataset.ready === 'true'`)) break;
}

await send('Emulation.setEmulatedMedia', { media: 'print' });
await schlaf(400);
console.log(await ev(`(${funktion})()`));

ws.close();
browser.kill();
await schlaf(200);
try {
  rmSync(profil, { recursive: true, force: true });
} catch {
  /* egal */
}
process.exit(0);
