/* ── ADDRESS SERVICE (Autocomplete & Geo-Search) ──────────── */
import { Toast } from "./toast.js";

export class AddressService {
  constructor(ui) {
    this.ui = ui;
    this._debounce = null;
    this._abortController = null;
    this.portal = document.getElementById("autocomplete-portal");
  }

  init() {
    const el = document.querySelector("din-empfaenger-strasse");
    if (!el || !this.portal) return;

    // Set Anchor Name for CSS Anchor Positioning
    el.style.anchorName = "--anchor-address";

    el.addEventListener("input", (e) => {
      clearTimeout(this._debounce);
      const query = e.target.textContent.trim();
      
      if (query.length < 3) {
        this.close();
        return;
      }

      this._debounce = setTimeout(() => this.search(query), 300);
    });

    // Close on blur (delayed to allow clicks)
    el.addEventListener("blur", () => setTimeout(() => this.close(), 200));
    
    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  async search(query) {
    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    try {
      // Use Photon API (OpenStreetMap)
      const bbox = "5.0,45.0,16.0,56.0"; // DACH-ish region
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5&bbox=${bbox}`;
      
      const res = await fetch(url, { signal: this._abortController.signal });
      if (!res.ok) throw new Error("API fail");
      
      const data = await res.json();
      const suggestions = this._parsePhoton(data.features);
      this.render(suggestions);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.warn("[ADDRESS] Search failed", e);
        Toast.show("Adress-Suche fehlgeschlagen", "warning");
      }
    }
  }

  _parsePhoton(features) {
    return features.map(f => {
      const p = f.properties;
      return {
        street: p.street || p.name || "",
        houseNumber: p.housenumber || "",
        postcode: p.postcode || "",
        city: p.city || p.town || p.village || "",
        display: [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(", ")
      };
    }).filter(s => s.street && s.city); // Must have at least street and city
  }

  render(suggestions) {
    const dropdown = this.portal;
    if (!suggestions.length) {
      this.close();
      return;
    }

    // Safe DOM building
    dropdown.textContent = "";
    suggestions.forEach(item => {
      const option = document.createElement("div");
      option.className = "autocomplete-option";
      option.textContent = item.display;
      option.onclick = () => this.apply(item);
      dropdown.appendChild(option);
    });

    try {
      dropdown.showPopover();
    } catch (e) {}
  }

  apply(item) {
    const sm = this.ui.sm;
    sm.update("content.recipientStreet", `${item.street} ${item.houseNumber}`.trim());
    sm.update("content.recipientZip", item.postcode);
    sm.update("content.recipientCity", item.city);

    // Explicitly sync UI for these fields
    this.ui._syncAll();
    this.close();
    Toast.show("Adresse übernommen!", "success");
  }

  close() {
    try {
      this.portal.hidePopover();
    } catch (e) {}
  }
}
