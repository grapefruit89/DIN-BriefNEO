# DIN-BriefNEO — Technical Specification Kit
**Version:** 1.1 (Produktionsreif)  
**Status:** Operational / Ground Truth Verified  
**Methodology:** [GitHub Spec Kit](https://github.com/github/spec-kit)


---

## 1. Runtime & Temporal Logic (ARCHIVE-L001)
Implementation of the TC39 Temporal proposal.
- **Context7 Library ID:** `/fullcalendar/temporal-polyfill`
- **Reference:** [Temporal Proposal](https://tc39.es/proposal-temporal/)

## 2. Input Sovereignty (EditContext API)
Decoupled text input for high-performance editing and IME (Umlaute) resilience.
- **Context7 Library ID:** `/mdn/content` (Search: EditContext)
- **Critical Requirement:** Must call `updateControlBounds()` and `updateSelectionBounds()` for correct OS-level IME positioning.
- **Event Hook:** `textupdate` for state-sync; `textformatupdate` for IME-rendering.

## 3. Storage & Persistence (OPFS & Web Storage)
- **Origin Private File System (OPFS):** Dedicated worker-side synchronous I/O.
    - **Context7 Library ID:** `/mdn/content` (Search: FileSystemSyncAccessHandle)
    - **Safety Check:** `accessHandle.flush()` is mandatory after every `write()` to guarantee physical persistence.
- **Phoenix Protocol (LocalStorage):** Mirroring state to `dataset` for CSS-driven UI.
    - **Context7 Library ID:** `/mdn/content` (Search: Web Storage API)

## 4. UI Architecture & Design Patterns
- **Popover API:** Native overlay management without Z-index battles.
    - **Context7 Library ID:** `/mdn/content` (Search: Popover API)
    - **CSS Hook:** `:popover-open` for state-based styling.
- **CSS Anchor Positioning:** Native relative positioning for overlays.
    - **Context7 Library ID:** `/websites/css-tricks_almanac` (Search: Anchor Positioning)
- **State-Driven CSS:** Usage of `:has()` for parent-child styling and JS-free segmented controls.
    - **Context7 Library ID:** `/websites/css-tricks_almanac` (Search: :has)

## 5. External API Integrations
- **Geoapify Geocoding:** Forward/Reverse geocoding with proximity bias.
    - **Context7 Library ID:** `/websites/apidocs_geoapify`
    - **Parameter:** `bias=proximity:lon,lat` for location-aware suggestions.
- **Photon API (Komoot):** OSM-based lightweight geocoding.
    - **Reference:** `photon.komoot.io/api`
    - **Parameter:** `lat`, `lon` for bias; `bbox` for hard filtering.

## 6. Internationalization & Security
- **Intl.Segmenter:** Locale-aware string segmentation (e.g., German 'de' sentence splitting).
    - **Context7 Library ID:** `/mdn/content` (Search: Intl.Segmenter)
- **Sanitizer API:** Secure DOM manipulation via native `setHTML()`.
    - **Context7 Library ID:** `/mdn/content` (Search: HTML Sanitizer API)

---
*Created by Gemini CLI on 2026-03-26. Approved for stable production.*
