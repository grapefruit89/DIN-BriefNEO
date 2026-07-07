export class DateFormatter {
  constructor(uiContext) {
    this.ui = uiContext;
    this.selectEl = document.getElementById('sidebar-date-select');
    this.datumEl = document.getElementById('datum');
    
    this.months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
  }

  init() {
    if (!this.selectEl || !this.datumEl) return;
    
    // Load from settings if exists
    if (this.ui.settings?.dateFormat) {
      this.selectEl.value = this.ui.settings.dateFormat;
    }
    
    this.selectEl.addEventListener('change', (e) => {
      this.formatDate(e.target.value);
      this.saveSetting(e.target.value);
    });
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
