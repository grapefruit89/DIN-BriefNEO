// @ts-check
// @adr [[ADR-JS]] {SettingsManager}
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file settings.js — Layout, Theme, Hilfslinien und Font-Injection (SettingsManager).
 * Die Signatur-Engine liegt seit 2026-11-08 in `signature.js`.
 */

import { deleteBlob, loadBlob, saveBlob } from './binary-storage.js';
import { Constants, Events, eventBus } from './core.js';
import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';

/**
 * @param {string} message
 * @param {string} [type]
 */
const notify = (message, type = 'info') => eventBus.publish(Events.NOTIFICATION_REQUESTED, { message, type });

/**
 * @param {any} target
 * @param {() => void} fn
 */
function transitionOn(target, fn) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fn();
    return;
  }
  // Ohne API, im Hintergrund-Tab oder bei bereits laufender Transition wirft
  // der Browser InvalidStateError (B37). Ebenso, wenn das Ziel gar keinen
  // Layout-Kasten hat (z. B. der Schrift-Button im versteckten Einstellungs-
  // Modus, Breite 0): "Unsupported layout or style". Dann direkt mutieren.
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

/* =========================================================================================
 * 1. SETTINGS MANAGER
 * ========================================================================================= */

export class SettingsManager {
  /** Erstes applyTheme ist der Initial-Apply — dort ist kein Crossfade sinnvoll. */
  #themeBooted = false;

