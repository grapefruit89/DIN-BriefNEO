/**
 * js/logic/logic.js â€” Pure Business Logic Engine
 * v4.0 Standard Specification | IMR 4.0 | DIN 5008:2020-03
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * ZERO DOM. ZERO State-Imports. Pure Input â†’ Output.
 *
 * IMR 4.0 (2026-03-28):
 *   readDOMasJSON() scannt <din-*> Tags direkt basierend auf IMR-Registry.
 *   textContent ist die alleinige Source of Truth (SSoT).
 */

import { IMR, AI_INTENTS } from "../core/constants.js";
export * from "./greetings.js";

/* â”€â”€ Date (TOMB-LEGACY-001: Temporal API Proof) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export {
  todayISO,
  formatDateTemporal as formatDate,
} from "../core/temporal-utils.js";

/**
 * Holt das aktuelle Datum deterministisch via Temporal API.
 * [ADR-011] Baseline Chrome 147+.
 */
export function getTodayTemporal() {
  // [CMD-1] Fixed: Temporal.Now.plainDateISO requires a timezone argument in Chrome 147
  // @ts-ignore
  return Temporal.Now.plainDateISO(Temporal.Now.timeZoneId());
}

const MONTHS_DE = [
  "Januar",
  "Februar",
  "MÃ¤rz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function parseDate(input) {
  if (!input) return null;
  const s = input.trim();

  // 1. DE Format: TT.MM.JJJJ
  const m1 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m1) {
    // @ts-ignore
    return Temporal.PlainDate.from({
      year: +m1[3],
      month: +m1[2],
      day: +m1[1],
    });
  }

  // 2. ISO Format: JJJJ-MM-TT
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) {
    // @ts-ignore
    try {
      return Temporal.PlainDate.from(s);
    } catch {
      /* next */
    }
  }

  // 3. Long Format: TT. Monat JJJJ
  const m3 = s.match(/^(\d{1,2})\.?\s+([^\s]+)\s+(\d{4})$/);
  if (m3) {
    const mi = MONTHS_DE.findIndex((mn) =>
      mn.toLowerCase().startsWith(m3[2].toLowerCase().substring(0, 3)),
    );
    if (mi !== -1) {
      // @ts-ignore
      return Temporal.PlainDate.from({
        year: +m3[3],
        month: mi + 1,
        day: +m3[1],
      });
    }
  }

  // 4. Fallback: Native Temporal.PlainDate.from
  try {
    // @ts-ignore
    return Temporal.PlainDate.from(s);
  } catch {
    return null;
  }
}

/* â”€â”€ Recipient Parsing (v4.0 V4 â€” Intl.Segmenter) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * [High-Integrity] Recipient Parser
 * Nutzt Intl.Segmenter fÃ¼r robuste Tokenisierung ohne Regex-Hell.
 */
export function parseRecipient(text) {
  if (!text)
    return { gender: "n", name: "", firstName: "", title: "", fullName: "" };

  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || "";

  // Segmentierung der ersten Zeile
  const segmenter = new Intl.Segmenter("de", { granularity: "word" });
  const segments = Array.from(segmenter.segment(firstLine));
  const tokens = segments.filter((s) => s.isWordLike).map((s) => s.segment);

  let gender = "n";
  let titles = [];
  let nameParts = [];

  const GENDER_MAP = {
    herr: "m",
    herrn: "m",
    frau: "f",
    familie: "fam",
    eheleute: "fam",
  };
  const TITLE_SET = new Set([
    "dr",
    "prof",
    "dipl",
    "mag",
    "ing",
    "h.c",
    "mult",
  ]);

  for (const token of tokens) {
    const lower = token.toLowerCase().replace(/\.$/, "");

    if (GENDER_MAP[lower]) {
      gender = GENDER_MAP[lower];
      continue;
    }

    if (TITLE_SET.has(lower)) {
      titles.push(token.endsWith(".") ? token : token + ".");
      continue;
    }

    nameParts.push(token);
  }

  const title = titles.join(" ");
  const name = nameParts.length ? nameParts[nameParts.length - 1] : "";
  const firstName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
  const fullName = [title, firstName, name].filter(Boolean).join(" ");

  return { gender, name, firstName, title, fullName };
}

/* â”€â”€ Precision Math (High-Integrity Guard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * [CMD-3] Zero-Loss Financial Calculation
 * Priority 1: Chrome 147+ Math.sumPrecise (Native LayoutNG Speed)
 * Priority 2: Cent-Based Fallback (No Float Drift)
 */
