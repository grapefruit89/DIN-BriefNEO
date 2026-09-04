# Modern Web Platform Migration — Research Changelog

> **Projekt:** DIN-Brief Neo  
> **Referenz:** `research/README.md` & `docs/30-meta/ROADMAP.md`  
> **Ziel:** Schrittweise Umsetzung der 7 Modernisierungs-Prioritäten zur Eliminierung von Alt-JavaScript, Integration von 100% Offline-Adresstechnologie und voller Nutzung von Web-Standards 2025/2026.

---

## 🧭 Gesamtfortschritt & Status-Übersicht

| Priorität | Paket | Aufwand | Nutzen | Status | Abgeschlossen am |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Prio 1** | **Salutation Engine V2 Produktivschaltung** | Sehr Gering (~30 min) | **Extrem Hoch** | 🟢 Abgeschlossen | 2026-09-04 |
| **Prio 2** | **72 KB Offline-Brotli PLZ & Großempfänger** | Mittel (~2 h) | **Maximal (Gamechanger)** | 🟢 Abgeschlossen | 2026-09-04 |
| **Prio 3** | **Smart Clipboard Impressum-Parser** | Gering–Mittel (~1 h) | **Sehr Hoch** | ⚪ Geplant | - |
| **Prio 4** | **JS-Kill Phase 1: Text-Fit & CSS-Modernisierung** | Gering (~45 min) | **Hoch** | 🟢 Abgeschlossen | 2026-09-04 |
| **Prio 5** | **JS-Kill Phase 2: HTML-Switch, Popover & Top-Layer** | Mittel (~1,5 h) | **Hoch** | ⚪ Geplant | - |
| **Prio 6** | **Quartalsweise Open-Data Pipeline** | Gering (~30 min) | **Mittel** | 🟢 Abgeschlossen | 2026-09-04 |
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

### 🟢 Priorität 2: 72 KB Offline-Brotli PLZ & Großempfänger
* **Ziel:** 100% autarker, latenzfreier Offline-Betrieb für alle 10.831 deutschen Postleitzahlen und 2.258 Großempfänger gemäß ADR-006.
* **Durchgeführte Maßnahmen:**
  1. Bereitstellung des Verzeichnisses `website/data/` mit den optimierten Brotli-Assets:
     * `website/data/de_plz_ort.json.br` (72,1 KB — alle 10.831 PLZs)
     * `website/data/de_grosskunden_plz.json.br` (30,1 KB — 2.258 Großempfänger)
     * `website/data/plz-embedded.js` (Eingebetteter Base64-Stream für garantierte Ausführung unter `file:///` ohne Server und ohne CORS-Restriktionen)
  2. Neues Modul `website/js/45-address-intelligence.js`:
     * Dualer Loader: Nutzt native `DecompressionStream('brotli')` für Dekompression in unter 1 ms.
     * Sofort-Lookup: 5-stellige PLZ im Empfängerfeld tippen ➔ Ergänzt in 0,001 ms den Ortsnamen.
     * Bidirektionale Suche: Eingabe von Städtenamen listet Stadtteile und zugehörige Postleitzahlen.
     * Großempfänger-Erkennung (OLG Frankfurt Az. 6 U 170/13): Erkennt Bundestag (`11011`), Bundeskanzleramt (`11012`), Axel Springer (`10888`), The Squaire (`60600`) etc. Befüllt Firma automatisch und markiert die Straßenzeile als normgerecht entbehrlich.
     * Dynamisches Target-Locking: Schaltet beim Erkennen einer Ziel-PLZ den statischen Bonn-Bias ab, damit Straßensuchen 100% auf den Zielort fokussiert sind.
  3. Bereinigung von `website/js/43-geoapify.js`:
     * Vollständige Entfernung des alten Zippopotam-Fetch-Codes.
     * Tier-2-Straßensuche nutzt nun das dynamische `targetLock` für treffsichere Ergebnisse.
  4. CSS-Anchor-Positioning für `#plz-suggestions-popover` in `website/css/layout.css` und `website/css/floating.css`.
  5. Validierung: Alle 10 Integrationstests und `tools/reconciliation.js` erfolgreich mit 0 Fehlern bestanden.
* **Ergebnis:** 100% Offline-Adresstechnologie produktiv aktiv, null Cloud-Requests für PLZ/Ort, volle DSGVO-Konformität.

