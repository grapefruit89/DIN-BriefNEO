#!/usr/bin/env node
/**
 * tools/batch-facts.mjs — erzeugt `batch/02-boot-pfad/fakten.md` aus dem Quelltext.
 *
 * Warum (B73): Das Faktenblatt war handgetippt und innerhalb eines Tages falsch —
 * es behauptete 2× `JSON.parse`, es sind 3; es nannte Zeile 30, die Stelle ist
 * Zeile 25; es versprach „alle" Schreibzugriffe und liess sechs aus. Ein Blatt,
 * das Zeilennummern nennt, muss aus den Zeilen entstehen, nicht aus dem
 * Gedaechtnis.
 *
 * Zwei Blaetter:
 *   --scheibe 02  (Standard)  batch/02-boot-pfad/fakten.md
 *   --scheibe 01              batch/01-architektur-vertrag/fakten.md
 *
 * Aufruf:
 *   node tools/batch-facts.mjs [--scheibe 01|02] [--check]
 *   --check gibt Exit 1, wenn ein Blatt nicht mehr zum Quelltext passt.
 *
 * Kein Zeitstempel im Kopf: sonst ist die Datei bei jedem Lauf anders und
 * `--check` unbrauchbar. Verbindlich ist die Zahl der Treffer, nicht das Datum.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const iScheibe = process.argv.indexOf('--scheibe');
const SCHEIBE = iScheibe > -1 && process.argv[iScheibe + 1] ? process.argv[iScheibe + 1] : '02';
const ZIEL = join(ROOT, SCHEIBE === '01' ? 'batch/01-architektur-vertrag' : 'batch/02-boot-pfad', 'fakten.md');

const lies = (rel) => readFileSync(join(ROOT, rel), 'utf-8');
const zeilen = (rel) => lies(rel).split('\n');
const esc = (s) => s.trim().replace(/\|/g, '\\|');

/* ------------------------------------------------------------------ 1) Laden */

/** @returns {{zeile:number, tag:string, src:string, modul:boolean}[]} */
function skripte() {
  const treffer = [];
  zeilen('website/index.html').forEach((z, i) => {
    const m = z.match(/<script\b([^>]*)>/);
    if (!m) return;
    const attrs = m[1];
    const src = attrs.match(/src="([^"]+)"/)?.[1];
    if (!src) return;
    treffer.push({ zeile: i + 1, tag: attrs.trim(), src, modul: /type="module"/.test(attrs) });
  });
  return treffer;
}

/* ------------------------------------------------------- 2) Schreibzugriffe */

