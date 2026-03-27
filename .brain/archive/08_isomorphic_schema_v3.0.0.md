---
id: BRAIN-008-IMR
title: Isomorphic Master Registry (IMR) v3.0.0 — CORE-SPEC Monolith
version: 3.0.0
status: cemented
last_audit: 2026-03-24
tags: [aviation-grade, platinum-2026, ssot, imr, chrome-148, native-cma]
supersedes: [08_isomorphic_schema_v2.5.0.md, 08_isomorphic_schema_v2.2.0.md, 07_measurement_conflict_log.md]
authority: SUPREME SSoT für Datenstruktur, Geometrie und Interoperabilität.
---

# 08 — Isomorphic Master Registry (IMR) v3.0.0

## I. DIE VIER-EINHEITS-INVARIANTE (DOKTRIN)
Jedes funktionale Element des DIN-Briefs existiert in genau einer, deterministisch ableitbaren Form über alle Systemebenen hinweg. Jede Abweichung ist ein kritischer Architektur-Fehler.

```
TAG (HTML) = KEY (JSON) = COORDINATE (CMA) = ANCHOR (CSS)
```

## II. DIE MASTER-MATRIX (11 KERNFELDER)
Alle Koordinaten sind in Millimetern (mm) angegeben und basieren auf der **DIN 5008:2020-03** (Aviation Grade Validierung).

| TAG | JSON-KEY | CMA-TOP (mm) | CMA-LEFT (mm) | CSS-ANKER-NAME | DATA-CMA-ATTR |
|:---|:---|:---|:---|:---|:---|
| `<din-sender>` | `sender` | 27.0 | 25.0 | `--din-sender` | `data-cma-top="27mm"` |
| `<din-note>` | `note` | 45.0 | 25.0 | `--din-note` | `data-cma-top="45mm"` |
| `<din-recipient>`| `recipient` | 62.7 | 25.0 | `--din-recipient`| `data-cma-top="62.7mm"` |
| `<din-date>` | `date` | 97.4 | 125.0 | `--din-date` | `data-cma-left="125mm"` |
| `<din-your-ref>` | `your_ref` | 97.4 | 25.0 | `--din-your-ref` | `data-cma-top="97.4mm"` |
| `<din-our-ref>` | `our_ref` | 97.4 | 70.0 | `--din-our-ref` | `data-cma-top="97.4mm"` |
| `<din-subject>` | `subject` | 103.4 | 25.0 | `--din-subject` | `data-cma-top="103.4mm"` |
| `<din-salutation>`| `salutation`| 113.0 | 25.0 | `--din-salutation`| `data-cma-top="113mm"` |
| `<din-body>` | `body` | 125.0 | 25.0 | `--din-body` | `data-cma-top="125mm"` |
| `<din-greeting>` | `greeting` | auto (flow) | 25.0 | `--din-greeting` | `data-cma-flow="true"`|
| `<din-signature>`| `signature` | 269.0 | 25.0 | `--din-signature` | `data-cma-top="269mm"` |

## III. NATIVE CMA-GEOMETRIE (CHROME 148+ BASELINE)
Das System nutzt das erweiterte `attr()` der CSS Values Level 5 zur direkten Typ-Konvertierung von HTML-Attributen in physische Längenmaße.

- **Implementierung:** `top: attr(data-cma-top type(<length>), 125mm);`
- **Vorteil:** Null JavaScript für die Layout-Berechnung. Die Browser-Engine (C++) übernimmt die Millimeter-Präzision.
- **Circuit Breaker:** Ungültige Attribute (z.B. "103.4mx") fallen auf den im CSS deklarierten Standard-DIN-Wert zurück.

## IV. PLAINTEXT-ONLY DOKTRIN (ADR-008)
Alle `<din-*>` Felder tragen ausnahmslos das Attribut `contenteditable="plaintext-only"`.

- **MANDATE-INJ:** `innerHTML` ist für alle Briefdaten verboten.
- **GHOST-MIRROR:** Die einzige Ausnahme für visuelle Formatierung ist der `din-body-mirror`, der via `CSS Custom Highlight API` (::highlight) gerendert wird. Die Datenquelle bleibt 100% reiner Text (Markdown-Syntax).

## V. PROFILE & STAMMDATEN (AKINATOR-EXTENSIONS)
Erweiterte Keys für die Persistenz des Absender-Profils.

| JSON-KEY | HTML-ID | VALIDIERUNG |
|:---|:---|:---|
| `author_company` | `p-company` | String |
| `author_name` | `p-name` | String |
| `author_street` | `p-street` | String |
| `author_zip` | `p-zip` | `pattern="[0-9]{5}"` |
| `author_city` | `p-city` | String |
| `author_phone` | `p-phone` | `tel` |
| `author_email` | `p-email` | `email` |
| `author_iban` | `p-iban` | IBAN-Modulo-97 |

## VI. STRICT SCHEMA GATE (JSON-IMPORT)
Das System ist intolerant gegenüber Schema-Verschmutzung.
- **Vollständigkeit:** Unbekannte Keys führen zur Ablehnung des Imports.
- **Mapping:** Es existiert kein Legacy-Mapping für v1-Keys.
- **Envelope:** Einzig erlaubter Nicht-IMR-Key ist `_meta` für Versions-Dokumentation.

## VII. VALIDIERTE DIN-KONSTANTEN (EX-CONFLICT-LOG)
Zementierte Werte zur Beilegung aller Mess-Konflikte:
1. **Betreff (SUBJECT_TOP):** 103.4 mm (Zentrum-Präzision).
2. **Infoblock (INFO_BLOCK_LEFT):** 125 mm (Harsh-Grid).
3. **Signatur (FOOTER_TOP):** 269 mm (Präzision vor Varianz).
4. **Linker Rand (MARGIN_LEFT):** 25 mm (Strikt).
5. **Rechter Rand (MARGIN_RIGHT):** 20 mm (Puffer).

---
*SSoT versiegelt. Alle Fragmente in .brain/archive/ verschieben.*
