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

import { buildInterviewPrompt, buildOptimizationPrompt, readDOMasJSON }
  from '../logic/logic.js';
import { IMR } from '../core/constants.js';
import { nowTimeISO } from '../core/temporal-utils.js';

const DEV_KEY      = 'neo_dev_mode';
const CLICK_TARGET = 5;

export function checkDevMode() {
  if (localStorage.getItem(DEV_KEY) === 'true') {
    document.body.dataset.devmode = 'true';
  }
}

export function initDevMode(sm) {
  _bind5xClick();
  _bindAkinatorTerminal(sm);
  if (localStorage.getItem(DEV_KEY) === 'true') {
    _startLiveInspector(sm);
  }
}

/* ── 5x-Klick Easter Egg ─────────────────────────────────────── */
function _bind5xClick() {
  const versionEl = document.getElementById('app-version');
  if (!versionEl) return;
  let count = 0, timer = null;
  versionEl.addEventListener('click', () => {
    count++;
    clearTimeout(timer);
    timer = setTimeout(() => { count = 0; }, 2000);
    if (count >= CLICK_TARGET) {
      count = 0;
      localStorage.setItem(DEV_KEY, 'true');
      document.body.dataset.devmode = 'true';
      document.body.dataset.toast   = 'dev-unlocked';
      setTimeout(() => { delete document.body.dataset.toast; }, 3200);
    }
  });
}

/* ── Akinator Terminal ───────────────────────────────────────── */
function _bindAkinatorTerminal(sm) {
  const btn = document.getElementById('btn-akinator-export');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const json       = readDOMasJSON();
    const hasContent = Object.values(json).some(v => v !== null && String(v).trim().length > 0);
    const prompt     = hasContent ? buildOptimizationPrompt() : buildInterviewPrompt();

    const ta = document.getElementById('akinator-output');
    if (ta) ta.value = prompt;
    navigator.clipboard?.writeText(prompt).catch(() => {});

    btn.dataset.copied = 'true';
    setTimeout(() => delete btn.dataset.copied, 1800);

    _renderTagInspector(json);   // Sofort-Refresh des Inspectors
  });
}

/* ── Live Tag↔JSON Inspector ─────────────────────────────────── */
function _startLiveInspector(sm) {
  _renderTagInspector(readDOMasJSON());

  // State-Subscriber (Undo/Redo/Load)
  sm.subscribe(() => requestAnimationFrame(() => _renderTagInspector(readDOMasJSON())));

  // MutationObserver für contenteditable-Änderungen im Paper
  const paper = document.getElementById('paper');
  if (!paper) return;

  new MutationObserver(() =>
    requestAnimationFrame(() => _renderTagInspector(readDOMasJSON()))
  ).observe(paper, { subtree: true, childList: true, characterData: true });
}

/**
 * Rendert den <din-tag> ↔ JSON-Key Abgleich im #debug-state Panel.
 * Format: STATUS  TAG           KEY           WERT (40 Zeichen)
 * Injection-Proof: textContent, kein innerHTML [MANDATE-INJ]
 */
function _renderTagInspector(json) {
  const el = document.getElementById('debug-state');
  if (!el) return;

  const header = `IMR 2.0 — Tag↔JSON Inspector  ${nowTimeISO()}\n`
               + `${'─'.repeat(52)}\n`
               + `  TAG               KEY              WERT\n`
               + `${'─'.repeat(52)}\n`;

  const rows = IMR.map(({ tag, key }) => {
    const val     = json[key];
    const status  = val !== null ? '✓' : '○';
    const preview = val
      ? String(val).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').substring(0, 28)
      : '—';
    const tagShort = `<${tag}>`.padEnd(20);
    const keyPad   = key.padEnd(16);
    return `${status} ${tagShort} ${keyPad} ${preview}`;
  }).join('\n');

  el.textContent = header + rows;
}
