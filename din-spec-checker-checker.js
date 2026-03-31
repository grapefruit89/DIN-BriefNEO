/**
 * DIN-SPEC-CHECKER (v2.0)
 * Precision Validator for v4.0 Standard & DIN 5008:2020-03
 */

const RULES = {
  geometry: {
    addressZone: { width: "85mm", height: "45mm", top: "45mm", left: "20mm" },
    foldMarks: ["105mm", "210mm"],
    holeMark: "148.5mm",
  },
  // NO-FLUFF POLICY: Forbidden metaphorical terminology
  fluffRadar: ["Aviation", "Sovereign", "Akinator", "Grade"],
  // ELEMENT WHITELIST: Strictly IMR 4.0 Atoms
  elements: {
    allowed: [
      "din-5008",
      "din-A4",
      "din-header",
      "din-anschriftfeld",
      "din-infoblock",
      "din-absender-vorname",
      "din-absender-nachname",
      "din-absender-strasse",
      "din-absender-ort",
      "din-return-line",
      "din-supplement",
      "din-empfaenger-firma",
      "din-empfaenger-name",
      "din-empfaenger-strasse",
      "din-empfaenger-ort",
      "din-ref-ihr",
      "din-ref-unser",
      "din-date",
      "din-subject",
      "din-anrede",
      "din-text",
      "din-text-mirror",
      "din-grussformel",
      "din-signature",
      "din-attachments",
      "din-fusszeile",
      "din-fiscal-data",
      "din-bank-data",
    ],
    extensionPrefix: "din-ext-",
  },
  apis: {
    mandatory: ["setHTML", "textContent", "popover", "Temporal", "EditContext"],
    forbidden: [
      "innerHTML",
      "document.write",
      "var",
      "new Date()",
      "Date.now()",
    ],
  },
};

export function validate(content, fileName) {
  const errors = [];

  // 1. Terminology Check
  RULES.fluffRadar.forEach((word) => {
    if (content.toLowerCase().includes(word.toLowerCase())) {
      errors.push(
        `[TERMINOLOGY] File ${fileName} contains metaphorical fluff: "${word}"`,
      );
    }
  });

  // 2. API Check
  RULES.apis.forbidden.forEach((api) => {
    if (content.includes(api)) {
      errors.push(`[LEGACY] Forbidden pattern found: ${api}`);
    }
  });

  // 3. Popover Check (for HTML files)
  if (
    fileName.endsWith(".html") &&
    content.includes("<dialog") &&
    !content.includes("popover")
  ) {
    errors.push(
      `[A11Y] Dialog found without Popover API. Use CSS-first Popover approach.`,
    );
  }

  // 4. Element Check (for HTML files)
  if (fileName.endsWith(".html")) {
    const customElements = content.match(/<din-[a-z0-9-]+/g) || [];
    customElements.forEach((tag) => {
      const tagName = tag.substring(1);
      if (
        !RULES.elements.allowed.includes(tagName) &&
        !tagName.startsWith(RULES.elements.extensionPrefix)
      ) {
        errors.push(
          `[SPEC] Non-standard Custom Element found: ${tagName}. Align with IMR 4.0 atoms.`,
        );
      }
    });
  }

  return errors;
}
