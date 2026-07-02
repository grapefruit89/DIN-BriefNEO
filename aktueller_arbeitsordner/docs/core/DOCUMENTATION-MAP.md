---
title: Dokumenten-Landkarte & Wegweiser
status: active
tags: [documentation, map]
---

# Dokumenten-Landkarte & Wegweiser

Um das Projekt übersichtlich und hochgradig transparent zu halten, ist die Dokumentation in modular verlinkte Single Sources of Truth (SSoTs) gegliedert.

## 🏛️ Philosophie & Gesetzgebung
* **[Longevity Guidelines](../Guides/longevity-guidelines.md):** Die unverrückbare "Verfassung" für Wartungsfreiheit (Zero-Dependency, 100% Offline-Autarkie).
* **[Master Lawbook](MASTER-DO-DONT-DEPRECATED.md):** Die zentrale Referenz für alle technologischen Entscheidungen, Verbote und Ersatzstrategien.
* **[AGENTS.md](../../../AGENTS.md):** Bindender Vertrag für alle KI-Agenten (Reconciliation, 100% Fitness, Logging).
* **[DEV-INFO.md](DEV-INFO.md):** Entwicklerbereich & Feature-Prüfungs-Matrix.

## 🗺️ Status, Spezifikationen & Guides
* **[Spezifikation (spec.md)](spec.md):** Die Kernanforderungen der Features und Backlog.
* **[No-Scroll Techniken](../Guides/no-scroll-techniques.md):** Anleitung für Viewport-Perfect Layouts.
* **[Testing Guide](../Guides/testing-guide.md):** Interaktives QA-Protokoll und Testfälle.
* **[LLM-First Datenbank-Guide (README-DB.md)](README-DB.md):** Spezifikation der SQLite-DB und MCP-Architektur.
* **[DIN 5008 Master Data](../Guides/din-5008-geometry.md):** SSoT für alle physischen Abstände des Briefs.

## 🏗️ Architektur-Entscheidungen (ADRs)
Alle grundlegenden Design-Entscheidungen sind thematisch im Ordner **[ADR/](../ADR/)** dokumentiert:
* **[ADR-HTML](../ADR/ADR-HTML.md):** Custom Elements, Popover API, `contenteditable`.
* **[ADR-CSS](../ADR/ADR-CSS.md):** Proportionaler Zoom, Container Queries, `light-dark()`.
* **[ADR-JS](../ADR/ADR-JS.md):** JavaScript-Reglementierung, Selection API.
* **[ADR-API](../ADR/ADR-API.md):** External Services & APIs (Geoapify, Zippopotam & Header Security).
* **[ADR-DATA-PERSISTENCE](../ADR/ADR-DATA-PERSISTENCE.md):** Lokale Speicherstrategien.

## 📦 Implementierungsdetails
* **[SQLite-Vec Integration](../implementation/sqlite-vec.md):** Plan für Vektor-Suche.
