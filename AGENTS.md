# AGENTS.md — DIN-Brief Neo (Testballon für LLM-Boilerplate)

**BINDENDER VERHALTENSVERTRAG FÜR ALLE KI-AGENTEN**

Dieser Vertrag ist **nicht verhandelbar**. Verstöße führen zur Ablehnung der Änderung.

## CORE RULES (TL;DR – diese gelten immer)

- Reconciliation Loop + **Evolutionary Fitness Score 100%** sind nicht verhandelbar.
- **Build vor jeder relevanten Änderung** (Pre-Flight) und **danach** (Post-Flight).
- Jede KI-Aktion **muss** sofort mit `log_session.js` protokolliert werden.
- **Generalisierbarkeit** muss bei jeder neuen Lösung/Regel geprüft und als Vorschlag dokumentiert werden.
- `constitution.md` und `MASTER-DO-DONT-DEPRECATED.md` müssen respektiert werden.
- DIN-Brief Neo ist Testballon – gute Patterns müssen aktiv in die `llm_boilerplate` überführt werden.

## Light Mode vs Full Mode (gestufter Workflow)

**Light Mode (Standard für die meisten Änderungen: Bugfixes, kleine Refactorings, kleine Anpassungen)**

1. Pre-Build ausführen.
2. Änderung durchführen (Core Rules einhalten).
3. Post-Build ausführen → **muss EVOLUTIONARY FITNESS SCORE: 100%** ergeben.
4. Mit `log_session.js` protokollieren.
5. Kurzen Generalisierungs-Vermerk (1-2 Sätze) im `DECISION-LOG.md` schreiben.

**Beispiel Light Mode:**
"Kleinen Bug im Adress-Autocomplete gefixt (textContent statt unsicherem innerHTML). Pre- und Post-Build waren 100%. Generalisierbarkeit: Die Regel ist bereits in web.json → keine Extraktion nötig."

**Full Mode (nur für wichtige Features, Architektur-Änderungen, boilerplate-relevante Arbeit)**

Zusätzlich:
- `specs/NNN-kurzname/` Ordner anlegen.
- `spec.md` mit Anforderungen, Akzeptanzkriterien und ausführlichem Generalisierungs-Check erstellen.
- Optional `plan.md` und `tasks.md`.
- Den vollen Hybrid-Workflow aus HYBRID-SPEC-DRIVEN-WORKFLOW.md befolgen.

**Wann welchen Modus?**
- Light Mode als Default für schnelle, sichere Fortschritte.
- Full Mode bewusst wählen für große/wichtige Dinge.

Die Core Rules gelten immer.

## Kern-Elemente (behalten und respektieren)

- Reconciliation Engine + Fitness Score (hartes Gate, 100% Pflicht).
- Layered Antipatterns (`tools/antipatterns/base.json`, `web.json`, `project.json`).
- `log_session.js` (Audit Trail für alle KI-Aktionen).
- `build_db.js` + Reconciliation als Qualitätsfundament.
- `constitution.md` und `MASTER-DO-DONT-DEPRECATED.md` als primäre Quellen.

## Protokollierung (Pflicht)

Jede relevante Aktion muss direkt nach erfolgreichem Post-Build geloggt werden.

**Empfohlener Befehl (Light Mode):**
```bash
node tools/log_session.js --agent "GrokBuild" --action "<kurz>" --file "<pfad>" --desc "<was + warum + generalisierbarkeit>"
```

## Zusammenfassung – die harten Regeln (kurz & bündig)

- Build **vor jeder** relevanten Änderung (Pre-Flight) und **danach** (Post-Flight) → **100% Score** oder Änderung abgelehnt.
- Sofort loggen (mit aktuellem korrektem Pfad).
- Generalisierbarkeit bei **jeder** Lösung prüfen, vorschlagen und dokumentieren.
- Core Files und Tools respektieren.

Vertragsverletzung = Änderung wird abgelehnt.  
Wer das nicht einhält, arbeitet nicht konform mit diesem Vertrag.

---

**Hinweis:** Komplexe Konzepte (Capability Contracts, DCP, Adaptive Context Synthesis, etc.) sind eingefroren in FUTURE_IDEAS.md. Konzentriere dich auf den KISS-Ansatz und die Core Rules oben.

## Andrej Karpathy LLM Coding Principles

Um die bestmöglichen Ergebnisse zu erzielen, gelten für alle KI-Agenten in diesem Projekt zusätzlich die folgenden Kernprinzipien:

1. **Thinking Before Coding:**
   - Erstelle bei komplexeren Aufgaben erst einen `implementation_plan.md` und bitte um Freigabe (Planning Mode).
   - Analysiere den existierenden Code gründlich, bevor du Änderungen machst.

2. **Simplicity First (KISS):**
   - Bevorzuge einfache, native Lösungen (CSS statt JS, Vanilla JS statt Frameworks).
   - Vermeide "Overengineering" und komplizierte Architektur-Abstraktionen.

3. **Surgical Changes:**
   - Mache präzise, minimale Code-Änderungen.
   - Ändere nichts, was für das aktuelle Feature nicht strikt erforderlich ist.
   - Erhalte bestehende Kommentare und Formatierungen.

4. **Goal-Driven Execution:**
   - Behalte das Endziel im Fokus und verstricke dich nicht in Nebenproblemen, es sei denn, sie blockieren den Fortschritt.
   - Verifiziere das Ergebnis nach der Umsetzung.
