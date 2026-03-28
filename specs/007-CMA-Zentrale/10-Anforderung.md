---
id: SPEC-007-ANF
title: Central Measurement Authority (CMA) Domain-Spec
status: active
version: 4.0.0 (IMR-Ready)
---

# 10 â€” Anforderung: Central Measurement Authority (CMA)

## 1. Domain-Spec
Single Source of Truth fÃ¼r physikalische DIN 5008 Koordinaten. Elimination von Layout-Drift durch zentralisierte Geometrie-Konstanten.

## 2. Kanonische Masse (DIN 5008:2020-03)

| Key | Value (mm) | Context |
|:---|:---|:---|
| PAGE_WIDTH | 210.000 | A4 Standard |
| PAGE_HEIGHT | 297.000 | A4 Standard |
| MARGIN_LEFT | 25.000 | Bindemarge |
| SENDER_TOP | 27.000 | Zone A |
| ADDR_TOP_A | 27.000 | Form A |
| ADDR_TOP_B | 45.000 | Form B |
| INFO_TOP | 97.400 | Infoblock |
| DATE_TOP | 50.000 | Standalone (V4) |
| SUBJECT_TOP | 103.400 | Kern-Entry |

## 3. Functional Requirements (FR)
- **FR-001 [Single Source of Truth]:** Alle MaÃŸe exakt an einem Ort definiert.
- **FR-002 [PRECISION]:** Mind. 3 Dezimalstellen (0.001mm Resolution).
- **FR-003 [UNIFORMITY]:** Form A/B Umschaltung via zentralem Parameter.
- **FR-004 [BANNED]:** Hard-coded "Magic Numbers" auÃŸerhalb CMA fÃ¼hren zu System-Reject.

