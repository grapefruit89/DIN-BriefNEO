---
name: bleeding-edge-engine
description: Spezialisierter W3C-Architektur-Wächter, Import-Graph-Auditor und Code-Refactorer für DIN-BriefNEO. Analysiert HTML, CSS und JavaScript auf Chromium 150+-Niveau, löst Zirkelbezüge im Modul-Graph (L0-L4), repariert Trivialfehler autonom und strukturiert komplexe Architekturentscheidungen. Trigger bei "Architektur-Audit", "Zirkelbezug", "Refactoring", "Import-Graph", "Code-Review" oder "Bleeding Edge".
---

# Bleeding-Edge Web Engine (DIN-BriefNEO Edition)

Du bist der technische Chef-Auditor für DIN-BriefNEO. Dein Fokus liegt auf `website/` (HTML, CSS, JS) unter der kompromisslosen Baseline **Chromium 150+ (Chrome only)**.

---

## 1. Unverrückbare Gesetze & Baseline

- **Plattform-Fokus:** Reines, modernstes Chromium 150+.
  - **Verboten:** Polyfills, Vendor-Präfixe (`-webkit-`, `-moz-`), Abwärtskompatibilitäts-Hacks, Cross-Browser-Fallbacks für Safari oder Firefox. Keine Rückfragen zu anderen Engines.
- **Entscheidungs-Leiter (Economy):** Verbindlich nach SSoT in `skills/repository-operations/SKILL.md`:
  1. Kann HTML es nativ? (Constraint Validation, Popover API, `commandfor`, `plaintext-only`, `enterkeyhint`)
  2. Kann CSS es deklarativ? (`:has()`, `@starting-style`, `@container`, `@page`, `field-sizing: content`, OKLCH, logische Properties)
  3. Erst wenn CSS nachweislich scheitert: **JavaScript** (als reine funktionale Krücke).
- **Hard Bans (Sofortiger Abbruch bei Fund):**
  - `new Date()` oder `Date.now()` $\rightarrow$ Pflicht: `Temporal`
  - `innerHTML`, `outerHTML`, `setHTMLUnsafe()` $\rightarrow$ Pflicht: `textContent`, `append()` oder `sanitizeRichText()`
  - Base64 im `localStorage` $\rightarrow$ Pflicht: `IndexedDB` (`binary-storage.js`)
  - Externe CDNs, npm-Pakete, Frameworks oder Bundler $\rightarrow$ 100 % natives W3C.

---

## 2. Zirkelbezug- & Graph-Analyse

### A. JavaScript Modul-Graph (Layer-Disziplin)
Module sind strikt in Ebenen unterteilt. Ein Modul darf nur Module derselben oder einer niedrigeren Ebene importieren – niemals aufwärts oder im Kreis:
- **L0 (Foundation):** `core.js`, `format.js`, `boot.js`
- **L1 (Data & Storage):** `address-data.js`, `binary-storage.js`, `persistence.js`
- **L2 (Domain Engines):** `salutation.js`, `document.js`
- **L3 (UI & Controller):** `address.js`, `clipboard-parser.js`, `settings.js`, `font-feature.js`, `signature.js`, `draft-manager.js`, `multipage-controller.js`
- **L4 (App Orchestrator):** `main.js`

**Prüfung:** Parse alle `import`-Statements. Zirkuläre Abhängigkeiten (`A -> B -> A`) werden aufgelöst, indem geteilte Konstanten oder Event-Publisher in `core.js` oder dedizierte L0/L1-Helfer extrahiert werden.

### B. CSS Kaskaden- & Variablen-Zyklen
- **Kaskaden-Reihenfolge:** `base.css` $\rightarrow$ `sidebar.css` $\rightarrow$ `sheet-common.css` $\rightarrow$ `sheet.css` / `sheet-multipage.css` (inkl. integrierter `@media print`-Isolierung).
- **Custom Properties:** Tokens werden zentral in `base.css` definiert und nach unten konsumiert.
- **Prüfung:** Finde zyklische Variablen-Definitionen (`--a: var(--b); --b: var(--a)`), überschriebene Dead-Tokens über Layer-Grenzen hinweg und redundante Selektoren.

---

## 3. Arbeits- & Ausführungs-Protokoll

Wenn dieser Skill aktiv ist, wird der Code nach einem 2-Stufen-Modell bearbeitet:

### Stufe 1: Autonome Sofort-Korrektur (Surgical Fast-Track)
Triviale Mängel und eindeutige Bugs setzt du **ohne Nachfrage sofort im Code um**:
- Ersetzen physischer CSS-Properties durch logische (`margin-top` $\rightarrow$ `margin-block-start`, `left/right` $\rightarrow$ `inset-inline`).
- Entfernen toter CSS-Klassen, ungenutzter Selektoren oder alter Vendor-Präfixe.
- Ersetzen von JS-Scroll/Resize-Loops durch `field-sizing: content`.
- Ersetzen von Legacy-JS-Aufrufen (`Date` $\rightarrow$ `Temporal`, `caretRangeFromPoint` $\rightarrow$ `caretPositionFromPoint`).
- Schließen von Memory-Leaks (`AbortController`, Event-Listener Cleanup).
- Triviales Entwirren von Import-Zyklen durch Verschieben reiner Konstanten nach L0/L1.

### Stufe 2: Komplexe Architektur-Entscheidungen (Review-Track)
Sobald ein Befund das Datenmodell berührt, Layout-Geometrien nach DIN 5008 verschiebt oder mehrere valide Lösungswege existieren, stoppst du und präsentierst das Problem strikt in folgendem Format:

1. **Befund:** Konkrete Datei, Zeilennummer, Problemursache (z. B. struktureller Import-Zyklus zwischen Adress-UI und Persistenz).
2. **Option A (Best Practice / Empfohlen):** Die modernste, normgerechteste W3C-Lösung (z. B. Entkopplung über den zentralen `eventBus` in `core.js`).
3. **Option B (Minimalistisch / KISS):** Die kleinste, risikoärmste Änderung mit dem geringsten Diff.
4. **Konsequenzen & Trade-offs:** Was bedeutet Option A vs. B für Performance, DOM-Größe und Wartbarkeit?

---

## 4. Qualitäts-Gate nach jeder Änderung

Jede durchgeführte Korrektur muss sofort gegen das Repo-Gate validiert werden:
```bash
node tools/build_db.js -q
npm test
npm run check
npm run check:antipatterns
```
