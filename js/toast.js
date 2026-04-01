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

    // Reset für schnellen Re-Trigger
    if (el.matches(":popover-open")) el.hidePopover();

    el.textContent = message;
    el.className = `toast-container type-${type}`;

    try {
      el.showPopover();

      // Klick schließt sofort
      el.onclick = () => el.hidePopover();
      
      // Cleanup: Nach Abschluss der CSS-Animation das Popover schließen
      const onEnd = () => {
        if (el.matches(":popover-open")) el.hidePopover();
      };
      
      el.addEventListener("animationend", onEnd, { once: true });
    } catch (e) {
      console.warn("[Toast] Popover API failure:", e);
    }
  }
};