const SCHREIB_MUSTER = [
  { was: 'setAttribute', re: /\.setAttribute\(\s*'([^']+)'/ },
  { was: 'dataset', re: /\.dataset\.([A-Za-z]+)\s*=/ },
  { was: 'style.setProperty', re: /\.style\.setProperty\(\s*'([^']+)'/ },
  { was: 'checked', re: /\.checked\s*=/ },
  /* `=` ohne zweites `=`: ein Vergleich (`.value === x`) ist kein Schreibzugriff. */
  { was: 'value', re: /\.value\s*=(?!=)/ },
  { was: 'mark', re: /performance\.mark\(\s*'([^']+)'/ },
  { was: 'replaceChildren', re: /\.replaceChildren\(/ },
];

/**
 * @param {string} rel
 * @returns {{zeile:number, was:string, ziel:string, quelle:string}[]}
 */
function schreibzugriffe(rel) {
  const out = [];
  zeilen(rel).forEach((z, i) => {
    const roh = z.trim();
    if (roh.startsWith('*') || roh.startsWith('//') || roh.startsWith('/*')) return;
    for (const { was, re } of SCHREIB_MUSTER) {
      const m = roh.match(re);
      if (!m) continue;
      out.push({ zeile: i + 1, was, ziel: m[1] ?? '—', quelle: roh });
      return;
    }
  });
  return out;
}

/* ------------------------------------------------------------- 3) Marker */

/**
 * @param {'data-seeded' | 'data-ready'} marker
 */
function markerRegeln(marker) {
  const out = [];
  for (const datei of readdirSync(join(ROOT, 'website/css')).filter((f) => f.endsWith('.css')).sort()) {
    zeilen(`website/css/${datei}`).forEach((z, i) => {
      if (!z.includes(marker)) return;
      const roh = z.trim();
      if (roh.startsWith('*') || roh.startsWith('/*')) return;
      out.push({ datei, zeile: i + 1, quelle: roh });
    });
  }
  return out;
}

/* ------------------------------------------------------------ 4) Messung */

function messung() {
  const ordner = join(ROOT, 'batch/02-boot-pfad');
  const dateien = readdirSync(ordner)
    .filter((f) => f.startsWith('paint-probe-') && f.endsWith('.json'))
    .sort();
  if (dateien.length === 0) return null;
  const roh = JSON.parse(readFileSync(join(ordner, dateien.at(-1)), 'utf-8'));
  const zeilenOut = [];
  for (const [profil, e] of Object.entries(roh)) {
    const laeufe = e.roh;
    const fp = laeufe.map((r) => r.fp).filter((v) => v !== null);
    const rd = laeufe.map((r) => r.ready).filter((v) => v !== null);
    const median = (a) => {
      const s = [...a].sort((x, y) => x - y);
      return s[Math.floor(s.length / 2)];
    };
    zeilenOut.push(
      `| ${profil} | ${e.laeufe} | ${e.seededVorFirstPaint}/${e.laeufe} | ${e.readyVorFirstPaint}/${e.laeufe} | ${Math.round(Math.min(...fp))}–${Math.round(Math.max(...fp))} | ${Math.round(median(fp))} | ${rd.length ? Math.round(median(rd)) : '—'} |`,
    );
  }
  return { datei: dateien.at(-1), tabelle: zeilenOut };
}

/* -------------------------------------------------------------- Ausgabe */

/* ================================================================== Scheibe 01
 * Ist-Zustand des Repos: Umfang, groesste Dateien, CSS-Kennzahlen,
 * DOM-Zustands-Schreiber, Importgraph. Alles aus dem Dateisystem gezaehlt.
 *
 * Bewusst NICHT enthalten: Testzahl aus einem Lauf und der Fitness-Score.
 * Beides entsteht nur, wenn die Suite laeuft; ein Blatt, das sie behauptet,
 * waere wieder getippt. Die Testzahl hier ist die Zahl der `it(`-Aufrufe im
 * Quelltext (aktuell deckungsgleich mit dem Lauf, aber statisch gezaehlt).
 */

/** @param {string} dir @param {string[]} [out] @returns {string[]} */
function dateienUnter(dir, out = []) {
  for (const eintrag of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${eintrag.name}`;
    if (eintrag.isDirectory()) {
      if (!['node_modules', '.git', 'verweise'].includes(eintrag.name)) dateienUnter(rel, out);
    } else if (/\.(js|css|html)$/.test(eintrag.name)) {
      out.push(rel);
    }
  }
  return out.sort();
}

function scheibe01() {
  const alle = dateienUnter('website');
  const js = alle.filter((f) => f.endsWith('.js'));
  const css = alle.filter((f) => f.endsWith('.css'));
  const html = alle.filter((f) => f.endsWith('.html'));
  const zeilenVon = (f) => zeilen(f).length - (lies(f).endsWith('\n') ? 1 : 0);
  const summe = (liste) => liste.reduce((s, f) => s + zeilenVon(f), 0);

  const tests = zeilen('test/all.js').filter((z) => /^\s*it\(/.test(z)).length;
  const regeln = ['base.json', 'project.json', 'web.json']
    .map((f) => JSON.parse(lies(`tools/antipatterns/${f}`)).rules.length)
    .reduce((a, b) => a + b, 0);

  const groesste = [...alle]
    .map((f) => ({ f, n: zeilenVon(f) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 15);

  const cssKennzahlen = css.map((f) => {
    const inhalt = lies(f);
    return {
      f,
      n: zeilenVon(f),
      important: (inhalt.match(/!important/g) || []).length,
      ids: (inhalt.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g) || []).length,
      variablen: new Set(inhalt.match(/--[a-zA-Z0-9-]+\s*:/g) || []).size,
      scope: (inhalt.match(/@scope/g) || []).length,
      funktion: (inhalt.match(/@function/g) || []).length,
    };
  });

  /* DOM-Zustand: dieselben Muster wie im Boot-Blatt. Objekt-interne Felder
     (`this.#state.dirty`) werden bewusst nicht mitgezaehlt - sie sind per Regex
     nicht sicher von lokalen Variablen zu trennen. */
  const schreiber = new Map();
  for (const f of js) {
    for (const s of schreibzugriffe(f)) {
      if (!['setAttribute', 'dataset', 'style.setProperty'].includes(s.was)) continue;
      if (s.ziel === '—') continue;
      const kurz = f.replace('website/', '');
      if (!schreiber.has(s.ziel)) schreiber.set(s.ziel, new Map());
      const proDatei = schreiber.get(s.ziel);
      proDatei.set(kurz, (proDatei.get(kurz) || 0) + 1);
    }
  }
  const schreiberZeilen = [...schreiber.entries()]
    .map(([ziel, proDatei]) => ({
      ziel,
      gesamt: [...proDatei.values()].reduce((a, b) => a + b, 0),
      dateien: [...proDatei.entries()].sort((a, b) => b[1] - a[1]),
    }))
    .sort((a, b) => b.gesamt - a.gesamt || a.ziel.localeCompare(b.ziel));

  /* Importgraph: wer importiert welches Modul? */
  const importeure = new Map();
  let kanten = 0;
  for (const f of js) {
    for (const z of zeilen(f)) {
      const m = z.match(/from\s+'\.\.?\/(?:js\/)?([a-z0-9-]+)\.js'/i);
      if (!m) continue;
      kanten++;
      const ziel = `${m[1]}.js`;
      if (!importeure.has(ziel)) importeure.set(ziel, []);
      importeure.get(ziel).push(f.replace('website/js/', ''));
    }
  }
  const graph = [...importeure.entries()]
    .map(([ziel, von]) => ({ ziel, von: [...new Set(von)] }))
    .sort((a, b) => b.von.length - a.von.length || a.ziel.localeCompare(b.ziel));
  const ohneEingehende = js
    .map((f) => f.split('/').pop())
    .filter((f) => !importeure.has(f))
    .sort();

  return `# Fakten zum Ist-Zustand

**Erzeugt von \`tools/batch-facts.mjs --scheibe 01\` — nicht von Hand bearbeiten.**
\`node tools/batch-facts.mjs --scheibe 01 --check\` bricht ab, wenn das Blatt
nicht mehr zum Quelltext passt. Alle Zahlen sind aus den Dateien gezaehlt.

## Umfang

- HTML-Dateien: ${html.length}, JS-Dateien: ${js.length}, CSS-Dateien: ${css.length}
- Zeilen gesamt: HTML ${summe(html)}, JS ${summe(js)}, CSS ${summe(css)}
- Tests: ${tests} (\`it(\`-Aufrufe in \`test/all.js\`, statisch gezaehlt)
- Antipattern-Regeln: ${regeln} (Summe aus \`tools/antipatterns/*.json\`)
- Fitness-Score: bewusst nicht hier — entsteht nur durch \`node tools/build_db.js\`

## Groesste Dateien (Top 15)

| Datei | Zeilen |
|---|---:|
${groesste.map((g) => `| \`${g.f}\` | ${g.n} |`).join('\n')}

## CSS: Kennzahlen je Datei

| Datei | Zeilen | \`!important\` | ID-Selektoren | Custom Properties | \`@scope\` | \`@function\` |
|---|---:|---:|---:|---:|---:|---:|
${cssKennzahlen.map((k) => `| \`${k.f}\` | ${k.n} | ${k.important} | ${k.ids} | ${k.variablen} | ${k.scope} | ${k.funktion} |`).join('\n')}

