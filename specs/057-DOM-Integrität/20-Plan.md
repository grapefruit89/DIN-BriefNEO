---
id: SPEC-057-PLAN
title: DOM-First Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (DOM-First)

## 1. Architektur-Konzept
Maximale Entlastung des JS-Main-Threads durch native Browser-Features.

### Layer 1: Persistence Engine (`Batch-Save`)
- **Triggers:** `blur`, `focusout`, und `window.onbeforeunload`.
- **Logic:** `StateManager.save()` liest alle Atome (`IMR 4.0`) gesammelt aus und schreibt in den `LocalStorage`.
- **Zero-JS Typing:** Keine `input`-Event-Listener für reine Daten-Spiegelung.

### Layer 2: UI-Anchoring (Chrome 147 API)
- **Target:** `#editor-toolbar`.
- **Binding:** `position-anchor: --active-anchor;` (via JS gesetzt beim Focus).
- **Positioning:** `position-area: top center;` für flüssiges Gleiten.
- **CSS-Anker-Mapping:**
  ```css
  din-text { anchor-name: --anchor-text; }
  din-subject { anchor-name: --anchor-subject; }
  /* ... (weitere Atome) */
  ```
- **JS-Tethering:**
  ```javascript
  paper.addEventListener("focusin", e => {
    const tag = e.target.tagName.toLowerCase();
    if (tag.startsWith("din-")) {
      document.documentElement.style.setProperty("--active-anchor", `--anchor-${tag.slice(4)}`);
    }
  });
  ```


### Layer 3: Label Protection
- **Method:** Nutzung von CSS `::before` oder separaten `<label>` Tags außerhalb des `contenteditable` Scopes.
- **IMR Integration:** Atome enthalten nur den puren Datenwert, keine statischen Labels.

## 2. APIs & Standards
- **CSS Anchor Positioning API:** Native UI-Bindung.
- **Page Visibility API:** Zuverlässige Persistierung beim Schließen des Tabs.
- **EditContext API:** Isoliertes Input-Handling.
