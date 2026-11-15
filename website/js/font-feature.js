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
    this.btnSystemFonts = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-systemschriften'));

    /** Installierte Familien aus der Local Font Access API: Name -> FontData. */
    this.systemFonts = new Map();
    /** @type {FontFace | null} */
    this.activeSystemFace = null;

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
    this.#initSystemFonts();
    this.isReady = true;
  }

  /* --- Systemschriften (Local Font Access API) ---------------------------
   * `queryLocalFonts()` liefert die auf dem Rechner installierten Familien.
   * Der Browser fragt beim ersten Aufruf nach Erlaubnis; ohne Erlaubnis wirft
   * die API `NotAllowedError`. Dann bleibt es beim Standard-Stack — der Knopf
   * ist da, die Liste unveraendert.
   *
   * Die Schriften werden NICHT gespeichert: die Berechtigung gilt pro Sitzung
   * fuer den Origin, die Liste wird bei Bedarf neu abgefragt. Ein Eintrag im
   * `previewFont`-Feld ueberlebt deshalb keinen Reload, und das ist Absicht
   * (sonst zeigte ein Brief auf eine Schrift, die es auf dem Zielrechner
   * vielleicht nicht gibt). */
  /**
   * Die API steht nicht im lib.dom von TypeScript 5.x — deshalb der Umweg
   * ueber `globalThis` mit Cast, statt die Typen zu erweitern.
   * @returns {(() => Promise<any[]>) | null}
   */
  #queryLocalFontsApi() {
    const api = /** @type {any} */ (globalThis).queryLocalFonts;
    return typeof api === 'function' ? api : null;
  }

  #initSystemFonts() {
    if (!this.btnSystemFonts) return;
    if (!this.#queryLocalFontsApi()) return;
    this.btnSystemFonts.hidden = false;
    this.btnSystemFonts.addEventListener('click', () => {
      void this.ladeSystemschriften();
    });
  }

  async ladeSystemschriften() {
    const btn = this.btnSystemFonts;
    const api = this.#queryLocalFontsApi();
    if (!api) return;
    if (btn) btn.disabled = true;
    try {
      const fonts = await api();
      this.systemFonts.clear();
      for (const font of fonts) {
        if (!this.systemFonts.has(font.family)) this.systemFonts.set(font.family, font);
      }
      this.#baueSystemOptionen();
      notify(`${this.systemFonts.size} Systemschriften gefunden.`, 'info');
    } catch (e) {
      console.warn('[FontFeature] Systemschriften nicht verfügbar:', e);
      notify('Systemschriften wurden nicht freigegeben.', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  #baueSystemOptionen() {
    if (!this.selectFont) return;
    const alt = this.selectFont.querySelector('optgroup[data-systemschriften]');
    if (alt) alt.remove();
    const gruppe = document.createElement('optgroup');
    gruppe.setAttribute('data-systemschriften', '');
    gruppe.label = 'Systemschriften (lokal)';
    for (const family of [...this.systemFonts.keys()].sort((a, b) => a.localeCompare(b, 'de'))) {
      const option = document.createElement('option');
      option.value = `sys:${family}`;
      option.textContent = family;
      gruppe.append(option);
    }
    this.selectFont.append(gruppe);
  }

  /**
   * Laedt eine installierte Familie als `FontFace` und setzt sie als
   * Briefschrift. Der Wert kommt als `sys:<Familie>` aus der Auswahlliste.
   * @param {string} family
   */
  async #applySystemFont(family) {
    const daten = this.systemFonts.get(family);
    if (!daten) return;
    if (this.activeSystemFace && typeof document.fonts !== 'undefined') {
      document.fonts.delete(this.activeSystemFace);
      this.activeSystemFace = null;
    }
    try {
      const blob = await daten.blob();
      const face = new FontFace(family, await blob.arrayBuffer());
      await face.load();
      document.fonts.add(face);
      this.activeSystemFace = face;
      document.documentElement.style.setProperty(
        '--active-font-family',
        `"${family}", var(--font-system-stack)`,
      );
    } catch (e) {
      console.warn('[FontFeature] Systemschrift nicht ladbar:', e);
      notify(Constants.TOASTS.FONT.FORMAT_ERROR, 'error');
    }
  }

  applyInitialFont() {
    const gespeichert = this.settings.previewFont || 'default';
    /* Eine Systemschrift ueberlebt den Reload nicht: die Liste entsteht erst
       auf Klick (Berechtigung). Bliebe der Wert stehen, zeigte die Auswahl
       leer und der Brief still die Standardschrift — dann lieber gleich
       zurueck auf `default`, sichtbar und ehrlich. */
    const waehlbar = gespeichert in FONT_PRESETS || gespeichert === 'default';
    const activePreset = waehlbar ? gespeichert : 'default';
    if (!waehlbar) {
      this.settings.previewFont = 'default';
      this.#saveSettings();
    }
    if (this.selectFont) {
      this.selectFont.value = activePreset;
    }
    if (!this.activeFontFace) {
      this.#applyPresetCss(activePreset);
    }
  }

  /**
   * Setzt die Preset-Schrift als CSS-Variable - die EINE Stelle dafuer.
   * Vorher stand dieselbe Bedingung in applyInitialFont, updateFontStatusUI
   * und applyFontPreset (B8-Review 2026-11-12).
   * @param {string} [preset]
   */
  #applyPresetCss(preset) {
    const name = preset || 'default';
    if (name !== 'default' && FONT_PRESETS[name]) {
      document.documentElement.style.setProperty('--active-font-family', FONT_PRESETS[name]);
    } else {
      document.documentElement.style.removeProperty('--active-font-family');
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
     * (~50–100 ms Systemschrift) ist bewusst akzeptiert ([[ADR-BINARY-ASSETS]]).
     * Ein Ladefehler bleibt bewusst STILL (entschieden 2026-11-13, B13): die
     * Schrift ist optional, und ein Toast bei jedem Oeffnen (z. B. blockierte
     * IndexedDB durch einen anderen Tab) waere Laerm ohne Handlungsoption.
     * Speichern ist die andere Richtung: dort ist der Toast Pflicht. */
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
          /* Ein Zustandsattribut: `data-font-state` ist das, was CSS und
             index.html lesen. `data-schrift-modus` fuehrte denselben Zustand
             ein zweites Mal (B8-Review 2026-11-12). */
          btn.dataset.fontState = 'loaded';
          btn.textContent = '🗑️ Eigene Schrift entfernen';
        }
      } else {
        this.#applyPresetCss(this.settings.previewFont || 'default');
        if (document.body) {
          document.body.classList.remove('schrift-eigene-aktiv');
        }
        if (btn) {
          btn.dataset.fontState = 'empty';
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
    /* Systemschriften laufen an den Presets vorbei: `sys:<Familie>` wird als
       FontFace geladen, nicht als fester Stack. */
    if (typeof val === 'string' && val.startsWith('sys:')) {
      const family = val.slice(4);
      this.settings.previewFont = val;
      void this.#applySystemFont(family);
      this.#saveSettings();
      return;
    }
    const choice = val in FONT_PRESETS ? val : 'default';
    this.settings.previewFont = choice;
    if (this.selectFont) {
      this.selectFont.value = choice;
    }

    if (!this.activeFontFace) {
      this.#applyPresetCss(choice);
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
        if (btn.dataset.fontState === 'loaded') {
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
          if (!loaded) {
            /* Feld leeren: sonst loest dieselbe Datei kein change mehr aus und
               der Nutzer muss erst eine andere waehlen (B8-Review 2026-11-12). */
            target.value = '';
            return;
          }
          const success = await saveBlob('font', file);
          if (!success) {
            notify(Constants.TOASTS.FONT.SAVE_ERROR, 'error');
          }
        })();
      });
    }
  }
}
