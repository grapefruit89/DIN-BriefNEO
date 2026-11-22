// @ts-check
// @adr [[ADR-JS]]
/**
 * @file api.js — `window.dinApi`: die Brief-Schnittstelle für Agenten und Skripte.
 *
 * Warum: Ein Agent soll den Brief **schreiben** können, ohne das DOM zu
 * interpretieren. Alles hier ist ein dünner Aufsatz auf vorhandener Logik —
 * `applyValue` (Rendering + Persistenz), `ortsVorschlaege`, `formatDatum`,
 * `salutationVarianten`, `buildDINLetterJSON`. Keine zweite Wahrheit, keine
 * Fremdbibliothek, keine Netzverbindung.
 *
 * Bewusst NICHT enthalten: Drucken, Datei-Dialoge (Unterschrift/Schrift),
 * Dialoge. Diese brauchen eine Nutzergeste und bleiben dem Menschen vorbehalten.
 *
 * Antwortformat: immer ein Objekt mit `ok: true/false` — nie werfen, damit ein
 * Agent aus dem Ergebnis lernen kann statt aus einem Stacktrace.
 */

import { Events, eventBus } from './core.js';
import { collectDraft, draftFieldIds } from './document.js';
import { formatDatum } from './format.js';
import { buildDINLetterJSON } from './persistence.js';
import { SALUTATION_TONES, SalutationEngine, salutationVarianten } from './salutation.js';
import { applyValue } from './state-binding.js';

/** Felder, die die API beschreiben darf (Reihenfolge = Briefablauf). */
export const API_FELDER = [
  'empfaenger-firma',
  'empfaenger-name',
  'empfaenger-strasse',
  'empfaenger-ort',
  'absender-name',
  'absender-strasse',
  'absender-ort',
  'absender-tel',
  'absender-mail',
  'datum',
  'betreff',
  'anrede',
  'text',
  'grussformel',
  'unterschrift',
  'anlagen-angabe',
  'fuss-firma',
  'fuss-sitz',
  'fuss-gericht',
  'fuss-hrb',
  'fuss-vorstand',
  'fuss-gf',
  'fuss-stnr',
  'fuss-ustid',
  'fuss-bank',
  'fuss-iban',
  'fuss-bic',
  'fuss-anschrift'
];

/** Schalter, die die API umlegen darf. */
export const API_SCHALTER = ['toggle-anlagen', 'toggle-fuss', 'toggle-falzmarken'];

/**
 * @typedef {{ ok: true } & Record<string, unknown>} ApiOk
 * @typedef {{ ok: false, fehler: string }} ApiFehler
 */

/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function element(id) {
  return document.getElementById(id);
}

/**
 * Schreibt ein Feld und meldet die Aenderung.
 *
 * `applyValue` ist der **Programm**-Schreiber: es schreibt DOM + Zustand,
 * feuert aber bewusst kein `input` (sonst Endlosschleifen). Genau dieses
 * Signal brauchen die Kopplungen — die Ruecksendezeile (`initSenderSync`)
 * haengt an `DOCUMENT_CHANGED`, nicht am DOM-Event.
 * @param {string} id
 * @param {string} wert
 */
function schreibe(id, wert) {
  applyValue(id, wert, 'logic');
  eventBus.publish(Events.DOCUMENT_CHANGED, { origin: 'logic', feld: id });
}

/**
 * Wert eines Feldes (Input/Textarea oder contenteditable).
 * @param {string} id
 * @returns {string | boolean | null}
 */
export function feldWert(id) {
  const el = element(id);
  if (!el) return null;
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox') return el.checked;
    return el.value;
  }
  if (el instanceof HTMLTextAreaElement) return el.value;
  return (el.textContent || '').trim();
}

/**
 * Baut `window.dinApi`. Ohne die Felder im DOM passiert nichts (Test/CLI).
 * @returns {void}
 */
