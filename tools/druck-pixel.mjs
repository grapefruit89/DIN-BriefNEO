#!/usr/bin/env node
/**
 * tools/druck-pixel.mjs — 4 Referenzbriefe als PDF, für Vorher/Nachher-Pixel-
 * vergleiche. Ersetzt die Ad-hoc-Harnesse, die bisher unter /tmp lagen und
 * beim nächsten Aufräumen weg waren.
 *
 * Aufruf:
 *   node tools/druck-pixel.mjs /tmp/opencode/vorher
 *   node tools/druck-pixel.mjs /tmp/opencode/nachher
 *   # vergleichen: pdftoppm -r 150 -png <pdf> out/<name>, dann Pixel-Diff
 *
 * **Zustand des Profils:** Das Skript sichert `din_settings` und
 * `din_draft_current` VOR dem ersten Lauf und schreibt sie am Ende (auch bei
 * Fehler) zurück. Grund: am 2026-11-15 hat eine /tmp-Harness das gespeicherte
 * `pluginTestbrief: false` hinterlassen — der Testbrief-Knopf verschwand und
 * niemand wusste, woher. Messwerkzeug darf die App des Nutzers nicht ändern.
 *
 * Voraussetzung: `din-dev` (Server 8088, CDP 9222).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ZIEL = process.argv[2];
if (!ZIEL) { console.error('Zielordner fehlt'); process.exit(2); }
mkdirSync(ZIEL, { recursive: true });

if (!(await fetch('http://127.0.0.1:9222/json/version').then(() => true).catch(() => false))) {
  console.error('Kein CDP auf 9222 — läuft din-dev?');
  process.exit(2);
}
const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const tab = liste.find((t) => t.type === 'page' && (t.url || '').startsWith('http://127.0.0.1:8088'));
if (!tab) { console.error('Kein Tab auf 8088'); process.exit(2); }
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
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result?.result?.value;
};

/* --- Nutzerzustand sichern (VOR dem ersten Schreibzugriff) --------------- */
await send('Page.navigate', { url: `http://127.0.0.1:8088/index.html?druck=${Date.now()}` });
for (let i = 0; i < 400; i++) {
  if (await ev(`document.documentElement.dataset.ready === 'true'`).catch(() => false)) break;
  await new Promise((r) => setTimeout(r, 25));
}
const sicherung = JSON.parse(await ev(`JSON.stringify({
  settings: localStorage.getItem('din_settings'),
  draft: localStorage.getItem('din_draft_current')
})`));

const ABSATZ = (n) =>
  `<p>Absatz ${n}: Die Prüfung der DIN 5008 verlangt eine klare Fluchtlinie und einen Begründungstext, der ohne Unterbrechung lesbar bleibt. Dieser Satz füllt die Zeile, damit der Umbruch realistisch ausfällt.</p>`;
const kurz = '<p>Ein kurzer Brief mit einem einzigen Absatz.</p>';
const lang = Array.from({ length: 18 }, (_, i) => ABSATZ(i + 1)).join('');
const FUELLUNG = (text) => ({
  'empfaenger-firma': 'Beispiel GmbH',
  'empfaenger-name': 'Frau Müller',
  'empfaenger-strasse': 'Kettelerstr. 2',
  'empfaenger-ort': '53840 Troisdorf',
  'absender-name': 'Moritz Beispiel',
  'absender-strasse': 'Musterweg 1',
  'absender-ort': '53840 Troisdorf',
  betreff: 'Prüfung der Kaskade',
  text,
  'toggle-anlagen': true,
  'toggle-fuss': true,
});
const SETTINGS = (layout) => JSON.stringify({
  theme: 'light', layout, marks: true, pluginTestbrief: true,
  previewFont: 'default', formality: 'formal', randU: 20,
});

const FAELLE = [
  { name: 'form-a-kurz', layout: 'form-a', text: kurz },
  { name: 'form-a-lang', layout: 'form-a', text: lang },
  { name: 'form-b-kurz', layout: 'form-b', text: kurz },
  { name: 'form-b-lang', layout: 'form-b', text: lang },
];

const ergebnis = [];
try {
  for (const fall of FAELLE) {
    const inj = await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try {
        localStorage.setItem('din_draft_current', ${JSON.stringify(JSON.stringify(FUELLUNG(fall.text)))});
        localStorage.setItem('din_settings', ${JSON.stringify(SETTINGS(fall.layout))});
      } catch (e) {}`,
    });
    await send('Page.navigate', { url: `http://127.0.0.1:8088/index.html?fall=${fall.name}` });
    for (let i = 0; i < 400; i++) {
      if (await ev(`document.documentElement.dataset.ready === 'true'`).catch(() => false)) break;
      await new Promise((r) => setTimeout(r, 25));
    }
    if (inj?.result?.identifier) {
      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: inj.result.identifier });
    }
    const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, transferMode: 'ReturnAsBase64' });
    const datei = join(ZIEL, `${fall.name}.pdf`);
    writeFileSync(datei, Buffer.from(pdf.result.data, 'base64'));
    ergebnis.push(`${fall.name}.pdf`);
  }
} finally {
  /* Immer zurückstellen — auch wenn ein Lauf abbricht. */
  await ev(`(() => {
    const s = ${JSON.stringify(sicherung)};
    if (s.settings === null) localStorage.removeItem('din_settings');
    else localStorage.setItem('din_settings', s.settings);
    if (s.draft === null) localStorage.removeItem('din_draft_current');
    else localStorage.setItem('din_draft_current', s.draft);
  })()`);
  const pruefung = await ev(`JSON.parse(localStorage.getItem('din_settings') || '{}').pluginTestbrief`);
  if (pruefung !== true) {
    console.error(`WARNUNG: pluginTestbrief steht nach dem Lauf auf ${JSON.stringify(pruefung)} — vorher sichern/prüfen!`);
  }
  ws.close();
}
console.log(`${ergebnis.length} PDFs -> ${ZIEL}`);
for (const e of ergebnis) console.log(`  ${e}`);
process.exit(0);
