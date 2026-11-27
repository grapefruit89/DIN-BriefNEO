#!/usr/bin/env node
// tools/mess-print.mjs — Shim (Etappe 4): führt tools/measure/print.mjs aus.
//
// Der Pfad bleibt stabil für tools/dev.sh und docs/meta/AUFGABEN-WEGWEISER.md.
// Logik liegt in tools/measure/print.mjs.

import { measurePrint } from './measure/print.mjs';

console.log(await measurePrint());
process.exit(0);
