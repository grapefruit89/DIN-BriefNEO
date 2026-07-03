// @adr [[ADR-JS]]
// @guide [[chrome-modern-css]]

export class ToastSystem {
  constructor() {
    this.queue = [];
    this.isActive = false;
    this.displayTimeout = null;
    this.timeRemaining = 0;
    this.startTime = 0;
    this.isPaused = false;
    this.currentToast = null;
    this.toastCount = 1;
    
    // Swipe state
    this.startX = 0;
    this.currentX = 0;
    this.isSwiping = false;
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

  // Swipe Handlers
  onPointerDown(e) {
    if (!this.isActive) return;
    this.isSwiping = true;
    this.startX = e.clientX;
    this.currentX = 0;
    this.globalToast.style.transition = 'none'; // Disable transition for 1:1 finger tracking
    this.globalToast.setPointerCapture(e.pointerId);
  }

  onPointerMove(e) {
    if (!this.isSwiping) return;
    
    const deltaX = e.clientX - this.startX;
    // Only allow swipe to the right (positive deltaX)
    if (deltaX > 0) {
      e.preventDefault(); // Prevent scrolling while swiping
      this.currentX = deltaX;
      this.globalToast.style.transform = `translateX(${deltaX}px)`;
      this.globalToast.style.opacity = Math.max(0, 1 - (deltaX / 150));
    }
  }

  onPointerUp(e) {
    if (!this.isSwiping) return;
    this.isSwiping = false;
    
    // Restore CSS transition for snap-back or exit animation
    this.globalToast.style.transition = '';

    if (this.currentX > 80) {
      // Swipe threshold reached: Dismiss!
      this.clearCurrentToast();
      this.cleanupPopover();
    } else {
      // Snap back to 0
      this.globalToast.style.transform = '';
      this.globalToast.style.opacity = '';
    }
    this.currentX = 0;
  }

  /**
   * show()
   * @param {string} message - The text to display
   * @param {string} type - 'info', 'success', 'warning', 'error'
   * @param {Object} options - { action: { label, callback }, sticky: boolean, id: string }
   */
  show(message, type = 'info', options = {}) {
    // Multi-Stacking / Counter Logic
    if (this.currentToast && this.currentToast.message === message) {
      this.toastCount++;
      this.toastBadge.textContent = `x${this.toastCount}`;
      this.toastBadge.style.display = 'inline-flex';
      
      // Trigger CSS Shake
      this.globalToast.classList.remove('shake');
      void this.globalToast.offsetWidth; // trigger reflow
      this.globalToast.classList.add('shake');
      
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

  update(id, message, type = 'info') {
    if (this.currentToast && this.currentToast.options.id === id) {
      this.toastMessage.textContent = message;
      this.globalToast.className = `toast-container type-${type}`;
      this.globalToast.style.transform = ''; // Reset swipe
      this.globalToast.style.opacity = '';
    }
  }

  processQueue() {
    if (this.isActive || this.queue.length === 0 || !this.globalToast) return;

    this.isActive = true;
    this.isPaused = false;
    this.toastCount = 1;
    this.currentToast = this.queue.shift();

    // Reset styles
    this.toastBadge.style.display = 'none';
    this.globalToast.classList.remove('shake');
    this.globalToast.style.transform = '';
    this.globalToast.style.opacity = '';

    // Set Text and Type
    this.toastMessage.textContent = this.currentToast.message;
    this.globalToast.className = `toast-container type-${this.currentToast.type}`;

    // Handle Action Button
    if (this.currentToast.options.action) {
      this.toastAction.textContent = this.currentToast.options.action.label;
      this.toastAction.style.display = 'inline-block';
      this.toastAction.onclick = () => {
        this.currentToast.options.action.callback();
        this.clearCurrentToast();
        this.cleanupPopover();
      };
    } else {
      this.toastAction.style.display = 'none';
      this.toastAction.onclick = null;
    }

    try {
      this.globalToast.showPopover();
      this.startTimer(this.currentToast.duration, this.currentToast.options.sticky);
    } catch (e) {
      console.warn('[Toast] Popover API failure:', e);
      this.clearCurrentToast();
      setTimeout(() => this.processQueue(), 200);
    }
  }

  startTimer(duration, sticky) {
    this.clearCurrentToast(); // Clear previous timeout
    if (sticky) return; // Sticky toasts don't auto-close

    this.timeRemaining = duration;
    this.startTime = Date.now();
    this.displayTimeout = setTimeout(() => this.cleanupPopover(), this.timeRemaining);
  }

  pauseTimer() {
    if (!this.isActive || this.isPaused || !this.currentToast || this.currentToast.options.sticky) return;
    this.isPaused = true;
    clearTimeout(this.displayTimeout);
    
    const elapsed = Date.now() - this.startTime;
    this.timeRemaining = Math.max(0, this.timeRemaining - elapsed);
  }

  resumeTimer() {
    if (!this.isActive || !this.isPaused || !this.currentToast || this.currentToast.options.sticky) return;
    this.isPaused = false;
    
    // We restart the timer with the remaining time
    this.startTime = Date.now();
    this.displayTimeout = setTimeout(() => this.cleanupPopover(), this.timeRemaining);
  }

  clearCurrentToast() {
    clearTimeout(this.displayTimeout);
  }

  cleanupPopover() {
    this.clearCurrentToast();
    this.currentToast = null;

    if (this.globalToast && this.globalToast.matches(':popover-open')) {
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

export function showToast(message, type = 'info', options = {}) {
  toastSystem.show(message, type, options);
}

export function updateToast(id, message, type = 'info') {
  toastSystem.update(id, message, type);
}

export function initToastSystem() {
  toastSystem.initDOM();
}
