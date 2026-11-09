# The Design of Everyday Things — Norman's foundations

Source: Don Norman, *The Design of Everyday Things*, Revised & Expanded Edition (Basic Books, 2013).

**When to apply this.** Load this when designing, building, or reviewing any interface, control, flow, or error path. It supplies Norman's exact vocabulary and the reasoning behind it — use it to diagnose *why* something is hard to use and to justify a fix, not just to assert one. Siblings: [usability-heuristics.md](usability-heuristics.md), [design-principles.md](design-principles.md).

The two characteristics of good design Norman cares about most: **discoverability** (can you figure out what actions are possible, and where/how to do them?) and **understanding** (what does it all mean, how is it meant to be used?).

---

## Affordances vs Signifiers

**Affordance** = a *relationship* between an object's properties and an agent's capabilities that determines how the object *could* be used. "A chair affords sitting." It is **not a property** — it depends jointly on object and agent, and it exists whether or not it is visible. (From perceptual psychologist J. J. Gibson.) **Anti-affordance** = the prevention of an interaction (glass blocks passage). Both affordances and anti-affordances only work if they are **perceivable** — otherwise people walk into glass doors.

**Signifier** = "any mark or sound, any perceivable indicator that communicates appropriate behavior to a person." Signifiers tell you *where* the action goes and *how* to do it. They can be **deliberate** (a "PUSH" plate) or **accidental** (a worn path; a physical book's thickness signaling how much remains — an e-reader must signal this deliberately).

**How Norman revised his own idea:** the 1988 edition told designers to build "affordances," and the field misused the word — e.g. calling a circle-showing-where-to-tap an "affordance." Norman's correction: the affordance of touching exists across the *entire* screen; the circle is a **signifier** of where to touch. **"Affordances determine what actions are possible. Signifiers communicate where the action should take place. We need both."** For designers, **signifiers are more important than affordances** — they carry the communication.

Diagnostic: **hand-lettered "push/pull" signs taped to a door mean the design already failed** — a door simple enough to need the sign is a design failure.

**Apply:** Don't say "I added an affordance" for a visual hint — it's a signifier; name it right. Make the *actionable* region visibly distinct (a button that looks pressable), and add explicit signifiers (labels, icons, cursor/hover states, focus rings) for where and how to act. If your UI needs a tooltip or helper text just to be operable, treat that as a redesign signal, not a fix.

---

## Mapping

**Mapping** = the relationship between two sets of elements — e.g. controls → the things they control. **Natural mapping** exploits **spatial analogies** (and cultural/biological conventions like up = more) so the relationship is understood immediately. To move an object up, move its control up.

**The stove-burner example (canonical):** 4 burners in a 2-D rectangle, 4 controls in a 1-D row → 4 possible mappings, all sold commercially, distinguishable only by labels. Fixes that need **no labels**: arrange the controls in the same 2-D rectangle as the burners, or stagger the burners so they line up left-to-right with the row of controls.

**Three levels of natural mapping, best to worst:**
1. Control mounted **directly on** the item it controls.
2. Control **as close as possible** to the item.
3. Controls arranged in the **same spatial layout** as the items.

The **Mercedes-Benz seat control shaped like the seat** (lift the front to raise the seat's front) is Norman's model of natural mapping. Gesture faucets/dispensers may map correctly but **lack signifiers**, so they lack discoverability — you wave and nothing happens.

**Apply:** Lay controls out to mirror what they affect (toolbar order matching on-screen regions; a settings panel ordered like the thing it configures). When you can't map naturally and vendors can't agree, **"if all else fails, standardize"** — a learned-once convention beats a fresh guess every time.

---

## Feedback

**Feedback** = communicating the result of an action (from control/information theory). Requirements:

- **Immediate** — even a 0.1-second delay is disconcerting; long delays make people give up (or repeat the action).
- **Informative** — a generic beep says *something* happened, not *what*. "Poor feedback can be worse than no feedback at all."
- **Not excessive** — too much feedback (the "backseat driver") is worse than too little; flooded alarms get ignored or disabled, so critical signals are missed.
- **Prioritized** — unimportant info stays unobtrusive; important signals grab attention.

Cost-cutting — one light or sound overloaded with many meanings via flash/beep patterns — is a primary cause of bad feedback.

**Repeating a failed action:** with no feedback people assume the action didn't register and repeat it harder — deadly with inward-opening doors in a fire (hence outward-opening doors with panic bars).

**Apply:** Acknowledge every action within ~0.1s (even just a state change). Show progress bars/estimates for anything slower, and **underpredict** — quote the slower time so reality beats expectation. Make each signal say what happened, rank signals by importance, and never let one indicator carry many overloaded meanings.

---

## Conceptual Models & the System Image

**Conceptual model** = "an explanation, usually highly simplified, of how something works. It doesn't have to be complete or even accurate as long as it is useful." (Files/folders/icons — there are no real folders inside a computer.) A good model lets people **predict the effects of their actions** and recover when things go wrong. **Mental model** = the conceptual model as it lives in a user's head.

**The refrigerator (classic bad model):** two compartments, two controls labeled "freezer" and "refrigerator." The labels imply each control independently sets its compartment (Model A — **wrong**). Reality: one thermostat + one cooling unit; one control sets the thermostat, the other sets the *proportion* of cold air routed to each compartment (Model B) — plus a 24-hour feedback delay. The controls projected a **false system image**, making correct adjustment nearly impossible.

**System image** = everything the user can perceive of the product — form, controls, signifiers, docs, marketing, website. The designer can't talk to the user, so **the entire burden of communication is on the system image**. If it's incoherent or contradictory, the user builds a wrong model. "Good conceptual models are the key to understandable, enjoyable products; good communication is the key to good conceptual models."

**Apply:** Decide the model you want users to hold, then make the whole system image project it — labels, layout, empty states, docs, and error copy all telling the same story. Watch for controls whose labels imply a model the system doesn't actually implement (the refrigerator trap). **Skeuomorphic** hints (trash can, folders) are legitimate: "existing conceptual models need only be modified rather than replaced."

---

## The Two Gulfs

- **Gulf of Execution** — the gap when figuring out *how to operate* something. Bridged with **feedforward**: signifiers, constraints, mappings, and a conceptual model.
- **Gulf of Evaluation** — the gap when figuring out *what happened / what state it's in* and whether the goal was met. Bridged with **feedback** and a conceptual model.

People who can't bridge a gulf usually **blame themselves** ("I'm bad at this") — wrongly. The designer's job is to bridge both.

**Apply:** For every interaction ask both: "Can the user tell what to do?" (execution) and "Can the user tell what happened?" (evaluation). A missing empty-state/onboarding is an execution-gulf failure; a silent success or an ambiguous result is an evaluation-gulf failure.

---

## The Seven Stages of Action

One goal, three **execution** stages, three **evaluation** stages:

1. **Goal** — form the goal
2. **Plan** — the action
3. **Specify** — an action sequence
4. **Perform** — the action sequence
5. **Perceive** — the state of the world
6. **Interpret** — the perception
7. **Compare** — the outcome with the goal

Stages 2–4 are execution; 5–7 are evaluation. For overlearned/skilled actions most stages are subconscious; conscious attention appears only for novel situations, impasses, or when things go wrong. Behavior can be **goal-driven (top-down)** or **event/data-driven (bottom-up)**.

Use the stages to find the *real* goal via "Why?": Levitt said people don't want a quarter-inch drill, they want a quarter-inch hole — Norman adds they don't want the hole either, they want bookshelves up. **Solve the root goal to enable radical innovation.**

**Apply:** Walk a task through all seven stages to locate the friction point. Each stage is a question your design must answer (below) — a broken stage is a specific, nameable defect, not vague "bad UX."

---

## The Seven Fundamental Principles of Design

Each of the seven stages poses a design question:
1. What do I want to accomplish? 2. What are the alternative actions? 3. What can I do now? 4. How do I do it? 5. What happened? 6. What does it mean? 7. Is this okay / did I reach my goal?

The **seven principles** that answer them:

| # | Principle | What it guarantees |
|---|---|---|
| 1 | **Discoverability** | You can determine what actions are possible and the current state |
| 2 | **Feedback** | Full, continuous information about results and current state |
| 3 | **Conceptual model** | The design projects the info needed to build a good model → control |
| 4 | **Affordances** | The needed actions are actually possible |
| 5 | **Signifiers** | Discoverability and well-communicated feedback |
| 6 | **Mappings** | Controls-to-effects follow good spatial/temporal mapping |
| 7 | **Constraints** | Physical, logical, semantic, cultural constraints guide and ease interpretation |

**Feedforward** answers the execution questions (signifiers + constraints + mappings + model); **feedback** answers the evaluation questions.

**Apply:** Use this table as a review rubric — score a screen or component against all seven and name which ones it fails.

---

## Knowledge in the Head vs Knowledge in the World

Precise behavior comes from *imprecise* knowledge because knowledge lives partly in the world (interpreted structure), only enough precision is needed to distinguish the right choice, and natural constraints + conventions narrow the options. The **Nickerson & Adams penny study**: most people can't pick the correct penny drawing, yet everyone uses money fine — we store only **partial descriptions**, just precise enough to discriminate among items we actually meet.

- **Declarative** (knowledge *of*: facts/rules — easy to write and teach, need not be true) vs **procedural** (knowledge *how*: skills — hard to verbalize, learned by practice, largely subconscious).
- **Short-term / working memory (STM)** is severely limited — traditionally cited as 5–7 items, but **practically treat it as 3–5**, and **fragile**: a distraction wipes it. Different **sensory modalities** (visual, auditory, haptic, spatial) interfere minimally with each other.
- **Long-term memory** is reconstructive, not a recording → distortion and **false memories**.

| In the World | In the Head |
|---|---|
| Available when perceivable; self-reminding | Available only if in working memory; else search/effort |
| Interpretation replaces learning | Requires learning |
| Slower (find & interpret) | Efficient once well-learned/automated |
| High ease at first encounter | Low ease at first encounter |
| Can look cluttered | Cleaner look, at cost of learnability |

**Reminding needs two parts: a signal and a message.** A string round your finger is signal-only; a note is message-only. Good reminders provide both, at the right time and place.

**Apply:** Never rely on the user retaining more than ~3–5 things across a step, and never across an interruption — keep needed info visible (menus, summaries, review screens before submit) rather than making people recall it. Don't clear a field's value from the screen the moment it's needed elsewhere. Offer power users head-based shortcuts *in addition to* the world-based path, not instead of it.

---

## The Four Kinds of Constraints

Demonstrated by the **Lego motorcycle** (15 pieces, assembled with no instructions) — four constraint classes combine and "seem to be universal":

- **Physical** — physical limits rule out wrong actions (a big peg won't fit a small hole; the windshield fits only one way). Best made **visible so the wrong action is ruled out before it's attempted**.
- **Cultural** — allowable actions for a social situation, held as **schemas / scripts / frames** (e.g. red = brake light, blue = police light). Cultural constraints can change over time.
- **Semantic** — rely on the *meaning* of the situation (the rider must face forward; the windshield goes in front because it protects the face).
- **Logical** — e.g. the last piece has only one place to go; a leftover part signals an error. **Natural mappings work by providing logical constraints.**

**Conventions are a form of cultural constraint** — violating them marks you as an outsider. A doorknob's graspability is a *perceived affordance*, but knowing it opens the door is a *learned convention*.

**Apply:** Prefer constraints that make wrong input impossible over validation that scolds after the fact (disable/hide invalid options; grey out until prerequisites are met). Layer all four: shape/layout (physical), familiar icons and color meanings (cultural), meaningful labels (semantic), and process-of-elimination flows (logical).

---

## Forcing Functions

**Forcing function** = a strong physical constraint where **failure at one stage prevents the next step**. Three safety-engineering forms:

- **Interlock** — forces operations into the correct **sequence** (microwave cuts power when the door opens; car requires brake-before-leaving-Park; dead-man's switch).
- **Lock-in** — keeps an operation **active**, preventing premature stopping (the "Do you want to save?" dialog on exit — Norman uses it deliberately as a save shortcut). Business lock-ins (proprietary ecosystems) are the abusive form — "everyone loses except the one dominant manufacturer."
- **Lockout** — prevents **entering a dangerous space** (the stairway gate at the ground floor so people fleeing a fire don't run into the basement; child-proof caps; the fire-extinguisher pin).

Forcing functions annoy in normal use, so people disable them — the clever designer **minimizes the nuisance while keeping the safety** (a gate that makes you notice but can't be propped open).

**Apply:** Reserve forcing functions for destructive/irreversible steps — require the brake (confirm a prerequisite) before Park (a dangerous state), block a "delete account" until the name is typed (lockout), keep unsaved-work guards (lock-in). Keep them light enough that users don't route around them.

---

## Slips vs Mistakes

**Error** = any deviation from appropriate behavior. Two fundamentally different kinds (Norman & Reason):

- **SLIP** — "the goal is correct, but the required actions are not done properly; the execution is flawed." You intend one thing and do another. **Slips hit experts more than novices** — experts act automatically and subconsciously, so the automatic machinery misfires; novices pay conscious attention so they slip less (but mistake more).
- **MISTAKE** — "the goal or plan is wrong." The action correctly executes a *wrong* plan. Mistakes come from conscious deliberation, so **novices make more mistakes**.

**On the seven stages:** mistakes originate in the top three stages (goal/plan/compare — higher cognition); slips in the bottom four (execution + perception/interpretation). Memory lapses hit the transitions — high-level → mistake, low-level → slip.

**Two classes of slips:**
- **Action-based** — the wrong action is performed (poured milk in coffee, then put the *cup* in the fridge).
- **Memory-lapse** — memory fails so the intended action is skipped (forgot to turn off the burner).

The four most design-relevant slips:

| Slip | Mechanism | Design cure |
|---|---|---|
| **Capture** | A more frequent/recent action with identical opening steps "captures" the intended one; expert-prone | **Avoid procedures that share opening steps then diverge** — make sequences differ from the very start |
| **Description-similarity** | Acting on an item similar to the target (vague internal description) | **Make controls/displays for different purposes significantly different** — cockpits shape-code throttle vs flap vs landing gear |
| **Memory-lapse** | A required step is skipped; hard to detect (nothing happens) | Minimize steps; vivid reminders; **forcing functions** (ATM returns the card *before* dispensing cash) |
| **Mode-error** | Same control means different things in different states; inevitable when actions outnumber controls | **Avoid modes**; if unavoidable make the active mode obvious (an Airbus mode confusion, −3.3° vs −3,300 ft/min, was fatal) |

**Three classes of mistakes** (Rasmussen's behavior levels: skill-based → mostly slips; rule-based; knowledge-based → mistakes):
- **Rule-based** — situation diagnosed correctly but the wrong rule chosen (or the rule itself is faulty).
- **Knowledge-based** — the problem is misdiagnosed from wrong/incomplete knowledge (Gimli Glider: fuel in pounds not kilograms). Best defended by a **good conceptual model** + decision support.
- **Memory-lapse** — forgetting a goal/plan/evaluation, often from interruption.

**Apply:** Design differently for the two. Against slips: make controls dissimilar and separated, kill modes (or flag the active one loudly), give perceptible feedback, and provide undo — don't demand constant vigilance, since subconscious skill is a strength. Against mistakes: project a strong conceptual model, run sensibility checks, and surface the object being acted on (a confirmation dialog catches a slip but rarely a mistake — you're *sure* about a mistake, so you click through).

---

## Don't Blame the User — Root Cause, Five Whys, Swiss Cheese

**75–95% of industrial accidents are blamed on "human error."** At that rate it isn't incompetence — it's a design problem. Norman's own conversion came from the **Three Mile Island** committee: a poorly designed control room made misdiagnosis inevitable, yet the verdict was "human error." **"If the system lets you make the error, it is badly designed. And if the system induces you to make the error, then it is really badly designed."** Call it **system error**, not human error.

- **Root cause analysis** — investigate to the underlying cause, but it's flawed when it *stops the moment a human is found*. "If a machine stops, we don't stop analyzing when we find a broken part" — we ask why it broke. Do the same for people.
- **Five Whys** (Sakichi Toyoda / Toyota) — keep asking "Why?" past the first answer to reach the true cause; the "five" just means *keep going*. It doesn't guarantee success (tends to stop early and seek a single cause).
- **Swiss-cheese model** (Reason) — accidents need **multiple** holes across multiple slices to line up. Two lessons: (1) don't hunt for "the" single cause; (2) build resilience by **adding slices (defense layers), shrinking holes (fewer error opportunities), and using different mechanisms in different subparts so holes don't align.**

Major error causes: unnatural task demands (sustained alertness, precision, multitasking), **interruptions**, and **time stress**. Distinguish deliberate **violations** (routine or situational rule-breaking) from the unintentional errors above.

**Apply:** In postmortems, ban "user error" as a root cause — keep asking why the design permitted it. When you find one bug, look for the other holes that had to align. Take user difficulties as **signifiers of where the product needs improvement**.

---

## Designing FOR Error

Treat a user's action as an **approximation** of what they want, the way you'd treat a slightly-off sentence in conversation — you clarify, you don't beep. What to do:

- **Make actions reversible (undo)** — "perhaps the most powerful tool to minimize the impact of errors"; support multiple levels; a trash folder is just deferred deletion. Make truly irreversible actions harder to do.
- **Sensibility checks** — verify the request is reasonable (flag a 1000× radiation dose, a transfer far larger than the user's normal amounts). "Intelligent systems would take note of the normal size of my transactions."
- **Confirmation is weak against mistakes** — you're certain, so you dismiss "Are you sure?". Instead make the **object being acted upon prominent** and make the operation reversible (secretly preserve work on "Don't Save").
- **Constraints & segregation** — separate easily-confused controls; segregate by shape/size/color; hide irrelevant controls.
- **Design for interruption and resuming** — the real cost of interruption is *resuming* (recovering goal, place, and system state); most systems discard what's needed to resume. **Multitasking degrades performance** (the FAA "sterile cockpit" rule bans non-essential talk during takeoff/landing).
- **Warnings are usually not the answer** — in emergencies uncoordinated alarms fire together; people disable them and forget to restore them.

**Apply:** Default to undo over confirmation. Reserve blocking dialogs for the irreversible, and even then show *what* is affected, not just a yes/no. Add server-side sensibility checks on high-stakes actions. Persist enough state that an interrupted user can resume exactly where they left off.

---

## Human-Centered Design & the Double-Diamond

**"Never solve the problem I am asked to solve"** — the stated problem is usually a symptom. "A brilliant solution to the wrong problem can be worse than no solution at all." Engineers/businesspeople are trained to solve problems; designers are trained to **discover the real problem** — diverge before converging.

**Double-diamond** (British Design Council, 2005): **first diamond = find the right problem** (diverge "discover" → converge "define"); **second diamond = find the right solution** (diverge "develop" → converge "deliver"). Loop back when convergence exposes a mis-framed problem. "Nothing like a firm deadline to get creative minds to converge."

**HCD process — four iterated activities (observe → ideate → prototype → test):**
1. **Observation** — **design research** via **applied ethnography**: watch would-be users in their **natural environment**. What matters most is the **activity**, not demographics. Design research (qualitative, deep, ~tens of people → what people *need/do*) complements market research (quantitative, large numbers → what people *will buy*) — "we need both."
2. **Ideation** — generate **many** ideas without early criticism or premature regard for constraints; **question everything** (naive questions often turn out profound).
3. **Prototyping** — quick mock-ups (sketches, cardboard, slides); **"Wizard of Oz"** = a hidden human simulates an unbuilt system.
4. **Testing** — small group matching the target; **Nielsen's "five users"** finds most problems — better to iterate test-of-five repeatedly than test many once. Testing **pairs** (one operates, one narrates) surfaces reasoning aloud.

**Iterate — "fail frequently, fail fast"** (Kelley, IDEO): failures are learning experiences. **"Requirements produced by asking people what they need are invariably wrong. Requirements are developed by watching people in their natural environment."** People describe everyday annoyances, not real needs, and deviate from their own descriptions — "most cases are 'special'"; a system that forbids special cases fails.

**Apply:** Before building, confirm you're solving the root problem (run a Five-Whys / first diamond). Validate with 5 users on a cheap prototype and iterate, rather than shipping to a big spec gathered from interviews. Combine methods: **iterate inside the stages, between the gates** — don't lock requirements up front (waterfall) and don't skip structure entirely.

---

## Activity-Centered vs Human-Centered Design

Designing for specific *individuals* fits them but may misfit everyone else; for global products, **focus on the activity, not the person.** "Let the activity define the product and its structure. Let the conceptual model of the product be built around the conceptual model of the activity." This works because **activities are similar across cultures**, and people **tolerate complexity and learning when it feels essential to the activity** (as with learning to drive).

- **Activity** = a high-level set of tasks toward a high-level goal ("go shopping"); a **task** is a lower-level set of operations ("drive to the market"). Designing for isolated tasks is too restrictive.
- Goal levels (Carver & Scheier): **be-goals** (why — self-image), **do-goals** (plans/actions — the goal of the seven stages), **motor-goals** (how). Hassenzahl mapped these to **UX**.
- The **iPod** succeeded by supporting the *entire activity* of music enjoyment (discover, buy, load, playlist, listen, share) — not just "play a file."

Related: **activity-centered controls** (an auditorium "video / lecture / full-lights" control that sets up the whole scene) beat **device-centered controls** (jumping between separate light/sound/screen controls — "a horrible cognitive interruption") — but must handle exceptions, and a manual override must never cancel the current activity.

**Complexity is good; confusion is bad.** "Complex things are no longer complicated once they are understood." The tool against confusion is a good conceptual model.

**Apply:** Design around the whole activity, not one screen — support the full arc (setup, main task, edge cases, sharing, recovery). Provide activity-level modes/presets for common workflows, but always allow overrides that don't destroy the user's context.

---

## Checklist

- [ ] Is every actionable region visibly distinct (affordance) **and** cued with a clear signifier of where/how to act? No taped-on "instructions" standing in for design?
- [ ] Do control layouts map naturally to what they affect (best: on the item; else adjacent; else same spatial layout)?
- [ ] Does every action get feedback that is **immediate (~0.1s), informative, prioritized, and not excessive**?
- [ ] Does the whole system image project one coherent conceptual model? Any label implying a model the system doesn't implement (refrigerator trap)?
- [ ] Can the user always tell **what to do** (Gulf of Execution) and **what just happened** (Gulf of Evaluation)?
- [ ] Reviewed against all **seven principles**: discoverability, feedback, conceptual model, affordances, signifiers, mappings, constraints?
- [ ] No reliance on the user holding more than **~3–5 items** in memory, and nothing critical carried across an interruption? Needed info kept in the world?
- [ ] Constraints (physical/cultural/semantic/logical) used to make wrong actions impossible, rather than validated after the fact?
- [ ] Forcing functions on irreversible/dangerous steps only, kept light enough not to be disabled?
- [ ] Designed against **slips** (dissimilar/separated controls, no modes or obvious modes, undo) **and** against **mistakes** (strong model, sensibility checks, prominent object of action)?
- [ ] Errors treated as **system/design error**, not user error — postmortems keep asking "why?" (Five Whys) and look for aligned holes (Swiss cheese)?
- [ ] Actions reversible (undo preferred over confirmation)? Interrupted users can resume with full state?
- [ ] Solving the **root problem**, validated by watching real users and iterating on cheap prototypes with ~5 people?
- [ ] Designed around the whole **activity**, with overrides that never destroy the user's context?
