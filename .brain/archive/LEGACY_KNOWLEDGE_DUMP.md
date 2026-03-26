# 🧠 LEGACY_KNOWLEDGE_DUMP.md - Erhaltenes Wissen aus alten GEMINI.md Files
# Status: ARCHIVED | Stand: März 2026

Dieses Dokument sichert spezifische Architektur-Details und Workflows, die aus den veralteten GEMINI.md Dateien (V9 Platinum) extrahiert wurden, um den "Knowledge Shredder Protocol" zu erfüllen und Wissensverlust zu vermeiden.

## 🏗️ Architektur-Details (Legacy V9)
- **5-Layer Class System:** 
    - `StateManager` (Data)
    - `FormatterService` (Logic)
    - `DOMController` (UI Bridge)
    - `ExportModule` (IO)
    - `BriefApp` (Orchestrator)
- **Data Schema:** "No Ghost Data" Policy - Versteckte Felder in `storage.js` / `StateManager` müssen bei Save/Load Operationen erhalten bleiben, auch wenn sie nicht in der UI sichtbar sind.
- **Visual Freeze:** Die CSS-Geometrie in `css/din5008-paper.css` ist für Kern-Maße unantastbar (Zero Pixel Shift).
- **Desktop First:** Mobile Layouts sind gemäß ADR-019 explizit deaktiviert.

## 🛠️ Tooling & Workflows
- **Bundling:** `node tools/bundler.js` erzeugt `dist/index_bundled.html`.
- **Expert Mode:** 5-maliges Klicken auf den Versions-Tag (`V tag`) aktiviert Live-Logs und Status-Inspektion.
- **Validation:** Logik-Constraints befinden sich in `.brain/validation_rules.md`.

## 📜 Historische Konventionen
- **Rule #1:** Niemals Code direkt ändern. Erst das Verzeichnis `.brain/` (Logic, Specs, Roadmap) aktualisieren.
- **Traceability:** Nutzung von Traceability IDs (z.B. `[DIN-...]`) bei jeder Code-Änderung.
- **Vanilla Only:** Striktes Verbot von Frameworks (React, Vue, etc.), jQuery, Lodash oder jspdf.

---
*Extrahiert am 26. März 2026 zur Integration in die Platinum v14 (DIN-BriefNEO) SSoT.*
