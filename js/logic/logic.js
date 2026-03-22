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

import { IMR } from '../core/constants.js';

/* ── Hilfsfunktion: Tag-Name → JSON-Key ──────────────────────── */
// "din-your-ref" → "your_ref"  |  "din-body" → "body"
const tagToKey = tag => tag.toLowerCase().slice(4).replace(/-/g, '_');

/* ── Date ─────────────────────────────────────────────────────── */

export { todayISO, formatDateTemporal as formatDate } from '../core/temporal-utils.js';

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

/* ── Recipient Parsing ────────────────────────────────────────── */

export function parseRecipient(text) {
  if (!text) return { gender:'n', name:'', firstName:'', title:'', fullName:'' };
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  let gender = 'n', targetLine = lines[0] || '';

  for (const line of lines) {
    if (/(^|\s)(Herr|Herrn)\b/i.test(line)) { gender = 'm'; targetLine = line; break; }
    if (/(^|\s)(Frau)\b/i.test(line))        { gender = 'f'; targetLine = line; break; }
    if (/(^|\s)(Familie|Eheleute)\b/i.test(line)) { gender = 'fam'; targetLine = line; break; }
  }

  const TITLE_RE = /(Prof\.|Dr\.|Dipl\.-[A-Za-z]+|Mag\.)/g;
  let content = targetLine.replace(/^(Herr|Herrn|Frau|Familie|Eheleute)\s+/i, '').trim();
  const titleMatches = content.match(TITLE_RE);
  const title = titleMatches ? titleMatches.join(' ') : '';
  content = content.replace(TITLE_RE, '').trim();
  const parts = content.split(/\s+/).filter(Boolean);
  const name      = parts.length ? parts[parts.length - 1] : '';
  const firstName = parts.length > 1 ? parts.slice(0,-1).join(' ') : name;
  const fullName  = [title, firstName, parts.length > 1 ? name : ''].filter(Boolean).join(' ').trim() || name;
  return { gender, name, firstName, title, fullName };
}

/* ── Salutation Engine ────────────────────────────────────────── */

const SALUTATION_MATRIX = Object.freeze({
  formal:  { m: n => `Sehr geehrter Herr ${n},`,  f: n => `Sehr geehrte Frau ${n},`,  fam: n => `Sehr geehrte Familie ${n},`, n: () => 'Sehr geehrte Damen und Herren,' },
  polite:  { m: n => n ? `Guten Tag, Herr ${n},`  : 'Guten Tag,', f: n => n ? `Guten Tag, Frau ${n},`  : 'Guten Tag,', fam: n => n ? `Guten Tag, Familie ${n},` : 'Guten Tag,', n: () => 'Guten Tag,' },
  casual:  { m: n => n ? `Hallo ${n},`             : 'Hallo,',     f: n => n ? `Hallo ${n},`             : 'Hallo,',     fam: n => n ? `Hallo ${n},`            : 'Hallo,',     n: () => 'Hallo zusammen,' },
});

const GREETING_MAP = Object.freeze({
  formal: 'Mit freundlichen Grüßen',
  polite: 'Freundliche Grüße',
  casual: 'Viele Grüße',
});

export function deriveSalutation(analysis, formality = 'formal', recipientType = 'none') {
  const matrix = SALUTATION_MATRIX[formality] || SALUTATION_MATRIX.formal;
  let gender = analysis.gender;
  if (recipientType === 'male')   gender = 'm';
  if (recipientType === 'female') gender = 'f';
  return (matrix[gender] || matrix.n)(analysis.fullName || analysis.name || '');
}

export function deriveGreeting(formality = 'formal') {
  return GREETING_MAP[formality] || GREETING_MAP.formal;
}

/**
 * SPEC-002 Hybrid-Adapter: JS setzt NUR Attribute.
 * CSS rendert via :empty::before + data-gender (ANTI-025).
 */
export function updateSalutationHint(el, analysis, formality, recipientType) {
  if (!el || el.dataset.auto === 'false') return;
  const sal = deriveSalutation(analysis, formality, recipientType);
  el.dataset.gender      = analysis.gender;
  el.dataset.formality   = formality;
  el.dataset.placeholder = sal;
  if (!el.textContent.trim()) el.textContent = sal;
}

/* ── Return Address ───────────────────────────────────────────── */

