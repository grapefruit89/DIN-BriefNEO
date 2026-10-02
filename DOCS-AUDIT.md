# Doku-Audit `/docs` — Was ist wichtig, was kann weg?

**Datum:** 2026-10-02 · **Umfang:** `docs/` (41 aktive + 8 archivierte MD), Root-MDs, `research/`, `agent/`
**Modus:** Nur Analyse. Keine Datei gelöscht, verschoben oder geändert.
**Gegenstück:** [`WEBSITE-CODE-AUDIT.md`](WEBSITE-CODE-AUDIT.md)

---

## 0. Die Zahlen zuerst

| Bereich | Netto-Zeilen (ohne Leerzeilen) |
|---|---:|
| `website/` — **Produktionscode** | **5.547** |
| `docs/` — 49 Markdown-Dateien | **6.550** |
| Root-MDs (AGENTS, CLAUDE, GEMINI, README, SECURITY) | 573 |
| `research/` (Laborberichte) | 2.814 |
| `agent/skills/` | 462 |
| **Doku gesamt** | **10.399** |

**Verhältnis 1,9 : 1** — auf jede Zeile Produktionscode kommen knapp zwei Zeilen Prosa. Für ein Ein-Personen-Projekt mit 6.000 Zeilen Code ist das der eigentliche Wartungsposten: Die Doku ist das größere Artefakt, altert aber schneller als der Code, weil sie nichts hat, was sie widerlegt.

---

## 1. ⚠️ Zuerst: Das Fitness Gate ist aktuell rot

Bevor irgendetwas anderes passiert — ich habe den Gate laufen lassen:

```
EVOLUTIONARY FITNESS SCORE: 99.88%
🔴 Build failed: Critical architectural violations found or Fitness Score < 100%!
```

**8 kritische tote Wikilinks**, alle auf dieselben zwei Ziele:
- `[[Function-Traceability]]` — in `ADR-OMNITRACEABILITY.md` (2×, plus Frontmatter), `10-architecture/README.md`, `docs/index.md` (+ Frontmatter)
- `[[Code-Referenzen]]` — in `ADR-OMNITRACEABILITY.md`, `10-architecture/README.md`

**Die Ursache ist strukturell, kein Tippfehler:** Beide Dateien sind *generierte* Artefakte und stehen in `.gitignore` (Zeilen 24–25). `tools/links.js` nimmt sie zwar in `SCAN_SKIP` auf — aber nur als *Quelle*, nicht als *Ziel*. Nach einem frischen Clone existieren sie nicht, also sind alle Links darauf tot.

Verschärfend: `tools/build_db.js` (der dokumentierte Linux-Einstieg) erzeugt nur `Code-Referenzen.md`. `Function-Traceability.md` entsteht ausschließlich in `tools/build_db.py` (Python). **Auf dem in README/AGENTS dokumentierten Linux-Pfad ist 100 % damit unerreichbar** — der Gate kann dort gar nicht grün werden.

> Das ist bemerkenswert, weil AGENTS.md §2 verlangt, den Gate *vor* jeder Änderung auf 100 % zu sehen. Dieser Vertrag ist derzeit auf einem frischen Clone nicht erfüllbar. Fix-Optionen: (a) `links.js` ignoriert generierte Ziele auch als Linkziel, (b) die drei Dokumente verweisen per normalem Pfad-Link statt Wikilink, (c) `build_db.js` erzeugt einen Stub. Variante (a) ist die sauberste.

---

## 2. Das Kernproblem: Fünf Kopien desselben Gesetzes

`Immutable-Law-Catalog.md` schreibt in seiner eigenen Präambel:

> „Dieses Dokument ist die autoritative Quelle für Verbote und Plattformprinzipien. Es wird **referenziert**, nicht an fünfzehn Stellen kopiert."

Und hat sogar ein eigenes Kapitel **„PART III — SINGLE SOURCE, KEINE 15 KOPIEN"**. Trotzdem existiert derselbe Verbotskanon aktuell in **fünf** Fassungen:

