// @ts-check
// @adr [[ADR-JS]] {BootState}
// @adr [[ADR-DATA-PERSISTENCE]] {DraftRestore}
// @guide [[din-5008-css-architektur]]

/*
 * Blocking classic script (Ende von <body>): stellt vor dem Start der ES-Module
 * den gespeicherten Zustand wieder her (Draft, Radios, Theme-Button,
 * Postvermerk, Custom-Font-Status). Muss synchron an dieser Parse-Position
 * laufen — deferred Modules würden erst nach dem Full-Parse greifen.
 * data-theme/colorScheme am <html> setzt bereits boot-theme.js (Head, vor
 * First Paint) — hier kein zweiter Owner.
 */
try {
  const defaults = {
    theme: 'auto',
    layout: 'form-b',
    formality: 'formal'
  };
  const raw = localStorage.getItem('din_settings');
  const settings = raw ? Object.assign(defaults, JSON.parse(raw)) : defaults;
  /**
   * Synchronisiert Radio-Buttons per Property UND Attribut (CSS-Attributselektoren).
   * @param {string} name
   * @param {string | boolean} val
   */
  function setRadioSync(name, val) {
    document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((b) => {
      const btn = /** @type {HTMLInputElement} */ (b);
      const on = btn.value === val;
      btn.checked = on;
      if (on) btn.setAttribute('checked', '');
      else btn.removeAttribute('checked');
    });
  }
  setRadioSync('layout-form', settings.layout);
  setRadioSync('salutation', settings.formality);
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  if (themeToggleBtn) {
    /* Sichtbares Label rendert CSS (floating.css, data-erscheinungsbild-Selektoren). */
    const activeTheme = settings.theme || 'auto';
    const titles = /** @type {Record<string, string>} */ ({ auto: 'Darstellung: Automatisch (System)', light: 'Darstellung: Helles Design', dark: 'Darstellung: Dunkles Design' });
    themeToggleBtn.setAttribute('data-erscheinungsbild', activeTheme);
    themeToggleBtn.setAttribute('title', titles[activeTheme] || 'Darstellung: Automatisch');
    themeToggleBtn.setAttribute('aria-label', titles[activeTheme] || 'Darstellung: Automatisch');
  }
  const draftStr = localStorage.getItem('din_draft_current');
  if (draftStr) {
    const draft = JSON.parse(draftStr);
    for (const id in draft) {
      const el = document.getElementById(id);
      if (!el || !draft[id]) continue;
      if (el instanceof HTMLSelectElement) { el.value = /** @type {string} */ (draft[id]); continue; }
      const nested = el.querySelector && el.querySelector('select[data-speichern]');
      if (nested instanceof HTMLSelectElement) { nested.value = /** @type {string} */ (draft[id]); continue; }
      /* Rich-Text-Felder (innerHTML im Draft) NICHT hierherstellen: der
       * Default-Sanitizer von setHTML streift class="brief-kommentar" und
       * definiert einen zweiten Restore-Owner (Audit C1). DraftManager.
       * loadDraft() stellt sie sofort nach Modulstart über 04-sanitize
       * wieder her — hier bewusst übersprungen. */
      if (el.dataset.feldtyp?.includes('rich')) continue;
      el.textContent = /** @type {string} */ (draft[id]);
    }
  }
  const pvSel = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  const pvField = document.getElementById('postvermerk');
  /* Feld ist 100% contenteditable (Doktrin). Boot-Fill nur, wenn leer
   * (Draft-Restore darf nicht klobbered werden); aktive Select-Wahl
   * überschreibt weiter — bewusste Vorlagen-Wahl des Users. */
  /* 🚨 ARCHITECTURAL GUARD (ein Listener-Owner):
   * Dieses Boot-Script setzt NUR den Initialwert. Die Listener auf dem
   * Select gehoeren ausschliesslich main.js (syncPostvermerkFromSidebar).
   * Vorher haengten hier zusaetzlich 'input' UND 'change' — zusammen mit
   * dem Handler in main.js liefen bei einer einzigen Auswahl DREI Handler
   * mit WIDERSPRUECHLICHER Semantik (hier ueberschreibend, dort nur-wenn-leer).
   * NIEMALS wieder Listener in diesem Boot-Script registrieren. */
  if (pvSel && pvField && pvSel.value && !pvField.textContent.trim()) {
    pvField.textContent = pvSel.value;
  }
  /* Font-Klasse nur, wenn boot-theme.js die @font-face auch wirklich
   * injiziert hat (derselbe Base64-Gate) — sonst bittet das Blatt um
   * ein 'AptosCustom', das nie registriert wurde (Grok-Re-Review C2). */
  if (/^data:[\w.+-]+\/[\w.+-]+(?:;charset=[\w-]+)?;base64,[A-Za-z0-9+/=]+$/.test(localStorage.getItem('din_custom_font') || '')) {
    document.body.classList.add('schrift-eigene-aktiv');
  }
} catch (e) {
  /* Boot-Restore ist still gescheitert: der Nutzer sieht ein leeres Blatt, obwohl ein
   * Entwurf existiert. Ohne Log war genau das unsichtbar — nicht erneut verschlucken. */
  console.error('[Boot] Entwurf konnte nicht wiederhergestellt werden:', e);
}
