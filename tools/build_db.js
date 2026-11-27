'use strict';
// tools/build_db.js — CommonJS-Shim (Etappe 5) auf tools/fitness/build_db.js.
//
// Der Pfad bleibt stabil: package.json (`check:fitness`, `docs:index`), CI,
// githooks/pre-commit und Doku nennen ihn. Die Logik liegt in
// tools/fitness/build_db.js — dort ändern, nicht hier.

const impl = require('./fitness/build_db.js');

module.exports = impl;

if (require.main === module) {
  const { spawnSync } = require('node:child_process');
  const ziel = require.resolve('./fitness/build_db.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(ergebnis.status ?? 1);
}
