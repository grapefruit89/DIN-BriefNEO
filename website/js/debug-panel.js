// @ts-check
// @adr [[ADR-JS]] {Debug}
// @guide [[din-5008-css-architektur]]

/**
 * @file debug-panel.js — füllt das Debug-Panel mit Werten.
 *
 * Das Panel selbst steht als **statisches Markup** in `index.html`; sichtbar
 * wird es allein über CSS (`:root:has(#toggle-debug:checked) #debug-panel`).
 * Hier steht deshalb nur: Werte holen und in vorhandene `<dd>` schreiben.
 * Das × im Panel ist ein `<label for="toggle-debug">` und schaltet den
 * Schalter nativ aus — kein JS zum Schließen.
 *
 * Geladen wird das Modul nur, wenn der Schalter an ist (main.js), und die
 * Aktualisierung läuft nur, solange das Panel sichtbar ist.
 *
 * Bewusst NICHT: eigene Sonden, Zähler im Produktivpfad, Diagramme.
 */

import { strassenSuchPfad } from './address.js';
import { AddressIntelligence } from './address-data.js';
import { collectDraft } from './document.js';
import { aktuelleStunde, formatZahl } from './format.js';
import { geoCacheGroesse } from './geo-cache.js';
import { holeLog } from './log.js';
import { buildDINLetterJSON, load, loadJSON, STORAGE_KEYS } from './persistence.js';
import { SALUTATION_TONES, salutationVarianten } from './salutation.js';

/** @param {number} bytes @returns {string} */
const alsKb = (bytes) => `${formatZahl(Math.round(bytes / 102.4) / 10)} KB`;

/** @returns {number} Groesse des localStorage in Bytes (UTF-16) */
function speicherBytes() {
  let summe = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const schluessel = localStorage.key(i) || '';
    summe += (schluessel.length + (localStorage.getItem(schluessel) || '').length) * 2;
  }
  return summe;
}

/** @param {string} id @returns {string} */
function feldWert(id) {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value.trim();
  return (el?.textContent || '').trim();
}

/** @type {ReturnType<typeof setInterval> | null} */
let timer = null;

/** @returns {Record<string, string>} alles, was im Panel steht */
function leseWerte() {
  /** @type {Record<string, string>} */
  const werte = {};
  for (const liste of document.querySelectorAll('#debug-panel dl')) {
    const namen = liste.querySelectorAll('dt');
    const werteEl = liste.querySelectorAll('dd');
    namen.forEach((dt, i) => {
      werte[dt.textContent.trim()] = werteEl[i]?.textContent || '';
    });
  }
  return werte;
}

/**
 * Was das Dropdown eines Feldes anbieten wuerde — pro Feld einzeln, damit man
 * es nicht erst aufklappen und abtippen muss (Vorgabe 2026-11-22).
 * @param {string} art
 * @returns {Promise<{ titel: string, zeilen: string[] }>}
 */
