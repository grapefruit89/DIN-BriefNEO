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
 * Wichtig: Wenn der aktive Absatz derselbe bleibt (beim normalen Tippen),
 * erfolgt KEINE DOM-Mutation (verhindert Text-Stauchung und Re-Layout).
 */
function updateParagraphFocus() {
  if (currentMode === 'aus') return;

  const sel = window.getSelection();
  const textContainer = document.getElementById('text');
  if (!textContainer) return;

  const node = sel?.anchorNode;
  const isInside = Boolean(node && textContainer.contains(node));

  let target = null;
  if (isInside && node) {
    let curr = node.nodeType === Node.ELEMENT_NODE ? /** @type {Element} */ (node) : node.parentElement;
    while (curr && curr.parentElement !== textContainer && curr !== textContainer) {
      curr = curr.parentElement;
    }
    if (curr && curr !== textContainer) {
      target = curr;
    }
  }

  const currentAktiv = textContainer.querySelector('.fokus-aktiv');
  if (currentAktiv === target) {
    return;
  }

  if (currentAktiv) currentAktiv.classList.remove('fokus-aktiv');
  if (target) target.classList.add('fokus-aktiv');
}

/**
 * Aktiviert das Addon mit sauberem Lebenszyklus.
 * @param {{ signal?: AbortSignal }} [ctx]
 * @returns {Promise<() => void>}
 */
export async function activate(ctx = {}) {
  ensureStylesheet();

  // Alte Highlights sofort rückstandslos entfernen
  if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
    // @ts-ignore
    CSS.highlights.delete('fokus-satz');
  }

  const blatt = document.querySelector('din-blatt');
  if (blatt && currentMode !== 'aus') {
    blatt.setAttribute('data-fokus', currentMode);
    document.body.setAttribute('data-fokus-aktiv', 'true');
  }
  if (zenEnabled) {
    document.body.setAttribute('data-zen', 'true');
  }

  // Zen-Modus Listener
  /** @param {Event} e */
  const onUserTyping = (e) => {
    if (!zenEnabled) return;
    const target = /** @type {Element | null} */ (e.target);
    if (target?.closest?.('#text')) {
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
    document.body.removeAttribute('data-fokus-aktiv');
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
  if (action === 'setFokus' || action === 'toggle') {
    const aktiv = Boolean(arg);
    currentMode = aktiv ? 'absatz' : 'aus';
    zenEnabled = aktiv;
    const blatt = document.querySelector('din-blatt');
    if (blatt) {
      if (!aktiv) {
        blatt.removeAttribute('data-fokus');
        document.body.removeAttribute('data-fokus-aktiv');
        document.body.removeAttribute('data-zen');
        document.body.classList.remove('is-typing');
        const textContainer = document.getElementById('text');
        if (textContainer) {
          textContainer.querySelectorAll('.fokus-aktiv').forEach((el) => {
            el.classList.remove('fokus-aktiv');
          });
        }
      } else {
        ensureStylesheet();
        blatt.setAttribute('data-fokus', 'absatz');
        document.body.setAttribute('data-fokus-aktiv', 'true');
        document.body.setAttribute('data-zen', 'true');
        updateParagraphFocus();
      }
    }
    if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
      // @ts-ignore
      CSS.highlights.delete('fokus-satz');
    }
    return aktiv;
  }

  if (action === 'setMode') {
    currentMode = arg === 'aus' ? 'aus' : 'absatz';
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
