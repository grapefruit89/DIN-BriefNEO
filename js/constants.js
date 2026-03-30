/**
 * js/constants.js — v4.0.0 Specification (IMR 4.0)
 * Central Measurement Authority (CMA) — Layer 1: JS Constants
 * ─────────────────────────────────────────────────────────
 */

export const CMA = Object.freeze({
  PAGE_WIDTH: 210.0,
  PAGE_HEIGHT: 297.0,
  MARGIN_LEFT: 25.0,
  MARGIN_RIGHT: 20.0,
  ADDRESS_WIDTH: 85.0,
  ADDRESS_HEIGHT: 45.0,
  FORM: Object.freeze({
    A: Object.freeze({ ADDRESS_TOP: 32.0 }),
    B: Object.freeze({ ADDRESS_TOP: 45.0 }),
  }),
});

/**
 * IMR 4.0 Matrix (Isomorphic Master Registry) — Granular Edition
 * Strenge Kopplung zwischen physischem HTML-Tag und JSON-Key.
 */
export const IMR = Object.freeze([
  // 1. Identität (Header & Branding)
  { tag: "din-branding-logo", key: "brand_logo" },
  { tag: "din-branding-watermark", key: "brand_watermark" },
  { tag: "din-absender-vorname", key: "sender_fn", editContext: true },
  { tag: "din-absender-nachname", key: "sender_ln", editContext: true },
  { tag: "din-absender-strasse", key: "sender_st", editContext: true },
  { tag: "din-absender-ort", key: "sender_city", editContext: true },
  { tag: "din-absender-kontakt", key: "sender_contact", editContext: true },
  { tag: "din-absender-mail", key: "sender_mail", editContext: true },
  { tag: "din-absender-tel", key: "sender_tel", editContext: true },

  // 2. Anschriftfeld (Granular)
  { tag: "din-return-line", key: "return_line", editContext: true },
  { tag: "din-supplement", key: "supplement", editContext: true },
  { tag: "din-empfaenger-firma", key: "rect_co", editContext: true },
  { tag: "din-empfaenger-abteilung", key: "rect_dept", editContext: true },
  { tag: "din-empfaenger-vorname", key: "rect_fn", editContext: true },
  { tag: "din-empfaenger-nachname", key: "rect_ln", editContext: true },
  { tag: "din-empfaenger-strasse", key: "rect_st", editContext: true },
  { tag: "din-empfaenger-ort", key: "rect_city", editContext: true },

  // 3. Metadaten (Infoblock & Date)
  { tag: "din-ref-ihr-zeichen", key: "ref_ihr_zeichen", editContext: true },
  { tag: "din-ref-ihr-schreiben", key: "ref_ihr_schreiben", editContext: true },
  { tag: "din-ref-unser-zeichen", key: "ref_unser_zeichen", editContext: true },
  {
    tag: "din-ref-unser-schreiben",
    key: "ref_unser_schreiben",
    editContext: true,
  },
  { tag: "din-ref-telefon", key: "ref_tel", editContext: true },
  { tag: "din-ref-email", key: "ref_email", editContext: true },
  { tag: "din-ref-internet", key: "ref_web", editContext: true },
  { tag: "din-date", key: "date", editContext: true },

  // 4. Brief-Kern (Blink-Direct)
  { tag: "din-subject", key: "subject", editContext: true },
  { tag: "din-anrede", key: "salutation", editContext: true },
  { tag: "din-text", key: "body", editContext: true },
  { tag: "din-grussformel", key: "greeting", editContext: true },
  { tag: "din-signature", key: "signature", editContext: true },
  { tag: "din-attachments", key: "attachments", editContext: true },

  // 5. Abschluss (Recht & Finanzen)
  { tag: "din-footer-firma", key: "footer_co", editContext: true },
  { tag: "din-footer-sitz", key: "footer_sitz", editContext: true },
  { tag: "din-footer-gericht", key: "footer_court", editContext: true },
  { tag: "din-footer-hrb", key: "footer_hrb", editContext: true },
  { tag: "din-footer-vorstand", key: "footer_board", editContext: true },
  { tag: "din-footer-gf", key: "footer_gf", editContext: true },
  { tag: "din-footer-stnr", key: "footer_stnr", editContext: true },
  { tag: "din-footer-ustid", key: "footer_ustid", editContext: true },
  { tag: "din-footer-bank-name", key: "footer_bank", editContext: true },
  { tag: "din-footer-iban", key: "footer_iban", editContext: true },
  { tag: "din-footer-bic", key: "footer_bic", editContext: true },
  { tag: "din-footer-anschrift", key: "footer_addr", editContext: true },
]);

export const AI_INTENTS = Object.freeze({
  PRINT: "action:print",
  SAVE: "action:save_local",
  GHOST: "action:toggle_guides",
});

/**
 * [ADR-014] Native Sanitizer (Core Specification)
 * [CMD-3] Whitelist IMR 4.0 Custom Tags based on SSoT.
 */
export const SANITIZER_CONFIG = {
  allowElements: [
    "din-5008",
    "din-A4",
    "din-header",
    "din-anschriftfeld",
    "din-infoblock",
    "din-absender-vorname",
    "din-absender-nachname",
    "din-absender-strasse",
    "din-absender-ort",
    "din-absender-kontakt",
    "din-absender-mail",
    "din-absender-tel",
    "din-return-line",
    "din-supplement",
    "din-empfaenger-firma",
    "din-empfaenger-abteilung",
    "din-empfaenger-vorname",
    "din-empfaenger-nachname",
    "din-empfaenger-strasse",
    "din-empfaenger-ort",
    "din-ref-ihr-zeichen",
    "din-ref-ihr-schreiben",
    "din-ref-unser-zeichen",
    "din-ref-unser-schreiben",
    "din-ref-telefon",
    "din-ref-email",
    "din-ref-internet",
    "din-date",
    "din-subject",
    "din-anrede",
    "din-text",
    "din-text-mirror",
    "din-grussformel",
    "din-signature",
    "din-attachments",
    "din-footer-firma",
    "din-footer-sitz",
    "din-footer-gericht",
    "din-footer-hrb",
    "din-footer-vorstand",
    "din-footer-gf",
    "din-footer-stnr",
    "din-footer-ustid",
    "din-footer-bank-name",
    "din-footer-iban",
    "din-footer-bic",
    "din-footer-anschrift",
    "din-branding-logo",
    "din-branding-watermark",
    "br",
    "div",
    "span",
    "b",
    "i",
    "strong",
    "em",
    "blockquote",
    "img",
  ],
  allowAttributes: {
    "data-placeholder": ["*"],
    "data-form": ["*"],
    src: ["img"],
    class: ["*"],
  },
};

let sanitizerInstance = null;
if (globalThis.Sanitizer) {
  try {
    sanitizerInstance = new Sanitizer(SANITIZER_CONFIG);
  } catch (e) {
    console.warn(
      "[Sanitizer] Failed to initialize with config, falling back to null.",
      e,
    );
  }
}
export const CORE_SANITIZER = sanitizerInstance;
