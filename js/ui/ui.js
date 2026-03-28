/**
 * js/ui/ui.js â€” v4.0 DOM Controller (V20)
 * [CMD-1] Ghost-Mirror Structural Integrity
 * [CMD-2] Scoped View Transitions (Chrome 147)
 * [CMD-4] EditContext Integration
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    this._overflowDebounce = null;
    this._autocompleteDebounce = null;
  }

  init() {
    this._initEditors();
    this._bindNativeEvents();
    this._bindUtilityActions();
    this.addressService.init();

    // [SPEC-080] Smart-Night Logic: Auto-Toggle at 21:00
    if (!this.sm.state.config.theme_manually_set) {
      const isNight = Logic.isNightTime();
      if (isNight && this.sm.state.config.theme !== "night") {
        toast.show("night_mode_auto");
      }
      this.sm.state.config.theme = isNight ? "night" : "day";
    }

    this.sm.subscribe((path, val, scope, source) =>
      this._onStateChange(path, val, scope, source),
    );
    this._syncAllToDOM();
    this._startNightWatchdog(); // [SPEC-080] Start real-time observer

    document.addEventListener("command", (e) => {
      const { command } = e.detail || { command: e.command };
      if (command === "--export") this._handleExport();
      if (command === "--import") this._handleImport();
      if (command === "--history") if (this.io) this.io.requestHistory();
      if (command === "--export-logs") this._handleLogExport();
    });
    console.info("ðŸš€ v4.0 UI: Sanitizer & Ghost-Mirror Active");
  }

  _bindUtilityActions() {
    // [A-2] Native label for file-import handles the trigger. 
    // We only need the change listener for the actual processing.
    const fileImport = document.getElementById("file-import");
    if (fileImport) {
      fileImport.addEventListener("change", (e) => this._handleImportFile(e));
    }

    // Reset Confirm (Legacy Fallback if command event fails)
    const btnResetConfirm = document.getElementById("btn-reset-confirm");
    if (btnResetConfirm) {
      btnResetConfirm.addEventListener("click", () => {
        localStorage.clear();
        location.reload();
      });
    }
  }

  _handleExport() {
    const data = JSON.stringify(this.sm.serialize(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = Temporal.Now.plainDateISO(Temporal.Now.timeZoneId()).toString();
    a.download = `DIN-BriefNEO_Export_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show("export_success");
  }

  _handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      try {
        const data = JSON.parse(re.target.result);
        if (!this._validateImportSchema(data)) throw new Error("Schema Violation");
        this.sm.load(data);
        toast.show("import_success");
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        toast.show("import_error");
      }
    };
    reader.readAsText(file);
  }

  _initEditors() {
    IMR.filter((e) => e.editContext).forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (el) {
        // [CMD-4] EditContext for pure input
        this._editors[entry.tag] = new EditContextController(el, (text) => {
          this.sm.update(`content.${entry.key}`, text, "editcontext");

          // [CMD-1] Sync Ghost-Mirror (Structural)
          if (this._ghosts[entry.tag]) {
            this._ghosts[entry.tag].update(text);
          }

          // [CMD-5] v4.0 Salutation Engine: Reactive update on Last Name change
          if (entry.key === "rect_ln" || entry.key === "rect_fn") {
              this._triggerSalutationUpdate();
          }
        });

        // [SIGNAL-POC] Native Reativity: Subscribe to Signal updates
        if (this.sm.signals[entry.key]) {
          this.sm.signals[entry.key].subscribe((val) => {
            // Update only if not focused to avoid cursor jumping
            if (document.activeElement !== el) {
              this._updateDOMSafe(el, val);
            }
          });
        }

        // [CMD-1] Ghost-Mirror for structural markdown rendering
        if (entry.tag === "din-text") {
          this._ghosts[entry.tag] = new GhostMirror(
            "din-text",
            "din-text-mirror",
          );
        }
      }
    });
  }

  /**
   * [CMD-5] v4.0 Salutation Engine: Orchestrates the reactive update.
   */
  _triggerSalutationUpdate() {
    const fn = this.sm.state.content.rect_fn || "";
    const ln = this.sm.state.content.rect_ln || "";
    const recipientText = `${fn} ${ln}`.trim();

    const analysis = Logic.parseRecipient(recipientText);
    const salutationEl = document.querySelector("din-anrede");
    if (salutationEl) {
      const formality = this.sm.state.config.formality || "formal";
      Logic.updateSalutationHint(
        salutationEl,
        analysis,
        formality,
        "none",
        recipientText,
      );

      const newSalutation = salutationEl.textContent;
      this.sm.update("content.salutation", newSalutation, "engine");
    }
  }

  _updateDOMSafe(el, value) {
    if (!el) return;

    if (el.editContext) {
      const text = value || "";
      // Keep buffer in sync
      if (typeof el.editContext.updateText === "function") {
        el.editContext.updateText(0, el.editContext.text.length, text);
        el.editContext.updateSelection(0, 0);
      }
      el.textContent = text;

      // [CMD-1] Mirror rehydration
      const tag = el.tagName.toLowerCase();
      if (this._ghosts[tag]) {
        this._ghosts[tag].update(text);
      }
      return;
    }

    if (el.setHTML && CORE_SANITIZER) {
      el.setHTML(value || "", { sanitizer: CORE_SANITIZER });
    } else {
      el.textContent = value || "";
    }
  }

  _onStateChange(path, value, scope, source) {
    if (source === "editcontext") return;

    if (scope === "opfs" || scope === "load") {
      this._syncAllToDOM();
      return;
    }

    const key = path.split(".").pop();
    const entry = IMR.find((e) => e.key === key);
    if (entry) {
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) {
        this._updateDOMSafe(el, value);
      }
    }
  }

  _syncAllToDOM() {
    IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (el) {
        this._updateDOMSafe(el, this.sm.state.content[entry.key]);
      }
    });

    // [SPEC-080] Sync UI Toggles (Theme, Layout, Guides) from State
    const config = this.sm.state.config;
    
    // Theme
    if (config.theme) {
      const themeRadio = document.getElementById(`theme-${config.theme}`);
      if (themeRadio) themeRadio.checked = true;
    }

    // Layout
    if (config.layout) {
      const layoutRadio = document.getElementById(config.layout === "form-a" ? "layout-a" : "layout-b");
      if (layoutRadio) layoutRadio.checked = true;
    }

    // Guides
    const guidesRadio = document.getElementById(config.guides ? "guides-on" : "guides-off");
    if (guidesRadio) guidesRadio.checked = true;
  }

  _bindNativeEvents() {
    // â”€â”€ Button Actions (Pure JS Logic separation) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // Absender-Profil
    const btnProfile = document.getElementById("btn-profile");
    const modalProfile = document.getElementById("modal-profile");
    if (btnProfile && modalProfile) {
      btnProfile.addEventListener("click", () => modalProfile.showPopover());
    }
    const btnProfileClose = document.getElementById("btn-profile-close");
    if (btnProfileClose && modalProfile) {
      btnProfileClose.addEventListener("click", () =>
        modalProfile.hidePopover(),
      );
    }

    // Reset Entwurf
    const btnReset = document.getElementById("btn-reset");
    const dialogReset = document.getElementById("dialog-reset");
    if (btnReset && dialogReset) {
      btnReset.addEventListener("click", () => dialogReset.showModal());
    }
    const btnResetCancel = document.getElementById("btn-reset-cancel");
    if (btnResetCancel && dialogReset) {
      btnResetCancel.addEventListener("click", () => dialogReset.close());
    }

    // Print
    const btnPrint = document.getElementById("btn-print");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => window.print());
    }

    // Decoder
    const btnDecoder = document.getElementById("btn-decoder-trigger");
    const dialogDecoder = document.getElementById("dialog-decoder");
    if (btnDecoder && dialogDecoder) {
      btnDecoder.addEventListener("click", () => dialogDecoder.showModal());
    }
    const btnDecoderClose = document.getElementById("btn-decoder-close");
    if (btnDecoderClose && dialogDecoder) {
      btnDecoderClose.addEventListener("click", () => dialogDecoder.close());
    }

    // Central Command Listener
    document.addEventListener("command", (e) => {
      const command = e.command || e.detail?.command;
      const targetId =
        e.target?.getAttribute("commandfor") || e.detail?.targetId;

      console.debug(`[UI] Command received: ${command} for ${targetId}`);

      if (command === "--print") {
        window.print();
      }

      if (command === "show-modal") {
        const dialog = document.getElementById(targetId);
        if (dialog) dialog.showModal();
      }

      if (command === "close") {
        const dialog =
          document.getElementById(targetId) || e.target.closest("dialog");
        if (dialog) dialog.close();
      }

      if (
        command === "show-popover" ||
        command === "hide-popover" ||
        command === "toggle-popover"
      ) {
        const popover = document.getElementById(targetId);
        if (popover) {
          if (command === "show-popover") popover.showPopover();
          else if (command === "hide-popover") popover.hidePopover();
          else popover.togglePopover();
        }
      }

      if (command === "--toggle-guides") {
        const paper = document.getElementById("paper");
        if (paper) {
          const isGuidesOn = paper.dataset.guides === "true";
          paper.dataset.guides = isGuidesOn ? "false" : "true";
        }
      }
    });

    // Fallback click listener for Print
    const btnPrint = document.getElementById("btn-print");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => {
        console.info("[UI] Print button clicked. Triggering window.print()");
        window.print();
      });
    }

    // Profil-Management (High-Integrity Popover Logic)
    const modalProfile = document.getElementById("modal-profile");
    if (modalProfile) {
      const profileSelect = document.getElementById("profileSelect");
      const btnSave = document.getElementById("btn-profile-save");
      const ibanInput = document.getElementById("p-iban");

      // [CMD-4] Native IBAN Formatting
      if (ibanInput) {
        ibanInput.addEventListener("input", (e) => {
          let value = e.target.value.replace(/\s+/g, "").toUpperCase();
          // Nur Alphanumerisch
          value = value.replace(/[^A-Z0-9]/g, "");
          let formatted = value.match(/.{1,4}/g)?.join(" ") || value;

          // Cursor position handling (simple)
          const start = e.target.selectionStart;
          e.target.value = formatted;

          const isValid = Logic.validateIBAN(value);
          ibanInput.style.borderColor =
            value.length > 0 ? (isValid ? "#4CAF50" : "#f44336") : "#ddd";
        });
      }

      // Mapping helper
      const getProfileData = () => ({
        name: document.getElementById("p-name").value,
        co: document.getElementById("p-co").value,
        street: document.getElementById("p-street").value,
        city: document.getElementById("p-city").value,
        iban: document.getElementById("p-iban").value,
      });

      const setProfileData = (data) => {
        document.getElementById("p-name").value = data.name || "";
        document.getElementById("p-co").value = data.co || "";
        document.getElementById("p-street").value = data.street || "";
        document.getElementById("p-city").value = data.city || "";
        document.getElementById("p-iban").value = data.iban || "";
        // Trigger format
        if (ibanInput) ibanInput.dispatchEvent(new Event("input"));
      };

      // Profile Selection
      profileSelect.addEventListener("change", (e) => {
        const key = e.target.value;
        if (!key) return;

        const profiles = this.sm.state.config.profiles || {};
        if (profiles[key]) {
          setProfileData(profiles[key]);
        }
      });

      // Profile Save & Apply
      btnSave.addEventListener("click", () => {
        const data = getProfileData();
        const key = profileSelect.value || "default";

        // Save to Config
        if (!this.sm.state.config.profiles) this.sm.state.config.profiles = {};
        this.sm.state.config.profiles[key] = data;

        // Apply to Document (IMR 4.0 Granular Atoms)
        const [firstName, ...lastNameParts] = (data.name || "").split(" ");
        const lastName = lastNameParts.join(" ");

        this.sm.update("content.sender_fn", firstName, "profile");
        this.sm.update("content.sender_ln", lastName, "profile");
        this.sm.update("content.sender_st", data.street, "profile");
        this.sm.update("content.sender_city", data.city, "profile");

        const returnLine = Logic.deriveReturnLine({
          name: data.name,
          co: data.co,
          street: data.street,
          zipCity: data.city,
        });
        this.sm.update("content.return_line", returnLine, "profile");

        // Sync to DOM via global re-sync
        this._syncAllToDOM();

        modalProfile.hidePopover();
      });
    }

    // [SPEC-080] UI State Persistency Bridge
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout") this.sm.state.config.layout = e.target.id === "layout-a" ? "form-a" : "form-b";
      if (e.target.name === "guides") this.sm.state.config.guides = e.target.value === "true";
      if (e.target.name === "theme") this.sm.state.config.theme = e.target.value;
    });

    const dialogReset = document.getElementById("dialog-reset");
    if (dialogReset) {
      dialogReset.addEventListener("command", (e) => {
        if (e.command === "--reset-data") {
          localStorage.clear();
          location.reload();
        }
      });
    }

    // [MANDATE-PASTE] The Radical Paste-Filter (High-Integrity)
    document.addEventListener("paste", (e) => {
      const el = e.target;
      const isContentEditable =
        el.hasAttribute("contenteditable") || el.editContext;

      if (isContentEditable) {
        e.preventDefault();
        // Nur Plaintext extrahieren (Atomic Filter)
        const text = e.clipboardData
          .getData("text/plain")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

        if (el.editContext) {
          const ec = el.editContext;
          const start = ec.selectionStart;
          const end = ec.selectionEnd;
          ec.updateText(start, end, text);
          ec.updateSelection(start + text.length, start + text.length);

          const tag = el.tagName.toLowerCase();
          const entry = IMR.find((et) => et.tag === tag);
          if (entry) {
            this.sm.update(`content.${entry.key}`, ec.text, "editcontext");
            if (this._ghosts[tag]) this._ghosts[tag].update(ec.text);
          }
        } else {
          // Manual Plaintext Insertion (execCommand replacement)
          const selection = window.getSelection();
          if (selection.rangeCount) {
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
            selection.collapseToEnd();
          }
        }
        console.info(
          "ðŸ›¡ï¸ Paste Gatekeeper: HTML-Injection prevented. Plaintext only.",
        );
      }
    });

    document.addEventListener("input", (e) => {
      const tag = e.target.tagName.toLowerCase();
      const entry = IMR.find((et) => et.tag === tag);
      if (entry) {
        let text = e.target.textContent;

        if (!entry.editContext) {
          this.sm.state.content[entry.key] = text;
        }
        // Trigger Greetings Matrix on recipient change
        if (entry.key === "rect_name") {
          this._triggerSalutationUpdate(text);
        }

        // [SPEC-075] Smart Deadlines Trigger
        if (entry.key === "body" || entry.key === "date") {
          this._handleSmartDeadlines(el, entry.key, text);
        }
      }
    });

    // [SPEC-076] Escape key for popovers
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const popover = document.getElementById("popover-smart-deadlines");
        if (popover) popover.hidePopover();
      }
    });
  }

  _handleSmartDeadlines(el, key, text) {
    const context = Logic.detectContext(this.sm.state.content.body);
    const deadlines = Logic.calculateDeadlines();
    const popover = document.getElementById("popover-smart-deadlines");
    const list = document.getElementById("deadline-list");

    if (!popover || !list) return;

    // Show only for date field or if a specific context (like Widerspruch/Mahnung) is detected
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
        
        // Highlight logic based on detected context
        if ((context === "widerspruch" && opt.type === "14d") || 
            (context === "mahnung" && opt.type === "30d")) {
          item.classList.add("prominent");
        }

        const dateStr = opt.date.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
        item.innerHTML = `<span class="label">${opt.label}</span> <span class="date">${dateStr}</span>`;
        
        item.onclick = (e) => {
          e.stopPropagation();
          if (key === "date") {
            el.textContent = dateStr;
            this.sm.update("content.date", dateStr, "ui");
            toast.show("deadline_set", { date: dateStr });
          } else {
            const snippet = `\n📅 Frist: ${dateStr} (${opt.label})\n`;
            this._insertTextAtCursor(el, snippet);
            toast.show("deadline_set", { date: dateStr });
          }
          popover.hidePopover();
        };
        list.appendChild(item);
      });

      // Update position dynamically based on current field
      popover.style.positionAnchor = key === "date" ? "--anchor-date" : "--anchor-text";
      
      try {
        if (!popover.matches(":popover-open")) popover.showPopover();
      } catch(e) {}
    } else {
      if (popover.matches(":popover-open")) popover.hidePopover();
    }
  }

        _insertTextAtCursor(el, text) {
        if (el.editContext) {
        const ec = el.editContext;
        const start = ec.selectionStart;
        ec.updateText(start, start, text);
        ec.updateSelection(start + text.length, start + text.length);
        this.sm.update("content.body", ec.text, "editcontext");
        } else {
        const sel = window.getSelection();
        if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.insertNode(document.createTextNode(text));
        }
        }
        }

  /* â”€â”€ ðŸ“ AUTOCOMPLETE UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  _renderSuggestions(features, anchor) {
    this._closeAutocomplete();
    if (!features || features.length === 0) return;

    const list = document.createElement("div");
    list.className = "autocomplete-suggestions";
    if (anchor) {
      list.style.setProperty("--suggestions-anchor", anchor);
    }

    features.forEach((feature) => {
      const item = document.createElement("div");
      item.className = "autocomplete-suggestion";

      const p = feature.properties;
      const strong = document.createElement("strong");
      strong.textContent =
        p.name || (p.formatted ? p.formatted.split(",")[0] : "");
      item.appendChild(strong);

      const sub = document.createElement("span");
      sub.textContent = p.street
        ? ` ${p.street} ${p.housenumber || ""}, ${p.postcode} ${p.city}`
        : ` ${p.formatted}`;
      item.appendChild(sub);

      item.onclick = () => this._selectAddress(feature);
      list.appendChild(item);
    });
    document.body.appendChild(list);
  }

  _selectAddress(feature) {
    const p = feature.properties;
    
    const name = p.name || (p.formatted ? p.formatted.split(",")[0] : "");
    const street = p.street ? `${p.street} ${p.housenumber || ""}` : "";
    const city = p.postcode ? `${p.postcode} ${p.city}` : p.city || "";

    this.sm.update("content.rect_name", name, "ui");
    this.sm.update("content.rect_st", street, "ui");
    this.sm.update("content.rect_city", city, "ui");

    this._syncAllToDOM();
    this._closeAutocomplete();
    
    // Also trigger salutation
    this._triggerSalutationUpdate(name);
  }

  _closeAutocomplete() {
    const existing = document.querySelector(".autocomplete-suggestions");
    if (existing) existing.remove();
  }

  /**
   * [G-002] Strict Schema Gate (High-Integrity Security)
   * Validates incoming JSON data against the Isomorphic Master Registry keys.
   */
  _validateImportSchema(data) {
    if (!data || typeof data !== "object") return false;

    // Check if it has the required sections
    if (!data.content || !data.config) return false;

    const allowedContentKeys = new Set(IMR.map((e) => e.key));
    const contentKeys = Object.keys(data.content);

    // Every key in content MUST be defined in IMR
    return contentKeys.every((k) => allowedContentKeys.has(k));
  }

  _handleLogExport() {
    const url = FlightRecorder.exportLogs();
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      // [ANTI-016] Temporal migration
      const dateStr = Temporal.Now.plainDateISO().toString();
      a.download = `incident_logs_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  updateComplianceStatus(key, status, label) {
    const el = document.getElementById(key);
    if (el) {
      const statusClass =
        status === "ok"
          ? "status-ok"
          : status === "warn"
            ? "status-warn"
            : "status-err";
      el.textContent = `${label}: `;
      const span = document.createElement("span");
      span.className = statusClass;
      span.textContent = `[${status.toUpperCase()}]`;
      el.appendChild(span);
    }
  }

  /**
   * [SPEC-080] Real-time Time Watchdog
   * Checks every minute if a theme transition (21:00 or 06:00) is needed.
   */
  _startNightWatchdog() {
    const check = () => {
      // If manually set, we don't interfere anymore for this session
      if (this.sm.state.config.theme_manually_set) return;

      const isNight = Logic.isNightTime();
      const targetTheme = isNight ? "night" : "day";

      if (this.sm.state.config.theme !== targetTheme) {
        console.info(`[Smart-Night] Auto-Transition to ${targetTheme}`);
        this.sm.update("config.theme", targetTheme, "auto-night");
        this._syncAllToDOM();
      }
      setTimeout(check, 60000); // Check once per minute
    };
    setTimeout(check, 1000);
  }
}

