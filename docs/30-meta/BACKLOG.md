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
| **B3** | **`ADR-ANTIPATTERN` aufgelöst → `A51`–`A62`, `H11` im Law Catalog** | s. u. |
| **B4** | **`GEMINI.md`/`CLAUDE.md` auf Wegweiser reduziert, Regeln nach `AGENTS.md`/Catalog** | s. u. |
| **B16** | **Terminologie-Kanon im Glossar + Gate-Durchsetzung (`tools/terminology.js`)** | s. u. |
| **B5** | **Agenten-Tooling nach `30-meta/`; `CHANGELOG` + `OBSIDIAN-SETUP-GUIDE` archiviert** | s. u. |
| **B8** | **Alle 12 Screen-`!important` aufgelöst + CSS-Ursachen bereinigt** | `809eb15` |
| **B17** | **Strukturprüfungen für Gesetze ausgebaut (Abdeckung 21 → 30 von 35)** | `a16899c` |
| **B15** | **DECISION-LOG-Behauptungen geprüft, Append-Only-Nachtrag für KISS + B8 + B17** | s. u. |

---

## 🔴 Priorität 1 — blockiert anderes

*Derzeit leer — B1 ist am 2026-10-02 entschieden und umgesetzt
([[ADR-RUNTIME-CONTEXT]]), B2 damit erledigt. Nichts blockiert mehr.*

---

## 🟠 Priorität 2 — hoher Nutzen, klar abgegrenzt

## 🟡 Priorität 3 — gute Verbesserung, grösserer Eingriff

### B6 · Feldtypen deklarativ per `data-feldtyp` · **L** · ⭐⭐⭐ · ✅ PHASE 1 ERLEDIGT 2026-10-02
**Problem:** Mehrere Module kannten Feld-Sonderfälle über ID-Listen.
**Änderung:** `data-feldtyp` ist jetzt im HTML die Quelle für `rich`, `mehrzeilig`,
`zweizeilig`, `liste` und `systemwert`. Draft-Restore, Boot-Restore und UI-Schutz lesen
diese Eigenschaften statt parallele Feldlisten zu führen. Die gemeinsame Caret-Logik liegt
in `selection-utils.js`.
**Rest:** Ein vollständiger `fields.js`-Iterator ist erst sinnvoll, wenn weitere Feldtypen
hinzukommen; vorerst wäre er zusätzliche Abstraktion ohne weiteren Nutzerwert.

### B7 · `attr()`-Geometrie statt doppelter mm-Werte · **L** · ⭐⭐
46 `mm`-Werte in `sheet.css` + 8 in `variables.css` spiegeln die 17 `data-*-y-*`-Attribute am
`<din-a4>`. Die DIN-Geometrie existiert damit zweimal.
**Zu tun:** `attr(data-datum-y-b type(<length>))` (Chrome 133+, Baseline 150+ erfüllt).
**Risiko:** hoch — betrifft die normative Geometrie. Nur mit Sichtprüfung gegen die
`research/din-5008-svgs/`-Referenzen.

### B8 · Die 12 Nicht-Print-`!important` auflösen · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Alle 12 Screen-`!important` in den Autoren-Styles (`floating.css`, `layout.css`, `sidebar.css`, `signature.css`)
restlos aufgelöst (Commit `809eb15`). Root-Causes bereinigt: verfehlt platzierte Seitenleisten-Labels
nach `sidebar.css`, DIN-Elemente nach `sheet.css`, Postvermerk-Styling in `layout.css` konsolidiert,
`.hidden` und `#btn-ai-rewrite` über Layer-Hierarchie und native Spezifität gelöst.
Nur die 5 normativen `prefers-reduced-motion`-Resets in `reset.css` und die 18 in `print.css` bleiben bestehen.

### B9 · Caret-Utilities zusammenführen + `TreeWalker` · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Die gemeinsame native Selection-/Caret-Logik liegt in `website/js/selection-utils.js`.
DraftManager und Offline-Adressintelligenz verwenden jetzt denselben Utility-Pfad;
der manuelle rekursive Node-Walk wurde durch `TreeWalker` ersetzt.

---

## 🟢 Priorität 4 — Hygiene

