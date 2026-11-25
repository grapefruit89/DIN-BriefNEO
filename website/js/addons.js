// @ts-check
// @adr [[ADR-KISS-MINIMAL-JS]] {AddonManager}

/**
 * @file addons.js — Minimaler, robuster Addon-Manager & Plugin-Punkt (B52).
 *
 * Invarianten (ADR-KISS-MINIMAL-JS):
 * 1. 0 Byte im Boot-Pfad: Module werden erst beim ersten Event (Klick/Change) importiert.
 * 2. In-Flight Locks: Verhindert doppelte Aufrufe bei schnellen Mehrfach-Klicks.
 * 3. Einheitlicher Vertrag:
 *    - Aktions-Addons: export async function run(action, arg, ctx)
 *    - Toggle-Plugins: export async function activate(ctx) -> optional dispose()
 * 4. Poka-Yoke: Ein CI-Vertragstest in test/all.js verifiziert alle Hooks gegen die Registry.
 */


/**
 * Typ-Definition für das Kontextobjekt, das an Addons übergeben wird.
 * @typedef {{
 *   signal?: AbortSignal,
 *   event?: Event,
 *   [key: string]: any
 * }} AddonContext
 */

/**
 * Registry aller verfügbaren Addons.
 * Statische Loader-Funktionen ermöglichen Typprüfung und Tree-Shaking ohne Path-Injection.
 */
export const ADDON_REGISTRY = /** @type {const} */ ({
  testbrief: () => import('../addons/testbrief/testbrief.js'),
  geschaeftsangaben: () => import('../addons/geschaeftsangaben/geschaeftsangaben.js'),
  verlauf: () => import('../addons/verlauf/verlauf.js'),
  fokusmodus: () => import('../addons/fokusmodus/fokusmodus.js'),
});

/** @typedef {keyof typeof ADDON_REGISTRY} AddonId */

/**
 * Cache für geladene Module und laufende Import-Promises (In-Flight Lock).
 * @type {Map<string, any>}
 */
const moduleCache = new Map();

/**
 * Aktive Toggle-Addons mit ihren AbortControllern und optionalen Cleanups.
 * @type {Map<string, { controller: AbortController, dispose?: () => void }>}
 */
const activePlugins = new Map();

/**
 * Lädt ein Addon-Modul on-demand mit In-Flight Locking und Cache.
 * @param {AddonId | string} id
 * @returns {Promise<any>}
 */
export async function loadAddon(id) {
  if (moduleCache.has(id)) {
    return moduleCache.get(id);
  }

  const loader = ADDON_REGISTRY[/** @type {AddonId} */ (id)];
  if (!loader) {
    throw new Error(`[AddonManager] Unbekanntes Addon: "${id}"`);
  }

  try {
    const modPromise = loader();
    moduleCache.set(id, modPromise);
    const mod = await modPromise;
    moduleCache.set(id, mod);
    return mod;
  } catch (err) {
    moduleCache.delete(id);
    throw err;
  }
}

/**
 * Führt eine Einmal-Aktion eines Addons aus.
 * @param {AddonId | string} id
 * @param {string} [action]
 * @param {any} [arg]
 * @param {AddonContext} [ctx]
 */
export async function invokeAddon(id, action = 'start', arg = null, ctx = {}) {
  try {
    const mod = await loadAddon(id);
    if (typeof mod.run === 'function') {
      return await mod.run(action, arg, ctx);
    }
    // Fallbacks für bestehende Exporte
    if (action === 'start' && typeof mod.starteTestbrief === 'function') {
      return await mod.starteTestbrief();
    }
    if (action === 'demo' && typeof mod.fuelleDemoText === 'function') {
      return mod.fuelleDemoText(arg || 'lang');
    }
    throw new Error(`[AddonManager] Addon "${id}" exportiert weder run() noch passende Aktion "${action}"`);
  } catch (err) {
    console.error(`[AddonManager] Fehler beim Ausführen von Addon "${id}":`, err);
    throw err;
  }
}

/**
 * Aktiviert oder deaktiviert ein Toggle-Plugin mit sauberem Lebenszyklus.
 * @param {AddonId | string} id
 * @param {boolean} enabled
 * @param {AddonContext} [ctx]
 */
export async function toggleAddon(id, enabled, ctx = {}) {
  if (!enabled) {
    const active = activePlugins.get(id);
    if (active) {
      active.controller.abort();
      if (typeof active.dispose === 'function') {
        try { active.dispose(); } catch (e) { console.warn(e); }
      }
      activePlugins.delete(id);
    }
    return;
  }

  if (activePlugins.has(id)) return; // Bereits aktiv

  const controller = new AbortController();
  activePlugins.set(id, { controller });

  try {
    const mod = await loadAddon(id);
    const activateFn = mod.activate || mod.aktiviere;
    if (typeof activateFn === 'function') {
      const dispose = await activateFn({ ...ctx, signal: controller.signal });
      const current = activePlugins.get(id);
      if (current) current.dispose = dispose;
    }
  } catch (err) {
    activePlugins.delete(id);
    console.error(`[AddonManager] Fehler beim Aktivieren von Plugin "${id}":`, err);
  }
}

/**
 * Initialisiert die deklarative Event-Delegation auf dem Container (Seitenleiste).
 * Reagiert auf:
 * - Klicks auf [data-addon]
 * - Changes auf [data-addon-toggle]
 * @param {HTMLElement | Document} [root]
 */
export function initAddonDispatcher(root = document) {
  // 1. Klick-Delegation für Aktions-Buttons
  root.addEventListener('click', (e) => {
    const target = /** @type {HTMLElement | null} */ (e.target);
    const btn = target?.closest?.('button[data-addon], [role="button"][data-addon], [data-addon][data-addon-action]');
    if (!btn || !(btn instanceof HTMLElement)) return;

    const addonId = btn.dataset.addon;
    if (!addonId) return;

    const action = btn.dataset.addonAction || 'start';
    const arg = btn.dataset.addonArg || null;

    btn.setAttribute('aria-busy', 'true');
    invokeAddon(addonId, action, arg, { event: e })
      .finally(() => {
        btn.removeAttribute('aria-busy');
      });
  });

  // 2. Change-Delegation für Plugin-Switches
  root.addEventListener('change', (e) => {
    const target = /** @type {HTMLInputElement | null} */ (e.target);
    if (!target || !(target instanceof HTMLInputElement) || !target.dataset.addonToggle) return;

    const addonId = target.dataset.addonToggle;
    toggleAddon(addonId, target.checked, { event: e });
  });
}
