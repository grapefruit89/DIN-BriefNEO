/**
 * tools/laws/scan.mjs — Dateimuster-Abgleich fuer die Gesetzes-Sonden (ESM)
 *
 * Eigene Datei, weil ZWEI Werkzeuge dieselbe Entscheidung treffen muessen:
 * tools/reconciliation.js (welche Datei prueft eine Sonde?) und
 * tools/lawcoverage.js (trifft eine Sonde ueberhaupt irgendeine Datei?).
 * Zwei Kopien dieser Logik waeren genau der Fehler, den lawcoverage.js
 * aufdecken soll -- sie koennten auseinanderlaufen, und die Totsonden-Erkennung
 * wuerde dann etwas anderes messen als der Scanner tut.
 *
 * Das Modul liegt in der untersten Schicht (`laws/`): `fitness/` darf nach
 * unten importieren, nie umgekehrt (Blueprint K1/K2). Der alte Pfad
 * tools/filematch.js bleibt als CommonJS-Shim bestehen.
 *
 * HISTORIE: Bis 2026-10-02 verglich diese Funktion Pfadmuster mit `*` als
 * literalen String. "website/js/*.js" traf dadurch NIE eine Datei -- die Sonden
 * P3 (A49), P4 (A55) und P5 (A56) waren tot, ohne dass es auffiel.
 */

import path from 'node:path';

/** Wandelt ein Glob in einen Anker-Regex. `*` bleibt im Segment, `**` ueberschreitet es. */
export function globToRegExp(glob) {
  return new RegExp('^' + glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*') + '$');
}

export function matchFilePattern(filePath, patterns) {
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
