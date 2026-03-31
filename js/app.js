/**
 * app.js — Unified Bootloader (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

import { StateManager, Storage, Capabilities } from "./engine.js";
import { UIController } from "./ui.js";

async function boot() {
  console.info("%c[BOOT] Initializing DIN-BriefNEO Flat Edition...", "color: #4a90e2;");
  
  Capabilities.logStatus();

  // 1. Load State
  const savedState = await Storage.load();
  const sm = new StateManager(savedState);

  // 2. UI Controller
  const ui = new UIController(sm);
  await ui.init();

  // 3. Persistence Bridge
  let saveTimeout;
  sm.subscribe((path, val, scope) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => Storage.save(sm.state), 1000);
  });

  console.info("%c[BOOT] System Ready.", "color: #4ade80;");
}

document.addEventListener("DOMContentLoaded", boot);
