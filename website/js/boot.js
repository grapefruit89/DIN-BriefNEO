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
    marks: true,
    pluginTestbrief: true,
    randU: 20
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
  root.setAttribute('data-marks', asBool(settings.marks, true) ? 'true' : 'false');
  root.setAttribute('data-plugin-testbrief', asBool(settings.pluginTestbrief, true) ? 'true' : 'false');
  /* Der Einzelseiten-Modus ist stillgelegt ([[ADR-EINSEITEN-STILLGELEGT]]):
   * das Attribut bleibt fuer CSS/Tests gesetzt, ist aber immer 'true', und
   * es gibt keinen Stylesheet-Tausch mehr. `sheet.css` bleibt ungenutzt
   * liegen (nichts geloescht). */
  root.setAttribute('data-plugin-multipage', 'true');

  /* Unterrand 20/30mm vor dem ersten Paint setzen (FOUC-Schutz): die
   * Druckregel von #kern liest --rand-u. Nur 20 und 30 sind zulaessig. */
  const RAND_U_WHITELIST = new Set([20, 30]);
  const randU = RAND_U_WHITELIST.has(Number(settings.randU)) ? Number(settings.randU) : 20;
  root.style.setProperty('--rand-u', `${randU}mm`);

  /* Sicherheitsnetz fuer den Platzhalter-FOUC-Schutz (sheet-common.css):
   * Bleibt initApp haengen, duerfen die Platzhalter nicht dauerhaft
   * verschwinden. Nach 2 s wird freigegeben, komme was mag. */
  setTimeout(() => {
    if (!root.dataset.ready) root.dataset.ready = 'true';
  }, 2000);
} catch (e) {
  /* Ohne Boot-Zustand startet die App im falschen Farbschema — sichtbar,
   * aber ohne Ursache. Daher loggen. */
  console.error('[Boot] Initialisierung fehlgeschlagen:', e);
}
