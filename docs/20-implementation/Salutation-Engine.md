---
id: salutation-engine
title: 'Salutation & Logic Engine Matrix (IMR 4.0 Standard)'
type: reference
status: active
created: '2026-07-03'
updated: '2026-08-28'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/reference
doc_links:
  - ADR-JS
  - ADR-HTML
  - spec
code_links:
  - website/js/41-salutation-engine.js
error_patterns:
  - salutation engine
  - anrede
  - grussformel
  - gender detection
  - formality switch
  - imr 4.0
  - ghost text
  - iban validierung
  - temporal api
supersedes: []
depends_on: []
---

# Salutation & Logic Engine Matrix (IMR 4.0 Standard)

> [!NOTE] Implementierungsstatus (aktualisiert 2026-08-28)
> Diese Datei beschrieb ursprünglich eine Ziel-Architektur mit separaten Dateien `salutation.js`/`logic.js`/`engine.js`. Tatsächlich lebt die gesamte Logik in **`website/js/41-salutation-engine.js`** — die Tabelle unten unter "Engine Architecture (The Core Three)" ist historisch/aspirativ und wird nicht als eigene Dateistruktur umgesetzt.
>
> Umgesetzt: Titel-Scan (Greedy Regex), Auto-Gender-Erkennung, 3-stufiger Formality-Switch, Grußformel-Generator, **sowie seit 2026-08-28 die visuelle Ghost-Markierung generierter Vorschläge und der DIN-Punktuations-Validator** (Details unten).
>
> Bewusste Abweichung vom ursprünglich skizzierten `:empty::before`-Ansatz: `print.css` blendet `:empty::before`-Inhalte beim Drucken generell aus (Ghost-Placeholder sollen nicht mitgedruckt werden). Ein reiner CSS-Vorschlag über `:empty::before` hätte akzeptierte, nie manuell editierte Anreden/Grußformeln beim Drucken unsichtbar gemacht. Stattdessen schreibt die Engine den Vorschlag weiterhin als echten `textContent` (druckt also korrekt) und markiert ihn zusätzlich mit `data-generated="true"`, das per CSS optisch gedämpft wird (`--paper-ghost`, kursiv) und beim Drucken wieder neutralisiert wird (`color: inherit`, `font-style: normal`). Das Attribut wird beim ersten manuellen Edit entfernt (siehe `_wireManualEdits`).
>
> **Weiterhin nicht implementiert:** IBAN-Check (Modulo-97) — siehe [[ADR-PROFILE-MANAGEMENT]], eigenständige Produktentscheidung, nicht Teil dieses Feature-Schnitts.

> [!TIP]
> Für neue Anrede-Formate: Erweitere einfach die `SALUTATION.TITLES`-Liste in `41-salutation-engine.js` – die Engine priorisiert automatisch längere Titel.

Diese Matrix definiert die Architektur der Geschäftslogik für DIN-BriefNEO.  
Sie folgt dem **Flat & Pure Architecture [ADR-017]** Prinzip: Klare Trennung zwischen Datenverarbeitung (Engine) und Darstellung (UI-Bridge).

---

## 🧠 Engine Architecture (The Core Three)

| Modul | Rolle | Fokus-Technologie | Strategischer Vorteil |
|-------|-------|-------------------|----------------------|
| **`engine.js`** | Der Verwalter | `Proxy` State + `localStorage` / `OPFS` | Reaktive SSoT mit Zero-Setup-Persistenz |
| **`logic.js`** | Der Handwerker | `Temporal` API + `Sanitizer` API | Robuste Date-Arithmetik und sicheres Markdown |
| **`salutation.js`** | Der Etikette-Experte | Pattern Matching & Sorting | Intelligente Anreden mit automatischer Titel-Priorisierung |

---

## 📋 Logik- & Validierungs-Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Markdown** | Zero-Width Ghosting Pattern | `logic.js` | Erhält Markdown-Marker für Editierbarkeit ohne Layout-Shift |
| **Zeit/Datum** | `Temporal.Now.plainDateISO()` | `logic.js` | Eliminiert Legacy `Date()`-Bugs bei Zeitzonen |
| **Adress-Check** | 6-Zeilen-Validierung | `logic.js` | DIN 5008: max. 6 Zeilen im Anschriftfeld |
| **IBAN-Check** | Modulo-97 (`BigInt`) | — | ❌ Nicht implementiert, siehe [[ADR-PROFILE-MANAGEMENT]] |
| **Rücksendung** | Interpunktion-Generator | `logic.js` | DIN 5008: Einzeilige Rücksendezeile mit Mittelpunkten |

---

## 🎩 Salutation & Etiquette Matrix

| Feature | Implementierung (**TARGET**) | Modul | DIN-Bezug / Regel |
|---------|------------------------------|-------|-------------------|
| **Titel-Scan** | Greedy Regex Matching (priorisiert Länge) | `salutation.js` | Erkennt "Prof. Dr." vor "Dr." – robust gegen Mehrfach-Titel |
| **Auto-Erkennung** | Personentyp-Erkennung (Herr/Frau/Ms/Mr) | `salutation.js` | Automatische Auswahl der passenden Anrede-Logik |
| **Anrede-Stil** | 3‑stufiger Formality‑Switch | `salutation.js` | Formal / Modern (Guten Tag) / Locker (Hallo) |
| **Anrede-Einfügung** | ✅ `textContent`-Set (nur wenn Feld leer oder `force`) + `data-generated="true"`-Ghost-Markierung (CSS: `--paper-ghost`, kursiv; im Druck neutralisiert) | `41-salutation-engine.js` + `layout.css`/`print.css` | Vorschlag bleibt echter, druckbarer Text — nur optisch als unbestätigt markiert |
| **Grußformel** | Smart‑Default Generator | `41-salutation-engine.js` | Passende Abschlüsse (Beste Grüße vs. Mit freundlichen Grüßen) |
| **Firmen-Fall** | Basis-Erkennung (Firma ohne Name → Fallback-Anrede) | `41-salutation-engine.js` | Einfacher als ursprünglich dokumentiert, aber funktional |
| **DIN-Fehler** | ✅ `_validatePunctuation()` — prüft bei `blur` auf manuell editierten (`dirty`) Feldern: Anrede muss mit Komma enden, Grußformel darf nicht mit Komma/Punkt enden | `41-salutation-engine.js` (Toast via `Constants.TOASTS.SALUTATION_PUNCTUATION`/`CLOSING_PUNCTUATION`) | Engine-generierte Vorschläge sind per Konstruktion korrekt und werden nicht validiert |

---

## 🔗 Dokumenten-Navigation

| Issue | Dokument | Zweck |
|-------|----------|-------|
| [#1](https://github.com/grapefruit89/DIN-BriefNEO/issues/1) | IMR 4.0 Registry | Alle 45+ DIN-Tags |
| [#2](https://github.com/grapefruit89/DIN-BriefNEO/issues/2) | Architecture Compliance | Technologie-Leitplanken |
| [#3](https://github.com/grapefruit89/DIN-BriefNEO/issues/3) | Feature Matrix | Projekt-Fortschritt |
| [#4](https://github.com/grapefruit89/DIN-BriefNEO/issues/4) | Salutation Engine | Logik-Dokumentation |
| [#5](https://github.com/grapefruit89/DIN-BriefNEO/issues/5) | CSS Glossar | CSS-Features Referenz |

