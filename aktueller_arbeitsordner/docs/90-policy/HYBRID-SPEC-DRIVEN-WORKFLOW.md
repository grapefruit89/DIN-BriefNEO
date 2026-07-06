---
title: Hybrid Spec-Driven Workflow (spec-kit ideas + Reconciliation)
status: active
tags: [workflow, spec-driven, reconciliation, agents, generalisierbarkeit]
---

# Hybrid Spec-Driven + Reconciliation Workflow

This combines the best of GitHub spec-kit (clear phased development with AI) with our strengths (Reconciliation Loop, Fitness Score 100%, layered antipatterns, audit trail via log_session, Generalisierungs-Pflicht).

## Why Hybrid?

- spec-kit strength: Simple, agent-friendly phases (Constitution → Spec → Plan → Tasks → Implement).
- Our strength: Mandatory quality gates (Pre/Post Build with Evolutionary Fitness Score), Generalisierungs-Pflicht for boilerplate extraction, full KI audit (log_session.js), antifragile antipattern layering.

We keep .specify/ for agent-specific artifacts (easy to extract for llm_boilerplate) and specs/ for numbered, traceable features.

## Core Principles (from AGENTS.md)

- Build **before** and **after** every relevant change.
- Fitness Score **MUST** be 100%.
- Log every action.
- Check Generalisierbarkeit for every solution and propose extraction to llm_boilerplate.

## The Hybrid Phases + Light / Full Mode

**Wichtig:** Es gibt einen gestuften Workflow, um Komplexität und Fehleranfälligkeit zu senken (siehe AGENTS.md Abschnitt "Light Mode vs Full Mode").

- **Light Mode** (Standard für die meisten Änderungen): Nur die Kernschritte Pre-Build → Änderung → Post-Build (100%) → Loggen + kurzer Generalisierungs-Vermerk im DECISION-LOG.md. Kein zwingendes spec.md.

- **Full Mode** (wichtige Features, Architektur, boilerplate-relevante Arbeit): Der komplette unten beschriebene Prozess mit spec/plan/tasks + explizitem Generalisierungs-Check.

1. **Constitution** (setup / major updates)
   - Location: `.specify/constitution.md` (or reference to `constitution.md` + `MASTER-DO-DONT-DEPRECATED.md`).
   - Defines project philosophy, longevity rules, what must be respected (no frameworks, DIN 5008, etc.).
   - Agent must read this first.
   - Update only with Pre/Post build + log + DECISION-LOG entry.

2. **Specify** (feature or major change – Full Mode)
   - Create `specs/NNN-short-name/spec.md` (numbered for history and traceability, like spec-kit).
   - Content: Requirements, acceptance criteria, context, links to existing ADRs/Guides.
   - Use templates from `.specify/templates/spec.md`.
   - Pre-build, then create the spec file.
   - Document Generalisierbarkeit potential here (Full Mode: ausführlich).

3. **Plan** (Full Mode)
   - In the same `specs/NNN-.../plan.md` or linked ADR.
   - Technical design, architecture decisions, which layers of antipatterns are affected.
   - Identify what can be generalized to llm_boilerplate.
   - Pre/Post build required if code/docs change.

4. **Tasks** (Full Mode)
   - `specs/NNN-.../tasks.md` (checklist, like spec-kit).
   - Break down into small, verifiable steps.
   - Each task should note if it touches generic (base/web) vs project-specific.

5. **Implement**
   - Code / docs changes.
   - Strictly follow constitution, MASTER-DO-DONT, AGENTS.md, and the spec (if Full Mode).
   - Use layered antipatterns (base/web/project.json) for rules.
   - Light Mode: Direkt nach kurzer Beschreibung im DECISION-LOG.

6. **Reconcile & Verify** (mandatory – immer)
   - **Always** run `node tools/build_db.js` (or the wrapper) **before** starting implementation and **after** completing.
   - Must achieve **EVOLUTIONARY FITNESS SCORE: 100%**.
   - Fix all critical/high violations.
   - Log the entire session/action with `log_session.js` (include what was generalized).

7. **Generalize & Extract** (Testballon duty)
   - For every completed feature: Explicitly decide and document:
     - Stays project-specific (in project.json or website/)?
     - Can move to base/web in antipatterns?
     - Can become a generic tool / template / guide for llm_boilerplate?
   - Light Mode: 1-2 Sätze im DECISION-LOG.
   - Full Mode: Ausführlich im spec.md + Vorschläge.
   - Propose concrete pull/extraction steps.
   - Update MIGRATION-ROADMAP-TO-BOILERPLATE.md or DECISION-LOG.md.

## Folder Usage for Easy Extraction

- `.specify/` : Agent instructions, constitution, templates, memory. Highly extractable to llm_boilerplate.
- `specs/` : Numbered feature work. Mostly project-specific, but plans can note generalizable parts.
- `tools/antipatterns/{base,web,project}.json` : The layered rules are the #1 extraction target.
- `tools/` (reconciliation, build_db, log_session, etc.): Generic by design.
- `website/` : Pure application code – do not extract.
- `constitution.md` / `MASTER-DO-DONT-DEPRECATED.md` : Core philosophy – parts can be generalized.

## How to Start a New Feature (Agent Instructions)

1. Read `.specify/constitution.md`, AGENTS.md, and relevant specs/ADRs.
2. Pre-build.
3. Create `specs/NNN-new-thing/spec.md` (copy template if available).
4. Create plan and tasks.
5. Implement + reconcile (Post-build 100%).
6. Log.
7. Document generalization proposal.

This keeps the lightweight, structured flow from spec-kit while enforcing our quality and generalizability gates.

See also:
- AGENTS.md (Core Rules and Logging)
- MIGRATION-ROADMAP-TO-BOILERPLATE.md
- aktueller_arbeitsordner/constitution.md
