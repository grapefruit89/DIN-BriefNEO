---
id: architektur-evolution-und-quellen
title: 'Architektur-Evolution — Warum wir so gebaut haben & externe Quellen'
type: guide
status: active
created: '2026-07-07'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/guide
doc_links:
  - Immutable-Law-Catalog
  - constitution
  - din-5008-css-architektur
error_patterns:
  - architektur evolution
  - warum vanilla
  - zero dependency
  - kein framework
  - entscheidungsgeschichte
  - quellen
  - lerngeschichte
  - externe referenzen
supersedes:
  - Architecture-Evolution
  - QUELLEN-UND-LERNGESCHICHTE
depends_on: []
code_links: []
---

# Architektur-Evolution — Warum wir so gebaut haben & externe Quellen

Zwei Perspektiven auf die gleiche Geschichte: **Warum** wir die radikalen Architektur-Entscheidungen getroffen haben, und **woher** das Wissen kam.

---

## Teil 1 — Lektionen & Entscheidungs-Geschichte

### Warum kein Framework?

**Die Ausgangslage:** Moderne Frontend-Entwicklung nutzt fast ausschließlich reaktive Frameworks (React, Vue, etc.), da sie State-Management vereinfachen.

**Das Problem:**
- Tausende npm-Pakete. Eines veraltet, und das Projekt bricht beim Build.
- Virtuelle DOMs machen millimetergenaue Druckausgabe (PDF via Browser) schwer kontrollierbar — der echte DOM wird asynchron aktualisiert.

**Die Entscheidung:** Vanilla JS + Web Components (Custom Elements). Die nativen Browser-APIs bleiben stabil (Rückwärtskompatibilität des Webs). → [[Immutable-Law-Catalog]]

### Warum localStorage statt OPFS?

**Das Problem:** OPFS (Origin Private File System) ist an HTTPS gebunden. Da DIN-Brief NEO 100% offline unter `file:///` laufen muss, werfen OPFS-Aufrufe Security Errors.

**Die Entscheidung:** `localStorage` funktioniert beim Doppelklick auf die `.html`-Datei. Synchron, überall unterstützt, ausreichend für Textdokumente.

### Warum der Immutable Law Catalog?

In frühen Versionen (v4.8 und früher) durften KI-Agenten relativ frei entscheiden, wie sie Features implementieren. Das Projekt verlor seine Kernidentität, Zero-Dependency wurde schleichend gebrochen.

**Die Lösung:** Extrem striktes, nicht verhandelbares Regelwerk + Evolutionary Fitness Score. Agenten werden programmatisch gezwungen (`.\start.ps1`), sich an die Vanilla-JS und Privacy-First-Regeln zu halten.

### Warum kein Tailwind CSS?

Tailwind erfordert einen Build-Step (PostCSS). Die Utility-Klassen überschwemmen den DOM, was DOM-Auswertungen (durch KIs oder für PDF-Generierung) erschwert.

**Die Entscheidung:** Natives CSS mit `@layer`, `@container`, CSS Variables — sauberes semantisches Layout ohne Build-Tool.

> **Fazit:** DIN-Brief NEO opfert Entwickler-Bequemlichkeiten zugunsten von radikaler Überlebensfähigkeit, Datenschutz und minimaler Angriffsfläche. Jede Codezeile soll auch in 10 Jahren noch exakt so im Browser funktionieren.

---

## Teil 2 — Externe Referenzen & Projektsnapshots

Dieses Projekt hat eine lange Reise hinter sich. Diese Quellen haben die Architektur geprägt.

### Externe Bibliotheken & Projekte (analysiert, nicht übernommen)

**`din-5008-css`** — Externe CSS-Bibliothek für DIN-5008-konformes Layout.
- Gelernt: Wie andere das Layout in reinem CSS angehen — Abstände und Zonen.
- Übernommen: Konzept der festen mm-Abstände als CSS-Custom-Properties. Unser Ansatz ist deutlich präziser (moderne CSS-Features statt älterer Hacks).

**`din-5008-css-forked-for-later`** — Fork der obigen Bibliothek für frühe Experimente.
- Gelernt: Was passiert, wenn man externe Abhängigkeiten forkt statt selbst zu bauen — Drift, Wartungsaufwand, Versionskonflikte. Hat unsere Zero-Dependency-Entscheidung final bestätigt.

**`din5008-generator`** — Externes Projekt zur dokumentenbasierten DIN-5008-Generierung.
- Gelernt: Generatoransätze (HTML-Template + Daten → Dokument) funktionieren nicht gut für interaktive Live-Editoren. Bestätigt unseren WYSIWYG-im-Browser-Ansatz.

**`letter`** — Einfaches HTML/JS Brief-UI aus der frühen Explorationsphase.
- Gelernt: `<textarea>`-basierte Letter-UIs verlieren sofort DIN-Geometrie-Kontrolle.

**`GerLaTeXLetter`** — LaTeX-basiertes Briefvorlagen-System für deutsche Geschäftsbriefe.
- Gelernt: LaTeX beherrscht DIN 5008 präzise (mm-genaue Satzspiegelkontrolle), ist aber kein Webformat.
- Übernommen: Die Denkweise, Layout-Zonen als absolute mm-Koordinaten zu definieren statt als relative Abstände. Detailliert beschrieben in [[din-5008-css-architektur]].

### Eigene Projektsnapshots

**`DIN-BriefNEO` (V4.8, Stand ~April 2026)** — Die komplette alte Codebasis vor dem großen Refactoring, mit 11 JS-Modulen und 6 CSS-Dateien.

- Warum ersetzt: Zu viele Zuständigkeiten pro Datei, keine klare Longevity-Strategie, noch kein Fitness-Score-System.
- Übernommen: Grundprinzip der strukturierten HTML-Elemente, Salutation-Engine-Logik, DIN-5008-Referenz-SVGs.
- Bewusst weggelassen: Externe Bibliotheken (z.B. `qrcode.js`), komplexe LocalStorage-Archive.
