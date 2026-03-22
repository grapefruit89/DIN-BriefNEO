/**
 * js/app.js — Application Entry Point & Orchestrator
 * Claude Brief · DIN 5008 Generator
 * ─────────────────────────────────────────────────────────
 * ES6 Module. Imported via <script type="module"> in index.html.
 *
 * Boot sequence:
 *   1. Instantiate StateManager
 *   2. Load from localStorage (or fall back to DEFAULT_STATE)
 *   3. Set today's date if content.date is empty
 *   4. Instantiate UIController → init()
 *   5. Subscribe auto-save (debounced 1.2s after last change)
 *
 * Nothing in this file touches the DOM directly.
 * All DOM work lives in ui.js.
 */

import { StateManager }  from './state.js';
import { UIController }  from './ui.js';
import { formatDate }    from './logic.js';

/* ── Boot ─────────────────────────────────────────────────────── */
async function boot() {
  const statusEl = document.getElementById('statusbar');
  const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

  setStatus('⏳ Lade…');

  try {
    // 1. State
    const sm = new StateManager();

    // 2. Restore persisted data
    const restored = sm.loadFromStorage();
    if (!restored) {
      // Fresh start: pre-fill today's date using default format
      const fmt   = sm.state.config.dateFormat;
      const today = formatDate(new Date(), fmt);
      sm.state.content.date = today;
      sm.save();
    }

    // 3. If date field is empty after restore, set today
    if (!sm.state.content.date) {
      sm.state.content.date = formatDate(new Date(), sm.state.config.dateFormat);
    }

    // 4. UI
    const ui = new UIController(sm);
    ui.init();

    // 5. Auto-save subscription (debounced)
    let saveTimer;
    sm.subscribe((path, value, scope) => {
      if (scope === 'load') return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => sm.save(), 1200);
    });

    // 6. Safety net: save on page unload
    window.addEventListener('pagehide', () => sm.save());
    window.addEventListener('beforeunload', () => sm.save());

    // Expose for debugging (remove in production if desired)
    window.__brief = { sm, ui };

    setStatus('✅ Bereit');

  } catch (err) {
    console.error('[BriefApp] Boot failure:', err);
    setStatus('❌ Fehler — Konsole prüfen');
    // Show visible error on paper
    const paper = document.getElementById('paper');
    if (paper) {
      const msg = document.createElement('div');
      msg.style.cssText = 'padding:20mm;color:red;font-family:sans-serif;';
      msg.textContent = `Boot-Fehler: ${err.message}`;
      paper.prepend(msg);
    }
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
