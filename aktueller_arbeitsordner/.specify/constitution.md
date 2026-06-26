---
title: Agent Constitution Reference (spec-kit style)
status: active
tags: [constitution, agents, spec-driven]
---

# Constitution Reference for Agents

This is the agent-focused view in `.specify/constitution.md` (inspired by spec-kit).

**Full authoritative version:** See `../constitution.md` + `../MASTER-DO-DONT-DEPRECATED.md` in the aktueller_arbeitsordner root.

## Key Points Agents Must Internalize

- DIN-Brief Neo is a **Testballon** for the generic llm_boilerplate.
- Strict longevity: Vanilla web tech only, no frameworks, 10+ year maintainability.
- Reconciliation + 100% Fitness Score is **mandatory** before/after changes (see AGENTS.md).
- Generalisierungs-Pflicht: Every solution must be evaluated for extraction to the boilerplate.
- Layered antipatterns: base / web / project (see tools/antipatterns/).
- Full audit: Every action logged via log_session.js.

## Workflow Integration

Use the hybrid phases documented in `../HYBRID-SPEC-DRIVEN-WORKFLOW.md`:
Constitution (this) → Specify (specs/NNN-xxx/spec.md) → Plan → Tasks → Implement → **Reconcile + Log** (our addition).

Update this file only when the main constitution changes, with Pre/Post build and logging.

This separation (.specify/ for agent artifacts) makes extraction to llm_boilerplate cleaner.
