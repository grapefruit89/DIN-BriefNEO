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

    // Bestehenden Toast ggf. sofort schließen für schnellen Wechsel
    if (el.matches(":popover-open")) {
      el.hidePopover();
    }

    el.textContent = message;
    el.className = `toast-container type-${type}`;

    try {
      // Nutzt native Popover API (Chrome 114+)
      el.showPopover();

      // Schließen per Klick für bessere UX
      el.onclick = () => el.hidePopover();
      
      // transitionend statt animationend (da CSS Transition genutzt wird)
      const onEnd = () => {
        if (el.matches(":popover-open")) el.hidePopover();
      };
      
      el.addEventListener("transitionend", onEnd, { once: true });

      // Sicherheits-Fallback: Automatisches Schließen nach 4s
      setTimeout(() => {
        if (el.matches(":popover-open")) el.hidePopover();
      }, 4000);

    } catch (e) {
      console.warn("[Toast] Popover API failure:", e);
    }
  }
};
