'use strict';
// tools/adr-check.js — CommonJS-Shim (Etappe 6) auf tools/content/adr-check.js.
//
// Der Pfad bleibt stabil für Doku, `din content adr` und ältere Aufrufer.
// Die Logik liegt in tools/content/adr-check.js — dort ändern, nicht hier.

const impl = require('./content/adr-check.js');

module.exports = impl;

if (require.main === module) {
  process.exitCode = impl.checkAdr();
}
