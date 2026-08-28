/* OPTIMIERUNG JS-KILLER: Die Höhenberechnungen für jegliche Akkordeons fallen komplett weg (calc-size(auto, size)). Die Theme-Toggle-Logik ändert nur noch den LocalStorage; das Layout wird komplett via light-dark() und has() ohne JS-Klassenwechsel gesteuert. */
// @ts-check
import { StorageManager } from './52-storage.js';
import { Constants } from './51-constants.js';
import { showToast } from './32-toast.js';

export class SettingsManager {
  constructor() {
    this.settings = StorageManager.loadSettings();

    // Elements
    /** @type {HTMLElement | null} */
    this.shell = document.getElementById('app-shell');
    /** @type {HTMLElement | null} */
    this.btnFormA = document.getElementById('btn-form-a');
    /** @type {HTMLElement | null} */
    this.btnFormB = document.getElementById('btn-form-b');
    /** @type {HTMLElement | null} */
    this.btnThemeLight = document.getElementById('btn-theme-light');
    /** @type {HTMLElement | null} */
    this.btnThemeDark = document.getElementById('btn-theme-dark');
    /** @type {HTMLElement | null} */
    this.btnThemeAuto = document.getElementById('btn-theme-auto');
    /** @type {HTMLElement | null} */
    this.btnGuidesOn = document.getElementById('btn-guides-on');
    this.btnGuidesOff = document.getElementById('btn-guides-off');
    
    // Font stack elements
    /** @type {HTMLElement | null} */
    this.btnFontSans = document.getElementById('btn-font-sans');
    /** @type {HTMLElement | null} */
    this.btnFontSerif = document.getElementById('btn-font-serif');
    
    // Custom font upload elements
    /** @type {HTMLElement | null} */
    this.btnFontUploadTrigger = document.getElementById('btn-upload-font-trigger');
    /** @type {HTMLElement | null} */
    this.btnResetFont = document.getElementById('btn-reset-font');
    /** @type {HTMLElement | null} */
    this.fontStatusLabel = document.getElementById('font-status-label');
    /** @type {HTMLElement | null} */
    this.fontUploader = document.getElementById('font-uploader');

    this.isReady = false;
  }

  init() {
    this.applySettings();
    this.initFontInjection();
    this.attachListeners();
    this.isReady = true;
  }

  /**
   * Helper for safe native W3C View Transitions
   * @param {() => void} updateFn
   * @param {string|null} customClass
   */
  _transitionState(updateFn, customClass = null) {
    const doc = /** @type {any} */ (document);
    if (doc.startViewTransition) {
      try {
        if (customClass) document.documentElement.classList.add(customClass);
        const t = doc.startViewTransition(updateFn);
        if (customClass) {
          t.finished.finally(() => document.documentElement.classList.remove(customClass));
        }
        return t;
      } catch(e) {
        if (customClass) document.documentElement.classList.remove(customClass);
        updateFn();
      }
    } else {
      updateFn();
    }
  }

  applySettings() {
    // 1. Layout Mode A/B (CSS-First Refactoring)
    if (this.btnFormA && this.btnFormB) {
      if (this.settings.layout === 'form-a') {
        /** @type {HTMLInputElement} */ (this.btnFormA).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnFormB).checked = true;
      }
    }

    // 2. Color Schemes (Theme light-dark supported)
    if (this.btnThemeLight && this.btnThemeDark) {
      if (this.settings.theme === 'light') {
        /** @type {HTMLInputElement} */ (this.btnThemeLight).checked = true;
      } else if (this.settings.theme === 'dark') {
        /** @type {HTMLInputElement} */ (this.btnThemeDark).checked = true;
      }
    }

