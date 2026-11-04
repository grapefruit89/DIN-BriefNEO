---
name: modern-javascript
description: Modern Vanilla JavaScript standards, architecture, and security rules for DIN-BriefNEO. Zero-framework (pure W3C ES Modules, no Webpack/Vite/Babel, no Lodash), strict DOM XSS prevention (no innerHTML/setHTMLUnsafe), localStorage SSOT, native Web Platform APIs (DecompressionStream, AbortController, FontFace, Temporal), and the HTML-first economy ladder. Use whenever writing, modifying, debugging, or reviewing JavaScript in DIN-BriefNEO.
---

# Modern JavaScript (DIN-BriefNEO Edition)

DIN-BriefNEO is a zero-build, zero-framework web application running natively in modern Chromium browsers with an official project baseline of **Chrome 150+** (Immutable Law Catalog H11).

All client-side code consists of standard, unbundled W3C ECMAScript Modules (`<script type="module">`).

---

## 1. Architectural Invariants (Immutable Laws)

### A. Zero Frameworks, Zero Bundlers (Law A51)
- Never introduce build tools, bundlers, or transpilers (no Webpack, Vite, Rollup, Parcel, Babel, or TypeScript compilation steps).
- The code you write in `website/js/` is the exact code executed by the browser.
- External dependencies are strictly forbidden, with the sole exception of the explicitly allowed Tier-2 geocoding API (`api.geoapify.com`).

### B. Zero Utility & Animation Libraries (Laws A53, A54)
- **No utility libraries (Law A53):** Never import Lodash, Underscore, Ramda, or similar helper libraries. Modern native JavaScript provides `structuredClone()`, `Array.prototype.toSorted()`, `Object.groupBy()`, `Set.prototype.intersection()`, etc.
- **No JS animation libraries (Law A54):** Never introduce GSAP, Framer Motion, Anime.js, or script-driven animation loops. Transitions and dialog animations are handled declaratively in CSS via `@starting-style` and `@media (prefers-reduced-motion: no-preference)`.

### C. Strict XSS Prevention & DOM Mutation (Law A61)
- **HARD BAN on `innerHTML`, `outerHTML`, and `setHTMLUnsafe()`**:
  - Setting unescaped markup via string concatenation is a critical security vulnerability and violates Catalog Law A61.
  - Use `element.textContent` for plain text.
  - Use `document.createElement()`, `element.append()`, or `document.createDocumentFragment()` for structured DOM nodes.
  - If HTML parsing is required, use the sanitized `element.setHTML()` API.

### D. Single Source of Truth for Persistence (Laws A34, A35, A36)
- **The only application datastore is `localStorage`** (wrapped through `website/js/persistence.js` using the namespace prefix `din_`).
- IndexedDB (Law A34) and OPFS (Law A35) are prohibited.
- File System Access API (Law A36) is strictly optional for file export/import, never a mandatory storage mechanism.

### E. Timezone Safety (Law A50)
- Always specify an explicit IANA timezone when dealing with dates:
  ```javascript
  Temporal.Now.zonedDateTimeISO('Europe/Berlin');
  ```
  *(Never rely on unanchored host system local time).*

### F. Zero Base64 Inlining in Code (Law A64 / Rule 11)
- Never hardcode or inline Base64 data URIs, serialized binary blobs, or inline payloads into JS modules. Code and data remain strictly decoupled.

---

## 2. Die goldene Regel: "JavaScript ist die Krücke" (HTML > CSS > JS)

> **Das unumstößliche Kern-Dogma von DIN-BriefNEO:**
> **Alles, was im HTML gemacht werden kann, machen wir im HTML.**
> **Alles, was dort nicht geht, machen wir mit CSS.**
> **Und erst wenn CSS nachweislich nicht ausreicht, kommt JavaScript:**
> 👉 **`JavaScript = Krücke`** — es ist das letzte Mittel, niemals das erste.