export const PrecisionMath = Object.freeze({
  sum(values) {
    if (!values || !Array.isArray(values)) return 0;

    // @ts-ignore - Chrome 147 Baseline
    if (typeof Math.sumPrecise === "function") {
      return Math.sumPrecise(values);
    }

    // Fallback: Fixed-Point Math in Cents
    const cents = values.reduce((acc, val) => acc + Math.round(val * 100), 0);
    return cents / 100;
  },
});

export function sumFinancials(values) {
  return PrecisionMath.sum(values);
}
/**
 * Berechnet die Millisekunden bis zum nächsten Themenwechsel (21:00 oder 06:00).
 */
export function getMsUntilNextThemeTransition() {
  // @ts-ignore
  const now = Temporal.Now.zonedDateTimeISO();
  const today = now.toPlainDate();
  
  const nightStart = today.toZonedDateTime({ plainTime: '21:00:00', timeZone: now.timeZoneId });
  const nightEnd   = today.toZonedDateTime({ plainTime: '06:00:00', timeZone: now.timeZoneId });

  // Mögliche Ziele finden (Heute oder Morgen)
  const candidates = [
    nightStart,
    nightStart.add({ days: 1 }),
    nightEnd,
    nightEnd.add({ days: 1 })
  ];

  // Nur zukünftige Zeiten nehmen und sortieren
  const future = candidates
    .filter(c => Temporal.ZonedDateTime.compare(c, now) > 0)
    .sort(Temporal.ZonedDateTime.compare);

  // Differenz zum nächsten Zeitpunkt
  return future[0].epochMilliseconds - now.epochMilliseconds;
}

/**
 * Prüft, ob die aktuelle Zeit im Nachtfenster (21:00 - 06:00) liegt.
 */
export function isNightTime() {
  // @ts-ignore
  const now = Temporal.Now.plainTimeISO();
  const nightStart = Temporal.PlainTime.from({ hour: 21 });
  const nightEnd = Temporal.PlainTime.from({ hour: 6 });

  // Da das Fenster über Mitternacht geht:
  // Wahr wenn: Zeit >= 21:00 ODER Zeit < 06:00
  return Temporal.PlainTime.compare(now, nightStart) >= 0 || 
         Temporal.PlainTime.compare(now, nightEnd) < 0;
}

/**
 * Berechnet Fristen basierend auf dem aktuellen Datum via Temporal API.
 */
export function calculateDeadlines() {
  // @ts-ignore
  const today = Temporal.Now.plainDateISO(Temporal.Now.timeZoneId());

  return {
    in14Days: today.add({ days: 14 }),
    in30Days: today.add({ days: 30 }),
    nextMonth: today.add({ months: 1 })
  };
}

/**
 * Erkennt den Kontext im Text für intelligente Vorschläge.
 * @param {string} text - Der aktuelle Brieftext
 */
export function detectContext(text) {
  if (!text) return 'none';
  const lower = text.toLowerCase();
  if (lower.includes('widerspruch') || lower.includes('einspruch')) return 'widerspruch';
  if (lower.includes('mahnung') || lower.includes('zahlungserinnerung')) return 'mahnung';
  if (lower.includes('kündigung')) return 'kuendigung';
  return 'standard';
}

/**
 * Validiert die Zeilenbelegung im Anschriftfeld (DIN 5008)
 * @param {Object} content - Der aktuelle Content-State
 * @returns {Object} - { isValid: boolean, lineCount: number }
 */
export function validateAddressZone(content) {
  if (!content) return { isValid: true, lineCount: 0 };

  // Relevante Felder für die 6-Zeilen-Regel
  const recipientKeys = [
    'supplement',
    'rect_co',
    'rect_fn', // Neu: Vorname
    'rect_ln', // Neu: Nachname
    'rect_st',
    'rect_city'
  ];
  
  const lineCount = recipientKeys.reduce((acc, key) => {
    return acc + (content[key]?.trim() ? 1 : 0);
  }, 0);

  return {
    isValid: lineCount <= 6,
    lineCount
  };
}

/* â”€â”€ Return Address (High-Integrity) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Leitet die RÃ¼cksende-Zeile (Einzeiler Ã¼ber dem EmpfÃ¤nger) ab.
 * @param {Object} data â€” { name, co, street, zipCity }
 */
