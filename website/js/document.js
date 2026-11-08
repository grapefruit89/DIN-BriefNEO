// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {DraftManager}
// @adr [[ADR-JS]]
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]

/**
 * @file document.js — Konsolidierter Dokumenten- und Editor-Core für DIN-BriefNEO.
 * Bündelt:
 *  1. Native Selection- und Caret-Helfer (W3C Range / TreeWalker)
 *  2. UIProtections (Zeilenlimits, Paste-Flattening, Blockquote-Shortcut, Anlagen-Liste)
 *  3. DraftManager liegt seit 2026-11-08 in `draft-manager.js`.
 */

/* =========================================================================================
 * 0. RICH TEXT SANITIZER (Allowlist Guard)
 * ========================================================================================= */

/**
 * Einzige Sicherheitsgrenze für Rich-Text: DOMParser + exakte Element-Allowlist.
 * Wird von DraftManager (Draft-Restore) und collectDraft genutzt.
 *
 * Bezug: Law Catalog H11 (PREFERRED) & Einleitung (FALLBACK-Klausel):
 * H11 setzt setHTML() als PREFERRED. sanitizeRichText bildet domänenspezifische
 * Anforderungen ab (vollständiges Strippen aller Inline-Attribute, Erhalt der
 * Spezialklasse <span class="brief-kommentar"> bei generischer SPAN-Entfernung,
 * Erzeugung eines DocumentFragment für replaceChildren/collectDraft), die natives
 * setHTML() nicht leistet.
 *
 * Extra-Tags (z. B. UL/LI für Listenfelder wie anlagen-angabe) ergänzen die
 * Basis-Allowlist (ohne Attribute).
 * @param {string} htmlString
 * @param {{ extraTags?: string[] }} [options]
 * @returns {DocumentFragment}
 */
export function sanitizeRichText(htmlString, options = {}) {
  const allowedTags = ['B', 'STRONG', 'S', 'BLOCKQUOTE', 'BR', 'DIV', 'P', ...(options.extraTags || [])];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString || '', 'text/html');

  /**
   * @param {Node} node
   * @returns {Node}
   */
  const sanitizeNode = (node) => {
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
    } else if (element.nodeName === 'SPAN' && element.classList.contains('brief-kommentar')) {
      newNode = document.createElement('span');
      newNode.className = 'brief-kommentar';
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

  const frag = document.createDocumentFragment();
  doc.body.childNodes.forEach((child) => {
    frag.appendChild(sanitizeNode(child));
  });
  return frag;
}

/* =========================================================================================
 * 1. SELECTION & CARET UTILITIES (W3C Standard)
 * ========================================================================================= */

/**
 * Ermittelt den relativen Zeichen-Offset des Carets innerhalb eines Elements.
 * @param {Element} element
 * @returns {number}
 */
export function getCaretCharacterOffset(element) {
  const selection = element.ownerDocument?.defaultView?.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;
  const range = selection.getRangeAt(0);
  const before = range.cloneRange();
  before.selectNodeContents(element);
  before.setEnd(range.endContainer, range.endOffset);
  return before.toString().length;
}

/**
 * Setzt das Caret präzise an einen Zeichen-Offset innerhalb eines Elements (via TreeWalker).
 * @param {HTMLElement} element
 * @param {number} offset
 */
export function setCaretCharacterOffset(element, offset) {
  if (offset <= 0) {
    element.focus();
    return;
  }
  const documentRef = element.ownerDocument;
  const selection = documentRef.defaultView?.getSelection();
  if (!selection) return;
  const range = documentRef.createRange();
  const walker = documentRef.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    const length = node.textContent?.length || 0;
    if (remaining <= length) {
      range.setStart(node, remaining);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    remaining -= length;
  }
  setCaretToEnd(element);
}

/**
 * Platziert das Caret am Ende des Elements.
 * @param {HTMLElement} element
 */
