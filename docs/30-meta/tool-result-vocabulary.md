---
id: tool-result-vocabulary
title: Tool Result Schema & Vokabular
status: active
type: guide
created: '2026-08-27'
updated: '2026-08-28'
tags:
- din-briefneo
- meta
- tooling
- agent
- governance
doc_links:
- '[[AGENTS]]'
- '[[tooling-overview]]'
code_links:
- 'tools/reconciliation.js'
- 'tools/log_session.js'
depends_on: []
---

# Tool Result Schema & Vokabular

Dieses Dokument legt fest, in welcher Form Tools/Skripte in diesem Repository
ihr Ergebnis berichten sollen, und welche Begriffe dabei welche Bedeutung
haben. Herkunft: ChatGPT-Brainstorm "Repo Struktur Refactoring" (Antwort 9,
Prioritaet 3 von 5 — einheitliches Tool-/Result-Protokoll).

Zwei Ebenen sind zu unterscheiden: was **heute bereits existiert** (Ist-Stand,
`tools/reconciliation.js` und `tools/log_session.js`), und das **Zielbild**
fuer neue Tools und den kuenftigen MCP-Server (`agent/mcp/dinbrief-mcp/`).
Neue Tools sollen sich am Zielbild orientieren; bestehende Tools werden nicht
rueckwirkend umgebaut, nur weil dieses Dokument existiert.

## Ist-Stand: Fitness Gate (tools/reconciliation.js)

Der bestehende Fitness Gate nutzt bereits ein festes, wenn auch schlankeres
Vokabular. Das bleibt unveraendert gueltig:

- **Severity-Stufen**: `critical`, `high`, `medium`, `low`
- **Score-Kategorien**: `metadata`, `coherence`, `conformance`, `features`
  (der Gesamtscore ist der Durchschnitt aller vier)
- **Erfolgskriterium**: `success = true` genau dann, wenn kein Log-Eintrag
  `severity: critical` hat. Der Fitness-Score-Schwellwert (100%) ist separat
  in AGENTS.md verbindlich vorgeschrieben.

`tools/log_session.js` protokolliert Aktionen bisher mit freiem Text
(`action_type` ist ein beliebiger String, kein festes Vokabular). Das ist der
Punkt, an dem das Zielbild unten ansetzt.

## Zielbild: Canonical Tool Result Schema

Jedes neue Tool, jeder Skill und jede MCP-Operation, die ein Ergebnis
zurueckgibt, orientiert sich an dieser Form:

```json
{
  "operation": "validate",
  "status": "ok",
  "summary": "Kurzer, einzeiliger Klartext-Satz was passiert ist",
  "data": {},
  "artifacts": [],
  "warnings": [],
  "errors": [],
  "metadata": {
    "tool": "tools/reconciliation.js",
    "timestamp": "ISO-8601",
    "duration_ms": 0
  }
}
```

Feldbedeutung:

- `operation`: welche Operation ausgefuehrt wurde (siehe Operationsvokabular unten)
- `status`: der Ausgang (siehe Statusvokabular unten)
- `summary`: fuer Menschen lesbare Kurzfassung, kein Ersatz fuer `data`
- `data`: strukturierte Nutzdaten des Ergebnisses (Form ist operationsspezifisch)
- `artifacts`: Pfade zu erzeugten Dateien, falls vorhanden (siehe "Ephemer vs. persistent" unten)
- `warnings` / `errors`: Listen von Strings oder Objekten mit Details
- `metadata`: Herkunft, Zeitstempel, Laufzeit — fuer Nachvollziehbarkeit

## Operationsvokabular

Kontrolliertes Vokabular fuer das Feld `operation`. Ein Tool/Skill benennt
seine Operation mit genau einem dieser Begriffe (oder dokumentiert explizit
eine begruendete Erweiterung an dieser Stelle):

| Operation  | Bedeutung                                              |
|------------|---------------------------------------------------------|
| discover   | Vorhandenes auffinden, ohne es zu bewerten               |
| inspect    | Einen konkreten, bekannten Gegenstand naeher untersuchen |
| analyze    | Muster/Zusammenhaenge in bereits gefundenen Daten erkennen |
| plan       | Einen Ausfuehrungsschritt vorschlagen, ohne ihn auszufuehren |
| execute    | Eine Aenderung tatsaechlich vornehmen                     |
| generate   | Neue Datei/Inhalt erzeugen                                |
| validate   | Gegen eine feste Regel pruefen (z. B. Fitness Gate)       |
| verify     | Ein Ergebnis gegen die urspruengliche Absicht gegenpruefen |
| test       | Automatisierten Test ausfuehren                            |
| audit      | Umfassende, meist manuell ausgeloeste Tiefenpruefung        |
| migrate    | Struktur-/Formatwechsel an bestehenden Daten               |
| report     | Ergebnisse fuer Menschen aufbereiten (kein neuer Fakt)      |

