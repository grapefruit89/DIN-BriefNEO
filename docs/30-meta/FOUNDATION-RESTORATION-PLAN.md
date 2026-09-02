---
id: foundation-restoration-plan
title: Foundation Restoration Plan v2
type: plan
status: proposed
created: '2026-09-02'
updated: '2026-09-02'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/proposed
  - type/plan
doc_links:
  - constitution
  - Immutable-Law-Catalog
  - spec
  - longevity-guidelines
  - HYBRID-SPEC-DRIVEN-WORKFLOW
supersedes: []
depends_on: []
code_links: []
---

# Foundation Restoration Plan v2

Stand: `main` @ 2026-09-02.  
Quelle: Cross-Audit der sieben Dateien in `docs/00-foundation/` gegen den aktuellen Code (`website/`) und den Docs-Tree.

Dieses Dokument ist **kein** Foundation-Dokument. Es ist ein Änderungsvorschlag.
`docs/00-foundation/` bleibt read-only, bis ein Mensch die einzelnen Schritte freigibt.

Website-Phase-2 (CSS-Kill) und Custom-Element-Umbau warten auf Schritt 11.

---

## 0. Nicht verhandelbar — bleibt

Diese Sätze sind bereits gut. Sie werden nicht aufgeweicht.

- HTML first → CSS second → JS last
- Zero runtime dependencies
- Zero-Build / Vanilla
- Offline-first / `file://`
- Native Web Platform vor Bibliotheken
- Unique IDs
- Keine Legacy-APIs als Default
- Layout in CSS, nicht in JS-Messschleifen
- Foundation nur mit menschlichem Entscheid ändern

Neuer zentraler Satz (in die Constitution, nicht in den Catalog als Feature-Liste):

> Normative Fakten werden genau einmal an der fachlich zuständigen semantischen Dokumentgrenze definiert. CSS interpretiert diese Fakten. JavaScript darf sie nicht duplizieren oder neu definieren.
>
> One fact. One semantic owner. One source of truth.

---

## 1. Zielhierarchie

```
CONSTITUTION          unveränderliche Projektprinzipien
    |
LAW CATALOG           Verbote + Plattformprinzipien (keine Feature-Listen)
    |
SPEC                  WAS das Produkt leisten muss
    |
ARCHITECTURE / ADR    WIE wir das umsetzen
    |
GUIDES / WORKFLOW     WIE wir täglich arbeiten
```

| Datei heute | Rolle heute | Rolle v2 | Aktion |
|---|---|---|---|
| `README.md` | Index + Warnung | Index + explizite Hierarchie | säubern |
| `constitution.md` | Prinzipien + Technikmix | nur Prinzipien | säubern |
| `Immutable-Law-Catalog.md` | MUST-USE-Liste + 15 CEs + E1–E15 | Verbote + Prinzipien | entschärfen |
| `spec.md` | Spec + Plan + Tasks + Backlog + CSS | nur Anforderungen | zurückschneiden |
| `longevity-guidelines.md` | Kriterien + Baseline-Mix | Entscheidungsmodell | präzisieren |
| `HYBRID-SPEC-DRIVEN-WORKFLOW.md` | Workflow in Foundation | Policy | verschieben |
| `audit_summary.md` | archivierter Audit | Meta-Historie | verschieben |

`docs/90-policy/` wird in der Foundation-README genannt, **existiert im Repo nicht**. Anlegen, wenn der Workflow umzieht.

---

## 2. Reihenfolge (menschlich freigeben, dann ausführen)

Nicht parallel. Jeder Schritt endet mit: Diff lesen → Mensch sagt ja → Commit.

### Schritt 1 — Hierarchie im Foundation-README festschreiben

Nur `docs/00-foundation/README.md`.

- Tabelle um eine Spalte `Normative Ebene` ergänzen
- Satz aufnehmen: Spec ist nicht SSoT für Millimeter
- Satz aufnehmen: HTML-Dokumentwurzel ist SSoT für DIN-Geometrie
- `HYBRID-SPEC-DRIVEN-WORKFLOW` und `audit_summary` als „liegt hier historisch, Umzug geplant“ markieren — noch nicht verschieben

Risiko: niedrig. Kein Code.

### Schritt 2 — Constitution säubern

Datei bleibt. Inhalt auf Prinzipien reduzieren.

Korrigieren:

