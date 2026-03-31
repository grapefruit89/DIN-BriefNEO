/**
 * logic.js — Unified Business Logic & Constants (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * @module logic
 */

/* ── CONSTANTS & REGISTRY ──────────────────────────────────── */

/**
 * IMR (Input Mapping Registry) – definiert die bidirektionale Bindung
 * zwischen DOM-Elementen und State-Keys.
 */
export const IMR = Object.freeze([
  { tag: "din-branding-logo", key: "logo" },
  { tag: "din-branding-wasserzeichen", key: "wasserzeichen" },
  { tag: "din-absender-vorname", key: "abs_vorname" },
  { tag: "din-absender-nachname", key: "abs_nachname" },
  { tag: "din-absender-strasse", key: "abs_strasse" },
  { tag: "din-absender-ort", key: "abs_ort" },
  { tag: "din-absender-zusatz", key: "abs_zusatz" },
  { tag: "din-absender-mail", key: "abs_mail" },
  { tag: "din-absender-tel", key: "abs_tel" },
  { tag: "din-rucksendezeile", key: "rucksendezeile" },
  { tag: "din-zusaetze", key: "zusaetze" },
  { tag: "din-empfaenger-firma", key: "empf_firma" },
  { tag: "din-empfaenger-abteilung", key: "empf_abteilung" },
  { tag: "din-empfaenger-vorname", key: "empf_vorname" },
  { tag: "din-empfaenger-nachname", key: "empf_nachname" },
  { tag: "din-empfaenger-strasse", key: "empf_strasse" },
  { tag: "din-empfaenger-ort", key: "empf_ort" },
  { tag: "din-ihr-zeichen", key: "ref_ihr_zeichen" },
  { tag: "din-ihr-schreiben", key: "ref_ihr_schreiben" },
  { tag: "din-unser-zeichen", key: "ref_unser_zeichen" },
  { tag: "din-unser-schreiben", key: "ref_unser_schreiben" },
  { tag: "din-durchwahl", key: "ref_tel" },
  { tag: "din-email-direkt", key: "ref_email" },
  { tag: "din-internet", key: "ref_web" },
  { tag: "din-datum", key: "datum" },
  { tag: "din-betreff", key: "betreff" },
  { tag: "din-anrede", key: "anrede" },
  { tag: "din-text", key: "text" },
  { tag: "din-text-spiegel", key: "mirror", internal: true },
  { tag: "din-grussformel", key: "grussformel" },
  { tag: "din-unterschrift", key: "unterschrift" },
  { tag: "din-anlagen", key: "anlagen" },
  { tag: "din-fuss-firma", key: "fuss_firma" },
  { tag: "din-fuss-sitz", key: "fuss_sitz" },
  { tag: "din-fuss-gericht", key: "fuss_gericht" },
  { tag: "din-fuss-hrb", key: "fuss_hrb" },
  { tag: "din-fuss-vorstand", key: "fuss_vorstand" },
  { tag: "din-fuss-gf", key: "fuss_gf" },
  { tag: "din-fuss-stnr", key: "fuss_stnr" },
  { tag: "din-fuss-ustid", key: "fuss_ustid" },
  { tag: "din-fuss-bank", key: "fuss_bank" },
  { tag: "din-fuss-iban", key: "fuss_iban" },
  { tag: "din-fuss-bic", key: "fuss_bic" },
  { tag: "din-fuss-anschrift", key: "fuss_anschrift" },
  { tag: "din-falz-oben", key: "guides_fold_top", internal: true },
  { tag: "din-falz-unten", key: "guides_fold_bottom", internal: true },
  { tag: "din-lochmarke", key: "guides_hole", internal: true },
]);

/* ── MARKDOWN PARSER ────────────────────────────────────────── */

/**
 * Parst Markdown in HTML mit Zero-Width Ghosting Pattern
 * @param {string} raw - Roher Markdown-Text
 * @returns {string} HTML mit Markern
 */
