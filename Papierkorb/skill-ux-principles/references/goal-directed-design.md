# Goal-Directed Design — Cooper's method

Source: Alan Cooper, Robert Reimann, David Cronin & Christopher Noessel, *About Face: The Essentials of Interaction Design* (4th ed., 2014).

## When to apply this

Reach for this when you are defining *what* a product should do and *how it should behave* — before or during UI construction. It is the antidote to feature-list design, implementation-model UIs, and "the user" hand-waving. Pair with [design-of-everyday-things.md](design-of-everyday-things.md) (mental models, affordances) and [sketching-and-ideation.md](sketching-and-ideation.md) (low-fidelity framework exploration).

---

## Goals vs. tasks vs. activities

A **goal** is an expectation of an *end condition*. **Activities** and **tasks** are intermediate steps toward a goal (Norman's Activity-Centered hierarchy: activities → tasks → actions → operations). Cooper's critique of ACD: it describes the *what* of behavior well but never asks the first question — **why** is the user doing this. **Goals motivate activities; activities do not motivate goals.**

How to tell them apart: **goals are driven by human motivation and change very slowly, if ever. Tasks and activities are transient because they depend on the technology at hand.**

**The St. Louis → San Francisco example.** The traveler's *goals* — get there fast, comfortable, and safe — are constant from an 1850 covered wagon to a modern jet. The *tasks* reversed entirely: the wagon traveler packed a rifle; the jet traveler must leave firearms at home. **Designing only from current tasks traps you in a model imposed by outmoded technology.** Looking through goals lets you eliminate now-unnecessary tasks and streamline the rest.

Corollary: an accounting clerk's goal is *not* "process invoices efficiently" — that is the *employer's* business goal. The clerk's goals are personal: appear competent, stay engaged, not look stupid. Products built only for business goals eventually fail; meeting users' personal goals achieves business goals far more effectively. Software that completes tasks without addressing goals rarely makes users truly effective (a great app for typing 5,000 names is worse than one that auto-imports them from invoicing).

**Apply:** Before designing any flow, write the persona's end goal as a plain sentence. For every task the current/legacy system imposes, ask "does this serve the goal, or the old technology?" Delete tasks that only existed to satisfy obsolete tech. Never let a business/employer goal masquerade as a user goal in your requirements.

---

## The three types of user goals

Mapped to Norman's three levels of processing (*Emotional Design*: visceral, behavioral, reflective). This is the core persona concept.

| Type | Norman level | Question it answers | Drives | Count per persona |
|------|-------------|--------------------|--------|-------------------|
| **Experience goals** | Visceral | *How the user wants to feel* | Visual/aural character, interactive feel (animation, latency, "snap ratio"), microinteractions | ~0–2 |
| **End goals** | Behavioral | *What the user wants to do* | The focus of interaction design + information architecture | ~3–5 (the most useful) |
| **Life goals** | Reflective | *Who the user wants to be* | Overall product strategy and branding | ~0–1 |

- **Experience goals** are simple, universal, personal: feel smart and in control, have fun, feel secure, feel cool/relaxed. Violating them egregiously fails the product regardless of everything else. "Don't feel stupid" and "don't waste time" are implicit for everyone.
- **End goals** are the motivation behind the tasks: "be aware of problems before they become critical," "clear my to-do list by 5pm," "find music I'll love." Must be met for the product to be worth its cost.
- **Life goals** are aspirations beyond the product: "live the good life," "be respected by peers." Meeting them turns satisfied users into fanatically loyal ones.

Summary: **experience = how you want to feel; end = what you want to do; life = who you want to be.**

Watch the visceral/behavioral link: users judge attractive interfaces as *more usable*, and that belief persists — so a visceral promise of ease must be **delivered on at the behavioral level**, or you have betrayed the user.

**Nonuser goals** — acknowledge but never satisfy at the user's expense: **customer goals** (purchasers; e.g. price, maintenance — never trump end goals), **business/organizational goals** (profit, retention, efficiency), **technical goals** (data integrity, cross-platform — must serve user/business goals; users don't care what database you use).

**Apply:** For each persona, list 0–2 experience goals, 3–5 end goals, 0–1 life goals. Let experience goals dictate motion, latency budgets, and tone; let end goals dictate what functions and information the UI exposes; let life goals dictate brand and strategy. If a persona has no goals, it is not a persona.

---

## Implementation model vs. mental model vs. represented model

