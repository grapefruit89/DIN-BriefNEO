#!/usr/bin/env node
// tools/testbrief-messung.mjs — Shim (Etappe 4): führt tools/measure/brief.mjs aus.
//
// Der Pfad bleibt stabil für docs/meta/AUFGABEN-WEGWEISER.md und map.md.
// Logik liegt in tools/measure/brief.mjs.

import { measureBrief } from './measure/brief.mjs';

process.exit(await measureBrief());
