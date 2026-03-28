/**
 * js/ui/devmode.js — Easter Egg, Developer Mode & Live Tag-Inspector
 * DIN-BriefNEO · Platinum V14 | SPEC-049 | CAA-008 | PLAN-010
 * ─────────────────────────────────────────────────────────────────
 * IMR 2.0: Live-Inspector zeigt <din-*> Tag ↔ JSON-Key Abgleich.
 * MutationObserver scannt querySelectorAll('[din-*]') — kein ID-Lookup.
 *
 * ACTIVATION: 5x Klick auf #app-version (2s Reset-Window)
 * STORAGE:    localStorage 'neo_dev_mode' = 'true'
 */

import {
  buildInterviewPrompt,
  buildOptimizationPrompt,
  readDOMasJSON,
} from "../logic/logic.js";
import { IMR } from "../core/constants.js";
import { nowTimeISO } from "../core/temporal-utils.js";

const DEV_KEY = "neo_dev_mode";
const CLICK_TARGET = 5;

export function checkDevMode() {
  if (localStorage.getItem(DEV_KEY) === "true") {
    document.body.dataset.devmode = "true";
    document.body.classList.add("dev-mode");
  }
}

export function initDevMode(sm) {
  _bind5xClick();
  _bindAkinatorTerminal(sm);
  if (localStorage.getItem(DEV_KEY) === "true") {
    _startLiveInspector(sm);
  }
}

/* ── 5x-Klick Easter Egg ─────────────────────────────────────── */
function _bind5xClick() {
  const versionEl = document.getElementById("app-version");
  if (!versionEl) return;
  let count = 0;
  let lastClick = 0;

  versionEl.addEventListener("click", () => {
    // [ANTI-016] Temporal migration (Aviation Grade Determinism)
    const now = Temporal.Now.instant().epochMilliseconds;
    if (now - lastClick > 2000) count = 0; // 2s Reset window

    count++;
    lastClick = now;
    console.debug(`[DevMode] Click ${count}/${CLICK_TARGET}`);

    if (count >= CLICK_TARGET) {
      count = 0;
      const isEnabled = localStorage.getItem(DEV_KEY) === "true";
      const newState = !isEnabled;

      localStorage.setItem(DEV_KEY, String(newState));
      document.body.dataset.devmode = String(newState);
      if (newState) {
        document.body.classList.add("dev-mode");
        document.body.dataset.toast = "dev-unlocked";
        _startLiveInspector(sm);
      } else {
        document.body.classList.remove("dev-mode");
        location.reload(); // Hard reset to clear debug UI
      }
    }
  });
}

/* ── Akinator Terminal ───────────────────────────────────────── */
function _bindAkinatorTerminal(sm) {
  const btn = document.getElementById("btn-akinator-export");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const json = readDOMasJSON();
    const hasContent = Object.values(json).some(
      (v) => v !== null && String(v).trim().length > 0,
    );
    const prompt = hasContent
      ? buildOptimizationPrompt()
      : buildInterviewPrompt();

    const ta = document.getElementById("akinator-output");
    if (ta) ta.value = prompt;
    navigator.clipboard?.writeText(prompt).catch(() => {});

    btn.dataset.copied = "true"; // CSS regelt den Reset der Anzeige via Animation
    _renderTagInspector(json);
  });
}

/* ── Live Tag↔JSON Inspector ─────────────────────────────────── */
export function refreshInspector() {
  if (sessionStorage.getItem(DEV_KEY) === "true") {
    _renderTagInspector(readDOMasJSON());
  }
}

function _startLiveInspector(sm) {
  _renderTagInspector(readDOMasJSON());
  sm.subscribe(() => refreshInspector());
  // MutationObserver gelöscht. Update erfolgt via UIController input-event.
}

/**
 * Rendert den <din-tag> ↔ JSON-Key Abgleich im #debug-state Panel.
 * Format: STATUS  TAG           KEY           WERT (40 Zeichen)
 * Injection-Proof: textContent, kein innerHTML [MANDATE-INJ]
 */
function _renderTagInspector(json) {
  const el = document.getElementById("debug-state");
  if (!el) return;

  const header =
    `IMR 2.0 — Tag↔JSON Inspector  ${nowTimeISO()}\n` +
    `${"─".repeat(52)}\n` +
    `  TAG               KEY              WERT\n` +
    `${"─".repeat(52)}\n`;

  const cmaTop = getComputedStyle(document.documentElement)
    .getPropertyValue("--addr-top")
    .trim();
  const cmaStatus = `CMA: ${cmaTop} | Viewport: ${window.innerHeight}px\n`;

  const rows = IMR.map(({ tag, key }) => {
    const val = json[key];
    const status = val !== null ? "✓" : "○";

    // Check for EditContext
    const el = document.querySelector(tag);
    const hasEC = el?.editContext ? " [EC]" : "";

    const preview = val
      ? String(val)
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .substring(0, 24)
      : "—";
    const tagShort = `<${tag}>`.padEnd(20);
    const keyPad = key.padEnd(16);
    return `${status}${hasEC} ${tagShort} ${keyPad} ${preview}`;
  }).join("\n");

  el.textContent = header + cmaStatus + rows;
}
