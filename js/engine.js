/**
 * engine.js — Core Engine (State & Persistence)
 * [ADR-017] Flat & Pure Architecture
 * @module engine
 */

/* ── CAPABILITIES ─────────────────────────────────────────── */

export const Capabilities = Object.freeze({
  temporal: !!globalThis.Temporal,
  opfs: !!globalThis.navigator?.storage?.getDirectory,
  isLocalFile: window.location.protocol === "file:",
  isSecureContext: window.isSecureContext,
  logStatus() {
    const status = this.isLocalFile ? "📂 FILE-MODE (Local)" : "🌐 WEB-MODE (Secure)";
    console.info(`%c[ENGINE] ${status}`, "font-weight: bold; color: #4ade80;");
  }
});

/* ── HYBRID STORAGE ───────────────────────────────────────── */

const STORE_KEY = "DIN-BriefNEO-State-v4.1";

export const Storage = {
  /**
   * Speichert State – bevorzugt OPFS, fallback localStorage
   * @param {Object} state - Zu speichernder Zustand
   */
  async save(state) {
    const data = JSON.stringify(state);
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        const file = await root.getFileHandle("state.json", { create: true });
        const writable = await file.createWritable();
        await writable.write(data);
        await writable.close();
        return;
      } catch (e) {
        console.warn("[ENGINE] OPFS save failed, falling back to localStorage", e);
      }
    }
    localStorage.setItem(STORE_KEY, data);
  },

  /**
   * Lädt State – bevorzugt OPFS, fallback localStorage
   * @returns {Promise<Object|null>}
   */
  async load() {
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        const file = await root.getFileHandle("state.json");
        const handle = await file.getFile();
        const content = await handle.text();
        return JSON.parse(content);
      } catch (e) {
        console.warn("[ENGINE] OPFS load failed, falling back to localStorage", e);
      }
    }
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async clear() {
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        await root.removeEntry("state.json");
      } catch (e) {}
    }
    localStorage.removeItem(STORE_KEY);
  }
};

/* ── STATE MANAGEMENT ─────────────────────────────────────── */

export class StateManager {
  /**
   * @param {Object} initialState - Initialer Zustand
   */
  constructor(initialState = null) {
    this.state = initialState || {
      content: {},
      profile: {},
      config: { 
        layout: "form-b", 
        theme: "day", 
        guides: false,
        reference: true,
        qr: false,
        recipientType: "none",
        formality: "formal",
        addressProvider: "photon",
        geoapifyKey: ""
      }
    };
    this._listeners = new Set();
  }

  /**
   * Abonniert State-Änderungen
   * @param {Function} fn - Callback (path, value, domain, source)
   * @returns {Function} Unsubscribe-Funktion
   */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /**
   * Aktualisiert einen State-Pfad
   * @param {string} path - Dot-Notation Pfad (z.B. "config.theme")
   * @param {any} value - Neuer Wert
   * @param {string} source - Quelle der Änderung ("ui" | "system" | "sync")
   */
  update(path, value, source = "ui") {
    const parts = path.split(".");
    let current = this.state;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    this._listeners.forEach(fn => fn(path, value, parts[0], source));
  }
}
