#!/usr/bin/env node
// tools/druck-pixel.mjs — Shim (Etappe 4): führt tools/measure/pixel.mjs aus.
//
// Der Pfad bleibt stabil für bestehende Aufrufe, Skripte und Doku-Verweise.
// Logik liegt in tools/measure/pixel.mjs.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ziel = fileURLToPath(new URL('./measure/pixel.mjs', import.meta.url));
const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(ergebnis.status ?? 1);
