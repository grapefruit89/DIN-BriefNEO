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