| # | Datei | Form | Zeilen |
|---|---|---|---|
| 1 | `docs/00-foundation/Immutable-Law-Catalog.md` | A1–A50 Tabellen, MUST-USE/FORBIDDEN | 191 |
| 2 | `docs/10-architecture/ADR-ANTIPATTERN.md` | Abschnitte 0–18, Fließtext | 185 |
| 3 | `docs/00-foundation/constitution.md` §2 | „Fundamentale Verbote" als Prosa | ~30 |
| 4 | `CLAUDE.md` | „⛔ ABSOLUTE VERBOTE" Codeblock, 8 Punkte | ~15 |
| 5 | `GEMINI.md` | 28 nummerierte Regeln | 166 |

Stichprobe, wie oft dieselbe Regel steht (ohne Archiv):
- CDN-Verbot → 8 Dateien
- `new Date()`-Verbot → 11 Dateien
- Framework-Verbot → 15 Dateien
- `execCommand`-Verbot → 7 Dateien

**Das ist nicht nur Redundanz, es produziert nachweislich Widersprüche** (siehe §3). Dazu kommt: Der Code selbst trägt die Regeln ein sechstes Mal — die „🛡️ ARCHITECTURE GUARD"-Blöcke in `index.html` und den JS-Modulen (vgl. P3-4 im Code-Audit).

---

## 3. Harte Widersprüche in der Doku

Diese sind unabhängig vom Stil-Geschmack — hier sagen zwei aktive Dokumente etwas Gegenteiliges:

### W1 — `file://` ist gleichzeitig Pflicht und unmöglich
| Quelle | Aussage |
|---|---|
| `README.md:20` | „muss wegen CORS über einen lokalen Webserver gestartet werden — **`file://` reicht nicht**" |
| `AGENTS.md:115` | „läuft deshalb **nur über einen lokalen Webserver**, nicht `file://`" |
| `CLAUDE.md:34` | „läuft daher **nicht** über `file://`" |
| `CLAUDE.md:45` | „Vanilla HTML/CSS/JS only, **`file:///` lauffähig**" ← widerspricht Zeile 34 derselben Datei |
| `docs/index.md` (Leitregel 2) | „**Offline- & `file:///`-Garantie:** Alle Kernfunktionen müssen **ohne Webserver** laufen" |
| `longevity-guidelines.md` | „Säule 2: Offline / `file://`" |
| `Immutable-Law-Catalog.md` S1, A22, A34–A37 | Begründet **fünf Verbote** mit `file://`-Tauglichkeit |
| `testing-guide.md` | Checklisten „für `file:///`" |

Die Realität (ES-Modules + CSP) ist eindeutig: `file://` funktioniert nicht. Aber die halbe Verbots-Begründung im Law Catalog hängt daran — IndexedDB, OPFS, File System Access und Service Worker sind **mit einem nicht mehr existierenden Argument** verboten. Die Verbote mögen aus anderen Gründen sinnvoll bleiben, aber die Begründung ist hinfällig und muss neu geschrieben werden. Das betrifft auch den Code (P2-3 im Code-Audit: toter `file://`-Fallback, 170 KB `plz-embedded.js`).

**Das ist der wichtigste inhaltliche Fund dieses Audits.** Eine Entscheidung dazu räumt gleichzeitig in Doku *und* Code auf.

### W2 — `docs/index.md`, Dezimalrahmen-Block
```
30-meta/            --> Projektgedächtnis, Decision-Log, Changelog & Tooling (STATUS)
30-meta/            --> Projektgedächtnis & Arbeitsweise (WIE gearbeitet wird)
```
`30-meta` steht zweimal, `90-archive` fehlt im angeblich „5-stufigen" Rahmen (der damit 4 Stufen hat).

### W3 — `AI-AGENTS-CLI.md` liegt nicht, wo die Doku sagt
`docs/index.md` schreibt: „**Ausserhalb von `docs/`, im Repository-Root:** AI-AGENTS-CLI.md" — verlinkt dann aber auf `30-meta/AI-AGENTS-CLI.md`. Die Datei liegt tatsächlich in `docs/30-meta/`. Steht an zwei Stellen in derselben Datei falsch.

