/**
 * js/capabilities.js — Native Feature Detection
 * [ADR-015] Pure Edition Baseline
 * ─────────────────────────────────────────────────────────
 */

export const Capabilities = Object.freeze({
  // Modern Baseline (Chrome 145+)
  temporal: !!globalThis.Temporal,
  sanitizer: !!globalThis.Sanitizer,
  editContext: !!globalThis.EditContext,

  // Storage Options
  opfs: !!globalThis.navigator?.storage?.getDirectory,
  serviceWorker: "serviceWorker" in navigator,

  // Environment Context
  isLocalFile: window.location.protocol === "file:",
  isSecureContext: window.isSecureContext,

  /**
   * Loggt den Status der Engine beim Booten
   */
  logStatus() {
    const status = this.isLocalFile
      ? "📂 FILE-MODE (Local)"
      : "🌐 WEB-MODE (Secure)";
    console.info(`%c[ENGINE] ${status}`, "font-weight: bold; color: #4ade80;");

    if (!this.temporal)
      console.warn("[CAPS] Temporal API missing. Fallback active.");
    if (!this.opfs) console.warn("[CAPS] OPFS missing. LocalStorage active.");
  },
});
