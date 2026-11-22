// @ts-check
// @adr [[ADR-JS]]
/**
 * @file date-picker.js — Kalender-Popover für das Briefdatum (#datum).
 *
 * Warum ein eigener Kalender: der native <input type="date"> zeigt ISO-Format
 * und je nach Browser eine fremde Optik; eine Fremdbibliothek verbietet A66.
 * Dieser Kalender ist ein Popover am Blatt (CSS Anchor Positioning), benutzt die
 * vorhandenen Tokens und schreibt das deutsche Langformat ("22. November 2026")
 * über dieselbe Funktion wie der Briefaufbau: formatDatum(..., 'alpha').
 *
 * Zeitrechnung ausschließlich über Temporal (A48/A50) — kein Date, keine
 * Zeitzonen-Raterei: "heute" ist Europe/Berlin.
 *
 * Das Feld bleibt Freitext: der Kalender schreibt, er liest nur zum Öffnen
 * (damit der richtige Monat erscheint). Tippen bleibt unverändert möglich.
 */

import { hidePopoverSafe, showPopoverSafe } from './core.js';
import { formatDatum } from './format.js';
import { klemmeAnSatzspiegel } from './suggestion-list.js';

/** Wochenstart Montag (DIN). */
export const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/**
 * Heutiges Datum in der Brief-Zeitzone.
 * @returns {Temporal.PlainDate}
 */
export function heute() {
  return Temporal.Now.zonedDateTimeISO('Europe/Berlin').toPlainDate();
}

/**
 * Alle Tage eines Monats als ISO-Strings.
 * @param {number} jahr
 * @param {number} monat 1..12
 * @returns {{ tag: number, iso: string }[]}
 */
export function monatsTage(jahr, monat) {
  const erster = Temporal.PlainDate.from({ year: jahr, month: monat, day: 1 });
  return Array.from({ length: erster.daysInMonth }, (_, i) => {
    const tag = erster.with({ day: i + 1 });
    return { tag: i + 1, iso: tag.toString() };
  });
}

/**
 * Leerzellen vor dem 1. (Montag = 0). Temporal zählt dayOfWeek 1..7, Mo = 1.
 * @param {number} jahr
 * @param {number} monat
 * @returns {number}
 */
export function startOffset(jahr, monat) {
  return Temporal.PlainDate.from({ year: jahr, month: monat, day: 1 }).dayOfWeek - 1;
}

/**
 * Deutscher Monatsname in Langform.
 * @param {number} monat 1..12
 * @returns {string}
 */
export function monatsName(monat) {
  return Temporal.PlainDate.from({ year: 2000, month: monat, day: 1 }).toLocaleString('de-DE', {
    month: 'long'
  });
}

/**
 * @param {number} jahr
 * @param {number} monat
 * @returns {string} z. B. "November 2026"
 */
export function titelText(jahr, monat) {
  return `${monatsName(monat)} ${jahr}`;
}

/**
 * Liest ein Datum aus dem Feldtext: ISO (2026-11-22), numerisch (22.11.2026)
 * oder Langform (22. November 2026). Was nicht passt, ist null — kein Raten.
 * @param {string} text
 * @returns {Temporal.PlainDate | null}
 */