export function setCaretToEnd(element) {
  const selection = element.ownerDocument.defaultView?.getSelection();
  if (!selection) return;
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Formatiert deutsche Rufnummern nach DIN 5008 11.3.2: Vorwahl, ein Leerzeichen,
 * Rufnummer, Durchwahl mit Bindestrich. Ohne Vorwahl-Datenbank — die Vorwahl endet am
 * ersten Trenner; ohne Trenner wird sie über die Ziffernzahl geschätzt.
 * Nummern mit fremder Ländervorwahl bleiben bis auf normale Leerzeichen unverändert.
 * @param {string | null | undefined} input
 * @returns {string}
 */
export function formatTelefonnummer(input) {
  const original = String(input ?? '').trim();
  if (!original) return '';

  // 1. Vorbereinigung: "(0)" auflösen, erlaubte Zeichen behalten, Leerraum normalisieren.
  const cleaned = original
    .replace(/\(\s*0\s*\)/g, ' ')
    .replace(/[^0-9+\-/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return original;

  // 2. Internationale Nummern: 00XX -> +XX. Nur +49 wird national weitergereicht.
  if (cleaned.startsWith('+') || cleaned.startsWith('00')) {
    const intl = cleaned.replace(/^00(\d{2})/, '+$1');
    if (!intl.startsWith('+49')) return intl;
    const afterCc = intl.slice(3).replace(/[^0-9-]/g, '');
    if (!afterCc) return intl;
    const national = afterCc.startsWith('0') ? afterCc : `0${afterCc}`;
    const formatted = formatNationalNumber(national);
    return formatted ? `+49 ${formatted.slice(1)}` : intl;
  }

  // 3. Nationale Nummern nur mit führender 0 — sonst unangetastet lassen.
  if (!cleaned.startsWith('0')) return original;
  return formatNationalNumber(cleaned) ?? original;
}

/**
 * Formatiert eine nationale Rufnummer (führende 0) in Vorwahl + Rufnummer + Durchwahl.
 * @param {string} national
 * @returns {string | null} null, wenn keine verwertbare Nummer vorliegt
 */
function formatNationalNumber(national) {
  let s = national.replace(/\s+/g, ' ').trim();
  if (!/^0\d/.test(s.replace(/\D/g, ''))) return null;

  // Durchwahl: abschließender Bindestrich + höchstens 4 Ziffern ("0228 123456-78").
  // Ein längerer Rest nach dem Bindestrich ist ein Trenner ("0172-1234567"), keine Durchwahl.
  let durchwahl = '';
  const dwMatch = s.match(/^(.*\d)-(\d{1,4})$/);
  if (dwMatch) {
    s = dwMatch[1].trim();
    durchwahl = `-${dwMatch[2]}`;
  } else {
    // Durchwahl als letzte, per Leerzeichen abgetrennte 2er-Gruppe ("0228 123456 78").
    // Mobilnummern werden laut Vorgabe zu einer Gruppe zusammengefasst, daher dort nicht.
    // Die Gruppe davor muss eine plausible Rufnummer sein (>= 4 Ziffern), sonst würde
    // eine Gruppierung wie "0170 123 45 67" falsch als Durchwahl gelesen.
    const groups = s.split(' ');
    const isMobile = /^01[5-7]\d/.test(s.replace(/[\s/-]+/g, ''));
    if (!isMobile && groups.length >= 3) {
      const last = groups[groups.length - 1];
      const before = groups[groups.length - 2];
      if (/^\d{2}$/.test(last) && /^\d{4,}$/.test(before)) {
        s = groups.slice(0, -1).join(' ');
        durchwahl = `-${last}`;
      }
    }
  }

  // Vorwahl: endet am ersten Trenner (Leerzeichen, / oder -).
  const sepIndex = s.search(/[ /-]/);
  const head = sepIndex === -1 ? s : s.slice(0, sepIndex);
  const headDigits = head.replace(/\D/g, '');

  let vorwahl;
  let rest;
  if (headDigits.length >= 3 && headDigits.length <= 6) {
    vorwahl = headDigits;
    rest = s.slice(sepIndex === -1 ? s.length : sepIndex).replace(/\D/g, '');
  } else {
    // Kein brauchbarer Trenner: Ziffernzahl entscheidet (siehe prefixLength).
    const digits = s.replace(/\D/g, '');
    vorwahl = digits.slice(0, prefixLength(digits));
    rest = digits.slice(vorwahl.length);
  }

  if (!vorwahl) return null;
  return rest ? `${vorwahl} ${rest}${durchwahl}` : `${vorwahl}${durchwahl}`;
}

/**
 * Schätzt die Vorwahl-Länge ohne Datenbank (DIN 5008 erlaubt 2 bis 5 Ziffern nach der 0).
 * Deutsche Ortsnetznummern haben 10 oder 11 Ziffern inklusive Verkehrsausscheidungsziffer;
 * daraus folgt 4 Ziffern Vorwahl bei 10, sonst 5. Bekannte kurze Vorwahlen und Sonder-
 * rufnummern werden vorher erkannt.
 * @param {string} digits
 * @returns {number}
 */
function prefixLength(digits) {
  if (/^0(30|40|69|89)\d/.test(digits)) return 3;
  if (/^01[5-7]\d/.test(digits)) return 4;
  if (/^0(?:800|900|180|137|700)/.test(digits)) return 4;
  return digits.length <= 10 ? 4 : 5;
}

/* =========================================================================================
 * 2. UI PROTECTIONS (Zeilenlimits, Paste-Schutz, Anlagen-Struktur)
 * ========================================================================================= */

/** Fallback-Länge für Einzeiler ohne eigenen Eintrag in FIELD_MAX_LENGTHS. */
const SINGLE_LINE_MAX = 50;
/** Obergrenze für eingefügten Text in zweizeiligen Feldern. */
const TWO_LINE_PASTE_MAX = 130;

const FIELD_MAX_LENGTHS = Object.freeze(/** @type {Record<string, number>} */ ({
  'rucksendeangabe': 85,
  'empfaenger-firma': 50,
  'empfaenger-name': 45,
  'empfaenger-strasse': 45,
  'empfaenger-ort': 45,
  'absender-name': 40,
  'absender-strasse': 40,
  'absender-ort': 40,
  'absender-tel': 30,
  'absender-mail': 40,
  'vermerke': 80,
  'datum': 35,
  'betreff': 140,
  'teilbetreff': 140,
  'anrede': 70,
  'grussformel': 45,
  'unterschrift': 45
}));

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
    this.setupPrintProtection();
    this.setupMobilePhoneFormatting();
    this.setupOverflowDetector();
    this.initialized = true;
  }

  setupPrintProtection() {
    window.addEventListener('beforeprint', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }

  enforceLineLimits() {
    const root = document.querySelector('din-blatt') || document;

    root.addEventListener('keydown', (e) => this.#handleDocumentKeydown(e));
    root.addEventListener('beforeinput', (e) => this.#handleFormatShortcuts(e));
    root.addEventListener('paste', (e) => this.#handleDocumentPaste(e));
    root.addEventListener('input', (e) => this.#handleInputLimit(e));
  }

  /**
   * Alle `contenteditable`-Regeln an einer Stelle: Umbruchschutz, Rich-Text-
   * Shortcuts und DIN-5008-Verbote. Als benannte Methode testbar.
   * @param {Event} event
   */
  #handleDocumentKeydown(event) {
    const keyboardEvent = /** @type {KeyboardEvent} */ (event);
    const target = keyboardEvent.target instanceof Element ? keyboardEvent.target.closest('[contenteditable]') : null;
    if (!target || !(target instanceof HTMLElement)) return;

    // Rich-Text-Light: Blockquote-Shortcut (Ctrl+Q / Cmd+Q) für Text
    if (target.id === 'text' && (keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'q') {
      keyboardEvent.preventDefault();
      this.#toggleBlockquote(target);
      return;
    }

    // DIN 5008 13.1: Keine Unterstreichung — Ctrl+U / Cmd+U blockieren
    if ((keyboardEvent.ctrlKey || keyboardEvent.metaKey) && keyboardEvent.key.toLowerCase() === 'u') {
      keyboardEvent.preventDefault();
      return;
    }

    if (keyboardEvent.key !== 'Enter') return;
    if (target.dataset.feldtyp?.includes('mehrzeilig')) return;

    if (target.dataset.feldtyp?.includes('zweizeilig')) {
      if (this.#istZweizeiligVoll(target)) keyboardEvent.preventDefault();
      return;
    }

    // Nur den Umbruch blockieren. Das Weiterspringen übernimmt der Browser
    // über die Tab-Reihenfolge (DOM-Order), kein nachgebautes Formularverhalten.
    keyboardEvent.preventDefault();
  }

  /**
   * Zweizeilig-Guard: textContent kennt weder <br> noch <div> als Umbruch (B41).
   * Gezählt werden alle drei Formen, ohne Layout-Read (innerText würde A49 verletzen).
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  #istZweizeiligVoll(target) {
    const textUmbruch = (target.textContent || '').split('\n').length - 1;
    const harteUmbruch = target.querySelectorAll('br').length;
    const blockUmbruch = target.querySelectorAll(':scope > div, :scope > p').length;
    return textUmbruch + harteUmbruch + blockUmbruch >= 1;
  }

  /**
   * DIN 5008 13.1: Unterstreichung auch über Input-Events/Kontextmenü blockieren.
   * @param {Event} event
   */
  #handleFormatShortcuts(event) {
    const inputEvent = /** @type {InputEvent} */ (event);
    if (inputEvent.inputType === 'formatUnderline') inputEvent.preventDefault();
  }

  /**
   * Paste: Mehrzeiliges in Einzeiler einebnen, Zweizeiler begrenzen, im
   * Fließtext Plaintext mit erhaltenen Umbrüchen einsetzen.
   * @param {Event} event
   */
  #handleDocumentPaste(event) {
    const clipboardEvent = /** @type {ClipboardEvent} */ (event);
    const target = clipboardEvent.target instanceof Element ? clipboardEvent.target.closest('[contenteditable]') : null;
    if (!target || !(target instanceof HTMLElement)) return;

    const clipboardData = clipboardEvent.clipboardData || /** @type {any} */ (clipboardEvent).originalEvent?.clipboardData;
    let pastedText = clipboardData ? clipboardData.getData('text/plain') : '';
    if (!pastedText) return;

    // Rich-Text-Light: Plaintext-Paste im Text erhält Zeilenumbrüche, streift aber fremdes HTML/CSS ab
    if (target.id === 'text') {
      clipboardEvent.preventDefault();
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const lines = pastedText.split(/\r?\n/);
      const fragment = document.createDocumentFragment();
      for (const [i, line] of lines.entries()) {
        if (i > 0) fragment.appendChild(document.createElement('br'));
        if (line) fragment.appendChild(document.createTextNode(line));
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
    const maxLimit = FIELD_MAX_LENGTHS[target.id] || (target.classList.contains('single-line') ? SINGLE_LINE_MAX : 0);

    if (isTwoLine) {
      const maxChars = maxLimit || TWO_LINE_PASTE_MAX;
      pastedText = pastedText.split(/\r?\n/).slice(0, 2).join('\n');
      if (pastedText.length > maxChars) pastedText = pastedText.substring(0, maxChars);
    } else {
      pastedText = pastedText.replace(/[\r\n]+/g, ' ');
      if (maxLimit > 0) {
        const currentLen = (target.textContent || '').length;
        pastedText = pastedText.substring(0, Math.max(0, maxLimit - currentLen));
      }
    }

    if (!pastedText) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(pastedText));
    selection.collapseToEnd();
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Längenbegrenzung beim direkten Tippen auf Einzeilern.
   * @param {Event} event
   */
  #handleInputLimit(event) {
    const target = event.target instanceof Element ? event.target.closest('[contenteditable]') : null;
    if (!target || !(target instanceof HTMLElement)) return;
    if (target.id === 'text') return; // Haupttext bleibt flexibel
    if (target.id === 'datum') target.dataset.dirty = 'true';

    const maxLimit = FIELD_MAX_LENGTHS[target.id] || (target.classList.contains('single-line') ? SINGLE_LINE_MAX : 0);
    if (maxLimit <= 0) return;

    const text = target.textContent || '';
    if (text.length <= maxLimit) return;

    target.textContent = text.substring(0, maxLimit);
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  protectAnlagenList() {
    const anlagen = document.getElementById('anlagen-angabe');
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
    if (anlagen.innerHTML.trim() === '' || anlagen.innerHTML.trim() === '<br>') {
      const li = document.createElement('li');
      anlagen.replaceChildren(li);
      this.#placeCaretIn(anlagen, li);
      return;
    }

    /* Paste aus Fremdquellen liefert <div>-Kinder oder nackte Textknoten. Beides
       ist in einer Liste ungültig (B45). In-place umhängen, damit keine
       Formatierung verloren geht; der Caret wird danach ans Listenende gesetzt. */
    let normalisiert = false;
    for (const node of Array.from(anlagen.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Ein Textknoten kann mehrere Zeilen tragen ("Rechnung\nVollmacht");
        // jede Zeile wird ein eigener Listenpunkt.
        const zeilen = (node.textContent || '').split('\n').map((z) => z.trim()).filter(Boolean);
        if (zeilen.length === 0) {
          node.remove();
          continue;
        }
        const lis = zeilen.map((zeile) => {
          const li = document.createElement('li');
          li.textContent = zeile;
          return li;
        });
        node.replaceWith(...lis);
        normalisiert = true;
      } else if (node instanceof HTMLElement && node.tagName !== 'LI') {
        const li = document.createElement('li');
        li.append(...node.childNodes);
        node.replaceWith(li);
        normalisiert = true;
      }
    }
    if (normalisiert) {
      const letztes = anlagen.lastElementChild;
      if (letztes) this.#placeCaretIn(anlagen, letztes);
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
   * Platziert den Caret am Ende des Elements.
   * @param {HTMLElement} anlagen
   * @param {Element} li
   */
  #placeCaretIn(anlagen, li) {
    if (document.activeElement === anlagen) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(li);
        range.collapse(false);
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
    if (!selection?.anchorNode || !textEl.contains(selection.anchorNode)) return;

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

  /**
   * DIN 5008 11.3.2: Formatierung deutscher Rufnummern beim Verlassen des Telefonfeldes.
   * Bewusst nur bei blur, nicht während des Tippens.
   */
  setupMobilePhoneFormatting() {
    const tel = document.getElementById('absender-tel');
    if (!tel) return;
    tel.addEventListener('blur', () => {
      const current = (tel.textContent || '').trim();
      if (!current) return;
      const formatted = formatTelefonnummer(current);
      if (formatted && formatted !== current) {
        tel.textContent = formatted;
        tel.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  /**
   * D1: Overflow-Erkennung im Briefkern (#kern).
   * Dual-Check via CSSOM View APIs: scrollHeight + BoundingClientRect-Fallback.
   * Setzt data-ueberlauf und data-ueberlauf-zeilen am din-blatt.
   */
  setupOverflowDetector() {
    const blatt = document.querySelector('din-blatt');
    const kern = document.getElementById('kern');
    const text = document.getElementById('text');
    if (!blatt || !kern) return;

    /** @type {(cb: FrameRequestCallback) => number} */
    const raf = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
      ? window.requestAnimationFrame.bind(window)
      : (cb) => /** @type {number} */ (/** @type {unknown} */ (setTimeout(cb, 0)));

    const checkOverflow = () => {
      raf(() => {
        if (!blatt || !kern) return;

        // Gemessen (2026-11-08): mit `overflow: clip` meldet scrollHeight den
        // Inhalt korrekt (238 -> 814 px bei 30 Absätzen); der frühere
        // getBoundingClientRect-Fallback lag in jedem Fall gleichauf und
        // erzwang nur einen zusätzlichen Layout-Read. Der ResizeObserver
        // bleibt: das Blatt skaliert über cqw und #kern wächst mit
        // (238 -> 358 px bei Viewport 900x700).
        const hasOverflow = kern.scrollHeight > kern.clientHeight + 1;

        if (hasOverflow) {
          blatt.setAttribute('data-ueberlauf', 'true');
          const computedLineHeight = text ? Number.parseFloat(window.getComputedStyle(text).lineHeight) : 18;
          const lineHeight = Number.isFinite(computedLineHeight) && computedLineHeight > 0 ? computedLineHeight : 18;
          const overflowPixels = Math.max(0, kern.scrollHeight - kern.clientHeight);
          const estimatedLines = Math.max(1, Math.ceil(overflowPixels / lineHeight));
          blatt.setAttribute('data-ueberlauf-zeilen', String(estimatedLines));
        } else {
          blatt.removeAttribute('data-ueberlauf');
          blatt.removeAttribute('data-ueberlauf-zeilen');
        }
      });
    };

    // Debounced Trigger für Benutzereingaben im Text (200ms)
    /** @type {ReturnType<typeof setTimeout> | null} */
    let debounceTimer = null;
    const debouncedCheck = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkOverflow, 200);
    };

    if (text) {
      text.addEventListener('input', debouncedCheck);
    }

    // ResizeObserver auf #kern für Viewport- und Zoomwechsel
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        checkOverflow();
      });
      ro.observe(kern);
    }

    // Initialer Check beim Start
    checkOverflow();
  }
}

/* =========================================================================================
 * 3. DRAFT MANAGER (Single-Writer für localStorage, Undo/Redo, Autosave)
 * ========================================================================================= */

/* Komma ist CSS-Selektor-Listen-Vereinigung (ODER, nicht UND):
 * Matcht contenteditable-Blattfelder UND speicherbare Formular-Selects (z. B. Postvermerk). */
export const EDITABLE_FIELD_SELECTOR = '[contenteditable]:not([data-feldtyp="systemwert"]), select[data-speichern]';

/**
 * Sammelt den aktuellen Zustand aller editierbaren Felder direkt aus dem Live-DOM.
 * Rich-Text-Felder werden vor der Ausgabe mit sanitizeRichText abgesichert.
 * @returns {Record<string, string | boolean>}
 */
export function collectDraft() {
  /** @type {Record<string, string | boolean>} */
  const draft = {};

  if (typeof document === 'undefined') return draft;

  document.querySelectorAll('[contenteditable]').forEach(elem => {
    // #datum ist ein Systemwert, den der Nutzer bewusst aendern darf (Befund 1.2).
    // Der Anlagentext wird immer gespeichert, auch bei ausgeschaltetem Toggle (1.3) -
    // sonst ist er nach dem naechsten Reload endgueltig weg.
    if (!elem.id || (elem.getAttribute('data-feldtyp') === 'systemwert' && elem.id !== 'datum')) return;
    if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
      const isListe = Boolean(elem.getAttribute('data-feldtyp')?.includes('liste'));
      const extra = isListe ? { extraTags: ['UL', 'OL', 'LI'] } : undefined;
      const cleanFrag = sanitizeRichText(elem.innerHTML, extra);
      const container = document.createElement('div');
      container.appendChild(cleanFrag);
      draft[elem.id] = container.innerHTML;
    } else {
      draft[elem.id] = elem.textContent || '';
    }
  });

  document.querySelectorAll('select[data-speichern]').forEach(elem => {
    const sel = /** @type {HTMLSelectElement} */ (elem);
    if (sel.id) draft[sel.id] = sel.value;
  });

  const anlagenSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-anlagen'));
  if (anlagenSwitch) {
    draft['toggle-anlagen'] = anlagenSwitch.checked;
  }

  const fussSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fuss'));
  if (fussSwitch) {
    draft['toggle-fuss'] = fussSwitch.checked;
  }

  const teilbetreffSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-teilbetreff'));
  if (teilbetreffSwitch) {
    draft['toggle-teilbetreff'] = teilbetreffSwitch.checked;
  }

  return draft;
}
