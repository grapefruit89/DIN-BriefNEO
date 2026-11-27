// tools/laws/index.mjs — öffentliche Schnittstelle der Gesetzes-Sonden (Etappe 5).
//
// Nach außen genau zwei Namen: `runLaws()` und `SONDE_NAMEN`. Die Sonden selbst
// liegen in den Nachbardateien; `fitness/` importiert ausschließlich nach hier
// unten (Blueprint K1). Kein `laws/`-Modul darf `fitness/` importieren.
//
//   import { runLaws } from './laws/index.mjs';
//   const { violations, checked } = runLaws(['all']);
//
// Jede Sonde bekommt denselben Vertrag: `(targetDir) -> { violations, ... }`.
// Eine ausgefallene Sonde wird fail-closed als Verstoß gemeldet — ein kaputtes
// Gate darf den Score niemals heben.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import imr from './imr.js';
import structuralLaws from './structural-laws.js';
import isolation from './isolation.js';
import links from './links.js';
import terminology from './terminology.js';
import lawcoverage from './lawcoverage.js';
import idRegister from './id-register.js';

/** Repo-Wurzel: eine Ebene über `tools/`, also `../..` von hier aus. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Kanonische Sondennamen in Ausführungsreihenfolge. */
export const SONDE_NAMEN = ['imr', 'structure', 'isolation', 'links', 'terms', 'coverage', 'ids'];

const SONDEN = {
  imr: (root) => ({ violations: imr.checkImr(root).violations }),
  structure: (root) => ({ violations: structuralLaws.checkStructuralLaws(root) }),
  isolation: (root) => isolation.checkIsolation(root),
  links: (root) => links.checkLinks(root),
  terms: (root) => terminology.checkTerminology(root),
  coverage: (root) => lawcoverage.checkLawCoverage(root),
  ids: (root) => idRegister.checkIds(root),
};

/**
 * Führt alle (oder ausgewählte) Sonden aus und sammelt die Verstöße.
 *
 * @param {string[]} [names=['all']] Sondennamen (`all`, `imr`, `structure`,
 *   `isolation`, `links`, `terms`, `coverage`, `ids`).
 * @param {string} [targetDir=ROOT] Repo-Wurzel (für Tests/andere Checkouts).
 * @returns {{checked: string[], violations: {probe: string, file: string, line?: number, message: string}[], coverage?: object[]}}
 */
export function runLaws(names = ['all'], targetDir = ROOT) {
  const auswahl = names.includes('all')
    ? [...SONDE_NAMEN]
    : SONDE_NAMEN.filter((n) => names.includes(n));

  const violations = [];
  const coverage = [];
  for (const name of auswahl) {
    try {
      const res = SONDEN[name](targetDir) || {};
      for (const v of res.violations || []) {
        violations.push({
          probe: name,
          file: v.file || `tools/laws/${name}`,
          ...(v.line ? { line: v.line } : {}),
          message: v.message || String(v),
        });
      }
      if (res.coverage) coverage.push({ probe: name, ...res.coverage });
    } catch (err) {
      // Fail-closed: ein ausgefallenes Sub-Gate darf den Score nicht heben.
      violations.push({
        probe: name,
        file: `tools/laws/${name}.js`,
        message: `Sonde fehlgeschlagen (fail-closed): ${err.message}`,
      });
    }
  }

  return { checked: auswahl, violations, ...(coverage.length ? { coverage } : {}) };
}

/* ------------------------------------------------------------------- CLI */

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const namen = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const anfrage = namen.length ? namen : ['all'];
  const unbekannt = anfrage.filter((n) => n !== 'all' && !SONDE_NAMEN.includes(n));
  if (unbekannt.length) {
    console.error(`laws: unbekannte Sonde "${unbekannt.join(', ')}".`);
    console.error(`     Bekannt: all, ${SONDE_NAMEN.join(', ')}`);
    process.exit(2);
  }

  const { checked, violations, coverage } = runLaws(anfrage);
  if (violations.length > 0) {
    console.log(`GESETZE: ${violations.length} Verstoss/Verstoesse (${checked.join(', ')}):`);
    for (const v of violations) {
      console.log(`  [${v.probe}] ${v.file}${v.line ? `:${v.line}` : ''}: ${v.message}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`GESETZE OK: ${checked.length} Sonden, keine Verstoesse (${checked.join(', ')}).`);
  }
  for (const c of coverage || []) {
    console.log(`Abdeckung (${c.probe}): ${c.covered}/${c.laws} A-Gesetze maschinell geprueft.`);
  }
}
