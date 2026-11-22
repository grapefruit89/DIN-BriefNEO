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

import { AddressIntelligence } from './address-data.js';
import { aktuelleStunde, formatZahl } from './format.js';
import { geoCacheGroesse } from './geo-cache.js';
import { loadJSON, STORAGE_KEYS } from './persistence.js';

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

/** Einmalige Initialisierung: Werte schreiben und sichtbarkeitsabhängig takten. */
export function initDebugPanel() {
  if (timer) return;
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
    const eintraege = [...popover.querySelectorAll('li')]
      .map((li) => (li.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    zeile('Offene Liste', `${popover.id || '(ohne id)'} · ${formatZahl(eintraege.length)}`);
    for (const [i, eintrag] of eintraege.slice(0, 6).entries()) zeile(`  ${i + 1}`, eintrag);
  }
}
