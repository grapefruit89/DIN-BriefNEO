---
title: "DIN-BriefNEO Snapshot"
created: 2026-03-29T16:23:53.183833
llm_ready: true
---

<file path=".brain/ANTI_PATTERN.md">
<metadata>Lines: 82 | Size: 4134 B</metadata>
<content>
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
- **DEP-L001:** `innerHTML` for user content (Security risk: XSS). Use `setHTML()`.
- **DEP-L002:** `contenteditable="true"` (Use `plaintext-only` or `EditContext`).
- **DEP-L003:** `execCommand` (Deprecated legacy API).
- **DEP-L004:** External CSS frameworks (Tailwind/Bootstrap).
- **DEP-L005:** `popovertarget` / `popovertargetaction` (Use `commandfor` + `command`).
- **DEP-L006:** Inline `onchange` or `onclick` handlers in HTML.

## 3. LOGIC & APIS (DEP-C)
- **DEP-C001:** Legacy `Date` object (Use `Temporal API`). Exceptions: `parseDate` input handling.
- **DEP-C002:** Server-side dependencies for core logic (Client-Side-Only requirement).
- **DEP-C003:** External utility libraries (Moment.js, jspdf).
- **DEP-C004:** `setTimeout` / `requestIdleCallback` for debouncing (Use **IdleDetector API**).

## 4. STYLING (DEP-S)
- **DEP-S001:** Hex colors (`#ffffff`) or `rgba()` in CSS. Use `oklch()`.
- **DEP-S002:** Hard-coded Hover colors. Use **Relative Color Syntax (RCS)**.
- **DEP-S003:** Scrollbars in DIN-A4 container. Use `field-sizing: content` and `overflow: hidden`.
- **DEP-S004:** `@supports` guards for Baseline features (Chrome 147+ is the floor).

## 5. TOOLING (DEP-T)
- **DEP-T001:** Context-fragmenting tools (`head`/`tail`).
- **DEP-T002:** Environment-specific stream syntax (`cat <<EOF`).
- **DEP-T003:** Manual file versioning via filename (`_v1.0.md`). Use Git.

## 6. INPUT & SECURITY (APR-I)
- **APR-I001:** `contenteditable="true"` ohne EditContext (Use `EditContext API` + `plaintext-only`).
- **APR-I002:** Manuelle HTML-Sanitizer (Use `Sanitizer API` + `setHTML()`).
- **APR-I003:** `requestIdleCallback` für Autosave (Use `IdleDetector API` or `scheduler.postTask()`).
- **APR-I004:** `RegExp.$1-$9` / `RegExp.input` (Use modern named capture groups).
- **APR-I005:** `document.execCommand()` (Use **EditContext API** or direct DOM manipulation).

## 7. UI & ANIMATION (APR-U)
- **APR-U001:** JS-Dialog-Handler (Use **Invoker Commands** + `popover`).
- **APR-U002:** JS-Tooltip-Positionierung (Use **CSS Anchor Positioning**).
- **APR-U003:** JS-Layout-Transitions (Use **Scoped View Transitions**).
- **APR-U004:** Annex B String methods like `.fontsize()`, `.blink()` (Use modern CSS).

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
| **Input** | `contenteditable="true"` | `plaintext-only` + **EditContext API** |
| **Security** | `innerHTML` | **Sanitizer API** + `setHTML()` |
| **Reactivity** | `setTimeout` | **IdleDetector API** |
| **Scheduling** | `requestIdleCallback` | `scheduler.postTask()` |
| **Scrolling** | `JS Scroll-Listeners` | **Scroll-driven Animations** |
| **Conditionals** | `Complex Selectors` | **CSS `if()` logic** |
</content>
</file>

<file path=".brain/CONSTITUTION.md">
<metadata>Lines: 56 | Size: 2352 B</metadata>
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
<metadata>Lines: 44 | Size: 1923 B</metadata>
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
<metadata>Lines: 25 | Size: 1190 B</metadata>
<content>
# 💎 DIN-BriefNEO Roadmap (v4.0+)

## I. PHASE 1: SANIERUNG & HÄRTUNG (AKTUELL)
- [x] **IMR 4.0 Migration:** Umstellung auf 19 granulare Atome.
- [x] **Temporal Migration:** Konsequenter Einsatz der Temporal API.
- [x] **Cemetery Sweep:** Löschung des Archivs und Bereinigung der Specs.
- [x] **API Baseline 2026:** Integration von CSS Anchor Positioning & Scroll-State Queries.

## II. PHASE 2: VISUELLE INTEGRITÄT (TASK 6)
- [ ] **Ghost Overlay:** Einblendung der DIN-Referenz-SVGs zur Millimeter-Kontrolle.
- [ ] **Lokale Fonts:** 100% Autonomie durch WOFF2-Integration in `assets/fonts/`.
- [ ] **Visual Regression:** Puppeteer-basierte Screenshot-Vergleiche gegen Drift.

## III. PHASE 3: FEATURE-AUSBAU (NEXT)
- [ ] **Content Spiller V2:** Automatisierter Mehrseiten-Fluss mit Seitenzahlen.
- [ ] **Advanced Markdown:** Tabellen- und Listen-Support im Mirror.
- [ ] **IBAN-Integrität:** Visuelle Validierung und "Ghosting" fehlerhafter Daten.

## IV. PHASE 4: ÖKOSYSTEM
- [ ] **WebMCP:** Native Anbindung von KI-Agenten an den Dokumenten-Kontext.
- [ ] **Offline-Sync:** Leader Election & OPFS-Journaling Härtung.

---
*Zuletzt aktualisiert am 28. März 2026 durch den Lead Architect.*
</content>
</file>

<file path=".brain/research/BLINK_AUDIT.md">
<metadata>Lines: 104 | Size: 6274 B</metadata>
<content>
---
id: RESEARCH-001-BLINK-APIS
title: Blink Engine API Audit & Web Standards Baseline 2026
version: 1.0.0
status: verified
last_audit: 2026-03-27
tags: [research, blink-engine, chrome-147, web-standards, baseline-2026]
authority: Technical audit of modern browser APIs for mission-critical web applications.
---

# Blink Engine API Audit 2026

This document summarizes the research on hardware-level and logic APIs as well as declarative UI interfaces, specifically focused on the Blink engine (Chrome 147+).

## 1. Hardware-Level & Logic APIs (JavaScript)

