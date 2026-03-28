---
id: SPEC-066-PLAN
title: Markdown Ghosting Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Ghosting)

## 1. Architektur-Layer

### Layer 1: Cascading Priority Parser (`logic.js`)
Transformation erfolgt in absteigender Komplexität:
1. **Double-Markers:** `**fett**` → `<strong><span class="md-marker">**</span>fett<span class="md-marker">**</span></strong>`
2. **Single-Markers:** `*kursiv*` → `<em><span class="md-marker">*</span>kursiv<span class="md-marker">*</span></em>`
3. **Block-Quotes:** `> zitat` → `<blockquote><span class="md-marker">></span> zitat</blockquote>`

### Layer 2: Zero-Width CSS (`app-ui.css`)
```css
.md-marker {
  display: inline-block;
  width: 0;
  white-space: nowrap;
  overflow: visible;
  opacity: 0.3; /* Visuelles Feedback im Editor */
  user-select: none;
  pointer-events: none;
}
```

### Layer 3: EditContext Integration
- `EditContext` liefert Roh-Text.
- `GhostMirror` rehydriert den Mirror bei jedem `textupdate`.
- Keine DOM-Mutationen im Eingabe-Feld.

## 2. Mathematischer Beweis
- **Input:** `**Text**` (Length: 8)
- **Mirror-Output:** `<strong><span>**</span>Text<span>**</span></strong>`
- **Mirror textContent:** `**Text**` (Length: 8)
- **Result:** Offset-Parität = 100%.

## 3. APIs
- **EditContext API:** Cursor & Selection Management.
- **Sanitizer API:** Validierung der `.md-marker` Spans.
