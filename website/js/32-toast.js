// @ts-check
// @guide [[chrome-modern-css]]

/* @adr [[ADR-JS]] {ToastSystem} */
export class ToastSystem {
  constructor() {
    /** @type {Array<{message: string, type: string, options: any, duration: number}>} */
    this.queue = [];
    /** @type {boolean} */
    this.isActive = false;
    /** @type {any} */
    this.displayTimeout = null;
    /** @type {number} */
    this.timeRemaining = 0;
    /** @type {number} */
    this.startTime = 0;
    /** @type {boolean} */
    this.isPaused = false;
    /** @type {{message: string, type: string, options: any, duration: number} | null} */
    this.currentToast = null;
    /** @type {number} */
    this.toastCount = 1;
    
    // Swipe state
    /** @type {number} */
    this.startX = 0;
    /** @type {number} */
    this.currentX = 0;
    /** @type {boolean} */
    this.isSwiping = false;

    // DOM elements
    /** @type {HTMLElement | null} */
    this.globalToast = null;
    /** @type {HTMLElement | null} */
    this.toastMessage = null;
    /** @type {HTMLElement | null} */
    this.toastBadge = null;
    /** @type {HTMLElement | null} */
    this.toastAction = null;
    /** @type {HTMLElement | null} */
    this.toastClose = null;
  }

  initDOM() {
    this.globalToast = document.getElementById('toast-v4');
    this.toastMessage = document.getElementById('toast-message');
    this.toastBadge = document.getElementById('toast-badge');
    this.toastAction = document.getElementById('toast-action');
    this.toastClose = document.getElementById('toast-close');

    if (!this.globalToast || !this.toastMessage || !this.toastClose) {
      console.warn('[Toast] DOM elements missing.');
      return;
    }

    // Hover to Pause Logic
    this.globalToast.addEventListener('mouseenter', () => this.pauseTimer());
    this.globalToast.addEventListener('mouseleave', () => this.resumeTimer());

    // Close Button Logic
    this.toastClose.addEventListener('click', () => {
      this.clearCurrentToast();
      this.cleanupPopover();
    });

    // Swipe-to-Dismiss Logic
    this.globalToast.addEventListener('pointerdown', this.onPointerDown.bind(this));
    document.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
    document.addEventListener('pointerup', this.onPointerUp.bind(this));
    document.addEventListener('pointercancel', this.onPointerUp.bind(this));
  }

  /**
   * Swipe Handlers
   * @param {PointerEvent} e
   */
  onPointerDown(e) {
    if (!this.isActive || !this.globalToast) return;
    
    // Ignore swipe capture if clicking interactive buttons
    const target = /** @type {HTMLElement} */ (e.target);
    if (target && (target.closest('#toast-close') || target.closest('#toast-action'))) {
      return;
    }

    this.isSwiping = true;
    this.startX = e.clientX;
    this.currentX = 0;
    this.globalToast.style.transition = 'none'; // Disable transition for 1:1 finger tracking
    this.globalToast.setPointerCapture(e.pointerId);
  }

  /**
   * @param {PointerEvent} e
   */
  onPointerMove(e) {
    if (!this.isSwiping || !this.globalToast) return;
    
    const deltaX = e.clientX - this.startX;
    // Only allow swipe to the right (positive deltaX)
    if (deltaX > 0) {
      e.preventDefault(); // Prevent scrolling while swiping
      this.currentX = deltaX;
      this.globalToast.style.setProperty('--swipe-x', `${deltaX}px`);
      this.globalToast.style.setProperty('--swipe-x-abs', `${Math.abs(deltaX)}`);
    }
  }

  /**
   * @param {PointerEvent} e
   */
  onPointerUp(e) {
    if (!this.isSwiping || !this.globalToast) return;
    this.isSwiping = false;
    
    // Restore CSS transition for snap-back or exit animation
    this.globalToast.style.transition = '';

    if (this.currentX > 80) {
      // Swipe threshold reached: Dismiss!
      this.clearCurrentToast();
      this.cleanupPopover();
    } else {
      // Snap back to 0
      this.globalToast.style.removeProperty('--swipe-x');
      this.globalToast.style.removeProperty('--swipe-x-abs');
    }
    this.currentX = 0;
  }