## DOM-Zustands-Schreiber in JS

Grundlage fuer Issue #17/#18. Gezaehlt werden nur Schreibzugriffe auf Attribute,
\`dataset\` und Custom Properties — objekt-interne Felder (\`this.#state.dirty\`)
sind per Regex nicht sicher von lokalen Variablen zu trennen und bleiben draussen.

| Zustand | Schreibzugriffe | Dateien |
|---|---:|---|
${schreiberZeilen
  .map((s) => `| \`${s.ziel}\` | ${s.gesamt} | ${s.dateien.map(([d, n]) => `${d} (${n})`).join(', ')} |`)
  .join('\n')}

## Importgraph (wer wird am haeufigsten importiert)

| Modul | Importeure |
|---|---:|
${graph.map((g) => `| \`${g.ziel}\` | ${g.von.length} |`).join('\n')}

- Kanten gesamt: ${kanten}
- Module ohne eingehende Importe (Einstiegspunkte oder tot): ${ohneEingehende.map((f) => `\`${f}\``).join(', ')}
`;
}

const SKRIPTE = skripte();
const DATEIEN = ['website/js/boot.js', 'website/js/boot-state.js', 'website/js/main.js'];

const bloecke = [];
if (SCHEIBE === '01') bloecke.push(scheibe01());
else bloecke.push(`# Fakten zum Boot-Pfad

