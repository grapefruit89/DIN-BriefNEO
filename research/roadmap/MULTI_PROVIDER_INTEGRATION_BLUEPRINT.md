# Multi-Provider Adress-Architektur: Integrations-Blueprint

> **Status:** Konzept & Architektur-Plan (Reine Analyse, keine Änderungen am Produktiv-Repository).  
> **Ziel:** Nahtlose Abstraktionsschicht für Geoapify, HERE Technologies und schlüssellose Open-Source-Dienste.

---

## 1. Modulares Provider-Interface

Um dem Nutzer die freie Wahl zu lassen und eine saubere Codebasis zu gewährleisten, wird ein einheitliches Adress-Interface definiert. Jeder Provider implementiert lediglich dieselbe standardisierte Methode:

```text
search(query, { coords, signal }) => Promise<AddressEntry[]>
```

Jedes Ergebnis wird auf das interne Standardformat normalisiert:
- `street`: Straßenname (ohne Hausnummer)
- `housenumber`: Hausnummer
- `postcode`: 5-stellige deutsche Postleitzahl
- `city`: Stadtname
- `formatted`: Vollständiger einzeiliger Text
- `source`: Name des Anbieters (z. B. "geoapify", "here", "photon", "local")

---

## 2. Die 3 Provider-Adapter im Überblick

### Adapter 1: Geoapify (`GeoapifyProvider`)
- **Endpunkt:** `https://api-eu.geoapify.com/v1/geocode/autocomplete`
- **Fallback:** `https://api.geoapify.com/v1/geocode/autocomplete`
- **Parameter:**
  `text={query}&apiKey={key}&lang=de&limit=5&format=json&filter=countrycode:de&bias=proximity:{lon},{lat}`
- **Bonn-Standard:** `lon=7.0982, lat=50.7374`

### Adapter 2: HERE Technologies (`HereMapsProvider`)
- **Endpunkt:** `https://autocomplete.search.hereapi.com/v1/autocomplete`
- **Parameter:**
  `q={query}&apiKey={key}&lang=de&limit=5&in=countryCode:DEU&at={lat},{lon}`
- **Besonderheit:** Extrem hohes Free Tier (250.000 monatlich). Koordinaten-Format ist `at=lat,lon` (im Gegensatz zu Geoapifys `proximity:lon,lat`).
- **Parsing:** Liefert strukturierte Felder unter `item.address.street`, `item.address.houseNumber`, `item.address.postalCode`, `item.address.city`.

### Adapter 3: Komoot Photon / OpenPLZ (`ZeroConfigProvider`)
- **Endpunkt:** `https://photon.komoot.io/api/`
- **Parameter:**
  `q={query}&limit=5&lang=de&lat={lat}&lon={lon}`
- **Besonderheit:** **Kein API-Key erforderlich!** Dient als Standard-Einstellung für Erstbesucher und als automatischer Notfall-Fallback, falls bei Geoapify oder HERE ein Kontingent erschöpft ist (HTTP 429) oder ein Key abgelaufen ist.

---

## 3. UX-Konzept für die Benutzeroberfläche

In der Adressleiste oder den Einstellungen von DIN-Brief Neo:

1. **Provider-Dropdown:**
   - `[Option 1] Schlüssellos (Komoot Photon / OpenPLZ) – Sofort aktiv, kein Key nötig`
   - `[Option 2] Geoapify (3.000/Tag) – Deutsches EU-Cluster (Standard)`
   - `[Option 3] HERE Technologies (250.000/Monat) – Enterprise-Karten`

2. **Dynamisches Key-Feld:**
   - Bei Option 1: Das API-Key-Eingabefeld wird ausgeblendet oder zeigt „Kein Key erforderlich (Kostenlos)“.
   - Bei Option 2 oder 3: Das Eingabefeld fordert den jeweiligen API-Key an und bietet einen direkten Link zur kostenlosen Registrierung.

3. **Intelligente Fallback-Kaskade (Resilienz):**
   - Ist Option 2 oder 3 gewählt, aber der Key ungültig oder das Tageslimit erreicht ➔ Die Suche bricht **nicht** mit einem Fehler ab, sondern schaltet für den Nutzer unbemerkt auf Option 1 (Schlüssellos) um, damit der Brief ohne Frust weitergeschrieben werden kann.
