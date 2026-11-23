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

/**
 * Schriften, die im Brief nichts zu suchen haben: Emoji-, Symbol- und
 * Icon-Fonts. Die Muster decken Windows (`Segoe UI Emoji`, `Webdings`),
 * macOS (`Apple Color Emoji`) und Linux (`Noto Color Emoji`, `Unifont`) ab.
 * Die Liste kommt vom Betriebssystem, deshalb muss sie markenuebergreifend
 * sein — ein reiner Linux-Filter waere auf dem naechsten Rechner blind.
 */
const SYSTEM_FONT_BLACKLIST =
  /emoji|symbol|dingbat|webding|wingding|marlett|font awesome|material (icon|symbol)|twemoji|unifont|lastresort|notdef/i;

/** Monospace-Verdacht am Namen — schneller Vorfilter vor der Messung. */
const MONO_NAME = /mono|\bcode\b|courier|consol|terminal|fixed|typewriter|iosevka|cursor/i;

/**
 * Stichproben aus Schriften, die nicht lateinisch sind (Thai, Arabisch,
 * Hebraeisch, Devanagari, Bengali, Tamil, Telugu, Kannada, Malayalam, Sinhala,
 * Myanmar, Khmer, Lao, Tibetisch, Georgisch, Armenisch, Aethiopisch, CJK,
 * Hangul, Kana). Wer davon Zeichen MITBRINGT, ist fuer diese Schrift gebaut —
 * fuer einen deutschen Brief braucht sie niemand.
 *
 * Gemessen wird nicht per Breitenvergleich (das scheitert, wenn die Schrift
 * selbst die Ersatzschrift des Systems fuer diese Sprache ist), sondern direkt
 * in der `cmap` der Datei.
 */
const FREMD_PROBEN = [
  0x0e01, 0x0627, 0x05d0, 0x0905, 0x0985, 0x0b85, 0x0c05, 0x0c85, 0x0d05,
  0x0d85, 0x1000, 0x1780, 0x0e81, 0x0f40, 0x10d0, 0x0531, 0x1200,
  0x4e2d, 0xac00, 0x3042
];

/**
 * Liest die `cmap`-Tabelle einer Schriftdatei: exakte Auskunft, welche
 * Codepoints die Schrift enthaelt. Deckt Format 4 (BMP) und Format 12 (UCS-4)
 * ab — das sind die Formate, die TTF/OTF im Feld nutzen.
 * @param {ArrayBuffer} puffer
 * @returns {((cp: number) => boolean) | null} null, wenn nicht lesbar
 */
