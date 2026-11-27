# tools/ — Audit & Konsolidierungs-Blueprint

> **Status:** Korrigiert und freigegeben (2026-11-27). §0 ist verbindlich; die
> Etappen 2–6 bleiben Vorschlag bis zum jeweiligen Go (§11).
> **Erstellt:** 2026-11-27 · **Überarbeitet:** 2026-11-27 (8 Hydrogen-Korrekturen, §0)
> **Geltungsbereich:** `/home/moritz/repos/DIN-BriefNEO/tools/`
> **Methode:** alles unten Genannte ist am Arbeitsbaum gemessen (Befehle im Anhang, §12).
> **Nicht geprüft (ungeprüft):** Laufzeitverhalten der Skripte, die eine laufende
> Browser-Session voraussetzen (CDP 9222 / Server 8088 waren beim Audit nicht aktiv).

---

## 0. Freigegebene Korrekturen (Hydrogen-Review, 2026-11-27)

Acht Korrekturen sind beschlossen und in dieses Dokument eingearbeitet. Wo eine Zahl
aus dem Review nicht reproduzierbar war, steht die **gemessene** Zahl daneben
(Beleg: §12). **Etappe 1 ist umgesetzt:** `tools/din.mjs` + Script `din` in
`/home/moritz/repos/DIN-BriefNEO/package.json`.

### K1 — Azyklische Schichtung: `din.mjs` → `fitness/` → `laws/`

`laws/` importiert **niemals** `fitness/report.mjs`. Das gemeinsame Berichtsformat
(Score, `[CRITICAL]`, Exit-Codes) liegt in der **untersten** Schicht und wird von
`fitness/` nach oben konsumiert. Ein Import in Gegenrichtung (`laws/` → `fitness/`)
ist ein Schichtungsverstoß und gehört in `isolation.js` als Regel.
*Belegt:* `reconciliation.js:563-739` lädt alle 8 Sonden aus den Gesetzes-Dateien —
die Gegenrichtung existiert heute nirgends.

### K2 — `filematch.js` wird `laws/scan.mjs`

Der Matcher ist gemeinsame Scan-Mechanik, kein Fitness-Detail: `lawcoverage.js:34`
(laws) **und** `reconciliation.js:257` (fitness) nutzen `matchFilePattern()`.
Er wird `laws/scan.mjs` mit `walk()` + `matchFilePattern()`; fitness importiert nach
unten (K1). Kein zweites Matcher-Modul.

### K3 — `id-register.js` gehört nach `laws/`, nicht nach `content/`

Es ist eine **Sonde** (`checkIds()`), geladen von `reconciliation.js:739`, bewertet
vom Gate. `content/` enthält nur Generatoren und Sync-Werkzeuge.

### K4 — `repo-map-check.mjs` gehört nach `fitness/`

Es ist ein **Gate**, kein Content-Werkzeug: `build_db.js:214-222` ruft es per
`execSync` und bricht bei Exit ≠ 0 ab.

### K5 — `seeder-diff.mjs` (11,3 KiB) wird archiviert

Einmal-Differenztest aus `batch/05`, ohne Aufrufer (`§2`, Cluster 4). Mit ihm wächst
der Archivposten von 31,2 auf **42,5 KiB** (11,3 + 17,0 + 14,2).
**Summen-Korrektur (gemessen):** Die alte Modulsumme 262,5 KiB enthielt
`seeder-diff.mjs` versteckt in `measure/` (55,8 = 44,5 + 11,3). Nach K2–K5 und ohne
`seeder-diff` sind es **251,2 KiB**; zählt man die Datei mit, 262,5 KiB. Der im Review
genannte Wert „~261 KiB" ist damit **nicht** reproduzierbar — verbindlich ist die
gemessene Zahl 251,2 KiB (Rechnung im Anhang, §12).

### K6 — Reihenfolge: `runtime/` wird VOR `measure/` gebaut

Die Messwerkzeuge setzen die Laufzeit voraus: `paint-probe.mjs` und `druck-pixel.mjs`
verlangen `din-dev` (Server 8088 + CDP 9222), `print-messung.mjs` einen Server auf
8099. Wer `measure/` zuerst baut, muss die Laufzeit weiter aus `tools/` importieren.
Etappenfolge daher: 3 = `runtime/`, 4 = `measure/`, 5 = `laws/` + `fitness/`.

### K7 — Etappe 1 delegiert ausschließlich per Kindprozess

`spawnSync`/`execFileSync` mit `{ stdio: 'inherit' }`, **kein** `await import()` auf
alte CJS-Dateien. Gründe: (a) CJS-Altlasten bleiben unangetastet, (b) `dev live`
braucht stdin/stdout/stderr direkt, (c) Kindprozesse können den Exit-Code 1:1
weiterreichen, ohne die Semantik der Skripte zu kennen. `din.mjs` enthält **keine**
Fachlogik: 483 Zeilen, davon 91 Dispatch + 74 Ausgabe (Rest Hilfe/Manifest, §6.6).

### K8 — Fünf Blind Spots (dokumentiert in §3, F14)

1. `docs/meta/AUFGABEN-WEGWEISER.md` + `repo-map-check.mjs:30-39` — jeder dort
   genannte `tools/…`-Pfad muss existieren; ein Umzug bricht das Wegweiser-Gate.
2. `website/js/settings.js:368` — generierte MCP-Konfiguration enthält den Pfad
   `tools/mcp-live.mjs` als String; ein Umzug bricht die Nutzer-Konfiguration still.
3. `test/all.js:1989-2062` — 6 × `fetch('/tools/print-messung.mjs')` prüft den
   **Quelltext** (Shebang, Flags, Exit-Codes); Pfadwechsel nur im selben Commit.
4. `tools/dev.sh:88-90` — Prozess-Identität über `/proc/*/cmdline` matcht
   `tools/serve.mjs|static-server.mjs|mcp-live.mjs`; nach einem Umzug sterben die
   richtigen Prozesse nicht mehr (Port-Kollision).
5. `tools/static-server.mjs:68-79` — **Dual-Root**: Web-Wurzel `website/`, Fonts aus
   `<repo>/fonts/`, Geoapify-Key aus `~/.secrets/`; `findeFontsOrdner()` leitet den
   Repo-Pfad aus dem übergebenen Root ab. Ein Umzug darf diese Ableitung nicht ändern.