async function dropdownInhalt(art) {
  const feld = (/** @type {string} */ id) => {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value.trim();
    return (el?.textContent || '').trim();
  };

  if (art === 'anrede') {
    const varianten = salutationVarianten(
      feld('empfaenger-name'),
      feld('empfaenger-firma'),
      aktuelleStunde()
    );
    return {
      titel: `Anrede (${feld('empfaenger-name') || feld('empfaenger-firma') || 'ohne Empfänger'})`,
      zeilen: varianten.map((v) => `${v.anrede}   [${v.ton}]`)
    };
  }

  if (art === 'gruss') {
    const stil = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
    const ton = stil && stil.value in SALUTATION_TONES ? stil.value : 'formal';
    return {
      titel: `Grußformeln (${ton})`,
      zeilen: [...SALUTATION_TONES[/** @type {keyof typeof SALUTATION_TONES} */ (ton)].closings]
    };
  }

  if (art === 'ort-empf' || art === 'ort-abs') {
    const wert = feld(art === 'ort-empf' ? 'empfaenger-ort' : 'absender-ort');
    const titel = `Orte (${art === 'ort-empf' ? 'Empfänger' : 'Absender'}: ${wert || 'leer'})`;
    if (wert.length < 3) return { titel, zeilen: ['(zu kurz — ab 3 Zeichen)'] };
    if (/^\d{5}$/.test(wert)) {
      const treffer = AddressIntelligence.lookupPlz(wert);
      return { titel, zeilen: treffer ? [`${treffer.plz} ${treffer.city}`] : ['(keine PLZ gefunden)'] };
    }
    const res = AddressIntelligence.resolveCityInput(wert, 24);
    const nurOrte = (res.items || []).filter((i) => (i.typ || 'Stadt') === 'Stadt');
    return {
      titel,
      zeilen: nurOrte.length
        ? nurOrte.slice(0, 40).map((i) => `${i.plz ? `${i.plz} ` : ''}${i.city || i.name || ''}${i.district ? ` · ${i.district}` : ''}`)
        : ['(keine Treffer)']
    };
  }

  /* Strasse: derselbe Pfad-Bauer wie die echte Suche, aber ohne Cache -
     damit man sieht, was Geoapify JETZT liefern wuerde. */
  const wert = feld(art === 'strasse-empf' ? 'empfaenger-strasse' : 'absender-strasse');
  const titel = `Straße (${art === 'strasse-empf' ? 'Empfänger' : 'Absender'}: ${wert || 'leer'})`;
  if (wert.length < 3) return { titel, zeilen: ['(zu kurz — ab 3 Zeichen)'] };
  const key = load(STORAGE_KEYS.geoapifyKey, '');
  if (!key) return { titel, zeilen: ['(kein Geoapify-Key gesetzt)'] };
  try {
    const antwort = await fetch(`https://api.geoapify.com${strassenSuchPfad(wert, key)}`);
    const daten = await antwort.json();
    const treffer = (daten?.results || []).filter((/** @type {any} */ r) => r.street);
    return {
      titel,
      zeilen: treffer.map((/** @type {any} */ r) => `${[r.street, r.housenumber].filter(Boolean).join(' ')} · ${[r.postcode, r.city].filter(Boolean).join(' ')}`)
    };
  } catch (err) {
    return { titel, zeilen: [`(Abruf fehlgeschlagen: ${err instanceof Error ? err.message : String(err)})`] };
  }
}

/** @param {unknown} wert @returns {string} */
function alsJson(wert) {
  try {
    return JSON.stringify(wert, null, 2);
  } catch {
    return JSON.stringify(String(wert), null, 2);
  }
}

/**
 * @param {HTMLElement} knopf
 * @param {() => Promise<void>} aktion
 */
function mitFeedback(knopf, aktion) {
  const original = knopf.textContent;
  knopf.addEventListener('click', async () => {
    try {
      await aktion();
      knopf.textContent = '✓ Kopiert';
    } catch (err) {
      knopf.textContent = '✗ Fehler';
      console.error('[Debug-panel] Kopieren fehlgeschlagen:', err);
    }
    setTimeout(() => {
      knopf.textContent = original;
    }, 2000);
  });
}

function verdrahteKnoepfe() {
  const jsonKnopf = document.getElementById('dbg-copy-json');
  const logKnopf = document.getElementById('dbg-copy-log');
  if (jsonKnopf) {
    mitFeedback(jsonKnopf, async () => {
      let erzeugt = '';
      try {
        erzeugt = Temporal.Now.zonedDateTimeISO('Europe/Berlin').toString();
      } catch {
        erzeugt = '';
      }
      const nutzlast = {
        erzeugt,
        debug: leseWerte(),
        brief: buildDINLetterJSON(collectDraft),
        fehler: holeLog()
      };
      await navigator.clipboard.writeText(alsJson(nutzlast));
    });
  }
  for (const knopf of document.querySelectorAll('[data-dbg-liste]')) {
    const art = /** @type {HTMLElement} */ (knopf).dataset.dbgListe || '';
    mitFeedback(/** @type {HTMLElement} */ (knopf), async () => {
      const inhalt = await dropdownInhalt(art);
      const text = inhalt.zeilen.length
        ? `${inhalt.titel}\n${'-'.repeat(inhalt.titel.length)}\n${inhalt.zeilen.join('\n')}`
        : `${inhalt.titel}\n(leer)`;
      await navigator.clipboard.writeText(text);
    });
  }

  if (logKnopf) {
    mitFeedback(logKnopf, async () => {
      const log = holeLog();
      const text = log.length
        ? log.map((e) => `[${e.stufe}] #${e.nr} ${e.text}`).join('\n')
        : 'Keine Fehler oder Warnungen im Ringpuffer.';
      await navigator.clipboard.writeText(text);
    });
  }
}

