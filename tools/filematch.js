/**
 * tools/filematch.js — CommonJS-Shim auf tools/laws/scan.mjs (Etappe 2)
 *
 * Die Logik lebt seit Etappe 2 in tools/laws/scan.mjs (unterste Schicht,
 * `fitness/` importiert nur nach unten). Dieser Pfad bleibt bestehen, damit
 * tools/reconciliation.js und tools/lawcoverage.js ohne Code-Aenderung
 * `require('./filematch.js')` nutzen koennen -- inklusive der Totsonden-
 * Erkennung, die auf exakt derselben Matcher-Semantik beruht.
 *
 * Node >= 22.12 laedt ESM-Module synchron per require(); das Projekt und die
 * CI laufen auf Node 22.
 */
'use strict';

module.exports = require('./laws/scan.mjs');
