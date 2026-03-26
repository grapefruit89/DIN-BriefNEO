<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# \# Role: Senior Full-Stack Architect \& AI Development Expert

## Context

I am providing you with two of my current projects, which I have developed and evolved through multiple iterations. To maintain a clean workflow, I have automated my export process using custom PowerShell scripts to ensure you have the full project context (code, file structure, and metadata) in a standardized format.

### Uploaded Projects:

1. **Text-Fragment-Sammler**: A tool for collecting and managing text snippets.
2. **DIN-5008-Brief-Generator**: A specialized editor for creating standardized German business letters.

## Task

Your objective is to perform a comprehensive cross-project audit and provide a strategic roadmap for the next evolution of these tools.

### Phase 1: Structural \& Technical Audit

- Analyze the project structure (Skeleton) of both projects.
- Identify which project is currently "technically superior" in terms of modularity, naming conventions, documentation (brain files), and separation of concerns.
- Propose a "Unified Gold Standard" for the project structure so both projects follow the exact same architectural pattern.


### Phase 2: Code Quality \& Feature Synergy

- Look for "best practices" in one project that are missing in the other (e.g., Error Handling, Logging, UI-Management, State-Persistence).
- Suggest 3 high-impact technical improvements for each project to make them more robust and professional.
- Check for reusable logic: Can parts of the logic from Project A be abstracted into a shared module for Project B?


### Phase 3: Innovation \& Roadmap

- Based on the current state, suggest 3 innovative features for each project that would significantly improve the user experience.
- How can these tools be better optimized for AI-assisted development in the future?


## Final Output Requirement

1. A detailed analysis of the current state.
2. A step-by-step guide for the structural upgrade to the "Gold Standard".
3. **Crucial:** Provide a highly optimized, technical **English LLM System Prompt** that I can use in future sessions to keep the AI focused on this specific "Gold Standard" architecture.

---
**Please start by confirming you have parsed both files and provide a brief overview of the core technologies you identified in each.**

Both files are parsed and both projects are clearly readable and well-instrumented with their own meta-architecture.[^1_1][^1_2]

## Core technologies per project

### Text-Fragment-Sammler

- **Frontend stack**: Vanilla HTML5, CSS3 (theme/layout/components split as CSS modules), and ES6 JavaScript using a global `window.App` namespace and Spiderweb modular architecture (`CoreApp`, `UIManager`, Logic layer, Service layer).[^1_1]
- **Runtime \& tooling**: Runs directly via `index.html` on file protocol, but also provides a Node-based `build.js` bundler that inlines CSS/JS into a single HTML for distribution. No NPM build chain at runtime per project mandates.[^1_1]
- **Architecture \& docs**: Rich `.brain` knowledge base with status dashboards, business logic specs, data schemas, roadmap, and strict “documentation as code” rules (Spec-IDs like `TXT-STATS-TOKEN`, traceability via `data-spec`, JSDoc `see`, and central Project Memory).[^1_1]


### DIN-5008-Brief-Generator

- **Frontend stack**: Vanilla HTML5, CSS3 (split into DIN-paper CSS and UI CSS), and modular ES6 JavaScript using a `window.App` namespace with modules for Core, UI Manager, Formatter, API, Storage, Logger, etc.[^1_2]
- **Runtime \& tooling**: Uses a Vite-based setup (`vite.config.ts`, `tsconfig.json`, `package.json`) for local dev with Node and environment variables (Gemini API key in `.env.local`), but the core app is still plain HTML/CSS/JS in the browser.[^1_2]
- **Architecture \& docs**: Centralized markdown knowledge system (`00projectmemory.md`, `01systemnstructions.md`, `02businesslogic.md`, `02din5008knowledge.md` → refactored, `04uidesign.md`, `05historyknowledge.md`) with DIN-spec-driven IDs (e.g., `DIN-LOGIC-RET`, `DIN-LOGIC-DATE`), bi-directional traceability, pre-flight system checks, black-box debug logger, and strict deprecation/logging policies.[^1_2]

Next step in the following messages will be the cross-project audit, gold-standard structure, upgrade steps, roadmap, and the requested English system prompt.

<div align="center">⁂</div>

[^1_1]: text-fragment-sammler_EXPORT_2026-01-08_11-28.txt

[^1_2]: din-5008-brief-generator_EXPORT_2026-01-08_11-28.txt


---

## 1. Cross-project audit \& “technically superior” project

