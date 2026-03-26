/**
 * js/logic/logic.js — Pure Business Logic Engine
 * DIN-BriefNEO · Platinum V14 | SPEC-002, SPEC-007, CAA-008, PLAN-010, ADR-008
 * ─────────────────────────────────────────────────────────────────────────────
 * ZERO DOM. ZERO State-Imports. Pure Input → Output.
 *
 * IMR 2.0 (2026-03-20 / PLAN-010):
 *   readDOMasJSON() scannt <din-*> Tags direkt.
 *   Kein domId-Lookup mehr — tag.slice(4) IS der Key.
 *   Normalisierung: "din-your-ref" → "your_ref" (Bindestrich→Unterstrich)
 *
 * ADR-008 (2026-03-20):
 *   readDOMasJSON() liest IMMER textContent, nie innerHTML (TOMB-L008).
 *   richText-Flag aus IMR entfernt. Ghost-Mirror ist die einzige
 *   Formatierungs-Visualisierung — sie wird hier nicht gelesen.
 */

import { IMR, AI_INTENTS } from '../core/constants.js';
export * from './greetings.js';

/* ── Hilfsfunktion: Tag-Name → JSON-Key ──────────────────────── */
// "din-your-ref" → "your_ref"  |  "din-body" → "body"
const tagToKey = tag => tag.toLowerCase().slice(4).replace(/-/g, '_');

/* ── Date (TOMB-LEGACY-001: Temporal API Proof) ───────────────── */

export { todayISO, formatDateTemporal as formatDate } from '../core/temporal-utils.js';

/**
 * Holt das aktuelle Datum deterministisch via Temporal API.
 * [ADR-011] Baseline Chrome 147+.
 */
export function getTodayTemporal() {
  // @ts-ignore
  return Temporal.Now.plainDateISO();
}

const MONTHS_DE = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
];

