import { StorageManager } from '../30-utils/02-storage.js';
import { Constants } from '../30-utils/01-constants.js';
import { showToast } from '../10-ui/02-toast.js';

export class SettingsManager {
  constructor() {
    this.settings = StorageManager.loadSettings();

    // Elements
    this.shell = document.getElementById('app-shell');
    this.btnFormA = document.getElementById('btn-form-a');
    this.btnFormB = document.getElementById('btn-form-b');
    this.btnThemeLight = document.getElementById('btn-theme-light');
    this.btnThemeDark = document.getElementById('btn-theme-dark');
    this.btnThemeAuto = document.getElementById('btn-theme-auto');
    this.btnToggleGuides = document.getElementById('btn-toggle-guides');
    
    // Font stack elements
    this.btnFontSans = document.getElementById('btn-font-sans');
    this.btnFontSerif = document.getElementById('btn-font-serif');
    
    // Custom font upload elements
    this.btnFontUploadTrigger = document.getElementById('btn-upload-font-trigger');
    this.btnResetFont = document.getElementById('btn-reset-font');
    this.fontStatusLabel = document.getElementById('font-status-label');
    this.fontUploader = document.getElementById('font-uploader');
  }

  init() {
    this.applySettings();
    this.initFontInjection();
    this.attachListeners();
  }

  // Helper for safe native W3C View Transitions
  _transitionState(updateFn) {
    if (document.startViewTransition) {
      try {
        document.startViewTransition(updateFn);
      } catch(e) {
        updateFn();
      }
    } else {
      updateFn();
    }
  }

  applySettings() {
    // 1. Layout Mode A/B
    if (this.settings.layout === 'form-a') {
      this.shell?.classList.remove('form-b');
      this.shell?.classList.add('form-a');
      this.btnFormA?.setAttribute('aria-pressed', 'true');
      this.btnFormB?.setAttribute('aria-pressed', 'false');
    } else {
      this.shell?.classList.remove('form-a');
      this.shell?.classList.add('form-b');
      this.btnFormB?.setAttribute('aria-pressed', 'true');
      this.btnFormA?.setAttribute('aria-pressed', 'false');
    }

    // 2. Color Schemes (Theme light-dark supported)
    if (this.settings.theme === 'light') {
      document.documentElement.style.colorScheme = 'light';
      document.documentElement.dataset.theme = 'light';
      this.btnThemeLight?.setAttribute('aria-pressed', 'true');
      this.btnThemeDark?.setAttribute('aria-pressed', 'false');
      this.btnThemeAuto?.setAttribute('aria-pressed', 'false');
    } else if (this.settings.theme === 'dark') {
      document.documentElement.style.colorScheme = 'dark';
      document.documentElement.dataset.theme = 'dark';
      this.btnThemeDark?.setAttribute('aria-pressed', 'true');
      this.btnThemeLight?.setAttribute('aria-pressed', 'false');
      this.btnThemeAuto?.setAttribute('aria-pressed', 'false');
    } else {
      document.documentElement.style.removeProperty('color-scheme');
      delete document.documentElement.dataset.theme;
      this.btnThemeAuto?.setAttribute('aria-pressed', 'true');
      this.btnThemeLight?.setAttribute('aria-pressed', 'false');
      this.btnThemeDark?.setAttribute('aria-pressed', 'false');
    }

    // 3. Layout Guides overlay
    if (this.settings.guides) {
      document.documentElement.style.setProperty('--guide-opacity', '0.15');
      if (this.btnToggleGuides) {
        this.btnToggleGuides.textContent = '📐 Falz- & Lochmarken ausblenden';
        this.btnToggleGuides.classList.add('primary');
      }
    } else {
      document.documentElement.style.setProperty('--guide-opacity', '0');
      if (this.btnToggleGuides) {
        this.btnToggleGuides.textContent = '📐 Falz- & Lochmarken einblenden';
        this.btnToggleGuides.classList.remove('primary');
      }
    }

    // 4. System Font Stacks
    if (this.btnFontSans && this.btnFontSerif) {
      document.body.classList.remove('font-stack-sans', 'font-stack-serif');
      
      this.btnFontSans.setAttribute('aria-pressed', 'false');
      this.btnFontSerif.setAttribute('aria-pressed', 'false');

      if (this.settings.systemFont === 'serif') {
        document.body.classList.add('font-stack-serif');
        this.btnFontSerif.setAttribute('aria-pressed', 'true');
      } else {
        document.body.classList.add('font-stack-sans');
        this.btnFontSans.setAttribute('aria-pressed', 'true');
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
      this.btnFontSans.addEventListener('click', () => {
        this.settings.systemFont = 'sans';
        this.updateSettings();
      });
    }
    if (this.btnFontSerif) {
      this.btnFontSerif.addEventListener('click', () => {
        this.settings.systemFont = 'serif';
        this.updateSettings();
      });
    }

    // Layout Form switches
    if (this.btnFormA) {
      this.btnFormA.addEventListener('click', () => {
        this._transitionState(() => {
          this.settings.layout = 'form-a';
          this.updateSettings();
        });
      });
    }
    
    if (this.btnFormB) {
      this.btnFormB.addEventListener('click', () => {
        this._transitionState(() => {
          this.settings.layout = 'form-b';
          this.updateSettings();
        });
      });
    }

    // Theme select toggles
    if (this.btnThemeLight) {
      this.btnThemeLight.addEventListener('click', () => {
        this._transitionState(() => {
          this.settings.theme = 'light';
          this.updateSettings();
        });
      });
    }

    if (this.btnThemeDark) {
      this.btnThemeDark.addEventListener('click', () => {
        this._transitionState(() => {
          this.settings.theme = 'dark';
          this.updateSettings();
        });
      });
    }

    if (this.btnThemeAuto) {
      this.btnThemeAuto.addEventListener('click', () => {
        this._transitionState(() => {
          this.settings.theme = 'auto';
          this.updateSettings();
        });
      });
    }

    // Guides
    if (this.btnToggleGuides) {
      this.btnToggleGuides.addEventListener('click', () => {
        this.settings.guides = !this.settings.guides;
        this.updateSettings();
      });
    }

    // Font upload trigger click
    if (this.btnFontUploadTrigger && this.fontUploader) {
      this.btnFontUploadTrigger.addEventListener('click', () => {
        this.fontUploader.click();
      });
    }

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
        const file = e.target.files[0];
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
          const base64Font = event.target.result;
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
