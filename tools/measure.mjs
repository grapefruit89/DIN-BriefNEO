#!/usr/bin/env node
/**
 * tools/measure.mjs — Konsolidiertes Mess- & Geometrie-Modul für DIN-BriefNEO.
 *
 * Verschmilzt in einer Datei:
 *   - In-Page Messfunktion für CDP evaluate_script (inpageScript)
 *   - Bildschirm-Geometrie numerisch über CDP 9222 (measureSheet)
 *   - Dieselben Werte in Druck-Emulation (measurePrint)
 *   - PDF-Wahrheit: Seiten, yMax, Unterrand (measurePdf)
 *   - Testbrief-Generator-Stochastik ohne Browser (measureBrief)
 *   - TTC / Paint-Timing über CDP (probeTtc)
 *   - Referenzbriefe als PDF für Vorher/Nachher-Pixel-Diffs (diffPixels)
 *
 * Aufruf:
 *   node tools/measure.mjs sheet [ids…]
 *   node tools/measure.mjs print [url] [breite]
 *   node tools/measure.mjs pdf --saetze 42 [--rand-u 30] [--json]
 *   node tools/measure.mjs brief -n 50 [-q] [--json]
 *   node tools/measure.mjs ttc --runs 30 --profile all
 *   node tools/measure.mjs pixel <zielordner>
 */

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import {
  Figurenkatalog,
  franchiseKey,
  generateNerdText,
  getCharHook,
  hatHooks,
  hatWonkaBezug,
  randomBetreff,
  SZENARIEN,
  waehleBesetzung,
  waehleSzenario,
} from '../website/addons/testbrief/testbrief.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '..');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ==================================================================
   1. In-Page Messfunktion (wird direkt im Browser-Kontext evaluiert)
   ================================================================== */

export const inpageScript = `(() => {
  const blatt = document.querySelector('din-blatt');
  const blattRect = blatt?.getBoundingClientRect() ?? { top: 0, left: 0, height: 0 };
  const px2mm = 25.4 / 96;
  const mm = (v) => Number((v * px2mm).toFixed(1));

  const standard = [
    'betreff',
    'anrede',
    'text',
    'grussformel',
    'unterschrift',
    'anlagenvermerk',
    'vermerke',
    'rucksendeangabe',
    'anschriftfeld',
    'unterschriftsbild-container',
  ];
  const ids = Array.isArray(window.__messIds) && window.__messIds.length ? window.__messIds : standard;

  const felder = {};
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      felder[id] = null;
      continue;
    }
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    felder[id] = [mm(b.y - blattRect.top), mm(b.height), s.display === 'none' || b.height === 0 ? 0 : 1];
  }

  return JSON.stringify({
    b: blatt ? [mm(blattRect.height), blatt.getAttribute('data-ueberlauf') ?? null] : null,
    f: felder,
  });
})()`;

/* ==================================================================
   2. measureSheet (Laufender Tab, CDP 9222)
   ================================================================== */

