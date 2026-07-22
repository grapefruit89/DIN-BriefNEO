---
code_links: []
created: '2026-07-07'
depends_on: []
doc_links: []
id: QUELLEN-UND-LERNGESCHICHTE
status: active
tags:
- obsidian
- core
- documentation
- history
title: Quellen & Lerngeschichte
type: concept
updated: '2026-07-07'
---

# Quellen & Lerngeschichte

Dieses Dokument dokumentiert die Historie und die wichtigsten externen Referenzen, die bei der Entstehung von DIN-Brief NEO (Pure Refactored Edition) geholfen haben. Es ersetzt die eingebetteten Git-Repos im ehemaligen `archiv/`-Ordner.

## 🏛️ Evolution zur Vanilla-JS Architektur

DIN-Brief NEO hat eine lange Reise hinter sich:

- **Frühe Phasen:** Primitive `<textarea>`-basierte UIs, die keine Geometrie-Kontrolle erlaubten.

- **V4.8 Ära:** Viele JavaScript-Module (11+), die zuständigkeitsübergreifend arbeiteten. Externe Abhängigkeiten wie QR-Code Generatoren brachen das Zero-Dependency-Versprechen.

  - `contenteditable="true"` kombiniert mit der Selection & Range API

  - CSS Layers (`@layer`) und Scoping (`@scope`) für isoliertes Styling

  - Native Popover API

  - Keine externen CDNs. Alles funktioniert lokal unter `file:///` oder einem simplen `localhost:8000`.

---

## 📚 Externe Referenzen

### `din-5008-css`

- **Herkunft:** Externe CSS-Bibliothek für DIN-5008-konformes Layout

- **Was wir gelernt haben:** Wie andere das DIN-5008-Layout in reinem CSS angehen — vor allem Abstände und Zonen. Unser Ansatz ist deutlich präziser und nutzt moderne CSS-Features (`@layer`, `@scope`, Container Queries) statt älterer Hacks.

- **Was wir übernommen haben:** Konzept der festen mm-Abstände als CSS-Custom-Properties — bei uns konsequent umgesetzt, um exakte DIN-Maße zu garantieren.

### `din-5008-css-forked-for-later`

- **Herkunft:** Fork der obigen Bibliothek für frühe Experimente

- **Was wir gelernt haben:** Was passiert, wenn man externe Abhängigkeiten forkt statt selbst zu bauen — Drift, Wartungsaufwand, Versionskonflikte. Das hat unsere Zero-Dependency-Entscheidung final bestätigt.

### `din5008-generator`

- **Herkunft:** Externes Projekt zur dokumentenbasierten DIN-5008-Generierung

- **Was wir gelernt haben:** Generatoransätze (HTML-Template + Daten -> Dokument) funktionieren nicht gut für interaktive Live-Editoren. Bestätigt unseren WYSIWYG-im-Browser-Ansatz.

### `letter`

- **Herkunft:** Einfaches HTML/JS Brief-UI aus der frühen Explorationsphase

- **Was wir gelernt haben:** Primitive `<textarea>`-basierte Letter-UIs verlieren sofort DIN-Geometrie-Kontrolle. Hat den Weg für strukturierte DOM-Manipulation geebnet.

### `GerLaTeXLetter`

- **Herkunft:** LaTeX-basiertes Briefvorlagen-System für deutsche Geschäftsbriefe

- **Was wir gelernt haben:** LaTeX beherrscht DIN 5008 präzise (mm-genaue Satzspiegelkontrolle), ist aber kein Webformat. Hat unsere Überzeugung gestärkt, dass pixelgenaues Layout im Browser möglich ist — ohne LaTeX oder PDF-Umwege.

- **Was wir übernommen haben:** Die Denkweise, Layout-Zonen als absolute mm-Koordinaten zu definieren statt als relative Abstände. *(Detaillierter beschrieben in `docs/20-implementation/Guides/din-5008-precise-layout-lessons.md`)*.

---

## 🗄️ Eigene Projektsnapshots

### `DIN-BriefNEO` (V4.8, Stand ~April 2026)

- **Was es war:** Die komplette alte Codebasis vor dem großen Refactoring — mit 11 JS-Modulen und 6 CSS-Dateien.

- **Warum ersetzt:** Zu viele Zuständigkeiten pro Datei, keine klare Longevity-Strategie, noch kein Fitness-Score-System.

- **Was wir übernommen haben:**

  - Grundprinzip der strukturierten HTML-Elemente

  - Salutation-Engine-Logik als Referenz für die neue `main.js`

  - Die DIN-5008-Referenz-SVGs (`assets/reference-DIN_5008_Form_A.svg` / `Form_B.svg`)

- **Was wir bewusst weggelassen haben:**

  - Externe Bibliotheken (z. B. `qrcode.js`), da sie gegen unser Zero-Dependency-Pakt verstoßen.

  - Komplexe LocalStorage-Archive in separaten Dateien — stattdessen setzen wir auf eine minimalistische Draft-Speicherung.