Both projects are already very mature, but they shine in unterschiedlichen Bereichen.[^2_1][^2_2]

### Structural comparison

| Aspect | Text-Fragment-Sammler | DIN-5008-Brief-Generator |
| :-- | :-- | :-- |
| Documentation hub | `.brain` directory with 10+ focused files, including roadmap, schema, language, auto-changelog. [^2_1] | 5 core knowledge files (00–05) with strong spec focus but less breadth. [^2_2] |
| Traceability model | Spec-IDs (`TXT-*`), `data-spec`, JSDoc `@see`, Architecture/Status dashboards. [^2_1] | DIN-spec IDs (`DIN-*`), implementation map, strong regulation → code trace. [^2_2] |
| Runtime architecture | Spiderweb: CoreApp, UIManager, Logic, Services; strict namespace load order. [^2_1] | App Core, UI Manager, Formatter, Storage, API, Logger; event groups by DIN Spec. [^2_2] |
| Safety \& robustness | Visual debug console, global error capture, autosave, history. [^2_1] | Pre-flight integrity check, black-box logger, crash detection, autosave loop. [^2_2] |
| Tooling | Pure file-protocol runtime + Node `build.js` bundler. [^2_1] | Vite/TypeScript dev stack plus vanilla production bundle. [^2_2] |

**Technically superior baseline for architecture \& documentation**:

- Text-Fragment-Sammler wins on **meta-architecture**: `.brain` hierarchy, data schemas, domain language, roadmap, and Spiderweb map are extremely systematic and AI-friendly.[^2_1]
- DIN-5008-Brief-Generator wins on **safety engineering**: pre-flight check, crash logger, aviation-style traceability, and deep DIN spec mapping.[^2_2]

For a unified standard, the best candidate is:

- Use **Text-Fragment-Sammler’s `.brain` model + Spiderweb layering** as the global project skeleton.[^2_1]
- Integrate **DIN-5008’s pre-flight + black-box logging + DIN-style event grouping** as mandatory runtime safety modules.[^2_2]


## 2. Unified “Gold Standard” project structure

### 2.1 Target file/folder layout

Gold standard structure both projects should share:

- `/index.html` – Entry Point View, with metadata header and dependency order comment.[^2_2][^2_1]
- `/cssmodulestheme.css` – Design tokens, colors, typography.[^2_1]
- `/cssmoduleslayout.css` – Layout grid, container, sidebar, main, responsive rules.[^2_1]
- `/cssmodulescomponents.css` – Widgets, panels, buttons, debug console, etc.[^2_1]
- `/jslogicutils.js` – Pure helpers, debouncers, parsing, formatting.[^2_1]
- `/jslogicanalyzer.js` or domain-logic file – Pure business logic (stats, DIN formatting, etc.).[^2_2][^2_1]
- `/jslogiclogger.js` – Visual debug console + global error handler + black-box persistence.[^2_2][^2_1]
- `/jsservicesfile-service.js` – File import/export.[^2_1]
- `/jsservicesstorage-service.js` – LocalStorage, autosave, history.[^2_2][^2_1]
- `/jsuiui-manager.js` – DOM references, renderers, no business logic.[^2_2][^2_1]
- `/jscoreapp.js` – Core controller: state, event binding, pre-flight check, orchestration.[^2_2][^2_1]
- `/build.js` or `/vite.config.ts` – optional bundling configuration, but not required at runtime.[^2_1][^2_2]
- `/.env.local` – local secrets for AI features, never required for offline core.[^2_2][^2_1]


### 2.2 Standardized brain / knowledge base

Unify to this **.brain** layout (names apply to both projects, with domain-specific content):

- `.brain00projectmemory.md` – Central Status Hub, Architectural Decision Log, deprecated decisions.[^2_1][^2_2]
- `.brain01systeminstructions.md` – System role, mandates, safety protocols, response format.[^2_2][^2_1]
- `.brain02businesslogic.md` – Spec-IDs, data schemas, features, rules, implementation maps.[^2_1][^2_2]
- `.brain03techstack.md` – Technology constraints (Vanilla JS, no frameworks), runtime expectations.[^2_1]
- `.brain04uidesign.md` – UI Design System: color palette, layout, components, print mode.[^2_2][^2_1]
- `.brain05historylog.md` – Chronological changelog, mandatory entry per code change.[^2_2][^2_1]
- `.brain06roadmaptodo.md` – Feature backlog and roadmap.[^2_1]
- `.brainmap.md` – Architecture Spiderweb Map, dependency graph, traceability matrix.[^2_1]
- `.brainschema.md` – Data models and runtime state description.[^2_1]
- `.brainlanguage.md` – Domain language dictionary for project-specific terminology.[^2_1]
- `.brainauto.md` – Auto-changelog and meta-refactor notes.[^2_1]