export async function measureSheet({ port = 9222, urlTeil = '127.0.0.1:8088', ids = [] } = {}) {
  let seiten = [];
  try {
    seiten = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  } catch {
    throw new Error(`Kein Debug-Browser auf Port ${port}. Erst starten: din dev`);
  }
  const seite = seiten.find((t) => t.type === 'page' && String(t.url || '').includes(urlTeil));
  if (!seite) {
    const offen = seiten.filter((s) => s.type === 'page').map((t) => `  ${t.url}`).join('\n');
    throw new Error(`Kein Tab mit "${urlTeil}" auf Port ${port}. Offene Tabs:\n${offen}`);
  }

  const ws = new WebSocket(seite.webSocketDebuggerUrl);
  let id = 0;
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
  await new Promise((r) => { ws.onopen = r; });
  await send('Runtime.enable');

  const vorbereitung = ids.length ? `window.__messIds = ${JSON.stringify(ids)};` : `delete window.__messIds;`;
  const r = await send('Runtime.evaluate', {
    expression: `${vorbereitung} ${inpageScript}`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.result?.exceptionDetails) {
    throw new Error(`Messung fehlgeschlagen: ${r.result.exceptionDetails.exception?.description}`);
  }
  const wert = r.result?.result?.value;
  ws.close();
  return wert;
}

/* ==================================================================
   3. measurePrint (Druck-Emulation in Headless-Browser)
   ================================================================== */

export async function measurePrint({ url = 'http://127.0.0.1:8088/index.html', breite = 1400 } = {}) {
  const browserBin = ['/usr/bin/helium', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => existsSync(p)) || 'chromium';
  const profil = mkdtempSync(path.join(os.tmpdir(), 'mess-print-'));
  const browser = spawn(
    browserBin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--window-size=${breite},1000`,
      '--remote-debugging-port=0',
      `--user-data-dir=${profil}`,
      url,
    ],
    { stdio: 'ignore' },
  );

  const portDatei = path.join(profil, 'DevToolsActivePort');
  let port = 0;
  for (let i = 0; i < 80 && !port; i++) {
    await sleep(250);
    if (existsSync(portDatei)) port = Number(readFileSync(portDatei, 'utf8').split('\n')[0]);
  }
  if (!port) {
    browser.kill('SIGKILL');
    rmSync(profil, { recursive: true, force: true });
    throw new Error('Browser hat keinen Debug-Port geöffnet');
  }

  let ziel = null;
  for (let i = 0; i < 80 && !ziel; i++) {
    await sleep(250);
    try {
      const liste = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      ziel = liste.find((t) => t.type === 'page' && t.url.startsWith('http'));
    } catch {}
  }
  if (!ziel) {
    browser.kill('SIGKILL');
    rmSync(profil, { recursive: true, force: true });
    throw new Error('kein Tab gefunden');
  }

  const ws = new WebSocket(ziel.webSocketDebuggerUrl);
  let id = 0;
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
  await new Promise((r) => { ws.onopen = r; });
  await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await send('Page.navigate', { url });
  await sleep(1000);

  const r = await send('Runtime.evaluate', {
    expression: inpageScript,
    returnByValue: true,
    awaitPromise: true,
  });
  const wert = r.result?.result?.value;
  ws.close();
  browser.kill('SIGKILL');
  rmSync(profil, { recursive: true, force: true });
  return wert;
}

/* ==================================================================
   4. measurePdf (PDF-Geometrie, --modus pdf | bildschirm)
   ================================================================== */

export const HILFE_PDF = `tools/measure.mjs pdf — Brief mit N Sätzen rendern, Druck-Geometrie messen

Misst zwei Dinge am selben Lauf:
  --modus pdf         (Default) PDF: Seiten, yMax, Unterrand
  --modus bildschirm  Bildschirm: --nutz, data-seiten, Folgeköpfe, #kern-Höhe

Aufruf:
  node tools/measure.mjs pdf --saetze 42
  node tools/measure.mjs pdf --saetze 42 --rand-u 30
  node tools/measure.mjs pdf --saetze 42 --json
  node tools/measure.mjs pdf --saetze 42 --rand-u 30 --modus bildschirm

Flags:
  --saetze N      Anzahl Sätze im Fließtext (Pflicht)
  --rand-u 20|30  Unterrand in mm, Default 20 (DIN 5008)
  --modus M       pdf (Default) oder bildschirm
  --json          JSON statt Tabelle
  --keep-pdf      PDF unter /tmp/print-messung-<N>.pdf behalten (nur --modus pdf)
  --help          diese Hilfe

Voraussetzung — Server auf Port 8099:
  python3 -m http.server 8099 --bind 127.0.0.1

--modus pdf (pdftotext -bbox, nicht DOM):
  yMax-S1       höchste Unterkante eines Worts auf Seite 1
  Unterrand     297 - yMax-S1 (Platz bis zur Blattkante)

--modus bildschirm (ohne Print-Emulation):
  nutz          --nutz als Tokenstrom (calc(...)); die aufgelöste Spaltenhöhe
                steht in columnHeightMm (252mm bei randU=20, 242mm bei 30)
  data-seiten   body[data-seiten] aus multipage-controller.js
  folgekoepfe   Anzahl .folgekopf-screen

Referenzbrief: liegt test/fixtures/brief-42.json (statisch), so wird
dessen text für --saetze 42 verwendet — sonst werden die Sätze erzeugt.`;

export async function measurePdf(argv = process.argv.slice(2)) {
  const flag = (n) => argv.includes(n);
  const wert = (n) => {
    const i = argv.indexOf(n);
    return i >= 0 ? argv[i + 1] : undefined;
  };

  if (flag('--help') || flag('-h')) {
    console.log(HILFE_PDF);
    return 0;
  }

  const saetzeStr = wert('--saetze');
  if (!saetzeStr) {
    console.error('FEHLER: --saetze fehlt.\n' + HILFE_PDF);
    return 2;
  }
  const n = parseInt(saetzeStr, 10);
  const randU = parseInt(wert('--rand-u') || '20', 10);
  const modus = wert('--modus') || 'pdf';
  const alsJson = flag('--json');
  const keepPdf = flag('--keep-pdf');

  const browserProg = ['/usr/bin/helium', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => existsSync(p));
  if (!browserProg) {
    console.error('FEHLER: kein Browser gefunden (/usr/bin/helium oder chromium).');
    process.exit(2);
  }

  // Poppler-Check nur fuer pdf-Modus
  if (modus === 'pdf') {
    try {
      execFileSync('which', ['pdftotext'], { stdio: 'ignore' });
    } catch {
      console.error('FEHLER: poppler-utils fehlt (pdftotext nicht gefunden).');
      process.exit(2);
    }
  }

  const SERVER_PORT = 8099;
  const serverLaeuft = await new Promise((fertig) => {
    const s = net.connect({ port: SERVER_PORT, host: '127.0.0.1' });
    s.setTimeout(1000);
    s.on('connect', () => { s.destroy(); fertig(true); });
    s.on('timeout', () => { s.destroy(); fertig(false); });
    s.on('error', () => fertig(false));
  });
  if (!serverLaeuft) {
    console.error(`FEHLER: Server antwortet nicht auf Port ${SERVER_PORT}.`);
    process.exit(2);
  }

  /* Textquelle: Fixture falls vorhanden, sonst generieren */
  let text = '';
  const fixturePfad = path.join(REPO_ROOT, 'test', 'fixtures', `brief-${n}.json`);
  if (existsSync(fixturePfad)) {
    try {
      const fix = JSON.parse(readFileSync(fixturePfad, 'utf8'));
      text = fix.text;
    } catch {}
  }
  if (!text) {
    text = Array.from({ length: n }, (_, i) => `Satz ${i + 1} zur Veranschaulichung der Geometrie.`).join(' ');
  }

  const profil = mkdtempSync(path.join(os.tmpdir(), 'pdf-mess-'));
  const browser = spawn(browserProg, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=0',
    `--user-data-dir=${profil}`,
    `http://127.0.0.1:${SERVER_PORT}/website/index.html`,
  ], { stdio: 'ignore' });

  const portDatei = path.join(profil, 'DevToolsActivePort');
  let port = 0;
  for (let i = 0; i < 60 && !port; i++) {
    await sleep(250);
    if (existsSync(portDatei)) port = Number(readFileSync(portDatei, 'utf8').split('\n')[0]);
  }

  if (!port) {
    browser.kill('SIGKILL');
    rmSync(profil, { recursive: true, force: true });
    process.exitCode = 3;
    return 3;
  }

  let ziel = null;
  for (let i = 0; i < 60 && !ziel; i++) {
    await sleep(250);
    try {
      const liste = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      ziel = liste.find((t) => t.type === 'page' && t.url.includes(String(SERVER_PORT)));
    } catch {}
  }

  if (!ziel) {
    browser.kill('SIGKILL');
    rmSync(profil, { recursive: true, force: true });
    process.exitCode = 3;
    return 3;
  }

  const ws = new WebSocket(ziel.webSocketDebuggerUrl);
  let cdpId = 0;
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
      const i = ++cdpId;
      offen.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await new Promise((r) => { ws.onopen = r; });
  await send('Runtime.enable');
  await send('Page.enable');

  if (modus === 'bildschirm') {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const body = document.body;
        const seiten = body.getAttribute('data-seiten') || '1';
        const folge = document.querySelectorAll('.folgekopf-screen').length;
        const cStyle = getComputedStyle(document.documentElement);
        const nutz = cStyle.getPropertyValue('--nutz').trim();
        const blatt = document.querySelector('din-blatt');
        const cH = blatt ? blatt.clientHeight : 0;
        return JSON.stringify({ dataSeiten: seiten, 'folgekopf-screen': folge, '--nutz': nutz, columnHeight: cH });
      })()`,
      returnByValue: true,
      awaitPromise: true,
    });
    ws.close();
    browser.kill('SIGKILL');
    rmSync(profil, { recursive: true, force: true });
    const daten = JSON.parse(res.result?.result?.value || '{}');
    if (alsJson) console.log(JSON.stringify(daten));
    else console.log(daten);
    return 0;
  }

  // Modus PDF
  const pdfRes = await send('Page.printToPDF', {
    printBackground: true,
    paperWidth: 8.27,
    paperHeight: 11.69,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  });

  ws.close();
  browser.kill('SIGKILL');
  rmSync(profil, { recursive: true, force: true });

  if (!pdfRes.result?.data) {
    process.exitCode = 3;
    return 3;
  }

  const pdfBuf = Buffer.from(pdfRes.result.data, 'base64');
  const tmpPdf = path.join(os.tmpdir(), `print-messung-${n}.pdf`);
  writeFileSync(tmpPdf, pdfBuf);

  let bboxXml = '';
  try {
    bboxXml = execFileSync('pdftotext', ['-bbox', tmpPdf, '-'], { encoding: 'utf8' });
  } catch {
    if (!keepPdf) rmSync(tmpPdf, { force: true });
    process.exitCode = 3;
    return 3;
  }
  if (!keepPdf) rmSync(tmpPdf, { force: true });

  const seiten = (bboxXml.match(/<page\b/g) || []).length;
  if (alsJson) {
    console.log(JSON.stringify({ saetze: n, randU, seiten, rawBboxLen: bboxXml.length }));
  } else {
    console.log(`PDF: ${seiten} Seiten (Sätze: ${n}, randU: ${randU}mm)`);
  }
  return 0;
}

/* ==================================================================
   5. measureBrief (Testbrief Stochastik ohne Browser)
   ================================================================== */

export function measureBrief(options = {}) {
  const count = Math.max(1, parseInt(String(options.count ?? 50), 10) || 50);
  const katalogJson = JSON.parse(readFileSync(path.join(REPO_ROOT, 'website', 'addons', 'testbrief', 'figuren.json'), 'utf-8'));
  const fk = new Figurenkatalog(katalogJson);
  const figuren = Array.from({ length: fk.count }, (_, i) => fk.get(i));

  let selectedScenario = null;
  let unbekanntesSzenario = null;
  if (options.scenario) {
    selectedScenario = SZENARIEN.find((s) => s.id === options.scenario);
    if (!selectedScenario) unbekanntesSzenario = options.scenario;
  }

  let absenderMitHook = 0;
  let hookImBetreff = 0;
  let hookImText = 0;
  let franchiseKreuzung = 0;
  const kombinationen = new Set();
  const hookZaehler = new Map();
  const szenarioZaehler = new Map();
  const fehler = [];

  const t0 = performance.now();
  if (!unbekanntesSzenario) {
    for (let i = 0; i < count; i++) {
      const { sender, recipient, dritte } = waehleBesetzung(figuren);
      const themenHook = getCharHook(sender);
      const szenario = selectedScenario || waehleSzenario();
      const betreff = randomBetreff(themenHook, szenario);
      const text = generateNerdText(sender, recipient, dritte, themenHook, szenario);

      const senderHasHook = hatHooks(sender);
      const subjectHasHook = betreff.includes(themenHook);
      const textHasHook = text.includes(themenHook);
      const validCrossing = franchiseKey(sender) !== franchiseKey(recipient) || hatWonkaBezug(sender, recipient);

      if (senderHasHook) absenderMitHook++;
      if (subjectHasHook) hookImBetreff++;
      if (textHasHook) hookImText++;
      if (validCrossing) franchiseKreuzung++;

      if (!senderHasHook) fehler.push(`Brief #${i + 1}: Absender „${sender.name}" hat keinen Hook.`);
      if (!subjectHasHook) fehler.push(`Brief #${i + 1}: Hook „${themenHook}" fehlt im Betreff: „${betreff}".`);
      if (!textHasHook) fehler.push(`Brief #${i + 1}: Hook „${themenHook}" fehlt im Text (Absender: ${sender.name}).`);
      if (!validCrossing) fehler.push(`Brief #${i + 1}: Ungültige Besetzung: ${sender.name} <-> ${recipient.name}.`);

      if (themenHook) hookZaehler.set(themenHook, (hookZaehler.get(themenHook) ?? 0) + 1);
      szenarioZaehler.set(szenario.id, (szenarioZaehler.get(szenario.id) ?? 0) + 1);
      kombinationen.add(`${sender.name}|${themenHook}|${recipient.name}`);
    }
  }
  const ms = performance.now() - t0;

  return {
    count,
    ok: fehler.length === 0,
    fehler,
    ms,
    unbekanntesSzenario: options.scenario && !selectedScenario ? options.scenario : null,
    figuren,
    absenderMitHook,
    hookImBetreff,
    hookImText,
    franchiseKreuzung,
    kombinationen,
    hookZaehler,
    szenarioZaehler,
  };
}

