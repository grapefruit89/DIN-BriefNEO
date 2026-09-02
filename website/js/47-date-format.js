// @ts-check
/** Einmal heutiges Datum als Langform in #datum schreiben. */
export function applyLetterDate() {
  const el = document.getElementById('datum');
  if (!el) return;
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  const today = Temporal.Now.plainDateISO();
  el.textContent = `${today.day}. ${months[today.month - 1]} ${today.year}`;
}
