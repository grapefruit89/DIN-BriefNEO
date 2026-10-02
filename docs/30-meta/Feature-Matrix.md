---
id: feature-matrix
title: 'Feature-Matrix — aktueller Produktumfang'
type: reference
status: active
created: '2026-07-03'
updated: '2026-10-02'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/reference
doc_links:
  - spec
  - BACKLOG
  - ROADMAP
  - ADR-CSS
  - ADR-HTML
  - ADR-JS
  - Salutation-Engine
  - ADR-OFFLINE-ADDRESS-INTELLIGENCE
code_links:
  - website/index.html
  - website/js/main.js
  - website/js/01-draft-manager.js
  - website/js/02-settings-manager.js
  - website/js/41-salutation-engine.js
  - website/js/43-geoapify.js
  - website/js/45-address-intelligence.js
  - website/js/46-clipboard-address-parser.js
  - website/js/51-storage.js
  - website/js/52-import-export.js
  - website/js/53-metadata.js
  - website/css/layout.css
  - website/css/sidebar.css
  - website/css/floating.css
  - website/css/print.css
depends_on: []
supersedes:
  - FEATURE-INVENTORY
---

# Feature-Matrix — aktueller Produktumfang

> **Rolle dieses Dokuments:** aktuelle Bestandsaufnahme des Produkts. Es ist weder
> eine Sprintplanung noch ein Fortschrittszähler und enthält keine historischen
> Platinum-/Issue-Listen. Offene Arbeiten stehen im [[BACKLOG]], größere Produktideen
> in der [[ROADMAP]].

## Statusvokabular

| Status | Bedeutung |
|---|---|
| **aktiv** | Im aktuellen Produktcode vorhanden und regulär nutzbar |
| **aktiv · optional** | Vorhanden, aber nur bei bewusster Aktivierung oder mit optionalem Dienst |
| **geparkt** | Bewusst vorhanden, aber derzeit nicht Teil des Produktumfangs |
| **offen** | Relevanter, noch nicht implementierter Kandidat; siehe [[BACKLOG]] oder [[ROADMAP]] |
| **verworfen** | Nicht weiterverfolgen; nicht erneut als neue Produktanforderung vorschlagen |

## 1. Brief und DIN-Grundfunktionen

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| DIN-5008-Briefbogen Form A und B | **aktiv** | Umschaltung über native Radio-Gruppe; Maße und Atome in [[IMR-Registry]], Umsetzung in `website/index.html` und `website/css/sheet.css` |
| A4-Druck und PDF über Browserdruck | **aktiv** | `window.print()` und `@media print`/`@page`; keine externe PDF-Bibliothek, siehe [[ADR-CSS]] |
| WYSIWYG-Brieffläche | **aktiv** | Semantische `din-*`-Elemente, direkt editierbare Felder, absolute DIN-Geometrie |
| Absender- und Empfängerblock | **aktiv** | Rücksendezeile, Anschriftfeld und Infoblock mit synchronisierten Absenderdaten |
| Betreff, Anrede, Brieftext und Grußformel | **aktiv** | Native `contenteditable`-Felder; Rich-Text nur im Briefkern |
| Anlagen | **aktiv** | Optionaler Bereich über nativen Checkbox-Schalter; editierbare Anlagenliste |
| Falz- und Lochmarken | **aktiv** | Deklarativ über CSS und IMR-verankerte `data-*`-Geometrie |
| Einseitige Papiergrenze / Zero-Scroll | **aktiv** | Viewport- und Papierregeln in `layout.css`, `sheet.css` und `print.css`; siehe [[no-scroll-techniques]] |

## 2. Eingabe, Anrede und Dokumentzustand

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| Automatische Anrede | **aktiv** | 80/20-B2B-Engine mit drei Stilklassen, Vornamenerkennung, Adelspartikeln und manuellem Override; siehe [[Salutation-Engine]] |
| Anrede-/Grußformel-Pärchen | **aktiv** | Stilwahl synchronisiert Anrede und Grußformel; manuelle Bearbeitung wird geschützt |
| Plaintext-Metadatenfelder | **aktiv** | `contenteditable="plaintext-only"` und `enterkeyhint`; notwendige Zeilen-/Paste-Sonderfälle bleiben in `03-ui-protections.js` |
| Rich-Text im Briefkern | **aktiv** | Selection/Range-basierte Formatierung mit eigener Draft-Sanitization |
| Entwurf-Autosave | **aktiv** | Synchroner `localStorage`-Pfad mit Debouncing, Restore und Dirty-Status; siehe [[ADR-DATA-PERSISTENCE]] |
| Reset-Dialog | **aktiv** | Native `<dialog>`- und Invoker-Command-Unterstützung |
| Browser-Zoom der Seitenleiste | **aktiv** | Seitenleiste kompensiert `Ctrl`+`+`/`Ctrl`+`-`; das DIN-Blatt bleibt unverändert |

