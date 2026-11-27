#!/usr/bin/env node
// tools/print-messung.mjs — Shim (Etappe 4): führt tools/measure/pdf.mjs aus.
//
// Der Pfad bleibt stabil für bestehende Aufrufe, Skripte und Doku-Verweise.
// Logik liegt in tools/measure/pdf.mjs.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ziel = fileURLToPath(new URL('./measure/pdf.mjs', import.meta.url));
const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(ergebnis.status ?? 1);
