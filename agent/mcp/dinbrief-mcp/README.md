# dinbrief-mcp

Duenner MCP-Server fuer DIN-BriefNEO. Erste Ausbaustufe (Lauf 2): zwei
Operationen, keine Schreibrechte, keine externe MCP-SDK-Abhaengigkeit.

## Operationen

- `inspect` — liest `repository.yaml` und gibt den Inhalt zurueck
- `validate` — ruft `tools/reconciliation.js` (Fitness Gate) auf und gibt das Ergebnis im kanonischen Result-Schema zurueck

## Nutzung

```bash
echo '{"operation":"validate"}' | node agent/mcp/dinbrief-mcp/index.js
echo '{"operation":"inspect"}'  | node agent/mcp/dinbrief-mcp/index.js
```

Antwortet mit einer Zeile JSON auf stdout, nach dem Schema aus
`docs/30-meta/tool-result-vocabulary.md`.

## Bewusste Grenzen dieser Ausbaustufe

- Kein `repository.execute` — Schreiboperationen sind nicht Teil dieser Stufe.
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
