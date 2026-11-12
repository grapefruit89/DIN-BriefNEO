# 21 · Tooling-Review (Lint/Format/Dead-Code) — validiert

Status: abgeschlossen (Verdikte) · Geprüft: 2026-11-12 · Typ: audit · Erstellt: 2026-11-06
Quelle: achter Vorschlag (Biome, Knip, Oxlint, dprint, jsconfig). Geprueft.

## Validierung

| Vorschlag | Verdikt | Beleg |
|---|---|---|
| Biome als Linter/Formatter | bereits vorhanden, aber nie ausgefuehrt | biome.json (Schema 2.6.3) mit includes website/js, website/addons, test; Linter recommended + eigene Regeln; Formatter bewusst aus (formatter.enabled false) |
| Knip fuer Dead Code | nicht anwendbar | kein package.json, kein node_modules; Knip setzt ein npm-Projekt voraus |
| Oxlint | redundant | Biome deckt den Linter ab; Oxlint kann keinen Formatter |
| dprint | redundant | Formatter ist im Projekt bewusst deaktiviert |
| jsconfig + checkJs | bereits vorhanden und aktiv | jsconfig.json (checkJs true, ES2024, ESNext.Temporal); reconciliation.js:303 faehrt tsc -p jsconfig.json, fitness.yml startet das |

## 42 · Biome-Lauf in die CI haengen

Befund: biome.json ist vollstaendig konfiguriert, wird aber von keinem Skript
und keiner CI-Stufe aufgerufen (kein "biome" in fitness.yml, build_db.js oder
reconciliation.js). node_modules fehlt, ein Biome-Binary ist nicht installiert.
Der Typecheck dagegen laeuft in der CI (reconciliation.js ruft tsc auf).

Vorschlag: in fitness.yml einen Schritt `npx @biomejs/biome check` ergaenzen
(Formater bleibt aus). Damit wird die vorhandene Konfiguration wirksam, ohne
einen Build-Schritt einzufuehren.
Aufwand: XS. Abhaengigkeit: keine.

## Nicht uebernommen

- Knip: erfordert package.json und node_modules und damit einen npm-Workflow,
  den das Projekt bewusst nicht hat. Die vorhandenen Regel
  noUnusedImports/noUnusedVariables (beide error) decken den lokalen Fall ab.
- Oxlint: doppelt zu Biome.
- dprint: Formatter ist bewusst aus; ein zweiter Formatter waere Widerspruch.
- Biome als Formatter: widerspricht formatter.enabled false. Kein Umbau.