function leseCmap(puffer) {
  try {
    const dv = new DataView(puffer);
    const anzahl = dv.getUint16(4);
    let cmap = -1;
    for (let i = 0; i < anzahl; i++) {
      const rec = 12 + i * 16;
      const tag = String.fromCharCode(dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3));
      if (tag === 'cmap') {
        cmap = dv.getUint32(rec + 8);
        break;
      }
    }
    if (cmap < 0) return null;

    const untertabellen = dv.getUint16(cmap + 2);
    let format12 = -1;
    let format4 = -1;
    for (let i = 0; i < untertabellen; i++) {
      const rec = cmap + 4 + i * 8;
      const plattform = dv.getUint16(rec);
      const kodierung = dv.getUint16(rec + 2);
      const offset = cmap + dv.getUint32(rec + 4);
      const format = dv.getUint16(offset);
      if (format === 12 && (plattform === 0 || plattform === 3)) format12 = offset;
      else if (format === 4 && (plattform === 0 || (plattform === 3 && kodierung <= 1))) format4 = offset;
    }

    if (format12 >= 0) {
      const gruppen = dv.getUint32(format12 + 12);
      const start = format12 + 16;
      return (cp) => {
        for (let g = 0; g < gruppen; g++) {
          const o = start + g * 12;
          if (cp >= dv.getUint32(o) && cp <= dv.getUint32(o + 4)) return true;
        }
        return false;
      };
    }

    if (format4 >= 0) {
      const segmente = dv.getUint16(format4 + 6) / 2;
      const endBasis = format4 + 14;
      const startBasis = endBasis + segmente * 2 + 2;
      const deltaBasis = startBasis + segmente * 2;
      const rangeBasis = deltaBasis + segmente * 2;
      return (cp) => {
        if (cp > 0xffff) return false;
        for (let s = 0; s < segmente; s++) {
          if (cp > dv.getUint16(endBasis + s * 2)) continue;
          if (cp < dv.getUint16(startBasis + s * 2)) return false;
          const delta = dv.getInt16(deltaBasis + s * 2);
          const range = dv.getUint16(rangeBasis + s * 2);
          if (range === 0) return ((cp + delta) & 0xffff) !== 0;
          const glyph = rangeBasis + s * 2 + range + (cp - dv.getUint16(startBasis + s * 2)) * 2;
          if (glyph + 1 >= dv.byteLength) return false;
          return dv.getUint16(glyph) !== 0;
        }
        return false;
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Wie „normal" ist ein Schriftschnitt? 0 = Regular, hoeher = ungeeigneter.
 * `queryLocalFonts()` liefert alle Schnitte einer Familie, oft mit Bold oder
 * Bold Italic zuerst — ohne diese Sortierung landet die fette Kursive im Brief.
 * @param {string} [stil]
 * @returns {number}
 */
function schnittRang(stil) {
  const s = String(stil || '').toLowerCase();
  /* Manche Familien nummerieren ihre Schnitte: „10 Regular", „8 Bold".
     Deshalb auf Wortgrenzen pruefen, nicht auf den ganzen String. */
  const kursiv = /italic|oblique|kursiv|slanted/.test(s);
  const normal = /\b(regular|normal|book|roman|mittel|standard)\b/.test(s);
  if (normal && !kursiv) return 0;
  if (kursiv) return 4;
  if (/bold|fett|black|heavy/.test(s)) return 3;
  if (/light|thin|hairline|extralight|demi|semi|medium/.test(s)) return 2;
  return 1;
}

/** @type {CanvasRenderingContext2D | null} */
let messKontext = null;

/**
 * Misst, ob eine Familie dicktengleich setzt. Namenslisten sind unvollstaendig:
 * „Hack" oder „TeX Gyre Cursor" heissen nicht „Mono". Messen funktioniert auf
 * jedem Betriebssystem, weil `queryLocalFonts()` keine Metadaten mitliefert.
 * @param {string} family
 * @returns {boolean}
 */
function istMonospace(family) {
  try {
    if (!messKontext) messKontext = document.createElement('canvas').getContext('2d');
    if (!messKontext) return false;
    messKontext.font = `40px ${JSON.stringify(family)}`;
    const i = messKontext.measureText('iiii').width;
    const m = messKontext.measureText('MMMM').width;
    if (!(i > 0) || !(m > 0)) return false;
    return Math.abs(i - m) < 0.01 * Math.max(i, m);
  } catch {
    return false;
  }
}

/** @type {{ latein: number, x: number } | null} */
let ersatzBreiten = null;

/**
 * Kann die Familie lateinische Buchstaben setzen? Gemessen, nicht geraten:
 * `queryLocalFonts()` liefert nur Namen. Verglichen wird mit einer garantiert
 * fehlenden Familie — fehlt ein Zeichen, liefert der Browser fuer beide
 * denselben Ersatz, dann sind die Breiten gleich.
 *
 * Warum das zaehlt: `font-size-adjust` nimmt die x-Hoehe der ERSTEN Schrift im
 * Stack. Hat die keine lateinischen Glyphen, wird der Ersatztext passend zu
 * einer arabischen/thailaendischen Metrik skaliert — gemessen 2026-11-23:
 * Droid Arabic Kufi, 13 statt 17 Zeilen bei gleicher Breite. Solche Schriften
 * koennen einen deutschen Brief nicht setzen und gehoeren nicht in die Liste.
 * @param {string} family
 * @returns {boolean}
 */
function hatLateinischeBuchstaben(family) {
  try {
    if (!messKontext) messKontext = document.createElement('canvas').getContext('2d');
    if (!messKontext) return true;
    if (!ersatzBreiten) {
      messKontext.font = '40px "__din_brief_gibt_es_nicht__"';
      ersatzBreiten = {
        latein: messKontext.measureText('Hamburgefonstiv').width,
        x: messKontext.measureText('x').width
      };
    }
    messKontext.font = `40px ${JSON.stringify(family)}`;
    const latein = messKontext.measureText('Hamburgefonstiv').width;
    const x = messKontext.measureText('x').width;
    /* Beide muessen abweichen, sonst ist es Zufall: eine Schrift mit echtem
       Latin trifft nie den Ersatz in beiden Zeichenfolgen exakt. */
    return Math.abs(latein - ersatzBreiten.latein) > 0.5 || Math.abs(x - ersatzBreiten.x) > 0.2;
  } catch {
    return true;
  }
}

/**
 * Sieht die Schrift aus wie Text? Faengt Schriften, die a–z haben, die Zeichen
 * aber als Bildchen zeichnen. Webdings/Wingdings deckt die Namensliste ab,
 * `D050000L` (URW Dingbats) nicht — der Name sagt nichts.
 *
 * Ein Textfont hat drei Merkmale, ein Symbolfont keins davon:
 * - Grossbuchstabe deutlich hoeher als Kleinbuchstabe (H/x rund 1,3)
 * - `W` deutlich breiter als `i` (rund 4:1)
 * - Unterlaenge bei `p` (> 0)
 *
 * Gemessen 2026-11-23 an 82 Familien: genau `D050000L` faellt durch
 * (1,01 / 1,1 / 0), waehrend Liberation (1,28 / 4,2 / 21) und Carlito
 * (1,35 / 3,9 / 17) klar bestehen.
 * @param {string} family
 * @returns {boolean}
 */
function siehtAusWieText(family) {
  try {
    if (!messKontext) messKontext = document.createElement('canvas').getContext('2d');
    if (!messKontext) return true;
    messKontext.font = `100px ${JSON.stringify(family)}`;
    const schmal = messKontext.measureText('i').width;
    const breit = messKontext.measureText('W').width;
    const hochGross = messKontext.measureText('H').actualBoundingBoxAscent;
    const hochKlein = messKontext.measureText('x').actualBoundingBoxAscent;
    const unterlaenge = messKontext.measureText('p').actualBoundingBoxDescent;
    if (!(schmal > 0) || !(hochKlein > 0)) return false;
    return hochGross / hochKlein >= 1.15 && breit / schmal >= 2 && unterlaenge > 0;
  } catch {
    return true;
  }
}

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
    this.btnSystemFonts = /** @type {HTMLButtonElement | null} */ (document.getElementById('btn-systemschriften'));

    /** Installierte Familien aus der Local Font Access API: Name -> FontData. */
    this.systemFonts = new Map();
    /** Familien, die einen normalen Schnitt haben (Regular/Normal/Book/Roman). */
    this.systemFamilienMitNormal = new Set();
    /** Familien, deren Datei Zeichen fremder Schriftsysteme mitbringt. */
    this.systemFremdSchrift = new Set();
    /** @type {FontFace | null} */
    this.activeSystemFace = null;

    /** Lokale Testschriften aus `<repo>/fonts/`: Dateiname -> Familie. */
    this.lokaleSchriften = new Map();
    /** @type {FontFace | null} */
    this.activeLokalFace = null;

    /** Suchfeld ueber der Auswahl (filtert nur die Systemschriften). */
    this.filterFeld = /** @type {HTMLInputElement | null} */ (document.getElementById('schrift-filter'));
    /** @type {HTMLOptGroupElement | null} */
    this.systemGruppe = null;
    /** @type {string[]} */
    this.systemSchriften = [];

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
    this.#initSystemFonts();
    void this.ladeLokaleSchriften();
    this.isReady = true;
  }

  /* --- Systemschriften (Local Font Access API) ---------------------------
   * `queryLocalFonts()` liefert die auf dem Rechner installierten Familien.
   * Der Browser fragt beim ersten Aufruf nach Erlaubnis; ohne Erlaubnis wirft
   * die API `NotAllowedError`. Dann bleibt es beim Standard-Stack — der Knopf
   * ist da, die Liste unveraendert.
   *
   * Die Schriften werden NICHT gespeichert: die Berechtigung gilt pro Sitzung
   * fuer den Origin, die Liste wird bei Bedarf neu abgefragt. Ein Eintrag im
   * `previewFont`-Feld ueberlebt deshalb keinen Reload, und das ist Absicht
   * (sonst zeigte ein Brief auf eine Schrift, die es auf dem Zielrechner
   * vielleicht nicht gibt). */
  /**
   * Die API steht nicht im lib.dom von TypeScript 5.x — deshalb der Umweg
   * ueber `globalThis` mit Cast, statt die Typen zu erweitern.
   * @returns {(() => Promise<any[]>) | null}
   */
  #queryLocalFontsApi() {
    const api = /** @type {any} */ (globalThis).queryLocalFonts;
    return typeof api === 'function' ? api : null;
  }

  #initSystemFonts() {
    if (!this.btnSystemFonts) return;
    if (!this.#queryLocalFontsApi()) return;
    this.btnSystemFonts.hidden = false;
    this.btnSystemFonts.addEventListener('click', () => {
      void this.ladeSystemschriften();
    });
  }

  async ladeSystemschriften() {
    const btn = this.btnSystemFonts;
    const api = this.#queryLocalFontsApi();
    if (!api) return;
    if (btn) btn.disabled = true;
    try {
      const fonts = await api();
      this.systemFonts.clear();
      this.systemFamilienMitNormal = new Set();
      for (const font of fonts) {
        /* `queryLocalFonts()` liefert ALLE Schnitte einer Familie, und zwar
           nicht in sinnvoller Reihenfolge: bei C059 steht „Bold Italic" vorn
           (gemessen 2026-11-23: 101 von 166 Familien haben keinen Regular als
           ersten Eintrag). Wer nur den ersten nimmt, laedt fette Kursive —
           genau der Befund „C059 sieht komisch fett aus". Also den Rang
           vergleichen und den normalsten Schnitt behalten. */
        const rang = schnittRang(font.style);
        const vorhanden = this.systemFonts.get(font.family);
        if (!vorhanden || rang < schnittRang(vorhanden.style)) {
          this.systemFonts.set(font.family, font);
        }
        /* Familien ohne normalen Schnitt (nur Thin, nur Demi, nur kursiv) sind
           fuer einen Brief unbrauchbar — sie kommen gar nicht erst in die
           Auswahl. */
        if (rang === 0) this.systemFamilienMitNormal.add(font.family);
      }
      /* Welt-Schriften aussortieren: ihre Datei bringt Zeichen fremder
         Schriftsysteme mit. Das steht exakt in der `cmap` — kein Raten, keine
         Namensliste, funktioniert auf Windows und macOS genauso. */
      this.systemFremdSchrift = await this.#ermittleFremdeSchriften();
      this.#baueSystemOptionen();
    } catch (e) {
      console.warn('[FontFeature] Systemschriften nicht verfügbar:', e);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /**
   * Liest fuer jede Familie die Schriftdatei und prueft die `cmap` auf Zeichen
   * fremder Schriftsysteme. Ein Lesefehler zaehlt als „nicht fremd" — lieber
   * eine Schrift zu viel in der Liste als eine zu wenig.
   * @returns {Promise<Set<string>>}
   */
  async #ermittleFremdeSchriften() {
    const fremd = new Set();
    await Promise.all(
      [...this.systemFonts.entries()].map(async ([familie, daten]) => {
        try {
          const blob = await daten.blob();
          const hat = leseCmap(await blob.arrayBuffer());
          if (hat && FREMD_PROBEN.some((cp) => hat(cp))) fremd.add(familie);
        } catch {
          /* Datei nicht lesbar: nicht aussortieren. */
        }
      })
    );
    return fremd;
  }

  #baueSystemOptionen() {
    if (!this.selectFont) return;
    const alt = this.selectFont.querySelector('optgroup[data-systemschriften]');
    if (alt) alt.remove();

    /* Vor dem Aufbau filtern, in dieser Reihenfolge:
       1. Emoji/Symbol/Icons raus (Namensmuster, deckt Windows/macOS/Linux ab)
       2. Monospace raus (gemessen — „Hack" und „TeX Gyre Cursor" heissen
          nicht „Mono", sind es aber)
       3. Schriften ohne lateinische Buchstaben raus (gemessen — sie koennen
          einen deutschen Brief nicht setzen und verfaelschen font-size-adjust)
       4. Schriften, die keine Buchstaben zeichnen, sondern Bildchen
          (gemessen — Dingbats mit a–z-Belegung wie D050000L) */
    this.systemSchriften = [...this.systemFonts.keys()]
      .filter((familie) => !SYSTEM_FONT_BLACKLIST.test(familie))
      .filter((familie) => !MONO_NAME.test(familie))
      .filter((familie) => !istMonospace(familie))
      .filter((familie) => hatLateinischeBuchstaben(familie))
      .filter((familie) => siehtAusWieText(familie))
      .filter((familie) => this.systemFamilienMitNormal.has(familie))
      .filter((familie) => !this.systemFremdSchrift.has(familie))
      .sort((a, b) => a.localeCompare(b, 'de'));

    const gruppe = document.createElement('optgroup');
    gruppe.setAttribute('data-systemschriften', '');
    this.systemGruppe = gruppe;
    this.selectFont.append(gruppe);

    if (this.filterFeld) {
      this.filterFeld.hidden = this.systemSchriften.length === 0;
      this.filterFeld.value = '';
    }
    this.#filtereSystemschriften();
  }

  /**
   * Filtert die gebaute Liste auf die Sucheingabe. Die Optionen werden neu
   * geschrieben statt einzelne `hidden` zu setzen — Zuverlaessigkeit vor
   * Sparsamkeit: ein `hidden` auf `<option>` wird je nach Chrome-Version
   * unterschiedlich ernst genommen.
   */
  #filtereSystemschriften() {
    const gruppe = this.systemGruppe;
    if (!gruppe) return;
    const suche = (this.filterFeld?.value || '').trim().toLowerCase();
    const treffer = suche ? this.systemSchriften.filter((f) => f.toLowerCase().includes(suche)) : this.systemSchriften;

    gruppe.replaceChildren();
    for (const familie of treffer) {
      const option = document.createElement('option');
      option.value = `sys:${familie}`;
      option.textContent = familie;
      gruppe.append(option);
    }
    gruppe.label = suche
      ? `Systemschriften (${treffer.length} von ${this.systemSchriften.length})`
      : `Systemschriften (${this.systemSchriften.length})`;

    /* Eine bereits gewaehlte Systemschrift soll die Suche ueberleben. */
    const gewaehlt = this.settings.previewFont;
    if (typeof gewaehlt === 'string' && gewaehlt.startsWith('sys:') && treffer.includes(gewaehlt.slice(4)) && this.selectFont) {
      this.selectFont.value = gewaehlt;
    }
  }

  /**
   * Laedt eine installierte Familie als `FontFace` und setzt sie als
   * Briefschrift. Der Wert kommt als `sys:<Familie>` aus der Auswahlliste.
   * @param {string} family
   */
  async #applySystemFont(family) {
    const daten = this.systemFonts.get(family);
    if (!daten) return;
    if (this.activeSystemFace && typeof document.fonts !== 'undefined') {
      document.fonts.delete(this.activeSystemFace);
      this.activeSystemFace = null;
    }
    try {
      const blob = await daten.blob();
      const face = new FontFace(family, await blob.arrayBuffer());
      await face.load();
      document.fonts.add(face);
      this.activeSystemFace = face;
      document.documentElement.style.setProperty(
        '--active-font-family',
        `"${family}", var(--font-system-stack)`,
      );
    } catch (e) {
      console.warn('[FontFeature] Systemschrift nicht ladbar:', e);
      notify(Constants.TOASTS.FONT.FORMAT_ERROR, 'error');
    }
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
    /* Eine Systemschrift ueberlebt den Reload nicht: die Liste entsteht erst
       auf Klick (Berechtigung). Bliebe der Wert stehen, zeigte die Auswahl
       leer und der Brief still die Standardschrift — dann lieber gleich
       zurueck auf `default`, sichtbar und ehrlich.
       Lokale Schriften aus `fonts/` werden dagegen geladen: ihre Liste kommt
       vom Dev-Server (siehe ladeLokaleSchriften) und ist beim naechsten Start
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
   * Drei Sorten Wert:
   * - `default` / ein Key aus FONT_PRESETS → mitgelieferte Schrift (CSS-Variable)
   * - `sys:<Familie>` → installierte Systemschrift, als FontFace geladen
   * - `lokal:<Datei>` → Schrift aus `<repo>/fonts/`, ebenfalls als FontFace
   *
   * @param {string} val
   * @param {{ speichern?: boolean }} [optionen] `speichern: false` fuer die
   *   Vorschau beim Durchblaettern — dann bleibt localStorage unberuehrt.
   */
  applyFontPreset(val, { speichern = true } = {}) {
    if (typeof val === 'string' && val.startsWith('sys:')) {
      if (speichern) {
        this.settings.previewFont = val;
        this.#saveSettings();
      }
      void this.#applySystemFont(val.slice(4));
      return;
    }
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

    if (this.filterFeld) {
      let timer = 0;
      this.filterFeld.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => this.#filtereSystemschriften(), 80);
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
