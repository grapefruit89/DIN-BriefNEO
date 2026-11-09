#!/usr/bin/env node
// tools/migrate_figuren_tuples.mjs — Konvertierung des Figurenkatalogs auf Tuple-Format v2.1

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_FILE = path.join(ROOT, 'website', 'addons', 'testbrief', 'figuren.json');
const TARGET_FIGUREN = path.join(ROOT, 'website', 'addons', 'testbrief', 'figuren.json');

const raw = JSON.parse(readFileSync(SOURCE_FILE, 'utf8'));

const FEMALES = new Set([
  'Ahsoka Tano', 'Alyx Vance', 'Annabeth Chase', 'Arya Stark', 'Batgirl',
  'Black Widow', 'Bulma', 'Cersei Lennister', 'Chihiro Ogino', 'Ciri',
  'Clementine', 'Daenerys Targaryen', 'Eleven', 'Elizabeth', 'Elizabeth Swann',
  'Ellen Ripley', 'Gwen Stacy', 'Harley Quinn', 'Hermine Granger', 'Invisible Woman',
  'Jean Grey', 'Jessica Jones', 'Jessie', 'Jill Valentine', 'Katniss Everdeen',
  'Lady Jessica', 'Lara Croft', 'Leia Organa', 'Lisa Simpson', 'Mabel Pines',
  'Maggie Simpson', 'Marge Gunderson', 'Marge Simpson', 'Mary Poppins', 'Mikasa Ackerman',
  'Mikoto Misaka', 'Minerva McGonagall', 'Miss Marple', 'Momo', 'Nami',
  'Pippi Langstrumpf', 'Prinzessin Daisy', 'Prinzessin Peach', 'Prinzessin Zelda', 'Rey',
  'Sailor Moon', 'Sakura Haruno', 'Samus Aran', 'Sarah Connor', 'Sarah Jane Smith',
  'Schlumpfine', 'Storm', 'Tali\'Zorah', 'Theresa', 'Turanga Leela',
  'Velma Dinkley', 'Wonder Woman', 'Yennefer von Vengerberg'
]);

const DIVERS = new Set([
  'Agent Smith', 'Bill Cipher', 'Commander Shepard', 'Cortana', 'Dalton-Brüder',
  'Der Doktor', 'Discworld-Tod', 'GLaDOS', 'Grogu', 'Kirby',
  'Pikachu', 'Ryuk', 'Schulze & Schultze', 'T-800', 'Totoro',
  'V', 'Xenomorph'
]);

const SCHEMA = [
  'name',
  'buergerlicherName',
  'alias',
  'geschlecht',
  'firma',
  'strasse',
  'plz',
  'ort',
  'franchise',
  'medium',
  'rolle',
  'hinweis',
  'quellenAnzahl',
  'hooks'
];

function getGender(name) {
  if (FEMALES.has(name)) return 'f';
  if (DIVERS.has(name)) return 'd';
  return 'm';
}

const inputFigures = Array.isArray(raw) ? raw : (raw.figuren || []);

const tupleFigures = inputFigures.map((f) => {
  const geschlecht = getGender(f.name);
  return [
    String(f.name ?? '').trim(),
    String(f.buergerlicherName ?? '').trim(),
    Array.isArray(f.alias) ? f.alias : [],
    geschlecht,
    String(f.firma ?? '').trim(),
    String(f.strasse ?? '').trim(),
    String(f.plz ?? '').trim(),
    String(f.ort ?? '').trim(),
    String(f.franchise ?? '').trim(),
    String(f.medium ?? '').trim(),
    String(f.rolle ?? '').trim(),
    String(f.hinweis ?? '').trim(),
    Number(f.quellenAnzahl || 1),
    Array.isArray(f.hooks) ? f.hooks : []
  ];
});

const output = {
  _meta: {
    ...raw._meta,
    version: '2.1',
    stand: '2026-11-09',
    figuren: tupleFigures.length,
    schema: SCHEMA
  },
  figuren: tupleFigures
};

// Validierung: Keine null/undefined-Werte und exakt 14 Spalten
for (let i = 0; i < tupleFigures.length; i++) {
  const row = tupleFigures[i];
  if (row.length !== 14) {
    throw new Error(`Reihe ${i} hat ${row.length} statt 14 Spalten: ${row[0]}`);
  }
  for (let c = 0; c < row.length; c++) {
    if (row[c] === null || row[c] === undefined) {
      throw new Error(`Reihe ${i} Spalte ${c} ist null/undefined: ${row[0]}`);
    }
  }
}

const jsonString = JSON.stringify(output, null, 2) + '\n';
writeFileSync(TARGET_FIGUREN, jsonString, 'utf8');

console.log(`✓ Erfolgreich ${tupleFigures.length} Figuren nach Schema v2.1 migriert.`);
console.log(`  - figuren.json: ${TARGET_FIGUREN}`);
