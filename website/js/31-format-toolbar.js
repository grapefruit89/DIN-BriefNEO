// @ts-check

import { sanitizeRichText } from './04-sanitize.js';

/** @type {Record<string, string>} */
const FORMAT_SELECTORS = {
  B: 'b, strong',
  U: 'u',
  BLOCKQUOTE: 'blockquote',
  comment: 'span.brief-kommentar',
};

export class FormatToolbar {
  /** @type {HTMLElement} */
  #text;
  /** @type {HTMLElement} */
  #toolbar;
  /** @type {(() => void) | null} */
  #onSaveDraft;

  /** @type {HTMLElement | null} */
  #selectionAnchor;
  /** @type {number | null} */
  #selectionTimeout = null;

  /**
   * @param {HTMLElement} textEl
   * @param {HTMLElement} toolbarEl
   * @param {(() => void) | null} onSaveDraft
   */
  constructor(textEl, toolbarEl, onSaveDraft = null) {
    this.#text = textEl;
    this.#toolbar = toolbarEl;
    this.#onSaveDraft = onSaveDraft;

    this.#selectionAnchor = /** @type {HTMLElement | null} */ (document.getElementById('selection-anchor'));
  }

  init() {
    if (!this.#text || !this.#toolbar) return;

    this.#text.addEventListener('keydown', (event) => {
      const keyEvent = /** @type {KeyboardEvent} */ (event);
      if (!(keyEvent.ctrlKey || keyEvent.metaKey) || keyEvent.shiftKey || keyEvent.altKey) return;
      const key = keyEvent.key.toLowerCase();
      if (key === 'b') {
        keyEvent.preventDefault();
        this.#toggleWrap('B');
      } else if (key === 'u') {
        keyEvent.preventDefault();
        this.#toggleWrap('U');
      }
    });

    this.#toolbar.addEventListener('command', (event) => {
      const commandEvent = /** @type {any} */ (event);
      switch (commandEvent.command) {
        case '--bold':
          this.#toggleWrap('B');
          break;
        case '--underline':
          this.#toggleWrap('U');
          break;
        case '--quote':
          this.#toggleWrap('BLOCKQUOTE');
          break;
        case '--comment':
          this.#toggleWrap('comment');
          break;
        default:
          break;
      }
    });

    this.#initSelectionListener();
    this.#initPasteSanitizer();
    this.#initDropHandler();
  }

  /**
   * @param {Node | null} node
   * @param {string} tagName
   * @returns {HTMLElement | null}
   */
  #findFormatAncestor(node, tagName) {
    const elem = node instanceof Element ? node : node?.parentElement;
    if (!elem) return null;
    const selector = FORMAT_SELECTORS[tagName] || tagName.toLowerCase();
    const match = elem.closest(selector);
    return match && this.#text.contains(match) ? /** @type {HTMLElement} */ (match) : null;
  }

  /**
   * @param {string} tagName
   * @returns {boolean}
   */
  #isSelectionInsideTag(tagName) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    return this.#findFormatAncestor(selection.anchorNode, tagName) !== null;
  }

  #handleSelectionChange() {
    const selection = window.getSelection();
    if (!selection) return;

    if (
      selection.isCollapsed ||
      selection.toString().trim().length === 0
    ) {
      this.#hideToolbar();
      return;
    }

    if (
      !selection.anchorNode ||
      !this.#text.contains(selection.anchorNode)
    ) {
      this.#hideToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (this.#selectionAnchor) {
      this.#selectionAnchor.style.setProperty('--sel-y', `${rect.top}px`);
      this.#selectionAnchor.style.setProperty('--sel-x', `${rect.left}px`);
    }

    if (!this.#toolbar.matches(':popover-open')) {
      try {
        this.#toolbar.showPopover();
      } catch (error) {
        console.warn('[Toolbar] showPopover failed:', error);
      }
    }

    this.#setCommandState('--bold', this.#isSelectionInsideTag('B'));
    this.#setCommandState('--underline', this.#isSelectionInsideTag('U'));
    this.#setCommandState('--quote', this.#isSelectionInsideTag('BLOCKQUOTE'));
    this.#setCommandState('--comment', this.#isSelectionInsideTag('comment'));
  }

  #initSelectionListener() {
    document.addEventListener('selectionchange', () => {
      if (this.#selectionTimeout !== null) {
        clearTimeout(this.#selectionTimeout);
      }
      this.#selectionTimeout = window.setTimeout(() => {
        this.#selectionTimeout = null;
        this.#handleSelectionChange();
      }, 50);
    });
  }

  /**
   * @param {string} command
   * @param {boolean} pressed
   */
  #setCommandState(command, pressed) {
    const button = /** @type {HTMLButtonElement} */ (this.#toolbar.querySelector(`button[command="${command}"]`));
    if (!button) return;
    button.setAttribute('aria-pressed', String(pressed));
  }

  #initPasteSanitizer() {
    this.#text.addEventListener('paste', (e) => {
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

  #initDropHandler() {
    this.#text.addEventListener('drop', (e) => {
      const dragEvent = /** @type {DragEvent} */ (e);
      dragEvent.preventDefault();

      const dataTransfer = dragEvent.dataTransfer;
      if (!dataTransfer) return;

      const text = dataTransfer.getData('text/plain');
      const caretPos = document.caretPositionFromPoint(dragEvent.clientX, dragEvent.clientY);

      if (caretPos) {
        const range = document.createRange();
        range.setStart(caretPos.offsetNode, caretPos.offset);
        range.collapse(true);
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
  #toggleWrap(tagName) {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !selection.anchorNode ||
      !this.#text.contains(selection.anchorNode)
    ) {
      return;
    }

    const range = selection.getRangeAt(0);
    const isCustomComment = tagName === 'comment';
    const actualTag = isCustomComment ? 'SPAN' : tagName;

    const formatNode = this.#findFormatAncestor(selection.anchorNode, tagName);
    if (formatNode) {
      const parent = formatNode.parentNode;
      if (parent) {
        const fragment = document.createDocumentFragment();
        while (formatNode.firstChild) {
          fragment.appendChild(formatNode.firstChild);
        }
        parent.replaceChild(fragment, formatNode);
      }
    } else {
      const wrapper = document.createElement(actualTag.toLowerCase());
      if (isCustomComment) {
        wrapper.className = 'brief-kommentar';
      }

      try {
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);
        selection.selectAllChildren(wrapper);
      } catch (error) {
        console.warn('[Format] Failed to wrap range:', error);
      }
    }

    this.#text.normalize();
    this.#triggerSave();
    this.#handleSelectionChange();
  }
}
