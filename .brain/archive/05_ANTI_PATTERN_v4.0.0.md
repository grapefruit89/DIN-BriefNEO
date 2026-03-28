# ANTI-PATTERN REGISTRY & DEPRECATION LOG (v4.0.0)
# Status: FINALIZED | Standards: Chrome 147+ Baseline | Stand: März 2026

## 1. PERSISTENCE ANTI-PATTERNS (Data Integrity)
- **APR-P001:** Use of `localStorage` for high-volume datasets. (Reason: Synchronous I/O blocks the Main Thread).
- **APR-P002:** Use of cloud-based synchronization (Firebase/Supabase) for draft state. (Reason: Violation of the Local-First Architecture).
- **APR-P003:** Use of `JSON.stringify()` on the main thread during input handling. (Reason: Performance degradation / UI jank).

## 2. LAYOUT ANTI-PATTERNS (DOM Integrity)
- **APR-L001:** Use of `innerHTML` for user-generated content. (Reason: Severe XSS security risk).
- **APR-L002:** Use of `contenteditable="true"`. (Reason: DOM-state inconsistencies; replaced by `EditContext` or `plaintext-only`).
- **APR-L003:** Use of `execCommand`. (Reason: Deprecated and inconsistent browser implementation).
- **APR-L004:** Use of external CSS frameworks (Tailwind/Bootstrap). (Reason: Unnecessary bundle bloat; replaced by native CSS Custom Properties and Subgrid).

## 3. CORE LOGIC ANTI-PATTERNS (Execution Integrity)
- **APR-C001:** Use of the legacy `Date` object. (Reason: Mutability and timezone inconsistencies; replaced by the `Temporal API`).
- **APR-C002:** Use of Python-based backend transactions (fs-transaction). (Reason: Strict Client-Side-Only mandate).
- **APR-C003:** Use of third-party libraries for core features (jspdf/moment.js). (Reason: Native browser APIs preferred for performance and stability).
- **APR-C004:** Use of `setTimeout` or `setInterval` for debouncing or autosave logic. (Reason: Main-thread blocking; replaced by the native `Idle Detection API`).

## 4. RESTRICTED TOOLING (Execution Context)
- **APR-T001:** Use of `head` and `tail` in the terminal for file inspection. (Reason: Context fragmentation).
- **APR-T002:** Use of `cat <<EOF` in PowerShell environments. (Reason: Syntax incompatibility and potential data corruption).

## 5. ARCHITECTURAL BLOAT (Build & Preprocessing)
- **APR-B001:** Use of CSS preprocessors (SASS, SCSS, LESS, Stylus). (Reason: Violation of the Zero-Build-Step Paradigm; native Chrome 147+ features like Nesting, Custom Properties, and Math functions render preprocessors obsolete).
- **APR-B002:** Use of SASS Mixins. (Reason: Code duplication and build-time dependencies; replaced by native Custom Properties and atomic composition).
- **APR-B003:** Implementation of JS-based scroll listeners for overflow feedback. (Reason: Replaced by native `@container scroll-state()` queries in CSS).

---
**CHIEF SYSTEMS ARCHITECT**
"Deprecate legacy patterns, leverage native browser APIs."
