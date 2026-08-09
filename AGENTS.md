---
id: agents-contract
title: AGENTS.md — Bindender KI-Verhaltensvertrag
type: ai-context
status: active
created: '2026-07-01'
updated: '2026-08-07'
tags:
- din-briefneo
- meta
- ai-context
- governance
- gemini
- agents
doc_links:
- '[[CLAUDE]]'
- '[[Immutable-Law-Catalog]]'
- '[[ADR-ANTIPATTERN]]'
- '[[DECISION-LOG]]'
- '[[longevity-guidelines]]'
code_links:
- 'tools/log_session.js'
---

# AGENTS.md — DIN-BriefNEO

**BINDENDER VERHALTENSVERTRAG FÜR ALLE KI-AGENTEN**  
Dieser Vertrag ist nicht verhandelbar. Verstöße führen zur Ablehnung der Änderung.

---

## 1. Höchste Autorität: Immutable Law Catalog

Das Dokument `docs/00-foundation/Immutable-Law-Catalog.md` (Immutable Law Catalog) ist die **höchste autoritative Quelle** dieses Projekts.

- Es definiert verbindlich, welche Technologien und Patterns **MUST-USE** und welche **FORBIDDEN** sind.
- Bei Konflikten zwischen diesem Dokument (`AGENTS.md`) und dem Immutable Law Catalog hat **letzteres Vorrang**.
- Änderungen am Law Catalog dürfen nur über einen formalen ADR-Prozess erfolgen.

Jeder Agent muss den aktuellen Stand des Law Catalogs kennen und respektieren.

---

## 2. Unverhandelbare Kernprinzipien

- **Fitness Gate 100%**: Vor und nach jeder relevanten Änderung muss `.\start.ps1` ausgeführt werden. Der Fitness Score **muss 100 %** betragen.
- **Branchless Workflow**: Nur `main`-Branch. Feature-Branches sind verboten. Experimente erfolgen ausschließlich über `git stash`.
- **Surgical Changes & KISS**: Nur das ändern, was für die aktuelle Aufgabe strikt notwendig ist. Bevor JavaScript geschrieben wird, muss geprüft werden, ob moderne CSS- oder native Web-APIs ausreichen.
- **Generalisierbarkeit**: Jede neue Lösung ist auf ihre Übertragbarkeit in die `llm_boilerplate` zu prüfen und zu dokumentieren.

---

## 3. Workflow-Modi

### Light Mode (Default)
1. `.\start.ps1` ausführen (Pre-Build)
2. `LLM_CONTEXT.md` lesen
3. Änderung durchführen
4. `.\start.ps1` ausführen → **Fitness Score muss 100 %** sein
5. Mit `node tools/log_session.js` protokollieren
6. Generalisierungs-Vermerk in `DECISION-LOG.md` schreiben

### Full Mode
Zusätzlich:
- `specs/`-Ordner anlegen
- `spec.md` mit Anforderungen und Generalisierungs-Check erstellen
- Bei Bedarf `plan.md` + `tasks.md`

---

## 4. Context7 – Verbindliche Nutzung

**Context7 ist bei folgenden Situationen verpflichtend zu nutzen:**

- Unsicherheit über eine Web-API, CSS-Eigenschaft oder JavaScript-Methode
- Prüfung, ob eine native Lösung existiert (bevor JS geschrieben wird)
- Verifikation von Browser-Support (mind. Chrome 148+)
- Prüfung auf Deprecations oder bessere Alternativen

Die relevanten Erkenntnisse aus Context7 sind kurz im `DECISION-LOG.md` zu dokumentieren.

**Grundsatz:** Context7 hat Vorrang vor veraltetem Wissen oder Annahmen.

---

## 5. Dokumentations- & Traceability-Pflicht

- Neue ADRs und Guides müssen über die offiziellen Templates (`new-adr.py` / `new-guide.py`) erstellt werden.
- Jedes neue Dokument muss vollständiges Frontmatter nach Schema V6 enthalten.
- Die automatisierte Function Traceability Matrix darf **nur** durch `build_db.py` verändert werden.
- Neue Code-Funktionen müssen Traceability über `@adr` / `@guide` Kommentare herstellen.

---

## 6. Generalisierbarkeit & llm_boilerplate

DIN-BriefNEO ist ein **Testballon** für die `llm_boilerplate`. 

Bei jeder architektonischen oder tooling-bezogenen Entscheidung ist zu prüfen:
- Ist diese Regel/pattern generalisierbar?
- Sollte sie in die Boilerplate übernommen werden?

Erkenntnisse sind im `DECISION-LOG.md` festzuhalten.

---

## 7. Verbotene Technologien

Es gelten die Regeln des **Immutable Law Catalogs** (`docs/00-foundation/Immutable-Law-Catalog.md`). 

Besonders streng verboten sind unter anderem:
- Frameworks und Build-Tools für das Frontend
- Legacy-APIs (`new Date()`, `document.execCommand()`, unsicheres `innerHTML` etc.)
- Hex/RGB/HSL-Farben (nur OKLCH erlaubt)
- Storage-Lösungen außer `localStorage` unter `file:///`

Der aktuelle, verbindliche Stand steht **ausschließlich** im Law Catalog.

---

## 8. Protokollierung

Jede relevante Aktion muss direkt nach erfolgreichem Post-Build protokolliert werden:

```bash
node tools/log_session.js --agent "<Name>" --action "<Aktion>" --file "<Datei>" --desc "<Was + Warum + Generalisierbarkeit + ggf. Context7-Erkenntnis>"
```

## 9. Zusammenfassung der harten Regeln

- Der Immutable Law Catalog ist die höchste Instanz.
- Context7 muss bei Unsicherheit über Web-Technologien genutzt werden.
- Fitness Score 100 % vor und nach relevanten Änderungen.
- Branchless auf main.
- Templates + vollständiges Frontmatter V6 bei neuer Dokumentation.
- Surgical Changes & KISS priorisieren.
- Generalisierbarkeit prüfen und dokumentieren.

Verstöße gegen diesen Vertrag führen zur Ablehnung der Änderung.

*Hinweis: Komplexe oder zukünftige Konzepte sind in FUTURE_IDEAS.md eingefroren. Konzentriere dich auf die oben genannten Regeln.*
