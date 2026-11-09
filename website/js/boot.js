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

  /** @type {(v: any, def: boolean) => boolean} */
  const asBool = (v, def) => (v === undefined ? def : v === true || v === 'true');

  const THEME_WHITELIST = new Set(['auto', 'light', 'dark']);
  const LAYOUT_WHITELIST = new Set(['form-a', 'form-b']);

  const theme = THEME_WHITELIST.has(settings.theme) ? settings.theme : 'auto';
  const layout = LAYOUT_WHITELIST.has(settings.layout) ? settings.layout : 'form-b';

  root.setAttribute('data-theme', theme);
  root.setAttribute('data-layout', layout);
  root.setAttribute('data-style', settings.style || 'default');
  root.setAttribute('data-guides', asBool(settings.guides, false) ? 'true' : 'false');
  root.setAttribute('data-marks', asBool(settings.marks, true) ? 'true' : 'false');
  root.setAttribute('data-sensitive-subject', asBool(settings.sensitiveSubject, false) ? 'true' : 'false');
  root.setAttribute('data-plugin-testbrief', asBool(settings.pluginTestbrief, true) ? 'true' : 'false');
  root.setAttribute('data-plugin-multipage', asBool(settings.pluginMultipage, true) ? 'true' : 'false');

  /* Mehrseiten-Plugin ist standardmaessig an: Stylesheet schon vor dem ersten
   * Paint tauschen, sonst springt das Layout sichtbar um, sobald main.js laeuft.
   * Die Links stehen im <head> vor diesem Block und sind bereits geparst. */
  if (asBool(settings.pluginMultipage, true)) {
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
