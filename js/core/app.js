/**
 * js/core/app.js — Application Orchestrator
 * DIN-BriefNEO · Platinum V13
 * ─────────────────────────────────────────────────────────
 * Boot sequence:
 *   1. Dev-Mode Detection → Easter Egg prüfen
 *   2. StateManager instantiieren → LocalStorage laden
 *   3. UIController init()
 *   4. Auto-Save Subscription
 *
 * NO-JS DOCTRINE [ADR-003]:
 *   Layout, Dialoge, Toolbar-Sichtbarkeit = CSS/HTML.
 *   Dieses File: nur Boot-Logik, kein DOM-Styling.
 *
 * TOMB-LEGACY-001: new Date() ersetzt durch Temporal.
 * TOMB-LEGACY-008: cma-bridge entfernt.
 */

import { StateManager }           from './state.js';
import { UIController }           from '../ui/ui.js';
import { formatDateTemporal }     from './temporal-utils.js';
import { initDevMode, checkDevMode } from '../ui/devmode.js';

const ROOT  = 'DIN-BriefNEO';
const VER   = '13.0.0';

async function boot() {
  const statusEl = document.getElementById('statusbar');
  const setStatus = msg => { if (statusEl) statusEl.textContent = msg; };

  setStatus('⏳ Initialisiere…');

  try {
    // ── 1. Dev-Mode Easter Egg ───────────────────────────────────
    checkDevMode();   // liest localStorage, aktiviert UI wenn nötig

    // ── 2. State ─────────────────────────────────────────────────
    const sm = new StateManager();
    const restored = sm.loadFromStorage();
    if (!restored || !sm.state.content.date) {
      const fmt   = sm.state.config?.dateFormat || 'de';
      sm.state.content.date = formatDateTemporal(fmt);
      sm.save();
    }

    // ── 3. UI ─────────────────────────────────────────────────────
    const ui = new UIController(sm);
    ui.init();

    // ── 4. Dev-Mode Sidebar-Registration ────────────────────────
    initDevMode(sm);

    // ── 5. Auto-Save ─────────────────────────────────────────────
    let saveTimer;
    sm.subscribe((path, value, scope) => {
      if (scope === 'load') return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => sm.save(), 1200);
    });

    window.addEventListener('pagehide',      () => sm.save());
    window.addEventListener('beforeunload',  () => sm.save());

    // Debug-Handle (nur Dev-Mode)
    if (localStorage.getItem('neo_dev_mode') === 'true') {
      window.__neo = { sm, ui, VER, ROOT };
    }

    setStatus(`✅ ${ROOT} v${VER}`);

  } catch (err) {
    console.error('[NEO Boot]', err);
    setStatus('❌ Boot-Fehler — Konsole prüfen');
    const paper = document.getElementById('paper');
    if (paper) {
      const msg = document.createElement('div');
      msg.style.cssText = 'padding:20mm;color:red;font-family:monospace;font-size:11pt;';
      msg.textContent = `Boot-Fehler: ${err.message}`;
      paper.prepend(msg);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.error('PWA Fail:', err));
}
