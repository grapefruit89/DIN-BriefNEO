---
id: BRAIN-008-SEMANTIC-DATA-MODEL
title: Semantic Data Model v4.0.0 — Core Specification
version: 4.0.0
status: verified
last_audit: 2026-03-27
tags: [mission-critical, production-ready, ssot, semantic-data-model, chrome-148, layout-constraints]
supersedes: [08_isomorphic_schema_v3.0.0.md, 08_isomorphic_schema_v2.5.0.md]
authority: Single Source of Truth (SSoT) for Data Structure, Geometry, and Interoperability.
---

# 08 — Semantic Data Model v4.0.0

## I. UNIFIED STATE INVARIANT (PARADIGM)
Each functional element of the DIN letter exists in exactly one deterministically derivable form across all system layers. Any deviation is considered a critical architectural failure.

```
HTML TAG = JSON KEY = LAYOUT CONSTRAINT = CSS ANCHOR
```

## II. MASTER REGISTRY (11 CORE FIELDS)
All coordinates are specified in millimeters (mm) and are based on **DIN 5008:2020-03** (Standard Compliance Validation).

| HTML TAG | JSON KEY | TOP OFFSET (mm) | LEFT OFFSET (mm) | CSS ANCHOR NAME | DATA LAYOUT ATTR |
|:---|:---|:---|:---|:---|:---|
| `<din-sender>` | `sender` | 27.0 | 25.0 | `--din-sender` | `data-layout-top="27mm"` |
| `<din-note>` | `note` | 45.0 | 25.0 | `--din-note` | `data-layout-top="45mm"` |
| `<din-recipient>`| `recipient` | 62.7 | 25.0 | `--din-recipient`| `data-layout-top="62.7mm"` |
| `<din-date>` | `date` | 97.4 | 125.0 | `--din-date` | `data-layout-left="125mm"` |
| `<din-your-ref>` | `your_ref` | 97.4 | 25.0 | `--din-your-ref` | `data-layout-top="97.4mm"` |
| `<din-our-ref>` | `our_ref` | 97.4 | 70.0 | `--din-our-ref` | `data-layout-top="97.4mm"` |
| `<din-subject>` | `subject` | 103.4 | 25.0 | `--din-subject` | `data-layout-top="103.4mm"` |
| `<din-salutation>`| `salutation`| 113.0 | 25.0 | `--din-salutation`| `data-layout-top="113mm"` |
| `<din-body>` | `body` | 125.0 | 25.0 | `--din-body` | `data-layout-top="125mm"` |
| `<din-greeting>` | `greeting` | auto (flow) | 25.0 | `--din-greeting` | `data-layout-flow="true"`|
| `<din-signature>`| `signature` | 269.0 | 25.0 | `--din-signature` | `data-layout-top="269mm"` |

## III. NATIVE LAYOUT CONSTRAINTS (CHROME 148+ BASELINE)
The system utilizes the extended `attr()` function from CSS Values Level 5 for direct type conversion of HTML attributes into physical lengths.

- **Implementation:** `top: attr(data-layout-top type(<length>), 125mm);`
- **Benefit:** Zero JavaScript required for layout calculations. The browser engine (C++) handles millimeter precision natively.
- **Circuit Breaker:** Invalid attributes (e.g., "103.4mx") default to the standard DIN value declared in CSS.

## IV. DECLARATIVE UI PARADIGM (ADR-008)
All `<din-*>` fields must use the attribute `contenteditable="plaintext-only"`.

- **Security Constraint:** `innerHTML` is strictly prohibited for all letter data.
- **Visual Overlay Layer:** The only exception for visual formatting is the `din-body-mirror`, rendered via the `CSS Custom Highlight API` (::highlight). The data source remains 100% plain text (Markdown-Syntax).

## V. PROFILES & MASTER DATA (METADATA EXTENSIONS)
Extended keys for sender profile persistence.

| JSON KEY | HTML ID | VALIDATION |
|:---|:---|:---|
| `author_company` | `p-company` | String |
| `author_name` | `p-name` | String |
| `author_street` | `p-street` | String |
| `author_zip` | `p-zip` | `pattern="[0-9]{5}"` |
| `author_city` | `p-city` | String |
| `author_phone` | `p-phone` | `tel` |
| `author_email` | `p-email` | `email` |
| `author_iban` | `p-iban` | IBAN-Modulo-97 |

## VI. STRICT SCHEMA VALIDATION (JSON IMPORT)
The system does not tolerate schema inconsistency.
- **Completeness:** Unknown keys result in import rejection.
- **Mapping:** No legacy mapping exists for v1 keys.
- **Metadata:** The only allowed non-model key is `_meta` for version documentation.

## VII. STANDARDIZED DIN CONSTANTS (CONSTRAINT RESOLUTION)
Fixed values for resolving measurement conflicts:
1. **Subject (SUBJECT_TOP):** 103.4 mm.
2. **Info Block (INFO_BLOCK_LEFT):** 125 mm.
3. **Signature (FOOTER_TOP):** 269 mm.
4. **Left Margin (MARGIN_LEFT):** 25 mm.
5. **Right Margin (MARGIN_RIGHT):** 20 mm.

---
*SSoT verified. Outdated documents moved to .brain/archive/.*
