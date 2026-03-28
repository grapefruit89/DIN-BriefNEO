/**
 * js/ui/ui.js — Platinum DOM Controller (V20)
 * [CMD-1] Ghost-Mirror Structural Integrity
 * [CMD-2] Scoped View Transitions (Chrome 147)
 * [CMD-4] EditContext Integration
 * ─────────────────────────────────────────────────────────
 */

import * as Logic from "../logic/logic.js";
import { EditContextController } from "../core/edit-context-controller.js";
import { GhostMirror } from "./ghost-mirror.js";
import { AddressService } from "../services/address-service.js";
import { FlightRecorder } from "../logic/flight-recorder.js";
import { IMR, PLATINUM_SANITIZER } from "../core/constants.js";

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

    this.sm.subscribe((path, val, scope, source) =>
      this._onStateChange(path, val, scope, source),
    );
    this._syncAllToDOM();

    document.addEventListener("command", (e) => {
      const { command } = e.detail || { command: e.command };
      if (command === "--export") this._handleExport();
      if (command === "--import") this._handleImport();
      if (command === "--history") if (this.io) this.io.requestHistory();
      if (command === "--export-logs") this._handleLogExport();
    });
    console.info("🚀 Platinum UI: Sanitizer & Ghost-Mirror Active");
  }

  _bindUtilityActions() {
    // Export State
    const btnExport = document.getElementById("btn-export");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const data = JSON.stringify(this.sm.serialize(), null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        // [ANTI-016] Temporal migration for filename
        const dateStr = Temporal.Now.plainDateISO().toString();
        a.download = `DIN-BriefNEO_Export_${dateStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.info("📥 State exported to JSON.");
      });
    }

    // Import State
    const btnImport = document.getElementById("btn-import");
    if (btnImport) {
      btnImport.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (re) => {
            try {
              const data = JSON.parse(re.target.result);

              // [G-002] Strict Schema Gate (Aviation Grade Security)
              const isValid = this._validateImportSchema(data);
              if (!isValid)
                throw new Error(
                  "Security Violation: Invalid JSON Schema detected.",
                );

              this.sm.load(data);
              console.info("📤 State imported successfully.");
              location.reload(); // Refresh to ensure all controllers re-init with new state
            } catch (err) {
              console.error("❌ Import failed:", err);
              alert(`Import fehlgeschlagen: ${err.message}`);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }

    // Reset Confirm
    const btnResetConfirm = document.getElementById("btn-reset-confirm");
    if (btnResetConfirm) {
      btnResetConfirm.addEventListener("click", () => {
        localStorage.clear();
        location.reload();
      });
    }
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

          // [CMD-5] Platinum Salutation Engine: Real-time update
          if (entry.key === "recipient") {
            this._triggerSalutationUpdate(text);
          }
        });

        // [CMD-1] Ghost-Mirror for structural markdown rendering
        if (entry.tag === "din-body") {
          this._ghosts[entry.tag] = new GhostMirror(
            "din-body",
            "din-body-mirror",
          );
        }
      }
    });
  }

  /**
   * [CMD-5] Platinum Salutation Engine: Orchestrates the reactive update.
   */
  _triggerSalutationUpdate(recipientText) {
    const analysis = Logic.parseRecipient(recipientText);
    const salutationEl = document.querySelector("din-salutation");
    if (salutationEl) {
      // Wir nutzen die State-Formality (Default: formal)
      const formality = this.sm.state.content.formality || "formal";
      Logic.updateSalutationHint(
        salutationEl,
        analysis,
        formality,
        "none",
        recipientText,
      );

      // Sync das Ergebnis zurück in den State, falls gewünscht
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

    if (el.setHTML && PLATINUM_SANITIZER) {
      el.setHTML(value || "", { sanitizer: PLATINUM_SANITIZER });
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
  }

  _bindNativeEvents() {
    // ── Button Actions (Pure JS Logic separation) ───────────────────

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

    // Profil-Management (Aviation Grade Popover Logic)
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

        // Apply to Document (Aviation Grade Sync)
        const nameLine = data.co ? `${data.name}, c/o ${data.co}` : data.name;
        const senderDetails = `${nameLine}\n${data.street}\n${data.city}`;
        const returnLine = Logic.deriveReturnLine({
          name: data.name,
          co: data.co,
          street: data.street,
          zipCity: data.city,
        });

        this.sm.update("content.sender", senderDetails, "profile");
        this.sm.update("content.return_line", returnLine, "profile");

        // Sync to DOM
        this._updateDOMSafe(
          document.querySelector("din-sender-details"),
          senderDetails,
        );
        this._updateDOMSafe(
          document.querySelector("din-return-line"),
          returnLine,
        );

        modalProfile.hidePopover();
      });
    }

    // [CMD-2] Scoped View Transition for Sidebar layout switches
    document.addEventListener("change", (e) => {
      const paper = document.getElementById("paper");

      if (e.target.name === "layout") {
        const val = e.target.id === "layout-a" ? "form-a" : "form-b";
        console.info(`📐 Layout Switch Triggered: ${val}`);

        const updateLayout = () => {
          if (paper) paper.dataset.form = val === "form-a" ? "A" : "B";
          document.body.dataset.layout = val;
          this.sm.state.config.layout = val;
        };

        if (document.startViewTransition)
          document.startViewTransition(updateLayout);
        else updateLayout();
      }

      if (e.target.name === "guides") {
        const isGuidesOn = e.target.value === "true";
        console.info(`📏 Guides Toggle: ${isGuidesOn}`);
        if (paper) paper.dataset.guides = isGuidesOn ? "true" : "false";
        this.sm.state.config.guides = isGuidesOn;
      }

      if (e.target.name === "theme") {
        const isNight = e.target.value === "night";
        console.info(`🌙 Theme Toggle: ${isNight ? "Night" : "Day"}`);
        this.sm.state.config.theme = e.target.value;
      }
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

    // [MANDATE-PASTE] The Radical Paste-Filter (Aviation Grade)
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
          // Fallback für non-EditContext Felder
          document.execCommand("insertText", false, text);
        }
        console.info(
          "🛡️ Paste Gatekeeper: HTML-Injection prevented. Plaintext only.",
        );
      }
    });

    document.addEventListener("input", (e) => {
      const tag = e.target.tagName.toLowerCase();
      const entry = IMR.find((et) => et.tag === tag);
      if (entry) {
        let text = e.target.textContent;

        // [PLATINUM-GHOST] Force real emptiness for placeholders
        if (text.trim() === "") {
          e.target.innerHTML = "";
          text = "";
        }

        if (!entry.editContext) {
          this.sm.state.content[entry.key] = text;
        }
        // Trigger Greetings Matrix on recipient change
        if (entry.key === "recipient") {
          this._triggerSalutationUpdate(text);
        }
      }
    });
  }

  /* ── 📍 AUTOCOMPLETE UI ─────────────────────────────────────── */
  _renderSuggestions(features) {
    this._closeAutocomplete();
    if (!features || features.length === 0) return;

    const list = document.createElement("div");
    list.className = "autocomplete-suggestions";

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
    let text = "";
    if (p.formatted) {
      text = p.formatted.split(", ").join("\n");
    } else {
      text =
        `${p.name || ""}\n${p.street} ${p.housenumber || ""}\n${p.postcode} ${p.city}`.trim();
    }
    this.sm.update("content.recipient", text, "ui");
    this._syncAllToDOM();
    this._closeAutocomplete();
  }

  _closeAutocomplete() {
    const existing = document.querySelector(".autocomplete-suggestions");
    if (existing) existing.remove();
  }

  /**
   * [G-002] Strict Schema Gate (Aviation Grade Security)
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
}
