#!/usr/bin/env node
/**
 * tools/og-image.mjs — erzeugt website/og-image.png (1200×630) für Social Cards.
 *
 * Variante B: Screenshot des echten DIN-A4-Blattes (Briefkopf-Ausschnitt),
 * eingebettet in ein Overlay mit Produktname. Der Brief ist fest verdrahtet,
 * damit das PNG reproduzierbar ist — kein Testbrief-Plugin, keine Zufallszahlen.
 *
 * Voraussetzung: Server auf 127.0.0.1:8099
 *   python3 -m http.server 8099 --bind 127.0.0.1
 *
 * Aufruf: node tools/og-image.mjs [--keep]
 * Exit: 0 ok | 2 Voraussetzung fehlt | 3 Render fehlgeschlagen
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = path.join(ROOT, 'website', 'og-image.png');
const SERVER_PORT = 8099;
const URL_APP = `http://127.0.0.1:${SERVER_PORT}/website/index.html`;
const BREITE = 1200;
const HOEHE = 630;

/* Fester Brief. „Gotham City" ist fiktiv — erlaubt, weil DIN 5008 nur eine
 * fünfstellige PLZ vor dem Ort verlangt und wir das PLZ-Gate vorher abschalten
 * (data-autofill-aus, Mechanismus aus d77ce85). */
const BRIEF = {
  rucksendeangabe: 'Lucky Luke · Lonesome Cowboy Road 7 · 12345 Lonesome Dove',
  'empfaenger-firma': 'Wayne Enterprises',
  'empfaenger-name': 'Herrn Bruce Wayne',
  'empfaenger-strasse': 'Wayne Manor 1',
  'empfaenger-ort': '12345 Gotham City',
  'absender-name': 'Lucky Luke',
  'absender-strasse': 'Lonesome Cowboy Road 7',
  'absender-ort': '12345 Lonesome Dove',
  'absender-tel': '030 123456',
  'absender-mail': 'lucky@lonesome.dove',
  datum: '12. November 2026',
  betreff: 'Kündigung des Colt-Liefervertrags',
  anrede: 'Sehr geehrter Herr Wayne,',
  text: 'hiermit kündige ich den bestehenden Colt-Liefervertrag fristgerecht zum nächstmöglichen Termin.'
};

/* Felder, die keine PLZ-/Ort-Erkennung auslösen dürfen. Deckungsgleich mit
 * SPERRE_FELDER in testbrief.js:42; hier wiederholt, weil dieses Werkzeug kein
 * Testbrief-Plugin ist. */
const ADRESSFELDER = ['empfaenger-ort', 'empfaenger-strasse', 'absender-ort', 'absender-strasse', 'rucksendeangabe'];

const BROWSER = ['/usr/bin/helium', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => existsSync(p));
if (!BROWSER) {
  console.error('FEHLER: kein Browser gefunden (erwartet /usr/bin/helium oder /usr/bin/chromium).');
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

/** @param {number} port */
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

  const send = (methode, params = {}) =>
    new Promise((fertig) => {
      const i = ++id;
      offen.set(i, fertig);
      ws.send(JSON.stringify({ id: i, method: methode, params }));
    });

  const ev = async (ausdruck) => {
    const r = await send('Runtime.evaluate', { expression: ausdruck, returnByValue: true, awaitPromise: true });
    if (r.error) throw new Error(`CDP: ${r.error.message}`);
    const details = r.result?.exceptionDetails;
    if (details) throw new Error(`JS: ${details.exception?.description || details.text}`);
    return r.result?.result?.value;
  };

  return { ws, send, ev };
}

const profil = mkdtempSync(path.join(os.tmpdir(), 'og-image-profil-'));
let browser = null;
let verbindung = null;

