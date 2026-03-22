---
id: SPEC-006
title: PWA Readiness
tags: [specification, din-5008, platin]
status: cemented
weight: 100
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: PWA Readiness

**Pattern Source**: `[PAT-NK-03]` (Niekes/brief)

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-SYS-PWA]`
- **Lexicon Check**: "PWA", "Manifest", "Service Worker", "Installable".
- **Principle Check**: **VII. OFFLINE SOVEREIGNTY**: The app MUST be fully functional offline. **X. DESKTOP FIRST**: Focus on Desktop installation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App auf Desktop installieren (Priority: P2)
Als Anwender möchte ich die Webseite als eigenständiges Programm auf meinem Desktop installieren können, um schneller darauf zuzugreifen.

**Why this priority**: Erhöht die Bindung und Professionalität der Anwendung.

**Independent Test**: Chrome/Edge Browser -> "App installieren" Icon in der Adresszeile -> Prüfung, ob NEO als eigenes Fenster ohne Browser-Leisten startet.

### User Story 2 - Vollständiger Offline-Betrieb (Priority: P1)
Als Anwender möchte ich die App auch dann öffnen können, wenn ich im Flugzeug oder Keller kein Internet habe.

**Why this priority**: Absolute Unabhängigkeit von externen Servern.

**Independent Test**: NEO einmal laden -> Internet kappen -> Browser-Cache leeren -> URL aufrufen -> Prüfung, ob die App (HTML/CSS/JS) trotzdem geladen wird.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Das System MUST ein `manifest.json` bereitstellen, das App-Name, Icons und Start-URL definiert.
- **FR-002**: Das System MUST einen Service Worker implementieren, der alle statischen Dateien (index.html, css/*, js/*) im Cache hält.
- **FR-003**: Das System MUST für verschiedene Icon-Größen (192x192, 512x512) sorgen.
- **FR-004**: Die PWA MUST den "standalone" Display-Modus nutzen (keine Browser-Adresszeile).

### Key Entities

- **WebManifest**: Die Identität der App.
- **ServiceWorker**: Der Wächter über den Offline-Cache.

## Success Criteria *(mandatory)*

- **SC-001**: **Lighthouse Score**: Die App muss im Lighthouse-Audit (Bereich PWA) eine Wertung von > 90 erreichen.
- **SC-002**: **Cold Offline Start**: Die App muss in unter 500ms starten, selbst wenn das Gerät im Flugmodus ist.
- **SC-003**: **Install Prompt**: Der Browser muss den Anwender aktiv (oder via Menü) zur Installation einladen.

