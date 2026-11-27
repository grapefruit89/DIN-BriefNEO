'use strict';
// tools/imr.js — CommonJS-Shim (Etappe 5) auf tools/laws/imr.js.
//
// Der Pfad bleibt stabil, weil tools/reconciliation.js, Doku und ältere Aufrufer
// ihn nennen. Die Logik liegt in tools/laws/imr.js — dort ändern, nicht hier.
// require() liefert die Sonde; der Direktaufruf (`node tools/imr.js`) startet
// denselben CLI-Lauf wie die Implementierung.

const impl = require('./laws/imr.js');

module.exports = impl;

if (require.main === module) {
  const { spawnSync } = require('node:child_process');
  const ziel = require.resolve('./laws/imr.js');
  const ergebnis = spawnSync(process.execPath, [ziel, ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exit(ergebnis.status ?? 1);
}
