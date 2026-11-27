'use strict';
// tools/reconciliation.js — CommonJS-Shim (Etappe 5) auf tools/fitness/reconciliation.js.
//
// Der Pfad bleibt stabil, weil package.json (`check:antipatterns`) und ältere
// Aufrufer ihn nennen. Die Logik liegt in tools/fitness/reconciliation.js.

const impl = require('./fitness/reconciliation.js');

module.exports = impl;

if (require.main === module) {
  const { spawnSync } = require('node:child_process');
  const ziel = require.resolve('./fitness/reconciliation.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(ergebnis.status ?? 1);
}
