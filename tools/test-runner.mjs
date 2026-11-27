#!/usr/bin/env node
// tools/test-runner.mjs — Shim (Etappe 3): führt tools/runtime/runner.mjs aus.
//
// Der Pfad bleibt der kanonische Aufruf: `npm test` (package.json),
// .github/workflows/fitness.yml, docs/meta/AUFGABEN-WEGWEISER.md und `din test`.
// Logik liegt in tools/runtime/runner.mjs — hier steht kein Testcode.

import { runTests } from './runtime/runner.mjs';

process.exit(await runTests());
