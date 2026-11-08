// @ts-check
// @adr [[ADR-JS]]
// @guide [[din-5008-css-architektur]]

/**
 * Mehrseiten-Controller (CSS Multi-column Level 2, Baseline Chromium 150+).
 *
 * Kein Selbststart mehr: der Plugin-Schalter `pluginMultipage` publiziert
 * `Events.PLUGIN_MULTIPAGE_TOGGLED`, `main.js` ruft `mountMultipage()` bzw.
 * `unmountMultipage()`. Beim Ausschalten werden Observer, Listener und das
 * dynamische `@page`-Sheet vollstaendig entfernt.
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
  const text = document.getElementById('text');
  const probe = document.getElementById('probe');
  const status = document.getElementById('seiten-status');
  const folgekoepfe = document.getElementById('folgekoepfe');
  if (!kern || !probe || !status || !folgekoepfe) return;

  /** @type {Array<() => void>} */
  const abraeumen = [];

  /* Dynamische @page-Regel fuer den PDF-Kopf. Kein inline <style>: unter
   * CSP `style-src 'self'` bekommt ein per JS erzeugtes <style> gar kein
   * CSSStyleSheet, textContent und insertRule laufen beide ins Leere.
   * Ein konstruiertes Stylesheet per adoptedStyleSheets ist kein Inline-Style
   * und wird von der CSP nicht angefasst. */
  /** @type {CSSStyleSheet | null} */
  let pageSheet = null;

  function mmZuPx() {
    return probe ? probe.getBoundingClientRect().height / 1000 : 0;
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

    const empfName = (document.getElementById('empfaenger-name')?.textContent || '').trim();
    const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || '').trim();
    const empfaenger = empfName || empfFirma || 'Empfänger';
    const datum = (document.getElementById('datum')?.textContent || '').trim();
    const kopfText = `Brief an ${empfaenger} vom ${datum}`;

    // Bildschirm-Folgekoepfe ab Seite 2 (DOM-Knoten ohne innerHTML, Law A61)
    folgekoepfe.replaceChildren();
    for (let i = 1; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'folgekopf-screen';
      el.style.top = `calc(${i} * (var(--seite) + var(--luecke)) + 12mm)`;
      const links = document.createElement('span');
      links.textContent = kopfText;
      const rechts = document.createElement('span');
      rechts.textContent = `Seite ${i + 1} von ${n}`;
      el.append(links, rechts);
      folgekoepfe.append(el);
    }

    // Paged-Media-Randbox aktualisieren: altes Sheet ersetzen, nicht stapeln.
    if (pageSheet) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== pageSheet);
    }
    pageSheet = new CSSStyleSheet();
    pageSheet.replaceSync(`@page { @top-left { content: "${esc(kopfText)}"; } }`);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, pageSheet];
  }

  const SAETZE = [
    'Wir bestätigen den Eingang Ihres Schreibens und danken Ihnen für die ausführliche Darstellung des Sachverhalts.',
    'Nach Prüfung der vorliegenden Unterlagen ergibt sich, dass die geltend gemachte Forderung dem Grunde nach besteht.',
    'Die Höhe der Forderung konnten wir anhand der übersandten Belege jedoch nur teilweise nachvollziehen.',
    'Wir bitten Sie daher, uns die fehlenden Nachweise bis zum Ende des laufenden Monats zukommen zu lassen.',
    'Sollten sich Rückfragen ergeben, erreichen Sie uns telefonisch zu den üblichen Geschäftszeiten.',
    'Bis zur Klärung bitten wir um Verständnis, dass wir keine weiteren Zahlungen veranlassen können.',
    'Die sorgfältige Bearbeitung Ihrer Angelegenheit hat für unser Haus oberste Priorität.',
    'Bitte beachten Sie auch die beigefügten Hinweise zur Einreichung ergänzender Unterlagen.',
  ];

  /**
   * Erzeugt DOM-Absaetze fuer langen Mehrseitentext ohne innerHTML (Law A61)
   * @returns {HTMLParagraphElement[]}
   */
  function erstelleLangenText() {
    /** @type {HTMLParagraphElement[]} */
    const absaetze = [];
    for (let i = 0; i < 14; i++) {
      let p = '';
      const anzahl = 4 + (i % 3);
      for (let j = 0; j < anzahl; j++) {
        p += `${SAETZE[(i + j) % SAETZE.length]} `;
      }
      const pEl = document.createElement('p');
      pEl.textContent = p.trim();
      absaetze.push(pEl);
    }
    return absaetze;
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

  if (text) {
    const btnLang = document.getElementById('btn-demo-lang');
    if (btnLang) {
      const onLang = () => {
        text.replaceChildren(...erstelleLangenText());
        text.dispatchEvent(new Event('input', { bubbles: true }));
        aktualisieren();
      };
      btnLang.addEventListener('click', onLang);
      abraeumen.push(() => btnLang.removeEventListener('click', onLang));
    }

    const btnKurz = document.getElementById('btn-demo-kurz');
    if (btnKurz) {
      const onKurz = () => {
        const p1 = document.createElement('p');
        p1.textContent = 'Sehr geehrte Damen und Herren,';
        const p2 = document.createElement('p');
        p2.textContent = 'dies ist ein kurzer Testbrief auf einer Seite. Nutzen Sie den Button „Langer Text“ oder tippen Sie weiteren Text ein, um den automatischen Umbruch auf Folgeseiten zu testen.';
        text.replaceChildren(p1, p2);
        text.dispatchEvent(new Event('input', { bubbles: true }));
        aktualisieren();
      };
      btnKurz.addEventListener('click', onKurz);
      abraeumen.push(() => btnKurz.removeEventListener('click', onKurz));
    }
  }

  const initial = setTimeout(aktualisieren, 100);
  abraeumen.push(() => clearTimeout(initial));

  abraeumen.push(() => {
    folgekoepfe.replaceChildren();
    status.textContent = 'Seite 1 von 1';
    if (pageSheet) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== pageSheet);
      pageSheet = null;
    }
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
