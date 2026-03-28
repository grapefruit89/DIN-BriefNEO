# TECH-SPEC: THE NO-JS DOCTRINE & NATIVE BASELINE (v1.0.0)
# Status: CEMENTED | Doctrine: Aviation Grade Platinum | Stand: März 2026

## I. OBERSTES GEBOT: LOGIC-LITE ARCHITEKTUR
JavaScript existiert ausschließlich als unsichtbare Fachlogik (Der Ghost). Der Browser (Chrome 147+ Engine) übernimmt das Rendering und Layout nativ (Der Mirror). Jede Form von DOM-Manipulation für Layoutzwecke ist ein fataler Architekturfehler.

---

## 1. The Ghost-Mirror Pattern (Eingabe- & DOM-Isolation)
- **Plaintext-Only Versiegelung:** Jedes IMR-Eingabefeld (z.B. `<din-body>`) ist zwingend auf `contenteditable="plaintext-only"` gesetzt. Dies blockiert XSS und DOM-Verschmutzung auf Engine-Ebene.
- **EditContext API:** Die Eingabe wird über die native EditContext API gepuffert. Der Browser übergibt Events direkt an die Vanilla-JS-Datenmatrix, ohne das DOM eigenständig zu verändern.
- **Custom Highlight API:** Formatierungen (Markdown, Marker) werden ausschließlich über `::highlight()` projiziert. Der Text im DOM bleibt reiner, unformatierter Text (Isomorphie-Garantie).

## 2. Native C++ Geometrie & Tethering (Layout ohne JS)
- **CSS Anchor Positioning:** IMR-Felder dienen als Koordinaten-Anker (`anchor-name`). UI-Elemente werden via `position-anchor` physisch an diese Felder gefesselt.
- **Fragmentierungs-Schutz:** Zwingende Nutzung von `position-visibility: anchors-visible`. Overlays werden bei Seitenumbrüchen (Paged Media) nativ ausgeblendet, wenn ihr Anker nicht sichtbar ist.
- **Anchor-Scoping:** Isolation von Koordinatensystemen via `anchor-scope` innerhalb von `<a4-page>` Containern.

## 3. Kinetische UI & Intrinsic Sizing (Performance ohne Observer)
- **Scroll-State Queries:** Status-Abfragen (wie Sticky-Header) erfolgen nativ über `@scroll-state(stuck: top)`. Scroll-Listener (TOMB-V002) sind verboten.
- **Elastic UI (Field-Sizing):** Die Höhe von Textfeldern wird nativ durch `field-sizing: content` gesteuert. Intrinsic Guards (`max-height`) schützen die Layout-Stabilität.
- **Invoker Commands:** Deklarative HTML-Attribute (`commandfor`, `command`) steuern Dialoge und Popover ohne JS-Event-Listener.

## 4. Die integrierten Architektur-Diamanten (Fachlogik)
- **Anti-FOUC Boot:** Initiales UI-Rendering nutzt `@starting-style` für flackerfreie Übergänge nach dem IMR-Load.
- **Salutation Engine:** Deterministische State-Machine im Vanilla-JS für die Briefanreden-Logik.
- **Smart Document Title:** Deterministische Generierung des Dateinamens/Titels via Temporal API aus dem Betreff-Feld.

---
**GEZ. LEAD SYSTEMS ARCHITECT**
"Aviation Grade bedeutet: Fehler müssen strukturell unmöglich sein."