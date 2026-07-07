export class UIProtections {
  constructor() {
    this.paper = document.querySelector('din-a4');
    this.brieftext = document.getElementById('brieftext');
    this.multiLineIds = ['brieftext', 'anlagen-text'];
    this.maxTwoLinesIds = ['betreff'];
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.enforceLineLimits();
    this.initialized = true;
  }

  checkTextOverflow() {
    if (!this.brieftext || !this.paper) return;
    
    // Printable core area maximum height is ~120mm on scale, which is roughly 450px inside 94vh container
    const maxTextHeight = 450;
    
    if (this.brieftext.scrollHeight > maxTextHeight) {
      this.paper.classList.add('overflow-warn');
    } else {
      this.paper.classList.remove('overflow-warn');
    }
  }

  enforceLineLimits() {
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
        
        if (e.key === 'Enter') {
          if (this.multiLineIds.includes(el.id)) {
            return;
          } else if (this.maxTwoLinesIds.includes(el.id)) {
            const text = el.innerText || el.textContent;
            if (text.split('\n').length >= 2) {
              e.preventDefault();
            }
          } else {
            e.preventDefault();
          }
        } else {
          // Character limit to prevent flooding
          const isSingleLine = !this.multiLineIds.includes(el.id) && !this.maxTwoLinesIds.includes(el.id);
          const isTwoLine = this.maxTwoLinesIds.includes(el.id);
          
          if (isSingleLine || isTwoLine) {
            const text = el.innerText || el.textContent;
            const maxChars = isSingleLine ? 60 : 130;
            const selection = window.getSelection();
            // Only prevent if trying to type a character and we're at/over limit, 
            // and no text is selected to be replaced
            if (text.length - selection.toString().length >= maxChars && e.key.length === 1) {
              e.preventDefault();
            }
          }
        }
      });
      
            el.addEventListener('paste', (e) => {
        if (this.multiLineIds.includes(el.id)) return;
        
        e.preventDefault();
        let pastedText = (e.originalEvent || e).clipboardData.getData('text/plain');
        const isTwoLine = this.maxTwoLinesIds.includes(el.id);
        const maxChars = isTwoLine ? 130 : 60;
        
        const selection = window.getSelection();
        const selectedLength = selection.toString().length;
        const currentText = el.innerText || el.textContent;
        const currentLength = currentText.length - selectedLength;
        
        let allowedPasteLength = maxChars - currentLength;
        if (allowedPasteLength <= 0) return;
        
        if (isTwoLine) {
            pastedText = pastedText.split('
').slice(0, 2).join('
');
        } else {
            pastedText = pastedText.replace(/[
]+/g, ' ');
        }
        
        if (pastedText.length > allowedPasteLength) {
            pastedText = pastedText.substring(0, allowedPasteLength);
        }
        
        if (!selection.rangeCount) return;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(pastedText));
        selection.collapseToEnd();
      });
    });
  }
}
