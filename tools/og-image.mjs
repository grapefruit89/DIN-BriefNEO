#!/usr/bin/env node
// tools/og-image.mjs — Shim (Etappe 6): führt tools/oneoff/og-image.mjs aus.
//
// Einmaliger OG-Image-Generator; der Pfad bleibt als Archiv-/Altaufruf stabil.
// Logik liegt in tools/oneoff/og-image.mjs.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ziel = fileURLToPath(new URL('./oneoff/og-image.mjs', import.meta.url));
const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(ergebnis.status ?? 1);
