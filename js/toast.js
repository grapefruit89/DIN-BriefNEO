/* ── TOAST SYSTEM (Platinum UI Feedback) ────────────────────── */

export const Toast = {
  /**
   * Zeigt eine kurze Benachrichtigung
   * @param {string} message - Der anzuzeigende Text
   * @param {'info'|'success'|'warning'|'error'} type - Der Typ der Meldung
   */
  show(message, type = "info") {
    const el = document.getElementById("toast-v4");
    if (!el) return;

    el.textContent = message;
    el.className = `toast-container type-${type}`;

    try {
      // Nutzt native Popover API (Chrome 114+)
      el.showPopover();
      
      // SW-05: Animationend Listener statt hartem setTimeout für Platinum-Feel
      const onEnd = () => {
        el.hidePopover();
        el.removeEventListener("animationend", onEnd);
      };
      el.addEventListener("animationend", onEnd);
    } catch (e) {
      console.warn("[UI] Popover API failure:", e);
    }
  }
};