**Regel daraus:** Jede Verschiebung in Etappe 2–6 zieht diese fünf Stellen im selben
Commit mit. Etappe 1 verschiebt nichts und ist deshalb blind-spot-frei.

---

## 1. Ist-Zustand in Zahlen

| Kennzahl | Wert |
|---|---|
| Dateien in `tools/` (getrackt) | 44 — davon **37** Skripte (18 × `.js`, 18 × `.mjs`, 1 × `.sh`) |
| Gesamtgröße der 37 Skripte | **307,6 KiB** (315.012 B) |
| Median-Datei | 6,6 KiB (138 Zeilen) |
| Kleinste 8 Dateien | 0,5 – 4,3 KiB (Shallow-Kandidaten) |
| Größte Datei | `reconciliation.js` 38,2 KiB / 1.037 Zeilen |
| Modulsystem | **13 × CommonJS**, **18 × ESM**, 1 × Bash — ohne gemeinsamen Einstiegspunkt |
| Nicht-Skript-Artefakte | `antipatterns/*.json` (40,6 KiB Regeln), `data/plz_states.json` (169 KiB), `browser-audit.html`, `boilerplate.config.json`, `README.md` |
| Ausgeschlossen / extern | `batch/` (`kontrakt.py`, `merge.py`), `fonts/subset_fonts.py`, `.trash/scripts/` (40 Dateien, versioniert) |

### Cluster (gemessen, deckungsgleich mit dem Auftrag)

| Cluster | Dateien | Größe | Anteil |
|---|---|---|---|
| 1 Dev-Server & Browser | 7 | 53,1 KiB | 17 % |
| 2 Messen & Druck | 7 | 44,5 KiB | 14 % |
| 3 Fitness/Gesetze/Architektur | 13 | **143,2 KiB** | **47 %** |
| 4 Daten-Pipelines | 4 | 32,0 KiB | 10 % |
| 5 Test-Runner & Doku-Sync | 6 | 34,9 KiB | 11 % |

**Erste Erkenntnis:** Cluster 3 ist fast die Hälfte der Masse — wer ihn unangetastet lässt, halbiert die Dateizahl, aber nicht die Größe.

---

## 2. Referenzmatrix — wer ruft was?

Spalten: `npm` = `package.json`-Script · `CI` = `.github/workflows/` · `Hook` = `githooks/pre-commit` · `dev` = `tools/dev.sh` · `Gate` = Ladepfad ab `build_db.js` · `Test` = `test/all.js`/`test/runner.js`.

### Cluster 1 — Dev-Server & Browser

| Datei | KiB | npm | CI | Hook | dev | Gate | Test | Verdikt |
|---|---:|---|---|---|---|---|---|---|
| `static-server.mjs` | 7,6 | – | – | – | ● | – | ● | **LIB** — von `serve`, `debug-session`, `test-runner` importiert |
| `serve.mjs` | 0,8 | – | – | – | ● | – | – | **WRAPPER** (19 Zeilen um `static-server`) |
| `dev.sh` | 13,9 | – | – | – | ● | – | – | **AKTIV** — 410 Zeilen Prozess-/Port-/Desktop-Logik, kein Kleinstskript |
| `browser.mjs` | 1,9 | – | – | – | – | – | ● | **LIB** — `debug-session`, `test-runner` |
| `debug-session.mjs` | 15,5 | – | – | – | – | – | – | **MANUELL** — nur Doku-Aufrufer, kein Automatismus |
| `mcp-live.mjs` | 13,0 | – | – | – | ● | – | – | **AKTIV** — `din-dev live`, Gegenstück `website/js/live-bridge.js` |
| `setup-din-home.sh` | 0,5 | – | ● | – | – | ● | – | **AKTIV** — CI-Schritt + `tsc`-Fehlermeldung in `reconciliation.js` |

### Cluster 2 — Messen & Druck

| Datei | KiB | npm | CI | Hook | dev | Gate | Test | Verdikt |
|---|---:|---|---|---|---|---|---|---|
| `mess.js` | 2,1 | – | – | – | ● | – | – | **AKTIV** — In-Page-Funktion für `evaluate_script` (MCP), von `mess-print` als Quelle gelesen |
| `mess.mjs` | 3,0 | – | – | – | ● | – | – | **AKTIV** — CLI gegen CDP 9222 |
| `mess-print.mjs` | 3,4 | – | – | – | ● | – | – | **AKTIV** — Druck-Emulation headless |
| `print-messung.mjs` | 15,6 | – | – | – | – | – | **● 6 Assertions** | **AKTIV** — PDF-Wahrheit; Quelltext ist Testvertrag |
| `testbrief-messung.mjs` | 7,6 | – | – | – | – | – | – | **AKTIV** — importiert Addon-Logik direkt, ohne Browser |
| `paint-probe.mjs` | 6,8 | – | – | – | – | – | – | **MANUELL** — TTC/Performance, letzte Nutzung `batch/02` |
| `druck-pixel.mjs` | 6,0 | – | – | – | – | – | – | **EINMALIG** — Pixel-Diff 2026-11-15, Aufrufer nur `batch/07`-Prompt + Decision-Log |

### Cluster 3 — Fitness-, Gesetzes- & Architektur-Gates

| Datei | KiB | npm | CI | Hook | Gate | Verdikt |
|---|---:|---|---|---|---|---|
| `build_db.js` | 14,2 | ●● | ●● | ● | ● | **KERN** — `check:fitness`, `docs:index`, CI, Pre-Commit |
| `reconciliation.js` | 38,2 | ● | – | – | ● | **KERN** — Score-Engine, lädt 8 Sonden |
| `structure-stand.js` | 0,9 | – | – | – | ● | **SHALLOW** (24 Zeilen, 3 Exporte) |
| `filematch.js` | 1,7 | – | – | – | ● | **SHALLOW** (42 Zeilen, 2 Exporte) |
| `imr.js` | 16,8 | – | – | – | ● | **KERN-SONDE** |
| `structural-laws.js` | 10,1 | – | – | – | ● | **KERN-SONDE** |
| `isolation.js` | 6,2 | – | – | – | ● | **KERN-SONDE** |
| `links.js` | 6,5 | – | – | – | ● | **KERN-SONDE** |
| `terminology.js` | 4,2 | – | – | – | ● | **KERN-SONDE** |
| `lawcoverage.js` | 8,5 | – | – | – | ● | **KERN-SONDE** (Meta-Gate) |
| `id-register.js` | 7,2 | – | – | – | ● | **KERN-SONDE** — Ziel `laws/` (K3), nicht `content/` |
| `adr-check.js` | 11,8 | – | – | – | – | **MANUELL** — eigenes CLI, in keiner Kette |
| `check-feature.js` | 17,0 | – | – | – | – | **TOT** (siehe F2) |

