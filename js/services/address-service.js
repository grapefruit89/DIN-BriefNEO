/**
 * js/services/address-service.js — Pure Data Fetching Layer
 * [GEMINI.md] EISERNES GESETZ: 0% DOM-Zugriff. NUR fetch().
 * Baseline: Chrome 147+ (Async/Await).
 */

export class AddressService {
    constructor(config) {
        this.config = config; // Needs access to provider and apiKey
    }

    /**
     * Holt Vorschläge von Photon oder Geoapify.
     * @returns {Promise<Array>} Features array
     */
    async fetchSuggestions(query) {
        if (!query || query.length < 3) return [];

        try {
            let url = '';
            if (this.config.addressProvider === 'photon') {
                url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=de&limit=5`;
            } else {
                if (!this.config.apiKey) return [];
                url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${this.config.apiKey}&limit=5&lang=de`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            return data.features || [];
        } catch (err) {
            console.error("[Service] Fetch failed:", err);
            return [];
        }
    }
}
