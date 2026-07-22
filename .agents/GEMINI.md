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

## 8. Print CSS Safety
- **Niemals** `page-break-before: always;` auf das Haupt-Container-Element (z.B. `din-a4`) anwenden. 
- Dies führt beim Drucken oder PDF-Export zwingend dazu, dass der Drucker vor dem eigentlichen Inhalt einen Seitenumbruch einfügt. Das Resultat ist ein katastrophaler Bug: Eine komplett leere erste Seite (oder leere PDF).
- Wenn die App den Viewport mit `overflow: hidden` und `height: 100vh` sperrt (um Scrollbars zu vermeiden), **muss** im `@media print` zwingend `html, body { overflow: visible !important; height: auto !important; }` gesetzt werden. Andernfalls schneidet der Drucker die PDF gnadenlos ab oder sie bleibt komplett leer.

## 9. Contenteditable DOM Integrity
- Wichtige DOM-Elemente (wie UI-Bilder, z.B. <img id="signature-image">) dürfen niemals direkt als Children in ein contenteditable="true" Element gelegt werden, wenn der Nutzer dort Text eingeben soll. 
- Sobald der Nutzer anfängt zu tippen, löscht der Browser rigoros die gesamte innere HTML-Struktur. 
- Lösung: Visuelle Elemente und editierbarer Text müssen immer als Geschwister (siblings) innerhalb eines nicht-editierbaren Wrappers isoliert werden.

## 10. Data Synchronization (Absender-Logik)
- Die automatische Synchronisation des Absenders (Info-Block) zur kleinen Rücksendezeile und zur Maschinenschrift bei der Unterschrift ist ein **unantastbares Kernfeature** zur Vermeidung von Double-Data-Entry (siehe ADR-005).
- In der Rücksendezeile wird der Vorname platzsparend als Initiale formatiert ("Moritz Baumeister" -> "M. Baumeister"), während in der Maschinenschrift der volle Name steht.
- Diese Sync-Logik darf bei UI-Refactorings niemals entfernt oder "vereinfacht" werden.

## 11. Directory Boundaries & Workspace Integrity
- Niemals wilde Ordner oder Dateien auf Root-Ebene (wie z.B. einen \docs\-Ordner direkt im Projektverzeichnis) erstellen.
- Alles hat seinen vordefinierten Platz! Sämtliche aktive Entwicklung, Dokumentation (ADRs, Guides) und Code-Dateien befinden sich STRIKT innerhalb des \ ktueller_arbeitsordner/\ Verzeichnisses. 
- Das bedeutet: Neue Dokumente, wie z.B. ADRs, gehören ausnahmslos in \ ktueller_arbeitsordner/docs/...\ und NICHT in \docs/...\ auf der obersten Projektebene.

## 12. Atomic Line Limits (Jede Zeile ist ein Atom)
- Alle `contenteditable`-Felder im DIN-Brief sind standardmäßig strikt einzeilig (wie Atome).
- Die *Enter*-Taste muss für sie blockiert und Zeilenumbrüche beim Paste-Event herausgefiltert werden.
- Zusätzlich müssen sie die `.single-line` CSS-Utility erhalten. Diese sorgt mit `text-overflow: ellipsis` für visuelle Stabilität im Layout, wechselt aber bei `:focus` intelligent auf `overflow: visible`, damit der Text beim Tippen vollständig sichtbar bleibt.
- Es gibt exakt drei Ausnahmen, die ein Whitelisting benötigen: `betreff` (max 2 Zeilen), `brieftext` (unbegrenzt) und `anlagen-text` (unbegrenzt).

## 13. Contenteditable Lists & Draft Serialization
- Strukturierte Inhalts-Elemente wie das Anlagen-Feld (`<ul>`) dürfen **niemals** über `.textContent = ''` gelöscht werden, da sonst die `<li>`-Struktur verloren geht (und damit die Bulletpoints verschwinden).
- Reset: Immer mit `replaceChildren()` und Neuerstellung der DOM-Knoten (z.B. `document.createElement('li')`).
- Speichern/Laden: Muss zwingend über `.innerHTML` serialisiert und per `.setHTML()` / `.setHTMLUnsafe()` deserialisiert werden.

## 14. Strict Paste Handling (No execCommand)
- Zum Einfügen von gefiltertem Text (z.B. nach dem Entfernen von Zeilenumbrüchen beim Paste) darf **nicht** `document.execCommand('insertText')` verwendet werden. Dies ist veraltet und wirft einen Linter-Error.
- Es muss ausschließlich die native `Selection` und `Range` API genutzt werden (z.B. `selection.deleteFromDocument()` gefolgt von `range.insertNode()`).

