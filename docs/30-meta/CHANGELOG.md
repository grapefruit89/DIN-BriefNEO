---
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: changelog
status: active
tags:
- documentation
- changelog
- history
title: Changelog (Dokumentation)
type: changelog
updated: '2026-07-07'
---

# Changelog (Dokumentation)

Alle wichtigen Änderungen an der Systemdokumentation dieses Repositories werden in dieser Datei nach dem "Keep a Changelog"-Standard gepflegt.

> [!NOTE]
> Dieses Changelog trackt alle Änderungen an der Architektur, dem Quellcode (HTML, CSS, JS) und der Dokumentation von DIN-BriefNEO. Alle W3C-Modernisierungsstufen sind produktiv implementiert.

---

## [15.0.0] - 2026-05-27

### Added

*   **CSS Anchor Positioning:** Vollständige Umstellung des Adress-Vorschlags-Dropdowns (`#address-suggestions`) auf die native W3C CSS Anchor Positioning API im Stylesheet (`layout.css`). Es koppelt sich nun absolut ruckelfrei und performant an das Eingabefeld (`#input-address-search`) und nutzt `position-area: bottom span-x` mit automatischer Umklappung (`flip-block`).

*   **CSS View Transitions API:** Kapselung aller Benutzer-initiierten Layout-Wechsel (Form A / Form B) und Farbschema-Wechsel (Hell / Dunkel / Auto) in `document.startViewTransition()` für butterweiche, hardwarebeschleunigte und native Seitenüberblendungen direkt über die Browser-Engine.

*   **CSS @starting-style & Discrete Transitions:** Umstellung der WhatsApp-Style Auswahl-Toolbar (`#format-toolbar`) und des Toast-Feedbacks (`#toast-v4`) auf native CSS discrete transitions unter Verwendung von `transition-behavior: allow-discrete` und `@starting-style` in `floating.css`. 

*   **CSS @property & Guides-Fading:** Registrierung der CSS-Variablen `--guide-opacity` als Typ `<number>`<number>` in `variables.css` und Aktivierung einer flüssigen Transition auf `:root`. Hilfslinien blenden sich nun absolut stufenlos ein und aus.

*   **CSS Relative Color Syntax (RCS):** Dynamische Farbberechnung für `--accent-glow`, `--accent-hover`, `--danger-hover` und die Hilfslinien-Farbe (`--guide-color`) direkt im CSS abgeleitet von ihren Basisfarben im OKLCH-Farbraum. Die Hilfslinien nutzen nun eine triadisch verschobene 120-Grad-Farbton-Formel für automatischen, perfekt harmonisierten Kontrast.

*   **CSS interpolate-size (height: auto Transitions):** Globale Deklaration von `interpolate-size: allow-keywords` auf `:root` in `variables.css`. Umstellung des API-Key-Eingabebereichs (`#geoapify-key-container`) auf native Höhen- und Deckkraft-Übergänge zwischen `height: 0` und `height: auto` in `layout.css`.

*   **W3C Temporal API Datum-Autobefüllung:** Nativer Einsatz der ultra-modernen W3C Temporal API (`Temporal.Now.plainDateISO()`) zur vollautomatischen Befüllung des Datum-Textfeldes (`#datum`) in DIN-5008-konformem deutschem Format beim ersten Systemstart.

*   **CSS @scope Isolation & Nesting:** Deklarative Kapselung aller physischen Briefbogen-Stile (`din-a4` und Nachfahren) über `@scope (din-a4)` in `layout.css`. Schützt die Briefgeometrie vollständig vor globalen Kollisionen.

*   **Reaktive :has() Fokusierung:** Einsatz des Parent Selectors `:has()` in `layout.css` zur automatischen Verstärkung des Ambient Glows auf dem Briefbogen, sobald ein editierbares Feld fokussiert wird.

### Changed

*   **Entscheidungs-Log:** Die Entscheidungen für CSS Anchor Positioning, View Transitions, Discrete Transitions, @property, Relative Color Syntax, interpolate-size, Temporal API, `@scope` und OKLCH-Farbmandat in `ADR-CSS.md`, `ADR-JS.md`, `ADR-FEATURE.md`, `ADR-ANTIPATTERN.md` und `DECISION-LOG.md` dokumentiert.

