---
id: PLAN-058
spec: SPEC-058
title: UI Polish & Instant-Load Blueprint
status: active
anti-patterns: [ANTI-020]
adr: ADR-015
---

# Plan: UI Polish & Instant-Load (HOW)

## 1. ANTI-FOUC Script (index.html)
Wir injizieren ein minimales Block-Skript in den `<head>`, um die CSS-Variable `--layout` sofort wiederherzustellen.

```html
<script>
  (function() {
    const layout = localStorage.getItem('neo_layout') || 'form-b';
    document.documentElement.style.setProperty('--layout', layout);
  })();
</script>
```

## 2. Toast & Statusbar Styling (sidebar.css)
- **Statusbar**: Einsatz von `backdrop-filter: blur(8px)` und runden Ecken.
- **Toasts**: CSS-Keyframe Animation `toastIn` und semantische Farben.

## 3. Sidebar Scrollbar
Subtiles Styling für den Chrome-Browser:
```css
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb { background: #333; }
```

## 4. Nutzen
Die App fühlt sich ab der ersten Millisekunde professionell und stabil an.
