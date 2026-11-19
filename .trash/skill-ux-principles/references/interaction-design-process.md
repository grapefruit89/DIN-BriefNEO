# Interaction Design Process — from research to evaluation

Source: Rogers, Sharp & Preece, *Interaction Design: Beyond Human-Computer Interaction* (6th ed., 2023) — the backbone. Woven with durable lessons from Moggridge, *Designing Interactions* (MIT Press, 2007).

**When to apply this:** Load when you are planning or reviewing any UI/flow and need the *named* models — the process phases, usability goals, interaction types, requirement kinds, and evaluation methods — stated precisely rather than paraphrased. These are the frameworks a design decision should be justified against.

---

## What interaction design is

- **Interaction design (IxD):** "Designing interactive products to support the way people communicate and interact in their everyday and working lives." (The book's own working definition; Winograd's 1997 phrasing: "designing spaces for human communication and interaction.")
- **IxD vs HCI:** a difference of **scope**. HCI historically focused narrowly on the usability of *computing systems*; IxD covers the design of user experiences for *all* technologies, systems, and products — hence "Beyond HCI." Today they largely align.
- **Usability vs UX:** **usability goals** measure whether specific criteria are met (e.g. efficiency); **UX goals** explicate the *nature* of the experience (e.g. aesthetically pleasing, engaging). The line is **not clear-cut** — usability underpins UX and UX qualities are inseparable from usability. Distinguish them to clarify roles; treat them together.
- **People-centered design** is the book's preferred term (after Norman 2018): "people" spans an individual, a group, or whole societies. "User-centered" is retained when specifically about how an interface is used. **CX** (customer experience) is the wider whole; **UX is part of CX**.

**Apply:** State whether a goal is a usability criterion (measurable) or a UX quality (felt) before you argue about it. Don't collapse the two.

### The seven usability goals (state exactly)

Usability = products easy to learn, effective to use, and enjoyable from the person's perspective. Each goal is usually phrased as a **question**:

| # | Goal | Core question |
|---|------|---------------|
| 1 | **Effectiveness** | Is the product capable of letting people do what it's for? |
| 2 | **Efficiency** | How many steps does a task take? (e.g. one-click ordering) |
| 3 | **Safety** | What errors are possible, and how does the design prevent them / allow recovery (undo, confirm)? |
| 4 | **Utility** | Does it provide the right set of functions? |
| 5 | **Learnability** | Can someone work out basic use by exploring? How hard to master? |
| 6 | **Memorability** | What supports recall, especially for infrequently used features? |
| 7 | **Satisfaction** | Is it pleasant/acceptable in use? (best-known measure: **CSAT**) |

**Usability criteria** operationalize these as measurable objectives (time to complete a task = efficiency; errors over time = memorability), compared against target values to decide if a product is releasable.

**Apply:** For every screen, name which of the seven it primarily serves, and don't sacrifice **safety** for **efficiency** (never place *delete* next to *save*; provide undo/confirm).

### UX goals

