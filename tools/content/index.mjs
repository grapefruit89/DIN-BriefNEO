// tools/content/index.mjs — öffentliche Schnittstelle des Inhalts-Moduls (Etappe 6).
//
// Die sechs Werkzeuge erzeugen oder prüfen Inhalte außerhalb von `website/`:
// PLZ-/Großkundendaten, Backlog-Tabelle, Test-Dossier, Chrome-Feature-Recherche
// und den ADR-Drift-Check. Jedes Modul exportiert GENAU seine Arbeitsfunktion;
// die bisherigen Pfade in `tools/` bleiben als Shims bestehen.
//
//   import { buildPlzData, syncBacklog } from './content/index.mjs';
//   await buildPlzData(['--download']);   // Flags wie auf der Kommandozeile
//   syncBacklog(['--check']);             // 0 ok, 1 Drift
//
// Kein process.exit() in den exportierten Funktionen: sie liefern ihren
// Exit-Code zurück (Ausnahme: die PLZ-Pipeline wirft bei Normverletzungen).

export { buildPlzData } from './build_plz_data.mjs';
export { buildGrosskunden } from './build_grosskunden_columnar.mjs';
export { syncBacklog } from './backlog-sync.mjs';
export { generateDossier } from './test-dossier.mjs';
export { queryFeature } from './query_chrome_feature.mjs';

// adr-check.js ist CommonJS (bewusst: `require`-Vertrag bleibt für Aufrufer).
import adrCheck from './adr-check.js';
export const checkAdr = adrCheck.checkAdr;
