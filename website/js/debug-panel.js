// @ts-check
// @adr [[ADR-JS]] {Debug}
// @guide [[din-5008-css-architektur]]

/**
 * @file debug-panel.js — kleines Selbstauskunfts-Panel für die Entwicklungsarbeit.
 *
 * Warum so klein: Ein früheres Panel (1029 Zeilen JS, 490 CSS, 397 Testzeilen)
 * wurde am 2026-11-07 gelöscht, weil es niemand nutzte (Commit ab9a78f). Dieses
 * hier beantwortet nur die Fragen, die beim Debuggen wirklich aufgekommen sind:
 * Wie groß ist der Datenbestand? Was liegt im Speicher? Welche Werte stehen in
 * den Adressfeldern — und was bietet die gerade offene Vorschlagsliste an?
 *
 * Bewusst NICHT: eigene Mess-Sonden, Zähler im Produktivpfad, Diagramme.
 * Alles wird aus vorhandenen APIs gelesen (AddressIntelligence, geo-cache,
 * localStorage, DOM).
 *
 * Aufruf: `?debug` an die URL hängen. Laden per dynamischem import() aus
 * main.js — kein Pfad für normale Nutzer.
 */

import { AddressIntelligence } from './address-data.js';
import { geoCacheGroesse } from './geo-cache.js';
import { loadJSON, STORAGE_KEYS } from './persistence.js';

/** @param {number} bytes @returns {string} */
const alsKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

/** @returns {number} Groesse des localStorage in Bytes (UTF-16) */
function speicherBytes() {
  let summe = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const schluessel = localStorage.key(i) || '';
    summe += (schluessel.length + (localStorage.getItem(schluessel) || '').length) * 2;
  }
  return summe;
}

/**
 * Wert eines Feldes (input/textarea oder beliebiges Element).
 * @param {string} id @returns {string}
 */
function feldWert(id) {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value.trim();
  return (el?.textContent || '').trim();
}

/** @returns {Array<[string, string]>} belegte Adressfelder */
function adressfelder() {
  /** @type {Array<[string, string]>} */
  const liste = [];
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
    if (wert) liste.push([label, wert]);
  }
  return liste;
}

/**
 * Inhalt der gerade offenen Vorschlagsliste.
 * @returns {{ feld: string, eintraege: string[] } | null}
 */
function offeneVorschlaege() {
  const popover = document.querySelector('[popover]:popover-open');
  if (!popover) return null;
  const eintraege = [...popover.querySelectorAll('li')]
    .map((li) => (li.textContent || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return { feld: popover.id || '(ohne id)', eintraege };
}

export function mountDebugPanel() {
  if (document.getElementById('debug-panel')) return;

  const panel = document.createElement('aside');
  panel.id = 'debug-panel';
  panel.className = 'debug-panel nicht-drucken';
  panel.setAttribute('aria-label', 'Entwickler-Informationen');

  const kopf = document.createElement('div');
  kopf.className = 'debug-kopf';
  const titel = document.createElement('strong');
  titel.textContent = 'Debug · DIN-BriefNEO';

  /** @type {ReturnType<typeof setInterval> | null} */
  let timer = null;
  const beenden = () => {
    if (timer) clearInterval(timer);
    timer = null;
    panel.remove();
  };

  const knopfAktualisieren = document.createElement('button');
  knopfAktualisieren.type = 'button';
  knopfAktualisieren.textContent = '↻';
  knopfAktualisieren.title = 'Aktualisieren';
  const knopfSchliessen = document.createElement('button');
  knopfSchliessen.type = 'button';
  knopfSchliessen.textContent = '×';
  knopfSchliessen.title = 'Schließen';
  knopfSchliessen.addEventListener('click', beenden);
  kopf.append(titel, knopfAktualisieren, knopfSchliessen);

  const tabelle = document.createElement('dl');
  tabelle.className = 'debug-tabelle';
  panel.append(kopf, tabelle);
  document.body.append(panel);

  /** @param {string} name @param {string | number} wert */
  const zeile = (name, wert) => {
    const dt = document.createElement('dt');
    dt.textContent = name;
    const dd = document.createElement('dd');
    dd.textContent = String(wert);
    tabelle.append(dt, dd);
  };

  const aktualisieren = () => {
    tabelle.replaceChildren();
    const ai = AddressIntelligence;
    const cache = geoCacheGroesse();

    if (!ai.isReady) {
      zeile('Daten', 'noch nicht geladen');
    } else {
      zeile('PLZ im Bestand', ai.plzToCity.size);
      zeile('Ortsnamen', ai.ortList.length);
      zeile('Ortsteile (PLZ)', ai.districts.size);
      zeile('PLZ mit Bundesland', ai.states.size);
    }
    zeile('Adressbuch', /** @type {unknown[]} */ (loadJSON(STORAGE_KEYS.addresses, [])).length);
    zeile('Geo-Cache', `${cache.eintraege} · ${alsKb(cache.bytes)} · ${cache.gewaehlt} gewählt`);
    zeile('localStorage', alsKb(speicherBytes()));
    zeile('Entwurf', alsKb((localStorage.getItem(STORAGE_KEYS.draft) || '').length * 2));
    zeile('Gedruckt', localStorage.getItem('din_print_count') || '0');

    const root = document.documentElement;
    zeile('Layout', root.dataset.layout === 'form-a' ? 'Form A' : 'Form B');
    zeile('Unterrand', getComputedStyle(root).getPropertyValue('--rand-u').trim() || '—');
    zeile('Schrift', getComputedStyle(root).getPropertyValue('--active-font-family').trim().slice(0, 26) || '—');

    for (const [name, wert] of adressfelder()) zeile(name, wert);

    const offen = offeneVorschlaege();
    zeile('Offene Liste', offen ? `${offen.feld} · ${offen.eintraege.length}` : '—');
    if (offen) {
      for (const [i, eintrag] of offen.eintraege.slice(0, 8).entries()) {
        zeile(`  ${i + 1}`, eintrag);
      }
    }
  };

  knopfAktualisieren.addEventListener('click', aktualisieren);
  aktualisieren();
  /* Der offene Popover aendert sich beim Tippen; 1,5 s reichen fuer einen
     Blick auf die Vorschlaege, ohne im Ruhezustand zu stoeren. */
  timer = setInterval(aktualisieren, 1500);
}
