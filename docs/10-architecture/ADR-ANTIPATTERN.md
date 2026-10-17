---
id: adr-antipattern
title: 'ADR-ANTIPATTERN: aufgelöst in den Immutable Law Catalog'
type: adr
status: superseded
created: '2026-06-26'
updated: '2026-10-17'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/superseded
  - type/adr
doc_links:
  - Immutable-Law-Catalog
  - DECISION-LOG
code_links: []
error_patterns:
  - antipattern
  - verboten
  - forbidden
supersedes: []
depends_on: []
---

# ADR-ANTIPATTERN — aufgelöst am 2026-10-02

> [!warning] Dieses Dokument führt keine Normen mehr
> Es war eine **zweite Verbotsliste** neben dem [[Immutable-Law-Catalog]] — mit eigener
> Nummerierung (`Abschnitt 0–18`) und eigener Pflege. Genau das verbietet PART III des
> Catalogs („Single Source, keine 15 Kopien"). Die Verbote gelten unverändert weiter,
> sie stehen jetzt **nur noch** im Catalog.
>
> Diese Datei bleibt als **Umschlüsselungstabelle** bestehen, weil der append-only
> [[DECISION-LOG]] und `docs/90-archive/` auf sie verweisen. Nicht erweitern.

## Abschnitt → Gesetz

| alt | Thema | neu im Catalog |
| :--- | :--- | :--- |
| Abs. 0 | `setHTMLUnsafe()` statt Sanitizer | **H11** |
| Abs. 1 | Frameworks & Build-Tools | **A51** (vorher nur indirekt über T1) |
| Abs. 2 | Externe CDNs, Google Fonts | A38, A41 |
| Abs. 3 | IndexedDB / OPFS / File System Access | S1, A34–A36 |
| Abs. 4 | `document.execCommand` | **A52** |
| Abs. 5 | Unkontrollierte Viewport-Scrollbalken | A43 |
| Abs. 6 | Legacy-Datums-APIs | TM1, A48 |
| Abs. 7 | Farbkette OKLCH → … → Named | C1, A16–A20 |
| Abs. 8 | CSS-Präprozessoren, CSS-in-JS | A21, A22 |
| Abs. 9 | Icon-CDNs, Icon-Fonts | A39, A40 |
| Abs. 10 | Lodash, Produkt-Transpiler | **A53** |
| Abs. 11 | JS-Animationsbibliotheken | **A54** |
| Abs. 12 | Inline-CSS für Layout/Farbe | A25 |
| Abs. 13 | JS-Text-Fitting, Layout-Polling | A49 |
| Abs. 14 | JS-Formatierungs-Interzeptoren | **A55** |
| Abs. 15 | Toast Pointer-Drag, `z-index` | **A56** |
| Abs. 16 | Radio-Segmented für binäre Toggles | **A57** |
| Abs. 17 | Radio-Gruppen für Theme-Wahl | **A58** |
| Abs. 18 | `Temporal.Now` ohne IANA-Zone | A50 |

Fett = Verbot hatte vorher **keine** Catalog-ID und existierte nur hier.

Zusätzlich aus [[GEMINI]] und [[CLAUDE]] in den Catalog überführt: **A59** (Papier ist
theme-unabhängig), **A60** (kein JS-Klassen-Toggle für UI-Zustand), **A61** (schreibendes
`innerHTML`), **A62** (`aria-pressed` statt `.active`) sowie die Druck-Gegenpflicht in A46.

## Abgelehnte Roadmap-Konzepte (Dokumentation nach Konsolidierung 2026-10-17)

Im Rahmen der Bereinigung von `research/roadmap/` wurden folgende Ansätze nach fachlicher und architektonischer Prüfung verworfen:

| Ansatz | Betroffene Entwürfe | Begründung & geltende Norm |
| :--- | :--- | :--- |
| **Lokale LLM/AI-Integration (`window.ai` / Gemini Nano)** | `AI_ADDON_INTEGRATION_GUIDE.md`, `ai_assistant_addon.js`, `EXPERIMENTAL_AI_ADDON_SPEC.md` | **Verworfen nach A1 (Zero-Dependency) und B2 (Offline-First).** Experimentelle Chrome-Canary-APIs erzeugen Vendor-Lock-in und widersprechen der Baseline Chrome 150+. Formelle Geschäftsbriefe und DIN-5008-Layout erfordern deterministische Regeln statt unberechenbarer Text-Generierung. |
| **Vornamen-Heuristikdatenbank (400+ Namen)** | `ANREDE_ENGINE_AND_GENDER_SPEC.md`, `smart_salutation_engine.js` | **Verworfen nach A3 (KISS) und B5 (Keine fehleranfälligen Heuristiken).** Hoher Pflegeaufwand, Fehlerraten bei geschlechtsneutralen Namen und unzeitgemäße Annahmen. Das Produkt setzt stattdessen auf neutrale Standard-Fallbacks und manuelle Korrektur im Contenteditable. |
| **Veraltete Browser-Feature-Snapshots** | `BROWSER_AUDIT_EVALUATION.md`, `dinbrief_browser_feature_audit_1788514251378.json` | **Verworfen wegen überholter Annahmen** (z. B. fehlerhafte Annahme `field-sizing` für contenteditable; siehe A49/B5). Das funktionierende Diagnose-Werkzeug wurde als `tools/browser-audit.html` isoliert. |

## Verknüpfungen

* [[Immutable-Law-Catalog]] — alle gültigen Normen
* [[DECISION-LOG]] — Beschluss und Begründung
