// @ts-check

/**
 * @param {HTMLSelectElement} select
 * @returns {string}
 */
function selectedPvText(select) {
  const opt = select.selectedOptions[0];
  const raw = (opt && (opt.textContent || opt.value)) || select.value || '';
  return String(raw)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {{ onSaveDraft: (() => void) | null, settings?: any, saveSettings?: () => void }} ctx
 */
export function initPostvermerk({ onSaveDraft, settings, saveSettings }) {
  const sidebarPvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('sidebar-pv-select'));
  const pvInput = document.getElementById('postvermerk');
  const pvToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-postvermerk'));

  if (!sidebarPvSelect || !pvInput) return;

  const applyValue = () => {
    const val = selectedPvText(sidebarPvSelect);
    pvInput.textContent = val;
    pvInput.replaceChildren(document.createTextNode(val));

    if (val && pvToggle && !pvToggle.checked) {
      pvToggle.checked = true;
    }
    if (settings && saveSettings) {
      settings.postvermerkActive = !!(pvToggle && pvToggle.checked);
      saveSettings();
    }
    if (onSaveDraft) onSaveDraft();
  };

  sidebarPvSelect.addEventListener('input', applyValue);
  sidebarPvSelect.addEventListener('change', applyValue);
  sidebarPvSelect.addEventListener('click', (e) => {
    const opt = /** @type {HTMLElement} */ (e.target)?.closest?.('option');
    if (!opt) return;
    const value = opt.getAttribute('value') || opt.textContent || '';
    if (value) sidebarPvSelect.value = value;
    applyValue();
  });

  if (pvToggle) {
    pvToggle.addEventListener('change', () => {
      if (pvToggle.checked && !pvInput.textContent?.trim()) applyValue();
      else if (settings && saveSettings) {
        settings.postvermerkActive = pvToggle.checked;
        saveSettings();
        if (onSaveDraft) onSaveDraft();
      }
    });
  }
}
