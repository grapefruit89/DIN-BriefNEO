# Typography — thinking with type

Source: Ellen Lupton, *Thinking with Type: A Critical Guide for Designers, Writers, Editors & Students*. Organized LETTER / TEXT / GRID + detail.

Lupton's stance: "This is not a book about fonts. It is a book about how to *use* them." Typography is a tool for doing things with content — shaping it, giving language a body. Every rule "can be broken," but you must know it first. Bad practices are labeled **TYPE CRIMES**.

## When to apply this

Load this when choosing, sizing, spacing, or reviewing type in any UI: body copy, headings, forms, tables, captions, buttons. Use it to set defaults (size, `line-height`, measure, hierarchy) and to catch crimes (fake bold/italic, negative tracking, dumb quotes, justified holes). Pairs with [design-principles.md](design-principles.md) (Lidwell's readability, hierarchy, aesthetics).

---

## Letter

### Font vs. typeface
- A **typeface** is the *design* of a set of letterforms (e.g., Bodoni). A **font** is the *thing you install/use* — historically the physical metal sort, today the digital file. Loosely: typeface = design, font = deliverable.
- The **roman** (also "plain" / "regular") is the **core or spine** of a family — the upright parent from which the rest is conceived.

### Why the forms differ (history as explanation)
Type history is "a continual tension between the hand and the machine, the organic and the geometric." Forms differ because each era's tools left their imprint:
- **Gutenberg** (early 15th c.) modeled type on dense **blackletter** handwriting, using many **ligatures** to mimic the hand. The small Latin character set suited mechanization.
- **Humanist / lettera antica** (15th-c. Italy): scholars rejected gothic for wider, rounder classical hands. **Jenson** (Venice, c.1469) produced among the first fine **roman** faces.
- **Italic** (15th c.) was modeled on cursive; used because it was faster and **saved space (saved money)**. Originally roman and italic were *distinct*; the 16th c. merged them into **families** with matching x-heights.
- **Transitional Baskerville** (1750s) used a flexible steel pen → sharper serifs, vertical axis, higher contrast. **Modern Bodoni/Didot** pushed to extremes. **Egyptian/slab** (1806) made the serif "load-bearing." **Sans/gothic** (19th c.) commanded attention by "massive frontality." The **pantograph + router (1834)** spawned endless distorted display cuts. **Futura** (1927) was designed as "a painterly tool for constructing a page in shades of gray."

### Classification (the teachable scheme)
Three historical groups map to Renaissance / Baroque / Enlightenment:
1. **Humanist / Old Style** — emulate classical calligraphy; connected to the hand: **angled stress, bracketed serifs, low contrast**. (Garamond, Jenson, Bembo, Sabon.)
2. **Transitional** — sharper serifs, **more vertical axis, higher contrast** than humanist; more abstract. (Baskerville — contemporaries said he was "blinding all the Readers in the Nation.")
3. **Modern** — radically abstract: **thin straight unbracketed serifs, fully vertical axis, sharp thick/thin contrast**. (Bodoni, Didot, Walbaum. "An abstract and dehumanized approach.")

Plus:
- **Egyptian / Slab Serif** — heavy, slablike serifs; the serif goes "from a refined detail to a load-bearing slab." 19th-c. display/advertising. (Clarendon.)
- **Sans-serif** subgroups:
  - **Humanist sans** — calligraphic line-weight variation, small angled details. (Gill Sans.)
  - **Transitional / "anonymous" sans** — uniform, upright, neutral. (Helvetica, Miedinger 1957.)
  - **Geometric sans** — built on circle/triangle, perfect-circle O. (Futura, Renner 1927.)

Web relevance: pick body faces with **open counters and sturdy weights**; reserve high-contrast Modern faces and geometric display cuts for large headings, not paragraphs.

### Anatomy (terms to know)
- **Baseline** — the line letters sit on; the most stable axis of a line, crucial for aligning text with images/other text. Round letters slightly overhang it; commas/semicolons descend below.
- **X-height** — height of the lowercase body (the *x*), excluding ascenders/descenders. The **greatest density of a text field is between baseline and x-height top.** A large x-height makes a face look bigger at a given point size.
- **Cap height** — baseline to top of a capital.
- **Ascender** — rises above x-height (b, d, h, k, l). **Descender** — falls below baseline (g, p, q, y).
- **Counter** — the enclosed or partly enclosed space inside a letter (o, e, a). Open counters keep small text legible.
- **Ligature** — a form fusing two+ letters (fi, fl, ff). Also named: **stem, bowl, serif, cross bar, spine, finial, terminal.**
- **Small capital** — a capital sized near the lowercase x-height (actually *slightly taller*), so it sits in a line without the loudness of full caps.

### The point system
- **1 point = 1/72 inch ≈ 0.35 mm.** **12 points = 1 pica.** **6 picas = 72 points = 1 inch.** Picas are the standard unit for **column widths**.
- A typeface is measured from cap top to lowest descender, plus a small buffer.
- Notation: `8/9 Helvetica` = 8-pt type on 9 pts of line spacing.
- **Set width** = the letter body plus a sliver of protective space beside it — intrinsic to the face's proportion. Need a different width? Use a **condensed/extended cut**. **TYPE CRIME: horizontal/vertical scaling** — distorts strokes (thick→thin, thin→thick).
- **Apparent size ≠ point size:** two faces at the same size can look very different because of x-height, weight, and set width.
- **Sizes (Lupton's norms):** software default **12 pt** looks "big and horsey" in print; **9–11 pt** is common for printed body; captions ~**7.5 pt**. Paula Scher: "Make it bigger" — amateurs set type too big, pros err too tiny. **CSS:** `1pt ≈ 1.333px`; body copy **~16px** is the screen analog of comfortable print body. Treat the "12pt default" as a warning to set sizes *deliberately*, not accept defaults.

### Type families & weights
- A traditional roman book face has a small **"nuclear" family**: roman, italic, small caps, and maybe bold + semibold (each with an italic). Sans families often span many weights/widths (thin → black, condensed → extended).
- **Italic is a separate typeface, not a slanted roman** — different letter shapes (the *a* differs between roman and italic).
- Big systems (Univers = 21 variants, 5 weights × 5 widths, conceived whole; Thesis; Scala/Scala Sans sharing a spine) let you build hierarchy and gray-value coherently.
- **TYPE CRIMES — faking family members:** pseudo-italic (skew the roman → "wide, ungainly, forced"), pseudo-bold (pad edges → "blunt and dull"), pseudo-small-caps (shrink full caps → "puny and starved"). **CSS:** load real cuts; avoid relying on synthetic `font-style: italic` / `font-weight: bold` where a true cut isn't available (`font-synthesis: none` to expose gaps).

### Lining vs. old-style (text) figures
- **Lining figures (123)** — uniform height (~cap height), uniform width → line up in tabular columns. **CSS:** `font-variant-numeric: lining-nums tabular-nums`.
- **Old-style / non-lining / "text" figures (123)** — small body with ascenders/descenders, so they mix gracefully with lowercase in running text. **CSS:** `font-variant-numeric: oldstyle-nums`.
- Use **tabular** figures for numbers that must align in columns; **old-style/proportional** for numbers set inline in prose.

### Display vs. text faces
- **Text (readable) faces** are workhorses for long bodies: open counters, moderate contrast, sturdy weights.
- **Display faces** command attention at large sizes (extreme contrast, distortion, ornament) and **fail as text**. Don't set paragraphs in a display cut.

### Bitmap vs. outline / hinting
- **Outline font** (e.g., PostScript/TrueType/OpenType) — a **vectorized, scalable** outline; great at high resolution. At tiny screen sizes it rasterizes to pixels, where **anti-aliasing can worsen legibility**.
- **Bitmap / pixel font** — fixed grid of on/off pixels designed for **one specific size** (e.g., 8 px). **Display only at even multiples of its root** (8 → 16 → 24 → 32) so the grid stays crisp. Georgia and Verdana (Carter, 1996) were designed *for screen*.
- Web relevance: prefer faces with good **hinting** and screen-tuned metrics for UI text; ship pixel/bitmap type only at integer multiples.

---

## Text

"Text" = the running **body** of words, distinct from headlines/captions. Design is "as much an act of *spacing* as an act of *marking*." Humane function: help readers *avoid* reading via ways in and out — indents, headings, navigation.

### Kerning vs. tracking (letterspacing)
- **Kerning** = adjusting space between **two specific characters**. Angled/open letters (W, Y, V, T, L) create gaps; digital fonts fix this via a **kerning-pair table**. "LOVE LETTERS" — the *VE* and *TT* pairs look wrong until kerned. Italics especially need it. **Kern more at large sizes** — gaps grow with size. **TYPE CRIME:** "mind the gap" at display sizes. **CSS:** `font-kerning: normal`; hand-tune display type letter-by-letter.
- **Tracking (letterspacing)** = adjusting **overall** space across a run of letters. **CSS:** `letter-spacing`.

**Lupton's tracking rules:**
- **Letterspace CAPS and SMALL CAPS** — they "appear more regal when standing apart"; caps are "square and conservative." **CSS:** `text-transform: uppercase; letter-spacing: 0.05–0.1em`.
- **Do NOT letterspace lowercase** — lowercase "is designed to sit together intimately on a line." Use only sparingly.
- **Negative tracking is rarely desirable.** **TYPE CRIME:** "Make the shoe fit, not the foot" — don't use negative tracking to cram text. Avoid negative `letter-spacing` on body copy.
- Slight *positive* tracking makes "a more airy field"; chiefly to fine-tune a line of justified type.

### Leading (line spacing)
- **Leading** = distance from **one baseline to the next** (named for the lead strips in metal type).
- **Default ≈ 120% of type size** ("slightly greater than the cap height"). 10-pt type ≈ 12-pt leading. **CSS:** `line-height: 1.2` is the analog default; layout software "Auto" ≈ 120%.
- **Set solid** = leading equal to size (7/7) → ascenders/descenders touch; "an uncomfortable effect." Avoid.
- **Add leading** for a lighter, more open **color**; push too far and lines "become independent linear elements rather than parts of an overall texture."
- **Reduce leading** for tight, dense display setting (large sizes need proportionally less).
- **CSS body guidance:** comfortable running text reads well around **`line-height: 1.4–1.6`** (book print examples run 7/9–7/10). Use unitless `line-height` so it scales with size.

### The line / measure
- Lupton ties line-length problems mainly to **justification**: ugly gaps appear "when the line length is too short in relation to the size of type." **Fix:** make the measure long enough for the size, or reduce size so more words fit per line. The book prints no single "ideal" count, but the rule is **match measure to size; narrow column + justify = holes.**
- Web translation: keep measure comfortable, commonly **~45–75 characters**. **CSS:** `max-width: 66ch` (≈`60–75ch`). Never justify a too-narrow column.

### Alignment — the five settings + their rules
**Justified** — even edges both sides.
- Good: clean figural shape, efficient space; the norm for newspapers/books.
- Evil: **ugly gaps** when measure is too short for the size. **TYPE CRIME: "Loch Ness Holes."** Fix with adequate measure, **hyphenation**, slight line letterspacing.
- **CSS:** `text-align: justify; hyphens: auto;` and a wide enough measure.

**Flush left / ragged right** — hard left, soft right.
- Good: word spaces stay constant → **no holes inside lines**; "respects the organic flow of language rather than submitting to the law of the box." The safe default for screens.
- Evil: a **"bad rag."** A **good rag** is "pleasantly uneven, with no lines excessively long or short, and hyphenation kept to a minimum." A rag is *bad* when too even, too uneven, or forming **wedges, moons, or diving boards.**
- **CSS:** `text-align: left`; tune with `&shy;`/`<wbr>` and `text-wrap: pretty` (rag quality) or `balance` (short headings).

**Flush right / ragged left** — hard right, soft left.
- Reputedly hard for long text ("forces the eye to find a new start each line — could be true, or an urban legend"). Rare for long bodies.
- Good for small blocks: **captions, sidebars, marginal notes, pull quotes** — suggests affinity toward the element it sits beside.
- Evil: bad rags, **plus punctuation at line ends weakens the hard right edge.** **CSS:** `hanging-punctuation: last` can help hold the edge.

**Centered** — symmetrical, "like the facade of a classical building."
- Good: formal, classical; invites **breaking for sense** (breaking lines to emphasize a phrase or start a new thought).
- Evil: static, conventional; careless use is "stodgy, static, and mournful, like a tombstone." Reserve for invitations, titles, certificates.

**Ragged** is the general soft-edge condition — the goal is a **good rag** (see flush-left). Disable auto-hyphenation on ragged and centered text.

### Rivers, widows, orphans (exact defs + fixes)
- **River** — gaps that **connect vertically or diagonally through a paragraph**, linking the word-spaces of several lines. "Violate the even, unified texture" of good typography. Most common in **justified narrow columns.** *Fix:* widen measure, reduce type size, enable hyphenation, or don't justify.
- **Widow** — a short last line of a paragraph left stranded (a lone word or short fragment at the end/bottom). *Fix:* edit copy, adjust tracking/measure, or force a break so the last line carries more. Purge stranded fragments.
- **Orphan** — a stray short line or single word separated from its paragraph (e.g., a paragraph's opening line left alone at the foot of a column). Avoid. **CSS:** `orphans: 2; widows: 2;` (in paged/print contexts); `text-wrap: pretty` reduces single-word last lines.
- **Stacked hyphens** — avoid more than a couple of consecutive hyphenated lines. Wayward hard hyphens strand "in the mid-dle of a line" — use **discretionary** hyphens instead.

### Paragraph indication (methods)
"Paragraphs do not occur in nature" — a literary convention. The standard **indent + line break** (a deliberate, practical *redundancy*) became standard in the 17th c. Alternatives Lupton shows:
1. **Indent + line break** (classic default). **CSS:** `text-indent`.
2. **Outdent / hanging indent** (first line hangs left).
3. **Line break only, no indent** (clean left edge — needs an extra cue).
4. **Line break + ½-line space** (vertical gap). **CSS:** `margin-block: 0.5lh` (or ~0.5em) on `<p>` — the web default.
5. **Extra space inside the line, no break.**
6. **Pilcrow (¶) with no indent or break** (medieval/Morris style; max density).
- **Dwiggins rule:** "let the first line start flush" — **don't indent the first paragraph** after a heading.
- **Don't indent with the space bar or spaces-as-tabs** — use real indent/tab (or `text-indent`).

### Hierarchy
- A **typographic hierarchy** expresses organization — emphasizing some content, diminishing other — so readers can scan, enter, exit, and choose.
- Each level = **one or more cues**, applied **consistently.** Cues are **spatial** (indent, spacing, placement) or **graphic** (size, style, color, typeface).
- **Economy rule: no more than THREE cues per level or break.** **TYPE CRIME: "too many signals"** (bold + italic + underline + caps + color at once).
- **Emphasis in running text needs only ONE signal — italic is the default.** Alternatives: bold, small caps, color, or a different font. "Emphasis can be created with just one shift." **CSS:** prefer `<em>` (italic) and reserve `<strong>` (bold) for stronger emphasis.
- **Mixing font families** (e.g., Scala + Futura): **adjust sizes so the x-heights align.**
- **CSS:** build hierarchy from a **type scale** + weight + spacing; keep ≤3 cues per level; use semantic `<h1>`–`<h6>`, `<em>`, `<strong>`.

### Web, accessibility, density
- Web is governed by hierarchy even more than print: file structure, nested HTML, and interface all reflect it.
- **Accessibility:** avoid tables for layout; use **alt text consistently**; place **skip links / page anchors** before repeated nav so users jump to main content; ensure content **linearizes** sensibly for screen readers; serve alternate layouts via **CSS**.
- **HCI facts Lupton cites:** crisp **black-on-white** reads from screen as efficiently as paper (Gould, 1987) — reader impatience is *cultural*, not technological. Users are in "search mode, not processing mode" (Nielsen). **Text often beats icons** for clarity (icons still need per-language translation — pair icons with labels).
- **"Density is the new white space."** White space is "a modernist myth" to question; Tufte-style **information density** on one well-organized surface often beats sparse multi-page layouts for comparison and quick-finding. "An interface calls attention to itself at its point of failure."

---

## Grid

"A grid breaks space or time into regular units." Grids are "all about control" — but an effective grid is "not a rigid formula" but "a flexible and resilient structure, a skeleton that moves in concert with the muscular mass of information."

### Golden section (with Lupton's skeptical take)
- **Golden section** = ratio used in Western art for 2000+ years. Formula **a : b = b : (a + b)**, numerically **≈ 1 : 1.618.** Remove a square from a golden rectangle → another golden rectangle (→ spiral).
- **Lupton's balanced take:** some build whole grids from it; **others reasonably reject it** as no more valid than standard paper sizes or plain whole-number formats with logical divisions. "It may well be absurd to base a Web site on the golden section, but here, nonetheless, is a design for one." Commercial printers prefer **even trim measures**; you can float a golden rectangle *within* any trim. Don't treat 1.618 as magic.

### Grid anatomy (parts)
- **Margins** — framing space around content; on spreads become **inside (spine) + outside** margins. Usually mirror-symmetric, but **asymmetric** spreads are allowed.
- **Columns** — vertical zones for text/images. "The more columns you create, the more flexible your grid becomes." Content may span several; not all space must be filled.
- **Gutters** — the spaces *between* columns. **CSS:** `gap` in Grid/Flexbox.
- **Flowlines / datum** — a **horizontal** reference line dividing the page into bands. Content can "hang" from a common datum and fall downward with an uneven bottom.
- **Spatial zones / modules** — areas reserved for a kind of content (e.g., one column for images+captions), articulating hierarchy.

### Types of grid
1. **Single-column** — one text column inside margins; the classic book page. Design **"outside in"** (text = what's left after margins) or **"inside out"** (zero margins, place boxes freely). Design books/magazines as **spreads** — the two-page spread is the unit.
2. **Multi-column** — flexible for complex hierarchy and text+image mixing. Reserve columns as vertical zones; add a horizontal **datum** so text hangs from a common line; elements may span columns. **CSS:** `grid-template-columns`, spanning via `grid-column: span N`.
3. **Modular** — consistent **horizontal divisions (top→bottom)** *plus* vertical divisions → a field of **modules** governing placement and cropping of pictures and text. Swiss invention (Gerstner, Ruder, Müller-Brockmann, 1950s–60s). Build horizontal divisions to match the **leading**.
4. **Baseline grid** — the vertical regulator under a modular grid: a fixed measure (e.g., 10-pt) sets spacing baseline-to-baseline so **all text snaps to one rhythm.** **CSS:** approximate with a spacing scale that is a multiple of `line-height` (vertical rhythm); `line-height` in `lh` units helps.

Müller-Brockmann's tension: seek "the maximum of conformity to a rule with the maximum of freedom — the maximum of constants with the greatest possible variability."

### Grid as data table — the "data prison" caution
- A **table** = columns × rows of cells; per Tufte "the grid is a cognitive tool" and in a data table "acquires semantic significance."
- **TYPE CRIME: "Data prison"** (Tufte) — heavy ruled horizontal+vertical lines trapping every entry. **Redesign:** eliminate most rules; use **alignment of the type itself** to express structure; where separation is needed use a **pale tone band** to unify rows; replace repetitive numerals with **dots** so the eye compares without reading each number. Let data command the page, not the grid.
- **CSS:** style `<table>` with minimal borders, `tabular-nums`, right-aligned numeric columns, zebra `background` bands (not rules). Use `<table>` **only for real tabular data** — layout goes to **CSS Grid/Flexbox** (the `<table>` element, added to HTML in 1995, was long abused for layout and breaks screen-reader linearization).

### Breaking the grid
- The grid exists to be **activated, not obeyed slavishly.** Herbert Read: "All beautiful lines are drawn under mathematical laws **organically transgressed.**" Pleasure comes from "metrical irregularities based on a governing structure."
- **"Make the shoe fit, not the foot"** — build flexible, responsive systems (CSS, responsive design are the modern "programme") rather than forcing content into rigid containers. Use the root grid as a launchpad for "variation and surprise," always referring back to it.

---

## Punctuation & detail

### Dashes — three lengths, distinct uses
- **Em dash (—)** — a **strong grammatical break**. One em wide = **the point size**. Typed as `--` in manuscripts → **must be replaced.** **No spaces around it.** **HTML:** `—`.
- **En dash (–)** — connects **numbers/ranges** (1–10) meaning **"up to and including."** **Half an em.** **No spaces around it.** **HTML:** `–`. **TYPE CRIMES:** a hyphen between numbers (use en dash); an en dash inside a hyphenated word (use a plain hyphen).
- **Hyphen (-)** — links compound words and breaks words at line ends. Use the **discretionary (soft) hyphen** for line breaks — it appears only if needed and vanishes on reflow (**HTML:** `&shy;`). **Disable auto-hyphenation** on ragged/centered text. **TYPE CRIME:** hard hyphens stranded in the "mid-dle" of a line.

### Smart quotes vs. primes
- **Quotation marks** ("smart"/curly) have distinct **open and closed** forms; a **single close quote doubles as the apostrophe** ("It's Bob's font.").
- **Primes / hatch marks ("dumb quotes")** are **straight up-and-down**; their **only legitimate use is inches and feet** (5′2″). Using them as quotes is "a common blight." **TYPE CRIME:** prime marks used as quotation marks. Watch the **auto-smart-quote bug** that flips a leading apostrophe (`‘tis` → should be `’tis`); fix by hand.

### Spaces
- **One space after a period** (and after commas/colons/semicolons). **Double-spacing between sentences is a TYPE CRIME** — "an ugly gap." (HTML collapses doubles anyway, but purge them in source.)
- **Don't use the space bar as a design tool** — no spaces for indents (use a tab / `text-indent`), no spaces to center or lay out ("unless you really are e e cummings").

### Ellipsis — 3 vs. 4 dots
- **Three periods** = an ellipsis. Render with the dedicated **ellipsis character** (`&hellip;` → …), or word-spaced, or open-tracked (Lupton's preference). After a complete sentence: **period + ellipsis = four dots.**

### Ligatures
- **Ligature** = two+ letters combined into one form (fi, fl, ff, ffi). Use where the design calls for it. **CSS:** `font-variant-ligatures: common-ligatures` (or `font-feature-settings: "liga"`).

### Small caps
- Use **true** small caps (a cap sized **slightly taller than the x-height** so it sits in a line without the loudness of full caps) — **never shrunken full caps** (a TYPE CRIME). Letterspace them slightly. **CSS:** `font-variant-caps: small-caps` (uses real small caps when the font has them).

---

## Quick numbers

| Thing | Rule / value |
|---|---|
| Point system | 1 pt = 1/72 in ≈ 0.35 mm; 12 pt = 1 pica; 6 picas = 72 pt = 1 in |
| pt → px | 1 pt ≈ 1.333 px |
| Body size (screen) | ~**16px** (print body 9–11 pt; captions ~7.5 pt; 12-pt default = "horsey" in print) |
| Default leading | ≈ **120%** of size → `line-height: 1.2` |
| Comfortable body leading | **`line-height: 1.4–1.6`** (unitless) |
| Set solid | leading = size (7/7) — avoid; descenders touch |
| Measure | **~45–75 characters** → `max-width: 66ch`; never justify a narrow column |
| Justified | pair with `hyphens: auto` + wide measure or get "Loch Ness Holes" |
| Ragged | aim for a *good rag*; disable auto-hyphenation on ragged/centered |
| Hierarchy | **≤ 3 cues per level**; running-text emphasis = **1 signal (italic default)** |
| Mixed families | align **x-heights** by adjusting sizes |
| Tracking | letterspace CAPS/small-caps (`0.05–0.1em`); never lowercase; no negative tracking on body |
| Golden section | ≈ **1 : 1.618**, a:b = b:(a+b) — treat as optional, not magic |
| Em / en dash | em = 1 em (= point size); en = ½ em; both **no surrounding spaces** |
| Spaces after period | **one**, never two |
| Ellipsis | **3 dots**; sentence-ending = **4 dots** |
| Bitmap fonts | display only at **even multiples** of root (8→16→24→32) |
| Figures | tabular columns → `tabular-nums`; inline prose → `oldstyle-nums` |
| Tables | real data only; kill rules (Tufte "data prison"), use pale bands + alignment |

### TYPE CRIMES checklist (Lupton's recurring flags — catch these in review)
- **Horizontal/vertical scaling** of a face to change width → use a real condensed/extended cut.
- **Fake italic / fake bold / fake small caps** → load real cuts; `font-synthesis: none` to expose gaps.
- **Negative tracking** to cram body text; **letterspaced lowercase**.
- **Justified narrow column** → "Loch Ness Holes" and **rivers**; widen measure, hyphenate, or don't justify.
- **Bad rag** (wedges, moons, diving boards); **stacked hyphens**; hard hyphen in the "mid-dle" of a line.
- **Widows / orphans** — stranded end-of-paragraph fragments and lone opening lines.
- **Too many signals** (>3 cues per level); more than one emphasis cue in running text.
- **Dumb quotes / primes** used as quotation marks; flipped auto-apostrophe (`‘tis`).
- **Double space after a period**; **space bar or spaces** used to indent or lay out.
- **Hyphen between numbers** (use en dash); **en dash inside a hyphenated word** (use hyphen).
- **Display face set as body text**; **bitmap font at a non-integer multiple** of its root size.
- **"Data prison"** — over-ruled tables; strip rules, use alignment + pale bands + dots.

### Free advice (Lupton)
"Think more, design less" (gradients/drop-shadows/gratuitous transparency are "desperate acts" without a concept). · "Say more, write less." · "Density is the new white space." · "Make the shoe fit, not the foot." · "Make it bigger" (Scher) — but amateurs overdo it, pros go too tiny. · "An interface calls attention to itself at its point of failure." · "The idea is the machine that makes the art" (LeWitt). · Every rule can be broken — but know it first.

See also [design-principles.md](design-principles.md) for readability, hierarchy, and aesthetic-usability grounding.