**Erzeugt von \`tools/batch-facts.mjs\` — nicht von Hand bearbeiten.**
\`node tools/batch-facts.mjs --check\` bricht ab, wenn dieses Blatt nicht mehr
zum Quelltext passt. Alle Zeilennummern sind aus den Dateien gelesen.

## 1. Ladereihenfolge

| Zeile in \`index.html\` | Typ | Quelle |
|---|---|---|
${SKRIPTE.map((s) => `| ${s.zeile} | ${s.modul ? 'Modul (deferred)' : 'klassisch'} | \`${s.src}\` |`).join('\n')}

Klassische Skripte blockieren den Parser; Module laufen nach dem Parse.

Gezählt werden **Aufrufstellen**, nicht Ausführungen: der Helfer \`lies()\` in
\`boot-state.js\` hat eine Aufrufstelle und läuft zweimal (\`din_settings\`,
\`din_draft_current\`). Genau diese Verwechslung machte das handgetippte Blatt
falsch („2× JSON.parse", tatsächlich 3).
`);

for (const datei of SCHEIBE === '01' ? [] : DATEIEN) {
  const treffer = schreibzugriffe(datei);
  const parses = zeilen(datei).filter((z) => z.includes('JSON.parse') && !z.trim().startsWith('*')).length;
  bloecke.push(`## 2. Schreibzugriffe in \`${datei.replace('website/js/', '')}\`

${zeilen(datei).length} Zeilen · ${treffer.length} Schreibzugriffe · ${parses}× \`JSON.parse\` (Aufrufstelle${parses === 1 ? '' : 'n'})

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
${treffer.map((t) => `| ${t.zeile} | ${t.was} | \`${t.ziel}\` | \`${esc(t.quelle).slice(0, 90)}\` |`).join('\n')}
`);
}

if (SCHEIBE === '02') {
const seeded = markerRegeln('data-seeded');
const ready = markerRegeln('data-ready');
bloecke.push(`## 3. Marker im CSS

\`data-seeded\` und \`data-ready\` sind keine Dubletten: \`seeded\` heisst „Zustand
steht", \`data-ready\` heisst „Booten fertig oder aufgegeben (2-s-Timer in
\`boot.js\`)". Die Messung in §4 zeigt, wie weit die beiden auseinanderliegen.

| Marker | Treffer in CSS |
|---|---|
| \`data-seeded\` | ${seeded.length} |
| \`data-ready\` | ${ready.length} |

### \`data-seeded\`

| Datei | Zeile | Regel |
|---|---:|---|
${seeded.map((r) => `| \`${r.datei}\` | ${r.zeile} | \`${esc(r.quelle).slice(0, 100)}\` |`).join('\n')}

### \`data-ready\`

| Datei | Zeile | Regel |
|---|---:|---|
${ready.map((r) => `| \`${r.datei}\` | ${r.zeile} | \`${esc(r.quelle).slice(0, 100)}\` |`).join('\n')}
`);

const m = messung();
bloecke.push(`## 4. Messung: steht der Zustand vor dem ersten Paint?

Quelle: \`${m ? m.datei : 'keine paint-probe-*.json gefunden'}\` (erzeugt von
\`tools/paint-probe.mjs\`, CDP, Cache aus, voller Entwurf).

| Profil | Läufe | \`seeded\` vor Paint | \`ready\` vor Paint | Paint | Paint (Median) | \`ready\` (Median) |
|---|---:|---:|---:|---:|---:|---:|
${m ? m.tabelle.join('\n') : '| — | — | — | — | — | — | — |'}

Lesart: \`seeded\` steht in allen Profilen frueher als \`ready\`. Im Profil \`slow\`
liegen **beide** nach dem Paint — der Body-End-Seeder ist dann von der
Netzlieferung abhaengig, nicht von der Parse-Reihenfolge.
`);
}

const soll = bloecke.join('\n');
const ist = existsSync(ZIEL) ? readFileSync(ZIEL, 'utf-8') : '';
const sollTrim = `${soll.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;

const relativ = ZIEL.replace(`${ROOT}/`, '');
if (ist === sollTrim) {
  console.log(`${relativ} ist aktuell.`);
  process.exit(0);
}
if (CHECK) {
  console.error(`${relativ} weicht vom Quelltext ab.`);
  console.error('Neu schreiben: node tools/batch-facts.mjs');
  process.exit(1);
}
writeFileSync(ZIEL, sollTrim, 'utf-8');
console.log(`${relativ} neu erzeugt (${sollTrim.split('\n').length} Zeilen).`);
