// @ts-check
import { StorageManager, Constants } from './51-storage.js';
import { showToast } from './32-toast.js';

export class SettingsManager {
  /** Erstes applyTheme ist der Initial-Apply — dort ist kein Crossfade sinnvoll. */
  #themeBooted = false;

  constructor() {
    this.settings = StorageManager.loadSettings();
    this.shell = document.getElementById('app-shell');
    this.btnFormA = document.getElementById('btn-form-a');
    this.btnFormB = document.getElementById('btn-form-b');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.btnGuidesSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('btn-guides-switch'));
    this.btnGuidesOn = document.getElementById('btn-guides-on');
    this.btnGuidesOff = document.getElementById('btn-guides-off');
    this.btnFontAction = document.getElementById('btn-font-action');
    this.fontStatusLabel = document.getElementById('font-status-label');
    this.fontUploader = document.getElementById('font-uploader');
    this.themeDimmer = document.getElementById('theme-dimmer');
    this.themeDimmerValue = document.getElementById('theme-dimmer-value');
    this.btnCopyThemeTokens = document.getElementById('btn-copy-theme-tokens');
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
    if (this.btnFormA && this.btnFormB) {
      if (this.settings.layout === 'form-a') {
        /** @type {HTMLInputElement} */ (this.btnFormA).checked = true;
      } else {
        /** @type {HTMLInputElement} */ (this.btnFormB).checked = true;
      }
    }

    const currentTheme = this.settings.theme || 'auto';
    this.applyTheme(currentTheme);

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
      const dim = active === 'dark' ? 1 : 0;
      this.applyThemeDim(dim);

      if (this.btnThemeToggle) {
        this.btnThemeToggle.setAttribute('data-appearance', active);
        /** @type {Record<string, string>} */
        const labels = {
          auto: '🌓 Auto',
          light: '☀️ Hell',
          dark: '🌙 Dunkel'
        };
        /** @type {Record<string, string>} */
        const titles = {
          auto: 'Darstellung: Automatisch (System)',
          light: 'Darstellung: Helles Design',
          dark: 'Darstellung: Dunkles Design'
        };
        this.btnThemeToggle.setAttribute('data-ui', labels[active] || '🌓 Auto');
        this.btnThemeToggle.setAttribute('title', titles[active] || 'Darstellung: Automatisch');
        this.btnThemeToggle.setAttribute('aria-label', titles[active] || 'Darstellung: Automatisch');
      }
    };

    // @ts-ignore
    const themeUnchanged = document.documentElement.getAttribute('data-theme') === active && (!document.body || document.body.getAttribute('data-theme') === active);
    if (!themeUnchanged && this.isReady && this.#themeBooted && typeof document.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(updateDOM).finished.catch(() => {});
    } else {
      updateDOM();
    }
    this.#themeBooted = true;
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

  /**
   * Layout-Wechsel (Form A/B) mit element-scoped View Transition auf dem Blatt (~0,25s).
   * @param {'form-a' | 'form-b'} layout
   */
  changeLayout(layout) {
    this.settings.layout = layout;
    const sheet = /** @type {HTMLElement | null} */ (document.querySelector('din-a4'));
    // @ts-ignore Element-scoped View Transitions (Chrome 147+)
    if (sheet && typeof sheet.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // @ts-ignore Element-scoped View Transitions (Chrome 147+)
      sheet.startViewTransition(() => this.updateSettings()).finished.catch(() => {});
    } else {
      this.updateSettings();
    }
  }

  initFontInjection() {
    const savedFont = StorageManager.loadCustomFont();
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
   * @returns {Promise<void>}
   */
  async injectFont(base64Font) {
    const face = new FontFace('AptosCustom', `url(${base64Font})`);
    try {
      await face.load();
    } catch (e) {
      console.warn('[Settings] Custom font invalid:', e);
      showToast(Constants.TOASTS.FONT_FORMAT_ERROR, 'error');
      this.updateFontStatusUI(false);
      return;
    }
    if (this.activeFontFace) {
      document.fonts.delete(this.activeFontFace);
    }
    document.fonts.add(face);
    this.activeFontFace = face;
    this.updateFontStatusUI(true);
  }

  /**
   * @param {boolean} hasCustomFont
   */
  updateFontStatusUI(hasCustomFont) {
    const chip = this.fontStatusLabel;
    if (!chip) return;
    const apply = () => {
      const btn = /** @type {HTMLButtonElement | null} */ (this.btnFontAction);
      if (hasCustomFont) {
        chip.textContent = "Aktiv: Eigene WOFF2 Schrift";
        document.body.classList.add('font-custom-active');
        if (btn) { btn.dataset.fontMode = 'reset'; btn.dataset.ui = '🗑️ Schrift zurücksetzen'; }
      } else {
        chip.textContent = "Aktiv: System-UI Standardschrift";
        document.body.classList.remove('font-custom-active');
        if (btn) { btn.dataset.fontMode = 'upload'; btn.dataset.ui = '📤 Schrift hochladen'; }
      }
    };
    // @ts-ignore Element-scoped View Transitions (Chrome 147+): Chip-Wechsel nur lokal crossfaden
    if (this.isReady && typeof chip.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // @ts-ignore
      chip.startViewTransition(apply).finished.catch(() => {});
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
          if (this.activeFontFace) {
            document.fonts.delete(this.activeFontFace);
            this.activeFontFace = null;
          }
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
          } else {
            showToast('❌ Fehler beim dauerhaften Speichern der Schriftart', 'error');
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }
}
