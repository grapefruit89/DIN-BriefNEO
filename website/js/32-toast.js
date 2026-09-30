// @ts-check
// @guide [[din-5008-css-architektur]]

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
      hinweis: {
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
        close: null,
        /** @type {CloseWatcher | null} */
        closer: null
      },
      active: false
    };
  }

  initDOM() {
    const dom = this.state.dom;
    dom.global = document.getElementById('hinweis-v4');
    dom.message = document.getElementById('hinweis-message');
    dom.badge = document.getElementById('hinweis-badge');
    dom.action = document.getElementById('hinweis-action');
    dom.close = document.getElementById('hinweis-close');

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
    const { hinweis, dom } = this.state;
    if (hinweis.current && hinweis.current.message === message) {
      hinweis.count++;
      if (dom.badge) dom.badge.textContent = `x${hinweis.count}`;
      if (dom.global) {
        dom.global.dataset.shake = 'false';
        requestAnimationFrame(() => {
          if (dom.global) dom.global.dataset.shake = 'true';
        });
      }
      this.startTimer(hinweis.current.duration, hinweis.current.options?.sticky);
      return;
    }
    if (hinweis.queue.some(t => t.message === message)) return;
    const duration = Math.min(5000, 2000 + (message.length * 30));
    hinweis.queue.push({ message, type, options, duration });
    this.processQueue();
  }

  processQueue() {
    const { hinweis, dom } = this.state;
    if (this.state.active || hinweis.queue.length === 0 || !dom.global) return;
    this.state.active = true;
    this.state.timer.paused = false;
    hinweis.count = 1;
    hinweis.current = hinweis.queue.shift() || null;
    if (!hinweis.current) {
      this.state.active = false;
      return;
    }
    if (dom.badge) dom.badge.textContent = '';
    dom.global.dataset.shake = 'false';
    if (dom.message) dom.message.textContent = hinweis.current.message;
    dom.global.className = `hinweis-container type-${hinweis.current.type}`;
    
    if (hinweis.current.options?.action && dom.action) {
      dom.action.textContent = hinweis.current.options.action.label;
      dom.action.onclick = () => {
        if (hinweis.current?.options?.action?.callback) {
          hinweis.current.options.action.callback();
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
      this.armCloseWatcher();
      this.startTimer(hinweis.current.duration, hinweis.current.options?.sticky);
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
    const { hinweis, timer } = this.state;
    if (!this.state.active || timer.paused || !hinweis.current || hinweis.current.options?.sticky) return;
    timer.paused = true;
    if (timer.id) clearTimeout(timer.id);
    const elapsed = performance.now() - timer.start;
    timer.remaining = Math.max(0, timer.remaining - elapsed);
  }

  resumeTimer() {
    const { hinweis, timer } = this.state;
    if (!this.state.active || !timer.paused || !hinweis.current || hinweis.current.options?.sticky) return;
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

  /**
   * Native CloseWatcher: Esc (nur bei frischer User-Aktivierung) und Android-Zurück
   * entladen den sichtbaren Toast — auch sticky. Kein eigener keydown-Handler nötig.
   */
  armCloseWatcher() {
    this.destroyCloseWatcher();
    if (typeof CloseWatcher === 'undefined') return;
    const watcher = new CloseWatcher();
    watcher.addEventListener('close', () => {
      this.clearTimer();
      this.cleanupPopover();
    });
    this.state.dom.closer = watcher;
  }

  destroyCloseWatcher() {
    if (this.state.dom.closer) {
      this.state.dom.closer.destroy();
      this.state.dom.closer = null;
    }
  }

  cleanupPopover() {
    this.destroyCloseWatcher();
    this.clearTimer();
    this.state.hinweis.current = null;
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

export const hinweisSystem = new ToastSystem();

/**
 * @param {string} message
 * @param {string} type
 * @param {any} [options]
 */
export function showToast(message, type = 'info', options = {}) {
  hinweisSystem.show(message, type, options);
}

export function initToastSystem() {
  hinweisSystem.initDOM();
}
