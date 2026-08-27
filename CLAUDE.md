---
id: claude-context
title: CLAUDE.md — KI-Kontext für Claude & Claude Code
type: ai-context
status: active
created: '2026-08-07'
updated: '2026-08-07'
tags:
- din-briefneo
- meta
- ai-context
- claude
doc_links:
- AGENTS
- DIN-BriefNEO_memory_konsolidiert
- constitution
- ADR-ANTIPATTERN
- Immutable-Law-Catalog
code_links: []
---

# CLAUDE.md — DIN-BriefNEO Projekt-Kontext

> Automatisch gelesen von Claude/Gemini beim Session-Start.  
> Stand: 2026-08-07 | Projekt-Version: IMR 4.8.0 | Fitness: 100% (Audit 2026-07-21)

---

## 🎯 Was dieses Projekt ist

**DIN-BriefNEO** ist ein browserbasierter Geschäftsbriefeditor nach **DIN 5008:2020-03**.  
Solo-Entwickler: Mo (@grapefruit89). Standard: "Aviation Grade Platinum".

**Ausführung:** Doppelklick auf `website/index.html` — kein Server, kein Build nötig.  
**GitHub:** https://github.com/grapefruit89/DIN-BriefNEO

---

## ⛔ ABSOLUTE VERBOTE — NIEMALS BRECHEN

```
1. new Date()               → Temporal.Now.plainDateISO() oder Temporal.PlainDate
2. HEX/RGB/HSL Farben       → Nur oklch() — immer
3. CDN-Links                → Zero-Dependency, alles lokal
4. npm/Bundler/Build-Tools  → Vanilla HTML/CSS/JS only, file:/// lauffähig
5. Frameworks               → Kein React, Vue, Tailwind, jQuery, etc.
6. Inline-Styles (gestalterisch) → CSS Custom Properties + @layer
7. localStorage überschreiben ohne StorageManager → StorageManager.saveSettings()
8. .brain/-Dokumente überschreiben → Neue Datei mit Versionssuffix (INCIDENT-002)
```

---

## 📂 Ordnerstruktur & Wichtigkeit

### `website/` — ⭐⭐⭐ KERN (Produktionscode)
```
website/index.html              # Haupt-App — Einstiegspunkt
website/css/
  layout.css                   # DIN-Geometrie, Form A/B via :has(), @scope, Anchor Positioning
  variables.css                # CSS Custom Properties, @property, interpolate-size
  floating.css                 # Toast, Format-Toolbar, @starting-style discrete transitions
website/js/                    # Flat — Domain in Zehnerstelle kodiert
  01-draft-manager.js          # 0x=core: Entwurfsverwaltung
  02-settings-manager.js       # 0x=core: Einstellungen
  03-ui-protections.js         # 0x=core: UI-Schutz
  31-format-toolbar.js         # 3x=ui: Format-Toolbar
  32-toast.js                  # 3x=ui: Toast-System
  33-postvermerk.js            # 3x=ui: Postvermerk
  41-salutation-engine.js      # 4x=features: Anrede-Logik
  42-signature.js              # 4x=features: Unterschrift
  43-geoapify.js               # 4x=features: Adress-Autocomplete
  44-sender-sync.js            # 4x=features: Absender-Synchronisation
  47-date-format.js            # 4x=features: Datumsformatierung
  48-text-fit.js               # 4x=features: Text-Fit Engine
  51-constants.js              # 5x=utils: Projektweite Konstanten
  52-storage.js                # 5x=utils: StorageManager
  53-metadata.js               # 5x=utils: Metadaten-Handling
  54-dev-tools.js              # 5x=utils: Dev-Panel Utilities
  main.js                      # Entry Point (lädt alle Module)
```

