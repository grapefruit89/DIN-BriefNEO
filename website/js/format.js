// @ts-check
// @adr [[ADR-JS]]
// @guide [[glossary]]

/**
 * @file format.js — Reine Formatierungsfunktionen nach DIN 5008 (Telefonnummern, Text-Formatierung).
 */

/**
 * Formatiert eine eingegebene Telefonnummer nach DIN 5008 11.3.2 (Funktions- und
 * Ortsnetz-Vorwahlen per Leerzeichen abgesetzt, Durchwahl mit Bindestrich).
 * @param {string | null | undefined} input
 * @returns {string}
 */
export function formatTelefonnummer(input) {
  const original = String(input ?? '').trim();
  if (!original) return '';

  // 1. Vorbereinigung: "(0)" auflösen, erlaubte Zeichen behalten, Leerraum normalisieren.
  const cleaned = original
    .replace(/\(\s*0\s*\)/g, ' ')
    .replace(/[^0-9+\-/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return original;

  // 2. Internationale Nummern: 00XX -> +XX. Nur +49 wird national weitergereicht.
  if (cleaned.startsWith('+') || cleaned.startsWith('00')) {
    const intl = cleaned.replace(/^00(\d{2})/, '+$1');
    if (!intl.startsWith('+49')) return intl;
    const afterCc = intl.slice(3).replace(/[^0-9-]/g, '');
    if (!afterCc) return intl;
    const national = afterCc.startsWith('0') ? afterCc : `0${afterCc}`;
    const formatted = formatNationalNumber(national);
    return formatted ? `+49 ${formatted.slice(1)}` : intl;
  }

  // 3. Nationale Nummern nur mit führender 0 — sonst unangetastet lassen.
  if (!cleaned.startsWith('0')) return original;
  return formatNationalNumber(cleaned) ?? original;
}

/**
 * Formatiert eine nationale Rufnummer (führende 0) in Vorwahl + Rufnummer + Durchwahl.
 * @param {string} national
 * @returns {string | null} null, wenn keine verwertbare Nummer vorliegt
 */
function formatNationalNumber(national) {
  let s = national.replace(/\s+/g, ' ').trim();
  if (!/^0\d/.test(s.replace(/\D/g, ''))) return null;

  // Durchwahl: abschließender Bindestrich + höchstens 4 Ziffern ("0228 123456-78").
  // Ein längerer Rest nach dem Bindestrich ist ein Trenner ("0172-1234567"), keine Durchwahl.
  let durchwahl = '';
  const dwMatch = s.match(/^(.*\d)-(\d{1,4})$/);
  if (dwMatch) {
    s = dwMatch[1].trim();
    durchwahl = `-${dwMatch[2]}`;
  } else {
    // Durchwahl als letzte, per Leerzeichen abgetrennte 2er-Gruppe ("0228 123456 78").
    // Mobilnummern werden laut Vorgabe zu einer Gruppe zusammengefasst, daher dort nicht.
    // Die Gruppe davor muss eine plausible Rufnummer sein (>= 4 Ziffern), sonst würde
    // eine Gruppierung wie "0170 123 45 67" falsch als Durchwahl gelesen.
    const groups = s.split(' ');
    const isMobile = /^01[5-7]\d/.test(s.replace(/[\s/-]+/g, ''));
    if (!isMobile && groups.length >= 3) {
      const last = groups[groups.length - 1];
      const before = groups[groups.length - 2];
      if (/^\d{2}$/.test(last) && /^\d{4,}$/.test(before)) {
        s = groups.slice(0, -1).join(' ');
        durchwahl = `-${last}`;
      }
    }
  }

  // Vorwahl: endet am ersten Trenner (Leerzeichen, / oder -).
  const sepIndex = s.search(/[ /-]/);
  const head = sepIndex === -1 ? s : s.slice(0, sepIndex);
  const headDigits = head.replace(/\D/g, '');

  let vorwahl = '';
  let rest = '';
  if (sepIndex !== -1 && headDigits.length >= 3 && headDigits.length <= 6) {
    // Expliziter Trenner vorhanden: Vorwahl wird direkt aus dem Head übernommen
    vorwahl = headDigits;
    rest = s.slice(sepIndex).replace(/\D/g, '');
  } else {
    // Kein expliziter Trenner: KEIN Raten anhand der Gesamtziffernzahl (A18)!
    // Formatiere nur, wenn die Ziffern mit einer eindeutig bekannten Vorwahl beginnen.
    const digits = s.replace(/\D/g, '');
    const prefixLen = getKnownPrefixLength(digits);
    if (!prefixLen) {
      return null; // Lieber unformatiert als falsch formatiert
    }
    vorwahl = digits.slice(0, prefixLen);
    rest = digits.slice(prefixLen);
  }

  if (!vorwahl) return null;
  return rest ? `${vorwahl} ${rest}${durchwahl}` : `${vorwahl}${durchwahl}`;
}

/**
 * Prüft auf eindeutig bekannte Vorwahlen ohne Datenbank (A18).
 * Liefert die Vorwahllänge oder 0, wenn keine bekannte Vorwahl vorliegt.
 * @param {string} digits
 * @returns {number}
 */
function getKnownPrefixLength(digits) {
  // 3-stellig: Großstädte (030 Berlin, 040 Hamburg, 069 Frankfurt, 089 München)
  if (/^0(30|40|69|89)\d/.test(digits)) return 3;
  // 4-stellig: Mobilfunk (015x, 016x, 017x)
  if (/^01[5-7]\d{2,}/.test(digits)) return 4;
  // 4-stellig: Sondernummern (0800, 0900, 0180, 0137, 0700)
  if (/^0(?:800|900|180|137|700)\d/.test(digits)) return 4;
  // 4-stellig: Eindeutig bekannte Großstadt-Vorwahlen
  // 0201 Essen, 0211 Düsseldorf, 0221 Köln, 0228 Bonn, 0231 Dortmund,
  // 0341 Leipzig, 0351 Dresden, 0421 Bremen, 0511 Hannover, 0621 Mannheim,
  // 0711 Stuttgart, 0911 Nürnberg
  if (/^0(?:201|211|221|228|231|341|351|421|511|621|711|911)\d/.test(digits)) return 4;

  return 0;
}

/**
 * Prüft auf ein gültiges gregorianisches Kalenderdatum ohne Legacy-Date-Objekt (ADR-JS / B2).
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {boolean}
 */
function isValidCalendarDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || year < 1000 || year > 9999) return false;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month];
}

