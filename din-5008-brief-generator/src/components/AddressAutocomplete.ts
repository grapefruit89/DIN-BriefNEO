// src/components/AddressAutocomplete.ts

export class AddressAutocomplete extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = `
      <style>
        input {
          width: 100%;
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.25rem;
          background-color: #1e293b;
          border: 1px solid #334155;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus {
          border-color: #14b8a6;
        }
      </style>
      <input type="text" placeholder="Straße, PLZ oder Stadt suchen..." />
    `;

    const input = this.shadowRoot!.querySelector('input');
    input?.addEventListener('input', (e) => {
      // In Zukunft hier Geoapify/Photon API anbinden
      console.log('Suche nach:', (e.target as HTMLInputElement).value);
    });
  }
}

if (!customElements.get('address-autocomplete')) {
  customElements.define('address-autocomplete', AddressAutocomplete);
}
