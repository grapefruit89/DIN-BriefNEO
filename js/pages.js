/* ── PAGE MANAGER (Multi-Page Flow) ────────────────────────── */
import { Toast } from "./toast.js";

export class PageManager {
  constructor(ui) {
    this.ui = ui;
    this.paper = document.getElementById("paper");
    this.template = document.getElementById("tpl-din-page");
    this.maxHeight = 580; // Fallback
    this._isReflowing = false;
    this._isDirty = false;
  }

  init() {
    console.log("[PAGE] PageManager active.");
    this.calibrate();
    this.checkFlow();
  }

  /**
   * Berechnet den verfügbaren Platz basierend auf der aktuellen DIN-Geometrie
   */
  calibrate() {
    const firstPage = this.paper.querySelector("din-A4");
    if (!firstPage) return;

    const spacer = firstPage.querySelector("din-header-spacer");
    const fuss = firstPage.querySelector("din-fuss");

    if (spacer && fuss) {
      // Verfügbarer Platz zwischen Header-Ende und Fußzeilen-Beginn
      const available = fuss.offsetTop - spacer.offsetTop - spacer.offsetHeight - 20;
      this.maxHeight = Math.max(available, 100); 
    }
  }

  /**
   * Prüft den Textfluss und verteilt Inhalte auf Seiten
   */
  async checkFlow() {
    if (this._isReflowing) {
      this._isDirty = true;
      return;
    }
    this._isReflowing = true;

    this.calibrate();

    const pages = Array.from(this.paper.querySelectorAll("din-A4"));
    const MAX_PAGES = 12;
    let fullText = this.ui.sm.state.content.text || "";

    let remainingText = fullText;
    let pageIdx = 0;

    while (remainingText.length > 0 || pageIdx === 0) {
      if (pageIdx >= MAX_PAGES) {
        Toast.show(`Limit erreicht: Max ${MAX_PAGES} Seiten.`, "warning");
        break;
      }

      let currentPage = pages[pageIdx];
      if (!currentPage) {
        currentPage = this.createNewPage(pageIdx + 1);
        pages.push(currentPage);
      }

      const textEl = currentPage.querySelector("din-text");
      const mirrorEl = currentPage.querySelector("din-text-spiegel");
      
      textEl.textContent = remainingText;
      this.ui._updateMirror(textEl.textContent, mirrorEl);

      const overflowResult = this.findSplitPoint(textEl);
      if (overflowResult.overflow) {
        const splitIdx = overflowResult.splitIndex;
        const pageText = remainingText.substring(0, splitIdx);
        remainingText = remainingText.substring(splitIdx).trim();
        textEl.textContent = pageText;
        this.ui._updateMirror(pageText, mirrorEl);
      } else {
        remainingText = "";
      }
      pageIdx++;
    }

    while (pages.length > pageIdx && pages.length > 1) {
      pages.pop().remove();
    }

    this._isReflowing = false;
    
    // Re-trigger if dirty
    if (this._isDirty) {
      this._isDirty = false;
      this.checkFlow();
    }
  }

  createNewPage(num) {
    const clone = this.template.content.cloneNode(true);
    const page = clone.querySelector("din-A4");
    page.id = `page-${num}`;
    
    // Header auf Folgeseiten ist via CSS (Phase 1) geregelt
    this.paper.appendChild(page);
    return page;
  }

  findSplitPoint(el) {
    const limit = this.maxHeight;
    if (el.scrollHeight <= limit) return { overflow: false };

    // Binary Search für den Split-Point
    let text = el.textContent;
    let low = 0;
    let high = text.length;
    let bestSplit = 0;

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      el.textContent = text.substring(0, mid);
      
      if (el.scrollHeight <= limit) {
        bestSplit = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // An Wortgrenze abrunden
    const lastSpace = text.lastIndexOf(" ", bestSplit);
    const lastNewline = text.lastIndexOf("\n", bestSplit);
    const splitIndex = Math.max(lastSpace, lastNewline, 0);

    return { overflow: true, splitIndex: splitIndex || bestSplit };
  }
}
