---
id: agents-contract
title: AGENTS.md — Bindender KI-Verhaltensvertrag
type: ai-context
status: active
created: '2026-07-01'
updated: '2026-10-02'
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
code_links:
- 'tools/log_session.js'
---

# AGENTS.md — DIN-BriefNEO

**BINDENDER VERHALTENSVERTRAG FÜR ALLE KI-AGENTEN**  
Dieser Vertrag ist nicht verhandelbar. Verstöße führen zur Ablehnung der Änderung.

---

## 1. Höchste Autorität: Immutable Law Catalog

Das Dokument `docs/00-foundation/Immutable-Law-Catalog.md` (Immutable Law Catalog) ist die **höchste autoritative Quelle** dieses Projekts.

- Es definiert verbindlich, welche Technologien und Patterns **MUST-USE** und welche **FORBIDDEN** sind.
- Bei Konflikten zwischen diesem Dokument (`AGENTS.md`) und dem Immutable Law Catalog hat **letzteres Vorrang**.
- Änderungen am Law Catalog dürfen nur über einen formalen ADR-Prozess erfolgen.

Jeder Agent muss den aktuellen Stand des Law Catalogs kennen und respektieren.

---

## 2. Unverhandelbare Kernprinzipien

- **Fitness Gate 100%**: Vor und nach jeder relevanten Änderung muss `tools/start.ps1` ausgeführt werden (PowerShell; `-Force` erzwingt ungecachte Pipeline). Auf Linux ohne `pwsh`: `node tools/build_db.js` — das ist der Fitness-Gate-Einstieg; `tools/reconciliation.js` ist nur ein Modul und gibt allein nichts aus. Der Fitness Score **muss 100 %** betragen.
- **Branchless Workflow**: Nur `main`-Branch. Feature-Branches sind verboten. Experimente erfolgen ausschließlich über `git stash`.
- **Surgical Changes & KISS**: Nur das ändern, was für die aktuelle Aufgabe strikt notwendig ist. Bevor JavaScript geschrieben wird, muss geprüft werden, ob moderne CSS- oder native Web-APIs ausreichen.
- **Generalisierbarkeit**: Jede neue Lösung ist auf ihre Übertragbarkeit in die `llm_boilerplate` zu prüfen und zu dokumentieren.

---

## 3. Workflow-Modi

### Light Mode (Default)
1. Fitness Gate ausführen (Pre-Build, siehe §2)
2. Kontext lesen: `agent/cache/LLM_CONTEXT.md` — wird von `tools/create_context.js` generiert (Teil von `start.ps1`, gecacht), nicht von `build_db.js`
3. Änderung durchführen
4. Fitness Gate ausführen → **Fitness Score muss 100 %** sein
5. Mit `node tools/log_session.js` protokollieren
6. Generalisierungs-Vermerk in `DECISION-LOG.md` schreiben

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

- Neue ADRs und Guides werden aus den offiziellen Templates erstellt: `docs/30-meta/ADR-TEMPLATE.md` und `docs/30-meta/GUIDE-TEMPLATE.md`.
- Jedes neue Dokument muss vollständiges Frontmatter nach Schema V6 enthalten.
- Die automatisierte Function Traceability Matrix darf **nur** durch `build_db.py` verändert werden.
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

### Verifizierbare Ziele
Aufgabe in ein prüfbares Ziel übersetzen („Bug beheben" → „Test schreiben, der ihn
reproduziert, dann grün machen"). Bei mehrstufigen Aufgaben kurzen Plan nennen:
`1. [Schritt] → Prüfung: [Check]`.

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
- JS-Dateien liegen **flach** in `website/js/`. Domäne steckt im zweistelligen Präfix:
  `0x` Core · `3x` UI · `4x` Features · `5x` Utils. Unterordner sind unzulässig.
- Wird ein Feature, nach dem das Gate in `main.js` sucht, ausgelagert, bleibt dort ein
  Trace-Kommentar zurück: `// Feature Trace: <API> wird jetzt in <Modul> behandelt`.

---

## 8. Protokollierung

Jede relevante Aktion muss direkt nach erfolgreichem Post-Build protokolliert werden:

```bash
node tools/log_session.js --agent "<Name>" --action "<Aktion>" --file "<Datei>" --desc "<Was + Warum + Generalisierbarkeit + ggf. Context7-Erkenntnis>"
```

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
