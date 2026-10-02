/**
 * tools/filematch.js — Dateimuster-Abgleich fuer Antipattern-Sonden
 *
 * Eigene Datei, weil ZWEI Werkzeuge dieselbe Entscheidung treffen muessen:
 * tools/reconciliation.js (welche Datei prueft eine Sonde?) und
 * tools/lawcoverage.js (trifft eine Sonde ueberhaupt irgendeine Datei?).
 * Zwei Kopien dieser Logik waeren genau der Fehler, den lawcoverage.js
 * aufdecken soll -- sie koennten auseinanderlaufen, und die Totsonden-Erkennung
 * wuerde dann etwas anderes messen als der Scanner tut.
 *
 * HISTORIE: Bis 2026-10-02 verglich diese Funktion Pfadmuster mit `*` als
 * literalen String. "website/js/*.js" traf dadurch NIE eine Datei -- die Sonden
 * P3 (A49), P4 (A55) und P5 (A56) waren tot, ohne dass es auffiel.
 */

const path = require('path');

/** Wandelt ein Glob in einen Anker-Regex. `*` bleibt im Segment, `**` ueberschreitet es. */
function globToRegExp(glob) {
  return new RegExp('^' + glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*') + '$');
}

function matchFilePattern(filePath, patterns) {
  const ext = path.extname(filePath).toLowerCase();
  return (patterns || []).some((pattern) => {
    if (pattern === '*' || pattern === '*.*') return true;
    if (pattern.startsWith('*.')) return ext === pattern.slice(1).toLowerCase();
    const normPattern = pattern.replace(/\\/g, '/');
    const normPath = filePath.replace(/\\/g, '/');
    if (normPattern.includes('*')) {
      const rx = globToRegExp(normPattern);
      return rx.test(normPath) || rx.test(normPath.replace(/^.*?(?=website\/)/, ''));
    }
    return normPath.endsWith(normPattern) || normPath.includes(normPattern);
  });
}

module.exports = { matchFilePattern, globToRegExp };
