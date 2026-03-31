---
# === BASISINFORMATIONEN ===
title: "Logische Gruppen — Feature-Matrix (Platinum Master)"
subtitle: "Project Progress, Roadmap & Sprint Planning"
description: "Definiert den aktuellen Funktionsumfang von DIN-BriefNEO und die Roadmap für kommende Platinum-Sessionen"
version: "4.7.0"
version_date: 2026-03-31
status: active

# === DOKUMENT-TYP ===
type: roadmap
category: project-management
audience:
  - all
  - management
  - developers
  - stakeholders

# === TAGS ===
tags:
  - din-briefneo
  - din-briefneo/roadmap
  - din-briefneo/features
  - din-briefneo/progress
  - status/active
  - type/roadmap
  - project/sprint

# === ALIASES ===
aliases:
  - "05_Feature_Matrix"
  - "Feature Matrix"
  - "Roadmap"
  - "Project Status"
  - "Platinum Roadmap"
  - "Feature Progress"

# === DATAVIEW Felder ===
total_features: 29
completed_features: 21
open_features: 8
completion_percentage: 72
sprint_current: "Sprint 1 (Q2 2026)"
sprint_next: "Sprint 2 (Q3 2026)"
next_milestone: "Q2 2026"
next_milestone_date: 2026-06-30

# === GRUPPEN-STATUS ===
groups:
  identity: 100
  content: 100
  geometry: 80
  infrastructure: 100
  future: 0

# === VERWANDTE DOKUMENTE ===
related:
  - "01_Architecture_Compliance"
  - "02_IMR_Registry"
  - "03_CSS_Reference"
  - "06_Salutation_Engine"

# === ZEITSTEMPEL ===
date_created: 2025-12-01
date_updated: 2026-03-31
date_next_review: 2026-04-30

# === AUTOR ===
author: "@din-briefneo/core-team"
maintainer: "@grapefruit89"

# === OBSIDIAN ===
cssclasses:
  - table-stripes
  - wide-table
  - progress-bars

# === GITHUB PAGES ===
permalink: /docs/feature-matrix/
layout: default
---

# Logische Gruppen — Feature-Matrix (Platinum Master)

