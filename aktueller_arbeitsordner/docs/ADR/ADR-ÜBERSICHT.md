---
created: '2026-07-06'
depends_on: []
project: DIN-BriefNEO
status: active
tags:
- adr
- dataview
- dashboard
title: ADR-Übersicht
type: overview
updated: '2026-07-06'
---

# ADR-Übersicht (Dataview)

> [!info] Über dieses Dokument
> Dieses Dashboard nutzt das **Obsidian Dataview-Plugin**, um alle Architectural Decision Records (ADRs) des Projekts `DIN-BriefNEO` automatisch aufzulisten.

## Aktive Entscheidungen

```dataview
TABLE status, date as Datum, last-reviewed as "Zuletzt geprüft", deciders as Entscheider
FROM "ADR"
WHERE type = "adr" AND (status = "accepted" OR status = "proposed") AND project = "DIN-BriefNEO"
SORT date DESC
```

## Veraltet / Abgelehnt

```dataview
TABLE status, date as Datum, last-reviewed as "Zuletzt geprüft", deciders as Entscheider
FROM "ADR"
WHERE type = "adr" AND (status = "deprecated" OR status = "rejected") AND project = "DIN-BriefNEO"
SORT date DESC
```

## Entwürfe (Drafts)

```dataview
TABLE status, date as Datum, last-reviewed as "Zuletzt geprüft", deciders as Entscheider
FROM "ADR"
WHERE type = "adr" AND status = "draft" AND project = "DIN-BriefNEO"
SORT date DESC
```