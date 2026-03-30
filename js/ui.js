/**
 * js/ui.js — KISS UI Controller (Pure Edition)
 * [ADR-016] Mirror Engine & Markdown Integration
 * ─────────────────────────────────────────────────────────────
 */

import * as Logic from "./logic.js";
import { parseMarkdown } from "./logic/markdown.js";
import { AddressService } from "./address-service.js";
import { IMR } from "./constants.js";
import { toast } from "./toast-manager.js";

export class UIController {
  constructor(sm) {
    this.sm = sm;
    this.addressService = new AddressService(sm, this);
  }

  init() {
    this._initEditors();
    this._bindNativeEvents();
    this._bindUtilityActions();
    this.addressService.init();

    this.sm.subscribe((path, val, scope, source) =>
      this._onStateChange(path, val, scope, source),
    );

    this._syncAllToDOM();
    console.info("🚀 UI: Pure Edition Active | KISS-Markdown Enabled");
  }

  /**
   * Initialisiert alle IMR-Felder (din-*)
   */
  _initEditors() {
    IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (!el) return;

      // Zentraler Input-Handler für alle din-Tags
      el.addEventListener("input", (e) => {
        const text = e.target.textContent;
        this.sm.update(`content.${entry.key}`, text, "ui");

        // Spezialfall: Markdown-Mirror für den Haupttext
        if (entry.tag === "din-text") {
          this._updateMirror(text);
        }

        // Spezialfall: Briefanrede-Vorschau
        if (entry.key === "rect_ln" || entry.key === "rect_fn") {
          this._triggerSalutationUpdate();
        }
      });
    });
  }

  _updateMirror(text) {
    const mirror = document.querySelector("din-text-mirror");
    if (mirror) {
      mirror.innerHTML = parseMarkdown(text);
    }
  }

  _bindNativeEvents() {
    // UI State Persistency Bridge (Layout, Theme, Guides)
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout")
        this.sm.update(
          "config.layout",
          e.target.id === "state-layout-a" ? "form-a" : "form-b",
          "ui",
        );
      if (e.target.name === "guides")
        this.sm.update("config.guides", e.target.value === "true", "ui");
      if (e.target.name === "theme")
        this.sm.update("config.theme", e.target.value, "ui");
    });

    // Native Print & Export Invokers
    document.addEventListener("command", (e) => {
      const cmd = e.command || e.detail?.command;
      if (cmd === "--print") window.print();
      if (cmd === "--export") this._handleExport();
    });
  }

  _onStateChange(path, value, scope, source) {
    if (source === "ui") return;

    // Alles synchronisieren bei State-Änderungen von außen (z.B. Load, Profile)
    this._syncAllToDOM();
  }

  _syncAllToDOM() {
    IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) {
        el.textContent = this.sm.state.content[entry.key] || "";

        // Mirror-Sync beim Laden
        if (entry.tag === "din-text") {
          this._updateMirror(el.textContent);
        }
      }
    });

    // Config Sync (Radios)
    const config = this.sm.state.config;
    if (config.theme) {
      const rb = document.getElementById(`theme-${config.theme}`);
      if (rb) rb.checked = true;
    }
    if (config.layout) {
      const rb = document.getElementById(
        config.layout === "form-a" ? "state-layout-a" : "state-layout-b",
      );
      if (rb) rb.checked = true;
    }
  }

  _triggerSalutationUpdate() {
    const fn = this.sm.state.content.rect_fn || "";
    const ln = this.sm.state.content.rect_ln || "";
    const recipientText = `${fn} ${ln}`.trim();
    const analysis = Logic.parseRecipient(recipientText);
    const salutationEl = document.querySelector("din-anrede");
    if (salutationEl) {
      Logic.updateSalutationHint(
        salutationEl,
        analysis,
        this.sm.state.config.formality || "formal",
        "none",
        recipientText,
      );
      this.sm.update("content.salutation", salutationEl.textContent, "engine");
    }
  }

  _handleExport() {
    const data = JSON.stringify(this.sm.serialize(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DIN-BriefNEO_Export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show("export_success");
  }

  _bindUtilityActions() {}
}
