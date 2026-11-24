---
status: active
type: index
tags: [din-briefneo, map, aider-map, task-matrix, navigation]
summary: "Kanonische LLM-Map, Verzeichnis-Inventar und Task-to-File-Matrix für DIN-BriefNEO."
---

# DIN-BriefNEO – LLM-Map & Navigationsmatrix

> 🧭 **HINWEIS FÜR AGENTEN:**
> Lies vor jeder Aufgabe zuerst [`AGENTS.md`](AGENTS.md).
> Nutze diese Matrix, um ohne Suchbefehle direkt das richtige Modul anzusteuern.

---

## 1. Verzeichnis-Inventar

| Verzeichnis | Zweck & Inhalt |
| :--- | :--- |
| [`website/`](website/) | Produktive Vanilla Web-App: HTML, CSS, JS-Module, `website/fonts/` (WOFF2) |
| [`docs/`](docs/) | Doku gespiegelt: `docs/css/`, `docs/js/`, `docs/data/`, `docs/norm/`, `docs/meta/` |
| [`tools/`](tools/) | CLI-Werkzeuge: Server (`start.sh`, `dev.sh`), Gates (`build_db.js`), Runner |
| `fonts/` | Rohschriften (`.ttf`) und Typografie-Pipeline (`fonts/subset_fonts.py`). **Nicht versioniert** (Lizenz) — Zeichensatz und Aufbau: [`docs/fonts/ADR-TYPOGRAPHY.md`](docs/fonts/ADR-TYPOGRAPHY.md) |
| [`test/`](test/) | Test-Suite: Unit-Tests, Korpus-Gate (76/80), Chrome-Runner ([`test/all.js`](test/all.js)) |
| [`batch/`](batch/) | Batch-Verarbeitung, Kontrakte und Kaskaden-Skripte |

---

## 2. Task-to-File-Matrix (1-Zeilen-Disziplin)

| Aufgabe / Thema | Zuerst lesen | Fokus / Testfilter |
| :--- | :--- | :--- |
| **Paste, Caret, Zeilenlimit, contenteditable** | `website/js/document.js`, `website/css/sheet-common.css` | `--filter=DraftManager` |
| **Adress-Autocomplete, PLZ, Großkunden** | `website/js/address.js`, `website/js/address-data.js` | `--filter="PLZ\|Address"` |
| **Zwischenablage-Parsing** | `website/js/clipboard-parser.js` | `--filter=Clipboard` |
| **Persistenz, Export/Import, Undo** | `website/js/persistence.js`, `website/js/draft-manager.js` | `--filter="DraftManager\|51-storage"` |
| **Form A/B, Mehrseiten, Umbruch** | `website/css/sheet.css`, `website/js/multipage-controller.js` | `--filter="Layout\|Scrollbars"` |
| **Anrede, Grußformel, Stil** | `website/js/salutation.js` | `--filter=Salutation` |
| **Aktueller Branch-Stand** | [`docs/meta/BRANCH-anrede-dropdown.md`](docs/meta/BRANCH-anrede-dropdown.md) | siehe dort |
| **Review der Branch-Änderungen** | [`docs/meta/REVIEW-anrede-dropdown.md`](docs/meta/REVIEW-anrede-dropdown.md) | siehe dort |
| **Formatierung (Telefon, Datum, IBAN, Geld)** | `website/js/format.js` | `--filter=format` |
| **Unterschrift, Stempel** | `website/js/signature.js`, `website/css/sheet-common.css` | `--filter=Signature` |
| **Agenten, WebMCP, MCP-Bridge** | `website/js/webmcp.js`, `tools/mcp-live.mjs`, `docs/js/AGENTEN-WEBMCP.md` | `--filter="dinBriefAgent\|WebMCP"` |
| **Schriften & Subsetting** | `website/js/font-feature.js`, `fonts/subset_fonts.py` | `--filter=FontFeature` |
| **Seitenleiste, Dialoge, Theme** | `website/index.html`, `website/css/sidebar.css`, `website/js/settings.js` | `--filter=SettingsManager` |
| **Boot, FOUC, Reihenfolge** | `website/js/boot.js`, `website/js/boot-state.js`, `website/js/main.js` | `--filter="Zero Scrollbars"` |
| **Druck- & Layout-Messungen** | `tools/mess.js`, `tools/print-messung.mjs` | `node tools/print-messung.mjs` |
| **Testbrief-Generator & Figuren** | `website/addons/testbrief/testbrief.js`, `figuren.json` | `node tools/testbrief-messung.mjs` |
| **Fitness-Score & SSoT-Gate** | `tools/build_db.js`, `tools/reconciliation.js` | `node tools/build_db.js` |

---

## 3. Live-Fakten & Invarianten (Single Source of Truth)

| Schlüssel | Wert |
| :--- | :--- |
| **Höchste Autorität** | [`docs/norm/Immutable-Law-Catalog.md`](docs/norm/Immutable-Law-Catalog.md) |
| **Vollständiger Wegweiser** | [`docs/meta/AUFGABEN-WEGWEISER.md`](docs/meta/AUFGABEN-WEGWEISER.md) |
| **Begriff & Konzept je Baustein** | [`docs/meta/SEMANTIC-ANCHORS.md`](docs/meta/SEMANTIC-ANCHORS.md) |
| **Lokaler Dev-Server / CDP** | Port `8088` (`./tools/start.sh`) · Chromium DevTools Port `9222` |
| **Budget-Gates** | `AGENTS.md` ≤ 70 Z / 500 W · `map.md` ≤ 100 Z / 700 W / 5.500 B |
| **Geschützter Mülleimer** | `.trash/` (Invariante von `build_db.js`, niemals löschen) |
