'use strict';
// tools/check-feature.js — Archiv-Shim (Etappe 6) auf tools/oneoff/check-feature.js.
//
// Das Werkzeug gilt als TOT (kein Aufrufer, installiert zur Laufzeit npm-Pakete).
// Es bleibt archiviert; der alte Pfad funktioniert unverändert weiter.

const { spawnSync } = require('node:child_process');

function run(args = process.argv.slice(2)) {
  const ziel = require.resolve('./oneoff/check-feature.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...args], { stdio: 'inherit' });
  return ergebnis.status ?? 1;
}

module.exports = { run };

if (require.main === module) {
  process.exit(run());
}
