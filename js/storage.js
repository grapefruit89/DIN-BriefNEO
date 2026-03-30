/**
 * js/storage.js — Hybrid Storage Layer (Pure Edition)
 * [CMD-9] Preferred OPFS, Fallback LocalStorage (file://)
 * ─────────────────────────────────────────────────────────────
 */

import { Capabilities } from "./capabilities.js";

const STORE_KEY = "DIN-BriefNEO-State";

export const Storage = {
  /**
   * Speichert den State (Asynchron, um UI nicht zu blockieren)
   * @param {Object} state - Kanonisches JSON (IMR 4.0)
   */
  async save(state) {
    const data = JSON.stringify(state);

    // Primary: OPFS (wenn verfÃ¼gbar)
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        const file = await root.getFileHandle("state.json", { create: true });
        const writable = await file.createWritable();
        await writable.write(data);
        await writable.close();
        return;
      } catch (e) {
        console.warn(
          "[STORAGE] OPFS Save failed, falling back to LocalStorage.",
          e,
        );
      }
    }

    // Secondary: LocalStorage (file:// Baseline)
    localStorage.setItem(STORE_KEY, data);
  },

  /**
   * LÃ¤dt den State
   * @returns {Object|null}
   */
  async load() {
    // Primary: OPFS
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        const file = await root.getFileHandle("state.json");
        const handle = await file.getFile();
        const content = await handle.text();
        return JSON.parse(content);
      } catch (e) {
        // Ignorieren (z.B. Datei nicht vorhanden)
      }
    }

    // Secondary: LocalStorage
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * LÃ¶scht alle Daten (Reset)
   */
  async clear() {
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        await root.removeEntry("state.json");
      } catch (e) {}
    }
    localStorage.removeItem(STORE_KEY);
  },
};
