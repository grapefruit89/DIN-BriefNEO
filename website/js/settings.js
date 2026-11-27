// @ts-check
// @adr [[ADR-JS]] {SettingsManager}
// @guide [[glossary]]
// @guide [[din-5008-css-architektur]]

/**
 * @file settings.js — Layout, Theme, Hilfslinien und Plugins (SettingsManager).
 * Die Signatur-Engine liegt in `signature.js`, das Font-Management in `font-feature.js`.
 */

import { toggleAddon } from './addons.js';
import { wendeGespeicherteAnsicht } from './ansicht.js';
import { Events, eventBus, transitionOn } from './core.js';
import { aufKanalStatus, kanalOffen, kanalStarten, kanalStoppen, kanalVerbunden, neuerToken } from './live-bridge.js';
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
    this.debugSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-debug'));
    this.pluginGeschaeftSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('plugin-geschaeftsangaben'));
    this.btnFokusSwitch = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fokus-modus'));

    this.isReady = false;
  }

  init() {
    this.applySettings();
    /* Zoom und Nachtpalette gelten sofort — auch ohne offenes Debug-Panel. */
    wendeGespeicherteAnsicht();
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

    const fokusGespeichert = Boolean(this.settings.fokusModus && this.settings.fokusModus !== 'aus');
    if (this.btnFokusSwitch) {
      this.btnFokusSwitch.checked = fokusGespeichert;
    }
    if (fokusGespeichert) {
      void toggleAddon('fokusmodus', true).then(async () => {
        const { invokeAddon } = await import('./addons.js');
        await invokeAddon('fokusmodus', 'setFokus', true);
      });
    }
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
    const live = loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    if (typeof live.nachtHelligkeit === 'number') this.settings.nachtHelligkeit = live.nachtHelligkeit;
    if (typeof live.blattBreitePx === 'number') this.settings.blattBreitePx = live.blattBreitePx;
    if (live.zoomEinheit) this.settings.zoomEinheit = live.zoomEinheit;

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

  attachListeners() {
    /* Escape fuehrt aus dem Einstellungs-Modus zurueck. Der Schalter ist ein
       Ansichtswechsel; ohne Tastenausgang sitzt man dort fest. Bindung hier,
       nicht in toggleSettingsModus: der Modus wird rein ueber die native
       Checkbox geschaltet (CSS), toggleSettingsModus laeuft dabei nie. */
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

    const pluginGeschaeft = this.pluginGeschaeftSwitch;
    if (pluginGeschaeft) {
      pluginGeschaeft.addEventListener('change', () => {
        if (!this.isReady) return;
        this.settings.pluginGeschaeftsangaben = pluginGeschaeft.checked;
        this.updateSettings();
        if (pluginGeschaeft.checked) {
          applyValue('toggle-fuss', true);
        } else {
          applyValue('toggle-fuss', false);
        }
        eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
        /* Addon über zentralen AddonManager aktivieren/deaktivieren */
        void toggleAddon('geschaeftsangaben', pluginGeschaeft.checked);
      });
    }

    if (this.btnFokusSwitch) {
      this.btnFokusSwitch.addEventListener('change', () => {
        if (!this.isReady) return;
        const aktiv = this.btnFokusSwitch?.checked ?? false;
        this.settings.fokusModus = aktiv ? 'absatz' : 'aus';
        this.settings.zenModus = aktiv;
        this.updateSettings();
        void toggleAddon('fokusmodus', aktiv).then(async () => {
          const { invokeAddon } = await import('./addons.js');
          await invokeAddon('fokusmodus', 'setFokus', aktiv);
        });
      });
    }

  }
}

/* =========================================================================================
 * 2. AGENTEN-HILFE (WebMCP / MCP)
 * ========================================================================================= */

/**
 * Die Konfiguration für den Live-Kanal: die Seite meldet sich beim Programm.
 * Kein Debug-Port, kein Flag — der Standardweg.
 * @param {string} token
 * @returns {string}
 */
function agentenKonfigurationLive(token) {
  return JSON.stringify(
    {
      mcp: {
        servers: {
          briefneo: {
            type: 'local',
            command: ['node', 'tools/runtime/mcp-live.mjs', `--token=${token}`]
          }
        }
      }
    },
    null,
    2
  );
}

