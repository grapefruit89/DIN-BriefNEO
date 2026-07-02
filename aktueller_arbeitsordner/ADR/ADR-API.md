---
title: "ADR-API: External Services & APIs (Geoapify, Zippopotam & Header Security)"
status: accepted
date: 2026-05-24
last-reviewed: 2026-07-02
deciders:
  - morit
  - antigravity
type: adr
tags:
  - adr
  - api
  - autocomplete
  - security
  - geoapify
  - zippopotam
aliases:
  - "External API Integrations"
  - "Header Security"
  - "Geoapify Autocomplete"
related: 
  - "[[ADR-HTML]]"
  - "[[ADR-JS]]"
  - "[[ADR-FEATURE]]"
  - "[[longevity-guidelines]]"
project: DIN-BriefNEO
---

# ADR-API: External Services & APIs

## 1. Context & Problem

**Sichere, serverlose Adress-Vervollständigung und externe Datenabfragen.**
- Viele Autocomplete-Lösungen (wie Google Places) benötigen dicke SDKs und zwingen Nutzer zur Kreditkartenangabe. Offizielle Libraries (z.B. `@geoapify/geocoder-autocomplete`) injizieren schwer anpassbare DOM-Elemente und brechen unsere WYSIWYG-Regel.
- DIN-BriefNEO benötigt ein schnelles, datenschutzkonformes API-Konzept, das vollständig im lokalen Kontext (`file:///` oder lokaler Webserver) läuft, ohne Backend-Server.
- API-Keys dürfen nicht via URL-Parameter geleakt werden.
- Lokale Treffer (beim Geo-Autocomplete) sollen per Proximity Bias zuerst erscheinen.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Geoapify + Header-Auth + Custom Fetch) | Native Nutzung per `fetch()`, Key im Header (`X-Api-Key`), natives CSS-Anchor-Popover für Resultate | Zero SDK, höchste Sicherheit vor Leaks, 100% WYSIWYG-Treue | Caching muss selbst programmiert werden | Keine | **Gewählt** |
| **Option B** (Google SDK) | Google Places Library laden | Bekannt, hohe Datenqualität | Zwang zu Kreditkarte, schwergewichtiges JS | Datenschutz | Abgelehnt |
| **Option C** (Offizielle NPM Library) | `@geoapify/geocoder-autocomplete` nutzen | Schnell implementiert | Zerstört WYSIWYG durch eigene DOM-Elemente | Bundle-Size | Abgelehnt |
| **Option D** (Photon API) | Kostenloses OSM-Backend | Kein Key nötig | Zu schlechte Datenqualität | Usability | Abgelehnt (Deprecated) |

## 3. Decision

**Wir haben uns für Option A (Geoapify & Zippopotam REST APIs via Custom Fetch) entschieden.**

### Begründung
- **Zero-Dependency:** Der Verzicht auf NPM-Libraries entspricht der Zero-JS-Philosophie.
- **Header-Security:** Der API-Key wird **strikt per HTTP-Header** (`X-Api-Key`) gesendet, niemals in der URL. Das verhindert Leaks.
- **Natives UI:** Das Resultat-Popover verankert sich nahtlos über W3C CSS Anchor Positioning, das DOM bleibt sauber von Fremdelementen.
- **Dynamischer Proximity Bias:** Statt eines statischen Fallbacks ermittelt die Logik via Zippopotam (`api.zippopotam.us`) die `lat`/`lon` der eingegebenen 5-stelligen Absender-PLZ und nutzt diese für `bias=proximity` bei Geoapify.
- **Performance:** Strenges Debouncing (`300ms`), Limits (`limit=5`) und `AbortController` halten API-Calls minimal und verhindern Race Conditions.

## 4. Consequences

### Positive Auswirkungen
- **Maximale Kontrolle & WYSIWYG-Treue:** Das DOM bleibt zu 100% in unserer Hand.
- **Hohe Sicherheit:** Keys leaken nicht in Server-Logs oder Proxys.
- **Top Performance & Relevanz:** Adressen in der Nähe des Absenders werden priorisiert. Überflüssige Requests werden abgebrochen.

### Risiken & Negative Auswirkungen
- Setzt aktive Internetverbindung voraus für Autocomplete (manuelle Eingabe geht weiterhin offline).
- Caching muss bei Bedarf selbst (oder durch AbortController/Debouncing) verwaltet werden.

## 5. Implementation & Verification

- Die Header-Security-Regel ist in `main.js` für jeden Geoapify-Aufruf verankert.
- Photon wurde restlos als Antipattern deklariert.
- Das Dropdown ist als `popover="manual"` mit CSS Anchor an das Eingabefeld gebunden.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-JS]]
- [[ADR-FEATURE]]
- [[longevity-guidelines]]

---

### Feature Checks

```javascript feature-check
f("Geoapify Autocomplete", typeof globalThis.fetch === "function", "Chrome 42", "Produktiv"),
f("CSS Anchor Positioning", CSS.supports("anchor-name: --test"), "Chrome 125", "Produktiv")
```