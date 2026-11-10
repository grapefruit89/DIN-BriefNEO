---
id: agents-contract
title: AGENTS.md — Bindender KI-Verhaltensvertrag
type: ai-context
status: active
created: '2026-07-01'
updated: '2026-11-06'
tags:
- din-briefneo
- meta
- ai-context
- governance
- gemini
- agents
doc_links:
- '[[CLAUDE]]'
- '[[Immutable-Law-Catalog]]'
- '[[DECISION-LOG]]'
- '[[longevity-guidelines]]'
code_links: []
---

# AGENTS.md — DIN-BriefNEO

**BINDENDER VERHALTENSVERTRAG FÜR ALLE KI-AGENTEN**  
Dieser Vertrag ist nicht verhandelbar. Verstöße führen zur Ablehnung der Änderung.

> **Schritt 0 — Aufgabe → Datei (erste Pflichtlektüre):**
> Vor jeder Dateisuche `docs/30-meta/AUFGABEN-WEGWEISER.md` lesen: Absicht → Datei →
> Testfilter → Gate. Grep erst, wenn die Aufgabe dort nicht steht — und den Eintrag
> danach ergänzen (Selbstheilungs-Regel, Sektion 6).
> Nachschlagewerk bleibt `docs/STRUCTURE.md` (generiert); für Lade-Trigger und
> CSS-Kaskade `docs/10-architecture/ARCHITECTURE-MAP.md`.

---

## Lokale Vorschau (Pflicht vor manuellen Tests)

`file://` funktioniert nicht — ES-Module, `fetch` und `localStorage` sind dort eingeschränkt.
Jeder manuelle Test braucht einen HTTP-Server.

**Bequem (empfohlen):** `./tools/start.sh` startet den Server auf Port 8088 und öffnet Helium mit
DevTools-Protokoll auf Port 9222. Das Skript nutzt ein eigenes Profil
(`~/.local/share/helium-din-briefneo`): Läuft Helium bereits, entstünde sonst nur ein Tab im
bestehenden Prozess und der CDP-Port gar nicht. Nutzer-Tabs werden nicht angefasst.

**Manuell:**
```bash
cd /home/moritz/repos/DIN-BriefNEO
python3 -m http.server 8765 --directory website > /tmp/din-server.log 2>&1 &
echo $! > /tmp/din-server.pid
```

**Sichtbarer Browser aus einer Agent-Shell** (die Shell hat kein Display, `xdg-open`
schlägt dort fehl):
```bash
export XDG_RUNTIME_DIR=/run/user/1000 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus DISPLAY=:0 WAYLAND_DISPLAY=wayland-0
setsid /home/moritz/.local/bin/helium http://127.0.0.1:8765/index.html >/dev/null 2>&1 &
```

**Konsole und DOM per CDP lesen** (läuft, wenn `tools/start.sh` aktiv ist):
```bash
curl -s http://127.0.0.1:9222/json/list   # Targets inkl. webSocketDebuggerUrl
```

`--headless=new --dump-dom` ist **nur** für automatisierte Checks erlaubt, nie für manuelle
Tests. `--remote-debugging-address` wird nicht gesetzt: Standard `127.0.0.1` ist sicher,
`0.0.0.0` würde den Debug-Port im Netz öffnen. Aufräumen:
`kill $(cat /tmp/din-server.pid) 2>/dev/null; rm /tmp/din-server.pid`.

---

## 1. Höchste Autorität: Immutable Law Catalog

Das Dokument `docs/00-foundation/Immutable-Law-Catalog.md` (Immutable Law Catalog) ist die **höchste autoritative Quelle** dieses Projekts.

- Es definiert verbindlich, welche Technologien und Patterns **MUST-USE** und welche **FORBIDDEN** sind.
- Bei Konflikten zwischen diesem Dokument (`AGENTS.md`) und dem Immutable Law Catalog hat **letzteres Vorrang**.
- Änderungen am Law Catalog dürfen nur über einen formalen ADR-Prozess erfolgen.

Jeder Agent muss den aktuellen Stand des Law Catalogs kennen und respektieren.

---

## 2. Unverhandelbare Kernprinzipien

