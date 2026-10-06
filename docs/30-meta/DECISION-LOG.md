---
aliases:
- DECISION-LOG
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: decision-log
status: active
tags:
- obsidian
- core
- documentation
- decision-log
- architecture
title: 'Chronologisches Entscheidungs-Log: DECISION-LOG.md'
type: log
updated: '2026-10-06'
---

# Chronologisches Entscheidungs-Log: DECISION-LOG.md

Dieses Dokument protokolliert alle grundlegenden technologischen und architektonischen Entscheidungen des **DIN-BriefNEO**-Projekts in zeitlicher Reihenfolge. Es ergänzt die thematischen Architecture Decision Records (ADRs) um eine historische Perspektive.

---

## 📌 Nutzungsregeln dieses Logs

> Diese Regeln beschreiben **den Log selbst** (Metadaten, keine Chronik-Einträge).
> Sie dürfen geändert werden; die **Einträge darunter nicht** — siehe „Append-only".
> Die Regeln für `docs/` insgesamt stehen in [[AGENTS]] §5, nicht hier.

### Wozu dieser Log da ist

Der Log beantwortet **„Warum ist das so?"** — nicht „Was ist es?" und nicht „Wie macht man es?".
Sein Wert liegt in den **verworfenen Alternativen** und den **empirischen Befunden**: Er bewahrt
spätere Bearbeiter (Mensch wie KI) davor, eine bewusst getroffene Entscheidung für einen Fehler
zu halten und „aufzuräumen". Das ist mehrfach belegt — zuletzt im Code-Audit 2026-10-02, wo die
dokumentierten Begründungen zu `enforceLineLimits`, zum eigenen Undo-Stack und zu
`sanitizeRichText` verhindert haben, dass korrekte Lösungen als Antipattern gemeldet wurden
([[code-audit-website-2026-10-02]] §5).

### Was hier hineingehört — und was woanders hin

| Inhalt | Gehört nach |
| :--- | :--- |
| „Wir haben X gewählt, Y verworfen, weil …" | **Hierher** |
| Empirischer Messwert, der eine Annahme widerlegt | **Hierher** |
| Fehlschlag, Rollback, Incident + Lehre daraus | **Hierher** |
| Dauerhaft gültige Norm / Verbot | [[Immutable-Law-Catalog]] |
| Thematisch geschlossene Architekturentscheidung | ADR in `docs/10-architecture/` |
| Anleitung „so macht man das" | Guide in `docs/20-implementation/` |
| Begriffsdefinition | [[glossary]] |
| Aktueller Projektstatus / Fortschritt | [[ROADMAP]], [[Feature-Matrix]] |

**Faustregel:** Wer das Dokument in einem Jahr liest, soll die *Entscheidung* nachvollziehen
können, ohne den damaligen Code zu kennen. Alles, was stattdessen den *Istzustand* beschreibt,
veraltet hier und gehört in ein normatives Dokument.

### Verbindliches Eintrags-Schema

Jeder neue Eintrag beginnt mit `## JJJJ-MM-TT — <prägnanter Titel>` und nutzt **genau diese
vier Pflichtabschnitte** in dieser Reihenfolge:

```markdown
## 2026-10-02 — Kurztitel der Entscheidung

**Kontext:** Was war der Auslöser? Welches Problem lag vor? (2–4 Sätze)

**Änderung:** Was wurde konkret getan — mit Datei- und Funktionsnamen.

**Verifikation:** Womit belegt? (Fitness Score, tsc, Messwert, DevTools-Test)

**Generalisierbarkeit:** Was lernt die `llm_boilerplate` daraus?
```

**Optionale Zusatzabschnitte** (nur verwenden, wenn zutreffend — keine neuen erfinden):

- `**Verworfen:**` — geprüfte Alternativen und der Grund der Ablehnung. *Der wertvollste
  Abschnitt überhaupt; wo immer möglich ausfüllen.*
- `**Bewusst NICHT geändert:**` — was absichtlich stehen blieb, damit es niemand „repariert".
- `**Offener Punkt:**` — was die Entscheidung noch braucht, inkl. Entscheidungskriterium.
- `**Quelle:**` — Context7, ChromeStatus, Spec-Link, externes Review.

Historisch existieren ~23 Einmal-Labels (`Vorfall:`, `Lehre:`, `Adoptiert:` …). Sie bleiben
unangetastet, werden aber **nicht fortgeführt**.

### Append-only

