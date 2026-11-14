// @ts-check
// @adr [[ADR-JS]] {Boot}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (head): setzt Theme, Stil und Layout-Flags VOR dem
 * ersten Paint (FOUC-Schutz). Aus boot-theme.js und boot-switches.js
 * zusammengelegt (2026-11-08): beide lasen denselben localStorage-Eintrag,
 * der Browser blockierte den FCP zweimal und parste das JSON zweimal.
 *
 * Warum klassisch im Kopf: die Attribute muessen stehen, bevor der Body
 * existiert - ein Modul koennte das nicht, weil es erst nach dem Parse laeuft.
 * (Die fruehere Begruendung "Module kaemen nach dem ersten Paint, gemessen FCP
 * 96 ms" ist ueberholt: am 2026-11-14 lief initApp in 30 von 30 kalten Laeufen
 * vollstaendig vor dem ersten Paint. Siehe B71.)
 */
try {
  const defaults = {
    theme: 'auto',
    layout: 'form-b',
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

  /* Gleiche Regel wie persistence.js#istAn (klassisches Skript, kein Import).
     Nur ein explizites `false` schaltet aus; die Defaults aus
     DEFAULT_SETTINGS sind fuer marks und pluginTestbrief `true`. */
  /** @param {any} v */
  const istAn = (v) => v !== false && v !== 'false';

  const THEME_WHITELIST = new Set(['auto', 'light', 'dark']);
  const LAYOUT_WHITELIST = new Set(['form-a', 'form-b']);

  const theme = THEME_WHITELIST.has(settings.theme) ? settings.theme : 'auto';
  const layout = LAYOUT_WHITELIST.has(settings.layout) ? settings.layout : 'form-b';

  root.setAttribute('data-theme', theme);
  root.setAttribute('data-layout', layout);
  root.setAttribute('data-marks', istAn(settings.marks) ? 'true' : 'false');
  root.setAttribute('data-plugin-testbrief', istAn(settings.pluginTestbrief) ? 'true' : 'false');
  /* Der Einzelseiten-Modus ist stillgelegt ([[ADR-EINSEITEN-STILLGELEGT]]):
   * das Attribut bleibt fuer CSS/Tests gesetzt, ist aber immer 'true', und
   * es gibt keinen Stylesheet-Tausch mehr. `sheet.css` bleibt ungenutzt
   * liegen (nichts geloescht). */
  root.setAttribute('data-plugin-multipage', 'true');

  /* Anlagen und Fusszeile liest CSS direkt aus den Schaltern (:has). Die
   * Checkbox setzt boot-state.js (klassisches Skript am Body-Ende) vor dem
   * ersten Paint;
   * gemessen 2026-11-14: 30 von 30 kalten Laeufen, :has() traf am firstPaint
   * bereits zu (Paint 48-96 ms). Damit faellt hier ein JSON.parse auf dem
   * kritischen Pfad weg. */

  /* Unterrand 20/30mm vor dem ersten Paint setzen (FOUC-Schutz): die
   * Druckregel von #kern liest --rand-u. Nur 20 und 30 sind zulaessig. */
  const RAND_U_WHITELIST = new Set([20, 30]);
  const randU = RAND_U_WHITELIST.has(Number(settings.randU)) ? Number(settings.randU) : 20;
  root.style.setProperty('--rand-u', `${randU}mm`);

  /* Sicherheitsnetz fuer den Platzhalter-FOUC-Schutz (sheet-common.css):
   * Bleibt initApp haengen, duerfen die Platzhalter nicht dauerhaft
   * verschwinden. Nach 2 s wird freigegeben, komme was mag.
   *
   * Bewusst im selben try: vor dieser Zeile kann nur `documentElement` oder
   * `setProperty` werfen, und beides ist praktisch ausgeschlossen (geprueft
   * 2026-11-12). Der Timer ist ausserdem KEIN Nachweis eines erfolgreichen
   * Starts — er gibt nur die Platzhalter frei. Wer hier einen Startbeweis
   * braucht, muss ihn an `data-ready` haengen, nicht an diese 2 Sekunden. */
  setTimeout(() => {
    if (!root.dataset.ready) root.dataset.ready = 'true';
  }, 2000);
} catch (e) {
  /* Ohne Boot-Zustand startet die App im falschen Farbschema — sichtbar,
   * aber ohne Ursache. Daher loggen. */
  console.error('[Boot] Initialisierung fehlgeschlagen:', e);
}
