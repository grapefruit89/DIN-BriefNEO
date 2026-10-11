---
id: architecture-readme
title: '10-architecture — Architektur-Entscheidungen & Traceability'
type: meta
status: active
created: '2026-07-07'
updated: '2026-10-11'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/meta
doc_links:
  - IMR-Registry
  - ADR-EVENT-DRIVEN-ARCHITECTURE
  - ADR-JS
  - ADR-TOAST-SYSTEM
  - ADR-OMNITRACEABILITY
  - constitution
  - Immutable-Law-Catalog
  - longevity-guidelines
  - spec
error_patterns:
  - architektur
  - adr
  - 10-architecture
  - entscheidung
  - traceability
  - imr
  - registry
supersedes: []
depends_on: []
code_links: []
---

# 10-architecture — Architektur-Entscheidungen & Traceability

Einstieg in das Architekturmodell von DIN-BriefNEO. Dieses Verzeichnis dokumentiert die begründeten technischen Entscheidungen und verknüpft sie mit dem normativen Fachmodell und der Implementierung.

## 1. Normative Quellen

Diese Quellen zuerst lesen. Sie definieren die Grenzen, innerhalb derer Architekturentscheidungen getroffen werden.

- [[constitution]] — unveränderliche Projektprinzipien.
- [[Immutable-Law-Catalog]] — verbindliche Verbote, bevorzugte native APIs und zulässige Alternativen.
- [[spec]] — fachliche Produktanforderungen.
- [[longevity-guidelines]] — Browser-Baseline und Kriterien für langlebige Technik.
- [[IMR-Registry]] — kanonisches fachliches Vokabular, Tags, Zonen und belegte Geometrie.

Die Foundation-Dokumente sind READ-ONLY. Architekturentscheidungen und Implementierungen müssen mit ihnen übereinstimmen; sie ändern die Foundation nicht.

## 2. Fachmodell und Semantik

- [[IMR-Registry]] — Single Source of Truth für instantiierte Fachatome und die normative DIN-Geometrie.
- [[ADR-HTML]] — HTML-Struktur, semantische `<din-…>`-Elemente, Editierbarkeit und native UI-Semantik.
- [[ADR-CSS]] — Darstellung, Blatt-Skalierung, Container Queries, Anchor Positioning und Farbregeln.

HTML implementiert das Modell. CSS rendert es. JavaScript erzeugt keine konkurrierende Quelle für Fachvokabular oder DIN-Millimeter.

## 3. Kern- und Event-Architektur

- [[ADR-JS]] — allgemeine Regeln für JavaScript, ES-Module und die Grenzen imperativer Logik.
- [[ADR-EVENT-DRIVEN-ARCHITECTURE]] — EventBus, Pub/Sub, Topic-Namenskonventionen und Payload-Verträge.
- [[ADR-DATA-PERSISTENCE]] — lokale Datenspeicherung und Datumshandling.
- [[ADR-OMNITRACEABILITY]] — Verknüpfung von Architekturentscheidungen, Code und Prüfungen.

Die Event-ADR dokumentiert die modulübergreifende Kommunikation. Die JavaScript-ADR beschreibt die übergeordneten Grenzen der Implementierung. Die Persistenz-ADR regelt den Speicherpfad.

## 4. Präsentationsschichten

- [[ADR-HTML]] — Struktur, Semantik und Editierbarkeit.
- [[ADR-CSS]] — Layout, Blattdarstellung, Positionierung und visuelle Zustände.
- [[ADR-TOAST-SYSTEM]] — native Popover-basierte Benachrichtigungen, Anzeigeverhalten und Toast-Registry.

UI-Module verantworten ihre Darstellung. Fachmodule kommunizieren über die vereinbarten Schnittstellen, statt fremde UI-Elemente direkt zu manipulieren.

## 5. Fachliche Subsysteme

- [[ADR-OFFLINE-ADDRESS-INTELLIGENCE]] — lokale PLZ-/Ort-Auflösung und optionale externe Anreicherung.
- [[ADR-SENDER-SYNCHRONIZATION]] — Absender-Synchronisation.
- [[ADR-DATA-PERSISTENCE]] — lokaler Speicher und Datumsverarbeitung.

Die Subsysteme folgen den allgemeinen Architekturregeln und dürfen keine davon unabhängige zweite Quelle für fachliche Definitionen oder Persistenzentscheidungen schaffen.

## 6. Traceability und Verifikation

- [[ADR-OMNITRACEABILITY]] — Regeln für Code-/Dokumentationsreferenzen und maschinelle Nachvollziehbarkeit.
- [[Function-Traceability]] — generierte Funktions-Traceability-Matrix.
- [[ADR-TEMPLATE]] — Vorlage für neue Architekturentscheidungen; liegt unter `docs/30-meta/`.

Jede neue oder geänderte ADR muss das vorgeschriebene Frontmatter-Schema einhalten. Bestehende Dateinamen und Frontmatter-IDs bleiben stabil. Code-Referenzen und Fitness Gate werden vor Abschluss einer Änderung geprüft.

## 7. Historische und archivierte Entscheidungen

- Migrierte oder abgelöste Entscheidungen liegen in `docs/90-archive/`.
- Historische Dokumente werden nicht als aktive Architekturvorgabe verlinkt.
- Die ehemalige `ADR-ANTIPATTERN`-Sammlung ist keine zweite Quelle für Verbote. Maßgeblich bleibt der [[Immutable-Law-Catalog]].
- Frühere API-, Feature- oder Tech-Stack-Entscheidungen werden nur dort referenziert, wo sie die Herkunft einer aktiven Entscheidung erklären.

## Empfohlene Lesereihenfolge

1. Foundation-Dokumente (`constitution`, `Immutable-Law-Catalog`, `spec`, `longevity-guidelines`).
2. IMR-Registry.
3. `ADR-HTML` und `ADR-CSS`.
4. `ADR-JS` und `ADR-EVENT-DRIVEN-ARCHITECTURE`.
5. `ADR-DATA-PERSISTENCE` und die fachlichen Subsystem-ADRs.
6. `ADR-OMNITRACEABILITY` vor Änderungen an Code oder Dokumentation.
