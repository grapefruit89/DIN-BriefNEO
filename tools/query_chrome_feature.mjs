#!/usr/bin/env node
// tools/query_chrome_feature.mjs — Shim (Etappe 6): führt
// tools/content/query_chrome_feature.mjs aus.
//
// Der Pfad bleibt stabil für `npm run check:browser-feature`, docs/norm/
// GUIDELINES-BROWSER-UPSTREAM.md und `din content feature`.

import { queryFeature } from './content/query_chrome_feature.mjs';

process.exitCode = await queryFeature();