/**
 * Liest die Einstellungen so, wie sie gerade gespeichert sind.
 * @returns {import('./persistence.js').DinSettings}
 */
function agentenEinstellungen() {
  return /** @type {import('./persistence.js').DinSettings} */ (
    loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );
}

/**
 * Sorgt dafür, dass ein Kanal-Token existiert und der Kanal läuft.
 * Wird beim Kopieren aufgerufen: wer die Config kopiert, will verbinden.
 * @returns {string} der Token
 */
function agentenKanalSichern() {
  const einstellungen = agentenEinstellungen();
  const gespeichert = String(einstellungen.agentToken || '');
  const token = /^[a-f0-9]{32}$/.test(gespeichert) ? gespeichert : neuerToken();
  if (token !== gespeichert) {
    saveJSON(STORAGE_KEYS.settings, { ...einstellungen, agentKanal: true, agentToken: token });
  } else if (einstellungen.agentKanal !== true) {
    saveJSON(STORAGE_KEYS.settings, { ...einstellungen, agentKanal: true });
  }
  if (!kanalOffen()) kanalStarten(token);
  return token;
}

/**
 * Füllt den Agenten-Abschnitt: Status, Kanal-Schalter und die beiden
 * Kopierknöpfe (Live-Kanal als Standard, Debug-Port als zweite Wahl).
 * @returns {void}
 */
export function initAgentenHilfe() {
  const status = document.getElementById('agenten-info-status');
  const kanalStatus = document.getElementById('agenten-kanal-status');
  const schalter = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-agent-kanal'));
  const knopfLive = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-agent-konfig'));
  if (!status) return;

  const agent = /** @type {any} */ (window).dinBriefAgent;
  const anzahl = typeof agent?.werkzeuge === 'function' ? agent.werkzeuge().length : 0;
  const webmcp = typeof document.modelContext === 'object' && document.modelContext !== null;

  /** @type {(stand: { verbunden: boolean }) => void} */
  const zeigeKanal = (stand) => {
    if (schalter) schalter.checked = kanalOffen();
    if (kanalStatus) {
      kanalStatus.textContent = stand.verbunden
        ? 'verbunden'
        : kanalOffen()
          ? 'wartet auf deinen Agenten'
          : 'aus';
    }
    status.textContent = [
      `${anzahl} Werkzeuge`,
      webmcp ? 'WebMCP aktiv' : 'kein WebMCP',
      kanalOffen() ? 'Zugriff erlaubt' : 'kein Zugriff'
    ].join(' · ');
  };

  aufKanalStatus(zeigeKanal);
  zeigeKanal({ verbunden: false });

  schalter?.addEventListener('change', () => {
    const einstellungen = agentenEinstellungen();
    if (schalter.checked) {
      const token = agentenKanalSichern();
      zeigeKanal({ verbunden: kanalVerbunden() });
      void token;
    } else {
      saveJSON(STORAGE_KEYS.settings, { ...einstellungen, agentKanal: false });
      kanalStoppen();
      zeigeKanal({ verbunden: false });
    }
  });

  /**
   * Kopiert einen Text und quittiert kurz am Knopf.
   * @param {HTMLButtonElement | null} knopf
   * @param {() => string} text
   * @returns {Promise<void>}
   */
  const kopiere = async (knopf, text) => {
    if (!knopf) return;
    const beschriftung = knopf.dataset.beschriftung || knopf.textContent || '';
    knopf.dataset.beschriftung = beschriftung;
    let geklappt = false;
    try {
      await navigator.clipboard.writeText(text());
      geklappt = true;
    } catch {
      geklappt = false;
    }
    knopf.textContent = geklappt ? '✓ Kopiert' : '✗ gesperrt';
    setTimeout(() => {
      knopf.textContent = beschriftung;
    }, 1500);
  };

  knopfLive?.addEventListener('click', async () => {
    const token = agentenKanalSichern();
    zeigeKanal({ verbunden: kanalVerbunden() });
    await kopiere(knopfLive, () => agentenKonfigurationLive(token));
  });

  window.addEventListener('storage', (ereignis) => {
    if (ereignis.key === STORAGE_KEYS.settings) {
      const akt = agentenEinstellungen();
      if (!akt.agentKanal && kanalOffen()) {
        kanalStoppen();
      }
    }
  });
}

