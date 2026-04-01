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
    this._initReset();
    this.address.init();
    this.pages.init();
    
    // Archive Init
    await this.archive.init();
    this._renderArchive();

    this.sm.subscribe((path, val, scope) => this._onStateChange(path, val, scope));
    
    // Initial Sync
    this._syncAll();
    this._syncControls();
    this._updateVisualState();

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
    // 1. Radio Controls (Segmented Switches)
    const radioNames = ["layout-state", "recipientType", "formality", "theme"];
    radioNames.forEach(name => {
      const radios = document.querySelectorAll(`input[name="${name}"]`);
      radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
          const key = name === "layout-state" ? "layout" : name;
          this.sm.update(`config.${key}`, e.target.value || e.target.id, "user");
        });
      });
    });

    // 2. Toggle Controls (Checkboxes)
    ["guides", "reference", "qr"].forEach(key => {
      const el = document.getElementById(`state-${key}`);
      if (el) {
        el.addEventListener("change", (e) => {
          this.sm.update(`config.${key}`, e.target.checked, "user");
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

  _executeCommand(cmd) {
    console.log("[UI] Executing command:", cmd);
    switch (cmd) {
      case "document-reset":
        this._confirmReset();
        break;
      case "document-export":
        this._handleExport();
        break;
      case "profile-open":
        document.getElementById("profile-dialog").showModal();
        break;
      default:
        console.warn("[UI] Unknown command:", cmd);
    }
  }

  _confirmReset() {
    const dialog = document.getElementById("confirmation-dialog");
    const okBtn = document.getElementById("btn-confirm-ok");
    
    const onOk = () => {
      this.sm.reset();
      this.pages.goToPage(1); // Reset Carousel position
      dialog.close();
      Toast.show("Dokument zurückgesetzt", "info");
      okBtn.removeEventListener("click", onOk);
    };

    okBtn.addEventListener("click", onOk);
    dialog.showModal();
  }

  _handleExport() {
    const blob = new Blob([JSON.stringify(this.sm.state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brief_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    Toast.show("Dokument exportiert", "success");
  }
    const profileBtn = document.getElementById("btn-open-profile");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        const dialog = document.getElementById("profile-dialog");
        this._syncProfileForm();
        if (dialog) dialog.showModal();
      });
    }

    // Save Profile
    const saveProfileBtn = document.getElementById("btn-profile-done");
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
    this._syncAll();
  }

  _executeCommand(cmd) {
    if (cmd === "--print") {
      const metaContext = MetadataService.prepare(this.sm.state);
      window.print();
      MetadataService.restore(metaContext);
    }
    if (cmd === "--export") this._handleExport();
    if (cmd === "--reset") this._handleReset();
  }

  _initReset() {
    const btn = document.getElementById("btn-confirm-ok");
    const dialog = document.getElementById("confirmation-dialog");
    if (btn && dialog) {
      btn.addEventListener("click", () => {
        this.sm.state.content = {};
        this.sm.update("config.layout", "form-b", "system");
        this._syncAll();
        dialog.close();
        Toast.show("Dokument zurückgesetzt", "info");
      });
    }
  }

  _updateVisualState() {
    const { qr } = this.sm.state.config || {};
    if (qr) this._updateQRCode();
  }

  _handleReset() {
    const dialog = document.getElementById("confirmation-dialog");
    if (dialog) dialog.showModal();
  }

  _syncControls() {
    const { theme, layout, guides, reference, qr, recipientType, formality } = this.sm.state.config || {};
    
    // Sync Radios
    const configs = { "layout-state": layout, "recipientType": recipientType, "formality": formality, "theme": theme };
    Object.entries(configs).forEach(([name, val]) => {
      if (!val) return;
      const radio = document.querySelector(`input[name="${name}"][value="${val}"]`) || document.getElementById(val);
      if (radio) radio.checked = true;
    });

    // Sync Checkboxes
    if (guides !== undefined) document.getElementById("state-guides").checked = !!guides;
    if (reference !== undefined) document.getElementById("state-reference").checked = !!reference;
    if (qr !== undefined) document.getElementById("state-qr").checked = !!qr;
  }

  _onStateChange(path, val, scope) {
    if (scope === "config" || scope === "archive") {
      this._syncAll();
      this._syncControls();
      this._updateVisualState();
    }
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
    const c = this.sm.state.content || {};
    const cfg = this.sm.state.config || {};

    const greeting = SalutationEngine.derive({
      firstName: c.empf_vorname || "",
      lastName: c.empf_nachname || "",
      company: c.empf_firma || "",
      type: cfg.recipientType || "none",
      formality: cfg.formality || "formal"
    });
    const closing = SalutationEngine.getClosing(cfg.formality || "formal");

    const anredeEl = document.querySelector("din-anrede");
    if (anredeEl && !this.sm.state.content.anrede) {
      anredeEl.textContent = greeting;
    }

    const grussEl = document.querySelector("din-grussformel");
    if (grussEl && !this.sm.state.content.grussformel) {
      grussEl.textContent = closing;
    }
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
    container.replaceChildren();

    if (letters.length === 0) {
      const msg = document.createElement("p");
      msg.className = "empty-msg";
      msg.textContent = "Keine Briefe im Archiv";
      container.appendChild(msg);
      return;
    }
    
    // Sortiert nach Datum (neu nach alt) via Temporal
    letters.sort((a, b) => Temporal.Instant.compare(b.timestamp, a.timestamp));

    letters.forEach(letter => {
      const el = document.createElement("div");
      el.className = "archive-item";
      const inst = Temporal.Instant.from(letter.timestamp);
      const dateStr = inst.toLocaleString("de-DE", { dateStyle: "medium" });
      
      const title = document.createElement("div");
      title.className = "title";
      title.textContent = letter.title || "Unbenannt";

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${letter.recipient || "Unbekannt"} · ${dateStr}`;

      const actions = document.createElement("div");
      actions.className = "actions";
      const delBtn = document.createElement("button");
      delBtn.className = "archive-btn-del";
      delBtn.textContent = "Löschen";
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm("Diesen Brief wirklich aus dem Archiv löschen?")) {
          await this.archive.delete(letter.id);
          this._renderArchive();
          Toast.show("Gelöscht", "info");
        }
      };

      actions.appendChild(delBtn);
      el.appendChild(title);
      el.appendChild(meta);
      el.appendChild(actions);

      el.addEventListener("click", () => this._loadFromArchive(letter.id));
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
