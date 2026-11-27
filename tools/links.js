'use strict';
// tools/links.js — CommonJS-Shim (Etappe 5) auf tools/laws/links.js.
//
// Der Pfad bleibt stabil, weil tools/reconciliation.js, Doku und ältere Aufrufer
// ihn nennen. Die Logik liegt in tools/laws/links.js.

const impl = require('./laws/links.js');

module.exports = impl;

if (require.main === module) {
  const { spawnSync } = require('node:child_process');
  const ziel = require.resolve('./laws/links.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(ergebnis.status ?? 1);
}
