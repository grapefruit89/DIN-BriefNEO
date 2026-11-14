#!/usr/bin/env node
/**
 * tools/backlog-sync.mjs — hält die Übersichtstabelle in BACKLOG.md aktuell.
 *
 * Warum: die Tabelle ist eine zweite Wahrheit neben den Einträgen. Genau daran
 * ist das Backlog am 2026-11-14 schon einmal gescheitert (durchgestrichene
 * Punkte in zwei Listen). Dieses Skript erzeugt die Tabelle aus den
 * Überschriften und meldet Drift.
 *
 * Aufruf:
 *   node tools/backlog-sync.mjs           # Tabelle neu schreiben
 *   node tools/backlog-sync.mjs --check   # nur prüfen (Exit 1 bei Drift)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATEI = join(ROOT, 'docs/30-meta/BACKLOG.md');
const CHECK = process.argv.includes('--check');

const text = readFileSync(DATEI, 'utf-8');
const eintraege = [...text.matchAll(/^### (B\d+) · (.+?) · \*\*([SMLN])\*\* · (⭐+)/gm)]
  .map(([, nr, titel, aufwand, roi]) => ({ nr, titel, aufwand, roi }))
  .sort((a, b) => Number(a.nr.slice(1)) - Number(b.nr.slice(1)));

const tabelle = [
  '## Übersicht',
  '',
  `${eintraege.length} offene Punkte. Details unterhalb, nach Priorität gruppiert.`,
  '',
  '| Nr | Aufgabe | Aufwand | Nutzen |',
  '|---|---|:---:|:---:|',
  ...eintraege.map((e) => `| **${e.nr}** | ${e.titel.replace(/\|/g, '\\|')} | ${e.aufwand} | ${e.roi} |`),
].join('\n');

const treffer = text.match(/^## Übersicht\n[\s\S]*?(?=^## )/m);
if (!treffer) {
  console.error('BACKLOG.md: Abschnitt "## Übersicht" fehlt');
  process.exit(1);
}

const ist = treffer[0].trimEnd();
const soll = tabelle.trimEnd();

if (ist === soll) {
  console.log(`Backlog-Tabelle aktuell (${eintraege.length} Einträge).`);
  process.exit(0);
}

if (CHECK) {
  console.error('Backlog-Tabelle driftet gegen die Einträge. Neu schreiben: node tools/backlog-sync.mjs');
  process.exit(1);
}

writeFileSync(DATEI, text.replace(treffer[0], soll + '\n'), 'utf-8');
console.log(`Backlog-Tabelle neu geschrieben (${eintraege.length} Einträge).`);