### Cluster 4 — Daten-Pipelines

| Datei | KiB | npm | CI | dev | Verdikt |
|---|---:|---|---|---|---|
| `build_plz_data.mjs` | 14,7 | ● | ● | – | **AKTIV** — Quartals-Workflow |
| `build_grosskunden_columnar.mjs` | 3,1 | – | ● | – | **AKTIV** — nur CI |
| `seed-geoapify.mjs` | 2,8 | – | – | ●● | **AKTIV** — aber Cluster 1, nicht Pipeline (siehe F7) |
| `seeder-diff.mjs` | 11,3 | – | – | – | **ARCHIVIEREN** (K5) — Einmal-Differenztest `batch/05`, Aufrufer nur Batch-Doku |

### Cluster 5 — Test-Runner & Doku-Sync

| Datei | KiB | npm | CI | Gate | Test | Verdikt |
|---|---:|---|---|---|---|---|
| `test-runner.mjs` | 8,0 | ● | ● | – | ● | **KERN** — `npm test`, CI-Schritt |
| `test-dossier.mjs` | 3,9 | ● | – | – | – | **AKTIV** — `docs:tests` |
| `backlog-sync.mjs` | 2,0 | ● | – | – | – | **AKTIV** — `docs:backlog` |
| `repo-map-check.mjs` | 2,7 | – | – | ● | – | **KERN** — von `build_db` per `execSync` erzwungen; Ziel `fitness/` (K4) |
| `query_chrome_feature.mjs` | 4,1 | ● | – | – | – | **AKTIV** — `check:browser-feature` |
| `og-image.mjs` | 14,2 | – | – | – | – | **OHNE AUFRUFER** (siehe F3) |

### Externe Skripte

| Pfad | Größe | Getrackt | Befund |
|---|---:|---|---|
| `batch/kontrakt.py`, `batch/merge.py` | 4,8 / 8,4 KiB | ja | Review-Batch-Werkzeuge (13.–15.11.). Doku verweist auf `reviews/` — **dieser Ordner existiert nicht mehr** (F10). |
| `fonts/subset_fonts.py` | 8,1 KiB | **nein** | Durch `.gitignore:71` (`/fonts/`) komplett unsichtbar, obwohl es das ausgelieferte `website/fonts/inter-variable.woff2` erzeugt (F11). |
| `.trash/scripts/` | 40 Dateien | ja | Historische Python-Pipelines, `.trash/` ist geschützte Invariante. **Nicht anfassen** — außer als Beleg, was schon abgelöst wurde. |

---

## 3. Befunde

**F1 — Die Gate-Kette ist der einzige harte Kern.** `build_db.js` → `reconciliation.js` → `structure-stand.js`, `filematch.js`, `imr.js`, `links.js`, `isolation.js`, `structural-laws.js`, `lawcoverage.js`, `terminology.js`, `id-register.js`, plus `repo-map-check.mjs` per `execFile`. 11 der 37 Dateien hängen an einem einzigen Aufruf. *Belegt:* `grep -n "require('./" tools/*.js`, `tools/build_db.js:218`.

**F2 — `check-feature.js` (17,0 KiB) ist tot.** Kein Aufrufer in `package.json`, CI,
Hook, `dev.sh` oder Tests. Es installiert sich zur Laufzeit drei npm-Pakete in
`~/.din-briefneo/cache` (`ensureCacheInstalled`), obwohl das Projekt bewusst
abhängigkeitsfrei ist. Funktional ersetzt durch `query_chrome_feature.mjs` (in
`package.json` als `check:browser-feature`). *Belegt:* `grep -rl`, `check-feature.js:29-60`.

**F3 — `og-image.mjs` (14,2 KiB) hat keinen Aufrufer.** Referenziert ist nur das
*Ergebnis* (`website/index.html:18` → `og-image.png`), nicht das Skript. Es ist ein
einmaliger Asset-Generator mit fest verdrahtetem Brief und eigenem Port 8099.

**F4 — `serve.mjs` ist ein 19-Zeilen-Wrapper** um `static-server.mjs` (Aufruf,
`path.resolve`, Log-Zeile). Zwei Dateien für einen `start`-Aufruf.

**F5 — Zwei Shallow Modules im Gate:** `structure-stand.js` (24 Zeilen, SHA-256 über
einen Dateirumpf) und `filematch.js` (42 Zeilen, Glob→RegExp). Beide existieren nur,
weil *zwei* Aufrufer sie brauchen — das ist korrekt, aber sie sind zu klein für eigene
Dateien im Root.

**F6 — CDP-Bootstrap ist sechsfach dupliziert.** Eigener Headless-Browser mit
`mkdtemp`-Profil, `spawn`, Port-Warten: `debug-session.mjs`, `mess-print.mjs`,
`print-messung.mjs`, `og-image.mjs`, `test-runner.mjs`; dazu WebSocket-Client-Logik in
`mess.mjs`, `seeder-diff.mjs`, `paint-probe.mjs`, `seed-geoapify.mjs`, `druck-pixel.mjs`.
*Belegt:* Zählung von `mkdtempSync`/`webSocketDebuggerUrl` je Datei (§12).

**F7 — Die Mess-Familie ist kein Duplikat-Cluster.** `mess.js` ist eine **In-Page-Funktion**
für `evaluate_script` (MCP-Vertrag, in `AGENTS.md` §3 und `dev.sh`-Hilfe dokumentiert);
`mess.mjs` ist ihr CLI-Transport; `mess-print.mjs` liest ihren Rumpf als Quelle
(`quelle.indexOf('() => {')`). `print-messung.mjs` misst dagegen das **PDF** (poppler),
`testbrief-messung.mjs` importiert die Addon-Logik **ohne Browser**. Vier verschiedene
Wahrheitsquellen — Zusammenlegen ja, aber nicht als „Duplikat entsorgen".

