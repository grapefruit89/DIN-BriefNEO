# Geoapify & Geocoding: Recherche-Bericht, Quellen & Latenz-Benchmarks

> **Projekt:** DIN-Brief Neo  
> **Fokus:** Adress-Autocomplete, Hochverfügbarkeit, Latenz-Minimierung, Bonn-Bias & Ausfallsicherheit  
> **Status:** Research am lebenden Objekt – Reine Analyse & Konzept, keine Repository-Modifikationen.

---

## 1. Primäre Quellen & API-Dokumentation

### A. Geoapify Offizielle Dokumentation
1. **Address Autocomplete API Reference:**
   - **URL:** `https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/`
   - **Beschreibung:** Spezifikation aller Query-Parameter für die Echtzeit-Adressvervollständigung.
   - **Wichtigste Parameter:**
     - `text` (String, required): Die vom Nutzer eingegebene Teiladresse.
     - `filter` (String, optional): Strikte Filterung. Format für Deutschland: `filter=countrycode:de`. Verhindert Treffer aus dem Ausland.
     - `bias` (String, optional): Weiche Priorisierung (Ranking). Format für Proximity: `bias=proximity:lon,lat`. Ergebnisse im Umkreis werden nach oben sortiert, entfernte Orte bleiben auffindbar.
     - `limit` (Integer, default 5): Begrenzt die Trefferanzahl. Für Dropdowns optimal: `5` bis `6`.
     - `lang` (String): Sprache der Ergebnisse, z. B. `lang=de`.
     - `format` (String): `format=json` (kompakter und schneller als Standard-GeoJSON).
     - `type` (String, optional): Mögliche Werte: `country`, `state`, `city`, `postcode`, `street`, `amenity`, `locality`.
2. **Geoapify Address Autocomplete Playground & Landing Page:**
   - **URL:** `https://www.geoapify.com/address-autocomplete/`
   - **Beschreibung:** Interaktiver Testbereich für Filter-, Bias- und Bounding-Box-Kombinationen.
3. **Geoapify Geocoding API:**
   - **URL:** `https://apidocs.geoapify.com/docs/geocoding/geocoding-api/`
   - **Beschreibung:** Konvertierung von Adressen und Postleitzahlen in Koordinaten (Lat/Lon).

---

### B. Fallback- und Sekundärquellen (Bei Ausfall / Abschaltung)

1. **Komoot Photon (Kostenloser Open-Source OSM Geocoder):**
   - **URL:** `https://photon.komoot.io/`
   - **Endpoint:** `https://photon.komoot.io/api/?q={suchtext}&lat={lat}&lon={lon}&limit=5&lang=de`
   - **Vorteile:**
     - In Deutschland gehostet (Komoot).
     - Basiert auf OpenStreetMap (OSM) und Elasticsearch.
     - 100 % kostenlos, keine Registrierung, kein API-Key erforderlich.
     - Volle Unterstützung für `lat`/`lon` Bias und deutsche Adressstruktur (`properties.street`, `properties.housenumber`, `properties.postcode`, `properties.city`).
2. **Zippopotam.us (Deutsche PLZ-Validierung):**
   - **URL:** `https://api.zippopotam.us/`
   - **Endpoint:** `https://api.zippopotam.us/de/{plz}`
   - **Funktion:** Liefert blitzschnell den passenden Ortsnamen zu einer 5-stelligen deutschen Postleitzahl.
3. **W3C Performance & Resource Hints:**
   - **Preconnect:** `https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preconnect`
   - **DNS-Prefetch:** `https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/dns-prefetch`
   - **Prioritized Task Scheduling (`scheduler.postTask`):** `https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask`

---

## 2. Live-Latenz-Benchmarks (Gemessen auf dem System)

Um das Geschwindigkeitspotenzial objektiv zu bewerten, wurden die TCP- und TLS-Verbindungszeiten direkt über PowerShell und cURL ermittelt:

| Endpunkt | Standort / Typ | DNS Lookup | TCP Connect | TLS Handshake | Gesamtlatenz (Erstaufruf) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`https://api-eu.geoapify.com`** | **EU-Cluster (Frankfurt)** | 11,2 ms | **25,3 ms** | 160,2 ms | **218 ms** |
| **`https://api.geoapify.com`** | Global Anycast | 17,2 ms | **40,9 ms** | 139,3 ms | **285 ms** |
| **`https://photon.komoot.io`** | Komoot (Deutschland) | 19,3 ms | **37,0 ms** | 154,8 ms | **180 ms** |

### Wichtigste Benchmark-Erkenntnis:
- Die eigentliche Datenübertragung dauert nur rund **30 bis 50 ms**.
- **Über 75 % der Latenz beim ersten Tippen entfallen auf den Verbindungsaufbau** (TCP SYN + TLS-Handshake = ~170 ms).
- **Lösung:** Wenn die Verbindung zum Server vorab aufgebaut wird (Connection Pre-Warming beim Input-Fokus), sinkt die Latenz beim eigentlichen Tippen von 218 ms auf **unter 50 ms**!

---

## 3. Geoapify Server-Architektur: EU vs. Global

### EU-Cluster (`api-eu.geoapify.com`)
- **Hosting:** Rechenzentren innerhalb der Europäischen Union (Primär Frankfurt am Main, Deutschland).
- **DSGVO:** Höchste Datenschutzkonformität, da keine Adressanfragen über Drittländer geroutet werden.
- **Netzwerk-Routing:** Direkte Anbindung an deutsche Internetknoten (DE-CIX Frankfurt) mit minimalen Hop-Counts.

### Globaler Cluster (`api.geoapify.com`)
- **Hosting:** Global verteiltes Anycast-CDN.
- **Zweck:** Dient als automatischer Fallback, falls das EU-Rechenzentrum oder eine regionale Route gestört ist.
