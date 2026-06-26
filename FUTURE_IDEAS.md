# FUTURE_IDEAS.md — Eingefrorene komplexe Konzepte

**Status:** Eingefroren (nicht gelöscht, ruhen vorerst)

Dieses Dokument sammelt die fortgeschrittenen Konzepte und Ideen, die in früheren Phasen des Projekts diskutiert und teilweise umgesetzt wurden. Sie wurden eingefroren, um den Fokus auf KISS (Keep It Simple, Stupid) und eine agenten-freundliche, einfache Struktur zu legen.

Neue KI-Agenten sollen sich zuerst auf die Kern-Elemente (Reconciliation + Fitness Score, Layered Antipatterns, Light Mode Workflow, log_session) konzentrieren. Diese Ideen können später reaktiviert werden, wenn das Fundament stabil ist.

## 1. Capability Contract System
Beschreibung: Ein System von "Capability Contracts" – deklarative Beschreibungen, was ein Modul/Feature können muss, mit automatischen Checks und Verträgen zwischen Komponenten.
Grund für Einfrieren: Führte zu hoher Komplexität in der Struktur (viele Contracts, Validierungen). Passt nicht zum aktuellen KISS-Ziel.
Status: Konzeptionell diskutiert, teilweise in AGENTS.md und Reconciliation angedeutet.
Zukünftige Relevanz: Gut für sehr große, multi-agent Systeme in der llm_boilerplate.

## 2. Declarative Change Protocol (DCP)
Beschreibung: Ein Protokoll, bei dem Änderungen deklarativ beschrieben werden (z.B. "füge Feature X hinzu, mit diesen Akzeptanzkriterien"), und der Prozess (Spec → Plan → Tasks → Implement → Reconcile) automatisch oder semi-automatisch abläuft.
Grund für Einfrieren: Der volle Hybrid-Workflow (mit specs/, plan, tasks) ist zu schwer für Light Mode Alltag. Führt zu Over-Engineering.
Status: Umgesetzt in Teilen (HYBRID-SPEC-DRIVEN-WORKFLOW.md, specs/001, .specify/templates).
Zukünftige Relevanz: Nützlich für Full Mode bei großen, boilerplate-relevanten Änderungen.

## 3. Adaptive Context Synthesis Engine
Beschreibung: Ein Engine, der Kontext für die KI dynamisch synthetisiert (aus DB, Reconciliation-Ergebnissen, Decision-Logs, Embeddings), inkl. Caching, Priorisierung und Anpassung an den aktuellen Task.
Grund für Einfrieren: Zu eng mit dem komplexen DB- und Vektor-Setup verbunden. Der aktuelle build_db.js + reconciliation reicht für den Anfang.
Status: Teilweise in PHASE1-SQLITE-VEC-IMPLEMENTATION.md und reconciliation.js angedeutet (Hybrid Search, RRF).
Zukünftige Relevanz: Kern für fortgeschrittene Agenten-Unterstützung in der llm_boilerplate.

## 4. Organizational Learning Federation
Beschreibung: Ein föderiertes System, in dem mehrere Projekte/Agenten Wissen teilen, lernen (aus Logs, Fitness-Scores, Generalisierungs-Entscheidungen) und Muster über Projekte hinweg evolvieren (z.B. via llm_boilerplate als zentrale "Föderation").
Grund für Einfrieren: Zu ambitioniert für die aktuelle Phase. Der Testballon-Ansatz ist schon ein Schritt in diese Richtung.
Status: Konzeptionell in AGENTS.md (Generalisierungs-Pflicht, MIGRATION-ROADMAP) und log_session.
Zukünftige Relevanz: Langfristiges Ziel für die Boilerplate als "Lern-Organisation".

## 5. Komplexe Boilerplate-Struktur mit vielen .meta/, .cache/ etc. Ordnern
Beschreibung: Eine sehr feingliedrige Struktur mit separaten Ordnern für Metadaten, Caches, Contracts, Session-States, Organizational Memory usw. (inspir iert von spec-kit, aber stark erweitert).
Grund für Einfrieren: Erhöht die Einstiegshürde massiv. Verstößt gegen "neue KI soll innerhalb von 5-10 Minuten produktiv sein".
Status: Teilweise umgesetzt (.specify/, boilerplate.config.json, specs/, MIGRATION-ROADMAP, etc.).
Zukünftige Relevanz: Nur selektiv für sehr reife Projekte in der llm_boilerplate.

---

**Hinweis zur Reaktivierung:**
Diese Ideen sind nicht verworfen, sondern bewusst pausiert. Wenn das Projekt stabil, einfach und agenten-freundlich ist (siehe aktuelle Prioritäten in AGENTS.md), können sie schrittweise reaktiviert und vereinfacht werden.

Siehe auch:
- AGENTS.md (aktuelle, vereinfachte Version)
- DECISION-LOG.md (für den Kontext der Einfrierung)
- MIGRATION-ROADMAP-TO-BOILERPLATE.md (ältere Version, nun teilweise eingefroren)

Stand: 12. Juni 2026 – Eingefroren im Rahmen der KISS-Kurskorrektur.