| Model | What it is | Design consequence |
|-------|-----------|-------------------|
| **Implementation model** (Norman's "system model") | How the machine/code actually works — algorithms, modules | Easiest to build to (a button per function, a field per input, a dialog per code module), but it alienates users |
| **Mental model** (conceptual model) | The user's cognitive shorthand — simpler than reality, not necessarily accurate ("electricity flows like water in a tube") | Adequate for use; the target you design toward |
| **Represented model** (Norman's "designer's model") | How the designer *chooses to represent* the working of the product | Software's unique power: it can differ greatly from the implementation (show a network file server as a local disk) |

**Principle: user interfaces should be based on user mental models, not implementation models.** *Goal-directed interactions reflect user mental models.* The closer the represented model sits to the user's mental model, the easier and more understandable the product. Because we form mental models simpler than reality, represented models should be **simpler than the implementation**.

**Example:** Photoshop Express for iPad shows thumbnail previews of each filter — the mental model "how my photo will look" — instead of numeric fields and banks of controls (the implementation model).

**Apply:** When a UI element exists only because the code is structured that way (a dialog per module, a field per DB column), redesign it around the user's mental model. Represent, don't expose. Prefer showing outcomes (previews, states) over parameters.

---

## The Goal-Directed Design process — six phases

Combines ethnography, stakeholder interviews, user models, scenario-based design, and principles/patterns. Maps to Crampton Smith & Tabor's five activities (understanding, abstracting, structuring, representing, detailing).

1. **Research** — ethnographic field study (observation + contextual interviews), competitive audits, literature/market review, stakeholder/SME/tech-expert interviews. Output: emergent **behavior patterns**, plus business goals, brand attributes, tech constraints.
2. **Modeling** — synthesize behavior/workflow patterns into **domain models** and **user models (personas)**. Differentiate, prioritize, designate persona types and design targets.
3. **Requirements Definition** — bridge research to design with scenario-based methods focused first on persona goals, not abstract tasks. Iterative **context scenarios**. Output: a requirements definition balancing user, business, technical needs.
4. **Framework Definition** — create the overall product concept: behavior, visual, and (if applicable) physical-form frameworks. Uses interaction **principles** (bottom-up) + interaction **patterns** (top-down). Output: a stable, high-level **interaction framework** (sketches + behavior descriptions), plus a **visual language strategy**.
5. **Refinement** — increasing focus on detail. Interaction designers use **key-path scenarios** (walkthroughs) and **validation scenarios** for storyboarding. Output: detailed form-and-behavior specification.
6. **Support (development support)** — stay available to developers during construction to make trade-off-driven, scaled-down solutions so design integrity isn't compromised.

**Axiom: interaction design is not guesswork. Goals, not features, are the key to product success.**

**Apply:** Don't jump from research to wireframes. Insert Modeling (personas) and Requirements (scenarios → needs) between them. Keep the framework low-fidelity until it stabilizes; only then refine to pixels.

---

## Personas

Personas are **user models: composite user archetypes synthesized from behavior patterns observed in research.** Not real people; built from real users' behaviors and motivations. *"If your user model doesn't have any goals, what you have is not a persona."* They are **personifications** that engage the team's **empathy** around user goals (the Stanislavski / Method-acting analogy). Archetypes ≠ stereotypes; express **ranges** of behavior, not **averages** (no "1.5 kids, $35–45k"). A persona is a user of a *specific product* — context-specific, hard to reuse.

### Construction — 8 steps

1. **Group interview subjects by role.**
2. **Identify behavioral variables** — per role, list distinct behaviors across **Activities, Attitudes, Aptitudes, Motivations, Skills**. Typically 15–30 variables per role. Favor behavioral over demographic.
3. **Map subjects to the behavioral variables** — relative position matters more than absolute; look for clustering.
4. **Identify significant behavior patterns** — a cluster across 6–8 variables = a likely persona, but only with a *logical/causative* connection (CDs↔MP3s, not CDs↔vegetarian).
5. **Synthesize characteristics and define goals** — describe behaviors, environment, frustrations, demographics, skills, attitudes; add a believable first+last name and minimal fictional detail (design tool, not a novel); infer each goal as a simple sentence.
6. **Check for completeness and redundancy** — each persona differs from every other in ≥1 significant behavior; add political personas if needed.
7. **Designate persona types** (below).
8. **Expand the description** — a 1–2 page third-person narrative: job/lifestyle, a day in the life with peeves/concerns bearing on the product, ending with what the persona seeks. Don't exceed the depth of your research; don't introduce design solutions; use realistic, un-posed photos.

### Persona types

| Type | Definition |
|------|-----------|
| **Primary** | Main target of *one interface*. Cannot be satisfied by a design aimed at another persona, yet a design aimed at the primary leaves others *not-dissatisfied*. **One primary per interface.** Choose by elimination (compare goals), not by biggest market segment (OXO Good Grips, designed for arthritis users, delighted the whole market). |
| **Secondary** | Mostly satisfied by the primary's interface but has specific extra needs met without harming the primary. >3–4 secondaries → scope too large. |
| **Supplemental** | Needs fully covered by the primary/secondary solution; any number; often the "political" personas. |
| **Customer** | Addresses customer (not end-user) needs; usually treated like a secondary; sometimes primary for an admin interface. |
| **Served** | Not a user, but *directly affected* by the product (the radiation-therapy patient). Tracks second-order ramifications; treated like a secondary. |
| **Negative / anti-persona** | Explicitly *not* a design target; purely rhetorical (tech-savvy early adopters, trolls, IT specialists for a business-user product). |

### The three pitfalls personas prevent

- **The elastic user** — "the user" conveniently stretches to justify whatever the team wants (call them a "power user" to justify a tree control; a "first-timer" to justify a wizard). Real personas are not elastic. Even job titles can be too elastic (trauma vs. pediatric-ICU vs. OR nurses differ).
- **Self-referential design** — projecting your *own* goals, skills, and mental model onto the design ("cool" designs whose only audience is people like the designer; developers building implementation-model products).
- **Edge cases** — situations that might happen but usually won't. They must be *programmed* for but must never be the *design focus*. Personas let you ask "Will Julie ever do this?" and prioritize.

**Provisional / ad hoc personas** — when there is no research budget: a fleshed-out persona hypothesis from stakeholder/SME/market data. Better than no model, but label them clearly, use sketches not photos, and focus on behaviors and goals.

**Apply:** Give the interface exactly one named primary persona and design its main path for that persona alone. When a stakeholder says "but what about a user who…", check the request against your persona set and label it primary/secondary/edge/negative accordingly before spending effort on it.

---

## The axiom: don't make the user feel stupid

**The single most important interaction-design guideline: *Don't make the user feel stupid.*** You make users feel stupid by (1) letting them make big mistakes, (2) keeping them from getting enough work done, or (3) boring them. The user's most important goal is to **retain human dignity**.

**Apply:** Review every error state, dead end, and confirmation dialog against this axiom. Prevent big irreversible mistakes; keep the user productive; don't waste their time. If an interaction could make a competent adult feel dumb, redesign it.

---

## Scenarios — narrative that bridges research to design

Interaction design is first and foremost the design of **behavior over time**, so a narrative structure (plus a whiteboard) is the ideal tool. Persona-based scenarios are concise narratives of a persona using the product to achieve specific goals, starting from an ideal experience from the persona's point of view. **Goals filter tasks** and guide what information and controls to display. Distinguish from **use cases** (exhaustive, transactional, treat all interactions as equally likely — use late, for validation/edge cases) and **user stories** (informal requirements, not narratives).

The three scenario types, in order of increasing interface specificity:

- **Context scenario** — created *before any sketching*. High-level, broad and shallow, entirely textual, from the persona's perspective. Explores how the product can best serve goals and establishes primary touch points over a day or meaningful period. Answers: setting? duration? interruptions? shared device? primary activities? expected end result? permissible complexity? It does **not** describe current behavior or interface detail — treat the product as a **"magic black box."**
- **Key-path scenario** — a revised context scenario *after* functional/data elements and the Design Framework exist. Describes the most significant/frequent interactions in the design's own vocabulary; more task-oriented; iteratively refined. Goals remain the measuring stick.
- **Validation scenario** — less detailed "what-if" questions used to test the solution across situations (alternative, necessary-use, edge-case).

**Axiom: in the early stages of design, pretend the interface is magic.** If the product had magic powers, how simple could the interaction be? Goal-directed behavior, not technology, provides the "magic."

**Apply:** Write a textual context scenario for the primary persona before you draw a single box. Describe what happens, not which widget does it. Only after the framework exists, rewrite it as a key-path scenario using real UI vocabulary, then stress it with validation what-ifs.

---

## Requirements are needs, not features

**Define what the product will do before you design how it will do it.** Conflating *what* and *how* is a major pitfall — it produces endless iteration and "I like / you like" subjectivity. Requirements are **needs**, NOT features and NOT specifications. Typical MRDs/PRDs fail by (1) being loosely connected to user research and (2) confusing what with how ("there should be a menu containing…" presupposes the solution).

**Example:** an executive doesn't need "reports" (a *how*); the real need is to recognize exceptional situations and understand emerging trends → which might be met by exception reporting or real-time trend monitors. Separating the problem from the solution keeps you flexible against changing technology and maximizes leverage.

Express each requirement as **object / action / context**: *"Call [action] a person [object] directly from an appointment [context]."* Categories:
- **Data requirements** — objects and attributes that must be represented (accounts, people, messages, with status/dates/size).
- **Functional requirements** — operations/actions on objects (→ interface controls); also containers/places.
- **Contextual requirements** — relationships and dependencies: which objects must be shown together for the workflow; physical environment; persona skills.
- Plus **other requirements**: business, brand & experience, technical, customer/partner.

**Apply:** Phrase requirements as needs in object/action/context form, each traceable to a persona/scenario. Reject any "requirement" that names a specific widget or screen — that is a design decision smuggled in as a need.

---

## Posture — a product's behavioral stance

**Posture** = how much attention the user devotes to a product and how the product's behavior responds to that level of attention. It is a **behavioral** choice, not merely aesthetic; aesthetics should be in harmony with it. Posture is not monolithic — a product has a predominant posture, but individual features can have their own (a word processor is sovereign, but its table tool is transient).

### Sovereign
Monopolizes the user's attention for long, continuous periods; full feature set; kept running maximized (word processor, spreadsheet, email, IDE, most job-specific apps).
- **Optimize for perpetual INTERMEDIATE users** — not beginners or experts. Every user is a beginner only briefly.
- **Be generous with screen real estate**; default to maximized.
- **Use a minimal, conservative, muted visual style** — garish controls that thrill newcomers grate after weeks of daily use. Small dots/accents of color beat big splashes.
- **Provide rich modeless feedback** in the status bar, title bar, scrollbar ends.
- **Support rich input** — offer frequent actions several ways (direct manipulation + mnemonics + accelerators).
- You can use **tiny hit targets and screen edges/corners** because the user is settled in.

### Transient
Comes and goes, presenting a single function with a constrained set of controls; invoked, does its job, leaves (calculator, volume control, file-open dialog). The user never builds familiarity.
- Make it **obvious, bold, clear**; big buttons with **explicit verb/object labels** ("Set up user preferences", not "Setup").
- **No abbreviations.**
- **Single window/view** — if you're adding a dialog or subwindow to a transient app, the design needs review.
- **Remember the user's last choices** (position, size, settings) instead of resetting to defaults.
- Most **dialog boxes behave like transient apps** — the same rules apply.

### Daemonic
Works silently in the background with no direct interaction (printer driver, network service, sync process). UI exists only at install/remove/adjust moments, and that interaction is transient in nature — so transient rules apply, but **clarity of status reporting matters even more**, because users may not even know the daemon exists. Esoteric status messages must not confuse.

### Auxiliary
A continuously running app (web/other) that is neither fully sovereign nor transient — present but in a supporting role.

Platform/hardware decisions are **more effective when made after interaction design, not before.**

**Apply:** Classify each surface by posture before styling it. Sovereign: muted, dense, information-rich, keyboard-friendly, tuned for intermediates. Transient: big, explicit, single-view, remembers last state. Daemon config: transient rules + unambiguous status. Don't apply beginner-friendly wizards or splashy chrome to a sovereign tool people use all day.

---

## Orchestration and flow

**Flow** (Csikszentmihalyi) — deep, nearly meditative involvement; a "gentle euphoria," loss of time-awareness, high productivity. Design goal: **promote and protect flow; avoid anything that disrupts it.** To create flow, the interaction must become **transparent** — like good prose, the mechanics disappear and the user is left face to face with the objective. A poor interaction designer "looms with a clumsily visible presence."

**Axiom: "No matter how cool your interface is, less of it would be better."** The ultimate interface can often be *no interface*. A UI is an artifact, not the user's goal.

**Orchestration** = harmonious organization — all elements working together toward one goal. There are no fixed rules (like a harmonious musical interval, it depends on what the user is doing).

### The 14 strategies for harmonious, flow-preserving interactions

1. **Follow users' mental models** — e.g. clinicians index patients by name; billing clerks index the same bills by days-overdue. Same data, different model, different default sort.
2. **Less is more** — reduce elements without reducing capability or adding effort (Google search, iPod Shuffle, iA Writer). But beware: too much reduction creates *visual simplicity → cognitive complexity*.
3. **Let users direct rather than discuss** — don't converse via dialogs; let them act on objects.
4. **Provide choices rather than ask questions** — show selectable options in context instead of interrupting with a question.
5. **Keep necessary tools close at hand** so users don't hunt.
6. **Provide modeless feedback** — show status without stopping the user (in situ, not a modal dialog).
7. **Design for the probable, anticipate the possible** — optimize for the common case; make edge cases handleable but not prominent.
8. **Contextualize information** — present data relative to what the user cares about.
9. **Reflect object and application status** so users always know the current state.
10. **Avoid unnecessary reporting** — don't brag about routine successes or flood the user with progress they don't need.
11. **Avoid blank slates** — don't start empty; provide sensible defaults, templates, or examples.
12. **Differentiate between command and configuration** — frequent commands must be direct; rare configuration can be tucked away.
13. **Hide the ejector-seat levers** — controls that cause big, hard-to-reverse dislocation (visual reconfiguration, destructive settings) belong out of the daily path.
14. **Optimize for responsiveness but accommodate latency** — keep the common path instant; handle unavoidable delay gracefully.

**Apply:** Audit each screen against these 14. The highest-leverage moves: remove elements (2), replace modal questions with in-context choices (4), replace dialogs with direct manipulation (3), never show a blank slate (11), and push destructive/reconfiguring controls out of reach (13).

---

## Excise — eliminate the overhead

**Excise** = extra cognitive or physical work that serves the *tool or an outside agent* rather than the user's goal. (Opening the garage door serves the car, not your trip.) **Goal-directed tasks** move toward the goal; **excise tasks** are pure overhead. **Eliminate excise wherever possible** — it is a primary cause of user dissatisfaction, and implementation-model design manufactures it.

**Navigational excise.** Nearly all navigation is excise (except in games). Poorly designed navigation is one of the largest, most common usability problems, and it is where the developer's implementation model leaks through most visibly. Four kinds to minimize:
1. Among multiple screens/views/pages.
2. Among panes/frames within a screen.
3. Among tools/menus/toolbars.
4. Within a single information space (scrolling/panning/zooming).

Reduce navigation by: providing **fewer places to go**, giving **overviews and signposts**, **mapping controls to the user's goals**, and **not making users hold state in their heads**.

**Apply:** Tag every action in a flow as goal-directed or excise. Cut or automate the excise (auto-import instead of manual entry, sensible defaults instead of setup steps). Flatten navigation: fewer destinations, clear overviews, controls that map to goals, and no reliance on the user remembering where they were.

---

## Checklist

- [ ] Every flow is anchored to a persona's **end goal** written as a plain sentence — no business goal disguised as a user goal.
- [ ] Legacy tasks were re-derived from goals; tasks that only served obsolete tech were cut (St. Louis→San Francisco test).
- [ ] Each persona has ~0–2 **experience**, ~3–5 **end**, ~0–1 **life** goals. No persona lacks goals.
- [ ] The UI represents the **mental model**, not the **implementation model** (no dialog-per-module, field-per-column).
- [ ] Exactly **one primary persona** per interface; every "what about…" is classified as secondary/supplemental/customer/served/edge/negative.
- [ ] Design avoids the **elastic user**, **self-referential design**, and **edge-case-driven** design.
- [ ] No interaction makes a competent user **feel stupid** (no big irreversible mistakes, no wasted time, no boredom).
- [ ] A textual **context scenario** ("magic black box") preceded any sketching; **key-path** and **validation** scenarios followed.
- [ ] Requirements are **needs** in **object/action/context** form, traceable to research — not features or named widgets.
- [ ] Each surface's **posture** (sovereign / transient / daemonic / auxiliary) is identified and its specific design rules applied.
- [ ] Interface protects **flow**: transparent, minimal ("less of it would be better"), checked against the **14 strategies**.
- [ ] **Excise** — especially navigational excise — is identified and eliminated wherever possible.
