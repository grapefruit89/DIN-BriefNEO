# SPEC-085: Centralized Toast Registry & Queue

## 1. Status Quo
Toast-Meldungen sind im Code verteilt (hardcodierte Texte). Bei mehreren Ereignissen stapeln sich Toasts unschön am Bildschirmrand und verdecken das DIN-5008 Layout.

## 2. Zielsetzung (Anforderung)
Einführung einer zentralen Registry für alle System-Meldungen und eines Queue-Managers, der sicherstellt, dass immer nur **ein** Toast gleichzeitig sichtbar ist.
- **Registry:** Alle Texte, Typen (Success, Error, Info) und Dauern an einem Ort (`js/core/toast-registry.js`).
- **Queue-Manager:** Neue Toasts warten in einer Warteschlange, bis der aktuelle Toast verschwunden ist.
- **Visuals:** Kein Stapeln mehr. Sanfter Austausch der Meldungen.
- **Entry-Animation:** 100% JS-frei via CSS `@starting-style`.

## 3. Akzeptanzkriterien
- Keine hartcodierten Strings für Meldungen mehr in `ui.js`.
- Aufruf erfolgt nur noch via `toast.show('ID')`.
- Maximal ein sichtbarer Toast im DOM.
- Unterstützung für Platzhalter (z. B. `{date}`).
