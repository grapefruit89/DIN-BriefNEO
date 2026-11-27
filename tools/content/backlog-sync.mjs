#!/usr/bin/env node
/**
 * tools/content/backlog-sync.mjs — hält die Übersichtstabelle in BACKLOG.md aktuell.
 *
 * Warum: die Tabelle ist eine zweite Wahrheit neben den Einträgen. Genau daran
 * ist das Backlog am 2026-11-14 schon einmal gescheitert (durchgestrichene
 * Punkte in zwei Listen). Dieses Skript erzeugt die Tabelle aus den
 * Überschriften und meldet Drift.
 *
 * Aufruf:
 *   node tools/backlog-sync.mjs           # Tabelle neu schreiben
 *   node tools/backlog-sync.mjs --check   # nur prüfen (Exit 1 bei Drift)
 *
 * Seit Etappe 6 liegt die Logik in `tools/content/`; `tools/backlog-sync.mjs`
 * bleibt als Shim der stabile Pfad (package.json, Doku).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const DATEI = path.join(REPO_ROOT, 'docs/meta/BACKLOG.md');

/**
 * Schreibt die Übersichtstabelle neu oder prüft sie.
 * @param {string[]} [argv] Flags: `--check`.
 * @returns {number} Exit-Code (0 ok, 1 Drift/Fehler)
 */
export function syncBacklog(argv = process.argv.slice(2)) {
  const CHECK = argv.includes('--check');

  const text = readFileSync(DATEI, 'utf-8');
  const eintraege = [...text.matchAll(/^### (B\d+) · (.+?) · \*\*([SMLN])\*\* · (⭐+)/gm)]
    .map(([, nr, titel, aufwand, roi]) => ({ nr, titel, aufwand, roi }))
    .sort((a, b) => Number(a.nr.slice(1)) - Number(b.nr.slice(1)));

  const tabelle = [
    '## Übersicht',
    '',
    `${eintraege.length} offene Punkte. Details unterhalb, nach Art gruppiert.`,
    '',
    '| Nr | Aufgabe | Aufwand | Nutzen |',
    '|---|---|:---:|:---:|',
    ...eintraege.map((e) => `| **${e.nr}** | ${e.titel.replace(/\|/g, '\\|')} | ${e.aufwand} | ${e.roi} |`),
  ].join('\n');

  const treffer = text.match(/^## Übersicht\n[\s\S]*?(?=^## )/m);
  if (!treffer) {
    console.error('BACKLOG.md: Abschnitt "## Übersicht" fehlt');
    return 1;
  }

  const ist = treffer[0].trimEnd();
  const soll = tabelle.trimEnd();

  if (ist === soll) {
    console.log(`Backlog-Tabelle aktuell (${eintraege.length} Einträge).`);
    return 0;
  }

  if (CHECK) {
    console.error('Backlog-Tabelle driftet gegen die Einträge. Neu schreiben: node tools/backlog-sync.mjs');
    return 1;
  }

  writeFileSync(DATEI, text.replace(treffer[0], `${soll}\n`), 'utf-8');
  console.log(`Backlog-Tabelle neu geschrieben (${eintraege.length} Einträge).`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  process.exitCode = syncBacklog();
}
