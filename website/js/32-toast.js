// @ts-check
// @guide [[chrome-modern-css]]

/**
 * @typedef {{message: string, type: string, options: any, duration: number}} ToastEntry
 */

/* @adr [[ADR-JS]] {ToastSystem} */
/* =========================================================================================
 * 🛡️ ARCHITECTURE GUARD: NATIVE HTML POPOVER TOAST ENGINE (Top-Layer W3C Standard)
 *
 * ⚠️ ACHTUNG FÜR ZUKÜNFTIGE KIs / LLMs / DEVELOPER:
 * Das Toast-System nutzt die native HTML Popover API (`popover="manual"`) und rendert
 * direkt im Browser-Top-Layer.
 * - Entry- & Exit-Animationen laufen 100% deklarativ über CSS `@starting-style` in `floating.css`.
 * - Statt `display: none`-Hacks und manueller Z-Index-Kämpfe (`z-index: 9999`) regelt der
 *   Browser das Stacking im Top-Layer automatisch.
 *
 * ES IST STRENGSTENS UNTERSAGT (Immutable Law A49 & ADR-JS):
 * 1. Manuelle Pointer-Drag/Swipe-Event-Schleifen oder `--swipe-x` Berechnungen in JS einzufügen.
 * 2. Manuelle Z-Index-Erhöhungen in JS/CSS zu reaktivieren.
 * 3. Polyfills oder Framework-Toast-Bibliotheken hinzuzufügen.
 * ========================================================================================= */

export class ToastSystem {
  constructor() {
    this.state = {
      toast: {
        /** @type {ToastEntry[]} */
        queue: [],
        /** @type {ToastEntry | null} */
        current: null,
        count: 1
      },
      timer: {
        /** @type {ReturnType<typeof setTimeout> | null} */
        id: null,
        remaining: 0,
        start: 0,
        paused: false
      },
      dom: {
        /** @type {HTMLElement | null} */
        global: null,
        /** @type {HTMLElement | null} */
        message: null,
        /** @type {HTMLElement | null} */
        badge: null,
        /** @type {HTMLElement | null} */
        action: null,
        /** @type {HTMLElement | null} */
        close: null
      },
      active: false
    };
  }

  initDOM() {
    const dom = this.state.dom;
    dom.global = document.getElementById('toast-v4');
    dom.message = document.getElementById('toast-message');
    dom.badge = document.getElementById('toast-badge');
    dom.action = document.getElementById('toast-action');
    dom.close = document.getElementById('toast-close');

    if (!dom.global || !dom.message || !dom.close) {
      console.warn('[Toast] DOM elements missing.');
      return;
    }

    dom.global.addEventListener('mouseenter', () => this.pauseTimer());
    dom.global.addEventListener('mouseleave', () => this.resumeTimer());

    dom.close.addEventListener('click', () => {
      this.clearTimer();
      this.cleanupPopover();
    });
  }

  /**
   * @param {string} message
   * @param {string} type
   * @param {Object} [options]
   */
  show(message, type = 'info', options = {}) {
    const { toast, dom } = this.state;
    if (toast.current && toast.current.message === message) {
      toast.count++;
      if (dom.badge) dom.badge.textContent = `x${toast.count}`;
      if (dom.global) {
        dom.global.dataset.shake = 'false';
        requestAnimationFrame(() => {
          if (dom.global) dom.global.dataset.shake = 'true';
        });
      }
      this.startTimer(toast.current.duration, toast.current.options?.sticky);
      return;
    }
    if (toast.queue.some(t => t.message === message)) return;
    const duration = Math.min(5000, 2000 + (message.length * 30));
    toast.queue.push({ message, type, options, duration });
    this.processQueue();
  }

  /**
   * @param {string} id
   * @param {string} message
   * @param {string} type
   */
  update(id, message, type = 'info') {
    const { toast, dom } = this.state;
    if (toast.current && toast.current.options?.id === id) {
      if (dom.message) dom.message.textContent = message;
      if (dom.global) {
        dom.global.className = `toast-container type-${type}`;
      }
    }
  }

  processQueue() {
    const { toast, dom } = this.state;
    if (this.state.active || toast.queue.length === 0 || !dom.global) return;
    this.state.active = true;
    this.state.timer.paused = false;
    toast.count = 1;
    toast.current = toast.queue.shift() || null;
    if (!toast.current) {
      this.state.active = false;
      return;
    }
    if (dom.badge) dom.badge.textContent = '';
    dom.global.dataset.shake = 'false';
    if (dom.message) dom.message.textContent = toast.current.message;
    dom.global.className = `toast-container type-${toast.current.type}`;
    
    if (toast.current.options?.action && dom.action) {
      dom.action.textContent = toast.current.options.action.label;
      dom.action.onclick = () => {
        if (toast.current?.options?.action?.callback) {
          toast.current.options.action.callback();
        }
        this.clearTimer();
        this.cleanupPopover();
      };
    } else if (dom.action) {
      dom.action.textContent = '';
      dom.action.onclick = null;
    }

    try {
      if (!dom.global.matches(':popover-open')) {
        dom.global.showPopover();
      }
      this.startTimer(toast.current.duration, toast.current.options?.sticky);
    } catch (e) {
      console.warn('[Toast] Popover API failure:', e);
      this.clearTimer();
      setTimeout(() => this.processQueue(), 200);
    }
  }

  /**
   * @param {number} duration
   * @param {boolean} [sticky]
   */
  startTimer(duration, sticky) {
    this.clearTimer();
    if (sticky) return;
    const timer = this.state.timer;
    timer.remaining = duration;
    timer.start = performance.now();
    timer.id = setTimeout(() => this.cleanupPopover(), timer.remaining);
  }

  pauseTimer() {
    const { toast, timer } = this.state;
    if (!this.state.active || timer.paused || !toast.current || toast.current.options?.sticky) return;
    timer.paused = true;
    if (timer.id) clearTimeout(timer.id);
    const elapsed = performance.now() - timer.start;
    timer.remaining = Math.max(0, timer.remaining - elapsed);
  }

  resumeTimer() {
    const { toast, timer } = this.state;
    if (!this.state.active || !timer.paused || !toast.current || toast.current.options?.sticky) return;
    timer.paused = false;
    timer.start = performance.now();
    timer.id = setTimeout(() => this.cleanupPopover(), timer.remaining);
  }

  clearTimer() {
    const timer = this.state.timer;
    if (timer.id) {
      clearTimeout(timer.id);
      timer.id = null;
    }
  }

  cleanupPopover() {
    this.clearTimer();
    this.state.toast.current = null;
    const dom = this.state.dom;
    if (dom.global && dom.global.matches(':popover-open')) {
      dom.global.hidePopover();
    }
    setTimeout(() => {
      this.state.active = false;
      this.processQueue();
    }, 250);
  }
}

export const toastSystem = new ToastSystem();

/**
 * @param {string} message
 * @param {string} type
 * @param {any} [options]
 */
export function showToast(message, type = 'info', options = {}) {
  toastSystem.show(message, type, options);
}

/**
 * @param {string} id
 * @param {string} message
 * @param {string} type
 */
export function updateToast(id, message, type = 'info') {
  toastSystem.update(id, message, type);
}

export function initToastSystem() {
  toastSystem.initDOM();
}