## 15. Strict DOM Parsing (Fitness Gate)
- `innerHTML` und `setHTMLUnsafe()` sind strikt verboten und führen zum Scheitern des Fitness Gates.
- Beim Parsen von HTML-Strings (z.B. aus JSON-Importen oder als Fallback für `setHTML`) muss zwingend ein nativer `DOMParser` in Kombination mit `replaceChildren()` verwendet werden:
  ```js
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  elem.replaceChildren(...doc.body.childNodes);
  ```

## 16. main.js Orchestrator & Dependency Injection
- `main.js` ist ein strikter, minimaler Orchestrator. 
- Geschäftslogik, komplexe Event-Listener, UI-Protections oder Dev-Tools dürfen nicht direkt in `main.js` platziert werden.
- Module sollen instanziiert und per Dependency Injection (Übergabe von Referenzen wie `draftManager` oder Callbacks wie `onSaveDraft`) gekoppelt werden, anstatt `window.*` Globals für die interne Logik zu missbrauchen.

## 17. Feature Trace Comments
- Das Fitness Gate durchsucht `main.js` nach bestimmten deklarierten Features (z.B. `document.startViewTransition`).
- Wenn solche Features in externe Module ausgelagert werden, muss ein Trace-Kommentar in `main.js` hinterlassen werden, damit der Parser nicht fehlschlägt:
  `// Feature Trace: document.startViewTransition is now handled inside settingsManager`

## 18. Numbered Domain Architecture (JS Folder)
- Neue JavaScript-Dateien dürfen **niemals** direkt im `js/`-Root-Ordner abgelegt werden (einzige Ausnahme ist `main.js`).
- Jede neue Datei muss in die passende Domäne einsortiert werden: `00-core/`, `10-ui/`, `20-features/` oder `30-utils/`.
- Dateinamen erhalten zwingend einen fortlaufenden Nummern-Präfix (z.B. `04-neues-feature.js`), um die visuelle Ordnung zu wahren.

## 19. Custom Undo/Redo History (DraftManager)
- Das native Browser-Undo (`document.execCommand('undo')`) ist fehleranfällig und darf nicht verwendet werden.
- Die App nutzt einen komplett eigenen History-Stack im `DraftManager`, der den globalen Zustand über `localStorage`-Snapshots verwaltet. 
- Wenn neue textliche oder visuelle Zustände gespeichert werden sollen, muss dies über den etablierten `saveDraft()` Flow gehen, damit das Custom-Undo (`Strg+Z` / `Strg+Y`) sauber durch die Zeitlinie navigieren kann.
- **Caret Preservation:** Ein Snapshot darf niemals nur den HTML-Text speichern, sondern muss zwingend auch den exakten Character-Offset des Cursors (`caretInfo`) erfassen. Beide Werte (`draftStr` und `caretInfo`) sind in einem einzigen, sauberen Status-Objekt (`#currentState`) zu bündeln, um Redundanzen und Synchronisationsfehler zu vermeiden.

## 20. CSS Anchor Positioning in Contenteditable (Selection Ranges)
- Wenn Popovers oder Toolbars relativ zu einer Textmarkierung (Selection Range) positioniert werden müssen, darf **nicht** versucht werden, dies durch reines CSS Anchor Positioning zu lösen, da eine Selection Range keinen `anchor-name` haben kann.
- Es **muss** zwingend ein unsichtbares Proxy-Element (z.B. `#selection-anchor`) verwendet werden, welches per JavaScript (`getBoundingClientRect()`) über die Selection gelegt wird. Das Popover ankert dann per CSS an diesem Proxy.

## 21. Semantic UI States (Aria-Attributes)
- Zur Steuerung von aktiven UI-Zuständen (z.B. aktivierte Buttons in der FormatToolbar) ist die Nutzung von `classList.add('active')` zu vermeiden.
- Stattdessen muss zwingend das native Accessibility-Attribut verwendet werden: `element.setAttribute('aria-pressed', 'true' | 'false')`.
- Das CSS-Styling erfolgt ausschließlich über den Attribut-Selektor (z.B. `button[aria-pressed="true"]`). Das garantiert perfekte Trennung von Semantik und Styling.

## 22. Standard Keyboard Shortcuts
- International etablierte Tastaturkürzel (wie `Strg+B` für Bold, `Strg+I` für Italic, `Strg+U` für Underline) sind unantastbar und dürfen niemals für andere Funktionen zweckentfremdet werden.
- Bei der Vergabe von neuen Custom-Shortcuts (z.B. für Blockquote) ist zwingend auf konfliktfreie Tasten (wie `Strg+Q`) auszuweichen.

## 23. Single Responsibility Principle (Eine Verantwortung pro Datei)
- Jede JavaScript-Datei hat genau **eine primäre Verantwortung** (z.B. eine Klasse oder ein fachlicher Modul-Fokus). Dateinamen spiegeln diese Verantwortung exakt wider (z.B. `draft-manager.js`).
- Kleine interne Helper-Funktionen innerhalb der Datei sind erlaubt, aber fachfremde Logik muss ausgelagert werden.
- Ausnahmen: `main.js` (reiner Orchestrator, der viele Module importiert und initialisiert) und Utils-Dateien (z.B. `storage.js`), die funktional verwandte, aber eigenständige Helper bündeln dürfen.

