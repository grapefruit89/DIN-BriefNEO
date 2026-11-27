#!/usr/bin/env node
/**
 * tools/content/test-dossier.mjs — schreibt `docs/meta/TEST-DOSSIER.md`.
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
 *
 * Seit Etappe 6 liegt die Logik in `tools/content/`; `tools/test-dossier.mjs`
 * bleibt als Shim der stabile Pfad (package.json, Doku).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const QUELLE = path.join(REPO_ROOT, 'test/all.js');
const ZIEL = path.join(REPO_ROOT, 'docs/meta/TEST-DOSSIER.md');

/**
 * Erzeugt oder prüft `docs/meta/TEST-DOSSIER.md`.
 * @param {string[]} [argv] Flags: `--check`.
 * @returns {number} Exit-Code (0 ok, 1 Drift)
 */
export function generateDossier(argv = process.argv.slice(2)) {
  const CHECK = argv.includes('--check');

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
    return 0;
  }
  if (CHECK) {
    console.error('docs/meta/TEST-DOSSIER.md weicht von test/all.js ab.');
    console.error('Neu schreiben: node tools/test-dossier.mjs');
    return 1;
  }
  writeFileSync(ZIEL, soll, 'utf-8');
  console.log(`TEST-DOSSIER.md neu erzeugt (${gesamt} Fälle, ${liste.length} Gruppen, ${soll.split('\n').length} Zeilen).`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  process.exitCode = generateDossier();
}
