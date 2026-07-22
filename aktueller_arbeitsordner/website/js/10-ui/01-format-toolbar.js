// @ts-check
export class FormatToolbar {
  /** @type {HTMLElement} */
  #brieftext;
  /** @type {HTMLElement} */
  #toolbar;
  /** @type {(() => void) | null} */
  #onSaveDraft;
  /** @type {HTMLElement | null} */
  #selectionAnchor;
  /** @type {any} */
  #selectionTimeout;
  /** @type {Range | null} */
  #currentRange = null;
  /** @type {HTMLElement | null} */
  #btnBold = null;
  /** @type {HTMLElement | null} */
  #btnUnderline = null;
  /** @type {HTMLElement | null} */
  #btnQuote = null;
  /** @type {HTMLElement | null} */
  #btnComment = null;

  /**
   * @param {HTMLElement} brieftextEl
   * @param {HTMLElement} toolbarEl
   * @param {(() => void) | null} onSaveDraft
   */
  constructor(brieftextEl, toolbarEl, onSaveDraft = null) {
    this.#brieftext = brieftextEl;
    this.#toolbar = toolbarEl;
    this.#onSaveDraft = onSaveDraft;
    this.#selectionAnchor = document.getElementById('selection-anchor');
    this.#selectionTimeout = null;
  }

  init() {
    if (!this.#brieftext || !this.#toolbar) return;
    
    // We fetch the buttons here internally
    this.#btnBold = document.getElementById('btn-bold');
    this.#btnUnderline = document.getElementById('btn-underline');
    this.#btnQuote = document.getElementById('btn-quote');
    this.#btnComment = document.getElementById('btn-comment');

    this.#initSelectionListener();
    this.#initButtonListeners();
    this.#initPasteSanitizer();
    this.#initDropHandler();
    this.#initKeyboardShortcuts();
  }

  // --- Private Methoden ---

  /**
   * @param {string} tagName
   * @returns {boolean}
   */
  #isSelectionInsideTag(tagName) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const isCustomComment = tagName === 'comment';
    const actualTag = isCustomComment ? 'SPAN' : tagName;

    let node = selection.anchorNode;
    while (node && node !== this.#brieftext) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = /** @type {HTMLElement} */ (node);
        const name = element.nodeName.toUpperCase();
        if (name === actualTag.toUpperCase() || 
            (actualTag.toUpperCase() === 'B' && name === 'STRONG')) {
          if (isCustomComment && !element.classList.contains('din-comment')) {
            // Keep searching upwards
          } else {
            return true;
          }
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * @param {Node | null} anchorNode
   * @returns {Element | null}
   */
  #getBlockquoteAncestor(anchorNode) {
    let node = anchorNode;
    while (node && node !== this.#brieftext) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = /** @type {Element} */ (node);
        if (element.nodeName === 'BLOCKQUOTE') return element;
      }
      node = node.parentNode;
    }
    return null;
  }

  #handleSelectionChange() {
    const selection = window.getSelection();
    if (!selection) return;

    // Vorfilter: Is something selected?
    if (selection.isCollapsed || selection.toString().trim().length === 0) {
      this.#hideToolbar();
      return;
    }

    // Scope-Filter: Is selection strictly inside brieftext?
    if (!selection.anchorNode || !this.#brieftext.contains(selection.anchorNode)) {
      this.#hideToolbar();
      return;
    }

    // Read Range coordinates
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position the external anchor exactly at the start of the selection relative to the body
    if (this.#selectionAnchor) {
      this.#selectionAnchor.style.top = `${rect.top}px`;
      this.#selectionAnchor.style.left = `${rect.left}px`;
    }

    // Open Popover first so offsetHeight/offsetWidth are calculated by browser
    if (!this.#toolbar.matches(':popover-open')) {
      try {
        this.#toolbar.showPopover();
      } catch (e) {
        console.warn('[Toolbar] showPopover failed:', e);
      }
    }

    // Zustandserkennung & A11y
    const isBold = this.#isSelectionInsideTag('B');
    const isUnderline = this.#isSelectionInsideTag('U');
    const isQuote = this.#isSelectionInsideTag('BLOCKQUOTE');
    const isComment = this.#isSelectionInsideTag('comment');

    if (this.#btnBold) {
      if (isBold) {
        this.#btnBold.setAttribute('aria-pressed', 'true');
      } else {
        this.#btnBold.setAttribute('aria-pressed', 'false');
      }
    }

    if (this.#btnUnderline) {
      if (isUnderline) {
        this.#btnUnderline.setAttribute('aria-pressed', 'true');
      } else {
        this.#btnUnderline.setAttribute('aria-pressed', 'false');
      }
    }

    if (this.#btnQuote) {
      if (isQuote) {
        this.#btnQuote.setAttribute('aria-pressed', 'true');
      } else {
        this.#btnQuote.setAttribute('aria-pressed', 'false');
      }
    }

    if (this.#btnComment) {
      if (isComment) {
        this.#btnComment.setAttribute('aria-pressed', 'true');
      } else {
        this.#btnComment.setAttribute('aria-pressed', 'false');
      }
    }
  }

