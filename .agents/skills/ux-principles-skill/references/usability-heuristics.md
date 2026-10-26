# Usability Heuristics — a review & audit instrument

*Sources: Nielsen & Molich's 10 heuristics (via Rogers, Sharp & Preece, *Interaction Design*, 6th ed.); Shneiderman's Eight Golden Rules; Norman, *The Design of Everyday Things*; W3C WCAG (POUR).*

**When to apply this.** Load this file when you are reviewing or auditing a UI — a pull request, a single screen, or an end-to-end flow — for usability and accessibility. Use the named heuristic sets below as your lens, run one of the two inspection methods, then report each finding with a severity and a concrete fix. Cite the specific heuristic or principle a finding violates; do not hand-wave.

---

## Nielsen's 10 usability heuristics

The canonical inspection checklist. Developed by Nielsen & Molich (1990), refined by Nielsen (1994) from an analysis of 249 real usability problems. Check each screen/flow against all ten.

| # | Heuristic (exact name) | Meaning (one line) | What a violation looks like in software |
|---|---|---|---|
| 1 | **Visibility of system status** | Keep users informed with appropriate, timely feedback. | A "Save" button gives no spinner/toast — user can't tell if it saved, clicks again, creates a duplicate. |
| 2 | **Match between system and the real world** | Speak the users' language; follow real-world conventions and a natural/logical order. | An error reads `ERR_0x80070005` instead of "You don't have permission to edit this file." |
| 3 | **User control and freedom** | Provide a clearly marked "emergency exit"; support **undo and redo**. | A destructive "Archive all" action has no Undo and no confirmation — one misclick is irreversible. |
| 4 | **Consistency and standards** | Same words/situations/actions mean the same thing; follow platform conventions. | "Delete", "Remove", and "Trash" used interchangeably for the same action across screens. |
| 5 | **Error prevention** | Design out error-prone conditions; confirm before committing to a risky action. | "Delete account" sits immediately next to "Save", same size/color, no confirmation. |
| 6 | **Recognition rather than recall** | Make objects, actions, and options visible; minimize memory load; keep instructions retrievable. | Step 3 of a wizard asks for a code shown only on step 1, forcing the user to memorize it. |
| 7 | **Flexibility and efficiency of use** | Accelerators (invisible to novices) speed up experts; allow tailoring of frequent actions. | No keyboard shortcuts, no bulk actions — power users must click through the same 6-step path every time. |
| 8 | **Aesthetic and minimalist design** | No irrelevant/rarely-needed information; every extra unit competes with and dilutes the relevant ones. | A dashboard crams 14 metrics, 3 banners, and 2 promos above the fold; the primary KPI is lost. |
| 9 | **Help users recognize, diagnose, and recover from errors** | Error messages in plain language, precisely stating the problem and constructively suggesting a solution. | Form submit fails with a red border but no text saying which field or why. |
| 10 | **Help and documentation** | Easy to search, focused on the user's task, concrete steps, not too large. | No inline help or tooltips on a complex config screen; docs link 404s. |

> Heuristics need tailoring for new product types (VR, games, conversational agents, mobile, IoT). 3–5 evaluators typically find ~75% of usability problems.

---

## Shneiderman's 8 golden rules

Shneiderman's Eight Golden Rules of Interface Design (mid-1980s), widely used as heuristics. Verbatim:

1. **Strive for consistency.**
2. **Seek universal usability.**
3. **Offer informative feedback.**
4. **Design dialogs to yield closure.**
5. **Prevent errors.**
6. **Permit easy reversal of actions.**
7. **Keep users in control.**
8. **Reduce short-term memory load.**

Use these alongside Nielsen's set — they overlap heavily (consistency, feedback, error prevention, reversal, control, memory load) and reinforce the same findings. "Seek universal usability" and "design dialogs to yield closure" (clear beginning/middle/end to a task sequence) are the two that add coverage Nielsen's list states less directly.

