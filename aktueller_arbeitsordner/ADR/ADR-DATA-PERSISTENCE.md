---
title: "ADR-DATA-PERSISTENCE: Daten-Speicherung & Datumshandling"
status: accepted
date: 2026-07-02
last-reviewed: 2026-07-02
deciders:
  - morit
  - antigravity
type: adr
tags:
  - adr
  - data
  - persistence
  - localstorage
  - temporal
  - datetime
aliases:
  - "Data Persistence"
  - "Speicherung"
  - "Local Storage"
related: 
  - "[[ADR-ANTIPATTERN]]"
  - "[[longevity-guidelines]]"
project: DIN-BriefNEO
---

# ADR-DATA-PERSISTENCE: Daten-Speicherung & Datumshandling

## 1. Context & Problem

**Zuverlässige, wartungsfreie lokale Datenspeicherung.**
- Die Anwendung muss ihre Daten (Inhalte des Briefes, Absenderdaten) zuverlässig lokal speichern können.
- Es gibt keinen Backend-Server und keine Datenbank (`file:///` Ausführung).
- Die W3C `Date()` API ist bekanntermaßen fehleranfällig, asymmetrisch und schwer zu parsen, was besonders bei Brief-Daten zu Problemen führt.

## 2. Considered Options

| Option | Beschreibung | Vorteile | Nachteile | Risiken | Bewertung |
|--------|--------------|----------|-----------|---------|---------|
| **Option A** (LocalStorage + Temporal) | `localStorage` für Daten, W3C `Temporal` API für Daten | Zero Dependencies, 100% lokal, persistiert über Sessions hinweg, exaktes Datumshandling | Speichergrenze ca. 5MB, Temporal braucht auf alten iOS Geräten Fallbacks | Keine | **Gewählt** |
| **Option B** (IndexedDB + Moment.js) | `IndexedDB` für große Daten, `Moment.js` für Daten | Viel Speicherplatz | Asynchron (komplex), Library-Abhängigkeit (bricht Zero-Dependency-Regel) | Hohe Wartungskosten | Abgelehnt |

## 3. Decision

**Wir haben uns für Option A (LocalStorage + Temporal API) entschieden.**

### Begründung
- `localStorage` (via `Storage-API`) ist die einfachste, stabilste und am längsten unterstützte Methode, Key-Value-Daten synchron lokal abzulegen.
- Der aktuelle Briefzustand (Draft) wird in Echtzeit serialisiert und in `localStorage` abgelegt.
- Zur Generierung von Zeitstempeln (z.B. für den PDF-Export oder das Datum-Feld) wird **ausschließlich** die moderne W3C `Temporal` API genutzt (z.B. `Temporal.Now.plainDateISO()`). Die fehleranfällige `Date()` API ist strikt verboten (außer als absolutes Fallback für alte Safari-Versionen).

## 4. Consequences

### Positive Auswirkungen
- **Wartungsfreiheit:** Keine Datenbanken, keine asynchronen Transactions, keine externen Libraries.
- **Offline-First:** Funktioniert nahtlos ohne Internet.
- **Präzision:** Die W3C Temporal API garantiert absolut exakte ISO-Strings und Datumsberechnungen ohne Zeitzonen-Fehler.

### Risiken & Negative Auswirkungen
- `localStorage` ist auf ca. 5-10 MB begrenzt (reicht für Millionen von Text-Briefen, aber nicht für massive Bildanhänge).
- Die W3C Temporal API ist noch relativ neu (erfordert moderne Browser oder einen minimalen Polyfill/Fallback).

## 5. Implementation & Verification

- Die gesamte Speicherlogik ist in `main.js` (`saveDraftData()`, `loadDraftData()`) implementiert.
- Das W3C Temporal API-Mandat ist in den Anti-Pattern Linter-Regeln verankert.
- Ein Fallback auf `Date()` ist für iOS Safari in `main.js` eingebaut.

## 6. Related Documents

- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]
