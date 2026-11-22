// @ts-check
// @adr [[ADR-JS]] {Vorschlagsliste}
// @guide [[din-5008-css-architektur]]

/**
 * @file suggestion-list.js — EIN Bedien-Gerüst für Vorschlagslisten.
 *
 * Warum: PLZ-Liste, Straßen-Liste, Anrede-Liste und die Anschrift-Suche
 * brauchten jeweils dieselbe Mechanik (bauen, klicken, Pfeile, Enter, Escape,
 * Blur) — vier Kopien mit eigenen Feinheiten. Dieser Helfer macht daraus eine
 * Stelle; die Listen liefern nur noch Inhalt und die Aktion beim Klick.
 *
 * Bewusst NICHT hier: die PLZ-Liste (Farben je Stadtteil, Ausklappen von
 * Städten, Firmen-Badges) — die hat echte Fachlogik, kein Gerüst.
 *
 * BEDIENMUSTER (woran sich das Geraet orientiert):
 *  - **WAI-ARIA Combobox/Listbox**: `role=option`, `aria-selected`,
 *    `aria-expanded`; Auswahl NUR durch explizite Aktion (Klick/Enter).
 *  - **Light Dismiss** der Popover-API: Klick ausserhalb und Esc schliessen von
 *    selbst; `blur` behandeln wir zusaetzlich, weil ein Auto-Popover beim
 *    Wegtabben offen bliebe.
 *  - **Expliziter Zustand statt Hover**: Hover ist keine Auswahl (Vorgabe
 *    2026-11-22) — deshalb keine Vorauswahl ohne Interaktion.
 *
 * Verhalten (einheitlich für alle Nutzer dieses Helfers):
 *  - Öffnen per Klick (nicht per Fokus: ein Klick löst focus aus und gilt für
 *    einen auto-Popover als "außerhalb" — er würde sofort wieder schließen)
 *  - Tippen hält die Liste offen und aktualisiert den Inhalt
 *  - Pfeil ↑/↓ wählt, Enter übernimmt, Escape schließt bis zum nächsten Klick
 *  - Blur schließt
 */

import { hidePopoverSafe, showPopoverSafe } from './core.js';

/** 20 mm = 75,6 px bei 96 dpi (DIN 5008 Blattrand, gemessen 2026-11-22). */
export const BLATTRAND_PX = 76;

/**
 * Reine Rechnung: wie hoch darf eine Liste unter `oben` werden?
 * Bezug ist AUSSCHLIESSLICH das Blatt (Vorgabe 2026-11-22: "das dropdown soll
 * absolut zu din a4 seite sein, zu nichts anderem - die din a4 seite ist der
 * arbeitsbereich"). Das Fenster ist nur der Notbezug, wenn es kein Blatt gibt.
 * @param {{ oben: number, blattUnten?: number, viewportUnten: number, rand?: number }} lage
 * @returns {number} nutzbare Hoehe in px (mindestens 220)
 */
export function blattrandHoehe({ oben, blattUnten, viewportUnten, rand = BLATTRAND_PX }) {
  /* Kein min(Fenster, Blatt) mehr: das Fenster hat hier nichts zu melden.
     Liegt der Blatt-Unterrand ausserhalb des Sichtbereichs, reicht die Liste
     dorthin - beim Scrollen folgt sie dem Feld. */
  const unten = blattUnten ?? viewportUnten;
  return Math.max(220, unten - rand - oben - 8);
}

/**
 * Setzt die Hoehe einer Vorschlagsliste so, dass sie bis 20 mm vor den
 * Blatt-Unterrand reicht (Blatt = `#kern`). Wird nicht geklemmt, wenn die
 * Liste kuerzer ist — `max-height` deckelt nur.
 *
 * Bezugsrahmen ist der **Satzspiegel** (DIN 5008: 25 mm links, 20 mm rechts,
 * 20 mm unten), nicht das Browserfenster — Vorgabe 2026-11-22: "die DIN-A4-Seite
 * ist der Arbeitsbereich".
 * @param {HTMLElement} popover
 * @param {HTMLElement} feldEl Ankerfeld (die Liste haengt darunter)
 */
