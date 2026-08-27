---
name: architecture-drift-audit
description: >
  Systematischer Soll/Ist-Abgleich des Repositorys gegen das eigene
  Architekturmodell (repository.yaml, AGENTS.md, agent/skills/,
  agent/mcp/, docs/30-meta/tool-result-vocabulary.md). Findet Drift --
  Doku, die nicht mehr zum Code passt, Regeln, die nur behauptet statt
  durchgesetzt werden, Luecken zwischen Zielbild und tatsaechlichem
  Dateiinhalt. Nutzen: periodisch (z.B. nach jedem groesseren
  Agent-Infrastruktur-Lauf) oder wenn der Verdacht besteht, dass Doku
  und Code auseinanderlaufen.
---

# Skill: architecture-drift-audit

Herkunft: ChatGPT-Brainstorm "Repo Struktur Refactoring", externe Ist-
Pruefung vom 2026-08-27 ("Ich würde deshalb jetzt nicht weiter 'Features
abhaken', sondern einen echten Architecture Drift Audit machen"). Dieser
Skill macht diesen Prozess wiederholbar, statt ihn als einmalige,
konversationelle Lieferung verpuffen zu lassen -- Selbstauditierung ist
integraler Bestandteil des Repos, kein externes Add-on.

## Warum das ein eigener Skill ist, nicht nur eine Erinnerung

`AGENTS.md` schreibt den Fitness Gate vor und nach jeder Aenderung vor --
das prueft Metadaten-Vollstaendigkeit, Link-Kohaerenz, Antipattern-
Konformitaet. Was der Fitness Gate NICHT prueft: ob die Architektur, die
in `repository.yaml`/`AGENTS.md`/den Skills BESCHRIEBEN wird, noch mit
dem uebereinstimmt, was der Code tatsaechlich TUT. Genau diese Luecke
("Doku sagt X, Code macht Y") ist Drift, und sie entsteht schleichend --
jede einzelne Aenderung sieht fuer sich genommen klein aus.

## Wann anwenden

- Nach einem groesseren Agent-Infrastruktur-Lauf (neue Skills, neue MCP-
  Aktionen, neue Contract-Felder) -- bevor man zum naechsten Feature
  uebergeht.
- Wenn eine externe Pruefung (Mensch oder anderes Modell) Zweifel an der
  Konsistenz aeussert.
- Nicht bei jeder kleinen Aenderung -- das waere Overengineering. Fitness
  Gate deckt den laufenden Betrieb ab, dieser Skill den periodischen
  Rueckblick.

## Ablauf

1. **Bereiche festlegen**: mindestens die sechs Schichten aus
   `agent/skills/repository-operations/SKILL.md` ("Verhaeltnis zu
   AGENTS.md, repository.yaml und dem MCP-Server") -- Rules, Knowledge,
   Repository Contract, Skills, Tools, Tool Result, Plan-Execute-Verify,
   Artifacts, MCP. Nicht mehr Bereiche erfinden als noetig; nicht weniger
   als das, was tatsaechlich existiert.
2. **Pro Bereich: echten Dateiinhalt lesen, nicht aus dem Gedaechtnis
   urteilen.** Jede Behauptung im Audit braucht eine Fundstelle
   (Datei:Zeile oder Datei:Abschnitt). Ein Fund ohne Fundstelle ist eine
   Vermutung, kein Audit-Ergebnis.
3. **Ampel pro Bereich**: 🟢 erledigt/nicht mehr anfassen, 🟡 vorhanden
   aber Drift/halbfertig, 🔴 nicht umgesetzt. Nur drei Kategorien, keine
   Zwischenstufen -- das haelt die Tabelle lesbar.
4. **Tabelle**: Bereich | Ziel | Ist | Status | Fundstelle | Aktion.
5. **Max. 5 priorisierte naechste Massnahmen.** Nicht jede 🟡-Zeile wird
   sofort behoben -- manche Abweichungen sind bewusste, dokumentierte
   Vereinfachungen (siehe "Was ist KEIN Drift" unten), keine Fehler.
6. **Ergebnis versionieren**: Audit-Ergebnis als Datei unter
   `docs/30-meta/architecture-drift-audit-<datum>.md` ablegen (Schema V6
   Frontmatter, `supersedes` auf den vorherigen Audit setzen, falls
   vorhanden), nicht nur als Konversations-Nachricht liefern. Der Skill
   selbst bleibt stabil; die Ergebnisse sind versionierte Snapshots.

## Was ist KEIN Drift

- Eine Vereinfachung, die bewusst und dokumentiert ist (z.B. "Tool Result
  Schema gilt nur fuer neue Tools, nicht rueckwirkend" -- steht explizit
  so in `tooling-overview.md`). Das ist eine getroffene Entscheidung,
  keine Luecke.
- Eine Autoritaetskette mit mehreren Ebenen (AGENTS.md -> Immutable Law
  Catalog), solange sie explizit und widerspruchsfrei ist. Mehrere
  Ebenen sind kein Drift, ein unaufgeloester Widerspruch zwischen ihnen
  waere einer.
- Fehlender Ausbau, der (noch) keinen konkreten Bedarf hat (z.B. voller
  MCP-Protokoll-Adapter ohne externen Client, der ihn nutzen wuerde).
  Praeventiv bauen widerspricht Ponytail/KISS aus AGENTS.md Paragraph 2.

## Bezug zu anderen Skills/Dokumenten

- `agent/skills/repository-operations/SKILL.md`: definiert die Schichten,
  die dieser Audit gegeneinander prueft.
- `docs/30-meta/tool-result-vocabulary.md`: Ephemer/persistent-Regel, an
  der Artifacts-Funde gemessen werden.
- `repository.yaml` `open_items`: Funde, die zu konkreten Massnahmen
  werden, landen hier als Eintrag mit `status: open`, nicht nur im
  Audit-Dokument -- sonst verschwindet der Fund wieder aus dem Contract.
