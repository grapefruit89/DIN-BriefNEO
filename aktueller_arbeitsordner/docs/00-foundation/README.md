---
id: foundation-readme
title: '00-foundation — Fundament & Unverrückbare Gesetze'
type: meta
status: active
created: '2026-08-07'
updated: '2026-08-07'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/meta
doc_links:
  - constitution
  - Immutable-Law-Catalog
  - longevity-guidelines
  - spec
  - HYBRID-SPEC-DRIVEN-WORKFLOW
error_patterns:
  - fundament
  - gesetze
  - constitution
  - spec
  - 00-foundation
supersedes: []
---

# 00-foundation — Fundament & Unverrückbare Gesetze

Der `_0`-Anker im Dezimalrahmen. Hier liegt alles, was **nicht verhandelbar** ist — die Verfassung, die Gesetze, die Überlebensregeln und die Spezifikation. Diese Dokumente werden niemals ohne expliziten menschlichen Entscheid geändert.

> [!WARNING]
> Kein KI-Agent darf Dokumente in `00-foundation/` eigenständig verändern. Sie sind **read-only** für alle automatisierten Prozesse. Änderungsvorschläge werden als ADR eingereicht.

## Dokumente

| Datei | Inhalt | Priorität |
|---|---|---|
| [[constitution]] | Verfassung: Kern-Prinzipien, Zero-Dependency, Privacy-First | ⭐⭐⭐ |
| [[Immutable-Law-Catalog]] | MUST-USE vs. ANTIPATTERN Catalog — alle technologischen Verbote und Ersatzstrategien | ⭐⭐⭐ |
| [[longevity-guidelines]] | W3C Native Standards: Wie wir Features wählen, die in 10 Jahren noch funktionieren | ⭐⭐ |
| [[spec]] | Baseline Feature-Spezifikation: Was DIN-Brief NEO **muss** (DIN 5008:2020-03) | ⭐⭐⭐ |
| [[HYBRID-SPEC-DRIVEN-WORKFLOW]] | Verbindlicher Entwicklungs-Workflow: Light/Full Mode, Fitness-Gate, Reconciliation | ⭐⭐⭐ |

## Verhältnis zu anderen Bereichen

- **`10-architecture/`** enthält die ADRs — sie **begründen** die Entscheidungen, die aus diesen Gesetzen folgen.
- **`90-policy/`** enthält Workflows und Prozessregeln — sie **implementieren** die Gesetze operativ.
- **`AGENTS.md`** (Root) ist der bindende Vertrag für KI-Agenten — er **referenziert** foundation-Dokumente.

Wer neu ins Projekt einsteigt: [[constitution]] zuerst, dann [[Immutable-Law-Catalog]], dann [[spec]].
