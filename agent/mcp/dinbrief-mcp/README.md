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

### Plan -> Execute -> Verify (Pflicht, kein Opt-out)

Jede `execute`-Anfrage braucht zwingend zuerst eine Plan-Vorschau:

```bash
echo '{"operation":"execute","action":"run-fitness-gate","plan":true}' | node agent/mcp/dinbrief-mcp/index.js
```

Das aendert nichts (`status: "unchanged"`), zeigt nur was passieren wuerde.
Erst ein zweiter Aufruf ohne `plan:true` fuehrt die Aktion wirklich aus:

```bash
echo '{"operation":"execute","action":"run-fitness-gate"}' | node agent/mcp/dinbrief-mcp/index.js
```

Nach der Ausfuehrung ruft der Server automatisch `repository.validate` auf
(Verify-Schritt) und haengt das Ergebnis in `data.verify` an die Antwort an.
Es gibt keine Ausfuehrung ohne mitgeliefertes Verify-Ergebnis.

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
