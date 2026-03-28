---
id: BRAIN-003-APR
title: "Anti-Pattern Registry (Deprecated Patterns)"
status: "verified"
enforcement: "AUTOMATED VALIDATION"
last_audit: 2026-03-28
tags:
  - anti-pattern
  - technical-debt
related:
  - "[[CONSTITUTION]]"
  - "[[CORE_SPEC]]"
---

# Anti-Pattern Registry (Deprecated Patterns)

## 1. PERSISTENCE (DEP-P)
- **DEP-P001:** `localStorage` for high-volume data (Use OPFS/Batch instead).
- **DEP-P002:** External cloud sync for draft state (Violation of Local-First architecture).
- **DEP-P003:** `JSON.stringify()` on primary input thread (Performance regression).

## 2. LAYOUT (DEP-L)
- **DEP-L001:** `innerHTML` for user content (Security risk: XSS).
- **DEP-L002:** `contenteditable="true"` (DOM state inconsistency; use `plaintext-only` or `EditContext`).
- **DEP-L003:** `execCommand` (Deprecated legacy API).
- **DEP-L004:** External CSS frameworks (Tailwind/Bootstrap).

## 3. LOGIC (DEP-C)
- **DEP-C001:** Legacy `Date` object (Use `Temporal API`).
- **DEP-C002:** Server-side dependencies for core logic (Client-Side-Only requirement).
- **DEP-C003:** External utility libraries (Moment.js, jspdf; use native browser APIs).
- **DEP-C004:** `setTimeout` for state debouncing (Use `requestIdleCallback` or `Idle Detection`).

## 4. TOOLING (DEP-T)
- **DEP-T001:** Context-fragmenting tools (`head`/`tail`).
- **DEP-T002:** Environment-specific stream syntax (`cat <<EOF` in PowerShell).

## 5. ARCHITECTURE (DEP-B)
- **DEP-B001:** Preprocessors (SASS/SCSS; native CSS nesting and math preferred).
- **DEP-B002:** Preprocessor abstractions (Mixins; use native Custom Properties).
- **DEP-B003:** JS-based event listeners for layout state (Use CSS `@container scroll-state`).
