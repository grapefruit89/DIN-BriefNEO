// @ts-check
// @adr [[ADR-JS]] {BootTheme}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (head): setzt data-theme/colorScheme VOR dem First Paint
 * (FOUC-Schutz). Kein Modul — Modules sind deferred und kämen zu spät.
 *
 * Die eigene Schrift wird hier NICHT mehr registriert: sie liegt als Blob in IndexedDB
 * und wird async in settings.js nach dem Paint geladen (FOUC ~50–100 ms, akzeptiert).
 * Siehe [[ADR-BINARY-ASSETS]].
 */
try {
  const defaults = { theme: 'auto', layout: 'form-b', style: 'default' };
  const raw = localStorage.getItem('din_settings');
  const settings = raw ? Object.assign(defaults, JSON.parse(raw)) : defaults;
  const theme = settings.theme || 'auto';
  document.documentElement.setAttribute('data-theme', theme);
  const style = settings.style || 'default';
  document.documentElement.setAttribute('data-style', style);
} catch (e) {
  /* Schlaegt das Theme-Boot fehl, startet die App im falschen Farbschema und
   * ohne die gewaehlte Schrift — sichtbar, aber ohne Ursache. Daher loggen. */
  console.error('[Boot] Theme-Initialisierung fehlgeschlagen:', e);
}
