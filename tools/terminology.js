'use strict';
// tools/terminology.js — CommonJS-Shim (Etappe 5) auf tools/laws/terminology.js.
//
// Der Pfad bleibt stabil, weil tools/reconciliation.js, Doku und ältere Aufrufer
// ihn nennen. Die Logik liegt in tools/laws/terminology.js.

const impl = require('./laws/terminology.js');

module.exports = impl;

if (require.main === module) {
  const { spawnSync } = require('node:child_process');
  const ziel = require.resolve('./laws/terminology.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(ergebnis.status ?? 1);
}