Bevor auch nur eine einzige Zeile JavaScript geschrieben wird, greift diese strikte Entscheidungsleiter:

1. **Step 0 — Feature Check:** Verify if the target feature is available in the baseline:
   ```bash
   node tools/check-feature.js "<feature-name>"
   ```
2. **Step 1 — Can HTML5 do it natively?**
   - Use HTML5 constraint validation (`pattern`, `minlength`, `maxlength`, `required`) instead of manual regex input interceptors.
   - Use the Popover API (`popover`, `popovertarget`) instead of custom toggle scripts.
   - Use native `<dialog>` and `commandfor` triggers instead of JS click listeners.
3. **Step 2 — Can modern CSS do it without JS?**
   - Use `:has()`, `:focus-visible`, `:valid`, `:invalid`, `:placeholder-shown` to drive state instead of toggling DOM classes via JS.
   - Use CSS `field-sizing: content` instead of DOM text-fitting layout loops (Law A49).
4. **Step 3 — Extend existing JS before creating new modules:**
   - Check `website/js/core.js`, `website/js/document.js`, `website/js/address.js` before adding new files.
5. **Step 4 — Minimal Surgical JS:**
   - Write the smallest possible pure function. Keep state localized and communicate across modules via the centralized `eventBus` (`js/core.js`).

---

## 3. Idiomatic Patterns in DIN-BriefNEO

### A. Streaming Gzip Decompression (Local Offline Dictionaries)
DIN-BriefNEO serves its 70 KB PLZ and district dictionaries as `.json.gz` to minimize bandwidth while retaining full offline speed:
```javascript
export async function fetchGzipJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const stream = res.body?.pipeThrough(new DecompressionStream('gzip'));
    if (!stream) return null;
    return JSON.parse(await new Response(stream).text());
  } catch (err) {
    console.warn(`[Gzip] Load failed for ${url}:`, err);
    return null;
  }
}
```

### B. AbortSignal & Request Debouncing
Avoid race conditions and memory leaks by wiring `AbortController` into user search inputs:
```javascript
let activeController = null;

function performSearch(query) {
  if (activeController) activeController.abort();
  activeController = new AbortController();

  fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: activeController.signal })
    .then(res => res.json())
    .then(data => renderResults(data))
    .catch(err => {
      if (err.name !== 'AbortError') console.error('Search failed:', err);
    });
}
```

### C. Decoupled Event Bus
Modules do not directly mutate other modules; they publish and subscribe through `eventBus` (`website/js/core.js`):
```javascript
import { eventBus, Events } from './core.js';

// Publish
eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: 'Brief gespeichert', type: 'success' });

// Subscribe
eventBus.subscribe(Events.NOTIFICATION_REQUESTED, ({ message, type }) => {
  showToast(message, type);
});
```

---

## 4. References

Consult the specific reference files when inspecting advanced syntax or standard behavior:

| Reference | Topic |
|---|---|
| `references/CHEATSHEET.md` | Array methods, Set methods, Object grouping, copy-by-mutation |
| `references/PROMISES.md` | `Promise.allSettled`, `Promise.withResolvers`, microtask order |
| `references/CONCURRENCY.md` | Async iterators, cancellation patterns, worker communication |
| `references/ES2025.md` | Set methods (`union`, `intersection`, `difference`), Iterator helpers |
| `references/ES2026.md` | `Array.fromAsync`, latest standardized methods |

---

## 5. Unified Verification Gatekeeper

After any changes to JavaScript, run the consolidated gatekeeper:
```bash
python3 tools/gate.py
```
Or to auto-format with Biome and check in one step:
```bash
python3 tools/gate.py --fix
```
Gates enforced:
1. **Biome Linter & Style:** 0 errors, 0 warnings.
2. **Hermetic Isolation (A38/A45):** Zero rogue network requests, local assets only.
3. **IMR 4.0 Registry:** Valid DIN-5008 element interactions.
4. **Evolutionary Fitness:** 100% score on `tools/build_db.js`.
