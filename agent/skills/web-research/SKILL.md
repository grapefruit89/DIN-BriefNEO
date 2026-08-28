---
name: web-research
description: >
  Systematische technische Recherche bei Unsicherheit ueber Web-Standards,
  Browser-Verhalten, Bibliotheken oder externe APIs. Definiert die
  Forschungs-Quellenpyramide (welche Quelle hat welche Autoritaet), das
  Fragetyp-Routing (bei welcher Frage direkt bei welcher Tier einsteigen)
  und wie Rechercheergebnisse mit einem Evidence-Level belegt werden.
  Ergaenzt repository-operations (Schritt 2: Think/Research) um das WIE.
---

# Skill: web-research

Herkunft: ChatGPT-Brainstorm "Repo Struktur Refactoring" (Forschungs-
Quellenpyramide), ergaenzt durch eine externe Ist-Pruefung (Grok,
2026-08-27), die eine fehlende Fragetyp-Zuordnung und eine fehlende
Evidence-Level-Kennzeichnung als Luecke benannte — beides wurde verifiziert
(live gegen den echten Repo-Inhalt geprueft, nicht nur uebernommen) und ist
hier umgesetzt. Vorher Teil von `repository-operations/SKILL.md`, hier
herausgeloest: "wie recherchiere ich" ist eine eigene Frage, unabhaengig
davon, wie eine Aenderung am Repository konkret ausgefuehrt wird (das
bleibt Aufgabe von `repository-operations`).

## Wann anwenden

Bei Schritt 2 (Think/Research) des 5-Schritt-Workflows aus
`repository-operations/SKILL.md`, wann immer tatsaechliche Unsicherheit
ueber einen Web-Standard, eine CSS-Eigenschaft, eine JavaScript-Methode
oder Browser-Support besteht (deckt sich mit AGENTS.md Paragraph 4). Nicht
bei jeder Aenderung — "Context7 first" heisst nicht "Context7 immer".

## Fragetyp-Routing

Die Art der Frage bestimmt, bei welcher Pyramide-Tier direkt eingestiegen
wird, statt immer bei Tier 0 anzufangen und sich durchzuarbeiten. Tier 0
(Project Truth) wird trotzdem immer zuerst kurz geprueft — Routing spart
Zeit beim *externen* Teil der Recherche, hebt Tier 0 nicht auf.

| Fragetyp (Beispiel) | Einstieg bei Tier | Warum |
|---|---|---|
| "Gibt es dazu schon eine Entscheidung/Regel im Repo?" | 0 | Project Truth — immer zuerst |
| "Ist X Teil der Web-Plattform-Spec?" | 1 | Normative Frage: WHATWG/W3C/TC39 beantwortet sie direkt |
| "Unterstuetzt Chrome/Firefox/Safari X?" | 2 | Kompatibilitaetsfrage: Baseline/MDN/caniuse, bei Bedarf Vendor-Status einzeln |
| "Wie benutze ich Bibliothek/API Y konkret?" | 3 | Context7 fuer aktuelle, versionsgenaue Dokumentation |
| "Was ist gaengige Praxis/Empfehlung fuer Z?" | 4 | Kein Standard, sondern Erfahrungswissen — als solches kennzeichnen |

Ein eindeutiger Treffer auf einer hoeheren Tier schliesst tiefere Tiers
nicht aus, wenn die hoehere Tier die Frage nicht eindeutig beantwortet —
dann eine Tier weiter runter.

## Forschungs-Quellenpyramide

Bei technischer Recherche, Reihenfolge nach Autoritaet, hoechste zuerst:

| Tier | Quelle | Beispiele |
|------|--------|-----------|
| 0 | Project Truth | Dieses Repository selbst — `AGENTS.md`, `docs/00-foundation/Immutable-Law-Catalog.md`, `repository.yaml` |
| 1 | Normative Standards | WHATWG, W3C, TC39 |
| 2 | Kompatibilitaet | Baseline, MDN, caniuse.com fuer Chrome 148+ (das Projekt ist bewusst chrome-only, siehe Immutable Law Catalog H11 / Baseline-Deklaration). Firefox Platform Status (platform-status.mozilla.org) und WebKit Feature Status (webkit.org/status) sind nur relevant, falls sich diese Baseline-Entscheidung jemals aendert -- kein Standardschritt fuer die aktuelle Chrome-only-Architektur |
| 3 | Technische Dokumentation | Context7 |
| 4 | Praxis/Expertenwissen | CSS-Tricks, web.dev, Smashing Magazine, A List Apart |
| 5 | Allgemeines Web | Nie allein als Quelle ausreichend, nur zur Orientierung |

Tier 0 sticht immer — wenn das Repository selbst eine Regel festlegt (z. B.
"nur OKLCH-Farben"), gewinnt diese Regel gegen jede externe Empfehlung.

## Evidence-Level bei Rechercheergebnissen

Wenn eine Recherche in einer Behauptung muendet (z. B. im `data`-Feld einer
`discover`/`analyze`/`audit`-Operation oder in `DECISION-LOG.md`), wird sie
mit ihrer Tier-Nummer aus der Pyramide oben belegt. Das konkrete
Feldformat (`evidence_tier`, `source`, `confidence`) steht in
`docs/30-meta/tool-result-vocabulary.md`, Abschnitt "Evidence-Level bei
Recherche-Behauptungen" — hier nicht dupliziert. Das Feld ist optional und
nur bei Behauptungen mit tatsaechlicher Unsicherheit relevant, nicht bei
jeder Recherche verpflichtend.

## Bezug zu anderen Skills/Dokumenten

- `agent/skills/repository-operations/SKILL.md`: Schritt 2 (Think/Research)
  des 5-Schritt-Workflows verweist hierher.
- `docs/30-meta/tool-result-vocabulary.md`: definiert das konkrete
  Evidence-Level-Feldformat.
- `AGENTS.md` Paragraph 4: Context7-Pflicht bei den dort genannten vier
  Situationen (Web-API-Unsicherheit, native Loesung pruefen,
  Browser-Support verifizieren, Deprecations pruefen).
