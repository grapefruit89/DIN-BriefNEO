// @ts-check
// @adr [[ADR-JS]] {BootTheme}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (head): setzt data-theme/colorScheme VOR dem First Paint
 * (FOUC-Schutz) und registriert die gespeicherte Custom-Font via Font Loading API.
 * Kein Modul — Modules sind deferred und kämen zu spät.
 */
try {
  const defaults = { theme: 'auto', layout: 'form-b', style: 'default' };
  const raw = localStorage.getItem('din_settings');
  const settings = raw ? Object.assign(defaults, JSON.parse(raw)) : defaults;
  const theme = settings.theme || 'auto';
  document.documentElement.setAttribute('data-theme', theme);
  const layout = settings.layout || 'form-b';
  document.documentElement.setAttribute('data-layout', layout);
  const style = settings.style || 'default';
  document.documentElement.setAttribute('data-style', style);
  const customFont = localStorage.getItem('din_custom_font');
  // Validiere Base64 data-URI, um CSS-Injektionen auszuschließen
  const isDataFont = /^data:[\w.+-]+\/[\w.+-]+(?:;charset=[\w-]+)?;base64,[A-Za-z0-9+/=]+$/.test(customFont || '');
  if (isDataFont) {
    document.documentElement.style.setProperty('--active-font-family', "'CustomUserFont', var(--font-system-stack)");
    const face = new FontFace('CustomUserFont', `url(${customFont})`);
    face.load().then((loaded) => {
      document.fonts.add(loaded);
    }).catch((e) => {
      document.documentElement.style.removeProperty('--active-font-family');
      console.warn('[Boot] Eigene Schriftart konnte nicht geladen werden:', e);
    });
  }
} catch (e) {
  /* Schlaegt das Theme-Boot fehl, startet die App im falschen Farbschema und
   * ohne die gewaehlte Schrift — sichtbar, aber ohne Ursache. Daher loggen. */
  console.error('[Boot] Theme-Initialisierung fehlgeschlagen:', e);
}