export function deriveReturnLine({ name = '', street = '', zipCity = '' } = {}) {
  const abbr = raw => {
    const clean = raw.replace(/^(Herr|Frau)\s+/i,'').trim();
    const parts = clean.split(/\s+/);
    return (parts.length > 1 && !parts[0].includes('.'))
      ? parts[0].charAt(0) + '. ' + parts.slice(1).join(' ')
      : clean;
  };
  return [abbr(name), street, zipCity].filter(Boolean).join(' · ');
}

/* ── IBAN ─────────────────────────────────────────────────────── */

export function validateIBAN(raw) {
  if (!raw) return false;
  const clean = raw.replace(/\s+/g,'').toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;
  const rearranged = clean.slice(4) + clean.slice(0,4);
  let numeric = '';
  for (const ch of rearranged) {
    const c = ch.charCodeAt(0);
    numeric += (c >= 65 && c <= 90) ? (c - 55) : ch;
  }
  try { return BigInt(numeric) % 97n === 1n; } catch { return false; }
}

export function formatIBAN(raw) {
  if (!raw) return '';
  return raw.replace(/[^A-Za-z0-9]/g,'').toUpperCase().match(/.{1,4}/g)?.join(' ') ?? '';
}

export function ghostIBAN(typed) {
  const TEMPLATE = 'DE00 0000 0000 0000 0000 00';
  const clean = typed.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  const formatted = clean.match(/.{1,4}/g)?.join(' ') ?? clean;
  return formatted.length >= TEMPLATE.length ? formatted : formatted + TEMPLATE.slice(formatted.length);
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
\`\`\`json
{
${tagAnnotated}
}
\`\`\`

## Pflicht-Regeln
- ALLE Keys ausgeben — leere Felder als \`null\`, nicht weglassen
- \`salutation\`: Vollstaendige DIN-Anrede ("Sehr geehrter Herr Mustermann,")
- \`greeting\`: KEIN Satzzeichen am Ende (DIN 5008 §6.3)
- \`subject\`: Praegnant, max. 1 Zeile, keine Abkuerzungen
- \`sender\`: Einzeiler im Format "V. Nachname · Straße Nr. · PLZ Ort"

## Markdown-Verwendungsregel (STRIKT)
ERLAUBT: Nur im "body"-Feld: *kursiv*, **fett**, ~~gestrichen~~, > Zitat, \`code\`, Listen, Tabellen
VERBOTEN: Markdown in sender, note, recipient, date, your_ref, our_ref,
          subject, salutation, greeting, signature. Dort: reiner Plaintext.

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
\`\`\`json
{
${rows}
}
\`\`\`

## Markdown-Regel
NUR "body" darf Markdown enthalten. Alle anderen Felder: Plaintext.

## Pruefkriterien
- Betreff (<din-subject>): Praegnant, klar, ohne Floskeln
- Anrede (<din-salutation>): Korrekte DIN-Form
- Brieftext (<din-body>): Struktur, Ton, Vollstaendigkeit, Rechtschreibung
- Grussformel (<din-greeting>): Ohne Satzzeichen am Ende (DIN 5008)

## Ausgabe
Vollstaendiges JSON mit ALLEN IMR-Keys. Kurze Begruendung (3 Saetze) danach.`;
}

/* ── Ghost-Mirror Logic (ADR-008 | PLAN-058) ─────────────────── */

/**
 * Wandelt ein Subset von Markdown in HTML-Strings um.
 * Unterstützt: **fett**, *kursiv*, ~~del~~, > Zitat, Lists, Br
 */
export function parseMarkdownToHTML(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/^[0-9]+\. (.*?)$/gm, '<li>$1</li>');
}

/**
 * Synchronisiert den Plaintext-Inhalt mit dem Mirror unter Nutzung
 * der nativen Chrome 147 Sanitizer API (PLAN-058).
 */
export function syncGhostMirror(sourceEl, mirrorEl) {
  if (!sourceEl || !mirrorEl) return;
  const rawText = sourceEl.textContent;
  const html = parseMarkdownToHTML(rawText);
  
  // @ts-ignore — Chrome 147+ Native Sanitizer API
  if (globalThis.Sanitizer && mirrorEl.setHTML) {
    const sanitizer = new Sanitizer({
      allowElements: ['strong', 'em', 'del', 'blockquote', 'li', 'br']
    });
    mirrorEl.setHTML(html, { sanitizer });
  } else {
    // Fallback für Browser < 147 (oder falls Sanitizer deaktiviert)
    mirrorEl.innerHTML = html; // @pvp-ignore: innerHTML
  }
}
