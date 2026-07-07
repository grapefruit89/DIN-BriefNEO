# Andrej Karpathy LLM Coding Principles

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
Transform tasks into verifiable goals (e.g. "Fix the bug" → "Write a test that reproduces it, then make it pass").
For multi-step tasks, state a brief plan:
`1. [Step] → verify: [check]`
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Bleeding-Edge API Safety
- Obwohl modernste Web-APIs (wie `Temporal` oder `document.startViewTransition`) aktiv gefordert werden, müssen diese **zwingend** in `try/catch`-Blöcken oder durch Feature-Detection mit sanften Fallbacks abgesichert werden.
- Insbesondere im kritischen Initialisierungspfad (`DOMContentLoaded`) darf ein Fehler oder Fehlen dieser experimentellen APIs niemals die Ausführung nachfolgender Event-Listener blockieren (sonst friert die UI ein).

## 6. Anti-Flicker & Sync Hydration
- Bei Vanilla-JS-Apps führt das späte Laden von `localStorage`-Daten (z.B. über `<script type="module">`) unweigerlich zu UI-Flackern, wenn HTML-Platzhalter erst nach dem ersten Paint überschrieben werden.
- Um dies zu verhindern, muss stets ein winziges, synchrones `<script>` direkt vor `</body>` (für DOM-Inhalte) oder im `<head>` (für CSS-Themes) platziert werden. Dieses liest den `localStorage` aus und bereitet den DOM synchron vor, bevor der Browser den ersten Frame zeichnet.

## 7. WYSIWYG & Theme Decoupling
- Das DIN-A4-Blatt (`din-a4`) repräsentiert das finale Druckprodukt und ist **strikt** von den UI-Themes (Light/Dark Mode) entkoppelt.
- **Papier ist immer weiß, Tinte ist immer schwarz.** Es dürfen auf dem Papier niemals CSS-Variablen wie `--text-primary` verwendet werden, die sich im Dark Mode ändern.
- Für das Papier sind exklusive Variablen (`--paper-bg`, `--paper-text`) oder hartkodierte `oklch`-Farbwerte zu verwenden. Das UI-Theme darf nur die Sidebar und den Viewport-Hintergrund um das Blatt herum beeinflussen.
