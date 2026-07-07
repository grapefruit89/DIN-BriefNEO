export class DateFormatter {
  constructor(uiContext) {
    this.ui = uiContext;
    this.datumEl = document.getElementById('datum');
    
    this.btnDin = document.getElementById('btn-date-din');
    this.btnIso = document.getElementById('btn-date-iso');
    this.btnLong = document.getElementById('btn-date-long');
    this.buttons = {
      'din': this.btnDin,
      'iso': this.btnIso,
      'long': this.btnLong
    };
    
    this.months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
  }

  init() {
    if (!this.datumEl || !this.btnDin) return;
    
    // Load from settings if exists
    let activeFormat = 'din';
    if (this.ui.settings?.dateFormat) {
      activeFormat = this.ui.settings.dateFormat;
    }
    this.updateActiveButton(activeFormat);
    
    Object.entries(this.buttons).forEach(([formatType, btn]) => {
      btn.addEventListener('click', () => {
        this.updateActiveButton(formatType);
        this.formatDate(formatType);
        this.saveSetting(formatType);
      });
    });
  }
  
  updateActiveButton(activeFormat) {
    Object.values(this.buttons).forEach(btn => btn.setAttribute('aria-pressed', 'false'));
    if (this.buttons[activeFormat]) {
      this.buttons[activeFormat].setAttribute('aria-pressed', 'true');
    }
  }
  
  formatDate(formatType) {
    // Use Temporal API as mandated by Immutable Law Catalog (A1)
    const now = Temporal.Now.plainDateISO();
    
    let formattedDate = '';
    const d = String(now.day).padStart(2, '0');
    const m = String(now.month).padStart(2, '0');
    const y = now.year;
    
    if (formatType === 'iso') {
      formattedDate = `${y}-${m}-${d}`;
    } else if (formatType === 'long') {
      formattedDate = `${now.day}. ${this.months[now.month - 1]} ${y}`;
    } else {
      // din format (default)
      formattedDate = `${d}.${m}.${y}`;
    }
    
    // Preserve prefix like "München, den "
    let currentText = this.datumEl.innerText.trim();
    if (currentText.includes(', den ')) {
       const parts = currentText.split(', den ');
       this.datumEl.innerText = `${parts[0]}, den ${formattedDate}`;
    } else {
       this.datumEl.innerText = formattedDate;
    }
  }

  saveSetting(formatType) {
    if (!this.ui.settings) this.ui.settings = {};
    this.ui.settings.dateFormat = formatType;
    if (typeof this.ui.saveSettings === 'function') {
      this.ui.saveSettings();
    }
  }
}
