// @ts-check
// @adr [[ADR-JS]] {SettingsManager, SignatureFeature}
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file settings.js — Konsolidiertes UI-, Einstellungs- und Signatur-Modul für DIN-BriefNEO.
 * Bündelt:
 *  1. SettingsManager (ehem. 02-settings-manager.js): Layout (Form A/B), Theme (Auto/Light/Dark), Hilfslinien & Font Injection.
 *  2. SignatureFeature (ehem. 42-signature.js): Bild-Upload, Kompression, interaktives Drag/Resize/Rotate & Persistenz.
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
  target.startViewTransition(fn).finished.catch(console.debug);
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

/* =========================================================================================
 * 2. SIGNATURE FEATURE
 * ========================================================================================= */

export class SignatureFeature {
  /**
   * @param {SettingsManager | { settings: any, updateSettings?: () => void } | null} [settingsManager]
   */
  constructor(settingsManager = null) {
    this.settingsManager = settingsManager;
    /** @type {any} */
    this.settings = settingsManager ? settingsManager.settings : {};
    this.imgElement = /** @type {HTMLImageElement | null} */ (document.getElementById('unterschriftsbild-vorschau'));
    this.uploader = /** @type {HTMLInputElement | null} */ (document.getElementById('unterschriftsbild-datei'));
    this.btnTrigger = document.getElementById('btn-unterschriftsbild-waehlen');
    this.btnReset = document.getElementById('btn-unterschriftsbild-reset');
    
    /** @type {{x: number, y: number, scale: number, rot: number}} */
    this.state = { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };

    this.bbox = document.getElementById('unterschriftsbild-box');
    this.container = document.getElementById('unterschriftsbild-container');

    // Config: Maximale Dimension für hochauflösende Druck-/PDF-Wiedergabe (< 15 KB WebP)
    this.MAX_DIM = 800;

    /** @type {string | null} */
    this.currentBlobUrl = null;
  }

