// /* @adr [[ADR-DATA-PERSISTENCE]] {JSON Data-IO} */

export function initDevTools() {
  // JSON Export (Dev Tool)
  document.getElementById('btn-copy-json')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const originalText = btn.textContent;
    btn.textContent = 'Kopiere...';
    
    const state = {
      absender: document.getElementById('absender')?.textContent,
      empfaengerName: document.getElementById('empfaenger-name')?.textContent,
      empfaengerFirma: document.getElementById('empfaenger-firma')?.textContent,
      empfaengerStrasse: document.getElementById('empfaenger-strasse')?.textContent,
      empfaengerOrt: document.getElementById('empfaenger-ort')?.textContent,
      betreff: document.getElementById('betreff')?.textContent,
      anrede: document.getElementById('anrede')?.textContent,
      brieftext: document.getElementById('brieftext')?.innerHTML, // Keep HTML serialization
      grussformel: document.getElementById('grussformel')?.textContent,
      unterschrift: document.getElementById('unterschrift')?.textContent,
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
      btn.textContent = '✅ Kopiert!';
    } catch (err) {
      btn.textContent = '❌ Fehler';
    }
    
    setTimeout(() => { btn.textContent = originalText; }, 2000);
  });

  // JSON Import (Dev Tool)
  document.getElementById('btn-paste-json')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const originalText = btn.textContent;
    btn.textContent = 'Füge ein...';
    try {
      const text = await navigator.clipboard.readText();
      const state = JSON.parse(text);
      for (const key of Object.keys(state)) {
        const elem = document.getElementById(key);
        if (elem) {
          if (key === 'brieftext') {
            if (elem.setHTML) {
              try { elem.setHTML(state[key], { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'] }); }
              catch(e) { 
                const parser = new DOMParser();
                const doc = parser.parseFromString(state[key], 'text/html');
                elem.replaceChildren(...doc.body.childNodes);
              }
            }
            else {
              const parser = new DOMParser();
              const doc = parser.parseFromString(state[key], 'text/html');
              elem.replaceChildren(...doc.body.childNodes);
            }
          } else {
            elem.textContent = state[key];
          }
        }
      }
      btn.textContent = '✅ Eingefügt!';
    } catch (err) {
      btn.textContent = '❌ Fehler';
      console.error(err);
    }
    setTimeout(() => { btn.textContent = originalText; }, 2000);
  });
}
