// @ts-check
// @adr [[ADR-CSS]]

/**
 * @file ansicht.js — Benutzer-Anzeige: Blatt-Zoom und Nachtpalette.
 *
 * Beides sind **Ansichts-Sachen**, keine Briefdaten: sie ändern nichts am
 * Dokument, nur wie es auf dem Bildschirm erscheint. Deshalb liegen sie hier
 * zusammen und werden aus `settings.js` beim Start angewandt — damit eine
 * Einstellung den Reload überlebt, auch ohne offenes Debug-Panel.
 *
 * Gespeichert wird in `din_settings`:
 *   `nachtHelligkeit`   Grundhelligkeit der Nachtpalette, 0.38–0.68
 *
 * Gespeichert wird nur die **Nacht-Helligkeit**. Die Blattgröße steht fest in
 * `base.css` (`--blatt-breite-px: 900`, Herleitung im Kommentar dort) — ein
 * Regler dafür war über 200 Zeilen für eine Konstante (2026-11-24).
 */

import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';

/**
 * Abgeleitete Nacht-Tokens: [Name, Abstand zur Basis, Chroma, Hue].
 * Anthrazit statt Graublau: Chroma 0.004 — bei so wenig Buntstich ist der
 * Farbton praktisch neutral, der Token bleibt aber im gleichen Farbraum.
 * Der Schreibtisch liegt bewusst **unter** der Leiste (`-0.08`), damit das
 * helle Papier Tiefe bekommt.
 * @type {Array<[string, number, string, number]>}
 */
const NACHT_TOKENS = [
  ['--c-viewport-night', -0.08, '0.004', 250],
  ['--c-seitenleiste-night', 0.08, '0.004', 250],
  ['--c-card-night', 0.14, '0.004', 250],
  ['--c-border-night', -0.06, '0.005', 250],
  ['--c-segment-night', 0.03, '0.004', 250],
  ['--c-blatt-night', 0.26, '0.004', 250]
];

/** Erlaubte Spanne der Nacht-Grundhelligkeit. */
export const NACHT_MIN = 0.38;
export const NACHT_MAX = 0.68;
/** Erlaubte Spanne des Zooms (1 = 100 %). */

/**
 * @param {number} basis Grundhelligkeit 0.38–0.68
 * @returns {string} fertiger CSS-Block (für die Zwischenablage)
 */
export function nachtCss(basis) {
  const zeilen = NACHT_TOKENS.map(([name, abstand, chroma, hue]) => {
    const l = Math.max(0, Math.min(1, basis + abstand)).toFixed(3);
    return `  ${name}: oklch(${l} ${chroma} ${hue});`;
  });
  return `/* Nachtpalette, Grundhelligkeit ${basis.toFixed(2)} */\n:root {\n${zeilen.join('\n')}\n}`;
}

/**
 * Setzt die Nachtpalette auf `:root`. Inline gesetzt heißt: gilt für diese
 * Sitzung; der gespeicherte Wert wird beim nächsten Start wieder angewandt.
 * @param {number} basis
 * @returns {void}
 */
export function wendeNachtpalette(basis) {
  const wert = Math.max(NACHT_MIN, Math.min(NACHT_MAX, Number(basis) || 0.5));
  /* Nur die Basis: die Tokens leiten sich in CSS per calc() ab. So kann der
     erste Paint (boot.js) denselben Weg nehmen wie der Regler. */
  document.documentElement.style.setProperty('--nacht-basis', String(wert));
}


/**
 * Liest die gespeicherten Anzeige-Werte und wendet sie an. Wird beim Start
 * gerufen — unabhängig davon, ob das Debug-Panel offen ist.
 * @returns {void}
 */
export function wendeGespeicherteAnsicht() {
  const gespeichert = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  wendeNachtpalette(
    typeof gespeichert.nachtHelligkeit === 'number' ? gespeichert.nachtHelligkeit : 0.5
  );
}

/**
 * Schreibt einen Anzeige-Wert in `din_settings`, ohne andere Felder zu verlieren.
 * @param {'nachtHelligkeit'} feld
 * @param {number} wert
 * @returns {void}
 */
export function speichereAnsicht(feld, wert) {
  const werte = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  /** @type {Record<string, unknown>} */ (werte)[feld] = wert;
  saveJSON(STORAGE_KEYS.settings, werte);
}