  /**
   * show()
   * @param {string} message - The text to display
   * @param {string} type - 'info', 'success', 'warning', 'error'
   * @param {Object} options - { action: { label, callback }, sticky: boolean, id: string }
   */
    /**
   * show()
   * @param {string} message - The text to display
   * @param {string} type - 'info', 'success', 'warning', 'error'
   * @param {ToastOptions} [options]
   */
  show(message, type = 'info', options = {}) {
    // Multi-Stacking / Counter Logic
    if (this.currentToast && this.currentToast.message === message) {
      this.toastCount++;
      if (this.toastBadge) {
        this.toastBadge.textContent = `x${this.toastCount}`;
      }
      
      if (this.globalToast) {
        this.globalToast.dataset.shake = 'false';
        requestAnimationFrame(() => {
          if (this.globalToast) this.globalToast.dataset.shake = 'true';
        });
      }
      
      // Reset Timer
      this.startTimer(this.currentToast.duration, this.currentToast.options.sticky);
      return;
    }

    // Deduplication in queue
    if (this.queue.some(t => t.message === message)) return;

    // Default duration calculation
    const duration = Math.min(5000, 2000 + (message.length * 30));

    this.queue.push({ message, type, options, duration });
    this.processQueue();
  }

  /**
   * @param {string} id
   * @param {string} message
   * @param {string} type
   */
  update(id, message, type = 'info') {
    if (this.currentToast && this.currentToast.options.id === id) {
      if (this.toastMessage) this.toastMessage.textContent = message;
      if (this.globalToast) {
        this.globalToast.className = `toast-container type-${type}`;
        this.globalToast.style.removeProperty('--swipe-x'); // Reset swipe
        this.globalToast.style.removeProperty('--swipe-x-abs');
      }
    }
  }

  processQueue() {
    if (this.isActive || this.queue.length === 0 || !this.globalToast) return;

    this.isActive = true;
    this.isPaused = false;
    this.toastCount = 1;
    this.currentToast = this.queue.shift() || null;
    if (!this.currentToast) {
      this.isActive = false;
      return;
    }

    // Reset styles
    if (this.toastBadge) this.toastBadge.textContent = '';
    this.globalToast.dataset.shake = 'false';
    this.globalToast.style.removeProperty('--swipe-x');
    this.globalToast.style.removeProperty('--swipe-x-abs');

    // Set Text and Type
    if (this.toastMessage) this.toastMessage.textContent = this.currentToast.message;
    this.globalToast.className = `toast-container type-${this.currentToast.type}`;

    // Handle Action Button
    if (this.currentToast.options.action && this.toastAction) {
      this.toastAction.textContent = this.currentToast.options.action.label;
      this.toastAction.style.display = 'inline-block';
      this.toastAction.onclick = () => {
        if (this.currentToast && this.currentToast.options.action) {
          this.currentToast.options.action.callback();
        }
        this.clearCurrentToast();
        this.cleanupPopover();
      };
    } else if (this.toastAction) {
      this.toastAction.style.display = 'none';
      this.toastAction.onclick = null;
    }

    try {
      // @ts-ignore
      this.globalToast.showPopover();
      this.startTimer(this.currentToast.duration, this.currentToast.options.sticky);
    } catch (e) {
      console.warn('[Toast] Popover API failure:', e);
      this.clearCurrentToast();
      setTimeout(() => this.processQueue(), 200);
    }
  }

  /**
   * @param {number} duration
   * @param {boolean} sticky
   */
  startTimer(duration, sticky) {
    this.clearCurrentToast(); // Clear previous timeout
    if (sticky) return; // Sticky toasts don't auto-close

    this.timeRemaining = duration;
    this.startTime = Temporal.Now.instant().epochMilliseconds;
    this.displayTimeout = setTimeout(() => this.cleanupPopover(), this.timeRemaining);
  }

  pauseTimer() {
    if (!this.isActive || this.isPaused || !this.currentToast || this.currentToast.options.sticky) return;
    this.isPaused = true;
    if (this.displayTimeout) clearTimeout(this.displayTimeout);
    
    const elapsed = Temporal.Now.instant().epochMilliseconds - this.startTime;
    this.timeRemaining = Math.max(0, this.timeRemaining - elapsed);
  }

  resumeTimer() {
    if (!this.isActive || !this.isPaused || !this.currentToast || this.currentToast.options.sticky) return;
    this.isPaused = false;
    
    // We restart the timer with the remaining time
    this.startTime = Temporal.Now.instant().epochMilliseconds;
    this.displayTimeout = setTimeout(() => this.cleanupPopover(), this.timeRemaining);
  }

  clearCurrentToast() {
    if (this.displayTimeout) clearTimeout(this.displayTimeout);
  }

  cleanupPopover() {
    this.clearCurrentToast();
    this.currentToast = null;

    // @ts-ignore
    if (this.globalToast && this.globalToast.matches(':popover-open')) {
      // @ts-ignore
      this.globalToast.hidePopover();
    }
    
    // Wait for the native CSS exit animation (250ms) to fully finish
    setTimeout(() => {
      this.isActive = false;
      this.processQueue();
    }, 300);
  }
}

// Singleton instance
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