### B10 · `research/` **statuskennzeichnen** (NICHT auslagern) · **M** · ⭐⭐⭐
**Neu gefasst 2026-10-02 nach Inventur** — siehe `[[research-inventar-2026-10-02]]`.
Die alte Fassung („1,1 MB auslagern") war falsch gestellt: 476 KB davon sind die beiden
DIN-5008-Normgeometrie-SVGs, und der Ordner enthält **nicht umgesetzte** UX-Spezifikationen
(→ B18, B19). Ungelesenes Auslagern hätte dieses Wissen vernichtet.
**Stattdessen:** Jede der 39 Markdown-Dateien bekommt im Frontmatter einen Status
(`umgesetzt` / `offen` / `verfallen`). Erst danach entscheiden, ob Erledigtes nach
`docs/90-archive/` wandert. Platz ist kein Problem — Ordnung ist das Problem.
**Achtung:** `41-salutation-engine.js` und `ADR-OFFLINE-ADDRESS-INTELLIGENCE` verweisen auf die
Provenienz der Datensätze — vor jedem Verschieben Referenzen prüfen (Lehre aus 2026-09-30:
Markdown-Links sieht das Wikilink-Gate nicht).

### B11 · `_`-Prefix → `#private` vereinheitlichen · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
`01`, `41`, `53` mischen `#private`, `_underscore` und public. Rein mechanisch, kein
Verhaltensrisiko.

### B12 · Logging-Konvention · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
21 `console.*` ohne einheitliches Präfix. Vorschlag `[DIN-BriefNEO/<Modul>]`.
Zusätzlich: die beiden leeren `catch (e) {}` in `boot-theme.js`/`boot-state.js` loggen lassen —
aktuell sind Boot-Fehler inklusive Draft-Verlust unsichtbar.

### B13 · Guard-Kommentare entdoppeln · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
Fünf „🛡️ ARCHITECTURE GUARD"-Blöcke stehen wortgleich in `index.html` **und** im Modul
(~60 Z. Redundanz). Guard-Text ins Modul, HTML bekommt einen Einzeiler-Verweis
(`AGENTS.md` §5.4).

### B14 · Vier ungenutzte IDs entfernen · **S** · ⭐ — ✅ ERLEDIGT 2026-10-02
`btn-confirm-import`, `btn-confirm-reset`, `seitenleiste-ai-switch-row`,
`zwischenablage-anschrift-wrapper`.
**Nicht anfassen:** `btn-style-formal|polite|casual` — die sehen nur tot aus, werden aber in
`41-salutation-engine.js` per Template-String (`` `btn-style-${…}` ``) gebaut.

### B15 · Log-Behauptungen gegen den Code prüfen · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
DECISION-LOG gegen den aktuellen Code-Stand abgeglichen. Neuer normativer Append-Only-Eintrag für die 5 KISS-Optimierungen (Event-Delegation, Caret-SSoT, Gzip-Pipeline, `.closest()`-Ancestor, StorageManager-Kapselung), den B8-Vollzug (`!important`-Beseitigung) und den B17-Phase-2-Gate-Ausbau (30/35 Gesetze) eingepflegt. Ältere historische Einträge bleiben gemäß DECISION-LOG-Governance strikt unverändert (Append-only).

---

## Empfohlene Reihenfolge

1. ~~**B1**, **B2**~~ ✅ erledigt 2026-10-02 (`file://` gestrichen)
2. ~~**B3**, **B4**, **B16**~~ ✅ erledigt 2026-10-02 (Kanonisierung: eine Quelle, ein Begriff)
3. ~~**B5**~~ ✅ erledigt 2026-10-02
4. ~~**B12, B13, B14, B11**~~ ✅ erledigt 2026-10-02
5. ~~**B10**~~ ✅ Research klassifiziert 2026-10-02 (`research/STATUS.md`)
6. ~~**B6**~~ ✅ Phase 1 erledigt 2026-10-02 (`data-feldtyp` + Caret-SSoT)
7. ~~**B8**~~ ✅ erledigt 2026-10-02 (`809eb15`), ~~**B15**~~ ✅ erledigt 2026-10-02, ~~**B17**~~ ✅ erledigt 2026-10-02 (`a16899c`)
8. **B7** zuletzt — höchstes Risiko, niedrigster Zwang

### B17 · Strukturprüfungen für die 14 nicht-regexfähigen Gesetze · **M** · ⭐⭐ · ✅ ERLEDIGT 2026-10-02
Vollständig umgesetzt (Commit `a16899c`):
1. `tools/structural-laws.js` prüft nun **A42** (doppelte IDs), **A57** (binäre Radios als Schalter), **A58** (Theme-Wahl als Radio), **A24** (Token ohne `:root`-Definition) und **A59** (Theme-Variablen auf dem DIN-A4-Blatt).
2. `tools/antipatterns/project.json` ergänzt um Sonden **P18** (A46: `page-break-before: always`), **P19** (A39: Icon-CDNs), **P20** (A21: CSS-Preprozessoren) und **P21** (A22: CSS-in-JS).
3. `tools/lawcoverage.js` verdrahtet die neuen Prüfer in `TOOL_ENFORCED`.
4. Gesetzliche Abdeckung von 21/35 auf **30/35 (85,7 %)** gesteigert. Die 5 verbleibenden Normen (A43, A44, A47, A60, A62) sind reine Gestaltungs-/UX-Grundsätze und werden bewusst nur berichtet.

### B18 · Adress-Dropdown mit der Tastatur bedienbar machen · **M** · ⭐⭐⭐⭐⭐ · ✅ ERLEDIGT 2026-10-02
**Härtester Fund der Research-Inventur und unabhängig von ihr gültig.**
`43-geoapify.js` → `renderSuggestions()` hängt ausschliesslich einen `click`-Listener an
jedes `<li>`. Kein `keydown`, kein `ArrowDown`/`ArrowUp`, kein `Enter`, kein
`role="listbox"`/`role="option"`, kein `aria-activedescendant`. Wer die Maus nicht
benutzt, kann keine Adresse übernehmen. Das wiegt schwerer als jedes offene CSS-Feature.
Umsetzung vor B19, weil B19 darauf aufbaut.

### B19 · Adaptive 3-Zonen-Logik + Zero-Click-Autofill · **L** · ⭐⭐⭐⭐ · ✅ PHASE 1 ERLEDIGT 2026-10-02
Quelle: `research/roadmap/ADAPTIVE_DROPDOWN_THRESHOLD_SPEC.md` und
`ZERO_CLICK_UNIQUE_AUTOCOMPLETE_UX.md`. Phase 1 ist umgesetzt: > 5 Treffer zeigen
nur einen Eingrenzungshinweis, 2–5 Treffer erscheinen als Liste, genau 1 Treffer wird
nach dem vollständigen lokalen/Remote-Abgleich automatisch übernommen. Die vorherige
willkürliche `slice(0, 6)`-Anzeige ist entfernt. Rest: bidirektionales Formular-
Orchestrieren und ein expliziter Nutzer-Schalter für Zero-Click müssen separat bewertet
werden.

### B20 · `fetch()`-Zeitlimits in `43-geoapify.js` · **S** · ⭐⭐⭐⭐ · ✅ ERLEDIGT 2026-10-02
Alle drei Geoapify-Anfragen haben jetzt ein natives 8-Sekunden-Limit über
`AbortSignal.timeout()`; die laufende Suche kombiniert es mit dem bestehenden
`AbortController` über `AbortSignal.any()`. Der H2-Guard (Key nur bei 401/403 löschen)
bleibt unverändert.

### B21 · Offene CSS-Features bewerten: `@page`-Seitenzahlen, `::highlight()`, `subgrid` · **M** · ⭐⭐ · ✅ BEWERTET 2026-10-02
Die drei Kandidaten ersetzen im aktuellen Ein-Seiten-/absoluten DIN-Layout keinen
bestehenden JavaScript-Pfad sicher. `@page`-Seitenzahlen warten auf die
Mehrseiten-Spec; `::highlight()` hat keinen vorhandenen DOM-Highlight-Renderer;
`subgrid` würde die IMR-Geometrie unnötig riskant umbauen. Keine Produktionsänderung.
