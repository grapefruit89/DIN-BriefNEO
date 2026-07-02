// src/components/DateSwiper.ts
import { getState, setState, subscribe } from '../store/state';

export class DateSwiper extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    subscribe(() => this.render());
  }

  render() {
    const today = new Date();
    const days = [];
    
    // Generate 5 days (2 before, today, 2 after)
    for (let i = -2; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }

    const currentFormatted = getState().info_date || '';

    this.shadowRoot!.innerHTML = `
      <style>
        .swiper-container {
          display: flex;
          gap: 0.25rem;
          overflow-x: auto;
          padding: 0.25rem 0;
        }
        .swiper-container::-webkit-scrollbar { display: none; }
        .day-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem 0.25rem;
          border-radius: 0.5rem;
          border: 1px solid #334155;
          background: #1e293b;
          color: #94a3b8;
          cursor: pointer;
          min-width: 36px;
          transition: all 0.2s;
        }
        .day-btn:hover { background: #334155; }
        .day-btn.active {
          background: #0d9488;
          border-color: #14b8a6;
          color: white;
          transform: scale(1.05);
        }
        .weekday { font-size: 0.5625rem; opacity: 0.75; }
        .day-num { font-size: 0.75rem; font-weight: 800; }
      </style>
      <div class="swiper-container">
        ${days.map(d => {
          const iso = d.toISOString().split('T')[0];
          const isActive = currentFormatted === iso;
          return `
            <button class="day-btn ${isActive ? 'active' : ''}" data-date="${iso}">
              <span class="weekday">${d.toLocaleDateString('de-DE', { weekday: 'short' })}</span>
              <span class="day-num">${d.getDate()}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    this.shadowRoot!.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const selectedDate = target.getAttribute('data-date');
        if (selectedDate) {
          setState({ info_date: selectedDate });
        }
      });
    });
  }
}

if (!customElements.get('date-swiper')) {
  customElements.define('date-swiper', DateSwiper);
}
