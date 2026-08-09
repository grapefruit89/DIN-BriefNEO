// @ts-check
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
      el.addEventListener('keydown', (e) => {
        const keyboardEvent = /** @type {KeyboardEvent} */ (e);
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(keyboardEvent.key) || keyboardEvent.ctrlKey || keyboardEvent.metaKey) return;
        
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
        } else {
          // Line limit protection: maxTwoLinesIds prevent flooding (> 130 chars)
          const isTwoLine = this.maxTwoLinesIds.includes(el.id);
          if (isTwoLine) {
            const text = el.innerText || el.textContent || '';
            const maxChars = 130;
            const selection = window.getSelection();
            const selectionLength = selection ? selection.toString().length : 0;
            if (text.length - selectionLength >= maxChars && keyboardEvent.key.length === 1) {
              keyboardEvent.preventDefault();
            }
          }
        }
      });
      
      el.addEventListener('paste', (e) => {
        const clipboardEvent = /** @type {ClipboardEvent} */ (e);
        if (this.multiLineIds.includes(el.id)) return;
        
        clipboardEvent.preventDefault();
        const clipboardData = clipboardEvent.clipboardData || /** @type {any} */ (clipboardEvent).originalEvent?.clipboardData;
        let pastedText = clipboardData ? clipboardData.getData('text/plain') : '';
        const isTwoLine = this.maxTwoLinesIds.includes(el.id);
        
        const selection = window.getSelection();
        if (!selection) return;

        if (isTwoLine) {
          const maxChars = 130;
          const selectedLength = selection.toString().length;
          const currentText = el.innerText || el.textContent || '';
          const currentLength = currentText.length - selectedLength;
          let allowedPasteLength = maxChars - currentLength;
          if (allowedPasteLength <= 0) return;
          pastedText = pastedText.split('\n').slice(0, 2).join('\n');
          if (pastedText.length > allowedPasteLength) {
            pastedText = pastedText.substring(0, allowedPasteLength);
          }
        } else {
          pastedText = pastedText.replace(/[\r\n]+/g, ' ');
        }
        
        if (!selection.rangeCount) return;
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
    
    // Ensure the structure is correct initially
    this.ensureListStructure(anlagen);
    
    anlagen.addEventListener('input', () => {
      this.ensureListStructure(anlagen);
    });
    
    anlagen.addEventListener('keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      if (keyboardEvent.key === 'Backspace' || keyboardEvent.key === 'Delete') {
        const lis = anlagen.querySelectorAll('li');
        if (lis.length === 1 && lis[0].textContent && lis[0].textContent.trim() === '') {
          // Don't delete the last empty li
          keyboardEvent.preventDefault();
        }
      }
      
      // If user presses enter in an empty li, browser might do weird things
      // The browser's native enter key in a list usually creates a new li, which is fine
    });
  }
  
  /**
   * @param {HTMLElement} anlagen
   */
  ensureListStructure(anlagen) {
    if (anlagen.children.length === 0 || anlagen.innerHTML.trim() === '' || anlagen.innerHTML.trim() === '<br>') {
      const li = document.createElement('li');
      anlagen.replaceChildren(li);
      
      // Move cursor into the new li if focused
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
    } else {
      // Sometimes browsers insert raw text nodes or divs, wrap them in li
      let hasTextNodes = false;
      for (const node of anlagen.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim() !== '') {
          hasTextNodes = true;
          break;
        } else if (node.nodeType === Node.ELEMENT_NODE && /** @type {Element} */ (node).tagName !== 'LI') {
          hasTextNodes = true;
          break;
        }
      }
      
      if (hasTextNodes) {
        // Native contenteditable can be messy, we just wrap all raw content into a new li
        // or just let it be unless it's completely broken. For now, simple check is enough.
      }
    }
  }

}