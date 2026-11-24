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
 * Gespeichert wird die **Blattbreite in Pixeln** (`blattBreitePx`) und die
 * zuletzt benutzte Einheit (`zoomEinheit`). Ein Faktor wäre falsch: er
 * multipliziert sich mit jeder Änderung der Grundgröße (Befund 2026-11-24:
 * 900 px wurden durch einen alten Faktor 1,04 zu 936 px).
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

/** Erlaubte Blattbreite in CSS-Pixeln. */
export const BREITE_MIN = 400;
/**
 * Blattbreite in CSS-Pixeln, die am Referenzmonitor 1:1 ist.
 *
 * Herleitung Pixel -> Zoll -> Zentimeter:
 *   108,8 ppi = sqrt(2560² + 1440²) / 27 Zoll   (Referenzmonitor)
 *   900 px / 108,8 ppi = 8,27 Zoll
 *   8,27 Zoll * 2,54   = 21,0 cm Papier
 * CSS nimmt fest 96 px/Zoll an; 21 cm waeren dort 793,7 px. Auf 109 ppi wirkt
 * das Blatt deshalb 12 % zu klein — 900 / 793,7 = 1,134 gleicht das aus.
 * Anderer Monitor = andere Dichte, siehe Debug-Panel.
 */
export const BREITE_ORIGINAL = 900;
export const BREITE_MAX = 1200;
/** 210 mm bei 96 dpi — Bezugspunkt fuer die Prozent-Anzeige. */
export const MM_PX = 793.7;

/**
 * Setzt die Blattbreite. Das CSS rechnet `zoom = breite / 793.7`; hier wird nur
 * die Breite geschrieben, damit es keinen zweiten Faktor gibt, der sich mit
 * etwas anderem multipliziert (Befund 2026-11-24: 900 px wurden durch einen
 * gespeicherten Zoom zu 936 px).
 * @param {number} px
 * @returns {number} die angewandte Breite
 */
export function wendeBlattBreite(px) {
  const wert = Math.round(Math.max(BREITE_MIN, Math.min(BREITE_MAX, Number(px) || 900)));
  document.documentElement.style.setProperty('--blatt-breite-px', String(wert));
  return wert;
}

/** Seitenverhaeltnis DIN A4 (297 / 210) — fuer die Hoehenrechnung. */
const A4_HOEHE_FAKTOR = 297 / 210;

/**
 * Groesste Blattbreite, die **komplett** in den Viewport passt.
 *
 * Das Blatt ist A4, die Hoehe waechst also mit der Breite: bei 900 px Breite
 * sind es 1272 px Hoehe. Auf einem Full-HD-Monitor (1080 px hoch) passt das
 * nie — hier wird die Breite so weit reduziert, dass Breite *und* Hoehe
 * hineinpassen. Nur eine Anzeige-Hilfe, keine Aenderung am Brief.
 * @param {number} [rand] Abstand zum Rand in px
 * @returns {number} passende Breite in px
 */
export function passendeBreite(rand = 40) {
  const vp = document.getElementById('viewport');
  if (!vp) return 900;
  const platzBreite = vp.clientWidth - rand;
  const platzHoehe = vp.clientHeight - rand;
  const nachBreite = platzBreite;
  const nachHoehe = platzHoehe / A4_HOEHE_FAKTOR;
  return Math.max(BREITE_MIN, Math.round(Math.min(nachBreite, nachHoehe)));
}

/**
 * Liest die gespeicherten Anzeige-Werte und wendet sie an. Wird beim Start
 * gerufen — unabhängig davon, ob das Debug-Panel offen ist.
 * @returns {void}
 */
export function wendeGespeicherteAnsicht() {
  const gespeichert = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  wendeBlattBreite(typeof gespeichert.blattBreitePx === 'number' ? gespeichert.blattBreitePx : 900);
  wendeNachtpalette(
    typeof gespeichert.nachtHelligkeit === 'number' ? gespeichert.nachtHelligkeit : 0.5
  );
}

/**
 * Schreibt einen Anzeige-Wert in `din_settings`, ohne andere Felder zu verlieren.
 * @param {'nachtHelligkeit' | 'blattBreitePx' | 'zoomEinheit'} feld
 * @param {number | string} wert
 * @returns {void}
 */
export function speichereAnsicht(feld, wert) {
  const werte = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  /** @type {Record<string, unknown>} */ (werte)[feld] = wert;
  saveJSON(STORAGE_KEYS.settings, werte);
}
