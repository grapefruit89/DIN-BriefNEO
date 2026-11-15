#!/usr/bin/env node
/**
 * tools/test-dossier.mjs — schreibt `docs/30-meta/TEST-DOSSIER.md`.
 *
 * Warum: 342 Tests in einer Datei sind nachprüfbar, aber nicht lesbar. Wer
 * wissen will, ob ein Bereich abgedeckt ist, müsste `test/all.js` durchsuchen.
 * Dieses Skript zieht die `describe`-Gruppen mit ihrer Fallzahl in eine
 * Übersicht und hält die Zahl aktuell.
 *
 * Bewusst KEINE Einzelfälle: 342 Zeilen waeren ein zweites Testverzeichnis,
 * das bei jeder Umbenennung nachgezogen werden muss — und die Namen stehen
 * im Lauf. Die Übersicht beantwortet „ist Bereich X abgedeckt und wie dick?".
 *
 * Aufruf:
 *   node tools/test-dossier.mjs            # schreiben
 *   node tools/test-dossier.mjs --check     # Exit 1, wenn das Dossier abweicht
 *
 * Gruppenerkennung über die Einrückung: ein `describe(` schliesst mit `});`
 * auf derselben Einrückung. Das ist die Hausformatierung von `test/all.js`;
 * verschachtelte `describe` funktionieren mit, `it(`-Blöcke tiefer stören nicht.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUELLE = join(ROOT, 'test/all.js');
const ZIEL = join(ROOT, 'docs/30-meta/TEST-DOSSIER.md');
const CHECK = process.argv.includes('--check');

const zeilen = readFileSync(QUELLE, 'utf-8').split('\n');

/** @type {{ name: string, indent: number }[]} */
const stapel = [];
const gruppen = new Map(); // Gruppenpfad -> Fälle
let ohneGruppe = 0;

const reDescribe = /^(\s*)describe\(\s*(['"`])(.*?)\2/;
const reIt = /^(\s*)it\(\s*(['"`])(.*?)\2/;
const reEnde = /^(\s*)\}\);\s*$/;

for (const zeile of zeilen) {
  const d = zeile.match(reDescribe);
  if (d) {
    stapel.push({ name: d[3], indent: d[1].length });
    continue;
  }
  if (zeile.match(reIt)) {
    if (!stapel.length) { ohneGruppe++; continue; }
    const pfad = stapel.map((s) => s.name).join(' › ');
    gruppen.set(pfad, (gruppen.get(pfad) ?? 0) + 1);
    continue;
  }
  const e = zeile.match(reEnde);
  if (e && stapel.length && stapel[stapel.length - 1].indent === e[1].length) stapel.pop();
}

const gesamt = [...gruppen.values()].reduce((a, b) => a + b, 0) + ohneGruppe;
const liste = [...gruppen.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'));

const inhalt = `---
id: "test-dossier"
title: "Test-Dossier: was die ${gesamt} Fälle abdecken"
status: "active"
type: "reference"
created: "2026-11-15"
updated: "2026-11-15"
tags:
- din-briefneo
- meta
- tests
- dossier
doc_links:
- '[[AGENTS]]'
- '[[AUFGABEN-WEGWEISER]]'
code_links:
- 'test/all.js'
depends_on: []
supersedes: []
---

# Test-Dossier

**Erzeugt von \`tools/test-dossier.mjs\` — nicht von Hand bearbeiten.**
\`node tools/test-dossier.mjs --check\` bricht ab, wenn dieses Verzeichnis nicht
mehr zu \`test/all.js\` passt.

**Zahl:** ${gesamt} Fälle in ${liste.length} Gruppen${ohneGruppe ? ` plus ${ohneGruppe} ohne Gruppe` : ''}.
Gezählt per Textsuche über \`describe(\`/\`it(\` am Zeilenanfang — auskommentierte
und dynamisch erzeugte Fälle zählen **nicht** mit. Die Einzelfälle stehen im
Lauf (\`node tools/test-runner.mjs\`); hier steht, **wo** sie liegen und **wie
dick** ein Bereich abgedeckt ist.

| Gruppe | Fälle |
|---|---:|
${liste.map(([pfad, n]) => `| ${pfad.replace(/\|/g, '\\|')} | ${n} |`).join('\n')}
`;

const soll = `${inhalt.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
const ist = existsSync(ZIEL) ? readFileSync(ZIEL, 'utf-8') : '';

if (ist === soll) {
  console.log(`Test-Dossier aktuell (${gesamt} Fälle, ${liste.length} Gruppen).`);
  process.exit(0);
}
if (CHECK) {
  console.error('docs/30-meta/TEST-DOSSIER.md weicht von test/all.js ab.');
  console.error('Neu schreiben: node tools/test-dossier.mjs');
  process.exit(1);
}
writeFileSync(ZIEL, soll, 'utf-8');
console.log(`TEST-DOSSIER.md neu erzeugt (${gesamt} Fälle, ${liste.length} Gruppen, ${soll.split('\n').length} Zeilen).`);
