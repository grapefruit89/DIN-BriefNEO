// @ts-check
// @adr [[ADR-JS]] {FontFeature}
// @guide [[din-5008-css-architektur]]

/**
 * @file font-feature.js — Preset-Auswahl, Custom-Font-Upload (WOFF2/TTF/OTF),
 * CSS Font Loading API Injection und Persistenz (FontFeature).
 * Aus `settings.js` ausgelagert (2026-11-09): Font-Injection teilt fachlich
 * nichts mit Theme- und Layout-Toggles.
 */

import { deleteBlob, loadBlob, saveBlob } from './binary-storage.js';
import { Constants, notify, transitionOn } from './core.js';
import { DEFAULT_SETTINGS, loadJSON, STORAGE_KEYS, saveJSON } from './persistence.js';

/** Typ-Referenz auf den SettingsManager (nur Typ, kein Laufzeit-Import). */
/** @typedef {import('./settings.js').SettingsManager} SettingsManager */

/**
 * Mitgelieferte DIN-5008-Testschriften (eingedampft, liegen in
 * `website/fonts/`). Schriften, die nur lokal in `<repo>/fonts/` liegen,
 * stehen hier bewusst NICHT: sie kommen zur Laufzeit über `/__fonts`
 * (siehe `ladeLokaleSchriften`) und funktionieren nur im Dev-Server.
 * @type {Record<string, string>}
 */
export const FONT_PRESETS = {
  default: '',
  /* Fallback bewusst Liberation Sans/Arial: das DACH-Subset hat keine
     franzoesischen Akzente — "Renée" bekommt so das e mit derselben
     Konstruktion, nicht aus einer fremden Ersatzschrift. */
  inter: '"Test-Inter", "Liberation Sans", Arial, sans-serif'
};

export class FontFeature {
  /** @type {SettingsManager | null} */
  #settingsManager;

  /** Entprellung fuer die Pfeiltasten-Vorschau (siehe #vorschau). */
  #vorschauTimer = 0;
  /** Zaehler, damit eine spaete Anfrage die neuere nicht ueberschreibt. */
  #vorschauToken = 0;

  /**
   * @param {SettingsManager | { settings: any, updateSettings?: () => void } | null} [settingsManager]
   */
  constructor(settingsManager = null) {
    this.#settingsManager = /** @type {SettingsManager | null} */ (settingsManager);
    /** @type {import('./persistence.js').DinSettings & { previewFont?: string }} */
    this.settings = settingsManager ? settingsManager.settings : loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);

    this.selectFont = /** @type {HTMLSelectElement | null} */ (document.getElementById('select-schriftart'));
    this.btnFontAction = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-schrift-aktion'));
    this.fontUploader = /** @type {HTMLInputElement | null} */ (document.getElementById('font-uploader') || document.getElementById('schrift-uploader'));

    /** Lokale Testschriften aus `<repo>/fonts/`: Dateiname -> Familie. */
    this.lokaleSchriften = new Map();
    /** @type {FontFace | null} */
    this.activeLokalFace = null;

