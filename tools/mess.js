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
    felder[id] = [mm(b.y), mm(b.height), s.display === 'none' || b.height === 0 ? 0 : 1];
  }

  const blatt = document.querySelector('din-blatt');
  const bb = blatt?.getBoundingClientRect();

  return JSON.stringify({
    b: bb ? [mm(bb.height), blatt?.getAttribute('data-ueberlauf') ?? null] : null,
    f: felder,
  });
}
