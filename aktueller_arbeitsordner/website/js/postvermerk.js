import { showToast } from './toast.js';

export function initPostvermerk() {
  const sidebarPvSelect = document.getElementById('sidebar-pv-select');
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
      if (!e.target.value) return;
      
      const val = e.target.value;
      pvInput.replaceChildren();
      const parts = val.split('<br>');
      parts.forEach((part, index) => {
        if (index > 0) pvInput.appendChild(document.createElement('br'));
        pvInput.appendChild(document.createTextNode(part.trim()));
      });
      
      if (window.draftManager) window.draftManager.saveDraft();
      showToast("Vermerk gesetzt", "success");
      sidebarPvSelect.value = ""; // Reset to placeholder
    });
  }
}
