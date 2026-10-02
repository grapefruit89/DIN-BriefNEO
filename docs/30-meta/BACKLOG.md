---
id: backlog
title: Backlog — offene Baustellen nach Aufwand und ROI
status: active
type: reference
created: '2026-10-02'
updated: '2026-10-02'
tags:
- din-briefneo
- meta
- planung
- backlog
doc_links:
- '[[AGENTS]]'
- '[[DECISION-LOG]]'
- '[[ROADMAP]]'
- '[[code-audit-website-2026-10-02]]'
- '[[docs-audit-2026-10-02]]'
code_links:
- 'website/js/03-ui-protections.js'
- 'website/css/sheet.css'
- 'tools/links.js'
depends_on: []
supersedes: []
---

# Backlog — offene Baustellen

Abgeleitet aus [[code-audit-website-2026-10-02]] und [[docs-audit-2026-10-02]].
Nicht normativ — die **Regeln** stehen in [[AGENTS]] §5, die **Begründungen** im
[[DECISION-LOG]]. Dieses Dokument hält nur, *was noch zu tun ist* und *in welcher Reihenfolge*.

**Aufwand:** S ≤ 1 Sitzung · M = 1–2 Sitzungen · L = Full Mode mit `specs/` + ADR
**ROI:** Nutzen pro Aufwand — ⭐⭐⭐ hoch, ⭐ niedrig

---

## ✅ Bereits erledigt (2026-10-02)

| ID | Was | Commit |
| :--- | :--- | :--- |
| — | Fitness Gate repariert (war auf `main` rot, 99,88 %) | `5c4a4de` |
| — | Doku-Quick-Wins: 154 KB stale JSONs, Archiv-Status, `index.md` | `5c4a4de` |
| P1-1 | Metadata: doppelte Namensableitung → `collectLetterIdentity()` | `a30cdfc` |
| P1-2 | Settings-Race: `SalutationFeature` bekommt Owner injiziert | `a30cdfc` |
| — | Doku-Governance `AGENTS.md` §5 + DECISION-LOG-Schema | `5996411` |
| P1-3 | Postvermerk: drei Listener → ein Owner | `7d52cbe` |
| P2-2 | gzip-Pipeline 3× kopiert → `05-gzip.js` | `7d52cbe` |
| P2-5 | `setTimeout(…,100)` → natives `afterprint` | `7d52cbe` |
| P2-6 | `document.title`: zwei Schreiber → Vorrangregel | `7d52cbe` |
| **B1** | **`file://` als Laufzeitziel gestrichen** ([[ADR-RUNTIME-CONTEXT]]) | s. u. |
| **B2** | **`plz-embedded.js` (164 KB) + alle Protokoll-Guards entfernt** | s. u. |

---

## 🔴 Priorität 1 — blockiert anderes

*Derzeit leer — B1 ist am 2026-10-02 entschieden und umgesetzt
([[ADR-RUNTIME-CONTEXT]]), B2 damit erledigt. Nichts blockiert mehr.*

---

## 🟠 Priorität 2 — hoher Nutzen, klar abgegrenzt

### B3 · `ADR-ANTIPATTERN` in den Law Catalog auflösen · **M** · ⭐⭐⭐
185 Zeilen, inhaltlich Volldublette von Law Catalog PART II (A1–A50) in anderer Darstellung.
**Zu tun:** Inhalte abgleichen, Einzigartiges in den Catalog übernehmen, Datei durch Stub mit
Verweis ersetzen (Code referenziert sie nicht per `@adr`, aber `docs/index.md` tut es).
**Nutzen:** Entfernt die zweite von fünf Verbotskopien — die Quelle der A50-Drift.

