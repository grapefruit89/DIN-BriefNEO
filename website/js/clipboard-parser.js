// @ts-check
// @adr [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]] {ClipboardAddressParser}
// @adr [[ADR-JS]]
// @guide [[din-5008-css-architektur]]

/**
 * @file clipboard-parser.js — Re-Export für Rückwärtskompatibilität.
 * Das Hauptmodul lebt jetzt als On-Demand-Addon unter `website/addons/clipboard-parser/`.
 */

export * from '../addons/clipboard-parser/clipboard-parser.js';
