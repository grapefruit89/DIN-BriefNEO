/**
 * logic.js — Unified Business Logic & Constants (Pure Edition)
 * [ADR-017] Flat & Pure Architecture
 * ─────────────────────────────────────────────────────────────
 */

/* ── CONSTANTS & REGISTRY ──────────────────────────────────── */

export const IMR = Object.freeze([
  { tag: "din-absender-vorname", key: "sender_fn" },
  { tag: "din-absender-nachname", key: "sender_ln" },
  { tag: "din-absender-strasse", key: "sender_st" },
  { tag: "din-absender-ort", key: "sender_city" },
  { tag: "din-absender-kontakt", key: "sender_contact" },
  { tag: "din-absender-mail", key: "sender_mail" },
  { tag: "din-absender-tel", key: "sender_tel" },
  { tag: "din-return-line", key: "return_line" },
  { tag: "din-supplement", key: "supplement" },
  { tag: "din-empfaenger-firma", key: "rect_co" },
  { tag: "din-empfaenger-abteilung", key: "rect_dept" },
  { tag: "din-empfaenger-vorname", key: "rect_fn" },
  { tag: "din-empfaenger-nachname", key: "rect_ln" },
  { tag: "din-empfaenger-strasse", key: "rect_st" },
  { tag: "din-empfaenger-ort", key: "rect_city" },
  { tag: "din-ref-ihr-zeichen", key: "ref_ihr_zeichen" },
  { tag: "din-ref-ihr-schreiben", key: "ref_ihr_schreiben" },
  { tag: "din-ref-unser-zeichen", key: "ref_unser_zeichen" },
  { tag: "din-ref-unser-schreiben", key: "ref_unser_schreiben" },
  { tag: "din-ref-telefon", key: "ref_tel" },
  { tag: "din-ref-email", key: "ref_email" },
  { tag: "din-ref-internet", key: "ref_web" },
  { tag: "din-date", key: "date" },
  { tag: "din-subject", key: "subject" },
  { tag: "din-anrede", key: "salutation" },
  { tag: "din-text", key: "body" },
  { tag: "din-grussformel", key: "greeting" },
  { tag: "din-signature", key: "signature" },
  { tag: "din-attachments", key: "attachments" },
  { tag: "din-footer-bank-name", key: "footer_bank" },
  { tag: "din-footer-iban", key: "footer_iban" },
  { tag: "din-footer-bic", key: "footer_bic" },
  { tag: "din-footer-anschrift", key: "footer_addr" },
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