**F8 — `seed-geoapify.mjs` gehört zu Cluster 1, nicht zu den Daten-Pipelines.**
Einziger Aufrufer ist `dev.sh` (zweimal: Start + `key`-Unterbefehl). Es schreibt einen
Secret-Key in `localStorage` des Debug-Browsers — Dev-Umgebung, keine Datenpipeline.

**F9 — `dev.sh` ist kein Kleinstskript.** 410 Zeilen: Prozess-Identität über
`/proc/*/cmdline` (NUL-sicher), Port-Halter, Altprofil-Aufräumen, Desktop-Env-Export,
Tab-Polling. §7 der globalen Regeln (erst Bestehendes nutzen): **Bash behalten**, nicht
nach JS portieren. Es ist der einzige Bash-Einstieg und bleibt es.

**F10 — Doku-Drift ist messbar.** Drei Beispiele:
`tools/README.md` behauptet für `imr.js` den Pfad `docs/10-architecture/IMR-Registry.md`,
tatsächlich ist `REGISTRY_REL = 'docs/norm/IMR-Registry.md'` (`imr.js:15`).
`docs/STRUCTURE.md` listet **15** Werkzeuge, `tools/` enthält 37.
`batch/README.md:76-77` ruft `reviews/kontrakt.py` auf — `reviews/` existiert nicht.

**F11 — `fonts/subset_fonts.py` ist CI-blind.** `git ls-files fonts` → 0 Dateien, weil `/fonts/` ignoriert wird. Das Skript erzeugt aber das versionierte `website/fonts/inter-variable.woff2` (aktuell als `M` im Arbeitsbaum): ein Werkzeug, das Produktionsassets schreibt, liegt in einem ignorierten Asset-Ordner.

**F12 — Der Test hängt am Quelltext von `print-messung.mjs`.** `test/all.js:1989-2062`
macht 6 × `fetch('/tools/print-messung.mjs')` und prüft Shebang, Flags, Meldungen,
`process.exit(2)`, `exitCode = 3`, `brief-${n}.json`. **Jeder Umzug/Pfadwechsel bricht
diese Assertions** — sie müssen im selben Commit mitwandern.

**F13 — Zwei Modulsysteme ohne Regel.** 13 × CommonJS (Gate-Kette), 18 × ESM (alles
Neuere). `structure-stand.js` und `filematch.js` werden per `require` aus CJS geladen,
`mcp-live.mjs` importiert `website/js/webmcp.js` per ESM.

**F14 — Fünf Blind Spots, die jede Verschiebung bricht (K8, gemessen 2026-11-27).**

| # | Stelle | Was bricht | Beleg |
|---|---|---|---|
| 1 | `docs/meta/AUFGABEN-WEGWEISER.md` | Jeder dort genannte `tools/…`-Pfad wird auf Existenz geprüft; ein Umzug macht das Wegweiser-Gate rot. | `tools/repo-map-check.mjs:30-39` |
| 2 | `website/js/settings.js:368` | Die generierte MCP-Konfiguration enthält `['node','tools/mcp-live.mjs',…]` als String — der Nutzer-Agent zeigt nach einem Umzug ins Leere, ohne Fehlermeldung. | `settings.js:368` |
| 3 | `test/all.js:1989-2062` | 6 × `fetch('/tools/print-messung.mjs')` prüft den **Quelltext** (Shebang, `--saetze`, `process.exit(2)`, `exitCode = 3`); Pfadwechsel nur im selben Commit. | `grep -c "tools/print-messung.mjs" test/all.js` → 6 |
| 4 | `tools/dev.sh:88-90` | Prozess-Identität matcht `/proc/*/cmdline` gegen `tools/serve.mjs`, `tools/static-server.mjs`, `tools/mcp-live.mjs`; nach einem Umzug werden die Alt-Prozesse nicht mehr erkannt (Port 8088/9222 bleibt belegt). | `dev.sh:80-100` |
| 5 | `tools/static-server.mjs:68-79` | **Dual-Root**: Web-Wurzel `website/`, Fonts aus `<repo>/fonts/`, Geoapify-Key aus `~/.secrets/`; `findeFontsOrdner()` leitet den Repo-Pfad aus dem übergebenen Root ab. Ein Umzug darf diese Ableitung nicht verändern. | `static-server.mjs:77-79` |


---

## 4. Archiv-/Löschkandidaten (mit Prüfpflicht)

| Kandidat | KiB | Warum | Vor dem Entfernen zu prüfen |
|---|---:|---|---|
| `check-feature.js` | 17,0 | kein Aufrufer, ersetzt durch `query_chrome_feature.mjs` | `grep -rn "check-feature"`, `~/.din-briefneo/cache` (nur Cache, kein Datenbestand) |
| `og-image.mjs` | 14,2 | kein Aufrufer; nur das PNG wird gebraucht | ob `og-image.png` neu erzeugt werden muss (Designänderung) — sonst nur verschieben |
| `serve.mjs` | 0,8 | Wrapper | `dev.sh:88-90,366`, `README.md`, Doku-Nennungen |
| `druck-pixel.mjs` | 6,0 | Einmal-Harness (`batch/07` abgeschlossen) | `batch/07-pdf-addon/prompt.md` ist Historie, kein Auftrag |
| `seeder-diff.mjs` | 11,3 | Einmal-Differenztest (`batch/05` abgeschlossen) — **entschieden: archivieren (K5)** | keine: Regressionsbeobachtung ist Aufgabe des Korpus-Gates, nicht eines Einmal-Harness |
| `batch/*.py` | 13,2 | zeigen auf gelöschten `reviews/`-Pfad | `batch/README.md` korrigieren oder Ordner als Historie deklarieren |

**Summe der reinen Archivmasse: 42,5 KiB** (ohne `batch/`) = 11,3 + 17,0 + 14,2.
Damit fällt die Skriptmasse von 307,6 auf **265,1 KiB** (307,6 − 42,5); nach Abzug
des Bash-Shims `dev.sh` (13,9) bleiben **251,2 KiB** in den 5 Modulen (§5).

---

