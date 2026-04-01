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
    this._initAutocomplete();
    this._initZipLookup();
  }

  /**
   * Initialisiert das Adress-Autocomplete (Photon)
   */
  _initAutocomplete() {
    const el = document.querySelector("din-empfaenger-strasse");
    if (!el || !this.portal) return;

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

    el.addEventListener("blur", () => setTimeout(() => this.close(), 200));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  /**
   * Initialisiert den PLZ-Lookup (Zippopotam)
   */
  _initZipLookup() {
    // 1. Anschriftfeld (Empfänger)
    const empfOrtEl = document.querySelector("din-empfaenger-ort");
    if (empfOrtEl) {
      empfOrtEl.addEventListener("input", (e) => {
        const text = e.target.textContent.trim();
        const zipMatch = text.match(/^(\d{5})/);
        if (zipMatch) {
          this.lookupZip(zipMatch[1], (city) => {
            e.target.textContent = `${zipMatch[1]} ${city}`;
            this.ui.sm.update("content.empf_ort", e.target.textContent);
          });
        }
      });
    }

    // 2. Profil-Dialog (Absender)
    const profileZipInput = document.getElementById("profile-zip");
    const profileCityInput = document.getElementById("profile-city");
    if (profileZipInput && profileCityInput) {
      profileZipInput.addEventListener("input", (e) => {
        const zip = e.target.value.trim();
        if (zip.length === 5) {
          this.lookupZip(zip, (city) => {
            profileCityInput.value = city;
            // Trigger change event for StateManager
            profileCityInput.dispatchEvent(new Event("input"));
          });
        }
      });
    }
  }

  /**
   * Holt den Ort zu einer PLZ via Zippopotam API
   */
  async lookupZip(zip, callback) {
    try {
      const res = await fetch(`https://api.zippopotam.us/de/${zip}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.places && data.places.length > 0) {
        const city = data.places[0]["place name"];
        callback(city);
        Toast.show(`Ort gefunden: ${city}`, "info");
      }
    } catch (e) {
      console.warn("[ZIP] Lookup failed", e);
    }
  }

  async search(query) {
    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    try {
      const bbox = "5.0,45.0,16.0,56.0"; 
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5&bbox=${bbox}`;
      
      const res = await fetch(url, { signal: this._abortController.signal });
      if (!res.ok) throw new Error("API fail");
      
      const data = await res.json();
      const suggestions = this._parsePhoton(data.features);
      this.render(suggestions);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.warn("[ADDRESS] Search failed", e);
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
    }).filter(s => s.street && s.city);
  }

  render(suggestions) {
    const dropdown = this.portal;
    if (!suggestions.length) {
      this.close();
      return;
    }

    dropdown.textContent = "";
    suggestions.forEach(item => {
      const option = document.createElement("div");
      option.className = "suggestion-item"; // Match CSS class in components.css
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
    sm.update("content.empf_strasse", `${item.street} ${item.houseNumber}`.trim());
    sm.update("content.empf_ort", `${item.postcode} ${item.city}`.trim());

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
