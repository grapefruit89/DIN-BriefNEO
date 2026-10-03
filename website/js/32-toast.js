// @ts-check
// @guide [[din-5008-css-architektur]]

/* Ein Toast-Slot. Neuer Toast ersetzt alten sofort.
 * Dedupliziert bei identischer Message (Timer-Reset statt Neuaufbau).
 * Popover-Top-Layer + @starting-style (CSS) für Animation.
 * CloseWatcher (nativ) für Esc/Android-Back. */

/** @type {{ global: HTMLElement, message: HTMLElement, close: HTMLElement } | null} */
let dom = null;
/** @type {{ message: string } | null} */
let current = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let timer = null;
/** @type {CloseWatcher | null} */
let closer = null;

export function initToastSystem() {
  const global = document.getElementById('hinweis-v4');
  const message = document.getElementById('hinweis-message');
  const close = document.getElementById('hinweis-close');
  if (!global || !message || !close) {
    console.warn('[Toast] DOM elements missing.');
    return;
  }
  dom = { global, message, close };
  close.addEventListener('click', hide);
}

/**
 * @param {string} message
 * @param {string} [type]
 */
export function showToast(message, type = 'info') {
  if (!dom) return;

  if (current?.message === message) {
    startTimer(message);
    return;
  }

  dom.message.textContent = message;
  dom.global.className = `hinweis-container type-${type}`;
  current = { message };

  if (!dom.global.matches(':popover-open')) {
    try { dom.global.showPopover(); } catch (e) {
      console.warn('[Toast] Popover API failure:', e);
      return;
    }
  }

  startTimer(message);
  armCloseWatcher();
}

/** @param {string} message */
function startTimer(message) {
  if (timer !== null) clearTimeout(timer);
  const duration = Math.min(5000, 2000 + message.length * 30);
  timer = setTimeout(hide, duration);
}

function armCloseWatcher() {
  closer?.destroy();
  if (typeof CloseWatcher === 'undefined') return;
  closer = new CloseWatcher();
  closer.addEventListener('close', hide);
}

function hide() {
  if (timer !== null) { clearTimeout(timer); timer = null; }
  closer?.destroy();
  closer = null;
  current = null;
  if (dom?.global.matches(':popover-open')) {
    try { dom.global.hidePopover(); } catch {}
  }
}
