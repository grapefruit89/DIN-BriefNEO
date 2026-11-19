# Design Principles — a working catalog

Source: Lidwell, Holden & Butler, *Universal Principles of Design* (Revised & Updated, 125 principles). Selected and reorganized here for digital UI.

**When to apply this.** Reach for this catalog when laying out a screen, grouping controls, designing a flow, sizing/placing targets, writing microcopy, or auditing an existing UI for usability and visual hierarchy. It gives the exact thresholds, numbers, and formulas behind decisions a model tends to hand-wave. These are tools, not dogma — pick the ones the problem calls for, and let clarity override any single rule.

See also [design-of-everyday-things.md](design-of-everyday-things.md) (affordance, mapping, feedback, errors in depth) and [typography.md](typography.md) (type-specific legibility/readability).

---

## Perception & grouping (Gestalt)

The Gestalt principles predict what the eye reads as "grouped." Relatedness should track visual grouping; when they conflict, users mis-read structure. Rough strength order: **uniform connectedness > proximity > similarity**.

### Proximity
Elements placed close together are perceived as more related than elements farther apart. Proximity is one of the strongest grouping cues and generally **overwhelms similarity** (color/shape). Contacting/overlapping = shared attributes; near-but-separate = related yet independent. **Apply:** Space form fields, nav items, and control clusters so gap size encodes relatedness — tighten within a group, widen between groups. Keep every label adjacent to what it describes; prefer direct labels on charts over a separate legend.

### Similarity
Elements that look alike are perceived as related. Grouping strength by channel: **color = strongest** (use few colors), **size = effective when clearly distinguishable**, **shape = weakest** (works only with uniform color/size or combined with them). **Apply:** Give members of a set a shared color/size/shape; give unrelated items different ones. Never rely on color alone (color blindness) — pair it with a second cue.

### Closure
The eye completes a set of elements into a single recognizable pattern, filling gaps rather than seeing fragments. Strongest when elements approximate a simple, familiar shape and sit near one another; fails if forming the pattern takes more effort than reading the parts. **Apply:** Simplify logos, icons, and illustrations by removing lines the viewer can supply — the subconscious "completion" makes the mark more engaging and saves pixels.

### Continuity (Good Continuation)
Elements on a straight line or smooth curve are seen as grouped and are read as continuing in their established direction. **Apply:** Align related items along a shared line/axis; put unrelated items on a different path. In data viz, arrange marks so endpoints form a continuous (not jagged/abrupt) line — easier to scan.

### Common Fate
Elements moving the same way are perceived as related; strongest at the same time, velocity, and direction (or shared flicker timing/frequency). Moving objects read as figure, stationary as ground. **Apply:** Animate related items together (a blip and its label, a card and its shadow). Move a region's bounding edge with its contents to make it read as a figure; hold it still to make it recede.

### Figure-Ground
Every element is read as either figure (focus) or ground (background); the figure gets more attention and is better remembered. Cues for "figure": definite shape, ground appears to continue behind it, seems closer, and sits **below a horizon line / in the lower region** (upper elements read as ground). **Apply:** Keep figure-ground stable and unambiguous. Place elements you want recalled (logo, primary CTA) as clear figures; avoid Rubin-vase ambiguity in overlays and hero art.

### Uniform Connectedness
The most recent Gestalt addition: elements tied by a uniform property — **common region** (a bounded area) or **connecting lines** — read as related, and this **overpowers proximity and similarity**. **Apply:** Wrap related controls/text in a card, panel, or fieldset border; use connecting lines to imply sequence. This is the strongest fix for grouping controls you can't physically move closer.

### Good Form (Law of Prägnanz)
Ambiguous images are interpreted as simple, symmetrical, and complete rather than complex and incomplete ("simplest" = fewest elements, symmetric, honoring other Gestalt cues). **Apply:** Minimize the number of elements — simple figures are processed and remembered better. Use symmetry for efficiency/stability, asymmetry for interest. Evaluate all the Gestalt cues together, not in isolation.

---

## Attention & visual hierarchy

Direct the eye deliberately. Every non-essential mark competes with the essential ones.

