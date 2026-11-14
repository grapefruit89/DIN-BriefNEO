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
 * Aufruf:
 *   node tools/batch-facts.mjs            # schreiben
 *   node tools/batch-facts.mjs --check     # Exit 1, wenn das Blatt abweicht
 *
 * Kein Zeitstempel im Kopf: sonst ist die Datei bei jedem Lauf anders und
 * `--check` unbrauchbar. Verbindlich ist die Zahl der Treffer, nicht das Datum.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(ROOT, 'batch/02-boot-pfad/fakten.md');
const CHECK = process.argv.includes('--check');

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

const SKRIPTE = skripte();
const DATEIEN = ['website/js/boot.js', 'website/js/boot-state.js', 'website/js/main.js'];

const bloecke = [];
bloecke.push(`# Fakten zum Boot-Pfad

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

for (const datei of DATEIEN) {
  const treffer = schreibzugriffe(datei);
  const parses = zeilen(datei).filter((z) => z.includes('JSON.parse') && !z.trim().startsWith('*')).length;
  bloecke.push(`## 2. Schreibzugriffe in \`${datei.replace('website/js/', '')}\`

${zeilen(datei).length} Zeilen · ${treffer.length} Schreibzugriffe · ${parses}× \`JSON.parse\` (Aufrufstelle${parses === 1 ? '' : 'n'})

| Zeile | Art | Ziel | Quelle |
|---:|---|---|---|
${treffer.map((t) => `| ${t.zeile} | ${t.was} | \`${t.ziel}\` | \`${esc(t.quelle).slice(0, 90)}\` |`).join('\n')}
`);
}

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

const soll = bloecke.join('\n');
const ist = existsSync(ZIEL) ? readFileSync(ZIEL, 'utf-8') : '';
const sollTrim = `${soll.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;

if (ist === sollTrim) {
  console.log('fakten.md ist aktuell.');
  process.exit(0);
}
if (CHECK) {
  console.error('batch/02-boot-pfad/fakten.md weicht vom Quelltext ab.');
  console.error('Neu schreiben: node tools/batch-facts.mjs');
  process.exit(1);
}
writeFileSync(ZIEL, sollTrim, 'utf-8');
console.log(`batch/02-boot-pfad/fakten.md neu erzeugt (${sollTrim.split('\n').length} Zeilen).`);
