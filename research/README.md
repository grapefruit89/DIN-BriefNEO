# DIN-Brief Neo: Modern Web Platform Migration Workspace (2025–2026)

> **Audience:** AI Coding Assistants (LLMs) & Software Engineers  
> **Target Application:** [DIN-Brief Neo](https://github.com/grapefruit89/DIN-BriefNEO) (German standard DIN 5008 letter composer)  
> **Status:** Analyzed, verified, and ready for progressive implementation.

---

## 1. Project Mission & Core Philosophy

This workspace contains research, architectural roadmaps, telemetry data, and ready-to-use snippets designed to modernize **DIN-Brief Neo**.

### Core Objectives:
1. **Dramatically Minimize JavaScript (~61% Code Elimination):**  
   Replace obsolete DOM-measuring loops, manual sanitization routines, input filters, and animation timers with native modern browser APIs.
2. **Eliminate Fragile CSS Hacks (~40% Cleanup):**  
   Replace arbitrary `calc()` font-leading offsets, negative margins, and `z-index` wars with standardized CSS 2025/2026 features (`text-box-trim`, `field-sizing`, `light-dark()`, and CSS Anchor Positioning).
3. **The "Zero-Scroll" Paper Mandate (CRITICAL):**  
   A physical DIN-A4 sheet (210 mm × 297 mm) **never scrolls**. Do not introduce scrollbars, scrollbar-padding, or overflow-scrolling on the paper. Use `overflow: clip` and `contain: strict`. If content is too long, either scale text or paginate to Page 2.
4. **Ultra-Fast Offline Address Intelligence (71 KB Brotli & 0.1ms Heuristics):**  
   Preload all 10,814 German postal codes and 2,258 major recipients (Großempfänger) in a tiny 71 KB Brotli payload, decompressing in under 1 ms. Enable progressive 2-digit prefix filtering, bidirectional city-to-PLZ reversibility, dynamic Bonn-bias deactivation (Target Lock), and instant clipboard impressum parsing without external API roundtrips.
5. **100% Private On-Device AI (Optional Addon):**  
   Integrate local Gemini Nano via Chrome Built-in AI (`ai.writer`, `ai.rewriter`, `ai.proofreader`) using a completely defensive, crash-proof, opt-in plugin architecture without cloud dependencies or API keys.

---

## 2. Struktur & Triage: Produktions-Zielzustand vs. Recherche-Material

> **Wichtigste Erkenntnis:** Der gesamte Ordner wiegt rund 16,8 MB – davon sind jedoch **über 16,7 MB reines Forschungsmaterial, Chrome-Rohdaten-Dumps und Testskripte**.  
> **Die tatsächlichen Produktions-Assets für DIN-Brief Neo wiegen zusammen unter 95 KB!**

### 2.1 Schnellübersicht: Was wird in das Projekt übernommen?

| Status / Kategorie | Pfad & Datei | Größe | Zweck & Einsatz im Zielzustand |
| :--- | :--- | :--- | :--- |
| 🟢 **PRODUKTION** | `roadmap/smart_salutation_engine.js` | 19 KB | **Drop-in Replacement** für `website/js/41-salutation-engine.js` (KISS 80/20 B2B, In-flight-Schutz, Dirty-Flags). |
| 🟢 **PRODUKTION** | `research_results/de_plz_ort.json.br` | 70.5 KB | **Asset für Website:** Alle 10.814 PLZs + 2.258 Großempfänger für 0,9ms Offline-Autofill im Adressfeld. |
| 🟢 **PRODUKTION** | `research_results/de_vornamen_gender.json.br` | 2.55 KB | **Asset für Website:** 951 häufigste deutsche Vornamen für Zero-Click-Geschlechtserkennung ohne Radiobuttons. |
| 🟢 **PIPELINE / CI/CD** | `research_scripts/github_action_update_plz.yml` | 1.6 KB | **GitHub Actions Cron-Workflow** für automatische quartalsweise Open-Data-Updates. |
| 🟢 **PIPELINE / BUILD** | `research_scripts/update_plz_pipeline.py` | 5.1 KB | **Build-Skript:** Lädt Rohdaten, fusioniert Großkunden, erzeugt die 70,5 KB Brotli-Payload. |
| 🟡 **OPTIONAL (ADDON)** | `roadmap/ai_assistant_addon.js` | 6.2 KB | **Opt-In Addon:** 100 % private Gemini Nano On-Device AI für `website/js/addons/`. |
| 🔵 **BLUEPRINTS (DOCS)** | `roadmap/*.md` (17 Spezifikationen) | ~200 KB | **Architektur-Vorgaben** für Entwickler/LLMs (DIN 5008 Normen, KISS 80/20, CSS Snippets, Zero-Scroll). |
| ⚪ **FORSCHUNG (ARCHIV)** | `research_results/chrome_features_*.json` | **14.3 MB** | **Labor-Rohdaten:** Google ChromeStatus API-Dumps (können archiviert/gelöscht werden, nicht für Produktion!). |
| ⚪ **FORSCHUNG (TESTS)** | `research_scripts/test_*.py`, `*.js` | ~150 KB | **Labortests:** Benchmarks, Provider-Latenzmessungen, Impressum-Stresstests (nur zur Verifikation). |

---

### 2.2 Dateibaum mit Kennzeichnung

```text
C:\Users\morit\Documents\dinbrief-temp\
├── README.md                           <-- Master-Dokumentation & Lese-Reihenfolge
│
├── 🟢 [PRODUKTION / ZIELZUSTAND] (< 95 KB Gesamt)
│   ├── roadmap/smart_salutation_engine.js      # Drop-in Ersatz für 41-salutation-engine.js (19 KB)
│   ├── research_results/de_plz_ort.json.br     # Offline Brotli PLZ- & Großkunden-Datenbank (70.5 KB)
│   ├── research_results/de_vornamen_gender.json.br # Offline Brotli Vornamen-Tabelle (2.55 KB)
│   ├── research_scripts/update_plz_pipeline.py # Build- & Kompressions-Pipeline für Wartung (5.1 KB)
│   ├── research_scripts/github_action_update_plz.yml # GitHub Actions Quartals-Workflow (1.6 KB)
│   └── roadmap/ai_assistant_addon.js           # (Optional) Lokales Gemini Nano Addon (6.2 KB)
│
├── 🔵 [ARCHITEKTUR-SPEZIFIKATIONEN & RICHTLINIEN] (~200 KB)
│   └── roadmap/
│       ├── LLM_MODERN_WEB_PLAYBOOK_2026.md     # Verbindliche KI-Direktiven (Moderne Web APIs)
│       ├── FUNCTION_MIGRATION_MATRIX.md        # Migrationsplan für 109 bestehende JS-Funktionen
│       ├── CSS_SNIPPETS_REFERENCE_2026.md      # Drop-in CSS 2026 Snippets (field-sizing, light-dark)
│       ├── ZERO_SCROLL_DIN_ARCHITECTURE.md     # Strikte Zero-Scroll Papier-Garantie
│       ├── KISS_SALUTATION_AND_EDITABLE_OVERRIDE_SPEC.md # KISS 80/20 & ContentEditable Dirty-Flags
│       ├── ANREDE_UND_GRUSSFORMEL_PAERCHEN_SPEC.md # DIN 5008 Pärchen & Interpunktionsregeln
│       ├── GROSSEMFAENGER_POST_UND_RECHTS_SPEC.md # OLG Frankfurt Urteil & DPAG Großkunden
│       ├── SMART_CLIPBOARD_IMPRESSUM_PARSER.md # Heuristischer 0,1ms Impressum-Parser
│       ├── BROTLI_AND_BIDIRECTIONAL_PLZ_SPEC.md # Brotli-Mechanik & Reversibilität
│       ├── ZERO_CLICK_UNIQUE_AUTOCOMPLETE_UX.md # Eindeutigkeits-Autofill ohne Klicks
│       └── ADAPTIVE_DROPDOWN_THRESHOLD_SPEC.md # 3-Zonen Threshold Modell (<= 5 Treffer)
│
└── ⚪ [RECHERCHE-MATERIAL & LABOR-ARTEFAKTE] (16,4 MB - Nicht für Produktion!)
    ├── research_results/
    │   ├── chrome_features_2026.json   # [7,83 MB] Google ChromeStatus API-Dump 2026 (Archiv)
    │   ├── chrome_features_2025.json   # [6,48 MB] Google ChromeStatus API-Dump 2025 (Archiv)
    │   ├── chrome_features_*_overview.txt # [600 KB] Extrahierte Feature-Listen
    │   ├── raw_user_batch_2.txt        # [60 KB] 60.000 Zeichen Impressum-Stresstest (WELT, SPIEGEL)
    │   ├── provider_benchmarks_*.json  # [4 KB] Live-Messungen (Geoapify, HERE, Photon)
    │   └── precision_test_results.json # [5 KB] Bonn/Beuel Adress-Präzisionstests
    └── research_scripts/
        ├── chrome_scraper*.py          # API-Crawler für chromestatus.com
        ├── js/css/html_extraction.py   # AST-Parser für das Alt-Projekt
        ├── benchmark_*.py              # Latenz- und Benchmark-Skripte
        └── test_*.py / test_*.js       # Verifikations- und Test-Runner
```

---

## 3. Core Discoveries & Implementation Milestones

### 3.1 Offline Brotli Dictionary (71.0 KB, 0.93ms Latency)
- **Problem:** External address APIs take 100ms–250ms per keystroke and fail when offline.
- **Solution:** `de_plz_ort.json.br` bundles all 10,814 German postal codes in just **71.0 KB**.
- **Performance:** Decompresses natively via modern browser streams in **0.93 ms**.
- **Bidirectionality:** Works in both directions (PLZ ➔ Ort and Ort ➔ PLZ).
- **Progressive Prefix Filtering:** Typing the first 2 digits (e.g. `53...`) narrows the list to Bonn/Rhein-Sieg in **0.15 ms**.
- **Dynamic Bias Deactivation (Target Lock):** Typing a non-local PLZ (e.g. `46359` Heiden) instantly deactivates the default Bonn bias for subsequent street lookups.

### 3.2 Großempfänger (2,258 Special Postal Codes & Zero-Maintenance Principle)
- **Legal Foundation (OLG Frankfurt, Az. 6 U 170/13):**  
  The court ruled that for major bulk mail recipients (Großempfänger), providing **PLZ and City alone is completely sufficient** even for formal statutory declarations (such as consumer revocation notices). Street and house number are legally and postally unnecessary.
- **DIN 5008 Compliance:** Street is omitted automatically. The letter is routed by the Deutsche Post directly into internal rolling containers via specialized delivery services (Hin+Weg).
- **Constitutional Bodies & Authorities:** 45 high-profile institutions were merged from Wikipedia into `de_grosskunden_plz.json` (German Chancellery `11012`, Bundestag `11011`, Federal Ministries `11013`–`11019`, Axel Springer `10888`, Arvato `33333`, Federal Court of Justice, etc.).
- **Zero-Maintenance Principle for Group PLZ & Towers:**  
  Office skyscrapers (The Squaire `60600`, Opernturm `60306`, Messeturm `60308`) and industrial parks (`65926`) house constantly changing commercial tenants.  
  *Architectural Mandate:* We **never** hardcode or maintain volatile tenant lists. For group PLZs, the system sets the building name as an optional address addition (`Zusatz`), omits the street, and leaves the company name field completely open as free text for user input.
- **Official Source:** Deutsche Post Direkt Datafactory (`dp-mtb-ge-zugaenge.pdf` / Category "GE").

### 3.3 Smart Impressum & Clipboard Parser (100% Offline, 0.1ms Heuristic)
- **The Problem:** Users copy messy raw text from German company imprint pages containing navigation menus, cookie notices, news feeds, hundreds of journalists, and court register lines (`Amtsgericht Hamburg HRB...`).
- **The Solution:** A deterministic, multi-pass regex scoring engine running in under 0.1 ms without external LLMs.
- **Stress-Test Results (60,098 Characters, 1,430 Lines):**  
  Tested against 6 massive real-world German corporate and public sites (WELT/Axel Springer, DER SPIEGEL, DIE ZEIT, Presseplus.de, BDZV, TU Dortmund):
  - **Success Rate:** 6 out of 6 (100% precision).
  - **Extracted Fields:** Pure DIN-5008-compliant recipient block (`Firma`, `Zusatz/Gebäude`, `Straße & Hausnummer`, `PLZ & Ort`).
  - **Filtered Waste:** Thousands of lines of editorial boards, breaking news, sports tickers, commercial registers, VAT IDs, and supervisory clauses completely discarded.

### 3.4 Smart Salutation Engine & Zero-Click Gender Detection (KISS & ContentEditable-First)
- **Radical KISS Simplicity (Keep It Simple, Stupid):**  
  Eliminates fragile NLP regexes trying to parse couples, rare noble titles, or edge cases. Complex cases (e.g. `Sehr geehrte Frau Müller, sehr geehrter Herr Müller,`) are solved by the user directly in 2 seconds on the paper.
- **ContentEditable-First & Dirty-Flag Architecture:**  
  The entire letter is direct-editable (`contenteditable="plaintext-only"`).
  - *User Lock (`dataset.dirty = "true"`):* Typing into `<din-anrede>` locks the field immediately. Automatic generators **never** overwrite manual user input.
  - *Auto-Reset Recovery:* Clearing the field (e.g. backspace) automatically removes the dirty flag and resumes automatic salutation generation.
- **Elimination of Radio-Button Dependency (2.55 KB Brotli):**  
  Manual gender toggle buttons (`Herr` / `Frau` / `Neutral`) are obsolete. Gender is resolved in 0.001 ms either via explicit typed prefixes (`herr ` / `frau `) or via an offline dictionary of 951 common German first names (`de_vornamen_gender.json.br`).
- **In-flight Prefix Protection:**  
  Typing `herr ` or `frau ` is recognized mid-typing via word boundaries (`^(herrn?|frau)\b\s*`). The engine sets `isIncomplete: true`, generating interim salutations (`Sehr geehrter Herr,` / `Hallo,`) and never corrupts into `Hallo herr,`.
- **DIN 5008:2020 Compliance for Academic Titles:**  
  DIN 5008 (Section 9.2) requires the title "Professor" to be **fully spelled out** in salutations (`Sehr geehrter Herr Professor Dr. Müller,`), while keeping abbreviations (`Prof. Dr.`) in the postal address block. Bachelor/Master titles are omitted from salutations.

### 3.5 Anrede- & Grußformel-Pärchen (DIN 5008, Knigge & 5 Tonalitäts-Klassen)
- **Die untrennbare Tonalitäts-Einheit:**  
  Aus den Fachquellen (Büro-Kaizen, ChannelPartner, TeachSam, IONOS) wurden **5 harmonische Pärchen-Klassen** destilliert:
  1. *Streng Förmlich / Juristisch:* `Sehr geehrte Damen und Herren,` ➔ `Mit freundlichen Grüßen` / `Hochachtungsvoll` (bei Kündigungen/Abmahnungen)
  2. *Klassisch Professionell (B2B):* `Sehr geehrte(r) Frau/Herr...` ➔ `Mit freundlichen Grüßen` / `Freundliche Grüße`
  3. *Kooperativ Modern (Laufender Kontakt):* `Guten Tag Frau/Herr...` ➔ `Viele Grüße` / `Beste Grüße` / `Herzliche Grüße`
  4. *Persönlich Geschäftlich (Wertschätzung per Sie):* `Liebe Frau / Lieber Herr...` ➔ `Herzliche Grüße` / `Herzlichst`
  5. *Informell / Privat (Du):* `Hallo [Vorname],` / `Liebe(r) [Vorname],` ➔ `Liebe Grüße` / `Beste Grüße` / `Alles Liebe`
- **Smart-Grüße (Zero-Click Ortsbezug):**  
  Das System nutzt bekannte Ortsdaten aus dem Adressblock für charmante ortsbezogene Grüße: `Beste Grüße nach [Empfänger-Ort]` oder `Viele Grüße aus [Absender-Ort]`.
- **DIN-5008-Interpunktion:**  
  Nach der Anrede steht zwingend ein Komma (Fließtext beginnt klein). Nach der Grußformel steht **streng kein Komma** (gefolgt von 3 Leerzeilen für die Unterschrift).
- **KISS-Bedienung:**  
  Sidebar behält das kompakte 3er-Segment (`Förmlich`, `Höflich`, `Locker`). Alternative Varianten des gewählten Stils können direkt per Klick am Dokument gewechselt werden.

---

## 4. Recommended AI Reading Order (Context Ingestion)

When tasked with implementing or refactoring code in DIN-Brief Neo, an AI agent **must review files in this exact sequence**:

1. **`roadmap/LLM_MODERN_WEB_PLAYBOOK_2026.md`**  
   *Essential.* Prevents the LLM from generating outdated 2018-era JavaScript (e.g. `scrollWidth`, `setTimeout` classes, manual font uploads, or regex input guards).
2. **`roadmap/FUNCTION_MIGRATION_MATRIX.md`**  
   Identifies the 46 JS functions slated for deletion or migration into CSS/HTML.
3. **`roadmap/ZERO_SCROLL_DIN_ARCHITECTURE.md`**  
   Enforces the non-negotiable physical paper boundary (`overflow: clip`).
4. **`roadmap/KISS_SALUTATION_AND_EDITABLE_OVERRIDE_SPEC.md`**  
   Defines the KISS philosophy and the ContentEditable dirty-flag override rules.
5. **`roadmap/ANREDE_UND_GRUSSFORMEL_PAERCHEN_SPEC.md`**  
   Details the 5 tonal pairing classes, DIN 5008 spacing, smart city greetings, and inline switching.
6. **`roadmap/ANREDE_ENGINE_AND_GENDER_SPEC.md`**  
   Details the zero-click salutation engine, prefix typing protection, and DIN 5008 title expansion.
7. **`roadmap/smart_salutation_engine.js`**  
   Drop-in modernized implementation replacing `website/js/41-salutation-engine.js`.
8. **`roadmap/GROSSEMFAENGER_POST_UND_RECHTS_SPEC.md`**  
   Defines the legal rulings, DPAG thresholds, and the zero-maintenance group PLZ architecture.
9. **`roadmap/SMART_CLIPBOARD_IMPRESSUM_PARSER.md`**  
   Contains the heuristic algorithm for instant DIN-5008 address extraction from copied web imprints.
10. **`roadmap/BROTLI_AND_BIDIRECTIONAL_PLZ_SPEC.md`**  
    Specifies the 71 KB offline dictionary and bidirectional autocomplete mechanics.
11. **`roadmap/CSS_SNIPPETS_REFERENCE_2026.md`**  
    Contains drop-in CSS code blocks for `field-sizing`, `text-box-trim`, `light-dark()`, and Anchor Positioning.
12. **`roadmap/BROWSER_AUDIT_EVALUATION.md`**  
    Proves which features are verified to be 100% active in the user's current browser.

---

## 5. Operational Guidelines for AI Assistants

1. **Do Not Re-invent the Wheel:**  
   Before writing custom JavaScript for UI behaviors, check if a native HTML5 or CSS attribute exists (`field-sizing`, `contenteditable="plaintext-only"`, `popover`, `commandfor`, `light-dark()`).
2. **Preserve DIN 5008 Conformity:**  
   Do not alter the physical dimensions:
   - Form A: Address field starts at Y=32mm, Fold mark 1 at 87mm, Fold mark 2 at 181mm.
   - Form B: Address field starts at Y=50mm, Fold mark 1 at 105mm, Fold mark 2 at 210mm.
   - Hole punch mark: Always centered at Y=148.5mm.
3. **Never Hardcode Volatile Tenant Lists:**  
   Adhere strictly to the Zero-Maintenance Principle. Only permanent constitutional bodies carry static names; shared towers and commercial parks must never maintain fragile tenant dropdowns.
4. **Keep the Core Lightweight:**  
   Any experimental features (such as Chrome Built-in AI) must remain decoupled in `website/js/addons/` and use graceful degradation.
5. **Always Verify Changes:**  
   After making modifications, run `powershell.exe -ExecutionPolicy Bypass -File "research_scripts/repo_tool_validate.ps1"` to execute repository fitness checks (`build_db.js`).
