// @ts-check
// @adr [[ADR-JS]] {SettingsManager}
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file settings.js — Layout, Theme, Hilfslinien und Plugins (SettingsManager).
 * Die Signatur-Engine liegt in `signature.js`, das Font-Management in `font-feature.js`.
 */

import { toggleAddon } from './addons.js';
import { Events, eventBus, transitionOn } from './core.js';
import { liveToken } from './live-bridge.js';
import { DEFAULT_SETTINGS, istAn, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';
import { applyValue } from './state-binding.js';

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

/* =========================================================================================
 * 1. SETTINGS MANAGER
 * ========================================================================================= */

export class SettingsManager {
  /** Erstes applyTheme ist der Initial-Apply — dort ist kein Crossfade sinnvoll. */
  #themeBooted = false;

  constructor() {
    /** @type {import('./persistence.js').DinSettings & { previewFont?: string }} */
    this.settings = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    this.btnFormA = document.getElementById('btn-form-a');
    this.btnFormB = document.getElementById('btn-form-b');
    this.seitenleiste = document.getElementById('seitenleiste');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.btnMarksSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-falzmarken'));
    this.pluginTestbriefSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('plugin-testbrief'));
    this.debugSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-debug'));
    this.pluginGeschaeftSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('plugin-geschaeftsangaben'));

    this.isReady = false;
  }

  init() {
    this.applySettings();
    this.attachListeners();
    this.isReady = true;
  }

  applySettings() {
    /* Whitelist wie in boot.js: nur form-a/form-b. Ohne sie landet ein
       beliebiger Wert aus localStorage im Attribut, auf das die Blattgeometrie
       hoert (Befund Batch 02, B66). */
    const layout = this.settings.layout === 'form-a' ? 'form-a' : 'form-b';
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

    setzeSchalter(/** @type {HTMLInputElement | null} */ (this.btnMarksSwitch), istAn(this.settings.marks));
    setzeSchalter(/** @type {HTMLInputElement | null} */ (this.pluginTestbriefSwitch), istAn(this.settings.pluginTestbrief));
    setzeSchalter(/** @type {HTMLInputElement | null} */ (this.debugSwitch), this.settings.debugPanel === true);
    setzeSchalter(/** @type {HTMLInputElement | null} */ (this.pluginGeschaeftSwitch), this.settings.pluginGeschaeftsangaben === true);

    /* Unterrand 20/30mm: steuert --rand-u, das im Druck das padding-bottom
     * von #kern setzt. Nur zwei Werte — alles andere faellt auf DIN 5008
     * (20mm) zurueck.
     * Der Wert steht seit 2026-11-22 als CSS-Regel in sheet-multipage.css
     * (`:root:has(#btn-rand-u-30:checked) { --rand-u: 30mm; }`). Hier wird nur
     * der Schalter gestellt und der Inline-Wert von boot.js abgegeben (der
     * FOUC-Schutz vor dem ersten Paint) — danach ist die CSS-Regel die einzige
     * Quelle. */
    const randU = this.settings.randU === 30 ? 30 : 20;
    this.settings.randU = randU;
    const randUSwitch = document.getElementById('btn-rand-u-30');
    if (randUSwitch instanceof HTMLInputElement) setzeSchalter(randUSwitch, randU === 30);
    document.documentElement.style.removeProperty('--rand-u');

    this.#spiegleLayoutFlags();
    this.#applyPlugins();
    /* Erst NACH dem Attribut-Spiegel: rendereZustand liest data-layout und
       data-marks. Vorher stand der Aufruf davor und die Zeile zeigte den
       alten Stand (gemessen 2026-11-13). */
    this.rendereZustand();
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
    const testbrief = istAn(this.settings.pluginTestbrief);

    document.documentElement.setAttribute('data-plugin-testbrief', String(testbrief));
    document.documentElement.setAttribute(
      'data-plugin-geschaeftsangaben',
      this.settings.pluginGeschaeftsangaben === true ? 'true' : 'false',
    );
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
      /* Nur am <html>: `:root[data-theme]` plus `[data-theme] body` deckt den
         Body bereits ab. Das zweite Attribut am <body> war eine Dublette und
         wurde zusaetzlich erst nach dem Paint gesetzt (Befund Batch 02). */
      document.documentElement.setAttribute('data-theme', active);

      if (this.btnThemeToggle) {
        /* Die Icon-Auswahl haengt an :root[data-theme] — boot.js setzt das
         * Attribut blockierend vor dem ersten Paint. Hier nur noch Titel und
         * Label, die ein aria-Live-freier Zustand nicht vorwegnehmen kann. */
        const titles = /** @type {Record<string, string>} */ ({ auto: 'Darstellung: Automatisch (System)', light: 'Darstellung: Helles Design', dark: 'Darstellung: Dunkles Design' });
        this.btnThemeToggle.setAttribute('title', titles[active] || 'Darstellung: Automatisch');
        this.btnThemeToggle.setAttribute('aria-label', titles[active] || 'Darstellung: Automatisch');
      }
    };

    const themeUnchanged = document.documentElement.getAttribute('data-theme') === active;
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
    const brief = /** @type {HTMLInputElement | null} */ (document.getElementById('modus-brief'));
    const einstellungen = /** @type {HTMLInputElement | null} */ (document.getElementById('modus-einstellungen'));
    if (!brief || !einstellungen) return;
    const ziel = force === undefined
      ? (einstellungen.checked ? brief : einstellungen)
      : (force === 'einstellungen' ? einstellungen : brief);
    /* Radiogruppe: checked auf einem Radio loest das andere nativ. Die Gruppe
       ist EIN Tab-Stopp, Pfeiltasten schalten, der Zustand steckt im Namen.
       Kein JS-Zustand, keine Klasse, kein zweites Label (Befund B14). */
    ziel.checked = true;
    ziel.dispatchEvent(new Event('change', { bubbles: true }));
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
    /* Kein eigenes setzeAttribut mehr: updateSettings() laeuft im selben Task
       und ruft applySettings(), das das Attribut setzt. Zwei Schreiber fuer
       denselben Wert waren der Rest der zweiten Spur (B63). */
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

  /**
   * Schreibt die Werte in die Statuszeile, die im Brief-Modus NICHT als Regler
   * sichtbar sind.
   *
   * Befund B74 (gemessen 2026-11-14): Form und Falzmarken standen doppelt —
   * einmal in der Statuszeile, einmal als Regler direkt darunter. Schrift und
   * Unterrand dagegen liegen in der Zone "Einstellungen", die im Brief-Modus
   * ausgeblendet ist. Die Zeile zeigt deshalb nur diese zwei; sie ist die
   * einzige Stelle, an der sie im Brief-Modus zu sehen sind.
   */
  rendereZustand() {
    const ziel = document.getElementById('zustand-text');
    if (!ziel) return;
    const randU = this.settings.randU === 30 ? '30' : '20';
    /* Schrift: den sichtbaren Eintrag der Auswahlliste lesen, statt die
       Font-Presets zu importieren - die Liste ist die Anzeige-Wahrheit. */
    const schriftSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('select-schriftart'));
    /* Options-Text kann "Liberation Sans / System-UI" heissen - fuer eine
       Statuszeile reicht der erste Name. */
    const schrift = (schriftSelect?.selectedOptions?.[0]?.textContent || 'System').split('/')[0].trim();
    ziel.textContent = `Schrift: ${schrift} · Unterrand ${randU} mm`;
  }

  attachListeners() {
    /* Escape fuehrt aus dem Einstellungs-Modus zurueck. Der Schalter ist ein
       Ansichtswechsel; ohne Tastenausgang sitzt man dort fest. Bindung hier,
       nicht in toggleSettingsModus: der Modus wird rein ueber die native
       Checkbox geschaltet (CSS), toggleSettingsModus laeuft dabei nie. */
    const zustandKnopf = document.getElementById('btn-zustand-aendern');
    if (zustandKnopf) {
      zustandKnopf.addEventListener('click', () => this.toggleSettingsModus('einstellungen'));
    }
    /* Schriftwechsel laeuft ueber font-feature.js; hier nur die Anzeige
       nachziehen (zweiter Listener, kein zweiter Schreiber). */
    const schriftSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('select-schriftart'));
    if (schriftSelect) {
      schriftSelect.addEventListener('change', () => this.rendereZustand());
    }

    const modusEinstellungen = /** @type {HTMLInputElement | null} */ (document.getElementById('modus-einstellungen'));
    const modusBrief = /** @type {HTMLInputElement | null} */ (document.getElementById('modus-brief'));
    /* Escape haengt an der Leiste, nicht an der Checkbox. Vorher kam man nur
       heraus, wenn der Fokus auf dem Schalter stand; wer in der Schriftart-
       Liste oder im Key-Feld stand, sass fest (Befund B14, gemessen 2026-11-13).
       Offene Popover schliessen zuerst - die liegen im Top-Layer, aber im DOM
       in der Leiste, also wuerde Escape sonst zwei Dinge gleichzeitig tun. */
    const leiste = document.getElementById('seitenleiste');
    if (leiste) {
      leiste.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (document.querySelector(':popover-open')) return;
        if (!modusEinstellungen?.checked) return;
        event.preventDefault();
        this.toggleSettingsModus('brief');
        /* Der Fokus darf nicht in der gerade ausgeblendeten Zone bleiben. */
        modusBrief?.focus();
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

    const debugSwitch = this.debugSwitch;
    if (debugSwitch) {
      debugSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.debugPanel = debugSwitch.checked;
        this.updateSettings();
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

    const pluginGeschaeft = this.pluginGeschaeftSwitch;
    if (pluginGeschaeft) {
      pluginGeschaeft.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.pluginGeschaeftsangaben = pluginGeschaeft.checked;
        this.updateSettings();
        if (!pluginGeschaeft.checked) {
          applyValue('toggle-fuss', false);
          eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
        }
        /* Addon über zentralen AddonManager aktivieren/deaktivieren */
        void toggleAddon('geschaeftsangaben', pluginGeschaeft.checked);
      });
    }

  }
}