  init() {
    if (!this.uploader || !this.imgElement) return;

    // Zero-Base64: Alte Base64-Signaturbilder aus Settings restlos bereinigen
    if (this.settings?.signatureImage) {
      this.settings.signatureImage = undefined;
      this.#saveSettings();
    }

    this.uploader.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      const file = target?.files?.[0] ?? null;
      if (file) {
        this.processFile(file);
      }
      if (target) target.value = '';
    });

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.resetImage();
      });
    }

    this.initWysiwyg();

    // Bild liegt als Blob in IndexedDB; der Restore ist async und erscheint nach dem Paint.
    loadBlob('signature').then((blob) => {
      if (!blob) return;
      this.#setImageFromBlob(blob);
      this.applyTransform();
    });
  }

  initWysiwyg() {
    const bbox = this.bbox;
    const container = this.container;
    if (!bbox || !container) return;

    const savedState = this.settings?.signatureState || this.settings?.signature?.transform;
    if (savedState) {
      this.state = {
        x: typeof savedState.x === 'number' && Number.isFinite(savedState.x) ? savedState.x : 11.9,
        y: typeof savedState.y === 'number' && Number.isFinite(savedState.y) ? savedState.y : 96.0,
        scale: typeof savedState.scale === 'number' && Number.isFinite(savedState.scale)
          ? Math.max(0.15, Math.min(4.5, savedState.scale))
          : 0.5,
        rot: typeof savedState.rot === 'number' && Number.isFinite(savedState.rot) ? savedState.rot : 0
      };
    }
    this.applyTransform();

    document.addEventListener('pointerdown', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (bbox.contains(target)) {
        if (this.imgElement?.src && this.imgElement.src !== window.location.href) {
          bbox.classList.add('active');
        }
      } else {
        bbox.classList.remove('active');
      }
    });

    /** @type {{
     *   action: string | null,
     *   startX: number, startY: number,
     *   centerX: number, centerY: number,
     *   startAngle: number, startDistance: number,
     *   initial: {x: number, y: number, scale: number, rot: number} | null
     * }} */
    const interaction = {
      action: null,
      startX: 0, startY: 0,
      centerX: 0, centerY: 0,
      startAngle: 0, startDistance: 0,
      initial: null
    };

    bbox.addEventListener('pointerdown', (e) => {
      if (!bbox.classList.contains('active')) return;
      e.preventDefault();

      const target = /** @type {HTMLElement} */ (e.target);
      interaction.action = target.dataset.aktion || 'drag';

      interaction.startX = e.clientX;
      interaction.startY = e.clientY;
      interaction.initial = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };

      const rect = bbox.getBoundingClientRect();
      interaction.centerX = rect.left + rect.width / 2;
      interaction.centerY = rect.top + rect.height / 2;

      interaction.startAngle = Math.atan2(e.clientY - interaction.centerY, e.clientX - interaction.centerX);
      interaction.startDistance = Math.hypot(e.clientX - interaction.centerX, e.clientY - interaction.centerY);

      bbox.setPointerCapture(e.pointerId);
    });

    const SNAP_TARGETS = [0, 54.74, -54.74, 90, -90, 180, -180];
    const SNAP_TOLERANCE = 2.5;

    bbox.addEventListener('pointermove', (e) => {
      if (!interaction.action || !interaction.initial) return;
      e.preventDefault();

      if (interaction.action === 'drag') {
        const blatt = document.querySelector('din-blatt');
        const blattWidth = blatt ? blatt.getBoundingClientRect().width : 800;
        const pxToCqw = 100 / (blattWidth || 1);
        this.state.x = interaction.initial.x + (e.clientX - interaction.startX) * pxToCqw;
        this.state.y = interaction.initial.y + (e.clientY - interaction.startY) * pxToCqw;
      } else if (interaction.action === 'rotate') {
        const currentAngle = Math.atan2(e.clientY - interaction.centerY, e.clientX - interaction.centerX);
        const deltaRot = (currentAngle - interaction.startAngle) * (180 / Math.PI);
        const rawRot = interaction.initial.rot + deltaRot;

        // Magnetisches Snapping (CAD-Modus)
        const normalized = ((rawRot + 180) % 360 + 360) % 360 - 180;
        let snapped = rawRot;
        for (const target of SNAP_TARGETS) {
          if (Math.abs(normalized - target) <= SNAP_TOLERANCE) {
            snapped = rawRot + (target - normalized);
            break;
          }
        }
        this.state.rot = snapped;
      } else if (interaction.action === 'resize') {
        const currentDist = Math.hypot(e.clientX - interaction.centerX, e.clientY - interaction.centerY);
        const scaleFactor = currentDist / (interaction.startDistance || 1);
        const newScale = interaction.initial.scale * scaleFactor;
        this.state.scale = Math.max(0.15, Math.min(4.5, newScale));
      }
      this.applyTransform();
    });

    bbox.addEventListener('pointerup', (e) => {
      if (interaction.action) {
        bbox.releasePointerCapture(e.pointerId);
        interaction.action = null;
        this.saveState();
      }
    });
    bbox.addEventListener('pointercancel', (e) => {
      if (interaction.action) {
        bbox.releasePointerCapture(e.pointerId);
        interaction.action = null;
      }
    });
  }

  applyTransform() {
    if (this.container) {
      this.container.style.setProperty('--sig-x', `${this.state.x}cqw`);
      this.container.style.setProperty('--sig-y', `${this.state.y}cqw`);
      this.container.style.setProperty('--sig-scale', `${this.state.scale}`);
      this.container.style.setProperty('--sig-rot', `${this.state.rot}deg`);
    }
  }

  #saveSettings() {
    if (this.settingsManager && typeof this.settingsManager.updateSettings === 'function') {
      this.settingsManager.updateSettings();
    }
  }

  saveState() {
    if (!this.settings) this.settings = {};
    this.settings.signatureState = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };
    this.settings.signatureImage = undefined;
    this.#saveSettings();
  }

  /**
   * Setzt das Vorschaubild aus einem Blob und gibt die vorherige Object-URL frei.
   * @param {Blob} blob
   */
  #setImageFromBlob(blob) {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
    this.currentBlobUrl = URL.createObjectURL(blob);
    if (this.imgElement) {
      this.imgElement.src = this.currentBlobUrl;
    }
  }

  /**
   * Kompaktes WebP als Blob in IndexedDB (Key `signature`, siehe [[ADR-BINARY-ASSETS]]).
   * @param {File} file
   */
  async processFile(file) {
    /** @type {ImageBitmap} */
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch (error) {
      console.warn('[Signature] createImageBitmap failed:', error);
      return;
    }

    const maxDim = this.MAX_DIM || 800;
    const scale = Math.min(1, maxDim / bitmap.width, maxDim / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    try {
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.82 });
      const saved = await saveBlob('signature', blob);
      if (!saved) {
        notify(Constants.TOASTS.SIGNATURE.SAVE_ERROR, 'error');
        return;
      }

      this.#setImageFromBlob(blob);
      this.saveState();
    } catch (error) {
      console.warn('[Signature] convertToBlob / save failed:', error);
    }
  }

  resetImage() {
    void deleteBlob('signature');

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    if (this.imgElement) {
      this.imgElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
    }

    if (this.settings) {
      this.settings.signatureImage = undefined;
      this.settings.signatureState = undefined;
    }
    
    this.state = { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };
    this.applyTransform();
    if (this.bbox) this.bbox.classList.remove('active');

    this.#saveSettings();
  }
}
