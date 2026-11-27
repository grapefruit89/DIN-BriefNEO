---
id: id-register
title: "ID-Register — Nummernkreise, Vergabe und Auslauf"
type: reference
status: active
created: '2026-11-17'
updated: '2026-11-22'
tags:
  - din-briefneo
  - meta
  - governance
  - ids
summary: "Dokumentation und Spezifikation für ID-Register — Nummernkreise, Vergabe und Auslauf."
doc_links:
  - [[BACKLOG]]
  - [[BACKLOG-ARCHIV]]
  - [[DECISION-LOG]]
  - [[glossary]]
  - [[AGENTS]]
code_links:
  - tools/laws.mjs
  - tools/content.mjs
  - tools/antipatterns/project.json
depends_on:
sections:
  - drei-regeln
  - aktive-nummernkreise
  - ausgelaufene-praefixe
  - keine-ids-verwechslungsgefahr
  - alias-tabelle-alt-heute
  - aufgeloeste-unklarheiten
---
# ID-Register

Der Befund, der dieses Dokument erzwungen hat: Am 2026-11-17 zählte der Doku-Korpus
**elf** parallele Nummernkreise (`B`, `A`, `P`, `H`, `R`, `F`, `S`, `T`, `M`, `C`, `W`).
Drei davon (`M`, `T`, `W`) waren nirgends als Nummernkreis beschrieben — `W` hat sich
als Regel-Kreis in `tools/antipatterns/web.json` aufgeloest, `M` als Review-Befunde. Dieselbe Sache trug bis zu drei
Namen: der `@layer`-Umbau hieß `B59` im Backlog, `S2` in `batch/STATUS.md` und
„S2 `@layer` statt `!important`" im DECISION-LOG.

**AGENTS.md §5.5** verlangt „ein Sachverhalt, ein Begriff" — für Normen und Begriffe
wird das maschinell geprüft (`P6`–`P11`), für **IDs** war es bis 2026-11-17 nur
Konvention. Dieses Register ist die eine Quelle; `tools/id-register.js` prüft sie.

## Drei Regeln

1. **Ein Punkt, eine ID.** `B59` heißt überall `B59`. Ausgelaufene Kürzel (`S2`, `R4`,
   `F5`) werden nicht weiterbenutzt, sondern über die Alias-Tabelle unten aufgelöst.
2. **Neue IDs nur aus einem hier registrierten Kreis.** Wer eine ID braucht, nimmt die
   nächste freie Nummer der Familie — nicht einen neuen Buchstaben. Ein neues Präfix
   entsteht nur durch Eintrag in diesem Dokument.
3. **Ausgelaufene Präfixe bekommen keine neuen Nummern.** Sie bleiben als historische
   Referenz auflösbar (Alias-Tabelle), aber niemand vergibt `S5` oder `M8`.

Format: Präfix in Großbuchstaben, Zahl ohne Trennzeichen, im Fließtext in Backticks
(`` `B59` ``). Das macht die maschinelle Prüfung eindeutig.

## Aktive Nummernkreise

| Präfix | Bedeutung | Quelle der Wahrheit | Bereich | Maschinell geprüft |
|---|---|---|---|---|
| `A` | Immutable Law (Norm oder Verbot) | `docs/00-foundation/Immutable-Law-Catalog.md` | A1–A68 | `tools/lawcoverage.js` |
| `H` | HARD BAN / PREFERRED innerhalb des Law Catalog | `docs/00-foundation/Immutable-Law-Catalog.md` | H1–H11 | Teil von `lawcoverage.js` |
| `C` | Farb-Fallback-Kette (Stufenfolge) | `docs/00-foundation/Immutable-Law-Catalog.md` (A16–A20) | C1 | `lawcoverage.js` |
| `P` | Projekt-Antipattern-Regel mit `max_violations`-Ratsche | `tools/antipatterns/project.json` | P1–P46 | `tools/reconciliation.js` |
| `W` | Web-Antipattern-Regel (Browser-/Plattformmuster, nicht projektspezifisch) | `tools/antipatterns/web.json` | W2–W11 | `tools/reconciliation.js` |
| `B` | Backlog-Punkt: offen oder abgeschlossen | `docs/30-meta/BACKLOG.md` (offen), `docs/30-meta/BACKLOG-ARCHIV.md` (erledigt) | B6–B96 | `tools/backlog-sync.mjs` (Tabelle), `tools/id-register.js` (Auflösbarkeit) |

