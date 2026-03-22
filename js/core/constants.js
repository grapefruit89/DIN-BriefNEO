/**
 * ==========================================================================
 * Central Measurement Authority (CMA) — Layer 1: JS Constants
 * ==========================================================================
 * SPEC-007 | CAA-008 | PLAN-010 | ADR-008 | IMR 2.0
 * Version:  3.1.0 | Status: CEMENTED | Criticality: CRITICAL
 *
 * IMR 2.0 (2026-03-20):
 *   tag:     HTML Custom Tag-Name (z.B. "din-subject")
 *   key:     JSON-Key = tag.slice(4).replace(/-/g,'_') automatisch ableitbar
 *   cmaProp: CMA-Konstanten-Key fuer die CMA-Bridge
 *
 * ADR-008 (2026-03-20):
 *   richText-Flag ENTFERNT (TOMB-L008).
 *   ALLE din-* Tags: contenteditable="plaintext-only".
 *   Formatierungen nur via Ghost-Mirror (GEMINI.md Sektion VII).
 *   readDOMasJSON() liest IMMER textContent, nie innerHTML.
 * ==========================================================================
 */

export const CMA = Object.freeze({
  PAGE_WIDTH:          210.000, PAGE_HEIGHT:        297.000,
  MARGIN_LEFT:          25.000, MARGIN_RIGHT:        20.000,
  ADDRESS_WIDTH:        85.000, ADDRESS_HEIGHT:      45.000,
  VERMERK_HEIGHT:       17.700, EMPFAENGER_HEIGHT:   27.300,
  FORM: Object.freeze({
    A: Object.freeze({ ADDRESS_TOP: 27.000 }),
    B: Object.freeze({ ADDRESS_TOP: 45.000 }),
  }),
  SENDER_ZONE_TOP:      27.000,
  INFO_BLOCK_TOP:       97.400,  // *** AVIATION GRADE ***
  SUBJECT_TOP:         103.400,  // *** AVIATION GRADE ***
  FOOTER_TOP:          269.000,  // *** AVIATION GRADE ***
  SALUTATION_TOP:      113.000,
  SIGNATURE_GAP:        12.700,
  INFO_COL_RIGHT_LEFT: 120.000,
  INFO_COL_RIGHT_WIDTH: 75.000,
  TEXT_WIDTH:          165.000,
  FOLD_MARK_1:         105.000,
  PUNCH_MARK:          148.500,
  FOLD_MARK_2:         210.000,
  FONT_SIZE_BODY_PT:    11.000,
  LINE_HEIGHT_PT:       14.000,
  LINE_HEIGHT_MM:        5.080,
});

/**
 * IMR 2.0 — Isomorphic Master Registry
 * Tag-Name IS der Selektor. key = tag.slice(4).replace(/-/g,'_')
 *
 * [ADR-008] richText-Flag entfernt (TOMB-L008).
 * Alle Felder: contenteditable="plaintext-only" im HTML.
 * din-body: Formatierung via Ghost-Mirror, nicht via richText.
 * readDOMasJSON() → immer textContent.
 */
export const IMR = Object.freeze([
  { tag: 'din-sender',     key: 'sender',      cmaProp: 'SENDER_ZONE_TOP'    },
  { tag: 'din-note',       key: 'note',         cmaProp: 'ADDRESS_HEIGHT'     },
  { tag: 'din-recipient',  key: 'recipient',    cmaProp: 'ADDRESS_HEIGHT'     },
  { tag: 'din-date',       key: 'date',         cmaProp: 'INFO_BLOCK_TOP'     },
  { tag: 'din-your-ref',   key: 'your_ref',     cmaProp: 'INFO_BLOCK_TOP'     },
  { tag: 'din-our-ref',    key: 'our_ref',      cmaProp: 'INFO_BLOCK_TOP'     },
  { tag: 'din-subject',    key: 'subject',      cmaProp: 'SUBJECT_TOP'        },
  { tag: 'din-salutation', key: 'salutation',   cmaProp: 'SALUTATION_TOP'     },
  { tag: 'din-body',       key: 'body',         cmaProp: null                 },
  { tag: 'din-greeting',   key: 'greeting',     cmaProp: null                 },
  { tag: 'din-signature',  key: 'signature',    cmaProp: 'FOOTER_TOP'         },
]);
