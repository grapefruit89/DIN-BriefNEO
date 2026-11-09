---
name: modern-css
description: Comprehensive CSS architecture, declarative rules, and DIN 5008 print styling for DIN-BriefNEO. Zero-framework (pure W3C Vanilla CSS, no Tailwind, no CSS-in-JS), 100% OKLCH color tokens (Law W4), logical properties, CSS-first constraint validation, :has() state modeling, @container queries, and A4 millimeter print simulation. Use whenever writing, editing, or reviewing styles in DIN-BriefNEO.
---

# Modern CSS (DIN-BriefNEO Unified Edition)

> **Das unumstößliche Kern-Dogma von DIN-BriefNEO:**
> **Alles, was im HTML gemacht werden kann, machen wir im HTML.**
> **Alles, was dort nicht geht, machen wir mit CSS.**
> **Und erst wenn CSS nachweislich nicht ausreicht, kommt JavaScript:**
> 👉 **`JavaScript = Krücke`** — eine deklarative CSS-Regel schlägt jedes Skript (Immutable Law Catalog A51, A54).

This skill combines **macro-architecture** (cascade layers, the 4 stylesheets, A4 print engine) and **tactical rulebook** (100% OKLCH, logical properties, state modeling via `:has()`, fluid sizing) into a single, unified reference strictly tailored to **DIN-BriefNEO**.

---

## 1. Architectural Invariants (Immutable Laws)

- **Zero Frameworks (Law A21, A22, A51):** Pure W3C Vanilla CSS only. No Sass/SCSS, no Less, no Tailwind, no CSS-in-JS (Emotion, styled-components).
- **No `@import` in CSS (Law A23):** Never write `@import` in stylesheets (causes blocking roundtrips). All sheets are linked via `<link rel="stylesheet">` in `index.html`.
- **No Inline Styles (Law A25):** Never write inline `style=""` for layout, colors, or fonts. Dynamic layout uses semantic HTML `data-*` attributes (`data-x`, `data-w`, `data-h`) or CSS Custom Properties.
- **No `filter: invert` (Law A26):** Dark Mode uses dedicated OKLCH color tokens (`[data-theme="light"]`, `[data-theme="dark"]`).
- **Baseline Chrome 150+ (Law H11):** Take full advantage of modern web platform primitives (`:has()`, `@starting-style`, `@container`, Popover API, `field-sizing`).

---

## 2. The Stylesheets of DIN-BriefNEO

All CSS lives in `website/css/` and is linked via `<link rel="stylesheet">`:

```
website/css/
├── base.css            ← Design tokens (OKLCH), typography scale, normalize, @layer setup
├── sidebar.css         ← App shell, toolbars, sidebar drawer, form controls, key-form, popovers
├── sheet-common.css    ← Gemeinsame DIN 5008 Blatt-Geometrie, Infoleiste, Falzmarken
├── sheet.css           ← DIN 5008 A4 Einzelseiten-Canvas, Millimeter-Raster, @media print Isolierung
└── sheet-multipage.css ← Mehrseiten-Engine (Folgeseiten, Paginierung, dynamische Kopfzeilen)
```

*(Hinweis: Druckstile werden normgerecht und wartungsfrei über `@media print` direkt in `sheet.css` und `sheet-common.css` isoliert).*

---

## 3. The Declarative Rulebook

### A. Zero-HEX Color System (Law W4)
- **Colors are 100% `oklch()`**: Never use `#hex` or `rgb()` in CSS.
- Neutral colors use `none` as the hue: e.g. `oklch(0.98 0 none)`, `oklch(0.2 0 none)`.
- Derive tints, hovers, and transparency via `color-mix(in oklch, …)`:
  ```css
  background-color: color-mix(in oklch, var(--c-accent) 15%, transparent);
  border-color: color-mix(in oklch, var(--c-danger) 40%, transparent);
  ```
- Core semantic tokens: `var(--c-accent)`, `var(--c-success)`, `var(--c-danger)`, `var(--c-bg)`, `var(--c-text)`, `var(--c-border)`.

### B. Logical Properties Everywhere
- Never use physical directional properties (`left`, `right`, `top`, `bottom`, `margin-top`, etc.).
- Always write logical properties:
  - `margin-block`, `margin-block-start`, `margin-block-end`
  - `margin-inline`, `margin-inline-start`, `margin-inline-end`
  - `padding-block`, `padding-inline`
  - `inset-block`, `inset-inline` (in place of `top`/`left`)
  - `inline-size` and `block-size` (in place of `width`/`height`)