Overlap map (so you don't double-count in a report):

| Concern | Nielsen | Shneiderman |
|---|---|---|
| Consistency | #4 | 1 |
| Feedback / status | #1 | 3 |
| Error prevention | #5 | 5 |
| Undo / reversal | #3 | 6 |
| User in control | #3 | 7 |
| Memory load | #6 | 8 |
| Accessibility for all | (—) | 2 |
| Task closure | (—) | 4 |

---

## Norman's design principles (the "why")

When a heuristic is violated, Norman's principles explain the underlying cognitive cause — cite them to justify *why* something is a problem. Full treatment in [design-of-everyday-things.md](design-of-everyday-things.md).

- **Discoverability (via visibility)** — is it possible to figure out what actions are possible and where/how to perform them? Functions out of sight are hard to find and use. (Underpins heuristics 1, 6.)
- **Affordances & signifiers** — affordances are the *possible* actions; signifiers are perceivable indicators of *where* the action goes and *how*. In screen UIs, signifiers matter most — a button must *look* clickable. (Underpins 4, 6.)
- **Mapping** — the relationship between controls and their effects should exploit spatial/natural analogies (a slider up = more). Bad mapping forces users to memorize which control does what. (Underpins 2, 8.)
- **Feedback** — communicate the result of every action; must be **immediate** (≤0.1s ideal), **informative**, **prioritized**, and not excessive (too much feedback gets ignored/disabled). (Underpins 1, 9.)
- **Conceptual model** — the design must project a coherent **system image** so the user's mental model matches how the system actually works; a false model (e.g., two labels implying two independent controls that share one mechanism) guarantees errors. (Underpins 2, 4.)
- **Constraints** — physical, logical, semantic, and cultural constraints (plus forcing functions) rule out wrong actions before they happen. Graying-out, required-field validation, and interlocks are constraints. (Underpins 3, 5.)

Norman's frame for errors: treat a user action as an *approximation* of intent. Make actions reversible (undo), run sensibility checks, and never call it "human error" — if the system let the user make the error, the design is at fault.

---

## Accessibility — WCAG POUR

WCAG is the legal benchmark in many jurisdictions (ADA/Section 508, EU Equality Act, EN 301 549). Four principles — **P**erceivable, **O**perable, **U**nderstandable, **R**obust. Target **WCAG 2.1/2.2 Level AA** unless told otherwise. Convert each to engineer-checkable questions.

### Perceivable — users can sense the content
- [ ] **Text contrast ≥ 4.5:1** for normal text; **≥ 3:1** for large text (≥18pt, or ≥14pt bold) and for UI components/graphical objects/focus indicators.
- [ ] **Alt text** on all meaningful images; empty `alt=""` on decorative ones. Icons that convey meaning have accessible names.
- [ ] **Don't rely on color alone** to convey information (error state, required field, status) — pair with text, icon, or shape.
- [ ] Captions/transcripts for audio and video. Content readable without sound.
- [ ] **Reflow / zoom** — usable at 200% zoom and reflows to a 320px-wide viewport with no horizontal scrolling or lost content.

### Operable — users can navigate and act
- [ ] **Fully keyboard-operable** — every interactive element reachable and actionable with Tab/Shift-Tab/Enter/Space/arrows; no keyboard traps.
- [ ] **Visible focus indicator** on every focusable element (never `outline: none` without a replacement).
- [ ] **Touch targets ≥ 44×44 px** (Apple HIG / WCAG 2.5.5), with adequate spacing.
- [ ] Logical, predictable **focus/tab order** matching visual order; skip-to-content link for long nav.
- [ ] **No flashing** content faster than 3×/second (seizure risk).
- [ ] **Reduced motion** — honor `prefers-reduced-motion`; no essential info conveyed only by animation; auto-playing motion can be paused.

### Understandable — users can comprehend
- [ ] Plain-language labels and instructions; consistent navigation and naming across pages.
- [ ] **Error identification & suggestion** — errors named in text, tied to the field, with how to fix.
- [ ] Predictable behavior — no unexpected context change on focus or input.
- [ ] Page/document language set (`lang` attribute).

### Robust — works with assistive tech
- [ ] **Semantic HTML** — real `<button>`, `<a>`, `<nav>`, `<h1>`–`<h6>`, `<label>` before reaching for ARIA.
- [ ] **Name, role, value** exposed for every custom component (correct ARIA where semantics are missing); state changes announced.
- [ ] Valid, non-duplicated `id`s; ARIA used correctly (no broken references).

### Forms-specific checklist
- [ ] Every input has a programmatically associated **`<label>`** (not placeholder-as-label).
- [ ] Required fields marked in **text**, not color alone; `aria-required`/`required` set.
- [ ] Inline validation errors are **text**, tied to the field via `aria-describedby`, and focus moves to / announces the first error.
- [ ] Correct input types / `autocomplete` tokens; helpful, forgiving input formats (accept spaces/dashes in phone/card numbers rather than rejecting).
- [ ] Group related fields with `<fieldset>`/`<legend>`; error summary at top links to fields.
- [ ] Don't destroy user input on error — repopulate the form; never make people start over.

---

## How to run a review

Pick the method by what you're evaluating. They are complementary; for a thorough audit, do both.

### Heuristic evaluation — three stages
Best for scanning a **whole interface** broadly against the heuristic sets above. Use 3–5 evaluators for ~75% coverage (a solo agent should compensate with extra passes).
1. **Briefing session** — agree on scope, the heuristic set to apply, and the user profile/tasks.
2. **Evaluation period** — 1–2 hrs of independent inspection with **≥2 passes**: first pass for overall flow and scope, second pass to inspect specific elements against each heuristic.
3. **Debriefing session** — consolidate findings, remove duplicates/false alarms, assign severity, and propose solutions.

> Caveat: heuristic evaluation produces false alarms and misses some severe problems (studies find only ~half of flagged items are true problems). It is **not a replacement for user testing.**

### Cognitive walkthrough — three questions
Finer-grained; simulates a user's problem-solving at each step of a **specific task**. Focuses on **ease of learning** (learning by exploration). Identify typical users, sample tasks, and the correct action sequence; then at **each action** ask:
1. Will the user know **what to do** — is the correct action sufficiently evident?
2. Will the user **notice** that the correct action is available?
3. Will the user **understand the feedback** — associate/interpret the system's response correctly?

Any "no" is a finding. Use the walkthrough for critical flows (onboarding, checkout, first-run) and heuristic evaluation for breadth.

**Which to use:**
- Auditing a whole product/screen for a broad set of problems → **heuristic evaluation.**
- Auditing whether a *new user can learn a specific task* → **cognitive walkthrough.**
- Safety-critical or detailed step-by-step flows → walkthrough (finer-grained); consider a **pluralistic walkthrough** with developers + users stepping through together.
- Neither replaces observing real users; flag high-risk findings for usability testing.

---

## Ethics check — flag dark patterns

A usability audit should also flag *intentionally* user-hostile design, not just accidental friction. A "dark pattern" (Brignull) is deception by design that benefits the business at the user's expense. Report these as findings (usually severity 3–4, and often a legal/trust risk):

- [ ] **Sneak-into-basket / preselected add-ons** the user must notice and deselect.
- [ ] **Roach motel** — easy to sign up, hard to cancel/unsubscribe/delete account.
- [ ] **Confirmshaming** — guilt-worded decline option ("No, I don't want to save money").
- [ ] **Misdirection / disguised ads** — the visually dominant button is the one that benefits the business.
- [ ] **Forced continuity / hidden costs** revealed only at the last checkout step.
- [ ] **Nagging** — repeated interruptions pressuring a choice.

Rule of thumb: users should have to **opt in** to actions that benefit the company against their interests. Transparent nudging is acceptable; hidden coercion is not.

---

## Severity ratings

Rate every finding on Nielsen's **0–4 severity scale** so fixes can be prioritized:

| Rating | Label | Meaning |
|---|---|---|
| **0** | Not a usability problem | Disagree that this is a problem at all. |
| **1** | Cosmetic | Need not be fixed unless extra time is available. |
| **2** | Minor | Low priority; fixing it is a minor improvement. |
| **3** | Major | Important to fix; should be given high priority. |
| **4** | Catastrophe | Imperative to fix before release. |

**Prioritize by frequency × impact × persistence:**
- **Frequency** — how many users hit it, how often (common paths outrank edge cases).
- **Impact** — how hard it is to overcome when hit (blocks the task vs. mild friction).
- **Persistence** — one-time (users learn around it) vs. repeated (bites them every time).

A rare, low-impact, learn-once annoyance is a 1; a common, task-blocking, every-time failure (e.g., checkout button non-functional via keyboard) is a 4. Accessibility barriers that lock out a class of users should be rated **major-to-catastrophe** regardless of estimated frequency.

---

## Reporting format

Report each finding with this template:

> **Issue** → **Where** → **Heuristic/principle violated** → **Severity** → **Suggested fix**

- **Issue** — one sentence describing the problem and its user consequence.
- **Where** — exact location (screen, component, file/line if known, or steps to reach).
- **Heuristic/principle violated** — name it (e.g., "Nielsen #9", "WCAG 1.4.3 Contrast", "Norman: feedback").
- **Severity** — 0–4 with a one-line justification (frequency × impact × persistence).
- **Suggested fix** — concrete, actionable change.

**Worked example:**

> **Issue:** After submitting the sign-up form with an invalid email, the form clears all entered fields and shows only a red border on the email input with no message, so the user must re-type everything and cannot tell what was wrong.
> **Where:** `/signup` screen, submit handler (`SignupForm.tsx`), on validation failure.
> **Heuristic/principle violated:** Nielsen #9 (recognize/diagnose/recover from errors) and #3 (user control — never make people start over); Norman: feedback must be informative.
> **Severity:** **4 — Catastrophe.** High frequency (every failed submit), high impact (blocks account creation), persistent (recurs on each attempt).
> **Suggested fix:** Preserve all entered values on error; render an inline text message ("Enter a valid email, e.g. name@example.com") tied to the field via `aria-describedby`; move focus to the first invalid field. Validate email on blur to catch it earlier.

---

## Review checklist

Fast final sweep — verify each is handled before sign-off.

**States** (every view)
- [ ] Empty state — helpful, tells the user what to do next (not a blank screen).
- [ ] Loading state — skeleton/spinner; system status visible; no frozen-looking UI.
- [ ] Error state — plain-language message + recovery path; input preserved.
- [ ] Success state — confirmation/feedback that the action completed (closure).
- [ ] Edge cases — long text, zero/one/many items, slow network, offline, permissions denied.

**Feedback & status**
- [ ] Every action produces immediate, informative feedback; long operations show progress.
- [ ] Current location/state is always visible (breadcrumbs, active nav, selected state).

**Error prevention & recovery**
- [ ] Destructive actions confirmed or undoable; irreversible actions made harder to trigger.
- [ ] Validation prevents error-prone input; errors are diagnosable and recoverable.

**Consistency**
- [ ] Terminology, iconography, layout, and interaction patterns consistent across the app.
- [ ] Follows platform conventions.

**Hierarchy**
- [ ] Clear visual hierarchy; one primary action per screen; minimalist — no clutter competing with the primary content.

**Accessibility**
- [ ] Contrast, keyboard operability, visible focus, semantic markup + name/role/value, ≥44px targets, not color-alone, alt text, reduced motion, reflow/zoom — see POUR checklist above.
