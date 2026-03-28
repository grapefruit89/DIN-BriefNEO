import { TOASTS } from '../core/toast-registry.js';

/**
 * ToastManager - Handles single-toast queue logic.
 * Prevents UI cluttering by only showing one notification at a time.
 */
class ToastManager {
  constructor() {
    this.queue = [];
    this.activeToast = null;
    this.container = null;
  }

  _getContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  /**
   * Shows a toast by its registry ID.
   * @param {string} id - The ID from TOASTS registry
   * @param {Object} params - Placeholder replacements
   */
  show(id, params = {}) {
    const config = TOASTS[id];
    if (!config) {
      console.warn(`[Toast] ID "${id}" not found in registry.`);
      return;
    }

    let text = config.text;
    for (const [key, val] of Object.entries(params)) {
      text = text.replace(`{${key}}`, val);
    }

    const toast = { id, text, config };

    if (this.activeToast) {
      // Avoid duplicate identical toasts in queue
      if (this.queue.some(t => t.id === id)) return;
      this.queue.push(toast);
    } else {
      this._render(toast);
    }
  }

  _render(toast) {
    this.activeToast = toast;
    const el = document.createElement('div');
    el.className = `toast toast-${toast.config.type}`;
    el.textContent = toast.text;

    const container = this._getContainer();
    container.appendChild(el);

    // Auto-dismiss
    setTimeout(() => this._dismiss(), toast.config.duration);
  }

  _dismiss() {
    if (!this.activeToast) return;
    const container = this._getContainer();
    const el = container.querySelector('.toast');

    if (el) {
      el.classList.add('toast-exit');
      el.addEventListener('transitionend', () => {
        el.remove();
        this.activeToast = null;
        if (this.queue.length > 0) {
          this._render(this.queue.shift());
        }
      }, { once: true });
    }
  }
}

export const toast = new ToastManager();
