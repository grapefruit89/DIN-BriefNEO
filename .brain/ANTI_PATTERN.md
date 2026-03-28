# Anti-Pattern Registry (The Cemetery)
**Status**: CEMENTED | **Enforcement**: AUTOMATED PVP

## 1. PERSISTENCE (APR-P)
- **APR-P001:** `localStorage` for high-volume data (use OPFS/Batch instead).
- **APR-P002:** External cloud sync for draft state (Violation of Local-First).
- **APR-P003:** `JSON.stringify()` on typing (Performance risk).

## 2. LAYOUT (APR-L)
- **APR-L001:** `innerHTML` for user content (Severe XSS risk).
- **APR-L002:** `contenteditable="true"` (Use `plaintext-only` or `EditContext`).
- **APR-L003:** `execCommand` (Deprecated legacy API).
- **APR-L004:** External CSS frameworks (Tailwind/Bootstrap).

## 3. LOGIC (APR-C)
- **APR-C001:** Legacy `Date` object (Use `Temporal API`).
- **APR-C002:** Python-based backend transactions (Client-Side-Only mandate).
- **APR-C003:** Moment.js or jspdf (Use native APIs).
- **APR-C004:** `setTimeout` for debouncing (Use `requestIdleCallback` or Idle Detection).

## 4. TOOLING (APR-T)
- **APR-T001:** Terminal `head`/`tail` (Context fragmentation).
- **APR-T002:** PowerShell `cat <<EOF` (Syntax corruption risk).

## 5. ARCHITECTURE (APR-B)
- **APR-B001:** SASS/SCSS (Native CSS Nesting & Math is SSoT).
- **APR-B002:** SASS Mixins (Use Custom Properties).
- **APR-B003:** JS-based scroll listeners (Use CSS `@container scroll-state`).