## 5. Ziel-Architektur: 5 Deep Modules

```
tools/
  din.mjs                  # EINE CLI: Routing + Hilfe + Manifest (483 Zeilen, §6.6)
  runtime/                 # M1  Browser- & Dev-Laufzeit
  measure/                 # M2  Messen (Bildschirm, Druck, PDF, Performance)
  fitness/                 # M3  Gate-Engine & Score
  laws/                    # M4  Verfassungs-Sonden
  content/                 # M5  Generierte Inhalte & Recherche
  dev.sh                   # Bash-Shim (bleibt, §F9)
  browser-audit.html       # GUI (bleibt, kein Modul)
  antipatterns/ data/      # Daten (bleiben)
```

„Deep" heißt hier: **ein** Einstiegspunkt pro Modul (`.mjs` mit `export`), viele interne Details. Wo ein Modul zu groß wird, ist es intern ein Ordner mit `index.mjs` — nach außen weiterhin *ein* Import.

| Modul | übernimmt | Größe | Öffentliche Fläche | Unterbefehle |
|---|---|---:|---|---|
| `runtime/` | `static-server`, `serve`, `browser`, `debug-session`, `mcp-live`, `test-runner`, `setup-din-home.sh`, `seed-geoapify` | **50,0 KiB** | `startServer()`, `findBrowser()`, `launch()`, `runTests()`, `startLive()`, `seedKey()` | `dev start\|stop\|status\|live\|key` · `test` |
| `measure/` | `mess.js` (bleibt als `inpage.js`), `mess.mjs`, `mess-print`, `print-messung`, `testbrief-messung`, `paint-probe`, `druck-pixel` | **44,5 KiB** | `measureSheet()`, `measurePrint()`, `measurePdf()`, `probeTtc()`, `diffPixels()` | `measure sheet\|print\|pdf\|ttc\|brief\|pixel` |
| `fitness/` | `build_db`, `reconciliation`, `structure-stand`, `repo-map-check` (K4) | **57,7 KiB** | `runFitness()`, `generateStructure()`, `runRules()` | `fitness` · `fitness rules` |
| `laws/` | `imr`, `structural-laws`, `isolation`, `links`, `terminology`, `lawcoverage`, `id-register` (K3), `filematch` → `scan.mjs` (K2) | **59,4 KiB** | `runLaws(names)` → `{ violations, checked }` | `laws [all\|imr\|isolation\|links\|terms\|structure\|coverage]` |
| `content/` | `adr-check`, `backlog-sync`, `test-dossier`, `build_plz_data`, `build_grosskunden_columnar`, `query_chrome_feature` | **39,6 KiB** | `syncBacklog()`, `checkIds()`, `checkAdr()`, `writeDossier()`, `buildData()`, `queryFeature()` | `content data\|docs\|ids\|adr\|research` |

**Summe Module: 251,2 KiB** (vorher 307,6; gemessen nach K2–K5, §12) · **5 Module +
3 Nicht-Module** (Bash-Shim, GUI, Datenordner) · Dateizahl 37 → **6 Einstiegspunkte**
(5 × `index.mjs` + `din.mjs`), Archiv separat (42,5 KiB). Die Reihenfolge der Module
im Baum ist **Bau-Reihenfolge**: `runtime/` vor `measure/` (K6).

### 5.1 Gemeinsame Innereien (der eigentliche Gewinn)

| Heute dupliziert | Künftig einmal |
|---|---|
| Headless-Browser-Start (5 ×) | `runtime/launch.mjs` — Profil, `spawn`, Port-Warten, Aufräumen |
| CDP-WebSocket-Client (10 ×) | `runtime/cdp.mjs` — `send()`, `events`, Reconnect, Timeout |
| No-Cache-Server (2 ×) | `runtime/static-server.mjs` |
| Datei-Scan / Glob (3 ×) | `laws/scan.mjs` — `walk()`, `matchFilePattern()` |
| Berichtsformat (Score, `[CRITICAL]`, Exit-Codes) | `laws/report.mjs` — unterste Schicht, von `fitness/` nach oben konsumiert (K1) |
| Port-/Prozess-Identität | bleibt Bash (`dev.sh`) — bewusst keine zweite Wahrheit |

### 5.2 Sweetspot-Bilanz — ehrlich gerechnet

| Modul | Ziel (gemessen) | Band 40–58 KiB | Kommentar |
|---|---:|---|---|
| `runtime/` | 50,0 | **✔** | Grenzfall; mit entfernter `setup`-Zeile 49,5 |
| `measure/` | 44,5 | **✔** | nach K5 ohne `seeder-diff` (vorher fälschlich 55,8) |
| `fitness/` | 57,7 | **✔** (Grenzfall) | `reconciliation.js` allein 38,2 KiB |
| `laws/` | 59,4 | ✘ (+1,4) | 7 Sonden + gemeinsame Scan-Mechanik (K2/K3) |
| `content/` | 39,6 | ✘ (−0,4) | nach K3 ohne `id-register` |

**Feststellung (gemessen, nicht geschätzt):** Mit Band 40–58 KiB liegen drei Module im
Band. `laws/` überschreitet es um 1,4 KiB — sieben Sonden teilen eine Scan-Mechanik,
und `id-register` gehört fachlich dorthin (K3). `content/` liegt 0,4 KiB unter der
Untergrenze. Ein hartes Band 40–50 wäre mit **5** Modulen nicht erreichbar, weil
`reconciliation.js` (38,2) + `build_db.js` (14,2) allein 52,4 KiB sind. Wer es erzwingt,
braucht **6–7** Module — also genau die Zersplitterung, die beseitigt werden soll.

**Empfehlung:** Band **40–58 KiB** als verbindlich erklären, mit der Regel „ein Modul =
eine Verantwortung". Eine Überschreitung (+1,4) und eine Unterschreitung (−0,4) sind
zulässig und werden durch den Wegfall von 9 Dateien und 42,5 KiB Archivmasse mehr als
ausgeglichen.

---

## 6. Einheitliches LLM-Interface: `node tools/din.mjs <bereich> <befehl>`

**Problem heute:** Ein Agent muss 37 Dateinamen kennen; `tools/README.md` ist unvollständig
und teils falsch (F10), `docs/STRUCTURE.md` listet 15 von 37.