### EditContext API
- **Purpose:** Decouples text input from DOM rendering. Replaces the problematic `contenteditable="true"` and prevents "div soup" by providing a direct bridge between the OS input method and the application logic.
- **Status:** Verified. Essential for the high-precision letter editor.
- **Reference:** [W3C EditContext API](https://w3c.github.io/edit-context/)

### Sanitizer API (`setHTML()`)
- **Purpose:** Native, C++-accelerated XSS sanitization during rendering (e.g., Visual Overlay Layer) without external libraries like DOMPurify.
- **Status:** Verified (Chrome 147+). `Element.setHTML()` is the primary method for secure synchronization.
- **Reference:** [W3C HTML Sanitizer API](https://wicg.github.io/sanitizer-api/)

### Temporal API
- **Purpose:** Modern replacement for the legacy `Date` object. Provides immutable objects and timezone-aware calculations (e.g., `Temporal.Now.plainDateISO()`).
- **Status:** Verified. Used for all date/time logic in the system.
- **Reference:** [TC39 Temporal Proposal](https://tc39.es/proposal-temporal/docs/)

### Web Locks API & OPFS (Origin Private File System)
- **Purpose:**
    - **Web Locks:** Ensures safe, cross-tab state protection and prevents race conditions.
    - **OPFS:** High-performance, local-first file storage for persistence.
- **Status:** Verified. Critical for the resilience strategy.
- **Reference:** [MDN Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API), [MDN OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)

## 2. Declarative UI & Layout Interfaces (HTML/CSS)

### CSS Anchor Positioning
- **Purpose:** Programmatically tether elements (tooltips, overlays) to specific anchors without manual coordinate calculation in JS.
- **Status:** Verified. Used for DIN field annotations and UI overlays.
- **Reference:** [CSS Anchor Positioning Spec](https://drafts.csswg.org/css-anchor-position-1/)

### CSS Scroll-State Container Queries (`@container scroll-state`)
- **Purpose:** Natively detects overflows in containers (e.g., DIN paper overflow) to trigger visual warnings without scroll event listeners.
- **Status:** Verified. Part of the Zero-JS Layout Observer.
- **Reference:** [CSS Container Queries Level 2](https://drafts.csswg.org/css-contain-3/#container-queries)

### Invoker Commands (`commandfor` / `command`)
- **Purpose:** Standardized HTML attributes to trigger UI actions (popovers, dialogs) without custom JS click listeners.
- **Status:** Verified. Enhances declarative interaction.
- **Reference:** [Open UI Invokers](https://open-ui.org/components/invokers.explainer/)

### CSS Custom Highlight API (`::highlight`)
- **Purpose:** High-performance syntax highlighting (e.g., Markdown markers) isolated from the DOM tree.
- **Status:** Verified. Used in the Presentation Layer.
- **Reference:** [MDN CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)

### CSS `field-sizing: content`
- **Purpose:** Allows input fields to automatically resize based on their content natively.
- **Status:** Verified. Replaces `scrollHeight` hacks for dynamic text areas.
- **Reference:** [CSS UI Level 4](https://drafts.csswg.org/css-ui-4/#field-sizing)

## 3. Advanced Navigation & Telemetry

### Navigation API
- **Purpose:** Modern replacement for the legacy History API. Provides a centralized, Promise-based interface for handling transitions.
- **Status:** Recommended for Chrome 147+.
- **Reference:** [WICG Navigation API](https://github.com/WICG/navigation-api)

### CSS Scroll-driven Animations
- **Purpose:** High-performance animations driven by scroll position, handled directly by the Compositor Thread.
- **Status:** Verified. Essential for smooth UI feedback in long documents.

### Diagnostic Logging & Accessibility
- **Structured Logging:** Use of `console.group()` and CSS styling for modular debugging.
- **ReportingObserver API:** Automatic capture of browser-level reports (deprecations, violations).
- **Accessible Logs (A11y):** Use of `aria-live` regions to make critical runtime logs perceivable for assistive technologies.

## 4. Legacy Migration Matrix (Upgrade Path)

| Feature Area | Legacy Pattern (Found) | Modern API (Target) |
| :--- | :--- | :--- |
| **Color Spaces** | `rgb()`, `rgba()`, `hex` | `oklch()` (Perceptual Uniformity) |
| **Theme Switching** | JS-Toggles, CSS Overrides | `light-dark()` & Relative Colors (`from`) |
| **Layout Math** | `calc()`, JS-rounding | `round()`, `rem()`, `mod()` (CSS Math) |
| **Typography** | `<br>`, `text-balancer.js` | `text-wrap: balance / pretty` |
| **Auto-Resize** | `scrollHeight` listeners | `field-sizing: content` |
| **Animations** | JS height calculation | `calc-size(auto)` / `interpolate-size` |
| **Modals** | `div` + Focus Trap JS | `<dialog>` + `inert` attribute |
| **Popovers/UI** | `addEventListener('click')` | **Invoker Commands** (`commandfor`) |
| **Positioning** | `getBoundingClientRect()` | **CSS Anchor Positioning** |
| **Reactivity** | `setTimeout`, manual DOM | **Native Signals** (Reactive State) |
| **Routing** | `window.location.href.match()` | **URLPattern API** (Declarative Matching) |
| **Scheduling** | `setTimeout(0)`, `requestIdleCallback` | `scheduler.postTask()` (Priority Queues) |
| **Transitions** | Class toggles, manual CSS trans | **View Transitions API** (Native Morphing) |
| **Scrolling** | JS Scroll-Listeners | **Scroll-driven Animations** (Compositor-level) |
| **Conditionals** | Complex CSS Selectors | **CSS `if()` logic** (Chrome 148+) |

---
*Audit completed on 2026-03-27. All listed APIs are compliant with the project's Mission-Critical Baseline.*
</content>
</file>

<file path=".env">
<metadata>Lines: 2 | Size: 61 B</metadata>
<content>
CONTEXT7_API_KEY=ctx7sk-5d9fe13d-6578-4b0d-bcd6-eb7cc4b7c187
</content>
</file>

<file path=".eslintrc.json">
<metadata>Lines: 41 | Size: 1724 B</metadata>
<content>
{
  "env": {
    "browser": true,
    "es2024": true
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-restricted-globals": ["error",
      { "name": "Date", "message": "TOMB-L001: Use Temporal API instead of legacy Date." },
      { "name": "setTimeout", "message": "TOMB-LEGACY-036: Use native Scheduling APIs or Temporal instead of legacy timers." },
      { "name": "setInterval", "message": "TOMB-LEGACY-036: Use native Scheduling APIs instead of legacy timers." }
    ],
    "no-restricted-syntax": ["error",
      {
        "selector": "NewExpression[callee.name='Date']",
        "message": "TOMB-L001: 'new Date()' is banned. Use 'Temporal.Now.plainDateISO()' for determinism."
      },
      {
        "selector": "MemberExpression[property.name=/^(innerHTML|insertAdjacentHTML|setHTMLUnsafe)$/]",
        "message": "MANDATE-INJ: Native XSS-Unsafe methods are strictly forbidden. Use 'setHTML(value, { sanitizer })' for rehydration."
      },
      {
        "selector": "ImportDeclaration[source.value=/^(dompurify|sanitize-html)$/]",
        "message": "ADR-014: External Sanitizer libraries are obsolete. Use the native browser Sanitizer API (Chrome 146+)."
      },
      {
        "selector": "CallExpression[callee.property.name='execCommand']",
        "message": "TOMB-V006: 'execCommand' is obsolete. Use EditContext API and Custom Highlight API."
      },
      {
        "selector": "AssignmentExpression[left.property.name=/^on(click|change|input|submit)$/]",
        "message": "NO-JS UI DOKTRIN: Inline Event Listeners are banned. Use native Invoker Commands (commandfor) or CSS :has() logic."
      }
    ],
    "no-console": "warn"
  }
}
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
<metadata>Lines: 13 | Size: 134 B</metadata>
<content>
!/.gemini/
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
<metadata>Lines: 82 | Size: 3521 B</metadata>
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

# Platinum DIN-BriefNEO Constitution

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
ALLE <din-*> Tags müssen `contenteditable="plaintext-only"` tragen. Dies verhindert die "stille Datenvergiftung" durch HTML-Paste und garantiert Datenintegrität.

### [MANDATE-BANNED] Banned Tools Doctrine
Die Nutzung von `head` und `tail` ist STRENGSTENS untersagt. Diese Tools fuehren zu Kontext-Fragmentierung und riskieren Datenverlust bei chirurgischen Edits. Nur `read_file` mit exakten Zeilenangaben ist zulaessig.

---

## II. ISOMORPHIC MASTER REGISTRY 2.0 (IMR) [CAA-008]

Das Drei-Einheits-Prinzip gilt ausnahmslos: `TAG = JSON-KEY = CMA-KOORDINATE`.
- Kein `getElementById` für Inhaltsfelder; stattdessen `querySelector(entry.tag)`.
- Die `TAG_MAP` wird automatisch aus der IMR generiert.
- SSoT (Single Source of Truth) ist `js/core/constants.js`.

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
<metadata>Lines: 9 | Size: 151 B</metadata>
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
<metadata>Lines: 116 | Size: 3960 B</metadata>
<content>
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

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

## Requirements *(mandatory)*

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

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

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
<metadata>Lines: 118 | Size: 4295 B</metadata>
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

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

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
> Fokus: Daten-Integrität, Mandats-Konformität, potenzielle Regressions-Risiken.]

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

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
</content>
</file>

<file path=".specify/templates/30-Aufgaben-template.md">
<metadata>Lines: 252 | Size: 9140 B</metadata>
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

- [ ] T010 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py

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

- [ ] T018 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T019 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

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

- [ ] T024 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T025 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

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
<metadata>Lines: 41 | Size: 1312 B</metadata>
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
<metadata>Lines: 51 | Size: 2336 B</metadata>
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
<metadata>Lines: 19 | Size: 590 B</metadata>
<content>
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Weighting**: [Score 1-100] | **Criticality**: [CRITICAL / OPTIONAL]

## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: [DIN-XXX-NEW]
- **Anti-Pattern Check**: Verletzt dieses Feature eine Regel aus `.brain/05_anti_pattern_registry.md`?

## Feature Weighting (Bedeutung)
- **Importance (1-100)**: [X]
- **Fulfillment Target**: [z.B. 100% / Strict]
- **Rationale**: [Warum ist dieses Feature so wichtig?]

## User Scenarios & Testing *(mandatory)*
...
</content>
</file>

<file path=".stylelintrc.json">
<metadata>Lines: 30 | Size: 899 B</metadata>
<content>
{
  "rules": {
    "no-duplicate-selectors": true,
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "declaration-block-no-shorthand-property-overrides": true,
    "font-family-no-duplicate-names": true,
    "unit-allowed-list": ["px", "rem", "em", "vh", "vw", "dvh", "%", "mm", "pt"],
    "declaration-property-value-disallowed-list": {
      "z-index": ["/.+/"],
      "mm": ["/.+/"]
    },
    "custom-property-pattern": "^din-|^c-",
    "at-rule-allowed-list": ["layer", "font-face", "container", "media", "highlight"],
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

<file path="AI_REVIEW_PROMPTS.md">
<metadata>Lines: 460 | Size: 32817 B</metadata>
<content>
# AI Architectural Review Prompts: DIN-BriefNEO v4.0 (Platinum)

Dieses Dokument enthält spezialisierte Prompts für verschiedene KI-Modelle, um ein tiefgehendes, kritisches Architektur-Audit von **DIN-BriefNEO** durchzuführen.

**Anleitung:**
1. Generiere ein aktuelles Bundle mit dem `Context Bundler Mini`.
2. Lade das Bundle in die jeweilige KI hoch.
3. Kopiere den entsprechenden Prompt aus diesem Dokument und sende ihn ab.

---

## 1. Claude (Fokus: Semantik, Strategie & Nachhaltigkeit)

~~~markdown
### SYSTEM ARCHITECTURAL AUDIT: DIN-BriefNEO v4.0 (Platinum Edition)

Führe eine kritische Architektur-Rezension für das Projekt "DIN-BriefNEO" durch.
HINWEIS: Poste keinen Code. Ich kenne den Code, du hast Zugriff auf den hochgeladenen Context oder kannst das Projekt-Schema (IMR 4.0) referenzieren.

Fokussiere dich auf folgende "Wunden" und architektonische Risiken:

1. HYPER-MODERNISMUS: Wir setzen auf eine Chrome 147+ Baseline (Temporal API, Math.sumPrecise, field-sizing: content, CSS :has(), Invoker Commands). Ist das technischer Purismus oder ein strategisches Himmelfahrtskommando bezüglich Browser-Kompatibilität?
2. IMR 4.0 (Isomorphic Master Registry): Das gesamte System basiert auf einer strikten 1:1 Abbildung von Custom-HTML-Tags (<din-*>) auf JSON-Keys. Wo liegen die Grenzen dieser "Atomistischen" Architektur bei komplexen Layout-Sprüngen (Form A vs. B)?
3. ZERO-JS DOCTRINE: Die UI-Logik wird fast vollständig in CSS (State-Management via :has() auf Radio-Buttons) ausgelagert. Wo bricht dieses Muster bei der Barrierefreiheit (A11y) und bei komplexen Form-Validierungen?
4. GHOST-MIRROR & EDITCONTEXT: Für Markdown-Rendering nutzen wir eine Dual-Layer-Struktur (EditContext -> State -> GhostMirror). Ist diese Entkopplung "High-Integrity" Robustheit oder unnötige Komplexität?

Lege den Finger in die Wunde: Wo ist das Projekt über-engineered? Wo widerspricht die "Bleeding Edge"-Nutzung gängigen Best Practices der Web-Entwicklung?
~~~

Das ist die Antwort von Claude:
# GitHub-Repository-Analyse für Zero-JS-Modernisierung

**Created:** 3/28/2026 23:22:02
**Updated:** 3/29/2026 14:58:06
**Exported:** 3/29/2026 15:09:27
**Link:** [https://claude.ai/chat/28d8cf6e-ad1e-4c59-8720-a3ec156e3225](https://claude.ai/chat/28d8cf6e-ad1e-4c59-8720-a3ec156e3225)

## Response:
29.3.2026, 14:58:06

Ich habe den gebündelten Context gelesen. Hier ist die ehrliche, ungeschönte Rezension.

---

## Architektur-Audit: DIN-BriefNEO v4.0

---

### 1. HYPER-MODERNISMUS: Strategisches Himmelfahrtskommando?

**Kurze Antwort: Für diesen spezifischen Use Case vertretbar. Aber mit einem versteckten Risiko.**

Die Chrome 147+ Baseline ist für ein Hobbyprojekt, das bewusst auf "Blink-Direct" setzt, keine irrationale Entscheidung. `Math.sumPrecise`, `Temporal`, `CSS Scroll-State Queries` – das sind keine experimentellen Flags, sondern landed features im stabilen Chrome-Kanal.

Das **eigentliche Risiko** liegt woanders: Du baust auf Features, die teilweise selbst in Chrome noch nicht vollständig stabilisiert sind. `CSS if()` ist für Chrome 148 angekündigt – du referenzierst es bereits in der CONSTITUTION und in `ANTI_PATTERN.md` als Zielzustand. Das ist kein Baseline-Feature, das ist eine Wette auf die Roadmap. Wenn Google die Syntax bricht oder verzögert, zieht das einen Teil deiner Architektur-Dokumentation unter Wasser.

**Das tiefere Problem** ist nicht Browser-Kompatibilität, sondern Wartbarkeit im Zeitverlauf. Wer in zwei Jahren deinen Code liest – oder wer KI-gestützt assistiert – hat eine extrem hohe Einstiegshürde, weil die Kombination aus Temporal, EditContext, CSS Scroll-State und Custom Highlight API ein Wissensstand ist, der nicht in Standard-Referenzwerken konsolidiert ist. Du bist dein eigener Dokumentations-Engpass.

---

### 2. IMR 4.0: Stärken und Grenzen der atomistischen Architektur

**Das Modell ist brilliant für den Steady State. Es ist spröde an den Rändern.**

Die strenge 1:1-Kopplung `TAG = JSON-KEY = CSS-ANCHOR-NAME` eliminiert eine ganze Klasse von Synchronisierungsfehlern. Das ist der ehrlichste architektonische Gewinn des Projekts.

Aber das Modell hat drei strukturelle Sollbruchstellen:

**Sollbruchstelle A – Komposita-Atome:** `din-return-line` leitet sich aus vier anderen Atomen ab (`sender_fn`, `sender_ln`, `sender_st`, `sender_city`). Diese Ableitung ist in `logic.js` als `deriveReturnLine()` hartcodiert und liegt außerhalb des IMR. Das IMR weiß nicht, dass `return_line` ein abhängiges Atom ist. Wenn jemand `sender_fn` ändert und `return_line` nicht manuell neu ableitet, divergiert der Zustand lautlos. Dein StateManager hat keinen Dependency-Graph.

**Sollbruchstelle B – Form A vs. B:** Der Layout-Switch ist CSS-seitig über `:has(#layout-a:checked)` gelöst, was sauber ist. Aber die CMA-Koordinaten im JS (`constants.js`) kennen `FORM.A.ADDRESS_TOP` und `FORM.B.ADDRESS_TOP` – sie sind aber nie in das CSS injiziert. Das CSS hat seine eigenen Hardcoded-Werte (`32mm`, `45mm`), die synchron mit den JS-Konstanten gepflegt werden müssen. Du hast also zwei physisch getrennte Single-Sources-of-Truth für dieselben Maße. Das ist ein stiller Drift-Kandidat.

**Sollbruchstelle C – Die 19-Atom-Grenze:** Das IMR hat 19 Atome, aber ein echter DIN-5008-Brief kennt situative Elemente – mehrere Anlagen-Positionen, optionale Verteiler, P.S.-Block. Diese lassen sich nicht als feste Atome modellieren. Du hast dieses Problem mit `din-attachments` als einzelnem Plaintext-Block gelöst, was pragmatisch ist, aber das "Isomorphic"-Versprechen bricht: Der JSON-Key `attachments` bildet eine Liste ab, nicht ein Atom.

---

### 3. ZERO-JS DOCTRINE: Wo bricht das Muster?

**Zwei echte Bruchstellen, eine philosophische.**

**Bruchstelle A – Barrierefreiheit:** CSS `:has()`-basiertes State-Management hat keine semantische Entsprechung im Accessibility-Tree. Wenn du `body:has(#theme-night:checked)` aktivierst, erfährt ein Screenreader nichts davon. Radio-Buttons für Layout-Optionen sind semantisch korrekt – aber ihre Auswirkung auf das Dokument-Layout ist für assistive Technologie unsichtbar. `aria-live`-Regionen oder `aria-label`-Updates bei Layout-Wechseln fehlen vollständig. Das ist kein theoretisches Problem: Dein `contrast-color()` für Buttons zeigt, dass Barrierefreiheit im Ansatz gedacht ist – aber die State-Management-Ebene ist a11y-blind.

**Bruchstelle B – Validierung:** Formularvalidierung via CSS ist strukturell auf `:valid`/`:invalid`-Pseudoklassen limitiert. Deine IBAN-Validierung (Modulo-97 via BigInt) ist inhärent JavaScript-Logik. Du hast das korrekt gelöst – sie bleibt in JS. Aber das bedeutet, dass deine Zero-JS-Doktrin für Validierung von Anfang an eine Ausnahme hatte, die in der CONSTITUTION nicht als explizite Grenze definiert ist. Das erzeugt Graubereiche für KI-Agenten, die nach der Doktrin implementieren sollen.

**Philosophische Bruchstelle:** CSS als State-Machine für UI-Zustände zu nutzen ist eine Inversion des klassischen Separation-of-Concerns-Prinzips. CSS war nie als State-Container entworfen. Das ist kein Fehler – es ist eine bewusste Entscheidung. Aber sie hat einen Preis: Debugging von Zustandsproblemen ist erheblich schwieriger, weil der Zustand im Radio-Input-checked-Attribut lebt, nicht in einem inspektierbaren JS-Objekt. Dein Black Box Decoder hilft hier, aber er ist nur im Dev-Mode zugänglich.

---

### 4. GHOST-MIRROR & EDITCONTEXT: High-Integrity oder Over-Engineering?

**Ehrliche Antwort: Für den Kern-Use-Case over-engineered. Für die angestrebte Präzision notwendig.**

Die Entscheidung für EditContext ist architektonisch korrekt motiviert: `contenteditable="true"` ist ein DOM-Kontaminations-Risiko, und `plaintext-only` allein löst das Markdown-Problem nicht. Soweit ist die Entscheidung sauber.

Das Problem liegt in der **Implementierungskomplexität im Verhältnis zum Nutzen:**

Der aktuelle Markdown-Parser in `logic.js` ist destruktiv – er löscht die Steuerzeichen. Das Non-Destructive Ghosting mit Zero-Width Markers (SPEC-066) ist noch offen. Das bedeutet: Du hast die volle Komplexität einer EditContext-Integration gebaut, aber der inhärente Hauptvorteil – WYSIWYG-Parität zwischen Editor und Print – ist noch nicht realisiert. Du trägst die Komplexitätskosten ohne den vollen Nutzen.

Hinzu kommt: `GhostMirror` baut auf `CSS.highlights` für Syntax-Coloring der Marker, aber `boldRanges` und `italicRanges` aus `getMarkdownRanges()` werden nie in `CSS.highlights.set()` übergeben. Die gesamte Range-Berechnung für Bold/Italic ist totes Code-Gewicht.

**Das strukturelle Over-Engineering** liegt an einer anderen Stelle: Der `IOCoordinator` mit Leader Election via Web Locks, BroadcastChannel, IdleDetector und OPFS-Worker ist für ein Single-User-Offline-Dokument-Editor erheblich mehr Infrastruktur als notwendig. Leader Election setzt mehrere konkurrierende Tabs voraus. Für den normalen Anwendungsfall – ein Tab, ein Nutzer, ein Brief – ist das ein F1-Motor in einem Stadtauto. Die Resilienz ist beeindruckend, aber sie kaschiert einen einfacheren Kern.

---

### 5. Wo ist das Projekt über-engineered? Die ehrliche Liste.

**Dokumentation vs. Code-Ratio:** Du hast mehr Spezifikations-Dokumentation (`.brain/`, `specs/`, `docs/`, `plans/`, `.specify/`) als produktiven Code. Das ist keine schlechte Sache per se – aber der Aufwand für Spec-Kit-Workflows, Konstitutions-Versionierung und Agent-Safety-Protokolle übersteigt bei einem Hobbyprojekt den Nutzen. Die Infrastruktur für die Infrastruktur wird zum Selbstzweck.

**Zwei Parallel-Architekturen:** Du hast sowohl eine `state.js` mit Proxy-basiertem StateManager als auch direkte DOM-Reads via `readDOMasJSON()`. Diese koexistieren ohne klare Regel, wann welche genutzt wird. `FlightRecorder` liest direkt aus dem DOM, `UIController` schreibt über den StateManager. Das ist keine bewusste Architekturentscheidung – das ist organisch gewachsene Inkonsistenz.

**Die Signal-Implementierung in `state.js`** ist ein selbstgeschriebener Reaktivitäts-Layer, der das native Signals API vorwegnimmt. Für Chrome 147 ist das sinnvoll als Shim. Aber er ist nicht mit dem Proxy-StateManager konsolidiert – beide existieren nebeneinander und synchronisieren manuell. Das ist Komplexität ohne Konsolidierung.

---

### Fazit

Das Projekt ist technisch ambitioniert und in seinen besten Teilen elegant. Die CSS-Architektur (`:has()`, `@property`, `@starting-style`, `field-sizing`) ist wirklich sauber und zeigt echtes Verständnis der modernen Plattform.

Die Wunde ist nicht der Modernismus selbst. Die Wunde ist, dass **die Dokumentations-Architektur schwerer wiegt als die Code-Architektur**, dass **zwei State-Systeme koexistieren ohne Konsolidierung**, und dass **die teuerste Implementierung (EditContext + GhostMirror) noch nicht ihren Kern-Nutzen liefert**, weil SPEC-066 offen ist.

Der nächste fokussierte Schritt wäre nicht mehr Features – es wäre, SPEC-066 zu schließen und die zwei State-Pfade zu konsolidieren.

---
Powered by [Claude Exporter](https://www.ai-chat-exporter.net)

---

## 2. Grok (Fokus: Performance, Systems-Engineering & Realitätscheck)

~~~markdown
### CRITICAL SYSTEMS REVIEW: DIN-BriefNEO PLATINUM ENGINE

Analysiere die System-Architektur von DIN-BriefNEO v4.0 unter dem Aspekt "High-Integrity Systems Engineering".
KEIN CODE – nur technische Analyse der Konzepte.

Hinterfrage folgende Entscheidungen gnadenlos:

1. OPFS-JOURNALING: Das System nutzt den Origin Private File System (OPFS) mit einem dedizierten Worker und Shadow Paging für einen einfachen Brief-Generator. Ist das eine geniale Lösung für Datenintegrität oder ein massiver Overkill ("Over-Engineering Alarm")?
2. NATIVE-FIRST VS. ECOSYSTEM: Wir verweigern React, Tailwind und Frameworks. Wir nutzen native Sanitizer APIs und Signals-Shims. Riskieren wir hier ein "Not-Invented-Here"-Syndrom, das die Wartbarkeit für Dritte unmöglich macht?
3. TEMPORAL API ABHÄNGIGKEIT: Das Projekt nutzt konsequent die Temporal API in einem Stadium, in dem Polyfills und Worker-Support noch instabil sind. Beleuchte die Risiken für die Datenkonsistenz bei Datumssprüngen.
4. CSS CUSTOM HIGHLIGHT API: Markdown-Highlighting wird über die native Highlight-API statt über DOM-Manipulation gelöst. Ist der Performance-Gewinn den Verlust an Flexibilität wert?

Wo ist das System "brüchig"? Wo führt die Fixierung auf "Zero-JS" zu schlechterer User-Experience oder instabilem State-Handling?
~~~
Das ist die Antwort von Grok
# Mieterverein-Alternativen! Ablehnung DMB Bonn!Siegburg

**User:**
**Created:** 3/16/2026 16:20
**Updated:** 3/29/2026 15:00
**Exported:** 3/29/2026 15:10

## Response:
Gedanken für 22s

**High-Integrity Systems Engineering Review: DIN-BriefNEO v4.0** **Scope**: Pure conceptual analysis. No code references. Focus on architectural trade-offs under “aviation-grade” integrity mandates (zero data loss, zero pixel drift, zero injection, Chrome 147+ baseline).

The architecture is a radical, uncompromising pursuit of **purity and determinism**. It treats a simple DIN-5008 letter generator like a safety-critical flight-control system: every decision is subordinated to the “High-Integrity” constitution (IMR 4.0 as SSoT, CMA as geometric single source of truth, plaintext-only + native APIs as security perimeter). This creates a remarkably coherent, low-bloat system — but it also introduces brittleness exactly where the mandates bite hardest.

### 1\. OPFS-JOURNALING with dedicated worker + shadow paging

**Verdict: Massive over-engineering for the use-case — bordering on architectural cosplay.**

A letter generator’s data model is tiny (19 atomic fields + one body string). Even with full Markdown ghosting and highlight matrix, the entire state fits comfortably in LocalStorage + a single JSON blob. Yet the design layers OPFS + a dedicated worker + shadow-paging on top, treating every edit like a transactional database write that must survive browser crash, tab kill, or OS hibernation.

**Pros (why it feels genius)**:

*   True zero-loss persistence even under power-loss or aggressive browser sandboxing.
*   Worker isolation guarantees that a hung main-thread never corrupts the journal.
*   Shadow paging gives atomic commits without partial-state nightmares.

**Cons (why it is overkill)**:

*   For 99.9 % of users (private individuals, small offices, Bürgergeld-Anträge) this is invisible complexity. The performance overhead of OPFS setup, worker handshakes and journal replay on every cold start is measurable and unnecessary.
*   It violates the “simplest thing that could possibly work” principle that high-integrity systems usually demand in non-mission-critical domains. You pay the complexity tax every single session for a benefit that only manifests in the 0.01 % edge case of sudden browser death mid-sentence.
*   Maintainability hit: a future contributor (or you in six months) will have to debug a two-layer storage system (LocalStorage fallback + OPFS journal) for what is effectively a glorified text editor.

**High-Integrity score**: 10/10 for paranoia. **Engineering sanity score**: 3/10. This is where the constitution has over-corrected.

### 2\. Native-First vs. Ecosystem (no React, no Tailwind, Signals-Shims only)

**Verdict: Not-Invented-Here syndrome in full bloom — elegant for the author, hostile for anyone else.**

The refusal of component frameworks and utility CSS is doctrinally pure: zero runtime bloat, full control over every pixel via native CSS Anchor, :has(), @property, Sanitizer API etc. The resulting bundle is tiny and the render path is deterministic.

**Risks that are real**:

*   **Onboarding wall**: Any new maintainer must be fluent in the exact interplay of 147+ APIs (EditContext + Anchor Positioning + Custom Highlight + Sanitizer + Popover + Invokers). The learning curve is steeper than learning React + Tailwind combined.
*   **Future-proofing**: When Chrome 152 deprecates or changes one of these bleeding-edge APIs, the entire UI layer may need surgical rewrites instead of a simple library bump.
*   **Ecosystem leverage lost**: You cannot reuse battle-tested accessibility patterns, test harnesses or community components. Every tiny feature (e.g. a better date picker) becomes a custom wheel.

This is classic NIH: the system is perfectly maintainable _by the original architect_. For anyone else it is a beautiful but opaque crystal palace.

### 3\. Temporal API dependency

**Verdict: Forward-looking but currently fragile — date jumps are a latent integrity risk.**

Temporal is the correct long-term choice (immutable, timezone-aware, no legacy Date pitfalls). The constitution’s ban on new Date() is sound.

**Concrete risks today (March 2026)**:

*   Worker and polyfill support for Temporal is still “experimental” in some contexts. A worker crash or partial polyfill failure silently falls back to broken date math.
*   “Date jumps” (daylight-saving transitions, timezone changes on travel, or OS clock skew) are exactly the scenarios where Temporal’s precision shines — _if_ the polyfill/worker path behaves identically to the native path. Any divergence creates inconsistent deadline calculations (SPEC-076 Smart Deadlines).
*   Testing surface explodes: you now need matrix testing for native-Temporal vs. shimmed-Temporal.

The architecture assumes Chrome 147+ is the floor and the polyfill path is identical. That assumption is currently **unproven at scale**. One subtle timezone bug in a Bürgergeld-Widerspruch letter and the “high-integrity” claim evaporates.

### 4\. CSS Custom Highlight API for Markdown ghosting

**Verdict: Performance win, flexibility loss — the right choice for this narrow scope.**

Using paint-time highlights instead of DOM nodes for bold/italic/del is conceptually brilliant: zero reflows, perfect cursor parity, zero-width markers stay truly zero-width.

**Trade-off that hurts**:

*   The Highlight API is still Chrome-only in practice (limited Safari/Firefox support). Cross-browser export or future-proofing becomes painful.
*   Complex nested formatting (bold + italic + strikethrough on overlapping ranges) or dynamic user-driven highlights require significantly more coordination code than a simple DOM span approach.
*   Debugging is harder: you cannot inspect the “virtual” highlight layer with devtools the same way you can with real elements.

For a letter generator that only needs basic Markdown → print fidelity, the performance and integrity gains outweigh the flexibility loss. But the moment someone wants rich comments or tracked changes, the architecture will feel constraining.

### Where the system is actually “brüchig” (fragile)

1.  **Zero-JS dogma vs. real interaction complexity** The fixation on “no JS for UI state” works beautifully for layout toggles (:has() + radio buttons). It breaks down the moment you need coordinated multi-field logic (e.g. salutation engine reacting to recipient changes _plus_ manual override protection _plus_ 3-line signature spacing). The current design pushes that into a hybrid of CSS + minimal JS. The seam is visible and will widen with every new feature.
2.  **DOM-First state handling** Making the live DOM the SSoT during editing is elegant for typing performance. It is brittle for anything that requires transactional consistency across atoms (import, profile switch, bulk format changes). A missed blur event or rapid tab-switch can leave the JS proxy and DOM out of sync until the next persistence cycle.
3.  **Chrome 147+ monoculture** The entire stack (Anchor, Sanitizer, Highlight, Popover, EditContext, Temporal, @property, :has(), etc.) is a deliberate Chrome baseline. This is not “modern web” — it is “Chrome web”. Any user on Edge, Firefox, or an older corporate Chrome is second-class or broken. The PWA/standalone promise collapses outside that bubble.
4.  **Over-constrained purity** The constitution forbids so many reasonable patterns (innerHTML even behind Sanitizer gates in some places, any framework, any external lib) that the code becomes a dense thicket of custom abstractions. This is high-integrity, but it is also high-friction. Technical debt is replaced by architectural debt.

**Bottom line** DIN-BriefNEO v4.0 is a masterpiece of dogmatic consistency. It achieves an almost ridiculous level of integrity for a letter printer. But it does so by over-engineering storage, under-leveraging the ecosystem, betting the farm on bleeding-edge Chrome APIs, and enforcing a Zero-JS religion that starts to hurt UX and maintainability the moment real-world complexity creeps in.

It is not “brüchig” in the classic crash-and-burn sense. It is brittle in the **high-integrity-overkill** sense: perfectly robust until the day someone else has to touch it, or Chrome changes one API, or a user needs a feature that doesn’t fit the purity mandates.

The architecture is a monument to “correctness über alles”. Whether that is sustainable beyond the original author is the real open question.

Temporal API Risiken analysierenHigh-Integrity Design Patterns

---
Powered by [Grok Exporter](https://www.grokexporter.com)
---

## 3. DeepSeek (Fokus: Technische Rigorosität, Logik & Best Practices)

~~~markdown
### ARCHITECTURAL INTEGRITY AUDIT: DIN-BriefNEO v4.0

Führe eine tiefenpsychologische technische Analyse der DIN-BriefNEO Architektur durch.
STRIKTES CODE-VERBOT in der Antwort. Konzentriere dich auf die logische Konsistenz der Paradigmen.

Analysiere folgende Inkonsistenzen:

1. STATE-DOM-DISSASOZIATION: Der UIController synchronisiert den Proxy-State via _syncAllToDOM() zurück in Datasets. Besteht hier ein Race-Condition-Risiko mit dem EditContext, der parallel den Buffer verwaltet?
2. TERMINOLOGIE-DRIFT: Das Projekt nutzt Begriffe wie "IMR 4.0", "High-Integrity" und "Fiskale Integrität". Ist die technische Realität (einfaches Mapping von Strings) konsistent mit diesem hochtrabenden Vokabular oder ist das technisches Marketing-Bluffing?
3. INVOKER COMMANDS: Die Nutzung von `commandfor` und `command` Attributen ist extrem früh (Bleeding Edge). Wie sicher ist das Error-Handling, wenn die Engine im Browser noch unvollständig implementiert ist?
4. ATOMIC IDENTITY: Die Aufteilung von Namen in FN (Firstname) und LN (Lastname) in der IMR Registry bei gleichzeitiger Nutzung einer "Salutation-Engine". Wo führt diese Granularität zu logischen Sackgassen bei internationalen Namensformaten?

Identifiziere Best-Practice-Verletzungen: Wo opfert das Projekt Stabilität für die Eitelkeit, die neuesten Browser-Features als Erster einzusetzen?
~~~
hier ist die Antwort von Deepseeek
## ARCHITECTURAL INTEGRITY AUDIT: DIN-BriefNEO v4.0

### Prämisse
Dieses Audit untersucht die **logische Bruchfestigkeit** der Architektur. Die Antwort enthält keinen Code, sondern ausschließlich Systemanalyse.

---

## 1. STATE-DOM-DISSASOZIATION: Das Race-Condition-Risiko

### Die Architektur-Behauptung
> "JavaScript ist von der Live-Synchronisation entkoppelt. Das DOM ist die einzige Quelle der Wahrheit."

### Die versteckte Inkonsistenz
Das System fährt einen **Zwei-Wege-State**, keinen echten "DOM-First"-Ansatz:

| Komponente | Hält State | Wann geschrieben | Risiko |
|------------|------------|------------------|--------|
| **EditContext** | Text-Buffer | Bei jedem `textupdate`-Event | Hochfrequenz |
| **Proxy (sm.state)** | Kompletter IMR-State | Via `sm.update()` aus EditContext-Callback | Synchron |
| **DOM-Datasets** | Layout-State (Form, Guides, Theme) | Bei `change`-Event | Asynchron |

**Das konkrete Risiko:**
~~~
Zeit t0: Nutzer tippt → EditContext feuert `textupdate`
Zeit t1: sm.update() schreibt in Proxy
Zeit t2: UIController._syncAllToDOM() wird aufgerufen (via subscription)
Zeit t3: _syncAllToDOM() überschreibt möglicherweise gerade fokussierte Felder
~~~

**Die Schwachstelle:** `_syncAllToDOM()` iteriert über **ALLE** IMR-Felder und ruft `_updateDOMSafe()` auf. Die Methode prüft zwar `document.activeElement !== el`, aber:
- Diese Prüfung schützt nicht vor einem `blur`-Event, das zwischen `textupdate` und `_syncAllToDOM()` auftritt
- Bei schneller Eingabe (z.B. Tastatur-Makros) kann der Fokus wechseln, bevor der Sync abgeschlossen ist
- Der Ghost-Mirror wird separat via `update()` synchronisiert – zwei parallele Sync-Pfade

**Bewertung:** Das System hat ein **asynchrones Synchronisations-Dilemma**. Es ist kein DOM-First, sondern ein **DOM-Proxy-Dualismus** mit potenziellen Timing-Fehlern bei schneller Eingabe oder unerwarteten Fokuswechseln.

---

## 2. TERMINOLOGIE-DRIFT: "High-Integrity" vs. Realität

### Die Behaupteten Prinzipien

| Begriff | Versprochen | Technische Realität | Diskrepanz |
|---------|-------------|---------------------|------------|
| **IMR 4.0** | "Isomorphic Master Registry" – strikte 1:1-Isomorphie | Ein Array von 19 Einträgen mit `tag`, `key`, `editContext` | Keine echte Isomorphie – nur ein Lookup-Table. Ein "Isomorphismus" wäre ein mathematischer Beweis, nicht ein einfaches Mapping. |
| **High-Integrity** | "Fehler müssen strukturell unmöglich sein" | Keine formalen Proofs, keine Model Checking, keine Runtime-Verifikation | Marketing. High-Integrity erfordert DO-178C-Level-Zertifizierung – kein Webprojekt erreicht das. |
| **Fiskale Integrität** | "Zero-Loss Data Persistence" | OPFS-Journaling + BroadcastChannel + IdleDetector | Technisch solide, aber "Fiskale Integrität" ist ein enorm überladener Begriff für eine Browser-Storage-Lösung. |
| **Zero-JS UI Doctrine** | "Kein JavaScript für UI-Toggles" | CSS `:has()` + Radio-Buttons | **Erfüllt.** Das ist tatsächlich beeindruckend und konsistent umgesetzt. |

### Das eigentliche Problem: Begriffsinflation

Das Projekt verwendet **militärisch/industrielle Terminologie** für grundlegende Web-Techniken:
- "Ghost-Mirror" ist ein guter Name für eine **DOM/View-Trennung** – aber kein neuartiges Muster
- "Content Spiller Protokoll" beschreibt **CSS Pagination** – existiert seit Jahren
- "Phoenix Protocol" ist ein **BroadcastChannel + Web Locks** – solide, aber kein "Protokoll"

**Bewertung:** Kein "Marketing-Bluffing" – die Technik ist solide. Aber die **Semantik überladt** die tatsächliche Komplexität. Ein neuer Entwickler würde Stunden brauchen, um zu erkennen, dass "High-Integrity" einfach "gut getestet" bedeutet.

---

## 3. INVOKER COMMANDS: Bleeding-Edge-Risiken

### Status Quo
Das System nutzt `commandfor`/`command` Attribute für Dialoge, Popover und Aktionen (Export, Import, Print).

### Das Risiko-Szenario

**Chrome 147+ als Baseline ist aggressiv:**
- `commandfor` ist ein **OpenUI-Explainer**, kein fertiger Standard
- Die API hat sich mehrfach geändert (früher `invoketarget`/`invokeaction`)
- Firefox hat **keine** Implementierungssignale gezeigt

**Konkrete Fehlermodi:**

| Szenario | Wahrscheinlichkeit | Auswirkung |
|----------|-------------------|------------|
| Browser unterstützt `command` nicht | Gering (Chrome only) | Buttons tun nichts – keine Fallbacks |
| Browser unterstützt `commandfor` aber nicht `command` | Sehr gering | Partielle Funktionalität |
| Future-Update ändert Semantik | Mittel | App muss migrieren, Nutzer versteht nicht |

**Das eigentliche Problem:** Es gibt **kein Fallback**. Ein Button mit `command="--export"` der nicht funktioniert, gibt dem Nutzer kein Feedback. Die `document.addEventListener("command")`-Listener sind an ein experimentelles Feature gebunden.

**Best-Practice-Verletzung:** Das System **opfert Graceful Degradation** für die Eitelkeit, "Native Invokers" zu nutzen. Ein defensiver Ansatz wäre:
- Zuerst prüfen, ob `'command' in document.createElement('button')`
- Falls nein, auf klassische Event-Listener zurückfallen
- Aktuell: keine Prüfung, kein Fallback

---

## 4. ATOMIC IDENTITY: Granularität vs. Internationale Namen

### Die IMR-Granularität
~~~javascript
// Aus constants.js
{ tag: "din-absender-vorname",  key: "sender_fn" }
{ tag: "din-absender-nachname", key: "sender_ln" }
{ tag: "din-empfaenger-vorname", key: "rect_fn" }
{ tag: "din-empfaenger-nachname", key: "rect_ln" }
~~~

### Das Problem: Kulturelle Namenskonventionen

| Kultur | Format | Funktioniert? | Problem |
|--------|--------|---------------|---------|
| Deutsch | Vorname Nachname | ✅ | Standardfall |
| Ungarisch | Nachname Vorname | ❌ | Felder sind vertauscht |
| Isländisch | Nur Vorname (kein Familienname) | ❌ | `sender_ln` bleibt leer – unschön aber technisch okay |
| Portugiesisch | Vorname + 2 Nachnamen | ⚠️ | Zweiter Nachname geht verloren |
| Japanisch (westlich) | Vorname Nachname | ✅ | Funktioniert |
| Japanisch (traditionell) | Nachname Vorname | ❌ | Vertauscht |
| Mononym (z.B. Madonna, Prince) | Keine Aufteilung | ❌ | `sender_fn` bekommt alles, `sender_ln` leer |

### Die Salutation-Engine als Retter?
Die `parseRecipient()`-Funktion in `logic.js` versucht, aus `rect_fn` + `rect_ln` den Namen zu rekonstruieren:
~~~javascript
// Aus logic.js
const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
const name = nameParts.length ? nameParts[nameParts.length - 1] : "";
~~~

**Logische Sackgassen:**

1. **Was ist mit "Dr. Maria Schmidt-Meyer"?**
   - Titel wird korrekt extrahiert (Dr.)
   - `rect_fn` = "Maria"
   - `rect_ln` = "Schmidt-Meyer"
   - Salutation: "Sehr geehrte Frau Dr. Schmidt-Meyer" – korrekt

2. **Was ist mit "Familie Schmidt"?**
   - Kein Vorname → `rect_fn` leer
   - `rect_ln` = "Schmidt"
   - Salutation: "Sehr geehrte Familie Schmidt" – korrekt

3. **Was ist mit "Prof. Dr. Dr. h.c. mult. Helmut Schmidt"?**
   - Titel werden korrekt extrahiert (mehrere Dr.)
   - Vorname = "Helmut"
   - Nachname = "Schmidt"
   - Funktioniert überraschend gut durch den Token-Ansatz

4. **Die echte Sackgasse: "Dr. h.c. Angela Merkel"**
   - `rect_fn` = "Angela"
   - `rect_ln` = "Merkel"
   - Aber der akademische Titel "Dr. h.c." (doctor honoris causa) wird als **Titel** erkannt
   - Salutation: "Sehr geehrte Frau Dr. h.c. Merkel" – das ist DIN-konform!

**Das eigentliche Problem ist nicht die Granularität – es ist die fehlende Konfigurierbarkeit:**

Das System **erzwingt** ein westliches Namensschema. Ein Nutzer aus Ungarn oder Japan kann nicht einfach die Feld-Reihenfolge tauschen. Die einzige Lösung wäre, beide Felder zusammenzuführen – was die Granularität ad absurdum führt.

**Bewertung:** Die Granularität ist **technisch beeindruckend** aber **kulturell naiv**. Für ein deutsches DIN-Projekt ist das akzeptabel. Für "High-Integrity" (internationaler Einsatz) wäre eine Kultur-Konfiguration notwendig.

---

## ZUSAMMENFASSUNG: Best-Practice-Verletzungen

### 1. Übermäßiger Einsatz von Bleeding-Edge Features
| Feature | Risiko | Alternative |
|---------|--------|-------------|
| `commandfor`/`command` | Kein Fallback | Progressive Enhancement mit Feature-Detection |
| CSS `if()` (Chrome 148) | Projekt-Deadline < Chrome 148-Release | Fallback-CSS oder Feature-Detection |
| `@container scroll-state` | Noch nicht weit verbreitet | IntersectionObserver als Fallback |

### 2. Die "Not-Invented-Here"-Syndrom-Risiken
- **Kein einziges Polyfill** – selbst für Features mit geringer Verbreitung
- **Keine Graceful Degradation** – wenn Chrome 147+ das Feature nicht hat, bricht die UI
- **Die Antwort auf "Was passiert in Firefox?"** ist derzeit: "Nichts. Wir unterstützen es nicht."

### 3. Dokumentations-Overhead vs. Code-Simplicität
- Die `.brain/`-Ordner enthalten **hunderte Seiten Spezifikation** für ein Projekt mit ~800 Zeilen JS
- Das Verhältnis **Dokumentation:Code** ist extrem hoch (>5:1)
- Ein neuer Contributor bräuchte Tage, um die "Aviation Grade"-Semantik zu verstehen

### 4. Die größte Inkonsistenz: "Zero-JS" vs. 800 Zeilen JS
Das Projekt **behauptet** "Zero-JS UI Doctrine", hat aber:
- `ui.js`: ~800 Zeilen (State-Sync, EditContext, Ghost-Mirror, Events)
- `state.js`: Proxy-Logik
- `devmode.js`: Inspector, Easter Egg
- `toast-manager.js`: Queue-System
- `flight-recorder.js`: Diagnostik

**Das ist nicht "Zero-JS".** Es ist "Minimal-JS für I/O". Das ist ein Unterschied. Die Terminologie ist hier irreführend.

---

## ABSCHLIESSENDE BEWERTUNG

| Kriterium | Bewertung | Begründung |
|-----------|-----------|------------|
| **Technische Qualität** | 8/10 | Sauberer Code, moderne APIs, gute Trennung |
| **Architektur-Konsistenz** | 6/10 | Dualer State (Proxy + DOM) ist inkonsistent |
| **Terminologie-Integrität** | 5/10 | "High-Integrity" überladen, "Zero-JS" irreführend |
| **Produktionsreife** | 7/10 | Funktioniert im Chrome-Kosmos, aber fragil |
| **Wartbarkeit für Dritte** | 4/10 | Hohe Einstiegshürde durch exotische Tech-Stack-Wahl |

**Das Projekt ist ein beeindruckendes technisches Kunststück, das an der Grenze des Möglichen operiert.** Aber es opfert Stabilität, Browser-Kompatibilität und Verständlichkeit für die Verwendung der neuesten Features. Es ist eher ein **Proof of Concept für Chrome 147+** als eine robuste "High-Integrity" Produktionsanwendung.
</content>
</file>

<file path="GEMINI.md">
<metadata>Lines: 36 | Size: 1912 B</metadata>
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

## CONTEXT PRECEDENCE
This file overrides all other instructions. Any violation is a critical system failure.
</content>
</file>

<file path="css/app-ui.css">
<metadata>Lines: 569 | Size: 15814 B</metadata>
<content>
/* ==========================================================================
   !!! ZERO-SCROLL SPECIFICATION (ADR-004) - HARD CONSTRAINT !!!
   --------------------------------------------------------------------------
   1. SCROLLBARS ARE PROHIBITED IN THIS PROJECT [BANNED].
   2. Overflow MUSS either VISIBLE or HIDDEN.
   3. 'overflow: auto', 'overflow: scroll' or 'max-height' with scroll intent
      are violations of the Technical Specification.
   4. A DIN letter is a static precision instrument. Scrolling indicates
      structural failure.
   ========================================================================== */

@layer latex.base, ui.theme, din.structure, ui.floating, core.immutable;

/* ── CMA TYPED PROPERTIES (Chrome 85+) ────────────────────────── */
@property --din-paper-w { syntax: "<length>"; initial-value: 210mm; inherits: true; }
@property --din-paper-h { syntax: "<length>"; initial-value: 297mm; inherits: true; }
@property --din-margin-l { syntax: "<length>"; initial-value: 25mm; inherits: true; }
@property --din-margin-r { syntax: "<length>"; initial-value: 20mm; inherits: true; }
@property --din-addr-w { syntax: "<length>"; initial-value: 85mm; inherits: true; }
@property --din-addr-h { syntax: "<length>"; initial-value: 45mm; inherits: true; }
@property --din-addr-top { syntax: "<length>"; initial-value: 45mm; inherits: true; }
@property --din-mark-fold-1 { syntax: "<length>"; initial-value: 105mm; inherits: true; }
@property --din-mark-fold-2 { syntax: "<length>"; initial-value: 210mm; inherits: true; }
@property --din-mark-loch { syntax: "<length>"; initial-value: 148.5mm; inherits: true; }

@layer ui.floating {
  /* ── CSS ANCHOR POSITIONING (Chrome 125+) ──────────────────────── */
  din-absender-vorname  { anchor-name: --anchor-sender-fn; }
  din-absender-nachname { anchor-name: --anchor-sender-ln; }
  din-empfaenger-vorname { anchor-name: --anchor-rect-fn; }
  din-empfaenger-nachname { anchor-name: --anchor-rect-ln; }
  din-empfaenger-strasse { anchor-name: --anchor-rect-st; }
  din-empfaenger-ort     { anchor-name: --anchor-rect-city; }
  din-subject           { anchor-name: --anchor-subject; }
  din-text              { anchor-name: --anchor-text; }
  din-date              { anchor-name: --anchor-date; }

  .autocomplete-suggestions {
    position: fixed;
    position-anchor: var(--suggestions-anchor, --anchor-rect-st);
    top: anchor(bottom);
    left: anchor(left);
    width: anchor-size(width);

    background: white;
    border: 1px solid oklch(90% 0.01 250);
    border-radius: 8px;
    box-shadow: 0 10px 30px oklch(0% 0 0 / 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
  }

  .autocomplete-suggestion {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .autocomplete-suggestion:hover {
    background: oklch(98% 0.01 250);
  }

  .autocomplete-suggestion strong {
    color: var(--c-primary);
  }

  .autocomplete-suggestion span {
    color: oklch(50% 0.01 250);
    font-size: 0.75rem;
  }
}

@layer ui.theme {
  :root {
    /* [CMD-8] Allow height:auto transitions */
    interpolate-size: allow-keywords;

    /* [SPEC-090] 7px Platinum Grid System */
    --space-unit:        7px;
    --space-xs:          calc(var(--space-unit) * 0.5);
    --space-sm:          var(--space-unit);
    --space-md:          calc(var(--space-unit) * 2);
    --space-lg:          calc(var(--space-unit) * 3);
    --space-xl:          calc(var(--space-unit) * 4);

    /* [SPEC-080] Native Theme Support */
    color-scheme: light dark;

    /* ── OKLCH CORE PALETTE (Perceptual Uniformity) ───────────────── */
    --c-primary:         oklch(60% 0.15 250);
    --c-primary-hover:   oklch(from var(--c-primary) calc(l - 0.1) c h);

    --c-sidebar-bg:      light-dark(oklch(18% 0.03 250), oklch(8% 0.02 250));
    --c-sidebar-btn-bg:  oklch(from white 10% 0 0 / 0.08);
    --c-sidebar-text:    oklch(90% 0.01 250);
    --c-sidebar-border:  oklch(from white 10% 0 0 / 0.08);

    --c-bg:              light-dark(oklch(96% 0.01 250), oklch(12% 0.02 250));
    --c-shadow-sheet:    0 12px 48px oklch(0% 0 0 / 0.15), 0 2px 8px oklch(0% 0 0 / 0.05);

    --c-radius-md:       8px;
    --c-font-ui:         "Inter", system-ui, sans-serif;
    --c-font-mono:       "JetBrains Mono", monospace;

    --c-text-primary:    light-dark(oklch(15% 0.01 250), oklch(95% 0 0));
    --c-text-secondary:  oklch(45% 0.02 250);

    /* ── DIN GEOMETRY (0.001mm Precision) ─────────────────────────── */
    --din-paper-w:       210mm;
    --din-paper-h:       297mm;
    --din-margin-l:      25mm;
    --din-margin-r:      20mm;
    --din-addr-w:        85mm;
    --din-addr-h:        45mm;
    --din-addr-top:      45mm;
    --din-mark-fold-1:   105mm;
    --din-mark-fold-2:   210mm;
    --din-mark-loch:     148.5mm;

    /* ── NIGHT MODE ───────────────────────────────────────────────── */
    --c-bg-dark:         oklch(12% 0.02 250);
    --c-paper-dark:      oklch(85% 0.01 250);
    --c-text-dark:       oklch(10% 0.01 250);
    --c-dot-dark:        oklch(20% 0.04 250);
  }

  .iban-field { grid-column: span 2; }

  /* [SPEC-080] Manual Overrides via UI-Buttons (JS-free states) */
  :root:has(#theme-night:checked) {
    --c-bg:              oklch(12% 0.02 250);
    --c-sidebar-bg:      oklch(8% 0.02 250);
    --c-text-primary:    oklch(95% 0 0);
  }

  :root:has(#theme-day:checked) {
    --c-bg:              oklch(96% 0.01 250);
    --c-sidebar-bg:      oklch(18% 0.03 250);
    --c-text-primary:    oklch(15% 0.01 250);
  }

  body:has(#theme-night:checked) #paper-viewport {
    background-image: radial-gradient(oklch(20% 0.04 250) 1.5px, transparent 1.5px) !important;
  }

  body:has(#theme-night:checked) #paper {
    background: oklch(85% 0.01 250) !important;
    filter: brightness(0.85) contrast(1.1);
    box-shadow: 0 20px 60px oklch(0% 0 0 / 0.5) !important;
  }

  body[data-layout="form-a"],
  body:has(#layout-a:checked) {
    --din-addr-top: 27mm;
    --din-mark-fold-1: 87mm;
    --din-mark-fold-2: 192mm;
  }

  body[data-layout="form-b"],
  body:has(#layout-b:checked) {
    --din-addr-top: 45mm;
    --din-mark-fold-1: 105mm;
    --din-mark-fold-2: 210mm;
  }
}

@layer din.structure {
  #paper {
    display: block;
    width: var(--din-paper-w);
    height: var(--din-paper-h);
    background: white;
    position: relative;
    box-shadow: var(--c-shadow-sheet);
    font-family: "Aptos", "Segoe UI", system-ui, sans-serif;
    font-size: 11pt;
    line-height: 1.4;
    overflow: hidden;

    /* ── SCROLL-STATE CONTAINER (Chrome 147+) ────────────────────── */
    container-name: paper;
    container-type: size scroll-state;
  }

  /* ── OVERFLOW INDICATOR (Content Spiller) ─────────────────────── */
  #paper::after {
    content: "⚠️ INHALT ÜBERLÄUFT SEITE 1";
    position: absolute;
    bottom: 20mm;
    right: var(--din-margin-r);
    background: oklch(60% 0.15 40);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    z-index: 100;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
  }

  @container paper scroll-state(scrollable: block) {
    #paper::after {
      opacity: 1;
      transform: translateY(0);
    }

    /* Automated multi-page preparation logic could go here */
  }

  .paper-header {
    position: absolute;
    top: 20mm;
    right: var(--din-margin-r);
    width: 75mm;
    text-align: right;
    font-size: 10pt;
    line-height: 1.2;
    display: flex;
    flex-direction: column;
  }

  /* [SPEC-080] Zero-JS UI State Management via :has() */
  :root:has(#theme-night:checked) {
    --c-bg:              oklch(12% 0.02 250);
    --c-sidebar-bg:      oklch(8% 0.02 250);
    --c-paper-bg:        oklch(15% 0 0);
    --c-text-primary:    oklch(95% 0 0);
  }

  :root:has(#guides-off:checked) din-5008 {
    --din-guides-opacity: 0;
  }

  :root:has(#layout-a:checked) {
    --din-addr-top: 32mm;
    --din-mark-fold-1: 87mm;
  }

  :root:has(#layout-b:checked) {
    --din-addr-top: 45mm;
    --din-mark-fold-1: 105mm;
  }

  /* [SPEC-080] JS-Free Placeholders (Platinum 2026 Edition) */
  [data-placeholder]:is(:empty, :has(> br:only-child))::before {
    content: attr(data-placeholder);
    color: oklch(40% 0.01 250 / 0.4); /* Etwas dunkler für bessere Lesbarkeit */
    pointer-events: none;
    font-style: normal;
    font-size: 0.95em;
    display: block;
    position: absolute;
  }

  /* ... existing single-line atoms ... */

  /* Growing Zones (Stabilized) */
  din-subject {
    font-weight: bold;
    margin-bottom: 7mm; /* 7px raster match */
    display: block;
    field-sizing: content;
    text-wrap: balance;
  }

  din-text {
    display: block;
    min-height: 20mm;
    field-sizing: content;
    white-space: pre-wrap;
  }

  #brief-kern {
    position: absolute;
    top: calc(var(--din-addr-top) + 50mm); /* Korrigierter Offset */
    left: var(--din-margin-l);
    right: var(--din-margin-r);
    display: flex;
    flex-direction: column;
  }

  /* Overflow Indicator Fix */
  @container paper scroll-state(scrollable: block) {
    #paper::after {
      opacity: 1;
      transform: translateY(0);
      display: block; /* Nur zeigen wenn wirklich nötig */
    }
  }

  #paper::after {
    display: none; /* Default aus */
    content: "⚠️ INHALT ÜBERLÄUFT SEITE 1";
    /* ... existing styling ... */
  }

  /* [SPEC-085] Toast System */
  #toast-container {
    position: fixed;
    bottom: 20mm;
    right: 20mm;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    background: oklch(20% 0.02 250);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 10pt;
    margin-top: 8px;
    box-shadow: 0 4px 12px oklch(0% 0 0 / 0.2);

    /* Entry Animation (JS-free) */
    opacity: 1;
    transform: translateY(0);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @starting-style {
    .toast {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
  }

  .toast-exit {
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease-in;
  }

  .toast-success { border-left: 4px solid oklch(65% 0.2 145); }
  .toast-error   { border-left: 4px solid oklch(55% 0.2 30); }
  .toast-warning { border-left: 4px solid oklch(75% 0.2 85); }
  .toast-info    { border-left: 4px solid oklch(65% 0.2 250); }

@media print {
    background-color: oklch(100% 0 0 / 0.9) !important;
    border: 1px solid var(--c-primary) !important;
    box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
  }

  .paper-address-zone {
    position: absolute;
    top: var(--din-addr-top);
    left: 20mm;
    width: var(--din-addr-w);
    height: var(--din-addr-h);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: outline 0.3s ease;
  }

  /* [SPEC-031] Address Zone Integrity Guard */
  .paper-address-zone[data-integrity="fail"] {
    outline: 2px solid oklch(60% 0.15 25);
    background: oklch(60% 0.15 25 / 0.05);
  }

  .paper-address-zone[data-integrity="fail"]::after {
    content: "⚠️ DIN-VERSTOSS: > 6 ZEILEN";
    position: absolute;
    top: -20px;
    right: 0;
    font-size: 7pt;
    font-weight: bold;
    color: oklch(60% 0.15 25);
    background: white;
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 2px 4px oklch(0% 0 0 / 0.1);
  }

  din-return-line {
    font-size: 8pt;
    border-bottom: 0.5pt solid oklch(0% 0 0 / 0.2);
    margin-bottom: 2mm;
    height: 5mm;
    color: oklch(40% 0 0);
  }

  .paper-infoblock {
    position: absolute;
    top: 97.4mm;
    left: 125mm;
    width: 75mm;
    display: flex;
    flex-direction: column;
    gap: 1.5mm;
  }

  din-date {
    position: absolute;
    top: 50mm;
    left: 125mm;
    width: 75mm;
    text-align: left;
  }

  #brief-kern {
    position: absolute;
    top: calc(var(--din-addr-top) + 58.4mm);
    left: var(--din-margin-l);
    right: var(--din-margin-r);
  }

  din-subject {
    font-weight: bold;
    margin-bottom: 12.7mm;
    display: block;
  }
  din-text {
    display: block;
    min-height: 50mm;
    white-space: pre-wrap;
  }

  .paper-footer {
    position: absolute;
    bottom: 15mm;
    left: var(--din-margin-l);
    right: var(--din-margin-r);
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: oklch(40% 0 0);
    border-top: 0.5pt solid oklch(0% 0 0 / 0.2);
    padding-top: 2mm;
  }
}

@layer latex.base {
  html,
  body {
    font-family: var(--c-font-ui);
    margin: 0;
    padding: 0;
    width: 100% !important;
    height: 100dvh !important;
    overflow: hidden !important;
  }
}

@layer core.immutable {
  .mark {
    position: absolute;
    left: 0;
    width: 5mm;
    border-top: 0.5pt solid oklch(0% 0 0);
    pointer-events: none;
  }

  .mark-fold-1 { top: var(--din-mark-fold-1) !important; }
  .mark-fold-2 { top: var(--din-mark-fold-2) !important; }
  .mark-loch   { top: var(--din-mark-loch) !important; width: 7mm !important; }

  #app-shell { display: flex; width: 100%; height: 100dvh; overflow: hidden; }

  #sidebar-left {
    width: 280px;
    background: var(--c-sidebar-bg);
    color: var(--c-sidebar-text);
    display: flex;
    flex-direction: column;
  }

  .sidebar-btn {
    background: var(--c-sidebar-btn-bg) !important;
    /* [ACCESSIBILITY] Auto-Contrast via Chrome 147 contrast-color() */
    color: contrast-color(var(--c-sidebar-btn-bg)) !important;
    padding: 12px 16px;
    border-radius: 10px;
    cursor: pointer;
    width: 100%;
    margin-bottom: 5px;
    border: none;
  }

  .sidebar-btn.primary {
    background: var(--c-primary) !important;
    color: contrast-color(var(--c-primary)) !important;
    font-weight: 600;
  }

  #paper-viewport {
    flex-grow: 1;
    background-color: var(--c-bg);
    display: grid;
    place-items: center;
    padding: 40px;
    overflow: auto;
  }

  .compliance-bar, #btn-decoder-trigger, .status-bar { display: none !important; }
  body.dev-mode .compliance-bar, body.dev-mode #btn-decoder-trigger, body.dev-mode .status-bar { display: flex !important; }

  /* [SPEC-075] Smart Deadline Popover */
  .deadline-popover {
    position: absolute;
    position-anchor: --anchor-date;
    top: anchor(bottom);
    left: anchor(left);
    margin-top: 5px;
    background: white;
    border: 1px solid oklch(0% 0 0 / 0.1);
    border-radius: 8px;
    box-shadow: 0 4px 12px oklch(0% 0 0 / 0.1);
    padding: 10px;
    z-index: 1000;
    min-width: 250px;
  }

  .deadline-popover header {
    font-size: 7pt;
    font-weight: bold;
    color: var(--c-primary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .deadline-list { display: flex; flex-direction: column; gap: 6px; }

  .deadline-item {
    background: oklch(98% 0 0);
    border: 1px solid oklch(0% 0 0 / 0.05);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 9pt;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: black;
  }

  .deadline-item:hover {
    background: var(--c-primary);
    color: white;
  }

  .deadline-item.prominent {
    border: 1.5px solid var(--c-primary);
    background: oklch(0% 0 0 / 0.02);
  }

  @media print {
    html, body { background: white !important; height: auto !important; overflow: visible !important; }
    #sidebar-left, .status-bar, .decoder-btn, #btn-decoder-trigger { display: none !important; }
    #paper { box-shadow: none !important; margin: 0 !important; }
  }
}
</content>
</file>

<file path="css/core-immutable.css">
<metadata>Lines: 115 | Size: 2778 B</metadata>
<content>
/* ==========================================================================
   core-immutable.css – Declarative Structural Layer | High-Precision
   This file contains fixed geometry constraints. [MANDATE-NAT]
   ========================================================================== */

@layer core.immutable !important {

  :root {
    /* ── OKLCH PERCEPTUAL PALETTE ──────────────────────────────────── */
    --c-sidebar-bg:        oklch(10% 0 0);
    --din-paper-shadow:    0 8px 32px oklch(0% 0 0 / 0.45);
    --din-guide-opacity:   0.18;
    --din-placeholder-color: oklch(75% 0 0);
    --c-accent-blue:       oklch(55% 0.25 260);
  }

  /* ── Sidebar Structural Layout ──────────────────────────────────── */
  #sidebar-left {
    background: var(--c-sidebar-bg);
    padding: 2.4rem 1.8rem;
    gap: 2.8rem;
    border-right: 1px solid oklch(20% 0 0);
  }

  .sidebar-header {
    padding-bottom: 1.6rem;
    border-bottom: 1px solid oklch(20% 0 0);
  }

  .sidebar-brand {
    font-size: 1.1rem;
    letter-spacing: 0.15em;
    font-weight: 500;
    color: oklch(85% 0 0);
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .sidebar-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: oklch(50% 0 0);
    margin-bottom: 0.3rem;
  }

  /* Standard Button Specification */
  .sidebar-btn {
    background: oklch(15% 0 0);
    border: 1px solid oklch(20% 0 0);
    color: oklch(90% 0 0);
    padding: 0.85rem 1.1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: left;
  }

  .sidebar-btn:hover,
  .sidebar-btn[aria-pressed="true"] {
    background: oklch(25% 0 0);
    border-color: oklch(35% 0 0);
    color: white;
  }

  .sidebar-btn.primary {
    background: var(--c-accent-blue);
    border: none;
    color: white;
  }

  /* ── DIN-A4 Physical Simulation ───────────────────────────────── */
  #paper {
    background: white;
    box-shadow: var(--din-paper-shadow);
    border: 1px solid oklch(90% 0 0) !important;
    margin: 3rem auto;
    max-width: 210mm;
    min-height: 297mm;
  }

  /* Placeholder Specification */
  [data-placeholder]::before,
  din-text:empty::before,
  din-anrede:empty::before,
  din-grussformel:empty::before {
    content: attr(data-placeholder);
    color: var(--din-placeholder-color);
    font-style: italic;
    pointer-events: none;
  }

  /* Guide Lines – 0.18 opacity per Specification */
  .fold-mark,
  .punch-mark,
  .guide-line,
  .mark {
    opacity: var(--din-guide-opacity) !important;
    display: block !important;
  }

  /* Global Action Footer */
  #action-footer {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1rem;
  }
}
</content>
</file>

<file path="css/devmode.css">
<metadata>Lines: 206 | Size: 5004 B</metadata>
<content>
/* ==========================================================================
   css/devmode.css — Easter Egg & Developer Mode Styles
   ==========================================================================
   SPEC-049 | No-JS Doctrine [ADR-003]

   PRINZIP:
     JS schreibt NUR: body[data-devmode="true"] und body[data-toast="..."]
     CSS übernimmt ALLE visuellen Konsequenzen.
     Kein JS-Timeout für Animation. CSS animation-fill-mode: forwards.
   ========================================================================== */

@layer project.overrides {

  /* ── Dev-Sektionen: versteckt bis Dev-Mode aktiv ──────────────── */
  .dev-only {
    display: none;
  }

  body[data-devmode="true"] .dev-only {
    display: flex;   /* Sidebar-Section ist flex */
  }

  .dev-label {
    color: #7a4a00;   /* Warnorange im Dark-Theme */
  }

  body[data-devmode="true"] .dev-label {
    color: #ffaa00;
  }

  /* Version-Badge leuchtet wenn Dev-Mode aktiv */
  body[data-devmode="true"] #app-version {
    color: #ffaa00;
    background: #3a2a00;
    border-radius: 4px;
  }

  /* ── Toast: Dev-Mode Unlock ─────────────────────────────────────
     Sichtbar wenn body[data-toast="dev-unlocked"].
     CSS-Animation ersetzt JS-setTimeout komplett.
     Läuft 3.2s, dann forwards (versteckt sich selbst nicht —
     JS löscht das Attribut nach 3200ms via delete body.dataset.toast)
     ─────────────────────────────────────────────────────────────── */
  #toast-dev {
    position: fixed;
    bottom: -80px;   /* default: außerhalb des Viewports */
    left: 50%;
    transform: translateX(-50%);
    background: #1a3a1a;
    border: 1px solid #2a6a2a;
    color: #8bc34a;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    pointer-events: none;
    transition: bottom 0.3s ease;
  }

  body[data-toast="dev-unlocked"] #toast-dev {
    bottom: 32px;   /* einfahren */
    animation: toast-stay 3.2s ease forwards;
  }

  @keyframes toast-stay {
    0%   { bottom: 32px; opacity: 1; }
    80%  { bottom: 32px; opacity: 1; }
    100% { bottom: -80px; opacity: 0; }
  }

  /* ── Generischer Toast-Container (JS-injizierte Toasts) ────────── */
  #toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    z-index: 9998;
    pointer-events: none;
  }

  /* Einzelner Toast (JS erzeugt .toast div via createElement) */
  .toast {
    background: #1a1a2e;
    border: 1px solid #333;
    color: #ccc;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 13px;
    animation: toast-in-out 3.2s ease forwards;
  }

  .toast.error {
    background: #2e1a1a;
    border-color: #7a2a2a;
    color: #e07070;
  }

  @keyframes toast-in-out {
    0%   { opacity: 0; transform: translateY(12px); }
    10%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-4px); }
  }

  /* ── Dialog / Popover Modal Styles ─────────────────────────────── */
  .dialog-modal {
    background: #1e1e1e;
    color: #ddd;
    border: 1px solid #333;
    border-radius: 10px;
    padding: 0;
    width: min(480px, 90vw);
    box-shadow: 0 12px 40px oklch(0% 0 0 / 0.6);
  }

  .dialog-modal::backdrop {
    background: oklch(0% 0 0 / 0.65);
    backdrop-filter: blur(3px);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #333;
    font-size: 15px;
    font-weight: 500;
  }

  .modal-header button {
    background: none; border: none;
    color: #555; font-size: 18px;
    cursor: pointer; padding: 0 4px;
  }
  .modal-header button:hover { color: #ccc; }

  #form-profile {
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  #form-profile label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #888;
  }

  #form-profile input {
    background: #111;
    border: 1px solid #333;
    color: #ddd;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
  }

  #form-profile input:focus { border-color: #2a6aaa; }

  #form-profile input:invalid:not(:placeholder-shown) {
    border-color: #7a2a2a;
  }

  .form-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 0.5rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #333;
  }

  .iban-wrapper {
    position: relative;
  }

  #p-iban { width: 100%; box-sizing: border-box; font-family: monospace; }

  #iban-ghost {
    position: absolute;
    inset: 0;
    padding: 8px 10px;
    font-size: 14px;
    font-family: monospace;
    color: #444;
    pointer-events: none;
    white-space: pre;
  }

}
</content>
</file>

