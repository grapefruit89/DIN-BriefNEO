// @ts-check
// @adr [[ADR-JS]] {BootSwitches}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (head): setzt die Layout-Flags VOR dem ersten Paint
 * als data-Attribute am <html>. Das CSS liest diese Attribute direkt — keine
 * Checkbox als CSS-Quelle, kein MutationObserver, kein Warten auf geparste
 * Knoten.
 *
 * Warum kein Modul: Module sind deferred und kaemen nach dem ersten Paint
 * (gemessen: FCP bei 96 ms, Zustand dort noch "aus").
 *
 * Die Checkboxen in der Seitenleiste sind nur noch Bedienoberflaeche; sie
 * werden beim Modulstart von SettingsManager.applySettings() aus denselben
 * Einstellungen gesetzt und von dort synchron gehalten.
 */
try {
  const raw = localStorage.getItem('din_settings');
  const parsed = raw ? JSON.parse(raw) : {};
  const settings = parsed && typeof parsed === 'object' ? parsed : {};
  const root = document.documentElement;

  root.setAttribute('data-guides', settings.guides === true ? 'true' : 'false');
  root.setAttribute('data-marks', settings.marks === false ? 'false' : 'true');
  root.setAttribute('data-sensitive-subject', settings.sensitiveSubject === true ? 'true' : 'false');
} catch (e) {
  /* Ohne gespeicherte Einstellungen bleiben die HTML-Defaults — die App laeuft. */
  console.error('[Boot] Layout-Flags fehlgeschlagen:', e);
}
