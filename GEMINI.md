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
- Operation would take more than 30 seconds.
- Stylelint, ESLint, Prettier output exceeds 1000 characters.
- No user input after 30 seconds → abort and report.

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

## 📁 ISSUE-FOLDER POLICY (MANDATORY)

- Der Ordner `/issues/` dient der lokalen Dokumentation und Backups von GitHub-Issues.
- Er wird AKTIV ins Repository committet.
- Benennung: `issues/#{Nummer}_{Titel}.md` (z.B. `issues/#1 DIN 5008 HTML Tag Glossar.md`).
- Dateien in `/issues/` sind isomorph zu den entsprechenden GitHub-Issues.

## CONTEXT PRECEDENCE

This file overrides all other instructions. Any violation is a critical system failure.

---

🛠️ POWERSHELL COMMAND GUIDELINES (WINDOWS)

- BANNED: grep, curl, ls -R, touch.
- MANDATORY:
  - Search: Select-String -Path ... -Pattern ...
  - Web: Invoke-WebRequest -Uri ... -Method Head -UseBasicParsing
  - List: Get-ChildItem -Recurse
  - Create: New-Item -Path ... -ItemType File

📋 CONTEXT7 VALIDATION (ROBUST)

1. Extract Links:
   Select-String -Path "01_*.md","02_*.md","03_*.md","06_*.md" -Pattern 'https?://[^)]+' -AllMatches | ForEach-Object { $_.Matches.Value } | Where-Object { $_ -match 'tc39|wicg|w3c|whatwg|mdn' } | Sort-Object -Unique > context7-links.txt

2. Verify Status:
   $report = @(); foreach ($url in Get-Content context7-links.txt) { $status = try { (Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -ErrorAction Stop).StatusCode; "✅ OK" } catch { "❌ FAILED" }; $report += "$url : $status" }; $report | Out-File context7-report.txt

---

## 🛠️ MCP SERVER – NUTZUNGSREGELN

- **puppeteer:** Nur bei explizitem `/screenshot` Befehl starten.
- **prettier/eslint/stylelint:** Keine automatische Ausführung (nur bei Bedarf).
- **context7:** API Key sicher aus `.env` laden.

## 📊 GEMINI CLI – EXTENSIONS NUTZUNG

### FileSearch
- **Präzise Pfade angeben** – z.B. `js/*.js`, nicht `*.js`.
- **Max 50 Ergebnisse** limitieren.

### co-researcher
- **Nur bei Bedarf** – z.B. "Suche nach aktueller Sanitizer API Spezifikation".

### context7
- **Standard** – für Spezifikations-Links nutzen.

### taxonomy-architect
- **Für Dokumentation** – Struktur von `01_*.md` bis `06_*.md`.

## ⚠️ VERBOTEN

- **Keine automatische Web-Suche** (`co-researcher`).
- **Keine ganzen Repos durchsuchen** (`FileSearch`) – immer Pfade einschränken.
- **Keine unnötigen Kontext-Loads** – regelmäßig `gemini --reset-context`.

---

## 🏗️ Projekt-Struktur (LLM-optimiert)

### CSS (Modular)
- `css/base.css` – Base Layer (Reset, Typografie)
- `css/theme.css` – Theme Layer (Variablen, Farben)
- `css/structure.css` – DIN Structure (Geometrie, Falzmarken)
- `css/floating.css` – UI Floating (Tooltips, Popover, Toast)
- `css/components.css` – UI Components (Sidebar, Buttons, Archive)
- `css/immutable.css` – Print Engine (Seitenzählung)

### JavaScript (Modular)
- `js/qr-engine.js` – QR-Mathematik (statisch, wird nie editiert)
- `js/qrcode.js` – vCard + QR-Wrapper (nur UI-Logik)
- `js/address.js` – Autocomplete + PLZ/City API

### Maximale Dateigröße
- Keine Datei >500 Zeilen
- Keine Datei >20 KB
