/**
 * js/devmode.js — Simple Developer Mode (KISS-Edition)
 * ─────────────────────────────────────────────────────────────
 */

const DEV_KEY = "neo_dev_mode";

export function checkDevMode() {
  const isEnabled = localStorage.getItem(DEV_KEY) === "true";
  const toggle = document.getElementById("dev-toggle");
  if (toggle) toggle.checked = isEnabled;
  return isEnabled;
}

export function initDevMode(sm) {
  _bindSimpleToggle(sm);
  if (checkDevMode()) {
    _startInspector(sm);
  }
}

/**
 * KISS: Ein einfacher Klick auf die Version schaltet DevMode um.
 */
function _bindSimpleToggle(sm) {
  const versionEl = document.getElementById("app-version");
  if (!versionEl) return;

  versionEl.addEventListener("click", () => {
    const isEnabled = localStorage.getItem(DEV_KEY) === "true";
    const newState = !isEnabled;

    localStorage.setItem(DEV_KEY, String(newState));
    const toggle = document.getElementById("dev-toggle");
    if (toggle) toggle.checked = newState;

    if (newState) {
      _startInspector(sm);
      console.info("🛠️ Dev-Mode Enabled");
    } else {
      location.reload();
    }
  });
}

function _startInspector(sm) {
  // Minimaler Inspector-Start
  sm.subscribe(() => {
    if (localStorage.getItem(DEV_KEY) === "true") {
      const debugEl = document.getElementById("debug-state");
      if (debugEl)
        debugEl.textContent = `DevMode Active | State: ${Object.keys(sm.state.content).length} keys`;
    }
  });
}
