---
id: SPEC-059-PLAN
title: Persistence & PWA Technical Architecture
status: cemented
version: 4.0.0
---

# 20 â€” Plan: Technische Realisierung (Persistence)

## 1. Architektur-Layer

### Layer 1: State Authority (`js/core/state.js`)
- **Engine:** Proxy-basierter `StateManager`.
- **Sync:** Jede Ã„nderung am IMR-Modell triggert eine asynchrone Serialisierung in den `LocalStorage`.
- **Debouncing:** 500ms Idle-Threshold fÃ¼r SchreibvorgÃ¤nge wÃ¤hrend des Tippens.

### Layer 2: Persistence Storage
- **Primary:** `LocalStorage` fÃ¼r schnellen Boot und Metadaten.
- **Secondary (High-Integrity):** Vorbereitung fÃ¼r `Origin Private File System (OPFS)` zur Journalisierung komplexer Dokumente.

### Layer 3: PWA Service Layer
- **Manifest:** `manifest.json` definiert Icons, Farben und `display: standalone`.
- **Worker:** `sw.js` (Service Worker) implementiert `Cache-First` Strategie fÃ¼r statische Atome.

## 2. APIs & Standards
- **Web Storage API:** Basis-Persistenz.
- **Service Worker API:** Offline-SouverÃ¤nitÃ¤t.
- **File System Access API:** Optional fÃ¼r Native Export/Import.

## 3. Resilience Strategy
- **Versionierung:** State-Objekte tragen ein Version-Tag (IMR 4.0), um Schema-Konflikte bei Updates zu verhindern.
- **Sanity-Check:** Rehydrierung validiert Daten gegen das `Strict Schema Gate`.

