---
id: BRAIN-008-SEMANTIC-DATA-MODEL
title: Semantic Data Model v4.0.0 — Granular Edition (Platinum)
version: 4.0.0
status: verified
last_audit: 2026-03-28
tags: [mission-critical, production-ready, ssot, semantic-data-model, oklch-ready, granular-atoms]
supersedes: [08_isomorphic_schema_v3.0.0.md]
authority: Single Source of Truth (SSoT) for Data Structure, Geometry, and Interoperability.
---

# 08 — Semantic Data Model v4.0.0 (IMR 4.0)

## I. UNIFIED STATE INVARIANT (PARADIGM)
Jedes funktionale Element des DIN-Briefs existiert in genau einer deterministischen Form über alle Schichten hinweg. Atome ersetzen Monolithen für maximale Layout-Stabilität.

```
HTML TAG = JSON KEY = LAYOUT CONSTRAINT = EDIT_CONTEXT BINDING
```

## II. MASTER REGISTRY (IMR 4.0 ATOMS)
Basierend auf **DIN 5008:2020-03**. Alle Koordinaten in Millimetern (mm).

### 1. Absender-Atome (Header / Zone A)
| HTML TAG | JSON KEY | POS (X/Y) | CONSTRAINT |
|:---|:---|:---|:---|
| `<din-absender-vorname>` | `sender_fn` | 125mm / 20mm | Single-Line, Right-Aligned |
| `<din-absender-nachname>`| `sender_ln` | 125mm / 25mm | Single-Line, Right-Aligned |
| `<din-absender-strasse>` | `sender_st` | 125mm / 30mm | Single-Line, Right-Aligned |
| `<din-absender-ort>`     | `sender_city` | 125mm / 35mm | Single-Line (PLZ + Ort) |

### 2. Anschriftfeld-Atome (85x45mm)
| HTML TAG | JSON KEY | POS (X/Y) | CONSTRAINT |
|:---|:---|:---|:---|
| `<din-return-line>` | `return_line` | 20mm / 45mm | Form B Layout |
| `<din-supplement>`  | `supplement` | 20mm / 50mm | Zusatz/Vermerk |
| `<din-empfaenger-firma>`| `rect_co` | 20mm / 60mm | Optional |
| `<din-empfaenger-name>` | `rect_name` | 20mm / 65mm | **Trigger: Salutation Engine** |
| `<din-empfaenger-strasse>`| `rect_st` | 20mm / 70mm | Pflicht |
| `<din-empfaenger-ort>`   | `rect_city` | 20mm / 75mm | Pflicht |

### 3. Metadaten & Datum
| HTML TAG | JSON KEY | POS (X/Y) | CONSTRAINT |
|:---|:---|:---|:---|
| `<din-date>` | `date` | **125mm / 50mm** | Standalone (DIN 2020-03) |
| `<din-ref-ihr>` | `ref_ihr` | 125mm / 97.4mm | Ohne Label im State |
| `<din-ref-unser>` | `ref_unser` | 125mm / 102.4mm | Ohne Label im State |

### 4. Briefkern (Blink-Direct)
| HTML TAG | JSON KEY | POS (X/Y) | API / BINDING |
|:---|:---|:---|:---|
| `<din-subject>` | `subject` | 25mm / 103.4mm | Bold, 2-Line Distance |
| `<din-anrede>` | `salutation`| 25mm / 113.0mm | Reactive Update |
| `<din-text>` | `body` | 25mm / 125.0mm | **EditContext API** |
| `<din-text-mirror>` | - | - | **Sanitizer API** (Ghost-Mirror) |
| `<din-grussformel>` | `greeting` | auto (flow) | DIN-Compliant |

## III. FARBSYSTEM (OKLCH PROTOCOL)
Migration von RGB/HEX zu **OKLCH** für perzeptuelle Gleichmäßigkeit.

- **Primary:** `oklch(60% 0.15 250)` (Vivid Blue)
- **Sidebar-BG:** `oklch(15% 0.02 240)` (Aviation Deep Deep Blue)
- **Paper-Dark:** `oklch(85% 0.01 240)` (Neutral Grey contrast)

## IV. ARCHITECTURAL MANDATES (PLATINUM V4)
1. **NO-INNERHTML:** Verwendung von `setHTML` mit `PLATINUM_SANITIZER`.
2. **EDIT-CONTEXT:** Erzwungenes Binding für alle 19 Atome der Registry.
3. **ZERO-WIDTH-GHOSTING:** Ghost-Mirror (SPEC-066) für alle Formattierungen.

---
*SSoT Synchronized. Real-world implementation verified against constants.js.*