export function deriveReturnLine({
  name = "",
  co = "",
  street = "",
  zipCity = "",
} = {}) {
  const abbr = (raw) => {
    if (!raw) return "";
    const clean = raw.replace(/^(Herr|Frau)\s+/i, "").trim();
    const parts = clean.split(/\s+/);
    return parts.length > 1 && !parts[0].includes(".")
      ? parts[0].charAt(0) + ". " + parts.slice(1).join(" ")
      : clean;
  };

  const namePart = co ? `${abbr(name)} (c/o ${co})` : abbr(name);
  return [namePart, street, zipCity].filter(Boolean).join(" Â· ");
}

/* â”€â”€ IBAN (High-Integrity BigInt) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * [High-Integrity] IBAN Validation
 * Verwendet BigInt fÃ¼r die Modulo-97 Berechnung (High-Integrity Precision).
 */
export function validateIBAN(raw) {
  if (!raw) return false;
  const clean = raw.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numericStr = "";
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      // A-Z
      numericStr += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      // 0-9
      numericStr += char;
    } else {
      return false;
    }
  }

  try {
    return BigInt(numericStr) % 97n === 1n;
  } catch {
    return false;
  }
}

/**
 * Formatiert IBAN in 4er BlÃ¶cke.
 */
export function formatIBAN(raw) {
  if (!raw) return "";
  const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") || clean;
}

/* â”€â”€ Markdown Engine (High-Integrity Ghost-Mirror) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function parseMarkdownToHTML(text) {
  if (!text) return "";

  // 1. Basic Escaping
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const tokens = [];
  const addToken = (htmlSnippet) => {
    const id = `__MD${tokens.length}__`;
    tokens.push({ id, html: htmlSnippet });
    return id;
  };

  // 2. Tokenize Patterns (Order: Blockquote -> Bold -> Underline -> Italic)
  // Blockquote: Erkennt > am Zeilenanfang oder nach einem \n
  html = html.replace(/(?:^|\n)\s*&gt;\s*(.+?)(?=\n|$)/g, (match, p1) => {
    const prefix = match.startsWith("\n") ? "\n" : "";
    return prefix + addToken(`<blockquote class="md-quote"><span class="md-marker">&gt;</span> ${p1}</blockquote>`);
  });

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, (match, p1) => 
    addToken(`<span class="md-marker">**</span><strong>${p1}</strong><span class="md-marker">**</span>`)
  );

  // Underline __text__
  html = html.replace(/__(.+?)__/g, (match, p1) => 
    addToken(`<span class="md-marker">__</span><u>${p1}</u><span class="md-marker">__</span>`)
  );

  // Italic *text*
  html = html.replace(/\*(.+?)\*/g, (match, p1) => 
    addToken(`<span class="md-marker">*</span><em>${p1}</em><span class="md-marker">*</span>`)
  );

  // 3. Detokenize (Recursively to handle nesting)
  let iterations = 0;
  while (html.includes("__MD") && iterations < 10) {
    tokens.forEach(t => {
      html = html.replace(t.id, t.html);
    });
    iterations++;
  }

  // 4. Line Breaks (Final step for rendering)
  html = html
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");

  return html;
}

/* â”€â”€ Akinator Engine 2.0 (IMR Tag-Scanner) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * SPEC-038 | CAA-008 | PLAN-010 | ADR-008
 *
 * TAG-SCAN PRINZIP:
 *   Kein getElementById(domId) mehr.
 *   DOM-Scan via document.querySelector(entry.tag).
 *   tag.slice(4).replace(/-/g,'_') â†’ JSON-Key automatisch.
 *
 * CEMETERY [TOMB-L007]: Alter Ansatz getElementById(entry.domId) â†’ entfernt.
 * CEMETERY [TOMB-L008]: richText-Flag â†’ entfernt. textContent ist IMMER SSoT.
 */

/**
 * Liest den aktuellen Brief-Inhalt aus dem DOM via IMR-Tag-Scan.
 *
 * [ADR-008] Liest IMMER textContent â€” nie innerHTML.
 * Begruendung (GEMINI.md Sektion XI):
 *   contenteditable="plaintext-only" garantiert, dass textContent === Nutzereingabe.
 *   innerHTML wuerde bei plaintext-only identisch sein, aber das Flag
 *   signalisiert explizit: "Kein HTML-Pfad". Ein richText-Flag ist
 *   nicht nur redundant â€” es ist eine Einladung zur Regression.
 *   Ghost-Mirror (<din-body-mirror>) hat kein contenteditable und
 *   wird von diesem Scanner nicht gelesen.
 *
 * @returns {Object} Kanonisches JSON-Objekt (IMR-Schema), leere Felder â†’ null
 */
