/**
 * js/app.js — Application Orchestrator (Pure Edition)
 * DIN-BriefNEO · v4.1.0
 * ─────────────────────────────────────────────────────────
 */

import { StateManager } from "./state.js";
import { UIController } from "./ui.js";
import { formatDateTemporal, todayISO } from "./temporal-utils.js";
import { initDevMode, checkDevMode } from "./devmode.js";
import { Storage } from "./storage.js";
import { Capabilities } from "./capabilities.js";
import { CMASensor } from "./cma-sensor.js";

const ROOT = "DIN-BriefNEO";
const VER = "18.1.0";

/**
 * ── Console Telemetry ────────────────────────
 */
function logTelemetry(sm, ui) {
  Capabilities.logStatus();
  const color = Capabilities.isLocalFile ? "#f87171" : "#4ade80";

  console.group(
    `%c 💎 ${ROOT} v4.1 ENGINE v${VER} `,
    `background: #1e2535; color: ${color}; padding: 5px; border-radius: 4px; font-weight: bold;`,
  );

  console.info(
    `%c[STATE]%c  ${Object.keys(sm.state.content).length} IMR-Keys active.`,
    "font-weight: bold; color: #4a90e2;",
    "",
  );

  const paper = document.getElementById("paper");
  if (paper) {
    const scale = getComputedStyle(paper).scale;
    console.info(
      `%c[VIEWPORT]%c Paper Monolith scaled at ${scale}. Layout: ${paper.dataset.form || "B"}`,
      "font-weight: bold; color: #4a90e2;",
      "",
    );
  }
  console.groupEnd();

  // Global Debug Handle
  window.__neo = {
    sm,
    ui,
    Storage,
    Capabilities,
    VER,
    ROOT,
    diagnostics: () => {
      console.table(sm.state.content);
      console.table(sm.state.config);
    },
  };
}

/**
 * ── Zero-JS Persistence Logic (ADR-003) ───────
 */
function initZeroJSState(sm) {
  const paper = document.getElementById("paper");
  if (!paper) return;

  const layout = sm.state.config?.layout || "form-b";
  const radioLayout = document.querySelector(
    `input[name="layout"][value="${layout}"]`,
  );
  if (radioLayout) radioLayout.checked = true;
  paper.dataset.form = layout === "form-a" ? "A" : "B";

  const guides = sm.state.config?.guides !== false;
  const radioGuides = document.querySelector(
    `input[name="guides"][value="${guides}"]`,
  );
  if (radioGuides) radioGuides.checked = true;
  paper.dataset.guides = guides ? "true" : "false";

  const theme = sm.state.config?.theme || "day";
  const radioTheme = document.querySelector(
    `input[name="theme"][value="${theme}"]`,
  );
  if (radioTheme) radioTheme.checked = true;
}

/**
 * ── Boot Sequence ────────────────────────────
 */
async function boot() {
  const statusEl = document.getElementById("statusbar");
  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg;
  };

  setStatus("⏳ Initialisiere...");

  try {
    checkDevMode();

    // 1. Load State via Hybrid Storage
    const savedState = await Storage.load();
    const sm = new StateManager(savedState);

    // Ensure initial date
    if (!sm.state.content.date) {
      sm.state.content.date = formatDateTemporal(todayISO());
    }

    // 2. UI & Sensor Init
    const ui = new UIController(sm);
    ui.init();

    const cma = new CMASensor(sm);
    cma.init();

    initDevMode(sm);
    initZeroJSState(sm);

    // 3. Persistence Subscription (Debounced)
    let saveTimeout;
    sm.subscribe((state) => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => Storage.save(state), 1000);
    });

    logTelemetry(sm, ui);
    setStatus(`✅ ${ROOT} v${VER}`);

    // Emergency Save
    window.addEventListener("pagehide", () => Storage.save(sm.state));
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") Storage.save(sm.state);
    });
  } catch (err) {
    console.error("[NEO Boot]", err);
    setStatus("❌ Boot-Fehler — Konsole prüfen");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

// Service Worker (PWA)
if (Capabilities.serviceWorker && !Capabilities.isLocalFile) {
  navigator.serviceWorker
    .register("sw.js")
    .catch((e) => console.error("PWA Fail:", e));
}
