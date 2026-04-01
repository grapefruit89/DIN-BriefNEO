/* ── ADDRESS SERVICE (Autocomplete & Geo-Search) ──────────── */
import { Toast } from "./toast.js";

export class AddressService {
  constructor(ui) {
    this.ui = ui;
    this._debounce = null;
    this._abortController = null;
    this.portal = document.getElementById("autocomplete-portal");
  }

  get provider() { return this.ui.sm.state.config.addressProvider || "photon"; }
  get geoapifyKey() { return this.ui.sm.state.config.geoapifyKey || ""; }

  init() {
    this._initAutocomplete();
    this._initZipLookup();
    this._initProviderSwitch();
  }

  /**
   * Initialisiert den Provider-Switch und das API-Key-Management
   */
  _initProviderSwitch() {
    const radios = document.querySelectorAll('input[name="address-provider"]');
    const keyInput = document.getElementById("geoapify-api-key");

    if (!radios.length || !keyInput) return;

    // Set initial state
    const activeRadio = Array.from(radios).find(r => r.value === this.provider);
    if (activeRadio) activeRadio.checked = true;
    keyInput.value = this.geoapifyKey;

    // Listen to provider changes
    radios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.ui.sm.update("config.addressProvider", e.target.value);
        
        if (e.target.value === "geoapify" && !this.geoapifyKey) {
          Toast.show("Bitte Geoapify API-Key eingeben", "info");
        }
      });
    });

    // Listen to API key changes with Heartbeat validation
    let keyDebounce;
    keyInput.addEventListener("input", (e) => {
      clearTimeout(keyDebounce);
      const val = e.target.value.trim();
      
      keyDebounce = setTimeout(async () => {
        if (!val) {
          this.ui.sm.update("config.geoapifyKey", "");
          return;
        }

        try {
          // Heartbeat via Header (Sicherer)
          const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1`, {
            headers: { "X-Api-Key": val }
          });
          if (res.ok) {
            this.ui.sm.update("config.geoapifyKey", val);
            Toast.show("Geoapify Key gültig!", "success");
          } else {
            Toast.show("Geoapify Key ungültig", "error");
          }
        } catch (err) {
          Toast.show("Fehler bei der Key-Validierung", "error");
        }
      }, 500);
    });
  }

  /**
   * Initialisiert das Adress-Autocomplete
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
    if (this.provider === "geoapify" && !this.geoapifyKey) {
      Toast.show("Geoapify Key fehlt. Bitte in Sidebar eintragen.", "warning");
      return;
    }

    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    try {
      let suggestions = [];

      if (this.provider === "photon") {
        const bbox = "5.0,45.0,16.0,56.0"; 
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5&bbox=${bbox}`;
        const res = await fetch(url, { signal: this._abortController.signal });
        if (!res.ok) throw new Error("API fail");
        const data = await res.json();
        suggestions = this._parsePhoton(data.features);
      } else if (this.provider === "geoapify") {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=de&limit=5`;
        const res = await fetch(url, { 
          headers: { "X-Api-Key": this.geoapifyKey },
          signal: this._abortController.signal 
        });
        if (!res.ok) throw new Error("API fail");
        const data = await res.json();
        suggestions = this._parseGeoapify(data.features);
      }

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

  _parseGeoapify(features) {
    return features.map(f => {
      const p = f.properties;
      return {
        street: p.street || "",
        houseNumber: p.housenumber || "",
        postcode: p.postcode || "",
        city: p.city || "",
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
