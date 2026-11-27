#!/usr/bin/env node
// @ts-check
/**
 * tools/measure/sheet.mjs — Messwerte aus dem LAUFENDEN Debug-Browser (Port 9222).
 * Kein neuer Browser, kein Screenshot, kein PDF: eine Zeile JSON in Millimetern.
 *
 * Aufruf: node tools/measure/sheet.mjs [--port 9222] [url-teil] [id ...]
 *   node tools/measure/sheet.mjs                       # App-Tab, Standardfelder
 *   node tools/measure/sheet.mjs beteff anrede         # (Tippfehler → null, absichtlich still)
 *   node tools/measure/sheet.mjs --port 9223
 *
 * Druck-Emulation: tools/measure/print.mjs (eigener headless-Browser,
 * damit der laufende Tab nicht in den Druckmodus rutscht).
 *
 * Ausgabe: {"b":[Blatthoehe_mm, data-ueberlauf], "f":{id:[y_mm,h_mm,sichtbar]}}
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));

/**
 * Liest die Messfunktion aus inpage.js — eine Quelle, kein zweiter Messcode.
 * @returns {string}
 */
function funktionsQuelle() {
  const quelle = readFileSync(join(HIER, 'inpage.js'), 'utf8');
  const ab = quelle.indexOf('() => {');
  if (ab < 0) throw new Error('tools/measure/inpage.js: Funktionsrumpf nicht gefunden');
  return quelle.slice(ab);
}

/**
 * Misst die Geometrie im laufenden Tab über CDP.
 * @param {{ port?: number, urlTeil?: string, ids?: string[] }} [optionen]
 * @returns {Promise<string>} JSON-Zeile in Millimetern
 */
export async function measureSheet({ port = 9222, urlTeil = '127.0.0.1:8088', ids = [] } = {}) {
  const funktion = funktionsQuelle();

  /** @type {any[]} */
  let seiten = [];
  try {
    seiten = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  } catch {
    throw new Error(`Kein Debug-Browser auf Port ${port}. Erst starten: din-dev`);
  }
  const seite = seiten.find((t) => t.type === 'page' && String(t.url || '').includes(urlTeil));
  if (!seite) {
    const offen = seiten
      .filter((s) => s.type === 'page')
      .map((t) => `  ${t.url}`)
      .join('\n');
    throw new Error(`Kein Tab mit "${urlTeil}" auf Port ${port}. Offene Tabs:\n${offen}`);
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
    throw new Error(`Messung fehlgeschlagen: ${r.result.exceptionDetails.exception?.description}`);
  }
  const wert = r.result?.result?.value;
  ws.close();
  return wert;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  /* CLI-Argumente unverändert wie bisher: --port, --url, sonst IDs. */
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
  try {
    console.log(await measureSheet({ port, urlTeil, ids }));
  } catch (fehler) {
    console.error(/** @type {Error} */ (fehler).message);
    process.exit(1);
  }
  process.exit(0);
}
