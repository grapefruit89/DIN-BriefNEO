#!/usr/bin/env node
// tools/seeder-diff.mjs — Shim (Etappe 6): führt tools/oneoff/seeder-diff.mjs aus.
//
// Einmal-Differenztest Batch 05 (archiviert, Blueprint K5); der Pfad bleibt
// für bestehende Aufrufe und Doku stabil. Logik liegt in tools/oneoff/seeder-diff.mjs.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ziel = fileURLToPath(new URL('./oneoff/seeder-diff.mjs', import.meta.url));
const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(ergebnis.status ?? 1);
