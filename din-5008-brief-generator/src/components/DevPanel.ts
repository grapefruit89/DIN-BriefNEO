// src/components/DevPanel.ts
import { getState } from '../store/state';

export class DevPanel extends HTMLElement {
  private isExpanded: boolean = false;
  private logs: string[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.hijackConsole();
  }

  private hijackConsole() {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      this.logs.push(`[INFO] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
      this.updateLogs();
    };
    
    const originalWarn = console.warn;
    console.warn = (...args) => {
      originalWarn(...args);
      this.logs.push(`[WARN] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
      this.updateLogs();
    };

    const originalError = console.error;
    console.error = (...args) => {
      originalError(...args);
      this.logs.push(`[ERROR] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
      this.updateLogs();
    };
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          z-index: 9999;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          display: none;
        }

        :host-context(html[data-dev-mode="true"]) {
          display: block;
        }

        /* Fallback for browsers that don't support :host-context well */
        :host(.dev-active) {
          display: block;
        }

        .panel-container {
          background-color: #0f172a;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          width: 320px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background-color: #1e293b;
          border-bottom: 1px solid #334155;
          cursor: pointer;
          user-select: none;
        }

        .header-title {
          font-weight: 600;
          color: #38bdf8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-icon {
          transition: transform 0.2s;
          color: #94a3b8;
        }

        .content {
          display: ${this.isExpanded ? 'block' : 'none'};
          max-height: 400px;
          overflow-y: auto;
        }

        .section {
          padding: 0.75rem;
          border-bottom: 1px solid #334155;
        }
        
        .section:last-child {
          border-bottom: none;
        }

        .section-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .btn {
          display: block;
          width: 100%;
          padding: 0.375rem 0.5rem;
          margin-bottom: 0.5rem;
          background-color: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 0.25rem;
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .btn:hover {
          background-color: #334155;
          border-color: #475569;
        }

        .btn-danger {
          color: #f87171;
        }
        .btn-danger:hover {
          background-color: rgba(248, 113, 113, 0.1);
          border-color: #f87171;
        }

        .btn-primary {
          color: #34d399;
        }
        .btn-primary:hover {
          background-color: rgba(52, 211, 153, 0.1);
          border-color: #34d399;
        }

        .logs-container {
          background-color: #020617;
          border-radius: 0.25rem;
          padding: 0.5rem;
          height: 120px;
          overflow-y: auto;
          font-size: 10px;
          line-height: 1.4;
          white-space: pre-wrap;
        }

        .log-entry { margin-bottom: 0.25rem; }
        .log-entry.warn { color: #fbbf24; }
        .log-entry.error { color: #f87171; }
        .log-entry.info { color: #94a3b8; }
        
        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      </style>

      <div class="panel-container">
        <div class="header" id="toggle-header">
          <div class="header-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
            Dev Panel
          </div>
          <div class="toggle-icon" style="transform: ${this.isExpanded ? 'rotate(180deg)' : 'rotate(0)'}">▼</div>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Tools</div>
            <button class="btn btn-primary" id="btn-export">Export State (JSON)</button>
            <button class="btn" id="btn-log-state">Log State to Console</button>
            <button class="btn btn-danger" id="btn-clear-storage">Clear LocalStorage</button>
          </div>
          
          <div class="section">
            <div class="section-title">Logs</div>
            <div class="logs-container" id="logs-view"></div>
          </div>
        </div>
      </div>
    `;
    this.updateLogs();
  }

  private setupListeners() {
    const root = this.shadowRoot!;
    
    // Toggle Expand
    root.getElementById('toggle-header')?.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      this.render();
      this.setupListeners();
    });

    // Log State
    root.getElementById('btn-log-state')?.addEventListener('click', () => {
      console.log('Current State:', getState());
      alert('State wurde in der Console (F12) ausgegeben.');
    });

    // Export State
    root.getElementById('btn-export')?.addEventListener('click', () => {
      const data = {
        meta: {
          exportedAt: new Date().toISOString(),
          version: "1.0",
          app: "DIN-BriefNEO"
        },
        data: getState()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `din-brief-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('State exportiert als JSON.');
    });

    // Clear Storage
    root.getElementById('btn-clear-storage')?.addEventListener('click', () => {
      if (confirm('Achtung: Dadurch werden alle lokal gespeicherten Briefdaten gelöscht! Fortfahren?')) {
        localStorage.removeItem('din-letter-data');
        console.warn('LocalStorage (din-letter-data) gelöscht.');
        alert('Daten gelöscht. Bitte laden Sie die Seite neu.');
      }
    });
  }

  private updateLogs() {
    const logsView = this.shadowRoot?.getElementById('logs-view');
    if (logsView) {
      logsView.innerHTML = this.logs.map(log => {
        let typeClass = 'info';
        if (log.startsWith('[WARN]')) typeClass = 'warn';
        if (log.startsWith('[ERROR]')) typeClass = 'error';
        return `<div class="log-entry ${typeClass}">${log}</div>`;
      }).join('');
      // Scroll to bottom
      logsView.scrollTop = logsView.scrollHeight;
    }
  }

  // Called from outside to manually sync visibility class if host-context doesn't work
  public syncVisibility(isDev: boolean) {
    if (isDev) {
      this.classList.add('dev-active');
    } else {
      this.classList.remove('dev-active');
    }
  }
}

if (!customElements.get('dev-panel')) {
  customElements.define('dev-panel', DevPanel);
}
