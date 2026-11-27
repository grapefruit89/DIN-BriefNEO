#!/usr/bin/env node
// tools/build_grosskunden_columnar.mjs — Shim (Etappe 6): führt
// tools/content/build_grosskunden_columnar.mjs aus.
//
// Der Pfad bleibt stabil für .github/workflows/update_plz_data.yml und
// `din data grosskunden`. Logik liegt in tools/content/build_grosskunden_columnar.mjs.

import { buildGrosskunden } from './content/build_grosskunden_columnar.mjs';

try {
  process.exitCode = buildGrosskunden();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