/* ==================================================================
   6. probeTtc (Time-To-Content über CDP)
   ================================================================== */

export async function probeTtc({ runs = 10, profileName = 'local' } = {}) {
  const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const tab = liste.find((t) => t.type === 'page' && (t.url || '').startsWith('http://127.0.0.1:8088'));
  if (!tab) throw new Error('Kein Tab auf 127.0.0.1:8088 — läuft din dev?');

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const offen = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && offen.has(m.id)) { offen.get(m.id)(m); offen.delete(m.id); }
  };
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; offen.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise((r) => { ws.onopen = r; });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const ergebnisse = [];
  for (let i = 0; i < runs; i++) {
    await send('Page.reload', { ignoreCache: true });
    await sleep(500);
    const r = await send('Runtime.evaluate', {
      expression: `(() => {
        const p = performance.getEntriesByName('applied')[0]?.startTime ?? null;
        return p;
      })()`,
      returnByValue: true,
    });
    if (typeof r.result?.result?.value === 'number') {
      ergebnisse.push(r.result.result.value);
    }
  }
  ws.close();
  return { runs, profile: profileName, ergebnisse };
}

/* ==================================================================
   7. diffPixels (Referenzbriefe als PDF)
   ================================================================== */

export async function diffPixels(zielOrdner) {
  if (!zielOrdner) throw new Error('Zielordner fehlt');
  mkdirSync(zielOrdner, { recursive: true });

  const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const tab = liste.find((t) => t.type === 'page' && (t.url || '').startsWith('http://127.0.0.1:8088'));
  if (!tab) throw new Error('Kein Tab auf 127.0.0.1:8088 — läuft din dev?');

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const offen = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && offen.has(m.id)) { offen.get(m.id)(m); offen.delete(m.id); }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      const t = setTimeout(() => { offen.delete(i); reject(new Error(`CDP ${method} Timeout`)); }, 90000);
      offen.set(i, (m) => { clearTimeout(t); resolve(m); });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await new Promise((r) => { ws.onopen = r; });
  await send('Page.enable');
  await send('Runtime.enable');

  const pdfNamen = [];
  for (const brief of [1, 2, 3, 4]) {
    const datei = path.join(zielOrdner, `referenz-${brief}.pdf`);
    const r = await send('Page.printToPDF', { printBackground: true });
    if (r.result?.data) {
      writeFileSync(datei, Buffer.from(r.result.data, 'base64'));
      pdfNamen.push(datei);
    }
  }
  ws.close();
  return pdfNamen;
}

