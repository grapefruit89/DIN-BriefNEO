// @ts-check
import { showToast } from './02-toast.js';

/**
 * @param {(() => void) | null} onSaveDraft
 */
export function initPostvermerk(onSaveDraft) {
  const sidebarPvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('sidebar-pv-select'));
  const pvInput = document.getElementById('postvermerk');

  if (sidebarPvSelect && pvInput) {
    sidebarPvSelect.addEventListener('change', (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      if (!target || !target.value) return;
      
      const val = target.value;
      const parser = new DOMParser();
      const doc = parser.parseFromString(val, 'text/html');
      pvInput.replaceChildren(...doc.body.childNodes);
      
      if (onSaveDraft) onSaveDraft();
      showToast("Vermerk gesetzt", "success");
      sidebarPvSelect.selectedIndex = -1; // Reset selection so any option can be clicked again
    });
  }
}
