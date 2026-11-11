#!/usr/bin/env node
/**
 * tools/print-messung.mjs — parametrisierte PDF-Messung der Druck-Geometrie.
 *
 * Rendert einen Brief mit N Sätzen headless und misst im PDF, was wirklich auf
 * dem Papier steht: Seitenzahl, yMax der letzten Textzeile auf Seite 1 und den
 * daraus folgenden Unterrand (297 − yMax). Das PDF ist die Wahrheit, nicht die
 * Print-Emulation ([[ADR-MESS-SCHLEIFE]]).
 *
 * Für TODO #47 (Seitenzahl bei randU=30) und #48 (--nutz-Berechnung).
 *
 * Aufruf:
 *   node tools/print-messung.mjs --saetze 42
 *   node tools/print-messung.mjs --saetze 42 --rand-u 30
 *   node tools/print-messung.mjs --saetze 42 --json
 *
 * Voraussetzung: Server auf 127.0.0.1:8099 (das Skript startet bewusst keinen
 * eigenen — sonst kollidiert es mit einem laufenden Nutzer-Server).
 *
 * Exit: 0 ok | 2 Voraussetzung fehlt | 3 Render fehlgeschlagen
 */

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ Argumente */

const HILFE = `print-messung.mjs — Brief mit N Sätzen rendern, Druck-Geometrie messen

Aufruf:
  node tools/print-messung.mjs --saetze 42
  node tools/print-messung.mjs --saetze 42 --rand-u 30
  node tools/print-messung.mjs --saetze 42 --json

Flags:
  --saetze N      Anzahl Sätze im Fließtext (Pflicht)
  --rand-u 20|30  Unterrand in mm, Default 20 (DIN 5008)
  --json          JSON statt Tabelle
  --keep-pdf      PDF unter /tmp/print-messung-<N>.pdf behalten
  --help          diese Hilfe

Voraussetzung — Server auf Port 8099:
  python3 -m http.server 8099 --bind 127.0.0.1

Gemessen wird im PDF (pdftotext -bbox), nicht im DOM:
  yMax-S1       höchste Unterkante eines Worts auf Seite 1
  Unterrand     297 - yMax-S1 (Platz bis zur Blattkante)

Referenzbrief: liegt test/fixtures/brief-42.json (statisch), so wird
dessen text für --saetze 42 verwendet — sonst werden die Sätze erzeugt.`;

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const wert = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

if (flag('--help') || argv.length === 0) {
  console.log(HILFE);
  process.exit(0);
}

const saetze = Number(wert('--saetze'));
if (!Number.isInteger(saetze) || saetze < 1) {
  console.error('FEHLER: --saetze N fehlt oder ist keine positive Ganzzahl.');
  console.error('Beispiel: node tools/print-messung.mjs --saetze 42');
  process.exit(2);
}

const randU = Number(wert('--rand-u') ?? 20) === 30 ? 30 : 20;
const alsJson = flag('--json');
const keepPdf = flag('--keep-pdf');

/* -------------------------------------------------------------- Voraussetzungen */

const BROWSER = ['/usr/bin/helium', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => existsSync(p));
if (!BROWSER) {
  console.error('FEHLER: kein Browser gefunden (erwartet /usr/bin/helium oder /usr/bin/chromium).');
  process.exit(2);
}
for (const werkzeug of ['/usr/bin/pdftotext', '/usr/bin/pdfinfo']) {
  if (!existsSync(werkzeug)) {
    console.error(`FEHLER: ${werkzeug} fehlt (Paket poppler-utils installieren).`);
    process.exit(2);
  }
}