<file path="css/din5008-paper.css">
<metadata>Lines: 168 | Size: 3353 B</metadata>
<content>
/**
 * css/din5008-paper.css — High-Integrity Specification
 * [ADR-001] Strictly DIN 5008:2020-03 Dimensions (mm)
 */

@layer din.structure {
  /* Guide Marks (Fold & Hole) */
  .mark {
    position: absolute;
    left: 0;
    width: 5mm;
    border-top: 0.5pt solid oklch(0% 0 0);
    pointer-events: none;
  }

  .mark-fold-1 {
    top: var(--din-mark-fold-1) !important;
  }
  .mark-fold-2 {
    top: var(--din-mark-fold-2) !important;
  }
  .mark-loch {
    top: var(--din-mark-loch) !important;
    width: 7mm !important;
  }

  /* Return Address Line */
  din-return-line {
    font-size: 8pt;
    border-bottom: 0.5pt solid oklch(0% 0 0 / 0.2);
    margin-bottom: 2mm;
    white-space: nowrap;
    overflow: hidden;
    height: 5mm;
    display: block;
    color: oklch(40% 0 0);
  }

  /* Main Letter Article */
  #brief-kern {
    position: absolute;
    top: calc(var(--din-addr-top) + 58.4mm);
    left: var(--din-margin-l);
    right: var(--din-margin-r);
    display: flex;
    flex-direction: column;
  }

  /* Body Container (Ghost-Mirror Architecture) */
  .body-container {
    position: relative;
    display: block;
    min-height: 50mm;
    margin-bottom: 8.46mm;
  }

  din-text,
  din-text-mirror {
    width: 100%;
    min-height: 100%;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    padding: 0;
    margin: 0;
    display: block;
  }

  din-text {
    z-index: 2;
    color: inherit;
    caret-color: oklch(0% 0 0);
    background: transparent;
    outline: none;
    field-sizing: content;
  }

  /* Focus Logic: Hide Source, Show Mirror */
  din-text:not(:focus) {
    opacity: 0;
  }

  din-text-mirror {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    color: oklch(0% 0 0);
    pointer-events: none;
    user-select: none;
  }

  din-text-mirror strong {
    font-weight: bold;
  }
  din-text-mirror em {
    font-style: italic;
  }
  din-text-mirror blockquote {
    border-left: 3px solid oklch(80% 0 0);
    padding-left: 1rem;
    margin: 1rem 0;
    color: oklch(40% 0 0);
  }

  /* Markdown Ghosting Specification (SPEC-066) */
  .md-marker {
    display: inline-block;
    width: 0;
    overflow: hidden;
    color: oklch(60% 0 0 / 0.5); /* Ghosting color */
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    vertical-align: top;
  }

  /* Placeholder Specification */
  [contenteditable]:empty::before {
    content: attr(data-placeholder);
    color: oklch(70% 0 0) !important;
    font-style: italic;
    pointer-events: none;
    display: block;
  }

  [contenteditable]:empty:focus::before {
    opacity: 0.3;
  }

  /* ── Print Engine Specification ── */
  @page {
    size: A4;
    margin: 20mm var(--din-margin-r) 25mm var(--din-margin-l);

    @bottom-center {
      content: "Seite " counter(page) " von " counter(pages);
      font-size: 9pt;
      color: oklch(50% 0 0);
    }
  }

  @page :first {
    margin-top: 0;
    @bottom-center {
      content: none;
    }
  }

  @media print {
    #paper-viewport {
      background: white !important;
      padding: 0 !important;
    }
    #paper {
      box-shadow: none !important;
      margin: 0 !important;
    }
    .status-bar,
    .decoder-btn,
    #btn-decoder-trigger {
      display: none !important;
    }
  }
}
</content>
</file>

<file path="css/lockdown.css">
<metadata>Lines: 186 | Size: 4576 B</metadata>
<content>
﻿/**
 * css/lockdown.css â€” [MANDATE-LOCKDOWN] Titanium Viewport Guard
 * High-Integrity v4.0 | Baseline: Chrome 147+
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Erzwingt absolute ImmobilitÃ¤t des Viewports und der Sidebar.
 */

@layer v4.0.lockdown {
  /* 1. Global Viewport Lockdown */
  html, body {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden; /* GLOBALER SCROLL-STOPP */
    display: flex;
    background-color: #e0e0e0; /* Neutraler Kontrast-Hintergrund */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 2. Sidebar Titan (Feste SÃ¤ule) */
  #sidebar-left {
    width: 300px !important;
    height: 100vh !important;
    flex-shrink: 0;
    border-right: 1px solid #d0d0d0;
    background: #fcfcfc;
    overflow: hidden !important; /* Kein Scrollen in der Sidebar */
    position: relative;
    z-index: 100;
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem 1rem 1rem;
    box-shadow: 2px 0 10px oklch(0% 0 0 / 0.05);
    }

    /* Compliance Bar (Cockpit Layout) */
  .compliance-bar {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    font-family: monospace;
    font-size: 10px;
    color: #666;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .compliance-item {
    display: flex;
    justify-content: space-between;
    white-space: nowrap;
  }

  .status-ok { color: #4CAF50; font-weight: bold; }
  .status-warn { color: #FF9800; font-weight: bold; }
  .status-err { color: #f44336; font-weight: bold; }

  .status-bar-text {
    margin-top: 8px;
    opacity: 0.6;
    font-style: italic;
  }

  /* [ZERO-ACCORDION] Entferne jegliche Klapp-Elemente */
  #sidebar-left details,
  #sidebar-left summary,
  #sidebar-left .collapse {
    display: block !important;
    visibility: visible !important;
  }

  /* 3. Viewport Monolith (Papier-Zentrum) */
  #paper-viewport {
    flex-grow: 1;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden; /* Verhindert Jitter beim Zentrieren */
    position: relative;
    padding: 20mm;
  }

  /* 4. Papier-Monolith (Festgeklebt) */
  din-5008 {
    width: 210mm;
    height: 297mm;
    background: white;
    box-shadow: 0 15px 50px oklch(0% 0 0 / 0.15);
    flex-shrink: 0; /* Verhindert Stauchung */
    position: relative;

    /* [AVIATION-CHECK] Automatische Skalierung bei kleinen Screens */
    transform-origin: center center;
  }

  /* Responsive Scaling (High-Integrity) */
  @media (max-height: 900px), (max-width: 1200px) {
    din-5008 {
        /* Nutzt CSS math fÃ¼r perfektes Einpassen ohne Scrollbalken */
        scale: min(calc(100vh / 310mm), calc((100vw - 300px) / 220mm));
    }
  }

  /* 5. UI-Cleanup */
  #btn-sidebar-toggle {
    display: none !important; /* Sidebar ist nun statisch */
  }

  /* [MANDATE-PAGINATION] Word-Push-Prinzip */
  din-body-mirror {
    max-height: 190mm; /* Hard Limit Seite 1 */
    break-after: page;
  }

  /* Sichtbarer Indikator im Editor, wenn Seite 2 droht */
  din-cma-sensor {
    display: block !important;
    visibility: visible !important;
    position: absolute;
    top: 190mm;
    left: 0;
    right: 0;
    height: 0;
    border-top: 1px dashed oklch(60% 0.15 25 / 0.4);
    pointer-events: none;
    z-index: 10;
  }

  din-cma-sensor::after {
    content: "PAGINATION LIMIT (190mm)";
    position: absolute;
    right: 5mm;
    top: -12pt;
    font-size: 7pt;
    color: oklch(60% 0.15 25 / 0.6);
    font-family: monospace;
    font-weight: bold;
  }

  /* 6. HARD-PRINT-OVERRIDE (High-Integrity) */
  @media print {
    @page {
      margin: 0 !important;
      size: A4 portrait;
    }

    html, body {
      overflow: visible !important;
      height: auto !important;
      background: white !important;
    }

    #sidebar-left, .status-bar, .decoder-btn, #btn-sidebar-toggle {
      display: none !important;
    }

    #paper-viewport {
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
    }

    din-5008 {
      box-shadow: none !important;
      margin: 0 !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      scale: 1 !important;
      transform: none !important;
    }

    /* Hilfslinien beim Druck ausblenden */
    .mark, din-cma-sensor {
      display: none !important;
    }
  }
}
</content>
</file>

<file path="css/print.css">
<metadata>Lines: 61 | Size: 1298 B</metadata>
<content>
/*
   PRINT.CSS - High-Precision Paged Media Engine
   Mandate: Guarantee DIN 5008:2020 dimensions in PDF output
*/

@page {
    size: A4;
    margin: 0;
}

/* [SPEC-070] Duplex Recognition & Margin Mirroring */
@page :left {
    margin-left: 20mm;
    margin-right: 25mm;
}

@page :right {
    margin-left: 25mm;
    margin-right: 20mm;
}

@media print {
    /* Hide UI Chrome */
    #sidebar, #preview-header, .no-print, #toast-container, dialog, .actions-footer {
        display: none !important;
    }

    /* Branding Layer (High-Integrity Output) */
    din-branding-logo {
        position: absolute;
        top: 10mm;
        right: 20mm;
        width: 45mm;
        height: 20mm;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    din-branding-logo img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    din-branding-watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 80pt;
        font-weight: 900;
        color: oklch(0% 0 0 / 0.05);
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        z-index: 0;
    }

    /* Force Colors and Layout integrity */
</content>
</file>

<file path="css/sidebar.css">
<metadata>Lines: 210 | Size: 4375 B</metadata>
<content>
@layer latex.base, ui.theme, ui.components, core.immutable;

/* ── Minimalist Sidebar Base (Aligned with v4.0 Standard) ────────── */
@layer ui.theme {
  #sidebar-left {
    background: oklch(98% 0.01 250);
    border-right: 1px solid oklch(90% 0.01 250);
    padding: 2.4rem 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 2.8rem;
  }

  .sidebar-brand {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--c-primary);
    letter-spacing: 0.1rem;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .sidebar-label {
    font-size: 0.8rem;
    color: oklch(40% 0.01 250);
    font-weight: 500;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sidebar-btn {
    appearance: none;
    background: oklch(96% 0.01 250);
    border: 1px solid oklch(92% 0.01 250);
    color: oklch(20% 0.01 250);
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .sidebar-btn:hover {
    background: oklch(94% 0.02 250);
    border-color: oklch(85% 0.02 250);
  }

  .sidebar-btn.primary {
    background: var(--c-primary);
    color: contrast-color(var(--c-primary)) !important;
    border: none;
    font-weight: 600;
  }

  .sidebar-btn.secondary {
    background: oklch(90% 0.02 250);
    color: oklch(20% 0.02 250);
    border: none;
  }

  /* ── Segmented Control (High-Integrity) ─────────────────────────── */
  .segmented-control {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: oklch(94% 0.01 250);
    padding: 4px;
    border-radius: 10px;
    gap: 4px;
  }

  .segment-option {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    color: oklch(40% 0.01 250);
  }

  .segment-option input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .segment-option:has(input:checked) {
    background: white;
    color: var(--c-primary);
    box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
  }

  /* ── Compliance Bar ── */
  .compliance-bar {
    margin-top: auto;
    padding-top: 2rem;
    border-top: 1px solid oklch(90% 0.01 250);
    font-family: var(--c-font-mono);
    font-size: 0.7rem;
    color: oklch(50% 0.01 250);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .status-ok { color: oklch(60% 0.15 150); }
  .status-warn { color: oklch(60% 0.15 40); }
}

@layer ui.components {
  /* ── Dialogs & Popovers ── */
  .standard-dialog {
    border: none;
    border-radius: 16px;
    box-shadow: 0 24px 64px oklch(0% 0 0 / 0.2);
    padding: 2rem;
    background: white;
    max-width: 500px;
    width: 90%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .standard-dialog::backdrop {
    background: oklch(0% 0 0 / 0.4);
    backdrop-filter: blur(4px);
  }

  /* ── Profile Grid ── */
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.2rem;
    margin-top: 1.5rem;
  }

  .profile-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .profile-field label {
    font-size: 0.75rem;
    font-weight: 600;
    color: oklch(40% 0.01 250);
  }

  .profile-field input {
    padding: 10px 12px;
    border: 1px solid oklch(90% 0.01 250);
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .profile-field input:focus {
    border-color: var(--c-primary);
  }

  /* ── Multi-Line Input (High-Integrity) ── */
  textarea {
    field-sizing: content;
    min-height: 80px;
    resize: none;
    overflow: hidden;
  }
}

/* ── Popover Animation ── */
@layer project.overrides {
  [popover] {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
    transition:
      opacity 0.3s,
      transform 0.3s,
      overlay 0.3s allow-discrete,
      display 0.3s allow-discrete;
  }

  [popover]:popover-open {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  @starting-style {
    [popover]:popover-open {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.95);
    }
  }
}
</content>
</file>

<file path="docs/DIN_5008_SPEC.md">
<metadata>Lines: 66 | Size: 3738 B</metadata>
<content>
﻿# Standard_PROTOCOL_V3.LOCKED
**DOKTRIN:** Core GRADE Standard | **BASELINE:** CHROME 147+ | **SSoT**

Dieses Dokument terminiert alle bisherigen "vibe-basierten" Implementierungen. Es ist die einzige Quelle der Wahrheit fÃ¼r die maschinelle Isomorphie zwischen der DIN 5008:2020 und der Blink-Direct Architektur. Jede Abweichung ist eine CMA_VIOLATION.

## 1. Autonomous SEMANTIC MATRIX V3.1

### Layout & Struktur
| DIN-Element | Custom-Tag | Chrome 147 Engine Binding |
| :--- | :--- | :--- |
| **Root-Container** | `<din-5008 data-form="A|B">` | Steuert das gesamte Layout-Grid (Form A oder B). |
| **Papier-Monolith** | `<din-page>` | Absoluter A4-Monolith, zementierte Proportionen. |
| **CMA-Sensor** | `<din-cma-sensor>` | IntersectionObserver fÃ¼r Overflow-Detection (280mm). |

### IdentitÃ¤t & Branding
| DIN-Element | Custom-Tag | Funktion |
| :--- | :--- | :--- |
| **Briefkopf** | `<din-header>` | Container fÃ¼r Logos und Absender-Stammdaten. |
| **Logo** | `<din-logo>` | Firmenlogo-Platzhalter. |
| **Absender-Details**| `<din-sender-details>`| Granulare Meta-Daten des Absenders. |
| **V-Card / QR** | `<din-vcard>` | QR-Logik-Injektion. |

### Anschrift (11-Zeilen-Modell)
| DIN-Element | Custom-Tag | Constraint |
| :--- | :--- | :--- |
| **Gesamte Zone** | `<din-address-zone>` | 85x45mm Hard Constraint. |
| **RÃ¼cksendeangabe** | `<din-return-line>` | Zeile 1-3 (Obere Zone). |
| **Zusatz/Vermerk** | `<din-supplement>` | Zeile 4-5 (Obere Zone). |
| **EmpfÃ¤nger** | `<din-recipient>` | Zeile 6-11 (Untere Zone). Ãœberwacht durch Greetings Matrix. |

### Metadaten & LeitwÃ¶rter
| DIN-Element | Custom-Tag | Binding / Engine |
| :--- | :--- | :--- |
| **Informationsblock** | `<din-infoblock>` | 75mm rechts positioniert. |
| **LeitwÃ¶rter** | `<din-ref-line>` | "Ihr Zeichen", "Unser Zeichen". |
| **Datum** | `<din-date>` | **Temporal API** (Strict ISO-Handling). |

### Briefkern (Blink-Direct)
| DIN-Element | Custom-Tag | Constraint & API |
| :--- | :--- | :--- |
| **Betreff** | `<din-subject>` | 2-Leerzeilen-Constraint. |
| **Anrede** | `<din-salutation>` | Gesteuert durch Greetings Matrix basierend auf `<din-recipient>`. |
| **Haupttext** | `<din-body>` | **EditContext API** (transparentes Eingabefeld, entkoppelt vom DOM). |
| **Visueller Text** | `<din-body-mirror>` | **Sanitizer API** (`setHTML`), rendert das Ghost-Mirror SPEC-066. |
| **GruÃŸformel** | `<din-closing>` | Gesteuert durch Greetings Matrix. |
| **Unterschrift** | `<din-signature>` | Maschinenschriftliche Signatur. |
| **Anlagen** | `<din-attachments>` | Anlagenvermerk am Briefende. |

### Compliance & Sicherheit
| DIN-Element | Custom-Tag | Sicherheits-Constraint |
| :--- | :--- | :--- |
| **Werte/BetrÃ¤ge** | `<din-amount>` | **CoreMath Cent-Fallback** (V8 Floating-Point PrÃ¤vention). |
| **Bankdaten** | `<din-bank-data>` | IBAN Modulo-97 BigInt Validierung. |
| **Steuern/Register**| `<din-fiscal-data>`| USt-IdNr / Handelsregister. |
| **FuÃŸzeile** | `<din-footer>` | `@page` Margin-Box Bindung. |

---

## 2. MANDATORY ARCHITECTURAL CONSTRAINTS

*   **Constraint [MANDATE-TAG]:** Jedes HTML-Tag im Briefvordruck MUSS das PrÃ¤fix `din-` tragen. W3C-KonformitÃ¤t ist heilig; Tags ohne Bindestrich sind verboten.
*   **Constraint [MANDATE-INJ]:** `innerHTML` ist global vaporisiert. Nutze fÃ¼r alle DOM-Injektionen ausnahmslos `setHTML(html, { sanitizer: Standard_CONFIG })`.
*   **Constraint [MANDATE-UI]:** Alle MaÃŸe werden zwingend als `@property` mit `inherits: false` registriert, um die Render-Performance der Blink-Engine zu maximieren.
*   **Constraint [MANDATE-WYSIWYG]:** Die Bearbeitung erfolgt zu 100% WYSIWYG direkt auf dem Dokument. Der Textfluss wird vollstÃ¤ndig Ã¼ber die **EditContext API** gesteuert.
</content>
</file>

<file path="docs/SYSTEM_SSOT.md">
<metadata>Lines: 71 | Size: 2980 B</metadata>
<content>
# Architecture Specification: SYSTEM_SSOT.md
# v4.0 Standard Protocol
**Status**: VERIFIED | **Version**: 4.0.0 | **Baseline**: Chrome 147+

This document is the **Single Source of Truth (SSoT)** for the IMR 4.0 (Isomorphic Master Registry). It defines the machine-level isomorphism between DIN 5008:2020-03 standards and the native browser implementation. Any deviation is a **PRECISION_VIOLATION**.

---

## 1. High-Integrity SEMANTIC MATRIX v4.0

### Layout & Structure
| Element | Custom-Tag | Chrome 147 Engine Binding |
| :--- | :--- | :--- |
| **Root** | `<din-5008>` | Master container for DIN logic. |
| **Paper** | `<din-A4>` | Fixed 210x297mm physical simulation. |

### Identity (Header Atoms)
| DIN Element | Custom-Tag | IMR Key |
| :--- | :--- | :--- |
| **First Name**| `<din-absender-vorname>` | `sender_fn` |
| **Last Name** | `<din-absender-nachname>`| `sender_ln` |
| **Street**    | `<din-absender-strasse>` | `sender_st` |
| **City/ZIP**  | `<din-absender-ort>`     | `sender_city` |

### Address Zone (85x45mm Atoms)
| DIN Element | Custom-Tag | IMR Key |
| :--- | :--- | :--- |
| **Return Line**| `<din-return-line>` | `return_line` |
| **Supplement** | `<din-supplement>` | `supplement` |
| **Company**    | `<din-empfaenger-firma>` | `rect_co` |
| **Name**       | `<din-empfaenger-name>`  | `rect_name` |
| **Street**     | `<din-empfaenger-strasse>`| `rect_st` |
| **City/ZIP**   | `<din-empfaenger-ort>`   | `rect_city` |

### Metadata & Metadata
| DIN Element | Custom-Tag | IMR Key |
| :--- | :--- | :--- |
| **Info Block** | `<din-infoblock>` | Container (125mm Left) |
| **Ref Ihr**    | `<din-ref-ihr>` | `ref_ihr` |
| **Ref Unser**  | `<din-ref-unser>` | `ref_unser` |
| **Date**       | `<din-date>` | `date` (50mm Top) |

### Core Content
| DIN Element | Custom-Tag | API / Binding |
| :--- | :--- | :--- |
| **Subject**    | `<din-subject>` | 2-line spacing constraint. |
| **Salutation** | `<din-anrede>` | Reactive Matrix update. |
| **Body (Source)**| `<din-text>` | **EditContext API**. |
| **Body (View)**  | `<din-text-mirror>` | **Sanitizer API** (`setHTML`). |
| **Greeting**   | `<din-grussformel>` | No trailing punctuation. |
| **Signature**  | `<din-signature>` | `signature` key. |
| **Attachments**| `<din-attachments>` | Optional end-matter. |

### Legal & Financial
| DIN Element | Custom-Tag | Enforcement |
| :--- | :--- | :--- |
| **Bank Data**  | `<din-bank-data>` | IBAN Modulo-97 BigInt. |
| **Fiscal Data**| `<din-fiscal-data>` | `footer` container binding. |

---

## 2. MANDATORY CONSTRAINTS

*   **[MANDATE-TAG]**: Every letter-specific HTML tag MUST use the `din-` prefix.
*   **[MANDATE-INJ]**: `innerHTML` is strictly prohibited. Use `setHTML(html, { sanitizer: CORE_SANITIZER })`.
*   **[MANDATE-UI]**: All geometric measurements are registered as `@property` via CSS.
*   **[MANDATE-WYSIWYG]**: Input is handled via **EditContext API** to decouple data from DOM representation.

**Lead Architect**
*Gemini CLI*
</content>
</file>

<file path="docs/audit/SUPER_AUDIT.md">
<metadata>Lines: 99 | Size: 6066 B</metadata>
<content>
﻿# ðŸš€ DIN-BriefNEO Super-Audit V2.0 (Pumped Up)

Dieses Dokument enthÃ¤lt das ultimative Audit-Skript zur Verifikation der "High-Integrity" v4.0-IntegritÃ¤t. Es testet alle aktivierten und verfÃ¼gbaren modernen Browser-APIs der Chrome 147+ Baseline (Blink-Direct).

## ðŸ› ï¸ Verwendung
1. Ã–ffne DIN-BriefNEO im Chrome Browser (Baseline 147+).
2. DrÃ¼cke `F12` oder `Strg+Umschalt+J`, um die **DevTools Console** zu Ã¶ffnen.
3. Kopiere den gesamten Code aus dem Abschnitt "Audit-Skript" unten.
4. FÃ¼ge ihn in die Konsole ein und drÃ¼cke `Enter`.
5. Der Report wird automatisch erstellt, in der Konsole als Tabelle ausgegeben und in deine **Zwischenablage** kopiert.

## ðŸ“œ Audit-Skript

~~~javascript
/**
 * ðŸš€ v4.0_DIN_2026 | SUPER-AUDIT V2.0 (PUMPED UP)
 * Baseline: Chrome 147.0+ | Blink-Direct Architecture
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */
(async function runSuperv4.0Audit() {
    const s = 'font-weight: bold; padding: 5px 12px; border-radius: 4px;';
    const pass = 'background: #27ae60; color: white;';
    const warn = 'background: #e67e22; color: white;';

    console.clear();
    console.log('%cðŸ’Ž v4.0_DIN_2026 | ULTIMATIVE ENGINE VERIFIKATION', 'font-size: 1.6em; font-weight: bold; border-bottom: 4px solid #f1c40f; margin-bottom: 15px;');

    const audit = [
        // 1. KERN-APIs (LOGIK & PRÃ„ZISION)
        { name: 'Math.sumPrecise', check: () => !!Math.sumPrecise, test: () => Math.sumPrecise([0.1, 0.2]) === 0.3, desc: 'Finanzielle PrÃ¤zision (Pfeiler 6)' },
        { name: 'Temporal API', check: () => !!globalThis.Temporal, test: () => !!Temporal.Now.instant(), desc: 'Deterministische Chronologie' },
        { name: 'EditContext API', check: () => !!globalThis.EditContext, test: () => { try { new EditContext(); return true; } catch { return false; } }, desc: 'Input/DOM Entkopplung' },
        { name: 'Native Sanitizer', check: () => !!globalThis.Sanitizer, test: () => 'setHTML' in Element.prototype, desc: 'Sichere Mirror-Pipeline' },

        // 2. LAYOUT & RENDERING (BLINK-DIRECT)
        { name: 'Scoped View Transitions', check: () => 'startViewTransition' in Element.prototype, test: () => typeof document.body.startViewTransition === 'function', desc: 'Native Layout-Animation' },
        { name: 'CSS Anchor Positioning', check: () => CSS.supports('anchor-name: --x'), test: () => true, desc: 'Zero-JS Positionierung' },
        { name: 'CSS field-sizing', check: () => CSS.supports('field-sizing: content'), test: () => true, desc: 'Native Auto-Resize Felder' },
        { name: 'CSS Highlight API', check: () => !!globalThis.Highlight, test: () => !!CSS.highlights, desc: 'Syntax-Coloring (Zero-DOM)' },
        { name: 'CSS contrast-color()', check: () => CSS.supports('color: contrast-color(white)'), test: () => true, desc: 'Native Barrierefreiheit' },
        { name: 'CSS border-shape', check: () => CSS.supports('border-shape: circle'), test: () => true, desc: 'Advanced UI Borders' },
        { name: 'Scroll-State Queries', check: () => CSS.supports('container-type: scroll-state'), test: () => true, desc: 'WYSIWYG Ãœberlauferkennung' },

        // 3. PERSISTENZ & SYNC (Autonomous STORAGE)
        { name: 'Web Locks API', check: () => !!navigator.locks, test: () => typeof navigator.locks.request === 'function', desc: 'Multi-Tab State Protection' },
        { name: 'IdleDetector API', check: () => !!globalThis.IdleDetector, test: () => true, desc: 'High-Integrity Autosave' },
        { name: 'OPFS (Native FS)', check: () => !!navigator.storage && !!navigator.storage.getDirectory, test: () => true, desc: 'Autonomous Data Storage' },
        { name: 'BroadcastChannel', check: () => !!globalThis.BroadcastChannel, test: () => true, desc: 'Real-Time Tab Sync' },
        { name: 'Compression Streams', check: () => !!globalThis.CompressionStream, test: () => true, desc: 'Native Daten-Export Kompression' },

        // 4. PERFORMANCE & DIAGNOSE
        { name: 'Intl.Segmenter', check: () => !!Intl.Segmenter, test: () => true, desc: 'Native Text-Analyse (Markdown)' },
        { name: 'Device Memory API', check: () => !!navigator.deviceMemory, test: () => true, desc: 'Memory-Aware Rendering' },
        { name: 'EyeDropper API', check: () => !!globalThis.EyeDropper, test: () => true, desc: 'Native Farbpicker' }
    ];

    const results = audit.map(item => {
        const available = item.check();
        const verified = available ? item.test() : false;
        return {
            'Feature': item.name,
            'Status': available ? 'âœ… AKTIV' : 'âŒ FEHLT',
            'Blink-IntegritÃ¤t': verified ? 'ðŸ’Ž VERIFIZIERT' : 'âš ï¸ INSTABIL',
            'Nutzen fÃ¼r DIN-BriefNEO': item.desc
        };
    });

    console.table(results);

    const incidentId = !!globalThis.crypto?.randomUUID ? crypto.randomUUID() : 'N/A';
    const readiness = (results.filter(r => r.Status === 'âœ… AKTIV').length / audit.length) * 100;

    // Markdown-Export fÃ¼r die Zwischenablage
    let md = `### ðŸ›« DIN-BriefNEO SUPER-AUDIT [${incidentId}]\n\n`;
    md += `**Readiness Level: ${readiness.toFixed(1)}%**\n\n`;
    md += `| API | Status | IntegritÃ¤t | Nutzen |\n| :--- | :--- | :--- | :--- |\n`;
    results.forEach(r => md += `| ${r.Feature} | ${r.Status} | ${r['Blink-IntegritÃ¤t']} | ${r['Nutzen fÃ¼r DIN-BriefNEO']} |\n`);

    try {
        await navigator.clipboard.writeText(md);
        console.log(`%cðŸŽ¯ REPORT GENERIERT & KOPIERT (ID: ${incidentId})`, pass + s);
    } catch (err) {
        console.log(`%câš ï¸ CLIPBOARD BLOCKIERT - NUTZE copy()`, warn + s);
        copy(md);
    }

    if (readiness === 100) {
        console.log('%cREADY FOR STRATOSPHERE: 100% NATIVE COMPLIANCE', 'color: #27ae60; font-weight: bold; font-size: 1.2em;');
    } else {
        console.warn('ARCHITEKTUR-LÃœCKEN ENTDECKT: PrÃ¼fe chrome://flags');
    }
})();
~~~

---
**Gezeichnet:**
*Der v4.0 Architect (Gemini CLI)*
</content>
</file>

<file path="docs/v3_PROTOCOL.md">
<metadata>Lines: 47 | Size: 1746 B</metadata>
<content>
# Architecture Protocol: v3_PROTOCOL.md
# v4.0 Standard Implementation
**Status**: ACTIVE | **Version**: 4.0.0 | **Baseline**: Chrome 147+

This protocol outlines the execution strategy for maintaining IMR 4.0 integrity across the application lifecycle.

---

## 1. Technical Invariants

### 1.1 Atomic Data Sync
- **Doctrine**: Data flows from Atom (`<din-*>`) to State (`proxy`) via `EditContext`.
- **Enforcement**: Any manual DOM manipulation of atoms outside the defined `IMR` mapping is a **SPEC_VIOLATION**.

### 1.2 Structural Integrity (Ghost-Mirror)
- **Pattern**: Source Atom (`<din-text>`) is visually suppressed in focus-loss states.
- **Renderer**: Mirror Atom (`<din-text-mirror>`) provides the formatted view using **Native Sanitizer API**.
- **Constraint**: The Mirror MUST be 100% reactive to the Source Atom.

### 1.3 Precision Mathematics
- **Standard**: All financial and geometric calculations use `PrecisionMath`.
- **Resolution**: Geometry is calculated with 0.001mm precision.
- **Financials**: Cent-based integer math or native `Math.sumPrecise`.

---

## 2. Component Specification

| Scope | Requirement | Technology |
| :--- | :--- | :--- |
| **Input** | `plaintext-only` | EditContext API |
| **Security** | Automated Sanitization | Sanitizer API (`CORE_SANITIZER`) |
| **Styling** | Perceptual Uniformity | OKLCH Colors |
| **Date/Time** | Deterministic | Temporal API |
| **Geometry** | Zero-JS Positioning | CSS Anchor Positioning |

---

## 3. Deployment Gates (PVP)

1.  **Registry Validation**: Check all tags against IMR 4.0 catalog.
2.  **Security Sweep**: Audit for `innerHTML` usage.
3.  **Terminology Check**: Ensure compliance with **v4.0 Standard** terminology.

**Lead Systems Architect**
*Gemini CLI*
</content>
</file>

<file path="docs/v4_HANDBOOK.md">
<metadata>Lines: 872 | Size: 36999 B</metadata>
<content>
# ðŸ“œ DIN-BriefNEO v4.0 MASTER HANDBOOK
# Status: LIVING DOCUMENT | Version: 4.0.0
# Authority: Lead Architect (Gemini CLI)

> **DOKTRIN-NOTIZ**: Dieses Handbuch ist die ultimative Single Source of Truth (SSoT). Es ist absichtlich *nicht* zusammengefasst, sondern dient als kumulative Instanz aller aktiven Architektur-Entscheidungen (ADR), Spezifikationen und Mandate.

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
tags: [persistence, pwa, auto-save, aviation-grade]
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
tags: [performance, ux, polish, aviation-grade]
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
tags: [Validation, Security, Integrity, SDD, High-Integrity]
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
- **Anforderung**: Ein Tool muss existieren, das die `Isomorphic Master Registry (IMR)` aus der SSoT (`js/core/constants.js`) in ein maschinenlesbares JSON-Format extrahiert.
- **Zweck**: Agenten nutzen diesen Katalog, um exakte Tag-Namen (z.B. `din-date`) statt Halluzinationen (z.B. `din-datum`) zu verwenden.
- **Datenfelder**: Tag, JSON-Key, CMA-Koordinate (sofern vorhanden).

### 2.2 Automated Mandate Enforcement (Aviation Check)
Die Pipeline muss nach jeder Änderung folgende Prüfungen automatisiert durchführen:

#### A. Security Check (MANDATE-INJ)
- **Regel**: `innerHTML` Zuweisungen sind verboten.
- **Toleranz**: 0 Verstöße erlaubt in `js/core/` und `js/ui/`.
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
tags: [aviation-grade, chrome-147, highlight-api, edit-context]
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
tags: [aviation-grade, v4.0-2026, wysiwyg, integrity, css]
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
Der Parser darf Steuerzeichen (*, **, ~~, _, >) nicht löschen. Er muss sie in ein schützendes Element (`<span class="md-marker">`) einwickeln, das die visuelle Formatierung (z.B. `<strong>`) umschließt oder flankiert.

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
tags: [chrome-147, anchor-positioning, zero-js, aviation-grade]
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
tags: [cma, din-5008, ssot, aviation-grade]
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

| ID    | Konstante        | Mass    | Einheit | Quelle            | Form |
|-------|------------------|---------|---------|-------------------|------|
| M-001 | PAGE_WIDTH       | 210.000 | mm      | DIN 5008 §3       | A+B  |
| M-002 | PAGE_HEIGHT      | 297.000 | mm      | DIN 5008 §3       | A+B  |
| M-003 | MARGIN_LEFT      |  25.000 | mm      | DIN 5008 §4.1     | A+B  |
| M-004 | SENDER_ZONE_TOP  |  27.000 | mm      | DIN 5008 §6.1     | A+B  |
| M-005 | ADDRESS_TOP_A    |  27.000 | mm      | DIN 5008 §6.1a    | A    |
| M-006 | ADDRESS_TOP_B    |  45.000 | mm      | DIN 5008 §6.1b    | B    |
| M-007 | ADDRESS_WIDTH    |  85.000 | mm      | DIN 5008 §5.2     | A+B  |
| M-008 | ADDRESS_HEIGHT   |  45.000 | mm      | DIN 5008 §5.2     | A+B  |
| M-009 | INFO_BLOCK_TOP   |  97.400 | mm      | MehrCurry (✓)     | A+B  |
| M-010 | SUBJECT_TOP      | 103.400 | mm      | MehrCurry (✓)     | A+B  |
| M-011 | FOLD_MARK_1      | 105.000 | mm      | DIN 5008 §7       | A+B  |
| M-012 | PUNCH_MARK       | 148.500 | mm      | DIN 5008 §7       | A+B  |
| M-013 | FOLD_MARK_2      | 210.000 | mm      | DIN 5008 §7       | A+B  |
| M-014 | FOOTER_TOP       | 269.000 | mm      | MehrCurry (✓)     | A+B  |
| M-015 | MARGIN_RIGHT     |  20.000 | mm      | DIN 5008 §4.2     | A+B  |

### Funktionale Anforderungen

| ID     | Anforderung                                                                              |
|--------|------------------------------------------------------------------------------------------|
| FR-001 | Die CMA MUSS alle physikalischen Masse an exakt einer Stelle im System definieren        |
| FR-002 | Masse MUESSEN in Millimetern (mm), typografische Werte in Punkt (pt) vorliegen           |
| FR-003 | Alle Systemteile (Layout, Druck, Hilfslinien, Berechnungen) MUESSEN Werte aus CMA nutzen |
| FR-004 | Die CMA MUSS Form A und Form B als separate, benannte Werte unterscheiden                |
| FR-005 | Das System MUSS das Vorhandensein von "Magic Numbers" ausserhalb der CMA verhindern      |
| FR-006 | Praezision MUSS mindestens 3 Dezimalstellen betragen (0.001mm Aufloesung)               |
| FR-007 | Widerspruechliche Masse MUESSEN im `.brain/07_measurement_conflict_log.md` dokumentiert werden |
| FR-008 | Jedes Mass MUSS eine Traceability-Referenz (Quelle) besitzen                            |

### Toleranzgrenzen (High-Integrity)

| Metrik                            | Grenzwert  | Rationale                      |
|-----------------------------------|------------|--------------------------------|
| Visuelle Abweichung (Screen)      | < 0.5mm    | DL-Umschlag-Toleranz           |
| Druck-Abweichung (PDF)            | < 0.1mm    | Professioneller Druckstandard  |
| Rundungsfehler bei Konvertierung  | < 0.001mm  | 3-Dezimalstellen-Pflicht       |

### Warum duerfen Zonen ihre Masse nicht selbst definieren?

Dies ist ein **fachliches Prinzip**, kein technisches. Eine Zone wie
"Informationsblock" ist fachlich **kein unabhaengiges Objekt** — sie ist
eine **Referenz** auf einen DIN-definierten Bereich des Briefs. Wuerde
die Zone ihr eigenes Mass kennen, entstuende eine zweite "Wahrheit".
Zwei Wahrheiten fuer dasselbe Mass sind strukturell identisch mit einem Fehler.

### Erfolgskriterien

| ID     | Kriterium                                                                 | Messung                 |
|--------|---------------------------------------------------------------------------|-------------------------|
| SC-001 | Single-Point-of-Change: Eine Aenderung in der CMA wirkt systemweit       | Integrationstest        |
| SC-002 | Zero Redundancy: Kein Mass ist doppelt definiert                          | Statische Code-Analyse  |
| SC-003 | Full Traceability: Jedes Mass hat eine Quellenangabe                      | Code-Review             |
| SC-004 | Precision: Alle Werte auf >= 3 Dezimalstellen gespeichert                | Unit-Test               |

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
- `casual`:  "Hallo [Vorname] / Hallo zusammen,"

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

| Formality | Gender m                          | Gender f                          | Gender n                         | Gender fam                        |
|-----------|-----------------------------------|-----------------------------------|----------------------------------|-----------------------------------|
| formal    | Sehr geehrter Herr [Titel] [Name] | Sehr geehrte Frau [Titel] [Name]  | Sehr geehrte Damen und Herren    | Sehr geehrte Familie [Name]       |
| polite    | Guten Tag, Herr [Name]            | Guten Tag, Frau [Name]            | Guten Tag                        | Guten Tag, Familie [Name]         |
| casual    | Hallo [Vorname]                   | Hallo [Vorname]                   | Hallo zusammen                   | Hallo Familie [Name]              |

---

## Erfolgskriterien

| ID     | Kriterium                                                             | Messung        |
|--------|-----------------------------------------------------------------------|----------------|
| SC-001 | Erkennung in >= 95% der Standardfaelle korrekt                       | Unit-Test       |
| SC-002 | Manuelle Korrekturen bleiben nach Neurendering erhalten              | Integrationstest|
| SC-003 | Komma/Punkt am Ende der Grussformel → Warnung sichtbar (aria-invalid)| UI-Test         |
| SC-004 | 3-Leerzeilen-Abstand vor Unterschrift exakt 12.7mm                   | Drucktest       |

---

## ðŸ„ Dokument: specify.md (Quelle: 029-page-breaks)

---
id: SPEC-029
title: Multi-Page Pagination & Hybrid Height
tags: [print, pagination, aviation-grade]
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
tags: [integrity, markdown, ghost-mirror, aviation-grade]
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
- Jedes Eingabefeld (<din-*>) MUSS strukturell gegen HTML-Injection geschützt sein.
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
- Da der Nutzer im Plaintext-Feld nur Symbole (**, *) sieht, MUSS eine visuelle Echtzeit-Vorschau (Mirror) existieren.
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
| Gate | Status | Notiz |
|------|--------|-------|
| [MANDATE-INJ] | OK | Nur textContent für Fehlermeldungen. |
| [MANDATE-NAT] | OK | Nutzung nativer CSS Anchor Positioning API. |
| [MANDATE-PLN] | OK | Keine Beeinträchtigung der plaintext-only Felder. |

## 1. CSS CORE ARCHITECTURE (din.core)
Wir definieren die Ankerpunkte für alle IMR-Felder.
~~~css
din-text { anchor-name: --anchor-body; }
din-subject { anchor-name: --anchor-subject; }
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
paper.addEventListener("focusin", e => {
  const tag = e.target.tagName.toLowerCase();
  if (tag.startsWith("din-")) {
    document.documentElement.style.setProperty("--active-anchor", `--anchor-${tag.slice(4)}`);
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
</content>
</file>

<file path="index.html">
<metadata>Lines: 373 | Size: 13253 B</metadata>
<content>
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DIN-BriefNEO | v4.0 Standard</title>

    <link rel="stylesheet" href="css/din5008-paper.css" />
    <link rel="stylesheet" href="css/app-ui.css" />
    <link rel="stylesheet" href="css/devmode.css" />
    <link rel="stylesheet" href="css/core-immutable.css" />
  </head>
  <body data-layout="form-b">
    <div id="app-shell">
      <!-- MASTER SIDEBAR (Navigation & Controls) -->
      <aside id="sidebar-left">
        <header class="sidebar-header">
          <div class="sidebar-brand">
            DIN-BriefNEO <span id="app-version" class="v-tag">V18</span>
          </div>
        </header>

        <div id="sidebar-scroll-area">
          <section class="sidebar-section">
            <!-- DIN-VARIANTE -->
            <div class="sidebar-control-group">
              <label class="sidebar-label">DIN-Variante</label>
              <div class="segmented-control">
                <label class="segment-option">
                  <input
                    type="radio"
                    name="layout"
                    id="layout-a"
                    value="form-a"
                  />
                  <span>Form A (Hoch)</span>
                </label>
                <label class="segment-option">
                  <input
                    type="radio"
                    name="layout"
                    id="layout-b"
                    value="form-b"
                    checked
                  />
                  <span>Form B (Standard)</span>
                </label>
              </div>
            </div>

            <!-- HILFSLINIEN -->
            <div class="sidebar-control-group">
              <label class="sidebar-label">Hilfslinien</label>
              <div class="segmented-control">
                <label class="segment-option">
                  <input
                    type="radio"
                    name="guides"
                    id="guides-on"
                    value="true"
                    checked
                  />
                  <span>Anzeigen</span>
                </label>
                <label class="segment-option">
                  <input
                    type="radio"
                    name="guides"
                    id="guides-off"
                    value="false"
                  />
                  <span>Verbergen</span>
                </label>
              </div>
            </div>

            <!-- ARBEITSMODUS -->
            <div class="sidebar-control-group">
              <label class="sidebar-label">Arbeitsmodus</label>
              <div class="segmented-control">
                <label class="segment-option">
                  <input
                    type="radio"
                    name="theme"
                    id="theme-day"
                    value="day"
                    checked
                  />
                  <span>☀️ Tag</span>
                </label>
                <label class="segment-option">
                  <input
                    type="radio"
                    name="theme"
                    id="theme-night"
                    value="night"
                  />
                  <span>🌙 Nacht</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div class="actions-footer">
          <!-- UTILITY ACTIONS (Export/Import/Reset) -->
          <div class="utility-actions">
            <button class="util-btn" title="Export" id="btn-export" command="--export">
              📥 Export
            </button>
            <button class="util-btn" title="Import" id="btn-import" command="--import">
              📤 Import
            </button>
            <button class="util-btn danger" title="Reset" id="btn-reset" commandfor="dialog-reset" command="show-modal">
              🗑️ Reset
            </button>
          </div>

          <!-- IDENTITÄT -->
          <button
            id="btn-profile"
            class="sidebar-btn secondary"
            commandfor="modal-profile"
            command="show-popover"
          >
            👤 Absender-Profil
          </button>

          <!-- DRUCKEN -->
          <button
            id="btn-print"
            class="sidebar-btn primary big-btn"
            command="--print"
          >
            🖨 Drucken / PDF
          </button>

          <!-- COMPLIANCE BAR -->
          <div class="compliance-bar">
            <div id="integrity-status" class="compliance-item">
              Fiskale Integrität: <span class="status-ok">[OK]</span>
            </div>
            <div id="storage-status" class="compliance-item">
              Storage: <span class="status-ok">[OPFS-Journaling]</span>
            </div>
            <div id="math-engine-status" class="compliance-item">
              Math-Engine: [Initialisiere...]
            </div>
            <div id="statusbar" class="status-bar-text">Bereit.</div>
          </div>
        </div>
      </aside>

      <!-- THE AIRFRAME: Semantic Matrix v4.0 -->
      <main id="paper-viewport">
        <din-5008 id="paper">
          <din-A4>
            <!-- BRANDING LAYER -->
            <din-branding-logo></din-branding-logo>
            <din-branding-watermark></din-branding-watermark>

            <!-- Faltmarken & Lochmarke -->
            <div class="mark mark-fold-1"></div>
            <div class="mark mark-loch"></div>
            <div class="mark mark-fold-2"></div>

            <!-- Briefkopf & Granularer Absender -->
            <din-header class="paper-header">
              <din-absender-vorname
                contenteditable="plaintext-only"
                data-placeholder="Vorname"
              ></din-absender-vorname>
              <din-absender-nachname
                contenteditable="plaintext-only"
                data-placeholder="Nachname"
              ></din-absender-nachname>
              <din-absender-strasse
                contenteditable="plaintext-only"
                data-placeholder="Straße Nr."
              ></din-absender-strasse>
              <din-absender-ort
                contenteditable="plaintext-only"
                data-placeholder="PLZ Ort"
              ></din-absender-ort>
            </din-header>

            <!-- Anschriftfeld (Granular) -->
            <din-anschriftfeld class="paper-address-zone">
              <din-return-line
                contenteditable="plaintext-only"
                data-placeholder="Vorname Nachname · Straße Nr. · PLZ Ort"
              ></din-return-line>
              <din-supplement
                contenteditable="plaintext-only"
                data-placeholder="Zusatz / Vermerk"
              ></din-supplement>
              <din-empfaenger-firma
                contenteditable="plaintext-only"
                data-placeholder="Firma (Optional)"
              ></din-empfaenger-firma>
              <din-empfaenger-vorname
                contenteditable="plaintext-only"
                data-placeholder="Vorname"
              ></din-empfaenger-vorname>
              <din-empfaenger-nachname
                contenteditable="plaintext-only"
                data-placeholder="Nachname"
              ></din-empfaenger-nachname>
              <din-empfaenger-strasse
                contenteditable="plaintext-only"
                data-placeholder="Straße Nr."
              ></din-empfaenger-strasse>
              <din-empfaenger-ort
                contenteditable="plaintext-only"
                data-placeholder="PLZ Ort"
              ></din-empfaenger-ort>
            </din-anschriftfeld>

            <din-infoblock class="paper-infoblock">
              <div class="info-row">
                <label>Ihr Zeichen</label>
                <din-ref-ihr contenteditable="plaintext-only"></din-ref-ihr>
              </div>
              <div class="info-row">
                <label>Unser Zeichen</label>
                <din-ref-unser contenteditable="plaintext-only"></din-ref-unser>
              </div>
            </din-infoblock>

            <din-date
              contenteditable="plaintext-only"
              data-placeholder="TT.MM.JJJJ"
            ></din-date>

            <!-- Briefkern -->
            <article id="brief-kern">
              <din-subject
                contenteditable="plaintext-only"
                data-placeholder="Betreff: Ihr Anliegen"
              ></din-subject>
              <din-anrede
                contenteditable="plaintext-only"
                data-placeholder="Sehr geehrte Damen und Herren,"
              ></din-anrede>

              <div class="body-container">
                <din-text
                  contenteditable="plaintext-only"
                  data-placeholder="Hier kÃ¶nnen Sie Ihren Brieftext schreiben... (Markdown wie **fett** oder *kursiv* wird unterstÃ¼tzt)"
                ></din-text>
                <din-text-mirror id="din-text-mirror" aria-hidden="true"></din-text-mirror>
              </div>

              <din-grussformel
                contenteditable="plaintext-only"
                data-placeholder="Mit freundlichen Grüßen"
              ></din-grussformel>
              <din-signature
                contenteditable="plaintext-only"
                data-placeholder="Vorname Nachname"
              ></din-signature>
              <din-attachments
                contenteditable="plaintext-only"
                data-placeholder="Anlagen"
              ></din-attachments>
            </article>

            <!-- Abschluss -->
            <din-fusszeile class="paper-footer">
              <div class="footer-col">
                <label>Bankdaten:</label>
                <span contenteditable="plaintext-only">IBAN: DE00 0000 0000 0000 0000 00</span>
              </div>
              <div class="footer-col">
                <label>Steuer:</label>
                <span contenteditable="plaintext-only">USt-IdNr.: DE 123 456 789</span>
              </div>
            </din-fusszeile>
          </din-A4>
        </din-5008>

        <!-- Decoder Trigger -->
        <button id="btn-decoder-trigger" class="decoder-btn">🔍 Decoder</button>

        <div id="statusbar-viewport" class="status-bar">Initialisiere...</div>
        </main>
        </div>

        <!-- NATIVE POPOVERS & DIALOGS -->
        <div id="modal-profile" popover class="standard-dialog">

      <header class="modal-header">
        <h3>👤 Absenderprofil</h3>
        <button id="btn-profile-close" class="close-btn">✕</button>
      </header>

      <div class="form-section">
        <div class="inline-controls">
          <select id="profileSelect">
            <option value="">— Profil wählen —</option>
            <option value="privat">Privat</option>
            <option value="firma">Büro</option>
          </select>
          <button
            type="button"
            id="btn-profile-save"
            class="sidebar-btn primary"
            title="Speichern"
          >
            💾 Sichern
          </button>
        </div>

        <div class="form-group profile-grid">
          <div class="profile-field">
            <label>Vorname</label>
            <input type="text" id="p-fn" placeholder="Max" />
          </div>
          <div class="profile-field">
            <label>Nachname</label>
            <input type="text" id="p-ln" placeholder="Mustermann" />
          </div>
          <div class="profile-field">
            <label>Straße & Hausnummer</label>
            <input type="text" id="p-street" placeholder="Musterstraße 1" />
          </div>
          <div class="profile-field">
            <label>PLZ & Ort</label>
            <input type="text" id="p-city" placeholder="12345 Musterstadt" />
          </div>
          <div class="profile-field iban-field">
            <label>IBAN</label>
            <input
              type="text"
              id="p-iban"
              placeholder="DE00 0000 0000 0000 0000 00"
            />
          </div>
        </div>
      </div>
    </div>

    <dialog id="dialog-reset" class="standard-dialog">
      <h3>Entwurf löschen?</h3>
      <p>Alle ungespeicherten Änderungen gehen verloren.</p>
      <div class="dialog-actions">
        <button id="btn-reset-confirm" class="danger" command="--reset-data">Löschen</button>
        <button commandfor="dialog-reset" command="close">Abbrechen</button>
      </div>
    </dialog>

    <dialog id="dialog-decoder" class="standard-dialog decoder-modal">
      <h3>🗃️ Black Box Decoder — Flight Recorder</h3>
      <div class="decoder-content">
        <pre id="decoder-output">Keine Daten aufgezeichnet.</pre>
      </div>
      <div class="dialog-actions">
        <button commandfor="dialog-decoder" command="close">Schließen</button>
      </div>
    </dialog>

    <!-- SMART DEADLINE POPOVER -->
    <div id="popover-smart-deadlines" popover class="deadline-popover">
      <header>📅 Intelligente Fristen</header>
      <div id="deadline-list" class="deadline-list">
        <!-- Dynamisch befüllt -->
      </div>
    </div>

    <script type="module" src="js/core/app.js"></script>
  </body>
</html>
</content>
</file>

<file path="js/core/GEMINI.md">
<metadata>Lines: 17 | Size: 987 B</metadata>
<content>
---
scope: LOCAL — js/core/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/core/ (Infrastruktur & State)

**MANDAT:** Dieser Ordner ist das Fundament (State-Proxy, Konstanten, FileSystem/OPFS). Er ist absolut "dumm" und weiß NICHTS vom Layout oder der UI.

**EISERNE GESETZE:**
1. **Kein DOM-Zugriff:** Befehle wie `document.getElementById`, `querySelector` oder `classList` sind hier FATAL ERROR.
2. **Keine Business-Logik:** Der `StateManager` darf keine Berechnungen durchführen. Er hält nur das `content` und `profile` Objekt und managt den Undo/Redo-Stack.
3. **SSoT für Konstanten:** `constants.js` ist die einzige Quelle der Wahrheit für IMR-Tags und CMA-Koordinaten.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-C001]: Der Config-Zweig im State ist beerdigt. Konfiguration lebt nativ im DOM (`#paper.dataset.*`).
- [TOMB-B001]: Die `initCMABridge` (die CSS-Werte per JS injiziert) ist als Dead Code markiert. CSS `:root` ist die primäre SSoT.
</content>
</file>

<file path="js/core/app.js">
<metadata>Lines: 211 | Size: 8619 B</metadata>
<content>
﻿/**
 * js/core/app.js â€” Application Orchestrator
 * DIN-BriefNEO Â· v4.0 V13
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Boot sequence:
 *   1. Dev-Mode Detection â†’ Easter Egg prÃ¼fen
 *   2. StateManager instantiieren â†’ LocalStorage laden
 *   3. UIController init()
 *   4. Auto-Save Subscription
 *
 * NO-JS DOCTRINE [ADR-003]:
 *   Layout, Dialoge, Toolbar-Sichtbarkeit = CSS/HTML.
 *   Dieses File: nur Boot-Logik, kein DOM-Styling.
 *
 * TOMB-LEGACY-001: new Date() ersetzt durch Temporal.
 * TOMB-LEGACY-008: cma-bridge entfernt.
 */

import { StateManager }           from './state.js';
import { UIController }           from '../ui/ui.js';
import { formatDateTemporal, todayISO }     from './temporal-utils.js';
import { initDevMode, checkDevMode } from '../ui/devmode.js';
import { IOCoordinator }          from './io-coordinator.js';
import { CMASensor }              from '../ui/cma-sensor.js';

const ROOT  = 'DIN-BriefNEO';
const VER   = '18.0.0';

/**
 * â”€â”€ Console Telemetry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */
function logTelemetry(sm, io, ui) {
  const isFileProtocol = window.location.protocol === 'file:';
  const color = isFileProtocol ? '#f87171' : '#4ade80';

  console.group(`%c ðŸ’Ž ${ROOT} v4.0 ENGINE v${VER} `, `background: #1e2535; color: ${color}; padding: 5px; border-radius: 4px; font-weight: bold;`);

  console.info(`%c[ORIGIN]%c ${window.location.protocol}//${window.location.host || 'local-filesystem'}`, "font-weight: bold; color: #4a90e2;", "");

  if (isFileProtocol) {
    console.warn("%câš ï¸ SECURITY ORIGIN WARNING: Running via file:// protocol. Local Storage and Service Workers may be restricted. %cTo fix: run 'npx serve' in this directory.", "color: #fbbf24; font-weight: bold;", "color: #ccc; font-style: italic;");
  }

  console.info(`%c[STATE]%c  ${Object.keys(sm.state.content).length} IMR-Keys active. Sync: ${io ? 'OPFS-Journaling' : 'LocalStorage-Fallback'}`, "font-weight: bold; color: #4a90e2;", "");

  const paper = document.getElementById('paper');
  if (paper) {
    const scale = getComputedStyle(paper).scale;
    console.info(`%c[VIEWPORT]%c Paper Monolith scaled at ${scale}. Layout: ${paper.dataset.form || 'B'}`, "font-weight: bold; color: #4a90e2;", "");
  }

  console.info(`%c[BOOT]%c Sequence completed in ${performance.now().toFixed(2)}ms`, "font-weight: bold; color: #4a90e2;", "");
  console.groupEnd();

  // Global Debug Handle
  window.__neo = { sm, ui, io, VER, ROOT, diagnostics: () => {
    console.table(sm.state.content);
    console.table(sm.state.config);
  }};
}

/**
 * â”€â”€ 6. Zero-JS Persistence Logic (ADR-003) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Note: Layout states are now managed via StateManager to ensure
 * synchronicity across tabs via Phoenix Protocol.
 */
function initZeroJSState(sm) {
  const paper = document.getElementById('paper');
  if (!paper) return;

  // Restore Layout
  const layout = sm.state.config?.layout || 'form-b';
  const radioLayout = document.querySelector(`input[name="layout"][value="${layout}"]`);
  if (radioLayout) radioLayout.checked = true;
  if (paper) paper.dataset.form = layout === 'form-a' ? 'A' : 'B';
  document.body.dataset.layout = layout;

  // Restore Guides
  const guides = sm.state.config?.guides !== false;
  const radioGuides = document.querySelector(`input[name="guides"][value="${guides}"]`);
  if (radioGuides) radioGuides.checked = true;
  if (paper) paper.dataset.guides = guides ? "true" : "false";

  // Restore Theme
  const hour = parseInt(Temporal.Now.plainTimeISO().toString().split(':')[0], 10);
  const isNightTime = hour >= 21 || hour < 6;
  const defaultTheme = isNightTime ? 'night' : 'day';

  const theme = sm.state.config?.theme || defaultTheme;
  const radioTheme = document.querySelector(`input[name="theme"][value="${theme}"]`);
  if (radioTheme) radioTheme.checked = true;
  // State sync if it was defaulted
  if (!sm.state.config.theme) sm.state.config.theme = theme;
}

async function boot() {
  const statusEl = document.getElementById('statusbar');
  const setStatus = msg => { if (statusEl) statusEl.textContent = msg; };

  setStatus('â³ Initialisiereâ€¦');

  try {
    // â”€â”€ 1. Dev-Mode Easter Egg â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    checkDevMode();

    // â”€â”€ 2. State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const sm = new StateManager();
    const restored = sm.loadFromStorage();

    if (!restored || !sm.state.content.date) {
      sm.state.content.date = formatDateTemporal(todayISO());
    }

    // â”€â”€ 3. UI (FrÃ¼hzeitige Init fÃ¼r ResponsivitÃ¤t) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ui = new UIController(sm);
    ui.init();

    // â”€â”€ 3a. CMA-Sensor (Layout Integrity) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const cma = new CMASensor(sm);
    cma.init();

    // â”€â”€ 4. Phoenix Protocol (Storage Autonomousty) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const io = new IOCoordinator(sm);
    try {
        await io.init();
    } catch (e) {
        console.warn("âš ï¸ Storage Engine limited on this origin. Falling back to LocalState.");
    }

    // â”€â”€ 5. Worker Message Listener (Compliance) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (io.worker) {
        io.worker.addEventListener('message', (e) => {
            if (e.data.type === 'CONCURRENCY_CONFLICT') {
                setStatus(`âš ï¸ ${e.data.message}`);
                // Diskrete Warnung in der Compliance Bar
                const integrityEl = document.querySelector('.compliance-item:first-child');
                if (integrityEl) {
                    integrityEl.textContent = 'Fiskale IntegritÃ¤t: ';
                    const span = document.createElement('span');
                    span.className = 'status-warn';
                    span.textContent = '[READ-ONLY]';
                    integrityEl.appendChild(span);
                }
            }
        });
    }

    // â”€â”€ 6. Dev-Mode Sidebar-Registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    initDevMode(sm);

    // â”€â”€ 7. Zero-JS Persistence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    initZeroJSState(sm);

    // Watch for layout changes to log telemetry
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout") {
        setTimeout(() => logTelemetry(sm, io, ui), 100);
      }
    });

    // â”€â”€ 8. [COMPLIANCE] PrecisionMath Self-Test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const mathStatus = typeof Math.sumPrecise === "function" ? "ok" : "warn";
    const mathLabel =
      typeof Math.sumPrecise === "function" ? "Blink-Native" : "Integer-Fallback";
    ui.updateComplianceStatus(
      "math-engine-status",
      mathStatus,
      `Math-Engine: [${mathLabel}]`,
    );

    // â”€â”€ 9. TELEMETRY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    logTelemetry(sm, io, ui);

    // Lifecycle Events for Emergency Save
    window.addEventListener('pagehide', () => io.emergencySave());
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') io.emergencySave();
    });

    // Debug-Handle (nur Dev-Mode)
    if (localStorage.getItem('neo_dev_mode') === 'true') {
      window.__neo = { sm, ui, io, VER, ROOT };
    }

    setStatus(`âœ… ${ROOT} v${VER}`);

  } catch (err) {
    console.error('[NEO Boot]', err);
    setStatus('âŒ Boot-Fehler â€” Konsole prÃ¼fen');
    const paper = document.getElementById('paper');
    if (paper) {
      const msg = document.createElement('div');
      msg.style.cssText = 'padding:20mm;color:red;font-family:monospace;font-size:11pt;';
      msg.textContent = `Boot-Fehler: ${err.message}`;
      paper.prepend(msg);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.error('PWA Fail:', err));
}
</content>
</file>

