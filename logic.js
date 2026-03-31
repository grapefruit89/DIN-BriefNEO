/**
 * logic.js — Unified Business Logic & Constants (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

/* ── CONSTANTS & REGISTRY ──────────────────────────────────── */

export const IMR = Object.freeze([
  // 1. Absender
  { tag: "din-branding-logo", key: "logo" },
  { tag: "din-branding-wasserzeichen", key: "wasserzeichen" },
  { tag: "din-absender-vorname", key: "abs_vorname" },
  { tag: "din-absender-nachname", key: "abs_nachname" },
  { tag: "din-absender-strasse", key: "abs_strasse" },
  { tag: "din-absender-ort", key: "abs_ort" },
  { tag: "din-absender-zusatz", key: "abs_zusatz" },
  { tag: "din-absender-mail", key: "abs_mail" },
  { tag: "din-absender-tel", key: "abs_tel" },

  // 2. Anschrift
  { tag: "din-rucksendezeile", key: "rucksendezeile" },
  { tag: "din-zusaetze", key: "zusaetze" },
  { tag: "din-empfaenger-firma", key: "empf_firma" },
  { tag: "din-empfaenger-abteilung", key: "empf_abteilung" },
  { tag: "din-empfaenger-vorname", key: "empf_vorname" },
  { tag: "din-empfaenger-nachname", key: "empf_nachname" },
  { tag: "din-empfaenger-strasse", key: "empf_strasse" },
  { tag: "din-empfaenger-ort", key: "empf_ort" },

  // 3. Infoblock
  { tag: "din-ihr-zeichen", key: "ref_ihr_zeichen" },
  { tag: "din-ihr-schreiben", key: "ref_ihr_schreiben" },
  { tag: "din-unser-zeichen", key: "ref_unser_zeichen" },
  { tag: "din-unser-schreiben", key: "ref_unser_schreiben" },
  { tag: "din-durchwahl", key: "ref_tel" },
  { tag: "din-email-direkt", key: "ref_email" },
  { tag: "din-internet", key: "ref_web" },
  { tag: "din-datum", key: "datum" },

  // 4. Briefkern
  { tag: "din-betreff", key: "betreff" },
  { tag: "din-anrede", key: "anrede" },
  { tag: "din-text", key: "text" },
  { tag: "din-text-spiegel", key: "mirror", internal: true },
  { tag: "din-grussformel", key: "grussformel" },
  { tag: "din-unterschrift", key: "unterschrift" },
  { tag: "din-anlagen", key: "anlagen" },

  // 5. Fusszeile
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
]);

/* ── MARKDOWN PARSER ────────────────────────────────────────── */

export function parseMarkdown(raw) {
  if (!raw) return '';

  // 1. XSS-Escape
  let html = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = html.split('\n');
  const out = [];
  let inOrderedList = false;
  let inUnorderedList = false;

  for (const line of lines) {
    // Nummerierte Liste: "1. "
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      inUnorderedList = false;
      if (!inOrderedList) {
        out.push('<div class="md-list md-list-ordered">');
        inOrderedList = true;
      }
      out.push(
        `<div class="md-list-item">` +
        `<span class="md-marker">${orderedMatch[1]}.</span>` +
        `<span class="md-num">${orderedMatch[1]}.</span>` +
        `${applyInline(orderedMatch[2])}` +
        `</div>`
      );
      continue;
    }

    // Bullet-Liste: "- "
    const bulletMatch = line.match(/^- \s*(.+)$/);
    if (bulletMatch) {
      inOrderedList = false;
      if (!inUnorderedList) {
        out.push('<div class="md-list md-list-unordered">');
        inUnorderedList = true;
      }
      out.push(
        `<div class="md-list-item">` +
        `<span class="md-marker">-</span>` +
        `<span class="md-bullet">•</span>` +
        `${applyInline(bulletMatch[1])}` +
        `</div>`
      );
      continue;
    }

    // Zitat: "> "
    const quoteMatch = line.match(/^&gt;\s*(.*)$/);
    if (quoteMatch) {
      if (inOrderedList || inUnorderedList) out.push('</div>');
      inOrderedList = inUnorderedList = false;
      out.push(
        `<blockquote class="md-quote">` +
        `<span class="md-marker">&gt; </span>` +
        `${applyInline(quoteMatch[1])}` +
        `</blockquote>`
      );
      continue;
    }

    // Liste schließen
    if (inOrderedList || inUnorderedList) {
      out.push('</div>');
      inOrderedList = inUnorderedList = false;
    }

    out.push(applyInline(line));
  }

  if (inOrderedList || inUnorderedList) out.push('</div>');

  return out.join('\n').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
}

function applyInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<span class="md-marker">**</span><strong>$1</strong><span class="md-marker">**</span>')
    .replace(/__(.+?)__/g, '<span class="md-marker">__</span><u>$1</u><span class="md-marker">__</span>');
}

/* ── GREETINGS ENGINE ───────────────────────────────────────── */

export const Greetings = {
  process: (text, formality = "formal") => {
    if (!text) return "Sehr geehrte Damen und Herren,";
    const lower = text.toLowerCase();
    const isHerr = lower.includes("herr");
    const isFrau = lower.includes("frau");
    const name = text.split(/\s+/).pop();
    
    if (isHerr) return `Sehr geehrter Herr ${name},`;
    if (isFrau) return `Sehr geehrte Frau ${name},`;
    return "Sehr geehrte Damen und Herren,";
  }
};

/* ── TEMPORAL DATE LOGIC ────────────────────────────────────── */

export function todayISO() {
  return Temporal.Now.plainDateISO(Temporal.Now.timeZoneId()).toString();
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = Temporal.PlainDate.from(iso);
  return `${d.day.toString().padStart(2, '0')}.${d.month.toString().padStart(2, '0')}.${d.year}`;
}

/* ── BUSINESS LOGIC (IBAN, RETURN-LINE) ─────────────────────── */

export function deriveReturnLine(data) {
  const { sender_fn = "", sender_ln = "", sender_st = "", sender_city = "" } = data;
  const initial = sender_fn.trim().charAt(0);
  const namePart = initial ? `${initial}. ${sender_ln.trim()}` : sender_ln.trim();
  return [namePart, sender_st.trim(), sender_city.trim()].filter(Boolean).join(" · ");
}

export function validateIBAN(raw) {
  if (!raw) return false;
  const clean = raw.replace(/\s+/g, "").toUpperCase();
  return /[A-Z]{2}[0-9]{20}/.test(clean);
}

export function validateAddressZone(content) {
  if (!content) return { isValid: true, lineCount: 0 };
  const recipientKeys = ["supplement", "rect_co", "rect_fn", "rect_ln", "rect_st", "rect_city"];
  const lineCount = recipientKeys.reduce((acc, key) => acc + (content[key]?.trim() ? 1 : 0), 0);
  return { isValid: lineCount <= 6, lineCount };
}