- **Fitness Gate 100%**: Vor und nach jeder relevanten Änderung muss `node tools/build_db.js` ausgeführt werden (plattformunabhängig). Der Fitness Score **muss 100 %** betragen.
- **Branchless Workflow**: Nur `main`-Branch. Feature-Branches sind verboten. Experimente erfolgen ausschließlich über `git stash`.
- **Surgical Changes & KISS**: Nur das ändern, was für die aktuelle Aufgabe strikt notwendig ist. Bevor JavaScript geschrieben wird, muss geprüft werden, ob moderne CSS- oder native Web-APIs ausreichen.
- **Git-Hooks (`githooks/`)**: Versionierte Pre-Commit-Gates (`git config core.hooksPath githooks`) stellen die 5-Stufen-Integrität vor jedem Commit lokal sicher.
- **Generalisierbarkeit**: Jede neue Lösung ist auf ihre Übertragbarkeit in die `llm_boilerplate` zu prüfen und zu dokumentieren.

---

## 2a. Verworfen bleibt verworfen (Ratsche)

- **Gedächtnis:** `todo/ANTIPATTERNS-VERWORFEN.md` führt abgelehnte Ideen mit Grund
  und Datum. Vor einem „neuen" Vorschlag dort nachsehen — Wiederaufnahme nur, wenn
  sich die Grundlage geändert hat (Chrome-Version, Projekt-Scope).
- **Maschinell:** `tools/antipatterns/*.json` mit `max_violations` ist eine Ratsche.
  Das Budget wird **gesenkt**, nie angehoben, um grün zu werden.
- **Eine Auswertung:** `tools/reconciliation.js` → `evaluateAntipatterns()`; das
  Fitness Gate und `--only-rules` (pre-commit Stufe 4) nutzen dieselbe Funktion.

---

## 3. Workflow-Modi

### Light Mode (Default)
1. Fitness Gate ausführen (Pre-Build, siehe §2: `node tools/build_db.js`)
2. Kontext abfragen: Repo-Struktur in `docs/STRUCTURE.md` und Architektur-ADRs lesen
3. Änderung durchführen
4. Fitness Gate ausführen → **Fitness Score muss 100 %** sein
5. Dokumentation & Generalisierungs-Vermerk in `DECISION-LOG.md` pflegen

### Full Mode
Zusätzlich:
- `specs/`-Ordner anlegen
- `spec.md` mit Anforderungen und Generalisierungs-Check erstellen
- Bei Bedarf `plan.md` + `tasks.md`

---

## 4. Context7 – Verbindliche Nutzung

**Context7 ist bei folgenden Situationen verpflichtend zu nutzen:**

- Unsicherheit über eine Web-API, CSS-Eigenschaft oder JavaScript-Methode
- Prüfung, ob eine native Lösung existiert (bevor JS geschrieben wird)
- Verifikation von Browser-Support (Projekt-Baseline: Chrome 150+; Live-Empirie per CSS.supports() schlägt jedes Baseline-Datum)
- Prüfung auf Deprecations oder bessere Alternativen

Die relevanten Erkenntnisse aus Context7 sind kurz im `DECISION-LOG.md` zu dokumentieren.

**Grundsatz:** Context7 hat Vorrang vor veraltetem Wissen oder Annahmen.

---

## 5. Dokumentations- & Traceability-Pflicht

- Neue ADRs und Guides werden aus den offiziellen Vorlagen erstellt: `docs/30-meta/TEMPLATES.md`.
- Jedes neue Dokument muss vollständiges Frontmatter nach Schema V6 enthalten.
- Die automatisierte Function Traceability Matrix darf **nur** durch `tools/build_db.js` verändert werden.
- Neue Code-Funktionen müssen Traceability über `@adr` / `@guide` Kommentare herstellen.

### 5.1 Ein Fakt, ein Ort (oberste Doku-Regel)

Jede Aussage lebt an **genau einer** Stelle. Alle anderen Stellen **verlinken** darauf.
Das ist keine Stilfrage: Das Doku-Audit 2026-10-02 hat gezeigt, dass derselbe Kanon an Verboten
in fünf Fassungen existierte und dabei nachweislich auseinanderlief — `CLAUDE.md` empfahl als
`new Date()`-Ersatz ausgerechnet das von **A50** verbotene zonenlose `Temporal.Now.plainDateISO()`,
weil die fünfte Kopie beim A50-Beschluss vergessen wurde.

**Vor jedem neuen Absatz gilt die Pflichtfrage:** Steht das schon irgendwo? Wenn ja —
dorthin verlinken, nicht wiederholen. Wenn es dort falsch steht — dort korrigieren.