### W4 — Branch-Regel vs. Realität
`AGENTS.md` §2 und `docs/index.md` Leitregel 4: „Branchless Workflow, nur `main`, Feature-Branches sind **verboten**." Das Repo hat genau **1 Commit** — die Regel ist nie getestet worden und kollidiert mit jedem PR-basierten Review (auch mit dieser Session). Entweder bewusst bestätigen oder realistisch formulieren.

### W5 — Stale Statusangaben
- `CLAUDE.md`: „Projektstatus (Stand: **2026-08-07**)", „Offene Punkte (Stand: 2026-08-07)" — zwei Monate alt, im Dokument, das laut eigenem Vorwort „automatisch beim Session-Start gelesen" wird.
- `CHANGELOG.md`: `updated: 2026-07-07` — drei Monate alt, während `DECISION-LOG.md` auf `2026-09-30` steht. Zwei Chroniken, eine davon stillgelegt.
- 41 Dateien tragen alle dasselbe `updated: 2026-09-30`. Das Feld wurde offenbar in einem Rutsch gestempelt und trägt damit **keine Information** mehr — man kann nicht erkennen, was wirklich frisch ist.

---

## 4. Was ist wirklich wichtig? (Nach Nutzungsnachweis)

Ich habe geprüft, welche Docs **vom Code aus referenziert** werden (`@adr` / `@guide`-Kommentare):

### ⭐⭐⭐ Harter Kern — ohne diese 9 verliert man echtes Wissen
| Dokument | Code-Referenzen |
|---|---:|
| `20-implementation/din-5008-css-architektur.md` | 13 |
| `10-architecture/ADR-JS.md` | 12 |
| `10-architecture/ADR-CSS.md` | 7 |
| `20-implementation/glossary.md` | 5 |
| `10-architecture/ADR-DATA-PERSISTENCE.md` | 3 |
| `20-implementation/geoapify-autocomplete.md` | 2 |
| `10-architecture/ADR-OFFLINE-ADDRESS-INTELLIGENCE.md` | 2 |
| `20-implementation/no-scroll-techniques.md` | 1 |
| `10-architecture/ADR-HTML.md` | 1 |

Dazu, ohne Code-Link aber sachlich unverzichtbar:
- **`Immutable-Law-Catalog.md`** — die eine Gesetzesquelle (soll es jedenfalls sein)
- **`IMR-Registry.md`** (475 Z.) — die 45 Atome + DIN-Millimeter, echte SSoT ohne Ersatz
- **`00-foundation/spec.md`** — was das Produkt fachlich leisten soll
- **`AGENTS.md`** — der Verhaltensvertrag, auf den alles verweist
- **`DECISION-LOG.md`** (958 Z.) — Append-only-Chronik, erklärt *warum* Dinge so sind. Mehrfach hat sie mich im Code-Audit davor bewahrt, korrekte Lösungen fälschlich als Antipattern zu melden.

### ⭐⭐ Nützlich, aber straffbar
`Salutation-Engine.md`, `ADR-TOAST-SYSTEM.md`, `ADR-SENDER-SYNCHRONIZATION.md`, `Feature-Matrix.md`, `testing-guide.md`, `longevity-guidelines.md`, `ADR-TEMPLATE.md` / `GUIDE-TEMPLATE.md`, `tooling-overview.md`, `README-DB.md`