### C. Declarative State Modeling (CSS > JS)
- Model UI states natively with CSS pseudo-classes instead of toggling manual JS classes:
  - `:has()` for parent-driven states (e.g. `.key-form:has(input:placeholder-shown) .msg-empty { display: inline; }`).
  - `:valid` and `:invalid` for HTML5 constraint validation feedback.
  - `:placeholder-shown` to control contextual buttons (e.g. clear button `✕`).
  - `popover` and `@starting-style` for popovers, dropdowns, and toast transitions (Law A56: zero JS animation loops).

### D. Focus, Touch & Motion Ergonomics
- Wrap all `:hover` rules inside `@media (hover: hover) and (pointer: fine)` to protect touch devices.
- Style focus with `:focus-visible` and visible `outline`. **Never write `outline: none`** without an accessible `:focus-visible` replacement.
- Every interactive element must provide an `:active` state.
- Wrap all transitions in `@media (prefers-reduced-motion: no-preference)`. Explicitly name animated properties (`transition: border-color 0.15s, box-shadow 0.15s;`) — never use `transition: all` or `ease-in`.

### E. Sizing & Overflow
- Cut off overflow with `overflow: clip`. Keep `overflow: hidden` only when a script intentionally scrolls the container.
- Use `clamp()` for responsive fluid scaling: e.g. `clamp(0.85rem, 0.8rem + 0.25vw, 1rem)`.
- Use `field-sizing: content` for auto-growing inputs and textareas (Law A49: zero JS text-fitting loops).

---

## 4. DIN 5008 A4 Millimeter & Print Engine

- **A4 Physical Dimension:** An A4 page is strictly `210mm × 297mm`.
- **Millimeter Coordinates:** DIN fields use physical units (`mm`) for DIN 5008 compliance:
  - Anschriftfeld: `85mm × 45mm` (Rücksendeangabe bei `data-h="5"`).
  - Falzmarken: `105mm` und `210mm`.
  - Lochmarke: `148.5mm`.
- **Print Media Isolation (`print.css`):**
  ```css
  @media print {
    @page {
      size: A4 portrait;
      margin: 0;
    }
    body {
      background: none;
      margin: 0;
      padding: 0;
    }
    .nicht-drucken, #seitenleiste, .skip-link, [popover] {
      display: none !important;
    }
    #sheet {
      box-shadow: none;
      margin: 0;
      transform: none !important;
    }
  }
  ```
  *(Law A46: Never apply unconditional `page-break-before: always` to roots to avoid blank PDF pages).*

---

## 5. References

Consult the reference files in `references/` when diving into deep syntax:

| Reference | Topic |
|---|---|
| `references/INTERACTION.md` | Button states, input focus, click feedback, form validation |
| `references/SPACING.md` | Spacing scales, element stacking, border radii |
| `references/CASCADE.md` | Specificity, `@layer` ordering, `@scope`, nesting syntax |
| `references/LAYOUT.md` | CSS Grid, Subgrid, Flexbox, intrinsic sizing |
| `references/TOKENS.md` | CSS Custom Properties, theme token hierarchies, font stacks |
| `references/COLOR.md` | OKLCH color spaces, gamut mapping, `color-mix()` syntax |
| `references/COMPONENTS.md` | Popover API, `<dialog>`, native anchor positioning, `field-sizing` |
| `references/ANIMATION.md` | `@starting-style`, entry/exit transitions, view transitions |
| `references/PERFORMANCE.md` | Rendering optimization, `contain`, `content-visibility`, forced reflow prevention |

---

## 6. Verifikation & Qualitätssicherung

Nach jeder Änderung an Stylesheets muss der konsolidierte Gatekeeper ausgeführt werden:
```bash
node tools/build_db.js -q
npm test
npm run check
npm run check:antipatterns
```
Validiert:
1. **Hermetik & Isolation (Law A38/A45):** Keine unzulässigen `@import`- oder `url()`-Verweise auf externe Hosts.
2. **IMR-Registry & Geometrie:** DIN-5008 Blattgeometrie und Selektorkonsistenz.
3. **Evolutionary Fitness:** 100.0% Score auf `node tools/build_db.js -q`.