export function parseDate(input) {
  if (!input) return null;
  const s = input.trim();

  // 1. DE Format: TT.MM.JJJJ
  const m1 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m1) {
    // @ts-ignore
    return Temporal.PlainDate.from({ year: +m1[3], month: +m1[2], day: +m1[1] });
  }

  // 2. ISO Format: JJJJ-MM-TT
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) {
    // @ts-ignore
    try { return Temporal.PlainDate.from(s); } catch { /* next */ }
  }

  // 3. Long Format: TT. Monat JJJJ
  const m3 = s.match(/^(\d{1,2})\.?\s+([^\s]+)\s+(\d{4})$/);
  if (m3) {
    const mi = MONTHS_DE.findIndex(mn =>
      mn.toLowerCase().startsWith(m3[2].toLowerCase().substring(0,3)));
    if (mi !== -1) {
      // @ts-ignore
      return Temporal.PlainDate.from({ year: +m3[3], month: mi + 1, day: +m3[1] });
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

/* ── Recipient Parsing (Platinum V4 — Intl.Segmenter) ────────── */

/**
 * [AVIATION GRADE] Recipient Parser 
 * Nutzt Intl.Segmenter für robuste Tokenisierung ohne Regex-Hell.
 */
export function parseRecipient(text) {
  if (!text) return { gender:'n', name:'', firstName:'', title:'', fullName:'' };
  
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || '';
  
  // Segmentierung der ersten Zeile
  const segmenter = new Intl.Segmenter('de', { granularity: 'word' });
  const segments = Array.from(segmenter.segment(firstLine));
  const tokens = segments.filter(s => s.isWordLike).map(s => s.segment);

  let gender = 'n';
  let titles = [];
  let nameParts = [];

  const GENDER_MAP = { 'herr': 'm', 'herrn': 'm', 'frau': 'f', 'familie': 'fam', 'eheleute': 'fam' };
  const TITLE_SET = new Set(['dr', 'prof', 'dipl', 'mag', 'ing', 'h.c', 'mult']);

  for (const token of tokens) {
    const lower = token.toLowerCase().replace(/\.$/, '');
    
    if (GENDER_MAP[lower]) {
      gender = GENDER_MAP[lower];
      continue;
    }
    
    if (TITLE_SET.has(lower)) {
      titles.push(token.endsWith('.') ? token : token + '.');
      continue;
    }

    nameParts.push(token);
  }

  const title = titles.join(' ');
  const name = nameParts.length ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const fullName = [title, firstName, name].filter(Boolean).join(' ');

  return { gender, name, firstName, title, fullName };
}

/* ── Precision Math (Aviation Grade Guard) ────────────────────── */

/**
 * [CMD-3] Zero-Loss Financial Calculation
 * Priority 1: Chrome 147+ Math.sumPrecise (Native LayoutNG Speed)
 * Priority 2: Cent-Based Fallback (No Float Drift)
 */
export const AviationMath = Object.freeze({
  sum(values) {
    if (!values || !Array.isArray(values)) return 0;
    
    // @ts-ignore - Chrome 147 Baseline
    if (typeof Math.sumPrecise === 'function') {
      return Math.sumPrecise(values);
    }

    // Fallback: Fixed-Point Math in Cents
    const cents = values.reduce((acc, val) => acc + Math.round(val * 100), 0);
    return cents / 100;
  }
});

export function sumFinancials(values) {
    return AviationMath.sum(values);
}

/* ── Return Address (Aviation Grade) ─────────────────────────── */

/**
 * Leitet die Rücksende-Zeile (Einzeiler über dem Empfänger) ab.
 * @param {Object} data — { name, co, street, zipCity }
 */
export function deriveReturnLine({ name = '', co = '', street = '', zipCity = '' } = {}) {
  const abbr = raw => {
    if (!raw) return '';
    const clean = raw.replace(/^(Herr|Frau)\s+/i,'').trim();
    const parts = clean.split(/\s+/);
    return (parts.length > 1 && !parts[0].includes('.'))
      ? parts[0].charAt(0) + '. ' + parts.slice(1).join(' ')
      : clean;
  };

  const namePart = co ? `${abbr(name)} (c/o ${co})` : abbr(name);
  return [namePart, street, zipCity].filter(Boolean).join(' · ');
}

/* ── IBAN (Aviation Grade BigInt) ────────────────────────────── */

/**
 * [AVIATION GRADE] IBAN Validation
 * Verwendet BigInt für die Modulo-97 Berechnung (Aviation Grade Precision).
 */
export function validateIBAN(raw) {
  if (!raw) return false;
  const clean = raw.replace(/\s+/g, '').toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;
  
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numericStr = '';
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // A-Z
      numericStr += (code - 55).toString();
    } else if (code >= 48 && code <= 57) { // 0-9
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
 * Formatiert IBAN in 4er Blöcke.
 */
export function formatIBAN(raw) {
  if (!raw) return '';
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

/* ── Akinator Engine 2.0 (IMR Tag-Scanner) ───────────────────────
 * SPEC-038 | CAA-008 | PLAN-010 | ADR-008
 *
 * TAG-SCAN PRINZIP:
 *   Kein getElementById(domId) mehr.
 *   DOM-Scan via document.querySelector(entry.tag).
 *   tag.slice(4).replace(/-/g,'_') → JSON-Key automatisch.
 *
 * CEMETERY [TOMB-L007]: Alter Ansatz getElementById(entry.domId) → entfernt.
 * CEMETERY [TOMB-L008]: richText-Flag → entfernt. textContent ist IMMER SSoT.
 */

/**
 * Liest den aktuellen Brief-Inhalt aus dem DOM via IMR-Tag-Scan.
 *
 * [ADR-008] Liest IMMER textContent — nie innerHTML.
 * Begruendung (GEMINI.md Sektion XI):
 *   contenteditable="plaintext-only" garantiert, dass textContent === Nutzereingabe.
 *   innerHTML wuerde bei plaintext-only identisch sein, aber das Flag
 *   signalisiert explizit: "Kein HTML-Pfad". Ein richText-Flag ist
 *   nicht nur redundant — es ist eine Einladung zur Regression.
 *   Ghost-Mirror (<din-body-mirror>) hat kein contenteditable und
 *   wird von diesem Scanner nicht gelesen.
 *
 * @returns {Object} Kanonisches JSON-Objekt (IMR-Schema), leere Felder → null
 */
export function readDOMasJSON() {
  const result = {};
  for (const entry of IMR) {
    const el = document.querySelector(entry.tag);
    if (!el) { result[entry.key] = null; continue; }
    // ADR-008: textContent IMMER. richText-Flag entfernt (TOMB-L008).
    const raw = el.textContent?.trim();
    result[entry.key] = raw || null;
  }
  return result;
}

/**
 * Findet ein spezifisches DIN-Tag-Element.
 * Kurzform: getTag('subject') → document.querySelector('din-subject')
 * @param {string} key — IMR-Key (z.B. 'subject', 'your_ref')
 * @returns {Element|null}
 */
export function getTag(key) {
  const entry = IMR.find(e => e.key === key);
  return entry ? document.querySelector(entry.tag) : null;
}

/**
 * Orchestrator: Verarbeitet ein KI-generiertes JSON-Objekt.
 * 1. Validiert Daten gegen IMR
 * 2. Aktualisiert die entsprechenden <din-*> Tags
 * 3. Fuehrt System-Intents aus (z.B. Print)
 * 
 * @param {Object} json — KI-Output (IMR-Schema + intent)
 */
export function executeAIResponse(json) {
  if (!json || typeof json !== 'object') return;

  console.group('🧠 AI-Native Orchestrator: Execute Response');
  console.log('Input Protocol:', json);

  const auditTrail = [];

  // 1. Daten-Verteilung (Orchestration)
  for (const entry of IMR) {
    if (json.hasOwnProperty(entry.key)) {
      const el = document.querySelector(entry.tag);
      if (el) {
        const val = json[entry.key];
        if (val !== null) {
          el.textContent = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          auditTrail.push(`Updated <${entry.tag}> with data.`);
        }
      }
    }
  }

  // 2. Intent-Execution (Side Effects)
  const intent = json.intent;
  if (intent) {
    console.log('Active Intent detected:', intent);

    // Guard: Sovereign Control Check
    const paper = document.getElementById('paper');
    const isAutoConfigAllowed = paper?.dataset.autoConfig === 'true';

    if (intent === AI_INTENTS.PRINT) {
      auditTrail.push('Triggered System Intent: PRINT');
      window.print();
    } else if (intent === AI_INTENTS.GHOST) {
      auditTrail.push('Triggered UI Intent: TOGGLE_GUIDES');
      if (paper) {
        paper.dataset.guides = (paper.dataset.guides === 'true') ? 'false' : 'true';
      }
    } 
    // UI-Settings (Form A/B, Formal/Casual) — MANDATE-000 Guard
    else if ([AI_INTENTS.LAYOUT_A, AI_INTENTS.LAYOUT_B, AI_INTENTS.FORMAL, AI_INTENTS.CASUAL].includes(intent)) {
      if (isAutoConfigAllowed && paper) {
        if (intent === AI_INTENTS.LAYOUT_A) { paper.style.setProperty('--layout', 'form-a'); auditTrail.push('Applied AI-Layout: Form A'); }
        if (intent === AI_INTENTS.LAYOUT_B) { paper.style.setProperty('--layout', 'form-b'); auditTrail.push('Applied AI-Layout: Form B'); }
        if (intent === AI_INTENTS.FORMAL)   { paper.dataset.formality = 'formal'; auditTrail.push('Applied AI-Formality: formal'); }
        if (intent === AI_INTENTS.CASUAL)   { paper.dataset.formality = 'casual'; auditTrail.push('Applied AI-Formality: casual'); }
      } else {
        const msg = `AI suggested UI-Change (${intent}), but Auto-Config is DISABLED (Sovereignty Guard).`;
        console.warn(msg);
        auditTrail.push(msg);
      }
    }
  }

  console.log('Audit Trail:', auditTrail);
  console.groupEnd();
}

/**
 * Baut den Interview-Prompt (leerer Brief).
 * Semantic-Emphasis: Benennt die <din-*> Tags explizit.
 * Few-Shot Beispiele aus .brain/12_akinator_logic.md Sektion B.
 */
export function buildInterviewPrompt() {
  const tagAnnotated = IMR.map(e =>
    `  "${e.key}": null   // <${e.tag}>`
  ).join(',\n');

  return `# DIN-BriefNEO — Aviation Grade Interview-Modus
# Isomorphic Master Registry 2.0 | CAA-008 | ADR-008 | PLAN-010

Du bist ein Assistent fuer professionelle Geschaeftskorrespondenz nach DIN 5008:2020-03.
Dieses System ist Aviation Grade — jeder JSON-Key entspricht EXAKT einem
physischen Millimeter-Feld auf dem DIN-A4-Blatt (Custom HTML-Tag).

## Kanonisches Schema (IMR 2.0 — EXAKT diese Keys)
\```json
{
  "intent":     null,   // [NEU] System-Aktion (z.B. "action:print", "action:save_local")
${tagAnnotated}
}
\```

## System-Intents (Optional)
Wenn du den Brief fertiggestellt hast, kannst du folgende Aktionen via "intent"-Key ausloesen:
- "${AI_INTENTS.PRINT}": Oeffnet sofort den Druckdialog
- "${AI_INTENTS.SAVE}":  Sichert den Stand im lokalen Speicher
- "${AI_INTENTS.GHOST}": Schaltet Falzmarken-Hilfslinien ein/aus

## Pflicht-Regeln
- ALLE Keys ausgeben — leere Felder als \`null\`, nicht weglassen
- \`salutation\`: Vollstaendige DIN-Anrede ("Sehr geehrter Herr Mustermann,")
- \`greeting\`: KEIN Satzzeichen am Ende (DIN 5008 §6.3)
- \`subject\`: Praegnant, max. 1 Zeile, keine Abkuerzungen
- \`sender\`: Einzeiler im Format "V. Nachname · Straße Nr. · PLZ Ort"

## Markdown-Verwendungsregel (STRIKT)
ERLAUBT: Nur im "body"-Feld: *kursiv*, **fett**, ~~gestrichen**, > Zitat, \`code\`, Listen, Tabellen
VERBOTEN: Markdown in sender, note, recipient, date, your_ref, our_ref,
          subject, salutation, greeting, signature, footer. Dort: reiner Plaintext.

## Few-Shot Beispiel 1 — Impressum → sender
Input: "Max Mustermann GmbH, Musterstr. 42, 12345 Berlin, USt-ID: DE123"
Output sender: "M. Mustermann GmbH · Musterstraße 42 · 12345 Berlin"
Regel: Einzeiler, Name abgekuerzt, kein Impressum-Overhead.

## Few-Shot Beispiel 2 — WhatsApp → Formaler Brief
Input: "hey ich brauch nen brief, mein vermieter soll kaution zurueckzahlen, 3 monate nichts gehört"
Output: Vollstaendiges JSON mit § 548 BGB Referenz, berechneter 14-Tage-Frist,
        formaler Anrede, Markdown-Freiheit nur in body.

## Few-Shot Beispiel 3 — Angebot mit Referenzzeilen
Input: "Angebot Webdev fuer Berger AG, Unsere Ref: NX-044, Ihre Anfrage 15.03."
Output: your_ref="Anfrage vom 15.03.2026", our_ref="NX-044", subject="Angebot Webentwicklung",
        Markdown-Tabelle mit Preisen im body.

## Aufgabe
Stelle mir maximal 5 gezielte Fragen (Empfaenger, Anlass, Ton, Fristen, Anlagen).
Danach generiere den vollstaendigen Brief als JSON.
Beginne mit Frage 1.`;
}

/**
 * Baut den Optimierungs-Prompt (gefuellter Brief).
 * Zeigt physischen Tag-Kontext fuer jedes Feld.
 */
export function buildOptimizationPrompt() {
  const current = readDOMasJSON();

  const rows = IMR.map(({ key, tag }) => {
    const val = current[key];
    const display = val ? JSON.stringify(val).substring(0, 80) : 'null';
    return `  "${key}": ${display}   // <${tag}>`;
  }).join(',\n');

  return `# DIN-BriefNEO — Optimierungs-Modus
# IMR 2.0 | CAA-008 | ADR-008

Optimiere den folgenden DIN 5008-Briefentwurf.
Jeder Key ist direkt einem HTML-Tag auf dem Papier zugeordnet.

## Aktueller Stand (Tag ↔ JSON)
\```json
{
  "intent": null,
${rows}
}
\```

## System-Intents (Optional)
Du kannst folgende Aktionen via "intent"-Key auslösen:
- "${AI_INTENTS.PRINT}": Öffnet sofort den Druckdialog
- "${AI_INTENTS.SAVE}":  Sichert den Stand im lokalen Speicher

## Markdown-Regel
NUR "body" darf Markdown enthalten. Alle anderen Felder: Plaintext.

## Pruefkriterien
- Betreff (<din-subject>): Praegnant, klar, ohne Floskeln
- Anrede (<din-salutation>): Korrekte DIN-Form
- Brieftext (<din-body>): Struktur, Ton, Vollstaendigkeit, Rechtschreibung
- Grussformel (<din-greeting>): Ohne Satzzeichen am Ende (DIN 5008)
- Footer (<din-footer>): Geschaeftsangaben (Bank, USt-IdNr, Sitz). NUR wenn vom User gewuenscht.

## Ausgabe
Vollstaendiges JSON mit ALLEN IMR-Keys. Kurze Begruendung (3 Saetze) danach.
`;
}

/**
 * Scannt Plaintext nach Markdown-Markern und liefert Ranges für das Highlighting.
 * Chrome 147 Baseline: Nutzt native Range-Objekte für CSS Custom Highlight API.
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
        if (type === 'bold') boldRanges.push(range);
        if (type === 'italic') italicRanges.push(range);

        // Marker (die Sternchen/Unterstriche selbst)
        const m1 = new Range(); m1.setStart(textNode, start); m1.setEnd(textNode, start + mLen);
        const m2 = new Range(); m2.setStart(textNode, end - mLen); m2.setEnd(textNode, end);
        markerRanges.push(m1, m2);
      } catch (e) { console.warn("Highlight Range Error:", e); }
    }
  };

  // 1. Bold (**)
  scan(/(\*\*)(.*?)\1/g, 'bold');
  // 2. Italic (*)
  scan(/(\*)(.*?)\1/g, 'italic');
  // 3. Underline (__)
  scan(/(__)(.*?)\1/g, 'bold'); // Wir mappen Underline auf Bold für DIN-Zwecke

  return { bold: boldRanges, italic: italicRanges, marker: markerRanges };
}