export function passeAnBlattrand(popover, feldEl) {
  if (!popover || !feldEl) return;
  const feldRect = feldEl.getBoundingClientRect();
  const blatt = document.getElementById('kern')?.getBoundingClientRect();
  /* Unterkante der ERSTEN Seite, nicht von #kern: im Mehrseiten-Modus ist
     #kern ein Multicol-Container ueber alle Seiten (column-wrap: wrap), seine
     Unterkante liegt dann auf Seite 2, 3, ... A4 ist 210 x 297 mm, also
     laesst sich die Seitenhoehe aus der Breite ableiten. */
  const ersteSeiteUnten = blatt ? blatt.top + (blatt.width * 297) / 210 : undefined;
  const hoehe = blattrandHoehe({
    /* 4 px = Abstand des Popovers zum Feld (margin-top: var(--space-xs)). */
    oben: feldRect.bottom + 4,
    blattUnten: ersteSeiteUnten,
    viewportUnten: window.innerHeight
  });
  popover.style.maxHeight = `${Math.round(hoehe)}px`;
}

/**
 * @typedef {object} Vorschlag
 * @property {string} text        Haupttext, z. B. "Kettelerstraße 5"
 * @property {string} [zusatz]    Zusatz, z. B. "· 53844 Troisdorf"
 * @property {any} [wert]         Nutzlast fuer `beiWahl` (Standard: text)
 * @property {string} [gruppe]    Optional: Farbgruppe (data-gruppe im li)
 */

/**
 * @param {object} cfg
 * @param {string | HTMLElement} cfg.feld
 * @param {string | HTMLElement} cfg.popover
 * @param {(text: string) => Array<Vorschlag> | Promise<Array<Vorschlag>>} cfg.hole
 *   Liefert die Einträge zum aktuellen Feldtext.
 * @param {(vorschlag: Vorschlag) => void} cfg.beiWahl
 * @param {number} [cfg.verzoegerung] Wartezeit in ms vor `hole` (Standard 0).
 * @param {(popover: HTMLElement, feld: HTMLElement) => void} [cfg.groesse]
 *   Optional: Position/Größe vor dem Öffnen setzen (z. B. am Blattrand halten).
 * @param {string} [cfg.leer] Text, der bei 0 Treffern erscheint. Ohne Angabe
 *   wird die Liste dann geschlossen.
 * @param {() => string} [cfg.aktuell] markiert den passenden Eintrag
 *   (Standard: Wert des Feldes).
 * @param {boolean} [cfg.statisch] Liste aendert sich beim Tippen nicht
 *   (Anrede-Varianten). Dann wird eine bereits offene Liste nicht neu gebaut;
 *   bei datengetriebenen Listen (Strasse) MUSS neu gebaut werden, sonst
 *   bleiben die Treffer des ersten Buchstabens stehen (gemessen 2026-11-22).
 * @returns {{ zerstoeren: () => void }}
 */
