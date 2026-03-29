/**
 * js/ui/ui.js — v4.0 Platinum DOM Controller
 * [CMD-1] Ghost-Mirror Structural Integrity (SPEC-066)
 * [CMD-4] EditContext Integration
 * [SPEC-080] Zero-JS UI Persistency
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as Logic from "../logic/logic.js";
import { EditContextController } from "../core/edit-context-controller.js";
import { GhostMirror } from "./ghost-mirror.js";
import { AddressService } from "../services/address-service.js";
import { FlightRecorder } from "../logic/flight-recorder.js";
import { IMR, CORE_SANITIZER } from "../core/constants.js";
import { toast } from "./toast-manager.js";

export class UIController {
  constructor(sm) {
    this.sm = sm;
    this._editors = {};
    this._ghosts = {};
    this.addressService = new AddressService(sm, this);
    this._nightTimer = null;
  }

  init() {
    this._initEditors();
    this._bindNativeEvents();
    this._bindUtilityActions();
    this.addressService.init();

    // Theme Management
    if (!this.sm.state.config.theme_manually_set) {
      const isNight = Logic.isNightTime();
      this.sm.state.config.theme = isNight ? "night" : "day";
    }

    this.sm.subscribe((path, val, scope, source) =>
      this._onStateChange(path, val, scope, source),
    );
    
    this._syncAllToDOM();
    this._startNightWatchdog();
    this._initKeyboardShortcuts();

    console.info("🚀 v4.0 UI: Platinum Engine Active | SPEC-066 Enabled");
  }

  _initEditors() {
    IMR.filter((e) => e.editContext).forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (el) {
        // EditContext for pure input buffer
        this._editors[entry.tag] = new EditContextController(el, (text) => {
          this.sm.update(`content.${entry.key}`, text, "editcontext");
          if (this._ghosts[entry.tag]) {
            this._ghosts[entry.tag].update(text);
          }
          if (entry.key === "rect_ln" || entry.key === "rect_fn") {
            this._triggerSalutationUpdate();
          }
        });

        // Ghost-Mirror for structural rendering (SPEC-066)
        if (entry.tag === "din-text") {
          this._ghosts[entry.tag] = new GhostMirror("din-text", "din-text-mirror");
        }
      }
    });
  }

  _bindNativeEvents() {
    const paper = document.getElementById("paper");

    // Central Command Listener (Native Invokers)
    document.addEventListener("command", (e) => {
      const command = e.command || e.detail?.command;
      const targetId = e.target?.getAttribute("commandfor") || e.detail?.targetId;

      if (command === "--print") window.print();
      if (command === "--export") this._handleExport();
      if (command === "--import") this._handleImport();
      if (command === "--reset-data") { localStorage.clear(); location.reload(); }
      if (command === "--toggle-guides" && paper) {
        paper.dataset.guides = paper.dataset.guides === "true" ? "false" : "true";
      }
      if (command === "show-modal" && targetId) document.getElementById(targetId)?.showModal();
      if (command === "close") (document.getElementById(targetId) || e.target.closest("dialog"))?.close();
      if (command === "show-popover" && targetId) document.getElementById(targetId)?.showPopover();
    });

    // UI State Persistency Bridge (Layout/Theme/Guides)
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout") this.sm.update("config.layout", e.target.id === "layout-a" ? "form-a" : "form-b", "ui");
      if (e.target.name === "guides") this.sm.update("config.guides", e.target.value === "true", "ui");
      if (e.target.name === "theme") {
        this.sm.update("config.theme", e.target.value, "ui");
        this.sm.update("config.theme_manually_set", true, "ui");
      }
    });

    // Profile Management
    this._initProfileManagement();

    // Radical Paste-Filter (High-Integrity)
    document.addEventListener("paste", (e) => {
      const el = e.target;
      if (el.hasAttribute("contenteditable") || el.editContext) {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
        if (el.editContext) {
          const ec = el.editContext;
          ec.updateText(ec.selectionStart, ec.selectionEnd, text);
          ec.updateSelection(ec.selectionStart + text.length, ec.selectionStart + text.length);
          const entry = IMR.find(t => t.tag === el.tagName.toLowerCase());
          if (entry) {
            this.sm.update(`content.${entry.key}`, ec.text, "editcontext");
            this._ghosts[el.tagName.toLowerCase()]?.update(ec.text);
          }
        } else {
          document.execCommand("insertText", false, text);
        }
      }
    });
  }

  _initProfileManagement() {
    const modal = document.getElementById("modal-profile");
    if (!modal) return;

    const profileSelect = document.getElementById("profileSelect");
    const btnSave = document.getElementById("btn-profile-save");
    const ibanInput = document.getElementById("p-iban");

    ibanInput?.addEventListener("input", (e) => {
      const val = e.target.value.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      e.target.value = val.match(/.{1,4}/g)?.join(" ") || val;
      e.target.style.borderColor = val.length > 0 ? (Logic.validateIBAN(val) ? "#4CAF50" : "#f44336") : "#ddd";
    });

    profileSelect?.addEventListener("change", (e) => {
      const profiles = this.sm.state.config.profiles || {};
      const data = profiles[e.target.value];
      if (data) {
        // [CMD-1] Fixed: Correct ID mapping for Profile Modal
        document.getElementById("p-fn").value = data.fn || "";
        document.getElementById("p-ln").value = data.ln || "";
        document.getElementById("p-co").value = data.co || "";
        document.getElementById("p-street").value = data.street || "";
        document.getElementById("p-city").value = data.city || "";
        document.getElementById("p-iban").value = data.iban || "";
        ibanInput?.dispatchEvent(new Event("input"));
      }
    });

    btnSave?.addEventListener("click", () => {
      const fn = document.getElementById("p-fn")?.value || "";
      const ln = document.getElementById("p-ln")?.value || "";
      const data = {
        fn, ln,
        name: `${fn} ${ln}`.trim(),
        co: document.getElementById("p-co")?.value,
        street: document.getElementById("p-street")?.value,
        city: document.getElementById("p-city")?.value,
        iban: document.getElementById("p-iban")?.value,
      };
      const key = profileSelect?.value || "default";
      if (!this.sm.state.config.profiles) this.sm.state.config.profiles = {};
      this.sm.state.config.profiles[key] = data;

      this.sm.update("content.sender_fn", data.fn, "profile");
      this.sm.update("content.sender_ln", data.ln, "profile");
      this.sm.update("content.sender_st", data.street, "profile");
      this.sm.update("content.sender_city", data.city, "profile");
      this.sm.update("content.return_line", Logic.deriveReturnLine(data), "profile");

      this._syncAllToDOM();
      modal.hidePopover();
      toast.show("profile_saved");
    });
  }

  _bindUtilityActions() {
    document.getElementById("file-import")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const data = JSON.parse(re.target.result);
          this.sm.load(data);
          toast.show("import_success");
          setTimeout(() => location.reload(), 1000);
        } catch (err) { toast.show("import_error"); }
      };
      reader.readAsText(file);
    });
  }

  _handleExport() {
    const data = JSON.stringify(this.sm.serialize(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DIN-BriefNEO_Export_${Temporal.Now.plainDateISO().toString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show("export_success");
  }

  _handleImport() { document.getElementById("file-import")?.click(); }

  _onStateChange(path, value, scope, source) {
    if (source === "editcontext") return;
    if (["opfs", "load", "config"].includes(scope)) { this._syncAllToDOM(); return; }

    const key = path.split(".").pop();
    const entry = IMR.find(e => e.key === key);
    if (entry) {
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) this._updateDOMSafe(el, value);
    }
  }

  _syncAllToDOM() {
    IMR.forEach(entry => {
      const el = document.querySelector(entry.tag);
      if (el) this._updateDOMSafe(el, this.sm.state.content[entry.key]);
    });

    const config = this.sm.state.config;
    if (config.theme) {
      const rb = document.getElementById(`theme-${config.theme}`);
      if (rb) rb.checked = true;
    }
    if (config.layout) {
      const rb = document.getElementById(config.layout === "form-a" ? "layout-a" : "layout-b");
      if (rb) rb.checked = true;
      const paper = document.getElementById('paper');
      if (paper) paper.dataset.form = config.layout === 'form-a' ? 'A' : 'B';
    }
    const guidesRb = document.getElementById(config.guides ? "guides-on" : "guides-off");
    if (guidesRb) guidesRb.checked = true;
  }

  _updateDOMSafe(el, value) {
    if (!el) return;
    const text = value || "";

    if (el.editContext) {
      if (typeof el.editContext.updateText === "function") {
        el.editContext.updateText(0, el.editContext.text.length, text);
        el.editContext.updateSelection(0, 0);
      }
      el.textContent = text;
      this._ghosts[el.tagName.toLowerCase()]?.update(text);
      return;
    }

    if (el.setHTML && CORE_SANITIZER) {
      el.setHTML(text, { sanitizer: CORE_SANITIZER });
    } else {
      el.textContent = text;
    }
  }

  _triggerSalutationUpdate() {
    const fn = this.sm.state.content.rect_fn || "";
    const ln = this.sm.state.content.rect_ln || "";
    const recipientText = `${fn} ${ln}`.trim();
    const analysis = Logic.parseRecipient(recipientText);
    const salutationEl = document.querySelector("din-anrede");
    if (salutationEl) {
      Logic.updateSalutationHint(salutationEl, analysis, this.sm.state.config.formality || "formal", "none", recipientText);
      this.sm.update("content.salutation", salutationEl.textContent, "engine");
    }
  }

  _startNightWatchdog() {
    const schedule = () => {
      if (this.sm.state.config.theme_manually_set) return;
      const ms = Logic.getMsUntilNextThemeTransition();
      this._nightTimer = setTimeout(() => {
        const target = Logic.isNightTime() ? "night" : "day";
        if (this.sm.state.config.theme !== target) {
          this.sm.update("config.theme", target, "auto-night");
          this._syncAllToDOM();
        }
        schedule();
      }, ms + 1000);
    };
    schedule();
  }

  _initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "s") { e.preventDefault(); this._handleExport(); }
      if (e.ctrlKey && e.key === "p") { e.preventDefault(); window.print(); }
      if (e.altKey && e.key === "1") { e.preventDefault(); document.querySelector("din-subject")?.focus(); }
      if (e.altKey && e.key === "2") { e.preventDefault(); document.querySelector("din-text")?.focus(); }
    });
  }
}
