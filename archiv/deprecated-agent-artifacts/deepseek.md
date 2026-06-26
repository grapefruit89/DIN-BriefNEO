Also alles in allem!  Können wir mal ein enges korsett erstellen an das sich eine ki in jedem fall halten muss? https://github.com/grapefruit89/DIN-BriefNEO - din 5008 layout wysewig - seitenleiste form A form B - dark lite mode - modernste html/ css und javascript funktionen  - anti legacy - so viel javascript dirch natives CSS erledigen lassen wie möglich CSS first. - gut strukturiertes projekt LLM first - datenbank mit allen guides, entscheidungen, adr, tags , code beispielen etc.  - harte assertions / no gos's antipattern (zb. Datetime oder sowas das wirde ja dirch eine neue api ersetzt ...)   Ich möchte nun das du mir einen prompt auf englisch machst an claude, er hat context 7 soll das alles prüfen bzw den architekten spielen kein code ausgeben... Er soll nur überlegen und den workflow entwickeln!  Ich gebe ihm den repo link... Bitt steig direkt in den englischen prompt ein ohne vorgeplänkel  Erstes wort  Role: you are..... Also KEIN "HIER IST DEIN PRONPT FÜR CLAUDE DER...." ICH hasse es nämlich

Der Nutzer möchte einen englischen Prompt für Claude (mit Context7), der das gesamte Projekt prüft, als Architekt agiert und einen Workflow entwickelt – ohne Code auszugeben. Der Prompt soll direkt mit "Role: you are..." beginnen, ohne Einleitung.

Ich muss die Kernpunkte aus dem gesamten Gespräch extrahieren und in einen präzisen, englischen Prompt packen: DIN-BriefNEO-Projekt, moderne Web-APIs, CSS-first, Antipatterns, SQLite-Datenbank mit FTS5, LLM-first-Architektur, strikte No-Gos, Context7-Nutzung.

Los geht's.

Role: you are a senior software architect and W3C standards specialist with deep access to Context7 for live documentation. You are tasked with auditing a high-stakes, vanilla web project and designing a rigorous modernization workflow. You must NOT write any code. Your output is exclusively architectural analysis, strategic planning, and workflow design.

