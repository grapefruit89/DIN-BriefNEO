// @ts-check

import { sanitizeRichText } from './04-sanitize.js';

export class FormatToolbar {
  /** @type {HTMLElement} */
  #brieftext;
  /** @type {HTMLElement} */
  #toolbar;
  /** @type {(() => void) | null} */
  #onSaveDraft;

  /** @type {Map<string, HTMLButtonElement>} */
  #commandButtons = new Map();
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

    this.#selectionAnchor = /** @type {HTMLElement | null} */ (document.getElementById('selection-anchor'));
  }

  init() {
    if (!this.#brieftext || !this.#toolbar) return;

    /* M1-Tastaturpfad (Grok-Re-Review): Native Ctrl+B/Ctrl+U führt in
     * contenteditable NICHT zum erwarteten <b>/<u> (live verifiziert).
     * Scoped auf #brieftext — Sidebar-Inputs/Dialoge behalten natives
     * Verhalten; kein document-weiter Hijack (C3-Lektion). */
    this.#brieftext.addEventListener('keydown', (event) => {
      const keyEvent = /** @type {KeyboardEvent} */ (event);
      if (!(keyEvent.ctrlKey || keyEvent.metaKey) || keyEvent.shiftKey || keyEvent.altKey) return;
      const key = keyEvent.key.toLowerCase();
      if (key === 'b') {
        keyEvent.preventDefault();
        this.toggleFormat('B');
      } else if (key === 'u') {
        keyEvent.preventDefault();
        this.toggleFormat('U');
      }
    });

    /*
     * Invoker Commands (M135): The toolbar itself is the command target.
     * Buttons dispatch `command` events directly onto this popover —
     * no hidden relay element is needed.
     */
    this.#toolbar.addEventListener('command', (event) => {
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

    this.#initSelectionListener();
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
      this.#selectionAnchor.style.setProperty('--sel-y', `${rect.top}px`);
      this.#selectionAnchor.style.setProperty('--sel-x', `${rect.left}px`);
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

  /**
   * @param {string} command
   * @param {boolean} pressed
   */
  #setCommandState(command, pressed) {
    let button = this.#commandButtons.get(command);
    if (!button) {
      button = /** @type {HTMLButtonElement} */ (this.#toolbar.querySelector(`button[command="${command}"]`));
      if (!button) return;
      this.#commandButtons.set(command, button);
    }
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
        const cleanFragment = sanitizeRichText(html);

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