  constructor() {
    /** @type {import('./persistence.js').DinSettings & { style?: string }} */
    this.settings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    this.btnFormA = document.getElementById('btn-form-a');
    this.btnFormB = document.getElementById('btn-form-b');
    this.seitenleiste = document.getElementById('seitenleiste');
    this.btnZurueck = document.getElementById('btn-zurueck');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.styleSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('style-select'));
    this.btnGuidesSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('btn-hilfslinien-switch'));
    this.btnMarksSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-falzmarken'));
    this.btnSensitiveSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-sensibler-betreff'));
    this.btnFontAction = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-schrift-aktion'));
    this.fontUploader = /** @type {HTMLInputElement | null} */ (document.getElementById('font-uploader') || document.getElementById('schrift-uploader'));
    /** @type {FontFace | null} */
    this.activeFontFace = null;
    /** @type {string | null} */
    this.activeFontUrl = null;
    this.isReady = false;
  }

  init() {
    this.applySettings();
    this.initFontInjection();
    this.attachListeners();
    this.isReady = true;
  }

  applySettings() {
    const layout = this.settings.layout || 'form-b';
    if (this.btnFormA && this.btnFormB) {
      if (layout === 'form-a') {
        /** @type {HTMLInputElement} */ (this.btnFormA).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnFormB).checked = true;
      }
    }

    const currentTheme = this.settings.theme || 'auto';
    this.applyTheme(currentTheme);

    const currentStyle = this.settings.style || 'default';
    this.applyStyle(currentStyle);

    if (this.btnGuidesSwitch) {
      this.btnGuidesSwitch.checked = Boolean(this.settings.guides);
    }
    if (this.btnMarksSwitch) {
      this.btnMarksSwitch.checked = this.settings.marks !== false;
    }
    if (this.btnSensitiveSwitch) {
      this.btnSensitiveSwitch.checked = Boolean(this.settings.sensitiveSubject);
    }

    this.#spiegleLayoutFlags();
  }

  /**
   * Layout-Flags als data-Attribute am <html>. Das CSS liest sie; die
   * Checkboxen sind nur noch Bedienoberfläche. Der Boot-Block setzt denselben
   * Zustand vor dem ersten Paint — hier wird er nach jedem Settings-Update
   * nachgezogen (und korrigiert, falls das Boot-Script scheiterte).
   */
  #spiegleLayoutFlags() {
    const root = document.documentElement;
    root.setAttribute('data-guides', this.settings.guides ? 'true' : 'false');
    root.setAttribute('data-marks', this.settings.marks === false ? 'false' : 'true');
    root.setAttribute('data-sensitive-subject', this.settings.sensitiveSubject ? 'true' : 'false');
  }

  /**
   * @param {'auto' | 'light' | 'dark' | string} theme
   */
  applyTheme(theme) {
    const validThemes = ['auto', 'light', 'dark'];
    const active = validThemes.includes(theme) ? theme : 'auto';
    this.settings.theme = active;

    const updateDOM = () => {
      document.documentElement.setAttribute('data-theme', active);
      if (document.body) {
        document.body.setAttribute('data-theme', active);
      }

      if (this.btnThemeToggle) {
        /* Sichtbares Label rendert CSS (floating.css, data-erscheinungsbild-Selektoren). */
        const titles = /** @type {Record<string, string>} */ ({ auto: 'Darstellung: Automatisch (System)', light: 'Darstellung: Helles Design', dark: 'Darstellung: Dunkles Design' });
        this.btnThemeToggle.setAttribute('data-erscheinungsbild', active);
        this.btnThemeToggle.setAttribute('title', titles[active] || 'Darstellung: Automatisch');
        this.btnThemeToggle.setAttribute('aria-label', titles[active] || 'Darstellung: Automatisch');
      }
    };

    const themeUnchanged = document.documentElement.getAttribute('data-theme') === active && (!document.body || document.body.getAttribute('data-theme') === active);
    if (!themeUnchanged && this.isReady && this.#themeBooted) {
      transitionOn(document, updateDOM);
    } else {
      updateDOM();
    }
    this.#themeBooted = true;
  }

  /**
   * Schaltet zwischen Brief-Modus und Einstellungs-Modus der Seitenleiste um.
   * @param {'brief' | 'einstellungen'} [force]
   */
  toggleSettingsModus(force) {
    const toggle = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-modus'));
    if (!toggle) return;
    const isChecked = force !== undefined ? force === 'einstellungen' : !toggle.checked;
    toggle.checked = isChecked;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
    // Der Zustand liegt ausschließlich in der nativen Checkbox; das Label trägt
    // weder Rolle noch Zustand (sonst zwei Controls im Accessibility-Tree).
  }

  /**
   * @param {'default' | 'compact' | string} style
   */
  applyStyle(style) {
    const validStyles = ['default', 'compact'];
    const active = validStyles.includes(style) ? style : 'default';
    this.settings.style = active;
    document.documentElement.setAttribute('data-style', active);
    if (this.styleSelect) {
      this.styleSelect.value = active;
    }
  }

  updateSettings() {
    const gespeichert = saveJSON(STORAGE_KEYS.settings, this.settings);
    if (!gespeichert) {
      // saveJSON schluckt Quota-Fehler und gibt false zurück; ohne diese Prüfung
      // verschwände der Zustand still (B46).
      eventBus.publish(Events.DOCUMENT_SAVE_FAILED, {
        message: 'Einstellungen konnten nicht gespeichert werden (Speicher voll?).'
      });
    }
    this.applySettings();
  }

  /**
   * Layout-Wechsel (Form A/B) mit element-scoped View Transition auf dem Blatt (~0,25s).
   * @param {'form-a' | 'form-b'} layout
   */
  changeLayout(layout) {
    this.settings.layout = layout;
    const blatt = /** @type {HTMLElement | null} */ (document.querySelector('din-blatt'));
    if (blatt) {
      transitionOn(blatt, () => this.updateSettings());
    } else {
      this.updateSettings();
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
      console.warn('[Settings] Custom font invalid:', e);
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
        document.documentElement.style.removeProperty('--active-font-family');
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

  attachListeners() {
    if (this.btnFormA) {
      this.btnFormA.addEventListener('change', () => {
        if (!this.isReady) return;
        this.changeLayout('form-a');
      });
    }
    if (this.btnFormB) {
      this.btnFormB.addEventListener('change', () => {
        if (!this.isReady) return;
        this.changeLayout('form-b');
      });
    }

    if (this.btnZurueck) {
      this.btnZurueck.addEventListener('click', () => {
        if (!this.isReady) return;
        this.toggleSettingsModus('brief');
      });
    }

    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => {
        if (!this.isReady) return;
        /** @type {Record<string, string>} */
        const cycle = { auto: 'light', light: 'dark', dark: 'auto' };
        const current = this.settings.theme || 'auto';
        const next = cycle[current] || 'auto';
        this.settings.theme = next;
        this.updateSettings();
      });
    }

    if (this.styleSelect) {
      this.styleSelect.addEventListener('change', () => {
        if (!this.isReady) return;
        const val = this.styleSelect ? this.styleSelect.value : 'default';
        this.applyStyle(val);
        this.updateSettings();
      });
    }

    const guidesSwitch = this.btnGuidesSwitch;
    if (guidesSwitch) {
      guidesSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.guides = guidesSwitch.checked;
        this.updateSettings();
      });
    }

    const marksSwitch = this.btnMarksSwitch;
    if (marksSwitch) {
      marksSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.marks = marksSwitch.checked;
        this.updateSettings();
      });
    }

    const sensitiveSwitch = this.btnSensitiveSwitch;
    if (sensitiveSwitch) {
      sensitiveSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.sensitiveSubject = sensitiveSwitch.checked;
        this.updateSettings();
      });
    }

    if (this.btnFontAction) {
      this.btnFontAction.addEventListener('click', () => {
        const btn = /** @type {HTMLButtonElement} */ (this.btnFontAction);
        if (btn.dataset.fontState === 'loaded' || btn.dataset.schriftModus === 'reset') {
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
          const uploader = /** @type {HTMLInputElement | null} */ (this.fontUploader);
          if (uploader) uploader.value = '';
        } else {
          /** @type {HTMLInputElement | null} */ (this.fontUploader)?.click();
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
