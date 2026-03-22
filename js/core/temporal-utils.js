/**
 * js/core/temporal-utils.js
 * Chrome 147 Baseline — Temporal API (TOMB-L001 final)
 * FUTURE-PROOF
 */
export function todayISO() {
  // @ts-ignore
  return Temporal.Now.plainDateISO().toString();
}

export function nowTimeISO() {
  // @ts-ignore
  return Temporal.Now.plainTimeISO().toString().split('.')[0];
}

export function formatDateTemporal(format = 'de') {
  // @ts-ignore
  const d = Temporal.Now.plainDateISO();
  if (format === 'iso') return d.toString();
  const dd = String(d.day).padStart(2, '0');
  const mm = String(d.month).padStart(2, '0');
  if (format === 'long') {
    const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    return `${d.day}. ${MONTHS_DE[d.month - 1]} ${d.year}`;
  }
  return `${dd}.${mm}.${d.year}`;
}