/** Einmalige Initialisierung: Werte schreiben und sichtbarkeitsabhängig takten. */
export function initDebugPanel() {
  if (timer) return;
  verdrahteKnoepfe();
  aktualisiere();
  timer = setInterval(() => {
    /* Nur arbeiten, solange der Schalter an ist. (offsetParent taugt hier
       nicht: das Panel ist `position: fixed` und hat deshalb immer null.) */
    const panel = document.getElementById('debug-panel');
    if (panel && getComputedStyle(panel).display !== 'none') aktualisiere();
  }, 1500);
}

export function aktualisiere() {
  /** @param {string} id @param {string | number} wert */
  const setze = (id, wert) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(wert);
  };

  const ai = AddressIntelligence;
  if (ai.isReady) {
    setze('dbg-plz', formatZahl(ai.plzToCity.size));
    setze('dbg-orte', formatZahl(ai.ortList.length));
    setze('dbg-ortsteile', formatZahl(ai.districts.size));
    setze('dbg-bundesland', formatZahl(ai.states.size));
  }

  const cache = geoCacheGroesse();
  const adressbuch = /** @type {unknown[]} */ (loadJSON(STORAGE_KEYS.addresses, []));
  setze('dbg-adressbuch', formatZahl(Array.isArray(adressbuch) ? adressbuch.length : 0));
  setze('dbg-cache', `${formatZahl(cache.eintraege)} · ${alsKb(cache.bytes)} · ${formatZahl(cache.gewaehlt)} gewählt`);
  setze('dbg-speicher', alsKb(speicherBytes()));
  setze('dbg-entwurf', alsKb((localStorage.getItem(STORAGE_KEYS.draft) || '').length * 2));
  setze('dbg-gedruckt', formatZahl(Number(localStorage.getItem('din_print_count') || '0') || 0));

  const root = document.documentElement;
  setze('dbg-layout', root.dataset.layout === 'form-a' ? 'Form A' : 'Form B');
  setze('dbg-unterrand', getComputedStyle(root).getPropertyValue('--rand-u').trim() || '–');
  setze('dbg-schrift', getComputedStyle(root).getPropertyValue('--active-font-family').trim().slice(0, 26) || '–');
  /* Uhrzeit zeigt, welche Anrede-Variante gerade "passt". */
  const stunde = aktuelleStunde();
  setze('dbg-uhr', stunde === null ? '–' : `${String(stunde).padStart(2, '0')} Uhr`);

  /* Fehler-Ring: Anzahl + die letzten Meldungen (kopierbar ueber den Knopf). */
  const log = holeLog();
  const fehler = log.filter((e) => e.stufe === 'error').length;
  setze('dbg-fehler', log.length === 0 ? 'keine' : `${formatZahl(log.length)} (${formatZahl(fehler)} Fehler)`);
  const logListe = document.getElementById('debug-log');
  if (logListe) {
    logListe.replaceChildren();
    for (const e of log.slice(-6)) {
      const dt = document.createElement('dt');
      dt.textContent = `${e.stufe} #${e.nr}`;
      const dd = document.createElement('dd');
      dd.textContent = e.text;
      logListe.append(dt, dd);
    }
  }

  /* Dynamischer Teil: belegte Adressfelder + offene Vorschlagsliste. */
  const felder = document.getElementById('debug-felder');
  if (!felder) return;
  felder.replaceChildren();

  /** @param {string} name @param {string} wert */
  const zeile = (name, wert) => {
    const dt = document.createElement('dt');
    dt.textContent = name;
    const dd = document.createElement('dd');
    dd.textContent = wert;
    felder.append(dt, dd);
  };

  const namen = [
    ['empfaenger-firma', 'Empf. Firma'],
    ['empfaenger-name', 'Empf. Name'],
    ['empfaenger-strasse', 'Empf. Straße'],
    ['empfaenger-ort', 'Empf. Ort'],
    ['absender-name', 'Abs. Name'],
    ['absender-strasse', 'Abs. Straße'],
    ['absender-ort', 'Abs. Ort'],
    ['rucksendeangabe', 'Rücksendezeile']
  ];
  for (const [id, label] of namen) {
    const wert = feldWert(id);
    if (wert) zeile(label, wert);
  }

  const popover = document.querySelector('[popover]:popover-open');
  if (popover) {
    const anzahl = popover.querySelectorAll('li').length;
    zeile('Offene Liste', `${popover.id || '(ohne id)'} · ${formatZahl(anzahl)} Einträge`);
  }
  /* Die Inhalte selbst holt man sich je Feld ueber die sechs Knoepfe oben -
     abtippen war genau der Pain, den das Panel abstellen soll. */
}
