---
name: repository-operations
description: >
  Zentrale Entscheidungslogik fuer Arbeit an diesem Repository — WANN
  welches Tool/welche Vorgehensweise angemessen ist. Ergaenzt AGENTS.md
  (das WAS/WARUM) um das WANN. Nutzen bei jeder nicht-trivialen Aenderung
  am Repository, insbesondere bevor neuer Code geschrieben wird.
---

# Skill: repository-operations

Herkunft: ChatGPT-Brainstorm "Repo Struktur Refactoring", mehrere Antworten
(Skill-vs-MCP-Layering, Karpathy-Skills, Ponytail-Entscheidungsleiter,
Forschungs-Quellenpyramide, 5-Schritt-Workflow). Dieser Skill fasst sie zu
einer einzigen anwendbaren Entscheidungslogik zusammen.

## Verhaeltnis zu AGENTS.md, repository.yaml und dem MCP-Server

Drei Schichten, nicht austauschbar:

- **Skill (dieses Dokument)** = Entscheidungslogik. Beantwortet "wann tue ich was".
- **MCP (`agent/mcp/dinbrief-mcp/`)** = Capability-Exposition. Beantwortet "was kann ausgefuehrt werden".
- **Tool/Script (`tools/*.js`, `tools/*.py`)** = deterministische Implementierung. Beantwortet "wie wird es konkret gemacht".

`repository.yaml` ist die Datenquelle, auf die sich alle drei Schichten
beziehen, statt eigenes Wissen ueber die Repo-Struktur zu pflegen.

## Discipline Layer (Karpathy-Skills)

Vor jeder Aenderung, unabhaengig von ihrer Groesse:

1. **Think Before Coding**: Erst verstehen was das Problem wirklich ist,
   dann erst Code schreiben. Nicht raten-und-testen.
2. **Simplicity First**: Die einfachste Loesung, die das Problem tatsaechlich
   loest — keine vorsorgliche Flexibilitaet fuer Faelle, die nicht gefordert sind.
3. **Surgical Changes**: Nur aendern, was fuer die aktuelle Aufgabe strikt
   noetig ist (deckt sich mit AGENTS.md Paragraph 2).
4. **Goal-Driven Execution**: Jede Aenderung muss auf das urspruenglich
   formulierte Ziel zurueckfuehrbar sein — nicht auf dem Weg entdeckte,
   aber ungefragte Verbesserungen einstreuen, ohne das transparent zu machen.

## Economy Layer (Ponytail-Entscheidungsleiter)

Bevor eigener Code geschrieben wird, diese sechs Fragen der Reihe nach
durchgehen — bei der ersten "Ja" aufhoeren und diese Option nehmen:

1. Brauche ich das ueberhaupt?
2. Existiert es schon (im Repository, in `tools/`, in `website/js/`)?
3. Kann die Standardbibliothek es (Node core, native Browser-API)?
4. Kann die Plattform es (Browser-native Loesung statt JS)?
5. Gibt es bereits eine Dependency, die es abdeckt?
6. Kann es einfacher sein als die erste Idee?

Erst wenn alle sechs Fragen mit Nein beantwortet sind: eigene Loesung
schreiben. Das deckt sich mit AGENTS.md Paragraph 2 ("bevor JavaScript
geschrieben wird, muss geprueft werden, ob moderne CSS- oder native
Web-APIs ausreichen") und erweitert es auf Tooling-Entscheidungen generell.

## 5-Schritt-Workflow

Fuer jede nicht-triviale Aenderung:

1. **Discover/Inspect**: Was existiert bereits, das relevant ist? (`repository.yaml`, `docs/30-meta/tooling-overview.md` konsultieren)
2. **Think/Research**: Bei technischer Unsicherheit den `web-research`-Skill nutzen (Forschungs-Quellenpyramide, Fragetyp-Routing, Evidence-Level). Context7 ist bei Web-API-Unsicherheit laut AGENTS.md Paragraph 4 verbindlich.
3. **Validate/Plan**: Vorgehen festlegen, bevor Code geschrieben wird. `plan`-Operation im Sinne von [[tool-result-vocabulary]] — noch keine Ausfuehrung.
4. **Execute**: Aenderung vornehmen. Surgical, nicht mehr als noetig.
5. **Verify**: Fitness Gate (`scripts/start.ps1`) auf 100% pruefen, UND das Ergebnis gegen die urspruengliche Absicht aus Schritt 3 gegenpruefen — nicht nur "Build ist gruen".

## Recherche

Schritt 2 (Think/Research) nutzt bei tatsaechlicher Unsicherheit ueber
Web-Standards den eigenstaendigen `web-research`-Skill
(`agent/skills/web-research/SKILL.md`) — Forschungs-Quellenpyramide,
Fragetyp-Routing und Evidence-Level sind dort definiert, nicht hier
dupliziert. "Context7 first" heisst nicht "Context7 immer": Context7 wird
gezielt bei tatsaechlicher Unsicherheit eingesetzt (siehe AGENTS.md
Paragraph 4), nicht routinemaessig bei jeder Aenderung.

## Feature-Implementierung in website/

Fuer Schritt 4 (Execute) bei einer Aenderung in `website/` gilt zusaetzlich
die schaerfere Leiter aus `agent/skills/implement-with-economy/SKILL.md`
(HTML vor CSS vor bestehendem JS vor neuem JS vor Abhaengigkeit) statt nur
der generischen Fragen aus dem Economy Layer oben.

## Plan -> Execute -> Verify als harte Grenze

Siehe [[tool-result-vocabulary]], Abschnitt "Plan -> Execute -> Verify".
Dieser Skill verweist darauf statt es zu duplizieren: eine `plan`-Operation
fuehrt nichts aus, jede `execute`-Operation wird von einer `verify`-Operation
gefolgt.

## Bezug zur Tool-Inventur

Vor dem Einsatz eines Tools aus `tools/` dessen Eintrag in
`docs/30-meta/tooling-overview.md` pruefen: Risikoklasse (READ/WRITE/DESTRUCTIVE)
und Idempotenz bestimmen, ob ein Trockenlauf sinnvoll/moeglich ist und ob
Vorsicht bei wiederholter Ausfuehrung geboten ist.
