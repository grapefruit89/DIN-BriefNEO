# SPEC-080: Zero-JS UI Doctrine (Radical Pruning)

## 1. Status Quo
Das UI wird noch zu oft durch JavaScript-Event-Listener und manuelle DOM-Manipulation gesteuert (Themen-Wechsel, Hilfslinien-Toggle, Placeholder-Handling).

## 2. Zielsetzung (Anforderung)
JavaScript wird auf die reine **Fachlogik** (Berechnungen, Datenfluss, Persistenz) reduziert. Das UI steuert sich selbst durch native Browser-Features.
- **State-Holding:** HTML-Checkboxes/Radios halten den UI-Zustand.
- **Reaktivität:** CSS `:has()` und `@property` reagieren auf Zustandsänderungen.
- **Inhalt:** CSS `attr()` übernimmt Platzhalter.
- **Interaktion:** Native Invoker Commands (`commandfor`) ersetzen JS-Click-Handler für Dialoge/Popover.

## 3. Akzeptanzkriterien
- Keine `document.addEventListener('change', ...)` für UI-Toggles mehr.
- Platzhalter werden via CSS `[data-placeholder]` gerendert.
- Themen-Wechsel (Tag/Nacht) erfolgt zu 100% via CSS `:has()`.
- Hilfslinien-Toggle erfolgt zu 100% via CSS `:has()`.
- JS-Code in `ui.js` sinkt um mindestens 30%.
