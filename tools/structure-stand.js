'use strict';
// tools/structure-stand.js
// Stand-Wert der generierten Struktur-Map (docs/STRUCTURE.md).
//
// Bewusst KEIN Commit-Hash und KEINE Uhrzeit: beides aendert sich, ohne dass sich
// der Inhalt der Datei aendert - dadurch schrieb jeder Commit einen neuen Wert in
// die Datei und der Arbeitsbaum war nach jedem Commit erneut "dirty".
// Stattdessen: SHA-256 ueber den Rumpf der Datei (alles ausser der Stand-Zeile),
// also ein rein inhaltlicher, reproduzierbarer Wert.
const crypto = require('crypto');

const STAND_RE = /<!-- Stand: [^\n]*-->\n?/;

/** Rumpf der Datei ohne Stand-Zeile (fuer Hash und Vergleich). */
function bodyOf(content) {
  return content.replace(STAND_RE, '');
}

/** Stand-Wert: SHA-256 (12 Zeichen) ueber den Rumpf. */
function computeStand(content) {
  return crypto.createHash('sha256').update(bodyOf(content), 'utf8').digest('hex').slice(0, 12);
}

module.exports = { bodyOf, computeStand, STAND_RE };
