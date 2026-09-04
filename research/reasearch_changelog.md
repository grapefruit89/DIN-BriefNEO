# Modern Web Platform Migration — Research Changelog

> **Projekt:** DIN-Brief Neo  
> **Referenz:** `research/README.md` & `docs/30-meta/ROADMAP.md`  
> **Ziel:** Schrittweise Umsetzung der 7 Modernisierungs-Prioritäten zur Eliminierung von Alt-JavaScript, Integration von 100% Offline-Adresstechnologie und voller Nutzung von Web-Standards 2025/2026.

---

## 🧭 Gesamtfortschritt & Status-Übersicht

| Priorität | Paket | Aufwand | Nutzen | Status | Abgeschlossen am |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Prio 1** | **Salutation Engine V2 Produktivschaltung** | Sehr Gering (~30 min) | **Extrem Hoch** | 🟢 Abgeschlossen | 2026-09-04 |
| **Prio 2** | **72 KB Offline-Brotli PLZ & Großempfänger** | Mittel (~2 h) | **Maximal (Gamechanger)** | ⚪ Geplant | - |
| **Prio 3** | **Smart Clipboard Impressum-Parser** | Gering–Mittel (~1 h) | **Sehr Hoch** | ⚪ Geplant | - |
| **Prio 4** | **JS-Kill Phase 1: Text-Fit & CSS-Modernisierung** | Gering (~45 min) | **Hoch** | ⚪ Geplant | - |
| **Prio 5** | **JS-Kill Phase 2: HTML-Switch, Popover & Top-Layer** | Mittel (~1,5 h) | **Hoch** | ⚪ Geplant | - |
| **Prio 6** | **Quartalsweise Open-Data Pipeline** | Gering (~30 min) | **Mittel** | ⚪ Geplant | - |
| **Prio 7** | **Optionales On-Device KI-Addon (Gemini Nano)** | Mittel (~1,5 h) | **Optional** | ⚪ Geplant | - |

---

## 📝 Detailliertes Ausführungsprotokoll

### 🟢 Priorität 1: Salutation Engine V2 Produktivschaltung
* **Ziel:** Ablösung der Alt-Logik in `41-salutation-engine.js` durch die neue 80/20 B2B Smart-Engine (`41-salutation-engine.smart.js`).
* **Durchgeführte Maßnahmen:**
  1. Archivierung des Alt-Moduls `website/js/41-salutation-engine.js` nach `tools/archive/41-salutation-engine.legacy.js`.
  2. Produktivschaltung der Smart-Engine als aktive `website/js/41-salutation-engine.js`.
  3. Vollständige Aktivierung der 3 harmonisierten B2B-Pärchen (Förmlich, Höflich, Locker).
  4. Integration des Vornamen-Dictionarys (951 häufigste deutsche Vornamen) zur Zero-Click-Geschlechtserkennung ohne Radiobuttons.
  5. In-flight-Tippschutz (Tippen von „herr “ / „frau “ erzeugt keine korrupten Ausgaben wie „Hallo herr,“).
  6. ContentEditable-Schutz via `data-dirty="true"` mit Auto-Reset bei Feldleerung.
  7. Erhalt von Adelspartikeln (`von`, `zu`, `van`, `de`, `von und zu`) auf dem Nachnamen.
  8. Validierung via Fitness-Gate (`tools/reconciliation.js`).
* **Ergebnis:** Vollständig integriert, abwärtskompatibel und getestet.
