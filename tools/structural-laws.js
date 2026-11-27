'use strict';
// tools/structural-laws.js — CommonJS-Shim (Etappe 5) auf tools/laws/structural-laws.js.
//
// Der Pfad bleibt stabil, weil tools/reconciliation.js, Doku und ältere Aufrufer
// ihn nennen. Die Logik liegt in tools/laws/structural-laws.js.

const impl = require('./laws/structural-laws.js');

module.exports = impl;

if (require.main === module) {
  const { spawnSync } = require('node:child_process');
  const ziel = require.resolve('./laws/structural-laws.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(ergebnis.status ?? 1);
}
