// @ts-check

/* =========================================================================================
 * 🛡️ ARCHITECTURE GUARD: MODERN WEB PLATFORM PLAINTEXT ENGINE (W3C Standard)
 *
 * ⚠️ ACHTUNG FÜR ZUKÜNFTIGE KIs / LLMs / DEVELOPER:
 * Alle einzeiligen DIN-Felder nutzen `contenteditable="plaintext-only"` und `enterkeyhint="done"`.
 * Der Browser unterbindet Rich-Text, Formatierungs-Tags (bold/italic) und unerwünschte
 * Zeilenumbrüche NATIV im C++ Core der Rendering-Engine.
 *
 * ES IST STRENGSTENS UNTERSAGT (Immutable Law A49 & ADR-JS):
 * 1. Vorab-Interzeptoren für `beforeinput` (formatBold, formatItalic, etc.) neu einzuführen.
 * 2. Manuelle HTML-Sanitization per Regex in Input-Listenern wiederherzustellen.
 * 3. DOM-Messschleifen oder Polling für Zeilenbegrenzungen einzubauen.
 * ========================================================================================= */

export class UIProtections {
  constructor() {
    /** @type {HTMLElement | null} */
    this.paper = document.querySelector('din-a4');
    /** @type {HTMLElement | null} */
    this.brieftext = document.getElementById('brieftext');
    /** @type {string[]} */
    this.multiLineIds = ['brieftext', 'anlagen-text'];
    /** @type {string[]} */
    this.maxTwoLinesIds = ['betreff', 'postvermerk'];
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.enforceLineLimits();
    this.protectAnlagenList();
    this.initialized = true;
  }

  enforceLineLimits() {
    document.querySelectorAll('[contenteditable]').forEach(elem => {
      const el = /** @type {HTMLElement} */ (elem);
      
      // Enter-Taste abfangen: Single-Line blockiert Umbruch, maxTwoLines begrenzt auf 2 Zeilen
      el.addEventListener('keydown', (e) => {
        const keyboardEvent = /** @type {KeyboardEvent} */ (e);
        if (keyboardEvent.key === 'Enter') {
          if (this.multiLineIds.includes(el.id)) {
            return;
          } else if (this.maxTwoLinesIds.includes(el.id)) {
            const text = el.innerText || el.textContent || '';
            if (text.split('\n').length >= 2) {
              keyboardEvent.preventDefault();
            }
          } else {
            keyboardEvent.preventDefault();
          }
        }
      });

      // Paste-Handling: Mehrzeiligen Text für Einzeiler einebnen, 2-Zeiler begrenzen
      el.addEventListener('paste', (e) => {
        if (this.multiLineIds.includes(el.id)) return;
        
        const clipboardEvent = /** @type {ClipboardEvent} */ (e);
        const clipboardData = clipboardEvent.clipboardData || /** @type {any} */ (clipboardEvent).originalEvent?.clipboardData;
        let pastedText = clipboardData ? clipboardData.getData('text/plain') : '';
        if (!pastedText) return;

        clipboardEvent.preventDefault();
        const isTwoLine = this.maxTwoLinesIds.includes(el.id);

        if (isTwoLine) {
          const maxChars = 130;
          pastedText = pastedText.split(/\r?\n/).slice(0, 2).join('\n');
          if (pastedText.length > maxChars) {
            pastedText = pastedText.substring(0, maxChars);
          }
        } else {
          pastedText = pastedText.replace(/[\r\n]+/g, ' ');
        }

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(pastedText));
        selection.collapseToEnd();
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }

  protectAnlagenList() {
    const anlagen = document.getElementById('anlagen-text');
    if (!anlagen) return;
    
    this.ensureListStructure(anlagen);
    
    anlagen.addEventListener('input', () => {
      this.ensureListStructure(anlagen);
    });
    
    anlagen.addEventListener('keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      if (keyboardEvent.key === 'Backspace' || keyboardEvent.key === 'Delete') {
        const lis = anlagen.querySelectorAll('li');
        if (lis.length === 1 && lis[0].textContent && lis[0].textContent.trim() === '') {
          keyboardEvent.preventDefault();
        }
      }
    });
  }
  
  /**
   * @param {HTMLElement} anlagen
   */
  ensureListStructure(anlagen) {
    if (anlagen.children.length === 0 || anlagen.innerHTML.trim() === '' || anlagen.innerHTML.trim() === '<br>') {
      const li = document.createElement('li');
      anlagen.replaceChildren(li);
      
      if (document.activeElement === anlagen) {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.setStart(li, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }
}