| Alt | Neu |
|---|---|
| JS als „deklarative Logik-Schicht“ | JS als imperative Orchestrationsschicht für echte Dynamik |
| „Kein einziger Scrollbalken“ | Kein unkontrolliertes Dokument-/Seiten-Scrolling. Kontrolliertes internes Scrollen MAY, wo UI es braucht |
| LocalStorage als Naturgesetz | Bewusste Entscheidung wegen `file://` / Offline |
| fehlender SSoT-Satz | Satz aus Abschnitt 0 aufnehmen |

Nicht in die Constitution: konkrete Tag-Namen, `cqw`, `94vh`, Feature-Backlog.

Risiko: mittel. ADRs und AGENTS.md zitieren Formulierungen — nachziehen in Schritt 10.

### Schritt 3 — Law Catalog entschärfen

Größter einzelner Schnitt.

H1 (15 Pflicht-Custom-Elements) aus MUST-USE entfernen. Ersetzen durch Prinzip:

> Semantische Custom Elements MAY/SHOULD dort verwendet werden, wo sie stabile Domänenobjekte sind und strukturellen Nutzen haben. Implementierungs-Wrapper (`<din-flex-row>`, `<din-container>`) sind verboten. `customElements.define()` ist nicht Voraussetzung für den Tag-Namen.

Aktueller Code widerspricht der Pflichtliste bereits:

| Catalog MUST-USE | Ist in `website/index.html` |
|---|---|
| `<din-5008>` `<din-page>` | `<din-a4>` |
| `<din-address-zone>` `<din-recipient>` | `<din-anschriftfeld>` |
| `<din-subject>` `<din-salutation>` `<din-body>` `<din-closing>` | IDs in `<din-kern>` |
| `<din-bank-data>` `<din-fiscal-data>` `<din-vcard>` | nicht vorhanden |

Die Ist-Tags bleiben. Der Catalog hört auf, eine zweite Wahrheit zu sein.

Popover, `plaintext-only`, `commandfor`, `:has()`, `attr()`: von MUST-USE-API auf **verbindliches Prinzip + bevorzugte Plattform** stufen. Neue native Alternative darf nach Longevity-Check ersetzen — das ist kein Gesetzesbruch.

Risiko: hoch politisch, niedrig technisch. Code ändert sich in diesem Schritt nicht.

### Schritt 4 — E1–E15 Redundancy-Mandate ersetzen

Anti-SSoT. Ersetzen durch:

```
LAW CATALOG          eine autoritative Quelle
    ├── Verweise (Links, IDs)
    ├── generierter Index (agent/cache, nicht Produkt)
    └── Agent-Kontext referenziert, kopiert nicht
```

Kein Spiegeln des Catalogs in Constitution, README, GEMINI, SQLite-Volltext, Views und Code-Review-Checklisten.

Risiko: mittel für Tooling (`create_context.js`, MCP). Pipeline zeigt danach auf IDs, nicht auf kopierten Gesetzestext.

### Schritt 5 — Spec auf Anforderungen zurückführen

Aus `spec.md` entfernen oder nach `10-architecture` / `20-implementation` / `30-meta/ROADMAP.md`:

- `height: 94vh`, `aspect-ratio`, `container-type`, `cqw`/`cqh`
- `#paper`, `transform`, `--page-current`, `<template id="tpl-din-page">`
- Specify / Plan / Tasks als eingebetteter Mini-Wasserfall
- Feature 7–11 (Backlog, Geschlechtserkennung als Produktfix, zeitbasierter Dark Mode 18:00–06:00, Easter Eggs)

Spec sagt danach nur:

- ein DIN-5008-Brief muss Form A und Form B können
- Fenster, Falz, Lochung, Ränder müssen stimmen
- Offline, Druck, LocalStorage-Entwurf
- keine Runtime-Dependencies

Geometrie-SSoT-Satz in der Spec ersetzen:

> Dieses Dokument ist nicht die Quelle der Millimeter.
> Die ausführbare Quelle ist der Dokument-Root in `website/index.html` (`<din-a4 data-*>`).
> Die Spec definiert, welche Zonen existieren müssen. HTML trägt die Zahlen. CSS liest sie.

Risiko: mittel. `20-implementation/din-5008-css-architektur.md` und ADR-HTML müssen denselben Satz bekommen.

### Schritt 6 — DIN-SSoT formal festlegen

Eine Wahrheit, drei Rollen:

| Schicht | Darf | Darf nicht |
|---|---|---|
| HTML `<din-a4 data-*>` | normative mm-Fakten | Darstellung |
| CSS `attr()` | ableiten, fallbacken | zweite Tabelle derselben Zahlen als Gesetz |
| JS | dynamisches Verhalten | 210/297/148.5 als Konstanten |

Offen, bewusst später (website Phase 2+): horizontale Maße 20/25/85/125/75 noch von CSS nach `data-*` heben. Nicht in diesem Foundation-Schritt.

Risiko: niedrig, solange Zahlen nicht geändert werden.

### Schritt 7 — Longevity präzisieren

Ein Entscheidungsmodell statt Mythos:

1. Standardstatus (Living Standard / REC / Draft)
2. Browser-Baseline — **eine** Zahl, projektweit
3. Feature-Reife (widely available vs newly available)
4. Fallback-Politik (`attr()`-Fallback ist erlaubt; JS-Polyfill für Layout nicht)

Streichen oder entschärfen: „W3C-Garantie der Abwärtskompatibilität“.
Chrome-Baseline in allen Docs auf **einen** Wert vereinheitlichen (heute 148 / 149 / 148+ / 149+ gemischt). Vorschlag zur Entscheidung: eine Baseline, dokumentiert nur in `longevity-guidelines.md`, alle anderen Dateien verweisen.

Risiko: niedrig.

### Schritt 8 — Workflow aus Foundation lösen

`HYBRID-SPEC-DRIVEN-WORKFLOW.md` → `docs/90-policy/HYBRID-SPEC-DRIVEN-WORKFLOW.md`  
Ordner `docs/90-policy/` anlegen (README der Foundation verspricht ihn bereits).

Foundation-README verweist. Workflow verweist zurück. Workflow ist nicht mehr „unveränderliches Gesetz“.

`code_links` im Workflow gegen den aktuellen Tree prüfen (`tools/build_db.js`, `tools/log_session.js`, `tools/reconciliation.js` — letzteres prüfen, ob es noch existiert).

Risiko: niedrig, wenn nur Move + Link-Update.

### Schritt 9 — historischen Audit verschieben

`audit_summary.md` → `docs/30-meta/audits/audit_summary-2026-07-01.md`  
Status bleibt `archived`. Kein Foundation-Bestandteil mehr.

Risiko: keines.

### Schritt 10 — Cross-References reparieren

Nach den Moves:

- `docs/00-foundation/README.md`
- `docs/index.md`
- `AGENTS.md` / `CLAUDE.md`
- ADRs, die Catalog-H1 oder Spec-Millimeter zitieren
- `docs/30-meta/tooling-overview.md`

Regel: Link auf ID, kein zitierter Gesetzestext.

Risiko: mittel (viele Dateien), inhaltlich mechanisch.

### Schritt 11 — Foundation einfrieren, erst dann Code

Erst wenn 1–10 auf `main` sind:

1. Fitness-Gate
2. website Phase 2 CSS-Kill gegen das neue Gesetzbuch
3. Custom Elements nur gegen die entschärfte H1-Regel (keine 15er-Pflichtliste, keine `define()`)

---

## 3. Entscheidungen, die ein Mensch treffen muss

Nicht Grok, nicht ChatGPT.

| Thema | Option A | Option B | Empfehlung |
|---|---|---|---|
| Custom Elements | 15 MUST-USE Tags | semantische Domänen-Tags wo begründet | B — entspricht dem Ist-HTML |
| Wurzel-Tag | Catalog `<din-5008>`/`<din-page>` | Ist `<din-a4>` | Ist behalten, Catalog anpassen |
| Chrome-Baseline | 148+ | 149+ | eine Zahl wählen, Rest löschen |
| Scroll | kein Scroll irgendwo | kein Dokument-Scroll, internes MAY | zweites |
| LocalStorage | „IndexedDB geht nicht“ | „wir nutzen LS wegen file://“ | zweites |
| Multipage | Spec-Karussell `#paper` | später, nicht Foundation | raus aus Spec |

---

## 4. Was dieser Plan ausdrücklich nicht tut

- keine Änderung an `docs/00-foundation/` ohne Freigabe
- keine website-CSS-Phase-2
- keine neuen Custom Elements
- keine DIN-Zahlen ändern
- kein Build-System
- Catalog nicht durch 15 Kopien „absichern“

---

## 5. Vorschlag für den nächsten Commit

Nur dieses Dokument:

`docs/30-meta/FOUNDATION-RESTORATION-PLAN.md`

Danach Schritt 1 (README-Hierarchie), sobald du ja sagst.
