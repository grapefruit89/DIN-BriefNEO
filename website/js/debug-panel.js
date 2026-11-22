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
 * Woher die Strassensuche ihre Naehe nimmt — eine Zeile, damit im Kopiertext
 * steht, welcher Punkt gerade wirkt (Absender-PLZ, IP oder Bonn).
 * @returns {string}
 */
function biasText() {
  const absender = /** @type {{ lat?: number, lon?: number } | null} */ (
    loadJSON(STORAGE_KEYS.senderCoords, null)
  );
  if (typeof absender?.lat === 'number' && typeof absender?.lon === 'number') {
    return `Absender-PLZ ${absender.lat.toFixed(2)}/${absender.lon.toFixed(2)} (lokal, 0 Requests)`;
  }
  const ip = /** @type {{ lat?: number, lon?: number, ts?: number, ort?: string } | null} */ (
    loadJSON(STORAGE_KEYS.geoBias, null)
  );
  if (typeof ip?.lat === 'number' && typeof ip?.lon === 'number') {
    const stunden = Math.max(0, Math.round((Temporal.Now.zonedDateTimeISO('Europe/Berlin').epochMilliseconds - Number(ip.ts || 0)) / 3_600_000));
    return `${ip.ort || 'IP'} ${ip.lat.toFixed(2)}/${ip.lon.toFixed(2)} (ip, vor ${stunden} h)`;
  }
  return 'kein Punkt - Suche ohne bias (Geoapify nutzt die Client-IP)';
}

/**
 * Was das Dropdown eines Feldes anbieten wuerde — je Feld mit **Feld-ID**,
 * aktuellem Wert und allen Angeboten, damit eine KI die Ausgabe einer Instanz
 * zuordnen kann (Vorgabe 2026-11-22).
 *
 * @typedef {{ id: string, aktuell: string, werte: string[] }} DropdownInhalt
 * @param {string} art
 * @returns {Promise<DropdownInhalt | null>}
 */
async function dropdownInhalt(art) {
  /** @param {string} id @returns {string} */
  const wert = (id) => {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value.trim();
    return (el?.textContent || '').trim();
  };

  if (art === 'anrede') {
    const varianten = salutationVarianten(
      wert('empfaenger-name'),
      wert('empfaenger-firma'),
      aktuelleStunde()
    );
    return {
      id: 'anrede',
      aktuell: wert('anrede'),
      werte: varianten.map((v) => `${v.anrede}   [${v.ton}]`)
    };
  }

  if (art === 'gruss') {
    const stil = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
    const ton = stil && stil.value in SALUTATION_TONES ? stil.value : 'formal';
    return {
      id: 'grussformel',
      aktuell: wert('grussformel'),
      werte: [...SALUTATION_TONES[/** @type {keyof typeof SALUTATION_TONES} */ (ton)].closings]
    };
  }

  if (art === 'ort-empf' || art === 'ort-abs') {
    const id = art === 'ort-empf' ? 'empfaenger-ort' : 'absender-ort';
    const eingabe = wert(id);
    if (eingabe.length < 3) return { id, aktuell: eingabe, werte: [] };
    if (/^\d{5}$/.test(eingabe)) {
      const treffer = AddressIntelligence.lookupPlz(eingabe);
      return { id, aktuell: eingabe, werte: treffer ? [`${treffer.plz} ${treffer.city}`] : [] };
    }
    const res = AddressIntelligence.resolveCityInput(eingabe, 24);
    const nurOrte = (res.items || []).filter((i) => (i.typ || 'Stadt') === 'Stadt');
    return {
      id,
      aktuell: eingabe,
      /* Wie im Dropdown: nur der ERSTE Stadtteil (die Spalte enthaelt bei
         manchen PLZ mehrere). */
      werte: nurOrte.slice(0, 40).map((i) => {
        const erster = String(i.district || '').split(',')[0].trim();
        return `${i.plz ? `${i.plz} ` : ''}${i.city || i.name || ''}${erster ? ` · ${erster}` : ''}`;
      })
    };
  }

  /* Strasse: derselbe Pfad-Bauer wie die echte Suche, aber ohne Cache. */
  const id = art === 'strasse-empf' ? 'empfaenger-strasse' : 'absender-strasse';
  const eingabe = wert(id);
  if (eingabe.length < 3) return { id, aktuell: eingabe, werte: [] };
  const key = load(STORAGE_KEYS.geoapifyKey, '');
  if (!key) return { id, aktuell: eingabe, werte: [] };
  try {
    const antwort = await fetch(`https://api.geoapify.com${strassenSuchPfad(eingabe, key)}`);
    const daten = await antwort.json();
    const treffer = (daten?.results || []).filter((/** @type {any} */ r) => r.street);
    return {
      id,
      aktuell: eingabe,
      werte: treffer.map(
        (/** @type {any} */ r) =>
          `${[r.street, r.housenumber].filter(Boolean).join(' ')} · ${[r.postcode, r.city].filter(Boolean).join(' ')}`
      )
    };
  } catch {
    return { id, aktuell: eingabe, werte: [] };
  }
}