## Statusvokabular

Kontrolliertes Vokabular fuer das Feld `status`:

| Status    | Bedeutung                                                        |
|-----------|--------------------------------------------------------------------|
| ok        | Erfolgreich, keine Einschraenkung                                  |
| warning   | Erfolgreich, aber mit Auffaelligkeit die Aufmerksamkeit verdient   |
| failed    | Nicht erfolgreich, aber kontrolliert beendet                      |
| blocked   | Konnte nicht starten/fortfahren wegen fehlender Voraussetzung      |
| skipped   | Bewusst nicht ausgefuehrt (z. B. weil nicht anwendbar)             |
| changed   | Hat den Zustand des Repositories veraendert                       |
| unchanged | Hat geprueft, aber nichts veraendert                               |

Zum Vergleich: Der bestehende Fitness Gate kennt nur `success: true/false`
plus die vier Severity-Stufen. Das reicht fuer den engen Zweck des Gates.
Das Statusvokabular hier ist bewusst reicher, weil kuenftige Tools (Skills,
MCP-Operationen) mehr Zwischenzustaende brauchen als ein reines Pass/Fail.

## Evidence-Level bei Recherche-Behauptungen

Wenn eine Operation (typischerweise `discover`, `analyze`, `audit`) eine
faktische Behauptung ueber Web-Standards, Browser-Verhalten oder externe
Bibliotheken trifft, wird sie mit einem Evidence-Level aus der
Forschungs-Quellenpyramide belegt (`agent/skills/web-research/SKILL.md`) —
als direkter Verweis auf die dortige Tier-Nummer, kein eigenes Vokabular:

```json
{
  "claim": "Popover-API wird von allen evergreen Browsern unterstuetzt",
  "evidence_tier": 2,
  "source": "https://caniuse.com/mdn-api_htmlelement_popover",
  "confidence": "high"
}
```

Felder:

- `evidence_tier`: Zahl 0-5, direkter Verweis auf die Pyramide-Tier aus `web-research`
- `source`: konkrete Fundstelle (URL, oder Datei:Zeile bei Tier 0)
- `confidence`: `high` | `medium` | `low` — subjektive Einschaetzung, WIE eindeutig die Quelle die Behauptung stuetzt (eine Spec-Zeile ist typischerweise `high`, eine undatierte Blog-Notiz ist `low`, selbst wenn sie technisch Tier 4 ist)

Das Feld ist optional und lebt im `data`-Feld des kanonischen Tool-Result-
Schemas (z. B. `data.claims: [...]` bei mehreren Behauptungen). Nur bei
Behauptungen mit tatsaechlicher Unsicherheit relevant — nicht bei jeder
Ausgabe verpflichtend, das waere Overengineering fuer triviale Faelle wie
`status: ok` ohne strittigen Inhalt.

## Ephemer vs. persistent

Tool-Ergebnisse sind standardmaessig **ephemer**: sie existieren nur als
Rueckgabewert des Aufrufs und werden nicht automatisch auf Platte
geschrieben. Nur bewusst erzeugte Artefakte werden persistiert, und zwar
unter festen, nicht zeitgestempelten Pfaden (z. B. `build/import.sql`,
nicht `build/import-2026-08-27-1302.sql`) — Zeitstempel gehoeren ins
`metadata`-Feld des Ergebnisses, nicht in den Dateinamen. Das haelt das
Repository frei von Muell-Dateien aus wiederholten Tool-Laeufen.

## Plan -> Execute -> Verify als harte Grenze

Operationen der Kategorie `plan` duerfen niemals gleichzeitig `execute`
sein. Ein Tool, das etwas vorschlaegt, fuehrt es nicht im selben Aufruf aus.
Nach jedem `execute` folgt ein `verify`-Schritt, der das Ergebnis gegen die
urspruengliche Absicht prueft — nicht nur, ob der Code fehlerfrei durchlief.

## Tool-Risikoklassen

Bei der Tool-Inventur (`docs/30-meta/tooling-overview.md`) wird jedes Tool
einer Risikoklasse zugeordnet:

- **READ**: veraendert nichts, liest nur
- **WRITE**: veraendert Dateien innerhalb erwarteter, reversibler Grenzen
- **DESTRUCTIVE**: kann Daten unwiderruflich entfernen oder ueberschreiben

Zusaetzlich wird vermerkt, ob ein Tool **IDEMPOTENT** ist (mehrfaches
Ausfuehren mit gleichem Input aendert das Ergebnis nicht weiter) oder
**NON_IDEMPOTENT** (jeder Lauf kann ein neues Ergebnis erzeugen, z. B. weil
Zeitstempel oder externe Zustaende einfliessen).
