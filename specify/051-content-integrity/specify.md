---
id: SPEC-051
title: Content Integrity & Ghost-Mirror System
tags: [integrity, markdown, ghost-mirror, aviation-grade]
status: active
version: 1.0.0
traceability: [ADR-008, DIN-5008-TYPO]
source: GEMINI.md ADR-008
depends-on: [SPEC-007]
---

# Specify: Content Integrity & Ghost-Mirror System (WHAT)

## 1. Problemstellung
`contenteditable="true"` erlaubt Browsern, beim Einfügen (Paste) unkontrolliertes HTML in das Dokument zu schreiben. Dies führt zu "Datenvergiftung" (unsichtbare Styles, Skripte, Spans), die bei einem Export oder einer KI-Verarbeitung zu Fehlern führen. 

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Plaintext-Only Doctrine (ADR-008)
- Jedes Eingabefeld (<din-*>) MUSS strukturell gegen HTML-Injection geschützt sein.
- Der Browser DARF KEIN HTML in diese Felder schreiben, auch nicht beim Paste oder Drag-and-Drop.
- Die einzige Datenquelle für den Export MUSS `textContent` sein.

### FR-002: Markdown-Support im Briefkörper
- Der Nutzer MUSS Formatierungen im Feld `<din-body>` mittels einfacher Markdown-Syntax vornehmen können:
  - `**fett**` -> <strong>
  - `*kursiv*` -> <em>
  - `~~durchgestrichen~~` -> <del>
  - `> Zitat` -> <blockquote>
  - `- Punkt` -> <ul>/<li>
  - `1. Punkt` -> <ol>/<li>
  - `\n\n` -> <br><br> (Absatz-Trennung)

### FR-003: Ghost-Mirror Visualisierung (UX)
- Da der Nutzer im Plaintext-Feld nur Symbole (**, *) sieht, MUSS eine visuelle Echtzeit-Vorschau (Mirror) existieren.
- Der Mirror MUSS exakt über dem Eingabefeld liegen, damit der optische Eindruck eines formatierten Briefes erhalten bleibt.
- Der Mirror DARF NICHT fokussierbar oder editierbar sein.
- Beim Tippen MUSS der Mirror ausgeblendet werden (Cursor-Fokus), in der Leseansicht (Blur) MUSS er eingeblendet werden.

### FR-004: Typografische Integrität (Aviation Grade)
- Das System MUSS sicherstellen, dass Absätze nicht durch unschöne Seitenumbrüche zerrissen werden.
- Mindestens 3 Zeilen eines Absatzes MÜSSEN am Seitenende oder -anfang zusammengehalten werden (Widows/Orphans).
- URLs MÜSSEN im Druckmodus voll ausgeschrieben hinter dem Link-Text erscheinen.

## 3. Erfolgskriterien
- **SC-001**: Ein Paste von formatiertem Text aus MS Word in `<din-body>` resultiert in REINEM TEXT ohne HTML-Tags.
- **SC-002**: Die Markdown-Syntax `**Text**` wird im Mirror-Element visuell fett dargestellt.
- **SC-003**: Im PDF-Export (Druck) ist die Markdown-Syntax unsichtbar, nur die Formatierung (Fett/Kursiv) ist zu sehen.
- **SC-004**: Keine "einzelnen Zeilen" auf Folgeseiten bei langen Briefen.
