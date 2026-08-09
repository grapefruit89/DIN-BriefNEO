---
id: memory-konsolidiert
title: 'DIN-BriefNEO — Konsolidiertes Projektgedächtnis'
type: reference
status: active
created: '2026-08-07'
updated: '2026-08-08'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/reference
doc_links:
  - CLAUDE
  - AGENTS
  - IMR-Registry
  - Feature-Matrix
  - CHANGELOG
  - constitution
  - ADR-ANTIPATTERN
code_links: []
error_patterns:
  - projektgedächtnis
  - konsolidiert
  - memory
  - onboarding
  - architekturstand
  - constraints
  - multi-agent workflow
supersedes: []
---

# DIN-BriefNEO — Konsolidiertes Projektgedächtnis

> Konsolidiert: 2026-08-07 | Quellen: claude.ai Memory + Obsidian `aktueller_arbeitsordner`  
> Ziel: Schnelles Onboarding neuer Sessions ohne Rückfragen  
> ⚠️ **Die claude.ai Memory war 2+ Monate veraltet. Dieser Stand basiert auf den Obsidian-Docs.**

---

## 1. Projektidentität & Constraints

**Projekt:** DIN-BriefNEO — browserbasierter Geschäftsbriefeditor nach DIN 5008:2020-03  
**Entwickler:** Mo (Solo-Entwickler)  
**Standard:** "Aviation Grade Platinum" + Brain-First / Spec-Driven Development (SDD)  
**Ziel:** Produktionsreifer, offline-fähiger Briefeditor, zero external dependencies

**Projektspeicherorte:**
- Primär: `C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\aktueller_arbeitsordner`
- GitHub: https://github.com/grapefruit89/DIN-BriefNEO (öffentlich)

**Das "Korsett" (harte Constraints — nie verhandeln):**

| Constraint | Regel |
|---|---|
| Framework | 100% Vanilla HTML/CSS/JS — kein React, Vue, Tailwind, CDN |
| Browser | Chrome 145–148+ exklusiv; Cross-Browser bewusst verschoben |
| Offline | Doppelklick-fähig via `file:///` |
| Persistenz | LocalStorage only — OPFS, Web Locks, Leader Election, IdleDetector **aufgegeben** |
| Datum | Temporal API only — `new Date()` ist ein **Hard Bug**, keine Stilfrage |
| Farben | OKLCH only — Hex/RGB/HSL **verboten** (seit v15.0.0 Doktrin) |
| Doctrine | No-Framework-Doctrine + Zero-Scroll-Policy |

---

## 2. Architekturstand (aktuell — Stand Obsidian 2026-07-21)

### Projektstruktur (`aktueller_arbeitsordner`)
```
docs/
  00-foundation/  constitution.md, Immutable-Law-Catalog.md, longevity-guidelines.md, spec.md
  10-architecture/ IMR-Registry.md, ADR/ (10 thematische ADRs), Architecture-Compliance-Matrix.md
  20-implementation/ Salutation-Engine.md, Guides/, glossary.md
  30-meta/        ROADMAP.md, CHANGELOG.md, DECISION-LOG.md, Feature-Matrix.md
  40-tooling/     README-DB.md (SQLite FTS5)
  90-policy/      HYBRID-SPEC-DRIVEN-WORKFLOW.md
website/
  js/00-core/     draft-manager.js, settings-manager.js
  js/20-features/ sender-sync.js
  js/30-utils/    constants.js, metadata.js, dev-tools.js
  css/            layout.css, floating.css, variables.css
  index.html
tools/            build_db.js/py, wiki_bundler.py, verify_compliance*.py
build/            din-brief-offline.html, DIN-Brief_docs.db, Context-Pack-Main.md
```

### IMR — Isomorphic Master Registry v4.8.0 ✅
- **45 atomare Tags** in 6 Zonen (nicht 11!)
- **Zonen:** `<din-absender>` (8 Tags) · `<din-anschriftfeld>` (8) · `<din-infoblock>` (8) · `<din-kern>` (6) · `<din-fuss>` (12) · Systemkomponenten (3)
- Alle Single-Line-Tags: `contenteditable="plaintext-only"` + Smart Single-Line (ellipsis + Focus-Edit)
- Multi-Line: `<din-text>` (Hauptinhalt), `<din-anlagen>` — beide vollständig editierbar
- Root-Element: `<din-a4>` (skaliert im Viewport via CSS-Transforms, druckt als exaktes DIN A4)
- **Strict Schema Gate** aktiv

