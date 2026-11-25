// @ts-check
// @adr [[ADR-JS]]

/**
 * @file website/addons/fokusmodus/fokusmodus.js
 * =============================================================================
 * Fokus-Modus & Zen-Modus Addon (iA-Writer-Philosophie)
 *
 * Drei wählbare Stufen:
 * 1. "aus": Keine visuellen Eingriffe.
 * 2. "absatz": Nur der aktuell bearbeitete Absatz / Block leuchtet mit 100%,
 *    alle anderen Absätze treten sanft in den Hintergrund (28% Opacity).
 * 3. "zeile": Hebt zusätzlich den aktuellen Satz per nativer CSS Custom Highlight
 *    API hervor, ohne jemals den DOM oder Cursor-Positionen zu verändern.
 * Sowie optional Zen-Modus: Seitenleiste verblasst beim Tippen dezent.
 * =============================================================================
 */

let currentMode = 'aus';
let zenEnabled = false;
/** @type {ReturnType<typeof setTimeout> | null} */
let typingTimer = null;
/** @type {(() => void) | null} */
let cleanupFn = null;

const LINK_ID = 'addon-fokusmodus-css';

/**
 * Injeziert das Addon-Stylesheet isoliert in den Head, falls noch nicht vorhanden.
 */
function ensureStylesheet() {
  if (document.getElementById(LINK_ID)) return;
  const link = document.createElement('link');
  link.id = LINK_ID;
  link.rel = 'stylesheet';
  link.href = './addons/fokusmodus/fokusmodus.css';
  document.head.appendChild(link);
}

/**
 * Entfernt das Addon-Stylesheet rückstandslos.
 */
function removeStylesheet() {
  const link = document.getElementById(LINK_ID);
  if (link) link.remove();
}

/**
 * Aktualisiert die .fokus-aktiv Klasse auf dem aktiven Paragraphen in #text.
 */
function updateParagraphFocus() {
  if (currentMode === 'aus') return;

  const sel = window.getSelection();
  const textContainer = document.getElementById('text');
  if (!textContainer) return;

  const node = sel?.anchorNode;
  const isInside = node && textContainer.contains(node);

  const prev = textContainer.querySelectorAll('.fokus-aktiv');
  prev.forEach((el) => {
    el.classList.remove('fokus-aktiv');
  });

  if (isInside && node) {
    let target = node.nodeType === Node.ELEMENT_NODE ? /** @type {Element} */ (node) : node.parentElement;
    while (target && target.parentElement !== textContainer && target !== textContainer) {
      target = target.parentElement;
    }
    if (target && target !== textContainer) {
      target.classList.add('fokus-aktiv');
    }
  }
}

/**
 * Ermittelt die Satzgrenzen um den aktuellen Text-Cursor und setzt den CSS Highlight.
 * Vorbild: iA Writer Sentence Focus & Ghostwriter.
 * Nutzt die native W3C CSS Custom Highlight API (Chrome 105+ Baseline).
 */
function updateSentenceHighlight() {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;

  if (currentMode !== 'zeile') {
    // @ts-ignore
    CSS.highlights.delete('fokus-satz');
    return;
  }

  const sel = window.getSelection();
  if (!sel?.rangeCount || sel.isCollapsed === false) {
    // @ts-ignore
    CSS.highlights.delete('fokus-satz');
    return;
  }

  let node = sel.anchorNode;
  if (!node) {
    // @ts-ignore
    CSS.highlights.delete('fokus-satz');
    return;
  }

  const blatt = document.querySelector('din-blatt');
  if (!blatt?.contains(node)) {
    // @ts-ignore
    CSS.highlights.delete('fokus-satz');
    return;
  }

  let offset = sel.anchorOffset;

  // Wenn der Cursor auf einem Element-Knoten statt TextNode steht (z.B. Zeilenanfang/Ende),
  // finden wir den zugehörigen TextNode:
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = /** @type {Element} */ (node);
    const childNodes = el.childNodes;
    if (childNodes.length > 0) {
      const idx = Math.min(Math.max(0, offset > 0 ? offset - 1 : 0), childNodes.length - 1);
      const targetChild = childNodes[idx];
      if (targetChild.nodeType === Node.TEXT_NODE) {
        node = targetChild;
        offset = targetChild.textContent?.length || 0;
      } else {
        const walker = document.createTreeWalker(targetChild, NodeFilter.SHOW_TEXT);
        const firstText = walker.nextNode();
        if (firstText) {
          node = firstText;
          offset = firstText.textContent?.length || 0;
        }
      }
    }
  }

  if (!node || node.nodeType !== Node.TEXT_NODE) {
    // @ts-ignore
    CSS.highlights.delete('fokus-satz');
    return;
  }

  const text = node.textContent || '';

  // Suche Satzanfang (letztes Satzende davor: . ! ? gefolgt von Leerzeichen)
  let start = 0;
  for (let i = offset - 1; i >= 0; i--) {
    if (/[.!?\n]/.test(text[i])) {
      let s = i + 1;
      while (s < offset && /\s/.test(text[s])) s++;
      start = s;
      break;
    }
  }

  // Suche Satzende (nächstes Satzende danach)
  let end = text.length;
  for (let i = offset; i < text.length; i++) {
    if (/[.!?\n]/.test(text[i])) {
      end = i + 1;
      break;
    }
  }

  try {
    const range = document.createRange();
    range.setStart(node, Math.max(0, start));
    range.setEnd(node, Math.min(text.length, end));

    // @ts-ignore
    const highlight = new Highlight(range);
    // @ts-ignore
    CSS.highlights.set('fokus-satz', highlight);
  } catch (_e) {
    // @ts-ignore
    CSS.highlights.delete('fokus-satz');
  }
}