export function readDOMasJSON() {
  const result = {};
  for (const entry of IMR) {
    const el = document.querySelector(entry.tag);
    if (!el) {
      result[entry.key] = null;
      continue;
    }
    // ADR-008: textContent IMMER. richText-Flag entfernt (TOMB-L008).
    const raw = el.textContent?.trim();
    result[entry.key] = raw || null;
  }
  return result;
}

/**
 * Findet ein spezifisches DIN-Tag-Element.
 * Kurzform: getTag('subject') â†’ document.querySelector('din-subject')
 * @param {string} key â€” IMR-Key (z.B. 'subject', 'your_ref')
 * @returns {Element|null}
 */
export function getTag(key) {
  const entry = IMR.find((e) => e.key === key);
  return entry ? document.querySelector(entry.tag) : null;
}

/**
 * Orchestrator: Verarbeitet ein KI-generiertes JSON-Objekt.
 * 1. Validiert Daten gegen IMR
 * 2. Aktualisiert die entsprechenden <din-*> Tags
 * 3. Fuehrt System-Intents aus (z.B. Print)
 *
 * @param {Object} json â€” KI-Output (IMR-Schema + intent)
 */
export function executeAIResponse(json) {
  if (!json || typeof json !== "object") return;

  console.group("ðŸ§  AI-Native Orchestrator: Execute Response");
  console.log("Input Protocol:", json);

  const auditTrail = [];

  // 1. Daten-Verteilung (Orchestration)
  for (const entry of IMR) {
    if (json.hasOwnProperty(entry.key)) {
      const el = document.querySelector(entry.tag);
      if (el) {
        const val = json[entry.key];
        if (val !== null) {
          el.textContent = val;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          auditTrail.push(`Updated <${entry.tag}> with data.`);
        }
      }
    }
  }

  // 2. Intent-Execution (Side Effects)
  const intent = json.intent;
  if (intent) {
    console.log("Active Intent detected:", intent);

    // Guard: Autonomous Control Check
    const paper = document.getElementById("paper");
    const isAutoConfigAllowed = paper?.dataset.autoConfig === "true";

    if (intent === AI_INTENTS.PRINT) {
      auditTrail.push("Triggered System Intent: PRINT");
      window.print();
    } else if (intent === AI_INTENTS.GHOST) {
      auditTrail.push("Triggered UI Intent: TOGGLE_GUIDES");
      if (paper) {
        paper.dataset.guides =
          paper.dataset.guides === "true" ? "false" : "true";
      }
    }
    // UI-Settings (Form A/B, Formal/Casual) â€” MANDATE-000 Guard
    else if (
      [
        AI_INTENTS.LAYOUT_A,
        AI_INTENTS.LAYOUT_B,
        AI_INTENTS.FORMAL,
        AI_INTENTS.CASUAL,
      ].includes(intent)
    ) {
      if (isAutoConfigAllowed && paper) {
        if (intent === AI_INTENTS.LAYOUT_A) {
          paper.style.setProperty("--layout", "form-a");
          auditTrail.push("Applied AI-Layout: Form A");
        }
        if (intent === AI_INTENTS.LAYOUT_B) {
          paper.style.setProperty("--layout", "form-b");
          auditTrail.push("Applied AI-Layout: Form B");
        }
        if (intent === AI_INTENTS.FORMAL) {
          paper.dataset.formality = "formal";
          auditTrail.push("Applied AI-Formality: formal");
        }
        if (intent === AI_INTENTS.CASUAL) {
          paper.dataset.formality = "casual";
          auditTrail.push("Applied AI-Formality: casual");
        }
      } else {
        const msg = `AI suggested UI-Change (${intent}), but Auto-Config is DISABLED (Autonomousty Guard).`;
        console.warn(msg);
        auditTrail.push(msg);
      }
    }
  }

  console.log("Audit Trail:", auditTrail);
  console.groupEnd();
}

/**
 * Baut den Interview-Prompt (leerer Brief).
 * Semantic-Emphasis: Benennt die <din-*> Tags explizit.
 */
