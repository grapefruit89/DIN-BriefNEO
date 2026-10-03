---
id: handoff-2026-10-03-pull-diff-offene-punkte
title: Übergabe — GitHub-Pull, Diff, gelöste & offene Punkte (2026-10-03)
status: archived
type: reference
created: '2026-10-03'
updated: '2026-10-03'
tags:
- din-briefneo
- meta
- audit
- governance
- handoff
doc_links:
- '[[AGENTS]]'
- '[[Immutable-Law-Catalog]]'
- '[[DECISION-LOG]]'
code_links:
- 'website/index.html'
- 'website/css/layers.css'
- 'website/css/layout.css'
- 'website/js/01-draft-manager.js'
- 'website/js/51-storage.js'
depends_on: []
supersedes: []
---

# Übergabe DIN-BriefNEO — Pull, Diff, gelöste Probleme, offene Punkte

**Datum:** 2026-10-03
**Zweck:** Übergabe an das DIN-BriefNEO-Chatfenster. Beschreibt, was passiert ist
(GitHub-Pull + Diff), welche Probleme dadurch gelöst wurden und was noch offen ist.
**Wichtig:** Es wurde **nichts committet** und **nichts in `website/` geändert** — nur
`git fetch` + Fast-Forward und Lesen. Der Arbeitsbaum steht auf dem GitHub-Stand.

---

## 1. Der Pull (Ausgangslage)

- Lokaler Stand war **12 Commits hinter** `origin/main`.
- `git fetch origin --prune` → neuer GitHub-Stand: **`bb209e0`**.
- **Fast-Forward** (`git merge --ff-only origin/main`) in den Arbeitsbaum geholt — **kein neuer
  Commit**, keine Historie verändert.
- Der alte lokale Stand ist als Tag **`rescue-c7bd668`** gesichert.

Reproduktion:
```bash
cd /home/moritz/repos/DIN-BriefNEO
git fetch origin --prune
git log --oneline HEAD..origin/main      # 12 Commits
git diff --stat HEAD..origin/main        # 32 Dateien
git merge --ff-only origin/main          # Fast-Forward, kein Commit
```

### Die 12 neuen Commits
```
bb209e0 fix(pipeline): resolve grosskunden loading, add CI triggers, and enforce verification discipline (Phases 1-3)
4f6ba1a docs(matrix): update Adaptive Trefferzonen to active status
a8e0b8d docs(meta): audit decision log claims, append KISS/B8/B17 entry, and mark B15 completed
e76c642 docs(backlog): mark B17 (structural laws coverage) as completed
a16899c feat(fitness): expand structural laws and antipattern probes to cover 30/35 laws (B17 Phase 2)
95773e0 docs(backlog): mark B8 (!important resolution) as completed
8a8d4ed refactor(storage): encapsulate local addresses, coordinates, and drafts in StorageManager
420f6c1 refactor(toolbar): replace manual DOM tree walks with closest() (KISS)
809eb15 refactor(css): eliminate all 12 non-print !important and consolidate misplaced rules (B8)
25c3070 fix(pipeline): switch plz update pipeline from brotli to gzip and remove plz-embedded.js generation
2659e43 refactor(draft): remove redundant caret wrapper methods
f68c1be refactor(website): Event-Delegation fuer Line-Limits und AutoSave
```

---

## 2. Der Diff (was der Pull gebracht hat)

`git diff --stat HEAD..origin/main` — **32 Dateien**:

**Website (Produkt):**
- `website/css/floating.css`, `layout.css`, `sheet.css`, `sidebar.css`, `signature.css`
- `website/js/01-draft-manager.js`, `02-settings-manager.js`, `03-ui-protections.js`,
  `31-format-toolbar.js`, `43-geoapify.js`, `51-storage.js`, `52-import-export.js`, `main.js`
- `website/data/de_grosskunden_plz.json.gz`, `website/data/de_plz_ort.json.gz`

**Pipeline / Research:**
- `.github/workflows/update_plz_pipeline.yml`
- `research/research_scripts/update_plz_pipeline.py`
- `research/research_results/`: `de_grosskunden_plz.json` (+`.br`/`.gz`), `de_plz_ort.json`
  (+`.br`/`.gz`), `plz_manifest.json`

