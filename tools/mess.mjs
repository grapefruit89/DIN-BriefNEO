#!/usr/bin/env node
// @ts-check
/**
 * tools/mess.mjs — Messwerte aus dem LAUFENDEN Debug-Browser (Port 9222).
 * Kein neuer Browser, kein Screenshot, kein PDF: eine Zeile JSON in Millimetern.
 *
 * Aufruf: node tools/mess.mjs [--port 9222] [url-teil] [id ...]
 *   node tools/mess.mjs                       # App-Tab, Standardfelder
 *   node tools/mess.mjs beteff anrede         # (Tippfehler → null, absichtlich still)
 *   node tools/mess.mjs --port 9223
 *
 * Druck-Emulation: node tools/mess-print.mjs  (eigener headless-Browser,
 * damit der laufende Tab nicht in den Druckmodus rutscht).
 *
 * Ausgabe: {"b":[Blatthoehe_mm, data-ueberlauf], "f":{id:[y_mm,h_mm,sichtbar]}}
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

let port = 9222;
let urlTeil = '127.0.0.1:8088';
const ids = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--port') port = Number(args[++i]);
  else if (a === '--url') urlTeil = String(args[++i]);
  else if (a.startsWith('-')) continue;
  else ids.push(a);
}

/* Funktionsquelle aus tools/mess.js — eine Quelle, kein zweiter Messcode. */
const quelle = readFileSync(join(HIER, 'mess.js'), 'utf8');
const ab = quelle.indexOf('() => {');
if (ab < 0) {
  console.error('tools/mess.js: Funktionsrumpf nicht gefunden');
  process.exit(1);
}
const funktion = quelle.slice(ab);

/** @type {any[]} */
let seiten = [];
try {
  seiten = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
} catch {
  console.error(`Kein Debug-Browser auf Port ${port}. Erst starten: din-dev`);
  process.exit(1);
}
const seite = seiten.find((t) => t.type === 'page' && String(t.url || '').includes(urlTeil));
if (!seite) {
  console.error(`Kein Tab mit "${urlTeil}" auf Port ${port}. Offene Tabs:`);
  for (const t of seiten.filter((s) => s.type === 'page')) console.error(`  ${t.url}`);
  process.exit(1);
}

const ws = new WebSocket(seite.webSocketDebuggerUrl);
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

const vorbereitung = ids.length
  ? `window.__messIds = ${JSON.stringify(ids)};`
  : `delete window.__messIds;`;
const r = await send('Runtime.evaluate', {
  expression: `${vorbereitung} (${funktion})()`,
  returnByValue: true,
  awaitPromise: true,
});
if (r.result?.exceptionDetails) {
  console.error('Messung fehlgeschlagen:', r.result.exceptionDetails.exception?.description);
  process.exit(1);
}
console.log(r.result?.result?.value);
ws.close();
process.exit(0);
