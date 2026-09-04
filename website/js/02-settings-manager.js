// @ts-check
import { StorageManager } from './52-storage.js';
import { Constants } from './51-constants.js';
import { showToast } from './32-toast.js';

export class SettingsManager {
  constructor() {
    this.settings = StorageManager.loadSettings();
    this.shell = document.getElementById('app-shell');
    this.btnFormA = document.getElementById('btn-form-a');
    this.btnFormB = document.getElementById('btn-form-b');
    this.btnThemeLight = document.getElementById('btn-theme-light');
    this.btnThemeDark = document.getElementById('btn-theme-dark');
    this.btnGuidesSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('btn-guides-switch'));
    this.btnGuidesOn = document.getElementById('btn-guides-on');
    this.btnGuidesOff = document.getElementById('btn-guides-off');
    this.btnFontAction = document.getElementById('btn-font-action');
    this.fontStatusLabel = document.getElementById('font-status-label');
    this.fontUploader = document.getElementById('font-uploader');
    this.themeDimmer = document.getElementById('theme-dimmer');
    this.themeDimmerValue = document.getElementById('theme-dimmer-value');
    this.btnCopyThemeTokens = document.getElementById('btn-copy-theme-tokens');
    this.isReady = false;
  }

  init() {
    this.applySettings();
    this.initFontInjection();
    this.attachListeners();
    this.isReady = true;
  }

  applySettings() {
    if (this.btnFormA && this.btnFormB) {
      if (this.settings.layout === 'form-a') {
        /** @type {HTMLInputElement} */ (this.btnFormA).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnFormB).checked = true;
      }
    }

    const dim = Number(this.settings.themeDim);
    const themeDim = Number.isFinite(dim) ? Math.min(1, Math.max(0, dim)) : (this.settings.theme === 'dark' ? 1 : 0);
    this.applyThemeDim(themeDim);
    if (this.btnThemeLight && this.btnThemeDark) {
      if (themeDim >= 0.5) {
        /** @type {HTMLInputElement} */ (this.btnThemeDark).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnThemeLight).checked = true;
      }
    }

    if (this.btnGuidesSwitch) {
      this.btnGuidesSwitch.checked = Boolean(this.settings.guides);
    } else if (this.btnGuidesOn && this.btnGuidesOff) {
      if (this.settings.guides) {
        /** @type {HTMLInputElement} */ (this.btnGuidesOn).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnGuidesOff).checked = true;
      }
    }
  }

  /**
   * @param {number} dim 0 = Tag, 1 = Nacht
   */
  applyThemeDim(dim) {
    const v = Math.min(1, Math.max(0, Number(dim) || 0));
    document.documentElement.style.setProperty('--theme-dim', String(v));
    if (this.themeDimmer) /** @type {HTMLInputElement} */ (this.themeDimmer).value = String(Math.round(v * 100));
    if (this.themeDimmerValue) this.themeDimmerValue.textContent = String(Math.round(v * 100));
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
    fontStyle.textContent = `@font-face { font-family: 'AptosCustom'; src: url('${base64Font}') format('woff2'); }`;
  }

  /**
   * @param {boolean} hasCustomFont
   */
  updateFontStatusUI(hasCustomFont) {
    if (!this.fontStatusLabel) return;
    const btn = /** @type {HTMLButtonElement | null} */ (this.btnFontAction);
    if (hasCustomFont) {
      this.fontStatusLabel.textContent = "Aktiv: Eigene WOFF2 Schrift";
      document.body.classList.add('font-custom-active');
      if (btn) { btn.dataset.fontMode = 'reset'; btn.dataset.ui = '🗑️ Schrift zurücksetzen'; }
    } else {
      this.fontStatusLabel.textContent = "Aktiv: System-UI Standardschrift";
      document.body.classList.remove('font-custom-active');
      if (btn) { btn.dataset.fontMode = 'upload'; btn.dataset.ui = '📤 Schrift hochladen'; }
    }
  }

  attachListeners() {
    if (this.btnFormA) {
      this.btnFormA.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.layout = 'form-a';
        this.updateSettings();
      });
    }
    if (this.btnFormB) {
      this.btnFormB.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.layout = 'form-b';
        this.updateSettings();
      });
    }

    const handleThemeChange = (/** @type {string} */ theme) => {
      if (!this.isReady) return;
      this.settings.theme = theme;
      this.settings.themeDim = theme === 'dark' ? 1 : 0;
      this.applyThemeDim(this.settings.themeDim);
      this.updateSettings();
    };
    if (this.btnThemeLight) this.btnThemeLight.addEventListener('change', () => handleThemeChange('light'));
    if (this.btnThemeDark) this.btnThemeDark.addEventListener('change', () => handleThemeChange('dark'));

    if (this.themeDimmer) {
      this.themeDimmer.addEventListener('input', () => {
        const v = Number(/** @type {HTMLInputElement} */ (this.themeDimmer).value) / 100;
        this.applyThemeDim(v);
        this.settings.themeDim = v;
        this.settings.theme = v >= 0.5 ? 'dark' : 'light';
        if (this.isReady) StorageManager.saveSettings(this.settings);
      });
    }

    if (this.btnCopyThemeTokens) {
      this.btnCopyThemeTokens.addEventListener('click', async () => {
        const cs = getComputedStyle(document.documentElement);
        const keys = ['--theme-dim', '--paper-bg', '--paper-text', '--paper-ghost', '--bg-viewport', '--bg-sidebar', '--bg-card', '--border-color', '--text-primary', '--text-muted', '--accent-color'];
        const text = keys.map((k) => `${k}: ${cs.getPropertyValue(k).trim()};`).join('\n');
        try {
          await navigator.clipboard.writeText(text);
          showToast('Theme-Werte kopiert', 'success');
        } catch {
          showToast('Kopieren nicht möglich', 'error');
        }
      });
    }

    const guidesSwitch = this.btnGuidesSwitch;
    if (guidesSwitch) {
      guidesSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.guides = guidesSwitch.checked;
        this.updateSettings();
      });
    } else {
      const handleGuidesToggle = () => {
        if (!this.isReady) return;
        this.settings.guides = /** @type {HTMLInputElement} */ (this.btnGuidesOn).checked;
        this.updateSettings();
      };
      if (this.btnGuidesOn) this.btnGuidesOn.addEventListener('change', handleGuidesToggle);
      if (this.btnGuidesOff) this.btnGuidesOff.addEventListener('change', handleGuidesToggle);
    }

    if (this.btnFontAction) {
      this.btnFontAction.addEventListener('click', () => {
        const btn = /** @type {HTMLButtonElement} */ (this.btnFontAction);
        if (btn.dataset.fontMode === 'reset') {
          localStorage.removeItem("din_custom_font");
          const fontStyle = document.getElementById('din-custom-font-style');
          if (fontStyle) fontStyle.remove();
          this.updateFontStatusUI(false);
          showToast("🗑️ Eigene Schriftart entfernt", "success");
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
