/**
 * ui.js — Unified UI Controller (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

import * as Logic from "./logic.js";

/* ── TOAST SYSTEM ─────────────────────────────────────────── */

export const Toast = {
  show(message, type = "info") {
    const el = document.getElementById("toast-v4");
    if (!el) return;
    el.textContent = message;
    el.className = `toast-container type-${type}`;
    try {
      el.showPopover();
      setTimeout(() => el.hidePopover(), 3000);
    } catch (e) {}
  }
};

/* ── ADDRESS SERVICE ──────────────────────────────────────── */

export class AddressService {
  constructor(ui) {
    this.ui = ui;
    this._debounce = null;
  }
  init() {
    const el = document.querySelector("din-empfaenger-strasse");
    if (!el) return;
    el.addEventListener("input", (e) => {
      clearTimeout(this._debounce);
      const query = e.target.textContent;
      if (query.length < 3) return;
      this._debounce = setTimeout(async () => {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=3`);
        const data = await res.json();
        console.log("Suggestions:", data.features);
      }, 300);
    });
  }
}

/* ── UI CONTROLLER ────────────────────────────────────────── */

export class UIController {
  constructor(sm) {
    this.sm = sm;
    this.address = new AddressService(this);
  }

  init() {
    this._initInputs();
    this._initControls();
    this.address.init();
    this.sm.subscribe((path, val) => this._onStateChange(path, val));
    this._syncAll();
    
    // DevMode Toggle (KISS)
    document.getElementById("app-version")?.addEventListener("click", () => {
       const isDev = localStorage.getItem("neo_dev_mode") === "true";
       localStorage.setItem("neo_dev_mode", !isDev);
       location.reload();
    });
  }

  _initInputs() {
    Logic.IMR.forEach(entry => {
      const el = document.querySelector(entry.tag);
      if (!el) return;
      el.addEventListener("input", (e) => {
        const text = e.target.textContent;
        this.sm.update(`content.${entry.key}`, text, "ui");
        if (entry.tag === "din-text") {
          const mirror = document.querySelector("din-text-spiegel");
          if (mirror) mirror.innerHTML = Logic.parseMarkdown(text);
        }
      });
    });
  }

  _initControls() {
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout") this.sm.update("config.layout", e.target.id === "state-layout-a" ? "form-a" : "form-b");
      if (e.target.name === "theme") this.sm.update("config.theme", e.target.value);
      if (e.target.name === "guides") this.sm.update("config.guides", e.target.value === "true");
    });
    
    document.addEventListener("command", (e) => {
      const cmd = e.command || e.detail?.command;
      if (cmd === "--print") window.print();
      if (cmd === "--export") this._handleExport();
      if (cmd === "--format-bold") this._wrapSelection("**", "**");
      if (cmd === "--format-underline") this._wrapSelection("__", "__");
      if (cmd === "--format-quote") this._wrapSelection("> ", "");
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      if (!document.activeElement.matches("din-text")) return;
      if (e.ctrlKey && e.key === "b") { e.preventDefault(); this._wrapSelection("**", "**"); }
      if (e.ctrlKey && e.key === "u") { e.preventDefault(); this._wrapSelection("__", "__"); }
    });
  }

  _wrapSelection(before, after) {
    const el = document.activeElement;
    if (!el.matches("din-text")) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const newText = before + selectedText + after;
    
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
    
    // Trigger Input-Event for Sync
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  _onStateChange(path, val) {
     this._syncAll();
  }

  _syncAll() {
    Logic.IMR.forEach(entry => {
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) {
        el.textContent = this.sm.state.content[entry.key] || "";
        if (entry.tag === "din-text") {
           const mirror = document.querySelector("din-text-spiegel");
           if (mirror) mirror.innerHTML = Logic.parseMarkdown(el.textContent);
        }
      }
    });
  }

  _handleExport() {
    const data = JSON.stringify(this.sm.state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DIN-BriefNEO.json";
    a.click();
    Toast.show("Export erfolgreich!");
  }
}
