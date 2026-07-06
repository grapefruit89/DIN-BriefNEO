---
aliases:
- Geoapify Guide
created: '2026-07-06'
depends_on: []
last-updated: 2026-07-02
project: DIN-BriefNEO
related:
- '[[ADR-GEOAPIFY'
status: active
tags:
- guide
- documentation
- geoapify
- autocomplete
title: 'Guide: Geoapify Autocomplete Implementierung'
type: guide
updated: '2026-07-06'
---

# Guide: Geoapify Autocomplete Implementierung

> [!tip] Was ist dieser Guide?
> Dieser Guide beschreibt, wie wir die Geoapify Autocomplete API in DIN-Brief Neo einsetzen, **ohne** externe Bibliotheken (wie `@geoapify/geocoder-autocomplete`) zu laden, um strikt WYSIWYG und Zero-Dependencies zu wahren.

## 1. Einleitung & Zielsetzung

Um die Empfängeradresse im DIN-Brief autovervollständigen zu können, nutzen wir die REST API von Geoapify. Ein externes Brainstorming hat aufgezeigt, dass Debouncing, Limitierungen und "Proximity Biasing" (Bevorzugen von lokalen Adressen) extrem wichtig für Performance und User Experience sind.

## 2. Best Practices der Implementierung

Wir haben die folgenden Best Practices direkt in unserem Custom Fetch-Wrapper in `main.js` umgesetzt:

- **Regel 1: Debouncing (300ms)**
  - Wir senden nicht bei jedem Tastendruck einen Request. Stattdessen warten wir 300ms, bis der Nutzer aufhört zu tippen. Das schont das API-Limit massiv.
- **Regel 2: Strikte Limits (`limit=5`)**
  - Wir rufen maximal 5 Ergebnisse ab. Ein zu langes Dropdown bricht das Layout und verschlechtert die Performance.
- **Regel 3: Dynamischer Proximity Bias**
  - Statt hartcodierten Koordinaten (z. B. Bonn) lesen wir dynamisch die PLZ des **Absenders** aus. Die API liefert dann zuerst Ergebnisse in der Nähe des Absenders.

### Code-Beispiele (Custom Fetch vs. Library)

Nutze Diff-Blöcke (`diff`), um zu veranschaulichen, warum wir die offizielle Library meiden:

```diff
- import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
- const autocomplete = new GeocoderAutocomplete(container, 'API_KEY');
+ // Neuer Zero-JS/WYSIWYG Ansatz via native fetch()
+ let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&lang=de&limit=5`;
+ if (coords) url += `&bias=proximity:${coords.lon},${coords.lat}`;
+ const res = await fetch(url, { headers: { "X-Api-Key": key } });
```

### Syntax Highlighting: Das Caching

Langfristig kann (wie im Brainstorming vorgeschlagen) ein In-Memory-Cache implementiert werden, um doppelte Abfragen (z.B. wenn der User Rücktaste drückt) abzufangen:

```javascript
// Geplantes In-Memory-Cache (zukünftige Optimierung)
const geoCache = new Map();

async function cachedGeoFetch(query, coords) {
  const cacheKey = query + (coords ? coords.lat : '');
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey);
  
  // fetch...
  geoCache.set(cacheKey, data);
  return data;
}
```

## 3. Komplexere Zusammenhänge

<details>
<summary>Deep Dive: Woher kommen die Bias-Koordinaten? (Klicken)</summary>
Die Geoapify API erfordert für das `bias=proximity` Argument Breiten- und Längengrade (Latitude/Longitude). Da der Nutzer in einem DIN-Brief oft seinen eigenen Wohnort eingibt (z.B. "53111 Bonn"), haben wir einen separaten Hook eingebaut: Sobald der Nutzer seine PLZ im Absenderfeld tippt, fragen wir im Hintergrund die freie API `zippopotam.us` ab. Diese liefert uns die Lat/Lon-Koordinaten der Absender-PLZ zurück. Diese Koordinaten speichern wir im `localStorage` (`din_sender_coords`) und hängen sie als dynamischen Bias an jeden Geoapify-Request an. Das führt dazu, dass jemand aus Hamburg primär Hamburger Adressen vorgeschlagen bekommt.
</details>

## 4. Feature Checks

Da wir auf nativem `fetch` und modernem ES6 basieren:

```javascript feature-check
// f("Geoapify Native Fetch", typeof globalThis.fetch === "function", "Chrome 42", "Produktiv")
```


## 3. Fehlerbehandlung & Fallback-Strategie
Da externe APIs ausfallen können (Rate Limits, Offline-Szenarien, API-Downtime), muss die Fehlerbehandlung robust sein.
Schlägt der Request an Geoapify fehl, werfen wir keinen UI-blockierenden Fehler, sondern fangen diesen ab und wechseln – sofern konfiguriert – sofort auf den kostenlosen Photon Fallback-Provider, oder stoppen die Autocomplete-Vorschläge einfach leise (Graceful Degradation).

## 4. Rate Limiting & Performance
Die Geoapify API hat in der kostenlosen Stufe strikte Limits (z.B. 3.000 Requests pro Tag).
Das strenge Debouncing (300-500ms) und ein geplantes, lokales **Caching** von Suchbegriffen (aktuell noch in Planung / noch nicht implementiert) sind unsere primären Abwehrwerkzeuge gegen das Limit.

## 5. Datenschutz (Privacy)
Geoapify erhält den gesuchten Adressstring sowie die berechneten GPS-Koordinaten (für das Proximity Biasing).
**WICHTIG:** Es werden **keine** persönlichen Absenderdaten, Namen oder Briefinhalte an den Dienst übertragen.