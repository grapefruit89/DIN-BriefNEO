// @ts-check

export class FormatToolbar {
  /** @type {HTMLElement} */
  #brieftext;
  /** @type {HTMLElement} */
  #toolbar;
  /** @type {HTMLElement | null} */
  #commandTarget;
  /** @type {(() => void) | null} */
  #onSaveDraft;

  /** @type {HTMLElement | null} */
  #selectionAnchor;
  /** @type {number | null} */
  #selectionTimeout = null;

  /**
   * @param {HTMLElement} brieftextEl
   * @param {HTMLElement} toolbarEl
   * @param {(() => void) | null} onSaveDraft
   */
  constructor(brieftextEl, toolbarEl, onSaveDraft = null) {
    this.#brieftext = brieftextEl;
    this.#toolbar = toolbarEl;
    this.#onSaveDraft = onSaveDraft;
    
    this.#commandTarget = /** @type {HTMLElement | null} */ (document.getElementById('format-command-target'));
    this.#selectionAnchor = /** @type {HTMLElement | null} */ (document.getElementById('selection-anchor'));
  }

  init() {
    if (!this.#brieftext || !this.#toolbar) return;
    
    this.#initSelectionListener();
    this.#initCommandListener();
    this.#initPasteSanitizer();
    this.#initDropHandler();
  }

  // ============================================================
  // SELECTION STATE
  // ============================================================

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
        if (
          name === actualTag.toUpperCase() ||
          (actualTag.toUpperCase() === 'B' && name === 'STRONG')
        ) {
          if (isCustomComment && !element.classList.contains('din-comment')) {
            // Keep searching upwards.
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
        if (element.nodeName === 'BLOCKQUOTE') {
          return element;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  #handleSelectionChange() {
    const selection = window.getSelection();
    if (!selection) return;

    /*
     * No active text selection.
     */
    if (
      selection.isCollapsed ||
      selection.toString().trim().length === 0
    ) {
      this.#hideToolbar();
      return;
    }

    /*
     * Selection must belong to the actual brief editor.
     */
    if (
      !selection.anchorNode ||
      !this.#brieftext.contains(selection.anchorNode)
    ) {
      this.#hideToolbar();
      return;
    }

    /*
     * This is the one remaining geometry calculation.
     * 
     * JS does NOT calculate toolbar dimensions or viewport
     * collisions anymore.
     * 
     * It only moves the invisible CSS anchor.
     */
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (this.#selectionAnchor) {
      this.#selectionAnchor.style.top = ${rect.top}px;
      this.#selectionAnchor.style.left = ${rect.left}px;
    }

    /*
     * popover="hint" does not automatically mean:
     * "open when contenteditable selection changes".
     * 
     * Therefore this minimal imperative trigger remains.
     */
    if (!this.#toolbar.matches(':popover-open')) {
      try {
        this.#toolbar.showPopover();
      } catch (error) {
        console.warn('[Toolbar] showPopover failed:', error);
      }
    }

    /*
     * Update formatting state.
     * 
     * No button references are cached anymore.
     * The command attribute is the stable semantic identifier.
     */
    this.#setCommandState('--bold', this.#isSelectionInsideTag('B'));
    this.#setCommandState('--underline', this.#isSelectionInsideTag('U'));
    this.#setCommandState('--quote', this.#isSelectionInsideTag('BLOCKQUOTE'));
    this.#setCommandState('--comment', this.#isSelectionInsideTag('comment'));
  }

  #initSelectionListener() {
    document.addEventListener('selectionchange', () => {
      /*
       * This timeout is only a selection-change debounce.
       * It is NOT an animation or viewport calculation.
       */
      if (this.#selectionTimeout !== null) {
        clearTimeout(this.#selectionTimeout);
      }
      this.#selectionTimeout = window.setTimeout(() => {
        this.#selectionTimeout = null;
        this.#handleSelectionChange();
      }, 50);
    });
  }

  // ============================================================
  // COMMAND BUS
  // ============================================================

  #initCommandListener() {
    if (!this.#commandTarget) return;

    this.#commandTarget.addEventListener('command', (event) => {
      const commandEvent = /** @type {any} */ (event);
      switch (commandEvent.command) {
        case '--bold':
          this.toggleFormat('B');
          break;
        case '--underline':
          this.toggleFormat('U');
          break;
        case '--quote':
          this.#toggleQuote();
          break;
        case '--comment':
          this.toggleFormat('comment');
          break;
        default:
          break;
      }
    });
  }

  /**
   * @param {string} command
   * @param {boolean} pressed
   */
  #setCommandState(command, pressed) {
    const button = this.#toolbar.querySelector(utton[command=" + command + "]);
    if (!button) return;
    button.setAttribute('aria-pressed', String(pressed));
  }

  #toggleQuote() {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !selection.anchorNode ||
      !this.#brieftext.contains(selection.anchorNode)
    ) {
      return;
    }

    const range = selection.getRangeAt(0);
    const blockquote = this.#getBlockquoteAncestor(selection.anchorNode);

    if (blockquote) {
      /*
       * UNWRAP
       */
      const parent = blockquote.parentNode;
      if (parent) {
        while (blockquote.firstChild) {
          parent.insertBefore(blockquote.firstChild, blockquote);
        }
        parent.removeChild(blockquote);
      }
    } else {
      /*
       * WRAP
       */
      const quote = document.createElement('blockquote');
      quote.appendChild(range.extractContents());
      range.insertNode(quote);
    }

    this.#brieftext.normalize();
    this.#triggerSave();
    this.#handleSelectionChange();
  }

  // ============================================================
  // PASTE SANITIZER
  // ============================================================
  
  #initPasteSanitizer() {
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
        
        const dummyDiv = document.createElement('div');
        const divWithSetHTML = /** @type {any} */ (dummyDiv);

        if (divWithSetHTML.setHTML) {
          try {
            divWithSetHTML.setHTML(html, {
              elements: ['b', 'strong', 'u', 's', 'blockquote', 'span'],
              attributes: { 'span': ['class'] }
            });
            while (dummyDiv.firstChild) {
              cleanFragment.appendChild(dummyDiv.firstChild);
            }
            useFallback = false;
          } catch (error) {
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
            if (node.nodeType !== Node.ELEMENT_NODE) {
              return document.createTextNode('');
            }
            const element = /** @type {Element} */ (node);
            let newNode;
            if (allowedTags.includes(element.nodeName)) {
              newNode = document.createElement(element.nodeName.toLowerCase());
            } else if (element.nodeName === 'SPAN' && element.classList.contains('din-comment')) {
              newNode = document.createElement('span');
              newNode.className = 'din-comment';
            } else {
              const frag = document.createDocumentFragment();
              element.childNodes.forEach((child) => {
                frag.appendChild(sanitizeNode(child));
              });
              return frag;
            }
            element.childNodes.forEach((child) => {
              newNode.appendChild(sanitizeNode(child));
            });
            return newNode;
          };

          doc.body.childNodes.forEach((child) => {
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

  // ============================================================
  // DROP HANDLER
  // ============================================================

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

  // ============================================================
  // FORMAT ENGINE
  // ============================================================

  #triggerSave() {
    if (this.#onSaveDraft) {
      this.#onSaveDraft();
    }
  }

  #hideToolbar() {
    if (this.#toolbar.matches(':popover-open')) {
      try {
        this.#toolbar.hidePopover();
      } catch (error) {
        console.warn('[Toolbar] hidePopover failed:', error);
      }
    }
  }

  /**
   * @param {string} tagName
   */
  toggleFormat(tagName) {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !selection.anchorNode ||
      !this.#brieftext.contains(selection.anchorNode)
    ) {
      return;
    }

    const range = selection.getRangeAt(0);
    const isCustomComment = tagName === 'comment';
    const actualTag = isCustomComment ? 'SPAN' : tagName;

    /*
     * UNWRAP
     */
    if (this.#isSelectionInsideTag(tagName)) {
      /** @type {Node | null} */
      let node = selection.anchorNode;
      /** @type {HTMLElement | null} */
      let formatNode = null;

      while (node && node !== this.#brieftext) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = /** @type {HTMLElement} */ (node);
          const name = element.nodeName.toUpperCase();
          
          if (
            name === actualTag.toUpperCase() ||
            (actualTag.toUpperCase() === 'B' && name === 'STRONG')
          ) {
            if (isCustomComment && !element.classList.contains('din-comment')) {
              // Keep searching.
            } else {
              formatNode = element;
              break;
            }
          }
        }
        node = node.parentNode;
      }

      if (formatNode) {
        const parent = formatNode.parentNode;
        if (parent) {
          const fragment = document.createDocumentFragment();
          while (formatNode.firstChild) {
            fragment.appendChild(formatNode.firstChild);
          }
          parent.replaceChild(fragment, formatNode);
        }
      }
    } else {
      /*
       * WRAP
       */
      const wrapper = document.createElement(actualTag.toLowerCase());
      if (isCustomComment) {
        wrapper.className = 'din-comment';
      }

      try {
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);
        selection.selectAllChildren(wrapper);
      } catch (error) {
        console.warn('[Format] Failed to wrap range:', error);
      }
    }

    this.#brieftext.normalize();
    this.#triggerSave();
    this.#handleSelectionChange();
  }
}
