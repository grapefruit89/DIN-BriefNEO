---
id: hybrid-spec-driven-workflow
title: 'Hybrid Spec-Driven Workflow (Light/Full Mode + Reconciliation)'
type: guide
status: active
created: '2026-06-26'
updated: '2026-09-02'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/guide
  - workflow
  - spec-driven
  - agents
doc_links:
  - constitution
  - Immutable-Law-Catalog
  - ADR-ANTIPATTERN
  - DECISION-LOG
code_links:
  - 'tools/build_db.js'
  - 'tools/log_session.js'
  - 'tools/reconciliation.js'
error_patterns:
  - workflow
  - spec-driven
  - light mode
  - full mode
  - fitness score
  - pre-build
  - post-build
  - generalisierbarkeit
  - reconciliation
  - log session
supersedes: []
depends_on: []
---

# Hybrid Spec-Driven + Reconciliation Workflow

> [!WARNING] Prozess, nicht Gesetz
> Dieses Dokument beschreibt, **wie** gearbeitet wird. Es steht hierarchisch unter Constitution, Law Catalog und Spec. Es ist kein immutable law. Vorgesehener Ort: `docs/90-policy/` (Move ausstehend).
>
> Leitplanken: [[constitution]] · [[Immutable-Law-Catalog]] · [[ADR-ANTIPATTERN]]

This combines phased development with Reconciliation, Fitness Score and session logging.

## Why Hybrid?

- spec-kit strength: Simple, agent-friendly phases (Constitution → Spec → Plan → Tasks → Implement).
- Our strength: Quality gates (Pre/Post Build with Evolutionary Fitness Score), Generalisierungs-Pflicht, audit trail via log_session.

We keep .specify/ for agent-specific artifacts and specs/ for numbered, traceable features.

## Core Principles (from AGENTS.md)

- Build **before** and **after** every relevant change.
- Fitness Score **MUST** be 100%.
- Log every action.
- Check Generalisierbarkeit for every solution.

## The Hybrid Phases + Light / Full Mode

**Wichtig:** Gestufter Workflow (siehe AGENTS.md, Light Mode vs Full Mode).

- **Light Mode** (Standard): Pre-Build → Änderung → Post-Build (100%) → Loggen + kurzer Vermerk im [[DECISION-LOG]]. Kein zwingendes [[spec]].
- **Full Mode** (wichtige Features, Architektur): kompletter Prozess mit spec/plan/tasks.

1. **Constitution** (setup / major updates)
   - Reference `docs/00-foundation/constitution.md` + `Immutable-Law-Catalog.md`.
   - Agent must read this first.
   - Update only with human decision + ADR.

2. **Specify** (Full Mode)
   - `specs/NNN-short-name/spec.md`
   - Requirements, acceptance criteria — keine zweite Geometrie-SSoT.

3. **Plan** (Full Mode)
   - Technical design in plan.md or ADR. Geometrie aus HTML-`data-*` ableiten.

4. **Tasks** (Full Mode)
   - `specs/NNN-.../tasks.md`

5. **Implement**
   - Follow constitution, [[Immutable-Law-Catalog]], AGENTS.md, and the spec (Full Mode).
   - Instantiierte Registry-Atome als `<din-…>` ohne `customElements.define()`.
   - Light Mode: Direkt nach kurzer Beschreibung im DECISION-LOG.

6. **Reconcile & Verify** (mandatory)
   - Run the project fitness/index tools before and after relevant changes.
   - Fitness Score 100%.
   - Log the session.

7. **Generalize & Extract**
   - Light Mode: 1–2 Sätze im DECISION-LOG.
   - Full Mode: ausführlich.

## Folder Usage

- `.specify/` : Agent instructions and templates.
- `specs/` : Numbered feature work.
- `tools/` : Development infrastructure, not the product.
- `website/` : Application — do not extract, do not treat as build output.
- Foundation files: principles only.

## How to Start

1. Read constitution, Catalog, AGENTS.md.
2. Pre-build / fitness gate.
3. Full Mode: spec → plan → tasks.
4. Implement.
5. Post-build 100%.
6. Log.

Siehe auch: [[constitution]] | [[Immutable-Law-Catalog]] | [[ADR-ANTIPATTERN]] | [[DECISION-LOG]]