DIN-5008 currently uses a non-dotted naming scheme (`00projectmemory.md`, `01systemnstructions.md`, etc.); migrating it into `.brainXX*.md` improves parity and simplifies system prompts and tooling.[^2_2]

### 2.3 Uniform runtime guarantees

Both apps should obey these common runtime rules:

- **Pre-flight check** in `App.Core.runSystemCheck` (modules present, critical DOM elements present, LocalStorage available).[^2_2]
- **Black-box logger** persisting last N log entries to LocalStorage, with crash detection and export.[^2_2][^2_1]
- **Strict SoC**:
    - UI Manager: DOM only, no business logic.[^2_2][^2_1]
    - Logic layer: pure functions, no DOM.[^2_2][^2_1]
    - Services: IO only (Storage, File, API).[^2_1][^2_2]
    - Core: orchestrates, holds state, binds events grouped by Spec-ID.[^2_2][^2_1]
- **Traceability law**: any business rule must exist (and be updated) in `.brain02businesslogic.md` and be referenced via `data-spec` + JSDoc `@see`.[^2_1][^2_2]


## 3. Best practices \& feature synergy

### 3.1 Best practices used in one project but missing in the other

- From **Text-Fragment-Sammler → DIN-5008**:
    - Rich **roadmap \& domain language**: `.brain06roadmaptodo.md`, `.brainlanguage.md` and `.brainschema.md` make AI guidance and future refactors easier.[^2_1]
    - **History search \& advanced export ideas** (PDF export, drag/drop reordering) as explicit backlog items.[^2_1]
    - File-protocol **no-build runtime** as a hard constraint, plus `build.js` bundler for distribution.[^2_1]
- From **DIN-5008 → Text-Fragment-Sammler**:
    - **Pre-flight integrity check** and explicit “System Halted” state when something is broken.[^2_2]
    - Deep **DIN-style implementation map** with rule IDs, layout dimensions, and cross-linking to DOM and logic, showing how to harden traceability further.[^2_2]
    - **Smart automation logic** pattern: derive return line from sender, date formatting, Betreff-ban clean-up, specialized event grouping by Spec-ID.[^2_2]


### 3.2 Three high-impact technical improvements – Text-Fragment-Sammler

1. **Adopt pre-flight system check and health status**
    - Add a `runSystemCheck` in `jscoreapp.js` that verifies `App.UI`, `App.Analyzer`, `App.Logger`, `App.FileService`, `App.StorageService`, critical DOM nodes, and LocalStorage write permissions before enabling input handlers.[^2_2][^2_1]
2. **Normalize Spec-ID structure and event grouping**
    - Enhance `.brain02businesslogic.md` with an explicit Implementation Map table like the DIN project, mapping `TXT-*` IDs to DOM nodes and JS modules.[^2_1][^2_2]
    - Annotate event listeners in `App.Core` grouped by Spec-ID (e.g., “TXT-FEAT-AUTOSAVE – Output Input → Autosave \& Stats Update”).[^2_1]
3. **AI-aware context snapshots for crash/debug analysis**
    - Extend `jslogiclogger.js` to also persist a small, sanitized state snapshot (e.g., last N history IDs, token stats) along with logs for crash sessions, making it trivial to feed into an LLM for post-mortems.[^2_1]

### 3.3 Three high-impact technical improvements – DIN-5008-Brief-Generator

1. **Adopt full `.brain` hierarchy for architecture clarity**
    - Restructure existing `00–05` knowledge files into the `.brain` pattern described above (mirroring Text-Sammler), and add domain language and schema docs.[^2_2][^2_1]
2. **Decouple from Vite for runtime parity**
    - Keep Vite purely as a dev convenience, but ensure there is a `build.js`-like bundler or a static `index.html` entry that loads all JS via `<script>` tags in defined order, so the app runs fully offline without Node.[^2_2][^2_1]
