// @ts-check
// @adr [[ADR-JS]] {BootState}
// @adr [[ADR-DATA-PERSISTENCE]] {DraftRestore}
// @guide [[chrome-modern-css]]

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
    /* Sichtbares Label rendert CSS (floating.css, data-appearance-Selektoren). */
    const activeTheme = settings.theme || 'auto';
    const titles = /** @type {Record<string, string>} */ ({ auto: 'Darstellung: Automatisch (System)', light: 'Darstellung: Helles Design', dark: 'Darstellung: Dunkles Design' });
    themeToggleBtn.setAttribute('data-appearance', activeTheme);
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
      const nested = el.querySelector && el.querySelector('select[data-persist]');
      if (nested instanceof HTMLSelectElement) { nested.value = /** @type {string} */ (draft[id]); continue; }
      /* Rich-Text-Felder (innerHTML im Draft) NICHT hierherstellen: der
       * Default-Sanitizer von setHTML streift class="din-comment" und
       * definiert einen zweiten Restore-Owner (Audit C1). DraftManager.
       * loadDraft() stellt sie sofort nach Modulstart über 04-sanitize
       * wieder her — hier bewusst übersprungen. */
      if (id === 'brieftext' || id === 'anlagen-text') continue;
      el.textContent = /** @type {string} */ (draft[id]);
    }
  }
  const pvSel = /** @type {HTMLSelectElement | null} */ (document.getElementById('sidebar-pv-select'));
  const pvField = document.getElementById('postvermerk');
  /* Feld ist 100% contenteditable (Doktrin). Boot-Fill nur, wenn leer
   * (Draft-Restore darf nicht klobbered werden); aktive Select-Wahl
   * überschreibt weiter — bewusste Vorlagen-Wahl des Users. */
  const applyPv = (overwrite = true) => {
    if (pvSel && pvField && pvSel.value && (overwrite || !pvField.textContent.trim())) pvField.textContent = pvSel.value;
  };
  if (pvSel) {
    pvSel.addEventListener('input', () => applyPv());
    pvSel.addEventListener('change', () => applyPv());
  }
  applyPv(false);
  /* Font-Klasse nur, wenn boot-theme.js die @font-face auch wirklich
   * injiziert hat (derselbe Base64-Gate) — sonst bittet das Blatt um
   * ein 'AptosCustom', das nie registriert wurde (Grok-Re-Review C2). */
  if (/^data:[\w.+-]+\/[\w.+-]+(?:;charset=[\w-]+)?;base64,[A-Za-z0-9+/=]+$/.test(localStorage.getItem('din_custom_font') || '')) {
    document.body.classList.add('font-custom-active');
  }
} catch (e) {}
