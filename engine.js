/**
 * engine.js — Core Engine (State & Persistence)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
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
      } catch (e) {}
    }
    localStorage.setItem(STORE_KEY, data);
  },

  async load() {
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        const file = await root.getFileHandle("state.json");
        const handle = await file.getFile();
        const content = await handle.text();
        return JSON.parse(content);
      } catch (e) {}
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
  constructor(initialState = null) {
    this.state = initialState || {
      content: {},
      config: { layout: "form-b", theme: "day", guides: true }
    };
    this._listeners = new Set();
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

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