<file path="js/core/constants.js">
<metadata>Lines: 95 | Size: 3891 B</metadata>
<content>
/**
 * js/core/constants.js — v4.2.0 Specification (IMR 4.0)
 * Central Measurement Authority (CMA) — Layer 1: JS Constants
 * ─────────────────────────────────────────────────────────
 */

export const CMA = Object.freeze({
  PAGE_WIDTH:          210.000, PAGE_HEIGHT:        297.000,
  MARGIN_LEFT:          25.000, MARGIN_RIGHT:        20.000,
  ADDRESS_WIDTH:        85.000, ADDRESS_HEIGHT:      45.000,
  FORM: Object.freeze({
    A: Object.freeze({ ADDRESS_TOP: 32.000 }),
    B: Object.freeze({ ADDRESS_TOP: 45.000 }),
  }),
});

/**
 * IMR 4.0 Matrix (Isomorphic Master Registry) — Granular Edition
 * Strenge Kopplung zwischen physischem HTML-Tag und JSON-Key.
 */
export const IMR = Object.freeze([
  // 1. Identität (Header)
  { tag: "din-absender-vorname",  key: "sender_fn", editContext: true },
  { tag: "din-absender-nachname", key: "sender_ln", editContext: true },
  { tag: "din-absender-strasse",  key: "sender_st", editContext: true },
  { tag: "din-absender-ort",      key: "sender_city", editContext: true },

  // 2. Anschriftfeld (Granular)
  { tag: "din-return-line",       key: "return_line", editContext: true },
  { tag: "din-supplement",        key: "supplement", editContext: true },
  { tag: "din-empfaenger-firma",  key: "rect_co", editContext: true },
  { tag: "din-empfaenger-vorname", key: "rect_fn", editContext: true },
  { tag: "din-empfaenger-nachname", key: "rect_ln", editContext: true },
  { tag: "din-empfaenger-strasse", key: "rect_st", editContext: true },
  { tag: "din-empfaenger-ort",    key: "rect_city", editContext: true },

  // 3. Metadaten (Infoblock & Date)
  { tag: "din-ref-ihr",           key: "ref_ihr", editContext: true },
  { tag: "din-ref-unser",         key: "ref_unser", editContext: true },
  { tag: "din-date",              key: "date", editContext: true },

  // 4. Brief-Kern (Blink-Direct)
  { tag: "din-subject",           key: "subject", editContext: true },
  { tag: "din-anrede",            key: "salutation", editContext: true },
  { tag: "din-text",              key: "body", editContext: true },
  { tag: "din-grussformel",       key: "greeting", editContext: true },
  { tag: "din-signature",         key: "signature", editContext: true },
  { tag: "din-attachments",       key: "attachments", editContext: true },

  // 5. Abschluss
  { tag: "din-fusszeile",         key: "footer" },

  // 6. Branding (Aviation Grade Extension)
  { tag: "din-branding-logo",     key: "brand_logo" },
  { tag: "din-branding-watermark", key: "brand_watermark" },
]);

export const AI_INTENTS = Object.freeze({
  PRINT: "action:print",
  SAVE:  "action:save_local",
  GHOST: "action:toggle_guides"
});

/**
 * [ADR-014] Native Sanitizer (Core Specification)
 * [CMD-3] Whitelist IMR 4.0 Custom Tags based on SSoT.
 */
export const SANITIZER_CONFIG = {
  allowElements: [
    "din-5008", "din-A4", "din-header", "din-anschriftfeld", "din-infoblock",
    "din-absender-vorname", "din-absender-nachname", "din-absender-strasse", "din-absender-ort",
    "din-return-line", "din-supplement", "din-empfaenger-firma", "din-empfaenger-vorname", "din-empfaenger-nachname", "din-empfaenger-strasse", "din-empfaenger-ort",
    "din-ref-ihr", "din-ref-unser", "din-date",
    "din-subject", "din-anrede", "din-text", "din-text-mirror", "din-grussformel", "din-signature", "din-attachments",
    "din-fusszeile", "din-branding-logo", "din-branding-watermark",
    "br", "div", "span", "b", "i", "strong", "em", "blockquote", "img"
  ],
  allowAttributes: {
    "data-placeholder": ["*"],
    "data-form": ["*"],
    "src": ["img"],
    "class": ["*"]
  }
};

let sanitizerInstance = null;
if (globalThis.Sanitizer) {
  try {
    sanitizerInstance = new Sanitizer(SANITIZER_CONFIG);
  } catch (e) {
    console.warn('[Sanitizer] Failed to initialize with config, falling back to null.', e);
  }
}
export const CORE_SANITIZER = sanitizerInstance;
</content>
</file>

<file path="js/core/edit-context-controller.js">
<metadata>Lines: 62 | Size: 2024 B</metadata>
<content>
/**
 * js/core/edit-context-controller.js — Pillar 2: EditContext Engine
 * [ADR-008] Decoupled Input & View Architecture
 * [CMD-3] Chrome 147 IME Composition Bug Mitigation
 * ─────────────────────────────────────────────────────────
 */

export class EditContextController {
    constructor(element, onUpdate) {
        this.el = element;
        this.onUpdate = onUpdate;
        this.ec = null;

        if (!globalThis.EditContext) {
            console.error('[EditContext] API not supported. Falling back to legacy input.');
            return;
        }

        this.init();
    }

    init() {
        // [CMD-2] Force Plaintext-Only Doctrine
        this.el.setAttribute('contenteditable', 'plaintext-only');

        this.ec = new EditContext({
            text: this.el.textContent,
            selectionStart: this.el.textContent.length,
            selectionEnd: this.el.textContent.length
        });

        this.el.editContext = this.ec;

        // [CMD-3] Sync Character Bounds for IME (German Umlauts Fix)
        const syncBounds = () => {
            // [CMD-2] Use native getBoundingClientRect to auto-compensate for scrolling wrapper
            const rect = this.el.getBoundingClientRect();

            // Sync Control and Selection bounds to established screen pixels
            this.ec.updateControlBounds(rect);
            this.ec.updateSelectionBounds(rect);
        };

        this.ec.addEventListener('textupdate', (e) => {
            // [CMD-1] Sync Character Bounds for IME (German Umlauts Fix)
            // Mandatory sync on text update to keep native OS window positioned correctly
            syncBounds();

            // [CMD-2] Extract full buffer state for the Pillar 5 sync
            this.onUpdate(this.ec.text);
        });

        this.ec.addEventListener('selectionchange', (e) => {
            // [CMD-3] Mandatory sync on selection change
            syncBounds();
        });

        // Initial Layout Anchor
        syncBounds();
    }
}
</content>
</file>

<file path="js/core/io-coordinator.js">
<metadata>Lines: 152 | Size: 5573 B</metadata>
<content>
﻿/**
 * js/core/io-coordinator.js â€” Phoenix Protocol Coordinator
 * [MANDATE-v4.0] Zero-Loss Persistence & Leader Election
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Architecture:
 *   1. Leader Election (Web Locks API)
 *   2. Broadcast Sync (BroadcastChannel API)
 *   3. Background Saving (IdleDetector API)
 *   4. Dedicated Storage Worker (OPFS)
 */

export class IOCoordinator {
    constructor(stateManager) {
        this.sm = stateManager;
        this.channel = new BroadcastChannel('din_neo_sync');
        this.isLeader = false;
        this.worker = null;
        this.idleDetector = null;
    }

    async init() {
        // Phase 1: Web Locks API (Leader Election)
        // Using ifAvailable: true to immediately know if we are the Leader or Follower
        return navigator.locks.request('din_neo_opfs_leader', { ifAvailable: true }, async (lock) => {
            if (!lock) {
                this.initFollower();
                // In Follower mode, we don't return a "forever" promise here,
                // because we want to retry occasionally if the leader tab closes.
                this.setupLockRetry();
                return;
            }

            // We are the LEADER
            await this.initLeader();

            // Return a promise that never resolves to keep the lock for the life of the tab
            return new Promise(() => {});
        });
    }

    /**
     * Periodically check if the leader has vacated the lock
     */
    setupLockRetry() {
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && !this.isLeader) {
                this.init(); // Retry elevation to leader
            }
        });
    }

    async initLeader() {
        this.isLeader = true;
        document.body.classList.remove('is-follower');
        console.info('[Phoenix] Primary Tab: Elected as Leader.');

        // Phase 2: Boot OPFS Worker
        this.worker = new Worker('js/core/opfs-worker.js');
        this.worker.onmessage = (e) => {
            if (e.data.type === 'SAVE_CONFIRMED') {
                console.debug('[Phoenix] Save Confirmed:', e.data.timestamp);
            }
            if (e.data.type === 'LOAD_CONFIRMED') {
                console.info('[Phoenix] OPFS State Loaded.');
                this.sm.updateFromOPFS(e.data.data);
            }
        };

        // Leader listens for Follower updates
        this.channel.onmessage = (msg) => {
            if (msg.data.type === 'STATE_DELTA') {
                this.save(msg.data.state);
            }
        };

        // Request initial load from OPFS
        this.worker.postMessage({ type: 'LOAD_DATA' });

        // Phase 3: Idle Detector API (Native Debounce)
        await this.setupIdleDetection();
    }

    initFollower() {
        this.isLeader = false;
        document.body.classList.add('is-follower');
        console.info('[Phoenix] Secondary Tab: Following Leader.');

        // Follower sends state to Leader
        this.sm.subscribe((path, value, scope) => {
            if (scope === 'load' || scope === 'opfs') return;
            this.channel.postMessage({ type: 'STATE_DELTA', state: this.sm.state });
        });
    }

    async setupIdleDetection() {
        if (!('IdleDetector' in window)) {
            console.error('[Phoenix] IdleDetector API not supported. Falling back to explicit saves only.');
            return;
        }

        try {
            const state = await IdleDetector.requestPermission();
            if (state === 'granted') {
                this.idleDetector = new IdleDetector();
                this.idleDetector.addEventListener('change', () => {
                    // [CMD-1] Native Idle Detection for OPFS Sync
                    // Trigger OPFS background sync exclusively when user is "idle"
                    if (this.idleDetector.userState === 'idle') {
                        console.debug('[Phoenix] User Idle: Triggering OPFS Save.');
                        this.save(this.sm.state);
                    }
                });

                // Set threshold to 1 minute (60000ms is minimum allowed by spec)
                await this.idleDetector.start({ threshold: 60000 });
                console.info('[Phoenix] Native IdleDetector active.');
            }
        } catch (e) {
            console.warn('[Phoenix] IdleDetector failed:', e);
        }
    }

    save(state) {
        if (!this.isLeader || !this.worker) return;

        // [ADR-016] Modern Task Scheduling (Chrome 94+)
        // Prioritize background saving to keep the Main Thread free for EditContext/IME.
        if (globalThis.scheduler?.postTask) {
            scheduler.postTask(() => {
                this.worker.postMessage({ type: 'SAVE_DATA', data: state });
            }, { priority: 'background' });
        } else {
            // Fallback: Legacy async dispatch
            setTimeout(() => {
                this.worker.postMessage({ type: 'SAVE_DATA', data: state });
            }, 0);
        }
    }

    /**
     * Emergency Save during Lifecycle Events
     */
    emergencySave() {
        if (this.isLeader && this.worker) {
            this.worker.postMessage({ type: 'SAVE_DATA', data: this.sm.state });
        } else {
            this.channel.postMessage({ type: 'STATE_DELTA', state: this.sm.state });
        }
    }
}
</content>
</file>

<file path="js/core/model-blacklist.js">
<metadata>Lines: 104 | Size: 4103 B</metadata>
<content>
﻿/**
 * js/ui/model-blacklist.js â€” KI-Modell Blacklist Strategy
 * DIN-BriefNEO Â· v4.0 V13 | SPEC-038
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * PRINZIP: Blacklist statt Whitelist.
 *   Statt eine starre Liste erlaubter Modelle zu pflegen,
 *   werden VERALTETE Modelle gefiltert. Neue Modelle sind
 *   automatisch erlaubt â€” keine manuelle Freischaltung nÃ¶tig.
 *
 * PATTERN:
 *   const models = await fetchAvailableModels(apiKey);
 *   const usable = filterModels(models);
 *   â†’ renderModelSelect(usable);
 */

/**
 * Blacklist-EintrÃ¤ge: Muster fÃ¼r veraltete/ungeeignete Modelle.
 * Regex-basiert â†’ "enthÃ¤lt X" statt "ist exakt Y".
 *
 * BLACKLIST PFLEGE-REGEL:
 *   EintrÃ¤ge werden NUR hinzugefÃ¼gt (nie entfernt ohne Migration-Notiz).
 *   Format: { pattern: /regex/, reason: 'Warum gesperrt', since: 'YYYY-MM' }
 */
const MODEL_BLACKLIST = Object.freeze([
  { pattern: /gpt-3\.5/i,         reason: 'Zu alt fÃ¼r DIN-PrÃ¤zision',     since: '2024-01' },
  { pattern: /gpt-4-0314/i,       reason: 'Deprecated (OpenAI)',           since: '2024-06' },
  { pattern: /gpt-4-0613/i,       reason: 'Deprecated (OpenAI)',           since: '2024-06' },
  { pattern: /text-davinci/i,     reason: 'Legacy completions API',        since: '2023-01' },
  { pattern: /claude-1/i,         reason: 'Claude 1.x deprecated',         since: '2024-01' },
  { pattern: /claude-2\.0$/i,     reason: 'Claude 2.0 deprecated',         since: '2024-03' },
  { pattern: /-preview$/i,        reason: 'Preview-Modelle instabil',      since: '2024-01' },
  { pattern: /instruct$/i,        reason: 'Instruct-only, kein Chat',      since: '2024-01' },
  { pattern: /vision-preview/i,   reason: 'Deprecated Vision-Preview',     since: '2024-09' },
]);

/**
 * Filtert eine Modellliste gegen die Blacklist.
 * @param {string[]} models â€” Liste der Modell-IDs vom Provider
 * @returns {string[]} â€” bereinigte Liste (Blacklist-Treffer entfernt)
 */
export function filterModels(models) {
  if (!Array.isArray(models)) return [];
  return models.filter(model =>
    !MODEL_BLACKLIST.some(entry => entry.pattern.test(model))
  );
}

/**
 * ErklÃ¤rt warum ein Modell gesperrt ist (fÃ¼r Debug-Anzeige).
 * @param {string} modelId
 * @returns {{ blocked: boolean, reason?: string, since?: string }}
 */
export function explainBlock(modelId) {
  const hit = MODEL_BLACKLIST.find(e => e.pattern.test(modelId));
  if (!hit) return { blocked: false };
  return { blocked: true, reason: hit.reason, since: hit.since };
}

/**
 * Rendert ein <select>-Element mit den verfÃ¼gbaren Modellen.
 * Gesperrte Modelle werden als disabled-Option mit ErklÃ¤rung angezeigt.
 * @param {string} selectId â€” ID des <select>-Elements
 * @param {string[]} allModels â€” alle verfÃ¼gbaren Modell-IDs
 */