    /** @type {FontFace | null} */
    this.activeFontFace = null;
    /** @type {string | null} */
    this.activeFontUrl = null;
    this.isReady = false;
  }

  init() {
    this.applyInitialFont();
    this.attachListeners();
    this.initFontInjection();
    void this.ladeLokaleSchriften();
    this.isReady = true;
  }

  /* --- Lokale Testschriften (Ordner <repo>/fonts/) ------------------------
   * `fonts/` ist komplett gitignoriert, also dürfen dort Schriften liegen, die
   * nicht ins Repo gehören (Lizenz, eigene Tests). Der Ordner ist die Wahrheit:
   * der Dev-Server listet ihn unter `/__fonts`, die App baut daraus die Auswahl.
   * In Produktion gibt es den Endpunkt nicht (404) — dann fehlt die Gruppe und
   * es wird keine Datei angefordert, die dort gar nicht liegt. Kein Fehler. */
  async ladeLokaleSchriften() {
    let liste = null;
    try {
      const antwort = await fetch('/__fonts', { cache: 'no-store' });
      if (antwort.ok) liste = await antwort.json();
    } catch {
      liste = null;
    }
    const vorhanden = Array.isArray(liste)
      ? liste.filter((eintrag) => eintrag && typeof eintrag.datei === 'string')
      : [];

    if (this.selectFont && vorhanden.length > 0 && !this.selectFont.querySelector('optgroup[data-lokal]')) {
      const gruppe = document.createElement('optgroup');
      gruppe.setAttribute('data-lokal', '');
      gruppe.label = `Nur lokal (fonts/, ${vorhanden.length})`;
      for (const eintrag of vorhanden) {
        this.lokaleSchriften.set(eintrag.datei, eintrag.familie || `Lokal-${eintrag.datei}`);
        const option = document.createElement('option');
        option.value = `lokal:${eintrag.datei}`;
        option.textContent = eintrag.name || eintrag.datei;
        gruppe.append(option);
      }
      this.selectFont.append(gruppe);
    }

    const gespeichert = this.settings.previewFont;
    if (typeof gespeichert === 'string' && gespeichert.startsWith('lokal:')) {
      if (vorhanden.length > 0) {
        this.applyFontPreset(gespeichert);
      } else {
        /* Die Datei ist weg (anderer Rechner, oder der lokale Ordner fehlt).
           Ehrlich zurueck auf Standard statt still auf eine fremde Schrift. */
        this.settings.previewFont = 'default';
        if (this.selectFont) this.selectFont.value = 'default';
        this.#applyPresetCss('default');
        this.#saveSettings();
      }
    }
  }

  /**
   * Laedt eine Datei aus `<repo>/fonts/` als FontFace. Der Pfad `/fonts/...`
   * zeigt im Dev-Server auf das Repo-Wurzelverzeichnis — derselbe Ursprung
   * wie `/__fonts`.
   * @param {string} datei
   */
  async #applyLokaleFont(datei) {
    const familie = this.lokaleSchriften.get(datei);
    if (!familie) return;
    if (this.activeLokalFace) {
      document.fonts.delete(this.activeLokalFace);
      this.activeLokalFace = null;
    }
    try {
      const face = new FontFace(familie, `url(/fonts/${encodeURIComponent(datei)})`);
      await face.load();
      document.fonts.add(face);
      this.activeLokalFace = face;
      document.documentElement.style.setProperty(
        '--active-font-family',
        `"${familie}", var(--font-brief-stack)`,
      );
    } catch (e) {
      console.warn('[FontFeature] lokale Schrift nicht ladbar:', e);
      notify(Constants.TOASTS.FONT.FORMAT_ERROR, 'error');
    }
  }

  /**
   * Entprellte Vorschau fuer die Pfeiltasten. Haelt jemand die Taste, wird
   * nicht fuer jede Stufe eine Datei geladen, sondern erst 120 ms nach dem
   * Stehenbleiben; eine neuere Anfrage macht die aeltere wertlos (Token).
   * @param {string} val
   * @param {boolean} speichern
   */
  #vorschau(val, speichern) {
    const token = ++this.#vorschauToken;
    if (this.#vorschauTimer) clearTimeout(this.#vorschauTimer);
    this.#vorschauTimer = setTimeout(() => {
      this.#vorschauTimer = 0;
      if (token !== this.#vorschauToken) return;
      this.applyFontPreset(val, { speichern });
    }, 120);
  }

  applyInitialFont() {
    const gespeichert = this.settings.previewFont || 'default';
    /* Lokale Schriften aus `fonts/` werden geladen: ihre Liste kommt vom
       Dev-Server (siehe ladeLokaleSchriften) und ist beim naechsten Start
       wieder da. Fehlt sie trotzdem, raeumt ladeLokaleSchriften den Wert auf. */
    const istLokal = typeof gespeichert === 'string' && gespeichert.startsWith('lokal:');
    const waehlbar = gespeichert in FONT_PRESETS || gespeichert === 'default' || istLokal;
    const activePreset = waehlbar ? gespeichert : 'default';
    if (!waehlbar) {
      this.settings.previewFont = 'default';
      this.#saveSettings();
    }
    if (this.selectFont) {
      this.selectFont.value = activePreset;
    }
    if (!this.activeFontFace) {
      this.#applyPresetCss(activePreset);
    }
  }

  /**
   * Setzt die Preset-Schrift als CSS-Variable - die EINE Stelle dafuer.
   * Vorher stand dieselbe Bedingung in applyInitialFont, updateFontStatusUI
   * und applyFontPreset (B8-Review 2026-11-12).
   * @param {string} [preset]
   */
  #applyPresetCss(preset) {
    const name = preset || 'default';
    if (name !== 'default' && FONT_PRESETS[name]) {
      document.documentElement.style.setProperty('--active-font-family', FONT_PRESETS[name]);
    } else {
      document.documentElement.style.removeProperty('--active-font-family');
    }
  }

  #saveSettings() {
    if (this.#settingsManager && typeof this.#settingsManager.updateSettings === 'function') {
      this.#settingsManager.updateSettings();
    } else {
      saveJSON(STORAGE_KEYS.settings, this.settings);
    }
  }

  initFontInjection() {
    /* Blob-Restore ist async: die eigene Schrift erscheint nach dem Paint. Der FOUC
     * (~50–100 ms Systemschrift) ist bewusst akzeptiert ([[ADR-BINARY-ASSETS]]).
     * Ein Ladefehler bleibt bewusst STILL (entschieden 2026-11-13, B13): die
     * Schrift ist optional, und ein Toast bei jedem Oeffnen (z. B. blockierte
     * IndexedDB durch einen anderen Tab) waere Laerm ohne Handlungsoption.
     * Speichern ist die andere Richtung: dort ist der Toast Pflicht. */
    void (async () => {
      const blob = await loadBlob('font');
      if (blob) {
        this.injectFont(blob);
      } else {
        this.updateFontStatusUI(false);
      }
    })();
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
      console.warn('[FontFeature] Custom font invalid:', e);
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
        if (btn) {
          /* Ein Zustandsattribut: `data-font-state` ist das, was CSS und
             index.html lesen. `data-schrift-modus` fuehrte denselben Zustand
             ein zweites Mal (B8-Review 2026-11-12). */
          btn.dataset.fontState = 'loaded';
          btn.textContent = '🗑️ Eigene Schrift entfernen';
        }
      } else {
        this.#applyPresetCss(this.settings.previewFont || 'default');
        if (btn) {
          btn.dataset.fontState = 'empty';
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

  /**
   * Schaltet die Briefschrift um.
   *
   * Zwei Sorten Wert:
   * - `default` / ein Key aus FONT_PRESETS → mitgelieferte Schrift (CSS-Variable)
   * - `lokal:<Datei>` → Schrift aus `<repo>/fonts/`, als FontFace geladen
   *
   * @param {string} val
   * @param {{ speichern?: boolean }} [optionen] `speichern: false` fuer die
   *   Vorschau beim Durchblaettern — dann bleibt localStorage unberuehrt.
   */
  applyFontPreset(val, { speichern = true } = {}) {
    if (typeof val === 'string' && val.startsWith('lokal:')) {
      if (speichern) {
        this.settings.previewFont = val;
        this.#saveSettings();
      }
      void this.#applyLokaleFont(val.slice(6));
      return;
    }
    const choice = val in FONT_PRESETS ? val : 'default';
    if (speichern) {
      this.settings.previewFont = choice;
      if (this.selectFont) {
        this.selectFont.value = choice;
      }
      this.#saveSettings();
    }

    if (!this.activeFontFace) {
      this.#applyPresetCss(choice);
    }
  }

  resetFont() {
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
    if (this.fontUploader) {
      this.fontUploader.value = '';
    }
  }

  attachListeners() {
    if (this.selectFont) {
      /* `change` kommt beim Bestaetigen, `input` schon bei jeder Pfeiltaste im
         offenen Dropdown. Beides abhoeren: so laesst sich die Liste mit den
         Pfeiltasten durchblaettern, waehrend der Brief rechts live wechselt.
         Gespeichert wird nur beim `change` — Blaettern ist kein Entschluss. */
      for (const ereignis of ['input', 'change']) {
        this.selectFont.addEventListener(ereignis, (e) => {
          const val = /** @type {HTMLSelectElement} */ (e.target).value;
          this.#vorschau(val, ereignis === 'change');
        });
      }

      /* Pfeiltasten bei GESCHLOSSENER Liste. Chrome rendert das Select seit
         2025 mit `appearance: base-select`; dort bewegen ArrowUp/ArrowDown
         den Wert nicht mehr, sondern nur den Seitenlauf (gemessen 2026-11-23:
         Tastendruck kommt an, `change` bleibt aus). Deshalb selbst schritt-
         weise weitergehen — die Vorschau haengt am `change`, das wir ausloesen. */
      this.selectFont.addEventListener('keydown', (e) => {
        if (!this.selectFont) return;
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const anzahl = this.selectFont.options.length;
        if (anzahl === 0) return;
        const jetzt = Math.max(0, this.selectFont.selectedIndex);
        let ziel = jetzt;
        switch (e.key) {
          case 'ArrowDown':
            ziel = Math.min(anzahl - 1, jetzt + 1);
            break;
          case 'ArrowUp':
            ziel = Math.max(0, jetzt - 1);
            break;
          case 'PageDown':
            ziel = Math.min(anzahl - 1, jetzt + 10);
            break;
          case 'PageUp':
            ziel = Math.max(0, jetzt - 10);
            break;
          case 'Home':
            ziel = 0;
            break;
          case 'End':
            ziel = anzahl - 1;
            break;
          default:
            return;
        }
        e.preventDefault();
        if (ziel === jetzt) return;
        this.selectFont.selectedIndex = ziel;
        /* `change` von Hand: die Statuszeile der Einstellungen haengt daran,
           und der Listener oben zieht die Vorschau entprellt nach. */
        this.selectFont.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    if (this.btnFontAction) {
      this.btnFontAction.addEventListener('click', () => {
        const btn = /** @type {HTMLButtonElement} */ (this.btnFontAction);
        if (btn.dataset.fontState === 'loaded') {
          this.resetFont();
        } else {
          this.fontUploader?.click();
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
          if (!loaded) {
            /* Feld leeren: sonst loest dieselbe Datei kein change mehr aus und
               der Nutzer muss erst eine andere waehlen (B8-Review 2026-11-12). */
            target.value = '';
            return;
          }
          const success = await saveBlob('font', file);
          if (!success) {
            notify(Constants.TOASTS.FONT.SAVE_ERROR, 'error');
          }
        })();
      });
    }
  }
}
