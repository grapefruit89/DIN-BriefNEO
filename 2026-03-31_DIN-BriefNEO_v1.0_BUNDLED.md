---
title: "DIN-BriefNEO Snapshot"
created: 2026-03-31T22:07:33.554415
llm_ready: true
---

<file path=".brain/ANTI_PATTERN.md">
<metadata>Lines: 17 | Size: 632 B</metadata>
<content>
# DIN-BriefNEO — Anti-Pattern Registry
[v4.1 Pure Edition Update]

## DEP-P001: localStorage for high-volume data
- **Status:** PARTIALLY RELAXED
- **Rule:** localStorage is ALLOWED for state synchronization < 50KB.
- **Reason:** Ensuring file:// compatibility and Zero-JS DNA. OPFS remains preferred for large assets if available.

## DEP-C004: setTimeout for UI logic
- **Status:** BANNED
- **Rule:** Use CSS Transitions/Animations or RequestIdleCallback.
- **Exception:** Debouncing user input (Storage-Sync).

## DEP-UI01: Imperative DOM Toggles
- **Status:** BANNED
- **Rule:** Use :has(), Popover API and Anchor Positioning.
</content>
</file>

<file path=".brain/CONSTITUTION.md">
<metadata>Lines: 65 | Size: 2361 B</metadata>
<content>
---
id: BRAIN-001-CONST
title: "Architecture Specification (SSoT)"
version: 4.0.0
status: "verified"
compliance: "v4.0-Stable"
authority: "Lead Architect"
last_audit: 2026-03-28
tags:
  - architecture
  - ssot
  - mission-critical
related:
  - "[[CORE_SPEC]]"
  - "[[ANTI_PATTERN]]"
aliases:
  - "Architecture Protocol"
---

# Architecture Specification (SSoT)

## I. CORE ARCHITECTURAL PRINCIPLES

### §1 Technological Hierarchy (Structural Layering)

Each feature MUST be implemented at the lowest possible layer:

1. **Native HTML** (Structure, Semantics, Popover API, Invokers)
2. **Native CSS** (Layout @layer, 0.001mm-precision, OKLCH colors, contrast-color())
3. **Vanilla JavaScript** (IMR Registry, EditContext, Persistence, Logic)
4. **Public APIs** (Fault-tolerant external services — optional only)

### §2 Zero-Width Marker Strategy (WYSIWYG)

The physical 1:1 print preview is the primary constraint.

- Markdown control characters (`*`, `_`) visible in the editor MUST NOT affect text flow width.
- Execution: `.md-marker { display: inline-block; width: 0; overflow: visible; }`

### §3 Structural Zoning (IMR 4.0)

The document consists of 19 atomic fields defined in the `Isomorphic Master Registry`.

- **Category A (Atoms):** Single-line, `plaintext-only` fields (e.g., `<din-absender-vorname>`).
- **Category B (Flow):** The `<din-text>` element with EditContext support.

### §4 Chrome Baseline (147+)

- **Layout:** CSS Anchor Positioning, CSS `if()`, `@scope`, `@property`, `field-sizing: content`.
- **Interaktion:** Invoker Commands (`commandfor`/`command`), Popover API, Native `<select>` styling.
- **Animation:** Scoped View Transitions, `@starting-style`, `interpolate-size: allow-keywords`.
- **Accessibility:** `contrast-color()`, `light-dark()`, Color Level 5 (RCS).
- **Security:** Sanitizer API, Trusted Types, Device Bound Session Credentials (DBSC).
- **Input:** EditContext API, IdleDetector API, `scheduler.postTask()`.
- **Time:** Temporal API (Full support).
- **Enforcement:** No polyfills. No `@supports` guards for core APIs. The system evolves synchronously with the Blink engine.

## II. VISUAL STABILITY REQUIREMENT

Zero layout shift after initialization. Every pixel is deterministic.

## III. UNIFIED DATA STATE

The JSON data model is the single source of truth (SSoT). HTML is strictly the presentation layer.
</content>
</file>

<file path=".brain/CORE_SPEC.md">
<metadata>Lines: 49 | Size: 1928 B</metadata>
<content>
---
id: BRAIN-002-SPEC
title: "Core Specification (IMR 4.0)"
version: 4.0.0
status: "active"
geometry: "DIN 5008:2020-03"
last_audit: 2026-03-28
tags:
  - specification
  - din-5008
  - imr-4-0
related:
  - "[[CONSTITUTION]]"
  - "[[ANTI_PATTERN]]"
---

# Core Specification (IMR 4.0)

## 1. ATOMIC CUSTOM ELEMENTS

The system implements a 19-atom model using native Custom Elements.

- **Header Atoms:** `din-absender-vorname`, `din-absender-nachname`, `din-absender-strasse`, `din-absender-ort`.
- **Recipient Atoms:** `din-empfaenger-firma`, `din-empfaenger-name`, `din-empfaenger-strasse`, `din-empfaenger-ort`.
- **Logic Atoms:** `din-text` (Source), `din-text-mirror` (View).
- **Behavior:** All atoms implement `contenteditable="plaintext-only"` and are bound via `EditContext API`.

## 2. TEMPORAL ENGINE

- **Capture:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`.
- **Target:** `<din-date>` (Standalone at 50mm Y / 125mm X).

## 3. PHYSICAL GEOMETRY (SSoT)

- **Form A (Small Header):** 27mm top offset for address zone.
- **Form B (Standard Header):** 45mm top offset for address zone.
- **Enforcement:** Zero-JS layout. Logic resides entirely in `app-ui.css` @layer geometry.

## 4. NATIVE LAYOUT & RENDERING (Chrome 147+)

- **Field Sizing:** `field-sizing: content` for all textfields (Zero-Scroll Mandate).
- **Scope Isolation:** `@scope (#paper)` for all `din-*` selectors to prevent style leakage.
- **Typed Properties:** `@property` for all 19 CMA-coordinates (Precise sub-pixel layout).
- **Mirror Security:** `setHTML()` with Sanitizer API for `din-text-mirror` and ghosting.
- **Input Handling:** EditContext API with `textupdate` events for Category B elements.
- **Transitions:** Scoped View Transitions for Form A/B layout morphing.
- **Reactivity (Future):** Native Signals API for zero-proxy state management.
- **Conditionals (Future):** CSS `if()` logic for declarative Form A/B geometry.
</content>
</file>

<file path=".brain/ROADMAP.md">
<metadata>Lines: 22 | Size: 666 B</metadata>
<content>
# DIN-BriefNEO Roadmap
[v4.1 Pure & Flat Edition]

## Phase 1: Pure Foundation [DONE]
- [x] Temporal API Integration
- [x] CMA Variables as @property
- [x] Native Invokers for Modals

## Phase 2: Markdown & Mirror [DONE]
- [x] KISS Markdown Parser
- [x] Mirror Engine for Printing

## Phase 3: Flat Architecture [DONE]
- [x] Delete redundant infrastructure (Worker, IO-Coord)
- [x] Flatten project structure (Level 1 depth)
- [x] Security: Remove .env and exposed keys

## Phase 4: Stabilitiy & Polish [ACTIVE]
- [ ] Offline-Sync: Leader Election & OPFS [DEPRECATED / Pure Edition skips this]
- [ ] Accessibility Audit (A11y)
- [ ] Multi-Page support (Experimental)
</content>
</file>

<file path=".gemini/commands/speckit.analyze.toml">
<metadata>Lines: 189 | Size: 7341 B</metadata>
<content>
description = "Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation."

prompt = """
---
description: Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Identify inconsistencies, duplications, ambiguities, and underspecified items across the three core artifacts (`spec.md`, `plan.md`, `tasks.md`) before implementation. This command MUST run only after `/speckit.tasks` has successfully produced a complete `tasks.md`.

## Operating Constraints

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report. Offer an optional remediation plan (user must explicitly approve before any follow-up editing commands would be invoked manually).

**Constitution Authority**: The project constitution (`.specify/memory/constitution.md`) is **non-negotiable** within this analysis scope. Constitution conflicts are automatically CRITICAL and require adjustment of the spec, plan, or tasks—not dilution, reinterpretation, or silent ignoring of the principle. If a principle itself needs to change, that must occur in a separate, explicit constitution update outside `/speckit.analyze`.

## Execution Steps

### 1. Initialize Analysis Context

Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` once from repo root and parse JSON for FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:

- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- TASKS = FEATURE_DIR/tasks.md

Abort with an error message if any required file is missing (instruct the user to run missing prerequisite command).
For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Load Artifacts (Progressive Disclosure)

Load only the minimal necessary context from each artifact:

**From spec.md:**

- Overview/Context
- Functional Requirements
- Non-Functional Requirements
- User Stories
- Edge Cases (if present)

**From plan.md:**

- Architecture/stack choices
- Data Model references
- Phases
- Technical constraints

**From tasks.md:**

- Task IDs
- Descriptions
- Phase grouping
- Parallel markers [P]
- Referenced file paths

**From constitution:**

- Load `.specify/memory/constitution.md` for principle validation

### 3. Build Semantic Models

Create internal representations (do not include raw artifacts in output):

- **Requirements inventory**: Each functional + non-functional requirement with a stable key (derive slug based on imperative phrase; e.g., "User can upload file" → `user-can-upload-file`)
- **User story/action inventory**: Discrete user actions with acceptance criteria
- **Task coverage mapping**: Map each task to one or more requirements or stories (inference by keyword / explicit reference patterns like IDs or key phrases)
- **Constitution rule set**: Extract principle names and MUST/SHOULD normative statements

### 4. Detection Passes (Token-Efficient Analysis)

Focus on high-signal findings. Limit to 50 findings total; aggregate remainder in overflow summary.

#### A. Duplication Detection

- Identify near-duplicate requirements
- Mark lower-quality phrasing for consolidation

#### B. Ambiguity Detection

- Flag vague adjectives (fast, scalable, secure, intuitive, robust) lacking measurable criteria
- Flag unresolved placeholders (TODO, TKTK, ???, `<placeholder>`, etc.)

#### C. Underspecification

- Requirements with verbs but missing object or measurable outcome
- User stories missing acceptance criteria alignment
- Tasks referencing files or components not defined in spec/plan

#### D. Constitution Alignment

- Any requirement or plan element conflicting with a MUST principle
- Missing mandated sections or quality gates from constitution

#### E. Coverage Gaps

- Requirements with zero associated tasks
- Tasks with no mapped requirement/story
- Non-functional requirements not reflected in tasks (e.g., performance, security)

#### F. Inconsistency

- Terminology drift (same concept named differently across files)
- Data entities referenced in plan but absent in spec (or vice versa)
- Task ordering contradictions (e.g., integration tasks before foundational setup tasks without dependency note)
- Conflicting requirements (e.g., one requires Next.js while other specifies Vue)

### 5. Severity Assignment

Use this heuristic to prioritize findings:

- **CRITICAL**: Violates constitution MUST, missing core spec artifact, or requirement with zero coverage that blocks baseline functionality
- **HIGH**: Duplicate or conflicting requirement, ambiguous security/performance attribute, untestable acceptance criterion
- **MEDIUM**: Terminology drift, missing non-functional task coverage, underspecified edge case
- **LOW**: Style/wording improvements, minor redundancy not affecting execution order

### 6. Produce Compact Analysis Report

Output a Markdown report (no file writes) with the following structure:

## Specification Analysis Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| A1 | Duplication | HIGH | spec.md:L120-134 | Two similar requirements ... | Merge phrasing; keep clearer version |

(Add one row per finding; generate stable IDs prefixed by category initial.)

**Coverage Summary Table:**

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|

**Constitution Alignment Issues:** (if any)

**Unmapped Tasks:** (if any)

**Metrics:**

- Total Requirements
- Total Tasks
- Coverage % (requirements with >=1 task)
- Ambiguity Count
- Duplication Count
- Critical Issues Count

### 7. Provide Next Actions

At end of report, output a concise Next Actions block:

- If CRITICAL issues exist: Recommend resolving before `/speckit.implement`
- If only LOW/MEDIUM: User may proceed, but provide improvement suggestions
- Provide explicit command suggestions: e.g., "Run /speckit.specify with refinement", "Run /speckit.plan to adjust architecture", "Manually edit tasks.md to add coverage for 'performance-metrics'"

### 8. Offer Remediation

Ask the user: "Would you like me to suggest concrete remediation edits for the top N issues?" (Do NOT apply them automatically.)

## Operating Principles

### Context Efficiency

- **Minimal high-signal tokens**: Focus on actionable findings, not exhaustive documentation
- **Progressive disclosure**: Load artifacts incrementally; don't dump all content into analysis
- **Token-efficient output**: Limit findings table to 50 rows; summarize overflow
- **Deterministic results**: Rerunning without changes should produce consistent IDs and counts

### Analysis Guidelines

- **NEVER modify files** (this is read-only analysis)
- **NEVER hallucinate missing sections** (if absent, report them accurately)
- **Prioritize constitution violations** (these are always CRITICAL)
- **Use examples over exhaustive rules** (cite specific instances, not generic patterns)
- **Report zero issues gracefully** (emit success report with coverage statistics)

## Context

{{args}}
"""
</content>
</file>

<file path=".gemini/commands/speckit.checklist.toml">
<metadata>Lines: 300 | Size: 17047 B</metadata>
<content>
description = "Generate a custom checklist for the current feature based on user requirements."

prompt = """
---
description: Generate a custom checklist for the current feature based on user requirements.
---

## Checklist Purpose: "Unit Tests for English"

**CRITICAL CONCEPT**: Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality, clarity, and completeness of requirements in a given domain.

**NOT for verification/testing**:

- ❌ NOT "Verify the button clicks correctly"
- ❌ NOT "Test error handling works"
- ❌ NOT "Confirm the API returns 200"
- ❌ NOT checking if code/implementation matches the spec

**FOR requirements quality validation**:

- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
- ✅ "Are accessibility requirements defined for keyboard navigation?" (coverage)
- ✅ "Does the spec define what happens when logo image fails to load?" (edge cases)

**Metaphor**: If your spec is code written in English, the checklist is its unit test suite. You're testing whether the requirements are well-written, complete, unambiguous, and ready for implementation - NOT whether the implementation works.

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Execution Steps

1. **Setup**: Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json` from repo root and parse JSON for FEATURE_DIR and AVAILABLE_DOCS list.
   - All file paths must be absolute.
   - For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Clarify intent (dynamic)**: Derive up to THREE initial contextual clarifying questions (no pre-baked catalog). They MUST:
   - Be generated from the user's phrasing + extracted signals from spec/plan/tasks
   - Only ask about information that materially changes checklist content
   - Be skipped individually if already unambiguous in `$ARGUMENTS`
   - Prefer precision over breadth

   Generation algorithm:
   1. Extract signals: feature domain keywords (e.g., auth, latency, UX, API), risk indicators ("critical", "must", "compliance"), stakeholder hints ("QA", "review", "security team"), and explicit deliverables ("a11y", "rollback", "contracts").
   2. Cluster signals into candidate focus areas (max 4) ranked by relevance.
   3. Identify probable audience & timing (author, reviewer, QA, release) if not explicit.
   4. Detect missing dimensions: scope breadth, depth/rigor, risk emphasis, exclusion boundaries, measurable acceptance criteria.
   5. Formulate questions chosen from these archetypes:
      - Scope refinement (e.g., "Should this include integration touchpoints with X and Y or stay limited to local module correctness?")
      - Risk prioritization (e.g., "Which of these potential risk areas should receive mandatory gating checks?")
      - Depth calibration (e.g., "Is this a lightweight pre-commit sanity list or a formal release gate?")
      - Audience framing (e.g., "Will this be used by the author only or peers during PR review?")
      - Boundary exclusion (e.g., "Should we explicitly exclude performance tuning items this round?")
      - Scenario class gap (e.g., "No recovery flows detected—are rollback / partial failure paths in scope?")

   Question formatting rules:
   - If presenting options, generate a compact table with columns: Option | Candidate | Why It Matters
   - Limit to A–E options maximum; omit table if a free-form answer is clearer
   - Never ask the user to restate what they already said
   - Avoid speculative categories (no hallucination). If uncertain, ask explicitly: "Confirm whether X belongs in scope."

   Defaults when interaction impossible:
   - Depth: Standard
   - Audience: Reviewer (PR) if code-related; Author otherwise
   - Focus: Top 2 relevance clusters

   Output the questions (label Q1/Q2/Q3). After answers: if ≥2 scenario classes (Alternate / Exception / Recovery / Non-Functional domain) remain unclear, you MAY ask up to TWO more targeted follow‑ups (Q4/Q5) with a one-line justification each (e.g., "Unresolved recovery path risk"). Do not exceed five total questions. Skip escalation if user explicitly declines more.

3. **Understand user request**: Combine `$ARGUMENTS` + clarifying answers:
   - Derive checklist theme (e.g., security, review, deploy, ux)
   - Consolidate explicit must-have items mentioned by user
   - Map focus selections to category scaffolding
   - Infer any missing context from spec/plan/tasks (do NOT hallucinate)

4. **Load feature context**: Read from FEATURE_DIR:
   - spec.md: Feature requirements and scope
   - plan.md (if exists): Technical details, dependencies
   - tasks.md (if exists): Implementation tasks

   **Context Loading Strategy**:
   - Load only necessary portions relevant to active focus areas (avoid full-file dumping)
   - Prefer summarizing long sections into concise scenario/requirement bullets
   - Use progressive disclosure: add follow-on retrieval only if gaps detected
   - If source docs are large, generate interim summary items instead of embedding raw text

5. **Generate checklist** - Create "Unit Tests for Requirements":
   - Create `FEATURE_DIR/checklists/` directory if it doesn't exist
   - Generate unique checklist filename:
     - Use short, descriptive name based on domain (e.g., `ux.md`, `api.md`, `security.md`)
     - Format: `[domain].md`
   - File handling behavior:
     - If file does NOT exist: Create new file and number items starting from CHK001
     - If file exists: Append new items to existing file, continuing from the last CHK ID (e.g., if last item is CHK015, start new items at CHK016)
   - Never delete or replace existing checklist content - always preserve and append

   **CORE PRINCIPLE - Test the Requirements, Not the Implementation**:
   Every checklist item MUST evaluate the REQUIREMENTS THEMSELVES for:
   - **Completeness**: Are all necessary requirements present?
   - **Clarity**: Are requirements unambiguous and specific?
   - **Consistency**: Do requirements align with each other?
   - **Measurability**: Can requirements be objectively verified?
   - **Coverage**: Are all scenarios/edge cases addressed?

   **Category Structure** - Group items by requirement quality dimensions:
   - **Requirement Completeness** (Are all necessary requirements documented?)
   - **Requirement Clarity** (Are requirements specific and unambiguous?)
   - **Requirement Consistency** (Do requirements align without conflicts?)
   - **Acceptance Criteria Quality** (Are success criteria measurable?)
   - **Scenario Coverage** (Are all flows/cases addressed?)
   - **Edge Case Coverage** (Are boundary conditions defined?)
   - **Non-Functional Requirements** (Performance, Security, Accessibility, etc. - are they specified?)
   - **Dependencies & Assumptions** (Are they documented and validated?)
   - **Ambiguities & Conflicts** (What needs clarification?)

   **HOW TO WRITE CHECKLIST ITEMS - "Unit Tests for English"**:

   ❌ **WRONG** (Testing implementation):
   - "Verify landing page displays 3 episode cards"
   - "Test hover states work on desktop"
   - "Confirm logo click navigates home"

   ✅ **CORRECT** (Testing requirements quality):
   - "Are the exact number and layout of featured episodes specified?" [Completeness]
   - "Is 'prominent display' quantified with specific sizing/positioning?" [Clarity]
   - "Are hover state requirements consistent across all interactive elements?" [Consistency]
   - "Are keyboard navigation requirements defined for all interactive UI?" [Coverage]
   - "Is the fallback behavior specified when logo image fails to load?" [Edge Cases]
   - "Are loading states defined for asynchronous episode data?" [Completeness]
   - "Does the spec define visual hierarchy for competing UI elements?" [Clarity]

   **ITEM STRUCTURE**:
   Each item should follow this pattern:
   - Question format asking about requirement quality
   - Focus on what's WRITTEN (or not written) in the spec/plan
   - Include quality dimension in brackets [Completeness/Clarity/Consistency/etc.]
   - Reference spec section `[Spec §X.Y]` when checking existing requirements
   - Use `[Gap]` marker when checking for missing requirements

   **EXAMPLES BY QUALITY DIMENSION**:

   Completeness:
   - "Are error handling requirements defined for all API failure modes? [Gap]"
   - "Are accessibility requirements specified for all interactive elements? [Completeness]"
   - "Are mobile breakpoint requirements defined for responsive layouts? [Gap]"

   Clarity:
   - "Is 'fast loading' quantified with specific timing thresholds? [Clarity, Spec §NFR-2]"
   - "Are 'related episodes' selection criteria explicitly defined? [Clarity, Spec §FR-5]"
   - "Is 'prominent' defined with measurable visual properties? [Ambiguity, Spec §FR-4]"

   Consistency:
   - "Do navigation requirements align across all pages? [Consistency, Spec §FR-10]"
   - "Are card component requirements consistent between landing and detail pages? [Consistency]"

   Coverage:
   - "Are requirements defined for zero-state scenarios (no episodes)? [Coverage, Edge Case]"
   - "Are concurrent user interaction scenarios addressed? [Coverage, Gap]"
   - "Are requirements specified for partial data loading failures? [Coverage, Exception Flow]"

   Measurability:
   - "Are visual hierarchy requirements measurable/testable? [Acceptance Criteria, Spec §FR-1]"
   - "Can 'balanced visual weight' be objectively verified? [Measurability, Spec §FR-2]"

   **Scenario Classification & Coverage** (Requirements Quality Focus):
   - Check if requirements exist for: Primary, Alternate, Exception/Error, Recovery, Non-Functional scenarios
   - For each scenario class, ask: "Are [scenario type] requirements complete, clear, and consistent?"
   - If scenario class missing: "Are [scenario type] requirements intentionally excluded or missing? [Gap]"
   - Include resilience/rollback when state mutation occurs: "Are rollback requirements defined for migration failures? [Gap]"

   **Traceability Requirements**:
   - MINIMUM: ≥80% of items MUST include at least one traceability reference
   - Each item should reference: spec section `[Spec §X.Y]`, or use markers: `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`
   - If no ID system exists: "Is a requirement & acceptance criteria ID scheme established? [Traceability]"

   **Surface & Resolve Issues** (Requirements Quality Problems):
   Ask questions about the requirements themselves:
   - Ambiguities: "Is the term 'fast' quantified with specific metrics? [Ambiguity, Spec §NFR-1]"
   - Conflicts: "Do navigation requirements conflict between §FR-10 and §FR-10a? [Conflict]"
   - Assumptions: "Is the assumption of 'always available podcast API' validated? [Assumption]"
   - Dependencies: "Are external podcast API requirements documented? [Dependency, Gap]"
   - Missing definitions: "Is 'visual hierarchy' defined with measurable criteria? [Gap]"

   **Content Consolidation**:
   - Soft cap: If raw candidate items > 40, prioritize by risk/impact
   - Merge near-duplicates checking the same requirement aspect
   - If >5 low-impact edge cases, create one item: "Are edge cases X, Y, Z addressed in requirements? [Coverage]"

   **🚫 ABSOLUTELY PROHIBITED** - These make it an implementation test, not a requirements test:
   - ❌ Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
   - ❌ References to code execution, user actions, system behavior
   - ❌ "Displays correctly", "works properly", "functions as expected"
   - ❌ "Click", "navigate", "render", "load", "execute"
   - ❌ Test cases, test plans, QA procedures
   - ❌ Implementation details (frameworks, APIs, algorithms)

   **✅ REQUIRED PATTERNS** - These test requirements quality:
   - ✅ "Are [requirement type] defined/specified/documented for [scenario]?"
   - ✅ "Is [vague term] quantified/clarified with specific criteria?"
   - ✅ "Are requirements consistent between [section A] and [section B]?"
   - ✅ "Can [requirement] be objectively measured/verified?"
   - ✅ "Are [edge cases/scenarios] addressed in requirements?"
   - ✅ "Does the spec define [missing aspect]?"

6. **Structure Reference**: Generate the checklist following the canonical template in `.specify/templates/checklist-template.md` for title, meta section, category headings, and ID formatting. If template is unavailable, use: H1 title, purpose/created meta lines, `##` category sections containing `- [ ] CHK### <requirement item>` lines with globally incrementing IDs starting at CHK001.

7. **Report**: Output full path to checklist file, item count, and summarize whether the run created a new file or appended to an existing one. Summarize:
   - Focus areas selected
   - Depth level
   - Actor/timing
   - Any explicit user-specified must-have items incorporated

**Important**: Each `/speckit.checklist` command invocation uses a short, descriptive checklist filename and either creates a new file or appends to an existing one. This allows:

- Multiple checklists of different types (e.g., `ux.md`, `test.md`, `security.md`)
- Simple, memorable filenames that indicate checklist purpose
- Easy identification and navigation in the `checklists/` folder

To avoid clutter, use descriptive types and clean up obsolete checklists when done.

## Example Checklist Types & Sample Items

**UX Requirements Quality:** `ux.md`

Sample items (testing the requirements, NOT the implementation):

- "Are visual hierarchy requirements defined with measurable criteria? [Clarity, Spec §FR-1]"
- "Is the number and positioning of UI elements explicitly specified? [Completeness, Spec §FR-1]"
- "Are interaction state requirements (hover, focus, active) consistently defined? [Consistency]"
- "Are accessibility requirements specified for all interactive elements? [Coverage, Gap]"
- "Is fallback behavior defined when images fail to load? [Edge Case, Gap]"
- "Can 'prominent display' be objectively measured? [Measurability, Spec §FR-4]"

**API Requirements Quality:** `api.md`

Sample items:

- "Are error response formats specified for all failure scenarios? [Completeness]"
- "Are rate limiting requirements quantified with specific thresholds? [Clarity]"
- "Are authentication requirements consistent across all endpoints? [Consistency]"
- "Are retry/timeout requirements defined for external dependencies? [Coverage, Gap]"
- "Is versioning strategy documented in requirements? [Gap]"

**Performance Requirements Quality:** `performance.md`

Sample items:

- "Are performance requirements quantified with specific metrics? [Clarity]"
- "Are performance targets defined for all critical user journeys? [Coverage]"
- "Are performance requirements under different load conditions specified? [Completeness]"
- "Can performance requirements be objectively measured? [Measurability]"
- "Are degradation requirements defined for high-load scenarios? [Edge Case, Gap]"

**Security Requirements Quality:** `security.md`

Sample items:

- "Are authentication requirements specified for all protected resources? [Coverage]"
- "Are data protection requirements defined for sensitive information? [Completeness]"
- "Is the threat model documented and requirements aligned to it? [Traceability]"
- "Are security requirements consistent with compliance obligations? [Consistency]"
- "Are security failure/breach response requirements defined? [Gap, Exception Flow]"

## Anti-Examples: What NOT To Do

**❌ WRONG - These test implementation, not requirements:**

~~~markdown
- [ ] CHK001 - Verify landing page displays 3 episode cards [Spec §FR-001]
- [ ] CHK002 - Test hover states work correctly on desktop [Spec §FR-003]
- [ ] CHK003 - Confirm logo click navigates to home page [Spec §FR-010]
- [ ] CHK004 - Check that related episodes section shows 3-5 items [Spec §FR-005]
~~~

**✅ CORRECT - These test requirements quality:**

~~~markdown
- [ ] CHK001 - Are the number and layout of featured episodes explicitly specified? [Completeness, Spec §FR-001]
- [ ] CHK002 - Are hover state requirements consistently defined for all interactive elements? [Consistency, Spec §FR-003]
- [ ] CHK003 - Are navigation requirements clear for all clickable brand elements? [Clarity, Spec §FR-010]
- [ ] CHK004 - Is the selection criteria for related episodes documented? [Gap, Spec §FR-005]
- [ ] CHK005 - Are loading state requirements defined for asynchronous episode data? [Gap]
- [ ] CHK006 - Can "visual hierarchy" requirements be objectively measured? [Measurability, Spec §FR-001]
~~~

**Key Differences:**

- Wrong: Tests if the system works correctly
- Correct: Tests if the requirements are written correctly
- Wrong: Verification of behavior
- Correct: Validation of requirement quality
- Wrong: "Does it do X?"
- Correct: "Is X clearly specified?"
"""
</content>
</file>

<file path=".gemini/commands/speckit.clarify.toml">
<metadata>Lines: 186 | Size: 11502 B</metadata>
<content>
description = "Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec."

prompt = """
---
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Outline

Goal: Detect and reduce ambiguity or missing decision points in the active feature specification and record the clarifications directly in the spec file.

Note: This clarification workflow is expected to run (and be completed) BEFORE invoking `/speckit.plan`. If the user explicitly states they are skipping clarification (e.g., exploratory spike), you may proceed, but must warn that downstream rework risk increases.

Execution steps:

1. Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly` from repo root **once** (combined `--json --paths-only` mode / `-Json -PathsOnly`). Parse minimal JSON payload fields:
   - `FEATURE_DIR`
   - `FEATURE_SPEC`
   - (Optionally capture `IMPL_PLAN`, `TASKS` for future chained flows.)
   - If JSON parsing fails, abort and instruct user to re-run `/speckit.specify` or verify feature branch environment.
   - For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").

2. Load the current spec file. Perform a structured ambiguity & coverage scan using this taxonomy. For each category, mark status: Clear / Partial / Missing. Produce an internal coverage map used for prioritization (do not output raw map unless no questions will be asked).

   Functional Scope & Behavior:
   - Core user goals & success criteria
   - Explicit out-of-scope declarations
   - User roles / personas differentiation

   Domain & Data Model:
   - Entities, attributes, relationships
   - Identity & uniqueness rules
   - Lifecycle/state transitions
   - Data volume / scale assumptions

   Interaction & UX Flow:
   - Critical user journeys / sequences
   - Error/empty/loading states
   - Accessibility or localization notes

   Non-Functional Quality Attributes:
   - Performance (latency, throughput targets)
   - Scalability (horizontal/vertical, limits)
   - Reliability & availability (uptime, recovery expectations)
   - Observability (logging, metrics, tracing signals)
   - Security & privacy (authN/Z, data protection, threat assumptions)
   - Compliance / regulatory constraints (if any)

   Integration & External Dependencies:
   - External services/APIs and failure modes
   - Data import/export formats
   - Protocol/versioning assumptions

   Edge Cases & Failure Handling:
   - Negative scenarios
   - Rate limiting / throttling
   - Conflict resolution (e.g., concurrent edits)

   Constraints & Tradeoffs:
   - Technical constraints (language, storage, hosting)
   - Explicit tradeoffs or rejected alternatives

   Terminology & Consistency:
   - Canonical glossary terms
   - Avoided synonyms / deprecated terms

   Completion Signals:
   - Acceptance criteria testability
   - Measurable Definition of Done style indicators

   Misc / Placeholders:
   - TODO markers / unresolved decisions
   - Ambiguous adjectives ("robust", "intuitive") lacking quantification

   For each category with Partial or Missing status, add a candidate question opportunity unless:
   - Clarification would not materially change implementation or validation strategy
   - Information is better deferred to planning phase (note internally)

3. Generate (internally) a prioritized queue of candidate clarification questions (maximum 5). Do NOT output them all at once. Apply these constraints:
    - Maximum of 5 total questions across the whole session.
    - Each question must be answerable with EITHER:
       - A short multiple‑choice selection (2–5 distinct, mutually exclusive options), OR
       - A one-word / short‑phrase answer (explicitly constrain: "Answer in <=5 words").
    - Only include questions whose answers materially impact architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, or compliance validation.
    - Ensure category coverage balance: attempt to cover the highest impact unresolved categories first; avoid asking two low-impact questions when a single high-impact area (e.g., security posture) is unresolved.
    - Exclude questions already answered, trivial stylistic preferences, or plan-level execution details (unless blocking correctness).
    - Favor clarifications that reduce downstream rework risk or prevent misaligned acceptance tests.
    - If more than 5 categories remain unresolved, select the top 5 by (Impact * Uncertainty) heuristic.

4. Sequential questioning loop (interactive):
    - Present EXACTLY ONE question at a time.
    - For multiple‑choice questions:
       - **Analyze all options** and determine the **most suitable option** based on:
          - Best practices for the project type
          - Common patterns in similar implementations
          - Risk reduction (security, performance, maintainability)
          - Alignment with any explicit project goals or constraints visible in the spec
       - Present your **recommended option prominently** at the top with clear reasoning (1-2 sentences explaining why this is the best choice).
       - Format as: `**Recommended:** Option [X] - <reasoning>`
       - Then render all options as a Markdown table:

       | Option | Description |
       |--------|-------------|
       | A | <Option A description> |
       | B | <Option B description> |
       | C | <Option C description> (add D/E as needed up to 5) |
       | Short | Provide a different short answer (<=5 words) (Include only if free-form alternative is appropriate) |

       - After the table, add: `You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or provide your own short answer.`
    - For short‑answer style (no meaningful discrete options):
       - Provide your **suggested answer** based on best practices and context.
       - Format as: `**Suggested:** <your proposed answer> - <brief reasoning>`
       - Then output: `Format: Short answer (<=5 words). You can accept the suggestion by saying "yes" or "suggested", or provide your own answer.`
    - After the user answers:
       - If the user replies with "yes", "recommended", or "suggested", use your previously stated recommendation/suggestion as the answer.
       - Otherwise, validate the answer maps to one option or fits the <=5 word constraint.
       - If ambiguous, ask for a quick disambiguation (count still belongs to same question; do not advance).
       - Once satisfactory, record it in working memory (do not yet write to disk) and move to the next queued question.
    - Stop asking further questions when:
       - All critical ambiguities resolved early (remaining queued items become unnecessary), OR
       - User signals completion ("done", "good", "no more"), OR
       - You reach 5 asked questions.
    - Never reveal future queued questions in advance.
    - If no valid questions exist at start, immediately report no critical ambiguities.

5. Integration after EACH accepted answer (incremental update approach):
    - Maintain in-memory representation of the spec (loaded once at start) plus the raw file contents.
    - For the first integrated answer in this session:
       - Ensure a `## Clarifications` section exists (create it just after the highest-level contextual/overview section per the spec template if missing).
       - Under it, create (if not present) a `### Session YYYY-MM-DD` subheading for today.
    - Append a bullet line immediately after acceptance: `- Q: <question> → A: <final answer>`.
    - Then immediately apply the clarification to the most appropriate section(s):
       - Functional ambiguity → Update or add a bullet in Functional Requirements.
       - User interaction / actor distinction → Update User Stories or Actors subsection (if present) with clarified role, constraint, or scenario.
       - Data shape / entities → Update Data Model (add fields, types, relationships) preserving ordering; note added constraints succinctly.
       - Non-functional constraint → Add/modify measurable criteria in Non-Functional / Quality Attributes section (convert vague adjective to metric or explicit target).
       - Edge case / negative flow → Add a new bullet under Edge Cases / Error Handling (or create such subsection if template provides placeholder for it).
       - Terminology conflict → Normalize term across spec; retain original only if necessary by adding `(formerly referred to as "X")` once.
    - If the clarification invalidates an earlier ambiguous statement, replace that statement instead of duplicating; leave no obsolete contradictory text.
    - Save the spec file AFTER each integration to minimize risk of context loss (atomic overwrite).
    - Preserve formatting: do not reorder unrelated sections; keep heading hierarchy intact.
    - Keep each inserted clarification minimal and testable (avoid narrative drift).

6. Validation (performed after EACH write plus final pass):
   - Clarifications session contains exactly one bullet per accepted answer (no duplicates).
   - Total asked (accepted) questions ≤ 5.
   - Updated sections contain no lingering vague placeholders the new answer was meant to resolve.
   - No contradictory earlier statement remains (scan for now-invalid alternative choices removed).
   - Markdown structure valid; only allowed new headings: `## Clarifications`, `### Session YYYY-MM-DD`.
   - Terminology consistency: same canonical term used across all updated sections.

7. Write the updated spec back to `FEATURE_SPEC`.

8. Report completion (after questioning loop ends or early termination):
   - Number of questions asked & answered.
   - Path to updated spec.
   - Sections touched (list names).
   - Coverage summary table listing each taxonomy category with Status: Resolved (was Partial/Missing and addressed), Deferred (exceeds question quota or better suited for planning), Clear (already sufficient), Outstanding (still Partial/Missing but low impact).
   - If any Outstanding or Deferred remain, recommend whether to proceed to `/speckit.plan` or run `/speckit.clarify` again later post-plan.
   - Suggested next command.

Behavior rules:

- If no meaningful ambiguities found (or all potential questions would be low-impact), respond: "No critical ambiguities detected worth formal clarification." and suggest proceeding.
- If spec file missing, instruct user to run `/speckit.specify` first (do not create a new spec here).
- Never exceed 5 total asked questions (clarification retries for a single question do not count as new questions).
- Avoid speculative tech stack questions unless the absence blocks functional clarity.
- Respect user early termination signals ("stop", "done", "proceed").
- If no questions asked due to full coverage, output a compact coverage summary (all categories Clear) then suggest advancing.
- If quota reached with unresolved high-impact categories remaining, explicitly flag them under Deferred with rationale.

Context for prioritization: {{args}}
"""
</content>
</file>

<file path=".gemini/commands/speckit.constitution.toml">
<metadata>Lines: 89 | Size: 5607 B</metadata>
<content>
description = "Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync."

prompt = """
---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
handoffs:
  - label: Build Specification
    agent: speckit.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are updating the project constitution at `.specify/memory/constitution.md`. This file is a TEMPLATE containing placeholder tokens in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to (a) collect/derive concrete values, (b) fill the template precisely, and (c) propagate any amendments across dependent artifacts.

**Note**: If `.specify/memory/constitution.md` does not exist yet, it should have been initialized from `.specify/templates/constitution-template.md` during project setup. If it's missing, copy the template first.

Follow this execution flow:

1. Load the existing constitution at `.specify/memory/constitution.md`.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
   **IMPORTANT**: The user might require less or more principles than the ones used in the template. If a number is specified, respect that - follow the general template. You will update the doc accordingly.

2. Collect/derive values for placeholders:
   - If user input (conversation) supplies a value, use it.
   - Otherwise infer from existing repo context (README, docs, prior constitution versions if embedded).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown ask or mark TODO), `LAST_AMENDED_DATE` is today if changes are made, otherwise keep previous.
   - `CONSTITUTION_VERSION` must increment according to semantic versioning rules:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions.
     - MINOR: New principle/section added or materially expanded guidance.
     - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
   - If version bump type ambiguous, propose reasoning before finalizing.

3. Draft the updated constitution content:
   - Replace every placeholder with concrete text (no bracketed tokens left except intentionally retained template slots that the project has chosen not to define yet—explicitly justify any left).
   - Preserve heading hierarchy and comments can be removed once replaced unless they still add clarifying guidance.
   - Ensure each Principle section: succinct name line, paragraph (or bullet list) capturing non‑negotiable rules, explicit rationale if not obvious.
   - Ensure Governance section lists amendment procedure, versioning policy, and compliance review expectations.

4. Consistency propagation checklist (convert prior checklist into active validations):
   - Read `.specify/templates/plan-template.md` and ensure any "Constitution Check" or rules align with updated principles.
   - Read `.specify/templates/spec-template.md` for scope/requirements alignment—update if constitution adds/removes mandatory sections or constraints.
   - Read `.specify/templates/tasks-template.md` and ensure task categorization reflects new or removed principle-driven task types (e.g., observability, versioning, testing discipline).
   - Read each command file in `.specify/templates/commands/*.md` (including this one) to verify no outdated references (agent-specific names like CLAUDE only) remain when generic guidance is required.
   - Read any runtime guidance docs (e.g., `README.md`, `docs/quickstart.md`, or agent-specific guidance files if present). Update references to principles changed.

5. Produce a Sync Impact Report (prepend as an HTML comment at top of the constitution file after update):
   - Version change: old → new
   - List of modified principles (old title → new title if renamed)
   - Added sections
   - Removed sections
   - Templates requiring updates (✅ updated / ⚠ pending) with file paths
   - Follow-up TODOs if any placeholders intentionally deferred.

6. Validation before final output:
   - No remaining unexplained bracket tokens.
   - Version line matches report.
   - Dates ISO format YYYY-MM-DD.
   - Principles are declarative, testable, and free of vague language ("should" → replace with MUST/SHOULD rationale where appropriate).

7. Write the completed constitution back to `.specify/memory/constitution.md` (overwrite).

8. Output a final summary to the user with:
   - New version and bump rationale.
   - Any files flagged for manual follow-up.
   - Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z (principle additions + governance update)`).

Formatting & Style Requirements:

- Use Markdown headings exactly as in the template (do not demote/promote levels).
- Wrap long rationale lines to keep readability (<100 chars ideally) but do not hard enforce with awkward breaks.
- Keep a single blank line between sections.
- Avoid trailing whitespace.

If the user supplies partial updates (e.g., only one principle revision), still perform validation and version decision steps.

If critical info missing (e.g., ratification date truly unknown), insert `TODO(<FIELD_NAME>): explanation` and include in the Sync Impact Report under deferred items.

Do not create a new template; always operate on the existing `.specify/memory/constitution.md` file.
"""
</content>
</file>

<file path=".gemini/commands/speckit.implement.toml">
<metadata>Lines: 203 | Size: 10489 B</metadata>
<content>
description = "Execute the implementation plan by processing and executing all tasks defined in tasks.md"

prompt = """
---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before implementation)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_implement` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ~~~
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ~~~
  - **Mandatory hook** (`optional: false`):
    ~~~
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ~~~
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ~~~text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ~~~

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 3

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 3

3. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

4. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ~~~sh
     git rev-parse --git-dir 2>/dev/null
     ~~~

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `*.dll`, `autom4te.cache/`, `config.status`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

5. Parse tasks.md structure and extract:
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

6. Execute implementation following the task plan:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding

7. Implementation execution rules:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If you need to write tests for contracts, entities, and integration scenarios
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

8. Progress tracking and error handling:
   - Report progress after each completed task
   - Halt execution if any non-parallel task fails
   - For parallel tasks [P], continue with successful tasks, report failed ones
   - Provide clear error messages with context for debugging
   - Suggest next steps if implementation cannot proceed
   - **IMPORTANT** For completed tasks, make sure to mark the task off as [X] in the tasks file.

9. Completion validation:
   - Verify all required tasks are completed
   - Check that implemented features match the original specification
   - Validate that tests pass and coverage meets requirements
   - Confirm the implementation follows the technical plan
   - Report final status with summary of completed work

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/speckit.tasks` first to regenerate the task list.

10. **Check for extension hooks**: After completion validation, check if `.specify/extensions.yml` exists in the project root.
    - If it exists, read it and look for entries under the `hooks.after_implement` key
    - If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
    - Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
    - For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
      - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
      - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
    - For each executable hook, output the following based on its `optional` flag:
      - **Optional hook** (`optional: true`):
        ~~~
        ## Extension Hooks

        **Optional Hook**: {extension}
        Command: `/{command}`
        Description: {description}

        Prompt: {prompt}
        To execute: `/{command}`
        ~~~
      - **Mandatory hook** (`optional: false`):
        ~~~
        ## Extension Hooks

        **Automatic Hook**: {extension}
        Executing: `/{command}`
        EXECUTE_COMMAND: {command}
        ~~~
    - If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently
"""
</content>
</file>

<file path=".gemini/commands/speckit.plan.toml">
<metadata>Lines: 158 | Size: 6329 B</metadata>
<content>
description = "Execute the implementation planning workflow using the plan template to generate design artifacts."

prompt = """
---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs:
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before planning)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_plan` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ~~~
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ~~~
  - **Mandatory hook** (`optional: false`):
    ~~~
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ~~~
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. **Setup**: Run `.specify/scripts/powershell/setup-plan.ps1 -Json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied).

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design

4. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

5. **Check for extension hooks**: After reporting, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_plan` key
   - If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
   - Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
   - For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
     - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
     - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
   - For each executable hook, output the following based on its `optional` flag:
     - **Optional hook** (`optional: true`):
       ~~~
       ## Extension Hooks

       **Optional Hook**: {extension}
       Command: `/{command}`
       Description: {description}

       Prompt: {prompt}
       To execute: `/{command}`
       ~~~
     - **Mandatory hook** (`optional: false`):
       ~~~
       ## Extension Hooks

       **Automatic Hook**: {extension}
       Executing: `/{command}`
       EXECUTE_COMMAND: {command}
       ~~~
   - If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ~~~text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ~~~

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Define interface contracts** (if project has external interfaces) → `/contracts/`:
   - Identify what interfaces the project exposes to users or other systems
   - Document the contract format appropriate for the project type
   - Examples: public APIs for libraries, command schemas for CLI tools, endpoints for web services, grammars for parsers, UI contracts for applications
   - Skip if project is purely internal (build scripts, one-off tools, etc.)

3. **Agent context update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType gemini`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
"""
</content>
</file>

<file path=".gemini/commands/speckit.specify.toml">
<metadata>Lines: 305 | Size: 15008 B</metadata>
<content>
description = "Create or update the feature specification from a natural language feature description."

prompt = """
---
description: Create or update the feature specification from a natural language feature description.
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
    send: true
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before specification)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_specify` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ~~~
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ~~~
  - **Mandatory hook** (`optional: false`):
    ~~~
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ~~~
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

The text the user typed after `/speckit.specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `{{args}}` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description, do this:

1. **Generate a concise short name** (2-4 words) for the branch:
   - Analyze the feature description and extract the most meaningful keywords
   - Create a 2-4 word short name that captures the essence of the feature
   - Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
   - Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
   - Keep it concise but descriptive enough to understand the feature at a glance
   - Examples:
     - "I want to add user authentication" → "user-auth"
     - "Implement OAuth2 integration for the API" → "oauth2-api-integration"
     - "Create a dashboard for analytics" → "analytics-dashboard"
     - "Fix payment processing timeout bug" → "fix-payment-timeout"

2. **Create the feature branch** by running the script with `--short-name` (and `--json`), and do NOT pass `--number` (the script auto-detects the next globally available number across all branches and spec directories):

   - Bash example: `.specify/scripts/powershell/create-new-feature.ps1 "{{args}}" --json --short-name "user-auth" "Add user authentication"`
   - PowerShell example: `.specify/scripts/powershell/create-new-feature.ps1 "{{args}}" -Json -ShortName "user-auth" "Add user authentication"`

   **IMPORTANT**:
   - Do NOT pass `--number` — the script determines the correct next number automatically
   - Always include the JSON flag (`--json` for Bash, `-Json` for PowerShell) so the output can be parsed reliably
   - You must only ever run this script once per feature
   - The JSON is provided in the terminal as output - always refer to it to get the actual content you're looking for
   - The JSON output will contain BRANCH_NAME and SPEC_FILE paths
   - For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot")

3. Load `.specify/templates/spec-template.md` to understand required sections.

4. Follow this execution flow:

    1. Parse user description from Input
       If empty: ERROR "No feature description provided"
    2. Extract key concepts from description
       Identify: actors, actions, data, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if:
         - The choice significantly impacts feature scope or user experience
         - Multiple reasonable interpretations exist with different implications
         - No reasonable default exists
       - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
       - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
    4. Fill User Scenarios & Testing section
       If no clear user flow: ERROR "Cannot determine user scenarios"
    5. Generate Functional Requirements
       Each requirement must be testable
       Use reasonable defaults for unspecified details (document assumptions in Assumptions section)
    6. Define Success Criteria
       Create measurable, technology-agnostic outcomes
       Include both quantitative metrics (time, performance, volume) and qualitative measures (user satisfaction, task completion)
       Each criterion must be verifiable without implementation details
    7. Identify Key Entities (if data involved)
    8. Return: SUCCESS (spec ready for planning)

5. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings.

6. **Specification Quality Validation**: After writing the initial spec, validate it against quality criteria:

   a. **Create Spec Quality Checklist**: Generate a checklist file at `FEATURE_DIR/checklists/requirements.md` using the checklist template structure with these validation items:

      ~~~markdown
      # Specification Quality Checklist: [FEATURE NAME]

      **Purpose**: Validate specification completeness and quality before proceeding to planning
      **Created**: [DATE]
      **Feature**: [Link to spec.md]

      ## Content Quality

      - [ ] No implementation details (languages, frameworks, APIs)
      - [ ] Focused on user value and business needs
      - [ ] Written for non-technical stakeholders
      - [ ] All mandatory sections completed

      ## Requirement Completeness

      - [ ] No [NEEDS CLARIFICATION] markers remain
      - [ ] Requirements are testable and unambiguous
      - [ ] Success criteria are measurable
      - [ ] Success criteria are technology-agnostic (no implementation details)
      - [ ] All acceptance scenarios are defined
      - [ ] Edge cases are identified
      - [ ] Scope is clearly bounded
      - [ ] Dependencies and assumptions identified

      ## Feature Readiness

      - [ ] All functional requirements have clear acceptance criteria
      - [ ] User scenarios cover primary flows
      - [ ] Feature meets measurable outcomes defined in Success Criteria
      - [ ] No implementation details leak into specification

      ## Notes

      - Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`
      ~~~

   b. **Run Validation Check**: Review the spec against each checklist item:
      - For each item, determine if it passes or fails
      - Document specific issues found (quote relevant spec sections)

   c. **Handle Validation Results**:

      - **If all items pass**: Mark checklist complete and proceed to step 7

      - **If items fail (excluding [NEEDS CLARIFICATION])**:
        1. List the failing items and specific issues
        2. Update the spec to address each issue
        3. Re-run validation until all items pass (max 3 iterations)
        4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user

      - **If [NEEDS CLARIFICATION] markers remain**:
        1. Extract all [NEEDS CLARIFICATION: ...] markers from the spec
        2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical (by scope/security/UX impact) and make informed guesses for the rest
        3. For each clarification needed (max 3), present options to user in this format:

           ~~~markdown
           ## Question [N]: [Topic]

           **Context**: [Quote relevant spec section]

           **What we need to know**: [Specific question from NEEDS CLARIFICATION marker]

           **Suggested Answers**:

           | Option | Answer | Implications |
           |--------|--------|--------------|
           | A      | [First suggested answer] | [What this means for the feature] |
           | B      | [Second suggested answer] | [What this means for the feature] |
           | C      | [Third suggested answer] | [What this means for the feature] |
           | Custom | Provide your own answer | [Explain how to provide custom input] |

           **Your choice**: _[Wait for user response]_
           ~~~

        4. **CRITICAL - Table Formatting**: Ensure markdown tables are properly formatted:
           - Use consistent spacing with pipes aligned
           - Each cell should have spaces around content: `| Content |` not `|Content|`
           - Header separator must have at least 3 dashes: `|--------|`
           - Test that the table renders correctly in markdown preview
        5. Number questions sequentially (Q1, Q2, Q3 - max 3 total)
        6. Present all questions together before waiting for responses
        7. Wait for user to respond with their choices for all questions (e.g., "Q1: A, Q2: Custom - [details], Q3: B")
        8. Update the spec by replacing each [NEEDS CLARIFICATION] marker with the user's selected or provided answer
        9. Re-run validation after all clarifications are resolved

   d. **Update Checklist**: After each validation iteration, update the checklist file with current pass/fail status

7. Report completion with branch name, spec file path, checklist results, and readiness for the next phase (`/speckit.clarify` or `/speckit.plan`).

8. **Check for extension hooks**: After reporting completion, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_specify` key
   - If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
   - Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
   - For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
     - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
     - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
   - For each executable hook, output the following based on its `optional` flag:
     - **Optional hook** (`optional: true`):
       ~~~
       ## Extension Hooks

       **Optional Hook**: {extension}
       Command: `/{command}`
       Description: {description}

       Prompt: {prompt}
       To execute: `/{command}`
       ~~~
     - **Mandatory hook** (`optional: false`):
       ~~~
       ## Extension Hooks

       **Automatic Hook**: {extension}
       Executing: `/{command}`
       EXECUTE_COMMAND: {command}
       ~~~
   - If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

**NOTE:** The script creates and checks out the new branch and initializes the spec file before writing.

## Quick Guidelines

- Focus on **WHAT** users need and **WHY**.
- Avoid HOW to implement (no tech stack, APIs, code structure).
- Written for business stakeholders, not developers.
- DO NOT create any checklists that are embedded in the spec. That will be a separate command.

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps
2. **Document assumptions**: Record reasonable defaults in the Assumptions section
3. **Limit clarifications**: Maximum 3 [NEEDS CLARIFICATION] markers - use only for critical decisions that:
   - Significantly impact feature scope or user experience
   - Have multiple reasonable interpretations with different implications
   - Lack any reasonable default
4. **Prioritize clarifications**: scope > security/privacy > user experience > technical details
5. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
6. **Common areas needing clarification** (only if no reasonable default exists):
   - Feature scope and boundaries (include/exclude specific use cases)
   - User types and permissions (if multiple conflicting interpretations possible)
   - Security/compliance requirements (when legally/financially significant)

**Examples of reasonable defaults** (don't ask about these):

- Data retention: Industry-standard practices for the domain
- Performance targets: Standard web/mobile app expectations unless specified
- Error handling: User-friendly messages with appropriate fallbacks
- Authentication method: Standard session-based or OAuth2 for web apps
- Integration patterns: Use project-appropriate patterns (REST/GraphQL for web services, function calls for libraries, CLI args for tools, etc.)

### Success Criteria Guidelines

Success criteria must be:

1. **Measurable**: Include specific metrics (time, percentage, count, rate)
2. **Technology-agnostic**: No mention of frameworks, languages, databases, or tools
3. **User-focused**: Describe outcomes from user/business perspective, not system internals
4. **Verifiable**: Can be tested/validated without knowing implementation details

**Good examples**:

- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"
- "Task completion rate improves by 40%"

**Bad examples** (implementation-focused):

- "API response time is under 200ms" (too technical, use "Users see results instantly")
- "Database can handle 1000 TPS" (implementation detail, use user-facing metric)
- "React components render efficiently" (framework-specific)
- "Redis cache hit rate above 80%" (technology-specific)
"""
</content>
</file>

<file path=".gemini/commands/speckit.tasks.toml">
<metadata>Lines: 205 | Size: 9282 B</metadata>
<content>
description = "Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts."

prompt = """
---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs:
  - label: Analyze For Consistency
    agent: speckit.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before tasks generation)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_tasks` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ~~~
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ~~~
  - **Mandatory hook** (`optional: false`):
    ~~~
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ~~~
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. **Setup**: Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (interface contracts), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map interface contracts to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.specify/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

6. **Check for extension hooks**: After tasks.md is generated, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_tasks` key
   - If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
   - Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
   - For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
     - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
     - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
   - For each executable hook, output the following based on its `optional` flag:
     - **Optional hook** (`optional: true`):
       ~~~
       ## Extension Hooks

       **Optional Hook**: {extension}
       Command: `/{command}`
       Description: {description}

       Prompt: {prompt}
       To execute: `/{command}`
       ~~~
     - **Mandatory hook** (`optional: false`):
       ~~~
       ## Extension Hooks

       **Automatic Hook**: {extension}
       Executing: `/{command}`
       EXECUTE_COMMAND: {command}
       ~~~
   - If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

Context for task generation: {{args}}

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

~~~text
- [ ] [TaskID] [P?] [Story?] Description with file path
~~~

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Interfaces/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each interface contract → to the user story it serves
   - If tests requested: Each interface contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns
"""
</content>
</file>

<file path=".gemini/commands/speckit.taskstoissues.toml">
<metadata>Lines: 35 | Size: 1252 B</metadata>
<content>
description = "Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts."

prompt = """
---
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
tools: ['github/github-mcp-server/issue_write']
---

## User Input

~~~text
$ARGUMENTS
~~~

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").
1. From the executed script, extract the path to **tasks**.
1. Get the Git remote by running:

~~~bash
git config --get remote.origin.url
~~~

> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

1. For each task in the list, use the GitHub MCP server to create a new issue in the repository that is representative of the Git remote.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL
"""
</content>
</file>

<file path=".gemini/settings.json">
<metadata>Lines: 47 | Size: 1093 B</metadata>
<content>
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "ctx7@latest", "mcp"],
      "env": {
        "CONTEXT7_API_KEY": "ctx7sk-5d9fe13d-6578-4b0d-bcd6-eb7cc4b7c187"
      },
      "trust": true
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "trust": true
    },
    "prettier": {
      "command": "npx",
      "args": ["-y", "@prettier/mcp"],
      "trust": true
    },
    "stylelint": {
      "command": "npx",
      "args": ["-y", "stylelint-mcp"],
      "trust": true
    },
    "eslint": {
      "command": "npx",
      "args": ["-y", "@eslint/mcp@latest"],
      "trust": true
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"],
      "trust": true
    },
    "accessibility": {
      "command": "npx",
      "args": ["-y", "a11y-mcp"],
      "trust": true
    },
    "typst-mcp": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "ghcr.io/johannesbrandenburger/typst-mcp:latest"],
      "trust": true
    }
  }
}
</content>
</file>

<file path=".geminiignore">
<metadata>Lines: 17 | Size: 178 B</metadata>
<content>
!/assets/
!/assets/**
!/.gemini/
!/assets/
!/assets/**
!/.gemini/**
!/.brain/
!/.brain/**
!/tasks/
!/tasks/**
!/plans/
!/plans/**
!/specify/
!/specify/**
!/scripts/
!/scripts/**
</content>
</file>

<file path=".specify/constitution.md">
<metadata>Lines: 93 | Size: 3529 B</metadata>
<content>
<!--
Sync Impact Report:
- Version change: 10.0.0 → 16.0.1
- List of modified principles:
  - Truth (v10) → I. TRUTH: The Brain-First Mandate (v16)
  - Vanilla Purity (v10) → II. VANILLA PURITY: Zero Dependencies & MANDATE-NAT
  - Visual Freeze (v10) → III. VISUAL FREEZE: DIN 5008 Geometry & MANDATE-VEC
- Added sections:
  - MANDATE-INJ (Security)
  - MANDATE-PLN (Plaintext-Only Integrity)
  - IMR: ISOMORPHIC MASTER REGISTRY 2.0
  - NO-JS DOCTRINE [ADR-003]
  - AGENT TOOL SAFETY — PFLICHTPROTOKOLL
- Templates requiring updates (✅ updated):
  - .specify/memory/constitution.md
-->

# v4 Core DIN-BriefNEO Constitution

**Version**: 16.0.1 | **Last Amended**: 2026-03-22 | **Ratified**: 2026-03-19

## I. OBERSTE GESETZE (MANDATES)

### [MANDATE-000] Nutzersouveraenitaet

Co-Pilot, kein Vormund. Der Nutzer behält die endgültige Kontrolle über alle Inhalte und Layout-Entscheidungen.

### [MANDATE-INJ] Security First

innerHTML für User-Content ist STRENGSTENS verboten. Nur textContent oder DOM-API verwenden, um XSS und Injektionen strukturell zu verhindern.

### [MANDATE-FREEZE] Visual Freeze

Zero-Pixel-Shift nach der Initialisierung. Das Layout muss deterministisch und stabil sein. Keine dynamischen Layout-Sprünge durch nachladende Inhalte.

### [MANDATE-VEC] Vector-Only Print Policy

Jeder Dokumenten-Export MUSS vektorbasiert sein (Native Print Engine). Pixel-basierte Hacks (Canvas, PNG, html2canvas) sind verboten, um die Druckqualität der DIN 5008 zu garantieren.

### [MANDATE-NAT] Native-First Doctrine

Alles, was moderne Browser (Chrome 147+) nativ via HTML oder CSS lösen können, MUSS so umgesetzt werden. JS ist auf Datenhaltung und IMR-Sync beschränkt.

### [MANDATE-PLN] Plaintext-Only Doctrine

ALLE <din-\*> Tags müssen `contenteditable="plaintext-only"` tragen. Dies verhindert die "stille Datenvergiftung" durch HTML-Paste und garantiert Datenintegrität.

### [MANDATE-BANNED] Banned Tools Doctrine

Die Nutzung von `head` und `tail` ist STRENGSTENS untersagt. Diese Tools fuehren zu Kontext-Fragmentierung und riskieren Datenverlust bei chirurgischen Edits. Nur `read_file` mit exakten Zeilenangaben ist zulaessig.

---

## II. ISOMORPHIC MASTER REGISTRY 2.0 (IMR) [CAA-008]

Das Drei-Einheits-Prinzip gilt ausnahmslos: `TAG = JSON-KEY = CMA-KOORDINATE`.

- Kein `getElementById` für Inhaltsfelder; stattdessen `querySelector(entry.tag)`.
- Die `TAG_MAP` wird automatisch aus der IMR generiert.
- SSoT (Single Source of Truth) is `js/constants.js`.

---

## III. NO-JS DOCTRINE [ADR-003]

JS ist NUR erlaubt für: CMA-Bridge, Fachlogik, LocalStorage, Export/Print und contenteditable I/O.
JS ist VERBOTEN für: Layout-Berechnungen, Dialog-Toggles (Popover API nutzen!), Toolbar-Visibility oder CSS-Klassen-Toggling (CSS `:has()` nutzen).

---

## IV. AGENT TOOL SAFETY — PFLICHTPROTOKOLL

Um Datenverlust durch KI-Agenten zu verhindern:

1. **READ**: Datei vor dem Schreiben vollständig lesen.
2. **IDENT**: Exakten `old_string` für Patches identifizieren.
3. **PATCH**: Chirurgische Eingriffe mit `replace` oder `edit_block` bevorzugen.
   Destruktives `write_file` ist nur für neue Dateien oder komplette Neufassungen zulässig.

---

## V. GOVERNANCE & SDD-WORKFLOW

### Workflow-Gate

Kein Code darf ohne zementierten Plan (`status: cemented`) erstellt werden.
Reihenfolge: `SPEC → SPECIFY (WHAT) → PLAN (HOW) → CODE`.

### Änderungsverfahren

Änderungen an dieser Konstitution erfordern eine MAJOR-Versionserhöhung.
Anpassungen der Mandate müssen in der `GEMINI.md` im Root gespiegelt werden.
</content>
</file>

<file path=".specify/init-options.json">
<metadata>Lines: 10 | Size: 152 B</metadata>
<content>
{
  "ai": "gemini",
  "ai_commands_dir": null,
  "ai_skills": true,
  "here": false,
  "preset": null,
  "script": "ps",
  "speckit_version": "0.3.2"
}
</content>
</file>

<file path=".specify/scripts/check-prerequisites.ps1">
<metadata>Lines: 149 | Size: 4805 B</metadata>
<content>
#!/usr/bin/env pwsh

# Consolidated prerequisite checking script (PowerShell)
#
# This script provides unified prerequisite checking for Spec-Driven Development workflow.
# It replaces the functionality previously spread across multiple scripts.
#
# Usage: ./check-prerequisites.ps1 [OPTIONS]
#
# OPTIONS:
#   -Json               Output in JSON format
#   -RequireTasks       Require tasks.md to exist (for implementation phase)
#   -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
#   -PathsOnly          Only output path variables (no validation)
#   -Help, -h           Show help message

[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks,
    [switch]$PathsOnly,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output @"
Usage: check-prerequisites.ps1 [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  -Json               Output in JSON format
  -RequireTasks       Require tasks.md to exist (for implementation phase)
  -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
  -PathsOnly          Only output path variables (no prerequisite validation)
  -Help, -h           Show this help message

EXAMPLES:
  # Check task prerequisites (plan.md required)
  .\check-prerequisites.ps1 -Json

  # Check implementation prerequisites (plan.md + tasks.md required)
  .\check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks

  # Get feature paths only (no validation)
  .\check-prerequisites.ps1 -PathsOnly

"@
    exit 0
}

# Source common functions
. "$PSScriptRoot/common.ps1"

# Get feature paths and validate branch
$paths = Get-FeaturePathsEnv

if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit:$paths.HAS_GIT)) {
    exit 1
}

# If paths-only mode, output paths and exit (support combined -Json -PathsOnly)
if ($PathsOnly) {
    if ($Json) {
        [PSCustomObject]@{
            REPO_ROOT    = $paths.REPO_ROOT
            BRANCH       = $paths.CURRENT_BRANCH
            FEATURE_DIR  = $paths.FEATURE_DIR
            FEATURE_SPEC = $paths.FEATURE_SPEC
            IMPL_PLAN    = $paths.IMPL_PLAN
            TASKS        = $paths.TASKS
        } | ConvertTo-Json -Compress
    } else {
        Write-Output "REPO_ROOT: $($paths.REPO_ROOT)"
        Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
        Write-Output "FEATURE_DIR: $($paths.FEATURE_DIR)"
        Write-Output "FEATURE_SPEC: $($paths.FEATURE_SPEC)"
        Write-Output "IMPL_PLAN: $($paths.IMPL_PLAN)"
        Write-Output "TASKS: $($paths.TASKS)"
    }
    exit 0
}

# Validate required directories and files
if (-not (Test-Path $paths.FEATURE_DIR -PathType Container)) {
    Write-Output "ERROR: Feature directory not found: $($paths.FEATURE_DIR)"
    Write-Output "Run /speckit.specify first to create the feature structure."
    exit 1
}

if (-not (Test-Path $paths.IMPL_PLAN -PathType Leaf)) {
    Write-Output "ERROR: plan.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /speckit.plan first to create the implementation plan."
    exit 1
}

# Check for tasks.md if required
if ($RequireTasks -and -not (Test-Path $paths.TASKS -PathType Leaf)) {
    Write-Output "ERROR: tasks.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /speckit.tasks first to create the task list."
    exit 1
}

# Build list of available documents
$docs = @()

# Always check these optional docs
if (Test-Path $paths.RESEARCH) { $docs += 'research.md' }
if (Test-Path $paths.DATA_MODEL) { $docs += 'data-model.md' }

# Check contracts directory (only if it exists and has files)
if ((Test-Path $paths.CONTRACTS_DIR) -and (Get-ChildItem -Path $paths.CONTRACTS_DIR -ErrorAction SilentlyContinue | Select-Object -First 1)) {
    $docs += 'contracts/'
}

if (Test-Path $paths.QUICKSTART) { $docs += 'quickstart.md' }

# Include tasks.md if requested and it exists
if ($IncludeTasks -and (Test-Path $paths.TASKS)) {
    $docs += 'tasks.md'
}

# Output results
if ($Json) {
    # JSON output
    [PSCustomObject]@{
        FEATURE_DIR = $paths.FEATURE_DIR
        AVAILABLE_DOCS = $docs
    } | ConvertTo-Json -Compress
} else {
    # Text output
    Write-Output "FEATURE_DIR:$($paths.FEATURE_DIR)"
    Write-Output "AVAILABLE_DOCS:"

    # Show status of each potential document
    Test-FileExists -Path $paths.RESEARCH -Description 'research.md' | Out-Null
    Test-FileExists -Path $paths.DATA_MODEL -Description 'data-model.md' | Out-Null
    Test-DirHasFiles -Path $paths.CONTRACTS_DIR -Description 'contracts/' | Out-Null
    Test-FileExists -Path $paths.QUICKSTART -Description 'quickstart.md' | Out-Null

    if ($IncludeTasks) {
        Test-FileExists -Path $paths.TASKS -Description 'tasks.md' | Out-Null
    }
}
</content>
</file>

<file path=".specify/scripts/common.ps1">
<metadata>Lines: 205 | Size: 6574 B</metadata>
<content>
#!/usr/bin/env pwsh
# Common PowerShell functions analogous to common.sh

function Get-RepoRoot {
    try {
        $result = git rev-parse --show-toplevel 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $result
        }
    } catch {
        # Git command failed
    }

    # Fall back to script location for non-git repos
    return (Resolve-Path (Join-Path $PSScriptRoot "../../..")).Path
}

function Get-CurrentBranch {
    # First check if SPECIFY_FEATURE environment variable is set
    if ($env:SPECIFY_FEATURE) {
        return $env:SPECIFY_FEATURE
    }

    # Then check git if available
    try {
        $result = git rev-parse --abbrev-ref HEAD 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $result
        }
    } catch {
        # Git command failed
    }

    # For non-git repos, try to find the latest feature directory
    $repoRoot = Get-RepoRoot
    $specsDir = Join-Path $repoRoot "specs"

    if (Test-Path $specsDir) {
        $latestFeature = ""
        $highest = 0

        Get-ChildItem -Path $specsDir -Directory | ForEach-Object {
            if ($_.Name -match '^(\d{3})-') {
                $num = [int]$matches[1]
                if ($num -gt $highest) {
                    $highest = $num
                    $latestFeature = $_.Name
                }
            }
        }

        if ($latestFeature) {
            return $latestFeature
        }
    }

    # Final fallback
    return "main"
}

function Test-HasGit {
    try {
        git rev-parse --show-toplevel 2>$null | Out-Null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
}

function Test-FeatureBranch {
    param(
        [string]$Branch,
        [bool]$HasGit = $true
    )

    # For non-git repos, we can't enforce branch naming but still provide output
    if (-not $HasGit) {
        Write-Warning "[specify] Warning: Git repository not detected; skipped branch validation"
        return $true
    }

    if ($Branch -notmatch '^[0-9]{3}-') {
        Write-Output "ERROR: Not on a feature branch. Current branch: $Branch"
        Write-Output "Feature branches should be named like: 001-feature-name"
        return $false
    }
    return $true
}

function Get-FeatureDir {
    param([string]$RepoRoot, [string]$Branch)
    Join-Path $RepoRoot "specs/$Branch"
}

function Get-FeaturePathsEnv {
    $repoRoot = Get-RepoRoot
    $currentBranch = Get-CurrentBranch
    $hasGit = Test-HasGit
    $featureDir = Get-FeatureDir -RepoRoot $repoRoot -Branch $currentBranch

    [PSCustomObject]@{
        REPO_ROOT     = $repoRoot
        CURRENT_BRANCH = $currentBranch
        HAS_GIT       = $hasGit
        FEATURE_DIR   = $featureDir
        FEATURE_SPEC  = Join-Path $featureDir 'spec.md'
        IMPL_PLAN     = Join-Path $featureDir 'plan.md'
        TASKS         = Join-Path $featureDir 'tasks.md'
        RESEARCH      = Join-Path $featureDir 'research.md'
        DATA_MODEL    = Join-Path $featureDir 'data-model.md'
        QUICKSTART    = Join-Path $featureDir 'quickstart.md'
        CONTRACTS_DIR = Join-Path $featureDir 'contracts'
    }
}

function Test-FileExists {
    param([string]$Path, [string]$Description)
    if (Test-Path -Path $Path -PathType Leaf) {
        Write-Output "  ✓ $Description"
        return $true
    } else {
        Write-Output "  ✗ $Description"
        return $false
    }
}

function Test-DirHasFiles {
    param([string]$Path, [string]$Description)
    if ((Test-Path -Path $Path -PathType Container) -and (Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | Select-Object -First 1)) {
        Write-Output "  ✓ $Description"
        return $true
    } else {
        Write-Output "  ✗ $Description"
        return $false
    }
}

# Resolve a template name to a file path using the priority stack:
#   1. .specify/templates/overrides/
#   2. .specify/presets/<preset-id>/templates/ (sorted by priority from .registry)
#   3. .specify/extensions/<ext-id>/templates/
#   4. .specify/templates/ (core)
function Resolve-Template {
    param(
        [Parameter(Mandatory=$true)][string]$TemplateName,
        [Parameter(Mandatory=$true)][string]$RepoRoot
    )

    $base = Join-Path $RepoRoot '.specify/templates'

    # Priority 1: Project overrides
    $override = Join-Path $base "overrides/$TemplateName.md"
    if (Test-Path $override) { return $override }

    # Priority 2: Installed presets (sorted by priority from .registry)
    $presetsDir = Join-Path $RepoRoot '.specify/presets'
    if (Test-Path $presetsDir) {
        $registryFile = Join-Path $presetsDir '.registry'
        $sortedPresets = @()
        if (Test-Path $registryFile) {
            try {
                $registryData = Get-Content $registryFile -Raw | ConvertFrom-Json
                $presets = $registryData.presets
                if ($presets) {
                    $sortedPresets = $presets.PSObject.Properties |
                        Sort-Object { if ($null -ne $_.Value.priority) { $_.Value.priority } else { 10 } } |
                        ForEach-Object { $_.Name }
                }
            } catch {
                # Fallback: alphabetical directory order
                $sortedPresets = @()
            }
        }

        if ($sortedPresets.Count -gt 0) {
            foreach ($presetId in $sortedPresets) {
                $candidate = Join-Path $presetsDir "$presetId/templates/$TemplateName.md"
                if (Test-Path $candidate) { return $candidate }
            }
        } else {
            # Fallback: alphabetical directory order
            foreach ($preset in Get-ChildItem -Path $presetsDir -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike '.*' }) {
                $candidate = Join-Path $preset.FullName "templates/$TemplateName.md"
                if (Test-Path $candidate) { return $candidate }
            }
        }
    }

    # Priority 3: Extension-provided templates
    $extDir = Join-Path $RepoRoot '.specify/extensions'
    if (Test-Path $extDir) {
        foreach ($ext in Get-ChildItem -Path $extDir -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike '.*' } | Sort-Object Name) {
            $candidate = Join-Path $ext.FullName "templates/$TemplateName.md"
            if (Test-Path $candidate) { return $candidate }
        }
    }

    # Priority 4: Core templates
    $core = Join-Path $base "$TemplateName.md"
    if (Test-Path $core) { return $core }

    return $null
}
</content>
</file>

<file path=".specify/scripts/init-feature.ps1">
<metadata>Lines: 107 | Size: 3481 B</metadata>
<content>
#!/usr/bin/env pwsh
# .specify/scripts/init-feature.ps1
# Consolidated script to create a new feature and setup its implementation plan.
# Combines logic from create-new-feature.ps1 and setup-plan.ps1.

[CmdletBinding()]
param(
    [switch]$Json,
    [string]$ShortName,
    [Parameter()]
    [int]$Number = 0,
    [switch]$Help,
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$FeatureDescription
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Host "Usage: ./init-feature.ps1 [-Json] [-ShortName <name>] [-Number N] <feature description>"
    Write-Host "Options:"
    Write-Host "  -Json               Output in JSON format"
    Write-Host "  -ShortName <name>   Provide a custom short name for the branch"
    Write-Host "  -Number N           Specify branch number manually"
    exit 0
}

# Load common functions
if (Test-Path "$PSScriptRoot/common.ps1") {
    . "$PSScriptRoot/common.ps1"
} else {
    Write-Error "Error: common.ps1 not found in $PSScriptRoot"
    exit 1
}

# 1. CREATE FEATURE LOGIC
if (-not $FeatureDescription -or $FeatureDescription.Count -eq 0) {
    Write-Error "Error: Feature description required."
    exit 1
}

$featureDesc = ($FeatureDescription -join ' ').Trim()
$repoRoot = (git rev-parse --show-toplevel 2>$null) || $PSScriptRoot

# Determine branch suffix
function Get-BranchSuffix {
    param([string]$Description, [string]$ShortName)
    if ($ShortName) { return $ShortName.ToLower() -replace '[^a-z0-9]', '-' }

    $clean = $Description.ToLower() -replace '[^a-z0-9\s]', ' '
    $words = $clean -split '\s+' | Where-Object { $_.Length -ge 3 } | Select-Object -First 3
    return $words -join '-'
}

$branchSuffix = Get-BranchSuffix -Description $featureDesc -ShortName $ShortName

# Determine Number (Simplified for consolidation)
if ($Number -eq 0) {
    $specsDir = Join-Path $repoRoot 'specs'
    $highest = 0
    if (Test-Path $specsDir) {
        Get-ChildItem -Path $specsDir -Directory | ForEach-Object {
            if ($_.Name -match '^(\d+)') {
                $num = [int]$matches[1]
                if ($num -gt $highest) { $highest = $num }
            }
        }
    }
    $Number = $highest + 1
}

$featureNum = ('{0:000}' -f $Number)
$branchName = "$featureNum-$branchSuffix"

# Create Branch
if (git rev-parse --git-dir 2>$null) {
    git checkout -b $branchName 2>$null
    Write-Host "Branch created: $branchName" -ForegroundColor Green
}

# Create Directory and Files
$featureDir = Join-Path $repoRoot "specs/$branchName"
New-Item -ItemType Directory -Path $featureDir -Force | Out-Null

# 2. SETUP PLAN LOGIC (Consolidated)
function Copy-Template {
    param($TemplateName, $DestFile)
    $templatePath = Join-Path $repoRoot ".specify/templates/$TemplateName.md"
    if (Test-Path $templatePath) {
        Copy-Item $templatePath $DestFile -Force
        Write-Host "Initialized $TemplateName: $DestFile" -ForegroundColor Cyan
    } else {
        New-Item -ItemType File -Path $DestFile -Force | Out-Null
        Write-Warning "Template $TemplateName not found, created empty file."
    }
}

Copy-Template -TemplateName "spec-template" -DestFile (Join-Path $featureDir "spec.md")
Copy-Template -TemplateName "plan-template" -DestFile (Join-Path $featureDir "plan.md")

if ($Json) {
    @{ BRANCH=$branchName; DIR=$featureDir } | ConvertTo-Json
} else {
    Write-Host "Feature '$branchName' initialized successfully." -ForegroundColor Green
}
</content>
</file>

<file path=".specify/scripts/update-agent-context.ps1">
<metadata>Lines: 480 | Size: 23083 B</metadata>
<content>
#!/usr/bin/env pwsh
<#!
.SYNOPSIS
Update agent context files with information from plan.md (PowerShell version)

.DESCRIPTION
Mirrors the behavior of scripts/bash/update-agent-context.sh:
 1. Environment Validation
 2. Plan Data Extraction
 3. Agent File Management (create from template or update existing)
 4. Content Generation (technology stack, recent changes, timestamp)
 5. Multi-Agent Support (claude, gemini, copilot, cursor-agent, qwen, opencode, codex, windsurf, kilocode, auggie, roo, codebuddy, amp, shai, tabnine, kiro-cli, agy, bob, vibe, qodercli, kimi, trae, pi, iflow, generic)

.PARAMETER AgentType
Optional agent key to update a single agent. If omitted, updates all existing agent files (creating a default Claude file if none exist).

.EXAMPLE
./update-agent-context.ps1 -AgentType claude

.EXAMPLE
./update-agent-context.ps1   # Updates all existing agent files

.NOTES
Relies on common helper functions in common.ps1
#>
param(
    [Parameter(Position=0)]
    [ValidateSet('claude','gemini','copilot','cursor-agent','qwen','opencode','codex','windsurf','kilocode','auggie','roo','codebuddy','amp','shai','tabnine','kiro-cli','agy','bob','qodercli','vibe','kimi','trae','pi','iflow','generic')]
    [string]$AgentType
)

$ErrorActionPreference = 'Stop'

# Import common helpers
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptDir 'common.ps1')

# Acquire environment paths
$envData = Get-FeaturePathsEnv
$REPO_ROOT     = $envData.REPO_ROOT
$CURRENT_BRANCH = $envData.CURRENT_BRANCH
$HAS_GIT       = $envData.HAS_GIT
$IMPL_PLAN     = $envData.IMPL_PLAN
$NEW_PLAN = $IMPL_PLAN

# Agent file paths
$CLAUDE_FILE   = Join-Path $REPO_ROOT 'CLAUDE.md'
$GEMINI_FILE   = Join-Path $REPO_ROOT 'GEMINI.md'
$COPILOT_FILE  = Join-Path $REPO_ROOT '.github/agents/copilot-instructions.md'
$CURSOR_FILE   = Join-Path $REPO_ROOT '.cursor/rules/specify-rules.mdc'
$QWEN_FILE     = Join-Path $REPO_ROOT 'QWEN.md'
$AGENTS_FILE   = Join-Path $REPO_ROOT 'AGENTS.md'
$WINDSURF_FILE = Join-Path $REPO_ROOT '.windsurf/rules/specify-rules.md'
$KILOCODE_FILE = Join-Path $REPO_ROOT '.kilocode/rules/specify-rules.md'
$AUGGIE_FILE   = Join-Path $REPO_ROOT '.augment/rules/specify-rules.md'
$ROO_FILE      = Join-Path $REPO_ROOT '.roo/rules/specify-rules.md'
$CODEBUDDY_FILE = Join-Path $REPO_ROOT 'CODEBUDDY.md'
$QODER_FILE    = Join-Path $REPO_ROOT 'QODER.md'
$AMP_FILE      = Join-Path $REPO_ROOT 'AGENTS.md'
$SHAI_FILE     = Join-Path $REPO_ROOT 'SHAI.md'
$TABNINE_FILE  = Join-Path $REPO_ROOT 'TABNINE.md'
$KIRO_FILE     = Join-Path $REPO_ROOT 'AGENTS.md'
$AGY_FILE      = Join-Path $REPO_ROOT '.agent/rules/specify-rules.md'
$BOB_FILE      = Join-Path $REPO_ROOT 'AGENTS.md'
$VIBE_FILE     = Join-Path $REPO_ROOT '.vibe/agents/specify-agents.md'
$KIMI_FILE     = Join-Path $REPO_ROOT 'KIMI.md'
$TRAE_FILE     = Join-Path $REPO_ROOT '.trae/rules/AGENTS.md'
$IFLOW_FILE    = Join-Path $REPO_ROOT 'IFLOW.md'

$TEMPLATE_FILE = Join-Path $REPO_ROOT '.specify/templates/agent-file-template.md'

# Parsed plan data placeholders
$script:NEW_LANG = ''
$script:NEW_FRAMEWORK = ''
$script:NEW_DB = ''
$script:NEW_PROJECT_TYPE = ''

function Write-Info {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    Write-Host "INFO: $Message"
}

function Write-Success {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    Write-Host "$([char]0x2713) $Message"
}

function Write-WarningMsg {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    Write-Warning $Message
}

function Write-Err {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Validate-Environment {
    if (-not $CURRENT_BRANCH) {
        Write-Err 'Unable to determine current feature'
        if ($HAS_GIT) { Write-Info "Make sure you're on a feature branch" } else { Write-Info 'Set SPECIFY_FEATURE environment variable or create a feature first' }
        exit 1
    }
    if (-not (Test-Path $NEW_PLAN)) {
        Write-Err "No plan.md found at $NEW_PLAN"
        Write-Info 'Ensure you are working on a feature with a corresponding spec directory'
        if (-not $HAS_GIT) { Write-Info 'Use: $env:SPECIFY_FEATURE=your-feature-name or create a new feature first' }
        exit 1
    }
    if (-not (Test-Path $TEMPLATE_FILE)) {
        Write-Err "Template file not found at $TEMPLATE_FILE"
        Write-Info 'Run specify init to scaffold .specify/templates, or add agent-file-template.md there.'
        exit 1
    }
}

function Extract-PlanField {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FieldPattern,
        [Parameter(Mandatory=$true)]
        [string]$PlanFile
    )
    if (-not (Test-Path $PlanFile)) { return '' }
    # Lines like **Language/Version**: Python 3.12
    $regex = "^\*\*$([Regex]::Escape($FieldPattern))\*\*: (.+)$"
    Get-Content -LiteralPath $PlanFile -Encoding utf8 | ForEach-Object {
        if ($_ -match $regex) {
            $val = $Matches[1].Trim()
            if ($val -notin @('NEEDS CLARIFICATION','N/A')) { return $val }
        }
    } | Select-Object -First 1
}

function Parse-PlanData {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PlanFile
    )
    if (-not (Test-Path $PlanFile)) { Write-Err "Plan file not found: $PlanFile"; return $false }
    Write-Info "Parsing plan data from $PlanFile"
    $script:NEW_LANG        = Extract-PlanField -FieldPattern 'Language/Version' -PlanFile $PlanFile
    $script:NEW_FRAMEWORK   = Extract-PlanField -FieldPattern 'Primary Dependencies' -PlanFile $PlanFile
    $script:NEW_DB          = Extract-PlanField -FieldPattern 'Storage' -PlanFile $PlanFile
    $script:NEW_PROJECT_TYPE = Extract-PlanField -FieldPattern 'Project Type' -PlanFile $PlanFile

    if ($NEW_LANG) { Write-Info "Found language: $NEW_LANG" } else { Write-WarningMsg 'No language information found in plan' }
    if ($NEW_FRAMEWORK) { Write-Info "Found framework: $NEW_FRAMEWORK" }
    if ($NEW_DB -and $NEW_DB -ne 'N/A') { Write-Info "Found database: $NEW_DB" }
    if ($NEW_PROJECT_TYPE) { Write-Info "Found project type: $NEW_PROJECT_TYPE" }
    return $true
}

function Format-TechnologyStack {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Lang,
        [Parameter(Mandatory=$false)]
        [string]$Framework
    )
    $parts = @()
    if ($Lang -and $Lang -ne 'NEEDS CLARIFICATION') { $parts += $Lang }
    if ($Framework -and $Framework -notin @('NEEDS CLARIFICATION','N/A')) { $parts += $Framework }
    if (-not $parts) { return '' }
    return ($parts -join ' + ')
}

function Get-ProjectStructure {
    param(
        [Parameter(Mandatory=$false)]
        [string]$ProjectType
    )
    if ($ProjectType -match 'web') { return "backend/`nfrontend/`ntests/" } else { return "src/`ntests/" }
}

function Get-CommandsForLanguage {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Lang
    )
    switch -Regex ($Lang) {
        'Python' { return "cd src; pytest; ruff check ." }
        'Rust' { return "cargo test; cargo clippy" }
        'JavaScript|TypeScript' { return "npm test; npm run lint" }
        default { return "# Add commands for $Lang" }
    }
}

function Get-LanguageConventions {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Lang
    )
    if ($Lang) { "${Lang}: Follow standard conventions" } else { 'General: Follow standard conventions' }
}

function New-AgentFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$TargetFile,
        [Parameter(Mandatory=$true)]
        [string]$ProjectName,
        [Parameter(Mandatory=$true)]
        [datetime]$Date
    )
    if (-not (Test-Path $TEMPLATE_FILE)) { Write-Err "Template not found at $TEMPLATE_FILE"; return $false }
    $temp = New-TemporaryFile
    Copy-Item -LiteralPath $TEMPLATE_FILE -Destination $temp -Force

    $projectStructure = Get-ProjectStructure -ProjectType $NEW_PROJECT_TYPE
    $commands = Get-CommandsForLanguage -Lang $NEW_LANG
    $languageConventions = Get-LanguageConventions -Lang $NEW_LANG

    $escaped_lang = $NEW_LANG
    $escaped_framework = $NEW_FRAMEWORK
    $escaped_branch = $CURRENT_BRANCH

    $content = Get-Content -LiteralPath $temp -Raw -Encoding utf8
    $content = $content -replace '\[PROJECT NAME\]',$ProjectName
    $content = $content -replace '\[DATE\]',$Date.ToString('yyyy-MM-dd')

    # Build the technology stack string safely
    $techStackForTemplate = ""
    if ($escaped_lang -and $escaped_framework) {
        $techStackForTemplate = "- $escaped_lang + $escaped_framework ($escaped_branch)"
    } elseif ($escaped_lang) {
        $techStackForTemplate = "- $escaped_lang ($escaped_branch)"
    } elseif ($escaped_framework) {
        $techStackForTemplate = "- $escaped_framework ($escaped_branch)"
    }

    $content = $content -replace '\[EXTRACTED FROM ALL PLAN.MD FILES\]',$techStackForTemplate
    # For project structure we manually embed (keep newlines)
    $escapedStructure = [Regex]::Escape($projectStructure)
    $content = $content -replace '\[ACTUAL STRUCTURE FROM PLANS\]',$escapedStructure
    # Replace escaped newlines placeholder after all replacements
    $content = $content -replace '\[ONLY COMMANDS FOR ACTIVE TECHNOLOGIES\]',$commands
    $content = $content -replace '\[LANGUAGE-SPECIFIC, ONLY FOR LANGUAGES IN USE\]',$languageConventions

    # Build the recent changes string safely
    $recentChangesForTemplate = ""
    if ($escaped_lang -and $escaped_framework) {
        $recentChangesForTemplate = "- ${escaped_branch}: Added ${escaped_lang} + ${escaped_framework}"
    } elseif ($escaped_lang) {
        $recentChangesForTemplate = "- ${escaped_branch}: Added ${escaped_lang}"
    } elseif ($escaped_framework) {
        $recentChangesForTemplate = "- ${escaped_branch}: Added ${escaped_framework}"
    }

    $content = $content -replace '\[LAST 3 FEATURES AND WHAT THEY ADDED\]',$recentChangesForTemplate
    # Convert literal \n sequences introduced by Escape to real newlines
    $content = $content -replace '\\n',[Environment]::NewLine

    # Prepend Cursor frontmatter for .mdc files so rules are auto-included
    if ($TargetFile -match '\.mdc$') {
        $frontmatter = @('---','description: Project Development Guidelines','globs: ["**/*"]','alwaysApply: true','---','') -join [Environment]::NewLine
        $content = $frontmatter + $content
    }

    $parent = Split-Path -Parent $TargetFile
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }
    Set-Content -LiteralPath $TargetFile -Value $content -NoNewline -Encoding utf8
    Remove-Item $temp -Force
    return $true
}

function Update-ExistingAgentFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$TargetFile,
        [Parameter(Mandatory=$true)]
        [datetime]$Date
    )
    if (-not (Test-Path $TargetFile)) { return (New-AgentFile -TargetFile $TargetFile -ProjectName (Split-Path $REPO_ROOT -Leaf) -Date $Date) }

    $techStack = Format-TechnologyStack -Lang $NEW_LANG -Framework $NEW_FRAMEWORK
    $newTechEntries = @()
    if ($techStack) {
        $escapedTechStack = [Regex]::Escape($techStack)
        if (-not (Select-String -Pattern $escapedTechStack -Path $TargetFile -Quiet)) {
            $newTechEntries += "- $techStack ($CURRENT_BRANCH)"
        }
    }
    if ($NEW_DB -and $NEW_DB -notin @('N/A','NEEDS CLARIFICATION')) {
        $escapedDB = [Regex]::Escape($NEW_DB)
        if (-not (Select-String -Pattern $escapedDB -Path $TargetFile -Quiet)) {
            $newTechEntries += "- $NEW_DB ($CURRENT_BRANCH)"
        }
    }
    $newChangeEntry = ''
    if ($techStack) { $newChangeEntry = "- ${CURRENT_BRANCH}: Added ${techStack}" }
    elseif ($NEW_DB -and $NEW_DB -notin @('N/A','NEEDS CLARIFICATION')) { $newChangeEntry = "- ${CURRENT_BRANCH}: Added ${NEW_DB}" }

    $lines = Get-Content -LiteralPath $TargetFile -Encoding utf8
    $output = New-Object System.Collections.Generic.List[string]
    $inTech = $false; $inChanges = $false; $techAdded = $false; $changeAdded = $false; $existingChanges = 0

    for ($i=0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -eq '## Active Technologies') {
            $output.Add($line)
            $inTech = $true
            continue
        }
        if ($inTech -and $line -match '^##\s') {
            if (-not $techAdded -and $newTechEntries.Count -gt 0) { $newTechEntries | ForEach-Object { $output.Add($_) }; $techAdded = $true }
            $output.Add($line); $inTech = $false; continue
        }
        if ($inTech -and [string]::IsNullOrWhiteSpace($line)) {
            if (-not $techAdded -and $newTechEntries.Count -gt 0) { $newTechEntries | ForEach-Object { $output.Add($_) }; $techAdded = $true }
            $output.Add($line); continue
        }
        if ($line -eq '## Recent Changes') {
            $output.Add($line)
            if ($newChangeEntry) { $output.Add($newChangeEntry); $changeAdded = $true }
            $inChanges = $true
            continue
        }
        if ($inChanges -and $line -match '^##\s') { $output.Add($line); $inChanges = $false; continue }
        if ($inChanges -and $line -match '^- ') {
            if ($existingChanges -lt 2) { $output.Add($line); $existingChanges++ }
            continue
        }
        if ($line -match '(\*\*)?Last updated(\*\*)?: .*\d{4}-\d{2}-\d{2}') {
            $output.Add(($line -replace '\d{4}-\d{2}-\d{2}',$Date.ToString('yyyy-MM-dd')))
            continue
        }
        $output.Add($line)
    }

    # Post-loop check: if we're still in the Active Technologies section and haven't added new entries
    if ($inTech -and -not $techAdded -and $newTechEntries.Count -gt 0) {
        $newTechEntries | ForEach-Object { $output.Add($_) }
    }

    # Ensure Cursor .mdc files have YAML frontmatter for auto-inclusion
    if ($TargetFile -match '\.mdc$' -and $output.Count -gt 0 -and $output[0] -ne '---') {
        $frontmatter = @('---','description: Project Development Guidelines','globs: ["**/*"]','alwaysApply: true','---','')
        $output.InsertRange(0, $frontmatter)
    }

    Set-Content -LiteralPath $TargetFile -Value ($output -join [Environment]::NewLine) -Encoding utf8
    return $true
}

function Update-AgentFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$TargetFile,
        [Parameter(Mandatory=$true)]
        [string]$AgentName
    )
    if (-not $TargetFile -or -not $AgentName) { Write-Err 'Update-AgentFile requires TargetFile and AgentName'; return $false }
    Write-Info "Updating $AgentName context file: $TargetFile"
    $projectName = Split-Path $REPO_ROOT -Leaf
    $date = Get-Date

    $dir = Split-Path -Parent $TargetFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

    if (-not (Test-Path $TargetFile)) {
        if (New-AgentFile -TargetFile $TargetFile -ProjectName $projectName -Date $date) { Write-Success "Created new $AgentName context file" } else { Write-Err 'Failed to create new agent file'; return $false }
    } else {
        try {
            if (Update-ExistingAgentFile -TargetFile $TargetFile -Date $date) { Write-Success "Updated existing $AgentName context file" } else { Write-Err 'Failed to update agent file'; return $false }
        } catch {
            Write-Err "Cannot access or update existing file: $TargetFile. $_"
            return $false
        }
    }
    return $true
}

function Update-SpecificAgent {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Type
    )
    switch ($Type) {
        'claude'   { Update-AgentFile -TargetFile $CLAUDE_FILE   -AgentName 'Claude Code' }
        'gemini'   { Update-AgentFile -TargetFile $GEMINI_FILE   -AgentName 'Gemini CLI' }
        'copilot'  { Update-AgentFile -TargetFile $COPILOT_FILE  -AgentName 'GitHub Copilot' }
        'cursor-agent' { Update-AgentFile -TargetFile $CURSOR_FILE   -AgentName 'Cursor IDE' }
        'qwen'     { Update-AgentFile -TargetFile $QWEN_FILE     -AgentName 'Qwen Code' }
        'opencode' { Update-AgentFile -TargetFile $AGENTS_FILE   -AgentName 'opencode' }
        'codex'    { Update-AgentFile -TargetFile $AGENTS_FILE   -AgentName 'Codex CLI' }
        'windsurf' { Update-AgentFile -TargetFile $WINDSURF_FILE -AgentName 'Windsurf' }
        'kilocode' { Update-AgentFile -TargetFile $KILOCODE_FILE -AgentName 'Kilo Code' }
        'auggie'   { Update-AgentFile -TargetFile $AUGGIE_FILE   -AgentName 'Auggie CLI' }
        'roo'      { Update-AgentFile -TargetFile $ROO_FILE      -AgentName 'Roo Code' }
        'codebuddy' { Update-AgentFile -TargetFile $CODEBUDDY_FILE -AgentName 'CodeBuddy CLI' }
        'qodercli' { Update-AgentFile -TargetFile $QODER_FILE    -AgentName 'Qoder CLI' }
        'amp'      { Update-AgentFile -TargetFile $AMP_FILE      -AgentName 'Amp' }
        'shai'     { Update-AgentFile -TargetFile $SHAI_FILE     -AgentName 'SHAI' }
        'tabnine'  { Update-AgentFile -TargetFile $TABNINE_FILE  -AgentName 'Tabnine CLI' }
        'kiro-cli' { Update-AgentFile -TargetFile $KIRO_FILE     -AgentName 'Kiro CLI' }
        'agy'      { Update-AgentFile -TargetFile $AGY_FILE      -AgentName 'Antigravity' }
        'bob'      { Update-AgentFile -TargetFile $BOB_FILE      -AgentName 'IBM Bob' }
        'vibe'     { Update-AgentFile -TargetFile $VIBE_FILE     -AgentName 'Mistral Vibe' }
        'kimi'     { Update-AgentFile -TargetFile $KIMI_FILE     -AgentName 'Kimi Code' }
        'trae'     { Update-AgentFile -TargetFile $TRAE_FILE     -AgentName 'Trae' }
        'pi'       { Update-AgentFile -TargetFile $AGENTS_FILE   -AgentName 'Pi Coding Agent' }
        'iflow'    { Update-AgentFile -TargetFile $IFLOW_FILE    -AgentName 'iFlow CLI' }
        'generic'  { Write-Info 'Generic agent: no predefined context file. Use the agent-specific update script for your agent.' }
        default { Write-Err "Unknown agent type '$Type'"; Write-Err 'Expected: claude|gemini|copilot|cursor-agent|qwen|opencode|codex|windsurf|kilocode|auggie|roo|codebuddy|amp|shai|tabnine|kiro-cli|agy|bob|vibe|qodercli|kimi|trae|pi|iflow|generic'; return $false }
    }
}

function Update-AllExistingAgents {
    $found = $false
    $ok = $true
    if (Test-Path $CLAUDE_FILE)   { if (-not (Update-AgentFile -TargetFile $CLAUDE_FILE   -AgentName 'Claude Code')) { $ok = $false }; $found = $true }
    if (Test-Path $GEMINI_FILE)   { if (-not (Update-AgentFile -TargetFile $GEMINI_FILE   -AgentName 'Gemini CLI')) { $ok = $false }; $found = $true }
    if (Test-Path $COPILOT_FILE)  { if (-not (Update-AgentFile -TargetFile $COPILOT_FILE  -AgentName 'GitHub Copilot')) { $ok = $false }; $found = $true }
    if (Test-Path $CURSOR_FILE)   { if (-not (Update-AgentFile -TargetFile $CURSOR_FILE   -AgentName 'Cursor IDE')) { $ok = $false }; $found = $true }
    if (Test-Path $QWEN_FILE)     { if (-not (Update-AgentFile -TargetFile $QWEN_FILE     -AgentName 'Qwen Code')) { $ok = $false }; $found = $true }
    if (Test-Path $AGENTS_FILE)   { if (-not (Update-AgentFile -TargetFile $AGENTS_FILE   -AgentName 'Codex/opencode')) { $ok = $false }; $found = $true }
    if (Test-Path $WINDSURF_FILE) { if (-not (Update-AgentFile -TargetFile $WINDSURF_FILE -AgentName 'Windsurf')) { $ok = $false }; $found = $true }
    if (Test-Path $KILOCODE_FILE) { if (-not (Update-AgentFile -TargetFile $KILOCODE_FILE -AgentName 'Kilo Code')) { $ok = $false }; $found = $true }
    if (Test-Path $AUGGIE_FILE)   { if (-not (Update-AgentFile -TargetFile $AUGGIE_FILE   -AgentName 'Auggie CLI')) { $ok = $false }; $found = $true }
    if (Test-Path $ROO_FILE)      { if (-not (Update-AgentFile -TargetFile $ROO_FILE      -AgentName 'Roo Code')) { $ok = $false }; $found = $true }
    if (Test-Path $CODEBUDDY_FILE) { if (-not (Update-AgentFile -TargetFile $CODEBUDDY_FILE -AgentName 'CodeBuddy CLI')) { $ok = $false }; $found = $true }
    if (Test-Path $QODER_FILE)    { if (-not (Update-AgentFile -TargetFile $QODER_FILE    -AgentName 'Qoder CLI')) { $ok = $false }; $found = $true }
    if (Test-Path $SHAI_FILE)     { if (-not (Update-AgentFile -TargetFile $SHAI_FILE     -AgentName 'SHAI')) { $ok = $false }; $found = $true }
    if (Test-Path $TABNINE_FILE)  { if (-not (Update-AgentFile -TargetFile $TABNINE_FILE  -AgentName 'Tabnine CLI')) { $ok = $false }; $found = $true }
    if (Test-Path $KIRO_FILE)     { if (-not (Update-AgentFile -TargetFile $KIRO_FILE     -AgentName 'Kiro CLI')) { $ok = $false }; $found = $true }
    if (Test-Path $AGY_FILE)      { if (-not (Update-AgentFile -TargetFile $AGY_FILE      -AgentName 'Antigravity')) { $ok = $false }; $found = $true }
    if (Test-Path $BOB_FILE)      { if (-not (Update-AgentFile -TargetFile $BOB_FILE      -AgentName 'IBM Bob')) { $ok = $false }; $found = $true }
    if (Test-Path $VIBE_FILE)     { if (-not (Update-AgentFile -TargetFile $VIBE_FILE     -AgentName 'Mistral Vibe')) { $ok = $false }; $found = $true }
    if (Test-Path $KIMI_FILE)     { if (-not (Update-AgentFile -TargetFile $KIMI_FILE     -AgentName 'Kimi Code')) { $ok = $false }; $found = $true }
    if (Test-Path $TRAE_FILE)     { if (-not (Update-AgentFile -TargetFile $TRAE_FILE     -AgentName 'Trae')) { $ok = $false }; $found = $true }
    if (Test-Path $IFLOW_FILE)    { if (-not (Update-AgentFile -TargetFile $IFLOW_FILE    -AgentName 'iFlow CLI')) { $ok = $false }; $found = $true }
    if (-not $found) {
        Write-Info 'No existing agent files found, creating default Claude file...'
        if (-not (Update-AgentFile -TargetFile $CLAUDE_FILE -AgentName 'Claude Code')) { $ok = $false }
    }
    return $ok
}

function Print-Summary {
    Write-Host ''
    Write-Info 'Summary of changes:'
    if ($NEW_LANG) { Write-Host "  - Added language: $NEW_LANG" }
    if ($NEW_FRAMEWORK) { Write-Host "  - Added framework: $NEW_FRAMEWORK" }
    if ($NEW_DB -and $NEW_DB -ne 'N/A') { Write-Host "  - Added database: $NEW_DB" }
    Write-Host ''
    Write-Info 'Usage: ./update-agent-context.ps1 [-AgentType claude|gemini|copilot|cursor-agent|qwen|opencode|codex|windsurf|kilocode|auggie|roo|codebuddy|amp|shai|tabnine|kiro-cli|agy|bob|vibe|qodercli|kimi|trae|pi|iflow|generic]'
}

function Main {
    Validate-Environment
    Write-Info "=== Updating agent context files for feature $CURRENT_BRANCH ==="
    if (-not (Parse-PlanData -PlanFile $NEW_PLAN)) { Write-Err 'Failed to parse plan data'; exit 1 }
    $success = $true
    if ($AgentType) {
        Write-Info "Updating specific agent: $AgentType"
        if (-not (Update-SpecificAgent -Type $AgentType)) { $success = $false }
    }
    else {
        Write-Info 'No agent specified, updating all existing agent files...'
        if (-not (Update-AllExistingAgents)) { $success = $false }
    }
    Print-Summary
    if ($success) { Write-Success 'Agent context update completed successfully'; exit 0 } else { Write-Err 'Agent context update completed with errors'; exit 1 }
}

Main
</content>
</file>

<file path=".specify/templates/10-Anforderung-template.md">
<metadata>Lines: 116 | Size: 3956 B</metadata>
<content>
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

_Example of marking unclear requirements:_

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
</content>
</file>

<file path=".specify/templates/20-Plan-template.md">
<metadata>Lines: 119 | Size: 4366 B</metadata>
<content>
# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [ ] **MANDATE-INJ**: Zero innerHTML? (textContent/DOM-API only)
- [ ] **MANDATE-FREEZE**: Visual Freeze guaranteed? (No pixel shift)
- [ ] **MANDATE-VEC**: Vector-only export? (Native Print Engine)
- [ ] **MANDATE-NAT**: Native-first? (No Logic-Bloat, Chrome 147+ standards)
- [ ] **MANDATE-PLN**: Plaintext-only? (contenteditable="plaintext-only")
- [ ] **IMR-Sync**: Does the plan follow the Isomorphic Master Registry?
- [ ] **NO-JS Doctrine**: JS limited to Logic/CMA? (No layout/toggle JS)
- [ ] **AGENT SAFETY**: Plan includes a safe patching strategy?

### Security Architect Review (BMAD™ Phase)

> **Architect Critique:**
> [Hier kritisiere ich den Plan aus Sicherheits- und Stabilitäts-Perspektive.
> > Fokus: Daten-Integrität, Mandats-Konformität, potenzielle Regressions-Risiken.]

## Project Structure

### Documentation (this feature)

~~~text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
~~~

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

~~~text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
~~~

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
</content>
</file>

<file path=".specify/templates/30-Aufgaben-template.md">
<metadata>Lines: 251 | Size: 9138 B</metadata>
<content>
---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for [endpoint] in tests/contract/test\_[name].py
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/test\_[name].py

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create [Entity1] model in src/models/[entity1].py
- [ ] T013 [P] [US1] Create [Entity2] model in src/models/[entity2].py
- [ ] T014 [US1] Implement [Service] in src/services/[service].py (depends on T012, T013)
- [ ] T015 [US1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T016 [US1] Add validation and error handling
- [ ] T017 [US1] Add logging for user story 1 operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Contract test for [endpoint] in tests/contract/test\_[name].py
- [ ] T019 [P] [US2] Integration test for [user journey] in tests/integration/test\_[name].py

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] T021 [US2] Implement [Service] in src/services/[service].py
- [ ] T022 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Contract test for [endpoint] in tests/contract/test\_[name].py
- [ ] T025 [P] [US3] Integration test for [user journey] in tests/integration/test\_[name].py

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] T027 [US3] Implement [Service] in src/services/[service].py
- [ ] T028 [US3] Implement [endpoint/feature] in src/[location]/[file].py

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

~~~bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
~~~

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
</content>
</file>

<file path=".specify/templates/agent-file-template.md">
<metadata>Lines: 29 | Size: 464 B</metadata>
<content>
# [PROJECT NAME] Development Guidelines

Auto-generated from all feature plans. Last updated: [DATE]

## Active Technologies

[EXTRACTED FROM ALL PLAN.MD FILES]

## Project Structure

~~~text
[ACTUAL STRUCTURE FROM PLANS]
~~~

## Commands

[ONLY COMMANDS FOR ACTIVE TECHNOLOGIES]

## Code Style

[LANGUAGE-SPECIFIC, ONLY FOR LANGUAGES IN USE]

## Recent Changes

[LAST 3 FEATURES AND WHAT THEY ADDED]

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
</content>
</file>

<file path=".specify/templates/checklist-template.md">
<metadata>Lines: 41 | Size: 1307 B</metadata>
<content>
# [CHECKLIST TYPE] Checklist: [FEATURE NAME]

**Purpose**: [Brief description of what this checklist covers]
**Created**: [DATE]
**Feature**: [Link to spec.md or relevant documentation]

**Note**: This checklist is generated by the `/speckit.checklist` command based on feature context and requirements.

<!--
  ============================================================================
  IMPORTANT: The checklist items below are SAMPLE ITEMS for illustration only.

  The /speckit.checklist command MUST replace these with actual items based on:
  - User's specific checklist request
  - Feature requirements from spec.md
  - Technical context from plan.md
  - Implementation details from tasks.md

  DO NOT keep these sample items in the generated checklist file.
  ============================================================================
-->

## [Category 1]

- [ ] CHK001 First checklist item with clear action
- [ ] CHK002 Second checklist item
- [ ] CHK003 Third checklist item

## [Category 2]

- [ ] CHK004 Another category item
- [ ] CHK005 Item with specific criteria
- [ ] CHK006 Final item in this category

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Link to relevant resources or documentation
- Items are numbered sequentially for easy reference
</content>
</file>

<file path=".specify/templates/constitution-template.md">
<metadata>Lines: 74 | Size: 2359 B</metadata>
<content>
# [PROJECT_NAME] Constitution

<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]

<!-- Example: I. Library-First -->

[PRINCIPLE_1_DESCRIPTION]

<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]

<!-- Example: II. CLI Interface -->

[PRINCIPLE_2_DESCRIPTION]

<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]

<!-- Example: III. Test-First (NON-NEGOTIABLE) -->

[PRINCIPLE_3_DESCRIPTION]

<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]

<!-- Example: IV. Integration Testing -->

[PRINCIPLE_4_DESCRIPTION]

<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]

<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->

[PRINCIPLE_5_DESCRIPTION]

<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]

<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]

<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]

<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]

<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance

<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]

<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]

<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
</content>
</file>

<file path=".specify/templates/spec-template.md">
<metadata>Lines: 22 | Size: 592 B</metadata>
<content>
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Weighting**: [Score 1-100] | **Criticality**: [CRITICAL / OPTIONAL]

## ?? Brain-First Alignment _(mandatory)_

- **Traceability ID**: [DIN-XXX-NEW]
- **Anti-Pattern Check**: Verletzt dieses Feature eine Regel aus `.brain/05_anti_pattern_registry.md`?

## Feature Weighting (Bedeutung)

- **Importance (1-100)**: [X]
- **Fulfillment Target**: [z.B. 100% / Strict]
- **Rationale**: [Warum ist dieses Feature so wichtig?]

## User Scenarios & Testing _(mandatory)_

...
</content>
</file>

<file path=".stylelintrc.json">
<metadata>Lines: 46 | Size: 995 B</metadata>
<content>
{
  "rules": {
    "no-duplicate-selectors": true,
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "declaration-block-no-shorthand-property-overrides": true,
    "font-family-no-duplicate-names": true,
    "unit-allowed-list": [
      "px",
      "rem",
      "em",
      "vh",
      "vw",
      "dvh",
      "%",
      "mm",
      "pt"
    ],
    "declaration-property-value-disallowed-list": {
      "z-index": ["/.+/"],
      "mm": ["/.+/"]
    },
    "custom-property-pattern": "^din-|^c-",
    "at-rule-allowed-list": [
      "layer",
      "font-face",
      "container",
      "media",
      "highlight"
    ],
    "rule-selector-property-disallowed-list": {
      "/^#paper/": ["z-index", "mm"],
      "/^din-/": ["position", "top", "left"]
    }
  },
  "overrides": [
    {
      "files": ["css/din5008-paper.css"],
      "rules": {
        "declaration-property-value-disallowed-list": null,
        "rule-selector-property-disallowed-list": null
      }
    }
  ]
}
</content>
</file>

<file path="01_Architecture_Compliance.md">
<metadata>Lines: 175 | Size: 7172 B</metadata>
<content>
---
# === BASISINFORMATIONEN ===
title: "Architecture Compliance Matrix (IMR 4.0 Standard)"
subtitle: "Pure & Flat Architecture Guidelines"
description: "Technologische Leitplanken für DIN-BriefNEO mit Chrome 147+ Baseline"
version: "4.7.0"
version_date: 2026-03-31
status: active
enforcement: "PVP (Platinum Validation Pipeline)"
baseline: "Chrome 147+"

# === DOKUMENT-TYP ===
type: specification
category: architecture
audience:
  - developers
  - architects
  - reviewers
  - management

# === TAGS (Hierarchisch für Obsidian) ===
tags:
  - din-briefneo
  - din-briefneo/architecture
  - din-briefneo/compliance
  - din-briefneo/platinum
  - status/active
  - type/specification
  - tech/chrome-147
  - tech/css
  - tech/html
  - tech/js

# === ALIASES (für schnelle Suche) ===
aliases:
  - "Tech Compliance"
  - "Platinum Baseline"
  - "Browser Requirements"
  - "IMR 4.0 Compliance"
  - "Architecture Guidelines"
  - "Chrome 147+ Spec"

# === DATAView Felder ===
baseline_version: "147"
target_browser: "Chrome"
platform: "Web"
architecture_style: "Pure & Flat"
zero_js_ui: true
css_first: true

# === VERWANDTE DOKUMENTE ===
related:
  - "02_IMR_Registry"
  - "03_CSS_Reference"
  - "05_Feature_Matrix"
  - "06_Salutation_Engine"

# === ZEITSTEMPEL ===
date_created: 2025-12-01
date_updated: 2026-03-31
date_reviewed: 2026-03-31
review_cycle: quarterly
next_review: 2026-06-30

# === AUTOR & VERANTWORTLICHKEIT ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"
license: "Proprietary"

# === OBSIDIAN RENDERING ===
cssclasses:
  - table-stripes
  - wide-table
  - readable

# === GITHUB PAGES (Jekyll) ===
permalink: /docs/architecture-compliance/
layout: default
sidebar: docs
---

# 🛠 Architecture Compliance Matrix (IMR 4.0 Standard)

> [!IMPORTANT]
> **Baseline:** Chrome 147+ ist die verbindliche Plattform. Die Platinum Validation Pipeline (PVP) prüft alle Commits gegen diese Baseline. Ältere Browser werden explizit nicht unterstützt.

Diese Matrix definiert die technologischen Leitplanken für DIN-BriefNEO.
Wir wenden die **Chrome 147+ Baseline** konsequent an, um eine *Pure & Flat Architecture* ohne Legacy-Ballast zu garantieren.

---

### 🚦 Status-System
- ✅ **Aktiv**      → Im Code implementiert und aktiv genutzt.
- 🟡 **Geplant**    → Definitiv in nächsten 2 Sprints (Q2 2026).
- 📋 **Roadmap**    → Langfristige Planung (2026/2027).
- 🧪 **Experimentell** → In Test-Suites aktiv, noch nicht produktiv.

> [!TIP]
> Nutze `npm run check:compliance`, um die Einhaltung dieser Matrix in deinem lokalen Workspace zu verifizieren.

---

### 0. Platinum Basistechnologie (Universell)

| Icon / Name            | Moderne API (**TARGET**)      | Strategie & Best Practice (inkl. Quellen) | Status |
|------------------------|-------------------------------|-------------------------------------------|--------|
| **Layering**           | `CSS @layer`                  | Hierarchie vor Spezifität – löst Kaskadenkonflikte. | ✅ Aktiv |
| **Typed Props**        | `@property`                   | Typsicherheit für CMA-Koordinaten (mm-Präzision). | ✅ Aktiv |
| **CSS-Isolation**      | `@scope`                      | Isoliert Paper-CSS ohne Shadow-DOM-Nachteile. | ✅ Aktiv |
| **Animations**         | `interpolate-size`            | Native Layout-Anims für `height: auto`. | ✅ Aktiv |
| **Farbe**              | `oklch()`                     | Wahrnehmungsgetreue Farben & `color-mix()`. | ✅ Aktiv |
| **Theming**            | `light-dark()`                | Zero-JS System-Farbschema-Umschaltung. | ✅ Aktiv |
| **Overflow**           | `@container scroll-state`     | Native Überlauf-Warnung ohne JS-Listener. | ✅ Aktiv |
| **Layout**             | Container Queries             | Komponenten reagieren auf A4‑Platz (`size`). | ✅ Aktiv |
| **Logik (CSS)**        | `:has()`                      | Zero-JS State Management (Layout/Theme/Guides). | ✅ Aktiv |
| **Typografie**         | `font-feature-settings`       | Tabellenziffern & Slashed-Zero für IBAN/Datum. | ✅ Aktiv |
| **Auto-Resize**        | `field-sizing: content`       | Textfelder wachsen organisch mit dem Inhalt. | ✅ Aktiv |
| **Positioning**        | CSS Anchor                    | Popovers kleben ohne JS am Anker. | 📋 Roadmap |
| **Overlays**           | `<dialog>` + `popover`        | Native Modals & Tooltips (ADR-017). | ✅ Aktiv |
| **Invokers**           | Invoker Commands              | Deklarative Button-Trigger (`commandfor`). | 📋 Roadmap |
| **Hover-Invoker**      | `interesttarget`              | Zero‑JS‑Tooltips (Chrome 147+). | 📋 Roadmap |
| **Logik (Zeit)**       | Temporal API                  | Fehlerfreie Datumsberechnung (ADR-017). | ✅ Aktiv |
| **Sicherheit**         | Sanitizer API                 | XSS‑Schutz durch `setHTML()` statt `innerHTML`. | ✅ Aktiv |
| **Typografie**         | `text-wrap: balance / pretty` | Vermeidet Witwen & Waisen; optische Balance. | 🟡 Geplant |
| **Attr‑Config**        | `attr(data-* type)`           | Typisierte CSS‑Werte direkt aus HTML. | 🟡 Geplant |
| **Validierung**        | Constraint API                | Browser‑eigene Formularvalidierung nutzen. | ✅ Aktiv |

---

## 🔗 Dokumenten-Navigation

> [!NOTE]
> Diese Matrix definiert die *Plattform*. Die konkrete Umsetzung der DIN-Vorgaben erfolgt in der [[02_IMR_Registry]] und der [[06_Salutation_Engine]].

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

~~~dataview
TABLE
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
~~~

---

### 🏗️ Implementierungspfade & High‑End APIs

| Icon / Name          | Pfad / API                     | Strategie & Best Practice |
|----------------------|--------------------------------|---------------------------|
| **Dateisystem**      | FileSystem Access              | Server‑Only: direktes Schreiben auf Disk. `/WICG/file-system-access` |
| **Persistenz**       | OPFS                           | Origin Private File System für High‑Perf State. `/WICG/file-system-access` |
| **Reaktivität**      | `Proxy` Objects                | SSoT (Single Source of Truth) via Proxy Traps. `/tc39/ecma262` |
| **Grafik**           | SVG (inline)                   | Vektorscharfe Logos & Wasserzeichen. `/W3C/SVG2` |
| **Performance**      | `scheduler.postTask()`         | Priorisierung von UI‑Updates. `/WICG/scheduling-apis` |
| **Events**           | Custom Events                  | Kommunikation zwischen Entitäten. `/whatwg/html` |
| **Sanitization**     | Sanitizer API                  | Standardisierte HTML‑Säuberung. `/WICG/sanitizer-api` |
| **Edit Context**     | `EditContext API`              | Direkte Kontrolle über den Input-Stream. `/WICG/edit-context` |
| **Print Logic**      | `@media print`                 | Optimierung für PDF-Export. `/W3C/css-break-3` |
</content>
</file>

<file path="02_IMR_Registry.md">
<metadata>Lines: 287 | Size: 9935 B</metadata>
<content>
---
# === BASISINFORMATIONEN ===
title: "IMR 4.0 — Die Definitive DIN 5008 Registry (Platinum Master)"
subtitle: "Complete HTML Tag Registry for DIN-BriefNEO"
description: "Alle 45+ atomaren Daten-Tags mit Positionierung, Ausrichtung und Wachstumsverhalten nach DIN 5008"
version: "4.7.0"
version_date: 2026-03-31
status: active
type: "registry"

# === DOKUMENT-TYP ===
category: reference
audience:
  - developers
  - implementers
  - testers
  - ai-agents

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/imr
  - din-briefneo/html
  - din-briefneo/registry
  - status/active
  - type/registry
  - tech/html
  - tech/custom-elements
  - standard/din-5008

# === ALIASES ===
aliases:
  - "02_IMR_Registry"
  - "IMR Registry"
  - "DIN 5008 Tags"
  - "HTML Tag List"
  - "Custom Elements Registry"
  - "Atomic Tags"
  - "45 DIN Fields"

# === DATAVIEW Felder ===
total_tags: 45
single_line_tags: 40
multi_line_tags: 5
validation_enabled: true
din_compliance: "100% DIN 5008:2020-03"
tag_categories:
  - "Absender-Zone"
  - "Anschriftfeld"
  - "Metadaten & Infoblock"
  - "Briefkern"
  - "Fußzeile"
  - "Systemkomponenten"

# === VERWANDTE DOKUMENTE ===
related:
  - "01_Architecture_Compliance"
  - "03_CSS_Reference"
  - "05_Feature_Matrix"
  - "06_Salutation_Engine"

# === ZEITSTEMPEL ===
date_created: 2026-03-31
date_updated: 2026-03-31
date_validated: 2026-03-31

# === AUTOR ===
author: "@grapefruit89"
maintainer: "@grapefruit89"

# === OBSIDIAN ===
cssclasses:
  - wide-table
  - table-stripes
  - no-wrap

# === GITHUB PAGES ===
permalink: /docs/imr-registry/
layout: default
---

# IMR 4.0 — Die Definitive DIN 5008 Registry (Platinum Master)

> [!NOTE]
> Das Anschriftfeld hat eine feste Höhe von 45mm[^1]. Überlaufender Text wird durch den Overflow-Alarm (`@container scroll-state`) visuell markiert.

> **Single Source of Truth (SSoT)** für die Platinum Validation Pipeline (PVP).
> Diese Liste definiert alle **45 atomaren Daten-Tags** (inkl. Guides) mit Positionierung, Ausrichtung und Wachstumsverhalten.

---

## 📊 **Übersicht**

<details>
<summary>📋 Bereichs-Übersicht & Container-Struktur</summary>

| Bereich | Tags | Container | Wuchs-Verhalten |
|---------|------|-----------|-----------------|
| **Absender-Zone** | 8 | `<din-absender>` | Top-Down |
| **Anschriftfeld** | 8 | `<din-anschriftfeld>` | Top-Down (Fix 45mm) |
| **Metadaten & Infoblock** | 8 | `<din-infoblock>` | Top-Down |
| **Briefkern** | 6 | `<din-kern>` | Dynamisch |
| **Fußzeile** | 12 | `<din-fuss>` | Spalten-basiert |
| **Systemkomponenten** | 3 | – | – |

</details>

---

## 🗺️ **Architektur-Übersicht**

~~~mermaid
graph TD
    subgraph Input
        A[User Input]
    end

    subgraph Container
        B[din-absender]
        C[din-anschriftfeld]
        D[din-infoblock]
        E[din-kern]
        F[din-fuss]
    end

    subgraph Output
        G[HTML Rendering]
        H[CSS Positioning]
        I[JSON State]
    end
~~~

---

## 🏢 1. Absender-Zone (Branding)

**Container:** `<din-absender>`
**Position:** X: `25mm` | Y: `var(--din-y-header-start)`
**Standard:** Form A: `27mm` | Form B: `45mm`

| Tag | Beschreibung | Ausrichtung | Validierung | DIN / Context7 |
|:---|:---|:---:|:---|:---|
| `<din-branding-logo>` | Firmenlogo (SVG/Base64) | Rechts | — | [`/whatwg/html`](https://html.spec.whatwg.org/) |
| `<din-absender-vorname>` | Vorname Absender | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-nachname>` | Nachname Absender | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-strasse>` | Straße & Hausnr. | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-ort>` | PLZ & Ort | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-zusatz>` | Adresszusatz | Links | `plaintext` | DIN 5008: 16.1 |
| `<din-absender-mail>` | E-Mail Adresse | Links | `type="email"` | `mailto:` |
| `<din-absender-tel>` | Telefonnummer | Links | `type="tel"` | `tel:` |

---

## ✉️ 2. Anschriftfeld (Empfänger)

**Container:** `<din-anschriftfeld>`
**Position:** X: `25mm` | Y: `var(--din-y-header-start) + 17.7mm`
**Max-Breite:** `85mm` | **Höhe:** `45mm` (Fix)

| Tag | Beschreibung | Zeile | Ausrichtung | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---|:---|
| `<din-rucksendezeile>` | Kleinstzeile | 1 (fix) | Links | `font-size: 8pt` | DIN 5008: 16.1.2 |
| `<din-zusaetze>` | Vermerke/Zusätze | 2-4 | Links | — | DIN 5008: 16.1.3 |
| `<din-empfaenger-firma>` | Firmenname | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-abteilung>` | Abteilung | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-vorname>` | Vorname | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-nachname>` | Nachname | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-strasse>` | Straße & Hausnr. | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |
| `<din-empfaenger-ort>` | PLZ & Ort | 5-9 | Links | `plaintext` | DIN 5008: 16.1.4 |

> ⚠️ **Wichtig:** Das Anschriftfeld hat eine **feste Höhe von 45mm**. Überlaufender Text wird abgeschnitten (DIN 5008 Konformität).

---

## 📅 3. Metadaten & Infoblock

**Container:** `<din-infoblock>`
**Position:** X: `125mm` | Y (A): `79.4mm` | Y (B): `97.4mm`
**Wuchs:** Top-Down

| Tag | Beschreibung | Y (A) | Y (B) | Ausrichtung | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---:|:---|:---|
| `<din-datum>` | Briefdatum | 27 | 45 | Links | `Temporal.PlainDate` | DIN 5008: 17.2 |
| `<din-ihr-zeichen>` | Ihr Zeichen | 79.4 | 97.4 | Links | — | DIN 5008: 17.1 |
| `<din-ihr-schreiben>` | Ihr Schreiben vom | 84.4 | 102.4 | Links | `ISO-8601` | [`/tc39/proposal-temporal`](https://tc39.es/proposal-temporal/) |
| `<din-unser-zeichen>` | Unser Zeichen | 89.4 | 107.4 | Links | — | DIN 5008: 17.1 |
| `<din-unser-schreiben>` | Bezugsdatum | 94.4 | 112.4 | Links | `ISO-8601` | [`/tc39/ecma262`](https://tc39.es/ecma262/) |
| `<din-durchwahl>` | Direkte Telefonnr. | 99.4 | 117.4 | Links | `type="tel"` | `tel:` |
| `<din-email-direkt>` | Direkte E-Mail | 104.4 | 122.4 | Links | `type="email"` | `mailto:` |
| `<din-internet>` | Web-URL | 109.4 | 127.4 | Links | `type="url"` | [`/whatwg/html`](https://html.spec.whwg.org/) |

---

## 📝 4. Briefkern (Dynamischer Inhalt)

**Container:** `<din-kern>`
**Position:** X: `25mm` | Y (A): `85.4mm` | Y (B): `103.4mm`
**Max-Breite:** `165mm` | **Wuchs:** Top-Down (dynamisch, triggert Paginierung)

| Tag | Beschreibung | Y (A) | Y (B) | Ausrichtung | Zeilen | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---:|:---:|:---|:---|
| `<din-betreff>` | Betreff (fett) | 85.4 | 103.4 | Links | **Einzeilig** | Max 2 Zeilen | DIN 5008: 18 |
| `<din-anrede>` | Anredeformel | 100.4 | 118.4 | Links | **Einzeilig** | — | DIN 5008: 19 |
| `<din-text>` | Haupt-Inhalt | 110.4 | 128.4 | Blocksatz* | **Mehrzeilig** | Sanitizer API | DIN 5008: 20 |
| `<din-grussformel>` | Grußformel | Ende | Ende | Links | **Einzeilig** | — | DIN 5008: 21 |
| `<din-unterschrift>` | Unterzeichner | Ende | Ende | Links | **Einzeilig** | — | DIN 5008: 22 |
| `<din-anlagen>` | Anlagenverzeichnis | Ende | Ende | Links | **Mehrzeilig** | — | DIN 5008: 23 |

> ℹ️ **Blocksatz mit Silbentrennung** wird für DIN-Briefe empfohlen:
> `text-align: justify; text-justify: inter-word; hyphens: auto;`

---

## 📄 5. Fußzeile (Footer) – 4 Spalten

**Container:** `<din-fuss>`
**Position:** X: `25mm` | Y: `241mm`
**Max-Breite:** `165mm` | **Wuchs:** Spalten-basiert
**Layout:** 4 Spalten (je 25% Breite)

| Tag | Beschreibung | Spalte | Y | Ausrichtung | Zeilen | Validierung | DIN / Context7 |
|:---|:---|:---:|:---:|:---:|:---:|:---|:---|
| `<din-fuss-firma>` | Firmenbezeichnung | 1 | 241 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-sitz>` | Firmensitz | 1 | 246 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-gericht>` | Registergericht | 1 | 251 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-hrb>` | Handelsregister-Nr. | 1 | 256 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-vorstand>` | Vorstand / Inhaber | 2 | 241 | Links | **Mehrzeilig** | — | DIN 5008: 24 |
| `<din-fuss-gf>` | Geschäftsführer | 2 | 251 | Links | **Mehrzeilig** | — | DIN 5008: 24 |
| `<din-fuss-stnr>` | Steuernummer | 3 | 241 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-ustid>` | USt-IdNr. | 3 | 246 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-bank>` | Name der Bank | 4 | 241 | Links | **Einzeilig** | — | DIN 5008: 24 |
| `<din-fuss-iban>` | IBAN | 4 | 246 | Links | **Einzeilig** | `BigInt` Mod-97 | ISO 13616 |
| `<din-fuss-bic>` | BIC | 4 | 251 | Links | **Einzeilig** | `regex` | ISO 9362 |
| `<din-fuss-anschrift>` | Hausanschrift | 4 | 256 | Links | **Einzeilig** | — | DIN 5008: 24 |

---

## 🛠️ 6. Systemkomponenten (Guides)

Diese Tags dienen der internen Visualisierung und Compliance-Kontrolle.

`<din-falz-oben>`
:   Obere Faltmarke. Positioniert sich fix bei `var(--din-y-header-start) + 60mm`.

`<din-falz-unten>`
:   Untere Faltmarke. Positioniert sich fix bei `var(--din-y-header-start) + 165mm`.

`<din-overlay>`
:   SVG-Referenz-Overlay für den visuellen Layout-Audit (Platinum Feature).

---

[^1]: DIN 5008:2020-03, Abschnitt 16.1.4 – Maße des Anschriftfeldes für Fensterbriefe.

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

~~~dataview
TABLE
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
~~~

---

**Status:** ACTIVE
**Nächste Überprüfung:** 2026-04-30
**Verantwortlich:** Lead Systems Architect
</content>
</file>

<file path="03_CSS_Reference.md">
<metadata>Lines: 218 | Size: 6801 B</metadata>
<content>
---
# === BASISINFORMATIONEN ===
title: "CSS Glossar — DIN-BriefNEO Platinum"
subtitle: "Complete CSS Reference for Pure & Flat Architecture"
description: "Katalogisiert alle CSS-Technologien im DIN-BriefNEO-Projekt – Single Source of Truth für Entwickler und KI-Agenten"
version: "4.7.0"
version_date: 2026-03-31
status: active

# === DOKUMENT-TYP ===
type: reference
category: css
audience:
  - developers
  - designers
  - ai-agents
  - code-reviewers

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/css
  - din-briefneo/reference
  - din-briefneo/platinum
  - status/active
  - type/reference
  - tech/css
  - tech/css-nesting
  - tech/css-container-queries
  - tech/css-anchor-positioning

# === ALIASES ===
aliases:
  - "03_CSS_Reference"
  - "CSS Reference"
  - "CSS Features"
  - "Platinum CSS"
  - "CSS Glossar"
  - "CSS Capabilities"

# === DATAVIEW Felder ===
css_features_total: 45
css_features_active: 28
css_features_planned: 12
css_features_roadmap: 5
baseline_version: "Chrome 147+"
zero_js_ui: true
css_first: true

# === FEATURE-KATEGORIEN ===
feature_categories:
  - selectors
  - properties
  - functions
  - at-rules
  - colors
  - layout
  - animations

# === VERWANDTE DOKUMENTE ===
related:
  - "01_Architecture_Compliance"
  - "02_IMR_Registry"
  - "04_CSS_Quick_Reference"
  - "05_Feature_Matrix"

# === ZEITSTEMPEL ===
date_created: 2026-03-31
date_updated: 2026-03-31
date_reviewed: 2026-03-31

# === AUTOR ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - wide-table
  - readable

# === GITHUB PAGES ===
permalink: /docs/css-reference/
layout: default
---

# 📚 CSS Glossar — DIN-BriefNEO

> [!NOTE]
> Alle `mm`-Angaben sind absolute physische Maße und werden im Druck exakt umgesetzt. Die Platinum-Engine garantiert Sub-Millimeter-Präzision.

> [!WARNING]
> `interpolate-size` und `field-sizing` erfordern Chrome 129+. Bei älteren Browsern entfallen diese Komfort-Features ohne funktionale Einbußen.

Dieses Dokument ist die **Single Source of Truth (SSoT)** für alle CSS-Technologien im Projekt. Wir nutzen die **Chrome 147+ Baseline** für ein Zero-JS UI-System.

---

## 🚦 Status-System
- ✅ **Aktiv**      → Im Code implementiert und aktiv genutzt.
- 🟡 **Geplant**    → Definitiv in nächsten 2 Sprints (Q2 2026).
- 📋 **Roadmap**    → Langfristige Planung (2026/2027).
- 🧪 **Experimentell** → In Test-Suites aktiv, noch nicht produktiv.

---

## 🆕 Neue Konzepte (Definitionen)

`@container scroll-state`
:   Ermöglicht die Erkennung von Überlauf ohne JavaScript. Wird für den **Overflow Alarm** im Briefkern verwendet.

`field-sizing: content`
:   Native CSS-Lösung für auto-resizing Textareas. Ersetzt komplexe JS-Resize-Listener.

`reading-flow`
:   Stellt sicher, dass die Tastatur-Navigation (Tab) der visuellen Anordnung folgt, unabhängig von der DOM-Reihenfolge.

`attr(data-* type)`
:   Erlaubt das Auslesen von HTML-Attributen als typisierte CSS-Werte (z.B. Längen in mm).

---

## 1. Selektoren (Selectors)

| Selektor | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`:has()`** | Zero-JS State Management (Layout/Theme/Guides) | ✅ Aktiv | 105+ |
| **`:is()`** | Selektoren-Gruppierung (Kompaktheit) | ✅ Aktiv | 88+ |
| **`:not()`** | Negation für Ausnahmen (Print/UI) | ✅ Aktiv | Baseline |
| **`:empty`** | Ghost-Text Steuerung (Platzhalter) | ✅ Aktiv | Baseline |
| **`:checked`** | Radio/Checkbox-Trigger | ✅ Aktiv | Baseline |
| **`:focus-visible`** | Tastatur-Fokus Styling (A11y) | ✅ Aktiv | 86+ |
| **`:focus-within`** | Container-Aktivierung bei Fokus | 🟡 Geplant | 63+ |
| **`:where()`** | Gruppierung mit Spezifität 0 | 🟡 Geplant | 88+ |
| **`::selection`** | Markierungs-Branding | ✅ Aktiv | Baseline |
| **`::backdrop`** | Dialog-Hintergrund Styling | ✅ Aktiv | 37+ |

---

## 2. Eigenschaften (Properties)

| Property | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`interpolate-size`** | Animation von `height: auto` | ✅ Aktiv | 129+ |
| **`field-sizing`** | Auto-Resize für Textfelder | ✅ Aktiv | 129+ |
| **`light-dark()`** | Native Theme-Umschaltung | ✅ Aktiv | 123+ |
| **`text-wrap`** | Typografische Balance (`balance`/`pretty`) | ✅ Aktiv | 114+ |
| **`scrollbar-gutter`** | Layout-Stabilität in der Sidebar | ✅ Aktiv | 94+ |
| **`oklch()`** | Perzeptive Farbräume | ✅ Aktiv | 111+ |
| **`reading-flow`** | Fokus folgt visuellem Layout | 🟡 Geplant | 147+ |
| **`anchor-name`** | Definition von Ankerpunkten | 📋 Roadmap | 125+ |
| **`position-anchor`** | Bindung an Anker | 📋 Roadmap | 125+ |
| **`overflow-anchor`** | Scroll-Stabilität bei Inhalt-Inject | 🟡 Geplant | 56+ |

---

## 3. Funktionen (Functions)

| Funktion | Verwendung | Status | Chrome |
|----------|------------|--------|--------|
| **`calc()`** | Dynamische mm-Positionierung | ✅ Aktiv | Baseline |
| **`color-mix()`** | Dynamische Farbableitung (Hover/Active) | ✅ Aktiv | 111+ |
| **`round()`** | Mathematische Rundung (mm-Präzision) | ✅ Aktiv | 129+ |
| **`attr(* type)`** | Typisierte Attribute (z.B. mm aus HTML) | 🟡 Geplant | 147+ |
| **`clamp()`** | Fluid Typography & Constraints | ✅ Aktiv | 79+ |
| **`oklch()`** | Device-unabhängige Farbwahrnehmung | ✅ Aktiv | 111+ |

---

## 4. At-Rules

| At-Rule | Verwendung | Status | Chrome |
|---------|------------|--------|--------|
| **`@layer`** | Kaskaden-Management (base, theme, structure) | ✅ Aktiv | 99+ |
| **`@property`** | Typisierte Variablen (z.B. für mm-Transitions) | ✅ Aktiv | 85+ |
| **`@container`** | Size- & Scroll-State Queries | ✅ Aktiv | 105+ |
| **`@scope`** | CSS-Isolation (Paper-Styles) | 🟡 Geplant | 118+ |
| **`@starting-style`** | Entry-Animationen (Modals/Toasts) | ✅ Aktiv | 117+ |
| **`@position-try`** | Fallback-Logik für Popover | 🧪 Experimentell | 125+ |

---

## 5. Platinum-Spezial (Chrome 147+)

| Feature | Beschreibung | Status | Chrome |
|---------|--------------|--------|--------|
| **`scroll-state`** | `@container scroll-state` für Overflow-Warnungen | ✅ Aktiv | 147+ |
| **`interesttarget`** | Zero-JS Tooltips & Info-Popups | 📋 Roadmap | 147+ |
| **`Invoker Commands`** | Deklarative Button-Aktionen (`commandfor`) | 📋 Roadmap | 148+ |

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

~~~dataview
TABLE
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
~~~
</content>
</file>

<file path="04_CSS_Quick_Reference.md">
<metadata>Lines: 122 | Size: 3085 B</metadata>
<content>
---
# === BASISINFORMATIONEN ===
title: "CSS Quick Reference — Platinum Edition"
subtitle: "At a Glance: All CSS Features"
description: "Kurze Übersicht aller CSS-Features mit Status und Chrome-Version – für schnelles Nachschlagen"
version: "1.0.0"
version_date: 2026-03-31
status: active

# === DOKUMENT-TYP ===
type: quick-reference
category: css
audience:
  - stakeholders
  - developers
  - project-managers

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/css
  - din-briefneo/quick-reference
  - status/active
  - type/quick-reference

# === ALIASES ===
aliases:
  - "04_CSS_Quick_Reference"
  - "CSS Quick Reference"
  - "CSS Cheat Sheet"
  - "CSS Overview"
  - "Platinum CSS Summary"

# === DATAVIEW Felder ===
css_features_active: 28
css_features_planned: 12
css_features_experimental: 5
baseline_version: "Chrome 147+"

# === VERWANDTE DOKUMENTE ===
related:
  - "03_CSS_Reference"

# === ZEITSTEMPEL ===
date_created: 2026-03-31
date_updated: 2026-03-31

# === AUTOR ===
author: "@din-briefneo/core-team"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - compact

# === GITHUB PAGES ===
permalink: /docs/css-quick-reference/
layout: default
---

# 📊 CSS Capability Matrix (Platinum Summary)

Kompakte Übersicht des technologischen Standards von DIN-BriefNEO. Detaillierte Erklärungen finden sich im [[03_CSS_Reference]].

---

## 🎯 Kern-Status (Top-Features)

| Kategorie | Feature | Status | Chrome |
|-----------|---------|--------|--------|
| **Logik** | Zero-JS State Management (`:has`) | ✅ Aktiv | 105+ |
| **Logik** | Native Theme-Engine (`light-dark`) | ✅ Aktiv | 123+ |
| **Architektur** | Kaskaden-Management (`@layer`) | ✅ Aktiv | 99+ |
| **Präzision** | Millimeter-Mathematik (`@property`, `round`) | ✅ Aktiv | 129+ |
| **Resilience** | Overflow-Alarm (`@container scroll-state`) | ✅ Aktiv | 147+ |
| **Eingabe** | Auto-Resize Inputs (`field-sizing`) | ✅ Aktiv | 129+ |
| **Design** | Perzeptive Farben (`oklch`, `color-mix`) | ✅ Aktiv | 111+ |

---

## 📋 Roadmap Highlights (Q2-Q4 2026)

- 🟡 **Seitenumbrüche:** Native CMA-Sensorik für Multi-Page Layouts.
- 🟡 **CSS-Isolation:** Einführung von `@scope` für Paper-spezifische Stile.
- 📋 **Zero-JS Interaktion:** Umstellung auf `Invoker Commands` und `interesttarget`.
- 📋 **Adaptive UI:** `anchor-positioning` für adaptive Tooltips und Kontextmenüs.

---

## 📈 Projekt-Compliance
- **Baseline:** Chrome 147+ Platinum Master
- **Architektur:** ADR-017 (Flat & Pure)
- **Status:** 72% Feature-Complete (v4.7)

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

~~~dataview
TABLE
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
~~~
</content>
</file>

<file path="05_Feature_Matrix.md">
<metadata>Lines: 288 | Size: 17484 B</metadata>
<content>
---
# === BASISINFORMATIONEN ===
title: "Logische Gruppen — Feature-Matrix (Platinum Master)"
subtitle: "Project Progress, Roadmap & Sprint Planning"
description: "Definiert den aktuellen Funktionsumfang von DIN-BriefNEO und die Roadmap für kommende Platinum-Sessionen"
version: "4.7.0"
version_date: 2026-03-31
status: active

# === DOKUMENT-TYP ===
type: roadmap
category: project-management
audience:
  - all
  - management
  - developers
  - stakeholders

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/roadmap
  - din-briefneo/features
  - din-briefneo/progress
  - status/active
  - type/roadmap
  - project/sprint

# === ALIASES ===
aliases:
  - "05_Feature_Matrix"
  - "Feature Matrix"
  - "Roadmap"
  - "Project Status"
  - "Platinum Roadmap"
  - "Feature Progress"

# === DATAVIEW Felder ===
total_features: 29
completed_features: 21
open_features: 8
completion_percentage: 72
sprint_current: "Sprint 1 (Q2 2026)"
sprint_next: "Sprint 2 (Q3 2026)"
next_milestone: "Q2 2026"
next_milestone_date: 2026-06-30

# === GRUPPEN-STATUS ===
groups:
  identity: 100
  content: 100
  geometry: 80
  infrastructure: 100
  future: 0

# === VERWANDTE DOKUMENTE ===
related:
  - "01_Architecture_Compliance"
  - "02_IMR_Registry"
  - "03_CSS_Reference"
  - "06_Salutation_Engine"

# === ZEITSTEMPEL ===
date_created: 2025-12-01
date_updated: 2026-03-31
date_next_review: 2026-04-30

# === AUTOR ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - wide-table
  - progress-bars

# === GITHUB PAGES ===
permalink: /docs/feature-matrix/
layout: default
---

# Logische Gruppen — Feature-Matrix (Platinum Master)

> [!IMPORTANT]
> **Nächster Sprint:** Seitenumbrüche (#58) und DIN-Overlay (#57) sind priorisiert. Das @din-briefneo/core-team überwacht die Compliance.

> [!TIP]
> Alle Issues sind mit GitHub-Labels versehen. Filtere nach `group:geometry` für Geometrie-spezifische Aufgaben.

Diese Matrix definiert den aktuellen Funktionsumfang von DIN-BriefNEO und die Roadmap für die kommenden Platinum-Sessionen.

---

## 🎯 Platinum Sprint Q2 2026 (Current Focus)

- [x] Variable-First Form A/B Switching (#55)
- [x] Refactor Fold Marks to 4mm Standard (#54)
- [x] CSS Capability Matrix & Platinum Glossary
- [ ] Finalize Address-Autocomplete integration (#42)
- [ ] Integrate DIN-Referenz-SVG Overlay (#57)
- [ ] Implement CMA-Sensor for Page Breaks (#58)

---

## 📌 Quick Links

| Bereich                    | Link                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| 🗺️ **Roadmap**             | [GitHub Projects](https://github.com/din-briefneo/din-briefneo/projects)                            |
| 🐛 **Bug melden**          | [New Issue](https://github.com/din-briefneo/din-briefneo/issues/new?template=bug_report.yml)        |
| ✨ **Feature vorschlagen** | [New Feature](https://github.com/din-briefneo/din-briefneo/issues/new?template=feature_request.yml) |
| 📊 **Milestones**          | [Milestones](https://github.com/din-briefneo/din-briefneo/milestones)                               |

---

## 🚦 Projekt-Status

![Progress](https://img.shields.io/badge/Overall_Progress-72%25-blue)
![Completed](https://img.shields.io/badge/Completed-21_of_29-green)
![Open](https://img.shields.io/badge/Open-8-red)
![Platinum](https://img.shields.io/badge/Platinum_Session-2026-gold)

---

## Gruppe 1: Identität & Adress-Intelligenz

| Funktion                | Beschreibung                                    | Status                                                  | Upgrade-Potenzial                           | 🔗 Issue / PR                                                 |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| **Adress-Autocomplete** | API-Anbindung für schnelle Empfänger-Eingabe    | ✅ Aktiv | Geoapify Premium – aktuell Photon (OSM)     | [#42](https://github.com/din-briefneo/din-briefneo/issues/42) |
| **Adress-Validierung**  | Prüfung der 6-Zeilen-Regel nach DIN 5008        | ✅ Aktiv | Länder-spezifische PLZ-Validierung          | [#43](https://github.com/din-briefneo/din-briefneo/issues/43) |
| **Branding-Atome**      | Native Unterstützung für Logo und Wasserzeichen | ✅ Aktiv | Base64-Optimierung – localStorage-Effizienz | [#44](https://github.com/din-briefneo/din-briefneo/issues/44) |
| **Empfänger-Parser**    | Automatisches Erkennen von Geschlecht/Titeln    | ✅ Aktiv | Firmen-Erkennung – "GmbH/AG" Erkennung      | [#45](https://github.com/din-briefneo/din-briefneo/issues/45) |
| **Profil-Management**   | Granulare Speicherung von Kontakt- & Bankdaten  | ✅ Aktiv | Mehrere Profile – Privat/Büro Wechsel       | [#46](https://github.com/din-briefneo/din-briefneo/issues/46) |
| **Rücksendezeile**      | Automatische Generierung der Kleinstzeile       | ✅ Aktiv | Internationales Format – c/o Anpassungen    | [#47](https://github.com/din-briefneo/din-briefneo/issues/47) |

---

## Gruppe 2: Inhalts-Engine & WYSIWYG

| Funktion                | Beschreibung                                 | Status                                                  | Upgrade-Potenzial                        | 🔗 Issue / PR                                                 |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Ghost-Mirror**        | Echtzeit-Markdown-Vorschau ohne Verschiebung | ✅ Aktiv | Syntax-Highlighting für Markdown-Marker  | [#48](https://github.com/din-briefneo/din-briefneo/issues/48) |
| **Native Sanitization** | XSS-Schutz via Browser-native Sanitizer API  | ✅ Aktiv | CSP-Header – Trusted Types Integration   | [#49](https://github.com/din-briefneo/din-briefneo/issues/49) |
| **Plaintext-Only**      | Striktes Plaintext-Handling in allen Feldern | ✅ Aktiv | Paste-Filter mit Whitelist für `<br>`    | [#50](https://github.com/din-briefneo/din-briefneo/issues/50) |
| **Salutation Engine**   | Automatische Generierung der DIN-Anrede      | ✅ Aktiv | Firmen-Anrede – "Damen und Herren" Logik | [#51](https://github.com/din-briefneo/din-briefneo/issues/51) |
| **Smart Deadlines**     | Kontextsensitive Termin-Vorschläge           | ✅ Aktiv | Feiertags-API – Regionale Prüfung        | [#52](https://github.com/din-briefneo/din-briefneo/issues/52) |
| **Styling Buttons**     | Toolbar für Fett, Unterstrichen, Zitate      | ✅ Aktiv | Keyboard Shortcuts – Strg+B/I/U          | [#53](https://github.com/din-briefneo/din-briefneo/issues/53) |

---

## Gruppe 3: Geometrie & Compliance

| Funktion               | Beschreibung                                   | Status                                                  | Upgrade-Potenzial                     | 🔗 Issue / PR                                                 |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| **Faltmarken**         | Präzise Positionierung nach DIN 5008           | ✅ Aktiv | Toggle für Hilfslinien in der Sidebar | [#54](https://github.com/din-briefneo/din-briefneo/issues/54) |
| **Form A/B Switch**    | Mechanische Umschaltung der Kopfhöhe via CSS   | ✅ Aktiv | Persistenz via LocalStorage           | [#55](https://github.com/din-briefneo/din-briefneo/issues/55) |
| **IMR 4.0 Atome**      | Alle 42 DIN-Felder als eigenständige Objekte   | ✅ Aktiv | IMR-Catalog Generator für Agenten     | [#56](https://github.com/din-briefneo/din-briefneo/issues/56) |
| **Layout-Guides**      | Visuelle Hilfslinien zur Ausrichtungskontrolle | ✅ Aktiv | DIN-Referenz-SVG Overlay              | [#57](https://github.com/din-briefneo/din-briefneo/issues/57) |
| **Seitenumbrüche**     | Native Unterstützung für mehrseitige Briefe    | ⏳ Offen | Duplex-Erkennung – Leerseiten-Logik   | [#58](https://github.com/din-briefneo/din-briefneo/issues/58) |

---

## Gruppe 4: Infrastruktur & Daten-IO

| Funktion            | Beschreibung                               | Status                                                  | Upgrade-Potenzial                          | 🔗 Issue / PR                                                 |
| ------------------- | ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| **Flight Recorder** | Telemetrie und Notfall-Wiederherstellung   | ✅ Aktiv | Log-Export als JSON für Bug-Reports        | [#59](https://github.com/din-briefneo/din-briefneo/issues/59) |
| **JSON Data-IO**    | Import/Export des kompletten Briefzustands | ✅ Aktiv | Schema-Validator gegen IMR 4.0             | [#60](https://github.com/din-briefneo/din-briefneo/issues/60) |
| **Print CSS**       | Vektorscharfer PDF-Export via Print-Styles | ✅ Aktiv | PDF-Metadaten – Titel/Autor im PDF         | [#61](https://github.com/din-briefneo/din-briefneo/issues/61) |
| **PWA Standalone**  | Offline-Fähigkeit und Installation als App | ✅ Aktiv | Update-Benachrichtigung via Service Worker | [#62](https://github.com/din-briefneo/din-briefneo/issues/62) |
| **SSoT Constants**  | Zentrale Geometrie-Definition              | ✅ Aktiv | Typed CSS Properties (`@property`)         | [#63](https://github.com/din-briefneo/din-briefneo/issues/63) |

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

~~~dataview
TABLE
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
~~~

---

## Gruppe 5: Zukunfts-Features (Roadmap 2026/2027)

| Funktion            | Beschreibung                               | Status     | Technologie                   | 🔗 Issue / PR                                                 | Priorität                                                |
| ------------------- | ------------------------------------------ | ---------- | ----------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| **Brief-Archiv**    | IndexedDB für hunderte gespeicherte Briefe | 🔴 Geplant | IndexedDB + Volltextsuche     | [#64](https://github.com/din-briefneo/din-briefneo/issues/64) | ![High](https://img.shields.io/badge/🔴-Hoch-red)        |
| **Serienbrief**     | CSV-Import → Batch-Generierung             | 🔴 Geplant | CSV-Parser + Batch-Logic      | [#65](https://github.com/din-briefneo/din-briefneo/issues/65) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Poststempel**     | Internetmarke via Deutsche Post API        | 🔴 Geplant | Deutsche Post Direkt API      | [#66](https://github.com/din-briefneo/din-briefneo/issues/66) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Fristen-Rechner** | Automatische Berechnung nach BGB           | 🟡 Analyse | Temporal API + Feiertags-API  | [#67](https://github.com/din-briefneo/din-briefneo/issues/67) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Sprachsteuerung** | Diktat via Web Speech API                  | 🔴 Geplant | Web Speech API                | [#68](https://github.com/din-briefneo/din-briefneo/issues/68) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |
| **vCard QR-Code**   | Kontaktdaten als QR im Briefkopf           | 🔴 Geplant | QR-Code Generator             | [#69](https://github.com/din-briefneo/din-briefneo/issues/69) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |
| **Lokale KI**       | Grammatik- und Stilprüfung offline         | 🔴 Geplant | Gemini Nano (Chrome Built-in) | [#70](https://github.com/din-briefneo/din-briefneo/issues/70) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |

---

## 📊 Platinum Fortschritts-Matrix

| Gruppe                             | Gesamt | ✅ Erledigt | ⏳ Offen | Fortschritt                           | Status                                                             |
| ---------------------------------- | ------ | ----------- | -------- | ------------------------------------- | ------------------------------------------------------------------ |
| **Identität & Adress-Intelligenz** | 6      | 6           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Inhalts-Engine & WYSIWYG**       | 6      | 6           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Geometrie & Compliance**         | 5      | 4           | 1        | ![80%](https://progress-bar.dev/80)   | ![In Progress](https://img.shields.io/badge/In_Progress-⚡-yellow) |
| **Infrastruktur & Daten-IO**       | 5      | 5           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Zukunfts-Features**              | 7      | 0           | 7        | ![0%](https://progress-bar.dev/0)     | ![Roadmap](https://img.shields.io/badge/Roadmap-📅-blue)           |
| **GESAMT**                         | **29** | **21**      | **8**    | ![72%](https://progress-bar.dev/72)   | —                                                                  |

---

## 🎯 Platinum Sprint: Nächste Ziele

### 🔴 Hochpriorität (Sprint 1)

| Feature                         | Beschreibung                                     | Issue                                                         | Expected |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------------------- | -------- |
| **DIN-Referenz-SVG Overlay**    | Visuelle DIN-Referenzlinien als Overlay          | [#57](https://github.com/din-briefneo/din-briefneo/issues/57) | Q2 2026  |
| **Seitenumbrüche & CMA-Sensor** | Native mehrseitige Briefe mit Overflow-Erkennung | [#58](https://github.com/din-briefneo/din-briefneo/issues/58) | Q2 2026  |

### 🟡 Mittelpriorität (Sprint 2)

| Feature                       | Beschreibung                             | Issue                                                         | Expected |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------- | -------- |
| **PDF-Metadaten Integration** | Titel, Autor, Datum im generierten PDF   | [#61](https://github.com/din-briefneo/din-briefneo/issues/61) | Q3 2026  |
| **Auto-Save Status-Anzeige**  | Visuelles Feedback bei Speichervorgängen | —                                                             | Q3 2026  |
| **Feiertags-API**             | Regionale Feiertagsprüfung für Deadlines | [#52](https://github.com/din-briefneo/din-briefneo/issues/52) | Q3 2026  |

---

## 📝 Release History

| Version  | Datum   | Gruppe     | Änderungen                                     |
| -------- | ------- | ---------- | ---------------------------------------------- |
| **v4.0** | 2025-12 | Alle       | Initiale Platinum-Master Release               |
| **v4.1** | 2026-01 | Gruppe 1-2 | Adress-Autocomplete & Ghost-Mirror finalisiert |
| **v4.2** | 2026-02 | Gruppe 3   | Form A/B Switch & Layout-Guides implementiert  |
| **v4.3** | 2026-03 | Gruppe 4   | PWA Standalone & JSON Data-IO stabilisiert     |
| **v4.4** | Q2 2026 | Gruppe 3   | Seitenumbrüche & DIN-Overlay (geplant)         |

---

## 🏷️ Tags & Labels für Issues

Folgende Labels werden in GitHub verwendet:

| Label                  | Bedeutung                      | Farbe     |
| ---------------------- | ------------------------------ | --------- |
| `group:identity`       | Identität & Adress-Intelligenz | `#1E88E5` |
| `group:content`        | Inhalts-Engine & WYSIWYG       | `#43A047` |
| `group:geometry`       | Geometrie & Compliance         | `#FB8C00` |
| `group:infrastructure` | Infrastruktur & Daten-IO       | `#8E24AA` |
| `group:future`         | Zukunfts-Features (Roadmap)    | `#757575` |
| `priority:high`        | 🔴 Hoch                        | `#D32F2F` |
| `priority:medium`      | 🟡 Mittel                      | `#FBC02D` |
| `priority:low`         | 🟢 Niedrig                     | `#388E3C` |
| `status:stable`        | ✅ Stabil und abgeschlossen    | `#2E7D32` |
| `status:in-progress`   | ⏳ In Arbeit                   | `#ED6C02` |
| `status:planned`       | 📅 Geplant                     | `#0288D1` |
| `status:analysis`      | 🔍 Analysephase                | `#7B1FA2` |

---

**Status:** ACTIVE
**Version:** Platinum Master v4.7
**Next Release:** Q2 2026 (v4.4)
**Maintainer:** @din-briefneo/core-team
</content>
</file>

<file path="06_Salutation_Engine.md">
<metadata>Lines: 214 | Size: 6838 B</metadata>
<content>
---
# === BASISINFORMATIONEN ===
title: "Salutation & Logic Engine Matrix (IMR 4.0 Standard)"
subtitle: "Business Logic Architecture for DIN-BriefNEO"
description: "Architektur der Geschäftslogik mit klarer Trennung zwischen Datenverarbeitung (Engine) und Darstellung (UI-Bridge)"
version: "9.5.0"
version_date: 2026-03-31
status: active
compliance: "100% DIN 5008:2020-03"

# === DOKUMENT-TYP ===
type: implementation
category: business-logic
audience:
  - developers
  - implementers
  - testers
  - ai-agents

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/engine
  - din-briefneo/logic
  - din-briefneo/salutation
  - status/active
  - type/implementation
  - tech/temporal
  - tech/sanitizer-api
  - tech/proxy
  - tech/opfs

# === ALIASES ===
aliases:
  - "06_Salutation_Engine"
  - "Salutation Engine"
  - "Logic Engine"
  - "Business Logic"
  - "Engine Matrix"
  - "IMR 4.0 Engine"

# === DATAVIEW Felder ===
modules:
  engine: "State & Persistence"
  logic: "Business Logic & Markdown"
  salutation: "Etiquette & Anrede"
test_coverage_engine: 85
test_coverage_logic: 90
test_coverage_salutation: 95
performance_state_update: "2.1ms"
performance_markdown_parse: "28ms"
performance_iban_validate: "0.3ms"
performance_title_extract: "0.2ms"

# === VERWANDTE DOKUMENTE ===
related:
  - "01_Architecture_Compliance"
  - "02_IMR_Registry"
  - "03_CSS_Reference"
  - "05_Feature_Matrix"

# === ZEITSTEMPEL ===
date_created: 2025-10-01
date_updated: 2026-03-31
date_last_deployed: 2026-03-31

# === AUTOR ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"

# === GITHUB ===
npm_package: "@din-briefneo/salutation-engine"
github_repo: "din-briefneo/salutation-engine"
ci_status: "passing"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - wide-table
  - code-wrap

# === GITHUB PAGES ===
permalink: /docs/salutation-engine/
layout: default
---

# Salutation & Logic Engine Matrix (IMR 4.0 Standard)

> [!NOTE]
> Die Salutation Engine ist vollständig von der UI entkoppelt (ADR-017). Änderungen in `salutation.js` haben keinen Einfluss auf das visuelle Rendering.

> [!TIP]
> Für neue Anrede-Formate: Erweitere einfach die `TITLES`-Liste in `salutation.js` – die Engine priorisiert automatisch längere Titel.

Diese Matrix definiert die Architektur der Geschäftslogik für DIN-BriefNEO.
Sie folgt dem **Flat & Pure Architecture [ADR-017]** Prinzip: Klare Trennung zwischen Datenverarbeitung (Engine) und Darstellung (UI-Bridge).

---

## 📌 Quick Links

| Bereich | Link |
|---------|------|
| 📖 **Dokumentation** | [Wiki](https://github.com/din-briefneo/salutation-engine/wiki) |
| 🐛 **Issues** | [Issues](https://github.com/din-briefneo/salutation-engine/issues) |
| 🔄 **CI/CD** | [Actions](https://github.com/din-briefneo/salutation-engine/actions) |
| 📊 **Test Coverage** | [Coverage Report](https://din-briefneo.github.io/salutation-engine/coverage/) |
| 📦 **npm Package** | [npm](https://www.npmjs.com/package/ @din-briefneo/salutation-engine) |

---

## 🚦 Status Badges

![Version](https://img.shields.io/badge/version-9.5--platinum-blue)
![Build](https://img.shields.io/github/actions/workflow/status/din-briefneo/salutation-engine/ci.yml?branch=main)
![Coverage](https://img.shields.io/codecov/c/github/din-briefneo/salutation-engine)
![License](https://img.shields.io/github/license/din-briefneo/salutation-engine)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## 🧠 Engine Architecture (The Core Three)

| Modul | Rolle | Fokus-Technologie | Strategischer Vorteil |
|-------|-------|-------------------|----------------------|
| **`engine.js`** | Der Verwalter | `Proxy` State + `localStorage` / `OPFS` | Reaktive SSoT mit Zero-Setup-Persistenz |
| **`logic.js`** | Der Handwerker | `Temporal` API + `Sanitizer` API | Robuste Date-Arithmetik und sicheres Markdown |
| **`salutation.js`** | Der Etikette-Experte | Pattern Matching & Sorting | Intelligente Anreden mit automatischer Titel-Priorisierung |

---

## 📋 Logik- & Validierungs-Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Markdown** | Zero-Width Ghosting Pattern | `logic.js` | Erhält Markdown-Marker für Editierbarkeit ohne Layout-Shift |
| **Zeit/Datum** | `Temporal.Now.plainDateISO()` | `logic.js` | Eliminiert Legacy `Date()`-Bugs bei Zeitzonen |
| **Adress-Check** | 6-Zeilen-Validierung | `logic.js` | DIN 5008: max. 6 Zeilen im Anschriftfeld |
| **IBAN-Check** | Modulo-97 (`BigInt`) | `logic.js` | Mathematisch korrekte Prüfziffernvalidierung |
| **Rücksendung** | Interpunktion-Generator | `logic.js` | DIN 5008: Einzeilige Rücksendezeile mit Mittelpunkten |

---

## 🎩 Salutation & Etiquette Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Titel-Scan** | Greedy Regex Matching (priorisiert Länge) | `salutation.js` | Erkennt "Prof. Dr." vor "Dr." – robust gegen Mehrfach-Titel |
| **Anrede-Stil** | 3‑stufiger Formality‑Switch | `salutation.js` | Formal / Modern (Guten Tag) / Locker (Hallo) |
| **Firmen-Fall** | Co‑Presence Detection | `salutation.js` | Erkennt "Firma ohne Person" → neutrale Anrede |
| **Grußformel** | Smart‑Default Generator | `salutation.js` | Passende Abschlüsse (Beste Grüße vs. Mit freundlichen Grüßen) |
| **DIN-Fehler** | Punctuation Validator | `salutation.js` | DIN 5008: Warnt bei Komma/Punkt nach Grußformel |

---

## 💻 Source Code (Platinum Edition)

### `engine.js` – State & Persistence

...

### `logic.js` – Business Logic & Constants

~~~javascript
/**
 * logic.js — Unified Business Logic & Constants (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * @module logic
 */

/* ── CONSTANTS & REGISTRY ──────────────────────────────────── */

> [!NOTE]
> Die IMR (Input Mapping Registry) wird zentral in der [[02_IMR_Registry]] gepflegt. Der folgende Code-Auszug dient der technischen Referenz innerhalb der Engine-Logik.

/**
 * IMR (Input Mapping Registry) – definiert die bidirektionale Bindung
...
  { tag: "din-falz-unten", key: "guides_fold_bottom", internal: true },
]);

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

~~~dataview
TABLE
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
~~~

/* ── MARKDOWN PARSER ────────────────────────────────────────── */
...
</content>
</file>

<file path="2026-03-31_Architektur-Review_DIN-BriefNEO.md">
<metadata>Lines: 224 | Size: 19633 B</metadata>
<content>
# Architektur-Review: DIN-BriefNEO

**Reviewer:** Claude Sonnet 4.6 (Anthropic)
**Datum:** 2026-03-31
**Projekt-Version:** v4.7 Platinum
**Analysierte Artefakte:** `index.html`, `app.js`, `engine.js`, `ui.js`, `logic.js`, `salutation.js`, `style.css`, `01_Architecture_Compliance.md`, `05_Feature_Matrix.md`, `.brain/CONSTITUTION.md`, `.brain/ANTI_PATTERN.md`

---

## 📊 Executive Summary

DIN-BriefNEO ist ein architektonisch ambitioniertes, weitgehend kohärentes Projekt mit klar durchdachten Prinzipien. Die „Pure & Flat"-Doktrin (ADR-017) wird im CSS nahezu vollständig umgesetzt – der `@layer`-Stack, die `oklch()`-Farbsemantik und die Zero-JS-UI-Mechanismen über `:has()` sind handwerklich stark. Die größte Stärke liegt in der konsequenten Anwendung von Chrome 147+ APIs ohne Polyfill-Ballast. Die größte Schwäche ist eine systematische **Verletzung der eigenen Architekturprinzipien im JavaScript-Layer**: ANTI_PATTERN DEP-UI01 (imperatives DOM) und DEP-C004 (setTimeout für UI) werden in `ui.js` aktiv gebrochen, das Profil wird außerhalb des StateManagers in `localStorage` persistiert und `innerHTML` wird im Markdown-Mirror ohne Sanitizer API genutzt. Empfehlung: **Nachbesserungen im Sprint 1 vor nächstem Feature-Work**; kein Major-Refactoring notwendig, aber drei kritische Regressionspunkte müssen geschlossen werden.

---

## ✅ Stärken (What Works Well)

### CSS-Architektur
- **`@layer`-Stack** ist strukturell makellos: `latex.base → ui.theme → din.structure → ui.floating → ui.components → project.overrides → core.immutable` liefert korrekte Kaskadenpriorität ohne Spezifitätskämpfe.
- **`@scope (#paper)`** isoliert DIN-Geometrie sauber und ersetzt Shadow-DOM ohne dessen Nachteile. Exzellente Umsetzung.
- **Variablen-Architektur** mit `@property` für `--din-y-header-start` und vollständig abgeleiteten Folge-Variablen (`calc(var(--din-y-abschnitt) + 58.4mm)`) ist Single-Source-of-Truth korrekt umgesetzt.
- **Form A/B Zero-JS Switch** via `:root:has(#state-layout-a:checked)` ist die sauberste denkbare Implementierung für diesen Use Case.
- **`@container scroll-state(scrollable: block)`** für den Overflow-Alarm (Chrome 147+ exklusiv) ist ein echtes Showcase-Feature, konsequent und korrekt eingesetzt.
- **Print-Layer** mit `@page`, `@counter-style din-pages` und korrektem `@page :first { content: none }` ist vollständig und normkonform.
- **`light-dark()` + `oklch()`** Theming ist ausgewogen, wahrnehmungsgetreu und wartbar.

### JavaScript-Core
- **`StateManager`** ist schlank und korrekt: pub/sub, dot-notation update, kein Framework-Ballast.
- **OPFS → localStorage Fallback** in `engine.js` ist nach ANTI_PATTERN DEP-P001 (PARTIALLY RELAXED) konform und robust durch try/catch abgesichert.
- **`Capabilities`-Objekt** (frozen, logiert Modus) ist elegante Selbstdokumentation zur Laufzeit.
- **`parseMarkdown()`** mit dem Ghosting-Pattern (`.md-marker { width:0; overflow:hidden }`) ist kreativ und funktioniert ohne WYSIWYG-Framework.
- **`SalutationEngine`** deckt alle relevanten Formalitätsstufen ab, Titel-Extraktion mit Regex ist solide, `validateClosing()` ist DIN-konform.
- **Temporal API** wird in `todayISO()` und `formatDate()` konsequent genutzt, kein `new Date()` in Sicht.
- **IBAN-Validierung** via `BigInt` + Modulo-97 ist korrekt und performant.

### HTML & IMR
- **`contenteditable="plaintext-only"`** ist in allen editierbaren Feldern gesetzt – lückenlos.
- **IMR in `logic.js`** (`Object.freeze([...])`) ist SSoT für Tag↔Key-Mapping, unveränderlich und zentral.
- **Placeholder-Pattern** via CSS Custom Property `--p` (inline `style="--p: &quot;Vorname&quot;"`) ist eine elegante Lösung, die das HTML minimal hält.
- **`<dialog>`-basiertes Modal-System** ist nativer Best Practice, kein JS-Modal-Framework nötig.

### Dokumentation
- **Nummeriertes Dokument-System** mit YAML-Frontmatter ist für Obsidian Dataview und GitHub Pages doppelt verwendbar.
- **`.brain/`-Verzeichnis** mit `CONSTITUTION.md` und `ANTI_PATTERN.md` als architektonische Leitdokumente ist eine starke Governance-Struktur.
- **Compliance-Matrix** in `01_Architecture_Compliance.md` mit Status-Ampel (✅/🟡/📋) ist gut lesbar und aktuell.

---

## ⚠️ Schwächen & Risiken

### 🔴 Kritisch

**SW-01: `innerHTML` im Markdown-Mirror ohne Sanitizer API**
In `ui.js` (`_syncAll()`) und beim `input`-Event auf `din-text` wird `mirror.innerHTML = Logic.parseMarkdown(text)` gesetzt. Die Compliance-Matrix deklariert `Sanitizer API` als ✅ Aktiv. Im Code ist sie nicht implementiert. Da `parseMarkdown()` den Input mit HTML-Entity-Escaping (`&amp;`, `&lt;`, `&gt;`) vorverarbeitet, ist das Risiko gering, aber die Architektur-Compliance ist verletzt. Ein gezielt konstruiertes Emoji oder ein ZWSP kann den Escape umgehen.

**SW-02: Profil-Persistenz außerhalb des StateManagers**
In `_initModals()` (`ui.js`) wird das Profil mit `localStorage.setItem("din_profile", JSON.stringify(data))` gespeichert und beim Reset (`localStorage.clear()`) mit gelöscht – aber nicht über `StateManager.update()` geführt. Das verletzt die SSoT-Doktrin aus `CONSTITUTION.md §III`. Es existieren damit zwei parallele Daten-Stores ohne Synchronisierung: der StateManager-State und `din_profile`.

**SW-03: `innerHTML` für IBAN-Ghost ohne Escaping**
In `_initModals()` wird `ibanGhost.innerHTML = \`<span class="invisible">${invisiblePart}</span>${visiblePart}\`` gesetzt, wobei `invisiblePart = formatted` direkt aus dem IBAN-Input kommt. Obwohl IBAN-Zeichen alphanumerisch sind, ist das Muster unsicher: Es fehlt jegliches Escaping. Ein Nutzer kann `<img src=x onerror=alert(1)>` eingeben, wenn `maxlength="34"` clientseitig umgangen wird.

**SW-04: ANTI_PATTERN DEP-UI01 aktiv verletzt**
`_initModals()` setzt `profileBtn.onclick = ...` imperativ, `btn-confirm-ok` nutzt direkte Event-Listener für DOM-Manipulation. Das ANTI_PATTERN-Register verbietet imperatives DOM-Toggling. Auch in `index.html` gibt es noch `onclick="document.getElementById('profile-dialog').showModal()"` als Inline-Handler – ein weiterer Verstoß.

**SW-05: ANTI_PATTERN DEP-C004 verletzt (setTimeout für UI-Feedback)**
`Toast.show()` nutzt `setTimeout(() => el.hidePopover(), 3000)` für UI-Dismissal. Das Regelwerk erlaubt setTimeout nur für Debouncing/Storage-Sync. Für timed UI state wäre eine CSS-Animation mit `animation-fill-mode: forwards` oder `@keyframes` + `animationend`-Listener die konforme Lösung.

**SW-06: `_onStateChange()` ruft `_syncAll()` bei jedem State-Update**
Jede einzelne Tastatureingabe triggert `_syncAll()`, was über alle IMR-Einträge iteriert und alle nicht-fokussierten Felder setzt. Bei 45+ IMR-Einträgen sind das ~44 querySelector-Aufrufe + DOM-Schreiboperationen pro Keystroke. Das ist kein Problem bei aktuellem Umfang, wird aber zum Bottleneck sobald Brief-Archiv und Serienbrief hinzukommen.

### 🟡 Mittel

**SW-07: `AddressService` in `ui.js` macht direkten `fetch()`-Aufruf**
Die Photon-API-Anbindung (`fetch("https://photon.komoot.io/...")`) ist ohne Error-Handling für Network-Fails implementiert. Timeout fehlt, kein `AbortController`, kein Feedback an den User. Das Resultat wird nur auf `console.log` geschrieben – die Funktion ist faktisch Dead Code in Production.

**SW-08: Salutation Engine-Trigger hat kein Fallback für fehlende Radio-Inputs**
`_updateSalutation()` liest `document.querySelector('input[name="recipientType"]:checked')` – diese Radio-Inputs existieren **nicht** in der aktuellen `index.html`! Die Sidebar enthält nur Form A/B, Theme und Guides. Der `type`-Parameter fällt immer auf `"none"` zurück, was bei Vor- und Nachname immer `"Sehr geehrte Damen und Herren,"` ergibt, auch wenn ein Name eingetragen ist. Das ist ein funktionaler Bug.

**SW-09: Profile-Dialog lädt gespeichertes Profil nicht zurück**
Beim Öffnen des `profile-dialog` werden die Felder nicht mit dem gespeicherten `din_profile` aus localStorage befüllt. Nutzer sehen nach dem ersten Speichern immer leere Felder.

**SW-10: `_syncAll()` überschreibt `din-anrede` und `din-grussformel` mit leerem String**
Der IMR enthält Einträge für `din-anrede` (key: `"anrede"`) und `din-grussformel` (key: `"grussformel"`). `_syncAll()` setzt `el.textContent = this.sm.state.content[entry.key] || ""`. Da die Engine diese Werte via `setAttribute("data-salutation", ...)` setzt (nicht via `sm.update`-Pfad für `textContent`), kann ein State-Reload die Ghost-Werte überschreiben und das Feld leer erscheinen lassen.

**SW-11: Faltmarken-Position abhängig von `--din-y-abschnitt`**
`--din-y-fold-1: calc(var(--din-y-abschnitt) + 60mm)` und `--din-y-fold-2: calc(var(--din-y-abschnitt) + 165mm)`. DIN 5008 definiert Faltmarken als **absolute Positionen vom Blattoberkante**, nicht relativ zum Anschriftfeld. Bei Form A (27mm): Fold-1 = 87mm, Fold-2 = 192mm. DIN 5008 schreibt: erste Faltmarke bei 87mm, zweite bei 192mm von Oberkante. Für Form A stimmt das zufällig. Bei Form B (45mm): Fold-1 = 105mm, Fold-2 = 210mm. DIN 5008 schreibt für Form B: erste Faltmarke bei 105mm, zweite bei 210mm. Auch das stimmt. Die Formel ist also korrekt, aber konzeptionell irreführend – die Faltmarken-Position ist keine Funktion des Anschriftfelds, sondern des Formats.

**SW-12: `--c-text-muted` und `--c-danger` werden im CSS referenziert, aber nie definiert**
`din-fuss { color: var(--c-text-muted) }`, `[aria-invalid="true"] { text-decoration: underline wavy var(--c-danger) }` und `#toast-v4.type-success { border-left: 4px solid var(--c-success) }` referenzieren Custom Properties, die in `:root` nicht definiert sind. Die Werte fallen auf `unset` zurück. Das ist ein stiller Darstellungsfehler.

### 🟢 Niedrig

**SW-13: `@font-feature-values` für "Inter" / "Aptos"**
`@font-feature-values` ist eine Level-4-CSS-Fonts-Spezifikation. Chrome 147 unterstützt sie, aber die Werte (`tabular-nums: 1`, `slashed-zero: 2`) sind Slot-Definitionen für `@styleset`-Werte, die dann via `font-variant-alternates: styleset(tabular-nums)` aktiviert werden müssen. Im Code wird stattdessen direkt `font-feature-settings: "tnum" on, "zero" on` genutzt – korrekt, aber `@font-feature-values` bleibt damit toter Code.

**SW-14: `manifest.json` nicht geladen**
`index.html` lädt keine `<link rel="manifest">`. Die PWA-Standalone-Fähigkeit (Feature-Matrix: ✅ Aktiv) ist damit nicht aktiviert, obwohl `sw.js` und `manifest.json` existieren. Auch `sw.js` wird nirgendsregistriert.

**SW-15: DevMode-Toggle via `location.reload()`**
`document.getElementById("app-version")?.addEventListener("click", () => { ... location.reload() })` ist ein harter Reload für einen Debug-Toggle. Das löscht ungespeicherten State. Für ein Dev-Tool ist das akzeptabel, aber es sollte dokumentiert sein.

**SW-16: `iban-ghost` Template-String ist für DE-IBAN hardcodiert**
`const ghostTemplate = "DE00 0000 0000 0000 0000 0000 0000"` hat 35 Zeichen, aber `maxlength="34"` ist auf dem Input. Deutsche IBANs sind 22 Zeichen. Internationale IBANs bis 34 Zeichen. Der Ghost überdehnt sich bei kurzen IBANs.

---

## 🚀 Verbesserungsvorschläge (Priorisiert)

### 🔴 Hochpriorität (Sprint 1)

- [ ] **Problem:** SW-01 + SW-03 – `innerHTML` ohne Sanitizer
  **Lösung:** `mirror.setHTML(Logic.parseMarkdown(text))` statt `innerHTML`. Für den IBAN-Ghost: `ibanGhost.innerHTML` durch separates DOM-Building mit `document.createElement()` + `textContent` ersetzen, da kein komplexes Markup nötig.
  **Impact:** Security-Compliance wiederhergestellt, Konformität mit eigenem Architektur-Dokument.

- [ ] **Problem:** SW-08 – Salutation Engine hat keinen Input für Empfänger-Typ
  **Lösung:** Radio-Gruppe für `recipientType` (weiblich/männlich/neutral) und `formality` (formal/polite/casual) in die Sidebar aufnehmen. Zwei `<input type="radio">` Gruppen mit hidden inputs nach dem Schema der bestehenden Layout/Theme-Switcher.
  **Impact:** Kernfunktion der Salutation Engine ist derzeit funktional dead – höchste UX-Priorität.

- [ ] **Problem:** SW-12 – Undefinierte CSS Custom Properties
  **Lösung:** In `:root` ergänzen: `--c-text-muted: oklch(55% 0.03 250)`, `--c-danger: oklch(55% 0.2 30)`, `--c-success: oklch(60% 0.2 145)`.
  **Impact:** Silent rendering failures behoben, Fußzeile und Validation-Tooltips korrekt dargestellt.

- [ ] **Problem:** SW-02 – Profil-Store außerhalb StateManager
  **Lösung:** Profil in `StateManager` unter `state.profile.*` führen. `Storage.save()` und `Storage.load()` verarbeiten damit das Profil automatisch. `din_profile` als Legacy-Key beim ersten Load migrieren und löschen.
  **Impact:** SSoT wiederhergestellt, Reset funktioniert atomar.

- [ ] **Problem:** SW-09 – Profil-Dialog lädt nicht zurück
  **Lösung:** Im `showModal()`-Trigger die gespeicherten Profilwerte aus `sm.state.profile` in die Input-Felder schreiben. Nach der Profil-Store-Migration (SW-02) ergibt sich das von selbst.
  **Impact:** Grundlegende UX-Erwartung erfüllt.

- [ ] **Problem:** SW-14 – PWA nicht aktiviert trotz Feature-Claim
  **Lösung:** In `index.html` `<link rel="manifest" href="manifest.json">` ergänzen. Service Worker in `app.js` registrieren: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js')`.
  **Impact:** Feature-Matrix-Claim korrekt; Offline-Fähigkeit aktiviert.

### 🟡 Mittelpriorität (Sprint 2)

- [ ] **Problem:** SW-06 – `_syncAll()` bei jedem Keystroke
  **Lösung:** `_syncAll()` nur bei State-Changes im `config.*`-Namespace triggern. Für `content.*`-Pfade nur den betroffenen Tag aktualisieren: `_syncField(path)` statt Komplett-Iteration.
  **Impact:** Performance-Grundlage für Brief-Archiv und Serienbrief gelegt.

- [ ] **Problem:** SW-04 – Imperatives DOM (ANTI_PATTERN DEP-UI01)
  **Lösung:** Inline-`onclick` aus `index.html` entfernen, alle Button-Handler zentralisiert in `UIController._initModals()`. `profileBtn.onclick` durch `addEventListener` ersetzen.
  **Impact:** Code-Hygiene, leichteres Testen, Konformität mit eigenem Rulebook.

- [ ] **Problem:** SW-05 – `setTimeout` für Toast-Dismissal (ANTI_PATTERN DEP-C004)
  **Lösung:** Toast über CSS `animation-duration: 3s; animation-fill-mode: forwards` auto-dismissen. `animationend`-Event zum `hidePopover()` nutzen.
  **Impact:** Anti-Pattern aus eigenem Register eliminiert.

- [ ] **Problem:** SW-07 – AddressService ist Dead Code
  **Lösung:** Entweder vollständig implementieren (mit `AbortController`, Error-State, UI-Dropdown) oder aus `ui.js` entfernen und als `#42` offen lassen. Dead Code ist gefährlicher als kein Code.
  **Impact:** Keine stummen Netzwerkfehler in der Console; klares Feature-Flag.

- [ ] **Problem:** SW-10 – `_syncAll()` löscht Ghost-Salutation
  **Lösung:** IMR-Einträge für `din-anrede` und `din-grussformel` mit `{ ..., ghost: true }` markieren. In `_syncAll()` für ghost-Einträge `textContent` nur setzen, wenn `sm.state.content[key]` einen echten Nutzer-Wert enthält (nicht den Engine-generierten).
  **Impact:** Salutation Engine und State-Sync arbeiten ohne Konflikt.

### 🟢 Niedrigpriorität (Backlog)

- [ ] **Problem:** SW-13 – `@font-feature-values` ist toter Code
  **Lösung:** Entweder entfernen oder vollständig auf `font-variant-alternates: styleset(tabular-nums, slashed-zero)` umstellen.
  **Impact:** CSS-Hygiene.

- [ ] **Problem:** SW-16 – IBAN-Ghost Template-Mismatch
  **Lösung:** Template dynamisch an die erkannte IBAN-Länderkennung anpassen (DE = 22 Zeichen, AT = 20, CH = 21 etc.). Fallback: maximale Länge 34.
  **Impact:** Korrekte visuelle Eingabehilfe für nicht-deutsche IBANs.

- [ ] **Problem:** SW-15 – DevMode-Reload löscht State
  **Lösung:** Dev-Panel-Toggle via `document.body.classList.toggle('dev-mode')` + CSS ohne Reload. State bleibt erhalten.
  **Impact:** Bessere DX beim Debugging.

- [ ] **Problem:** Fehlender Entwickler-Setup-Guide
  **Lösung:** `CONTRIBUTING.md` mit lokalem Server-Setup (kein `file://` für OPFS!), Linting (`stylelintrc.json`), Commit-Konventionen.
  **Impact:** Onboarding für neue Contributor oder zukünftigen Mo-nach-3-Monaten-Pause.

---

## 🧠 Architektur-Entscheidungen (Review)

**ADR-017 / Pure & Flat:** Im CSS vollständig umgesetzt. Im JS teilweise verletzt (SW-02, SW-04, SW-05, SW-08). Die Grundidee – flache Hierarchie, keine Abstraktionsebenen für einfache Probleme – ist solide und bleibt der richtige Ansatz für diesen Scope.

**Zero-JS-UI-Doktrin:** Für Layout, Theme, Guides und Faltmarken konsequent implementiert. Lobenswert. Der Widerspruch: Für Salutation-Typ und Formalität gibt es keine CSS-steuerbaren Inputs in der Sidebar – das ist die einzige Stelle, wo die Doktrin hätte angewendet werden müssen, aber nicht wurde.

**Chrome-147-Baseline:** Wird ohne Polyfills konsequent genutzt. `@container scroll-state`, `@position-try`, `@starting-style`, Popover API – alles zeitgemäß. Die Entscheidung, keine `@supports`-Guards zu setzen, ist für ein Einzel-Browser-Produkt korrekt und reduziert Code-Ballast. Für 2026/2027 bleibt die Baseline zukunftssicher: Alle genutzten APIs sind Blink-stabil und werden nicht deprecated.

**Plaintext-Only contenteditable:** Lückenlos umgesetzt in allen editierbaren Feldern. Die Kombination mit Ghost-Mirror für `din-text` ist die technisch beste Lösung für WYSIWYG ohne Framework.

**`@scope`-Strategie:** In `style.css` via `@scope (#paper)` für DIN-Geometrie bereits aktiv. In `01_Architecture_Compliance.md` steht `@scope` noch als 🟡 Geplant. Dokument ist veraltet – bitte aktualisieren.

---

## 📋 Offene Fragen & Unklarheiten

1. **Welche Daten lädt das Profil-Formular beim Öffnen?** – Aktuell: nichts (SW-09). Klärt zugleich SW-02 (Store-Konsolidierung).

2. **Ist `recipientType` / `formality` absichtlich aus der Sidebar entfernt?** – Die Salutation Engine wartet darauf; ohne diese Inputs ist die Engine kalt. Bewusste Entscheidung oder vergessenes Feature?

3. **Wie wird der Service Worker aktuell auf Änderungen eingespielt?** – `sw.js` ist nicht referenziert; ohne Cache-Busting-Strategie sind zukünftige Deployments problematisch.

4. **Ist `din-branding-logo` bereits an eine Upload-Logik angebunden?** – IMR enthält den Key `logo`, aber weder HTML noch JS zeigen Implementierung.

5. **Warum ist `--din-y-header-start` via `@property` registriert, aber im Code nicht verwendet?** – Es gibt nur `--din-y-abschnitt` als aktive Variable. Ist `--din-y-header-start` ein veraltetes Artefakt?

6. **Was genau tut `Flight Recorder` (Feature-Matrix: ✅ Aktiv, Issue #59)?** – Im Code ist kein Telemetrie-System erkennbar. Ist das ein anderer Codepfad oder ist der Feature-Status falsch?

---

## 🎯 Fazit & Nächste Schritte

**Gesamturteil: Nachbesserungen nötig – Sprint 1 vor Feature-Arbeit.**

Das Fundament ist stark. Die CSS-Architektur ist production-ready. Der StateManager ist sauber. Die Salutation Engine ist korrekt. Aber drei Bereiche blockieren einen sauberen Release:

1. **Security:** `innerHTML` ohne Sanitizer (SW-01, SW-03) muss vor Produktiv-Einsatz geschlossen werden.
2. **Funktionalität:** Die Salutation Engine ist ohne Sidebar-Inputs faktisch deaktiviert (SW-08). Das ist der sichtbarste Bug für jeden Nutzer.
3. **Datenkonsistenz:** Zwei parallele Stores (StateManager vs. `localStorage["din_profile"]`) sind eine Zeitbombe für den geplanten Brief-Archiv-Feature (SW-02).

Empfohlene Sprint-1-Reihenfolge: SW-12 (3 Minuten, definiere fehlende CSS-Vars) → SW-01/SW-03 (Sanitizer, 30 Minuten) → SW-08 (Sidebar-Inputs, 1 Stunde) → SW-02/SW-09 (Store-Konsolidierung, 2 Stunden) → SW-14 (PWA-Aktivierung, 15 Minuten).

Nach Sprint 1 ist das Projekt **Release Candidate** für den aktuellen Feature-Scope.

---

*Review-Dokument erzeugt durch statische Code-Analyse. Laufzeit-Verhalten (z.B. tatsächliches `@container scroll-state`-Triggering, OPFS-Verfügbarkeit) wurde nicht getestet.*
</content>
</file>

<file path="GEMINI.md">
<metadata>Lines: 63 | Size: 3068 B</metadata>
<content>
# AGENT OPERATING RULES — MANDATORY, NON-NEGOTIABLE

## WRITE RULES

- EXISTING FILE: FORBIDDEN to use write_file rewrite mode. Use edit_block (replace tool) ONLY.
- NEW FILE: write_file allowed for initial creation.
- MAX CHUNK: 30 lines per edit_block operation.
- BEFORE ANY WRITE: Read file, state line count, state change scope.
- NO MULTI-FILE OPERATIONS: One function, one file, one confirmation.

## STOP CONDITIONS — HALT IMMEDIATELY IF:

- Planned change removes more than 10 lines net (SHRINK-ALARM).
- File would shrink more than 15% in size.
- Operation would take more than 2 minutes.

## SDD-EXCELLENCE (SPEC-KIT FLOW)

- **NO-FLUFF MANDATE:** Keine menschliche Prosa ("bitte", "hier wird", "schön"). Nur technischer Slang & Fakten.
- **CONTEXT PRUNING:** Niemals alle Spec-Dateien gleichzeitig lesen.
- **PHASE 1 (Goal):** Nur `10-Anforderung.md` lesen.
- **PHASE 2 (Architecture):** Nur `20-Plan.md` lesen.
- **PHASE 3 (Action):** Nur `30-Aufgaben.md` als Checkliste nutzen.
- **REDUKTION:** Jede Aufgabe muss in unter 5 Minuten (nicht 40!) gelöst werden. Wenn ich loope: ABBRUCH und Nutzer fragen.

## RESTORE POINTS & PERSISTENCE

- **COMMIT-REQUIREMENT:** Jede abgeschlossene Teilaufgabe (Mission) MUSS mit einem physischen `git commit` beendet werden.
- **VERSION-CONTROL-ONLY:** Manuelle Versionierung via Dateiname (z.B. `_v1.0.md`) ist STRENGSTENS UNTERSAGT. Git ist das einzige Werkzeug für Historie.
- **RESTORE:** Niemals die Workspace in einem uncommitted Zustand hinterlassen.

## TECHNICAL SPECIFICATION (DIN-5008-NEO)

- NO LEGACY DATE: Use Temporal API exclusively.
- NO INNERHTML: Use textContent or Sanitizer API (setHTML).
- NO JS UI TOGGLES: Use HTML Invoker Commands (commandfor) and CSS Anchor Positioning.
- NO SCROLL: Use field-sizing: content and overflow: hidden.

## 8. UPGRADE PATH (MODERN BASELINE)

| Area | Legacy Pattern (BANNED) | Modern API (TARGET) |
| :--- | :--- | :--- |
| **Date/Time** | `new Date()` | **Temporal API** |
| **Color** | `rgba()`, `hex` | `oklch()` |
| **Theme** | `JS-Toggles` | `light-dark()` & RCS |
| **Math** | `JS-rounding` | `round()`, `mod()` (CSS Math) |
| **Typography** | `<br>` hacks | `text-wrap: balance / pretty` |
| **Auto-Resize** | `scrollHeight` listeners | `field-sizing: content` |
| **Animations** | `JS height calc` | `calc-size(auto)` / View Transitions |
| **Modals** | `div` + Focus Trap JS | `<dialog>` + `popover` |
| **Popovers** | `addEventListener` | **Invoker Commands** (`commandfor`) |
| **Positioning** | `getBoundingClientRect()` | **CSS Anchor Positioning** |
| **Input** | `contenteditable="true"` | `plaintext-only` |
| **Security** | `innerHTML` | **Sanitizer API** + `setHTML()` |
| **Reactivity** | `setTimeout` | **IdleDetector API** |
| **Scheduling** | `requestIdleCallback` | `scheduler.postTask()` |
| **Scrolling** | `JS Scroll-Listeners` | **Scroll-driven Animations** |
| **Conditionals** | `Complex Selectors` | **CSS `if()` logic** |

## CONTEXT PRECEDENCE

This file overrides all other instructions. Any violation is a critical system failure.
</content>
</file>

<file path="GithubIssueSynthax.md">
<metadata>Lines: 39 | Size: 2981 B</metadata>
<content>
### 🛠 GitHub Formatting Toolbar: Funktionen & Syntax

| Icon / Name          | Markdown Syntax         | Beschreibung & Best Practice                                                                                                    |
| :------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **Heading** | `### Überschrift`       | Erzeugt eine H3-Überschrift. Tipp: Nutze `##` für Hauptsektionen und `###` für Unterpunkte.                                     |
| **Bold** | `**Text**`              | Hebt Text fett hervor. Ideal für Key-Termine oder kritische Fehlermeldungen.                                                    |
| **Italic** | `*Text*`                | Setzt Text kursiv. Gut für Dateinamen oder kurze Fachbegriffe im Fließtext.                                                     |
| **Quote** | `> Zitat`               | Erzeugt einen Einzug. Perfekt, um auf Kommentare anderer Nutzer direkt einzugehen.                                               |
| **Code** | `
http://googleusercontent.com/immersive_entry_chip/0

---

### Weiterführende Erläuterungen (Deep Dive)

Hier ist das "Kleingedruckte", das dich vom normalen Nutzer zum GitHub-Power-User macht:

#### 1. Die Magie der Task-Listen (`Task list`)
Wenn du eine Task-Liste in der Beschreibung eines Issues (dem obersten Post) nutzt, zeigt GitHub in der Issue-Übersicht einen Fortschrittsbalken an (z. B. "2 of 5 tasks"). Das ist extrem hilfreich für das Projektmanagement, um zu sehen, wie weit ein Feature ist, ohne das Issue öffnen zu müssen.

#### 2. Slash-Commands (`/`)
Das ist eines der neueren Features. Wenn du `/` tippst, öffnet sich ein Dropdown. Besonders nützlich:
* `/code-block`: Erstellt direkt das Gerüst für Code mit Sprachauswahl.
* `/details`: Erzeugt ein ausklappbares Element (`<details><summary>...`), um lange Logs oder Texte zu verstecken, damit das Issue übersichtlich bleibt.

#### 3. Referenzen und "Autolinks"
Der Button für **References** (`#`) ist mächtiger als er aussieht. Wenn du in einem Pull Request schreibst: `Closes #42`, wird das Issue mit der Nummer 42 automatisch geschlossen, sobald der Pull Request gemergt wird. Das spart manuelles Aufräumen.

#### 4. Drag & Drop Ergänzung
Auch wenn es dafür keinen expliziten Button in deiner Liste gibt: Du kannst Bilder, PDFs oder Log-Dateien einfach per **Drag & Drop** in das Textfeld ziehen. GitHub lädt sie hoch und fügt den passenden Markdown-Link automatisch ein.

### Profi-Tipp: Tastatur-Shortcuts
Du musst die Buttons gar nicht immer klicken. Wenn du Text markierst, funktionieren die Standard-Shortcuts:
* `Strg + B`: Fett
* `Strg + I`: Kursiv
* `Strg + K`: Link einfügen
* `Strg + Shift + P`: Zwischen "Write" (Schreiben) und "Preview" (Vorschau) wechseln.

Möchtest du zu einem dieser Punkte (z. B. den Slash-Commands oder der Automatisierung von Issues) noch mehr Details wissen?
</content>
</file>

<file path="Neuer Ordner/2026-01-22_15-40_DIN 5008 Brief-Generator.html">
<metadata>Lines: 8726 | Size: 310977 B</metadata>
<content>
<!--
 > File: index.html
 > Role: Application Entry Point & DOM Root
 > Spec: [DIN.UI.SHELL.BIND]
 > Dep:  css/theme.css, js/core/app.js, sw.js
-->
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>DIN 5008 Brief-Generator</title>

    <link rel="manifest" href="manifest.json" />
    <meta name="theme-color" content="#2c3e50" />
    <meta
      name="description"
      content="Professioneller Brief-Editor nach DIN 5008 (V9 Platinum)."
    />
    <link
      rel="icon"
      href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✉️</text></svg>"
    />

    <style>
/* css/theme.css */
/*
 * > File: css/theme.css
 * > Role: Design Tokens & Color Palette (Modern SaaS Theme)
 * > Spec: [DIN.UI.THEME.V2]
 */
:root {
  /* [PALETTE] Modern SaaS Blue */
  --c-primary: #4a90e2;
  --c-primary-hover: #357abd;

  /* [PALETTE] Surfaces (Light Theme) */
  /* Replaces old dark scheme */
  --c-bg: #f8f9fa; /* Fallback */
  --c-bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  --c-surface-secondary: #f1f3f5;

  /* [SIDEBAR] User Custom Dark Blue */
  --c-sidebar-bg: #21293b;
  --c-sidebar-btn-bg: #2d3545; /* New Token */
  --c-sidebar-text: #ffffff;
  --c-sidebar-text-muted: #94a3b8; /* Slate 400 */
  --c-sidebar-border: rgba(255, 255, 255, 0.1);

  /* [SIGNALS] */
  --c-danger: #dc3545;
  --c-success: #2ecc71; /* Kept vibrant green */
  --c-warning: #f1c40f;

  /* [TEXT] */
  --c-text-primary: #212529;
  --c-text-secondary: #495057;
  --c-text-muted: #6c757d;

  /* [BORDERS] */
  --c-border: #dee2e6;
  --c-border-focus: #4a90e2;

  /* [DIMENSIONS] */
  --dim-a4-width: 210mm;
  --dim-a4-height: 297mm;

  /* [TYPOGRAPHY] System Stack */
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;

  /* [SHADOWS] */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* [SPACING] */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

/* [SCROLLBAR] Modern Slim */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.2);
}

</style>
    <style>
/* css/din5008-paper.css */
/**
 * > File: css/din5008-paper.css
 * > Role: Physical Paper & Layout Engine
 * > Spec: [DIN.UI.PAPER.GRID]
 * > Dep:  css/theme.css
 * -----------------------------------------------------------------------------
 * Strictly implements DIN 5008 dimensions (mm), folds, and print rules.
 */

:root {
    /* [DIN.UI.PAPER.DIMS] Global Dimensions */
    --paper-w: 210mm;
    --paper-h: 297mm;
    --margin-l: 25mm;
    --margin-r: 20mm;

    /* [DIN.UI.PAPER.VARS] Layout Variables */
    /* Form B (Standard) Defaults */
    --pos-addr-top: 45mm; /* Adjusted to Standard B */
    --pos-ref-top: 50mm;
    --pos-fold-1: 105mm;
    --pos-fold-2: 210mm; /* [FIX] Correct DIN 5008 Form B dimension */

    /* [DIN.UI.TYPO.STACK] Modern System Stack */
    --font-stack: 'Aptos', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
    --font-base: 11pt;
    --font-small: 8pt;
    --c-paper-text: #000000;
}

/* [DIN.UI.LAYOUT.FORMA] Override */
body.layout-form-a {
    --pos-addr-top: 32mm;
    --pos-ref-top: 32mm;
    --pos-fold-1: 87mm;
    --pos-fold-2: 192mm; /* [FIX] Correct DIN 5008 Form A dimension (87+105) */
}

/* --- The Sheet --- */
#brief-container {
    position: relative;
    /* Box shadow is handled in app-ui.css as it is cosmetic */
}

#sheet {
    width: var(--paper-w);
    /* [FIX] Strict A4 Physics: No Vertical Growth */
    height: var(--paper-h);

    background: white;
    color: var(--c-paper-text) !important;
    font-family: var(--font-stack) !important;
    font-size: var(--font-base) !important;
    line-height: 1.4;
    padding-left: var(--margin-l);
    padding-right: var(--margin-r);
    position: relative;
    box-sizing: border-box;

    /* [FIX] Cut off overflow content to simulate real paper limitations */
    overflow: hidden;
}

/* Enforce Typography on ContentEditable */
[contenteditable] {
    font-family: var(--font-stack) !important;
    font-size: var(--font-base) !important;
    color: var(--c-paper-text) !important;
}

/* [DIN.LOGIC.PHYSICS.OF] Multi-Page State (Visual Only now) */
#sheet.is-multipage {
    /* border-bottom: 5px solid rgba(255, 0, 0, 0.2); Warning Indicator */
}

/* Fade marks if multi-page to avoid confusion */
#sheet.is-multipage .mark {
    opacity: 0.3;
}

/* --- Layout Marks [DIN.UI.PAPER.FOLD] --- */
.mark {
    position: absolute;
    left: 0;
    width: 5mm;
    border-top: 0.5pt solid #000;
    pointer-events: none;
    transition: opacity 0.3s, top 0.3s;
}

.mark-fold-1 {
    top: var(--pos-fold-1);
}

.mark-fold-2 {
    top: var(--pos-fold-2);
}

.mark-loch {
    top: 148.5mm;
    width: 7mm;
}

/* [DIN.UI.PAGE.BREAK] Soft Limit Indicator */
#page-break-marker {
    position: absolute;
    top: 297mm;
    left: 0;
    width: 100%;
    height: 1px;
    border-top: 2px dashed red;
    pointer-events: none;
    display: none;
    opacity: 0.6;
    z-index: 500;
}

#page-break-marker::after {
    content: attr(title);
    position: absolute;
    right: 5px;
    top: -20px;
    color: red;
    font-size: 10px;
    font-family: sans-serif;
}

#page-break-marker.active {
    display: block;
}

/* --- V9: STRUCTURED SENDER BLOCK (Visual Revert) --- */
/* It behaves like a single block of text but contains structured V9 data */
#sender-wrapper {
    position: absolute;
    top: 20mm;
    right: var(--margin-r);
    width: 75mm;
    height: 30mm;
    /* Strict Height Limit */
    text-align: right;

    /* [TASK 2] Unified Typography */
    font-size: 10pt !important;
    line-height: 1.2;
    color: #000;

    display: flex;
    flex-direction: column;
    align-items: flex-end;
    /* Right align children */
    gap: 0;
    overflow: hidden;
}

#sender-wrapper .single-line-field {
    min-height: 1.2em;
    width: 100%;
}

/* --- V9: ADDRESS ZONE --- */
#address-zone {
    /* [DIN.UI.ADDR.ZONE] 85x45mm Zone defined in Section 3 */
    position: absolute;
    top: var(--pos-addr-top);
    left: 20mm;
    width: 85mm;
    height: 45mm;
}

/* [DIN.UI.FLOOD.PROTECT] Strict truncation for Sender Address Small */
#sender-address-small {
    height: auto;
    min-height: 5mm;
    font-size: 8pt !important;
    /* [TASK 1] Typography Update */
    text-decoration: underline !important;
    /* [FIX] Improved Typography for Aptos descenders */
    line-height: 1.35;
    padding-bottom: 1px;
    margin-bottom: 0;
    display: block;

    /* [TASK 1] Flood Protection Rules */
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100%;
}

/* --- V9: STANDALONE DATE FIELD (No Meta Block) --- */
#info-date {
    grid-column: 2;
    grid-row: 7;
    white-space: nowrap;
    /* [ITER_37] Date Sizing Polish */
    min-width: 120px;
    /* e.g. 14.01.2026 */
    max-width: 180px;
    /* e.g. 14. Januar 2026 */
    width: fit-content;
    overflow: hidden;
    position: absolute;
    top: calc(var(--pos-ref-top) + 32mm);
    /* Matches old Infoblock start */
    right: var(--margin-r);
    width: 75mm;
    /* Block width */
    text-align: right;
    /* Right align content */
    font-size: 11pt !important;
}

/* [TASK 4] Special Notes: Allow Multi-Line */
/* [TASK 4] Special Notes: Strict Single Line (User Request) */
#special-notes {
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    max-width: 100%;
    overflow: hidden !important;
    line-height: 1.35;
    font-weight: normal !important;
    /* [USER] No Bold */
    min-height: 5mm;
    /* Visual Stability */
}

/* --- Floating Content Container --- */
#text-container {
    padding-top: calc(var(--pos-addr-top) + 45mm + 25mm);
    display: flex;
    flex-direction: column;
}

/* [DIN.UI.FIELD.SINGLE] VISUAL DAM */
.single-line-field {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: block;
    max-height: 1.5em;
    /* Fallback safety */
    box-sizing: border-box;
    /* padding: 0 !important; <-- HANDLED BY APP-UI.CSS */
}

/* [DIN.UI.EDIT.STABL] Visual Stability for Edit Fields */
/* [DIN.UI.EDIT.STABL] Visual Stability for Edit Fields */
[contenteditable] {
    /* border: none !important;  <-- HANDLED BY APP-UI.CSS */
    /* [TASK 3] Cursor & Box Fix */
    min-height: 1.5em;
    /* Ensure cursor is visible even when empty */
    cursor: text;
    display: block;
    box-sizing: border-box;
}

/* [DIN.UI.PLACEHOLDER] ROBUST GHOST TEXT */
[contenteditable]:empty::before,
[contenteditable][data-is-empty="true"]::before {
    content: attr(data-placeholder);
    color: #bbb !important;
    pointer-events: none;
    display: block;
    font-style: italic;
    font-weight: normal;
}

/* [DIN.UX.HYGIENE] SUBJECT LINE CAGE */
#subject-line {
    font-weight: bold !important;
    font-size: var(--font-base) !important;
    margin: 0 0 2em 0;

    /* SAFETY: Max 2 Lines */
    max-height: 2.8em;
    overflow: hidden;
    display: block;
}

#letter-salutation {
    margin-bottom: 1em;
}

#letter-body {
    min-height: 100px;
    margin-bottom: 1em;
}

#letter-greeting {
    margin-bottom: 3em;
}

/* --- V9: FOOTER --- */
#page-footer {
    position: absolute;
    bottom: 15mm;
    left: var(--margin-l);
    right: var(--margin-r);
    height: 25mm;
    border-top: 0.5pt solid #000;
    padding-top: 2mm;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 5mm;
    font-size: 7pt !important;
}

.footer-col {
    white-space: pre-wrap;
    overflow: hidden;
}

/* Signature specific fix */
#signature-name {
    font-style: normal !important;
    margin-top: 0 !important;
}

/* --- PRINT RULES [DIN.FEAT.PDF.NATIVE] --- */
@media print {
    @page {
        size: A4;
        margin: 0mm;
    }

    html,
    body {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: white !important;
        display: block !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        overflow: hidden !important;
    }

    #app-viewport,
    #brief-container {
        margin: 0 !important;
        padding: 0 !important;
        height: auto !important;
        width: 210mm !important;
        box-shadow: none !important;
        border: none !important;
        overflow: hidden !important;
        display: block !important;
        transform: none !important;
        background: white !important;
    }

    #sheet {
        margin: 0 !important;
        padding-left: var(--margin-l) !important;
        padding-right: var(--margin-r) !important;
        width: 210mm !important;
        height: 297mm !important;
        min-height: 297mm !important;
        box-shadow: none !important;
        border: none !important;
    }

    #sheet.is-multipage {
        border-bottom: none !important;
    }

    /* Hide UI Elements */
    .no-print,
    #steuerelemente,
    #mobile-blocker,
    dialog,
    #debug-console,
    #ui-toast-container,
    .ui-toast,
    .status-wrapper,
    .status-bar,
    #autocomplete-results {
        display: none !important;
    }

    /* GHOST TEXT FIX: Hide placeholders on print */
    [data-placeholder]:empty::before,
    [contenteditable][data-is-empty="true"]::before {
        display: none !important;
    }

    /* Content Cleaning */
    [contenteditable] {
        border: none !important;
        background: transparent !important;
        outline: none !important;
        box-shadow: none !important;
        padding: 0 !important;
    }

    ::-webkit-scrollbar {
        display: none !important;
    }
}
</style>
    <style>
/* css/app-ui.css */
/*
 * > File: css/app-ui.css
 * > Role: UI Layout Engine (App Shell)
 * > Spec: [DIN.UI.SHELL.SPLIT]
 * > Dep:  css/theme.css
 * -----------------------------------------------------------------------------
 * Implements strict 2-column layout (Sidebar 300px + Workspace).
 * VISUAL ROLLBACK: "Invisible Interface" philosophy.
 */

/* --- 1. GLOBAL RESET & BASE --- */
html,
body {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    /* [DIN.UI.SHELL.LOCK] Body never scrolls */
    background: var(--c-bg-gradient); /* Modern Gradient */
    background-color: var(--c-bg); /* Fallback */
    box-sizing: border-box;
    font-family: var(--font-ui);
    color: var(--c-text-primary);
}

*,
*::before,
*::after {
    box-sizing: inherit;
}

/* Utilities */
.hidden {
    display: none !important;
}

/* --- 2. VISUAL INTEGRITY (THE INVISIBLE INTERFACE) --- */

/* [KILL THE BLUE] Reset Browser Defaults */
*:focus {
    outline: none !important;
}

/* [DIN GUIDES] Zero-Pixel Shift Logic using Outline */
/* [DIN GUIDES v3] Pure Visual Overlay (No Layout Shift) */

/* BASE STATE: Invisible 1px Border to reserve space */
[contenteditable],
.single-line-field {
    border: 1px dashed transparent !important;
    border-radius: 0.25rem;
    outline: none !important;
    transition: border-color 0.2s, background-color 0.1s;
    cursor: text;
    /* Ensure visible formatting when empty */
    min-width: 2rem;
    min-height: 1.5rem;
    /* [CRITICAL] STATIC PADDING - DO NOT CHANGE ON TOGGLE */
    padding: 1px !important;

    /* [DIN.LOGIC.FLOOD] Force single line to enable scrollWidth detection */
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: clip !important; /* [USER-REQ] NEVER show (...) ellipsis */
}

/* 1. INTERACTIVE STATE (Hover/Focus) - ALWAYS VISIBLE */
[contenteditable]:hover:not(:focus),
.single-line-field:hover:not(:focus) {
    border-color: #666 !important;
    /* Dark Gray */
    background-color: rgba(0, 0, 0, 0.03);
    z-index: 100;
}

[contenteditable]:focus,
.single-line-field:focus {
    border-color: #666 !important;
    /* Dark Gray */
    background-color: rgba(0, 0, 0, 0.03);
    z-index: 100;
}

/* 2. GLOBAL GUIDE STATE (Guides ON) */

/* WRAPPERS: Use OUTLINE to avoid Layout Shift */
/* [NEW] Expanded Grouping: Address Zone takes the main frame */
body.show-guides #sender-wrapper,
body.show-guides #address-zone {
    outline: 1px dashed rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    /* NO padding changes here! */
}

/* Ensure .recipient-wrapper inside address-zone is transparent (it is now just a container) */
body.show-guides .recipient-wrapper {
    outline: none !important;
    border: none !important;
    padding: 0 !important;
}

/* INNER FIELDS: Border Color Switch Only */
/* [FIX] ULTRA-CLEAN LOOK: Square inside, Rounded outside (Card Style) */
/* Reduced opacity to 0.06 to fix "zu fett" perception */
/* INNER FIELDS: Border Color Switch Only */
/* [FIX] ULTRA-CLEAN LOOK: Square inside, Rounded outside (Card Style) */
/* Reduced opacity to 0.06 to fix "zu fett" perception */

/* 1. Generic Address Zone Logic (Kept as user likes it) */
body.show-guides #address-zone [contenteditable] {
    display: block !important;
    border-top-color: transparent !important;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: rgba(0, 0, 0, 0.06) !important;
    border-radius: 0 !important;
}

/* 2. SPECIFIC Sender Zone Logic (Hardened Layout) */
/* 2. SPECIFIC Sender Zone Logic (Cleaned Up) */
body.show-guides #sender-wrapper > .single-line-field {
    display: block !important;
    border: none !important;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.06) !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 1px !important; /* Match base padding */
}

/* Remove bottom border from last element to close the box cleanly */
body.show-guides #sender-wrapper > .single-line-field:last-child {
    border-bottom: none !important;
}

/* [TASK] Hide Empty Company Fields */
#sender-company:empty,
#signature-company:empty {
    display: none !important;
}

/* Restore Radius & Remove Bottom Borders (Explicit Targeting) */

/* Address Zone: First/Last logic */
body.show-guides #address-zone [contenteditable]:first-child {
    border-top-left-radius: 4px !important;
    border-top-right-radius: 4px !important;
}
body.show-guides .recipient-city-row [contenteditable] {
    border-bottom: none !important; /* Clean remove */
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
}

/* Sender Zone: EXPLICIT IDs to prevent 'Kraut und Rüben' */
/* Top Element */
body.show-guides #sender-company {
    border-top-left-radius: 4px !important;
    border-top-right-radius: 4px !important;
}
/* Bottom Element (Email) - Remove border AND add radius */
body.show-guides #sender-email {
    border-bottom: none !important; /* Clean remove */
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
}

/* Specific fix for Address Zone Container padding/radius sync */
body.show-guides #address-zone {
    /* Ensure the outline hugs the content tightly */
    border-radius: 4px;
}

/* STANDALONE FIELDS: Border Color Switch Only */
body.show-guides #info-date,
body.show-guides #subject-line,
body.show-guides #letter-salutation,
body.show-guides #letter-body,
body.show-guides #letter-greeting,
body.show-guides #signature-name {
    border-color: rgba(0, 0, 0, 0.2) !important;
}

/* 3. ACTIVE OVERRIDE (Guides ON + Focus) */
body.show-guides [contenteditable]:focus,
body.show-guides .single-line-field:focus {
    border: 1px dashed #333 !important;
    border-radius: 0.25rem;
    z-index: 101;
    /* Ensure offset matches base state */
}

/* --- PRINT SAFETY [CRITICAL] --- */
@media print {

    [contenteditable],
    .single-line-field,
    #sender-wrapper,
    .recipient-wrapper,
    #address-zone {
        border: none !important;
        outline: none !important;
        background: transparent !important;
        box-shadow: none !important;
        /* Padding remains static or reset if needed, but for print we clean it up */
        padding: 0 !important;
    }

    #sender-wrapper,
    .recipient-wrapper,
    #address-zone {
        padding: 0 !important;
    }
}

/* --- INSPECTOR MODE [DIN-FEAT-DEBUG] --- */
body.inspector-active {
    cursor: help !important;
}

body.inspector-active #sheet,
body.inspector-active [contenteditable] {
    cursor: help !important;
}

body.inspector-active .inspector-highlight {
    outline: 1px dashed rgba(0, 0, 0, 0.3) !important;
    background-color: rgba(0, 0, 0, 0.03) !important;
}

/* --- RECIPIENT BLOCK STRUCTURE --- */
.recipient-wrapper {
    display: flex;
    flex-direction: column;
}

.recipient-city-row {
    display: flex;
    gap: 8px;
    width: 100%;
    position: relative;
}

#recipient-zip {
    width: 80px;
}

#recipient-city {
    flex: 1;
}

/* --- 3. MOBILE BLOCKER --- */
#mobile-blocker {
    display: none;
    position: fixed;
    inset: 0;
    background: var(--c-sidebar-bg);
    z-index: 9999;
    align-items: center;
    justify-content: center;
    color: var(--c-sidebar-text);
    text-align: center;
    padding: 20px;
    backdrop-filter: blur(10px);
}

#mobile-blocker .msg-box {
    background: rgba(255, 255, 255, 0.1);
    padding: 40px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 400px;
}

@media (max-width: 1023px) {
    #mobile-blocker {
        display: flex !important;
    }
}

/* --- 4. SIDEBAR (Fixed Left) --- */
#steuerelemente {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    min-width: 300px; /* [FIX] Strict Lock */
    max-width: 300px; /* [FIX] Strict Lock */
    background: var(--c-sidebar-bg);
    color: var(--c-sidebar-text);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05); /* Softer Shadow */
    border-right: 1px solid var(--c-sidebar-border);
    backdrop-filter: blur(10px); /* Glass Effect */
}

.sidebar-top-fixed {
    flex-shrink: 0;
    border-bottom: 1px solid var(--c-sidebar-border);
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--c-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.brand .icon {
    width: 20px;
    height: 20px;
    fill: var(--c-primary);
}

.brand .v-tag {
    font-size: 0.6rem;
    opacity: 0.8;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.05); /* Darker tag for light theme */
    border-radius: 4px;
    color: var(--c-text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.brand .v-tag:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

/* Status Bar (Bottom Right Overlay) */
.status-wrapper {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2000;
    pointer-events: none;
    display: flex;
    justify-content: flex-end;
}

.status-bar {
    font-size: 0.75rem;
    padding: 6px 16px;
    background: #ffffff;
    color: #333;
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--c-primary);
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    font-weight: 600;
    opacity: 0.9;
    transition: all 0.3s ease;
}

#sidebar-scroll-area {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.sidebar-section {
    padding: 10px 20px;
    flex-shrink: 0;
}

.sidebar-separator {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 5px 20px;
    flex-shrink: 0;
}

.sidebar-control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

/* [SIDEBAR] Specific Button Overrides */
#steuerelemente .btn {
    background: var(--c-sidebar-btn-bg);
    color: var(--c-sidebar-text);
    border: 1px solid rgba(255, 255, 255, 0.05);
    text-align: left;
    justify-content: flex-start;
}
#steuerelemente .btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}
#steuerelemente .btn.primary {
    background: var(--c-primary);
    color: white;
    justify-content: center;
}

.api-key-box {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    padding: 10px;
    border-radius: 6px;
    animation: fadeIn 0.3s ease;
}

.key-set {
    display: none !important;
}

.help-link {
    float: right;
    text-decoration: none;
    font-size: 0.7rem;
    opacity: 0.8;
    color: #fff !important;
}

.sidebar-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
}

.sidebar-select,
.sidebar-input {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    width: 100%;
    outline: none;
    transition: all 0.2s;
}

.sidebar-select:focus,
.sidebar-input:focus {
    border-color: var(--c-primary);
    background: rgba(0, 0, 0, 0.3);
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
        border-color: var(--c-danger);
    }

    75% {
        transform: translateX(5px);
        border-color: var(--c-danger);
    }
}

.invalid-shake {
    animation: shake 0.3s ease-in-out;
}

.sidebar-select option {
    background: #2c3e50;
    color: white;
}

.sidebar-radio-group {
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.radio-option {
    flex: 1;
    position: relative;
    cursor: pointer;
    text-align: center;
    display: flex; /* [FIX] Stretches child span to full height */
}

.radio-option input {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
}

.radio-option span {
    display: block;
    width: 100%; /* [FIX] Check full width */
    height: 100%; /* [FIX] Check full height (if parent is flex) */
    display: flex; /* [FIX] center content */
    align-items: center;
    justify-content: center;
    padding: 6px 4px;
    font-size: 0.75rem;
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s;
    user-select: none;
}

.radio-option input:checked+span {
    background: var(--c-primary);
    color: white;
    font-weight: 600;
}

/* [NEW] Multiline support for Radio Labels (e.g. Date) */
/* [NEW] Multiline support for Radio Labels (e.g. Date) */
.radio-label-multiline {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1.0 !important;
    padding: 6px 2px !important;
    gap: 0 !important; /* [FIX] No Gap */
}

.radio-label-multiline small {
    font-size: 0.85em;
    opacity: 0.85;
    margin: 0;         /* [FIX] Zero Margin */
    font-weight: 400;
}

/* [UX] Compact Date Labels to prevent wrapping */
#lbl-date-de,
#lbl-date-long,
#lbl-date-iso {
    white-space: nowrap;
    font-size: 0.75rem; /* Slightly reduced */
    letter-spacing: -0.02em;
    display: inline-block; /* Allow transform if needed */
}

.actions-footer {
    flex-shrink: 0;
    padding: 20px;
    background: var(--c-sidebar-bg);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: auto;
}

.footer-buttons-top {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
}

.btn.danger:hover {
    background: var(--c-danger) !important;
    color: white !important;
}

.profile-btn {
    width: 100%;
    margin-bottom: 5px;
}

/* --- 5. WORKSPACE --- */
#app-viewport {
    position: absolute;
    left: 300px;
    right: 0;
    top: 0;
    bottom: 0;
    overflow-y: auto;
    scrollbar-gutter: stable; /* [FIX] Prevents Horizontal Shift if scrollbar appears/disappears */
    padding: 20px;
    display: flex;
    /* [FIX] Use align-items: flex-start + margin: auto on child to center without jumping */
    /* This prevents the "Flummi" effect where center alignment fights with scroll height on load */
    align-items: flex-start;
    justify-content: center;
    background-color: var(--c-bg);
    background-image: radial-gradient(#d1d8e0 1.2px, transparent 1.2px);
    background-size: 32px 32px;
}

#brief-container {
    position: relative;
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3);
    background: white;
    /* transition: transform 0.2s ease-out; */ /* [FIX] Disabled to prevent 'Flummi' jump on load */
    flex-shrink: 0;
    /* [FIX] Margin Auto centers it vertically/horizontally in a flex-start container */
    margin: auto;
}

/* --- 6. COMPONENTS --- */

/* [DIN.UI.EDITOR.TOOLS] Floating Toolbar */
.editor-toolbar {
    position: fixed;
    top: 50%;
    right: 320px;
    /* Sidebar (300) + 20px padding */
    transform: translateY(-50%);
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 2000;
    transition: opacity 0.2s, transform 0.2s;
    opacity: 0;
    pointer-events: none;
}

.editor-toolbar.visible {
    opacity: 1;
    pointer-events: all;
    transform: translateY(-50%) translateX(0);
}

.editor-toolbar button {
    background: white;
    border: 1px solid #eee;
    border-radius: 4px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #333;
}

.editor-toolbar button:hover {
    background: #f5f5f5;
    border-color: #bbb;
    color: #000;
}

.btn {
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    text-decoration: none;
    user-select: none;
}

.btn:active {
    transform: scale(0.97);
}

.btn.primary.big-btn {
    background: var(--c-primary);
    color: white;
    padding: 14px;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    width: 100%;
}

.btn.primary.big-btn:hover {
    background: var(--c-primary-hover);
    transform: translateY(-1px);
}

.btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
}

.btn.secondary.small {
    padding: 8px;
    font-size: 0.75rem;
}

.ui-toast {
    position: fixed;
    top: 24px;
    right: 40px;
    background: #2c3e50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    pointer-events: none;
}

.ui-toast.show {
    opacity: 1;
    transform: translateY(0);
}

.ui-toast.toast-success {
    border-left: 4px solid var(--c-success);
}

.ui-toast.toast-error {
    border-left: 4px solid var(--c-danger);
}

#overflow-toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--c-danger);
    color: white;
    padding: 12px 24px;
    border-radius: 50px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    z-index: 9999;
    font-weight: 700;
    opacity: 0;
    transition: all 0.3s;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
}

#overflow-toast.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

/* [FIX] Info Toast Style (Blue) */
.ui-toast.toast-info {
    border-left: 4px solid #17a2b8;
}

/* [TASK] Action Toast (with Button) */
.ui-toast-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    width: 320px;
    pointer-events: auto !important; /* [FIX] Enable clicks */
}

/* [FIX] Z-Index must be higher than Modal (usually 1000-2000) */
.ui-toast {
    z-index: 2147483647 !important;
}

/* [TASK] Inline Input Feedback (Now Floats Right) */
.input-feedback-msg {
    position: absolute;
    /* Position to the right of the input */
    right: 10px;
    top: 50%;
    transform: translateY(-50%) translateX(10px); /* Start slightly off */

    background: var(--c-danger);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    pointer-events: none;
    opacity: 0;
    transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28); /* Bouncy pop */
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.input-feedback-msg.show {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
}

.input-feedback-msg.warning {
    background: var(--c-warning);
    color: #333;
}

/* [NEW] Success Variant */
.input-feedback-msg.success {
    background: var(--c-success);
    color: white;
}

/* --- [TASK] IBAN Ghost Overlay --- */
.iban-wrapper {
    position: relative;
    width: 100%;
    /* Use standard Monospace fallback stack */
    font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
    font-size: 16px; /* Optimized reading size */
}

.iban-text {
    font-family: inherit;
    font-size: inherit;
    letter-spacing: 2px; /* Breathing room for numbers */
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1); /* Default border for input */
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    line-height: 1.5;
}

/* Layer 1: The Ghost (Background) */
#iban-ghost {
    position: absolute;
    top: 0;
    left: 0;
    color: rgba(255, 255, 255, 0.15); /* Subtle Ghost Gray */
    z-index: 1;
    pointer-events: none;
    white-space: pre; /* Protect spaces */
    overflow: hidden;
    height: 100%; /* Match input height */
    /* Ensure border matches input so padding aligns perfect */
    border-color: transparent;
}

/* Layer 2: The Input (Foreground) */
#profile-iban {
    position: relative;
    z-index: 2;
    background-color: transparent !important; /* See-through */
    color: white;
    /* Remove default outline/border from previous generic styles if needed */
}

#profile-iban:focus {
    border-color: var(--c-primary) !important;
    background-color: rgba(0, 0, 0, 0.2) !important; /* Slight tint on focus, keeping transparency */
}

/* Helper */
.invisible {
    opacity: 0;
}

/* --- 7. MODALS & DIALOGS [MODERN REFERENCE THEME] --- */

:root {
  /* Modal Specific Variables (Scoped to avoid clashes) */
  --modal-bg: #ffffff;
  --modal-surface-secondary: #f1f3f5;
  --modal-border: #dee2e6;
  --modal-border-focus: #4a90e2;
  --modal-text: #212529;
  --modal-text-secondary: #495057;
  --modal-text-muted: #6c757d;
  --modal-primary: #4a90e2;
  --modal-primary-hover: #357abd;
  --modal-danger: #dc3545;
  --modal-danger-bg: rgba(220, 53, 69, 0.1);
  --modal-radius-lg: 1rem;
  --modal-radius-md: 0.5rem;
  --modal-radius-sm: 0.375rem;
  --modal-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --modal-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --modal-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

dialog {
    border: none;
    padding: 0;
    background: var(--modal-bg);
    box-shadow: var(--modal-shadow-xl);
    border-radius: var(--modal-radius-lg);
    position: relative;
    overflow: visible; /* Changed to allow floating elements if needed */
    max-width: 600px;
    width: 90vw;
    color: var(--modal-text);
    font-family: var(--modal-font-sans);
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    transition: opacity 0.3s;
    animation: fadeIn var(--modal-transition);
}

dialog[open] {
    animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Header */
.dialog-header {
    /* Centered Header Layout */
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    display: flex;
    flex-direction: column; /* Stack Title and Subtitle */
    align-items: center; /* Center horizontally */
    justify-content: center;
    border-bottom: 1px solid var(--modal-border);
    position: relative; /* Context for Close Button */
    text-align: center;
}

.dialog-header h3, h2#profile-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--modal-text);
}

.subtitle {
    font-size: 0.875rem;
    color: var(--modal-text-secondary);
    margin: 0;
    padding-top: 0.5rem;
    line-height: 1.5;
}

/* Close Button (Absolute Top Right) */
.dialog-close, .dialog-close-x {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;

    background: #e9ecef;
    border: none;
    color: var(--modal-text-secondary);
    width: 2rem;
    height: 2rem;
    font-size: 1.5rem;
    border-radius: var(--modal-radius-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--modal-transition);
    line-height: 1;
    z-index: 10;
}

.capitalize-first {
    text-transform: capitalize;
}

.dialog-close:hover, .dialog-close-x:hover {
    background: #dee2e6;
    color: var(--modal-text);
}

/* Body */
.dialog-body, .dialog-content-no-scroll {
    padding: 2rem; /* spacing-2xl */
    max-height: 70vh;
    overflow-y: auto;
}

/* Fieldset */
fieldset {
    border: 1px solid var(--modal-border);
    border-radius: var(--modal-radius-md);
    padding: 1rem;
    margin: 0;
    background: var(--modal-surface-secondary);
}

legend {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--modal-text);
    padding: 0 0.5rem;
}

/* Form Groups */
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--modal-text);
    margin-bottom: 0.5rem;
}

.form-group small {
    font-weight: 400;
    color: var(--modal-text-muted);
}

/* Inputs */
.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
    border: 1px solid var(--modal-border);
    border-radius: var(--modal-radius-sm);
    background: var(--modal-bg);
    color: var(--modal-text);
    transition: all var(--modal-transition);
    outline: none;
    font-family: var(--modal-font-sans);
}

.form-group input:hover {
    border-color: var(--modal-text-muted);
}

.form-group input:focus {
    border-color: var(--modal-border-focus);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.form-group input::placeholder {
    color: var(--modal-text-muted);
}

/* Footer / Actions */
.dialog-footer, .dialog-actions {
    padding: 1rem 2rem;
    background: var(--modal-surface-secondary);
    border-top: 1px solid var(--modal-border);
    border-bottom-left-radius: var(--modal-radius-lg);
    border-bottom-right-radius: var(--modal-radius-lg);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

/* Buttons */
button.btn, .btn {
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      font-weight: 500;
      border-radius: var(--modal-radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all var(--modal-transition);
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--modal-font-sans);
}

/* Existing ID buttons mapping */
#btn-profile-done, #btn-confirm-ok {
    background: var(--modal-primary);
    color: white;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
}

#btn-profile-done:hover, #btn-confirm-ok:hover {
    background: var(--modal-primary-hover);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); /* shadow-md */
}

#btn-profile-cancel, #btn-confirm-cancel, .btn.secondary {
    background: #e9ecef; /* secondary */
    color: var(--modal-text);
    border: 1px solid var(--modal-border);
}

#btn-profile-cancel:hover, #btn-confirm-cancel:hover {
    background: #dee2e6;
}

/* IBAN Specifics for Light Theme */
.iban-wrapper {
    position: relative;
    width: 100%;
    font-family: 'Roboto Mono', 'Courier New', monospace; /* Keep mono */
}

#iban-ghost {
    color: var(--modal-text-muted); /* Darker gray for light theme */
    opacity: 0.6;
}

#profile-iban {
    background-color: transparent !important;
    color: var(--modal-text);
    z-index: 2;
}

#profile-iban:focus {
    background-color: transparent !important; /* Keep transparent but handled by parent focus ring usually? No, input handles ring */
}

/* Split Columns */
.form-row, .row {
    display: flex;
    gap: 1rem;
}
.form-row .form-group {
    flex: 1;
}

@media (max-width: 600px) {
    .form-row, .row {
        flex-direction: column;
        gap: 0;
    }
}

</style>
    <style>
/* css/isomorphic-tags.css */
/**
 * > File: css/isomorphic-tags.css
 * > Role: Custom Element Definitions (Isomorphism)
 * > Spec: [DIN.ISO.TAGS]
 */
/* [DIN.ISO.TAGS] Support for Custom Elements */
din-sender-company,
din-sender-name,
din-sender-street,
din-sender-zip-city,
din-sender-phone,
din-sender-email,
din-sender-address-small,
din-special-notes,
din-recipient-company,
din-recipient-name,
din-recipient-street,
din-recipient-zip,
din-recipient-city,
din-info-date,
din-subject,
din-salutation,
din-body,
din-greeting,
din-signature-name {
    display: block;
}

/* Specific resets for inline behavior if needed */
.recipient-city-row din-recipient-zip,
.recipient-city-row din-recipient-city {
    display: inline-block;
}

</style>
  </head>

  <body class="layout-form-b" data-spec="DIN.UI.SHELL.BIND">
    <!-- [DIN.PERF.FOUC] Critical State Restoration (Anti-Flicker) -->
    <script>
      (function() {
        try {
          const raw = localStorage.getItem('antigravity_din_state');
          if (raw) {
            const state = JSON.parse(raw);
            const cfg = state.config;
            if (cfg) {
              // 1. Layout
              if (cfg.layout === 'form-a') {
                document.body.classList.remove('layout-form-b');
                document.body.classList.add('layout-form-a');
              } else {
                document.body.classList.remove('layout-form-a');
                document.body.classList.add('layout-form-b');
              }

              // 2. Font (Aptos vs Serif)
              // We need to set --font-stack on :root (document.documentElement)
              if (cfg.font === 'serif') {
                 document.documentElement.style.setProperty('--font-stack', "'Times New Roman', 'Garamond', serif");
              } else {
                 document.documentElement.style.setProperty('--font-stack', "'Aptos', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif");
              }
            }
          }
        } catch(e) { console.warn('FOUC Script Error', e); }
      })();
    </script>
    <!-- [DIN.SYS.STABL.LOCK] Mobile Blocker Overlay -->
    <div id="mobile-blocker" aria-hidden="true">
      <div class="msg-box">
        <div class="icon">💻</div>
        <h1>Desktop Only</h1>
        <p>Diese Anwendung ist für Bildschirme ab 1024px optimiert.</p>
        <p class="sub">
          Bitte nutzen Sie einen Desktop-Browser für die A4-Bearbeitung.
        </p>
      </div>
    </div>

    <!-- SIDEBAR [DIN.UI.SHELL.SPLIT] -->
    <nav
      id="steuerelemente"
      class="no-print"
      role="navigation"
      aria-label="Hauptmenü"
    >
      <!-- Zone 1: Brand (Compact) -->
      <div class="sidebar-top-fixed">
        <div class="brand">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M16,11V13H8V11H16M16,15V17H8V15H16M13,19V17H14V19H13M8,19V17H11V19H8Z"
            />
          </svg>
          DIN 5008
          <span class="v-tag" title="5x Klick für Expert Mode">V9</span>
        </div>
      </div>

      <!-- Zone 2: Scrollable Config [DIN.FEAT.DIRECT.SETTINGS] -->
      <div id="sidebar-scroll-area">
        <section class="sidebar-section">
          <div class="sidebar-control-group">
            <label class="sidebar-label">DIN-Variante</label>
            <div class="sidebar-radio-group" id="setting-layout-group">
              <label class="radio-option">
                <input type="radio" name="layout" id="setting-layout-form-a" value="form-a" checked />
                <span>Form A (32mm)</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="layout" id="setting-layout-form-b" value="form-b" />
                <span>Form B (50mm)</span>
              </label>
            </div>
          </div>

          <div class="sidebar-control-group">
            <label class="sidebar-label">Adress-Dienst</label>
            <div class="sidebar-radio-group" id="setting-provider-group">
              <label class="radio-option">
                <input type="radio" name="provider" id="setting-provider-photon" value="photon" checked />
                <span class="radio-label-multiline">
                    Photon
                    <small>OpenStreet</small>
                </span>
              </label>
              <label class="radio-option">
                <input type="radio" name="provider" id="setting-provider-geoapify" value="geoapify" />
                <span id="lbl-geoapify" class="radio-label-multiline">
                    Geoapify
                    <small>API</small>
                </span>
              </label>
            </div>
          </div>

          <!-- Context-Aware API Key Input -->
          <div
            id="group-api-key"
            class="sidebar-control-group api-key-box hidden"
            style="display: none"
          >
            <label
              for="setting-apikey"
              class="sidebar-label"
              style="color: #f1c40f"
            >
              🔑 Geoapify API Key
              <a
                href="https://www.geoapify.com/"
                target="_blank"
                title="Hier kostenlos holen"
                class="help-link"
                >ℹ️ Holen</a
              >
            </label>
            <input
              type="password"
              id="setting-apikey"
              class="sidebar-input"
              placeholder="Hier Key einfügen..."
              aria-describedby="api-help"
            />
            <div
              id="api-help"
              style="
                font-size: 0.65rem;
                color: rgba(255, 255, 255, 0.5);
                margin-top: 4px;
                line-height: 1.2;
              "
            >
              Kostenlos. Wird nur lokal im Browser gespeichert.
            </div>
          </div>

          <div class="sidebar-control-group">
            <label class="sidebar-label">Anrede-Typ</label>
            <div class="sidebar-radio-group" id="setting-recipient-type-group">
              <label class="radio-option">
                <input type="radio" name="recipientType" id="setting-recipient-type-none" value="none" checked />
                <span>Keine</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="recipientType" id="setting-recipient-type-female" value="female" />
                <span>Frau</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="recipientType" id="setting-recipient-type-male" value="male" />
                <span>Herr</span>
              </label>
            </div>
          </div>

          <div class="sidebar-control-group">
            <label class="sidebar-label">Anrede-Stil</label>
            <div class="sidebar-radio-group" id="setting-formality-group">
              <label class="radio-option">
                <input type="radio" name="formality" id="setting-formality-formal" value="formal" checked />
                <span>Formal</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="formality" id="setting-formality-polite" value="polite" />
                <span>Modern</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="formality" id="setting-formality-casual" value="casual" />
                <span>Locker</span>
              </label>
            </div>
          </div>

          <div class="sidebar-control-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label class="sidebar-label" style="margin-bottom:0;">Datumsformat</label>
              <button
                id="sidebar-btn-date"
                class="btn secondary small"
                title="Datum wählen"
                aria-label="Kalender öffnen"
                style="padding: 2px 8px;"
              >
                📅
              </button>
            </div>

            <!-- Hidden Picker -->
            <input
                type="date"
                id="native-date-picker"
                tabindex="-1"
                aria-hidden="true"
                style="
                  position: absolute;
                  right: 0;
                  top: 0;
                  width: 0;
                  height: 0;
                  border: 0;
                  padding: 0;
                  opacity: 0;
                  z-index: -1;
                "
              />

            <div class="sidebar-radio-group" id="setting-date-format-group">
              <label class="radio-option">
                <input type="radio" name="dateFormat" id="setting-date-format-de" value="de" checked />
                <span class="radio-label-multiline">
                    <span id="lbl-date-de">16.01.2026</span>
                    <small>DIN</small>
                </span>
              </label>
              <label class="radio-option">
                <input type="radio" name="dateFormat" id="setting-date-format-long" value="long" />
                <span class="radio-label-multiline">
                    <span id="lbl-date-long">16. Januar</span>
                    <small>Text</small>
                </span>
              </label>
              <label class="radio-option">
                <input type="radio" name="dateFormat" id="setting-date-format-iso" value="iso" />
                <span class="radio-label-multiline">
                    <span id="lbl-date-iso">2026-01-16</span>
                    <small>ISO</small>
                </span>
              </label>
            </div>
          </div>

          <!-- [TASK 3] Visual Guides Toggle -->
          <div class="sidebar-control-group" style="margin-top: 10px">
            <label
              class="sidebar-label"
              style="
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
              "
            >
              <input type="checkbox" id="toggle-guides" />
              <span>Hilfslinien anzeigen</span>
            </label>
          </div>
        </section>
      </div>

      <!-- Zone 4: Action Footer -->
      <div class="actions-footer">
        <div class="footer-buttons-top">
          <button
            id="btn-export"
            class="btn secondary small"
            title="Backup speichern"
          >
            <span>💾</span> Export
          </button>
          <button
            id="btn-import"
            class="btn secondary small"
            title="Backup laden"
          >
            <span>📂</span> Import
          </button>
          <button
            id="btn-reset"
            class="btn secondary small danger"
            title="Alles löschen"
          >
            <span>🗑️</span> Reset
          </button>
        </div>

        <div class="sidebar-separator"></div>

        <!-- Contact Save Removed per User Request (Iter 37) -->

        <button id="btn-profile" class="btn secondary profile-btn">
          <span>👤</span> Absender-Profil
        </button>
        <button id="btn-print" class="btn primary big-btn">
          <span>🖨️</span> Drucken / PDF
        </button>

        <!-- [TASK 1] Reset API Key Link -->
        <div style="text-align: center; margin-top: 5px">
          <a
            href="#"
            id="btn-reset-key"
            style="
              color: rgba(255, 255, 255, 0.3);
              font-size: 0.7rem;
              text-decoration: none;
            "
            >API Key löschen</a
          >
        </div>
      </div>

      <!-- Hidden inputs -->
      <input type="file" id="file-import" hidden aria-hidden="true" />
    </nav>

    <!-- WORKSPACE [DIN.UI.SHELL.SPLIT] -->
    <!-- [DIN.UI.EDITOR.TOOLS] Floating Toolbar -->
    <!-- [DIN.UI.EDITOR.TOOLS] Floating Toolbar 2.0 -->
    <aside
      id="editor-toolbar"
      class="editor-toolbar no-print"
      role="toolbar"
      aria-label="Textformatierung"
    >
      <!-- SVG Icons for modern look -->
      <button data-cmd="bold" title="Fett (Strg+B)" aria-label="Fett">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 4h8a4 4 0 0 1 4 4 8 8 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 8 8 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      <button data-cmd="italic" title="Kursiv (Strg+I)" aria-label="Kursiv">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>
      <button
        data-cmd="underline"
        title="Unterstrichen (Strg+U)"
        aria-label="Unterstrichen"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
          <line x1="4" y1="21" x2="20" y2="21"></line>
        </svg>
      </button>

      <div class="toolbar-sep"></div>

      <button
        data-cmd="insertUnorderedList"
        title="Aufzählung"
        aria-label="Liste"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      <button
        data-cmd="insertOrderedList"
        title="Nummerierung"
        aria-label="Nummerierung"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="10" y1="6" x2="21" y2="6"></line>
          <line x1="10" y1="12" x2="21" y2="12"></line>
          <line x1="10" y1="18" x2="21" y2="18"></line>
          <path d="M4 6h1v4"></path>
          <path d="M4 10h2"></path>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
        </svg>
      </button>

      <div class="toolbar-sep"></div>

      <!-- MyDealz Quote Style -->
      <button
        data-cmd="formatBlock"
        data-val="blockquote"
        title="Zitat / Einrücken"
        aria-label="Zitat"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
          ></path>
          <path
            d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
          ></path>
        </svg>
      </button>

      <div class="toolbar-sep"></div>

      <button
        data-cmd="removeFormat"
        title="Formatierung entfernen"
        aria-label="Format löschen"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="2" y1="2" x2="22" y2="22"></line>
          <path d="M7.5 7.5L12 18l3.75-8.625"></path>
        </svg>
      </button>
    </aside>

    <main id="app-viewport" role="main">
      <div id="brief-container">
        <article
          id="sheet"
          data-spec="DIN.UI.PAPER.GRID"
          aria-label="Briefbogen"
        >
          <div
            class="mark mark-fold-1"
            data-spec="DIN.UI.PAPER.FOLD"
            aria-hidden="true"
          ></div>
          <div
            class="mark mark-loch"
            data-spec="DIN.UI.PAPER.FOLD"
            aria-hidden="true"
          ></div>
          <div
            class="mark mark-fold-2"
            data-spec="DIN.UI.PAPER.FOLD"
            aria-hidden="true"
          ></div>
          <div
            id="page-break-marker"
            class="no-print"
            title="Ende der Seite 1"
            aria-hidden="true"
          ></div>

          <!-- ZONE 1: CLEAN SENDER BLOCK (Isomorphic) -->
          <div id="sender-wrapper" aria-label="Absender Daten">
            <din-sender-company
              id="sender-company"
              contenteditable="true"
              data-placeholder="Firma"
              class="single-line-field"
            ></din-sender-company>
            <din-sender-name
              id="sender-name"
              contenteditable="true"
              data-placeholder="Ihr Name"
              class="single-line-field"
            ></din-sender-name>
            <din-sender-street
              id="sender-street"
              contenteditable="true"
              data-placeholder="Straße Nr."
              class="single-line-field"
            ></din-sender-street>
            <din-sender-zip-city
              id="sender-zip-city"
              contenteditable="true"
              data-placeholder="PLZ Ort"
              class="single-line-field"
            ></din-sender-zip-city>
            <!-- Contact info hidden visually but available in data/profile -->
            <din-sender-phone
              id="sender-phone"
              contenteditable="true"
              data-placeholder="Telefon"
              class="single-line-field"
            ></din-sender-phone>
            <din-sender-email
              id="sender-email"
              contenteditable="true"
              data-placeholder="E-Mail"
              class="single-line-field"
            ></din-sender-email>
          </div>

          <!-- ZONE 2: ADDRESS & INFO -->
          <section id="address-zone" data-spec="DIN.UI.ADDR.ZONE">
            <din-sender-address-small
              id="sender-address-small"
              contenteditable="true"
              data-spec="DIN.LOGIC.ADDR.ANCHOR"
              class="single-line-field"
              data-placeholder="Rücksendeadresse (Max 85 Zeichen)"
              aria-label="Rücksendeadresse"
            ></din-sender-address-small>

            <din-special-notes
              id="special-notes"
              contenteditable="true"
              data-placeholder="Einschreiben"
              class="single-line-field"
              style="margin-bottom: 5px; font-size: 8pt; font-weight: bold"
            ></din-special-notes>

            <!-- Structured Recipient Block -->
            <div
              class="recipient-wrapper"
              role="group"
              aria-label="Empfängeranschrift"
            >
              <din-recipient-company
                id="recipient-company"
                data-placeholder="Muster GmbH"
                contenteditable="true"
                class="single-line-field capitalize-first"
                role="textbox"
              ></din-recipient-company>

              <!-- [V9] Split Salutation/Name -->
              <din-recipient-salutation
                id="recipient-salutation"
                data-placeholder="Herrn"
                contenteditable="true"
                class="single-line-field capitalize-first"
                role="textbox"
              ></din-recipient-salutation>

              <din-recipient-name
                id="recipient-name"
                data-placeholder="Max Mustermann"
                contenteditable="true"
                class="single-line-field capitalize-first"
                role="textbox"
              ></din-recipient-name>
              <din-recipient-street
                id="recipient-street"
                data-placeholder="Musterstraße 1"
                contenteditable="true"
                class="single-line-field capitalize-first"
                role="textbox"
              ></din-recipient-street>
              <div class="recipient-city-row">
                <din-recipient-zip
                  id="recipient-zip"
                  data-placeholder="PLZ"
                  contenteditable="true"
                  class="single-line-field"
                  role="textbox"
                ></din-recipient-zip>
                <din-recipient-city
                  id="recipient-city"
                  data-placeholder="Musterstadt"
                  contenteditable="true"
                  class="single-line-field capitalize-first"
                  role="textbox"
                ></din-recipient-city>
              </div>
              <!-- Country field removed as per strict V9 spec -->
            </div>

            <div
              id="autocomplete-results"
              class="no-print"
              role="listbox"
              aria-label="Adressvorschläge"
            ></div>
          </section>

          <!-- ZONE 4: DATE ONLY (Restored Standalone) -->
          <!-- Note: ID matches V9 Schema 'info_date' but placed physically per visual spec -->
          <din-info-date
            id="info-date"
            contenteditable="true"
            data-spec="DIN.LOGIC.DATE.FMT"
            data-placeholder="Datum"
            class="single-line-field"
            role="textbox"
            aria-label="Datum"
          ></din-info-date>

          <section id="text-container" data-spec="DIN.UI.BODY.CONTENT">
            <din-subject
              id="subject-line"
              contenteditable="true"
              data-spec="DIN.LOGIC.SUBJ.CLEAN"
              data-placeholder="Betreff"
              class="single-line-field"
              role="textbox"
              aria-label="Betreffzeile"
            ></din-subject>
            <din-salutation
              id="letter-salutation"
              contenteditable="true"
              data-placeholder="Anrede,"
              class="single-line-field"
              role="textbox"
              aria-label="Anrede"
            ></din-salutation>
            <din-body
              id="letter-body"
              contenteditable="true"
              data-placeholder="Brieftext hier eingeben..."
              role="textbox"
              aria-multiline="true"
              aria-label="Briefinhalt"
            ></din-body>

            <din-greeting
              id="letter-greeting"
              contenteditable="true"
              data-placeholder="Grußformel"
              class="single-line-field"
              role="textbox"
              aria-label="Grußformel"
            ></din-greeting>

            <!-- ZONE 6: SIGNATURE (Minimalist V9) -->
            <!-- ZONE 6: SIGNATURE (Minimalist V9) -->
            <div id="letter-signature" class="signature-wrapper">
              <!-- Space for Handwritten Signature (Standard DIN spacing) -->
              <div style="height: 1.5em"></div>

              <!-- [TASK 6] Corporate Signature Option 1 -->
              <!-- Automatically hidden via CSS if empty (Private vs Business) -->
              <din-signature-company
                id="signature-company"
                contenteditable="true"
                data-placeholder="Firma"
                class="single-line-field"
              ></din-signature-company>

              <din-signature-name
                id="signature-name"
                contenteditable="true"
                data-placeholder="Name"
                class="single-line-field"
              ></din-signature-name>
              <!-- Role/Position is hidden visually but persists in data schema -->
            </div>

            <!-- ATTACHMENTS & FOOTER REMOVED FOR CLEAN UI -->
            <!-- Data for these is still maintained in storage.js via Pass-Through -->
          </section>
        </article>
      </div>
    </main>

    <!-- [DIN.FEAT.PROF.MGR] Sender Profile (Strict Mode) -->
    <dialog
      id="profile-dialog"
      class="no-print"
      aria-labelledby="profile-title"
    >
      <button
        type="button"
        class="dialog-close-x"
        onclick="document.getElementById('profile-dialog').close()"
        aria-label="Schließen"
      >
        ×
      </button>

      <form method="dialog">
        <div class="dialog-header">
            <h2 id="profile-title">👤 Mein Absender</h2>
            <p class="subtitle">
            Diese Daten werden automatisch in den Briefkopf geladen.
            </p>
        </div>

        <div class="dialog-content-no-scroll">
          <fieldset>
            <legend>Identität & Adresse</legend>
            <div class="form-group">
              <label for="profile-company">Firma</label>
              <input
                type="text"
                id="profile-company"
                class="capitalize-first"
                placeholder="Muster GmbH"
                autocomplete="organization"
              />
            </div>
            <div class="form-group">
              <label for="profile-name">Voller Name</label>
              <input
                type="text"
                id="profile-name"
                class="capitalize-first"
                placeholder="Max Mustermann"
                autocomplete="name"
              />
            </div>

            <div class="form-group">
              <label for="profile-street">Straße & Hausnummer</label>
              <input
                type="text"
                id="profile-street"
                class="capitalize-first"
                placeholder="Musterstraße 1"
                autocomplete="street-address"
              />
            </div>

            <div class="row">
              <div class="form-group" style="flex: 1">
                <label for="profile-zip">PLZ</label>
                <input
                  type="text"
                  id="profile-zip"
                  placeholder="12345"
                  autocomplete="postal-code"
                  autocomplete="postal-code"
                  inputmode="numeric"
                  data-has-autocomplete="true"
                />
              </div>
              <div class="form-group" style="flex: 2">
                <label for="profile-city">Stadt</label>
                <input
                  type="text"
                  id="profile-city"
                  class="capitalize-first"
                  placeholder="Musterstadt"
                  oninput="this.value = this.value.replace(/[0-9]/g, '')"
                  autocomplete="address-level2"
                />
              </div>
            </div>

            <div class="row">
              <div class="form-group" style="flex: 1">
                <label for="profile-phone">Telefon</label>
                <input
                  type="tel"
                  id="profile-phone"
                  placeholder="0123 456789"
                  autocomplete="tel"
                  autocomplete="tel"
                />
              </div>
              <div class="form-group" style="flex: 1">
                <label for="profile-email">E-Mail</label>
                <input
                  type="text"
                  id="profile-email"
                  placeholder="max@beispiel.de"
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="profile-iban">IBAN (für Fußzeile) - <small>Eingabehilfe aktiv</small></label>
              <div class="iban-wrapper">
                <div id="iban-ghost" class="iban-text" aria-hidden="true"></div>
                <!-- Input with transparent background for ghost effect -->
                <input
                  type="text"
                  id="profile-iban"
                  class="iban-text"
                  placeholder=""
                  maxlength="34"
                  autocomplete="off"
                  spellcheck="false"
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div class="dialog-actions">
          <button
            type="button"
            class="btn secondary"
            onclick="document.getElementById('profile-dialog').close()"
          >
            Abbrechen
          </button>
          <button type="button" class="btn primary" id="btn-profile-done">
            Fertig
          </button>
        </div>
      </form>
    </dialog>

    <!-- [DIN.UI.DIALOG] Modern Confirm Dialog -->
    <!-- [DIN.UI.DIALOG] Modern Confirm Dialog -->
    <dialog id="confirmation-dialog" class="no-print" style="padding: 0; overflow: hidden; max-width: 400px; border-radius: 16px;">
      <form method="dialog" style="text-align: center; padding: 30px;">

        <!-- Danger Icon -->
        <div style="
            width: 60px;
            height: 60px;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px auto;
        ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        </div>

        <h2 id="confirm-title" style="color: #333; margin-bottom: 10px; font-weight: 700; font-size: 1.25rem;">Dokument Resetten?</h2>
        <p id="confirm-message" style="margin-bottom: 30px; color: #666; font-size: 0.95rem; line-height: 1.5;">Bist du dir sicher das du den Brief löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>

        <div class="dialog-actions" style="justify-content: center; gap: 12px; display: grid; grid-template-columns: 1fr 1fr;">
          <button
            type="button"
            class="btn secondary"
            value="cancel"
            id="btn-confirm-cancel"
            style="justify-content: center; background: #e9ecef; color: #333; border: 1px solid #dee2e6;"
          >
            Abbruch
          </button>
          <button
            type="button"
            class="btn primary danger"
            value="confirm"
            id="btn-confirm-ok"
            style="justify-content: center; background: #dc3545; border-color: #dc3545;"
          >
            Reset
          </button>
        </div>
      </form>
    </dialog>

    <div class="status-wrapper no-print">
      <div class="status-bar" id="save-status" aria-live="polite">
        <span class="status-icon" aria-hidden="true">⏳</span> Init...
      </div>
    </div>

    <!-- [EXPERT MODE] Developer Sidebar (Hacker Console) -->
    <aside id="debug-sidebar" class="no-print">
      <header class="debug-header">
        <div class="debug-title">🛠️ V9 SYSTEM INTERNALS</div>
        <button id="btn-debug-close" class="debug-btn-close">×</button>
      </header>

      <div class="debug-tabs">
        <button class="debug-tab active" data-tab="logs">📡 LIVE LOGS</button>
        <button class="debug-tab" data-tab="state">💾 STATE JSON</button>
      </div>

      <div id="debug-panel-logs" class="debug-panel active">
            <!-- [NEW] Log Filters -->
            <div class="log-filters" style="display:flex; gap:5px; padding:5px 10px; border-bottom:1px solid rgba(255,255,255,0.1);">
                <button class="btn secondary small log-filter active" data-level="all" style="flex:1; font-size:10px;">ALL</button>
                <button class="btn secondary small log-filter" data-level="info" style="flex:1; font-size:10px; color:#3498db;">INFO</button>
                <button class="btn secondary small log-filter" data-level="warn" style="flex:1; font-size:10px; color:#f1c40f;">WARN</button>
                <button class="btn secondary small log-filter" data-level="error" style="flex:1; font-size:10px; color:#e74c3c;">ERR</button>
            </div>
            <!-- App.Logger writes here via #debug-content target -->
            <div id="debug-content" class="log-container"></div>
        </div>

      <div id="debug-panel-state" class="debug-panel">
        <pre id="debug-state-viewer" class="json-viewer">Loading state...</pre>
      </div>

      <footer class="debug-footer">
        <button id="btn-debug-copy" class="debug-action-btn">
          📋 Copy Full Report
        </button>
        <button id="btn-debug-fill" class="debug-action-btn warning">
          🧪 FILL TAGS
        </button>
        <button id="btn-debug-reset" class="debug-action-btn danger">
          ☢️ RESET APP
        </button>
      </footer>
    </aside>

    <div id="emergency-panic-room" class="no-print" hidden></div>

    <!-- SCRIPTS (V9 STRUCTURE) -->
    <script>
/* SOURCE: js/core/constants.js */
/**
 * > File: js/core/constants.js
 * > Role: System Constants & Enums
 * > Spec: [DIN.SYS.CONSTANTS]
 * > Dep:  None (Base Layer)
 * -----------------------------------------------------------------------------
 * Single Source of Truth for all magic strings, keys, and strict Enums.
 * Referenced by Storage, Config, and UI.
 */

window.App = window.App || {};

window.App.Constants = {

    // [DIN.DATA.SCHEMA] Strict Versioning
    SCHEMA_VERSION: 9,

    // Storage Keys
    STORAGE: {
        DATA: 'din5008_data',
        CONTACTS: 'din5008_contacts',
        PROFILE: 'din5008_profile',
        LOGS: 'din_crash_log'
    },

    // System Limits [DIN.SYS.LIMITS]
    LIMITS: {
        HISTORY_MAX_ITEMS: 50,   // Undo/Redo Stack
        LOGS_MAX_LINES: 100,     // Flight Recorder
        API_DEBOUNCE_MS: 300,    // Autocomplete Delay
        MAX_CONTACTS: 100,       // Address Book Cap (Storage)
        CONTACTS_MAX_ITEMS: 100, // Alias for Compliance
        OVERFLOW_BUFFER_PX: 75   // [DIN.LOGIC.OVERFLOW] Safety buffer (20mm approx)
    },

    // [DIN.UI.CONFIG] Interface Constants
    UI: {
        TOAST_DURATION_MS: 3000,
        TOAST_FADE_MS: 300,

        // Centralized Messages [Refactor 2026]
        TOASTS: {
            // Success
            PROFILE_SAVED: 'Profil gespeichert',
            EXPORT_SUCCESS: 'Export erfolgreich',
            IMPORT_SUCCESS: 'Backup geladen',
            RESET_SUCCESS: 'Neues Blatt geladen',
            INTL_MODE: '🌍 Internationaler Modus aktiv',
            IBAN_VALID: 'IBAN ist gültig',
            DEV_MODE_ON: '🛠️ Developer Mode: ON',
            REPORT_COPIED: '📋 System Report in Zwischenablage kopiert',

            // Info/Action
            PRINT_PENDING: 'Druck wird vorbereitet...',
            PROFILE_SAVING: 'Speichert Profil...',
            BACKUP_PENDING: 'Backup wird erstellt...',
            UNDO: 'Rückgängig',
            REDO: 'Wiederhergestellt',
            API_RESET: 'API Key entfernt. Provider auf Photon zurückgesetzt.',
            ZIP_WARN: 'Hinweis: Eine deutsche PLZ sollte 5-stellig sein.',

            // Warnings/Errors
            EXPORT_FAIL: 'Export fehlgeschlagen',
            IMPORT_FAIL: 'Fehlerhafte Datei',
            RESET_WARN: 'Reset Warnung',
            IBAN_INVALID: 'IBAN Prüfsumme ungültig',
            IBAN_LENGTH: 'IBAN unvollständig (22 Stellen benötigt)',
            API_ERROR: 'API Key abgelaufen oder ungültig.',
            TEXT_OVERFLOW: '⚠️ Text zu lang für Fensterzeile! (Max 85)',
            LINE_OVERFLOW: 'Maximale Zeilenlänge erreicht',
            COPY_FAIL: 'Copy Failed (See Console)',

            // Dev
            STRESS_START: '⚠️ Starting System Stress Test...',
            STRESS_DONE: 'Stress Test Complete.',
            INSPECTOR_ON: '🕵️ Inspector aktiv | ESC zum Beenden',
            INSPECTOR_OFF: 'Inspector deaktiviert'
        }
    },

    // [DIN.SYS.CONFIG] Enums
    LAYOUTS: {
        FORM_A: 'form-a', // 32mm Header
        FORM_B: 'form-b'  // 50mm Header (Standard)
    },

    PROVIDERS: {
        PHOTON: 'photon',
        GEOAPIFY: 'geoapify'
    },

    DATE_FORMATS: {
        DE: 'de',      // 12.01.2025
        ISO: 'iso',    // 2025-01-12
        LONG: 'long'   // 12. Oktober 2025
    },

    FORMALITY: {
        FORMAL: 'formal', // Sehr geehrter Herr...
        POLITE: 'polite', // Guten Tag Herr...
        CASUAL: 'casual'  // Hallo...
    },

    FONTS: {
        APTOS: 'aptos', // Sans-Serif
        SERIF: 'serif'  // Times/Garamond
    }
};
</script>
    <script>
/* SOURCE: js/core/config.js */
/**
 * > File: js/core/config.js
 * > Role: Single Source of Truth for Configuration, Texts, and Constants
 * > Spec: [DIN.SYS.CONFIG]
 * > Dep:  js/core/constants.js
 * -----------------------------------------------------------------------------
 * Contains all hardcoded strings, DIN limits, and default settings.
 * NOW USES CONSTANTS REFERENCES.
 */

window.App = window.App || {};

// Ensure Constants are loaded
const C = window.App.Constants;

window.App.Config = {

    APP_VERSION: '9.1.0-platinum',

    // [DIN.SYS.ROBUST] Global System Flags
    DEBUG: true,

    // [DIN-DOMAIN] Physics & Limits according to DIN 5008
    DIN: {
        MAX_LINES_SENDER: 6,      // Section 2
        MAX_LINES_RECIPIENT: 7,   // Section 3 (Zone C)
        DATE_FORMAT_DE: C.DATE_FORMATS.DE,
        DATE_FORMAT_ISO: C.DATE_FORMATS.ISO
    },

    // [DIN-DEFAULTS] Initial App State using Constants
    DEFAULTS: {
        LAYOUT: C.LAYOUTS.FORM_B,
        PROVIDER: C.PROVIDERS.PHOTON,
        DATE_FORMAT: C.DATE_FORMATS.DE,
        FORMALITY: C.FORMALITY.FORMAL,
        FONT: C.FONTS.APTOS,
        API_KEY: ''
    },

    // [DIN-TEXTS] User Facing Strings (German Only)
    TEXTS: {
        STATUS: {
            LOADING: '⏳ System lädt...',
            SAVING: '⏳ Speichert...',
            SAVED: '✅ Gespeichert',
            UNSAVED: '⚠️ Ungespeichert',
            IDLE_PREFIX: '✅ Gespeichert',
            ERROR: '❌ Fehler beim Speichern'
        },
        TOAST: {
            PASTE_CLEANED: 'Text eingefügt (Formatierung entfernt)',
            SINGLE_LINE_BLOCK: 'Dieses Feld erlaubt keine Zeilenumbrüche.',
            CONTACT_SAVED: 'Kontakt gespeichert!',
            CONTACT_DELETED: 'Kontakt gelöscht',
            CONTACT_SAVED_BTN: 'Kontakt gespeichert (Klicken zum Löschen)',
            CONTACT_SAVE_BTN: 'Als Kontakt speichern',
            DATE_TRUNCATED: 'Datum abgeschnitten.',
            OVERFLOW_PRINT: 'Text überschreitet den druckbaren Bereich!',
            OVERFLOW_WARN: (max) => `Achtung: Mehr als ${max} Zeilen. Dies kann im Druck abgeschnitten werden.`,
            API_ERROR: 'Adress-Suche aktuell eingeschränkt.'
        },
        VALIDATION: {
            NO_NEWLINES: 'Zeilenumbrüche sind in diesem Feld nicht erlaubt.',
            TOO_LONG: (max) => `Text zu lang (Max: ${max} Zeichen).`,
            SUBJECT_REMOVED: "DIN 5008: 'Betreff' wird weggelassen."
        },
        ACTIONS: {
            INSERT_ANYWAY: 'Trotzdem einfügen',
            CONFIRM_DELETE: 'Bist du dir sicher das du den Brief löschen möchtest?',
            UNSAVED_WARNING: 'Sie haben ungespeicherte Änderungen. Wollen Sie die Seite wirklich verlassen?'
        },
        PANIC: {
            TITLE: '💥 System Failure',
            MSG: 'Ein kritischer Fehler ist aufgetreten.',
            RESTART: 'Neustart versuchen',
            RESCUE: 'Daten retten (Not-Export)'
        }
    },

    // [DIN-LOGIC] Salutations & Closings
    PHRASES: {
        SALUTATION_DEFAULT: 'Sehr geehrte Damen und Herren,',
        CLOSING_FORMAL: 'Mit freundlichen Grüßen',
        CLOSING_POLITE: 'Beste Grüße',
        CLOSING_CASUAL: 'Viele Grüße'
    }
};
</script>

    <!-- Utilities (Moved to Core) -->
    <script>
/* SOURCE: js/core/utils.js */
/**
 * > File: js/core/utils.js
 * > Role: Shared Utilities Library
 * > Spec: [DIN.SYS.UTILS]
 * > Dep:  None (Standalone)
 * -----------------------------------------------------------------------------
 * Helper functions (debounce, UUID, escaping) used across the system.
 */

window.App = window.App || {};

window.App.Utils = {

    /**
     * Creates a debounced function that delays invoking func until after wait milliseconds.
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    /**
     * Async sleep helper for backoff strategies.
     */
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Generates a pseudo-UUID.
     */
    uuid: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Deep clones a JSON-compatible object.
     */
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * [SECURITY] Escapes HTML to prevent XSS in innerHTML injections.
     */
    escapeHtml: function(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};
</script>
    <script>
/* SOURCE: js/core/logger.js */
/**
 * > File: js/core/logger.js
 * > Role: Black-Box Flight Recorder
 * > Spec: [DIN.SYS.LOGGER]
 * > Dep:  LocalStorage (Native)
 * -----------------------------------------------------------------------------
 * Captures logs, errors, and traces for debugging without console access.
 * UPGRADE: Now supports Platinum Grade styled console logging.
 */

window.App = window.App || {};

window.App.Logger = {
    el: null,
    contentEl: null,
    isCollapsed: true,
    history: [], // RAM Buffer
    MAX_HISTORY: 50,
    STORAGE_KEY: 'din_crash_log',

    // [TASK 1] Console Styling Definition
    styles: {
        base: 'font-family: sans-serif; padding: 2px 5px; border-radius: 3px; font-size: 10px;',
        module: 'font-weight: bold; color: #fff;',
        info: 'background: #3498db;',    // Blue
        success: 'background: #2ecc71;', // Green
        warn: 'background: #f1c40f; color: #000;', // Yellow
        error: 'background: #e74c3c;'    // Red
    },

    init: function () {
        if (window.App.Constants && window.App.Constants.LIMITS && window.App.Constants.LIMITS.LOGS_MAX_LINES) {
            this.MAX_HISTORY = window.App.Constants.LIMITS.LOGS_MAX_LINES;
        }

        this.loadBlackBox();
        this.render();
        this.attachGlobalHandlers();

        this.checkPreviousCrash();
        this.banner(); // [TASK 1] Show Startup Banner
    },

    banner: function () {
        console.log(
            '%c V9 PLATINUM %c SYSTEM READY ',
            'background:#2c3e50; color:#fff; font-size: 11px; font-weight:bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
            'background:#007bff; color:#fff; font-size: 11px; font-weight:bold; padding: 4px 8px; border-radius: 0 4px 4px 0;'
        );
    },

    loadBlackBox: function () {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                this.history = JSON.parse(raw);
            }
        } catch (e) {
            console.error('Failed to load crash log', e);
            this.history = [];
        }
    },

    checkPreviousCrash: function () {
        if (this.history.length > 0) {
            const lastEntry = this.history[this.history.length - 1];
            if (lastEntry.level === 'error') {
                setTimeout(() => {
                    this.error('CRASH_DETECTED', `Previous session ended with error: ${lastEntry.message}`);
                    // Note: We no longer auto-toggle the legacy console,
                    // the sidebar remains hidden until expert mode is active.
                }, 500);
            }
        }
    },

    render: function () {
        // [V9 UPDATE] Target the Sidebar Log Container directly
        const container = document.getElementById('debug-content');
        if (container) {
            this.contentEl = container;
        } else {
            // Fallback for when Sidebar isn't loaded (should not happen in V9)
            console.warn('Logger: Sidebar container #debug-content not found.');
        }
    },

    // Legacy Toggle - No longer needed but kept for interface compatibility
    toggle: function (forceState) { },

    clear: function () {
        if (this.contentEl) this.contentEl.innerHTML = '';
        this.info('System', 'Console view cleared (History preserved).');
    },

    exportLog: function (format = 'csv') {
        let content = '';
        let mime = 'text/plain';
        let ext = 'txt';

        if (format === 'csv') {
            content = "Timestamp,Level,Context,Message\n";
            content += this.history.map(e => {
                const msg = e.message.replace(/"/g, '""');
                return `"${e.time}","${e.level}","${e.context}","${msg}"`;
            }).join('\n');
            mime = 'text/csv';
            ext = 'csv';
        } else {
            content = this.history.map(entry =>
                `[${entry.time}] [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`
            ).join('\n');
        }

        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `din_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    },

    persist: function (entry) {
        this.history.push(entry);
        if (this.history.length > this.MAX_HISTORY) {
            this.history.shift();
        }
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
        } catch (e) { /* Quota ignore */ }
    },

    /**
     * Internal generic printer
     */
    print: function (level, context, message) {
        const timestamp = new Date().toLocaleTimeString('de-DE');

        // [TASK 2] Auto-Color for Contexts
        const color = this._getContextColor(context);
        const icon = this._getLevelIcon(level);

        if (this.contentEl) {
            const entryDiv = document.createElement('div');
            entryDiv.className = `log-entry log-${level}`;
            // Grid Layout Pattern: Icon | Time | Context | Message
            entryDiv.innerHTML = `
                <span class="log-icon">${icon}</span>
                <span class="log-time">${timestamp}</span>
                <span class="log-context" style="color:${color}">${context}</span>
                <span class="log-msg">${message}</span>
            `;
            this.contentEl.appendChild(entryDiv);
            this.contentEl.scrollTop = this.contentEl.scrollHeight;
        }

        this.persist({
            time: timestamp,
            level: level,
            context: context,
            message: message
        });
    },

    _getLevelIcon: function (level) {
        switch (level) {
            case 'info': return 'ℹ️';
            case 'warn': return '⚠️';
            case 'error': return '❌';
            case 'success': return '✅';
            default: return '🔹';
        }
    },

    _getContextColor: function (ctx) {
        // Simple hash to repeatable color
        let hash = 0;
        for (let i = 0; i < ctx.length; i++) {
            hash = ctx.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Palette: High Visibility for Dark Mode
        const colors = [
            '#4fc3f7', // Light Blue
            '#aed581', // Light Green
            '#ba68c8', // Purple
            '#90a4ae', // Blue Grey
            '#7986cb', // Indigo
            '#4db6ac', // Teal
            '#dce775', // Lime
            '#ffffff'  // White
        ];
        return colors[Math.abs(hash) % colors.length];
    },

    // --- [TASK 1] Styled Logging Facade ---

    log: function (context, message) { this.info(context, message); }, // Legacy Alias

    info: function (context, message) {
        console.log(`%c ${context} %c ${message}`, `${this.styles.base} ${this.styles.module} ${this.styles.info}`, 'color: #3498db;');
        this.print('info', context, message);
    },

    success: function (context, message) {
        console.log(`%c ${context} %c ${message}`, `${this.styles.base} ${this.styles.module} ${this.styles.success}`, 'color: #2ecc71;');
        this.print('info', context, message); // Store as info type
    },

    warn: function (context, message) {
        console.warn(`%c ${context} %c ${message}`, `${this.styles.base} ${this.styles.module} ${this.styles.warn}`, 'color: #f39c12;');
        this.print('warn', context, message);
    },

    error: function (context, message) {
        console.error(`%c ${context} %c ${message}`, `${this.styles.base} ${this.styles.module} ${this.styles.error}`, 'color: #e74c3c;');
        this.print('error', context, message);
    },

    attachGlobalHandlers: function () {
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            // [NOISE FILTER] Ignore generic cross-origin script errors
            if (msg === 'Script error.' && lineNo === 0) return false;

            this.error('GLOBAL_TRAP', `${msg} (Line: ${lineNo})`);
            return false;
        };

        window.onunhandledrejection = (event) => {
            this.error('PROMISE_TRAP', `Unhandled Rejection: ${event.reason}`);
        };
    }
};
</script>

    <!-- Modules (Tests & Diag) -->
    <script>
/* SOURCE: js/modules/diagnostics.js */
/**
 * > File: js/modules/diagnostics.js
 * > Role: System Integrity Checker & Accessibility Audit
 * > Spec: [DIN.SYS.DIAG]
 * > Dep:  js/core/app.js, js/logic/logger.js
 * -----------------------------------------------------------------------------
 * Runs self-checks on DOM, Storage, and Module loading status.
 */

window.App = window.App || {};

window.App.Diagnostics = {

    run: async function() {
        const report = {
            timestamp: new Date().toISOString(),
            checks: [],
            success: true
        };

        const addCheck = (name, status, msg) => {
            report.checks.push({ name, status, msg });
            if (status === 'FAIL') report.success = false;
        };

        // 1. Module Check
        const requiredModules = ['Core', 'UI', 'Formatter', 'Storage', 'Logger', 'Utils', 'API'];
        requiredModules.forEach(mod => {
            if (window.App[mod]) addCheck(`Module: App.${mod}`, 'PASS', 'Loaded');
            else addCheck(`Module: App.${mod}`, 'FAIL', 'Missing');
        });

        // 2. DOM Integrity Check
        const criticalElements = ['sheet', 'sender-block', 'address-zone', 'text-container'];
        criticalElements.forEach(id => {
            if (document.getElementById(id)) addCheck(`DOM: #${id}`, 'PASS', 'Exists');
            else addCheck(`DOM: #${id}`, 'FAIL', 'Missing in DOM');
        });

        // 3. Storage I/O Check
        try {
            const testKey = 'din_diag_test';
            localStorage.setItem(testKey, 'rw_test');
            const val = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            if (val === 'rw_test') addCheck('Storage: LocalStorage', 'PASS', 'Read/Write OK');
            else addCheck('Storage: LocalStorage', 'FAIL', 'Read Mismatch');
        } catch (e) {
            addCheck('Storage: LocalStorage', 'FAIL', `Error: ${e.message}`);
        }

        // 4. Accessibility Audit [DIN-A11Y]
        this.runA11yAudit(addCheck);

        // 5. Traceability Check
        const tracedElements = document.querySelectorAll('[data-spec]');
        addCheck('Traceability', 'INFO', `Found ${tracedElements.length} Spec-IDs in DOM`);

        return report;
    },

    runA11yAudit: function(addCheck) {
        // Check for interactive elements without aria-label or text content
        const interactive = document.querySelectorAll('button, [contenteditable="true"]');
        let issues = 0;
        interactive.forEach(el => {
            const hasLabel = el.getAttribute('aria-label') || el.innerText.trim() || el.title;
            if (!hasLabel) {
                issues++;
                addCheck(`A11Y: Missing Label`, 'WARN', `Element #${el.id || el.className} lacks a descriptive label.`);
            }
        });

        // Check for missing roles on contenteditable
        const editables = document.querySelectorAll('[contenteditable="true"]');
        editables.forEach(el => {
            if (!el.getAttribute('role')) {
                issues++;
                addCheck(`A11Y: Missing Role`, 'WARN', `Contenteditable #${el.id} lacks role="textbox".`);
            }
        });

        if (issues === 0) {
            addCheck('Accessibility Audit', 'PASS', 'No major ARIA or Label issues found.');
        } else {
            addCheck('Accessibility Audit', 'INFO', `Found ${issues} minor issues to improve.`);
        }
    },

    printReport: async function() {
        const report = await this.run();
        let logText = `🔍 SYSTEM DIAGNOSTICS REPORT [${report.timestamp}]\n`;
        logText += `OVERALL STATUS: ${report.success ? '✅ PASS' : '❌ FAIL'}\n\n`;

        report.checks.forEach(c => {
            const icon = c.status === 'PASS' ? '✅' : c.status === 'FAIL' ? '❌' : c.status === 'WARN' ? '⚠️' : 'ℹ️';
            logText += `${icon} [${c.name.padEnd(25)}] ${c.msg}\n`;
        });

        console.log(logText);
        if (window.App.Logger) window.App.Logger.log('Diagnostics', `Run completed. Status: ${report.success ? 'PASS' : 'FAIL'}`);
        return logText;
    }
};
</script>
    <script>
/* SOURCE: js/modules/tests.js */
/**
 * > File: js/modules/tests.js
 * > Role: In-Browser Unit Testing Suite
 * > Spec: [DIN.SYS.TESTS]
 * > Dep:  js/formatters/formatter.js, js/services/storage.js
 * -----------------------------------------------------------------------------
 * Logic verification suite runnable in browser console.
 */

window.App = window.App || {};

window.App.Tests = {

    run: async function() {
        console.group('🧪 Running Unit Tests [DIN-TESTS]');
        // Log to Flight Recorder
        if (window.App.Logger) window.App.Logger.log('Tests', 'Starting In-Browser Unit Test Suite...');

        const results = { passed: 0, failed: 0, log: [] };

        const assert = (desc, condition) => {
            if (condition) {
                console.log(`✅ ${desc}`);
                results.passed++;
                results.log.push({ status: 'PASS', msg: desc });
            } else {
                console.error(`❌ ${desc}`);
                if (window.App.Logger) window.App.Logger.error('Tests', `FAIL: ${desc}`);
                results.failed++;
                results.log.push({ status: 'FAIL', msg: desc });
            }
        };

        try {
            // --- TEST SUITE: FORMATTER ---
            assert('Formatter: Pads single digits (1.1.2024 -> 01.01.2024)', window.App.Formatter.padDateStrict('1.1.2024') === '01.01.2024');
            assert('Formatter: Cleans "Betreff:" prefix', window.App.Formatter.cleanSubject('Betreff: Kündigung') === 'Kündigung');

            const analysisM = window.App.Formatter.parseRecipient('Herr Max Mustermann');
            assert('Formatter: Detects Male Gender', analysisM.gender === 'm');
            assert('Formatter: Generates Formal Greeting', window.App.Formatter.deriveSalutation(analysisM, 'formal') === 'Sehr geehrter Herr Max Mustermann,');

            // --- TEST SUITE: STORAGE ---
            const emptySchema = window.App.Storage.validateAndRepair({});
            assert('Storage: Repairs empty object', emptySchema.content !== undefined);
            assert('Storage: Defaults to Form B', emptySchema.config.layout === 'form-b');

            // --- TEST SUITE: CONFIG ---
            assert('Config: Loads Defaults', window.App.Config.DEFAULTS.LAYOUT === 'form-b');

            // --- TEST SUITE: CONTROLLERS (Gap Closing) ---
            if (window.App.Tests.Controllers) {
                const ctrlResults = await window.App.Tests.Controllers.run();
                results.passed += ctrlResults.passed;
                results.failed += ctrlResults.failed;
            } else {
                console.warn('⚠️ Controller Tests module not loaded.');
            }

        } catch (e) {
            console.error('Test Runner Crashed', e);
            if (window.App.Logger) window.App.Logger.error('Tests', `CRASH: ${e.message}`);
            results.failed++;
            results.log.push({ status: 'CRASH', msg: e.message });
        }

        const summary = `🏁 TOTAL RESULT: ${results.passed} Passed, ${results.failed} Failed.`;
        console.log(summary);
        if (window.App.Logger) window.App.Logger.log('Tests', summary);

        console.groupEnd();
        return results;
    }
};
</script>
    <script>
/* SOURCE: js/modules/tests-controllers.js */
/**
 * > File: js/modules/tests-controllers.js
 * > Role: UI Controller Integration Tests
 * > Spec: [DIN.SYS.TESTS.UI]
 * > Dep:  js/controllers/settings-controller.js
 */

window.App = window.App || {};
window.App.Tests = window.App.Tests || {};

window.App.Tests.Controllers = {

    run: async function() {
        if (window.App.Logger) window.App.Logger.info('Test', '🧪 Running Controller Tests [DIN-TESTS-UI]');
        const results = { passed: 0, failed: 0 };

        const assert = (desc, condition) => {
            if (condition) {
                if (window.App.Logger) window.App.Logger.info('Test', `✅ ${desc}`);
                results.passed++;
            } else {
                if (window.App.Logger) window.App.Logger.error('Test', `❌ ${desc}`);
                results.failed++;
            }
        };

        try {
            // Instantiate Controller
            const settings = new window.App.Controllers.SettingsController();

            // --- TEST 1: Layout Switching (State -> CSS Class) ---
            // 1. Trigger Controller Method
            settings.setPaperLayout(window.App.Constants.LAYOUTS.FORM_A);

            // 2. Wait for State Proxy to update DOM (Sync)
            const bodyHasClassA = document.body.classList.contains('layout-form-a');
            const stateIsA = window.App.State.config.layout === 'form-a';

            assert("Settings: setPaperLayout('form-a') updates State", stateIsA);
            assert("Settings: State change triggers body class '.layout-form-a'", bodyHasClassA);

            // Reset
            settings.setPaperLayout('form-b');

            // --- TEST 2: Font Switching (State -> CSS Var) ---
            settings.setFontStack('serif');
            const computedFont = getComputedStyle(document.documentElement).getPropertyValue('--font-stack');
            assert("Settings: setFontStack('serif') updates CSS Variable", computedFont.includes('Times') || computedFont.includes('serif'));

            // Reset
            settings.setFontStack('aptos');

            // --- TEST 3: Context-Aware UI (API Key Visibility) ---
            // Case A: Photon (Default) -> Key Hidden
            settings.setProvider('photon');
            const keyGroup = document.getElementById('group-api-key');
            assert("Settings: Provider 'photon' hides API Key input", keyGroup.classList.contains('hidden'));

            // Case B: Geoapify -> Key Visible
            settings.setProvider('geoapify');
            assert("Settings: Provider 'geoapify' reveals API Key input", !keyGroup.classList.contains('hidden'));

        } catch (e) {
            console.error('Controller Tests Crashed', e);
            results.failed++;
        }

        console.log(`🏁 Controller Results: ${results.passed} Passed, ${results.failed} Failed.`);
        console.groupEnd();
        return results;
    }
};
</script>

    <!-- Logic & Formatters (Flattened Structure) -->
    <script>
/* SOURCE: js/formatters/date-formatter.js */
/**
 * > File: js/formatters/date-formatter.js
 * > Role: Specialized Date Logic (ISO/DIN Conversion)
 * > Spec: [DIN.LOGIC.DATE]
 * > Dep:  None (Pure Function)
 * -----------------------------------------------------------------------------
 * Handles strict DIN 5008 date padding and format conversions.
 */

window.App = window.App || {};
window.App.Formatters = window.App.Formatters || {};

window.App.Formatters.DateFormatter = {

    /**
     * Enforces strict leading zeros (e.g., 1.1.2024 -> 01.01.2024).
     */
    padDateStrict: function (input) {
        if (!input) return input;
        const match = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (match) {
            const d = match[1].padStart(2, '0');
            const m = match[2].padStart(2, '0');
            const y = match[3];
            return `${d}.${m}.${y}`;
        }
        return input;
    },

    /**
     * Converts various input formats to ISO YYYY-MM-DD.
     */
    toISODate: function (input) {
        if (!input) return '';
        input = input.trim();

        // 1. Check DD.MM.YYYY
        const dMatch = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (dMatch) {
            const d = dMatch[1].padStart(2, '0');
            const m = dMatch[2].padStart(2, '0');
            return `${dMatch[3]}-${m}-${d}`;
        }

        // 2. Check YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

        // 3. Check Long Format: D. Month YYYY
        // 3. Check Long Format: D. Month YYYY (Matches "12. Oktober 2024" or "12. Okt 2024")
        const longMatch = input.match(/^(\d{1,2})\.?\s+([a-zA-ZäöüÄÖÜß]{3,})\.?\s+(\d{4})$/);
        if (longMatch) {
            const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
            const day = longMatch[1].padStart(2, '0');
            const monthName = longMatch[2].toLowerCase();
            const year = longMatch[3];

            // [FIX] Robust Month Matching
            const monthIdx = months.findIndex(m => {
                const cleanInput = monthName.toLowerCase();
                const cleanMonth = m.toLowerCase();
                return cleanInput.startsWith(cleanMonth) || cleanMonth.startsWith(cleanInput.substring(0, 3));
            });

            if (monthIdx !== -1) {
                const mm = (monthIdx + 1).toString().padStart(2, '0');
                return `${year}-${mm}-${day}`;
            }
        }

        // 4. Try basic Date parsing for everything else (e.g. "12. Okt 24")
        const tryDate = new Date(input);
        if (!isNaN(tryDate.getTime())) {
            const d = tryDate.getDate().toString().padStart(2, '0');
            const m = (tryDate.getMonth() + 1).toString().padStart(2, '0');
            const y = tryDate.getFullYear();
            return `${y}-${m}-${d}`;
        }
        return '';
    },

    /**
     * Formats a Date object according to configuration.
     */
    getFormattedDate: function (dateObj, format) {
        if (!dateObj || isNaN(dateObj.getTime())) return '';
        const d = dateObj.getDate();
        const m = dateObj.getMonth() + 1;
        const y = dateObj.getFullYear();
        const dd = d < 10 ? '0' + d : d;
        const mm = m < 10 ? '0' + m : m;

        if (format === 'iso') return `${y}-${mm}-${dd}`;
        else if (format === 'long') {
            const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
            return `${d}. ${months[dateObj.getMonth()]} ${y}`;
        }
        return `${dd}.${mm}.${y}`; // Standard DE (DIN)
    }
};
</script>
    <script>
/* SOURCE: js/formatters/address-parser.js */
/**
 * > File: js/formatters/address-parser.js
 * > Role: Address Analysis & Parsing Engine
 * > Spec: [DIN.LOGIC.VALIDATION]
 * > Dep:  None (Pure Function)
 * -----------------------------------------------------------------------------
 * Parses return addresses (Anchoring), validates ZIP codes, and splits names/titles.
 */

window.App = window.App || {};
window.App.Formatters = window.App.Formatters || {};

window.App.Formatters.AddressParser = {

    /**
     * Derives the single-line return address using the "Anchor Strategy".
     * @see [DIN.LOGIC.RET.ANCHOR]
     */
    deriveReturnLine: function(rawSenderText) {
        let text = rawSenderText.trim();
        if (!text) return '';
        const lines = text.split(/[\n,]+/).map(p => p.trim()).filter(p => p);
        if (lines.length === 0) return '';
        const zipRegex = /(^|\s)\d{5}(\s|$)/;
        const anchorIndex = lines.findIndex(l => zipRegex.test(l));

        let namePart = '', streetPart = '', cityPart = '';

        if (anchorIndex !== -1) {
            cityPart = lines[anchorIndex];
            if (anchorIndex > 0) streetPart = lines[anchorIndex - 1];
            if (anchorIndex > 1) namePart = lines[0];
            else if (anchorIndex === 1) namePart = lines[0];
        } else {
            if (lines.length > 0) namePart = lines[0];
            if (lines.length > 1) streetPart = lines[1];
        }
        const formattedName = this._formatSenderName(namePart);
        return [formattedName, streetPart, cityPart].filter(Boolean).join(', ');
    },

    /**
     * Helper for deriveReturnLine
     */
    _formatSenderName: function(rawName) {
        if (!rawName) return '';
        let cleanName = rawName.replace(/^(Herr|Frau)\s+/i, '');
        let titlePrefix = '';
        const titles = ['Prof.', 'Dr.', 'Dipl.-Ing.', 'Dipl.-Kfm.'];
        let titleFound = true;
        while(titleFound) {
            titleFound = false;
            for (const t of titles) {
                if (cleanName.startsWith(t)) {
                    titlePrefix += t + ' ';
                    cleanName = cleanName.substring(t.length).trim();
                    titleFound = true;
                }
            }
        }
        const nameParts = cleanName.split(/\s+/);
        if (nameParts.length > 1) {
            const firstName = nameParts[0];
            const rest = nameParts.slice(1).join(' ');
            let abbrFirst = firstName;
            if (!firstName.includes('.') && firstName.length > 1) {
                abbrFirst = firstName.charAt(0) + '.';
            }
            return (titlePrefix + abbrFirst + ' ' + rest).trim();
        }
        return (titlePrefix + cleanName).trim();
    },

    /**
     * Informative Validation Analysis
     */
    analyzeAddressQuality: function(text, type = 'recipient') {
        const issues = [];
        if (!text || text.trim().length < 5) return issues;

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const fullText = lines.join(' ');

        // 1. ZIP Code Check (DACH: 4-5 digits)
        const zipMatch = fullText.match(/\b\d{4,5}\b/);
        if (!zipMatch) {
            issues.push("PLZ fehlt (4-5 Stellen)");
        }

        // 2. Street/House Number Check
        const hasStreetNum = lines.some(l => /\b[a-zA-ZäöüÄÖÜß.\-\s]+\s+\d+[a-zA-Z]?\b/.test(l));
        if (!hasStreetNum) {
            issues.push("Straße/Nr. unklar");
        }

        // 3. Sender Specifics
        if (type === 'sender') {
            const hasEmail = fullText.includes('@');
            const hasPhone = fullText.match(/(\+|0)\d[\d\s\-\/]{6,}/);
            if (!hasEmail && !hasPhone) {
                issues.push("Kontakt-Info fehlt (E-Mail/Tel)");
            }
        }

        return issues;
    },

    normalizeAddressBlock: function(text) {
        if (!text) return '';
        return text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
    },

    /**
     * Extracts Name, Title, and Gender for the Salutation Engine.
     */
    parseRecipient: function(text) {
        const lines = text.split('\n');
        let gender = 'n';
        let name = '';
        let titlesFound = '';
        let firstName = '';

        const titleRegex = /(Prof\.|Dr\.|Dipl\.-[A-Za-z]+|Mag\.)/g;

        let foundLineIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const clean = lines[i].trim();
            if (!clean) continue;

            if (/(^|\s)(Herr|Herrn)(\s|$)/i.test(clean)) {
                gender = 'm';
                foundLineIndex = i;
            } else if (/(^|\s)(Frau)(\s|$)/i.test(clean)) {
                gender = 'f';
                foundLineIndex = i;
            } else if (/(^|\s)(Familie|Eheleute)(\s|$)/i.test(clean)) {
                gender = 'fam';
                foundLineIndex = i;
            }

            if (gender !== 'n') break;
        }

        // Parse Name from the gender line OR the first line if no gender found
        let targetLine = '';
        if (foundLineIndex !== -1) {
            targetLine = lines[foundLineIndex];
        } else if (lines.length > 0 && lines[0].trim()) {
            targetLine = lines[0].trim(); // Fallback: Assume first line is Name
        }

        if (targetLine) {
            let content = targetLine.replace(/^(Herr|Herrn|Frau|Familie|Eheleute)\s+/i, '');
            const tMatches = content.match(titleRegex);
            if (tMatches) titlesFound = tMatches.join(' ') + ' ';
            content = content.replace(titleRegex, '').trim();
            const parts = content.split(/\s+/);
            if (parts.length > 0) {
                name = parts[parts.length - 1];
                if (parts.length > 1) firstName = parts.slice(0, parts.length - 1).join(' ');
                else firstName = name; // Fallback so firstName isn't empty if only one name
            }
        }

        return { gender, name, title: titlesFound.trim(), firstName, fullName: (firstName + ' ' + name).trim() };
    }
};
</script>
    <script>
/* SOURCE: js/formatters/salutation-engine.js */
/**
 * > File: js/formatters/salutation-engine.js
 * > Role: Smart Greeting Logic Generator
 * > Spec: [DIN.LOGIC.GREETING]
 * > Dep:  js/core/config.js (Access to Phrases)
 * -----------------------------------------------------------------------------
 * Generates context-aware salutations based on parsed recipient data.
 * STRICT V9 MATRIX IMPLEMENTATION.
 */

window.App = window.App || {};
window.App.Formatters = window.App.Formatters || {};

window.App.Formatters.SalutationEngine = {

    /**
     * Derives salutation based on strict V9 Matrix (Formal/Polite/Casual) + Explicit Type.
     * @param {Object} analysis - Parsed name data
     * @param {string} formality - 'formal', 'polite', 'casual'
     * @param {string} type - 'male', 'female', 'family', or '' (auto)
     */
    deriveSalutation: function(analysis, formality, type) {
        // [FIX] Use let to allow overrides
        let { gender, name, title, firstName } = analysis;

        // Helper to construct "Title Name" if title exists, else just Name.
        const fullName = analysis.fullName || (title ? `${title} ${name}` : name);
        const effectiveName = fullName || analysis.raw || '';

        // Trace Helper
        const trace = (style, reason) => {
            const msg = `Style: [${style}] -> ${reason}`;
            if (window.App.Logger) {
                window.App.Logger.info('SalutationLogic', msg);
            } else {
                console.log(`[SalutationLogic] ${msg}`);
            }
        };

        // [LOGGING] Explicitly Log Inputs for Debugging
        if (window.App.Logger) {
            window.App.Logger.info('SalutationEngine', `Deriving: Type=[${type}] Formality=[${formality}] Name=[${effectiveName}]`);
        } else {
            console.log('[SalutationEngine] deriving:', { analysis, formality, type, fullName });
        }

        // --- 0. EXPLICIT TYPE OVERRIDES (Strict) ---

        if (type === 'male') {
             const namePart = effectiveName ? ` ${effectiveName}` : '';

             if (formality === 'casual') return `Hallo${namePart},`;
             if (formality === 'polite') return `Guten Tag, Herr${namePart},`;
             // Default/Formal
             return `Sehr geehrter Herr${namePart},`;
        }

        if (type === 'female') {
             const namePart = effectiveName ? ` ${effectiveName}` : '';

             if (formality === 'casual') return `Hallo${namePart},`;

             // [FIX] Strict Polite Catch
             if (formality === 'polite') {
                 if (!effectiveName) return "Guten Tag,"; // Avoid "Guten Tag, Frau,"
                 return `Guten Tag, Frau${namePart},`;
             }

             // Default/Formal
             return `Sehr geehrte Frau${namePart},`;
        }

        // [FIX] Explicit None -> Block Generic Guessing?
        if (type === 'none') {
             gender = '?';
             analysis.gender = '?';
        }

        // --- 1. CASUAL STYLE ---
        if (formality === 'casual') {
            // "Hallo [Vorname]," or fallback to "Hallo [Name],"
            if (firstName) {
                trace('Casual', 'First Name');
                return `Hallo ${firstName},`;
            }
            if (name) {
                trace('Casual', 'Last Name (Fallback)');
                return `Hallo ${name},`;
            }
            // Unknown / Generic
            trace('Casual', 'Unknown Recipient');
            return "Hallo zusammen,";
        }

        // --- 2. POLITE STYLE ---
        if (formality === 'polite') {
            // [FIX] Generic Fallback if no name
            if (!effectiveName) {
                trace('Polite', 'No Name');
                return "Guten Tag,";
            }

            if (name) {
                if (gender === 'm') {
                    trace('Polite', 'Male');
                    return `Guten Tag, Herr ${fullName},`;
                }
                if (gender === 'f') {
                    trace('Polite', 'Female');
                    return `Guten Tag, Frau ${fullName},`;
                }
                // Gender Unknown but Name exists
                trace('Polite', 'Name Known, Gender Unknown');
                return `Guten Tag, ${firstName ? firstName + ' ' : ''}${fullName},`;
            }
            // Unknown / Generic
            trace('Polite', 'Unknown Recipient');
            return "Guten Tag,";
        }

        // --- 3. FORMAL STYLE (Default) ---
        if (effectiveName) {
            if (gender === 'm') {
                trace('Formal', 'Male');
                return `Sehr geehrter Herr ${fullName},`;
            }
            if (gender === 'f') {
                trace('Formal', 'Female');
                return `Sehr geehrte Frau ${fullName},`;
            }
            // If gender is unknown in Formal mode, standard fallback is "Damen und Herren"
            trace('Formal', 'Gender Unknown (Fallback)');
            return "Sehr geehrte Damen und Herren,";
        }

        // Strictly Unknown (No Name)
        trace('Formal', 'Unknown Recipient');
        return "Sehr geehrte Damen und Herren,";
    },

    /**
     * Derives closing based on strict V9 Matrix.
     */
    deriveClosing: function(formality) {
        switch (formality) {
            case 'casual': return "Viele Grüße";
            case 'polite': return "Freundliche Grüße";
            case 'formal': default: return "Mit freundlichen Grüßen";
        }
    }
};
</script>
    <script>
/* SOURCE: js/formatters/formatter.js */
/**
 * > File: js/formatters/formatter.js
 * > Role: FACADE for Logic Modules
 * > Spec: [DIN.LOGIC.FACADE]
 * > Dep:  date-formatter.js, address-parser.js, salutation-engine.js
 * -----------------------------------------------------------------------------
 * Aggregates sub-modules to maintain backward compatibility for App.Core.
 */

window.App = window.App || {};
window.App.Formatter = {

    /* --- Delegate to AddressParser --- */

    deriveReturnLine: function(rawSenderText) {
        return window.App.Formatters.AddressParser.deriveReturnLine(rawSenderText);
    },

    analyzeAddressQuality: function(text, type = 'recipient') {
        return window.App.Formatters.AddressParser.analyzeAddressQuality(text, type);
    },

    normalizeAddressBlock: function(text) {
        return window.App.Formatters.AddressParser.normalizeAddressBlock(text);
    },

    parseRecipient: function(text) {
        return window.App.Formatters.AddressParser.parseRecipient(text);
    },

    /* --- Delegate to DateFormatter --- */

    padDateStrict: function(input) {
        return window.App.Formatters.DateFormatter.padDateStrict(input);
    },

    toISODate: function(input) {
        return window.App.Formatters.DateFormatter.toISODate(input);
    },

    getFormattedDate: function(dateObj, format) {
        return window.App.Formatters.DateFormatter.getFormattedDate(dateObj, format);
    },

    /* --- Delegate to SalutationEngine --- */

    deriveSalutation: function(analysis, formality, type) {
        return window.App.Formatters.SalutationEngine.deriveSalutation(analysis, formality, type);
    },

    deriveClosing: function(formality) {
        return window.App.Formatters.SalutationEngine.deriveClosing(formality);
    },

    /* --- Logic: Phone Formatting [DIN.LOGIC.FORMAT.PHONE_DE] --- */

    formatPhoneNumber: function(rawInput) {
        if (!rawInput) return '';

        // 1. Clean: Convert slash to space, remove unwanted chars
        // Allow: Digits, +, -, Space
        let raw = rawInput.replace(/\//g, ' ').trim();

        // Remove multiple spaces
        raw = raw.replace(/\s+/g, ' ');

        // DIN 5008 Rule: No spacing inside the subscriber number.
        // Structure: AreaCode [Space] SubscriberNumber [- Extension]

        // Strip for analysis (keep + and -)
        const pure = raw.replace(/\s/g, '');

        // --- INTERNATIONAL (+49...) ---
        // Rule: +CostumerCode AreaCode SubscriberNumber
        // Drop leading zero of Area Code.
        if (pure.startsWith('+')) {
            // Helper: +49(0)30 -> +49 30
            // Detect Area Code start.
            // Simplified logic: Assume Country Code is 2-3 digits.
            // Taking +49 as standard example.

            // Regex to find Country Code and Area Code
            // Matches: (+49) [(0)] (AreaCode) (Rest)
            const parts = pure.match(/^(\+\d{1,3})\(?0?\)0?(\d+)/);
            if (parts) {
                const country = parts[1]; // +49
                const rest = parts[2];     // 30123456...

                // Now split Area Code from Rest (same logic as national)
                const isBig = /^(30|40|69|89)/.test(rest); // 0 already dropped
                const len = isBig ? 2 : 3; // 30 (2) vs 221 (3) (Standardized guess)

                const area = rest.substring(0, len);
                const sub = rest.substring(len);

                // Format: +49 30 123456
                return `${country} ${area} ${sub}`;
            }
            // Fallback for complex intl numbers: return as is or spaced
            return raw;
        }

        // --- NATIONAL (0...) ---
        // Rule: AreaCode [Space] SubscriberNumber
        // Big 4 Cities (030, 040, 069, 089) -> 3 Digits
        // Others -> Usually 4 Digits (0221, 0511), rarely 5.
        if (pure.startsWith('0')) {
             // Handle Extension (Hyphen)
             const parts = pure.split('-');
             const main = parts[0];
             const ext = parts.length > 1 ? `-${parts[1]}` : ''; // Re-attach extension

             const isBigCity = /^(030|040|069|089)/.test(main);
             const prefixLen = isBigCity ? 3 : 4; // Default to 4 for safety

             if (main.length > prefixLen) {
                 const prefix = main.substring(0, prefixLen);
                 const rest = main.substring(prefixLen);

                 return `${prefix} ${rest}${ext}`;
             }
             // If too short, return raw main + ext
             return `${main}${ext}`;
        }

        // Fallback (Mobile without 0? or just random stuff)
        return raw;
    },

    /* --- Utilities --- */

    cleanSubject: function(text) {
        const forbidden = [/Betreff:/gi, /Betr\.:/gi, /Betr:/gi];
        let clean = text;
        forbidden.forEach(regex => { clean = clean.replace(regex, ''); });
        return clean.trim();
    },

    /* --- Logic: IBAN Intelligence [DIN.LOGIC.FINANCE] --- */

    /* --- Logic: IBAN Intelligence [DIN.LOGIC.FINANCE] --- */

    // Efficient lookup table, populated at runtime
    _ibanRules: {},

    getFlagEmoji: function(countryCode) {
        if (!countryCode || countryCode.length !== 2) return '';
        // "Emoji-Hack": Convert "DE" -> 🇩🇪
        return countryCode.toUpperCase().replace(/./g, char =>
            String.fromCodePoint(char.charCodeAt(0) + 127397)
        );
    },

    formatIBAN: function(raw) {
        if (!raw) return '';
        // 1. Clean: Remove all spaces and non-alphanumerics, UpperCase
        const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        // 2. Chunk into groups of 4
        const chunks = [];
        for (let i = 0; i < clean.length; i += 4) {
             chunks.push(clean.substring(i, i + 4));
        }
        return chunks.join(' ');
    },

    validateIBAN: function(iban) {
        // Remove spaces
        const clean = iban.replace(/\s+/g, '').toUpperCase();

        // 1. Structure Check via Optimized Rules
        const country = clean.substring(0, 2);
        const rules = this._ibanRules || {};
        const expectedLength = rules[country];

        if (expectedLength) {
             // Precise Check: O(1) Lookup
             if (clean.length !== expectedLength) return false;
        } else {
             // Fallback for unknown countries (Generic IBAN rules)
             // Min 15 (Norway) to Max 34
             if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(clean)) {
                 return false;
             }
        }

        // 2. Mod-97-10 Checksum (ISO 7064)
        // Move first 4 chars to end
        const rearranged = clean.slice(4) + clean.slice(0, 4);

        // Convert Letters to Numbers (A=10, ..., Z=35)
        let numeric = '';
        for (let i = 0; i < rearranged.length; i++) {
            const charCode = rearranged.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) { // A-Z
                numeric += (charCode - 55).toString();
            } else {
                numeric += rearranged[i];
            }
        }

        // BigInt Modulo
        try {
            const remainder = BigInt(numeric) % 97n;
            return remainder === 1n;
        } catch (e) {
            return false; // Fallback if BigInt fails (ancient browser?)
        }
    },

    /**
     * Finds an IBAN in a text block, formats it, and prepends the flag.
     * Used by DocumentController for the footer.
     */
    formatIBANInBlock: function(text) {
        if (!text) return '';

        // Regex to extract potential IBAN candidates (greedy)
        // Looks for Word Boundary + 2 Letters + 2 Digits + Alphanumeric
        const match = text.match(/\b([A-Z]{2}\d{2}[A-Z0-9\s]+)\b/i);

        if (match) {
            const candidate = match[1];
            const clean = candidate.replace(/\s+/g, '').toUpperCase();

            // Check if it's a valid IBAN using our new logic
            if (this.validateIBAN(clean)) {
                // Formatting: Split into chunks of 4
                const formattedIBAN = this.formatIBAN(clean);
                const country = clean.substring(0, 2);
                const flag = this.getFlagEmoji(country);

                // Replace in original text
                // If text is predominantly the IBAN (allowing for "IBAN: " prefix etc)
                if (text.replace(/[^A-Za-z0-9]/g, '').length <= clean.length + 5) {
                     return `${flag} ${formattedIBAN}`;
                }

                return text.replace(candidate, formattedIBAN);
            }
        }

        return text;
    },

    validatePostalCode: function(code, country = 'DE') {
        if (!code) return true; // Empty is valid (clearing field)
        const clean = code.trim();

        if (country === 'DE') {
            return /^[0-9]{5}$/.test(clean);
        }
        // Fallback or other countries if implemented later
        return true;
    },

    /* --- Logic: Email Intelligence [DIN.LOGIC.WEB] --- */

    validateEmail: function(email) {
        // Return Object: { isValid: bool, warning: string|null }
        if (!email) return { isValid: true, warning: null }; // Empty is valid

        const clean = email.trim();

        // 1. Strict Regex (RFC 5322ish)
        // User Pattern: ^[A-Za-z0-9.!#$%&'*+/=?^_{|}~-]{1,64}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$
        const userPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

        if (!userPattern.test(clean)) {
            return { isValid: false, warning: null };
        }

        // 2. Soft Warnings (TLD Analysis)
        const parts = clean.split('.');
        const tld = parts[parts.length - 1];

        // Check 1: TLD contains Numbers (e.g. .365)
        if (/[0-9]/.test(tld)) {
            return { isValid: true, warning: 'Ungewöhnliche Domain (Zahlen). Sind Sie sicher?' };
        }

        // Check 2: TLD too long (> 4 chars like .online, .berlin)
        if (tld.length > 4) {
             return { isValid: true, warning: `Ungewöhnliche Endung (.${tld}). Sind Sie sicher?` };
        }

        return { isValid: true, warning: null };
    }
};

/* --- Global Initialization: IBAN Compression Unpacking --- */
(function() {
    // Compressed Data: Length -> Space-separated Country Codes (ISO 3166-1 alpha-2)
    // Source: User optimized dataset
    const rawData = {
        15: "NO",
        16: "BE",
        18: "DK FO FI GL NL",
        20: "AT EE KZ LT LU XK",
        21: "CH HR LV LI",
        22: "DE BH GB IE ME RS",
        27: "FR IT GR MC SM"
    };

    // Unpack to O(1) Access Table
    // Target: window.App.Formatter._ibanRules["DE"] = 22
    if (window.App && window.App.Formatter) {
        window.App.Formatter._ibanRules = window.App.Formatter._ibanRules || {};

        for (const [length, countries] of Object.entries(rawData)) {
             countries.split(" ").forEach(code => {
                 window.App.Formatter._ibanRules[code] = parseInt(length);
             });
        }
    }
})();
</script>

    <!-- Services -->
    <script>
/* SOURCE: js/services/api.js */
/**
 * > File: js/services/api.js
 * > Role: External Service Gateway
 * > Spec: [DIN.FEAT.GEO.BIAS]
 * > Dep:  js/core/utils.js, js/core/logger.js
 * -----------------------------------------------------------------------------
 * Handles remote calls (Address Autocomplete & Geocoding) with Robustness.
 * Implements Proximity Bias to prioritize local results.
 */

window.App = window.App || {};

window.App.API = {
    currentController: null,

    // [V9] Metrics for Dev Sidebar
    stats: {
        requestCount: 0,
        cacheHits: 0,
        lastLatency: 0
    },

    // [TASK 2] Hardcoded Default Bias: Bonn (The Federal City)
    DEFAULT_BIAS: { lat: 50.7333, lon: 7.0950 },

    /**
     * [TASK 1] Validate API Key via a lightweight Fetch
     * Returns true if key works, false otherwise.
     * [DEBUG] Logs timing to console/logger.
     */
    validateKey: async function(apiKey) {
        if (!apiKey || apiKey.length < 10) return false;
        try {
            const start = performance.now(); // Start Timer

            // Minimal Fetch: Search for "Bonn" with limit 1
            const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&apiKey=${apiKey}&limit=1`;
            const res = await fetch(url);

            const duration = (performance.now() - start).toFixed(0); // End Timer
            const logMsg = `Key Validation: ${res.status} (${duration}ms)`;

            if (window.App.Logger) {
                if (res.ok) window.App.Logger.success('API', logMsg);
                else window.App.Logger.warn('API', logMsg);
            }

            return res.ok;
        } catch (e) {
            if (window.App.Logger) window.App.Logger.warn('API', `Key Validation Failed: ${e.message}`);
            return false;
        }
    },

    /**
     * [DIN.FEAT.GEO.BIAS]
     * Fetches address suggestions with priority on proximity if bias is provided.
     * Universal Adapter for Geoapify and Photon.
     *
     * @param {string} query - User input
     * @param {object} config - App config (provider, apiKey)
     * @param {object|null} bias - { lat, lon } from User Profile
     * @param {string} type - 'street' | 'city' | 'postcode' (Default: 'street')
     */
    fetchAddressSuggestions: async function(query, config, bias = null, type = 'street') {
        try {
            if (!query || query.length < 2) return [];

            // [TASK 2] Provider Guard: Don't call Geoapify without a key
            if (config.provider === 'geoapify' && !config.apiKey) return [];

            // 1. Abort previous pending request (Instant typing response)
            if (this.currentController) {
                this.currentController.abort();
            }
            this.currentController = new AbortController();
            const signal = this.currentController.signal;

            let url = '';
            const encodedQuery = encodeURIComponent(query);

            // [TASK 2] Resolve Bias (User Location > Bonn Default)
            const activeBias = (bias && bias.lat && bias.lon) ? bias : this.DEFAULT_BIAS;

            // 2. Build URL based on Provider & Bias
            if (config.provider === 'photon') {
                // Photon: OpenStreetMap based (Free)
                // [TASK 3] Filter Quality: If checking for City/Zip, only return places (no POIs)
                let filter = '';
                if (type === 'city' || type === 'postcode') {
                   // photon supports strictly restrictive filters
                   filter = '&osm_tag=place';
                   // NOTE: Photon's 'place' tag covers city, town, village, etc.
                   // It eliminates shops, amenities, etc.
                }

                // [TASK 4] Photon Filter Optimizations
                // 1. Strict DACH BBox (Germany/Austria/Switzerland approx) to prevent "Russia" results for zippers
                //    minLon, minLat, maxLon, maxLat
                //    D: 5.8,47.3,15.1,55.1 (approx) -> Let's use a safe Central Europe Box
                const bbox = "5.0,45.0,20.0,56.0";

                url = `https://photon.komoot.io/api/?q=${encodedQuery}&lang=de&limit=5${filter}&bbox=${bbox}`;

                if (activeBias) {
                    // Photon Location Bias
                    // We use a high scale to prefer local, but the BBox already filters the "world"
                    url += `&lat=${activeBias.lat}&lon=${activeBias.lon}&location_bias_scale=0.6`;
                }
            } else if (config.provider === 'geoapify' && config.apiKey) {
                // Geoapify: Commercial grade [OPTIMIZED]
                // [TASK 1] Strict Country & Type Filtering + Proximity Bias
                url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedQuery}&apiKey=${config.apiKey}&limit=5&lang=de&filter=countrycode:de&bias=proximity:${activeBias.lon},${activeBias.lat}&type=${type}`;
            } else {
                return []; // No valid provider
            }

            this.stats.requestCount++;
            const start = performance.now();

            // 3. Robust Fetch
            const res = await this._fetchWithRetry(url, { signal }, 2, 200);

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const data = await res.json();

            const duration = (performance.now() - start).toFixed(0);

            // 4. Normalize Data
            let results = [];
            if (config.provider === 'photon') {
                results = this.parseFeaturesPhoton(data.features);
            } else if (config.provider === 'geoapify') {
                results = this.parseFeaturesGeoapify(data.results, type);
            }

            // [TASK 2] API Trace
            if (window.App.Logger && results.length > 0) {
                // Only log successful hits to reduce noise
                window.App.Logger.info('API', `${config.provider} found ${results.length} matches for "${query}" (${duration}ms)`);
            }

            return results;

        } catch (err) {
            if (err.name === 'AbortError') return []; // Expected behavior
            if (window.App.Logger) window.App.Logger.error('API', `Suggestion Fetch Failed: ${err.message}`);
            return [];
        }
    },

    /**
     * Converts a city/zip string into coordinates for the profile anchor.
     * Uses Photon (Free) for internal geocoding to save API credits.
     *
     * @param {string} addressString - e.g. "Berlin, 10115"
     * @returns {Promise<{lat: number, lon: number}|null>}
     */
    geocode: async function(addressString) {
        try {
            if (!addressString) return null;
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(addressString)}&limit=1&lang=de`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const data = await res.json();
            if (data.features && data.features.length > 0) {
                const [lon, lat] = data.features[0].geometry.coordinates;
                return { lat, lon };
            }
        } catch (e) {
            if (window.App.Logger) window.App.Logger.error('API', `Geocoding Failed: ${e.message}`);
            return null;
        }
        return null;
    },

    /**
     * Private Helper: Fetch with Exponential Backoff
     */
    _fetchWithRetry: async function(url, options = {}, retries = 3, backoff = 300) {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url, options);
                if (res.ok || (res.status >= 400 && res.status < 500)) {
                    return res;
                }
                throw new Error(`Server Error: ${res.status}`);
            } catch (err) {
                if (err.name === 'AbortError') throw err;
                if (i === retries - 1) throw err;
                const delay = backoff * Math.pow(2, i);
                await window.App.Utils.sleep(delay);
            }
        }
    },

    // --- Normalization Helpers ---

    parseFeaturesPhoton: function(features) {
        try {
            if (!features || !features.length) return [];
            return features.map(f => {
                const p = f.properties;
                const street = `${p.street || ''} ${p.housenumber || ''}`.trim();
                const city = `${p.postcode || ''} ${p.city || ''}`.trim();

                let display = '';
                if (p.name) display += p.name + ', ';
                if (street && street !== p.name) display += street + ', ';
                display += city;
                display = display.replace(/^, |, $/g, '').trim();

                const insertion = [p.name || '', street, city].filter(Boolean).join('\n');

                return { display, insertion, type: 'api', raw: p };
            });
        } catch (e) { return []; }
    },

    /**
     * [TASK 1] Specialized Parser for Geoapify
     * Creates human-readable strings like "53111 Bonn" even if searching for numbers.
     */
    parseFeaturesGeoapify: function(results, searchType) {
        try {
            if (!results || !results.length) return [];
            return results.map(r => {
                let display = r.formatted;
                const postcode = r.postcode || '';
                const city = r.city || '';

                // [TASK 2] Context-Aware Display Logic
                if (searchType === 'postcode' || searchType === 'city') {
                    if (postcode && city) {
                        display = `${postcode} ${city}`; // e.g. "53111 Bonn"
                    } else if (city) {
                        display = city;
                    } else if (postcode) {
                        display = postcode;
                    }
                }

                const insertion = `${r.address_line1}\n${r.address_line2}`;

                return {
                    display,
                    insertion,
                    type: 'api',
                    raw: r // Pass full object for cross-filling
                };
            });
        } catch (e) { return []; }
    }
};
</script>
    <script>
/* SOURCE: js/services/storage.js */
/**
 * > File: js/services/storage.js
 * > Role: Persistence Layer (I/O) & Data Guardian
 * > Spec: [DIN.SYS.DATA.STORE]
 * > Dep:  js/core/constants.js
 * -----------------------------------------------------------------------------
 * STRICT SCHEMA ENFORCEMENT WITH MIGRATION PIPELINE.
 * Features:
 * - Single Source: LocalStorage (Sync, 5MB Quota).
 * - Auto-Migration and Salvage logic.
 * - Quota Management (Auto-Purge Logs on overflow).
 */

window.App = window.App || {};

window.App.Storage = {

    // Shortcuts to Constants
    C: window.App.Constants,

    /**
     * Generates pristine V9 Data Object using Enums.
     * [BLOCKCHAIN PRINCIPLE] All fields must be defined here to survive migration.
     */
    getDefaultSchema: function() {
        const C = this.C;
        return {
            _version: C.SCHEMA_VERSION, // Currently 9
            config: {
                layout: C.LAYOUTS.FORM_A,
                provider: C.PROVIDERS.PHOTON,
                dateFormat: C.DATE_FORMATS.DE,
                formality: C.FORMALITY.FORMAL,
                font: C.FONTS.APTOS,
                apiKey: ''
            },
            content: {
                // Sender (Granular)
                sender_company: '',
                sender_name: '',
                sender_street: '',
                sender_zip_city: '',
                sender_email: '',
                sender_phone: '',
                sender_address_small: '',
                sender: '', // Legacy/Blob Fallback

                // Recipient (Structured)
                recipient_company: '',
                recipient_salut_type: 'none', // [V9] female, male, family, or none
                recipient_name: '',
                recipient_street: '',
                recipient_zip: '',
                recipient_city: '',
                recipient_country: '',
                recipient: '', // Legacy/Blob Fallback

                // Meta
                special_notes: '',
                location: '',

                // Infoblock
                info_your_ref: '',
                info_your_msg_date: '',
                info_our_ref: '',
                info_contact_person: '',
                info_phone: '',
                info_email: '',
                info_date: '', // V9 specific
                date: '', // Legacy sync

                // Content
                subject: '',
                salutation: '',
                body: '',
                greeting: '',

                // Signature & Footer
                signature_name: '',
                signature_role: '',
                signature: '', // Legacy

                attachment_hint: '',
                attachments: '',

                footer_col1: '',
                footer_col2: '',
                footer_col3: ''
            }
        };
    },

    /**
     * LOAD LOGIC (LocalStorage Only)
     */
    loadLocal: async function() {
        let data = null;

        try {
            const raw = localStorage.getItem(this.C.STORAGE.DATA);
            if (raw) data = JSON.parse(raw);
        } catch (e) {
            if (window.App.Logger) window.App.Logger.warn('Storage', `Read Error: ${e.message}`);
        }

        if (!data) return this.getDefaultSchema();

        // Version Check & Migration Pipeline
        const currentVer = data._version || 0;
        const targetVer = this.C.SCHEMA_VERSION;

        if (currentVer === targetVer) {
            // [MIGRATION-HOTFIX] Ensure new fields exist even if version matches (development safety)
            return this.salvage(data);
        }

        if (currentVer < targetVer) {
            if (window.App.Logger) window.App.Logger.log('Storage', `⚡ Migrating Data: V${currentVer} -> V${targetVer}`);

            let migratedData = data;

            // Sequential Migration Chain
            // Example: V8 -> V9
            if (currentVer < 9) {
                migratedData = this._migrateToV9(migratedData);
            }

            // Final Safety Net
            migratedData = this.salvage(migratedData);

            migratedData._version = targetVer;
            this.saveLocal(migratedData);
            return migratedData;
        }

        return this.salvage(data);
    },

    /**
     * [DIN-MIGRATE-V9]
     * Non-destructive migration to preserve custom fields/plugins.
     */
    _migrateToV9: function(oldData) {
        const defaults = this.getDefaultSchema();

        // Non-destructive Merge: Spread oldData first, then apply defaults structure
        const migrated = {
            ...oldData, // Preserve unknown root props
            config: { ...defaults.config, ...(oldData.config || {}) }, // Merge Config
            content: { ...defaults.content, ...(oldData.content || {}) }, // Merge Content
            _version: 9
        };

        // Logic: Map Legacy Boolean to Enum
        if (oldData.config && oldData.config.useFormA === true) {
            migrated.config.layout = this.C.LAYOUTS.FORM_A;
        }

        // [MIGRATION] Recipient Split Logic (Naive)
        if (oldData.content && oldData.content.recipient && !migrated.content.recipient_name) {
             // Put old blob into name field so user doesn't lose data
             migrated.content.recipient_name = oldData.content.recipient;
        }

        return migrated;
    },

    /**
     * [DIN-DATA-SALVAGE]
     * Last resort: repairs broken structures by merging into default.
     */
    salvage: function(data) {
        const fresh = this.getDefaultSchema();
        if (data && data.content) {
            Object.keys(fresh.content).forEach(key => {
                // Keep existing string values from file
                if (data.content[key] !== undefined && data.content[key] !== null) {
                    fresh.content[key] = data.content[key];
                }
            });
            // Handle split recipient fix if fields are missing in object but exist in default
            if (!data.content.recipient_name && data.content.recipient) {
                 fresh.content.recipient_name = data.content.recipient;
            }
        }
        if (data && data.config) {
            const safeKeys = ['layout', 'provider', 'apiKey', 'dateFormat', 'formality', 'font'];
            safeKeys.forEach(key => {
                if (data.config[key]) fresh.config[key] = data.config[key];
            });
        }
        fresh._version = this.C.SCHEMA_VERSION;
        return fresh;
    },

    /**
     * SAVE LOGIC (LocalStorage with Quota Guard)
     */
    saveLocal: async function(data) {
        if (!data) return false;
        data._version = this.C.SCHEMA_VERSION;

        try {
            localStorage.setItem(this.C.STORAGE.DATA, JSON.stringify(data));
            return true;
        } catch (e) {
            // [DIN.SYS.STABL.QUOTA] Handle Storage Full
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                if (window.App.Logger) window.App.Logger.warn('Storage', 'Quota exceeded. Purging logs.');

                // Emergency Purge: Clear Crash Logs to free space
                localStorage.removeItem(this.C.STORAGE.LOGS);

                try {
                    // Retry Save
                    localStorage.setItem(this.C.STORAGE.DATA, JSON.stringify(data));
                    return true;
                } catch (retry) {
                    if (window.App.Logger) window.App.Logger.error('Storage', 'Critical: Storage completely full.');
                    return false;
                }
            }
            return false;
        }
    },

    /**
     * Interface Compatibility Alias
     */
    validateAndRepair: function(data) {
        if (data && data._version === this.C.SCHEMA_VERSION) {
            // Even if version matches, run salvage to ensure new keys are present
            return this.salvage(data);
        }
        return this.salvage(data);
    },

    // --- Auxiliary Data (Profile, Contacts) ---

    saveProfile: function(profileData) {
        try {
            const valid = ['company', 'name', 'street', 'zip', 'city', 'phone', 'email', 'iban', 'coords'];
            const clean = {};
            valid.forEach(k => { if (profileData[k] !== undefined) clean[k] = profileData[k]; });
            localStorage.setItem(this.C.STORAGE.PROFILE, JSON.stringify(clean));
            return true;
        } catch(e) { return false; }
    },

    loadProfile: function() {
        try {
            const raw = localStorage.getItem(this.C.STORAGE.PROFILE);
            return raw ? JSON.parse(raw) : {};
        } catch(e) { return {}; }
    },

    getContacts: function() {
        try {
            return JSON.parse(localStorage.getItem(this.C.STORAGE.CONTACTS) || '[]');
        } catch(e) { return []; }
    },

    saveContact: function(fullText) {
        try {
            const list = this.getContacts();
            const text = (fullText || '').trim();
            if (!text) return false;
            if (list.some(c => c.fullText === text)) return false;

            list.unshift({
                id: Date.now().toString(36),
                fullText: text,
                firstLine: text.split('\n')[0].substring(0, 60),
                addedAt: Date.now()
            });

            // Limit address book
            const limit = this.C.LIMITS ? this.C.LIMITS.MAX_CONTACTS : 100;
            if (list.length > limit) list.pop();

            localStorage.setItem(this.C.STORAGE.CONTACTS, JSON.stringify(list));
            return true;
        } catch (e) { return false; }
    },

    searchContacts: function(query) {
        if (!query || query.length < 2) return [];
        const q = query.toLowerCase();
        return this.getContacts()
            .filter(c => c.fullText.toLowerCase().includes(q))
            .map(c => ({
                display: `⭐ ${c.firstLine}`,
                insertion: c.fullText,
                type: 'local'
            }));
    },

    findContactExact: function(text) {
        const list = this.getContacts();
        return list.find(c => c.fullText.trim() === (text || '').trim());
    },

    deleteContact: function(text) {
        const list = this.getContacts().filter(c => c.fullText.trim() !== (text || '').trim());
        localStorage.setItem(this.C.STORAGE.CONTACTS, JSON.stringify(list));
    },

    exportToJSON: function(data) {
        try {
            // [SECURITY] Deep clone to ensure we don't mask the live state in RAM
            const clone = JSON.parse(JSON.stringify(data));

            // Mask API Key if present
            if (clone.config && clone.config.apiKey && clone.config.apiKey.length > 5) {
                clone.config.apiKey = "*** (Masked)";
            }

            clone._version = this.C.SCHEMA_VERSION;
            let name = 'Brief_Entwurf';
            if (clone.content && clone.content.subject) {
                // Sanitize filename [DIN-UX-FILENAME]
                const sub = clone.content.subject.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '').trim().replace(/\s+/g, '_');
                if (sub) name = `Brief_${sub}`;
            }
            // Strict ISO Date Prefix
            const datePrefix = new Date().toISOString().split('T')[0];
            const fullName = `${datePrefix}_${name}.json`;

            const blob = new Blob([JSON.stringify(clone, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fullName;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (e) { return false; }
    }
};
</script>

    <!-- State & Controllers -->
    <script>
/* SOURCE: js/core/state.js */
/**
 * > File: js/core/state.js
 * > Role: Atomic State Manager (Reactivity Engine)
 * > Spec: [DIN.SYS.STATE.PROXY]
 * > Dep:  None (Core)
 * -----------------------------------------------------------------------------
 * Implements a Proxy-based state store that automatically synchronizes
 * Data -> DOM and Data -> Storage.
 */

window.App = window.App || {};

class StateManager {
    constructor() {
        this.listeners = [];
        this.bindings = new Map(); // key -> domID
        this.isUpdating = false; // [SECURITY] Re-entrancy Guard

        // Internal storage for state
        this._state = {
            config: {},
            content: {}
        };

        // Create Proxies
        this.config = this._createProxy(this._state.config, 'config');
        this.content = this._createProxy(this._state.content, 'content');
    }

    /**
     * Creates a Proxy to trap assignments.
     * @param {Object} targetObj - The object to proxy
     * @param {string} scope - 'config' or 'content'
     */
    _createProxy(targetObj, scope) {
        const self = this;
        return new Proxy(targetObj, {
            set(target, property, value) {
                // [SECURITY] Infinite Loop Guard
                if (self.isUpdating) {
                    target[property] = value;
                    return true;
                }

                self.isUpdating = true;

                // 1. Assign Value
                target[property] = value;

                // 2. Notify DOM (Binding)
                self._updateDOM(scope, property, value);

                // 3. Notify Listeners (Auto-Save, etc.)
                self._notify(scope, property, value);

                self.isUpdating = false;
                return true;
            }
        });
    }

    /**
     * Binds a State Key to a DOM Element.
     * @param {string} scope - 'config' or 'content'
     * @param {string} key - e.g. 'sender'
     * @param {string} domId - e.g. 'sender-block'
     */
    bind(scope, key, domId) {
        this.bindings.set(`${scope}.${key}`, domId);
    }

    /**
     * Updates the DOM element if it exists and isn't currently focused.
     * Prevents cursor jumping in contenteditable fields.
     */
    _updateDOM(scope, key, value) {
        const domId = this.bindings.get(`${scope}.${key}`);
        if (!domId) return;

        const el = document.getElementById(domId);
        if (!el) return;

        // CRITICAL: Do not update if this element has focus (user is typing)
        if (document.activeElement === el) return;

        // Logic for different element types
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = value;
            } else {
                el.value = value || '';
            }
        } else {
            // ContentEditable or Standard Div
            el.innerText = value || '';
        }
    }

    _notify(scope, property, value) {
        this.listeners.forEach(fn => fn(scope, property, value));
    }

    /**
     * Subscribes to state changes.
     * @param {Function} callback - fn(scope, key, value)
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * Bulk loads data into the state without triggering individual saves,
     * but DOES trigger DOM updates.
     * @param {Object} fullState
     */
    load(fullState) {
        // We manually assign properties to trigger the Proxy setters one by one
        // so the DOM updates.
        if (fullState.config) {
            Object.keys(fullState.config).forEach(k => {
                this.config[k] = fullState.config[k];
            });
        }
        if (fullState.content) {
            Object.keys(fullState.content).forEach(k => {
                this.content[k] = fullState.content[k];
            });
        }
    }

    /**
     * Returns a clean JSON copy of the current state.
     */
    serialize() {
        return window.App.Utils.deepClone(this._state);
    }
}

// Singleton Instance
window.App.State = new StateManager();
</script>
    <script>
/* SOURCE: js/controllers/settings-controller.js */
/**
 * > File: js/controllers/settings-controller.js
 * > Role: Sidebar & Configuration Controller (The Cockpit)
 * > Spec: [DIN.UI.CTRL.SETTINGS]
 * > Dep:  App.Constants, App.State
 * -----------------------------------------------------------------------------
 * Handles all sidebar inputs, visibility toggles, and state updates.
 */

window.App = window.App || {};
window.App.Controllers = window.App.Controllers || {};

window.App.Controllers.SettingsController = class SettingsController {
    constructor() {
        this.C = window.App.Constants;

        // DOM Definitions (Local Constants)
        this.DOM = {
            LAYOUT_NAME: 'layout',
            PROVIDER_NAME: 'provider',
            // FONT Removed from UI but Logic remains
            DATE_FORMAT_NAME: 'dateFormat', // [TASK 5]
            API_KEY: 'setting-apikey',
            API_KEY_GROUP: 'group-api-key',
            FORMALITY_NAME: 'formality',
            RECIPIENT_TYPE_NAME: 'recipientType',
            BTN_RESET_KEY: 'btn-reset-key',
            LBL_GEOAPIFY: 'lbl-geoapify',
            LBL_DATE_DE: 'lbl-date-de',
            LBL_DATE_LONG: 'lbl-date-long',
            LBL_DATE_ISO: 'lbl-date-iso',
            NATIVE_PICKER: 'native-date-picker'
        };

        this.els = {
            layoutRadios: document.querySelectorAll(`input[name="${this.DOM.LAYOUT_NAME}"]`),
            providerRadios: document.querySelectorAll(`input[name="${this.DOM.PROVIDER_NAME}"]`),
            dateFormatRadios: document.querySelectorAll(`input[name="${this.DOM.DATE_FORMAT_NAME}"]`),
            lblDateDe: document.getElementById(this.DOM.LBL_DATE_DE),
            lblDateLong: document.getElementById(this.DOM.LBL_DATE_LONG),
            lblDateIso: document.getElementById(this.DOM.LBL_DATE_ISO),
            nativePicker: document.getElementById(this.DOM.NATIVE_PICKER),

            apiKey: document.getElementById(this.DOM.API_KEY),
            apiKeyGroup: document.getElementById(this.DOM.API_KEY_GROUP),
            formalityRadios: document.querySelectorAll(`input[name="${this.DOM.FORMALITY_NAME}"]`),
            recipientRadios: document.querySelectorAll(`input[name="${this.DOM.RECIPIENT_TYPE_NAME}"]`),
            btnResetKey: document.getElementById(this.DOM.BTN_RESET_KEY),
            lblGeoapify: document.getElementById(this.DOM.LBL_GEOAPIFY)
        };

        // [TASK 1] Heartbeat Timer
        this.validationTimer = null;
        this.keyValidationDebounce = null;
    }

    init() {
        this.refreshDateOptions(new Date()); // Shows Today's date as preview
        this.attachListeners();

        // [TASK 1] Initialize Lifecycle Check
        this.checkKeyStatus(true); // Startup Check
        this.startValidationHeartbeat();

        // [TASK 2] Init Smart Placeholders
        const initialFormality = window.App.State.config.formality || 'formal';
        this.updateSmartPlaceholders(initialFormality);
    }

    // [REFACTOR] Shadowed checkKeyStatus() method removed.
    // Logic consolidated in the method definition below (Line 397).

    /**
     * [TASK 3] Dynamically update Geoapify Option Text (Radio Label)
     */
    updateProviderOptions(hasKey) {
        if (!this.els.lblGeoapify) return;

        const base = `Geoapify<small>`;
        const suffix = hasKey ? "API ✅" : "API ❌";
        this.els.lblGeoapify.innerHTML = `${base}${suffix}</small>`;
    }

    /**
     * [TASK 1] Conditional Heartbeat
     * Only validates if Geoapify is active AND a key exists.
     */
    startValidationHeartbeat() {
        if (this.validationTimer) clearInterval(this.validationTimer);
        // Check every 60 minutes (3600000 ms)
        this.validationTimer = setInterval(() => {
            const config = window.App.State.config;
            // GUARD CLAUSE: Only run if strictly necessary
            if (config.provider === 'geoapify' && config.apiKey) {
                this.checkKeyStatus(false);
            }
        }, 60 * 60 * 1000);
    }

    setKeyState(status) {
        if (!this.els.apiKeyGroup) return;

        if (status === 'valid') {
            this.els.apiKeyGroup.classList.add('key-set');
            this.els.apiKey.classList.remove('invalid-shake');
        } else if (status === 'invalid') {
            this.els.apiKeyGroup.classList.remove('key-set');
            this.els.apiKeyGroup.classList.remove('hidden'); // Ensure visible
            // Trigger Shake Animation
            this.els.apiKey.classList.remove('invalid-shake');
            void this.els.apiKey.offsetWidth; // Force Reflow
            this.els.apiKey.classList.add('invalid-shake');
        } else {
            // Missing or reset
            this.els.apiKeyGroup.classList.remove('key-set');
            this.els.apiKey.classList.remove('invalid-shake');
        }
    }

    refreshDateOptions(dateObj) {
        const d = dateObj instanceof Date && !isNaN(dateObj) ? dateObj : new Date();
        const fmt = window.App.Formatter;

        if (!fmt) {
            console.warn('[Settings] Formatter missing during date refresh.');
            return;
        }

        const setText = (el, val) => {
            if (el) el.textContent = val;
            else console.warn('[Settings] Missing Date Label Element');
        };

        if (this.els.lblDateDe) setText(this.els.lblDateDe, fmt.getFormattedDate(d, 'de'));
        if (this.els.lblDateLong) {
            // [UX] Strip Year for compact button label (User Req) e.g. "16. Januar 2026" -> "16. Januar"
            const longText = fmt.getFormattedDate(d, 'long');
            const shortText = longText.replace(/\s\d{4}$/, '');
            setText(this.els.lblDateLong, shortText);
        }
        if (this.els.lblDateIso) setText(this.els.lblDateIso, fmt.getFormattedDate(d, 'iso'));
    }

    attachListeners() {
        // Layout (Radios)
        this.els.layoutRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if(e.target.checked) this.setPaperLayout(e.target.value);
            });
        });

        // Provider (Radios)
        this.els.providerRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if(e.target.checked) this.setProvider(e.target.value);
            });
        });

        // Date Format (Radios)
        this.els.dateFormatRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if(e.target.checked) this.setDateFormat(e.target.value);
            });
        });

        // Native Date Picker (Change Logic)
        if (this.els.nativePicker) {
            this.els.nativePicker.addEventListener('input', (e) => {
                const val = e.target.value; // YYYY-MM-DD
                if (val) {
                    const dateObj = new Date(val);
                    const currentFormat = window.App.State.config.dateFormat || 'de';
                    if (window.App.Formatter) {
                        const formatted = window.App.Formatter.getFormattedDate(dateObj, currentFormat);
                        window.App.State.content.date = formatted;
                        window.App.State.content.info_date = formatted;
                        // Determine target field
                        const elInfoDate = document.getElementById('info-date');
                        if (elInfoDate) elInfoDate.innerText = formatted;
                    }
                }
            });
        }

        // Formality (Radios)
        this.els.formalityRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) this.setFormality(e.target.value);
            });
        });

        // Recipient Type (Radios)
        this.els.recipientRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
        if (e.target.checked) {
                     window.App.State.content.recipient_salut_type = e.target.value;
                     if (window.App.Core) {
                         // [FIX] Explicit Call: Name, Manual=Null, Force=True
                         window.App.Core.handleSmartGreeting(window.App.State.content.recipient_name, null, true);
                     }
                 }
            });
        });

        // API Key Input (Debounced Validation)
        if (this.els.apiKey) {
            this.keyValidationDebounce = window.App.Utils.debounce(async (val) => {
                window.App.State.config.apiKey = val;
                this.updateProviderOptions(!!val); // Immediate visual feedback
                this.updateVisibility(); // [FIX] Toggle Button immediately
                if (val.length > 10) {
                    await this.checkKeyStatus(false);
                }
            }, 800);

            this.els.apiKey.addEventListener('input', (e) => {
                this.keyValidationDebounce(e.target.value);
            });
        }

        // [TASK 2] Reset Key Button + Safety Fallback
        if (this.els.btnResetKey) {
            this.els.btnResetKey.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.els.apiKey) {
                    this.els.apiKey.value = '';
                    window.App.State.config.apiKey = '';

                    // SAFETY FALLBACK: Switch back to Photon immediately
                    window.App.State.config.provider = 'photon';
                    // Update Radio UI check
                    const pRadio = document.querySelector(`input[name="${this.DOM.PROVIDER_NAME}"][value="photon"]`);
                    if(pRadio) pRadio.checked = true;

                    this.setKeyState('missing');
                    this.updateVisibility();
                    this.updateProviderOptions(false); // Reset Indicator

                    if (window.App.Core && window.App.Core.ui) {
                        window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.API_RESET, 'info');
                    }
                }
            });
        }
    }

    /* --- Public API (Testable) --- */

    setPaperLayout(layoutKey) {
        window.App.State.config.layout = layoutKey;
    }

    setProvider(providerKey) {
        window.App.State.config.provider = providerKey;
        this.updateVisibility();

        // [TASK 1] Immediate validation when switching TO Geoapify
        if (providerKey === 'geoapify') {
            this.checkKeyStatus(false);
        }
    }

    setDateFormat(formatKey) {
        window.App.State.config.dateFormat = formatKey;

        // [FIX] Robust Date Re-Formatting
        // 1. Try to read current ISO attribute (if implemented) or parse current text
        // Note: For now we parse the text because we don't store ISO separately yet.
        const currentStr = window.App.State.content.date || window.App.State.content.info_date;
        let dateObj = new Date(); // Default to Today

        if (currentStr && currentStr.trim()) {
            const iso = window.App.Formatter.toISODate(currentStr);
            if (iso) {
                dateObj = new Date(iso);
            } else {
                // If we can't parse it, maybe it is a custom text.
                // But user wants "Dropdown -> Heutiges Datum" fallback?
                // Logic: parsing failed -> reset to today? Or keep custom text?
                // User said: "Dropdown --> Heutiges Datum" (implied if empty or invalid)
                if (window.App.Core && window.App.Logger) window.App.Logger.warn('Settings', 'Date Parse Failed -> Resetting to Today');
            }
        }

        if (window.App.Formatter) {
            const formatted = window.App.Formatter.getFormattedDate(dateObj, formatKey);

            // Update both fields (Legacy & V9)
            window.App.State.content.date = formatted;
            // [DEPRECATED] info_date removed in favor of 'date'

            // Force UI update if binding doesn't catch it immediately (it should, but safety first)
            const elInfoDate = document.getElementById('info-date');
            if (elInfoDate) elInfoDate.innerText = formatted;
        }
    }

    setFormality(level) {
        if (window.App.Logger) window.App.Logger.info('SettingsController', `Set Formality: [${level}]`);
        window.App.State.config.formality = level;
        this.updateSmartPlaceholders(level);
        // Calls Core Logic to update Text if not dirty
        if (window.App.Core) {
            // [FIX] Sidebar Authority: Name, Manual=Null, Force=True
            window.App.Core.handleSmartGreeting(window.App.State.content.recipient_name, null, true);
        } else {
             console.warn('[SettingsController] App.Core missing');
        }
    }

    setFontStack(fontKey) {
        window.App.State.config.font = fontKey;
    }

    /**
     * [TASK 3] Updated to match Strict V9 Salutation Matrix
     */
    updateSmartPlaceholders(level) {
        const placeholders = {
            formal: {
                salutation: "Sehr geehrte Damen und Herren,",
                greeting: "Mit freundlichen Grüßen"
            },
            polite: {
                salutation: "Guten Tag,",
                greeting: "Freundliche Grüße"
            },
            casual: {
                salutation: "Hallo zusammen,",
                greeting: "Viele Grüße"
            }
        };

        const current = placeholders[level] || placeholders.formal;
        const elSalutation = document.getElementById('letter-salutation');
        const elGreeting = document.getElementById('letter-greeting');

        if (elSalutation) elSalutation.dataset.placeholder = current.salutation;
        if (elGreeting) elGreeting.dataset.placeholder = current.greeting;
    }

    updateVisibility() {
        if (!this.els.apiKeyGroup) return;
        const isGeoapify = window.App.State.config.provider === this.C.PROVIDERS.GEOAPIFY;

        if (isGeoapify) {
            // Check if key is already valid to decide visibility
            this.els.apiKeyGroup.classList.remove('hidden');
            this.els.apiKeyGroup.style.display = ''; // Remove inline hide
        } else {
            this.els.apiKeyGroup.classList.add('hidden');
            this.els.apiKeyGroup.style.display = 'none'; // Force hiding
        }

        // [TASK] Toggle Reset Button based on Key Existence
        if (this.els.btnResetKey) {
             const hasKey = window.App.State.config.apiKey && window.App.State.config.apiKey.length > 0;
             if (hasKey) {
                 this.els.btnResetKey.classList.remove('hidden');
                 this.els.btnResetKey.style.display = '';
             } else {
                 this.els.btnResetKey.classList.add('hidden');
                 this.els.btnResetKey.style.display = 'none';
             }
        }
    }

    checkKeyStatus(force) {
        if (window.App.State.config.provider !== 'geoapify') return;

        const key = this.els.apiKey ? this.els.apiKey.value.trim() : '';
        if (!key) {
            this.setKeyState('missing');
            return;
        }

        // Debounce or Force
        if (!force && this._keyCheckTimeout) return;

        if (window.App.API) {
            window.App.API.validateKey(key).then(isValid => {
                this.setKeyState(isValid ? 'valid' : 'invalid');

                // [TASK 1] Heartbeat Logic for State JSON
                window.App.State.config.apiKeyValid = isValid;
                window.App.State.config.apiHeartbeat = new Date().toISOString();

                if (!isValid && window.App.Core && window.App.Core.ui) {
                     window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.API_ERROR, 'error');
                }

            }).catch(() => {
                this.setKeyState('error');
                window.App.State.config.apiKeyValid = false;
                window.App.State.config.apiHeartbeat = new Date().toISOString();
                if (window.App.Core && window.App.Core.ui) {
                     window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.API_ERROR, 'error');
                }
            });
        }
    }

    setKeyState(status) {
        const el = this.els.apiKey;
        if (!el) return;

        // Reset classes
        el.classList.remove('valid', 'invalid', 'loading');

        if (status === 'valid') el.classList.add('valid');
        if (status === 'invalid') el.classList.add('invalid');
        // 'missing' or 'error' might just be default
    }

    syncUI(config) {
        if (!config) return;

        // ... (existing syncUI code start)
        // Sync Radio Buttons
        if (this.els.layoutRadios) {
             const layoutVal = config.layout || this.C.LAYOUTS.FORM_A;
             this.els.layoutRadios.forEach(r => {
                 r.checked = (r.value === layoutVal);
             });
        }

        if (this.els.providerRadios) {
             const provVal = config.provider || this.C.PROVIDERS.PHOTON;
             this.els.providerRadios.forEach(r => {
                 r.checked = (r.value === provVal);
             });
        }

        if (this.els.dateFormatRadios) {
             const dateVal = config.dateFormat || this.C.DATE_FORMATS.DE;
             this.els.dateFormatRadios.forEach(r => {
                 r.checked = (r.value === dateVal);
             });
        }

        if (this.els.apiKey) this.els.apiKey.value = config.apiKey || '';

        const formality = config.formality || this.C.FORMALITY.FORMAL;
        const radio = document.querySelector(`input[name="${this.DOM.FORMALITY_NAME}"][value="${formality}"]`);
        if (radio) radio.checked = true;

        if (this.els.recipientRadios) {
             const recVal = window.App.State.content.recipient_salut_type || 'none';
             this.els.recipientRadios.forEach(r => {
                 r.checked = (r.value === recVal);
             });
        }

        this.updateVisibility();
        this.checkKeyStatus(true); // Now defined!
        this.updateSmartPlaceholders(formality);
    }
};
</script>
    <script>
/* SOURCE: js/controllers/document-controller.js */
/**
 * > File: js/controllers/document-controller.js
 * > Role: Document & Paper Controller (The Canvas)
 * > Spec: [DIN.UI.CTRL.DOC]
 * > Dep:  App.Constants, App.State
 * -----------------------------------------------------------------------------
 * Handles the A4 page interactions, editing events, zooming, and printing.
 */

window.App = window.App || {};
window.App.Controllers = window.App.Controllers || {};

window.App.Controllers.DocumentController = class DocumentController {
    constructor() {
        this.C = window.App.Constants;

        // DOM Definitions
        // Note: Some V9 fields might be missing in "Clean UI" mode.
        // The binder must handle null elements gracefully.
        this.DOM = {
            SHELL: 'brief-container',
            SHEET: 'sheet',

            // ZONE 1: SENDER
            SENDER_COMPANY: 'sender-company',
            SENDER_NAME: 'sender-name',
            SENDER_STREET: 'sender-street',
            SENDER_ZIP_CITY: 'sender-zip-city',
            SENDER_PHONE: 'sender-phone',
            SENDER_EMAIL: 'sender-email',
            SENDER_SMALL: 'sender-address-small', // [TASK 4] ID Standardized

            // ZONE 2: NOTES
            SPECIAL_NOTES: 'special-notes',

            // ZONE 3: RECIPIENT
            RECIPIENT_COMPANY: 'recipient-company',
            RECIPIENT_SALUTATION: 'recipient-salutation', // [FIX] Added missing field
            RECIPIENT_NAME: 'recipient-name',
            RECIPIENT_STREET: 'recipient-street',
            RECIPIENT_ZIP: 'recipient-zip',
            RECIPIENT_CITY: 'recipient-city',
            RECIPIENT_COUNTRY: 'recipient-country',

            // ZONE 4: INFOBLOCK (V9 Fields - might be missing in UI)
            INFO_YOUR_REF: 'info-your-ref',
            INFO_YOUR_MSG: 'info-your-msg-date',
            INFO_OUR_REF: 'info-our-ref',
            INFO_CONTACT: 'info-contact-person',
            INFO_PHONE: 'info-phone',
            INFO_EMAIL: 'info-email',
            INFO_DATE: 'info-date', // Critical

            // ZONE 5: CONTENT
            SUBJECT: 'subject-line',
            SALUTATION: 'letter-salutation',
            BODY: 'letter-body',
            GREETING: 'letter-greeting',

            // ZONE 6: SIG & ATTACH
            SIG_COMP: 'signature-company', // [TASK 6]
            SIG_PREFIX: 'signature-prefix', // [TASK 6]
            SIG_NAME: 'signature-name',
            SIG_ROLE: 'signature-role',
            ATTACH_HINT: 'attachment-hint',
            ATTACH_LIST: 'attachments-list',

            // ZONE 7: FOOTER
            FOOTER_1: 'footer-col1',
            FOOTER_2: 'footer-col2',
            FOOTER_3: 'footer-col3',

            // UI
            AUTOCOMPLETE: 'autocomplete-results',
            BTN_PRINT: 'btn-print',
            INPUT_DATE: 'native-date-picker'
        };

        this.els = {}; // Populated in init

        this.onRecipientNameInput = null;
        this._overflowTimeout = null;
        this.isSalutationDirty = false;
        this.isSalutationDirty = false;
        this.isDateDirty = false; // [DIN.LOGIC.AUTO.GUARD]
        this.isSignatureDirty = false; // [TASK 6]
    }

    init() {
        this.cacheElements();
        this.attachEditors();
        this.attachPrint();
        this.initViewportLogic();
        this.attachOverflowGuard();
        this.attachDateLogic();
    }

    cacheElements() {
        Object.keys(this.DOM).forEach(key => {
            this.els[key] = document.getElementById(this.DOM[key]);
        });
        this.els.sheet = document.getElementById('sheet');
        this.els.container = document.getElementById('brief-container');
    }

    attachEditors() {
        // [ROBUSTNESS] Safe Binding with strict null check
        const bindInput = (el, stateKey) => {
            if (el) {
                el.addEventListener('input', (e) => {
                    const text = e.target.innerText;
                    window.App.State.content[stateKey] = text;

                    // [TASK 2] The Toast Guard
                    if (stateKey === 'sender_address_small' && text.length > 85) {
                        // Warn user visually + Toast
                        e.target.style.color = 'var(--c-danger)';
                        if (window.App.Core && window.App.Core.ui) {
                            // Debounce the toast so it doesn't spam on every keystroke
                            if (!this._toastGuardDebounce) {
                                window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.TEXT_OVERFLOW, 'error', 2000);
                                this._toastGuardDebounce = setTimeout(() => { this._toastGuardDebounce = null; }, 2000);
                            }
                        }
                    } else if (stateKey === 'sender_address_small') {
                        e.target.style.color = ''; // Reset color
                    }
                });
            }
        };

        // --- BINDING ZONE 1: SENDER ---
        bindInput(this.els.SENDER_COMPANY, 'sender_company');
        bindInput(this.els.SENDER_NAME, 'sender_name');
        bindInput(this.els.SENDER_STREET, 'sender_street');
        bindInput(this.els.SENDER_ZIP_CITY, 'sender_zip_city');
        bindInput(this.els.SENDER_PHONE, 'sender_phone');
        bindInput(this.els.SENDER_EMAIL, 'sender_email');
        bindInput(this.els.SENDER_SMALL, 'sender_address_small');

        // --- BINDING ZONE 2: NOTES ---
        bindInput(this.els.SPECIAL_NOTES, 'special_notes');

        // --- BINDING ZONE 3: RECIPIENT ---
        bindInput(this.els.RECIPIENT_COMPANY, 'recipient_company');

        // [FIX] Targeted Binding with Callback
        if (this.els.RECIPIENT_SALUTATION) {
            this.els.RECIPIENT_SALUTATION.addEventListener('input', (e) => {
                const val = e.target.innerText;
                window.App.State.content.recipient_salutation = val;
                this.isSalutationDirty = true; // User edited manually
                if (typeof this.onRecipientSalutationInput === 'function') {
                    this.onRecipientSalutationInput(val);
                }
            });
        }

        bindInput(this.els.RECIPIENT_STREET, 'recipient_street');
        bindInput(this.els.RECIPIENT_ZIP, 'recipient_zip');
        bindInput(this.els.RECIPIENT_CITY, 'recipient_city');
        bindInput(this.els.RECIPIENT_COUNTRY, 'recipient_country');

        if (this.els.RECIPIENT_NAME) {
            this.els.RECIPIENT_NAME.addEventListener('input', (e) => {
                window.App.State.content.recipient_name = e.target.innerText;
                if (typeof this.onRecipientNameInput === 'function') {
                    this.onRecipientNameInput(e.target.innerText);
                }
            });
        }

        // --- BINDING ZONE 4: INFOBLOCK (Safe Binding) ---
        bindInput(this.els.INFO_YOUR_REF, 'info_your_ref');
        bindInput(this.els.INFO_YOUR_MSG, 'info_your_msg_date');
        bindInput(this.els.INFO_OUR_REF, 'info_our_ref');
        bindInput(this.els.INFO_CONTACT, 'info_contact_person');
        bindInput(this.els.INFO_PHONE, 'info_phone');
        bindInput(this.els.INFO_EMAIL, 'info_email');
        // DATE handled via bindInput AND special handler below
        // [FIX] Consolidate to single State Key 'date' (replaces 'info_date')
        bindInput(this.els.INFO_DATE, 'date');

        // --- BINDING ZONE 5: CONTENT ---
        bindInput(this.els.BODY, 'body');
        bindInput(this.els.GREETING, 'greeting');

        // --- BINDING ZONE 6: SIG ---
        bindInput(this.els.SIG_COMP, 'signature_company'); // [TASK 6]
        bindInput(this.els.SIG_NAME, 'signature_name');
        bindInput(this.els.SIG_ROLE, 'signature_role');
        bindInput(this.els.ATTACH_HINT, 'attachment_hint');
        bindInput(this.els.ATTACH_LIST, 'attachments');

        // [TASK 6] Signature Dirty Logic (Manual Edits protect against Auto-Fill)
        const monitorSignature = (el) => {
            if (el) el.addEventListener('input', () => this.isSignatureDirty = true);
        };
        monitorSignature(this.els.SIG_COMP);

        // --- BINDING ZONE 7: FOOTER ---
        bindInput(this.els.FOOTER_1, 'footer_col1');
        bindInput(this.els.FOOTER_2, 'footer_col2');
        bindInput(this.els.FOOTER_3, 'footer_col3');

        // --- SPECIAL FORMATTERS ---

        // IBAN Formatter
        if (this.els.FOOTER_2) {
            this.els.FOOTER_2.addEventListener('blur', (e) => {
                const text = e.target.innerText;
                const formatted = window.App.Formatter.formatIBANInBlock(text);
                if (formatted !== text) {
                    e.target.innerText = formatted;
                    window.App.State.content.footer_col2 = formatted;
                }
            });
        }

        // International ZIP Hint
        if (this.els.RECIPIENT_ZIP) {
            this.els.RECIPIENT_ZIP.addEventListener('blur', (e) => {
                const val = e.target.innerText.trim();
                if (/^\d+$/.test(val) && val.length !== 5) {
                    if (window.App.Core && window.App.Core.ui) {
                        window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.ZIP_WARN, "info");
                    }
                }
            });
        }

        // Salutation: Track Manual Edits
        if (this.els.SALUTATION) {
            this.els.SALUTATION.addEventListener('input', (e) => {
                this.isSalutationDirty = true;
                window.App.State.content.salutation = e.target.innerText;
            });
        }

        // Subject Line Cleaning
        if (this.els.SUBJECT) {
            this.els.SUBJECT.addEventListener('input', (e) => {
                const raw = e.target.innerText;
                const triggerRegex = /^(\s*Betreff:?|\s*Betr\.?:?)\s+/i;
                if (triggerRegex.test(raw)) {
                    const clean = raw.replace(triggerRegex, '');
                    e.target.innerText = clean;
                    window.App.State.content.subject = clean;
                    if (window.App.Core && window.App.Core.ui) {
                        // [CLEANUP] Silent Log instead of Toast
                        if (window.App.Logger) window.App.Logger.info('DIN', 'Betreff Prefix removed');
                    }
                } else {
                    window.App.State.content.subject = raw;
                }
            });
        }

        // Date Handling (Specific logic for padding and guarding)
        if (this.els.INFO_DATE) {
            // [DIN.LOGIC.AUTO.GUARD] Date User Sovereignty
            this.els.INFO_DATE.addEventListener('input', () => {
                this.isDateDirty = true;
            });

            this.els.INFO_DATE.addEventListener('blur', (e) => {
                // [REFACTOR 2026] Delegate entirely to App Logic
                const raw = e.target.innerText.trim();
                window.App.State.content.date = raw;

                // Let App.js handle formatting, validation, and defaulting
                if (window.App.Core) window.App.Core.updateDateDisplay(false);
            });
        }

        // Monitor Overflow
        document.addEventListener('input', (e) => {
            if (e.target.isContentEditable) this.checkPageOverflow();
        });
    }

    resetDirtyState() {
        this.isSalutationDirty = false;
        this.isDateDirty = false;
    }

    attachOverflowGuard() {
        // 1. Page Page Overflow (Multi-line fields)
        const sensitiveFields = [this.els.BODY, this.els.GREETING, this.els.ATTACH_LIST];
        sensitiveFields.forEach(field => {
            if (!field) return;
            field.addEventListener('keydown', (e) => {
                const allowed = ['Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
                const isShortcut = e.ctrlKey || e.metaKey;
                if (allowed.includes(e.key) || isShortcut) return;
                if (this.isPageFull()) {
                    e.preventDefault();
                    this.triggerOverflowWarning();
                }
            });
            field.addEventListener('input', () => {
                if (this.isPageFull()) this.triggerOverflowWarning();
            });
        });

        // 2. Single Line Overflow (Strict Blocking)
        const singleLineFields = document.querySelectorAll('.single-line-field');
        singleLineFields.forEach(field => {
            field.addEventListener('input', (e) => {
                // Buffer of 2px for sub-pixel rendering differences
                if (e.target.scrollWidth > e.target.clientWidth + 2) {

                    // A. Toast Warning (Debounced)
                    if (!this._overflowToastDebounce) {
                        if (window.App.Core.ui) window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.LINE_OVERFLOW, 'error', 2000);
                        this._overflowToastDebounce = true;
                        setTimeout(() => this._overflowToastDebounce = false, 2000);
                    }

                    // B. Hard Block / Undo (Aggressive Loop)
                    // Keep deleting until it fits or we run out of text
                    let safety = 0;
                    while (e.target.scrollWidth > e.target.clientWidth + 2 && safety < 50 && e.target.innerText.length > 0) {
                        try {
                             // Try native undo first if single char
                             if (safety === 0) document.execCommand('delete', false, null);
                             else {
                                 // Fallback for pasted text
                                const text = e.target.innerText;
                                e.target.innerText = text.slice(0, -1);
                             }
                        } catch (err) {
                            const text = e.target.innerText;
                            e.target.innerText = text.slice(0, -1);
                        }
                        safety++;
                    }
                }
            });

            // Prevent Enter key in single line fields
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') e.preventDefault();
            });
        });
    }

    isPageFull() {
        if (!this.els.sheet) return false;

        // A4 Height at 96 DPI is usually around 1123px.
        // We set a safety margin for the footer (approx 40mm = ~150px from bottom).
        const SAFETY_MARGIN = 150;
        const MAX_HEIGHT = 1123 - SAFETY_MARGIN;

        const contentBottom = this.els.sheet.scrollHeight; // Or check specific content wrapper

        // Better approach: Check the bounding rect of the last content element
        // relative to the sheet top.
        const attachments = document.getElementById('attachments-list');
        const body = document.getElementById('letter-body');
        const greeting = document.getElementById('letter-greeting');
        const sig = document.getElementById('signature-name');

        // Find the lowest element
        let maxBottom = 0;
        [body, greeting, sig, attachments].forEach(el => {
            if (el) {
                const rect = el.getBoundingClientRect();
                const sheetRect = this.els.sheet.getBoundingClientRect();
                const relativeBottom = rect.bottom - sheetRect.top;
                if (relativeBottom > maxBottom) maxBottom = relativeBottom;
            }
        });

        return maxBottom > MAX_HEIGHT;
    }

    triggerOverflowWarning() {
        this.els.sheet.classList.remove('flash-error');
        void this.els.sheet.offsetWidth;
        this.els.sheet.classList.add('flash-error');

        let toast = document.getElementById('overflow-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'overflow-toast';
            toast.innerHTML = '<span>🛑</span> Seite voll! Text wird abgeschnitten.';
            document.body.appendChild(toast);
        }

        toast.classList.add('visible');
        if (this._overflowTimeout) clearTimeout(this._overflowTimeout);
        this._overflowTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 2500);
    }

    attachPrint() {
        if (this.els.BTN_PRINT) {
            this.els.BTN_PRINT.addEventListener('click', () => {
                if (window.App.Core && window.App.Core.ui) {
                    window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.PRINT_PENDING, 'info');
                }
                setTimeout(() => window.print(), 500);
            });
        }
    }

    attachDateLogic() {
        if (this.els.INPUT_DATE) {
            this.els.INPUT_DATE.addEventListener('change', (e) => {
                // If user picks via Calendar, they explicitly want a change, so we might override.
                // However, technically this is also "manual input".
                // We'll trust the picker acts as a valid override.
                const val = e.target.value;
                if (val) {
                    const dateObj = new Date(val);
                    const fmt = window.App.State.config.dateFormat || 'de';
                    const formatted = window.App.Formatter.getFormattedDate(dateObj, fmt);
                    window.App.State.content.info_date = formatted;
                    this.isDateDirty = true; // User explicitly picked a date
                }
            });
        }
    }

    initViewportLogic() {
        const updateScale = () => {
            if (!this.els.container) return;
            const sidebarWidth = 300;
            const sheetWidthPx = 794;
            const padding = 80;
            const availableWidth = window.innerWidth - sidebarWidth - padding;

            if (availableWidth < sheetWidthPx) {
                const scale = Math.max(0.5, availableWidth / sheetWidthPx);
                document.documentElement.style.setProperty('--sheet-scale', scale);
                this.els.container.style.width = `${sheetWidthPx}px`;
                this.els.container.style.transform = `scale(${scale})`;
                this.els.container.style.transformOrigin = 'top center';
                const heightDiff = 1123 * (1 - scale);
                this.els.container.style.marginBottom = `-${heightDiff}px`;
            } else {
                document.documentElement.style.setProperty('--sheet-scale', 1);
                this.els.container.style.width = 'auto';
                this.els.container.style.transform = 'none';
                this.els.container.style.marginBottom = '50px';
            }
        };

        const debouncedResize = window.App.Utils.debounce(updateScale, 150);
        window.addEventListener('resize', debouncedResize);

        // [FIX] Instant execution to prevent jump, followed by RAF to catch layout settlement
        updateScale();
        requestAnimationFrame(updateScale);
        // Backup for font loading shifts
        setTimeout(updateScale, 200);
    }

    checkPageOverflow() {
        if (!this.els.sheet) return;
        if (this.els.sheet.scrollHeight > 1125) {
            this.els.sheet.classList.add('is-multipage');
        } else {
            this.els.sheet.classList.remove('is-multipage');
        }
    }

    renderSuggestions(items, onSelect) {
        const auto = document.getElementById(this.DOM.AUTOCOMPLETE);
        if (!auto) return;

        if (items.length === 0) {
            this.clearSuggestions();
            return;
        }

        let html = '';
        items.forEach((item, idx) => {
            const icon = item.type === 'local' ? '⭐' : '📍';
            html += `<div class="suggestion-item" data-idx="${idx}" role="option">
                <span class="s-icon">${icon}</span>
                <span class="s-text">${item.display}</span>
            </div>`;
        });

        auto.innerHTML = html;
        auto.style.display = 'block';

        auto.querySelectorAll('.suggestion-item').forEach(el => {
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const idx = parseInt(el.dataset.idx);
                if (items[idx] && onSelect) onSelect(items[idx].insertion);
                this.clearSuggestions();
            });
        });
    }

    clearSuggestions() {
        const auto = document.getElementById(this.DOM.AUTOCOMPLETE);
        if (auto) {
            auto.style.display = 'none';
            auto.innerHTML = '';
        }
    }
};
</script>
    <script>
/* SOURCE: js/controllers/dev-controller.js */
/**
 * > File: js/controllers/dev-controller.js
 * > Role: Manages Developer Tools (God Mode), Debug Sidebar, and Inspector
 * > Spec: [DIN.SYS.DEV.CTRL]
 * > Dep:  None (Standalone)
 * -----------------------------------------------------------------------------
 * Decoupled from UIManager to reduce bloat.
 */

window.App = window.App || {};
window.App.Controllers = window.App.Controllers || {};

window.App.Controllers.DevController = class DevController {
    constructor() {
        this.els = {
            vTag: document.querySelector('.v-tag'),
            sidebar: document.getElementById('debug-sidebar'),
            btnClose: document.getElementById('btn-debug-close'),
            btnCopy: document.getElementById('btn-debug-copy'),
            btnReset: document.getElementById('btn-debug-reset'),
            stateViewer: document.getElementById('debug-state-viewer'),
            tabs: document.querySelectorAll('.debug-tab'),
            panels: document.querySelectorAll('.debug-panel')
        };

        // Inspector State
        this._inspectorToast = null;
        this._lastHighlight = null;
        this._boundHover = this._inspectorHoverHandler.bind(this);
        this._boundExitClick = this._inspectorExitHandler.bind(this);
        this._boundEsc = (e) => { if (e.key === 'Escape') this.disableInspector(); };

        // Click Counter for Activation
        this._clickCount = 0;
        this._clickTimer = null;

        this.init();
    }

    init() {
        this.attachActivationLogic();
        this.attachSidebarLogic();
        this.attachInspectorLogic();
        this.attachToolsLogic(); // [ITER_37]

        // Restore State if active
        if (localStorage.getItem('din_dev_mode') === 'true') {
            document.body.classList.add('dev-mode-active');
            this.updateStateView();
        }

        // Listen for Global State Changes to update Viewer
        if (window.App.State && window.App.State.subscribe) {
            window.App.State.subscribe(() => {
                if (document.body.classList.contains('dev-mode-active')) {
                    this.updateStateView();
                }
            });
        }
    }

    attachActivationLogic() {
        if (!this.els.vTag) return;

        this.els.vTag.style.cursor = 'pointer';
        this.els.vTag.addEventListener('click', (e) => {
            e.stopPropagation();

        // Simple 5-Click Trigger (Now 5 clicks in 3 seconds)
            this._clickCount++;

            if (window.App.Logger) window.App.Logger.info('Dev', `V9 Click: ${this._clickCount}`);

            clearTimeout(this._clickTimer);

            if (this._clickCount >= 3) { // [FIX] reduced to 3 for easier access as per code comment
                this.toggleDevMode();
                this._clickCount = 0;
            } else {
                this._clickTimer = setTimeout(() => {
                    this._clickCount = 0;
                }, 2000);
            }
        });

        // [USER] Shortcut: Alt + I (Quick Access) - OPEN ONLY
        document.addEventListener('keydown', (e) => {
             // Alt + Shift + D (Developer) or Alt + I (Inspector)
            if (e.altKey && (e.key.toLowerCase() === 'i')) {
                e.preventDefault();
                this.openDevMode();
            }
            if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                this.toggleDevMode(); // Toggle
            }
        });
    }

    attachSidebarLogic() {
        if (this.els.btnClose) {
            this.els.btnClose.addEventListener('click', () => {
                this.closeDevMode();
            });
        }

        this.els.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.els.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                this.els.panels.forEach(p => p.classList.remove('active'));
                const target = document.getElementById(`debug-panel-${tab.dataset.tab}`);
                if (target) target.classList.add('active');
            });
        });

        // Log Filters
        const filters = document.querySelectorAll('.log-filter');
        if (filters.length) {
            filters.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update Active State
                    filters.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Filter Logic
                    const level = btn.dataset.level;
                    const container = document.getElementById('debug-content');
                    if (!container) return;

                    const entries = container.querySelectorAll('.log-entry');
                    entries.forEach(entry => {
                        if (level === 'all') {
                            entry.style.display = ''; // [FIX] Reset to CSS (Grid)
                        } else {
                            if (entry.classList.contains(`log-${level}`)) {
                                entry.style.display = ''; // [FIX] Reset to CSS (Grid)
                            } else {
                                entry.style.display = 'none';
                            }
                        }
                    });
                });
            });
        }

        if (this.els.btnCopy) {
            this.els.btnCopy.addEventListener('click', () => this.copyToClipboard());
        }

        if (this.els.btnReset) {
            this.els.btnReset.addEventListener('click', async () => {
                // [FIX] Use non-blocking UI
                const ui = window.App.Core ? window.App.Core.ui : null;
                const confirmed = ui ? await ui.confirmAction('⚠️ HARD RESET: Clear all data and reload?') : confirm('HARD RESET?');

                if (confirmed) {
                    localStorage.clear();
                    // [FIX] Force reload after short delay to ensure storage clear holds
                    setTimeout(() => location.reload(), 100);
                }
            });
        }
    }

    copyToClipboard() {
        const sysInfo = [
            `User Agent: ${navigator.userAgent}`,
            `Viewport: ${window.innerWidth}x${window.innerHeight}`,
            `Time: ${new Date().toISOString()}`
        ].join('\n');

        const stateJson = this.els.stateViewer ? this.els.stateViewer.innerText : "{}";

        let logs = "(No logs)";
        if (window.App.Logger && window.App.Logger.history) {
            logs = window.App.Logger.history.map(e =>
                `[${e.time}] [${e.level.toUpperCase()}] [${e.context}] ${e.message}`
            ).join('\n');
        }

        const stats = window.App.API && window.App.API.stats ? window.App.API.stats : {};
        const apiReport = `[API STATS]\nRequests: ${stats.requestCount || 0}\nLast Latency: ${stats.lastLatency || 0}ms\n`;

        const report = `=== SYSTEM REPORT ===\n\n[SYSTEM]\n${sysInfo}\n\n[API STATS]\n${apiReport}\n\n[STATE JSON]\n${stateJson}\n\n[RECENT LOGS]\n${logs}`;

        navigator.clipboard.writeText(report).then(() => {
            if (window.App.Core && window.App.Core.ui) window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.REPORT_COPIED, 'success');
            // [FIX] Removed blocking fallback alert per user request
        }).catch(err => {
            if (window.App.Logger) window.App.Logger.error('Dev', 'Clipboard failed', err);
            if (window.App.Core && window.App.Core.ui) window.App.Core.ui.showToast(window.App.Constants.UI.TOASTS.COPY_FAIL, 'error');
        });
    }

    /* [ITER_37] Requested Tools */
    attachToolsLogic() {
        const btnFill = document.getElementById('btn-debug-fill');
        if (btnFill) {
            btnFill.addEventListener('click', () => this.fillAllFields()); // [FIX] Use Simple Fill
        }
    }

    fillAllFields() {
        this._fillCounter = (this._fillCounter || 0) + 1;
        const fields = document.querySelectorAll('#sheet [contenteditable]');

        let count = 0;
        fields.forEach(el => {
            const tag = el.tagName.toLowerCase();
            const text = ` [${tag.toUpperCase()} #${this._fillCounter}]`;

            // Append logic & SYNC STATE
            el.innerText = el.innerText + text;
            el.dispatchEvent(new Event('input', { bubbles: true })); // [FIX] Notify State Proxy
            count++;
        });

        const ui = window.App.Core ? window.App.Core.ui : null;
        if (ui) ui.showToast(`🧪 Injected Tags into ${count} fields (Run #${this._fillCounter})`, 'info');
    }

    /* [STATE] Explicit Open/Close Logic */
    toggleDevMode() {
        if (document.body.classList.contains('dev-mode-active')) {
            this.closeDevMode();
        } else {
            this.openDevMode();
        }
    }

    openDevMode() {
        if (document.body.classList.contains('dev-mode-active')) return; // Idempotent

        document.body.classList.add('dev-mode-active');
        document.body.setAttribute('data-dev-mode', 'active'); // AI Flag
        localStorage.setItem('din_dev_mode', 'true');

        const ui = window.App.Core ? window.App.Core.ui : null;
        if (ui) ui.showToast(window.App.Constants.UI.TOASTS.DEV_MODE_ON, 'success');
        this.updateStateView();
    }

    closeDevMode() {
        if (!document.body.classList.contains('dev-mode-active')) return;

        document.body.classList.remove('dev-mode-active');
        document.body.removeAttribute('data-dev-mode');
        localStorage.setItem('din_dev_mode', 'false');

        const ui = window.App.Core ? window.App.Core.ui : null;
        if (ui) ui.showToast('Developer Mode: OFF', 'info');
    }

    /* [TEST] Heart & Kidneys Stress Test */
    async runStressTest() {
        this.openDevMode(); // Ensure active
        const ui = window.App.Core ? window.App.Core.ui : null;
        if (ui) ui.showToast(window.App.Constants.UI.TOASTS.STRESS_START, 'warning');

        const report = [];
        const singleFields = document.querySelectorAll('.single-line-field');

        // Helper to delay
        const wait = (ms) => new Promise(r => setTimeout(r, ms));

        for (const field of singleFields) {
            if (!field) continue;

            // 1. Focus & Scroll
            field.focus();
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await wait(150);

            // 2. Flood
            const startLen = field.innerText.length;
            const originalText = field.innerText;

            // Spam until block
            let blocked = false;
            let charsAdded = 0;
            const limit = 200; // Safety break

            while (!blocked && charsAdded < limit) {
                field.innerText += "X";
                // Manually trigger input to fire Guard
                field.dispatchEvent(new InputEvent('input', { bubbles: true }));

                // Check if Guard reverted the input
                if (field.innerText.length < originalText.length + charsAdded + 1) {
                    blocked = true;
                } else {
                    charsAdded++;
                }
                // Also check our scrollWidth logic
                if (field.scrollWidth > field.clientWidth + 2) {
                     // Should have blocked by now
                }

                await wait(10); // Fast typing simulation
            }

            // 3. Log Result
            const status = blocked ? 'PASSED (Blocked)' : 'FAILED (Overflow)';
            report.push(`Field [${field.id || field.className}]: ${status} (Added ${charsAdded} chars)`);

            // Visual Mark
            field.style.outline = blocked ? '2px solid green' : '2px solid red';
        }

        console.table(report);
        const finalMsg = report.join('\n');

        // Show Report in State Viewer
        if (this.els.stateViewer) {
            this.els.stateViewer.innerText = "=== STRESS TEST REPORT ===\n" + finalMsg;
        }

        if (ui) ui.showToast(window.App.Constants.UI.TOASTS.STRESS_DONE, 'success');
    }

    updateStateView() {
        if (!this.els.stateViewer || !window.App.State) return;
        const state = window.App.State.serialize(); // Get raw state

        // Security Masking
        if (state.config) {
            if (state.config.apiKey && state.config.apiKey.length > 5) {
                state.config.apiKey = "*** (Valid)";
            } else {
                state.config.apiKey = "";
            }
        }

        // [TASK 2] Sparse Mode: Clean empty values for display
        const cleanState = this._cleanupState(state);

        this.els.stateViewer.innerText = JSON.stringify(cleanState, null, 2);
    }

    /**
     * Recursive Cleaner: Removes null, undefined, empty strings, and empty objects
     */
    _cleanupState(obj) {
        if (!obj || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(v => this._cleanupState(v)).filter(v => v !== null && v !== undefined && v !== "");
        }

        const cleanObj = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined || value === "") continue;

            if (typeof value === 'object') {
                const nested = this._cleanupState(value);
                // Keep nested object only if it has keys (or is a valid array)
                if (nested && (Object.keys(nested).length > 0 || Array.isArray(nested))) {
                    cleanObj[key] = nested;
                }
            } else {
                cleanObj[key] = value;
            }
        }
        return cleanObj;
    }

    /* --- INSPECTOR LOGIC --- */

    attachInspectorLogic() {
        // Handled via dynamic methods below
    }

    enableInspector() {
        document.body.classList.add('inspector-active');
        const ui = window.App.Core ? window.App.Core.ui : null;
        if (ui) this._inspectorToast = ui.showToast(window.App.Constants.UI.TOASTS.INSPECTOR_ON, 'info', 0);

        document.addEventListener('mouseover', this._boundHover);
        document.addEventListener('click', this._boundExitClick, true);
        document.addEventListener('keydown', this._boundEsc);
    }

    disableInspector() {
        document.body.classList.remove('inspector-active');
        document.removeEventListener('mouseover', this._boundHover);
        document.removeEventListener('click', this._boundExitClick, true);
        document.removeEventListener('keydown', this._boundEsc);

        if (this._lastHighlight) {
            this._lastHighlight.classList.remove('inspector-highlight');
            this._lastHighlight = null;
        }

        if (this._inspectorToast) {
            this._inspectorToast.remove();
            this._inspectorToast = null;
        }

        const ui = window.App.Core ? window.App.Core.ui : null;
        if (ui) ui.showToast(window.App.Constants.UI.TOASTS.INSPECTOR_OFF, 'info');
    }

    _inspectorHoverHandler(e) {
        const target = e.target;
        const sheet = document.getElementById('sheet');
        if (this._lastHighlight && this._lastHighlight !== target) {
            this._lastHighlight.classList.remove('inspector-highlight');
        }

        if (!sheet || !sheet.contains(target)) return;

        const isContent = target.isContentEditable || target.classList.contains('mark') || target.tagName === 'HEADER' || target.tagName === 'ASIDE';
        const isWrapper = target.id === 'text-container' || target.id === 'address-zone';

        if (isContent && !isWrapper) {
            target.classList.add('inspector-highlight');
            this._lastHighlight = target;

            const styles = window.getComputedStyle(target);
            const font = styles.fontFamily.split(',')[0].replace(/['"]/g, '');
            const sizePx = parseFloat(styles.fontSize);
            const sizePt = Math.round(sizePx * 0.75);

            const ui = window.App.Core ? window.App.Core.ui : null;
            if (ui) ui.showToast(`${font}, ${sizePt}pt`, 'info', 1500);
        }
    }

    _inspectorExitHandler(e) {
        if (e.target.closest('.v-tag')) return;
        this.disableInspector();
    }
};

</script>
    <script>
/* SOURCE: js/controllers/autocomplete-controller.js */
/**
 * > File: js/controllers/autocomplete-controller.js
 * > Role: Manages generic autocomplete logic and dropdowns
 * > Spec: [DIN.UI.AUTOCOMPLETE]
 * > Dep:  App.API, App.State
 * -----------------------------------------------------------------------------
 * Decoupled from UIManager.
 */

window.App = window.App || {};
window.App.Controllers = window.App.Controllers || {};

window.App.Controllers.AutocompleteController = class AutocompleteController {
    constructor() {
        this.init();
    }

    init() {
        this.bindGlobalCloser();
        window.addEventListener('resize', () => this.closeAll());
        window.addEventListener('scroll', () => this.closeAll(), true); // Capture scroll to close dropdowns
    }

    bindGlobalCloser() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAll();
        });

        document.addEventListener('mousedown', (e) => {
            // Updated to check for portal dropdowns in body
            if (!e.target.closest('.autocomplete-dropdown') && !e.target.closest('input[data-has-autocomplete]')) {
                this.closeAll();
            }
        });
    }

    /**
     * Binds an element (Input or ContentEditable) to the Autocomplete Logic
     * @param {HTMLElement} el - The input element
     * @param {string} type - 'street' | 'city' | 'postcode'
     * @param {Function} onSelectCallback - Callback(item) when user selects a suggestion
     */
    bind(el, type, onSelectCallback) {
        if (!el) return;
        el.setAttribute('data-has-autocomplete', 'true');

        const debouncedFetch = window.App.Utils.debounce(async (e) => {
            const query = el.tagName === 'INPUT' ? el.value : el.innerText;
            const config = window.App.State.config;
            const bias = window.App.Core ? window.App.Core.homeCoords : null;

            // [TASK 3] UX: Trigger Logic
            // Postcode: 1 char (e.g. "5" -> 5xxxx)
            // Others: 2 chars
            const minLen = (type === 'postcode') ? 1 : 2;

            if (!query || query.length < minLen) {
                this.close(el);
                return;
            }

            try {
                const suggestions = await window.App.API.fetchAddressSuggestions(query, config, bias, type);
                this.render(el, suggestions, onSelectCallback);
            } catch (err) {
                // Silent fail
            }
        }, 300);

        el.addEventListener('input', debouncedFetch);
        // Delay blur to allow click on dropdown item
        el.addEventListener('blur', () => setTimeout(() => this.close(el), 200));
    }

    render(inputEl, suggestions, onSelect) {
        this.closeAll(); // Close others first

        if (!suggestions || suggestions.length === 0) return;

        // Dedup logic
        const seen = new Set();
        const uniqueSuggestions = suggestions.filter(item => {
            if (seen.has(item.display)) return false;
            seen.add(item.display);
            return true;
        });

        if (uniqueSuggestions.length === 0) return;

        // [TASK 3] Portal Strategy: Render to Body to escape Dialog overflow
        const list = document.createElement('ul');
        list.className = 'autocomplete-dropdown portal-dropdown'; // Add portal class for styling
        list.id = 'active-autocomplete-list';

        // Calculate Position
        const rect = inputEl.getBoundingClientRect();
        list.style.position = 'fixed'; // Fixed relative to viewport prevents scroll issues
        list.style.top = `${rect.bottom + 2}px`;
        list.style.left = `${rect.left}px`;
        list.style.width = `${Math.max(rect.width, 300)}px`; // Minimum width 300px for readability
        list.style.maxHeight = '300px';
        list.style.overflowY = 'auto';
        list.style.zIndex = '99999'; // Always on top

        const iconSVG = `<svg class="icon-marker" viewBox="0 0 24 24" width="14" height="14" style="margin-right:8px; opacity:0.6; vertical-align:middle; flex-shrink:0;"><path fill="currentColor" d="M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7-7.75 7-13C19,5.13 15.87,2 12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5s2.5,1.12 2.5,2.5S13.38,11.5 12,11.5z"/></svg>`;

        uniqueSuggestions.forEach(item => {
            const li = document.createElement('li');
            // Simplified inline styles, moved to CSS mostly but keeping structural ones
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.innerHTML = `${iconSVG} <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.display}</span>`;

            // Mousedown fires before Blur
            li.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation(); // prevent closing
                if (onSelect) onSelect(item);
                this.closeAll();
            });
            list.appendChild(li);
        });

        document.body.appendChild(list);
    }

    close(inputEl) {
        // With portal, we just close all
        // Logic kept to match interface but closeAll is preferred now
        this.closeAll();
    }

    closeAll() {
        const existing = document.getElementById('active-autocomplete-list');
        if (existing) existing.remove();
    }
};

</script>
    <script>
/* SOURCE: js/controllers/editor-controller.js */
/**
 * > File: js/controllers/editor-controller.js
 * > Role: Text Editing Logic (Toolbar, Formatting)
 * > Spec: [DIN.UI.EDITOR.CTRL]
 * -----------------------------------------------------------------------------
 * Handles rich text interactions, toolbar states, and command execution.
 */

window.App = window.App || {};
window.App.Controllers = window.App.Controllers || {};

window.App.Controllers.EditorController = class EditorController {
    constructor() {
        this.toolbar = document.getElementById('editor-toolbar');
        this.buttons = [];
        this.activeButtons = new Map(); // command -> buttonEl
    }

    init() {
        if (!this.toolbar) return;

        // Cache Buttons
        this.buttons = Array.from(this.toolbar.querySelectorAll('button'));

        // Bind Events
        this.buttons.forEach(btn => {
            const cmd = btn.dataset.cmd;
            const val = btn.dataset.val || null;

            if (cmd) {
                this.activeButtons.set(cmd, btn);

                // [FIX] Prevent button from stealing focus from the editor
                btn.addEventListener('mousedown', (e) => e.preventDefault());

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.execute(cmd, val);
                });
            }
        });

        // Monitor Selection for Feedback & Visibility
        const checkVisibility = () => {
            const active = document.activeElement;
            const isBody = active && active.id === 'letter-body';

            if (isBody) {
                this.toolbar.classList.add('visible');
                this.updateToolbarState();
            } else {
                this.toolbar.classList.remove('visible');
            }
        };

        document.addEventListener('selectionchange', checkVisibility);
        document.addEventListener('focusin', checkVisibility);
        document.addEventListener('click', checkVisibility);

        // [FIX] Breakout Listener: Space at start of quote -> Exit Quote
        const body = document.getElementById('letter-body');
        if (body) {
            body.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    // Check if inside blockquote
                    const sel = window.getSelection();
                    if (!sel.rangeCount) return;
                    const range = sel.getRangeAt(0);
                    const node = range.commonAncestorContainer;
                    const quote = (node.nodeType === 1 ? node : node.parentElement).closest('blockquote');

                    if (quote) {
                        // Check if at start of line (simplified)
                        // Precise check: range.startOffset === 0?
                        // Or logic: if text content before cursor in this block is empty?

                        // User Request: "bei leerzeichen muss das wieder an die normale stelle"
                        // Trigger only if Space/Enter and seemingly empty or start?
                        // Let's rely on standard "outdent" if at start.

                        // Logic: If Space pressed at start of quote (offset 0), we want to unwrap.
                        // Issue: offset 0 might be at start of a text node inside quote.

                        if (e.key === ' ' && sel.isCollapsed) {
                             const text = quote.innerText.trim();
                             // Breakout if line is empty OR if cursor is at start of line
                             if ((text === '' || text === '\u200B') || (range.startOffset === 0)) {
                                 e.preventDefault();
                                 // Execute Outdent to break the quote
                                 document.execCommand('outdent');

                                 // Fallback: If outdent fails (some browsers), manually unwrap
                                 const stillInQuote = (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement).closest('blockquote');
                                 if (stillInQuote) {
                                     // Hard Exit
                                     document.execCommand('formatBlock', false, 'div');
                                 }
                             }
                        }
                    }
                }
            });
        }
    }

    execute(command, value = null) {
        // [FIX] Intercept Commands for Custom Logic

        if (command === 'removeFormat') {
            this.cleanFormatting();
        }
        else if (command === 'formatBlock' && value === 'blockquote') {
            this.toggleQuote();
        }
        else {
            document.execCommand(command, false, value);
        }

        this.updateToolbarState();
        if (window.App.Core) window.App.Core.touch();
    }

    cleanFormatting() {
        document.execCommand('removeFormat');
        document.execCommand('unlink');

        // [FIX] Aggressive Unwrap of Quotes
        const sel = window.getSelection();
        if (sel.rangeCount) {
            let node = sel.getRangeAt(0).commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode;

            const quote = node.closest('blockquote');
            if (quote) {
                // Unwrap: Move children out
                const parent = quote.parentNode;
                while (quote.firstChild) {
                    parent.insertBefore(quote.firstChild, quote);
                }
                parent.removeChild(quote);
            }
        }
    }

    toggleQuote() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        let node = sel.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentNode;

        const existing = node.closest('blockquote');

        if (existing) {
            // Already in quote -> Unwrap (Toggle Off)
            const parent = existing.parentNode;
            while (existing.firstChild) {
                parent.insertBefore(existing.firstChild, existing);
            }
            parent.removeChild(existing);
        } else {
            // Not in quote -> Wrap
            document.execCommand('formatBlock', false, 'blockquote');
        }

        // Clean up nested quotes manually if browser messed up
        // (Optional, mostly 'formatBlock' handles one level well)
    }

    updateToolbarState() {
        if (!this.activeButtons.size) return;

        this.activeButtons.forEach((btn, cmd) => {
            let isActive = false;

            try {
                // Check State
                if (cmd === 'formatBlock' && btn.dataset.val === 'blockquote') {
                    // Special check for Quote
                    isActive = document.queryCommandValue(cmd) === 'blockquote';
                } else {
                    isActive = document.queryCommandState(cmd);
                }
            } catch (e) { /* Ignore unsupported commands */ }

            if (isActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
};

</script>

    <!-- UI & App Entry -->
    <script>
/* SOURCE: js/ui/ui-manager.js */
/**
 * > File: js/ui/ui-manager.js
 * > Role: UI Orchestrator (Thin Wrapper)
 * > Spec: [DIN.UI.MANAGER]
 * > Dep:  Controllers.SettingsController, Controllers.DocumentController, Controllers.DevController, Controllers.AutocompleteController
 * -----------------------------------------------------------------------------
 * Initializes sub-controllers and handles global UI concerns (Toast, Dialogs).
 */

window.App = window.App || {};

window.App.UIManager = class UIManager {
    constructor() {
        // Sub-Controllers
        this.settings = new window.App.Controllers.SettingsController();
        this.doc = new window.App.Controllers.DocumentController();

        // [REF_35] Extracted Controllers
        this.dev = new window.App.Controllers.DevController();
        this.autocomplete = new window.App.Controllers.AutocompleteController();
        this.editor = new window.App.Controllers.EditorController();

        // Global UI Elements
        this.els = {
            statusBar: document.getElementById('save-status'),
            profileDialog: document.getElementById('profile-dialog'),
            fileImport: document.getElementById('file-import'),

            btnReset: document.getElementById('btn-reset'),
            btnProfile: document.getElementById('btn-profile'),
            btnExport: document.getElementById('btn-export'),
            btnImport: document.getElementById('btn-import'),

            btnSaveContact: document.getElementById('btn-save-contact-sidebar'),
            btnSidebarDate: document.getElementById('sidebar-btn-date'),
            nativeDate: document.getElementById('native-date-picker'),
            toggleGuides: document.getElementById('toggle-guides'),

            returnLine: document.getElementById('ruecksendeangabe'),

            docZip: document.getElementById('recipient-zip'),
            docCity: document.getElementById('recipient-city'),

            pCompany: document.getElementById('profile-company'),
            pName: document.getElementById('profile-name'),
            pStreet: document.getElementById('profile-street'),
            pZip: document.getElementById('profile-zip'),
            pCity: document.getElementById('profile-city'),
            pPhone: document.getElementById('profile-phone'),
            pEmail: document.getElementById('profile-email'),
            pIBAN: document.getElementById('profile-iban'),
        };

        this._activeToast = null;

        this.initA11yLogic();
        this.attachGlobalGuards();
        this.attachDialogLogic();
        this.attachLiveFormatters();
        this.attachSidebarActions();
        this.attachSmartAutocomplete();
        this.attachSenderLogic();
        this.attachRecipientLogic();
    }

    init() {
        this.settings.init();
        this.doc.init();
        // Dev & Autocomplete init themselves in constructor
    }

    initA11yLogic() {
        // ... (Handled globally or by sub-controllers now. Keeping minimal close logic here)
    }

    attachGlobalGuards() {
        document.addEventListener('paste', (e) => {
            if (e.target.isContentEditable) {
                e.preventDefault();
                let text = (e.clipboardData || window.clipboardData).getData('text/plain');
                if (e.target.classList.contains('single-line-field')) {
                    text = text.replace(/(\r\n|\n|\r)/gm, " ");
                }
                document.execCommand('insertText', false, text);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.isContentEditable) {
                const html = e.target.innerHTML;
                const txt = e.target.innerText.trim();

                if (txt === '' && (html === '<br>' || html === '<div><br></div>')) {
                    e.target.innerHTML = '';
                }
            }
            if (e.target.id === 'recipient-block') {
                this.setContactSavedState(!!window.App.Storage.findContactExact(e.target.innerText));
            }
        });
    }

    attachDialogLogic() {
        if (this.els.profileDialog) {
            this.els.profileDialog.addEventListener('click', (e) => {
                if (e.target === this.els.profileDialog) {
                    this.els.profileDialog.close();
                }
            });

            // [UX] Auto-Capitalize & Sanitize Inputs
            const inputs = this.els.profileDialog.querySelectorAll('input.capitalize-first');
            inputs.forEach(input => {
                input.addEventListener('blur', (e) => {
                     let val = e.target.value;
                     // 1. Trim Start/End (Strict)
                     val = val.trim();

                     if (val) {
                         // 2. Strict Title Case: Lowercase everything first, then Capitalize Words
                         // Fixes "StraßE" bug (ß is not \w) by splitting on space manually
                         val = val.toLowerCase().split(' ').map(word => {
                             return word.charAt(0).toUpperCase() + word.slice(1);
                         }).join(' ');
                     }

                     if (val !== e.target.value) {
                         e.target.value = val;
                         e.target.dispatchEvent(new Event('change', { bubbles: true }));
                     }
                });

                // Prevent leading space on input
                input.addEventListener('input', (e) => {
                    if (e.target.value.startsWith(' ')) {
                        e.target.value = e.target.value.trimStart();
                    }
                });
            });

            // [UX] Email Strict Lowercase
            const emailInput = document.getElementById('profile-email');
            if (emailInput) {
                emailInput.addEventListener('blur', (e) => {
                    const clean = e.target.value.trim().toLowerCase();
                    if (clean !== e.target.value) {
                        e.target.value = clean;
                        e.target.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }
        }
    }

    attachSidebarActions() {
        if (this.els.toggleGuides) {
            this.els.toggleGuides.addEventListener('change', (e) => {
                document.body.classList.toggle('show-guides', e.target.checked);
            });
        }

        if (this.els.btnSidebarDate && this.els.nativeDate) {
            this.els.btnSidebarDate.addEventListener('click', (e) => {
                if (this.els.nativeDate.showPicker) {
                    this.els.nativeDate.showPicker();
                } else {
                    this.els.nativeDate.click();
                }
            });
        }

        // [FIX] Reset Button Logic moved to core/app.js (Simple Modal)
        // Redundant "Wirklich?" logic removed per user request.

        if (this.els.btnExport) {
            this.els.btnExport.addEventListener('click', () => {
                if (window.App.Core) window.App.Core.exportData();
            });
        }

        if (this.els.btnImport) {
            this.els.btnImport.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation(); // [FIX] Prevent double-trigger
                if (this.els.fileImport) this.els.fileImport.click();
            });
            if (this.els.fileImport) {
                // Ensure we clean value to allow re-importing same file
                this.els.fileImport.addEventListener('click', (e) => { e.target.value = null; });

                this.els.fileImport.addEventListener('change', (e) => {
                    if (window.App.Core && e.target.files[0]) {
                        window.App.Core.importData(e.target.files[0]);
                    }
                });
            }
        }

        if (this.els.btnProfile) {
            this.els.btnProfile.addEventListener('click', () => {
                if (this.els.profileDialog) {
                    this.loadProfileIntoUI(window.App.Storage.loadProfile());
                    this.els.profileDialog.showModal();
                }
            });
        }

        if (this.els.profileDialog) {
            // [V9] Real-Time Auto-Save Listeners
            // Both 'input' (Immediate) and 'blur' (Safety/Commit) are used.
            const inputs = this.els.profileDialog.querySelectorAll('input');
            inputs.forEach(input => {
                const saveHandler = () => {
                   window.App.Storage.saveProfile(this.getProfileFromUI());
                   window.App.Core.loadSenderProfile();
                };

                // [V9] Auto-Save on Blur (Focus Loss) ONLY
                // User requested: NO save on typing. Only when leaving the field.
                // input.addEventListener('input', saveHandler); // REMOVED per user request

                // [TASK] Smart PLZ Validation (Unlockable)
                // Default: Strict German (5 Digits).
                // Trigger: If user tries >5 chars or letters -> Offer Unlock.
                this.intlMode = localStorage.getItem('din_intl_mode') === 'true';

                if (input.id === 'profile-zip') {
                    // Initialize placeholder based on mode
                    if (this.intlMode) input.placeholder = "International";

                    input.addEventListener('input', (e) => {
                        let val = e.target.value;

                        if (this.intlMode) {
                            // Free Text Mode: No restrictions
                            return;
                        }

                        // Strict Mode Logic
                        // Check for forbidden chars (letters) OR excess length
                        const hasForbidden = /[^0-9]/.test(val);
                        const isTooLong = val.length > 5;

                        if (hasForbidden || isTooLong) {
                            // Block invalid input immediately
                            const clean = val.replace(/[^0-9]/g, '').substring(0, 5);
                            if (clean !== val) {
                                e.target.value = clean;
                                val = clean;
                            }

                            // Show Unlock Offer
                            this.showActionToast(
                                'Internationale PLZ nutzen?',
                                'Ja, entsperren',
                                () => {
                                    this.intlMode = true;
                                    localStorage.setItem('din_intl_mode', 'true');
                                    input.placeholder = "International";
                                    this.showToast(window.App.Constants.UI.TOASTS.INTL_MODE, 'success');
                                }
                            );
                        }

                        // Auto-Tab Logic (Only if valid 5 digits)
                        if (val.length === 5 && !this.intlMode) {
                            const next = document.getElementById('profile-city');
                            if (next) next.focus();
                        }
                    });
                }

                // [TASK] Phone Validation (DIN 5008)
                if (input.id === 'profile-phone') {
                    input.addEventListener('input', (e) => {
                        if (this.intlMode) return; // Allow everything in intl mode

                        let val = e.target.value;
                        if (val.includes('/')) val = val.replace(/\//g, ' ');
                        const clean = val.replace(/[^0-9+\-\s]/g, '');
                        if (clean !== e.target.value) e.target.value = clean;
                    });
                     // Auto-Format on Blur
                    input.addEventListener('blur', (e) => {
                         if (this.intlMode) return;
                         const fmt = window.App.Formatter.formatPhoneNumber(e.target.value);
                         if (fmt) e.target.value = fmt;
                    });
                }

                // [TASK] IBAN Intelligence (Updated v3.0 Ghost Overlay)
                if (input.id === 'profile-iban') {
                    const ghost = document.getElementById('iban-ghost');

                    // Ghost Update Logic
                    const updateGhost = (val) => {
                        if (!ghost || this.intlMode) {
                             if (ghost) ghost.innerHTML = '';
                             return;
                        }

                        // 1. Determine Country & Length
                        let country = "DE";
                        let len = 22;

                        const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                        if (clean.length >= 2) {
                            const code = clean.substring(0, 2);
                            if (window.App.Formatter && window.App.Formatter._ibanRules && window.App.Formatter._ibanRules[code]) {
                                country = code;
                                len = window.App.Formatter._ibanRules[code];
                            }
                        }

                        // 2. Build Pattern (Groups of 4)
                        let pattern = country + "00";
                        const remainingLen = len - 4;
                        const fullBlocks = Math.floor(remainingLen / 4);
                        const remainder = remainingLen % 4;

                        for(let i=0; i<fullBlocks; i++) pattern += " 0000";
                        if (remainder > 0) pattern += " " + "0".repeat(remainder);

                        // 3. Render "Twin"
                        // If input is longer than pattern (overflow), hide ghost
                        if (val.length >= pattern.length) {
                             ghost.innerHTML = `<span class="invisible">${val}</span>`;
                        } else {
                             const partVisible = pattern.substring(val.length);
                             ghost.innerHTML = `<span class="invisible">${val}</span>${partVisible}`;
                        }
                    };

                    // Init State
                    if (this.intlMode) {
                        input.placeholder = "International"; // Ghost disabled
                        input.maxLength = 34;
                    } else {
                        input.placeholder = ""; // Clear for Ghost
                        input.maxLength = 34;
                    }

                    // Init Ghost
                    updateGhost(input.value);

                    input.addEventListener('input', (e) => {
                        let val = e.target.value.toUpperCase();

                        // 0. Intl Mode
                        if (this.intlMode) {
                             const clean = val.replace(/[^A-Z0-9]/g, '');
                             const formatted = window.App.Formatter.formatIBAN(clean);
                             if (e.target.value !== formatted) e.target.value = formatted;
                             updateGhost(formatted);
                             return;
                        }

                        // 1. Strict Mode (DE)
                        const raw = val.replace(/\s/g, '');

                        // Detect Intl Trigger (Length > 22 or Letters in body)
                        let triggerIntl = false;
                        if (raw.length > 22) triggerIntl = true;
                        for (let i = 4; i < raw.length; i++) {
                            if (/[A-Z]/.test(raw[i])) triggerIntl = true;
                        }

                        if (triggerIntl) {
                              this.showActionToast(
                                'Internationale IBAN nutzen?',
                                'Ja, entsperren',
                                () => {
                                    this.intlMode = true;
                                    localStorage.setItem('din_intl_mode', 'true');
                                    input.placeholder = "International";
                                    this.showToast(window.App.Constants.UI.TOASTS.INTL_MODE, 'success', null, input);
                                    updateGhost(input.value);
                                }
                            , input); // Ensure toast is near input
                        }

                        // Auto-Format
                        const formatted = window.App.Formatter.formatIBAN(raw);
                        if (e.target.value !== formatted) {
                            e.target.value = formatted;
                            val = formatted;
                        }

                        updateGhost(val);

                        // [UX] Immediate Validation on "Complete"
                        // Determine expected length for this country
                        let expectedLen = 22; // Default DE
                        const country = raw.substring(0,2);
                        if (window.App.Formatter && window.App.Formatter._ibanRules && window.App.Formatter._ibanRules[country]) {
                            expectedLen = window.App.Formatter._ibanRules[country];
                        }

                        if (raw.length === expectedLen) {
                            // Perfect length -> Validate Immediately!
                            const isValid = window.App.Formatter.validateIBAN(val);
                            if (isValid) {
                                e.target.style.borderColor = 'var(--c-success)';
                                // [UX] Use Input Feedback (Right of field) instead of Global Toast
                                this.showInputError(input, '✓ IBAN ist gültig', 'success');
                            } else {
                                e.target.style.borderColor = 'var(--c-danger)';
                                this.showInputError(input, '⚠ Prüfsumme ungültig', 'error');
                            }
                        } else {
                            // Incomplete
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        }
                    });

                    input.addEventListener('blur', (e) => {
                         const val = e.target.value.replace(/\s/g, '');
                         if (!val) { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; return; }

                         // Strict DE Check
                         if (!this.intlMode && val.length !== 22) {
                                 e.target.style.borderColor = 'var(--c-danger)';
                                 this.showToast(window.App.Constants.UI.TOASTS.IBAN_LENGTH, 'error');
                                 return;
                         }

                         // Full Validator
                         const isValid = window.App.Formatter.validateIBAN(e.target.value);
                         if (isValid) {
                             e.target.style.borderColor = 'var(--c-success)';
                             this.showToast(window.App.Constants.UI.TOASTS.IBAN_VALID, 'success');
                         } else {
                             e.target.style.borderColor = 'var(--c-danger)';
                             this.showToast(window.App.Constants.UI.TOASTS.IBAN_INVALID, 'error');
                         }
                    });
                }

                // [TASK] Email Intelligence
                if (input.id === 'profile-email') {
                    input.addEventListener('blur', (e) => {
                        const val = e.target.value;
                        if (!val) {
                            e.target.style.borderColor = '';
                            return;
                        }

                        const result = window.App.Formatter.validateEmail(val);

                        if (!result.isValid) {
                            e.target.style.borderColor = 'var(--c-danger)';
                            this.showInputError(e.target, 'Ungültiges E-Mail Format', 'error');
                        } else if (result.warning) {
                             e.target.style.borderColor = 'var(--c-warning)';
                             this.showInputError(e.target, result.warning, 'warning');
                        } else {
                             e.target.style.borderColor = 'var(--c-success)';
                        }
                    });
                }

                // [TASK] Strict Numeric for ZIP
                if (input.id === 'profile-zip') {
                    input.addEventListener('input', (e) => {
                         // Instant replace non-digits
                         const clean = e.target.value.replace(/[^0-9]/g, '');
                         if (clean !== e.target.value) {
                             e.target.value = clean;
                         }
                    });
                }

                input.addEventListener('blur', () => {
                    saveHandler();
                    // PLZ Warning only if NOT intl mode
                    if (input.id === 'profile-zip' && !this.intlMode) {
                        const val = input.value.trim();
                        // Use Central Logic
                        if (val.length > 0 && !window.App.Formatter.validatePostalCode(val, 'DE')) {
                             this.showInputError(input, 'Deutsche PLZ muss 5 Ziffern haben', 'warning');
                        }
                    }
                });
            });

            // "Speichern" -> "Fertig" (Save + Close)
            const btnSave = document.getElementById('btn-profile-done');
            if (btnSave) {
                console.log('[UIManager] Binding btn-profile-done');
                btnSave.addEventListener('click', (e) => {
                    console.log('[UIManager] btn-profile-done CLICKED');
                    e.preventDefault();

                    try {
                        // Explicit save
                        const profile = this.getProfileFromUI();
                        console.log('[UIManager] Saving Profile:', profile);
                        window.App.Storage.saveProfile(profile);

                        // Load Profile
                        if (window.App.Core) {
                            console.log('[UIManager] Loading Profile into Core');
                            window.App.Core.loadSenderProfile();
                        } else {
                            console.warn('[UIManager] App.Core missing');
                        }

                        // Close
                        console.log('[UIManager] Closing Dialog', this.els.profileDialog);
                        if (this.els.profileDialog && this.els.profileDialog.close) {
                            this.els.profileDialog.close();
                        } else {
                            console.error('[UIManager] Dialog invalid or missing close()');
                        }
                    } catch (err) {
                        console.error('[UIManager] Error in btn-profile-done:', err);
                    }
                });
            }
        }

        if (this.els.btnPrint) {
            this.els.btnPrint.addEventListener('click', () => {
                window.print();
            });
        }
    }

    attachSmartAutocomplete() {
        const setValue = (el, val) => {
            if (!el || !val) return;
            el.innerText = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        };

        if (this.autocomplete && this.els.docZip) {
            this.autocomplete.bind(this.els.docZip, 'postcode', (item) => {
                // [FIX] Force update both fields to ensure consistency
                // If user selects "53111 Bonn", force "53111" into Zip and "Bonn" into City
                if (item.raw.postcode) setValue(this.els.docZip, item.raw.postcode);
                if (item.raw.city) setValue(this.els.docCity, item.raw.city);
            });
        }

        if (this.autocomplete && this.els.docCity) {
            this.autocomplete.bind(this.els.docCity, 'city', (item) => {
                // [FIX] Priority Overwrite
                // If I click "Bonnut", city must become "Bonnut"
                const cityVal = item.raw.city || item.raw.name; // Fallback to name if city is empty (e.g. for small villages)
                if (cityVal) setValue(this.els.docCity, cityVal);
                if (item.raw.postcode) setValue(this.els.docZip, item.raw.postcode);
            });
        }

        // [V9] Sender Fields (Direct Edit)
        const elSenderStreet = document.getElementById('sender-street');
        if (this.autocomplete && elSenderStreet) {
            this.autocomplete.bind(elSenderStreet, 'street', (item) => {
                 if (item.raw.street) {
                     let val = item.raw.street;
                     if (item.raw.housenumber) val += ' ' + item.raw.housenumber;
                     setValue(elSenderStreet, val);
                 }
                 // Optional: Also fill Zip/City if we found a specific address?
                 // Usually sender-zip-city is next.
            });
        }

        const elSenderZipCity = document.getElementById('sender-zip-city');
        if (this.autocomplete && elSenderZipCity) {
             // For combo field, we treat it as 'city' type usually works best with Photon
             // as it finds "53111 Bonn" easily.
            this.autocomplete.bind(elSenderZipCity, 'city', (item) => {
                 // Format: "12345 Musterstadt"
                 let val = '';
                 if (item.raw.postcode) val += item.raw.postcode + ' ';
                 if (item.raw.city) val += item.raw.city;
                 setValue(elSenderZipCity, val.trim());
            });
        }

        // Wire Profile Autocomplete
        if (this.autocomplete && this.els.pStreet) {
            this.autocomplete.bind(this.els.pStreet, 'street', (item) => {
                if (item.raw.street) this.els.pStreet.value = item.raw.street;
                if (item.raw.housenumber) this.els.pStreet.value += ' ' + item.raw.housenumber;
                if (item.raw.postcode) this.els.pZip.value = item.raw.postcode;
                if (item.raw.city) this.els.pCity.value = item.raw.city;
            });
        }
        if (this.autocomplete && this.els.pCity) {
            this.autocomplete.bind(this.els.pCity, 'city', (item) => {
                if (item.raw.city) this.els.pCity.value = item.raw.city;
                if (item.raw.postcode) this.els.pZip.value = item.raw.postcode;
            });
        }
        if (this.autocomplete && this.els.pZip) {
            this.autocomplete.bind(this.els.pZip, 'postcode', (item) => {
                if (item.raw.postcode) this.els.pZip.value = item.raw.postcode;
                if (item.raw.city) this.els.pCity.value = item.raw.city;
            });
        }
    }

    attachSenderLogic() {
        // [TASK] Auto-fill 'sender-address-small' from granular fields
        const targets = ['sender-company', 'sender-name', 'sender-street', 'sender-zip-city'];
        const elSmall = document.getElementById('sender-address-small');

        if (!elSmall) return;

        const updateSmall = () => {
            // Only update if empty (Don't overwrite user manual edits)
            if (elSmall.innerText.trim() !== '' && elSmall.dataset.autoset !== 'true') return;

            const parts = [];

            // 1. Company OR Name (Preference: Company, but if both exists, maybe format "Firma | Name"?)
            // DIN 5008 usually suggests concise return address.
            const valComp = document.getElementById('sender-company')?.innerText.trim();
            const valName = document.getElementById('sender-name')?.innerText.trim();
            const valStreet = document.getElementById('sender-street')?.innerText.trim();
            const valCity = document.getElementById('sender-zip-city')?.innerText.trim();

            if (valComp) parts.push(valComp);
            if (valName) parts.push(valName);
            if (valStreet) parts.push(valStreet);
            if (valCity) parts.push(valCity);

            const final = parts.join(' · ');

            if (final) {
                elSmall.innerText = final;
                elSmall.dataset.autoset = 'true'; // Mark as auto-filled so we can update it freely
                // Sync State
                window.App.State.content.sender_address_small = final;
            }
        };

        targets.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateSmall);
        });

        // Loop breaker: If user edits small line manually, remove autoset flag
        elSmall.addEventListener('input', () => {
            elSmall.dataset.autoset = 'false';
        });
    }

    attachRecipientLogic() {
        // [TASK] Zip Code UX (5 Digits, Auto-Tab, Intl Prompt)
        const elZip = document.getElementById('recipient-zip');
        const elCity = document.getElementById('recipient-city');

        if (!elZip) return;

        // Load Intl Mode preference
        let isIntl = localStorage.getItem('din_intl_req_mode') === 'true';

        elZip.addEventListener('input', (e) => {
            if (isIntl) return; // Free mode

            let val = e.target.innerText.replace(/[^0-9]/g, ''); // Strict numbers

            // Block > 5 chars
            if (val.length > 5) {
                // Determine user intent: Is this a typo or International?
                // If they typed a 6th digit, we block it AND ask.
                val = val.substring(0, 5);

                // Show prompt (Debounced)
                if (!this._zipPromptShown) {
                    this.showActionToast(
                        'Internationale PLZ?',
                        'Ja, umschalten',
                        () => {
                            isIntl = true;
                            localStorage.setItem('din_intl_req_mode', 'true');
                            this.showToast(window.App.Constants.UI.TOASTS.INTL_MODE, 'success');
                        },
                        elZip
                    );
                    this._zipPromptShown = true;
                }
            }

            // Apply restriction
            if (e.target.innerText !== val) {
                e.target.innerText = val;
                // Cursor fix typically needed here for contenteditable,
                // but since we only truncate end, usually fine or user re-clicks.
                // ideally set cursor to end.
                window.App.Utils.setCursorToEnd(elZip);
            }

            // Sync State
            window.App.State.content.recipient_zip = val;

            // Auto-Tab
            if (val.length === 5 && elCity) {
                elCity.focus();
            }
        });
    }

    attachLiveFormatters() {
        const phoneInput = this.els.pPhone;
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const formatted = window.App.Formatter.formatPhoneNumber(e.target.value);
                if (e.target.value !== formatted) {
                    e.target.value = formatted;
                }
            });
        }
    }

    /* --- Public Facade Methods --- */

    updateReturnLine(text) {
        if (this.els.returnLine) this.els.returnLine.innerText = text;
    }

    updateSaveStatus(status) {
        if (!this.els.statusBar) return;
        const texts = window.App.Constants.TEXTS ? window.App.Constants.TEXTS.STATUS : { LOADING: '...', SAVED: 'OK' };

        switch (status) {
            case 'saving':
                this.els.statusBar.innerHTML = `<span class="status-icon spin">⏳</span> ${texts.SAVING}`;
                this.els.statusBar.style.borderLeftColor = 'var(--c-warning)';
                break;
            case 'saved':
                this.els.statusBar.innerHTML = `<span class="status-icon">✅</span> ${texts.SAVED}`;
                this.els.statusBar.style.borderLeftColor = 'var(--c-success)';
                break;
            case 'error':
                this.els.statusBar.innerHTML = `<span class="status-icon">❌</span> ${texts.ERROR}`;
                this.els.statusBar.style.borderLeftColor = 'var(--c-danger)';
                break;
            case 'loading':
                this.els.statusBar.innerHTML = `<span class="status-icon">⏳</span> ${texts.LOADING}`;
                break;
        }
    }

    showActionToast(msg, btnText, callback, targetEl = null) {
        // Clear existing
        if (this._activeToast) {
            this._activeToast.remove();
            this._activeToast = null;
        }

        const toast = document.createElement('div');
        toast.className = 'ui-toast ui-toast-action toast-info';

        // HTML Structure: Icon + Text + Button + Close
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                <span>🌍</span>
                <span>${msg}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <button class="ui-toast-btn" style="white-space:nowrap;">${btnText}</button>
                <button class="ui-toast-btn-close">×</button>
            </div>
        `;

        const btn = toast.querySelector('.ui-toast-btn');
        btn.addEventListener('click', (e) => {
             e.stopPropagation();
             callback();
             toast.classList.remove('show');
             setTimeout(() => toast.remove(), 300);
             this._activeToast = null;
        });

        const close = toast.querySelector('.ui-toast-btn-close');
        close.addEventListener('click', () => {
             toast.classList.remove('show');
             setTimeout(() => toast.remove(), 300);
             this._activeToast = null;
        });

        // [UX] Modal / Backdrop Fix
        // Append to the top-most dialog if one is open to beat the High Z-Index Backdrop
        const topDialog = document.querySelector('dialog[open]');
        let appendTarget = document.body;
        if (topDialog) {
            appendTarget = topDialog;
        }

        appendTarget.appendChild(toast);

        // [UX] Smart Positioning (Near Input)
        const target = targetEl || document.activeElement;

        // Reset defaults
        toast.style.top = 'auto';
        toast.style.right = 'auto';
        toast.style.left = 'auto';
        toast.style.bottom = 'auto';

        if (target && (target.tagName === 'INPUT' || target.contentEditable === 'true')) {
            const rect = target.getBoundingClientRect();

            // Position: Below input, Left aligned
            let top = rect.bottom + 10;
            let left = rect.left;

            // Boundary Check (Right Edge)
            if (left + 320 > window.innerWidth) {
                left = window.innerWidth - 340;
            }
            if (left < 20) left = 20;

            toast.style.top = `${top}px`;
            toast.style.left = `${left}px`;
            // Ensure strictly positioned to not fall back to CSS defaults
            toast.style.right = 'auto';
            toast.style.transform = 'translateY(10px)';
        } else {
            // Default global position (if no input context)
            // If in sidebar: Top Right
            // If in Modal but generic: Top Right of Modal? Or Center?
            // Let's stick to standard Top-Right of whatever container
            toast.style.top = '20px';
            toast.style.right = '20px';
            toast.style.transform = 'translateY(-10px)';
        }

        // Force Reflow
        void toast.offsetWidth;
        toast.classList.add('show');
        toast.style.transform = 'translateY(0)'; // Animate in
        this._activeToast = toast;
    }

    showInputError(input, msg, type = 'error') {
        // 1. Check if msg exists
        let msgEl = input.parentNode.querySelector('.input-feedback-msg');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.className = 'input-feedback-msg';
            input.parentNode.appendChild(msgEl);
            // Ensure parent is relative
            if (getComputedStyle(input.parentNode).position === 'static') {
                input.parentNode.style.position = 'relative';
            }
        }

        // 2. Set Text & Type
        msgEl.innerText = msg;
        msgEl.className = 'input-feedback-msg'; // Reset base class
        if (type === 'warning') msgEl.classList.add('warning');
        if (type === 'success') msgEl.classList.add('success');

        // 3. Show
        requestAnimationFrame(() => {
            msgEl.classList.add('show');
        });

        // 4. Auto-Hide after delay (longer for warnings)
        const duration = type === 'warning' ? 6000 : 4000;

        // Clear previous timeout
        if (msgEl._timeout) clearTimeout(msgEl._timeout);

        msgEl._timeout = setTimeout(() => {
            msgEl.classList.remove('show');
        }, duration);
    }

    showToast(msg, type = 'success', durationOverride = null, targetEl = null) {
        if (durationOverride !== 0 && this._activeToast) {
            this._activeToast.remove();
            this._activeToast = null;
        }

        const C = window.App.Constants;
        const duration = (durationOverride !== null) ? durationOverride : ((C.UI && C.UI.TOAST_DURATION_MS) ? C.UI.TOAST_DURATION_MS : 3000);
        const fade = (C.UI && C.UI.TOAST_FADE_MS) ? C.UI.TOAST_FADE_MS : 300;

        const toast = document.createElement('div');
        toast.className = `ui-toast toast-${type}`;
        toast.innerText = msg;

        const icon = document.createElement('span');
        icon.style.marginRight = '8px';
        icon.innerText = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        toast.prepend(icon);

        // [UX] Modal / Backdrop Fix
        // If we have an open modal, we must append the toast inside it or use high z-index and ensure it's not behind backdrop.
        // Best approach: Append to the top-most dialog if one is open.
        const topDialog = document.querySelector('dialog[open]');

        let appendTarget = document.body;
        if (topDialog) {
            appendTarget = topDialog; // Ensures it sits above backdrop
            // For position fixed to work relative to dialog viewport (if dialog is polyfilled or stylized),
            // usually fixed works relative to viewport. But z-index stacking context applies.
        }

        appendTarget.appendChild(toast);

        // [UX] Position Logic
        const target = targetEl || document.activeElement;

        // Only position contextually if we have a target AND it's an input/editable
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
             const rect = target.getBoundingClientRect();

             // Reset default top-right styles
             toast.style.top = 'auto';
             toast.style.right = 'auto';

             // Position below input
             let top = rect.bottom + 8;
             let left = rect.left;

             // Boundary Check (Right Edge)
             if (left + toast.offsetWidth > window.innerWidth) {
                 left = window.innerWidth - toast.offsetWidth - 20;
             }
             if (left < 10) left = 10;

             toast.style.top = `${top}px`;
             toast.style.left = `${left}px`;
             toast.style.transform = 'translateY(10px)'; // Start offset for anim
        } else {
             // Default Top-Right (if no context)
             // Already set by CSS, but ensure clean slate
        }

        // Trigger Anim
        requestAnimationFrame(() => {
             // If we positioned manually, we need to respect the translateY(0) for animation
             toast.classList.add('show');
             if (toast.style.left) {
                 toast.style.transform = 'translateY(0)';
             }
        });

        this._activeToast = toast;

        if (duration === 0) return toast;

        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                    if (this._activeToast === toast) this._activeToast = null;
                }, fade);
            }
        }, duration);

        return toast;
    }

    /**
     * [DIN.UI.DIALOG] Asynchronous Confirmation Dialog
     * Replaces native confirm() with a non-blocking HTML dialog.
     * @param {string} msg - The question to ask
     * @returns {Promise<boolean>} - Resolves true if confirmed
     */
    confirmAction(msg) {
        return new Promise(resolve => {
            const dialog = document.getElementById('confirmation-dialog');
            if (!dialog) {
                // Fallback if HTML is missing
                return resolve(confirm(msg));
            }

            const title = document.getElementById('confirm-title');
            const message = document.getElementById('confirm-message');
            const btnOk = document.getElementById('btn-confirm-ok');
            const btnCancel = document.getElementById('btn-confirm-cancel');

            if (message) message.innerText = msg;

            // Cleanup old listeners (simple cloning approach)
            const newOk = btnOk.cloneNode(true);
            const newCancel = btnCancel.cloneNode(true);
            btnOk.parentNode.replaceChild(newOk, btnOk);
            btnCancel.parentNode.replaceChild(newCancel, btnCancel);

            const close = (result) => {
                dialog.close();
                resolve(result);
            };

            newOk.addEventListener('click', () => close(true));
            newCancel.addEventListener('click', () => close(false));

            // Also handle ESC via dialog's built-in cancel event
            dialog.addEventListener('cancel', (e) => {
               resolve(false);
            }, { once: true });

            dialog.showModal();
        });
    }

    setFormalityValue(val) {
        const radio = document.querySelector(`input[name="formality"][value="${val}"]`);
        if (radio) radio.checked = true;
    }

    getProfileFromUI() {
        return {
            company: this.els.pCompany.value.trim(),
            name: this.els.pName.value.trim(),
            street: this.els.pStreet.value.trim(),
            zip: this.els.pZip.value.trim(),
            city: this.els.pCity.value.trim(),
            phone: this.els.pPhone.value.trim(),
            email: this.els.pEmail.value.trim(),
            iban: this.els.pIBAN.value.trim()
        };
    }

    loadProfileIntoUI(profile) {
        if (!profile) return;
        const setVal = (el, val) => { if (el) el.value = val || ''; };
        setVal(this.els.pCompany, profile.company);
        setVal(this.els.pName, profile.name);
        setVal(this.els.pStreet, profile.street);
        setVal(this.els.pZip, profile.zip);
        setVal(this.els.pCity, profile.city);
        setVal(this.els.pPhone, profile.phone);
        setVal(this.els.pEmail, profile.email);
        setVal(this.els.pIBAN, profile.iban);
    }

    setContactSavedState(isSaved) {
        if (!this.els.btnSaveContact) return;
        if (isSaved) {
            this.els.btnSaveContact.innerHTML = '<span>★</span> Kontakt gemerkt';
            this.els.btnSaveContact.classList.add('saved');
            this.els.btnSaveContact.style.borderColor = 'var(--c-warning)';
            this.els.btnSaveContact.style.color = 'var(--c-warning)';
        } else {
            this.els.btnSaveContact.innerHTML = '<span>☆</span> Kontakt merken';
            this.els.btnSaveContact.classList.remove('saved');
            this.els.btnSaveContact.style.borderColor = '';
            this.els.btnSaveContact.style.color = '';
        }
    }

};

</script>
    <script>
/* SOURCE: js/core/app.js */
/**
 * > File: js/core/app.js
 * > Role: Main Application Controller (Orchestrator)
 * > Spec: [DIN.SYS.CORE.CTRL]
 * > Dep:  js/core/state.js, js/ui/ui-manager.js, js/services/storage.js, js/formatters/formatter.js
 * -----------------------------------------------------------------------------
 * Orchestrates the application lifecycle using Atomic State Proxy.
 */

window.App = window.App || {};

class CoreApp {
    constructor() {
        /** @type {import('../ui/ui-manager').UIManager} */
        this.ui = null;
        this.editor = null; // [TASK 7] Editor Controller
        this.isDirty = false;
        this.homeCoords = null; // [DIN.FEAT.GEO.BIAS] Runtime Cache

        // Undo/Redo Stack
        this.historyStack = [];
        this.historyIndex = -1;
        this.isNavigatingHistory = false;

        // [DIN.DX.UNDO] Limit memory usage via Central Constant
        this.MAX_HISTORY = window.App.Constants.LIMITS.HISTORY_MAX_ITEMS;

        this.debouncedSave = null;
        this.debouncedAutocomplete = null;
        this.debouncedValidation = null;
        this.debouncedHistory = null;
        this.debouncedSalutation = null;
    }

    async init() {
        try {
            if (window.App.Logger) window.App.Logger.init();

            // [DIN.UI.MANAGER] Initialize the UI Orchestrator
            this.ui = new window.App.UIManager();
            this.ui.init();

            // [TASK 7] Initialize Editor Toolbar
            if (window.App.Controllers.EditorController) {
                this.editor = new window.App.Controllers.EditorController();
                this.editor.init();
            }

            // [DIN.SYS.DEV] Restore Developer Controller
            if (window.App.Controllers.DevController) {
                this.dev = new window.App.Controllers.DevController();
            }

            this.bindState();

            // Initialize Debouncers using Constants
            const debounceMs = window.App.Constants.LIMITS.API_DEBOUNCE_MS;

            this.debouncedSave = window.App.Utils.debounce(() => this.performSave(), 1000);
            this.debouncedAutocomplete = window.App.Utils.debounce((e) => this.runAutocomplete(e), debounceMs); // Autocomplete still generic, though might be specific later
            this.debouncedValidation = window.App.Utils.debounce(() => this.runQualityChecks(), 500);
            this.debouncedValidation = window.App.Utils.debounce(() => this.runQualityChecks(), 500);
            this.debouncedHistory = window.App.Utils.debounce(() => this.pushHistory(), 2000);
            // [TASK 3] Stop Log Spam
            this.debouncedSalutation = window.App.Utils.debounce((text) => this.handleSmartGreeting(text), 800);

            // Subscribe to State Changes
            window.App.State.subscribe((scope, key, value) => {
                this.touch();
                if (scope === 'config') this.applyConfigSideEffects();
                if (scope === 'content') {
                    if (key === 'sender') this.refreshReturnLine();

                    // [TASK 3] Subject Cleaner - The DIN Guard
                    if (key === 'subject') {
                        this.updateDocumentTitle(value);
                        this.guardSubjectLine(value);
                    }

                    // [TASK 1] Sync Date Dropdown Preview
                    if (key === 'date') this.syncDateDropdown(value);
                }
            });

            // Register Service Worker
            // Register Service Worker (Http/Https only)
            if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
                navigator.serviceWorker.register('./sw.js')
                    .catch(err => window.App.Logger && window.App.Logger.error('PWA', `SW Fail: ${err}`));
            }

            this.ui.updateSaveStatus('loading');
            await this.load();
            this.pushHistory();

            // [DIN.FEAT.GEO.BIAS] Initialize Location Bias
            await this.initLocationBias();

            // Auto-Date on Init
            if (!window.App.State.content.date) {
                this.updateDateDisplay(true);
            } else {
                // Ensure dropdown is synced on load
                this.syncDateDropdown(window.App.State.content.date);
            }

            // Auto-Load Sender if empty
            if (!window.App.State.content.sender && !window.App.State.content.sender_company) {
                this.loadSenderProfile();
            }

            this.attachEventListeners();

            this.refreshReturnLine();
            this.runQualityChecks();
            this.ui.doc.checkPageOverflow();
            this.applyConfigSideEffects();

            // Diagnostic Dump (Silent)
            setTimeout(async () => {
                if (window.App.Diagnostics) await window.App.Diagnostics.run();
            }, 800);

        } catch (e) {
            if (window.App.Logger) window.App.Logger.error('Core', `INIT_CRASH: ${e.message}`);
            this.triggerPanicMode(e);
        }
    }

    bindState() {
        const S = window.App.State;
        const DOM = this.ui.doc.DOM;
        const SET = this.ui.settings.DOM;

        // Config Bindings
        S.bind('config', 'layout', SET.LAYOUT);
        S.bind('config', 'provider', SET.PROVIDER);
        S.bind('config', 'font', SET.FONT);
        S.bind('config', 'dateFormat', SET.DATE_FORMAT);
        S.bind('config', 'apiKey', SET.API_KEY);

        // Content Bindings (V9 Complete)

        // Sender (Granular)
        S.bind('content', 'sender_company', DOM.SENDER_COMPANY);
        S.bind('content', 'sender_name', DOM.SENDER_NAME);
        S.bind('content', 'sender_street', DOM.SENDER_STREET);
        S.bind('content', 'sender_zip_city', DOM.SENDER_ZIP_CITY);
        S.bind('content', 'sender_phone', DOM.SENDER_PHONE);
        S.bind('content', 'sender_email', DOM.SENDER_EMAIL);
        S.bind('content', 'sender_address_small', DOM.SENDER_SMALL);

        // Recipient (Structured)
        S.bind('content', 'recipient_company', DOM.RECIPIENT_COMPANY);
        S.bind('content', 'recipient_salut_type', 'setting-recipient-type'); // [V9] Sidebar Binding
        S.bind('content', 'recipient_salutation', 'recipient-salutation');   // [V9] Split Text Field
        S.bind('content', 'recipient_name', DOM.RECIPIENT_NAME);

        // [FIX] Bind Controller Callback for Real-time Salutation Updates
        if (this.ui && this.ui.doc) {
            this.ui.doc.onRecipientNameInput = (text) => {
                this.handleSmartGreeting(text);
                this.debouncedValidation(); // Also trigger validation
            };

            // [FIX] Bind Manual Salutation Input (e.g. User types "Monsieur")
            this.ui.doc.onRecipientSalutationInput = (salutText) => {
                 this.handleSmartGreeting(window.App.State.content.recipient_name, salutText);
            };
        }

        S.bind('content', 'recipient_street', DOM.RECIPIENT_STREET);
        S.bind('content', 'recipient_zip', DOM.RECIPIENT_ZIP);
        S.bind('content', 'recipient_city', DOM.RECIPIENT_CITY);
        S.bind('content', 'recipient_country', DOM.RECIPIENT_COUNTRY);

        // Meta
        S.bind('content', 'special_notes', DOM.SPECIAL_NOTES);
        S.bind('content', 'location', DOM.LOCATION);
        S.bind('content', 'date', DOM.DATE); // Unified Date
        // [DEPRECATED] info_date binding removed

        // Info Block
        S.bind('content', 'info_your_ref', DOM.INFO_YOUR_REF);
        S.bind('content', 'info_your_msg_date', DOM.INFO_YOUR_MSG);
        S.bind('content', 'info_our_ref', DOM.INFO_OUR_REF);
        S.bind('content', 'info_contact_person', DOM.INFO_CONTACT);
        S.bind('content', 'info_phone', DOM.INFO_PHONE);
        S.bind('content', 'info_email', DOM.INFO_EMAIL);

        // Body Content
        S.bind('content', 'subject', DOM.SUBJECT);
        S.bind('content', 'salutation', DOM.SALUTATION);
        S.bind('content', 'body', DOM.BODY);
        S.bind('content', 'greeting', DOM.GREETING);

        // Footer & Signature
        S.bind('content', 'signature_company', 'signature-company'); // [TASK 6]
        S.bind('content', 'signature_prefix', 'signature-prefix');   // [TASK 6]
        S.bind('content', 'signature_name', DOM.SIG_NAME);
        S.bind('content', 'signature_role', DOM.SIG_ROLE);
        S.bind('content', 'attachment_hint', DOM.ATTACH_HINT);
        S.bind('content', 'attachments', DOM.ATTACH_LIST);
        S.bind('content', 'footer_col1', DOM.FOOTER_1);
        S.bind('content', 'footer_col2', DOM.FOOTER_2);
        S.bind('content', 'footer_col3', DOM.FOOTER_3);
    }

    async initLocationBias() {
        try {
            let profile = window.App.Storage.loadProfile();

            if (profile && profile.coords) {
                this.homeCoords = profile.coords;
                // window.App.Logger.log('Bias', 'Loaded coordinates from profile cache.'); // Verbose removed
                return;
            }

            if (profile && (profile.city || profile.zip)) {
                if (window.App.Logger) window.App.Logger.info('Bias', 'Geocoding profile address for proximity...');
                const coords = await window.App.API.geocode(`${profile.zip || ''} ${profile.city || ''}`);
                if (coords) {
                    this.homeCoords = coords;
                    profile.coords = coords;
                    window.App.Storage.saveProfile(profile);
                }
            }
        } catch (e) {
            if (window.App.Logger) window.App.Logger.error('Core', `Location Init Failed: ${e.message}`);
        }
    }

    attachEventListeners() {
        try {
            window.addEventListener('beforeunload', (e) => {
                if (this.isDirty) {
                    try {
                        const state = window.App.State.serialize();
                        localStorage.setItem(window.App.Constants.STORAGE.DATA, JSON.stringify(state));
                    } catch (err) { /* Ignore */ }
                    e.preventDefault();
                    e.returnValue = window.App.Config.TEXTS.ACTIONS.UNSAVED_WARNING;
                    return window.App.Config.TEXTS.ACTIONS.UNSAVED_WARNING;
                }
            });

            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) this.redo();
                    else this.undo();
                }
                else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            });

            // [TASK 3] Targeted Listener for Name Input
            if (this.ui.settings.els.apiKey) {
                this.ui.settings.els.apiKey.addEventListener('change', (e) => {
                    window.App.State.config.apiKey = e.target.value.trim();
                });
            }

            // [V9] Salutation Type Selector Listener (Radio Group)
            // Fix: Listen to all radios with name="recipientType"
            const salTypeRadios = document.querySelectorAll('input[name="recipientType"]');
            salTypeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        window.App.State.content.recipient_salut_type = e.target.value;
                        // Trigger Logic Refresh
                        this.handleSmartGreeting(window.App.State.content.recipient_name);
                    }
                });
            });

            this.ui.els.btnReset.addEventListener('click', () => this.clearAll());

            this.ui.els.btnProfile.addEventListener('click', () => {
                const profile = window.App.Storage.loadProfile();
                this.ui.loadProfileIntoUI(profile);
                const apiKeyInput = this.ui.settings.els.apiKey;
                if (apiKeyInput) apiKeyInput.value = window.App.State.config.apiKey || '';
                this.ui.els.profileDialog.showModal();
            });

            this.ui.els.profileDialog.addEventListener('close', async () => {
                if (this.ui.els.profileDialog.returnValue === 'save') {
                    // [VSCODE_INTELLISENSE] Check Email validation specifically for "soft warning"
                    const currentUI = this.ui.getProfileFromUI();
                    let warning = '';
                    if (currentUI.email && !currentUI.email.includes('@')) {
                        warning = ' (Hinweis: E-Mail scheint ungültig)';
                    }

                    this.ui.showToast(window.App.Constants.UI.TOASTS.PROFILE_SAVING, 'info');
                    await this.saveSenderProfile();
                    this.ui.showToast(window.App.Constants.UI.TOASTS.PROFILE_SAVED + warning, warning ? 'info' : 'success');
                }
            });

            this.ui.els.btnExport.addEventListener('click', () => this.triggerExport());

            if (this.ui.els.fileImport) {
                this.ui.els.fileImport.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) this.importFromJSON(file);
                });
                this.ui.els.btnImport.addEventListener('click', () => this.ui.els.fileImport.click());
            }

        } catch (e) {
            if (window.App.Logger) window.App.Logger.error('Core', `Listener Attachment Failed: ${e.message}`);
        }
    }

    async runAutocomplete(e) {
        try {
            const query = e.target.innerText.trim();
            if (query.length < 3) return this.ui.doc.clearSuggestions();

            const local = window.App.Storage.searchContacts(query);
            const config = window.App.State.config;

            const api = await window.App.API.fetchAddressSuggestions(query, config, this.homeCoords);

            // [SECURITY] XSS Prevention: Escape all display strings before rendering
            const safeLocal = local.map(i => ({ ...i, display: window.App.Utils.escapeHtml(i.display) }));
            const safeApi = api.map(i => ({ ...i, display: window.App.Utils.escapeHtml(i.display) }));

            this.ui.doc.renderSuggestions([...safeLocal, ...safeApi], (text) => {
                // For V9: Just put it in name for now if not structured
                window.App.State.content.recipient_name = text;
                this.handleSmartGreeting(text);
                this.debouncedValidation();
            });
        } catch (err) {
            if (window.App.Logger) window.App.Logger.error('Core', `Autocomplete Error: ${err.message}`);
        }
    }

    runQualityChecks() {
        try {
            // Check granular fields if available, else legacy
            let senderTxt = window.App.State.content.sender;
            if (!senderTxt) {
                senderTxt = [
                    window.App.State.content.sender_company,
                    window.App.State.content.sender_name,
                    window.App.State.content.sender_street,
                    window.App.State.content.sender_zip_city
                ].filter(Boolean).join('\n');
            }

            const senderIssues = window.App.Formatter.analyzeAddressQuality(senderTxt, 'sender');
            this.applyValidationUI(this.ui.doc.els.sender, senderIssues); // Might need target update for granular

            const fullRecipient = [
                window.App.State.content.recipient_company,
                window.App.State.content.recipient_name,
                window.App.State.content.recipient_street,
                `${window.App.State.content.recipient_zip} ${window.App.State.content.recipient_city}`
            ].filter(Boolean).join('\n');

            const recipientIssues = window.App.Formatter.analyzeAddressQuality(fullRecipient, 'recipient');
            // UI Feedback omitted for now to keep simplicity
        } catch (e) { /* Ignore */ }
    }

    applyValidationUI(el, issues) {
        if (!el) return;
        if (issues && issues.length > 0) {
            el.style.backgroundColor = 'rgba(255, 165, 0, 0.05)';
            el.title = issues.join(', ');
        } else {
            el.style.backgroundColor = '';
            el.title = '';
        }
    }

    checkContactStatus(text) { this.ui.setContactSavedState(!!window.App.Storage.findContactExact(text)); }

    applyState(data) {
        if (!data) return;

        // [FIX] Layout Flicker: Apply Layout Class IMMEDIATELY
        if (data.config && data.config.layout) {
             const layout = data.config.layout;
             const C = window.App.Constants;
             // Direct DOM manipulation for speed
             if (layout === C.LAYOUTS.FORM_B || layout === 'form_b') {
                 document.body.classList.remove('layout-form-a');
                 document.body.classList.add('layout-form-b');
             } else {
                 document.body.classList.remove('layout-form-b');
                 document.body.classList.add('layout-form-a');
             }
        }

        // [MIGRATION] Purge Deprecated Fields (Schema Cleanup)
        if (data.content && data.content.info_date) {
            delete data.content.info_date;
        }

        // [FIX] Date Stability: Ensure Date is never empty on load
        if (data.content && !data.content.date) {
             if (window.App.Logger) window.App.Logger.warn('Core', 'State loaded without Date -> Defaulting to Today');
             const today = new Date();
             const fmt = (data.config && data.config.dateFormat) ? data.config.dateFormat : 'de';
             // Store into the incoming data object before loading state
             data.content.date = window.App.Formatter.getFormattedDate(today, fmt);
        }

        // 1. Load Data into State Proxy
        window.App.State.load(data);

        // 2. Reset "Dirty" flags so automation can resume
        if (this.ui && this.ui.doc) {
            this.ui.doc.resetDirtyState();
        }

        // 3. Trigger Side Effects & Updates
        this.updateDocumentTitle(data.content.subject);
        this.refreshReturnLine();
        this.runQualityChecks();
        if (this.ui && this.ui.doc) this.ui.doc.checkPageOverflow();
        this.syncDateDropdown(data.content.date); // Update Dropdown on Load

        // [TASK 3] Ensure Formality Radio buttons and Ghost Text are synced
        if (this.ui.settings.syncUI) {
            this.ui.settings.syncUI(data.config);
        }

        // 4. Force Logic Refresh (Ensures correct greeting based on loaded tone)
        this.applyConfigSideEffects();
    }

    applyConfigSideEffects() {
        const config = window.App.State.config;
        const C = window.App.Constants;

        // Layout applied early in applyState for performance, but logic here ensures sync
        // redundant check is fine.

        if (config.font === C.FONTS.SERIF) {
            document.documentElement.style.setProperty('--font-stack', "'Times New Roman', 'Garamond', serif");
        } else {
            document.documentElement.style.setProperty('--font-stack', "'Aptos', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif");
        }

        this.ui.setFormalityValue(config.formality);
        this.updateDateDisplay();

        // Re-Evaluate Greeting when config changes (e.g. switching Formal -> Casual)
        // But respect the dirty flag if user manually edited it
        this.handleSmartGreeting(window.App.State.content.recipient_name);
    }

    async saveSenderProfile() {
        const profile = this.ui.getProfileFromUI();

        if (profile.city || profile.zip) {
            try {
                const query = `${profile.zip || ''} ${profile.city || ''}`.trim();
                if (query.length > 2) {
                    const coords = await window.App.API.geocode(query);
                    if (coords) {
                        profile.coords = coords;
                        this.homeCoords = coords;
                    }
                }
            } catch (e) { /* Logged in API */ }
        }

        window.App.Storage.saveProfile(profile);

        const apiKeyInput = this.ui.settings.els.apiKey;
        if (apiKeyInput) {
            window.App.State.config.apiKey = apiKeyInput.value.trim();
        }

        this.updateSenderFromProfile(profile);
    }

    loadSenderProfile() {
        const profile = window.App.Storage.loadProfile();
        this.updateSenderFromProfile(profile);
        if (profile.city) window.App.State.content.location = profile.city;
    }

    updateSenderFromProfile(profile) {
        // Update Granular V9 fields
        window.App.State.content.sender_company = profile.company || '';
        window.App.State.content.sender_name = profile.name || '';
        window.App.State.content.sender_street = profile.street || '';
        window.App.State.content.sender_zip_city = (profile.zip && profile.city) ? `${profile.zip} ${profile.city}` : (profile.zip || profile.city || '');
        window.App.State.content.sender_phone = profile.phone ? `Tel: ${profile.phone}` : '';
        window.App.State.content.sender_email = profile.email || '';

        // [TASK 6] Corporate Signature Auto-Fill
        // Logic: If company exists in profile -> fill signature_company
        // Check dirty flag to allow user to delete it manually
        if (!this.ui.doc.isSignatureDirty) {
            if (profile.company) {
                window.App.State.content.signature_company = profile.company;
            } else {
                window.App.State.content.signature_company = '';
            }

            // [FIX] Also sync Name to Signature
            if (profile.name) {
                window.App.State.content.signature_name = profile.name;
            }
        }

        // [TASK 6] Corporate Signature Auto-Fill

        this.runQualityChecks();
    }

    /**
     * [TASK 3] SMART DATE 2.0 (Aggressive Force)
     * Reformat if valid, even if dirty.
     */
    updateDateDisplay(forceToday = false) {
        // 1. Get Current Value from DOM (Read from element directly if possible, or state)
        const currentVal = window.App.State.content.date;
        const targetFormat = window.App.State.config.dateFormat;

        // 2. Handle Empty or Force Today
        if (forceToday || !currentVal || !currentVal.trim()) {
            const dateObj = new Date();
            const formatted = window.App.Formatter.getFormattedDate(dateObj, targetFormat);
            window.App.State.content.date = formatted;
            if (this.ui && this.ui.doc) this.ui.doc.isDateDirty = false;
            return;
        }

        // 3. Try Smart Parse
        const iso = window.App.Formatter.toISODate(currentVal);

        if (iso) {
            // Valid Date detected! Reformat to target format.
            const dateObj = new Date(iso);
            const formatted = window.App.Formatter.getFormattedDate(dateObj, targetFormat);

            // Apply Update
            window.App.State.content.date = formatted;

            // Reset dirty flag because it is now machine-standardized
            if (this.ui && this.ui.doc) this.ui.doc.isDateDirty = false;

            // Visual Confirmation REMOVED per User Request
            if (window.App.Logger && formatted !== currentVal) {
                window.App.Logger.info('Date', 'Date silently re-formatted by Smart Logic');
            }
        } else {
            // 4. Invalid/Free Text -> Guard
            if (window.App.Logger && !forceToday) window.App.Logger.info('Date', 'Unrecognized format (kept as text)');
            // DO NOT change text
        }
    }

    /**
     * [TASK 3] Subject Cleaner (The DIN Guard)
     * Automatically strips "Betreff:" prefixes.
     */
    guardSubjectLine(text) {
        if (!text) return;
        const triggerRegex = /^(Betreff:|Betr\.|Betreff)\s*/i;

        if (triggerRegex.test(text)) {
            const clean = text.replace(triggerRegex, '');
            // Update State (will update DOM via binding)
            window.App.State.content.subject = clean;

            if (this.ui && window.App.Logger) {
                // Silent correction
                window.App.Logger.info('Core', 'Subject Prefix removed');
            }
        }
    }

    /**
     * [TASK 1] Helper to sync date options from state change
     */
    syncDateDropdown(dateStr) {
        if (!dateStr) return;
        const iso = window.App.Formatter.toISODate(dateStr);
        if (iso) {
            const dateObj = new Date(iso);
            this.ui.settings.refreshDateOptions(dateObj);
        }
    }

    triggerExport() {
        this.ui.showToast(window.App.Constants.UI.TOASTS.BACKUP_PENDING, 'info');
        const data = window.App.State.serialize();
        try {
            if (window.App.Storage.exportToJSON(data)) {
                this.ui.showToast(window.App.Constants.UI.TOASTS.EXPORT_SUCCESS, 'success');
            } else {
                throw new Error("Validation Failed");
            }
        } catch (e) {
            if (window.App.Logger) window.App.Logger.error('Export', `Failed: ${e.message}`);
            this.ui.showToast(window.App.Constants.UI.TOASTS.EXPORT_FAIL, 'error');
        }
    }

    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const validData = window.App.Storage.validateAndRepair(data);
                this.applyState(validData);
                this.ui.showToast(window.App.Constants.UI.TOASTS.IMPORT_SUCCESS, 'success');
                if (window.App.Logger) window.App.Logger.info('Storage', `Imported JSON: V${validData._version}`);
            } catch (err) {
                this.ui.showToast(window.App.Constants.UI.TOASTS.IMPORT_FAIL, 'error');
                if (window.App.Logger) window.App.Logger.error('Storage', `Import Failed: ${err.message}`);
            }
        };
        reader.readAsText(file);
    }

    async clearAll(skipConfirm = false) {
        if (skipConfirm || await this.ui.confirmAction(window.App.Config.TEXTS.ACTIONS.CONFIRM_DELETE)) {
            // [FIX] Atomic Reset Strategy (No Blink)
            // 1. Load Base Schema
            const schema = window.App.Storage.getDefaultSchema();

            // 2. Enforce Config Defaults
            schema.config.layout = window.App.Constants.LAYOUTS.FORM_A;
            schema.config.formality = 'formal';
            schema.config.dateFormat = 'de'; // [FIX] Hardcoded for safety

            const currentKey = window.App.State.config.apiKey || '';
            schema.config.apiKey = currentKey;
            schema.config.provider = (currentKey && currentKey.length > 5) ? 'geoapify' : 'photon';

            // 3. Enforce Content Defaults (Clean State)
            if (schema.content) {
                schema.content.recipient_salut_type = 'none';
                schema.content.recipient_salutation = '';
                schema.content.subject = '';
                schema.content.body = '';
                schema.content.info_your_ref = '';
                schema.content.info_our_ref = '';
                // Clear granular fields just in case default schema has junk
                schema.content.recipient_name = '';
                schema.content.recipient_company = '';
                schema.content.recipient_street = '';
                schema.content.recipient_zip = '';
                schema.content.recipient_city = '';
            }

            // 4. PRE-FILL SENDER PROFILE (Atomic Merge)
            const profile = window.App.Storage.loadProfile();
            if (profile) {
                const C = schema.content;
                C.sender_company = profile.company || '';
                C.sender_name = profile.name || '';
                C.sender_street = profile.street || '';
                C.sender_zip_city = (profile.zip && profile.city) ? `${profile.zip} ${profile.city}` : (profile.zip || profile.city || '');
                C.sender_phone = profile.phone ? `Tel: ${profile.phone}` : '';
                C.sender_email = profile.email || '';

                // Signature Sync
                C.signature_company = profile.company || '';
                C.signature_name = profile.name || ''; // Sync name too

                if (profile.city) C.location = profile.city;
            }

            // 5. PRE-FILL DATE (Atomic Merge)
            const dateObj = new Date();
            const formattedDate = window.App.Formatter.getFormattedDate(dateObj, schema.config.dateFormat);
            schema.content.date = formattedDate;

            // 6. APPLY EVERYTHING IN ONE GO
            this.applyState(schema);

            // [FIX] Force Date Display Update immediately after reset
            this.updateDateDisplay(true);

            // [FIX] Nuclear Option: Manually force the DOM value to bypass any race conditions
            const resetDateVal = window.App.Formatter.getFormattedDate(new Date(), 'de');
            const domDateInfo = document.getElementById('info-date');
            if (domDateInfo) {
                domDateInfo.innerText = resetDateVal;
                // Also update the sidebar date picker visual if possible (it's native but we can try)
            }

            // [FIX] Delayed check to ensure State Proxy didn't revert it
            setTimeout(() => {
                if (window.App.State.content.date !== resetDateVal) {
                    window.App.State.content.date = resetDateVal;
                    this.updateDateDisplay(true);
                }
            }, 150);

            // 7. Post-Apply Cleanup
            // We manually set the date in schema, so dirty flag might be reset by applyState?
            // applyState calls resetDirtyState(), so we are good.

            this.ui.doc.isSalutationDirty = false; // Ensure Salutation Engine takes over
            this.ui.doc.isSignatureDirty = false;  // Allow signature to match profile

            // 8. Trigger Greeting Update (Clean Slate -> 'Sehr geehrte Damen und Herren')
            this.handleSmartGreeting('');

            // [TASK] Post-Reset Verification (Audit)
            setTimeout(() => {
                const report = this.verifyResetState();
                if (report.clean) {
                    this.ui.showToast(window.App.Constants.UI.TOASTS.RESET_SUCCESS, 'success');
                    if (window.App.Logger) window.App.Logger.success('Reset', 'Atomic Reset Complete ✅');
                } else {
                    // [FIX] Silent correction if date missing
                    if (!window.App.State.content.date) this.updateDateDisplay(true);

                    this.ui.showToast(window.App.Constants.UI.TOASTS.RESET_WARN, 'warn');
                    if (window.App.Logger) window.App.Logger.error('Reset', `Zombie Fields: ${report.zombies.join(', ')}`);
                }
            }, 50);
        }
    }

    /**
     * [TASK] Verifies that the specific User-Input fields are truly empty.
     * Ignores Auto-Fill fields (Sender, Date, Location).
     */
    verifyResetState() {
        const C = window.App.State.content;
        const zombies = [];
        const details = {};

        // Fields that MUST be empty/default
        const mustBeEmpty = {
            'subject': '',
            'body': '',
            'recipient_name': '',
            'recipient_company': '',
            'recipient_street': '',
            'recipient_city': '',
            'special_notes': '',
            'info_your_ref': '',
            'info_our_ref': ''
        };

        // Check Content
        Object.keys(mustBeEmpty).forEach(key => {
            const val = C[key];
            if (val && val.trim() !== '') {
                zombies.push(key);
                details[key] = val;
            }
        });

        // Check Recipient Type (Must be 'none', not '' or 'female')
        if (C.recipient_salut_type !== 'none') {
             zombies.push(`recipient_salut_type='${C.recipient_salut_type}'`);
             details['recipient_salut_type'] = C.recipient_salut_type;
        }

        return {
            clean: zombies.length === 0,
            zombies: zombies,
            details: details
        };
    }

    touch() {
        this.isDirty = true;
        this.ui.updateSaveStatus('saving');
        this.debouncedSave();
        if (!this.isNavigatingHistory) this.debouncedHistory();
    }

    async performSave() {
        try {
            if (!this.isDirty) return;
            if (await window.App.Storage.saveLocal(window.App.State.serialize())) {
                this.isDirty = false;
                this.ui.updateSaveStatus('saved');
                // [TASK 3] Storage Logging
                if (window.App.Logger) window.App.Logger.success('Storage', 'State saved to LocalStorage');
            } else {
                this.ui.updateSaveStatus('error');
            }
        } catch (e) {
            this.ui.updateSaveStatus('error');
        }
    }

    async load() {
        try {
            const data = await window.App.Storage.loadLocal();
            if (data) {
                this.applyState(data);
                if (window.App.Logger) window.App.Logger.info('Storage', 'State loaded from LocalStorage');
            }
        } catch (e) {
            if (window.App.Logger) window.App.Logger.error('Core', `Load Failed: ${e.message}`);
        }
    }

    refreshReturnLine() {
        try {
            // Prefer V9 granular data if available
            const C = window.App.State.content;
            let line = '';

            if (C.sender_name || C.sender_company) {
                // Construct from granular
                const parts = [];
                if (C.sender_name) parts.push(C.sender_name);
                if (C.sender_street) parts.push(C.sender_street);
                if (C.sender_zip_city) parts.push(C.sender_zip_city);
                line = parts.join(', ');
            } else {
                // Fallback to legacy parsing
                line = window.App.Formatter.deriveReturnLine(C.sender);
            }

            this.ui.updateReturnLine(line);
        } catch (e) { /* Ignore */ }
    }

    /**
     * [TASK 2] Smart Greeting Logic Update with Logging
     * Respects user's manual edits and Formality settings.
     */
    /**
     * [TASK 2] Smart Greeting Logic Update with Logging
     * Respects user's manual edits and Formality settings.
     * @param {string} text - The Recipient Name
     * @param {string|null} [manualSalutationText] - Optional: Current text of the Salutation Field
     * @param {boolean} [force] - Force update even if dirty
     */
    handleSmartGreeting(text, manualSalutationText = null, force = false) {
        try {
            // [LEGACY] Adapter removed 2026.

            let type = window.App.State.content.recipient_salut_type; // [V9] Explicit Type (male/female/none)

            // 1. Manual Override Check (Unless Forced or Logic Refresh)
            // But we WANT to update if the user edits Recipient fields manually.
            // If the user edits the LETTER SALUTATION (Subject/Body area), that's `isSalutationDirty`.
            // If the user edits the RECIPIENT ADDRESS, we SHOULD update the letter salutation.

            if (this.ui.doc.isSalutationDirty && !manualSalutationText && !force) {
                // If dirty, and this comes from some other event (e.g. layout change), ignore.
                // But if manualSalutationText is provided, it comes from USER INPUT on the address, so we proceed.
                if (window.App.Logger) window.App.Logger.info('Salutation', 'Manual override active. Automation skipped.');
                // However, if we changed Formality (Force), we proceed.
                return;
            }

            // [FIX] Sidebar Authority: If forced, reset the dirty flag so future typing works again
            if (force) {
                 this.ui.doc.isSalutationDirty = false;
            }

            // 2. Determine Gender/Type from Sources
            // Priority: Sidebar Type > Manual Text Field > Name Parser

            let effectiveType = type;
            const currentSalutationField = manualSalutationText !== null ? manualSalutationText : (window.App.State.content.recipient_salutation || '');

            if (type === 'none') {
                // Try to infer from Field
                if (/(Herr|Herrn)/i.test(currentSalutationField)) effectiveType = 'male';
                else if (/(Frau)/i.test(currentSalutationField)) effectiveType = 'female';
                else if (/(Familie|Eheleute)/i.test(currentSalutationField)) effectiveType = 'family';
            }

            // Safe Parse
            const analysis = text ? window.App.Formatter.parseRecipient(text) : { gender: '?', name: '' };
            if (text && !analysis.name) analysis.raw = text;

            // If Parser found gender and type is none/auto, use parser?
            // Actually parser looks for "Herr" in the name field.
            // effectiveType should guide deriveSalutation.

            const formality = window.App.State.config.formality;

            // [TASK 2] Logic Trace
            if (window.App.Logger) {
                 window.App.Logger.info('Salutation', `Analyzing name: "${text}" | Field: "${currentSalutationField}" | Type: ${effectiveType}`);
            }

            // 3. Generate Letter Greeting
            const s = window.App.Formatter.deriveSalutation(analysis, formality, effectiveType);
            const c = window.App.Formatter.deriveClosing(formality);

            if (s !== window.App.State.content.salutation) {
                window.App.State.content.salutation = s;
                if (window.App.Logger) window.App.Logger.success('Salutation', `Updated to: "${s}"`);
            }
            window.App.State.content.greeting = c;

            // 4. Sync Recipient Salutation Field (Address Block)
            // Only if NOT manually editing that specific field right now (manualSalutationText === null)
            // AND if explicit type demands it.

            if (manualSalutationText === null) {
                let salutFieldTarget = currentSalutationField;

                // If Sidebar is Specific, Enforce it.
                if (type === 'male') salutFieldTarget = 'Herrn';
                else if (type === 'female') salutFieldTarget = 'Frau';
                else if (type === 'none') {
                     // [FIX] Explicit Clear if user selects "Keine"
                     // The user wants to reset/remove the auto-inserted "Frau"/"Herrn"
                     salutFieldTarget = '';
                }

                // Apply if changed
                if (salutFieldTarget !== window.App.State.content.recipient_salutation) {
                    window.App.State.content.recipient_salutation = salutFieldTarget;
                    const elSalutation = document.getElementById('recipient-salutation');
                    if (elSalutation) elSalutation.innerText = salutFieldTarget;
                }
            } else {
                // If manual input, we accept it as state
                window.App.State.content.recipient_salutation = manualSalutationText;
            }

        } catch (e) { console.error(e); /* Ignore */ }
    }

    updateDocumentTitle(text) {
        const base = 'Brief-Generator';
        const subject = text ? text.trim() : '';
        document.title = subject ? `${subject} - ${base}` : base;
    }

    triggerPanicMode(e) {
        if (window.App.Logger) window.App.Logger.error('Core', `CRITICAL ERROR: ${e.message}`);
    }

    pushHistory() {
        const currentState = window.App.State.serialize();
        if (this.historyIndex >= 0) {
            const previous = this.historyStack[this.historyIndex];
            if (JSON.stringify(previous.content) === JSON.stringify(currentState.content)) return;
        }
        this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
        this.historyStack.push(window.App.Utils.deepClone(currentState));
        this.historyIndex++;

        if (this.historyStack.length > this.MAX_HISTORY) {
            this.historyStack.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.isNavigatingHistory = true;
            this.applyState(this.historyStack[this.historyIndex]);
            this.isNavigatingHistory = false;
            this.ui.showToast(window.App.Constants.UI.TOASTS.UNDO, 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.historyStack.length - 1) {
            this.historyIndex++;
            this.isNavigatingHistory = true;
            this.applyState(this.historyStack[this.historyIndex]);
            this.isNavigatingHistory = false;
            this.ui.showToast(window.App.Constants.UI.TOASTS.REDO, 'info');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.App.Core = new CoreApp();
    window.App.Core.init();
});
</script>
  </body>
</html>
</content>
</file>

<file path="Neuer Ordner/modern-profile-modal (1) - Kopie.html">
<metadata>Lines: 578 | Size: 17159 B</metadata>
<content>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Profile Modal</title>
  <style>
    :root {
      --color-bg: #f8f9fa;
      --color-surface: #ffffff;
      --color-surface-secondary: #f1f3f5;
      --color-border: #dee2e6;
      --color-border-focus: #4a90e2;
      --color-text-primary: #212529;
      --color-text-secondary: #495057;
      --color-text-muted: #6c757d;
      --color-primary: #4a90e2;
      --color-primary-hover: #357abd;
      --color-secondary: #e9ecef;
      --color-secondary-hover: #dee2e6;
      --color-danger: #dc3545;
      --color-danger-hover: #c82333;
      --color-danger-bg: rgba(220, 53, 69, 0.1);

      --spacing-xs: 0.25rem;
      --spacing-sm: 0.5rem;
      --spacing-md: 0.75rem;
      --spacing-lg: 1rem;
      --spacing-xl: 1.5rem;
      --spacing-2xl: 2rem;

      --radius-sm: 0.375rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;

      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;

      --transition-base: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: var(--spacing-2xl);
      font-family: var(--font-sans);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-block-size: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xl);
    }

    /* Dialog Base Styles */
    dialog {
      border: none;
      padding: 0;
      background: var(--color-surface);
      box-shadow: var(--shadow-xl);
      position: relative;
      overflow: hidden;
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      animation: fadeIn var(--transition-base);
    }

    /* Dialog Animation */
    dialog[open] {
      animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Profile Dialog Specific */
    #profile-dialog {
      max-inline-size: 600px;
      inline-size: 100%;
      border-radius: var(--radius-xl);
    }

    /* Confirmation Dialog Specific */
    #confirmation-dialog {
      max-inline-size: 400px;
      inline-size: 100%;
      border-radius: var(--radius-xl);
      text-align: center;
    }

    /* Close Button */
    .dialog-close-x {
      position: absolute;
      inset-block-start: var(--spacing-lg);
      inset-inline-end: var(--spacing-lg);
      inline-size: 2rem;
      block-size: 2rem;
      border: none;
      background: var(--color-secondary);
      color: var(--color-text-secondary);
      font-size: 1.5rem;
      line-height: 1;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .dialog-close-x:hover {
      background: var(--color-secondary-hover);
      color: var(--color-text-primary);
    }

    /* Form Container */
    form {
      display: flex;
      flex-direction: column;
      block-size: 100%;
    }

    /* Header */
    h2 {
      margin: 0;
      padding: var(--spacing-2xl);
      padding-inline-end: 4rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
      border-block-end: 1px solid var(--color-border);
    }

    .subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: 0;
      padding-inline: var(--spacing-2xl);
      padding-block-start: var(--spacing-md);
      padding-block-end: var(--spacing-lg);
      line-height: 1.5;
    }

    /* Content Area - NO SCROLL */
    .dialog-content-no-scroll {
      padding: var(--spacing-2xl);
      flex: 1;
      overflow: visible;
    }

    /* Fieldset */
    fieldset {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--spacing-xl);
      margin: 0;
      background: var(--color-surface-secondary);
    }

    legend {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
      padding-inline: var(--spacing-sm);
      margin-inline-start: -var(--spacing-sm);
    }

    /* Form Groups */
    .form-group {
      margin-block-end: var(--spacing-xl);
    }

    .form-group:last-child {
      margin-block-end: 0;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-block-end: var(--spacing-sm);
    }

    label small {
      font-weight: 400;
      color: var(--color-text-muted);
    }

    /* Input Styles */
    input[type="text"],
    input[type="tel"] {
      inline-size: 100%;
      padding-block: var(--spacing-md);
      padding-inline: var(--spacing-lg);
      font-size: 0.9375rem;
      font-family: var(--font-sans);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-text-primary);
      transition: all var(--transition-base);
      outline: none;
    }

    input:hover {
      border-color: var(--color-text-muted);
    }

    input:focus {
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    input::placeholder {
      color: var(--color-text-muted);
    }

    /* Row Layout */
    .row {
      display: flex;
      gap: var(--spacing-lg);
    }

    .row .form-group {
      flex: 1;
      margin-block-end: var(--spacing-xl);
    }

    /* IBAN Special Styling */
    .iban-wrapper {
      position: relative;
      inline-size: 100%;
    }

    .iban-text {
      font-family: var(--font-mono);
      font-size: 0.9375rem;
      letter-spacing: 0.02em;
      padding-block: var(--spacing-md);
      padding-inline: var(--spacing-lg);
    }

    #iban-ghost {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      inline-size: 100%;
      block-size: 100%;
      pointer-events: none;
      color: var(--color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      z-index: 1;
    }

    #profile-iban {
      position: relative;
      background: transparent;
      z-index: 2;
    }

    .invisible {
      visibility: hidden;
    }

    /* Actions */
    .dialog-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      padding: var(--spacing-xl) var(--spacing-2xl);
      border-block-start: 1px solid var(--color-border);
      background: var(--color-surface-secondary);
      border-end-start-radius: var(--radius-xl);
      border-end-end-radius: var(--radius-xl);
    }

    /* Buttons */
    .btn {
      padding-block: var(--spacing-md);
      padding-inline: var(--spacing-xl);
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: var(--font-sans);
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all var(--transition-base);
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn.secondary {
      background: var(--color-secondary);
      color: var(--color-text-primary);
      border-color: var(--color-border);
    }

    .btn.secondary:hover {
      background: var(--color-secondary-hover);
    }

    .btn.primary {
      background: var(--color-primary);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn.primary:hover {
      background: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
    }

    .btn.danger {
      background: var(--color-danger);
      border-color: var(--color-danger);
      color: white;
    }

    .btn.danger:hover {
      background: var(--color-danger-hover);
    }

    .btn:active {
      transform: scale(0.98);
    }

    /* Confirmation Dialog Styles */
    #confirmation-dialog form {
      padding: var(--spacing-2xl);
    }

    .icon-wrapper {
      inline-size: 60px;
      block-size: 60px;
      background: var(--color-danger-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-xl) auto;
    }

    #confirmation-dialog h2 {
      border: none;
      padding: 0;
      margin-block-end: var(--spacing-md);
      font-weight: 700;
      font-size: 1.25rem;
    }

    #confirmation-dialog p {
      margin-block-end: var(--spacing-2xl);
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    #confirmation-dialog .dialog-actions {
      justify-content: center;
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: none;
      padding: 0;
      background: transparent;
    }

    /* Demo Button */
    .demo-button {
      padding: var(--spacing-lg) var(--spacing-2xl);
      font-size: 1rem;
      font-weight: 600;
      background: white;
      color: var(--color-primary);
      border: none;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .demo-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }
  </style>
</head>
<body>
  <button class="demo-button" onclick="document.getElementById('profile-dialog').showModal()">
    Profil Modal öffnen
  </button>

  <button class="demo-button" onclick="document.getElementById('confirmation-dialog').showModal()">
    Bestätigungs Modal öffnen
  </button>

  <dialog id="profile-dialog" aria-labelledby="profile-title">
    <button type="button" class="dialog-close-x" onclick="document.getElementById('profile-dialog').close()" aria-label="Schließen">
      ×
    </button>
    <form method="dialog">
      <h2 id="profile-title">👤 Absender</h2>
      <p class="subtitle">
        Diese Daten werden nach Reset automatisch in den Briefkopf geladen.
      </p>
      <div class="dialog-content-no-scroll">
        <fieldset>
          <legend>Identität & Adresse</legend>
          <div class="form-group">
            <label for="profile-company">Firma</label>
            <input type="text" id="profile-company" placeholder="Muster GmbH" autocomplete="organization">
          </div>
          <div class="form-group">
            <label for="profile-name">Voller Name</label>
            <input type="text" id="profile-name" placeholder="Max Mustermann" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="profile-street">Straße & Hausnummer</label>
            <input type="text" id="profile-street" placeholder="Musterstraße 1" autocomplete="street-address">
          </div>
          <div class="row">
            <div class="form-group" style="flex: 1">
              <label for="profile-zip">PLZ</label>
              <input type="text" id="profile-zip" placeholder="12345" autocomplete="postal-code" inputmode="numeric">
            </div>
            <div class="form-group" style="flex: 2">
              <label for="profile-city">Stadt</label>
              <input type="text" id="profile-city" placeholder="Musterstadt" autocomplete="address-level2">
            </div>
          </div>
          <div class="row">
            <div class="form-group">
              <label for="profile-phone">Telefon</label>
              <input type="tel" id="profile-phone" placeholder="0123 456789" autocomplete="tel">
            </div>
            <div class="form-group">
              <label for="profile-email">E-Mail</label>
              <input type="text" id="profile-email" placeholder="max@beispiel.de" autocomplete="email">
            </div>
          </div>
          <div class="form-group">
            <label for="profile-iban">IBAN (für Fußzeile) - <small>Eingabehilfe aktiv</small></label>
            <div class="iban-wrapper">
              <div id="iban-ghost" class="iban-text" aria-hidden="true"><span class="invisible"></span>DE00 0000 0000 0000 0000 00</div>
              <input type="text" id="profile-iban" class="iban-text" placeholder="" maxlength="34" autocomplete="off" spellcheck="false">
            </div>
          </div>
        </fieldset>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn secondary" onclick="document.getElementById('profile-dialog').close()">
          Abbrechen
        </button>
        <button type="button" class="btn primary" id="btn-profile-done">
          Fertig
        </button>
      </div>
    </form>
  </dialog>

  <dialog id="confirmation-dialog" aria-labelledby="confirm-title">
    <form method="dialog">
      <div class="icon-wrapper">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </div>
      <h2 id="confirm-title">Dokument Resetten?</h2>
      <p id="confirm-message">Bist du dir sicher das du den Brief löschen möchtest?</p>
      <div class="dialog-actions">
        <button type="button" class="btn secondary" value="cancel" id="btn-confirm-cancel">
          Abbruch
        </button>
        <button type="button" class="btn primary danger" value="confirm" id="btn-confirm-ok">
          Reset
        </button>
      </div>
    </form>
  </dialog>

  <script>
    // IBAN Ghost Text Logic - UPDATED to handle longer IBANs
    const ibanInput = document.getElementById('profile-iban');
    const ibanGhost = document.getElementById('iban-ghost');
    const ghostTemplate = 'DE00 0000 0000 0000 0000 0000 0000'; // Extended template

    ibanInput.addEventListener('input', function(e) {
      const rawValue = e.target.value.replace(/\s+/g, '').toUpperCase();
      let formatted = '';

      for (let i = 0; i < rawValue.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += rawValue[i];
      }

      e.target.value = formatted;

      // Update ghost text
      const invisiblePart = formatted || '';
      const visiblePart = ghostTemplate.substring(formatted.length);

      ibanGhost.innerHTML = `<span class="invisible">${invisiblePart}</span>${visiblePart}`;
    });

    // Prevent numbers in city field
    document.getElementById('profile-city').addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[0-9]/g, '');
    });

    // Done button handler
    document.getElementById('btn-profile-done').addEventListener('click', function() {
      console.log('Profile saved:', {
        company: document.getElementById('profile-company').value,
        name: document.getElementById('profile-name').value,
        street: document.getElementById('profile-street').value,
        zip: document.getElementById('profile-zip').value,
        city: document.getElementById('profile-city').value,
        phone: document.getElementById('profile-phone').value,
        email: document.getElementById('profile-email').value,
        iban: document.getElementById('profile-iban').value
      });
      document.getElementById('profile-dialog').close();
    });

    // Confirmation dialog handlers
    document.getElementById('btn-confirm-cancel').addEventListener('click', function() {
      document.getElementById('confirmation-dialog').close();
    });

    document.getElementById('btn-confirm-ok').addEventListener('click', function() {
      console.log('Document reset confirmed');
      document.getElementById('confirmation-dialog').close();
    });

    // Auto-open profile modal for demo
    window.addEventListener('load', function() {
      setTimeout(() => {
        document.getElementById('profile-dialog').showModal();
      }, 300);
    });
  </script>
</body>
</html>
</content>
</file>

<file path="Neuer Ordner/modern-profile-modal (1).html">
<metadata>Lines: 578 | Size: 17159 B</metadata>
<content>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Profile Modal</title>
  <style>
    :root {
      --color-bg: #f8f9fa;
      --color-surface: #ffffff;
      --color-surface-secondary: #f1f3f5;
      --color-border: #dee2e6;
      --color-border-focus: #4a90e2;
      --color-text-primary: #212529;
      --color-text-secondary: #495057;
      --color-text-muted: #6c757d;
      --color-primary: #4a90e2;
      --color-primary-hover: #357abd;
      --color-secondary: #e9ecef;
      --color-secondary-hover: #dee2e6;
      --color-danger: #dc3545;
      --color-danger-hover: #c82333;
      --color-danger-bg: rgba(220, 53, 69, 0.1);

      --spacing-xs: 0.25rem;
      --spacing-sm: 0.5rem;
      --spacing-md: 0.75rem;
      --spacing-lg: 1rem;
      --spacing-xl: 1.5rem;
      --spacing-2xl: 2rem;

      --radius-sm: 0.375rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;

      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;

      --transition-base: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: var(--spacing-2xl);
      font-family: var(--font-sans);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-block-size: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xl);
    }

    /* Dialog Base Styles */
    dialog {
      border: none;
      padding: 0;
      background: var(--color-surface);
      box-shadow: var(--shadow-xl);
      position: relative;
      overflow: hidden;
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      animation: fadeIn var(--transition-base);
    }

    /* Dialog Animation */
    dialog[open] {
      animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Profile Dialog Specific */
    #profile-dialog {
      max-inline-size: 600px;
      inline-size: 100%;
      border-radius: var(--radius-xl);
    }

    /* Confirmation Dialog Specific */
    #confirmation-dialog {
      max-inline-size: 400px;
      inline-size: 100%;
      border-radius: var(--radius-xl);
      text-align: center;
    }

    /* Close Button */
    .dialog-close-x {
      position: absolute;
      inset-block-start: var(--spacing-lg);
      inset-inline-end: var(--spacing-lg);
      inline-size: 2rem;
      block-size: 2rem;
      border: none;
      background: var(--color-secondary);
      color: var(--color-text-secondary);
      font-size: 1.5rem;
      line-height: 1;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .dialog-close-x:hover {
      background: var(--color-secondary-hover);
      color: var(--color-text-primary);
    }

    /* Form Container */
    form {
      display: flex;
      flex-direction: column;
      block-size: 100%;
    }

    /* Header */
    h2 {
      margin: 0;
      padding: var(--spacing-2xl);
      padding-inline-end: 4rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
      border-block-end: 1px solid var(--color-border);
    }

    .subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: 0;
      padding-inline: var(--spacing-2xl);
      padding-block-start: var(--spacing-md);
      padding-block-end: var(--spacing-lg);
      line-height: 1.5;
    }

    /* Content Area - NO SCROLL */
    .dialog-content-no-scroll {
      padding: var(--spacing-2xl);
      flex: 1;
      overflow: visible;
    }

    /* Fieldset */
    fieldset {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--spacing-xl);
      margin: 0;
      background: var(--color-surface-secondary);
    }

    legend {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
      padding-inline: var(--spacing-sm);
      margin-inline-start: -var(--spacing-sm);
    }

    /* Form Groups */
    .form-group {
      margin-block-end: var(--spacing-xl);
    }

    .form-group:last-child {
      margin-block-end: 0;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-block-end: var(--spacing-sm);
    }

    label small {
      font-weight: 400;
      color: var(--color-text-muted);
    }

    /* Input Styles */
    input[type="text"],
    input[type="tel"] {
      inline-size: 100%;
      padding-block: var(--spacing-md);
      padding-inline: var(--spacing-lg);
      font-size: 0.9375rem;
      font-family: var(--font-sans);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-text-primary);
      transition: all var(--transition-base);
      outline: none;
    }

    input:hover {
      border-color: var(--color-text-muted);
    }

    input:focus {
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    input::placeholder {
      color: var(--color-text-muted);
    }

    /* Row Layout */
    .row {
      display: flex;
      gap: var(--spacing-lg);
    }

    .row .form-group {
      flex: 1;
      margin-block-end: var(--spacing-xl);
    }

    /* IBAN Special Styling */
    .iban-wrapper {
      position: relative;
      inline-size: 100%;
    }

    .iban-text {
      font-family: var(--font-mono);
      font-size: 0.9375rem;
      letter-spacing: 0.02em;
      padding-block: var(--spacing-md);
      padding-inline: var(--spacing-lg);
    }

    #iban-ghost {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      inline-size: 100%;
      block-size: 100%;
      pointer-events: none;
      color: var(--color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      z-index: 1;
    }

    #profile-iban {
      position: relative;
      background: transparent;
      z-index: 2;
    }

    .invisible {
      visibility: hidden;
    }

    /* Actions */
    .dialog-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      padding: var(--spacing-xl) var(--spacing-2xl);
      border-block-start: 1px solid var(--color-border);
      background: var(--color-surface-secondary);
      border-end-start-radius: var(--radius-xl);
      border-end-end-radius: var(--radius-xl);
    }

    /* Buttons */
    .btn {
      padding-block: var(--spacing-md);
      padding-inline: var(--spacing-xl);
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: var(--font-sans);
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all var(--transition-base);
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn.secondary {
      background: var(--color-secondary);
      color: var(--color-text-primary);
      border-color: var(--color-border);
    }

    .btn.secondary:hover {
      background: var(--color-secondary-hover);
    }

    .btn.primary {
      background: var(--color-primary);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn.primary:hover {
      background: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
    }

    .btn.danger {
      background: var(--color-danger);
      border-color: var(--color-danger);
      color: white;
    }

    .btn.danger:hover {
      background: var(--color-danger-hover);
    }

    .btn:active {
      transform: scale(0.98);
    }

    /* Confirmation Dialog Styles */
    #confirmation-dialog form {
      padding: var(--spacing-2xl);
    }

    .icon-wrapper {
      inline-size: 60px;
      block-size: 60px;
      background: var(--color-danger-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-xl) auto;
    }

    #confirmation-dialog h2 {
      border: none;
      padding: 0;
      margin-block-end: var(--spacing-md);
      font-weight: 700;
      font-size: 1.25rem;
    }

    #confirmation-dialog p {
      margin-block-end: var(--spacing-2xl);
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    #confirmation-dialog .dialog-actions {
      justify-content: center;
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: none;
      padding: 0;
      background: transparent;
    }

    /* Demo Button */
    .demo-button {
      padding: var(--spacing-lg) var(--spacing-2xl);
      font-size: 1rem;
      font-weight: 600;
      background: white;
      color: var(--color-primary);
      border: none;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .demo-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }
  </style>
</head>
<body>
  <button class="demo-button" onclick="document.getElementById('profile-dialog').showModal()">
    Profil Modal öffnen
  </button>

  <button class="demo-button" onclick="document.getElementById('confirmation-dialog').showModal()">
    Bestätigungs Modal öffnen
  </button>

  <dialog id="profile-dialog" aria-labelledby="profile-title">
    <button type="button" class="dialog-close-x" onclick="document.getElementById('profile-dialog').close()" aria-label="Schließen">
      ×
    </button>
    <form method="dialog">
      <h2 id="profile-title">👤 Absender</h2>
      <p class="subtitle">
        Diese Daten werden nach Reset automatisch in den Briefkopf geladen.
      </p>
      <div class="dialog-content-no-scroll">
        <fieldset>
          <legend>Identität & Adresse</legend>
          <div class="form-group">
            <label for="profile-company">Firma</label>
            <input type="text" id="profile-company" placeholder="Muster GmbH" autocomplete="organization">
          </div>
          <div class="form-group">
            <label for="profile-name">Voller Name</label>
            <input type="text" id="profile-name" placeholder="Max Mustermann" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="profile-street">Straße & Hausnummer</label>
            <input type="text" id="profile-street" placeholder="Musterstraße 1" autocomplete="street-address">
          </div>
          <div class="row">
            <div class="form-group" style="flex: 1">
              <label for="profile-zip">PLZ</label>
              <input type="text" id="profile-zip" placeholder="12345" autocomplete="postal-code" inputmode="numeric">
            </div>
            <div class="form-group" style="flex: 2">
              <label for="profile-city">Stadt</label>
              <input type="text" id="profile-city" placeholder="Musterstadt" autocomplete="address-level2">
            </div>
          </div>
          <div class="row">
            <div class="form-group">
              <label for="profile-phone">Telefon</label>
              <input type="tel" id="profile-phone" placeholder="0123 456789" autocomplete="tel">
            </div>
            <div class="form-group">
              <label for="profile-email">E-Mail</label>
              <input type="text" id="profile-email" placeholder="max@beispiel.de" autocomplete="email">
            </div>
          </div>
          <div class="form-group">
            <label for="profile-iban">IBAN (für Fußzeile) - <small>Eingabehilfe aktiv</small></label>
            <div class="iban-wrapper">
              <div id="iban-ghost" class="iban-text" aria-hidden="true"><span class="invisible"></span>DE00 0000 0000 0000 0000 00</div>
              <input type="text" id="profile-iban" class="iban-text" placeholder="" maxlength="34" autocomplete="off" spellcheck="false">
            </div>
          </div>
        </fieldset>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn secondary" onclick="document.getElementById('profile-dialog').close()">
          Abbrechen
        </button>
        <button type="button" class="btn primary" id="btn-profile-done">
          Fertig
        </button>
      </div>
    </form>
  </dialog>

  <dialog id="confirmation-dialog" aria-labelledby="confirm-title">
    <form method="dialog">
      <div class="icon-wrapper">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </div>
      <h2 id="confirm-title">Dokument Resetten?</h2>
      <p id="confirm-message">Bist du dir sicher das du den Brief löschen möchtest?</p>
      <div class="dialog-actions">
        <button type="button" class="btn secondary" value="cancel" id="btn-confirm-cancel">
          Abbruch
        </button>
        <button type="button" class="btn primary danger" value="confirm" id="btn-confirm-ok">
          Reset
        </button>
      </div>
    </form>
  </dialog>

  <script>
    // IBAN Ghost Text Logic - UPDATED to handle longer IBANs
    const ibanInput = document.getElementById('profile-iban');
    const ibanGhost = document.getElementById('iban-ghost');
    const ghostTemplate = 'DE00 0000 0000 0000 0000 0000 0000'; // Extended template

    ibanInput.addEventListener('input', function(e) {
      const rawValue = e.target.value.replace(/\s+/g, '').toUpperCase();
      let formatted = '';

      for (let i = 0; i < rawValue.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += rawValue[i];
      }

      e.target.value = formatted;

      // Update ghost text
      const invisiblePart = formatted || '';
      const visiblePart = ghostTemplate.substring(formatted.length);

      ibanGhost.innerHTML = `<span class="invisible">${invisiblePart}</span>${visiblePart}`;
    });

    // Prevent numbers in city field
    document.getElementById('profile-city').addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[0-9]/g, '');
    });

    // Done button handler
    document.getElementById('btn-profile-done').addEventListener('click', function() {
      console.log('Profile saved:', {
        company: document.getElementById('profile-company').value,
        name: document.getElementById('profile-name').value,
        street: document.getElementById('profile-street').value,
        zip: document.getElementById('profile-zip').value,
        city: document.getElementById('profile-city').value,
        phone: document.getElementById('profile-phone').value,
        email: document.getElementById('profile-email').value,
        iban: document.getElementById('profile-iban').value
      });
      document.getElementById('profile-dialog').close();
    });

    // Confirmation dialog handlers
    document.getElementById('btn-confirm-cancel').addEventListener('click', function() {
      document.getElementById('confirmation-dialog').close();
    });

    document.getElementById('btn-confirm-ok').addEventListener('click', function() {
      console.log('Document reset confirmed');
      document.getElementById('confirmation-dialog').close();
    });

    // Auto-open profile modal for demo
    window.addEventListener('load', function() {
      setTimeout(() => {
        document.getElementById('profile-dialog').showModal();
      }, 300);
    });
  </script>
</body>
</html>
</content>
</file>

<file path="README.md">
<metadata>Lines: 81 | Size: 2102 B</metadata>
<content>
---
title: "DIN-BriefNEO Platinum Master Index"
version: "4.7.0"
status: active
type: "index"
tags:
  - din-briefneo
  - platinum
  - documentation
  - index
aliases:
  - "00_README"
  - "Home"
  - "Master Index"
date_created: 2026-03-31
date_updated: 2026-03-31
---

# 📄 DIN-BriefNEO Platinum (v4.7)

Zentrale Einstiegsseite für die technische Dokumentation und Architektur von DIN-BriefNEO.

---

## 🏗️ Architektur-Überblick

Dieses Diagramm visualisiert das Zusammenspiel der atomaren Komponenten gemäß **ADR-017 (Flat & Pure)**.

~~~mermaid
graph TD
    subgraph UI_Layer [UI-Layer (Zero-JS State)]
        A[index.html] -- "Custom Elements" --> B[02_IMR_Registry]
        B -- "CSS State :has" --> C[style.css]
    end

    subgraph Logic_Layer [Logic-Layer (Pure ES Modules)]
        D[logic.js] -- "Sanitize/Format" --> E[StateManager]
        F[salutation.js] -- "Etiquette" --> E
    end

    subgraph Data_Layer [Data-Layer (Persistence)]
        E -- "OPFS / LocalStorage" --> G[engine.js]
    end

    UI_Layer <--> Logic_Layer
~~~

---

## 🗺️ Dokumenten-Landkarte

| Dok # | Dokument | Fokus | Zielgruppe |
|-------|----------|-------|------------|
| 01 | [[01_Architecture_Compliance]] | APIs, Chrome-Versionen, Leitplanken | Architekten |
| 02 | [[02_IMR_Registry]] | Alle 45+ HTML-Tags & Positionen (SSoT) | Entwickler |
| 03 | [[03_CSS_Reference]] | Detaillierte CSS-Features & Beispiele | Entwickler |
| 04 | [[04_CSS_Quick_Reference]] | Executive Summary der Tech-Highlights | Management |
| 05 | [[05_Feature_Matrix]] | Roadmap, Sprint-Status & Issues | Alle |
| 06 | [[06_Salutation_Engine]] | Logik-Code & Business-Regeln | Entwickler |

---

## 🚀 Platinum Baseline
- **Plattform:** Chrome 147+ (Native APIs only)
- **Architektur:** Flat & Pure (Keine Frameworks, kein UI-State in JS)
- **Compliance:** 100% DIN 5008:2020-03

---

## 🔗 Alle Dokumente (Dataview Query)

~~~dataview
TABLE subtitle AS "Untertitel", version AS "Version", status AS "Status"
FROM "0"
SORT file.name ASC
~~~

---

**Gesamtversion:** 4.7 | **Status:** ✅ Stabil | **Letzte Sync:** 2026-03-31
</content>
</file>

<file path="address.js">
<metadata>Lines: 116 | Size: 3303 B</metadata>
<content>
/* ── ADDRESS SERVICE (Autocomplete & Geo-Search) ──────────── */
import { Toast } from "./toast.js";

export class AddressService {
  constructor(ui) {
    this.ui = ui;
    this._debounce = null;
    this._abortController = null;
    this.portal = document.getElementById("autocomplete-portal");
  }

  init() {
    const el = document.querySelector("din-empfaenger-strasse");
    if (!el || !this.portal) return;

    // Set Anchor Name for CSS Anchor Positioning
    el.style.anchorName = "--anchor-address";

    el.addEventListener("input", (e) => {
      clearTimeout(this._debounce);
      const query = e.target.textContent.trim();

      if (query.length < 3) {
        this.close();
        return;
      }

      this._debounce = setTimeout(() => this.search(query), 300);
    });

    // Close on blur (delayed to allow clicks)
    el.addEventListener("blur", () => setTimeout(() => this.close(), 200));

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  async search(query) {
    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    try {
      // Use Photon API (OpenStreetMap)
      const bbox = "5.0,45.0,16.0,56.0"; // DACH-ish region
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5&bbox=${bbox}`;

      const res = await fetch(url, { signal: this._abortController.signal });
      if (!res.ok) throw new Error("API fail");

      const data = await res.json();
      const suggestions = this._parsePhoton(data.features);
      this.render(suggestions);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.warn("[ADDRESS] Search failed", e);
        Toast.show("Adress-Suche fehlgeschlagen", "warning");
      }
    }
  }

  _parsePhoton(features) {
    return features.map(f => {
      const p = f.properties;
      return {
        street: p.street || p.name || "",
        houseNumber: p.housenumber || "",
        postcode: p.postcode || "",
        city: p.city || p.town || p.village || "",
        display: [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(", ")
      };
    }).filter(s => s.street && s.city); // Must have at least street and city
  }

  render(suggestions) {
    const dropdown = this.portal;
    if (!suggestions.length) {
      this.close();
      return;
    }

    // Safe DOM building
    dropdown.textContent = "";
    suggestions.forEach(item => {
      const option = document.createElement("div");
      option.className = "autocomplete-option";
      option.textContent = item.display;
      option.onclick = () => this.apply(item);
      dropdown.appendChild(option);
    });

    try {
      dropdown.showPopover();
    } catch (e) {}
  }

  apply(item) {
    const sm = this.ui.sm;
    sm.update("content.recipientStreet", `${item.street} ${item.houseNumber}`.trim());
    sm.update("content.recipientZip", item.postcode);
    sm.update("content.recipientCity", item.city);

    // Explicitly sync UI for these fields
    this.ui._syncAll();
    this.close();
    Toast.show("Adresse übernommen!", "success");
  }

  close() {
    try {
      this.portal.hidePopover();
    } catch (e) {}
  }
}
</content>
</file>

<file path="app.js">
<metadata>Lines: 34 | Size: 894 B</metadata>
<content>
/**
 * app.js — Unified Bootloader (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

import { StateManager, Storage, Capabilities } from "./engine.js";
import { UIController } from "./ui.js";

async function boot() {
  console.info("%c[BOOT] Initializing DIN-BriefNEO Flat Edition...", "color: #4a90e2;");

  Capabilities.logStatus();

  // 1. Load State
  const savedState = await Storage.load();
  const sm = new StateManager(savedState);

  // 2. UI Controller
  const ui = new UIController(sm);
  ui.init();

  // 3. Persistence Bridge
  let saveTimeout;
  sm.subscribe((path, val, scope) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => Storage.save(sm.state), 1000);
  });

  console.info("%c[BOOT] System Ready.", "color: #4ade80;");
}

document.addEventListener("DOMContentLoaded", boot);
</content>
</file>

<file path="bundler - Kopie.pyw">
<metadata>Lines: 251 | Size: 10421 B</metadata>
<content>
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Antigravity Context Bundler MINI v6.8 (Aviation Portrait)
========================================================
The high-speed instrument. Portrait Layout. Zero Redundancy.
Fokus: Top-Dropzone, High-Visibility Radar, Massive Power Button.
"""

import os
import re
import json
import time
import threading
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog

try:
    from tkinterdnd2 import TkinterDnD, DND_FILES
    HAS_DND = True
except ImportError:
    HAS_DND = False

# ============================================================
# CONFIGURATION
# ============================================================

WHITELIST_EXT = {
    '.txt', '.md', '.markdown', '.ps1', '.py', '.pyw', '.js', '.mjs', '.ts', '.tsx',
    '.jsx', '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.html',
    '.htm', '.svg', '.css', '.scss', '.sql', '.dockerfile', '.gitignore', '.bat', '.env',
    '.rs', '.go', '.c', '.cpp', '.h', '.hpp', '.cs', '.java', '.rb', '.php', '.sh'
}

WHITELIST_FILES = {
    '.env', '.geminiignore', '.eslintrc', '.stylelintrc', '.prettierrc',
    'package.json', 'manifest.json', 'Dockerfile', 'Makefile', 'Cargo.toml', 'GEMINI.md'
}

FORBIDDEN_ZONE = {'node_modules', '.git', '.vs', '.idea', '__pycache__', 'venv', 'dist', 'build'}

HEAVY_THRESHOLD = 50 * 1024
MAX_RADAR_ITEMS = 10        # Slightly more in portrait mode

# ============================================================
# CORE LOGIC
# ============================================================

def is_junction(path: Path) -> bool:
    try:
        if os.path.islink(path): return True
        if os.name == 'nt':
            import stat
            return bool(os.lstat(str(path)).st_file_attributes & 1024)
        return False
    except: return False

def is_binary(path: Path) -> bool:
    try:
        with open(path, 'rb') as f:
            return b'\x00' in f.read(1024)
    except: return True

def is_safe(path: Path) -> bool:
    name = path.name.lower()
    if name in FORBIDDEN_ZONE or is_junction(path): return False
    if path.is_dir() and name.startswith('.') and name not in {'.brain', '.gemini', '.specify'}: return False
    return True

def compress_code(text: str) -> str:
    text = re.sub(r'[ \t]+$', '', text, flags=re.M)
    return re.sub(r'\n\s*\n+', '\n\n', text).strip()

# ============================================================
# GUI ENGINE
# ============================================================

class AviationBundler:
    def __init__(self):
        self.root = TkinterDnD.Tk() if HAS_DND else tk.Tk()
        self.root.title("Aviation Bundler v6.8")
        self.root.geometry("500x850") # Portrait orientation
        self.root.resizable(False, False)

        self.heavy_candidates = []
        self.silent_files = []
        self.current_paths = []

        self.disp_tokens = tk.StringVar(value="READY FOR MISSION")
        self.disp_target = tk.StringVar(value="Drop files/folder above")

        self._build_ui()

    def _build_ui(self):
        self.root.configure(bg="#0f172a")
        main = tk.Frame(self.root, bg="#0f172a", padx=25, pady=25)
        main.pack(fill="both", expand=True)

        # 1. TOP DROP ZONE
        self.drop_zone = tk.Label(main, text="📂 DROP PROJECT HERE\n(node_modules auto-killed)",
                                  bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 12, "bold"),
                                  relief="flat", height=8, cursor="hand2")
        self.drop_zone.pack(fill="x", pady=(0, 20))

        if HAS_DND:
            self.drop_zone.drop_target_register(DND_FILES)
            self.drop_zone.dnd_bind('<<Drop>>', self._on_drop)
        self.drop_zone.bind("<Button-1>", lambda e: self.browse())

        # 2. RADAR SECTION
        tk.Label(main, text="HEAVYWEIGHT RADAR (FILES > 50KB)", font=("Segoe UI", 9, "bold"),
                 bg="#0f172a", fg="#64748b").pack(anchor="w")

        self.radar_frame = tk.Frame(main, bg="#1e293b", height=280)
        self.radar_frame.pack(fill="x", pady=(5, 20))
        self.radar_frame.pack_propagate(False)

        # 3. STATS & INFO
        info_frame = tk.Frame(main, bg="#0f172a")
        info_frame.pack(fill="x", pady=10)

        tk.Label(info_frame, textvariable=self.disp_target, font=("Consolas", 10), bg="#0f172a", fg="#475569").pack()
        tk.Label(info_frame, textvariable=self.disp_tokens, font=("Segoe UI", 12, "bold"), bg="#0f172a", fg="#38bdf8").pack(pady=5)

        # 4. GIGANTIC POWER BUTTON
        self.start_btn = tk.Button(main, text="🚀 START MISSION BUNDLE", font=("Segoe UI", 14, "bold"),
                                   bg="#334155", fg="#94a3b8", relief="flat", state="disabled",
                                   activebackground="#16a34a", activeforeground="white",
                                   command=self.start)
        self.start_btn.pack(fill="x", side="bottom", ipady=25)

    def _on_drop(self, event):
        paths = []
        matches = re.findall(r'\{([^{}]+)\}|(\S+)', event.data)
        for m in matches: paths.append(m[0] if m[0] else m[1])
        self._analyze(paths)

    def browse(self):
        p = filedialog.askdirectory()
        if p: self._analyze([p])

    def _analyze(self, paths):
        self.current_paths = [p for p in paths if os.path.exists(p) and is_safe(Path(p))]
        if not self.current_paths: return

        for w in self.radar_frame.winfo_children(): w.destroy()
        self.heavy_candidates = []
        self.silent_files = []

        all_files = []
        for p in self.current_paths:
            p_obj = Path(p)
            if p_obj.is_file(): all_files.append(p_obj)
            else:
                for r, ds, fs in os.walk(p):
                    ds[:] = [d for d in ds if is_safe(Path(r)/d)]
                    for f in fs: all_files.append(Path(r)/f)

        for f in all_files:
            if is_binary(f): continue
            ext = f.suffix.lower()
            if ext not in WHITELIST_EXT and f.name not in WHITELIST_FILES: continue

            size = f.stat().st_size
            if size > HEAVY_THRESHOLD:
                self.heavy_candidates.append({"path": f, "size": size, "selected": True})
            else:
                self.silent_files.append({"path": f, "size": size})

        heavy_sorted = sorted(self.heavy_candidates, key=lambda x: x['size'], reverse=True)[:MAX_RADAR_ITEMS]
        self.heavy_candidates = heavy_sorted

        if not heavy_sorted:
            tk.Label(self.radar_frame, text="Clean Airspace. No heavy files.", bg="#1e293b", fg="#64748b", font=("Segoe UI", 10)).pack(expand=True)
        else:
            for item in heavy_sorted:
                self._add_radar_row(item)

        p0 = Path(self.current_paths[0])
        self.disp_target.set(f"TARGET: {p0.parent.name if len(self.current_paths)>1 else p0.name}")
        self.start_btn.config(state="normal", bg="#16a34a", fg="white", cursor="hand2")
        self._update_stats()

    def _add_radar_row(self, item):
        row = tk.Frame(self.radar_frame, bg="#1e293b")
        row.pack(fill="x", padx=15, pady=4)

        btn_txt = tk.StringVar(value="[ ✓ ]")
        toggle_btn = tk.Label(row, textvariable=btn_txt, font=("Consolas", 11, "bold"),
                              bg="#1e293b", fg="#38bdf8", cursor="hand2", width=5)
        toggle_btn.pack(side="left")

        def toggle(e, i=item, v=btn_txt, lb=toggle_btn):
            i['selected'] = not i['selected']
            v.set("[ ✓ ]" if i['selected'] else "[   ]")
            lb.config(fg="#38bdf8" if i['selected'] else "#64748b")
            self._update_stats()

        toggle_btn.bind("<Button-1>", toggle)
        tk.Label(row, text=f"{item['size']/1024:>7.1f} KB", font=("Consolas", 9), bg="#1e293b", fg="#94a3b8").pack(side="left", padx=10)
        tk.Label(row, text=item['path'].name, font=("Segoe UI", 10), bg="#1e293b", fg="#e2e8f0").pack(side="left")

    def _update_stats(self):
        total = sum(f['size'] for f in self.silent_files)
        total += sum(f['size'] for f in self.heavy_candidates if f['selected'])
        self.disp_tokens.set(f"TOKENS: ~{int(total/3.5):,} | SIZE: {total/1024:.1f} KB")

    def start(self):
        self.start_btn.config(state="disabled", text="⚡ BUNDLING...", bg="#334155")
        threading.Thread(target=self._run, daemon=True).start()

    def _run(self):
        root = Path(self.current_paths[0])
        name = root.parent.name if len(self.current_paths) > 1 else root.name
        out_path = Path(__file__).parent / f"{datetime.now().strftime('%Y-%m-%d')}_{name}_v1.0_BUNDLED.md"

        to_process = [f['path'] for f in self.silent_files]
        to_process += [f['path'] for f in self.heavy_candidates if f['selected']]

        results = []
        c_root = str(root.parent if root.is_file() else root)
        with ProcessPoolExecutor() as ex:
            f_map = {ex.submit(process_file_content, str(f), c_root): f for f in to_process}
            for fut in as_completed(f_map):
                res = fut.result()
                if res: results.append(res)

        with open(out_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(f"---\ntitle: \"{name} Snapshot\"\ncreated: {datetime.now().isoformat()}\nllm_ready: true\n---\n\n")
            for item in sorted(results, key=lambda x: x['path']):
                f.write(f"<file path=\"{item['path']}\">\n<metadata>Lines: {item['lines']} | Size: {item['size']} B</metadata>\n<content>\n{item['content']}\n</content>\n</file>\n\n")

        self.root.after(0, self._finish)

    def _finish(self):
        self.start_btn.config(state="normal", text="🚀 START MISSION BUNDLE", bg="#16a34a")

def process_file_content(file_path, root_path):
    try:
        rel_path = os.path.relpath(file_path, root_path).replace("\\", "/")
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            raw = f.read()
        return {"path": rel_path, "size": len(raw), "lines": raw.count("\n")+1, "content": compress_code(raw).replace('~~~', '~~~')}
    except: return None

if __name__ == "__main__":
    AviationBundler().root.mainloop()
</content>
</file>

<file path="engine.js">
<metadata>Lines: 118 | Size: 3588 B</metadata>
<content>
/**
 * engine.js — Core Engine (State & Persistence)
 * [ADR-017] Flat & Pure Architecture
 * @module engine
 */

/* ── CAPABILITIES ─────────────────────────────────────────── */

export const Capabilities = Object.freeze({
  temporal: !!globalThis.Temporal,
  opfs: !!globalThis.navigator?.storage?.getDirectory,
  isLocalFile: window.location.protocol === "file:",
  isSecureContext: window.isSecureContext,
  logStatus() {
    const status = this.isLocalFile ? "📂 FILE-MODE (Local)" : "🌐 WEB-MODE (Secure)";
    console.info(`%c[ENGINE] ${status}`, "font-weight: bold; color: #4ade80;");
  }
});

/* ── HYBRID STORAGE ───────────────────────────────────────── */

const STORE_KEY = "DIN-BriefNEO-State-v4.1";

export const Storage = {
  /**
   * Speichert State – bevorzugt OPFS, fallback localStorage
   * @param {Object} state - Zu speichernder Zustand
   */
  async save(state) {
    const data = JSON.stringify(state);
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        const file = await root.getFileHandle("state.json", { create: true });
        const writable = await file.createWritable();
        await writable.write(data);
        await writable.close();
        return;
      } catch (e) {
        console.warn("[ENGINE] OPFS save failed, falling back to localStorage", e);
      }
    }
    localStorage.setItem(STORE_KEY, data);
  },

  /**
   * Lädt State – bevorzugt OPFS, fallback localStorage
   * @returns {Promise<Object|null>}
   */
  async load() {
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        const file = await root.getFileHandle("state.json");
        const handle = await file.getFile();
        const content = await handle.text();
        return JSON.parse(content);
      } catch (e) {
        console.warn("[ENGINE] OPFS load failed, falling back to localStorage", e);
      }
    }
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async clear() {
    if (Capabilities.opfs && Capabilities.isSecureContext) {
      try {
        const root = await navigator.storage.getDirectory();
        await root.removeEntry("state.json");
      } catch (e) {}
    }
    localStorage.removeItem(STORE_KEY);
  }
};

/* ── STATE MANAGEMENT ─────────────────────────────────────── */

export class StateManager {
  /**
   * @param {Object} initialState - Initialer Zustand
   */
  constructor(initialState = null) {
    this.state = initialState || {
      content: {},
      config: { layout: "form-b", theme: "day", guides: true }
    };
    this._listeners = new Set();
  }

  /**
   * Abonniert State-Änderungen
   * @param {Function} fn - Callback (path, value, domain, source)
   * @returns {Function} Unsubscribe-Funktion
   */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /**
   * Aktualisiert einen State-Pfad
   * @param {string} path - Dot-Notation Pfad (z.B. "config.theme")
   * @param {any} value - Neuer Wert
   * @param {string} source - Quelle der Änderung ("ui" | "system" | "sync")
   */
  update(path, value, source = "ui") {
    const parts = path.split(".");
    let current = this.state;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    this._listeners.forEach(fn => fn(path, value, parts[0], source));
  }
}
</content>
</file>

<file path="index.html">
<metadata>Lines: 574 | Size: 21824 B</metadata>
<content>
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DIN-BriefNEO | Pure & Flat Edition</title>
    <link rel="manifest" href="manifest.json" />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <input type="radio" name="layout-state" id="state-layout-a" hidden />
    <input
      type="radio"
      name="layout-state"
      id="state-layout-b"
      checked
      hidden
    />

    <div id="app-shell">
      <aside id="sidebar-left">
        <header class="sidebar-header">
          <div class="sidebar-brand">
            DIN-BriefNEO
            <span id="app-version" class="v-tag" title="Dev-Mode">V18.3</span>
          </div>
        </header>

        <div id="sidebar-scroll-area">
          <section class="sidebar-section">
            <div class="sidebar-control-group">
              <label class="sidebar-label">DIN-Variante</label>
              <div class="segmented-control" id="layout-switch">
                <label class="segment-option" for="state-layout-a">
                  <span>Form A</span>
                </label>
                <label class="segment-option" for="state-layout-b">
                  <span>Form B</span>
                </label>
                <div class="pill"></div>
              </div>
            </div>

            <div class="sidebar-control-group">
              <label class="sidebar-label">Empfänger-Typ</label>
              <div class="segmented-control" id="recipient-switch">
                <label class="segment-option" for="type-none">
                  <input type="radio" name="recipientType" id="type-none" value="none" checked />
                  <span>Neutral</span>
                </label>
                <label class="segment-option" for="type-female">
                  <input type="radio" name="recipientType" id="type-female" value="female" />
                  <span>Frau</span>
                </label>
                <label class="segment-option" for="type-male">
                  <input type="radio" name="recipientType" id="type-male" value="male" />
                  <span>Herr</span>
                </label>
                <div class="pill"></div>
              </div>
            </div>

            <div class="sidebar-control-group">
              <label class="sidebar-label">Anrede-Stil</label>
              <div class="segmented-control" id="formality-switch">
                <label class="segment-option" for="formal-style">
                  <input type="radio" name="formality" id="formal-style" value="formal" checked />
                  <span>Formal</span>
                </label>
                <label class="segment-option" for="polite-style">
                  <input type="radio" name="formality" id="polite-style" value="polite" />
                  <span>Höflich</span>
                </label>
                <label class="segment-option" for="casual-style">
                  <input type="radio" name="formality" id="casual-style" value="casual" />
                  <span>Locker</span>
                </label>
                <div class="pill"></div>
              </div>
            </div>

            <div class="sidebar-control-group">
              <label class="sidebar-label">Hilfsmittel</label>
              <div class="toggle-control-stack">
                <div class="toggle-control">
                  <input type="checkbox" id="state-guides" hidden checked />
                  <label class="toggle-btn" for="state-guides">
                    <span>📐 Layout-Guides</span>
                  </label>
                </div>
                <div class="toggle-control">
                  <input type="checkbox" id="state-reference" hidden />
                  <label class="toggle-btn" for="state-reference">
                    <span>📜 DIN-Referenz</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="sidebar-control-group">
              <label class="sidebar-label">Arbeitsmodus</label>
              <div class="segmented-control" id="theme-switch">
                <label class="segment-option" for="theme-day">
                  <input
                    type="radio"
                    name="theme"
                    id="theme-day"
                    value="day"
                    checked
                  />
                  <span>☀️ Tag</span>
                </label>
                <label class="segment-option" for="theme-night">
                  <input
                    type="radio"
                    name="theme"
                    id="theme-night"
                    value="night"
                  />
                  <span>🌙 Nacht</span>
                </label>
                <div class="pill"></div>
              </div>
            </div>
          </section>
        </div>

        <div class="actions-footer">
          <button class="sidebar-btn primary" command="--print">
            🖨 Drucken / PDF
          </button>
          <button
            class="sidebar-btn secondary"
            id="btn-open-profile"
            onclick="document.getElementById('profile-dialog').showModal()"
          >
            👤 Profil bearbeiten
          </button>
          <div class="utility-actions">
            <button class="util-btn" command="--export">📥 Export</button>
            <button class="util-btn danger" id="btn-trigger-reset">
              🗑️ Reset
            </button>
          </div>
        </div>
      </aside>

      <main id="paper-viewport">
        <din-5008 id="paper">
          <din-A4>
            <din-branding-logo></din-branding-logo>

            <din-falz-oben></din-falz-oben>
            <din-falz-unten></din-falz-unten>

            <!-- Absender -->
            <din-absender>
              <din-absender-vorname
                contenteditable="plaintext-only"
                style="--p: &quot;Vorname&quot;"
              ></din-absender-vorname>
              <din-absender-nachname
                contenteditable="plaintext-only"
                style="--p: &quot;Nachname&quot;"
              ></din-absender-nachname>
              <din-absender-strasse
                contenteditable="plaintext-only"
                style="--p: &quot;Straße Nr.&quot;"
              ></din-absender-strasse>
              <din-absender-ort
                contenteditable="plaintext-only"
                style="--p: &quot;PLZ Ort&quot;"
              ></din-absender-ort>
              <din-absender-zusatz
                contenteditable="plaintext-only"
                style="--p: &quot;Zusatz/Abteilung&quot;"
              ></din-absender-zusatz>
              <din-absender-mail
                contenteditable="plaintext-only"
                style="--p: &quot;E-Mail&quot;"
              ></din-absender-mail>
              <din-absender-tel
                contenteditable="plaintext-only"
                style="--p: &quot;Telefon&quot;"
              ></din-absender-tel>
            </din-absender>

            <!-- Anschriftfeld -->
            <din-anschriftfeld>
              <din-rucksendezeile
                contenteditable="plaintext-only"
                style="--p: &quot;Rücksendezeile&quot;"
              ></din-rucksendezeile>
              <din-zusaetze
                contenteditable="plaintext-only"
                style="--p: &quot;Zusatz (z.B. Einschreiben)&quot;"
              ></din-zusaetze>
              <din-empfaenger-firma
                contenteditable="plaintext-only"
                style="--p: &quot;Firma&quot;"
              ></din-empfaenger-firma>
              <din-empfaenger-abteilung
                contenteditable="plaintext-only"
                style="--p: &quot;Abteilung&quot;"
              ></din-empfaenger-abteilung>
              <din-empfaenger-vorname
                contenteditable="plaintext-only"
                style="--p: &quot;Vorname&quot;"
              ></din-empfaenger-vorname>
              <din-empfaenger-nachname
                contenteditable="plaintext-only"
                style="--p: &quot;Nachname&quot;"
              ></din-empfaenger-nachname>
              <din-empfaenger-strasse
                contenteditable="plaintext-only"
                style="--p: &quot;Straße Nr.&quot;"
              ></din-empfaenger-strasse>
              <din-empfaenger-ort
                contenteditable="plaintext-only"
                style="--p: &quot;PLZ Ort&quot;"
              ></din-empfaenger-ort>
            </din-anschriftfeld>

            <!-- Infoblock & Datum -->
            <din-infoblock>
              <din-ihr-zeichen
                contenteditable="plaintext-only"
                style="--p: &quot;Ihr Zeichen&quot;"
              ></din-ihr-zeichen>
              <din-ihr-schreiben
                contenteditable="plaintext-only"
                style="--p: &quot;Ihr Schreiben vom&quot;"
              ></din-ihr-schreiben>
              <din-unser-zeichen
                contenteditable="plaintext-only"
                style="--p: &quot;Unser Zeichen&quot;"
              ></din-unser-zeichen>
              <din-unser-schreiben
                contenteditable="plaintext-only"
                style="--p: &quot;Unser Schreiben vom&quot;"
              ></din-unser-schreiben>
              <din-durchwahl
                contenteditable="plaintext-only"
                style="--p: &quot;Durchwahl&quot;"
              ></din-durchwahl>
              <din-email-direkt
                contenteditable="plaintext-only"
                style="--p: &quot;E-Mail&quot;"
              ></din-email-direkt>
              <din-internet
                contenteditable="plaintext-only"
                style="--p: &quot;Internet&quot;"
              ></din-internet>
            </din-infoblock>

            <din-datum
              contenteditable="plaintext-only"
              style="--p: &quot;Datum&quot;"
            ></din-datum>

            <!-- Multi-Page Flow: Header Spacer -->
            <din-header-spacer></din-header-spacer>

            <!-- Briefkern -->
            <din-kern>
              <din-betreff
                contenteditable="plaintext-only"
                style="--p: &quot;Betreff&quot;"
              ></din-betreff>
              <din-anrede
                contenteditable="plaintext-only"
                style="--p: &quot;Anrede&quot;"
              ></din-anrede>
              <din-text-container>
                <din-text
                  contenteditable="plaintext-only"
                  style="--p: &quot;Text schreiben...&quot;"
                ></din-text>
                <din-text-spiegel aria-hidden="true"></din-text-spiegel>
              </din-text-container>
              <din-grussformel
                contenteditable="plaintext-only"
                style="--p: &quot;Grußformel&quot;"
              ></din-grussformel>
              <din-unterschrift
                contenteditable="plaintext-only"
                style="--p: &quot;Unterschrift-Name&quot;"
              ></din-unterschrift>
              <din-anlagen
                contenteditable="plaintext-only"
                style="--p: &quot;Anlagen&quot;"
              ></din-anlagen>
            </din-kern>

            <!-- Fußzeile -->
            <din-fuss>
              <din-fuss-firma
                contenteditable="plaintext-only"
                style="--p: &quot;Firmenname&quot;"
              ></din-fuss-firma>
              <din-fuss-sitz
                contenteditable="plaintext-only"
                style="--p: &quot;Firmensitz&quot;"
              ></din-fuss-sitz>
              <din-fuss-gericht
                contenteditable="plaintext-only"
                style="--p: &quot;Registergericht&quot;"
              ></din-fuss-gericht>
              <din-fuss-hrb
                contenteditable="plaintext-only"
                style="--p: &quot;HRB-Nummer&quot;"
              ></din-fuss-hrb>
              <din-fuss-vorstand
                contenteditable="plaintext-only"
                style="--p: &quot;Vorstand&quot;"
              ></din-fuss-vorstand>
              <din-fuss-gf
                contenteditable="plaintext-only"
                style="--p: &quot;Geschäftsführung&quot;"
              ></din-fuss-gf>
              <din-fuss-stnr
                contenteditable="plaintext-only"
                style="--p: &quot;Steuernummer&quot;"
              ></din-fuss-stnr>
              <din-fuss-ustid
                contenteditable="plaintext-only"
                style="--p: &quot;USt-IdNr.&quot;"
              ></din-fuss-ustid>
              <din-fuss-bank
                contenteditable="plaintext-only"
                style="--p: &quot;Bank&quot;"
              ></din-fuss-bank>
              <din-fuss-iban
                contenteditable="plaintext-only"
                style="--p: &quot;IBAN&quot;"
              ></din-fuss-iban>
              <din-fuss-bic
                contenteditable="plaintext-only"
                style="--p: &quot;BIC&quot;"
              ></din-fuss-bic>
              <din-fuss-anschrift
                contenteditable="plaintext-only"
                style="--p: &quot;Hausanschrift&quot;"
              ></din-fuss-anschrift>
            </din-fuss>
          </din-A4>
        </din-5008>

        <!-- DIN-Referenz-Overlay (Form A) -->
        <svg id="din-reference-overlay" viewBox="0 0 210 297" aria-hidden="true">
          <!-- Falzmarken -->
          <line x1="0" y1="87" x2="10" y2="87" stroke="var(--overlay-color-falz)" stroke-width="0.3" />
          <line x1="0" y1="192" x2="10" y2="192" stroke="var(--overlay-color-falz)" stroke-width="0.3" />
          <line x1="0" y1="148.5" x2="15" y2="148.5" stroke="var(--overlay-color-loch)" stroke-width="0.3" />

          <!-- Anschriftfeld -->
          <rect x="20" y="27" width="85" height="45" fill="none" stroke="var(--overlay-color-zone)" stroke-width="0.2" stroke-dasharray="1 1" />
          <line x1="20" y1="44.7" x2="105" y2="44.7" stroke="var(--overlay-color-zone)" stroke-width="0.1" /> <!-- Zusatzbereich -->

          <!-- Informationsblock (Form A) -->
          <rect x="125" y="32" width="75" height="60" fill="none" stroke="var(--overlay-color-info)" stroke-width="0.2" stroke-dasharray="1 1" />

          <!-- Satzspiegel & Ränder -->
          <rect x="25" y="0" width="165" height="297" fill="none" stroke="var(--overlay-color-grid)" stroke-width="0.1" stroke-dasharray="0.5 0.5" />

          <!-- Fußzeile -->
          <rect x="25" y="241" width="165" height="30" fill="none" stroke="var(--overlay-color-fuss)" stroke-width="0.2" stroke-dasharray="1 1" />

          <!-- Beschriftungen -->
          <text x="2" y="86" font-size="2.5" fill="var(--overlay-color-falz)">87mm</text>
          <text x="2" y="191" font-size="2.5" fill="var(--overlay-color-falz)">192mm</text>
          <text x="22" y="31" font-size="2.5" fill="var(--overlay-color-zone)">Anschriftfeld</text>
        </svg>
      </main>
    </div>

    <div id="toast-v4" popover="manual" class="toast-container"></div>
    <div id="autocomplete-portal" popover="manual"></div>

    <!-- Multi-Page Template -->
    <template id="tpl-din-page">
      <din-A4>
        <din-branding-logo></din-branding-logo>
        <din-falz-oben></din-falz-oben>
        <din-falz-unten></din-falz-unten>

        <!-- Header Elements (Hidden on follow-up pages via CSS) -->
        <din-header-content>
          <din-absender-placeholder></din-absender-content>
        </din-header-content>

        <din-header-spacer></din-header-spacer>

        <din-kern>
          <din-text-container>
            <din-text contenteditable="plaintext-only"></din-text>
            <din-text-spiegel aria-hidden="true"></din-text-spiegel>
          </din-text-container>
        </din-kern>

        <din-fuss-placeholder></din-fuss-placeholder>
      </din-A4>
    </template>

    <!-- MODERN MODAL SYSTEM -->
    <dialog id="profile-dialog" aria-labelledby="profile-title">
      <button
        type="button"
        class="dialog-close-x"
        onclick="this.closest('dialog').close()"
        aria-label="Schließen"
      >
        ×
      </button>
      <form method="dialog">
        <h2 id="profile-title">👤 Absender-Profil</h2>
        <p class="subtitle">
          Diese Daten werden bei einem Reset automatisch in den Briefkopf
          geladen.
        </p>
        <div class="dialog-content-no-scroll">
          <fieldset>
            <legend>Identität & Adresse</legend>
            <div class="form-group">
              <label for="profile-name">Voller Name</label>
              <input
                type="text"
                id="profile-name"
                placeholder="Max Mustermann"
                autocomplete="name"
              />
            </div>
            <div class="form-group">
              <label for="profile-street">Straße & Hausnummer</label>
              <input
                type="text"
                id="profile-street"
                placeholder="Musterstraße 1"
                autocomplete="street-address"
              />
            </div>
            <div class="row">
              <div class="form-group" style="flex: 1">
                <label for="profile-zip">PLZ</label>
                <input
                  type="text"
                  id="profile-zip"
                  placeholder="12345"
                  autocomplete="postal-code"
                  inputmode="numeric"
                  data-validation="zip"
                />
                <div class="platinum-tooltip">⚠️ PLZ muss 5-stellig sein</div>
              </div>

              <div class="form-group" style="flex: 2">
                <label for="profile-city">Stadt</label>
                <input
                  type="text"
                  id="profile-city"
                  placeholder="Musterstadt"
                  autocomplete="address-level2"
                />
              </div>
            </div>
            <div class="row">
              <div class="form-group">
                <label for="profile-phone">Telefon</label>
                <input
                  type="tel"
                  id="profile-phone"
                  placeholder="0123 456789"
                  autocomplete="tel"
                />
              </div>
              <div class="form-group">
                <label for="profile-email">E-Mail</label>
                <input
                  type="text"
                  id="profile-email"
                  placeholder="max@beispiel.de"
                  autocomplete="email"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="profile-iban"
                >IBAN (für Fußzeile) - <small>Eingabehilfe aktiv</small></label
              >
              <div class="iban-wrapper">
                <div id="iban-ghost" class="iban-text" aria-hidden="true">
                  <span class="invisible"></span>DE00 0000 0000 0000 0000 00
                </div>
                <input
                  type="text"
                  id="profile-iban"
                  class="iban-text"
                  placeholder=""
                  maxlength="34"
                  autocomplete="off"
                  spellcheck="false"
                  data-validation="iban"
                />
                <div class="platinum-tooltip">⚠️ IBAN Format ungültig</div>
              </div>
            </div>
          </fieldset>
        </div>
        <div class="dialog-actions">
          <button
            type="button"
            class="btn secondary"
            onclick="this.closest('dialog').close()"
          >
            Abbrechen
          </button>
          <button type="button" class="btn primary" id="btn-profile-done">
            Speichern & Schließen
          </button>
        </div>
      </form>
    </dialog>

    <dialog id="confirmation-dialog" aria-labelledby="confirm-title">
      <form method="dialog">
        <div class="icon-wrapper">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc3545"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>
        <h2 id="confirm-title">Dokument löschen?</h2>
        <p id="confirm-message">
          Bist du dir sicher, dass du den kompletten Briefinhalt löschen
          möchtest?
        </p>
        <div class="dialog-actions">
          <button
            type="button"
            class="btn secondary"
            onclick="this.closest('dialog').close()"
          >
            Abbruch
          </button>
          <button type="button" class="btn primary danger" id="btn-confirm-ok">
            Alles löschen
          </button>
        </div>
      </form>
    </dialog>

    <div id="debug" class="dev-panel" popover="manual">
      <h3>🛠️ Platinum Debug</h3>
      <p>Current Theme: <span id="debug-theme">Auto</span></p>
      <p>DIN-Layout: <span id="debug-layout">Form B</span></p>
      <p>Salutation: <span id="debug-salutation">Generic</span></p>
      <button onclick="this.parentElement.hidePopover()">Close</button>
    </div>

    <script type="module" src="app.js"></script>
  </body>
</html>
</content>
</file>

<file path="logic.js">
<metadata>Lines: 221 | Size: 7254 B</metadata>
<content>
/**
 * logic.js — Unified Business Logic & Constants (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * @module logic
 */

/* ── CONSTANTS & REGISTRY ──────────────────────────────────── */

/**
 * IMR (Input Mapping Registry) – definiert die bidirektionale Bindung
 * zwischen DOM-Elementen und State-Keys.
 */
export const IMR = Object.freeze([
  { tag: "din-branding-logo", key: "logo" },
  { tag: "din-branding-wasserzeichen", key: "wasserzeichen" },
  { tag: "din-absender-vorname", key: "abs_vorname" },
  { tag: "din-absender-nachname", key: "abs_nachname" },
  { tag: "din-absender-strasse", key: "abs_strasse" },
  { tag: "din-absender-ort", key: "abs_ort" },
  { tag: "din-absender-zusatz", key: "abs_zusatz" },
  { tag: "din-absender-mail", key: "abs_mail" },
  { tag: "din-absender-tel", key: "abs_tel" },
  { tag: "din-rucksendezeile", key: "rucksendezeile" },
  { tag: "din-zusaetze", key: "zusaetze" },
  { tag: "din-empfaenger-firma", key: "empf_firma" },
  { tag: "din-empfaenger-abteilung", key: "empf_abteilung" },
  { tag: "din-empfaenger-vorname", key: "empf_vorname" },
  { tag: "din-empfaenger-nachname", key: "empf_nachname" },
  { tag: "din-empfaenger-strasse", key: "empf_strasse" },
  { tag: "din-empfaenger-ort", key: "empf_ort" },
  { tag: "din-ihr-zeichen", key: "ref_ihr_zeichen" },
  { tag: "din-ihr-schreiben", key: "ref_ihr_schreiben" },
  { tag: "din-unser-zeichen", key: "ref_unser_zeichen" },
  { tag: "din-unser-schreiben", key: "ref_unser_schreiben" },
  { tag: "din-durchwahl", key: "ref_tel" },
  { tag: "din-email-direkt", key: "ref_email" },
  { tag: "din-internet", key: "ref_web" },
  { tag: "din-datum", key: "datum" },
  { tag: "din-betreff", key: "betreff" },
  { tag: "din-anrede", key: "anrede" },
  { tag: "din-text", key: "text" },
  { tag: "din-text-spiegel", key: "mirror", internal: true },
  { tag: "din-grussformel", key: "grussformel" },
  { tag: "din-unterschrift", key: "unterschrift" },
  { tag: "din-anlagen", key: "anlagen" },
  { tag: "din-fuss-firma", key: "fuss_firma" },
  { tag: "din-fuss-sitz", key: "fuss_sitz" },
  { tag: "din-fuss-gericht", key: "fuss_gericht" },
  { tag: "din-fuss-hrb", key: "fuss_hrb" },
  { tag: "din-fuss-vorstand", key: "fuss_vorstand" },
  { tag: "din-fuss-gf", key: "fuss_gf" },
  { tag: "din-fuss-stnr", key: "fuss_stnr" },
  { tag: "din-fuss-ustid", key: "fuss_ustid" },
  { tag: "din-fuss-bank", key: "fuss_bank" },
  { tag: "din-fuss-iban", key: "fuss_iban" },
  { tag: "din-fuss-bic", key: "fuss_bic" },
  { tag: "din-fuss-anschrift", key: "fuss_anschrift" },
  { tag: "din-falz-oben", key: "guides_fold_top", internal: true },
  { tag: "din-falz-unten", key: "guides_fold_bottom", internal: true },
]);

/* ── MARKDOWN PARSER ────────────────────────────────────────── */

/**
 * Parst Markdown in HTML mit Zero-Width Ghosting Pattern
 * @param {string} raw - Roher Markdown-Text
 * @returns {string} HTML mit Markern
 */
export function parseMarkdown(raw) {
  if (!raw) return "";

  let html = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = html.split("\n");
  const out = [];
  let listActive = false;

  for (const line of lines) {
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      out.push(
        `<div class="md-list-item">` +
          `<span class="md-num"><span class="md-marker">${orderedMatch[1]}. </span>${orderedMatch[1]}.</span>` +
          `<span>${applyInline(orderedMatch[2])}</span>` +
          `</div>`,
      );
      listActive = true;
      continue;
    }

    const bulletMatch = line.match(/^([-*])\s+(.+)$/);
    if (bulletMatch) {
      const content = bulletMatch[2];

      // Checkbox / Task-List Erkennung: "- [ ] " oder "- [x] "
      const taskMatch = content.match(/^\[( |x)\]\s+(.*)$/i);
      if (taskMatch) {
        const checked = taskMatch[1].toLowerCase() === "x";
        out.push(
          `<div class="md-list-item md-task-list ${checked ? "is-checked" : ""}">` +
            `<span class="md-checkbox"><span class="md-marker">${bulletMatch[1]} [${taskMatch[1]}] </span>${checked ? "☑" : "☐"}</span>` +
            `<span>${applyInline(taskMatch[2])}</span>` +
            `</div>`,
        );
      } else {
        out.push(
          `<div class="md-list-item">` +
            `<span class="md-bullet"><span class="md-marker">${bulletMatch[1]} </span>•</span>` +
            `<span>${applyInline(content)}</span>` +
            `</div>`,
        );
      }
      listActive = true;
      continue;
    }

    const quoteMatch = line.match(/^&gt;\s?(.*)$/);
    if (quoteMatch) {
      out.push(
        `<blockquote class="md-quote">` +
          `<span class="md-marker">&gt; </span>` +
          `${applyInline(quoteMatch[1])}` +
          `</blockquote>`,
      );
      listActive = false;
      continue;
    }

    out.push(applyInline(line));
  }

  return out.join("\n").replace(/\n/g, "<br>");
}

function applyInline(text) {
  return text
    .replace(
      /\*\*(.+?)\*\*/g,
      '<span class="md-marker">**</span><strong>$1</strong><span class="md-marker">**</span>',
    )
    .replace(
      /__(.+?)__/g,
      '<span class="md-marker">__</span><u>$1</u><span class="md-marker">__</span>',
    );
}

/* ── TEMPORAL DATE LOGIC ────────────────────────────────────── */

export function todayISO() {
  return Temporal.Now.plainDateISO(Temporal.Now.timeZoneId()).toString();
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = Temporal.PlainDate.from(iso);
  return `${d.day.toString().padStart(2, "0")}.${d.month.toString().padStart(2, "0")}.${d.year}`;
}

/* ── BUSINESS LOGIC ─────────────────────────────────────────── */

export function deriveReturnLine(data) {
  const firstName = data.abs_vorname || "";
  const lastName = data.abs_nachname || "";
  const street = data.abs_strasse || "";
  const city = data.abs_ort || "";

  const initial = firstName.trim().charAt(0);
  const namePart = initial ? `${initial}. ${lastName.trim()}` : lastName.trim();

  return [namePart, street.trim(), city.trim()].filter(Boolean).join(" · ");
}

export function validateIBAN(iban) {
  if (!iban) return false;
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2,20}$/.test(clean)) return false;

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numeric = "";
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      numeric += (code - 55).toString();
    } else {
      numeric += char;
    }
  }

  try {
    return BigInt(numeric) % 97n === 1n;
  } catch (e) {
    return false;
  }
}

/**
 * Validiert die Adresszone nach DIN 5008 (max. 6 Zeilen).
 * @param {Object} data - Aktueller Dokument-Zustand
 * @returns {Object} { isValid, lineCount }
 */
export function validateAddressZone(data) {
  if (!data) return { isValid: true, lineCount: 0 };
  const recipientKeys = [
    "zusaetze",
    "empf_firma",
    "empf_abteilung",
    "empf_vorname",
    "empf_nachname",
    "empf_strasse",
    "empf_ort",
  ];
  const lineCount = recipientKeys.reduce(
    (acc, key) => acc + (data[key]?.trim() ? 1 : 0),
    0,
  );
  return { isValid: lineCount <= 6, lineCount };
}
</content>
</file>

<file path="manifest.json">
<metadata>Lines: 18 | Size: 619 B</metadata>
<content>
{
  "name": "DIN-BriefNEO",
  "short_name": "NEO",
  "version": "4.0.0",
  "description": "High-Integrity DIN 5008 Brief-Editor",
  "start_url": "index.html",
  "display": "standalone",
  "background_color": "#121212",
  "theme_color": "#121212",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23005bb7'/><text y='.7em' x='50%' font-size='60' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='bold'>N</text></svg>",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
</content>
</file>

<file path="package-lock.json">
<metadata>Lines: 64 | Size: 1758 B</metadata>
<content>
{
  "name": "din-briefneo",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "din-briefneo",
      "version": "1.0.0",
      "license": "ISC",
      "devDependencies": {
        "playwright": "^1.58.2"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
      "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/playwright": {
      "version": "1.58.2",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.58.2.tgz",
      "integrity": "sha512-vA30H8Nvkq/cPBnNw4Q8TWz1EJyqgpuinBcHET0YVJVFldr8JDNiU9LaWAE1KqSkRYazuaBhTpB5ZzShOezQ6A==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.58.2"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "fsevents": "2.3.2"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.58.2",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.58.2.tgz",
      "integrity": "sha512-yZkEtftgwS8CsfYo7nm0KE8jsvm6i/PTgVtB8DL726wNf6H2IMsDuxCpJj59KDaxCtSnrWan2AeDqM7JBaultg==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    }
  }
}
</content>
</file>

<file path="package.json">
<metadata>Lines: 23 | Size: 579 B</metadata>
<content>
{
  "name": "din-briefneo",
  "version": "4.0.0",
  "description": "DIN-BriefNEO v4 Core Edition",
  "main": "js/app.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "vision": "node scripts/v4-core-vision.js",
    "lint:js": "eslint \"**/*.js\"",
    "lint:css": "stylelint \"**/*.css\"",
    "lint:md": "markdown-link-check \"**/*.md\"",
    "lint": "npm run lint:js && npm run lint:css && npm run lint:md"
  },

  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "playwright": "^1.58.2"
  }
}
</content>
</file>

<file path="pages.js">
<metadata>Lines: 141 | Size: 3971 B</metadata>
<content>
/* ── PAGE MANAGER (Multi-Page Flow) ────────────────────────── */
import { Toast } from "./toast.js";

export class PageManager {
  constructor(ui) {
    this.ui = ui;
    this.paper = document.getElementById("paper");
    this.template = document.getElementById("tpl-din-page");
    this.maxHeight = 580; // Fallback
    this._isReflowing = false;
  }

  init() {
    console.log("[PAGE] PageManager active.");
    this.calibrate();
    this.checkFlow();
  }

  /**
   * Berechnet den verfügbaren Platz basierend auf der aktuellen DIN-Geometrie
   */
  calibrate() {
    const firstPage = this.paper.querySelector("din-A4");
    if (!firstPage) return;

    const spacer = firstPage.querySelector("din-header-spacer");
    const fuss = firstPage.querySelector("din-fuss");

    if (spacer && fuss) {
      // Verfügbarer Platz zwischen Header-Ende und Fußzeilen-Beginn
      const available = fuss.offsetTop - spacer.offsetTop - spacer.offsetHeight - 20;
      this.maxHeight = Math.max(available, 100);
      console.log(`[PAGE] Calibrated maxHeight: ${this.maxHeight}px`);
    }
  }

  /**
   * Prüft den Textfluss und verteilt Inhalte auf Seiten
   */
  async checkFlow() {
    if (this._isReflowing) return;
    this._isReflowing = true;

    this.calibrate();

    const pages = Array.from(this.paper.querySelectorAll("din-A4"));
    const MAX_PAGES = 12; // Ein gutes Dutzend
    let fullText = this.ui.sm.state.content.text || "";

    let remainingText = fullText;
    let pageIdx = 0;

    while (remainingText.length > 0 || pageIdx === 0) {
      // Hard Limit Check
      if (pageIdx >= MAX_PAGES) {
        Toast.show(`Limit erreicht: Ein Brief darf maximal ${MAX_PAGES} Seiten umfassen.`, "warning");
        break;
      }

      let currentPage = pages[pageIdx];

      if (!currentPage) {
        currentPage = this.createNewPage(pageIdx + 1);
        pages.push(currentPage);
      }

      const textEl = currentPage.querySelector("din-text");
      const mirrorEl = currentPage.querySelector("din-text-spiegel");

      // Text setzen
      textEl.textContent = remainingText;
      this.ui._updateMirror(textEl.textContent, mirrorEl);

      // Overflow prüfen
      const overflowResult = this.findSplitPoint(textEl);

      if (overflowResult.overflow) {
        const splitIdx = overflowResult.splitIndex;
        const pageText = remainingText.substring(0, splitIdx);
        remainingText = remainingText.substring(splitIdx).trim();

        textEl.textContent = pageText;
        this.ui._updateMirror(pageText, mirrorEl);
      } else {
        remainingText = "";
      }

      pageIdx++;
      if (pageIdx > 10) break; // Safety break
    }

    // Überflüssige Seiten löschen
    while (pages.length > pageIdx && pages.length > 1) {
      const extra = pages.pop();
      extra.remove();
    }

    this._isReflowing = false;
  }

  createNewPage(num) {
    const clone = this.template.content.cloneNode(true);
    const page = clone.querySelector("din-A4");
    page.id = `page-${num}`;

    // Header auf Folgeseiten ist via CSS (Phase 1) geregelt
    this.paper.appendChild(page);
    return page;
  }

  findSplitPoint(el) {
    const limit = this.maxHeight;
    if (el.scrollHeight <= limit) return { overflow: false };

    // Binary Search für den Split-Point
    let text = el.textContent;
    let low = 0;
    let high = text.length;
    let bestSplit = 0;

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      el.textContent = text.substring(0, mid);

      if (el.scrollHeight <= limit) {
        bestSplit = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // An Wortgrenze abrunden
    const lastSpace = text.lastIndexOf(" ", bestSplit);
    const lastNewline = text.lastIndexOf("\n", bestSplit);
    const splitIndex = Math.max(lastSpace, lastNewline, 0);

    return { overflow: true, splitIndex: splitIndex || bestSplit };
  }
}
</content>
</file>

<file path="salutation.js">
<metadata>Lines: 109 | Size: 3213 B</metadata>
<content>
/**
 * salutation.js — Platinum Salutation Engine
 * [ADR-017] Intelligent Greeting & Closing Generation
 * @module salutation
 */

export const SalutationEngine = {
  TITLES: ["Dr.", "Prof.", "Prof. Dr.", "Dipl.-Ing.", "Mag."],

  /**
   * Extrahiert Titel aus einem Namen-String (priorisiert längere Titel)
   * @param {string} text - Vollständiger Name
   * @returns {string} Extrahierte Titel als String
   */
  extractTitles(text) {
    if (!text) return "";
    const sorted = [...this.TITLES].sort((a, b) => b.length - a.length);
    const found = [];
    let processedText = text;

    for (const title of sorted) {
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedTitle}\\b`, "g");
      const matches = processedText.match(regex);

      if (matches) {
        matches.forEach(() => found.push(title));
        processedText = processedText.replace(regex, "");
      }
    }
    return found.join(" ");
  },

  /**
   * Generiert eine DIN-konforme Anrede
   * @param {Object} params - Empfängerdaten
   * @returns {string} Anrede-Text
   */
  derive({ firstName = "", lastName = "", company = "", type = "none", formality = "formal" }) {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const co = company.trim();
    const title = this.extractTitles(`${fn} ${ln}`);

    if (co && !fn && !ln) {
      return this.getFallback(formality);
    }

    const name = ln || fn;
    if (!name) {
      return this.getFallback(formality);
    }

    const titlePrefix = title ? `${title} ` : "";

    if (formality === "formal") {
      if (type === "female") return `Sehr geehrte Frau ${titlePrefix}${ln || fn},`;
      if (type === "male") return `Sehr geehrter Herr ${titlePrefix}${ln || fn},`;
      return "Sehr geehrte Damen und Herren,";
    }

    if (formality === "polite") {
      if (type === "female") return `Guten Tag Frau ${titlePrefix}${ln || fn},`;
      if (type === "male") return `Guten Tag Herr ${titlePrefix}${ln || fn},`;
      return `Guten Tag ${fn} ${ln},`.replace(/\s\s+/g, " ");
    }

    if (formality === "casual") {
      return `Hallo ${fn || ln},`;
    }

    return this.getFallback(formality);
  },

  /**
   * Generiert die passende Grußformel
   * @param {string} formality - "formal" | "polite" | "casual"
   * @returns {string}
   */
  getClosing(formality = "formal") {
    if (formality === "casual") return "Beste Grüße";
    if (formality === "polite") return "Herzliche Grüße";
    return "Mit freundlichen Grüßen";
  },

  /**
   * Validiert die Grußformel nach DIN 5008
   * @param {string} text - Grußformel-Text
   * @returns {Object} { isValid, warning? }
   */
  validateClosing(text) {
    if (!text) return { isValid: true };
    const trimmed = text.trim();
    if (trimmed.endsWith(",") || trimmed.endsWith(".")) {
      return {
        isValid: false,
        warning: "DIN 5008: Kein Komma oder Punkt nach der Grußformel."
      };
    }
    return { isValid: true };
  },

  getFallback(formality) {
    if (formality === "casual") return "Hallo zusammen,";
    if (formality === "polite") return "Guten Tag,";
    return "Sehr geehrte Damen und Herren,";
  }
};
</content>
</file>

<file path="scripts/check_readiness.js">
<metadata>Lines: 85 | Size: 2677 B</metadata>
<content>
/**
 * DIN-BriefNEO — Mission Readiness Prompt (Premium v25.0)
 * Chrome 147/148/149 Readiness Check
 * ─────────────────────────────────────────────────────────
 * Anleitung: Den gesamten Code kopieren und in die
 * Browser-Konsole (F12 -> Console) einfügen.
 */
(function checkAviationReadinessPremium() {
  const f = (name, supported, baseline) => ({ name, supported, baseline });

  const features = [
    f("Temporal API (TOMB-L001)", !!globalThis.Temporal, "Chrome 146/Stable"),
    f(
      "CSS @property (CMA-Typed)",
      CSS.supports("--x: 1mm") && !!window.CSSPropertyRule,
      "Chrome 146/Stable",
    ),
    f(
      "CSS @scope (Isolation)",
      typeof CSSScopeRule !== "undefined",
      "Chrome 118/Stable",
    ),
    f(
      "CSS if() Logic",
      CSS.supports("top: if(style(--x: 1): 1px; else: 2px)"),
      "Chrome 148",
    ),
    f(
      "Scroll-State Queries",
      CSS.supports("container-type: scroll-state"),
      "Chrome 147",
    ),
    f(
      "Native Invokers (commandfor)",
      "commandfor" in document.createElement("button"),
      "Chrome 147",
    ),
    f(
      "Advanced attr() Typisierung",
      CSS.supports("width: attr(data-x type(<length>))"),
      "Chrome 133/149",
    ),
    f(
      "View Transitions (Scoped)",
      !!document.startViewTransition,
      "Chrome 146/Stable",
    ),
    f(
      "CSS contrast-color()",
      CSS.supports("color: contrast-color(white)"),
      "Chrome 147",
    ),
    f("CSS border-shape", CSS.supports("border-shape: circle"), "Chrome 147"),
    f("Math.sumPrecise", !!Math.sumPrecise, "Chrome 147"),
    f("Sanitizer API (Native)", !!globalThis.Sanitizer, "Chrome 147"),
    f("Element.setHTML()", !!Element.prototype.setHTML, "Chrome 147"),
    f(
      "CSS calc-size(auto)",
      CSS.supports("height: calc-size(auto, 100%)"),
      "Chrome 129/Stable",
    ),
  ];

  const header =
    `# 🛫 DIN-BriefNEO — High-Integrity Readiness Report\n` +
    `## Baseline: Chrome 147.0+ | Generiert: ${Temporal.Now.plainDateTimeISO().toString()}\n\n` +
    `| Feature | Status | Baseline | Architektur-Nutzen |\n` +
    `| :--- | :--- | :--- | :--- |\n`;

  const rows = features
    .map((feat) => {
      const icon = feat.supported ? "✅ **READY**" : "⏳ *PENDING*";
      const benefit = feat.supported
        ? "Aktiviert (Produktiv)"
        : "Future-Proof (Inaktiv)";
      return `| ${feat.name.padEnd(28)} | ${icon.padEnd(12)} | ${feat.baseline.padEnd(18)} | ${benefit} |`;
    })
    .join("\n");

  const footer = `\n\n---\n**System-Check vollständig.** Das Projekt reift in seine Zielplattform hinein.`;

  console.clear();
  console.log(header + rows + footer);
})();
</content>
</file>

<file path="scripts/din-spec-checker-checker.js">
<metadata>Lines: 108 | Size: 2680 B</metadata>
<content>
/**
 * DIN-SPEC-CHECKER (v2.0)
 * Precision Validator for v4.0 Standard & DIN 5008:2020-03
 */

const RULES = {
  geometry: {
    addressZone: { width: "85mm", height: "45mm", top: "45mm", left: "20mm" },
    foldMarks: ["105mm", "210mm"],
    holeMark: "148.5mm",
  },
  // NO-FLUFF POLICY: Forbidden metaphorical terminology
  fluffRadar: ["Aviation", "Sovereign", "Akinator", "Grade"],
  // ELEMENT WHITELIST: Strictly IMR 4.0 Atoms
  elements: {
    allowed: [
      "din-5008",
      "din-A4",
      "din-header",
      "din-anschriftfeld",
      "din-infoblock",
      "din-absender-vorname",
      "din-absender-nachname",
      "din-absender-strasse",
      "din-absender-ort",
      "din-return-line",
      "din-supplement",
      "din-empfaenger-firma",
      "din-empfaenger-name",
      "din-empfaenger-strasse",
      "din-empfaenger-ort",
      "din-ref-ihr",
      "din-ref-unser",
      "din-date",
      "din-subject",
      "din-anrede",
      "din-text",
      "din-text-mirror",
      "din-grussformel",
      "din-signature",
      "din-attachments",
      "din-fusszeile",
      "din-fiscal-data",
      "din-bank-data",
    ],
    extensionPrefix: "din-ext-",
  },
  apis: {
    mandatory: ["setHTML", "textContent", "popover", "Temporal", "EditContext"],
    forbidden: [
      "innerHTML",
      "document.write",
      "var",
      "new Date()",
      "Date.now()",
    ],
  },
};

export function validate(content, fileName) {
  const errors = [];

  // 1. Terminology Check
  RULES.fluffRadar.forEach((word) => {
    if (content.toLowerCase().includes(word.toLowerCase())) {
      errors.push(
        `[TERMINOLOGY] File ${fileName} contains metaphorical fluff: "${word}"`,
      );
    }
  });

  // 2. API Check
  RULES.apis.forbidden.forEach((api) => {
    if (content.includes(api)) {
      errors.push(`[LEGACY] Forbidden pattern found: ${api}`);
    }
  });

  // 3. Popover Check (for HTML files)
  if (
    fileName.endsWith(".html") &&
    content.includes("<dialog") &&
    !content.includes("popover")
  ) {
    errors.push(
      `[A11Y] Dialog found without Popover API. Use CSS-first Popover approach.`,
    );
  }

  // 4. Element Check (for HTML files)
  if (fileName.endsWith(".html")) {
    const customElements = content.match(/<din-[a-z0-9-]+/g) || [];
    customElements.forEach((tag) => {
      const tagName = tag.substring(1);
      if (
        !RULES.elements.allowed.includes(tagName) &&
        !tagName.startsWith(RULES.elements.extensionPrefix)
      ) {
        errors.push(
          `[SPEC] Non-standard Custom Element found: ${tagName}. Align with IMR 4.0 atoms.`,
        );
      }
    });
  }

  return errors;
}
</content>
</file>

<file path="scripts/get-catalog.mjs">
<metadata>Lines: 25 | Size: 678 B</metadata>
<content>
/**
 * DIN-BriefNEO Component Catalog Generator
 * Extract IMR (Isomorphic Master Registry) as JSON for AI Agent Guidance.
 * Part of the v4 Core Validation Pipeline (061).
 */
import { IMR, CMA } from "../js/constants.js";

const catalog = {
  version: "16.0.1",
  timestamp: new Date().toISOString(),
  mandates: [
    "MANDATE-INJ: Zero innerHTML",
    "MANDATE-FREEZE: Zero Pixel-Shift",
    "MANDATE-NAT: Native Browser-First",
    'MANDATE-PLN: contenteditable="plaintext-only"',
  ],
  imr: IMR.map((field) => ({
    tag: field.tag,
    key: field.key,
    coordinate: field.cmaProp ? CMA[field.cmaProp] : "N/A",
  })),
};

console.log(JSON.stringify(catalog, null, 2));
</content>
</file>

<file path="scripts/live_activation.js">
<metadata>Lines: 43 | Size: 1486 B</metadata>
<content>
const fs = require("fs");

// 1. HTML Activation (CSS Variable Sync)
let html = fs.readFileSync("index.html", "utf8");

// Replace dataset.layout with setProperty('--layout', ...)
html = html.replace(
  /onchange="document\.getElementById\('paper'\)\.dataset\.layout=this\.value;/g,
  "onchange=\"document.getElementById('paper').style.setProperty('--layout', this.value);",
);

// Default Layout Variable setzen
html = html.replace(
  '<div id="paper"',
  '<div id="paper" style="--layout: form-b"',
);

fs.writeFileSync("index.html", html);
console.log("✅ HTML: Layout Handlers updated to CSS Variables");

// 2. CSS Activation (if() Logic Prime)
let css = fs.readFileSync("css/din5008-paper.css", "utf8");

// Die if() Logik für das Anschriftfeld ist bereits drin, wir härten sie jetzt.
// Wir fügen auch die Logik für den Infoblock und den Betreff hinzu, falls nötig.

css = css.replace(
  /top: if\(style\(--layout: form-a\): var\(--margin-top-a\); else: var\(--margin-top-b\)\);/,
  "top: if(style(--layout: form-a): var(--margin-top-a); else: var(--margin-top-b));",
);

// Scroll-State für den Brieftext ist bereits in der Readiness-Prüfung bestätigt
// Wir stellen sicher, dass din-body den container-type hat.
if (!css.includes("container-type: scroll-state")) {
  css = css.replace(
    /din-body \{/g,
    "din-body { container-type: scroll-state; ",
  );
}

fs.writeFileSync("css/din5008-paper.css", css);
console.log("✅ CSS: if() Logic and Scroll-State fully activated");
</content>
</file>

<file path="scripts/matrix-audit.js">
<metadata>Lines: 68 | Size: 2682 B</metadata>
<content>
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootPath = join(__dirname, '../');

async function runAudit() {
  console.log('🌐 Starte Webserver für Secure-Context Audit...');
  const server = spawn('npx', ['http-server', rootPath, '-p', '8081'], { shell: true });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🚀 Starte Platinum-Audit via http://localhost:8081...');
  await page.goto('http://localhost:8081');

  const results = await page.evaluate(() => {
    const checkCSS = (prop) => CSS.supports(prop);
    const checkJS = (obj) => {
        try { return typeof eval(`globalThis.${obj}`) !== 'undefined'; }
        catch { return false; }
    };
    const checkProto = (cls, prop) => {
        try { return prop in eval(`${cls}.prototype`); }
        catch { return false; }
    };

    return {
      'CSS @layer': checkCSS('@layer base { color: red; }'),
      '@property': checkJS('CSSPropertyRule'),
      '@scope': checkCSS('@scope (.a) { .b { color: red; } }'),
      'calc-size(auto)': checkCSS('width: calc-size(auto, 100%)'),
      'Scroll-Anims': checkCSS('animation-timeline: scroll()'),
      'View Transitions': checkJS('document.startViewTransition'),
      'field-sizing': checkCSS('field-sizing: content'),
      'oklch()': checkCSS('color: oklch(50% 0.1 20)'),
      'contrast-color': checkCSS('color: contrast-color(white)'),
      'Anchor Positioning': checkCSS('anchor-name: --a'),
      'Popover API': 'popover' in document.createElement('div'),
      'Invoker Commands': checkProto('HTMLButtonElement', 'commandForElement'),
      'Temporal API': checkJS('Temporal'),
      'CSS if()': checkCSS('color: if(style(--a: b): red; else: blue)'),
      'Sanitizer API': checkJS('Sanitizer'),
      'FileSystem Access': checkJS('showOpenFilePicker'),
      'Service Worker': 'serviceWorker' in navigator,
      'IdleDetector': checkJS('IdleDetector'),
      'EditContext': checkJS('EditContext'),
      'Gemini Nano (AI)': checkJS('ai?.languageModel')
    };
  });

  console.log('\n🛡️ SECURE CONTEXT AUDIT RESULTS');
  console.log('=======================================');
  for (const [api, status] of Object.entries(results)) {
    console.log(`${status ? '✅' : '❌'} ${api.padEnd(25)}: ${status ? 'SUPPORTED' : 'LOCKED/FUTURE'}`);
  }
  console.log('=======================================');

  await browser.close();
  server.kill();
  process.exit(0);
}

runAudit();
</content>
</file>

<file path="scripts/platinum-test.js">
<metadata>Lines: 73 | Size: 2633 B</metadata>
<content>
import puppeteer from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootPath = join(__dirname, '../');

async function runTest() {
  console.log('🌐 Starte lokalen Webserver...');
  // Wir nutzen http-server für den Test
  const server = spawn('npx', ['http-server', rootPath, '-p', '8080'], { shell: true });

  await new Promise(resolve => setTimeout(resolve, 3000)); // Puffer für Serverstart

  const browser = await puppeteer.chromium.launch();
  const page = await browser.newPage();

  // Logge Browser-Konsolen-Ausgaben
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  console.log('🚀 Starte Platinum-Validierung via http://localhost:8080...');

  try {
    await page.goto('http://localhost:8080');

    // 1. Check: Existenz der Container
    console.log('\n🏗️ Prüfe DOM-Struktur...');
    const containers = ['din-absender', 'din-anschriftfeld', 'din-infoblock', 'din-datum', 'din-kern', 'din-fuss'];
    for (const tag of containers) {
      const exists = await page.$(tag);
      if (exists) console.log(`  ${tag}: ✅`);
      else console.log(`  ${tag}: ❌ FEHLT`);
    }

    // 2. Check: Form A/B Umschaltung
    console.log('\n📐 Prüfe Form A/B Umschaltung...');
    const addr = await page.$('din-anschriftfeld');
    let boxB = await addr.boundingBox();

    await page.click('label[for="state-layout-a"]');
    await page.waitForTimeout(1000);
    let boxA = await addr.boundingBox();

    console.log(`  Form B Y: ${Math.round(boxB.y)}px | Form A Y: ${Math.round(boxA.y)}px`);
    if (boxA.y < boxB.y) console.log('  ✅ Layout-Switch: OK');
    else console.log('  ❌ Layout-Switch: FEHLER');

    // 3. Check: Markdown Mirror
    console.log('\n📝 Prüfe Markdown-Rendering...');
    await page.evaluate(() => {
      const editor = document.querySelector('din-text');
      editor.textContent = 'Test **fett**';
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(500);
    const mirrorHTML = await page.$eval('din-text-spiegel', el => el.innerHTML);
    console.log(`  Mirror HTML: ${mirrorHTML}`);
    if (mirrorHTML.includes('<strong>fett</strong>')) console.log('  ✅ Markdown: OK');
    else console.log('  ❌ Markdown: FEHLER (Spiegel leer oder falsch)');

  } catch (e) {
    console.error('❌ Test-Abbruch:', e);
  } finally {
    console.log('\n🏁 Test abgeschlossen. Schließe Ressourcen...');
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

runTest();
</content>
</file>

<file path="scripts/test-all.js">
<metadata>Lines: 135 | Size: 4558 B</metadata>
<content>
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

/**
 * DIN-BriefNEO v4 Core Validation Suite
 * Consolidates Geometry Check (DIN 5008) and Layout Switching.
 */
async function runFullValidation() {
  console.log("🚀 [VALIDATION] Starte v4 Core Engine Check...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 2, // Hi-DPI for precise measurements
  });

  const page = await context.newPage();
  const filePath = `file://${path.join(projectRoot, "index.html").replace(/\\/g, "/")}`;

  try {
    await page.goto(filePath, { waitUntil: "networkidle" });

    // --- TEST 1: GEOMETRY CHECK (DIN 5008) ---
    console.log("\n--- 📏 TEST 1: DIN 5008 Geometrie-Metriken ---");
    const metrics = await page.evaluate(() => {
      const paper = document.getElementById("paper") || document.body;
      const fold1 =
        document.querySelector(".mark-fold-1") ||
        document.querySelector(".fold-mark-1");
      const fold2 =
        document.querySelector(".mark-fold-2") ||
        document.querySelector(".fold-mark-2");
      const addr = document.querySelector("din-anschriftfeld");

      const toMm = (px) => (px / 96) * 25.4;

      return {
        paper: {
          w: toMm(paper.offsetWidth).toFixed(1) + "mm",
          h: toMm(paper.offsetHeight).toFixed(1) + "mm",
        },
        fold1: { top: fold1 ? toMm(fold1.offsetTop).toFixed(1) + "mm" : "N/A" },
        fold2: { top: fold2 ? toMm(fold2.offsetTop).toFixed(1) + "mm" : "N/A" },
        address: {
          top: addr ? toMm(addr.offsetTop).toFixed(1) + "mm" : "N/A",
          left: addr ? toMm(addr.offsetLeft).toFixed(1) + "mm" : "N/A",
        },
      };
    });
    console.table(metrics);

    // --- TEST 2: LAYOUT SWITCHING (Form A <-> B) ---
    console.log("\n--- 🖱️ TEST 2: Layout-Switch (Form A/B) ---");

    // Initial state
    const initial = await page.evaluate(() => ({
      bodyLayout: document.body.dataset.layout,
      paperForm: document.getElementById("paper")?.dataset.form,
      addrTop: window.getComputedStyle(
        document.querySelector("din-anschriftfeld"),
      ).top,
    }));
    console.log("Initial Status:", initial);

    // Switch to Form A
    const layoutARadio = await page.$("#layout-a");
    if (layoutARadio) {
      console.log("🖱️ Klicke auf #layout-a...");
      await layoutARadio.click();

      // Den State-Change und DOM-Sync abwarten
      await page.waitForTimeout(1000);

      const after = await page.evaluate(() => {
        const bodyLayout = document.body.dataset.layout;
        const paperForm = document.getElementById("paper")?.dataset.form;
        const addr = document.querySelector("din-anschriftfeld");
        return {
          bodyLayout,
          paperForm,
          addrTop: window.getComputedStyle(addr).top,
        };
      });

      console.log("Status nach Klick:", after);

      // Validation logic: either the attribute or the physical position must change
      const isA =
        after.bodyLayout === "form-a" ||
        after.paperForm === "A" ||
        after.addrTop.includes("102");

      if (isA) {
        console.log(
          "✅ SUCCESS: Layout-Switch visuell oder strukturell erkannt.",
        );
        console.log(`   Adresse-Position (px): ${after.addrTop}`);
      } else {
        console.error(
          "❌ FAILURE: Layout-Switch wurde nicht im DOM reflektiert.",
        );
        // Screenshot zur Fehlerdiagnose
        const errPath = path.join(
          projectRoot,
          "assets/screenshots/layout-switch-error.png",
        );
        await page.screenshot({ path: errPath });
        console.log(`📸 Fehler-Screenshot: ${errPath}`);
      }
    } else {
      console.log("⚠️ INFO: #layout-a nicht gefunden.");
    }

    // --- FINAL: SCREENSHOT ---
    const screenshotPath = path.join(
      projectRoot,
      "assets/screenshots/v4-core-validation-report.png",
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 [REPORT] Screenshot erstellt: ${screenshotPath}`);
  } catch (err) {
    console.error("\n❌ [CRITICAL] Validierung abgebrochen:", err);
  } finally {
    await browser.close();
    console.log("\n🏁 [DONE] Validierung abgeschlossen.");
  }
}

runFullValidation();
</content>
</file>

<file path="style.css">
<metadata>Lines: 1005 | Size: 22548 B</metadata>
<content>
/**
 * style.css — DIN-BriefNEO Unified Stylesheet (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

@layer latex.base, ui.theme, din.structure, ui.floating, ui.components, project.overrides, core.immutable;

/* ── BASE LAYER ────────────────────────────────────────────── */
@layer latex.base {
  :root {
    interpolate-size: allow-keywords;
  }

  /* Platinum Typography: OpenType Features */
  @font-feature-values "Inter", "system-ui", "Aptos" {
    @styleset {
      tabular-nums: 1;
      slashed-zero: 2;
    }
  }

  html,
  body {
    font-family: "Inter", system-ui, sans-serif;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100dvh;
    overflow: hidden;
  }

  /* Accessibility: Focus only on keyboard navigation */
  :focus-visible {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }
  :focus:not(:focus-visible) {
    outline: none;
  }

  ::selection {
    background: var(--c-primary);
    color: white;
  }
}

/* ── THEME LAYER ────────────────────────────────────────────── */
@layer ui.theme {
  @property --din-y-header-start {
    syntax: "<length>";
    inherits: true;
    initial-value: 45mm;
  }

  :root {
    color-scheme: light dark;
    --c-primary: oklch(60% 0.15 250);
    --c-primary-hover: color-mix(in oklch, var(--c-primary), white 15%);
    --c-primary-active: color-mix(in oklch, var(--c-primary), black 10%);

    /* Native Dynamic Colors */
    --c-sidebar-bg: light-dark(oklch(25% 0.05 250), oklch(15% 0.05 250));
    --c-sidebar-btn-bg: color-mix(in oklch, var(--c-sidebar-bg), white 5%);
    --c-sidebar-text: oklch(98% 0.01 250);
    --c-sidebar-text-muted: oklch(70% 0.05 250);
    --c-sidebar-border: color-mix(
      in oklch,
      var(--c-sidebar-text),
      transparent 90%
    );

    /* Semantic UI Colors */
    --c-text-muted: oklch(55% 0.03 250);
    --c-danger: oklch(55% 0.2 30);
    --c-success: oklch(60% 0.2 145);

    --c-bg-gradient: light-dark(
      linear-gradient(135deg, oklch(65% 0.15 250) 0%, oklch(45% 0.2 280) 100%),
      linear-gradient(135deg, oklch(20% 0.05 250) 0%, oklch(15% 0.05 280) 100%)
    );

    --c-paper-shadow:
      0 30px 60px -12px oklch(0% 0 0 / 25%),
      0 18px 36px -18px oklch(0% 0 0 / 30%);

    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;

    /* SSoT: Form B ist Default (45mm) */
    --din-y-abschnitt: 45mm;
    --din-y-fold-1: 105mm;
    --din-y-fold-2: 210mm;
  }

  /* Form A Override */
  :root:has(#state-layout-a:checked) {
    --din-y-abschnitt: 27mm;
    --din-y-fold-1: 87mm;
    --din-y-fold-2: 192mm;
  }

  /* Derived Variables (calc-logic) */
  :root {
    --din-y-addr: var(--din-y-abschnitt);
    --din-y-datum: var(--din-y-abschnitt);
    --din-y-kern: calc(var(--din-y-abschnitt) + 58.4mm);
    --din-y-infoblock: calc(var(--din-y-abschnitt) + 52.4mm);
  }

  /* Manual Theme Overrides (using :has) */
  :root:has(#theme-night:checked) {
    color-scheme: dark;
    --c-bg-gradient: linear-gradient(135deg, #1a1c2c 0%, #2d3436 100%);
    --c-sidebar-bg: #0f111a;
  }

  :root:has(#theme-day:checked) {
    color-scheme: light;
  }
}

/* ── DIN STRUCTURE (High-Integrity mm-Dimensions) ──────────── */
@layer din.structure {
  #paper {
    display: flex;
    gap: 40px;
    padding: 40px;
    position: relative;
    color: oklch(25% 0.05 250);
    container-name: paper;
    container-type: size scroll-state;
  }

  din-A4 {
    display: block;
    width: 210mm;
    height: 297mm;
    background: white;
    position: relative;
    box-shadow: var(--c-paper-shadow);
    font-family: "Aptos", "Segoe UI", system-ui, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    overflow: hidden;
    flex-shrink: 0;
    scroll-snap-align: center;
    transition: filter 0.4s ease, opacity 0.4s ease, transform 0.4s ease;
  }

  /* Carousel: Inactive Pages Effect */
  din-A4:not(.active) {
    filter: blur(4px);
    opacity: 0.6;
    transform: scale(0.95);
  }

  @scope (din-A4) {
    din-header-spacer {
      display: block;
      height: var(--din-y-kern);
      flex-shrink: 0;
    }

    din-betreff {
      font-weight: bold;
      text-wrap: balance;
    }

    din-kern {
      position: relative;
      margin-left: round(25mm, 0.1mm);
      width: 165mm;
      z-index: 5;
      display: flex;
      flex-direction: column;
      hyphens: auto;
      text-justify: inter-word;
      orphans: 3;
      widows: 3;
    }

    din-text-spiegel {
      text-wrap: pretty;
    }

    din-absender {
      position: absolute;
      left: round(125mm, 0.1mm);
      width: 75mm;
      top: round(20mm, 0.1mm);
      z-index: 10;
      display: flex;
      flex-direction: column;
    }
    din-anschriftfeld {
      position: absolute;
      left: round(20mm, 0.1mm);
      width: 85mm;
      height: 45mm;
      top: round(var(--din-y-addr), 0.1mm);
      z-index: 10;
      display: flex;
      flex-direction: column;
    }
    din-infoblock {
      position: absolute;
      left: round(125mm, 0.1mm);
      width: 75mm;
      top: round(var(--din-y-infoblock), 0.1mm);
      z-index: 10;
      display: flex;
      flex-direction: column;
    }
    din-datum {
      position: absolute;
      left: round(125mm, 0.1mm);
      width: 75mm;
      top: round(var(--din-y-datum), 0.1mm);
      text-align: right;
      z-index: 10;
    }

    din-fuss {
      position: relative;
      margin-left: round(25mm, 0.1mm);
      width: 165mm;
      margin-top: auto;
      padding-bottom: 15mm;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: round(5mm, 0.1mm);
      font-size: 8pt;
      line-height: 1.3;
      color: var(--c-text-muted);
    }

    din-fuss > *:nth-child(4) {
      text-align: right;
    }

    /* Platinum Typography: Tabular Numbers for Data-Density fields */
    :is(din-datum, din-infoblock, din-fuss-iban, din-fuss-bic, din-fuss-stnr) {
      font-variant-numeric: tabular-nums slashed-zero;
      font-feature-settings:
        "tnum" on,
        "zero" on;
    }

    /* ── [PLATINUM] Faltmarken (ADR-017 / 4mm Standard) ── */
    din-falz-oben,
    din-falz-unten {
      display: block;
      position: absolute;
      left: 0;
      width: 4mm;
      height: 1px;
      background: oklch(0% 0 0 / 25%);
      pointer-events: none;
      transition:
        opacity 0.3s ease,
        top 0.3s ease;
      opacity: 0;
    }

    din-falz-oben {
      top: var(--din-y-fold-1);
    }
    din-falz-unten {
      top: var(--din-y-fold-2);
    }
  }

  /* Toggle Logic & Print Override (Zero-JS UI State) */
  :root:has(#state-guides:checked) {
    & :is(din-falz-oben, din-falz-unten) {
      opacity: 1;
    }
  }

  /* ── [PHASE 1] NATIVE PRINT PAGINATION ── */
  @media print {
    #app-shell {
      display: block !important;
    }

    #sidebar-left, .no-print, #toast-v4, #autocomplete-portal, .toast-container {
      display: none !important;
    }

    #paper-viewport {
      position: static !important;
      overflow: visible !important;
      padding: 0 !important;
      display: block !important;
    }

    #paper {
      display: block !important;
      padding: 0 !important;
      gap: 0 !important;
      overflow: visible !important;
    }

    din-A4 {
      box-shadow: none !important;
      margin: 0 !important;
      break-after: page;
      page-break-after: always;
      filter: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    /* Hide header on follow-up pages */
    din-A4:not(:first-of-type) :is(din-absender, din-anschriftfeld, din-infoblock, din-datum, din-header-spacer) {
      display: none !important;
    }

    /* Standard DIN Follow-up Header (minimal) */
    din-A4:not(:first-of-type)::before {
      content: "Brief-Fortsetzung | Seite " counter(page);
      position: absolute;
      top: 10mm;
      left: 25mm;
      font-size: 9pt;
      color: var(--c-text-muted);
    }
  }

  /* Zero-JS Overflow Alarm with @container scroll-state (Chrome 147+) */
  @container paper scroll-state(scrollable: block) {
    #paper::after {
      content: "⚠️ TEXT-ÜBERLAUF: Seite 1 überschritten";
      position: absolute;
      bottom: 15mm;
      right: 10mm;
      background: oklch(60% 0.2 30);
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 8pt;
      font-weight: bold;
      box-shadow: 0 4px 10px oklch(0% 0 0 / 20%);
      animation: alert-pop 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      z-index: 100;
      pointer-events: none;
    }
  }

  @keyframes alert-pop {
    from {
      transform: translateY(20px) scale(0.8);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
}

/* ── PRINT ENGINE ────────────────────────────────────────── */
@layer core.immutable {
  @counter-style din-pages {
    system: numeric;
    symbols: "0" "1" "2" "3" "4" "5" "6" "7" "8" "9";
    suffix: " · ";
  }

  @page {
    size: A4;
    margin: 0;
    @bottom-center {
      content: "Seite " counter(page, din-pages) " von " counter(pages);
      font-size: 9pt;
      color: oklch(40% 0.01 250);
    }
  }

  @page :first {
    @bottom-center {
      content: none;
    }
  }
}

/* ── UI FLOATING (Interactive Layer) ───────────────────────── */
@layer ui.floating {
  /* 1. Anchor Positioning Fallbacks (Chrome 147+) */
  @position-try --tooltip-bottom {
    inset-block-start: anchor(bottom);
    inset-block-end: auto;
    margin-block-start: 8px;
    justify-self: center;
  }
  @position-try --tooltip-top {
    inset-block-end: anchor(top);
    inset-block-start: auto;
    margin-block-end: 8px;
    justify-self: center;
  }
  @position-try --tooltip-right {
    inset-inline-start: anchor(right);
    inset-inline-end: auto;
    margin-inline-start: 12px;
    align-self: center;
  }

  /* 2. Platinum Validation Tooltips */
  .platinum-tooltip {
    position: fixed;
    position-anchor: --anchor-field;
    position-try: --tooltip-bottom, --tooltip-top, --tooltip-right;
    position-try-order: normal;

    background: oklch(25% 0.15 30 / 95%);
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    backdrop-filter: blur(8px);
    pointer-events: none;
    z-index: 2000;
    box-shadow: 0 4px 15px oklch(0% 0 0 / 30%);
    opacity: 0;
    transform: translateY(5px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease,
      display 0.3s allow-discrete;
    white-space: nowrap;
  }

  /* Trigger Tooltip on Invalid State */
  :is([aria-invalid="true"], .invalid):is(:hover, :focus) + .platinum-tooltip {
    opacity: 1;
    transform: translateY(0);
  }

  [aria-invalid="true"] {
    anchor-name: --anchor-field;
    border-color: oklch(60% 0.2 30) !important;
  }

  /* 3. DIN-Referenz-Overlay (Platinum Audit Tool) */
  #din-reference-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
    pointer-events: none;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.3s ease;

    /* Semantic Overlay Colors */
    --overlay-color-falz: oklch(60% 0.2 30);
    --overlay-color-loch: oklch(70% 0.15 80);
    --overlay-color-zone: oklch(50% 0.15 250);
    --overlay-color-info: oklch(60% 0.15 140);
    --overlay-color-grid: oklch(0% 0 0 / 20%);
    --overlay-color-fuss: oklch(50% 0.15 300);
  }

  :root:has(#state-reference:checked) #din-reference-overlay {
    opacity: 0.45;
  }

  @media print {
    #din-reference-overlay {
      display: none !important;
    }
  }

  [contenteditable] {
    border: 1px dashed transparent;
    border-radius: 4px;
    padding: 2px 4px;
    margin: -3px -5px;
    min-width: 2rem;
    min-height: 1.5rem;
    outline: none;
    transition: all 0.1s ease-in-out;
  }

  [contenteditable]:hover {
    border-color: oklch(0% 0 0 / 20%);
  }
  [contenteditable]:focus {
    border-color: var(--c-primary) !important;
    background: oklch(60% 0.15 250 / 5%);
  }

  /* Container Feedback */
  :is(din-anschriftfeld, din-kern, din-infoblock):focus-within {
    background: oklch(60% 0.15 250 / 2%);
    outline: 1px dashed oklch(60% 0.15 250 / 30%);
    transition: background 0.2s ease;
  }

  /* 3. Platinum Autocomplete (Anchor Positioning & Popover) */
  #autocomplete-portal {
    position: fixed;
    position-anchor: --anchor-address;
    top: anchor(bottom);
    left: anchor(left);
    width: anchor-size(width);
    min-width: 250px;

    background: light-dark(white, oklch(20% 0.05 250));
    border: 1px solid var(--c-sidebar-border);
    border-radius: var(--radius-md);
    box-shadow: var(--c-paper-shadow);
    padding: 4px;
    margin-top: 4px;
    z-index: 3000;

    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .suggestion-item {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background 0.2s ease;
    color: light-dark(oklch(20% 0.05 250), white);
  }

  .suggestion-item:hover, .suggestion-item:focus {
    background: var(--c-primary);
    color: white;
    outline: none;
  }

  .suggestion-icon {
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* Grouped Placeholder Logic with :is() */
  :is([style*="--p"], [data-placeholder]):empty::before {
    content: var(--p, attr(data-placeholder));
    color: oklch(0% 0 0 / 30%);
    font-style: italic;
    pointer-events: none;
  }
}

/* ── UI COMPONENTS & SIDEBAR ────────────────────────────────── */
@layer ui.components {
  #app-shell {
    display: flex;
    width: 100%;
    height: 100dvh;
    background: var(--c-bg-gradient);
    overflow: hidden;
  }

  /* Platinum Popover & Toast Transitions */
  [popover] {
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 0.4s ease-out,
      transform 0.4s ease-out,
      overlay 0.4s ease-out allow-discrete,
      display 0.4s ease-out allow-discrete;
  }

  [popover]:popover-open {
    opacity: 1;
    transform: translateY(0);
  }

  @starting-style {
    [popover]:popover-open {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  #sidebar-left {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    background: var(--c-sidebar-bg);
    color: var(--c-sidebar-text);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    border-right: 1px solid var(--c-sidebar-border);
    backdrop-filter: blur(10px);
  }

  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--c-sidebar-border);
  }
  .sidebar-brand {
    font-weight: 700;
    color: var(--c-primary);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  #sidebar-scroll-area {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px 0;
  }
  .sidebar-section {
    padding: 10px 20px;
  }
  .sidebar-label {
    font-size: 0.8rem;
    color: var(--c-sidebar-text-muted);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .segmented-control {
    position: relative;
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    padding: 3px;
    border-radius: 6px;
    border: 1px solid var(--c-sidebar-border);
    margin-bottom: 12px;
    isolation: isolate;
  }
  .segment-option {
    flex: 1;
    text-align: center;
    padding: 6px;
    cursor: pointer;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    z-index: 2;
  }
  .segment-option:has(input:checked) {
    color: white;
    font-weight: 600;
  }
  .segment-option input {
    display: none;
  }

  .toggle-control {
    margin-bottom: 12px;
  }
  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border: 1px solid var(--c-sidebar-border);
    cursor: pointer;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s ease;
  }
  .toggle-btn:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  :root:has(#state-guides:checked) .toggle-btn {
    background: color-mix(in oklch, var(--c-primary), transparent 80%);
    border-color: var(--c-primary);
    color: white;
    font-weight: 600;
  }

  .pill {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc(50% - 3px);
    background: var(--c-primary);
    border-radius: 4px;
    z-index: 1;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  :root:has(#state-layout-b:checked) #layout-switch .pill {
    transform: translateX(100%);
  }
  :root:has(#theme-night:checked) #theme-switch .pill {
    transform: translateX(100%);
  }

  .sidebar-btn {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .sidebar-btn.primary {
    background: var(--c-primary);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }
  .sidebar-btn.secondary {
    background: var(--c-sidebar-btn-bg);
    color: white;
    border: 1px solid var(--c-sidebar-border);
  }

  .actions-footer {
    padding: 20px;
    background: var(--c-sidebar-bg);
    border-top: 1px solid var(--c-sidebar-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  #paper-viewport {
    position: absolute;
    left: 300px;
    right: 0;
    top: 0;
    bottom: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    padding: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-image: radial-gradient(
      rgba(209, 216, 224, 0.2) 1.2px,
      transparent 1.2px
    );
    background-size: 32px 32px;
    transition: background-color 0.3s;
  }
  :root:has(#theme-night:checked) #paper-viewport {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.05) 1.2px,
      transparent 1.2px
    );
  }
}

/* ── GLOBAL DIALOG SYSTEM ────────────────────────────────── */
dialog {
  border: none !important;
  border-radius: 1rem;
  padding: 0;
  background: white;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  max-width: 500px;
  width: 90vw;
  color: #212529;
  margin: auto;
}
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
.dialog-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}
.dialog-content-no-scroll {
  padding: 1.5rem;
}
.dialog-actions {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}
.btn {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.btn.primary {
  background: #4a90e2;
  color: white;
}
.btn.secondary {
  background: #e9ecef;
  color: #495057;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}
.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.row {
  display: flex;
  gap: 10px;
}
.iban-wrapper {
  position: relative;
}
#iban-ghost {
  position: absolute;
  inset: 0;
  padding: 0.6rem;
  color: #ccc;
  pointer-events: none;
  white-space: pre;
}
#profile-iban {
  background: transparent !important;
  position: relative;
  z-index: 2;
}
.invisible {
  visibility: hidden;
}
.icon-wrapper {
  width: 50px;
  height: 50px;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}
.dialog-close-x {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

/* [DIN.UI.SALUTATION.GHOST] Smart-Default Pattern */
din-anrede,
din-grussformel {
  display: block;
  min-height: 1.2em;
  position: relative;
  cursor: text;
}
din-anrede {
  margin-bottom: 1em;
}
din-grussformel {
  margin-top: 2em;
  margin-bottom: 12.7mm;
} /* DIN 5008: 3 Leerzeilen vor Unterschrift */

din-anrede:empty::before {
  content: attr(data-salutation);
  color: inherit;
  opacity: 0.8;
  pointer-events: none;
  display: block;
}
din-grussformel:empty::before {
  content: attr(data-greeting);
  color: inherit;
  opacity: 0.8;
  pointer-events: none;
  display: block;
}
din-anrede:focus:empty::before,
din-grussformel:focus:empty::before {
  opacity: 0.4;
}

/* [DIN.UI.VALIDATION] Inline Feedback */
[aria-invalid="true"] {
  text-decoration: underline wavy var(--c-danger);
  text-decoration-thickness: 1px;
}

[aria-invalid="true"][data-warning]::after {
  content: attr(data-warning);
  position: absolute;
  bottom: 100%;
  left: 0;
  font-size: 0.7rem;
  color: white;
  font-weight: 500;
  background: var(--c-danger);
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  margin-bottom: 5px;
}

/* ── UI.FLOATING & TOASTS ──────────────────────────────────── */
#toast-v4 {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  background: var(--c-sidebar-bg);
  color: white;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

#toast-v4:popover-open {
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  #toast-v4:popover-open {
    opacity: 0;
    transform: translateY(-20px);
  }
}

#toast-v4.type-success {
  border-left: 4px solid var(--c-success);
}
#toast-v4.type-error {
  border-left: 4px solid var(--c-danger);
}
#toast-v4.type-info {
  border-left: 4px solid var(--c-primary);
}

/* ── CONTENT ELEMENTS (PLATINUM MARKDOWN) ─────────────────── */
.md-list-item {
  display: flex;
  gap: 0.5em;
  margin-bottom: 0.2em;
  align-items: baseline;
}
.md-bullet,
.md-num,
.md-checkbox {
  color: var(--c-primary);
  font-weight: 700;
  flex-shrink: 0;
}
.md-task-list.is-checked {
  color: #94a3b8;
  text-decoration: line-through;
  opacity: 0.7;
}
.md-quote {
  border-left: 3px solid var(--c-primary);
  padding-left: 1em;
  color: #64748b;
  font-style: italic;
  margin: 1em 0;
}
.md-marker {
  width: 0;
  display: inline-block;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
</content>
</file>

<file path="sw.js">
<metadata>Lines: 39 | Size: 791 B</metadata>
<content>
/**
 * sw.js — DIN-BriefNEO Service Worker (Pure Edition)
 * [ADR-017] Flat & Pure Architecture | Offline Capability
 */

const CACHE_NAME = 'din-briefneo-v4.1.2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/logic.js',
  '/engine.js',
  '/ui.js',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});
</content>
</file>

<file path="toast.js">
<metadata>Lines: 31 | Size: 881 B</metadata>
<content>
/* ── TOAST SYSTEM (Platinum UI Feedback) ────────────────────── */

export const Toast = {
  /**
   * Zeigt eine kurze Benachrichtigung
   * @param {string} message - Der anzuzeigende Text
   * @param {'info'|'success'|'warning'|'error'} type - Der Typ der Meldung
   */
  show(message, type = "info") {
    const el = document.getElementById("toast-v4");
    if (!el) return;

    el.textContent = message;
    el.className = `toast-container type-${type}`;

    try {
      // Nutzt native Popover API (Chrome 114+)
      el.showPopover();

      // SW-05: Animationend Listener statt hartem setTimeout für Platinum-Feel
      const onEnd = () => {
        el.hidePopover();
        el.removeEventListener("animationend", onEnd);
      };
      el.addEventListener("animationend", onEnd);
    } catch (e) {
      console.warn("[UI] Popover API failure:", e);
    }
  }
};
</content>
</file>

<file path="tools/enforce-tool-ban.ps1">
<metadata>Lines: 30 | Size: 1535 B</metadata>
<content>
# scripts/enforce-tool-ban.ps1
# -----------------------------------------------------------------
# DIN-BriefNEO -- Tool Ban Enforcement
# BANNED TOOLS DOCTRINE [MANDATE-BANNED]
#
# This script disables 'head' and 'tail' by aliasing them to an error.
# This prevents AI agents from using fragmented file reads.
# -----------------------------------------------------------------

function Throw-MandateViolation {
    param($ToolName)
    Write-Host "" -ForegroundColor Red
    Write-Host "!!! MANDATE VIOLATION [MANDATE-BANNED] !!!" -ForegroundColor Red
    Write-Host "The tool '$ToolName' is strictly forbidden in this project." -ForegroundColor Red
    Write-Host "REASON: tail und head sind aufgrund von sicherheitsrisiken gesperrt, bitte benutze andere tools" -ForegroundColor Yellow
    Write-Host "ACTION: Use 'read_file' with explicit start_line and end_line instead." -ForegroundColor Cyan
    Write-Host ""
    # In some contexts we might want to exit, but for a global profile we just return
    # exit 1
}

# Create aliases and functions to overwrite any existing head/tail commands in the session
function head { Throw-MandateViolation "head" }
function tail { Throw-MandateViolation "tail" }

# Set-Alias can override existing commands, but functions have higher precedence in PowerShell than binaries.
# By defining functions named 'head' and 'tail', they will be used instead of head.exe and tail.exe.

Write-Host "MANDATE-BANNED: Tools 'head' and 'tail' have been disabled in this session." -ForegroundColor Green
</content>
</file>

<file path="tools/post-session-verify.ps1">
<metadata>Lines: 135 | Size: 5576 B</metadata>
<content>
# scripts/post-session-verify.ps1
# -----------------------------------------------------------------
# DIN-BriefNEO -- Post-Session Schaden-Pruefung
# BRAIN-013 | Zeigt was die Agenten-Session veraendert hat
#
# USAGE: .\scripts\post-session-verify.ps1
# Nach JEDER Agenten-Session ausfuehren.
# -----------------------------------------------------------------

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
    $branch = git branch --show-current

    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "  [SEARCH] Post-Session Verifikation" -ForegroundColor Cyan
    Write-Host "  Branch: $branch" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan

    # Diff gegen letzten Checkpoint
    $diffStat = git diff HEAD --stat
    $unstaged = git status --porcelain

    if (-not $diffStat -and -not $unstaged) {
        Write-Host ""
        Write-Host "  [OK] Keine Aenderungen seit letztem Checkpoint." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  Aenderungen seit letztem Commit:" -ForegroundColor Yellow
        Write-Host ""

        # Farbige Ausgabe
        git diff HEAD --stat | ForEach-Object {
            if ($_ -match "deletion") {
                if ($_ -match "(\d+) deletion" -and [int]$Matches[1] -gt 10) {
                    Write-Host "  [!] $_" -ForegroundColor Red
                } else {
                    Write-Host "  $_" -ForegroundColor Gray
                }
            } elseif ($_ -match "insertion") {
                Write-Host "  $_" -ForegroundColor Green
            } else {
                Write-Host "  $_" -ForegroundColor Gray
            }
        }

        # Ungetrackte Aenderungen
        if ($unstaged) {
            Write-Host ""
            Write-Host "  Uncommitted Aenderungen:" -ForegroundColor Yellow
            git status --short | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        }
    }

    # Kritische Dateien explizit pruefen
    $criticalFiles = @(
        "js/constants.js",
        "js/logic.js",
        "GEMINI.md",
        "index.html",
        ".brain/08_isomorphic_schema.md"
    )

    Write-Host ""
    Write-Host "  Kritische Dateien (BRAIN-013):" -ForegroundColor Cyan
    foreach ($f in $criticalFiles) {
        if (Test-Path $f) {
            $lineCount = (Get-Content $f).Count
            $diffLines = git diff HEAD -- $f | Where-Object { $_ -match "^[-+][^-+]" }
            $deletions = ($diffLines | Where-Object { $_ -match "^-" }).Count
            if ($deletions -gt 10) {
                Write-Host "  [!] $f ($lineCount Zeilen, -$deletions Zeilen verloren!)" -ForegroundColor Red
            } else {
                Write-Host "  [OK] $f ($lineCount Zeilen)" -ForegroundColor Green
            }
        } else {
            Write-Host "  [ERROR] $f NICHT GEFUNDEN!" -ForegroundColor Red
        }
    }

    # v4 CORE MANDATE CHECK (SPEC-061)
    # -------------------------------------------------------------------------
    Write-Host ""
    Write-Host "  [SHIELD] v4 CORE MANDATE CHECK (v16.0.1):" -ForegroundColor Cyan

    # A. MANDATE-INJ (Zero innerHTML)
    # Ignoriere Zeilen mit // @pvp-ignore: innerHTML
    $innerHtmlMatches = Select-String -Path "js/**/*.js" -Pattern "\.innerHTML\s*=" -Exclude "js/mirror-renderer.js" | Where-Object { $_.Line -notmatch "// @pvp-ignore: innerHTML" }
    if ($innerHtmlMatches) {
        Write-Host "  [ERROR] MANDATE-INJ VERSTOSS: .innerHTML gefunden!" -ForegroundColor Red
        $innerHtmlMatches | ForEach-Object { Write-Host "      -> $($_.Path):$($_.LineNumber)" -ForegroundColor Gray }
    } else {
        Write-Host "  [OK] MANDATE-INJ (Zero innerHTML): Bestaetigt." -ForegroundColor Green
    }

    # B. MANDATE-PLN (Plaintext-Only)
    # Liest das ganze File als String um Multiline-Tags zu finden
    $indexContent = Get-Content "index.html" -Raw
    # Regex sucht nach <din-TAG ... >, aber ignoriert din-body-mirror
    $tags = [regex]::Matches($indexContent, '(?s)<din-(?!body-mirror)([\w-]+)([^>]*?)>')
    $missingPlaintext = @()
    foreach ($tag in $tags) {
        if ($tag.Value -notmatch 'contenteditable="plaintext-only"') {
            $missingPlaintext += $tag.Value.Replace("`n", " ").Replace("`r", "").Trim()
        }
    }

    if ($missingPlaintext.Count -gt 0) {
        Write-Host "  [ERROR] MANDATE-PLN VERSTOSS: <din-*> Tag ohne plaintext-only!" -ForegroundColor Red
        $missingPlaintext | ForEach-Object { Write-Host "      -> $_" -ForegroundColor Gray }
    } else {
        Write-Host "  [OK] MANDATE-PLN (Plaintext-Only): Bestaetigt." -ForegroundColor Green
    }

    # C. MANDATE-NAT (Native-First)
    $externalScripts = Select-String -Path "index.html" -Pattern "<script.*src=`"http"
    if ($externalScripts) {
        Write-Host "  [!] MANDATE-NAT WARNUNG: Externes Script gefunden!" -ForegroundColor Yellow
        $externalScripts | ForEach-Object { Write-Host "      -> $($_.Line.Trim())" -ForegroundColor Gray }
    } else {
        Write-Host "  [OK] MANDATE-NAT (Native-First): Bestaetigt." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "  [!] Zeilenverluste > 10 bei kritischen Dateien = ALARM." -ForegroundColor Yellow
    Write-Host "  [FIX] Wiederherstellung: git checkout HEAD -- filename" -ForegroundColor Gray
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""

} finally {
    Pop-Location
}
</content>
</file>

<file path="tools/pre-session.ps1">
<metadata>Lines: 67 | Size: 2360 B</metadata>
<content>
# scripts/pre-session.ps1
# -----------------------------------------------------------------
# DIN-BriefNEO -- Pre-Session Git Checkpoint
# BRAIN-013 | INCIDENT-001 Praevention
#
# USAGE: .\scripts\pre-session.ps1
# Vor JEDER Agenten-Session ausfuehren.
# -----------------------------------------------------------------

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $projectRoot

try {
    # 1. Sicherstellen dass wir im richtigen Repo sind
    $repoCheck = git rev-parse --show-toplevel 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Kein Git-Repository gefunden in: $projectRoot" -ForegroundColor Red
        exit 1
    }

    # 2. Aktuellen Status pruefen
    $status = git status --porcelain
    $branch = git branch --show-current

    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "  [PROTECT] DIN-BriefNEO -- Pre-Session Checkpoint" -ForegroundColor Cyan
    Write-Host "  Branch: $branch | $timestamp" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan

    if ($status) {
        # Geaenderte Dateien anzeigen
        Write-Host ""
        Write-Host "  Offene Aenderungen werden committed:" -ForegroundColor Yellow
        git status --short | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }

        # Commit erstellen
        git add -A
        git commit -m "chore: pre-session checkpoint [$timestamp]"

        Write-Host ""
        Write-Host "  [OK] Checkpoint committed: [$timestamp]" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  [OK] Clean Working Tree -- kein Commit noetig." -ForegroundColor Green
    }

    # 4. Enforce Tool Ban (MANDATE-BANNED)
    if (Test-Path "scripts/enforce-tool-ban.ps1") {
        . ./scripts/enforce-tool-ban.ps1
    }

    # 5. Letzten Commit anzeigen als Bestaetigung
    $lastCommit = git log --oneline -1
    Write-Host "  [INFO] Letzter Commit: $lastCommit" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  [READY] Git-Schutz und Tool-Ban aktiv." -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""

} finally {
    Pop-Location
}
</content>
</file>

<file path="tools/purge_legacy_specs.ps1">
<metadata>Lines: 21 | Size: 676 B</metadata>
<content>
# Purge legacy specs and plans folders
# These files have been consolidated into .brain/00_REQUIREMENTS_MASTER_v1.0.0.md

Write-Host "Purging legacy specs/ and plans/ folders..." -ForegroundColor Yellow

$projectRoot = "C:\Users\morit\Desktop\DIN-BriefNEO"
$specsPath = Join-Path $projectRoot "specs"
$plansPath = Join-Path $projectRoot "plans"

if (Test-Path $specsPath) {
    Remove-Item -Path $specsPath -Recurse -Force
    Write-Host "Removed $specsPath" -ForegroundColor Green
}

if (Test-Path $plansPath) {
    Remove-Item -Path $plansPath -Recurse -Force
    Write-Host "Removed $plansPath" -ForegroundColor Green
}

Write-Host "Purge complete." -ForegroundColor Green
</content>
</file>

<file path="tools/safe-write.ps1">
<metadata>Lines: 21 | Size: 703 B</metadata>
<content>
param([string]$Path, [string]$Content, [string]$Mode = "rewrite")

$MIN_RATIO = 0.80  # Datei darf maximal 20% schrumpfen

if (Test-Path $Path) {
    if ($Mode -eq "rewrite") {
        Write-Error "FATAL: rewrite auf existierende Datei '$Path' VERBOTEN (BRAIN-013)"
        exit 1
    }
    # Zeilen-Check für append/patch
    $before = (Get-Content $Path).Count
    $after = ($Content -split "`n").Count
    if ($after -lt ($before * $MIN_RATIO)) {
        Write-Error "SHRINK-ALARM: '$Path' würde von $before auf $after Zeilen schrumpfen. ABBRUCH."
        exit 1
    }
}

Set-Content -Path $Path -Value $Content -Encoding UTF8
Write-Host "OK: $Path geschrieben ($((Get-Content $Path).Count) Zeilen)"
</content>
</file>

<file path="ui.js">
<metadata>Lines: 217 | Size: 6724 B</metadata>
<content>
/**
 * ui.js — Unified UI Controller (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

import * as Logic from "./logic.js";
import { SalutationEngine } from "./salutation.js";
import { Toast } from "./toast.js";
import { AddressService } from "./address.js";
import { PageManager } from "./pages.js";

/* ── UI CONTROLLER ────────────────────────────────────────── */

export class UIController {
  constructor(sm) {
    this.sm = sm;
    this.address = new AddressService(this);
    this.pages = new PageManager(this);
  }

  init() {
    this._initInputs();
    this._initControls();
    this._initModals();
    this._initCarousel();
    this.address.init();
    this.pages.init();
    this.sm.subscribe((path, val, scope) => this._onStateChange(path, val, scope));
    this._syncAll();

    // SW-14: Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => console.log("[PWA] SW registered:", reg.scope))
          .catch((err) => console.warn("[PWA] SW failed:", err));
      });
    }
  }

  _initInputs() {
    Logic.IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (!el) return;

      el.addEventListener("input", (e) => {
        const text = e.target.textContent.trim();
        this.sm.update(`content.${entry.key}`, text);

        // SW-09: IBAN Length Check (Hard Limit 22)
        if (entry.key === "senderIban") {
          if (text.length > 22) {
            el.textContent = text.substring(0, 22);
            el.setAttribute("data-warning", "IBAN zu lang");
          } else {
            el.removeAttribute("data-warning");
          }
        }

        if (entry.tag === "din-text") {
          this.pages.checkFlow();
        }
      });
    });
  }

  _initControls() {
    // Theme Switch
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const newTheme = isDark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        this.sm.update("config.theme", newTheme, "user");
      });
    }

    // Export JSON
    const exportBtn = document.getElementById("btn-export");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(this.sm.state, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `brief_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        Toast.show("Dokument exportiert", "success");
      });
    }
  }

  _initModals() {
    const dialogs = document.querySelectorAll("dialog");
    dialogs.forEach((dialog) => {
      const closeBtn = dialog.querySelector(".dialog-close-x, .btn-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => dialog.close());
      }
    });

    // Profile Trigger
    const profileBtn = document.getElementById("btn-profile");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        const dialog = document.getElementById("profile-dialog");
        this._syncProfileForm();
        if (dialog) dialog.showModal();
      });
    }

    // Save Profile
    const saveProfileBtn = document.getElementById("btn-save-profile");
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener("click", () => {
        this._saveProfileForm();
        document.getElementById("profile-dialog")?.close();
        Toast.show("Profil gespeichert", "success");
      });
    }
  }

  _initCarousel() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    }, {
      root: document.getElementById("paper-viewport"),
      threshold: 0.6
    });

    document.querySelectorAll("din-A4").forEach(page => observer.observe(page));

    const paper = document.getElementById("paper");
    if (paper) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === "DIN-A4") observer.observe(node);
          });
        });
      });
      mutationObserver.observe(paper, { childList: true });
    }
  }

  _syncProfileForm() {
    const profile = this.sm.state.profile;
    Object.entries(profile).forEach(([key, val]) => {
      const input = document.getElementById(`field-${key}`);
      if (input) input.value = val || "";
    });
  }

  _saveProfileForm() {
    const profile = {};
    const inputs = document.querySelectorAll("#profile-dialog input");
    inputs.forEach((input) => {
      const key = input.id.replace("field-", "");
      profile[key] = input.value;
    });
    this.sm.update("profile", profile, "user");
    this._syncAll();
  }

  _onStateChange(path, val, scope) {
    if (scope === "config") this._syncAll();
    if (path === "content.text") this.pages.checkFlow();
    this._updateSalutation();
  }

  _syncAll() {
    Logic.IMR.forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) {
        if (!["din-anrede", "din-grussformel"].includes(entry.tag) || this.sm.state.content[entry.key]) {
          el.textContent = this.sm.state.content[entry.key] || "";
        }
        if (entry.tag === "din-text") {
          this.pages.checkFlow();
        }
      }
    });
  }

  _updateSalutation() {
    const { firstName, lastName, company, type, formality } = this.sm.state.profile;
    const greeting = SalutationEngine.derive({ firstName, lastName, company, type, formality });
    const closing = SalutationEngine.getClosing(formality);

    const anredeEl = document.querySelector("din-anrede");
    if (anredeEl) anredeEl.setAttribute("data-salutation", greeting);

    const grussEl = document.querySelector("din-grussformel");
    if (grussEl) grussEl.setAttribute("data-greeting", closing);
  }

  _updateMirror(text, targetEl = null) {
    const mirror = targetEl || document.querySelector("din-text-spiegel");
    if (!mirror) return;
    const html = Logic.parseMarkdown(text);
    if (mirror.setHTML) {
      mirror.setHTML(html);
    } else {
      mirror.innerHTML = html;
    }
  }
}
</content>
</file>

<file path="v4_HANDBOOK.md">
<metadata>Lines: 993 | Size: 36981 B</metadata>
<content>
# ðŸ“œ DIN-BriefNEO v4.0 MASTER HANDBOOK

# Status: LIVING DOCUMENT | Version: 4.0.0

# Authority: Lead Architect (Gemini CLI)

> **DOKTRIN-NOTIZ**: Dieses Handbuch ist die ultimative Single Source of Truth (SSoT). Es ist absichtlich _nicht_ zusammengefasst, sondern dient als kumulative Instanz aller aktiven Architektur-Entscheidungen (ADR), Spezifikationen und Mandate.

---

# ==========================================================================

# TEIL 1: CORE ARCHITECTURE & MANDATES

# ==========================================================================

## ðŸ„ Dokument: CONSTITUTION.md (Quelle: .brain)

---

id: BRAIN-001-CONST
title: "Architecture Specification (SSoT)"
version: 4.0.0
status: "verified"
compliance: "v4.0-Stable"
authority: "Lead Architect"
last_audit: 2026-03-28
tags:

- architecture
- ssot
- mission-critical
  related:
- "[[CORE_SPEC]]"
- "[[ANTI_PATTERN]]"
  aliases:
- "Architecture Protocol"

---

# Architecture Specification (SSoT)

## I. CORE ARCHITECTURAL PRINCIPLES

### §1 Technological Hierarchy (Structural Layering)

Each feature MUST be implemented at the lowest possible layer:

1. **Native HTML** (Structure, Semantics, Popover API, Invokers)
2. **Native CSS** (Layout @layer, 0.001mm-precision, OKLCH colors, contrast-color())
3. **Vanilla JavaScript** (IMR Registry, EditContext, Persistence, Logic)
4. **Public APIs** (Fault-tolerant external services — optional only)

### §2 Zero-Width Marker Strategy (WYSIWYG)

The physical 1:1 print preview is the primary constraint.

- Markdown control characters (`*`, `_`) visible in the editor MUST NOT affect text flow width.
- Execution: `.md-marker { display: inline-block; width: 0; overflow: visible; }`

### §3 Structural Zoning (IMR 4.0)

The document consists of 19 atomic fields defined in the `Isomorphic Master Registry`.

- **Category A (Atoms):** Single-line, `plaintext-only` fields (e.g., `<din-absender-vorname>`).
- **Category B (Flow):** The `<din-text>` element with EditContext support.

### §4 Chrome Baseline (147+)

- No polyfills. No `@supports` guards for core APIs (Anchor Positioning, Sanitizer, Temporal).
- The system evolves synchronously with the Blink engine.

## II. VISUAL STABILITY REQUIREMENT

Zero layout shift after initialization. Every pixel is deterministic.

## III. UNIFIED DATA STATE

The JSON data model is the single source of truth (SSoT). HTML is strictly the presentation layer.

---

## ðŸ„ Dokument: CORE_SPEC.md (Quelle: .brain)

---

id: BRAIN-002-SPEC
title: "Core Specification (IMR 4.0)"
version: 4.0.0
status: "active"
geometry: "DIN 5008:2020-03"
last_audit: 2026-03-28
tags:

- specification
- din-5008
- imr-4-0
  related:
- "[[CONSTITUTION]]"
- "[[ANTI_PATTERN]]"

---

# Core Specification (IMR 4.0)

## 1. ATOMIC CUSTOM ELEMENTS

The system implements a 19-atom model using native Custom Elements.

- **Header Atoms:** `din-absender-vorname`, `din-absender-nachname`, `din-absender-strasse`, `din-absender-ort`.
- **Recipient Atoms:** `din-empfaenger-firma`, `din-empfaenger-name`, `din-empfaenger-strasse`, `din-empfaenger-ort`.
- **Logic Atoms:** `din-text` (Source), `din-text-mirror` (View).
- **Behavior:** All atoms implement `contenteditable="plaintext-only"` and are bound via `EditContext API`.

## 2. TEMPORAL ENGINE

- **Capture:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`.
- **Target:** `<din-date>` (Standalone at 50mm Y / 125mm X).

## 3. PHYSICAL GEOMETRY (SSoT)

- **Form A (Small Header):** 27mm top offset for address zone.
- **Form B (Standard Header):** 45mm top offset for address zone.
- **Enforcement:** Zero-JS layout. Logic resides entirely in `app-ui.css` @layer geometry.

---

## ðŸ„ Dokument: ANTI_PATTERN.md (Quelle: .brain)

---

id: BRAIN-003-APR
title: "Anti-Pattern Registry (Banned & Deprecated)"
status: "verified"
enforcement: "AUTOMATED VALIDATION (PVP)"
last_audit: 2026-03-28
tags:

- anti-pattern
- technical-debt
- constraints
  related:
- "[[CONSTITUTION]]"
- "[[CORE_SPEC]]"

---

# Anti-Pattern Registry (Banned Patterns)

## 1. PERSISTENCE & STATE (DEP-P)

- **DEP-P001:** `localStorage` for high-volume data (Use OPFS/Batch instead).
- **DEP-P002:** External cloud sync for draft state (Violation of Local-First architecture).
- **DEP-P003:** `JSON.stringify()` on primary input thread (Performance regression).
- **DEP-P004:** Hard-coded state keys (e.g., `signatureName`). Use IMR 4.0 keys (`signature`).

## 2. LAYOUT & STRUCTURE (DEP-L)

- **DEP-L001:** `innerHTML` for user content (Security risk: XSS).
- **DEP-L002:** `contenteditable="true"` (Use `plaintext-only` or `EditContext`).
- **DEP-L003:** `execCommand` (Deprecated legacy API).
- **DEP-L004:** External CSS frameworks (Tailwind/Bootstrap).
- **DEP-L005:** `popovertarget` attribute in HTML (Use ID-based listeners in UIController for stability).
- **DEP-L006:** Inline `onchange` or `onclick` handlers in HTML.

## 3. LOGIC & APIS (DEP-C)

- **DEP-C001:** Legacy `Date` object (Use `Temporal API`). Exceptions: `parseDate` input handling.
- **DEP-C002:** Server-side dependencies for core logic (Client-Side-Only requirement).
- **DEP-C003:** External utility libraries (Moment.js, jspdf).
- **DEP-C004:** `setTimeout` for state debouncing (Use `requestIdleCallback`).

## 4. STYLING (DEP-S)

- **DEP-S001:** Hex colors (`#ffffff`) or `rgba()` in CSS. Use `oklch()`.
- **DEP-S002:** Hard-coded Hover colors. Use **Relative Color Syntax (RCS)**.
- **DEP-S003:** Scrollbars in DIN-A4 container. Use `field-sizing: content` and `overflow: hidden`.
- **DEP-S004:** `@supports` guards for Baseline features (Chrome 147+ is the floor).

## 5. TOOLING (DEP-T)

- **DEP-T001:** Context-fragmenting tools (`head`/`tail`).
- **DEP-T002:** Environment-specific stream syntax (`cat <<EOF`).
- **DEP-T003:** Manual file versioning via filename (`_v1.0.md`). Use Git.

---

# ==========================================================================

# TEIL 2: LIVING SPECIFICATIONS (Active Modules)

# ==========================================================================

## ðŸ„ Dokument: specify.md (Quelle: 059-persistence-pwa)

---

id: SPEC-059
title: Persistence & Desktop PWA Readiness
tags: [persistence, pwa, auto-save]
status: cemented
version: 1.0.0
traceability: [MANDATE-NAT, USER-SOUVEREIGNTY]

---

# Specify: Persistence & Desktop PWA (WHAT)

## 1. Zielsetzung

Maximale Datensicherheit durch intelligente Hintergrund-Speicherung und Transformation der Web-Oberfläche in eine installierbare Desktop-Anwendung (PWA).

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Denkpausen-Speicherung (Smart Auto-Save)

- Das System MUSS den aktuellen Schreibfortschritt automatisch persistieren.
- Der Speicherprozess DARF NICHT den Schreibfluss stören (keine Latenz).
- Die Speicherung erfolgt ereignisbasiert: Entweder bei Fokusverlust oder nach einer definierten Untätigkeit während des Tippens (Denkpause).

### FR-002: Desktop App Experience (Installability)

- Die Anwendung MUSS als eigenständige Desktop-App installierbar sein.
- Beim Start als App DARF KEINE Browser-UI (Adresszeile, Tabs) sichtbar sein.
- Die App MUSS offline-fähig sein (Basis-Ressourcen gecached).

## 3. Erfolgskriterien

- **SC-001**: Nach einem Browser-Absturz sind maximal die letzten 2 Sekunden der Eingabe verloren.
- **SC-002**: Ein "Installieren" Button erscheint in der Browser-Leiste.
- **SC-003**: Die App startet im Vollbild/Standalone-Modus.

---

## ðŸ„ Dokument: specify.md (Quelle: 058-native-sanitizer)

---

id: SPEC-058
title: Startup Performance & UI Polish
tags: [performance, ux, polish]
status: cemented
version: 1.0.0
traceability: [ANTI-FOUC, UX-FEEDBACK]

---

# Specify: Startup Performance & UI Polish (WHAT)

## 1. Zielsetzung

Die Anwendung muss sofort einsatzbereit wirken. Es darf kein visuelles Flackern beim Laden geben (Flicker of Unstyled Content). Das Feedback an den Nutzer (Toasts, Status) muss hochwertig und dezent wirken.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Instant Layout Restoration (ANTI-FOUC)

- Die gewählte Layout-Variante (Form A/B) MUSS vom Browser geladen sein, bevor das erste Element auf den Bildschirm gezeichnet wird.
- Ziel: Zero-Jank beim initialen Seitenaufruf.

### FR-002: Hochwertige Benachrichtigungen (Toasts)

- Rückmeldungen des Systems MÜSSEN flüssig eingeblendet werden.
- Die Art der Meldung (Erfolg, Warnung, Fehler) MUSS visuell sofort unterscheidbar sein.

### FR-003: Subtile Status-Anzeige

- Der Systemstatus MUSS präsent, aber nicht störend sein.
- Die Anzeige soll modern wirken (Transparenz, Blur).

## 3. Erfolgskriterien

- **SC-001**: Kein sichtbarer Sprung der Brief-Elemente beim Laden.
- **SC-002**: Toasts erscheinen mit einer gleitenden Animation.
- **SC-003**: Die Anwendung fühlt sich "fest" und "wertig" an.

---

## ðŸ„ Dokument: specify.md (Quelle: 061-v4.0-pipeline)

---

id: SPEC-061
title: v4.0 Validation Pipeline (PVP)
tags: [Validation, Security, Integrity, SDD]
status: cemented
version: 1.0.0
traceability: [MANDATE-INJ, MANDATE-NAT, MANDATE-PLN, MANDATE-FREEZE]
source: DIN-BriefNEO Constitution v16.0.1
depends-on: [SPEC-007, SPEC-051]
required-by: []

---

# SPEC-061: v4.0 Validation Pipeline (PVP)

## 1. Zielsetzung

Die v4.0 Validation Pipeline (PVP) ist das "High-Integrity" Sicherheitsnetz des Projekts. Sie stellt sicher, dass kein Agent (KI oder Mensch) die obersten Mandate des Projekts unbemerkt verletzt. Sie automatisiert die Einhaltung der Architektur-Integrität und eliminiert Agenten-Halluzinationen durch SSoT-basierte Kataloge.

## 2. Kern-Komponenten

### 2.1 IMR Component Catalog (Agent Guidance)

- **Anforderung**: Ein Tool muss existieren, das die `Isomorphic Master Registry (IMR)` aus der SSoT (`js/constants.js`) in ein maschinenlesbares JSON-Format extrahiert.
- **Zweck**: Agenten nutzen diesen Katalog, um exakte Tag-Namen (z.B. `din-date`) statt Halluzinationen (z.B. `din-datum`) zu verwenden.
- **Datenfelder**: Tag, JSON-Key, CMA-Koordinate (sofern vorhanden).

### 2.2 Automated Mandate Enforcement (Aviation Check)

Die Pipeline muss nach jeder Änderung folgende Prüfungen automatisiert durchführen:

#### A. Security Check (MANDATE-INJ)

- **Regel**: `innerHTML` Zuweisungen sind verboten.
- **Toleranz**: 0 Verstöße erlaubt in `js/`.
- **Ausnahme**: Nur in spezifisch markierten Render-Engines (z.B. Ghost-Mirror Renderer), sofern dort eine Sanitization stattfindet.

#### B. Native Check (MANDATE-NAT)

- **Regel**: Keine externen NPM-Imports oder CDN-Links, die nicht explizit in der Architektur freigegeben sind.
- **Zweck**: Erhalt der Abhängigkeitsfreiheit und Browser-Nativität.

#### C. Integrity Check (MANDATE-PLN)

- **Regel**: Alle `<din-*>` Elemente im HTML müssen das Attribut `contenteditable="plaintext-only"` tragen.
- **Ausnahme**: Keine. Selbst der Body nutzt `plaintext-only` (Visualisierung via Mirror).

#### D. Visual Freeze Check (MANDATE-FREEZE)

- **Regel**: Änderungen an CSS-Layer `din.core` sind kritisch zu prüfen.
- **Zweck**: Verhindern von Pixel-Shift in der DIN-Geometrie.

## 3. Akzeptanz-Kriterien

- [ ] Ein Aufruf von `scripts/get-catalog.mjs` liefert das aktuelle IMR-Schema als JSON.
- [ ] `scripts/post-session-verify.ps1` meldet Fehler, wenn `innerHTML` im Code gefunden wird.
- [ ] `scripts/post-session-verify.ps1` meldet Fehler, wenn ein `<din-*>` Tag ohne `plaintext-only` Attribut existiert.
- [ ] Die Pipeline ist in den Spec-kit Workflow (Phase: Implement/Verify) integriert.

## 4. Erfolgskriterien

- **Halluzinations-Rate**: 0% bei IMR-Tags.
- **Security-Regression**: 100% Erkennung von `innerHTML`-Injektionen.
- **Konformität**: 100% Abdeckung der Mandate in automatisierten Checks.

---

## ðŸ„ Dokument: specify.md (Quelle: 069-highlight)

---

id: SPEC-069
title: Native Highlight Editor — Paint-Time WYSIWYG
tags: [chrome-147, highlight-api, edit-context]
status: cemented
version: 1.0.0
traceability: [ADR-012, MANDATE-PLN]
source: v4.0 Audit 2026

---

# SPEC-069: Native Highlight Editor

## I. Zielsetzung (High-Integrity)

Ermöglichung von WYSIWYG-Formatierungen (Fett, Kursiv), ohne die Plaintext-Integrität des DOM zu verletzen. Die Formatierung wird vollständig von der Datenstruktur entkoppelt.

## II. Fachliche Anforderungen (WHAT)

### FR-001: Zero-Tag-Integrität

Der Briefinhalt (`body`) muss zu jedem Zeitpunkt als reiner Plaintext ohne HTML-Tags vorliegen. Ein `innerHTML`-Abruf muss identisch mit dem `textContent` sein.

### FR-002: Koordinaten-basierte Formatierung

Formatierungen werden über Start- und End-Indizes (Offsets) definiert.
Beispiel: `Text: "Hallo Welt"`, `Format: {type: 'bold', start: 0, end: 5}` -> "Hallo" erscheint fett.

### FR-003: Persistenz der Format-Matrix

Die Highlighting-Koordinaten müssen im Dokument-State gespeichert werden, um beim Neuladen wiederhergestellt zu werden.

### FR-004: Native Input-Souveränität

Die Eingabe erfolgt über die **EditContext API**. Das DOM-Element dient nur als Projektionsfläche für die Highlighting-Engine.

## III. Akzeptanzkriterien

1. `Strg+B` markiert den selektierten Text visuell fett, fügt aber KEINE `<b>` oder `<strong>` Tags in das DOM ein.
2. Ein Export des Briefes als JSON enthält das Feld `body` als sauberen String ohne Steuerzeichen.
3. Die Highlighting-Ebene bleibt bei Scroll-Bewegungen und Fenster-Resizing mathematisch deckungsgleich mit dem Text.
4. Das Kopieren von formatiertem Text aus dem Editor resultiert in sauberem Plaintext in der Zwischenablage (Integritäts-Schutz).

## IV. Definition of Done

- [ ] Keine `<b>`, `<i>` oder `<span>` Tags im `<din-text>`.
- [ ] CSS `::highlight()` steuert die gesamte Optik.
- [ ] EditContext fängt alle OS-Eingaben ab.

---

## ðŸ„ Dokument: specify.md (Quelle: 066-markdown-ghosting)

---

id: SPEC-066
title: Markdown-Shredder V2 — Zero-Width Ghosting
tags: [v4.0-2026, wysiwyg, integrity, css]
status: draft
version: 1.0.0
traceability: [ADR-008, ADR-011, MANDATE-FREEZE]
source: v4.0 Architecture Review 2026

---

# SPEC-066: Markdown-Shredder V2 (Zero-Width Ghosting)

## I. Zielsetzung (High-Integrity)

Gewährleistung einer 100%igen Übereinstimmung der Zeilenumbrüche zwischen dem Editor (Ghost-Mirror) und dem fertigen Dokument (Print/PDF). Dies wird durch die Erhaltung aller Markdown-Steuerzeichen im Mirror erreicht, wobei diese für die Layout-Engine "gewichtslos" (Breite = 0) gemacht werden.

## II. Fachliche Anforderungen (WHAT)

### FR-001: Non-Destructive Transformation

Der Parser darf Steuerzeichen (\*, \*\*, ~~, \_, >) nicht löschen. Er muss sie in ein schützendes Element (`<span class="md-marker">`) einwickeln, das die visuelle Formatierung (z.B. `<strong>`) umschließt oder flankiert.

### FR-002: Zero-Width Rendering

Die Marker-Elemente müssen für den Browser-Line-Breaker unsichtbar sein.

- Breite: 0px (zwingend)
- Überlauf: sichtbar (für menschliche Lesbarkeit)
- Interaktion: `pointer-events: none` und `user-select: none`

### FR-003: Kerning-Präzision

Um optisches "Kleben" von Markern an Wörtern zu verhindern, muss ein negativer Margin-Korrektor angewendet werden, der die physische Zeichenbreite im Editor neutralisiert.

### FR-004: EditContext-Offset-Parität

Die Anzahl der logischen Zeichen im `EditContext` muss exakt mit der Anzahl der sichtbaren (inkl. Ghosting) Zeichen im Mirror korrespondieren. HTML-Tags werden hierbei als Metadaten behandelt und dürfen die Selektions-Logik nicht verschieben.

### FR-005: EditContext Input-Capture

Der Input-Ghost (EditContext) muss alle OS-Eingabemethoden (Virtual Keyboard, Handschrift, Spracheingabe) abfangen, ohne dass ein physisches DOM-Element für die Datenhaltung existiert. Das DOM dient nur noch als 'Viewport' für den Mirror.

### FR-006: Atomic Character Bounds

Für die exakte Toolbar-Positionierung muss der EditContext die 'Character Bounds' des Mirrors kennen, damit das Anchor Positioning mathematisch korrekt auf den gerenderten Text (nicht auf den Plaintext) zeigt.

## III. Akzeptanzkriterien

1. Ein Wort, das im Editor mit `**fett**` markiert ist, bricht an exakt derselben Stelle um wie das Wort `fett` im Druck-Modus (wo die Marker ausgeblendet sind).
2. Die `Sanitizer API` lässt die `.md-marker`-Spans ohne Datenverlust passieren.
3. EditContext Events (`textupdate`) triggern die Mirror-Synchronisation verzögerungsfrei (< 16ms).
4. `contenteditable="plaintext-only"` wird durch das EditContext-Objekt als primäre Eingabemethode abgelöst.

## V. RegEx Priority Cascade (Cascading Priority Parsing)

Um Überlappungen zu vermeiden, muss die Transformation in folgender Reihenfolge erfolgen:

1. **Triple-Markers (Fett-Kursiv)**: `/(\*\*\*|___)(.*?)\1/g`
   → `<strong class="md-bold"><em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em></strong>`
2. **Double-Markers (Fett / Strike)**:
   - Fett: `/(\*\*|__)(.*?)\1/g` → `<strong class="md-bold"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></strong>`
   - Durchgestrichen: `/(~~)(.*?)\1/g` → `<del class="md-del"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></del>`
3. **Single-Markers (Kursiv / Code)**:
   - Kursiv: `/(\*|_)(.*?)\1/g` → `<em class="md-italic"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></em>`
   - Inline-Code: /(`)(.*?)\1/g → `<code class="md-code"><span class="md-marker">$1</span>$2<span class="md-marker">$1</span></code>`

## VI. Mathematischer Offset-Beweis (WYSIWYG-Parität)

- **Input (EditContext)**: `**Hallo**` (Length: 9)
- **Output (Mirror HTML)**: `<strong><span>**</span>Hallo<span>**</span></strong>`
- **Mirror textContent**: `**Hallo**` (Length: 9)
- **Ergebnis**: Parität = 100%. Der Cursor-Offset im `EditContext` entspricht exakt der Zeichenposition im Mirror, da der Browser HTML-Tags bei der `textContent`-Länge ignoriert.

## VII. Erweitertes Sanitizer-Gatekeeping

`v4.0_SANITIZER_CONFIG` muss `span` und die spezifischen `md-*` Klassen erlauben:

~~~javascript
const v4.0_SANITIZER_CONFIG = {
  allowElements: ['strong', 'em', 'del', 'code', 'span', 'p', 'br', 'blockquote', 'li', 'ul', 'ol'],
  allowAttributes: {
    'class': ['md-marker', 'md-bold', 'md-italic', 'md-del', 'md-code']
  }
};
~~~

---

## ðŸ„ Dokument: specify.md (Quelle: 057-dom-first-integrity)

---

id: SPEC-057
title: DOM-First Integrity & Anchor Positioning
tags: [chrome-147, anchor-positioning, zero-js]
status: active
version: 1.0.0
traceability: [MANDATE-NAT, ANTI-026]

---

# Specify: DOM-First Integrity (WHAT)

## 1. Zielsetzung

JavaScript soll vollständig von der Live-Synchronisation der Benutzereingaben entbunden werden. Das Dokument im Browser-Fenster (DOM) ist die einzige Quelle der Wahrheit während der Bearbeitung.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Passives State-Management

- Das System DARF NICHT bei jedem Tastendruck Daten in den JavaScript-Speicher spiegeln.
- Die Persistierung (LocalStorage) erfolgt nur noch ereignisbasiert (z.B. bei Fokusverlust oder in Intervallen), indem das DOM direkt gelesen wird.

### FR-002: Kontextsensitive Werkzeuge (Anchor Positioning)

- Die Toolbar für Formatierungen MUSS sich physisch an dem Feld ausrichten, das gerade bearbeitet wird.
- Diese Ausrichtung MUSS flüssig und ohne JavaScript-Berechnungen erfolgen.

### FR-003: Unlöschbare Feld-Identitäten

- Strukturelle Elemente des Briefes (wie das Wort "Datum" im Infoblock) MÜSSEN für den Nutzer unlöschbar sein.
- Diese Elemente dürfen nicht Teil des editierbaren Textes sein.

## 3. Erfolgskriterien

- **SC-001**: Die Performance des Tippens ist identisch mit einer statischen HTML-Seite.
- **SC-002**: Die Toolbar "springt" oder "gleitet" nativ zum fokussierten Feld.
- **SC-003**: Ein "Alles löschen" im Feld darf die Beschriftung (z.B. "Datum") nicht entfernen.

---

## ðŸ„ Dokument: specify.md (Quelle: 007-cma)

---

id: SPEC-007
title: Central Measurement Authority (CMA)
tags: [cma, din-5008, ssot]
status: cemented
weight: 100
criticality: CRITICAL
created: 2026-03-20
updated: 2026-03-20
version: 2.0.0
traceability: [DIN-SYS-CMA]
source: DIN 5008:2020-03, MehrCurry/briefversand (triple-validated)
depends-on: []
required-by: [SPEC-001, SPEC-003, SPEC-006, SPEC-027, SPEC-042]

---

# Specify: Central Measurement Authority (CMA)

## Fachbeschreibung: Warum eine "Wahrheitstabelle"?

Ein DIN 5008-Brief hat ~15 physikalische Zonen, jede mit exakt definierten
Millimeter-Koordinaten. Ohne zentrales Masssystem passiert folgendes:

- Der Entwickler schreibt `top: 97mm` direkt in das CSS einer Komponente.
- Eine andere Komponente nutzt `top: 97.5mm` — 0.5mm Drift.
- Im Druck: Adresse und Informationsblock ueberlappen im DL-Umschlag.

Die CMA verhindert das durch eine **Single Source of Truth (SSoT)**:
Jedes Mass existiert exakt einmal. Alle anderen Systemteile referenzieren
diese eine Quelle — niemals eigene Werte.

---

## Fachliche Anforderungen (WHAT — keine Technik)

### Datentabelle: Kanonische DIN 5008-Masse (High-Integrity)

| ID    | Konstante       | Mass    | Einheit | Quelle         | Form |
| ----- | --------------- | ------- | ------- | -------------- | ---- |
| M-001 | PAGE_WIDTH      | 210.000 | mm      | DIN 5008 §3    | A+B  |
| M-002 | PAGE_HEIGHT     | 297.000 | mm      | DIN 5008 §3    | A+B  |
| M-003 | MARGIN_LEFT     | 25.000  | mm      | DIN 5008 §4.1  | A+B  |
| M-004 | SENDER_ZONE_TOP | 27.000  | mm      | DIN 5008 §6.1  | A+B  |
| M-005 | ADDRESS_TOP_A   | 27.000  | mm      | DIN 5008 §6.1a | A    |
| M-006 | ADDRESS_TOP_B   | 45.000  | mm      | DIN 5008 §6.1b | B    |
| M-007 | ADDRESS_WIDTH   | 85.000  | mm      | DIN 5008 §5.2  | A+B  |
| M-008 | ADDRESS_HEIGHT  | 45.000  | mm      | DIN 5008 §5.2  | A+B  |
| M-009 | INFO_BLOCK_TOP  | 97.400  | mm      | MehrCurry (✓)  | A+B  |
| M-010 | SUBJECT_TOP     | 103.400 | mm      | MehrCurry (✓)  | A+B  |
| M-011 | FOLD_MARK_1     | 105.000 | mm      | DIN 5008 §7    | A+B  |
| M-012 | PUNCH_MARK      | 148.500 | mm      | DIN 5008 §7    | A+B  |
| M-013 | FOLD_MARK_2     | 210.000 | mm      | DIN 5008 §7    | A+B  |
| M-014 | FOOTER_TOP      | 269.000 | mm      | MehrCurry (✓)  | A+B  |
| M-015 | MARGIN_RIGHT    | 20.000  | mm      | DIN 5008 §4.2  | A+B  |

### Funktionale Anforderungen

| ID     | Anforderung                                                                                    |
| ------ | ---------------------------------------------------------------------------------------------- |
| FR-001 | Die CMA MUSS alle physikalischen Masse an exakt einer Stelle im System definieren              |
| FR-002 | Masse MUESSEN in Millimetern (mm), typografische Werte in Punkt (pt) vorliegen                 |
| FR-003 | Alle Systemteile (Layout, Druck, Hilfslinien, Berechnungen) MUESSEN Werte aus CMA nutzen       |
| FR-004 | Die CMA MUSS Form A und Form B als separate, benannte Werte unterscheiden                      |
| FR-005 | Das System MUSS das Vorhandensein von "Magic Numbers" ausserhalb der CMA verhindern            |
| FR-006 | Praezision MUSS mindestens 3 Dezimalstellen betragen (0.001mm Aufloesung)                      |
| FR-007 | Widerspruechliche Masse MUESSEN im `.brain/07_measurement_conflict_log.md` dokumentiert werden |
| FR-008 | Jedes Mass MUSS eine Traceability-Referenz (Quelle) besitzen                                   |

### Toleranzgrenzen (High-Integrity)

| Metrik                           | Grenzwert | Rationale                     |
| -------------------------------- | --------- | ----------------------------- |
| Visuelle Abweichung (Screen)     | < 0.5mm   | DL-Umschlag-Toleranz          |
| Druck-Abweichung (PDF)           | < 0.1mm   | Professioneller Druckstandard |
| Rundungsfehler bei Konvertierung | < 0.001mm | 3-Dezimalstellen-Pflicht      |

### Warum duerfen Zonen ihre Masse nicht selbst definieren?

Dies ist ein **fachliches Prinzip**, kein technisches. Eine Zone wie
"Informationsblock" ist fachlich **kein unabhaengiges Objekt** — sie ist
eine **Referenz** auf einen DIN-definierten Bereich des Briefs. Wuerde
die Zone ihr eigenes Mass kennen, entstuende eine zweite "Wahrheit".
Zwei Wahrheiten fuer dasselbe Mass sind strukturell identisch mit einem Fehler.

### Erfolgskriterien

| ID     | Kriterium                                                          | Messung                |
| ------ | ------------------------------------------------------------------ | ---------------------- |
| SC-001 | Single-Point-of-Change: Eine Aenderung in der CMA wirkt systemweit | Integrationstest       |
| SC-002 | Zero Redundancy: Kein Mass ist doppelt definiert                   | Statische Code-Analyse |
| SC-003 | Full Traceability: Jedes Mass hat eine Quellenangabe               | Code-Review            |
| SC-004 | Precision: Alle Werte auf >= 3 Dezimalstellen gespeichert          | Unit-Test              |

---

## ðŸ„ Dokument: specify.md (Quelle: 002-salutation-engine)

---

id: SPEC-002
title: Salutation Engine & Gender Parsing
tags: [salutation, logic, automation, din-5008, html-hybrid]
status: active
weight: 100
criticality: HIGH
created: 2026-03-19
updated: 2026-03-20
version: 2.0.0
traceability: [DIN-LOGIC-SALUT]
source: DIN 5008:2020-03, DIN 5008 Etikette-Addendum
depends-on: [SPEC-007]
required-by: [SPEC-013, SPEC-022]

---

# Specify: Salutation Engine & Gender Parsing

## Fachbeschreibung

Ein DIN 5008-konformer Brief erfordert eine praezise, normgerechte Anrede.
Das System erkennt aus der Empfaengereingabe das Geschlecht (Praefix) und
generiert automatisch die korrekte Anrede. Manuelle Ueberschreibungen durch
den Nutzer sind immer moeglich und dauerhaft (USER-001 Nutzersouveraenitaet).

---

## Fachliche Anforderungen (WHAT)

### FR-001: Schluesselwort-Erkennung

Das System MUSS das Empfaengerfeld nach diesen Praefixen scannen:

- `Herr` / `Herrn` → Maennlich (m)
- `Frau` → Weiblich (f)
- `Familie` / `Eheleute` → Familie (fam)
- Kein Praefix erkannt → Neutral (n)

### FR-002: Titel-Erkennung

Das System MUSS akademische Titel extrahieren und in der Anrede behalten:

- `Dr.`, `Prof.`, `Prof. Dr.`, `Dipl.-Ing.`, `Mag.`

### FR-003: Nachnamen-Extraktion

Das System MUSS den Nachnamen korrekt isolieren (letztes Wort nach Praefix + Titel).

### FR-004: Manual Override Protection (USER-001)

Sobald ein Nutzer das Anredefeld manuell editiert, MUSS die Automatik
deaktiviert werden. Kennzeichnung via `data-auto="false"` am Feld-Element.
Eine erneute Automatik ist nur nach explizitem Zuruecksetzen aktiv.

### FR-005: Frmlichkeitsstufen (3 Stufen)

Das System MUSS drei Stufen unterstuetzen:

- `formal`: "Sehr geehrter Herr / Sehr geehrte Frau / Sehr geehrte Damen und Herren,"
- `polite`: "Guten Tag, Herr / Guten Tag, Frau / Guten Tag,"
- `casual`: "Hallo [Vorname] / Hallo zusammen,"

### FR-006: Signatur-Zustze

Das System MUSS Vertretungs-Zustze unterhalb der Unterschrift anbieten:

- `i. A.` (im Auftrag), `i. V.` (in Vollmacht), `ppa.` (Prokura)

### FR-007: Branchen-Grussformeln

Das System MUSS branchenspezifische Grussformeln als Snippets anbieten
(z.B. "Mit sportlichem Gruss", "Glueck auf!", "Mit kollegialen Gruessen").

### FR-008: Punktuation Guard (DIN 5008)

- Kein Komma am Ende der Grussformel (deutsches DIN-Standard).
- Kein Punkt am Ende der Grussformel.
- Beide Faelle MUESSEN als Warnung markiert werden (aria-invalid="true").

### FR-009: 3-Leerzeilen-Regel

Zwischen Grussformel und maschinenschriftlichem Namen MUSS ein Platz von
exakt 3 Leerzeilen (ca. 12.7mm) fuer die handschriftliche Unterschrift
reserviert werden. Dieser Abstand ist ein DIN-Pflichtmass (Aufnahme in CMA).

### Anrede-Matrix (normativ)

| Formality | Gender m                          | Gender f                         | Gender n                      | Gender fam                  |
| --------- | --------------------------------- | -------------------------------- | ----------------------------- | --------------------------- |
| formal    | Sehr geehrter Herr [Titel] [Name] | Sehr geehrte Frau [Titel] [Name] | Sehr geehrte Damen und Herren | Sehr geehrte Familie [Name] |
| polite    | Guten Tag, Herr [Name]            | Guten Tag, Frau [Name]           | Guten Tag                     | Guten Tag, Familie [Name]   |
| casual    | Hallo [Vorname]                   | Hallo [Vorname]                  | Hallo zusammen                | Hallo Familie [Name]        |

---

## Erfolgskriterien

| ID     | Kriterium                                                             | Messung          |
| ------ | --------------------------------------------------------------------- | ---------------- |
| SC-001 | Erkennung in >= 95% der Standardfaelle korrekt                        | Unit-Test        |
| SC-002 | Manuelle Korrekturen bleiben nach Neurendering erhalten               | Integrationstest |
| SC-003 | Komma/Punkt am Ende der Grussformel → Warnung sichtbar (aria-invalid) | UI-Test          |
| SC-004 | 3-Leerzeilen-Abstand vor Unterschrift exakt 12.7mm                    | Drucktest        |

---

## ðŸ„ Dokument: specify.md (Quelle: 029-page-breaks)

---

id: SPEC-029
title: Multi-Page Pagination & Hybrid Height
tags: [print, pagination]
status: cemented
version: 2.0.0
traceability: [DIN-5008-PRINT]

---

# Specify: Multi-Page Pagination (WHAT)

## 1. Zielsetzung

Das System muss in der Lage sein, Briefe zu verarbeiten, die länger als eine DIN-A4 Seite sind. Während auf dem Bildschirm die Immersion eines einzelnen Blattes gewahrt bleibt, muss der Ausdruck (PDF) den Textfluss über beliebig viele Seiten ermöglichen.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Hybrid-Height Mode

- **Screen-Mode**: Das Papier hat eine fixe Höhe von 297mm. Text, der darüber hinausgeht, wird visuell markiert (Overflow-Wächter), aber nicht gescrollt.
- **Print-Mode**: Das Papier wechselt auf eine variable Höhe (`height: auto`). Der Text fließt natürlich auf Folgeseiten.

### FR-002: Typografische Integrität auf Folgeseiten

- Seitenumbrüche MÜSSEN so gesteuert werden, dass keine "Hurenkinder" oder "Schusterjungen" entstehen (mind. 3 Zeilen pro Absatz auf einer Seite).
- Tabellen oder Listen dürfen nicht unkontrolliert zerrissen werden.

### FR-003: Folgeseiten-Header

- (Zukünftig): Folgeseiten sollten eine Seitenzahl ("Seite 2") enthalten.

## 3. Erfolgskriterien

- **SC-001**: Ein Brief mit 5000 Wörtern wird im Druck auf ca. 10 Seiten aufgeteilt.
- **SC-002**: Der Briefkopf (Absender, Empfänger) erscheint nur auf der ersten Seite.
- **SC-003**: Die Textschärfe bleibt vektorbasiert.

---

## ðŸ„ Dokument: specify.md (Quelle: 056-environment-integrity)

---

id: SPEC-056
title: Zero-JS Environment Integrity & Bare Metal UI
tags: [chrome-147, chrome-148, zero-js, spec-kit]
status: cemented
version: 4.0.0
traceability: [MANDATE-NAT, MANDATE-VEC, ADR-011]

---

# Specify: Zero-JS Environment Integrity (WHAT)

## 1. Problemstellung

Klassische Web-Apps nutzen JavaScript, um UI-Zustände (z.B. Layout-Wechsel) zu verwalten. Dies führt zu Redundanz, Latenz und "Pixel-Shock". Ziel ist die vollständige Delegation der UI-Logik an die Browser-Engine.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Autonomes State-Management

- Das DOM MUSS der einzige Zustandshalter (SSoT) für UI-Optionen sein.
- Die Auswahl eines Layouts oder das Einblenden von Hilfsmitteln MUSS rein über native HTML-Formular-Elemente (Radio/Checkbox) erfolgen.

### FR-002: Implizite Visuelle Rückmeldung

- Der Browser MUSS Zustandsänderungen eigenständig animieren.
- Es DARF KEINE explizite JavaScript-Anweisung für Animationen oder Übergänge nötig sein.

### FR-003: Isolierte Daten-Integrität (Data-IO)

- JavaScript darf NUR für die Verarbeitung von Briefinhalten (IMR) genutzt werden.
- Export, Import und Zurücksetzen sind funktionale Aktionen, die vom UI-Zustand entkoppelt sein müssen.

## 3. Erfolgskriterien

- **SC-001**: 100% Funktionalität der UI-Steuerung bei deaktiviertem JavaScript (sofern die Engine CSS-Variablen auflöst).
- **SC-002**: Null Pixel-Shift beim Layout-Wechsel durch native Engine-Interpolation.

---

## ðŸ„ Dokument: specify.md (Quelle: 051-content-integrity)

---

id: SPEC-051
title: Content Integrity & Ghost-Mirror System
tags: [integrity, markdown, ghost-mirror]
status: active
version: 1.0.0
traceability: [ADR-008, DIN-5008-TYPO]
source: GEMINI.md ADR-008
depends-on: [SPEC-007]

---

# Specify: Content Integrity & Ghost-Mirror System (WHAT)

## 1. Problemstellung

`contenteditable="true"` erlaubt Browsern, beim Einfügen (Paste) unkontrolliertes HTML in das Dokument zu schreiben. Dies führt zu "Datenvergiftung" (unsichtbare Styles, Skripte, Spans), die bei einem Export oder einer KI-Verarbeitung zu Fehlern führen.

## 2. Fachliche Anforderungen (WHAT)

### FR-001: Plaintext-Only Doctrine (ADR-008)

- Jedes Eingabefeld (<din-\*>) MUSS strukturell gegen HTML-Injection geschützt sein.
- Der Browser DARF KEIN HTML in diese Felder schreiben, auch nicht beim Paste oder Drag-and-Drop.
- Die einzige Datenquelle für den Export MUSS `textContent` sein.

### FR-002: Markdown-Support im Briefkörper

- Der Nutzer MUSS Formatierungen im Feld `<din-text>` mittels einfacher Markdown-Syntax vornehmen können:
  - `**fett**` -> <strong>
  - `*kursiv*` -> <em>
  - `~~durchgestrichen~~` -> <del>
  - `> Zitat` -> <blockquote>
  - `- Punkt` -> <ul>/<li>
  - `1. Punkt` -> <ol>/<li>
  - `\n\n` -> <br><br> (Absatz-Trennung)

### FR-003: Ghost-Mirror Visualisierung (UX)

- Da der Nutzer im Plaintext-Feld nur Symbole (\*_, _) sieht, MUSS eine visuelle Echtzeit-Vorschau (Mirror) existieren.
- Der Mirror MUSS exakt über dem Eingabefeld liegen, damit der optische Eindruck eines formatierten Briefes erhalten bleibt.
- Der Mirror DARF NICHT fokussierbar oder editierbar sein.
- Beim Tippen MUSS der Mirror ausgeblendet werden (Cursor-Fokus), in der Leseansicht (Blur) MUSS er eingeblendet werden.

### FR-004: Typografische Integrität (High-Integrity)

- Das System MUSS sicherstellen, dass Absätze nicht durch unschöne Seitenumbrüche zerrissen werden.
- Mindestens 3 Zeilen eines Absatzes MÜSSEN am Seitenende oder -anfang zusammengehalten werden (Widows/Orphans).
- URLs MÜSSEN im Druckmodus voll ausgeschrieben hinter dem Link-Text erscheinen.

## 3. Erfolgskriterien

- **SC-001**: Ein Paste von formatiertem Text aus MS Word in `<din-text>` resultiert in REINEM TEXT ohne HTML-Tags.
- **SC-002**: Die Markdown-Syntax `**Text**` wird im Mirror-Element visuell fett dargestellt.
- **SC-003**: Im PDF-Export (Druck) ist die Markdown-Syntax unsichtbar, nur die Formatierung (Fett/Kursiv) ist zu sehen.
- **SC-004**: Keine "einzelnen Zeilen" auf Folgeseiten bei langen Briefen.

---

# ==========================================================================

# TEIL 3: PLANS (Implementation Roadmaps & Checklists)

# ==========================================================================

## ðŸ„ Dokument: 06_validation_anchor_plan.md (Quelle: plans)

# PLAN: BLACK-BOX-DECODER (CSS ANCHOR POSITIONING) (v1.0.0)

# Spec: SPEC_VALIDATION_ANCHOR_v1.0.0

# Status: DRAFT | Doctrine: High-Integrity v4.0 | Stand: März 2026

## CONSTITUTION CHECK

| Gate          | Status | Notiz                                             |
| ------------- | ------ | ------------------------------------------------- |
| [MANDATE-INJ] | OK     | Nur textContent für Fehlermeldungen.              |
| [MANDATE-NAT] | OK     | Nutzung nativer CSS Anchor Positioning API.       |
| [MANDATE-PLN] | OK     | Keine Beeinträchtigung der plaintext-only Felder. |

## 1. CSS CORE ARCHITECTURE (din.core)

Wir definieren die Ankerpunkte für alle IMR-Felder.

~~~css
din-text {
  anchor-name: --anchor-body;
}
din-subject {
  anchor-name: --anchor-subject;
}
/* ... (weitere IMR Tags) */

#black-box-decoder {
  position: fixed;
  position-anchor: var(--active-anchor);
  top: anchor(bottom);
  left: anchor(left);
  position-visibility: anchors-visible;
  margin-top: 5mm;
  padding: 2mm 5mm;
  background: var(--pico-ins-color); /* Warnfarbe */
  color: white;
  border-radius: 4px;
  font-size: 10pt;
}
~~~

## 2. DYNAMISCHES TETHERING (UI Bridge)

Das JS setzt nur den Anker-Kontext, der Browser erledigt die Geometrie.

~~~javascript
// In UIController.js (_bindNativeEvents)
paper.addEventListener("focusin", (e) => {
  const tag = e.target.tagName.toLowerCase();
  if (tag.startsWith("din-")) {
    document.documentElement.style.setProperty(
      "--active-anchor",
      `--anchor-${tag.slice(4)}`,
    );
  }
});
~~~

## 3. VISIBILITY LOGIC (Pure CSS)

~~~css
#black-box-decoder {
  display: none;
}

/* Nur anzeigen, wenn das fokussierte Element ungültig ist */
:root:has(din-*:focus[data-invalid="true"]) #black-box-decoder {
  display: block;
}
~~~

## 4. STEPS (Implementation)

1. [ ] CSS-Anker in `css/din5008-paper.css` hinzufügen.
2. [ ] Popover-HTML in `index.html` einfügen.
3. [ ] `UIController.js` erweitern für `--active-anchor` Property.
4. [ ] `logic.js` erweitern (Validierungstrigger für `data-invalid`).

---

**GEZ. LEAD SYSTEMS ARCHITECT**
"Zero-Pixel-Shift Layout. Natively Tethered Error UI."

---

ror UI."

---
</content>
</file>