export function leseDatum(text) {
  const roh = String(text || '').trim();
  if (!roh) return null;

  const iso = roh.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return baue(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numerisch = roh.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (numerisch) return baue(Number(numerisch[3]), Number(numerisch[2]), Number(numerisch[1]));

  const lang = roh.match(/^(\d{1,2})\.\s*([A-Za-zÄÖÜäöüß]+)\s+(\d{4})$/);
  if (lang) {
    const name = lang[2].toLowerCase();
    for (let m = 1; m <= 12; m++) {
      if (monatsName(m).toLowerCase() === name) return baue(Number(lang[3]), m, Number(lang[1]));
    }
  }
  return null;
}

/**
 * @param {number} jahr
 * @param {number} monat
 * @param {number} tag
 * @returns {Temporal.PlainDate | null}
 */
function baue(jahr, monat, tag) {
  try {
    /* overflow:'reject' ist Pflicht: der Default ('constrain') macht aus dem
       31. Februar stillschweigend den 28. — genau das soll der Leser nicht
       als vermeintlich gueltige Eingabe zurueckbekommen. */
    return Temporal.PlainDate.from({ year: jahr, month: monat, day: tag }, { overflow: 'reject' });
  } catch {
    /* z. B. 31. Februar: kein gueltiges Datum. */
    return null;
  }
}

/**
 * Erzeugt einen kleinen Knopf mit data-aktion.
 * @param {string} aktion
 * @param {string} text
 * @param {string} label
 * @param {string} [klasse]
 * @returns {HTMLButtonElement}
 */
function knopf(aktion, text, label, klasse) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = klasse || 'kalender-nav';
  b.dataset.aktion = aktion;
  b.textContent = text;
  b.setAttribute('aria-label', label);
  return b;
}

/**
 * Bindet den Kalender an #datum/#datum-kalender. Ohne beide Elemente: nichts.
 * @returns {void}
 */
