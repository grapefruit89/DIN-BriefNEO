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
            const maxChars = isSingleLine ? 75 : 150;
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
        let text = (e.originalEvent || e).clipboardData.getData('text/plain');
        if (this.maxTwoLinesIds.includes(el.id)) {
            text = text.split('\n').slice(0, 2).join('\n');
            if (text.length > 150) text = text.substring(0, 150);
        } else {
            text = text.replace(/[\r\n]+/g, ' ');
            if (text.length > 75) text = text.substring(0, 75);
        }
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(text));
        selection.collapseToEnd();
      });
    });
  }
}