**`W4` ist eine Regel, kein Gesetz.** Die ID existiert (`tools/antipatterns/web.json`:
Zero-HEX-Farbsystem), aber drei Stellen nennen sie „Law W4" — ein Law mit dieser Nummer
gibt es nicht. Die inhaltlich zuständigen Gesetze sind `A16`–`A20` (Farb-Fallback-Kette).
Der Fehlverweis war am 2026-09 bereits einmal aufgefallen (DECISION-LOG, Sonde
„beruft sich auf ein Gesetz, das es nicht gibt": `W4/W5/W6` → `A16`, `A20`).
Reststände stehen weiter in `repository.yaml:80`, `docs/00-foundation/llm-modern-web-playbook-2026.md:49,118`
und zwei Skill-Beschreibungen — sie sind als Bezeichnungsfehler zu lesen, nicht als
fehlende Regel.

**`B1`–`B5` sind Sonderfall:** das sind **historische Prinzipien** aus dem H1-Backlog
(Zero-Dependency, Offline-First, KISS, …), zitiert in `docs/10-architecture/ADR-ANTIPATTERN.md`.
Sie kollidieren zahlenmäßig mit dem späteren Backlog, meinen aber etwas anderes. Wer sie
zitiert, sagt „Prinzip B2", nicht „Backlog-Punkt B2". `B6` und höher sind Backlog-Punkte.

## Ausgelaufene Präfixe

Keine neuen Nummern. Auflösung über die Alias-Tabelle.

| Präfix | Herkunft | Warum ausgelaufen |
|---|---|---|
| `S` | Batch 01 („Architektur-Vertrag"), Punkte S1–S4 | Struktur-Punkte ohne eigene Vergabe; jeder Punkt hatte danach eine `B`-Nummer. `S1` war zudem ein **Sammelpunkt** aus vier Einzelarbeiten — genau die Mehrdeutigkeit, die diese Regel verhindert. |
| `R` | Batch 01, Review-Befunde R3–R5 | Befunde eines einzelnen Reviews, teils verworfen, teils beantwortet. |
| `F` | Batch 05, Befunde F1–F6 | Dito; Ergebnisse stehen im DECISION-LOG. |
| `T` | Batch 02, Messfälle T1/T2 | Testfälle, keine Aufgaben. Aufgegangen in `B72`. |
| `M` | Befunde des Grok-Website-Reviews (2026-09-10) | Review-Befunde ohne eigenen Nummernkreis; Ausgang je Befund steht im DECISION-LOG. `M2` (Anlagen-Datenverlust) wurde mit `9ecbed6` behoben. |

## Keine IDs — Verwechslungsgefahr

| Zeichenfolge | Was es wirklich ist |
|---|---|
| `E1` | Treffer aus dem Dateinamen `PHASE1-SQLITE-VEC-IMPLEMENTATION.md`. Es gibt **keinen** E-Kreis. |
| `FTS5` | SQLite-Technik, kein Nummernkreis. |
| `B96` | OCR-Artefakt im Normzitat `docs/00-foundation/din5008.md` (Wortumbruch „baw. B96. eertce"). Kein Backlog-Punkt. |
| `Chrome 150`, `DIN 5008` | Version bzw. Norm, keine ID. |

## Alias-Tabelle (alt → heute)

| Alt | Heute | Beleg |
|---|---|---|
| `S1` – `data-anlagen`/`data-fuss` → `:has()` | `B61` | BACKLOG-ARCHIV, Commit `ac62e65` |
| `S1` – `data-gesetzt` | `B62` | BACKLOG-ARCHIV |
| `S1` – `data-layout` → eine Spur | `B63` | BACKLOG-ARCHIV (erledigt 2026-11-14) |
| `S1` – `data-visible` | keine `B`-Nummer | erledigt mit `ac62e65`, nur hier dokumentiert |
| `S2` – `@layer` statt `!important` | **`B59`** | BACKLOG.md, freigegeben 2026-11-15 |
| `S3` – `sheet.css` entscheiden | `B60` | BACKLOG-ARCHIV, Commit `9f65067` |
| `S3` – `sidebar.css` trennen | `B64` | BACKLOG-ARCHIV |
| `S4` – Druck/Token/Animation | keine ID | Nutzerentscheidung „nicht anfassen" (2026-11-15) |
| `R3` – `style.cssText` im Boot-Fehlerkasten | keine ID | akzeptiert, DECISION-LOG |
| `R4` – `main.js` komponiert nur | keine ID | verworfen (Meinung, kein belegter Schaden) |
| `R5` – `import()` vor `data-ready` | keine ID | beantwortet durch Messung in Batch 05 (vier `import()`) |
| `F1`/`F6` – „Selects fallen durch" | keine ID | gegenstandslos: kein Element trägt `data-speichern` |
| `F3` – XSS über ungesäubertes HTML | keine ID | nicht reproduziert (Probe `<img onerror>` → `window.__xss` blieb `null`) |
| `F5` – Datum beim Reload überschrieben | keine ID | behoben: `datum__dirty` (`document.js:927`, `draft-manager.js:346`), 3 Tests |
| `T1`/`T2` – Boot-Marker-Messfälle | `B72` | `tools/paint-probe.mjs`, 3 Profile × 30 |
| `M1`–`M7` | **ungeklärt** | externes Review, keine `B`-Nummer; `M2`-Fix = `9ecbed6` |

## Aufgelöste Unklarheiten

1. **`W4`** — aufgelöst: eine **Antipattern-Regel** aus `tools/antipatterns/web.json`
   (Zero-HEX-Farbsystem), kein Gesetz. Siehe Abschnitt „Aktive Nummernkreise" und die
   Notiz dort; die inhaltlich zuständigen Gesetze sind `A16`–`A20`.
2. **`I/EM`** — aufgelöst: die Abkürzung meint die beiden HTML-Tags `<i>` und `<em>`
   in der Rich-Text-Allowlist. `website/js/document.js:38` führt `'I', 'EM'` als
   zulässige Tags; der zugehörige Beschluss steht im DECISION-LOG (Sanitizer-Dedup,
   2026-09-10), wo die beiden Tags als Überlebende der Allowlist geprüft wurden.
   `AGENTS.md:346` zitiert damit diese konkrete Erweiterung, nicht ein Dokument.
3. **`M1`–`M7`** — aufgelöst: Befunde des **Grok-Website-Reviews** vom 2026-09-10
   (DECISION-LOG, Eintrag „Grok-Website-Review: 5 Batches umgesetzt"). Dort stehen
   alle sieben mit Ausgang: `M2` behoben (`9ecbed6`), `M1` (A11y) und `M4` (CSP)
   vertagt, `M5`–`M7` als Details abgehakt. Die Fundliste selbst liegt nicht mehr im
   Repo — der Log-Eintrag ist der Beleg.

### Was daraus folgt

Keine ID im Korpus ist mehr ohne Quelle. Offen ist nur noch die **Bezeichnung**:
fünf Stellen nennen `W4` ein „Gesetz". Das ist ein Doku-Fehler (`P6`–`P11`-Klasse),
kein fehlendes Register.
