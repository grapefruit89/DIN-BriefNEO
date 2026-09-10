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
    guides: true,
    systemFont: 'sans',
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
  setRadioSync('font-stack', settings.systemFont);
  setRadioSync('guides', settings.guides ? 'on' : 'off');
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
      /* Default-Sanitizer: streng gegen Skripte, behält class — exakte
       * Allowlist übernimmt der DraftManager in #sanitizeRichText(). */
      /** @type {any} */ (el).setHTML(draft[id]);
    }
  }
  const pvSel = /** @type {HTMLSelectElement | null} */ (document.getElementById('sidebar-pv-select'));
  const pvField = document.getElementById('postvermerk');
  const applyPv = () => {
    if (pvSel && pvField && pvSel.value) pvField.textContent = pvSel.value;
  };
  if (pvSel) {
    pvSel.addEventListener('input', applyPv);
    pvSel.addEventListener('change', applyPv);
  }
  applyPv();
  if (localStorage.getItem('din_custom_font')) {
    document.body.classList.add('font-custom-active');
  }
} catch (e) {}
