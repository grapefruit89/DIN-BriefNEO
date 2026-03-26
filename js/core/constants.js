/**
 * js/core/constants.js — Platinum Audit V4.1.0 (IMR 3.1)
 * Central Measurement Authority (CMA) — Layer 1: JS Constants
 * ─────────────────────────────────────────────────────────
 */

export const CMA = Object.freeze({
  PAGE_WIDTH:          210.000, PAGE_HEIGHT:        297.000,
  MARGIN_LEFT:          25.000, MARGIN_RIGHT:        20.000,
  ADDRESS_WIDTH:        85.000, ADDRESS_HEIGHT:      45.000,
  FORM: Object.freeze({
    A: Object.freeze({ ADDRESS_TOP: 32.000 }),
    B: Object.freeze({ ADDRESS_TOP: 45.000 }),
  }),
});

/**
 * IMR 3.1 Matrix (Isomorphic Master Registry)
 * Strenge Kopplung zwischen physischem HTML-Tag und JSON-Key.
 */
export const IMR = Object.freeze([
  // 1. Identität & Branding
  { tag: "din-sender-details",  key: "sender_details" },

  // 2. Anschriftzone (Platinum V4)
  { tag: "din-return-line",     key: "return_line"  },
  { tag: "din-supplement",      key: "supplement"   },
  { tag: "din-recipient",       key: "recipient",   editContext: true },

  // 3. Metadaten & Leitwörter
  { tag: "din-ref-line",        key: "ref_line"  },
  { tag: "din-date",            key: "date"      },

  // 4. Brief-Kern (Blink-Direct)
  { tag: "din-subject",         key: "subject"    },
  { tag: "din-salutation",      key: "salutation" },
  { tag: "din-body",            key: "body",        editContext: true },
  { tag: "din-closing",         key: "closing"    },
  { tag: "din-signature",       key: "signature"  },
  { tag: "din-attachments",     key: "attachments"},

  // 5. Compliance & Sicherheit
  { tag: "din-bank-data",       key: "bank_data" },
  { tag: "din-fiscal-data",     key: "fiscal_data" },
]);

export const AI_INTENTS = Object.freeze({
  PRINT: "action:print",
  SAVE:  "action:save_local",
  GHOST: "action:toggle_guides"
});

/**
 * [ADR-014] Native Sanitizer (Aviation Grade Platinum)
 * [CMD-3] Whitelist IMR 3.1 Custom Tags based on SSoT.
 */
export const SANITIZER_CONFIG = {
  elements: [
    "din-5008", "din-page", "din-cma-sensor",
    "din-header", "din-logo", "din-sender-details", "din-vcard",
    "din-address-zone", "din-return-line", "din-supplement", "din-recipient",
    "din-infoblock", "din-ref-line", "din-date",
    "din-subject", "din-salutation", "din-body", "din-closing", "din-signature", "din-attachments",
    "din-amount", "din-bank-data", "din-fiscal-data", "din-footer",
    "br", "div", "span", "b", "i", "strong", "em"
  ],
  attributes: [
    { name: "data-placeholder", elements: ["*"] },
    { name: "data-form", elements: ["*"] }
  ]
};

let sanitizerInstance = null;
if (globalThis.Sanitizer) {
  try {
    sanitizerInstance = new Sanitizer(SANITIZER_CONFIG);
  } catch (e) {
    console.warn('[Sanitizer] Failed to initialize with config, falling back to null.', e);
  }
}
export const PLATINUM_SANITIZER = sanitizerInstance;
