// @ts-check
// @adr [[ADR-JS]] {FontFeature}
// @guide [[din-5008-css-architektur]]

/**
 * @file font-feature.js — Preset-Auswahl, Custom-Font-Upload (WOFF2/TTF/OTF),
 * CSS Font Loading API Injection und Persistenz (FontFeature).
 * Aus `settings.js` ausgelagert (2026-11-09): Font-Injection teilt fachlich
 * nichts mit Theme- und Layout-Toggles.
 */

import { deleteBlob, loadBlob, saveBlob } from './binary-storage.js';
import { Constants, notify } from './core.js';
import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';

/** Typ-Referenz auf den SettingsManager (nur Typ, kein Laufzeit-Import). */
/** @typedef {import('./settings.js').SettingsManager} SettingsManager */

/**
 * @param {any} target
 * @param {() => void} fn
 */
function transitionOn(target, fn) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fn();
    return;
  }
  const hatKasten = typeof target?.getBoundingClientRect === 'function' && target.getBoundingClientRect().width > 0;
  if (typeof target.startViewTransition !== 'function' || document.visibilityState !== 'visible' || !hatKasten) {
    fn();
    return;
  }
  try {
    target.startViewTransition(fn).finished.catch(() => {});
  } catch (err) {
    console.debug('[ViewTransition] übersprungen:', err instanceof Error ? err.name : err);
    fn();
  }
}

/**
 * Lokale DIN-5008 Testschriften (eingedampft)
 * @type {Record<string, string>}
 */
export const FONT_PRESETS = {
  default: '',
  inter: '"Test-Inter", sans-serif',
  aptos: '"Test-Aptos", sans-serif',
  michelangelus: '"Test-Michelangelus", serif'
};

export class FontFeature {
  /** @type {SettingsManager | null} */
  #settingsManager;

  /**
   * @param {SettingsManager | { settings: any, updateSettings?: () => void } | null} [settingsManager]
   */
  constructor(settingsManager = null) {
    this.#settingsManager = /** @type {SettingsManager | null} */ (settingsManager);
    /** @type {import('./persistence.js').DinSettings & { previewFont?: string }} */
    this.settings = settingsManager ? settingsManager.settings : loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);

    this.selectFont = /** @type {HTMLSelectElement | null} */ (document.getElementById('select-schriftart'));
    this.btnFontAction = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-schrift-aktion'));
    this.fontUploader = /** @type {HTMLInputElement | null} */ (document.getElementById('font-uploader') || document.getElementById('schrift-uploader'));