Subjective felt qualities. **Desirable:** satisfying, enjoyable, engaging, pleasurable, exciting, helpful, motivating, fun, rewarding, emotionally fulfilling, supporting **flow** (Csikszentmihalyi — total absorption where time flies). **Undesirable:** boring, frustrating, making one feel stupid/guilty, patronizing, gimmicky, creepy, intrusive, deceptive. **Microinteractions** (Saffer) — tiny single moments that disproportionately shape UX. Goals can **conflict** (a process-control system can't be both safe and fun); recognizing trade-offs is central to IxD.

### Accessibility & inclusiveness

- **Accessibility** = the extent to which a product is usable by as many people as possible; focus on people with disabilities.
- **Inclusive design** = being fair, open, and equal to everyone — the overarching approach.
- Inability to use a product is a result of **poor interaction design**, *not the impairment alone*. Designing for accessibility inherently produces better design for all (SMS was designed for hearing-impaired users first).
- Impairments classify by **type** (sensory, physical, cognitive) and **duration** (permanent, temporary, situational). ~80% of people will have a disability by age 85; <20% are born with one.

**Apply:** Treat an access barrier as a design defect to fix, not a user limitation. Design to WCAG **POUR** (Perceivable, Operable, Understandable, Robust — see Evaluation).

---

## Design principles as this book frames them

**Design principles** are generalizable, prescriptive "dos and don'ts" that orient designers — triggers, not specifications.

- **Visibility** — how the interface shows what to do next. Functions out of sight are harder to find (invisible sensor faucets confuse). **Apply:** keep available actions perceptible; beware replacing visible controls with ambiguous invisible activation zones.
- **Feedback** — sending back information about what action was done and accomplished, so the person can continue (audio, tactile, verbal, visual). Delay breaks it (imagine guitar with a several-second lag). **Apply:** acknowledge every action promptly; good feedback also supplies visibility.
- **Constraints** — restricting the interaction possible at a given moment (graying-out options; physical constraints like a key that fits one way; representational constraints). **Apply:** deactivate invalid actions rather than letting users trigger errors.
- **Consistency** — similar operations and elements for similar tasks (always left-click to highlight). Easier to learn/use; scale it by categorizing commands into menus. **Apply:** one action = one meaning everywhere.
- **Affordance** — an attribute that gives a clue to how an object is used (Norman 1988). **Nuance vs Norman (1999):** distinguish **real affordances** (physical, perceptually obvious, unlearned — grasping/pulling) from **perceived affordances** (screen-based, virtual, essentially **learned conventions**). Screen elements are *perceived* affordances; it makes no sense to design "real" affordances at a screen. **Apply:** on screen you are designing learned conventions — lean on established patterns, and note conventions can become intuitive (a toddler swipes).
- Also named: **findability** (Morville), **navigability** (obvious what to do / where to go), **simplicity** (Nielsen: remove elements one by one; if it still works without one, remove it).

> **Moggridge echo (Crampton Smith's qualities of good interaction):** clear mental model/metaphor; reassuring feedback ("you know what you did when you did it"); navigability (where am I, what can I do, where to go, how to get back); consistency ("Consistency, like all satisfying simplicity, is very difficult to achieve"); intuitive interaction that lets you concentrate on goals not the tool.

---

## The process

### The Double Diamond (UK Design Council)

Four phases across two diamonds; each diamond's left side = **divergent** thinking (widen), right side = **convergent** (focus).

| Phase | Diamond | What happens |
|-------|---------|--------------|
| **Discover** | 1 (diverge) | Understand the problem — don't assume; talk to affected people |
| **Define** | 1 (converge) | Reframe the design challenge from Discover insights |
| **Develop** | 2 (diverge) | Generate multiple responses; co-design; brainstorm |
| **Deliver** | 2 (converge) | Test at small scale; reject or evolve solutions |

**Non-linear and iterative** (Challenge → Outcome). Four supporting principles: (1) be people-centred; (2) communicate visually & inclusively; (3) collaborate & co-create; (4) iterate, iterate, iterate. "In an ever-changing digital world, no idea is ever 'finished.'"

**Apply:** Requirements sit in Discover+Define; design & prototyping in Develop; evaluation in Deliver. Don't jump to "nuts and bolts" before articulating the **problem space**.

### The four basic activities of interaction design

1. **Discovering requirements** for the product.
2. **Designing alternatives** that meet them — split into **conceptual design** (the conceptual model: what people can do + concepts to interact) and **concrete design** (colors, sounds, terminology, images, menus, icons).
3. **Prototyping** the alternatives so they can be communicated and assessed.
4. **Evaluating** the product and its UX, throughout.

These are **intertwined and iterative**, not sequential.

### The simple interaction design lifecycle model

A loop:
**DISCOVERING REQUIREMENTS → DESIGNING ALTERNATIVES → PROTOTYPING → EVALUATING → (back to any earlier activity) → FINAL PRODUCT.**
(Other lifecycle models named: the **Star** — Hartson & Hix; **ISO 9241-210**. Software-engineering: waterfall, spiral, V.)

**Apply:** Evaluation feeds back into any prior activity — treat it as the loop's hinge, not a final gate.

### People/user-centered design principles

**Gould & Lewis (1985) — the three classic principles (memorize):**
1. **Early focus on users and tasks** — directly study users' characteristics; observe them doing normal tasks; involve them.
2. **Empirical measurement** — observe and measure intended users' reactions/performance on scenarios, manuals, simulations, prototypes early.
3. **Iterative design** — when testing finds problems, fix and re-test; design-test-measure-redesign as often as needed. "Designers never get it right the first time."

The **people-centered** approach expands these: tasks/goals (not technology) drive design; behavior and context of use are studied; user characteristics (e.g. ~4.5% color blindness) are designed for; stakeholders are consulted from earliest to latest phases; decisions taken within the context of use; usability & UX goals agreed at project start; iterate through gather → generate → evaluate.

**Four approaches to IxD** (Saffer 2010): **user-centered** (user guides), **activity-centered** (behavior around tasks), **systems** (the system is central; for complex problems), **genius/rapid-expert** (designer's flair; users only validate).

**Stakeholders** always outnumber users. Involve users for **expectation management** (realistic expectations, no surprises) and **ownership** (contributors support adoption). **Participatory design** places those designed-for as central actors, not passive receivers.

> **Moggridge lesson:** *Understand people, then prototype early and often* — his whole thesis. Gould & Lewis's "empirical measurement" is Engelbart's "why not just test and measure?" (he prototyped every pointing device and let timed tests on naive users pick the mouse). And "early focus on users" is Tim Mott sitting real editors at a **blank screen** to discover cursor-between-characters and drag-through selection.

---

## Conceptualizing

### Conceptual models

- **Conceptual model** (Johnson & Henderson 2002): "a high-level description of how a system is organized and operates." It lets designers "straighten out their thinking before laying out their widgets." It outlines *what people can do* and *the concepts needed* to interact.
- **Four core components:** (1) **metaphors and analogies**; (2) **the concepts** users are exposed to (objects, attributes, operations); (3) **the relationships** between concepts (a folder contains files); (4) **the mappings** between concepts and the UX supported.
- Best models feel obvious/simple. Classic transformative models: the **desktop** (Xerox, late 1970s), the **spreadsheet** (Bricklin & Frankston), the **World Wide Web** (Berners-Lee) — all built on familiar activities.

**Norman's gap framework** (Box 3.5): **Designer's Model** (how the designer thinks it works) → **System Image** (how the system presents itself via interface/manuals/help) → **User's Model** (how the user understands it). If the system image fails to convey the designer's model, users form a wrong model and err.

**Apply:** Write the conceptual model (metaphors, concepts, relationships, mappings) before UI. The **system image** is your only channel to the user's model — make it carry the intent.

### Interface metaphors

A structure similar to a familiar entity but with its own behaviors, instantiated in the UI (desktop, shopping cart, card). **Downside:** metaphors don't scale to complex systems; **Cooper (2020)** argues to *abandon* interface metaphors and explain interfaces via underlying concepts and relationships. The book leaves the debate open.

**Evaluate a candidate metaphor** (Erickson's five questions): How much **structure** does it provide? How much is **relevant**? Is it **easy to represent**? Will the **audience understand** it? How **extensible** is it?

### The five interaction types

Ways a person interacts with a product (labels refer to the *user's* action; not mutually exclusive):

1. **Instructing** — issuing commands (type, menu, voice, gesture, buttons). Quick, efficient; fits repetitive actions.
2. **Conversing** — two-way dialogue with the system as a partner (CUIs, chatbots, Siri). Risk: cumbersome one-sided menus.
3. **Manipulating** — acting on objects in virtual/physical space (open, zoom, drag). Framework: **direct manipulation** (Shneiderman 1983) — (a) continuous representation of objects/actions; (b) rapid, reversible, incremental actions with immediate feedback; (c) physical actions instead of complex syntax. Benefits: fast to learn, memorable, few errors, visible progress, sense of control.
4. **Exploring** — moving through a virtual/physical environment (3D, AR/VR, smart rooms).
5. **Responding** — the **system initiates**; the person chooses whether to respond (proactive alerts, fitness milestones, Google Lens pop-ups). *(Added by Lueg et al. 2019; the original four were Preece et al. 2002.)*

**Apply:** Pick the interaction type deliberately per task. Prefer **direct manipulation** for spatial/object tasks; reserve **conversing** for genuinely dialogic tasks (Porcheron found voice assistants are better modeled as *instructing* than conversing).

> **Moggridge:** Winograd maps three enduring metaphors — **manipulation** (direct manipulation, Star/Mac), **locomotion** ("going to" a page — the Web's place metaphor), **conversation** (very hard to design well). Tesler's **modelessness** ("Don't mode me in") is the discipline that keeps instructing/manipulating predictable.

---

## Cognition that design must respect

Applied, briefly. **Experiential** cognition (intuitive, effortless — Kahneman's fast thinking) vs **reflective** cognition (effortful — slow thinking).

- **Attention** — selecting what to focus on; eased by clear goals and salient information. Grouping/spacing data cut lookup from 5.5s to 3.2s (Tullis). Multitasking overloads focus; switching costs time. **Apply:** make needed info salient (color, spacing, ordering); avoid clutter; support switching/return.
- **Perception** — vision dominant, then hearing, touch. Grouping and **white space** aid it. **Apply:** ensure distinguishable representations and adequate **color contrast** (account for color-vision deficiency); don't overuse haptics.
- **Memory** — **working memory** vs **long-term**; people are far better at **recognition** than **recall**. **7±2** (Miller) applies to *short-term recall*, NOT to menu length — menu items are visually present and *recognized*, so lists can have 3 or 30 items. **Apply:** design for **recognition over recall** (menus, icons, consistent placement); reduce cognitive load. Exception: a 200-country dropdown — typing (recall) beats scrolling.
- **Mental models** — internal constructions used to predict/infer (Craik; Johnson-Laird). Often erroneous (the "valve theory": cranking a thermostat to max to heat faster). Build better models via clear instructions, help, affordances, appropriate metaphors.
- **Gulfs of execution and evaluation** (Norman 1986; Hutchins et al.): **Gulf of execution** = distance from user to system — "How do I use this?" **Gulf of evaluation** = distance from system to user — "What's the current state?" **Apply:** bridge both — make actions discoverable (execution) and system state legible (evaluation).
- **Mental workload / cognitive load** — mental effort to learn/use, bounded by working memory (Sweller). Measured via **NASA-TLX** (mental, physical, temporal demand; performance; effort; frustration). **Apply:** minimize steps and simultaneous demands; offload to external representations (dashboards, reminders, visible history).

---

## Data gathering & requirements

### Techniques

- **Interviews** (four types): **unstructured** (exploratory, rich, inconsistent), **structured** (identical closed questions), **semi-structured** (script + neutral **probes** until no new info — the workhorse), **focus groups** (3–10 people, surfaces diverse views; risk of groupthink/dominance; not the sole source).
- **Questionnaires** — efficient at reach; use **Likert** (agreement) and **semantic differential** (bipolar adjective) scales; avoid overlapping ranges (15–19 / 20–24, not 15–20 / 20–25); ~40% return acceptable.
- **Observation** — **direct vs indirect**, **in-the-wild vs controlled**. Frameworks: simple **person / place / thing**; Robson & McCartan's Space, Actors, Activities, Objects, Acts, Events, Time, Goals, Feelings. **Think-aloud** (Ericsson & Simon) — biggest problem is silence during hard tasks; fix with **constructive interaction** (two people work together).
- Cross-cutting issues for any session: setting goals, identifying participants (sampling; CHI median ≈ 12), informed consent, ethics/GDPR, **triangulation** (≥2 perspectives), and a **pilot study**.
- **Dilemma — what people say vs do:** people give socially desirable answers or forget. Mitigate with careful questions, more participants, and combining methods.

> **Moggridge:** "Look at what people really do, rather than rely on asking them" — latent needs are rarely spoken. IDEO's **Look** cards (Fly on the Wall, A Day in the Life, Shadowing) capture behavior; **Ask** cards get stated views. *Context is king.*

### What is a requirement

A statement of what a product should do or how it should perform. **Volere atomic shell** adds a **fit criterion** (how you'll know it's met). **User stories:** "As a `<role>`, I want `<behavior>` so that `<benefit>`"; large ones are **epics** broken into stories → tasks.

### The six kinds of requirements (memorize)

1. **Functional** — what the product will do.
2. **Data** — type, volatility, size, persistence, accuracy, value of the data.
3. **Environmental / context of use** — four aspects: **physical** (light, noise, dust, gloves), **social** (sharing, sync/async, number of people), **support** (training, help), **technical** (platforms, compatibility).
4. **User characteristics** — abilities, skills, education, preferences, disabilities; novice/expert/casual/frequent. A **user profile** = a collection of these.
5. **Usability goals** — the seven, captured with measures.
6. **UX goals** — captured, harder to quantify.

**Apply:** A requirement without a **fit criterion** is untestable — add one. Cover all six kinds; environmental and user-characteristic requirements are the ones teams skip.

### Personas & scenarios

- **Persona** (Cooper 1999): a *synthesized*, representative user — NOT a real person, job title, or demographic. Defined by a set of **goals** for the product plus credible details (name, photo, quote, background). Design decisions become "What would Bill do?" A product needs a *set* of personas, often with one or a few **primary** personas. → See [goal-directed-design.md](goal-directed-design.md).
- **Scenario** (Carroll 2000): an "informal narrative description" of activities/tasks — goal + narrative + which persona. Describes **existing** behavior (to understand) or **future** behavior (to explore options).
- Personas + scenarios are **complementary** and developed in parallel across the lifecycle.

### Use cases

Capture functional requirements / interaction step-by-step (vs user stories, which focus on outcomes).
- **Essential use case** (Constantine & Lockwood): two columns — **User Intention** vs **System Responsibility** — no interface detail.
- **Detailed use case:** the **normal course** (most common sequence) plus **alternative courses** (errors), each numbered to the step it replaces.

---

## Prototyping

A **prototype** = one manifestation of a design that stakeholders can interact with to explore its suitability; it **emphasizes some characteristics and de-emphasizes others**. Prototypes range across **"looks like / behaves like / works like."**

**Why prototype:** communication, exploration, reflection-in-design (Schön), testing feasibility, clarifying requirements, checking direction.

| | **Low-fidelity** | **High-fidelity** |
|---|---|---|
| Looks/works like final? | No | Yes |
| Cost/speed | Cheap, fast, easy to change | Slower, costlier |
| Best for | Exploring many alternatives early | Later refinement, realistic testing |
| Risk | Dismissed as unpolished | Critiqued superficially / "looks done" → fewer alternatives explored |
| Forms | Storyboards, sketches, paper/index cards, **Wizard of Oz** | Interactive, near-final builds; **horizontal** (broad, shallow) vs **vertical** (narrow, deep) |

**Conceptual vs concrete design** (the two aspects of "designing alternatives", both in Develop): **conceptual** = the model (metaphors, concepts, relationships, mappings; captured in **wireframes**); **concrete** = the details (visual appearance, icons, navigation, layout, WCAG accessibility, localization). Intertwined and iterative.

**Prototyping compromises:** breadth vs depth; robustness vs changeability. **Evolutionary** prototyping (grows into the product) vs **throwaway** (stepping stones).

> **Moggridge — the durable prototyping doctrine:**
> - **"Fail early to succeed sooner."** "If we shrug off the fear and get into the habit of trying things out, we will fail frequently, but the reward is that we will succeed sooner." A new prototype every day (Atkinson & Tesler built/tested a pull-down-menu prototype nightly).
> - **Experience prototypes** (Buchenau & Fulton Suri) — make the *experience* felt, not just seen; "if the designed experience is good, people forget the limitations of the prototype." Kodak's ugly beige-box camera prototype communicated the feel and won the program.
> - **Prototypes' three jobs:** (1) **Understand** existing experiences/context; (2) **Explore and evaluate** design ideas; (3) **Communicate** ideas to others.
> - **Don't start in the final medium.** "Designers are often too quick to start in the final medium" and get "sucked down into pixel pushing" before resolving usability and value. Lo-fi paper "is not precious, so it invites more honest critique." Software must **congeal** — "to get software smooth, you must start over a number of times."

**Apply:** Start lo-fi and cheap; go hi-fi only to resolve details or test realism. Name what each prototype **filters in** and which of the three jobs it's doing. Cross-ref [sketching-and-ideation.md](sketching-and-ideation.md).

---

## Evaluation

**Evaluation** = collecting and analyzing data about users' experiences with a sketch, prototype, or system, to improve the design. **Formative** (during design) vs **summative** (of a finished product).

**Important edition note:** this 6th edition **replaced the DECIDE framework** with the **Why, What, Where, When of evaluation** plus **three categories of evaluation**: (1) controlled settings involving participants (usability testing, experiments); (2) natural settings / in-the-wild; (3) settings **not** involving participants (inspections, heuristics, walkthroughs, models, analytics). Interpretation hinges on **reliability**, **validity**, **ecological validity** (watch the **Hawthorne effect**), **bias**, and **scope**.

### Usability testing

Data collected in a controlled setting combining observation, interviews, questionnaires, and logging. Typical users do typical tasks; compare errors and times across versions. **Performance measures** (Wixon & Wilson): task success rate, time to complete, errors per task/per unit time, help navigations. **Participants:** 5–12 acceptable — Nielsen: testing **five users** finds almost as many problems as many more.

### Heuristic evaluation

Experts judge whether UI elements conform to established usability principles (Nielsen & Mohlich 1990; Nielsen 1994). **3–5 evaluators** find ~75% of problems.

**Nielsen's 10 heuristics (named):** 1. Visibility of system status; 2. Match between system and the real world; 3. User control and freedom (undo/redo, clear exits); 4. Consistency and standards; 5. Error prevention; 6. Recognition rather than recall; 7. Flexibility and efficiency of use (accelerators); 8. Aesthetic and minimalist design; 9. Help users recognize, diagnose, and recover from errors; 10. Help and documentation.

**The three stages:** **briefing session** → **evaluation period** (1–2 hrs independent inspection, ≥2 passes — first for flow/scope, second for specific elements) → **debriefing session** (consolidate, prioritize, suggest fixes).

**Dilemma:** heuristic evaluation misses some severe problems and raises false alarms (Bailey: ~33% real, ~43% false alarms) — **not a replacement for user testing**.

→ Full heuristic detail and related sets (Shneiderman's 8 Golden Rules, WCAG **POUR**, Budd's web heuristics) in [usability-heuristics.md](usability-heuristics.md).

### Cognitive walkthrough

Simulate a user's problem-solving at each step; **focuses on ease of learning** (Wharton et al. 1994). Identify typical users, sample tasks, and the action sequence, then walk each action asking **the three questions:**
1. Will the correct action be **sufficiently evident**? (Will users know what to do?)
2. Will the user **notice the correct action is available**? (Will they see how?)
3. Will the user **associate/interpret the response correctly**? (Will they understand the feedback?)

Finer-grained than heuristic evaluation — not for a whole large site. (**Pluralistic walkthrough:** a team incl. users steps through a scenario together — good for safety-critical systems.)

### Analytics & A/B testing (usually remote, no participants present)

- **Web analytics** — interaction logging: visitors, duration, pages, **bounce rate** (% viewing one page; typical 40–60%). Big-picture overview; complements user testing but can't say *how/why* users feel.
- **A/B testing** — a large-scale **between-participants controlled experiment**: group A gets the existing design, group B the new; measure a dependent metric. Run an **A/A test** first to validate the split. Small changes can have large effects (Bing headline change → +12% revenue), but care is needed (a "$149.95 vs Try for free" change distorted results, −64% clicks).

### Fitts' Law (predictive model, no users present)

Predicts the time to reach a target with a pointing device:

**T = k · log₂(D / S + 1.0)** — where **T** = movement time, **D** = distance to target, **S** = target size, **k** ≈ 200 ms/bit.

**In a nutshell: the bigger and closer the target, the faster it is to reach.** Screen corners are reached fastest (infinite edge — "pinning"); labeled toolbar icons are faster because the label enlarges the target. **Apply:** size and place frequent/critical controls generously; exploit edges and corners; on mobile respect min touch targets (Apple 44×44 pt).

---

## Durable lessons (Moggridge)

- **Understand people before you prototype.** The book's thesis: *understand people, then prototype early and often.* Go to the real context; observe what people *do*, not what they *say*.
- **Constraints define the design** (Charles Eames: "Design depends largely on constraints... the ability of the designer to recognize as many of the constraints as possible"). Hawkins carved a wooden PalmPilot block to a shirt-pocket size and set four fixed criteria (size, price, sync, speed). A tight constraint (Palm's 160×160 screen) "forces you to be disciplined."
- **Simplicity, metaphor, direct manipulation.** "Less is more; avoid adding features; strive for fewer steps." A clear metaphor (HyperCard's "stack of cards"; SimCity "is really about gardening") focuses both designer and user. Direct manipulation (steering a car vs typing "15 degrees right") is "simple, effective, enjoyable."
- **Verplank's three questions:** **How do you do?** (handles = continuous control you keep vs buttons = discrete, delegated) · **How do you feel?** (the sensory/emotional feedback) · **How do you know?** (give a **map** — overview — and/or a **path** — what to do moment by moment).
- **Tesler's modelessness — "Don't mode me in."** Make it "so easy you couldn't make a mistake"; want things obvious, not learned.
- **Design for the extremes, not the average.** "If we design an ATM to time out after the *average* PIN-entry time, we inconvenience 50% of users" — design for all but the slowest ~2%; span slowest-to-fastest and naive-to-expert.
- **Beware designing for yourself.** "It's much easier to design for ourselves than for other people." Even when you *are* the target user, you lose distance (Podlaseck's Glass Engine: "This was perfect for *me*; then to watch others use it... extremely painful"). Leave your desk; keep human-factors colleagues who "keep us focused on other people." Know who your customer is — "We're geeks... we're not the customers."
- **Evaluate early, often, and as late as possible.** For a *new version* (most real work), the existing "state of the art" — competitors, prior designs, published principles — is the most useful starting point.

---

## Quick-reference

- **Double Diamond** — Discover, Define, Develop, Deliver (each diamond: diverge then converge).
- **Four basic IxD activities** — discovering requirements, designing alternatives, prototyping, evaluating (a loop via the simple lifecycle model).
- **Seven usability goals** — effectiveness, efficiency, safety, utility, learnability, memorability, satisfaction.
- **Five design principles** — visibility, feedback, constraints, consistency, affordance (real vs perceived, per Norman 1999).
- **Five interaction types** — instructing, conversing, manipulating, exploring, responding.
- **Conceptual model components** — metaphors/analogies, concepts, relationships, mappings. **Norman's gap:** Designer's Model → System Image → User's Model.
- **Gulfs** — of execution ("How do I use this?"), of evaluation ("What's the system state?").
- **Gould & Lewis (1985) principles** — early focus on users and tasks; empirical measurement; iterative design.
- **Six requirement kinds** — functional, data, environmental (context of use), user characteristics, usability goals, UX goals. (Add a **fit criterion** to each.)
- **Heuristic evaluation — 3 stages** — briefing → evaluation period (≥2 passes) → debriefing. Nielsen's 10 heuristics; 3–5 evaluators ≈ 75% of problems.
- **Cognitive walkthrough — 3 questions** — Is the correct action evident? Will the user notice it's available? Will they interpret the response correctly? (focuses on ease of learning).
- **Fitts' Law** — **T = k · log₂(D/S + 1)**; bigger & closer targets are faster; exploit edges/corners.
- **NOT in the 6th ed.: the DECIDE framework** (Determine / Explore / Choose / Identify / Decide / Evaluate) — it appeared in *earlier* editions and was replaced here by the **Why/What/Where/When of evaluation** plus the **three categories of evaluation**. Cite DECIDE only as "from earlier editions of this text."
