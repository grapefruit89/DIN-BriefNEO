// @ts-check
// @adr [[ADR-JS]]
// @guide [[din-5008-css-architektur]]

/**
 * Mehrseiten-Controller (CSS Multi-column Level 2, Baseline Chromium 150+).
 *
 * Der Mehrseiten-Modus ist fest eingeschaltet ([[ADR-EINSEITEN-STILLGELEGT]]):
 * `main.js` mountet den Controller immer. `unmountMultipage()` bleibt als
 * sauberer Rueckweg erhalten (Observer, Listener und das dynamische
 * `@page`-Sheet werden dabei vollstaendig entfernt), wird aber nicht mehr
 * durch einen Schalter ausgeloest.
 */

/** @type {{ stop: () => void } | null} */
let aktiv = null;

/**
 * @param {string} s
 * @returns {string}
 */
function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\s+/g, ' ');
}

export function mountMultipage() {
  if (aktiv) return;

  const kern = document.getElementById('kern');
  const probe = document.getElementById('probe');
  const status = document.getElementById('seiten-status');
  const folgekoepfe = document.getElementById('folgekoepfe');
  if (!kern || !probe || !status || !folgekoepfe) return;

  /** @type {Array<() => void>} */
  const abraeumen = [];

  /* Dynamische @page-Regel fuer den PDF-Kopf (A25: nur einmalig allokieren).
   * Kein inline <style>: unter CSP `style-src 'self'` bekommt ein per JS erzeugtes
   * <style> gar kein CSSStyleSheet, textContent und insertRule laufen beide ins Leere.
   * Ein konstruiertes Stylesheet per adoptedStyleSheets ist kein Inline-Style
   * und wird von der CSP nicht angefasst. */
  const pageSheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, pageSheet];
  let alteRegel = '';

  let probeWarned = false;
  function mmZuPx() {
    if (!probe) {
      if (!probeWarned) {
        console.warn('[MultipageController] #probe Element fehlt.');
        probeWarned = true;
      }
      return 0;
    }
    const h = probe.getBoundingClientRect().height;
    if (h <= 0) {
      if (!probeWarned) {
        console.warn('[MultipageController] #probe liefert 0px Höhe.');
        probeWarned = true;
      }
      return 0;
    }
    return h / 1000;
  }

  function aktualisieren() {
    if (!kern || !status || !folgekoepfe) return;
    const cs = getComputedStyle(document.documentElement);
    const seite = Number.parseFloat(cs.getPropertyValue('--seite')) || 297;
    const luecke = Number.parseFloat(cs.getPropertyValue('--luecke')) || 8;
    const mm = mmZuPx();
    if (!mm) return;

    // Hoehe in mm; N Seiten = N * (seite + luecke) - luecke
    const hoeheMm = kern.getBoundingClientRect().height / mm;
    const n = Math.max(1, Math.round((hoeheMm + luecke) / (seite + luecke)));

    status.textContent = `Seite 1 von ${n}`;
    document.body.dataset.seiten = String(n);
    const vp = document.getElementById('viewport');
    if (vp) vp.dataset.seiten = String(n);

    const empfName = (document.getElementById('empfaenger-name')?.textContent || '').trim();
    const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || '').trim();
    const empfaenger = empfName || empfFirma || 'Empfänger';
    const datum = (document.getElementById('datum')?.textContent || '').trim();
    const kopfText = `Brief an ${empfaenger} vom ${datum}`;

    // Bildschirm-Folgekoepfe ab Seite 2 (DOM-Knoten ohne innerHTML, Law A61, A23 mit CSS-Variable --i)
    folgekoepfe.replaceChildren();
    for (let i = 1; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'folgekopf-screen';
      el.style.setProperty('--i', String(i));
      const links = document.createElement('span');
      links.textContent = kopfText;
      const rechts = document.createElement('span');
      rechts.textContent = `Seite ${i + 1} von ${n}`;
      el.append(links, rechts);
      folgekoepfe.append(el);
    }

    // Paged-Media-Randbox aktualisieren: nur bei tatsächlicher Regel-Änderung syncen (A25)
    const neueRegel = `@page { @top-left { content: "${esc(kopfText)}"; } }`;
    if (neueRegel !== alteRegel) {
      pageSheet.replaceSync(neueRegel);
      alteRegel = neueRegel;
    }
  }

  // --- Listener (jeweils mit Abraeum-Funktion) ---
  const observer = new ResizeObserver(aktualisieren);
  observer.observe(kern);
  abraeumen.push(() => observer.disconnect());

  window.addEventListener('beforeprint', aktualisieren);
  abraeumen.push(() => window.removeEventListener('beforeprint', aktualisieren));

  for (const id of ['empfaenger-name', 'empfaenger-firma', 'datum', 'betreff', 'text']) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener('input', aktualisieren);
    abraeumen.push(() => el.removeEventListener('input', aktualisieren));
  }

  // Initialer Aufruf synchron (A26: redundanter setTimeout entfernt)
  aktualisieren();

  abraeumen.push(() => {
    folgekoepfe.replaceChildren();
    status.textContent = 'Seite 1 von 1';
    delete document.body.dataset.seiten;
    const vp = document.getElementById('viewport');
    if (vp) delete vp.dataset.seiten;
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== pageSheet);
  });

  aktiv = {
    stop: () => {
      for (const fn of abraeumen) fn();
    }
  };
}

export function unmountMultipage() {
  if (!aktiv) return;
  aktiv.stop();
  aktiv = null;
}