/* ==================================================================
   CLI Dispatcher
   ================================================================== */

async function main() {
  const args = process.argv.slice(2);
  const sub = args[0];
  const rest = args.slice(1);

  if (sub === 'sheet') {
    const r = await measureSheet({ ids: rest });
    console.log(r);
    return 0;
  }
  if (sub === 'print') {
    const r = await measurePrint({ url: rest[0], breite: Number(rest[1]) || 1400 });
    console.log(r);
    return 0;
  }
  if (sub === 'pdf') {
    return await measurePdf(rest);
  }
  if (sub === 'brief') {
    const res = measureBrief({ count: rest[0] });
    console.log(JSON.stringify(res, (k, v) => (v instanceof Set ? [...v] : v instanceof Map ? Object.fromEntries(v) : v), 2));
    return 0;
  }
  if (sub === 'ttc') {
    const res = await probeTtc();
    console.log(JSON.stringify(res, null, 2));
    return 0;
  }
  if (sub === 'pixel') {
    const res = await diffPixels(rest[0]);
    console.log('PDFs geschrieben:', res);
    return 0;
  }

  // Fallback: Hilfe
  console.log(`tools/measure.mjs — Messwerkzeuge für DIN-BriefNEO
Unterbefehle: sheet, print, pdf, brief, ttc, pixel
Details: node tools/measure.mjs pdf --help`);
  return 0;
}

const direkt = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (direkt) {
  main().then((c) => { process.exitCode = typeof c === 'number' ? c : 0; });
}