export function initApi() {
  if (!element('betreff')) return;

  const api = {
    version: '1.0',

    /**
     * Was die API kann — maschinenlesbar, damit ein Agent nicht raten muss.
     * @returns {ApiOk}
     */
    hilfe() {
      return {
        ok: true,
        version: api.version,
        felder: API_FELDER,
        schalter: API_SCHALTER,
        funktionen: {
          lesen: 'lesen() → alle Feldwerte',
          setzen: 'setzen(id, wert) → ein Feld schreiben (String oder boolean bei Schaltern)',
          anrede: 'anrede(name, firma?, tonalitaet?) → Anrede + Grußformel, tonalitaet: formal|polite|casual',
          adresse: 'adresse("empfaenger"|"absender", {firma?, name?, strasse?, ort?})',
          datum: 'datum("2026-11-22" | "22.11.2026" | "22. November 2026") → schreibt die Langform',
          exportieren: 'exportieren() → DIN-Letter-JSON-Objekt'
        },
        hinweis: 'Drucken, Datei-Uploads und Dialoge sind bewusst nicht Teil der API.'
      };
    },

    /**
     * Alle Feldwerte lesen.
     * @returns {ApiOk}
     */
    lesen() {
      /** @type {Record<string, string | boolean | null>} */
      const werte = {};
      for (const id of API_FELDER) {
        const wert = feldWert(id);
        if (wert !== null) werte[id] = wert;
      }
      for (const id of API_SCHALTER) {
        const el = element(id);
        if (el instanceof HTMLInputElement) werte[id] = el.checked;
      }
      const ids = draftFieldIds(document);
      return { ok: true, felder: werte, anzahlFelder: ids.length };
    },

    /**
     * Ein Feld schreiben.
     * @param {string} id
     * @param {string | boolean} wert
     * @returns {ApiOk | ApiFehler}
     */
    setzen(id, wert) {
      if (typeof id !== 'string' || !id) return { ok: false, fehler: 'id fehlt' };
      if (API_SCHALTER.includes(id)) {
        const el = element(id);
        if (!(el instanceof HTMLInputElement)) return { ok: false, fehler: `Schalter ${id} nicht vorhanden` };
        el.checked = Boolean(wert);
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return { ok: true, id, wert: el.checked };
      }
      if (!API_FELDER.includes(id)) {
        return { ok: false, fehler: `unbekanntes Feld "${id}" — hilfe() zeigt die Liste` };
      }
      const el = element(id);
      if (!el) return { ok: false, fehler: `Feld "${id}" nicht im Dokument` };
      schreibe(id, String(wert ?? ''));
      return { ok: true, id, wert: String(wert ?? '') };
    },

    /**
     * Anrede und Grußformel setzen. Ohne Tonalität wird die aus dem Namen
     * abgeleitete Variante genommen (erste), sonst die passende Stufe.
     * @param {string} name
     * @param {string} [firma]
     * @param {'formal' | 'polite' | 'casual'} [tonalitaet]
     * @returns {ApiOk | ApiFehler}
     */
    anrede(name, firma = '', tonalitaet = 'formal') {
      if (!String(name || '').trim()) return { ok: false, fehler: 'name fehlt' };
      const varianten = salutationVarianten(name, firma, null);
      const ton = tonalitaet in SALUTATION_TONES ? tonalitaet : 'formal';
      const treffer = varianten.find((v) => v.style === ton) ?? varianten[0];
      if (!treffer) return { ok: false, fehler: 'keine Anrede-Variante gefunden' };
      schreibe('anrede', treffer.anrede);
      schreibe('grussformel', SalutationEngine.getClosing(treffer.style));
      return {
        ok: true,
        anrede: treffer.anrede,
        grussformel: SalutationEngine.getClosing(treffer.style),
        tonalitaet: treffer.style,
        weitereVarianten: varianten.map((v) => v.anrede)
      };
    },

    /**
     * Adressblock setzen. Leere Angaben werden übersprungen (nichts wird
     * gelöscht, was der Nutzer schon eingetragen hat).
     * @param {'empfaenger' | 'absender'} rolle
     * @param {{ firma?: string, name?: string, strasse?: string, ort?: string }} daten
     * @returns {ApiOk | ApiFehler}
     */
    adresse(rolle, daten = {}) {
      if (rolle !== 'empfaenger' && rolle !== 'absender') {
        return { ok: false, fehler: 'rolle muss "empfaenger" oder "absender" sein' };
      }
      /** @type {Record<string, string>} */
      const gesetzt = {};
      const paare = [
        ['firma', `${rolle}-firma`],
        ['name', `${rolle}-name`],
        ['strasse', `${rolle}-strasse`],
        ['ort', `${rolle}-ort`]
      ];
      for (const [schluessel, feldId] of paare) {
        const wert = String(daten[/** @type {keyof typeof daten} */ (schluessel)] ?? '').trim();
        if (!wert) continue;
        if (!element(feldId)) continue;
        schreibe(feldId, wert);
        gesetzt[feldId] = wert;
      }
      if (Object.keys(gesetzt).length === 0) {
        return { ok: false, fehler: 'keine verwertbaren Angaben (firma, name, strasse, ort)' };
      }
      return { ok: true, rolle, gesetzt };
    },

    /**
     * Datum in deutscher Langform schreiben.
     * @param {string} eingabe ISO, TT.MM.JJJJ oder Langform
     * @returns {ApiOk | ApiFehler}
     */
    datum(eingabe) {
      const formatiert = formatDatum(String(eingabe || ''), { format: 'alpha' });
      if (!formatiert || formatiert === String(eingabe || '')) {
        return { ok: false, fehler: `Datum "${eingabe}" nicht erkannt (ISO, TT.MM.JJJJ oder Langform)` };
      }
      schreibe('datum', formatiert);
      return { ok: true, datum: formatiert };
    },

    /**
     * Brief als JSON (dieselbe Struktur wie „Speichern (.json)").
     * @returns {ApiOk}
     */
    exportieren() {
      return { ok: true, brief: buildDINLetterJSON(collectDraft) };
    }
  };

  /** @type {any} */ (window).dinApi = api;
}