try {
  if (!(await serverLaeuft())) {
    console.error(`FEHLER: Port ${SERVER_PORT} antwortet nicht.`);
    console.error(`Starte: python3 -m http.server ${SERVER_PORT} --bind 127.0.0.1`);
    process.exit(2);
  }

  browser = spawn(
    BROWSER,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--window-size=${BREITE},${HOEHE}`,
      '--remote-debugging-port=0',
      `--user-data-dir=${profil}`,
      URL_APP
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

  for (let i = 0; i < 60; i++) {
    await sleep(250);
    if (await ev(`Boolean(document.getElementById('text'))`)) break;
  }
  /* Hellmodus erzwingen: deterministisch, unabhängig von Systemeinstellung. */
  await ev(`(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.body) document.body.setAttribute('data-theme', 'light');
    return true;
  })()`);
  await sleep(500);

  /* PLZ-Gate aus, BEVOR gefüllt wird. Adressfelder werden nur per textContent
   * gesetzt (kein input-Event) — sonst schreibt initSenderSync die
   * Rücksendezeile neu (abgekürzter Name, Trenner „•"). */
  await ev(`(() => {
    for (const id of ${JSON.stringify(ADRESSFELDER)}) {
      document.getElementById(id)?.setAttribute('data-autofill-aus', 'true');
    }
    return true;
  })()`);

  /* Füllen. Der Browser lädt beim ersten Start mit frischem Profil ein zweites
   * Mal (gemessen 2026-11-11: eine Dokument-Anfrage, initiator "other", neue
   * performance.timeOrigin ~1,5 s nach dem ersten Dokument). Eine Navigation
   * setzt #datum auf "heute" zurück und löscht data-dirty — deshalb wird nach
   * dem Füllen geprüft, ob derselbe Dokument-Lauf noch aktiv ist. */
  const fuelle = () =>
    ev(`(() => {
      const brief = ${JSON.stringify(BRIEF)};
      const fehlend = [];
      for (const [id, text] of Object.entries(brief)) {
        const el = document.getElementById(id);
        if (!el) { fehlend.push(id); continue; }
        if (id === 'text' || id === 'datum') continue;
        el.textContent = text;
      }
      /* #text zuerst mit input-Event (loest Layout/Typografie aus), datum erst
       * danach: der DOCUMENT_CHANGED-Pfad setzt das Datum sonst auf heute
       * zurueck — im ersten Lauf stand dort "11. November 2026". */
      const text = document.getElementById('text');
      if (text) {
        text.innerHTML = '<p>' + brief.text + '</p>';
        text.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const datum = document.getElementById('datum');
      if (datum) {
        /* Vertrag von format.js:applyLetterDate() — ein per data-dirty
         * markiertes Datum gilt als bewusst gesetzt und bleibt stehen. */
        datum.dataset.dirty = 'true';
        datum.textContent = brief.datum;
      }
      return fehlend;
    })()`);

  const gefuellt = await fuelle();
  if (Array.isArray(gefuellt) && gefuellt.length > 0) {
    console.error(`WARNUNG: Felder nicht gefunden: ${gefuellt.join(', ')}`);
  }

  const tVor = await ev(`performance.timeOrigin`);
  await sleep(1500);
  if ((await ev(`performance.timeOrigin`)) !== tVor) {
    console.error('HINWEIS: Dokument wurde neu geladen (Erststart) — Brief wird erneut gefüllt.');
    await fuelle();
    await sleep(800);
  }

  const stand = JSON.parse(
    await ev(`(() => JSON.stringify({
      datum: (document.getElementById('datum') || {}).textContent || '',
      text: ((document.getElementById('text') || {}).textContent || '').slice(0, 24)
    }))()`)
  );
  if (stand.datum.trim() !== BRIEF.datum) {
    console.error(`HINWEIS: Datum ist "${stand.datum.trim()}", erwartet "${BRIEF.datum}" — fülle erneut.`);
    await fuelle();
    await sleep(500);
  }

  /* Blatt freistellen. Gemessen (2026-11-11): din-blatt liegt bei (349, −303),
   * weil #viewport/#brief-ansicht per Flex zentrieren — kein Transform. Der
   * DOM-Rect ist damit unbrauchbar als Clip (ADR-Mess-Schleife). Inline
   * !important schlaegt jede Autoren-Regel, unabhaengig von der Spezifitaet. */
  await ev(`(() => {
    const setze = (el, eigenschaft, wert) => el?.style.setProperty(eigenschaft, wert, 'important');
    setze(document.getElementById('viewport'), 'display', 'block');
    setze(document.getElementById('viewport'), 'padding', '0');
    setze(document.getElementById('viewport'), 'overflow', 'visible');
    const ansicht = document.getElementById('brief-ansicht');
    setze(ansicht, 'display', 'block');
    setze(ansicht, 'height', 'auto');
    setze(ansicht, 'width', 'auto');
    setze(document.getElementById('seitenleiste'), 'display', 'none');
    setze(document.body, 'margin', '0');
    const blatt = document.querySelector('din-blatt');
    setze(blatt, 'margin', '0');
    setze(blatt, 'align-self', 'flex-start');
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    return true;
  })()`);
  await sleep(600);

  const rect = JSON.parse(
    await ev(`(() => {
      const blatt = document.querySelector('din-blatt');
      if (!blatt) return 'null';
      const r = blatt.getBoundingClientRect();
      return JSON.stringify({ x: r.x, y: r.y, width: r.width, height: r.height });
    })()`)
  );
  if (!rect) throw new Error('din-blatt nicht gefunden');
  if (rect.x < -2 || rect.y < -2) throw new Error(`din-blatt nicht bei (0,0): x=${rect.x}, y=${rect.y}`);

  /* Blatt bei 1,5× aufnehmen — wird im Overlay auf 600px herunterskaliert. */
  const blatt = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 1.5 }
  });
  if (!blatt.result?.data) throw new Error('Blatt-Screenshot leer');

  const overlay = JSON.stringify(`data:image/png;base64,${blatt.result.data}`);
  const eingefuegt = await ev(`(() => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(\`
      #og-overlay {
        position: absolute; left: 0; top: 0; width: ${BREITE}px; height: ${HOEHE}px;
        z-index: 9999; overflow: hidden;
        background: linear-gradient(135deg, var(--bg-seitenleiste) 0%, var(--bg-viewport) 100%);
        font-family: "Test-Inter", system-ui, sans-serif;
      }
      #og-overlay .og-text { position: absolute; left: 72px; top: 86px; width: 470px; }
      #og-overlay h1 {
        margin: 0; font-size: 48px; font-weight: 700; line-height: 1.1;
        letter-spacing: -0.02em; color: var(--text-primary);
      }
      #og-overlay p {
        margin: 16px 0 0; font-size: 20px; font-weight: 400; line-height: 1.45;
        color: var(--text-muted);
      }
      #og-overlay .og-sheet {
        position: absolute; right: -36px; top: 44px; width: 600px; height: 700px;
        overflow: hidden; border-radius: 3px;
        box-shadow: 0 24px 60px oklch(0% 0 0 / 18%), 0 2px 8px oklch(0% 0 0 / 8%);
      }
      #og-overlay .og-sheet img { display: block; width: 600px; height: auto; }
    \`);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    const div = document.createElement('div');
    div.id = 'og-overlay';
    div.innerHTML = '<div class="og-text"><h1>DIN-BriefNEO</h1>'
      + '<p>Normgerechter Brief-Editor nach DIN 5008</p></div>'
      + '<div class="og-sheet"><img src=' + ${overlay} + ' alt=""></div>';
    document.body.append(div);
    const img = div.querySelector('img');
    return img ? img.decode().then(() => 'ok') : 'kein-img';
  })()`);
  if (eingefuegt !== 'ok') throw new Error(`Overlay unvollständig: ${eingefuegt}`);
  await sleep(400);

  const bild = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: BREITE, height: HOEHE, scale: 1 }
  });
  if (!bild.result?.data) throw new Error('Overlay-Screenshot leer');
  const puffer = Buffer.from(bild.result.data, 'base64');
  if (puffer.length === 0) throw new Error('Screenshot 0 Byte');

  /* IHDR: Breite/Höhe stehen ab Byte 16 (je 4 Byte, big endian). */
  const breite = puffer.readUInt32BE(16);
  const hoehe = puffer.readUInt32BE(20);
  if (breite !== BREITE || hoehe !== HOEHE) throw new Error(`PNG ist ${breite}×${hoehe}, erwartet ${BREITE}×${HOEHE}`);

  writeFileSync(ZIEL, puffer);
  await ev(`document.getElementById('og-overlay')?.remove()`);
  ws.close();

  console.log(`og-image.png: ${breite}×${hoehe}px, ${(puffer.length / 1024).toFixed(1)} KB -> ${ZIEL}`);
  if (puffer.length > 200 * 1024) console.error('WARNUNG: über 200 KB — manche Dienste crawlen dann nicht.');
} catch (fehler) {
  console.error(`FEHLER: og-image fehlgeschlagen — ${fehler.message}`);
  process.exitCode = 3;
} finally {
  verbindung?.ws.close();
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
}

process.exit(process.exitCode ?? 0);
