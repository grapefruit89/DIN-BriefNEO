---
id: SPEC-029
title: Multi-Page Pagination & Hybrid Height
tags: [print, pagination, aviation-grade]
status: cemented
version: 2.0.0
traceability: [DIN-5008-PRINT]
---

# Specify: Multi-Page Pagination (WHAT)

## 1. Zielsetzung
Das System muss in der Lage sein, Briefe zu verarbeiten, die länger als eine DIN-A4 Seite sind. Während auf dem Bildschirm die Immersion eines einzelnen Blattes gewahrt bleibt, muss der Ausdruck (PDF) den Textfluss über beliebig viele Seiten ermöglichen.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Hybrid-Height Mode
- **Screen-Mode**: Das Papier hat eine fixe Höhe von 297mm. Text, der darüber hinausgeht, wird visuell markiert (Overflow-Wächter), aber nicht gescrollt.
- **Print-Mode**: Das Papier wechselt auf eine variable Höhe (`height: auto`). Der Text fließt natürlich auf Folgeseiten.

### FR-002: Typografische Integrität auf Folgeseiten
- Seitenumbrüche MÜSSEN so gesteuert werden, dass keine "Hurenkinder" oder "Schusterjungen" entstehen (mind. 3 Zeilen pro Absatz auf einer Seite).
- Tabellen oder Listen dürfen nicht unkontrolliert zerrissen werden.

### FR-003: Folgeseiten-Header
- (Zukünftig): Folgeseiten sollten eine Seitenzahl ("Seite 2") enthalten.

## 3. Erfolgskriterien
- **SC-001**: Ein Brief mit 5000 Wörtern wird im Druck auf ca. 10 Seiten aufgeteilt.
- **SC-002**: Der Briefkopf (Absender, Empfänger) erscheint nur auf der ersten Seite.
- **SC-003**: Die Textschärfe bleibt vektorbasiert.
