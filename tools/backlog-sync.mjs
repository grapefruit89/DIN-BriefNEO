#!/usr/bin/env node
// tools/backlog-sync.mjs — Shim (Etappe 6): führt tools/content/backlog-sync.mjs aus.
//
// Der Pfad bleibt stabil für `npm run docs:backlog` und `din docs backlog`.
// Logik liegt in tools/content/backlog-sync.mjs.

import { syncBacklog } from './content/backlog-sync.mjs';

process.exitCode = syncBacklog();
