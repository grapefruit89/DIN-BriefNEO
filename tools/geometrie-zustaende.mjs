/**
 * tools/geometrie-zustaende.mjs — Bildschirm-Geometrie in 8 Zustaenden.
 *
 * Zweck: „hat diese CSS-Aenderung das Layout verschoben?" beantworten, ohne
 * Screenshot. 2 Formen × `data-seiten` fehlt/1/2/3, je Zustand die
 * getBoundingClientRect und die relevanten computed styles von `#viewport`,
 * `#brief-ansicht`, `din-blatt`, `#kern`, `#seitenleiste`.
 *
 * Warum ein fester Entwurf im Skript steht: der Vorgaenger (b92-screen.mjs)
 * hat den Entwurf NICHT gesetzt. Jeder Lauf sah einen anderen Draft, damit
 * eine andere Seitenzahl, und der Vergleich meldete Abweichungen ohne jede
 * CSS-Aenderung („seiten 2 → 3", gemessen 2026-11-15). Hier wird ein fester
 * 3-Seiten-Brief und ein festes `din_settings` per
 * `Page.addScriptToEvaluateOnNewDocument` VOR dem Boot gesetzt. Der
 * Nutzerzustand wird gesichert und am Ende zurueckgeschrieben — das Profil
 * des Debug-Browsers ist persistent (siehe AGENTS.md).
 *
 * Aufruf:
 *   node tools/geometrie-zustaende.mjs /tmp/opencode/vorher.json
 *   node tools/geometrie-zustaende.mjs /tmp/opencode/nachher.json
 *   # vergleichen: die Dateien muessen identisch sein (oder der Diff ist der Befund)
 *
 * Voraussetzung: `din-dev` (Server 8088, CDP 9222).
 */
import { writeFileSync } from 'node:fs';

const ZIEL = process.argv[2];
if (!ZIEL) { console.error('Ziel fehlt'); process.exit(2); }
if (!(await fetch('http://127.0.0.1:9222/json/version').then(() => true).catch(() => false))) {
  console.error('9222 zu — din-dev starten'); process.exit(2);
}
const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const tab = liste.find((t) => t.type === 'page' && (t.url || '').startsWith('http://127.0.0.1:8088'));
if (!tab) { console.error('kein Tab auf 8088'); process.exit(2); }
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
    const t = setTimeout(() => { offen.delete(i); reject(new Error(`CDP ${method} Timeout`)); }, 60000);
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

/* Nutzerzustand sichern */
const sicherung = JSON.parse(await ev(`JSON.stringify({
  settings: localStorage.getItem('din_settings'),
  draft: localStorage.getItem('din_draft_current')
})`));

/* Fester Inhalt: 3 Seiten Brief, damit data-seiten-Zustaende sinnvoll sind. */
const ABSATZ = '<p>Die Prüfung der DIN 5008 verlangt eine klare Fluchtlinie und einen Begründungstext, der ohne Unterbrechung lesbar bleibt. Dieser Satz füllt die Zeile, damit der Umbruch realistisch ausfällt.</p>';
const TEXT = Array.from({ length: 18 }, (_, i) => ABSATZ.replace('Die Prüfung', `Absatz ${i + 1}: Die Prüfung`)).join('');
const FEST = JSON.stringify({
  'empfaenger-firma': 'Beispiel GmbH',
  'empfaenger-name': 'Frau Müller',
  'empfaenger-strasse': 'Kettelerstr. 2',
  'empfaenger-ort': '53840 Troisdorf',
  'absender-name': 'Moritz Beispiel',
  'absender-strasse': 'Musterweg 1',
  'absender-ort': '53840 Troisdorf',
  betreff: 'Prüfung der Kaskade',
  datum: '1. März 2020',
  'datum__dirty': true,
  text: TEXT,
  'toggle-anlagen': true,
  'toggle-fuss': true,
});
const SETTINGS = (form) => JSON.stringify({ theme: 'light', layout: form, marks: true, pluginTestbrief: true, previewFont: 'default', formality: 'formal', randU: 20 });

const dump = `(() => {
  const eig = ['display','overflowX','overflowY','padding','margin','containerType','alignItems','justifyContent','height','width','transform'];
  const lese = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      rect: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100),
      stil: Object.fromEntries(eig.map((k) => [k, cs[k]])),
    };
  };
  return JSON.stringify({
    seiten: document.body.getAttribute('data-seiten'),
    form: document.documentElement.dataset.layout,
    viewport: lese('#viewport'),
    briefAnsicht: lese('#brief-ansicht'),
    blatt: lese('din-blatt'),
    kern: lese('#kern'),
    seitenleiste: lese('#seitenleiste'),
  });
})()`;

const ergebnis = [];
for (const form of ['form-a', 'form-b']) {
  for (const seiten of [null, '1', '2', '3']) {
    const inj = await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try {
        localStorage.setItem('din_draft_current', ${JSON.stringify(FEST)});
        localStorage.setItem('din_settings', ${JSON.stringify(SETTINGS(form))});
      } catch (e) {}`,
    });
    await send('Page.navigate', { url: `http://127.0.0.1:8088/index.html?b59=${form}-${seiten}-${Date.now()}` });
    for (let i = 0; i < 400; i++) {
      if (await ev(`document.documentElement.dataset.ready === 'true'`).catch(() => false)) break;
      await new Promise((r) => setTimeout(r, 25));
    }
    if (inj?.result?.identifier) {
      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: inj.result.identifier });
    }
    await ev(`(() => {
      const b = document.body;
      if (${JSON.stringify(seiten)} === null) b.removeAttribute('data-seiten');
      else b.setAttribute('data-seiten', ${JSON.stringify(seiten)});
    })()`);
    await new Promise((r) => setTimeout(r, 150));
    const zustand = JSON.parse(await ev(dump));
    ergebnis.push({ gewuenscht: { form, seiten }, ...zustand });
  }
}

/* Nutzerzustand zurueck */
await ev(`(() => {
  const s = ${JSON.stringify(sicherung)};
  if (s.settings === null) localStorage.removeItem('din_settings'); else localStorage.setItem('din_settings', s.settings);
  if (s.draft === null) localStorage.removeItem('din_draft_current'); else localStorage.setItem('din_draft_current', s.draft);
})()`);

writeFileSync(ZIEL, JSON.stringify(ergebnis, null, 1), 'utf-8');
console.log(`${ergebnis.length} Zustaende -> ${ZIEL}`);
ws.close();
process.exit(0);