3. **Shared service layer for Storage \& API**
    - Move Storage (local state, history) and Address API integration into service modules that follow the same interface as Text-Sammler’s File/Storage services, anticipating cross-project reuse.[^2_2][^2_1]

### 3.4 Reusable logic between both projects

- **Shared modules** (candidate for a `shared/` folder or a separate repo):
    - `jslogiclogger.js`: Debug console, global error handler, crash log persistence. Currently duplicated concepts can be unified.[^2_1][^2_2]
    - `jsservicesstorage-service.js`: A generic LocalStorage wrapper supporting named keys, autosave, history items, and crash logs.[^2_2][^2_1]
    - Utility functions (`Utils.debounce`, token estimation, date parsing): can form a common `jslogicutils.js` used by both apps.[^2_1][^2_2]
- **Pattern reuse**:
    - Text-Sammler’s token-estimation and visual thresholds map very well to DIN-5008 for estimating token length of letters before feeding them to an LLM.[^2_1]
    - DIN-5008’s structured event grouping and `deriveReturnLine`/`formatAsDate` pattern can be reused in Text-Sammler to enforce clean prompt structures and metadata blocks.[^2_2]


## 4. Innovation \& roadmap

### 4.1 Three innovative features – Text-Fragment-Sammler

1. **AI-assisted fragment classification and tagging**
    - Use a local or API LLM to auto-tag imported fragments (topic, task type, model suitability, confidentiality), stored alongside history items and visualized in the TOC.[^2_1]
2. **Context-window planning assistant**
    - Combine `TXT-STATS-TOKEN` with per-model presets (GPT-4, Gemini, Claude, etc.) and show live “packing suggestions”: e.g., which fragments to bundle or drop for a target model.[^2_1]
3. **Prompt pattern library with smart insertion**
    - Extend the snippet system so it supports versioned, project-specific prompt templates stored in `.brain02businesslogic.md` and `.brainlanguage.md`, with automatic replacement of placeholders based on the current stats and history.[^2_1]

### 4.2 Three innovative features – DIN-5008-Brief-Generator

1. **LLM-assisted letter draft \& rewrite pipeline**
    - Use the Gemini key to generate first drafts given high-level instructions, then continuously validate layout and language against DIN rules (e.g., enforce Betreff ban, salutation constraints).[^2_2]
2. **Interactive DIN compliance inspector**
    - A side panel highlighting each section (address, subject, text body) with real-time compliance checks using both explicit rules in `.brain02businesslogic.md` and LLM-assisted heuristics.[^2_2]
3. **Scenario templates and personalization profiles**
    - Saved profiles for sender company, brand voice, and signing rules, stored as structured data in LocalStorage and `.brainschema.md`, enabling fast generation of repeat letters.[^2_2]

### 4.3 Optimization for AI-assisted development

- **Canonical “AI context bundle”**:
    - For both projects, define a canonical export containing `index.html`, all JS modules, and all `.brain` files plus a minimal changelog snippet—exactly what you already export, but explicitly standardized in `.braininstructions.md`.[^2_2][^2_1]
- **Spec-first workflows**:
    - Require any new logic to start as a Spec-ID entry in `.brain02businesslogic.md` with data schema, then have AI generate or modify the corresponding JS/HTML, and update `.brain05historylog.md` automatically.[^2_1][^2_2]
- **MCP/CLI integration**:
    - Integrate small scripts that can:
        - list all Spec-IDs,
        - find all `data-spec` / `@see` references,
        - generate an AI-ready summary of the impacted code when a Spec-ID changes.[^2_2][^2_1]


## 5. Step-by-step upgrade to the Gold Standard

### 5.1 For Text-Fragment-Sammler

1. **Introduce pre-flight system check**
    - Implement `runSystemCheck` in `jscoreapp.js` mirroring DIN-5008’s checks (modules, DOM, storage).[^2_1][^2_2]
    - Add a “System status” indicator in the UI (e.g., in the header), and log “All systems Green” or specific failures to `App.Logger`.[^2_2][^2_1]
2. **Align Spec-ID and implementation map with DIN style**
    - Extend `.brain02businesslogic.md` with a table mapping each `TXT-*` ID → JS module → DOM node(s) → CSS file(s), similar to `02din5008knowledge.md`.[^2_1][^2_2]
    - Update HTML and JS to ensure every rule has `data-spec` and `@see` annotations.[^2_1]
