// @ts-check
// @adr [[ADR-JS]] {BootTheme}
// @guide [[chrome-modern-css]]

/*
 * Blocking classic script (head): setzt data-theme/colorScheme VOR dem First Paint
 * (FOUC-Schutz) und injiziert die gespeicherte Custom-Font-@font-face-Regel.
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
  /* Audit C2: der Wert landet per String-Konkatenation in CSS. Nur ein
   * data:-URI mit reiner Base64-Payload (keine Quotes/Klammern/Semicolons
   * moeglich) darf hier ankommen — ein manipulierter localStorage-Wert
   * kann keine CSS-Regeln einschleppen. readAsDataURL liefert je nach
   * System font/woff2 ODER application/octet-stream — Mime flexibel. */
  const isDataFont = /^data:[\w.+-]+\/[\w.+-]+;base64,[A-Za-z0-9+/=]+$/.test(customFont || '');
  if (isDataFont) {
    const fontStyle = document.createElement('style');
    fontStyle.id = 'din-custom-font-style';
    fontStyle.textContent = `@font-face { font-family: 'AptosCustom'; src: url('${customFont}') format('woff2'); }`;
    document.head.appendChild(fontStyle);
  }
} catch (e) {}
