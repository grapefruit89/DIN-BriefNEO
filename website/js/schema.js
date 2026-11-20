// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {SchemaV5}

/**
 * @file schema.js — Kanonische Feld-Reihenfolge des Briefdokuments (Schema v5).
 * Eigene Datei, weil sowohl der Export (persistence.js) als auch der
 * Sitzungszustand (state.js) dieselbe Liste brauchen — ein Import von
 * persistence.js aus dem Zustand heraus würde einen Modul-Zyklus erzeugen.
 * Reine Daten, kein Laufzeitcode.
 */

/**
 * Kanonische Schema-Definition für Briefdokumente (Schema v5, Tuple-Format).
 * Definiert die exakte Index-Reihenfolge aller Dokumentenfelder im serialisierten Array.
 */
export const DOCUMENT_SCHEMA_V5 = [
  'rucksendeangabe', 'vermerke',
  'empfaenger-firma', 'empfaenger-name', 'empfaenger-strasse', 'empfaenger-ort',
  'absender-name', 'absender-strasse', 'absender-ort', 'absender-tel', 'absender-mail',
  'datum', 'spacer', 'betreff', 'anrede', 'text', 'grussformel', 'unterschrift',
  'anlagen-angabe',
  'fuss-firma', 'fuss-sitz', 'fuss-gericht', 'fuss-hrb', 'fuss-vorstand', 'fuss-gf',
  'fuss-stnr', 'fuss-ustid', 'fuss-bank', 'fuss-iban', 'fuss-bic', 'fuss-anschrift',
  'toggle-anlagen', 'toggle-fuss'
];
