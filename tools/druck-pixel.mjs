#!/usr/bin/env node
// tools/druck-pixel.mjs — Shim (Etappe 4): führt tools/measure/pixel.mjs aus.
//
// Der Pfad bleibt stabil für die Vorher/Nachher-Pixel-Diffs in /tmp/opencode.
// Logik liegt in tools/measure/pixel.mjs.

import { diffPixels } from './measure/pixel.mjs';

process.exit(await diffPixels(process.argv[2]));
