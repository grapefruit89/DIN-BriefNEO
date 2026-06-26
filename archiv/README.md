# archiv/

This folder contains historical, reference, and deprecated material that is **no longer part of the active development**.

## Structure

- **old-project-snapshots/**: Complete historical snapshots of previous full versions of the DIN-BriefNEO project and related work. These represent earlier states of the codebase before the major refactoring, introduction of the current longevity principles, layered antipattern system, Reconciliation/Fitness Score, and the clean ktueller_arbeitsordner/ structure.

- **external-references/**: Forks and external projects (DIN 5008 CSS, generators, LaTeX templates, simple letter UIs) that served as inspiration, comparison, or early references during development.

- **deprecated-agent-artifacts/**: Old AI/Agent session files, git histories from temporary clones, .brain/.gemini/.specify folders from previous agent interactions, old config files, and other obsolete tooling or session data. These were bloating the repository and increasing cognitive load.

## Purpose

This archive was restructured in June 2026 during a focused cleanup pass (see DECISION-LOG.md). The goal was to reduce noise for new agents and humans while preserving potentially useful historical reference material in a discoverable, documented way.

**The active, current state of the project lives exclusively in ktueller_arbeitsordner/.**

All material here is for reference only. Do not modify files inside the archive for active development work.

## General Note on Generalizability

Much of the content here (especially old snapshots) was used to learn what to avoid or improve. Useful patterns were extracted and generalized into the current tools/ (e.g. antipattern layering) or the parallel llm_boilerplate.

See the root AGENTS.md and MIGRATION-ROADMAP-TO-BOILERPLATE.md for the overall philosophy.