export function initVorschlagsliste(cfg) {
  const feld = typeof cfg.feld === 'string' ? document.getElementById(cfg.feld) : cfg.feld;
  const popover =
    typeof cfg.popover === 'string' ? document.getElementById(cfg.popover) : cfg.popover;
  if (!(feld instanceof HTMLElement) || !(popover instanceof HTMLElement)) {
    return { zerstoeren: () => {} };
  }

  /** @type {any} */
  let timer = null;
  /** @type {number} */
  let lauf = 0;
  let unterdrueckt = false;
  /** @type {Vorschlag[]} */
  let eintraege = [];

  const wert = () => (cfg.aktuell ? cfg.aktuell() : /** @type {any} */ (feld).value ?? '');

  /**
   * @param {HTMLElement[]} items
   * @param {number} index
   */
  const markiere = (items, index) => {
    items.forEach((li, i) => {
      li.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  };

  /** @param {Vorschlag[]} liste */
  const zeichne = (liste) => {
    eintraege = liste;
    popover.replaceChildren();
    const aktuell = String(wert() || '').trim();
    liste.forEach((v, index) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.dataset.typ = v.gruppe ? 'stadt' : 'adresse';
      if (v.gruppe) li.dataset.gruppe = v.gruppe;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', v.text === aktuell ? 'true' : 'false');
      li.dataset.index = String(index);

      const main = document.createElement('span');
      main.className = 'suggestion-main';
      const text = document.createElement('span');
      text.className = 'city-val';
      text.textContent = v.text;
      main.appendChild(text);
      if (v.zusatz) {
        const zusatz = document.createElement('span');
        zusatz.className = 'city-sub';
        zusatz.textContent = v.zusatz;
        main.appendChild(zusatz);
      }
      li.appendChild(main);
      li.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        waehle(v);
      });
      popover.appendChild(li);
    });
    /* Standard: so hoch wie das Blatt es zulaesst; `cfg.groesse` darf
       danach Breite/Position setzen (z. B. Strassenliste). */
    passeAnBlattrand(popover, feld);
    if (cfg.groesse) cfg.groesse(popover, feld);
    showPopoverSafe(popover);
    feld.setAttribute('aria-expanded', 'true');
  };

  /** @param {Vorschlag} v */
  const waehle = (v) => {
    cfg.beiWahl(v);
    hidePopoverSafe(popover);
    feld.setAttribute('aria-expanded', 'false');
    unterdrueckt = false;
    /** @type {any} */ (feld).focus?.();
  };

  const zeige = async () => {
    if (unterdrueckt) return;
    if (cfg.statisch && popover.matches(':popover-open') && popover.childElementCount > 0) return;
    const meinLauf = ++lauf;
    const liste = await cfg.hole(String(wert() || '').trim());
    if (meinLauf !== lauf) return; // veraltete Antwort
    const treffer = Array.isArray(liste) ? liste : [];
    if (!treffer.length) {
      if (cfg.leer) {
        popover.replaceChildren();
        const li = document.createElement('li');
        li.className = 'suggestion-hint';
        li.textContent = cfg.leer;
        popover.appendChild(li);
        passeAnBlattrand(popover, feld);
        if (cfg.groesse) cfg.groesse(popover, feld);
        showPopoverSafe(popover);
      } else {
        hidePopoverSafe(popover);
      }
      return;
    }
    zeichne(treffer);
  };

  const verzoegert = () => {
    if (timer) clearTimeout(timer);
    if (cfg.verzoegerung && cfg.verzoegerung > 0) {
      timer = setTimeout(() => {
        timer = null;
        void zeige();
      }, cfg.verzoegerung);
    } else {
      void zeige();
    }
  };

  const oeffne = () => {
    unterdrueckt = false;
    verzoegert();
  };

  const beiKlick = () => oeffne();
  const beiEingabe = () => {
    unterdrueckt = false;
    verzoegert();
  };
  const beiBlur = () => {
    hidePopoverSafe(popover);
    feld.setAttribute('aria-expanded', 'false');
  };

  /** @param {KeyboardEvent} ev */
  const beiTaste = (ev) => {
    if (!popover.matches(':popover-open')) return;
    const items = /** @type {HTMLElement[]} */ ([...popover.querySelectorAll('li.suggestion-item')]);
    if (!items.length) return;
    const idx = items.findIndex((li) => li.getAttribute('aria-selected') === 'true');
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      const naechster =
        ev.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
      markiere(items, naechster);
    } else if (ev.key === 'Enter') {
      const index = Number(items[Math.max(idx, 0)]?.dataset.index ?? 0);
      const v = eintraege[index];
      if (v) {
        ev.preventDefault();
        waehle(v);
      }
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      /* Bleibt zu, bis das Feld neu geklickt wird — sonst öffnet der nächste
         Tastendruck sie sofort wieder. */
      unterdrueckt = true;
      hidePopoverSafe(popover);
      feld.setAttribute('aria-expanded', 'false');
    } else if (ev.key === 'Tab') {
      hidePopoverSafe(popover);
      feld.setAttribute('aria-expanded', 'false');
    }
  };

  feld.addEventListener('click', beiKlick);
  feld.addEventListener('input', beiEingabe);
  feld.addEventListener('blur', beiBlur);
  feld.addEventListener('keydown', beiTaste);

  return {
    zerstoeren: () => {
      if (timer) clearTimeout(timer);
      feld.removeEventListener('click', beiKlick);
      feld.removeEventListener('input', beiEingabe);
      feld.removeEventListener('blur', beiBlur);
      feld.removeEventListener('keydown', beiTaste);
    },
  };
}