## 24. Pragmatic HTML Semantics & Accessibility
- **Strictly No Inline Styles**: Inline `style="..."` attributes are forbidden for static layout or typography. Always use semantic CSS classes (e.g., `.sidebar-options-group`, `.hidden`) defined in `layout.css` or `floating.css`. Only use inline styles for dynamically calculated JS values (like positioning offsets).
- **Native HTML5 Semantics**: Always prefer native semantic tags (`<label for="...">`, `<h3>`, `<ul>`) over generic `<div class="label">` or `<span>` wrappers. 
- **Concise Accessibility**: Every `contenteditable` block and custom `<din-...>` container must have appropriate `aria-label`s and `role`s (e.g., `role="group"`, `role="article"`). Keep aria-labels concise and non-redundant (e.g., "Straße und Hausnummer" instead of "Ihre Straße und Hausnummer").

## 25. Omnipresent Traceability Database (MCP)
- Die SQLite-Projektdatenbank (`DIN-Brief_docs.db`) wird bei jedem Build (`.\start.ps1`) neu generiert und enthält die absolut aktuellste "Ground Truth" aller Architekturentscheidungen, ADRs, Guides und Code-Metadaten.
- Da diese Datenbank über den `din_brief_sqlite` MCP-Server live angebunden ist, **muss** sie bei allen Architektur-, Dokumentations- und Code-Struktur-Fragen konsequent per SQL abgefragt werden (`tbl_concepts`, `tbl_code_entities`, etc.).
- Verlasse dich niemals nur auf veraltetes Kontextwissen oder Caching, sondern nutze die MCP-SQL-Tools, um die aktuellsten Projektrichtlinien präzise zu extrahieren.

## 26. Chrome 140-150 Bleeding-Edge Mandate (MUST-USE)
- Diese modernen Features **MÜSSEN** ab sofort als primäre Werkzeuge betrachtet und priorisiert werden (Chrome 150 Baseline):
  - **`focusgroup` (HTML)**: Für deklarative Tastaturnavigation (Pfeiltasten) in Menüs/Toolbars komplett ohne JS.
  - **`light-dark()` mit Bildern (CSS)**: Für Theme-abhängige Hintergrundbilder.
  - **CSS Gap Decorations (`column-rule-inset`, etc.)**: Zum direkten Stylen von Lücken in Grid/Flexbox (ersetzt `::before`/`::after` Hacks).
  - **`background-clip: border-area` (CSS)**: Für native Farbverlaufs- und Bild-Rahmen.
  - **`flex-wrap: balance` (CSS)**: Für das automatische Ausbalancieren von umbrechenden Flex-Items.
  - **Name-Only Container Queries (CSS)**: Für kompaktes Schreiben von `@container myName` Queries.
- Bevor du eine UI-Komponente mit JavaScript interaktiv machst (wie z.B. Pfeiltasten-Navigation), prüfe zwingend, ob eines dieser nativen HTML/CSS-Features das Problem bereits deklarativ löst!

## 27. ChromeStatus First Mandate
- Bei der Recherche nach neuen Web-Standards, CSS-Features oder HTML-APIs ist **immer als erstes chromestatus.com** zu prüfen!
- Die absolute Wahrheit für Google Chrome steht immer auf chromestatus.com. Dort muss gezielt gesucht werden: "Wann kommt das W3C Feature X?". 
- Als Antwort muss immer die exakte Version genannt werden, z.B. "Shipping in Chrome 151" oder "Behind a flag in Chrome 149".

## 28. HTML State & CSS :has() Toggle Pattern (No JS Class Toggling)
- Für globale Layout-Umschalter (z.B. Form A vs. Form B) oder das Ein-/Ausblenden von UI-Sektionen darf **niemals** Javascript verwendet werden, um CSS-Klassen (wie `classList.add('active')`) auf Wrapper-Elemente zu setzen.
- **Lösung:** Nutze native, visuell versteckte HTML-Schalter (`<input type="radio" class="sr-only">` oder `<input type="checkbox">`). Das CSS liest den Zustand nativ über den `:has()` Selektor aus (z.B. `body:has(#btn-form-a:checked) .my-element { ... }`).
- Die Schalter lassen sich nativ mit den Pfeiltasten bedienen.
- **Die einzige Rolle von Javascript** ist es, beim initialen Seitenaufbau (Anti-Flicker) den letzten Zustand aus dem `localStorage` auszulesen und den Schalter per `element.checked = true` zu setzen, sowie beim `change`-Event den neuen Zustand abzuspeichern.