/* =========================================================================================
 * 2. AGENTEN-HILFE (WebMCP / MCP)
 * ========================================================================================= */

/** Das Repo, aus dem der MCP-Server kommt — so braucht niemand einen Pfad. */
const MCP_PAKET = 'github:grapefruit89/DIN-BriefNEO#main';

/**
 * Der Text, den „MCP-Config kopieren" in die Zwischenablage legt.
 * Kein lokaler Pfad: npx holt den Server direkt aus dem Repo (package.json
 * hat einen `bin`-Eintrag). Einzige Voraussetzung: Node auf dem Rechner.
 * @returns {string}
 */
function agentenKonfiguration() {
  return JSON.stringify(
    {
      mcp: {
        servers: {
          briefneo: {
            type: 'local',
            command: ['npx', '-y', MCP_PAKET]
          }
        }
      }
    },
    null,
    2
  );
}

/**
 * Füllt den „Agenten"-Abschnitt in den Einstellungen: Status und ein
 * Kopierknopf für die MCP-Konfiguration. Kein Startknopf — eine Webseite kann
 * keinen lokalen Prozess starten; sie kann nur sagen, was zu tun ist.
 * @returns {void}
 */
export function initAgentenHilfe() {
  const status = document.getElementById('agenten-status');
  const knopfKonfig = document.getElementById('btn-agent-konfig');
  const hinweis = document.getElementById('agenten-hinweis');
  if (!status || !knopfKonfig) return;

  const agent = /** @type {any} */ (window).dinBriefAgent;
  const anzahl = typeof agent?.werkzeuge === 'function' ? agent.werkzeuge().length : 0;
  const webmcp = typeof document.modelContext === 'object' && document.modelContext !== null;
  const kanal = liveToken();
  status.textContent = webmcp
    ? `WebMCP aktiv · ${anzahl} Werkzeuge`
    : `WebMCP aus · ${anzahl} Werkzeuge`;
  if (hinweis) {
    hinweis.textContent = kanal
      ? 'Kanal aktiv — Agent kann in diesen Tab schreiben.'
      : 'Anleitung: docs/js/AGENTEN-WEBMCP.md';
  }

  /**
   * @param {string} text
   * @returns {Promise<boolean>} true = in der Zwischenablage
   */
  async function kopiere(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  knopfKonfig.addEventListener('click', () => {
    void kopiere(agentenKonfiguration());
  });
}
