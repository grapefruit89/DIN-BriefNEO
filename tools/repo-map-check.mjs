#!/usr/bin/env node
// tools/repo-map-check.mjs — Shim (Etappe 5): führt tools/fitness/repo-map-check.mjs aus.
//
// Der Pfad bleibt stabil für bestehende Aufrufe, Skripte und Doku-Verweise.
// Logik liegt in tools/fitness/repo-map-check.mjs.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ziel = fileURLToPath(new URL('./fitness/repo-map-check.mjs', import.meta.url));
const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(ergebnis.status ?? 1);
