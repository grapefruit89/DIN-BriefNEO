/**
 * js/logic/markdown.js — KISS Markdown Parser
 * [ADR-016] Pure Edition Formatting
 * ─────────────────────────────────────────────────────────────
 */

export function parseMarkdown(raw) {
  if (!raw) return "";

  // 1. Escaping (XSS-Schutz — kein User-HTML durchlassen)
  let html = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Formatierungen (Reihenfolge wichtig: längste Marker zuerst)
  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **fett**
    .replace(/__(.*?)__/g, "<u>$1</u>") // __unterstrichen__
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // *kursiv*
    .replace(/^&gt;\s*(.+)$/gm, "<blockquote>$1</blockquote>"); // > Zitat

  // 3. Zeilenumbrüche
  html = html.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");

  return html;
}
