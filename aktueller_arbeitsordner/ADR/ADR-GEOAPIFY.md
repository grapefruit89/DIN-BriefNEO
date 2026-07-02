---
title: "ADR-GEOAPIFY: Adress-Autocomplete mit Geoapify"
status: accepted
date: 2026-07-02
last-reviewed: 2026-07-02
deciders: [morit, antigravity]
type: adr
tags: [adr, geoapify, api, autocomplete]
aliases: ["Adress API", "Geoapify Autocomplete"]
related: 
  - "[[ADR-ANTIPATTERN]]"
  - "[[ADR-API]]"
project: DIN-BriefNEO
---

# ADR-GEOAPIFY: Adress-Autocomplete mit Geoapify

## 1. Context & Problem

**Performantes Autocomplete ohne DOM-Injektionen.**
- Die Eingabe von Empfängeradressen im `<din-anschriftfeld>` soll den Nutzer bestmöglich unterstützen.
- Lokale Treffer sollen zuerst erscheinen (Proximity Bias).
- Die offizielle Geoapify-Library (`@geoapify/geocoder-autocomplete`) injiziert eigene schwer anpassbare DOM-Elemente und bricht damit unsere WYSIWYG-Regel.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Custom Fetch + CSS Anchor) | 100% nativ: Eigener Fetch + natives Popover mit CSS Anchor Positioning | Zero Dependencies, 100% WYSIWYG-Treue | Caching muss selbst programmiert werden | Keine | **Gewählt** |
| **Option B** (Offizielle NPM Library) | Nutzung von `@geoapify/geocoder-autocomplete` | Schnell implementiert, Caching eingebaut | Zerstört WYSIWYG durch eigene DOM-Elemente, Bundle-Size +40KB | Wartung | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (Custom Fetch + Native CSS Anchor) entschieden.**

### Begründung
- **Keine Dependencies:** Der Verzicht auf NPM-Libraries entspricht der Zero-JS-Philosophie.
- **Natives Dropdown:** Das Resultat-Popover verankert sich nahtlos über W3C CSS Anchor Positioning.
- **Dynamischer Proximity Bias:** Statt einem statischen Fallback (z.B. Bonn) extrahiert die Logik die PLZ des Absenders, ermittelt via Zippopotam die `lat`/`lon` und nutzt diese für `bias=proximity` bei Geoapify.
- **Performance:** Strenges Debouncing (`300ms`) und Limits (`limit=5`) halten die API-Calls minimal.

## 4. Consequences

### Positive Auswirkungen
- **Maximale Kontrolle:** Das DOM bleibt sauber, keine Fremd-Elemente.
- **Hohe Relevanz:** Der dynamische Bias sorgt dafür, dass Adressen in der Nähe des Absenders priorisiert werden.

### Risiken & Negative Auswirkungen
- Caching muss bei Bedarf selbst in einer `Map` verwaltet werden (aktuell durch AbortController und Debouncing gut abgefangen).

## 5. Implementation & Verification

- Der Custom Fetch ist in `main.js` implementiert.
- Das Dropdown ist als `popover="manual"` mit CSS Anchor an das Eingabefeld gebunden.

## 6. Related Documents

- [[ADR-API]]
- [[ADR-ANTIPATTERN]]

---

### Feature Checks

```javascript feature-check
f("Geoapify Autocomplete", typeof globalThis.fetch === "function", "Chrome 42", "Produktiv"),
f("CSS Anchor Positioning", CSS.supports("anchor-name: --test"), "Chrome 125", "Produktiv")
```