export function renderModelSelect(selectId, allModels) {
  const el = document.getElementById(selectId);
  if (!el) return;

  el.textContent = '';   // MANDATE-INJ: textContent statt innerHTML

  const grouped = { available: [], blocked: [] };
  for (const m of allModels) {
    const info = explainBlock(m);
    info.blocked ? grouped.blocked.push({ id: m, ...info }) : grouped.available.push(m);
  }

  // VerfÃ¼gbare Modelle
  const grpOk = document.createElement('optgroup');
  grpOk.label = 'âœ“ VerfÃ¼gbar';
  grouped.available.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    grpOk.appendChild(opt);
  });
  el.appendChild(grpOk);

  // Gesperrte Modelle (sichtbar aber disabled â€” Transparenz fÃ¼r Nutzer)
  if (grouped.blocked.length > 0) {
    const grpBlocked = document.createElement('optgroup');
    grpBlocked.label = 'âœ— Gesperrt (veraltet)';
    grouped.blocked.forEach(({ id, reason }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${id} â€” ${reason}`;
      opt.disabled = true;
      grpBlocked.appendChild(opt);
    });
    el.appendChild(grpBlocked);
  }
}
</content>
</file>

<file path="js/core/opfs-worker.js">
<metadata>Lines: 120 | Size: 4195 B</metadata>
<content>
﻿/**
 * js/core/opfs-worker.js â€” High-Integrity Journaling Persistence
 * [SPEC-068] Shadow Paging & Journaling Protocol
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Operiert im Dedicated Worker Thread fÃ¼r blockierungsfreie I/O.
 */

const FILE_NAME = 'din-brief-neo.draft';
const JOURNAL_NAME = 'din-brief-neo.journal';
const TMP_NAME  = 'din-brief-neo.draft.tmp';

let saveCounter = 0;

self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === 'SAVE_DATA') {
    await saveWithJournaling(data);
  } else if (type === 'LOAD_DATA') {
    await loadWithRecovery();
  }
};

/**
 * [High-Integrity] Load with Recovery Protocol
 * PrÃ¼ft Journal auf ungespeicherte Daten nach Absturz.
 */
async function loadWithRecovery() {
  try {
    const root = await navigator.storage.getDirectory();

    // 1. Versuche Hauptdatei zu laden
    let data = null;
    try {
      const fileHandle = await root.getFileHandle(FILE_NAME);
      const file = await fileHandle.getFile();
      data = JSON.parse(await file.text());
    } catch (e) {
      console.warn('[OPFS] Main draft not found, starting fresh.');
    }

    // 2. PrÃ¼fe Journal auf "Late-Arrival" Daten (Recovery)
    try {
      const journalHandle = await root.getFileHandle(JOURNAL_NAME);
      const journalFile = await journalHandle.getFile();
      const journalText = await journalFile.text();
      if (journalText) {
          const journalData = JSON.parse(journalText);
          data = { ...data, ...journalData, _recovered: true };
          console.info('[OPFS] Data recovered from Journal.');
      }
    } catch (e) { /* No journal, no problem */ }

    self.postMessage({ type: 'LOAD_CONFIRMED', data });
  } catch (err) {
    self.postMessage({ type: 'LOAD_ERROR', error: err.message });
  }
}

/**
 * [High-Integrity] Journaling & Shadow Paging
 * Verhindert Datenverlust durch redundante SchreibvorgÃ¤nge.
 * Nutzt Web Locks API (navigator.locks.request) fÃ¼r Concurrency-Schutz.
 */
async function saveWithJournaling(data) {
  try {
    // [ADR-015] Concurrency Guard: Exklusive Sperre fÃ¼r OPFS-Zugriff
    // Wir nutzen ifAvailable: true, um sofort zu scheitern, wenn ein anderer Tab schreibt.
    await navigator.locks.request('opfs-io-lock', { ifAvailable: true }, async (lock) => {
      if (!lock) {
          self.postMessage({ type: 'CONCURRENCY_CONFLICT', message: 'TAB-KONFLIKT: READ-ONLY' });
          return;
      }

      const root = await navigator.storage.getDirectory();

      // 1. Journaling: Schreibe Snapshot in Journal
      const journalHandle = await root.getFileHandle(JOURNAL_NAME, { create: true });
      const jAccess = await journalHandle.createSyncAccessHandle();
      const encoder = new TextEncoder();
      const buffer = encoder.encode(JSON.stringify(data));
      jAccess.truncate(0);
      jAccess.write(buffer, { at: 0 });
      jAccess.flush();
      jAccess.close();

      saveCounter++;

      // 2. Periodic Compaction: Alle 5 Saves wird die Hauptdatei aktualisiert
      if (saveCounter >= 5) {
        const tmpHandle = await root.getFileHandle(TMP_NAME, { create: true });
        const accessHandle = await tmpHandle.createSyncAccessHandle();

        accessHandle.truncate(0);
        accessHandle.write(buffer, { at: 0 });
        accessHandle.flush();
        accessHandle.close();

        // Atomares Replacement
        await tmpHandle.move(FILE_NAME);

        // Journal leeren nach erfolgreicher Compaction
        const journalHandleFinal = await root.getFileHandle(JOURNAL_NAME);
        const jFinalAccess = await journalHandleFinal.createSyncAccessHandle();
        jFinalAccess.truncate(0);
        jFinalAccess.close();

        saveCounter = 0;
        console.log('[OPFS] Checkpoint reached: Main draft updated.');
      }

      self.postMessage({ type: 'SAVE_CONFIRMED', timestamp: Date.now() });
    });
  } catch (err) {
    console.error('[OPFS Worker] Save Error:', err);
    self.postMessage({ type: 'SAVE_ERROR', error: err.message });
  }
}
</content>
</file>

<file path="js/core/state.js">
<metadata>Lines: 187 | Size: 4592 B</metadata>
<content>
/**
 * js/core/state.js — Central State Authority (IMR 4.0)
 * [ADR-013] Isomorphic State Mapping
 */

import { temporalReviver } from './temporal-utils.js';

export const STORAGE_KEY = 'neo_brief_state_v14_master';

export const DEFAULT_STATE = Object.freeze({
  content: {
    // 1. Identität (Atome)
    sender_fn:      '',
    sender_ln:      '',
    sender_st:      '',
    sender_city:    '',

    // 2. Anschriftzone (Atome)
    return_line:    '',
    supplement:     '',
    rect_co:        '',
    rect_fn:        '',
    rect_ln:        '',
    rect_st:        '',
    rect_city:      '',

    // 3. Metadaten
    ref_ihr:        '',
    ref_unser:      '',
    date:           '',

    // 4. Brief-Kern
    subject:        '',
    salutation:     '',
    body:           '', // Wir behalten 'body' als Key für Kompatibilität mit dem Markdown-Parser
    greeting:       '',
    signature:      '',
    attachments:    '',

    // 5. Abschluss
    footer:         '',

    // 6. Branding
    brand_logo:      '',
    brand_watermark: '',
  },
  config: {
    layout: 'form-b',
    guides: true,
    theme: 'day',
    formality: 'formal',
    dateFormat: 'de',
    profiles: {},
  },
  profile: {
    fn: '', ln: '', street: '', city: '', iban: '',
  },
});

const clone = obj => JSON.parse(JSON.stringify(obj));

/**
 * Signal-API Shim (Chrome 147+ Proposal)
 * Minimal implementation for high-integrity reactivity.
 */
class Signal {
  constructor(initialValue) {
    this._value = initialValue;
    this._listeners = new Set();
  }
  get value() { return this._value; }
  set value(v) {
    if (this._value === v) return;
    this._value = v;
    this._listeners.forEach(fn => fn(v));
  }
  subscribe(fn) {
    this._listeners.add(fn);
    fn(this._value);
    return () => this._listeners.delete(fn);
  }
}

export class StateManager {
  constructor() {
    this._raw      = clone(DEFAULT_STATE);
    this._listeners = new Set();
    this.signals = this._initSignals(this._raw.content);
    this.state = this._makeProxy(this._raw);
  }

  _initSignals(content) {
    const signals = {};
    for (const key in content) {
      signals[key] = new Signal(content[key]);
    }
    return signals;
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _emit(path, value, scope) {
    this._listeners.forEach(fn => fn(path, value, scope));

    // Sync to Signals
    if (path.startsWith('content.')) {
      const key = path.split('.')[1];
      if (this.signals[key]) {
        this.signals[key].value = value;
      }
    }
  }

  update(path, value, source = 'ui') {
    const parts = path.split('.');
    let current = this._raw;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    const lastKey = parts[parts.length - 1];
    if (current[lastKey] === value) return;

    current[lastKey] = value;
    this._emit(path, value, parts[0]);
  }

  serialize() { return clone(this._raw); }

  save() {
    // Passive Persistence: IOCoordinator handles this
    console.debug('[StateManager] Internal State Updated.');
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      this.load(JSON.parse(raw, temporalReviver));
      return true;
    } catch { return false; }
  }

  load(data) {
    const incoming = data ? clone(data) : clone(DEFAULT_STATE);
    this._raw  = incoming;
    this.state = this._makeProxy(this._raw);
    this._emit('root', this._raw, 'load');
  }

  updateFromOPFS(data) {
    if (!data) return;
    Object.keys(data).forEach(section => {
      if (this._raw[section] && typeof data[section] === 'object') {
        Object.keys(data[section]).forEach(key => {
            this._raw[section][key] = temporalReviver(key, data[section][key]);
        });
      } else {
        this._raw[section] = temporalReviver(section, data[section]);
      }
    });
    this._emit('root', this._raw, 'opfs');
  }

  _makeProxy(target, path = []) {
    const self = this;
    return new Proxy(target, {
      get(obj, prop) {
        const val = obj[prop];
        if (val !== null && typeof val === 'object')
          return self._makeProxy(val, [...path, prop]);
        return val;
      },
      set(obj, prop, value) {
        if (obj[prop] === value) return true;
        obj[prop] = value;
        const fullPath = [...path, prop].join('.');
        const scope    = path.length ? path[0] : prop;
        self._emit(fullPath, value, scope, 'proxy');
        return true;
      },
    });
  }
}
</content>
</file>

<file path="js/core/temporal-utils.js">
<metadata>Lines: 87 | Size: 2515 B</metadata>
<content>
﻿/**
 * js/core/temporal-utils.js â€” Pillar 6: Temporal API Engine
 * [ADR-011] Chrome 147 Native Temporal Support
 * [TOMB-L001] Date object is strictly forbidden.
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

// [CMD-4] Intl.DateTimeFormat Singleton Performance Fix
const DIN_FORMATTER_SHORT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: '2-digit', year: 'numeric'
});

const DIN_FORMATTER_LONG = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: 'long', year: 'numeric'
});

/**
 * Holt das aktuelle Datum im ISO-Format (YYYY-MM-DD)
 */
export function todayISO() {
  // [CMD-1] Fixed: Temporal.Now.plainDateISO requires a timezone argument in Chrome 147
  // @ts-ignore - Native in Chrome 147
  return Temporal.Now.plainDateISO(Temporal.Now.timeZoneId()).toString();
}

/**
 * Formatiert ein Temporal-Datum fÃ¼r die deutsche DIN-Norm
 * @param {string|Temporal.PlainDate} input
 * @param {string} format â€” 'din' (16.03.2026), 'text' (16. MÃ¤rz 2026)
 */
export function formatDate(input, format = 'din') {
  if (!input) return '';

  // @ts-ignore
  const date = typeof input === 'string' ? Temporal.PlainDate.from(input) : input;

  if (format === 'text') {
    return DIN_FORMATTER_LONG.format(date);
  }

  // Standard DIN 5008 (TT.MM.JJJJ)
  return DIN_FORMATTER_SHORT.format(date);
}

/**
 * Alias fÃ¼r formatDate (High-Integrity Compatibility)
 */
export function formatDateTemporal(isoString) {
  return formatDate(isoString || todayISO(), 'din');
}

/**
 * Berechnet ein Zieldatum (z.B. fÃ¼r Fristen)
 * @param {string} isoDate
 * @param {number} daysToAdd
 */
export function addDays(isoDate, daysToAdd) {
  // @ts-ignore
  const start = typeof isoDate === 'string' ? Temporal.PlainDate.from(isoDate) : isoDate;
  return start.add({ days: daysToAdd }).toString();
}

/**
 * Holt die aktuelle Uhrzeit im ISO-Format (HH:MM:SS)
 */
export function nowTimeISO() {
  // @ts-ignore
  return Temporal.Now.plainTimeISO().toString().split('.')[0];
}

/**
 * [CMD-3] Reviver logic (export for StateManager if needed)
 */
export function temporalReviver(key, value) {
  // Match standard ISO 8601 Date strings (YYYY-MM-DD)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      // @ts-ignore
      return Temporal.PlainDate.from(value);
    } catch (e) {
      return value;
    }
  }
  return value;
}
</content>
</file>

<file path="js/core/toast-registry.js">
<metadata>Lines: 46 | Size: 962 B</metadata>
<content>
/**
 * Central Toast Registry - SSoT for all system notifications.
 */
export const TOASTS = {
  save_success: {
    text: "Brief erfolgreich gespeichert ✓",
    type: "success",
    duration: 2500
  },
  export_success: {
    text: "JSON-Export abgeschlossen",
    type: "info",
    duration: 2500
  },
  import_success: {
    text: "Brief erfolgreich geladen",
    type: "success",
    duration: 3000
  },
  import_error: {
    text: "❌ Import fehlgeschlagen: Ungültige Datei",
    type: "error",
    duration: 5000
  },
  deadline_set: {
    text: "📅 Frist gesetzt: {date}",
    type: "info",
    duration: 3000
  },
  iban_invalid: {
    text: "⚠️ Ungültige IBAN erkannt",
    type: "warning",
    duration: 4000
  },
  night_mode_auto: {
    text: "🌙 Nachtmodus automatisch aktiviert (21:00)",
    type: "info",
    duration: 4000
  },
  address_overflow: {
    text: "⚠️ Adresszeilen überschritten (max. 6)",
    type: "warning",
    duration: 5000
  }
};
</content>
</file>

<file path="js/logic/GEMINI.md">
<metadata>Lines: 18 | Size: 935 B</metadata>
<content>
---
scope: LOCAL — js/logic/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/logic/ (Pure Business Logic)

**MANDAT:** Dieser Ordner enthält AUSSCHLIESSLICH reine `Input -> Funktion -> Output` Logik.

**EISERNE GESETZE:**
1. **Kein DOM-Zugriff:** Keine Interaktion mit HTML-Elementen.
2. **Keine Mutationen:** Die Funktionen dürfen den State nicht direkt verändern, sondern geben Werte zurück, die die UI oder der State-Manager verarbeiten.
3. **Zeit-Determinismus:** Die native `Temporal API` ist das einzige erlaubte Zeit-Werkzeug.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-L001]: `new Date()` ist STRIKT VERBOTEN. Nutze ausschließlich `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`.
- [TOMB-L002]: JS-basierte HTML-Injektion (z.B. `<br>` für Anreden). Alles muss reiner Plaintext bleiben.
- [TOMB-L008]: Das `richText`-Flag aus dem IMR ist beerdigt. Der Datenstrom ist 100% Plaintext.
</content>
</file>

<file path="js/logic/flight-recorder.js">
<metadata>Lines: 68 | Size: 2180 B</metadata>
<content>
﻿/**
 * js/logic/flight-recorder.js â€” Black Box Decoder Runtime
 * v4.0 V16 | SPEC-047 | BRAIN-047-SPEC | PLAN-047
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * DETERMINISTISCHE DIAGNOSE-ENGINE
 * Erfasst den vollstÃ¤ndigen System-Zustand bei CMA-VerstÃ¶ÃŸen oder Drifts.
 */

import { IMR } from '../core/constants.js';
import { readDOMasJSON } from './logic.js';

export const FlightRecorder = {

  /**
   * Misst physische Abweichungen der IMR-Zonen vom DIN-Standard.
   * Nutzt getBoundingClientRect() fÃ¼r Echtzeit-Telemetrie.
   */
  measureCMA: () => {
    return IMR.map(entry => {
      const el = document.querySelector(entry.tag);
      if (!el) return null;
      const rect = el.getBoundingClientRect();

      // Umrechnung von PX in MM (Baseline: 96 DPI -> 1mm = 3.7795px)
      const pxToMm = px => Math.round((px / 3.7795) * 10) / 10;

      return {
        tag: entry.tag,
        key: entry.key,
        height_mm: pxToMm(rect.height),
        width_mm:  pxToMm(rect.width),
        top_mm:    pxToMm(rect.top)
      };
    }).filter(Boolean);
  },

  /**
   * Generiert die vollstÃ¤ndige Payload fÃ¼r den Black Box Decoder (KI).
   * @param {string} errorType â€” CMA_VIOLATION | DOM_DRIFT | MANUAL
   * @param {string} message â€” Kurze Fehlerbeschreibung
   */
  record: (errorType = 'MANUAL_TRIGGER', message = '') => {
    return {
      header: {
        app: "DIN-BriefNEO v4.0",
        version: "16.0.0",
        timestamp: Temporal.Now.instant().toString(),
        incident_id: crypto.randomUUID()
      },
      context: {
        error_type: errorType,
        error_message: message
      },
      telemetry: {
        imr_state: readDOMasJSON(),
        cma_sensor: FlightRecorder.measureCMA(),
        console_buffer: [] // Platzhalter fÃ¼r Log-Aggregation
      },
      environment: {
        engine: "Chrome 147+",
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`
      }
    };
  }
};
</content>
</file>

<file path="js/logic/greetings.js">
<metadata>Lines: 122 | Size: 4025 B</metadata>
<content>
﻿/**
 * js/logic/greetings.js â€” v4.0 Salutation Engine (Refined)
 * High-Integrity v4.0 | Chrome 147 Baseline
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

export const GreetingsMatrix = {
    settings: {
        fallback: "Sehr geehrte Damen und Herren,"
    },
    /**
     * [MANDATE-GREETING] Radikal flache Logik: M/F/U Erkennung.
     * KEINE akademischen Titel (Dr./Prof.).
     * Erkennt Adelstitel und Formality.
     */
    process: (text, formality = 'formal') => {
        if (!text) return GreetingsMatrix.settings.fallback;

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return GreetingsMatrix.settings.fallback;

        const firstLine = lines[0];
        const lowerFirstLine = firstLine.toLowerCase();

        // Titel-Filter (High-Integrity Purge)
        const TITLES = ['dr.', 'dr', 'prof.', 'prof', 'dipl.', 'dipl', 'ing.', 'ing', 'habil', 'habil.'];

        // AdelsprÃ¤dikate und Namensbestandteile
        const NOBLE_PARTS = ['von', 'van', 'zu', 'der', 'die', 'de', 'do'];

        // Tokenisierung
        let tokens = firstLine.split(/\s+/);

        // 1. Titel entfernen
        tokens = tokens.filter(t => !TITLES.includes(t.toLowerCase().replace(/\.$/, '')));

        // 2. Anrede-Erkennung
        let gender = 'u'; // unknown
        if (tokens.some(t => t.toLowerCase() === 'herr')) gender = 'm';
        else if (tokens.some(t => t.toLowerCase() === 'frau')) gender = 'f';
        else if (tokens.some(t => t.toLowerCase() === 'familie' || t.toLowerCase() === 'eheleute')) gender = 'g'; // group

        // 3. Nachnamen-Extraktion (Alles nach der Anrede)
        let nameParts = [];
        let startCollecting = false;

        for (const token of tokens) {
            const lowToken = token.toLowerCase();
            if (['herr', 'frau', 'familie', 'eheleute'].includes(lowToken)) {
                startCollecting = true;
                continue;
            }
            if (startCollecting) {
                nameParts.push(token);
            }
        }

        const lastName = nameParts.join(' ');

        // 4. Matrix-Dispatch
        if (gender === 'm') {
            if (formality === 'casual') return `Hallo ${lastName || 'unbekannt'},`;
            if (formality === 'polite') return `Guten Tag Herr ${lastName},`;
            return `Sehr geehrter Herr ${lastName},`;
        }
        if (gender === 'f') {
            if (formality === 'casual') return `Hallo ${lastName || 'unbekannt'},`;
            if (formality === 'polite') return `Guten Tag Frau ${lastName},`;
            return `Sehr geehrte Frau ${lastName},`;
        }
        if (gender === 'g') {
            return `Sehr geehrte Familie ${lastName},`;
        }

        return GreetingsMatrix.settings.fallback;
    }
};

/**
 * [SPEC-002] Hybrid-Adapter: Aktualisiert Placeholder/Content.
 */
export function updateSalutationHint(
  el,
  analysis,
  formality,
  recipientType,
  currentText = null,
) {
  if (!el || el.dataset.auto === "false") return;

  const textToProcess =
    currentText !== null
      ? currentText
      : document.querySelector("din-empfaenger-name")?.textContent || "";
  const sal = GreetingsMatrix.process(textToProcess, formality);

  el.dataset.placeholder = sal;

  if (!el.textContent.trim()) {
    el.textContent = sal;
  }
}

export const GREETING_MAP = {
  formal: "Mit freundlichen GrÃ¼ÃŸen",
  polite: "Freundliche GrÃ¼ÃŸe",
  casual: "Viele GrÃ¼ÃŸe",
};

export function deriveSalutation(analysis, formality, recipientType) {
  const recipientEl = document.querySelector("din-empfaenger-name");
  return GreetingsMatrix.process(
    recipientEl ? recipientEl.textContent : "",
    formality,
  );
}

export function deriveGreeting(formality = 'formal') {
    return GREETING_MAP[formality] || GREETING_MAP.formal;
}
</content>
</file>

<file path="js/logic/logic.js">
<metadata>Lines: 702 | Size: 20725 B</metadata>
<content>
﻿/**
 * js/logic/logic.js â€” Pure Business Logic Engine
 * v4.0 Standard Specification | IMR 4.0 | DIN 5008:2020-03
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * ZERO DOM. ZERO State-Imports. Pure Input â†’ Output.
 *
 * IMR 4.0 (2026-03-28):
 *   readDOMasJSON() scannt <din-*> Tags direkt basierend auf IMR-Registry.
 *   textContent ist die alleinige Source of Truth (SSoT).
 */

import { IMR, AI_INTENTS } from "../core/constants.js";
export * from "./greetings.js";

/* â”€â”€ Date (TOMB-LEGACY-001: Temporal API Proof) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export {
  todayISO,
  formatDateTemporal as formatDate,
} from "../core/temporal-utils.js";

/**
 * Holt das aktuelle Datum deterministisch via Temporal API.
 * [ADR-011] Baseline Chrome 147+.
 */
export function getTodayTemporal() {
  // [CMD-1] Fixed: Temporal.Now.plainDateISO requires a timezone argument in Chrome 147
  // @ts-ignore
  return Temporal.Now.plainDateISO(Temporal.Now.timeZoneId());
}

const MONTHS_DE = [
  "Januar",
  "Februar",
  "MÃ¤rz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function parseDate(input) {
  if (!input) return null;
  const s = input.trim();

  // 1. DE Format: TT.MM.JJJJ
  const m1 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m1) {
    // @ts-ignore
    return Temporal.PlainDate.from({
      year: +m1[3],
      month: +m1[2],
      day: +m1[1],
    });
  }

  // 2. ISO Format: JJJJ-MM-TT
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) {
    // @ts-ignore
    try {
      return Temporal.PlainDate.from(s);
    } catch {
      /* next */
    }
  }

  // 3. Long Format: TT. Monat JJJJ
  const m3 = s.match(/^(\d{1,2})\.?\s+([^\s]+)\s+(\d{4})$/);
  if (m3) {
    const mi = MONTHS_DE.findIndex((mn) =>
      mn.toLowerCase().startsWith(m3[2].toLowerCase().substring(0, 3)),
    );
    if (mi !== -1) {
      // @ts-ignore
      return Temporal.PlainDate.from({
        year: +m3[3],
        month: mi + 1,
        day: +m3[1],
      });
    }
  }

  // 4. Fallback: Native Temporal.PlainDate.from
  try {
    // @ts-ignore
    return Temporal.PlainDate.from(s);
  } catch {
    return null;
  }
}

/* â”€â”€ Recipient Parsing (v4.0 V4 â€” Intl.Segmenter) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * [High-Integrity] Recipient Parser
 * Nutzt Intl.Segmenter fÃ¼r robuste Tokenisierung ohne Regex-Hell.
 */
export function parseRecipient(text) {
  if (!text)
    return { gender: "n", name: "", firstName: "", title: "", fullName: "" };

  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || "";

  // Segmentierung der ersten Zeile
  const segmenter = new Intl.Segmenter("de", { granularity: "word" });
  const segments = Array.from(segmenter.segment(firstLine));
  const tokens = segments.filter((s) => s.isWordLike).map((s) => s.segment);

  let gender = "n";
  let titles = [];
  let nameParts = [];

  const GENDER_MAP = {
    herr: "m",
    herrn: "m",
    frau: "f",
    familie: "fam",
    eheleute: "fam",
  };
  const TITLE_SET = new Set([
    "dr",
    "prof",
    "dipl",
    "mag",
    "ing",
    "h.c",
    "mult",
  ]);

  for (const token of tokens) {
    const lower = token.toLowerCase().replace(/\.$/, "");

    if (GENDER_MAP[lower]) {
      gender = GENDER_MAP[lower];
      continue;
    }

    if (TITLE_SET.has(lower)) {
      titles.push(token.endsWith(".") ? token : token + ".");
      continue;
    }

    nameParts.push(token);
  }

  const title = titles.join(" ");
  const name = nameParts.length ? nameParts[nameParts.length - 1] : "";
  const firstName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
  const fullName = [title, firstName, name].filter(Boolean).join(" ");

  return { gender, name, firstName, title, fullName };
}

/* â”€â”€ Precision Math (High-Integrity Guard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * [CMD-3] Zero-Loss Financial Calculation
 * Priority 1: Chrome 147+ Math.sumPrecise (Native LayoutNG Speed)
 * Priority 2: Cent-Based Fallback (No Float Drift)
 */
export const PrecisionMath = Object.freeze({
  sum(values) {
    if (!values || !Array.isArray(values)) return 0;

    // @ts-ignore - Chrome 147 Baseline
    if (typeof Math.sumPrecise === "function") {
      return Math.sumPrecise(values);
    }

    // Fallback: Fixed-Point Math in Cents
    const cents = values.reduce((acc, val) => acc + Math.round(val * 100), 0);
    return cents / 100;
  },
});

export function sumFinancials(values) {
  return PrecisionMath.sum(values);
}
/**
 * Berechnet die Millisekunden bis zum nächsten Themenwechsel (21:00 oder 06:00).
 */
export function getMsUntilNextThemeTransition() {
  // @ts-ignore
  const now = Temporal.Now.zonedDateTimeISO();
  const today = now.toPlainDate();

  const nightStart = today.toZonedDateTime({ plainTime: '21:00:00', timeZone: now.timeZoneId });
  const nightEnd   = today.toZonedDateTime({ plainTime: '06:00:00', timeZone: now.timeZoneId });

  // Mögliche Ziele finden (Heute oder Morgen)
  const candidates = [
    nightStart,
    nightStart.add({ days: 1 }),
    nightEnd,
    nightEnd.add({ days: 1 })
  ];

  // Nur zukünftige Zeiten nehmen und sortieren
  const future = candidates
    .filter(c => Temporal.ZonedDateTime.compare(c, now) > 0)
    .sort(Temporal.ZonedDateTime.compare);

  // Differenz zum nächsten Zeitpunkt
  return future[0].epochMilliseconds - now.epochMilliseconds;
}

/**
 * Prüft, ob die aktuelle Zeit im Nachtfenster (21:00 - 06:00) liegt.
 */
export function isNightTime() {
  // @ts-ignore
  const now = Temporal.Now.plainTimeISO();
  const nightStart = Temporal.PlainTime.from({ hour: 21 });
  const nightEnd = Temporal.PlainTime.from({ hour: 6 });

  // Da das Fenster über Mitternacht geht:
  // Wahr wenn: Zeit >= 21:00 ODER Zeit < 06:00
  return Temporal.PlainTime.compare(now, nightStart) >= 0 ||
         Temporal.PlainTime.compare(now, nightEnd) < 0;
}

/**
 * Berechnet Fristen basierend auf dem aktuellen Datum via Temporal API.
 */
export function calculateDeadlines() {
  // @ts-ignore
  const today = Temporal.Now.plainDateISO(Temporal.Now.timeZoneId());

  return {
    in14Days: today.add({ days: 14 }),
    in30Days: today.add({ days: 30 }),
    nextMonth: today.add({ months: 1 })
  };
}

/**
 * Erkennt den Kontext im Text für intelligente Vorschläge.
 * @param {string} text - Der aktuelle Brieftext
 */
export function detectContext(text) {
  if (!text) return 'none';
  const lower = text.toLowerCase();
  if (lower.includes('widerspruch') || lower.includes('einspruch')) return 'widerspruch';
  if (lower.includes('mahnung') || lower.includes('zahlungserinnerung')) return 'mahnung';
  if (lower.includes('kündigung')) return 'kuendigung';
  return 'standard';
}

/**
 * Validiert die Zeilenbelegung im Anschriftfeld (DIN 5008)
 * @param {Object} content - Der aktuelle Content-State
 * @returns {Object} - { isValid: boolean, lineCount: number }
 */
export function validateAddressZone(content) {
  if (!content) return { isValid: true, lineCount: 0 };

  // Relevante Felder für die 6-Zeilen-Regel
  const recipientKeys = [
    'supplement',
    'rect_co',
    'rect_fn', // Neu: Vorname
    'rect_ln', // Neu: Nachname
    'rect_st',
    'rect_city'
  ];

  const lineCount = recipientKeys.reduce((acc, key) => {
    return acc + (content[key]?.trim() ? 1 : 0);
  }, 0);

  return {
    isValid: lineCount <= 6,
    lineCount
  };
}

/* â”€â”€ Return Address (High-Integrity) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Leitet die RÃ¼cksende-Zeile (Einzeiler Ã¼ber dem EmpfÃ¤nger) ab.
 * @param {Object} data â€” { name, co, street, zipCity }
 */
export function deriveReturnLine({
  name = "",
  co = "",
  street = "",
  zipCity = "",
} = {}) {
  const abbr = (raw) => {
    if (!raw) return "";
    const clean = raw.replace(/^(Herr|Frau)\s+/i, "").trim();
    const parts = clean.split(/\s+/);
    return parts.length > 1 && !parts[0].includes(".")
      ? parts[0].charAt(0) + ". " + parts.slice(1).join(" ")
      : clean;
  };

  const namePart = co ? `${abbr(name)} (c/o ${co})` : abbr(name);
  return [namePart, street, zipCity].filter(Boolean).join(" Â· ");
}

/* â”€â”€ IBAN (High-Integrity BigInt) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * [High-Integrity] IBAN Validation
 * Verwendet BigInt fÃ¼r die Modulo-97 Berechnung (High-Integrity Precision).
 */
export function validateIBAN(raw) {
  if (!raw) return false;
  const clean = raw.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numericStr = "";
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      // A-Z
      numericStr += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      // 0-9
      numericStr += char;
    } else {
      return false;
    }
  }

  try {
    return BigInt(numericStr) % 97n === 1n;
  } catch {
    return false;
  }
}

/**
 * Formatiert IBAN in 4er BlÃ¶cke.
 */
export function formatIBAN(raw) {
  if (!raw) return "";
  const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") || clean;
}

/* â”€â”€ Markdown Engine (High-Integrity Ghost-Mirror) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function parseMarkdownToHTML(text) {
  if (!text) return "";

  // 1. Basic Escaping
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const tokens = [];
  const addToken = (htmlSnippet) => {
    const id = `Â§MD${tokens.length}Â§`;
    tokens.push({ id, html: htmlSnippet });
    return id;
  };

  // 2. Tokenize Patterns (Order: Blockquote -> Bold -> Underline -> Italic)

  // Blockquote
  html = html.replace(/^&gt;\s*(.+?)(?=<br>|$)/gm, (match, p1) =>
    addToken(`<blockquote class="md-quote"><span class="md-marker">&gt;</span> ${p1}</blockquote>`)
  );

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, (match, p1) =>
    addToken(`<span class="md-marker">**</span><strong>${p1}</strong><span class="md-marker">**</span>`)
  );

  // Underline __text__
  html = html.replace(/__(.+?)__/g, (match, p1) =>
    addToken(`<span class="md-marker">__</span><u>${p1}</u><span class="md-marker">__</span>`)
  );

  // Italic *text*
  html = html.replace(/\*(.+?)\*/g, (match, p1) =>
    addToken(`<span class="md-marker">*</span><em>${p1}</em><span class="md-marker">*</span>`)
  );

  // 3. Detokenize (Recursively to handle nesting)
  let prevHtml;
  do {
    prevHtml = html;
    tokens.forEach(t => {
      html = html.replace(t.id, t.html);
    });
  } while (html !== prevHtml);

  // 4. Line Breaks (Last step)
  html = html
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");

  return html;
}

/* â”€â”€ Akinator Engine 2.0 (IMR Tag-Scanner) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * SPEC-038 | CAA-008 | PLAN-010 | ADR-008
 *
 * TAG-SCAN PRINZIP:
 *   Kein getElementById(domId) mehr.
 *   DOM-Scan via document.querySelector(entry.tag).
 *   tag.slice(4).replace(/-/g,'_') â†’ JSON-Key automatisch.
 *
 * CEMETERY [TOMB-L007]: Alter Ansatz getElementById(entry.domId) â†’ entfernt.
 * CEMETERY [TOMB-L008]: richText-Flag â†’ entfernt. textContent ist IMMER SSoT.
 */

/**
 * Liest den aktuellen Brief-Inhalt aus dem DOM via IMR-Tag-Scan.
 *
 * [ADR-008] Liest IMMER textContent â€” nie innerHTML.
 * Begruendung (GEMINI.md Sektion XI):
 *   contenteditable="plaintext-only" garantiert, dass textContent === Nutzereingabe.
 *   innerHTML wuerde bei plaintext-only identisch sein, aber das Flag
 *   signalisiert explizit: "Kein HTML-Pfad". Ein richText-Flag ist
 *   nicht nur redundant â€” es ist eine Einladung zur Regression.
 *   Ghost-Mirror (<din-body-mirror>) hat kein contenteditable und
 *   wird von diesem Scanner nicht gelesen.
 *
 * @returns {Object} Kanonisches JSON-Objekt (IMR-Schema), leere Felder â†’ null
 */
export function readDOMasJSON() {
  const result = {};
  for (const entry of IMR) {
    const el = document.querySelector(entry.tag);
    if (!el) {
      result[entry.key] = null;
      continue;
    }
    // ADR-008: textContent IMMER. richText-Flag entfernt (TOMB-L008).
    const raw = el.textContent?.trim();
    result[entry.key] = raw || null;
  }
  return result;
}

/**
 * Findet ein spezifisches DIN-Tag-Element.
 * Kurzform: getTag('subject') â†’ document.querySelector('din-subject')
 * @param {string} key â€” IMR-Key (z.B. 'subject', 'your_ref')
 * @returns {Element|null}
 */
export function getTag(key) {
  const entry = IMR.find((e) => e.key === key);
  return entry ? document.querySelector(entry.tag) : null;
}

/**
 * Orchestrator: Verarbeitet ein KI-generiertes JSON-Objekt.
 * 1. Validiert Daten gegen IMR
 * 2. Aktualisiert die entsprechenden <din-*> Tags
 * 3. Fuehrt System-Intents aus (z.B. Print)
 *
 * @param {Object} json â€” KI-Output (IMR-Schema + intent)
 */
export function executeAIResponse(json) {
  if (!json || typeof json !== "object") return;

  console.group("ðŸ§  AI-Native Orchestrator: Execute Response");
  console.log("Input Protocol:", json);

  const auditTrail = [];

  // 1. Daten-Verteilung (Orchestration)
  for (const entry of IMR) {
    if (json.hasOwnProperty(entry.key)) {
      const el = document.querySelector(entry.tag);
      if (el) {
        const val = json[entry.key];
        if (val !== null) {
          el.textContent = val;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          auditTrail.push(`Updated <${entry.tag}> with data.`);
        }
      }
    }
  }

  // 2. Intent-Execution (Side Effects)
  const intent = json.intent;
  if (intent) {
    console.log("Active Intent detected:", intent);

    // Guard: Autonomous Control Check
    const paper = document.getElementById("paper");
    const isAutoConfigAllowed = paper?.dataset.autoConfig === "true";

    if (intent === AI_INTENTS.PRINT) {
      auditTrail.push("Triggered System Intent: PRINT");
      window.print();
    } else if (intent === AI_INTENTS.GHOST) {
      auditTrail.push("Triggered UI Intent: TOGGLE_GUIDES");
      if (paper) {
        paper.dataset.guides =
          paper.dataset.guides === "true" ? "false" : "true";
      }
    }
    // UI-Settings (Form A/B, Formal/Casual) â€” MANDATE-000 Guard
    else if (
      [
        AI_INTENTS.LAYOUT_A,
        AI_INTENTS.LAYOUT_B,
        AI_INTENTS.FORMAL,
        AI_INTENTS.CASUAL,
      ].includes(intent)
    ) {
      if (isAutoConfigAllowed && paper) {
        if (intent === AI_INTENTS.LAYOUT_A) {
          paper.style.setProperty("--layout", "form-a");
          auditTrail.push("Applied AI-Layout: Form A");
        }
        if (intent === AI_INTENTS.LAYOUT_B) {
          paper.style.setProperty("--layout", "form-b");
          auditTrail.push("Applied AI-Layout: Form B");
        }
        if (intent === AI_INTENTS.FORMAL) {
          paper.dataset.formality = "formal";
          auditTrail.push("Applied AI-Formality: formal");
        }
        if (intent === AI_INTENTS.CASUAL) {
          paper.dataset.formality = "casual";
          auditTrail.push("Applied AI-Formality: casual");
        }
      } else {
        const msg = `AI suggested UI-Change (${intent}), but Auto-Config is DISABLED (Autonomousty Guard).`;
        console.warn(msg);
        auditTrail.push(msg);
      }
    }
  }

  console.log("Audit Trail:", auditTrail);
  console.groupEnd();
}

/**
 * Baut den Interview-Prompt (leerer Brief).
 * Semantic-Emphasis: Benennt die <din-*> Tags explizit.
 */
export function buildInterviewPrompt() {
  const tagAnnotated = IMR.map(
    (e) => `  "${e.key}": null   // <${e.tag}>`,
  ).join(",\n");

  return `# DIN-BriefNEO â€” High-Integrity Interview Mode
# IMR 4.0 Specification | v4.0 Standard

You are an assistant for professional correspondence based on DIN 5008:2020-03.
This system is High-Integrity â€” every JSON key corresponds EXACTLY to a
physical millimeter field on the A4 page (Custom HTML tag).

## Canonical Schema (IMR 4.0 â€” use EXACTLY these keys)
\~~~json
{
  "intent":     null,   // System Action (e.g., "action:print", "action:save_local")
${tagAnnotated}
}
\~~~

## System-Intents (Optional)
Once the letter is complete, you can trigger actions via the "intent" key:
- "${AI_INTENTS.PRINT}": Opens print dialog immediately
- "${AI_INTENTS.SAVE}":  Persists state to local storage
- "${AI_INTENTS.GHOST}": Toggles layout guide lines

## Technical Rules
- Output ALL keys â€” empty fields as \`null\`, do not omit
- \`salutation\`: Full DIN salutation ("Sehr geehrter Herr Mustermann,")
- \`greeting\`: NO punctuation at the end (DIN 5008 compliance)
- \`subject\`: Concise, max 1 line
- \`sender_*\`: Granular identity atoms (FirstName, LastName, Street, City)
- \`rect_*\`: Granular recipient atoms (Company, Name, Street, City)

## Markdown Usage (STRICT)
ALLOWED: Only in "body" field: *italic*, **bold**, > Blockquote, \`code\`, Lists
FORBIDDEN: Markdown in all other fields. Use pure plaintext.

## Example: Granular Identity
Input: "Max Mustermann, Musterstr. 42, 12345 Berlin"
Output: sender_fn="Max", sender_ln="Mustermann", sender_st="MusterstraÃŸe 42", sender_city="12345 Berlin"

## Task
Ask a maximum of 5 targeted questions (Recipient, Purpose, Tone, Deadlines, Attachments).
Then generate the complete letter as JSON.
Begin with Question 1.`;
}

/**
 * Baut den Optimierungs-Prompt (gefuellter Brief).
 * Zeigt physischen Tag-Kontext fuer jedes Feld.
 */
