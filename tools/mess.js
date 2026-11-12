// @ts-check
/**
 * tools/mess.js — Messwerte aus dem laufenden Brief, ohne Screenshot.
 *
 * Aufruf ueber chrome-devtools-MCP:
 *   evaluate_script({ sourcePath: "/home/moritz/repos/DIN-BriefNEO/tools/mess.js",
 *                     format: "function", pageId: 1 })
 *
 * Rueckgabe: EINE Zeile JSON, Millimeter, auf 0,1 gerundet.
 *   { b: [Blatthoehe_mm, data-ueberlauf], f: { id: [y_mm, h_mm, sichtbar] } }
 *
 * Warum kein PNG: ein Screenshot kostet Bild-Token und liefert keine Zahl.
 * Fuer Geometrie, Ueberlauf und Verschiebungen reicht dieses JSON; ein Bild
 * ist nur bei echter Optik-Frage noetig (und dann elementscharf, nicht fullPage).
 *
 * Andere Felder messen: vorher `window.__messIds = ['id1','id2']` setzen.
 */

() => {
  /* Alle Werte RELATIV ZUM BLATT (Blattkante = 0). Viewport-Y haengt von
     Scrollposition und Fensterhoehe ab - damit war "Betreff 73,7mm" nur eine
     zufaellige Scrolllage (gemessen 2026-11-12). */
  const blatt = document.querySelector('din-blatt');
  const blattRect = blatt?.getBoundingClientRect() ?? { top: 0, left: 0, height: 0 };
  const px2mm = 25.4 / 96;
  /** @param {number} v */
  const mm = (v) => Number((v * px2mm).toFixed(1));

  const standard = [
    'betreff',
    'anrede',
    'text',
    'grussformel',
    'unterschrift',
    'anlagenvermerk',
    'vermerke',
    'rucksendeangabe',
    'anschriftfeld',
    'unterschriftsbild-container',
  ];
  // @ts-ignore — Debug-Haken, absichtlich nicht typisiert
  const ids = Array.isArray(window.__messIds) && window.__messIds.length ? window.__messIds : standard;

  /** @type {Record<string, [number, number, number] | null>} */
  const felder = {};
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      felder[id] = null;
      continue;
    }
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    felder[id] = [mm(b.y - blattRect.top), mm(b.height), s.display === 'none' || b.height === 0 ? 0 : 1];
  }

  return JSON.stringify({
    b: blatt ? [mm(blattRect.height), blatt.getAttribute('data-ueberlauf') ?? null] : null,
    f: felder,
  });
}