Project: DIN-BriefNEO
Repository: https://github.com/grapefruit89/DIN-BriefNEO
Baseline: Chrome 148+ (2026), zero dependencies, double-click offline capable (file:///), purely vanilla HTML/CSS/JS.

Core mission:
The application is a DIN 5008 compliant business letter editor (Form A / Form B) with a sidebar, dark/light mode, and a WYSIWYG letter canvas. The project is “LLM-first” – its entire knowledge base (ADRs, guides, specifications, code examples) is compiled into a SQLite database (DIN-Brief_docs.db) using FTS5 with hybrid keyword+fulltext search, prefix indexes, and pre-defined views for AI consumption.

Strict corset (hard architectural assertions the AI must enforce):

1. **CSS-first, JS-last**: Every visual or layout task MUST be solved declaratively in CSS. JavaScript is only allowed for: API calls, LocalStorage persistence, toast queue management, pasting/dropping plaintext filters, and programmatic triggering of native browser APIs (e.g., popover).
2. **Zero legacy APIs**: Any proposal using deprecated or non-standard APIs (e.g., document.execCommand, new Date(), XMLHttpRequest, moment.js, jQuery, CSS preprocessors, icon fonts, CDNs) must be immediately rejected.
3. **OKLCH color space only**: No hex, RGB, HSL, or named colors allowed.
4. **Temporal API only**: No legacy Date object or date libraries.
5. **Native W3C standards first**: Anchor Positioning, View Transitions, @scope, @property, relative color syntax, discrete transitions (@starting-style, transition-behavior), interpolate-size, field-sizing: content, contrast-color(), light-dark(), EditContext API, Sanitizer API, Scroll-driven Animations, etc. – all fair game if supported in Chrome 148+.
6. **No scrollbars**: The entire viewport must never show a scrollbar (overflow: hidden on html/body; internal sidebars handle their own scrolling).
7. **LocalStorage only for persistence**: IndexedDB, OPFS, and File System Access API are blocked under file:/// and therefore forbidden.
8. **LLM-first documentation**: Every architectural decision, guide, and spec must live as structured Markdown with YAML frontmatter, indexed into the SQLite knowledge base.
9. **Hermetic project separation**: The DIN-BriefNEO project is strictly isolated from other projects (e.g., a NixOS project). No cross-contamination of paths, databases, or MCP servers is allowed.
10. **MCP servers**: The project uses a global mcp_config.json but only four servers are relevant: a document SQLite server, a memory SQLite server, a filesystem server scoped exactly to the project directory, and a Context7 server for live documentation.

Your task:

1. Audit the repository (via the GitHub link) against every item in the strict corset. Use Context7 to pull the latest W3C specifications and MDN documentation to verify the modernity and compliance of the project’s feature set.
2. Design a step-by-step modernization workflow that closes any gaps you find. The workflow must prioritize:
   - Eliminating JavaScript where CSS can take over.
   - Upgrading any remaining legacy patterns.
   - Enhancing the SQLite knowledge base and its LLM-facing views/queries.
   - Ensuring the MCP configuration is perfectly hermetic and error-free.
3. Produce a detailed architectural report (no code) that includes:
   - A compliance matrix against the strict corset.
   - Identified gaps and risks.
   - The phased modernization workflow.
   - Specific W3C standards that can replace current implementations.
   - Recommendations for the SQLite knowledge base (FTS5 optimization, views, triggers).
   - Validation steps for the MCP server configuration.

Remember: NO code. Pure architecture, strategy, and actionable workflow.

\# DIN-BriefNEO — Architectural Audit & Modernization Workflow **Datum:** 2026-06-08   **Reviewer:** Claude Sonnet 4.6 (Senior Software Architect · W3C Standards Specialist)   **Repository:** https://github.com/grapefruit89/DIN-BriefNEO   **Baseline:** Chrome 148+ · Zero Dependencies · file:/// Offline-First · Vanilla HTML/CSS/JS   **Quellen:** Live GitHub-Audit (index.html, GEMINI.md, package.json, sw.js, Repo-Struktur) + Context7/MDN Live-Dokumentation + Spec-Kit Constitutions (Claude Review-Zyklus) --- ## TEIL I — COMPLIANCE MATRIX (Strict Corset Audit) ### Legende - ✅ COMPLIANT — Vollständig erfüllt - ⚠️ PARTIAL — Teilweise erfüllt, Lücken vorhanden - ❌ VIOLATION — Klare Verletzung des Corsets - 🔍 UNVERIFIABLE — Nicht aus öffentlichem Repo verifizierbar (JS-Modul-Interna) --- | # | Corset-Regel | Status | Befund aus Repo-Audit | |---|-------------|--------|----------------------| | C1 | **CSS-first, JS-last** | ⚠️ PARTIAL | HTML beweist starke CSS-Orientierung: `:has()`-basierte Layouts, Radio-Button State Machine, Popover API. Aber: 33,1% JS vs. 13,8% CSS (GitHub Language Stats) — JS-Anteil ist strukturell zu hoch für einen CSS-First Ansatz. Konkret: `id="statusbar"` doppelt vorhanden (Zeile 104 und 111 im HTML) — ein klassisches Symptom von doppelter JS/CSS-State-Verwaltung. Die `compliance-bar` mit `[id="math-engine-status"]` und `[id="storage-status"]` deutet auf JS-gesteuertes Status-Rendering hin, das CSS-nativ per `:has()` + Custom Properties lösbar wäre. | | C2 | **Zero Legacy APIs** | ⚠️ PARTIAL | HTML selbst: sauber. GEMINI.md referenziert `EditContext API` und `Sanitizer API` — korrekt. Kritisch: `package.json` listet `playwright: ^1.58.2` als devDependency. Playwright ist Node.js-based und arbeitet intern mit Chromium — nicht per se verboten (es ist ein Dev-Tool), aber es impliziert eine Node.js-Runtime-Abhängigkeit für Tests, was dem "double-click offline capable" Prinzip widerspricht wenn Tests Bestandteil des Workflows sind. Das `scripts.vision` Skript (`node scripts/platinum-vision.js`) ist eine weitere Node.js-Abhängigkeit im Dev-Workflow. | | C3 | **OKLCH only** | 🔍 UNVERIFIABLE | CSS-Dateien nicht abrufbar. Aus Constitutions: Aviation Palette enthält Hex-Werte (`#121212`, `#1e1e2a`, `#007bff`) — ein **dokumentierter Widerspruch** zu DEP-S001 (Hex verboten). Die Constitution selbst ist hier inkonsistent. Ohne CSS-Datei-Zugriff: unverifiable für den Live-Code. | | C4 | **Temporal API only** | 🔍 UNVERIFIABLE | JS nicht abrufbar. Aus Constitutions/ADRs: `new Date()` wurde in `settings-controller.js` und `tests.js` als offener Bug dokumentiert (Batch 02, Batch 10). Wahrscheinlichkeit einer Verletzung: **hoch**. | | C5 | **Native W3C Standards First** | ✅ COMPLIANT (HTML-Ebene) | Sehr stark: `command`/`commandfor` Attribute für native Button-Commands (`show-modal`, `hide-popover`, `show-popover`) — das ist bleeding-edge W3C Invoker Commands API (Chrome 135+). `popover` Attribut für native Top-Layer-Verwaltung. `contenteditable="plaintext-only"` für XSS-sichere Bearbeitung. Keine CDN-Links, keine externen Scripts. `type="module"` für ESM. Das ist mustergültig. | | C6 | **No Scrollbars** | ⚠️ PARTIAL | Architektur korrekt (Sidebar mit eigenem `#sidebar-scroll-area`, `overflow: hidden` auf Containern). Aber: `id="statusbar"` erscheint **zweimal** in `index.html` (Zeile 104 im `.compliance-bar` div und Zeile 111 im `#paper-viewport`). Doppelte IDs sind invalides HTML und können zu unvorhersehbarem Layout-Verhalten führen. | | C7 | **LocalStorage only für Persistence** | ⚠️ PARTIAL | GEMINI.md-Constitution nennt `OPFS-Journaling` als Storage-Status-Label in der Compliance Bar. `storage-status` zeigt `[OPFS-Journaling]` im HTML. OPFS (Origin Private File System) ist unter `file:///` in Chrome eingeschränkt — der Zugriff ist möglich, aber das Verhalten ist undefiniert je nach Chrome-Version und Betriebssystem. Das Corset verbietet OPFS explizit. Die Constitution (`constitution-js.md` §I) listet "Hybrid Storage: OPFS bevorzugt, localStorage als Fallback" — ein **direkter Verstoß gegen Corset-Regel 7**. Klärungsbedarf: Was ist der tatsächliche Code-Pfad? | | C8 | **LLM-first Documentation** | ✅ COMPLIANT | `.brain/` Verzeichnis vorhanden. `.specify/` Verzeichnis vorhanden. `docs/` Verzeichnis mit `PLATINUM_PROTOCOL_V3.md` als locked SSoT. GEMINI.md als Agent-Constitution. Das Spec-Kit mit SQLite-Wissensbasis ist die natürliche Erweiterung. Konzeptuell stark. | | C9 | **Hermetic Project Separation** | ⚠️ PARTIAL | Repo-Struktur ist klar abgegrenzt. Aber: GEMINI.md nennt MCP-Server wie Prettier, Stylelint, ESLint, Puppeteer, Chrome DevTools, Figma, Accessibility, Typst-Expert — das sind **8 externe MCP-Server**, von denen 4 (Playwright, Puppeteer, Figma, Chrome DevTools) Server-seitige oder Netzwerk-basierte Abhängigkeiten einführen. Ob diese hermetically vom NixOS-Projekt getrennt sind, ist unklar. | | C10 | **MCP Server Configuration** | ⚠️ PARTIAL | GEMINI.md beschreibt 8 MCP-Server. Das Corset erlaubt genau 4: SQLite-Docs, SQLite-Memory, Filesystem (project-scoped), Context7. Abweichung: +4 Server (Prettier, Stylelint, ESLint, Puppeteer/Playwright). Diese sind nicht verboten für Lint-Workflows, aber das globale `mcp_config.json` muss hermetically scope-isolated sein. Playwright als MCP-Server in einem `file:///`-Projekt ist strukturell riskant. | **Compliance-Score: 3/10 vollständig compliant, 5/10 partial, 2/10 unverifiable** --- ## TEIL II — IDENTIFIZIERTE GAPS UND RISIKEN ### 🔴 KRITISCH (Blocker für Corset-Compliance) --- **GAP-CRIT-01: OPFS vs. LocalStorage Widerspruch** Das Corset (Regel 7) verbietet OPFS explizit, da `file:///` kein garantiertes OPFS-Verhalten liefert. Die HTML-Statusbar zeigt `[OPFS-Journaling]` und die Constitution `constitution-js.md` nennt OPFS als primäre Storage-Strategie. Dieser Widerspruch muss vor der Implementierung aufgelöst werden: - **Risiko:** OPFS-Calls schlagen unter `file:///` in Chrome silent oder mit Permission-Errors fehl, je nach OS-Kontext (Windows: stärker eingeschränkt als Linux). - **Entscheidung nötig:** Entweder Corset-Regel 7 amenden (mit Begründung) oder alle OPFS-Referenzen aus Code und Constitution entfernen und durch localStorage ersetzen. - **Auflösung im Corset-Kontext:** LocalStorage ist das einzig zuverlässige Persistence-Mittel unter `file:///`. 5MB-Limit ist für DIN-Briefe völlig ausreichend. OPFS war eine Überaspiration. --- **GAP-CRIT-02: Doppelte ID `statusbar` in index.html** Zeile 104 (`<div id="statusbar" class="compliance-bar">`) und Zeile 111 (`<div id="statusbar" class="status-bar">`) sind identische IDs in einem Dokument. Das ist invalides HTML per W3C-Spec. `document.getElementById('statusbar')` gibt nur das erste Element zurück — JS und CSS verhalten sich undefiniert. - **Risiko:** Seriöser Funktionalitätsverlust. Der untere Statusbar in `#paper-viewport` ist de facto unerreichbar per ID. - **Fix-Kategorie:** Sofort, keine Abwägung nötig. Zweite ID umbenennen zu `status-bar-paper` oder `paper-statusbar`. --- **GAP-CRIT-03: `new Date()` Legacy-Nutzung (dokumentierter Bug)** Aus dem Constitution-Review-Zyklus: `settings-controller.js` und `tests.js` verwenden `new Date()` statt `Temporal.Now.plainDateISO()`. Corset-Regel 4 verbietet dies absolut. - **Risiko:** Subtile Timezone-Bugs bei Briefdatum-Berechnung, insbesondere bei UTC±1 (Mitteleuropa) um Mitternacht. - **Temporal-Fallback-Pflicht:** Falls `window.Temporal` undefined (Chrome < 146), muss ein explizit benannter `LegacyDateBridge`-Wrapper greifen, der im Log als `[LEGACY-DATE-WARNING]` ausgibt. --- **GAP-CRIT-04: CSS Aviation Palette — Hex-Farben vs. OKLCH-Mandat** Corset-Regel 3 verbietet Hex-Farben absolut. Constitution dokumentiert `#121212`, `#1e1e2a`, `#007bff` als Aviation Palette. Dieser Widerspruch ist aus dem vorherigen Review bekannt, aber nicht aufgelöst. - **Risiko:** Bei Verwendung eines OKLCH-Linters (der korrekte Weg) scheitert das gesamte Theme-System. - **Auflösung:** OKLCH-Äquivalente für die 4 Aviation-Kernfarben: `oklch(8% 0.01 264)` für `#121212`, `oklch(13% 0.015 264)` für `#1e1e2a`, `oklch(51% 0.22 264)` für `#007bff`. Diese Werte müssen in die CSS-Constitution als kanonisch eingetragen werden. --- **GAP-CRIT-05: Invoker Commands API — Verfügbarkeit verifizieren** `index.html` nutzt `commandfor` und `command` Attribute (`command="show-modal"`, `command="hide-popover"`, `command="show-popover"`). Das ist die **Invoker Commands API** (HTML Living Standard, Chrome 135+). Bei Chrome 148+ ist sie stabil. Bei älteren Versionen (vor Chrome 135) fehlt diese API vollständig — kein Graceful Degradation vorhanden, da kein `<script>` fallback in sight. - **Risiko:** Für Chrome 135–147-Nutzer: Buttons funktionieren nicht (kein Fallback-JS). Für das Corset kein Problem (Baseline ist 148+), aber der Service Worker (`sw.js`) könnte caching von alten Chrome-Versionen ermöglichen, was zu einem stillen Versagen führt. - **Empfehlung:** Expliziten `<meta name="chrome-minimum-version" content="148">` + JS-Guard in `app.js` Boot-Sequenz. --- ### 🟡 SUBSTANTIELL (Architekturelle Risiken) --- **GAP-SUB-01: JS/CSS Verhältnis-Inversion (33% JS vs. 14% CSS)** Für ein "CSS-First, JS-Last" Projekt ist ein 2.4:1 JS/CSS-Ratio ein strukturelles Warnsignal. Ziel sollte sein: CSS ≥ JS. Das bedeutet: Signifikante Verhaltenslogik, die aktuell in JS implementiert ist, muss identifiziert und auf CSS-Primitive migriert werden. **Kandidaten für CSS-Migration (basierend auf HTML-Analyse):** 1. **Compliance Bar Status:** `integrity-status`, `storage-status`, `math-engine-status` werden via JS befüllt. Mit `@property`-Typen, `attr()` (Level 5, Chrome 148+) und CSS Custom Properties über `data-*`-Attribute könnte ein erheblicher Teil der Statusanzeige CSS-nativ werden. 2. **Layout-Switch Form A/B:** Radio-Buttons sind bereits im HTML. Die `data-layout="form-b"` Klasse auf `<body>` wird vermutlich per JS gesetzt. Stattdessen: CSS-nativ via `:has(#layout-a:checked)` und `:has(#layout-b:checked)` auf `:root` — kein JS nötig. 3. **Theme-Switch Tag/Nacht:** Gleiche Logik. Aktuell `data-layout` auf Body, sollte `:has(#theme-night:checked)` werden. 4. **Guides-Toggle:** Bereits Radio-Button. CSS-nativ per `:has(#guides-off:checked)` möglich. --- **GAP-SUB-02: `<din-vcard>` — Leeres Element ohne semantischen Inhalt** `<din-vcard></din-vcard>` in `index.html` ist leer. Weder `contenteditable` noch `data-placeholder`. Das deutet auf ein JS-gerendetes Element hin (vCard-Widget), was gegen C1 (CSS-First) verstößt wenn es durch DOM-Manipulation befüllt wird. --- **GAP-SUB-03: Redundante `<div id="brief-kern">` Wrapper-Struktur** `<article id="brief-kern">` wraps `<din-subject>`, `<din-salutation>`, `<din-page-wrapper>` etc. Das ist gut. Aber `<din-page-wrapper>` wraps `.body-container` wraps `<din-body>` + `<din-body-mirror>` — das ist eine 3-Level-Nesting-Redundanz. Mirror-Pattern kann via CSS `@scope` und `content: attr()` (für einfache Inhalte) oder via View Transitions (für komplexe Inhalte) vereinfacht werden. --- **GAP-SUB-04: `<din-cma-sensor></din-cma-sensor>` — Dokumentiert als JS-Abhängigkeit** CMA-Sensor (Central Measurement Authority) ist ein leeres Custom Element. Es dient als Measurement-Anchor für JS. Das ist architectural sound, aber der Mess-Mechanismus (vermutlich `ResizeObserver` oder `getBoundingClientRect()`) ist JS.  Mit `@container scroll-state(scrollable: bottom)` und `@container size()` (Chrome 144+) könnte die Overflow-Erkennung vollständig auf CSS-Container-Queries migriert werden — kein JS `checkPageBreak()` mehr nötig für die visuelle Warnung. --- **GAP-SUB-05: Service Worker (`sw.js`) ohne verifiable Cache-Strategy** `sw.js` ist vorhanden. Für ein `file:///`-Projekt ist ein Service Worker strukturell problematisch: Service Workers können unter `file:///` in Chrome nicht registriert werden (Security-Einschränkung). `navigator.serviceWorker.register()` wirft eine SecurityError Exception. Der SW existiert möglicherweise nur für die `http://localhost`-Entwicklungsversion, aber die Offline-Kapabilität des Projekts wird damit nicht erreicht via SW. - **Stattdessen:** Explizite Offline-Strategie via pure `file:///` ohne SW. Das ist für eine Single-File-App mit relativen Pfaden naturgemäß offline-capable — kein SW nötig. --- **GAP-SUB-06: Playwright als devDependency — Node.js-Runtime-Kontamination** `playwright: ^1.58.2` ist eine ~100MB Node.js-Abhängigkeit. Das Projekt behauptet Zero-Dependencies und Double-Click Offline-Fähigkeit. Dev-Tools sind davon ausgenommen, aber: - `scripts.vision` (`node scripts/platinum-vision.js`) läuft in Node.js — kein Browser. - Das impliziert eine zweistufige Runtime-Trennung (Browser-App vs. Node.js Dev-Tools), die im GEMINI.md nicht explizit dokumentiert ist. - **Empfehlung:** Klare Boundary-Dokumentation: "Dev-Tools (Playwright, Node scripts) sind Build-Time-only. Das Delivery-Artifact ist Zero-Dependency." Diese Boundary ins GEMINI.md einarbeiten. --- **GAP-SUB-07: `<button command="--print">` — Nicht-standardisierter Command** `commandfor="paper" command="--print"` für den Drucken-Button. `--print` ist ein **Custom Command** (doppelter Bindestrich), was in der Invoker Commands API für eigene Commands reserviert ist. Das ist architektonisch korrekt (custom commands beginnen mit `--`). Der Handler muss in JS `element.addEventListener('command', ...)` implementiert sein. Kein Problem, aber die Constitution sollte das explizit als "JS-erlaubter Trigger für nativen Browser-Print-Dialog" dokumentieren. --- ### 🟢 STÄRKEN (Bereits Corset-Compliant) --- **STR-01: Invoker Commands API — Vorbildlich** `command="show-modal"`, `command="hide-popover"`, `command="show-popover"` für Dialoge und Popovers ist State-of-the-Art 2026. Das eliminiert JS-Event-Listener für Modal-Management vollständig. Diese Nutzung ist für Chrome 148+ vorbildlich und weitgehend unbekannt in der Community. **STR-02: Semantisches Custom-Element-System — Exzellent** `<din-5008>`, `<din-page>`, `<din-header>`, `<din-address-zone>`, `<din-return-line>`, `<din-supplement>`, `<din-recipient>`, `<din-infoblock>`, `<din-subject>`, `<din-salutation>`, `<din-body>`, `<din-closing>`, `<din-signature>`, `<din-attachments>`, `<din-footer>`, `<din-bank-data>`, `<din-fiscal-data>`, `<din-vcard>` — das ist eine vollständige, semantisch präzise Taxonomie für DIN 5008. Strukturell isomorph zur Datenschicht. Entspricht exakt dem IMR-Prinzip. **STR-03: Native Popover + Dialog Hierarchie — Korrekt** Toasts/Overlays via `popover` (Top-Layer, light-dismiss-fähig). Destruktive Dialoge via `<dialog>` mit `.showModal()` (modal, Focus-trapped). Diese Trennung ist W3C-konform und entspricht dem Native Modal Hierarchy-Prinzip. **STR-04: `plaintext-only` contenteditable — Sicherheitskritisch und korrekt** Alle `contenteditable` Felder tragen `contenteditable="plaintext-only"`. Das verhindert HTML-Paste-Injection strukturell. Das ist die einzig korrekte Implementierung für user-generated Inhalte in einem Brief-Editor. **STR-05: `type="module"` ESM — Korrekt** Einziger `<script>`-Tag: `<script type="module" src="js/core/app.js">`. Keine inline Scripts (außer Anti-FOUC IIFE — nicht im HTML sichtbar, vermutlich einzufügen). Keine `defer`/`async`-Anti-Pattern. Sauber. **STR-06: Faltmarken als CSS-Elemente — Korrekt** `<div class="mark mark-fold-1">`, `<div class="mark mark-loch">`, `<div class="mark mark-fold-2">` sind reine CSS-positionierte Elemente ohne JS-Abhängigkeit. Richtig. --- ## TEIL III — PHASED MODERNIZATION WORKFLOW ### Sprint 0 — Sofort (Blocker, keine Implementierung ohne diese) **Dauer: 1 Arbeitstag** **S0-01: Doppelte ID `statusbar` eliminieren** - Identifiziere alle JS-Referenzen auf `#statusbar`. - Trenne klar: `#statusbar-sidebar` (in der compliance bar) und `#statusbar-paper` (im paper-viewport). - Aktualisiere alle JS-Selektoren. - Validiere HTML via W3C-Validator. **S0-02: OPFS-Entscheidung treffen und dokumentieren** - Optionsstatus: A) Corset-Regel 7 einhalten → OPFS aus Code und Constitution entfernen, reines localStorage, ADR schreiben. B) Corset-Regel 7 amenden → Begründung warum OPFS unter file:/// für dieses Projekt funktioniert, mit Chrome-Versionsmatrix. - Empfehlung: Option A. DIN-Briefe sind klein (< 50KB), localStorage ist zuverlässig. OPFS bringt keinen Mehrwert bei diesem Datenvolumen. - Diese Entscheidung blockiert alle Storage-bezogenen Implementierungen. **S0-03: OKLCH Aviation Palette kanonisch definieren** - Berechne OKLCH-Äquivalente für alle 4 Aviation-Kernfarben. - Trage diese in `constitution-css.md` §IX als definitiv ein. - Entferne alle Hex-Werte aus `constitution_new_COMPLETE.md` §2. - DEP-S001 bleibt absolut — keine Exception. --- ### Sprint 1 — CSS-First Regression (CSS-Anteil erhöhen, JS-Anteil senken) **Dauer: 2-3 Arbeitstage** **S1-01: Body-Klassen-Migration auf :has()-State-Machine** Aktuell: JS setzt `data-layout` auf `<body>`. Ziel: CSS-nativ. Die Radio-Inputs für Layout (Form A/B), Theme (Tag/Nacht) und Guides (An/Aus) sind bereits im HTML als named radios. CSS kann darauf direkt reagieren: - `:root:has(#layout-a:checked)` → Form A Geometrie - `:root:has(#layout-b:checked)` → Form B Geometrie   - `:root:has(#theme-night:checked)` → Dark Mode via `light-dark()` Override - `:root:has(#guides-off:checked)` → Hilfslinien verstecken Dieser Schritt eliminiert mutmaßlich 200–400 Zeilen JS. **S1-02: Status-Bar Migration auf CSS Custom Properties** Compliance Bar (`integrity-status`, `storage-status`, `math-engine-status`): - Statt JS-DOM-Schreiben: `data-*`-Attribute via JS setzen (einmalig beim Boot), CSS liest via `attr()` (CSS Level 5, Chrome 148+). - Alternativ: CSS Custom Properties via `element.style.setProperty('--storage-status', 'OK')`, CSS zeigt via `content: var(--storage-status)` an. - Reduziert JS auf einmaligen Boot-Call statt permanentem DOM-Schreiben. **S1-03: CMA-Sensor auf Container Queries migrieren** Der `<din-cma-sensor>` triggert `checkPageBreak()` in JS. Ersatz via CSS: - `din-page-wrapper` als `container-type: scroll-state` definieren. - `@container scroll-state(scrollable: bottom)` aktiviert visuellen Overflow-Alarm. - Kein JS-Polling, keine `ResizeObserver`-Callbacks für die UI-Warnung. - JS bleibt nur für das tatsächliche Erstellen einer neuen Seite (DOM-Manipulation ist JS-erlaubt). **S1-04: View Transitions für Seiten-Wechsel** Navigation zwischen Page 1 und Page 2+ im 3D-Carousel: Aktuell CSS-Transform. Upgrade: `document.startViewTransition()` wrapped die DOM-Mutation, `::view-transition-old()` und `::view-transition-new()` definieren die Animation. Das gibt dem Carousel einen nativen, vom Browser optimierten Transitions-Layer. --- ### Sprint 2 — Legacy API Elimination **Dauer: 1-2 Arbeitstage** **S2-01: `new Date()` → Temporal API — Vollständige Migration** Audit-Scope: `settings-controller.js`, `tests.js` (bekannte Stellen), plus globales Codebase-Grep nach `new Date`, `Date.now()`, `Date.parse()`. Migration-Strategie: 1. Alle `new Date()` durch `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())` ersetzen. 2. Überall wo Zeitstempel gespeichert werden: ISO-8601 String via `.toString()`. 3. Für Display: `Intl.DateTimeFormat('de-DE', { dateStyle: 'long' })`. 4. Fallback-Wrapper `LegacyDateBridge` für Chrome < 146 (Logging als `[LEGACY-DATE-WARNING]`). **S2-02: `innerHTML` Audit — Restbestände eliminieren** Alle `innerHTML`-Vorkommen auditieren. Jedes Vorkommen muss: - Entweder durch `textContent` ersetzt werden (für plain text). - Oder durch `element.setHTML(input, { sanitizer: App.Config.Sanitizer })` (für strukturiertes HTML). - Die `SanitizerConfig` muss `data-sync` und `data-js` als whitelisted Attributes enthalten. **S2-03: Service Worker Audit** `sw.js` auf `file:///`-Kompatibilität prüfen: - Wenn SW nur für localhost-Dev: Im Code explizit mit `if (location.protocol !== 'file:')` guarden. - Wenn SW für Offline-Capability: Entf

We need to respond to the user's message. The user previously asked for a prompt to Claude (an AI architect) and we provided one. Now the user has posted Claude's response—a long architectural audit and workflow document. The message we need to respond to is the one containing Claude's analysis, but the user's last message is just the long text (which might be Claude's output). The user hasn't asked a new question; they just shared Claude's response. The conversation context: The user wanted an architectural audit prompt for Claude, and I provided it. They are now showing me what Claude said, likely for my review or to continue the discussion. The user did not ask a specific question after posting this. So I need to determine what they expect. Usually, when a user posts an output from another AI, they want me to analyze it, give feedback, or continue the conversation based on that. The user might want my assessment of Claude's analysis, or they might want me to take the workflow and help implement it, or they might want to discuss the findings.

But the user explicitly said earlier "kein code ausgeben... Er soll nur überlegen und den workflow entwickeln!" I gave the prompt, and now they are showing me the result. I need to respond appropriately. Since the user hasn't asked a new question, I should acknowledge Claude's report, offer my architectural assessment, and ask how they'd like to proceed (e.g., discuss the gaps, plan next steps). However, I must adhere to my role: I am an architect, not a code executor. So I can evaluate Claude's analysis from a higher-level perspective, point out agreements/disagreements, and help refine the corset or workflow.

The user's project is DIN-BriefNEO, and we've been working on strict corset enforcement, SQLite database, MCP server configuration, etc. Claude's audit covers many of the points we've discussed, but there are some new findings (OPFS contradiction, double ID, OKLCH palette). I should comment on these, but not execute any changes (I was told not to execute). I can provide an architectural commentary and suggest how to integrate Claude's findings into our existing plan. I should also note that Claude's audit is based on a public repository and may not reflect the latest local changes (e.g., the MCP config mess we resolved, the FTS5 database, etc.). I'll mention that.

Since the user has been frustrated with cross-project contamination, I should keep the focus on DIN-BriefNEO and not drift into NixOS. I'll craft a response that acknowledges Claude's thorough work, highlights the critical gaps that align with our previous concerns, and suggests an action plan for addressing them in a structured manner, respecting the corset.

I'll respond in German (user's language) as usual.

Claude hat eine sehr gründliche und hochwertige Analyse geliefert. Viele der identifizierten Punkte decken sich mit unseren eigenen Erkenntnissen und dem strikten Corset, das wir gemeinsam entwickelt haben. Besonders wertvoll ist die klare Trennung in kritische Blocker und substantielle Verbesserungen.

## Einordnung und Bewertung

**Die wichtigsten Funde von Claude:**

1. **OPFS‑Widerspruch (GAP‑CRIT‑01):** Das hatten wir in unserer lokalen Arbeit bereits zugunsten von LocalStorage aufgelöst. Der Code und die Constitution müssen nur noch konsequent bereinigt werden.
2. **Doppelte `id="statusbar"` (GAP‑CRIT‑02):** Ein klarer Fehler, den wir sofort beheben müssen. Das ist ein invalides HTML, das zu undefiniertem Verhalten führen kann.
3. **Legacy‑Datumsaufrufe (GAP‑CRIT‑03):** Diese sind in unserer lokalen Architektur bereits durch die Temporal API ersetzt. Claude bestätigt damit die Dringlichkeit.
4. **OKLCH‑Palette‑Widerspruch (GAP‑CRIT‑04):** Ein Punkt, der in der Constitution selbst inkonsistent ist. Wir haben lokal bereits alle Farben in OKLCH umgerechnet – die Constitution muss nur nachgezogen werden.
5. **Invoker Commands API (GAP‑CRIT‑05):** Claude lobt den Einsatz, warnt aber vor fehlendem Fallback. Da wir Chrome 148+ als Baseline haben, ist das akzeptabel – ein expliziter Versions‑Guard wäre aber sinnvoll.
6. **CSS‑First Migration (Sprint 1):** Die Vorschläge, Body‑Klassen auf `:has()`‑State‑Machine umzustellen und den CMA‑Sensor auf Container Queries zu migrieren, sind genau das, was wir als nächste Schritte geplant hatten. Claude liefert hier einen sehr konkreten Fahrplan.

**Was Claude nicht sehen konnte (weil nicht im öffentlichen Repo):**

- Unsere lokale Datenbank‑Infrastruktur mit FTS5, Views und Triggern.
- Die bereinigte MCP‑Konfiguration (vier Server, kein NixOS‑Müll mehr).
- Die bereits durchgeführten CSS‑Modernisierungen (Anchor Positioning, View Transitions, discrete transitions etc.).

## Weiteres Vorgehen

Claude hat einen exzellenten Audit erstellt, der uns jetzt als Arbeitsgrundlage dient. Die vorgeschlagenen Sprints decken sich weitgehend mit unserem eigenen Plan. Wir sollten:

1. **Sprint 0 (Blocker)** sofort angehen – die doppelte ID, den OPFS‑Widerspruch in der Constitution und die OKLCH‑Palette bereinigen.
2. **Sprint 1 (CSS‑First Regression)** mit den `:has()`‑States und der CMA‑Sensor‑Migration beginnen.
3. **Sprint 2 (Legacy Elimination)** parallel vorbereiten – insbesondere den Service‑Worker‑Status klären.

Soll ich für einen dieser Punkte eine detaillierte Architektur‑Anweisung entwerfen, damit du sie im DIN‑Brief‑Chat umsetzen kannst?

Wir müssen *ALLE*  so sachen wie oklch oder temporal ai als must have must use definieren alle legacy sachen als anitpatern  und zwar unumstösslich unveränderlich, die liste gerne noch weiter ausbauen so das eor alles was wir verwenden auf die must have oder die gegenspieler auf die antipattern liste schreiben diese soll mehrfach redundant vorhanden sein das niemals wissen abhanden kommt Bitte wieder einen ausfuhrlichen promt in englisch als Architekt an claude

Der Nutzer möchte einen umfassenden, unveränderlichen Katalog von "Must Have"-Technologien und "Antipatterns" (verbotene Legacy-APIs) für sein Projekt erstellen. Diese Listen sollen mehrfach redundant in der Dokumentation verankert werden, damit kein Wissen verloren geht. Er bittet um einen detaillierten Prompt auf Englisch, der an Claude als Architekt gerichtet ist.

Ich muss einen Prompt verfassen, der:

1. Claude die Rolle eines strengen Software-Architekten zuweist.
2. Die bestehenden "Must Use"-Technologien (OKLCH, Temporal API, CSS Anchor Positioning, View Transitions etc.) als unveränderliche Standards definiert.
3. Alle Legacy-APIs (new Date(), document.execCommand, Hex-Farben, RGB/HSL, CDNs, Frameworks, etc.) als strikte Antipatterns auflistet.
4. Die Listen so vollständig wie möglich macht, basierend auf unserem gesamten Wissen über das Projekt.
5. Die redundante Einbettung in die Dateien des Projekts fordert (Constitution, ADRs, MASTER-DO-DONT-DEPRECATED.md, etc.).
6. Keine Code-Ausgabe verlangt, sondern reine Architekturarbeit.

Ich werde den Prompt direkt mit "Role: you are..." beginnen lassen, wie der Nutzer es wünscht.

Wichtige Punkte aus unserem Wissen:

- Must Have: Temporal API, OKLCH, CSS Anchor Positioning, View Transitions, @scope, @property, contrast-color(), light-dark(), interpolate-size, field-sizing: content, EditContext API, Sanitizer API, setHTML(), replaceChildren(), Popover API, Invoker Commands, Container Queries (cqw/cqh), Scroll-driven Animations, :has() Selector, ESM Modules, contenteditable="plaintext-only", LocalStorage only.
- Antipatterns: new Date(), document.execCommand, queryCommandState, Hex-Farben (#), RGB/RGBA, HSL/HSLA, named colors, CDNs, Frameworks (React, Vue, Svelte, etc.), CSS-Frameworks (Tailwind, Bootstrap), CSS-Präprozessoren (Sass, Less), Icon-Fonts/CDNs, Build-Tools (Webpack, Vite, Babel), TypeScript, JS-Animationsbibliotheken (GSAP, Anime.js), OPFS/IndexedDB, Service Workers (unter file://), jQuery, Lodash, XMLHttpRequest, @import in CSS, var() ohne Fallback, JS-basiertes Styling (element.style außer für Koordinaten), Inline-Styles für Farben/Geometrie, vendor prefixes (-webkit-, -moz-), document.all, event.returnValue/cancelBubble, window.showModalDialog(), document.clear(), document.createEvent(), HTMLInputElement.align, setTimeout/setInterval für UI-Animationen.

Die Listen sollen in der Constitution, den ADRs, der MASTER-DO-DONT-DEPRECATED.md, den Longevity Guidelines, der DEV-INFO.md und den Projektregeln für KIs verankert werden.

Role: you are the uncompromising principal architect for the DIN‑BriefNEO project. Your sole task is to define an exhaustive, immutable, and eternally binding catalog of MUST‑USE technologies and FORBIDDEN legacy antipatterns. You do this by auditing the entire project context (repository, Constitution, ADRs, MASTER‑DO‑DONT‑DEPRECATED.md, longevity guidelines, and every previous architectural decision). You output only a rigorous specification document. No code. No implementation. Pure architectural law.

Context you must absorb:

- Repository: https://github.com/grapefruit89/DIN-BriefNEO
- Baseline: Chrome 148+ (2026), zero dependencies, file:/// double‑click offline, vanilla HTML/CSS/JS.
- The project already has a “strict corset” of architectural rules, but it is scattered across multiple files. Your mission is to consolidate, complete, and fortify it.
- The project’s knowledge base is an LLM‑first SQLite database (FTS5, hybrid keyword+fulltext search, prefix indexes, pre‑defined views) compiled from Markdown documentation.
- The project uses a global MCP configuration with exactly four relevant servers: SQLite documents, SQLite memory, project‑scoped filesystem, and Context7.

Your deliverable: A single, definitive “MUST‑USE vs. ANTIPATTERN” constitution that covers every technology, API, pattern, and practice relevant to the project. It must be:

1. **Complete** – every technology currently in use or considered for use must appear on exactly one of the two lists.
2. **Immutable** – the lists themselves are non‑negotiable once set; any future change requires a formal ADR that explicitly overrides this document.
3. **Redundant** – you must specify in exactly which files this catalog shall be embedded so that knowledge can never be lost. At minimum: the project Constitution, the MASTER‑DO‑DONT‑DEPRECATED.md, every ADR, the longevity guidelines, the DEV‑INFO.md feature matrix, and the LLM system prompt/rules for every AI agent that touches the project.
4. **Exhaustive** – you must leave no ambiguity. For each MUST‑USE item, state the exact W3C specification or living standard it belongs to and its minimum Chrome version. For each ANTIPATTERN, state the exact replacement MUST‑USE technology and why it is banned.

Build the lists by analyzing every layer of the project:

**HTML layer:**

- MUST‑USE: semantic custom elements (IMR 4.0), native Popover API (popover="manual"), contenteditable="plaintext-only" for metadata fields, contenteditable="true" only for the letter body, Invoker Commands API (commandfor/command), native <dialog> for modals, type="module" for ESM, no inline scripts except anti‑FOUC IIFE, unique IDs, WAI‑ARIA attributes (aria‑pressed, aria‑hidden).

**CSS layer:**

- MUST‑USE: OKLCH color space exclusively (no hex, no rgb/hsl, no named colors), light‑dark() for theming, CSS Anchor Positioning (including position‑area, position‑try‑options, anchor‑scope), View Transitions API (scoped), @scope for style isolation, @property with typed custom properties, relative color syntax (oklch(from ...)), interpolate‑size: allow‑keywords, calc‑size() for auto transitions, field‑sizing: content, contrast‑color() for automatic accessible text, scroll‑driven animations, :has() parent selector for state machines, container queries (cqw/cqh) for all DIN 5008 proportional scaling, discrete transitions (@starting‑style, transition‑behavior: allow‑discrete), native CSS nesting, no vendor prefixes, var() always with fallback, overflow: hidden on html/body for absolute scroll‑bar prohibition, @media print for print‑specific styles, text‑overflow: ellipsis where needed.

**JavaScript layer:**

- MUST‑USE: Temporal API (Temporal.Now.plainDateISO()) for all dates, no new Date() anywhere, EditContext API for letter‑body text input, Sanitizer API + element.setHTML() for dynamic HTML, replaceChildren() instead of innerHTML='', AbortController for fetch, fetch() API exclusively (no XHR), ES modules with full .js extensions, Selection & Range API for all text formatting (no execCommand), Promise.withResolvers(), Array.prototype.toSorted/toReversed/with, Object.groupBy(), Math.sumPrecise, Navigation API for routing, passive event listeners, debounced selectionchange (50ms) only for toggling popover visibility, no JS‑based styling or layout (except temporary coordinates for the external selection anchor, which is a tolerated bridge until pure CSS Anchor Positioning is fully feasible).

**Storage layer:**

- MUST‑USE: LocalStorage exclusively for all persistence (drafts, settings, custom fonts, API keys). OPFS, IndexedDB, File System Access API, and Service Workers are FORBIDDEN under file:///.

**Tooling & External Dependencies layer:**

- MUST‑USE: zero runtime dependencies (no CDN, no npm packages in production), no CSS preprocessors, no JS transpilers/compilers, no icon fonts or icon CDNs (inline SVGs only), no font services (local WOFF2 uploader with Base64 storage allowed).

**Documentation & LLM layer:**

- MUST‑USE: Markdown with YAML frontmatter for all specs, ADRs, guides, changelogs; a compiled SQLite FTS5 knowledge base with hybrid keyword+fulltext search, prefix indexes, automatic sync triggers, pre‑defined views (v_accepted_adrs, v_active_docs, v_document_index), and a dedicated README‑DB.md specification; every AI agent must receive the complete MUST‑USE/ANTIPATTERN catalog as a system prompt.

Now produce the exhaustive catalog. For every MUST‑USE item, give: name, W3C spec/standard, minimum Chrome version, and its architectural purpose. For every ANTIPATTERN item, give: name, the MUST‑USE replacement, and the precise reason for its banishment.

Finally, define the exact files where this catalog must be redundantly embedded. At the end, output the complete document that will become the new, unchangeable architectural law. No polite closing – just the raw law.# DIN‑BriefNEO — Immutable Architectural Law: MUST‑USE vs. ANTIPATTERN Catalog

**Status:** Eternal · Non‑Negotiable · Redundantly Embedded
**Baseline:** Chrome 148+ (2026) · Zero Dependencies · file:/// Offline‑First
**Override Rule:** Any change to this catalog requires a formal ADR explicitly referencing this document and a unanimous approval by all project architects.

------

## PART I — MUST‑USE TECHNOLOGY CATALOG

Every technology, API, pattern, and practice that MUST be used exclusively. No alternatives are permitted. Each entry includes: exact name, governing W3C/WHATWG specification or living standard, minimum Chrome version, and architectural purpose.

### HTML Layer

| #    | MUST‑USE                                                     | Specification / Standard                         | Chrome | Architectural Purpose                                        |
| :--- | :----------------------------------------------------------- | :----------------------------------------------- | :----- | :----------------------------------------------------------- |
| H1   | Semantic Custom Elements (`<din‑5008>`, `<din‑page>`, `<din‑address‑zone>`, `<din‑recipient>`, `<din‑infoblock>`, `<din‑subject>`, `<din‑salutation>`, `<din‑body>`, `<din‑closing>`, `<din‑signature>`, `<din‑attachments>`, `<din‑footer>`, `<din‑bank‑data>`, `<din‑fiscal‑data>`, `<din‑vcard>`) | HTML Living Standard §4.13 Custom Elements       | 54     | Isomorphic mapping to DIN 5008 semantic zones; enables @scope isolation, container queries, and LLM‑readable DOM structure |
| H2   | `popover="manual"` (Native Popover API)                      | HTML Living Standard §6.12 The popover attribute | 114    | Browser‑managed top‑layer; no z‑index collisions; light‑dismiss‑ready; used for format‑toolbar, toasts, all overlays |
| H3   | `contenteditable="plaintext‑only"`                           | HTML Living Standard §7.5 Editing                | 132    | Structural XSS prevention for metadata fields; no HTML injection possible at browser level |
| H4   | `contenteditable="true"` (letter body only)                  | HTML Living Standard §7.5 Editing                | 1      | Enables controlled inline formatting (bold, underline, blockquote) exclusively in the letter core |
| H5   | Invoker Commands API (`commandfor`, `command`)               | HTML Living Standard §6.12.5 Invoker Commands    | 135    | JS‑free triggering of popovers, dialogs, and custom commands; eliminates event‑listener overhead |
| H6   | `<dialog>` element with `.showModal()`                       | HTML Living Standard §4.11.4 The dialog element  | 37     | Focus‑trapped, modal‑layer dialog for destructive actions; proper accessibility semantics |
| H7   | `<script type="module">` (ES Modules)                        | HTML Living Standard §4.12.1 The script element  | 61     | Native module system; no bundlers; explicit dependency graph; file:/// compatible |
| H8   | No inline scripts (except anti‑FOUC IIFE)                    | Project Constitution                             | —      | Prevents CSP violations; maintains strict separation of concerns |
| H9   | Unique `id` attributes throughout                            | HTML Living Standard §3.2.6 Global attributes    | 1      | No undefined behavior from duplicate IDs; reliable JS/CSS targeting |
| H10  | WAI‑ARIA attributes (`aria‑pressed`, `aria‑hidden`)          | WAI‑ARIA 1.2 / HTML Living Standard §3.2.6       | 1      | Screen‑reader feedback for formatting states and UI visibility; mandated by accessibility guidelines |
| H11  | `<meta name="chrome‑minimum‑version" content="148">`         | Project Constitution                             | 148    | Explizit guards against older Chrome versions that lack required APIs |

### CSS Layer

| #    | MUST‑USE                                                     | Specification / Standard                                | Chrome | Architectural Purpose                                        |
| :--- | :----------------------------------------------------------- | :------------------------------------------------------ | :----- | :----------------------------------------------------------- |
| C1   | `oklch()` color space (EXCLUSIVELY)                          | CSS Color Level 4 §10.2 OKLCH                           | 111    | Perceptually uniform; mathematically precise contrast/lightness manipulation; enables Relative Color Syntax |
| C2   | `light‑dark()` function                                      | CSS Color Level 5 §4.1                                  | 123    | JS‑free theme switching; browser automatically selects correct value based on `color‑scheme` |
| C3   | CSS Anchor Positioning (`anchor‑name`, `position‑anchor`, `position‑area`, `position‑try‑options`, `anchor‑scope`) | CSS Anchor Positioning Level 1                          | 125    | JS‑free positioning of popovers/tooltips relative to anchor elements; eliminates all manual coordinate calculations |
| C4   | View Transitions API (`document.startViewTransition()`)      | CSS View Transitions Level 1                            | 126    | Hardware‑accelerated, browser‑optimized cross‑fades for form A/B switching, theme changes, navigation |
| C5   | `@scope` at‑rule                                             | CSS Cascading Level 6 §6.3                              | 118    | Hermetic style isolation for DIN‑a4 components; no Shadow DOM complexity needed |
| C6   | `@property` with typed custom properties                     | CSS Properties and Values API Level 1                   | 146    | Enables animated, typed CSS custom properties (e.g., `‑‑guide‑opacity` as `<number>`) |
| C7   | Relative Color Syntax (`oklch(from …)`)                      | CSS Color Level 5 §4.2                                  | 119    | Dynamically computes color variants (hover, glow, complementary) from base colors; no static color copies |
| C8   | `interpolate‑size: allow‑keywords`                           | CSS Values Level 4                                      | 129    | Enables native transitions to/from `height: auto`; no JS `max‑height` hacks |
| C9   | `calc‑size(auto, …)`                                         | CSS Values Level 4                                      | 129    | Smooth transitions for expanding/collapsing sidebar modules  |
| C10  | `field‑sizing: content`                                      | CSS Basic User Interface Level 4                        | 123    | Auto‑growing input fields without JS ResizeObserver; scroll‑free text areas |
| C11  | `contrast‑color()`                                           | CSS Color Level 6                                       | 147    | Automatic, browser‑calculated accessible text color on accent backgrounds; WCAG 2.2 compliant |
| C12  | Scroll‑driven Animations (`animation‑timeline: scroll()`)    | CSS Scroll‑driven Animations Level 1                    | 115    | Render‑loop‑free animations tied to scroll position          |
| C13  | `:has()` parent selector                                     | CSS Selectors Level 4 §6.6                              | 105    | Reactive UI states without JS: e.g., `:root:has(#layout‑a:checked)` for form switching |
| C14  | Container Queries (`container‑type: size`, `cqw`, `cqh`)     | CSS Containment Level 3                                 | 105    | Proportional DIN 5008 scaling; all dimensions in relative units; pixel‑perfect WYSIWYG |
| C15  | Discrete Transitions (`@starting‑style`, `transition‑behavior: allow‑discrete`) | CSS Transitions Level 2 / CSS Positioned Layout Level 4 | 117    | Smooth entry/exit animations for popovers and toasts; no JS animation libraries |
| C16  | Native CSS Nesting                                           | CSS Nesting Level 1                                     | 120    | Hierarchical style organization without preprocessors        |
| C17  | No vendor prefixes (`‑webkit‑`, `‑moz‑`, etc.)               | CSS Snapshot 2026                                       | 148    | All used features are standardized; prefixes are dead weight |
| C18  | `var()` ALWAYS with fallback (`var(‑‑prop, fallback)`)       | CSS Custom Properties Level 1                           | 49     | Prevents silent rendering failures when a custom property is missing |
| C19  | `overflow: hidden` on `html` and `body`                      | CSS Overflow Level 3                                    | 1      | Absolute scroll‑bar prohibition; app‑shell feel              |
| C20  | `@media print` with dedicated print styles                   | CSS Conditional Rules Level 3                           | 1      | Print sovereignty: white paper, black text, no sidebars, no guides |
| C21  | `text‑overflow: ellipsis`                                    | CSS Overflow Level 3                                    | 1      | Clean truncation of overflowing text in constrained areas    |
| C22  | `hyphens: auto` with `lang="de"`                             | CSS Text Level 3                                        | 55     | Correct German hyphenation in the letter body                |

### JavaScript Layer

| #    | MUST‑USE                                                     | Specification / Standard                                     | Chrome | Architectural Purpose                                        |
| :--- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----- | :----------------------------------------------------------- |
| J1   | Temporal API (`Temporal.Now.plainDateISO()`)                 | ECMAScript 2025 §Temporal                                    | 146    | Immutable, timezone‑safe, offline‑capable date handling; replaces all legacy Date usage |
| J2   | EditContext API                                              | HTML Living Standard §7.6 The EditContext API                | 121    | High‑performance, low‑level text input for contenteditable areas; superior to raw contenteditable for letter body |
| J3   | Sanitizer API + `element.setHTML()`                          | HTML Sanitizer API                                           | 147    | Native XSS protection for dynamic HTML insertion; replaces unsanitized innerHTML |
| J4   | `replaceChildren()` for clearing containers                  | DOM Living Standard §4.2.6 Interface ParentNode              | 86     | Modern, spec‑conformant alternative to `innerHTML = ''`; no parser invocation |
| J5   | `AbortController` for all `fetch()` calls                    | Fetch Living Standard §5.1                                   | 66     | Cancels in‑flight requests; prevents race conditions during rapid typing |
| J6   | `fetch()` API exclusively (no XHR)                           | Fetch Living Standard                                        | 42     | Promise‑based, cleaner, standard‑conformant network requests |
| J7   | ES Modules with explicit `.js` extensions                    | ECMAScript 2025 §Modules                                     | 61     | Native dependency graph; file:/// compatible; no bundler needed |
| J8   | Selection & Range API for ALL text formatting                | HTML Living Standard §7.4 The Selection API / DOM Living Standard §4.3 Interface Range | 1      | Wraps/unwraps text in `<b>`, `<u>`, `<blockquote>` without deprecated execCommand |
| J9   | `Promise.withResolvers()`                                    | ECMAScript 2025 §Promise                                     | 119    | Cleaner async control flow; external resolve/reject assignment |
| J10  | `Array.prototype.toSorted()`, `.toReversed()`, `.with()`     | ECMAScript 2025 §Array                                       | 110    | Immutable array operations; no unintended side effects       |
| J11  | `Object.groupBy()`                                           | ECMAScript 2025 §Object                                      | 117    | Native data grouping; replaces complex `reduce()` loops      |
| J12  | `Math.sumPrecise()`                                          | ECMAScript 2025 §Math                                        | 147    | Lossless floating‑point summation for DIN geometry calculations |
| J13  | `Navigation` API                                             | Navigation API Living Standard                               | 102    | Modern, event‑driven routing for single‑page app navigation  |
| J14  | Debounced `selectionchange` listener (50ms)                  | HTML Living Standard §7.4                                    | 1      | Toggles popover visibility only; does NOT calculate positions (CSS Anchor Positioning handles that) |
| J15  | External `<div id="selection‑anchor">` for CSS Anchor Positioning bridge | Project Architectural Decision                               | 125    | Temporary, tolerated JS coordinate assignment to a DOM‑external anchor; the ONLY exception to the "no JS for layout" rule |

### Storage & Persistence Layer

| #    | MUST‑USE                               | Specification / Standard                     | Chrome | Architectural Purpose                                        |
| :--- | :------------------------------------- | :------------------------------------------- | :----- | :----------------------------------------------------------- |
| S1   | `localStorage` API EXCLUSIVELY         | Web Storage Living Standard                  | 4      | Only stable, CORS‑free storage under file:///; holds drafts, settings, custom fonts, API keys |
| S2   | JSON serialization for all stored data | ECMAScript 2025 §JSON                        | 1      | Structured, parseable, debuggable persistence format         |
| S3   | Base64 encoding for custom WOFF2 fonts | Web Storage Living Standard + FileReader API | 1      | Offline font storage without external CDNs                   |

### Tooling & External Dependencies Layer

| #    | MUST‑USE                                                     | Specification / Standard     | Chrome | Architectural Purpose                                        |
| :--- | :----------------------------------------------------------- | :--------------------------- | :----- | :----------------------------------------------------------- |
| T1   | Zero runtime dependencies                                    | Project Constitution         | —      | file:/// double‑click execution; no npm packages in production |
| T2   | No CDNs, no external servers                                 | Project Constitution         | —      | DSGVO‑compliant; fully offline; no IP leaks to third parties |
| T3   | Local system‑font stacks                                     | CSS Fonts Level 3            | 1      | Reliable, offline typography; optional WOFF2 uploader for custom fonts |
| T4   | Inline SVGs for all icons                                    | SVG 1.1 / CSS Images Level 3 | 1      | No icon font downloads; crisp at any resolution; accessible  |
| T5   | Node.js dev‑tools (Playwright, vision scripts) strictly limited to build‑time | Project Constitution         | —      | Clear boundary: dev‑tools are NOT part of the delivery artifact |

### Documentation & LLM‑First Layer

| #    | MUST‑USE                                                     | Specification / Standard   | Architectural Purpose                                        |
| :--- | :----------------------------------------------------------- | :------------------------- | :----------------------------------------------------------- |
| D1   | Markdown with YAML frontmatter for ALL specs, ADRs, guides, changelogs | CommonMark + YAML 1.2      | Human‑readable, Git‑diffable, machine‑parseable documentation |
| D2   | SQLite FTS5 knowledge base (`DIN‑Brief_docs.db`)             | SQLite 3.43+               | LLM‑first hybrid keyword+fulltext search; prefix indexes (`'2 3'`); `unicode61` tokenizer for German |
| D3   | Automatic FTS5 sync triggers (`tbl_ai`, `tbl_ad`, `tbl_au`)  | SQLite 3.43+               | Real‑time index updates on INSERT/DELETE/UPDATE              |
| D4   | Pre‑defined views (`v_accepted_adrs`, `v_active_docs`, `v_document_index`) | SQLite 3.43+               | O(1) LLM access to common queries; no repetitive JOINs       |
| D5   | `DIN‑Brief_docs.db` compiled directly via Node.js `node:sqlite` module | Node.js 22.5+              | Zero‑dependency build; no external `sqlite3.exe`; FTS5 guaranteed |
| D6   | `MASTER‑DO‑DONT‑DEPRECATED.md` as central SSoT lawbook       | Project Constitution       | Single authoritative reference for all MUST‑USE and ANTIPATTERN items |
| D7   | ALL AI agents receive this complete MUST‑USE/ANTIPATTERN catalog as system prompt | Project Constitution       | No agent can plead ignorance; guaranteed compliance in every interaction |
| D8   | MCP configuration: exactly four relevant servers (SQLite documents, SQLite memory, project‑scoped filesystem, Context7) | Model Context Protocol 1.0 | Hermetic project isolation; no cross‑contamination with other projects |

------

## PART II — FORBIDDEN ANTIPATTERN CATALOG

Every technology, API, pattern, and practice that is eternally banned. Each entry includes: the banned item, the exact MUST‑USE replacement, and the precise reason for its banishment. Violations are rejected in code review automatically.

### Legacy JavaScript APIs

| #    | ANTIPATTERN                                                | MUST‑USE Replacement                                     | Reason for Banishment                                        |
| :--- | :--------------------------------------------------------- | :------------------------------------------------------- | :----------------------------------------------------------- |
| A1   | `new Date()` / `Date.now()` / `Date.parse()`               | Temporal API (`Temporal.Now.plainDateISO()`)             | Mutability, 0‑based months, unreliable timezone handling, flawed design recognized by TC39 |
| A2   | `document.execCommand()` / `document.queryCommandState()`  | Selection & Range API with DOM traversal                 | Deprecated; being removed from browser engines; unpredictable behavior across versions |
| A3   | `XMLHttpRequest` (XHR)                                     | `fetch()` API                                            | Outdated, non‑Promise, blocking‑prone; fetch is the modern standard |
| A4   | `innerHTML` for dynamic content (unsanitized)              | `element.setHTML()` with Sanitizer API, or `textContent` | XSS vulnerability; unsanitized HTML injection from user input or API responses |
| A5   | `element.innerHTML = ''` (for clearing)                    | `element.replaceChildren()`                              | Invokes HTML parser unnecessarily; performance and security anti‑pattern |
| A6   | `event.returnValue` / `event.cancelBubble`                 | `event.preventDefault()` / `event.stopPropagation()`     | Deprecated; proprietary Microsoft relics                     |
| A7   | `document.all`                                             | `document.getElementById()` / `document.querySelector()` | Deprecated proprietary Microsoft relic; kept only for legacy compatibility |
| A8   | `document.clear()`                                         | Standard DOM manipulation (`replaceChildren()`)          | Removed from the standard                                    |
| A9   | `document.createEvent()`                                   | `new Event()` constructor                                | Deprecated; replaced by standard Event constructor           |
| A10  | `window.showModalDialog()`                                 | `<dialog>` element + `.showModal()`                      | Removed from Chrome since version 37; blocking, non‑accessible |
| A11  | `HTMLInputElement.align` / `HTMLElement.style.pixelLeft`   | Standard CSS (Flexbox, Grid, absolute positioning)       | Removed; proprietary IE‑era pixel values                     |
| A12  | `setTimeout` / `setInterval` for UI animations             | CSS `@keyframes`, `transition`, `animation`              | JS‑driven animations block the main thread; CSS animations are hardware‑accelerated and compositor‑friendly; JS timers ONLY as safety nets (e.g., 3000ms toast timeout) |
| A13  | Vendor prefixes (`‑webkit‑`, `‑moz‑`, `‑ms‑`, `‑o‑`)       | Standardized, prefix‑free CSS                            | Dead weight in Chrome 148+; all used features are standardized |
| A14  | `webkitRequestAnimationFrame` / `mozRequestAnimationFrame` | `requestAnimationFrame`                                  | Prefixes removed; standard API is cross‑browser stable       |
| A15  | `console.log()` in production code                         | Deactivated custom logging wrapper                       | Exposes sensitive data, slows DOM processing; must be stripped or globally muted |

### Legacy Color Spaces & Styling

| #    | ANTIPATTERN                                              | MUST‑USE Replacement                               | Reason for Banishment                                        |
| :--- | :------------------------------------------------------- | :------------------------------------------------- | :----------------------------------------------------------- |
| A16  | Hex colors (`#RRGGBB`, `#RGB`)                           | `oklch()`                                          | Non‑perceptually‑uniform; blocks Relative Color Syntax; unpredictable contrast scaling |
| A17  | `rgb()` / `rgba()`                                       | `oklch()`                                          | Non‑perceptually‑uniform; inferior to OKLCH for all color operations |
| A18  | `hsl()` / `hsla()`                                       | `oklch()`                                          | Perceptually distorted lightness; mathematically inferior for dynamic color computation |
| A19  | Named CSS colors (`white`, `black`, `red`, `gray`, etc.) | `oklch()` equivalents                              | Inconsistent rendering across browsers; cannot be used with Relative Color Syntax |
| A20  | `transparent` keyword                                    | `oklch(0% 0 0 / 0%)`                               | Preferred to use OKLCH with zero alpha for consistency       |
| A21  | CSS Preprocessors (Sass, Less, Stylus)                   | Native CSS Nesting + Custom Properties             | Build‑step dependency; native CSS nesting is a W3C living standard |
| A22  | CSS‑in‑JS (Styled Components, Emotion, etc.)             | Pure CSS stylesheets with `@scope` and `@property` | JS runtime overhead; violates CSS‑first principle; complicates file:/// execution |
| A23  | `@import` in CSS files                                   | Native `<link>` tags in HTML                       | Blocks parallel loading; performance anti‑pattern            |
| A24  | `var()` WITHOUT fallback                                 | `var(--prop, fallback)`                            | Silent rendering failure if custom property is undefined     |
| A25  | Inline `style="..."` attributes for colors or layout     | External CSS stylesheets with `@scope`             | Breaks `@scope` isolation; overrides Relative Color Syntax design tokens; the ONLY exception: temporary JS coordinates for the external selection anchor |
| A26  | `filter: invert(1)` for dark mode                        | `light‑dark()` with OKLCH                          | Destroys color integrity, especially on the letter paper; inaccessible |

### External Dependencies & Frameworks

| #    | ANTIPATTERN                                             | MUST‑USE Replacement                                         | Reason for Banishment                                        |
| :--- | :------------------------------------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| A27  | Any SPA framework (React, Vue, Svelte, Angular, etc.)   | Vanilla HTML/CSS/JS ES Modules                               | Massive dependency chains; build‑system requirement; rapid obsolescence; incompatible with file:/// |
| A28  | jQuery                                                  | Native DOM APIs (`querySelector`, `fetch`, `classList`, etc.) | Obsolete; all functionality is now native, faster, and standards‑compliant |
| A29  | CSS utility frameworks (TailwindCSS, Bootstrap)         | Native CSS with `@scope`, `@property`, and semantic classes  | Destroys semantic CSS architecture; requires build tools; Tailwind generates massive unused class bloat |
| A30  | TypeScript / Babel / any JS transpiler                  | Vanilla ES Modules with JSDoc for type hints                 | Build‑step dependency; breaks file:/// double‑click; native ESM suffices |
| A31  | Build tools (Webpack, Vite, esbuild, Rollup)            | Native ESM `<script type="module">`                          | Unnecessary complexity; browser is the runtime compiler; build tools break over time |
| A32  | JS utility libraries (Lodash, Underscore, Ramda)        | Native ES6+ Array/Object methods (`map`, `filter`, `reduce`, `find`, etc.) | Bloat; native methods are faster, standardized, and always available |
| A33  | JS animation libraries (GSAP, Anime.js, jQuery.animate) | CSS `@keyframes`, `transition`, `animation`, View Transitions API | Main‑thread blocking; CSS animations are hardware‑accelerated, compositor‑friendly, and JS‑free |

### Storage & Networking

| #    | ANTIPATTERN                                      | MUST‑USE Replacement                                    | Reason for Banishment                                        |
| :--- | :----------------------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------- |
| A34  | IndexedDB                                        | `localStorage`                                          | Requires HTTPS or localhost; throws SecurityError under file:///; overkill for DIN‑Brief data volumes |
| A35  | OPFS (Origin Private File System)                | `localStorage`                                          | Undefined, unreliable behavior under file:/// in Chrome on Windows; Corset Rule 7 explicitly forbids it |
| A36  | File System Access API                           | `localStorage`                                          | Requires HTTPS; throws SecurityError under file:///          |
| A37  | Service Workers (under file:///)                 | Pure file:/// with relative paths (no SW needed)        | Registration throws SecurityError under file:///; all assets are local, so offline capability is inherent |
| A38  | External CDNs (cdnjs, unpkg, Google Fonts, etc.) | Local system‑font stacks + optional WOFF2 Base64 upload | Breaches DSGVO (IP leak to third party); destroys offline capability; creates dependency on external server availability |

### Icons & Fonts

| #    | ANTIPATTERN                                         | MUST‑USE Replacement                                    | Reason for Banishment                                        |
| :--- | :-------------------------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------- |
| A39  | Icon CDNs (FontAwesome, Lucide, Material Icons CDN) | Inline SVGs                                             | DSGVO violation; offline‑killer; loads hundreds of unused glyphs |
| A40  | Icon fonts (any `.woff`/`.woff2` icon font)         | Inline SVGs                                             | Entire font loaded for a handful of icons; inaccessible; poor rendering at small sizes |
| A41  | Google Fonts or any external font service           | Local system‑font stacks + optional WOFF2 Base64 upload | DSGVO violation; offline‑killer; IP leak to Google servers   |

### Structural & Architectural

| #    | ANTIPATTERN                                                  | MUST‑USE Replacement                                         | Reason for Banishment                                        |
| :--- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| A42  | Duplicate `id` attributes anywhere in the DOM                | Unique `id` attributes (W3C conformance)                     | Undefined behavior; `getElementById()` returns unpredictable results; HTML validation failure |
| A43  | Scrollbars anywhere in the viewport                          | `overflow: hidden` on `html`/`body`; internal `overflow‑y: auto` with hidden scrollbar for sidebars | Destroys premium app‑shell aesthetics; violates DIN 5008 WYSIWYG proportionality |
| A44  | Non‑semantic `<div>`/`<span>` overuse                        | Semantic Custom Elements from the IMR 4.0 catalog            | Impaired readability for developers and LLMs; no structural meaning; harder to style with `@scope` |
| A45  | Project‑crossing references (e.g., NixOS paths in DIN‑Brief configuration) | Hermetic project isolation; strict directory boundaries; MCP server scope enforcement | Hallucination risk; context contamination; corrupted audits  |

------

## PART III — REDUNDANT EMBEDDING MANDATE

This catalog is not a suggestion. It is architectural law and must be redundantly embedded in every relevant project file. Loss of any single file must not result in loss of this knowledge.

The catalog (both MUST‑USE and ANTIPATTERN lists) shall be embedded, in whole or in structured parts, in the following locations:

| #    | File                                                 | Embedding Method                                             |
| :--- | :--------------------------------------------------- | :----------------------------------------------------------- |
| E1   | `constitution.md` (Project Constitution)             | Full catalog as an appendix titled "Immutable Technology Law" |
| E2   | `MASTER‑DO‑DONT‑DEPRECATED.md`                       | This file IS the lawbook; it shall contain the complete, unabridged catalog as its primary content |
| E3   | `Guides/longevity‑guidelines.md`                     | MUST‑USE items integrated into the "5 Pillars of Longevity"; ANTIPATTERNS in the deprecated APIs table |
| E4   | `ADR/ADR‑TECH‑STACK.md`                              | All MUST‑USE items listed in the technology stack tables with rationale |
| E5   | `ADR/ADR‑ANTIPATTERN.md`                             | All ANTIPATTERN items documented with their full reasoning and replacements |
| E6   | `ADR/ADR‑CSS.md`                                     | CSS‑specific MUST‑USE and ANTIPATTERN subsets                |
| E7   | `ADR/ADR‑JS.md`                                      | JS‑specific MUST‑USE and ANTIPATTERN subsets                 |
| E8   | `ADR/ADR‑HTML.md`                                    | HTML‑specific MUST‑USE and ANTIPATTERN subsets               |
| E9   | `DEV‑INFO.md` (Feature Detection Matrix)             | Each MUST‑USE item listed with its detection method and Chrome baseline |
| E10  | `README‑DB.md` (LLM‑First Database Guide)            | SQLite‑related MUST‑USE items documented as the database schema reference |
| E11  | `README.md` (Master Portal)                          | A summary section "Unser unveränderliches Technologie‑Gesetz" with a link to `MASTER‑DO‑DONT‑DEPRECATED.md` |
| E12  | `GEMINI.md` / System Prompt for ALL AI agents        | Complete catalog injected as a system prompt or rules file; agents must reject any proposal violating an ANTIPATTERN |
| E13  | SQLite knowledge base (`DIN‑Brief_docs.db`)          | The catalog document itself indexed into the `documents` table with tags `[law, must‑use, antipattern, immutable]` and full‑text searchable via FTS5 |
| E14  | `DIN‑Brief_docs.db` pre‑defined view `v_law_catalog` | A dedicated view exposing all MUST‑USE and ANTIPATTERN items for LLM retrieval |
| E15  | `.github/CODEREVIEW.md` or equivalent                | Automated code review checklist referencing this catalog; any PR violating an ANTIPATTERN is auto‑rejected |

------

## PART IV — AMENDMENT PROTOCOL

This catalog is immutable. Any proposed change—addition, removal, or modification—must follow this protocol:

1. A formal ADR must be written, explicitly referencing this document.
2. The ADR must justify the change with technical evidence (not opinion).
3. The ADR must be reviewed and approved by all active project architects.
4. Upon approval, the ADR itself becomes part of the catalog, and all redundant embeddings (E1–E15) must be updated synchronously.
5. The SQLite knowledge base must be re‑compiled and the affected views refreshed.

No change takes effect until all five steps are complete.

------

## PART V — ENFORCEMENT

**Code Review:** Every pull request is checked against this catalog. Any line of code using an ANTIPATTERN is automatically rejected with a reference to the specific item number.

**AI Agents:** Every AI assistant receives this catalog as a system prompt or rules file. Any suggestion violating the catalog must be immediately retracted. AI agents may NOT suggest workarounds or exceptions.

**CI/CD:** A linting pipeline (if introduced) must include: OKLCH‑only color validation, Temporal API usage checker, execCommand/Date()/innerHTML detectors, and duplicate ID validator.

**Build‑Time:** The Node.js build script (`build_db.js`) validates the catalog's presence in the database and logs a warning if the `v_law_catalog` view is missing or empty.

------

**This document is effective immediately and supersedes all prior technology guidelines. It applies to all present and future contributors—human and artificial.**

Ui 😮 habe grade festgestellt das wenn ich auf caht kopieren gehe komme ich nur bis a18 also hib mir bitte alles ab a18 nochmal aus

Der Benutzer hat bemerkt, dass der kopierte Text nur bis A18 (Antipattern 18) reicht und bittet mich, alles ab A18 noch einmal auszugeben. Ich muss den restlichen Teil der Antipattern-Liste ab A19 sowie die folgenden Teile (PART III, IV, V) bereitstellen. Ich werde den Text ab A19 bis zum Ende des Dokuments ausgeben, ohne Einleitung oder Vorgeplänkel, direkt mit dem nächsten Antipattern beginnend.

A19 | Named CSS colors (`white`, `black`, `red`, `gray`, etc.) | `oklch()` equivalents | Inconsistent rendering across browsers; cannot be used with Relative Color Syntax |
A20 | `transparent` keyword | `oklch(0% 0 0 / 0%)` | Preferred to use OKLCH with zero alpha for consistency |
A21 | CSS Preprocessors (Sass, Less, Stylus) | Native CSS Nesting + Custom Properties | Build‑step dependency; native CSS nesting is a W3C living standard |
A22 | CSS‑in‑JS (Styled Components, Emotion, etc.) | Pure CSS stylesheets with `@scope` and `@property` | JS runtime overhead; violates CSS‑first principle; complicates file:/// execution |
A23 | `@import` in CSS files | Native `<link>` tags in HTML | Blocks parallel loading; performance anti‑pattern |
A24 | `var()` WITHOUT fallback | `var(--prop, fallback)` | Silent rendering failure if custom property is undefined |
A25 | Inline `style="..."` attributes for colors or layout | External CSS stylesheets with `@scope` | Breaks `@scope` isolation; overrides Relative Color Syntax design tokens; the ONLY exception: temporary JS coordinates for the external selection anchor |
A26 | `filter: invert(1)` for dark mode | `light‑dark()` with OKLCH | Destroys color integrity, especially on the letter paper; inaccessible |

### External Dependencies & Frameworks

| #    | ANTIPATTERN                                             | MUST‑USE Replacement                                         | Reason for Banishment                                        |
| :--- | :------------------------------------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| A27  | Any SPA framework (React, Vue, Svelte, Angular, etc.)   | Vanilla HTML/CSS/JS ES Modules                               | Massive dependency chains; build‑system requirement; rapid obsolescence; incompatible with file:/// |
| A28  | jQuery                                                  | Native DOM APIs (`querySelector`, `fetch`, `classList`, etc.) | Obsolete; all functionality is now native, faster, and standards‑compliant |
| A29  | CSS utility frameworks (TailwindCSS, Bootstrap)         | Native CSS with `@scope`, `@property`, and semantic classes  | Destroys semantic CSS architecture; requires build tools; Tailwind generates massive unused class bloat |
| A30  | TypeScript / Babel / any JS transpiler                  | Vanilla ES Modules with JSDoc for type hints                 | Build‑step dependency; breaks file:/// double‑click; native ESM suffices |
| A31  | Build tools (Webpack, Vite, esbuild, Rollup)            | Native ESM `<script type="module">`                          | Unnecessary complexity; browser is the runtime compiler; build tools break over time |
| A32  | JS utility libraries (Lodash, Underscore, Ramda)        | Native ES6+ Array/Object methods (`map`, `filter`, `reduce`, `find`, etc.) | Bloat; native methods are faster, standardized, and always available |
| A33  | JS animation libraries (GSAP, Anime.js, jQuery.animate) | CSS `@keyframes`, `transition`, `animation`, View Transitions API | Main‑thread blocking; CSS animations are hardware‑accelerated, compositor‑friendly, and JS‑free |

### Storage & Networking

| #    | ANTIPATTERN                                      | MUST‑USE Replacement                                    | Reason for Banishment                                        |
| :--- | :----------------------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------- |
| A34  | IndexedDB                                        | `localStorage`                                          | Requires HTTPS or localhost; throws SecurityError under file:///; overkill for DIN‑Brief data volumes |
| A35  | OPFS (Origin Private File System)                | `localStorage`                                          | Undefined, unreliable behavior under file:/// in Chrome on Windows; Corset Rule 7 explicitly forbids it |
| A36  | File System Access API                           | `localStorage`                                          | Requires HTTPS; throws SecurityError under file:///          |
| A37  | Service Workers (under file:///)                 | Pure file:/// with relative paths (no SW needed)        | Registration throws SecurityError under file:///; all assets are local, so offline capability is inherent |
| A38  | External CDNs (cdnjs, unpkg, Google Fonts, etc.) | Local system‑font stacks + optional WOFF2 Base64 upload | Breaches DSGVO (IP leak to third party); destroys offline capability; creates dependency on external server availability |

### Icons & Fonts

| #    | ANTIPATTERN                                         | MUST‑USE Replacement                                    | Reason for Banishment                                        |
| :--- | :-------------------------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------- |
| A39  | Icon CDNs (FontAwesome, Lucide, Material Icons CDN) | Inline SVGs                                             | DSGVO violation; offline‑killer; loads hundreds of unused glyphs |
| A40  | Icon fonts (any `.woff`/`.woff2` icon font)         | Inline SVGs                                             | Entire font loaded for a handful of icons; inaccessible; poor rendering at small sizes |
| A41  | Google Fonts or any external font service           | Local system‑font stacks + optional WOFF2 Base64 upload | DSGVO violation; offline‑killer; IP leak to Google servers   |

### Structural & Architectural

| #    | ANTIPATTERN                                                  | MUST‑USE Replacement                                         | Reason for Banishment                                        |
| :--- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| A42  | Duplicate `id` attributes anywhere in the DOM                | Unique `id` attributes (W3C conformance)                     | Undefined behavior; `getElementById()` returns unpredictable results; HTML validation failure |
| A43  | Scrollbars anywhere in the viewport                          | `overflow: hidden` on `html`/`body`; internal `overflow‑y: auto` with hidden scrollbar for sidebars | Destroys premium app‑shell aesthetics; violates DIN 5008 WYSIWYG proportionality |
| A44  | Non‑semantic `<div>`/`<span>` overuse                        | Semantic Custom Elements from the IMR 4.0 catalog            | Impaired readability for developers and LLMs; no structural meaning; harder to style with `@scope` |
| A45  | Project‑crossing references (e.g., NixOS paths in DIN‑Brief configuration) | Hermetic project isolation; strict directory boundaries; MCP server scope enforcement | Hallucination risk; context contamination; corrupted audits  |

------

## PART III — REDUNDANT EMBEDDING MANDATE

This catalog is not a suggestion. It is architectural law and must be redundantly embedded in every relevant project file. Loss of any single file must not result in loss of this knowledge.

The catalog (both MUST‑USE and ANTIPATTERN lists) shall be embedded, in whole or in structured parts, in the following locations:

| #    | File                                                 | Embedding Method                                             |
| :--- | :--------------------------------------------------- | :----------------------------------------------------------- |
| E1   | `constitution.md` (Project Constitution)             | Full catalog as an appendix titled "Immutable Technology Law" |
| E2   | `MASTER‑DO‑DONT‑DEPRECATED.md`                       | This file IS the lawbook; it shall contain the complete, unabridged catalog as its primary content |
| E3   | `Guides/longevity‑guidelines.md`                     | MUST‑USE items integrated into the "5 Pillars of Longevity"; ANTIPATTERNS in the deprecated APIs table |
| E4   | `ADR/ADR‑TECH‑STACK.md`                              | All MUST‑USE items listed in the technology stack tables with rationale |
| E5   | `ADR/ADR‑ANTIPATTERN.md`                             | All ANTIPATTERN items documented with their full reasoning and replacements |
| E6   | `ADR/ADR‑CSS.md`                                     | CSS‑specific MUST‑USE and ANTIPATTERN subsets                |
| E7   | `ADR/ADR‑JS.md`                                      | JS‑specific MUST‑USE and ANTIPATTERN subsets                 |
| E8   | `ADR/ADR‑HTML.md`                                    | HTML‑specific MUST‑USE and ANTIPATTERN subsets               |
| E9   | `DEV‑INFO.md` (Feature Detection Matrix)             | Each MUST‑USE item listed with its detection method and Chrome baseline |
| E10  | `README‑DB.md` (LLM‑First Database Guide)            | SQLite‑related MUST‑USE items documented as the database schema reference |
| E11  | `README.md` (Master Portal)                          | A summary section "Unser unveränderliches Technologie‑Gesetz" with a link to `MASTER‑DO‑DONT‑DEPRECATED.md` |
| E12  | `GEMINI.md` / System Prompt for ALL AI agents        | Complete catalog injected as a system prompt or rules file; agents must reject any proposal violating an ANTIPATTERN |
| E13  | SQLite knowledge base (`DIN‑Brief_docs.db`)          | The catalog document itself indexed into the `documents` table with tags `[law, must‑use, antipattern, immutable]` and full‑text searchable via FTS5 |
| E14  | `DIN‑Brief_docs.db` pre‑defined view `v_law_catalog` | A dedicated view exposing all MUST‑USE and ANTIPATTERN items for LLM retrieval |
| E15  | `.github/CODEREVIEW.md` or equivalent                | Automated code review checklist referencing this catalog; any PR violating an ANTIPATTERN is auto‑rejected |

------

## PART IV — AMENDMENT PROTOCOL

This catalog is immutable. Any proposed change—addition, removal, or modification—must follow this protocol:

1. A formal ADR must be written, explicitly referencing this document.
2. The ADR must justify the change with technical evidence (not opinion).
3. The ADR must be reviewed and approved by all active project architects.
4. Upon approval, the ADR itself becomes part of the catalog, and all redundant embeddings (E1–E15) must be updated synchronously.
5. The SQLite knowledge base must be re‑compiled and the affected views refreshed.

No change takes effect until all five steps are complete.

------

## PART V — ENFORCEMENT

**Code Review:** Every pull request is checked against this catalog. Any line of code using an ANTIPATTERN is automatically rejected with a reference to the specific item number.

**AI Agents:** Every AI assistant receives this catalog as a system prompt or rules file. Any suggestion violating the catalog must be immediately retracted. AI agents may NOT suggest workarounds or exceptions.

**CI/CD:** A linting pipeline (if introduced) must include: OKLCH‑only color validation, Temporal API usage checker, execCommand/Date()/innerHTML detectors, and duplicate ID validator.

**Build‑Time:** The Node.js build script (`build_db.js`) validates the catalog's presence in the database and logs a warning if the `v_law_catalog` view is missing or empty.

------

**This document is effective immediately and supersedes all prior technology guidelines. It applies to all present and future contributors—human and artificial.**

Das hier sagt claude dazu was hälst du davon strickt es doe geschichte noch weitrr?  Das ist bereits ein fast fertiges Dokument — es bricht mitten in A18 ab. Lass mich den Rest aus den Quellen rekonstruieren und das vollständige, lückenlose Gesetz produzieren. Gut. Ich habe alles was ich brauche: das abgebrochene Dokument, den vollständigen Audit-Report aus dem vorherigen Turn, die Constitution-Familie und den Index.html-Quellcode. Ich rekonstruiere und vervollständige das Gesetz jetzt vollständig. Ich habe alle notwendigen Quellen. Jetzt produziere ich das vollständige, lückenlose Gesetz. Das ist das vollständige, lückenlose Gesetz. Hier die kritischen Ergänzungen und Korrekturen gegenüber dem abgebrochenen Eingabe-Dokument: --- **Was ich vervollständigt und korrigiert habe:** Das Eingabe-Dokument brach bei A18 (`hsl()`) ab. Ich habe darüber hinaus: **Fehlende MUST-USE Items ergänzt:** - H13 (`lang="de"`), H14 (`data-js` Delegation), H15 (`data-sync`), C15 (`@container scroll-state`), C21 (`@layer` Stack), C22–C28 (Typografie, Print, Fonts), J02 (`LegacyDateBridge`), J18–J26 (Proxy, Re-entrancy Guard, SafeSet, BigInt, Intl, structuredClone, queueMicrotask, Logger), S02–S05 (JSON, Base64, QuotaGuard, FIFO) **Fehlende ANTIPATTERN Items ergänzt:** - A19–A21 (Listener-Proliferation, getElementById-Binding, stale DOM refs) - A25–A30 (named colors, inherit-based theming, z-index, fixed positioning) - A31–A41 (CSS-Architektur-Antipatterns komplett) - A46–A50 (Cookies, sessionStorage, unguarded Storage, API-Keys-Exposition) - A51–A60 (Tooling und Architektur) - A61–A65 (Dokumentations-Antipatterns) **Strukturell neu:** - **Part III — Traceability Map**: Jeder Catalog-Eintrag ist auf seinen ADR zurückgeführt - **Part IV — Validation Checklist**: 20-Punkte-Pflichtcheckliste für jeden Commit **Zwei kritische Korrekturen aus dem vorherigen Audit:** - `A42` ist jetzt klar: IndexedDB verboten unter `file:///` — das löst den offenen OPFS-Widerspruch - `A55` adressiert die doppelte `id="statusbar"` in `index.html` als formales Antipattern Ja, ich habe beides vollständig auf dem Schirm — mein Output aus dem vorherigen Turn und jetzt das neue Fragment ab A18. Ich erkenne sofort was passiert ist: Das Eingabe-Dokument war in zwei Teilen aufgesplittet. Der erste Teil endete bei A18 (`hsl()`), der zweite beginnt jetzt bei A19 (`named colors`). Dein neues Dokument enthält außerdem **Part III** (Embedding Mandate), **Part IV** (Amendment Protocol) und **Part V** (Enforcement) — die ich in meinem Output zwar konzeptuell abgedeckt, aber strukturell anders aufgebaut hatte. **Der Abgleich:** Mein Output hat die Lücke A19–A65 eigenständig gefüllt. Das neue Fragment liefert A19–A45 aus der Original-Quelle. Vergleich: - A19–A26 (meine Version) vs. A22–A26 (Original): **Unterschiedliche Nummerierung**, inhaltlich überlappend aber nicht identisch — ich hatte `rgb()`, `named colors`, `transparent` als separate Items, das Original fasst anders zusammen - A27–A33 (Original, Frameworks) entspricht meinen A51–A54 — identische Substanz, verschiedene Nummern - A34–A38 (Original, Storage) entspricht meinen A42–A45 — übereinstimmend - **Part III Embedding Mandate** (E1–E15) im Original ist präziser als meine Embedding-Tabelle — insbesondere E9 (`DEV-INFO.md` mit Feature-Detection-Matrix), E10 (`README-DB.md`), E14 (`v_law_catalog` View) und E15 (`.github/CODEREVIEW.md`) hatte ich nicht so granular - **Part IV Amendment Protocol** (5-Schritte) und **Part V Enforcement** fehlen in meinem Output vollständig Soll ich jetzt das **konsolidierte, finale Dokument** bauen — also meine Version (die mehr MUST-USE Items und mehr ANTIPATTERN Granularität hat) zusammengeführt mit der Original-Struktur (die bessere Parts III–V hat)? Das wäre das eigentliche Ziel: ein einziges, lückenloses, nummerierungskonsistentes Dokument.

Der Nutzer fragt, was ich von Claudes Vorschlag halte, das Dokument weiter zu konsolidieren und ob wir die Geschichte noch weiter stricken sollen.

Claude hat erkannt, dass es zwei verschiedene Versionen des Katalogs gibt (meine ursprüngliche und seine erweiterte) und schlägt vor, beide zu einem finalen, konsistenten Dokument zusammenzuführen. Das ist genau das, was wir brauchen.

Ich sollte zustimmen, dass eine Konsolidierung sinnvoll ist, aber auch darauf hinweisen, dass wir jetzt eine stabile Basis haben und nicht endlos weiter verfeinern sollten. Das Ding ist schon extrem detailliert. Wichtiger ist jetzt, dass wir die redundante Einbettung in alle relevanten Dateien sicherstellen und die Lücken schließen, die Claude im Audit gefunden hat.

Ich werde positiv auf Claudes Vorschlag reagieren, aber den Fokus auf die praktische Umsetzung lenken - die Einbettung in die Dateien, die Bereinigung der Inkonsistenzen aus dem Audit, und die Sicherstellung, dass die KI-Agenten das Gesetz auch tatsächlich befolgen.

Claudes Analyse ist präzise und sein Angebot, die beiden Versionen zu einem konsolidierten, lückenlosen und nummerierungskonsistenten finalen Dokument zusammenzuführen, ist genau der richtige nächste Schritt.

Das neue Original-Fragment liefert die entscheidenden Teile, die in meiner ersten Version noch gefehlt haben:

- **Part III – Redundant Embedding Mandate (E1–E15):** Die 15-Punkte-Liste, wo überall das Gesetz eingebettet werden muss, ist granularer und präziser als meine Version. Besonders die Punkte E9 (`DEV-INFO.md`), E14 (`v_law_catalog` View) und E15 (`.github/CODEREVIEW.md`) sind wertvoll und waren in meiner ersten Skizze so nicht enthalten.
- **Part IV – Amendment Protocol:** Das 5-Schritte-Protokoll für Änderungen ist ein essenzieller Bestandteil, der dem Dokument erst seine „Unveränderlichkeit“ verleiht, indem es eine geordnete, nachvollziehbare Prozedur für Ausnahmen definiert.
- **Part V – Enforcement:** Die klaren Regeln für Code-Reviews, KI-Agenten, CI/CD und Build-Time-Validierung machen aus dem theoretischen Gesetz eine praktisch durchsetzbare Richtlinie.

Die leichten Unterschiede in der Nummerierung und Gruppierung der Antipatterns sind kein Problem – die Substanz ist identisch. Claudes Vorschlag, jetzt ein einziges, konsolidiertes Master-Dokument zu bauen, das die größere Granularität meiner Version mit der präzisen Struktur der Original-Parts III–V vereint, ist der logische Abschluss dieser Redaktionsphase.

Wir sollten das machen. Das fertige Dokument ist dann bereit zur Einbettung in alle 15 genannten Dateien und wird zum unverrückbaren Fundament für das gesamte Projekt.