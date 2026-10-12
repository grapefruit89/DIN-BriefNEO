// @ts-check
// @adr [[ADR-JS]] {SettingsManager, SignatureFeature}
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file settings.js — Konsolidiertes UI-, Einstellungs- und Signatur-Modul für DIN-BriefNEO.
 * Bündelt:
 *  1. SettingsManager (ehem. 02-settings-manager.js): Layout (Form A/B), Theme (Auto/Light/Dark), Hilfslinien & Font Injection.
 *  2. SignatureFeature (ehem. 42-signature.js): Bild-Upload, Kompression, interaktives Drag/Resize/Rotate & Persistenz.
 *  3. sanitizeRichText: Re-Export aus document.js.
 */

import { load, save, remove, loadJSON, saveJSON, STORAGE_KEYS, DEFAULT_SETTINGS, Constants } from './persistence.js';
import { eventBus, Events } from './core.js';

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
  target.startViewTransition(fn).finished.catch(() => {});
}

/* =========================================================================================
 * 1. SETTINGS MANAGER
 * ========================================================================================= */

export class SettingsManager {
  /** Erstes applyTheme ist der Initial-Apply — dort ist kein Crossfade sinnvoll. */
  #themeBooted = false;

  constructor() {
    this.settings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    this.btnFormA = document.getElementById('btn-form-a');
    this.btnFormB = document.getElementById('btn-form-b');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.btnGuidesSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('btn-hilfslinien-switch'));
    this.btnCopyfitSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-copyfit'));
    this.btnFontAction = document.getElementById('btn-schrift-aktion');
    this.fontStatusLabel = document.getElementById('schrift-status-label');
    this.fontUploader = document.getElementById('schrift-uploader');
    /** @type {FontFace | null} */
    this.activeFontFace = null;
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
    document.documentElement.setAttribute('data-layout', layout);
    if (this.btnFormA && this.btnFormB) {
      if (layout === 'form-a') {
        /** @type {HTMLInputElement} */ (this.btnFormA).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnFormB).checked = true;
      }
    }

    const currentTheme = this.settings.theme || 'auto';
    this.applyTheme(currentTheme);

    if (this.btnGuidesSwitch) {
      this.btnGuidesSwitch.checked = Boolean(this.settings.guides);
    }
    if (this.btnCopyfitSwitch) {
      this.btnCopyfitSwitch.checked = Boolean(this.settings.copyfit);
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

  updateSettings() {
    saveJSON(STORAGE_KEYS.settings, this.settings);
    this.applySettings();
  }

  /**
   * Layout-Wechsel (Form A/B) mit element-scoped View Transition auf dem Blatt (~0,25s).
   * @param {'form-a' | 'form-b'} layout
   */
  changeLayout(layout) {
    this.settings.layout = layout;
    const blatt = /** @type {HTMLElement | null} */ (document.querySelector('din-a4'));
    if (blatt) {
      transitionOn(blatt, () => this.updateSettings());
    } else {
      this.updateSettings();
    }
  }

  initFontInjection() {
    const savedFont = load(STORAGE_KEYS.font, null);
    if (savedFont) {
      this.injectFont(savedFont);
    } else {
      this.updateFontStatusUI(false);
    }
  }

  /**
   * Native CSS Font Loading API: kein <style>-String, echtes Fehler-Handling
   * (face.load() rejected bei kaputtem Font), sauberes Entladen via document.fonts.delete.
   * @param {string} base64Font
   * @returns {Promise<boolean>}
   */
  async injectFont(base64Font) {
    const face = new FontFace('AptosCustom', `url(${base64Font})`);
    try {
      await face.load();
    } catch (e) {
      console.warn('[Settings] Custom font invalid:', e);
      notify(Constants.TOASTS.FONT_FORMAT_ERROR, 'error');
      this.updateFontStatusUI(false);
      return false;
    }
    if (typeof document.fonts !== 'undefined') {
      for (const f of Array.from(document.fonts)) {
        if (f.family === 'AptosCustom') {
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
    const chip = this.fontStatusLabel;
    if (!chip) return;
    const apply = () => {
      /* Chip-/Button-Text rendert CSS (floating.css, schrift-eigene-aktiv-Selektoren);
       * JS setzt nur den Zustand: body-Klasse + data-schrift-modus. */
      const btn = /** @type {HTMLButtonElement | null} */ (this.btnFontAction);
      if (hasCustomFont) {
        document.body.classList.add('schrift-eigene-aktiv');
        if (btn) btn.dataset.schriftModus = 'reset';
      } else {
        document.body.classList.remove('schrift-eigene-aktiv');
        if (btn) btn.dataset.schriftModus = 'upload';
      }
    };
    if (this.isReady) {
      transitionOn(chip, apply);
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

    const guidesSwitch = this.btnGuidesSwitch;
    if (guidesSwitch) {
      guidesSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.guides = guidesSwitch.checked;
        this.updateSettings();
      });
    }

    const copyfitSwitch = this.btnCopyfitSwitch;
    if (copyfitSwitch) {
      copyfitSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.copyfit = copyfitSwitch.checked;
        this.updateSettings();
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
      });
    }

    if (this.btnFontAction) {
      this.btnFontAction.addEventListener('click', () => {
        const btn = /** @type {HTMLButtonElement} */ (this.btnFontAction);
        if (btn.dataset.schriftModus === 'reset') {
          remove(STORAGE_KEYS.font);
          if (typeof document.fonts !== 'undefined') {
            for (const face of Array.from(document.fonts)) {
              if (face.family === 'AptosCustom') {
                document.fonts.delete(face);
              }
            }
          }
          this.activeFontFace = null;
          this.updateFontStatusUI(false);
        } else {
          /** @type {HTMLInputElement | null} */ (this.fontUploader)?.click();
        }
      });
    }

    if (this.fontUploader) {
      this.fontUploader.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const file = target && target.files ? target.files[0] : null;
        if (!file) return;
        if (!file.name.endsWith('.woff2')) {
          notify(Constants.TOASTS.FONT_FORMAT_ERROR, 'error');
          return;
        }
        const maxSizeInBytes = Constants.LIMITS.FONT_SIZE_MAX_KB * 1024;
        if (file.size > maxSizeInBytes) {
          notify(Constants.TOASTS.FONT_SIZE_ERROR, 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
          const readerTarget = /** @type {FileReader} */ (event.target);
          const base64Font = readerTarget ? readerTarget.result : null;
          if (typeof base64Font !== 'string') {
            notify('❌ Fehler beim dauerhaften Speichern der Schriftart', 'error');
            return;
          }
          const loaded = await this.injectFont(base64Font);
          if (loaded) {
            const success = save(STORAGE_KEYS.font, base64Font);
            if (!success) {
              notify('❌ Fehler beim dauerhaften Speichern der Schriftart', 'error');
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }
}

/* =========================================================================================
 * 2. SIGNATURE FEATURE
 * ========================================================================================= */

export class SignatureFeature {
  /**
   * @param {{ settings: any, save?: () => void, saveSettings?: () => void }} settingsContext
   */
  constructor(settingsContext) {
    this.ui = settingsContext;
    this.imgElement = /** @type {HTMLImageElement | null} */ (document.getElementById('unterschriftsbild-vorschau'));
    this.uploader = /** @type {HTMLInputElement | null} */ (document.getElementById('unterschriftsbild-datei'));
    this.btnTrigger = document.getElementById('btn-unterschriftsbild-waehlen');
    this.btnReset = document.getElementById('btn-unterschriftsbild-reset');
    
    /** @type {{x: number, y: number, scale: number, rot: number}} */
    this.state = { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };

    this.bbox = document.getElementById('unterschriftsbild-box');
    this.container = document.getElementById('unterschriftsbild-container');

    // Config: Maximale Dimension für hochauflösende Druck-/PDF-Wiedergabe
    this.MAX_DIM = 1400;

    /** @type {string | null} */
    this.currentBlobUrl = null;
  }

  init() {
    if (!this.uploader || !this.imgElement) return;

    // Zero-Base64: Alte Base64-Signaturbilder aus Settings restlos bereinigen
    if (this.ui.settings?.signatureImage) {
      delete this.ui.settings.signatureImage;
      this.#saveSettings();
    }

    this.uploader.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      const file = target && target.files ? target.files[0] : null;
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
  }

  initWysiwyg() {
    const bbox = this.bbox;
    const container = this.container;
    if (!bbox || !container) return;

    const savedState = this.ui.settings?.signatureState || this.ui.settings?.signature?.transform;
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
        if (this.imgElement && this.imgElement.src && this.imgElement.src !== window.location.href) {
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
        const blatt = document.querySelector('din-a4');
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
    if (typeof this.ui?.save === 'function') {
      this.ui.save();
    } else if (typeof this.ui?.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }

  saveState() {
    if (!this.ui.settings) this.ui.settings = {};
    this.ui.settings.signatureState = { x: this.state.x, y: this.state.y, scale: this.state.scale, rot: this.state.rot };
    delete this.ui.settings.signatureImage;
    this.#saveSettings();
  }

  /**
   * Zero-Base64: Bilddaten rein ephemer über OffscreenCanvas, WebP-Blob und ObjectURL.
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

    const maxDim = this.MAX_DIM || 1400;
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
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = URL.createObjectURL(blob);

      if (this.imgElement) {
        this.imgElement.src = this.currentBlobUrl;
      }

      this.saveState();
    } catch (error) {
      console.warn('[Signature] convertToBlob failed:', error);
    }
  }

  resetImage() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    if (this.imgElement) {
      this.imgElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
    }

    if (this.ui.settings) {
      delete this.ui.settings.signatureImage;
      delete this.ui.settings.signatureState;
    }
    
    this.state = { x: 11.9, y: 96.0, scale: 0.5, rot: 0 };
    this.applyTransform();
    if (this.bbox) this.bbox.classList.remove('active');

    this.#saveSettings();
  }
}
