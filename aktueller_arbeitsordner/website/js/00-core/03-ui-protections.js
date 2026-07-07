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
    this.protectAnlagenList();
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

  protectAnlagenList() {
    const anlagen = document.getElementById('anlagen-text');
    if (!anlagen) return;
    
    // Ensure the structure is correct initially
    this.ensureListStructure(anlagen);
    
    anlagen.addEventListener('input', () => {
      this.ensureListStructure(anlagen);
    });
    
    anlagen.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const lis = anlagen.querySelectorAll('li');
        if (lis.length === 1 && lis[0].textContent.trim() === '') {
          // Don't delete the last empty li
          e.preventDefault();
        }
      }
      
      // If user presses enter in an empty li, browser might do weird things
      // The browser's native enter key in a list usually creates a new li, which is fine
    });
  }
  
  ensureListStructure(anlagen) {
    if (anlagen.children.length === 0 || anlagen.innerHTML.trim() === '' || anlagen.innerHTML.trim() === '<br>') {
      const li = document.createElement('li');
      anlagen.replaceChildren(li);
      
      // Move cursor into the new li if focused
      if (document.activeElement === anlagen) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(li, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Sometimes browsers insert raw text nodes or divs, wrap them in li
      let hasTextNodes = false;
      for (const node of anlagen.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
          hasTextNodes = true;
          break;
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'LI') {
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