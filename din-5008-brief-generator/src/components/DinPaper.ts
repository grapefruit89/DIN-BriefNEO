// src/components/DinPaper.ts
import { getState, subscribe } from '../store/state';

export class DinPaper extends HTMLElement {
  private currentLayout: string = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private resizeObserver: ResizeObserver | null = null;

  connectedCallback() {
    this.currentLayout = getState().layoutMode;
    this.render();
    
    // Listen for layout changes
    subscribe(() => {
      const newLayout = getState().layoutMode;
      if (this.currentLayout !== newLayout) {
        this.currentLayout = newLayout;
        this.render();
      }
    });

    const canvas = document.getElementById('a4_canvas');
    if (canvas) {
      this.resizeObserver = new ResizeObserver(() => {
        this.setupScaling();
      });
      this.resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', () => this.setupScaling());
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  render() {
    const layout = this.currentLayout; // 'form-a' or 'form-b'
    
    // Top margin depends on DIN form
    const topMargin = layout === 'form-a' ? '32mm' : '50mm';
    const fold1 = layout === 'form-a' ? '87mm' : '105mm';
    const fold2 = layout === 'form-a' ? '192mm' : '210mm';

    this.shadowRoot!.innerHTML = `
      <style>
        .sheet {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 210mm;
          height: 297mm;
          background: white;
          color: black;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          font-family: 'Inter', Arial, sans-serif;
          font-size: 11pt;
          box-sizing: border-box;
          transform-origin: center center;
        }

        .fold-mark-1, .fold-mark-2, .punch-mark {
          position: absolute;
          left: 0;
          width: 5mm;
          border-top: 0.5pt solid black;
          opacity: 0.35;
        }
        
        .fold-mark-1 { top: ${fold1}; }
        .punch-mark { top: 148.5mm; }
        .fold-mark-2 { top: ${fold2}; }

        .address-window {
          position: absolute;
          left: 20mm;
          top: ${topMargin};
          width: 85mm;
          height: 45mm;
          /* Outline for debug/visual guides */
          border: 1px dashed transparent;
        }

        .return-address {
          font-size: 8pt;
          text-decoration: underline;
          margin-bottom: 2mm;
        }

        .recipient-address {
          display: flex;
          flex-direction: column;
          gap: 1mm;
        }

        .sender-block {
          position: absolute;
          right: 20mm;
          top: ${topMargin};
          width: 75mm;
          text-align: right;
        }

        .info-block {
          position: absolute;
          right: 20mm;
          top: calc(${topMargin} + 50mm);
          width: 75mm;
        }

        .content-block {
          position: absolute;
          left: 25mm;
          right: 20mm;
          top: calc(${topMargin} + 45mm + 8.46mm); /* Below address window with spacing */
        }
        
        /* Utility */
        .flex-row { display: flex; gap: 4px; }
        .mt-4 { margin-top: 1rem; }
        .mt-8 { margin-top: 2rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .font-bold { font-weight: bold; }

        /* DinField Element Styles (injected for shadow DOM) */
        .din-field-element {
          display: block;
          position: relative;
          min-height: 1.5em;
          padding: 0.1em 0;
          outline: none;
          white-space: pre-wrap;
          word-break: break-word;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
          cursor: text;
          text-wrap: pretty;
        }
        .din-field-element:hover, .din-field-element:focus {
          border-bottom-color: rgba(13, 148, 136, 0.5);
        }
        .din-field-element.has-placeholder::before {
          content: attr(data-placeholder);
          position: absolute;
          left: 0;
          top: 0.1em;
          color: oklch(58% 0.015 260);
          pointer-events: none;
          user-select: none;
          opacity: 0.65;
          font-style: italic;
          font-feature-settings: "tnum";
          letter-spacing: 0.01em;
          transition: opacity 0.15s ease;
        }
        .din-field-element.has-placeholder:not(:empty)::before {
          display: none;
        }
        .din-field-element:focus::before {
          opacity: 0.4;
        }
      </style>
      
      <div class="sheet">
        <!-- Marks -->
        <div class="fold-mark-1"></div>
        <div class="punch-mark"></div>
        <div class="fold-mark-2"></div>

        <!-- Sender Block -->
        <div class="sender-block">
          <din-field id="sender_company" data-placeholder="Firma"></din-field>
          <din-field id="sender_name" data-placeholder="Ihr Name"></din-field>
          <din-field id="sender_street" data-placeholder="Straße Nr."></din-field>
          <din-field id="sender_zip_city" data-placeholder="PLZ Ort"></din-field>
          <din-field id="sender_phone" data-placeholder="Telefon"></din-field>
          <din-field id="sender_email" data-placeholder="E-Mail"></din-field>
        </div>

        <!-- Address Window -->
        <div class="address-window">
          <div class="return-address">
            <din-field id="sender_address_small" data-placeholder="Rücksendeadresse (Max 85 Zeichen)"></din-field>
          </div>
          <div class="recipient-address">
            <din-field id="special_notes" data-placeholder="Zusatzvermerk (z.B. Einschreiben)"></din-field>
            <din-field id="recipient_company" data-placeholder="Firma"></din-field>
            <din-field id="recipient_name" data-placeholder="Frau/Herr [Name]"></din-field>
            <din-field id="recipient_street" data-placeholder="Straße Hausnummer"></din-field>
            <div class="flex-row">
              <div style="flex: 1"><din-field id="recipient_zip" data-placeholder="PLZ"></din-field></div>
              <div style="flex: 2"><din-field id="recipient_city" data-placeholder="Ort"></din-field></div>
            </div>
          </div>
        </div>

        <!-- Info Block (Datum, Zeichen etc.) -->
        <div class="info-block">
          <din-field id="info_date" data-placeholder="Datum"></din-field>
        </div>

        <!-- Content Block -->
        <div class="content-block">
          <div class="font-bold mb-2">
            <din-field id="subject" data-placeholder="Betreff"></din-field>
          </div>
          <div class="mb-2">
            <din-field id="salutation" data-placeholder="Anrede,"></din-field>
          </div>
          
          <div class="mt-4">
            <din-field id="body_text" data-placeholder="Brieftext hier eingeben..." style="min-height: 100px;"></din-field>
          </div>

          <div class="mt-8">
            <din-field id="greeting" data-placeholder="Grußformel"></din-field>
            <div style="height: 1.5em;"></div> 
            <din-field id="signature_name" data-placeholder="Name Unterzeichner"></din-field>
          </div>
        </div>

      </div>
    `;
    
    // Scale logic
    this.setupScaling();
  }

  setupScaling() {
    const sheet = this.shadowRoot!.querySelector('.sheet') as HTMLElement;
    if (!sheet) return;
    
    // We get the main canvas area width/height and scale the sheet
    const canvas = document.getElementById('a4_canvas');
    if (canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0) {
      const padding = 64; // 32px padding on all sides
      const containerWidth = Math.max(10, canvas.clientWidth - padding);
      const containerHeight = Math.max(10, canvas.clientHeight - padding);
      
      const targetWidth = 794; // approx 210mm in px at 96dpi
      const targetHeight = 1123; // approx 297mm in px at 96dpi
      
      const scaleX = containerWidth / targetWidth;
      const scaleY = containerHeight / targetHeight;
      const scale = Math.max(0.05, Math.min(scaleX, scaleY));
      
      sheet.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
    }
  }
}

if (!customElements.get('din-paper')) {
  customElements.define('din-paper', DinPaper);
}
