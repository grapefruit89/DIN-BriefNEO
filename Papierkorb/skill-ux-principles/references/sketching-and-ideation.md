# Sketching & Ideation — getting the right design

Source: Buxton, Greenberg, Carpendale & Marquardt, *Sketching User Experiences: The Workbook* (2011), the practical companion to Buxton's *Sketching User Experiences: Getting the Design Right and the Right Design*.

## When to apply this

Use this at the **front of any UI work** — when the problem is still open and no single direction has been committed to. It governs how you *explore and communicate alternatives* before you build. Pair with [goal-directed-design.md](goal-directed-design.md) (whose design you serve) and [interaction-design-process.md](interaction-design-process.md) (where in the process you are).

---

## The mindset

### Getting the RIGHT design vs getting the design RIGHT

Two distinct activities, and the order matters:

- **Getting the design right** = take one idea (usually your first) and iteratively evolve it toward its best version. Buxton pictures a 3D hill: you climb toward the peak, the optimal version *of that one idea*. This is how most engineers and developers are trained, and it is a trap — you only ever get as good as the single idea you started from. Computer scientists call it **local hill climbing**: the local maximum sits far below the global maximum. (Phones evolved keyboard+screen for years; a *different* idea — full touch display, no keyboard — opened a whole new market.)
- **Getting the RIGHT design** = generate MANY meaningfully different ideas, reflect on them, then choose and develop the most promising. This is the creative, design-choosing act, and it must happen **before** you commit to refinement.
- **Two creativity points:** (1) creativity in *enumerating* meaningfully distinct options; (2) creativity in *defining the criteria/heuristics* you use to choose between them.

**Apply (as an AI):** Never open with a single implementation. First get the *right* design: produce **2–3 labeled, meaningfully different directions** and name the criteria you'll judge them by. Treat your first idea as one option among several, not the answer.

### A SKETCH is not a PROTOTYPE

The whole method rests on the difference. A **sketch** has these properties:

- **quick** — made in seconds/minutes, not hours
- **timely** — available the moment it's needed
- **inexpensive** — cheap to make, cheap to throw away
- **disposable** — the investment is in the idea, not the artifact; you discard the sketch freely
- **plentiful** — they come in numbers; no single one carries the whole bet
- **clear vocabulary** — rough, gestural style *signals* "this is a sketch, not a finished thing"
- **distinct gesture** — freehand, open marks that read as exploratory
- **minimal detail** — only what's needed to carry the idea; everything incidental left out
- **appropriate degree of refinement** — fidelity matches how far you've converged, no more
- **suggestive and ambiguous** — leaves "white space" for the viewer's imagination

The load-bearing distinction: **a sketch invites suggestion; a prototype invites confirmation.** A rough sketch says "what else could this be?" A polished mockup says "is this right — yes or no?" Polish arrives *late*, after you've converged. Polishing early wastes time and forces premature commitment to incidental details (text size, alignment, color, exact layout) that have nothing to do with the core idea and actively interfere with judging it. The recurring refrain: **"Remember the role of your sketch."**

**Apply (as an AI):** Keep early options in the register of a *sketch* — ASCII wireframes, labeled bullet flows, prose walkthroughs. Explicitly mark them as **rough alternatives, not proposals to approve**. Do not write production CSS, pick final color values, or pixel-align anything while the direction is still open — that is prototype-register work and it shuts down suggestion. Save fidelity for after a direction is chosen.

### The Design Funnel

Ideation is **elaboration then reduction** (Laseau): *elaboration* generates solutions (the opportunities); *reduction* decides which are worth pursuing. In Buxton's **Design Funnel** (Pugh), generation and convergence **alternate**, gradually narrowing to a final concept:

- Each stage is iterative — you constantly generate AND reduce until it resolves.
- **Granularity gets finer as you descend:** early stages explore radically different coarse concepts; later stages explore variations; latest stages explore fine detail.
- **New radical ideas can enter at any time** and should be incorporated, even late.

You **generate AND discard many ideas** on purpose. The discards aren't waste — they're how you find the global maximum instead of the nearest local one, and they define the criteria that let you defend the survivor.

**Apply (as an AI):** Match your fidelity to funnel stage. Early: several coarse, distinct concepts described briefly. Middle: variations on the survivors. Late: one direction detailed out. Announce which stage you're in so the reviewer knows whether to critique *direction* or *detail*. Let a strong new idea displace an earlier front-runner even after you've narrowed.

