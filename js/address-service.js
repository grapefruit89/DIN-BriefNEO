/**
 * js/address-service.js — Data Fetching & Autocomplete Controller
 * [ADR-008] Decoupled Data & View
 * [CMD-6] CSS Anchor Positioning (Chrome 125+)
 * ───────────────────────────────────────────────────────────────
 */

export class AddressService {
  constructor(sm, ui) {
    this.sm = sm;
    this.ui = ui;
    this._debounce = null;
  }

  init() {
    const fields = [
      { tag: "din-empfaenger-strasse", anchor: "--anchor-rect-st" },
      { tag: "din-empfaenger-ort", anchor: "--anchor-rect-city" },
    ];

    fields.forEach(({ tag, anchor }) => {
      const el = document.querySelector(tag);
      if (!el) return;

      el.addEventListener("input", (e) => {
        clearTimeout(this._debounce);
        const query = e.target.textContent;

        if (query.length < 3) {
          this.ui._closeAutocomplete();
          return;
        }

        this._debounce = setTimeout(
          () => this._performSearch(query, anchor),
          300,
        );
      });

      // Close on blur (delayed to allow clicks)
      el.addEventListener("blur", () => {
        setTimeout(() => this.ui._closeAutocomplete(), 200);
      });
    });
  }

  async _performSearch(query, anchor) {
    try {
      // Default to Photon (No Key required)
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();

      this.ui._renderSuggestions(data.features || [], anchor);
    } catch (err) {
      console.error("[Service] Autocomplete failed:", err);
    }
  }
}
