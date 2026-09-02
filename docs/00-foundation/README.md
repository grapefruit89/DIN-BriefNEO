---
id: foundation-readme
title: '00-foundation — Fundament & Unverrückbare Gesetze'
type: meta
status: active
created: '2026-08-07'
updated: '2026-09-02'
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
depends_on: []
code_links: []
---

# 00-foundation — Fundament & Unverrückbare Gesetze

Der `_0`-Anker im Dezimalrahmen. Hier liegt, was **nicht verhandelbar** ist. Diese Dokumente werden niemals ohne expliziten menschlichen Entscheid geändert.

> [!WARNING]
> Kein KI-Agent darf Dokumente in `00-foundation/` eigenständig verändern. Sie sind **read-only** für alle automatisierten Prozesse. Änderungsvorschläge werden als ADR eingereicht.

## Normative Hierarchie

```
CONSTITUTION          unveränderliche Projektprinzipien
    |
LAW CATALOG           Verbote + Stufen (HARD BAN / PREFERRED / FALLBACK)
    |
SPEC                  WAS die Anwendung leisten muss
    |
LONGEVITY             Kriterien für langlebige Technik; einzige Baseline-Zahl
    |
WORKFLOW / GUIDES     WIE wir arbeiten (Prozess, nicht Gesetz)
```

Konfliktregel: Eine untere Ebene darf eine obere nicht aufheben. Konkrete Millimeter, Feldlisten eines Briefes und Implementierungsrezepte gehören nicht in diese Ebene.

Die IMR-Registry liegt in `docs/10-architecture/`. Sie ist das normative DIN-Brief-Modell (Vokabular, Tags, Zonen, Beziehungen, belegte Geometrie). Foundation beschreibt die Gesetze darüber, nicht die Millimeter.

## Dokumente

| Datei | Normative Ebene | Inhalt |
|---|---|---|
| [[constitution]] | Prinzipien | Kern-Gebote und -Verbote |
| [[Immutable-Law-Catalog]] | Verbote / Plattform | HARD BAN, PREFERRED, FALLBACK |
| [[spec]] | Anforderungen | WAS DIN-BriefNEO leisten muss |
| [[longevity-guidelines]] | Technik-Kriterien | Feature-Wahl; **Chrome 148+** |
| [[HYBRID-SPEC-DRIVEN-WORKFLOW]] | Prozess | Light/Full Mode, Fitness-Gate. Geplanter Ort: `docs/90-policy/` |

Historische Prüfberichte gehören nicht hierher. Der frühere `audit_summary` liegt unter `docs/30-meta/audits/`.

## Architekturgrundsatz (eingefroren)

Die 45er Registry definiert das vollständige fachliche Vokabular. Ein konkreter Brief verwendet daraus nur die erforderliche Schnittmenge. Jedes tatsächlich verwendete Registry-Atom wird semantisch als entsprechendes `<din-…>`-Element repräsentiert. Das verlangt keine JavaScript-Registrierung und keine Custom-Element-Klasse. Zonen/Container sind eine zusätzliche strukturelle Ebene.

Normative belegte Geometrie steht in der IMR-Registry. HTML implementiert dieses Modell. CSS rendert es. JS verändert es nicht. Wenn Registry und Produkt divergieren, wird die Registry repariert — nicht das Briefmodell verbogen.

Die kanonische Atomliste und die belegten Millimeter stehen in `docs/10-architecture/IMR-Registry.md`, nicht in diesem Ordner.

## Verhältnis zu anderen Bereichen

- **`10-architecture/`** enthält die ADRs und die IMR-Registry — Modell und Begründung dessen, was aus diesen Gesetzen folgt.
- **`90-policy/`** ist der vorgesehene Ort für Workflows (Ordner ggf. noch anzulegen).
- **`AGENTS.md`** (Root) referenziert Foundation-Dokumente. Es kopiert sie nicht.

Wer neu einsteigt: [[constitution]] zuerst, dann [[Immutable-Law-Catalog]], dann [[spec]].