    /** @type {FontFace | null} */
    this.activeFontFace = null;
    /** @type {string | null} */
    this.activeFontUrl = null;
    this.isReady = false;
  }

  init() {
    this.applyInitialFont();
    this.attachListeners();
    this.initFontInjection();
    this.isReady = true;
  }

  applyInitialFont() {
    const activePreset = this.settings.previewFont || 'default';
    if (this.selectFont) {
      this.selectFont.value = activePreset;
    }
    if (!this.activeFontFace) {
      if (activePreset !== 'default' && FONT_PRESETS[activePreset]) {
        document.documentElement.style.setProperty('--active-font-family', FONT_PRESETS[activePreset]);
      } else {
        document.documentElement.style.removeProperty('--active-font-family');
      }
    }
  }

  #saveSettings() {
    if (this.#settingsManager && typeof this.#settingsManager.updateSettings === 'function') {
      this.#settingsManager.updateSettings();
    } else {
      saveJSON(STORAGE_KEYS.settings, this.settings);
    }
  }

  initFontInjection() {
    /* Blob-Restore ist async: die eigene Schrift erscheint nach dem Paint. Der FOUC
     * (~50–100 ms Systemschrift) ist bewusst akzeptiert ([[ADR-BINARY-ASSETS]]). */
    loadBlob('font').then((blob) => {
      if (blob) {
        this.injectFont(blob);
      } else {
        this.updateFontStatusUI(false);
      }
    });
  }

  /**
   * Native CSS Font Loading API: kein <style>-String, echtes Fehler-Handling
   * (face.load() rejected bei kaputtem Font), sauberes Entladen via document.fonts.delete.
   * Die Schrift liegt als Blob in IndexedDB und wird über eine Object-URL geladen.
   * @param {Blob} fontBlob
   * @returns {Promise<boolean>}
   */
  async injectFont(fontBlob) {
    if (this.activeFontUrl) {
      URL.revokeObjectURL(this.activeFontUrl);
      this.activeFontUrl = null;
    }
    this.activeFontUrl = URL.createObjectURL(fontBlob);
    const face = new FontFace('CustomUserFont', `url(${this.activeFontUrl})`);
    try {
      await face.load();
    } catch (e) {
      console.warn('[FontFeature] Custom font invalid:', e);
      URL.revokeObjectURL(this.activeFontUrl);
      this.activeFontUrl = null;
      notify(Constants.TOASTS.FONT.FORMAT_ERROR, 'error');
      this.updateFontStatusUI(false);
      return false;
    }
    if (typeof document.fonts !== 'undefined') {
      for (const f of Array.from(document.fonts)) {
        if (f.family === 'CustomUserFont') {
          document.fonts.delete(f);
        }
      }
    }
    document.fonts.add(face);
    this.activeFontFace = face;
    this.updateFontStatusUI(true);
    return true;
  }

  /**
   * @param {boolean} hasCustomFont
   */
  updateFontStatusUI(hasCustomFont) {
    const btn = /** @type {HTMLButtonElement | null} */ (this.btnFontAction);
    const apply = () => {
      if (hasCustomFont) {
        document.documentElement.style.setProperty('--active-font-family', "'CustomUserFont', var(--font-system-stack)");
        if (document.body) {
          document.body.classList.add('schrift-eigene-aktiv');
        }
        if (btn) {
          btn.dataset.fontState = 'loaded';
          btn.dataset.schriftModus = 'reset';
          btn.textContent = '🗑️ Eigene Schrift entfernen';
        }
      } else {
        const preset = this.settings.previewFont || 'default';
        if (preset !== 'default' && FONT_PRESETS[preset]) {
          document.documentElement.style.setProperty('--active-font-family', FONT_PRESETS[preset]);
        } else {
          document.documentElement.style.removeProperty('--active-font-family');
        }
        if (document.body) {
          document.body.classList.remove('schrift-eigene-aktiv');
        }
        if (btn) {
          btn.dataset.fontState = 'empty';
          btn.dataset.schriftModus = 'upload';
          btn.textContent = '🔤 Eigene Schriftart laden';
        }
      }
    };
    if (this.isReady && btn) {
      transitionOn(btn, apply);
    } else {
      apply();
    }
  }

  /**
   * Schaltet zwischen lokalen Test-Schriftarten (Inter, Aptos, Michelangelus)
   * und dem Standard-System-Stack um.
   * @param {string} val
   */
  applyFontPreset(val) {
    const choice = val in FONT_PRESETS ? val : 'default';
    this.settings.previewFont = choice;
    if (this.selectFont) {
      this.selectFont.value = choice;
    }

    if (!this.activeFontFace) {
      if (choice !== 'default' && FONT_PRESETS[choice]) {
        document.documentElement.style.setProperty('--active-font-family', FONT_PRESETS[choice]);
      } else {
        document.documentElement.style.removeProperty('--active-font-family');
      }
    }
    this.#saveSettings();
  }

  resetFont() {
    void deleteBlob('font');
    if (this.activeFontUrl) {
      URL.revokeObjectURL(this.activeFontUrl);
      this.activeFontUrl = null;
    }
    if (typeof document.fonts !== 'undefined') {
      for (const face of Array.from(document.fonts)) {
        if (face.family === 'CustomUserFont') {
          document.fonts.delete(face);
        }
      }
    }
    this.activeFontFace = null;
    this.updateFontStatusUI(false);
    if (this.fontUploader) {
      this.fontUploader.value = '';
    }
  }

  attachListeners() {
    if (this.selectFont) {
      this.selectFont.addEventListener('change', (e) => {
        const val = /** @type {HTMLSelectElement} */ (e.target).value;
        this.applyFontPreset(val);
      });
    }

    if (this.btnFontAction) {
      this.btnFontAction.addEventListener('click', () => {
        const btn = /** @type {HTMLButtonElement} */ (this.btnFontAction);
        if (btn.dataset.fontState === 'loaded' || btn.dataset.schriftModus === 'reset') {
          this.resetFont();
        } else {
          this.fontUploader?.click();
        }
      });
    }

    if (this.fontUploader) {
      this.fontUploader.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const file = target?.files?.[0] ?? null;
        if (!file) return;
        const validExtensions = ['.woff2', '.ttf', '.otf'];
        const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
        if (!isValid) {
          notify(Constants.TOASTS.FONT.FORMAT_ERROR, 'error');
          target.value = '';
          return;
        }
        const maxSizeInBytes = Constants.LIMITS.FONT_SIZE_MAX_KB * 1024;
        if (file.size > maxSizeInBytes) {
          notify(Constants.TOASTS.FONT.SIZE_ERROR, 'error');
          target.value = '';
          return;
        }
        void (async () => {
          const loaded = await this.injectFont(file);
          if (!loaded) return;
          const success = await saveBlob('font', file);
          if (!success) {
            notify(Constants.TOASTS.FONT.SAVE_ERROR, 'error');
          }
        })();
      });
    }
  }
}
