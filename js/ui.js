/**
 * ui.js — Kern UI Controller (Progressive Enhancement)
 * Keine direkten Imports von optionalen Modulen.
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

import * as Logic from "./logic.js";

export class UIController {
  constructor(sm) {
    this.sm = sm;
    // Optionale Services – werden von app.js injiziert
    this.pages = { checkFlow: () => {}, goToPage: () => {} }; // Stub
    this.archive = null;
    this.address = null;
    this.salutation = null;
    this.qr = null;
    this.metadata = null;
  }

  async init() {
    this._initInputs();
    this._initControls();
    this._initModals();
    this._initReset();
    
    this.sm.subscribe((path, val, scope) => this._onStateChange(path, val, scope));
    
    // Initial Sync
    this._syncAll();
    this._syncControls();
  }

  // ── INPUT BINDING (Kern) ──────────────────────────────────
  _initInputs() {
    Logic.IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (!el || entry.internal) return;

      el.addEventListener("input", (e) => {
        const text = e.target.textContent;
        this.sm.update(`content.${entry.key}`, text);

        if (entry.tag === "din-text") {
          this.pages.checkFlow(); // Stub oder echter PageManager
        }

        // Salutation nur wenn geladen
        if (this.salutation && [
          "din-empfaenger-vorname",
          "din-empfaenger-nachname",
          "din-empfaenger-firma",
          "din-zusaetze"
        ].includes(entry.tag)) {
          this._updateSalutation();
        }
      });
    });
  }

  // ── CONTROLS (Kern) ───────────────────────────────────────
  _initControls() {
    // 1. Radio Controls (Segmented Switches)
    const radioNames = ["layout-state", "formality", "theme"];
    radioNames.forEach(name => {
      const radios = document.querySelectorAll(`input[name="${name}"]`);
      radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
          const key = name === "layout-state" ? "layout" : name;
          this.sm.update(`config.${key}`, e.target.value);
        });
      });
    });

    // 2. Toggle Controls (Checkboxes)
    ["guides", "reference", "qr"].forEach(key => {
      const el = document.getElementById(`state-${key}`);
      if (el) {
        el.addEventListener("change", (e) => {
          this.sm.update(`config.${key}`, e.target.checked);
        });
      }
    });

    // 3. Command Listeners
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[command]");
      if (btn) {
        const cmd = btn.getAttribute("command");
        this._executeCommand(cmd);
      }
    });

    // Archive Save Trigger (nur wenn Archive vorhanden)
    document.getElementById("btn-save-archive")?.addEventListener("click", async () => {
      if (!this.archive) return;
      await this.archive.save(this.sm.state);
      this._showToast("Im Archiv gespeichert", "success");
      this._renderArchive();
    });

    // SW-15: DevMode Toggle (No Reload)
    document.getElementById("app-version")?.addEventListener("click", () => {
      document.body.classList.toggle("dev-mode");
      const isDev = document.body.classList.contains("dev-mode");
      this._showToast(isDev ? "Dev-Mode Aktiv" : "Dev-Mode Aus", "info");
    });
  }

  // ── MODALS (Kern) ─────────────────────────────────────────
  _initModals() {
    // Open Profile
    const profileBtn = document.getElementById("btn-open-profile");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        this._syncProfileForm();
        document.getElementById("profile-dialog")?.showModal();
      });
    }

    // Save Profile
    const saveProfileBtn = document.getElementById("btn-profile-done");
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener("click", () => {
        this._saveProfileForm();
        document.getElementById("profile-dialog")?.close();
        this._showToast("Profil gespeichert", "success");
        // QR updaten falls verfügbar
        if (this.qr) this._updateQRCode();
      });
    }
  }

  // ── RESET (Kern) ──────────────────────────────────────────
  _initReset() {
    const btn = document.getElementById("btn-confirm-ok");
    const dialog = document.getElementById("confirmation-dialog");
    const triggerReset = document.getElementById("btn-trigger-reset");

    if (triggerReset) {
      triggerReset.addEventListener("click", () => {
        dialog?.showModal();
      });
    }

    if (btn && dialog) {
      btn.addEventListener("click", () => {
        this.sm.state.content = {};
        this.sm.update("config.layout", "form-b", "system");
        this._syncAll();
        this._updateSalutation();
        dialog.close();
        this._showToast("Dokument zurückgesetzt", "info");
      });
    }
  }

  // ── COMMANDS ──────────────────────────────────────────────
  _executeCommand(cmd) {
    console.log("[UI] Executing command:", cmd);
    switch (cmd) {
      case "--print":
        if (this.metadata) {
          const ctx = this.metadata.prepare(this.sm.state);
          window.print();
          this.metadata.restore(ctx);
        } else {
          window.print();
        }
        break;
      case "--export":
        this._handleExport();
        break;
      case "--reset":
        document.getElementById("confirmation-dialog")?.showModal();
        break;
      default:
        console.warn("[UI] Unknown command:", cmd);
    }
  }

  _handleExport() {
    const iso = Logic.todayISO();
    const blob = new Blob([JSON.stringify(this.sm.state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brief_${iso}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this._showToast("Dokument exportiert", "success");
  }

  // ── STATE SYNC ────────────────────────────────────────────
  _onStateChange(path, val, scope) {
    if (scope === "config") {
      this._syncAll();
      this._syncControls();
      if (this.qr && path === "config.qr" && val) this._updateQRCode();
    }
    if (scope === "content" || path.startsWith("content.")) {
      if (path === "content.text") this.pages.checkFlow();
      if (this.salutation) this._updateSalutation();
    }
    if (scope === "profile") {
      if (this.qr) this._updateQRCode();
    }
    if (scope === "archive") {
      this._syncAll();
      this._renderArchive();
    }
  }

  _syncAll() {
    Logic.IMR.forEach((entry) => {
      if (entry.internal) return;
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) {
        if (!["din-anrede", "din-grussformel"].includes(entry.tag) || this.sm.state.content[entry.key]) {
          el.textContent = this.sm.state.content[entry.key] || "";
        }
        if (entry.tag === "din-text") {
          this.pages.checkFlow();
        }
      }
    });
  }

  _syncControls() {
    const { theme, layout, guides, reference, qr, formality } = this.sm.state.config || {};
    
    // Sync Radios
    const configs = { "layout-state": layout, "formality": formality, "theme": theme };
    Object.entries(configs).forEach(([name, val]) => {
      if (!val) return;
      const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
      if (radio) radio.checked = true;
    });

    // Sync Checkboxes
    const cb = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.checked = !!val;
    };
    cb("state-guides", guides);
    cb("state-reference", reference);
    cb("state-qr", qr);
  }

  // ── PROFIL ────────────────────────────────────────────────
  _syncProfileForm() {
    const profile = this.sm.state.profile || {};
    Object.entries(profile).forEach(([key, val]) => {
      const input = document.getElementById(`profile-${key}`);
      if (input) input.value = val || "";
    });
  }

  _saveProfileForm() {
    const profile = {};
    const inputs = document.querySelectorAll("#profile-dialog input");
    inputs.forEach((input) => {
      const key = input.id.replace("profile-", "");
      profile[key] = input.value;
    });
    this.sm.update("profile", profile, "user");
  }

  // ── SALUTATION (nur wenn Engine geladen) ──────────────────
  _updateSalutation() {
    if (!this.salutation) return;
    const c = this.sm.state.content || {};
    const cfg = this.sm.state.config || {};

    const scanText = `${c.zusaetze || ""} ${c.empf_vorname || ""} ${c.empf_nachname || ""}`.toLowerCase();
    let type = "none";
    
    if (/frau|ms\.|mrs\.|damen/.test(scanText)) {
      type = "female";
    } else if (/herr|mr\.|sir/.test(scanText)) {
      type = "male";
    }

    const greeting = this.salutation.derive({
      firstName: c.empf_vorname || "",
      lastName: c.empf_nachname || "",
      company: c.empf_firma || "",
      type: type,
      formality: cfg.formality || "formal"
    });
    const closing = this.salutation.getClosing(cfg.formality || "formal");

    const anredeEl = document.querySelector("din-anrede");
    if (anredeEl) {
      anredeEl.setAttribute("data-salutation", greeting);
      if (!this.sm.state.content.anrede && document.activeElement !== anredeEl) {
        anredeEl.textContent = "";
      }
    }

    const grussEl = document.querySelector("din-grussformel");
    if (grussEl) {
      grussEl.setAttribute("data-greeting", closing);
      if (!this.sm.state.content.grussformel && document.activeElement !== grussEl) {
        grussEl.textContent = "";
      }
    }
  }

  // ── QR (nur wenn Engine geladen) ─────────────────────────
  _updateQRCode() {
    if (!this.qr) return;
    const el = document.querySelector("din-qr-code");
    if (!el) return;
    const vCard = this.qr.generateVCard(this.sm.state.profile);
    this.qr.render(el, vCard);
  }

  // ── ARCHIV (nur wenn Service geladen) ────────────────────
  async _renderArchive() {
    if (!this.archive) return;
    const container = document.getElementById("archive-list");
    if (!container) return;

    const letters = await this.archive.getAll();
    container.replaceChildren();

    if (letters.length === 0) {
      const msg = document.createElement("p");
      msg.className = "empty-msg";
      msg.textContent = "Keine Briefe im Archiv";
      container.appendChild(msg);
      return;
    }
    
    letters.sort((a, b) => Temporal.Instant.compare(Temporal.Instant.from(b.timestamp), Temporal.Instant.from(a.timestamp)));

    letters.forEach(letter => {
      const el = document.createElement("div");
      el.className = "archive-item";
      
      const title = document.createElement("div");
      title.className = "title";
      title.textContent = letter.title || "Unbenannt";

      const meta = document.createElement("div");
      meta.className = "meta";
      const inst = Temporal.Instant.from(letter.timestamp);
      meta.textContent = `${letter.recipient || "Unbekannt"} · ${inst.toLocaleString("de-DE", { dateStyle: "medium" })}`;

      const delBtn = document.createElement("button");
      delBtn.className = "archive-btn-del";
      delBtn.textContent = "Löschen";
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm("Diesen Brief wirklich aus dem Archiv löschen?")) {
          await this.archive.delete(letter.id);
          this._renderArchive();
          this._showToast("Gelöscht", "info");
        }
      };

      el.append(title, meta, delBtn);
      el.addEventListener("click", (e) => {
        if (e.target === delBtn) return;
        this._loadFromArchive(letter.id);
      });
      container.appendChild(el);
    });
  }

  async _loadFromArchive(id) {
    if (!this.archive) return;
    const letter = await this.archive.get(id);
    if (!letter) return;

    if (letter.data.content) {
      Object.entries(letter.data.content).forEach(([k, v]) => {
        this.sm.update(`content.${k}`, v, "archive");
      });
    }
    if (letter.data.profile) {
      this.sm.update("profile", letter.data.profile, "archive");
    }

    this._syncAll();
    this.pages.checkFlow();
    this._showToast("Brief geladen", "success");
  }

  // ── MIRROR ────────────────────────────────────────────────
  _updateMirror(text, targetEl = null) {
    const mirror = targetEl || document.querySelector("din-text-spiegel");
    if (!mirror) return;
    const html = Logic.parseMarkdown(text);
    if (mirror.setHTML) {
      mirror.setHTML(html);
    } else {
      mirror.innerHTML = html;
    }
  }

  // ── TOAST (intern) ────────────────────────────────────────
  _showToast(msg, type = "info") {
    const el = document.getElementById("toast-v4");
    if (!el) return;
    
    if (el.matches(":popover-open")) el.hidePopover();
    
    el.textContent = msg;
    el.className = `toast-container type-${type}`;
    
    try {
      el.showPopover();
      el.addEventListener("animationend", () => {
        if (el.matches(":popover-open")) el.hidePopover();
      }, { once: true });
    } catch (e) {
      console.warn("[Toast] Popover API not supported or failed:", e);
    }
  }
}
