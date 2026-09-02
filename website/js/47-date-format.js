// @ts-check
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export function formatLetterDate() {
  const t = Temporal.Now.zonedDateTimeISO('Europe/Berlin');
  const dd = String(t.day).padStart(2, '0');
  return `${dd}. ${MONTHS[t.month - 1]} ${t.year}`;
}

export function applyLetterDate() {
  const el = document.getElementById('datum');
  if (!el) return;
  el.textContent = formatLetterDate();
}
