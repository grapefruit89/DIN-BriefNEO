---
aliases:
- Betreff Logik
- Falzmarken Kollision
- PDF Dateiname dynamisch
chosen_option: ''
created: '2026-07-06'
date: 2026-07-02
deciders:
- morit
- antigravity
decision_options: []
depends_on: []
last-reviewed: 2026-07-02
project: DIN-BriefNEO
related:
- '[[ADR-ANTIPATTERN]]'
- '[[longevity-guidelines]]'
status: accepted
tags:
- adr
- ui
- feature
- betreff
- print
- pdf
title: 'ADR-BETREFF: Positionierung des Betrefffeldes & PDF-Export'
type: adr
updated: '2026-07-06'
---

# ADR-BETREFF: Betreff-Logik, Falzmarken und dynamischer PDF-Titel

## 1. Context & Problem

**Fehlerhafte Falzmarken und statische PDF-Exporte.**
- Die Falzmarken (`.din-mark`) kollidierten optisch mit dem Betrefffeld, da sie als 100% breite Linien durch das Dokument schnitten.
- Beim nativen PDF-Export (`window.print()`) fehlte ein dynamischer Dateiname. Der Standardname der Webseite wurde übernommen, was für abgelegte DIN-Briefe unzureichend ist.
- Es wird eine Lösung benötigt, die sowohl die optischen DIN-Normen einhält als auch einen sauberen Datei-Workflow ohne zusätzliche Bibliotheken ermöglicht.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Native Print) | `document.title` live manipulieren für PDF-Namen | Zero JS-Libs, nutzt nativen Druckdialog | Nur beim direkten "Als PDF speichern" verfügbar | Keine | **Gewählt** |
| **Option B** (Blob Download) | PDF über `html2pdf` o.ä. generieren und Blob herunterladen | Volle Kontrolle über Dateinamen | Erfordert JS-Libraries, bricht Zero-Dependency-Regel | Hohe Wartungskosten | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Native Print) und CSS-Kürzung entschieden.**

### Begründung
- Die Falzmarken (`.din-mark`) wurden im CSS auf exakt `8mm` (`width: calc(8 / 210 * 100cqw);`) gekürzt.
- Für den PDF-Namen wird in `main.js` der `<title>` dynamisch generiert: `YYYY-MM-DD_{empfänger} {Betreff}`.
- Zur Datumsgenerierung wird primär die W3C **Temporal API** genutzt (siehe [[ADR-ANTIPATTERN]]).

## 4. Consequences

### Positive Auswirkungen
- **Perfekte Optik:** Der Betreff wird nicht mehr durchschnitten.
- **Beste UX:** Native Nutzung des Browser-Druckdialogs mit perfektem Dateinamen-Vorschlag.
- **Zero-Dependency:** Komplett mit Standard-APIs gelöst.

### Risiken & Negative Auswirkungen
- Fallback-Pflicht: `Date()` muss als Fallback vorhanden sein, falls `Temporal` auf alten iOS-Geräten fehlt.

### Langfristige Auswirkungen
- **Architektur-Dogma:** Kein Einsatz von Blob-Libraries (`html2pdf` etc.) für PDF-Exporte gestattet.

## 5. Implementation & Verification

- **CSS:** Kürzung der Falzmarken in `layout.css` implementiert.
- **JS:** `updateDocumentTitle()` läuft asynchron bei Eingaben und setzt `<title>`.
- **Regeln:** Native API-Nutzung ist im Antipattern-Catalog manifestiert.

## 6. Related Documents

- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]