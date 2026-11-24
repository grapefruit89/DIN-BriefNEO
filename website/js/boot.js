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
  /* EIN Lifecycle-Token (D2): `data-booting` wird gesetzt, nicht erwartet.
     Die Maske in base.css haengt daran; das Netz entfernt denselben Marker,
     falls der Wert-Writer (boot-values.js) nicht ankommt. Beides steht VOR
     jedem JSON-Zugriff, damit auch ein Fehler danach die Seite nicht
     unsichtbar laesst. */
  const root = document.documentElement;
  root.setAttribute('data-booting', 'true');
  setTimeout(() => {
    if (root.getAttribute('data-booting') !== 'true') return;
    root.removeAttribute('data-booting');
    console.error('[Boot] Wert-Writer kam nicht innerhalb von 1800 ms an — Seite mit Defaults freigegeben.');
  }, 1800);

  const defaults = {
    theme: 'auto',
    layout: 'form-b',
    marks: true,
    pluginTestbrief: true,
    pluginGeschaeftsangaben: false,
    randU: 20,
    nachtHelligkeit: 0.5,
    blattBreitePx: 900
  };

  let parsed = {};
  try {
    parsed = JSON.parse(localStorage.getItem('din_settings') || '{}');
  } catch {
    /* kaputtes JSON: mit Defaults weiter */
  }
  const settings = parsed && typeof parsed === 'object' ? { ...defaults, ...parsed } : defaults;

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
  /* Addon Geschaeftsangaben: steuert, ob die Fusszeilen-Zeile in der Leiste
   * ueberhaupt angeboten wird (Standard: aus). */
  const pluginGeschaeftAktiv = settings.pluginGeschaeftsangaben === true;
  root.setAttribute('data-plugin-geschaeftsangaben', pluginGeschaeftAktiv ? 'true' : 'false');
  /* Der Einzelseiten-Modus ist stillgelegt ([[ADR-EINSEITEN-STILLGELEGT]]):
   * das Attribut bleibt fuer CSS/Tests gesetzt, ist aber immer 'true', und
   * es gibt keinen Stylesheet-Tausch mehr. `sheet.css` bleibt ungenutzt
   * liegen (nichts geloescht). */
  root.setAttribute('data-plugin-multipage', 'true');

  /* Anzeige-Werte gehoeren in den Boot: `zoom` und die Nachtpalette kommen aus
   * zwei CSS-Variablen. Setzt sie erst `settings.js`, springt der erste Paint
   * (FOUC, gemeldet 2026-11-24). Hier steht der gespeicherte Wert, bevor das
   * Blatt zum ersten Mal gezeichnet wird. */
  const breite = Number(settings.blattBreitePx);
  root.style.setProperty('--blatt-breite-px', String(Number.isFinite(breite) && breite >= 600 && breite <= 1200 ? breite : 900));
  const nacht = Number(settings.nachtHelligkeit);
  root.style.setProperty('--nacht-basis', String(Number.isFinite(nacht) && nacht >= 0.38 && nacht <= 0.68 ? nacht : 0.5));

  /* Anlagen und Fusszeile als Root-Attribute (ADR-KISS-MINIMAL-JS).
   * Vor dem ersten Paint gesetzt, damit das Blatt 100% FOUC-frei bleibt. */
  /** @type {Record<string, any>} */
  let draft = {};
  try {
    const rawDraft = localStorage.getItem('din_draft_current');
    draft = rawDraft ? JSON.parse(rawDraft) : {};
  } catch {
    /* kaputtes JSON: mit Defaults weiter */
  }
  const hatFuss = pluginGeschaeftAktiv && (
    draft['toggle-fuss'] === true || draft['toggle-fuss'] === 'true'
    || Boolean(draft['fuss-firma'] || draft['fuss-sitz'] || draft['fuss-gericht'] || draft['fuss-hrb'])
  );
  const hatAnlagen = draft['toggle-anlagen'] === true || draft['toggle-anlagen'] === 'true';

  root.setAttribute('data-anlagen', hatAnlagen ? 'true' : 'false');
  root.setAttribute('data-fuss', hatFuss ? 'true' : 'false');

  /* Unterrand 20/30mm vor dem ersten Paint setzen (FOUC-Schutz): die
   * Druckregel von #kern liest --rand-u. Nur 20 und 30 sind zulaessig.
   * Ab initApp gibt settings.js diesen Inline-Wert ab; dann steuert die
   * CSS-Regel `:root:has(#btn-rand-u-30:checked)` (sheet-multipage.css). */
  const RAND_U_WHITELIST = new Set([20, 30]);
  const randU = RAND_U_WHITELIST.has(Number(settings.randU)) ? Number(settings.randU) : 20;
  root.style.setProperty('--rand-u', `${randU}mm`);

  /* Der Reveal passiert im Wert-Writer (boot-values.js) bzw. in
   * boot-state.js, falls der Modul-Pfad ausfaellt. Das Netz oben entfernt
   * denselben Marker nach 1800 ms — es ist kein Startbeweis, sondern nur die
   * Garantie, dass die Seite ueberhaupt sichtbar wird. */
} catch (e) {
  /* Ohne Boot-Zustand startet die App im falschen Farbschema — sichtbar,
   * aber ohne Ursache. Daher loggen. */
  console.error('[Boot] Initialisierung fehlgeschlagen:', e);
}
