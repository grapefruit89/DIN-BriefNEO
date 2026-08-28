# dinbrief-mcp

Duenner MCP-Server fuer DIN-BriefNEO. Zweite Ausbaustufe (Lauf 2): drei
Operationen, keine externe MCP-SDK-Abhaengigkeit.

## Operationen

- `inspect` — liest `repository.yaml` und gibt den Inhalt zurueck
- `validate` — ruft `tools/reconciliation.js` (Fitness Gate) auf und gibt das Ergebnis im kanonischen Result-Schema zurueck
- `execute` — fuehrt eine Aktion aus einer festen Allowlist aus (siehe unten), immer mit Plan-Vorschau davor und automatischem Verify danach

## Nutzung

```bash
echo '{"operation":"validate"}' | node agent/mcp/dinbrief-mcp/index.js
echo '{"operation":"inspect"}'  | node agent/mcp/dinbrief-mcp/index.js
```

Antwortet mit einer Zeile JSON auf stdout, nach dem Schema aus
`docs/30-meta/tool-result-vocabulary.md`.

## repository.execute — Allowlist, kein freier Codeaufruf

`execute` kennt ausschliesslich die Aktionen in der `ACTIONS`-Registry in
`index.js`. Es gibt keinen Weg, einen beliebigen Shell-Befehl oder Pfad
darüber auszufuehren — jede Aktion ruft ein bereits existierendes,
namentlich fest verdrahtetes Tool aus `tools/` auf.

Aktuelle Aktionen:

| Aktion | Was passiert | Risiko | Idempotent |
|---|---|---|---|
| `run-fitness-gate` | `node tools/build_db.js` (Fitness Gate + Traceability) | WRITE | ja |
| `regenerate-llm-context` | `node tools/create_context.js` | WRITE | ja |

### Plan -> Execute -> Verify (technisch erzwungen, kein Opt-out)

**Seit Lauf 2, Nachbesserung nach externem Review**: Vorher war "zwingend"
nur Doku, `execute` lief auch ohne vorherigen `plan`-Aufruf. Jetzt verlangt
`execute` zwingend eine `plan_id` aus einem vorherigen `plan:true`-Aufruf
fuer GENAU diese Aktion, gebunden an einen Hash der von ihr betroffenen
Dateien -- ohne, mit falscher, mit abgelaufener oder mit inzwischen
ungueltiger `plan_id` wird abgelehnt (`status: "blocked"`).

Schritt 1 -- Plan anfordern (aendert nichts, `status: "unchanged"`):

```bash
echo '{"operation":"execute","action":"run-fitness-gate","plan":true}' | node agent/mcp/dinbrief-mcp/index.js
```

Antwort enthaelt `data.plan_id` (gueltig 600 Sekunden, einmalig verwendbar):

```json
{"data":{"plan_id":"56db7492c24c520379caf0da4682a5b6", "expires_in_seconds":600, ...}}
```

Schritt 2 -- mit genau dieser `plan_id` wirklich ausfuehren:

```bash
echo '{"operation":"execute","action":"run-fitness-gate","plan_id":"56db7492c24c520379caf0da4682a5b6"}' | node agent/mcp/dinbrief-mcp/index.js
```

Nach der Ausfuehrung ruft der Server automatisch `repository.validate` auf
(Verify-Schritt) und haengt das Ergebnis in `data.verify` an die Antwort an.
Es gibt keine Ausfuehrung ohne mitgeliefertes Verify-Ergebnis.

**Intent-Verification** (seit Architecture Drift Audit, 2026-08-27):
`data.verify` enthaelt zusaetzlich zum Fitness Score ein `intent`-Feld --
prueft per Hash-Vergleich vor/nach der Ausfuehrung, ob die Aktion ihren
`outputPath` (z. B. `build/LLM_CONTEXT.md`) tatsaechlich veraendert hat.
Vorher pruefte Verify AUSSCHLIESSLICH den Fitness Score -- eine Aktion, die
inhaltlich nichts bewirkt (z. B. ein zweiter Lauf ohne geaenderte Inputs),
konnte trotzdem als vollstaendiger Erfolg durchgehen. Jetzt: `status` wird
nur dann `"changed"`, wenn Fitness Score UND Intent beide stimmen -- sonst
`"warning"` mit Begruendung in `warnings`. Der tatsaechlich veraenderte
Output-Pfad landet ausserdem in `artifacts` (vorher immer leer).

**Ablehnungsgruende fuer `execute`** (alle als `status: "blocked"` mit
Begruendung in `errors`):

| Grund | Wann |
|---|---|
| `plan_id fehlt` | kein vorheriger `plan:true`-Aufruf |
| `Kein Plan mit dieser plan_id gefunden` | falsche, bereits verbrauchte oder abgelaufene `plan_id` |
| `Plan ist abgelaufen` | mehr als 600s seit dem `plan:true`-Aufruf vergangen |
| `Plan wurde fuer Aktion "X" erstellt, execute wurde aber fuer "Y" aufgerufen` | `plan_id` passt zu einer anderen Aktion |
| `Repository-Zustand hat sich seit dem Plan geaendert` | eine von der Aktion betroffene Datei (`affectedPaths` in `index.js`) wurde seit dem Plan geaendert |

**Ablage**: Plaene liegen als einzelne JSON-Dateien unter
`agent/cache/plans/<plan_id>.json` (bereits gitignored, da `agent/cache/`
schon in `.gitignore` steht). Jeder Plan ist Single-Use -- die Datei wird
beim ersten `execute`-Versuch geloescht, egal ob er erfolgreich war oder
nicht (kein Retry mit derselben, mittlerweile veralteten `plan_id`).

## Bewusste Grenzen dieser Ausbaustufe

- `execute` ist auf die feste Allowlist begrenzt — neue Aktionen werden
  manuell im Code ergaenzt, nie dynamisch aus Nutzereingaben konstruiert.
- Kein externes MCP-Protokoll-SDK — reine STDIO-JSON-Zeilen, kein volles
  MCP-Handshake/Capability-Protokoll. Ausreichend fuer lokale Nutzung durch
  Skills in `agent/skills/`. Bei Bedarf eines echten MCP-Clients (z. B.
  Claude Desktop) muesste hier ein Protokoll-Adapter ergaenzt werden.
- Kein eigener YAML-Parser fuer komplexe YAML-Faelle — `repository.yaml`
  ist bewusst einfach gehalten, damit die Rohtext-Rueckgabe in `inspect`
  genuegt.

## Naechste Schritte (nicht Teil dieser Ausbaustufe)

Siehe `agent/skills/repository-operations/SKILL.md` und `repository.yaml`
Abschnitt `open_items` fuer den weiteren Fahrplan.