const SERVER_PORT = 8099;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}/website/index.html`;

/** @returns {Promise<boolean>} */
const serverLaeuft = () =>
  new Promise((fertig) => {
    const s = net.connect({ port: SERVER_PORT, host: '127.0.0.1' });
    s.setTimeout(1000);
    s.on('connect', () => {
      s.destroy();
      fertig(true);
    });
    s.on('timeout', () => {
      s.destroy();
      fertig(false);
    });
    s.on('error', () => fertig(false));
  });

/* ------------------------------------------------------------------ CDP-Helfer */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const punkt = (v) => Math.round(Number(v) * 25.4 / 72 * 100) / 100;

/**
 * Öffnet eine CDP-Verbindung zum eigenen Headless-Profil und liefert die
 * drei Primitive, die dieses Skript braucht.
 * @param {number} port
 */
async function verbinde(port) {
  let ziel = null;
  for (let i = 0; i < 60 && !ziel; i++) {
    await sleep(250);
    try {
      const liste = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      ziel = liste.find((t) => t.type === 'page' && t.url.includes(String(SERVER_PORT)));
    } catch {
      /* Browser noch nicht bereit */
    }
  }
  if (!ziel) throw new Error(`kein Page-Target auf CDP-Port ${port} — Browser startet nicht`);

  const ws = new WebSocket(ziel.webSocketDebuggerUrl);
  let id = 0;
  /** @type {Map<number, (m: any) => void>} */
  const offen = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    const fertig = offen.get(m.id);
    if (fertig) {
      offen.delete(m.id);
      fertig(m);
    }
  };
  await new Promise((r) => (ws.onopen = r));

  /** @param {string} methode @param {object} [params] */
  const send = (methode, params = {}) =>
    new Promise((fertig) => {
      const i = ++id;
      offen.set(i, fertig);
      ws.send(JSON.stringify({ id: i, method: methode, params }));
    });

  /** @param {string} ausdruck */
  const ev = async (ausdruck) => {
    const r = await send('Runtime.evaluate', { expression: ausdruck, returnByValue: true, awaitPromise: true });
    if (r.error) throw new Error(`CDP: ${r.error.message}`);
    const details = r.result?.exceptionDetails;
    if (details) throw new Error(`JS: ${details.exception?.description || details.text}`);
    return r.result?.result?.value;
  };

  return { ws, send, ev };
}

/* ---------------------------------------------------------------------- Lauf */

/** 42 Sätze ergeben bei randU=20 zwei Seiten — der Referenzbrief für #47. */
const satz = (n) =>
  `Marke${String(n).padStart(2, '0')} Die Lieferung der vereinbarten Testmuster erfolgt innerhalb von zehn Werktagen nach Auftragseingang und wird durch unsere Qualitaetssicherung dokumentiert.`;

/**
 * Fließtext für N Sätze. Der Referenzbrief (42 Sätze) liegt als statisches
 * Fixture bei, damit die Messung reproduzierbar ist und nicht von der hier
 * erzeugten Formulierung abhängt. Fehlt es, wird generiert — das Ergebnis
 * ist identisch, nur nicht gegen Textänderungen abgesichert.
 * @param {number} n
 * @returns {string}
 */
function briefText(n) {
  const fixture = path.join(ROOT, 'test', 'fixtures', `brief-${n}.json`);
  if (existsSync(fixture)) {
    try {
      const daten = JSON.parse(readFileSync(fixture, 'utf8'));
      if (daten.saetze === n && typeof daten.text === 'string' && daten.text.length > 0) return daten.text;
      console.error(`WARNUNG: ${fixture} passt nicht zu --saetze ${n}, Sätze werden generiert.`);
    } catch (fehler) {
      console.error(`WARNUNG: ${fixture} ist kein valides JSON (${fehler.message}), Sätze werden generiert.`);
    }
  }
  return Array.from({ length: n }, (_, i) => satz(i + 1)).join(' ');
}

const pdfPfad = keepPdf ? `/tmp/print-messung-${saetze}.pdf` : path.join(os.tmpdir(), `print-messung-${process.pid}.pdf`);
const profil = mkdtempSync(path.join(os.tmpdir(), 'print-messung-profil-'));
let browser = null;
let verbindung = null;

try {
  if (!(await serverLaeuft())) {
    console.error(`FEHLER: Port ${SERVER_PORT} antwortet nicht.`);
    console.error(`Starte: python3 -m http.server ${SERVER_PORT} --bind 127.0.0.1`);
    process.exit(2);
  }

  /* --remote-debugging-port=0: Chromium schreibt den echten Port in
     DevToolsActivePort. Fester Port 9222 wäre der des Nutzer-Browsers. */
  browser = spawn(
    BROWSER,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1600,1200',
      '--remote-debugging-port=0',
      `--user-data-dir=${profil}`,
      SERVER_URL
    ],
    { stdio: 'ignore' }
  );

  const portDatei = path.join(profil, 'DevToolsActivePort');
  let cdpPort = 0;
  for (let i = 0; i < 60 && !cdpPort; i++) {
    await sleep(250);
    if (existsSync(portDatei)) cdpPort = Number(readFileSync(portDatei, 'utf8').split('\n')[0]);
  }
  if (!cdpPort) throw new Error('Browser hat keinen CDP-Port geöffnet');

  verbindung = await verbinde(cdpPort);
  const { ws, send, ev } = verbindung;
  await send('Page.enable');

  /* Unterrand vor dem ersten Paint setzen, dann neu laden — boot.js liest ihn
     blockierend und setzt --rand-u. */
  await sleep(1500);
  await ev(`localStorage.setItem('din_settings', JSON.stringify({ randU: ${randU} }))`);
  await send('Page.reload', { ignoreCache: true });

  for (let i = 0; i < 60; i++) {
    await sleep(250);
    if (await ev(`Boolean(document.getElementById('text'))`)) break;
  }

  const inhalt = briefText(saetze);
  await ev(`(() => {
    const setze = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    setze('empfaenger-name', 'Frau Erika Mustermann');
    setze('empfaenger-strasse', 'Musterstraße 12');
    setze('empfaenger-ort', '10115 Berlin');
    setze('betreff', 'Angebot über die Lieferung von Testmustern');
    setze('anrede', 'Sehr geehrte Frau Mustermann,');
    const text = document.getElementById('text');
    text.innerHTML = '<p>' + ${JSON.stringify(inhalt)} + '</p>';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    setze('grussformel', 'Mit freundlichen Grüßen');
    setze('unterschrift', 'Erika Mustermann');
    return true;
  })()`);

  /* Paginierung abwarten: der Controller setzt body[data-seiten] asynchron. */
  await sleep(1400);

  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await sleep(450);

  const stand = JSON.parse(
    await ev(`(() => {
      const kern = document.getElementById('kern');
      return JSON.stringify({
        variabel: getComputedStyle(document.documentElement).getPropertyValue('--rand-u').trim(),
        paddingUnten: getComputedStyle(kern).paddingBottom,
        dataSeiten: document.body.dataset.seiten || ''
      });
    })()`)
  );

  const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
  if (!pdf.result?.data) throw new Error(`printToPDF ohne Daten${pdf.error ? `: ${pdf.error.message}` : ''}`);
  writeFileSync(pdfPfad, Buffer.from(pdf.result.data, 'base64'));
  ws.close();

  const seiten = Number(
    (execFileSync('/usr/bin/pdfinfo', [pdfPfad], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m) || [])[1]
  );

  /* Alle Seiten in einem Aufruf: yMax je Seite, umgerechnet in mm. */
  const xml = execFileSync('/usr/bin/pdftotext', ['-bbox', pdfPfad, '-'], { encoding: 'utf8' });
  const yMaxProSeite = xml
    .split('<page ')
    .slice(1)
    .map((abschnitt) => {
      const werte = [...abschnitt.matchAll(/<word [^>]*yMax="([\d.]+)"/g)].map((m) => Number(m[1]));
      return werte.length ? punkt(Math.max(...werte)) : null;
    })
    .filter((v) => v !== null);

  const yMaxS1 = yMaxProSeite[0] ?? null;
  const unterrand = yMaxS1 === null ? null : Math.round((297 - yMaxS1) * 100) / 100;
  const ergebnis = { saetze, randU, seiten, yMaxS1, unterrand, yMaxProSeite, stand };

  if (alsJson) {
    console.log(JSON.stringify(ergebnis, null, 2));
  } else {
    const zahl = (v) => (v === null ? '—' : v.toFixed(2).replace('.', ','));
    console.log('Saetze  RandU  Seiten  yMax-S1(mm)  Unterrand(mm)  PDF');
    console.log(
      `${String(saetze).padEnd(7)} ${String(randU).padEnd(6)} ${String(seiten).padEnd(7)} ${zahl(yMaxS1).padEnd(12)} ${zahl(unterrand).padEnd(14)} ${keepPdf ? pdfPfad : '(temp)'}`
    );
  }

  if (stand.variabel !== `${randU}mm`) {
    console.error(`WARNUNG: --rand-u ist ${stand.variabel}, erwartet ${randU}mm (Boot hat den Wert nicht übernommen).`);
  }
} catch (fehler) {
  console.error(`FEHLER: PDF-Render fehlgeschlagen — ${fehler.message}`);
  process.exitCode = 3;
} finally {
  verbindung?.ws.close();
  /* Der Browser hält sein Profil offen, bis er wirklich beendet ist — ein
     sofortiges rmSync läuft sonst in ENOTEMPTY und maskiert das Messergebnis. */
  if (browser && browser.exitCode === null) {
    const beendet = new Promise((r) => browser.once('exit', r));
    browser.kill();
    await Promise.race([beendet, sleep(3000)]);
    if (browser.exitCode === null) browser.kill('SIGKILL');
  }
  for (let versuch = 0; versuch < 10; versuch++) {
    try {
      rmSync(profil, { recursive: true, force: true });
      break;
    } catch {
      await sleep(150);
    }
  }
  if (!keepPdf) rmSync(pdfPfad, { force: true });
}

process.exit(process.exitCode ?? 0);