*   **Strikter Legacy-Date- & Farb-Ban:** Offizielle Ächtung von klassischem `new Date()`, externen Datums-Bibliotheken sowie allen klassischen Farbräumen (HEX, RGB, HSL) in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md`.

*   **Proaktive Antipattern-Verfassung:** Ausweitung der Verbote um 5 neue Regeln (Ausschluss von CSS-Präprozessoren, Icon-CDNs, JS-Hilfsbibliotheken/TypeScript, JS-Animationsbibliotheken und gestalterischen Inline-Styles) in `ADR-ANTIPATTERN.md` und `MASTER-DO-DONT-DEPRECATED.md` zum dauerhaften Schutz der Build-freien Offline-Architektur.

*   **JS-Bereinigungs-Dokumentation:** Ausführliche Architekturkommentare wurden in `main.js` (`renderSuggestions`, `processToastQueue`, `applySettings`, `applyProviderUIState` und `loadDraftData`) integriert, um den bewussten Verzicht auf JavaScript-Positions-, Keyframe-, Kontrast-, Fading-, Größen-Animations- und legacy Datums-Steuerungen zugunsten nativer W3C-Standards zu dokumentieren.

*   **Toast-Queue Vereinfachung:** Entfernung von obsoleten `@keyframes` aus `floating.css` und Vereinfachung des JS-Toast-Lifecycles in `main.js` (Ersatz von fehleranfälligen `animationend`-Listenern durch eine native, CSS-gesteuerte Austritts-Animation).

*   **API-Key-Steuerung:** Entfernung von unschönen inline-Styles in `index.html` und Ablösung von manuellen JavaScript-Größen-Animationsversuchen durch einfaches `.classList` Toggling.

## [Unreleased] - 2026-05-25

### Added

*   **Datenbank-Architektur:** Spezifikation der LLM-first SQLite-Dokumenten-Datenbank in **[../20-implementation/README-DB.md](../20-implementation/README-DB.md)** verankert.

*   **Datenbank-Compiler:** Das zero-dependency Node.js-Skript `build_db.js` zur vollautomatischen Generierung der SQLite-Datenbank aus den Markdown-Dateien angelegt.

*   **GitHub-Automatisierung:** Die Workflow-Vorlage `github_action_workflow.txt` für die vollautomatische Datenbank-Aktualisierung bei jedem Push erstellt.

*   **Entwicklerbereich:** Die Diagnose-Ansicht und Feature-Erkennungs-Matrix **[DEV-INFO.md](DEV-INFO.md)** zur Validierung von 25 absoluten Bleeding-Edge-Features der Web-Plattform angelegt und das Easter-Egg High-Integrity Dev-Panel (Feature 11) spezifiziert.

*   **Mermaid-Diagramme:** Visuelle Systemarchitektur und Spec-Kit-Lifecycle in `README.md` eingebettet.

*   **Zustandsdiagramm:** Toast-Queue-Lifecycle in `ADR-FEATURE.md` verankert.

*   **Netzwerkdiagramm:** Asynchroner Ablauf des Dual-Provider Adressdienstes in `ADR-API.md` integriert.

*   **YAML Frontmatter:** Obsidian- und KI-kompatible Metadaten-Blöcke an den Anfang aller 7 ADR-Dateien gestellt.

*   **Guides:** Das zentrale Fachbegriff-Glossar **[glossary.md](../20-implementation/glossary.md)** mit integrierten CSS-Container-Skizzen angelegt.

*   **Guides:** Der interaktive manuelle QA-Testleitfaden **[testing-guide.md](../20-implementation/testing-guide.md)** für alle Baseline-Features 1 bis 6 erstellt.

*   **Entscheidungs-Log:** Das chronologische Logbuch **[DECISION-LOG.md](DECISION-LOG.md)** zur historischen Nachverfolgbarkeit aller Systementscheidungen angelegt.

*   **Maschinen-Index:** Die Datei **`build/index.json`** (generiertes Build-Artefakt) als maschinenlesbarer Index aller Dokumente angelegt.

### Changed

*   **[[README]]:** Zum zentralen Master-Portal und Dokumenten-Wegweiser ausgebaut und Links zu den neuen Guides `DEV-INFO.md` und `../20-implementation/README-DB.md` unter den Status & Spezifikationen ergänzt.

*   **index.json:** Um Metadaten-Einträge für `DEV-INFO.md` und `../20-implementation/README-DB.md` erweitert.

*   **[[DECISION-LOG]]:** Neue architektonische Entscheidungen zur Feature-Prüfungs-Matrix, zum Easter-Egg Popover-Dashboard und zur LLM-first SQLite-Architektur dokumentiert.

*   **[[longevity-guidelines]]:** Pfadkorrekturen der ADR-Links auf relative `../ADR/`-Pfade korrigiert und plattformübergreifende CSS-Anchor-Positioning Warnungen integriert.

*   **[[spec]]:** Phase 3 Zukunftsplanung um Spezifikation für Easter-Egg High-Integrity Dev-Panel (Feature 11) erweitert.

*   **tasks.md & task.md:** Planungs-Checklisten bereinigt und an den rein dokumentationsfokussierten Baseline-Stand angepasst.

*   **ADR-HTML/CSS/JS/API/FEATURE/ANTIPATTERN/TECH-STACK.md:** Verlinkungen zur unbiegsamen Verfassung `longevity-guidelines.md` in den Verknüpfungs-Abschnitten bidirektional verankert.