### `docs/` — ⭐⭐⭐ KERN (Governance & Spezifikation)
```
docs/00-foundation/            # Verfassungsebene — niemals löschen
  constitution.md              # Projekt-Verfassung
  Immutable-Law-Catalog.md     # Unabänderliche Gesetze
  longevity-guidelines.md      # 5 Säulen der Langlebigkeit
  spec.md                      # DIN 5008 Spezifikation

docs/10-architecture/          # Architektur-Entscheidungen — kritisch
  IMR-Registry.md              # ⭐⭐⭐ Single Source of Truth: alle 45 Tags
  IMR-Toast-Registry.md        # Toast-System Tags
  Architecture-Compliance-Matrix.md
  OmniTraceability.md          # Traceability-Matrix
  Function-Traceability.md
  ADR/                         # 10 thematische ADRs
    ADR-HTML.md                # HTML-Entscheidungen
    ADR-CSS.md                 # CSS-Entscheidungen (Anchor, View Transitions, @scope...)
    ADR-JS.md                  # JS-Entscheidungen (Temporal, StorageManager...)
    ADR-API.md                 # API-Entscheidungen (Geoapify, Photon)
    ADR-ANTIPATTERN.md         # ⭐⭐⭐ Verbotsregister — vor jeder Änderung lesen!
    ADR-FEATURE.md             # Feature-Entscheidungen
    ADR-DATA-PERSISTENCE.md    # LocalStorage-Sovereignty
    ADR-OMNITRACEABILITY.md    # Traceability-Prinzipien
    ADR-BETREFF.md             # Betreff-Feld spezifisch
    ADR-Toast-Architecture.md  # Toast v4 Architektur
    Archive/ADR-MIGRATION.md   # Historisch — migrierte Entscheidungen
    Support/ADR-TEMPLATE.md    # Template für neue ADRs
    Support/Code-Referenzen.md # Code-Referenz-Index
  ADR-005-Sender-Synchronization.md  # Spezifisch Absender-Sync

docs/20-implementation/        # Implementierungsdetails
  Salutation-Engine.md         # Anrede-Logik (Auto-Detection)
  glossary.md                  # Projektbegriffe
  testing-guide.md             # Test-Anleitung
  Guides/
    chrome-modern-css.md       # Modern CSS Reference (Anchor, :has, @scope...)
    din-5008-precise-layout-lessons.md  # DIN 5008 Layout-Learnings
    geoapify-autocomplete.md   # Adress-Autocomplete (Geoapify + Photon)
    no-scroll-techniques.md    # Zero-Scroll-Policy Techniken
    toast-system.md            # Toast v4 Implementation Guide
  implementation/
    sqlite-vec.md              # SQLite Vector Search (für LLM-Wissensbasis)

docs/30-meta/                  # Projektgeschichte & Status
  CHANGELOG.md                 # ⭐⭐ Versionshistorie (aktuell: v15.0.0)
  DECISION-LOG.md              # Chronologisches Entscheidungslog
  Feature-Matrix.md            # ⭐⭐ Projektstatus: 76% fertig (Stand 2026-04-01)
  FEATURE-INVENTORY.md         # Feature-Inventar
  ROADMAP.md                   # Zukunfts-Ideen (unverbindlich)
  Architecture-Evolution.md    # Architektur-Entwicklung
  DOCUMENTATION-MAP.md         # Dokumentations-Karte
  DEV-INFO.md                  # Developer-Info, Feature-Detection-Matrix
  web-standards-tracking.md    # Chrome-Feature-Tracking
  QUELLEN-UND-LERNGESCHICHTE.md  # Lerngeschichte
  OBSIDIAN-SETUP-GUIDE.md      # ⭐ Obsidian-Kompatibilitäts-Guide (2026-08-07)
  _Template_Obsidian.md        # Obsidian Frontmatter-Template

docs/00-foundation/ (zusätzlich)
  HYBRID-SPEC-DRIVEN-WORKFLOW.md  # SDD-Workflow (Leitplanken)

docs/20-implementation/ (zusätzlich)
  README-DB.md                 # SQLite FTS5 Wissensbasis

docs/30-meta/ (zusätzlich)
  tooling-overview.md          # Build-Skripte & Wiki-Bundler Template
```