Bestehende Einträge werden **nicht umgeschrieben, nicht umsortiert, nicht gelöscht**. Wird eine
Entscheidung revidiert, entsteht ein **neuer** Eintrag, der die alte per Datum referenziert
(„revidiert Eintrag 2026-09-10 — …"). Nur so bleibt die Kette der Irrtümer lesbar, und genau die
ist der Schutz vor Wiederholung.

Wird der Live-Log zu groß, wird er **nach Zeitfenster** ausgelagert (zuletzt 2026-09-30:
Einträge bis 2026-08 → [[decision-log-archiv-2026-05-08]]), niemals thematisch ausgedünnt.

### Was diesen Log kaputt macht

- **Statusmeldungen statt Begründungen** („Feature X ist jetzt fertig") — veraltet sofort.
- **Normative Regeln** hier ablegen — der Log ist append-only, Regeln müssen änderbar bleiben.
- **Einträge ohne `Verifikation`** — eine Behauptung ohne Beleg ist keine Entscheidung.
- **Einträge ohne `Verworfen`**, wo es Alternativen gab — dann fehlt genau der Schutzwert.
- **Nachträgliches Glattziehen** alter Einträge — vernichtet die Lernspur.

---

> **Archiv:** Einträge **bis 2026-08** (Mai–August) wurden ausgelagert nach
> [[decision-log-archiv-2026-05-08|DECISION-LOG Archiv Mai–August 2026]].

## 📅 Chronologie der Entscheidungen (ab 2026-09)

## 2026-09-09 — Kleindateien-Bereinigung: Intl statt Monatstabelle, .br-Datenlader statt Inline-Wörterbuch

**Entscheidung:**
1. `47-date-format.js`: MONTHS-Array + padStart ersetzt durch `Intl.DateTimeFormat('de-DE', { day:'numeric', month:'long', year:'numeric' }).format(Temporal.Now.zonedDateTimeISO(...))`. Neben-Bug gefixt: Code lieferte „04. September" (padStart), ADR-JS-Beispiel und HTML-Placeholder verlangen „4. September 2026" (ohne führende Null).
2. `41-salutation-engine.js`: Verwaistes `data/de_vornamen_gender.json.br` (2,6 KB) verdrahtet statt Inline-Sets (951 Namen). Load via `fetch` + `DecompressionStream('brotli')` nach 45-Muster, file://-Guard, graceful Degradation → neutrale Anrede. Datei 415 → 330 Zeilen.

**Grund:** Handgepflegte Wörterbücher (Monate, Vornamen) sind redundant zu Platform-ICU bzw. zum existing Build-Artefakt in `research/research_results/n_gender.json.br` → `website/data/`. Beides verletzte auf je eine Art „Single Source of Truth": der Code widersprach dem ADR-Format, die `.br`-Datei war tot (Embedding hatte ROADMAP Step 2 ersetzt, ohne die Datei zu löschen oder zu nutzen).

**Quelle:** Context7 (Temporal-Spec / temporal-polyfill-Doku): `Intl.DateTimeFormat.format()` akzeptiert Temporal-Instanzen nativ → kein manualer Monatsindex nötig. research/README.md, docs/30-meta/ROADMAP.md (Namens-Dataset-Provenienz).

**Status:** Umgesetzt (Fitness Gate 100 %).

**Offener Punkt:** ADR-JS-Typdef kennt Intl-Temporal-Overloads nicht → lokaler `/** @type {any} */`-Cast (Codebase-Konvention aus 45). Nachfassen, wenn TS-Libs Temporal-Intl-Overloads ausrollen. Kleindateien-Merges (44→45, 51+52→51) weiterhin offen, warten auf Freigabe.

---

## 2026-09-09 — Chrome-Release-Notes-Scan 142–151: Temporal nativ stable, text-fit/page-margin-safety für Druck-Workflow

**Entscheidung:**
1. Vollständiger Scan der letzten 10 Chrome-Stable-Versionen (142–151, `developer.chrome.com/release-notes/<VERSION>`); Quelle `https://developer.chrome.com/release-notes/151` + Scan-Ergebnisse in `docs/30-meta/web-standards-tracking.md` §1/§4 dokumentiert (Versions-Tabelle mit Projekt-Mapping + Kernerkenntnisse).
2. Scan lieferte **kein Breaking-Change** für bestehende Patterns; Top-Fund-Kandidaten für künftige PoCs: `Temporal` nativ stable (144, erfüllt den `new Date()`-Ban nativ), `text-fit` (150, stable — kann Layout-Text-Fit-JS-Kandidat ersetzen), `page-margin-safety` (150 — Druckrand-Handling für print.css), `contrast-color()` (147), `Focusgroup` (146 OT/150, JS-Kill für Tastatur-Navigation), `meta name="text-scale"` (146).

**Grund:** Contract-gemäßer Basis-Scan auf neue CSS/native Features (§4 AGENTS.md-Geist: native Lösung vor JS); `webfetch` der Release-Notes 142–151 inkl. ICU-77-Warnung (143) für 47-date-format.js — Intl-Formate sind datengetrieben, keine hartcodierten Format-Annahmen. 152/153 existieren bereits als Beta/Preview (Vorgriff dokumentiert).

**Quelle:** developer.chrome.com Release Notes 142–151 (alle 10 Versionen am 2026-09-09 abgerufen), Context7-Quellen-Format aus web-standards-tracking §1.

**Status:** Umgesetzt — Fitness Gate Post-Build 100 %, Session via `log_session.js` protokolliert.

**Offener Punkt:** `text-fit` und `page-margin-safety` sind PoC-Kandidaten (isolierter PoC in scratch/, dann ADR-CSS-Update) — nächster Scan-Termin: Chrome 152/153 Stable. Generalisierbarkeit: Scan-Format (Release-Notes-Tabelle + Projekt-Mapping) übertragbar in `llm_boilerplate` als Standard-Recherche-Ritual.

---

## 2026-09-09 — PoCs text-fit/page-margin-safety (Chrome 150+): `contain` ist ungültig, `shrink` ist der Fix

**Entscheidung:**
1. PoC in Helium (Chrome/151.0.7922.137) via CDP: `scratch/test-text-fit.html` (CSSOM-Validität + Skalierungsverhalten), `scratch/test-page-margin-safety.html` (Descriptor-Parsing über `CSSPageRule`), Auswerter `scratch/cdp-eval.js`. `jsconfig.json` schließt `scratch/` vom App-Typecheck aus (isoliertes PoC-Gerüst, kein Produktionscode).
2. Befund `text-fit`: `contain` wird in Chrome 150+ **verworfen** — die Spec-Grammatik (css-text-5) kennt `[none|grow|shrink] [consistent|per-line|per-line-all]? <percentage>?`, kein `contain`. Damit waren 3 Deklarationen in `layout.css` (#absender Z. 337, #betreff Z. 393, `.single-line` Z. 769) tot. Fix: `contain` → `shrink` (identische Zielwirkung: Text in Box skaliert). Live-Verifikation über die App: alle drei Regeln rechnen `shrink`. `shrink 60%` (Z. 790, 6-Elemente-Block) ist gültig und bleibt unverändert.
3. Befund `page-margin-safety`: Descriptor parst (`none`/`clamp`/`add` gültig, Garbage verworfen, `@page :first` ok). Semantik: `clamp` = max(Wert, `<safe-printable-inset>`), `add` = Wert + Inset, nur an Blatträndern. → Integration in `print.css` (DIN-5008-Druck) folgt im Layout-Split-Batch.

**Grund:** PoC vor Adoption (AGENTS.md-Geist: Verifikation vor Produktionsnutzung, Context7/Specs haben Vorrang vor Annahmen). MDN dokumentiert beide Features noch nicht — Validierung lief über Editor's Drafts (css-text-5, css-page-3) + realer Chrome-151-CSSOM-Prüfung statt veraltetem Wissen.

**Quelle:** `scratch/test-text-fit.html` + `scratch/test-page-margin-safety.html` (Helium CDP 9222), Spec-Auszüge css-text-5 `#text-fit-property` / css-page-3 `#page-margin-safety` (Editor's Drafts, Juni/März 2026), Ergebnisse in web-standards-tracking §4 (PoC-Ergebnisse-Sektion).

**Status:** Umgesetzt — Fitness Gate 100 % (vorher 99,84 % wegen scratch-Typecheck, via jsconfig-Exclude gelöst), Session geloggt.

**Offener Punkt:** `page-margin-safety`-Integration in `print.css` (Kandidat: `@page { page-margin-safety: clamp; }` als Absicherung der 25/20/30mm-Ränder gegen unbedruckbare Zonen). Generalisierbarkeit: PoC-Harness-Muster (isolierte HTML-Testdateien + CDP-Auswerter statt Framework-Testsuite) übertragbar in `llm_boilerplate` als Standard-Verifikationsritual für proprietäre/stabile Features ohne MDN-Doku.

---

## 2026-09-09 — Dark-Mode-Fix: DIN-A4-Blatt bleibt immer weiss (User-Bugfix)

**Entscheidung:** `--c-paper-night` von `oklch(0.18 0.02 260)` (nachtschwarzes Sheet) auf `oklch(0.94 0.008 260)` (gedimmtes Weiss) gesetzt; `--c-ink-night` → `oklch(0.13 0.01 260)` (dunkle Tinte), `--c-ghost-night` → `oklch(0.45 0.01 260)`. Das Blatt ist physisches DIN-5008-Papier und muss in beiden Themes hell sein — oklch erlaubt das feine Runterdimmen (L 94 % statt 100 %) gegen Blendung.

**Grund:** (1) UX: Ein schwarzes Briefblatt widerspricht der Papier-Metapher. (2) Print-Bug als Nebenfund: `light-dark()` hätte im dunklen Theme auch dunkel gedruckt (`print.css` erzwang nur `body`-weiss, nicht das Sheet). Der Fix behebt beides mit einem Satz Variablen.

**Quelle:** User-Fehlerbericht ("nachtschwarz"), Live-Verifikation in Helium/Chrome 151 (Dark via `din_settings`-localStorage, Hard-Reload `ignoreCache`): `din-a4` rechnet `oklch(0.94 0.008 260)` / Ink `oklch(0.13 0.01 260)`. Bereitgestellt in `variables.css` (Z. 46-51).

**Status:** Umgesetzt — Fitness Gate 100 %, Session geloggt.

**Offener Punkt:** Der eingebaute Theme-Dimmer (`--theme-dim`, settings `themeDim`) dimmt separat — Prüfen, ob Dimmer-Effekt + neues Paper-Weiss harmonieren (UI-Test im Full-Batch). Generalisierbarkeit: Regel "Surface, die physisches Papier repräsentiert, wechselt nicht das Theme" übertragbar in `llm_boilerplate`.

---

## 2026-09-10 — Format-Toolbar Phase-3-Finalisierung + Temporal/Intl-Bugfix (Init-Kette war halb tot)

**Entscheidung:**
1. **Rest-Cleanup Format-Toolbar** (Popover/Anchor-Positioning war aus Vorgänger-Session zu ~85 % nativ): Verdecktes Relay-Div `#format-command-target` gelöscht — `#format-toolbar` selbst ist jetzt Command-Target (`commandfor="format-toolbar"`, Invoker Commands M135 dispatcht das `CommandEvent` direkt auf den Popover). `31-format-toolbar.js`: Command-Listener an der Toolbar statt am Geister-Div, Button-Lookup in `#commandButtons`-Map gecacht (statt 4× `querySelector` pro selectionchange). CSS-Seite (floating.css) mit Phase-3-Kommentar dokumentiert.
2. **Kritischer Nebenfund beim Live-Test**: Die App-Init-Kette starb bereits vor `applyLetterDate` — `47-date-format.js:9` warf `TypeError: Invalid argument for Temporal` (Chrome 151: `Intl.DateTimeFormat.format()` akzeptiert **kein** `Temporal.ZonedDateTime`), und die unbehandelte Exception im DOMContentLoaded-Handler riss UIProtections, SettingsManager, Autosave und FormatToolbar mit ab (`#datum` leer, kein Draft-Save). **Fix: `letterDateFmt.format(zdt.toPlainDate())`** (+ `@type {any}`-Cast für Intl-Typings). Empirisch verifiziert in Chrome 151: `ZonedDateTime` → ERR, `PlainDate`/`PlainDateTime`/`Instant` → ok.
3. **Live-Test-Batterie (CDP/Helium, bestanden)**: selectionchange → Anker-Positionierung + `showPopover()` ✓; Button-Click → `CommandEvent` auf Toolbar → Bold- und Quote-Wrap ✓ (`<b>…</b>`, `<blockquote>…</blockquote>`); `aria-pressed`-Sync läuft; Collapse → `hidePopover()` ✓; Hard-Reload ohne Uncaught-Errors.

**Grund:** Native Mechanik vor JS-Restanten (§2 Surgical/KISS); der Bugfix folgt aus der Verifikationspflicht — der Temporal-Fehler war nicht durch die Toolbar-Änderung verursacht (Crash-Punkt lag davor), sondern seit der Option-A-Umstellung latent. Error-Capture via CDP (`Runtime.exceptionThrown`) statt Raten.

**Quelle:** Empirische Chrome-151-Prüfung über `scratch/cdp-eval.js` + `/tmp/opencode/cdp-errors.js` (Helium CDP 9222). Context7: keine Doku zur Temporal↔Intl-Integration verfügbar; Verifikation daher im Zielbrowser. MDN-Web-API-Scan gegen den JS-Bestand: Broadcast Channel (Multi-Tab-Draft-Sync), CloseWatcher, View Transition (Theme-Wechsel), CSS Font Loading/Local Font Access (Font-Injection) als künftige Kandidaten; CSS Custom Highlight API für `din-comment` verworfen (Persistenz/Print brauchen echte DOM-Knoten).

**Status:** Umgesetzt — Fitness Gate 100 % (vorher 99,84 % durch Intl-TS-Typing, via Cast gelöst), Session geloggt.

**Offener Punkt:** (1) `DecompressionStream('brotli')` wird von Helium/Chrome 151 nicht unterstützt (Warnung in `45-address-intelligence.js`, gefangen) — Fallback prüfen. (2) Toast-Countdown als CSS-Animation mit `animation-play-state: paused` bei `:hover` + `animationend`-Close (ersetzt JS-Pause/Resume-Timer) — Plan im nächsten Batch. Generalisierbarkeit: "Popover als eigener Command-Target"-Pattern + Temporal-Intl-Falle (`toPlainDate()` vor `Intl.format`) übertragbar in `llm_boilerplate`.

---

## 2026-09-10 — Native-API-Batch: FontFace-Injection, CloseWatcher-Toasts, View-Transition-Verifizierung + brotli→gzip-Datenmigration

**Entscheidung:**
1. **CSS Font Loading API statt `<style>`-Injection** (`02-settings-manager.js`): `injectFont()` ist jetzt async und baut einen `FontFace('AptosCustom', url(base64))`, lädt via `await face.load()` (Reject → Warn-Toast `FONT_FORMAT_ERROR` + Status-Reset), ersetzt die alte Face via `document.fonts.delete()` → `add()`. Reset-Handler entlädt die Face nativ statt `#din-custom-font-style`-String zu entfernen. Kein Style-Element mehr — Live verifiziert: valides TTF (fontTools-Subset) lädt, korruptes Base64 wirft Reject + Error-Toast, Delete/Reset räumt auf.
2. **Native `CloseWatcher` für Toast-Esc-Dismiss** (`32-toast.js`): `armCloseWatcher()`/`destroyCloseWatcher()`; `close`-Event ruft `clearTimer()` + `cleanupPopover()` — funktioniert auch für Sticky-Toasts ohne keydown-Handler. Live-Verifiziert mit **trusted** Esc-Events via CDP `Input.dispatchKeyEvent` (programmatische KeyboardEvents feuern CloseWatcher nicht!): Popover zu, `state.active=false`, `closer=null` → unser Cleanup-Pfad lief. Kein Fallback nötig (Feature-Detect-Guard drin).
3. **View Transition für Theme-Wechsel verifiziert statt neu gebaut**: War schon implementiert (`startViewTransition` + 2s-Crossfade-CSS). Zwei Nebenbugs dabei gefunden und gefixt: (a) Theme-Toggle feuerte `applyTheme(next)` UND `updateSettings()` → **zwei** Transitions pro Klick — jetzt nur noch `settings.theme = next; updateSettings();`; (b) `transition.finished` rejected bei abgebrochener Transition (`InvalidStateError`, Unhandled-Rejection-Spam) — jetzt `.catch(() => {})`.
4. **brotli→gzip-Datenmigration**: `DecompressionStream('brotli')` ist in Chrome **4–154 unshipped** (nur Firefox 147+, caniuse + Live-Test) — die Offline-PLZ/Großkunden/Gender-Datasets waren auf der Primärplattform tot. Alle 3 `.br`-Dateien + beide Embedded-Base64-Blobs (`plz-embedded.js`) via node `zlib.brotliDecompressSync` → `gzipSync(level 9)` konvertiert (Großenpreis: +15–21 %, z. B. 71,9→87,2 KB), Konstanten umbenannt (`PLZ_DATA_GZIP_B64`), 4 DecompressionStream-Sites + Fetch-Pfade auf `'gzip'`/`.gz` umgestellt (Bonus: die `@type {any}`-Casts fielen weg, `gzip` ist getypt). `.br`-Dateien gelöscht. Live verifiziert: Kein Init-Fehler mehr, PLZ-Suche (10115→Berlin, 187 City→PLZ-Treffer), Großkunde (10026→N26 AG), Zero-Click-Gender („Moritz Weber"→Herr, „Angelika Schmitt"→Frau).
5. **Ambient-Typen**: `website/js/webapi.d.ts` deklariert `CloseWatcher` für ts-check (lib ES2022/DOM kennt sie noch nicht).

**Grund:** Native APIs vor JS-Hacks (KISS); Streams-brotli ≠ HTTP-brotli (Content-Encoding seit Chrome 50) — der Verwechslungsfalle aufgesessen, erst der caniuse-Eintrag für die Streams-API klärte es. Test-Artefakte gelernt: (a) Hidden Tabs drosseln Timer/Task-Scheduling → Async-Evals timeouten scheinbar (`Page.bringToFront` vor Tests); (b) `document.fonts.check('12px NonExistentFamily')` returns `true` (Chrome-Quirk bei leerer Familie) — Faces via `[...document.fonts]` iterieren statt `check()`.

**Quelle:** Live-Verifikation über `scratch/cdp-eval.js` (+ neuer `awaitPromise: true` im Harness), `/tmp/opencode/cdp-errors.js`, `/tmp/opencode/cdp-key.js` (trusted Esc) — Helium Chrome 151, CDP 9222. caniuse `mdn-api_decompressionstream_decompressionstream_brotli`; MDN FontFace (via Context7 `/mdn/content`). Migrations-Skript: `/tmp/opencode/brotli2gzip.js` (One-off; falls Datensätze je regeneriert werden, gzip-Format beibehalten).

**Status:** Umgesetzt — Fitness Gate 100 %, alle Live-Tests bestanden.

**Offener Punkt:** (1) Toast-Countdown als CSS-Animation (siehe voriger Eintrag) — Plan unverändert. (2) Datengröße +15 % akzeptiert für Universal-Support; falls jemals brotli in Streams shipt, ist der Revert-Dokumentationspfad hier. Generalisierbarkeit: „Streams-API-Feature-Support ≠ HTTP-Content-Encoding-Support separat prüfen" + „check() auf unbekannte Familie ist true — direkt über FontFaceSet iterieren" übertragbar in `llm_boilerplate`.

## 2026-09-10 — Baseline-Verifizierung + Form-A/B-Animation-Fix + CSS-Context-Split (8 Dateien)

**Entscheidung:**
1. **`:active-view-transition` ersetzt JS-Klassen-Workaround** (Baseline 01/2026): Die 2s-Theme-Crossfade-Klasse `html.theme-transition` (JS `classList.add/remove` + `finished.finally().catch()`) ist jetzt `html:active-view-transition::view-transition-*` — rein CSS, drei JS-Zeilen + Rejection-Handling weg.
2. **Form-A/B-Klick löste fälschlich die 2s-Root-Transition aus**: `applySettings()` ruft bei jedem Settings-Update `applyTheme()` — das feuerte blind `startViewTransition()`, auch ohne Theme-Änderung. Fix: Guard `themeUnchanged` (data-theme-Vergleich) in `applyTheme()` + `changeLayout()` als eigener Pfad mit **element-scoped VT nur auf `din-a4`** (~0,25s statt 2s). Live verifiziert: Form-A-Klick → `rootCalls: 0, sheetCalls: 1`, `--fold-1-y` schaltet korrekt.
3. **`contrast-color()` für Inline-Feedback-Badges** (Baseline 04/2026, api.webstatus.dev: low_date 2026-04-10): `floating.css` `.input-feedback-msg` — manuelle Textfarben (`oklch(100% 0 0)` auf danger, `oklch(15%...)` auf warning) durch `contrast-color(var(--c-*))` ersetzt.
4. **Element-scoped VT auf Font-Status-Chip + PLZ-Trefferliste** (`02-settings-manager.js`/`45-address-intelligence.js`): Feature-Detect `typeof el.startViewTransition === 'function'` + Reduced-Motion-Guard + Fallback plain update; `popoverEl.startViewTransition(render)` um `replaceChildren`.
5. **CSS-Context-Split**: `layout.css` 861→368 Zeilen; Sektionen zu **`sidebar.css`** (385 Z.: Sidebar, Custom Inputs, Autocomplete, Comment-Format, Utilities, Adressbuch/Geoapify/Guides) und **`signature.css`** (111 Z.: UI-States + WYSIWYG-Editor) ausgegliedert. Reine Verschiebung ohne Selektoränderung; Link-Reihenfolge in index.html = alte Source-Order. Zielkorridor ~300-400 Zeilen/Datei (Kontextkosten pro Lesedurchgang). ADR-CSS §3 auf 8 Dateien aktualisiert.
6. **sibling-count()-Trap (Empirie schlägt Baseline-Datum)**: api.webstatus.dev meldet `sibling-count()` als „newly" 2026-08-18 — aber `CSS.supports('width','sibling-count()')` ist in Chrome 151 `false` (low_date = letzte der 3 Engines, Chrome fehlt noch). Umsetzung wurde live getestet, Pill-Width brach (0px) → sofort revertiert; die 4 toten Button-Varianten-Regeln blieben draußen.
7. **Baseline-Quellen maschinenlesbar aufgenommen** (ROADMAP → Verweise): `api.webstatus.dev/v1/features` (Query-DSL `baseline_status:newly`, `low_date`/`high_date`), OpenAPI-Spec (GoogleChrome/webstatus.dev), npm `web-features`, Community-MCP-Server (jlacher/Technickel-Dev/yamanoku) + Chrome-Labs-Beispiel. Bewertung: MCP-Server für dieses Projekt nicht nötig — API ist per curl abfragbar; sinnvoller wäre später ein Fitness-Gate-Probe.

**Grund:** Kontextkosten pro Lesedurchgang sind der treibende Faktor (KI-Agenten + Wartung): Zielfenster ~300-400 Zeilen pro CSS-Datei, Ausreißer splitten an Single-Responsibility-Schnitten. Baseline-Daten DIREKT aus der maschinenlesbaren Quelle verifizieren statt Blog-Digesten vertrauen — `newly`-Datum ≠ Chrome-Support (Punkt 6).

**Quelle:** api.webstatus.dev/v1/features (live gequeried: contrast-color 04/2026, sibling-count 08/2026, field-sizing 06/2026, :active-view-transition 01/2026, @function **limited**!), web.dev/articles/web-platform-dashboard-baseline, Context7 `/websites/modern-css` (@function: Chrome 139+, nicht Baseline; contrast-color-Beispiele). Live-Tests: cdp-eval/cdp-errors (Chrome 151), Fitness Gate 100 %, alle Regressionen grün (Pills 111,5/74,3px, sig-box grab, din-anlagen none, base-select, 8 Stylesheets geladen, KEINE FEHLER).

**Status:** Umgesetzt — Fitness Gate 100 %.

**Offener Punkt:** (1) `@function` (Chrome 139+, webstatus: **limited**) als Kandidat für das 28× `calc(X / var(--din-width) * 100cqh)`-Dedup in sheet.css — fällt durch den Baseline-Filter, nur mit ADR/Decision umsetzen. (2) sibling-count() nach Chrome-Shipping erneut prüfen (Probe ins Gate denkbar). (3) `:open`/Container style queries bleiben Backlog (kein aktueller Use-Case). Generalisierbarkeit: „Baseline-low_date = letzte Engine, nicht Chrome; immer `CSS.supports()`-Empirie gegen die eigene Mindestversion" + „Datei-Zielkorridor als Kontextkosten-Metrik" übertragbar in `llm_boilerplate`.

---

## 2026-09-10 — Session-Batch: VT-Abort-Fix, Toast-Policy, Chrome 150+-Baseline, Zero-Inline-JS

**Agent:** opencode-glm
**ADR-Betroffen:** [[ADR-CSS]], [[ADR-JS]]

### 1. `InvalidStateError` an allen `startViewTransition`-Sites abgefangen
Aborts der VT-Promises (z. B. durch Mid-Flight-Navigation/Reload) erzeugten „Uncaught (in promise)"-Exceptions. Fix: `.finished.catch(() => {})` an allen 4 Sites (02-settings-manager.js ×3, 45-address-intelligence.js ×1). Ursachenanalyse: 3 VTs feuerten beim Boot (Root, Font-Chip, PLZ-Popover) — Boot-VTs crossfaden ins Leere und wurden beim Reload abortet.
**Fix 2 (Root Cause):** Boot-VTs unterdrückt statt nur gefangen — Root-VT via `#themeBooted`-Flag (erstes `applyTheme` ist Initial-Apply, kein Crossfade), Chip-/Popover-VT via bestehende `isReady`-Guards. Live verifiziert: 0 EXC bei Navigate+Reload (cdp-vt-trace.js), echte Theme-/Form-Wechsel animieren weiterhin korrekt (root VT ×1 bei Toggle, sheet VT ×1 bei Formwechsel, root VT 0).

### 2. Toast-Policy: nur Fehler, Warnungen, fehlende User-Guidance
Theme-Toast („Darstellung: …" incl. toastNames-Map), PRINT_PENDING, FONT_UPLOAD_SUCCESS, „Eigene Schrift entfernt", „Theme-Werte kopiert", KI-aktiviert/-deaktiviert/-Progress/„erfolgreich formalisiert" entfernt. 11 Call-Sites verbleiben (3 ai-assistant Guidance, 6 settings Errors, 2 salutation nur bei `blur`). Tote Constants (PROFILE_SAVED, DRAFT_SAVED, PAGE_ADDED, RESET_SUCCESS, ADDRESS_SUCCESS, INTL_MODE_ON, PAGE_LIMIT_REACHED + ZIP_INVALID, RECIPIENT_LIMIT, SUBJECT_LIMIT, PAGE_OVERFLOW, ADDRESS_ERROR) aus `51-storage.js` gelöscht; toter CSS-Block `.input-feedback-msg` (34 Z., floating.css) entfernt. Live: Theme-Toggle → kein Toast (toast-v4 bleibt geschlossen).

### 3. Browser-Baseline auf Chrome 150+ spezialisiert (User-Entscheid)
Keine Multi-Browser-Matrix, kein `baseline-browser-mapping` (npm-Paket abgelehnt). Single Source of Truth: `docs/00-foundation/longevity-guidelines.md` („Einzige projektweite Baseline: Chrome 150+" + Chrome-only-Klausel). Mirrors aktualisiert: Immutable-Law-Catalog.md, AGENTS.md, constitution.md, README (Foundation). Konsequenz: Chrome-only-Features (z. B. `@function`, 139+) sind ab 150 prinzipiell im Baseline-Fenster; Empirie bleibt per `CSS.supports()`-Live-Test (sibling-count-Lesson bleibt bindend).

### 4. Zero-Inline-CSS/JS durchgesetzt — HTML ist jetzt script-src-only
Audit-Fund: 2 Inline-`<script>`-Blöcke in index.html (Z. 27 FOUC-Theme/Font-Boot, Z. 271 Draft/Radio/Theme/PV-Restore, ~86 Z.). Extrahiert in `js/boot-theme.js` (head, blockierend — Module sind deferred und kämen zu spät) und `js/boot-state.js` (Ende body, blockierend an Parse-Position — Draft-Restore muss VOR den ES-Modules laufen). Code 1:1 übernommen (surgical), JSDoc-Types ergänzt (Gate-Forderung). `style.setProperty('--var', …)`-Writes (02-settings `--theme-dim`, 42-signature `--x/--y/--scale/--rot`, 31-format-toolbar `--sel-x/--sel-y`) bleiben: etabliertes Pattern „JS feedet Daten, CSS konsumiert".
**Fix im selben Zug (Inline-CSS-Ausräumung):** ai-assistant.js 4× `style.display` → `classList.toggle('hidden')` (`.hidden { display:none !important; }`); Phantomklasse `.opacity-50` (nirgends definiert!) → CSS `sidebar.css`: `.sidebar-switch-row:has(input:disabled) { opacity: 0.5; }`; 02-settings 2× `style.colorScheme` gelöscht (variables.css hat komplette `[data-theme]`-color-scheme-Regeln); 31-format-toolbar `style.top/left` → `--sel-y/--sel-x` Custom Props + `#selection-anchor { top: var(--sel-y, auto); left: var(--sel-x, auto); }`.

### Verifikation
Fitness Gate 100 % (pre/post). Live (Chrome 151, frischer Tab): KEINE FEHLER bei Load, Theme-Toggle → root VT ×1 + kein Toast, Form A/B → sheet VT ×1 + root VT 0, Selektion → `--sel-x/--sel-y` gesetzt + Toolbar `:popover-open` (Anchor-Positioning via CSS), Draft-Restore (121 Z. Brieftext), Radio-Sync (layout form-a), `din-custom-font-style` nur bei gespeicherter Font, 4 externe Scripts, 0 inline.

**Generalisierbarkeit (llm_boilerplate):** (1) „Boot-VTs unterdrücken (isReady-Flag), nicht nur `.finished.catch`" — jedes VT-Feature braucht einen Boot-Guard. (2) „FOUC-/Restore-Boot-Code als externe blockierende Classic-Scripts statt Inline" — Zero-Inline-Policy kompatibel mit Timing-Anforderungen. (3) `:has(input:disabled)` statt JS-Styling-Opacity. (4) Chrome-only-Spezialisierung als alternative Longevity-Strategie zur Multi-Browser-Matrix.

**Quelle:** Context7 `/websites/modern-css` (View Transitions API: `.finished` Reject-Verhalten bei Abort); Live-Tests cdp-vt-trace.js/cdp-errors.js/cdp-eval.js (Chrome 151), Fitness Gate 100 %.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — README-Überarbeitung mit SVG-Header

**Kontext:** Haupt-README.md war inhaltlich veraltet (kein Wort zu CSS-Split, Zero-Inline-JS, Chrome-150+-Baseline, Linux-Workflow) und ohne Logo.

**Entscheidung:** README neu strukturiert — zentrierter Header mit `envelope.svg` (das im Repo liegende, eigens erstellte Twemoji-Umschlag-SVG als Identitätsträger), Quick Start getrennt nach Nutzer (start.bat) und Entwickler/Agent (`node tools/build_db.js` als Linux-Einstieg), neue Sektionen „Technologie-Stand 2026-09" (Tabelle: Chrome 150+, 8 CSS-Dateien, Classic-Boot-Scripts, OKLCH, localStorage) und „Verifikation statt Hoffnung". Bestehende Sektionen (Philosophie, Doku-Landkarte, Agenten-Infrastruktur, Light/Full Mode) inhaltlich erhalten, Text gestrafft.

**Generalisierbarkeit:** README-Pattern „SVG-Header + Nutzer/Agent-Split + Tech-Stand-Tabelle" ist direkt auf die `llm_boilerplate` übertragbar — Tech-Stand-Tabelle zwingt Maintainer, die Baseline im Kopf zu dokumentieren statt im Changelog zu verstecken.

**Quelle:** Kein externer Nachschlag nötig (reine Dokumentationsarbeit); Fitness Gate 100 % (pre + post).

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Sanitizing-Konsolidierung: eine Sicherheitsgrenze für Rich-Text

**Kontext:** Rich-Text hatte drei unterschiedlich strenge Pfade (setHTML mit Allowlist, ungefilterter DOMParser-Fallback in DraftManager, völlig ungesanitisierter DOMParser in boot-state.js). External Review bemerkte die inkonsistente Sicherheitsgrenze.

**Empirie (Chrome 151, live getestet):** `setHTML()` existiert und sanitiert, aber mit eigener `elements`-Allowlist werden **alle Attribute verworfen** (alle drei Spec-Formen von `attributes` getestet: Objekt-Map, per-Element-Entry, flaches Array — plus `new Sanitizer(...)`), inkl. `class` für `din-comment`. Default-Sanitizer behält `class`, aber auch zu viele Elemente (`<i>`, `<em>` überleben). Context7/BCD bestätigt nur Verfügbarkeit, nicht das Config-Verhalten.

**Entscheidung:** Der DOMParser-Walk mit exakter Allowlist (b/strong/u/s/blockquote + span.din-comment) ist ab jetzt **die einzige** Rich-Text-Sicherheitsgrenze — in `01-draft-manager.js` (#sanitizeRichText) und `31-format-toolbar.js` (Paste). `boot-state.js` (Boot-Quick-Restore vor den Modulen) nutzt `setHTML()` mit **Default**-Sanitizer: streng genug gegen Skripte, `class`-safe, null Config — der DraftManager übernimmt direkt danach mit der exakten Allowlist. Der setHTML-Dual-Path mit Verfügbarkeits-Check ist gelöscht (Baseline Chrome 150+).

**Verifikation:** Injektionstest im echten Chrome: `<b>` bleibt, `<em>` wird zu Text entkleidet, `<span class="din-comment">` bleibt inkl. class, Plain-Felder werden via `textContent` escaped. Fitness Gate 100 % (pre + post).

**Generalisierbarkeit:** „Live-Empirie schlägt Sanitizer-API-Doku" — API-Verfügbarkeit ≠ API-Fähigkeit; für die `llm_boilerplate`: immer eine Sanitizing-Funktion als Source of Truth, keine Verfügbarkeits-Branches bei fixer Browser-Baseline.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Tools-Entschlackung: archive/ + Obsidian-Tools geloescht

**Kontext:** Externer Code-Review empfahl Dependency-Check fuer tools/. Verifiziert: `tools/archive/` (10 Dateien), `tools/add_wikilinks.py`, `tools/build_canvas.js` haben keine Referenzen in `start.ps1`, `reconciliation.js`, `build_db.js` oder `repository.yaml` (ausser Doku-Erwaehnungen). Bewusst NICHT geloescht: `build_db.py` (gecachter Pipeline-Step + autoritativer Function-Traceability-Matrix-Generator) und `log_session.js` (bindende Protokollierungspflicht, AGENTS.md Paragraph 8) — der Reviewer kannte den Governance-Contract nicht und hatte beide als Loeschkandidaten gefuehrt.

**Entscheidung:** Loeschung von `tools/archive/` (Git-History haelt die historischen Migrationsskripte), `add_wikilinks.py` (Obsidian-Wikilink-Migration, einmalig abgeschlossen) und `build_canvas.js` (Obsidian-Canvas-Generator, nicht in Pipeline verankert). Stale-Referenzen bereinigt in: `CLAUDE.md` (Tool-Liste, Archiv-Block), `repository.yaml` (subpath), `docs/30-meta/tooling-overview.md` (Inventur Lauf 3: Abschnitte entfernt, Frontmatter aktualisiert), `docs/30-meta/OBSIDIAN-SETUP-GUIDE.md` (Kapitel 5 entfernt, 6-8 renumeriert, code_links), `docs/implementation_and_meta_inventory.json` (Snapshot konsistent gezogen).

**Verifikation:** Fitness Gate 100 % (Metadata/Coherence/Conformance/Features). Grep-Verifikation: keine Referenzen mehr auf geloeschte Pfade in aktiven Konfig-/Gate-Dateien.

**Generalisierbarkeit:** „Safe-to-delete-Hierarchie": 1) Archivverzeichnisse immer via Git-History statt Ordner im Tree; 2) Governance-Tools (`log_session`, Traceability-Generator) sind NICHT loeschbar, auch wenn sie wie Einmalskripte wirken; 3) beim Loeschen von Tools immer die fuenf Referenzorte pruefen: Startskript, Reconciliation-Regeln, repository.yaml, Inventur-Doku, code_links-Frontmatter.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Präsentations-Strings von JS in CSS verschoben (Economy-Layer)

**Kontext:** Externer Review fand feste Zustands-Strings (Theme-Label, Font-Chip) doppelt in `boot-state.js` und `02-settings-manager.js`, obwohl die Elemente bereits rein per CSS gerendert werden (`content: attr(data-ui)` bzw. `::before`). Falscher Layer plus doppelt gepflegte Dictionaries.

**Entscheidung:** Sichtbare Labels rendern jetzt ausschließlich CSS (`floating.css`): `#btn-theme-toggle[data-appearance=…]::before`, `#btn-font-action[data-font-mode=…]::before`, `#font-status-label::before` mit `body.font-custom-active`-Variante. JS setzt nur noch den Zustand (`data-appearance`, `data-font-mode`, `body.font-custom-active`); `data-ui` und die Label-Dictionaries entfallen aus beiden JS-Dateien und aus `index.html`. `title`/`aria-label` bleiben bewusst in JS (CSS kann keine echten a11y-Attribute setzen); die `titles`-Dictionaries verbleiben in beiden Dateien, weil `boot-state.js` vor den Modulen laufen muss.

**Verifikation:** Fitness Gate 100 %. Live im echten Chrome (frischer Tab, echte CDP-Maus-Events): Theme-Cycle light→dark mit korrektem Label/Titel, alle drei `data-appearance`-Zustände (`🌓 Auto`, `☀️ Hell`, `🌙 Dunkel`), Font-Chip reagiert sofort auf `body.font-custom-active`, Font-Button zeigt upload/reset-Labels korrekt. Test-Theme-Setting auf light zurückgesetzt.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Zustandsabhängige Festtexte gehören in CSS-Selektoren über Zustandsattribute/-klassen, nicht in JS-Dictionaries; JS schreibt nur den Zustand. Eine Regel: „Wenn der Text bereits per `content: attr()` gerendert wird, gehört auch die Zustandszuordnung ins CSS."

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Boot-Path-Shrink: boot-state.js hört auf, boot-theme.js zu kopieren

**Kontext:** Full-Mode-Spec `specs/2026-09-10-boot-path-shrink/` (A1). `boot-state.js` Z. 40–47 setzte `html/body data-theme` + `colorScheme` neu, obwohl `boot-theme.js` (Head, blockierend) als einziger Owner dieser Attribute etabliert ist — doppelter Schreibzugriff auf denselben Zustand direkt nach dem Boot.

**Analyse (Owner-Regel):** CSS deckt `body` komplett über `[data-theme="…"] body`-Descendant-Selektoren ab (`variables.css`), `color-scheme` erbt von `html`. Live-Probe bestätigt: die CSS-Kaskade löst über das html-Attribut allein auf. Die `body[data-theme]`-Tripel-Selektoren wurden bewusst NICHT angefasst (Churn ohne Nutzen).

**Entscheidung:** Block Z. 40–47 entfernt; Header-Kommentar aktualisiert („boot-theme.js ist Owner"). Radios, Draft-Quick-Restore, PV, Font-Klasse und Theme-Button-Block (`data-appearance` + title/aria) bleiben — das ist boot-state.js' eigener Zustand.

**Verifikation:** Fitness Gate 100 %. Frischer Tab, echte CDP-Maus-Events: `htmlTheme: light, bootLabel: "☀️ Hell", title: "Darstellung: Helles Design", bodyColorScheme: light` — alle Boot-States korrekt.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Jeder persistierte State braucht genau einen Boot-Owner; Kopier-Schreibzugriffe in Folge-Modulen sind Drift-Quellen. Regel: „Boot-Modul schreibt, Feature-Module lesen/ändern — nie beides doppelt beim Boot."

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — anchor-scope geprüft und vertagt (Segmented Controls)

**Kontext:** Full-Mode-Spec A2: Prüfung, ob `anchor-scope` (Chrome 131+) die Popover-Anker der Radio-Segmented-Controls vereinfacht.

**Empirie (caniuse + CSSWG-Spec, live):** Support Chrome 131+ → im 150+-Baseline ✓. Aber: (1) Anchor-Wechsel wird NICHT interpoliert — die 0.3s-Slide-Animation des Pills (Kern-UX der Controls) ginge verloren, `anchor-scope` springt hart. (2) Die Radio-Inputs sind `.sr-only` (1×1px, `layout.css` ~Z. 233) — der Anker müsste auf `input:checked + label` umziehen. (3) Das „unbegrenzte Optionen"-Motiv greift nicht: feste 2–3 Optionen.

**Entscheidung:** Vertagt. `anchor-scope` bietet hier keinen echten Gewinn gegenüber der bestehenden `:has()`-Positionslösung.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Bleeding-Edge-Funktion erst dann übernehmen, wenn sie ein konkretes Problem löst, das die bestehende Lösung nicht schon löst — „Baseline-tauglich" ist kein Übernahmegrund allein.

**Status:** Geprüft, bewusst nicht umgesetzt.

## 2026-09-10 — Theme-Transition: 0.6s + Klickbarkeit via Root-Opt-Out

**Kontext:** UX-Feedback: Theme-View-Transition dauerte 2s (`layout.css` „2-SECOND …") und der Theme-Button war währenddessen nicht klickbar. Anforderung: max 1s und klickbar während des Transitions.

**Empirie (Chrome 151, echte CDP-Maus-Events + Web-Recherche Bramus 2025-01-29 / CSSWG #11596 / MDN 2026-07-08):** (1) `pointer-events: none` auf `::view-transition` lässt Klicks zwar durchs Overlay fallen, ABER: solange `:root` am Transition teilnimmt, landet der Hit-Test empirisch auf `<html>` statt auf dem Button — bei Root-Capture überdeckt der Snapshot die ganze Seite. (2) Beweis nach dem Fix: Doppelklick 250ms auseinander → `["btn-theme-toggle","btn-theme-toggle"]`, VT aktiv, Theme zweimal weitgeschaltet (dark→auto→light). (3) Element-scoped VTs (Popover/Sheet/Chip) sind von `view-transition-name: none` unabhängig — ihr Pseudo-Baum sitzt im Element selbst (MDN).

**Entscheidung:** `animation-duration: 0.6s` (statt 2s); `:root { view-transition-name: none; }` (Root aus dem document-scoped Snapshot raus → Sidebar bleibt live-klickbar); `#viewport { view-transition-name: brief-viewport; }` crossfaded 0.6s; `::view-transition { pointer-events: none; }`. Sidebar/Body wechseln instant, der Brief-Bereich faded — bewusster Trade zugunsten der Klickbarkeit.

**Verifikation:** Fitness Gate 100 % (pre + post). Live: Doppelklick während aktiver Transition registriert beide Klicks; VT-Dauer ~639ms gemessen; Hilfslinien-Switch nach HTML-Umzug (in „DIN-Brief Layout", unter dem Form A/B-Segmented-Control) funktional und positionell verifiziert.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Document-scoped View Transitions frieren Hit-Testing des gesamten Root-Subtrees ein — `pointer-events: none` allein reicht nicht. Pattern: Root-Opt-Out + nur Inhaltsbereich benennen, wenn während des Transitions Interaktivität gewünscht ist.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Build-Stand: toter Button zu nicht-interaktivem Datum-Stempel

**Kontext:** `#btn-dev-mode` war ein `<button>` ohne einen einzigen JS-Listener — es zeigte nur ein hartkodiertes, veraltetes Datum („04.09.2026") via `data-ui`-CSS und behauptete fälschlich „Developer Mode aktivieren".

**Entscheidung:** Zu nicht-interaktivem `<span id="sidebar-build-date">` („Stand: DD.MM.YYYY") umgebaut. Kein Runtime-Fetch zur GitHub-API (A38-Allowlist) — stattdessen stampft der Deploy-Workflow (deploy.yml, Schritt nach Checkout) das echte Commit-Datum (`git log -1 --format='%cd'`) per sed in `data-ui`. Auf GitHub Pages immer aktuell; lokaler Stand zeigt das kommittierte Datum als Fallback.

**Verifikation:** Fitness Gate 100 %. Live: `<span>`, kein Button mehr, rendert „Stand: 10.09.2026".

**Generalisierbarkeit:** Für die `llm_boilerplate`: Version/Build-Stand gehört in die Deploy-Pipeline (Build-Time-Stamping), nicht in Runtime-Fetches (Offline-Regel) und nicht in hartkodierte Strings, die garantierter Drift unterliegen.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Postvermerk: 100% contenteditable (Doktrin-Verletzung behoben)

**Kontext:** `#postvermerk` war das EINZIGE DIN-Feld ohne `contenteditable` — Doktrin „alle einzeiligen DIN-Felder nutzen contenteditable=plaintext-only" (03-ui-protections.js Guard-Kommentar) war verletzt. Historisch begründet als „reine Anzeige" (review_grok.md rot), was Owner-Entscheidung aufgehoben hat.

**Entscheidung:** (1) `contenteditable="plaintext-only" enterkeyhint="done"` am Feld. (2) Boot-Sync (`main.js` syncPostvermerkFromSidebar, `boot-state.js` applyPv) füllt nur noch, wenn das Feld leer ist — manuell getippter Draft-Text hat Vorrang. (3) Aktive Select-Wahl (input/change-Listener) überschreibt weiter — bewusste Vorlagen-Wahl. (4) Sichtbarkeits-Trigger `din-postvermerk:not(:empty)` ergänzt (layout.css + floating.css): Custom-Text bleibt sichtbar, selbst wenn der Select zurückgesetzt wird.

**Verifikation:** Fitness Gate 100 %. Live (echtes CDP-Tippen, Input.insertText): Feld editierbar, Custom-Text „ EinwurfEinschreiben" überlebt Reload (Draft-Restore + kein Boot-Clobber), bleibt nach Select-Clear sichtbar, aktive Select-Wahl überschreibt („Einschreiben Einwurf"). 2-Zeilen-Limit + Paste-Flattening greifen automatisch über die bestehende maxTwoLinesIds-Registrierung.

**Generalisierbarkeit:** Für die `llm_boilerplate`: Sidebar-Steuerung und Papierfeld dürfen nie exklusiv-trennend designed werden („Select ist einziger Schreiber") — Feld immer 100% editierbar, Sidebar-Controls sind Vorlagen-/Komfort-Schreiber. Boot-Sync schreibt nur in leere Felder.

**Status:** Umgesetzt — Fitness Gate 100 %.

## 2026-09-10 — Externes Review verarbeitet: Lizenz, SECURITY, Templates, Unit-Tests

**Kontext:** Umfangreiches externes Review identifizierte fehlende Open-Source-Basics (Lizenz, SECURITY.md, Issue-Templates, Linux-Doku) und keine automatisierten Tests.

**Akzeptiert & umgesetzt:**
1. **MIT-Lizenz** (`LICENSE`) + README-Sektion.
2. **SECURITY.md** — Datenschutz-Modell dokumentiert, Private Vulnerability Reporting als Meldekanal, Scope (XSS-Sanitizing-Pfad, MCP-Allowlist) + Out-of-Scope (Browser-Bugs, `file://`).
3. **Issue-Templates** (bug_report.yml, feature_request.yml, config.yml mit Hinweis auf Chrome-150+-Baseline und Architektur-Doktrin; Security-Issues nur via Advisory).
4. **Zero-Dependency Test-Runner** (`test/`): eigener Mini-Runner (~80 Zeilen, `describe`/`it`/`assert` + DOM-Report), gebaut nach externem Brainstorm (Option B). 6 Tests gegen die ECHTE Sanitizing-Route (localStorage → loadDraft → #sanitizeRichText → DOM), Draft-Roundtrip, Undo/Redo. Priorität: `#sanitizeRichText` ist die einzige Sicherheitsinstanz für Rich-Text — XSS-Vektoren (`<script>`, `onerror`, nicht-Allowlist-Tags) werden hier festnagelt. Live im echten Chrome verifiziert: 6/6 bestanden.
5. **README**: Linux-Workflow ergänzt (`python3 -m http.server`).

**Bewusst abgelehnt (dokumentierte Design-Entscheidungen):**
- **PWA/Single-File-HTML-Distribution:** Single-File würde die modulare Struktur (8 CSS-Dateien, nummerierte JS-Module, Git-Diff-Nachvollziehbarkeit) opfern; eine dist-Bündelung per Build-Script wäre möglich, widerspricht aber dem „Keine Build-Tools"-Prinzip und ist für die Zielgruppe (technisch versiert) nicht nötig.
- **Firefox/Safari-Unterstützung:** Chrome 150+ ist dokumentierte Baseline; Feature-Detect-Fallback für andere Browser wird nicht gebaut — die App degradiert nicht, sie lädt gar nicht erst kompromittiert.
- **Unit-Test-Frameworks (Jest/Vitest/Mocha):** widersprechen Zero-Dependencies; der Eigenbau-Runner deckt den risikoreichsten Pfad ab, CDP-Live-Verifikation bleibt die Methodik für Integrations-/CSS-Regression.
- **Performance-Benchmarks:** Keine Messbarkeits-Pflicht; App lädt lokal ohne Netzwerk — die wichtigen Metriken (nur lokale Requests, kein Parsing von Framework-Runtime) sind strukturell gegeben.
- **No-Scroll-Doktrin, Sprachbarriere (deutsch), Reset-Dialog:** bewusste Produkt-/Doktrin-Entscheidungen.
- **Contribution Guidelines/Code of Conduct:** Ein-Personen-Projekt; Issue-Templates + SECURITY.md genügen für den aktuellen Scope.

**Generalisierbarkeit:** Für `llm_boilerplate`: „Test-Runner statt Test-Framework" — ein eigener ~80-Zeilen-Runner gegen die echte Produkt-Route (nicht gemockt) passt zur Zero-Dependency-Doktrin; SECURITY.md-Datenschutz-Abschnitt folgt dem Muster „lokal-only, Netzwerk-Ausnahmen explizit benennen".

## 2026-09-10 — Modern-CSS-Audit (modern-css.com, 111 Snippets) verarbeitet

**Kontext:** Externe KI-Gegenprüfung der modern-css.com-Snippets gegen den Code ergab ~35 Snippets bereits umgesetzt, ~13 Vorschläge. Eigenverifikation gegen den echten Code vor Umsetzung.

**Akzeptiert & umgesetzt (alle live verifiziert):**
1. **`safe center`** in `#viewport` (layout.css) — overflow-sicheres Zentrieren, No-Scroll-Doktrin abgesichert bei kleinem Viewport.
2. **`z-index`-Aufräumen** (floating.css ×3): `#format-toolbar`, `#address-suggestions`, `#plz-suggestions-popover` sind Popovers im Top-Layer — z-index war wirkungslos und widersprach dem bestehenden Guard-Kommentar im Dateikopf.
3. **`@media (prefers-reduced-motion: reduce)` Kill-Switch** (reset.css) — CSS-seitige A11y-Ergänzung zum JS-Check (der VTs skippt).
4. **`@media (forced-colors: active)` Guard** (sidebar.css) — **wichtigster Fund**: `.btn`/`.btn-ghost`/Switch verlieren im Windows High Contrast Mode sonst Hintergrund+Border → unsichtbar. Systemfarben (ButtonFace/ButtonText) als Standardausnahme zur OKLCH-Regel dokumentiert.
5. **`scrollbar-width: thin` + `scrollbar-color`** für `.autocomplete-dropdown` — dezente Scrollbar.
6. **Totes CSS gelöscht** (layout.css, ~65 Zeilen): `#local-address-dropdown`, `#postvermerk-dropdown`, `.address-suggestion-item`, `.pv-item` — die Elemente existieren **nirgends** (auch nicht dynamisch per JS); die Review-KI hatte sie übersehen und sogar "Popover-Umbau" empfohlen.

**Bewusst abgelehnt:**
- `scrollbar-gutter: stable`: No-op — `html { overflow: hidden }` (No-Scroll-Doktrin), es entsteht nie eine Scrollbar.
- `text-spacing-trim`: CJK-Interpunktions-Feature, für deutsche Typografie ohne Nutzen.
- `@supports`-Fallback für `column-rule-inset` (Gap Decorations): Chrome 150+ ist dokumentierte Baseline — Firefox/Safari-Fallbacks werden bewusst nicht gebaut.
- `content-visibility: auto` für Sidebar-Sektionen: Containment kann Anchor-Positionierung/Popover-Verhalten der Enkel-Knoten beeinträchtigen — Marginalgewinn, nicht die Risikowert.
- `interpolate-size`-"Height-Hack-Auflösung" am `#geoapify-key-container`: Existiert nicht — `height: auto` wird über das global gesetzte `interpolate-size: allow-keywords` bereits nativ animiert.
- `@container style()`, `:is()`-Umstellung, CSS Nesting, `reading-flow`: kosmetisch, kein funktioneller Gewinn.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Popover-Elementen gehören KEINE z-index-Werte (Top-Layer); (b) forced-colors-Guard gehört zum Standard-Reset jeder Button-führenden App; (c) `safe center` als Default für Full-Viewport-Zentrierung; (d) Externe Snippet-Audits vor Umsetzung immer gegen den echten Code verifizieren — die Review-KI verortete totes CSS als活 Code.

## 2026-09-10 — Postvermerk-Sichtbarkeit: Select ist Hauptschalter (Bugfix, Owner-Entscheidung)

**Kontext:** Der `:not(:empty)`-Zusatz aus dem Postvermerk-Batch (heute früh) sorgte dafür, dass das Feld nach „— kein —" im Select sichtbar blieb, sobald manueller Text drin stand. Owner-Korrektur: „kein" = Feld muss verschwinden, Punkt.

**Entscheidung:** Die `:not(:empty)`-Trigger in layout.css und floating.css entfernt. Sichtbarkeit strikt select-getrieben (`:root:has(#sidebar-pv-select option:checked:not([value=""]))`). Manuelles Editieren bleibt möglich — aber nur innerhalb der durch den Select bestimmten Sichtbarkeit. Boot-Sync-Empty-Guard unverändert (Draft-Text-Schutz bleibt; boot-state.js füllt nur leere Felder).

**Verifikation:** Fitness Gate 100 %. Live: Template wählen → Feld sichtbar; „— kein —" → `display: none` auch bei vorhandenem Text. Doktrin-Kommentar in index.html angepasst.

**Generalisierbarkeit:** Für `llm_boilerplate`: Sidebar-Control mit Template-Funktion darf nicht doppelt determiniert werden (Sichtbarkeit über Select, Inhalt über Field) — ein Schalter pro Aspekt.

## 2026-09-10 — Build-Stand-Span entfernt (Owner-Entscheidung, KISS)

**Kontext:** Der `#sidebar-build-date`-Span verursachte 2-Zeilen-Umbrüche in der Sidebar-Header-Row ("Dunkel" wanderte um). Owner: „vielleicht lassen wir das einfach komplett weg — wer sich dafür interessiert kann ja auch auf den GitHub-Link gehen".

**Entscheidung:** Die Entscheidung vom heutigen Vormittag (toter Dev-Mode-Button → Build-Stand-Span) zurückgenommen: Span gelöscht, Stamp-Step aus deploy.yml entfernt. Header-Row enthält jetzt nur noch GitHub-Link + Theme-Toggle. Das Commit-Datum ist über den GitHub-Link bzw. das Repo erreichbar — die Sidebar braucht es nicht.

**Verifikation:** Fitness Gate 100 %. Live: Span weg, Header-Row = 2 Kinder, Theme-Button einzeilig (19px).

**Generalisierbarkeit:** Für `llm_boilerplate`: Meta-Informationen (Build-Stand, Version) gehören nicht in knapp bemessene UI-Header — Genauigkeit schlägt Gimmick.

## 2026-09-10 — Signatur-Editor: individuelle Transform-Eigenschaften (translate/rotate/scale)

**Kontext:** Externer Brainstorm (angestoßen via webstatus.dev baseline-2026) zur Frage „Bild/Unterschrift — wie viel geht ohne JS?".

**Entscheidung:**
1. **Umgesetzt:** `42-signature.js applyTransform()` schreibt jetzt `style.translate/rotate/scale` direkt (Chrome 104, Baseline 2023) statt Custom-Props + kombinierte `transform`-Matrix in signature.css. Feste Spec-Reihenfolge (translate → rotate → scale), keine Matrix-Konkatenation, einzeln im DevTools-Inspector lesbar. Visuell identisch: Scale ist ein Skalar, uniform Scale kommutiert mit Rotation um denselben Origin — die Gesten-Mathe (getBoundingClientRect, centerX/centerY, Pointer-Capture) bleibt unangetastet.
2. **Guard-Kommentar** zur Verzerrungsfreiheit: scale als Skalar ist die Garantie (1:1, nie verzerren) — width/height würden das Seitenverhältnis brechen, bewusst nicht genutzt.
3. **Abgelehnt:** `@property`+Transitions für „sanftes Einrasten" — es existiert KEINE JS-Easing-Schleife, die man ersetzen könnte (Ersparnis der Review-KI war spekulativ). Eine Transition während der Geste würde am Pointer nachziehen (Print-Präzision!) — sie müsste auf Release gefiltert werden, also Komplexität für ein Feature, das keiner verlangt hat.

**Festhalten (Antwort auf die Kernfrage):** Drag/Rotate/Resize-Gesten **müssen JS bleiben** (Pointer Events, setPointerCapture) — CSS kann keine Gesten. CSS übernimmt die komplette Transform-Ausführung. Der JS-Anteil ist damit minimal und korrekt.

**Verifikation:** Fitness Gate 100 %. Live im Chrome: individuelle Eigenschaften angewandt und per getComputedStyle verifiziert (12px 8px / 45deg / 1.25). applyTransform-Route selbst wird erst mit geladener Unterschrift aktiv (in Testsession kein Bild) — Code-Pfad ist mechanisch (Property-Zuweisung derselben Werte).

**Generalisierbarkeit:** Für `llm_boilerplate`: `transform: translate(...) scale(...) rotate(...)` → individuelle Eigenschaften; nie transform-Kaskaden, wenn einzeln animierbar/debugbar sein soll.

## 2026-09-10 — UIProtections-Guard präzisiert: Enter-Block ist NICHT nativ (Empirie schlägt Overstatement)

**Kontext:** Externer Review-Claim: „Der Enter-Block für Single-Line-Felder ist doppelt gemoppelt — `plaintext-only` + `enterkeyhint="done"` verhindern Zeilenumbrüche nativ, ~15 Zeilen Ersparnis." Der eigene Guard-Kommentar in `03-ui-protections.js` überzeichnete genau das („unterbindet … Zeilenumbrüche NATIV").

**Recherche + Empirie (Chrome 151, CDP trusted Input):**
- `enterkeyhint="done"` ist **nur ein Tastatur-Label** (virtuelle Tastatur), kein Verhalten.
- Chromium `plaintext-only` blockt Umbrüche NICHT — es wandelt sie in **LF-Zeichen (`\n`) statt `<br>`/`<div>`** um (Chromium quirk: force `white-space: pre-wrap`, Quellen: w3c/editing#419, whatwg/html#11350, mdn/browser-compat-data#26719). Live-Probe: `insertText "\n"` → textContent `abc\ndef`, kein break-Element.
- CDP kann realen Tastatur-Enter nicht emulieren (auch im `contenteditable=true`-Control kein Insert) — der Online-Konsens deckt das Verhalten trotzdem eindeutig ab.

**Entscheidung:** Ablehnung der ~15-Zeilen-Ersparnis (falsche Prämisse). `enforceLineLimits` (keydown-preventDefault + Paste-Flattening) bleibt die tatsächliche Umbruchs-Sperre. Nur der Guard-Kommentar präzisiert (0 Code-Änderung): Rich-Text nativ blockiert — Umbrüche nicht; Verweis auf den vergeblichen Entfernungsversuch, damit zukünftige KIs den Overstatement nicht erneut „korrigieren".

**Verifikation:** Fitness Gate 100 %. Kein Verhaltensunterschied (Kommentar-only).

**Generalisierbarkeit:** Für `llm_boilerplate`: Guard-Kommentare müssen exakt zwischen „nativ verhindert" und „nativ umgeformt" unterscheiden — ein überzeichnetes Guard-Statement erzeugt kontraproduktive „Entdoppelungs"-Vorschläge. Empirie (CDP-Probe) schlägt Annahme in beiden Richtungen.

## 2026-09-10 — Batch A: toter Code entfernt (externer Audit, gegen echten Code verifiziert)

**Kontext:** Externer Zeilen-für-Zeilen-Audit aller 18 JS-Module meldete ~107 Zeilen toten Code. Jede Behauptung wurde vor der Löschung einzeln gegen den Code verifiziert (drei Funde bestätigt, keine Widerrufe). Geoapify bleibt bewusst unverkabelt (Owner-Entscheidung) — nur `highlightMatch()` als toter Funktionskörper entfernt, Modullogik unangetastet.

**Entfernt (verifiziert tot):**
1. `02-settings-manager.js` (~60 Zeilen): `btnCopyThemeTokens`-Listener, `themeDimmer`/`themeDimmerValue` + `applyThemeDim()` + Aufruf in `applyTheme`, `btnGuidesOn`/`btnGuidesOff`-Radio-Fallback (3 Stellen), `this.shell` (nur Zuweisung). Alles gegen im HTML nicht existierende IDs.
2. `variables.css`: `@property --theme-dim` + Transition-Referenz + Initial — **kein** `var(--theme-dim)`-Leser im gesamten CSS/HTML (Zombie-Kette: Storage-Default → applyThemeDim → setProperty → @property, gelesen von niemandem).
3. `51-storage.js`: `themeDim: 0`-Default; `SCHEMA_VERSION`, `STORAGE.*` (5 Keys), `LIMITS.API_DEBOUNCE_MS`/`MAX_PAGES` — alle ohne Referenz. Dateikopf-Kommentar angepasst (behauptete fälschlich, StorageManager konsumiere die Konstanten; er nutzt Magic-Strings — `boot-theme`/`boot-state` sind klassische Skripte und können nicht importieren).
4. `43-geoapify.js`: `highlightMatch()` (definiert, nie aufgerufen).
5. `32-toast.js`: `update()`-Methode + `updateToast`-Export (importiert wird nur `showToast, initToastSystem`).
6. `sidebar.css`/`floating.css`: unerreichbare `:has(#btn-guides-on/:off:checked)`-Fallback-Selektoren (~6 Zeilen) — begingen dieselbe Zombie-Referenz wie das gelöschte JS.
7. `test/all.js`: `Constants.STORAGE.DRAFT_CURRENT` → Literal `'din_draft_current'` (Test war einziger Konstanten-Konsument).

**Abgelehnt/verschoben (strukturell, braucht Owner-Entscheid):** Toast-Queue/Pause-Resume, Sanitizer-Zentralisierung, boot-state-Draft-Restore (FOUC-Risiko), Popover-Duplikate 43/45, `53-metadata` Temporal-Doppelnutzung — alles bewusst NICHT angefasst.

**Verifikation:** Fitness Gate 100 % (erster Lauf 99,87 % durch den Test-Konstanten-Referenz, behoben). Live (CDP, frischer Tab, cache-disabled, kein Konsolenfehler): Theme-Toggle zyklisch + persistiert, Guides-Switch per **echtem** Mausklick (Input.dispatchMouseEvent) → opacity 0/0.55 + persistiert, `--theme-dim` aus computed style verschwunden. Stale `themeDim`-Key aus alter Settings-Storage bereinigt. Lektion: synthetische `.click()`-Evals auf `switch`-Inputs sind unzuverlässig (togglen teils gar nicht) — nur trusted Input zählt.

**Generalisierbarkeit:** Für `llm_boilerplate`: Toter-Code-Audits vor Umsetzung gegen den echten Code verifizieren (der Audit lag bei ~107 Zeilen, real ~120 inkl. CSS-Zombies + Test-Fix); CSS-`:has()`-Fallbacks auf nicht-existente Elemente sind eine eigene Zombie-Kategorie, die beim JS-Räumen leicht vergessen wird.

## 2026-09-10 — Temporal-Doppel aufgelöst: „heute" lebt in genau einem Modul

**Kontext:** `47-date-format.js` (Briefdatum) nutzte `zonedDateTimeISO('Europe/Berlin')`, `53-metadata.js` (PDF-Dateiname/Keywords) nutzte `plainDateISO()` — UTC-basiert. Zwischen 00:00 und ~02:00 deutscher Zeit wäre der Dateiname auf den Vortag gefallen (Briefdatum ≠ Dateiname). User-Frage „kann das nicht direkt ins HTML?": Nein — das Datum muss bei jedem Boot „heute" sein; HTML/CSS haben keine native „aktuelles Datum"-Funktion, und `#datum` bleibt contenteditable (User-Override + Neusetzung nach Draft-Load). Ein JS-Boot-Aufruf ist das Minimum.

**Entscheidung:** Single Source of Truth — `47-date-format.js` exportiert zusätzlich `currentISODate()` (`Temporal.Now.zonedDateTimeISO('Europe/Berlin').toPlainDate().toString()`, mit Guard-Kommentar gegen den UTC-Fehlschluss). `53-metadata.js` importiert es; eigener `Temporal`-Zugriff dort entfernt. `formatLetterDate()` unangetastet (unterschiedliche Rückgabetypen/Formate: DIN 5008 vs. ISO — bewusst NICHT zu einer Funktion verschmolzen).

**Verifikation (CDP, Chrome 151):** 1) Deterministischer Nacht-Beweis mit festem Instant `2026-09-02T23:30:00Z` (= 00:30 Berlin): `.toZonedDateTimeISO('Europe/Berlin').toPlainDate()` → `2026-09-03`, UTC → `2026-09-02` — `.toPlainDate()` honored die Zone. 2) `Emulation.setTimezoneOverride` auf UTC: `currentISODate()` → `2026-09-10` (systemzonenunabhängig), `formatLetterDate()` → „10. September 2026". Fitness Gate 100 %.

**Generalisierbarkeit:** Für `llm_boilerplate`: „Heute"-Ableitungen gehören in genau ein Modul; `Temporal.Now.plainDateISO()` ohne explizite Zone ist eine Falle (UTC), `zonedDateTimeISO(<Zone>)` + `.toPlainDate()` ist das korrekte Muster. Zwei Formate (Anzeige vs. maschinenlesbar) = zwei klar benannte Exports, keine konfigurierbare Zusammensetzung.

## 2026-09-10 — Postvermerk-Review geprüft und abgelehnt: R3 widerspricht der Select-Doktrin

**Kontext:** Externe Logik-Analyse präsentierte fünf Regeln (R1 Default-unsichtbar, R2 Select füllt+sichtbar, R3 „leer+Blur → unsichtbar", R4 „— kein —" blendet aus, R5 Select überschreibt manuellen Text) und empfahl Umbau auf Zustandsklasse `.has-postvermerk` + ~25 Zeilen Blur-JS. Behauptungen gegen den echten Code verifiziert:

1. **Zitiertes CSS existiert nicht:** `din-postvermerk:not(:empty)` wurde bereits 2026-09-08 entfernt (Commit df30c58, Owner-Korrektur „Feld strikt vom Select gesteuert"). Sichtbarkeit ist heute rein `:root:has(#sidebar-pv-select option:checked:not([value=""]))` (layout.css:40, floating.css:404). Die zentrale Prämisse („:not(:empty) macht R3 unmöglich") trifft den IST-Zustand nicht.
2. **R5-Behauptung falsch:** „syncPostvermerkFromSidebar Empty-Guard widerspricht R5" — nein: `boot-state.js:70-75` registriert Listener mit `applyPv()` (Default `overwrite=true`) und überschreibt manuellen Text bei jeder aktiven Select-Wahl. Der Guard in `main.js:27` schützt ausschließlich den Draft-Restore (soll manuell getippten Text nicht vernichten — korrekt). R5 ist erfüllt.
3. **R1/R2/R4/R5 sind alle erfüllt** mit purem CSS (`:has()`) + minimalen Fills. Nur R3 ist nie implementiert gewesen — bewusst.

**Entscheidung (Owner):** IST-Zustand behalten. R3 erzeugt ein inkonsistentes Drei-Zustands-Grau (Select zeigt „Einschreiben", Feld ist weg) und steht im Widerspruch zur zwei Tage alten Select-Master-Doktrin. Zusätzlich widerspricht sich der Vorschlag selbst: seine Edge-Case-Tabelle fordert „Feld leeren + Klick → verschwindet", sein eigener Code (`hasSelectValue || hasText` + Blur-Bedingung `!sel.value`) lässt das Feld bei gewähltem Select sichtbar. Der Umbau (CSS `:has()` → JS-Zustandsklasse über 3 Dateien) verletzte Economy (HTML vor CSS vor JS).

**Gültiger Restbefund:** Die Select-Sync-Logik liegt funktional widerspruchsfrei, aber redundant in zwei Modulen (boot-state.js: R5-Overwrite + FOUC-Fill; main.js: Draft-Restore-Fill). Kein Bug, bewusste Trennung Boot/Rest-Verhalten — wird nur bei künftiger Änderung an dieser Logik konsolidiert.

**Abschluss (Owner, 2026-09-10): R3 endgültig gestrichen.** Das Regelwerk lautet final: **R1** (Default unsichtbar), **R2** (Select-Wahl → sichtbar + Text gesetzt), **R4** („— kein —" → unsichtbar), **R5** (aktive Select-Wahl überschreibt manuellen Text). Ein leer gelassenes, sichtbares Feld zeigt den Placeholder-Hint und bleibt solange bestehen, bis der Select auf „— kein —" gestellt wird. Kein Blur-abhängiges Ausblenden — der Select ist alleiniger Master der Sichtbarkeit (dokumentiert im HTML-Kommentar bei `#sidebar-pv-select`).

**Generalisierbarkeit:** Für `llm_boilerplate`: AI-Reviews müssen gegen den aktuellen Commit geprüft werden, nicht gegen zitierte Snippets — veraltete Prämisse invalidiert die gesamte Folgerungskette. Zustandsgetriebene Sichtbarkeit über `:has()`-Selektoren dokumentieren und in Reviews als bewusste Architektur verteidigen, nicht als „Fallback" abwerten.

## 2026-09-10 — Sanitizer-Dedup + Low-Risk-Räumen (ChatGPT-JS-Review, gegen echten Code verifiziert)

**Kontext:** ChatGPT-Vollüberblick über alle 18 JS-Module. Umsetzung nach Einzelverifikation: (1) duplizierter Rich-Text-Sanitizer aus `01-draft-manager.js`/`31-format-toolbar.js` (zeilenweise identisch: Allowlist B/STRONG/U/S/BLOCKQUOTE + `span.din-comment`) in neues Modul `04-sanitize.js` extrahiert — Verhalten unverändert (Unwrap statt Strip, bewusst); Numerik: 0x-Core-Layer, Konsum von 01 (Draft-Restore) und 31 (Paste/Drop). (2) `this.paper` (03, nur Zuweisung) entfernt. (3) Zombie-Defaults `recipientType`/`dateFormat`/`addressProvider` aus `51-storage.js` entfernt (null Leser/Writer). (4) `Constants.LIMITS.HISTORY_MAX_ITEMS` in 01 verdrahtet statt hartem `50` (Konstante nutzen statt löschen — zentrale Config-Doktrin).

**Widerlegte Claims:** `_updateDocumentTitle()` ist NICHT tot (Aufruf `01:58` im Save-Pfad, `document.title = Betreff` ist lebendes Feature); Geoapify-„Offline-Doctrine-Konflikt" ist die dokumentierte A38-Owner-Entscheidung (optionale Tier-2-Fach-API), kein Fund. Abgelehnt: AI-Addon-Writer-Fix (D) und Platform-Guard-Entfernung (F) — Owner-Entscheid steht aus.

**Verifikation:** Fitness Gate 100 % (vorher 99,87 %: JSDoc-Block mit `/*` statt `/**` — Annotationspflicht unter `// @ts-check`). Live (CDP, frischer Tab, cache-disabled): 0 Konsolenfehler; Unit-Import-Test von `sanitizeRichText`; echter Paste-Pfad via `ClipboardEvent` + `DataTransfer` (text/html): `img`/`onerror` gestrippt, `blockquote`/`u`/`span.din-comment` erhalten. −35 Zeilen netto (63/98).

**Generalisierbarkeit:** Für `llm_boilerplate`: gemeinsame Sicherheitsgrenzen (Sanitizer) gehören in genau ein numerisch niedriges Utility-Modul; `@ts-check` erfordert `/**`-JSDoc (nicht `/*`); Reviews von Modularchitekturen müssen A-Allowlist-Kontext (z. B. Geoapify/A38) kennen, sonst melden sie dokumentierte Entscheidungen als „Doctrine Conflict".

## 2026-09-10 — Grok-Website-Review: 5 Batches umgesetzt (alle Claims gegen Code verifiziert)

**Kontext:** Grok-Vollreview über `website/` (HTML/CSS/JS/data). Umgesetzt nach Einzelverifikation in 5 Commits:

1. **Trivial (09672ea):** Tote `:has(#btn-font-sans/:serif)`-Regeln (variables.css) entfernt; BOM aus 31-format-toolbar.js gestrippt; `@layer`-Duplikat in variables.css entfernt — dabei echter Fund: das File lädt via `layer="tokens"`, seine `@layer`-Zeile legte also **nested** Layers an, keine Top-Level-Ordnung (HTML-Inline-Statement bleibt einziger Owner); HTML-Guard `index.html:173` präzisiert (LF-Empirie: Umbrüche werden NICHT nativ geblockt, Keydown-Guard bleibt).
2. **C1+C2+C3+H1 (845b561):** Boot-Restore ohne `setHTML` — Rich-Felder (`brieftext`/`anlagen-text`) bewusst an DraftManager delegiert (04-sanitize), Rest als `textContent` (Draft speichert Nicht-Rich-Felder ohnehin als textContent); boot-theme injiziert Custom-Font nur bei `data:*/*;base64,<Base64>`-Regex (Charset-Check macht CSS-Injection unmöglich, Mime flexibel wg. readAsDataURL → application/octet-stream); Undo/Redo auf `din-a4` gescoped + Shift+Ctrl+Z = Redo (vorher fiel jedes z auf undo()); Theme-Default `'auto'` überall (51-storage war 'light').
3. **H2 (d229e81):** Geoapify-Key-Wipe nur bei HTTP 401/403 (vorher löschte jeder Non-Abort-Fehler den Key); 429/5xx/Netzwerk → Warn-Toast, Key bleibt. Target-Lock doku-konform: laut Geoapify-apidocs (Context7) ist `postcode:` kein Filter-Typ und mehrere `filter=`-Params überschreiben sich — Lock jetzt via dokumentiertem Pattern „Straße, PLZ Ort" im `text`-Param; Cache-Key lock-sensitiv.
4. **H3 (b26688f):** `plz-embedded.js` (164 KB) vom statischen Modulgraphen entfernt — Dynamic-Import nur im Fallback (file:// / fehlende .gz). Live: `plz-embedded.js` im Resource-Timing ABWESEND, PLZ-Engine lebt via .gz-Fetch (50667→Köln, 17 Bonn-PLZs).
5. **H5 (cacad61):** AI-Addon von obsoletem `window.ai.*` auf Chrome-Globals portiert (`'Rewriter' in self`, Enum available/downloadable/downloading; Quellen: Chromium chrome-ai-dev-preview-Mailingliste + 2026-Dokus). Toter `writerInstance` + Writer-Tracking entfernt — Capability-Meldung konsistent. `Rewriter`-Deklaration in webapi.d.ts. Live (Chrome 151 ohne Flag): kein Global → supported:false, 0 Exceptions.

**Abgelehnt/vertagt:** M2 (Anlagen-UL/LI-Parameterisierung — Strukturverlust real, aber kein Datenverlust; Design-Entscheid nötig), M1 (A11y — eigener Batch), H4 (CRP/CSS-Bündelung — localhost-fine, Pages-Sache), M4 (CSP — nach Font-Guard M4-Hürden reduziert, eigener Batch), M5/M6/M7 Details (sender-sync input-Kaskade, README-Formulierung, document.title). **Neuer Zombie-Fund:** `body.font-stack-sans/serif` (reset.css:37-41) werden von nichts gesetzt — Kandidat für nächste Räumung nach Owner-Bestätigung.

**Verifikation:** Fitness Gate 100 % nach jedem Batch; CDP-Live-Checks pro Batch (poisoned-font-Probe, Boot-Restore mit din-comment, Undo-Scope sidebar/sheet/shiftZ, PLZ-Resource-Timing, AI-Feature-Detect). Diag-Lektion: `defaultPrevented` in Capture-Phase messen liefert immer false — Bubble-Phase prüfen.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Boot-Skripte dürfen keine HTML-Restore-Logik duplizieren — ein Owner pro Datenpfad; (2) String-in-CSS-Injektion braucht Charset-Regex, keine Prefix-Whitelist (Mime variiert je OS); (3) fremde API-Filter-Params vor dem Bugfix gegen die Doku lesen — der Doku-Befund änderte den Fix-Ansatz komplett.

## 2026-09-11 — H2-Fixes live gegen echte Geoapify-API verifiziert (Owner-Key)

**Kontext:** Owner stellte den API-Key zur Verfügung; die H2-Fixes (Key-Wipe, Target-Lock) waren bisher nur Code-Review-verifiziert. Live-Tests in der echten App (CDP, echte UI-Flows) plus direkte API-Vergleiche:

1. **429-Verhalten (fetch-Stub):** Key überlebt, Warn-Toast „⚠️ vorübergehend nicht erreichbar (Status 429)" — alter Bug (Wipe bei jedem Fehler) behoben.
2. **401-Verhalten (echte API):** Key wird gewiped + Toast „❌ ungültig oder abgelaufen". (Erste Messung verpasste den Toast — Capture-Timing, MutationObserver-Rerun bestätigt.)
3. **Basis-Autocomplete:** echter Key liefert korrekte Bonn-Adressen (Adenauerallee → 53113/53111).
4. **Target-Lock (Text-Pattern „Straße, PLZ Ort"):** dreifach verifiziert — (a) „Am Hauptgericht, 53177 Bonn" → 53177 auf Platz 1 (ohne Kontext matcht die Straße GAR nicht); (b) „Hauptstraße, 10115 Berlin" → nur noch 10827 Berlin (5 Treffer identisch) statt deutschlandweiter Streuung; (c) Straße, die in der Ziel-PLZ nicht existiert (Bahnhofstraße/Bad Godesberg) → korrekter Fallback auf nächste gleiche-Stadt-PLZ (53123 Bonn), kein Lock-Fehler. `boundary.circle` wurde als Alternative getestet und verworfen (Kombination `|countrycode:de` liefert leere Sets, Syntax fragil).

**Verifikation:** Alle Tests gegen `https://api.geoapify.com` mit echtem Key; HTTP-Statuscodes direkt geprüft (200 mit echten Payloads, kein Rate-Limit). Key nach dem 401-Test im App-Storage wiederhergestellt.

**Generalisierbarkeit:** Für `llm_boilerplate`: Live-Tests gegen die echte API schlagen Code-Review-Verifikation — der Test FAND den echten Verhaltensnachweis für das Text-Pattern, das Review nur „dokumentiert plausibel" bewertet hatte. Test-Toasts mit MutationObserver observieren statt Endzustand lesen (Toast-Timing).

## 2026-09-11 — Grok-Re-Review: 4 Batches (Blocker-Fixes, CSP, a11y)

**Kontext:** Grok bestätigte alle bisherigen Fixes (C1-C3, H1-H3, Font-Doktrin, Geoapify) und meldete zwei unvollendete Stellen + einen Datenverlust. Umgesetzt nach Verifikation:

1. **H5-Finish (9ecbed6):** `init()` retournierte weiterhin beim obsoleten `window.ai`-Gate VOR `_checkAvailability()` — der Port war produktions-tot (eigener unvollständiger Port, Grok gefunden). Gate gelöscht, Feature-Detect nur `'Rewriter' in self`.
2. **M2-Datenverlust (9ecbed6):** REAL — Sanitizer flattete UL/LI, `ensureListStructure` behandelte Text-Nodes als leer (`children.length===0` ignoriert Text!) und wippte via `replaceChildren(li)`. Fix: (a) `sanitizeRichText(html, { extraTags: ['UL','LI'] })` nur für anlagen-text (keine Attribute); (b) wrap-don't-wipe: Text-Nodes werden zeilenweise in `<li>` gewickelt statt gelöscht; (c) 2 Unit-Tests (LI-Restore + Wrap-Pfad). `#placeCaretIn` extrahiert.
3. **Toast-Ruhe + Danger-Token (aa5ad62):** Success-Toasts (Key gültig / Adresse übernommen) entfernt — verletzen die eigene TOASTS-Policy; Toast-Node `role="status"`/`aria-live="polite"` statt assertiver Alerts; `var(--danger-color)` (undefined) → `var(--c-danger)`.
4. **Font-Guard-Politur (72e5431):** Regex erlaubt optional `;charset=`; `font-custom-active`-Klasse in boot-state an denselben Base64-Gate gekoppelt (kein AptosCustom-Wunsch ohne registrierte Font).
5. **CSP (2499072):** `<meta http-equiv="Content-Security-Policy">` ohne 'unsafe-inline'/'unsafe-eval'. Voraussetzungen geschaffen: (a) Inline-`<style>@layer</style>` → **non-layered** `css/layers.css` als erster Stylesheet-Link (variables.css-Lektion: layer-Attribut + @layer-Statement = nested Layers); (b) Boot-Font-Injektion via `new FontFace` statt konstruiertem `<style>`-String. Live: 0 CSP-Violations, Layers/Theme/Guides intakt, Geoapify-Fetch 200.
6. **a11y Top-3 (2499072 + df194e3):** data-ui-Text jetzt als echte Text-Nodes (20 single-line Elemente + GitHub-Link; AT- und Select-to-Copy-tauglich), CSS-`content: attr(data-ui)`-Regeln entfernt (dynamische Zustands-Strings data-appearance/data-font-mode bewusst im CSS belassen — aria-label vorhanden). Tastaturpfad: **natives Ctrl+B führt in contenteditable NICHT zu <b> (live verifiziert)** — daher scoped keydown auf #brieftext → toggleFormat('B'/'U'), kein document-Hijack (C3-Lektion).

**Verifikation:** Gate 100 % nach jedem Batch (inkl. 2 neuer M2-Tests). Live (CDP): CSP-Reload ohne Violations; Geoapify-Fetch unter CSP 200; Labels echt (8 h3s, Form A, GitHub, Print-Btn, ::before=none); Ctrl+B real-keystroke → `<b>Brief</b>`; M2-Unit-Tests im Gate.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) unvollständige Ports passieren bei Multi-Punkt-Refactor — jede neu eingeführte Feature-Detect muss ALLE alten Gates derselben API finden (rg auf den API-Namen, nicht nur die benutzte Stelle); (b) `children.length===0` ist ein Wipe-Bug bei contenteditable (Text-Nodes zählen nicht) — wrap-don't-wipe ist das Default-Rettungsmuster; (c) CSP-fähige Zero-Build-App: @layer-Deklaration in non-layered Datei, FontFace statt Style-String, dann strict style-src.

## 2026-09-11 — Persistence-Block: .dinletter + schema_version + Autosave-Indikator (DeepSeek-Longevity-Review)

**Kontext:** DeepSeek-Longevity-Analyse (Owner mit >> annotiert): Import/Export als „wundester Punkt" bestätigt. Umgesetzt:

1. **`.dinletter` (52-import-export.js, neu):** JSON-Format mit Header `format/schema_version/app/created/tool` + Draft-Payload 1:1 aus `din_draft_current`. Export schreibt erst den Live-Draft (`onSaveDraft`) und lädt via Blob-Download (Dateiname = `buildLetterFileName()`). Import: File-Input → Validierung → Confirm-Dialog → `localStorage` + `location.reload()` — Restore läuft ausschließlich über den bewährten Boot-Pfad (EIN Owner, C1-Lektion). Pure Funktionen (`buildDinLetterPayload`/`parseDinLetterPayload`) sind unit-getestet (Roundtrip + 5 Fehlerfälle). `created` via `currentISODate()` (A48 — ein versehentlicher `new Date()`-Versuch wurde noch im Editor abgefangen).
2. **`SCHEMA_VERSION` + `migrate()`:** Konstante in `Constants` (Konsumenten: migrate + .dinletter-Header), `StorageManager.migrate()` stampft `din_schema_version` idempotent; Aufruf in `main.js` **vor** `loadDraft()`. Migrationsschritte künftig sequenziell.
3. **`buildLetterFileName()`** aus `53-metadata.js` extrahiert — PDF und Export nutzen denselben Namen (Single Source).
4. **Autosave-Indikator:** `#save-status`-Dot im Sidebar-Footer (grün/orange/rot, echte Text-Nodes + `role="status"`, print-css-safe) — getrieben aus `DraftManager.#setSaveStatus` (dirty bei scheduleAutoSave, saved/error bei saveDraft).

**Verifikation:** Gate 100 %; Testsuite **11/11** (echter Lauf via test/index.html, +3 .dinletter-Tests); Live (CDP): Export-Payload korrekt (format/schema/created/tool/draft), Import-Dialog → confirm → Storage aktualisiert → Reload, invalide Datei → Fehler-Toast ohne Dialog, Status-Dot dirty→saved, Boot-Diag clean.

**🚨 Gate-Fund (wichtig für zukünftige Agenten):** Der Fitness-Gate meldete die fehlgeschlagenen M2-Tests (fehlende `#anlagen-text`-Fixture) als 100 % — die Test-Komponente des Gates ist **nicht zuverlässig**. `node tools/build_db.js` allein genügt NICHT; echte Testläufe über `test/index.html` (Port 8890) sind Pflicht bei Test-Änderungen. Auch das Fix-Verhalten der Fixture: `#anlagen-text` fehlte komplett (M2-Tests crasheden mit „Test-Fixture fehlt") — jetzt gespiegelt wie in der App (UL + contenteditable=true).

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Datenformat vor Persistenz-Logik designen: Header-Version + reines JSON schlägt jedes binäre Format für 10-Jahres-Lesbarkeit; (b) Import = Validieren + Bestätigen + Neu-Booten, niemals ein zweiter Restore-Pfad; (c) Save-Status als Zustandsklassen statt Toasts — Erfolg ist still (TOASTS-Policy), Fehler wird sichtbar.

## 2026-09-12 — .dinletter-Härtung nach Grok-Persistence-Review (Verdicts umgesetzt)

**Kontext:** Grok bewertete die Frictions F1–F7 + 7 Bugs im Persistence-Block. Umgesetzt nach Verifikation:

**Adoptiert:** BOM-Strip in parse (F4 — Notepad/editors schreiben \uFEFF); 512-KB-Import-Cap (Bug 5 — main-thread-JSON.parse eines GB-Drops); Prototyp-Hygiene (F2-reject-list: Blacklist `__proto__`/`constructor`/`prototype` + `^[A-Za-z][\w-]*$`-Id-Pattern + `Object.create(null)` — Import kann weiterhin nur `din_draft_current` schreiben, aber Junk-Keys/Prototype-Pollution werden jetzt an der Quelle abgelehnt); Reload-Toast entfernt (Bug 1 — paintet nie + verletzt Success-still); `saveDraft()` gibt `bool` zurück und Export bricht bei Save-Fehler ab (Bug 3 — kein stale/leerer Export); Status-Dot `saved` nach `loadDraft` (F6); migrate-Stamp-and-skip-Vorwarnung als Kommentar (Bug 4 — Import MUSS file.schema_version → CURRENT transformieren, sobald Migrationsschritte existieren); `buildLetterFileName()` splittet auf `•`+`,` (Bug 6 — Rücksendezeile ist "M. Name • Straße • Ort", sonst schluckt der Name Straße+Ort).

**Verworfen (Grok-Verdicts bestätigt):** F1 (format_version/SHA-256/settings-Payload — „Notepad-editierbarer Hash ist Theatre", Draft-only ist der Privacy-Default), F3 (FSA-Picker — Permission-Chrome + file://-Hostilität, `<a download>` bleibt), F5 (Backup-Reminder — erst wenn jemand einen Brief verliert; höchstens später ein Titel-Attribut), F6-idle (vierter Zustand = Clutter), F7 (in-place-hydrate — Reimplementierung von boot = zweite Orchestrationsquelle; reload ist der getestete Pfad).

**Verifikation:** Tests **13/13** (echter Lauf, +BOM +Hygiene-Tests), Gate 100 %. Live (CDP): Boot-Dot = „Gespeichert", Filename-Split korrekt, `__proto__`-Datei via echte UI → Fehler-Toast „Ungültiger Feldname", kein Dialog.

**Diag-Lektionen:** (a) `{ '__proto__': 'x' }` als JS-Objektliteral setzt den Prototyp statt einen eigenen Key — Prototyp-Hygiene-Tests müssen Roh-JSON-Strings nutzen; (b) der B2-Detektor grept verbotene API-Literale auch in Kommentaren — Guards umschreiben, nicht zitieren; (c) mein erster `return saved;` stand vor der Undo-Snapshot-Logik (Return-Wert-Konsolidierung: Early-Returns dürfen Nebenpfade nicht schließen).

## 2026-09-12 — Chromium-2025/2026-Feature-Liste empirisch geprüft (Grok) — 18 Verdicts

**Methode:** Repo-Realität zuerst (rg), dann Live-Empirie in Chrome 151 via CDP (Projekt-Doktrin: Empirie schlägt Release-Notizen). Kernbefund: **Items 1, 2, 4, 6, 16 sind bereits umgesetzt** (commandfor ×5, popover="hint", focusgroup ×3, attr() L5 ×17 in sheet.css, element-scoped View Transitions in 02-settings-manager:93) — Grok übersieht den Ist-Stand; `BASELINE_RATIO` existiert nicht (erfundener Code).

**Verdicts (empirisch belegt):**
- **@function (CSS Custom Functions): ✅ parst in Chrome 151** — einziges neues Feature mit echtem Nutzen (Alt-Todo „28× calc in sheet.css").
- **ariaNotify: ✅ verfügbar** (`typeof document.ariaNotify === 'function'`) — Toast-Ansagen statt Live-Region-Zusatz; `role="status"` bleibt, Success-still-Policy bleibt.
- **::search-text (M144):** Ctrl+F-Kontrast vs. din-comment — 1 Selektor.
- **Sanitizer API (M146): 🧪 Live-Experiment gelaufen — REJECT.** `span.din-comment`+class und `ul/li` überleben ✓, ABER auch `<i>` und `<img src=x>` (nur onerror gestrippt). Plattformmodell ist safe-by-default-Profil, nicht exakte Allowlist (img MUSS verschwinden, i MUSS un-wrapped werden). 04-sanitize.js bleibt getestete Sicherheitsgrenze.
- **Unshipped (live bestätigt, nicht nutzbar):** interestfor (false in 151), clipboardchange (false), @custom-media (parst nicht), named-feature() (false — Groks „M150"-Claim falsch).
- **Doktrin-Konflikt REJECT:** line-clamp/text-overflow auf Brief-Feldern = stiller Datenverlust (Ellipsis auf Papier) — `text-fit: shrink` (A49) bleibt: Inhalt verkleinert, nie abgeschnitten.
- **Deferred (Produkt-Entscheid):** Web Install, Window Controls Overlay, Web Preferences, Openable API, clipboardchange-Parser-Hint.
- **Ignoriert (falsche Domäne/A34):** FSA-write, FileSystemObserver, EditContext, HTML Modules, Scoped Registry, `<geolocation>`, Rewriter-in-Core, WebGPU/FedCM/WebTransport-etc.

**Generalisierbarkeit:** Für `llm_boilerplate`: Feature-Listen von LLMs (1) gegen den eigenen Repo-Stand abgleichen bevor „Einbauen" — die Hälfte ist meist schon drin; (2) empirisch in der Ziel-Chrome-Version testen (Parse-/API-Probes via CDP), Release-Notizen lügen nicht, aber Versions-Zuordnungen sind unzuverlässig; (3) Plattform-Sanitizer ≠ exakte Allowlist — Sicherheitsgrenzen werden durch einen Test-Fixture ersetzt, nicht durch Namensähnlichkeit.

## 2026-09-12 — @function-Dedup + Mini-a11y (::search-text, ariaNotify) umgesetzt

**Umsetzung (Batch 2+3 der Chromium-Verdicts):**
1. **@function-Dedup (Alt-Todo erledigt):** 51 calc-Duplikate in sheet.css durch drei Custom Functions ersetzt — `--mm-x(mm)` (horizontal → cqw), `--mm-y(mm)` (vertikal → cqh), `--pt(N)` (Schriftgröße → 0.168cqw). Funktionen wohnen in variables.css (Tokens-Layer) mit Guard: „NIEMALS hart `calc(X / var(--din-*) * 100cq*)` daneben schreiben". calc-Bestand: 28 → 3 (Seitenverhältnis-Fit + oklch-Box-Shadow bleiben bewusst).
2. **::search-text** in floating.css: Ctrl+F-Treffer kontrastieren gegen Papier + din-comment (CSS.supports bestätigt supported in 151).
3. **ariaNotify** in 01-draft-manager: Save-FEHLER werden per `document.ariaNotify(..., {priority:'important'})` angesagt (unsichtbarer Status-Dot wird auditierbar; Success bleibt still per TOASTS-Policy; `role="status"` am Toast unverändert). Ambient-Deklaration in webapi.d.ts.

**Verifikation:** DIN-Vermaßung nach Refactor **live identisch** (Falz 105/210 mm, Lochmarke 148,5 mm, Fluchtrand 25 mm — die im Code stehennden HTML-Attribut-Werte sind Form-B, nicht 110/220 wie vorher fälschlich im Diag angenommen); Tests 13/13; Gate 100 %; ::search-text-Probe green; Boot-Dot „Gespeichert".

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) DIN-Vermaßung über Custom Functions statt harter calc-Duplikate — Abweichler werden sichtbar statt still verfälscht; (b) ariaNotify-Feature-Detect (typeof) mit Fallback: Status-Dot bleibt die visuelle Quelle; (c) Regelfall beim Feature-Audit: erst Repo-Grep („schon drin?"), dann Empirie („shipped?"), erst dann Design.

## 2026-09-26 — CSS-Review-Triage (ChatGPT) + Mini-Cleanups (Layout-Guard, toter Code, Doku-Drift)

**Kontext:** Externes ChatGPT-Review zu `website/index.html` und `website/css/layout.css`. Jeder Punkt vor Umsetzung gegen Repo-Ist-Stand und Upstream (Spec/MDN) geprüft — nichts blind übernommen.

**Verworfen (Review-Fehlschluss):** „`text-fit` nicht abgesichert" — PoC in Chrome 151 existiert (`web-standards-tracking.md:144-160`: `contain` verworfen, `shrink`/`shrink 60%` gültig). „`field-sizing` betrifft `contenteditable`" — korrekt und belegt: `css-forms-1 §7.1` = „elements with default preferred size", MDN listet nur Form-Controls → die Deklaration ist auf `<din-*>` inert (nicht schädlich; getragen von `text-fit` + fixen Zonenbreiten; `ADR-CSS:76` überzeichnet). „`padding: 3cqh` auf `#viewport`" — falsch: Container-Einheiten lösen gegen den **Vorfahren**-Container auf, nicht gegen sich selbst. Ferner Nicht-Themen/dokumentierte Entscheidungen: `100vw`-Scrollbar (`overflow:hidden` überall), `form-action` vs. `method="dialog"` (MDN: kein Submit/Navigation), `.hidden`→`[hidden]`, `role=article/group` (ADR-HTML §3).

**Umgesetzt (5 Mini-Cleanups):** (1) `layout.css:90` `calc(8 * 0.168cqw)` → `--pt(8)` — echter Guard-Verstoß (`variables.css:90-103` verbietet die Rohform ausdrücklich); (2) toter `.radio-menu`-Block + ungenutztes `.mb-0` gelöscht; (3) doppeltes `display:none` bei `din-postvermerk` entfernt (Gruppenregel `:31` deckt Default); (4) `ADR-CSS:76/186/194/269` `text-fit: contain` → `shrink` (Doku-Drift gegen PoC).

**Verifikation:** Gate 100 % (vor + nach); grep clean (`text-fit: contain`/`radio-menu`/`mb-0`/rohe calc-Form); `din-postvermerk`-Default weiterhin über die Gruppenregel.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) LLM-Reviews zuerst gegen Repo-Ist-Stand + eigene Empirie prüfen — die Mehrheit der „Funde" ist bereits umgesetzt oder dokumentiert (gleiches Muster wie 2026-09-12); (b) ein Review-Wunsch „bitte kommentieren/verifizieren" kann einen echten Guard-Verstoß verdecken (hier calc→`--pt`) — Fundort selbst nachmessen, nicht die Review-Kategorie übernehmen; (c) Plattform-Claims (`field-sizing`, Container-Units) gegen Spec-Paragraf statt gegen Bauchgefühl prüfen, sonst baut man eine Regression ein.

## 2026-09-26 — variables.css-Aufräumen (tote Tokens, guide-opacity-Dedup, --pt-SSOT)

**Kontext:** ChatGPT-Review zu `website/css/variables.css`. Gegen Verbraucher/Setzer geprüft (Layer-Reihenfolge `index.html:15-23`) — die eigentlichen Funde hatte das Review übersehen.

**Review-KEEP (bestätigt):** `@layer`-Kommentar; `@property --guide-opacity` (`inherits: true` ist load-bearing: `:root`-Set + `sheet.css:111`-Consume + Transition `variables.css:19`); `light-dark()`-Struktur; `data-theme="auto"`-Explizitheit; `--bg-sidebar-glass`; `--accent-hover` (1 Verwendung, aber semantischer Token); `[popover] { color-scheme: inherit }`.

**Umgesetzt:** (1) **5 tote Tokens entfernt** (nichts im Repo liest sie): `--guide-color`, `--paper-zoom`, `--shadow-sm`, `--accent-muted` + Kette `--c-accent-muted-day/night`, `--border-color-focus` (war nur vom bereits gelöschten toten `.radio-menu` referenziert). (2) **`--guide-opacity` dedupliziert:** tote `0.15` in `sidebar.css` (layout-Layer) entfernt — wurde nachweislich von `:root:has(#btn-guides-switch:checked){--guide-opacity:0.55}` in `floating.css` (floating-Layer, identischer Selektor) überschrieben; Default nur noch einmal (`variables.css:79`), floating-Dublette weg. (3) **`--pt()` bindet die Blattbreite an `var(--din-width)`** statt Magic-Constant `0.168cqw` (mathematisch identisch: 0.3528/210·100 = 0.168). (4) `tools/reconciliation.js`: Feature-Check „CSS Relative Color Syntax" zeigte auf `variables.css`, wo die Syntax nur im toten `--guide-color` stand → Anker auf `sheet.css` (6 echte `oklch(from …)`-Verwendungen) korrigiert.

**Verifikation:** Gate **100 %** (vor + nach; zwischenzeitlich 96,43 % wegen des Feature-Ankers — gefunden und behoben), grep clean (keine Referenz auf entfernte Tokens; `--guide-opacity` nur noch 1 Default + 1 Override + `@property`), `--pt`-Ergebnis mathematisch identisch. Rollback-Punkt: git.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) **Tote-Token-Scan** (definiert, aber nirgends per `var()` gelesen) findet echten Ballast, den ein Schönheits-Review nicht sieht — aber Primitive, die nur intern in derselben Datei referenziert werden, gehören NICHT in den „unused"-Topf; (b) **über Layer überschriebene Werte sind still tot** (identischer Selektor, spätere Lage gewinnt) — Layer-Reihenfolge beim Dedup zwingend prüfen; (c) Feature-Checks an den Ort echter Nutzung binden, nicht an die Datei, in der ein Token zufällig wohnt.

## 2026-09-26 — print.css: toten `.pv-select`-Block entfernt

**Kontext:** ChatGPT-Review zu `website/css/print.css`. Alle 12 Review-Punkte als KEEP bestätigt; der als „bitte prüfen" markierte `.pv-select`-Selektor war der einzige echte Fund.

**Befund:** `print.css` stylte `.pv-select`/`.pv-select::picker-icon`. Kein Element trägt diese Klasse — das echte Select ist `index.html:80` (`id="sidebar-pv-select" class="sidebar-select sidebar-pv-select"`); Klassen-Matching ist tokenweise, `.pv-select` ≠ `sidebar-pv-select`. Zusätzlich konzeptionell wirkungslos: das Select liegt im `<aside>`, das `print.css:20` per `display:none !important` ausblendet; der gedruckte Postvermerk läuft über `din-postvermerk` (JS-Spiegel). Rename-Leiche (vgl. `layout.css:114-118`, alte `.pv-item`-Regeln dort bereits entfernt).

**Umgesetzt:** `.pv-select` + `.pv-select::picker-icon` (9 Zeilen) entfernt. Übrige Punkte bewusst KEEP: `@page` (`size`/`margin`/`page-margin-safety`, im Datei-Kommentar belegt + PoC in `web-standards-tracking.md`), App-Shell-/`#viewport`-Print-Reset inkl. `container-type: normal`, `din-a4`-mm via `attr()`-SSOT, `[popover]`/`.no-print`/`[data-generated]`/Contenteditable-Reset, `page-break-after: avoid` (ein Blatt/Dokument), `#absender`-Drucklinie.

**Verifikation:** Gate **100 %** (vor + nach), grep clean; übrige Selektoren als live bestätigt (`no-print` 8×, `[placeholder]` 18×, `data-generated` gesetzt in `41-salutation-engine.js:326`).

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Klassen-Selektoren nach Umbenennungen per **Token-Vergleich** prüfen, nicht per Substring — `.pv-select` matcht `sidebar-pv-select` nicht; (b) ein Selektor kann zugleich **syntaktisch tot** (falsche Klasse) und **konzeptionell tot** (Element liegt in `display:none`-Container) sein — beides prüfen, bevor man ihn „repariert"; (c) Print-CSS selektoren auf Elemente in ausgeblendeten Containern sind immer Karteileichen.

## 2026-09-26 — Chrome-only-Aufräumen: reset.css + signature.css (Firefox-Rest, Dubletten, Font-SSOT, Datei-Organisation)

**Kontext:** ChatGPT-Review zu `layers.css`/`reset.css`/`signature.css`. Baseline bestätigt: **Chrome 150+, kein Firefox/Safari** (`Immutable-Law-Catalog.md:37`). Alle KEEPs bestätigt; ein echter Rest + drei optionale Redundanzen umgesetzt.

**Umgesetzt:** (1) `reset.css`: `-moz-osx-font-smoothing: grayscale` entfernt — Firefox-only, in Chromium No-op (Chrome-only-Baseline). (2) `reset.css`: `html { color-scheme: light dark }` entfernt — war von `:root { color-scheme: light dark }` (`variables.css:16`; höhere Spezifität *und* spätere Lage, gleiches Element) vollständig verdeckt. (3) `reset.css`: UI-Font-Literal durch `var(--font-active-stack)` ersetzt (SSOT; Token wird nie mutiert, Custom-Font läuft über `body.font-custom-active` via `02-settings-manager.js:145`). (4) `#btn-font-action`-Visualblock von `signature.css` nach `sidebar.css` verschoben (Schriftarten-Manager-CSS gehört nicht zur Unterschrift; beide `layout`-Layer → kaskadisch neutral, kein Konkurrenz-Selektor, vorher per grep verifiziert).

**Bewusst KEEP:** `layers.css` + Kommentar; `100vw/100dvh + overflow:hidden`; Reduced-Motion-Kill-Switch; `-webkit-font-smoothing` (wirkt in Chromium); `signature.css` pointer-events-Architektur, `:has()`-States, JS-inline `translate/rotate/scale` (`42-signature.js:158-160`), `touch-action:none`, `mix-blend-mode:multiply` (Print-QA), `z-index:100`. `max-width:100%` auf `#signature-image` ist **No-op** (Prozent-`max-width` gegen shrink-to-fit-inline-block in 0-Breite-Container → als `none` aufgelöst) — kein Defekt.

**Verifikation:** Gate **100 %** (vor + nach); grep: kein `-moz-`/`color-scheme` mehr in `reset.css`, `#btn-font-action`-Visualblock genau einmal (`sidebar.css:314`), `floating.css`-`:before`-Labels unverändert.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) bei Chrome-only-Baseline Vendor-Prefixe der Nicht-Ziel-Engines (`-moz-*`) als toten Ballast entfernen; (b) doppelte `color-scheme`-Deklarationen sind still verdeckt (`:root` schlägt `html` per Spezifität) — eine Theme-Quelle; (c) Datei-Organisation nach Feature statt Historie: Layout-Layer-Moves sind kaskadisch neutral, solange kein gleichspezifischer Konkurrenz-Selektor existiert — vorher per grep prüfen.

## 2026-09-26 — Repo-Aufräumen (Git-Noise + Tippfehler) + Struktur-Verdikt

**Kontext:** User-Eindruck „Ordnerstruktur wie ein Dickicht". Read-only-Inventar des Roots; danach nur das sicher Aufräumbare umgesetzt.

**Umgesetzt:** (1) `.gitignore`: lokalen Tool-/OS-Müll ergänzt — `.directory` (KDE), `.opencode/` + `opencode.json` (Agent/Editor-local-state, konsistent zur bestehenden `.claude/`-Gruppe), `scratch/` (lokale PoC-Testdateien). `git status` damit frei von untracked Noise. (2) Tippfehler-Datei `research/reasearch_changelog.md` → `research/research_changelog.md` (`git mv`) + 2 Referenzen in `docs/30-meta/review2_grok.md` nachgezogen.

**Bewusst NICHT verschoben (gegen den ersten Reflex „nach docs/"):** `specs/` ist vertraglich am Root verankert (`AGENTS.md:65`, `README.md:92`, `docs/30-meta/HYBRID-SPEC-DRIVEN-WORKFLOW.md`, `docs/foundation_inventory.json:326/480`, generiertes `agent/cache/LLM_CONTEXT.md`) — ein Move wäre eine Vertragsänderung über ≥5 Dateien + Gate-Risiko (V6-Frontmatter-Scan), kein Aufräumen. `scratch/` bleibt auf der Platte (Docs zitieren die PoC-Dateien, `jsconfig.json` schließt es aus), nur git-ignoriert. `CLAUDE.md`/`GEMINI.md` sind bewusste Multi-Tool-Einstiegspunkte (Claude Code liest `CLAUDE.md`, Gemini CLI `GEMINI.md`; Memory-Doc: „AI-Lobotomie-Prävention") — kein Nonsense.

**Verifikation:** Gate **100 %** (vor + nach); `git status --short` zeigt nur die 3 beabsichtigten Änderungen.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Root-„Wildwuchs" zuerst klassifizieren (Produkt/Doku/Build/Daten/Agent-Infra/lokaler Müll) statt reflexhaft zusammenzuschieben; (b) „fast leerer Ordner" ≠ Nonsense — vor Verschieben alle Vertrags-/Tool-Referenzen greppen; (c) lokale Tool-/OS-Reste in `.gitignore` (nicht löschen), `scratch` getrennt von versionierten PoC-Belegen behandeln.

## 2026-09-26 — P1: MCP-Retrieval (docs_search/docs_get, FTS5, Abschnitts-Chunking)

**Kontext:** Token-Sparsamkeit — Agenten sollen Dokumente per Suche/Abschnitt lesen, nicht als ganze Dateien. Prüfung ergab: `tools/build_db.js` schreibt nur `build/import.sql` (keine abfragbare DB; enthält `vec0` → mit `node:sqlite` nicht ausführbar), `agent/cache/DIN-Brief_docs.db` ist die **Session-Log**-DB (`tools/log_session.js`), und der „MCP-Server" war bislang **keine** MCP-Implementierung, sondern eine `{"operation":...}`-Zeilen-CLI.

**Umgesetzt:** (1) Neu `agent/mcp/dinbrief-mcp/docs.js` — scannt `.md` des Doku-Korpus, parst Frontmatter, zerlegt in **Abschnitte (H1-H6)** mit echten Datei-Zeilennummern und baut einen FTS5-Index `agent/cache/docs_search.db` (Standalone-`sections_fts`, `bm25`-Ranking, `snippet()`); Auto-Rebuild bei Staleness (mtime); getrennt vom Session-Log-DB (Namenskollision vermieden). (2) `index.js` spricht jetzt echten **MCP-stdio (JSON-RPC 2.0)**: `initialize` / `tools/list` / `tools/call` / `ping`, Tools `docs_search` + `docs_get` (Gerippe oder EIN Abschnitt, nie ganze Datei); der Legacy-`{"operation"}`-Modus bleibt erhalten. (3) `opencode.json`: MCP-Server `dinbrief` registriert; `opencode.json` aus `.gitignore` gelöst (versionierbar). (4) MCP-README aktualisiert.

**Verifikation:** FTS5 in `node:sqlite` v22.22 verifiziert; Index live gebaut (103 Dokumente / 1131 Abschnitte); `docs_search` + `docs_get` + `tools/list` + Legacy-`validate` per stdio getestet; Gate **100 %** (vor + nach). `vec0` fehlt in `node:sqlite` („no such module: vec0") → Vektor-/Semantik-Suche bewusst ausgeklammert.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) **Abschnitts-Chunking statt Datei-Retrieval** ist der eigentliche Token-Hebel — nicht das Format (MD bleibt Source of Truth, SQLite ist abgeleitet); (b) eine Doku-DB braucht einen Rebuild-Trigger (mtime) und eine klare Trennung zu Log-/Generat-DBs; (c) MCP-stdio ohne SDK ist ~60 Zeilen JSON-RPC — die SDK-Dependency ist vermeidbar; (d) Vektor-Suche setzt einen Embedding-Stack voraus, der die Zero-Dependency-Doktrin bricht → erst bei belegtem Bedarf.

## 2026-09-26 — Retrieval/Taxonomie/Automatik (P2–P5 + Phase 1–3)

**Kontext:** Batch aus der Doku-/Retrieval-Liste (P1 war bereits erledigt) plus dem verabschiedeten Phase-Plan.

**Umgesetzt:**
- **Phase 1 / Taxonomie:** `repository.yaml` → `taxonomy` (`allowed_top_level`, `allowed_root_files`, `roles`). `tools/reconciliation.js` → neuer `check_type "taxonomy"`: liest die Allowlists aus `repository.yaml` (SSOT), prüft per `git ls-files`, meldet Unbekanntes als `critical` (Build bricht ab). Negativtest bestanden (Streudatei → critical/99,88 % → 100 % nach Entfernen). Untracked Müll bleibt irrelevant.
- **Phase 2 / Ein Builder:** Neu `tools/docs_index.js` — Abschnitts-Chunking (H1–H6, Zeilennummern), Datei-Inventar (`files` per `git ls-files`), `documents`/`sections`/`sections_fts` (FTS5). `tools/build_db.js` baut den Index im Gate-Lauf mit (**ein Kommando = Gate + Index**). `agent/mcp/dinbrief-mcp/docs.js` → dünne Re-Export-Schicht (keine Doppel-Logik).
- **Phase 3 / Automatik:** `.githooks/pre-commit` (Gate + Index, bricht Commit bei < 100 %) + Aktivierung `git config core.hooksPath .githooks`; `.github/workflows/fitness.yml` als CI-Backstop.
- **P2:** Abschnitts-Chunking — durch den Index erfüllt.
- **P3:** `docs/90-archive/` eingeführt; 8 Einmal-Artefakte (2 Grok-Reviews, `chatgpt-review-prompt`, `PROJECT`, `FOUNDATION-RESTORATION-PLAN`, `architecture-drift-audit-2026-08-27`, 2 Inventar-Snapshots) verschoben; Zeiger in `docs/index.md`, `docs/00-foundation/README.md`, `repository.yaml`, `CLAUDE.md` nachgezogen (DECISION-LOG-Altbezüge bewusst NICHT umgeschrieben = Chronik).
- **P4:** Rollen der zwei Builder klargestellt: `build_db.js` kanonisch, `build_db.py` = optionaler Vektor-Zweig (Phase 4) — in `build_db.py`-Header + `tooling-overview.md`.
- **P5:** Gate-Warnung bei Doku > 400 Zeilen (Ausnahme `DECISION-LOG`/`Code-Referenzen`); feuert aktuell für `sqlite-vec.md` (410).

**Phase 4 (vorgemerkt, belegt machbar):** sqlite-vec läuft auch im Node-Stack — `node:sqlite` mit `{ allowExtension: true }` + `loadExtension('vec0.so')`, KNN live getestet (Upstream `asg017/sqlite-vec` v0.1.9). Offen ist nur die Embedding-Modell-Entscheidung (offline/zero-dep).

**Verifikation:** Gate **100 %** nach jeder Phase; MCP `docs_search`/`docs_get` grün; Index 104 Docs / 1138 Abschnitte / 222 Dateien; Hook läuft; CI-YAML vorhanden.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Platzierungs-Taxonomie als **kritische Gate-Regel** statt Doku-Konvention, Allowlists aus dem Contract lesen (SSOT); (b) **ein** Builder + Index im Gate-Lauf, MCP nur als Query-Schicht; (c) versionierte Hooks (`.githooks` + `core.hooksPath`) plus CI-Backstop; (d) Abschnitts-Chunking mit Zeilennummern ist der Token-Hebel, nicht das Datenformat.

## 2026-09-26 — Suche Stufe 1: FTS5-Prefix + Trigram (statt Vektor)

**Kontext:** Frage „Semantik einfacher als Vektor?" — Klärung gegen SQLite-FTS5-Doku (`sqlite.org/fts5.html`): echte Semantik (Bedeutung/Synonyme) = Vektor/Embeddings; ohne Modell geht nur lexikalischer Ausbau. Vektor bleibt Phase 4 (dauerhafte Modell-Dependency, query-seitig).

**Umgesetzt (`tools/docs_index.js`):** (1) `sections_fts` auf `unicode61 remove_diacritics 2`; (2) Prefix-Query (`"term"*`) für Wortvarianten; (3) zweite FTS-Tabelle `sections_fts_tri` (**trigram**) als Fallback für mittlere Teilwörter; `search()` zweistufig — Wort (bm25) zuerst, dann Trigram-Auffüllung, Treffer markiert mit `match: word|substring`. Bugfix unterwegs: fehlendes `DROP TABLE IF EXISTS sections_fts_tri` im Schema (Rebuild schlug sonst fehl; Gate blieb 100 %, Index wäre still kaputt).

**Verifikation:** Prefix `falzmark`→Falzmarken, `autosav`→Autosave; Trigram `slinien` findet „hilfslinien" (mittleres Teilwort). Grenze dokumentiert: Trigram = **Teilwort**, KEINE Tippfehler-Distance. Gate 100 %; Index 104 Docs / 1140 Abschnitte / 228 Dateien.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) für deutsche Suche ist Porters Stemmer unbrauchbar → **Prefix + Trigram** statt Stemming; (b) **keine Synonym-Map** — stattdessen wird das Vokabular projektweit vereinheitlicht (siehe Eintrag „Vokabular auf IMR-Atome normiert"); (c) Vektor erst bei nachgewiesener Lücke, weil das Modell auch zur Query-Zeit verfügbar sein muss.

## 2026-09-30 — Vokabular auf IMR-Atome normiert (CSS/HTML), tote Leiche entfernt

**Kontext:** IMR-Registry (`docs/10-architecture/IMR-Registry.md`) ist die SSOT des Fachvokabulars (45 Atome, Zonen, Rahmen). Drift-Prüfung ergab: die HTML-*Elemente* waren konform, aber CSS-Klassen/Properties/Attribute waren teils englisch, und `din-verteiler` war eine unregistrierte Leiche. Leitlinie: **ein Begriff pro Konzept, deutsch, aus der IMR** — wie „1 m ist immer 1 m".

**Änderung (`website/css/sheet.css`, `website/css/layout.css`, `website/index.html`):**
1. System-Atome werden per **Tag** selektiert statt per Klasse: `.din-mark`/`.din-fold-top`/`.din-fold-bottom`/`.din-punch` → `din-falz-oben`/`din-falz-unten`/`din-lochmarke`; die Klassen aus dem HTML entfernt.
2. Custom Properties + `data-*`-Attribute auf IMR-Begriffe: `--fold-1-y`/`--fold-2-y`/`--punch-y` → `--falz-oben-y`/`--falz-unten-y`/`--lochmarke-y`; `data-fold-1-a|b`, `data-fold-2-a|b`, `data-punch-y` → `data-falz-oben-y-a|b`, `data-falz-unten-y-a|b`, `data-lochmarke-y` (Muster `data-<atom|zone>-y-<form>`, wie schon bei `data-absender-y-a`).
3. `din-verteiler`-Regeln aus `layout.css` entfernt — kein `<din-verteiler>`-Element, kein `#toggle-verteiler`, kein IMR-Eintrag (als Atom wäre es #46 → laut Registry verboten).
4. Such-Synonym-Map ersatzlos entfernt (`tools/docs_synonyms.json` gelöscht, Expansion aus `buildWordQuery` raus) — Synonyme sind das Gegenteil von kontrolliertem Vokabular.

**Sicherung:** IMR vor jeder Änderung 1:1 kopiert nach `/home/moritz/.local/state/opencode-changes/DIN-BriefNEO/IMR-Registry.20260930-151745.md` (sha256 identisch), zusätzlich git-getrackt.

**Verifikation:** keine Restvorkommen (`grep` leer für `din-fold|din-punch|din-mark|din-verteiler|--fold-|--punch-|data-fold|data-punch`); Gate 100 %.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) kontrolliertes Vokabular braucht einen **maschinenlesbaren Anker** (Registry = SSOT) + **Gate-Regel**, sonst driftet Prosa/CSS in Synonyme/Englisch; (b) **Element-Namen als primäre Selektoren** (Atome direkt stylen) löscht eine ganze Klassen-Ebene — „das Atom ist der Begriff"; (c) IMR vor Modell-Änderungen immer sichern (sha256-verifiziert).

## 2026-09-30 — IMR als Vokabular-SSOT: 205 Renames + Gate-Regel + Nicht-Atom-Deklaration

**Kontext:** Ziel „ein Begriff pro Konzept, deutsch, 100 % aus der IMR". Sweep fand IMR-Synonyme quer durch den Code: `briefkern`/`brieftext`/`brief-fuss` (statt `kern`/`text`/`fuss`), `#absender` auf `din-rucksendezeile` (Rücksendezeile ≠ Absender), `#empfaenger` auf `din-anschriftfeld`, `info-street/-city/-tel/-email` auf `din-absender-*`, `signature-*`/`sig-*` (englisch), `address-*` (englisch), `guides`/`--guide-opacity` (englisch), Kürzel `pv`, sowie Nicht-Atome im `din-`-Namespace (`din-comment`, `din-a4-viewport`, `--din-width/-height`).

**Änderung:**
1. **205 Ersetzungen in 22 Dateien** (Codemod, nur kebab-Identifier): Atome/Zonen auf kanonische Namen; `--briefkern-y`→`--kern-y`; `#absender`→`#rucksendezeile`; `#empfaenger`→`#anschriftfeld`; `info-*`→`absender-*` bzw. `absender-namenszeile`; `empfaenger-name`→`empfaenger-namenszeile`; `signature-*`/`sig-*`→`unterschriftsbild-*` bzw. `unterschrift-zeile`; `address-*`→`anschrift-*`; `guides`→`hilfslinien`; `sidebar-pv-select`/`pv-item`→`postvermerk`; `din-comment`→`brief-kommentar`; `din-a4-viewport`→`brief-ansicht`; `--din-width/-height`→`--blatt-breite/-hoehe`. **Nicht angetastet:** JS-Variablennamen (intern) und Persistenz-Keys (`din_local_addresses` — keine Datenmigration riskieren).
2. **IMR-Registry** um Abschnitt „Nicht-atomare Bezeichner" erweitert (Präfix-Reservierung, `data-<atom|zone>-y-<form>`, Rendering-Bezeichner, Namenszeile als Komposition) — additiv, die 45 Atome bleiben unverändert. Vorher 1:1 gesichert (`/home/moritz/.local/state/opencode-changes/DIN-BriefNEO/IMR-Registry.20260930-151745.md`, sha256).
3. **Gate-Regel `imr`** in `tools/reconciliation.js`: parst die Registry als SSOT; jedes `din-*` im Website-Code muss registriert sein (Guide-Refs `@guide`/`[[…]]` ausgenommen); Verstoß = `critical`.

**Verifikation:** keine Restvorkommen (`grep` leer), `node --check` aller JS ok, keine doppelten IDs, ID-Konsistenz JS↔HTML ok, Negativtest der Regel greift (`din-bogus`/`din-namenszeile` → Verstoß), Gate 100 % (Index 104/1146/228).

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) kontrolliertes Vokabular = maschinenlesbare SSOT (Registry) + Gate-Regel; (b) Renames als Codemod mit explizitem Mapping und Ausnahme-Liste (Persistenz-Keys!) statt Handarbeit; (c) ein reservierter Namensraum (`din-`) verhindert Wildwuchs am wirksamsten; (d) „ein Begriff pro Konzept" macht Synonym-Ersetzung in der Suche überflüssig.

## 2026-09-30 — IMR formalisiert: Contract, Alias-Registry, Authority, maschinenlesbares Inventar

**Kontext:** Review der IMR-Registry (7,5/10 Entwurf) ergab: fehlender Namespace-/Alias-Vertrag, keine maschinenprüfbaren Invarianten, unmarkierte Normativität — und als wichtigsten Punkt **`data-*` als faktisch zweite Geometriequelle** (die Registry war Doku, nicht SSoT der Geometrie).

**Änderung:**
1. **Registry Contract** + **MUST-NOT** (8 Regeln) + einheitliches Regelvokabular MUST/MUST-NOT/SHOULD/MAY.
2. **Namespace**: jeder `din-*` gehört exakt einer Kategorie (DOCUMENT / ZONE / ATOM (42) / SYSTEM_ATOM (3)); UI-/Rendering-Bezeichner ohne `din-`.
3. **Synonym-/Alias-Registry** (erlaubte Kompositionen/Satelliten, verbotene Aliase `din-empfaenger-name`/`din-absender-name`) + **Authority** (DIN „zu verifizieren" / PROJECT / IMPLEMENTATION).
4. **Maschinenlesbares JSON-Inventar** in der Registry; neu **`tools/imr.js`** validiert (45 Atome / 3 System / 42 Inhalt, Duplikate, verbotene Aliase, Kompositions- und Geometrie-Bezüge), prüft Code auf nur-registrierte `din-*` und **leitet die `data-*`-Geometrie ab und vergleicht sie mit `website/index.html`** → Registry ist jetzt echte SSoT der Geometrie. Die Gate-Regel `imr` ruft das Werkzeug auf (kritisch).
5. **Letztes Synonym geschlossen:** Zonen-Geometrie `data-empfaenger-y-*` / `--empfaenger-y` → `data-anschriftfeld-y-*` / `--anschriftfeld-y` (die Zone heißt `din-anschriftfeld`).
6. `doc-size`-Ausnahme für die IMR-Registry (normative SSOT, darf nicht gesplittet werden).

**Verifikation:** `node tools/imr.js` → „51 registrierte din-Bezeichner, Inventar konsistent"; Negativtests greifen (fremdes Atom → 46/43; `data-kern-y-a="999"` → Abweichung); Gate 100 %.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) eine SSoT ist erst echt, wenn ihre abgeleiteten Artefakte (hier `data-*`) **generiert bzw. gegengeprüft** werden — sonst ist sie nur Doku; (b) Invarianten (Anzahl/Duplikate/Aliase) als Gate-Check statt Prosa; (c) Herkunft (normativ/projekt/implementierung) pro Wert markieren, sonst liest man Projektregeln später als Norm; (d) ein maschinenlesbarer JSON-Block im selben Dokument schlägt eine zweite Datei.

## 2026-09-30 — IMR-Vokabular Pass 3: Blatt, container-name-Ballast, UI-Englisch

**Kontext:** Zweiter Sweep in `website/css` + `website/index.html`. Gefunden: das Blatt hieß `paper`/`sheet`/`Blatt` gemischt; `#viewport` hatte **zwei** `container-name` (`viewport`, `sheet-stage`) und **alle** container-names waren ungenutzt; aria-labels nannten Atome/Zonen anders; UI-Texte sagten „Adresse" statt „Anschrift"; UI-Englisch (`font`, `toast`, `sidebar`, `data-*`).

**Änderung:**
1. **Blatt vereinheitlicht** (DIN-nah „Briefblatt", Registry „DIN-A4-Blatt"): `--paper-bg/-text/-ghost` → `--blatt-hintergrund/-text/-schwach`; `--c-paper-*`→`--c-blatt-*`, `--c-ink-*`→`--c-tinte-*`, `--c-ghost-*`→`--c-schwach-*`; `class="paper-theme"`→`blatt-theme`; Kommentare „Paper/FOOTER/sheet"→„Blatt/FUSS".
2. **container-name-Ballast entfernt:** alle `container-name`-Deklarationen gelöscht (kein `@container` im Projekt → ungenutzt; der Doppelname auf `#viewport` war ein toter Konflikt). `container-type` bleibt (cqw/cqh).
3. **aria-labels auf IMR-Namen:** „Brieftext"→„Text", „Briefinhalt"→„Briefkern", „Empfängeradresse"→„Anschriftfeld", „Absenderinformationen"→„Infoblock".
4. **„Adresse"→„Anschrift"** in UI-Texten (Ausnahme „E-Mail-Adresse").
5. **UI-Englisch verdeutscht:** `font`→`schrift` (explizite Identifier; `font-family`/`FontFace`/`fontsource` unberührt), `toast`→`hinweis` (Datei `32-toast.js` + kapitales JS-API `showToast`/`TOASTS` unberührt), `sidebar`→`seitenleiste` (Datei `sidebar.css` unberührt); `data-appearance/persist/dir/font-mode/action`→`data-erscheinungsbild/speichern/richtung/schrift-modus/aktion`; `page-1`→`seite-1`, `no-print`→`nicht-drucken`.
6. **Bugfix aus dem Rename:** JS-`dataset`-Zugriffe angepasst (`dataset.action`→`dataset.aktion`, `dataset.fontMode`→`dataset.schriftModus`) — sonst wären Signatur-Handles/Font-Umschalter stillschweigend kaputt. Bewusst gelassen: reine CSS-Konvention (`hidden`/`w-full`/`sr-only`/`single-line`, Farb-Rollen `--c-primary/-danger/-success/-warning`, `type-*`) — kein Vokabular, KISS.

**Verifikation:** keine Restvorkommen (grep leer), Schutz-Token intakt (`font-family`, `FontFace`, `fontsource`, `32-toast.js`, `css/sidebar.css`), `node --check` aller JS ok, ID-Konsistenz JS↔HTML ok, Gate 100 %, `imr.js` OK.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Renames über Guard-Regex (`(?!\.js|\.css)`) + explizite Native-/Brand-Ausnahmen statt Blanket; (b) **`dataset.camelCase` ist die Falle** beim Attribut-Rename — Attribut und JS-Zugriff müssen zusammen wandern; (c) tote `container-name` ohne `@container` einfach löschen statt harmonisieren.

## 2026-09-30 — Kanonisches Vokabular als IMR-Vertrag + Gate-Prüfung

**Kontext:** Der Sweep zeigte: `imr.js` kontrollierte bisher nur die `din-*`-Struktur, nicht das übrige Projektvokabular. Ziel: die IMR definiert **auch die erlaubte Sprache**, und das Gate prüft sie — damit kein manueller Sweep mehr nötig ist.

**Änderung:**
1. **IMR-Inventar** um `vocabulary` erweitert: `canonical`, `forbidden` (paper→Blatt, sheet→Blatt, Brieftext→Text, Briefinhalt→Briefkern, Empfängeradresse→Anschriftfeld, Absenderinformationen→Infoblock, sidebar→Seitenleiste, toast→Hinweis, page-1→seite-1), `forbiddenTokens` (`--paper-`/`--c-paper-`/`--c-ink-`/`--c-ghost-`/`--fold-`/`--punch-`/`--din-width`/`--din-height`/`--guide-opacity`), `exceptions` (Dateinamen), `notAutoChecked` (font/action/Adresse wegen native API bzw. Input-Parsing).
2. **`tools/imr.js`**: neue `checkVocabulary` — **case-sensitive** (kapitalisierte API-/Brand-Namen bleiben unberührt), Wortgrenzen mit `-`/`_`/`.`, überspringt `.js`/`.css`-Tokens und die Ausnahmen; `forbiddenTokens` als Literal-Scan. Verstöße sind Gate-`critical`.
3. **Residuen bereinigt:** Kommentar „Brieftext"→„Text", Meldung „Briefinhalt"→„Briefkern", JS-Variablen `sheet`→`blatt` (draft-manager/settings-manager), Kommentar „sheet"→„Blatt".

**Verifikation:** `node tools/imr.js` → „IMR OK"; Negativtest greift (`paper`/`sheet`/`sidebar`/`toast` geflaggt) und respektiert Ausnahmen (`font-family`, `touch-action`, `css/sidebar.css`, `showToast`, `32-toast.js`); Gate 100 %; `node --check` ok.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Terminologie deterministisch wie Struktur behandeln — kanonische Liste + verbotene Aliase + technische Ausnahmen als maschinenlesbarer Vertrag im selben SSOT-Dokument; (b) case-sensitive Wortgrenzen + Datei-Pfad-Ausnahmen verhindern die typischen False Positives (native CSS, API-Namen, Brands); (c) was nicht sicher prüfbar ist (native API, Eingabe-Parsing), wird ausdrücklich als `notAutoChecked` deklariert statt still weggelassen.

## 2026-09-30 — Case Contract (kebab HTML/CSS) + Case-Gate

**Vorbefund:** Bestandsaufnahme ergab **keinen** bestehenden Case-Vertrag in `ADR-CSS/-HTML/-JS` oder IMR → keine konkurrierende Regel. Ist-Code deckt sich mit dem Vorschlag (HTML/CSS kebab, JS camelCase, Klassen PascalCase); einzige echte Abweichung: `@keyframes shakeToast` (camelCase). Docs-Dateinamen sind gemischt (Pascal/kebab/snake) — **bewusst nicht umgebaut** (dateinamen-basierte `[[…]]`-Links).

**Änderung:**
1. **IMR `## Case Contract`** + maschinenlesbarer `caseContract` im Inventar: HTML/CSS kebab; JS camelCase / PascalCase / **UPPER_SNAKE für Konstanten**; Docs-Dateiname = bestehend, `id:` kebab; Dataset-Mapping `data-schrift-modus` → `dataset.schriftModus`; Exception für Plattform-Identifier.
2. **`tools/imr.js`: `checkCase`** — prüft HTML (`id`/`class`/`data-*`) und CSS (Klassen-/ID-Selektoren, Custom Properties, `@keyframes`, `@property`) auf kebab; Kommentare werden gestrippt, Hex-Farben ignoriert; **JS-Identifier und Dateinamen bewusst nicht**. Verstöße = Gate-`critical`, contract-getrieben (`caseContract.htmlCss`).
3. **Fix:** `@keyframes shakeToast` → `shake-hinweis` (inkl. `animation`-Referenz).

**Verifikation:** `node tools/imr.js` → OK; Negativtest: `BadClassName`/`bad_class_name`/`#BadId`/`--BadProp`/`@keyframes badName` → FAIL, Kommentar-Klasse ignoriert; JS `badClassName`/`BAD_CONSTANT`/`PascalClass` → PASS; `data-schrift-modus` → PASS; Gate 100 %.

**Generalisierbarkeit:** (a) Case und Vokabular sind **getrennte Achsen** — ein Identifier kann Case-konform/vokabular-falsch sein und umgekehrt; (b) pro Sprache/Artefakt den nativen Case, Übergänge über Plattform-Mapping (dataset); (c) nicht sicher Prüfbares (JS-Identifier, Dateinamen) ausdrücklich ausnehmen statt halbherzig prüfen.

## 2026-09-30 — Foundation-Dokumente nachgezogen (Verweis, Vokabular, Benennungs-Hinweis)

**Kontext:** Prüfung von `docs/00-foundation/` (per eigener Regel read-only für KI-Agenten; hier **menschlich freigegeben**). Funde: tote Klartext-Referenz `README.md:66` (`docs/30-meta/audits/` existiert nicht, kein `audit_summary` im Repo), „Toast" statt kanonisch „Hinweis".

**Änderung:** (1) README-Verweis strichlos auf `docs/90-archive/` umgebogen; (2) „Toast"→„Hinweis" in `spec.md` und `Immutable-Law-Catalog.md` (H2); (3) README ergänzt, dass **Benennung** (Vokabular + Case) in der IMR definiert und von `tools/imr.js` erzwungen wird; `updated`-Daten gesetzt.

**Verifikation:** Gate 100 %, `imr.js` OK, `[[…]]`-Links intakt, kein „Toast" mehr in Foundation.

**Generalisierbarkeit:** Foundation (WHY/Gesetze) referenziert die IMR (WAS/WIE) als SSOT — Benennung/Prosa gehört nicht in die Gesetzesebene, sondern in die Registry; Klartext-Pfade in Doku sind eine Lücke des Link-Gates (nur `[[…]]` werden geprüft).

## 2026-09-30 — docs/10-architecture-Audit: Baseline, Doc-id-Case, toter Link, Rename-Drift

**Kontext:** Audit `docs/10-architecture`. Funde: (1) **Baseline-Widerspruch** — Matrix + ADRs nennen **Chrome 148+** statt der einzigen Baseline **150+** (Foundation); (2) Doc-`id:` `ADR-005`/`ADR-006`/`ADR-OMNITRACEABILITY` groß (Case-Contract-Verstoß, vom Gate nicht geprüft); (3) toter inline-Link `[[ADR-MIGRATION]]` (kein File, Gate prüft inline `[[…]]` nicht); (4) **Rename-Drift**: ADR-HTML listete noch `data-punch-y`/`data-fold-*`/`data-empfaenger-y-*`.

**Änderung:** Baseline `148+`→`150+` in Matrix, ADR-HTML/CSS/ANTIPATTERN/006 und `docs/index.md`; Doc-ids auf kebab (auch `ADR-TEMPLATE`/`GUIDE-TEMPLATE`/`README-DB`); toten Link durch `docs/90-archive/`-Hinweis ersetzt; ADR-HTML-`data-*` auf kanonisch; **`checkCase` um Doc-Frontmatter-`id:`** erweitert (schließt die Lücke). Bewusst nicht: ADR-Dateien umbenennen (ADR-CSS 36 / ADR-JS 37 Link-Ziele), Matrizen mergen (2 von 3 generiert).

**Verifikation:** Gate 100 %, `imr.js` OK, Negativtest Doc-id (`ADR-BAD` → FAIL), keine `148`-Baseline mehr in `10-architecture`/`index`.

**Generalisierbarkeit:** (a) Die Baseline steht **einmal** (Foundation) — andere Docs referenzieren, statt die Zahl zu wiederholen (SSoT); (b) ein Case-Gate muss auch Doc-Frontmatter-`id:` prüfen, sonst driften ids unbemerkt; (c) das Link-Gate prüft nur Frontmatter-Relationen und `[]()`, **nicht** inline `[[…]]` — Lücke für tote Wiki-Links; (d) Datei-Umbenennungen sind bei klebrigen Wiki-Links hochriskant → Konvention dokumentieren statt migrieren.

## 2026-09-30 — Baseline repo-weit auf Chrome 150+ vereinheitlicht

**Kontext:** Nach dem 10-architecture-Audit verblieben Baseline-Nennungen „Chrome 148+" außerhalb. Die einzige Baseline ist **Chrome 150+** (Foundation).

**Änderung:** `148+` → `150+` in `20-implementation/README.md`, `20-implementation/din-5008-css-architektur.md` (4×), `30-meta/AI-AGENTS-CLI.md`, `30-meta/DEV-INFO.md:33` und `website/css/layout.css` (Code-Kommentar). Feature-/Recherche-Notizen bewusst unangetastet (`DEV-INFO`-Feature-Tabelle, `web-standards-tracking`, `ROADMAP`-Range, `mcp_research` Temporal-Support), denn das sind **Feature-Ship-Versionen**, keine Projekt-Baseline.

**Verifikation:** keine `148+`-Baseline mehr außerhalb der Feature-Notizen; Gate 100 %.

**Generalisierbarkeit:** Eine Versionszahl in der Doku ist entweder **Projekt-Baseline** (nur Foundation, sonst referenzieren) oder **Feature-Ship-Version** — beides darf nicht vermischt werden. Ein Sweep muss diesen Unterschied pro Zeile treffen, sonst „korrigiert" er Feature-Notizen kaputt.

## 2026-09-30 — Doppelpflege entfernt: Compliance-Matrix + Toast-Guide

**Kontext:** Zwei redundante Dateien: (1) `Architecture-Compliance-Matrix.md` (manuell; Tech-Tabelle ≈ [[Immutable-Law-Catalog]], ADR↔Datei-Zuordnung ≈ generierte `Function-Traceability`/`Code-Referenzen`); (2) `20-implementation/toast-system.md` (Guide, doppelt den ADR + **stale Pfade** `js/toast.js`).

**Änderung:** Matrix-Inhalt („Bekannte Einschränkungen") → Abschnitt 9 in `ADR-OMNITRACEABILITY`; Toast-**Warum** bleibt im `adr-toast-system` (neuer Hinweis: „Wie = Code, kein separater Guide"); beide Dateien gelöscht; Verweise in `10-architecture/README`, `20-implementation/README`, `docs/index.md`, `CLAUDE.md` und Memory nachgezogen. Build: 104 → 102 Docs.

**Verifikation:** Gate 100 %, `imr.js` OK, keine toten Restverweise.

**Generalisierbarkeit:** Eine Datei = eine Rolle; manuelle Matrizen, die generierte Duplizieren, streichen (kein „zweites Wissensmanagement"); das **Wie** gehört in Code/Guide, der ADR hält das **Warum**.

## 2026-09-30 — Traceability-Anker repariert (B) + generierte Artefakte enttrackt (C)

**Kontext:** Code-Annotationen `@adr`/`@guide` zeigten auf **nicht existierende** Doku (`chrome-modern-css`, `din-5008-geometry/-layout/-anschriftfeld`, `ADR-007-Smart-Clipboard-Impressum-Parser`) → die generierten Matrizen hatten unauflösbare Anker. Zudem war `Function-Traceability.md` als generiertes Artefakt getrackt.

**Änderung:** (B) Alle dangling-Annotationen auf existierende Ziele umgebogen: `chrome-modern-css` + `din-5008-*` → `din-5008-css-architektur`; `ADR-007-…` → `ADR-006-Offline-Address-Intelligence` (13 Dateien). (C) `Function-Traceability.md` enttrackt + in `.gitignore` (wie `Code-Referenzen.md`, `import.sql`, `LLM_CONTEXT.md`); READMEs markieren beide als „generiert, nicht versioniert".

**Verifikation:** Gate 100 %, keine dangling-Annotationen mehr.

**Generalisierbarkeit:** Generierte Artefakte **nie** versionieren (Git-Noise bei Zeilenverschiebungen); Traceability-Anker müssen auf existierende Doku zeigen — sonst lügt die Matrix.

## 2026-09-30 — Aufräum-Playbook + Pass über docs/30-meta

**Kontext:** Die wiederkehrende Aufräum-Methodik (Rolle, tote Links, generierte Artefakte, Vokabular, Case, Baseline, stale Pfade, Archiv) war nur implizit; `architecture-drift-audit` prüfte bislang nur Soll/Ist-Drift. Anwendung auf `docs/30-meta`.

**Änderung:** (1) `agent/skills/architecture-drift-audit/references/aufraeum-playbook.md` angelegt (Ablauf, 8 Prüfklassen, Scan-Vorlagen, Ausnahmen, DoD) + Verweis in `SKILL.md`. (2) 30-meta: tote Links repariert (`MASTER-DO-DONT-DEPRECATED`/`MODERNIZATION-GUIDE` → `ADR-ANTIPATTERN`/`web-standards-tracking`; `ADR-PROFILE-MANAGEMENT` → `ROADMAP`; `FEATURE-INVENTORY` + Review-Artefakte entfernt), Baseline-Nennungen auf „Chrome 150+ ([[longevity-guidelines]])" (DEV-INFO 25/109, memory 58), stale `js/00-core/`-Baum in memory an die reale flache `website/js/`-Struktur angepasst.

**Verifikation:** Beweis-Scan 0 ungewollte tote Links (nur `[[schema-v6.json]]`-Anhang, gewollt), Gate 100 %, `imr.js` OK.

**Generalisierbarkeit:** Aufräumen ist ein Standard-Pass mit fester Reihenfolge (**scannen → klassifizieren → fixen → beweisen → protokollieren**) und expliziten Ausnahmen (Code-Fences, Template-Platzhalter, Chronik). Chroniken (`DECISION-LOG`, `90-archive`) werden nie rückwärts „repariert"; eine Klasse pro Commit-Gruppe.

## 2026-09-30 — ADR-Präfix konsolidiert (`ADR-<THEMA>` uppercase)

**Kontext:** Das ADR-Namensschema war gemischt: nummeriert (`ADR-005-Sender-Synchronization`, `ADR-006-Offline-Address-Intelligence`) vs. thematisch-uppercase (`ADR-JS`, `ADR-CSS`, `ADR-HTML`, `ADR-DATA-PERSISTENCE`, `ADR-ANTIPATTERN`, `ADR-OMNITRACEABILITY`) vs. lowercase (`adr-toast-system`).

**Änderung:** 3 Renames auf einheitlich `ADR-<THEMA>` uppercase: `ADR-005-Sender-Synchronization` → `ADR-SENDER-SYNCHRONIZATION`, `ADR-006-Offline-Address-Intelligence` → `ADR-OFFLINE-ADDRESS-INTELLIGENCE`, `adr-toast-system` → `ADR-TOAST-SYSTEM`. Frontmatter-`id` auf kebab (`adr-sender-synchronization`, `adr-offline-address-intelligence`; `adr-toast-system` bleibt). Link-Migration in `10-architecture/README`, `docs/index.md`, `CLAUDE.md`, `website/js/45-address-intelligence.js`, `46-clipboard-address-parser.js` (inkl. `@adr`-Anker, Tabellen, Frontmatter-`doc_links`).

**Verifikation:** Gate 100 %, `imr.js` OK, 0 Rest-Referenzen außer Chronik (`DECISION-LOG`) und dem kebab-`id`.

**Generalisierbarkeit:** Ein Namensschema pro Doc-Typ — ADR = `ADR-<THEMA>` uppercase, `id` immer kebab. Nummern-Präfixe sind Ballast (das Thema trägt die Identität). Bei Rename **Datei + `id` + alle `[[…]]`/`@adr`/`doc_links` gemeinsam** migrieren, sonst driften Anker.

## 2026-09-30 — Link-Gate (D): tote Wikilinks/Frontmatter-Links werden erzwungen

**Kontext:** Der Gate prüfte nur klassische Markdown-Links und `relations:` — inline `[[…]]`-Wikilinks sowie Frontmatter-`doc_links`/`depends_on` waren ungeprüft. Dangling Links (ADR-001/`chrome-modern-css`/`ADR-PROFILE-MANAGEMENT` …) fielen dadurch erst bei manueller Aufräumarbeit auf.

**Änderung:** Neues `tools/links.js` (Muster wie `imr.js`) + Regel `links` (severity **critical**) in `tools/reconciliation.js`. Prüft alle `.md` gegen existierende Datei-Basenames. **Ausnahmen:** Code-Fences, Inline-Code-Spans (`` `[[…]]` `` = Syntax-Beispiel), Template-Platzhalter, Chronik (`DECISION-LOG`/`CHANGELOG`), `docs/90-archive/`, generierte Artefakte, `supersedes` (bewusste Lineage zu ersetzten Alt-Dokumenten). Dabei die verbliebenen echten Toten bereinigt: `CLAUDE.md` (`ADR-PROFILE-MANAGEMENT` → `ROADMAP`), `glossary.md` (Legacy `ADR-API`/`ADR-FEATURE`/`din-5008-geometry` → heutige ADRs), `din-5008-css-architektur.md` (`chrome-modern-css` entfernt), `geoapify-autocomplete.md` (`ADR-GEOAPIFY` → `ADR-OFFLINE-ADDRESS-INTELLIGENCE`).

**Verifikation:** Positiv 100 %; Negativtest (toter `[[…]]`) → `🔴 [CRITICAL] (links)` → 99,88 % / `success=false`.

**Generalisierbarkeit:** Ein Link-Gate muss **Wikilinks UND Frontmatter-Listen** prüfen — relative MD-Links allein genügen nicht. Beispiel-Syntax (Code-Fences/-Spans) und Lineage (`supersedes`) sind legitime Ausnahmen; ohne sie wird das Gate zum Rauschen.

## 2026-09-30 — Repo-Abspeckung (Caches, Research-Dumps, History-Purge)

**Kontext:** Der Ordner wirkte mit 86 MB „fett". Messung entkoppelt die drei Größen:
- **getrackter Inhalt:** nur 3,42 MB (228 Dateien)
- **`.git`-History:** 13 MB, davon ~10 MB **gelöschte Alt-Dumps** (`__wegweisende Beispiele/`, `*_BUNDLED.md`, `latex.pdf`, `aktueller_arbeitsordner/`, `docs/PLATINUM_HANDBOOK.md`) — nur noch in der History
- **gitignorierte lokal-Artefakte:** `.opencode/` 62 MB (opencodes eigener Dep-Baum, **nicht** Repo), `agent/cache/` 7 MB + `build/` 1,6 MB (regenerierbar)

**Änderung:**
1. Lokale Caches `agent/cache/` + `build/` gelöscht (~8,6 MB frei; regenerieren beim Gate).
2. Research-Rohdaten enttrackt + `.gitignore` (~1,1 MB; Dateien bleiben lokal).
3. History per `git filter-repo` von den gelöschten Großdateien + den Research-Dumps befreit — **alle Refs** (`main`, `legacy`-Archiv-Branch, `v4.0*`-Tags) — dann force-gepusht. Backup vorher: `/tmp/opencode/DIN-BriefNEO-backup-20260930.bundle` (11 MB).
4. **Kein** `docs/metadata.json`: der maschinenlesbare Index existiert bereits (`tools/docs_index.js` → `agent/cache/docs_search.db`, abfragbar über MCP `docs_search`) — ein zweites Index-Artefakt wäre genau die Doppelpflege, die wir entfernt haben.

**Verifikation:** getrackt 3,42 → 2,30 MB; `.git` 13 → 4,1 MB; frischer **Remote**-Klon **15 → 7,3 MB** (pack 4,34 MiB); 0 Alt-Blobs in allen Refs; Gate 100 %. (Hinweis: GitHubs UI-Größenangabe kann bis zum serverseitigen GC nachhängen — der Klon ist die Wahrheit.)

**Generalisierbarkeit:** Repo-Größe immer **dreifach getrennt** messen (getrackter Inhalt / `.git`-History / gitignorierte lokale Artefakte) — sonst verwechselt man `node_modules` mit Repo-Ballast. Große Roh-/Binärdaten nie committen (History ist ohne Rewrite unveränderlich); genau **ein** Index-Artefakt je Zweck.

## 2026-09-30 — Index-Ausbau: Link-Graph + Freshness-Hooks

**Kontext:** Der Index (`tools/docs_index.js` → `agent/cache/docs_search.db`) kannte Doku-Volltext (`documents`/`sections`) + Datei-Inventar (`files`), aber **keine Beziehungen** — „wer referenziert X / was hängt an Y" war nur per manuellem grep möglich.

**Änderung:** (1) Neue Tabelle `links(from_path, kind, to_ref, to_path)`, gefüllt aus Frontmatter `doc_links`/`code_links`/`depends_on` **und** aus Code-Annotationen `@adr`/`@guide` (Ziel-Basenames auf Doku-Pfade aufgelöst). Neuer Helper `related(ref)` + MCP-Tool `docs_related`; Gate-Ausgabe zeigt jetzt die Link-Zahl. (2) Neue `post-checkout`/`post-merge`-Hooks halten den Index nach Branch-Wechsel/`git pull` frisch (nur Index, kein volles Gate → schnell, blockiert nicht).

**Verifikation:** 289 Beziehungen; `related("website/js/32-toast.js")` → aus 2 / ein 2; `docs_related` per echtem MCP-stdio-Aufruf getestet; Gate 100 %.

**Generalisierbarkeit:** Ein Index wird erst zum Recherche-Werkzeug, wenn er auch **Kanten** kennt (Doc↔Doc, Code→ADR). Kanten aus bereits vorhandenen Quellen ableiten (Frontmatter/Annotationen), nie separat pflegen; Frische an **Ereignisse** hängen (Commit, Pull, Abfrage), nicht an Disziplin.

## 2026-09-30 — Aufräum-Pass docs/20-implementation (+ code_links-Gate)

**Kontext:** Playbook-Pass auf `docs/20-implementation`. Befunde: 3 Guide-`id`s mit inkonsistentem `guide-`-Präfix; **7 defekte `code_links`** (u. a. `41-salutation-engine.smart.js`, `52-storage.js`, `44-sender-sync.js`) — die der Link-Gate bisher **nicht** prüfte (nur `doc_links`/`depends_on`); der Doku-Baum in der Memory-Doku stand noch in alter Ordnerstruktur (`40-tooling/`, `90-policy/`).

**Änderung:** (1) `tools/links.js` prüft jetzt auch `code_links` (Dateipfade, **repo- und dokument-relativ**). (2) 7 defekte `code_links` repariert/entfernt: `41-salutation-engine.js`, `51-storage.js`, `53-metadata.js` (dort lebt der Sender-Sync), `website/data/de_plz_ort.json.gz`; geplante `tools/hybrid_search.js` entfernt (Draft); `90-archive` exempt. (3) `id`s `guide-geoapify-autocomplete`/`guide-no-scroll-techniques`/`guide-testing-guide` → ohne Präfix. (4) Memory-Strukturblock auf die reale Ordnerstruktur aktualisiert.

**Verifikation:** 0 defekte `code_links`, `links.js`/`imr.js` OK, Gate 100 %. **`din-5008-svgs/` (476 KB): geprüft — einzige visuelle Form-A/B-Referenz, bewusst behalten.**

**Generalisierbarkeit:** Ein Link-Gate muss **alle** Referenzarten prüfen (Wikilinks, `doc_links`, `depends_on`, **`code_links`**) — jedes ungated Feld ist eine Einladung zum Drift. Pfad-Refs relativ zur Repo-Wurzel **und** zum Dokument auflösen; `code_links` zeigen auf echten Code, geplante Dateien gehören nicht hinein.

## 2026-09-30 — Code-Volltext im Index (Datei = Section)

**Kontext:** Doku war per `docs_search` durchsuchbar, Code nur als Inventar (`files`). Wunsch: Code über denselben Kanal findbar, ohne Ordnerraten.

**Änderung:** `tools/docs_index.js` indexiert zusätzlich Code-Dateien aus `website/`, `tools/`, `agent/` (`.js/.mjs/.cjs/.css/.html/.py/.sh`, ohne `*/data/`, ohne Dateien > 200 KB) als **je eine Section** (heading = Pfad) in `documents`/`sections`/FTS. `docs_search` (und damit der MCP) liefert jetzt auch Code-Treffer. Bewusst **grob**: keine Funktions-/Block-Heuristik.

**Verifikation:** 103 → 143 Dokumente, 1166 → 1208 Sections; `docs_search "showToast"` trifft Code; Gate 100 %.

**Grenze/Generalisierbarkeit:** Die grobe Variante nennt die **Datei** (Section-Start = Zeile 1), nicht die exakte Zeile — dafür bleibt `rg` das präzisere Werkzeug. Bewusster Trade-off: einheitlicher Suchkanal statt Heuristik und Rauschen. Code bleibt Source of Truth, die DB ist abgeleitet und jederzeit regenerierbar.

## 2026-09-30 — Index-Audit: Bugs + Optimierungen

**Kontext:** Audit des Retrieval-/Index-Stacks (Werkzeug, nicht Inhalt). Befunde: (1) `indexIsStale` prüfte nur `.md`-mtime → **Code-Änderungen/-Löschungen ignoriert** (stale Index; bewiesen: `touch` einer JS-Datei → `rebuilt=false`); (2) Mehrterm-Suche per **OR** = unscharf (`"toast hinweis"` → 50 Treffer); (3) `links` ohne UNIQUE (Duplikate); (4) Code-Dateien **2×** gelesen; (5) toter Code; (6) ungenutzte `agent/cache/DIN-Brief_docs.db`.

**Änderung:** (1) Staleness jetzt über **alle** getrackten Dateien (mtime) **plus** Datei-Set-Abgleich (neu/gelöscht gegen die `files`-Tabelle); (2) Suche **UND zuerst** (alle Terme), bei 0 Treffern automatischer **ODER**-Fallback, dann Trigram; (3) neuer **`source`-Filter** `doc|code|all` (`search()` + MCP-Tool `docs_search`); (4) Annotationen + Code-Index in **einem** Dateidurchlauf; (5) `links` UNIQUE + `INSERT OR IGNORE`; (6) toter Code markiert, Alt-DB gelöscht.

**Verifikation:** Code-`touch` → `rebuilt=true`; `"toast hinweis"` 50 → 8; `source=doc` 7 vs `source=code` 5; `links` 288 → 286; Trigram-Fallback (`slinien`) weiter aktiv; Gate 100 %.

**Generalisierbarkeit:** Ein Index-/Cache-Tool muss (a) **alle** Quellen auf Staleness prüfen (nicht nur die erste), (b) Mehrterm-Anfragen **UND-first** beantworten, (c) Filterdimensionen explizit machen (`source`). Der Index ist Werkzeug, nie Wahrheit — Bugs hier kosten Vertrauen, keine Daten.

## 2026-09-30 — Index-Dedup: external-content FTS + Trigramm nur Doku/Fallback

**Kontext:** Dry-Run mit 4 Varianten zeigte: der Text lag **dreifach** (`sections.body` + `sections_fts` + `sections_fts_tri`); der eigentliche Größenhebel war aber der **Trigramm-Index** (~7 MB), nicht die Dedup allein (external-content allein: nur −14 %).

**Änderung:** (1) `sections_fts` ist jetzt **external-content** (`content='sections'`, `content_rowid='id'`) — FTS speichert nur den Inverted Index, den Text liest es aus `sections`; (2) Trigramm nur noch für **Doku**-Sections (Code über `rg`) und **rein als Fallback** (greift erst bei **0** Wort-Treffern, füllt nicht mehr auf → kein Rauschen); (3) `VACUUM` nach dem Rebuild — ohne das schrumpft die Datei nach `DROP`/Neuaufbau nicht.

**Verifikation:** 9,7 → **6,6 MB** (−32 %); `hilfslinien` → `[word]`, `fslinie` (Wortmitte) → `[substring]`, `zzqx` → 0; `snippet()` auf external-content korrekt; Gate 100 %, Build ~1,4 s.

**Generalisierbarkeit:** Bei FTS den Content **einmal** speichern (external content), teure Indizes (Trigramm) nur für die Quellen, die sie brauchen, und nur als **Fallback** einsetzen (sonst Rauschen). Nach `DROP`/Rebuild `VACUUM`, sonst bleibt die Datei groß — die Dateigröße folgt den freigegebenen Seiten, nicht dem Inhalt.

## 2026-09-30 — README-DB neu (Bedienungsanleitung + Spec) + Index-CLI

**Kontext:** `docs/20-implementation/README-DB.md` beschrieb ein **nie gebautes** Schema (`documents.content`, `document_tags`, Trigger, Views `v_active_docs`, `prefix='2 3'`, Datei `DIN-Brief_docs.db`) — vollständig am Ist-Stand vorbei. Zusätzlich fehlte eine Bedienungsanleitung für Nicht-SQLite-Kenner.

**Änderung:** (1) Neue CLI in `tools/docs_index.js`: `build` / `search "<q>" [--limit=N] [--source=doc|code|all]` / `get <path> [section]` / `related <ref>` — Bedienung von Hand ohne MCP. (2) `README-DB.md` komplett neu: Bedienungsanleitung, exaktes Schema (`documents`/`sections`/`files`/`links` + 2 FTS5), Suchkaskade (UND→ODER→Trigramm), external-content, Link-Graph, Builder/Freshness/`VACUUM`, Invarianten, Regenerierbarkeit, Größenstand und ein **Guardrail-Abschnitt „bewusst NICHT enthalten"** (keine Symbol-/AST-DB, keine Chunks, keine Embeddings/Vector, keine Hashes …).

**Verifikation:** CLI getestet (`search`, `related ADR-JS` → 19 eingehende Kanten, `--source=code`); Gate 100 %, `links.js`/`imr.js` OK; README 248 Zeilen.

**Generalisierbarkeit:** Doku eines Werkzeugs muss den **lebenden** Zustand abbilden, nicht die Absicht. Ein expliziter „bewusst nicht enthalten"-Abschnitt wirkt als **Anti-Drift-Guardrail** gegen „klingt sinnvoll, bauen wir noch X" — besonders bei Agenten. Die DB bleibt abgeleiteter Cache, nie zweite Wahrheit.

## 2026-09-30 — Aufräum-Pass Abschluss docs/20-implementation

**Kontext:** Rest des Playbook-Passes über `docs/20-implementation`. Gefunden: (a) `Salutation-Engine.md` nannte eine geplante Ablösung (`41-salutation-engine.smart.js`) so, als sei sie real; (b) `sqlite-vec.md` (Entwurf/geparkt) enthielt tote Pfade (`aktueller_arbeitsordner/…`, `Guides/`), den **falschen DB-Namen** (`DIN-Brief_docs.db` statt `docs_search.db`) und **Chat-Rückstände** („Möchtest du, dass ich als Nächstes …?").

**Änderung:** Salutation-Engine: Ablösung klar als **geplant** markiert ([[ROADMAP]], „**nicht** implementiert"). sqlite-vec: Status auf „Entwurf / geparkt — nicht Teil des Index (README-DB §11)" geschärft; tote Pfade + DB-Name korrigiert; geplante Dateien (`tools/hybrid_search.js`, `tools/README-VECTOR-SEARCH.md`) als „geplant / neu anzulegen" kenntlich gemacht; Chat-Rückstände durch neutralen Abschluss ersetzt.

**Verifikation:** Prosa-Scan auf stale Datei-Refs (nur noch **beabsichtigte** Plan-Refs; `48-text-fit.js` bleibt als historische A49-Erwähnung), Gate 100 %, `links.js`/`imr.js` OK.

**Generalisierbarkeit:** (1) Zukunfts-Aussagen müssen als **geplant** erkennbar sein, sonst liest sie jeder als Ist-Zustand. (2) Chat-Exporte gehören nicht in kuratierte Doku. (3) Der Prosa-Ref-Scan (`*.js/*.md` gegen `git ls-files`) schließt die Lücke, die der Frontmatter-Link-Gate lässt.

## 2026-09-30 — Korrektur: Salutation V2 ist live (kein smart.js) + CSS-Token-Drift

**Kontext:** Meine vorige Kennzeichnung („Ablösung durch ein Smart-Modul ist geplant, nicht implementiert") war **falsch**. Belegt am Code: `website/js/main.js` importiert `41-salutation-engine.js`, und **genau diese Datei ist die V2** (951 Vornamen Zero-Click, Adelspartikel-Erhalt, 3 B2B-Pärchen, Dirty/Auto-Reset; `website/data/de_vornamen_gender.json.gz` liegt vor; Commit `cc12e5d` *„promote 80/20 Smart Salutation Engine V2 to production"*). Stale war nicht die Engine, sondern die **ROADMAP** (Prio 1 forderte die Umhängung auf ein **nie existierendes** `41-salutation-engine.smart.js`).

**Änderung:** (1) `Salutation-Engine.md`: Fehlaussage ersetzt — Engine ist live V2, **kein** separates Modul; Vornamen-Angabe korrigiert (450+/`MALE_NAMES` → 951/`NAME_INDEX`). (2) `ROADMAP.md` Prio 1 → **abgeschlossen** (V2 in dieselbe Datei promoviert; Prototyp liegt in `research/roadmap/smart_salutation_engine.js`). (3) CSS-Token-Drift in Doku korrigiert (gegen `variables.css` verifiziert): `--paper-bg/-text/-ghost` → `--blatt-hintergrund/-text/-schwach`, `--bg-sidebar(-glass)` → `--bg-seitenleiste(-glass)`, `--guide-opacity` → `--hilfslinien-deckkraft`; nicht mehr existente `--danger-hover`/`--guide-color` aus der Memory-Liste entfernt.

**Verifikation:** Alle Variablennamen gegen `website/css/variables.css` geprüft; Gate 100 %, `links.js`/`imr.js` OK.

**Generalisierbarkeit:** (1) „Ist" vs. „geplant" **am Code** belegen, nie aus der Doku übernehmen — meine Fehlkennzeichnung stammte aus der (stale) ROADMAP. (2) Benennt der Code Variablen um, müssen **Doku-Erwähnungen** mitgezogen werden — der Link-Gate sieht Code-Bezeichner in Prosa nicht. (3) Stale-Prosa-Scan (`*.js|*.md|--var` gegen Quellen) als Prüfklasse ergänzen.

## 2026-09-30 — Drift-Audit: „geplant" vs. „Ist"

**Kontext:** Nach der Salutation-Fehlkennzeichnung systematisch alle Zukunfts-Marker in lebenden Docs gegen den **Code** geprüft.

**Befunde & Änderung:** (1) `geoapify-autocomplete.md`: „geplantes Caching (noch nicht implementiert)" → **implementiert** (`apiCache` in `43-geoapify.js`, Cache-Hit-Pfad vorhanden). (2) `tooling-overview.md`: `docs_index.js`-Input als „ohne Code" beschrieben → indexiert jetzt **Markdown + Code** (`website/`, `tools/`, `agent/`). (3) `Feature-Matrix.md`: „Brief-Archiv via IndexedDB" **widerspricht A34** (Immutable Law Catalog verbietet IndexedDB als Produktspeicher) → Zeile als „🔴 Geplant (blockiert durch A34)" markiert. Der `indexeddb`-Treffer in `51-storage.js` ist nur ein **Warn-Kommentar** (nie genutzt).

**Verifiziert NICHT implementiert** („geplant" ist korrekt): Sprachsteuerung, Brief-Archiv, Serienbrief, QR-Code, Internetmarke/Poststempel, LanguageTool, bzst.de, Mehrseitig, nativer PDF-Export, Service-Worker, LLM-Addon, sqlite-vec.

**Verifikation:** Feature-Greps nur in `website/js|css|index.html` (ohne `data/`); Gate 100 %, `links.js`/`imr.js` OK.

**Generalisierbarkeit:** „Geplant" regelmäßig gegen **Code UND Law Catalog** prüfen — sonst plant die Doku Features, die längst gebaut **oder per A-Regel verboten** sind. Ein Plan-Dokument ohne Ist-Abgleich ist eine Drift-Quelle (2 von ~14 Aussagen waren falsch).

## 2026-09-30 — Korrektur: kein Code-Löschen + Plan-Bereinigung (Doku only)

**Vorfall:** „komplett streichen" wurde falsch als **Code-Löschung** interpretiert — das **live** On-Device-KI-Addon (`website/js/addons/ai-assistant.js`, in `index.html` geladen, mit Toggle/Button/CSS) wurde angefasst. **Sofort vollständig zurückgerollt** via `git reset --hard HEAD` (nichts war committet) — Code und Doku identisch zum letzten Commit, Gate 100 %.

**Lehre:** „streichen" bezieht sich auf **Plan-/Doku-Einträge**, nicht auf produktiven Code. Vor jeder Löschung prüfen: *existiert die Sache als Code/Produkt?* Wenn ja → **nicht** löschen, nur Doku nachziehen. Destruktive Aktionen nur nach eindeutigem Auftrag.

**Änderung (nur Doku):** (1) `ROADMAP`: Backlog „Sprachsteuerung" + „LanguageTool" entfernt (kein Code vorhanden), bzst 8 → 6; „Dauerhaft verworfen"-Vermerk. (2) `Feature-Matrix`: Zeile „Sprachsteuerung" entfernt. (3) `ROADMAP` Item 2 „PDF-Export": Entscheidung dokumentiert — Weg 1 (Pixel) verworfen, Weg 3 (Browser-Druck/`window.print()`), Weg 2 (externe PDF-Lib) zurückgestellt/gesprächsbereit.

**Nicht angetastet:** On-Device KI bleibt komplett (Code + Doku). ROADMAP Prio 7 und die Feature-Matrix-Zeile „Lokale KI" bleiben vorerst stehen.

**Verifikation:** `git status` nach Rollback leer; nach den Doku-Edits Gate 100 %, `links.js`/`imr.js` OK.

**Generalisierbarkeit:** Zerstörende Aktionen (Code-Löschung) erst nach eindeutiger Bestätigung; im Zweifel **nur Doku**. Ein „Feature streichen" und ein „Code löschen" sind zwei verschiedene Dinge.

## 2026-09-30 — Plan-Audit: Streichung nach Nutzen (Doku)

**Kontext:** Abgleich der offenen Plan-Punkte nach **echtem Nutzer-Mehrwert** vs. Gimmick/Off-Strategy.

**Gestrichen:** vCard-QR im Briefkopf (Gimmick im formellen B2B-Brief), Service-Worker/PWA (unter `file://` technisch unmöglich), LLM-Addon/Zauberstab (Cloud-API + Keys — bricht Offline/Datenschutz/zero-dep). `ROADMAP`: Backlog-Items 4/5 entfernt, bzst 6 → 4, „Dauerhaft verworfen"-Liste erweitert. `Feature-Matrix`: vCard-Zeile entfernt; Zeile „PWA Standalone ✅" → „Offline-Betrieb ✅" (ohne Service Worker).

**Behalten (echter Nutzen):** Serienbrief (CSV), mehrseitige Briefe, bzst-Beherdenwegweiser; Brief-Archiv (Storage-Konzept offen), Internetmarke (Recherche offen); On-Device KI (live, experimentell), sqlite-vec (Agent-Tool, geparkt).

**Verifikation:** Gate 100 %, `links.js`/`imr.js` OK.

**Generalisierbarkeit:** Ideen zuerst nach **Nutzer-Mehrwert** und **Zielkontext-Machbarkeit** (`file://`/offline, zero-dep, Law Catalog) filtern — „technisch cool" ist kein Nutzen. Verworfenes explizit als „nicht erneut vorschlagen" dokumentieren (Anti-Drift).

## 2026-09-30 — Export/Import-Endung: `.dinletter` → `.json`

**Kontext:** Eine eigene Datei-Endung bringt in einer **Web-App keinen** Doppelklick-Vorteil (OS-Dateizuordnung gäbe es nur bei installierter PWA) und macht die Datei für Dritte unlesbar — obwohl der Inhalt ohnehin selbst-erklärendes JSON ist (`format`, `schema_version`).

**Änderung:** Export schreibt jetzt `<datum - betreff - absender an empfaenger>.json` (statt `.dinletter`); Import akzeptiert `.json` **und** legacy `.dinletter`; UI-Buttons/Titel + Datei-Input (`accept=".json,.dinletter,application/json"`) angepasst. Der interne Header-Tag bleibt `dinletter` (Rückwärtskompatibilität). Kommentare in `51-storage.js`/`53-metadata.js` + Test-Label angeglichen.

**Verifikation:** Gate 100 % (inkl. tsc); Rest-Vorkommen nur Format-Tag, Legacy-Accept, Test-Payloads und interne Element-IDs.

**Generalisierbarkeit:** Eigene Datei-Endungen nur mit **echtem** Mehrwert (OS-Zuordnung/PWA-File-Handler) — sonst Standardendung wählen. „Erkennbar als Text + selbst-beschreibender Header" schlägt Marken-Endung (Future-proof ohne Tool).

## 2026-09-30 — 30-meta aufgeräumt (Log-Split + Orphan-Archivierung)

**Kontext:** `docs/30-meta` 332 KB; Hauptverursacher `DECISION-LOG.md` (174 KB, Chronik).

**Änderung:** (1) DECISION-LOG chronologisch gesplittet — Einträge **bis 2026-08** (37) → `docs/90-archive/decision-log-archiv-2026-05-08.md`; Live-Log behält 2026-09 + Archiv-Verweis. (2) Orphan `DIN-BriefNEO_memory_konsolidiert.md` (10 KB, von nichts verlinkt) → `docs/90-archive/`. (3) Orphan `mcp_research.md` (8 KB, Recherche) → `research/`; README-Markdown-Link nachgezogen.

**Verifikation:** `30-meta` 332 → 268 KB (Live-Log 134,8 KB + Archiv 40,3 KB); Gate 100 %, `links.js`/`imr.js` OK.

**Generalisierbarkeit:** Chroniken regelmäßig nach Zeitfenster auslagern (Live = aktuelles Fenster). **Orphans** (von nichts verlinkt) sind Archiv-/Recherche-Kandidaten — Link-Zähler als Kriterium. Bei Verschiebungen **alle** Referenzarten prüfen (Markdown-Links sieht der Wikilink-Gate nicht).

## 2026-10-02 — Fitness Gate war strukturell unerreichbar (Link-Gate-Fix) + Doku-Quick-Wins

**Kontext:** Audit von `website/` und `docs/` (→ [[code-audit-website-2026-10-02]], [[docs-audit-2026-10-02]]). Der Pre-Build-Gate stand auf **main** bei **99,88 %** und failte — entgegen der Annahme „100 % ist der Normalzustand".

**Befund (Grundursache):** 8 kritische tote Wikilinks, alle auf `[[Function-Traceability]]` und `[[Code-Referenzen]]`. Beide sind **generierte** Artefakte und per `.gitignore` **nicht versioniert**. `tools/links.js` nahm sie zwar in `SCAN_SKIP` auf — aber nur als Scan-**Quelle**, nicht als Link-**Ziel**. Verschärfend: `build_db.js` (dokumentierter Linux-Einstieg) erzeugt nur `Code-Referenzen.md`; `Function-Traceability.md` entsteht ausschliesslich in `build_db.py`. Damit war **100 % auf dem dokumentierten Linux-Pfad nach jedem frischen Clone unerreichbar**, obwohl AGENTS.md §2 genau das vor jeder Änderung verlangt. Der Datei-Header von `links.js` behauptete die Ausnahme bereits — implementiert war sie nie.

**Änderung:**
1. `tools/links.js`: `GENERATED_TARGETS`-Allowlist; `resolves()` behandelt generierte Artefakte unabhängig von ihrer momentanen Existenz als auflösbar.
2. `tools/reconciliation.js`: `doc-size`-Regel nimmt `docs/90-archive/` aus — die Regel nannte als Abhilfe „nach `docs/90-archive/` verschieben" und meldete eine Datei, die bereits dort lag (unerfüllbare Forderung).
3. `docs/90-archive/`: `foundation_inventory.json` + `implementation_and_meta_inventory.json` (154 KB) gelöscht — `docs/index.md` nannte sie selbst „stale" und verwies im selben Abschnitt auf sie als „SSoT für KI-Agenten". Lebende Quelle ist die generierte DB aus `build_db.js`.
4. Frontmatter: 4 Archivdokumente standen auf `status: active`/`proposed` → `archived`.
5. `docs/index.md`: Dezimalrahmen nannte `30-meta` doppelt und `90-archive` gar nicht (angeblich „5-stufig", faktisch 4); `AI-AGENTS-CLI.md` war als „im Repository-Root" beschrieben, liegt aber in `docs/30-meta/`.
6. `docs/index.md` Leitregel 2 + `CLAUDE.md`: **Faktenkorrektur** — „Offline-Garantie ohne Webserver" bzw. „`file:///` lauffähig" widersprachen README.md/AGENTS.md und `CLAUDE.md` sich selbst (Zeile 34 vs. 45). ESM + CSP schliessen `file://` aus. „Offline" = netzunabhängig, nicht serverlos. Zusätzlich empfahl `CLAUDE.md` als `new Date()`-Ersatz das zonenlose `Temporal.Now.plainDateISO()` — **genau das verbietet A50**; jetzt Verweis auf `currentISODate()`.

**Bewusst NICHT geändert:** Die `file://`-Begründungen im Immutable Law Catalog (S1, A22, A34–A37) stützen fünf Verbote auf eine nicht mehr existierende Voraussetzung. Das ist eine Grundsatzentscheidung des Maintainers (ADR-pflichtig), keine Aufräumarbeit — offen, siehe [[docs-audit-2026-10-02]] §3/W1.

**Verifikation:** Gate **100 %** (Metadata/Coherence/Conformance/Features je 100 %), **null** Diagnosen — vorher 8× CRITICAL + 1× LOW.

**Generalisierbarkeit (llm_boilerplate):** (a) Link-/Kohärenz-Gates müssen generierte Artefakte in **beiden** Richtungen kennen — als Quelle *und* als Ziel; sonst ist das Gate nach jedem Clone rot und die Mannschaft gewöhnt sich an ein rotes Gate. (b) Eine Lint-Regel, deren vorgeschlagene Abhilfe am Zielort weiter greift, ist ein Regelfehler. (c) Dokumente, die ein Gate nie prüft (Prosa-Leitregeln, Agenten-Kontextdateien), driften zuerst — Fakten dort gehören auf das **eine** normative Dokument verlinkt, nicht kopiert.

## 2026-10-02 — Code-Fixes P1-1/P1-2: doppelte Owner beseitigt + Audits taxonomiekonform

**P1-1 (`53-metadata.js`, echter Bug):** `buildLetterFileName()` und `MetadataService.prepare()` leiteten Datum, Absender, Empfänger und Betreff **zweimal mit abweichender Logik** aus dem DOM ab. `prepare()` splittete die Rücksendezeile nur auf Komma — der Grok-Bug-6-Fix (Sender-Sync joint mit `•`) war dort nie nachgezogen. Folge: PDF-Metadatum `author` enthielt `Name•Straße•Ort`, während der Dateiname korrekt `Name` trug. Zusätzlich bereinigte `prepare()` Empfängername und -firma erst nach dem Verketten, wodurch eine Namenszeile aus reiner Interpunktion die Firma unterschlug. **Neu:** `collectLetterIdentity()` als einzige Ableitung; `buildLetterFileName()` ist nur noch Konsument. Öffentliche API unverändert (`52-import-export.js` unberührt).

**P1-2 (`41-salutation-engine.js` + `main.js`, Race):** `SalutationFeature` lud per `StorageManager.loadSettings()` eine **eigene** Settings-Kopie und schrieb sie an **sechs** Stellen vollständig zurück. Jede Theme-/Layout-/Hilfslinien-Änderung des `SettingsManager` nach diesem Ladezeitpunkt wurde beim nächsten Anrede- oder Grußformel-Wechsel mit dem veralteten Snapshot überschrieben (Last-Write-Wins auf stale Daten). **Neu:** Injection des geteilten Settings-Objekts über `settingsContext` — dasselbe Muster, das `SignatureFeature` bereits korrekt nutzte. Persistenz läuft über `_saveSettings()`; `main.js` hält den einzigen Owner.

**Taxonomie-Korrektur (eigener Fehler):** Die beiden Audit-Dokumente lagen im Repo-Root und verletzten `repository.yaml/taxonomy` (`allowed_root_files` ist eine Allowlist). Der Verstoß blieb im vorigen Commit unentdeckt, weil der Gate **vor** `git add` lief und die Taxonomie-Regel nur **getrackte** Dateien prüft. Beide Dokumente liegen jetzt als `docs/90-archive/code-audit-website-2026-10-02.md` und `docs/90-archive/docs-audit-2026-10-02.md` mit vollständigem Frontmatter V6; Querverweise auf Wikilinks umgestellt.

**Verifikation:** `tsc --noEmit -p jsconfig.json` sauber; Gate **100 %** (null Diagnosen) — geprüft **nach** dem Stagen.

**Generalisierbarkeit (llm_boilerplate):** (a) Geteilter Zustand braucht genau **einen** Owner; Features bekommen ihn **injiziert**, statt ihn selbst zu laden — ein zweiter `load()`-Aufruf ist bereits der Bug. (b) Wird derselbe Wert an zwei Stellen abgeleitet, driften die Stellen garantiert; der Fix ist eine gemeinsame Funktion, nicht ein nachgezogener Zweitfix. (c) **Gates, die den Git-Index lesen, müssen nach `git add` laufen** — sonst meldet der Pre-Commit-Lauf grün, was der Commit erst einführt.

## 2026-10-02 — Doku-Governance: „Ein Fakt, ein Ort" wird verbindlich; Log bekommt Schema

**Kontext:** Das Doku-Audit 2026-10-02 ([[docs-audit-2026-10-02]]) hat ein Verhältnis von
1,9 Zeilen Prosa je Zeile Produktionscode gemessen und als Hauptproblem **nicht** die Menge
identifiziert, sondern die Vervielfachung: Derselbe Verbotskanon existierte in fünf Fassungen
(Law Catalog, ADR-ANTIPATTERN, constitution §2, CLAUDE.md, GEMINI.md), das Framework-Verbot in
15 Dateien. Der Law Catalog verbietet das in „PART III — SINGLE SOURCE, KEINE 15 KOPIEN"
selbst, ohne dass die Regel durchsetzbar formuliert war. Parallel fehlte dem DECISION-LOG ein
Schema: 72 Einträge tragen vier wiederkehrende Labels, daneben 23 Einmal-Labels.

**Änderung:**
1. [[AGENTS]] §5 von vier Zeilen auf eine vollständige Doku-Governance erweitert:
   §5.1 „Ein Fakt, ein Ort" mit Pflichtfrage vor jedem neuen Absatz; §5.2 Zuordnungstabelle
   Wissensart → Ort (inkl. „Agenten-Tooling ist kein Produktwissen" und Root-Allowlist);
   §5.3 Pflichten je Änderung (Frontmatter, `updated` einzeln pflegen, Gate **nach** `git add`);
   §5.4 explizite Negativliste.
2. DECISION-LOG: Abschnitt „Nutzungsregeln dieses Logs" vorangestellt — Zweck, Abgrenzung
   gegen Law Catalog/ADR/Guide/Glossar/ROADMAP, **verbindliches Vier-Abschnitte-Schema**
   (`Kontext` / `Änderung` / `Verifikation` / `Generalisierbarkeit`), optionale Zusatzlabels
   (insbesondere `Verworfen:`), Append-only-Regel und „Was diesen Log kaputt macht".

**Verworfen:** Die Arbeitsregeln für `docs/` direkt in den DECISION-LOG zu schreiben
(ursprünglicher Auftrag). Abgelehnt, weil der Log **append-only** ist: Normative Regeln wären
dort weder revidierbar noch als geltende Fassung erkennbar — und wären die **sechste** Kopie
des Regelwerks, also exakt der Fehler, den dieser Beschluss abstellt. Ebenfalls verworfen: ein
neues Dokument `docs/30-meta/dokumentations-governance.md`. In einem Projekt mit zu vielen
Dokumenten ist die richtige Antwort, das **vorhandene** normative Dokument zu schärfen
(`AGENTS.md` §5), nicht ein weiteres anzulegen.

**Bewusst NICHT geändert:** Die bestehenden 72 Log-Einträge und ihre Einmal-Labels bleiben
unangetastet (Append-only). Das neue Schema gilt ab diesem Eintrag vorwärts.

**Verifikation:** Fitness Gate 100 % (Metadata/Coherence/Conformance/Features), null Diagnosen,
geprüft nach `git add`. Link-Gate `tools/links.js` ohne Befund.

**Generalisierbarkeit (llm_boilerplate):** (a) „Single Source" als Prinzip zu **deklarieren**
reicht nicht — es braucht eine **Pflichtfrage im Arbeitsablauf** („Steht das schon irgendwo?")
und eine Zuordnungstabelle, sonst entstehen Kopien aus Hilfsbereitschaft. (b) Eine append-only
Chronik braucht ein **Pflichtschema**, sonst driftet die Form und die Einträge werden
unvergleichbar. (c) Der wertvollste Abschnitt einer Chronik ist `Verworfen:` — er verhindert,
dass spätere Bearbeiter geprüfte Sackgassen erneut betreten; genau dieser Schutz ist im
Code-Audit mehrfach eingetreten.

## 2026-10-02 — `file://`-Doktrin: Befund dokumentiert, Entscheidung bewusst offen

**Kontext:** Quer durch die Doku wird `file://`-Lauffähigkeit garantiert — und gleichzeitig
ausgeschlossen. `README.md`, `AGENTS.md` §7 und `CLAUDE.md` (Z. 34) sagen korrekt: ESM + CSP
machen `file://` unmöglich. Dagegen versprach `docs/index.md` „Alle Kernfunktionen ohne
Webserver", [[longevity-guidelines]] führt „Säule 2: Offline / `file://`", [[testing-guide]]
prüft gegen `file:///`, und `CLAUDE.md` widersprach sich in Zeile 45 selbst. Schwerwiegender:
Der [[Immutable-Law-Catalog]] begründet **fünf** Verbote (S1, A22, A34, A35, A36, A37) mit
`file://`-Tauglichkeit — eine Voraussetzung, die es nicht mehr gibt. Im Code hängen daran ein
toter Fallback-Zweig in `45-address-intelligence.js`/`41-salutation-engine.js` und das
164 KB große `website/data/plz-embedded.js`.

**Befundlage (empirisch belegt, 2026-10-02):**
- ES-Modules werden unter `file://` CORS-geprüft geladen → Origin `null` → **blockiert**.
  Klassische `<script>`-Tags und **inline** Module sind davon nicht betroffen (letzteres noch
  nicht gegengemessen — kein Chrome in der Prüfumgebung).
- `fetch()` lokaler Dateien unter `file://` ebenfalls blockiert → die `.gz`-Datenpfade sterben.
- `localStorage` **funktioniert** unter `file://`, aber Chromium ignoriert dabei den Pfad der
  URL (langjähriger offener Chromium-Bug): **alle** lokal geöffneten HTML-Dateien teilen sich
  einen Namespace. Für dieses Produkt heißt das: Absenderdaten, Empfänger, Brieftext und
  Base64-Unterschrift wären von jeder beliebigen lokal geöffneten HTML-Datei les- und
  überschreibbar. Das kollidiert frontal mit dem Privacy-Versprechen des Projekts.
- Ein Single-File-Build wäre ca. **381 KB** (51 CSS + 145 JS + 21 HTML + 164 Daten-Base64).

**Offener Punkt:** Ob `file://` als Laufzeitziel **gestrichen** wird (dann: Neubegründung von
S1/A22/A34–A37 ohne `file://`-Argument, Entfernen der toten Zweige und der 164 KB, Korrektur
von `longevity-guidelines` Säule 2 und `testing-guide`) oder ob stattdessen eine
**Single-File-Distribution** als eigenes Artefakt eingeführt wird. Beides ist ADR-pflichtig
(Amendment Protocol, PART IV). **Entscheidungskriterium:** zuerst empirisch klären, ob ein
inline `<script type="module">` unter `file://` ausgeführt wird — fällt das negativ aus,
entfällt die Single-File-Option ohne Build-Schritt von selbst.

**Bewusst NICHT geändert:** Die `file://`-Begründungen im Law Catalog bleiben vorerst stehen.
Fünf Normen umzuschreiben ist eine Grundsatzentscheidung des Maintainers, keine Aufräumarbeit —
und ohne ADR wäre es ein Verstoß gegen das Amendment Protocol. Korrigiert wurden ausschliesslich
Stellen, die der bereits etablierten Faktenlage (README/AGENTS) **widersprachen**.

**Verifikation:** Gate 100 %. Die Faktenlage zu ESM/`fetch`/`localStorage` unter `file://` ist
gegen die Chromium-/WHATWG-Quellenlage geprüft; der Inline-Modul-Fall ist **ungeprüft** und als
solcher markiert.

**Generalisierbarkeit (llm_boilerplate):** Wird eine **Voraussetzung** ungültig, müssen alle
davon **abgeleiteten** Normen nachgezogen werden — sonst bleiben Verbote mit toter Begründung
stehen und werden irgendwann aus dem falschen Grund gekippt. Normen sollten ihre Begründung
explizit referenzieren („verboten **weil** X"), damit ein Wegfall von X maschinell auffindbar ist.

## 2026-10-02 — Vier Kleinfixes: Listener-, Pipeline-, Timer- und Titel-Owner bereinigt

**Kontext:** Vier im Code-Audit ([[code-audit-website-2026-10-02]]) als P1-3/P2-2/P2-5/P2-6
geführte Befunde — alle vom selben Typ wie P1-1/P1-2: mehrere Owner für eine Sache bzw. dieselbe
Logik mehrfach kopiert. Alle vier sind unabhängig von der offenen `file://`-Frage.

**Änderung:**
1. **P1-3 Postvermerk (`boot-state.js`, `main.js`):** Bei einer einzigen Select-Auswahl liefen
   **drei** Handler — `input` + `change` aus dem Boot-Script und `change` aus `main.js` — mit
   **widersprüchlicher** Semantik (Boot überschrieb, `main` füllte nur wenn leer). Das Boot-Script
   setzt jetzt ausschliesslich den Initialwert und registriert keine Listener mehr.
   `syncPostvermerkFromSidebar({ overwrite })` hält beide Modi explizit: Boot/Restore darf
   getippten Text nicht vernichten, eine aktive Auswahl **muss** überschreiben — sonst wäre das
   Dropdown wirkungslos, sobald einmal Text im Feld steht.
2. **P2-2 gzip-Pipeline (`05-gzip.js`, neu):** Die Kette `fetch` → `DecompressionStream('gzip')`
   → `Response.text()` → `JSON.parse` stand **dreimal** im Code (2× in `45`, 1× in `41`) mit je
   eigenem `try/catch`-Dialekt. Jetzt ein Core-Modul mit `fetchGzipJson()` und
   `decompressGzipBase64()`; `DecompressionStream(` kommt projektweit nur noch dort vor.
3. **P2-5 Druck-Lifecycle (`main.js`):** `setTimeout(…, 100)` um `window.print()` durch das native
   `afterprint`-Event ersetzt (`{ once: true }`). Die Magic Number restaurierte bei langsam
   öffnendem Druckdialog zu früh.
4. **P2-6 Titel-Owner (`53-metadata.js`, `01-draft-manager.js`):** `document.title` hatte zwei
   Schreiber. Tippte der User bei offenem Druckdialog weiter, überschrieb der Autosave den
   PDF-Dateinamen. `isPrintTitleActive()` gibt dem Druck-Titel Vorrang.

**Verworfen:** Bei P1-3 den Handler in `main.js` zu löschen und den Boot-Handler zu behalten —
das hätte den Listener im Boot-Script belassen, wo er wegen des `catch {}`-Rahmens stumm scheitern
kann und nicht typgeprüft ist. Bei P2-6 ein Event-basiertes Title-Bus-Konstrukt: für genau zwei
Schreiber ist ein Lesezugriff auf ein Flag die kleinere Lösung (KISS).

**Verifikation:** `tsc --noEmit -p jsconfig.json` ohne Befund; Fitness Gate **100 %**, null
Diagnosen, geprüft nach `git add`. Kein Zyklus durch den neuen Import `01 → 53 → 47`.

**Generalisierbarkeit (llm_boilerplate):** (a) Zwei Handler auf demselben Event sind nur dann
harmlos, wenn sie dieselbe Semantik haben — hier taten sie es **nicht**, und das Verhalten hing
an der Registrierungsreihenfolge. Beim Entdoppeln zuerst die Semantik beider Seiten vergleichen,
sonst wird aus dem Aufräumen eine Verhaltensänderung. (b) Timer um native Lifecycle-Events
(`print`, `load`, Transitions) sind fast immer ein fehlendes Event. (c) Teilen sich zwei Module
eine globale Ressource (`document.title`), braucht eine Seite explizit Vorrang — implizite
Reihenfolge ist kein Vertrag.

## 2026-10-02 — `file://` als Laufzeitziel gestrichen (B1 + B2)

**Kontext:** Revidiert die lange geführte `file://`-Doktrin und schliesst den als offen
dokumentierten Punkt aus dem Eintrag „`file://`-Doktrin: Befund dokumentiert, Entscheidung
bewusst offen" (gleiches Datum). Auslöser: Die Voraussetzung existiert seit ESM + CSP nicht
mehr — die App startet unter `file://` nicht einmal —, während sechs Normen (`S1`, `A22`,
`A34`–`A37`) weiterhin damit begründet waren. Entscheid des Maintainers: streichen.

**Änderung:**
1. **[[ADR-RUNTIME-CONTEXT]]** neu angelegt (Amendment Protocol PART IV): lokaler Webserver ist
   der einzige unterstützte Laufzeitkontext. Option „Single-File-HTML" geprüft und verworfen.
2. **Law Catalog:** `S1`, `A22`, `A34`, `A35`, `A36`, `A37` **neu begründet** — Verbote bleiben
   unverändert in Kraft, nur das Argument wechselt (synchroner Boot-Restore ohne FOUC,
   Unsichtbarkeit von OPFS, Permission-Zwang der File System Access API, Cache-Invalidierung
   als Wartungslast). Präambel hält fest, dass `file://` **nicht** mehr als Begründung taugt.
3. **Doku:** `longevity-guidelines` Säule 2 „Offline / `file://`" → „Netzunabhängigkeit";
   `constitution`, `ADR-DATA-PERSISTENCE`, `ADR-JS`, `ADR-ANTIPATTERN`,
   `ADR-OFFLINE-ADDRESS-INTELLIGENCE`, `glossary`, `Feature-Matrix`, `docs/index.md` korrigiert.
   `architektur-evolution-und-quellen.md` ist ein Zeitdokument — dort steht ein **Nachtrag**
   statt einer Umschreibung.
4. **Code (B2):** `website/data/plz-embedded.js` (164 KB) gelöscht; Fallback-Zweige in
   `45-address-intelligence.js` entfernt (Fetch jetzt parallel via `Promise.all`, sanfte
   Degradation statt Zweitpfad); `file:`-Guard in `05-gzip.js` und die dort ungenutzt gewordene
   `decompressGzipBase64()` entfernt; **drei weitere tote Guards in `43-geoapify.js`**, die im
   Audit durchgerutscht waren (sie prüfen `'file:'`, nicht `'file://'`); Kommentare in
   `51-storage.js` berichtigt. `location.protocol` kommt im Produktcode nicht mehr vor.

**Verworfen:** Single-File-HTML, um `file://` zurückzugewinnen (ca. 381 KB). Erfordert
`unsafe-inline`, bricht `H7`/`H8` und braucht einen Build-Schritt. Entscheidend war aber ein
anderes Argument: Chromium ignoriert bei `localStorage` den Pfad der `file://`-URL, alle lokal
geöffneten HTML-Dateien teilen **einen** Namespace. Briefdaten und Unterschriftsbild wären dort
von jeder beliebigen lokalen HTML-Datei lesbar. `file://` ist für dieses Produkt nicht bequemer,
sondern **unsicherer** — der Webserver stützt das Privacy-Versprechen.

**Bewusst NICHT geändert:** `navigator.onLine`-Guards in `43-geoapify.js` (betreffen echte
Netzverfügbarkeit, nicht das Protokoll). Historische Einträge in diesem Log und in
`docs/90-archive/` (Append-only). Die 23 `file://`-Erwähnungen in Altenträgen bleiben stehen.

**Offener Punkt:** Single-File-Distribution als optionales Release-Artefakt
(`tools/build_single_file.js`) — nicht Teil dieser Entscheidung, siehe ADR §5.

**Verifikation:** `tsc --noEmit` ohne Befund; Fitness Gate **100 %**, null Diagnosen, nach
`git add` geprüft. `git grep "location.protocol" -- website/` liefert keine Treffer mehr.
`website/data` von 294 KB auf 132 KB.

**Generalisierbarkeit (llm_boilerplate):** (a) Fällt eine **Voraussetzung** weg, müssen alle
davon abgeleiteten Normen **einzeln** nachgezogen werden — sonst bleiben Verbote mit toter
Begründung stehen und werden irgendwann aus dem falschen Grund gekippt. Normen sollten ihre
Begründung explizit referenzieren („verboten **weil** X"), damit der Wegfall von X auffindbar
wird. (b) Zwei Begriffe, die umgangssprachlich verschmelzen (hier *offline* = netzunabhängig
vs. *serverlos*), erzeugen über Jahre Widersprüche; die Trennung gehört ins Glossar, bevor sie
in Normen wandert. (c) Beim Entfernen eines Konzepts nach **Schreibweisen-Varianten** suchen
(`file://` **und** `'file:'`) — die drei übersehenen Guards in `43-geoapify.js` fand erst der
zweite Grep.

## 2026-10-02 — Kanonisierung: eine Quelle, ein Begriff (B3 + B4 + B16)

**Kontext:** Der Maintainer wollte „für einen Sachverhalt einen Begriff". Die Messung
widerlegte die Vermutung teilweise: Bei der Wortwahl gab es kaum Drift (`Address Intelligence`
71:2, `draft` 249:17, `Fitness Gate` 97:1). Das reale Problem war **Quelleninflation** — ein
Sachverhalt an fünf Orten: Law Catalog, `ADR-ANTIPATTERN`, `GEMINI.md`, `CLAUDE.md`,
`AGENTS.md` §7. Nachweislich auseinandergelaufen:

- `CLAUDE.md` empfahl als `new Date()`-Ersatz das per **A50** verbotene zonenlose
  `Temporal.Now.plainDateISO()`.
- `CLAUDE.md` und `AGENTS.md` §7 behaupteten „nur OKLCH", während **C1** eine Fallback-Kette
  erlaubt — eine Kopie, die ihr Original **verschärft**.
- `GEMINI.md` widersprach sich selbst (Regel 13 verlangte `.innerHTML`, Regel 15 verbot es)
  und seine Regel 28 verlangte Radio-Toggles, die `ADR-ANTIPATTERN` Abs. 16 verbot.

**Änderung:**
1. **B3 — `ADR-ANTIPATTERN` aufgelöst.** Die neun Verbote, die **nur** dort existierten, haben
   jetzt Gesetzes-IDs: `A51` Frameworks/Build, `A52` `execCommand`, `A53` Lodash/Transpiler,
   `A54` JS-Animationslibs, `A55` Format-Interzeptoren, `A56` Toast-Pointer-Drag/`z-index`,
   `A57` Radio statt Checkbox-Switch, `A58` Radio-Theme-Wahl, `H11` Sanitizer-Default.
   Aus den Agent-Dateien kamen `A59` (Papier ist theme-unabhängig), `A60` (kein JS-Klassen-
   Toggle für UI-Zustand), `A61` (schreibendes `innerHTML`), `A62` (`aria-pressed` statt
   `.active`) sowie die Druck-Gegenpflicht in `A46` hinzu. Die Datei bleibt als 69-zeiliger
   **Grabstein** mit Umschlüsselungstabelle `Abschnitt → Gesetz` (von 185 Zeilen), weil der
   append-only [[DECISION-LOG]] und `docs/90-archive/` auf sie verlinken.
2. **B4 — `GEMINI.md` (166 Z.) und `CLAUDE.md` (294 Z.) sind Wegweiser** ohne eigene Regeln.
   Die Arbeitsweise-Regeln (Denken vor Code, Minimalität, chirurgische Änderungen,
   Feature-Detection, Codestruktur) stehen jetzt in `AGENTS.md` §7a; `AGENTS.md` §7 führt
   keine Verbotsliste mehr, sondern verweist.
3. **B16 — Terminologie-Kanon.** [[glossary]] bekam „Kanonische Begriffe" mit Spalte „statt",
   dazu bewusst **nicht** zusammengelegte Paare (Briefkern/Brieftext, Briefbogen/`<din-a4>`,
   Entwurf/Autosave, netzunabhängig/serverlos). Neu `tools/terminology.js`, eingehängt in
   `reconciliation.js` wie `links.js`/`imr.js`.

**Verifikation:** Fitness Gate **100 %**, null Diagnosen, nach `git add`. `tsc --noEmit` sauber.
Gegentest: eine eingefügte Zeile mit „Verbotsregister" und „Anwender" drückte den Score auf
99,88 % mit zwei CRITICAL-Diagnosen; nach Rücknahme wieder 100 %. Acht reale Altverstöße
wurden dabei gefunden und behoben — einer davon im frisch geschriebenen `AGENTS.md` §5.1.
Zehn Zitate auf `ADR-ANTIPATTERN Abs. N` in `ADR-CSS`/`ADR-HTML`/`ADR-JS` und fünf in
`website/` auf Gesetzes-IDs umgeschlüsselt.

**Verworfen:** Die Begriffsliste im Prüfmodul zu pflegen. Das Modul **parst die Tabelle aus
`glossary.md`** — sonst wäre der Terminologie-Wächter selbst die zweite Kopie des Kanons
geworden, also exakt der Fehler, den er verhindern soll.

**Bewusst NICHT geändert:** `Briefbogen` bleibt (DIN-5008-Fachbegriff in `spec.md`/`ADR-CSS`,
kein Synonym für `<din-a4>`). `Briefkern` und `Brieftext` bleiben getrennt — Zone vs. Feld.
`DIN-Brief-Architektur.canvas` zeigt auf den veralteten Pfad `ADR/ADR-ANTIPATTERN.md`; der war
schon vorher falsch und gehört zu einem eigenen Vorgang. Alteinträge in diesem Log und
`docs/90-archive/` bleiben unberührt.

**Offener Punkt:** Der Antipattern-Scanner in `reconciliation.js` liest nur `website/` mit
`.html/.css/.js`. Regeln in `tools/antipatterns/project.json` können daher **nie** in `docs/`
greifen — deshalb brauchte die Terminologie ein eigenes Modul. Ob der Scanner selbst auf
Markdown ausgeweitet werden sollte, ist offen.

**Generalisierbarkeit (llm_boilerplate):** (a) **Vor dem Kanonisieren messen.** Die Annahme
„zehn Wörter für eine Sache" war falsch; die Zählung zeigte klare Platzhirsche und wies auf
das eigentliche Problem (fünf Quellen). Eine Terminologie-Aufräumaktion ohne Messung hätte
Arbeit an der falschen Stelle erzeugt. (b) **Ein Prüfwerkzeug darf seine Regelliste nicht
selbst führen** — es liest sie aus dem normativen Dokument, sonst verdoppelt der Wächter die
Quelle. (c) **Kopien sind nicht nur dadurch gefährlich, dass sie veralten, sondern auch
dadurch, dass sie verschärfen** (hier: „nur OKLCH"). Beim Zusammenführen jede Kopie gegen das
Original diffen, statt die scheinbar strengste zu übernehmen. (d) **Querverweise auf
Abschnittsnummern eines anderen Dokuments sind Bruchstellen** — nur stabile IDs zitieren.
(e) Beim Auflösen eines Dokuments, auf das append-only-Quellen verlinken, einen **Grabstein
mit Umschlüsselungstabelle** hinterlassen statt zu löschen.

## 2026-10-02 — Schutz der code-referenzierten Dokumente war ein Zufall

**Kontext:** Nachkontrolle der drei Baustellen. Zwei Restbefunde: (1) `constitution.md`
behauptete weiterhin „läuft lokal im Browser, **ohne Server**" — der letzte Widerspruch zu
[[ADR-RUNTIME-CONTEXT]]. (2) Die als unantastbar geführten Dokumente waren **nicht**
geschützt: `tools/links.js` überspringt alles, was nicht `.md` ist, die `@adr`/`@guide`-
Verweise im Code wurden also nie geprüft.

**Änderung:** `constitution.md` korrigiert. `tools/links.js` scannt zusätzlich
`website/**.{js,css,html}` nach `@adr`/`@guide [[Doc]]` und meldet fehlende Ziele als
CRITICAL. `AGENTS.md` §5.6 hält die drei Schutzgruppen und ihren jeweiligen Mechanismus fest.

**Verifikation:** Härtetest — `geoapify-autocomplete.md` entfernt: vorher hätte nur ein
einziger Markdown-Verweis angeschlagen, jetzt melden zusätzlich beide Code-Stellen
(`43-geoapify.js:2`, `45-address-intelligence.js:3`). Score fiel auf 99,88 %, nach Rücknahme
wieder 100 %. `tsc` sauber.

**Generalisierbarkeit (llm_boilerplate):** Ein Schutz, der nur wirkt, weil **zufällig** noch
eine zweite Referenz existiert, ist kein Schutz — er ist eine unbemerkte Abhängigkeit vom
Zufall. Gegenprobe für jede Invariante: die Bedingung künstlich verletzen und prüfen, ob das
Gate **aus dem beabsichtigten Grund** anschlägt, nicht aus einem Nebeneffekt. Konkret hier:
Dokumentreferenzen leben nicht nur in Dokumenten, sondern auch im Code — ein Link-Checker,
der nur Markdown liest, kennt nur die Hälfte des Graphen.

## 2026-10-02 — Agenten-Tooling getrennt, zwei Dokumente archiviert (B5)

**Kontext:** `AGENTS.md` §5.2 trennt Produktwissen von Agenten-Tooling, aber vier Dokumente
standen am falschen Ort oder behaupteten eine Aktualität, die sie nicht hatten.

**Änderung:**
1. **`CHANGELOG.md` → `docs/90-archive/`**, `status: archived`. Letzter echter Eintrag war
   **2026-07-07**; als scheinbar lebende Chronik war die Datei irreführend. Die lebende
   Begründungschronik ist [[DECISION-LOG]], die Faktenlage liefert `git log`.
2. **`OBSIDIAN-SETUP-GUIDE.md` → `docs/90-archive/`**, `status: archived`. Zwei Gründe: der
   Großteil ist Editor-Setup (kein Projektwissen), und Abschnitt 2 war eine **Prosa-Kopie des
   Frontmatter-Schemas**, das maschinenlesbar in `docs/30-meta/schema-v6.json` steht — also
   erneut „ein Fakt, zwei Orte". Verbindlich sind jetzt `schema-v6.json`, [[AGENTS]] §5 und
   die beiden Templates.
3. **`sqlite-vec.md` → `docs/30-meta/`**, zusätzlich `type: guide` → **`type: project-plan`**.
   Die Datei ist ein Umsetzungsplan mit `status: draft`, kein Guide; der falsche Typ war der
   Grund, warum sie überhaupt unter `20-implementation/` lag.
4. **`README-DB.md` → `docs/30-meta/`**. Beschreibt die SQLite-Wissensbasis **für KI-Agenten**,
   fällt damit unter §5.2 „Agenten-Tooling ist kein Produktwissen".

**Verifikation:** Fitness Gate **100 %**, null Diagnosen, nach `git add`. Zwischenstand 98 %
mit zwei toten Links — der Umzug hatte relative Markdown-Pfade (`DEV-INFO.md`,
`DECISION-LOG.md`) in `CHANGELOG.md` gebrochen; sie wurden zu Wikilinks konvertiert.
`tools/links.js` SCAN_SKIP auf den neuen Pfad nachgezogen.

**Bewusst NICHT gelöscht:** Beide Dateien sind **archiviert, nicht entfernt**. Ein toter
Changelog bleibt ein Zeitdokument, und der Obsidian-Guide enthält Konventionen, die man
nachschlagen können soll. `docs/90-archive/` ist genau dafür da und von Link-, Terminologie-
und Größenprüfung ausgenommen.

**Generalisierbarkeit (llm_boilerplate):** (a) **Relative Markdown-Pfadlinks sind eine
Umzugsbremse** — sie brechen still, sobald eine Datei das Verzeichnis wechselt. Wikilinks
überleben den Umzug, weil sie über den Dateinamen auflösen; deshalb steht die Wikilink-Pflicht
in `AGENTS.md` §5.3.4. Beim Verschieben immer zuerst auf Pfadlinks prüfen. (b) **Ein falscher
`type` im Frontmatter zieht die Datei an den falschen Ort.** `sqlite-vec.md` lag unter
`20-implementation/`, weil sie sich „guide" nannte, obwohl sie ein `project-plan` war — die
Taxonomie folgt dem deklarierten Typ, also ist ein ehrlicher Typ die billigste Ordnung.
(c) Ein Dokument, das sich selbst `status: active` gibt, aber seit Monaten keinen Eintrag
bekam, ist gefährlicher als ein offensichtlich altes — **Aktualität behaupten ist schlimmer
als alt sein**.

## 2026-10-02 — `website/` ist hermetisch: A45 wird erzwungen

**Kontext:** Vorgabe des Maintainers — zwischen `website/` und `docs/` muss eine vollständige
Trennung bestehen, `website/` muss allein lauffähig sein. Zwei Fragen waren zu klären: Ist es
das heute? Und bleibt es das?

**Befund — ja, aber ungesichert.** `website/` wurde isoliert nach `/tmp` kopiert (432 KB,
34 Dateien, kein `docs/` daneben) und über einen Webserver ausgeliefert: 14 referenzierte
Ressourcen, alle 19 Module, alle drei `.json.gz` → **HTTP 200**. Die drei externen `href`
sind `<a>`-Links für den Nutzer (GitHub, Fontsource), keine Ladevorgänge — kein A38-Verstoss.
Gesichert war das aber nicht: **`A45` („projektfremde Pfade — hermetische Grenzen") stand seit
2026-06 im Catalog und wurde von nichts geprüft.** Dasselbe Muster wie beim Dokumentenschutz
zwei Einträge zuvor: eine Invariante, die nur durch Disziplin hielt.

**Änderung:**
1. Neu `tools/isolation.js`, eingehängt in `reconciliation.js`. Prüft jede Referenz in
   `website/**.{html,css,js}` auf (a) Pfade, die den Ordner verlassen (`../..`, `/docs/`,
   `/tools/`), (b) absolute Dateisystempfade, (c) **ladende** Verweise auf fremde Hosts.
2. **`A45` präzisiert** von einer Zeile Absichtserklärung zu einer prüfbaren Regel mit
   Ausnahmen und Werkzeugverweis.
3. `AGENTS.md` §5.7 beschreibt die Trennung als **asymmetrischen Vertrag**: `docs/` → `website/`
   ist frei, `website/` → `docs/` nur als Kommentar.
4. `DIN-Brief-Architektur.canvas`: 22 tote Pfade korrigiert (`ADR/`-Unterordner, `.specify/`,
   `Guides/` — alles Strukturen, die es seit Commit `7edaf19` nicht mehr gibt).

**Bewusst NICHT geändert:** Die `@adr`/`@guide`-Kommentare im Code bleiben. Sie haben null
Laufzeitwirkung und tragen die Traceability; `tools/links.js` prüft die Gegenrichtung. Ergebnis:
Die App **bricht** nicht, wenn Doku fehlt — aber es **fällt auf**. 13 Canvas-Knoten zeigen auf
Dokumente, die es nirgends mehr gibt; die Knoten zu entfernen ändert das Layout und ist ein
eigener Vorgang.

**Verifikation:** Fitness Gate **100 %**, null Diagnosen. Gegentest mit sechs künstlichen
Verstössen (`../../docs/foo.js`, `/docs/spec.md`, `cdn.jsdelivr.net` per fetch, externes
`<script src>`, `<link href="../docs/x.css">`, `<img src="/tools/logo.png">`) — alle sechs
gemeldet, nach Rücknahme wieder 0. Canvas nach der Korrektur valides JSON (36 Knoten, 78 Kanten).

**Offener Punkt geschlossen:** Die Frage, ob der Antipattern-Scanner auf Markdown ausgeweitet
werden sollte, wird mit **nein** beantwortet. Das Muster des Gates sind **fachlich getrennte
Module** mit einheitlichem Aufrufvertrag (`imr.js`, `links.js`, `terminology.js`, jetzt
`isolation.js`). Ein generischer Regex-Scanner über alles wäre schwerer zu begründen, schwerer
zu testen und würde Regeln unterschiedlicher Natur vermischen. `project.json` bleibt, was es
ist: Code-Sonden für `website/`.

**Generalisierbarkeit (llm_boilerplate):** (a) **Hermetik ist testbar, nicht nur behauptbar** —
den Ordner isoliert kopieren und starten ist ein Fünf-Minuten-Test, der die Zusage beweist statt
sie zu wiederholen. Für jedes als „eigenständig" deklarierte Artefakt gehört er in die
Routine. (b) **Zwischen *laden* und *erwähnen* unterscheiden.** Ein `<a href>` auf GitHub ist
harmlos, ein `<script src>` auf denselben Host wäre ein Bruch; ein `@adr`-Kommentar ist
Metadaten, ein `import` wäre Kopplung. Eine Prüfregel, die beides gleich behandelt, erzeugt
Fehlalarme und wird abgeschaltet. (c) Dies ist die **dritte** Norm in diesem Projekt, die als
Absichtserklärung ohne Prüfung existierte (nach `@adr`-Schutz und Terminologie). Verdachtsfrage
für jeden Katalog: *welche dieser Regeln prüft tatsächlich jemand?*

## 2026-10-02 — B11–B14: Kleinkram, der eine echte Fehlreferenz freilegte

**B11 `#private`:** Alle Klassen nutzen jetzt native `#`-Felder/-Methoden
(`41-salutation-engine.js` 29 Stellen, `01-draft-manager.js` 2). **`53-metadata.js`
bleibt bei `_`** — es ist ein Objekt-Literal, dort ist `#private` syntaktisch
unmöglich. `tsc` hat den Fehlversuch gefangen (TS18016).

**B12 Logging:** Alle 26 `console.*` tragen ein `[Modul]`-Präfix. Abweichung vom
Backlog: Es schlug `[DIN-BriefNEO/<Modul>]` vor, aber 14 Stellen nutzten bereits
das kurze `[Modul]` — die 9 Ausreißer wurden an den **Bestand** angepasst, nicht
umgekehrt. Die stummen `catch` in `boot-state.js` und `boot-theme.js` loggen jetzt
(stiller Draft-/Theme-Verlust war unsichtbar). Die leeren `catch` um
`hidePopover()/showPopover()` in `43-geoapify.js` bleiben: legitimes Schlucken.

**B13 Guard-Kommentare — der eigentliche Fund:** Die Blöcke waren *nicht* wortgleich,
sondern Paraphrasen, und sie waren bereits auseinandergelaufen:
`03-ui-protections.js` und `32-toast.js` zitierten beide **`A49`** (JS-Text-Fitting),
richtig sind **`A55`** (Format-Interzeptoren) bzw. **`A56`** (Pointer-Drag). Die
HTML-Kopien hatten die korrekten IDs. Die Doppelung hat die Fehlreferenz erzeugt
*und* verdeckt. Jetzt: der Modultext ist die verbindliche Fassung, das HTML trägt
nur noch einen Verweis darauf. Die TOASTS-Policy hatte kein Modul-Gegenstück und
sitzt nun bei `Constants.TOASTS` in `51-storage.js`.

**B14 tote IDs:** Vier IDs entfernt. Die Dialog-Buttons werden über
`returnValue`/`value="confirm"` ausgewertet, nicht über die ID — vorher verifiziert.
`btn-style-formal|polite|casual` wurden **nicht** angefasst: sie werden in
`41-salutation-engine.js:206,219` per Template-String gebaut.

### Generalisierung
(m) **Eine Kopie, die paraphrasiert statt zitiert, driftet unbemerkt.** Wortgleiche
Doppelung fällt beim Diff auf; eine Paraphrase sieht immer „gewollt anders" aus —
hier hat sie zwei falsche Gesetzesnummern überlebt. Wenn ein Text an zwei Orten
stehen muss, braucht einer davon die Rolle „verbindlich" und der andere einen
reinen Verweis.
(n) **Backlog-Zahlen altern schneller als der Code.** Jede der vier Positionen war
falsch beziffert (23 statt 21 `console.*`, 10 statt 2 leere `catch`, 4 statt 5
Guards). Vor der Umsetzung nachmessen, nicht den Eintrag glauben.
(o) **Ein fehlgeschlagener Test ist zuerst ein Testfehler.** Der 404-Sturm beim
Smoke-Test kam von `--directory website` relativ zum falschen Verzeichnis, nicht
vom Code. Zweiter Fall dieser Art in diesem Projekt.

## 2026-10-02 — Inventur des Law Catalogs: die Pruefer werden selbst geprueft

**Anlass.** Nach dem dritten Fall einer Norm, die als blosse Absichtserklaerung
dastand (`@adr`-Schutz, Terminologie, A45), war die Verdachtsfrage faellig:
*Welche der Gesetze prueft tatsaechlich jemand?* Die Antwort war schlechter als
erwartet — und zwar nicht wegen fehlender Sonden, sondern wegen **kaputter
Verbindungen zwischen Norm und Pruefung**.

### Befund (gemessen, nicht geschaetzt)

| Defektklasse | Fund |
|---|---|
| Sonde beruft sich auf ein Gesetz, das es nicht gibt | `W4/W5/W6` → `A16`, `A20` (6 tote Verweise) |
| Sonde setzt ein Gesetz durch, benennt es aber nicht | `W1` → A52, `W3` → A61 (unsichtbare Abdeckung) |
| Sonde ist schwaecher eingestuft als das Gesetz | `P1` war `preferred/high`, A61 ist HARD BAN |
| Sonde beansprucht ein Gesetz und prueft nichts | `P2` (`check: review`, leeres Pattern) |
| **Sonde trifft keine einzige Datei** | **`P3` (A49), `P4` (A55), `P5` (A56)** |

Der letzte Punkt ist der schwerste. `matchFilePattern` in `reconciliation.js`
verglich Pfadmuster mit `*` als **literalen String**: `"website/js/*.js"` traf
nie eine Datei. Drei HARD-BAN-Sonden waren wirkungslos, ohne dass irgendetwas
Alarm schlug. Nachgewiesen durch Injektion von `new TextFitEngine()` — der
Scanner blieb stumm, nur `tsc` stolperte zufaellig ueber den undefinierten Namen.

Zusaetzlich fiel eine echte Luecke auf: A61 untersagt schreibenden `innerHTML`-Zugriff,
aber die Sonde `\.innerHTML\s*=` liess die Variante mit `+=` durch (HARD BAN umgangen,
haeufigste Anhaenge-Form, XSS-Pfad).

### Entschieden

1. `tools/filematch.js` neu: Glob-Aufloesung (`*` im Segment, `**` darueber).
   Bewusst **eigenes Modul**, weil `reconciliation.js` und `lawcoverage.js`
   dieselbe Entscheidung treffen muessen — zwei Kopien waeren genau der Fehler,
   den das Meta-Gate aufdecken soll.
2. `tools/lawcoverage.js` neu, eingehaengt als `check_type: 'law_coverage'`,
   `severity: 'critical'`. Prueft die **Verbindung**: tote `catalog_ref`,
   Sonden ohne Pattern, HARD BAN als `info`, wirksame Sonden ohne Zuordnung,
   und **tote Sonden** (Dateimuster ohne Treffer).
3. Alle gefundenen Defekte behoben. Das Pattern des HARD BAN A61 ist geschaerft
   (`+=`, Bracket-Zugriff, `setHTMLUnsafe`), mit `(?!=)` gegen Fehlalarm bei `===`.
4. **Zwoelf neue Sonden** (P6–P17) fuer bisher ungeprueftes Recht: A51, A53,
   A54, A37, A34, A35, A36, A50, A25, A23, A26, A40. Abdeckung **9 → 21 von 35**.
5. `P5` bewusst auf `32-toast.js`/`floating.css` begrenzt: A56 gilt laut Katalog
   nur „bei Toasts"; der Rotiergriff in `42-signature.js` nutzt
   `setPointerCapture` legitim. Eine breitere Sonde produzierte sofort einen
   Fehlalarm — dokumentiert in der `description` der Sonde.

**Abdeckung wird berichtet, nicht erzwungen.** Die verbleibenden 14 Gesetze
(A21, A22, A24, A42, A43, A44, A46, A47, A57, A58, A59, A60, A62, A39) sind
nicht sinnvoll per Regex pruefbar — „unkontrolliertes Scrolling" oder „komplexe
UI in contenteditable" braucht Struktur-, keine Textanalyse. Ein Gate, das
100 % Abdeckung fordert, erzwaenge Schein-Sonden: das Gegenteil des Ziels.
Die Quote steht ab jetzt in jedem Build-Log, damit sie nicht unsichtbar verfaellt.

### Generalisierung
(p) **Eine Pruefung, die nie zuschlaegt, ist von einer bestandenen Pruefung nicht
zu unterscheiden.** Gruenes Gate heisst „keine Sonde hat angeschlagen", nicht
„alles ist in Ordnung". Jede Sonde braucht mindestens einmal den Nachweis, dass
sie ueberhaupt feuern kann — sonst ist sie Dekoration.
(q) **Normen brauchen eine maschinenlesbare Rueckverbindung zur Pruefung.**
`catalog_ref` gab es schon; niemand pruefte, ob die Ziele existieren. Ein
Verweis ohne Integritaetspruefung ist eine Behauptung.
(r) **Die Reichweite einer Sonde ist Teil der Norm.** A56 sagt „bei Toasts".
Wer das beim Pruefen weglaesst, erzeugt Fehlalarme und untergraebt das Gate
schneller, als eine fehlende Sonde es je koennte.

## 2026-10-02 — Foundation-Dokumentation auf eine Quelle je Aussage zurückgeführt

**Anlass.** Die vorherige Konsolidierung hatte den Law Catalog und die Agenten-Einstiegspunkte bereinigt, aber `constitution.md` enthielt weiterhin eine verkürzte dritte Verbotsliste. Zusätzlich führten der Foundation-Hub noch auf gelöschte Inventar-Snapshots und zwei Hubs dieselbe Chronik doppelt.

**Entschieden.** `constitution.md` ist jetzt eine schlanke Prinzipien-Charta: Mission, Unabhängigkeit, Plattform-vor-Nachbau und Quellenhierarchie bleiben dort; konkrete Verbote und technische Muster werden ausschließlich im [[Immutable-Law-Catalog]] geführt. Stale Inventarverweise und doppelte DECISION-LOG-Einträge wurden entfernt. Die Archivregel im Drift-Playbook verweist nun auf den tatsächlichen Archivpfad.

**Generalisierung.** Ein Foundation-Dokument darf den Zweck und die Zuständigkeit einer Norm erklären, aber deren Einzelfälle nicht paraphrasieren. Bei jeder Doku-Konsolidierung sind danach sowohl tote Pfade als auch doppelte Hub-Einträge zu prüfen.

## 2026-10-02 — Research-Funde umgesetzt: Adresssuche gehärtet, CSS-Kandidaten bewertet

**Kontext.** Die Research-Roadmap wurde gegen den aktuellen Code geprüft. Die offenen CSS-Kandidaten `@page`-Margin-Boxes, `::highlight()` und `subgrid` ersetzen in der heutigen Ein-Seiten-/absoluten DIN-Geometrie keinen vorhandenen JavaScript-Pfad sicher. Eine Schein-Implementierung würde entweder die Drucknorm verändern oder nur ungenutzte Syntax hinzufügen.

**Änderung.** (1) Das Adress-Dropdown (`43-geoapify.js`) ist jetzt als `role=listbox`/`role=option` ausgezeichnet und per Pfeiltasten, Enter und Escape bedienbar; die aktive Option wird über `aria-activedescendant` und deklaratives CSS hervorgehoben. (2) Alle drei Geoapify-Anfragen haben jetzt ein natives 8-Sekunden-Limit über `AbortSignal.timeout()`; die laufende Suche kombiniert dieses Limit mit dem bestehenden `AbortController` über `AbortSignal.any()`. (3) B18 und B20 im Backlog als erledigt, B21 als bewertet markiert.

**Verifikation.** Fitness Gate 100 %; TypeScript-Prüfung und Link-/Metadaten-Gate ohne Befund. Der einzige verbleibende Hinweis ist die bekannte, bewusst nicht vollständige Law-Coverage.

**Generalisierung.** Moderne CSS-Syntax ist kein Selbstzweck: Ein Kandidat wird nur übernommen, wenn er einen realen Layout-/DOM-/JS-Pfad ersetzt. Für asynchrone Fach-APIs sind native Abort-Signale der richtige Ersatz für eigene Timeout- und Race-Logik; die UI-Zustandssemantik bleibt nativ, wo sie ohne zusätzliche Laufzeitlogik möglich ist.

## 2026-10-02 — Doku-Deduplizierung: historische Feature-Tracking-Dokumente archiviert

**Kontext.** Der aktive `30-meta`-Bereich enthielt drei Dokumente mit weitgehend überlappender oder historischer Technologie-Orientierung: `DEV-INFO.md` (25-Feature-Diagnose und Easter-Egg-Konzept), `web-standards-tracking.md` (Chrome-Release-Scan 142–151) und `architektur-evolution-und-quellen.md` (Entscheidungsgeschichte). Der verbindliche aktuelle Stand liegt bereits in `longevity-guidelines`, den thematischen ADRs und der Research-Quelle `research/README.md`.

**Änderung.** Die drei Dokumente wurden unverändert als Zeitdokumente nach `docs/90-archive/` verschoben und auf `status: archived` gesetzt. Live-Hubs verlinken nicht mehr auf die alten Kopien; `research/README.md` ist der Einstieg für Quellen, Messungen und Modern-Web-Recherche. `tool-result-vocabulary.md` bleibt bewusst aktiv, weil MCP, Skills und `repository.yaml` es als kanonischen Tool-Vertrag referenzieren.

**Verifikation.** Fitness Gate 100 %, Link-/Metadaten-Gate ohne Befund. Kein historischer DECISION-LOG-Eintrag wurde rückwirkend umgeschrieben.

**Generalisierung.** Ein Dokument mit historischem Browser-Scan oder Architekturbegründungen ist nicht automatisch aktives Projektwissen. Aktive Dokumente müssen Entscheidungen und aktuelle Zuständigkeiten enthalten; Recherche und Zeitdokumente werden referenziert, nicht als parallele Normquelle geführt.

## 2026-10-02 — Browser-Zoom nur für die Seitenleiste kompensieren

**Kontext.** `Ctrl`+`+`/`Ctrl`+`-` verändert den Desktop-Seitenzoom. Das DIN-Blatt blieb durch seine physische A4-Geometrie visuell korrekt, während die Seitenleiste mitskalierte. Gewünscht ist: Blatt und Seitenleisten-Bedienfläche behalten ihre authored Größe; nur der Browser-Viewport darf sich ändern.

**Änderung.** `main.js` erfasst beim Start die initiale `devicePixelRatio` (inklusive OS-/Display-Skalierung) und reagiert auf spätere `resize`-Ereignisse von Window und `visualViewport`. Nur auf `aside` wird die inverse Differenz als native CSS-`zoom` über `--seitenleisten-zoom` gesetzt. Das DIN-Blatt und `#viewport` bleiben vollständig unberührt; es gibt keine globale Skalierung und keine Änderung der DIN-Millimeterwerte.

**Verifikation.** Fitness Gate 100 %, TypeScript-/Link-/Metadaten-Gate ohne Befund. Die Änderung ist auf die Seitenleiste begrenzt; der bekannte Low-Hinweis zur unvollständigen Law-Coverage bleibt unverändert.

**Generalisierung.** Browser-Seitenzoom ist kein normales responsives Layoutsignal. Eine Kompensation darf deshalb nicht global erfolgen: OS-Skalierung wird als Startreferenz neutralisiert, danach wird ausschließlich die betroffene Bedienfläche invers skaliert.

## 2026-10-02 — Feature-Matrix als aktuelle Bestandsquelle neu geschrieben

**Kontext.** Die alte `Feature-Matrix.md` war eine historische Platinum-Sprintliste mit veralteten Prozentzahlen, fremden Issue-Links und Statusangaben, die dem aktuellen Code widersprachen. Damit konkurrierte sie mit `ROADMAP.md` und `BACKLOG.md`, statt eine eigene klare Rolle zu haben.

**Änderung.** Die Datei wurde vollständig als aktuelle Produkt-Bestandsmatrix neu geschrieben. Sie beschreibt jetzt nur noch vorhandene Kernfunktionen, optionale Funktionen, geparkte Themen und klar benannte offene Kandidaten. Prozentwerte, Sprintnamen und externe Issue-Links wurden entfernt. Die Zuständigkeiten sind explizit: Matrix = Bestand, Backlog = konkrete Arbeit, Roadmap = Zukunft, ADRs/Law Catalog = kanonische Entscheidungen und Normen, Research = Quellen.

**Verifikation.** Fitness Gate 100 %, Link-/Metadaten-Gate ohne Befund. Die Matrix enthält keine Completion-Prozentzahl mehr.

**Generalisierung.** Eine Feature-Matrix ist nur dann nützlich, wenn sie den Ist-Stand beschreibt. Fortschrittszahlen und Sprintplanung gehören nicht in dieselbe Quelle; sobald eine Matrix beides vermischt, wird sie zur zweiten, driftenden Roadmap.

## 2026-10-02 — Optimierungsbatch: Adresszonen, deklarative Feldtypen, Struktur-Gate und Caret-SSoT

**Kontext.** Nach der Feature-Matrix-Bereinigung wurden die nächsten technisch belastbaren Punkte aus dem Backlog umgesetzt. Mehrseitigkeit bleibt ein späteres Produktvorhaben; `@page`-Seitenzahlen werden bis zu einer eigenen Mehrseiten-Spec nicht eingebaut.

**Änderung.** (1) `43-geoapify.js` nutzt jetzt die adaptive Trefferlogik: mehr als fünf Treffer zeigen einen Eingrenzungshinweis, zwei bis fünf eine Liste, genau ein Treffer wird erst nach dem vollständigen Abgleich automatisch übernommen. (2) Feld-Sonderfälle stehen als `data-feldtyp` im HTML; Draft-Restore, Boot-Restore und UI-Schutz lesen diese Quelle statt paralleler ID-Listen. (3) `tools/structural-laws.js` prüft doppelte IDs und binäre Radio-Gruppen (mit der begründeten Form-A/B-Ausnahme); das Modul ist in den Fitness Gate integriert. (4) Selection-/Caret-Funktionen wurden in `website/js/selection-utils.js` zentralisiert und von DraftManager und Offline-Adressintelligenz verwendet. (5) Fünf unkritische Nicht-Print-`!important`-Deklarationen wurden entfernt; Schutzregeln für Print, Reduced Motion und Signaturzustände bleiben bestehen. (6) `research/STATUS.md` klassifiziert Research als umgesetzt, offen, verfallen, Quelle oder Index. (7) `ROADMAP.md` enthält nur noch echte Zukunft, einschließlich einer späteren Mehrseitenarchitektur.

**Verifikation.** Fitness Gate 100 %, TypeScript-/Link-/Metadaten-Gate ohne Befund. Der bekannte Low-Hinweis zur 21/35-Law-Coverage bleibt bewusst bestehen. Der Browser-Zoom-Ausgleich ist code-seitig auf die Seitenleiste begrenzt; die tatsächliche Ctrl-+/Ctrl--Sichtprüfung bleibt ein manueller Browser-Test.

**Generalisierung.** Deklarative Metadaten lohnen sich dort, wo mehrere Module dieselbe Feldklassifikation kennen müssen. Native Plattformfeatures werden nur übernommen, wenn sie einen realen Pfad ersetzen; Mehrseiten-Druck und Seitenzahlen bilden eine eigene Architektur, keine kleine CSS-Erweiterung.

## 2026-10-02 — KISS-Optimierungsbatch: Event-Delegation, Caret-SSoT, Gzip-Pipeline, B8-Abschluss und Gesetzes-Gate-Ausbau (30/35)

**Kontext.** Nach der Feature-Matrix- und Research-Bereinigung blieben fünf konkrete Stellen für Code-Deduplizierung und Overhead-Reduktion offen: über 60 redundante Event-Listener auf jedem editierbaren Blattfeld, veraltete Durchreicher-Methoden im DraftManager, ein CI-Fehlschlag in der veralteten Quartals-Pipeline (Brotli vs. Gzip-Architektur), manuelle DOM-Tree-Walk-Schleifen in der Formatierungsleiste, direkte LocalStorage-Bypässe an `StorageManager` vorbei sowie 12 verbliebene Non-Print-`!important`-Deklarationen (Backlog B8). Zudem war die Gesetzes-Abdeckung des Fitness-Gates bei 21/35 stehengeblieben, obwohl `tools/structural-laws.js` bereits strukturelle Prüfungen durchführte.

**Änderung.**
1. **DOM-Event-Delegation (Task 1):** Die 60 Einzellistener auf `[contenteditable]` in `03-ui-protections.js` und `main.js` wurden durch 3 delegierte Listener auf dem Briefbogen-Root `din-a4` (`keydown`, `paste` für Zeichenlimits/Zeilenlimits und `input` für AutoSave) ersetzt.
2. **Caret-SSoT (Task 2):** Die privaten Durchreicher-Methoden `#getCaretCharacterOffsetWithin` und `#setCaretPosition` in `01-draft-manager.js` wurden entfernt; Aufrufe erfolgen nun direkt an das kanonische Modul `selection-utils.js`.
3. **CI-Pipeline-Synchronisation:** `research/research_scripts/update_plz_pipeline.py` wurde von Brotli auf gzip mit bit-deterministischem `compresslevel=9, mtime=0` umgestellt; die Generierung der veralteten `plz-embedded.js` wurde vollständig entfernt. Pipeline-Output und App-Laufzeit (`05-gzip.js`) sind wieder 100 % synchron.
4. **Toolbar DOM-Traversierung (Task 4):** Drei manuelle `while`-Elternknoten-Schleifen in `31-format-toolbar.js` wurden zu einer einzigen `#findFormatAncestor(node, tagName)`-Hilfsmethode mit nativem `.closest()` konsolidiert. Die doppelte Traversierung beim Formatierungs-Unwrapping entfällt.
5. **LocalStorage-Kapselung (Task 3):** Direkte `localStorage`-Zugriffe in `43-geoapify.js` (Adressen, Koordinaten), `02-settings-manager.js` (Custom Font Cleanup) und `52-import-export.js` (Draft-Handling) wurden vollständig in `StorageManager` (`51-storage.js`) gekapselt.
6. **B8-Abschluss (CSS `!important`):** Alle 12 Non-Print-`!important` in Autoren-Styles wurden restlos aufgelöst. Verfehlt platzierte Seitenleisten-Labels wanderten nach `sidebar.css`, DIN-Elemente nach `sheet.css`, Postvermerk-Styling in `layout.css` wurde konsolidiert und `.hidden` über native Spezifität und Layer-Hierarchie gelöst.
7. **B17 Phase 2 (Gesetzes-Gate-Ausbau):** `tools/structural-laws.js` wurde um Prüfungen für A58 (Theme-Radios verboten), A24 (nicht deklarierte CSS-Tokens) und A59 (Theme-Variablen auf dem DIN-A4-Blatt) erweitert und in `tools/lawcoverage.js` als SSoT-Prüfer verdrahtet. Vier neue Sonden P18–P21 in `tools/antipatterns/project.json` erzwingen A46 (page-break-before), A39 (Icon-CDNs), A21 (CSS-Preprozessoren) und A22 (CSS-in-JS). Die normative Abdeckung stieg von 21/35 auf **30/35 (85,7 %)**.

**Verifikation.**
- Alle Fitness-Tools (`isolation.js`, `structural-laws.js`, `imr.js`, `links.js`, `terminology.js`) laufen mit Exit-Code 0 durch.
- `tools/lawcoverage.js` meldet 0 Verstöße und bestätigt 30/35 abgedeckte Gesetze.
- Manuelle und automatisierte Tests der Web-App bestätigen fehlerfreie Funktionalität ohne Regressionen.

**Generalisierung.**
- Event-Delegation am Dokument- oder Container-Root ist Einzellistenern auf dynamischen Kindelementen immer überlegen: weniger DOM-Overhead, keine Memory-Leaks bei Re-Renders und saubere Trennung von Event-Falle und Event-Ziel.
- Eine CI-Pipeline muss zwingend denselben Datenvertrag und dieselbe Kompressionsstufe bedienen wie die Laufzeitkomponenten der Anwendung.
- Architekturregeln dürfen nicht als „Papiergesetze" existieren: Was im Gesetzbuch steht, braucht entweder einen maschinellen Gate-Prüfer oder eine explizite Dokumentation, warum es sich um einen nicht-regexfähigen Gestaltungsleitsatz handelt.

## 2026-10-03 — Surgical Fixes: Layer-Ehrlichkeit, field-sizing, Browserziel, Autosave-A11y (#1–#4)

**Kontext:** Das Handoff-Dokument `docs/90-archive/HANDOFF-2026-10-03-pull-diff-offene-punkte.md` listete 7 offene Punkte. Diese Sitzung umsetzte #1–#4 surgical.

**Änderung:**
1. **#1 Layer-Architektur:** `<link layer="…">` in `index.html` war ein No-Op (Attribut nicht standardisiert). `@import layer()` als Alternative scheiterte an A23 (`@import`-Verbot). Lösung: Kommentare in `layers.css` ehrlich machen — Quell-Reihenfolge in `index.html` ersetzt die Layer-Zuordnung, `@layer`-Statement bleibt als Dokumentation der gewünschten Kaskaden-Reihenfolge.
2. **#2 field-sizing:** `field-sizing: content` auf `contenteditable` war wirkungslos (zielt auf Form-Controls). Deklaration entfernt, `text-fit: shrink` als eigentlicher Stauchungsmechanismus benannt.
3. **#3 Browserziel-Doku:** „Baseline 2024-2026" durch „Chromium 150+" ersetzt in `variables.css`, `layout.css`, `main.js` — das Projekt hat kein Cross-Browser-Ziel.
4. **#4 Autosave-A11y:** `role="status" aria-live="polite"` von `#save-status` entfernt — widersprach dem JS-Kommentar („keine Live-Region") und erzeugte mit `document.ariaNotify` eine Doppelansage bei Fehlern.

**Verifikation:** Fitness Gate 100 % (nach `git add` geprüft). `tsc --noEmit` ohne Befund. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Wenn ein Feature nicht standardisiert ist, Kommentare ehrlich machen statt als implementiert zu tun. Ein No-Op-Attribut ist schlimmer als kein Attribut — es suggeriert Schutz, der nicht existiert.
- A23 (`@import`-Verbot) schließt `@import layer()` aus — die einzige unterstützte Layer-Zuordnung. Die Quell-Reihenfolge in `html` ist der einzige Weg, Kaskaden-Layer ohne `@import` zu kontrollieren.
- `field-sizing: content` wirkt nur auf Form-Controls (`input`, `textarea`), nicht auf `contenteditable`. Die Stauchung macht `text-fit: shrink`.
- `role="status"` + `aria-live="polite"` auf einem Element, dessen Text sich bei jedem Autosave ändert, erzeugt eine Doppelansage, wenn der Fehlerpfad zusätzlich `document.ariaNotify` nutzt. Visuelle Indikatoren brauchen keine Live-Region.

## 2026-10-03 — Toast-System entschlackt (238 → 70 Zeilen)

**Kontext:** Das Toast-System war ein Framework für ein Feature, das ~70 Zeilen braucht. Queue-Verwaltung, Pause/Resume, Badge, Shake-Animation und Action-Button waren Overkill. Die Queue war ursprünglich dafür gedacht, dass nicht derselbe Toast 5 mal durchrutscht — das sieht scheisse programmiert aus.

**Änderung:**
1. **Queue entfernt** — stattdessen Deduplizierung: identische Message → Timer zurücksetzen, neuer Toast ersetzt alten sofort.
2. **Pause/Resume entfernt** — Nice-to-have, nicht essenziell.
3. **Badge entfernt** — Nice-to-have.
4. **Shake-Animation entfernt** — Nice-to-have.
5. **Action-Button entfernt** — toter Code (kein Aufruf mit `options.action`).
6. **Direktes Ersetzen statt hide/show** — vermeidet Race-Condition zwischen Exit- und Entry-Animation.
7. **CloseWatcher + Popover + CSS Animation bleiben** — nativ + kostenlos.

**Verifikation:** Fitness Gate 100 %. `tsc --noEmit` ohne Befund. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Ein Toast-Slot statt Framework: neuer Toast ersetzt alten, Deduplizierung verhindert Spam ohne Queue.
- `showPopover()` ist idempotent — kein Hide-Show-Tanz nötig.
- Toter Code (Action-Button) entfernen, nicht „für den Fall" behalten. Ein Bestätigungs-Toast ist in 5 Zeilen nachgerüstet, wenn gebraucht.

## 2026-10-03 — Format-Toolbar entschlackt (405 → 270 Zeilen)

**Kontext:** Ein Review hatte `31-format-toolbar.js` als „Müllberg" bezeichnet. Nach Korrektur: Das Modul ist moderat aufgebläht, kein Müllberg. Fünf surgical Changes.

**Änderung:**
1. `#getBlockquoteAncestor` entfernt — redundant, 3 Zeilen gespart.
2. `toggleFormat` + `#toggleQuote` zu `#toggleWrap` gemergt — Wrap/Unwrap-Logik vereinheitlicht, ~80 Zeilen gespart.
3. `#commandButtons-Map` durch direkte `querySelector`-Refs ersetzt — Lazy-Lookup unnötig, 5 Zeilen gespart.
4. `caretRangeFromPoint` → `caretPositionFromPoint` — deprecated API ersetzt.
5. B/Strong-Sonderfall in `FORMAT_SELECTORS`-Mapping-Objekt — verschachtelte Ternaries entfernt.

**Verifikation:** Fitness Gate 100 %. `tsc --noEmit` ohne Befund. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Wrap/Unwrap-Logik vereinheitlichen: `toggleFormat` und `#toggleQuote` waren identische Code-Pfade.
- Deprecated APIs ersetzen: `caretRangeFromPoint` ist non-standard, `caretPositionFromPoint` ist der Nachfolger (Chrome 128+).
- Verschachtelte Ternaries in Mapping-Objekte umwandeln: `FORMAT_SELECTORS[tagName]` ist lesbarer als `tagName === 'comment' ? ... : tagName === 'B' ? ... : ...`.
- Button-Cache mit Lazy-Lookup ist Overhead: direkte `querySelector`-Refs sind schneller und einfacher.

## 2026-10-03 — View-Transition-Helper + AI-Assistant-UI-Merge

**Kontext:** Drei fast identische View-Transition-Blöcke in `02-settings-manager.js` (~20 Zeilen Boilerplate). Zwei fast identische UI-Funktionen in `addons/ai-assistant.js` (~40 Zeilen). `rewriterInstance` wurde nie freigegeben.

**Änderung:**
1. `transitionOn(target, fn)`-Helper in `02-settings-manager.js` — vereinheitlicht Document- und Element-Scope, `prefers-reduced-motion`-Check, `finished.catch(() => {})`. Drei Aufrufstellen je 1 Zeile.
2. `_updateUIUnsupported` + `_updateUISupported` → `_setToggleState(supported, statusText)` in `addons/ai-assistant.js`.
3. `rewriterInstance.destroy()` + `= null` bei Toggle-Off.

**Verifikation:** Fitness Gate 100 %. `tsc --noEmit` ohne Befund. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- View-Transition-Boilerplate in Hilfsfunktion vereinheitlichen: `prefers-reduced-motion`-Check + `finished.catch()` überall identisch.
- UI-Zustands-Funktionen mit gemeinsamer Logik mergen: `_setToggleState` statt zwei fast identischer Funktionen.
- Instanzen bei Deaktivierung freigeben: `destroy()` + `= null` verhindert Speicherlecks.

## 2026-10-03 — Papier-Nachtmodus auf gedimmtes Grau

**Kontext:** Der Nutzer fand `oklch(0.94 0.008 260)` (fast weiß) im Nachtmodus zu hell. Gewünscht: `oklch(0.6 0 260)` — gedimmtes Grau, sanfter Kontrast.

**Änderung:** `--c-blatt-night` in `website/css/variables.css` von `oklch(0.94 0.008 260)` auf `oklch(0.6 0 260)` geändert. Kommentar aktualisiert.

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Nachtmodus-Papier sollte gedimmt sein, nicht dunkel. `oklch(0.6 0 260)` ist ein sanfter Grauton, der die Augen schont.
- Der Wert wurde per F12-Slider live getestet, nicht geraten. Live-Empirie schlägt Annahme.

## 2026-10-03 — @ts-ignore zu @ts-expect-error migriert

**Kontext:** Ein Review hatte `@ts-ignore` als „unsichtbare Workarounds" kritisiert. `@ts-expect-error` ist besser: Es wirft einen Fehler, wenn der Fehler nicht mehr auftritt — dann weißt du, dass du den Workaround entfernen kannst.

**Änderung:**
1. `02-settings-manager.js:83` — `@ts-ignore` entfernt (defensiv, kein echter Fehler).
2. `46-clipboard-address-parser.js` — alle 6 `@ts-ignore` entfernt. `hidePopover`/`showPopover` als optional Properties deklariert (`HTMLElement & { hidePopover?: () => void }`).
3. `45-address-intelligence.js:298,300` — `@ts-ignore` → `@ts-expect-error` mit Begründung (Element-scoped View Transitions, Chrome 147+, noch nicht in lib.dom).

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- `@ts-expect-error` statt `@ts-ignore`: Workarounds werden sichtbar. Wenn ein Update den Fehler auflöst, meldet der Typecheck „Unused '@ts-expect-error'" — und du weißt: Workaround kann raus.
- Defensive `@ts-ignore` entfernen: Wenn kein Fehler gemeldet wird, war der `@ts-ignore` unnötig.
- Popover-Methoden als optional Properties deklarieren: `HTMLElement & { hidePopover?: () => void }` ist robuster als `@ts-ignore` und funktioniert mit jeder TS-Version.

## 2026-10-03 — SQLite-Datenbanken dokumentiert

**Kontext:** Ein Review hatte die SQLite-Datenbanken als „unsichtbar" kritisiert. Sie existieren, aber kein Dokument erwähnt sie prominent. Agenten greppen, statt `docs_search.db` zu fragen.

**Änderung:** `docs/30-meta/tooling-overview.md` ergänzt um:
1. `docs_search.db` — Schema-Tabellen (documents, sections, files, links, FTS5), FTS5-Details (unicode61 + trigram), Query-Beispiele, Verbesserungsideen.
2. `DIN-Brief_docs.db` — Schema-Tabelle (agent_session_logs), Query-Beispiele, Verbesserungsideen.

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Agenten müssen wissen, welche DBs existieren, wo sie liegen, wie sie gebaut werden und wie man sie abfragt. Ohne Dokumentation ist jede Infrastruktur für Agenten tot.
- Query-Beispiele sind wichtiger als Schema-Beschreibung — Agenten können Schema selbst lesen, aber Query-Syntax müssen sie kennen.
- Verbesserungsideen helfen Agenten, die DBs zu verbessenden, statt sie zu ignorieren.

## 2026-10-03 — SQLite-Datenbanken detailliert dokumentiert

**Kontext:** Der Nutzer wollte eine detaillierte technische Dokumentation — wie die DBs gebaut werden, welche Bausteine verwendet werden, wie die FTS5-Indizes funktionieren.

**Änderung:** `docs/30-meta/tooling-overview.md` ergänzt um:
1. `docs_search.db` — Build-Prozess (5 Schritte), Bausteine (node:sqlite, FTS5, git ls-files), Schema (6 Tabellen), Indizes (5), FTS5-Details (unicode61 + trigram), Query-Schicht (4 Funktionen), CLI-Bedienung, Verbesserungsideen.
2. `DIN-Brief_docs.db` — Build-Prozess (6 Schritte), Bausteine (node:sqlite + sqlite3-Fallback), Schema (1 Tabelle), Query-Beispiele, CLI-Bedienung, Verbesserungsideen.

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Eine detaillierte technische Dokumentation ist wichtiger als eine kurze Beschreibung. Agenten müssen wissen, wie die DBs gebaut werden, welche Bausteine verwendet werden und wie man sie abfragt.
- Build-Prozess, Bausteine, Schema, Indizes, Query-Schicht, CLI-Bedienung — alles muss dokumentiert sein, damit Agenten die DBs verbessern können.

## 2026-10-03 — Betriebs-Details zu SQLite-Datenbanken dokumentiert

**Kontext:** Der Nutzer wollte konkrete Betriebs-Details — Schema, Aufruf-Kontext, Build-Lifecycle, Nutzungs-Regel, Stale-Erkennung.

**Änderung:** `docs/30-meta/tooling-overview.md` um neuen Abschnitt "Betriebs-Details" ergänzt:
1. Session-Log-Schema (CREATE TABLE, Spalten, Constraints, Defaults)
2. Aufruf-Kontext (4 Abfragestellen, ensureFresh() automatisch)
3. Build-Lifecycle (automatisch über Fitness Gate, manuell über CLI)
4. Nutzungs-Regel (docs_search.db für Volltextsuche, grep für Codesuche)
5. Stale-Erkennung (mtime-Vergleich + Datei-Set-Vergleich, full rebuild)

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Betriebs-Details sind wichtiger als technische Dokumentation. Agenten müssen wissen, wie die DBs gebaut werden, wann sie neu gebaut werden und wie man sie abfragt.
- ensureFresh() wird automatisch aufgerufen — Agenten müssen es nicht explizit tun.
- Stale-Erkennung nutzt mtime + Datei-Set-Vergleich, kein Incremental-Update.

## 2026-10-03 — stabilizeSidebarForPageZoom entfernt

**Kontext:** Ein Review hatte `stabilizeSidebarForPageZoom` als „echten Bug" identifiziert: DPR-Delta als Zoom-Proxy triggert fälschlich bei Monitorwechsel.

**Änderung:** `stabilizeSidebarForPageZoom` aus `website/js/main.js` entfernt. CSS-Variable `--seitenleisten-zoom` aus `website/css/sidebar.css` entfernt.

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- DPR-Delta ist kein zuverlässiger Zoom-Proxy. Monitorwechsel löst `resize` aus, was fälschlich als Zoom interpretiert wird.
- Wenn eine Funktion einen Bug verursacht, die Funktion entfernen, nicht den Bug umgehen.

## 2026-10-03 — CSS-Links wiederhergestellt (Production-Breaker)

**Kontext:** Ein Review hatte festgestellt, dass 6 CSS-Dateien nicht geladen werden. `layers.css` enthielt nur die `@layer`-Deklaration, aber keine `@import`-Zeilen. Die App hätte ohne Layout, Farben und DIN-Geometrie gerendert.

**Änderung:** CSS-Links für `reset.css`, `variables.css`, `layout.css`, `sidebar.css`, `sheet.css`, `signature.css`, `floating.css` in `website/index.html` wiederhergestellt. Quell-Reihenfolge ersetzt Layer-Zuordnung.

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- `@import layer()` ist durch A23 (`@import`-Verbot) ausgeschlossen. Die Quell-Reihenfolge in `index.html` ist der einzige Weg, Kaskaden-Layer ohne `@import` zu kontrollieren.
- Ein Review, der nur `website/js/` sieht, versteht nicht, warum die CSS-Links fehlen. Die Änderung wurde im Kontext der Layer-Architektur vorgenommen, aber der Reviewer hat recht: Die App wäre unbenutzbar gewesen.

## 2026-10-03 — @layer-Deklaration aus layers.css entfernt

**Kontext:** Ein Review hatte festgestellt, dass die `@layer`-Deklaration in `layers.css` dekorativ ist — ohne `@layer`-Blöcke in den CSS-Dateien hat sie keine Wirkung.

**Änderung:** `@layer reset, tokens, layout, floating;` aus `website/css/layers.css` entfernt. Kommentar aktualisiert.

**Verifikation:** Fitness Gate 100 %. `node tools/log_session.js` protokolliert.

**Generalisierbarkeit (llm_boilerplate):**
- Eine Deklaration ohne Inhalt ist schlimmer als keine Deklaration. Sie suggeriert eine Struktur, die nicht existiert.
- Option B (Wrapper in 6 CSS-Dateien) wäre sauberer, aber ohne konkreten Schmerz — die Kaskade funktioniert wie sie soll.

## 2026-10-06 — SalutationEngine: Vornamen-Index zugunsten von Robustheit & Autarkie entfernt

**Kontext:** Die bisherige SalutationEngine nutzte eine asynchron geladene Gzip-Vornamendatenbank (`data/de_vornamen_gender.json.gz`), um bei bloßer Eingabe von Vor- und Nachnamen (ohne "Herr"/"Frau") das Geschlecht zu erraten. Dies führte zu asynchronen Latenzen/Race-Conditions beim schnellen Tippen, potentiellen Fehlzuordnungen bei androgynen oder unbekannten Namen sowie einem fehleranfälligen Dirty-State-Management, das manuelle Eingaben bei Stilwechseln mit `force: true` überschrieb.

**Entscheidung:**
1. **Entfernung der Vornamen-Erkennung:** Das Geschlecht wird ausschließlich aus expliziten Präfixen ("Herr", "Herrn", "Frau") abgeleitet. Ohne Präfix wird neutral formuliert ("Sehr geehrte Damen und Herren," bzw. "Guten Tag," / "Hallo,") — lieber neutral als falsch geraten.
2. **100 % Autark & Synchron:** Kein Netzwerk-Fetch, kein Gzip-Decompressions-Stream mehr für die Anrede. `SalutationEngine.derive()` ist eine reine, seiteneffektfreie Funktion (`pure function`) ohne I/O.
3. **Verbessertes Name-Parsing:** Unterstützung für das Format "Nachname, Vorname" (wird zu "Vorname Nachname" invertiert), generisches Filtern von Titeln/Initialen (`!t.endsWith('.')`) und erweiterte Adels-/Herkunftspartikel (`PARTICLES`).
4. **Zuletzt-synchronisiert-State:** Manuelle Benutzereingaben in Anrede und Grußformel werden niemals mehr überschrieben, auch nicht beim Umschalten der Formalität.

**Verifikation:** Fitness Gate 100 %. Node Syntax-Check fehlerfrei.

**Generalisierbarkeit (llm_boilerplate):**
- Autarke deterministische Heuristiken schlagen spekulative Wörterbuch-Lookups, wenn Fehlerraten bei Personennamen Peinlichkeiten verursachen können.
- "Zuletzt generiert" als Synchronisationsanker schützt Benutzereingaben zuverlässiger als globale Dirty-Flags.

## 2026-10-06 — Umstellung auf Rich-Text-Light (Format-Toolbar eliminiert)

**Kontext:** Die frühere Floating Format-Toolbar (`website/js/31-format-toolbar.js`, Popover mit Anchor-Positioning, Selection-Anchor) brachte erhebliche Komplexität und Fehleranfälligkeit für Standardbriefe nach DIN 5008 (u. a. Flackern, Selektions-Desync, Code-Bloat). Zudem führte unkontrolliertes Rich-Text-Pasting zu Stil-Verschmutzung im Briefblatt.

**Entscheidung:**
1. **Format-Toolbar vollständig entfernt:** `31-format-toolbar.js`, `#format-toolbar` und `#selection-anchor` (HTML + CSS) wurden restlos gelöscht (~420 Zeilen eliminiert).
2. **Natives Bold & Underline:** Der Text (`#text`) bleibt `contenteditable="true"`. Fettes (`<b>`) und unterstrichenes (`<u>`) Formatieren erfolgt 100 % nativ über die Standard-Shortcuts des Browsers (Ctrl+B, Ctrl+U).
3. **Zitat-Shortcut (Ctrl+Q):** In `website/js/03-ui-protections.js` wurde ein nativer Shortcut implementiert, der Textpassagen per W3C Range API in `<blockquote>` fasst bzw. bei erneutem Betätigen wieder entpackt.
4. **Plaintext-Paste mit Zeilenumbruch-Erhalt:** Beim Einfügen in `#text` wird der Inhalt via Clipboard API als Plaintext extrahiert und in Text-Nodes mit `<br>`-Tags gewandelt. Absätze und Zeilenumbrüche bleiben perfekt erhalten, während fremde CSS-Stile, Schriftarten und Spans aus Word oder Webseiten sauber abgeworfen werden.
5. **Sanitizer & Draft-Restore:** `04-sanitize.js` bleibt als strikter Allowlist-Wächter beim Laden und Wiederherstellen von Entwürfen erhalten.

**Verifikation:** Fitness Gate 100 %. TypeScript `tsc -p jsconfig.json` fehlerfrei.

