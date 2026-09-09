// @ts-check
// @adr [[ADR-JS]] {DateFormat}
// DIN-Datum via Intl.DateTimeFormat + Temporal — keine Monatstabelle (DIN 5008: ohne führende Null).

// dateStyle: 'long' = de-DE-ICU liefert "4. September 2026" (ohne führende Null, DIN 5008).
const letterDateFmt = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' });

export function formatLetterDate() {
  const zdt = Temporal.Now.zonedDateTimeISO('Europe/Berlin');
  /*
   * Intl nimmt in Chrome 151 noch kein ZonedDateTime entgegen
   * ("Invalid argument for Temporal") — PlainDate wird formatiert,
   * die Zone steuert nur, WELCHER Tag gemeint ist.
   */
  return letterDateFmt.format(/** @type {any} */ (zdt.toPlainDate()));
}

export function applyLetterDate() {
  const el = document.getElementById('datum');
  if (!el) return;
  el.textContent = formatLetterDate();
}
