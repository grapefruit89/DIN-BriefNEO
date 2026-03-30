import { TOASTS } from "./toast-registry.js";

/**
 * ToastManager - Handles single-toast queue logic.
 * Prevents UI cluttering by only showing one notification at a time.
 */
class ToastManager {
  constructor() {
    this.queue = [];
    this.isActive = false;
    this.container = null;
  }

  _getContainer() {
    return this.container || (this.container = document.getElementById("toast-v4"));
  }

  show(id, params = {}) {
    const config = TOASTS[id];
    if (!config) return;

    let text = config.text;
    for (const [key, val] of Object.entries(params)) {
      text = text.replace(`{${key}}`, val);
    }

    if (this.isActive) {
      if (this.queue.some((t) => t.id === id)) return;
      this.queue.push({ id, text, config });
    } else {
      this._render(text, config);
    }
  }

  _render(text, config) {
    const el = this._getContainer();
    if (!el) return;

    this.isActive = true;
    el.textContent = text;
    el.className = `toast-container type-${config.type}`;
    
    try {
      el.showPopover();
      setTimeout(() => this._dismiss(), config.duration);
    } catch (e) {
      console.warn("[Toast] Popover API failed", e);
      this.isActive = false;
    }
  }

  _dismiss() {
    const el = this._getContainer();
    if (!el) return;

    el.hidePopover();
    
    // Wait for CSS transition to finish before showing next
    setTimeout(() => {
      this.isActive = false;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this._render(next.text, next.config);
      }
    }, 400); // Matches CSS transition duration
  }
}

export const toast = new ToastManager();
