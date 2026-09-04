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

const SalutationEngine = {
  CLOSINGS: Object.freeze({
    formal: "Mit freundlichen Grüßen",
    polite: "Freundliche Grüße",
    casual: "Beste Grüße"
  }),

  derive({ rawName = "", rawCompany = "", formality = "formal" } = {}) {
    const style = normalizeFormality(formality);
    const text = (rawName || "").trim();
    const company = (rawCompany || "").trim();

    if (!text || (company && !text)) {
      return this.getFallback(style);
    }

    let gender = "none";
    let nameWithoutPrefix = text;
    const prefixMatch = text.match(/^(herrn?|frau)\b\s*/i);
    if (prefixMatch) {
      gender = prefixMatch[1].toLowerCase().startsWith("herr") ? "male" : "female";
      nameWithoutPrefix = text.slice(prefixMatch[0].length).trim();

      if (!nameWithoutPrefix) {
        if (style === "casual") return "Hallo,";
        if (style === "polite") return gender === "female" ? "Guten Tag Frau," : "Guten Tag Herr,";
        return gender === "female" ? "Sehr geehrte Frau," : "Sehr geehrter Herr,";
      }
    }

    // 80/20 B2B: Strip titles in default salutation (user requested: ohne Titel)
    const cleanName = nameWithoutPrefix.replace(/(?:^|\s)(Prof\.\s*Dr\.|Prof\.|Dr\.)(?:\s+|$)/gi, ' ').trim();

    const parts = cleanName.split(/\s+/).filter(Boolean);
    const lastName = parts.length > 1 ? parts.pop() || "" : parts[0] || "";
    const firstName = parts.join(" ");

    if (gender === "none") {
      const checkWord = (firstName || lastName).toLowerCase().split(/[\s-]+/)[0];
      if (MALE_NAMES.has(checkWord)) gender = "male";
      else if (FEMALE_NAMES.has(checkWord)) gender = "female";
    }

    if (style === "formal") {
      if (gender === "female") return `Sehr geehrte Frau ${lastName},`;
      if (gender === "male") return `Sehr geehrter Herr ${lastName},`;
      return "Sehr geehrte Damen und Herren,";
    }

    if (style === "polite") {
      if (gender === "female") return `Guten Tag Frau ${lastName},`;
      if (gender === "male") return `Guten Tag Herr ${lastName},`;
      return "Guten Tag,";
    }

    // Casual
    if (firstName) return `Hallo ${firstName},`;
    if (lastName) return `Hallo ${lastName},`;
    return "Hallo,";
  },

  getClosing(formality = "formal") {
    const style = normalizeFormality(formality);
    return this.CLOSINGS[style] || this.CLOSINGS.formal;
  },

  getFallback(formality = "formal") {
    const style = normalizeFormality(formality);
    if (style === "casual") return "Hallo,";
    if (style === "polite") return "Guten Tag,";
    return "Sehr geehrte Damen und Herren,";
  }
};

// === RUN 80/20 B2B TESTS ===
console.log("=== 1. PURE 80/20 B2B PAIRINGS TEST ===");
const cases = [
  { name: "herr ", formality: "formal", expectedSal: "Sehr geehrter Herr,", expectedClose: "Mit freundlichen Grüßen" },
  { name: "frau ", formality: "formal", expectedSal: "Sehr geehrte Frau,", expectedClose: "Mit freundlichen Grüßen" },
  { name: "Herr Müller", formality: "formal", expectedSal: "Sehr geehrter Herr Müller,", expectedClose: "Mit freundlichen Grüßen" },
  { name: "Herr Dr. Thomas Müller", formality: "formal", expectedSal: "Sehr geehrter Herr Müller,", expectedClose: "Mit freundlichen Grüßen" },
  { name: "Frau Prof. Dr. Julia Kroll", formality: "formal", expectedSal: "Sehr geehrte Frau Kroll,", expectedClose: "Mit freundlichen Grüßen" },
  { name: "Herr Müller", formality: "polite", expectedSal: "Guten Tag Herr Müller,", expectedClose: "Freundliche Grüße" },
  { name: "Sabine Becker", formality: "polite", expectedSal: "Guten Tag Frau Becker,", expectedClose: "Freundliche Grüße" },
  { name: "Thomas Meier", formality: "casual", expectedSal: "Hallo Thomas,", expectedClose: "Beste Grüße" },
  { name: "Siemens AG", formality: "formal", expectedSal: "Sehr geehrte Damen und Herren,", expectedClose: "Mit freundlichen Grüßen" },
];

let allPassed = true;
for (const c of cases) {
  const sal = SalutationEngine.derive({ rawName: c.name, formality: c.formality });
  const close = SalutationEngine.getClosing(c.formality);
  const okSal = sal === c.expectedSal;
  const okClose = close === c.expectedClose;
  if (!okSal || !okClose) allPassed = false;
  console.log(`[${okSal && okClose ? 'PASS' : 'FAIL'}] '${c.name}' [${c.formality}]`);
  console.log(`  -> Anrede: "${sal}"`);
  console.log(`  -> Gruß:   "${close}"`);
}

console.log("\n=== 2. CONTENTEDITABLE MANUAL OVERRIDE TEST ===");
class MockElement {
  constructor(id, text = "") {
    this.id = id;
    this.textContent = text;
    this.dataset = {};
  }
}

const mockAnrede = new MockElement("anrede", "Sehr geehrter Herr Müller,");
mockAnrede.dataset.generated = "true";
let settings = { formality: "formal", salutationDirty: false };

function regenerate(force = false) {
  if (!force && (settings.salutationDirty || mockAnrede.dataset.dirty === "true")) {
    return false;
  }
  mockAnrede.textContent = SalutationEngine.derive({ rawName: mockRecipient.textContent, formality: settings.formality });
  mockAnrede.dataset.generated = "true";
  return true;
}

const mockRecipient = new MockElement("empfaenger-name", "Herr Müller");

// Manual edit: user writes special greeting
mockAnrede.textContent = "Sehr geehrte Frau Müller, sehr geehrter Herr Müller,";
mockAnrede.dataset.dirty = "true";
settings.salutationDirty = true;

// Try to trigger auto-regeneration by changing recipient
mockRecipient.textContent = "Herr Schmidt";
const didOverwrite = regenerate();
console.log("Overwrite attempted after manual edit:", didOverwrite ? "OVERWRITTEN (BUG!)" : "PROTECTED (OK)");
console.log("Current text in <din-anrede>:", mockAnrede.textContent);

// Reset: user clears field
mockAnrede.textContent = "";
delete mockAnrede.dataset.dirty;
settings.salutationDirty = false;
regenerate(true);
console.log("After auto-reset (clearing field):", mockAnrede.textContent);

if (allPassed && !didOverwrite) {
  console.log("\n>>> ALL 80/20 B2B TESTS PASSED WITH 100% SUCCESS <<<");
}
