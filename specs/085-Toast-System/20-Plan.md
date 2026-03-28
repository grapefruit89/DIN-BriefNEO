# SPEC-085-Plan: Toast Implementation

## 1. Technisches Design
Wir führen zwei neue Module ein: `toast-registry.js` (Daten) und `toast-manager.js` (UI-Logik).

### Komponenten:
1.  **TOAST_REGISTRY:** Ein Objekt-Dictionary mit IDs als Keys.
2.  **ToastManager Class:** Verwaltet die `queue[]`, den `activeToast` und den DOM-Container.
3.  **CSS:** Styling in `app-ui.css` mit `@starting-style` für die Entry-Animation.

## 2. Implementierungsschritte
1.  **Registry erstellen:** Initiales Set an Meldungen (Save, Export, IBAN-Error, Frist).
2.  **Manager implementieren:** Singleton-Export (`toast`).
3.  **Refactoring:** Ersetzen der alten `console.info` oder manuellen Toasts in `ui.js`.
4.  **CSS:** Hinzufügen der Klassen für die verschiedenen Toast-Typen.
