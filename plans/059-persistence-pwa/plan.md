---
id: PLAN-059
spec: SPEC-059
title: Smart Save & PWA Setup
status: active
anti-patterns: [ANTI-014, ANTI-020]
adr: ADR-016
---

# Plan: Smart Save & PWA Implementation (HOW)

## 1. Smart Auto-Save (JS Logic)
Wir implementieren eine `debounce` Funktion für das `input` Event auf dem Briefpapier.

**Blueprint:**
```javascript
const autoSave = debounce(() => this._syncDOMToState(), 1500);
document.getElementById('paper').addEventListener('input', autoSave);
```
- Vorteil: JS führt die schwere `readDOMasJSON()` Operation nur aus, wenn der Nutzer eine Pause macht.

## 2. Desktop PWA (Infrastruktur)
Wir erstellen zwei neue Core-Dateien:
- `manifest.json`: Definiert Name, Icons und Standalone-Modus.
- `sw.js` (Service Worker): Ermöglicht Offline-Start und erfüllt die PWA-Kriterien.

## 3. Web App Manifest Highlights
- `display: standalone`: Entfernt die Browser-Leiste.
- `theme_color`: Passend zum DIN-Brief-Look (#121212).
- `icons`: Nutzung eines hochauflösenden SVG-Icons.
