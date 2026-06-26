---
title: 001 - Hybrid Spec-Driven Workflow Integration (spec-kit + Reconciliation)
status: active
tags: [spec, workflow, integration, spec-kit, generalisierbarkeit]
---

# Spec: 001 - Hybrid Spec-Driven Workflow Integration

## Context / Background
We evaluated GitHub spec-kit for its clear phased Spec-Driven Development approach with AI agents. While lighter than our Reconciliation + Fitness system, it offers good ideas for structure and workflow clarity (numbered specs, .specify/ separation, explicit phases).

This spec defines how we integrate the useful parts without losing our strengths (Fitness Score, layered antipatterns, audit trail, Generalisierungs-Pflicht).

## Requirements
- Adopt .specify/ for agent-specific artifacts (constitution, templates, memory) to improve extractability to llm_boilerplate.
- Introduce numbered specs/NNN-name/ for better traceability and history (like spec-kit).
- Define a hybrid workflow that combines spec-kit phases with our mandatory Reconciliation gates.
- Keep all changes documented and logged per AGENTS.md.
- Maintain 100% Fitness Score throughout.

## Acceptance Criteria
- [x] .specify/ directory created with constitution.md and templates/.
- [x] specs/ directory with at least one example (001-...).
- [x] HYBRID-SPEC-DRIVEN-WORKFLOW.md created explaining the combined process.
- [x] Changes follow Pre/Post build + log_session + DECISION-LOG.
- [ ] Future features use the new numbered spec format.
- Generalisierbarkeit: The .specify/ + specs/ pattern itself is designed to be extractable as a boilerplate convention.

## Generalisierbarkeit Check (mandatory)
- The .specify/ structure and numbered specs/ approach can be directly reused in llm_boilerplate.
- Proposed extraction: Copy the folder layout and HYBRID-WORKFLOW doc (or parts) as recommended patterns.
- Risks: None major; this enhances rather than couples to DIN specifics.

## Related
- AGENTS.md (Core Rules, Generalisierungs-Pflicht)
- MIGRATION-ROADMAP-TO-BOILERPLATE.md
- .specify/constitution.md
- aktueller_arbeitsordner/constitution.md