### ⭐ Kandidaten zum Streichen oder Zusammenlegen
| Dokument | Z. | Befund |
|---|---:|---|
| `ADR-ANTIPATTERN.md` | 185 | **Vollduplikat** von Law Catalog PART II in anderer Form |
| `constitution.md` | 110 | §2 dritte Verbotskopie; §1/§3 sind Mission + Prinzipien → in `spec.md`/Law Catalog aufgehen lassen |
| `GEMINI.md` | 166 | 28 Regeln, überschneiden sich fast vollständig mit Law Catalog + ADR-ANTIPATTERN. Einziges Root-MD **ohne Frontmatter**; Titel „Andrej Karpathy LLM Coding Principles" ist nicht projektspezifisch |
| `CLAUDE.md` | 291 | Zu 60 % Verbots-Wiederholung + veralteter Projektstatus. Der wertvolle Teil (Ordnerstruktur-Erklärung) gehört nach `docs/index.md` |
| `sqlite-vec.md` | 395 | `status: draft`, größtes Dokument in 20-implementation, beschreibt **Agenten-Tooling**, nicht das Produkt. Gehört nach `30-meta/` |
| `OBSIDIAN-SETUP-GUIDE.md` | 333 | Persönliche Editor-Einrichtung eines Solo-Devs — nicht Projektwissen |
| `CHANGELOG.md` | 103 | Seit 2026-07-07 tot, inhaltlich vom DECISION-LOG überholt |
| `architektur-evolution-und-quellen.md` | 102 | Historie → `90-archive/` |
| `tool-result-vocabulary.md` | 182 | Agenten-Metasprache, kein Produktwissen |
| `web-standards-tracking.md` | 162 | Momentaufnahme Browser-Features — altert von selbst, überschneidet sich mit `longevity-guidelines` §1.1 |
| `HYBRID-SPEC-DRIVEN-WORKFLOW.md` | 116 | Vierte Beschreibung des Workflows (nach AGENTS §3, index.md Stufe 5, DEV-INFO) |
| `DEV-INFO.md` | 156 | Überschneidet sich mit README + tooling-overview |

### 🗑️ Falsch einsortiert / Altlast
`docs/90-archive/` ist mit **260 KB die größte Einzellast** des Doku-Baums:
- `foundation_inventory.json` (77 KB) + `implementation_and_meta_inventory.json` (77 KB) = **154 KB stale JSON-Snapshots**. `docs/index.md` nennt sie selbst „stale Inventar-Snapshots" und verweist trotzdem auf sie als „SSoT für KI-Agenten" — ein Widerspruch in einem Satz. **Diese 154 KB können ersatzlos weg**, die Datenbank aus `build_db.js` ist der lebende Ersatz.
- `decision-log-archiv-2026-05-08.md` (534 Z.) — löst zusätzlich eine `[LOW]`-Warnung im Fitness Gate aus (>400 Zeilen).
- **4 von 8 Archivdateien tragen `status: active`** statt `archived` (`DIN-BriefNEO_memory_konsolidiert.md`, `PROJECT.md`, `architecture-drift-audit-2026-08-27.md`, `FOUNDATION-RESTORATION-PLAN.md` steht auf `proposed`). Wer nach aktiven Dokumenten filtert, bekommt Archivinhalte serviert.

### Außerhalb `docs/`
`research/` (1,1 MB, 2.814 Zeilen MD + 20 Python-Skripte) ist abgeschlossene Laborarbeit, deren Ergebnis längst als `.json.gz` in `website/data/` liegt. Das ist kein Doku-Problem, aber der größte Ordner im Repo — Kandidat für ein separates Repo oder einen Release-Anhang.

---

## 5. Zielbild: von 49 auf ~25 Dokumente

