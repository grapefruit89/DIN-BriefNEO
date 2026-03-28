/**
 * js/core/constants.js — v4.2.0 Specification (IMR 4.0)
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
 * IMR 4.0 Matrix (Isomorphic Master Registry) — Granular Edition
 * Strenge Kopplung zwischen physischem HTML-Tag und JSON-Key.
 */
export const IMR = Object.freeze([
  // 1. Identität (Header)
  { tag: "din-absender-vorname",  key: "sender_fn", editContext: true },
  { tag: "din-absender-nachname", key: "sender_ln", editContext: true },
  { tag: "din-absender-strasse",  key: "sender_st", editContext: true },
  { tag: "din-absender-ort",      key: "sender_city", editContext: true },

  // 2. Anschriftfeld (Granular)
  { tag: "din-return-line",       key: "return_line", editContext: true },
  { tag: "din-supplement",        key: "supplement", editContext: true },
  { tag: "din-empfaenger-firma",  key: "rect_co", editContext: true },
  { tag: "din-empfaenger-vorname", key: "rect_fn", editContext: true },
  { tag: "din-empfaenger-nachname", key: "rect_ln", editContext: true },
  { tag: "din-empfaenger-strasse", key: "rect_st", editContext: true },
  { tag: "din-empfaenger-ort",    key: "rect_city", editContext: true },

  // 3. Metadaten (Infoblock & Date)
  { tag: "din-ref-ihr",           key: "ref_ihr", editContext: true },
  { tag: "din-ref-unser",         key: "ref_unser", editContext: true },
  { tag: "din-date",              key: "date", editContext: true },

  // 4. Brief-Kern (Blink-Direct)
  { tag: "din-subject",           key: "subject", editContext: true },
  { tag: "din-anrede",            key: "salutation", editContext: true },
  { tag: "din-text",              key: "body", editContext: true },
  { tag: "din-grussformel",       key: "greeting", editContext: true },
  { tag: "din-signature",         key: "signature", editContext: true },
  { tag: "din-attachments",       key: "attachments", editContext: true },

  // 5. Abschluss
  { tag: "din-fusszeile",         key: "footer" },

  // 6. Branding (Aviation Grade Extension)
  { tag: "din-branding-logo",     key: "brand_logo" },
  { tag: "din-branding-watermark", key: "brand_watermark" },
]);

export const AI_INTENTS = Object.freeze({
  PRINT: "action:print",
  SAVE:  "action:save_local",
  GHOST: "action:toggle_guides"
});

/**
 * [ADR-014] Native Sanitizer (Core Specification)
 * [CMD-3] Whitelist IMR 4.0 Custom Tags based on SSoT.
 */
export const SANITIZER_CONFIG = {
  elements: [
    "din-5008", "din-A4", "din-header", "din-anschriftfeld", "din-infoblock",
    "din-absender-vorname", "din-absender-nachname", "din-absender-strasse", "din-absender-ort",
    "din-return-line", "din-supplement", "din-empfaenger-firma", "din-empfaenger-vorname", "din-empfaenger-nachname", "din-empfaenger-strasse", "din-empfaenger-ort",
    "din-ref-ihr", "din-ref-unser", "din-date",
    "din-subject", "din-anrede", "din-text", "din-text-mirror", "din-grussformel", "din-signature", "din-attachments",
    "din-fusszeile", "din-branding-logo", "din-branding-watermark",
    "br", "div", "span", "b", "i", "strong", "em", "blockquote", "img"
  ],
  attributes: [
    { name: "data-placeholder", elements: ["*"] },
    { name: "data-form", elements: ["*"] },
    { name: "src", elements: ["img"] }
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
export const CORE_SANITIZER = sanitizerInstance;