export function initDatePicker() {
  const feld = /** @type {HTMLInputElement | null} */ (document.getElementById('datum'));
  const popover = /** @type {HTMLElement | null} */ (document.getElementById('datum-kalender'));
  if (!(feld instanceof HTMLInputElement) || !popover) return;

  const heuteDatum = heute();
  const heuteIso = heuteDatum.toString();
  /** @type {Temporal.PlainDate} */
  let sichtbar = heuteDatum.with({ day: 1 });
  /** @type {Temporal.PlainDate | null} */
  let gewaehlt = null;
  /** @type {'tag' | 'monat'} */
  let ansicht = 'tag';

  const kopfBauen = () => {
    const kopf = document.createElement('div');
    kopf.className = 'kalender-kopf';
    if (ansicht === 'monat') {
      kopf.append(
        knopf('jahr-zurueck', '«', 'Ein Jahr zurück'),
        knopf('monate', String(sichtbar.year), 'Zur Tagesansicht', 'kalender-titel'),
        knopf('jahr-vor', '»', 'Ein Jahr vor')
      );
      return kopf;
    }
    kopf.append(
      knopf('jahr-zurueck', '«', 'Ein Jahr zurück'),
      knopf('monat-zurueck', '‹', 'Ein Monat zurück'),
      knopf('monate', titelText(sichtbar.year, sichtbar.month), 'Monat wählen', 'kalender-titel'),
      knopf('monat-vor', '›', 'Ein Monat vor'),
      knopf('jahr-vor', '»', 'Ein Jahr vor')
    );
    return kopf;
  };

  const tageBauen = () => {
    const gitter = document.createElement('div');
    gitter.className = 'kalender-gitter';
    gitter.setAttribute('role', 'grid');
    for (const w of WOCHENTAGE) {
      const k = document.createElement('span');
      k.className = 'kalender-wochentag';
      k.textContent = w;
      gitter.append(k);
    }
    for (let i = 0; i < startOffset(sichtbar.year, sichtbar.month); i++) {
      const l = document.createElement('span');
      l.className = 'kalender-leer';
      gitter.append(l);
    }
    const gewaehltIso = gewaehlt ? gewaehlt.toString() : '';
    for (const t of monatsTage(sichtbar.year, sichtbar.month)) {
      const z = document.createElement('button');
      z.type = 'button';
      z.className = 'kalender-tag';
      z.dataset.iso = t.iso;
      z.textContent = String(t.tag);
      z.setAttribute('aria-label', formatDatum(t.iso, { format: 'alpha' }));
      if (t.iso === heuteIso) z.classList.add('ist-heute');
      if (t.iso === gewaehltIso) z.setAttribute('aria-current', 'date');
      gitter.append(z);
    }
    return gitter;
  };

  const monateBauen = () => {
    const gitter = document.createElement('div');
    gitter.className = 'kalender-gitter kalender-gitter-monate';
    for (let m = 1; m <= 12; m++) {
      const z = document.createElement('button');
      z.type = 'button';
      z.className = 'kalender-monat';
      z.dataset.monat = String(m);
      z.textContent = monatsName(m);
      if (m === sichtbar.month) z.setAttribute('aria-current', 'true');
      gitter.append(z);
    }
    return gitter;
  };

  const fussBauen = () => {
    const fuss = document.createElement('div');
    fuss.className = 'kalender-fuss';
    fuss.append(knopf('heute', 'Heute', 'Heutiges Datum übernehmen', 'kalender-heute'));
    return fuss;
  };

  const zeichne = () => {
    popover.replaceChildren(kopfBauen(), ansicht === 'tag' ? tageBauen() : monateBauen(), fussBauen());
  };

  const schliesse = () => {
    hidePopoverSafe(popover);
    feld.setAttribute('aria-expanded', 'false');
  };

  /** @param {string} iso */
  const uebernehmen = (iso) => {
    feld.value = formatDatum(iso, { format: 'alpha' });
    /* input + change: `input` setzt meta.datum.userSet (document.js:719),
       `change` bedient alles, was auf ein fertiges Feld wartet. */
    feld.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText', data: feld.value })
    );
    feld.dispatchEvent(new Event('change', { bubbles: true }));
    schliesse();
    feld.focus();
  };

  const oeffne = () => {
    gewaehlt = leseDatum(feld.value);
    sichtbar = (gewaehlt ?? heuteDatum).with({ day: 1 });
    ansicht = 'tag';
    zeichne();
    klemmeAnSatzspiegel(popover, feld);
    showPopoverSafe(popover);
    feld.setAttribute('aria-expanded', 'true');
  };

  popover.addEventListener('click', (ev) => {
    const ziel = ev.target instanceof Element ? ev.target.closest('button') : null;
    if (!(ziel instanceof HTMLButtonElement)) return;

    const iso = ziel.dataset.iso;
    if (iso) {
      uebernehmen(iso);
      return;
    }

    const monat = ziel.dataset.monat;
    if (monat) {
      sichtbar = sichtbar.with({ month: Number(monat) });
      ansicht = 'tag';
      zeichne();
      return;
    }

    switch (ziel.dataset.aktion) {
      case 'monate':
        ansicht = ansicht === 'tag' ? 'monat' : 'tag';
        zeichne();
        break;
      case 'heute':
        uebernehmen(heuteIso);
        break;
      case 'monat-zurueck':
        sichtbar = sichtbar.subtract({ months: 1 });
        zeichne();
        break;
      case 'monat-vor':
        sichtbar = sichtbar.add({ months: 1 });
        zeichne();
        break;
      case 'jahr-zurueck':
        sichtbar = sichtbar.subtract({ years: 1 });
        zeichne();
        break;
      case 'jahr-vor':
        sichtbar = sichtbar.add({ years: 1 });
        zeichne();
        break;
      default:
        break;
    }
  });

  /* Esc: Popover schliessen und den Fokus zurück ins Feld geben. */
  popover.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      schliesse();
      feld.focus();
    }
  });

  /* Auch Light-Dismiss (Klick daneben) muss aria-expanded zurücksetzen. */
  popover.addEventListener('toggle', (ev) => {
    const offen = /** @type {ToggleEvent} */ (ev).newState === 'open';
    feld.setAttribute('aria-expanded', offen ? 'true' : 'false');
  });

  feld.addEventListener('click', () => {
    if (popover.matches(':popover-open')) schliesse();
    else oeffne();
  });

  /* Tastatur: Enter oder Alt+Pfeil-unten öffnet (Klick bleibt der Hauptweg).
     Auf `focus` bewusst nicht — sonst springt der Kalender beim Durchtabben auf. */
  feld.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || (ev.altKey && ev.key === 'ArrowDown')) {
      ev.preventDefault();
      oeffne();
    }
  });
}
