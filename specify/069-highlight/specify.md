---
id: SPEC-069
title: Native Highlight Editor — Paint-Time WYSIWYG
tags: [aviation-grade, chrome-147, highlight-api, edit-context]
status: cemented
version: 1.0.0
traceability: [ADR-012, MANDATE-PLN]
source: Platinum Audit 2026
---

# SPEC-069: Native Highlight Editor

## I. Zielsetzung (Aviation Grade)
Ermöglichung von WYSIWYG-Formatierungen (Fett, Kursiv), ohne die Plaintext-Integrität des DOM zu verletzen. Die Formatierung wird vollständig von der Datenstruktur entkoppelt.

## II. Fachliche Anforderungen (WHAT)

### FR-001: Zero-Tag-Integrität
Der Briefinhalt (`body`) muss zu jedem Zeitpunkt als reiner Plaintext ohne HTML-Tags vorliegen. Ein `innerHTML`-Abruf muss identisch mit dem `textContent` sein.

### FR-002: Koordinaten-basierte Formatierung
Formatierungen werden über Start- und End-Indizes (Offsets) definiert. 
Beispiel: `Text: "Hallo Welt"`, `Format: {type: 'bold', start: 0, end: 5}` -> "Hallo" erscheint fett.

### FR-003: Persistenz der Format-Matrix
Die Highlighting-Koordinaten müssen im Dokument-State gespeichert werden, um beim Neuladen wiederhergestellt zu werden.

### FR-004: Native Input-Souveränität
Die Eingabe erfolgt über die **EditContext API**. Das DOM-Element dient nur als Projektionsfläche für die Highlighting-Engine.

## III. Akzeptanzkriterien
1. `Strg+B` markiert den selektierten Text visuell fett, fügt aber KEINE `<b>` oder `<strong>` Tags in das DOM ein.
2. Ein Export des Briefes als JSON enthält das Feld `body` als sauberen String ohne Steuerzeichen.
3. Die Highlighting-Ebene bleibt bei Scroll-Bewegungen und Fenster-Resizing mathematisch deckungsgleich mit dem Text.
4. Das Kopieren von formatiertem Text aus dem Editor resultiert in sauberem Plaintext in der Zwischenablage (Integritäts-Schutz).

## IV. Definition of Done
- [ ] Keine `<b>`, `<i>` oder `<span>` Tags im `<din-body>`.
- [ ] CSS `::highlight()` steuert die gesamte Optik.
- [ ] EditContext fängt alle OS-Eingaben ab.
