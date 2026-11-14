#!/usr/bin/env node
/**
 * tools/paint-probe.mjs — beantwortet: steht der Zustand VOR dem ersten Paint?
 *
 * Anlass (B72): Die frühere Prüfung las den Zustand *nach* dem `firstPaint`-
 * Event und war damit racy — `initApp` kann zwischen Paint und Auswertung
 * laufen. Hier werden stattdessen Zeitstempel verglichen:
 *
 *   performance.getEntriesByName('seeder-start' | 'seeded' | 'ready')
 *   performance.getEntriesByType('paint')[0].startTime        // first-paint
 *   performance.getEntriesByType('paint')[1].startTime        // first-contentful-paint
 *
 * Die Marken setzt der Code selbst: `seeder-start` und `seeded` in
 * `website/js/boot-state.js`, `ready` am Ende von `initApp` in
 * `website/js/main.js`.
 *
 * Profile:
 *   local  keine Drosselung
 *   cpu6   CPU 6× gedrosselt (Emulation.setCPUThrottlingRate)
 *   slow   Netz 150 ms RTT, 1,5 Mbit/s (Emulation emulateNetworkConditions)
 *
 * Aufruf:
 *   node tools/paint-probe.mjs --runs 30 --profile all
 *   node tools/paint-probe.mjs --runs 5 --profile cpu6 --json
 *
 * Voraussetzung: `din-dev` läuft (Server 8088, Debug-Browser 9222).
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const wert = (n, def) => {
  const i = args.indexOf(n);
  return i > -1 && args[i + 1] ? args[i + 1] : def;
};
const RUNS = Number(wert('--runs', '30'));
const PROFIL = wert('--profile', 'all');
const JSON_OUT = args.includes('--json');
const BASE = 'http://127.0.0.1:8088/index.html';

const profile = {
  local: async (send) => {
    await send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  },
  cpu6: async (send) => {
    await send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  },
  slow: async (send) => {
    await send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await send('Network.emulateNetworkConditions', {
      offline: false, latency: 150,
      downloadThroughput: (1.5 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
    });
  },
};

async function verbinde() {
  const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const tab = liste.find((t) => t.type === 'page' && (t.url || '').startsWith('http://127.0.0.1:8088'));
  if (!tab) throw new Error('Kein Tab auf 127.0.0.1:8088 — läuft `din-dev`?');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const offen = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && offen.has(m.id)) { offen.get(m.id)(m); offen.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; offen.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  await new Promise((r) => { ws.onopen = r; });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Page.bringToFront');
  return { ws, send, ev };
}

const messung = `(() => {
  const mark = (n) => performance.getEntriesByName(n)[0]?.startTime ?? null;
  const paints = performance.getEntriesByType('paint');
  const fp = paints.find((p) => p.name === 'first-paint')?.startTime ?? null;
  const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null;
  const nav = performance.getEntriesByType('navigation')[0];
  return JSON.stringify({
    seederStart: mark('seeder-start'), seeded: mark('seeded'), ready: mark('ready'),
    fp, fcp, domContentLoaded: nav?.domContentLoadedEventEnd ?? null
  });
})()`;

async function lauf(send, ev, i) {
  await send('Page.navigate', { url: `${BASE}?paint=${i}-${Date.now()}` });
  // auf 'ready'-Marke oder Timeout warten
  for (let k = 0; k < 400; k++) {
    const fertig = await ev(`!!performance.getEntriesByName('ready').length`).catch(() => false);
    if (fertig) break;
    await new Promise((r) => setTimeout(r, 25));
  }
  await new Promise((r) => setTimeout(r, 120));
  return JSON.parse(await ev(messung));
}

const { ws, send, ev } = await verbinde();
const ziele = PROFIL === 'all' ? ['local', 'cpu6', 'slow'] : [PROFIL];
const ergebnis = {};

for (const name of ziele) {
  await profile[name](send);
  const laeufe = [];
  for (let i = 1; i <= RUNS; i++) {
    const r = await lauf(send, ev, i);
    laeufe.push(r);
  }
  const vor = (a, b) => a !== null && b !== null && a <= b;
  ergebnis[name] = {
    laeufe: laeufe.length,
    seededVorFirstPaint: laeufe.filter((r) => vor(r.seeded, r.fp)).length,
    readyVorFirstPaint: laeufe.filter((r) => vor(r.ready, r.fp)).length,
    readyVorFcp: laeufe.filter((r) => vor(r.ready, r.fcp)).length,
    seederFensterMs: {
      min: Math.round(Math.min(...laeufe.map((r) => (r.seeded ?? 0) - (r.seederStart ?? 0)))),
      max: Math.round(Math.max(...laeufe.map((r) => (r.seeded ?? 0) - (r.seederStart ?? 0)))),
    },
    abstandReadyZuFpMs: {
      min: Math.round(Math.min(...laeufe.map((r) => (r.fp ?? 0) - (r.ready ?? 0)))),
      max: Math.round(Math.max(...laeufe.map((r) => (r.fp ?? 0) - (r.ready ?? 0)))),
    },
    firstPaintMs: {
      min: Math.round(Math.min(...laeufe.map((r) => r.fp ?? 0))),
      max: Math.round(Math.max(...laeufe.map((r) => r.fp ?? 0))),
    },
    roh: laeufe,
  };
  const e = ergebnis[name];
  console.log(`${name.padEnd(6)} ${RUNS} Läufe | seeded vor Paint: ${e.seededVorFirstPaint}/${RUNS} | ready vor Paint: ${e.readyVorFirstPaint}/${RUNS} | Paint ${e.firstPaintMs.min}-${e.firstPaintMs.max} ms`);
}

await send('Emulation.setCPUThrottlingRate', { rate: 1 });
await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
ws.close();

/* Rohdaten gehoeren zur Scheibe, die sie belegt - nicht in die Repo-Wurzel. */
const datei = join(ROOT, 'batch/02-boot-pfad', `paint-probe-${new Date().toISOString().slice(0, 10)}.json`);
writeFileSync(datei, JSON.stringify(ergebnis, null, 2));
console.log(`Rohdaten: ${datei}`);
if (JSON_OUT) console.log(JSON.stringify(ergebnis, null, 2));
process.exit(0);