**Tools / Doku:**
- `tools/antipatterns/project.json`, `tools/lawcoverage.js`, `tools/structural-laws.js`
- `docs/30-meta/BACKLOG.md`, `DECISION-LOG.md`, `Feature-Matrix.md`, `ROADMAP.md`, `AGENTS.md`

---

## 3. Dadurch gelöste Probleme

Der Pull setzt einen Großteil des **Claude-Code-Audits** (`docs/90-archive/code-audit-website-2026-10-02.md`) um:

| Finding (Claude) | Status nach Pull | Beleg im Code |
|---|---|---|
| P1-1 Metadata-Namenslogik doppelt | ✅ **gefixt** | `js/53-metadata.js` → `collectLetterIdentity()` (eine Quelle) |
| P1-2 drei Settings-Leser | ✅ **gefixt** | `41-salutation-engine.js` bekommt geteilten `settingsContext` injiziert |
| P2-1 contenteditable-Listen an 4 Stellen | ✅ **gefixt** | deklarativ `data-feldtyp` (`01-draft-manager.js`, `03-ui-protections.js`) |
| P2-2 gzip-Fetch dreifach | ✅ **gefixt** | `js/05-gzip.js` → `fetchGzipJson()` |
| P2-3 `file://`/`plz-embedded.js` tot | ✅ **gefixt** | `plz-embedded.js` entfernt, kein `file:`-Zweig mehr |
| P2-4 Caret-Node-Walk | ✅ **gefixt** | `js/selection-utils.js` mit `document.createTreeWalker` |
| P2-5 `setTimeout(100)` vor `print()` | ✅ **gefixt** | `js/main.js` hängt an nativen `afterprint` |
| P2-7 sieben tote IDs | ✅ **gefixt** | u. a. `btn-confirm-*`, `zwischenablage-anschrift-wrapper` aus `index.html` weg |
| P3-2 stumme Boot-Catches | ✅ **gefixt** | `boot-state.js`/`boot-theme.js` loggen jetzt (`[Boot] …`) |
| P2-8 12× `!important` außerhalb `print` | ⚠️ **teilweise** (B8) | nur noch **5× in `reset.css`** |
| P3-6 59 hartcodierte `mm` | ⚠️ **teilweise** | auf ~12 reduziert (nicht via `attr()`) |
| P2-6 `document.title` zwei Owner | ⚠️ **offen** (dokumentiert) | DraftManager + MetadataService |
| P1-3 Postvermerk-Listener | ⚠️ **teilweise** | `main.js` delegiert; `boot-state.js` hat noch eigene Logik |

Zusätzlich aus dem Pull: **B8** (Nicht-Print-`!important` beseitigt), **B17** (Structural-Laws-
Coverage 30/35), PLZ-Pipeline auf gzip umgestellt, `plz-embedded.js`-Generierung entfernt.

---

## 4. Offene Punkte (aus ChatGPT-Review + Claude-Rest)

Verifiziert gegen den aktuellen Stand `bb209e0`.

### #1 🔴 Layer-Architektur — `<link layer="…">` ist NICHT implementiert (echter Bug)
- **Code:** `website/index.html:16-22` lädt `reset/variables/layout/sidebar/sheet/signature/floating.css`
  mit `layer="…"`; `website/css/layers.css` deklariert `@layer reset, tokens, layout, floating;`.
- **Beleg, dass das nicht trägt:**
  - **MDN browser-compat-data** (`html/elements/link.json`): `<link>` hat **kein** `layer`-Attribut.
  - **WHATWG-HTML-Spec** (`multipage/semantics.html`): **0×** „layer".
  - **CSSWG** Issue **#5853** („assign link/style to a cascade layer") = offenes Proposal, nie standardisiert.
  - **chromestatus**: nur „CSS cascade layers" = die `@layer`-**Regel** (Chrome 99); kein `<link layer>`-Feature.
- **Folge:** Attribut wird ignoriert → alle Dateien laden **unlayered**. Da keine Datei `@layer`-Blöcke
  nutzt, ist die Layer-Architektur ein **No-Op**; es greift reine Quell-Reihenfolge (zufällig die gewünschte).