### 5.2 Wo was hingehört

| Art des Wissens | Ort | Merkmal |
| :--- | :--- | :--- |
| Norm, Verbot, MUST-USE | `docs/00-foundation/Immutable-Law-Catalog.md` | dauerhaft, ADR-pflichtig änderbar |
| Fachliche Produktanforderung | `docs/00-foundation/spec.md` | WAS das Produkt leistet |
| Architekturentscheidung (thematisch) | `docs/10-architecture/ADR-*.md` | abgeschlossen, referenzierbar |
| Geometrie, 45 Atome, DIN-Millimeter | `docs/10-architecture/IMR-Registry.md` | **SSoT**, nie duplizieren |
| „So macht man das" (Code-nah) | `docs/20-implementation/*.md` | Guide, aus Template |
| Begriffe | `docs/20-implementation/glossary.md` | Ubiquitous Language |
| Begründung / Historie / Irrtümer | `docs/30-meta/DECISION-LOG.md` | append-only Chronik |
| Arbeitsweise, Tooling, Vorlagen | `docs/30-meta/` | darf veralten, wird gepflegt |
| Abgeschlossene Einmal-Artefakte | `docs/90-archive/` | `status: archived`, eingefroren |

- **Agenten-Tooling ist kein Produktwissen.** Alles, was Build-Pipeline, MCP, Vektorsuche oder
  Editor-Setup betrifft, gehört nach `30-meta/` — nicht nach `20-implementation/`.
- **Repo-Root ist eine Allowlist.** Neue Dateien im Wurzelverzeichnis sind nur zulässig, wenn
  sie in `repository.yaml` → `taxonomy.allowed_root_files` eingetragen sind. Audits, Berichte
  und Analysen gehören nach `docs/90-archive/`.

### 5.3 Pflichten bei jeder Doku-Änderung

1. **Frontmatter V6 vollständig** — inkl. `status` und wahrheitsgemäßem `updated`.
2. **`updated:` einzeln pflegen.** Sammel-Stempeln aller Dateien auf dasselbe Datum ist
   verboten — es vernichtet die einzige Information, die das Feld trägt.
3. **`status:` muss dem Ort entsprechen.** Alles unter `90-archive/` ist `archived`.
4. **Wikilinks statt Pfad-Kopien**, damit das Link-Gate (`tools/links.js`) sie prüfen kann.
5. **Fitness Gate nach `git add` ausführen.** Taxonomie- und Link-Regeln lesen den Git-Index;
   ein Lauf vor dem Stagen meldet grün, was der Commit erst einführt (Vorfall 2026-10-02).

### 5.4 Was wir in `docs/` nicht tun

- ❌ **Verbote, Regeln oder Baselines kopieren.** Nur der Law Catalog (Normen) und die
  Longevity-Guidelines (Browser-Baseline) führen sie. Alles andere verlinkt.