### Signal-to-Noise Ratio
The ratio of relevant (signal) to irrelevant (noise) information; aim for the highest achievable. **Maximize signal** — correct chart type, concise presentation, redundant coding/highlighting of key items. **Minimize noise** — remove unnecessary elements, and minimize the *expression* of necessary ones (thin, lighten, or delete grid lines, borders, chrome). "Excess is noise." **Apply:** Strip decorative chrome; lighten dividers and gridlines to the faintest still-legible weight; keep only marks that carry information.

### Highlighting
Bringing attention to a region of text/image. **Highlight no more than ~10%** of the visible design — effects dilute past that. Technique ranking: **bold** (least noise, clear) > **italics** (low noise, less legible) > **uppercase** (good for short labels only) > **underline / color / inverse** (add noise, use sparingly) > **blinking** (reserve strictly for critical, must be dismissible). **Apply:** Use one small, consistent set of techniques; prefer bold; never blink outside emergencies.

### von Restorff Effect (isolation)
A thing that differs noticeably from its neighbors is recalled better (novelty/isolation effect). Works via difference from surroundings *or* from memory. **Apply:** Make the primary action visually distinct from everything around it — but sparingly. "If everything is highlighted, nothing is highlighted." Also useful to lift a mid-list item out of the serial-position dead zone.

### Visibility
Usability improves when status, available actions, and consequences are clearly visible — perhaps the most important and most violated principle for complex systems. Avoid "kitchen-sink visibility" (everything at once → overload); balance with **hierarchical organization** (hide controls inside parents — menus) and **context sensitivity** (reveal/conceal by current context). **Apply:** Always show system status and acknowledge actions with immediate feedback; make a control's visibility track its current relevance; hide/disable what's irrelevant or unavailable.

### Layering
Organizing information into groupings and showing only some at a time. **2D layering** shows one layer at a time (linear for sequences; hierarchical/parallel/web for relationships). **3D layering** shows multiple at once — **opaque** (pop-ups/modals) or **transparent** (overlays). **Apply:** Use 2D layering for navigation; opaque pop-ups to elaborate without losing context; transparent overlays to show relationships between layers.

### Hierarchy
Hierarchical structure is the simplest way to visualize complexity; perception is driven by relative position, proximity, size, and connecting lines. Three forms: **Trees** (child below/right of parent — moderate complexity), **Nests** (child inside parent, Venn-style — simple grouping), **Stairs** (indented outline — complex, but implies false sequence; software conceals children until the parent is selected). **Apply:** Trees for moderate hierarchies, nests for simple grouping, collapsible stairs (tree views) for large/volatile structures.

### Contrast
Covered across alignment, layering, and top-down lighting: apparent depth and separation rise with light/dark contrast, and legibility needs **contrast > 70%** between text and background (see Legibility). **Apply:** Use strong figure/ground contrast for primary elements and reduced contrast for secondary chrome; vary bevel/shadow contrast to signal raised vs. inset controls.