### `tools/` — ⭐⭐ WICHTIG (Build & Validierung)
```
build_db.js / build_db.py      # Generiert SQLite-Wissensbasis aus Markdown
wiki_bundler.py                # Bündelt Docs für LLM-Konsum
verify_compliance.py           # Fitness-Check (Metadata/Coherence/Conformance/Features)
verify_compliance_gen3.py      # Gen3 Compliance-Checker
add_wikilinks.py               # ⭐ Obsidian Wikilink-Generator (dry-run / --apply)
create_context.js              # Context-Bundle Generierung
log_session.js                 # Session-Logging
inject_yaml.js                 # YAML-Frontmatter Injektion
migrate_frontmatter.py         # Frontmatter-Migration
migrate_and_scrub*.py          # Daten-Bereinigung
packer.js                      # Packer-Tool
reconciliation.js              # Reconciliation-Tool
build_canvas.js                # Obsidian-Canvas Generator
antipatterns/                  # Anti-Pattern-Registry (JSON)
  base.json                    # Basis-Antipatterns
  project.json                 # Projektspezifische Antipatterns
  web.json                     # Web-Antipatterns
antipatterns.json              # Kombinierte Antipattern-Registry
boilerplate.config.json        # Boilerplate-Konfiguration
```

### `build/` — ⭐ GENERIERT (kann neu erzeugt werden)
```
din-brief-offline.html         # Offline-Bundle (generiert)
DIN-Brief_docs.db              # SQLite-Wissensbasis (generiert via build_db)
Context-Pack-Main.md           # Gebündelter Context für LLMs (generiert)
index.json                     # Such-Index (generiert)
memdb.db                       # Memory-DB (generiert)
```

### Stamm-Dateien (`aktueller_arbeitsordner/`)
```
CLAUDE.md                      # Diese Datei — Claude/AI Session-Kontext
AGENTS.md                      # KI-Verhaltensvertrag (root-Ebene, für Gemini CLI)
DIN-BriefNEO_memory_konsolidiert.md  # ⭐ Konsolidierter Projekt-Memory (2026-08-07)
PROJECT.md                     # Text-Fit Meilenstein-Tracking
README.md                      # Projekt-Übersicht
Anleitung.md                   # Benutzer-Anleitung
jsconfig.json                  # JS-Konfiguration
.gitignore                     # Git-Ignorier-Liste
start.ps1                      # ⭐ Fitness-Check + Build (Pflicht vor/nach Änderungen)
start.bat                      # Windows-Starter-Wrapper
serve.ps1                      # Dev-Server (optional)
audit_report.md                # CSS-First Audit (2026-07-21, Fitness 100%)
architecture_opportunities.md  # Architektur-Chancen (Recherche-Artefakt, archivierbar)
audit_extra_js_reduction.md    # JS-Reduktions-Audit (Archiv-Kandidat)
poc-declarative-controls.*     # POC: Deklarative Controls (Archiv-Kandidat)
poc-postvermerk-toast.*        # POC: Postvermerk Toast (Archiv-Kandidat)
poc-has-state-toggles.*        # POC: :has() State Toggles (Archiv-Kandidat)
poc-attr.html                  # POC: attr() (Archiv-Kandidat)
```

---

## 🏗️ Architektur-Kurzreferenz

### IMR v4.8.0 — 45 atomare Tags in 6 Zonen
| Zone | Container | Tags | Verhalten |
|---|---|---|---|
| Absender | `<din-absender>` | 8 | Single-Line, ellipsis |
| Anschriftfeld | `<din-anschriftfeld>` | 8 | Fix 45mm Höhe |
| Infoblock | `<din-infoblock>` | 8 | Single-Line |
| Briefkern | `<din-kern>` | 6 | `<din-text>` multi-line |
| Fußzeile | `<din-fuss>` | 12 | 4-spaltig |
| System | — | 3 | Guides, Overlay |

### Form A/B-Switching (CSS-Only)
```css
/* Form B = Default */
:root { --absender-y: calc(45/297*100cqh); … }
/* Form A = Override */
body:has(#btn-form-a:checked) { --absender-y: calc(27/297*100cqh); … }
```

### Datum (PFLICHT)
```javascript
// ✅ Richtig:
const today = Temporal.Now.plainDateISO();
// ❌ VERBOTEN:
const today = new Date(); // Hard Bug!
```

### Farben (PFLICHT)
```css
/* ✅ Richtig: */
color: oklch(0.5 0.15 240);
/* ❌ VERBOTEN: */
color: #336699; /* Hard Bug! */
```