- **Fix-Optionen (zero-build):**
  - (a) minimal: Kommentare ehrlich machen („Reihenfolge via Quell-Order; `layer`-Attribut nicht implementiert").
  - (b) richtig: in `layers.css` `@import url("reset.css") layer(reset);` … statt der `layer="…"`-Links
    (unterstützt seit Chrome 99).

### #2 🟠 `field-sizing: content` auf `contenteditable` — Begründung falsch
- `website/css/layout.css:134/152`, `website/css/sheet.css:62`. `field-sizing` zielt auf
  **Form-Controls**; auf `contenteditable` wirkungslos. Die Stauchung macht `text-fit: shrink`.
- **Fix:** Kommentar/Begründung bereinigen (ggf. Deklaration entfernen).

### #3 🟠 Browserziel-Doku uneinheitlich
- `BASELINE 2024-2026` mischt sich mit `Chrome 150+` in `css/variables.css:45`,
  `css/layout.css:128/140`, `js/main.js:81`.
- **Fix:** ehrlich „referenziert Chromium 150+" (kein Cross-Browser-Ziel).

### #4 🟠 Autosave-A11y — Doppelansage / widersprüchliche Doku
- `index.html:140` `#save-status` hat `role="status" aria-live="polite"`, **obwohl** der JS-Kommentar
  (`js/01-draft-manager.js:197-218`) sagt: „keine Toasts, keine assertive Live-Region".
- Bei jedem debounced Autosave wird der Live-Text geändert („Speichern…" → „Gespeichert"); bei Fehler
  zusätzlich `document.ariaNotify(...)` → **Doppelansage**.
- **Fix:** `role="status"`/`aria-live="polite"` von `#save-status` entfernen (visueller Indikator +
  `title` bleiben; Fehler via `ariaNotify`). Der Toast-Live-Region `#hinweis-v4` bleibt unberührt.

### #5 🟡 Geoapify-Key im `localStorage` — als Tradeoff dokumentieren
- `js/51-storage.js:179/193`. CSP entschärft, aber `localStorage` ist kein Secret-Store. Kein Bug,
  bewusste Entscheidung → dokumentieren.

### #6 🟡 Hygiene
- Doppeltes `padding: 4px;` in `website/css/floating.css:294-295`.
- Leere `catch`-Blöcke (teils gewollt → unterscheiden/dokumentieren).
- `any` in `@ts-check`-Dateien reduzieren.

### #7 🟡 Claude-Review-Rest
- 5× `!important` in `css/reset.css`.
- `document.title`-Owner vereinheitlichen (`53-metadata.js` vs. `01-draft-manager.js`).
- Boot-Postvermerk-Doppelung (`main.js` vs. `boot-state.js`).
- `_`-Prefix neben `#`-Private-Feldern (`_injectMetaTags` u. a.).

---

## 5. Verifikations-Methodik & maschinenlesbare Quellen

Für „geht Feature X in Chrome/Browser?" — nie raten, erst maschinenlesbar prüfen:

| Zweck | Quelle |
|---|---|
| Chrome-Milestone/Feature | `https://chromestatus.com/api/v0/features?q=<kw>` (Antwort mit `)]}'`-Präfix; `milestone:null` = nicht ausgeliefert) |
| Cross-Browser-Support (kanonisch) | MDN BCD: `https://raw.githubusercontent.com/mdn/browser-compat-data/main/<pfad>.json` |
| Baseline-Status | `https://unpkg.com/web-features/data.json` |
| Überblick/% Nutzer | `https://raw.githubusercontent.com/Fyrd/caniuse/main/fulldata-json/data-2.0.json` |
| W3C Spec-Metadaten / Inhalte | `https://api.w3.org/specifications` · `https://w3c.github.io/webref/` |
| Echte Tests | `https://wpt.fyi/api/runs` |

Diese Quellen sind zusätzlich als Agenten-Skill abgelegt:
`/home/moritz/.agents/skills/web-platform-pulse/SKILL.md`.

---

## 6. Nächste Schritte (Empfehlung)
1. **#1 Layer** fixen (einziger echter Architektur-Bug) — Entscheidung nötig: (a) Kommentar oder (b) `@import layer()`.
2. **#2–#4** (3 kleine surgical Changes).
3. **#5–#7** Hygiene/Doku.

**Prozess-Hinweise (AGENTS.md):** branchless (`main`), **Fitness Gate 100 %** vor/nach
(`node tools/build_db.js`; Baseline war 100 %), Context7/chromestatus bei Web-API-Fragen,
`surgical changes`, `node tools/log_session.js` nach dem Post-Build, danach Commit nur nach Freigabe.

**Zustand jetzt:** Repo auf `bb209e0`, Arbeitsbaum sauber, **keine Änderungen, kein Commit**.
