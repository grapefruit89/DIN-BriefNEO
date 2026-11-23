#!/usr/bin/env node
// @ts-nocheck
/**
 * test/corpus/run.js — Korpus-Testrunner für Anschriften, Straßen & Anreden
 * Zero-Dependency Test-Runner für messbare Adress-Erkennung gegen address-cases.json
 * Unterstützt Tag-Kategorien, Partitionen (regression/holdout) und known_fail.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SalutationEngine } from '../../website/js/salutation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORPUS_PATH = path.join(__dirname, 'address-cases.json');

const cases = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf-8'));

let passed = 0;
let failed = 0;
let skipped = 0;
let known = 0;

const statsByTag = {};
const statsBySet = {
  regression: { passed: 0, failed: 0, known: 0 },
  holdout: { passed: 0, failed: 0, known: 0 },
};

const start = performance.now();

for (const c of cases) {
  const tag = c.tag || 'other';
  const set = c.set || 'regression';
  if (!statsByTag[tag]) statsByTag[tag] = { passed: 0, failed: 0, known: 0 };
  if (!statsBySet[set]) statsBySet[set] = { passed: 0, failed: 0, known: 0 };

  let ok = true;
  let reason = '';

  /* Der Zwischenablage-Parser ist am 2026-11-22 entfallen. Faelle, die nur
     seine Erwartungen tragen (is_street/is_corporate/is_metadata/candidates/
     Adressfelder), sind nicht mehr pruefbar - sie werden gezaehlt, nicht als
     "bestanden" verbucht. */
  const PARSER_KEYS = ['is_street', 'is_corporate', 'is_metadata', 'candidates', 'strasse', 'plz', 'ort', 'firma', 'name', 'zusatz'];
  if (Object.keys(c.expect).every((k) => PARSER_KEYS.includes(k))) {
    skipped++;
    continue;
  }

  // 1. Anrede-Prüfung
  if (c.expect.anrede !== undefined) {
    const got = SalutationEngine.derive({ rawName: c.input, formality: c.formality || 'formal' });
    if (got !== c.expect.anrede) {
      ok = false;
      reason = `Anrede: Erwartet "${c.expect.anrede}", erhalten "${got}"`;
    }
  }

  if (ok) {
    passed++;
    statsByTag[tag].passed++;
    statsBySet[set].passed++;
  } else if (c.known_fail) {
    known++;
    statsByTag[tag].known++;
    statsBySet[set].known++;
    console.warn(`[KNOWN FAIL] ${c.id} (${set}): ${c.description || ''} (${reason})`);
  } else {
    failed++;
    statsByTag[tag].failed++;
    statsBySet[set].failed++;
    console.error(`\x1b[31m✗ FAIL\x1b[0m [${c.id}] (${set}) ${c.description || ''}\n    Eingabe: ${JSON.stringify(c.input)}\n    Grund:   ${reason}`);
  }
}

const duration = (performance.now() - start).toFixed(1);

// Detaillierter Kategorien-Report
const tagsReport = Object.entries(statsByTag)
  .map(([tag, s]) => `${tag}: ${s.passed}/${s.passed + s.failed + s.known}`)
  .join(' | ');

const setReport = Object.entries(statsBySet)
  .filter(([_, s]) => s.passed + s.failed + s.known > 0)
  .map(([set, s]) => `${set}: ${s.passed}/${s.passed + s.failed + s.known}`)
  .join(', ');

if (failed === 0) {
  console.log(`\x1b[32m✓ Korpus-Gate: ${passed} ok, ${failed} fail, ${known} known, ${skipped} skipped (${duration}ms)\x1b[0m [${setReport}]`);
  console.log(`   Kategorien: ${tagsReport}`);
  process.exit(0);
} else {
  console.error(`\x1b[31m✗ Korpus-Gate fehlgeschlagen: ${passed} ok, ${failed} fail, ${known} known (${duration}ms)\x1b[0m [${setReport}]`);
  console.error(`   Kategorien: ${tagsReport}`);
  process.exit(1);
}
