// @ts-check
// @adr [[ADR-JS]] {BootState}
// @adr [[ADR-DATA-PERSISTENCE]] {DraftRestore}
// @guide [[chrome-modern-css]]

/*
 * Blocking classic script (Ende von <body>): stellt vor dem Start der ES-Module
 * den gespeicherten Zustand wieder her (Draft, Radios, Theme, Postvermerk,
 * Custom-Font-Status). Muss synchron an dieser Parse-Position laufen —
 * deferred Modules würden erst nach dem Full-Parse greifen.
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
  const activeTheme = settings.theme || 'auto';
  document.documentElement.setAttribute('data-theme', activeTheme);
  const scheme = activeTheme === 'auto' ? 'light dark' : activeTheme;
  document.documentElement.style.colorScheme = scheme;
  if (document.body) {
    document.body.setAttribute('data-theme', activeTheme);
    document.body.style.colorScheme = scheme;
  }
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('data-appearance', activeTheme);
    /** @type {Record<string, string>} */
    const labels = { auto: '🌓 Auto', light: '☀️ Hell', dark: '🌙 Dunkel' };
    /** @type {Record<string, string>} */
    const titles = { auto: 'Darstellung: Automatisch (System)', light: 'Darstellung: Helles Design', dark: 'Darstellung: Dunkles Design' };
    themeToggleBtn.setAttribute('data-ui', labels[activeTheme] || '🌓 Auto');
    themeToggleBtn.setAttribute('title', titles[activeTheme] || 'Darstellung: Automatisch');
    themeToggleBtn.setAttribute('aria-label', titles[activeTheme] || 'Darstellung: Automatisch');
  }
  const draftStr = localStorage.getItem('din_draft_current');
  if (draftStr) {
    const draft = JSON.parse(draftStr);
    const parser = new DOMParser();
    for (const id in draft) {
      const el = document.getElementById(id);
      if (!el || !draft[id]) continue;
      if (el instanceof HTMLSelectElement) { el.value = /** @type {string} */ (draft[id]); continue; }
      const nested = el.querySelector && el.querySelector('select[data-persist]');
      if (nested instanceof HTMLSelectElement) { nested.value = /** @type {string} */ (draft[id]); continue; }
      const doc = parser.parseFromString(draft[id], 'text/html');
      el.replaceChildren(...doc.body.childNodes);
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
    const status = document.getElementById('font-status-label');
    if (status) status.textContent = 'Aktiv: Eigene Schrift (WOFF2)';
  }
} catch (e) {}