---

## Methods

Each method below is translated for an agent that **cannot literally draw** — so the medium becomes ASCII wireframes, labeled textual flows, annotated option lists, and quick artifacts.

### 10 Plus 10

- **What:** The core funnel exercise: generate **10 different ideas**, then **10 refinements/variations** of a chosen one. Breadth first, then depth.
- **How:**
  1. State the design challenge (a problem, a client need, or a chance to exploit a new capability).
  2. Generate **10+ genuinely different concepts** — diverse, crude, annotated. **Do not judge merit yet.** Speed and quantity over quality.
  3. Reduce — discard low-merit concepts; show and explain the rest to others. Loop back to step 1 as needed.
  4. Choose the most promising concept(s), gauged by your own excitement and others' reactions.
  5. Produce **10 details and/or variations** of that concept — different realizations first, then deeper detail.
  6. Present the best to a group and **solicit feedback** — at this early stage the best feedback is *suggested redesigns*.
  7. As ideas change, keep sketching.
- **When:** At the very start, and any time you feel locked onto a first idea. Deliberately pick challenges with *no existing solution* — existing solutions limit how you think.
- **Principle:** Forces breadth before depth. Detail-level exploration (step 5) routinely reveals that an idea which looked fine as a single frame doesn't fit smoothly into an interaction *sequence*.
- **Apply (as an AI):** You needn't literally list 10, but internally enumerate far more than you'll present, then surface the **2–3 most distinct** with one-line rationales. When the user picks one, generate several *variations* of it (layout A/B/C, or interaction pattern A/B) before detailing. Restate the user's frustration as an explicit design challenge first.

### The sketchbook habit / collecting references

- **What:** The carried-everywhere habit of recording, developing, and archiving ideas — the most prevalent best practice across design disciplines. Alongside it: continually **sampling and collecting** existing designs (photos of things that irritate/inspire/intrigue you, clippings, screen-grabs) as ideation fuel. Collect what you *like AND dislike*.
- **How:** Capture constantly; annotate every capture (source/credit, date, what you like or dislike); never erase rejected ideas — the record is of *all* developing ideas. The value comes from frequent **access and review**, not mere collection. You become a better designer by becoming a better **critic** of good and bad design in the world.
- **When:** Always, as background practice; especially when starting in an unfamiliar domain.
- **Principle:** Sampling is *practicing noticing*; both positive and negative examples are useful.
- **Apply (as an AI):** Before proposing, **actively survey prior art** — cite comparable patterns/products the user likely knows ("like Gmail's split view", "like the iOS share sheet"), including anti-patterns to avoid, and say *why* each is relevant. Reuse and remix established conventions rather than inventing from zero. Keep a short running list of the references informing your direction so the user can react to the sources, not just the result.

### Vanilla + annotated sketches

- **What:** The anatomy of a single sketch: a **drawing**, plus optional **annotations**, **arrows**, and **notes**. Sketches are more than drawings.
  - **Annotations** — labels/explanatory text whose *spatial location* ties them to a part of the drawing (proximity, arrows, lines, braces). Point to elements, explain caricatures, indicate dynamics.
  - **Arrows** (a special annotation) — point to areas, relate parts, indicate direction/movement, show sequence and flow.
  - **Notes** — text whose location does *not* matter: ideas not drawn, alternates, open questions, issue lists.
- **How:** Balance visual and textual. If you lean all-visual or all-text, deliberately add the other.
- **Principle:** The label and the arrow carry as much of the idea as the picture.
- **Apply (as an AI):** Your ASCII wireframe is the "drawing." Attach **inline annotations** (labels next to regions), **arrows/flow markers** for movement and sequence, and a **notes block** underneath for alternatives, open questions, and things you couldn't render. Example:

  ```
  +----------------------------------+
  | [logo]      Search...     [user] |  <- global nav, sticky
  +----------------------------------+
  | Filters |  Results grid          |
  |  [ ] A  |  [card][card][card]    |  --> click card = detail drawer
  |  [ ] B  |  [card][card][card]    |
  +----------------------------------+
  Notes: alt = filters as top bar on mobile.
         Open Q: infinite scroll vs pagination?
  ```

### Storyboards (sequential / state-transition / narrative / branching)

