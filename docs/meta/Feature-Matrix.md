---
id: feature-matrix
title: "Feature-Matrix — aktueller Produktumfang"
type: reference
status: active
created: '2026-07-03'
updated: '2026-11-23'
tags:
  - din-briefneo
  - meta
summary: "Feature-Matrix — aktueller Produktumfang."
doc_links:
code_links:
  - website/index.html
  - website/js/main.js
  - website/js/core.js
  - website/js/document.js
  - website/js/settings.js
  - website/js/salutation.js
  - website/js/address.js
  - website/js/persistence.js
depends_on:
sections: [statusvokabular, 1-brief-und-din-grundfunktionen, 2-eingabe-anrede-und-dokumentzustand, 3-adress-und-absenderintelligenz, 4-import-export-und-zwischenablage, 5-darstellung-und-plattform, 6-bewusst-nicht-im-aktuellen-umfang, zustaendigkeit-der-anderen-dokumente]
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
| Einseitige Papiergrenze / Zero-Scroll | **aktiv** | Viewport- und Papierregeln in `website/css/sheet.css`, `website/css/sheet-multipage.css`; siehe [[no-scroll-techniques]] |

## 2. Eingabe, Anrede und Dokumentzustand

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| Automatische Anrede | **aktiv** | 80/20-B2B-Engine mit drei Stilklassen, Vornamenerkennung, Adelspartikeln und manuellem Override; siehe [[Salutation-Engine]] |
| Anrede-/Grußformel-Pärchen | **aktiv** | Stilwahl synchronisiert Anrede und Grußformel; manuelle Bearbeitung wird geschützt |
| Plaintext-Metadatenfelder | **aktiv** | `contenteditable="plaintext-only"` und `enterkeyhint`; notwendige Zeilen-/Paste-Sonderfälle bleiben in `document.js` |
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
| Lokales Adressbuch | **geparkt** | Datenschicht liegt fertig in `website/addons/verlauf/` (Absender/Empfänger), ist aber bewusst nicht geladen; UI und Speicherzeitpunkt offen — siehe B32 |
| Optionale Straßen-/Hausnummernsuche | **aktiv · optional** | Geoapify nur mit Nutzer-Key und Netzverbindung; lokale Funktionen bleiben unabhängig |
| API-Timeouts und Request-Abbruch | **aktiv** | `AbortSignal.timeout()` in `website/js/address.js` |
| Tastaturbedienung der Vorschläge | **aktiv** | Pfeiltasten, Enter, Escape und ARIA-Listbox-Semantik |
| Zero-Click-Autofill bei genau 1 Treffer | **verworfen** | Bewusst entfernt: Wer einen Treffer löscht, bekam ihn sofort wieder eingesetzt. Automatisch gefüllt wird nur PLZ → Ort; siehe DECISION-LOG 2026-11-23 |
| Eingrenzungshinweis bei mehr als 5 Treffern | **offen** | Die ROADMAP behauptete die 3-Zonen-Logik als erledigt; im Code ist kein Hinweis-Modus nachgewiesen — siehe [#29](https://github.com/grapefruit89/DIN-BriefNEO/issues/29) |
| Bidirektionales Formular-Orchestrieren | **verworfen** | Als separates Konzept verworfen; 1.500 Zeilen Adresslogik bleiben ohne zusätzlichen State-Sync-Overhead schlank (KISS) |

## 4. Import, Export und Zwischenablage

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| JSON-Export | **aktiv** | Selbstbeschreibendes JSON mit Metadaten; siehe `website/js/persistence.js` |
| JSON- und Legacy-Import | **aktiv** | Import akzeptiert `.json`; Inhalte werden vor dem Restore bereinigt |
| Clipboard-Impressum-Parser | **verworfen** | Am 2026-11-22 mit der Anschrift-Suche entfernt (Commit `164568b`): „wir suchen nicht in einer potentiellen Zwischenablage" |
| Mehrere Clipboard-Kandidaten | **verworfen** | Fiel mit dem Parser weg |
| Briefarchiv mit mehreren Profilen | **geparkt** | Datenschicht als Addon `verlauf` vorhanden; nicht geladen — siehe B32 |

## 5. Darstellung und Plattform

| Funktion | Status | Ist-Stand / kanonische Quelle |
|---|---|---|
| Hell-/Dunkel-/Systemdarstellung | **aktiv** | `light-dark()`, `color-scheme` und persistente Auswahl; Papier bleibt druckweiß |
| Native CSS-Layoutmodernisierung | **aktiv** | `text-fit`, `field-sizing`, Container Queries, `:has()`, `@property`, Anchor Positioning und `@starting-style`; Details in [[ADR-CSS]] |
| Native Popovers und Top-Layer | **aktiv** | Toasts, Formattoolbar und Adressvorschläge ohne z-index-Stapelung |
| Native Dialoge und Invoker Commands | **aktiv** | Reset-/Import-Dialoge über `<dialog>` und `commandfor` |
| Signaturbild | **aktiv** | Lokales Bild, Verschieben, Skalieren und Rotieren; Fachinteraktion bleibt JavaScript |
| Lokale Schrift | **aktiv · optional** | WOFF2-Upload, FontFace-API und lokale Speicherung |
| On-Device-KI-Assistent | **verworfen** | Kostet ein lokales Modell mit ~4 GB RAM (Gemini Nano) — nicht für jeden Rechner. Der Agenten-Zugang (WebMCP/MCP) deckt das ohne Modell ab; siehe DECISION-LOG 2026-11-23 |

## 6. Bewusst nicht im aktuellen Umfang

| Thema | Status | Begründung / Verweis |
|---|---|---|
| Framework, Bundler, npm-Runtime | **verworfen** | Widerspricht Zero-Dependency und Longevity; [[Immutable-Law-Catalog]] |
| Service Worker / PWA-Zwang | **verworfen** | Zusätzliche Cache- und Invalidierungswartung ohne Nutzen für die lokale Web-App |
| Externe PDF-Engine | **verworfen** | Browserdruck ist der kanonische PDF-Weg |
| `@page`-Seitenzahlen | **geparkt** | Einseitige DIN-Brief-Fläche; Mehrseitigkeit ist nicht entschieden |
| CSS `::highlight()` | **geparkt** | Der aktuelle Code besitzt keinen DOM-Highlight-Renderer, den diese API ersetzen würde |
| CSS `subgrid` für Anschrift/Infoblock | **geparkt** | Passt derzeit nicht zur absoluten, IMR-geführten DIN-Geometrie |
| Vektorsuche / sqlite-vec | **geparkt** | Agenten-Tooling, nicht Produktfunktion; siehe `sqlite-vec` (archiviert) |
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
