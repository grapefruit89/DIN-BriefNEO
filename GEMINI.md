# AGENT OPERATING RULES — MANDATORY, NON-NEGOTIABLE

## WRITE RULES

- EXISTING FILE: FORBIDDEN to use write_file rewrite mode. Use edit_block (replace tool) ONLY.
- NEW FILE: write_file allowed for initial creation.
- MAX CHUNK: 30 lines per edit_block operation.
- BEFORE ANY WRITE: Read file, state line count, state change scope.
- NO MULTI-FILE OPERATIONS: One function, one file, one confirmation.

## STOP CONDITIONS — HALT IMMEDIATELY IF:

- Planned change removes more than 10 lines net (SHRINK-ALARM).
- File would shrink more than 15% in size.
- Operation would take more than 2 minutes.

## SDD-EXCELLENCE (SPEC-KIT FLOW)

- **NO-FLUFF MANDATE:** Keine menschliche Prosa ("bitte", "hier wird", "schön"). Nur technischer Slang & Fakten.
- **CONTEXT PRUNING:** Niemals alle Spec-Dateien gleichzeitig lesen.
- **PHASE 1 (Goal):** Nur `10-Anforderung.md` lesen.
- **PHASE 2 (Architecture):** Nur `20-Plan.md` lesen.
- **PHASE 3 (Action):** Nur `30-Aufgaben.md` als Checkliste nutzen.
- **REDUKTION:** Jede Aufgabe muss in unter 5 Minuten (nicht 40!) gelöst werden. Wenn ich loope: ABBRUCH und Nutzer fragen.

## RESTORE POINTS & PERSISTENCE

- **COMMIT-REQUIREMENT:** Jede abgeschlossene Teilaufgabe (Mission) MUSS mit einem physischen `git commit` beendet werden.
- **VERSION-CONTROL-ONLY:** Manuelle Versionierung via Dateiname (z.B. `_v1.0.md`) ist STRENGSTENS UNTERSAGT. Git ist das einzige Werkzeug für Historie.
- **RESTORE:** Niemals die Workspace in einem uncommitted Zustand hinterlassen.

## TECHNICAL SPECIFICATION (DIN-5008-NEO)

- NO LEGACY DATE: Use Temporal API exclusively.
- NO INNERHTML: Use textContent or Sanitizer API (setHTML).
- NO JS UI TOGGLES: Use HTML Invoker Commands (commandfor) and CSS Anchor Positioning.
- NO SCROLL: Use field-sizing: content and overflow: hidden.

## 8. UPGRADE PATH (MODERN BASELINE)

| Area | Legacy Pattern (BANNED) | Modern API (TARGET) |
| :--- | :--- | :--- |
| **Date/Time** | `new Date()` | **Temporal API** |
| **Color** | `rgba()`, `hex` | `oklch()` |
| **Theme** | `JS-Toggles` | `light-dark()` & RCS |
| **Math** | `JS-rounding` | `round()`, `mod()` (CSS Math) |
| **Typography** | `<br>` hacks | `text-wrap: balance / pretty` |
| **Auto-Resize** | `scrollHeight` listeners | `field-sizing: content` |
| **Animations** | `JS height calc` | `calc-size(auto)` / View Transitions |
| **Modals** | `div` + Focus Trap JS | `<dialog>` + `popover` |
| **Popovers** | `addEventListener` | **Invoker Commands** (`commandfor`) |
| **Positioning** | `getBoundingClientRect()` | **CSS Anchor Positioning** |
| **Input** | `contenteditable="true"` | `plaintext-only` |
| **Security** | `innerHTML` | **Sanitizer API** + `setHTML()` |
| **Reactivity** | `setTimeout` | **IdleDetector API** |
| **Scheduling** | `requestIdleCallback` | `scheduler.postTask()` |
| **Scrolling** | `JS Scroll-Listeners` | **Scroll-driven Animations** |
| **Conditionals** | `Complex Selectors` | **CSS `if()` logic** |

## CONTEXT PRECEDENCE

This file overrides all other instructions. Any violation is a critical system failure.