### Alignment
Placing elements so edges line up along common rows/columns, or bodies along a centerline — creates unity, stability, and leads the eye. Left/right alignment gives stronger cues than centered; justified gives more cues than unjustified (good for complex compositions). Diagonal/relative-angle alignments need **≥30°** to be detectable. **Apply:** Snap elements to a grid of rows/columns; prefer left/right edges for the cleanest cues. For nonuniform/asymmetrical items use **area alignment** (align by visual weight, not edges — software's edge-alignment default is a common error); hang bullets and punctuation into the margin.

### Framing
Influencing judgment by how information is presented: a **positive frame** drives positive feelings and proactive/risk-seeking behavior; a **negative frame** drives reactive/risk-avoiding behavior. Stress and time pressure amplify the effect; multiple conflicting frames cancel it. **Apply:** Positive-frame CTAs that push toward action (sign-up, purchase); negative-frame warnings that push toward inaction (avoid risky behavior). Keep frames non-conflicting. (Compositional framing — rule of thirds — is under Decision & aesthetics.)

---

## Cognition, memory & load

Reduce the mental and physical effort each task demands; the less effort, the more likely success (the "principle of least effort").

### Miller's 7±2 / Chunking
Combining units of information into a small number of chunks. Short-term memory holds about **4 ± 1 chunks** (contemporary estimate; Miller's original 7±2 is the classic figure). Applies to **memory tasks only — not to scanning/reference lists**. **Apply:** Chunk anything users must hold in mind or recall (phone numbers → (704) 555-6791, form sections, menu groups). Do *not* chunk lists meant to be searched or scanned. Under stress/noise, chunk critical display info.

### Performance Load
The greater the effort — mental plus physical — to complete a task, the less likely it succeeds. Two types: **cognitive load** (perception, memory, problem solving) and **kinematic load** (steps, movements, force). **Apply:** Cut cognitive load — reduce visual noise, chunk, provide memory aids, automate computation. Cut kinematic load — fewer steps, less pointer travel, automate repetitive input. (Morse code minimized kinematic load: E = a single dot.)

### Progressive Disclosure
Show only necessary or requested information at any moment; reveal the rest on demand. Show frequently-used controls by default; put the rest behind a simple operation ("More"/"Advanced"). Mostly affects infrequently-used elements (little kinematic cost), while showing everything at once sharply raises cognitive load; it also cuts errors and recovery time. **Apply:** Hide advanced options behind a More/Advanced control, especially for novices; use wizards to lead through complex procedures.

### Recognition Over Recall
Recognizing is easier than recalling — recognition tasks supply their own memory cues, are easier to build (via exposure), and last longer. Recognition often drives choice (the familiar option wins even when it's worse). **Apply:** Minimize what users must recall. Show options rather than requiring recalled commands (menus over command lines), keep entered data visible, offer autocomplete and decision aids. See [design-of-everyday-things.md](design-of-everyday-things.md) ("knowledge in the world").

### Mental Model
People act on internal representations built from experience. Two kinds: **system models** (how it works) and **interaction models** (how people use it). Designers hold strong system models but often weak interaction models; users hold the reverse. **Apply:** Design to users' existing *interaction* models (e.g., the desktop metaphor). Don't force a familiar model that doesn't fit — better to teach a clear new one. Get real interaction models by watching people use the design in the field, not by guessing.

### Mapping
The relationship between a control and its effect. Natural mapping = the control's layout/behavior/meaning matches expectation → easier use. Avoid one control with multiple functions; if unavoidable, use visually distinct modes. **Apply:** Position controls so their arrangement mirrors what they affect (stove burners, form order). Keep control→effect relationships simple and predictable; beware conventions that flip across cultures. See [design-of-everyday-things.md](design-of-everyday-things.md).

### Hick's Law
Decision time rises with the number of alternatives. **RT = a + b·log₂(n)**, where a = non-decision time, b ≈ **0.155 sec/option** (humans), n = equally probable alternatives. Applies **only to simple decisions with one unique response per stimulus — not reading, searching, or complex menus/hierarchies**. **Apply:** For time-critical simple choices, minimize options to cut response time and errors. Don't invoke it to justify gutting a rich menu — test complex navigation with realistic tasks instead.

### Fitts's Law
Time to acquire a target depends on its size and distance: **MT = a + b·log₂(d/s + 1)**, with a ≈ **0.230 sec**, b ≈ **0.166 sec**, d = distance, s = target size. Smaller/farther targets take longer; moving faster to small targets raises errors (speed-accuracy trade-off). Applies to rapid pointing, not continuous drawing. **Apply:** Make frequent controls large and/or near. Screen **edges and corners have effectively infinite size** in that dimension (the cursor stops) — put high-value targets there (menu bar, corners). Show context menus at the cursor (minimal distance). Make dangerous controls small and far.

### Serial Position Effects
Items at the start and end of a list are recalled better than the middle: **primacy** (start, stored in long-term memory; stronger with slow presentation) + **recency** (end, still in working memory; **fades after ~30 sec** or intervening info). Order effects: first/last items are also more likely *selected* (ballot position ≈ 1–4% of vote). Visual lists → early items dominate; auditory → late items. **Apply:** Put important items first or last, never mid-list. For an immediate decision, place the target option last; otherwise first. Use von Restorff to rescue must-see middle items.

### Priming
Activating a concept in memory to shape later behavior; activation persists for a time. Most effective when the prime is **indirect/unnoticed** and consistent with a preexisting goal (obvious primes get consciously countered). **Apply:** First impressions, surrounding content, and the path into a flow prime what follows — curate onboarding context, adjacent copy, and imagery. Favor subtle over heavy-handed primes. (Staring-eyes poster nearly tripled honor-box payments.)

---

## Learnability & error

Help people form correct intentions, act without slips, and recover cheaply when things go wrong.

### Affordance
Physical (or perceived) characteristics of an object that suggest its function; when affordance matches function, use is easier. For on-screen images the affordance is *perceived* — the knowledge lives in the user's head. **Apply:** Style controls to afford their action (a raised button looks pressable) and to negatively afford misuse. Borrow familiar physical objects (folders, trash can) to imply behavior in abstract software. See [design-of-everyday-things.md](design-of-everyday-things.md).

### Constraint
Limiting the actions possible on a system to reduce error. **Physical constraints**: paths (scroll bars), axes, barriers (screen edges). **Psychological constraints**: symbols (warning text/icons), conventions (red=stop), mappings. **Apply:** Use physical constraints to prevent errant input; psychological constraints to improve clarity. Disable or hide unavailable options rather than letting users trigger dead ends.

### Feedback
Immediately acknowledge actions and communicate system status (part of Visibility). **Apply:** Confirm every user action visibly and promptly — hover/press states, loading indicators, success/error messages. Absence of feedback reads as "nothing happened," prompting repeat actions and errors.

### Forgiveness
Help people avoid errors and soften the consequences when they occur. Strategy priority: **good affordances → reversibility (undo) → safety nets**, then confirmations, warnings, help. Required help is **inversely proportional to design quality**. **Apply:** Prioritize undo and reversible actions over confirmations. Make destructive actions recoverable (trash, version history). Write warnings that state the actual risk and the recommended action — cryptic ones get ignored.

### Confirmation
Requiring verification before a consequential action (a forcing function); primarily prevents **slips**. Two forms: **dialog** (software) and **two-step/arm-fire** (hardware). Reserve for critical/irreversible actions only. **Apply:** Make confirmation copy concise but convey the consequence; end with a Yes/No question or an action verb (not bare OK/Cancel). Offer "don't show again" for non-critical reminders. Overuse trains users to click through blindly.

### Errors (slips vs mistakes)
Most "human error" is design error. Two types: **slips** (errors of *action* — automatic/unconscious, from routine change or interruption) and **mistakes** (errors of *intention/planning* — conscious, from stress or decision bias; subdivide into perception, decision, knowledge). **Apply:** Reduce slips with clear feedback, affordances/constraints, guarded control placement, and confirmations for the critical. Reduce mistakes by raising situational awareness — reduce noise, keep key indicators/controls within one eyespan, provide checklists/decision trees. Always add forgiveness. See [design-of-everyday-things.md](design-of-everyday-things.md).

### Flexibility-Usability Tradeoff
As flexibility rises, usability falls ("jack of all trades, master of none" — Swiss Army knife vs. paring knife). **Apply:** When users can anticipate their needs, favor specialized, streamlined designs; when needs are unpredictable, favor flexible ones. Expect systems to shift flexible → specialized over their life as needs become defined.

### Consistency
Usability improves when similar things are expressed similarly — enabling transfer of learning. Four kinds: **aesthetic** (style/identity), **functional** (meaning/action), **internal** (within the system), **external** (across systems). **Apply:** Use aesthetic consistency for identity and functional consistency for learnability (reuse standard icons and conventions). Stay internally consistent and externally consistent with platform standards — but don't preserve a foolish consistency at the cost of clarity.

### Mimicry / Metaphor
Copying properties of familiar things to inherit their benefits. Three kinds: **surface** (look like — improves usability), **behavioral** (act like — improves likeability, use cautiously), **functional** (work like — solves mechanical problems; watch scaling/transfer). **Apply:** Use surface mimicry for recognizable icons (folder, document); use behavioral mimicry sparingly; never assume a mimicked solution is optimal — test it (the adding-machine keypad layout lost to an inverted one in testing).

### Nudge
Predictably shifting behavior without removing options or changing incentives much — people take the path of least resistance. Techniques: **defaults** (set to do the most good — opt-out organ donation/pension), **feedback**, **incentives**, **structured choices** (filter complexity), **visible goals**. **Apply:** Set defaults to the most broadly-desired option (not the most conservative); make consequences and progress visible; structure complex choices. (A fly etched in urinals cut spillage ~80%.)

### Desire Line
Traces of actual use that reveal preferred interaction (the worn footpath). **Apply:** Instrument the product — analytics, heat maps, click tracking, repeatedly-erred fields — to find real usage, then redesign to match it instead of fighting it. Pave the cow paths.

---

## Decision, structure & aesthetics

Where to spend effort, how to organize, and how looks affect perceived usability.

### 80/20 Rule (Pareto)
A high share of effects comes from a low share of variables — ~80% of effects from ~20% of causes (critical proportion actually ranges 10–30%). E.g., 80% of usage touches 20% of features; 80% of errors come from 20% of components. **Apply:** Identify the critical ~20% of features and surface them (toolbars, defaults); minimize or bury the rest. Focus design, testing, and optimization there — beyond it, returns diminish.

### Five Hat Racks (LATCH)
There are five ways to organize information: **Location, Alphabet, Time, Category, Hierarchy** (continuum/magnitude) — the acronym **LATCH**. Category = similarity; Time = sequence/procedure; Location = spatial/wayfinding; Alphabet = reference/lookup; Continuum = ranked (best–worst). **Apply:** Choose the scheme by user need — category for clusters, time for procedures, location for maps, alphabet for lookup, continuum for ranked results/ratings. Offer multiple sorts when different needs coexist.

### Form Follows Function
Beauty results from purity of function. Read it **descriptively** (well-functioning things tend to look good) rather than **prescriptively** (never trade function for looks as an absolute rule). **Apply:** Use it as an aesthetic compass; ask "what's critical to success?" not "what must be sacrificed to function?"

### Ockham's Razor
Among functionally equivalent designs, choose the simplest; unnecessary elements reduce efficiency and increase failure odds. **Apply:** Among displays with equal information content, pick the one with the fewest visual elements. Remove every element you can without hurting function, then minimize the expression of what remains — "make all visual distinctions as subtle as possible, but still clear and effective" (Tufte). (Google's spartan page beat cluttered rivals.)

### Aesthetic-Usability Effect
Attractive designs are *perceived* as easier to use, whether or not they are — and this bias forms early, resists change, and makes users more tolerant of flaws. **Apply:** Always invest in aesthetics, especially first impressions; they foster acceptance, forgiveness of problems, and even better creative problem-solving by users. Early impressions bias long-term attitudes.

### Defaults
A setting or value applied automatically; the single most powerful nudge because people rarely change them. **Apply:** Set every default to the option that does the most good for the most users (opt-out enrollment, sensible pre-fills). Defaults teach expected behavior and cut kinematic load — treat them as a primary design decision, not an afterthought.

### Iconic Representation
Pictorial images that improve recognition/recall of signs and controls. Four types by abstraction: **Similar** (visually analogous — simple concepts only), **Example** (an associated thing — best for complex concepts; airplane = airport), **Symbolic** (established object — padlock = lock), **Arbitrary** (purely learned — radiation trefoil; for long-lived standards). **Apply:** Choose icon type by concept complexity; icons should generally be **labeled** and share a common visual motif (style/color). Reduces performance load and crosses languages. See [typography.md](typography.md) for label pairing.

### Comparison
Showing relationships by presenting two or more variables in a controlled way. Three techniques: **Apples to Apples** (common measures/units), **Single Context** (one view — small multiples, multivariate displays), **Benchmarks** (anchor with reference data). **Apply:** In dashboards, use common units, combine variables into a single context (small multiples), and always give a benchmark — prior period, goal, competitor, or industry norm.

### Redundancy
Using more elements than strictly necessary so performance survives a failure. Four kinds: **diverse** (different types — resists single-cause failure), **homogenous** (same type — simple but single-cause-vulnerable), **active** (always applied), **passive** (applied on failure — spare tire). **Apply:** In UI this underwrites **redundant coding** — never encode meaning in one channel alone (pair color with icon/text/position) for accessibility and error resistance. Use diverse redundancy when failure causes are unknown.

### Rule of Thirds
Divide the frame into thirds horizontally and vertically (a 3×3 grid, 4 intersections) and place the primary element on an intersection. The 2/3 line ≈ 0.666, a rough nod to the golden ratio (0.618); asymmetry reads as interesting. **Apply:** Position focal elements on intersections, add a counterpoint on the opposing intersection for balance, and align strong verticals/horizontals to the grid lines. Center instead when the primary element is strong enough that off-center would unbalance it.

### Golden Ratio / Fibonacci
A within-form ratio ≈ **0.618** (Phi = 1.618); adjacent Fibonacci numbers (1,1,2,3,5,8,13…) approximate it. **Skepticism warranted:** the digest treats these as aesthetic *options*, not laws — explore them only when they don't compromise other objectives, and **never contrive geometry to force them**. **Apply:** Consider Phi/Fibonacci for spacing scales, proportions, or rhythm if it falls out naturally; don't retrofit a layout to hit the number.

---

## Fast lookup

| Principle | One-line rule |
|---|---|
| Proximity | Closer = more related; gap size encodes grouping (beats similarity). |
| Similarity | Color > size > shape for grouping; never color alone. |
| Closure | Viewers complete simple shapes — omit lines they can supply. |
| Continuity | Align related items on a line/curve; avoid jagged endpoints. |
| Common Fate | Move related elements together to group them. |
| Figure-Ground | Keep figure unambiguous; lower-region items read as figure. |
| Uniform Connectedness | Common regions / connecting lines beat proximity and similarity. |
| Good Form (Prägnanz) | Fewest, simplest elements are read and recalled best. |
| Signal-to-Noise | Max signal, min noise; lighten or delete chrome and gridlines. |
| Highlighting | Highlight ≤10%; prefer bold; blink only for emergencies. |
| von Restorff | Make the key element distinct — but sparingly. |
| Visibility | Show status, actions, consequences; balance with context sensitivity. |
| Layering | One layer at a time (2D) or opaque/transparent overlays (3D). |
| Hierarchy | Trees / nests / collapsible stairs by complexity. |
| Contrast | Text contrast > 70%; depth rises with light/dark contrast. |
| Alignment | Snap to a grid; use area alignment for irregular items; diagonals ≥30°. |
| Framing | Positive frame → action; negative frame → inaction; don't conflict. |
| Chunking / 7±2 | Hold ~4±1 chunks; chunk memory tasks, not scan lists. |
| Performance Load | Cut cognitive and kinematic effort (noise, steps, travel). |
| Progressive Disclosure | Default to common controls; hide the rest behind More/Advanced. |
| Recognition over Recall | Show options; don't make users remember. |
| Mental Model | Design to users' interaction model; observe them in the field. |
| Mapping | Control layout/behavior should mirror its effect. |
| Hick's Law | RT = a + b·log₂(n), b≈0.155s; simple decisions only. |
| Fitts's Law | MT = a + b·log₂(d/s+1); big/near targets, edges & corners. |
| Serial Position | Important items first or last, never mid-list; recency fades ~30s. |
| Priming | Context primes behavior; keep primes subtle and goal-consistent. |
| Affordance | Controls should look like what they do; negatively afford misuse. |
| Constraint | Limit actions physically/psychologically; disable dead ends. |
| Feedback | Acknowledge every action immediately. |
| Forgiveness | Undo & reversibility first; help ∝ 1/design quality. |
| Confirmation | Only for critical/irreversible; state the consequence, not "OK". |
| Errors | Slips = action, mistakes = intention; design out both, add forgiveness. |
| Flexibility-Usability | Specialize for known needs, stay flexible for unknown ones. |
| Consistency | Reuse conventions (aesthetic/functional/internal/external); clarity wins. |
| Mimicry / Metaphor | Surface for usability, behavioral cautiously; always test. |
| Nudge | Steer via defaults, feedback, structured choices, visible goals. |
| Desire Line | Instrument real usage; pave the cow paths. |
| 80/20 | Surface the critical ~20% of features; bury the rest. |
| Five Hat Racks (LATCH) | Organize by Location, Alphabet, Time, Category, Hierarchy. |
| Form Follows Function | Descriptive guide, not a prescriptive rule. |
| Ockham's Razor | Fewest elements among functionally equal designs. |
| Aesthetic-Usability | Attractive = perceived usable; invest in first impressions. |
| Defaults | Set to the most broadly beneficial option — the strongest nudge. |
| Iconic Representation | Pick icon type by complexity; label and unify style. |
| Comparison | Common units, single context (small multiples), benchmarks. |
| Redundancy | Redundant-code meaning across channels; never one channel. |
| Rule of Thirds | Focal point on an intersection; counterpoint opposite. |
| Golden Ratio / Fibonacci | Optional aesthetic aid; never contrive geometry to force it. |