3. **Factor out shared modules for future reuse**
    - Extract Storage \& Logger behavior into `jsservicesstorage-service.js` and `jslogiclogger.js` with interfaces that DIN-5008 can plug into.[^2_1]
    - Document these in `.brainmap.md` as “Shared Modules” with clear dependency edges.[^2_1]

### 5.2 For DIN-5008-Brief-Generator

1. **Migrate to `.brain` naming and structure**
    - Move `00projectmemory.md` → `.brain00projectmemory.md`, etc., and add missing files (`.brainschema.md`, `.brainlanguage.md`, `.brainauto.md`).[^2_2][^2_1]
    - Update `01systemnstructions.md` to refer to the `.brain` directory as the single source of truth.[^2_2]
2. **Normalize JS/CSS file set to Spiderweb pattern**
    - Split remaining JS into `jslogicformatter.js`, `jslogiclogger.js`, `jsservicesstorage-service.js`, `jsservicesapi-service.js`, `jsuiui-manager.js`, `jscoreapp.js`, matching the naming and dependency order from Text-Sammler.[^2_2][^2_1]
    - Ensure `index.html` loads scripts in the same documented order.[^2_2][^2_1]
3. **Introduce build.js for offline parity**
    - Add a `build.js` that inlines CSS/JS into a distributable HTML similar to Text-Sammler’s script, keeping Vite only for dev convenience.[^2_1][^2_2]
4. **Register all new rules \& changes in brain files**
    - For each refactor, add entries to `.brain05historylog.md` and keep deprecated approaches in `.brain00projectmemory.md` with reasons.[^2_2][^2_1]

## 6. English LLM System Prompt for the Gold Standard

Below is a **technical system prompt** you can reuse across both projects to keep LLMs aligned with the unified architecture:

***

**System Prompt – Gold Standard Vanilla JS Architecture**

You are a Senior Software Architect and AI Pair Programmer.
Your sole objective is to maintain and evolve a mission-critical, ultra-stable, **vanilla HTML/CSS/JS** application that follows the **Gold Standard Architecture** shared by two projects:

- Project A: Text Fragment Sammler (KI Text Sammler).
- Project B: DIN 5008 Letter Generator.

You must always treat the **`.brain` directory** as the **single source of truth** for all requirements, rules, and decisions.

### 1. Knowledge Base Discipline

The `.brain` directory contains the authoritative project knowledge:

- `.brain00projectmemory.md` – Central status hub, architecture decisions, deprecated decisions.
- `.brain01systeminstructions.md` – System role, development mandates, safety protocols, response format.
- `.brain02businesslogic.md` – Business logic specification: Spec-IDs, data schemas, feature rules, implementation maps.
- `.brain03techstack.md` – Technology constraints (vanilla JS, file protocol, no frameworks).
- `.brain04uidesign.md` – UI design system: colors, layout, components, print rules.
- `.brain05historylog.md` – Chronological changelog; every code change must add an entry.
- `.brain06roadmaptodo.md` – Roadmap and future tasks.
- `.brainmap.md` – Architecture Spiderweb Map: dependency graph and traceability.
- `.brainschema.md` – Data models and runtime state structure.
- `.brainlanguage.md` – Domain language dictionary and terminology.
- `.brainauto.md` – Auto-changelog and meta-refactor notes.

Rules:

1. **Never invent rules** that contradict these files.
2. When adding or changing logic, you MUST update the relevant `.brain` files, especially `.brain02businesslogic.md` and `.brain05historylog.md`.
3. If a previous decision becomes obsolete, move it into the **Deprecated** section with a date and reason in `.brain00projectmemory.md` or the corresponding file. Do not delete historical information.

### 2. Technology \& Architecture Constraints

- Tech stack:
    - 100% Vanilla JS (ES6), HTML5, CSS3.
    - No frameworks (no React, Vue, Svelte, etc.).
    - No runtime build tools (no Webpack, Vite, Parcel). The app must run via `index.html` on the file protocol.
    - Node, Vite, or `build.js` may exist only as optional **offline bundling tools**, never as runtime dependencies.
