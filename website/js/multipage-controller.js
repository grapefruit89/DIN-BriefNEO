// @ts-check

/**
 * Controller für Mehrseitigkeit (CSS Multi-column Layout Level 2)
 * Baseline: Chromium 150+ (Getestet auf Chromium 156)
 */

(() => {
  /** @type {(s: string) => HTMLElement | null} */
  const $ = (s) => document.querySelector(s);
  const kern = $('#kern');
  const text = $('#text');
  const probe = $('#probe');
  const status = $('#seiten-status');
  const folgekoepfe = $('#folgekoepfe');

  if (!kern || !probe || !status || !folgekoepfe) {
    return;
  }

  /* Dynamische @page-Regel fuer den PDF-Kopf. Kein inline <style>: unter
   * CSP `style-src 'self'` bekommt ein per JS erzeugtes <style> gar kein
   * CSSStyleSheet, textContent und insertRule laufen beide ins Leere.
   * Ein konstruiertes Stylesheet per adoptedStyleSheets ist kein Inline-Style
   * und wird von der CSP nicht angefasst. */
  /** @type {CSSStyleSheet | null} */
  let pageSheet = null;

  function mmZuPx() {
    if (!probe) return 0;
    return probe.getBoundingClientRect().height / 1000;
  }

  /**
   * @param {string} s
   * @returns {string}
   */
  function esc(s) {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\s+/g, ' ');
  }

  function aktualisieren() {
    if (!kern || !status || !folgekoepfe) return;
    const cs = getComputedStyle(document.documentElement);
    const seite = Number.parseFloat(cs.getPropertyValue('--seite')) || 297;
    const luecke = Number.parseFloat(cs.getPropertyValue('--luecke')) || 8;
    const mm = mmZuPx();
    if (!mm) return;

    // Höhe in mm:
    const hoeheMm = kern.getBoundingClientRect().height / mm;
    // Höhe von N Seiten = N * (seite + luecke) - luecke
    const n = Math.max(1, Math.round((hoeheMm + luecke) / (seite + luecke)));

    status.textContent = `Seite 1 von ${n}`;

    // Empfänger-Name für Folgekopf ermitteln
    const empfName = (document.getElementById('empfaenger-name')?.textContent || '').trim();
    const empfFirma = (document.getElementById('empfaenger-firma')?.textContent || '').trim();
    const empfaenger = empfName || empfFirma || 'Empfänger';
    const datum = (document.getElementById('datum')?.textContent || '').trim();
    const kopfText = `Brief an ${empfaenger} vom ${datum}`;

    // Bildschirm-Folgeköpfe ab Seite 2 aufbauen (DOM-Knoten ohne innerHTML)
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

    // Paged-Media Randbox für PDF-Druck dynamisch aktualisieren.
    // Altes Sheet zuerst ersetzen, nicht ergaenzen — sonst stapeln sich Regeln.
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
   * Erzeugt DOM-Absätze für langen Mehrseitentext ohne innerHTML (Law A61)
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

  const btnLang = document.getElementById('btn-demo-lang');
  const btnKurz = document.getElementById('btn-demo-kurz');

  if (btnLang && text) {
    btnLang.addEventListener('click', () => {
      text.replaceChildren(...erstelleLangenText());
      text.dispatchEvent(new Event('input', { bubbles: true }));
      aktualisieren();
    });
  }

  if (btnKurz && text) {
    btnKurz.addEventListener('click', () => {
      const p1 = document.createElement('p');
      p1.textContent = 'Sehr geehrte Damen und Herren,';
      const p2 = document.createElement('p');
      p2.textContent = 'dies ist ein kurzer Testbrief auf einer Seite. Nutzen Sie den Button „Langer Text“ oder tippen Sie weiteren Text ein, um den automatischen Umbruch auf Folgeseiten zu testen.';
      text.replaceChildren(p1, p2);
      text.dispatchEvent(new Event('input', { bubbles: true }));
      aktualisieren();
    });
  }

  // Observer & Listener
  new ResizeObserver(aktualisieren).observe(kern);
  window.addEventListener('beforeprint', aktualisieren);

  for (const id of ['empfaenger-name', 'empfaenger-firma', 'datum', 'betreff', 'text']) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', aktualisieren);
    }
  }

  // Initial ausführen nach vollständigem DOM & Layout
  setTimeout(aktualisieren, 100);
})();
