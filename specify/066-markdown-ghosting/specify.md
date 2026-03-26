---
id: SPEC-066
title: Markdown-Shredder V2 — Zero-Width Ghosting
tags: [aviation-grade, platinum-2026, wysiwyg, integrity, css]
status: draft
version: 1.0.0
traceability: [ADR-008, ADR-011, MANDATE-FREEZE]
source: Platinum Architecture Review 2026
---

# SPEC-066: Markdown-Shredder V2 (Zero-Width Ghosting)

## I. Zielsetzung (Aviation Grade)
Gewährleistung einer 100%igen Übereinstimmung der Zeilenumbrüche zwischen dem Editor (Ghost-Mirror) und dem fertigen Dokument (Print/PDF). Dies wird durch die Erhaltung aller Markdown-Steuerzeichen im Mirror erreicht, wobei diese für die Layout-Engine "gewichtslos" (Breite = 0) gemacht werden.

## II. Fachliche Anforderungen (WHAT)

### FR-001: Non-Destructive Transformation
Der Parser darf Steuerzeichen (*, **, ~~, _, >) nicht löschen. Er muss sie in ein schützendes Element (`<span class="md-marker">`) einwickeln, das die visuelle Formatierung (z.B. `<strong>`) umschließt oder flankiert.

### FR-002: Zero-Width Rendering
Die Marker-Elemente müssen für den Browser-Line-Breaker unsichtbar sein.
- Breite: 0px (zwingend)
- Überlauf: sichtbar (für menschliche Lesbarkeit)
- Interaktion: `pointer-events: none` und `user-select: none`

### FR-003: Kerning-Präzision
Um optisches "Kleben" von Markern an Wörtern zu verhindern, muss ein negativer Margin-Korrektor angewendet werden, der die physische Zeichenbreite im Editor neutralisiert.

### FR-004: EditContext-Offset-Parität
Die Anzahl der logischen Zeichen im `EditContext` muss exakt mit der Anzahl der sichtbaren (inkl. Ghosting) Zeichen im Mirror korrespondieren. HTML-Tags werden hierbei als Metadaten behandelt und dürfen die Selektions-Logik nicht verschieben.

### FR-005: EditContext Input-Capture
Der Input-Ghost (EditContext) muss alle OS-Eingabemethoden (Virtual Keyboard, Handschrift, Spracheingabe) abfangen, ohne dass ein physisches DOM-Element für die Datenhaltung existiert. Das DOM dient nur noch als 'Viewport' für den Mirror.

### FR-006: Atomic Character Bounds
Für die exakte Toolbar-Positionierung muss der EditContext die 'Character Bounds' des Mirrors kennen, damit das Anchor Positioning mathematisch korrekt auf den gerenderten Text (nicht auf den Plaintext) zeigt.

## III. Akzeptanzkriterien
1. Ein Wort, das im Editor mit `**fett**` markiert ist, bricht an exakt derselben Stelle um wie das Wort `fett` im Druck-Modus (wo die Marker ausgeblendet sind).
2. Die `Sanitizer API` lässt die `.md-marker`-Spans ohne Datenverlust passieren.
3. EditContext Events (`textupdate`) triggern die Mirror-Synchronisation verzögerungsfrei (< 16ms).
4. `contenteditable="plaintext-only"` wird durch das EditContext-Objekt als primäre Eingabemethode abgelöst.

## V. RegEx Priority Cascade (Cascading Priority Parsing)
Um Überlappungen zu vermeiden, muss die Transformation in folgender Reihenfolge erfolgen:

1. **Triple-Markers (Fett-Kursiv)**: `/(\*\*\*|___)(.*?)\1/g`  
   → `<strong class="md-bold"><em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em></strong>`
2. **Double-Markers (Fett / Strike)**:  
   - Fett: `/(\*\*|__)(.*?)\1/g` → `<strong class="md-bold"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></strong>`
   - Durchgestrichen: `/(~~)(.*?)\1/g` → `<del class="md-del"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></del>`
3. **Single-Markers (Kursiv / Code)**:  
   - Kursiv: `/(\*|_)(.*?)\1/g` → `<em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em>`
   - Inline-Code: /(`)(.*?)\1/g → `<code class="md-code"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></code>`

## VI. Mathematischer Offset-Beweis (WYSIWYG-Parität)
- **Input (EditContext)**: `**Hallo**` (Length: 9)
- **Output (Mirror HTML)**: `<strong><span>**</span>Hallo<span>**</span></strong>`
- **Mirror textContent**: `**Hallo**` (Length: 9)
- **Ergebnis**: Parität = 100%. Der Cursor-Offset im `EditContext` entspricht exakt der Zeichenposition im Mirror, da der Browser HTML-Tags bei der `textContent`-Länge ignoriert.

## VII. Erweitertes Sanitizer-Gatekeeping
`PLATINUM_SANITIZER_CONFIG` muss `span` und die spezifischen `md-*` Klassen erlauben:
```javascript
const PLATINUM_SANITIZER_CONFIG = {
  allowElements: ['strong', 'em', 'del', 'code', 'span', 'p', 'br', 'blockquote', 'li', 'ul', 'ol'],
  allowAttributes: {
    'class': ['md-marker', 'md-bold', 'md-italic', 'md-del', 'md-code']
  }
};
```
