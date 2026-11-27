#!/usr/bin/env node
// tools/print-messung.mjs — Shim (Etappe 4): führt tools/measure/pdf.mjs aus.
//
// Der Pfad bleibt stabil, bis alle Aufrufer (docs, map.md) auf den neuen
// Pfad zeigen. Logik liegt in tools/measure/pdf.mjs.

import { measurePdf } from './measure/pdf.mjs';

process.exit(await measurePdf());
