// @ts-check
// @adr [[ADR-JS]] {BootTheme}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (head): setzt data-theme/colorScheme VOR dem First Paint
 * (FOUC-Schutz) und registriert die gespeicherte Custom-Font via Font Loading API.
 * Kein Modul — Modules sind deferred und kämen zu spät.
 */
try {
  const defaults = { theme: 'auto' };
  const raw = localStorage.getItem('din_settings');
  const settings = raw ? Object.assign(defaults, JSON.parse(raw)) : defaults;
  const theme = settings.theme || 'auto';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme === 'auto' ? 'light dark' : theme;
  const customFont = localStorage.getItem('din_custom_font');
  // Validiere Base64 data-URI, um CSS-Injektionen auszuschließen
  const isDataFont = /^data:[\w.+-]+\/[\w.+-]+(?:;charset=[\w-]+)?;base64,[A-Za-z0-9+/=]+$/.test(customFont || '');
  if (isDataFont) {
    // Sichere Registrierung via Font Loading API statt <style>-Injection
    const face = new FontFace('AptosCustom', `url(${customFont}) format('woff2')`);
    face.load().then((loaded) => {
      document.fonts.add(loaded);
    }).catch((e) => {
      console.warn('[Boot] Eigene Schriftart konnte nicht geladen werden:', e);
    });
  }
} catch (e) {
  /* Schlaegt das Theme-Boot fehl, startet die App im falschen Farbschema und
   * ohne die gewaehlte Schrift — sichtbar, aber ohne Ursache. Daher loggen. */
  console.error('[Boot] Theme-Initialisierung fehlgeschlagen:', e);
}
