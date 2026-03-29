/**
 * js/temporal-utils.js — Pillar 6: Temporal API Engine
 * [ADR-011] Chrome 147 Native Temporal Support
 * [TOMB-L001] Date object is strictly forbidden.
 * ─────────────────────────────────────────────────────────────
 */

// [CMD-4] Intl.DateTimeFormat Singleton Performance Fix
const DIN_FORMATTER_SHORT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DIN_FORMATTER_LONG = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/**
 * Holt das aktuelle Datum im ISO-Format (YYYY-MM-DD)
 */
export function todayISO() {
  // [CMD-1] Fixed: Temporal.Now.plainDateISO requires a timezone argument in Chrome 147
  // @ts-ignore - Native in Chrome 147
  return Temporal.Now.plainDateISO(Temporal.Now.timeZoneId()).toString();
}

/**
 * Formatiert ein Temporal-Datum fÃ¼r die deutsche DIN-Norm
 * @param {string|Temporal.PlainDate} input
 * @param {string} format â€” 'din' (16.03.2026), 'text' (16. MÃ¤rz 2026)
 */
export function formatDate(input, format = "din") {
  if (!input) return "";

  // @ts-ignore
  const date =
    typeof input === "string" ? Temporal.PlainDate.from(input) : input;

  if (format === "text") {
    return DIN_FORMATTER_LONG.format(date);
  }

  // Standard DIN 5008 (TT.MM.JJJJ)
  return DIN_FORMATTER_SHORT.format(date);
}

/**
 * Alias fÃ¼r formatDate (High-Integrity Compatibility)
 */
export function formatDateTemporal(isoString) {
  return formatDate(isoString || todayISO(), "din");
}

/**
 * Berechnet ein Zieldatum (z.B. fÃ¼r Fristen)
 * @param {string} isoDate
 * @param {number} daysToAdd
 */
export function addDays(isoDate, daysToAdd) {
  // @ts-ignore
  const start =
    typeof isoDate === "string" ? Temporal.PlainDate.from(isoDate) : isoDate;
  return start.add({ days: daysToAdd }).toString();
}

/**
 * Holt die aktuelle Uhrzeit im ISO-Format (HH:MM:SS)
 */
export function nowTimeISO() {
  // @ts-ignore
  return Temporal.Now.plainTimeISO().toString().split(".")[0];
}

/**
 * [CMD-3] Reviver logic (export for StateManager if needed)
 */
export function temporalReviver(key, value) {
  // Match standard ISO 8601 Date strings (YYYY-MM-DD)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      // @ts-ignore
      return Temporal.PlainDate.from(value);
    } catch (e) {
      return value;
    }
  }
  return value;
}
