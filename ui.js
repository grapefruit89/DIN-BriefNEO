/**
 * ui.js — Unified UI Controller (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

import * as Logic from "./logic.js";
import { SalutationEngine } from "./salutation.js";

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
  },
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
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=3`,
        );
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
    this._initModals();
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

  _initModals() {
    console.log("Initializing Platinum Modals...");
    const profileDialog = document.getElementById("profile-dialog");
    const confirmDialog = document.getElementById("confirmation-dialog");
    const profileBtn = document.getElementById("btn-open-profile");

    if (profileBtn) {
      profileBtn.onclick = () => {
        console.log("Opening Profile Modal");
        profileDialog.showModal();
      };
    }

    // Trigger Reset (Confirmation)
    document
      .getElementById("btn-trigger-reset")
      ?.addEventListener("click", () => {
        confirmDialog.showModal();
      });

    // Handle Reset Confirmation
    document.getElementById("btn-confirm-ok")?.addEventListener("click", () => {
      localStorage.clear();
      location.reload();
    });

    // Handle Profile Save
    document
      .getElementById("btn-profile-done")
      ?.addEventListener("click", () => {
        const data = {
          name: document.getElementById("profile-name").value,
          street: document.getElementById("profile-street").value,
          zip: document.getElementById("profile-zip").value,
          city: document.getElementById("profile-city").value,
          phone: document.getElementById("profile-phone").value,
          email: document.getElementById("profile-email").value,
          iban: document.getElementById("profile-iban").value,
        };
        localStorage.setItem("din_profile", JSON.stringify(data));
        profileDialog.close();

        // Toast Feedback
        const toast = document.getElementById("toast-v4");
        if (toast) {
          toast.textContent = "Profil gespeichert!";
          toast.showPopover();
          setTimeout(() => toast.hidePopover(), 3000);
          }
          });

          // Platinum Validation Logic for Profile Modal
          const validators = {
          iban: (v) => /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(v.replace(/\s/g, '').toUpperCase()),
          zip: (v) => /^\d{5}$/.test(v)
          };

          profileDialog.querySelectorAll('[data-validation]').forEach(input => {
          input.addEventListener('input', (e) => {
          const type = e.target.dataset.validation;
          const isValid = validators[type](e.target.value);
          if (e.target.value === "") {
            e.target.removeAttribute('aria-invalid');
          } else {
            e.target.setAttribute('aria-invalid', !isValid);
          }
          });
          });
          }

    // IBAN Ghost Logic
    const ibanInput = document.getElementById("profile-iban");
    const ibanGhost = document.getElementById("iban-ghost");
    const ghostTemplate = "DE00 0000 0000 0000 0000 0000 0000";

    ibanInput?.addEventListener("input", (e) => {
      const rawValue = e.target.value.replace(/\s+/g, "").toUpperCase();
      let formatted = "";
      for (let i = 0; i < rawValue.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += rawValue[i];
      }
      e.target.value = formatted;

      if (ibanGhost) {
        const invisiblePart = formatted || "";
        const visiblePart = ghostTemplate.substring(formatted.length);
        ibanGhost.innerHTML = `<span class="invisible">${invisiblePart}</span>${visiblePart}`;
      }
    });
  }

  _initInputs() {
    Logic.IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (!el) return;
      el.addEventListener("input", (e) => {
        const text = e.target.textContent;
        this.sm.update(`content.${entry.key}`, text, "ui");

        // Trigger Salutation Engine on Name/Company change
        if (
          entry.tag === "din-empfaenger-vorname" ||
          entry.tag === "din-empfaenger-nachname" ||
          entry.tag === "din-empfaenger-firma"
        ) {
          this._updateSalutation();
        }

        // Validate Closing on manual input
        if (entry.tag === "din-grussformel") {
          const validation = SalutationEngine.validateClosing(text);
          if (!validation.isValid) {
            el.setAttribute("aria-invalid", "true");
            el.setAttribute("data-warning", validation.warning);
          } else {
            el.removeAttribute("aria-invalid");
            el.removeAttribute("data-warning");
          }
        }

        if (entry.tag === "din-text") {
          const mirror = document.querySelector("din-text-spiegel");
          if (mirror) mirror.innerHTML = Logic.parseMarkdown(text);
        }
      });
    });
  }

  _initControls() {
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout")
        this.sm.update(
          "config.layout",
          e.target.id === "state-layout-a" ? "form-a" : "form-b",
        );
      if (e.target.name === "theme")
        this.sm.update("config.theme", e.target.value);
      if (e.target.name === "guides")
        this.sm.update("config.guides", e.target.value === "true");

      // Update Salutation on Settings change
      if (e.target.name === "recipientType" || e.target.name === "formality") {
        this._updateSalutation();
      }
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
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        this._wrapSelection("**", "**");
      }
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        this._wrapSelection("__", "__");
      }
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

    // Initial Salutation & Closing set
    this._updateSalutation();
  }

  _syncAll() {
    Logic.IMR.forEach((entry) => {
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

  _updateSalutation() {
    const firstName =
      document.querySelector("din-empfaenger-vorname")?.textContent || "";
    const lastName =
      document.querySelector("din-empfaenger-nachname")?.textContent || "";
    const company =
      document.querySelector("din-empfaenger-firma")?.textContent || "";

    // Get values from Sidebar Radio Groups
    const type =
      document.querySelector('input[name="recipientType"]:checked')?.value ||
      "none";
    const formality =
      document.querySelector('input[name="formality"]:checked')?.value ||
      "formal";

    const greeting = SalutationEngine.derive({
      firstName,
      lastName,
      company,
      type,
      formality,
    });

    const closing = SalutationEngine.getClosing(formality);

    const anredeEl = document.querySelector("din-anrede");
    if (anredeEl) {
      anredeEl.setAttribute("data-salutation", greeting);
      this.sm.update("content.anrede", greeting, "engine");
    }

    const grussEl = document.querySelector("din-grussformel");
    if (grussEl) {
      grussEl.setAttribute("data-greeting", closing);
      this.sm.update("content.grussformel", closing, "engine");
    }
  }
}
