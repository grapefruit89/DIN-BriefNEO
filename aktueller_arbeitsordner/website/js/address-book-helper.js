import { showToast } from './toast.js';

export function initAddressBookSaveButton() {
  const container = document.getElementById('empfaenger');
  if (!container) return;

  // Create a minimal save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾';
  saveBtn.title = 'Aktuelle Adresse ins Adressbuch speichern';
  Object.assign(saveBtn.style, {
    position: 'absolute',
    top: '0',
    right: '-30px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    opacity: '0.3',
    transition: 'opacity 0.2s',
    zIndex: '10'
  });

  saveBtn.addEventListener('mouseenter', () => saveBtn.style.opacity = '1');
  saveBtn.addEventListener('mouseleave', () => saveBtn.style.opacity = '0.3');

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const firma = document.getElementById('empfaenger-firma')?.textContent.trim() || '';
    const name = document.getElementById('empfaenger-name')?.textContent.trim() || '';
    const strasse = document.getElementById('empfaenger-strasse')?.textContent.trim() || '';
    const ort = document.getElementById('empfaenger-ort')?.textContent.trim() || '';

    // Require at least a name or company and a city
    if (!(firma || name) || !ort) {
      showToast('⚠️ Bitte mindestens Name/Firma und Ort eingeben', 'error');
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      type: 'local',
      firma,
      name,
      strasse,
      ort,
      plz: ort.split(' ')[0] || '',
      city: ort.split(' ').slice(1).join(' ') || ''
    };

    // Construct the formatted string for the dropdown label
    const parts = [];
    if (firma) parts.push(firma);
    if (name) parts.push(name);
    if (strasse) parts.push(strasse);
    if (ort) parts.push(ort);
    newItem.formatted = parts.join(', ');

    // Save to local storage
    try {
      const existingStr = localStorage.getItem('din_local_address_book');
      let book = existingStr ? JSON.parse(existingStr) : [];
      
      // Prevent exact duplicates
      const isDuplicate = book.some(entry => entry.formatted === newItem.formatted);
      if (isDuplicate) {
        showToast('ℹ️ Adresse ist bereits im Adressbuch', 'info');
        return;
      }

      book.unshift(newItem);
      if (book.length > 100) book = book.slice(0, 100); // Keep max 100
      
      localStorage.setItem('din_local_address_book', JSON.stringify(book));
      showToast('✅ Erfolgreich ins Adressbuch gespeichert', 'success');
    } catch (e) {
      console.error(e);
      showToast('❌ Fehler beim Speichern', 'error');
    }
  });

  // Ensure container has relative positioning for the absolute button
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.appendChild(saveBtn);
}