    // 3. Layout Guides overlay
    if (this.btnGuidesOn && this.btnGuidesOff) {
      if (this.settings.guides) {
        /** @type {HTMLInputElement} */ (this.btnGuidesOn).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnGuidesOff).checked = true;
      }
    }

    // 4. System Font Stacks
    if (this.btnFontSans && this.btnFontSerif) {
      if (this.settings.systemFont === 'serif') {
        /** @type {HTMLInputElement} */ (this.btnFontSerif).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnFontSans).checked = true;
      }
    }
  }

  updateSettings() {
    StorageManager.saveSettings(this.settings);
    this.applySettings();
  }

  initFontInjection() {
    const savedFont = StorageManager.loadCustomFont();
    if (savedFont) {
      this.injectFont(savedFont);
      this.updateFontStatusUI(true);
    } else {
      this.updateFontStatusUI(false);
    }
  }

  /**
   * @param {string} base64Font
   */
  injectFont(base64Font) {
    let fontStyle = document.getElementById('din-custom-font-style');
    if (!fontStyle) {
      fontStyle = document.createElement('style');
      fontStyle.id = 'din-custom-font-style';
      document.head.appendChild(fontStyle);
    }
    fontStyle.textContent = `
      @font-face {
        font-family: 'AptosCustom';
        src: url('${base64Font}') format('woff2');
      }
    `;
  }

  /**
   * @param {boolean} hasCustomFont
   */
  updateFontStatusUI(hasCustomFont) {
    if (!this.fontStatusLabel || !this.btnResetFont) return;
    if (hasCustomFont) {
      this.fontStatusLabel.textContent = "Aktiv: Eigene WOFF2 Schrift";
      this.btnResetFont.style.display = "block";
      document.body.classList.add('font-custom-active');
    } else {
      this.fontStatusLabel.textContent = "Aktiv: System-UI Standardschrift";
      this.btnResetFont.style.display = "none";
      document.body.classList.remove('font-custom-active');
    }
  }

  attachListeners() {
    // Font Stack Toggles
    if (this.btnFontSans) {
      this.btnFontSans.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.systemFont = 'sans';
        this.updateSettings();
      });
    }
    if (this.btnFontSerif) {
      this.btnFontSerif.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.systemFont = 'serif';
        this.updateSettings();
      });
    }

    // Layout Form switches
    if (this.btnFormA) {
      this.btnFormA.addEventListener('change', () => {
        if (!this.isReady) return;
        this._transitionState(() => {
          this.settings.layout = 'form-a';
          this.updateSettings();
        });
      });
    }
    
    if (this.btnFormB) {
      this.btnFormB.addEventListener('change', () => {
        if (!this.isReady) return;
        this._transitionState(() => {
          this.settings.layout = 'form-b';
          this.updateSettings();
        });
      });
    }

    // Theme select toggles
    /**
     * @param {Event} e
     * @param {string} theme
     */
    const handleThemeToggle = (e, theme) => {
      if (!this.isReady) return;
      if (this.settings.theme === theme) return;
      e.preventDefault(); // Prevent native CSS radio `:has()` toggle from instantly snapping
      
      this._transitionState(() => {
        const radio = theme === 'light' ? this.btnThemeLight : this.btnThemeDark;
        if (radio) /** @type {HTMLInputElement} */ (radio).checked = true;
        this.settings.theme = theme;
        this.updateSettings();
      }, 'theme-transition');
    };

    if (this.btnThemeLight) {
      this.btnThemeLight.addEventListener('click', (e) => handleThemeToggle(e, 'light'));
    }

    if (this.btnThemeDark) {
      this.btnThemeDark.addEventListener('click', (e) => handleThemeToggle(e, 'dark'));
    }

    // Guides
    const handleGuidesToggle = () => {
      if (!this.isReady) return;
      this.settings.guides = /** @type {HTMLInputElement} */ (this.btnGuidesOn).checked;
      this.updateSettings();
    };
    if (this.btnGuidesOn) this.btnGuidesOn.addEventListener('change', handleGuidesToggle);
    if (this.btnGuidesOff) this.btnGuidesOff.addEventListener('change', handleGuidesToggle);


    // Font reset click listener
    if (this.btnResetFont) {
      this.btnResetFont.addEventListener('click', () => {
        localStorage.removeItem("din_custom_font");
        const fontStyle = document.getElementById('din-custom-font-style');
        if (fontStyle) fontStyle.remove();
        this.updateFontStatusUI(false);
        showToast("🗑️ Eigene Schriftart entfernt", "success");
      });
    }

    // Font file uploader change listener
    if (this.fontUploader) {
      this.fontUploader.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const file = target && target.files ? target.files[0] : null;
        if (!file) return;

        if (!file.name.endsWith('.woff2')) {
          showToast(Constants.TOASTS.FONT_FORMAT_ERROR, 'error');
          return;
        }

        const maxSizeInBytes = Constants.LIMITS.FONT_SIZE_MAX_KB * 1024;
        if (file.size > maxSizeInBytes) {
          showToast(Constants.TOASTS.FONT_SIZE_ERROR, 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const readerTarget = /** @type {FileReader} */ (event.target);
          const base64Font = readerTarget ? readerTarget.result : null;
          if (typeof base64Font !== 'string') {
            showToast('❌ Fehler beim dauerhaften Speichern der Schriftart', 'error');
            return;
          }
          const success = StorageManager.saveCustomFont(base64Font);
          if (success) {
            this.injectFont(base64Font);
            this.updateFontStatusUI(true);
            showToast(Constants.TOASTS.FONT_UPLOAD_SUCCESS, 'success');
          } else {
            showToast('❌ Fehler beim dauerhaften Speichern der Schriftart', 'error');
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }
}

