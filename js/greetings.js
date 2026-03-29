/**
 * js/greetings.js — v4.0 Salutation Engine (Refined)
 * High-Integrity v4.0 | Chrome 147 Baseline
 * ─────────────────────────────────────────────────────────────
 */

export const GreetingsMatrix = {
  settings: {
    fallback: "Sehr geehrte Damen und Herren,",
  },
  /**
   * [MANDATE-GREETING] Radikal flache Logik: M/F/U Erkennung.
   * KEINE akademischen Titel (Dr./Prof.).
   * Erkennt Adelstitel und Formality.
   */
  process: (text, formality = "formal") => {
    if (!text) return GreetingsMatrix.settings.fallback;

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return GreetingsMatrix.settings.fallback;

    const firstLine = lines[0];
    const lowerFirstLine = firstLine.toLowerCase();

    // Titel-Filter (High-Integrity Purge)
    const TITLES = [
      "dr.",
      "dr",
      "prof.",
      "prof",
      "dipl.",
      "dipl",
      "ing.",
      "ing",
      "habil",
      "habil.",
    ];

    // AdelsprÃ¤dikate und Namensbestandteile
    const NOBLE_PARTS = ["von", "van", "zu", "der", "die", "de", "do"];

    // Tokenisierung
    let tokens = firstLine.split(/\s+/);

    // 1. Titel entfernen
    tokens = tokens.filter(
      (t) => !TITLES.includes(t.toLowerCase().replace(/\.$/, "")),
    );

    // 2. Anrede-Erkennung
    let gender = "u"; // unknown
    if (tokens.some((t) => t.toLowerCase() === "herr")) gender = "m";
    else if (tokens.some((t) => t.toLowerCase() === "frau")) gender = "f";
    else if (
      tokens.some(
        (t) => t.toLowerCase() === "familie" || t.toLowerCase() === "eheleute",
      )
    )
      gender = "g"; // group

    // 3. Nachnamen-Extraktion (Alles nach der Anrede)
    let nameParts = [];
    let startCollecting = false;

    for (const token of tokens) {
      const lowToken = token.toLowerCase();
      if (["herr", "frau", "familie", "eheleute"].includes(lowToken)) {
        startCollecting = true;
        continue;
      }
      if (startCollecting) {
        nameParts.push(token);
      }
    }

    const lastName = nameParts.join(" ");

    // 4. Matrix-Dispatch
    if (gender === "m") {
      if (formality === "casual") return `Hallo ${lastName || "unbekannt"},`;
      if (formality === "polite") return `Guten Tag Herr ${lastName},`;
      return `Sehr geehrter Herr ${lastName},`;
    }
    if (gender === "f") {
      if (formality === "casual") return `Hallo ${lastName || "unbekannt"},`;
      if (formality === "polite") return `Guten Tag Frau ${lastName},`;
      return `Sehr geehrte Frau ${lastName},`;
    }
    if (gender === "g") {
      return `Sehr geehrte Familie ${lastName},`;
    }

    return GreetingsMatrix.settings.fallback;
  },
};

/**
 * [SPEC-002] Hybrid-Adapter: Aktualisiert Placeholder/Content.
 */
export function updateSalutationHint(
  el,
  analysis,
  formality,
  recipientType,
  currentText = null,
) {
  if (!el || el.dataset.auto === "false") return;

  const textToProcess =
    currentText !== null
      ? currentText
      : document.querySelector("din-empfaenger-name")?.textContent || "";
  const sal = GreetingsMatrix.process(textToProcess, formality);

  el.dataset.placeholder = sal;

  if (!el.textContent.trim()) {
    el.textContent = sal;
  }
}

export const GREETING_MAP = {
  formal: "Mit freundlichen GrÃ¼ÃŸen",
  polite: "Freundliche GrÃ¼ÃŸe",
  casual: "Viele GrÃ¼ÃŸe",
};

export function deriveSalutation(analysis, formality, recipientType) {
  const recipientEl = document.querySelector("din-empfaenger-name");
  return GreetingsMatrix.process(
    recipientEl ? recipientEl.textContent : "",
    formality,
  );
}

export function deriveGreeting(formality = "formal") {
  return GREETING_MAP[formality] || GREETING_MAP.formal;
}
