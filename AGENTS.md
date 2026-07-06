# AGENTS.md â€” DIN-Brief Neo (Testballon fÃ¼r LLM-Boilerplate)

**BINDENDER VERHALTENSVERTRAG FÃœR ALLE KI-AGENTEN**

Dieser Vertrag ist **nicht verhandelbar**. VerstÃ¶ÃŸe fÃ¼hren zur Ablehnung der Ã„nderung.

## CORE RULES (TL;DR â€“ diese gelten immer)

- Reconciliation Loop + **Evolutionary Fitness Score 100%** sind nicht verhandelbar.
- **Build vor jeder relevanten Ã„nderung** (Pre-Flight) und **danach** (Post-Flight).
- Jede KI-Aktion **muss** sofort mit `log_session.js` protokolliert werden.
- **Generalisierbarkeit** muss bei jeder neuen LÃ¶sung/Regel geprÃ¼ft und als Vorschlag dokumentiert werden.
- `constitution.md` und `MASTER-DO-DONT-DEPRECATED.md` mÃ¼ssen respektiert werden.
- DIN-Brief Neo ist Testballon â€“ gute Patterns mÃ¼ssen aktiv in die `llm_boilerplate` Ã¼berfÃ¼hrt werden.

## Light Mode vs Full Mode (gestufter Workflow)

**Light Mode (Standard fÃ¼r die meisten Ã„nderungen: Bugfixes, kleine Refactorings, kleine Anpassungen)**

1. Pre-Build ausfÃ¼hren (`.\start.ps1` generiert auch `LLM_CONTEXT.md`).
2. Generierte `LLM_CONTEXT.md` lesen, um den aktuellen System-Prompt zu erhalten.
3. Ã„nderung durchfÃ¼hren (Core Rules einhalten).
4. Post-Build ausfÃ¼hren (`.\start.ps1`) â†’ **muss EVOLUTIONARY FITNESS SCORE: 100%** ergeben.
5. Mit `log_session.js` protokollieren.
6. Kurzen Generalisierungs-Vermerk (1-2 SÃ¤tze) im `DECISION-LOG.md` schreiben.

**Beispiel Light Mode:**
"Kleinen Bug im Adress-Autocomplete gefixt (textContent statt unsicherem innerHTML). Pre- und Post-Build waren 100%. Generalisierbarkeit: Die Regel ist bereits in web.json â†’ keine Extraktion nÃ¶tig."

**Full Mode (nur fÃ¼r wichtige Features, Architektur-Ã„nderungen, boilerplate-relevante Arbeit)**

ZusÃ¤tzlich:
- `specs/NNN-kurzname/` Ordner anlegen.
- `spec.md` mit Anforderungen, Akzeptanzkriterien und ausfÃ¼hrlichem Generalisierungs-Check erstellen.
- Optional `plan.md` und `tasks.md`.
- Den vollen Hybrid-Workflow aus HYBRID-SPEC-DRIVEN-WORKFLOW.md befolgen.

**Wann welchen Modus?**
- Light Mode als Default fÃ¼r schnelle, sichere Fortschritte.
- Full Mode bewusst wÃ¤hlen fÃ¼r groÃŸe/wichtige Dinge.

Die Core Rules gelten immer.

## Kern-Elemente (behalten und respektieren)

- Reconciliation Engine + Fitness Score (hartes Gate, 100% Pflicht).
- Layered Antipatterns (`tools/antipatterns/base.json`, `web.json`, `project.json`).
- `log_session.js` (Audit Trail fÃ¼r alle KI-Aktionen).
- `build_db.js` + Reconciliation als QualitÃ¤tsfundament.
- `constitution.md` und `MASTER-DO-DONT-DEPRECATED.md` als primÃ¤re Quellen.

## Protokollierung (Pflicht)

Jede relevante Aktion muss direkt nach erfolgreichem Post-Build geloggt werden.

**Empfohlener Befehl (Light Mode):**
```bash
node tools/log_session.js --agent "GrokBuild" --action "<kurz>" --file "<pfad>" --desc "<was + warum + generalisierbarkeit>"
```

## Zusammenfassung â€“ die harten Regeln (kurz & bÃ¼ndig)

- Build **vor jeder** relevanten Ã„nderung (Pre-Flight) und **danach** (Post-Flight) â†’ **100% Score** oder Ã„nderung abgelehnt.
- Sofort loggen (mit aktuellem korrektem Pfad).
- Generalisierbarkeit bei **jeder** LÃ¶sung prÃ¼fen, vorschlagen und dokumentieren.
- Core Files und Tools respektieren.

Vertragsverletzung = Ã„nderung wird abgelehnt.  
Wer das nicht einhÃ¤lt, arbeitet nicht konform mit diesem Vertrag.

---

**Hinweis:** Komplexe Konzepte (Capability Contracts, DCP, Adaptive Context Synthesis, etc.) sind eingefroren in FUTURE_IDEAS.md. Konzentriere dich auf den KISS-Ansatz und die Core Rules oben.

## Andrej Karpathy LLM Coding Principles

Um die bestmÃ¶glichen Ergebnisse zu erzielen, gelten fÃ¼r alle KI-Agenten in diesem Projekt zusÃ¤tzlich die folgenden Kernprinzipien:

1. **Thinking Before Coding:**
   - Erstelle bei komplexeren Aufgaben erst einen `implementation_plan.md` und bitte um Freigabe (Planning Mode).
   - Analysiere den existierenden Code grÃ¼ndlich, bevor du Ã„nderungen machst.

2. **Simplicity First (KISS):**
   - Bevorzuge einfache, native LÃ¶sungen (CSS statt JS, Vanilla JS statt Frameworks).
   - Vermeide "Overengineering" und komplizierte Architektur-Abstraktionen.

3. **Surgical Changes:**
   - Mache prÃ¤zise, minimale Code-Ã„nderungen.
   - Ã„ndere nichts, was fÃ¼r das aktuelle Feature nicht strikt erforderlich ist.
   - Erhalte bestehende Kommentare und Formatierungen.

4. **Goal-Driven Execution:**
   - Behalte das Endziel im Fokus und verstricke dich nicht in Nebenproblemen, es sei denn, sie blockieren den Fortschritt.
   - Verifiziere das Ergebnis nach der Umsetzung.

## BRANCHLESS WORKFLOW (NEU)

Der Entwickler arbeitet als Solo-Entwickler **streng branchless**.
Es gibt nur den `main` Branch (und `legacy` als reines Archiv).
- **Normale Entwicklung:** Alles fließt direkt in `main` (mit `git add .`, `git commit`, `git push`).
- **Niemals Feature-Branches:** Erstelle keine Feature- oder Fix-Branches!
- **Experimente:** Für temporäre oder unsichere Änderungen wird ausschließlich `git stash` genutzt (`git stash push -m "Experiment: ..."`, `git stash pop`).
- **Sicherheitsnetz:** Ein datiertes Backup (`backup-before-cleanup-YYYYMMDD`) ist nur vor destruktiven Aufräumaktionen erlaubt. 
- Für extrem große, tagelange Refactorings darf als absolute Ausnahme ein kurzlebiger Branch erstellt werden. Dieser muss nach Abschluss sofort über `--no-ff` in `main` gemerged und gelöscht werden.

## Dokumentations-Workflow (verbindlich)

- Neue **ADRs** werden immer im Ordner `docs/ADR/` angelegt.
- Neue **Guides** werden immer im Ordner `docs/Guides/` angelegt.
- Beim Erstellen einer neuen Datei **muss** zwingend das jeweilige Template als Basis dienen:
  - `docs/ADR/Support/ADR-TEMPLATE.md`
  - `docs/Guides/GUIDE-TEMPLATE.md`
- Jede neue Datei muss das **vollständige, SQLite-ready Frontmatter (Schema V6)** enthalten:
  - Zwingende Felder: `id`, `type`, `status`, `doc_links`, `code_links`, `created`, `updated`, `depends_on`.
  - Die Verknüpfung von Abhängigkeiten geschieht vorrangig über Wikilinks im `depends_on` Feld (für Obsidian/Mermaid Graphen).
- Für ADRs sind die strukturierten Felder `decision_options` (mit den Statuswerten `considered`, `chosen`, `rejected`) und `chosen_option` Pflicht.
- Bevor Code geschrieben wird, der neue architektonische Konzepte einführt, muss geprüft werden, ob eine neue ADR oder ein neuer Guide notwendig ist.

## Build-Tools & Crawler-Ausschlüsse
- Die Dokumentations- und Build-Skripte (sowohl `build_db.js` als auch Python-Parser) durchsuchen das Dateisystem. Hierbei **müssen** zwingend virtuelle Umgebungen (`venv/`, `node_modules/`, `.git/`, `.agents/`, `.claude/`) vom Crawling ausgeschlossen werden, um False-Positives in externen Bibliotheken zu vermeiden.
- Die Function-Traceability Matrix wird von `build_db.py` automatisch anhand von `@adr` und `@guide` Tags im Code befüllt. Manueller Inhalt ist nur außerhalb der `<!-- BEGIN AUTOMATED MATRIX -->` Markierungen gestattet. Die generierte Tabelle darf **niemals manuell bearbeitet** werden.
- Neue Funktionen müssen ihre Traceability durch entsprechende Kommentare im Code sicherstellen (z.B. `/* @adr [[ADR-Name]] {FunctionName} */`).
- In Zukunft (Phase 2) werden Dokumente anhand von `##` Markdown-Headings aufgeteilt (Chunking), um semantische Suche (Embeddings) zu ermöglichen.

## Anti-Patterns (Verbotene Tech-Stacks)

Aus historischen Fehlern (siehe din-5008-brief-generator) lernen wir, dass folgende Technologien für DIN-Brief Neo **strengstens verboten** sind:
- **Build-Tools für Frontend:** Kein Node.js, Vite, Webpack oder TypeScript-Kompilierung für die Web-App. Das Frontend läuft komplett build-free im Browser (index.html via Live-Server).
- **Heavy Frameworks:** React, Vue oder selbst native Web Components (Shadow DOM) sind verboten, da sie das Print-to-PDF und Vanilla-DOM-Prinzip verkomplizieren.
- **Utility-First CSS (Tailwind):** Verboten. Wir nutzen reines Vanilla CSS (@layer, Container Queries, --vars).
