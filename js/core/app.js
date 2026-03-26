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
import { formatDateTemporal, todayISO }     from './temporal-utils.js';
import { initDevMode, checkDevMode } from '../ui/devmode.js';
import { IOCoordinator }          from './io-coordinator.js';
import { CMASensor }              from '../ui/cma-sensor.js';

const ROOT  = 'DIN-BriefNEO';
const VER   = '18.0.0';

/**
 * ── Aviation-Grade Console Telemetry ────────────────────────
 */
function logAviationTelemetry(sm, io, ui) {
  const isFileProtocol = window.location.protocol === 'file:';
  const color = isFileProtocol ? '#f87171' : '#4ade80';
  
  console.group(`%c 💎 ${ROOT} PLATINUM ENGINE v${VER} `, `background: #1e2535; color: ${color}; padding: 5px; border-radius: 4px; font-weight: bold;`);
  
  console.info(`%c[ORIGIN]%c ${window.location.protocol}//${window.location.host || 'local-filesystem'}`, "font-weight: bold; color: #4a90e2;", "");
  
  if (isFileProtocol) {
    console.warn("%c⚠️ SECURITY ORIGIN WARNING: Running via file:// protocol. Local Storage and Service Workers may be restricted. %cTo fix: run 'npx serve' in this directory.", "color: #fbbf24; font-weight: bold;", "color: #ccc; font-style: italic;");
  }

  console.info(`%c[STATE]%c  ${Object.keys(sm.state.content).length} IMR-Keys active. Sync: ${io ? 'OPFS-Journaling' : 'LocalStorage-Fallback'}`, "font-weight: bold; color: #4a90e2;", "");
  
  const paper = document.getElementById('paper');
  if (paper) {
    const scale = getComputedStyle(paper).scale;
    console.info(`%c[VIEWPORT]%c Paper Monolith scaled at ${scale}. Layout: ${paper.dataset.form || 'B'}`, "font-weight: bold; color: #4a90e2;", "");
  }

  console.info(`%c[BOOT]%c Sequence completed in ${performance.now().toFixed(2)}ms`, "font-weight: bold; color: #4a90e2;", "");
  console.groupEnd();

  // Global Debug Handle
  window.__neo = { sm, ui, io, VER, ROOT, diagnostics: () => {
    console.table(sm.state.content);
    console.table(sm.state.config);
  }};
}

/**
 * ── 6. Zero-JS Persistence Logic (ADR-003) ────────────────────────
 * Note: Layout states are now managed via StateManager to ensure
 * synchronicity across tabs via Phoenix Protocol.
 */
function initZeroJSState(sm) {
  const paper = document.getElementById('paper');
  if (!paper) return;

  // Restore Layout
  const layout = sm.state.config?.layout || 'form-b';
  const radioLayout = document.querySelector(`input[name="layout"][value="${layout}"]`);
  if (radioLayout) radioLayout.checked = true;
  if (paper) paper.dataset.form = layout === 'form-a' ? 'A' : 'B';
  document.body.dataset.layout = layout;

  // Restore Guides
  const guides = sm.state.config?.guides !== false; 
  const radioGuides = document.querySelector(`input[name="guides"][value="${guides}"]`);
  if (radioGuides) radioGuides.checked = true;
  if (paper) paper.dataset.guides = guides ? "true" : "false";

  // Restore Theme
  const hour = parseInt(Temporal.Now.plainTimeISO().toString().split(':')[0], 10);
  const isNightTime = hour >= 21 || hour < 6;
  const defaultTheme = isNightTime ? 'night' : 'day';
  
  const theme = sm.state.config?.theme || defaultTheme;
  const radioTheme = document.querySelector(`input[name="theme"][value="${theme}"]`);
  if (radioTheme) radioTheme.checked = true;
  // State sync if it was defaulted
  if (!sm.state.config.theme) sm.state.config.theme = theme;
}

async function boot() {
  const statusEl = document.getElementById('statusbar');
  const setStatus = msg => { if (statusEl) statusEl.textContent = msg; };

  setStatus('⏳ Initialisiere…');

  try {
    // ── 1. Dev-Mode Easter Egg ───────────────────────────────────
    checkDevMode();

    // ── 2. State ─────────────────────────────────────────────────
    const sm = new StateManager();
    const restored = sm.loadFromStorage();
    
    if (!restored || !sm.state.content.date) {
      sm.state.content.date = formatDateTemporal(todayISO());
    }

    // ── 3. UI (Frühzeitige Init für Responsivität) ───────────────
    const ui = new UIController(sm);
    ui.init();

    // ── 3a. CMA-Sensor (Layout Integrity) ────────────────────────
    const cma = new CMASensor(sm);
    cma.init();

    // ── 4. Phoenix Protocol (Storage Sovereignty) ────────────────
    const io = new IOCoordinator(sm);
    try {
        await io.init();
    } catch (e) {
        console.warn("⚠️ Storage Engine limited on this origin. Falling back to LocalState.");
    }

    // ── 5. Worker Message Listener (Compliance) ──────────────────
    if (io.worker) {
        io.worker.addEventListener('message', (e) => {
            if (e.data.type === 'CONCURRENCY_CONFLICT') {
                setStatus(`⚠️ ${e.data.message}`);
                // Diskrete Warnung in der Compliance Bar
                const integrityEl = document.querySelector('.compliance-item:first-child');
                if (integrityEl) {
                    integrityEl.textContent = 'Fiskale Integrität: ';
                    const span = document.createElement('span');
                    span.className = 'status-warn';
                    span.textContent = '[READ-ONLY]';
                    integrityEl.appendChild(span);
                }
            }
        });
    }

    // ── 6. Dev-Mode Sidebar-Registration ────────────────────────
    initDevMode(sm);

    // ── 7. Zero-JS Persistence ───────────────────────────
    initZeroJSState(sm);

    // Watch for layout changes to log telemetry
    document.addEventListener('change', (e) => {
        if (e.target.name === 'layout') {
            setTimeout(() => logAviationTelemetry(sm, io, ui), 100);
        }
    });

    // ── 8. [COMPLIANCE] AviationMath Self-Test ────────────────────
    const mathStatus = typeof Math.sumPrecise === 'function' ? 'ok' : 'warn';
    const mathLabel  = typeof Math.sumPrecise === 'function' ? 'Blink-Native' : 'Integer-Fallback';
    ui.updateComplianceStatus('math-engine-status', mathStatus, `Math-Engine: [${mathLabel}]`);

    // ── 9. TELEMETRY ──────────────────────────────────────────────
    logAviationTelemetry(sm, io, ui);

    // Lifecycle Events for Emergency Save
    window.addEventListener('pagehide', () => io.emergencySave());
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') io.emergencySave();
    });

    // Debug-Handle (nur Dev-Mode)
    if (localStorage.getItem('neo_dev_mode') === 'true') {
      window.__neo = { sm, ui, io, VER, ROOT };
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
