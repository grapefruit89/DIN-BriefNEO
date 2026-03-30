/**
 * js/devmode.js — Easter Egg, Developer Mode & Live Tag-Inspector
 * DIN-BriefNEO · v4.0 V14 | SPEC-049 | CAA-008 | PLAN-010
 * ───────────────────────────────────────────────────────────────
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
} from "./logic.js";
import { IMR } from "./constants.js";
import { nowTimeISO } from "./temporal-utils.js";

const DEV_KEY = "neo_dev_mode";
const CLICK_TARGET = 5;

export function checkDevMode() {
  const isEnabled = localStorage.getItem(DEV_KEY) === "true";
  const toggle = document.getElementById("dev-toggle");
  if (toggle) toggle.checked = isEnabled;
}

export function initDevMode(sm) {
  _bind5xClick(sm);
  _bindAkinatorTerminal(sm);
  if (localStorage.getItem(DEV_KEY) === "true") {
    _startLiveInspector(sm);
  }
}

/* ── 5x-Klick Easter Egg ────────────────────────────────────── */
function _bind5xClick(sm) {
  const versionEl = document.getElementById("app-version");
  if (!versionEl) return;
  let count = 0;
  let lastClick = 0;

  versionEl.addEventListener("click", () => {
    const now = Temporal.Now.instant().epochMilliseconds;
    if (now - lastClick > 2000) count = 0;

    count++;
    lastClick = now;

    if (count >= CLICK_TARGET) {
      count = 0;
      const toggle = document.getElementById("dev-toggle");
      if (!toggle) return;

      const newState = !toggle.checked;
      toggle.checked = newState;
      localStorage.setItem(DEV_KEY, String(newState));

      if (newState) {
        _startLiveInspector(sm);
        console.info("🛠️ Dev-Mode Unlocked (Zero-JS DNA)");
      } else {
        location.reload();
      }
    }
  });
}

/* â”€â”€ Akinator Terminal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ Live Tagâ†”JSON Inspector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function refreshInspector() {
  if (sessionStorage.getItem(DEV_KEY) === "true") {
    _renderTagInspector(readDOMasJSON());
  }
}

function _startLiveInspector(sm) {
  _renderTagInspector(readDOMasJSON());
  sm.subscribe(() => refreshInspector());
  // MutationObserver gelÃ¶scht. Update erfolgt via UIController input-event.
}

/**
 * Rendert den <din-tag> â†” JSON-Key Abgleich im #debug-state Panel.
 * Format: STATUS  TAG           KEY           WERT (40 Zeichen)
 * Injection-Proof: textContent, kein innerHTML [MANDATE-INJ]
 */
function _renderTagInspector(json) {
  const el = document.getElementById("debug-state");
  if (!el) return;

  const header =
    `IMR 2.0 â€” Tagâ†”JSON Inspector  ${nowTimeISO()}\n` +
    `${"â”€".repeat(52)}\n` +
    `  TAG               KEY              WERT\n` +
    `${"â”€".repeat(52)}\n`;

  const cmaTop = getComputedStyle(document.documentElement)
    .getPropertyValue("--addr-top")
    .trim();
  const cmaStatus = `CMA: ${cmaTop} | Viewport: ${window.innerHeight}px\n`;

  const rows = IMR.map(({ tag, key }) => {
    const val = json[key];
    const status = val !== null ? "âœ“" : "â—‹";

    // Check for EditContext
    const el = document.querySelector(tag);
    const hasEC = el?.editContext ? " [EC]" : "";

    const preview = val
      ? String(val)
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .substring(0, 24)
      : "â€”";
    const tagShort = `<${tag}>`.padEnd(20);
    const keyPad = key.padEnd(16);
    return `${status}${hasEC} ${tagShort} ${keyPad} ${preview}`;
  }).join("\n");

  el.textContent = header + cmaStatus + rows;
}
