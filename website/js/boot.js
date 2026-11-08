// @ts-check
// @adr [[ADR-JS]] {Boot}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (head): setzt Theme, Stil und Layout-Flags VOR dem
 * ersten Paint (FOUC-Schutz). Aus boot-theme.js und boot-switches.js
 * zusammengelegt (2026-11-08): beide lasen denselben localStorage-Eintrag,
 * der Browser blockierte den FCP zweimal und parste das JSON zweimal.
 *
 * Warum kein Modul: Module sind deferred und kaemen nach dem ersten Paint
 * (gemessen: FCP bei 96 ms, Zustand dort noch "aus").
 */
try {
  const defaults = {
    theme: 'auto',
    layout: 'form-b',
    style: 'default',
    guides: false,
    marks: true,
    sensitiveSubject: false,
    pluginTestbrief: true,
    pluginMultipage: true
  };

  let parsed = {};
  try {
    parsed = JSON.parse(localStorage.getItem('din_settings') || '{}');
  } catch {
    /* kaputtes JSON: mit Defaults weiter */
  }
  const settings = parsed && typeof parsed === 'object' ? { ...defaults, ...parsed } : defaults;
  const root = document.documentElement;

  root.setAttribute('data-theme', settings.theme || 'auto');
  root.setAttribute('data-style', settings.style || 'default');
  root.setAttribute('data-guides', settings.guides === true ? 'true' : 'false');
  root.setAttribute('data-marks', settings.marks === false ? 'false' : 'true');
  root.setAttribute('data-sensitive-subject', settings.sensitiveSubject === true ? 'true' : 'false');

  /* Mehrseiten-Plugin ist standardmaessig an: Stylesheet schon vor dem ersten
   * Paint tauschen, sonst springt das Layout sichtbar um, sobald main.js laeuft.
   * Die Links stehen im <head> vor diesem Block und sind bereits geparst. */
  if (settings.pluginMultipage === true) {
    const blattLink = /** @type {HTMLLinkElement | null} */ (document.getElementById('css-blatt'));
    const ziel = blattLink?.dataset.blattMehrseitig;
    if (blattLink && ziel && blattLink.getAttribute('href') !== ziel) {
      blattLink.setAttribute('href', ziel);
    }
  }
} catch (e) {
  /* Ohne Boot-Zustand startet die App im falschen Farbschema — sichtbar,
   * aber ohne Ursache. Daher loggen. */
  console.error('[Boot] Initialisierung fehlgeschlagen:', e);
}