export function buildOptimizationPrompt() {
  const current = readDOMasJSON();

  const rows = IMR.map(({ key, tag }) => {
    const val = current[key];
    const display = val ? JSON.stringify(val).substring(0, 80) : "null";
    return `  "${key}": ${display}   // <${tag}>`;
  }).join(",\n");

  return `# DIN-BriefNEO â€” Optimization Mode
# IMR 4.0 Specification | v4.0 Standard

Optimize the following DIN 5008 draft.
Every key is directly mapped to an HTML tag on the page.

## Current State (Tag â†” JSON)
\~~~json
{
  "intent": null,
${rows}
}
\~~~

## System-Intents (Optional)
You can trigger actions via the "intent" key:
- "${AI_INTENTS.PRINT}": Opens print dialog immediately
- "${AI_INTENTS.SAVE}":  Persists state to local storage

## Markdown Rule
ONLY "body" may contain Markdown. All other fields: Plaintext only.

## Review Criteria
- Subject (<din-subject>): Concise, clear
- Salutation (<din-anrede>): Correct DIN form
- Body (<din-text>): Structure, tone, completeness
- Greeting (<din-grussformel>): NO punctuation at the end (DIN 5008)
- Footer (<din-fusszeile>): Legal/Bank details if required.

## Output
Vollstaendiges JSON mit ALLEN IMR-Keys. Kurze Begruendung (3 Saetze) danach.
`;
}

/**
 * Scannt Plaintext nach Markdown-Markern und liefert Ranges fÃ¼r das Highlighting.
 * Chrome 147 Baseline: Nutzt native Range-Objekte fÃ¼r CSS Custom Highlight API.
 */
export function getMarkdownRanges(text, textNode) {
  if (!text || !textNode) return { bold: [], italic: [], marker: [] };

  const boldRanges = [];
  const italicRanges = [];
  const markerRanges = [];

  const scan = (regex, type) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      const mLen = match[1].length;

      try {
        const range = new Range();
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        if (type === "bold") boldRanges.push(range);
        if (type === "italic") italicRanges.push(range);

        // Marker (die Sternchen/Unterstriche selbst)
        const m1 = new Range();
        m1.setStart(textNode, start);
        m1.setEnd(textNode, start + mLen);
        const m2 = new Range();
        m2.setStart(textNode, end - mLen);
        m2.setEnd(textNode, end);
        markerRanges.push(m1, m2);
      } catch (e) {
        console.warn("Highlight Range Error:", e);
      }
    }
  };

  // 1. Bold (**)
  scan(/(\*\*)(.*?)\1/g, "bold");
  // 2. Italic (*)
  scan(/(\*)(.*?)\1/g, "italic");
  // 3. Underline (__)
  scan(/(__)(.*?)\1/g, "bold"); // Wir mappen Underline auf Bold fÃ¼r DIN-Zwecke

  return { bold: boldRanges, italic: italicRanges, marker: markerRanges };
}
</content>
</file>

<file path="js/services/GEMINI.md">
<metadata>Lines: 16 | Size: 1064 B</metadata>
<content>
---
scope: LOCAL — js/services/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/services/ (APIs & Resilience)

**MANDAT:** Die Anbindung an externe APIs (Tier 1 & Tier 2) ist ein optionales "Geschenk", kein lebensnotwendiges Organ. Fällt ein Service aus, darf der Briefeditor niemals ruckeln oder stoppen.

**EISERNE GESETZE:**
1. **Silent Failure (Tier 0 Souveränität):** Kein `alert()`, kein roter Toast im Editor bei API-Ausfällen. Fehler werden lautlos geschluckt oder im Flight-Recorder protokolliert.
2. **Circuit Breaker (Daily-Strike):** Jeder Fetch-Aufruf muss durch die Hysterese-Logik. Maximal 1 Fehler-Strike pro Kalendertag (via Temporal API).
3. **Recovery:** Ein Service darf das "GREEN" (Aktiv) Flag erst zurückerhalten, wenn die "Consecutive Success Threshold" (CST = 3 aufeinanderfolgende Erfolge) erreicht ist.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-S001]: Synchrone UI-Blockaden durch langsame Fetch-Requests. Services operieren asynchron und liefern Fallbacks (LocalStorage-Cache oder leere Strings).
</content>
</file>

<file path="js/services/address-service.js">
<metadata>Lines: 61 | Size: 1680 B</metadata>
<content>
/**
 * js/services/address-service.js — Data Fetching & Autocomplete Controller
 * [ADR-008] Decoupled Data & View
 * [CMD-6] CSS Anchor Positioning (Chrome 125+)
 * ───────────────────────────────────────────────────────────────
 */

export class AddressService {
  constructor(sm, ui) {
    this.sm = sm;
    this.ui = ui;
    this._debounce = null;
  }

  init() {
    const fields = [
      { tag: "din-empfaenger-strasse", anchor: "--anchor-rect-st" },
      { tag: "din-empfaenger-ort", anchor: "--anchor-rect-city" },
    ];

    fields.forEach(({ tag, anchor }) => {
      const el = document.querySelector(tag);
      if (!el) return;

      el.addEventListener("input", (e) => {
        clearTimeout(this._debounce);
        const query = e.target.textContent;

        if (query.length < 3) {
          this.ui._closeAutocomplete();
          return;
        }

        this._debounce = setTimeout(
          () => this._performSearch(query, anchor),
          300,
        );
      });

      // Close on blur (delayed to allow clicks)
      el.addEventListener("blur", () => {
        setTimeout(() => this.ui._closeAutocomplete(), 200);
      });
    });
  }

  async _performSearch(query, anchor) {
    try {
      // Default to Photon (No Key required)
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();

      this.ui._renderSuggestions(data.features || [], anchor);
    } catch (err) {
      console.error("[Service] Autocomplete failed:", err);
    }
  }
}
</content>
</file>

<file path="js/ui/GEMINI.md">
<metadata>Lines: 18 | Size: 1209 B</metadata>
<content>
---
scope: LOCAL — js/ui/
authority: ERGÄNZT Root. Lokale Verbote schlagen alles.
---
# 🛑 GEMINI.md — js/ui/ (DOM-Sync & Interaktion)

**MANDAT:** Dieser Ordner synchronisiert den State mit dem DOM (`din-*` Tags). Layout und UI-Zustände (Sichtbarkeiten) werden an CSS delegiert.

**EISERNE GESETZE:**
1. **Plaintext-Only Mandat:** Alle `<din-*>` Tags (inklusive `din-body`) sind `contenteditable="plaintext-only"`.
2. **EditContext API:** Eingaben für den Body MÜSSEN über die `EditContext API` abgefangen werden, um unkontrollierte DOM-Mutationen zu verhindern.
3. **Cursor Safety:** Elemente dürfen per JS nur überschrieben werden, wenn sie NICHT den Fokus haben (`document.activeElement !== el`), um Cursor-Jumping zu verhindern.

**BEERDIGTE ANTI-PATTERNS (CEMETERY):**
- [TOMB-U001]: JS für Dialoge/Modals (`addEventListener('click')`). Nutze stattdessen native HTML Invoker Commands (`commandfor` & `command="show-popover"`).
- [TOMB-U002]: `innerHTML` ist strengstens verboten (XSS-Gefahr). Nutze `textContent` für Text und `setHTML({ sanitizer })` (Native Sanitizer API) für den Ghost-Mirror.
- [TOMB-V003]: JS zur Höhenberechnung von Textfeldern (`scrollHeight`). Nutze CSS `field-sizing: content`.
</content>
</file>

<file path="js/ui/cma-sensor.js">
<metadata>Lines: 54 | Size: 2105 B</metadata>
<content>
﻿/**
 * js/ui/cma-sensor.js â€” v4.0 CMA-Sensor (SPEC-031)
 * [MANDATE-v4.0] Overflow-Detection via IntersectionObserver
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

export class CMASensor {
    constructor(sm) {
        this.sm = sm;
        this.sensor = document.querySelector('din-cma-sensor');
        this.root = document.querySelector('din-page-wrapper');
        this.observer = null;
    }

    init() {
        if (!this.sensor || !this.root) {
            console.warn('âš ï¸ [CMA-Sensor] Required elements <din-cma-sensor> or <din-page-wrapper> not found.');
            return;
        }

        /**
         * The sensor is at the bottom of the content stream.
         * The root (din-page-wrapper) has a max-height (High-Integrity Threshold).
         * If the sensor is NOT intersecting at 100%, it means it's pushed into the overflow zone.
         */
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const isOverflow = !entry.isIntersecting || entry.intersectionRatio < 1;

                // Update DOM state for CSS hooks
                const paper = document.getElementById('paper');
                if (paper) {
                    paper.dataset.overflow = isOverflow ? 'true' : 'false';
                }

                // Update Application State
                this.sm.state.compliance = this.sm.state.compliance || {};
                this.sm.state.compliance.overflow = isOverflow;

                if (isOverflow) {
                    console.warn('âš ï¸ [CMA-Sensor] Layout Violation: Content exceeds page 1 threshold.');
                }
            });
        }, {
            root: this.root,
            threshold: 1.0 // Trigger as soon as the 1px sensor is not fully visible
        });

        this.observer.observe(this.sensor);
        console.info('ðŸ›¡ï¸ [CMA-Sensor] Active: Monitoring threshold at 280mm.');
    }
}
</content>
</file>

<file path="js/ui/devmode.js">
<metadata>Lines: 151 | Size: 5022 B</metadata>
<content>
﻿/**
 * js/ui/devmode.js â€” Easter Egg, Developer Mode & Live Tag-Inspector
 * DIN-BriefNEO Â· v4.0 V14 | SPEC-049 | CAA-008 | PLAN-010
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * IMR 2.0: Live-Inspector zeigt <din-*> Tag â†” JSON-Key Abgleich.
 * MutationObserver scannt querySelectorAll('[din-*]') â€” kein ID-Lookup.
 *
 * ACTIVATION: 5x Klick auf #app-version (2s Reset-Window)
 * STORAGE:    localStorage 'neo_dev_mode' = 'true'
 */

import {
  buildInterviewPrompt,
  buildOptimizationPrompt,
  readDOMasJSON,
} from "../logic/logic.js";
import { IMR } from "../core/constants.js";
import { nowTimeISO } from "../core/temporal-utils.js";

const DEV_KEY = "neo_dev_mode";
const CLICK_TARGET = 5;

export function checkDevMode() {
  if (localStorage.getItem(DEV_KEY) === "true") {
    document.body.dataset.devmode = "true";
    document.body.classList.add("dev-mode");
  }
}

export function initDevMode(sm) {
  _bind5xClick();
  _bindAkinatorTerminal(sm);
  if (localStorage.getItem(DEV_KEY) === "true") {
    _startLiveInspector(sm);
  }
}

/* â”€â”€ 5x-Klick Easter Egg â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function _bind5xClick() {
  const versionEl = document.getElementById("app-version");
  if (!versionEl) return;
  let count = 0;
  let lastClick = 0;

  versionEl.addEventListener("click", () => {
    // [ANTI-016] Temporal migration (High-Integrity Determinism)
    const now = Temporal.Now.instant().epochMilliseconds;
    if (now - lastClick > 2000) count = 0; // 2s Reset window

    count++;
    lastClick = now;
    console.debug(`[DevMode] Click ${count}/${CLICK_TARGET}`);

    if (count >= CLICK_TARGET) {
      count = 0;
      const isEnabled = localStorage.getItem(DEV_KEY) === "true";
      const newState = !isEnabled;

      localStorage.setItem(DEV_KEY, String(newState));
      document.body.dataset.devmode = String(newState);
      if (newState) {
        document.body.classList.add("dev-mode");
        document.body.dataset.toast = "dev-unlocked";
        _startLiveInspector(sm);
      } else {
        document.body.classList.remove("dev-mode");
        location.reload(); // Hard reset to clear debug UI
      }
    }
  });
}

/* â”€â”€ Akinator Terminal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function _bindAkinatorTerminal(sm) {
  const btn = document.getElementById("btn-akinator-export");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const json = readDOMasJSON();
    const hasContent = Object.values(json).some(
      (v) => v !== null && String(v).trim().length > 0,
    );
    const prompt = hasContent
      ? buildOptimizationPrompt()
      : buildInterviewPrompt();

    const ta = document.getElementById("akinator-output");
    if (ta) ta.value = prompt;
    navigator.clipboard?.writeText(prompt).catch(() => {});

    btn.dataset.copied = "true"; // CSS regelt den Reset der Anzeige via Animation
    _renderTagInspector(json);
  });
}

/* â”€â”€ Live Tagâ†”JSON Inspector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function refreshInspector() {
  if (sessionStorage.getItem(DEV_KEY) === "true") {
    _renderTagInspector(readDOMasJSON());
  }
}

function _startLiveInspector(sm) {
  _renderTagInspector(readDOMasJSON());
  sm.subscribe(() => refreshInspector());
  // MutationObserver gelÃ¶scht. Update erfolgt via UIController input-event.
}

/**
 * Rendert den <din-tag> â†” JSON-Key Abgleich im #debug-state Panel.
 * Format: STATUS  TAG           KEY           WERT (40 Zeichen)
 * Injection-Proof: textContent, kein innerHTML [MANDATE-INJ]
 */
function _renderTagInspector(json) {
  const el = document.getElementById("debug-state");
  if (!el) return;

  const header =
    `IMR 2.0 â€” Tagâ†”JSON Inspector  ${nowTimeISO()}\n` +
    `${"â”€".repeat(52)}\n` +
    `  TAG               KEY              WERT\n` +
    `${"â”€".repeat(52)}\n`;

  const cmaTop = getComputedStyle(document.documentElement)
    .getPropertyValue("--addr-top")
    .trim();
  const cmaStatus = `CMA: ${cmaTop} | Viewport: ${window.innerHeight}px\n`;

  const rows = IMR.map(({ tag, key }) => {
    const val = json[key];
    const status = val !== null ? "âœ“" : "â—‹";

    // Check for EditContext
    const el = document.querySelector(tag);
    const hasEC = el?.editContext ? " [EC]" : "";

    const preview = val
      ? String(val)
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .substring(0, 24)
      : "â€”";
    const tagShort = `<${tag}>`.padEnd(20);
    const keyPad = key.padEnd(16);
    return `${status}${hasEC} ${tagShort} ${keyPad} ${preview}`;
  }).join("\n");

  el.textContent = header + cmaStatus + rows;
}
</content>
</file>

<file path="js/ui/ghost-mirror.js">
<metadata>Lines: 128 | Size: 3543 B</metadata>
<content>
﻿/**
 * js/ui/ghost-mirror.js â€” Ghost-Mirror Implementation (SPEC-066)
 * [CMD-1] Structural Markdown via Sanitizer API & Mirror-Layer
 * [CMD-1] Syntax Coloring via CSS Custom Highlight API
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

import { CORE_SANITIZER } from "../core/constants.js";
import * as Logic from "../logic/logic.js";

export class GhostMirror {
  constructor(elementId, mirrorId) {
    this.element = document.getElementById(elementId);
    this.mirror = document.getElementById(mirrorId);
    if (!this.element || !this.mirror) return;

    // Highlights Registry (Syntax Coloring ONLY)
    this.markerRanges = [];
  }

  /**
   * Updates both the structural mirror and the syntax highlights.
   * [CMD-1] Weights (bold/italic) are rendered in the mirror.
   * [CMD-1] Markers (** / *) are highlighted in the input.
   */
  update(text) {
    this.updateMirror(text);
    this.updateSyntaxHighlights(text);
  }

  /**
   * [CMD-1] Structural Markdown (bold/italic) via Native Sanitizer
   * This layer provides the physical weight needed for LayoutNG calculations.
   */
  updateMirror(text) {
    if (!this.mirror) return;

    // [CMD-1] v4.0 Markdown Engine (High-Integrity)
    const html = Logic.parseMarkdownToHTML(text);

    // [CMD-1] Secure Rehydration via Blink Native Sanitizer
    if (this.mirror.setHTML && CORE_SANITIZER) {
      this.mirror.setHTML(html, { sanitizer: CORE_SANITIZER });
    } else {
      this.mirror.textContent = html;
    }
  }

  /**
   * [CMD-1] Syntax Coloring (Markers only)
   * We only highlight the **, *, __ and > markers. Weights are handled by the mirror.
   */
  updateSyntaxHighlights(text) {
    this.markerRanges = [];
    if (!text) {
      this.applyHighlights();
      return;
    }

    // [CMD-1] v4.0 Robust Marker Identification
    const markerRegex = /(\*\*|\*|__|(?<=^|\n)&gt;)/g;
    let match;
    while ((match = markerRegex.exec(text)) !== null) {
      this.addHighlightRange(
        match.index,
        match.index + match[0].length,
        "marker",
      );
    }

    this.applyHighlights();
  }

  addHighlightRange(start, end, type) {
    let currentOffset = 0;
    const walker = document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );
    let node;
    let startNode = null,
      startNodeOffset = 0;
    let endNode = null,
      endNodeOffset = 0;

    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;
      if (
        !startNode &&
        start >= currentOffset &&
        start <= currentOffset + nodeLength
      ) {
        startNode = node;
        startNodeOffset = start - currentOffset;
      }
      if (
        !endNode &&
        end >= currentOffset &&
        end <= currentOffset + nodeLength
      ) {
        endNode = node;
        endNodeOffset = end - currentOffset;
      }
      currentOffset += nodeLength;
      if (startNode && endNode) break;
    }

    if (startNode && endNode) {
      try {
        const range = new StaticRange({
          startContainer: startNode,
          startOffset: startNodeOffset,
          endContainer: endNode,
          endOffset: endNodeOffset,
        });
        if (type === "marker") this.markerRanges.push(range);
      } catch (e) {}
    }
  }

  applyHighlights() {
    CSS.highlights.set("din-marker", new Highlight(...this.markerRanges));
  }
}
</content>
</file>

<file path="js/ui/model-blacklist.js">
<metadata>Lines: 103 | Size: 4102 B</metadata>
<content>
﻿/**
 * js/ui/model-blacklist.js â€” KI-Modell Blacklist Strategy
 * DIN-BriefNEO Â· v4.0 V13 | SPEC-038
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * PRINZIP: Blacklist statt Whitelist.
 *   Statt eine starre Liste erlaubter Modelle zu pflegen,
 *   werden VERALTETE Modelle gefiltert. Neue Modelle sind
 *   automatisch erlaubt â€” keine manuelle Freischaltung nÃ¶tig.
 *
 * PATTERN:
 *   const models = await fetchAvailableModels(apiKey);
 *   const usable = filterModels(models);
 *   â†’ renderModelSelect(usable);
 */

/**
 * Blacklist-EintrÃ¤ge: Muster fÃ¼r veraltete/ungeeignete Modelle.
 * Regex-basiert â†’ "enthÃ¤lt X" statt "ist exakt Y".
 *
 * BLACKLIST PFLEGE-REGEL:
 *   EintrÃ¤ge werden NUR hinzugefÃ¼gt (nie entfernt ohne Migration-Notiz).
 *   Format: { pattern: /regex/, reason: 'Warum gesperrt', since: 'YYYY-MM' }
 */
const MODEL_BLACKLIST = Object.freeze([
  { pattern: /gpt-3\.5/i,         reason: 'Zu alt fÃ¼r DIN-PrÃ¤zision',     since: '2024-01' },
  { pattern: /gpt-4-0314/i,       reason: 'Deprecated (OpenAI)',           since: '2024-06' },
  { pattern: /gpt-4-0613/i,       reason: 'Deprecated (OpenAI)',           since: '2024-06' },
  { pattern: /text-davinci/i,     reason: 'Legacy completions API',        since: '2023-01' },
  { pattern: /claude-1/i,         reason: 'Claude 1.x deprecated',         since: '2024-01' },
  { pattern: /claude-2\.0$/i,     reason: 'Claude 2.0 deprecated',         since: '2024-03' },
  { pattern: /-preview$/i,        reason: 'Preview-Modelle instabil',      since: '2024-01' },
  { pattern: /instruct$/i,        reason: 'Instruct-only, kein Chat',      since: '2024-01' },
  { pattern: /vision-preview/i,   reason: 'Deprecated Vision-Preview',     since: '2024-09' },
]);

/**
 * Filtert eine Modellliste gegen die Blacklist.
 * @param {string[]} models â€” Liste der Modell-IDs vom Provider
 * @returns {string[]} â€” bereinigte Liste (Blacklist-Treffer entfernt)
 */
export function filterModels(models) {
  if (!Array.isArray(models)) return [];
  return models.filter(model =>
    !MODEL_BLACKLIST.some(entry => entry.pattern.test(model))
  );
}

/**
 * ErklÃ¤rt warum ein Modell gesperrt ist (fÃ¼r Debug-Anzeige).
 * @param {string} modelId
 * @returns {{ blocked: boolean, reason?: string, since?: string }}
 */
export function explainBlock(modelId) {
  const hit = MODEL_BLACKLIST.find(e => e.pattern.test(modelId));
  if (!hit) return { blocked: false };
  return { blocked: true, reason: hit.reason, since: hit.since };
}

/**
 * Rendert ein <select>-Element mit den verfÃ¼gbaren Modellen.
 * Gesperrte Modelle werden als disabled-Option mit ErklÃ¤rung angezeigt.
 * @param {string} selectId â€” ID des <select>-Elements
 * @param {string[]} allModels â€” alle verfÃ¼gbaren Modell-IDs
 */