---

## 📊 Projektstatus (Stand: 2026-08-07)

- **Fitness Score:** 100% (Metadata / Coherence / Conformance / Features — Audit 2026-07-21)
- **Feature-Completion:** 76% (26 von 34 Features — Stand 2026-04-01, veraltet — neu messen!)
- **Aktiver Sprint:** Sprint 2 (Q3 2026)
- **Alle W3C-Modernisierungen** produktiv: CSS Anchor Positioning, View Transitions, @starting-style, @property, RCS OKLCH, @scope, Temporal API
- **Obsidian-Graph:** Alle Docs mit YAML-Frontmatter (Schema V6) + Wikilinks (2026-08-07)

## 🔧 Offene Punkte (Stand: 2026-08-07)

### Offen
- POC-Dateien im Stamm: `poc-declarative-controls.*`, `poc-postvermerk-toast.*`, `poc-has-state-toggles.*`, `poc-attr.html` — archivieren oder löschen
- Feature-Matrix neu messen (aktueller Stand >> 76%)
- Profil-Management: bauen oder streichen? (Produktentscheidung offen, siehe [[ADR-PROFILE-MANAGEMENT]])
- History Stack Limit korrigieren: Code nutzt tatsächlich 50 (`#undoStack` in `01-draft-manager.js`), nicht 20 oder 60 — Doku-Referenzen auf 20/60 sind falsch

### Verifiziert (2026-08-08, Memory-Audit)
- ✅ **Salutation Engine SPEC-002:** teilweise abgedeckt. Titel-Scan, Auto-Gender-Erkennung, 3-stufiger Formality-Switch und Grußformel-Generator sind in `41-salutation-engine.js` implementiert. **Nicht implementiert:** Ghost-Text-Pattern (`data-salutation`/`data-greeting` + CSS `:empty::before`) — Code schreibt Werte direkt per `textContent`; DIN-Fehler-Punktuation-Validator (Komma/Punkt nach Grußformel) fehlt komplett. `Salutation-Engine.md` beschreibt zudem eine veraltete Zieldatei-Struktur (`salutation.js`/`logic.js`/`engine.js`) statt der echten `41-salutation-engine.js`.
- ✅ **IBAN Ghost-Text:** existiert nicht — weder das Sicherheitsproblem noch das Feature selbst sind im Produktivcode vorhanden (siehe [[ADR-PROFILE-MANAGEMENT]]).
- ✅ **CSS Custom Properties:** `--c-danger` und `--c-success` sind in `variables.css` definiert. `--c-text-muted` existiert nirgends (weder Definition noch Verwendung) — kein aktiver Bug, nur eine veraltete Doku-Erwähnung.
- ✅ **History Stack Limit:** Code verwendet `50` (nicht 20 oder 60) — siehe oben unter "Offen", da die Doku-Werte selbst noch zu korrigieren sind.

### Erledigt (2026-08-07)
- ✅ DB-Duplikate bereinigt (`DIN-Brief_docs.db`, `memdb.db` nur noch in `build/`)
- ✅ `boilerplate.config.json` → `tools/` verschoben
- ✅ mediNix-Fremddateien aus `docs/` entfernt
- ✅ JS-Struktur abgeflacht (Dezimalrahmen: 0x/3x/4x/5x)
- ✅ `.venv/` gelöscht (33K Dateien)
- ✅ Alle Docs mit Schema V6 Frontmatter versehen
- ✅ Wikilinks automatisch ergänzt (`add_wikilinks.py`)
- ✅ AGENTS.md Pfadfehler korrigiert (`docs/Meta/...` → `docs/00-foundation/Immutable-Law-Catalog.md`)
- ✅ Obsidian-Kompatibilität hergestellt (Graph-ready)

---

## 🤖 Multi-Agent-Rollen
- **Claude:** Recherche, Architektur, Prompting, Dokumentation
- **NotebookLM (Mission Control v4.0):** Source-Analyse, CLI-Output-Verifikation
- **Gemini CLI:** Code-Ausführung, Implementation

**Fitness-Check:** `powershell -ExecutionPolicy Bypass -File .\start.ps1`
