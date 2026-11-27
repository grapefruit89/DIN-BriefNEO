// tools/fitness/index.mjs — öffentliche Schnittstelle des Gate-Moduls (Etappe 5).
//
// Nach außen genau drei Namen; die Implementierung liegt in build_db.js
// (Score + docs/STRUCTURE.md), reconciliation.js (Score-Engine, Regeln) und
// repo-map-check.mjs (Wegweiser-Gate). Schichtung: `fitness/` importiert nur
// nach unten nach `laws/`, niemals umgekehrt (Blueprint K1).
//
//   import { runFitness, generateStructure, runRules } from './fitness/index.mjs';
//   runFitness(['-q']);        // ganzer Gate-Lauf (Status-Code)
//   runRules();                // nur Antipattern-Regeln (Pre-Commit)
//   generateStructure(root);   // nur docs/STRUCTURE.md schreiben
//
// `runFitness`/`runRules` starten die bestehenden Skripte als Kindprozess
// (stdio: inherit) und liefern deren Exit-Code — dieselbe Semantik wie `din`.
// Kein process.exit() im Aufrufer, kein doppeltes Laden der Gate-Logik.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import buildDb from './build_db.js';

const HIER = path.dirname(fileURLToPath(import.meta.url));

function starte(datei, argumente, optionen = {}) {
  const ziel = path.join(HIER, datei);
  const ergebnis = spawnSync(process.execPath, [ziel, ...argumente], {
    cwd: optionen.cwd,
    stdio: optionen.stdio || 'inherit',
    env: process.env,
  });
  if (ergebnis.error) {
    console.error(`fitness: Kindprozess fehlgeschlagen: ${ziel}`);
    console.error(`         ${ergebnis.error.message}`);
    return 2;
  }
  return typeof ergebnis.status === 'number' ? ergebnis.status : 1;
}

/**
 * Ganzer Fitness-Gate-Lauf: Wegweiser-Gate, docs/STRUCTURE.md, Score.
 * @param {string[]} [args=[]] Flags (`-q`, `-v`, …) — unverändert an build_db.js.
 * @param {{cwd?: string, stdio?: import('node:child_process').StdioOptions}} [optionen]
 * @returns {number} Exit-Code (0 ok, 1 Gate rot, 2 Vorbedingung)
 */
export function runFitness(args = [], optionen = {}) {
  return starte('build_db.js', args, optionen);
}

/**
 * Nur die Antipattern-Regeln (Pre-Commit): reconciliation.js --only-rules.
 * @param {string[]} [args=[]]
 * @param {{cwd?: string, stdio?: import('node:child_process').StdioOptions}} [optionen]
 * @returns {number} Exit-Code (0 ok, 1 Verstoß)
 */
export function runRules(args = [], optionen = {}) {
  return starte('reconciliation.js', ['--only-rules', ...args], optionen);
}

/**
 * Schreibt nur docs/STRUCTURE.md (inkl. Stand-Hash), ohne Score-Lauf.
 * @param {string} [targetDir] Repo-Wurzel; Standard ist die echte Wurzel.
 */
export function generateStructure(targetDir) {
  return buildDb.generateStructure(targetDir);
}