Storyboards capture interaction **over time** — the temporal dimension a single frame can't show. Four forms:

- **Sequential storyboard** — an ordered series of frames, each a moment/interface **state**; the *space between frames* holds the transitions (usually user actions), left partly to imagination. The real work is **decisions**: which **key frames** capture the essence (don't record every keypress — pick representative states), which **key transitions** to show vs leave implied, whether to show the user (e.g. a finger indicating what triggered each step). **Annotate the transitions** so an unfamiliar viewer can follow what the user did.
- **State-transition diagram** — formalizes the storyboard as **states** connected by **transitions** (triggered by user actions), including decision paths. Five styles: **Abstract** (text labels per state — good early, before committing to visuals); **Visual Interface** (sketch the actual UI per state — rich but harder to change); **Annotated** (either, plus explanatory text); **Indexed** (an abstract diagram whose states *point to* other figures/screens/sub-diagrams — essential for managing complexity); **Implied by layout** (spatial arrangement shows flow, no arrows). Even a simple digital watch has thousands of states — **don't diagram everything**; capture a limited set of key sequences.
- **Narrative storyboard** — tells the fuller story *in context*: location, people as personalities, surrounding actions — complementing the on-screen storyboard. Structure: first frame = **establishing shot** (set the scene), middle frames build to a **climax** (the solution), last frame concludes. Vary "camera shots" (wide/context, over-the-shoulder, first-person/POV, close-up/detail) to suit each beat.
- **Branching storyboard** — a state-transition diagram showing **decision paths**: each state can transition to multiple others based on user choice. Build progressively (abstract map → one state's visuals + its exits → expand one index). Cover the awkward paths too: modifying/removing items, comparison without commitment, and *cancelling/walking away*.
- **When:** Any time behavior unfolds across steps: multi-step forms, wizards, flows with branches, empty/loading/error/success states.
- **Principle:** The core skill is choosing **key frames** and judging what white space the viewer can fill in; annotating transitions covers the gaps.
- **Apply (as an AI):** Represent flows as a **numbered state list or arrow chain**, one state per line, with the *triggering action* labeled on each transition:

  ```
  [1 Empty form] --user fills email--> [2 Valid, submit enabled]
  [2] --click Submit--> [3 Loading spinner] --200--> [4 Success toast]
                                          \--4xx--> [5 Inline error, field highlighted]
  ```
  Start **abstract** (text states) when direction is open; move to **visual** (an ASCII frame per state) once chosen. Explicitly enumerate error/empty/loading/cancel branches — those are the states most often forgotten.

### Wizard of Oz

- **What:** A human "Wizard" acts as the system back-end — interpreting input and triggering responses — so a sketch with **no real back-end** can be *experienced*. Needed when (1) input is hard to interpret (gestures, speech, free text, natural language) or (2) responses can't be pre-scripted.
- **How:** The Wizard fakes the system's responses live. **The chief danger is superhuman comprehension.** Constrain (1) the Wizard's *understanding* to a limited input model a real system could parse, and (2) the Wizard's *response* to an explicit ruleset a real system could implement. Playing the Wizard also *trains the designer* — being personally responsible for the user's confusion motivates revision and exposes the design's ill-defined parts.
- **When:** Validating flows that depend on interpretation or a back-end you haven't built — search, NL input, recommendations, "smart" behavior.
- **Principle:** Be the back-end, but only do what the real system could actually do.
- **Apply (as an AI):** You are a natural Wizard. **Simulate the interface in the conversation** — the user "types" an input, you role-play exactly the screen/response the design would produce, including realistic *failure* responses. Crucially, **constrain yourself to what a real, implementable system could do** — don't let your own comprehension paper over ambiguity the real product couldn't handle. Surfacing where you'd have to "cheat" reveals an under-specified part of the design.

### Paper / lo-fi prototyping

- **What:** Assemble interface elements from cheap, editable physical pieces — sticky notes as buttons/dialogs/menus/fields on a board (PICTIVE; Rettig's *Prototyping for Tiny Fingers*; Muller's "plastic" sketches). Flexibility of digital tools while staying disposable.
- **How:** Each element lives on its own sticky so it can be peeled, rewritten, moved, or swapped. "Play out" a sequence by swapping stickies and updating feedback. **No special training needed** → everyone can compose, explore, and change; you can *merge the best parts of competing designs* by moving pieces.
- **When:** Early structural exploration where layout and element placement are in flux and you want cheap rearrangement.
- **Principle:** Making each element independently editable makes the whole interface cheap to restructure and collaborative.
- **Apply (as an AI):** Treat each UI region as an **independently swappable block** in your ASCII wireframe. Offer the user a quick "menu" of interchangeable parts ("nav: top-bar | sidebar | hamburger"; "primary action: FAB | header button | inline") so they can recombine directions with you, cheaply, before anything is coded. Keep every block disposable — restructuring should cost a sentence, not a rewrite.

### Think-aloud testing

- **What:** Have people **say what they're thinking** as they use your sketch to do a real task — the most frequently used evaluation method among UX professionals; cheap, fast, information-rich. Far better than passive observation. Related: **Uncovering the initial mental model** — ask a user to explain *every visual element* on the screen; wherever their explanation differs from your intent, you've found a cheap, early problem.
- **How:** (1) Set a focused objective (what you are and aren't testing). (2) Design *real* tasks users would actually do; write them as short instructions. (3) Make the sketch interactive enough (scripted walkthrough, branching storyboard, or Wizard of Oz) — it needn't cover everything. (4) Make clear you're testing the **product, not the person**; listen for expectations, intentions, and problem-solving strategies. When introducing the system, give just enough context to set the frame of mind — **don't reveal how it operates**, or you taint the model.
- **When:** As soon as you have any experienceable sketch — catching conceptual problems this early yields large savings.
- **Principle:** Mismatches between the user's mental model and your intended model are cheap to find early and expensive to find late.
- **Apply (as an AI):** You can't run a live study, but you can **simulate a first-time user's read**: walk the design element by element and narrate what a naive user would *expect* each label/control/icon to mean, then flag every spot where that guess would diverge from intent (ambiguous labels, unclear affordances, hidden state). Present these as predicted friction points to fix. Better still, prompt the user to try a concrete task against your wireframe and tell you where they hesitate.

### Sketchboards & the review/critique forms

- **What:** Arrange a project's sketches together to view, discuss, review, and generate ideas with others. Sketches are **conversational props** for gathering constructive criticism. The critic's role is to push you to *reconsider* so you don't lock onto one idea (counter to the funnel). **Restructuring and categorizing** the collection into thematic clusters itself yields insight.
- **The reviewer's loop:** (1) present so critics grasp the key points; (2) critics summarize your idea back (checks understanding), state strengths and weaknesses, offer alternatives, challenge you; (3) you **gather and record** the feedback (else it's wasted); (4) reflect and re-evaluate — **don't be defensive**; evaluate each point objectively.
- **Four review forms (informal → formal):**
  - **Elevator pitch** (30s–2min) — **know your message**: distill the idea *including the problem* into ~30 seconds and build everything around it.
  - **Desktop review** — always be ready to show in-progress work to whoever's nearby; keep the last completed version available (better than showing nothing).
  - **The meeting** — a session you arrange; **train non-designer attendees** to give useful critique (you want exposed weaknesses and alternatives, not just praise); go round-robin alternating likes vs improvements; **accept criticism** — listen and record, don't defend while receiving.
  - **The formal review / "the Crit"** — scheduled checkpoint or final delivery; plan, structure, rehearse; make the audience understand the problem, why it matters, and your solution.
- **Principle:** Continual feedback at every stage is core to interaction design; match the review form to the moment.
- **Apply (as an AI):** **Present alternatives side by side** so the user can compare and cluster, not just approve one. For each option give the **elevator pitch** (problem + idea in one or two lines) plus its strengths and weaknesses — *including your own critique of your favorite*. Invite redesign, not just yes/no. When the user pushes back, **record the point and revise**; don't defend the artifact. Explicitly ask for the kind of feedback the stage needs (direction vs detail).

### Animatics / video sketch (time-based behavior)

- **What:** For behavior that unfolds **continuously in the same location over time** — animation, transitions, motion — rather than spread across storyboard frames. Built from slideware animation (motion paths), branching hyperlinked slides, keyframes+tweening, or a paper-and-camera "linear video."
- **How:** The key technical constraint is **registration** — static elements (frame, title, fixed content) must sit in *identical* positions across frames, or they jump and break the illusion; templates enforce this. **Motion paths** smoothly move one object (e.g. a cursor) between frames so it reads as "watching someone use it." **Branching animations** hyperlink regions to other states so different paths can be taken at runtime. Nielsen's **horizontal vs vertical prototyping**: instrument only key paths — go **broad** (many features, shallow — the look-and-feel) and/or **deep** (one feature, full functionality). A single scripted path = a **scenario**.
- **When:** When the *behavior over time* is the design — transitions, loading/progress, drag interactions, reveal/collapse, gesture responses.
- **Principle:** Registration + smooth motion create the "watching a movie of real use" feeling. But **"don't get caught up"** making lovely animations instead of developing ideas — remember the role of your sketch.
- **Apply (as an AI):** Describe time-based behavior as a **beat-by-beat script** with timing and easing, not a static image: "0ms panel off-screen right → 200ms slides in (ease-out) → cursor moves to close (X) → click → 150ms fade out." Enumerate the *states between* states (enter/active/exit, hover/pressed/disabled). Go **horizontal** (sketch many transitions shallowly to convey feel) or **vertical** (one interaction fully specified) depending on what's being decided. Don't over-specify motion detail while the underlying flow is still open.

---

## Choosing a method

Pick by **funnel stage**, **fidelity**, and **temporal scope** — plus the recognition that critique itself is a discovery tool.

- **Fidelity tracks the funnel.** Keep it quick, rough, and ambiguous *early* (to stay open and cheap to change); raise fidelity *only* as you converge. Polishing too soon wastes effort and forces premature commitment to incidental detail. For an AI: early = labeled prose options + abstract flows; middle = ASCII wireframes + variations; late = one detailed direction, then implementation.
- **Temporal scope decides the form:**
  - **Static / single moment** → vanilla + annotated sketch (one ASCII wireframe with labels, arrows, notes).
  - **Snapshots over time** → storyboards: sequential, state-transition, branching, narrative (numbered state chains, one frame per key state).
  - **Continuous behavior over time** → animatic / video sketch (beat-by-beat motion script, enter/exit states, easing/timing).
  - **Evaluating with people** → uncover-the-mental-model, Wizard of Oz, think-aloud (simulate a naive user's read; role-play the back-end within real constraints).
  - **Sharing / deciding** → sketchboards + the review forms (present alternatives side by side; pitch each; invite redesign).
- **Medium trade-offs (translated):** the fastest, cheapest, most open medium wins early. For an AI, *text and ASCII are your paper* — fastest to produce, cheapest to discard, best for putting several options in front of the user at once. Reserve real code/CSS (your "digital" medium — powerful but slow, over-polished, and hard to walk back) for after a direction is chosen.
- **Critique as discovery.** The review isn't approval-seeking; it's how you *find* the design. Observe honestly what a sketch actually communicates (vs what you intended), separate your ownership from the artifact, and elicit + record feedback without defending. For an AI: always offer more than one option so there's something to compare against, critique your own favorite, and revise on pushback rather than justify.

---

## Checklist — are you exploring enough before committing?

- [ ] Did I generate the **right design** (several distinct ideas) before trying to get *a* design right?
- [ ] Did I put **2–3 meaningfully different, labeled alternatives** in front of the user — not one implementation?
- [ ] Are my early artifacts in **sketch register** — rough, cheap, disposable ASCII/prose — not polished mockups that invite yes/no confirmation?
- [ ] Did I **name the criteria** I'm using to choose between options?
- [ ] Is my **fidelity matched to funnel stage** (abstract early, detailed only after converging)?
- [ ] Did I **annotate** — labels, flow arrows, and a notes block for alternatives and open questions?
- [ ] For anything unfolding over time, did I **storyboard the states**, including error / empty / loading / cancel / back paths?
- [ ] For time-based behavior, did I script the **beats and in-between states**, not just endpoints?
- [ ] Did I **sample prior art / conventions** and reuse them instead of inventing from zero?
- [ ] Did I **simulate a first-time user's read** (mental-model / think-aloud) and flag predicted friction?
- [ ] Where I faked back-end behavior, did I stay within **what a real system could actually do** (Wizard of Oz constraint)?
- [ ] Did I **invite redesign and critique** — including critiquing my own favorite — and record + act on feedback rather than defend?
- [ ] Am I holding off on production code/CSS until a **direction is actually chosen**?
- [ ] Am I ready to **discard** ideas — including my first — and let a strong new one enter late?
