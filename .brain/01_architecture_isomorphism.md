# 01_architecture_isomorphism.md
# Isomorphic Architecture — State & DOM & JSON Mapping
# Letzte Aktualisierung: 2026-03-20 | CAA-008 | Version 2.0.0
# STATUS: HEILIGES GESETZ — Abweichungen sind Bugs

---

## Das Dreiklang-Prinzip

Jedes inhaltstragende Feld existiert exakt dreimal:

```
JSON-Key (Akinator)  ←→  data-field (DOM)  ←→  CMA-Koordinate (mm)
"special_note"       ←→  "special-note"    ←→  ADDRESS_TOP_B / 45mm
```

Normalisierungsregel: Bindestrich (HTML) → Unterstrich (JSON)

---

## Vollständiges Mapping (IMR-Kurzreferenz)

| JSON-Key         | data-field        | DOM-ID          | CMA-Prop        |
|------------------|-------------------|-----------------|-----------------|
| sender_line      | return-address    | absender-zeile  | SENDER_ZONE_TOP |
| special_note     | special-note      | vermerkzone     | ADDRESS_HEIGHT  |
| recipient        | recipient         | empfaenger      | ADDRESS_HEIGHT  |
| date             | date              | f-date          | INFO_BLOCK_TOP  |
| your_ref         | your-ref          | f-your-ref      | INFO_BLOCK_TOP  |
| our_ref          | our-ref           | f-our-ref       | INFO_BLOCK_TOP  |
| subject          | subject           | f-subject       | SUBJECT_TOP     |
| salutation       | salutation        | f-salut         | SALUTATION_TOP  |
| body             | body              | f-body          | dynamisch       |
| greeting         | greeting          | f-greeting      | dynamisch       |
| signature_name   | signature-name    | f-sig-name      | FOOTER_TOP      |

## Maschinenlesbare Quelle

→ js/core/constants.js → export const IMR
  Dieses Array ist die programmatische SSoT.
  devmode.js und logic.js lesen ausschliesslich daraus.

## Vollstaendige Registry

→ .brain/08_isomorphic_schema.md
  Sektion A-I mit allen Koordinaten, Validierungen und Akinator-Schema.