**Ziel:** Ein Befehl, ein Hilfe-Baum, ein Manifest. Kein Raten.

| Gruppe | Befehl | Ersetzt |
|---|---|---|
| Dev | `din dev` / `dev stop` / `dev status` / `dev live` / `dev key` | `dev.sh`, `serve.mjs`, `seed-geoapify.mjs`, `mcp-live.mjs` |
| Test | `din test [--filter=…] [--allow-missing-browser]` | `test-runner.mjs` |
| Messen | `din measure sheet [ids…]` | `mess.mjs` |
| | `din measure print [ids…]` | `mess-print.mjs` |
| | `din measure pdf --saetze 42 [--rand-u 30] [--json]` | `print-messung.mjs` |
| | `din measure brief -n 50 [--json]` | `testbrief-messung.mjs` |
| | `din measure ttc --runs 30 --profile all` | `paint-probe.mjs` |
| | `din measure pixel <zielordner>` | `druck-pixel.mjs` |
| Gate | `din fitness [-q\|-v]` | `build_db.js` |
| | `din fitness rules` | `reconciliation.js --only-rules` |
| Gesetze | `din laws` (alle) / `din laws imr\|links\|terms\|…` | 6 Sonden einzeln |
| Daten | `din data plz` / `din data grosskunden` | `build_plz_data.mjs` / `build_grosskunden_columnar.mjs` |
| Doku | `din docs backlog` / `docs tests` / `docs index` | `backlog-sync.mjs` / `test-dossier.mjs` / `build_db.js -q` |
| Inhalte (Etappe 6) | `din content ids\|adr\|research` | `id-register.js` (→ `laws/`, K3) / `adr-check.js` / `query_chrome_feature.mjs` |
| Meta | `din tools [--json]` · `din help <gruppe>` | `tools/README.md` (generiert) |

**Etappe-1-Umfang (umgesetzt):** `din` / `--help` / `help <bereich>`, `test`, `fitness`,
`dev`, `measure`, `data`, `docs`, `tools`. `laws` und `content ids|adr|research` folgen
mit den Etappen 5/6 — sie brauchen die Modul-Interna, nicht nur Routing.

**Vertrag (für Menschen und Agenten gleich):**

1. `din` ohne Argumente druckt den Baum mit je einer Zeile — keine 37 Namen.
2. Jeder Unterbefehl kennt `--help` und `--json` (maschinenlesbar, stabiler Schlüssel).
3. **Exit-Codes einheitlich:** `0` ok · `1` Verstoß/Gate rot · `2` Vorbedingung fehlt
   (kein Browser, kein Server) · `3` IO-/Render-Fehler. Bestehende Codes aus
   `print-messung.mjs` werden übernommen, nicht neu erfunden.
