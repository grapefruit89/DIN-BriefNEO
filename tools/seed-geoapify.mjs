#!/usr/bin/env node
// @ts-check
/**
 * tools/seed-geoapify.mjs — legt den Geoapify-Key aus der lokalen Secret-Datei
 * in den localStorage des laufenden Debug-Browsers.
 *
 * Warum: der Key steht NICHT im Repo (die App wird oeffentlich auf GitHub
 * Pages ausgeliefert) und wird von address.js aus `localStorage` gelesen.
 * Nach jedem frischen Profil musste er von Hand eingetippt werden.
 *
 * Aufruf: node tools/seed-geoapify.mjs [--port 9222] [--key-datei <pfad>]
 * Wird von `din-dev` automatisch aufgerufen.
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
let port = 9222;
let datei = '/home/moritz/.secrets/geoapify';
let urlTeil = '127.0.0.1:8088';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port') port = Number(args[++i]);
  else if (args[i] === '--key-datei') datei = String(args[++i]);
  else if (args[i] === '--url') urlTeil = String(args[++i]);
}

/** @type {string} */
let schluessel = '';
try {
  schluessel = readFileSync(datei, 'utf8').trim();
} catch {
  console.log(`  Geoapify: keine Secret-Datei (${datei}) — uebersprungen`);
  process.exit(0);
}
if (!schluessel) {
  console.log(`  Geoapify: Secret-Datei ist leer — uebersprungen`);
  process.exit(0);
}

/** @type {any[]} */
let seiten = [];
try {
  seiten = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
} catch {
  console.log(`  Geoapify: kein Debug-Browser auf Port ${port} — uebersprungen`);
  process.exit(0);
}
const seite = seiten.find((t) => t.type === 'page' && String(t.url || '').includes(urlTeil));
if (!seite) {
  console.log('  Geoapify: kein App-Tab gefunden — uebersprungen');
  process.exit(0);
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

/* Key setzen; nur neu laden, wenn er wirklich fehlte oder abwich. */
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
ws.close();
process.exit(0);