/**
 * Formatiert ein Datum nach DIN 5008 § 11.4.
 * Unterstützt ISO-Format (JJJJ-MM-TT via Temporal), DIN-alphanumerisch (z. B. "4. September 2026")
 * und DIN-numerisch (TT.MM.JJJJ mit optional führender Null am Tag).
 * @param {string | number | any} input
 * @param {{ format?: 'numeric' | 'alpha' | 'iso', pad?: boolean }} [opts]
 * @returns {string}
 */
export function formatDatum(input, opts = {}) {
  const { format = 'numeric', pad = true } = opts;
  if (!input) return String(input ?? '');

  let year = 0;
  let month = 0;
  let day = 0;

  if (typeof Temporal !== 'undefined' && typeof Temporal.PlainDate !== 'undefined' && input instanceof Temporal.PlainDate) {
    year = input.year;
    month = input.month;
    day = input.day;
  } else if (input && typeof input.getFullYear === 'function') {
    year = input.getFullYear();
    month = input.getMonth() + 1;
    day = input.getDate();
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/);
    const deMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);

    if (isoMatch) {
      year = Number.parseInt(isoMatch[1], 10);
      month = Number.parseInt(isoMatch[2], 10);
      day = Number.parseInt(isoMatch[3], 10);
    } else if (deMatch) {
      day = Number.parseInt(deMatch[1], 10);
      month = Number.parseInt(deMatch[2], 10);
      year = Number.parseInt(deMatch[3], 10);
    } else {
      return input;
    }
  } else {
    return String(input);
  }

  if (!isValidCalendarDate(year, month, day)) {
    return typeof input === 'string' ? input : String(input);
  }

  if (typeof Temporal !== 'undefined' && typeof Temporal.PlainDate !== 'undefined') {
    const pd = new Temporal.PlainDate(year, month, day);
    if (format === 'iso') {
      return pd.toString();
    }
    if (format === 'alpha') {
      return pd.toLocaleString('de-DE', { dateStyle: 'long' });
    }
    // DIN-numerisch (TT.MM.JJJJ)
    return pd.toLocaleString('de-DE', {
      day: pad ? '2-digit' : 'numeric',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Fallback (z. B. Node.js CLI-Runner ohne Temporal-Flag)
  if (format === 'iso') {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  if (format === 'alpha') {
    const monatsNamen = [
      '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${day}. ${monatsNamen[month]} ${year}`;
  }
  const dayStr = pad ? String(day).padStart(2, '0') : String(day);
  const monthStr = String(month).padStart(2, '0');
  return `${dayStr}.${monthStr}.${year}`;
}

/**
 * Formatiert eine Uhrzeit nach DIN 5008 § 11.5.
 * Normgerecht zweistellig mit Doppelpunkt gegliedert (z. B. "05:30", "05:30 Uhr").
 * Der End-of-Day-Grenzfall "24:00" bleibt als legitime DIN-Angabe erhalten.
 * @param {string | any} input
 * @param {{ suffix?: string, seconds?: boolean }} [opts]
 * @returns {string}
 */
export function formatUhrzeit(input, opts = {}) {
  const { suffix = '', seconds = false } = opts;
  if (!input && input !== 0) return String(input ?? '');

  let h = 0;
  let m = 0;
  /** @type {number | null} */
  let s = null;
  let parsedSuffix = suffix;

  if (input && typeof input.getHours === 'function') {
    h = input.getHours();
    m = input.getMinutes();
    s = input.getSeconds();
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?(?:\s*(uhr))?$/i);
    if (!match) return input;

    h = Number.parseInt(match[1], 10);
    m = Number.parseInt(match[2], 10);
    s = match[3] !== undefined ? Number.parseInt(match[3], 10) : null;
    if (match[4] && !suffix) {
      parsedSuffix = 'Uhr';
    }
  } else {
    return String(input);
  }

  // 24:00 Grenzfall: nur 24:00(:00) ist zulässig, 24:30 ist ungültig
  if (h === 24) {
    if (m !== 0 || (s !== null && s !== 0)) return typeof input === 'string' ? input : String(input);
  } else if (h < 0 || h > 23) {
    return typeof input === 'string' ? input : String(input);
  }

  if (m < 0 || m > 59) return typeof input === 'string' ? input : String(input);
  if (s !== null && (s < 0 || s > 59)) return typeof input === 'string' ? input : String(input);

  let formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  if (seconds) {
    formatted += `:${String(s ?? 0).padStart(2, '0')}`;
  }
  if (parsedSuffix) {
    formatted += ` ${parsedSuffix.trim()}`;
  }
  return formatted;
}

/**
 * Formatiert eine IBAN nach DIN 5008 § 11.3.1 in 4er-Gruppen von links.
 * @param {string | any} input
 * @returns {string}
 */
export function formatIban(input) {
  if (!input || typeof input !== 'string') return String(input ?? '');
  const cleaned = input.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
    return input;
  }
  return cleaned.replace(/(.{4})(?=.)/g, '$1 ');
}

/**
 * Formatiert eine Postfachnummer nach DIN 5008 § 11.3.4 von rechts in 2er-Gruppen.
 * @param {string | number | any} input
 * @returns {string}
 */
export function formatPostfach(input) {
  if (input === null || input === undefined) return String(input ?? '');
  const s = String(input).trim();
  const prefixMatch = s.match(/^(postfach\s+)/i);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const numPart = prefixMatch ? s.slice(prefix.length) : s;
  const digits = numPart.replace(/\s+/g, '');

  if (!/^\d{3,}$/.test(digits)) {
    return typeof input === 'string' ? input : String(input);
  }

  const groups = [];
  for (let i = digits.length; i > 0; i -= 2) {
    groups.unshift(digits.slice(Math.max(0, i - 2), i));
  }
  return `${prefix}${groups.join(' ')}`;
}

/**
 * Formatiert einen Geldbetrag nach DIN 5008 § 6.6 / § 11.2 mit Tausender-Punkt
 * und geschütztem Leerzeichen vor dem Währungssymbol bzw. ISO-Code.
 * @param {number | string | any} input
 * @param {string} [waehrung='EUR']
 * @param {{ useIsoCode?: boolean, minimumFractionDigits?: number, maximumFractionDigits?: number }} [opts]
 * @returns {string}
 */
export function formatGeldbetrag(input, waehrung = 'EUR', opts = {}) {
  const { useIsoCode = false, minimumFractionDigits = 2, maximumFractionDigits = 2 } = opts;
  if (input === null || input === undefined || input === '') return String(input ?? '');

  let num;
  if (typeof input === 'number') {
    num = input;
  } else if (typeof input === 'string') {
    const cleaned = input.trim().replace(/\s+/g, '');
    if (/^-?\d{1,3}(?:\.\d{3})*,\d+$/.test(cleaned)) {
      num = Number.parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else if (/^-?\d+,\d+$/.test(cleaned)) {
      num = Number.parseFloat(cleaned.replace(',', '.'));
    } else if (/^-?\d+(?:\.\d+)?$/.test(cleaned)) {
      num = Number.parseFloat(cleaned);
    } else {
      return input;
    }
  } else {
    return String(input);
  }

  if (Number.isNaN(num)) return typeof input === 'string' ? input : String(input);

  const nf = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: waehrung,
    currencyDisplay: useIsoCode ? 'code' : 'symbol',
    minimumFractionDigits,
    maximumFractionDigits
  });

  return nf.format(num);
}

/* =========================================================================================
 * 7. BRIEFDATUM & ISO-DATUM (Temporal API & DIN 5008)
 * ========================================================================================= */

/**
 * „Heute" als ISO-String (YYYY-MM-DD) in Berliner Zeit — Single Source of Truth
 * für alle maschinenlesbaren Datums-Ableitungen (z. B. PDF-Dateiname).
 * Bewusst zoned (nicht plainDateISO(), das UTC-basiert ist und nachts 00:00–02:00
 * deutscher Zeit den Vortag liefern würde).
 * @returns {string}
 */
export function currentISODate() {
  try {
    return Temporal.Now.zonedDateTimeISO('Europe/Berlin').toPlainDate().toString();
  } catch (err) {
    console.warn('[DateFormat] currentISODate fehlgeschlagen:', err);
    return '';
  }
}

/**
 * Formatiert das heutige Datum DIN-5008-konform ("4. September 2026", ohne führende Null).
 * @returns {string}
 */
export function formatLetterDate() {
  try {
    const iso = currentISODate();
    if (!iso) return '';
    return formatDatum(iso, { format: 'alpha' });
  } catch (err) {
    console.warn('[DateFormat] formatLetterDate fehlgeschlagen:', err);
    return '';
  }
}

/**
 * Befüllt das Datumsfeld (#datum) des Briefes beim Laden.
 */
export function applyLetterDate() {
  const el = document.getElementById('datum');
  if (!el) return;
  // Ein selbst eingetragenes Datum gewinnt: sonst überschreibt jeder Aufruf
  // die Eingabe, und sie wäre nach dem Reload verloren (Befund 1.2).
  const manuallySet = el.dataset.dirty === 'true' && (el.textContent || '').trim() !== '';
  if (manuallySet) return;
  const formatted = formatLetterDate();
  if (formatted) {
    el.textContent = formatted;
  }
}

/* =========================================================================================
 * 8. MIKRO-TYPOGRAFIE NACH DIN 5008 (§ 7.2 & § 8.2)
 * ========================================================================================= */

/**
 * Wendet DIN-5008-Mikrotypografie (geschützte Leerzeichen) an (§ 7.2 & § 8.2).
 * Ersetzt gewöhnliche Leerzeichen durch geschützte Leerzeichen (\u00A0) bei:
 * 1. Mehrteiligen Abkürzungen (z. B., d. h., u. a., e. V., i. d. R., o. Ä., s. o., i. V., i. A., etc. pp.)
 * 2. Paragrafen & Normangaben (§ 24, §§ 38 f., Art. 1, Abs. 2, Satz 1, Nr. 3, Az. ...)
 * 3. Zahlen mit Einheiten & Währungen (100 EUR, 25,50 €, 19 %, 10 kg, 500 m, 120 km/h)
 * 4. Gedankenstrichen (Wort\u00A0– Wort)
 *
 * Die Funktion ist rein funktional, idempotent und verhält sich defensiv bei leeren Eingaben.
 * @param {string | null | undefined} text
 * @returns {string}
 */
export function applyMicroTypography(text) {
  if (!text || typeof text !== 'string') return String(text ?? '');
  const NBSP = '\u00A0';

  return text
    // 1. Mehrteilige Abkürzungen (§ 6.5 & § 7.2)
    .replace(/\b(z|d|u|s)\.[ \t\u00A0]+(B|h|a|o|u)\./gi, `$1.${NBSP}$2.`)
    .replace(/\b(i)\.[ \t\u00A0]+(d)\.[ \t\u00A0]+(R)\./gi, `$1.${NBSP}$2.${NBSP}$3.`)
    .replace(/\b(i)\.[ \t\u00A0]+(V|A)\./gi, `$1.${NBSP}$2.`)
    .replace(/\b(e)\.[ \t\u00A0]+(V)\./gi, `$1.${NBSP}$2.`)
    .replace(/\b(u|o)\.[ \t\u00A0]+(Ä)\./gi, `$1.${NBSP}$2.`)
    .replace(/\b(etc)\.[ \t\u00A0]+(pp)\./gi, `$1.${NBSP}$2.`)
    .replace(/\b(u)\.[ \t\u00A0]+(a)\.[ \t\u00A0]+(m)\./gi, `$1.${NBSP}$2.${NBSP}$3.`)
    // 2. Paragrafen & Normangaben (§ 9.1 & § 7.2)
    .replace(/(§§?|Art\.|Abs\.|Satz|Nr\.|S\.)[ \t\u00A0]+(\d+)/g, `$1${NBSP}$2`)
    .replace(/\b(Az\.)[ \t\u00A0]+([A-Z0-9/.-]+)/gi, `$1${NBSP}$2`)
    // 3. Zahlen mit Einheiten & Währungen (§ 6.6 & § 7.2)
    .replace(/(\d+(?:[.,]\d+)?)[ \t\u00A0]+(?:(EUR|CHF|USD|GBP|km\/h|kWh|kW|mm|cm|dm|km|kg|mg|g|t|°C|V|A|W|h|min|s|m)\b|(€|\$|£|%|‰))/g, (_m, num, u1, u2) => `${num}${NBSP}${u1 || u2}`)
    // 4. Gedankenstrich (§ 8.2)
    .replace(/(?:(?<=\S)|^)[ \t\u00A0]+[-–—][ \t\u00A0]+(?=\S)/g, `${NBSP}– `);
}


