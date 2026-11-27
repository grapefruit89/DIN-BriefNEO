'use strict';
// tools/structure-stand.js — CommonJS-Shim auf tools/fitness/structure-stand.js
//
// Die Stand-Berechnung lebt seit Etappe 2 im Modul `fitness/`. Dieser Pfad
// bleibt bestehen, damit tools/build_db.js und tools/reconciliation.js ohne
// Code-Aenderung `require('./structure-stand.js')` nutzen koennen.
module.exports = require('./fitness/structure-stand.js');