export function buildInterviewPrompt() {
  const tagAnnotated = IMR.map(
    (e) => `  "${e.key}": null   // <${e.tag}>`,
  ).join(",\n");

  return `# DIN-BriefNEO â€” High-Integrity Interview Mode
# IMR 4.0 Specification | v4.0 Standard

You are an assistant for professional correspondence based on DIN 5008:2020-03.
This system is High-Integrity â€” every JSON key corresponds EXACTLY to a 
physical millimeter field on the A4 page (Custom HTML tag).

## Canonical Schema (IMR 4.0 â€” use EXACTLY these keys)
\```json
{
  "intent":     null,   // System Action (e.g., "action:print", "action:save_local")
${tagAnnotated}
}
\```

## System-Intents (Optional)
Once the letter is complete, you can trigger actions via the "intent" key:
- "${AI_INTENTS.PRINT}": Opens print dialog immediately
- "${AI_INTENTS.SAVE}":  Persists state to local storage
- "${AI_INTENTS.GHOST}": Toggles layout guide lines

## Technical Rules
- Output ALL keys â€” empty fields as \`null\`, do not omit
- \`salutation\`: Full DIN salutation ("Sehr geehrter Herr Mustermann,")
- \`greeting\`: NO punctuation at the end (DIN 5008 compliance)
- \`subject\`: Concise, max 1 line
- \`sender_*\`: Granular identity atoms (FirstName, LastName, Street, City)
- \`rect_*\`: Granular recipient atoms (Company, Name, Street, City)

## Markdown Usage (STRICT)
ALLOWED: Only in "body" field: *italic*, **bold**, > Blockquote, \`code\`, Lists
FORBIDDEN: Markdown in all other fields. Use pure plaintext.

## Example: Granular Identity
Input: "Max Mustermann, Musterstr. 42, 12345 Berlin"
Output: sender_fn="Max", sender_ln="Mustermann", sender_st="MusterstraÃŸe 42", sender_city="12345 Berlin"

## Task
Ask a maximum of 5 targeted questions (Recipient, Purpose, Tone, Deadlines, Attachments).
Then generate the complete letter as JSON.
Begin with Question 1.`;
}

/**
 * Baut den Optimierungs-Prompt (gefuellter Brief).
 * Zeigt physischen Tag-Kontext fuer jedes Feld.
 */
export function buildOptimizationPrompt() {
  const current = readDOMasJSON();

  const rows = IMR.map(({ key, tag }) => {
    const val = current[key];
    const display = val ? JSON.stringify(val).substring(0, 80) : "null";
    return `  "${key}": ${display}   // <${tag}>`;
  }).join(",\n");

  return `# DIN-BriefNEO â€” Optimization Mode
# IMR 4.0 Specification | v4.0 Standard

Optimize the following DIN 5008 draft.
Every key is directly mapped to an HTML tag on the page.

## Current State (Tag â†” JSON)
\```json
{
  "intent": null,
${rows}
}
\```

## System-Intents (Optional)
You can trigger actions via the "intent" key:
- "${AI_INTENTS.PRINT}": Opens print dialog immediately
- "${AI_INTENTS.SAVE}":  Persists state to local storage

## Markdown Rule
ONLY "body" may contain Markdown. All other fields: Plaintext only.

## Review Criteria
- Subject (<din-subject>): Concise, clear
- Salutation (<din-anrede>): Correct DIN form
- Body (<din-text>): Structure, tone, completeness
- Greeting (<din-grussformel>): NO punctuation at the end (DIN 5008)
- Footer (<din-fusszeile>): Legal/Bank details if required.

## Output
Vollstaendiges JSON mit ALLEN IMR-Keys. Kurze Begruendung (3 Saetze) danach.
`;
}

/**
 * Scannt Plaintext nach Markdown-Markern und liefert Ranges fÃ¼r das Highlighting.
 * Chrome 147 Baseline: Nutzt native Range-Objekte fÃ¼r CSS Custom Highlight API.
 */
export function getMarkdownRanges(text, textNode) {
  if (!text || !textNode) return { bold: [], italic: [], marker: [] };

  const boldRanges = [];
  const italicRanges = [];
  const markerRanges = [];

  const scan = (regex, type) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      const mLen = match[1].length;

      try {
        const range = new Range();
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        if (type === "bold") boldRanges.push(range);
        if (type === "italic") italicRanges.push(range);

        // Marker (die Sternchen/Unterstriche selbst)
        const m1 = new Range();
        m1.setStart(textNode, start);
        m1.setEnd(textNode, start + mLen);
        const m2 = new Range();
        m2.setStart(textNode, end - mLen);
        m2.setEnd(textNode, end);
        markerRanges.push(m1, m2);
      } catch (e) {
        console.warn("Highlight Range Error:", e);
      }
    }
  };

  // 1. Bold (**)
  scan(/(\*\*)(.*?)\1/g, "bold");
  // 2. Italic (*)
  scan(/(\*)(.*?)\1/g, "italic");
  // 3. Underline (__)
  scan(/(__)(.*?)\1/g, "bold"); // Wir mappen Underline auf Bold fÃ¼r DIN-Zwecke

  return { bold: boldRanges, italic: italicRanges, marker: markerRanges };
}