4. Fehlermeldungen nennen den **nächsten Befehl**, nicht nur den Fehler („kein CDP → `din dev`").
5. `din tools --json` liefert `{ name, group, summary, file, gate, entry }` (Etappe 1
   zusätzlich `status` bei Altlasten) — daraus werden `tools/README.md` und der
   `tools/`-Block in `docs/STRUCTURE.md` **generiert** (behebt F10 dauerhaft, statt die
   Tabelle von Hand zu pflegen).
6. Die CLI ist **nur Routing**: keine Fachlogik, keine Duplikate. Richtwert ~250 Zeilen
   **Routing-Logik**; Hilfetexte und der statische Manifest-Katalog zählen nicht mit
   (Etappe 1 gemessen: 483 Zeilen = 35 Wurzel + 67 Manifest + 28 Delegation + 136 Hilfe
   + 74 Landkarten-Ausgabe + 91 Dispatch. Wächst die **Dispatch**-Sektion über ~150
   Zeilen, ist ein Unterbefehl am falschen Ort).

---

## 7. Sprachwahl

| Aufgabe | Sprache | Begründung (belegt) |
|---|---|---|
| Gate, Sonden, Messung, Daten, Doku-Sync | **Node ESM** (`.mjs`) | 18 von 31 Modulen sind bereits ESM; CI läuft `node-version: 22`; `package.json`-Scripts rufen `node`; Test-Harness ist Node/CDP; Null-Abhängigkeits-Politik |
| Font-Subsetting | **Python + fontTools** | `instantiateVariableFont` + WOFF2-Subsetting haben in JS keine gleichwertige Entsprechung; das Skript funktioniert (F11: gerade gelaufen) |
| Prozess-/Port-/Desktop-Steuerung | **Bash** (`dev.sh`) | `ss`, `/proc/*/cmdline`, `nohup`, Wayland-Env — bereits gelöst und getestet (F9) |
| Review-Batches | Python (`batch/`) | historisch, kein Neuaufbau |

**Empfehlung im Detail:**

- Neue und angefasste Dateien: **ESM** (`import`, `node:`-Präfix). Die 13 CJS-Dateien
  werden **nur beim Anfassen** umgestellt (Etappe 3–4), nicht als Massenumbau.
- `tools/din.mjs` **importiert nichts aus `tools/`**: es startet die bestehenden
  Skripte als Kindprozess (`spawnSync`/`execFileSync`, `stdio: 'inherit'`, K7). Damit
  bleiben die 13 CJS-Dateien unangetastet, `dev live` behält echtes stdin, und jeder
  Exit-Code kommt unverändert beim Aufrufer an. Kein `await import()`, kein
  `createRequire`-Geflecht.
- **Eine Ausnahme bleibt Python** — aber sie zieht um: `fonts/subset_fonts.py` →
  `tools/fonts/subset_fonts.py` (dann getrackt, CI-fähig). `fonts/` bleibt reiner
  Asset-Ordner mit `.ttf`/`.woff2`. Damit ist F11 gelöst, ohne die Lizenzregeln
  (`.gitignore`) zu berühren.
- **Kein** TypeScript, kein Bundler, keine npm-Abhängigkeit für `tools/` — das ist
  Projektinvariante (`AGENTS.md` §1.2) und deckt sich mit dem Ist-Zustand.

---

## 8. Migrationsplan (Strangler, 6 Etappen, jede einzeln gate-grün)

| # | Inhalt | Gate-Nachweis | Risiko | Aufwand |
|---|---|---|---|---|
| 0 | **Go einholen** (§11). Nichts wird verschoben. | – | – | – |
| 1 | ✅ **umgesetzt 2026-11-27:** `tools/din.mjs` als reiner **Delegator** — Kindprozesse per `spawnSync`/`execFileSync` mit `stdio: 'inherit'` (K7), kein `await import()`. `package.json` hat das Script `din`; alle Alt-Scripts bleiben unverändert. | `npm test` 430/430 + `node tools/build_db.js -q` 100,0 % + `din --help` / `din tools --json` | niedrig | S |
| 2 | Shallow-Interna einschmelzen: `serve.mjs`-Logik → `runtime/`, `structure-stand.js` → `fitness/`, `filematch.js` → `laws/scan.mjs` (K2); alte Pfade als 3-Zeilen-Re-Export lassen. | Gate + `grep` beweist 0 externe Aufrufer | niedrig | S |
| 3 | **`runtime/` zuerst** (K6): `test-runner` (CI-kritisch), dann `static-server`, `browser`, `serve`, `mcp-live`, `seed-geoapify`, `setup-din-home`. `dev.sh` bleibt Bash und ruft `din dev intern` oder bleibt unverändert. Blind Spot 4: `/proc`-Cmdline-Match in `dev.sh:88-90` mitziehen. | `npm test`, CI-Workflow lokal nachgestellt | mittel | M |
| 4 | `measure/` bilden — **erst jetzt**, weil es die Laufzeit voraussetzt (K6). **`print-messung.mjs` bleibt pfadstabil, bis die 6 Assertions in `test/all.js` im selben Commit auf den neuen Pfad zeigen** (F12). `mess.js` wird `measure/inpage.js`; `AGENTS.md` §3 + `dev.sh`-Hilfe + `map.md` zitieren den neuen Pfad. | `npm test` (6 Assertions) + Gate | **mittel** | M |
| 5 | `laws/` + `fitness/` bilden; `reconciliation.js` importiert **nur nach unten** aus `laws/` (K1/K2/K3). CJS→ESM nur hier, Datei für Datei. `repo-map-check.mjs` nach `fitness/` (K4). | Gate muss 100,0 % bleiben; `din laws X` vs. alter Sonde: gleiche Verstöße | **hoch** (Kern) | L |
| 6 | `content/` bilden (ohne `id-register`, K3), `check-feature.js` archivieren, `seeder-diff.mjs` archivieren (K5), `og-image.mjs` nach `tools/oneoff/`, `fonts`-Skript umziehen, Doku **generieren** (`din tools --json`), `repository.yaml` + `tools/README.md` + `docs/meta/tooling-overview.md` + `map.md` aktualisieren. Blind Spots 1–3 + 5 im selben Commit. | Gate 100 %, `din tools --json` deckt alle Dateien | niedrig | M |

**Abbruchkriterium je Etappe:** Gate < 100 % oder ein Test rot → Etappe zurückrollen (`git revert`), nicht „weiter und später reparieren". Shims erlauben, mitten in Etappe 3 oder 4 stehenzubleiben, ohne den Baum kaputt zu lassen.

**Reihenfolge-Begründung:** Etappe 1 liefert sofort den LLM-Nutzen (40 % des Ziels) bei
minimalem Risiko. Danach von außen nach innen, aber **Laufzeit vor Messung** (K6):
`measure/` braucht Server 8088/CDP 9222, die in `runtime/` wohnen. Der Kern
(`laws/` + `fitness/`) kommt als Etappe 5, wenn Shims und Laufzeit stehen.

---

## 9. Akzeptanzkriterien (mechanisch prüfbar)

1. `ls tools/*.js tools/*.mjs tools/*.sh` liefert **6** Einstiegspunkte (+ `dev.sh`).
2. `node tools/build_db.js -q` → `100.0 %` und Exit 0.
3. `npm test` grün, inklusive der sechs `print-messung`-Assertions (neuer Pfad).
4. `node tools/din.mjs` ohne Argumente listet alle Unterbefehle; jeder hat `--help`.
5. `node tools/din.mjs tools --json` ⊇ alle Dateien im Baum (Manifest = Wahrheit).
6. `grep -rn "tools/serve.mjs\|tools/mess.mjs\|tools/check-feature.js"` → **0 Treffer**
   in lebenden Dateien (`.trash/`, `docs/archive/` ausgenommen).
7. `git ls-files tools | grep -c "\.\(js\|mjs\|sh\)$"` = 6.
8. `fonts/` enthält keine ausführbaren Skripte mehr; `git ls-files tools/fonts` ≥ 1.
9. Keine Datei im Root von `tools/` unter 5 KiB außer `din.mjs` und `dev.sh`.
10. Summe der 5 Module ≤ 270 KiB (gemessener Zielwert 251,2 KiB, §5).
11. `din --help` bleibt schnell: **< 50 ms Eigenanteil** (gemessen 11 ×: min 97,9 ms
    gesamt bei 73,4 ms `node -e ''` → **24,5 ms**; Median-Differenz 23,4 ms, §12).
    Der Node-Start (~75–85 ms) ist nicht Teil des Budgets.
12. `din tools --json` listet **alle** Skripte aus `tools/` (37 Alt + `din.mjs` = 38);
    die Laufzeit-Ergänzung `sonstiges` ist leer.
13. `din test` und `din fitness` reichen den Exit-Code des Kindprozesses unverändert
    durch (0/1/2/3-Vertrag, §6).

---

## 10. Risiken

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Test hängt am Quelltext von `print-messung.mjs` (F12) | `npm test` rot bei Umzug | Assertions im selben Commit umziehen; Pfad bis dahin stabil halten |
| `evaluate_script({sourcePath})` braucht eine **Datei**, keine Funktion aus einem Modul | MCP-Messung bricht still | `measure/inpage.js` bleibt eigenständige Datei mit genau einer Funktions-Expression; Dokumentation in `AGENTS.md` nachziehen |
| Gate-Sonden sind der Kern des Projekts | Score fällt unter 100, alle Commits blockiert | Etappe 5 einzeln, Sond für Sonde, mit Vorher/Nachher-Vergleich der Verstoßliste |
| `docs/STRUCTURE.md` wird von `build_db` geschrieben, Tabelle ist **hartcodiert** | neue Dateien erscheinen nie in der Doku | Tabelle in Etappe 6 aus `din tools --json` generieren |
| `repository.yaml` + `tooling-overview.md` + `map.md` + `AGENTS.md` verweisen auf alte Pfade | Taxonomie-/Link-Gate rot, Agenten laufen ins Leere | Etappe 6 als **eine** Doku-Etappe; `links.js` findet tote Wikilinks sofort |
| Zwei Modulsysteme (F13) | `import`/`require`-Fehler beim Mischen | CJS nur beim Anfassen umstellen; in Etappe 1 **gar kein** Import, sondern Kindprozesse (K7) |
| Blind Spots (F14) | Ein Umzug bricht Wegweiser-Gate, Nutzer-MCP-Config, 6 Test-Assertions, Prozess-Erkennung oder das Dual-Root | Fünf Stellen im selben Commit mitziehen; Etappe 1 verschiebt nichts |
| Manifest veraltet still | LLM liest eine falsche Landkarte | `din tools --json` scannt `tools/` zur Laufzeit und ergänzt unbekannte Dateien als `sonstiges` (umgesetzt) |
| `dev.sh` ist 410 Zeilen ungetestete Prozesslogik | Port-Kollisionen, fremde Browser | **nicht portieren** (F9); nur Befehle delegieren |

---

## 11. Offene Go-Punkte (Hierarchie §2: keine Änderung ohne Go)

Mit dem Review vom 2026-11-27 sind **K1–K8 (§0) entschieden**; Punkt 4 unten ist für
`seeder-diff.mjs` durch K5 überholt (archivieren statt nach `measure/` verschieben).
Offen bleiben nur Entscheidungen, die Etappe 2–6 berühren:

| # | Entscheidung | Empfehlung | Wirkung |
|---|---|---|---|
| 1 | 5 Module mit Band **40–58 KiB** statt harter 40–50 | **ja** | sonst 6–7 Module = neue Zersplitterung |
| 2 | `check-feature.js` archivieren | **ja** | −17,0 KiB, −1 Datei, ersetzt durch `query_chrome_feature.mjs` |
| 3 | `og-image.mjs` nach `tools/oneoff/` verschieben (nicht löschen) | **ja** | Asset bleibt reproduzierbar, Root wird leerer |
| 4 | `druck-pixel.mjs`, `seeder-diff.mjs` archivieren | **nein, verschieben** nach `measure/` | Messfähigkeit bleibt erhalten |
| 5 | `fonts/subset_fonts.py` → `tools/fonts/` (getrackt) | **ja** | Font-Pipeline wird sichtbar und CI-fähig |
| 6 | `dev.sh` in Bash lassen | **ja** | vermeidet 410 Zeilen Risiko-Portierung |
| 7 | `din.mjs` sofort (Etappe 1) oder erst nach dem Umbau | **sofort** | 40 % Nutzen bei ~0 Risiko |
| 8 | `batch/*.py` korrigieren oder als Historie deklarieren | **deklarieren** | `batch/README.md` zeigt auf toten `reviews/`-Pfad |

---

## 12. Anhang — Messbefehle (reproduzierbar)

```bash
cd /home/moritz/repos/DIN-BriefNEO
wc -lc tools/*.js tools/*.mjs tools/*.sh | sort -n            # Größen/Zeilen
git ls-files tools | wc -l                                     # getrackte Dateien
grep -rn "tools/" package.json .github/ githooks/              # Automatisierungs-Aufrufer
grep -nE "^(import|const .*require)" tools/*.js tools/*.mjs    # CJS/ESM-Mischung
for f in tools/*.js tools/*.mjs tools/*.sh; do b=$(basename "$f"); \
  echo "$b $(grep -rl --exclude-dir=.git --exclude-dir=.trash -- "$b" . | grep -v "^./tools/$b$" | wc -l)"; done
grep -n "require('./" tools/*.js                               # Gate-Kette
grep -c "tools/print-messung.mjs" test/all.js                   # Quelltext-Testvertrag
git ls-files fonts | wc -l                                      # Font-Skript unsichtbar

# Etappe 1 (neu): Delegator + Landkarte
node tools/din.mjs --help | head -3
node tools/din.mjs tools --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).count))'   # 38
python3 -c 'import subprocess,time; [print(round((time.perf_counter()-t)*1000,1)) for t in [time.perf_counter()] for _ in [subprocess.run(["node","tools/din.mjs","--help"],capture_output=True)]]'  # Wanduhr

# Modulsummen nach K2–K5 (Bytes je Datei, /1024)
node -e '
const fs=require("fs");
const m={runtime:["static-server.mjs","serve.mjs","browser.mjs","debug-session.mjs","mcp-live.mjs","test-runner.mjs","setup-din-home.sh","seed-geoapify.mjs"],
measure:["mess.js","mess.mjs","mess-print.mjs","print-messung.mjs","testbrief-messung.mjs","paint-probe.mjs","druck-pixel.mjs"],
fitness:["build_db.js","reconciliation.js","structure-stand.js","filematch.js","repo-map-check.mjs"],
laws:["imr.js","structural-laws.js","isolation.js","links.js","terminology.js","lawcoverage.js","id-register.js"],
content:["adr-check.js","backlog-sync.mjs","test-dossier.mjs","build_plz_data.mjs","build_grosskunden_columnar.mjs","query_chrome_feature.mjs"]};
let t=0; for(const [k,f] of Object.entries(m)){const s=f.reduce((a,x)=>a+fs.statSync("tools/"+x).size,0); t+=s; console.log(k,(s/1024).toFixed(1))}
console.log("Summe",(t/1024).toFixed(1))'
```

**Zahlen in diesem Dokument (Ist, 2026-11-27):** 307,6 KiB = Summe der 37 Alt-Skripte
(315.012 B). Nach K2–K5 **Modulsummen: 50,0 + 44,5 + 57,7 + 59,4 + 39,6 = 251,2 KiB**.
Archiv: 11,3 + 17,0 + 14,2 = **42,5 KiB**. Differenz zu 307,6 KiB = 13,9 KiB (`dev.sh`,
bleibt Bash) + 42,5 KiB Archiv. Die früher genannte Modulsumme 262,5 KiB enthielt
`seeder-diff.mjs` (11,3) fälschlich in `measure/` — sie ist mit K5 überholt.
