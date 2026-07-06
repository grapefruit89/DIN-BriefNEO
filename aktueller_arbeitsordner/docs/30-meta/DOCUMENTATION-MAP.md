---
title: Dokumenten-Landkarte & Wegweiser
status: active
tags: [documentation, map]
---

# Dokumenten-Landkarte & Wegweiser

Um das Projekt übersichtlich und hochgradig transparent zu halten, ist die Dokumentation in modular verlinkte Single Sources of Truth (SSoTs) gegliedert.

## 🏛️ Philosophie & Gesetzgebung
* **[Longevity Guidelines](../00-foundation/longevity-guidelines.md):** Die unverrückbare "Verfassung" für Wartungsfreiheit (Zero-Dependency, 100% Offline-Autarkie).
* **[Master Lawbook](../00-foundation/Immutable-Law-Catalog.md):** Die zentrale Referenz für alle technologischen Entscheidungen, Verbote und Ersatzstrategien.
* **[AGENTS.md](../../../AGENTS.md):** Bindender Vertrag für alle KI-Agenten (Reconciliation, 100% Fitness, Logging).
* **[DEV-INFO.md](DEV-INFO.md):** Entwicklerbereich & Feature-Prüfungs-Matrix.

## 🗺️ Status, Spezifikationen & Guides
* **[Spezifikation (spec.md)](../00-foundation/spec.md):** Die Kernanforderungen der Features und Backlog.
* **[No-Scroll Techniken](../20-implementation/Guides/no-scroll-techniques.md):** Anleitung für Viewport-Perfect Layouts.
* **[Testing Guide](../20-implementation/testing-guide.md):** Interaktives QA-Protokoll und Testfälle.
* **[LLM-First Datenbank-Guide (README-DB.md)](../40-tooling/README-DB.md):** Spezifikation der SQLite-DB und MCP-Architektur.

## 🏗️ Architektur-Entscheidungen (ADRs)
Alle grundlegenden Design-Entscheidungen sind thematisch im Ordner **[ADR/](../10-architecture/ADR/)** dokumentiert:
* **[ADR-HTML](../10-architecture/ADR/ADR-HTML.md):** Custom Elements, Popover API, `contenteditable`.
* **[ADR-CSS](../10-architecture/ADR/ADR-CSS.md):** Proportionaler Zoom, Container Queries, `light-dark()`.
* **[ADR-JS](../10-architecture/ADR/ADR-JS.md):** JavaScript-Reglementierung, Selection API.
* **[ADR-API](../10-architecture/ADR/ADR-API.md):** External Services & APIs (Geoapify, Zippopotam & Header Security).
* **[ADR-DATA-PERSISTENCE](../10-architecture/ADR/ADR-DATA-PERSISTENCE.md):** Lokale Speicherstrategien.

## 📦 Implementierungsdetails
* **[SQLite-Vec Integration](../20-implementation/implementation/sqlite-vec.md):** Plan für Vektor-Suche.