```
docs/
├── index.md                      Hub (korrigiert, Dezimalrahmen stimmig)
├── 00-foundation/
│   ├── Immutable-Law-Catalog.md  ⭐ DIE Gesetzesquelle — absorbiert ADR-ANTIPATTERN
│   │                                und constitution §2; file://-Begründungen neu
│   ├── spec.md                   ⭐ absorbiert constitution §1 (Mission)
│   └── longevity-guidelines.md   ⭐ absorbiert web-standards-tracking
├── 10-architecture/
│   ├── IMR-Registry.md           ⭐ SSoT Geometrie
│   ├── ADR-HTML / CSS / JS       ⭐ code-referenziert
│   ├── ADR-DATA-PERSISTENCE.md   ⭐ code-referenziert
│   ├── ADR-OFFLINE-ADDRESS-INTELLIGENCE.md ⭐
│   ├── ADR-TOAST-SYSTEM.md
│   ├── ADR-SENDER-SYNCHRONIZATION.md
│   └── ADR-OMNITRACEABILITY.md   (tote Links reparieren!)
├── 20-implementation/            nur noch Produktwissen
│   ├── din-5008-css-architektur.md ⭐ meistreferenziert
│   ├── glossary.md ⭐ · no-scroll-techniques.md ⭐
│   ├── geoapify-autocomplete.md ⭐ · Salutation-Engine.md
│   └── testing-guide.md
├── 30-meta/                      Arbeitsweise & Tooling
│   ├── DECISION-LOG.md ⭐ · ROADMAP.md · Feature-Matrix.md
│   ├── ADR-TEMPLATE.md · GUIDE-TEMPLATE.md · schema-v6.json
│   ├── tooling-overview.md       absorbiert DEV-INFO + README-DB + sqlite-vec
│   └── AI-AGENTS-CLI.md
└── 90-archive/                   nur MD, alle status: archived, keine 154 KB JSON
```

Root: `README.md` (Nutzer) · `AGENTS.md` (der *eine* Vertrag, absorbiert GEMINI.md) · `CLAUDE.md` → auf ~40 Zeilen Verweisdatei schrumpfen · `SECURITY.md` · `LICENSE`

**Netto: −≈2.500 Zeilen Markdown und −154 KB JSON, ohne dass ein einziger Fakt verloren geht** — jeder gestrichene Inhalt existiert bereits an anderer Stelle.

---

## 6. Reihenfolge

| # | Maßnahme | Aufwand | Risiko |
|---|---|---|---|
| 1 | **Fitness Gate reparieren** (`links.js`: generierte Ziele auch als Linkziel ignorieren) | klein | gering |
| 2 | 154 KB stale Inventar-JSONs löschen + `docs/index.md`-Verweis raus | winzig | keins |
| 3 | 4 Archivdateien auf `status: archived` setzen | winzig | keins |
| 4 | `docs/index.md`: W2 (30-meta doppelt), W3 (falscher Pfad), W1 (file://-Leitregel) korrigieren | klein | keins |
| 5 | **`file://`-Grundsatzentscheidung** — danach Doku *und* Code bereinigen | mittel | **hoch, blockiert viel** |
| 6 | `ADR-ANTIPATTERN` in Law Catalog auflösen, Stub mit Verweis | mittel | mittel |
| 7 | `GEMINI.md` + `CLAUDE.md`-Verbote in `AGENTS.md` auflösen | mittel | mittel |
| 8 | `CLAUDE.md`-Status-Blöcke entfernen (stale per Konstruktion) | klein | keins |
| 9 | Agenten-Tooling-Docs nach `30-meta/` umziehen | klein | gering |
| 10 | `updated:`-Felder wieder echt pflegen (oder Feld streichen) | — | — |
| 11 | `research/` auslagern | mittel | gering |

Schritte 1–4 sind in einer Sitzung machbar und **machen den Gate zum ersten Mal wieder grün** — Voraussetzung dafür, dass nach AGENTS.md überhaupt am Code gearbeitet werden darf.

---

## 7. Die unbequeme Kernaussage

Das Projekt hat eine **ungewöhnlich gute Begründungskultur** — das DECISION-LOG und die Guard-Kommentare sind echter Mehrwert und haben mich im Code-Audit messbar vor Fehlurteilen bewahrt. Das ist erhaltenswert.

Das Problem ist nicht *zu viel Dokumentation*, sondern **zu viele Orte für dieselbe Aussage**. Fünf Verbotskataloge sind kein fünffacher Schutz, sondern fünf Stellen, an denen beim nächsten Umbau vier vergessen werden. Genau das ist beim `file://`-Thema bereits passiert: Die Realität hat sich geändert, drei Dokumente wurden nachgezogen, fünf nicht — und der Law Catalog begründet nun fünf Verbote mit einer Voraussetzung, die es nicht mehr gibt.

Der Law Catalog hat das selbst vorhergesehen und ein Kapitel dagegen geschrieben. Es wird nur nicht befolgt.
