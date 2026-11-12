#!/usr/bin/env node
/**
 * tools/serve.mjs — Dev-Server mit harten No-Cache-Headern.
 *
 * Warum nicht `python3 -m http.server`: der sendet nur Last-Modified, ohne
 * Cache-Control. Browser dürfen dann heuristisch cachen — ES-Module bleiben
 * dadurch veraltet, obwohl das HTML schon neu ist (gemessen 2026-11-12: Tab
 * mit neuem `data-atom`, aber alter testbrief.js, die noch textContent schrieb).
 *
 * Aufruf: node tools/serve.mjs [root] [port]
 */
import path from 'node:path';
import { startStaticServer } from './static-server.mjs';

/* Absolut, weil static-server.mjs den Pfad gegen root prueft (startsWith). */
const root = path.resolve(process.argv[2] ?? '.');
const port = Number(process.argv[3] ?? 8088);
const s = await startStaticServer(root, port);
console.log(`[OK] ${root} auf http://127.0.0.1:${s.port} (no-cache)`);
