/**
 * js/logic.js — Pure Business Logic Engine
 * Claude Brief · DIN 5008 Generator
 * ─────────────────────────────────────────────────────────
 * ZERO DOM. ZERO state imports. Pure Input → Output.
 * Extracted & cleaned from Antigravity_DIN_Master FormatterService.
 *
 * Exports:
 *   formatDate(dateObj, format)     → string
 *   todayISO()                      → 'YYYY-MM-DD'
 *   parseRecipient(text)            → { gender, name, firstName, title }
 *   deriveSalutation(analysis, formality, recipientType) → string
 *   deriveGreeting(formality)       → string
 *   deriveReturnLine(senderFields)  → string
 *   validateIBAN(raw)               → boolean
 *   formatIBAN(raw)                 → 'DE00 0000 …' (grouped)
 *   ghostIBAN(typed)                → string (ghost overlay value)
 */

/* ── Date ────────────────────────────────────────────────────── */

const MONTHS_DE = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
];

export function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatDate(dateObj, format = 'de') {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const d  = dateObj.getDate();
  const m  = dateObj.getMonth() + 1;
  const y  = dateObj.getFullYear();
  const dd = String(d).padStart(2,'0');
  const mm = String(m).padStart(2,'0');
  if (format === 'iso')  return `${y}-${mm}-${dd}`;
  if (format === 'long') return `${d}. ${MONTHS_DE[dateObj.getMonth()]} ${y}`;
  return `${dd}.${mm}.${y}`;   // 'de'
}

/** Parses any German date string → Date object (or null) */
export function parseDate(input) {
  if (!input) return null;
  const s = input.trim();
  // DD.MM.YYYY
  const m1 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m1) return new Date(+m1[3], +m1[2]-1, +m1[1]);
  // YYYY-MM-DD
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) return new Date(+m2[1], +m2[2]-1, +m2[3]);
  // D. Month YYYY
  const m3 = s.match(/^(\d{1,2})\.?\s+([^\s]+)\s+(\d{4})$/);
  if (m3) {
    const mi = MONTHS_DE.findIndex(mn =>
      mn.toLowerCase().startsWith(m3[2].toLowerCase().substring(0,3)));
    if (mi !== -1) return new Date(+m3[3], mi, +m3[1]);
  }
  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/* ── Recipient parsing ───────────────────────────────────────── */

/**
 * Parses free-text recipient input to extract gender, name, title.
 * @param {string} text — raw text from recipientName / recipientSalut fields
 * @returns {{ gender: 'm'|'f'|'fam'|'n', name: string, firstName: string, title: string, fullName: string }}
 */
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
  let content = targetLine
    .replace(/^(Herr|Herrn|Frau|Familie|Eheleute)\s+/i, '')
    .trim();

  const titleMatches = content.match(TITLE_RE);
  const title = titleMatches ? titleMatches.join(' ') : '';
  content = content.replace(TITLE_RE, '').trim();

  const parts = content.split(/\s+/).filter(Boolean);
  const name      = parts.length ? parts[parts.length - 1] : '';
  const firstName = parts.length > 1 ? parts.slice(0,-1).join(' ') : name;
  const fullName  = [title, firstName, parts.length > 1 ? name : ''].filter(Boolean).join(' ').trim()
                  || name;

  return { gender, name, firstName, title, fullName };
}

/* ── Salutation Engine ───────────────────────────────────────── */

const SALUTATION_MATRIX = {
  formal: {
    m:   (n) => `Sehr geehrter Herr ${n},`,
    f:   (n) => `Sehr geehrte Frau ${n},`,
    fam: (n) => `Sehr geehrte Familie ${n},`,
    n:   ()  => 'Sehr geehrte Damen und Herren,',
  },
  polite: {
    m:   (n) => n ? `Guten Tag, Herr ${n},` : 'Guten Tag,',
    f:   (n) => n ? `Guten Tag, Frau ${n},` : 'Guten Tag,',
    fam: (n) => n ? `Guten Tag, Familie ${n},` : 'Guten Tag,',
    n:   ()  => 'Guten Tag,',
  },
  casual: {
    m:   (n) => n ? `Hallo ${n},` : 'Hallo,',
    f:   (n) => n ? `Hallo ${n},` : 'Hallo,',
    fam: (n) => n ? `Hallo ${n},` : 'Hallo,',
    n:   ()  => 'Hallo zusammen,',
  },
};

const GREETING_MAP = {
  formal: 'Mit freundlichen Grüßen',
  polite: 'Freundliche Grüße',
  casual: 'Viele Grüße',
};

/**
 * Derives the opening salutation.
 * recipientType ('none'|'male'|'female') overrides parsed gender.
 */
export function deriveSalutation(analysis, formality = 'formal', recipientType = 'none') {
  const matrix = SALUTATION_MATRIX[formality] || SALUTATION_MATRIX.formal;
  let gender = analysis.gender;
  if (recipientType === 'male')   gender = 'm';
  if (recipientType === 'female') gender = 'f';
  const fn = matrix[gender] || matrix.n;
  const name = analysis.fullName || analysis.name || '';
  return fn(name);
}

export function deriveGreeting(formality = 'formal') {
  return GREETING_MAP[formality] || GREETING_MAP.formal;
}

/* ── Return address derivation ───────────────────────────────── */

/**
 * Builds the single-line return address from sender fields.
 * Strategy: Name initial + Street + ZIP City  (max ~80 chars)
 * @param {{ name:string, street:string, zipCity:string }} fields
 */
export function deriveReturnLine({ name = '', street = '', zipCity = '' } = {}) {
  // Abbreviate first name: "Max Mustermann" → "M. Mustermann"
  const abbr = (raw) => {
    const clean = raw.replace(/^(Herr|Frau)\s+/i,'').trim();
    const parts = clean.split(/\s+/);
    if (parts.length > 1 && !parts[0].includes('.')) {
      return parts[0].charAt(0) + '. ' + parts.slice(1).join(' ');
    }
    return clean;
  };
  const parts = [abbr(name), street, zipCity].filter(Boolean);
  return parts.join(' · ');
}

/* ── IBAN ────────────────────────────────────────────────────── */

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
  const clean = raw.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') ?? clean;
}

/**
 * Generates the "ghost" overlay string for the IBAN input.
 * Shows typed chars + remaining template placeholders.
 * German IBAN: DE00 0000 0000 0000 0000 00  (22 digits total)
 */
export function ghostIBAN(typed) {
  const TEMPLATE = 'DE00 0000 0000 0000 0000 00';
  const clean = typed.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  const formatted = clean.match(/.{1,4}/g)?.join(' ') ?? clean;
  if (formatted.length >= TEMPLATE.length) return formatted;
  return formatted + TEMPLATE.slice(formatted.length);
}
