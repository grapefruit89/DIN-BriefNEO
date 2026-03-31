/**
 * salutation.js — Platinum Salutation Engine
 * [ADR-017] Intelligent Greeting & Closing Generation
 * @module salutation
 */

export const SalutationEngine = {
  TITLES: ["Dr.", "Prof.", "Prof. Dr.", "Dipl.-Ing.", "Mag."],

  /**
   * Extrahiert Titel aus einem Namen-String (priorisiert längere Titel)
   * @param {string} text - Vollständiger Name
   * @returns {string} Extrahierte Titel als String
   */
  extractTitles(text) {
    if (!text) return "";
    const sorted = [...this.TITLES].sort((a, b) => b.length - a.length);
    const found = [];
    let processedText = text;

    for (const title of sorted) {
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedTitle}\\b`, "g");
      const matches = processedText.match(regex);

      if (matches) {
        matches.forEach(() => found.push(title));
        processedText = processedText.replace(regex, "");
      }
    }
    return found.join(" ");
  },

  /**
   * Generiert eine DIN-konforme Anrede
   * @param {Object} params - Empfängerdaten
   * @returns {string} Anrede-Text
   */
  derive({ firstName = "", lastName = "", company = "", type = "none", formality = "formal" }) {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const co = company.trim();
    const title = this.extractTitles(`${fn} ${ln}`);

    if (co && !fn && !ln) {
      return this.getFallback(formality);
    }

    const name = ln || fn;
    if (!name) {
      return this.getFallback(formality);
    }

    const titlePrefix = title ? `${title} ` : "";

    if (formality === "formal") {
      if (type === "female") return `Sehr geehrte Frau ${titlePrefix}${ln || fn},`;
      if (type === "male") return `Sehr geehrter Herr ${titlePrefix}${ln || fn},`;
      return "Sehr geehrte Damen und Herren,";
    }

    if (formality === "polite") {
      if (type === "female") return `Guten Tag Frau ${titlePrefix}${ln || fn},`;
      if (type === "male") return `Guten Tag Herr ${titlePrefix}${ln || fn},`;
      return `Guten Tag ${fn} ${ln},`.replace(/\s\s+/g, " ");
    }

    if (formality === "casual") {
      return `Hallo ${fn || ln},`;
    }

    return this.getFallback(formality);
  },

  /**
   * Generiert die passende Grußformel
   * @param {string} formality - "formal" | "polite" | "casual"
   * @returns {string}
   */
  getClosing(formality = "formal") {
    if (formality === "casual") return "Beste Grüße";
    if (formality === "polite") return "Herzliche Grüße";
    return "Mit freundlichen Grüßen";
  },

  /**
   * Validiert die Grußformel nach DIN 5008
   * @param {string} text - Grußformel-Text
   * @returns {Object} { isValid, warning? }
   */
  validateClosing(text) {
    if (!text) return { isValid: true };
    const trimmed = text.trim();
    if (trimmed.endsWith(",") || trimmed.endsWith(".")) {
      return {
        isValid: false,
        warning: "DIN 5008: Kein Komma oder Punkt nach der Grußformel."
      };
    }
    return { isValid: true };
  },

  getFallback(formality) {
    if (formality === "casual") return "Hallo zusammen,";
    if (formality === "polite") return "Guten Tag,";
    return "Sehr geehrte Damen und Herren,";
  }
};
