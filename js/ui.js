/**
 * ui.js — Unified UI Controller (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

import * as Logic from "./logic.js";
import { SalutationEngine } from "./salutation.js";
import { Toast } from "./toast.js";
import { AddressService } from "./address.js";
import { PageManager } from "./pages.js";
import { MetadataService } from "./metadata.js";
import { QRCodeEngine } from "./qrcode.js";
import { ArchiveService } from "./archive.js";

/* ── UI CONTROLLER ────────────────────────────────────────── */

export class UIController {
  constructor(sm) {
    this.sm = sm;
    this.address = new AddressService(this);
    this.pages = new PageManager(this);
    this.archive = new ArchiveService();
  }

  async init() {
    this._initInputs();
    this._initControls();
    this._initModals();
    this._initCarousel();
    this.address.init();
    this.pages.init();
    
    // Archive Init
    await this.archive.init();
    this._renderArchive();

    this.sm.subscribe((path, val, scope) => this._onStateChange(path, val, scope));
    this._syncAll();

    // SW-14: Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => console.log("[PWA] SW registered:", reg.scope))
          .catch((err) => console.warn("[PWA] SW failed:", err));
      });
    }
  }

  _initInputs() {
    Logic.IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (!el) return;

      el.addEventListener("input", (e) => {
        const text = e.target.textContent.trim();
        this.sm.update(`content.${entry.key}`, text);

        // SW-09: IBAN Length Check (Hard Limit 22)
        if (entry.key === "senderIban") {
          if (text.length > 22) {
            el.textContent = text.substring(0, 22);
            el.setAttribute("data-warning", "IBAN zu lang");
          } else {
            el.removeAttribute("data-warning");
          }
        }

        if (entry.tag === "din-text") {
          this.pages.checkFlow();
        }
      });
    });
  }

  _initControls() {
    // Theme Switch
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const newTheme = isDark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        this.sm.update("config.theme", newTheme, "user");
      });
    }

    // Export JSON
    const exportBtn = document.getElementById("btn-export");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        this._handleExport();
      });
    }

    // Global Command Listener
    document.addEventListener("command", (e) => {
      const cmd = e.command || e.detail?.command;
      if (cmd === "--print") {
        const oldTitle = MetadataService.prepare(this.sm.state);
        window.print();
        MetadataService.restore(oldTitle);
      }
      if (cmd === "--export") this._handleExport();
    });

    // Archive Save Trigger
    document.getElementById("btn-save-archive")?.addEventListener("click", async () => {
      await this.archive.save(this.sm.state);
      Toast.show("Im Archiv gespeichert", "success");
      this._renderArchive();
    });

    // SW-15: DevMode Toggle (No Reload)
    document.getElementById("app-version")?.addEventListener("click", () => {
      document.body.classList.toggle("dev-mode");
      const isDev = document.body.classList.contains("dev-mode");
      localStorage.setItem("neo_dev_mode", isDev);
      Toast.show(isDev ? "Dev-Mode Aktiv" : "Dev-Mode Aus", "info");
    });
  }

  _handleExport() {
    const blob = new Blob([JSON.stringify(this.sm.state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brief_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    Toast.show("Dokument exportiert", "success");
  }

  _initModals() {
    const dialogs = document.querySelectorAll("dialog");
    dialogs.forEach((dialog) => {
      const closeBtn = dialog.querySelector(".dialog-close-x, .btn-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => dialog.close());
      }
    });

    // Profile Trigger
    const profileBtn = document.getElementById("btn-profile");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        const dialog = document.getElementById("profile-dialog");
        this._syncProfileForm();
        if (dialog) dialog.showModal();
      });
    }

    // Save Profile
    const saveProfileBtn = document.getElementById("btn-save-profile");
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener("click", () => {
        this._saveProfileForm();
        document.getElementById("profile-dialog")?.close();
        Toast.show("Profil gespeichert", "success");
      });
    }
  }

  _initCarousel() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    }, {
      root: document.getElementById("paper-viewport"),
      threshold: 0.6
    });

    document.querySelectorAll("din-A4").forEach(page => observer.observe(page));
    
    const paper = document.getElementById("paper");
    if (paper) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === "DIN-A4") observer.observe(node);
          });
        });
      });
      mutationObserver.observe(paper, { childList: true });
    }
  }

  _syncProfileForm() {
    const profile = this.sm.state.profile;
    Object.entries(profile).forEach(([key, val]) => {
      const input = document.getElementById(`field-${key}`);
      if (input) input.value = val || "";
    });
  }

  _saveProfileForm() {
    const profile = {};
    const inputs = document.querySelectorAll("#profile-dialog input");
    inputs.forEach((input) => {
      const key = input.id.replace("field-", "");
      profile[key] = input.value;
    });
    this.sm.update("profile", profile, "user");
    this._syncAll();
  }

  _onStateChange(path, val, scope) {
    if (scope === "config") this._syncAll();
    if (path === "content.text") this.pages.checkFlow();
    if (scope === "profile") this._updateQRCode();
    this._updateSalutation();
  }

  _updateQRCode() {
    const el = document.querySelector("din-qr-code");
    if (!el) return;
    const vCard = QRCodeEngine.generateVCard(this.sm.state.profile);
    QRCodeEngine.render(el, vCard);
  }

  _syncAll() {
    Logic.IMR.forEach((entry) => {
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

  _updateSalutation() {
    const { firstName, lastName, company, type, formality } = this.sm.state.profile;
    const greeting = SalutationEngine.derive({ firstName, lastName, company, type, formality });
    const closing = SalutationEngine.getClosing(formality);

    const anredeEl = document.querySelector("din-anrede");
    if (anredeEl) anredeEl.setAttribute("data-salutation", greeting);

    const grussEl = document.querySelector("din-grussformel");
    if (grussEl) grussEl.setAttribute("data-greeting", closing);
  }

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

  async _renderArchive() {
    const container = document.getElementById("archive-list");
    if (!container) return;

    const letters = await this.archive.getAll();
    
    if (letters.length === 0) {
      container.innerHTML = '<p class="empty-msg">Keine Briefe im Archiv</p>';
      return;
    }

    container.innerHTML = ""; // Clear
    
    // Sortiert nach Datum (neu nach alt)
    letters.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    letters.forEach(letter => {
      const el = document.createElement("div");
      el.className = "archive-item";
      const dateStr = new Date(letter.timestamp).toLocaleDateString("de-DE");
      
      el.innerHTML = `
        <div class="title">${letter.title}</div>
        <div class="meta">
          <span>${letter.recipient}</span>
          <span>${dateStr}</span>
        </div>
        <div class="actions">
          <button class="archive-btn-del" data-id="${letter.id}">Löschen</button>
        </div>
      `;

      // Load on click (not on actions)
      el.addEventListener("click", (e) => {
        if (e.target.classList.contains("archive-btn-del")) return;
        this._loadFromArchive(letter.id);
      });

      // Delete listener
      el.querySelector(".archive-btn-del").onclick = async (e) => {
        e.stopPropagation();
        if (confirm("Diesen Brief wirklich aus dem Archiv löschen?")) {
          await this.archive.delete(letter.id);
          this._renderArchive();
          Toast.show("Gelöscht", "info");
        }
      };

      container.appendChild(el);
    });
  }

  async _loadFromArchive(id) {
    const letter = await this.archive.get(id);
    if (!letter) return;

    // State updaten
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
    Toast.show("Brief geladen", "success");
  }
}
