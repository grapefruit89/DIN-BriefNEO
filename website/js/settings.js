// @ts-check
// @adr [[ADR-JS]] {SettingsManager}
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file settings.js — Layout, Theme, Hilfslinien und Plugins (SettingsManager).
 * Die Signatur-Engine liegt in `signature.js`, das Font-Management in `font-feature.js`.
 */

import { Events, eventBus } from './core.js';
import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';

export { FONT_PRESETS } from './font-feature.js';

/**
 * Setzt ein Attribut nur, wenn es abweicht.
 *
 * Der Zustand wird EINMAL vor dem Paint gesetzt (boot.js im <head>,
 * boot-state.js am Body-Ende). Nach dem Paint darf dieselbe Stelle ihn
 * hoechstens bestaetigen — sonst entstehen zwei Schreiber und damit die
 * FOUC-Klasse, die wir 2026-11-12 mehrfach hatten (DECISION-LOG).
 * @param {Element} el
 * @param {string} name
 * @param {string} wert
 */
function setzeAttribut(el, name, wert) {
  if (el.getAttribute(name) !== wert) el.setAttribute(name, wert);
}

/**
 * @param {HTMLInputElement | null} box
 * @param {boolean} wert
 */
function setzeSchalter(box, wert) {
  if (box && box.checked !== wert) box.checked = wert;
}

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

/* =========================================================================================
 * 1. SETTINGS MANAGER
 * ========================================================================================= */

export class SettingsManager {
  /** Erstes applyTheme ist der Initial-Apply — dort ist kein Crossfade sinnvoll. */
  #themeBooted = false;