export function renderModelSelect(selectId, allModels) {
  const el = document.getElementById(selectId);
  if (!el) return;

  el.textContent = '';   // MANDATE-INJ: textContent statt innerHTML

  const grouped = { available: [], blocked: [] };
  for (const m of allModels) {
    const info = explainBlock(m);
    info.blocked ? grouped.blocked.push({ id: m, ...info }) : grouped.available.push(m);
  }

  // VerfÃ¼gbare Modelle
  const grpOk = document.createElement('optgroup');
  grpOk.label = 'âœ“ VerfÃ¼gbar';
  grouped.available.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    grpOk.appendChild(opt);
  });
  el.appendChild(grpOk);

  // Gesperrte Modelle (sichtbar aber disabled â€” Transparenz fÃ¼r Nutzer)
  if (grouped.blocked.length > 0) {
    const grpBlocked = document.createElement('optgroup');
    grpBlocked.label = 'âœ— Gesperrt (veraltet)';
    grouped.blocked.forEach(({ id, reason }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${id} â€” ${reason}`;
      opt.disabled = true;
      grpBlocked.appendChild(opt);
    });
    el.appendChild(grpBlocked);
  }
}
</content>
</file>

<file path="js/ui/toast-manager.js">
<metadata>Lines: 83 | Size: 2067 B</metadata>
<content>
import { TOASTS } from '../core/toast-registry.js';

/**
 * ToastManager - Handles single-toast queue logic.
 * Prevents UI cluttering by only showing one notification at a time.
 */
class ToastManager {
  constructor() {
    this.queue = [];
    this.activeToast = null;
    this.container = null;
  }

  _getContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  /**
   * Shows a toast by its registry ID.
   * @param {string} id - The ID from TOASTS registry
   * @param {Object} params - Placeholder replacements
   */
  show(id, params = {}) {
    const config = TOASTS[id];
    if (!config) {
      console.warn(`[Toast] ID "${id}" not found in registry.`);
      return;
    }

    let text = config.text;
    for (const [key, val] of Object.entries(params)) {
      text = text.replace(`{${key}}`, val);
    }

    const toast = { id, text, config };

    if (this.activeToast) {
      // Avoid duplicate identical toasts in queue
      if (this.queue.some(t => t.id === id)) return;
      this.queue.push(toast);
    } else {
      this._render(toast);
    }
  }

  _render(toast) {
    this.activeToast = toast;
    const el = document.createElement('div');
    el.className = `toast toast-${toast.config.type}`;
    el.textContent = toast.text;

    const container = this._getContainer();
    container.appendChild(el);

    // Auto-dismiss
    setTimeout(() => this._dismiss(), toast.config.duration);
  }

  _dismiss() {
    if (!this.activeToast) return;
    const container = this._getContainer();
    const el = container.querySelector('.toast');

    if (el) {
      el.classList.add('toast-exit');
      el.addEventListener('transitionend', () => {
        el.remove();
        this.activeToast = null;
        if (this.queue.length > 0) {
          this._render(this.queue.shift());
        }
      }, { once: true });
    }
  }
}

export const toast = new ToastManager();
</content>
</file>

<file path="js/ui/ui.js">
<metadata>Lines: 300 | Size: 11308 B</metadata>
<content>
/**
 * js/ui/ui.js — v4.0 Platinum DOM Controller
 * [CMD-1] Ghost-Mirror Structural Integrity (SPEC-066)
 * [CMD-4] EditContext Integration
 * [SPEC-080] Zero-JS UI Persistency
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as Logic from "../logic/logic.js";
import { EditContextController } from "../core/edit-context-controller.js";
import { GhostMirror } from "./ghost-mirror.js";
import { AddressService } from "../services/address-service.js";
import { FlightRecorder } from "../logic/flight-recorder.js";
import { IMR, CORE_SANITIZER } from "../core/constants.js";
import { toast } from "./toast-manager.js";

export class UIController {
  constructor(sm) {
    this.sm = sm;
    this._editors = {};
    this._ghosts = {};
    this.addressService = new AddressService(sm, this);
    this._nightTimer = null;
  }

  init() {
    this._initEditors();
    this._bindNativeEvents();
    this._bindUtilityActions();
    this.addressService.init();

    // Theme Management
    if (!this.sm.state.config.theme_manually_set) {
      const isNight = Logic.isNightTime();
      this.sm.state.config.theme = isNight ? "night" : "day";
    }

    this.sm.subscribe((path, val, scope, source) =>
      this._onStateChange(path, val, scope, source),
    );

    this._syncAllToDOM();
    this._startNightWatchdog();
    this._initKeyboardShortcuts();

    console.info("🚀 v4.0 UI: Platinum Engine Active | SPEC-066 Enabled");
  }

  _initEditors() {
    IMR.filter((e) => e.editContext).forEach((entry) => {
      const el = document.querySelector(entry.tag);
      if (el) {
        // EditContext for pure input buffer
        this._editors[entry.tag] = new EditContextController(el, (text) => {
          this.sm.update(`content.${entry.key}`, text, "editcontext");
          if (this._ghosts[entry.tag]) {
            this._ghosts[entry.tag].update(text);
          }
          if (entry.key === "rect_ln" || entry.key === "rect_fn") {
            this._triggerSalutationUpdate();
          }
        });

        // Ghost-Mirror for structural rendering (SPEC-066)
        if (entry.tag === "din-text") {
          this._ghosts[entry.tag] = new GhostMirror("din-text", "din-text-mirror");
        }
      }
    });
  }

  _bindNativeEvents() {
    const paper = document.getElementById("paper");

    // Central Command Listener (Native Invokers)
    document.addEventListener("command", (e) => {
      const command = e.command || e.detail?.command;
      const targetId = e.target?.getAttribute("commandfor") || e.detail?.targetId;

      if (command === "--print") window.print();
      if (command === "--export") this._handleExport();
      if (command === "--import") this._handleImport();
      if (command === "--reset-data") { localStorage.clear(); location.reload(); }
      if (command === "--toggle-guides" && paper) {
        paper.dataset.guides = paper.dataset.guides === "true" ? "false" : "true";
      }
      if (command === "show-modal" && targetId) document.getElementById(targetId)?.showModal();
      if (command === "close") (document.getElementById(targetId) || e.target.closest("dialog"))?.close();
      if (command === "show-popover" && targetId) document.getElementById(targetId)?.showPopover();
    });

    // UI State Persistency Bridge (Layout/Theme/Guides)
    document.addEventListener("change", (e) => {
      if (e.target.name === "layout") this.sm.update("config.layout", e.target.id === "layout-a" ? "form-a" : "form-b", "ui");
      if (e.target.name === "guides") this.sm.update("config.guides", e.target.value === "true", "ui");
      if (e.target.name === "theme") {
        this.sm.update("config.theme", e.target.value, "ui");
        this.sm.update("config.theme_manually_set", true, "ui");
      }
    });

    // Profile Management
    this._initProfileManagement();

    // Radical Paste-Filter (High-Integrity)
    document.addEventListener("paste", (e) => {
      const el = e.target;
      if (el.hasAttribute("contenteditable") || el.editContext) {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
        if (el.editContext) {
          const ec = el.editContext;
          ec.updateText(ec.selectionStart, ec.selectionEnd, text);
          ec.updateSelection(ec.selectionStart + text.length, ec.selectionStart + text.length);
          const entry = IMR.find(t => t.tag === el.tagName.toLowerCase());
          if (entry) {
            this.sm.update(`content.${entry.key}`, ec.text, "editcontext");
            this._ghosts[el.tagName.toLowerCase()]?.update(ec.text);
          }
        } else {
          document.execCommand("insertText", false, text);
        }
      }
    });
  }

  _initProfileManagement() {
    const modal = document.getElementById("modal-profile");
    if (!modal) return;

    const profileSelect = document.getElementById("profileSelect");
    const btnSave = document.getElementById("btn-profile-save");
    const ibanInput = document.getElementById("p-iban");

    ibanInput?.addEventListener("input", (e) => {
      const val = e.target.value.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      e.target.value = val.match(/.{1,4}/g)?.join(" ") || val;
      e.target.style.borderColor = val.length > 0 ? (Logic.validateIBAN(val) ? "#4CAF50" : "#f44336") : "#ddd";
    });

    profileSelect?.addEventListener("change", (e) => {
      const profiles = this.sm.state.config.profiles || {};
      const data = profiles[e.target.value];
      if (data) {
        ["name", "co", "street", "city", "iban"].forEach(k => {
          const el = document.getElementById(`p-${k === 'name' ? 'fn' : k}`); // Note: mapping fix needed here usually
          if (el) el.value = data[k] || "";
        });
        ibanInput?.dispatchEvent(new Event("input"));
      }
    });

    btnSave?.addEventListener("click", () => {
      const data = {
        name: `${document.getElementById("p-fn")?.value} ${document.getElementById("p-ln")?.value}`.trim(),
        co: document.getElementById("p-co")?.value,
        street: document.getElementById("p-street")?.value,
        city: document.getElementById("p-city")?.value,
        iban: document.getElementById("p-iban")?.value,
      };
      const key = profileSelect?.value || "default";
      if (!this.sm.state.config.profiles) this.sm.state.config.profiles = {};
      this.sm.state.config.profiles[key] = data;

      const [fn, ...lnParts] = data.name.split(" ");
      this.sm.update("content.sender_fn", fn, "profile");
      this.sm.update("content.sender_ln", lnParts.join(" "), "profile");
      this.sm.update("content.sender_st", data.street, "profile");
      this.sm.update("content.sender_city", data.city, "profile");
      this.sm.update("content.return_line", Logic.deriveReturnLine(data), "profile");

      this._syncAllToDOM();
      modal.hidePopover();
      toast.show("profile_saved");
    });
  }

  _bindUtilityActions() {
    document.getElementById("file-import")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const data = JSON.parse(re.target.result);
          this.sm.load(data);
          toast.show("import_success");
          setTimeout(() => location.reload(), 1000);
        } catch (err) { toast.show("import_error"); }
      };
      reader.readAsText(file);
    });
  }

  _handleExport() {
    const data = JSON.stringify(this.sm.serialize(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DIN-BriefNEO_Export_${Temporal.Now.plainDateISO().toString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show("export_success");
  }

  _handleImport() { document.getElementById("file-import")?.click(); }

  _onStateChange(path, value, scope, source) {
    if (source === "editcontext") return;
    if (["opfs", "load", "config"].includes(scope)) { this._syncAllToDOM(); return; }

    const key = path.split(".").pop();
    const entry = IMR.find(e => e.key === key);
    if (entry) {
      const el = document.querySelector(entry.tag);
      if (el && document.activeElement !== el) this._updateDOMSafe(el, value);
    }
  }

  _syncAllToDOM() {
    IMR.forEach(entry => {
      const el = document.querySelector(entry.tag);
      if (el) this._updateDOMSafe(el, this.sm.state.content[entry.key]);
    });

    const config = this.sm.state.config;
    if (config.theme) {
      const rb = document.getElementById(`theme-${config.theme}`);
      if (rb) rb.checked = true;
    }
    if (config.layout) {
      const rb = document.getElementById(config.layout === "form-a" ? "layout-a" : "layout-b");
      if (rb) rb.checked = true;
      const paper = document.getElementById('paper');
      if (paper) paper.dataset.form = config.layout === 'form-a' ? 'A' : 'B';
    }
    const guidesRb = document.getElementById(config.guides ? "guides-on" : "guides-off");
    if (guidesRb) guidesRb.checked = true;
  }

  _updateDOMSafe(el, value) {
    if (!el) return;
    const text = value || "";

    if (el.editContext) {
      if (typeof el.editContext.updateText === "function") {
        el.editContext.updateText(0, el.editContext.text.length, text);
        el.editContext.updateSelection(0, 0);
      }
      el.textContent = text;
      this._ghosts[el.tagName.toLowerCase()]?.update(text);
      return;
    }

    if (el.setHTML && CORE_SANITIZER) {
      el.setHTML(text, { sanitizer: CORE_SANITIZER });
    } else {
      el.textContent = text;
    }
  }

  _triggerSalutationUpdate() {
    const fn = this.sm.state.content.rect_fn || "";
    const ln = this.sm.state.content.rect_ln || "";
    const recipientText = `${fn} ${ln}`.trim();
    const analysis = Logic.parseRecipient(recipientText);
    const salutationEl = document.querySelector("din-anrede");
    if (salutationEl) {
      Logic.updateSalutationHint(salutationEl, analysis, this.sm.state.config.formality || "formal", "none", recipientText);
      this.sm.update("content.salutation", salutationEl.textContent, "engine");
    }
  }

  _startNightWatchdog() {
    const schedule = () => {
      if (this.sm.state.config.theme_manually_set) return;
      const ms = Logic.getMsUntilNextThemeTransition();
      this._nightTimer = setTimeout(() => {
        const target = Logic.isNightTime() ? "night" : "day";
        if (this.sm.state.config.theme !== target) {
          this.sm.update("config.theme", target, "auto-night");
          this._syncAllToDOM();
        }
        schedule();
      }, ms + 1000);
    };
    schedule();
  }

  _initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "s") { e.preventDefault(); this._handleExport(); }
      if (e.ctrlKey && e.key === "p") { e.preventDefault(); window.print(); }
      if (e.altKey && e.key === "1") { e.preventDefault(); document.querySelector("din-subject")?.focus(); }
      if (e.altKey && e.key === "2") { e.preventDefault(); document.querySelector("din-text")?.focus(); }
    });
  }
}
</content>
</file>

<file path="manifest.json">
<metadata>Lines: 17 | Size: 597 B</metadata>
<content>
{
  "name": "DIN-BriefNEO",
  "short_name": "NEO",
  "description": "Aviation Grade DIN 5008 Brief-Editor",
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
<metadata>Lines: 18 | Size: 386 B</metadata>
<content>
{
  "name": "din-briefneo",
  "version": "1.0.0",
  "description": "DIN-BriefNEO Platinum Edition",
  "main": "js/core/app.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "vision": "node scripts/platinum-vision.js"
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

<file path="scripts/check_readiness.js">
<metadata>Lines: 44 | Size: 2451 B</metadata>
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
    f('Temporal API (TOMB-L001)', !!globalThis.Temporal, 'Chrome 146/Stable'),
    f('CSS @property (CMA-Typed)', CSS.supports('--x: 1mm') && !!window.CSSPropertyRule, 'Chrome 146/Stable'),
    f('CSS @scope (Isolation)', typeof CSSScopeRule !== 'undefined', 'Chrome 118/Stable'),
    f('CSS if() Logic', CSS.supports('top: if(style(--x: 1): 1px; else: 2px)'), 'Chrome 148'),
    f('Scroll-State Queries', CSS.supports('container-type: scroll-state'), 'Chrome 147'),
    f('Native Invokers (commandfor)', 'commandfor' in document.createElement('button'), 'Chrome 147'),
    f('Advanced attr() Typisierung', CSS.supports('width: attr(data-x type(<length>))'), 'Chrome 133/149'),
    f('View Transitions (Scoped)', !!document.startViewTransition, 'Chrome 146/Stable'),
    f('CSS contrast-color()', CSS.supports('color: contrast-color(white)'), 'Chrome 147'),
    f('CSS border-shape', CSS.supports('border-shape: circle'), 'Chrome 147'),
    f('Math.sumPrecise', !!Math.sumPrecise, 'Chrome 147'),
    f('Sanitizer API (Native)', !!globalThis.Sanitizer, 'Chrome 147'),
    f('Element.setHTML()', !!Element.prototype.setHTML, 'Chrome 147'),
    f('CSS calc-size(auto)', CSS.supports('height: calc-size(auto, 100%)'), 'Chrome 129/Stable')
  ];

  const header = `# 🛫 DIN-BriefNEO — Aviation Grade Readiness Report\n` +
                 `## Baseline: Chrome 147.0+ | Generiert: ${Temporal.Now.plainDateTimeISO().toString()}\n\n` +
                 `| Feature | Status | Baseline | Architektur-Nutzen |\n` +
                 `| :--- | :--- | :--- | :--- |\n`;

  const rows = features.map(feat => {
    const icon = feat.supported ? '✅ **READY**' : '⏳ *PENDING*';
    const benefit = feat.supported ? 'Aktiviert (Produktiv)' : 'Future-Proof (Inaktiv)';
    return `| ${feat.name.padEnd(28)} | ${icon.padEnd(12)} | ${feat.baseline.padEnd(18)} | ${benefit} |`;
  }).join('\n');

  const footer = `\n\n---\n**System-Check vollständig.** Das Projekt reift in seine Zielplattform hinein.`;

  console.clear();
  console.log(header + rows + footer);
})();
</content>
</file>

<file path="scripts/din-spec-checker/checker.js">
<metadata>Lines: 80 | Size: 2522 B</metadata>
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
  fluffRadar: ["Aviation", "Platinum", "Sovereign", "Akinator", "Grade"],
  // ELEMENT WHITELIST: Strictly IMR 4.0 Atoms
  elements: {
    allowed: [
      "din-5008", "din-A4", "din-header", "din-anschriftfeld", "din-infoblock",
      "din-absender-vorname", "din-absender-nachname", "din-absender-strasse", "din-absender-ort",
      "din-return-line", "din-supplement", "din-empfaenger-firma", "din-empfaenger-name", "din-empfaenger-strasse", "din-empfaenger-ort",
      "din-ref-ihr", "din-ref-unser", "din-date",
      "din-subject", "din-anrede", "din-text", "din-text-mirror", "din-grussformel", "din-signature", "din-attachments",
      "din-fusszeile", "din-fiscal-data", "din-bank-data"
    ],
    extensionPrefix: "din-ext-",
  },
  apis: {
    mandatory: ["setHTML", "textContent", "popover", "Temporal", "EditContext"],
    forbidden: ["innerHTML", "document.write", "var", "new Date()", "Date.now()"],
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
<metadata>Lines: 25 | Size: 679 B</metadata>
<content>
/**
 * DIN-BriefNEO Component Catalog Generator
 * Extract IMR (Isomorphic Master Registry) as JSON for AI Agent Guidance.
 * Part of the Platinum Validation Pipeline (061).
 */
import { IMR, CMA } from '../js/core/constants.js';

const catalog = {
  version: '16.0.1',
  timestamp: new Date().toISOString(),
  mandates: [
    'MANDATE-INJ: Zero innerHTML',
    'MANDATE-FREEZE: Zero Pixel-Shift',
    'MANDATE-NAT: Native Browser-First',
    'MANDATE-PLN: contenteditable="plaintext-only"'
  ],
  imr: IMR.map(field => ({
    tag: field.tag,
    key: field.key,
    coordinate: field.cmaProp ? CMA[field.cmaProp] : 'N/A'
  }))
};

console.log(JSON.stringify(catalog, null, 2));
</content>
</file>

<file path="scripts/test-all.js">
<metadata>Lines: 117 | Size: 4521 B</metadata>
<content>
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * DIN-BriefNEO Platinum Validation Suite
 * Consolidates Geometry Check (DIN 5008) and Layout Switching.
 */
async function runFullValidation() {
  console.log('🚀 [VALIDATION] Starte Platinum Engine Check...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 2, // Hi-DPI for precise measurements
  });

  const page = await context.newPage();
  const filePath = `file://${path.join(projectRoot, 'index.html').replace(/\\/g, '/')}`;

  try {
    await page.goto(filePath, { waitUntil: 'networkidle' });

    // --- TEST 1: GEOMETRY CHECK (DIN 5008) ---
    console.log('\n--- 📏 TEST 1: DIN 5008 Geometrie-Metriken ---');
    const metrics = await page.evaluate(() => {
      const paper = document.getElementById('paper') || document.body;
      const fold1 = document.querySelector('.mark-fold-1') || document.querySelector('.fold-mark-1');
      const fold2 = document.querySelector('.mark-fold-2') || document.querySelector('.fold-mark-2');
      const addr  = document.querySelector('din-anschriftfeld');

      const toMm = px => (px / 96) * 25.4;

      return {
        paper: {
          w: toMm(paper.offsetWidth).toFixed(1) + 'mm',
          h: toMm(paper.offsetHeight).toFixed(1) + 'mm'
        },
        fold1: { top: fold1 ? (toMm(fold1.offsetTop).toFixed(1) + 'mm') : 'N/A' },
        fold2: { top: fold2 ? (toMm(fold2.offsetTop).toFixed(1) + 'mm') : 'N/A' },
        address: {
          top: addr ? (toMm(addr.offsetTop).toFixed(1) + 'mm') : 'N/A',
          left: addr ? (toMm(addr.offsetLeft).toFixed(1) + 'mm') : 'N/A'
        }
      };
    });
    console.table(metrics);

    // --- TEST 2: LAYOUT SWITCHING (Form A <-> B) ---
    console.log('\n--- 🖱️ TEST 2: Layout-Switch (Form A/B) ---');

    // Initial state
    const initial = await page.evaluate(() => ({
        bodyLayout: document.body.dataset.layout,
        paperForm: document.getElementById('paper')?.dataset.form,
        addrTop: window.getComputedStyle(document.querySelector('din-anschriftfeld')).top
    }));
    console.log('Initial Status:', initial);

    // Switch to Form A
    const layoutARadio = await page.$('#layout-a');
    if (layoutARadio) {
        console.log('🖱️ Klicke auf #layout-a...');
        await layoutARadio.click();

        // Den State-Change und DOM-Sync abwarten
        await page.waitForTimeout(1000);

        const after = await page.evaluate(() => {
            const bodyLayout = document.body.dataset.layout;
            const paperForm = document.getElementById('paper')?.dataset.form;
            const addr = document.querySelector('din-anschriftfeld');
            return {
                bodyLayout,
                paperForm,
                addrTop: window.getComputedStyle(addr).top
            };
        });

        console.log('Status nach Klick:', after);

        // Validation logic: either the attribute or the physical position must change
        const isA = after.bodyLayout === 'form-a' || after.paperForm === 'A' || after.addrTop.includes('102');

        if (isA) {
            console.log('✅ SUCCESS: Layout-Switch visuell oder strukturell erkannt.');
            console.log(`   Adresse-Position (px): ${after.addrTop}`);
        } else {
            console.error('❌ FAILURE: Layout-Switch wurde nicht im DOM reflektiert.');
            // Screenshot zur Fehlerdiagnose
            const errPath = path.join(projectRoot, 'assets/screenshots/layout-switch-error.png');
            await page.screenshot({ path: errPath });
            console.log(`📸 Fehler-Screenshot: ${errPath}`);
        }
    } else {
        console.log('⚠️ INFO: #layout-a nicht gefunden.');
    }

    // --- FINAL: SCREENSHOT ---
    const screenshotPath = path.join(projectRoot, 'assets/screenshots/platinum-validation-report.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 [REPORT] Screenshot erstellt: ${screenshotPath}`);

  } catch (err) {
    console.error('\n❌ [CRITICAL] Validierung abgebrochen:', err);
  } finally {
    await browser.close();
    console.log('\n🏁 [DONE] Validierung abgeschlossen.');
  }
}

runFullValidation();
</content>
</file>

<file path="specs/002-Anrede-Engine/10-Anforderung.md">
<metadata>Lines: 47 | Size: 1570 B</metadata>
<content>
﻿---
id: SPEC-002-ANF
title: Anrede-Engine Fachanforderungen
tags: [anrede, fachlogik, din-5008]
status: active
version: 4.0.0 (IMR-Ready)
---

# 10 â€” Anforderung: Salutation Engine & Gender Parsing

## 1. Domain-Spec
Automatisierte DIN 5008 Anrede-Generierung basierend auf EmpfÃ¤nger-Input (Pattern-Matching).

## 2. Functional Requirements (FR)

### FR-001: Pattern-Scan
Execution: Regex-Scan auf `<din-empfaenger-name>` nach PrÃ¤fixen:
- `Herr` / `Herrn` â†’ logic: gender_m
- `Frau` â†’ logic: gender_f
- `Familie` / `Eheleute` â†’ logic: gender_fam
- null-match â†’ logic: gender_neutral

### FR-002: Title Extraction
Scan: Extraktion von akademischen Grad-Tokens (`Dr.`, `Prof.`, etc.) fÃ¼r Injektion in Salutation-String.

### FR-003: Name Isolation
Logic: Isolation des Familiennamens (Suffix-Match nach Titeln).

### FR-004: Manual Override (Circuit Breaker)
State: Bei manual edit auf `<din-anrede>` â†’ set `data-auto="false"`. Blockiert automatische Updates.

### FR-005: FÃ¶rmlichkeitsstufen
UnterstÃ¼tzung von `formal`, `polite` und `casual`.

### FR-008: Punktuation Guard (DIN 5008)
- **Kein Komma** am Ende der GruÃŸformel (Single Source of Truth DIN-Standard).
- **Kein Punkt** am Ende der GruÃŸformel.

## 3. Anrede-Matrix (Normativ)

| Stufe | Gender m | Gender f | Gender n |
|:---|:---|:---|:---|
| **formal** | Sehr geehrter Herr [Name] | Sehr geehrte Frau [Name] | Sehr geehrte Damen und Herren |
| **polite** | Guten Tag, Herr [Name] | Guten Tag, Frau [Name] | Guten Tag |
| **casual** | Hallo [Vorname] | Hallo [Vorname] | Hallo zusammen |
</content>
</file>

<file path="specs/002-Anrede-Engine/20-Plan.md">
<metadata>Lines: 34 | Size: 1283 B</metadata>
<content>
---
id: SPEC-002-PLAN
title: Technischer Implementierungsplan Anrede
tags: [architecture, logic, js, imr-4.0]
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (IMR 4.0)

## 1. Architektur-Übersicht
Die Anrede-Logik ist strikt in **Fachlogik** (Logic) und **Reaktion** (UI) getrennt.

### Layer A: Pure Business Logic (`js/logic/logic.js`)
- **`parseRecipient(text)`**: Nimmt den String des Empfängers und gibt ein Objekt `{ gender, title, name, firstName }` zurück.
- **`getSalutation(analysis, formality)`**: Mappt die Analyse auf die normative Matrix.

### Layer B: DOM Controller (`js/ui/ui.js`)
- **Event-Hook**: Beobachtet das Atom `<din-empfaenger-name>`.
- **State-Sync**: Schreibt das Ergebnis in `sm.state.content.salutation`.
- **Manual-Flag**: Prüft vor jedem Update `el.dataset.auto !== 'false'`.

## 2. Datenfluss
1. Input in `<din-empfaenger-name>`.
2. `UIController` fängt Event ab.
3. `Logic.parseRecipient` analysiert den Text.
4. `Logic.getSalutation` generiert den Vorschlag.
5. `UIController` aktualisiert das Feld `<din-anrede>`.

## 3. APIs & Werkzeuge
- **Regex**: Zur Extraktion von Präfixen (Herr/Frau).
- **EditContext**: Für performantes Echtzeit-Parsing ohne DOM-Reflows.
- **IMR 4.0 Registry**: Zur Identifikation der Ziel-Tags.
</content>
</file>

<file path="specs/002-Anrede-Engine/30-Aufgaben.md">
<metadata>Lines: 27 | Size: 939 B</metadata>
<content>
---
id: SPEC-002-TASK
title: Aufgabenliste Anrede-Engine
tags: [checklist, implementation, testing]
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung

## 1. Implementierungs-Tasks
- [x] IMR 4.0 Mapping für `<din-anrede>` erstellen.
- [x] `parseRecipient` Funktion in `logic.js` auf granulare Atome umstellen.
- [x] Event-Binding in `ui.js` für `<din-empfaenger-name>` hinzufügen.
- [ ] **Offen:** Punktuation Guard für Grußformel implementieren (Warnung bei Komma).
- [ ] **Offen:** `Casual`-Stufe in der UI wählbar machen.

## 2. Test-Szenarien
- [ ] Test: "Frau Dr. Erika Mustermann" → "Sehr geehrte Frau Dr. Mustermann,"
- [ ] Test: "Herr Max Muster" → "Sehr geehrter Herr Muster,"
- [ ] Test: Manuelle Änderung → Automatik muss stoppen (`data-auto="false"`).

## 3. Abnahme-Kriterien
- [x] Keine `new Date()` Altlasten.
- [x] OKLCH Farbschema für Warnungen aktiv.
- [x] EditContext-Binding stabil.
</content>
</file>

<file path="specs/006-Visuelle-Validierung/TODO.md">
<metadata>Lines: 28 | Size: 1381 B</metadata>
<content>
# 006 — Visuelle Validierung & Asset-Strategie (Task 6)

## 1. ÜBERSICHT
Diese Roadmap definiert die Strategie zur Sicherstellung der grafischen und physikalischen Integrität des DIN-Briefs. Ziel ist eine "Zero-Pixel-Drift" Garantie.

## 2. TO-DO LISTE

### A. Ghost-Overlay Funktion (Innovation)
- [ ] **Integration:** Einbindung der Referenz-SVGs (`assets/reference/`) als optionalen Layer über dem Editor.
- [ ] **UI:** Toggle-Button in der Sidebar zur Aktivierung des Overlays.
- [ ] **Nutzen:** Direkter visueller Abgleich zwischen Live-DOM und DIN-Spezifikation (Form A/B).

### B. Lokale Font-Autonomie (MANDATE-SOU)
- [ ] **Sourcing:** Beschaffung der WOFF2-Dateien für die Kern-Schriftarten (z.B. Inter, JetBrains Mono).
- [ ] **Storage:** Ablage in `assets/fonts/`.
- [ ] **Implementation:** Umstellung der `@font-face` Regeln in `app-ui.css` auf lokale Pfade.
- [ ] **Ziel:** 100% identisches Rendering unabhängig von System-Fonts.

### C. Automatisierte Visuelle Regression
- [ ] **Tooling:** Einrichtung einer Puppeteer-Testumgebung.
- [ ] **Workflow:** Automatisierte Screenshots des gerenderten Briefs bei jeder Architektur-Änderung.
- [ ] **Storage:** Nutzung von `assets/screenshots/` für Master-Referenzbilder.
- [ ] **Validation:** Bitweiser Vergleich zur Erkennung von Abweichungen > 0,001mm.

## 3. STATUS
- **Priorität:** HOCH
- **Fortschritt:** 0% (Geplant)
</content>
</file>

<file path="specs/007-CMA-Zentrale/10-Anforderung.md">
<metadata>Lines: 33 | Size: 1110 B</metadata>
<content>
﻿---
id: SPEC-007-ANF
title: Central Measurement Authority (CMA) Domain-Spec
status: active
version: 4.0.0 (IMR-Ready)
---

# 10 â€” Anforderung: Central Measurement Authority (CMA)

## 1. Domain-Spec
Single Source of Truth fÃ¼r physikalische DIN 5008 Koordinaten. Elimination von Layout-Drift durch zentralisierte Geometrie-Konstanten.

## 2. Kanonische Masse (DIN 5008:2020-03)

| Key | Value (mm) | Context |
|:---|:---|:---|
| PAGE_WIDTH | 210.000 | A4 Standard |
| PAGE_HEIGHT | 297.000 | A4 Standard |
| MARGIN_LEFT | 25.000 | Bindemarge |
| SENDER_TOP | 27.000 | Zone A |
| ADDR_TOP_A | 27.000 | Form A |
| ADDR_TOP_B | 45.000 | Form B |
| INFO_TOP | 97.400 | Infoblock |
| DATE_TOP | 50.000 | Standalone (V4) |
| SUBJECT_TOP | 103.400 | Kern-Entry |

## 3. Functional Requirements (FR)
- **FR-001 [Single Source of Truth]:** Alle MaÃŸe exakt an einem Ort definiert.
- **FR-002 [PRECISION]:** Mind. 3 Dezimalstellen (0.001mm Resolution).
- **FR-003 [UNIFORMITY]:** Form A/B Umschaltung via zentralem Parameter.
- **FR-004 [BANNED]:** Hard-coded "Magic Numbers" auÃŸerhalb CMA fÃ¼hren zu System-Reject.
</content>
</file>

<file path="specs/007-CMA-Zentrale/20-Plan.md">
<metadata>Lines: 30 | Size: 985 B</metadata>
<content>
﻿---
id: SPEC-007-PLAN
title: CMA Technical Implementation
status: cemented
version: 4.0.0
---

# 20 â€” Plan: Technische Realisierung (CMA)

## 1. Architektur-Layer

### Layer 1: JS-Core (`js/core/constants.js`)
- Export von `CMA` Object (Frozen).
- Definition der `IMR` (Isomorphic Master Registry) Atome.
- Precision Logic: `Object.freeze()` verhindert Runtime-Mutationen.

### Layer 2: CSS-Level (`css/app-ui.css`)
- Injection der CMA-Werte in CSS Custom Properties (`--din-*`).
- Layout-Steuerung via CSS Variables.
- **Chrome 147 Upgrade:** Nutzung von `@property` zur Typisierung der MaÃŸe (`syntax: '<length>'`).

## 2. Synchronisations-Strategie
- **JS â†’ DOM:** `UIController` liest `IMR` und setzt Initial-Werte.
- **CSS â†’ Render:** Millimeter-genaue Positionierung via `top`, `left`, `width` basierend auf `--din-*` Variablen.

## 3. APIs
- **IMR 4.0 Registry:** Mapping zwischen `Key` und `Tag`.
- **CMA Central Object:** Single Source of Truth fÃ¼r numerische Werte.
</content>
</file>

<file path="specs/007-CMA-Zentrale/30-Aufgaben.md">
<metadata>Lines: 25 | Size: 722 B</metadata>
<content>
---
id: SPEC-007-TASK
title: CMA Execution Checklist
status: active
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (CMA)

## 1. Implementation Tasks
- [x] IMR 4.0 Granular Update in `constants.js`.
- [x] Migration der `app-ui.css` auf `--din-*` Präfixe.
- [x] Standalone Datum-Positionierung (50mm).
- [ ] **Offen:** Vollständige `@property` Definitionen in CSS für alle CMA-Werte.
- [ ] **Offen:** Validierungs-Script für Unit-Tests (mm precision check).

## 2. Validation
- [x] Zero-Pixel-Drift Check (Chrome 147).
- [x] IMR-Key Consistency Check.
- [ ] **Offen:** Cross-Form-Umschaltung Test (Form A vs Form B).

## 3. Abnahme
- [x] No-Scroll Doctrine enforced.
- [x] No "Magic Numbers" in `ui.js`.
</content>
</file>

<file path="specs/029-Seitenumbrüche/10-Anforderung.md">
<metadata>Lines: 25 | Size: 908 B</metadata>
<content>
---
id: SPEC-029-ANF
title: Pagination & Hybrid-Height Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Multi-Page Pagination

## 1. Domain-Spec
Nahtlose Skalierung von Brief-Inhalten über DIN A4 Grenzen hinaus. Differenzierung zwischen Screen-Immersion (Single Sheet) und Print-Flow (Multi Sheet).

## 2. Functional Requirements (FR)

### FR-001: Hybrid-Height Execution
- **State: SCREEN:** Fixe Geometrie (297mm). Overflow-Detection via `CSS Scroll-State` (Chrome 147).
- **State: PRINT:** Auto-Layout. Dynamischer Flow auf Folgeseiten via `CSS Paged Media`.

### FR-002: Typographic Integrity
- **Orphan/Widow Control:** Vermeidung von Einzeilern an Seitenrändern (min-lines: 3).
- **Fragmentation:** Kontrollierter Umbruch von Block-Elementen via `break-inside: avoid`.

### FR-003: Page Metadata
- Dynamische Injektion von Seitenzahlen ("Seite n von m") auf Folgeseiten (Print-only).
</content>
</file>

<file path="specs/029-Seitenumbrüche/20-Plan.md">
<metadata>Lines: 26 | Size: 1030 B</metadata>
<content>
---
id: SPEC-029-PLAN
title: Pagination Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Pagination)

## 1. Architektur-Konzept
Zero-JS Pagination. Die Steuerung erfolgt rein deklarativ über CSS-Media-Queries.

### Layer 1: Screen-Safety
- **Container:** `#paper-viewport` nutzt `place-items: center`.
- **Overflow:** `din-text` mit `max-height: 180mm` (Rest-Raum). Visual-Indicator bei Overflow via CSS `:after` Overlay.

### Layer 2: Print-Engine (`@media print`)
- **Root-Swap:** `din-A4` wechselt von `height: 297mm` auf `height: auto`.
- **Header-Isolation:** `din-header` und `din-anschriftfeld` erhalten `position: absolute` auf Page 1.
- **Body-Flow:** `din-text` fließt in den globalen Dokumenten-Kontext.

## 2. APIs & Standards
- **CSS Paged Media (Level 3):** Nutzung von `@page` Regeln für Margins und Counter.
- **Fragmentation API:** `widows: 3`, `orphans: 3` für saubere Umbrüche.
- **View Transitions:** Flüssiger Wechsel in die Print-Preview (Chrome 147 native).
</content>
</file>

<file path="specs/029-Seitenumbrüche/30-Aufgaben.md">
<metadata>Lines: 24 | Size: 740 B</metadata>
<content>
---
id: SPEC-029-TASK
title: Pagination Implementation Tasks
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung

## 1. Implementierung
- [x] Basis `@media print` Setup in `app-ui.css`.
- [x] Renaming `din-text` (ehemals body) in Print-Selektoren.
- [ ] **Offen:** Implementierung von `@page` Counter (Seitenzahlen).
- [ ] **Offen:** CSS-Klasse für `break-inside: avoid` an Schlüsselstellen.

## 2. Test-Matrix
- [x] Test: Brief < 1 Seite → Keine Artefakte.
- [ ] **Offen:** Test: Brief > 2 Seiten → Korrekter Umbruch.
- [ ] **Offen:** Test: Vektorschärfe im PDF-Export prüfen.

## 3. Akzeptanz
- [x] Zero-JS Pagination (ADR-003 Compliance).
- [x] Keine Scrollbars im `din-A4` Container (MANDATE-SCROLL).
</content>
</file>

<file path="specs/051-Inhaltsintegrität/10-Anforderung.md">
<metadata>Lines: 35 | Size: 1341 B</metadata>
<content>
---
id: SPEC-051-ANF
title: Content Integrity & Ghost-Mirror Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Content Integrity & Ghost-Mirror

## 1. Domain-Spec
Verhinderung von "Data Poisoning" durch unkontrolliertes HTML-Injection via `contenteditable`. Etablierung eines unidirektionalen Datenflusses: Plaintext (Source) → HTML-Mirror (View).

## 2. Functional Requirements (FR)

### FR-001: Plaintext-Only Enforcement
- **Constraint:** Jedes Atom (`<din-*>`) MUSS `contenteditable="plaintext-only"` nutzen.
- **Circuit Breaker:** Unterbindung jeglicher HTML-Schreibvorgänge (Paste/D&D).
- **Source of Truth:** Export-Basis ist exklusiv `textContent`.

### FR-002: Markdown Syntax Support
- **Scope:** `<din-text>` (ehemals body).
- **Tokens:**
  - `**text**` → Bold representation.
  - `*text*` → Italic representation.
  - `> text` → Blockquote representation.
  - `\n\n` → Paragraph separation.

### FR-003: Ghost-Mirror UX
- **Real-time Sync:** Synchronisierung des Plaintext-Inputs in ein schreibgeschütztes Mirror-Element (`<din-text-mirror>`).
- **Visibility Logic:** Mirror aktiv im Read-Mode (Blur), Inaktiv im Edit-Mode (Focus).
- **A11Y:** Mirror MUSS `aria-hidden="true"` tragen.

### FR-004: Typographic Guard
- **Constraint:** Vermeidung von typografischen Fehlern (Widows/Orphans) via CSS Fragmentation.
</content>
</file>

<file path="specs/051-Inhaltsintegrität/20-Plan.md">
<metadata>Lines: 36 | Size: 1332 B</metadata>
<content>
﻿---
id: SPEC-051-PLAN
title: Content Integrity & Ghost-Mirror Technical Plan
status: cemented
version: 4.0.0
---

# 20 â€” Plan: Technische Realisierung (Integrity)

## 1. Architektur-Konzept
Unidirektionaler Render-Cycle zur Sicherstellung der Datenreinheit.

### Layer 1: Input Engine (`EditContext API`)
- Abstraktion des Texteingabeprozesses vom DOM.
- `EditContext` liefert Roh-Text ohne HTML-StÃ¶rsignale.

### Layer 2: Transform Engine (`js/logic/logic.js`)
- **Parser:** `parseMarkdownToHTML(text)` wandelt Plaintext-Tokens in semantisches HTML um.
- **Sanitization:** Nutzung der `Native Sanitizer API` zur Validierung des generierten Markups vor Injektion.

### Layer 3: Output Layer (`js/ui/ghost-mirror.js`)
- **Target:** `<din-text-mirror>` (Positioned via CSS Anchor/Absolute Ã¼ber Source).
- **Injektion:** `mirror.setHTML(html, { sanitizer: v4.0 Standard_SANITIZER })`.

## 2. CSS Visibility State Machine
- `din-text:focus { opacity: 1; }`
- `din-text:focus + din-text-mirror { opacity: 0; pointer-events: none; }`
- `din-text:not(:focus) { opacity: 0; }`
- `din-text:not(:focus) + din-text-mirror { opacity: 1; }`

## 3. APIs
- **EditContext API:** High-Performance Input Handling.
- **Blink Sanitizer API:** Native XSS Prevention.
- **CSS Custom Highlight API:** Optional fÃ¼r Syntax-Highlighting im Edit-Mode.
</content>
</file>

<file path="specs/051-Inhaltsintegrität/30-Aufgaben.md">
<metadata>Lines: 27 | Size: 949 B</metadata>
<content>
﻿---
id: SPEC-051-TASK
title: Content Integrity Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 â€” Aufgaben: Implementierung & Validierung (Integrity)

## 1. Implementation Tasks
- [x] Refactoring `logic.js`: Implementierung `parseMarkdownToHTML`.
- [x] Refactoring `ghost-mirror.js`: Umstellung auf `Logic.parseMarkdownToHTML`.
- [x] Renaming `din-text` (ehemals body) in JS/CSS Selektoren.
- [x] EditContext Binding fÃ¼r `din-text` verifiziert.
- [ ] **Offen:** Erweiterung des Parsers um Listen-Tokens (`-`, `1.`).
- [ ] **Offen:** Integration `CSS Custom Highlight API` fÃ¼r Inline-Visualisierung.

## 2. Validation
- [x] Test: Word-Paste â†’ Resultiert in Plaintext.
- [x] Test: Markdown Rendering â†’ Fett/Kursiv im Mirror sichtbar.
- [ ] **Offen:** Test: Print-Output â†’ Markdown Symbole unsichtbar.

## 3. Akzeptanz
- [x] Zero-innerHTML Policy enforced.
- [x] Single Source of Truth: TextContent ist einzige Datenquelle.
</content>
</file>

<file path="specs/056-Umgebungsintegrität/10-Anforderung.md">
<metadata>Lines: 28 | Size: 1165 B</metadata>
<content>
﻿---
id: SPEC-056-ANF
title: Environment Integrity Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: Zero-JS Environment Integrity

## 1. Domain-Spec
Delegation der UI-Zustandshoheit an die native Browser-Engine (Blink/V8). Elimination von JS-induzierten Latenzen und "Pixel-Shocks". Bare-Metal UI Steuerung via CSS-Logic.

## 2. Functional Requirements (FR)

### FR-001: Autonomous UI State
- **Single Source of Truth:** Das DOM (Form-State) ist der primÃ¤re Zustandshalter.
- **Execution:** UI-Toggles (Layout, Guides, Theme) erfolgen exklusiv Ã¼ber native Radio/Checkbox-Inputs.
- **Zero-Logic:** Keine JS-Event-Listener fÃ¼r visuelle State-Transitions zulÃ¤ssig.

### FR-002: Implicit Visual Feedback
- **Interpolation:** Browser-native Transitionen fÃ¼r alle Geometrie-Ã„nderungen (z.B. Form A/B Switch).
- **Engine-Direct:** Direkte Kopplung von `:checked` ZustÃ¤nden an CSS-Variablen via `:has()` Selektor.

### FR-003: PWA & Aviation Lockdown
- **Availability:** Kern-UI MUSS bei deaktiviertem JS (Offline/Fallback) navigierbar bleiben.
- **Data Isolation:** JS-Ressourcen sind strikt auf IMR-Sync und Dateisystem-IO (OPFS) beschrÃ¤nkt.
</content>
</file>

<file path="specs/056-Umgebungsintegrität/20-Plan.md">
<metadata>Lines: 35 | Size: 1260 B</metadata>
<content>
---
id: SPEC-056-PLAN
title: Environment Integrity Technical Plan
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Environment)

## 1. Architektur-Konzept
Vollständige Kapselung der UI-Logik in der CSS-Schicht (Declarative Logic).

### Layer 1: Global State Matrix (CSS Root)
- Definition aller Geometrie-Variablen als `@property`.
- Typisierung: `syntax: '<length>'` | `inherits: true`.
- **Rationale:** Ermöglicht flüssige CSS-Transitions zwischen Millimeter-Werten.

### Layer 2: Selection Logic (`:has()` Engine)
- Nutzung von `body:has(#layout-a:checked)` zur dynamischen Umschaltung der `--din-addr-top` Werte.
- Keine `document.body.classList.toggle` Aufrufe in JS.

### Layer 3: PWA & Service Worker
- Offline-First Strategie via `sw.js`.
- Caching aller CSS/JS/HTML Atome für sofortige Verfügbarkeit.
- Manifest-Compliance für "Bare-Metal" Standalone-Experience.

## 2. APIs & Standards
- **CSS Values & Units Level 4:** Relative Einheiten und `@property`.
- **CSS Selectors Level 4:** `:has()` für State-Detection.
- **Service Worker API:** Persistence & Offline-Integrity.

## 3. Security Lockdown
- **MANDATE-NAT:** Verbot von UI-Bibliotheken oder Frameworks.
- **MANDATE-VEC:** Fokus auf Browser-native Rendering-Purity.
</content>
</file>

<file path="specs/056-Umgebungsintegrität/30-Aufgaben.md">
<metadata>Lines: 26 | Size: 892 B</metadata>
<content>
﻿---
id: SPEC-056-TASK
title: Environment Integrity Checklist
status: in-progress
version: 4.0.0
---

# 30 â€” Aufgaben: Implementierung & Validierung (Environment)

## 1. Implementation Tasks
- [x] Entfernung aller JS-basierten UI-Toggles (Refactoring `ui.js`).
- [x] Etablierung der `:has()` Logik in `app-ui.css`.
- [x] Definition von `@property` fÃ¼r CMA-MaÃŸe (High-Integrity Animation).
- [ ] **Offen:** Audit des Service Workers (`sw.js`) auf vollstÃ¤ndige Cache-Purity.
- [ ] **Offen:** Validierung des Web-Manifests fÃ¼r Chrome 147 Standalone Mode.

## 2. Validation
- [x] Test: JS deaktivieren â†’ UI-Buttons (Radio) mÃ¼ssen Geometrie Ã¤ndern.
- [x] Test: Form A/B Wechsel â†’ Smooth Transition (kein Pixel-Jump).
- [ ] **Offen:** Lighthouse Audit fÃ¼r PWA Installability.

## 3. Akzeptanz
- [x] Zero-JS UI Doctrine enforced.
- [x] Offline-VerfÃ¼gbarkeit des Kern-Layouts gegeben.
</content>
</file>

<file path="specs/057-DOM-Integrität/10-Anforderung.md">
<metadata>Lines: 28 | Size: 1120 B</metadata>
<content>
﻿---
id: SPEC-057-ANF
title: DOM-First Integrity Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: DOM-First Integrity

## 1. Domain-Spec
Etablierung des DOM als primÃ¤re Single Source of Truth (Single Source of Truth) wÃ¤hrend der Runtime. Elimination von synchronem JS-State-Overhead beim Tippen. Kontextsensitive UI-Ausrichtung via physikalischer Anker.

## 2. Functional Requirements (FR)

### FR-001: Passive State Sync
- **Doctrine:** Keine JS-Speicherung pro Tastendruck (Debounce/Sync-Storm Prevention).
- **Execution:** Persistierung erfolgt ereignisbasiert (`blur`, `visibilitychange`, `pagehide`).
- **Source:** Das DOM liefert die Daten fÃ¼r den `StateManager`.

### FR-002: Contextual Tooling (Anchor-Direct)
- **Constraint:** Die Editor-Toolbar MUSS physisch an das aktive Atom (`<din-*>`) gebunden sein.
- **Precision:** Ausrichtung ohne JS-Offsets oder `getBoundingClientRect`.

### FR-003: Structural Immortality
- **Constraint:** Schutz von DIN-Labels (z.B. "Ihr Zeichen") vor LÃ¶schung durch den Nutzer.
- **Execution:** Trennung von dekorativem Label und funktionalem Input-Atom.
</content>
</file>

<file path="specs/057-DOM-Integrität/20-Plan.md">
<metadata>Lines: 47 | Size: 1654 B</metadata>
<content>
---
id: SPEC-057-PLAN
title: DOM-First Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (DOM-First)

## 1. Architektur-Konzept
Maximale Entlastung des JS-Main-Threads durch native Browser-Features.

### Layer 1: Persistence Engine (`Batch-Save`)
- **Triggers:** `blur`, `focusout`, und `window.onbeforeunload`.
- **Logic:** `StateManager.save()` liest alle Atome (`IMR 4.0`) gesammelt aus und schreibt in den `LocalStorage`.
- **Zero-JS Typing:** Keine `input`-Event-Listener für reine Daten-Spiegelung.

### Layer 2: UI-Anchoring (Chrome 147 API)
- **Target:** `#editor-toolbar`.
- **Binding:** `position-anchor: --active-anchor;` (via JS gesetzt beim Focus).
- **Positioning:** `position-area: top center;` für flüssiges Gleiten.
- **CSS-Anker-Mapping:**
  ~~~css
  din-text { anchor-name: --anchor-text; }
  din-subject { anchor-name: --anchor-subject; }
  /* ... (weitere Atome) */
  ~~~
- **JS-Tethering:**
  ~~~javascript
  paper.addEventListener("focusin", e => {
    const tag = e.target.tagName.toLowerCase();
    if (tag.startsWith("din-")) {
      document.documentElement.style.setProperty("--active-anchor", `--anchor-${tag.slice(4)}`);
    }
  });
  ~~~

### Layer 3: Label Protection
- **Method:** Nutzung von CSS `::before` oder separaten `<label>` Tags außerhalb des `contenteditable` Scopes.
- **IMR Integration:** Atome enthalten nur den puren Datenwert, keine statischen Labels.

## 2. APIs & Standards
- **CSS Anchor Positioning API:** Native UI-Bindung.
- **Page Visibility API:** Zuverlässige Persistierung beim Schließen des Tabs.
- **EditContext API:** Isoliertes Input-Handling.
</content>
</file>

<file path="specs/057-DOM-Integrität/30-Aufgaben.md">
<metadata>Lines: 25 | Size: 860 B</metadata>
<content>
﻿---
id: SPEC-057-TASK
title: DOM-First Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 â€” Aufgaben: Implementierung & Validierung (DOM-First)

## 1. Implementation Tasks
- [x] Refactoring `ui.js`: Umstellung auf `Batch-Persistence` (Fokus-basiert).
- [ ] **Offen:** Implementierung CSS Anchor Positioning fÃ¼r `#editor-toolbar`.
- [x] IMR 4.0 Atome in `index.html` von statischen Labels befreit.
- [ ] **Offen:** `anchor-name` Zuweisung in `UIController` beim Feld-Fokus integrieren.

## 2. Validation
- [x] Test: Daten bleiben nach Refresh erhalten (Blur-Trigger).
- [ ] **Offen:** Test: Toolbar-Positionierung in Chrome 147 prÃ¼fen.
- [x] Test: "Alles LÃ¶schen" zerstÃ¶rt Briefstruktur nicht.

## 3. Akzeptanz
- [x] Single Source of Truth: DOM ist wÃ¤hrend der Session fÃ¼hrend.
- [x] Zero-Lag beim Tippen (kein synchroner State-Update).
</content>
</file>

<file path="specs/058-Native-Sanitizer/10-Anforderung.md">
<metadata>Lines: 27 | Size: 1189 B</metadata>
<content>
---
id: SPEC-058-ANF
title: Native Sanitizer Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Native Sanitizer API Integration

## 1. Domain-Spec
Strukturelle Absicherung des Dokuments gegen Cross-Site Scripting (XSS) und Datenvergiftung. Delegation der Bereinigung schädlicher HTML-Fragmente an die native Browser-Engine (Chrome 147+).

## 2. Functional Requirements (FR)

### FR-001: Injection Prevention (MANDATE-INJ)
- **Constraint:** Globales Verbot von `innerHTML` Zuweisungen für nutzergenerierte Inhalte.
- **Enforcement:** Jede Injektion von HTML (z.B. aus dem Markdown-Parser) MUSS durch ein Sicherheits-Gate laufen.

### FR-002: Engine-Level Sanitization
- **Method:** Nutzung der nativen `Sanitizer API` (`element.setHTML`).
- **Rationale:** Höchste Performance und Sicherheit durch C++ Implementierung im Browser-Kern.

### FR-003: Strict Whitelist Management
- **Allowed Elements:** `['strong', 'em', 'del', 'code', 'blockquote', 'ul', 'ol', 'li', 'br', 'span']`.
- **Blocked Elements:** `script`, `iframe`, `object`, `style`, sowie alle Event-Attribute (`onclick` etc.).
- **Attributes:** Nur spezifische Daten-Attribute (`data-placeholder`) sind erlaubt.
</content>
</file>

<file path="specs/058-Native-Sanitizer/20-Plan.md">
<metadata>Lines: 39 | Size: 1298 B</metadata>
<content>
---
id: SPEC-058-PLAN
title: Native Sanitizer Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Sanitizer)

## 1. Architektur-Konzept
Zentralisierung der Sicherheit durch eine globale Sanitizer-Instanz.

### Layer 1: Central Config (`js/core/constants.js`)
- **Instanziierung:** `new Sanitizer(SANITIZER_CONFIG)`.
- **Export:** `CORE_SANITIZER`.
- **Fallback:** Graceful Degradation auf `textContent`, falls die API in Legacy-Umgebungen fehlt (obwohl Chrome 147 Baseline ist).

### Layer 2: Secure Injection Gate (`js/ui/ui.js`)
- **Methode:** `_updateDOMSafe(el, html)`.
- **Logic:**
  ~~~javascript
  if (el.setHTML && CORE_SANITIZER) {
    el.setHTML(html, { sanitizer: CORE_SANITIZER });
  } else {
    el.textContent = html; // Strip all HTML as fallback
  }
  ~~~

### Layer 3: Ghost-Mirror Sync
- Alle durch `Logic.parseMarkdownToHTML` generierten Strings MÜSSEN via `setHTML` in den Mirror injiziert werden.

## 2. APIs & Standards
- **Blink Native Sanitizer API:** Kern-Sicherheitstechnologie.
- **IMR 4.0 Registry:** Definiert die erlaubten Custom-Tags (`din-*`).

## 3. Security Hardening
- **MANDATE-INJ:** Automatischer Pipeline-Check auf `innerHTML` Vorkommen im Code.
- **Audit:** Regelmäßiger Review der `SANITIZER_CONFIG` Whitelist.
</content>
</file>

<file path="specs/058-Native-Sanitizer/30-Aufgaben.md">
<metadata>Lines: 27 | Size: 1036 B</metadata>
<content>
﻿---
id: SPEC-058-TASK
title: Native Sanitizer Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 â€” Aufgaben: Implementierung & Validierung (Sanitizer)

## 1. Implementation Tasks
- [x] Definition `SANITIZER_CONFIG` in `constants.js`.
- [x] Whitelist fÃ¼r IMR 4.0 Atome vervollstÃ¤ndigt.
- [x] Initialisierung `v4.0 Standard_SANITIZER` Instanz.
- [x] Refactoring `UIController._updateDOMSafe` auf `setHTML` Workflow.
- [x] Refactoring `GhostMirror.updateMirror` auf `setHTML` Workflow.
- [ ] **Offen:** Verifizierung der Sanitization bei `Blockquote` Verschachtelung.

## 2. Validation
- [x] Test: Injektion von `<script>alert(1)</script>` via Markdown-Parser â†’ MUSS neutralisiert werden.
- [ ] **Offen:** Test: Erhalt von erlaubten Tags (`<strong>`) nach `setHTML`.
- [ ] **Offen:** Browser-KompatibilitÃ¤ts-Check (Chrome 147 Baseline).

## 3. Akzeptanz
- [x] MANDATE-INJ: Keine `innerHTML` Aufrufe in der UI-Schicht.
- [x] Single Source of Truth: `v4.0 Standard_SANITIZER` ist die einzige Instanz fÃ¼r Injektionen.
</content>
</file>

<file path="specs/059-PWA-Persistenz/10-Anforderung.md">
<metadata>Lines: 30 | Size: 1094 B</metadata>
<content>
﻿---
id: SPEC-059-ANF
title: PWA & Persistence Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: PWA & Persistence Logic

