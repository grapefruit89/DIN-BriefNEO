// @ts-check
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the generated dataset
const datasetPath = path.join(__dirname, '../research_results/de_vornamen_gender.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

const MALE_NAMES = new Set(dataset.m);
const FEMALE_NAMES = new Set(dataset.f);

function normalizeFormality(f) {
  const map = {
    formal: "formal", förmlich: "formal", foermlich: "formal",
    polite: "polite", höflich: "polite", hoeflich: "polite",
    casual: "casual", modern: "casual", locker: "casual",
  };
  return map[(f || "").toLowerCase()] || "formal";
}

export const SalutationPairsEngine = {
  CLOSING_VARIANTS: {
    formal: [
      "Mit freundlichen Grüßen",
      "Freundliche Grüße",
      "Mit freundlichem Gruß",
      "Hochachtungsvoll",
      "Mit verbindlichen Grüßen"
    ],
    polite: [
      "Viele Grüße",
      "Beste Grüße",
      "Herzliche Grüße",
      "Mit besten Grüßen"
    ],
    casual: [
      "Beste Grüße",
      "Liebe Grüße",
      "Viele liebe Grüße",
      "Herzlichst",
      "Alles Liebe"
    ]
  },

  getClosingVariants(formality = "formal", { recipientCity = "", senderCity = "" } = {}) {
    const style = normalizeFormality(formality);
    const baseList = [...(this.CLOSING_VARIANTS[style] || this.CLOSING_VARIANTS.formal)];

    // Smart Local Touch (Büro-Kaizen / ChannelPartner)
    if (recipientCity && recipientCity.trim()) {
      const city = recipientCity.trim();
      if (style === "polite") {
        baseList.push(`Beste Grüße nach ${city}`);
      } else if (style === "casual") {
        baseList.push(`Liebe Grüße nach ${city}`);
      }
    }

    if (senderCity && senderCity.trim()) {
      const city = senderCity.trim();
      if (style === "polite") {
        baseList.push(`Viele Grüße aus ${city}`);
      }
    }

    return baseList;
  },

  getDefaultClosing(formality = "formal") {
    const style = normalizeFormality(formality);
    return this.CLOSING_VARIANTS[style][0];
  }
};

// === TEST PAIRINGS ===
console.log("=== CLOSING PAIRINGS & VARIANTS TEST ===");

const styles = ["formal", "polite", "casual"];
for (const s of styles) {
  console.log(`\nFormality: [${s}]`);
  console.log("  Default Closing:", SalutationPairsEngine.getDefaultClosing(s));
  const variants = SalutationPairsEngine.getClosingVariants(s, { recipientCity: "Heiden", senderCity: "Bonn" });
  console.log("  Available Variants:");
  variants.forEach((v, i) => console.log(`    ${i + 1}. "${v}"`));
}
