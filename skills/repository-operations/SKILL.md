---
name: repository-operations
description: >
  Zentrale Entscheidungslogik fuer die Arbeit an diesem Repository:
  WANN welches Tool, welche Recherche und welches Vorgehen angemessen ist.
  Enthaelt die Karpathy-Disziplin, die Ponytail-Economy-Leiter, den
  5-Schritt-Workflow, die Forschungs-Quellenpyramide (Tiers 0-5), das
  Fragetyp-Routing sowie die strikte HTML-vor-CSS-vor-JS-Entscheidungsleiter
  fuer Produktfeatures in website/.
---

# Skill: repository-operations

Kanonischer Entscheidungs- und Workflow-Skill für DIN-BriefNEO.
Ergänzt `AGENTS.md` (das WAS/WARUM) und die deterministischen Skripte in `tools/` (das WIE) um die handlungsleitende Entscheidungslogik (das WANN und IN WELCHER REIHENFOLGE).

---

## 1. Verhaeltnis zu AGENTS.md, repository.yaml und Tools

Drei Schichten bilden die Architektur:

1. **Repository Contract (`repository.yaml`, `AGENTS.md`, `Immutable-Law-Catalog.md`)**: Grundgesetze, Invarianten und Taxonomie.
2. **Skill (`skills/repository-operations/SKILL.md`)**: Entscheidungslogik. Beantwortet: *„Wann tue ich was in welcher Reihenfolge?“*
3. **Tooling (`tools/*.js`, `tools/*.mjs`, `tools/*.py`)**: Deterministische Implementierung. Beantwortet: *„Wie wird es maschinell geprüft und gebaut?“*

---

## 2. Discipline Layer (Karpathy-Prinzipien)

Vor jeder Code-Änderung, unabhängig von ihrer Größe:

1. **Think Before Coding**: Erst das Problem und den Ist-Zustand im Dateisystem tatsächlich verifizieren, dann erst schreiben. Nicht raten, spekulieren oder halluzinieren.
2. **Simplicity First**: Die einfachste Lösung, die das Problem tatsächlich löst — keine spekulative Konfigurierbarkeit, keine Abstraktionen auf Vorrat.
3. **Surgical Changes**: Nur anfassen, was für die konkrete Aufgabe strikt erforderlich ist. Angrenzenden Code nicht ungefragt umbauen.
4. **Goal-Driven Execution**: Jede Änderung muss auf das ursprünglich formulierte Ziel rückführbar sein.

---

## 3. Economy Layer (Ponytail-Entscheidungsleiter)

Bevor eigener Code geschrieben wird, diese sechs Fragen der Reihe nach durchgehen — bei der ersten mit „Ja“ stoppen und diesen Weg wählen:

1. Brauche ich das überhaupt? (YAGNI)
2. Existiert es schon (im Repository, in `tools/`, in `website/js/`)?
3. Kann die Standardbibliothek es (Node core, native Web-APIs)?
4. Kann die Plattform es (Browser-native Lösung statt JS)?
5. Gibt es bereits eine erlaubte Dependency, die es abdeckt?
6. Kann es einfacher sein als die erste Idee?

Erst wenn alle Fragen mit „Nein“ beantwortet sind: eigene Logik schreiben.

---

## 4. Kanonischer 5-Schritt-Workflow

Für jede nicht-triviale Änderung am Repository:

1. **Discover / Inspect**: Was existiert bereits? (`repository.yaml`, `docs/30-meta/tooling-overview.md` prüfen, echten Code öffnen).
2. **Think / Research**: Bei technischer Unsicherheit systematisch recherchieren (siehe [[#5. Recherche: Quellenpyramide & Fragetyp-Routing]]). Context7 ist bei Web-API-Unsicherheit laut `AGENTS.md` §4 verbindlich.
3. **Validate / Plan**: Vorgehen präzise festlegen, bevor Code geschrieben wird (`plan`-Operation).
4. **Execute**: Änderung minimal und chirurgisch umsetzen (für `website/` gilt zwingend die [[#6. Feature-Implementierung in website/ (HTML → CSS → JS)]]) nach dem **2-Stufen-Interventionsmodell**:
   - **Stufe 1: Surgical Fast-Track (Autonome Sofort-Korrektur):**
     Triviale Mängel und eindeutige Bugs ohne Nachfrage sofort im Code umsetzen:
     * Ersetzen physischer CSS-Properties durch logische (`margin-top` $\rightarrow$ `margin-block-start`, `left/right` $\rightarrow$ `inset-inline`).
     * Entfernen toter CSS-Klassen, ungenutzter Selektoren oder alter Vendor-Präfixe.
     * Ersetzen von Legacy-JS-Aufrufen (`Date` $\rightarrow$ `Temporal`, `caretRangeFromPoint` $\rightarrow$ `caretPositionFromPoint`).
     * Ersetzen von JS-Scroll/Resize-Loops durch `field-sizing: content`.
     * Schließen von Memory-Leaks (`AbortController`, Event-Listener Cleanup).
     * Triviales Entwirren von Import-Zyklen durch Verschieben reiner Konstanten nach L0/L1.
   - **Stufe 2: Review-Track (Architektur- & Modell-Entscheidungen):**
     Sobald ein Befund das Datenmodell berührt, Layout-Geometrien nach DIN 5008 verschiebt oder mehrere valide Lösungswege mit Trade-offs existieren, **stoppen** und dem Nutzer strikt in folgendem Schema vorlegen:
     1. **Befund:** Konkrete Datei, Zeile, Problemursache.
     2. **Option A (Best Practice / W3C-Standard):** Die modernste, normgerechteste Lösung.
     3. **Option B (Minimalistisch / KISS):** Die kleinste, risikoärmste Änderung mit dem geringsten Diff.
     4. **Konsequenzen & Trade-offs:** Was bedeutet Option A vs. B für Performance, DOM-Größe und Wartbarkeit?
5. **Verify & Report**:
   - Quality Gates ausführen: Fitness Gate (`node tools/build_db.js -q`), Unit-Tests (`npm test`) und Antipattern-Prüfung (`npm run check:antipatterns`).
   - Verbindlicher Tätigkeitsbericht nach dem projektweiten 5-Punkte-Vertrag (HANDOFF.md §6 / AGENTS.md §7a):
     1. Angefasste Dateien & Pfade (vollständige Pfadliste, Status `git mv`, `git rm`, `edit`)
     2. Gefundene Probleme & Konflikte (oder Bestätigung: keine Konflikte)
     3. Vollzugsnachweis & Testmetriken (Unit-Tests bestanden/gesamt, Adress-Korpus 80 Fälle, Antipatterns 36/36)
     4. Fitness-Score (Soll: 100.0% clean via `tools/build_db.js -q`)
     5. Commit-Hash & Push-Bestätigung (SHA + Remote-Sync)
   - **Verbot von Nutzer-Aufforderungen:** Der CLI-Agent führt alle Schritte autonom aus und gibt niemals manuelle Shell-Befehle oder Snippets zum Kopieren an den Nutzer aus.

---

## 5. Recherche: Quellenpyramide & Fragetyp-Routing

### Fragetyp-Routing
Die Art der Frage bestimmt, bei welcher Pyramiden-Tier direkt eingestiegen wird. Tier 0 (Project Truth) wird immer zuerst konsultiert:

| Fragetyp (Beispiel) | Einstieg bei Tier | Begründung |
|---|---|---|
| *„Gibt es dazu schon eine Entscheidung/Regel im Repo?“* | **0** | Project Truth — immer zuerst im Repo prüfen |
| *„Ist X Teil der Web-Plattform-Spezifikation?“* | **1** | Normative Frage: WHATWG, W3C oder TC39 antworten autoritativ |
| *„Unterstützt Chromium X ab Version 150+?“* | **2** | Kompatibilitätsfrage: Chrome Status, MDN, caniuse.com |
| *„Wie benutze ich API Y konkret?“* | **3** | Context7 für versionsgenaue Dokumentation |
| *„Was ist gängige Praxis/Architektur für Z?“* | **4** | Praxis- und Erfahrungswissen |

### Forschungs-Quellenpyramide
Reihenfolge nach Verbindlichkeit (höchste Autorität zuerst):

| Tier | Ebene | Quellen & Autorität |
|:---:|---|---|
| **0** | **Project Truth** | Dieses Repository selbst — `docs/00-foundation/Immutable-Law-Catalog.md`, `AGENTS.md`, `repository.yaml` |
| **1** | **Normative Standards** | WHATWG, W3C, TC39 |
| **2** | **Kompatibilität** | Baseline, Chrome Platform Status, MDN (Projekt-Baseline: Chrome 150+) |
| **3** | **Technische Doku** | Context7 |
| **4** | **Praxis & Experten** | web.dev, CSS-Tricks, Smashing Magazine |
| **5** | **Allgemeines Web** | Niemals allein als Quelle ausreichend, nur zur ersten Orientierung |

> **Tier 0 sticht immer:** Wenn das Projekt eine feste Regel definiert (z. B. Law A50: `Temporal` statt `Date`, Law W4: 100 % OKLCH), schlägt diese Regel jede externe Empfehlung.

### Evidence-Level bei Recherche-Ergebnissen
Wird eine Behauptung über Web-Standards oder Browser-Verhalten dokumentiert (z. B. im `DECISION-LOG.md`), wird sie mit ihrer Tier-Nummer belegt (`evidence_tier`, `source`, `confidence` gemäß `docs/30-meta/tooling-overview.md`).

---

## 6. Feature-Implementierung in website/ (HTML → CSS → JS)

Für alle Änderungen in `website/` (Markup, Styling, Interaktion) gilt:
👉 **`JavaScript = Krücke`** — deklarative Plattform-Features schlagen imperativen Code (Law A51, A54).

### Schritt 0 — Feature-Verfügbarkeit prüfen (vor HTML/CSS/JS)
Vor jeder Implementierungsentscheidung prüfen, ob das Feature in Chrome 150+ nativ verfügbar ist:

```bash
node tools/check-feature.js "<feature-name>"
# Beispiele:
# node tools/check-feature.js ":has"
# node tools/check-feature.js "CSS Anchor Positioning"
# node tools/check-feature.js "field-sizing"
```

### Die 7-Stufen-Entscheidungsleiter
Der Reihe nach prüfen, bei der ersten Stufe stoppen, die das Problem löst:

0. **Brauchen wir das Feature überhaupt?** Steht es in einer Spec/ADR, oder ist es eine unausgesprochene Annahme? (Goal-Driven Execution).
1. **Existiert es schon im Repo?** `website/js/`, `website/css/` prüfen, bevor neu gebaut wird.
2. **Geht es mit reinem HTML?** Native Elemente und Attribute prüfen (`<dialog>`, `<details>`, `popover`, `required`, `pattern`, native Formularvalidierung).
3. **Geht es mit modernem CSS ohne JS?** `:has()`, `@container`, `@starting-style`, Popover-Styling, CSS Grid/Flexbox, `light-dark()`.
4. **Reicht bestehendes Vanilla-JS im Repo?** Bestehende Funktion in `website/js/*` erweitern statt neue Module anzulegen.
5. **Neues, minimales Vanilla-JS?** Kleinstmögliche Lösung, zero abstractions (Surgical Changes, Simplicity First).
6. **Seltene, explizit erlaubte Ausnahme:** Externe Verbindungen nur nach der A38-Allowlist (`Immutable-Law-Catalog.md`), z. B. Adress-Autocomplete.

### Was ist KEIN Verstoß gegen diese Leiter:
- Bestehende, erlaubte Schnittstellen (z. B. Adress-Cache) zu nutzen.
- JavaScript für Zustand und Logik, die HTML/CSS grundsätzlich nicht abbilden können (z. B. Undo/Redo, Autosave, Gzip-Streaming).
- Bestehenden Vanilla-Code sauber zu refaktorisieren.

---

## 7. Plan -> Execute -> Verify als harte Grenze

Operationen der Phase `plan` dürfen niemals im selben Schritt ausführen. Nach jedem `execute` folgt ein `verify`-Schritt:
1. `npm run check --silent` (Biome Linter & Formatierung)
2. `npm test` (183 Unit-Tests + 80 Adress-Korpus-Fälle)
3. `node tools/build_db.js -q` (100.0% Fitness Score)
4. `npm run check:antipatterns` (36 Architekturregeln erfüllt)
