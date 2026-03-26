---
tags: [aviation-grade, platinum-2026, source-mapping, inventory, deep-scan]
status: cemented
version: 1.1.0
last_audit: 2026-03-23
id: BRAIN-000-INV
title: Source Inventory v1.1 — Deep-Scan & Technical Payload
supersedes: 00_source_inventory_v1.0.0.md
---

# 00 — Source Inventory v1.1.0 (Deep-Scan & Technical Payload)

## I. DIE HEILIGEN FÜNF (DEEP-SCAN KERNQUELLEN)
Die folgenden 5 Dokumente wurden binär und textuell tiefenanalysiert. Die extrahierten Fakten bilden das physikalische und architektonische Fundament des Projekts.

| Dateiname | Extrahierte Regel / Konstante (Technical Payload) | Ziel-Modul (.brain) |
|:---|:---|:---|
| `latex.pdf` (c't 2026 KOMA-Script) | `fontsize=14pt`, `parskip=half`, `\vspace{5\baselineskip}`, `\rule{5cm}{0.5pt}` | `04_physical_constants`, `03_technical_blueprint` |
| `Wolf, Jürgen - HTML5 und CSS3...` | Native API Specs: `<dialog open>` mit `showModal()`, HTML5 Constraint Validation (`novalidate`, `pattern`), `inert`-Verhalten für modale Traps. | `20_specify_chrome147`, `04_physical_constants` |
| `Peter Müller - Einstieg... Barrierefreie...`| A11Y Specs: `Skip-Link` (Sprungmarke `#top` mit `.visually-hidden`), `aria-live` für dynamische Status-Updates (Fehlermeldungen). | `03_technical_blueprint`, `20_specify_chrome147` |
| `Briefvorlage.html` | Legacy-JSON-Mapping IDs: `date`, `recipient`, `opening`, `signature-name`, `return-address`, `sender`, `body`, `footer`. | `08_isomorphic_schema` (IMR 2.5) |
| `Gemini-Legacy Code Migration...md` | `contenteditable="plaintext-only"`, `Temporal.Now.plainDateISO()`, 1-Strike/Tag Hysterese. | `01_constitution`, `05_anti_pattern_registry` |

---

## II. DER ERWEITERTE DATENBESTAND (24 DATEIEN)
Alle weiteren Dateien im Verzeichnis `.\quellen` wurden auf architektonische Hebelwirkung geprüft.

| Dateiname | Extrahierte Regel / Konstante (Technical Payload) | Ziel-Modul (.brain) |
|:---|:---|:---|
| `9783836290890 Einstieg in HTML und CSS...epub` | HTML-Semantik: Strikte Trennung von `<strong>` (Bedeutung) und `<b>` (Design). | `03_technical_blueprint` |
| `9783836290890 Einstieg in HTML und CSS...pdf` | CSS-Spezifität: Identifikation von ID-Überschreibungs-Risiken. | `05_anti_pattern_registry` |
| `Android-Apps mit HTML, CSS und JS...pdf` | Mobile-Viewport: `width=device-width, initial-scale=1, maximum-scale=1` (PWA-Ready). | `04_physical_constants` |
| `Code Campus - HTML5 und CSS3 für Einsteiger.epub` | Formular-Validation: Native Pseudo-Klassen `:valid` und `:invalid` als JS-Ersatz. | `03_technical_blueprint` |
| `CSS Web Design for Dummies ISBN.pdf` | Reset-Logik: Vermeidung von `* { margin: 0; }` zugunsten von targeted resets. | `03_technical_blueprint` |
| `CSS Web Design for Dummies@englishbooks.pdf` | Kaskaden-Tiefen: Vermeidung von CSS-Regeln mit einer Spezifität > 0,2,0. | `05_anti_pattern_registry` |
| `desktop.ini` | [SYSTEM FILE - NO PAYLOAD] | - |
| `Einstieg in HTML und CSS (Peter Mueller).epub` | Relative Units: `rem` für UI, aber expliziter Ausschluss für DIN-Maße (nur `mm`). | `04_physical_constants` |
| `html xhtml css for dummies 7th edition.pdf` | Legacy-Tags: Verbot von veralteten Tags (`<font>`, `<center>`). | `05_anti_pattern_registry` |
| `html xhtml and css all-in-one for dummies...` | CSS-Print: `@media print { display: none; }` für Ghost-Marker. | `03_technical_blueprint` |
| `HTML_&_CSS_für_Dummies_Florence_Maurice.pdf` | CSS Flexbox/Grid: Fallback-Routinen für alte Browser (Ignoriert wg. Chrome 147+ Mandat). | `05_anti_pattern_registry` (TOMB-Check) |
| `HTML_5_und_CSS3_für_Einsteiger_Der_leichte...` | Media-Queries: Ablehnung exzessiver Breakpoints zugunsten von Fluid-Typography. | `03_technical_blueprint` |
| `HTML5 Programming with JavaScript For Dummies...`| JS-DOM Manipulation: Verbot von Interleaved Reads/Writes (Layout Thrashing). | `05_anti_pattern_registry` |
| `HTML5 und CSS3 Das umfassende Handbuch...epub` | Native Date-Picker: `type="date"` inkl. nativem Kalender-Dropdown (Zero-JS). | `04_physical_constants` |
| `Juergen Wolf HTML5 und CSS3 Das umfassende...` | Offline-Storage: LocalStorage Limits (ca. 5MB) und `QuotaExceededError` Handling. | `09_resilience_strategy` |
| `Paul Fuchs HTML 5 und CSS3 fuer Einsteiger...pdf`| Box-Sizing: `box-sizing: border-box` als absoluter Standard für alle UI-Komponenten. | `03_technical_blueprint` |
| `Paul Fuchs HTML 5 und CSS3 fuer Einsteiger,...` | (Duplikat) -> Redundanz-Check. | - |
| `readme (1).md` (Awesome CSS Frameworks) | Framework-Purity: Pico.css / Beer CSS Extrakte (Aria-Invalid Styling). | `03_technical_blueprint` |
| `Wolf, Jürgen - HTML5 und CSS 3.epub` | Audio/Video-Tags: (Irrelevant für DIN-Brief, aber Verbot von Auto-Play-Attributen). | `05_anti_pattern_registry` |