/**
 * Maschinenlesbarer Block: Feld-ID, aktueller Wert, Angebote. Der aktuelle
 * Wert wird in der Liste markiert, damit sichtbar ist, was zusammenpasst.
 * @param {DropdownInhalt} inhalt
 * @returns {string[]}
 */
function blockText(inhalt) {
  const zeilen = [
    `feld id: ${inhalt.id}`,
    `aktueller wert: ${inhalt.aktuell || '(leer)'}`,
    `mögliche werte (${inhalt.werte.length}):`
  ];
  if (inhalt.werte.length === 0) {
    zeilen.push('  (keine — Eingabe zu kurz, kein Key oder keine Treffer)');
    return zeilen;
  }
  const aktuell = inhalt.aktuell.toLowerCase();
  for (const eintrag of inhalt.werte) {
    const marke = aktuell && eintrag.toLowerCase().startsWith(aktuell) ? '   <- aktuell' : '';
    zeilen.push(`  - ${eintrag}${marke}`);
  }
  return zeilen;
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
      /** @type {string[]} */
      let zeilen;
      if (art === 'alles' || art === 'anrede-gruss') {
        const arten =
          art === 'alles'
            ? ['anrede', 'gruss', 'ort-empf', 'ort-abs', 'strasse-empf', 'strasse-abs']
            : ['anrede', 'gruss'];
        const bloecke = await Promise.all(arten.map((a) => dropdownInhalt(a)));
        const stil = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
        const titel = art === 'alles' ? 'Debug: alle Dropdown-Felder' : 'Anrede & Grußformel';
        zeilen = [
          titel,
          '-'.repeat(titel.length),
          `Tonalität: ${stil?.value || '?'}`,
          `Bias: ${biasText()}`,
          ''
        ];
        for (const block of bloecke) {
          if (!block) continue;
          zeilen.push(...blockText(block), '');
        }
      } else {
        const block = await dropdownInhalt(art);
        zeilen = block ? blockText(block) : [`feld id: ${art}`, '(nicht verfügbar)'];
      }
      await navigator.clipboard.writeText(zeilen.join('\n').trimEnd());
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

  /* Anrede & Gruß: was jetzt drinsteht und was sonst noch angeboten wird —
     so sieht man direkt, welche Formen zusammengehoeren. */
  const anredeFeld = feldWert('anrede');
  const grussFeld = feldWert('grussformel');
  setze('dbg-anrede-jetzt', anredeFeld || '(leer)');
  setze('dbg-gruss-jetzt', grussFeld || '(leer)');
  const varianten = salutationVarianten(feldWert('empfaenger-name'), feldWert('empfaenger-firma'), stunde);
  setze('dbg-anrede-angebote', varianten.map((v) => v.anrede).join(' '));
  const stil = /** @type {HTMLSelectElement | null} */ (document.getElementById('stil-select'));
  const ton = stil && stil.value in SALUTATION_TONES ? stil.value : 'formal';
  setze('dbg-tonalitaet', ton);
  setze('dbg-gruss-angebote', `${SALUTATION_TONES[/** @type {keyof typeof SALUTATION_TONES} */ (ton)].closings.join(' · ')}`);

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