/**
 * Aktiviert das Addon mit sauberem Lebenszyklus.
 * @param {{ signal?: AbortSignal }} [ctx]
 * @returns {Promise<() => void>}
 */
export async function activate(ctx = {}) {
  ensureStylesheet();

  const blatt = document.querySelector('din-blatt');
  if (blatt && currentMode !== 'aus') {
    blatt.setAttribute('data-fokus', currentMode);
  }
  if (zenEnabled) {
    document.body.setAttribute('data-zen', 'true');
  }

  // Zen-Modus Listener
  /** @param {Event} e */
  const onUserTyping = (e) => {
    if (!zenEnabled) return;
    const target = /** @type {Element | null} */ (e.target);
    if (target?.closest?.('din-blatt')) {
      document.body.classList.add('is-typing');
      if (typingTimer) clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        document.body.classList.remove('is-typing');
      }, 1600);
    }
  };

  /** @param {MouseEvent} e */
  const onMouseMove = (e) => {
    const target = /** @type {Element | null} */ (e.target);
    if (target?.closest?.('#seitenleiste')) {
      if (document.body.classList.contains('is-typing')) {
        document.body.classList.remove('is-typing');
      }
    }
  };

  const onSelectionChange = () => {
    updateParagraphFocus();
    if (currentMode === 'zeile') {
      updateSentenceHighlight();
    }
  };

  window.addEventListener('keydown', onUserTyping, { passive: true });
  window.addEventListener('input', onUserTyping, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('selectionchange', onSelectionChange, { passive: true });
  document.addEventListener('click', onSelectionChange, { passive: true });

  const dispose = () => {
    window.removeEventListener('keydown', onUserTyping);
    window.removeEventListener('input', onUserTyping);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('selectionchange', onSelectionChange);
    document.removeEventListener('click', onSelectionChange);
    if (typingTimer) clearTimeout(typingTimer);
    document.body.classList.remove('is-typing');
    document.body.removeAttribute('data-zen');
    if (blatt) blatt.removeAttribute('data-fokus');
    const textContainer = document.getElementById('text');
    if (textContainer) {
      textContainer.querySelectorAll('.fokus-aktiv').forEach((el) => {
        el.classList.remove('fokus-aktiv');
      });
    }
    if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
      // @ts-ignore
      CSS.highlights.delete('fokus-satz');
    }
    removeStylesheet();
  };

  if (ctx?.signal) {
    ctx.signal.addEventListener('abort', dispose, { once: true });
  }

  cleanupFn = dispose;
  return dispose;
}

/**
 * Universeller run()-Vertrag für Aktionsaufrufe.
 * @param {string} action
 * @param {any} [arg]
 * @param {any} [_ctx]
 */
export async function run(action, arg, _ctx = {}) {
  if (action === 'setMode') {
    currentMode = String(arg || 'aus');
    const blatt = document.querySelector('din-blatt');
    if (blatt) {
      if (currentMode === 'aus') {
        blatt.removeAttribute('data-fokus');
        const textContainer = document.getElementById('text');
        if (textContainer) {
          textContainer.querySelectorAll('.fokus-aktiv').forEach((el) => {
            el.classList.remove('fokus-aktiv');
          });
        }
        if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
          // @ts-ignore
          CSS.highlights.delete('fokus-satz');
        }
      } else {
        ensureStylesheet();
        blatt.setAttribute('data-fokus', currentMode);
        updateParagraphFocus();
        if (currentMode === 'zeile') updateSentenceHighlight();
      }
    }
    return currentMode;
  }

  if (action === 'setZen') {
    zenEnabled = Boolean(arg);
    if (zenEnabled) {
      ensureStylesheet();
      document.body.setAttribute('data-zen', 'true');
    } else {
      document.body.removeAttribute('data-zen');
      document.body.classList.remove('is-typing');
    }
    return zenEnabled;
  }

  if (action === 'dispose') {
    if (cleanupFn) cleanupFn();
    return true;
  }

  return false;
}

export function dispose() {
  if (cleanupFn) cleanupFn();
}