  #initSelectionListener() {
    document.addEventListener('selectionchange', () => {
      clearTimeout(this.#selectionTimeout);
      this.#selectionTimeout = setTimeout(() => this.#handleSelectionChange(), 50);
    });
  }

  #initButtonListeners() {
    if (this.#btnBold) {
      this.#btnBold.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFormat('B');
      });
    }

    if (this.#btnUnderline) {
      this.#btnUnderline.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFormat('U');
      });
    }

    if (this.#btnQuote) {
      this.#btnQuote.addEventListener('click', (e) => {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.anchorNode || !this.#brieftext.contains(selection.anchorNode)) return;

        const range = selection.getRangeAt(0);
        const bq = this.#getBlockquoteAncestor(selection.anchorNode);

        if (bq) {
          // UNWRAP: Replace blockquote with its children
          const parent = bq.parentNode;
          if (parent) {
            while (bq.firstChild) {
              parent.insertBefore(bq.firstChild, bq);
            }
            parent.removeChild(bq);
          }
        } else {
          // WRAP: Wrap range contents in a blockquote
          const quote = document.createElement('blockquote');
          quote.appendChild(range.extractContents());
          range.insertNode(quote);
        }

        this.#triggerSave();
        this.#handleSelectionChange();
      });
    }

    if (this.#btnComment) {
      this.#btnComment.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFormat('comment');
      });
    }
  }

  #initKeyboardShortcuts() {
    this.#brieftext.addEventListener('keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      // Bold shortcut: Strg+B
      if ((keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'b') {
        keyboardEvent.preventDefault();
        if (this.#btnBold) this.#btnBold.click();
      }
      
      // Underline shortcut: Strg+U
      if ((keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'u') {
        keyboardEvent.preventDefault();
        if (this.#btnUnderline) this.#btnUnderline.click();
      }
      
      // Custom blockquote shortcut: Strg+Q
      if ((keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'q') {
        keyboardEvent.preventDefault();
        if (this.#btnQuote) this.#btnQuote.click();
      }
    });
  }

  #initPasteSanitizer() {
    // Strikter HTML-Paste-Filter (behält nur strong, b, u, s, blockquote, und din-comment spans)
    this.#brieftext.addEventListener('paste', (e) => {
      const clipboardEvent = /** @type {ClipboardEvent} */ (e);
      clipboardEvent.preventDefault();
      const clipboardData = clipboardEvent.clipboardData;
      if (!clipboardData) return;
      const html = clipboardData.getData('text/html');
      const text = clipboardData.getData('text/plain');

      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      if (html) {
        let cleanFragment = document.createDocumentFragment();
        let useFallback = true;
        
        // Try native W3C Sanitizer API first (Chrome 119+)
        const dummyDiv = document.createElement('div');
        const divWithSetHTML = /** @type {any} */ (dummyDiv);
        if (divWithSetHTML.setHTML) {
          try {
            divWithSetHTML.setHTML(html, { elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'], attributes: {'span': ['class']} });
            while (dummyDiv.firstChild) {
              cleanFragment.appendChild(dummyDiv.firstChild);
            }
            useFallback = false;
          } catch(err) {
            console.warn('[Paste] Native setHTML Sanitizer failed, using fallback.');
          }
        }
        
        if (useFallback) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          /**
           * @param {Node} node
           * @returns {Node}
           */
          const sanitizeNode = (node) => {
            const allowedTags = ['B', 'STRONG', 'U', 'S', 'BLOCKQUOTE'];
            
            if (node.nodeType === Node.TEXT_NODE) {
              return document.createTextNode(node.textContent || '');
            }
            
            if (node.nodeType !== Node.ELEMENT_NODE) return document.createTextNode('');
            
            const element = /** @type {Element} */ (node);
            let newNode;
            if (allowedTags.includes(element.nodeName)) {
               newNode = document.createElement(element.nodeName.toLowerCase());
            } else if (element.nodeName === 'SPAN' && element.classList.contains('din-comment')) {
               newNode = document.createElement('span');
               newNode.className = 'din-comment';
            } else {
               const frag = document.createDocumentFragment();
               element.childNodes.forEach(child => {
                 frag.appendChild(sanitizeNode(child));
               });
               return frag;
            }
            
            element.childNodes.forEach(child => {
              newNode.appendChild(sanitizeNode(child));
            });
            
            return newNode;
          };

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
      this.#triggerSave();
    });
  }

  #initDropHandler() {
    this.#brieftext.addEventListener('drop', (e) => {
      const dragEvent = /** @type {DragEvent} */ (e);
      dragEvent.preventDefault();
      const dataTransfer = dragEvent.dataTransfer;
      if (!dataTransfer) return;
      const text = dataTransfer.getData('text/plain');

      // @ts-ignore
      const range = document.caretRangeFromPoint(dragEvent.clientX, dragEvent.clientY);
      if (range) {
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      }
      this.#triggerSave();
    });
  }

  #triggerSave() {
    if (this.#onSaveDraft) {
      this.#onSaveDraft();
    }
  }

  #hideToolbar() {
    if (this.#toolbar.matches(':popover-open')) {
      this.#toolbar.hidePopover();
    }
  }

  // --- Öffentliche Methoden ---

  /**
   * @param {string} tagName
   */
  toggleFormat(tagName) {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.anchorNode || !this.#brieftext.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    
    const isCustomComment = tagName === 'comment';
    const actualTag = isCustomComment ? 'SPAN' : tagName;
    
    if (this.#isSelectionInsideTag(tagName)) {
      // UNWRAP
      /** @type {Node | null} */
      let node = selection.anchorNode;
      let formatNode = null;
      while (node && node !== this.#brieftext) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = /** @type {HTMLElement} */ (node);
          const name = element.nodeName.toUpperCase();
          if (name === actualTag.toUpperCase() || (actualTag.toUpperCase() === 'B' && name === 'STRONG')) {
            if (isCustomComment && !element.classList.contains('din-comment')) {
               // Keep searching
            } else {
              formatNode = element;
              break;
            }
          }
        }
        node = /** @type {Node | null} */ (node.parentNode);
      }
      
      if (formatNode) {
        const parent = /** @type {Node} */ (formatNode.parentNode);
        if (parent) {
          const fragment = document.createDocumentFragment();
          while (formatNode.firstChild) {
            fragment.appendChild(formatNode.firstChild);
          }
          parent.replaceChild(fragment, formatNode);
        }
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
    
    this.#brieftext.normalize();
    this.#triggerSave();
    this.#handleSelectionChange();
  }
}
