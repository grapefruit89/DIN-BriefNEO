// @ts-check
import { showToast } from './32-toast.js';

/**
 * @param {{ onSaveDraft: (() => void) | null, settings?: any, saveSettings?: () => void }} ctx
 */
export function initPostvermerk({ onSaveDraft, settings, saveSettings }) {
  const sidebarPvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('sidebar-pv-select'));
  const pvInput = document.getElementById('postvermerk');

  const pvToggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-postvermerk'));

  if (sidebarPvSelect && pvInput) {
    // 1. Dropdown Change Handler
    sidebarPvSelect.addEventListener('change', (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      if (!target) return;
      
      const val = target.value;
      if (!val) {
        pvInput.replaceChildren(); // Clear it
      } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(val, 'text/html');
        pvInput.replaceChildren(...doc.body.childNodes);
      }
      
      // Auto-enable checkbox if not already checked
      if (pvToggle && !pvToggle.checked) {
        pvToggle.checked = true;
        // Dispatch change event to trigger the save logic below
        pvToggle.dispatchEvent(new Event('change'));
      }
      
      if (onSaveDraft) onSaveDraft();
    });

    // 2. Checkbox Toggle Handler
    if (pvToggle) {
      pvToggle.addEventListener('change', () => {
        // If turned ON and paper is currently empty, populate with dropdown's selected value
        if (pvToggle.checked && !pvInput.textContent?.trim()) {
          const val = sidebarPvSelect.value;
          if (val) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(val, 'text/html');
            pvInput.replaceChildren(...doc.body.childNodes);
          }
        }
        
        // Save the active state of the checkbox
        if (settings && saveSettings) {
          settings.postvermerkActive = pvToggle.checked;
          saveSettings();
        }
        
        if (onSaveDraft) onSaveDraft();
      });
    }
  }
}
