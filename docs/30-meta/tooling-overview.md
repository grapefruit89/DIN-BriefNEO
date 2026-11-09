---
id: tooling-overview
title: Tool-Inventur — tools/
status: active
type: reference
created: '2026-08-07'
updated: '2026-11-09'
tags:
- din-briefneo
- meta
- tooling
- agent
doc_links:
- '[[AGENTS]]'
code_links:
- 'tools/reconciliation.js'
- 'tools/build_db.js'
- 'tools/adr-check.js'
- 'tools/check-feature.js'
depends_on: []
supersedes: []
---

# Tool-Inventur — tools/

> **Ueberarbeitet 2026-11-09**: Veraltete SQLite-Retrieval-Pipeline (`docs_index.js`),
> `log_session.js` und MCP-Server entfallen. Diese Inventur
> beschreibt den aktuellen Ist-Stand der deterministischen Werkzeuge.

Strukturierte Uebersicht aller Skripte in `tools/`: Zweck, Ein-/Ausgabe,
Abhaengigkeiten, Aufrufer, Risikoklasse. Risikoklassen (READ/WRITE/DESTRUCTIVE) und
IDEMPOTENT/NON_IDEMPOTENT-Kennzeichnung folgen dem Vokabular aus dem
Abschnitt [[#Tool Result Schema & Vokabular]].

## repository.json (docs/10-architecture/)

Single Source of Truth für die Modul-Tabelle in [[STRUCTURE]]. `build_db.js`
liest `html`, `css`, `js`, `addons` und `data` von dort und rendert die Zeilen.
Neue Datei = ein JSON-Eintrag, kein Skript-Edit.

**Fail-closed:** `pruefeRepositoryDrift()` vergleicht die `adr`/`guide`-Felder
mit den `@adr`/`@guide`-Annotationen der ersten 40 Zeilen jeder Datei und
wirft bei Abweichung. Damit kann die generierte Tabelle nicht lügen.

## reconciliation.js

- **Zweck**: Fitness Gate. Prueft Metadata-Vollstaendigkeit (Schema V6),
  Link-Koharenz, Konformitaet gegen Antipattern-Regeln (`tools/antipatterns/`)
  und Feature-Checks. Liefert den Fitness Score.
- **Input**: `docs/**/*.md`, `website/**`, `tools/antipatterns/{base,web,project}.json`,
  `docs/30-meta/schema-v6.json`
- **Output**: Score-Objekt `{score, dimensions: {metadata, coherence, conformance, features}, success, logs, relations, rules}`,
  wird von `build_db.js` importiert (nicht nur ueber CLI aufgerufen)
- **Abhaengigkeiten**: keine externen npm-Pakete, reines Node core (`fs`, `path`, `child_process`)
- **Aufrufer**: `tools/build_db.js` (per `require('./reconciliation.js')`), `scripts/start.ps1` (Zeile 89, indirekt ueber build_db.js, ungecacht -- Fitness Gate laeuft immer)
- **Risikoklasse**: READ (liest nur, schreibt nichts)
- **Idempotenz**: IDEMPOTENT (gleicher Repo-Zustand -> gleiches Ergebnis)
- **Safe-to-delete**: NEIN — zentrales Gate, von AGENTS.md als verbindlich vorausgesetzt

## build_db.js
 
- **Zweck**: Ruft `reconciliation.js` auf, erzeugt daraus `import.sql`
  (SQLite-Import-Statements fuer die Function Traceability Matrix) sowie
  `Code-Referenzen.md` und `Function-Traceability.md` im externen Build-Verzeichnis (`~/.din-briefneo/build/`).
- **Input**: Ergebnis von `runReconciliation()`, `docs/**/*.md` Frontmatter (`code_links`)
- **Output**: `~/.din-briefneo/build/import.sql`, `~/.din-briefneo/build/Code-Referenzen.md`, `~/.din-briefneo/build/Function-Traceability.md`
- **Abhaengigkeiten**: `tools/reconciliation.js` (intern), Node core
- **Aufrufer**: `scripts/start.ps1` (Zeile 89, ungecacht -- Fitness Gate laeuft immer)
- **Risikoklasse**: WRITE (erzeugt/ueberschreibt generierte Artefakte, keine Quelldateien)
- **Idempotenz**: IDEMPOTENT (deterministische Neuerzeugung aus demselben Repo-Stand)
- **Safe-to-delete**: NEIN — Teil der Build-Pipeline

## build_db.py (2026-10-15 abgelöst & gelöscht)

- **Status**: GELÖSCHT (2026-10-15). Die Generierung der Traceability-Matrix wurde vollständig nach `tools/build_db.js` portiert. Historie ist im Git-Log gesichert.
- **Historischer Zweck**: Früherer optionaler Vektor-Zweig. Entfallen zugunsten von Zero-Dependency und EINEM Builder (`tools/build_db.js`).

## test-runner.mjs

Headless-Runner für die Unit-Suite (`test/index.html`). Zero-Dependency
(`node:http`, `node:child_process`, `node:fs`, `node:path`, `node:url`).

- **Server:** eigener `node:http`-Server auf einem freien Port, Wurzel ist das
  Repo; jede Antwort trägt `Cache-Control: no-store` — die frühere
  `?v=panelsN`-Pflege in `test/index.html` entfällt.
- **Browser:** `CHROME_BIN` oder `/usr/bin/helium|chromium|google-chrome`.
  Start headless mit `--remote-debugging-port=0`; der Port kommt aus
  `DevToolsActivePort` im temporären Profil.
- **Ergebnis:** `test/runner.js` legt `window.__TEST_RESULTS`
  (`total`, `passed`, `failed`, `skipped`, `failures`) an; der Runner holt es
  per CDP `Runtime.evaluate` ab.
- **CLI:** `--json`, `--filter=<regex>`, `--timeout=<ms>`,
  `--allow-missing-browser`.
- **Exit-Codes:** `0` alles grün, `1` Fehlschlag/Timeout/Laufzeitfehler.
- **Aufruf:** `node tools/test-runner.mjs` (kein npm-Skript nötig, das Repo
  bleibt ohne `package.json`).

## debug-session.mjs

Interaktive Debug-Sitzung mit garantiertem Virgin-State und Flight-Recorder.
Zero-Dependency, nutzt `tools/static-server.mjs` und `tools/browser.mjs`.

- **Virgin State:** flüchtiges Profil (`mkdtemp`), beim Start 0 Dateien; wird
  beim Beenden gelöscht. Kein localStorage, keine Cookies, keine IndexedDB aus
  früheren Sitzungen. Der Startbericht listet die Schlüssel nach dem Laden —
  `Virgin State: leer` heißt: nur App-Startschlüssel, kein Entwurf.
- **Server:** `Cache-Control: no-store` auf jeder Antwort (auch 404).
- **CDP bleibt offen** (Default 9222, bei Belegung automatisch freier Port);
  `devtoolsFrontendUrl` und `webSocketDebuggerUrl` werden im Terminal
  ausgegeben, damit DevTools und MCP-Agenten andocken.
- **Recorder:** Console/Runtime/Log/Network; Storage-Polling (1 s) auf
  `din_draft_current` plus DOM-Knotenzahl; Exceptions und Netzwerkfehler.
- **Trace:** `test/traces/session-<YYYY-MM-DD-HHmmss>.json` mit
  `meta`, `console`, `network`, `storageMutations`, `errors`
  (Verzeichnis ist gitignored).
- **CLI:** `--test` (Testseite), `--headless`, `--port=<http>`,
  `--cdp-port=<n>`; beenden mit Ctrl+C oder `q`.

## check-feature.js

- **Zweck**: Prüft Web-Plattform-Features gegen die Projekt-Baseline Chrome 150+. Nutzt maschinenlesbare Upstream-Daten (`web-features`, `@mdn/browser-compat-data`, `baseline-browser-mapping`).
- **Input**: CLI-Argument (Feature-Name, CSS-Property, Selektor, HTML-Attribut), Flags (`--refresh`, `--list-groups`, `--json`, `--help`, `--version`).
- **Output**: Konsolen-Ausgabe (Feature, Baseline-Status, Chrome-Version, andere Browser, Projekt-Status).
- **Abhängigkeiten**: Node core + drei isolierte Pakete in `~/.din-briefneo/feature-cache/node_modules/`.
- **Aufrufer**: Manuell durch Entwickler oder KI-Agenten vor einer Feature-Entscheidung. Auch in `agent/skills/implement-with-economy/`.
- **Risikoklasse**: READ.
- **Idempotenz**: IDEMPOTENT (gleicher Input → gleicher Output).
- **Safe-to-delete**: NEIN (Tooling, wird in Skill referenziert).

## adr-check.js

- **Zweck**: Präventiver ADR-Drift-Wächter. Prüft die 4 Regeln: 1:1-Bijektion `code_links` ↔ Dateisystem (ADR-CSS, ADR-JS), `@adr`-Annotation-Guard in Produktionscode (`website/js/*.js`), Registry-Zähler gegen `code_links.length` und verwaiste Asset-Referenzen in allen Architektur-ADRs.
- **Input**: `docs/10-architecture/ADR-*.md`, `website/css/*.css`, `website/js/*.js`.
- **Output**: Konsolen-Ergebnisbericht (Standard) oder JSON (`--json`), Exit-Code 0 (OK / nur Regel-4-Warnungen) oder 1 (Fehler in Regel 1, 2 oder 3).
- **Abhängigkeiten**: Node core (`fs`, `path`). Keine externen npm-Pakete.
- **Aufrufer**: Manuell durch Entwickler / KI-Agenten vor Commits; potentiell `start.ps1` (noch nicht eingehängt).
- **Risikoklasse**: READ (reines Prüfwerkzeug, modifiziert keine Dateien).
- **Idempotenz**: IDEMPOTENT (gleicher Repo-Zustand → gleiches Ergebnis).
- **Safe-to-delete**: NEIN — präventiver Drift-Wächter zur Qualitätssicherung der ADR-Konsistenz.

## Tool Result Schema & Vokabular

Dieses Kapitel legt fest, in welcher Form Tools/Skripte in diesem Repository ihr Ergebnis berichten sollen und welche Begriffe dabei welche Bedeutung haben (Herkunft: einheitliches Tool-/Result-Protokoll).

### Ist-Stand: Fitness Gate (tools/reconciliation.js)

Der bestehende Fitness Gate nutzt bereits ein festes Vokabular:
- **Severity-Stufen**: `critical`, `high`, `medium`, `low`
- **Score-Kategorien**: `metadata`, `coherence`, `conformance`, `features` (Gesamtscore ist Durchschnitt aller vier)
- **Erfolgskriterium**: `success = true` genau dann, wenn kein Log-Eintrag `severity: critical` hat. Der Fitness-Score-Schwellwert (100 %) ist separat in AGENTS.md verbindlich vorgeschrieben.

### Zielbild: Canonical Tool Result Schema

Jedes neue Tool, jeder Skill und jede MCP-Operation orientiert sich an dieser kanonischen Form:

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
- `operation`: welche Operation ausgeführt wurde (siehe Operationsvokabular)
- `status`: der Ausgang (siehe Statusvokabular)
- `summary`: für Menschen lesbare Kurzfassung, kein Ersatz für `data`
- `data`: strukturierte Nutzdaten des Ergebnisses
- `artifacts`: Pfade zu erzeugten Dateien, falls vorhanden
- `warnings` / `errors`: Listen von Strings oder Objekten mit Details
- `metadata`: Herkunft, Zeitstempel, Laufzeit

### Operationsvokabular

Kontrolliertes Vokabular für das Feld `operation`:

| Operation | Bedeutung |
|---|---|
| discover | Vorhandenes auffinden, ohne es zu bewerten |
| inspect | Einen konkreten, bekannten Gegenstand näher untersuchen |
| analyze | Muster/Zusammenhänge in bereits gefundenen Daten erkennen |
| plan | Einen Ausführungsschritt vorschlagen, ohne ihn auszuführen |
| execute | Eine Änderung tatsächlich vornehmen |
| generate | Neue Datei / neuen Inhalt erzeugen |
| validate | Gegen eine feste Regel prüfen (z. B. Fitness Gate) |
| verify | Ein Ergebnis gegen die ursprüngliche Absicht gegenprüfen |
| test | Automatisierten Test ausführen |
| audit | Umfassende, meist manuell ausgelöste Tiefenprüfung |
| migrate | Struktur-/Formatwechsel an bestehenden Daten |
| report | Ergebnisse für Menschen aufbereiten (kein neuer Fakt) |

### Statusvokabular

Kontrolliertes Vokabular für das Feld `status`:

| Status | Bedeutung |
|---|---|
| ok | Erfolgreich, keine Einschränkung |
| warning | Erfolgreich, aber mit Auffälligkeit, die Aufmerksamkeit verdient |
| failed | Nicht erfolgreich, aber kontrolliert beendet |
| blocked | Konnte nicht starten/fortfahren wegen fehlender Voraussetzung |
| skipped | Bewusst nicht ausgeführt (z. B. weil nicht anwendbar) |
| changed | Hat den Zustand des Repositories verändert |
| unchanged | Hat geprüft, aber nichts verändert |

### Evidence-Level bei Recherche-Behauptungen

Wenn eine Operation (`discover`, `analyze`, `audit`) eine faktische Behauptung über Web-Standards oder Browser-Verhalten trifft:

```json
{
  "claim": "Popover-API wird von allen evergreen Browsern unterstützt",
  "evidence_tier": 2,
  "source": "https://caniuse.com/mdn-api_htmlelement_popover",
  "confidence": "high"
}
```

### Ephemer vs. persistent

Tool-Ergebnisse sind standardmäßig **ephemer** (Rückgabewert des Aufrufs). Nur bewusst erzeugte Artefakte werden unter festen Pfaden persistiert (z. B. `build/import.sql`). Zeitstempel gehören in das `metadata`-Feld, nicht in den Dateinamen.

### Plan -> Execute -> Verify als harte Grenze

Operationen der Kategorie `plan` dürfen niemals im selben Schritt `execute` sein. Nach jedem `execute` folgt ein `verify`-Schritt.

## Zusammenfassung: Fitness-Gate-Pipeline

`tools/build_db.js` ruft intern `tools/reconciliation.js` auf. Läuft synchron und ungecacht in ca. 500 ms durch.

## Fitness Gate

Nach jeder Änderung: `node tools/build_db.js` muss **100% Evolutionary Fitness Score**
liefern. Kein Merge/Commit ohne grünes Gate (wird auch im pre-commit Hook und CI erzwungen,
siehe AGENTS.md §2).
