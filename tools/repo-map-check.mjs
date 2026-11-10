#!/usr/bin/env node
// tools/repo-map-check.mjs — Existenz-Gate fuer docs/30-meta/AUFGABEN-WEGWEISER.md
//
// Zwei Richtungen, beide billig und beide notwendig:
//   1. Jeder im Wegweiser genannte Pfad (website/…, tools/…, test/…, docs/…) existiert.
//   2. Jedes Modul aus website/js/ ist im Wegweiser erwaehnt — sonst veraltet die
//      Modulliste still, sobald jemand eine Datei ergaenzt.
//
// Inhaltliche Korrektheit prueft das Gate nicht; das ist Review-Aufgabe.
// Aufruf: node tools/repo-map-check.mjs   (wird von tools/build_db.js mitgerufen)

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAP_REL = 'docs/30-meta/AUFGABEN-WEGWEISER.md';
const MAP = path.join(ROOT, MAP_REL);

if (!existsSync(MAP)) {
  console.error(`FEHLT: ${MAP_REL} — Wegweiser existiert nicht.`);
  process.exit(1);
}

const text = readFileSync(MAP, 'utf8');
const fehler = [];

// 1) Genannte Pfade muessen existieren
const pfade = new Set();
for (const match of text.matchAll(/`((?:website|tools|test|docs)\/[^`\s]+)`/g)) {
  const pfad = match[1]
    .replace(/[.,;:]+$/, '')
    .replace(/[#?].*$/, '');
  if (pfad.includes('*')) continue; // Glob-Muster sind keine Pfade
  pfade.add(pfad);
}
for (const pfad of pfade) {
  if (!existsSync(path.join(ROOT, pfad))) fehler.push(`FEHLT: ${pfad}`);
}

// 2) Jedes JS-Modul aus website/js/ muss erwaehnt sein
const jsDir = path.join(ROOT, 'website', 'js');
const module = readdirSync(jsDir).filter((f) => f.endsWith('.js'));
for (const datei of module) {
  const rel = `website/js/${datei}`;
  if (!text.includes(rel)) fehler.push(`NICHT ERWÄHNT: ${rel}`);
}

if (fehler.length > 0) {
  for (const f of fehler) console.error(f);
  console.error(`\n❌ Wegweiser-Gate: ${fehler.length} Problem(e).`);
  process.exit(1);
}

console.log(`✓ Wegweiser: ${pfade.size} Pfade geprüft, ${module.length} Module erwähnt.`);