- ❌ **Projektstatus in Kontextdateien schreiben** (`CLAUDE.md`, `GEMINI.md`, Hubs). Solche
  Snapshots („Stand: 2026-08-07") sind per Konstruktion sofort veraltet → `ROADMAP`/`Feature-Matrix`.
- ❌ **Normative Regeln in den DECISION-LOG schreiben.** Der ist append-only; Regeln müssen
  änderbar bleiben. Der Log hält den *Beschluss*, das normative Dokument die *Regel*.
- ❌ **Eingefrorene Snapshots als „SSoT" ausgeben.** Lebende Quelle ist die generierte
  Datenbank aus `tools/build_db.js`.
- ❌ **Dokumente anlegen, die niemand referenziert.** Orphans (von nichts verlinkt, von keinem
  `@adr`/`@guide` adressiert) sind Archiv-Kandidaten — Link-Zähler ist das Kriterium.
- ❌ **Guard-Kommentare doppelt pflegen.** Der Schutztext lebt im Modul; HTML verweist darauf.

### 5.5 Ein Sachverhalt, ein Begriff

Für jeden Sachverhalt steht **ein** Begriff fest. Synonyme sind keine Stilvielfalt, sie
zersplittern Suche, Grep und das Verständnis neuer Mitlesender — und sie verstecken
Duplikate, weil zwei Texte über dieselbe Sache unter zwei Namen nicht mehr als Doppelung
auffallen.

Die verbindliche Liste steht in [[glossary]] → „Kanonische Begriffe". Sie nennt zu jedem
Begriff ausdrücklich die **verdrängten Varianten**. Wer einen neuen Begriff braucht, trägt
ihn dort ein, bevor er ihn verwendet.

Maschinell geprüft: die Regeln `P6`–`P11` in `tools/antipatterns/project.json` lassen das
Fitness Gate bei einer verdrängten Variante anschlagen. Englische Bezeichner im Code
(`draft`, `settings`) sind davon unberührt — geprüft wird Fließtext in `docs/`.

### 5.6 Geschützte Dokumente

Drei Gruppen dürfen nicht gelöscht, verschoben oder umbenannt werden. Alle drei sind
**maschinell** geschützt — Konvention allein hat sich als zu schwach erwiesen.

| Gruppe | Schutz |
| :--- | :--- |
| Die vom Code per `@adr`/`@guide` referenzierten Dokumente | `tools/links.js` scannt seit 2026-10-02 auch `website/**.{js,css,html}`. Fehlt das Ziel, meldet das Gate CRITICAL. |
| [[IMR-Registry]] (SSoT für die 45 Atome und die DIN-Geometrie) | `tools/imr.js` prüft die Registry-Invarianten und den Abgleich mit dem Code. |
| [[DECISION-LOG]] und `docs/90-archive/` | Append-only bzw. eingefroren. Von Link-, Terminologie- und Größenprüfung ausgenommen, damit Alteinträge Zeitdokumente bleiben dürfen. |

> [!warning] Warum der Code-Scan nötig war
> Vorher fiel das Verschwinden eines solchen Dokuments nur auf, wenn zufällig **auch** eine
> andere Markdown-Datei darauf verlinkte. `geoapify-autocomplete` hing an genau **einem**
> solchen Verweis — wäre der entfallen, hätte das Gate die Löschung stillschweigend
> durchgewunken, obwohl zwei Module das Dokument referenzieren. Der Schutz war also
> nicht vorhanden, sondern ein Zufall.

Der [[DECISION-LOG]] ist dabei kein Ballast, sondern das Gedächtnis für *verworfene* Wege.
Im Code-Audit 2026-10-02 hat er mehrfach verhindert, dass eine bewusst gewählte Lösung
fälschlich als Antipattern gemeldet wurde. Vor jedem „das sieht falsch aus" dort nachsehen.

### 5.7 `website/` und `docs/` sind getrennt

**`website/` ist ein auslieferbares Artefakt.** Kopiert man den Ordner allein auf einen
Webserver, muss die App vollständig starten — ohne `docs/`, ohne `tools/`, ohne das
Repository drumherum. Das ist kein Ideal, sondern eine geprüfte Invariante: **`A45`**,
erzwungen von `tools/isolation.js`.

Verboten ist daher in `website/**.{html,css,js}` jede Referenz, die den Ordner verlässt —
`../..`, `/docs/`, `/tools/`, absolute Dateisystempfade — und jeder **ladende** Verweis
(Script, Style, Font, Bild) auf einen fremden Host.

Die Trennung läuft in **beide** Richtungen und ist bewusst asymmetrisch:

| Richtung | Regel |
| :--- | :--- |
| `website/` → `docs/` | **Nur Kommentare.** `@adr`/`@guide [[Doc]]` sind Traceability ohne Laufzeitwirkung. Verschwindet die Doku, läuft die App weiter. |
| `docs/` → `website/` | Frei. Dokumentation darf Code beschreiben und über `code_links` auf ihn zeigen. |

> [!info] Warum Kommentare erlaubt bleiben
> Sie kosten zur Laufzeit nichts und tragen die Traceability, die das Projekt ausmacht.
> `tools/links.js` prüft die Gegenrichtung: ein per `@adr` referenziertes Dokument darf
> nicht unbemerkt verschwinden. Zusammen heißt das — die App **bricht** nicht, wenn die
> Doku fehlt, aber es **fällt auf**.

### 5.8 CI- und Workflow-Verifikationsdisziplin

Keine Abschlussmeldung ohne Verifikation des realen CI- und Workflow-Status. Lokale Prüfungen (Fitness-Gate, Linter, Gesetzes-Coverage) sind eine notwendige Voraussetzung, aber hinreichend ist erst der Status aller relevanten GitHub Actions Workflows (`Fitness Gate`, `Deploy Pages`, `update_plz_pipeline`).

Eine Erfolgsmeldung ohne Nennung des HEAD-Commit-Hashes und der tatsächlichen CI-Verifikation gilt als unvollständig. Bei jedem Pull Request oder Push an Pipeline- oder Workflow-Dateien ist der entsprechende Workflow-Lauf abzuwarten und zu bestätigen.

---

## 6. Generalisierbarkeit & llm_boilerplate

DIN-BriefNEO ist ein **Testballon** für die `llm_boilerplate`. 

Bei jeder architektonischen oder tooling-bezogenen Entscheidung ist zu prüfen:
- Ist diese Regel/pattern generalisierbar?
- Sollte sie in die Boilerplate übernommen werden?

Erkenntnisse sind im `DECISION-LOG.md` festzuhalten.

---

## 7. Verbotene Technologien

**Diese Datei führt keine Verbotsliste.** Sie stand hier bis 2026-10-02 — und war falsch:
Sie behauptete „Hex/RGB/HSL-Farben (nur OKLCH erlaubt)", während **C1** eine abgestufte
Kette `OKLCH → Lab/LCH → HSL → RGB → HEX → Named` erlaubt. Eine Kopie, die ihr Original
verschärft, ist genauso schädlich wie eine, die es aufweicht.

Verbindlich und vollständig: **`docs/00-foundation/Immutable-Law-Catalog.md`**.

Vor einer Änderung dort nachschlagen — nicht aus dem Gedächtnis oder aus einer
Kontextdatei zitieren. Agenten referenzieren Gesetze über ihre **ID** (`A52`, `H11`, `S1`),
niemals über Abschnittsnummern eines anderen Dokuments.

## 7a. Arbeitsweise (übernommen aus GEMINI.md, 2026-10-02)

Verhaltensregeln, die Fehlerklassen adressieren, die bei LLM-Mitarbeit regelmäßig auftreten.
Keine Normen — Normen stehen im Law Catalog.

### Denken vor Code
- Annahmen **aussprechen**. Bei Unklarheit anhalten und benennen, was unklar ist.
- Mehrere Lesarten? Vorlegen, nicht still eine auswählen.
- Gibt es einen einfacheren Weg, das sagen — auch ungefragt.

### Minimalität
- Kein Feature über das Gefragte hinaus, keine Abstraktion für Einmalcode, keine
  „Konfigurierbarkeit" auf Vorrat, keine Fehlerbehandlung für unmögliche Fälle.
- Prüffrage: Würde ein erfahrener Entwickler das überkompliziert nennen?

### Chirurgische Änderungen
- Nur anfassen, was die Aufgabe verlangt. Angrenzenden Code nicht „verbessern".
- Vorhandenen Stil treffen, auch wenn man es anders schreiben würde.
- Fremden toten Code **melden**, nicht löschen. Eigenen Müll aufräumen.
- Test: Jede geänderte Zeile muss sich auf den Auftrag zurückführen lassen.

### Anti-Alzheimer-Protokoll (Diff- & Zeilen-Disziplin)
- Vollständiges Neugenerieren/Überschreiben bestehender Dateien (>50 Zeilen) ist strikt verboten. Ausschließlich punktuelle Block-Edits auf den Zielbereich.
- Zeilen-Audit: Vor dem Edit 'wc -l <datei>', nach dem Edit 'wc -l <datei>'. Unerklärter Zeilenschwund ist ein sofortiger Abbruchgrund.
- Diff-Prüfung: Vor dem Staging muss via 'git diff -U1' verifiziert werden, dass keine unbeteiligten Abschnitte, Kommentare oder Fallbacks verloren gegangen sind.
- Im Tätigkeitsbericht ist für jede editierte Datei die Zeilenmetrik anzugeben: [Vorher: X | Nachher: Y | Netto: +/-Z].

### Verifizierbare Ziele
Aufgabe in ein prüfbares Ziel übersetzen („Bug beheben" → „Test schreiben, der ihn
reproduziert, dann grün machen"). Bei mehrstufigen Aufgaben kurzen Plan nennen:
`1. [Schritt] → Prüfung: [Check]`.

### Bugs sofort beseitigen — ohne Kollateralschaden

Wenn du beim Arbeiten einen Bug findest (fehlgeschlagene Zusicherung, toter Guard,
falsche Typ-Annahme, stiller Fehlschlag, subtiler Datenfehler), beseitige ihn sofort —
ohne zu fragen. Aber:

1. **Isoliere den Fix.** Kein Refactoring „nebenbei", keine Verhaltensänderung
   außerhalb des Bugs.
2. **Schreibe einen Test, der den Bug reproduziert** (rot vor dem Fix, grün danach).
   Wenn kein Test möglich ist: dokumentiere, warum.
3. **Gates nach dem Fix:** `build_db -q`, `test-runner`, `biome`. Bei rot:
   zurückrollen, Ursache melden.
4. **Melde den Bug im Output:** Datei:Zeile, Symptom, Fix, Test.
5. **Wenn der Fix einen Vertrag ändert** (z. B. eine bestehende Zusicherung
   angepasst werden muss): dokumentiere die Vertragsänderung explizit, wie bei der
   Allowlist-Erweiterung (I/EM) geschehen.

Was **nicht** als „Bug" gilt: fehlende Features, Performance-Optimierungen,
Stil-Änderungen, „das könnte man besser machen". Diese gehören nach `todo/`,
nicht in einen Sofort-Fix.

### Pixel-Perfect-Nachweis bei Element-Umbauten

Bei jedem Umbau, der ein sichtbares Element ersetzt (contenteditable → input/textarea,
div → span, custom element → natives Element), ist ein Vorher/Nachher-Nachweis Pflicht:

1. **Vor dem Umbau:** `getBoundingClientRect()` für das Element und seinen Container
   messen (x, y, width, height). Werte notieren.
2. Umbau.
3. **Nach dem Umbau:** dieselben Messungen.
4. **Delta-Tabelle im Output:** Element | x vorher | x nachher | Δx | y | Δy | width |
   Δwidth | height | Δheight.
5. **Akzeptanz:** Δ ≤ 0.5 px in allen Dimensionen. Wenn größer: Ursache finden
   (CSS-Reset, Box-Modell, baseline) und fixen, bevor der Umbau als fertig gilt.
6. **Messung mit CDP/F12, nicht nach Augenmaß.** Der Debug-Browser
   (`tools/browser.mjs` oder gleichwertig) ist das Werkzeug.

Gilt **nicht** für: reine Farb-/Schrift-Änderungen, neue Elemente ohne Vorgänger,
Elemente außerhalb des Briefblatts (Sidebar).
Gilt **für**: jedes Element, das auf dem Papier sichtbar ist.

### Commits
Der Agent committet selbst, sobald alle Gates grün sind. Die Prüfliste steht im
Tätigkeitsbericht-Vertrag weiter unten (Fitness 100 %, Tests grün, Biome 0,
Antipattern im Budget) — hier nicht wiederholt.

**Commit-Message-Format:**
- Zeile 1: kurz, deutsch, max. 72 Zeichen
- Leerzeile
- Body: Was, Warum, welche Dateien
- Kein „Co-authored-by", keine Emojis im Body
- Stil analog zu `93140cb`, `f1545aa`, `55936b5`

**Push:** nur wenn der Auftrag es explizit sagt oder der Nutzer im laufenden
Dialog „push" sagt. Sonst: Commit ja, Push nein.

Nach jedem Commit: `git status` prüfen. Arbeitsbaum muss sauber sein.

### Experimentelle APIs absichern
Moderne APIs sind ausdrücklich erwünscht (`Temporal`, `startViewTransition`), müssen aber
feature-detected oder in `try/catch` laufen. Im Boot-Pfad (`DOMContentLoaded`) darf ein
fehlendes Feature **niemals** nachfolgende Listener blockieren — sonst friert die UI ein.

### Recherche
Bei Fragen zu Web-Standards zuerst **chromestatus.com** prüfen und die konkrete Version
nennen („Shipping in Chrome 151"). Ergänzend Context7 nach §4. Live-Empirie per
`CSS.supports()` schlägt jedes Baseline-Datum.

### Codestruktur
- **Eine Verantwortung pro Datei**; der Dateiname benennt sie. Ausnahmen: `main.js`
  (reiner Orchestrator) und Utility-Module, die verwandte Helfer bündeln.
- `main.js` enthält **keine** Geschäftslogik. Module werden instanziiert und per
  Dependency Injection gekoppelt — keine `window.*`-Globals für interne Logik.
- JS-Dateien liegen **flach** in `website/js/` mit sprechenden Domänennamen (`core.js`, `document.js`, `address.js`, `salutation.js`, `settings.js`, `persistence.js`, `main.js`, `boot-theme.js`). Unterordner und Zahlenpräfixe sind unzulässig.
- Wird ein Feature, nach dem das Gate in `main.js` sucht, ausgelagert, bleibt dort ein
  Trace-Kommentar zurück: `// Feature Trace: <API> wird jetzt in <Modul> behandelt`.

### Autonome CLI-Ausführung & Tätigkeitsbericht-Vertrag

Projektweiter, verbindlicher Standard für alle Agenten-Schnittstellen (CLI, Antigravity, OpenCode, Claude Code):
- **Der CLI-Agent ist das ausführende Organ:** Er generiert niemals manuelle Shell-Befehle oder „Befehle zum Kopieren“ für den Nutzer, sondern führt Änderungen, Prüfungen, Gate-Läufe und Git-Operationen autonom im Dateisystem durch.
- **Verbindliches Berichts-Schema (5 Pflicht-Punkte):**
  1. **Angefasste Dateien & Pfade:** Vollständige absolute Pfadliste aller geänderten, erstellten oder gelöschten Dateien inkl. Status (`git mv`, `git rm`, `edit`).
  2. **Gefundene Probleme & Konflikte:** Identifizierte Invarianten-Verstöße, Inkonsistenzen oder Regressionsrisiken (bzw. Bestätigung: *„Keine Konflikte“*).
  3. **Vollzugsnachweis & Testmetriken:** Konkrete Ergebnisse der Testläufe (Unit-Tests bestanden/gesamt, Adress-Korpus-Gate bestanden/known, Antipattern-Prüfung 36/36).
  4. **Fitness-Score:** Evolutionary Fitness Score via `node tools/build_db.js -q` (Soll: 100.0% clean).
  5. **Commit-Hash & Push-Bestätigung:** SHA-Hash des Git-Commits und Bestätigung des Pushes auf `main`.

## Upstream Ground-Truth & Browser-Features (Chromium 150+)

- **Prinzip:** Vor dem Bauen von Workarounds oder JS-Heuristiken MUSS geprüft werden, ob Chromium das Feature nativ beherrscht. Spekulatives oder veraltetes LLM-Trainingswissen ist unzulässig; maßgeblich ist ausschließlich die maschinenlesbare Upstream-Realität.
- **Maschinenlesbare Endpunkte & Abfrage-Leitfaden:**
  1. **Chrome Platform Status API:**
     - URL: `https://chromestatus.com/api/v0/features?milestone=<VERSION>`
     - Nutzung: Prüfe Status `ENABLED_BY_DEFAULT` für Milestones 140 bis 156.
  2. **MDN Browser-Compat-Data (BCD Raw JSON):**
     - Base-URL: `https://raw.githubusercontent.com/mdn/browser-compat-data/main/`
     - Pfade: `html/elements.json`, `html/global_attributes.json`, `css/properties.json`, `css/selectors.json`, `api/Document.json`, `api/Element.json`, `api/Popover.json`
     - Kriterium: `support.chrome.version_added >= "140"`
  3. **WebDX Feature-Index:**
     - URL: `https://raw.githubusercontent.com/web-platform-dx/web-features/main/index.json`
     - Nutzung: Standardisierte Baseline-Definitionen und Feature-Keys abgleichen.
- **Kanonisches CLI-Tool:** `node tools/query_chrome_feature.mjs <feature-name>` liefert in <500 ms den verifizierten Status direkt im Terminal.

---

## 8. Protokollierung

Jede relevante Aktion wird transparent dokumentiert:
- **Git Commit:** Präzise, konventionelle Commit-Messages (`feat:`, `fix:`, `refactor:`, `chore:`).
- **Architektur & Governance:** Begründete Einträge im [[DECISION-LOG]].

## 9. Zusammenfassung der harten Regeln

- Der Immutable Law Catalog ist die höchste Instanz.
- Context7 muss bei Unsicherheit über Web-Technologien genutzt werden.
- Fitness Score 100 % vor und nach relevanten Änderungen.
- Branchless auf main.
- Templates + vollständiges Frontmatter V6 bei neuer Dokumentation.
- Surgical Changes & KISS priorisieren.
- Generalisierbarkeit prüfen und dokumentieren.

Verstöße gegen diesen Vertrag führen zur Ablehnung der Änderung.

*Hinweis: Konzentriere dich auf die oben genannten Regeln.*