### CSS-Architektur (v15.0.0 — 2026-05-27, alle Punkte produktiv)
- **Form A/B-Switching:** 100% CSS-First via `body:has(#btn-form-a:checked)` — kein JS für Layout ✅
- **CSS Anchor Positioning:** Adress-Dropdown an `#input-address-search` gekoppelt
- **CSS View Transitions API:** Layout-Wechsel (Form A/B) und Farbschema per `document.startViewTransition()`
- **CSS @starting-style + `transition-behavior: allow-discrete`:** Toast + Format-Toolbar
- **CSS @property:** `--guide-opacity` als `<number>` registriert, Hilfslinien-Fading
- **CSS Relative Color Syntax (OKLCH):** `--accent-glow`, `--accent-hover`, `--danger-hover`, `--guide-color`
- **CSS `interpolate-size: allow-keywords`:** API-Key-Container `height: 0 → auto`
- **CSS `@scope (din-a4)`:** Briefbogen-Stile isoliert von globalen Styles
- **Reaktives `:has()`:** Ambient Glow beim Fokus editierbarer Felder

### Geometry (CSS Custom Properties — Form B Default / Form A Override)
```css
:root { --absender-y: calc(45/297*100cqh); --empfaenger-y: calc(50/297*100cqh); --datum-y: calc(92/297*100cqh); … }
body:has(#btn-form-a:checked) { --absender-y: calc(27/297*100cqh); … }
```

### Temporal API (Datum) ✅ — PRODUKTIV seit v15.0.0
- `Temporal.Now.plainDateISO()` für Datum-Autobefüllung in DIN-konformem Format
- `new Date()` offiziell geächtet in `ADR-ANTIPATTERN.md` + `Immutable-Law-Catalog.md`

### Persistenz
- **LocalStorage-Sovereignty** — eine der 5 Longevity-Säulen (seit 2026-05-24)
- IndexedDB: aufgegeben (LocalStorage ist Doktrin, nicht Interim)

### ADR-Struktur (thematisch)
10 ADR-Dateien: `ADR-HTML`, `ADR-CSS`, `ADR-JS`, `ADR-API`, `ADR-ANTIPATTERN`, `ADR-FEATURE`, `ADR-DATA-PERSISTENCE`, `ADR-OMNITRACEABILITY`, `ADR-BETREFF`, `ADR-Toast-Architecture`

### 3D-Carousel (Multi-Page) — v4.8.0
- CSS-Variablen `--position` (aktive Seite) und `--i` (Seiten-Index) für 3D-Transformation
- Mehrseiten-Horizontal-Karussell: vermeidet vertikales Scrollen (Zero-Scroll-Policy)

### Audit (2026-07-21) ✅
**Evolutionary Fitness Score: 100%** (Metadata / Coherence / Conformance / Features — alle 100%)

---

## 3. Bugs & Offene Punkte

### Bereits aufgelöst (nicht mehr aktuell)
Diese Bugs aus der alten Memory existieren in der neuen Architektur nicht mehr:

| Alt-Bug | Status | Grund |
|---|---|---|
| `new Date()` 3× Verstoß | ✅ BEHOBEN | Temporal API seit v15.0.0 produktiv |
| `switchForm()` redundanter `setProperty` | ✅ OBSOLET | Form-Switching ist nun 100% CSS (`:has()`) |
| `html[data-layout]` lügendes Attribut | ✅ OBSOLET | `app-shell` class-Ansatz aufgegeben; Radio-Inputs + CSS |
| `<din-body>` contenteditable-Verstoß | ✅ OBSOLET | `<din-body>` existiert nicht mehr; ersetzt durch `<din-text>`, `<din-kern>` |
| IMR v1-Keys in DEFAULT_STATE | ✅ OBSOLET | Neue Tag-Struktur (45 Tags, 6 Zonen) |
| `lockdown.css` / `platinum-locked.css` Widerspruch | ✅ OBSOLET | CSS-Architektur komplett neu |
| IdleDetector Double-Deferral | ✅ OBSOLET | Beide aufgegeben |

### Offen / Zu verifizieren
- **`recipientType` Auto-Erkennung:** IMR v4.8.0 dokumentiert Auto-Detection via `_updateSalutation()` — Grundfunktion verifiziert (siehe unten), Vollständigkeit aller Edge-Cases weiterhin nicht durchgetestet
- **History Stack Limit korrigieren:** Doku nennt 20/60, Code nutzt tatsächlich `50` — Doku-Werte müssen noch angepasst werden (siehe CLAUDE.md "Offen")
- **Profil-Management:** bauen oder streichen? Produktentscheidung offen, siehe [[ADR-PROFILE-MANAGEMENT]]

