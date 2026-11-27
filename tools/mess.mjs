#!/usr/bin/env node
// tools/mess.mjs — Shim (Etappe 4): führt tools/measure/sheet.mjs aus.
//
// Der Pfad bleibt der kanonische Aufruf (din measure sheet, docs/meta/
// AUFGABEN-WEGWEISER.md). Logik liegt in tools/measure/sheet.mjs.

import { measureSheet } from './measure/sheet.mjs';

process.exit(await measureSheet());