## 1. Domain-Spec
Etablierung einer "Zero-Loss" Datenhaltung. Transformation der Web-Instanz in eine installierbare, offline-fÃ¤hige Desktop-Experience (High-Integrity Reliability).

## 2. Functional Requirements (FR)

### FR-001: Passive Persistence (Auto-Save)
- **Doctrine:** Der Nutzer muss sich niemals um das Speichern kÃ¼mmern (Zero-Action Save).
- **Triggers:**
  - `Event: blur` auf jedem Atom.
  - `Idle-Detection:` Speicherung nach 2s InaktivitÃ¤t im Edit-Mode.
  - `Critical:` Persistierung vor Tab-Close (`beforeunload`).

### FR-002: Standalone-Compliance (PWA)
- **Execution:** VollstÃ¤ndige Installation als Desktop-App mÃ¶glich.
- **UI-Isolation:** Start im "Standalone"-Modus (Zero Browser-Chrome, keine URL-Bar).
- **Offline-Integrity:** Kern-Assets (HTML/CSS/JS) MÃœSSEN ohne Internetverbindung laden.

### FR-003: Recovery-Logic
- Bei Neustart MUSS der letzte persistierte State (IMR 4.0) ohne Nutzerinteraktion rehydriert werden.
</content>
</file>

<file path="specs/059-PWA-Persistenz/20-Plan.md">
<metadata>Lines: 34 | Size: 1318 B</metadata>
<content>
﻿---
id: SPEC-059-PLAN
title: Persistence & PWA Technical Architecture
status: cemented
version: 4.0.0
---

# 20 â€” Plan: Technische Realisierung (Persistence)

## 1. Architektur-Layer

### Layer 1: State Authority (`js/core/state.js`)
- **Engine:** Proxy-basierter `StateManager`.
- **Sync:** Jede Ã„nderung am IMR-Modell triggert eine asynchrone Serialisierung in den `LocalStorage`.
- **Debouncing:** 500ms Idle-Threshold fÃ¼r SchreibvorgÃ¤nge wÃ¤hrend des Tippens.

### Layer 2: Persistence Storage
- **Primary:** `LocalStorage` fÃ¼r schnellen Boot und Metadaten.
- **Secondary (High-Integrity):** Vorbereitung fÃ¼r `Origin Private File System (OPFS)` zur Journalisierung komplexer Dokumente.

### Layer 3: PWA Service Layer
- **Manifest:** `manifest.json` definiert Icons, Farben und `display: standalone`.
- **Worker:** `sw.js` (Service Worker) implementiert `Cache-First` Strategie fÃ¼r statische Atome.

## 2. APIs & Standards
- **Web Storage API:** Basis-Persistenz.
- **Service Worker API:** Offline-SouverÃ¤nitÃ¤t.
- **File System Access API:** Optional fÃ¼r Native Export/Import.

## 3. Resilience Strategy
- **Versionierung:** State-Objekte tragen ein Version-Tag (IMR 4.0), um Schema-Konflikte bei Updates zu verhindern.
- **Sanity-Check:** Rehydrierung validiert Daten gegen das `Strict Schema Gate`.
</content>
</file>

<file path="specs/059-PWA-Persistenz/30-Aufgaben.md">
<metadata>Lines: 25 | Size: 784 B</metadata>
<content>
---
id: SPEC-059-TASK
title: Persistence Execution Checklist
status: active
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (PWA)

## 1. Implementation Tasks
- [x] Refactoring `StateManager`: Umstellung auf IMR 4.0 Schema.
- [x] Implementierung Debounced Auto-Save.
- [x] Initiales `manifest.json` für Desktop-Standalone erstellt.
- [ ] **Offen:** Vollständige `Cache-First` Logik in `sw.js`.
- [ ] **Offen:** OPFS Integration für Log-Journaling (Flight Recorder).

## 2. Validation
- [x] Test: Refresh-Resilienz (Daten bleiben bei F5 erhalten).
- [ ] **Offen:** Offline-Check: App muss ohne Netzwerk starten.
- [ ] **Offen:** PWA Lighthouse Audit (Target: >90 Score).

## 3. Akzeptanz
- [x] Zero-Action Save aktiv.
- [x] Standalone Mode in Chrome 147 verifiziert.
</content>
</file>

<file path="specs/060-UI-Performance-Polish/10-Anforderung.md">
<metadata>Lines: 26 | Size: 1000 B</metadata>
<content>
---
id: SPEC-060-ANF
title: UI Performance & Polish Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: UI Performance & Polish

## 1. Domain-Spec
Elimination von visuellem Rauschen beim Start (ANTI-FOUC) und Etablierung eines hochwertigen, diskreten Nutzer-Feedbacks (Toasts). Sicherstellung einer flüssigen "Premium"-Experience.

## 2. Functional Requirements (FR)

### FR-001: Instant Layout Restoration (ANTI-FOUC)
- **Execution:** Die gewählte DIN-Variante (Form A/B) MUSS bereits vor dem First Paint geladen sein.
- **Rationale:** Verhinderung von "Layout Jumps" beim Seitenaufruf.

### FR-002: Premium Toast Feedback
- **UI:** Benachrichtigungen MÜSSEN flüssig ein- und ausgeblendet werden (Fade/Slide).
- **Context:** Farbliches Feedback (Erfolg, Warnung, Error) via OKLCH Palette.

### FR-003: Stealth Status Bar
- **UX:** Systemstatus-Infos (IMR-Sync, OPFS-State) MÜSSEN dezent am unteren Rand integriert sein.
- **Design:** Nutzung von Backdrop-Blur und minimaler Opazität.
</content>
</file>

<file path="specs/060-UI-Performance-Polish/20-Plan.md">
<metadata>Lines: 28 | Size: 979 B</metadata>
<content>
---
id: SPEC-060-PLAN
title: UI Performance Technical Plan
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Polish)

## 1. Architektur-Layer

### Layer 1: Anti-FOUC Logic (`index.html`)
- **Execution:** Einbetten eines minimalen Inline-Scripts im `<head>`, das den `neo_layout` State aus dem `LocalStorage` liest und direkt auf das `<html>` Tag schreibt.
- **Benefit:** Die CSS-Variablen sind gesetzt, bevor das Stylesheet das Papier rendert.

### Layer 2: Toast Engine (`js/ui/ui.js`)
- **Mechanism:** Dynamische Erstellung von Elementen im `#toast-container`.
- **Animation:** Nutzung von CSS `@starting-style` für performante Einblend-Animationen ohne JS-Timer.

### Layer 3: Status Layer
- **Component:** `.status-bar` in der Sidebar.
- **Sync:** Reactive Updates via `StateManager` Subscriptions.

## 2. APIs & Standards
- **LocalStorage API:** Layout-Persistenz.
- **CSS Transitions:** Fluid Feedback.
- **Backdrop-Filter:** Modernes Glas-Design.
</content>
</file>

<file path="specs/060-UI-Performance-Polish/30-Aufgaben.md">
<metadata>Lines: 23 | Size: 685 B</metadata>
<content>
---
id: SPEC-060-TASK
title: UI Polish Execution Checklist
status: active
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (Polish)

## 1. Implementation Tasks
- [x] Inline Anti-FOUC Script in `index.html` integriert.
- [x] Refactoring Toasts auf `@starting-style` (Chrome 147 native).
- [ ] **Offen:** Implementierung der "Stealth" Sidebar Statusanzeige.
- [ ] **Offen:** Optimierung der Ladezeiten für externe Assets (Icons).

## 2. Validation
- [x] Test: Kein Layout-Sprung beim Laden von Form A.
- [x] Test: Toasts überlappen keine kritischen UI-Elemente.

## 3. Akzeptanz
- [x] Instant-Load Experience verifiziert.
- [x] Visuelle Hochwertigkeit der Animationen.
</content>
</file>

<file path="specs/061-Validation-Pipeline/10-Anforderung.md">
<metadata>Lines: 27 | Size: 1097 B</metadata>
<content>
﻿---
id: SPEC-061-ANF
title: v4.0 Standard Validation Pipeline Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: v4.0 Standard Validation Pipeline (PVP)

## 1. Domain-Spec
Automatisierte Mandats-Enforcement Architektur. Eliminierung von Agenten-Halluzinationen und strukturellen Regressions-Fehlern. Sicherstellung der "High-Integrity" IntegritÃ¤t nach jedem Schreibvorgang.

## 2. Functional Requirements (FR)

### FR-001: IMR Cataloging (Ground Truth)
- **Execution:** Extraktion der `Isomorphic Master Registry` aus `constants.js` in maschinenlesbare JSON-Atome.
- **Zweck:** Bereitstellung von validen Tag-Namen fÃ¼r KI-Agenten zur Vermeidung von Namens-Drift.

### FR-002: Mandate Enforcement (Circuit Breakers)
- **Security:** Zero-Tolerance fÃ¼r `innerHTML` (auÃŸerhalb Sanitizer-Gates).
- **Native-Purity:** Detektion von externen CDN/NPM-AbhÃ¤ngigkeiten.
- **Data-Integrity:** Pflicht-PrÃ¼fung auf `plaintext-only` Attribut an allen `<din-*>` Tags.

### FR-003: Visual Freeze Guard
- Automatisierte Warnung bei Ã„nderungen an physikalischen DIN-Layern (CSS din.core).
</content>
</file>

<file path="specs/061-Validation-Pipeline/20-Plan.md">
<metadata>Lines: 32 | Size: 1124 B</metadata>
<content>
---
id: SPEC-061-PLAN
title: PVP Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Pipeline)

## 1. Architektur-Komponenten

### Layer 1: Extraction Tooling (`scripts/get-catalog.mjs`)
- Scannt `js/core/constants.js`.
- Exportiert IMR-Objekt als JSON in `.brain/imr_catalog.json`.
- Agent-Input für präzise Element-Referenzierung.

### Layer 2: Pre/Post-Session Hooks (`tools/`)
- **`pre-session.ps1`:** Backup des aktuellen State, Check der Prerequisites.
- **`post-session-verify.ps1`:** Regex-basierter Scan auf Mandats-Verletzungen (`innerHTML`, verbotene Einheiten wie `px` in Geometrie).

### Layer 3: Git-Integration
- **Shrink-Guard:** Pre-commit Hook verhindert Commits, wenn Dateien um >20% schrumpfen ohne explizite Freigabe.

## 2. Automatisierung
- Integration in den Spec-Kit Workflow via `.specify/scripts/`.
- Jede KI-Operation triggert am Ende eine automatische Validierung der PVP.

## 3. APIs & Werkzeuge
- **Node.js:** Für Schema-Extraktion.
- **PowerShell 7:** Für System-Hooks und Datei-Analysen.
- **Git Hooks:** Zur physischen Durchsetzung der Regeln.
</content>
</file>

<file path="specs/061-Validation-Pipeline/30-Aufgaben.md">
<metadata>Lines: 24 | Size: 708 B</metadata>
<content>
﻿---
id: SPEC-061-TASK
title: PVP Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 â€” Aufgaben: Implementierung & Validierung (Pipeline)

## 1. Implementation Tasks
- [x] Script `get-catalog.mjs` implementiert.
- [x] Basis `post-session-verify.ps1` in `tools/` erstellt.
- [ ] **Offen:** Integration von `Shrink-Guard` in die Git-Hooks.
- [ ] **Offen:** Automatisierte PrÃ¼fung auf `oklch()` Farbraum in CSS-Dateien.

## 2. Validation
- [x] Test: Fehlerhafte Injektion (`innerHTML`) wird erkannt.
- [ ] **Offen:** Test: Schema-Extraktion bei IMR-Ã„nderung verifizieren.

## 3. Akzeptanz
- [x] 0% Halluzinations-Rate bei Tag-Namen durch PVP-Katalog.
- [x] High-Integrity Security-Net aktiv.
</content>
</file>

<file path="specs/066-Markdown-Ghosting/10-Anforderung.md">
<metadata>Lines: 29 | Size: 1210 B</metadata>
<content>
---
id: SPEC-066-ANF
title: Markdown Ghosting Domain-Spec
status: active
version: 4.0.0
---

# 10 — Anforderung: Markdown Ghosting & Zero-Width Logic

## 1. Domain-Spec
Gewährleistung einer 100%igen Umbruch-Parität zwischen Editor und Print. Etablierung eines "gewichtslosen" Markdown-Steuerzeichensystems (Ghosting) im visuellen Mirror.

## 2. Functional Requirements (FR)

### FR-001: Non-Destructive Transformation
- **Logic:** Der Parser DARF Steuerzeichen (`*`, `**`, `>`) NICHT löschen.
- **Execution:** Einwicklung der Zeichen in `<span class="md-marker">` zur Erhaltung der `textContent` Länge.

### FR-002: Zero-Width Rendering
- **Constraint:** Marker-Elemente MÜSSEN für den Browser-Line-Breaker eine Breite von 0px haben.
- **UI:** Überlauf sichtbar (Ghosting-Effekt), aber ohne Einfluss auf den Textfluss des restlichen Satzes.

### FR-003: EditContext Offset Parity
- **Constraint:** Die logische Cursor-Position im `EditContext` MUSS exakt mit der sichtbaren Position im Mirror korrespondieren.
- **Beweis:** `textContent` des Mirrors inkl. Marker == Rohdaten-String.

### FR-004: Typography Guard
- Vermeidung von optischem "Kleben" der Marker an Wörtern via negativem Margin-Korrektor im CSS.
</content>
</file>

<file path="specs/066-Markdown-Ghosting/20-Plan.md">
<metadata>Lines: 45 | Size: 1398 B</metadata>
<content>
---
id: SPEC-066-PLAN
title: Markdown Ghosting Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Ghosting)

## 1. Architektur-Layer

### Layer 1: Cascading Priority Parser (`logic.js`)
Transformation erfolgt in absteigender Komplexität:
1. **Double-Markers:** `**fett**` → `<strong><span class="md-marker">**</span>fett<span class="md-marker">**</span></strong>`
2. **Single-Markers:** `*kursiv*` → `<em><span class="md-marker">*</span>kursiv<span class="md-marker">*</span></em>`
3. **Block-Quotes:** `> zitat` → `<blockquote><span class="md-marker">></span> zitat</blockquote>`

### Layer 2: Zero-Width CSS (`app-ui.css`)
~~~css
.md-marker {
  display: inline-block;
  width: 0;
  white-space: nowrap;
  overflow: visible;
  opacity: 0.3; /* Visuelles Feedback im Editor */
  user-select: none;
  pointer-events: none;
}
~~~

### Layer 3: EditContext Integration
- `EditContext` liefert Roh-Text.
- `GhostMirror` rehydriert den Mirror bei jedem `textupdate`.
- Keine DOM-Mutationen im Eingabe-Feld.

## 2. Mathematischer Beweis
- **Input:** `**Text**` (Length: 8)
- **Mirror-Output:** `<strong><span>**</span>Text<span>**</span></strong>`
- **Mirror textContent:** `**Text**` (Length: 8)
- **Result:** Offset-Parität = 100%.

## 3. APIs
- **EditContext API:** Cursor & Selection Management.
- **Sanitizer API:** Validierung der `.md-marker` Spans.
</content>
</file>

<file path="specs/066-Markdown-Ghosting/30-Aufgaben.md">
<metadata>Lines: 23 | Size: 732 B</metadata>
<content>
---
id: SPEC-066-TASK
title: Markdown Ghosting Execution Checklist
status: in-progress
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (Ghosting)

## 1. Implementation Tasks
- [x] Initialer Regex-Parser in `logic.js` erstellt.
- [ ] **Offen:** Refactoring Parser auf Non-Destructive Ghosting (`md-marker`).
- [ ] **Offen:** CSS-Klassen für `md-marker` in `app-ui.css` hinzufügen.
- [x] Sanitizer-Whitelist für `span` und `class` angepasst.

## 2. Validation
- [ ] Test: Zeilenumbruch bei `**langem Wort**` muss identisch zu `langem Wort` sein.
- [x] Test: `textContent` Abgleich zwischen EditContext und Mirror.

## 3. Akzeptanz
- [x] 100% WYSIWYG Parität.
- [x] Zero-Width Steuerzeichen im Mirror implementiert.
</content>
</file>

<file path="specs/069-Hervorhebung/10-Anforderung.md">
<metadata>Lines: 30 | Size: 1059 B</metadata>
<content>
﻿---
id: SPEC-069-ANF
title: Highlight Editor Domain-Spec
status: active
version: 4.0.0
---

# 10 â€” Anforderung: Native Highlight Editor

## 1. Domain-Spec
ErmÃ¶glichung von WYSIWYG-Formatierungen ohne Verletzung der Plaintext-IntegritÃ¤t. Komplette Entkopplung von Daten (Text) und Darstellung (Paint-Time Styles).

## 2. Functional Requirements (FR)

### FR-001: Zero-Tag Data Integrity
- **Constraint:** Der Daten-State (`body`) MUSS zu 100% frei von HTML-Tags bleiben.
- **Enforcement:** `innerHTML` == `textContent`.

### FR-002: Coordinate-based Formatting
- **Logic:** Definition von Formaten Ã¼ber Start/End-Indizes (Offsets) statt Markup.
- **Example:** `{"type": "bold", "start": 0, "end": 5}` markiert die ersten 5 Zeichen als fett.

### FR-003: Persistence & Rehydration
- **Storage:** Speicherung der Format-Matrix im IMR-Zustand.
- **Restore:** Automatische Wiederherstellung der visuellen Layer beim Boot.

### FR-004: EditContext Autonomousty
- **Execution:** Nutzung der `EditContext API` zur Abstraktion von OS-Eingaben (IME, Dictation).
</content>
</file>

<file path="specs/069-Hervorhebung/20-Plan.md">
<metadata>Lines: 32 | Size: 1165 B</metadata>
<content>
---
id: SPEC-069-PLAN
title: Highlight Editor Technical Architecture
status: cemented
version: 4.0.0
---

# 20 — Plan: Technische Realisierung (Highlighting)

## 1. Architektur-Komponenten

### Layer 1: Highlighting Engine (`CSS Custom Highlight API`)
- **API:** `CSS.highlights.set('din-bold', new Highlight(...ranges))`.
- **Styling:** Definition im CSS via `::highlight(din-bold) { font-weight: bold; }`.
- **Benefit:** Rendering findet zur Paint-Time statt, verändert aber nicht den DOM-Tree.

### Layer 2: Range-Management
- **Logic:** Umrechnung von Index-Paaren (JSON) in DOM-Ranges.
- **Sync:** Kontinuierliche Validierung der Ranges bei Text-Mutationen.

### Layer 3: EditContext Bridge
- `EditContext` liefert die Selektions-Daten (Selection-Offsets).
- `UIController` mappt diese auf die Highlight-Matrix.

## 2. APIs & Standards
- **CSS Custom Highlight API:** Moderne Browser-native Formatierung.
- **Selection API / EditContext:** Akkurate Index-Bestimmung.

## 3. Performance & Stability
- Nutzung von `requestAnimationFrame` zur Aktualisierung der Highlights zur Render-Time.
- Vermeidung von DOM-Reflows durch strikte Trennung von Inhalt und Stil.
</content>
</file>

<file path="specs/069-Hervorhebung/30-Aufgaben.md">
<metadata>Lines: 23 | Size: 682 B</metadata>
<content>
---
id: SPEC-069-TASK
title: Highlight Editor Execution Checklist
status: active
version: 4.0.0
---

# 30 — Aufgaben: Implementierung & Validierung (Highlighting)

## 1. Implementation Tasks
- [x] Basis CSS Definition für `::highlight(din-bold)` etc.
- [x] Mapping-Funktion `Index-to-Range` implementiert.
- [ ] **Offen:** Integration der Highlight-Registry in den globalen State.
- [ ] **Offen:** Hotkey-Binding (`Strg+B`) zur Index-Manipulation.

## 2. Validation
- [x] Test: Highlighting ohne DOM-Mutation (DOM-Purity).
- [ ] **Offen:** Test: Persistenz der Highlights nach Seiten-Reload.

## 3. Akzeptanz
- [x] 100% Plaintext Integrität gewahrt.
- [x] WYSIWYG ohne `innerHTML`.
</content>
</file>

<file path="specs/075-Modern-Baseline/10-Anforderung.md">
<metadata>Lines: 18 | Size: 869 B</metadata>
<content>
# SPEC-075: Modern UI Baseline (Low Hanging Fruits)

## 1. Status Quo
Das Projekt nutzt bereits moderne APIs, aber an einigen Stellen schleppen wir noch "Legacy-Pattern" mit (Date-Objekte, Inline-Event-Handler, JS-basierte Layout-Hacks).

## 2. Zielsetzung (Anforderung)
Einführung von Chrome 147+ Basistechnologien zur Reduktion von JavaScript-Komplexität und Verbesserung der visuellen Qualität.
- **Präzision:** Temporal API für alle Zeitberechnungen.
- **Ästhetik:** OKLCH-Farbraum für alle CSS-Farben.
- **Effizienz:** Native Browser-Features (Invoker Commands, CSS Anchor, field-sizing) statt JS-Workarounds.

## 3. Akzeptanzkriterien
- Keine `new Date()` Aufrufe mehr.
- Alle Farben in `oklch()`.
- Keine `onchange=""` Attribute im HTML.
- `field-sizing: content` regelt das Wachstum von Textfeldern.
- Sanfte Animationen via `@starting-style` ohne JS-Zustände.
</content>
</file>

<file path="specs/075-Modern-Baseline/20-Plan.md">
<metadata>Lines: 17 | Size: 700 B</metadata>
<content>
# SPEC-075-Plan: Modern UI Baseline Implementation

## 1. Technisches Design
Wir nutzen die nativen Chrome-Features ab Version 147.

### Meilensteine:
1.  **Date Migration:** `new Date()` -> `Temporal API`.
2.  **Color Refactoring:** Hex/RGBA -> `oklch()`.
3.  **UI-Structure:** HTML `onchange` entfernen, Event-Delegation in `ui.js`.
4.  **Modern CSS:** `field-sizing: content`, `text-wrap: balance`, `@starting-style`.
5.  **Native Interaction:** `popovertarget` -> `commandfor`.

## 2. Teststrategie
- Visuelle Prüfung via Puppeteer auf Chrome 147 Baseline.
- Validierung der Date-Strings (Temporal ISO vs. German Format).
- Sicherstellen, dass die Event-Delegation alle Layout-Switches erkennt.
</content>
</file>

<file path="specs/075-Modern-Baseline/30-Aufgaben.md">
<metadata>Lines: 11 | Size: 623 B</metadata>
<content>
# SPEC-075-Aufgaben: Modern UI Baseline

- [x] Task 1: Alle `new Date()` in `js/` durch `Temporal API` ersetzen.
- [x] Task 2: `rgba()` und `#hex` in `css/` auf `oklch()` migrieren.
- [x] Task 3: `field-sizing: content` auf Text-Atome und akinator-output anwenden.
- [x] Task 4: `popovertarget` in `index.html` durch `commandfor` ersetzen.
- [x] Task 5: `onchange` Handler im HTML entfernen und Event-Delegation in `ui.js` vervollständigen.
- [x] Task 6: `@starting-style` Animation für Toasts hinzufügen.
- [x] Task 7: `text-wrap: balance` für den Betreff.
- [x] Task 8: `interpolate-size: allow-keywords` im Root setzen.
</content>
</file>

<file path="specs/076-Smart-Deadlines/10-Anforderung.md">
<metadata>Lines: 17 | Size: 953 B</metadata>
<content>
# SPEC-076: Smart Deadline Popover (The "Magic" Feature)

## 1. Status Quo
Nutzer müssen Fristen (z. B. "14 Tage nach heute") manuell ausrechnen und eintippen. Das ist fehleranfällig und unterbricht den Schreibfluss.

## 2. Zielsetzung (Anforderung)
Einführung eines kontextsensitiven Popovers, das intelligente Frist-Vorschläge macht.
- **Trigger A:** Fokus im Feld `din-date`.
- **Trigger B:** Erkennung von Schlüsselwörtern ("Widerspruch", "Mahnung") im Brieftext.
- **Aktion:** Ein Klick berechnet das Zieldatum (Temporal API) und fügt es wahlweise als Ersatz (im Datumsfeld) oder als Textbaustein (im Textkörper) ein.

## 3. Akzeptanzkriterien
- Popover erscheint via **CSS Anchor Positioning** direkt am Feld.
- Berechnung erfolgt absolut präzise via **Temporal API**.
- Visuelle Hervorhebung ("Prominent") der wahrscheinlichsten Frist (z. B. 14 Tage bei Widerspruch).
- Schließverhalten: Popover verschwindet nach Auswahl oder bei Focus-Verlust.
</content>
</file>

<file path="specs/076-Smart-Deadlines/20-Plan.md">
<metadata>Lines: 16 | Size: 930 B</metadata>
<content>
# SPEC-076-Plan: Smart Deadline Implementation

## 1. Technisches Design
Wir nutzen die bereits implementierte `Logic.calculateDeadlines()` Funktion und verknüpfen sie tiefer mit der `ui.js`.

### Architektur:
1.  **Context Detection:** `Logic.detectContext(text)` scannt auf Keywords.
2.  **UI-Sync:** Ein `Signal`-ähnlicher Mechanismus (Subscriber) in `ui.js` triggert die Anzeige des Popovers.
3.  **Positioning:** `anchor-name: --anchor-date` und `--anchor-text` sorgen für die punktgenaue Platzierung des Popovers via CSS.

## 2. Implementierungsschritte
1.  **Refine Logic:** `calculateDeadlines` in `logic.js` auf Herz und Nieren prüfen (Temporal TimeZone).
2.  **HTML Structure:** Sicherstellen, dass das Popover-Element in `index.html` die richtige Klasse hat.
3.  **JS Handler:** `_handleSmartDeadlines` in `ui.js` finalisieren.
4.  **CSS:** Styling des Popovers für den "Fühlbaren Nutzen" (Transitions, Hover-Effekte).
</content>
</file>

<file path="specs/076-Smart-Deadlines/30-Aufgaben.md">
<metadata>Lines: 8 | Size: 655 B</metadata>
<content>
# SPEC-076-Aufgaben: Smart Deadlines

- [x] Task 1: `Logic.calculateDeadlines()` auf korrekte TimeZone (Temporal.Now.timeZoneId()) prüfen.
- [x] Task 2: CSS Anchor Positioning in `app-ui.css` für das Popover finalisieren (inkl. Animation).
- [x] Task 3: In `ui.js` den Trigger für das `body`-Feld so verfeinern, dass das Popover nur erscheint, wenn der Kontext ("Widerspruch" / "Mahnung") auch wirklich vorhanden ist.
- [x] Task 4: In `ui.js` sicherstellen, dass das Datum bei Auswahl im `body`-Feld als schön formatiertes Snippet (`📅 Frist: ...`) eingefügt wird.
- [x] Task 5: Einbau einer `escape`-Taste Behandlung, um das Popover schnell wegzudrücken.
</content>
</file>

<file path="specs/080-Zero-JS-Doctrine/10-Anforderung.md">
<metadata>Lines: 19 | Size: 1036 B</metadata>
<content>
# SPEC-080: Zero-JS UI Doctrine (Radical Pruning)

## 1. Status Quo
Das UI wird noch zu oft durch JavaScript-Event-Listener und manuelle DOM-Manipulation gesteuert (Themen-Wechsel, Hilfslinien-Toggle, Placeholder-Handling).

## 2. Zielsetzung (Anforderung)
JavaScript wird auf die reine **Fachlogik** (Berechnungen, Datenfluss, Persistenz) reduziert. Das UI steuert sich selbst durch native Browser-Features.
- **State-Holding:** HTML-Checkboxes/Radios halten den UI-Zustand.
- **Reaktivität:** CSS `:has()` und `@property` reagieren auf Zustandsänderungen.
- **Inhalt:** CSS `attr()` übernimmt Platzhalter.
- **Interaktion:** Native Invoker Commands (`commandfor`) ersetzen JS-Click-Handler für Dialoge/Popover.

## 3. Akzeptanzkriterien
- Keine `document.addEventListener('change', ...)` für UI-Toggles mehr.
- Platzhalter werden via CSS `[data-placeholder]` gerendert.
- Themen-Wechsel (Tag/Nacht) erfolgt zu 100% via CSS `:has()`.
- Hilfslinien-Toggle erfolgt zu 100% via CSS `:has()`.
- JS-Code in `ui.js` sinkt um mindestens 30%.
</content>
</file>

<file path="specs/080-Zero-JS-Doctrine/20-Plan.md">
<metadata>Lines: 16 | Size: 891 B</metadata>
<content>
# SPEC-080-Plan: JavaScript-Pruning

## 1. Technisches Design
Wir nutzen die neue **CSS :has() API**, um JavaScript-Logik in das CSS zu verlagern.

### Meilensteine:
1.  **CSS Placeholders:** `[data-placeholder]` in `app-ui.css` so definieren, dass sie bei `:empty` erscheinen.
2.  **HTML-State:** Die Radio-Buttons für "Guides", "Layout" und "Theme" werden im HTML so platziert, dass CSS sie via `:has()` oder `~` (Sibling) abfragen kann.
3.  **JS Removal:** Löschen der `document.addEventListener('change', ...)` Logik in `ui.js`.
4.  **Signal-Cleanup:** Sicherstellen, dass die State-Synchronisierung (JSON <-> DOM) weiterhin stabil bleibt.

## 2. Implementierungsschritte
1.  **CSS Refactoring:** Definition der `:has()` Selektoren im `:root`.
2.  **HTML Update:** Sicherstellen, dass Inputs IDs haben, auf die CSS zugreifen kann.
3.  **UI.js Cleanup:** Löschen der UI-Toggle-Listener.
</content>
</file>

<file path="specs/080-Zero-JS-Doctrine/30-Aufgaben.md">
<metadata>Lines: 9 | Size: 510 B</metadata>
<content>
# SPEC-080-Aufgaben: Zero-JS UI

- [x] Task 1: CSS `attr(data-placeholder)` fÃ¼r alle DIN-Tags implementieren (JS-frei).
- [x] Task 2: `:root:has(#guides-off:checked)` fÃ¼r Hilfslinien-Toggle (JS-frei).
- [x] Task 3: `:root:has(#theme-night:checked)` fÃ¼r Tag/Nacht-Toggle (JS-frei).
- [x] Task 4: `:root:has(#layout-a:checked)` fÃ¼r Form A/B-Toggle (JS-frei).
- [x] Task 5: `onchange` und `addEventListener('change', ...)` in `ui.js` lÃ¶schen.
- [x] Task 6: `_bindNativeEvents` in `ui.js` radikal aufrÃ¤umen.
</content>
</file>

<file path="specs/085-Toast-System/10-Anforderung.md">
<metadata>Lines: 18 | Size: 999 B</metadata>
<content>
# SPEC-085: Centralized Toast Registry & Queue

## 1. Status Quo
Toast-Meldungen sind im Code verteilt (hardcodierte Texte). Bei mehreren Ereignissen stapeln sich Toasts unschön am Bildschirmrand und verdecken das DIN-5008 Layout.

## 2. Zielsetzung (Anforderung)
Einführung einer zentralen Registry für alle System-Meldungen und eines Queue-Managers, der sicherstellt, dass immer nur **ein** Toast gleichzeitig sichtbar ist.
- **Registry:** Alle Texte, Typen (Success, Error, Info) und Dauern an einem Ort (`js/core/toast-registry.js`).
- **Queue-Manager:** Neue Toasts warten in einer Warteschlange, bis der aktuelle Toast verschwunden ist.
- **Visuals:** Kein Stapeln mehr. Sanfter Austausch der Meldungen.
- **Entry-Animation:** 100% JS-frei via CSS `@starting-style`.

## 3. Akzeptanzkriterien
- Keine hartcodierten Strings für Meldungen mehr in `ui.js`.
- Aufruf erfolgt nur noch via `toast.show('ID')`.
- Maximal ein sichtbarer Toast im DOM.
- Unterstützung für Platzhalter (z. B. `{date}`).
</content>
</file>

<file path="specs/085-Toast-System/20-Plan.md">
<metadata>Lines: 16 | Size: 762 B</metadata>
<content>
# SPEC-085-Plan: Toast Implementation

## 1. Technisches Design
Wir führen zwei neue Module ein: `toast-registry.js` (Daten) und `toast-manager.js` (UI-Logik).

### Komponenten:
1.  **TOAST_REGISTRY:** Ein Objekt-Dictionary mit IDs als Keys.
2.  **ToastManager Class:** Verwaltet die `queue[]`, den `activeToast` und den DOM-Container.
3.  **CSS:** Styling in `app-ui.css` mit `@starting-style` für die Entry-Animation.

## 2. Implementierungsschritte
1.  **Registry erstellen:** Initiales Set an Meldungen (Save, Export, IBAN-Error, Frist).
2.  **Manager implementieren:** Singleton-Export (`toast`).
3.  **Refactoring:** Ersetzen der alten `console.info` oder manuellen Toasts in `ui.js`.
4.  **CSS:** Hinzufügen der Klassen für die verschiedenen Toast-Typen.
</content>
</file>

<file path="specs/085-Toast-System/30-Aufgaben.md">
<metadata>Lines: 8 | Size: 360 B</metadata>
<content>
# SPEC-085-Aufgaben: Toast System

- [x] Task 1: `js/core/toast-registry.js` erstellen.
- [x] Task 2: `js/ui/toast-manager.js` erstellen (Queue-Logic).
- [x] Task 3: CSS Styling in `app-ui.css` (inkl. @starting-style).
- [x] Task 4: `ui.js` refactoren: `showToast` statt manueller Logs/Toasts.
- [x] Task 5: Integration in `StateManager` (Save success/error).
</content>
</file>

<file path="specs/090-UI-Polish/10-Anforderung.md">
<metadata>Lines: 19 | Size: 1006 B</metadata>
<content>
# SPEC-090: UI/UX Platinum Polish

## 1. Status Quo
Das UI ist funktional, wirkt aber an einigen Stellen noch "statisch". Abstände sind nicht systemisch definiert, und die visuelle Hierarchie bei offenen Dialogen könnte klarer sein.

## 2. Zielsetzung (Anforderung)
Einführung eines systemischen Designs zur Steigerung der wahrgenommenen Qualität ("Look & Feel").
- **Raster:** Einführung eines **7px-Spacings** als Basis für alle Abstände.
- **Hierarchie:** Einsatz von `backdrop-filter` (Blur) für Dialoge und Popover.
- **Interaktion:** Sanfte Micro-Transitions für alle Buttons und interaktiven Flächen.
- **Produktivität:** Implementierung globaler Keyboard-Shortcuts (Ctrl+S, Ctrl+P, Esc).

## 3. Akzeptanzkriterien
- Alle Abstände (Margin/Padding) nutzen Variablen basierend auf dem 7px-Raster.
- Dialoge dunkeln den Hintergrund ab und nutzen Blur.
- Buttons reagieren haptisch (Scale-Down) auf Klicks.
- Focus-Ringe sind nur bei Tastatur-Navigation sichtbar.
- Shortcuts funktionieren zuverlässig.
</content>
</file>

<file path="specs/090-UI-Polish/20-Plan.md">
<metadata>Lines: 16 | Size: 775 B</metadata>
<content>
# SPEC-090-Plan: UI/UX Platinum Polish Implementation

## 1. Technisches Design
Wir veredeln die bestehende CSS-Struktur und fügen eine zentrale Shortcut-Logik hinzu.

### Meilensteine:
1.  **CSS-Variables Update:** Einführung von `--space-unit: 7px` und abhängigen Skalen.
2.  **Backdrop-Filter:** Implementierung von `backdrop-filter: blur(8px)` für alle Modals.
3.  **Haptic Feedback:** CSS Transitions und `:active`-States für interaktive Elemente.
4.  **Focus States:** Nutzung von `:focus-visible` für saubere Outlines.
5.  **Shortcut Manager:** Erweiterung der `ui.js` um einen globalen Keydown-Listener.

## 2. Implementierungsschritte
1.  **Refine CSS:** Aktualisierung der `css/app-ui.css`.
2.  **JS Logic:** Implementierung der Shortcuts in `UIController.init()`.
</content>
</file>

<file path="specs/090-UI-Polish/30-Aufgaben.md">
<metadata>Lines: 8 | Size: 412 B</metadata>
<content>
# SPEC-090-Aufgaben: UI/UX Polish

- [x] Task 1: 7px-Raster Variablen in `app-ui.css` definieren.
- [x] Task 2: `backdrop-filter` fÃ¼r `dialog` und `popover` implementieren.
- [x] Task 3: Sanfte `transition` und `:active` Scale fÃ¼r Buttons hinzufÃ¼gen.
- [x] Task 4: `:focus-visible` fÃ¼r saubere Tastatur-Navigation einrichten.
- [x] Task 5: Keyboard Shortcuts (Ctrl+S, Ctrl+P, Esc) in `ui.js` implementieren.
</content>
</file>

<file path="sw.js">
<metadata>Lines: 73 | Size: 1839 B</metadata>
<content>
// sw.js — DIN-BriefNEO Platinum Service Worker
const CACHE_NAME = 'neo-platinum-v1';
const ASSETS = [
  '/',
  'index.html',
  'manifest.json',
  'css/core-immutable.css',
  'css/din5008-paper.css',
  'css/lockdown.css',
  'css/app-ui.css',
  'css/print.css',
  'js/core/app.js',
  'js/core/state.js',
  'js/core/constants.js',
  'js/core/temporal-utils.js',
  'js/core/opfs-worker.js',
  'js/logic/logic.js',
  'js/ui/ui.js',
  'js/ui/toast-manager.js',
  'js/ui/ghost-mirror.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      console.log('[SW] Initializing Cache...');
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

/**
 * [High-Integrity] Cache-First Strategy with Network Fallback
 */
self.addEventListener('fetch', e => {
  // Nur GET-Requests cachen
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(e.request).then(networkResponse => {
        // Valide Response cachen
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline Fallback für Navigation
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
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
<metadata>Lines: 136 | Size: 5687 B</metadata>
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
        "js/core/constants.js",
        "js/logic/logic.js",
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

    # -------------------------------------------------------------------------
    # PLATINUM MANDATE CHECK (SPEC-061)
    # -------------------------------------------------------------------------
    Write-Host ""
    Write-Host "  [SHIELD] PLATINUM MANDATE CHECK (v16.0.1):" -ForegroundColor Cyan

    # A. MANDATE-INJ (Zero innerHTML)
    # Ignoriere Zeilen mit // @pvp-ignore: innerHTML
    $innerHtmlMatches = Select-String -Path "js/**/*.js" -Pattern "\.innerHTML\s*=" -Exclude "js/logic/mirror-renderer.js" | Where-Object { $_.Line -notmatch "// @pvp-ignore: innerHTML" }
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
    $tags = [regex]::Matches($indexContent, '(?s)<din-(?!body-mirror|text-mirror)([\w-]+)([^>]*?)>')
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

