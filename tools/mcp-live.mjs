#!/usr/bin/env node
// tools/mcp-live.mjs — Shim (Etappe 3): führt tools/runtime/mcp-live.mjs aus.
//
// Der Pfad bleibt stabil, weil website/js/settings.js ihn in die generierte
// MCP-Konfiguration schreibt und tools/dev.sh ihn als Prozess erkennt
// (/proc-Cmdline-Match). Logik liegt in tools/runtime/mcp-live.mjs.

import { startLive } from './runtime/mcp-live.mjs';

process.exitCode = await startLive();