### B4 · `GEMINI.md` + `CLAUDE.md`-Verbote in `AGENTS.md` auflösen · **M** · ⭐⭐⭐
`GEMINI.md` (166 Z., 28 Regeln, kein Frontmatter, Titel „Andrej Karpathy LLM Coding Principles")
und der Verbotsblock in `CLAUDE.md` (294 Z.) sind Kopie 4 und 5.
**Zu tun:** Projektspezifisches nach `AGENTS.md`/Law Catalog, Rest streichen; `CLAUDE.md` auf eine
schlanke Verweisdatei reduzieren, Status-Blöcke („Stand: 2026-08-07") entfernen —
die sind per Konstruktion veraltet (verstösst gegen `AGENTS.md` §5.4).

### B5 · Agenten-Tooling-Docs nach `30-meta/` · **S** · ⭐⭐
`sqlite-vec.md` (395 Z., `status: draft`) liegt in `20-implementation/` und beschreibt vier
Tools, die es nicht gibt — sie ist ein **Plan**, kein Guide. Ebenso `README-DB.md` und
`tool-result-vocabulary.md`.
**Zu tun:** Umziehen; `sqlite-vec.md` entweder als ROADMAP-Eintrag führen oder archivieren.
Verstösst aktuell gegen `AGENTS.md` §5.2 („Agenten-Tooling ist kein Produktwissen").

---

## 🟡 Priorität 3 — gute Verbesserung, grösserer Eingriff

### B6 · Feldlisten deklarativ per `data-feld` · **L** (Full Mode) · ⭐⭐⭐
**Problem:** 14 Stellen in `01`, `03`, `main.js` und `boot-state.js` kennen die Sonderfälle als
String-Literale (`id === 'datum'`, `id === 'text' || id === 'anlagen-text'`, `multiLineIds`,
`maxTwoLinesIds`). Ein neues Feld anzulegen heisst, an 4–5 Orten nichts zu vergessen.
**Zu tun:** `data-feld="rich|single|zweizeilig|fluechtig"` im HTML als SSoT, kleines
`fields.js` mit `forEachField()`. Braucht `specs/`-Ordner + ADR.
**Nutzen:** Grösster Struktur-Gewinn des Codes; beseitigt die brüchigste Stelle des Projekts.

### B7 · `attr()`-Geometrie statt doppelter mm-Werte · **L** · ⭐⭐
46 `mm`-Werte in `sheet.css` + 8 in `variables.css` spiegeln die 17 `data-*-y-*`-Attribute am
`<din-a4>`. Die DIN-Geometrie existiert damit zweimal.
**Zu tun:** `attr(data-datum-y-b type(<length>))` (Chrome 133+, Baseline 150+ erfüllt).
**Risiko:** hoch — betrifft die normative Geometrie. Nur mit Sichtprüfung gegen die
`research/din-5008-svgs/`-Referenzen.

### B8 · Die 12 Nicht-Print-`!important` auflösen · **M** · ⭐⭐
`floating.css` 7, `reset.css` 5, `signature.css` 4, `sidebar.css` 2, `layout.css` 1.
Das Projekt nutzt `@layer` — Layers lösen Spezifitätskonflikte per Design. Die 18 in
`print.css` bleiben (Druck muss gewinnen).

### B9 · Caret-Utilities zusammenführen + `TreeWalker` · **M** · ⭐⭐
15 Stellen mit `createRange`/`getSelection`/`nodeType === 3` in `01`, `03`, `45`.
Der manuelle rekursive Node-Walk in `#setCaretPosition` (~40 Z.) wird mit
`document.createTreeWalker(elem, NodeFilter.SHOW_TEXT)` zu ~12 Zeilen — native API
statt Handarbeit, im Sinne von A49.

---

## 🟢 Priorität 4 — Hygiene

### B10 · `research/` auslagern · **S** · ⭐⭐
1,1 MB, 86 getrackte Dateien, 20 Python-Skripte — abgeschlossene Laborarbeit, deren Ergebnis als
`.json.gz` in `website/data/` liegt. Grösster Ordner im Repo.
**Achtung:** `41-salutation-engine.js` und `ADR-OFFLINE-ADDRESS-INTELLIGENCE` verweisen auf die
Provenienz der Datensätze — vor dem Auslagern Referenzen prüfen (Lehre aus 2026-09-30:
Markdown-Links sieht das Wikilink-Gate nicht).

### B11 · `_`-Prefix → `#private` vereinheitlichen · **S** · ⭐
`01`, `41`, `53` mischen `#private`, `_underscore` und public. Rein mechanisch, kein
Verhaltensrisiko.

### B12 · Logging-Konvention · **S** · ⭐
21 `console.*` ohne einheitliches Präfix. Vorschlag `[DIN-BriefNEO/<Modul>]`.
Zusätzlich: die beiden leeren `catch (e) {}` in `boot-theme.js`/`boot-state.js` loggen lassen —
aktuell sind Boot-Fehler inklusive Draft-Verlust unsichtbar.

### B13 · Guard-Kommentare entdoppeln · **S** · ⭐
Fünf „🛡️ ARCHITECTURE GUARD"-Blöcke stehen wortgleich in `index.html` **und** im Modul
(~60 Z. Redundanz). Guard-Text ins Modul, HTML bekommt einen Einzeiler-Verweis
(`AGENTS.md` §5.4).

### B14 · Vier ungenutzte IDs entfernen · **S** · ⭐
`btn-confirm-import`, `btn-confirm-reset`, `seitenleiste-ai-switch-row`,
`zwischenablage-anschrift-wrapper`.
**Nicht anfassen:** `btn-style-formal|polite|casual` — die sehen nur tot aus, werden aber in
`41-salutation-engine.js` per Template-String (`` `btn-style-${…}` ``) gebaut.

### B15 · Log-Behauptungen gegen den Code prüfen · **M** · ⭐⭐
Der DECISION-LOG stellt Behauptungen über den Istzustand auf („Datei X hat jetzt N Zeilen",
„Baseline ist Chrome 150+"). Prüfen und kategorisieren: *stimmt* / *Code anpassen* /
*neuer Log-Eintrag*. **Niemals** Alteinträge korrigieren — Append-only ([[DECISION-LOG]]).

---

## Empfohlene Reihenfolge

1. ~~**B1**~~ ✅ erledigt 2026-10-02 · ~~**B2**~~ ✅ erledigt 2026-10-02
2. **B3 → B4** — die beiden grossen Doppelungen, grösster Doku-Gewinn
3. **B12, B13, B14, B11** — Hygiene, lässt sich gut zwischenschieben
4. **B5, B10** — Umzüge
5. **B6** — Full Mode, braucht eigene Sitzung
6. **B8, B9, B15**
7. **B7** zuletzt — höchstes Risiko, niedrigster Zwang
