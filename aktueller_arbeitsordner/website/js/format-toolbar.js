export class FormatToolbar {
  constructor(brieftextEl, toolbarEl) {
    this.brieftext = brieftextEl;
    this.toolbar = toolbarEl;
    this.selectionAnchor = document.getElementById('selection-anchor');
    this.selectionTimeout = null;

    // Buttons
    this.btnBold = document.getElementById('btn-bold');
    this.btnUnderline = document.getElementById('btn-underline');
    this.btnQuote = document.getElementById('btn-quote');
    this.btnComment = document.getElementById('btn-comment');
  }

  init() {
    if (!this.brieftext || !this.toolbar) return;

    this._initSelectionListener();
    this._initButtonListeners();
    this._initPasteSanitizer();
    this._initDropHandler();
    this._initKeyboardShortcuts();
  }

  // --- Private Methoden ---

  _isSelectionInsideTag(tagName) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false;
    
    const isCustomComment = tagName === 'comment';
    const actualTag = isCustomComment ? 'SPAN' : tagName;

    let node = selection.anchorNode;
    while (node && node !== this.brieftext) {
      const name = node.nodeName.toUpperCase();
      if (name === actualTag.toUpperCase() || 
          (actualTag.toUpperCase() === 'B' && name === 'STRONG')) {
        if (isCustomComment && !node.classList.contains('din-comment')) {
          // Keep searching upwards
        } else {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  _getBlockquoteAncestor(anchorNode) {
    let node = anchorNode;
    while (node && node !== this.brieftext) {
      if (node.nodeName === 'BLOCKQUOTE') return node;
      node = node.parentNode;
    }
    return null;
  }

  _handleSelectionChange() {
    const selection = window.getSelection();

    // Vorfilter: Is something selected?
    if (selection.isCollapsed || selection.toString().trim().length === 0) {
      this.hideToolbar();
      return;
    }

    // Scope-Filter: Is selection strictly inside brieftext?
    if (!this.brieftext.contains(selection.anchorNode)) {
      this.hideToolbar();
      return;
    }

    // Read Range coordinates
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position the external anchor exactly at the start of the selection relative to the body
    if (this.selectionAnchor) {
      this.selectionAnchor.style.top = `${rect.top}px`;
      this.selectionAnchor.style.left = `${rect.left}px`;
    }

    // Open Popover first so offsetHeight/offsetWidth are calculated by browser
    if (!this.toolbar.matches(':popover-open')) {
      try {
        this.toolbar.showPopover();
      } catch (e) {
        console.warn('[Toolbar] showPopover failed:', e);
      }
    }

    // Zustandserkennung & A11y
    const isBold = this._isSelectionInsideTag('B');
    const isUnderline = this._isSelectionInsideTag('U');
    const isQuote = this._isSelectionInsideTag('BLOCKQUOTE');
    const isComment = this._isSelectionInsideTag('comment');

    if (this.btnBold) {
      if (isBold) {
        this.btnBold.classList.add('active');
        this.btnBold.setAttribute('aria-pressed', 'true');
      } else {
        this.btnBold.classList.remove('active');
        this.btnBold.setAttribute('aria-pressed', 'false');
      }
    }

    if (this.btnUnderline) {
      if (isUnderline) {
        this.btnUnderline.classList.add('active');
        this.btnUnderline.setAttribute('aria-pressed', 'true');
      } else {
        this.btnUnderline.classList.remove('active');
        this.btnUnderline.setAttribute('aria-pressed', 'false');
      }
    }

    if (this.btnQuote) {
      if (isQuote) {
        this.btnQuote.classList.add('active');
        this.btnQuote.setAttribute('aria-pressed', 'true');
      } else {
        this.btnQuote.classList.remove('active');
        this.btnQuote.setAttribute('aria-pressed', 'false');
      }
    }

    if (this.btnComment) {
      if (isComment) {
        this.btnComment.classList.add('active');
        this.btnComment.setAttribute('aria-pressed', 'true');
      } else {
        this.btnComment.classList.remove('active');
        this.btnComment.setAttribute('aria-pressed', 'false');
      }
    }
  }

  _initSelectionListener() {
    document.addEventListener('selectionchange', () => {
      clearTimeout(this.selectionTimeout);
      this.selectionTimeout = setTimeout(() => this._handleSelectionChange(), 50);
    });
  }

  _initButtonListeners() {
    if (this.btnBold) {
      this.btnBold.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFormat('B');
      });
    }

    if (this.btnUnderline) {
      this.btnUnderline.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFormat('U');
      });
    }

    if (this.btnQuote) {
      this.btnQuote.addEventListener('click', (e) => {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection.isCollapsed || !this.brieftext.contains(selection.anchorNode)) return;

        const range = selection.getRangeAt(0);
        const bq = this._getBlockquoteAncestor(selection.anchorNode);

        if (bq) {
          // UNWRAP: Replace blockquote with its children
          const parent = bq.parentNode;
          while (bq.firstChild) {
            parent.insertBefore(bq.firstChild, bq);
          }
          parent.removeChild(bq);
        } else {
          // WRAP: Wrap range contents in a blockquote
          const quote = document.createElement('blockquote');
          quote.appendChild(range.extractContents());
          range.insertNode(quote);
        }

        this._triggerSave();
        this._handleSelectionChange();
      });
    }

    if (this.btnComment) {
      this.btnComment.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFormat('comment');
      });
    }
  }

  _initKeyboardShortcuts() {
    this.brieftext.addEventListener('keydown', (e) => {
      // Custom blockquote shortcut: Strg+Shift+9
      if (e.ctrlKey && e.shiftKey && e.key === '9') {
        e.preventDefault();
        if (this.btnQuote) this.btnQuote.click();
      }
    });
  }

  _initPasteSanitizer() {
    // Strikter HTML-Paste-Filter (behält nur strong, b, u, s, blockquote, und din-comment spans)
    this.brieftext.addEventListener('paste', (e) => {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');

      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      if (html) {
        let cleanFragment = document.createDocumentFragment();
        let useFallback = true;
        
        // Try native W3C Sanitizer API first (Chrome 119+)
        const dummyDiv = document.createElement('div');
        if (dummyDiv.setHTML) {
          try {
            dummyDiv.setHTML(html, { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'], attributes: {'span': ['class']} });
            while (dummyDiv.firstChild) {
              cleanFragment.appendChild(dummyDiv.firstChild);
            }
            useFallback = false;
          } catch(e) {
            console.warn('[Paste] Native setHTML Sanitizer failed, using fallback.');
          }
        }
        
        if (useFallback) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          function sanitizeNode(node) {
            const allowedTags = ['B', 'STRONG', 'U', 'S', 'BLOCKQUOTE'];
            
            if (node.nodeType === Node.TEXT_NODE) {
              return document.createTextNode(node.textContent);
            }
            
            if (node.nodeType !== Node.ELEMENT_NODE) return document.createTextNode('');
            
            let newNode;
            if (allowedTags.includes(node.nodeName)) {
               newNode = document.createElement(node.nodeName.toLowerCase());
            } else if (node.nodeName === 'SPAN' && node.classList.contains('din-comment')) {
               newNode = document.createElement('span');
               newNode.className = 'din-comment';
            } else {
               const frag = document.createDocumentFragment();
               node.childNodes.forEach(child => {
                 frag.appendChild(sanitizeNode(child));
               });
               return frag;
            }
            
            node.childNodes.forEach(child => {
              newNode.appendChild(sanitizeNode(child));
            });
            
            return newNode;
          }

          doc.body.childNodes.forEach(child => {
            cleanFragment.appendChild(sanitizeNode(child));
          });
        }

        if (cleanFragment.childNodes.length === 0) {
            range.insertNode(document.createTextNode(text));
        } else {
            const lastChild = cleanFragment.lastChild;
            range.insertNode(cleanFragment);
            if (lastChild) {
                range.setStartAfter(lastChild);
                range.collapse(true);
            }
        }
      } else {
        range.insertNode(document.createTextNode(text));
        selection.collapseToEnd();
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
      this._triggerSave();
    });
  }

  _initDropHandler() {
    this.brieftext.addEventListener('drop', (e) => {
      e.preventDefault();
      const text = e.dataTransfer.getData('text/plain');

      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      }
      this._triggerSave();
    });
  }

  _triggerSave() {
    if (window.draftManager) {
      window.draftManager.saveDraft();
    }
  }

  // --- Öffentliche Methoden ---

  hideToolbar() {
    if (this.toolbar.matches(':popover-open')) {
      this.toolbar.hidePopover();
    }
  }

  toggleFormat(tagName) {
    const selection = window.getSelection();
    if (selection.isCollapsed || !this.brieftext.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    
    const isCustomComment = tagName === 'comment';
    const actualTag = isCustomComment ? 'SPAN' : tagName;
    
    if (this._isSelectionInsideTag(tagName)) {
      // UNWRAP
      let node = selection.anchorNode;
      let formatNode = null;
      while (node && node !== this.brieftext) {
        const name = node.nodeName.toUpperCase();
        if (name === actualTag.toUpperCase() || (actualTag.toUpperCase() === 'B' && name === 'STRONG')) {
          if (isCustomComment && !node.classList.contains('din-comment')) {
             // Keep searching
          } else {
            formatNode = node;
            break;
          }
        }
        node = node.parentNode;
      }
      
      if (formatNode) {
        const parent = formatNode.parentNode;
        const fragment = document.createDocumentFragment();
        while (formatNode.firstChild) {
          fragment.appendChild(formatNode.firstChild);
        }
        parent.replaceChild(fragment, formatNode);
      }
    } else {
      // WRAP
      const wrapper = document.createElement(actualTag.toLowerCase());
      if (isCustomComment) wrapper.className = 'din-comment';
      try {
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);
        selection.selectAllChildren(wrapper);
      } catch (err) {
        console.warn('[Format] Failed to wrap range:', err);
      }
    }
    
    this.brieftext.normalize();
    this._triggerSave();
    this._handleSelectionChange();
  }
}