  constructor() {
    /** @type {import('./persistence.js').DinSettings & { style?: string, previewFont?: string }} */
    this.settings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    this.btnFormA = document.getElementById('btn-form-a');
    this.btnFormB = document.getElementById('btn-form-b');
    this.seitenleiste = document.getElementById('seitenleiste');
    this.btnZurueck = document.getElementById('btn-zurueck');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.styleSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('style-select'));
    this.btnMarksSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-falzmarken'));
    this.pluginTestbriefSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('plugin-testbrief'));

    this.isReady = false;
  }

  init() {
    this.applySettings();
    this.attachListeners();
    this.isReady = true;
  }

  applySettings() {
    const layout = this.settings.layout || 'form-b';
    setzeAttribut(document.documentElement, 'data-layout', layout);
    if (layout === 'form-a') {
      setzeSchalter(/** @type {HTMLInputElement | null} */ (this.btnFormA), true);
      setzeSchalter(/** @type {HTMLInputElement | null} */ (this.btnFormB), false);
    } else {
      setzeSchalter(/** @type {HTMLInputElement | null} */ (this.btnFormA), false);
      setzeSchalter(/** @type {HTMLInputElement | null} */ (this.btnFormB), true);
    }

    const currentTheme = this.settings.theme || 'auto';
    this.applyTheme(currentTheme);

    const currentStyle = this.settings.style || 'default';
    this.applyStyle(currentStyle);

    setzeSchalter(/** @type {HTMLInputElement | null} */ (this.btnMarksSwitch), this.settings.marks !== false);
    setzeSchalter(/** @type {HTMLInputElement | null} */ (this.pluginTestbriefSwitch), Boolean(this.settings.pluginTestbrief));

    /* Unterrand 20/30mm: steuert --rand-u, das im Druck das padding-bottom
     * von #kern setzt. Nur zwei Werte — alles andere faellt auf DIN 5008
     * (20mm) zurueck. */
    const randU = this.settings.randU === 30 ? 30 : 20;
    this.settings.randU = randU;
    document.documentElement.style.setProperty('--rand-u', `${randU}mm`);
    const randUSwitch = document.getElementById('btn-rand-u-30');
    if (randUSwitch instanceof HTMLInputElement) setzeSchalter(randUSwitch, randU === 30);

    this.#spiegleLayoutFlags();
    this.#applyPlugins();
  }

  /**
   * Layout-Flags als data-Attribute am <html>. Das CSS liest sie; die
   * Checkboxen sind nur noch Bedienoberfläche. Der Boot-Block setzt denselben
   * Zustand vor dem ersten Paint — hier wird er nach jedem Settings-Update
   * nachgezogen (und korrigiert, falls das Boot-Script scheiterte).
   */
  /**
   * Plugin-Schalter: Body-Attribut fuer CSS. Der Mehrseiten-Modus ist fest
   * eingeschaltet ([[ADR-EINSEITEN-STILLGELEGT]]): kein Stylesheet-Tausch,
   * kein Umschalt-Signal mehr — ein altes `pluginMultipage: false` im
   * localStorage wird bewusst ignoriert.
   */
  #applyPlugins() {
    const testbrief = Boolean(this.settings.pluginTestbrief);

    document.documentElement.setAttribute('data-plugin-testbrief', String(testbrief));
    document.documentElement.setAttribute('data-plugin-multipage', 'true');
  }

  #spiegleLayoutFlags() {
    const root = document.documentElement;
    setzeAttribut(root, 'data-marks', this.settings.marks === false ? 'false' : 'true');
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
        /* Die Icon-Auswahl haengt an :root[data-theme] — boot.js setzt das
         * Attribut blockierend vor dem ersten Paint. Hier nur noch Titel und
         * Label, die ein aria-Live-freier Zustand nicht vorwegnehmen kann. */
        const titles = /** @type {Record<string, string>} */ ({ auto: 'Darstellung: Automatisch (System)', light: 'Darstellung: Helles Design', dark: 'Darstellung: Dunkles Design' });
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
    /* Der Zustand liegt ausschliesslich in der nativen Checkbox — ein Tab-Stopp,
       Space schaltet nativ. Das sichtbare Label traegt keine Rolle und keinen
       tabindex (sonst zwei Controls im Accessibility-Tree; Befund B14: vorher
       hatte es beides und war per Tastatur wirkungslos). */
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
   * Layout-Wechsel (Form A/B): Synchrones Umschalten ohne FOUC/Morphing.
   * @param {'form-a' | 'form-b'} layout
   */
  changeLayout(layout) {
    this.settings.layout = layout;
    setzeAttribut(document.documentElement, 'data-layout', layout);
    this.updateSettings();
  }

  /**
   * Unterrand umschalten (20mm DIN 5008 | 30mm).
   * @param {number} wert
   */
  changeRandU(wert) {
    this.settings.randU = wert === 30 ? 30 : 20;
    this.updateSettings();
  }

  attachListeners() {
    /* Escape fuehrt aus dem Einstellungs-Modus zurueck. Der Schalter ist ein
       Ansichtswechsel; ohne Tastenausgang sitzt man dort fest. Bindung hier,
       nicht in toggleSettingsModus: der Modus wird rein ueber die native
       Checkbox geschaltet (CSS), toggleSettingsModus laeuft dabei nie. */
    const modusSchalter = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-modus'));
    if (modusSchalter) {
      modusSchalter.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !modusSchalter.checked) return;
        event.preventDefault();
        this.toggleSettingsModus('brief');
      });
    }

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
      this.btnZurueck.addEventListener('click', (e) => {
        if (!this.isReady) return;
        e.preventDefault();
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

    const marksSwitch = this.btnMarksSwitch;
    if (marksSwitch) {
      marksSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.marks = marksSwitch.checked;
        this.updateSettings();
      });
    }

    const randUSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('btn-rand-u-30'));
    if (randUSwitch) {
      randUSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.changeRandU(randUSwitch.checked ? 30 : 20);
      });
    }

    const pluginTestbrief = this.pluginTestbriefSwitch;
    if (pluginTestbrief) {
      pluginTestbrief.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.pluginTestbrief = pluginTestbrief.checked;
        this.updateSettings();
      });
    }

  }
}