> [!IMPORTANT]
> **Nächster Sprint:** Seitenumbrüche (#58) und DIN-Overlay (#57) sind priorisiert. Das @din-briefneo/core-team überwacht die Compliance.

> [!TIP]
> Alle Issues sind mit GitHub-Labels versehen. Filtere nach `group:geometry` für Geometrie-spezifische Aufgaben.

Diese Matrix definiert den aktuellen Funktionsumfang von DIN-BriefNEO und die Roadmap für die kommenden Platinum-Sessionen.

---

## 🎯 Platinum Sprint Q2 2026 (Current Focus)

- [x] Variable-First Form A/B Switching (#55)
- [x] Refactor Fold Marks to 4mm Standard (#54)
- [x] CSS Capability Matrix & Platinum Glossary
- [ ] Finalize Address-Autocomplete integration (#42)
- [ ] Integrate DIN-Referenz-SVG Overlay (#57)
- [ ] Implement CMA-Sensor for Page Breaks (#58)

---

## 📌 Quick Links

| Bereich                    | Link                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| 🗺️ **Roadmap**             | [GitHub Projects](https://github.com/din-briefneo/din-briefneo/projects)                            |
| 🐛 **Bug melden**          | [New Issue](https://github.com/din-briefneo/din-briefneo/issues/new?template=bug_report.yml)        |
| ✨ **Feature vorschlagen** | [New Feature](https://github.com/din-briefneo/din-briefneo/issues/new?template=feature_request.yml) |
| 📊 **Milestones**          | [Milestones](https://github.com/din-briefneo/din-briefneo/milestones)                               |

---

## 🚦 Projekt-Status

![Progress](https://img.shields.io/badge/Overall_Progress-72%25-blue)
![Completed](https://img.shields.io/badge/Completed-21_of_29-green)
![Open](https://img.shields.io/badge/Open-8-red)
![Platinum](https://img.shields.io/badge/Platinum_Session-2026-gold)

---

## Gruppe 1: Identität & Adress-Intelligenz

| Funktion                | Beschreibung                                    | Status                                                  | Upgrade-Potenzial                           | 🔗 Issue / PR                                                 |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| **Adress-Autocomplete** | API-Anbindung für schnelle Empfänger-Eingabe    | ✅ Aktiv | Geoapify Premium – aktuell Photon (OSM)     | [#42](https://github.com/din-briefneo/din-briefneo/issues/42) |
| **Adress-Validierung**  | Prüfung der 6-Zeilen-Regel nach DIN 5008        | ✅ Aktiv | Länder-spezifische PLZ-Validierung          | [#43](https://github.com/din-briefneo/din-briefneo/issues/43) |
| **Branding-Atome**      | Native Unterstützung für Logo und Wasserzeichen | ✅ Aktiv | Base64-Optimierung – localStorage-Effizienz | [#44](https://github.com/din-briefneo/din-briefneo/issues/44) |
| **Empfänger-Parser**    | Automatisches Erkennen von Geschlecht/Titeln    | ✅ Aktiv | Firmen-Erkennung – "GmbH/AG" Erkennung      | [#45](https://github.com/din-briefneo/din-briefneo/issues/45) |
| **Profil-Management**   | Granulare Speicherung von Kontakt- & Bankdaten  | ✅ Aktiv | Mehrere Profile – Privat/Büro Wechsel       | [#46](https://github.com/din-briefneo/din-briefneo/issues/46) |
| **Rücksendezeile**      | Automatische Generierung der Kleinstzeile       | ✅ Aktiv | Internationales Format – c/o Anpassungen    | [#47](https://github.com/din-briefneo/din-briefneo/issues/47) |

---

## Gruppe 2: Inhalts-Engine & WYSIWYG

| Funktion                | Beschreibung                                 | Status                                                  | Upgrade-Potenzial                        | 🔗 Issue / PR                                                 |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Ghost-Mirror**        | Echtzeit-Markdown-Vorschau ohne Verschiebung | ✅ Aktiv | Syntax-Highlighting für Markdown-Marker  | [#48](https://github.com/din-briefneo/din-briefneo/issues/48) |
| **Native Sanitization** | XSS-Schutz via Browser-native Sanitizer API  | ✅ Aktiv | CSP-Header – Trusted Types Integration   | [#49](https://github.com/din-briefneo/din-briefneo/issues/49) |
| **Plaintext-Only**      | Striktes Plaintext-Handling in allen Feldern | ✅ Aktiv | Paste-Filter mit Whitelist für `<br>`    | [#50](https://github.com/din-briefneo/din-briefneo/issues/50) |
| **Salutation Engine**   | Automatische Generierung der DIN-Anrede      | ✅ Aktiv | Firmen-Anrede – "Damen und Herren" Logik | [#51](https://github.com/din-briefneo/din-briefneo/issues/51) |
| **Smart Deadlines**     | Kontextsensitive Termin-Vorschläge           | ✅ Aktiv | Feiertags-API – Regionale Prüfung        | [#52](https://github.com/din-briefneo/din-briefneo/issues/52) |
| **Styling Buttons**     | Toolbar für Fett, Unterstrichen, Zitate      | ✅ Aktiv | Keyboard Shortcuts – Strg+B/I/U          | [#53](https://github.com/din-briefneo/din-briefneo/issues/53) |

---

## Gruppe 3: Geometrie & Compliance

| Funktion               | Beschreibung                                   | Status                                                  | Upgrade-Potenzial                     | 🔗 Issue / PR                                                 |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| **Faltmarken**         | Präzise Positionierung nach DIN 5008           | ✅ Aktiv | Toggle für Hilfslinien in der Sidebar | [#54](https://github.com/din-briefneo/din-briefneo/issues/54) |
| **Form A/B Switch**    | Mechanische Umschaltung der Kopfhöhe via CSS   | ✅ Aktiv | Persistenz via LocalStorage           | [#55](https://github.com/din-briefneo/din-briefneo/issues/55) |
| **IMR 4.0 Atome**      | Alle 42 DIN-Felder als eigenständige Objekte   | ✅ Aktiv | IMR-Catalog Generator für Agenten     | [#56](https://github.com/din-briefneo/din-briefneo/issues/56) |
| **Layout-Guides**      | Visuelle Hilfslinien zur Ausrichtungskontrolle | ✅ Aktiv | DIN-Referenz-SVG Overlay              | [#57](https://github.com/din-briefneo/din-briefneo/issues/57) |
| **Seitenumbrüche**     | Native Unterstützung für mehrseitige Briefe    | ⏳ Offen | Duplex-Erkennung – Leerseiten-Logik   | [#58](https://github.com/din-briefneo/din-briefneo/issues/58) |

---

## Gruppe 4: Infrastruktur & Daten-IO

| Funktion            | Beschreibung                               | Status                                                  | Upgrade-Potenzial                          | 🔗 Issue / PR                                                 |
| ------------------- | ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| **Flight Recorder** | Telemetrie und Notfall-Wiederherstellung   | ✅ Aktiv | Log-Export als JSON für Bug-Reports        | [#59](https://github.com/din-briefneo/din-briefneo/issues/59) |
| **JSON Data-IO**    | Import/Export des kompletten Briefzustands | ✅ Aktiv | Schema-Validator gegen IMR 4.0             | [#60](https://github.com/din-briefneo/din-briefneo/issues/60) |
| **Print CSS**       | Vektorscharfer PDF-Export via Print-Styles | ✅ Aktiv | PDF-Metadaten – Titel/Autor im PDF         | [#61](https://github.com/din-briefneo/din-briefneo/issues/61) |
| **PWA Standalone**  | Offline-Fähigkeit und Installation als App | ✅ Aktiv | Update-Benachrichtigung via Service Worker | [#62](https://github.com/din-briefneo/din-briefneo/issues/62) |
| **SSoT Constants**  | Zentrale Geometrie-Definition              | ✅ Aktiv | Typed CSS Properties (`@property`)         | [#63](https://github.com/din-briefneo/din-briefneo/issues/63) |

---

## 🔗 Dokumenten-Navigation

| Dokument | Zweck |
|----------|-------|
| [[01_Architecture_Compliance]] | Technologie-Leitplanken |
| [[02_IMR_Registry]] | Alle 42+ DIN-Tags |
| [[03_CSS_Reference]] | CSS-Features Referenz |
| [[05_Feature_Matrix]] | Projekt-Fortschritt |
| [[06_Salutation_Engine]] | Logik-Dokumentation |

**Gesamtversion:** 4.7 | **Letzte Sync:** 2026-03-31

---

## 🔗 Verwandte Dokumente (Dataview)

```dataview
TABLE 
  version AS "Version",
  status AS "Status",
  date_updated AS "Aktualisiert"
FROM ""
WHERE contains(related, this.file.name)
SORT version DESC
```


---

## Gruppe 5: Zukunfts-Features (Roadmap 2026/2027)

| Funktion            | Beschreibung                               | Status     | Technologie                   | 🔗 Issue / PR                                                 | Priorität                                                |
| ------------------- | ------------------------------------------ | ---------- | ----------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| **Brief-Archiv**    | IndexedDB für hunderte gespeicherte Briefe | 🔴 Geplant | IndexedDB + Volltextsuche     | [#64](https://github.com/din-briefneo/din-briefneo/issues/64) | ![High](https://img.shields.io/badge/🔴-Hoch-red)        |
| **Serienbrief**     | CSV-Import → Batch-Generierung             | 🔴 Geplant | CSV-Parser + Batch-Logic      | [#65](https://github.com/din-briefneo/din-briefneo/issues/65) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Poststempel**     | Internetmarke via Deutsche Post API        | 🔴 Geplant | Deutsche Post Direkt API      | [#66](https://github.com/din-briefneo/din-briefneo/issues/66) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Fristen-Rechner** | Automatische Berechnung nach BGB           | 🟡 Analyse | Temporal API + Feiertags-API  | [#67](https://github.com/din-briefneo/din-briefneo/issues/67) | ![Medium](https://img.shields.io/badge/🟡-Mittel-yellow) |
| **Sprachsteuerung** | Diktat via Web Speech API                  | 🔴 Geplant | Web Speech API                | [#68](https://github.com/din-briefneo/din-briefneo/issues/68) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |
| **vCard QR-Code**   | Kontaktdaten als QR im Briefkopf           | 🔴 Geplant | QR-Code Generator             | [#69](https://github.com/din-briefneo/din-briefneo/issues/69) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |
| **Lokale KI**       | Grammatik- und Stilprüfung offline         | 🔴 Geplant | Gemini Nano (Chrome Built-in) | [#70](https://github.com/din-briefneo/din-briefneo/issues/70) | ![Low](https://img.shields.io/badge/🟢-Niedrig-green)    |

---

## 📊 Platinum Fortschritts-Matrix

| Gruppe                             | Gesamt | ✅ Erledigt | ⏳ Offen | Fortschritt                           | Status                                                             |
| ---------------------------------- | ------ | ----------- | -------- | ------------------------------------- | ------------------------------------------------------------------ |
| **Identität & Adress-Intelligenz** | 6      | 6           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Inhalts-Engine & WYSIWYG**       | 6      | 6           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Geometrie & Compliance**         | 5      | 4           | 1        | ![80%](https://progress-bar.dev/80)   | ![In Progress](https://img.shields.io/badge/In_Progress-⚡-yellow) |
| **Infrastruktur & Daten-IO**       | 5      | 5           | 0        | ![100%](https://progress-bar.dev/100) | ![Stable](https://img.shields.io/badge/Stable-✓-brightgreen)       |
| **Zukunfts-Features**              | 7      | 0           | 7        | ![0%](https://progress-bar.dev/0)     | ![Roadmap](https://img.shields.io/badge/Roadmap-📅-blue)           |
| **GESAMT**                         | **29** | **21**      | **8**    | ![72%](https://progress-bar.dev/72)   | —                                                                  |

---

## 🎯 Platinum Sprint: Nächste Ziele

### 🔴 Hochpriorität (Sprint 1)

| Feature                         | Beschreibung                                     | Issue                                                         | Expected |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------------------- | -------- |
| **DIN-Referenz-SVG Overlay**    | Visuelle DIN-Referenzlinien als Overlay          | [#57](https://github.com/din-briefneo/din-briefneo/issues/57) | Q2 2026  |
| **Seitenumbrüche & CMA-Sensor** | Native mehrseitige Briefe mit Overflow-Erkennung | [#58](https://github.com/din-briefneo/din-briefneo/issues/58) | Q2 2026  |

### 🟡 Mittelpriorität (Sprint 2)

| Feature                       | Beschreibung                             | Issue                                                         | Expected |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------- | -------- |
| **PDF-Metadaten Integration** | Titel, Autor, Datum im generierten PDF   | [#61](https://github.com/din-briefneo/din-briefneo/issues/61) | Q3 2026  |
| **Auto-Save Status-Anzeige**  | Visuelles Feedback bei Speichervorgängen | —                                                             | Q3 2026  |
| **Feiertags-API**             | Regionale Feiertagsprüfung für Deadlines | [#52](https://github.com/din-briefneo/din-briefneo/issues/52) | Q3 2026  |

---

## 📝 Release History

| Version  | Datum   | Gruppe     | Änderungen                                     |
| -------- | ------- | ---------- | ---------------------------------------------- |
| **v4.0** | 2025-12 | Alle       | Initiale Platinum-Master Release               |
| **v4.1** | 2026-01 | Gruppe 1-2 | Adress-Autocomplete & Ghost-Mirror finalisiert |
| **v4.2** | 2026-02 | Gruppe 3   | Form A/B Switch & Layout-Guides implementiert  |
| **v4.3** | 2026-03 | Gruppe 4   | PWA Standalone & JSON Data-IO stabilisiert     |
| **v4.4** | Q2 2026 | Gruppe 3   | Seitenumbrüche & DIN-Overlay (geplant)         |

---

## 🏷️ Tags & Labels für Issues

Folgende Labels werden in GitHub verwendet:

| Label                  | Bedeutung                      | Farbe     |
| ---------------------- | ------------------------------ | --------- |
| `group:identity`       | Identität & Adress-Intelligenz | `#1E88E5` |
| `group:content`        | Inhalts-Engine & WYSIWYG       | `#43A047` |
| `group:geometry`       | Geometrie & Compliance         | `#FB8C00` |
| `group:infrastructure` | Infrastruktur & Daten-IO       | `#8E24AA` |
| `group:future`         | Zukunfts-Features (Roadmap)    | `#757575` |
| `priority:high`        | 🔴 Hoch                        | `#D32F2F` |
| `priority:medium`      | 🟡 Mittel                      | `#FBC02D` |
| `priority:low`         | 🟢 Niedrig                     | `#388E3C` |
| `status:stable`        | ✅ Stabil und abgeschlossen    | `#2E7D32` |
| `status:in-progress`   | ⏳ In Arbeit                   | `#ED6C02` |
| `status:planned`       | 📅 Geplant                     | `#0288D1` |
| `status:analysis`      | 🔍 Analysephase                | `#7B1FA2` |

---

**Status:** ACTIVE  
**Version:** Platinum Master v4.7  
**Next Release:** Q2 2026 (v4.4)  
**Maintainer:** @din-briefneo/core-team