### Verifiziert am 2026-08-08 (Memory-Audit, siehe DECISION-LOG)
- **IBAN Ghost-Text / Profil-Management:** ✅ verifiziert — existiert **nicht** im Produktivcode (`website/js/`, `index.html`). Nur eine Erwähnung in `poc-features.js` (Sandbox, nicht produktiv). `Feature-Matrix.md` war falsch ("✅ Aktiv"), wurde korrigiert. Siehe [[ADR-PROFILE-MANAGEMENT]].
- **Salutation Engine SPEC-002:** ✅ verifiziert — teilweise abgedeckt. Titel-Scan, Auto-Gender, Formality-Switch, Grußformel-Generator implementiert in `41-salutation-engine.js`. Fehlt: Ghost-Text-Pattern (Code setzt direkt `textContent`), DIN-Fehler-Punctuation-Validator, IBAN-Check. `Salutation-Engine.md` referenzierte zudem falsche Dateinamen (`salutation.js`/`logic.js`/`engine.js` statt `41-salutation-engine.js`) — korrigiert.
- **CSS Custom Properties:** ✅ verifiziert — `--c-danger`/`--c-success` existieren in `variables.css`. `--c-text-muted` existiert nirgends (weder definiert noch verwendet) — kein aktiver Bug, nur veraltete Erwähnung.
- **History Stack Limit:** ✅ verifiziert — Code (`01-draft-manager.js`, `#undoStack`) nutzt `50`, nicht 20 oder 60. Beide historischen Doku-Werte waren falsch.
- **claude.ai Projekt-Memory (das automatisch gepflegte `memory.md`):** ist weiterhin veraltet — listet SPEC-066, `din-body`-Verstoß, `data-layout`, OPFS-Worker-Bug, STORAGE_KEY-Mismatch und CSS.highlights-Dead-Code als offene Bugs. Alle sechs wurden im Code geprüft und existieren nicht mehr / sind bereits gelöst. Diese Datei hier bleibt die verlässlichere Quelle bis die claude.ai-Memory manuell aktualisiert wird.

---

## 4. Dead Code (TOMB-Register — Stand: alt, neu prüfen)

| ID | Eintrag | Ersatz |
|---|---|---|
| TOMB-B001 | `initCMABridge()` | `:root {}` ist CMA-Quelle (ADR-009) |
| TOMB-L001–L011 | Cemetery of Ideas (gebannte Technologien) | In `ADR-ANTIPATTERN.md` + `Immutable-Law-Catalog.md` |
| — | `execCommand` Toolbar-Bindings | native Alternative |
| — | `_safeSetHTML()` | entfernen |

---

## 5. Schlüsselprinzipien & Learnings

- **INCIDENT-002 → Immutable Versioning:** Jedes Dokument-Update erzeugt neue Datei mit inkrementiertem Versionssuffix — NIEMALS überschreiben.
- **AI-Lobotomie-Prävention:** `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` existieren explizit um Kontext über Sessions zu erhalten.
- **Cemetery of Ideas** ist ein First-Class-Artefakt — gebannte Technologien dokumentieren um Wiedereinführung zu verhindern.
- **`new Date()` = Hard Bug** — Temporal API ist nicht verhandelbar.
- **Context7 API-Key-Leak:** Ein API-Key in einer `.env` war in einem geteilten Export — Keys dürfen nie in Bundles oder URL-Parametern erscheinen.
- **NotebookLM-Outputs** müssen lang, technisch tief und direkt umsetzbar sein. v4.0 System-Prompt aktiv.

---

## 6. Multi-Agent-Workflow

| Agent | Rolle |
|---|---|
| **Claude** | Recherche & Prompt-Architekt; liest `CLAUDE.md` |
| **Gemini CLI** | Ausführungsagent für Code-Implementierung; liest `AGENTS.md` |
| **NotebookLM** (Mission Control v4.0) | Source-Analyse, CLI-Output-Verifikation |

**Handoff-Protokoll:** CLI Execution Override Blocks mit `CMD / RESEARCH / NEXT-STEP` Taxonomie  
**Fitness-Check:** `powershell -ExecutionPolicy Bypass -File .\start.ps1` → muss 100% ergeben

---

## 7. Tools & Ressourcen

| Tool | Verwendung / Hinweise |
|---|---|
| **Context7** | Standards-Recherche; verpflichtend bei Unsicherheit über Web-APIs; Queries mit "Chrome 147 148 status 2025 2026" |
| **Gemini CLI** | Extensions: `spec-kit-verify`, `spec-kit-cleanup`, `spec-kit-reconcile`, `spec-kit-status` |
| **Obsidian** | Dokumentenverwaltung für `docs/` |
| **SQLite FTS5** | Projekt-Wissensbasis (`build/DIN-Brief_docs.db`) für LLM-Konsum |
| **Desktop Commander MCP** | Windows-Filesystem-Tool; `rewrite` nur mit Vorsicht (post-INCIDENT-002) |

**Referenz-Repos (forked, in `din-5008-forked/`):**
- SVGs: `DIN_5008,_Form_A.svg` + `DIN_5008_Form_B.svg` für `<din-overlay>` Visual Audit