- Core architecture (**Spiderweb pattern**):
    - `index.html` – Entry Point View, loads CSS modules and JS bundle in strict order.
    - `cssmodulestheme.css` – Design tokens and global theme.
    - `cssmoduleslayout.css` – Grids and layout regions.
    - `cssmodulescomponents.css` – UI components and widgets.
    - `jslogicutils.js` – Pure helper functions (no DOM, no side effects beyond return values).
    - `jslogicanalyzer.js` or domain logic file – Pure business logic (stats, DIN rules, etc.).
    - `jslogiclogger.js` – Visual debug console and global error handler; persists last N logs to LocalStorage (black box).
    - `jsservicesfile-service.js` – File import/export.
    - `jsservicesstorage-service.js` – LocalStorage and persistence (autosave, history, crash logs).
    - `jsservicesapi-service.js` – External API access (e.g., address autocomplete, LLM calls).
    - `jsuiui-manager.js` – View and DOM manipulation; zero business logic.
    - `jscoreapp.js` – Core controller and state: initialization, pre-flight system check, event binding, orchestration.

You must preserve:

- **Separation of concerns**:
    - Core orchestrates and owns state.
    - UI Manager touches DOM only.
    - Logic modules are pure; they do not touch DOM or LocalStorage.
    - Services handle IO only (LocalStorage, File, network).
    - Logger is responsible for diagnostics and black-box logging.


### 3. Safety Protocols \& Runtime Guarantees

The application must behave like a safety-critical system:

1. **Pre-flight system check**:
    - Implement and maintain `App.Core.runSystemCheck()` in `jscoreapp.js`.
    - It must verify:
        - All required modules/components exist (`App.UIManager`, logic modules, services, logger).
        - Critical DOM elements exist (selectors defined in UI Manager).
        - LocalStorage is available and writable.
    - If any check fails, the app must log a clear error via `App.Logger` and **halt** user interaction (no event binding, no partial behavior).
2. **Black-box logging**:
    - `jslogiclogger.js` must:
        - Provide a visual debug console UI.
        - Capture global errors via `window.onerror`.
        - Persist the last N log entries to LocalStorage (crash log).
        - On app start, detect previous crashes and surface them to the developer.
        - Support exporting the log as a text file.
3. **No silent failures**:
    - Every error must be logged with context and severity.
    - Logic functions must be defensive; invalid inputs should fail gracefully and be logged.

### 4. Traceability and Spec-IDs

- Every business rule must have a **Spec-ID** defined in `.brain02businesslogic.md`.
- You must maintain **bi-directional traceability**:
    - In HTML: use `data-spec="SPEC-ID"` attributes on relevant elements.
    - In JS: use JSDoc `@see SPEC-ID` tags above functions implementing the rule.
    - In `.brain02businesslogic.md`: include implementation maps mapping each Spec-ID to DOM nodes, JS modules, and CSS selectors.
- When changing or adding logic, follow this sequence:

1. Add/modify the Spec-ID and rule in `.brain02businesslogic.md`.
2. Implement or adjust the logic in JS, referencing the Spec-ID via `@see`.
3. Annotate corresponding DOM elements via `data-spec`.
4. Log the change in `.brain05historylog.md` with a timestamp, short title, and affected files.


### 5. Response Format for Code Changes

When generating or modifying code, always provide **two outputs**:

1. **Code changes** – The exact JS/HTML/CSS snippets or full files, adhering to the Gold Standard architecture and naming.
2. **Documentation updates** – The necessary modifications to `.brain` files, including:
    - New or updated Spec-ID sections in `.brain02businesslogic.md`.
    - Any updated architecture or status notes in `.brain00projectmemory.md`.
    - A new history entry in `.brain05historylog.md` describing the change (timestamp, title, short details, file list).
    - Any relevant updates to `.brainschema.md` or `.brainlanguage.md` if you add or rename data fields or domain terms.

You must never change code without also specifying the corresponding `.brain` updates.

### 6. Project-Specific Behavior

- **Text Fragment Sammler**:
    - Focus on stable text import/export, history management, token estimation, and snippet insertion.
    - Maintain rules such as auto-save debounce, system prompt delimiters, and history storage formats as defined in the `.brain` specs.
- **DIN 5008 Letter Generator**:
    - Focus on strict DIN-compliant layout and content, including header forms, address zones, subject line rules, salutation, and folding marks.
    - All automated formatting (return line derivation, date normalization, Betreff removal, etc.) must be traceable to Spec-IDs in the DIN business logic file.

***

Use this system prompt as the stable contract for any future AI-assisted development across both projects.

<div align="center">⁂</div>

[^2_1]: text-fragment-sammler_EXPORT_2026-01-08_11-28.txt

[^2_2]: din-5008-brief-generator_EXPORT_2026-01-08_11-28.txt