## 3. Adress- und Absenderintelligenz

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| Offline PLZ → Ort | **aktiv** | Lokaler komprimierter Datensatz und native `DecompressionStream`-Pipeline |
| Ort → PLZ-Vorschläge | **aktiv** | Lokale Rückwärtssuche im Empfänger-Ortsfeld |
| Großempfänger-Erkennung | **aktiv** | Lokale Großempfänger-Daten; Straßenzeile wird bei passenden PLZ fachlich berücksichtigt |
| Ziel-Lock für Straßenrecherche | **aktiv** | PLZ/Ort-Kontext beeinflusst optionale Geoapify-Suche |
| Lokales Adressbuch | **aktiv** | Ausgewählte Treffer werden lokal gespeichert und wiederverwendet |
| Optionale Straßen-/Hausnummernsuche | **aktiv · optional** | Geoapify nur mit Nutzer-Key und Netzverbindung; lokale Funktionen bleiben unabhängig |
| API-Timeouts und Request-Abbruch | **aktiv** | `AbortSignal.timeout()` plus `AbortSignal.any()` in `43-geoapify.js` |
| Tastaturbedienung der Vorschläge | **aktiv** | Pfeiltasten, Enter, Escape und ARIA-Listbox-Semantik |
| Adaptive Trefferzonen | **offen** | Mehr als fünf Treffer derzeit noch nicht als reiner Hinweis behandelt; siehe B19 in [[BACKLOG]] |
| Bidirektionales Formular-Orchestrieren | **offen** | Straße-zuerst/PLZ-zuerst als separates Konzept, derzeit nicht Teil des Kerns |

## 4. Import, Export und Zwischenablage

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| JSON-Export | **aktiv** | Selbstbeschreibendes JSON mit Metadaten; siehe `52-import-export.js` |
| JSON- und Legacy-Import | **aktiv** | Import akzeptiert `.json` und `.dinletter`; Inhalte werden vor dem Restore bereinigt |
| Clipboard-Impressum-Parser | **aktiv** | Deterministischer Offline-Parser mit Kandidaten-Popover; siehe `46-clipboard-address-parser.js` |
| Mehrere Clipboard-Kandidaten | **aktiv** | Nutzer wählt bei mehreren erkannten Anschriften über natives Popover |
| Briefarchiv mit mehreren Profilen | **geparkt** | Derzeit bewusst kein Produktfeature; `localStorage` bleibt auf einen Entwurf und Einstellungen begrenzt |

## 5. Darstellung und Plattform

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| Hell-/Dunkel-/Systemdarstellung | **aktiv** | `light-dark()`, `color-scheme` und persistente Auswahl; Papier bleibt druckweiß |
| Native CSS-Layoutmodernisierung | **aktiv** | `text-fit`, `field-sizing`, Container Queries, `:has()`, `@property`, Anchor Positioning und `@starting-style`; Details in [[ADR-CSS]] |
| Native Popovers und Top-Layer | **aktiv** | Toasts, Formattoolbar und Adressvorschläge ohne z-index-Stapelung |
| Native Dialoge und Invoker Commands | **aktiv** | Reset-/Import-Dialoge über `<dialog>` und `commandfor` |
| Signaturbild | **aktiv** | Lokales Bild, Verschieben, Skalieren und Rotieren; Fachinteraktion bleibt JavaScript |
| Lokale Schrift | **aktiv · optional** | WOFF2-Upload, FontFace-API und lokale Speicherung |
| On-Device-KI-Assistent | **aktiv · optional** | Separates Addon mit Graceful Degradation; nur bei vorhandener Browser-API und bewusster Aktivierung |

## 6. Bewusst nicht im aktuellen Umfang

| Thema | Status | Begründung / Verweis |
|---|---|---|
| Framework, Bundler, npm-Runtime | **verworfen** | Widerspricht Zero-Dependency und Longevity; [[Immutable-Law-Catalog]] |
| Service Worker / PWA-Zwang | **verworfen** | Zusätzliche Cache- und Invalidierungswartung ohne Nutzen für die lokale Web-App |
| Externe PDF-Engine | **verworfen** | Browserdruck ist der kanonische PDF-Weg |
| `@page`-Seitenzahlen | **geparkt** | Einseitige DIN-Brief-Fläche; Mehrseitigkeit ist nicht entschieden |
| CSS `::highlight()` | **geparkt** | Der aktuelle Code besitzt keinen DOM-Highlight-Renderer, den diese API ersetzen würde |
| CSS `subgrid` für Anschrift/Infoblock | **geparkt** | Passt derzeit nicht zur absoluten, IMR-geführten DIN-Geometrie |
| Vektorsuche / sqlite-vec | **geparkt** | Agenten-Tooling, nicht Produktfunktion; siehe [[sqlite-vec]] |
| Serienbriefe und Mehrseitenbriefe | **offen** | Produktentscheidung und Geometriekonzept fehlen; nicht nebenbei aus Research ableiten |

## Zuständigkeit der anderen Dokumente

- **Aktueller Bestand:** diese Matrix plus der verifizierte Code.
- **Normen und Verbote:** [[Immutable-Law-Catalog]].
- **Fachliche Anforderungen:** [[spec]].
- **Architekturentscheidungen:** thematische ADRs in `docs/10-architecture/`.
- **Konkrete offene Arbeit:** [[BACKLOG]].
- **Zukünftige Produktoptionen:** [[ROADMAP]].
- **Begründungen und historische Kurswechsel:** [[DECISION-LOG]].
- **Quellen und Experimente:** `research/README.md`.

Diese Matrix enthält bewusst keine Prozentzahl. Ein Prozentwert vermischt fertige
Kernfunktionen, optionale Addons und bewusst nicht verfolgte Ideen und war deshalb
keine belastbare Information.