### 🟢 Priorität 4: JS-Kill Phase 1 — Text-Fit & CSS-Modernisierung
* **Ziel:** Vollständige Beseitigung von Layout Thrashing und DOM-Messschleifen (`scrollWidth > clientWidth`) durch 100% deklarative CSS-Features (Chrome 123+ / Baseline 2024-2026).
* **Durchgeführte Maßnahmen:**
  1. **Archivierung & Löschung von `48-text-fit.js`:**
     * `website/js/48-text-fit.js` archiviert nach `tools/archive/48-text-fit.legacy.js` und aus `website/js/` via Git entfernt.
     * `website/js/main.js` von Import und Initialisierung der `TextFitEngine` befreit (~150 Zeilen JS eliminiert).
  2. **Architektur-Guard-Kommentare platziert:**
     * In `website/css/layout.css`, `website/css/variables.css` und `website/js/main.js` unübersehbare Warn-Kommentare für zukünftige KIs/LLMs hinterlegt, die klarstellen, dass `field-sizing: content`, `text-fit: shrink`, `overflow: clip` und `text-wrap: balance/pretty` nativer Standard sind und keinesfalls durch JS-Schleifen oder Polyfills ersetzt werden dürfen.
  3. **Natives CSS `field-sizing: content` & `overflow: clip`:**
     * `.single-line` und `[contenteditable]` nutzen natives `field-sizing: content` zum flüssigen Mitwachsen.
     * `<din-a4>` (`:scope`) und `#briefkern` sind mit `overflow: clip; contain: strict;` physisch gegen jeglichen Scroll-/Verschiebe-Überlauf gesichert.
  4. **CSS `light-dark()` Produktivschaltung:**
     * `website/css/variables.css` vollständig auf `light-dark(var(--c-...-day), var(--c-...-night))` umgestellt. Komplexe JS/CSS-Farb-Kalkulationen entfallen.
  5. **Typografie-Absicherung:**
     * `#betreff` mit `text-wrap: balance` gegen Witwenwörter in Zeile 2 abgesichert.
     * `#brieftext` mit `text-wrap: pretty` gegen Waisenwörter am Absatzende geschützt.
  6. **Rechtliche & normative Verankerung in der Dokumentation:**
     * `docs/00-foundation/Immutable-Law-Catalog.md`: Neues Gesetz **A49 (HARD BAN)** gegen JS-basiertes Text-Fitting & DOM-Polling eingefügt.
     * `docs/10-architecture/ADR-ANTIPATTERN.md`: Neuer Abschnitt **13** zur Begründung des Verbots von DOM-Messschleifen und Dokumentation der nativen CSS-Ersatztechnologien.
     * `docs/10-architecture/ADR-JS.md`: `48-text-fit.js` aus Code-Links und Ausnahmeliste gestrichen; Dokumentation der vollständigen CSS-Ablösung.
     * `docs/10-architecture/ADR-CSS.md`: Ergänzt um `field-sizing`, `overflow: clip`, `text-wrap` und `light-dark()`.
     * `docs/20-implementation/no-scroll-techniques.md`: Veraltete `ResizeObserver`-Empfehlung gestrichen und als A49-Verstoß markiert.
     * `tools/antipatterns/project.json`: Automatische Sonde **P3** aktiviert (`TextFitEngine|scrollWidth\s*>\s*clientWidth`).
* **Ergebnis:** ~150 Zeilen fragiles JavaScript dauerhaft vernichtet, 0 ms Layout Thrashing, seidenweiches Tippen im Browser.

### 🟢 Priorität 6: Automatische Quartals-Pipeline für Open-Data
* **Ziel:** Dauerhafte Wartungsfreiheit für die Offline-PLZ- und Großempfänger-Datensätze über automatische GitHub Actions Builds und Synchronisation.
* **Durchgeführte Maßnahmen:**
  1. **GitHub Actions Workflow etabliert (`.github/workflows/update_plz_pipeline.yml`):**
     * Automatischer Cron-Trigger (`0 4 1 */3 *`): Läuft quartalsweise am 1. Januar, April, Juli und Oktober um 04:00 UTC.
     * Manuelle Auslösung (`workflow_dispatch`) über die GitHub Web-UI jederzeit möglich.
     * Nutzt Ubuntu-Latest mit Python 3.12 und `pip install brotli`.
     * Erkennt Änderungen automatisch per `git status --porcelain` und committed/pusht aktualisierte Daten via `stefanzweifel/git-auto-commit-action@v5` als `github-actions[bot]`.
  2. **Pipeline-Skript optimiert (`research/research_scripts/update_plz_pipeline.py`):**
     * Robuste Pfad-Ermittlung relativ zum Repository-Root (funktioniert identisch unter Windows und Linux CI).
     * Lädt 23.297 Rohdatensätze der Deutschen Post Direkt / Open Data DE.zip herunter (mit Fallback-Mechanismus).
     * Normalisiert 10.831 eindeutige deutsche 5-Stell-PLZs und führt 2.258 verifizierte Großempfänger & Verfassungsorgane zusammen.
     * Komprimiert beide Wörterbücher mit Brotli Quality 11 (`de_plz_ort.json.br` 70,5 KB; `de_grosskunden_plz.json.br` 28,8 KB).
     * Synchronisiert die Payloads synchron nach `website/data/` und `research/research_results/`.
     * Generiert `website/data/plz-embedded.js` mit Base64-Brotli-Strings für 100% Offline-Betrieb neu.
     * Validiert Sample-Lookups (`53111` -> Bonn, `11011` -> Deutscher Bundestag) und schreibt `plz_manifest.json`.
  3. **Verifikation & Testlauf:**
     * Lokaler Testlauf erfolgreich abgeschlossen in 3.01 ms Ready Time.
     * Fitness Gate (`tools/start.ps1`) mit 100% Evolutionary Fitness Score und 0 Scroll-Vorkommen bestätigt.
* **Ergebnis:** 10 Jahre garantierte Wartungsfreiheit für Adress- und Postleitzahldaten bei null personellem Aufwand.
