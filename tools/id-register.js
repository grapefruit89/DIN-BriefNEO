'use strict';
// tools/id-register.js — CommonJS-Shim (Etappe 5) auf tools/laws/id-register.js.
//
// Der Pfad bleibt stabil, weil tools/reconciliation.js, Doku und ältere Aufrufer
// ihn nennen. Die Logik liegt in tools/laws/id-register.js.

const impl = require('./laws/id-register.js');

module.exports = impl;

if (require.main === module) {
  const { spawnSync } = require('node:child_process');
  const ziel = require.resolve('./laws/id-register.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(ergebnis.status ?? 1);
}
