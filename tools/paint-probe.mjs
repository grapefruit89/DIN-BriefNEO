#!/usr/bin/env node
// tools/paint-probe.mjs — Shim (Etappe 4): führt tools/measure/ttc.mjs aus.
//
// Der Pfad bleibt stabil für batch/02-boot-pfad und die dort belegten Läufe.
// Logik liegt in tools/measure/ttc.mjs.

import { probeTtc } from './measure/ttc.mjs';

process.exit(await probeTtc());
