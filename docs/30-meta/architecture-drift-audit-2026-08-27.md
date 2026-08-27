---
id: architecture-drift-audit-2026-08-27
title: Architecture Drift Audit — 2026-08-27
status: active
type: reference
created: '2026-08-27'
updated: '2026-08-27'
tags:
- din-briefneo
- meta
- agent
- governance
- audit
doc_links:
- '[[AGENTS]]'
- '[[tool-result-vocabulary]]'
- '[[tooling-overview]]'
code_links:
- 'repository.yaml'
- 'agent/mcp/dinbrief-mcp/index.js'
- 'agent/skills/repository-operations/SKILL.md'
- 'tools/create_context.js'
depends_on: []
supersedes: []
---

# Architecture Drift Audit — 2026-08-27

Erster Durchlauf des [[architecture-drift-audit]]-Skills. Ausloeser:
externe Ist-Pruefung (ChatGPT, Brainstorm "Repo Struktur Refactoring"),
die einen systematischen Soll/Ist-Abgleich statt weiterer punktueller
Fixes vorschlug. Geprueft gegen Commit `fc0c5a5` (main, gepusht) --
tatsaechlicher Dateiinhalt, nicht Annahmen. Alle vier gefundenen Luecken
wurden im selben Arbeitsschritt behoben, siehe Commit `55cacab`.

Ampel: 🟢 erledigt, nicht mehr anfassen · 🟡 vorhanden, aber Drift/halbfertig · 🔴 nicht umgesetzt

## Ergebnistabelle

| Bereich | Ursprüngliches Ziel | Ist-Zustand (zum Zeitpunkt des Audits) | Status | Fundstelle | Aktion |
|---|---|---|---|---|---|
| Repository Contract | Klare Autoritätshierarchie: wer darf was definieren, wer widerspricht wem | `AGENTS.md` §1 legt explizit fest: Immutable Law Catalog > AGENTS.md bei Konflikt. `repository.yaml` verweist korrekt auf beide, erhebt selbst keinen Widerspruchsanspruch. | 🟢 | `AGENTS.md:32-40`, `repository.yaml:1-25` | Keine — Hierarchie ist bereits explizit. |
| Agent Rules / Knowledge Layer | Keine Information an 5 Stellen widersprüchlich gepflegt | `build/LLM_CONTEXT.md` ist reines Konkatenat, kein Duplikat-Risiko. `repository.yaml`/`SKILL.md` fehlten aber in `CORE_FILES`. | 🟡 → behoben | `tools/create_context.js:7-15` | `repository.yaml` und `SKILL.md` zu `CORE_FILES` ergänzt (Commit `55cacab`). |
| Skills | "Voller Satz" an Skills | Genau ein Skill (`repository-operations`) existierte. | 🟡 | `agent/skills/` | Kein akuter Bedarf — weitere Skills erst bei konkretem Bedarf, nicht präventiv (jetzt zwei: plus `architecture-drift-audit`). |
| Tools (Landschaft/Matrix) | Alle losen Scripts unter Kontrolle | 9 aktive Scripts inventarisiert, `pipeline-cache.ps1` fehlte als eigener Eintrag. | 🟡 → behoben | `docs/30-meta/tooling-overview.md` | Eigenen Inventur-Eintrag ergänzt (Commit `55cacab`). |
| Tool Result Schema | Repository-weites Protokoll | Nur im MCP-Server durchgesetzt, bewusst nicht rückwirkend auf `reconciliation.js`/`log_session.js` ausgerollt — bereits so dokumentiert. | 🟡 (bewusst) | `tools/reconciliation.js:527`, `agent/mcp/dinbrief-mcp/index.js:89-104` | Keine Aktion nötig — dokumentierte Entscheidung, kein Drift. |
| Plan → Execute → Verify | Echte Zustandsmaschine mit Intent-Check | plan_id+Hash technisch erzwungen (Commit `60ff87a`); Verify prüfte nur Fitness Score, nicht ob die Aktion ihr Ziel erreicht hat. | 🟡 → behoben | `agent/mcp/dinbrief-mcp/index.js` (vor Fix: nur `repositoryValidate()` in Verify) | Intent-Verification ergänzt: Hash-Vergleich des `outputPath` vor/nach `run()` (Commit `55cacab`). |
| MCP-Layer | Dünner Adapter, nicht Zentrum | Bereits korrekt als "kein volles MCP-Protokoll" dokumentiert. | 🟢 | `agent/mcp/dinbrief-mcp/README.md` | Keine Aktion. |
| Artifacts (ephemeral/persistent) | Kanonische Pfade, `artifacts`-Feld korrekt befüllt | Kanonische Pfade eingehalten; `artifacts`-Feld im MCP-Result aber nie befüllt trotz erzeugter Dateien. | 🟡 → behoben | `agent/mcp/dinbrief-mcp/index.js:89` (Default `artifacts = []`, kein Call-Site setzte es) | `outputPath` pro Aktion ergänzt, wird bei tatsächlicher Änderung in `artifacts` eingetragen (Commit `55cacab`). |

## Ergebnis

Von 8 geprüften Bereichen: 2 grün ohne Handlungsbedarf, 1 gelb bewusst
(dokumentierte Vereinfachung, kein Fix nötig), 1 gelb ohne akuten Bedarf
(Skills-Vollständigkeit), 4 gelb mit konkretem, kleinem Fix — alle vier
noch im selben Arbeitsschritt behoben (Commit `55cacab`). Keine roten
Befunde (nichts komplett fehlend gegen das eigene Zielbild).

Größter verbliebener, bewusst zurückgestellter Punkt: Intent-Verification
ist ein Minimal-Check (Hash geändert ja/nein), beweist nicht inhaltliche
Korrektheit der Änderung — das bleibt Aufgabe des Fitness Gate. Ein
echter MCP-Protokoll-Adapter bleibt zurückgestellt, bis ein externer
MCP-fähiger Client (z. B. Claude Desktop) ihn tatsächlich braucht.

## Nächster Audit

Fällig nach dem nächsten größeren Agent-Infrastruktur-Lauf (siehe
[[architecture-drift-audit]]-Skill, Abschnitt "Wann anwenden"). Diese
Datei sollte dann per `supersedes` vom nächsten Audit-Dokument abgelöst
werden, nicht überschrieben.
