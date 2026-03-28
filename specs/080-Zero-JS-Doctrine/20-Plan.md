# SPEC-080-Plan: JavaScript-Pruning

## 1. Technisches Design
Wir nutzen die neue **CSS :has() API**, um JavaScript-Logik in das CSS zu verlagern. 

### Meilensteine:
1.  **CSS Placeholders:** `[data-placeholder]` in `app-ui.css` so definieren, dass sie bei `:empty` erscheinen.
2.  **HTML-State:** Die Radio-Buttons für "Guides", "Layout" und "Theme" werden im HTML so platziert, dass CSS sie via `:has()` oder `~` (Sibling) abfragen kann.
3.  **JS Removal:** Löschen der `document.addEventListener('change', ...)` Logik in `ui.js`.
4.  **Signal-Cleanup:** Sicherstellen, dass die State-Synchronisierung (JSON <-> DOM) weiterhin stabil bleibt.

## 2. Implementierungsschritte
1.  **CSS Refactoring:** Definition der `:has()` Selektoren im `:root`.
2.  **HTML Update:** Sicherstellen, dass Inputs IDs haben, auf die CSS zugreifen kann.
3.  **UI.js Cleanup:** Löschen der UI-Toggle-Listener.
