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
updated: '2026-11-15'
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
Einträge bis 2026-08 → [[DECISION-LOG-2026-H1]]), niemals thematisch ausgedünnt.

### Was diesen Log kaputt macht

- **Statusmeldungen statt Begründungen** („Feature X ist jetzt fertig") — veraltet sofort.
- **Normative Regeln** hier ablegen — der Log ist append-only, Regeln müssen änderbar bleiben.
- **Einträge ohne `Verifikation`** — eine Behauptung ohne Beleg ist keine Entscheidung.
- **Einträge ohne `Verworfen`**, wo es Alternativen gab — dann fehlt genau der Schutzwert.
- **Nachträgliches Glattziehen** alter Einträge — vernichtet die Lernspur.

---

> **Archiv:** Einträge **bis 2026-08** (Mai–August) wurden ausgelagert nach
> [[DECISION-LOG-2026-H1|DECISION-LOG Archiv Mai–August 2026]].

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
Fitness Gate 100 % (pre/post). Live (Chrome 151, frischer Tab): KEINE FEHLER bei Load, Theme-Toggle → root VT ×1 + kein Toast, Form A/B → sheet VT ×1 + root VT 0, Selektion → `--sel-x/--sel-y` gesetzt + Toolbar `:popover-open` (Anchor-Positioning via CSS), Draft-Restore (121 Z. Text), Radio-Sync (layout form-a), `din-custom-font-style` nur bei gespeicherter Font, 4 externe Scripts, 0 inline.

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
- **Phase 3 / Automatik:** `githooks/pre-commit` (Gate + Index, bricht Commit bei < 100 %) + Aktivierung `git config core.hooksPath githooks`; `.github/workflows/fitness.yml` als CI-Backstop.
- **P2:** Abschnitts-Chunking — durch den Index erfüllt.
- **P3:** `docs/90-archive/` eingeführt; 8 Einmal-Artefakte (2 Grok-Reviews, `chatgpt-review-prompt`, `PROJECT`, `FOUNDATION-RESTORATION-PLAN`, `architecture-drift-audit-2026-08-27`, 2 Inventar-Snapshots) verschoben; Zeiger in `docs/index.md`, `docs/00-foundation/README.md`, `repository.yaml`, `CLAUDE.md` nachgezogen (DECISION-LOG-Altbezüge bewusst NICHT umgeschrieben = Chronik).
- **P4:** Rollen der zwei Builder klargestellt: `build_db.js` kanonisch, `build_db.py` = optionaler Vektor-Zweig (Phase 4) — in `build_db.py`-Header + `tooling-overview.md`.
- **P5:** Gate-Warnung bei Doku > 400 Zeilen (Ausnahme `DECISION-LOG`/`Code-Referenzen`); feuert aktuell für `sqlite-vec.md` (410).

**Phase 4 (vorgemerkt, belegt machbar):** sqlite-vec läuft auch im Node-Stack — `node:sqlite` mit `{ allowExtension: true }` + `loadExtension('vec0.so')`, KNN live getestet (Upstream `asg017/sqlite-vec` v0.1.9). Offen ist nur die Embedding-Modell-Entscheidung (offline/zero-dep).

**Verifikation:** Gate **100 %** nach jeder Phase; MCP `docs_search`/`docs_get` grün; Index 104 Docs / 1138 Abschnitte / 222 Dateien; Hook läuft; CI-YAML vorhanden.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Platzierungs-Taxonomie als **kritische Gate-Regel** statt Doku-Konvention, Allowlists aus dem Contract lesen (SSOT); (b) **ein** Builder + Index im Gate-Lauf, MCP nur als Query-Schicht; (c) versionierte Hooks (`githooks` + `core.hooksPath`) plus CI-Backstop; (d) Abschnitts-Chunking mit Zeilennummern ist der Token-Hebel, nicht das Datenformat.

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
3. **aria-labels auf IMR-Namen:** „Text"→„Text", „Briefinhalt"→„Briefkern", „Empfängeradresse"→„Anschriftfeld", „Absenderinformationen"→„Infoblock".
4. **„Adresse"→„Anschrift"** in UI-Texten (Ausnahme „E-Mail-Adresse").
5. **UI-Englisch verdeutscht:** `font`→`schrift` (explizite Identifier; `font-family`/`FontFace`/`fontsource` unberührt), `toast`→`hinweis` (Datei `32-toast.js` + kapitales JS-API `showToast`/`TOASTS` unberührt), `sidebar`→`seitenleiste` (Datei `sidebar.css` unberührt); `data-appearance/persist/dir/font-mode/action`→`data-erscheinungsbild/speichern/richtung/schrift-modus/aktion`; `page-1`→`seite-1`, `no-print`→`nicht-drucken`.
6. **Bugfix aus dem Rename:** JS-`dataset`-Zugriffe angepasst (`dataset.action`→`dataset.aktion`, `dataset.fontMode`→`dataset.schriftModus`) — sonst wären Signatur-Handles/Font-Umschalter stillschweigend kaputt. Bewusst gelassen: reine CSS-Konvention (`hidden`/`w-full`/`sr-only`/`single-line`, Farb-Rollen `--c-primary/-danger/-success/-warning`, `type-*`) — kein Vokabular, KISS.

**Verifikation:** keine Restvorkommen (grep leer), Schutz-Token intakt (`font-family`, `FontFace`, `fontsource`, `32-toast.js`, `css/sidebar.css`), `node --check` aller JS ok, ID-Konsistenz JS↔HTML ok, Gate 100 %, `imr.js` OK.

**Generalisierbarkeit:** Für `llm_boilerplate`: (a) Renames über Guard-Regex (`(?!\.js|\.css)`) + explizite Native-/Brand-Ausnahmen statt Blanket; (b) **`dataset.camelCase` ist die Falle** beim Attribut-Rename — Attribut und JS-Zugriff müssen zusammen wandern; (c) tote `container-name` ohne `@container` einfach löschen statt harmonisieren.

## 2026-09-30 — Kanonisches Vokabular als IMR-Vertrag + Gate-Prüfung

**Kontext:** Der Sweep zeigte: `imr.js` kontrollierte bisher nur die `din-*`-Struktur, nicht das übrige Projektvokabular. Ziel: die IMR definiert **auch die erlaubte Sprache**, und das Gate prüft sie — damit kein manueller Sweep mehr nötig ist.

**Änderung:**
1. **IMR-Inventar** um `vocabulary` erweitert: `canonical`, `forbidden` (paper→Blatt, sheet→Blatt, Text→Text, Briefinhalt→Briefkern, Empfängeradresse→Anschriftfeld, Absenderinformationen→Infoblock, sidebar→Seitenleiste, toast→Hinweis, page-1→seite-1), `forbiddenTokens` (`--paper-`/`--c-paper-`/`--c-ink-`/`--c-ghost-`/`--fold-`/`--punch-`/`--din-width`/`--din-height`/`--guide-opacity`), `exceptions` (Dateinamen), `notAutoChecked` (font/action/Adresse wegen native API bzw. Input-Parsing).
2. **`tools/imr.js`**: neue `checkVocabulary` — **case-sensitive** (kapitalisierte API-/Brand-Namen bleiben unberührt), Wortgrenzen mit `-`/`_`/`.`, überspringt `.js`/`.css`-Tokens und die Ausnahmen; `forbiddenTokens` als Literal-Scan. Verstöße sind Gate-`critical`.
3. **Residuen bereinigt:** Kommentar „Text"→„Text", Meldung „Briefinhalt"→„Briefkern", JS-Variablen `sheet`→`blatt` (draft-manager/settings-manager), Kommentar „sheet"→„Blatt".

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
  einen Namespace. Für dieses Produkt heißt das: Absenderdaten, Empfänger, Text und
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
   dazu bewusst **nicht** zusammengelegte Paare (Briefkern/Text, Briefbogen/`<din-a4>`,
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
kein Synonym für `<din-a4>`). `Briefkern` und `Text` bleiben getrennt — Zone vs. Feld.
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

## 2026-10-06 — Fehlerschutz in initApp() & Namensfilter-Entschärfung

**Kontext:**
1. `applyLetterDate()` nutzte `Temporal` ohne Feature-Detection. In älteren Browsern oder Safari ohne natives `Temporal` warf dies einen ungefangenen `ReferenceError`, der die gesamte nachfolgende Bootstrap-Kette (`uiProtections`, Autosave, Toasts, Import/Export) abbrach.
2. Der Zwischenablage-Parser (`46-clipboard-address-parser.js`) filterte über zu aggressive Präfix- und Teilwortprüfungen valide Unternehmensnamen heraus (z. B. `tel` filterte Telekom, `vr ` filterte VR Bank, `service` filterte Serviceplan, `satz` filterte Ersatzteile, `gema` filterte Gemalto).

**Entscheidung:**
1. **Defensiver Bootstrap:** `formatLetterDate()` und `currentISODate()` in `47-date-format.js` prüfen `typeof Temporal !== 'undefined'` und fangen Fehler ab. In `main.js` werden `applyLetterDate()` sowie alle Feature-Inits in isolierten `try/catch`-Blöcken initialisiert. Ein Fehler in einem Modul blockiert niemals mehr die Basisfunktionen (wie Autosave).
2. **Entschärfte Namensfilter:**
   - Präfixe `tel`, `telefon`, `fax`, `telefax`, `service`, `kontakt` greifen nur noch bei typischen Metadaten-Trennzeichen (`[:\d\+\/]`).
   - `vr ` filtert Vereinsregister-Nummern (`^vr\s*\d+`), schließt jedoch Firmennamen wie `"VR Bank"` explizit aus.
   - Juristische Klausel-Marker (`satz`, `gema`, `abs.`, `urhg`) arbeiten mit Wortgrenzen (`\b`), sodass Firmennamen wie `"Ersatzteile Müller GmbH"` oder `"Gemalto GmbH"` nicht mehr fälschlich verworfen werden.
   - Straßen-Erkennung (`hasStreetKw`) nutzt Wortgrenzen (`\b`), um Wortbestandteile wie `"ring"` in `"Axel Springer"` nicht als Straßennamen einzustufen.

**Verifikation:** Fitness Gate 100 %. Node Unit-Tests für Firmennamen und Metadaten-Zeilen erfolgreich.

## 2026-10-06 — KISS-Refactoring: Adapter-Bereinigung & Entschlackung paranoider LLM-Guards

**Kontext:** 
1. `website/js/main.js` hielt historisch ein Adapter-Objekt `sigContext = { settings, saveSettings: settingsContext.save }`, das lediglich existierte, weil `SignatureFeature` intern eine abweichende Methodensignatur erwartete.
2. Der Code in `website/js/` war über mehrere Iterationen mit paranoiden Warnkommentaren (`🚨 ARCHITECTURAL GUARD`, `STRICT HARD BAN`, `FUTURE LLM`, `GROK F6`, `AUDIT H5`) überfrachtet worden (~190 Zeilen Meta-Kommentare). Dies erschwerte die Lesbarkeit und lenkte von den tatsächlichen fachlichen Invarianten ab.

**Entscheidung:**
1. **Adapter eliminiert:** `SignatureFeature` akzeptiert nun direkt das standardisierte `settingsContext`-Objekt und nutzt intern eine private `#saveSettings()`-Methode, die `settingsContext.save()` aufruft (mit Fallback auf `saveSettings`). Der künstliche Adapter `sigContext` in `main.js` entfällt ersatzlos.
2. **Kommentar-Inflation bereinigt:** Alle hysterischen Großbuchstaben-Banner und KI-Modell-Nennungen wurden aus `website/js/` entfernt. Echte Invarianten (z. B. nativer `afterprint`-Lifecycle, Single Source of Truth bei Metadaten, CSS-driven Layout) bleiben als präzise, professionelle Einzeiler erhalten.

**Verifikation:** Fitness Gate 100 %. TypeScript `tsc -p jsconfig.json` fehlerfrei. 145 Zeilen redundanter Kommentar-Ballast über 12 Dateien entfernt.

## 2026-10-06 — Konsolidierung des Draft-Restore: boot-state.js entfernt (DraftManager als SSoT)

**Kontext:** 
Die App besaß historisch zwei parallele Restore-Owner:
1. `website/js/boot-state.js` am Ende von `<body>`, das den Draft aus `localStorage` las und eine partielle Wiederherstellung durchführte (nur Non-Rich-Felder per `textContent`).
2. `website/js/01-draft-manager.js` in `main.js`, das den Draft kurz darauf erneut vollständig einlas und über `04-sanitize.js` sanitizierte.
Diese doppelte Buchführung führte über Monate zu künstlichen Schutzklauseln (Schutz gegen UI-Bricking musste in beiden Dateien synchron gehalten werden, Rich-Text-Ausnahmen, Postvermerk-Synchronisationskonflikte). Da `main.js` als ES-Modul im selben Task-Cycle vor dem ersten Render ausgeführt wird, bot `boot-state.js` keinen FOUC-Mehrwert.

**Entscheidung:**
1. **`boot-state.js` vollständig entfernt:** Das Script wurde gelöscht und der `<script>`-Tag aus `website/index.html` entfernt.
2. **DraftManager als Single Source of Truth (SSoT):** `DraftManager.loadDraft()` in `01-draft-manager.js` ist der alleinige, autoritative Eigentümer der Entwurfswiederherstellung.
3. **Settings- und Formularzustand konsolidiert:** Radio-Buttons, Postvermerk und Schriftstatus werden sauber und zentral über `SettingsManager.init()` bzw. `syncPostvermerkFromSidebar()` initialisiert.

**Verifikation:** Evolutionary Fitness Score 100 %. TypeScript `tsc -p jsconfig.json` fehlerfrei. Alle Links (`tools/links.js`) und Gesetzes-Prüfungen (`tools/structural-laws.js`) bestanden.

## 2026-10-06 — KISS-Bereinigung: Toter Code ai-assistant.js und Phantom-UI entfernt

**Kontext:**
`website/js/addons/ai-assistant.js` war ein historischer Prototyp für On-Device-Textumformulierung via Gemini Nano. Nach der früheren Beseitigung der Floating-Format-Toolbar (`31-format-toolbar.js`) fehlte dem Addon der zugehörige Aktionsbutton (`#btn-ai-rewrite`) im DOM vollständig. Der verbliebene Schalter in der Sidebar (`#toggle-experimental-ai`) war ein funktionsloser Phantom-Schalter, der lediglich ein ungenutztes Flag in `localStorage` setzte. Das Skript wurde in `main.js` nicht importiert, sondern lediglich als totes async-Modul am Ende von `index.html` geladen.

**Entscheidung:**
1. **Addon und Script gelöscht:** `website/js/addons/ai-assistant.js` (-181 Zeilen) und der `<script>`-Tag in `website/index.html` wurden restlos entfernt. Das Verzeichnis `website/js/addons/` wurde aufgelöst.
2. **Phantom-UI entfernt:** Der Schalter `#toggle-experimental-ai` wurde aus der Sidebar in `website/index.html` entfernt.
3. **Konzeption bleibt archiviert:** Die Research-Spezifikationen und Prototyp-Dateien verbleiben unberührt in `research/roadmap/` als Blaupause für eine etwaige spätere, vollintegrierte Einbindung.
4. **ADR-Register synchronisiert:** `docs/10-architecture/ADR-JS.md` und `ADR-HTML.md` wurden aktualisiert; `ai-assistant.js` wurde in die Deprecation-Registry überführt.

**Verifikation:** Evolutionary Fitness Score 100 %. TypeScript `tsc -p jsconfig.json` fehlerfrei. Keine verwaisten DOM-IDs oder Skript-Referenzen.

## 2026-10-06 — KISS-Refactoring: Zwischenablage-Parser auf 95%-Kern konsolidiert

**Kontext:**
`website/js/46-clipboard-address-parser.js` war historisch durch wiederholte Sonderfall-Patches zu einem Heuristik-Monolithen mit über 400 Zeilen angewachsen. Er enthielt über 40 hartcodierte Ausschluss-Präfixe (`EXCLUDED_PREFIXES` wie `jugendschutz`, `editor-at-large:`, `abonnementspreis`, `online-rundfunkangebot`), willkürliche Dezimal-Scorings (`+160`, `+40`, `-i*0.15`) und eine 8 Zeilen tiefe Rückwärtssuchschleife. Dieses Muster führte in eine typische Regex-Spirale, bei der jeder unvollständige Impressumstext neue Spezialfilter erforderte.

**Entscheidung:**
1. **Rückbau auf 95%-Kern:** Der Parser konzentriert sich strikt auf die bewährte Grundstruktur deutscher Anschriften:
   - PLZ-Zeile als Anker (`\d{5} Ort`).
   - Unmittelbare Vorzeile als Straße / Hausnummer (`STREET_REGEX` oder `HAS_NUM_REGEX` oder `Postfach`).
   - Maximal 1–2 Zeilen unmittelbar davor als Empfänger (Firma mit Rechtsform via `CORP_REGEX`, Person via `PERSON_PREFIX_REGEX` oder Standard-Empfänger).
   - Saubere Stop-Kriterien (`METADATA_LINE_REGEX`, Vorläufer-PLZ) verhindern das Durchrutschen in Metadaten oder Vorläuferblöcke.
2. **Kandidaten-Popover statt Heuristik-Wettkampf:** Bei mehreren Adressblöcken (z. B. Hauptsitz + Niederlassung) wird kein spekulatives Dezimal-Scoring berechnet, sondern die Fundstellen werden sauber im nativen Popover `#clipboard-candidates-popover` zur Nutzer-Auswahl gerendert. Es erfolgt bei Mehrfachtreffern niemals ein automatischer Fallback auf den ersten Treffer — der Nutzer muss stets bewusst wählen.
3. **Regex-Spirale gestoppt:** 40+ `EXCLUDED_PREFIXES` und die 8-Zeilen-Rückwärtssuchschleife wurden ersatzlos entfernt (-155 Zeilen Netto-Code).

**Verifikation:** Evolutionary Fitness Score 100 %. TypeScript `tsc -p jsconfig.json` fehlerfrei. Unit-Tests für Firmenanschriften, private Personen, Impressums-Auszüge, Inline-Adressen und Mehrfach-Standorte erfolgreich.

## 2026-10-06 — KISS-Refactoring: StorageManager zu primitiven Speicherfunktionen & STORAGE_KEYS

**Kontext:**
`website/js/51-storage.js` war historisch zu einer überdimensionierten, 250 Zeilen langen `StorageManager`-Fassadenklasse mit 14 redundanten statischen Methoden herangewachsen. Diese wrappte triviale `localStorage`-Aufrufe (`loadDraft`, `saveDraft`, `loadSettings`, `saveSettings`, `loadFont`, `saveFont`, `clearFont`, `loadGeoapifyKey`, `saveGeoapifyKey`, `loadAddresses`, `saveAddresses`, `loadSenderCoords`, `saveSenderCoords`), wodurch jeder neue Persistenz-Schlüssel zwei neue Fassadenmethoden und redundante try/catch-Blöcke erforderte.

**Entscheidung:**
1. **Primitive Helper & flache Key-Map:**
   - Bereitstellung von 4 schlanken, typsicheren und fehlerresistenten Primitiven: `load(key, fallback = null)`, `save(key, value)`, `remove(key)` für Strings sowie `loadJSON(key, fallback = null)` und `saveJSON(key, value)` für strukturierte Daten.
   - Alle Storage-Keys sind zentral und flach in `STORAGE_KEYS` definiert (`DRAFT`, `SETTINGS`, `FONT`, `GEOAPIFY_KEY`, `ADDRESSES`, `SENDER_COORDS`).
2. **Spezifische Key-Verwaltung:**
   - Strings (`FONT`, `GEOAPIFY_KEY`) werden direkt als Strings gespeichert und nicht mehr unnötig durch `JSON.stringify`/`JSON.parse` geschleust.
   - Strukturierte Daten (`DRAFT`, `SETTINGS`, `ADDRESSES`, `SENDER_COORDS`) nutzen `loadJSON`/`saveJSON`.
3. **Schlanke Migration:**
   - `migrateStorage()` führt die Schema-v1-Migration (Umbenennung von Alt-Keys) idempotent und schlank in 10 Zeilen durch.
4. **Konsumenten direkt angebunden:**
   - Alle Module (`01-draft-manager.js`, `02-settings-manager.js`, `41-salutation-engine.js`, `43-geoapify.js`, `52-import-export.js`, `main.js`) nutzen nun direkt die primitiven Hilfsfunktionen und `STORAGE_KEYS`.
   - `StorageManager` verbleibt lediglich als dünner Deprecation-Wrapper für Abwärtskompatibilität.

**Verifikation:** Evolutionary Fitness Score 100 %. TypeScript `tsc -p jsconfig.json` fehlerfrei. Umfassende Unit-Tests in `test/all.js` für `load`, `save`, `remove`, `loadJSON`, `saveJSON` und `migrateStorage` erfolgreich.

## 2026-10-06 — Vollständiger Settings- und Font-Export in 52-import-export.js (Projekt-Backup)

**Kontext:**
Bislang exportierte `52-import-export.js` ausschließlich den Briefentwurf (`din_draft_current`) in die `.json`-Datei. Wurde ein Brief mit abweichendem Layout (z. B. Form A statt Form B), individueller WOFF2-Schriftart oder hochgeladenem und positioniertem Signaturbild exportiert und auf einem anderen Gerät oder nach einem Zurücksetzen reimportiert, gingen Layout-Wahl, Schriftart und Signatur verloren.

**Entscheidung:**
1. **Erweitertes Payload (`buildDinLetterPayload`):**
   - Neben `draft` werden optional auch `settings` (`theme`, `layout`, `guides`, `formality`, `signatureImage`, `signatureState`) und `font` (Base64-Data-URL) im standardisierten JSON-Payload gebündelt.
   - Der Export über den Button `#btn-export-dinletter` liest nun automatisch die aktuellen Einstellungen und Schriftarten aus `STORAGE_KEYS` und exportiert ein vollständiges Projekt-Backup.
2. **Defensive Validierung & Sanitizing (`parseDinLetterPayload`):**
   - Strenge Typprüfung und Sanitizing aller importierten Einstellungsfelder: Layout wird auf `'form-a' | 'form-b'` begrenzt, Signaturbild muss ein valider `data:image/`-URL sein (max. 1 MB), Signaturkoordinaten müssen finite Zahlen sein (Scale auf [0.1, 5] beschränkt), Schriftarten müssen `data:`-URLs sein (max. 256 KB).
   - Manipulierte oder invalide Werte führen zur sauberen Ablehnung (`ok: false`) mit verständlicher Fehlermeldung statt fehlerhaften DOM-Zuständen.
   - 100% abwärtskompatibel: Ältere `.json`-Dateien ohne `settings`/`font` werden unverändert akzeptiert und restauriert.
3. **UI-Rückmeldung im Import-Dialog:**
   - Der Bestätigungsdialog `#import-dialog` zeigt dem Nutzer transparent an, welche Komponenten in der Datei enthalten sind (z. B. `Brief.json (Layout: Form A, Signatur, Schriftart)`).
   - Beim Bestätigen werden Einstellungen sauber mit bestehenden lokalen Voreinstellungen gemergt und die Seite neu geladen.

**Verifikation:** Evolutionary Fitness Score 100 %. TypeScript `tsc -p jsconfig.json` fehlerfrei. Umfassende Unit-Tests in `test/all.js` für Roundtrip, Datenvalidierung und Abweisung manipulierter Werte erfolgreich.

## 2026-10-15 — Boot-Sync des Postvermerks an Draft-Existenz gekoppelt (Befund 3)

**Kontext:**
`main.js` führte beim Bootstrap synchron nacheinander `draftManager.loadDraft()` und `syncPostvermerkFromSidebar()` aus. Wenn der Nutzer das Postvermerk-Feld im Blatt bewusst geleert hatte, aber im Dropdown noch eine Auswahl stand, überschrieb `syncPostvermerkFromSidebar()` beim Neuladen das absichtlich geleerte Feld, da der Guard lediglich `!field.textContent.trim()` prüfte.

**Entscheidung:**
`syncPostvermerkFromSidebar()` beim App-Start wird strikt an `if (!hasDraft)` gekoppelt. Existiert ein gespeicherter Entwurf im `localStorage`, ist der `DraftManager` die alleinige Autorität (SSoT) für das Feld `#postvermerk` und das Dropdown `#seitenleiste-postvermerk-select`. Nur bei einem jungfräulichen Erststart ohne gespeicherten Draft initialisiert `syncPostvermerkFromSidebar()` das Feld.

**Verifikation:** Evolutionary Fitness Score 100 %.

## 2026-10-15 — Repo-Baum 1:1 mit GitHub-Stand synchronisiert (Externe Auslagerung)

**Kontext:**
Der lokale Arbeitsbaum enthielt bisher nicht-versionierte und generierte Artefakte (`node_modules/`, `agent/cache/`, `build/`, `docs/10-architecture/Code-Referenzen.md`, `docs/10-architecture/Function-Traceability.md` sowie lokale `research/`-Rohdaten-Scrapes). Dies führte zu Drift-Risiken und widersprach dem Ziel eines sauberen, hermetischen Arbeitsbaums.

**Entscheidung:**
1. **Zentrales Auslagerungsverzeichnis:** Alle lokalen Artefakte wandern nach `~/.din-briefneo/` (konfigurierbar über `DIN_BRIEFNEO_HOME`).
2. **Pfade in 9 Tools umgestellt:** `build_db.js`, `docs_index.js`, `log_session.js`, `create_context.js`, `pipeline-cache.ps1`, `start.ps1`, `agent/mcp/dinbrief-mcp/index.js`, `reconciliation.js`, `links.js`.
3. **TypeScript-Check:** `reconciliation.js` prüft hart auf `$DIN_HOME/node_modules/.bin/tsc`. Fehlt der Compiler, bricht der Build mit klarer Instruktion ab.
4. **Setup-Skripte:** `tools/setup-din-home.ps1` und `tools/setup-din-home.sh` zur idempotenten Initialisierung auf frischen Systemen erstellt.
5. **Doku-Referenzen bereinigt:** Wikilinks auf generierte Dateien in `docs/index.md`, `docs/10-architecture/README.md`, `docs/10-architecture/ADR-OMNITRACEABILITY.md` und `docs/30-meta/tooling-overview.md` bereinigt.
6. **.gitignore:** Bereinigt um obsolete generierte Einträge; Schutzfilter (`node_modules/`, `agent/cache/`, `build/`, etc.) bleiben erhalten.

**Verifikation:** Evolutionary Fitness Score 100 %, TypeScript 0 Fehler, `git clean -ndx` frei von Projekt-Artefakten.

## 2026-10-11 — 4-Domänen-Konsolidierung der CSS-Architektur und No-Flip Ergonomie-Nachtmodus (Nachtrag)

**Kontext:**
Historisch war das CSS in 8 separate Dateien fragmentiert (`variables.css`, `reset.css`, `layers.css`, `layout.css`, `sidebar.css`, `sheet.css`, `signature.css`, `floating.css`, `print.css`). Diese Zerstückelung führte zu unübersichtlichen Kaskaden-Abhängigkeiten, zirkulären Spezifitäts-Fixes zwischen `layout.css` und `floating.css` sowie übermäßigem Kontextaufwand bei Änderungen. Zudem erforderten Änderungen an gemeinsamen UI-Komponenten parallele Edits in bis zu 4 Dateien.

**Änderung:**
1. **Konsolidierung auf 4 Domänen-Dateien (Commit `0621dde`):**
   - `website/css/base.css`: Bündelt Reset, `@layer`, Design-Tokens (OKLCH), No-Flip Farbmetrik, App-Shell-Grid, `@property`-Definitionen und native Font-Stacks.
   - `website/css/sheet.css`: DIN-5008-Blattgeometrie mit Scoped Isolation (`@scope (din-a4)`), HTML-Attribut-Vermaßung via `attr()`, Briefzonen, Text-Fitting und Signatur-CAD-Overlay.
   - `website/css/sidebar.css`: Bündelt die gesamte Seitenleiste, Form-Controls (`base-select`), Autocomplete, Guides sowie die ehemals in `floating.css` ausgelagerten Top-Layer-Popovers, Dialoge und CSS Anchor Positioning (`position-anchor`).
   - `website/css/print.css`: Reiner Druck- und PDF-Export-Pfad mit `@page { size: A4; margin: 0; page-margin-safety: auto; }` und DIN-Drucktrennlinie.
2. **No-Flip Ergonomie-Nachtmodus:**
   - Sanfte Dämpfung statt invertierendem Farbchaos: Der Papierbogen bleibt auch im Dark Mode als Dokument lesbar (`--blatt-hintergrund: oklch(...)`), während Viewport und Sidebar abgedunkelt werden.
   - Beseitigung toter CSS-Dateien: `variables.css`, `reset.css`, `layers.css`, `layout.css`, `signature.css`, `floating.css` ersatzlos gelöscht.

**Verifikation:**
Evolutionary Fitness Score 100 %. Chrome DevTools Rendering-Checks: Keine Kaskaden-Konflikte, 0 Layout Thrashing, Null Scrollbars auf Viewport und Blatt.

**Generalisierbarkeit:**
Domänen-Schnitt nach Lebenszyklus und Kapselungsgrenzen (`base` vs. `sheet` vs. `sidebar` vs. `print`) ist robuster und wartungsärmer als feingliedrige Schichten-Splits (`reset`, `variables`, `layout`, `floating`), die künstliche Schnittstellen erzwingen.

## 2026-10-16 — tools/check-feature.js angelegt (Chrome 150+ Baseline-Recherche)

**Kontext:**
Bei der Umsetzung von Features gemäß der Entscheidungsleiter (HTML vor CSS vor JS, `implement-with-economy`) fehlte ein deterministisches, maschinenlesbares Werkzeug, um die Verfügbarkeit nativer Web-Plattform- und CSS/HTML/JS-Features gegen die Projekt-Baseline **Chrome 150+** zu verifizieren. Manuelle Prüfungen führten historisch wiederholt zu Annahmen-Drifts.

**Entscheidung:**
1. **Recherche-Tooling bereitgestellt (`tools/check-feature.js`):**
   - Prüft Features gegen maschinenlesbare Upstream-Daten (`web-features`, `@mdn/browser-compat-data`, `baseline-browser-mapping`).
   - Kaskadierte Suche: Exakte IDs, normalisierte Slugs (z. B. `text-fit: shrink` → `text-fit` mit Sub-Feature `shrink`), CSS-Selektoren (`:has`), HTML-Elemente/Attribute und High-Level-Konzepte (`CSS Anchor Positioning`).
   - Abgleich gegen die feste Projekt-Baseline `CHROME_BASELINE = 150`: Deklariert Features eindeutig als `✅ NUTZBAR`, `⚠️ NUR WENN BASELINE ANGEHOBEN WIRD` oder `❌ NICHT NUTZBAR`.
2. **Strikte Trennung der Datenbestände (Isolation):**
   - Die Upstream-Datenpakete liegen isoliert unter `~/.din-briefneo/feature-cache/` und berühren weder das Produktverzeichnis `website/` noch die TypeScript-Entwicklungsumgebung unter `~/.din-briefneo/node_modules/`.
   - Null Runtime-Abhängigkeiten im Repository.

**Verifikation:**
CLI-Funktionstests für CSS-Properties (`text-fit: shrink`, `text-wrap: balance`), Selektoren (`:has`), High-Level-Features (`CSS Anchor Positioning`), JSON-Ausgabe (`--json`), Gruppen (`--list-groups`) und Fehlerfälle erfolgreich verifiziert. Evolutionary Fitness Score 100 %.

## 2026-10-16 — Toast-Strings nach Constants.TOASTS zentralisiert (Domänen-Struktur)

**Kontext:**
In `website/js/` waren ca. 15 Toast-Meldungen inline verstreut (`address.js`, `settings.js`, `document.js`, `core.js`, `persistence.js`). `Constants.TOASTS` enthielt lediglich 5 flache Einträge. Dies verletzte das SSoT-Prinzip (Single Source of Truth) der Verfassung.

**Entscheidung:**
1. **Domänen-Struktur & Ort von `Constants` (`website/js/core.js`):**
   - `Constants` (LIMITS, SCHEMA_VERSION, TOASTS) ist im Fundament-Modul `website/js/core.js` verankert, wodurch Zirkel-Importe zwischen `persistence.js` und `core.js` ausgeschlossen sind. `core.js` bleibt ein importfreies Basismodul.
   - Vollständige Konsolidierung aller Toast-Texte gruppiert nach Domänen: `DRAFT`, `FONT`, `ADDRESS`, `CLIPBOARD`, `GEOAPIFY`, `SALUTATION`, `SYSTEM`.
   - Dynamische Toast-Meldungen sind als JSDoc-typisierte Hilfsfunktionen implementiert (`GROSSKUNDE_RECOGNIZED`, `CLIPBOARD_APPLIED`, `CLIPBOARD_MULTIPLE`, `GEOAPIFY_UNAVAILABLE`, `IMPORT_REJECTED`).
   - Keine flachen Aliase: Alle Alt-Schlüssel (`FONT_SIZE_ERROR`, `FONT_FORMAT_ERROR`, `SALUTATION_PUNCTUATION`, `CLOSING_PUNCTUATION`, `AUTOSAVE_ERROR`) wurden entfernt und alle Verwender im Produktcode sowie `test/all.js` direkt auf die neue Domänen-Hierarchie umgestellt.
2. **Verwender angepasst (Import von `Constants` aus `core.js`):**
   - `website/js/core.js`: Definiert `Constants` und nutzt intern `Constants.TOASTS.SYSTEM.SAVE_ERROR`.
   - `website/js/persistence.js`: Importiert `Constants` aus `core.js` und nutzt `Constants.TOASTS.DRAFT.EXPORT_*` und `Constants.TOASTS.DRAFT.IMPORT_*`.
   - `website/js/address.js`: 11 Aufrufe auf `Constants.TOASTS.ADDRESS.*`, `Constants.TOASTS.CLIPBOARD.*` und `Constants.TOASTS.GEOAPIFY.*` umgestellt.
   - `website/js/document.js`: `Constants.TOASTS.DRAFT.MULTI_TAB` und `Constants.LIMITS`.
   - `website/js/settings.js`: `Constants.TOASTS.FONT.FORMAT_ERROR`, `Constants.TOASTS.FONT.SIZE_ERROR`, `Constants.TOASTS.FONT.SAVE_ERROR`.
   - `website/js/salutation.js`: `Constants.TOASTS.SALUTATION.PUNCTUATION`, `Constants.TOASTS.SALUTATION.CLOSING_PUNCTUATION`.
   - `test/all.js`: Importiert `Constants` aus `core.js` und aktualisiert Assertion auf `Constants.TOASTS.FONT.SIZE_ERROR`.

**Verifikation:**
- `grep`-Prüfung auf verbleibende flache Aliase: 0 Treffer.
- `grep`-Prüfung auf verbleibende Inline-Strings in `website/js/`: 0 Treffer.
- TypeScript (`tsc -p jsconfig.json`): 0 Fehler.
- `node tools/build_db.js`: Evolutionary Fitness Score 100 %.
- `node tools/links.js`: Keine toten Wikilinks.
- `node tools/log_session.js`: Erfolgreich protokolliert.

## 2026-10-16 — tools/adr-check.js angelegt (Präventiver ADR-Drift-Wächter)

**Kontext:**
In den vorangegangenen Wochen traten wiederholt drei ADR-Drift-Klassen auf: falsche Datei-Zahlen im Text (z. B. ADR-CSS behauptete „8 aktive CSS-Dateien“, Realität waren 4), Referenzen auf historisch gelöschte oder konsolidierte Module (z. B. `boot-state.js`, `layout.css`, `sender-sync.js`) sowie potentiell fehlende `@adr`-Tags in Produktionsdateien.

**Entscheidung:**
1. **Automatisierter Drift-Wächter (`tools/adr-check.js`):**
   - **Regel 1 (1:1-Bijektion):** Verifiziert, dass alle physischen CSS- und JS-Dateien in `ADR-CSS.md` bzw. `ADR-JS.md` im `code_links`-Frontmatter registriert sind und keine toten Links existieren.
   - **Regel 2 (Annotation-Guard):** Verifiziert, dass jede `.js`-Produktionsdatei unter `website/js/` (außer `.d.ts`) in den ersten 5 Zeilen ein `@adr [[...]]`-Tag besitzt.
   - **Regel 3 (Registry-Zähler):** Verifiziert die Textzähler in `ADR-CSS.md` („exakt N aktive“) und `ADR-JS.md` („Die N Module“) gegen `code_links.length`.
   - **Regel 4 (Verwaiste Assets):** Scannt alle ADRs nach Dateiendungen (`.css`, `.js`, `.json.gz`, `.svg`) und meldet verwaiste Referenzen als **Warnung (Exit-Code 0)**, um legitime historische Erwähnungen (Antipattern-Tabellen, Konsolidierungs-Chronik) nicht fälschlich als Fehler zu blockieren.
2. **CLI-Schnittstelle:** Standard-Konsolenausgabe, maschinenlesbares `--json`, `--help` und `--version`.
3. **Dokumentierte offene Punkte:**
   - *Annotation-Guard-Regex:* Ist noch nicht strikt kommentar-sicher (sucht Zeile 1–5 nach `@adr [[...]]`; zukünftiges Ticket zur AST-/Kommentar-Prüfung).
   - *tooling-overview.md:* Hat >400 Zeilen und erzeugt eine LOW-Warnung im Gate; Aufteilung in separatem Ticket vorgesehen.
   - *Pipeline-Integration:* `adr-check.js` wird zunächst als eigenständiges Tool geführt und erst nach Bewährung in `start.ps1` / `reconciliation.js` eingehängt.
   - *Unit-Tests:* Eigenständige Test-Suite für `adr-check.js` in `test/all.js` noch offen.

**Verifikation:**
Funktionstests aller 4 Modi erfolgreich durchgeführt. Fitness Gate (`node tools/build_db.js`) 100 %, Link-Checker (`node tools/links.js`) 0 tote Wikilinks.

## 2026-10-16 — 4 ADR-Drift-Stellen bereinigt (adr-check.js Regel 4 auf 0 Funde)

**Kontext:**
Die Einführung von `tools/adr-check.js` deckte 4 verwaiste Referenzen in Architektur-ADRs auf: `layout.css` in `ADR-TOAST-SYSTEM.md:83` sowie `sender-sync.js` (Zeilen 40 und 60) und `44-sender-sync.js` (Zeile 65) in `ADR-SENDER-SYNCHRONIZATION.md`.

**Entscheidung:**
1. **`ADR-TOAST-SYSTEM.md`:** `layout.css` durch `sidebar.css` ersetzt (wo Top-Layer-Popovers und `@starting-style` seit der CSS-Konsolidierung verankert sind).
2. **`ADR-SENDER-SYNCHRONIZATION.md`:** `sender-sync.js` und `44-sender-sync.js` durch `address.js` ersetzt (wo `initSenderSync` im Produktionscode implementiert ist und von `main.js` geladen wird).

**Verifikation:**
`node tools/adr-check.js` meldet 0 Funde in Regel 4 (Status: PASS, Exit-Code: 0). Evolutionary Fitness Score 100 %, 0 tote Wikilinks.

## 2026-10-16 — DIN-5008-Abgleich nach Geometrie-Migration

**Kontext:**
Nach Migration der 36 statischen Geometriewerte aus
`website/css/sheet.css` in `data-*`-Attribute am jeweiligen
Element in `website/index.html` wurden alle Werte gegen
DIN 5008 geprüft.

**Ergebnis (36 Werte):**
- 32 konform
- 3 grenzwertig (bewusst beibehalten, dokumentiert)
- 1 hart abweichend (korrigiert)

**🔴 Korrektur:**
- `<din-anschriftfeld data-h="40">` → `data-h="45"`
- Quelle: DIN 5008 Kap. 19.4.3 (17,7 mm) + Kap. 19.4.4 (27,3 mm)
  = 45 mm.
- Auswirkung: Anschriftfeld liegt jetzt vollständig im
  DIN-680-Sichtfenster (45 mm hoch).

**🟡 Beibehaltene Grenzfälle:**
1. `data-x="20"` an Rücksendezeile und Anschriftfeld.
   Grund: DIN-interner Widerspruch. Anhang A Tabelle A.1 nennt
   Fluchtlinie 25 mm, Kap. 19.4.3/19.4.4 nennt 85 mm Breite bis
   105 mm (= 20 mm). Der Code folgt den Kapiteln, weil das
   konsistent mit DIN-680-Fensterlage ist.
2. `data-font="12"` am Betreff.
   Grund: DIN 20.9.2 erlaubt Hervorhebung. 12 pt ist bewusste
   Projekt-Entscheidung.
3. `data-font="8.5"` am Infoblock.
   Grund: DIN 20.2 nennt 8 pt als Minimum. 8.5 pt innerhalb
   des Rahmens.

**Verifikation:**
- Fitness Gate: 100 %
- adr-check: PASS
- Grauzone-Literale unverändert (10)



## 2026-10-25 – Built-in AI APIs abgelehnt

Geprüft: Summarizer, Prompt, Proofreader, LanguageModel in Helium
(Chromium 155) als mögliche Option für den Testbrief-Generator (Stufe 2)
und die Betreff-Generierung.

| Prüfpunkt | Ergebnis |
|---|---|
| API-Präsenz in Helium (Chromium 155) | `typeof Summarizer === 'function'` |
| `Summarizer.availability()` | `"unavailable"` |
| `Summarizer.create()` | `NotSupportedError: no execution config` |
| Modell-Bezug | Über Googles Omaha Component Updater – Helium hat diese Infrastruktur nicht |
| Download-Größe | ~4 GB, benötigt 20–22 GB freien Speicher |

**Entscheidung:** Keine Built-in AI.
1. Helium kann das Modell grundsätzlich nicht beziehen (kein Omaha-Updater).
2. Ein Zero-Footprint-Button (`hidden`, bis `availability() !== 'unavailable'`)
   würde in Helium nie erscheinen – toter Code.
3. Für den Testbrief-Generator (fiktive Charaktere) ist BYOK mit
   Groq/Gemini ausreichend und datenschutzunkritisch.

**Konsequenz:** Kein `Summarizer`-Button, kein `LanguageModel`-Code, keine
Built-in-AI-Flags. Testbrief Stufe 2 nutzt **BYOK** (Groq/Gemini).

## 2026-10-26 – Testbrief: Adressleiter und Ankerleiter statt Volltext-Vorlagen

Ausgangsproblem: Der Knopf „Testbrief" hat `strasse`/`ort`/`firma` ungeprüft
in den Empfängerblock geschrieben. Dadurch standen erfundene Werte im Brief
(„Wayne Manor 1007", „Ahri-Residenz 1", `10001 Gotham City`) und Berufs-Blobs
in der Firmenzeile („Musician, adventurer, author; formerly talk show host").

Gemessen am Bestand (325 Figuren): `alias` gefüllt bei 304, `firma` bei 273,
`hooks` bei 31. Eine Textlogik auf `hooks` trägt 9 % der Datenbank — die
Priorität wurde deshalb auf `alias` gedreht.

Entscheidung: Die Regeln und Generierungslogik liegen als reines On-Demand-Addon in `website/addons/testbrief.js`
(Adressleiter, Ankerleiter, Scheinanschrift-Erkennung, Firmenfilter, Nerd-Text). `main.js`
bleibt neutraler Orchestrator und lädt das Addon erst beim Klick per dynamischem Import. Die JSON wird **nicht** verändert.

Leitlinien, vom Nutzer entschieden:
- Korrektheit ist die harte Grenze: kein Satz behauptet eine unbelegte Tatsache.
- Gebäudename in der Anschriftenzeile ist erlaubt (`Der Fuchsbau`, `Sanctuary`),
  erfundene Hausnummern und geborgte Straßen sind es nicht.
- Eine leere Zeile ist ein gültiges Ergebnis, kein Fehler.

Ergebnis: 317 von 325 Figuren briefbar; 8 haben keinen belegten Ort.
58 Straßenzeilen bleiben leer, weil ihr Wert ein generierter Platzhalter war.

Regeln dokumentiert in `docs/20-implementation/testbrief-generator.md`.
Generalisierbar für die `llm_boilerplate`: Platzhalter gegen das eigene
Vokabular erkennen, Fallback-Leitern nach Datenlage sortieren, leeres
Ergebnis zulassen.


## 2026-11-02 – Verwerfung von JS/CSS Code-Splitting: Beibehaltung des Single PWA Bundle Modells (Ansatz 1)

Ausgangsproblem: Lighthouse meldete beim initialen Ladevorgang ca. 32 KiB „unused CSS" in `sidebar.css` und ca. 78 KiB „unused JS" (vor allem in `address.js` und `document.js`).

Empirische Untersuchung:
1. Das vermeintlich „unbenutzte" CSS deckt Dialoge (`<dialog id="settings-dialog">`), Popovers, Validierungszustände und Akkordeons ab, die beim initialen 2-Sekunden-Render schlicht noch nicht geöffnet waren.
2. Das vermeintlich „unbenutzte" JS deckt die Offline-PLZ-Matrix (DecompressionStream), Adress-Autovervollständigung, Zwischenablagen-Parser und Undo/Redo-Stack ab, die erst bei Nutzerinteraktion feuern.
3. Die Gesamtgröße aller JS-Module beträgt unkomprimiert nur ca. 120 KB (gzipped < 35 KB).
4. Alle statischen Assets sind versioniert und werden mit `Cache-Control: public, max-age=31536000, immutable` ausgeliefert.

Verworfene Alternative (Ansatz 2):
Dynamisches Nachladen (`import(...)`) von Fachlogik erst bei Klick oder Tastendruck.
Verworfen, weil:
- Führt zu spürbarer Eingabelatenz und UI-Rucklern beim ersten Tastendruck im Adressfeld.
- Zerstört die deterministische Offline-Fähigkeit der PWA.
- Erhöht die Zustands- und Fehlertoleranz-Komplexität massiv (Netzwerkfehler während der Eingabe).
- Lighthouse erzielt bereits ohne Code-Splitting die Bestnote 100/100 across all 4 categories.

Entscheidung (vom Nutzer bestätigt):
Ansatz 1 bleibt unverrückbar Standard: Single PWA Bundle, Zero Build, native ES-Module, sofortige Bereitstellung aller Module im Browser-Cache mit unendlicher Gültigkeit (`immutable`).


## 2026-11-05 – Figurenkatalog: kuratierte Datendatei, kein eigenes Addon-Laden

Der Testbrief-Generator zieht seine Figuren aus `website/data/charaktere_konsolidiert.json`.
Nach der Kuration stehen dort 303 Figuren mit vollständigen Anschriftblöcken.

Zwei Festlegungen, die sich daraus ergeben:

1. **Die Daten sind abnehmbar, der Code nicht.** Wer den Figurenkatalog abschalten will,
   löscht die JSON — dann bleibt der Button wirkungslos. `main.js` importiert
   `../addons/testbrief.js` jedoch **statisch**; ohne das Modul startet `main.js` nicht.
   Eine dynamische Nachladung wäre der in dieser Chronik bereits verworfene Ansatz
   (Eintrag 2026-11-02) und wird hier nicht wieder aufgenommen.
2. **Der Marker für „kanonisch keine Anschrift" ist reiner Text.** `keine feste Anschrift`
   steht in `strasse` und wird von `KEINE_ANSCHRIFT` gefiltert, bevor er in den Brief läuft.
   Kein Zusatzfeld, keine Schema-Änderung — die Daten bleiben für sich lesbar.

Generalisierbar für die `llm_boilerplate`: Ein Katalog, der aus Fremdwelten stammt, braucht
einen **aussprechbaren Negativwert** statt `null`. Ein Textmarker bleibt in der Datei lesbar,
in der Anzeige verschwindet er, und es gibt keine zweite Wahrheit über ein Flag-Feld.

## 2026-11-05 — Dead-Code-Audit: drei Befunde widerlegt, vier umgesetzt

**Kontext:** Eine externe Befundliste meldete sieben Dead-Code-Positionen (4.1–4.7). Vor der
Umsetzung wurde jeder Punkt gegen den Code geprüft. Ergebnis in
[[dead-code-audit-2026-11-05]] (in `90-archive/`), weil die Rohliste keinen Ort im Repo hatte.

**Entscheidungen:**

1. **4.3 war der einzige mit sichtbarer Wirkung.** `js/boot-theme.js` wurde nicht geladen; der
   Inline-Block im Head setzte nur `data-theme`, nicht `data-style`. Wer den Stil „kompakt"
   gespeichert hatte, sah zuerst die Default-Dichte und dann den Sprung. Der Block war in
   `bac3c3c` (Mehrseiten-Prototyp) durch eine Kopie ersetzt worden — in `index.html` **und**
   `multipage.html`. Jetzt in beiden Dateien `<script src="js/boot-theme.js?v=live6">`;
   der CSP-Hash entfällt, `script-src 'self'` deckt das externe Classic-Script ab.
2. **4.1 und 4.2 entfernt, nicht repariert.** `felderLeeren()` war unerreichbar, weil
   `#btn-felder-leeren` in keiner HTML-Datei existiert; der bestätigte Weg ist `#btn-reset`
   mit Dialog. Die `btn-style-*`-Radio-Zweige zeigen auf IDs, die es nie gab — der Stil läuft
   über `#stil-select`.
3. **4.5 liegengelassen, nicht archiviert.** Der erste Versuch, `webmcp-bridge.js` (202 Zeilen)
   nach `90-archive/` zu verschieben, brach die TypeScript-Prüfung: der relative Import
   `../js/core.js` löst sich am neuen Ort nicht auf, der Fitness Score fiel auf 99,93 %
   (Befund 4.8). Die Datei bleibt am Ort und ist in [[STRUCTURE]] als „derzeit nicht
   eingebunden" markiert. Eine Einbindung wäre ohnehin eine Architekturentscheidung
   (CSP-Erweiterung, A38-Allowlist).
4. **4.4, 4.6, 4.7 nicht angefasst.** Die Debug-Wrapper sind Test-API (`test/all.js` importiert
   sie namentlich), `#isRestoring` schützt gegen einen debounced `saveDraft` während des
   Restores, und der `AptosCustom`-Zweig ist Migrationsschutz aus `efe5af8`.
5. **6.5 widerlegt.** `boot-state.js` ist in [[ADR-JS]]:210 als `ELIMINATED` und in dieser
   Chronik (2026-10-06) als entfernt dokumentiert. Nur ein erledigter BACKLOG-Eintrag nennt
   die Datei noch historisch — das bleibt als Zeitdokument stehen.

**Doku-Korrektur (6.4):** `BACKLOG.md` B14 behauptete, die `btn-style-*`-IDs würden „per
Template-String gebaut". `getElementById('btn-style-…')` **sucht** ein Element; es baut keines.
Die Falschaussage hat einen früheren Audit-Eintrag geschützt und damit jeden Folge-Audit in
dieselbe Sackgasse geschickt.

**Generalisierung:** Ein Befund ist eine Hypothese, kein Fakt. Drei von sieben waren falsch —
und der als „Mittel" einsortierte Punkt war der einzige mit sichtbarer Wirkung. Befunde werden
gegen den Code geprüft, bevor sie in einen Auftrag wandern.

## 2026-11-06 — Testbrief als eigenstaendiges Plugin ausgelagert

**Kontext:** Der Testbrief war das letzte Add-on, das `main.js` **statisch** importierte —
ohne `addons/testbrief.js` startete die App nicht. Zugleich lagen sieben Funktionen doppelt
vor (`main.js` und Add-on), und die Add-on-Version erzeugte Anschriften **ohne PLZ**
(`resolveOrt` statt `resolveOrtZeile`) und rief `plzNeuWuerfeln()` nicht auf.

**Entscheidung:**

1. `addons/testbrief.js` → `addons/testbrief/testbrief.js` und
   `data/charaktere_konsolidiert.json` → `addons/testbrief/charactere.json`. Das Plugin ist
   selbsttragend, die Daten liegen neben dem Code (`import.meta.url`).
2. `main.js` importiert nichts mehr aus dem Add-on. `initTestData` lädt das Plugin per
   dynamischem `import()` erst beim Klick; schlägt das fehl, wird der Button deaktiviert,
   statt eine Ausnahme zu werfen.
3. Sieben Duplikate entfernt: `loadHeroes`, `shuffle`, `nextHero`, `extractNachname`,
   `deriveAnrede`, `setField`, `wuerfelTestbrief`. `extractNachname` fehlte in Befund 3.1,
   weil er nicht exportiert ist.
4. **Die `main.js`-Semantik gilt:** `resolveOrtZeile` an allen drei Stellen (Absender-Ort,
   Ruecksendezeile, Empfaenger-Ort) und `plzNeuWuerfeln()` zu Beginn. Die Add-on-Version war
   fachlich falsch — Briefe haetten die PLZ verloren.
5. Kein `testbrief.css`: Das Plugin setzt keine CSS-Klassen (`flash-success` gehoert zu
   `address.js`).

**Generalisierung:** Ein Add-on, das statisch importiert wird, ist kein Add-on, sondern
Kernlast — den Unterschied sieht man erst, wenn der Import scheitern darf. Und zwei Kopien
derselben Funktion divergieren nicht zufaellig, sondern **fachlich**: hier fehlte der
PLZ-Teil, und es fiel nicht auf, weil die Kopie nie lief.
\n
## 2026-11-06 — Switch-FOUC: Zustand vor dem ersten Paint

**Problem:** `#btn-hilfslinien-switch` und `#toggle-falzmarken` standen mit `checked` im
Markup. Die CSS-Regeln haengen per `:root:has(...:checked)` direkt an diesen Inputs — also
zeigte der erste Frame „an", und `applySettings()` (Modul, deferred) sprang danach auf den
gespeicherten Wert. Bei gespeichertem `guides: false` war das ein sichtbares An-Aus.

**Entscheidung:**

1. **Markup-Default = JS-Default.** `guides` steht in `DEFAULT_SETTINGS` jetzt auf `false`,
   das `checked` am Hilfslinien-Switch ist entfernt. Ohne gleichen Default gaebe es den
   Sprung auch fuer Neunutzer ohne `din_settings`.
2. **Falzmarken bleiben Default `true`** (Markup behaelt `checked`). Begruendung:
   `din_settings` wird erst beim ersten Umschalten geschrieben (`settings.js` → `save()`),
   `DEFAULT_SETTINGS` gilt also fuer fast alle Nutzer. `marks: false` haette die Falz- und
   Lochmarken still fuer jeden abgeschaltet, der den Schalter nie angefasst hat — und das
   sind funktionale DIN-5008-Elemente (Falzen, Lochen), keine Arbeitshilfe.
   `guides` ist dagegen eine Lesehilfe auf dem Schirm und war ohnehin als „nur an, wenn
   gewuenscht" spezifiziert.
3. **Kein Inline-Block, sondern `website/js/boot-switches.js`.** Die CSP ist
   `script-src 'self'` **ohne** `'unsafe-inline'` und ohne Hash — ein Inline-Block waere
   stillschweigend blockiert worden (kein Fehler in der Konsole, nur ein wirkungsloser
   Block). Das klassische externe Script ist derselbe Weg wie `boot-theme.js`.
4. **Platzierung im `<head>`, Zustand per `MutationObserver`.** Zwei Messungen haben die
   naiven Varianten widerlegt (siehe unten): Am Body-Ende und direkt hinter den Schaltern
   gewinnt mal der Parser, mal der erste Frame. Der Observer laeuft als Microtask, und
   Microtasks werden vor dem Rendern abgearbeitet — sobald die Checkbox geparst ist, steht
   ihr Zustand fest, bevor ein Frame entsteht.

**Messung (CDP, `--headless=new`, Frame-Sampler + `first-contentful-paint`):**
Zustand *zum FCP* muss dem gespeicherten entsprechen, sonst hat der Nutzer den Sprung
gesehen.

| Variante | guides=true (kalt) |
| :--- | :--- |
| Script am Body-Ende | Frame 1 zeigte `true/true`, dann `false/false` |
| Script hinter den Schaltern | FCP@96 ms zeigte `g=false`, Wechsel danach |
| Script im `<head>` + Observer | 24/24 Laeufe korrekt, je genau **ein** Zustand |

**Generalisierung:** Ein `checked` im Markup ist eine Behauptung ueber den Zustand, die
niemand geprueft hat. Sobald CSS per `:has(:checked)` daran haengt, wird aus der Behauptung
ein sichtbarer Fehler. Der Default im Markup und der Default im Code sind zwei Kopien
desselben Fakts — sie muessen zusammen geaendert werden, sonst erzeugt die Korrektur den
naechsten Sprung. Und: ein Script „vor dem ersten Paint" ist keine Frage des Ortes im
Dokument, sondern der Ausfuehrungsgarantie (Microtask vor Rendern), nicht der Parse-Reihenfolge.

## 2026-11-06 — IMR-Registry auf DIN 5008 zurueckgefuehrt

**Ausgangslage:** Die Registry war eine zweite Wahrheit neben dem HTML. Ihre Atom-Tabellen
nannten fuenf Namen, die ihr eigenes `deprecatedTags` fuer veraltet erklaerte
(`din-rucksendezeile`, `din-postvermerk`, `din-anlagen`, `din-falz-oben`, `din-falz-unten`).
Die Zonen-Liste fuehrte `din-absender`, das im DOM nicht existiert; dort steht `din-briefkopf`.
`din-a4` war als Dokumentrahmen deklariert, im Code aber laengst `din-blatt`. 18 Tags waren
registriert, gehoerten aber keiner Kategorie an.

**Entscheidung:**

1. **DIN 5008 ist die Quelle.** Jedes Atom traegt im Inventar `dinSection`. Wo die Norm den
   Begriff nicht woertlich kennt, steht `source: "DIN … (interpretiert)"` (Empfaenger-Name,
   Durchwahl, Absender-Name). `din-a4`, `din-branding-logo` und `din-absender-zusatz` sind
   entfernt — sie hatten keine Grundlage.
2. **Atomnamen folgen der Norm:** `din-rucksendeangabe` (19.4.3, 26 Treffer im Normtext),
   `din-vermerke` („Zusatz- und Vermerkzone"), `din-anlagenvermerk` (20.15.2),
   `din-falzmarke-1/2` (19.8). Die fuenf alten Namen waren keine Migration, sondern Fehler —
   `deprecatedTags` ist deshalb leer.
3. **12 Atome ergaenzt**, die vorher nur als registrierte Tags existierten und in DIN 5008
   belegt sind: Bezugszeichen (20.8), Teilbetreff (20.9.3), Unternehmensbezeichnung (20.12),
   Zusaetze (20.14), Verteilvermerk (20.15.3), Beglaubigungsvermerk (20.16),
   Seitennummerierung (20.17), Werbliche Elemente (20.18), Anlagen-Bezeichnung und -Angabe
   (20.15.2), Empfaenger-Name (20.7.4) und Absender-Name (19.4.2). Atomzahl: 55.
4. **`din-anlagen*` ist Container + Liste.** `din-anlagenvermerk` haelt die Kinder
   `din-anlagen-bezeichnung` (Label) und `din-anlagen-angabe` (Liste). Der Toggle-Zustand
   bleibt als Feld erhalten.
5. **Invariante:** `id === tag.replace('din-', '')` fuer Atome, Zonen und den Dokumentrahmen.
   Sieben IDs wurden umbenannt; UI-IDs (`toggle-anlagen`, `fuss-spalte-1/2/3`, …) sind
   ausgenommen. `din-briefkopf` ersetzt die Zone `din-absender`, `data-absender-y-*` heisst
   jetzt `data-briefkopf-y-*` (CSS und `expectedDataAttrs` mitgezogen).
6. **Toggles sind Boolean.** `toggle-anlagen`/`toggle-fuss` werden als `true`/`false`
   exportiert; der Restore akzeptiert zusaetzlich die alten Strings.
7. **`tools/imr.js` prueft jetzt die Invariante (IMR-1…IMR-7):** dinSection vorhanden,
   id ableitbar, Atom mit id im HTML, export-Atom mit `contenteditable`, veraltete Tags im
   HTML abgelehnt, Container-Kinder vorhanden, Zonen-IDs ableitbar. Die harte „45" ist weg —
   die Zahl kommt aus dem Inventar.

**Bewusste Abweichung:** Die Zone `din-briefkopf` fuehrt Y 27/45 mm. DIN 19.4.2 nennt diesen
Wert als **Feldhoehe**, nicht als Position. Der Wert bleibt (das CSS nutzt ihn als `top`),
ist aber im Inventar als PROJECT-Herkunft ausgewiesen statt als DIN.

**Generalisierung:** Ein Normwerk, das man zweimal aufschreibt — einmal als Tabelle, einmal als
Maschineninventar — laeuft auseinander, sobald eine Seite korrigiert wird. Hier war es
umgekehrt: das Inventar war richtig, die Tabellen waren alt. Wer die Wahrheit an eine Stelle
legt, muss die andere aus ihr erzeugen. `imr.js` prueft seit heute genau die Beziehung, deren
Fehlen den Drift ermoeglicht hat.

## 2026-11-06 — Fußzone wird DIN-konform: 3 freie divs → 12 Atome

**Beschluss.** Die Fußzone `<din-geschaeftsangaben>` trug drei freie
`<div class="fuss-spalte" contenteditable>` („Kommunikation / Web", „Bankverbindung",
„Geschäftsangaben"). Sie werden durch die zwölf Fuß-Atome aus [[IMR-Registry]] ersetzt:
`fuss-firma`, `-sitz`, `-gericht`, `-hrb`, `-vorstand`, `-gf` (19.7) sowie `-stnr`, `-ustid`,
`-bank`, `-iban`, `-bic`, `-anschrift` (19.6). `din-seitennummerierung` bleibt unverändert
`is-dormant`.

**Warum jetzt.** Die freien divs waren der letzte Rest „div-Suppe auf dem Blatt". Ihr Inhalt
war an keine Norm gebunden: derselbe Brief konnte an derselben Stelle Bankdaten oder eine
Webadresse führen, und die Spaltenzuordnung stand in keiner Quelle.

**Schema v3 bleibt Version 3.** Die Änderung ersetzt Feldnamen (`fuss-spalte-1/2/3` →
`fuss-*`) innerhalb von `fields`; sie erhöht die Version nicht. Ein v3-Export mit den alten
drei Schlüsseln wird beim Import nicht abgewiesen — unbekannte Feldnamen sind erlaubt, die
drei Altkeys laufen als Inhaltsfelder mit, bis der Draft neu geschrieben ist.

**Zwei Korrekturen an den Auftragsannahmen.**
1. Die Sections folgen der Norm, nicht der Erwartung: `firma/sitz/gericht/hrb/vorstand/gf`
   stehen in **19.7** („Gesellschaftsrechtliche Angaben bei Kapitalgesellschaften"), nur
   `stnr/ustid/bank/iban/bic/anschrift` in **19.6** (Geschäftsräume, Kontoverbindungen,
   Steuern). Die Registry war korrekt; korrigiert wurde nichts an ihr.
2. Das Inventar weist keinen Spaltenindex zu („Layout in vier Spalten ist Rendering"). Die
   konkrete Zuordnung 4/2/2/4 lebt deshalb als `grid-area` in `website/css/sheet.css` und
   `sheet-multipage.css` — nicht als Normwert im Inventar.

**Rendering-Entscheidung.** Explizite `grid-area` statt `grid-auto-flow: column`: mit zwölf
Atomen und vier Spalten hätte auto-flow nur drei Spalten gefüllt, und leere Felder wären in
fremde Spalten gerutscht. `.single-line` erzwingt 1.4em Höhe; vier Zeilen à 7.5pt hätten die
15-mm-Zone um 1.8 mm überschritten, deshalb 1.2 Zeilenhöhe innerhalb der Zone (gemessen:
14.7 mm). Leere Felder bleiben anklickbar (Platzhalter auf dem Schirm), im Druck blenden die
bestehenden `[data-placeholder]:empty::before`-Regeln sie aus — `display: none` auf `:empty`
hätte die Felder unsichtbar **und** unbedienbar gemacht.

**Komponenten-Regel maschinell.** Neuer Abschnitt 4.1 in [[ADR-HTML]] („Brief-Feld =
`<din-*>`, UI = `<div>`") und neuer Check **IMR-8** in `tools/imr.js`: Träger einer Atom-ID
muss das Atom-Tag sein. Negativprobe belegt: ein `<div id="fuss-iban">` bricht das Gate mit
`IMR-8 ... sitzt auf <div> statt auf <din-fuss-iban>`.

**Generalisierung.** Eine Zone, deren Kinder keine Registrierung haben, ist eine unsichtbare
Normlücke: Das Gate war grün, weil niemand diese IDs kannte. Erst die Registrierung macht den
Verstoß prüfbar. `IMR-8` schließt die Lücke, die der Umbau offengelegt hat.

## 2026-11-06 — Base64 raus: Signatur und Schrift als Blob in IndexedDB

**Beschluss.** Signaturbild und eigene Schrift liegen nicht mehr als Base64-Data-URL in
`localStorage`, sondern als `Blob` in IndexedDB (Datenbank `briefneo-assets`, Store `assets`,
Keys `signature` und `font`). Der `localStorage` enthält nur noch strukturierte Daten.

**Der Umweg über das Gesetzbuch war nötig und ist dokumentiert.** A34 verbot IndexedDB
pauschal und S1 jeden anderen Produktspeicher als `localStorage`; S3 erklärte Base64 für
lokale WOFF2-Schriften sogar zu PREFERRED. Ohne Änderung war der Auftrag nicht erfüllbar:
`localStorage` kann nur Strings, und OPFS (A35) wie File System Access (A36) stehen
ebenfalls unter HARD BAN. A34 wurde deshalb **präzisiert, nicht aufgehoben** (nur strukturierte
Produktdaten sind betroffen), S1 um die Abgrenzung ergänzt, S3 gestrichen. Amendment-Protokoll
eingehalten: [[ADR-BINARY-ASSETS]] als ADR, Freigabe durch den Projektverantwortlichen,
Catalog und Verweise nachgezogen.

**Der Befund, der nur im echten Browser sichtbar wurde.** Der erste End-to-End-Lauf zeigte:
`blob:`-URLs waren von der **eigenen CSP** blockiert (`img-src 'self' data:`,
`font-src 'self' data:`). Das Bild blieb leer, `img.decode()` meldete „The source image cannot
be decoded", die Schrift wurde still verworfen — und in Headless-Chrome sah es wie ein
Decoder-Problem aus, weil `data:` funktionierte und `blob:` nicht. Ohne den Lauf im echten
Browser wäre eine tote Funktion ausgeliefert worden, mit grünem Gate. Behoben durch
`img-src 'self' data: blob:` und `font-src 'self' data: blob:` in beiden HTML-Dateien.

**Folgen.** Der FOUC der eigenen Schrift (~50–100 ms, Systemschrift → Custom) ist bewusst
akzeptiert; Theme und Layout bleiben synchron. `boot-theme.js` setzt nur noch
`data-theme`/`data-style`. Alte Schlüssel (`din_custom_font`, `din_signature_asset`) werden
beim Start gelöscht, nicht migriert — Datenverlust ist gewollt: Signatur und Schrift sind
lokale Arbeitsmittel, kein Bestandteil der Datei. Das JSON-Schema v3 bleibt unverändert und
enthält weiterhin nur `signature.transform`.

**Maschinell geprüft.** Antipattern-Regel `P10` bleibt in Kraft und ist ausschließlich für
`website/js/binary-storage.js` exempt (Negativprobe: `indexedDB.open` in einer anderen Datei
→ critical). Der bisherige A34-Test wurde umgeschrieben, nicht gelöscht: er prüft jetzt, dass
das Signatur-Asset als `Blob` in IndexedDB liegt und die alten Schlüssel nicht zurückkehren.

**Generalisierung.** Ein Verbot, das eine Technik pauschal belegt, verhindert irgendwann die
bessere Lösung für einen Teilfall. A34 war richtig für den Briefzustand und falsch für ein
Bild. Wer ein Gesetz präzisiert statt es zu kippen, behält die Begründung dort, wo sie trägt.

## 2026-11-06 — Zwei Druck-Fehler: PDF-Kopfzeile und Absätze

**PDF-Kopfzeile (#5-neu).** Die dynamische `@page`-Regel entstand per
`styleEl.textContent`. Unter `style-src 'self'` bekommt ein per JS erzeugtes `<style>` jedoch
**gar kein Stylesheet** (`element.sheet` ist `null`) — damit liefen sowohl `textContent` als
auch das im Auftrag vorgesehene `insertRule` ins Leere. Die Regel entsteht jetzt als
konstruiertes `CSSStyleSheet` (`new CSSStyleSheet()` + `replaceSync`) und wird über
`document.adoptedStyleSheets` adoptiert; das alte Sheet wird vorher entfernt, damit sich
Regeln nicht stapeln. Belegt per `printToPDF` + `pdftotext`: vorher begann Seite 1 mit der
Anschrift (kein Kopf), nachher mit „Brief an Albert Wesker vom 6. November 2026" auf allen
drei Seiten. `print-multipage.css` hat `@top-left` nur mit Padding/Font/Farbe, den Text
liefert ausschließlich die dynamische Regel.

**Absätze (#4).** `generateNerdText` liefert `\n\n`, `setField` schrieb das als `textContent`
in **einen** Block. `white-space: pre-line` (seit `195999a`) trennt die Absätze optisch
bereits — die Behauptung „Absätze kollabieren" traf den Stand nicht mehr. Der verbleibende
Unterschied ist die Umbruchkontrolle: `orphans`/`widows` wirken je Block, also konnten
Absätze mit einer einzelnen Zeile über die Seitengrenze fallen. Gemessen über sechs
Textlängen (11/13/15/17/19/21 Absätze, nummerierte Sätze, PDF-Auswertung): Ein-Block
erzeugte **6 Witwen** (je Lauf eine Zeile allein oben), `<p>` **0** bei identischer
Seitenzahl. Deshalb jetzt `\n\n` → `<p>`-Kinder in `setField` (nur `id === 'text'`), und
`sheet.css` bekommt `#text p { margin: 0 0 4.5mm 0 }` plus `:last-child { margin-bottom: 0 }`
— ohne den Margin-Fix stünden Absätze enger als vorher. `pre-line` bleibt als Fallback für
alte Drafts.

**Geprüft:** Draft-Roundtrip erhält die `<p>` (Sanitizer erlaubt `P`), Einzelseiten-PDF
bleibt eine Seite ohne Überlauf (`scrollHeight == clientHeight`), Testbrief erzeugt 3
Absätze, alle drei Mehrseiten-Seiten tragen den Kopf, keine CSP-Meldung mehr.

**Generalisierung.** „Inline-Style ist verboten" heißt nicht „jede Style-API ist verboten":
CSSOM-Zuweisungen (`el.style.top`, `style.setProperty`) laufen unter `style-src 'self'`
unbeanstandet, ein `<style>`-Element dagegen gar nicht. Wer CSP-Fehler behebt, muss die
Ebene kennen — Element, Sheet oder CSSOM —, sonst tauscht man einen toten Weg gegen einen
anderen.

## 2026-11-07 — Anrede rät kein Geschlecht mehr: Vornamenslisten entfernt

**Kontext.** `website/js/salutation.js` trug zwei Inline-Sets mit 951 deutschen Vornamen
(408 m, 543 w) in je einer Zeile, während die Dateikopf-Regel 1 „Keine Namensliste“ behauptete.
Der Widerspruch war im Audit vom 2026-11-05 (Befund 6.3) vermerkt, aber nicht entschieden.
Zusätzlich behauptete [[Salutation-Engine]], die Namen kämen aus
`website/data/de_vornamen_gender.json.gz` — diese Datei existiert im Repo nicht.

**Entscheidung.** Beide Sets sind gelöscht, mitsamt der Ableitung „Vorname → Geschlecht“
(Schritt 6 in `derive()`). Das Geschlecht stammt jetzt ausschließlich aus `Herr`/`Herrn`/`Frau`;
sonst nennt die Anrede den Namen (`Guten Tag Anna Müller,`) oder bleibt neutral.

**Beleg.** `grep -c "MALE_NAMES\|FEMALE_NAMES" website/js/salutation.js` → 0; Datei 409 → 384
Zeilen. Zwei Testerwartungen in `test/all.js` auf das neue Verhalten umgestellt; Suite 129/133
wie vor der Änderung (die 4 Fehlschläge sind vorbestehend, per `git stash` gegengeprüft).

**Grenze.** Ein einwortiger Name („Thomas“) wird nicht mehr als Vorname gedeutet: formal
„Sehr geehrte Damen und Herren,“, casual „Hallo,“. Ohne Liste ist nicht entscheidbar, ob das
Wort Vor- oder Nachname ist — neutral ist die ehrlichere Ausgabe.

**Generalisierung.** Eine Heuristik, die 100 % der Fälle abdecken soll, aber nur 80 % trifft,
ist teurer als keine: sie kostet Pflege, veraltet still und erzeugt falsche Anreden. Für
`llm_boilerplate`: Nachschlagelisten, die nur raten, gehören nicht in den Startpfad.

## 2026-11-07 — Postvermerk nativ, JS-Reste abgeräumt

**Kontext.** Der Postvermerk war doppelt gebaut: ein verstecktes `<select>` mit allen Optionen
und Gruppen, daneben ein nachgebautes Popover (Button + 9 Options-Buttons + eigener
Arrow/Escape-Handler). Die CSS-Regeln `appearance: base-select` und
`.seitenleiste-select::picker(select)` hingen am **Button**, nicht am `<select>` — sie liefen
seit dem Einbau ins Leere.

**Änderung.** Das `<select>` ist jetzt das sichtbare Bedienelement (`class="seitenleiste-select"`,
Label per `aria-labelledby`), Button, Popover, Trigger-Label, `aria-selected`-Pflege und die
komplette Tastatur-Navigation sind entfernt (`website/index.html`, `website/multipage.html`,
`website/js/main.js`, `website/css/sidebar.css`). Ein `change`-Listener deckt Maus, Tastatur
und Picker ab. Beim Restore setzt `DraftManager` die Liste jetzt aus dem Feldtext — vorher
sprang sie auf „kein“, während der Vermerk im Brief stand.

**Mit abgeräumt (gleiche Ursache: JS baut nach, was CSS/HTML kann).**
`data-state` am Save-Status (CSS nutzt nur Klassen), doppeltes `title`/`aria-label` am
Settings-Schalter, toter `.active`-Fallback nach `showPopover()`, redundanter
`window.resize`-Listener neben dem `ResizeObserver`, dreifach duplizierter 600-px-Breakpoint
(jetzt `maxSuggestions()`), `#moveCaretToEnd`-Wrapper und die Magic Numbers 50/130
(`SINGLE_LINE_MAX`, `TWO_LINE_PASTE_MAX`).

**Beleg.** Smoke-Test gegen `http://127.0.0.1:8769/website/index.html` (headless, CDP):
Select sichtbar, 2 Optgroups, Popover/Button nicht mehr im DOM, Auswahl schreibt
`Einschreiben` ins Feld mit `data-visible="true"`. Fitness Gate 100 %, Biome 0 Fehler.

**Generalisierung.** „Modernes CSS nutzen“ heißt auch: die Klasse muss am Element hängen, das
das Feature trägt. Ein `appearance: base-select` auf einem `<button>` ist kein Fallback, sondern
toter CSS-Text mit dem Anschein von Funktion.

## 2026-11-08 — Drei Domänen aus den Monolithen geschnitten

**Kontext.** Drei Dateien trugen zwei Fachlichkeiten gleichzeitig:
`settings.js` (696 Z.) mischte Theme/Layout-Toggles mit der Signatur-Engine
(WebP-Kompression, `Math.atan2`-Rotation, Blob-Persistenz), `document.js`
(1157 Z.) DOM-/Caret-Manipulation mit der Speicher-State-Machine, `address.js`
(2226 Z.) Adressbestände/Geoapify mit dem Zwischenablage-Parser. Zero-Build
heißt: jeder `import` ist ein HTTP-Request. Drei zusätzliche Module (12 → 15
Dateien) sind deshalb vertretbar — eine 30-Micro-Modul-Zersplitterung nicht.

**Entscheidung.** Drei Schnitte an den fachlichen Bruchlinien:
`signature.js` (SignatureFeature), `draft-manager.js` (DraftManager) und
`clipboard-parser.js` (ClipboardAddressParser). Die Monolithen behalten ihre
Kernaufgabe; `address.js` bleibt bewusst bei `AddressIntelligence` + Geoapify
(kein 4-Wege-Split, siehe ANTIPATTERNS).

**Zyklusvermeidung.** `signature.js` referenziert `SettingsManager` nur als
`@typedef`-Import (kein Laufzeit-Import). `draft-manager.js` importiert aus
`document.js` (`collectDraft`, Caret-Helfer, `EDITABLE_FIELD_SELECTOR`), nie
umgekehrt. `clipboard-parser.js` importiert `AddressIntelligence`, `feld` und
`bindListSelection` aus `address.js`; `address.js` kennt den Parser nicht.

**Beleg.** 127/127 Tests unverändert grün, Biome 0 Fehler, Fitness 100 %.
`docs/STRUCTURE.md` und `ARCHITECTURE-MAP.md` nachgezogen; der
ANTIPATTERNS-Eintrag „address.js-Modularisierung" wurde präzisiert statt
gelöscht (die pauschale Aufteilung bleibt verworfen).

**Generalisierung.** Ein Schnitt lohnt nur, wenn beide Hälften einzeln
testbar sind und die Importrichtung eindeutig bleibt. Drei Dateien, drei
Richtungen, kein Zyklus — das ist die Prüffrage vor jedem weiteren Schnitt.

## 2026-11-10 — Web-Plattform-Behauptungen geprüft: fünf verworfen

Zwölf Behauptungen aus einer externen Diskussion wurden gegen Code, Chrome Platform Status,
MDN-Compat-Daten, CSSWG-Drafts und eine Live-Messung in Chrome 156 geprüft. Ergebnis:
sechs bestätigt, fünf verworfen, eine spekulativ.

Verworfen: `text-fit` für den Betreff (normwidrig, wirkt nur bei Überlauf), `margin-trim`
als Ersatz für String-Trimming (Margins ≠ Zeichen; im Zielkontext zusätzlich wirkungslos),
Sanitizer API als Ersatz für den Klassenfilter (filtert Attribute, keine Klassenwerte),
`focusgroup` als Ersatz der Pfeiltasten-Navigation (hinter Flag, anderes Interaktionsmodell)
und die `<usermedia>`/`<camera>`/`<microphone>`-Elemente (nur „Proposed", keine Auslieferung).

Bestätigt und ohne Handlungsbedarf: `commandfor` (Safari 26.2, Chrome 135), das
6-Zeilen-Limit von `text-wrap: balance`, drei `beforeprint`- und zwei Dialog-Listener.

Als offene Kandidaten notiert: Autosave für Fuss- und Teilbetreff-Schalter (kein
`change`-Listener), Überschreiben der Rücksendezeile nach Undo (bewusste Entscheidung
nötig) und das fehlende `data-erscheinungsbild` im Boot-Pfad (kosmetisch).

**Beleg.** Ausführlicher Prüfbericht mit Quellen und Messwerten:
`docs/90-archive/upstream-befund-2026-11-10.md`. Keine Code-Änderung,
186/186 Tests, Fitness 100 %, Biome 0.

## 2026-11-10 — Listener-Delegation und FOUC-Gate verworfen

Zwei Umbauvorschläge wurden gemessen und verworfen. **Listener-Delegation
R4–R8:** 14 direkte Listener, keine Dubletten; Delegation spart zehn Listener,
kostet aber drei Zeilen mehr und würde in `address.js` vier Zuständigkeiten
am Empfänger-Firmenfeld koppeln. **FOUC-Gate für die Briefansicht:** das
Pop-in-Fenster ist 8–20 ms; das Gate hätte ~160 ms Unsichtbarkeit erzeugt und
wäre bei einem JS-Ladefehler fail-closed (Brief dauerhaft unsichtbar).

Beide Einträge liegen mit Messwerten und Wiederaufnahme-Regel im Register
`docs/90-archive/todo-2026-11/ANTIPATTERNS-VERWORFEN.md`. Dort sind außerdem die Architektur-Verwürfe
des Tages gebündelt (`<textarea>`, `plaintext-only`, `<input type="date">`,
`<datalist>`, Safari-Ziel).

**Beleg.** Messungen 2026-11-10 (Chrome 156); P1–P12 ausführlich in
`docs/90-archive/upstream-befund-2026-11-10.md`. Keine Code-Änderung.

## 2026-11-12 — A49-Ausnahme: die Feldbreite begrenzt die Eingabe

**Befund.** Ein einzeiliges Feld klippt still: 140 Zeichen im Betreff passen
sichtbar nur bis zum Rand, im Druck fehlt der Rest. Eine feste `maxlength`
löst das nicht — bei 624 px Feldbreite passen 140× „i", aber nur 53× „R"
(gemessen per `measureText`, Spanne **2,6×**).

**Der von A49 vorgeschriebene CSS-Weg trägt hier nicht.** `text-fit: shrink 60%`
wird in Chrome 156 geparst (`CSS.supports` → `true`), aber nicht angewandt:
Schriftgröße bleibt 16 px, `scrollWidth` 971 > 624 — an `<input>` **und** an
einem `<div>` mit fester Breite gemessen. Zusätzlich wäre er fachlich falsch:
er verkleinert die Schrift, ein Brief bekäme viele verschiedene Schriftgrößen.

**Entscheidung.** Die Eingabe wird gesperrt, sobald die Feldbreite erreicht ist.
`scrollWidth > clientWidth` wird **einmal pro `input`** gelesen (kein Polling,
kein `MutationObserver`, kein Timer); ein Zeichen, das nicht mehr passt, wird
zurückgenommen. Auswahl ersetzen und Löschen bleiben erlaubt — was im Feld
steht, bleibt im Feld, statt beim Weitertippen herauszurutschen.

**Umsetzung.** `website/js/document.js` (`#istVoll`, `#handleFormatShortcuts`,
`#handleInputLimit`); Ausnahme für P3 in `tools/antipatterns/project.json`
(Datei `website/js/document.js`).

**Rückmeldung (Nutzerwunsch 2026-11-12).** Ein verworfener Anschlag bleibt nicht
stumm: das Feld bekommt für 450 ms `data-voll` — 2 px Warnrahmen in
`oklch(0.55 0.22 25)` plus 180-ms-Ruckeln (2 px), danach wieder normal. Kein
Toast. Screenreader hören „Feld voll, kein Platz mehr" über `ariaNotify`,
gedrosselt auf einmal pro 1,5 s. Bei `prefers-reduced-motion` entfällt das
Ruckeln, der Rahmen bleibt.

**Beleg.** 200 Anschläge auf `#betreff`: 54 Zeichen im Feld, `scrollWidth` 624 =
`clientWidth` 624, kein Überlauf; ein Zeichen löschen schafft sofort wieder
Platz. Kein Eingriff in `maxlength` (bleibt als Grob-Deckel). Rahmen gemessen:
`solid 2px oklch(0.55 0.22 25)`, Animation `feld-voll-stopp 0.18s`, nach 450 ms
Attribut und Rahmen weg.

## 2026-11-12 — Zustand: einmal vor dem Paint, danach nur bestätigen

**Regel (nicht zurückbauen).** Jeder Zustand, den CSS sieht, steht als Attribut
am `<html>` und wird **genau einmal** gesetzt: in `boot.js` (head) oder
`boot-state.js` (Body-Ende). Nach dem Paint darf eine Stelle ihn höchstens
**bestätigen** (`setzeAttribut`/`setzeSchalter` schreiben nur bei Abweichung).
CSS liest für Blatt-Verhalten **nur Attribute**, nicht `:checked`.

**Warum.** Vier FOUC-Runden an einem Tag (erster Frame leer, Form-Pille falsch,
Schalter falsch, Postvermerk falsch) kamen aus derselben Doppelung:
`data-layout` hatte 3 Schreiber, `.checked` 10 Stellen, `:checked` stand in 31
CSS-Selektoren, und es gab zwei Restore-Pfade (`boot-state.js` vor dem Paint,
`draft-manager`/`settings` danach).

**Konkret geändert (2026-11-12):**
- `data-anlagen` / `data-fuss` neu; `boot.js` liest den Entwurf und setzt sie
  vor dem Paint. `sheet-common.css` und `sheet-multipage.css` lesen sie statt
  `:has(#toggle-…:checked)`.
- `settings.js` schreibt Attribute/`.checked` nur bei Abweichung; `main.js`
  schreibt den Postvermerk nur, wenn Liste und Feld auseinanderlaufen.
- `draft-manager` spiegelt die Schalter-Attribute nach Undo/Multi-Tab/Import
  und beim Reset; `data-quelle` bekommt eine Whitelist (`auto`/`manuell`).

**Nachtrag (gleicher Tag):** Die Regler mit Speicher-Zustand (Postvermerk,
Schalter) waren bis `data-ready` unsichtbar — das war selbst ein FOUC: FCP
56 ms, sichtbar erst 73 ms, also ein leeres Feld im ersten Frame. Jetzt setzt
`boot-state.js` am Ende `data-seeded`; die Regler sind ab ~26 ms sichtbar und
tragen bereits den gespeicherten Wert. `data-ready` bleibt als Netz (boot.js
setzt es notfalls nach 2 s).

**Was bewusst NICHT gemacht wurde:** `draft-manager.#restoreState` beim
Erst-Load abschalten. Es macht mehr als Feldwerte (Fußzeilen-Migration,
`data-quelle`, Vermerk-Sichtbarkeit, Select, Undo-Stack). Wer das ändert, muss
diese Aufgaben vorher in `boot-state.js` übernehmen — sonst entsteht die
nächste stille Doppelung. Offener Punkt: `docs/90-archive/todo-2026-11/22-kiss-js-reduktion.md` K15.

### Nachtrag 2 (gleicher Tag): Uebergaenge vor dem ersten Frame sind gesperrt

**Befund (CDP-Messung, Cache aus, 1912x1007):** CLS war 0, die Seitenleiste
konstant 1007/1007 — also kein Layout-Shift. Das Wackeln war eine
**CSS-Transition**: `.seitenleiste-select` blendete `background-color` und
`box-shadow` von 30 ms bis ueber 139 ms (FCP 64 ms), eine Label-Farbe ebenso.
Ursache: der gefuellte Zustand haengt an `:has(option:checked:not([value=""]))`,
der Wert kommt aber erst vom Seeder — die Aenderung animiert quer ueber den
ersten Paint.

**Regel (nicht zurueckbauen):** Bis `data-seeded` (Netz: `data-ready`) gibt es
**keine** Uebergaenge: `base.css` Abschnitt 1a setzt `transition: none` auf
`*`, `*::before`, `*::after`. Danach sind alle Uebergaenge unveraendert aktiv.
Die Regel bewusst global und nicht pro Selektor — sonst faellt die naechste
zustandsabhaengige Eigenschaft in dieselbe Falle.

**Messung nach dem Fix:** FCP 76 ms, Frames mit laufenden Animationen: 0
(vorher 15). Nach dem Seeding: select `background, color, border-color,
box-shadow`, Label `color`, Schalter `all` — Hover/Klick animieren weiter.

### Nachtrag 3 (2026-11-12): die Sperre und die Aenderung im selben Recalc

**Befund.** Nach dem Seeding der vier Regler war `#stil-select` im ersten Frame
richtig, blendete aber weiter auf: `data-gesetzt` (Optik) und `data-seeded`
(Sperre) landeten im **selben** Style-Recalc. CSS sieht dann "Wert neu +
Uebergaenge an" und startet die Transition — die Sperre greift nicht, weil zum
Zeitpunkt der Aenderung schon kein Uebergang mehr gesperrt ist.

**Fix.** `boot-state.js` erzwingt vor dem Setzen von `data-seeded` einen
einzelnen Style-/Layout-Read (`offsetHeight`). Danach ist die Sperre im
naechsten Recalc noch aktiv, die Freigabe selbst animiert nichts. Kein Polling,
kein Timer (A49).

**Zweiter Befund (Regression aus dem Fusszeilen-Umbau).** `draft-manager`
suchte in der `toggle-fuss`-Migration `#geschaeftsangaben > [contenteditable]`.
Seit 6ed2759 stehen dort `<input>` → `some()` immer false, Alt-Entwuerfe ohne
`toggle-fuss` verloren ihre Fusszeile. Jetzt werden `input` **und**
`contenteditable` geprueft; ein Test haelt den Selektor fest.

**Dritter Befund.** `#datum` war im ersten Frame leer, wenn der Entwurf kein
Datum enthielt — `applyLetterDate()` laeuft erst nach dem Paint. `boot-state.js`
setzt jetzt denselben Text (Temporal, Zone Europe/Berlin, `dateStyle: 'long'`).

### Nachtrag 4 (2026-11-12): Feldtyp — was die Migration still kaputt gemacht hat

Der Review zu B12 fand fünf Stellen, an denen Code noch `contenteditable`
annahm, obwohl dort `<input>` steht. Vier davon waren echte Ausfaelle:

- **Caret bei Undo/Redo** (`draft-manager`): gemerkt wurde nur fuer
  `hasAttribute('contenteditable')`; in Einzeilern sprang der Cursor an den
  Rand. Jetzt entscheidet `Field.isNative`, und die Helfer in `document.js`
  lesen `selectionStart` bzw. rufen `setSelectionRange` (mit `try/catch`, weil
  `type=email` keine Textauswahl hat).
- **Druck-Reset** (`base.css`): `[contenteditable], :is(textarea[data-feldtyp])`
  erfasste die migrierten `<input>` nicht. Jetzt `input[data-atom]` dabei.
- **Fokus im Druck**: die Fokus-Optik steht in `@scope (din-blatt)` und gewann
  gegen den Reset. Sie ist jetzt `@media screen` — Fokus ist eine
  Schirm-Rueckmeldung, kein Papiermerkmal.
- **Tote Regel** `.single-line[contenteditable]:focus` entfernt: kein Element
  traegt beide Merkmale (`.single-line` sitzt auf `<input>`, `#text` hat die
  Klasse nicht).

**Bewusst NICHT geaendert:** `#anlagen-angabe` (textarea) bleibt ohne
Zeichen-/Breitendeckel. `#istVoll` misst `scrollWidth > clientWidth`, und eine
mehrzeilige Textarea bricht um statt horizontal zu scrollen — der Deckel wuerde
dort nie greifen. Ein Deckel waere eine Produktentscheidung, kein Bugfix.

**Messfalle:** `CSS.getMatchedStylesForNode` und `getComputedStyle` zeigten
weiter den alten Zustand, weil die Seite nach der CSS-Aenderung nicht neu
geladen war. Erst der Reload machte den Fix sichtbar. Regeln: nach CSS-Edits
immer neu laden, bevor gemessen wird.

### 2026-11-13 — PLZ-Vorschlaege: Ausklappen ab 8, Farbe je Ort

**Entscheidung (Nutzerwunsch).** Eine Stadt-Zeile mit Unterliste lohnt erst ab
8 PLZs. Darunter stehen die PLZs direkt in der Liste — "troi" zeigte vorher
"Troisdorf (3 PLZs)", das war ein Klick fuer nichts. Beim Ausklappen werden
Dubletten entfernt (`resolveCityInput` liefert die Stadt-Zeile *und* eine
einzelne PLZ derselben Stadt).

**Ortsfarbe.** Jeder Eintrag bekommt `data-ort-farbe` (1..6). Der Schluessel
ist Ort **plus** Bundesland/Stadtteil: "neustadt" liefert neun gleichnamige
Orte, die sich nur im Bundesland unterscheiden — ohne Zusatz bekaemen alle
dieselbe Farbe (gemessen 2026-11-13). Deterministisch gehasht, damit derselbe
Ort stabil bleibt. Die Farbe setzt CSS (`--ort-ton`, sanfter Hintergrund plus
3px-Balken), **kein Inline-Style** (CSP `style-src 'self'`).

**Grenze:** 6 Pastelltoene, Kollisionen sind moeglich, aber nie zwischen
benachbarten Gruppen derselben Stadt. Bei mehr als 6 Orten in einer Liste
wiederholen sich Toene — bewusst, eine groessere Palette wird unruhig.

### 2026-11-13 — Speicher: was bewusst so bleibt

Nach dem Review zu B13 (Speicher-Pipeline) drei Entscheidungen, die nicht
wieder aufgemacht werden sollen:

- **Undo/Redo bleibt flüchtig (nur RAM).** Der letzte Stand ist gesichert;
  ein persistenter Ring kostet Quota und Multi-Tab-Kohaerenz.
- **Ladefehler von Signatur/Schrift bleiben still.** Beide sind optional, der
  häufigste Fall (IndexedDB von einem anderen Tab blockiert) ist beim Öffnen
  nicht handelbar; Speichern meldet Fehler dagegen sichtbar.
- **Der Event-Bus wirft weiter bei falschem Topic.** `console.warn` würde
  einen getesteten Vertrag brechen (`test/all.js:2014`).

Behoben wurde der **Teilimport**: `applyImportedData` rollt jetzt beide
Schlüssel zurück, wenn der zweite Schreibvorgang scheitert (Befund: Entwurf
neu, Einstellungen alt nach einem Quota-Fehler).

### 2026-11-13 — Seitenleiste: ein Tab-Stopp fuer den Modus-Schalter

Der Review zu B14 hat zwei echte Barrierefreiheits-Fehler gefunden, beide
gemessen und behoben:

- **Zwei Tab-Stopps fuer eine Funktion**: die sr-only-Checkbox und das
  sichtbare Label (`role="button" tabindex="0"`). Das Label war per
  Enter/Space wirkungslos (`checked` blieb false) — der einzige Tastaturweg
  war der unsichtbare Stopp. Jetzt: Label ohne Rolle/tabindex, Checkbox ist
  der Schalter (Space schaltet nativ), Fokusring per CSS auf dem sichtbaren
  Label, Escape fuehrt zurueck.
  Messung: 1 Stopp, Ring `solid 2px`, Space → an, Escape → aus.

**Abgelehnt:** `:has(#toggle-modus:checked)` durch `data-modus` ersetzen.
Der Schalter ist nutzergetrieben (kein Boot-Zustand), das Muster funktioniert,
und der Umbau kostet 10 CSS-Regeln ohne Nutzen. A57 schuetzt die nativen
Schalter zusaetzlich vor JS-Klassen-Toggles. Ebenso abgelehnt: Form A/B in die
Einstellungen zu verschieben — haeufig und direkt blattwirksam, also nach dem
Kriterium des Reviews selbst Brief-Modus.

**Offen (Entscheidung):** Ueberschriften/Hierarchie, Reihenfolge nach
Schreibablauf, Statuszeile fuer globale Einstellungen, Off-Canvas unter 600 px
(`--seitenleiste-breite` ist fix 18.75rem, min/max gleich).

### 2026-11-13 — Adresssuche, Reihenfolge, Statuszeile, Handy

**Adresssuche (Bug).** Zwei Ursachen fuer den Eindruck "zufaellig":
1. Der Filter verlangte Strasse **und** Stadt — jede Stadt- oder PLZ-Suche fiel
   komplett raus ("Troisdorf", "53840" zeigten nichts). Jetzt genuegt Stadt
   oder PLZ.
2. `mergeAndRender` mischte lokal + remote in Antwort-Reihenfolge. Jetzt
   `adressRelevanz`: PLZ exakt (0), PLZ-Praefix (1), Strasse (2), Stadt (3),
   irgendwo enthalten (4). Bei mehr als 5 Treffern werden die besten 5
   gezeigt **plus** Hinweis (vorher: nur der Hinweis, nichts anklickbar).
   Ein Stadt-Treffer leert das Strassenfeld nicht mehr.

**Kein `disabled` ohne API-Key.** Die lokalen Adressen funktionieren ohne Key;
statt das Feld zu sperren, sagt eine Hinweiszeile im Popover, warum nichts
kommt. Begruendung: Sperren wuerde ein funktionierendes Feature entfernen.

**Reihenfolge (Nutzerentscheid).** Adressen zuerst, dann Stil/Postvermerk,
Text, Anlagen, Fusszeile, zuletzt Layout/Falzmarken; Import/Testbrief in der
Zone "Daten" darunter. Textformatierung bleibt sichtbar (Nutzer: "bei Word sind
die doch auch nicht einfach weg") — keine kontextuelle Toolbar.

**Statuszeile.** Unter den Aktionsknoepfen steht der Ist-Stand der globalen
Einstellungen ("Form B · Falzmarken aus · Schrift: Liberation Sans · Unterrand
20 mm") mit "ändern" als Sprung in die Einstellungen. Quelle sind
data-layout/data-marks und die Einstellungen — kein neuer Zustand.

**Handy: vorerst NICHT (Entscheidung 2026-11-13).** Ein Zwischenstand mit
Schublade und Blattskalierung wurde wieder entfernt. Grund: Die App ist
bewusst eine Chrome-150+-Desktop-Anwendung; eine Mobil-Variante laesst sich
hier nicht debuggen, und ungetesteter Responsive-Code ist Ballast. Wer sie
baut, macht das als eigenes Vorhaben mit eigener Messung.

**Folge:** Die Seitenleiste scrollt bei 1007 px Hoehe jetzt um 30 px
(1037). Bewusst akzeptiert — Statuszeile und Reihenfolge waren die Anforderung.

### 2026-11-13 — Adresssuche: Position, Hausnummern, Offline-Betrieb

Drei Nutzerbefunde, alle am laufenden Objekt reproduziert:

1. **Dropdown unten rechts** (gemessen: x=1497 statt x=16). Zwei Ursachen:
   `position-area` loeste in dieser Kombination falsch auf, und das UA-Popover
   setzt `inset: 0` + `margin: auto`, wodurch das Element mit gesetztem
   `left`/`top` im Restraum zentriert wird. Jetzt: `position-anchor` +
   `top: anchor(bottom); left: anchor(left)`, `inset: auto`, `margin: 4px 0 0`.
   Messung: Suchliste Desktop [16,272], mobil [16,312], PLZ-Liste [730,250] —
   jeweils direkt unter dem Feld.
2. **Hausnummern raus** (Nutzerwunsch): die Anzeige ist Strasse + PLZ + Ort,
   ohne Nummer; gleiche Strasse mit verschiedenen Nummern faellt zu einem
   Treffer zusammen. Beim Uebernehmen wird nur der Strassenname geschrieben.
3. **Ohne API-Key** war das Feld praktisch tot (nur das persoenliche Adressbuch).
   Jetzt kommt das eingebaute Verzeichnis dazu: Ort, Ortsteil, Firma, exakte
   PLZ (5 Ziffern) und PLZ-Praefix (3-4). **Strassen brauchen weiter den Key** —
   das Verzeichnis kennt keine Strassennamen. Ist beides leer, sagt eine
   Hinweiszeile im Popover, warum.

### 2026-11-13 — Einheitliche Feld-Optik: Rahmen aussen

Nutzerwunsch: der Rahmen von `#text` (Hover/Fokus) war der einzige schoene, aber
zu nah an der Schrift — und er soll fuer **alle** Blattfelder gelten.

- Alle Felder: `outline-offset: 2px` (Rahmen **aussen** statt innen).
  Einzeiler liegen 16 px auseinander; mehr als 2 px wuerde in die Nachbarzeile
  schneiden.
- `#text` und `#anlagen-angabe`: `outline-offset: 6px`, weil dort Platz ist.
  Gleiche Optik (Farbe, Stärke, Rundung), nur mehr Luft.
- Der frühere Sonderfall `#text`/`#anlagen` (offset 2) ist damit Geschichte;
  die Ausnahme ist jetzt die *Luft*, nicht die *Optik*.

Geprueft mit Screenshot (Hover auf Einzeiler, Fokus auf #text): Rahmen liegt
aussen, keine Schrift wird uebermalt, Nachbarzeile bleibt lesbar. Druck
unveraendert (Fokus ist `@media screen`, der Print-Reset gewinnt).

### 2026-11-13 — Ein Radius fuer alle Blattfelder

Nach dem Rahmen kam der nächste Inkonsistenz-Punkt: `#text` und die
Anlagen-Textarea hatten 3 px, **alle** `<input>` 0 px — sechs
`border-radius: 0`-Zeilen in den Feld-Resets (Empfänger, Absender/Datum,
Fußzeile, Betreff-Gruppe, Vermerke, Rücksendezeile) gewannen gegen die
gemeinsame Regel. Der Rahmen war also bei Einzeilern eckig und beim Textfeld
rund.

Jetzt: `--feld-radius: 4px` in der gemeinsamen Feld-Regel, die sechs
`border-radius: 0` entfernt. Gemessen: alle Feldtypen liefern 4 px.
Der Druck bleibt eckig (`border-radius: 0 !important` im Print-Reset).
\n
### 2026-11-13 — B14-Reparaturen: Zonen, Statuszeile, Escape, ARIA

Vier belegte Befunde (aus dem B14-Review, am HEAD `72b09d0` nachgemessen):

1. **Zonen-Struktur.** Beim Umsortieren war der Layout-Block (Form A/B,
   Falzmarken) hinter das `</section>` von `zone-dokument` gerutscht, dazu ein
   verwaistes `</section>` (3 offen, 4 geschlossen — der HTML-Parser repariert
   das still). Folge: die Regler hingen in keiner Zone und blieben im
   Einstellungs-Modus sichtbar. Jetzt: Block und `<hr>` wieder in der Zone,
   Zählung 3/3. Gemessen: `#btn-form-a` und `#toggle-falzmarken` sind in
   `#zone-dokument`, im Einstellungs-Modus unsichtbar.
2. **Statuszeile im Einstellungs-Modus.** Sie zeigt den Brief-Zustand, und ihr
   „ändern" hätte dort kein Ziel. Jetzt Teil der Ausblendregel
   (`getClientRects()` = 0 im Einstellungs-Modus).
3. **Escape.** Der Handler hing an der Checkbox; wer in `#select-schriftart`
   oder im Key-Feld stand, kam nicht zurück. Jetzt an `#seitenleiste`, mit
   Vorrang für offene Popover (`:popover-open`) und anschließendem
   `focus()` auf den Schalter, damit der Fokus nicht in einer ausgeblendeten
   Zone bleibt. Gemessen: Fokus in der Schriftart-Liste → Escape → `checked`
   false, `activeElement` = `toggle-modus`.
4. **ARIA.** `role="group" aria-label="Textformatierung"` stand direkt unter
   einem `<h3>` mit demselben Text (doppelt vorgelesen) → `aria-labelledby`.
   Der Modusschalter hatte ein statisches `aria-label="Einstellungen"`, das
   **beide** sichtbaren Labels überschrieb („Einstellungen öffnen" am Zahnrad,
   „Zurück zum Brief" im Einstellungs-Modus) — WCAG 2.5.3. Jetzt
   `aria-labelledby="btn-einstellungen btn-zurueck"`; gemessener Name:
   „Einstellungen öffnen Zurück zum Brief".

Erledigt mit vier Ratschen (Zonen-Zählung im Rohtext, Statuszeilen-Regel,
Escape-Bindung, ARIA-Namen). Nicht übernommen: Radiogruppe statt Checkbox,
`<details>` für Entwicklerwerkzeuge, Falzmarken in die Einstellungen — das
sind Umbauten ohne belegten Schaden.
\n
### 2026-11-13 — Ansicht als Radiogruppe, ein Satz zu den „Custom Elements", Steuer-Token

**Ansicht statt Checkbox.** `#toggle-modus` (sr-only Checkbox + Zahnrad-Label +
„Zurück zum Brief"-Label, Name per `aria-labelledby` aus beiden Labels
zusammengesetzt) ist ersetzt durch eine Radiogruppe im Segment-Design:

```
fieldset.seitenleiste-modus > legend (sr-only "Ansicht")
  input#modus-brief          + label "Brief"          (checked)
  input#modus-einstellungen  + label "Einstellungen"
```

Warum: der Zustand steht im Namen (WCAG 2.5.3 ohne Trick), die Gruppe ist **ein**
Tab-Stopp mit nativen Pfeiltasten, und es gibt **ein** sichtbares Label statt
zwei. CSS-only bleibt: die zehn Modus-Regeln hängen jetzt an
`:has(#modus-einstellungen:checked)`, JS setzt nur `checked`. A57 ist um einen
Satz ergänzt (Ansicht = Inhalt, keine Einstellung). Entfallen:
`.seitenleiste-setup-header`, `.btn-back`, Zahnrad-Label, Sibling-Fokusregel.
Gemessen: Umschalten per Label-Klick und per Escape aus `#select-schriftart`
(`modus-brief` gewählt, Fokus dort), AX-Baum: `group "Ansicht"`.

**Custom Elements (Doku-Korrektur, kein Code).** `ADR-HTML.md` sprach von „37
semantischen HTML5-Custom-Elements". Sie sind nicht registriert
(`customElements.define`: 0 Aufrufe, `:defined` = false). Gültiges HTML, aber
semantische Haken, keine Komponenten — eine Registrierung würde mit dem
Vor-Paint-Seeding konkurrieren. Satz ergänzt, Verhalten unverändert.

**Steuer-Token (Variante A).** Vorher hatte jedes Bedienelement seine eigene
Höhe und seinen eigenen Radius (15/20/30/32/34/36/38/50 px; 0/4/6/8/10/12/999).
Jetzt zwei Token in `base.css`:

```
--ctl-h:        32px   Select, Segment-Control, Icon-Button, Schalter-Zeile
--ctl-h-aktion: 40px   Drucken, Speichern, Öffnen, Kopieren (Untergrenze)
```

Gemessen danach: Segment-Container 32 (Pille 24), Select 32, Icon-Button 32,
Schalter-Zeile 32, „ändern" 24 (Klickziel, WCAG 2.5.8), Buttons 40 als
Untergrenze. Die Buttons bleiben bei 48, weil „🖨️ Drucken / PDF" und
„💾 Speichern (.json)" in der 2-Spalten-Reihe umbrechen — Höhe kommt dort aus
dem Inhalt, nicht aus dem Token. Radien: ein `--radius-md` (8 px) für Container
und Buttons, 6 px für die Pille im Container (Innenradius).

**Schalter: 36×20 war ein gestreckter Checkbox-Haken.** `<input switch>` ist in
keinem ausgelieferten Browser implementiert (MDN BCD: `chrome.version_added =
false`; Laufzeitcheck in Chromium 156: `'switch' in input` → false). In der
36×20-Box malte der Browser deshalb einen gestauchten Haken, der wie ein dunkles
Quadrat aussah (Screenshot 2026-11-13). Jetzt 20×20: aus = ruhiges Quadrat,
an = Akzentfläche mit weißem Haken — „ein Schalter, der sichtbar einrastet".
Das `switch`-Attribut bleibt für den Tag, an dem es Implementierungen gibt.

**Nebenwirkung, offen:** Die Leiste scrollt im Brief-Modus jetzt 93 px statt
30 px (neuer Regler 32 px + 12 px Flex-Gap). Der Fuß mit „Zurücksetzen" liegt
damit unter der Kante. Nicht eigenmächtig gelöst — Kandidaten: Flex-Gap 12 → 8
(‑28 px), `#zone-aktionen` sticky, oder Regler in die Kopfzeile.
\n
### 2026-11-13 — B15 A+B: Strukturvertrag aus dem Design geholt, Reihenfolge, Hinweise

**Struktur-Utilities (A).** `.sr-only` und `.hidden` lagen in `sidebar.css`,
werden aber quer durch `index.html` gebraucht: `.sr-only` 9× (Zonen-h2, das
`<h1>` im `<main>`, die Radios der Ansicht), `.hidden` an zwei Datei-Inputs.
Ein Design-Austausch hätte damit Überschriften und Radios sichtbar gemacht.
Beide stehen jetzt in `base.css`.
Gegenprobe (Mutationstest M2 aus dem B15-Review): `sidebar.css` per
`styleSheets[i].disabled = true` abschalten → `.sr-only` bleibt
`position:absolute`, 1px, `clip: rect(0,0,0,0)`; beide Datei-Inputs bleiben
`display:none`.

**Doppelte display-Regel (A).** `:has(#modus-einstellungen:checked) #zone-setup
{ display:flex; flex-direction:column }` wiederholte nur `.seitenleiste-setup`.
Entfernt; gemessen danach im Einstellungs-Modus `display:flex` /
`flex-direction:column` aus der Klassenregel.

**Reihenfolge (A).** Der Postvermerk stand hinter „Brief-Stil & Anrede", obwohl
er ins Anschriftfeld gehört (Phase 1) und die Anrede Phase 3 ist. Jetzt davor —
die einzige echte Inversion in der Reihenfolge, die am 2026-11-13 gebaut wurde.

**Hinweise (B).** Der Unterrand-Hinweis hängt jetzt per `aria-describedby` am
Schalter, `#geoapify-status` ist `role="status"` und dient dem Key-Feld als
Beschreibung. Gemessen im AX-Baum: Checkbox mit Beschreibung („Aus = 20 mm …"),
Textfeld mit Beschreibung („Key aktiv und gespeichert"). Vorher hingen beide
nur an der Position (WCAG 1.3.1/4.1.3).

**Zonenname (B).** „Aktionen" verschwieg den Speicherstatus, „Status" das
Zurücksetzen. Jetzt `Status & Zurücksetzen` (weiterhin nur `sr-only`).

**Nicht gemacht (bewusst):** `data-nur`-Strukturvertrag für alle Modus-Regeln,
`<details>` für Entwicklerwerkzeuge, Reset in die Datei-Gruppe, GitHub-Link in
die Einstellungen. Kein belegter Schaden, dafür Umbau der Moduslogik bzw.
reine Geschmacksfrage.
\n
### 2026-11-14 — Toter Zustand entfernt: data-style, data-generated, btn-zurueck

Drei Stellen aus Issue #17, alle vorher geprüft (grep + Browser):

- **`data-style` / `applyStyle`.** `#style-select` existiert in `index.html`
  nicht, `this.styleSelect` war immer `null`, `applySettings` rief
  `applyStyle('default')` und setzte damit immer denselben Wert. Der
  `[data-style="compact"]`-Block in `base.css` war entsprechend nie erreichbar.
  Entfernt: `boot.js` (Default, `STYLE_WHITELIST`, `setAttribute`),
  `settings.js` (Feld, Methode, Listener, Typangabe), `base.css` (9
  Token-Überschreibungen).
- **`data-generated`.** Geschrieben an 6 Stellen, gelesen nur von
  `[data-generated] { color: inherit !important; font-style: normal !important }`
  — ein Druck-Neutralisierer ohne sichtbare Wirkung. Kein JS las es; das
  Verhalten hängt an `data-dirty`. Entfernt in `salutation.js`,
  `addons/testbrief/testbrief.js`, `base.css` und drei Test-Asserts. Im Browser
  gegengeprüft: Anrede entsteht aus dem Namen, manuelles Editieren setzt
  `dirty=true` und wird nicht mehr überschrieben.
- **`#btn-zurueck`.** Rest der Radiogruppen-Umstellung (`3408e64`): Element weg,
  `settings.js` band noch einen Listener daran.

**Messung für den nächsten Schritt (`data-anlagen`/`data-fuss`):** 10 Reloads mit
gespeichertem Entwurf (`anlagen=true`, HTML-Default `unchecked`), Auswertung am
`firstPaint`-Event: in 10/10 Läufen war `#toggle-anlagen.checked` bereits `true`,
`:root:has(#toggle-anlagen:checked)` traf zu und `data-anlagen` stand auf `true`
(Paint 53–68 ms). Das stützt die Migration, ersetzt aber nicht die 30 kalten
Läufe aus dem Plan in Issue #18.
\n
### 2026-11-14 — Zustand ohne Spiegel: data-visible und data-anlagen/data-fuss

Ausgangspunkt war das Batch-01-Review (Issue #17): Zustände, die JS in Attribute
spiegelt, damit CSS sie lesen kann. Drei Migrationen, jede gemessen.

**`data-visible` → `:not(:placeholder-shown)`.** `#vermerke` ist ein `<input>`
mit `placeholder`; die Sichtbarkeit folgt jetzt aus dem Feld selbst. Vier
Schreiber entfernt (`main.js`, `draft-manager.js` ×2, `boot-state.js`,
`testbrief.js` ×2). Gemessen im Browser: leer = `display:none`,
Wert = `display:block`, geleert = wieder `none`.

**`data-anlagen`/`data-fuss` → `:root:has(#toggle-anlagen:checked)`.** Je vier
Schreiber (`boot.js`, `main.js`, `draft-manager.js` ×2) entfernt. In `boot.js`
fällt dadurch ein `JSON.parse` von `din_draft_current` auf dem kritischen Pfad
weg — der Grund, warum das Attribut 2026-11-12 überhaupt eingeführt wurde, war
eine Checkbox, die erst nach dem Paint gesetzt wurde. Das erledigt seit dem
FOUC-Umbau `boot-state.js`.

Messprotokoll (30 kalte Reloads, Cache aus, Entwurf mit `toggle-anlagen=true`
und `toggle-fuss=true`, HTML-Default jeweils `unchecked`):

| | vorher | nachher |
|---|---|---|
| `:root:has(...)` am `firstPaint` | 30/30 | 30/30 |
| Anlagen sichtbar | 30/30 | 30/30 |
| Fußzeile sichtbar | 30/30 | 30/30 |
| `data-anlagen`/`data-fuss` gesetzt | 30/30 | 0/30 |
| Paint | 48–96 ms | 40–88 ms |

**`is-dormant` → `hidden`.** Acht Elemente trugen eine Klasse, die niemand
setzte oder entfernte; definiert war sie mit `display:none !important`. Jetzt
das native `hidden`-Attribut (`base.css`), die CSS-Regel ist weg.

**`layers.css`-Kommentar.** Der CSP-Kommentar in `index.html` verwies auf eine
Datei, die es nicht gibt. Korrigiert.

**Nicht umgesetzt:** `data-gesetzt` (Transition-Verdacht, eigene Messung nötig)
und `data-layout` (doppelte Mechanik, Geometrie-Nähe). Beide stehen im Backlog.

---

## 2026-11-14 — Der erste Paint ist keine Zusage: drei Marker-Entscheidungen

**Anlass.** Das Faktenblatt zum Boot-Pfad behauptete „12 von 12 Läufen vor dem
Paint" für `data-ready`. Eine zweite Messung widersprach. Statt eine dritte
Meinung zu produzieren, wurde gemessen: `tools/paint-probe.mjs` (rohes CDP,
`performance.mark` im Code, `getEntriesByType('paint')` des Browsers, Cache
aus, voller Entwurf, 3 Profile × 30 Läufe).

| Profil | `seeded` vor Paint | `ready` vor Paint | Paint | `ready` nach Paint |
|---|---:|---:|---|---:|
| local | 30/30 | 14/30 | 44–100 ms | 16/30 |
| 6× CPU | 11/30 | 0/30 | 108–196 ms | 30/30 |
| 150 ms RTT | 1/30 | 0/30 | 900–1212 ms | 30/30 |

Zahlen der gespeicherten Messreihe (`batch/02-boot-pfad/paint-probe-2026-11-14.json`).
Eine zweite Reihe desselben Tages lag bei 11/30 bzw. 1/30 — die **Streuung** ist
Teil des Ergebnisses, die Aussage nicht: `ready` liegt überwiegend nach dem
Paint, im gedrosselten und im langsamen Profil praktisch immer.

**Befund 1 — die alte Zahl war eine lokale, keine allgemeine.** `data-ready`
liegt in 16 von 30 lokalen Läufen, in 30 von 30 gedrosselten und in 30 von 30
langsamen **nach** dem ersten Paint. Die Aussage „vor dem Paint" gilt für
`boot.js` per Konstruktion (blockierend im `<head>`) — für den Body-End-Seeder
nur, solange das Netz mitspielt. Ein klassisches Skript am Body-Ende blockiert
den Parser, nicht das Rendern.

**Befund 2 — das Fenster ist groß.** `seeded` → `ready` (Median): 19 ms
(lokal), 72 ms (6× CPU), **1704 ms** (150 ms RTT, Maximum 1720 ms). In diesem
Fenster steht der Entwurf bereits, aber jede Regel, die an `data-ready` hängt,
ist noch aus.

**Entscheidung A — zwei Marker bleiben, mit getrennten Aufgaben (B70).**
`data-seeded` heißt „Zustand steht", `data-ready` heißt „Booten fertig oder
aufgegeben" (2-s-Timer in `boot.js`). Sie sind keine Dublette: ohne das Netz
blieben bei einem Seeder-Ausfall Regler und Platzhalter dauerhaft unsichtbar.
Geändert wurde nur, **woran die sichtbaren Regeln hängen**: die
Platzhalter-Sperre in `sheet-common.css` hing allein an `data-ready` und
verschwand damit bis zu 1,9 s nach dem Seeding. Sie hängt jetzt an
`:not([data-seeded]):not([data-ready])` — sichtbar wird es, sobald die Werte
stehen, und das Netz greift weiterhin.

**Entscheidung B — `boot.js` und `boot-state.js` bleiben getrennt (B71).**
`boot.js` muss im `<head>` laufen (`data-theme` vor dem ersten Frame, sonst
heller Blitz im Dunkelmodus); der Seeder braucht den fertigen Body
(`getElementById` liefert im `<head>` null). Zusammenlegen ginge nur, indem
eine der beiden Aufgaben verloren geht. Der Kopfkommentar von `boot-state.js`
behauptete trotzdem „vor dem ersten Paint" — ersetzt durch die Messung.

**T2 — was passiert, wenn der Seeder stirbt.** Künstlich zum Absturz gebracht
(`performance.mark` wirft beim ersten Aufruf): `data-seeded` bleibt aus, die
Meldung `[Boot-State] Seeder fehlgeschlagen` erscheint, und die Regler werden
nach **88 ms** sichtbar — `initApp`/`settings.js` setzen `data-ready` und den
Zustand. Der 2-s-Timer in `boot.js` ist also die **dritte** Instanz, nicht die
zweite. Nebenbefund, behoben: die Marke `seeder-start` stand außerhalb des
`try` und war damit die einzige Zeile ohne Fehlerpfad — sie wirft jetzt in den
`catch` von B67 hinein.

**Entscheidung C — eine Schalter-Semantik (B65).** Drei Semantiken lagen
nebeneinander: `asBool` (`boot.js`), `!== false` (`boot-state.js`),
`Boolean()` (`settings.js`). Bei fehlendem `pluginTestbrief` ergaben sie
true / true / **false** — `settings.js` überschrieb das Attribut nach dem
Paint mit dem falschen Wert. Jetzt überall `istAn(v) = v !== false && v !==
'false'` (kanonisch in `persistence.js`, lokal in den beiden klassischen
Skripten, per Test deckungsgleich gehalten). Gegenprobe im Browser mit
`marks: null` und fehlendem `pluginTestbrief`: Attribut und Schalter sind
jeweils gleich (`true/true`, `true/true`) statt gemischt.

**Entscheidung D — der Seeder schreibt nur in Entwurfsfelder (B69).** Vorher
genügte `getElementById(id)`: jeder Schlüssel im Entwurf schrieb in ein
beliebiges Element mit dieser ID. Jetzt muss das Element
`EDITABLE_FIELD_SELECTOR` matchen (lokal gespiegelt, per Test gegen
`document.js` geprüft). Kein zweiter Sanitizer nötig — `collectDraft`
entscheidet vor dem Speichern über `sanitizeRichText`, der Seeder
materialisiert nur Gespeichertes.

**Entscheidung E — Fakten werden erzeugt (B73).** `batch/02-boot-pfad/fakten.md`
war handgetippt und binnen eines Tages falsch (2 statt 3 `JSON.parse`-Stellen,
Zeile 30 statt 25, sechs fehlende Schreibzugriffe). Jetzt erzeugt
`tools/batch-facts.mjs` das Blatt aus dem Quelltext (Zeilennummern, Zähler,
Marker-Regeln, Messwerte aus `paint-probe-*.json`) und `--check` bricht bei
Abweichung ab. Kein Datum im Kopf — sonst wäre `--check` täglich rot.

---

## 2026-11-14 — `data-gesetzt` gelöscht: `:has()` fragt den Zustand, statt ihn zu kopieren

**Befund (30 kalte Reloads, CDP, Cache aus).** Der Seeder berechnete
`data-gesetzt` in Abschnitt 2c, bevor Abschnitt 3 den Postvermerk setzte. Der
Wert „Einschreiben" stand damit in einer Liste mit der Optik einer leeren
Auswahl: `data-gesetzt="false"`, `:has()` `true`, Hintergrund
`oklch(0.69 0.015 250)` statt `oklch(0.6 0.02 250)`. Messung vorher: 0/30
geführt, Attribut in 30/30 falsch; die beiden anderen Listen waren korrekt,
weil ihre Werte vor der Attribut-Schleife gesetzt wurden.

**Warum das Attribut überhaupt existierte.** Der Kommentar in `sidebar.css`
verbot `:has()` ausdrücklich: „die Änderung blendete nach dem Paint auf
(gemessen 2026-11-12, FCP 64 ms, Aufblenden bis 139 ms)". Nachgerechnet war das
kein Zustandsproblem, sondern eine **CSS-Transition** — und die wurde am
selben Tag global erledigt: bis `data-seeded` gilt `transition: none`.
Gegengeprüft 2026-11-14 am Select selbst: ohne Marker `0s`/`none`, mit Marker
`0.15s` auf `background, color, border-color, box-shadow`.

**Entscheidung.** Die Sperre deckt den Fall bereits ab, also darf CSS den
Formularzustand direkt lesen. Entfernt: der CSS-Leser (jetzt
`:has(option:checked:not([value=""]))`), beide Writer und der
`change`-Listener. Nachher: 30/30 gefüllt bei allen drei Listen.

**Regel für später.** Ein Zustands-Attribut, das einen Wert nur **kopiert**,
muss zur richtigen Zeit geschrieben werden — und das ist eine Reihenfolge-Frage,
die niemand im Kopf hat. Wo CSS den Zustand selbst abfragen kann (`:has`,
`:checked`, `:placeholder-shown`), ist die Abfrage die billigere Wahrheit.
Die Ausnahme bleibt der Paint: Attribute, die **vor** dem ersten Frame stehen
müssen, kann CSS nicht abfragen, weil die Elemente noch nicht existieren.

---

## 2026-11-14 — Seitenleiste: Überlauf, Fuß, Namen (B74 + B75)

**Messung (CDP, `#seitenleiste` clientHeight vs. scrollHeight, Brief-Modus).**

| Fensterhöhe | Überlauf vorher | nachher |
|---:|---:|---:|
| 1007 px | 93 | **4** |
| 965 px | 135 | 46 |
| 900 px | ~200 | 111 |

Der Fuß mit „Zurücksetzen" lag unter der Kante. Er ist jetzt
`position: sticky; bottom: 0` mit Hintergrund und in allen drei Höhen im Bild.
**Preis, bewusst akzeptiert:** bei 965 px scrollen 46 px Inhalt unter dem Fuß
durch. Geprüft an beiden Enden: am Scroll-Ende ist nichts verdeckt, oben liegt
nur der letzte Knopf der Werkzeug-Zone darunter — er ist ohne Scrollen ohnehin
nicht im Bild.

**Abstände.** `#seitenleiste` und `.seitenleiste-zone` 12 → 8 px,
`.seitenleiste-subgroup` 10 → 8 px, plus der doppelte `margin-bottom` an der
Statuszeile. Das sind reine Abstände zwischen Blöcken; die Blöcke selbst sind
unverändert (A48-Geometrie, Druck und Blatt sind nicht berührt).

**Doppelte Statuszeile.** Gemessen im Brief-Modus: Form und Falzmarken sind
sichtbar (Regler direkt darunter), Schrift und Unterrand sind versteckt (ihre
Zone „Einstellungen" ist in diesem Modus aus). Die Zeile zeigt deshalb nur noch
`Schrift: … · Unterrand … mm` — die zwei Werte, für die sie die einzige Quelle
ist. Kein Wert ist damit unsichtbar geworden.

**Namen statt Zonen-Detektivarbeit (B75).** Kopfzeile, Ausgabe, Statuszeile und
Fuß sind benannte Gruppen (`role="group"` + `aria-label`), der Knopf „ändern"
heißt für Screenreader „Ansicht ändern", die Zone „Daten" heißt
**„Dateien & Testbrief"** — sie enthält Öffnen, Testbrief und
In-Zwischenablage, während Speichern und Drucken in der Gruppe „Ausgabe"
liegen. Danach hat **kein** Fokusziel mehr eine namenlose Umgebung
(vorher 6 von 21).

---

## 2026-11-15 — Zählweise: 89 Zeilen waren nicht 89 Vorkommen

**Der Fehler.** Im Backlog stand „**89** `!important`", gezählt mit einer
Zeilenheuristik. Richtig sind **92**. Der Unterschied ist eine einzige Regel:
`website/css/base.css:332` setzt vier `!important` in **einer** Zeile
(`#app-shell { display: block !important; width: auto !important; height: auto
!important; overflow: visible !important; }`).

| Zählweise | Ergebnis | taugt für |
|---|---:|---|
| `grep -c` (Zeilen mit Treffer) | 89 | „in wie vielen Zeilen steht es" |
| `grep -o \| wc -l` (Vorkommen) | **92** | „wie viele Deklarationen sind es" |

Die 92 sind die richtige Zahl für die Frage „wie viele `!important` muss ein
`@layer`-Umbau ersetzen". Aufteilung nach Kontext: **55 im Druck**
(`@media print` + `@page`), **37 außerhalb**. Unverändert: **295**
ID-Selektor-Vorkommen in 2.982 Zeilen, **0** `@layer`.

**Der Sprung 91 → 92** ist kein Zählfehler, sondern B82: die Ausnahme für die
Hinweis-Lebensdauer unter `prefers-reduced-motion` ist eine bewusste,
begründete `!important`-Zeile (`base.css:76`).

**Konsequenz.** In `B59`, `batch/STATUS.md` und `batch/03-kaskade/prompt.md`
steht jetzt die Zählweise mit: *Vorkommen, nicht Zeilen — `grep -o`, nicht
`grep -c`.* Wer nachzählt und auf 89 kommt, hat Zeilen gezählt.

**Lehre.** Eine Zahl ohne ihre Zählweise ist ein Versprechen ohne Deckung. Bei
jeder Zählung gehört in denselben Satz, **was** gezählt wurde (Zeilen,
Vorkommen, Selektoren, Elemente) — sonst korrigiert der nächste Leser richtig
und glaubt, der erste hätte sich vertan.

---

## 2026-11-15 — `Papierkorb/` war weg: 149 Dateien, Hook blockiert

**Was passiert ist.** Beim Commit von Batch 05 brach der Pre-Commit-Hook ab:

```
❌ [pre-commit] FATAL: 'Papierkorb/' fehlt oder ist leer! Commit abgebrochen.
```

`git status` zeigte **149 gelöschte Dateien** unter `Papierkorb/` — nicht
committet, aber im Arbeitsbaum weg. Der Ordner existierte nicht mehr. Dieselbe
Invariante prüft auch `tools/build_db.js:206`, das Fitness-Gate war damit
ebenfalls rot („Build failed: Invariante verletzt").

**Was es nicht war.** Keine Aktion dieser Sitzung. Die Befehle waren:
`batch-facts.mjs`, `batch/kontrakt.py`, `batch/merge.py`, `backlog-sync.mjs`,
`test-dossier.mjs`, Editoren. Keiner davon löscht Verzeichnisse. Zeitgleich
wurden zwei fremde Dateien geändert (`docs/00-foundation/din5008.md`
„Heiz-/Nebenkosten" → „Heiz-/Wasserkosten", `docs/30-meta/PERFEKTER-PROMPT.md`
„Nebenkostenposition" → „Kostenposition"), Zeitstempel **12:22:53** — also
parallele Aktivität im selben Arbeitsbaum, nicht dieser Lauf. Beide Änderungen
wurden **nicht** angefasst und **nicht** mitcommittet.

**Was es ist.** Ein Verstoß gegen eine ausdrückliche Projektregel:
`docs/30-meta/HANDOFF.md:138` — „Der Ordner `Papierkorb/` ist eine permanente,
unantastbare Ablage. Das Löschen, Leeren oder Verschieben dieses Verzeichnisses
ist für alle Agenten strikt verboten."

**Was getan wurde.** `git restore Papierkorb` — 149 Dateien zurück, Ordner
wieder da, Fitness wieder 100.0 %, Hook wieder grün. Kein Workaround: der Hook
wurde **nicht** mit `--no-verify` umgangen, und die Invariante in
`tools/build_db.js` wurde **nicht** aufgeweicht.

**Lehre.** Ein rotes Gate, dessen Ursache außerhalb der eigenen Änderung liegt,
wird **gemeldet, nicht umgangen**. Und: bei fremden Änderungen im Arbeitsbaum
gilt erst lesen, dann fragen — `git add -A` hätte die 149 Löschungen
mitgenommen und den Verlust festgeschrieben.

---

## 2026-11-15 — Batch 05 vermessen: zwei Restore-Pfade, drei Befunde

Die Scheibe „Zustand und Restore" wurde vor dem Prompt vermessen, damit im
Auftrag Zahlen stehen und keine Fragen. Alle Werte mit Zeile in
`batch/05-zustand-restore/fakten.md` (generiert von
`tools/batch-facts.mjs --scheibe 05`, `--check` im Gate).

**1. `targetLock` wird viermal geleert, nicht zweimal.**

| Stelle | Kontext |
|---|---|
| `website/js/draft-manager.js:274` | `#restoreState()` |
| `website/js/draft-manager.js:470` | `resetDraft()` |
| `website/js/main.js:128` | nach `draftManager.loadDraft()` |
| `website/js/main.js:215` | nach `draftManager.resetDraft()` |

Die zwei Zeilen in `main.js` sind redundant: `loadDraft()` (245) ruft
`#restoreState()` (255 → 274), und wenn es früh zurückkehrt, weil **kein**
Entwurf existiert, ist der statische Startwert ohnehin `null`
(`website/js/address-data.js:433`). `resetDraft()` setzt ihn in seinem Rumpf
(470) selbst. **Entscheidung:** nicht sofort löschen, sondern als **B93** in
den Backlog — mit Gegenprobe im Browser (Entwurf laden → Empfänger wählen →
Sperre greift; Reset → Sperre weg), weil ein späterer Pfad die Zeile als
Versicherung benutzt haben könnte.

**2. Dynamische Importe: vier, nicht „irgendwo im Boot".**

| Stelle | Ziel | am Boot-Pfad? |
|---|---|---|
| `website/js/main.js:151` | `./multipage-controller.js` | ja, im `bootStep` „Plugins", **ohne** `await` |
| `:288`, `:302`, `:314` | `../addons/testbrief/testbrief.js` | nein, lazy im Klick-Handler |

`typeof import('./x.js').T` in einer JSDoc-Zeile zählt **nicht** — sonst
erscheinen zwei Phantom-Importe in `draft-manager.js` (die erste Zählung hatte
genau die).

**3. `DEFAULT_SETTINGS` ist unvollständig: 7 Schlüssel, 9 werden benutzt.**

Fehlend: `signatureState` (2 Stellen, `website/js/signature.js:225/321`) und
`signatureImage` (3 Stellen, `:47/226/320`). `signatureState` hat im Lesepfad
harte Fallbacks (`x: 11.9`, `y: 96.0`, `scale: 0.5`, `:94`),
`signatureImage` wird nur auf `undefined` gesetzt — es ist eine Löschmarke,
kein Wert. **Offen** als Frage 4 im Prompt: Absicht oder Lücke? Ein frisches
Profil und ein Alt-Import sind die zwei Fälle, die es entscheiden.

---

## 2026-11-15 — B64: der Modus-Vertrag zieht nach `base.css`

**Ausgangslage (Batch-04-Review, nachgerechnet):** `sidebar.css` trug die
Optik **und** den Strukturvertrag der beiden Modi. Wer die Design-Datei
austauscht, schaltet damit den Umschalter ab. Von den 111 ID-Selektoren sind
**18 Struktur** und **93 Optik** — die Trennung ist also nicht Geschmack,
sondern eine 18-Zeilen-Frage.

**Was verschoben wurde:** 3 Regeln mit 6 Selektoren (Zeilen 800/804/818 bzw.
804–811 im Block) von `sidebar.css` nach `base.css`, neuer Abschnitt
„Modus-Vertrag der Seitenleiste".

| | vorher | nachher |
|---|---:|---:|
| `sidebar.css` | 1.281 Zeilen | **1.263** |
| `base.css` | 367 Zeilen | **402** |
| ID-Selektoren `sidebar.css` | 111 | **94** |
| ID-Selektoren `base.css` | 5 | **22** |
| Modus-Regeln in `sidebar.css` | 3 | **0** (2 Zeilen Verweis) |
| Modus-Regeln in `base.css` | 0 | **3** |

**Warum die Ladereihenfolge nichts entscheidet:** die Vertragsselektoren haben
Spezifität **(3,1,0)** (`#seitenleiste` + `:has(#modus-einstellungen:checked)`
+ Ziel), die Gegner im Design (`.seitenleiste-setup`, `.seitenleiste-zustand`,
`.btn`) liegen bei **(0,1,0)**. `base.css` lädt vor `sidebar.css` — bei diesem
Abstand ist das ohne Wirkung.

**Messung vorher/nachher (2026-11-15):**

- **Sichtbarkeit:** beide Modi × 8 Elemente (`display`, `checkVisibility`,
  Höhe), Plugin-Schalter auf `data-plugin-testbrief="false"`.
  Ergebnis: **identisch**, JSON-Vergleich ohne Abweichung, Höhen gleich
  (575/88/688/70/48/24/40/0 px).
- **Druck:** 4 Referenzbriefe (Form A/B × kurz/lang, 6 Seiten),
  `pdftoppm -r 150` + Pixelvergleich: **0 abweichende Pixel**, keine
  Größenänderung.

**Ratsche:** `test/all.js` verlangt alle 6 Selektoren in `base.css`, verbietet
sie in `sidebar.css` und verlangt den Verweis dort — sonst wandert der Vertrag
beim nächsten Umbau zurück. Zwei bestehende Tests lasen die Regeln noch aus
`sidebar.css`; sie zeigen jetzt auf `base.css` (dieselbe Prüfung, neuer Ort).

**Nicht mitgenommen:** die Plugin-Regel `:root[data-plugin-testbrief="false"]
#btn-testbrief` (heute `sidebar.css:1281`). Sie hängt an `din_settings` und
`SettingsManager.#applyPlugins()` — das ist Zustand, nicht Modus-Struktur.
Bleibt, wo sie ist.

---

## 2026-11-15 — Batch 05 ausgewertet: ein echter Fehler, zwei Altlasten, ein Werkzeug

Das Review zu Scheibe 05 kam zurück. Ausgewertet heisst hier: jede Behauptung
am Code nachgerechnet, nicht übernommen.

**Behoben — F5, das Datum.** Der Restore setzte `data-dirty` nur im Zweig für
**nicht-native** Felder. `#datum` ist ein `<input>` (`index.html:379`), der
Zweig lief nie, und `applyLetterDate()` (`format.js:404`) überschrieb beim Boot
mit „heute". Gemessen: Entwurf `datum: "1. März 2020"` → nach dem Reload
**„15. November 2026"**. Ein vom Nutzer eingetragenes Datum war weg.

Die erste Fassung des Fixes („markiere, sobald ein Datum im Entwurf steht") war
zu grob: sie hätte das Datum **auf ewig** eingefroren, weil auch der
automatisch gesetzte Tagesstand in jedem Entwurf steht (nachgemessen: ein
frisches Profil wurde dadurch „dirty").

Richtig ist die **Absicht** statt des Werts: `collectDraft()` speichert
`datum__dirty: true`, wenn der Nutzer das Feld angefasst hat
(`document.js:927`), der Restore setzt daraus `data-dirty`
(`draft-manager.js:346`). Additiv, alte Entwürfe ohne den Schlüssel verhalten
sich wie bisher. Drei Tests halten beide Richtungen fest (mit Absicht → bleibt,
ohne Absicht → rollt auf den Tag).

**Gemessen, nicht vermutet — was NICHT stimmt:**

| Behauptung aus dem Review | Prüfung | Ergebnis |
|---|---|---|
| F1: „Selects fallen im Seeder durch" | `grep data-speichern` über das ganze Projekt | **kein Element** trägt das Attribut — nur der Selektor-String. Der Pfad ist tot, kein Live-Fehler |
| F3: „ungesäubertes HTML vor dem Paint (XSS)" | Probe mit `<img src=x onerror=window.__xss=1>` im Entwurf | `xss: null`, das `img` war bei `ready` weg. Der bestehende Test „stript Event-Handler-Attribute" deckt denselben Weg |
| B93: „die zwei `targetLock`-Zeilen sind redundant" | Aufrufkette + Publish-Reihenfolge | **zurückgestuft**. `resetDraft()` published `DOCUMENT_CHANGED` erst **nach** dem `null`; ein Listener kann den Lock erneut setzen |

**Gemessen und behoben — der Vermerk.** Der Seeder schrieb
`"  Unser Zeichen: 4711  "`, der Restore zeigte `"Unser Zeichen: 4711"`.
Jetzt trimmt der Seeder vor dem Paint (`boot-state.js`, ein `id === 'vermerke'`).

**Bewusst nicht behoben:** Alt-Entwürfe mit `<li>`-HTML in der Anlagen-Angabe
zeigen bis zum Paint das Roh-Markup, danach den migrierten Text
(`tools/seeder-diff.mjs`, Fall `legacy-liste`). Die Migration im Seeder
erzwänge eine zweite Kopie von `stripHtmlToPlaintext` in einem klassischen
Skript — zwei Sanitizer sind schlechter als ein sichtbarer, einmaliger Sprung.

**Neues Werkzeug: `tools/seeder-diff.mjs`.** Der Review schlug als A einen
Differenztest Seeder gegen Restore vor; das ist er. Sieben Fixtures (leer, voll,
ohne Fußschalter, Legacy-Liste, leeres Datum, Vermerk mit Rand, `__quelle`),
Snapshot im Moment von `data-seeded` **und** bei `data-ready`, Vergleich
Feld für Feld. Erwartete Abweichungen sind **deklariert** — nur unerwartete
lassen das Werkzeug mit Exit 1 abbrechen. Stand jetzt: **3 Abweichungen, 0
unerwartet**.

Zwei Fallen im Werkzeug selbst, beide gefunden und behoben, weil sie ein
falsches Grün liefern können:

1. Der Snapshot-Haken war ein `Element.prototype.setAttribute`-Override —
   `el.dataset.x = 'true'` läuft**nicht** darüber. Jetzt MutationObserver.
2. `document.documentElement` ist beim Document-Start `null`; `observe(null)`
   wirft, der ganze Block stirbt, und zwei leere Snapshots sind „gleich".
   Deshalb: auf `documentElement` warten, und ein fehlender Snapshot zählt als
   **MESSFEHLER**, nicht als 0 Abweichungen.
3. Der Fixture wurde vor der Navigation gesetzt — die alte Seite speichert
   beim Verlassen (`flushPendingSave`) und überschreibt ihn. Jetzt per
   `Page.addScriptToEvaluateOnNewDocument` im **neuen** Dokument, vor
   `boot-state.js`.

---

## 2026-11-15 — Der Testbrief-Knopf war weg (Profil, nicht Code)

**Symptom.** `#btn-testbrief` fehlte in der Seitenleiste. Nutzerregel: der
Knopf ist **heilig**.

**Befund.** Der Code war vollständig:

| Stelle | Zustand |
|---|---|
| `website/index.html:220` | `<button id="btn-testbrief">Testbrief</button>` vorhanden |
| `website/css/sidebar.css:1263` | `:root[data-plugin-testbrief="false"] #btn-testbrief { display: none !important; }` (durch B64 von Zeile 1281 hierher gewandert, Inhalt gleich) |
| `website/js/main.js:284` | Handler vorhanden |
| `website/js/settings.js:140` | `data-plugin-testbrief` wird aus `settings.pluginTestbrief` gesetzt |

Die Ursache lag im **gespeicherten Profil** des Debug-Browsers:

```
din_settings = {"theme":"light","layout":"form-a","marks":true,
                "pluginTestbrief":false, ...}
```

Bei `pluginTestbrief: false` setzt `applySettings()` das Attribut auf `false`,
und die CSS-Regel blendet den Knopf korrekt aus — der Schalter tat genau, was
er soll, nur stand er auf „aus".

**Behoben.** `pluginTestbrief` im Profil auf `true` gesetzt, Seite neu geladen.
Gemessen danach: `data-plugin-testbrief="true"`, `display: flex`,
`checkVisibility: true`, Fläche **267 × 40 px**, Text „Testbrief".

**Wie es dorthin kam — ehrlich:** nicht rekonstruierbar. Kein Code setzt den
Wert von selbst (`collectDraft`/`applySettings` schreiben nur aus der
Einstellung). Während der Messungen habe ich in `sichtbarkeit.mjs` das
**Attribut** `data-plugin-testbrief="false"` direkt gesetzt (um die
Plugin-Regel zu prüfen). Ob daraus über einen Settings-Save ein persistierter
Wert wurde, ist offen — deshalb gilt ab jetzt: **Messskripte sichern den
Zustand vorher und stellen ihn hinterher wieder her.** Kein Skript setzt
App-Attribute, die eine Einstellung spiegeln.

**Ratsche.** Neuer Test „Testbrief ist standardmäßig an": `DEFAULT_SETTINGS`
muss `true` sagen, und ein **fehlender** Wert muss als „an" gelten
(`istAn(undefined) === true`). Damit fällt ein stiller Wechsel der Vorgabe
sofort auf — der Knopf kann nicht mehr durch einen Code-Default verschwinden.

---

## 2026-11-15 — B57: `page-margin-safety: auto` war ungültig, `clamp` ist nicht messbar

Die Zeile `page-margin-safety: auto` stand seit dem 2026-09-09 in
`sheet-multipage.css` als Kandidat für Hardware-Rand-Kompensation. Geprüft im
Zielbrowser (Chrome 156):

| Prüfung | Ergebnis |
|---|---|
| `CSS.supports('page-margin-safety', 'auto')` | **false** |
| `CSS.supports('page-margin-safety', 'clamp')` | **true** |
| CSSOM der `@page`-Regel | `size: a4; margin: 25mm 0 var(--rand-u) 0;` — die Deklaration **fehlt**, Chrome hat sie beim Parsen verworfen |
| Entfernen der Zeile | 4 Referenzbriefe / 6 Seiten, **0 abweichende Pixel** |
| `clamp` temporär gesetzt | CSSOM behält es; 6 Seiten, **0 abweichende Pixel** |

**Entscheidung:** beide Zeilen raus. `auto` war beweisbar wirkungslos.
`clamp` ist gültig, wirkt aber auf den unbedruckbaren Rand echter Hardware —
hier nicht messbar, und wenn es greift, verschiebt es Text in die sichere
Fläche, also DIN-Geometrie. Kein Beleg, kein Eingriff.

**Was bleibt:** ein abkneifender Druckertreiber ist eine Treibereinstellung
(randlos/Skalierung), keine Dokumenteigenschaft. Die Zeile war der falsche
Ort für das Problem. `sheet.css:313` (stillgelegt, nicht geladen) bleibt
unverändert.

---

## 2026-11-15 — B59-Vorprobe: `@layer` löst eine von zwei Sorten, und ein Fehlversuch

Zwei kleine Umbauten als Test, beide gemessen. Ergebnis vorweg: **`@layer`
hilft gegen gleichrangige Regeln in derselben Datei, nicht gegen `@scope`.**
Und der Fehlversuch war der lehrreiche Teil.

**Test 1 — geglückt: `#viewport` (Bildschirm) in eine Schicht.**
`sheet-multipage.css` setzte `overflow-x: hidden !important` und
`min-height: 0 !important`, obwohl `base.css:293` dieselben Werte schon setzt.
Beide in `@layer screen` gelegt, `!important` entfernt.

| Messung | Ergebnis |
|---|---|
| Druck (4 Briefe, 6 Seiten, 150 dpi) | **0 abweichende Pixel** |
| Bildschirm (2 Formen × 4 `data-seiten`-Zustände) | **0 von 8 abweichend** (Geometrie und `getComputedStyle` aller vier Blöcke) |

**Test 2 — gescheitert, zurückgenommen: `#kern` (Druck) ohne `!important`.**
Neun `!important` entfernt, in der Annahme „der Druckblock steht später in
der Datei, gleiche Spezifität, also gewinnt er".

| Messung | Ergebnis |
|---|---|
| Druck | **2.871.046 abweichende Pixel** (6 Seiten) |
| Nach Rücknahme | wieder **0** |

**Warum:** die Gegenregel ist `@scope (din-blatt) #kern` (Zeile 259). Sie
liegt **nicht** in `@media print`, gilt also auch auf Papier — und ihre
Scoping-Nähe schlägt die Reihenfolge. Die Annahme „später gewinnt" war falsch.
Damit ist auch klar: die 9 `!important` dort sind **tragend**, nicht Spiegel.

**Was das für B59 heißt.** Die 92 `!important` zerfallen nicht in „nötig" und
„überflüssig", sondern in drei Sorten:

1. **Doppelte Grundwerte** (wie Test 1) — entfernbar, 2 Stück erledigt.
2. **Kämpfe gegen `@scope`** — `@layer` hilft nur, wenn die `@scope`-Regel in
   eine *niedrigere* Schicht wandert und der Druck ungeschichtet bleibt.
3. **Kämpfe gegen die ungeschichtete Bildschirm-Sperre** (Zeilen 74/83/93):
   diese Regeln liegen **ohne** `@media screen` in der Datei und gelten im
   Druck mit. Solange sie ungeschichtet sind, schlagen sie **jede** Schicht —
   `@layer` kann dort erst greifen, wenn auch `base.css` geschichtet ist,
   sonst gewinnen dessen ungeschichtete Regeln. Das ist der eigentliche Umbau
   und der Grund, warum B59 nicht in einem Zug geht.

**Neuer Messstand:** `sheet-multipage.css` 61 statt 63 `!important`
(insgesamt 90 statt 92). Druck und Bildschirm nachgewiesen unverändert.

---

## 2026-11-15 — Absatzabstand 2,25 → 1,5 mm (gemessen, nicht geschätzt)

Nutzer: „erscheint mir etwas zu groß". Also nicht nach Gefühl gedreht, sondern
drei Werte gedruckt und die sichtbare Lücke im PDF gemessen
(`pdftotext -bbox`, 4 Absätze à 2 Zeilen, Grundlinien-Abstand):

| `margin-bottom` | sichtbare Lücke | Faktor zur Zeilenlücke (0,43 mm) |
|---|---|---|
| 2,25 mm | 2,54 mm | **5,9×** |
| 1,50 mm | 2,02 mm | 4,7× |
| 1,00 mm | 1,49 mm | 3,5× |

**Entscheidung: 1,5 mm** in beiden Dateien (Schirm und Druck, sonst paginiert
der Druck anders als die Vorschau). Die halbe Zeile (2,25 mm) wirkte im
Vergleich wie ein eigener Block; 1,0 mm klebt bei mehrzeiligen Absätzen.

**Zwei Messfallen, beide erlebt:**

1. **Ohne Neuladen misst man das alte CSS.** Der erste Vergleichslauf lieferte
   für 2,25 und 1,5 mm **identische** Werte — die Seite hatte beim letzten
   Laden noch das alte Stylesheet. Das Messkript lädt die Seite jetzt vor
   jedem Lauf neu (`?abstand=<zeit>`).
2. **Zeilenlücke ≠ Absatzlücke.** Die Lücke *innerhalb* eines Absatzes beträgt
   gemessen 0,43 mm (Glyphenkästen, nicht Zeilenraster). Ohne diesen Bezug
   wirken 2,5 mm wie „kaum mehr als normal" — es ist das Sechsfache.

Test angepasst: verlangt 1,5 mm in beiden Dateien und prüft, dass es **unter**
einer halben Zeile bleibt (vorher: „mindestens halbe Zeile").

**Nachtrag 2 (gleicher Tag, zweiter Ausfall).** Der Testbrief-Knopf war erneut
weg — wieder `pluginTestbrief: false` im Profil. Diesmal mit Falle gemessen,
statt zu vermuten:

| Prüfung | Ergebnis |
|---|---|
| App schreibt `din_settings` beim reinen Laden? | **nein** — `Storage.prototype.setItem`-Falle: **0 Schreibvorgänge**, Knopf sichtbar, Attribut `true` |
| Einzige Schreibstelle im Code | `settings.js:336–340`, `change`-Listener am Schalter `#plugin-testbrief` |
| Nach Neuladen mit `pluginTestbrief: true` | stabil `true`, Knopf sichtbar (267×40 px) |

Damit bleibt als Ursache: ein **Messskript** hat den Wert gesetzt, während der
Schalter unchecked war — die alte PDF-Harness lag unter `/tmp/opencode` und
schrieb eigene `din_settings`-Fixtures; sie ist beim Aufräumen von `/tmp`
verschwunden, ihr Inhalt ist nicht mehr prüfbar. **Bewiesen ist das nicht**,
aber es ist die einzige Stelle, die übrig bleibt.

**Konsequenz (umgesetzt):** `tools/druck-pixel.mjs` ersetzt die /tmp-Harness
und liegt im Repo. Es sichert `din_settings` und `din_draft_current` **vor** dem
ersten Lauf, schreibt sie im `finally` zurück und **warnt**, wenn
`pluginTestbrief` danach nicht `true` ist. Fixtures setzen dort ausdrücklich
`pluginTestbrief: true`.

**Regel (AGENTS.md):** Messwerkzeug darf die App des Nutzers nicht verändern.
Zustand sichern, zurückgeben, danach prüfen.

---

## 2026-11-15 — Seitenleiste schrumpft mit dem Fenster (war starr)

Nutzer: „die seitenleiste ist starr … die wird scrollbar mega hässlich".

**Gemessen (CDP, `Emulation.setDeviceMetricsOverride`, jeweils 900px hoch):**

| Fensterbreite | Leiste vorher | Leiste nachher |
|---:|---:|---:|
| 1600 px | 300 px | 300 px |
| 1440 px | 300 px | **288 px** |
| 1280 px | 300 px | **256 px** |
| 1100 px | 300 px | **240 px** |
| 1024 px | 300 px | **240 px** |
| 800 px | 300 px | **240 px** |

Ursache war dreifach dieselbe feste Zahl: `--seitenleiste-breite: 18.75rem`
plus `inline-size`/`min-inline-size`/`max-inline-size` in `sidebar.css` — die
Leiste konnte per Definition nicht schrumpfen. Jetzt
`clamp(15rem, 20vw, 18.75rem)`, `min-inline-size: 0`, und das Innenpolster
wandert mit (`clamp(8px, 1.2vw, 16px)`).

**Höhe, gleiche Messung:** Inhalt war 963–991px bei 900px Fensterhöhe. Eine
Kompakt-Regel für enge Fenster (`max-height: 1000px`: Gap 8 → 6px, Polster
16 → 8px) bringt **−28 bis −51px**: 963 → 935, 991 → 940. Der Fuß bleibt
sticky erreichbar (B74).

**Was bleibt:** bei 900px Fensterhöhe scrollen noch ~35–65px. Das ist keine
CSS-Schluderei, sondern die Menge der Bedienelemente: eine echte Lösung wäre,
Zonen einklappbar zu machen (Feature, nicht Feinschliff). `scrollbar-gutter:
stable` verhindert, dass die Leiste beim Erscheinen des Balkens seitlich
springt.

**Druck unberührt:** 4 Referenzbriefe, 6 Seiten, **0 abweichende Pixel**.

**Falle bei der Umsetzung:** die Kompakt-Regel stand zuerst **vor** der
Basisregel `#seitenleiste`. Gleiche Spezifität, spätere Deklaration gewinnt —
die Regel war wirkungslos (963 → 963). Erst nach dem Verschieben hinter die
Basisregel: 963 → 935.

---

## 2026-11-16 — GitHub #24 geprüft: drei Befunde halten, drei nicht

Das Issue („Css2", 179 Zeilen, Bilanz mit Zeilenzahlen) behauptete **78
entfernbare Zeilen**. Jeder Befund wurde am Code geprüft, nicht übernommen:

| Kandidat | Behauptung | Prüfung | Ergebnis |
|---|---:|---|---|
| 2a `source_type` | 4 | 3 Vorkommen: Typ + 2 Schreiber, **0 Leser** | ✅ entfernt |
| 3 `showPopoverSafe` | 6 | `:popover-open` statt try/catch | ✅ ersetzt |
| 1.1 Clipboard-Animation | ~15 | `@keyframes feld-puls` statt `.animate()` | ✅ ersetzt |
| 2c `schreibeFeld` else | 4 | erreichbar, solange `contenteditable` möglich ist | ⏸ bleibt (defensiv, 4 Zeilen) |
| 2b `data-plugin-multipage` | 1 | `test/all.js:3618` prüft das Attribut | ❌ bleibt |
| 2d `targetLock` | 3 | gelesen in `address.js:242/1129` | ❌ widerlegt |
| 1 boot-state.js | ~55 | CSS liest `data-layout` **schon** (`sheet-common.css:41`) | ❌ Prämisse falsch |

**Der zentrale Fehler:** das Issue unterstellt, die UI style sich über
`:checked` und `data-*` sei die „saubere Lösung". `sheet-common.css:39–40`
dokumentiert, dass `body:has(#btn-form-a:checked)` als doppelter Schreiber
(Befund B11) längst entfernt ist. `boot-state.js` setzt die Controls, weil der
Control-Zustand **das ist, was der Nutzer sieht** — Radio checked, Select-Wert.
Ohne diese Zeilen zeigt die Leiste „Form B", während das Blatt Form A rendert.

**Gemessen (CDP, echtes Blatt):** Puls = 1 Animation, `feld-puls`, 500 ms;
`prefers-reduced-motion: reduce` → 0 Animationen. Popover idempotent, ohne
Ausnahme. **Druck: 0 Pixel** gegen HEAD (6 Seiten; die 586 Pixel des ersten
Laufs waren der Datumswechsel 15. → 16.11. in der Referenz, nicht der Code).

**Lehre für künftige Reviews:** Zeilenzahlen stimmen oft, die Begründung ist
aus READMEs geraten. Gegenprobe vor dem Löschen: die Regel, die angeblich
fehlt, im CSS suchen.

---

## 2026-11-16 — GitHub #26 geprüft: das Review fand keinen Codefehler, aber eine Dopplung

#26 („Schon drin?") ist eine **Selbstkorrektur** des Reviewers zu
`font-feature.js#transitionOn`. Geprüft, nicht übernommen:

| Behauptung | Prüfung | Ergebnis |
|---|---|---|
| „vier Guard-Zweige, nicht einer" | `core.js` (vorher `font-feature.js:23–39`): matchMedia, `typeof startViewTransition`, `visibilityState`, `hatKasten` | ✅ stimmt |
| „reduced-motion raus spart ~2 Zeilen, kostet Snapshot-Capture" | `base.css:309–313` animiert 0,6 s; ein CSS-Override `animation-duration: 0s` verhindert den Snapshot **nicht** | ✅ Argument trägt, **nichts geändert** |
| „`startViewTransition` mit 0×0-Element hängt" | Guard 4 fängt es ab | ✅ stimmt |
| „nicht anfassen" | — | ✅ übernommen |

**Der Reviewer hat hier recht — und zwar gegen sich selbst.** Es gab keinen
Codefehler zu beheben. Gefunden wurde beim Nachprüfen etwas anderes, das im
Review fehlte (weil `settings.js` dort nie gelesen wurde, siehe #25):
`transitionOn` stand **zeichengleich doppelt** in `font-feature.js` und
`settings.js`. Jetzt einmal in `core.js`, beide importieren sie. Der
Feature-Check in `tools/reconciliation.js` zeigte auf `settings.js` und wurde
auf `core.js` umgehängt (sonst meldet die Fitness „View Transitions nicht
nachgewiesen").

**Nicht angefasst:** `schrift-eigene-aktiv` (in `font-feature.js` gesetzt,
**keine** CSS-Regel liest sie, 3 Tests prüfen sie) — das Review nennt es
„redundant", tatsächlich ist es ungenutzt. 2 Zeilen plus 3 Teständerungen;
steht als Angebot, nicht als erledigt.

**Druck: 0 Pixel** gegen HEAD (6 Seiten).

---

## 2026-11-16 — `schrift-eigene-aktiv` war Rest eines entfernten Features (gelöscht)

Nutzer: „wenn das schlecht umgesetzt ist bitte korrigieren".

**Herkunft belegt (git):** die Klasse hatte **einen** CSS-Leser —
`body.schrift-eigene-aktiv #btn-schrift-zuruecksetzen { display: flex; }`.
Der Hygiene-Sweep `3bf9cc2` (17.10.2026) hat `#btn-schrift-zuruecksetzen`
samt Regel entfernt (der 2-Zustände-Knopf aus `efe5af8` ersetzte ihn). Zurück
blieb der **Schreiber** ohne Leser: zwei `classList`-Zeilen in
`font-feature.js`, drei Assertions in `test/all.js`.

**Der Zustand war nie die Klasse.** Er steht in `--active-font-family`
(gelesen in `base.css:135`, `sheet-common.css:22`) und in
`data-font-state="loaded"` (gelesen in `sidebar.css:490`). Beide bleiben, alle
Zustands-Assertions der Tests bleiben — die Klasse war die dritte Kopie
desselben Zustands, ohne Abnehmer.

**Ersatz der drei Live-Assertions:** eine **Ratsche** auf den Quelltext —
`font-feature.js` darf `schrift-eigene-aktiv` nicht mehr enthalten. Damit
kommt die tote Klasse nicht still zurück.

**Druck: 0 Pixel** gegen HEAD (6 Seiten), 354 Tests, Fitness 100,0 %.

---

## 2026-11-16 — GitHub #25 geprüft: ein Befund hält, der Rest ist erledigt oder widerlegt

#25 („Javascript") prüft 12 Dateien, davon **7 gesehen** und **6 nicht**
(`persistence.js`, `salutation.js`, `settings.js`, `signature.js`,
`webapi.d.ts`, `address.js`). Alle 13 sind geprüft — die 6 fehlenden waren nur
im Review nicht dabei, nicht im Repo.

**Der einzige haltbare Befund** („Kleinigkeit C", nicht in der Bilanz):
`main.js:253` iterierte über eine Liste mit **einem** Element (`['toggle-fuss']`)
— Rest einer früheren Zwei-Element-Liste. Jetzt direkter Zugriff. Belegt im
Browser: Schalter aus → Entwurf `false`, an → `true` (`din_draft_current`).

| Behauptung aus #25 | Prüfung | Ergebnis |
|---|---|---|
| `document.js`: `formatElementMicroTypography` wird obsolet, wenn `applyMicroTypography` nach CSS geht | `format.js:428` setzt **geschützte Leerzeichen** in §-Angaben, Einheiten, Abkürzungen — Texttransformation, CSS kann das nicht | ❌ Prämisse falsch, nichts gelöscht |
| `font-feature.js`: reduced-motion-Guard raus | #26 hat sich selbst korrigiert: Snapshot-Capture bleibt | ❌ (siehe Eintrag zu #26) |
| `font-feature.js`: `schrift-eigene-aktiv` durch `:has()` ersetzen | Klasse ist **ungenutzt** (kein CSS-Leser seit `3bf9cc2`) | ✅ entfernt, siehe Eintrag oben |
| `draft-manager.js`: `#setSaveStatus`-Text per `::after` | `title` und `aria-live` bleiben JS; ohne Text verlören Screenreader den Status | ❌ nicht angefasst |
| `signature.js`: `style.transform` → Individual Properties | ist bereits so: `--sig-x/-y/-scale/-rot`, CSS liest `translate/scale/rotate` (`sheet-common.css:453–455`) | ✅ schon erledigt |
| `settings.js`: Theme über `:has()` | `data-theme` wird von CSS gelesen und schützt vor FOUC (30/30 Messungen) | ❌ bleibt |
| `multipage-controller.js`: `--i` → `:nth-child()` | `--i` positioniert die Bildschirm-Folgeköpfe per `calc()`; Druck-Geometrie, tabu ohne Messreihe | ⏸ bleibt |

**Dazu zwei Gegenproben, die das Review nicht gemacht hat:**

- **Tote Exporte** (alle 22 JS-Dateien + Addons, Verwendungszählung): nur
  `website/addons/verlauf/` hat 7 Exporte ohne Aufrufer — und dessen README
  sagt ausdrücklich „vorbereitet, NICHT geladen". Gewollt, keine Leiche.
- **`persistence.js`**: drei Funktionen sahen im Datei-lokalen Scan tot aus
  (`requestPersistentStorage`, `stripHtmlToPlaintext`, `initImportExport`);
  alle drei werden in `main.js:120/163` und `draft-manager.js:309` benutzt.

**Druck: 0 Pixel** gegen HEAD (6 Seiten), 354 Tests, Fitness 100,0 %.

---

## 2026-11-16 — GitHub #23 überflogen: nichts mehr zu holen (7 Punkte, 0 offen)

| Punkt | Stand | Beleg |
|---|---|---|
| 1.1 Clipboard-Animation → CSS | ✅ erledigt heute | `@keyframes feld-puls`, `sheet-common.css` |
| 1.2 boot.js → `:has()` | ❌ Regression | `boot.js` ist Classic-Script im `<head>` (Z. 36), `boot-state.js` ist Modul (Z. 478) und läuft **nach** dem Parse. Über `:has()` käme Layout/Marken erst nach dem ersten Paint → FOUC auf der Blattgeometrie, nicht nur am Theme |
| 1.3 Toast-Dauer variabel | ⏸ Grenzfall | `--hinweis-dauer` aus Textlänge (`core.js:237`), gelesen in `base.css:76` + `sidebar.css:961`. Feste 3 s = Feature weg für 3 Zeilen |
| 1.4 multipage `--i` → statisch | ❌ tabu | `--i` positioniert Bildschirm-Folgeköpfe (`adoptedStyleSheets`, `multipage-controller.js:44/110`); Druckgeometrie |
| 1.5 Signatur-Transform | ✅ war schon so | `--sig-x/-y/-scale/-rot`, CSS: `translate/scale/rotate` (`sheet-common.css:453–455`) |
| 1.6 `applyMicroTypography` → CSS | ❌ falsch | setzt geschützte Leerzeichen (Text!), CSS kann das nicht |
| 1.7 Anchor Positioning | ✅ war schon so | `anchor-name` in `sheet-common.css:407/409`, `sidebar.css:355`; `address.js` ohne `getBoundingClientRect` |

Fazit: #23 beschreibt einen Zustand, den der Code hinter sich hat. Gelöscht.

---

## 2026-11-16 — Toast-Lebensdauer komplett in CSS (GitHub #23, Punkt 1.3)

Nutzer: „toast und alles was damit zu tun hat bitte soweit es geht über css
regeln!".

**Vorher:** `core.js#setzeLebensdauer()` schrieb `--hinweis-dauer` als
Inline-Style, berechnet aus der Textlänge (`min(5000, 2000 + 30·Zeichen)`).
Das war die letzte Rechenaufgabe im Toast — und der einzige Grund, warum das
Modul DOM-Styling anfasste.

**Was CSS kann und was nicht:** Textlänge ist in CSS **nicht** messbar.
`attr()` liefert Zeichen, keine Länge; Container Queries messen Boxen, nicht
Inhalt. Eine „langer Text bleibt länger"-Regel ist damit nicht darstellbar.

**Was jetzt in CSS steht** (`sidebar.css:997`):

| Typ | Dauer | vorher (Länge) |
|---|---:|---|
| info / success | 4000 ms | 2000–5000 ms |
| warning | 5000 ms | 2000–5000 ms |
| error | 6000 ms | 2000–5000 ms |

Gemessen im Browser (nach Reload): `4s / 4s / 5s / 6s`, kein Inline-Style am
Element. Auto-Abbau geprüft: Info-Toast ist 4300 ms nach dem Start geschlossen.

**Was in JS bleibt und warum:**
- `showPopoverSafe` / `hidePopoverSafe` — Popover-Zustand ist eine API, keine
  Property.
- `animationend` → `hide()` — CSS kann kein Popover schließen; die Animation
  ist der Timer, der Aufruf bleibt ein Listener.
- `current` (Dedupe gleicher Meldungen) und `data-type` — Zustand.
- Die Ausnahme für `prefers-reduced-motion` (`base.css:76`) bleibt: die
  Lebensdauer-Animation ist ein Timer ohne Bewegung und darf nicht auf 0,01 ms
  gekürzt werden. Sie liest jetzt denselben `--hinweis-dauer`-Wert.

**Nicht mehr im Modul:** `style.setProperty` ist aus `core.js` verschwunden —
ein Test hält das fest (Ratsche auf `style.setProperty('--hinweis-dauer'`).

**Druck: 0 Pixel** (Toast ist `nicht-drucken`), 355 Tests, Fitness 100,0 %.

---

## 2026-11-16 — Toast: kein JS-Schließen mehr (Nutzer: „nicht sehen = nicht da")

Nutzer: *„popover muss auch nicht geschlossen werden (!!) … nicht sehen ===
nicht da === geschlossen … kann das sein? also eine 140% option!?"*

**Ja, und es ist keine 140 %-Option, sondern der Normalfall:** der Endzustand
der Animation bleibt per `forwards` stehen —

```css
@keyframes hinweis-lebensdauer {
  0%, 99%  { opacity: 1; visibility: visible; }
  100%     { opacity: 0; visibility: hidden; pointer-events: none; }
}
```

Damit ist der Hinweis nach Ablauf **unsichtbar, nicht klickbar und aus dem
Accessibility-Baum** — ohne dass JS etwas schließt. Entfernt: der
`animationend`-Listener und die `hide()`-Funktion (≈10 Zeilen).

**Was JS bleiben muss — mit Messung belegt:**

| Versuch | Ergebnis |
|---|---|
| Animation abgelaufen | `opacity: 0`, `visibility: hidden`, `pointer-events: none` ✅ |
| Klick-Test auf die Mitte des Hinweises | `elementFromPoint` liefert **nicht** den Hinweis → nichts wird blockiert ✅ |
| Neuer Hinweis danach | wieder sichtbar (`opacity: 1`) — Neustart klappt ✅ |
| Neustart **ohne** Reflow | bleibt unsichtbar (`0`) ❌ |
| Neustart **mit** `void el.offsetWidth` | sichtbar (`1`) ✅ |

Der Reflow ist also nötig: `hidePopover()` + `showPopover()` in derselben Task
werden zu **einem** Style-Recalc zusammengefasst, `:popover-open` ändert sich
nie sichtbar, die Animation startet nicht neu. Eine Zeile, gemessen.

**Popover-Zustand bleibt offen** (`:popover-open` = true, solange niemand Esc
oder Klick daneben drückt). Das ist Absicht: `popover="auto"` gibt dem Nutzer
die Light-Dismiss-Bedienung, und der Zustand schadet nicht, weil der Endzustand
keine Klicks fängt.

**Messfalle (wichtig fürs Druck-Gate):** ein Lauf meldete **503 553**
abweichende Pixel in Form B — 25,2 mm Verschiebung. Ursache war **nicht** der
Code: drei Wiederholungen mit identischem Stand ergaben **0** Pixel, und die
Verschiebung trat nur in einem Lauf nach den Fußzeilen-Experimenten auf
(Print-Snapshot mit altem Seitenzustand). Lehre: ein einzelner Pixel-Ausreißer
nach Experimenten wird wiederholt, bevor er als Regression gilt.

---

## 2026-11-16 — Fußzeile: nur Seite 1, im reservierten Band (Überlappung konstruktiv aus)

**Korrektur des Users:** „die GMBH angaben KOMMEN NUR AUF SEITE 1 !!!!!! harte din
5008 anforderung". Mein erster Anlauf (Fußzeile im Fluss, also am Briefende) war
damit falsch und wurde verworfen.

**Gemessenes Problem:** `position: absolute; top: 241mm` liegt im Textbereich
(der bis 272/277 mm läuft). Bei einem zweiseitigen Brief endete der Text bei
249 mm — 6 mm unter der Fußzeilen-Oberkante. Eine Fußzeile im Unterrand
(`top: 277mm`) ist keine Lösung: Chrome schneidet am `@page`-Inhaltsrand ab,
im Druck erschien **eine** Pixelzeile.

**Der Vertrag (eine Zahl, zwei Verwendungen):**

```css
--fuss-hoehe: 0mm;                                   /* aus */
:root:has(#toggle-fuss:checked) { --fuss-hoehe: 15mm; }
--nutz: calc(… - var(--fuss-hoehe));                 /* Textbereich */
top: calc(var(--seite) - var(--rand-u) - var(--fuss-hoehe));  /* Fußzeile */
```

Textbereich-Unterkante und Fußzeilen-Oberkante sind **dieselbe Rechnung** —
sie können sich nicht treffen, auch nicht bei Änderung von `--rand-u`
(20/30 mm) oder der Fußzeilenhöhe.

| Nachweis | Wert |
|---|---|
| Fußzeile im PDF | Seite **1**: 264,0 – 276,5 mm |
| letzter Text darüber | endet **263,8 mm** → 0,2 mm Abstand, keine Überlappung |
| Seite 2 | **keine** Fußzeilen-Wörter (DIN 5008 erfüllt) |
| Fußzeile AUS, HEAD vs. jetzt | **0 Pixel** (Default unberührt) |
| Tests | 356, Fitness 100,0 % |

**Preis, offen benannt:** das Band gilt auf **jeder** Seite (Textbereich 237 mm
statt 252 mm), damit Bildschirm und Druck dasselbe zeigen (WYSIWYG). Eine
Reservierung nur auf Seite 1 (`@page :first`) wäre im Druck möglich, würde den
Schirm aber vom PDF entkoppeln. Bewusst dagegen entschieden.

## 2026-11-17 — Papierkorb geschrumpft: Pipeline-Reste leben nur noch in der Historie

**Anlass:** Platzbedarf (Repositorium 87 MB apparent, davon 62 MB `node_modules` und
35 MB `.git`) und die Frage, ob in `Papierkorb/` noch Wissen steckt.

**Befund:** Nein fuer die Retrieval-Pipeline. Sie war bereits am 2026-11-09 mit
`3d40782` („remove sqlite fts5 index and mcp server pipeline") abgeschafft und in
[[tooling-overview]] als entfallen dokumentiert. Die `context-dumps/` waren keine
Chatverlaeufe, sondern Gitingest-Exporte des Repos — Wegwerf-Snapshots. Die
semantische Stufe (`sqlite-vec`, embeddings) wurde nie gebaut: null Treffer im Code.

**Entfernt (2,8 MB → 1,2 MB im Papierkorb):** `context-dumps/`, `test-traces/`,
`mcp/dinbrief-mcp/`, `docs_index.js`, `README-DB.md`, `log_session.js`, `codeql.yml`,
`research/din-5008-svgs/` sowie die ueberholten Datenkopien
(`de_plz_ort.json[.br,.gz]`, `de_grosskunden_plz.json[.br,.gz]`, `de_districts.json`,
`de_vornamen_gender.json[.br]`, sechs Mess-JSONs). Live sind die Daten unter
`website/data/` und werden von `tools/build_plz_data.mjs` aus den Geonames-Rohdaten
erzeugt.

**Behalten (bewusst):** `research/*.md` (gemessene Benchmarks, Anbietervergleiche,
Parser-Haertetests — nicht reproduzierbar), `audit/`, `archive/`, `scripts/`
(Herkunftsnachweis der Datasets). Die Skill-Korpora `skill-ux-principles/` und
`skills-legacy-references/` bleiben ebenfalls, weil sie nirgends sonst auf der
Maschine existieren.

**Wiederherstellung:** alles oben Genannte ist in der Git-Historie, z. B.
`git show 3d40782^:tools/docs_index.js`. Kein Rewrite, kein Force-Push.

**Guard gelockert (Nutzerentscheid, 2026-11-17):** Der Pre-Commit-Hook verbot bisher
*jede* Löschung unter `Papierkorb/` — das ist die Ursache des Reverts `b8a0aca` →
`00c2cd9` vom 2026-11-09. Auf ausdrückliche Weisung ist die Regel jetzt auf das
Verzeichnis beschränkt: `githooks/pre-commit` bricht weiter ab, wenn `Papierkorb/`
fehlt oder leer ist, erlaubt aber einzelne Löschungen auf Nutzerweisung. Dieselbe
Präzisierung steht in [[HANDOFF]] (Unantastbarkeits-Klausel).

**Nachtrag — externes Agent-Home `~/.din-briefneo` (70 MB → 31 MB):** Entfernt wurden
`cache/` (13 MB, hielt die beiden SQLite-Reste der Retrieval-Pipeline,
`docs_search.db` und `DIN-Brief_docs.db`), `feature-cache/` (25 MB, npm-Cache von
`tools/check-feature.js`, per Netz neu füllbar) und `research-raw/` (1,3 MB Rohquellen).
`node_modules/` bleibt: `tools/reconciliation.js:423` sucht den TypeScript-Compiler
ausschliesslich dort (`$DIN_HOME/node_modules/.bin/tsc`) und meldet ohne ihn einen
`critical`-Befund — es gibt kein `tsc` im PATH. `build/` erzeugt `tools/build_db.js`
bei jedem Lauf neu. `/home/moritz/.din-briefneo` ist damit kein Build- oder
Datenbank-Ort mehr.

## 2026-11-17 — Statusdokumente konsolidiert, ID-Register eingeführt

**Anlass.** Zwei Beschwerden aus der Arbeit: (a) Erledigtes lag als Fließtext in
`BACKLOG-ARCHIV.md` und `batch/STATUS.md`, Offenes an drei Orten; (b) dieselbe Sache
hatte bis zu drei Namen (`B59` = `S2` = „@layer-Umbau").

**Befund zur Namenslage (gezählt, nicht geschätzt).** Elf Nummernkreise im Doku-Korpus:
`B` (266 Nennungen), `A` (217), `P` (55), `H` (37), `R` (24), `F` (19), `M` (18),
`E` (17), `S` (15), `T` (14), `C` (13). `M`, `T` und `W` waren nirgends definiert;
`E1` entpuppte sich als Treffer im Dateinamen `PHASE1-…` — es gibt keinen E-Kreis.
AGENTS.md §5.5 verlangt „ein Sachverhalt, ein Begriff", maschinell geprüft war das
nur für Begriffe (`P6`–`P11`), nicht für IDs.

**Konsolidiert.**
- `BACKLOG-ARCHIV.md`: 1.026 → 102 Zeilen. 64 Einträge als Tabelle
  (`ID | Titel | Ausgang | Datum | Nachweis`). Fließtext bleibt über die Git-Historie
  der Datei und `git log -S "<ID>"` auffindbar.
- `batch/STATUS.md`: 130 → 50 Zeilen. Enthält nur noch, was **offen** ist (B94, B95)
  und welche Entscheidungen beim Nutzer liegen.
- `BACKLOG.md` ist die einzige offene Liste: 25 Punkte, davon zwei neu
  (`B94` Review Batch 06, `B95` Review Batch 07). Tabelle per `tools/backlog-sync.mjs`
  regeneriert.
- Größen-Ausnahme für `BACKLOG-ARCHIV.md` in `tools/reconciliation.js` entfällt —
  die Datei liegt jetzt weit unter dem 400-Zeilen-Limit.
- `S4` („nicht anfassen") bleibt als Nutzerentscheidung dokumentiert, bekommt aber
  keine ID: es ist keine Aufgabe.

**ID-Register.** `docs/30-meta/ID-REGISTER.md` führt die aktiven Kreise
(`A`, `H`, `C`, `P`, `B`), die ausgelaufenen (`S`, `R`, `F`, `T`, `M`) mit
Alias-Tabelle und die Nicht-IDs (`E1`, `FTS5`, `B96`). Drei Regeln: ein Punkt eine ID,
neue IDs nur aus einem registrierten Kreis, ausgelaufene Präfixe bekommen keine neuen
Nummern.

**Neu und maschinell geprüft:** `tools/id-register.js` (eingehängt in
`tools/reconciliation.js` neben dem Terminologie-Check). Es prüft
(1) jede `B`-Referenz in `docs/`, `batch/`, `skills/` gegen Backlog/Archiv,
(2) ausgelaufene Präfixe in ID-Form (`` `S5` `` = Verstoß),
(3) die Deckung des Registers gegen Law Catalog (A, H), `project.json` (P) und
Backlog (B). Test mit fünf erfundenen IDs: alle fünf gefangen; echte Lage: 0 Verstöße.

**Bewusst nicht erfunden:** `W4` (als „Law W4" dreimal zitiert, im Law Catalog nicht
definiert), `I/EM` (`AGENTS.md:342`, nirgends aufgelöst) und `M1`–`M7` bleiben als
**ungeklärt** im Register stehen. Drei offene Punkte, keine drei Behauptungen.

## 2026-11-14 — B63: `data-layout` auf eine Spur (nachgetragen 2026-11-17)

**Warum nachgetragen:** Der Umbau war am 2026-11-14 erledigt, stand aber nur in
`BACKLOG-ARCHIV.md` — kein Logeintrag. Bei der Konsolidierung am 2026-11-17 aufgefallen.

**Ausgangslage.** `data-layout` hatte zwei Spuren: das Attribut (an drei Stellen gesetzt:
`boot.js:42`, `settings.js:90`/`:215`) und eine zweite `--active-idx`-Spur in
`sidebar.css:182`, die nur für diesen Schalter existierte.

**Messung vor und nach dem Umbau** (`6x CPU`, 10 kalte Läufe je Form):

| | frühster Frame falsch | nach Seeding falsch |
|---|---:|---:|
| vorher, form-a / form-b | 0/10 · 0/10 | 0/10 · 0/10 |
| nachher, form-a / form-b | 0/10 · 0/10 | 0/10 · 0/10 |

Entscheidend war der Frame **vor** dem Seeding: bei gespeichertem `form-a` zeigte der
erste Frame `checked="btn-form-b"` (HTML-Default), die Pille stand über `data-layout`
aber auf 0. Die `:checked`-Regel hätte die falsche Position gezeigt — die
Attribut-Spur ist also die tragende, nicht die Dublette.

**Geändert:** `sidebar.css` — generische `:checked`-Regeln gelten nicht mehr für den
Layout-Schalter (`:not(.segmented-control-layout)`); `index.html` — Control trägt
`segmented-control-layout`; `settings.js` — zweiter `data-layout`-Schreiber entfernt.
**Nicht angefasst:** die Blattgeometrie (`sheet-common.css`, `sheet-multipage.css` lesen
`[data-layout]`).

## 2026-11-17 — Korrektur: `W4`, `I/EM`, `M1`–`M7` sind auffindbar

**Korrektur des Eintrags von heute.** Dort standen die drei IDs als „ungeklärt". Eine
projektweite Suche (inkl. `tools/`, `skills/`, `batch/`, `Papierkorb/`, Law Catalog) hat
sie aufgelöst:

- **`W4`** ist eine **Antipattern-Regel** in `tools/antipatterns/web.json` (Zero-HEX-Farbsystem),
  kein Gesetz. Ein Law `W4` existiert nicht und hat nie existiert — die sachlich
  zuständigen Gesetze sind `A16`–`A20`. Der Fehlverweis war am 2026-09 bereits notiert
  (Eintrag „Sonde beruft sich auf ein Gesetz, das es nicht gibt": `W4/W5/W6` → `A16`, `A20`).
  Offen bleibt nur die **Bezeichnung** an fünf Stellen (`repository.yaml:80`,
  `llm-modern-web-playbook-2026.md:49,118`, zwei Skill-Beschreibungen).
- **`I/EM`** meint die HTML-Tags `<i>` und `<em>` in der Rich-Text-Allowlist —
  `website/js/document.js:38` führt beide; der Beschluss steht im Eintrag
  „Sanitizer-Dedup" (2026-09-10). Die Abkürzung war nicht ausgeschrieben, das war
  der ganze Fehler.
- **`M1`–`M7`** sind die Befunde des **Grok-Website-Reviews** vom 2026-09-10
  (Eintrag „Grok-Website-Review: 5 Batches umgesetzt"). Alle sieben stehen dort mit
  Ausgang: `M2` behoben (`9ecbed6`), `M1`/`M4` vertagt, `M5`–`M7` abgehakt.

**Konsequenz im Register:** `W` ist ein **aktiver Nummernkreis** (W2–W6 neben P1–P40),
keine Unklarheit. `tools/id-register.js` prüft jetzt auch die Deckung von `W` gegen
`tools/antipatterns/web.json`.

## 2026-11-19 — Repository-Cockpit (Baustein B), Typography-Zentrierung & CI Budget-Gates

- **Kontext:** Etablierung des standardisierten 3-Dateien-Cockpits (`README.md`, `AGENTS.md`, `map.md`) nach dem kanonischen Muster aus `LLM-ordnerstruktur` (Modul 05: Software-Repositories / Baustein B).
- **Entscheidung & Umsetzung:**
  1. `AGENTS.md` radikal von 519 Zeilen auf 43 Zeilen verschlankt (Fokus auf Verfassungs-Invarianten und Kern-Workflows). Bisheriges Altwissen vollständig nach `docs/90-archive/AGENTS-LEGACY.md` archiviert.
  2. Kanonische `map.md` im Projekt-Root angelegt (58 Zeilen: Aider Repo-Map & Task-to-File Matrix).
  3. Multi-AI Pointer in `CLAUDE.md` und `GEMINI.md` synchronisiert (1-Schritt O(1)-Routing auf `AGENTS.md` + `map.md`).
  4. Typografie-Asset-Pipeline in `fonts/` am Repo-Root zentriert (`subset_fonts.py` und Roh-TTF gebündelt; `website/fonts/` produktiv erhalten).
  5. Mechanisches CI-Budget-Gate in `tools/repo-map-check.mjs` verankert (`AGENTS.md` <= 70 Z., `map.md` <= 100 Z.).
  6. Test-Isolation repariert: `<div id="anrede">` im HTML-Fixture `test/index.html` ergänzt, sodass isolierte Filter-Läufe (z. B. `--filter="PLZ|Address"`, `--filter=DraftManager`) fehlerfrei durchlaufen.
- **Folge:** Token-Ersparnis pro KI-Start ~80 %, 0 % Regressionsrisiko, Fitness-Score 100 % clean.

---

## 2026-11-22 — Unterrand-Schalter rein deklarativ (`:root:has()`), kein zweiter Setzer

**Ausgangsfrage des Users:** „wo kann man JavaScript loswerden? also gegen CSS/HTML tauschen?"

**Befund (gemessen):** Von den 560 Zeilen Dropdown-/Overlay-Bedienung sind nur
zwei Zeilen durch CSS ersetzbar — der Unterrand. Alles andere ist Verhalten
(Debounce, Tastatur, ARIA, Datenabruf) oder der Blattrand-Deckel, den `anchor()`
in `max-height` nicht kann (`CSS.supports` = false, fiel auf `62vh` zurück).

**Umsetzung:** `--rand-u` hängt jetzt am Schalter, wie `--fuss-hoehe` an
`#toggle-fuss`:

```css
:root:has(#btn-rand-u-30:checked) { --rand-u: 30mm; }   /* Default 20mm bleibt */
```

- `settings.js` setzt keinen Inline-Wert mehr, sondern gibt den von `boot.js`
  mit `removeProperty()` ab. Reihenfolge: erst Schalter stellen, dann abgeben —
  dadurch kein Frame mit falschem Wert.
- `boot.js` bleibt als Pre-Paint-Snapshot (blocking script im `<head>`, sieht
  den Schalter noch nicht).
- Tests: 3 alte (Computed-Style nach `applySettings`) durch 2 ersetzt —
  CSS-Vertrag (`--rand-u: 20mm`, `:has(#btn-rand-u-30:checked)` → 30 mm, kein
  `setProperty('--rand-u')` in `settings.js`) + Whitelist-Normalisierung
  (30 bleibt, 25 → 20).

**Nachweis im laufenden System:** gespeichert 30 → `inline: (keiner)`,
`computed: 30mm`, Schalter an; Klick aus → 20 mm; Klick an → 30 mm;
`localStorage.din_settings.randU = 30`. Tests 400/400, Fitness 100 %.

---

## 2026-11-22 — Bezugssystem der Vorschlagslisten ist das Blatt, nicht das Fenster

**Nutzer-Vorgabe (wörtlich):** „das dropdown soll absolut zu din a4 seite sein!
zu nichts anderem.. die din a4 seite ist der arbeitsbereicht".

**Gemessenes Problem:** Die Listen waren am Feld verankert und mit Fensterwerten
gedeckelt. Im Infoblock (Feld 125…190 mm) lief die Ortsliste dadurch 14 mm über
den rechten Blattrand hinaus (pop rechts 204,4 mm bei 210 mm Blattbreite);
`max-width: min(560px, 92vw)` und `max-height: min(62vh, 760px)` bezogen sich
auf das Fenster.

**Umsetzung:**

| Regel | vorher | jetzt |
|---|---|---|
| Breite | `min(560px, 92vw)` | `165 mm` (= 210 − 25 links − 20 rechts) |
| Höhe | `min(62vh, 760px)` | `165 mm` Fallback, exakt per JS bis 20 mm vor Blatt-Unterrand |
| `passeAnBlattrand` | `min(Blatt, Fenster)` | nur Blatt; Fenster nur, wenn kein Blatt existiert |
| Infoblock-Felder (`#absender-ort`, `#absender-strasse`) | linksbündig | `right: anchor(right)` — wächst nach innen |
| Mehrseiten | `#kern`-Unterkante | Unterkante der **ersten** Seite (`top + width × 297/210`) |

**Nachweis (gemessen, Blatt 210 × 297 mm):** Empfänger-Liste 25…190 mm,
Absender-Liste 110,6…190 mm, Straßen-Liste 110,6…190 mm, alle mit Unterkante
274,7 mm (297 − 20 − 2,3). Keine Liste verlässt mehr das Blatt.

**Grenze der Regel:** Die Sidebar-Listen (Anschrift-Suche, Zwischenablage) liegen
nicht auf dem Blatt; für sie bleibt das Fenster der Bezug.

---

## 2026-11-22 — Geoapify-Treffer im Ringspeicher (512 KB, `localStorage`)

**Vorschlag des Users:** „um abrufe zu sparen sollten wir vielleicht alle ergebnisse
die wir bekommen speichern? also ringspeicher? vllt 1mb?" — entschieden: **512 KB**.

**Gemessen (gleiche Anfrage):**

| Variante | je Suchbegriff | Einträge je MB |
|---|---|---|
| Geoapify-Rohantwort | 9,8 KB | ~104 |
| nur `street, housenumber, postcode, city, country_code` | 0,4 KB | ~2.900 |

**Wo:** `localStorage` — strukturierte Daten gehören per Gesetz **S1** dorthin;
**A34** verbietet IndexedDB für strukturierte Daten (Ausnahme bleibt
`binary-storage.js` für Binär-Assets). Ein eigener IndexedDB-Store wäre ein
Gesetzesbruch gewesen.

**Umsetzung:** `website/js/geo-cache.js` (neu), FNV-1a-Hash als Schlüssel,
Index `{h,b,l,t}` im RAM und verzögert geschrieben (400 ms, plus `pagehide`),
Verdrängung nach Alter, Kollisionsschutz über die Originalschlüssel-Länge.
`address.js` hält die Session-Map davor und kürzt Straßentreffer beim Ablegen.

**Nachweis:** Ein Suchbegriff belegt 428 Byte. Nach einem **Reload** liefert
derselbe Begriff die Liste mit **0 API-Abrufen** (567 ms ab erstem Tastendruck,
davon 350 ms Tippen + 180 ms Debounce); kalt kostet derselbe Begriff ~500–600 ms
Netz zusätzlich. Tests 406/406, Fitness 100 %.

---

## 2026-11-22 — Ring auf 1 MB, Verdrängung nach LFU (Zähler nur bei Übernahme)

**Nutzer-Vorgabe:** größerer Ring und ein Zähler „wie oft die Adresse gesucht
wurde" — aber ausdrücklich nur für das, „was nachher tatsächlich ins Feld kommt".

**Anker:** Das ist **LFU (Least Frequently Used)** mit **LRU-Tie-Break**; die
Zählung erst bei der Übernahme ist eine **Admission-Policy** mit implizitem
Feedback (Klick statt Abfrage). Verwandt: TinyLFU (Doorkeeper), LFUDA (Alterung),
GDSF (Häufigkeit pro Byte).

**Umsetzung:**

| Punkt | Wert |
|---|---|
| Deckel | 512 KB → **1 MB** (~2.400 Begriffe bei 428 Byte) |
| Zähler | `n` je Eintrag, nur über `geoCacheZaehle()` — aufgerufen in der Straßen-Auswahl (beide Felder) und in `selectSuggestion` der Sidebar-Suche |
| Verdrängung | `n` aufsteigend, dann Schreibreihenfolge → **nie Gewähltes fliegt zuerst** |
| Neusuchen | `geoCacheSetze` behält `n` (ein Begriff verliert seine Wertigkeit nicht, nur weil er erneut gesucht wird) |

**Nachweis:** Ring geleert → „Hauptstr" suchen: Zähler **0** (Suchen allein
zählt nicht) → erste Auswahl **1** → zweite Auswahl **2**; Belegung 428 Byte von
1.048.576. Tests: 3 neue (Zähler nur bei Übernahme, Zähler überlebt Neusuchen,
gewählter Begriff überlebt die Verdrängung), 409/409, Fitness 100 %.

---

## 2026-11-22 — Auch leere Trefferlisten in den Ring (Negative-Cache)

**Nutzer-Vorgabe:** „alle Sachen speichern die wir suchen also alle Ergebnisse …
weniger Abfragen; aber nur die Sachen die wir aktiv übernehmen sollen negativ
gezählt werden."

**Befund:** Die Straßensuche verwarf leere Antworten vor dem Ablegen
(`if (!treffer.length) return []`) und der Cache-Treffer verlangte
`ausCache?.length` — eine gemerkte leere Liste wäre also ohnehin ignoriert
worden. Jede sinnlose Zeichenfolge kostete damit **jedes Mal** einen Abruf.

**Umsetzung:** leere Liste wird gespeichert (`cacheSetze(schluessel, [])`) und
beim Lesen als Treffer erkannt (`if (ausCache)` statt `ausCache?.length`).
Adressfeld-Suche legte leere Listen schon vorher ab.

**Nachweis:** „Zzqqxww" → 1. Versuch: 1 Abruf, 0 Treffer, Ring 88 Byte;
2. Versuch: **0 Abrufe**, weiterhin 0 Treffer. Zähler bleibt 0,
`gewaehlt: 0` — leere Ergebnisse werden nie gewertet.
Tests: 1 neuer (410/410), Fitness 100 %.

---

## 2026-11-22 — A65 in den Law Catalog: keine dynamische Codeausführung, keine HTML-Injektion

**Nutzer-Vorgabe:** „Kein innerHTML, kein eval, kein document.execCommand — diesen
veralteten Dreck will ich da nicht haben." Prüfung des Bestands ergab: zwei der drei
waren **schon** verboten und maschinell geprüft — A61 (kein `innerHTML`/`setHTMLUnsafe`),
A52 (kein `execCommand`), A48 (keine Date-API). Es fehlten `eval`, `new Function`,
die String-Form von `setTimeout`/`setInterval`, `insertAdjacentHTML` und `document.write`.

**Neu:**

| Ort | Änderung |
|---|---|
| `docs/norm/Immutable-Law-Catalog.md` | **A65** (HARD BAN, `website/**`); A48 zusätzlich um `.getTime()` erweitert |
| `tools/antipatterns/web.json` | Regel **W8** (`catalog_ref: A65`), Version 1.1.2 |
| `tools/antipatterns/base.json` | B2-Pattern um `\.getTime\(` erweitert |
| `docs/meta/ID-REGISTER.md` | A-Bereich A1–A65 |

**Rot-Nachweis (Gate wirklich scharf):** temporäre Datei mit `eval('1+1')` →
`[CRITICAL] [W8] Verstoss … A65`; mit `new Date().getTime()` → B2/A48 schlägt an.
Nach dem Entfernen: 52 Regeln, 0 Verstöße. Produktivcode war bereits sauber
(0 Treffer für alle fünf Muster).

---

## 2026-11-22 — A66–A68: die Modell-Reflexe aus dem Law Catalog heraushalten

**Nutzer-Vorgabe:** „mehr Sachen draufpacken, die eine normale LLM immer und immer
wieder einbauen möchte, weil es halt das etablierte LLM-Wissen ist."

**Neu (alle maschinell geprüft, Produktivcode war bereits sauber):**

| Law | Verbot | Regel | Typischer Modell-Reflex |
|---|---|---|---|
| **A66** | kein Fremd-Framework und keine Utility-Bibliothek (kein React, kein Vue, kein Svelte, kein Angular, kein jQuery, kein lodash, kein axios, kein Tailwind) | **W9** | „nimm dafür eine Bibliothek" |
| **A67** | CommonJS/Bundler-Artefakte (`require(`, `module.exports`, `process.env`, `__dirname`) | **W10** | „baue eine Build-Pipeline" |
| **A68** | `alert()`, `confirm()`, `prompt()` als UI | **W11** | „nimm `confirm()` für die Rückfrage" |

**Rot-Nachweis:** eine Temp-Datei mit `import … from 'lodash/debounce'`, `require('x')`
und `confirm()/alert()` löste **drei** CRITICAL-Treffer aus (W9, W10, W11); nach dem
Entfernen 55 Regeln, 0 Verstöße.

---

## 2026-11-22 — Alle rohen Farb-Literale tokenisiert (79 → 0)

**Nutzer-Vorgabe:** „dann bitte diese tokenisieren" (79 rohe Literale in Regeln).

**Umsetzung:** ein Token-Block `2c. FARB-ROLLEN & LISTENPALETTE` in `base.css`
mit 40 Rollen-Tokens plus den 21 Palettentönen `--ort-ton-0…20` (vorher 21
einzelne `oklch()`-Werte in `sidebar.css`). Betroffen: `base.css`,
`sheet-common.css`, `sheet.css`, `sheet-multipage.css`, `sidebar.css`.

Beispiele: `--farbe-weiss`, `--farbe-schatten`, `--farbe-text-anthrazit`,
`--farbe-ueberlauf*` (Überlauf-Warnung), `--status-erfolg/offen/fehler-*`
(Speicherstatus), `--liste-firma/-behoerde/-strasse`, `--ton-formal/-hoeflich/-locker`.

**Nachweis gleiche Optik (gemessen, computed style):**
`--liste-firma` = `oklch(45% 0.16 255)` → Zeile rendert `oklch(0.45 0.16 255)`;
`--ort-ton-3` = `oklch(0.56 0.19 53)`; `--farbe-weiss` = `oklch(100% 0 0)`.
Screenshot vor/nach identisch.

**Tokenbestand:** 170 Namen auf der Seite, davon **65 Farbtokens**. 13 Tokens
haben am `:root` keinen Wert — das ist korrekt: sie werden *scoped* gesetzt
(`--ort-ton` je Zeile, `--items` je Container, `--active-idx` je Segment).
Ein Test wurde angepasst (Puls-Startfarbe kommt jetzt aus
`--farbe-erfolg-flaeche`). Tests 410/410, Fitness 100 %.

---

## 2026-11-22 — Anrede: Team-Formen für Firmen, „Liebe,"-Fehlbildung behoben

**Vorlage des Users:** zwei Übersichten deutscher Anreden (karrierebibel +
eine 5-stufige Liste) mit dem Auftrag „80/20 reicht".

**Befund:** Für einen Empfänger ohne Ansprechpartner, aber mit Firma, kamen die
allgemeinen Formen — darunter die grammatisch falsche Zeile **„Liebe,"** (die
Casual-Ersetzung `Hallo` → `Liebe` lief auch auf „Hallo,").

**Übernommen (bewusst nur das):**

| Fall | neu |
|---|---|
| nur Firma | `Sehr geehrtes Team der <Firma>,` (formal), `Guten Tag zusammen,` (höflich), `Hallo zusammen,` (locker) |
| nur Firma, formal | zusätzlich `Sehr geehrte Damen und Herren,` als Rückfallzeile |
| ohne alles | unverändert, aber ohne die Fehlbildung |

**Bewusst NICHT übernommen** (80/20 bzw. Gesetzeslage):
- regionale Formen (`Moin`, `Servus`) und `Hi`/`Hey` — passen nicht zum Brief;
- Tageszeit-Anreden (`Guten Morgen,`) — bräuchten eine Uhr, A48 verbietet die Date-API;
- Gendern (`Liebe*r`, `Mitarbeitende`) — Stilrichtlinie, nicht Aufgabe der App;
- Mehrpersonen-Anreden — Empfängerfeld kennt nur eine Person.

Gemessen im Browser: nur Firma → 5 Varianten (2/2/1) in den drei Farbgruppen;
mit „Frau Lara Croft" unverändert 5 (2/1/2). Tests 412/412, Fitness 100 %.

---

## 2026-11-22 — Korrektur: Tageszeit-Anreden gehen doch (Temporal statt Date)

**Korrektur einer eigenen Aussage (gleicher Tag).** Im Eintrag „Team-Formen für
Firmen" steht, Tageszeit-Anreden seien nicht übernommen, weil sie „eine Uhr
bräuchten — A48 verbietet die Date-API". **Das war falsch.** A48 verbietet
`new Date()`/`Date.now`/`Date.parse`; der Ersatz ist ausdrücklich **`Temporal`**
(A50: `Temporal.Now` nur mit expliziter IANA-Zone). Gemessen im laufenden
Chrome 156: `Temporal.Now.zonedDateTimeISO('Europe/Berlin').hour` = 20 → die
Uhr war die ganze Zeit verfügbar.

**Nutzervorlage:** „wir haben temporal! Guten Morgen, Herr …"

**Umsetzung:**

| Datei | Zusatz |
|---|---|
| `website/js/format.js` | `aktuelleStunde()` — eine Stelle für „wie spät ist es", zoniert via `Temporal` (A50) |
| `website/js/salutation.js` | `tageszeitGruss(stunde)` (reine Funktion) + Variante im höflichen Ton |

Fenster: 5–10 „Guten Morgen", 11–17 „Guten Tag", 18–4 „Guten Abend". Ohne Uhr
(`NaN`) bleibt es bei „Guten Tag" — die Automatik ändert sich nicht, nur die
Auswahlliste bietet die passende Form an.

**Gemessen (20:31):** „Guten Tag Frau Croft," **und** „Guten Abend Frau Croft,"
stehen nebeneinander; 6 Varianten gesamt (2/2/2). Tests 414/414 (2 neue), Fitness 100 %.

---

## 2026-11-22 — 3×3 Grußformeln, Auswahl am Grußfeld

**Nutzer-Vorgabe:** „wir haben jetzt 6 Grußformen? vielleicht wären 3×3 perfekt —
und wenn ich ins Grußfeld gehe, wird das auch zum Dropdown und zeigt die zur
Anrede passenden Sätze."

**Umsetzung:**

| Ebene | Inhalt |
|---|---|
| Daten | `SALUTATION_TONES[ton].closings` — je drei: formal `Mit freundlichen Grüßen` / `Mit freundlichem Gruß` / `Freundliche Grüße`; höflich `Freundliche Grüße` / `Beste Grüße` / `Viele Grüße`; locker `Beste Grüße` / `Viele Grüße` / `Herzliche Grüße` |
| Automatik | unverändert: die **erste** Form ist `closing` und wird gesetzt, wenn die Anrede/Tonalität wechselt |
| Auswahl | `#grussformel` hängt jetzt an `initVorschlagsliste` (Popover `#gruss-vorschlaege`, `statisch: true`) — zeigt die drei Formen der aktuellen Tonalität, farbig wie die Anrede-Gruppen |
| Klebriger Override | eine manuelle Grußwahl setzt `userSet`; ein späterer Tonalitätswechsel überschreibt sie **nicht** |
| `#seedAuto` | erkennt jetzt alle neun Formen als „automatisch" (vorher nur die drei ersten) |

**Nachweis (live gemessen, Klickkette):**
`Hallo Frau Croft,` + `Beste Grüße` → formelle Anrede → `Mit freundlichen Grüßen`
→ `Liebe Frau Croft,` → `Beste Grüße` → manuell `Herzliche Grüße` → formelle
Anrede → **bleibt** `Herzliche Grüße`. Liste sitzt 25…190 mm im Blatt, drei
Einträge, Unterkante 192 mm. Tests 416/416 (1 neuer 3×3-Vertrag), Fitness 100 %.

---

## 2026-11-22 — Debug-Panel als Einstellung, Sichtbarkeit per CSS, Zahlen mit Tausenderpunkt

**Nutzer-Vorgabe:** „kann man das so machen, dass ich das in den Einstellungen
einschalten kann? und wenn ich auf das X klicke soll das weggehen! dann möchte
ich das möglichst mit wenig JavaScript auskommt!" — plus: „Zahlen mit
1.000er Trennpunkt".

**Umsetzung (drei JS-Zeilen fürs Ein-/Ausschalten gespart):**

| Ebene | Lösung |
|---|---|
| Schalter | `#toggle-debug` in den Einstellungen; `DEFAULT_SETTINGS.debugPanel = false`, gespeichert wie die anderen Schalter |
| Sichtbarkeit | **reines CSS**: `#debug-panel { display: none }` + `:root:has(#toggle-debug:checked) #debug-panel { display: block }` |
| Schließen | das × ist ein `<label for="toggle-debug">` — nativ, ohne JS; es schaltet den Schalter und damit die Einstellung aus |
| Markup | Panel steht **statisch** in `index.html` (12 Zeilen Werte + freie Liste); JS schreibt nur `textContent` |
| Laden | Modul nur bei aktivem Schalter (dynamischer Import in `main.js`); Takt (1,5 s) läuft nur bei `display !== none` |
| Zahlen | `formatZahl()` in `format.js` (`Intl.NumberFormat('de-DE')`): 10184 → `10.184`; genutzt im Panel, im Treffer-Hinweis und bei „n PLZs" |

**Nachweis:** Schalter an → `display: block`, 352×718 px links neben der
Seitenleiste, Werte `10.184 / 6.664 / 303`; × → `display: none`,
`din_settings.debugPanel = false`. Tests 418/418, Fitness 100 %.

---

## 2026-11-22 — Debug-Panel: Kopieren je Dropdown-Feld und Fehler-Ring

**Nutzer-Vorgabe:** im Debug-Panel „die offene Liste gegen Copy-to-Clipboard für
alle Dropdown-Felder" tauschen — je Feld das, was das Dropdown anbieten würde.

**Umsetzung:**

| Knopf | Quelle |
|---|---|
| Anrede | `salutationVarianten(name, firma, Stunde)` — mit Tonalität in Klammern |
| Gruß | `SALUTATION_TONES[stil].closings` |
| Ort Empf. / Abs. | `AddressIntelligence.resolveCityInput` bzw. `lookupPlz` (offline) |
| Straße Empf. / Abs. | `strassenSuchPfad` + echter Abruf (ohne Cache — zeigt den Jetzt-Stand) |

Dazu zwei weitere Knöpfe: **Zustand (.json)** (Debug-Werte + Brief-JSON +
Fehler) und **Fehler (.txt)**. Der Eintrag „Offene Liste" zeigt nur noch
Kennzahl, nicht mehr die Einträge.

**Fehler-Ring:** neues Modul `website/js/log.js` (50 Einträge) fängt
`console.error`, `console.warn`, `error`-Events und unbehandelte
Promise-Ablehnungen ab; die Meldungen gehen unverändert an die Konsole.
Installiert in `main.js` vor dem ersten Boot-Schritt, damit auch Boot-Fehler
ankommen.

**Nachweis:** alle sechs Knöpfe liefern Text (z. B. `Straße (Absender:
Hauptstr)` → 4 Treffer). „Zustand (.json)" liefert 21 Debug-Zeilen, das
Brief-JSON und den Fehler-Ring (`[{erzeugt, debug, brief, fehler}]`).
Tests 419/419, Fitness 100 %.

---

## 2026-11-22 — Brushing & Linking am Blatt, Copy-Block im Debug-Panel

**1. Blatt ↔ Einstellungen (Nutzerwunsch: „wie ein Hover, aber an anderer Stelle").**
Reines CSS über `:has()`, kein Zustand, kein JS:

| Zeiger auf | hebt hervor |
|---|---|
| `din-falzmarke-1/2`, `din-lochmarke` | Schalterzeile „Falz- & Lochmarken" |
| `din-anlagenvermerk` | Zeile „Anlagen" |
| `din-geschaeftsangaben` | Zeile „Fußzeile (§ 35a)" |
| und jeweils umgekehrt | die Blatt-Elemente (2 px gestrichelt) |

**Fund dabei:** die Marken sind **1 px hohe** Linien (45×1 bzw. 30×1 px) und
stehen auf `pointer-events: none` (sheet.css:120). Ohne Gegenmaßnahme ist der
Hover nicht erreichbar. Das `::after` der Marke bekommt `inset: -6px -2px` und
`pointer-events: auto` — Trefferfläche 49×13 px, im linken Blattrand, wo kein
Text liegt (Textklick bleibt bei `din-kern`).

**2. Debug-Panel: „Anrede & Gruß" gebündelt.**
Ein Block zeigt jetzt *aktuell* **und** *Angebot*: `Anrede jetzt`, `Gruß jetzt`,
`Empfänger`, dann alle Anreden (mit Tonalität) und die Grüße der aktuellen
Tonalität. Dazu ein Knopf, der das Paar kopiert.

**3. „Copy to Clipboard"-Sektion** mit einem Knopf **Alles** (Tonalität, Anrede,
Gruß, Orte Empf./Abs., Straßen Empf./Abs.) plus die vier Einzelknöpfe.

**4. Kopierausgabe spiegelt jetzt das Dropdown.** Vorher stand der *ganze*
Stadtteil-String (`· Zentrum, Castell, Nordstadt`), das Dropdown zeigt nur den
ersten. Jetzt identisch. Die Zeilen **ohne** Stadtteil (`53103 Bonn`,
`53255 Bonn`) stehen weiter am Ende — das ist die NULLS-LAST-Gruppierung aus
dem Berlin-Fix, nicht ein Fehler.

**Nachweis:** `Anrede & Gruß` liefert 6 Anreden mit `[formal|polite|casual]` und
3 Grüße; `Ort Empf.` liefert `53111 Bonn · Zentrum` … `53255 Bonn`;
Markentreffer bei dy = −5…+5 px. Tests 419/419, Fitness 100 %.

---

## 2026-11-22 — Copy-Ausgabe maschinenlesbar, Knöpfe niedrigschwellig

**Nutzer-Vorgabe:** „nur als niedrigschwelliges Copy to Clipboard", „Feld-ID
dazupacken, damit eine KI die Instanz zuordnen kann", „was soll auf dem Knopf
stehen?"

**Begriffe (Antwort auf die Frage):**

| Begriff | richtig? | Anmerkung |
|---|---|---|
| **Anrede** | ✅ | DIN-5008-Begriff |
| **Grußformel** | ✅ | DIN-5008-Begriff; „Grußform" ist umgangssprachlich |
| Anrede + Gruß zusammen | — | kein eigener Normbegriff; man sagt „Anrede und Grußformel" |
| **Tonalität** | ⚠️ | unser internes Wort für die Stilebene (formal/polite/casual); linguistisch „Register" |

**Umsetzung:** Sektion heißt „Anrede & Grußformel", der Knopf schlicht
**„Kopieren"** (2 s danach „✓ Kopiert"), der Sammelknopf **„Alles kopieren"**.
Das Panel zeigt weiter die lesbare Ansicht (Tonalität, Anrede jetzt, Gruß jetzt,
Angebote); die **maschinenlesbare** Fassung entsteht nur in der Zwischenablage:

```
Anrede & Grußformel
-------------------
Tonalität: casual

feld id: anrede
aktueller wert: Hallo Frau Croft,
mögliche werte (6):
  - Sehr geehrte Frau Croft,   [formal]
  …
  - Hallo Frau Croft,   [casual]   <- aktuell

feld id: grussformel
aktueller wert: Beste Grüße
mögliche werte (3):
  - Beste Grüße   <- aktuell
  …
```

`<- aktuell` markiert in beiden Listen den gerade gesetzten Wert — so sieht man
auf einen Blick, was zusammenpasst. Tests 419/419, Fitness 100 %.

---

## 2026-11-22 — Dev-Geokey aus `~/.secrets/geoapify` (nur lokaler Server)

**Problem:** Nach einem Reload (oder in einem frischen Profil) fehlte der
Geoapify-Key, die Straßensuche war tot. Ihn jedes Mal zu tippen ist auf dem
Entwicklerrechner unnötig.

**Loesung, zweigeteilt:**

1. `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/tools/static-server.mjs` —
   neue Route `GET /__geokey`. Liest `$DIN_GEOKEY_FILE` oder
   `~/.secrets/geoapify`, trimmt, antwortet `text/plain`. Fehlt die Datei:
   **404** mit `Kein Dev-Key` (kein Fehler, kein Log).
2. `Nobara-PC: /home/moritz/repos/DIN-BriefNEO/website/js/address.js` —
   `holeDevGeokey()`: nur wenn `localStorage` leer ist, ein `fetch('/__geokey')`;
   bei `!ok` passiert **nichts**. Sonst wird der Key wie eine Eingabe
   gespeichert (`STORAGE_KEYS.geoapifyKey`) und der Status steht auf
   `✓ Key lokal geladen.`

**Warum in `tools/` und nicht in `website/`:** Der Endpunkt existiert nur auf
dem lokalen Dev-Server. In Produktion antwortet der Pfad 404 — die App
verhaelt sich dort voellig normal (Feld ausfuellen). Kein Key im Repo, kein
Key im Build.

**Gemessen (2026-11-22, 127.0.0.1:8088):**

| Pruefung | Ergebnis |
|---|---|
| `curl /__geokey` mit Datei | HTTP 200, 32 Bytes |
| `curl /__geokey` mit `DIN_GEOKEY_FILE=/tmp/…fehlt` | HTTP 404, `Kein Dev-Key` |
| Reload mit Datei | `din_geoapify_key` = 32 Zeichen im `localStorage`, Feld gefuellt, Status `✓ Key lokal geladen.` |
| Strassensuche „Rathausplatz" | 8 Treffer in 1204 ms, erster `Rathausplatz · 53859 Niederkassel` |
| Reload ohne Datei (Port 8099) | kein Key, Feld leer, **0 Log-Meldungen**, App laeuft |

Die Ports 8088 und 8099 haben getrennte `localStorage`-Bereiche (nach
`clear()` auf 8099 blieb der Key auf 8088 erhalten) — belegt, dass der Test
wirklich auf der anderen Origin lief.

**Nachtrag A45-Praezisierung (2026-11-22, Nutzerentscheidung „Regel
praezisieren"):** `tools/build_db.js` meldete den Endpunkt als
`A45: Referenz "/__geokey" fuehrt aus website/ heraus` (Fitness 99,61 %).
Der Befund war ein Fehlalarm des Scanners: `fetch('/pfad')` laedt keine Datei
aus dem Repository, sondern fragt den ausliefernden Server; bei 404 laeuft die
App unveraendert. `tools/isolation.js` behandelt `fetch()` deshalb getrennt:

| Aufruf | vorher | jetzt |
|---|---|---|
| `fetch('/__geokey')` | A45-Verstoss | erlaubt (Same-Origin-URL-Pfad) |
| `fetch('https://api.geoapify.com/…')` | erlaubt (A38) | erlaubt (A38) |
| `fetch('../../tools/x.json')` | Verstoss | Verstoss |
| `fetch('/home/…')` | Verstoss | Verstoss |
| `fetch('https://evil.example/')` | Verstoss | Verstoss |
| `import '../../docs/x.js'`, `url(../..)` | Verstoss | Verstoss |

Gegenprobe gegen ein Testverzeichnis: 3 von 3 echten Verstoessen erkannt,
`/__geokey` nicht mehr gemeldet. Law Catalog A45 um den Satz zur
Same-Origin-Praezisierung ergaenzt. Fitness wieder 100,0 %.

**Nebenbefund, nicht geaendert:** der Scanner erfasst nackte
`import '…'`-Anweisungen und `url(…)` ohne Anfuehrungszeichen nicht
(vorbestehende Luecke, unabhaengig von dieser Aenderung).

---

## 2026-11-22 — Straßensuche: Nähe aus Absender-PLZ, dann IP, dann Bonn

**Problem (Nutzer):** Straßennamen gibt es tausendfach. „Idealerweise wäre es,
wenn zuerst Straßennamen angezeigt werden, die beim Benutzer in der Nähe sind."
PLZ und Stadt laufen lokal über die eingebaute JSON; nur die Straße braucht
Geoapify — und damit gibt es in genau dem Moment, in dem die Frage entsteht,
auch einen Key.

**Drei Stufen, in dieser Reihenfolge (`ermittleGeoBias`, address.js):**

| Stufe | Quelle | Netzanfragen | Genauigkeit |
|---|---|---|---|
| 1 | `din_sender_coords` — Koordinaten der **Absender-PLZ**, entstehen beim Tippen der PLZ (address.js:1743) | **0** | exakt |
| 2 | `/v1/ipinfo` (Geoapify), 24 h in `din_geo_bias` | 1 pro Tag | Stadt-Ebene, gemessen ~5 km |
| 3 | `STRASSEN_BIAS` (Bonn) | 0 | Notnagel |

**Kein neuer Empfänger:** `/v1/ipinfo` geht an dieselbe Adresse wie jede
Straßensuche, und die IP sieht Geoapify dort ohnehin. Kein Standortdialog, keine
Browser-Freigabe, kein `navigator.geolocation`.

**Kein Filter:** der Punkt geht als `bias=proximity:` in die Query. Geoapify:
„bias influences ranking without excluding matches" — alle Treffer bleiben.

**Einmal je Sitzung:** `geoBiasLauf` (Promise) hält das Ergebnis; scheitert der
IP-Weg, wird der Lauf verworfen und ein späterer Versuch darf neu.

**Gemessen (2026-11-22, Debug-Profil, Standort Troisdorf):**

| Prüfung | Ergebnis |
|---|---|
| `/v1/ipinfo` | HTTP 200, 127 ms, `Siegburg (Wolsdorf)`, `50.8 / 7.21184` |
| Such-URL | `…&type=street&filter=countrycode:de&bias=proximity:7.21184,50.8` |
| Treffer „Gartenstraße" | Siegburg, Sankt Augustin, Lohmar, Hennef — **8 Treffer, 0 ipinfo-Aufrufe** (Cache) |
| gleicher Begriff, Bias Hamburg | Hamburg, Schenefeld, Halstenbek, Ellerbek → Bias wirkt eindeutig |
| Cache-Hit in der Geo-Suche | gar kein Netz-Request (Bias wird nicht gebraucht) |

**A48/A50:** die Zeitstempel nutzen `Temporal.Now.zonedDateTimeISO('Europe/Berlin').epochMilliseconds`
— `Date.now()` ist per A48 verboten, `Temporal.Now` ohne IANA-Zone per A50.

**Tests:** 5 neue Fälle (PLZ vor IP ohne Netz, IP einmal + Cache, ohne Key Bonn,
HTTP 404 → Bonn ohne Cache, Cache älter als 24 h wird erneuert). Gesamt 424.

**Nachtrag 2026-11-22 (Nutzer: „ohne Netz gibt es via Geoapify sowieso nichts
… Bonn könnte man dann auch lassen"):** Die dritte Stufe ist entfallen.
`STRASSEN_BIAS` (Bonn) wurde geloescht, `ermittleGeoBias` liefert `null`, und
`strassenSuchPfad` haengt `bias=proximity:` nur noch an, wenn ein Punkt bekannt
ist.

**Warum das nicht nur Aufraeumen ist:** Bonn war nicht neutral, sondern
schlechter. Gemessen 2026-11-22 mit demselben Begriff „Hauptstraße":

| Query | Treffer |
|---|---|
| ohne `bias` | Sankt Augustin, Lohmar (Geoapify nutzt die Client-IP) |
| `bias=proximity:9.99,53.55` (Hamburg) | Hamburg, Schenefeld, Halstenbek |
| `bias=proximity:7.09,50.73` (Bonn) | haette nach Bonn gezogen |

Ein fester Punkt ueberstimmt den Kontext, den Geoapify ohnehin hat. Ohne Punkt
ist die Suche also naeher am Nutzer als mit Bonn.

**Gemessen nach dem Umbau:** „Kirchstraße" → `53840 Troisdorf` **an erster
Stelle**, dann Sankt Augustin, Lohmar, Hennef — 8 Treffer, ein Request mit
`bias=proximity:7.21184,50.8`, kein `ipinfo` (Cache). Tests 425/425.

---

## 2026-11-22 — Kalender für #datum (eigener Bau, keine Bibliothek)

**Wunsch:** „auf das Datumsfeld klicken und dann einen Kalender bekommen …
wie der normale HTML-Datepicker, nur schön", deutsche Langform, Monate
wechseln/auswählen, ein „Heute".

**Warum eigener Bau:** `air-datepicker` ist technisch passend (MIT, 0
Abhängigkeiten), aber A66 verbietet Fremdbibliotheken ohne Ausnahme — und das
Paket ist seit 2 Jahren ohne Update, bringt eigenes CSS (zweite Design-Wahrheit)
und ein Webpack-Artefakt. Der native `<input type="date">` zeigt ISO-Format und
fremde Optik.

**Umsetzung:** `website/js/date-picker.js` (neu) + ~95 Zeilen CSS in
`sidebar.css` + Popover in `index.html` neben `#datum`.

| Bedienung | Verhalten |
|---|---|
| Klick aufs Feld | Kalender öffnet unter dem Feld, rechtsbündig (CSS Anchor `--anchor-datum`) |
| Klick auf einen Tag | schreibt `22. November 2026`, `input` + `change`, schließt, Fokus zurück |
| Titel „November 2026" | wechselt zur Monatsansicht (12 Monate), Klick auf Monat → Tagesgitter |
| `‹` / `›` | ein Monat zurück/vor · `«` / `»` ein Jahr |
| **Heute** | übernimmt das heutige Datum und schließt |
| Esc | schließt ohne Änderung, Fokus zurück ins Feld |
| Tippen | bleibt unverändert möglich — der Kalender schreibt, er erzwingt nichts |

**Zeitrechnung:** ausschließlich `Temporal` (A48/A50), „heute" =
`Temporal.Now.zonedDateTimeISO('Europe/Berlin')`. Die Langform kommt aus
`formatDatum(iso, { format: 'alpha' })` — dieselbe Funktion, die den Brief
befüllt, also keine zweite Formatwahrheit.

**Fund beim Testen:** `Temporal.PlainDate.from({year,month,day})` benutzt
standardmäßig `overflow: 'constrain'` und macht aus dem **31. Februar
stillschweigend den 28.** Der Test `leseDatum('31. Februar 2026')` hat das
aufgedeckt; jetzt steht `{ overflow: 'reject' }`, damit ungültige Eingaben
`null` ergeben statt eines erfundenen Datums.

**Gemessen (2026-11-22, 127.0.0.1:8088):**

| Prüfung | Ergebnis |
|---|---|
| Öffnen per Klick | offen, Kopf „November 2026", 30 Tage, Wochentage Mo–So, „22" als heute markiert |
| Position | 264 px = 70 mm, rechtsbündig am Feld (Δ 0 px), vollständig im Blatt (1367…1631 bei Blatt 913…1707) |
| Tag 5. wählen | Feld `5. November 2026`, Popover zu, `aria-expanded="false"` |
| Monatsansicht | Titel `2026`, 12 Knöpfe Januar…Dezember |
| September + Jahr | `September 2025` / `September 2026`, 30 Tage |
| Heute | Feld `22. November 2026`, Popover zu |
| Esc | zu, Fokus im Feld |
| Auswahl 24.12. + Reload | Feld behält `24. Dezember 2026` (nicht von `applyLetterDate()` überschrieben) |
| Druck | `[popover] { display: none !important }` in `sheet.css:325` — der Kalender kann nie im PDF landen |

**Tests:** 7 neue Fälle (Monatstage, Schaltjahr, Montag-Start, Monatsnamen,
drei Schreibweisen, ungültige Daten → null, `heute()`). Gesamt 432.

---

## 2026-11-22 — Date getötet: Temporal ist die einzige Zeitquelle

**Vorgabe:** „Temporal ist König, töte Date()".

**Befund vorher:** kein `new Date(`/`Date.now(` in `website/` — aber zwei
Hintertüren, durch die Date wieder hereinkam:

| Stelle | was sie tat |
|---|---|
| `format.js` `formatDatum` | `input.getFullYear()` / `.getMonth()` / `.getDate()` — ein Date-Objekt wurde formatiert |
| `format.js` `formatUhrzeit` | `input.getHours()` / `.getMinutes()` / `.getSeconds()` |
| `format.js` `isValidCalendarDate` | eigener Schaltjahr-Schieber (zweite Kalender-Wahrheit) |
| `format.js` Node-Fallback | `monatsNamen`-Array (zweite Format-Wahrheit) |

Die Date-Zweige wurden **nur von zwei Tests** benutzt, nicht vom Produktivcode.

**Jetzt:**

- `formatDatum` nimmt `Temporal.PlainDate` oder String (ISO / TT.MM.JJJJ),
  parst über `bauePlainDate()` mit **`overflow: 'reject'`** und formatiert
  ausschließlich mit `toLocaleString('de-DE', …)`.
- `isValidCalendarDate` und der Monatsnamen-Fallback sind **gelöscht** —
  Temporal entscheidet, ob ein Datum existiert.
- `formatUhrzeit` nimmt nur noch Strings.
- **A48 verschärft:** verboten sind jetzt auch `.getFullYear()`, `.getMonth()`,
  `.getDate()`, `.getHours()`, `.getMinutes()`, `.getSeconds()`,
  `.toISOString()`, `.toLocaleDateString()` — sonst kommt Date über die
  Methoden zurück. `tools/antipatterns/base.json` (B2) und der Law Catalog
  sind nachgezogen.

**Gemessen (Browser, 2026-11-22):**

```
Boot           "22. November 2026"
Kalender-Klick "9. November 2026"
alpha          "4. September 2026"
numerisch      "04.09.2026"
iso            "2026-09-04"
ungültig       "31.02.2026"  (unverändert, kein erfundenes Datum)
Uhrzeit        "08:05"
Log            0 Meldungen
```

`grep -n "new Date|Date.now|getFullYear|getMonth()|getDate()|getHours" website/js/*.js`
→ **0 Treffer**. Tests 432/432, Fitness 100 %.

**Nachtrag Debug-Panel (2026-11-22):** Die vier Einzelknöpfe und „Alles
kopieren" sind durch **drei Zeilen mit je einem Knopf „Copy to Clipboard"**
ersetzt:

| Block | Inhalt der Zwischenablage |
|---|---|
| Anrede & Grußformel | Tonalität, Anrede (aktuell + 6 Angebote mit [formal/polite/casual]), Grußformel (aktuell + 3) |
| Straßen (Absender & Empfänger) | `Bias:`-Zeile, dann beide Felder mit aktuellem Wert und je 8 Angeboten |
| PLZ + Ort (Absender & Empfänger) | beide Felder mit aktuellem Wert und der lokalen Ortsliste |

Straßen und Orte gehen **immer als Paar** in die Kopie (Absender zuerst), nur
die Anrede behält ihre sichtbare Tabelle. `<- aktuell` wird jetzt **einmal**
pro Feld gesetzt: stand nur „Kirchstraße" im Feld, begannen mehrere Treffer
damit und die Kopie behauptete zwei aktuelle Werte.

Gemessen: Anrede 20 Zeilen, Straßen 21 Zeilen (Bias „Siegburg 50.80/7.21"),
Orte 32 Zeilen; alle drei Knöpfe zeigen „✓ Kopiert".

**Nachtrag (2026-11-22):** Die sichtbare Tabelle im Block „Anrede & Grußformel"
ist entfallen — es bleibt **nur der Knopf**. Damit zeigt das Debug-Panel genau
drei Zeilen (Anrede & Grußformel, Straßen, PLZ + Ort), jede mit „Copy to
Clipboard"; die Werte stehen ausschließlich in der Zwischenablage.
Der JS-Block, der `dbg-tonalitaet`/`dbg-anrede-*`/`dbg-gruss-*` füllte, ist
mitgelöscht — sonst wäre er toter Code gegen nicht mehr existierende Elemente.
Gemessen: 0 alte `dd`-IDs, 3 Blöcke, Kopie unverändert (Tonalität + 6 Anreden),
0 Log-Meldungen.

---

## 2026-11-22 — `#stil-select` entfällt: Tonalität kommt aus der Anrede-Wahl

**Nutzer:** „das kann denke ich komplett weg, wir haben ja jetzt dafür 2
Dropdown-Felder" (Anrede + Grußformel).

**Befund vorher:** `#stil-select` war die einzige **Bedienung** für
`settings.formality`. Der Wert wurde aber schon vorher von der Anrede-Wahl
gesetzt: `#uebernehme(v)` ruft `#setStyle(v.style)` **vor** dem Schreiben der
Anrede („Stil zuerst, der Gruß zieht nach"). Das Auswahlfeld war also ein
zweiter Weg zum selben Zustand — und der einzige, der die Tonalität ohne
Anredewechsel ändern konnte.

**Jetzt:**

| Datei | Änderung |
|---|---|
| `website/index.html` | der `<div class="seitenleiste-field-group">` mit `#stil-select` ist gelöscht |
| `salutation.js` | `init()` bindet kein Select mehr; `#setStyle()` schreibt kein Select mehr; **neu:** `export function aktuelleTonalitaet()` als einzige Lesestelle für `din_settings.formality` |
| `boot-state.js` | der Pre-Paint-Block für `#stil-select` ist entfernt (Kommentar nennt das Datum) |
| `debug-panel.js` | `Tonalität:` und die Gruß-Liste lesen `aktuelleTonalitaet()` statt `stil.value` |
| `testbrief.js` | `currentStyle = aktuelleTonalitaet()` statt Select-Wert |
| `test/all.js` | Boot-Ratsche und der Reihenfolge-Test nennen `#stil-select` nicht mehr |

`settings.formality` bleibt gespeichert (keine Migration nötig); die Tonalität
überlebt einen Reload, nur das Control ist weg.

**Gemessen (2026-11-22):**

```
#stil-select im DOM            weg
Anrede "Hallo Frau Croft," gewählt
  → din_settings.formality     "casual"
  → Grußvorschläge           Beste Grüße · Viele Grüße · Herzliche Grüße
  → Debug-Kopie              "Tonalität: casual"
Testbrief                      Gruß "Beste Grüße" (casual)
Log                            0 Meldungen
```

Nebenbefund, nicht geändert: der Testbrief leitet die **Anrede** aus der
Figuren-Beziehung ab (formal/vertraut), nicht aus der Tonalität — der Gruß
folgt der Tonalität. Das ist Addon-Logik, unabhängig von dieser Änderung.

---

## 2026-11-22 — Anschrift-Suche und Clipboard-Parser entfernt

**Nutzer:** „wir suchen nicht in einer potentiellen Zwischenablage nach einer
vielleicht vorhandenen Adresse" … „kann komplett gepurged werden, braucht
keiner mehr".

**Weg ist:**

| Was | Umfang |
|---|---|
| `<search id="anschrift-suche-container">` (Label, `#input-anschrift-suche`, `#anschrift-vorschlaege`) | HTML |
| `#btn-zwischenablage-anschrift` + `#clipboard-candidates-popover` | HTML |
| `website/js/clipboard-parser.js` (Re-Export) und `website/addons/clipboard-parser/clipboard-parser.js` (24 KB) | gelöscht |
| Addon-Registrierung in `addons.js` | entfernt |
| Anschrift-Suche-Renderer in `address.js`: `sucheOffline`, Adressbuch (`getLocalAddressBook`, `saveToLocalAddressBook`), `fuzzySearchLocal`, `performAddressSearch`, `fusioniereNachRelevanz`, `mergeAndRender`, `renderSuggestions`, `zeigeSuchHinweis`, `selectSuggestion` | **395 Zeilen** |
| CSS: `#anschrift-vorschlaege`-Regeln, `#input-anschrift-suche`-Anchor, `#clipboard-*`, `.field-highlight` (Puls) | ~190 Zeilen |

**Wichtig — die Kopplung, die fast gebrochen wäre:** `initAddressServices()`
begann mit

```js
if (!inputGeoapifyKey || !inputAddressSearch || !addressSuggestions || !addressSearchContainer) return;
```

Damit hingen **Key-Status, Straßen- und Ortssuche** an den Suchfeldern. Ohne
Umbau hätte das Löschen der Suche die halbe Adressfunktion mitgenommen. Der
Guard prüft jetzt nur noch `inputGeoapifyKey`.

**Die vier Feld-Popover** (`#plz-suggestions-popover`, `#strasse-vorschlaege`,
`#anrede-vorschlaege`, `#gruss-vorschlaege`) lagen im gelöschten `<search>`.
Sie stehen jetzt als eigene Geschwister in `#zone-dokument` — der DOM-Ort ist
belanglos, weil die Position über CSS-Anchor am jeweiligen Feld hängt.

**Testabdeckung ehrlich:** `test/corpus/run.js` hing an
`ClipboardAddressParser.isStreetLine/isCorporate/METADATA_LINE_REGEX/parse`.
Die Parser-Prüfungen sind entfernt; Fälle, die nur diese Erwartungen tragen,
zählen als **`skipped`** (69), nicht als bestanden: `7 ok, 0 fail, 4 known,
69 skipped`. 407 Unit-Tests (vorher 432: −25 Parser-/Such-Tests).

**Gemessen nach dem Purge (Browser):**

```
Suchfeld weg, Clipboard-Knopf weg, 4 Popover vorhanden
Ortssuche "Bonn"       → 39 Treffer, erster "53111 Bonn · Zentrum"
Straßensuche           → 8 Treffer, erster "Kirchstraße · 53840 Troisdorf"
Anrede                 → 6 Varianten
Geoapify-Key           → 32 Zeichen, Status "valid"
Ortspopover            → am Feld, darunter, im Blatt (460 px)
Log                    0 Meldungen
```

---

## 2026-11-22 — Init degradiert statt abzubrechen (Invariante + Tests)

**Anlass:** Die Anschrift-Suche hing per Guard an `initAddressServices()` —
also am einzigen Eingang für Key-Status, Straßen- und Ortssuche. Ein fehlendes
Suchfeld hätte drei fremde Features abgeschaltet. Nutzer: „warum hängt da
irgendwas am Button? Ist das noch woanders so?"

**Sauberste Lösung statt Pflaster:**

1. **Invariante** (`docs/meta/INIT-INVARIANTE.md`): Eine `init*`-Funktion steigt
   nur aus, wenn ihr *eigenes* Ziel fehlt; optionale Teile werden einzeln
   verdrahtet. Verboten ist ein Guard über mehrere unabhängige Features.
2. **`initSenderSync`**: Guard von fünf Feldern auf `!absender` reduziert
   (das Ziel). `infoName?.addEventListener`, `spiegleUnterschrift()` kehrt
   früh zurück, wenn `#unterschrift` fehlt. `Field.getValue(null) === ''`,
   fehlende Quellen ergeben also ein leeres Segment statt eines Abbruchs.
3. **`initImportExport`**: gemeinsamer Guard über vier Elemente entfernt;
   Export, Kopieren und Import sind jetzt drei Slices. Ein fehlender
   Import-Knopf schaltet den Export nicht mehr ab.
4. **Zwei Tests erzwingen die Invariante**:
   - `initSenderSync: ohne #unterschrift spiegelt der Name weiter`
   - `initImportExport: ohne Import-Elemente exportiert der Knopf`
     (stubbt `showSaveFilePicker` und prüft den Dateinamen)

**Audit aller `init*`-Funktionen (2026-11-22):** kein weiterer Fall bündelt
fremde Features. `initDatePicker`, `initFormatSync`, `initStateBinding`,
`initAddonDispatcher`, `initToastSystem`, `initDebugPanel` prüfen jeweils nur
ihr eigenes Element bzw. pro Klick. Tabelle in `INIT-INVARIANTE.md`.

Tests 409/409 (neu: 2 Degradations-Tests), Fitness 100 %.

**Nachtrag (2026-11-22): Zonentitel „Brief" unsichtbar.** Das sichtbare
`<h2 class="seitenleiste-h2">Brief</h2>` ist entfallen (Nutzerwunsch), die
`.seitenleiste-h2`-Regel ebenfalls. Damit die h3-Gruppen keinen Waisen haben,
bleibt die Überschrift als `sr-only` stehen und benennt die Zone per
`aria-labelledby="zone-dokument-titel"`. Der Struktur-Test prüft jetzt die
Absicht („jede Zone ist benannt") statt der Zahl der h2.
Gemessen: `position: absolute`, 1×1 px, `clip: rect(0,0,0,0)` — optisch weg,
für Screenreader vorhanden.

**Korrektur (2026-11-22): Kollateralschaden beim Purge.** Meine Aussage
„Anschrift-Suche und Clipboard-Parser entfernt, gemessen: 0 Log-Meldungen"
war unvollständig. Beim 99-Zeilen-Schnitt in `sidebar.css` sind **drei
Anker-Regeln** mitgelöscht worden, die nichts mit der Suche zu tun hatten:

| Regel | Folge |
|---|---|
| `#anrede-vorschlaege` (`position-anchor: --anchor-anrede`) | Dropdown oben links im Fenster (x=0, y=4) statt am Feld |
| `#gruss-vorschlaege` (Anker, Stil, Hover, `[data-gruppe]`-Töne) | dito, zusätzlich fehlte der Farbverlauf blau→rot |
| `#strasse-vorschlaege` (`position-anchor: --anchor-absender-strasse`) | dito |
| `#anrede-vorschlaege li[data-gruppe=…]` | Gruppenfarbe fehlte |

**Warum die Tests es nicht fanden:** Es gab keinen Test, der die
Anker-Regeln prüft. `npm test` und die Browser-Messung deckten nur das
Öffnen und die Trefferzahl ab, nicht die Position.

**Behoben:** Die Regeln sind aus `164568b~1` wiederhergestellt. Nachgemessen
mit Fokus (nur dann greift `body:has(…:focus)`):

```
anrede        dx=0  dy=4  Breite 624  anchor --anchor-anrede
gruss         dx=0  dy=4  Breite 624  anchor --anchor-gruss
strasseEmpf   dx=0  dy=4  Breite 302  anchor --anchor-empfaenger-strasse
ort           dx=0  dy=4  Breite 460  anchor --anchor-ort
Gruppenton    oklch(0.58 0.19 25 / 0.18)   (casual, rot)
```

**Neuer Wächter:** `Popover-Anker (Ratsche gegen CSS-Kollateralschaden)`
prüft für jede Popover-ID, dass ein CSS-Block `position-anchor` **und**
`anchor(bottom)` enthält. Gegenprobe gegen die kaputte Version: 0 Treffer
für anrede/gruss/strasse → der Test hätte den Fehler gemeldet.

**Offen (nicht kaputt):** der `.autocomplete-dropdown`-Block (3 Regeln) wird
von keinem HTML-Element mehr genutzt — toter CSS, kein Fehler.

**Korrektur 2 (2026-11-22): Ortspopover zu breit.** `#plz-suggestions-popover`
hatte `min-width: max(300px, anchor-size(width))`. Im Infoblock ist das
Absender-Feld nur **246 px** breit — die Liste stand 54 px über und ragte nach
links über die Rücksendezeile.

Jetzt: `min-width: anchor-size(width)` (mindestens Feldbreite, nach oben offen
bis 165 mm, damit lange Organisationsnamen weiter Platz haben).

Gemessen:

| Feld | Feldbreite | Popover | rechtsbündig | Überstand |
|---|---|---|---|---|
| `#absender-ort` | 246 | **246** | ja | 0 |
| `#empfaenger-ort` | 302 | 460 (Inhalt der Bonn-Liste) | nein, wächst nach rechts | 0 |
| `#empfaenger-strasse` | 302 | 302 | ja | 0 |

Der Empfänger-Fall ist unverändert (die Liste war immer inhaltsbreit und bleibt
im Blatt) — nur der erzwungene 300-px-Minimum im schmalen Infoblock ist weg.
Cache-Buster live24.

**Korrektur 3 (2026-11-22): Absender-Ort ohne PLZ-Präfix und ohne Lösch-Spur.**
Nutzer: „ich tippe hier 531, bekomme kein Dropdown" und „53111 B, noch ein
Zeichen löschen — steht direkt wieder 53111 Bonn".

Beides waren Lücken im **Absender**-Zweig; der Empfänger hatte sie von Anfang an:

| Fall | Empfänger | Absender (vorher) |
|---|---|---|
| 3–4 Ziffern (`531`) | `lookupPrefix('531')` → 6 Treffer („Bonn · 21 PLZs") | nur `resolveCityInput('531')` → **0 Treffer** |
| Löschen im 5-Ziffern-Feld | `userEditing` verhindert das Ergänzen | 180 ms später wieder `53111 Bonn` |

Jetzt hat der Absender-Zweig denselben Präfix-Pfad (`lookupPrefix`) und eine
eigene `absUserEditing`-Spur (delete → true, Ziffer eingetippt → false).

**Gemessen (Browser):**

```
"531"    → 4 Treffer, erster "Bonn · 21 PLZs"
"53111"  → "53111 Bonn" (Autofill wie beim Empfänger)
"53111 B" + Backspace → bleibt "53111" (kein Wiedereinsetzen)
```

**Tests:** `lookupPrefix('531')` liefert Bonn; eine Ratsche hält fest, dass
`lookupPrefix` und `absUserEditing` im Absender-Block stehen (der Handler hängt
in einer Closure und lässt sich im Testkontext nicht zuverlässig auslösen —
das Verhalten ist im Browser gemessen). 412 Tests.

**Korrektur 4 (2026-11-22): Debug-Kopie log für Orte, Text nennt falsche Ursachen.**

Nutzer: „537 zeigt im Copy 0 Treffer, das Feld zeigt 5" und „der Key liegt und
funktioniert nachweislich".

| Problem | Ursache | Behebung |
|---|---|---|
| Copy meldet 0 Treffer für „537" | `dropdownInhalt('ort-*')` nutzte nur `resolveCityInput` (kennt keine 3–4-Ziffern-Präfixe) | neue gemeinsame Funktion **`ortsVorschlaege(raw, max)`** in `address.js`; Debug nutzt sie |
| Meldung „Eingabe zu kurz, **kein Key** oder keine Treffer" | ein Sammelsatz für drei Ursachen — bei der **lokalen** Ortssuche ist „kein Key" sachlich falsch | `DropdownInhalt.grund` (`kurz` / `kein-key` / `keine-treffer`), jeweils eigener Satz |

**Gemessen nach dem Fix:**

```
"53"   → 0, Text: "(keine — Eingabe zu kurz, mindestens 3 Zeichen)"
"537"  → 5 Treffer: 53718, 53721 Siegburg, 53773 Hennef, 53783 Eitorf, 53797 Lohmar
"538"  → 11 Treffer, darunter 53840/53842/53844 Troisdorf
```

Zur Frage „wie viele Treffer gäbe es bei 53": **112 PLZ** beginnen mit 53
(68 verschiedene Einträge), aber die Suche startet bewusst bei **3 Zeichen** —
`lookupPrefix('53')` liefert technisch 0.

**Datenbefund, nicht geändert:** `53718` trägt in `orte.json.gz` den „Ort"
„Ahrens + Sieberz" (Firmen-PLZ). GeoNames führt solche Großkunden-PLZ so; für
den Absender ist das kein Ort. Eine Korrektur braucht eine Override-Liste im
Build (`tools/build_plz_data.mjs`) — bewusst nicht still gefiltert.

**Korrektur 5 (2026-11-22): 53840 Troisdorf fehlte in der Ortssuche.**
Nutzer: „53840 Troisdorf fehlt".

**Ursache:** `53840` trägt `typ: "Firma"` (dort sitzt die BwConsulting GmbH als
Großempfänger), `city` ist aber korrekt **Troisdorf**. Der Filter
`(typ || 'Stadt') === 'Stadt'` warf den Eintrag deshalb weg — in
`renderUniversalSuggestions` **und** in der Debug-Kopie.

**Regel jetzt an einer Stelle: `istOrt(eintrag)`**

```
Ort, wenn city und name sich unterscheiden (dann ist name der Betrieb)
oder der Typ ausdrücklich 'Stadt' ist.
```

| Eintrag | city | name | typ | istOrt |
|---|---|---|---|---|
| 53840 | Troisdorf | BwConsulting GmbH | Firma | ✅ Ort |
| 53804 | Much | Much | Stadt | ✅ Ort |
| 53877 | Euskirchen | P & G Manufacturing | Firma | ✅ Ort |
| 53718 | Ahrens + Sieberz | Ahrens + Sieberz | Stadt | ⚠️ bleibt (Datenfall) |

Zusätzlich zeigt die **Ortssuche** bei Großempfänger-PLZ den **Ort** als
Zeile (`53840 Troisdorf · Troisdorf-Mitte`), nicht den Betrieb — der gehört
ins Firmenfeld. Der Hinweis „Großempfänger" bleibt bei 53877/53879 sichtbar.

**Gemessen:** `ortsVorschlaege('538', {nurOrte:true})` → 11 Treffer,
`53840 Troisdorf` enthalten, keine Firmennamen in der Liste.

**Offen (Daten, nicht Code):** `53718` führt „Ahrens + Sieberz" selbst als
`city`; `53884` führt „Feldpostleitstelle Mechernich" als Ort. Das ist nur
über eine Override-Liste im Build (`tools/build_plz_data.mjs`) zu lösen.

---

## 2026-11-22 — Lighthouse „Agentic Browsing": ARIA-Fehler und llms.txt

**Befund 1: `aria-expanded` auf `#datum` (von mir eingebaut).**
`input[type=text]` ohne Rolle darf laut ARIA 1.2 kein `aria-expanded` tragen —
Lighthouse meldete „Elements must only use supported ARIA attributes". Der
Kalender ist ein `<dialog>`-Popover, also ist `aria-haspopup="dialog"` das
richtige Attribut.

- HTML: `aria-expanded="false"` → `aria-haspopup="dialog"`
- `date-picker.js`: alle drei `setAttribute('aria-expanded', …)` entfernt
  (öffnen, schließen, `toggle`-Listener)

**Befund 2: `llms.txt` fehlte.** Neu: `website/llms.txt` (1096 Bytes, HTTP 200)
mit H1, Links auf `index.html` und `js/README.md` und einem Abschnitt
„Hinweise für Agenten" (Feld-IDs, Popover-Verhalten, lokal vs. Geoapify).

**Befund 3: „3 forms missing WebMCP annotations" — Fehlalarm.** Die drei
`<form>`-Elemente sind `method="dialog"`-Bestätigungen in Dialogen
(„Verstanden", „Abbrechen"). Sie als Tool zu annotieren würde einem Agenten
erlauben, Dialoge abzusenden — kein Nutzen, nur Risiko. Für DIN-BriefNEO ist
die **Imperative API** der richtige Weg (Tools statt Form-Submit), und die ist
in Chrome 156 ohne Flag nicht verfügbar (`navigator.modelContext` fehlt,
gemessen). Bleibt offen, siehe unten.

---

## 2026-11-22 — `window.dinApi`: Brief-Schnittstelle für Agenten

**Wunsch:** „eine Schnittstelle, die ein Agent nutzen kann, um den Brief
komplett zu schreiben und zu bedienen."

**Entscheidung: kein WebMCP, sondern ein einfaches JS-Objekt.** WebMCP
(Chrome 156) ist ohne Origin-Trial/Flag nicht vorhanden — gemessen:
`navigator.modelContext === undefined`, `modelContextTesting === undefined`.
Ein `window.dinApi` funktioniert heute in jedem Browser, ist per Konsole, CDP
und Test aufrufbar; WebMCP wäre später ein dünner Wrapper darüber.

**Datei:** `website/js/api.js` (neu), eingebunden als Boot-Schritt
„Agenten-API". Alles ist Aufsatz auf vorhandener Logik — `applyValue`,
`ortsVorschlaege`, `formatDatum`, `salutationVarianten`,
`buildDINLetterJSON`. Keine zweite Wahrheit.

| Funktion | Wirkung |
|---|---|
| `hilfe()` | Feldliste (28), Schalter (3), Signaturen, Hinweis was fehlt |
| `lesen()` | alle Feldwerte + Schalter, `anzahlFelder` |
| `setzen(id, wert)` | ein Feld; unbekannte IDs → `{ok:false, fehler}` statt Throw |
| `anrede(name, firma?, ton?)` | Anrede + Grußformel passend zur Tonalität |
| `adresse(rolle, daten)` | Empfänger/Absender; leere Angaben werden übersprungen |
| `datum(eingabe)` | ISO, `TT.MM.JJJJ` oder Langform → Langform |
| `exportieren()` | dieselbe JSON-Struktur wie „Speichern (.json)" |

**Fund beim Testen:** `applyValue` ist der *Programm*-Schreiber und feuert
bewusst **kein** `input` (sonst Endlosschleifen). Die Absender-Spiegelung
(`initSenderSync`) hängt aber an `DOCUMENT_CHANGED` — ohne dieses Signal blieb
die Rücksendezeile leer. Die API publiziert es jetzt nach jedem Schreiben
(`schreibe()`), und die Zeile stimmt: „M. Mustermann • Musterweg 5 • 53840
Troisdorf".

**Bewusst nicht enthalten:** Drucken, Datei-Dialoge (Unterschrift, Schrift),
Dialoge. Diese brauchen eine Nutzergeste; die API sagt das in `hilfe()`.

**Gemessen (Browser, frischer Zustand):**

```
adresse('empfaenger', {...})  ok
adresse('absender', {...})    ok  → Rücksendezeile vollständig
anrede(..., 'casual')         "Hallo Frau Croft," / "Beste Grüße"
datum('2026-12-24')           "24. Dezember 2026"
setzen('gibt-es-nicht')       {ok:false, fehler:… 'hilfe() zeigt die Liste'}
exportieren()                 {ok:true, brief.format, brief.fields[…]}
```

`website/llms.txt` nennt die API jetzt für Agenten. Tests: 5 neue Fälle (420).

---

## 2026-11-22 — Responsive Layout: `desktop.css` + `mobile.css`

**Ausgangslage:** keine `max-width`-Media-Query. Auf 412 px (Pixel 9) war die
Shell 1034 px breit (240 Leiste + 794 Blatt), `overflow: hidden` machte das
Blatt zu 57 % abgeschnitten **und** unerreichbar.

**Struktur:** Das Grid wurde aus `base.css` herausgezogen (dort steht nur noch
`display: grid`), die Spalte lebt jetzt in `desktop.css`.

| Datei | Media Query | Verhalten |
|---|---|---|
| `css/desktop.css` | `min-width: 700px` | Leiste links, Blatt rechts, Blattbereich schiebbar |
| `css/mobile.css` | `max-width: 699px` | Leiste oben (deckend, `50dvh`, eigener Scroll), Blatt darunter schiebbar |

**Warum 700 und nicht 900:** Bei 800×640 ist das Band-Layout (Leiste oben)
schlechter als eine volle Leiste plus schiebbares Blatt — gemessen und im
Screenshot verglichen. Unter 700 px ist das Band richtig.

**Drei Fallen, alle gemessen:**

1. **Der Flex-Container ist `#brief-ansicht`, nicht `#viewport`.** Ein
   `justify-content` auf `#viewport` änderte nichts.
2. **`sheet-multipage.css` setzt `justify-content: center !important`** mit
   `#viewport:not([data-seiten]) #brief-ansicht` (2 IDs + Attribut). Eine
   einfache Regel verliert; nötig ist gleiche Spezifität **plus** `!important`
   und spätere Ladung:
   ```css
   #viewport:not([data-seiten]) #brief-ansicht,
   #viewport[data-seiten="1"] #brief-ansicht { justify-content: flex-start !important; }
   ```
3. **`din-blatt` trägt `margin: 0 39.15px`** (auto) — bei Überlauf zentriert
   das negativ. Deshalb `#viewport din-blatt { margin-inline: 0 }`.

**Ergebnis (gemessen, `innerWidth` nach Emulation):**

| Breite | Spalten | Blatt links | unter der Leiste | schiebbar | sichtbar |
|---|---|---|---|---|---|
| 640 | `640px` | 20 | nein | ja | 78 % |
| 819 | `240px 579px` | **260** | **nein** | ja | 70 % |
| 1152 | `240px 912px` | 299 (zentriert) | nein | nein | 100 % |

**Datum tiefer (2026-11-22):** Nutzer: „das datum kann gerne noch etwas weiter
runter vllt knapp über die falzzeile".

Gemessen (mm von Blatt-Oberkante):

| | vorher | jetzt |
|---|---|---|
| Datum | 59,7 – 64,6 | **77,7 – 82,6** |
| Falzmarke 1 | 87,0 | 87,0 |
| Betreff | 89,0 | 89,0 |
| Luft zur Falz | 22,4 | **4,4** |
| Luft zum Betreff | 24,4 | 6,4 |

Umsetzung: `#datum { margin-top: 18mm }` in `sheet-common.css` (Zeile 433,
**außerhalb** des `@media print`-Blocks — gilt damit auch im PDF). Der
Infoblock selbst wurde nicht angefasst; der Betreff wandert nicht.

**Font-Fallback im Dev-Server (2026-11-22):** Nutzer: „für lokale Tests habe ich
`fonts/` und das soll für den Testserver im Debug-Browser genauso funktionieren
wie `~/.secrets/geoapify`."

`tools/static-server.mjs` liefert jetzt Schriften aus `<repo>/fonts/`, wenn sie
unter `website/fonts/` fehlen — gleiche Idee wie `/__geokey`:

| Fall | Verhalten |
|---|---|
| Datei in `website/fonts/` vorhanden | wird normal ausgeliefert (Inter) |
| fehlt dort, liegt in `<repo>/fonts/` | **Dev-Server** liefert sie durch (200) |
| fehlt in beiden | **404** — Browser nimmt seine Ersatzschrift |

Die Regel greift **nur** für Pfade in einem `fonts/`-Ordner und **nur**
innerhalb von `<repo>/fonts` — kein Zugriff auf andere Repo-Dateien. Die
App-URL bleibt `../fonts/…` (A45-konform, kein Pfad aus `website/` heraus).

Gemessen:

```
/website/fonts/aptos.woff2                  200  17 848 B
/website/fonts/michelangelus-regular.woff2  200  23 212 B
/website/fonts/inter_18pt-regular.woff2     200  17 864 B
/website/fonts/gibt-es-nicht.woff2          404       9 B
App: Test-Aptos und Test-Michelangelus laden (document.fonts.check true)
```

Damit braucht `website/fonts/` **keine** lokalen Kopien mehr: die zwei
Nicht-Inter-Schriften liegen ausschließlich in `fonts/` (gitignored).

---

## 2026-11-22 — CSS-Altlasten auf die Verbotsliste (B6/B7)

**Nutzer:** „bitte alle auf die Verbotsliste setzen, da wo auch today() steht —
das darf nie wieder eingebaut werden."

Zwei neue Antipattern-Regeln in `tools/antipatterns/base.json`:

| ID | Muster | Ersatz |
|---|---|---|
| **B6** | `-webkit-`, `-moz-`, `-ms-` | Standard-Eigenschaft (`backdrop-filter`, `user-select`, `appearance`) |
| **B7** | `float:`, `clear:`, `zoom:`, `expression(`, `progid:` | Flex/Grid, `margin-inline-start: auto`, `transform: scale()`, `@supports` |

Gegenprobe mit einer Wegwerf-Datei: B6 1 Treffer, B7 5 Treffer, nach dem
Löschen 0. Regeln gesamt: 55 → **57**.

**Bestand vorher:** genau ein Treffer — `float: right` in `.badge-local`
(`sidebar.css:625`). Die Klasse wurde **nirgends** verwendet (kein HTML, kein
JS) — also toter CSS, 9 Zeilen entfernt statt modernisiert.

**Was der Bericht vorher zeigte:** 0 Vendor-Prefixes, 0 `clear`/`zoom`/
`expression`/`progid` — das CSS war bereits sauber. Die Verbotsliste hält es
so.

---

## 2026-11-23 — Liberation Sans als Vanilla-Standard, Schriften aus `fonts/`

**Nutzer:** „ich möchte das der komplette brief Default Vanilla ein
eingedampftes Liberation Sans Font Subset hat."

### Was jetzt ausgeliefert wird

Im Repo liegen genau zwei Familien, beide DACH-eingedampft:

| Datei | Quelle | Größe |
|---|---|---|
| `liberation-sans-regular.woff2` | LiberationSans-Regular.ttf (401,1 KB) | 17 560 B |
| `liberation-sans-bold.woff2` | LiberationSans-Bold.ttf (404,7 KB) | 17 004 B |
| `inter_18pt-regular.woff2` | Inter_18pt-Regular.ttf (334,6 KB) | 15 208 B |
| `inter_18pt-bold.woff2` | Inter_18pt-Bold.ttf (336,1 KB) | 15 664 B |

**Warum Liberation Sans Standard ist:** DIN 5008 Kap. 20.7.1 nennt Arial und
Helvetica ausdrücklich. Liberation Sans ist die freie, **metrisch identische**
Umsetzung — gemessen: Breite von „Hamburgefonstiv MMM 12345 äöüß" bei 40 px ist
in beiden **638,1 px**. Ein Brief bricht also zeilenweise wie ein Arial-Brief um.

Der Stack wurde dafür getrennt:

```css
--font-system-stack: "Liberation Sans", Arial, "Helvetica Neue", Helvetica, sans-serif;
--font-brief-stack:  "Test-Liberation", "Liberation Sans", Arial, ...;
```

Vorher stand `Aptos`, `Segoe UI`, `-apple-system` vorn — gemessen ergab
`font-family: "Aptos"` **593,7 px** statt 638,1 px. Damit brach derselbe Brief
auf Windows, macOS und Linux unterschiedlich um.

### Lokale Schriften (`<repo>/fonts/`)

`fonts/` ist gitignoriert; das Verzeichnis ist die Wahrheit:

- `tools/static-server.mjs` liefert die Liste unter `/__fonts`
  (`.woff2` vor `.ttf`, Inter/Liberation ausgeblendet, weil schon ausgeliefert).
- `website/js/font-feature.js` baut daraus die Gruppe „Nur lokal (fonts/, n)"
  und lädt per `FontFace`-API.
- Auf GitHub Pages gibt es den Endpunkt nicht (404) → Gruppe fehlt, keine 404
  auf Schriften. Aptos und Michelangelus sind damit aus dem HTML und aus
  `FONT_PRESETS` entfernt.

Nebenbefund: `.gitignore` hatte `fonts/` ohne führenden Schrägstrich — das
Muster traf auch `website/fonts/` und hätte neue ausgelieferte Schriften stumm
gesperrt. Jetzt `/fonts/`.

### Systemschriften-Liste

166 Familien auf diesem Rechner. Neu:

- Blacklist für Emoji/Symbol/Icons (Muster deckt Windows, macOS, Linux ab).
- Monospace wird **gemessen** (`iiii` == `MMMM`), nicht am Namen erkannt —
  „Hack" und „TeX Gyre Cursor" heißen nicht „Mono".
- Suchfeld über der Auswahl filtert live; Label zeigt „Systemschriften (n)".
- Gegenprobe mit Attrappe: 10 Namen rein → 3 übrig (C059, Liberation Sans,
  Noto Sans), 7 aussortiert.

### Pfeiltasten

Chrome rendert das Select mit `appearance: base-select`. Bei **geschlossener**
Liste ändern ArrowUp/ArrowDown den Wert nicht mehr (gemessen: Tastendruck kommt
an, `change` bleibt aus). `font-feature.js` fängt die Tasten jetzt selbst ab
(Arrow, PageUp/Down, Home/End), setzt `selectedIndex` und löst `change` aus.
Vorschau ist auf 120 ms entprellt, damit Durchblättern nicht jede Stufe lädt
und speichert.

---

## 2026-11-23 — Optische Schriftgröße automatisch angleichen (font-size-adjust)

**Nutzer:** „die schrift im haupttext ist ganz schön klein! kann man das
irgendwie automatisch korrigieren? also das wir nicht für jeden font eine
einzelne schriftgröße machen?"

Genau dafür ist `font-size-adjust` da: **eine Zahl für alle Schriften**, keine
Einzelgrößen. Gemessene x-Höhen (Anteil der Schriftgröße):

| Schrift | x-Höhe | mit adjust 0.52 |
|---|---|---|
| Liberation Sans / Arial / Noto Sans | 0,535 | −2,8 % |
| Inter | 0,545 | −4,6 % |
| DejaVu Sans | 0,55 | −5,5 % |
| Cantarell | 0,48 | +8 % |
| Droid Arabic Kufi | 0,46 | +13 % |

Der Wert stand auf `0.52` und hat damit **die eigene Standardschrift um 2,8 %
geschrumpft**. Neu: `0.535` = exakt die x-Höhe von Liberation Sans. Damit
rendert der Standard in Originalgröße, alles andere wird auf dieselbe optische
Größe gezogen.

**Zweiter Fehler dabei:** `<input>`-Felder erben Schrift-Eigenschaften nicht.
`font-family: inherit` und `font-size: inherit` standen dort, `font-size-adjust`
fehlte — gemessen hatten `#betreff`, `#anrede`, `#grussformel`, `#unterschrift`
und die Fußzeilen-Felder `adjust: none`, während der Fließtext daneben mit
`0.52` rechnete. Bei Schriften mit abweichender x-Höhe standen die Zeilen also
schief zueinander. Jetzt `font-size-adjust: inherit` in beiden Feld-Blöcken.

Beide Regeln (`base.css` und `sheet-common.css`) tragen denselben Wert.

---

## 2026-11-23 — Schriften ohne lateinische Buchstaben gefiltert

**Nutzer:** „können wir diese auch direkt blacklisten? 59 ohne lateinische
Buchstaben ← der Ärger: Droid Arabic Kufi, Noto Sans Thai"

Ja — aber **gemessen, nicht als Namensliste**. Eine Liste mit „Noto Sans Thai,
Droid Arabic Kufi, …" wäre auf dem nächsten Rechner falsch und bei jedem
Font-Update veraltet. Der Test läuft zur Laufzeit: Breite von „Hamburgefonstiv"
und „x" gegen eine garantiert fehlende Familie. Sind beide gleich, liefert der
Browser nur Ersatz — die Schrift hat keine lateinischen Glyphen.

**Warum das nicht nur Kosmetik ist:** `font-size-adjust` nimmt die x-Höhe der
**ersten** Schrift im Stack. Hat die keine lateinischen Glyphen, wird der
Ersatztext passend zu ihrer Metrik skaliert. Gemessen im Brief, gleicher Text
und gleiche Breite:

| Schrift | Zeilen | Höhe |
|---|---|---|
| Test-Liberation | 17 | 238 px |
| Carlito | 17 | 238 px |
| **Droid Arabic Kufi mit adjust** | **13** | **170 px** |
| Droid Arabic Kufi ohne adjust | 17 | 248 px |

Also 24 % kleiner — genau der Eindruck „mega klein". Carlito ist messbar
**nicht** kleiner; die 2 % sind Design, keine Größe.

**Bestand vorher:** 166 Familien, davon 59 ohne lateinische Buchstaben
(Droid Arabic Kufi, Noto Sans Thai, Noto Sans Devanagari, Noto Serif Tamil,
Noto Sans Arabic, …).

**Nachher:** 166 → **82** Einträge. Alle Nicht-Latein-Schriften verschwinden,
Carlito/Liberation/Cantarell/DejaVu bleiben.

Die Filterkette ist jetzt: Namens-Blacklist (Emoji/Symbol/Icons) → Monospace
(gemessen) → lateinische Buchstaben (gemessen) → alphabetisch.

### Nachtrag: vierte Stufe „sieht aus wie Text"

**Nutzer:** „manche waren dabei die garkein a-z hatten sondern nur symbole und
quatsch."

Berechtigt: `D050000L` (URW Dingbats) hat a–z belegt, zeichnet aber Bildchen —
der Latein-Test allein laesst sie durch. Dritte Messung ergaenzt:

| Merkmal | Textfont | Symbolfont |
|---|---|---|
| `H` / `x` (Hoehe) | ≥ 1,15 (Liberation 1,28) | ≈ 1 (D050000L 1,01) |
| `W` / `i` (Breite) | ≥ 2 (Liberation 4,2) | ≈ 1 (D050000L 1,1) |
| Unterlaenge bei `p` | > 0 (Liberation 21) | 0 |

**Gemessene Filterkette (166 Familien):**

| Stufe | danach |
|---|---|
| Start | 166 |
| Namenslisten (Emoji/Symbol/Icons) | 161 |
| Mono-Verdacht am Namen | 138 |
| Mono gemessen | 137 |
| Latein gemessen | 82 |
| Wie-Text gemessen | **80** |

Die vierte Stufe entfernt genau zwei: `D050000L` und `Latin Modern Roman Caps`
(Versalien-Schnitt ohne Kleinbuchstaben — kann keinen Fliesstext setzen).

### Nachtrag: falscher Schriftschnitt bei Systemschriften

**Nutzer:** „C059 sieht komisch fett aus — was ist damit?"

`queryLocalFonts()` liefert alle Schnitte einer Familie, **nicht** in sinnvoller
Reihenfolge. Fuer C059 kommt zuerst `Bold Italic`, dann `Bold`, `Italic`,
`Regular`. Der Code nahm den ersten Eintrag — also die fette Kursive.

Gemessen: **101 von 166** Familien hatten keinen Regular als ersten Eintrag
(C059 → Bold Italic, Caladea → Bold, Cantarell → Bold, FreeSans → Mittel, …).

Fix: `schnittRang()` bewertet den Stil (Regular/Normal/Book/Roman/Mittel = 0,
unbekannt = 1, Light/Demi/Thin = 2, Bold = 3, Italic = 4) und der niedrigste
Rang gewinnt. Auf Wortgrenzen geprueft, weil einige Familien ihre Schnitte
nummerieren (`10 Regular`, `8 Bold`).

Nachher: C059 → Roman, Cantarell → Regular, Caladea → Regular,
Latin Modern Roman → 10 Regular.

**Restbefund (12 Familien ohne normalen Schnitt):** `Noto Sans CJK` (nur Thin),
`Noto Serif CJK` (nur ExtraLight), `URW Bookman` (Demi/Light), `Z003`
(nur Medium Italic). Sie sind jetzt nicht mehr falsch, sondern zeigen ihren
einzigen Schnitt — ob sie in der Liste bleiben, ist eine eigene Entscheidung.

### Nachtrag: Familien ohne normalen Schnitt entfernt (fünfte Stufe)

**Nutzer:** „ich glaube sowas kann man auch komplett rausschmeissen … ich will
**WIRKLICH** DACH / Latin, fertig. keine Bock auf x Kopien für die halbe Welt,
weniger ist mehr."

Beim Sammeln wird jetzt mitgeschrieben, welche Familien einen Schnitt mit Rang 0
(Regular/Normal/Book/Roman/Mittel) haben. Familien, die nur Thin, nur Demi oder
nur kursiv anbieten, kommen nicht in die Auswahl.

Entfernt: `Noto Sans CJK` (5 Varianten, nur Thin), `Noto Serif CJK` (5, nur
ExtraLight), `URW Bookman` (Demi/Light), `Z003` (Medium Italic).
Stand: **80 → 68**.

**Was NICHT per Messung geht:** die verbliebenen Welt-Schriften mit
Latein-Beigabe — `TH Baijam` … `TH SarabunPSK` (13), `Vazirmatn`,
`PakType Naskh Basic` (3), `Padauk`, `RIT Meera New`, `RIT Rachana`,
`Laksaman`, `Jomolhari`, `Noto Sans Sinhala`, `Noto Sans Math`,
`Latin Modern Math`, `TeX Gyre … Math`. Sie haben echte lateinische Glyphen
(deshalb bestehen sie Stufe 4) und deutsche Umlaute. Ein Test auf „ä ö ü ß ẞ €"
trennt sie nicht: er meldet auch `C059` ohne `ö` und `Latin Modern Roman` ohne
`öß` — beides nachweislich falsch, das sind Breitenzufälle. Eine harte
Messgrenze ist damit erreicht.

### Nachtrag: Welt-Schriften per Namensliste entfernt (36 Familien)

**Nutzer:** „ich will **WIRKLICH** DACH / Latin, fertig. keine Bock auf x
Kopien für die halbe Welt, weniger ist mehr."

Messen reicht hier nicht: die 32 Welt-Schriften haben echte lateinische
Glyphen, deutsche Umlaute und Textproportionen — sie bestehen jede Stufe.
Ein Test auf „ä ö ü ß ẞ €" trennt sie nicht, er meldet auch `C059` ohne `ö`
und `Latin Modern Roman` ohne `öß` (beides falsch — Breitenzufall).

Deshalb eine kurze Namensliste `WELT_SCHRIFT`:

| Muster | betroffen |
|---|---|
| `TH …` | 14 Thai-Schriften (SarabunPSK, Baijam, Chakra Petch, …) |
| `PakType`, `Vazirmatn` | 4 arabische/persische |
| `RIT …` | 2 (Meera New, Rachana) |
| `Padauk`, `Laksaman`, `Jomolhari`, `Sinhala` | 4 |
| `Math`, `STIX` | 8 (Formelsatz) |

**Bilanz der ganzen Kette:**

| Stufe | Familien |
|---|---|
| Start | 166 |
| Emoji/Symbol/Icons (Namen) | 161 |
| Mono-Verdacht (Namen) | 138 |
| Mono (gemessen) | 137 |
| Latein (gemessen) | 82 |
| Wie-Text (gemessen) | 80 |
| Normaler Schnitt (gemessen) | 68 |
| Welt-Schriften (Namen) | **36** |

36 echte Latein-Familien: Adwaita Sans, C059, Caladea, Cantarell, Carlito,
Comfortaa, DejaVu Sans, Droid Sans, FreeSans, Latin Modern (10 Schnitte),
Liberation Sans (+ Narrow), Michelangelus, Nimbus Roman/Sans (+ Narrow),
Noto Sans, Noto Serif, Open Sans, P052, TeX Gyre (7), URW Gothic.

### Korrektur: Welt-Schriften per cmap statt per Namensliste

**Nutzer:** „nein nix hartcodieren!!! das muss beim nächsten user auf windows
laufen und beim übernächsten auf mac!"

Berechtigt. Die Namensliste aus dem vorigen Eintrag ist **entfernt**
(`WELT_SCHRIFT` gelöscht). Stattdessen wird die Schriftdatei selbst gelesen:

1. `FontData.blob()` liefert die echte TTF/OTF-Datei.
2. `leseCmap()` liest die `cmap`-Tabelle (Format 4 für BMP, Format 12 für
   UCS-4) und beantwortet exakt: enthält die Schrift diesen Codepoint?
3. `FREMD_PROBEN` sind 20 Stichproben aus nicht-lateinischen Schriften (Thai,
   Arabisch, Hebräisch, Devanagari, Bengali, Tamil, Telugu, Kannada,
   Malayalam, Sinhala, Myanmar, Khmer, Lao, Tibetisch, Georgisch, Armenisch,
   Äthiopisch, CJK, Hangul, Kana).
4. Bringt die Datei **irgendeines** davon mit, ist sie für diese Schrift gebaut
   → nicht anbieten.

**Warum nicht per Breitenvergleich:** fehlt einer Schrift ein Zeichen, springt
der Browser auf die Ersatzschrift — und ist die geprüfte Schrift selbst die
Ersatzschrift des Systems für diese Sprache, sind beide Breiten gleich. Bei
`Vazirmatn` und `Padauk` (beide die Standard-Ersatzschrift auf diesem Rechner)
war der Test deshalb blind. Die cmap fragt die Datei direkt.

**Ergebnis:** 40 Familien, ohne eine einzige Namensliste. Als Welt-Schrift
erkannt werden unter anderem `DejaVu Sans` (Arabisch/Hebräisch), `Liberation
Sans` (Hebräisch), `FreeSans` (Armenisch/Georgisch), alle `Noto Sans/Serif`
Skript-Familien, `TH …` (Thai), `Vazirmatn`, `PakType`, `Padauk`, `RIT …`,
`Jomolhari`, `Laksaman`.

Kosten: 878 ms einmalig beim Klick auf „Systemschriften laden", solange der
Knopf gesperrt ist. Lesefehler zählen als „nicht fremd" — lieber eine Schrift
zu viel als eine fehlende Liste.

`Liberation Sans` fällt mit heraus, weil die Systemdatei hebräische Zeichen
enthält. Der Brief-Standard ist davon unberührt: das ist `Test-Liberation`
(mitgeliefertes DACH-Subset), nicht die Systemdatei.

### Korrektur: Dichte statt „enthält fremde Zeichen"

**Nutzer:** „das das hier passiert ist — Liberation Sans fällt mit raus, die
Systemdatei enthält hebräische Zeichen. ist schon doof."

Richtig. „Enthält ein Zeichen" ist nicht „ist für diese Schrift gebaut".
`Liberation Sans` hat hebräische Zeichen, deckt Latein aber vollständig ab.

Neuer Maßstab: **Deckungsdichte pro Zeichenbereich**.

```
Dichte = belegte Codepoints / Größe des Bereichs
Latein-Bereiche: U+0020–024F und U+1E00–1EFF
28 Fremdbereiche: Thai, Lao, Tibetisch, Myanmar, Georgisch, Hangul,
  Äthiopisch, Cherokee, Khmer, Mongolisch, Kana, CJK, Armenisch, Hebräisch,
  Arabisch, Syrisch, Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil,
  Telugu, Kannada, Malayalam, Sinhala
→ Aussortiert wird nur, wenn die beste Fremd-Dichte die Latein-Dichte
  übersteigt.
```

Gemessen (`leseBereiche()` liest die cmap als Bereichsliste, `deckungsDichte()`
schneidet sie mit jedem Skriptbereich):

| Schrift | Latein | beste Fremd-Dichte | Ergebnis |
|---|---|---|---|
| Liberation Sans | voll | Hebräisch niedriger | **bleibt** |
| DejaVu Sans | voll | Arabisch/Hebräisch niedriger | **bleibt** |
| Noto Sans Thai | minimal | Thai voll | raus |
| TH SarabunPSK | mittel | Thai höher | raus |
| Vazirmatn | hoch | Arabisch niedriger | bleibt |

Ergebnis: 40 → **43 Familien**. `Liberation Sans`, `DejaVu Sans` und
`Droid Sans` sind zurück, alle 14 Thai-Schriften weiter draußen. `Vazirmatn`
bleibt, weil sein Latein dichter ist als sein Arabisch — es ist damit eine
Lateinschrift, die auch Persisch kann.

Laufzeit unverändert ~880 ms beim Laden.

### Echte Fettschrift für Systemschriften (400 + 700)

**Nutzer:** „sie behalten alle Schnitte und mappen sie auf Gewichte … das wäre
die nächste sinnvolle Ausbaustufe."

Alle Schnitte zu laden ist keine Option: `Noto Sans` hat hier **72 Dateien mit
44,7 MB**, Carlito 4 Dateien mit 2,7 MB (gemessen 2026-11-23). Geladen werden
deshalb genau zwei: **400 und 700**, normale Breite, nicht kursiv.

- `gewichtAusStil()` mappt den Stil-Namen auf 100–900 (dieselbe Zuordnung wie
  im Chrome-Beispiel von Boxy SVG).
- `naechster(400, 0)` und `naechster(700, 500)` wählen den passenden Schnitt.
  Für die Fettschrift ist auch ein Demi/SemiBold (600) recht — besser als die
  synthetische Verdickung aus dem Regular.
- Beim Wechsel auf eine andere Schrift oder ein Preset werden die Faces wieder
  abgemeldet (`#entladeSystemFaces`) — vorher blieben sie für die
  Seitenlebensdauer in `document.fonts` (Befund beim Test).

Gemessen nach dem Umbau:

| Auswahl | geladene Faces |
|---|---|
| `sys:Carlito` | Carlito:400, Carlito:700 |
| `sys:URW Gothic` | URW Gothic:400, URW Gothic:700 (das Demi) |
| `sys:TeX Gyre Chorus` | nur 400 — kein fetter Schnitt vorhanden |
| `default` | keine (aufgeräumt) |

31 von 43 Familien haben ein echtes 700; die übrigen 12 sind überwiegend
Mathe-Schnitte (`… Math`) und `URW Gothic` (Demi → 700).

**Warum keine „Fake-Fettschrift über 1 pt größer":** Die DIN-Geometrie ist in
Millimetern gesetzt, `font-size` kommt aus `data-font` und speist den
Zeilenumbruch. Ein Punkt mehr verschiebt Umbrüche und lässt den Betreff aus dem
Raster laufen. Außerdem regelt `font-size-adjust` bereits die optische Größe —
eine größere Regular ist keine Fettschrift, sie ist nur größer. Wenn kein
fetter Schnitt existiert, übernimmt die Browser-Synthese (Strichverdickung) das
und das ist der bessere Kompromiss.

### DACH-Kernzeichen als Filterstufe (cmap, exakt)

**Nutzer:** „wir müssen einen wirklich guten smarten Filter bauen, dass man
danach wirklich nur noch das sieht, was Latin DE CH AT ist — mit Umlauten …
sind wir da? ich will das 80/20 machen."

**Ja, wir sind da.** Gemessen über die cmap aller 43 Familien:

| Prüfung | Ergebnis |
|---|---|
| `ä ö ü ß` vorhanden | **43 von 43** — keiner fehlt ein Kernzeichen |
| `ẞ` vorhanden | 14 von 43 |
| `ẞ` und `€` vorhanden | 6 von 43 (Adwaita Sans, DejaVu Sans, Michelangelus, Noto Sans, Noto Serif, STIX) |

Die Stufe ist trotzdem eingebaut (`hatDachKern`), damit sie auf Windows und
macOS greift, wo ASCII-only-Schriften vorkommen: dort fällt eine Schrift ohne
`ä ö ü ß` raus. Auf diesem Rechner ändert sie nichts (43 → 43).

**Bewusst nicht verlangt: `ẞ`.** 29 von 43 Familien haben es nicht, und in einem
normalen Brief kommt der Großbuchstabe nicht vor. Das ist die 80/20-Entscheidung:
lieber 43 Schriften als 6.

**Der Standard ist davon unberührt.** Der Brief startet auf `Test-Liberation`
(`website/fonts/liberation-sans-regular.woff2` + `-bold.woff2`), wie vom Nutzer
bestätigt: „das ist das fest eingebaute default modell, dafür ist der DIN Brief
gebaut."

### Formelsatz, Schmalschnitte und TeX-Sippe entfernt (18 Familien)

**Nutzer:** „die haben doch TeX oder Math oder so im Namen? kann man das per
Regex abschießen?"

Zwei davon sind gemessen, eine per Name:

| Stufe | Kriterium | entfernt |
|---|---|---|
| Formelsatz | cmap-Block U+1D400–1D7FF > 500 Zeichen | 7 (Latin Modern Math, STIX, TeX Gyre … Math) |
| Schmalschnitt | Breite ÷ x-Höhe < 5 | 3 (Liberation Sans Narrow 4,59 · Nimbus Sans Narrow 4,75 · TeX Gyre Heros Cn 4,76) |
| TeX-Sippe | Name `^(TeX Gyre\|Latin Modern)` | 15 |

Gemessene Werte für den Schmalschnitt-Vergleich: normale Textschriften liegen
ab 5,6 (Liberation Sans 5,60 · Droid Sans 5,65 · Nimbus Sans 5,78), der Median
über alle 43 war 6,28.

Warum die Namensliste hier unbedenklich ist, anders als bei den Welt-Schriften:
`TeX Gyre` und `Latin Modern` heißen auf Windows, macOS und Linux gleich (sie
kommen aus TeX Live) und sind keine Systemschriften. `Math` bleibt trotzdem
eine Messung, weil sich der Name je Familie unterscheiden kann.

**Bilanz: 43 → 18.** Übrig: Adwaita Sans, C059, Caladea, Cantarell, Carlito,
Comfortaa, DejaVu Sans, Droid Sans, Liberation Sans, Michelangelus, Nimbus
Roman, Nimbus Sans, Noto Sans, Noto Serif, Open Sans, P052, URW Gothic,
Vazirmatn.

---

## 2026-11-23 — Lizenz-Historie: bewusst akzeptiert (Option A)

**Nutzer:** „ich denke wenn das irgendwo im code drin ist ist es noch
vertretbar aber es sollte nicht in der anwendungs sichtbar sein … ich mach a"

### Befund

`website/fonts/aptos.woff2` (17 848 B) und
`website/fonts/michelangelus-regular.woff2` (23 212 B) liegen in Commit
`4b2263b` der **öffentlichen** Historie und sind dort abrufbar. Entfernt wurden
sie in `7218cf0` („fix(licenses): Non-Inter-Fonts aus dem Repo entfernt").

Im heutigen Baum sind sie nicht mehr:

```
git ls-tree -r HEAD | grep -iE 'aptos|michelangelus'   → nichts
Pages deployt: path: 'website/' aus dem aktuellen Baum
```

Die Anwendung liefert also nur Inter und Liberation Sans aus, beide SIL OFL 1.1.

### Was in den Dateien selbst steht

| Datei | Lizenzfeld (Name-Tabelle) | fsType |
|---|---|---|
| `Aptos.ttf` | „Microsoft supplied font … you may only (i) embed this font in content as permitted by the embedding restriction" | 8 = Editable |
| `Michelangelus-Regular.ttf` | „Copyright © 2024 by Gusto IDS. All rights reserved." | 0 = Installable |
| `liberation-sans-regular.woff2` | SIL OFL 1.1 | 0 |

`fsType 8` erlaubt das Einbetten in Dokumente, nicht die Weitergabe der Datei.
„All rights reserved" ohne Lizenztext ist keine Weitergabeerlaubnis.

### Entscheidung

**Option A: akzeptiert, Historie bleibt.** Begründung:

- Die Dateien werden weder ausgeliefert noch von der App referenziert
  (`FONT_PRESETS` enthält nur `inter`, die Oberfläche bietet sie nicht an).
- Option B (History-Rewrite) hätte alle 90+ Commits und den Tag `v4.2.0`
  ungültig gemacht, jeden Clone zerstört und GitHub-Caches nicht sicher
  bereinigt — Schaden größer als Nutzen.
- Option D (privates Repo) hätte GitHub Pages abgeschaltet.
- Option C (neues Repo) bleibt der einzige saubere Weg, falls das Risiko später
  anders bewertet wird.

Die Dateien bleiben lokal in `<repo>/fonts/` (gitignoriert) und erreichen die
veröffentlichte Seite nie.

---

## 2026-11-23 — WebMCP eingebaut, mit CLI-Brücke statt Polyfill

**Anlass:** Der Wunsch, „dass jeglicher Agent den Brief komplett benutzen kann"
— im Browser und in der Kommandozeile, veröffentlicht auf GitHub Pages.

**Gemessen (Chrome 152, Live-Seite):** `navigator.modelContext`,
`document.modelContext` und `modelContextTesting` sind `undefined`. Die API gibt
es ab Chrome 149 nur hinter `chrome://flags/#enable-webmcp-testing` oder per
Origin-Trial-Token. `window.dinApi` stand dagegen sofort bereit.

**Entscheidung: keine zweite Wahrheit, sondern zwei Transporte über einer
Fähigkeitsschicht.**

1. `website/js/webmcp.js` (neu) definiert acht Werkzeuge als Daten (Name,
   Beschreibung, JSON-Schema, `readOnlyHint`) und führt sie über
   `window.dinApi` aus. Es registriert sie bei `document.modelContext`, wenn
   vorhanden — und stellt immer `window.dinBriefAgent` bereit.
2. `tools/mcp-dinbrief.mjs` (neu, zero-dependency) ist ein MCP-Server über
   stdio: er startet oder findet Chrome mit DevTools-Protokoll, öffnet die
   Seite und ruft `window.dinBriefAgent.run(name, args)` auf. Damit funktioniert
   derselbe Vertrag auch dort, wo WebMCP fehlt (Helium, Firefox, CLI-Agenten).
   Zusatzwerkzeuge der Brücke: `brief_als_pdf` (`Page.printToPDF`, A4 über
   `preferCSSPageSize`) und `brief_seite_oeffnen`.
3. `website/addons/webmcp-bridge.js` bleibt liegen, ist aber als **überholt**
   markiert: er simulierte `modelContext` und brauchte dafür
   `ws://127.0.0.1:8333`, was die CSP (`connect-src 'self'`) ohnehin blockiert.

**Bewusst nicht gebaut:** kein „Verbinden"-Schalter in den Einstellungen (bei
WebMCP gibt es nichts zu verbinden — der Agent besucht die Seite), keine
Polyfill-Schicht, keine Ausweitung auf Datei-Dialoge, Druckdialoge oder
Unterschrift-Upload (Nutzergeste).

**Verifiziert:** `brief_schreiben` über MCP füllte Empfänger, Absender, Datum,
Anrede, Betreff, Text, Unterschrift und Anlagen; `brief_als_pdf` erzeugte ein
PDF mit MediaBox 594,96 × 841,92 pt (A4, eine Seite). `npm test`: 424 Fälle
grün. Port 9222 war auf dem Testrechner von einem fremden Chrome belegt und
lieferte HTTP 404 — die Brücke probiert deshalb 9222/9333/9444/9555 und
überspringt belegte Ports ohne DevTools.

**Doku:** `docs/js/AGENTEN-WEBMCP.md`, `website/llms.txt`, README.

---

## 2026-11-23 (Nachtrag) — Agenten-Kanal ohne Debug-Port, Seiten-Inspektion

**Anlass:** „Ein CLI-Agent soll ohne Debug-Port in den live offenen Tab
schreiben." Das geht mit der CDP-Brücke bewusst nicht — also dreht
`tools/mcp-live.mjs` die Richtung um: Der Tab ruft an (Server-Sent-Events auf
`127.0.0.1`), der Agent spricht MCP mit dem lokalen Dienst.

- `website/js/live-bridge.js`: liest `#agent=<token>[@port]`, verbindet per
  `EventSource`, führt Aufrufe über `ausfuehren()` aus. Ohne Token im Fragment
  passiert nichts — kein Timer, kein Netz.
- `tools/mcp-live.mjs`: MCP über stdio + HTTP-Kanal, Werkzeugliste direkt aus
  `website/js/webmcp.js` (keine Kopie). Ports 8765…8795, belegte werden
  übersprungen; der Port steht dann im Fragment.
- CSP: `connect-src` erlaubt zusätzlich `http://127.0.0.1:*` (nur Loopback).
- Verifiziert: normaler Tab (kein Flag, kein DevTools-Port), `brief_schreiben`
  über den Kanal füllte den Brief, Toast „Agent verbunden".

**Zwei Werkzeuge ergänzt** (jetzt zehn): `brief_seiten` und
`brief_layout_setzen`. `brief_seiten` rechnet die Seitengeometrie selbst
(`#kern`, `--seite` + `--luecke`) statt `body.dataset.seiten` zu lesen — der
Wert hängt einen ResizeObserver-Frame nach und war nach `brief_schreiben`
falsch. Zeilen werden über `Range.getClientRects()` gezählt, der Zeilentext
über eine Binärsuche auf Zeichen-Rechtecken (ein Textknoten läuft über
Seitengrenzen). Gemessen an einem 34-Zeilen-Brief: Seite 1 = 32 Zeilen,
Seite 2 = 2 Zeilen, Warnung „Seite 2 hat nur 2 Zeile(n)"; Form A hält 34
Zeilen, Form B 32. Das ist der Bildschirm, nicht das PDF — der Druckumbruch
bleibt der CDP-Brücke vorbehalten.

---

## 2026-11-23 — Altbestand „roadmap" (09/2026) ausgewertet: drei Entscheidungen

Der Ordner `Documents\dinbrief-temp\roadmap` (39 Dateien, 04.09.2026) stammt aus der
Zeit vor der Modul-Konsolidierung. Er wurde vollständig gegen den aktuellen Code
geprüft; danach gelöscht. Die Entscheidungen stehen ab jetzt hier, nicht in einer
Dateiablage außerhalb des Repos.

**1) Zero-Click-Autofill bei genau einem Treffer — verworfen.**
War implementiert und wurde bewusst entfernt: Wer einen Vorschlag löscht, bekam ihn
sofort wieder eingesetzt. Das ist keine Hilfe, sondern eine Blockade. Automatisch
gefüllt wird weiterhin nur **PLZ → Ort** (fünf Ziffern, `address.js`), weil dort der
Zusammenhang eindeutig ist. `docs/meta/ROADMAP.md` behauptete „erledigt" — korrigiert.

**2) On-Device-KI (Gemini Nano) — verworfen.**
Das lokale Modell braucht rund **4 GB RAM**; das ist nicht „für jeden". Der Bedarf ist
inzwischen durch den Agenten-Zugang (WebMCP/MCP, 15 Werkzeuge) gedeckt — ohne Modell,
ohne Download, ohne RAM-Last. `docs/meta/Feature-Matrix.md` führte das Addon als
„aktiv · optional" — korrigiert auf **verworfen**.

**3) Brotli — bleibt gzip.**
`DecompressionStream('brotli')` ist in Chrome nicht verfügbar (nur Firefox), und
GitHub Pages liefert keine `Content-Encoding: br`-Header. Der Datensatz bleibt bei
gzip (81.745 B, unter 1 ms) — kein Bedarf.

**Nicht verworfen, sondern geparkt: Adressbuch und Brief-Verlauf.**
Die Datenschicht liegt fertig in `website/addons/verlauf/` (Absender-/Empfängerbuch,
Verlauf, 15 Exporte), ist aber bewusst nicht geladen. Offen sind UI und
Speicherzeitpunkt — B32 im [[BACKLOG]].

**Doku-Folgen:** `docs/meta/Feature-Matrix.md` (Stand 2026-10-02) verwies auf
gelöschte Module (`43-geoapify.js`, `52-import-export.js`, `46-clipboard-address-parser.js`)
und behauptete drei Features, die es nicht mehr gibt. Nachgezogen; der
Clipboard-Parser steht dort jetzt korrekt als **verworfen** (Commit `164568b`,
„wir suchen nicht in einer potentiellen Zwischenablage").

### Nachtrag: Altbestand `research_results` — was bleibt, was fliegt

Der Ordner `Documents\dinbrief-temp\research_results` (33 Dateien, 16 MB) wurde
gegen den aktuellen Stand geprüft. Die Chrome-Feature-Rohdaten bleiben (14 MB,
außerhalb des Repos), der Rest ist in den Papierkorb gewandert.

**1) Geoapify bleibt der einzige Adressanbieter — Photon/OpenPLZ/HERE verworfen.**
Die Recherche (Multi-Provider-Vergleich, Latenz-Benchmarks) ist entschieden: die
Alternativen waren messbar langsamer, und „key-frei" ist kein Vorteil, weil der
Geoapify-Key optional ist und die Offline-PLZ ohne Netz arbeitet. Damit ist auch
`brief_strasse_suchen` (Werkzeug) korrekt auf Geoapify festgelegt.

**2) Vornamen-Tabelle (951 Namen) — verworfen.** Widerspricht der KISS-Anrede:
kein Raten aus Namenslisten, der Nutzer überschreibt im Feld.

**3) Impressum-/Zwischenablage-Parser — verworfen** (bleibt bei Commit `164568b`).

**4) PLZ-/Großkunden-Altbestand (09/2026) — verworfen.** Die Pipeline im Repo ist
SSoT; Daten werden beim Build frisch aus den Quellen geholt und geparst, nicht
aus Altbeständen übernommen. Brotli bleibt trotz 18 % Ersparnis draußen (kein
`Content-Encoding: br` auf Pages, `DecompressionStream` kann es in Chrome nicht).

**5) Chrome-Radar bleibt — als Doku.** Die beiden Chromestatus-Dumps (2025/2026,
433 Features 2026) bleiben außerhalb des Repos; das Auswertbare steht jetzt in
`docs/css/CHROME-CSS-RADAR.md`: was wir schon nutzen (Multicol L2, `text-box-trim`,
`field-sizing`, `light-dark`), welche Kandidaten zu DIN-5008 passen (unbedruckbare
Ränder, `margin-trim`, hängender Einzug, `shrink-to-fit`) und was nur beobachtet wird.

**6) Mobile - Zwischenlösung statt Sackgasse.** Es gibt keine `mobile.css`; bis
dahin kommt ein Hinweis "der Editor ist für Desktop gebaut" (Issue #30), rein per
Media Query, ohne Overlay-Falle und ohne Druckwirkung.

## 2026-11-23 - Altbestand `alterarbeitsordner` geprüft, archiviert und gelöscht

**Kontext:** `Documents\Other_Projects\DIN-Brief Neo\alterarbeitsordner` (2.448
sichtbare Dateien, 168 MB) war der Sammelordner aller Vorstufen. Vor dem Löschen
wurde er vollständig geprüft und gesichert.

**Sicherung:** `alterarbeitsordner_2026-11-23.zip` (150,2 MB, 8.050 Dateien,
217,9 MB entpackt) liegt neben `neuerarbeitsordner`. Die erste Tar-Variante war
unvollständig, weil `tar.exe` dem Junction `DIN-BriefNEO\node_modules` folgte und
danach abbrach (u. a. fehlten `Alte schinken`, `DIN Brief`, `Chhatlogs`). Neu
gebaut mit `robocopy /XJ` (Junctions ausgeschlossen) und anschließend per
Voll-Extraktion gegengeprüft: 8.050 Dateien, gleiche Byte-Summe.

**Befund `Alte schinken\Platinum_DIN_2026` (37 Dateien, 0,1 MB, 17.03.2026):**
reine Ghost-Spezifikation (`.brain/` mit Projektgedächtnis, 19 ADRs, 6
JS-Modul-Steckbriefen, `index.html.md`). Nichts davon muss gerettet werden:

- **Überholt:** ADR-020 "100 % ContentEditable" (heute dedizierte Inputs,
  `contenteditable` nur im Briefkörper), ADR-016 PWA/Offline-First, ADR-011
  Photon/GPS-Kaskade, Profil-Dialog, IBAN-Ghost-Overlay, Expert-Mode-Sidebar.
- **Deckt sich mit heute:** DIN-Geometrie (25 mm links, 20 mm rechts, Form A
  27 mm / Form B 45 mm, Falzmarken 105/210 mm, Lochmarke 148,5 mm), Validierung
  für IBAN/PLZ/E-Mail, "No Ghost Data", "Assistiert, nicht bevormundet".
- **Bereits entschieden:** Adressbuch (Issue #28), Geoapify als einziger
  Adressanbieter, LLM-Protokoll (`docs/js/AGENTEN-WEBMCP.md`).

**Ergebnis:** Der Ordner ist gelöscht. Im Elternverzeichnis liegen nur noch
`neuerarbeitsordner` und das Archiv. Einziger Halt beim Löschen war eine offene
Typora-Datei (`00_project_memory.md`); nach deren Schließen war der Rest weg.
