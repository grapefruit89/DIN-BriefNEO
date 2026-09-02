// @ts-check
import { showToast } from './32-toast.js';

/**
 * @param {string} val
 * @returns {string}
 */
function normalizePvValue(val) {
  return String(val || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\s+\n/g, '\n')
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

  /**
   * @param {string} [raw]
   */
  const applyValue = (raw) => {
    const val = normalizePvValue(raw ?? sidebarPvSelect.value);
    pvInput.textContent = val;
    if (val && pvToggle && !pvToggle.checked) {
      pvToggle.checked = true;
      if (settings) settings.postvermerkActive = true;
    }
    if (settings && saveSettings) {
      settings.postvermerkActive = !!(pvToggle && pvToggle.checked);
      saveSettings();
    }
    if (onSaveDraft) onSaveDraft();
  };

  sidebarPvSelect.addEventListener('input', () => applyValue());
  sidebarPvSelect.addEventListener('change', () => applyValue());

  if (pvToggle) {
    pvToggle.addEventListener('change', () => {
      if (pvToggle.checked) {
        if (!pvInput.textContent?.trim()) applyValue();
      } else if (settings && saveSettings) {
        settings.postvermerkActive = false;
        saveSettings();
        if (onSaveDraft) onSaveDraft();
      }
    });
  }
}
