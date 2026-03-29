/**
 * js/ui/ui.js — v4.0 Core DOM Controller (Unified Fusion)
 * [CMD-1] Ghost-Mirror Structural Integrity (SPEC-066)
 * [CMD-4] EditContext Integration
 * [SPEC-075] Smart Deadlines & [SPEC-080] UI Persistency
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
    this._overflowDebounce = null;
    this._autocompleteDebounce = null;
  }

  init() {
    this._initEditors();
    this._bindNativeEvents();
    this._bindUtilityActions();
    this.addressService.init();

    // [SPEC-080] Smart-Night Logic
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

    console.info("🚀 v4.0 UI: Core Engine Active | SPEC-066 & 075 Enabled");
  }

  _initEditors() {
    IMR.filter((e) => e.editContext).forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (el) {
        this._editors[entry.tag] = new EditContextController(el, (text) => {
          this.sm.update(`content.${entry.key}`, text, "editcontext");
          if (this._ghosts[entry.tag]) {
            this._ghosts[entry.tag].update(text);
          }
          if (entry.key === "rect_ln" || entry.key === "rect_fn") {
            this._triggerSalutationUpdate();
          }
          // [SPEC-075] Smart Deadlines Trigger
          if (entry.key === "body" || entry.key === "date") {
            this._handleSmartDeadlines(el, entry.key, text);
          }
        });

        if (entry.tag === "din-text") {
          this._ghosts[entry.tag] = new GhostMirror("din-text", "din-text-mirror");
        }
      }
    });
  }

  _bindNativeEvents() {
    const paper = document.getElementById("paper");

    // Central Command Listener (Native Invokers & System Actions)
    document.addEventListener("command", (e) => {
      const command = e.command || e.detail?.command;
      const targetId = e.target?.getAttribute("commandfor") || e.detail?.targetId;

      if (command === "--print") window.print();
      if (command === "--export") this._handleExport();
      if (command === "--import") this._handleImport();
      if (command === "--export-logs") this._handleLogExport();
      if (command === "--history") if (this.io) this.io.requestHistory();
      if (command === "--reset-data") { localStorage.clear(); location.reload(); }
      if (command === "--toggle-guides" && paper) {
        paper.dataset.guides = paper.dataset.guides === "true" ? "false" : "true";
      }
      if (command === "show-modal" && targetId) document.getElementById(targetId)?.showModal();
      if (command === "close") (document.getElementById(targetId) || e.target.closest("dialog"))?.close();
      if (command === "show-popover" && targetId) document.getElementById(targetId)?.showPopover();
    });

    // UI State Persistency Bridge
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout") this.sm.update("config.layout", e.target.id === "layout-a" ? "form-a" : "form-b", "ui");
      if (e.target.name === "guides") this.sm.update("config.guides", e.target.value === "true", "ui");
      if (e.target.name === "theme") {
        this.sm.update("config.theme", e.target.value, "ui");
        this.sm.update("config.theme_manually_set", true, "ui");
      }
    });

    // Profile Management Logic
    this._initProfileManagement();

    // Radical Paste-Filter
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

    // Legacy Input Support (for fields without EditContext)
    document.addEventListener("input", (e) => {
      const tag = e.target.tagName.toLowerCase();
      const entry = IMR.find((et) => et.tag === tag);
      if (entry && !entry.editContext) {
        let text = e.target.textContent;
        if (!text || text.trim() === "" || text === "\n") {
          e.target.textContent = "";
          text = "";
        }
        this.sm.update(`content.${entry.key}`, text, "ui");
        if (entry.key === "rect_ln" || entry.key === "rect_fn") this._triggerSalutationUpdate();
      }
    });

    // Escape Key Guard
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.getElementById("popover-smart-deadlines")?.hidePopover();
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
          if (!this._validateImportSchema(data)) throw new Error("Schema Violation");
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

  _handleLogExport() {
    const url = FlightRecorder.exportLogs();
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `incident_logs_${Temporal.Now.plainDateISO().toString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

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

  _handleSmartDeadlines(el, key, text) {
    const context = Logic.detectContext(this.sm.state.content.body);
    const deadlines = Logic.calculateDeadlines();
    const popover = document.getElementById("popover-smart-deadlines");
    const list = document.getElementById("deadline-list");
    if (!popover || !list) return;

    if (key === "date" || (key === "body" && context !== "standard" && context !== "none")) {
      list.innerHTML = "";
      const options = [
        { label: "14 Tage", date: deadlines.in14Days, type: "14d" },
        { label: "30 Tage", date: deadlines.in30Days, type: "30d" },
        { label: "1 Monat", date: deadlines.nextMonth, type: "1m" }
      ];
      options.forEach(opt => {
        const item = document.createElement("div");
        item.className = "deadline-item";
        if ((context === "widerspruch" && opt.type === "14d") || (context === "mahnung" && opt.type === "30d")) item.classList.add("prominent");
        const dateStr = opt.date.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
        item.innerHTML = `<span class="label">${opt.label}</span> <span class="date">${dateStr}</span>`;
        item.onclick = (e) => {
          e.stopPropagation();
          if (key === "date") {
            el.textContent = dateStr;
            this.sm.update("content.date", dateStr, "ui");
          } else {
            this._insertTextAtCursor(el, `\n📅 Frist: ${dateStr} (${opt.label})\n`);
          }
          popover.hidePopover();
        };
        list.appendChild(item);
      });
      popover.style.positionAnchor = key === "date" ? "--anchor-date" : "--anchor-text";
      try { if (!popover.matches(":popover-open")) popover.showPopover(); } catch(e) {}
    } else {
      if (popover.matches(":popover-open")) popover.hidePopover();
    }
  }

  _insertTextAtCursor(el, text) {
    if (el.editContext) {
      const ec = el.editContext;
      ec.updateText(ec.selectionStart, ec.selectionStart, text);
      ec.updateSelection(ec.selectionStart + text.length, ec.selectionStart + text.length);
      this.sm.update("content.body", ec.text, "editcontext");
    } else {
      const sel = window.getSelection();
      if (sel.rangeCount) sel.getRangeAt(0).insertNode(document.createTextNode(text));
    }
  }

  _renderSuggestions(features, anchor) {
    this._closeAutocomplete();
    if (!features?.length) return;
    const list = document.createElement("div");
    list.className = "autocomplete-suggestions";
    if (anchor) list.style.setProperty("--suggestions-anchor", anchor);
    features.forEach((feature) => {
      const item = document.createElement("div");
      item.className = "autocomplete-suggestion";
      const p = feature.properties;
      item.innerHTML = `<strong>${p.name || p.formatted?.split(",")[0] || ""}</strong><span>${p.street ? ` ${p.street} ${p.housenumber || ""}, ${p.postcode} ${p.city}` : ` ${p.formatted}`}</span>`;
      item.onclick = () => this._selectAddress(feature);
      list.appendChild(item);
    });
    document.body.appendChild(list);
  }

  _selectAddress(feature) {
    const p = feature.properties;
    const name = p.name || p.formatted?.split(",")[0] || "";
    this.sm.update("content.rect_name", name, "ui");
    this.sm.update("content.rect_st", p.street ? `${p.street} ${p.housenumber || ""}` : "", "ui");
    this.sm.update("content.rect_city", p.postcode ? `${p.postcode} ${p.city}` : p.city || "", "ui");
    this._syncAllToDOM();
    this._closeAutocomplete();
    this._triggerSalutationUpdate();
  }

  _closeAutocomplete() { document.querySelector(".autocomplete-suggestions")?.remove(); }

  _validateImportSchema(data) {
    if (!data?.content || !data?.config) return false;
    const allowed = new Set(IMR.map(e => e.key));
    return Object.keys(data.content).every(k => allowed.has(k));
  }

  updateComplianceStatus(key, status, label) {
    const el = document.getElementById(key);
    if (!el) return;
    el.textContent = `${label}: `;
    const span = document.createElement("span");
    span.className = status === "ok" ? "status-ok" : status === "warn" ? "status-warn" : "status-err";
    span.textContent = `[${status.toUpperCase()}]`;
    el.appendChild(span);
  }

  _startNightWatchdog() {
    const scheduleNext = () => {
      if (this.sm.state.config.theme_manually_set) return;
      const ms = Logic.getMsUntilNextThemeTransition();
      this._nightTimer = setTimeout(() => {
        const target = Logic.isNightTime() ? "night" : "day";
        if (this.sm.state.config.theme !== target) {
          this.sm.update("config.theme", target, "auto-night");
          this._syncAllToDOM();
        }
        scheduleNext();
      }, ms + 1000);
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        const target = Logic.isNightTime() ? "night" : "day";
        if (!this.sm.state.config.theme_manually_set && this.sm.state.config.theme !== target) {
          this.sm.update("config.theme", target, "auto-night");
          this._syncAllToDOM();
          clearTimeout(this._nightTimer);
          scheduleNext();
        }
      }
    });
    scheduleNext();
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
