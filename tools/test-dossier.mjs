#!/usr/bin/env node
// tools/test-dossier.mjs — Shim (Etappe 6): führt tools/content/test-dossier.mjs aus.
//
// Der Pfad bleibt stabil für `npm run docs:tests` und `din docs tests`.
// Logik liegt in tools/content/test-dossier.mjs.

import { generateDossier } from './content/test-dossier.mjs';

process.exitCode = generateDossier();
