/**
 * app.js — Progressive Enhancement Bootloader
 * Kern läuft immer. Extras laden wenn verfügbar.
 * [ADR-017] Flat & Pure Architecture
 */

import { StateManager, Storage, Capabilities } from "./engine.js";
import { UIController } from "./ui.js";

async function boot() {
  console.info("%c[BOOT] DIN-BriefNEO starting...", "color: #4a90e2; font-weight: bold;");
  
  if (typeof Capabilities !== "undefined") {
    Capabilities.logStatus();
  }

  // ── STUFE 1: KERN (niemals optional) ──────────────────────
  const savedState = await Storage.load();
  const sm = new StateManager(savedState);
  const ui = new UIController(sm);
  await ui.init(); // Kern-UI läuft immer

  // Persistence Bridge
  let saveTimeout;
  sm.subscribe(() => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => Storage.save(sm.state), 1000);
  });

  console.info("%c[BOOT] Core ready.", "color: #4ade80;");

  // ── STUFE 2: ENHANCED FEATURES ────────────────────────────
  
  // PageManager: braucht DOM, kein externes API
  try {
    const { PageManager } = await import("./pages.js");
    ui.pages = new PageManager(ui);
    ui.pages.init();
    console.info("[BOOT] PageManager loaded.");
  } catch (e) {
    console.warn("[BOOT] PageManager failed, single-page fallback.", e);
    // ui.pages bleibt der Stub aus dem UIController Constructor
  }

  // Salutation Engine: pure Logik, kein API
  try {
    const { SalutationEngine } = await import("./salutation.js");
    ui.salutation = SalutationEngine;
    ui._updateSalutation();
    console.info("[BOOT] SalutationEngine loaded.");
  } catch (e) {
    console.warn("[BOOT] SalutationEngine failed.", e);
  }

  // ── STUFE 3: SMART FEATURES (extern, optional) ────────────

  // Archiv: braucht IndexedDB
  if (globalThis.indexedDB) {
    try {
      const { ArchiveService } = await import("./archive.js");
      const archive = new ArchiveService();
      await archive.init();
      ui.archive = archive;
      await ui._renderArchive();
      console.info("[BOOT] ArchiveService loaded.");
    } catch (e) {
      console.warn("[BOOT] Archive unavailable.", e);
      _hideFeature("btn-save-archive", "archive-list");
    }
  } else {
    _hideFeature("btn-save-archive", "archive-list");
  }

  // Adress-Autocomplete: braucht Netzwerk
  try {
    const { AddressService } = await import("./address.js");
    ui.address = new AddressService(ui);
    ui.address.init();
    console.info("[BOOT] AddressService loaded.");
  } catch (e) {
    console.warn("[BOOT] AddressService unavailable.", e);
  }

  // QR-Code: braucht Canvas API
  if (typeof OffscreenCanvas !== "undefined" || document.createElement("canvas").getContext) {
    try {
      const { QRCodeEngine } = await import("./qrcode.js");
      ui.qr = QRCodeEngine;
      ui._updateQRCode();
      console.info("[BOOT] QRCodeEngine loaded.");
    } catch (e) {
      console.warn("[BOOT] QR unavailable.", e);
      _hideFeature("state-qr");
    }
  } else {
    _hideFeature("state-qr");
  }

  // Metadata/PDF: komplex, optional
  try {
    const { MetadataService } = await import("./metadata.js");
    ui.metadata = MetadataService;
    console.info("[BOOT] MetadataService loaded.");
  } catch (e) {
    console.warn("[BOOT] MetadataService unavailable.", e);
  }

  // PWA Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(reg => console.log("[PWA] SW registered:", reg.scope))
        .catch(err => console.warn("[PWA] SW failed:", err));
    });

    // PWA Install Logic
    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById("btn-install-pwa");
      if (installBtn) {
        installBtn.style.display = "flex";
        installBtn.onclick = async () => {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`[PWA] User choice: ${outcome}`);
          deferredPrompt = null;
          installBtn.style.display = "none";
        };
      }
    });
  }

  console.info("%c[BOOT] All features initialized.", "color: #4ade80; font-weight: bold;");
}

/** Versteckt UI-Elemente für nicht verfügbare Features */
function _hideFeature(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
}

document.addEventListener("DOMContentLoaded", boot);
