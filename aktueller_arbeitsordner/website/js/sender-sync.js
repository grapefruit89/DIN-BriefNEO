// @adr [[ADR-JS]] 
// @guide [[glossary]] 

/* js/sender-sync.js */

/**
 * Synchronizes the sender information from the info block to the return address line
 * and the signature name. This restores the logic from the original project.
 */
export function initSenderSync() {
    const infoName = document.getElementById('info-name');
    const infoStreet = document.getElementById('info-street');
    const infoCity = document.getElementById('info-city');
    const absender = document.getElementById('absender');
    const unterschrift = document.getElementById('unterschrift');

    if (!infoName || !infoStreet || !infoCity || !absender || !unterschrift) return;

    function sync() {
        const name = infoName.textContent.trim();
        const street = infoStreet.textContent.trim();
        const city = infoCity.textContent.trim();

        // 1. Sync to Rücksendezeile (absender)
        const parts = [name, street, city].filter(p => p.length > 0);
        absender.textContent = parts.join(' • ');

        // 2. Sync to Maschinenschrift (unterschrift)
        // Only if the user hasn't heavily modified it manually, or just aggressively sync it
        // The original repo aggressively synced it.
        unterschrift.textContent = name;
        
        // Dispatch input events so saveDraftData triggers if needed
        absender.dispatchEvent(new Event('input', { bubbles: true }));
        unterschrift.dispatchEvent(new Event('input', { bubbles: true }));
    }

    infoName.addEventListener('input', sync);
    infoStreet.addEventListener('input', sync);
    infoCity.addEventListener('input', sync);
}
