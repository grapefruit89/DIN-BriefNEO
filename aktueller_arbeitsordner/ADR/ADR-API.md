---
title: "ADR-API: External API Integrations & Header Security"
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
related: 
  - "[[ADR-HTML]]"
  - "[[ADR-JS]]"
  - "[[ADR-FEATURE]]"
  - "[[longevity-guidelines]]"
project: DIN-BriefNEO
---

# ADR-API: External API Integrations & Header Security

## 1. Context & Problem

**Sichere, serverlose Adress-Vervollständigung.**
- Viele Autocomplete-Lösungen (wie Google Places) benötigen dicke SDKs und zwingen Nutzer zur Kreditkartenangabe.
- DIN-BriefNEO benötigt ein schnelles, datenschutzkonformes API-Konzept, das vollständig im lokalen Kontext (`file:///`) läuft, ohne Backend-Server.
- API-Keys dürfen nicht via URL-Parameter geleakt werden.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (Geoapify + Header-Auth) | Nutzung der REST-API via nativem `fetch()`, Key im Header (`X-Api-Key`) | Zero SDK, höchste Sicherheit vor Leaks, kostenloser Tier reicht | Benötigt eigenen API-Key | Keine | **Gewählt** |
| **Option B** (Google SDK) | Google Places Library laden | Bekannt, hohe Datenqualität | Zwang zu Kreditkarte, schwergewichtiges JS | Datenschutz | Abgelehnt |
| **Option C** (Photon API) | Kostenloses OSM-Backend | Kein Key nötig | Zu schlechte Datenqualität | Usability | Abgelehnt (Deprecated) |

## 3. Decision

**Wir haben uns für Option A (Geoapify & Zippopotam REST APIs) entschieden.**

### Begründung
- **Geoapify:** Einziger Provider für Adress-Autocomplete. Der API-Key wird **strikt per HTTP-Header** (`X-Api-Key`) gesendet, niemals in der URL.
- **Heartbeat:** Eingegebene Keys werden per asynchronem Test (`limit=1`) sofort auf Validität geprüft.
- **Zippopotam:** Die kostenfreie API (`api.zippopotam.us`) wird für das Auto-Ausfüllen von Ortsnamen bei 5-stelliger PLZ genutzt.
- **Race-Condition-Schutz:** Alle API-Aufrufe (`fetch()`) werden durch `AbortController` abgebrochen, wenn eine neue Eingabe erfolgt.

## 4. Consequences

### Positive Auswirkungen
- **Hohe Sicherheit:** Keys leaken nicht in Server-Logs oder Proxys.
- **Zero-Dependency:** Komplett nativ per `fetch()` gelöst, keine SDKs.
- **Top Performance:** AbortController verhindert überflüssige Netzwerk-Requests.

### Risiken & Negative Auswirkungen
- Setzt aktive Internetverbindung voraus für Autocomplete (manuelle Eingabe geht weiterhin offline).

## 5. Implementation & Verification

- Die Header-Security-Regel ist in `main.js` für jeden Geoapify-Aufruf verankert.
- Photon wurde restlos als Antipattern deklariert und aus dem Projekt entfernt.

## 6. Related Documents

- [[ADR-HTML]]
- [[ADR-JS]]
- [[ADR-FEATURE]]
- [[longevity-guidelines]]