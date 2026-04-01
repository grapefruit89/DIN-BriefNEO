/* ── PAGE MANAGER (Hybrid 3D Carousel) ────────────────────── */
import { Toast } from "./toast.js";

export class PageManager {
  constructor(ui) {
    this.ui = ui;
    this.paper = document.getElementById("paper");
    this.viewport = document.getElementById("paper-viewport");
    this.template = document.getElementById("tpl-din-page");
    this.maxHeight = 580; 
    this._currentIndex = 1; // 1-basiert für CSS --position
    this._isReflowing = false;
    this._isDirty = false;
  }

  init() {
    this._initNavigation();
    this.calibrate();
    this.checkFlow();
  }

  _initNavigation() {
    const prevBtn = document.getElementById("btn-prev");
    const nextBtn = document.getElementById("btn-next");
    const addBtn = document.getElementById("btn-add-page");

    if (prevBtn) prevBtn.onclick = () => this.goToPage(this._currentIndex - 1);
    if (nextBtn) nextBtn.onclick = () => this.goToPage(this._currentIndex + 1);
    if (addBtn) addBtn.onclick = () => this.addEmptyPage();

    // Keyboard-Support: Pfeiltasten (nur wenn kein Input fokussiert ist)
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      if (document.activeElement.getAttribute("contenteditable") === "plaintext-only") return;

      if (e.key === "ArrowLeft") this.goToPage(this._currentIndex - 1);
      if (e.key === "ArrowRight") this.goToPage(this._currentIndex + 1);
    });

    // Klick auf eine Seite bringt sie in den Vordergrund
    this.paper.addEventListener("click", (e) => {
      const page = e.target.closest("din-A4");
      if (page) {
        const idx = parseInt(page.style.getPropertyValue("--i"));
        if (idx) this.goToPage(idx);
      }
    });
  }

  goToPage(index) {
    const pages = this.paper.querySelectorAll("din-A4");
    const total = pages.length;
    if (index < 1 || index > total) return;

    this._currentIndex = index;
    this.paper.style.setProperty("--position", index);
    
    pages.forEach((p, i) => {
      p.classList.toggle("active", (i + 1) === index);
    });

    this._updateNavButtons(total);
    this._updatePageInfo(index, total);
  }

  _updatePageInfo(current, total) {
    const info = document.getElementById("page-info");
    if (info) info.textContent = `Seite ${current} / ${total}`;
  }

  _updateNavButtons(total) {
    const prevBtn = document.getElementById("btn-prev");
    const nextBtn = document.getElementById("btn-next");
    if (prevBtn) prevBtn.disabled = this._currentIndex <= 1;
    if (nextBtn) nextBtn.disabled = this._currentIndex >= total;
  }

  calibrate() {
    const firstPage = this.paper.querySelector("din-A4");
    if (!firstPage) return;
    const spacer = firstPage.querySelector("din-header-spacer");
    const fuss = firstPage.querySelector("din-fuss");
    if (spacer && fuss) {
      const available = fuss.offsetTop - spacer.offsetTop - spacer.offsetHeight - 20;
      this.maxHeight = Math.max(available, 100); 
    }
  }

  async checkFlow() {
    if (this._isReflowing) { this._isDirty = true; return; }
    this._isReflowing = true;
    this.calibrate();

    const pages = Array.from(this.paper.querySelectorAll("din-A4"));
    let remainingText = this.ui.sm.state.content.text || "";
    let pageIdx = 0;

    while (remainingText.length > 0 || pageIdx === 0) {
      if (pageIdx >= 12) break;
      let currentPage = pages[pageIdx] || this.createNewPage(pageIdx + 1);
      if (!pages[pageIdx]) pages.push(currentPage);

      const textEl = currentPage.querySelector("din-text");
      const mirrorEl = currentPage.querySelector("din-text-spiegel");
      
      textEl.textContent = remainingText;
      this.ui._updateMirror(remainingText, mirrorEl);

      const overflow = this.findSplitPoint(textEl);
      if (overflow.overflow) {
        const splitIdx = overflow.splitIndex;
        const pageText = remainingText.substring(0, splitIdx);
        remainingText = remainingText.substring(splitIdx).trim();
        textEl.textContent = pageText;
        this.ui._updateMirror(pageText, mirrorEl);
      } else {
        remainingText = "";
      }
      pageIdx++;
    }

    // Überflüssige Seiten löschen
    while (pages.length > pageIdx && pages.length > 1) {
      pages.pop().remove();
    }

    // Indizes aktualisieren
    this.paper.querySelectorAll("din-A4").forEach((p, i) => {
      p.style.setProperty("--i", i + 1);
    });
    this.paper.style.setProperty("--items", pageIdx);

    this._isReflowing = false;
    this._updateNavButtons(pageIdx);
    
    if (this._isDirty) {
      this._isDirty = false;
      this.checkFlow();
    }
  }

  createNewPage(num) {
    const clone = this.template.content.cloneNode(true);
    const page = clone.querySelector("din-A4");
    page.id = `page-${num}`;
    page.style.setProperty("--i", num);
    this.paper.appendChild(page);
    return page;
  }

  findSplitPoint(el) {
    const limit = this.maxHeight;
    if (el.scrollHeight <= limit) return { overflow: false };
    let text = el.textContent, low = 0, high = text.length, best = 0;
    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      el.textContent = text.substring(0, mid);
      if (el.scrollHeight <= limit) { best = mid; low = mid + 1; } else high = mid - 1;
    }
    const lastSpace = text.lastIndexOf(" ", best);
    const lastNewline = text.lastIndexOf("\n", best);
    return { overflow: true, splitIndex: Math.max(lastSpace, lastNewline, 0) || best };
  }

  addEmptyPage() {
    const total = this.paper.querySelectorAll("din-A4").length;
    if (total >= 12) {
      Toast.show("Maximal 12 Seiten erlaubt", "warning");
      return;
    }
    this.createNewPage(total + 1);
    this.paper.style.setProperty("--items", total + 1);
    this.goToPage(total + 1);
    Toast.show(`Seite ${total + 1} hinzugefügt`, "success");
  }
}
