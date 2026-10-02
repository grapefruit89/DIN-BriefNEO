---
id: constitution
title: 'Verfassung (Constitution) — DIN-BriefNEO'
type: reference
status: active
created: '2026-06-26'
updated: '2026-10-02'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/reference
doc_links:
  - Immutable-Law-Catalog
  - spec
  - longevity-guidelines
  - HYBRID-SPEC-DRIVEN-WORKFLOW
  - ADR-RUNTIME-CONTEXT
code_links: []
error_patterns:
  - constitution
  - verfassung
  - regelwerk
  - zero-dependency
  - offline-first
supersedes: []
depends_on: []
---

# Verfassung (Constitution) — DIN-BriefNEO

Dieses Dokument beschreibt die unveränderlichen **Projektprinzipien** von
DIN-BriefNEO. Es ist keine zweite Verbotsliste: konkrete Normen, Stufen und
technische Ersatzmuster stehen ausschließlich im [[Immutable-Law-Catalog]]. Die
fachlichen Anforderungen stehen in [[spec]], die Browser- und Langlebigkeitskriterien
in [[longevity-guidelines]].

---

## 1. Mission & Vision

DIN-BriefNEO ist eine minimalistische, autarke Webanwendung zur Erstellung und zum
PDF-Druck formaler Briefe nach **DIN 5008 (Form A & B)**.

Die Anwendung läuft lokal im Browser über einen schlanken lokalen Webserver und ohne
Netzverbindung. Sie soll über Jahre direkt ausführbar bleiben: ohne Framework-
Ökosystem, ohne Build-Zwang und ohne serverseitige Produktinfrastruktur. Die genaue
Abgrenzung zwischen netzunabhängig und serverlos ist in [[ADR-RUNTIME-CONTEXT]]
festgehalten.

---

## 2. Unveränderliche Prinzipien

### Produkt bleibt klein und unabhängig

Die Auslieferung bleibt eine native Webanwendung. Keine Produktentscheidung darf eine
Runtime-Abhängigkeit, einen zwingenden Build-Schritt, ein fremdes Asset-Hosting oder
eine serverseitige Produktdatenbank voraussetzen. Die verbindlichen Einzelfälle und
Ausnahmen stehen im [[Immutable-Law-Catalog]].

### Plattform vor Nachbau

Native HTML-, CSS- und Web-APIs werden bevorzugt, bevor imperative JavaScript-
Nachbauten eingeführt werden. Die Baseline dafür ist ausschließlich in
[[longevity-guidelines]] definiert.

### Eine Wahrheit je Fakt

Jeder normative Fakt hat genau eine Quelle:

- fachliches Vokabular, Atome und belegte DIN-Geometrie: [[IMR-Registry]];
- Verbote, MUST-USE und Ausnahmen: [[Immutable-Law-Catalog]];
- fachliche Produktanforderungen: [[spec]];
- begründete Architekturentscheidungen: die thematischen ADRs.

Andere Dokumente referenzieren diese Quellen, statt ihre Aussagen als eigene
Vorschrift zu spiegeln.

### Prinzipien werden geprüft

Code und Dokumentation müssen die Foundation-Prinzipien reproduzierbar erfüllen.
Fitness Gate, Änderungsprozess und ADR-Pflicht regelt
[[HYBRID-SPEC-DRIVEN-WORKFLOW]]; diese Verfassung definiert nicht noch einmal dessen
Ablauf.

### Abweichungen sind explizit

Eine bewusste Abweichung von einem Foundation-Prinzip braucht eine begründete ADR und
einen menschlichen Entscheid. Ein Implementierungsdetail darf die Verfassung nicht
stillschweigend erweitern oder eine zweite Normquelle erzeugen.

---

## 3. Verhältnis zu den kanonischen Quellen

Die Foundation-Dokumente ergänzen sich, sie duplizieren sich nicht:

| Frage | Kanonische Quelle |
|---|---|
| Was ist unveränderliches Projektprinzip? | diese Verfassung |
| Was ist verboten oder bevorzugt? | [[Immutable-Law-Catalog]] |
| Was muss das Produkt fachlich leisten? | [[spec]] |
| Welche Technologie-Baseline gilt? | [[longevity-guidelines]] |
| Wie sind Atome und DIN-Maße definiert? | [[IMR-Registry]] |
| Wie wird gearbeitet und verifiziert? | [[HYBRID-SPEC-DRIVEN-WORKFLOW]] |

Bei einem Konflikt gilt die Foundation-Hierarchie aus
[[00-foundation/README|00-foundation]]; technische Detailentscheidungen werden in
ADRs begründet.
