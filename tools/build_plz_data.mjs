#!/usr/bin/env node
// tools/build_plz_data.mjs — Shim (Etappe 6): führt tools/content/build_plz_data.mjs aus.
//
// Der Pfad bleibt stabil für `npm run build:data`, .github/workflows/update_plz_data.yml
// und `din data plz`. Logik liegt in tools/content/build_plz_data.mjs.

import { buildPlzData } from './content/build_plz_data.mjs';

try {
  await buildPlzData();
} catch (err) {
  console.error('\nFEHLER in PLZ-Pipeline:', err);
  process.exitCode = 1;
}
