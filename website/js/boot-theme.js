// @ts-check
// @adr [[ADR-JS]] {BootTheme}
// @guide [[chrome-modern-css]]

/*
 * Blocking classic script (head): setzt data-theme/colorScheme VOR dem First Paint
 * (FOUC-Schutz) und registriert die gespeicherte Custom-Font via Font Loading API.
 * Kein Modul — Modules sind deferred und kämen zu spät.
 * CSP-Vorbereitung (Grok H4/M4): kein <style>-String mehr — style-src 'self'
 * ohne 'unsafe-inline'. Font lädt asynchron (ein Frame system-ui Fallback,
 * akzeptiert); der Base64-Gate bleibt als Konstruktor-Voraussetzung.
 */
try {
  const defaults = { theme: 'auto' };
  const raw = localStorage.getItem('din_settings');
  const settings = raw ? Object.assign(defaults, JSON.parse(raw)) : defaults;
  const theme = settings.theme || 'auto';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme === 'auto' ? 'light dark' : theme;
  const customFont = localStorage.getItem('din_custom_font');
  /* Audit C2: Nur ein data:-URI mit reiner Base64-Payload (keine Quotes/
   * Klammern/Semicolons möglich) darf in den FontFace-Konstruktor — ein
   * manipulierter localStorage-Wert kann keine CSS-Regeln einschleppen.
   * readAsDataURL liefert je nach System font/woff2 ODER
   * application/octet-stream — Mime flexibel, optional ;charset=. */
  const isDataFont = /^data:[\w.+-]+\/[\w.+-]+(?:;charset=[\w-]+)?;base64,[A-Za-z0-9+/=]+$/.test(customFont || '');
  if (isDataFont) {
    /* 🚨 ARCHITECTURAL GUARD (CSP/H4): FontFace-Loader ist Pflicht — NIEMALS
     * zur <style>-String-Injektion zurückkehren (breakt style-src 'self',
     * war C2-Injektionsvektor). Die Regex oben bleibt der Gate. */
    const face = new FontFace('AptosCustom', `url(${customFont}) format('woff2')`);
    face.load().then((loaded) => {
      document.fonts.add(loaded);
    }).catch(() => {});
  }
} catch (e) {}
