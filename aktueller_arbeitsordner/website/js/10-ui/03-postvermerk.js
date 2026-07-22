// @ts-check
import { showToast } from './02-toast.js';

/**
 * @param {(() => void) | null} onSaveDraft
 */
export function initPostvermerk(onSaveDraft) {
  const sidebarPvSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('sidebar-pv-select'));
  const pvInput = document.getElementById('postvermerk');

  const pvOptions = [
    "Einschreiben",
    "Einschreiben Einwurf",
    "Einschreiben Rückschein",
    "Einschreiben Wert",
    "Persönlich",
    "Vertraulich",
    "Persönlich / Vertraulich",
    "Nicht nachsenden!",
    "Bei Umzug mit neuer Anschrift zurück",
    "Warensendung",
    "Büchersendung",
    "Einschreiben / Rückschein <br> Persönlich"
  ];

  if (sidebarPvSelect && pvInput) {
    pvOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt.replace('<br>', '/'); // visually strip <br> in select
      sidebarPvSelect.appendChild(option);
    });

    sidebarPvSelect.addEventListener('change', (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      if (!target || !target.value) return;
      
      const val = target.value;
      pvInput.replaceChildren();
      const parts = val.split('<br>');
      /**
       * @param {string} part
       * @param {number} index
       */
      parts.forEach((part, index) => {
        if (index > 0) pvInput.appendChild(document.createElement('br'));
        pvInput.appendChild(document.createTextNode(part.trim()));
      });
      
      if (onSaveDraft) onSaveDraft();
      showToast("Vermerk gesetzt", "success");
      sidebarPvSelect.selectedIndex = -1; // Reset selection so any option can be clicked again
    });
  }
}
