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
import { ClipboardAddressParser } from '../../website/js/address.js';
import { SalutationEngine } from '../../website/js/salutation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORPUS_PATH = path.join(__dirname, 'address-cases.json');

const cases = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf-8'));

let passed = 0;
let failed = 0;
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

  // 1. Anrede-Prüfung
  if (c.expect.anrede !== undefined) {
    const got = SalutationEngine.derive({ rawName: c.input, formality: c.formality || 'formal' });
    if (got !== c.expect.anrede) {
      ok = false;
      reason = `Anrede: Erwartet "${c.expect.anrede}", erhalten "${got}"`;
    }
  }

  // 2. Direkte Straßenklassifikation (isStreetLine)
  if (ok && c.expect.is_street !== undefined) {
    const got = ClipboardAddressParser.isStreetLine(c.input);
    if (got !== c.expect.is_street) {
      ok = false;
      reason = `isStreetLine: Erwartet ${c.expect.is_street}, erhalten ${got}`;
    }
  }

  // 3. Direkte Firmenklassifikation (isCorporate)
  if (ok && c.expect.is_corporate !== undefined) {
    const got = ClipboardAddressParser.isCorporate(c.input);
    if (got !== c.expect.is_corporate) {
      ok = false;
      reason = `isCorporate: Erwartet ${c.expect.is_corporate}, erhalten ${got}`;
    }
  }

  // 4. Metadaten-Erkennung (METADATA_LINE_REGEX)
  if (ok && c.expect.is_metadata !== undefined) {
    const got = ClipboardAddressParser.METADATA_LINE_REGEX.test(c.input);
    if (got !== c.expect.is_metadata) {
      ok = false;
      reason = `is_metadata: Erwartet ${c.expect.is_metadata}, erhalten ${got}`;
    }
  }

  // 5. Exakte Kandidaten-Anzahl (z. B. 0 bei Negativfällen)
  if (ok && c.expect.candidates !== undefined) {
    const cands = ClipboardAddressParser.parse(c.input);
    if (cands.length !== c.expect.candidates) {
      ok = false;
      reason = `Kandidatenanzahl: Erwartet ${c.expect.candidates}, erhalten ${cands.length}`;
    }
  }

  // 6. Adressfeld-Extraktion (strasse, plz, ort, firma, name, zusatz)
  const addrKeys = ['strasse', 'plz', 'ort', 'firma', 'name', 'zusatz'];
  const expectedAddrKeys = addrKeys.filter((k) => c.expect[k] !== undefined);

  if (ok && expectedAddrKeys.length > 0) {
    const cands = ClipboardAddressParser.parse(c.input);
    if (cands.length === 0) {
      ok = false;
      reason = 'Kein Adresskandidat extrahiert (erwartet mindestens 1)';
    } else {
      const top = cands[0];
      for (const k of expectedAddrKeys) {
        if (top[k] !== c.expect[k]) {
          ok = false;
          reason = `Feld "${k}": Erwartet "${c.expect[k]}", erhalten "${top[k]}"`;
          break;
        }
      }
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
  console.log(`\x1b[32m✓ Korpus-Gate: ${passed} ok, ${failed} fail, ${known} known (${duration}ms)\x1b[0m [${setReport}]`);
  console.log(`   Kategorien: ${tagsReport}`);
  process.exit(0);
} else {
  console.error(`\x1b[31m✗ Korpus-Gate fehlgeschlagen: ${passed} ok, ${failed} fail, ${known} known (${duration}ms)\x1b[0m [${setReport}]`);
  console.error(`   Kategorien: ${tagsReport}`);
  process.exit(1);
}
