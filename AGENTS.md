---
status: active
type: instructions
tags: [din-briefneo, agents, rules, governance]
summary: "Verbindliche Agenten-Leitplanken, Verfassungs-Invarianten und Kern-Workflows für DIN-BriefNEO."
---

# DIN-BriefNEO – Agenten-Verhaltensvertrag & Invarianten

> 🚨 **PFLICHT VOR JEDER AUFGABE:**
> 1. Vor jeder Aktion zuerst diese Datei (`AGENTS.md`) und [`map.md`](map.md) lesen.
> 2. Über die **Task-to-File-Matrix in `map.md`** punktgenau die Zieldatei ansteuern.
> 3. **Zero Rawhammering:** Kein blindes `grep -r`, kein spekulatives Suchen im Codebaum.

---

## 1. Absolute Sicherheits- & Verfassungs-Invarianten

1. **Höchste Autorität:** [`docs/00-foundation/Immutable-Law-Catalog.md`](docs/00-foundation/Immutable-Law-Catalog.md) steht über allem. Bei Konflikten gilt immer der Law Catalog.
2. **Vanilla Web & Zero-Build:** Ausschließlich reines HTML5, CSS (OKLCH, modern) und native ES-Module. **Kein Webpack, kein Vite, kein Babel, kein TypeScript, kein Runtime-Framework**.
3. **Persistenz & Datenintegrität:** `localStorage` nur für Text-Entwürfe (`din_draft`); `IndexedDB` für Binär-Blobs. Kein Base64 in JS-Modulen (Law A64).
4. **Verfassungsschutz:** `Papierkorb/` ist eine geschützte Invariante und darf nicht gelöscht werden. `website/fonts/` enthält die produktiven `.woff2`-Dateien.
5. **Verworfen bleibt verworfen:** Abgelehnte Features in `docs/90-archive/` oder `docs/30-meta/DECISION-LOG.md` werden niemals ohne expliziten Nutzerauftrag reaktiviert.

---

## 2. Kanonische CLI-Werkzeuge & Workflows

| Aufgabe | Kanonischer Befehl | Funktion |
| :--- | :--- | :--- |
| **Lokale Vorschau** | `./tools/start.sh` (oder `din-dev`) | Startet Webserver auf Port 8088 & Helium (CDP :9222) |
| **Unit- & Korpus-Tests** | `npm test` | Führt Chromium Unit-Tests & Korpus-Gate (76/80) aus |
| **Fitness-Gate & SSoT** | `node tools/build_db.js` | Reality Reconciliation, Fitness-Score muss 100% sein |
| **Wegweiser-Gate** | `node tools/repo-map-check.mjs` | Prüft Pfad-Existenz und Vollständigkeit der JS-Module |

---

## 3. Checkliste vor & nach jeder Code-Änderung

1. Vor der Bearbeitung: `map.md` prüfen und nur die zuständige Datei öffnen.
2. Keine Annahmen bei Layout-Fragen: Visuelle Messungen per `tools/mess.js` oder `tools/print-messung.mjs` verifizieren.
3. Vor jedem Abschluss / Commit: Pflichtlauf von `npm test` und `node tools/build_db.js`.
4. Ausführliche Richtlinien, Historie und Rollen: Siehe [`docs/30-meta/AUFGABEN-WEGWEISER.md`](docs/30-meta/AUFGABEN-WEGWEISER.md) und [`docs/90-archive/AGENTS-LEGACY.md`](docs/90-archive/AGENTS-LEGACY.md).
