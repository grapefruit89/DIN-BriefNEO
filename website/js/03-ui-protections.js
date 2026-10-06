// @ts-check

/* =========================================================================================
 * 🛡️ ARCHITECTURE GUARD: MODERN WEB PLATFORM PLAINTEXT ENGINE (W3C Standard)
 *
 * ⚠️ ACHTUNG FÜR ZUKÜNFTIGE KIs / LLMs / DEVELOPER:
 * Alle einzeiligen DIN-Felder nutzen `contenteditable="plaintext-only"` und `enterkeyhint="done"`.
 * Der Browser unterbindet Rich-Text und Formatierungs-Tags (bold/italic) NATIV
 * im C++ Core der Rendering-Engine.
 *
 * ⚠️ ZEILENUMBRÜCHE SIND NICHT NATIV GEBLOCKT (Empirie 2026-09-10, Chrome 151):
 * Chromium wandelt Umbrüche in plaintext-only-Feldern in LF-Zeichen (\n) um statt
 * `<br>`/`<div>` (Chromium quirk, w3c/editing#419 + whatwg/html#11350) — und
 * `enterkeyhint="done"` ist nur ein Tastatur-LABEL, kein Verhalten. Die Umbruchs-
 * Sperre lebt bewusst in enforceLineLimits (JS keydown + Paste-Flattening), NICHT
 * im Plattform-Verhalten. "enterkeyhint/prevented nativ" ist KEIN Grund, den
 * keydown-Guard zu entfernen — bereits vergeblicher Angriffsversuch, siehe DECISION-LOG.
 *
 * ES IST STRENGSTENS UNTERSAGT (Immutable Law A55 Format-Interzeptoren,
 *                               A49 DOM-Messschleifen, & ADR-JS):
 * 1. Vorab-Interzeptoren für `beforeinput` (formatBold, formatItalic, etc.) neu einzuführen.
 * 2. Manuelle HTML-Sanitization per Regex in Input-Listenern wiederherzustellen.
 * 3. DOM-Messschleifen oder Polling für Zeilenbegrenzungen einzubauen.
 * ========================================================================================= */

export class UIProtections {
  constructor() {
    /** @type {HTMLElement | null} */
    this.text = document.getElementById('text');
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.enforceLineLimits();
    this.protectAnlagenList();
    this.initialized = true;
  }

  enforceLineLimits() {
    const root = document.querySelector('din-a4') || document;

    // Enter-Taste abfangen: Single-Line blockiert Umbruch, maxTwoLines begrenzt auf 2 Zeilen
    root.addEventListener('keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      const target = keyboardEvent.target instanceof Element ? keyboardEvent.target.closest('[contenteditable]') : null;
      if (!target || !(target instanceof HTMLElement)) return;

      // Rich-Text-Light: Blockquote-Shortcut (Ctrl+Q / Cmd+Q) für Text
      if (target.id === 'text' && (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'q') {
        keyboardEvent.preventDefault();
        this.#toggleBlockquote(target);
        return;
      }

      if (keyboardEvent.key === 'Enter') {
        if (target.dataset.feldtyp?.includes('mehrzeilig')) {
          return;
        } else if (target.dataset.feldtyp?.includes('zweizeilig')) {
          const text = target.innerText || target.textContent || '';
          if (text.split('\n').length >= 2) {
            keyboardEvent.preventDefault();
          }
        } else {
          keyboardEvent.preventDefault();
        }
      }
    });

    // Paste-Handling: Mehrzeiligen Text für Einzeiler einebnen, 2-Zeiler begrenzen
    root.addEventListener('paste', (e) => {
      const clipboardEvent = /** @type {ClipboardEvent} */ (e);
      const target = clipboardEvent.target instanceof Element ? clipboardEvent.target.closest('[contenteditable]') : null;
      if (!target || !(target instanceof HTMLElement)) return;

      const clipboardData = clipboardEvent.clipboardData || /** @type {any} */ (clipboardEvent).originalEvent?.clipboardData;
      let pastedText = clipboardData ? clipboardData.getData('text/plain') : '';
      if (!pastedText) return;

      // Rich-Text-Light: Plaintext-Paste im Text erhält Zeilenumbrüche, streift aber fremdes HTML/CSS ab
      if (target.id === 'text') {
        clipboardEvent.preventDefault();
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const lines = pastedText.split(/\r?\n/);
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) {
            fragment.appendChild(document.createElement('br'));
          }
          if (lines[i]) {
            fragment.appendChild(document.createTextNode(lines[i]));
          }
        }
        const lastChild = fragment.lastChild;
        range.insertNode(fragment);
        if (lastChild) {
          range.setStartAfter(lastChild);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        target.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      if (target.dataset.feldtyp?.includes('mehrzeilig')) return;

      clipboardEvent.preventDefault();
      const isTwoLine = target.dataset.feldtyp?.includes('zweizeilig');

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
      target.dispatchEvent(new Event('input', { bubbles: true }));
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
    /* M2 wrap-don't-wipe: children.length===0 übersieht Text-Nodes (kein
     * Element). Vorherige Version wippte hier gespeicherten Anlagen-Text
     * via replaceChildren(li). Jetzt: echten Inhalt in <li> wickeln, statt
     * zu löschen; nur wirklich leeres Feld bekommt den Platzhalter-li. */
    if (anlagen.innerHTML.trim() === '' || anlagen.innerHTML.trim() === '<br>') {
      const li = document.createElement('li');
      anlagen.replaceChildren(li);
      this.#placeCaretIn(anlagen, li);
      return;
    }
    if (anlagen.children.length === 0) {
      const lines = (anlagen.textContent || '').split('\n').map(l => l.trim()).filter(Boolean);
      const lis = lines.map(line => {
        const li = document.createElement('li');
        li.textContent = line;
        return li;
      });
      if (lis.length) {
        anlagen.replaceChildren(...lis);
        this.#placeCaretIn(anlagen, lis[lis.length - 1]);
      }
    }
  }

  /**
   * Platziert den Caret am Ende des letzten Kind-Elements.
   * @param {HTMLElement} anlagen
   * @param {Element} li
   */
  #placeCaretIn(anlagen, li) {
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

  /**
   * Rich-Text-Light: Schaltet Zitat (<blockquote>) im Text per W3C Range API um.
   * @param {HTMLElement} textEl
   */
  #toggleBlockquote(textEl) {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !textEl.contains(selection.anchorNode)) return;

    const elem = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode.parentElement;
    const bq = elem ? elem.closest('blockquote') : null;

    if (bq && textEl.contains(bq)) {
      const parent = bq.parentNode;
      if (parent) {
        const fragment = document.createDocumentFragment();
        while (bq.firstChild) {
          fragment.appendChild(bq.firstChild);
        }
        parent.replaceChild(fragment, bq);
      }
    } else {
      if (selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const newBq = document.createElement('blockquote');

      if (!selection.isCollapsed) {
        try {
          newBq.appendChild(range.extractContents());
          range.insertNode(newBq);
          selection.selectAllChildren(newBq);
        } catch (err) {
          console.warn('[RichTextLight] Blockquote wrap failed:', err);
        }
      } else {
        const br = document.createElement('br');
        newBq.appendChild(br);
        range.insertNode(newBq);
        const newRange = document.createRange();
        newRange.setStart(newBq, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    textEl.normalize();
    textEl.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
