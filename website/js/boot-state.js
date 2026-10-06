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
      /* Nur erlaubte Eingabefelder beschreiben (Schutz gegen Zerstörung von UI-Elementen wie app-shell) */
      if (!el || !el.matches('[contenteditable]:not([data-feldtyp="systemwert"]), select[data-speichern]')) continue;
      if (!draft[id]) continue;
      if (el instanceof HTMLSelectElement) { el.value = /** @type {string} */ (draft[id]); continue; }
      const nested = el.querySelector && el.querySelector('select[data-speichern]');
      if (nested instanceof HTMLSelectElement) { nested.value = /** @type {string} */ (draft[id]); continue; }
      // Rich-Text-Felder überspringen: Werden im DraftManager über 04-sanitize wiederhergestellt
      if (el.dataset.feldtyp?.includes('rich')) continue;
      el.textContent = /** @type {string} */ (draft[id]);
    }
  }
  const pvSel = /** @type {HTMLSelectElement | null} */ (document.getElementById('seitenleiste-postvermerk-select'));
  const pvField = document.getElementById('postvermerk');
  // Initialwert für Postvermerk vorbelegen (Event-Listener liegen zentral in main.js)
  if (pvSel && pvField && pvSel.value && !pvField.textContent.trim()) {
    pvField.textContent = pvSel.value;
  }
  // Eigene Schriftart aktivieren, falls im Storage hinterlegt
  if (/^data:[\w.+-]+\/[\w.+-]+(?:;charset=[\w-]+)?;base64,[A-Za-z0-9+/=]+$/.test(localStorage.getItem('din_custom_font') || '')) {
    document.body.classList.add('schrift-eigene-aktiv');
  }
} catch (e) {
  /* Boot-Restore ist still gescheitert: der Nutzer sieht ein leeres Blatt, obwohl ein
   * Entwurf existiert. Ohne Log war genau das unsichtbar — nicht erneut verschlucken. */
  console.error('[Boot] Entwurf konnte nicht wiederhergestellt werden:', e);
}