export function parseMarkdown(raw) {
  if (!raw) return "";

  let html = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = html.split("\n");
  const out = [];
  let listActive = false;

  for (const line of lines) {
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      out.push(
        `<div class="md-list-item">` +
          `<span class="md-num"><span class="md-marker">${orderedMatch[1]}. </span>${orderedMatch[1]}.</span>` +
          `<span>${applyInline(orderedMatch[2])}</span>` +
          `</div>`,
      );
      listActive = true;
      continue;
    }

    const bulletMatch = line.match(/^([-*])\s+(.+)$/);
    if (bulletMatch) {
      const content = bulletMatch[2];

      // Checkbox / Task-List Erkennung: "- [ ] " oder "- [x] "
      const taskMatch = content.match(/^\[( |x)\]\s+(.*)$/i);
      if (taskMatch) {
        const checked = taskMatch[1].toLowerCase() === "x";
        out.push(
          `<div class="md-list-item md-task-list ${checked ? "is-checked" : ""}">` +
            `<span class="md-checkbox"><span class="md-marker">${bulletMatch[1]} [${taskMatch[1]}] </span>${checked ? "☑" : "☐"}</span>` +
            `<span>${applyInline(taskMatch[2])}</span>` +
            `</div>`,
        );
      } else {
        out.push(
          `<div class="md-list-item">` +
            `<span class="md-bullet"><span class="md-marker">${bulletMatch[1]} </span>•</span>` +
            `<span>${applyInline(content)}</span>` +
            `</div>`,
        );
      }
      listActive = true;
      continue;
    }

    const quoteMatch = line.match(/^&gt;\s?(.*)$/);
    if (quoteMatch) {
      out.push(
        `<blockquote class="md-quote">` +
          `<span class="md-marker">&gt; </span>` +
          `${applyInline(quoteMatch[1])}` +
          `</blockquote>`,
      );
      listActive = false;
      continue;
    }

    out.push(applyInline(line));
  }

  return out.join("\n").replace(/\n/g, "<br>");
}

function applyInline(text) {
  return text
    .replace(
      /\*\*(.+?)\*\*/g,
      '<span class="md-marker">**</span><strong>$1</strong><span class="md-marker">**</span>',
    )
    .replace(
      /__(.+?)__/g,
      '<span class="md-marker">__</span><u>$1</u><span class="md-marker">__</span>',
    );
}

/* ── TEMPORAL DATE LOGIC ────────────────────────────────────── */

export function todayISO() {
  return Temporal.Now.plainDateISO(Temporal.Now.timeZoneId()).toString();
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = Temporal.PlainDate.from(iso);
  return `${d.day.toString().padStart(2, "0")}.${d.month.toString().padStart(2, "0")}.${d.year}`;
}

/* ── BUSINESS LOGIC ─────────────────────────────────────────── */

export function deriveReturnLine(data) {
  const firstName = data.abs_vorname || "";
  const lastName = data.abs_nachname || "";
  const street = data.abs_strasse || "";
  const city = data.abs_ort || "";

  const initial = firstName.trim().charAt(0);
  const namePart = initial ? `${initial}. ${lastName.trim()}` : lastName.trim();

  return [namePart, street.trim(), city.trim()].filter(Boolean).join(" · ");
}

export function validateIBAN(iban) {
  if (!iban) return false;
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2,20}$/.test(clean)) return false;

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numeric = "";
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      numeric += (code - 55).toString();
    } else {
      numeric += char;
    }
  }

  try {
    return BigInt(numeric) % 97n === 1n;
  } catch (e) {
    return false;
  }
}

/**
 * Validiert die Adresszone nach DIN 5008 (max. 6 Zeilen).
 * @param {Object} data - Aktueller Dokument-Zustand
 * @returns {Object} { isValid, lineCount }
 */
export function validateAddressZone(data) {
  if (!data) return { isValid: true, lineCount: 0 };
  const recipientKeys = [
    "zusaetze",
    "empf_firma",
    "empf_abteilung",
    "empf_vorname",
    "empf_nachname",
    "empf_strasse",
    "empf_ort",
  ];
  const lineCount = recipientKeys.reduce(
    (acc, key) => acc + (data[key]?.trim() ? 1 : 0),
    0,
  );
  return { isValid: lineCount <= 6, lineCount };
}
