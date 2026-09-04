/**
 * DIN-Brief Neo - Experimentelles On-Device KI-Addon (Gemini Nano)
 * 
 * DESIGN-PRINZIPIEN (ABSTURZSICHERHEIT):
 * 1. 100% Defensive: Prüft window.ai und API-Verfügbarkeit strikt vor jedem Aufruf.
 * 2. Silent Degradation: Wenn die API nicht existiert oder fehlschlägt, passiert NICHTS. Der Brief läuft normal weiter.
 * 3. Opt-in: Standardmäßig deaktiviert, kann über Einstellungen als Experiment freigeschaltet werden.
 * 4. Zero Core Dependencies: Keine Abhängigkeiten zu internen Klassen. Nutzt saubere Standard-DOM-Events.
 */

const AI_CONFIG = {
  storageKey: 'din_addon_ai_enabled',
  sidebarToggleId: 'toggle-experimental-ai',
  brieftextId: 'brieftext',
  toolbarId: 'format-toolbar'
};

class AIAssistantAddon {
  constructor() {
    this.enabled = this._readSettings();
    this.writerInstance = null;
    this.rewriterInstance = null;
    this.proofreaderInstance = null;
  }

  /**
   * Initialisiert das Addon sicher ohne Fehlerrisiko
   */
  async init() {
    try {
      // 1. Prüfen, ob der Nutzer das Addon überhaupt aktiviert hat
      if (!this.enabled) {
        this._injectSettingsSwitch(false);
        return;
      }

      // 2. Prüfen, ob der Browser die Chrome AI überhaupt kennt
      if (typeof window.ai === 'undefined') {
        console.info('[DIN-AI] Chrome Built-in AI (window.ai) in diesem Browser nicht verfügbar.');
        this._injectSettingsSwitch(false, 'Nicht vom Browser unterstützt');
        return;
      }

      // 3. Verfügbarkeits-Check (readily / after-download / no)
      const availability = await this._checkAvailability();
      this._injectSettingsSwitch(true, availability.statusText);

      if (!availability.supported) {
        return;
      }

      // 4. UI-Elemente schonend einbinden
      this._mountUI();
    } catch (err) {
      // Im Fehlerfall absolut geräuschlos bleiben, damit der Brief niemals abstürzt!
      console.warn('[DIN-AI] Addon geräuschlos deaktiviert:', err);
    }
  }

  _readSettings() {
    try {
      return localStorage.getItem(AI_CONFIG.storageKey) === 'true';
    } catch (e) {
      return false;
    }
  }

  async _checkAvailability() {
    try {
      let writerOk = false;
      let rewriterOk = false;

      if (window.ai?.writer) {
        const status = await window.ai.writer.availability();
        writerOk = (status === 'readily' || status === 'after-download');
      }

      if (window.ai?.rewriter) {
        const status = await window.ai.rewriter.availability();
        rewriterOk = (status === 'readily' || status === 'after-download');
      }

      const supported = writerOk || rewriterOk;
      return {
        supported,
        statusText: supported ? 'Bereit (Gemini Nano)' : 'Modell nicht geladen'
      };
    } catch (e) {
      return { supported: false, statusText: 'Deaktiviert' };
    }
  }

  _injectSettingsSwitch(isSupported, hintText = '') {
    try {
      const container = document.querySelector('.sidebar-section');
      if (!container || document.getElementById(AI_CONFIG.sidebarToggleId)) return;

      const group = document.createElement('div');
      group.className = 'sidebar-addon-setting';
      group.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:8px; border-top:1px solid var(--border-dim, #eee);">
          <label for="${AI_CONFIG.sidebarToggleId}" style="font-size:12px; cursor:pointer;">
            ✨ Experimentell: Lokale KI
            <div style="font-size:10px; color:#888;">${hintText}</div>
          </label>
          <input type="checkbox" switch id="${AI_CONFIG.sidebarToggleId}" ${this.enabled ? 'checked' : ''} ${!isSupported ? 'disabled' : ''}>
        </div>
      `;

      container.appendChild(group);

      const toggle = document.getElementById(AI_CONFIG.sidebarToggleId);
      toggle?.addEventListener('change', (e) => {
        try {
          localStorage.setItem(AI_CONFIG.storageKey, e.target.checked ? 'true' : 'false');
          window.location.reload();
        } catch (err) {}
      });
    } catch (e) {}
  }

  _mountUI() {
    try {
      // Button in die Toolbar für "Formaler umschreiben"
      const toolbar = document.getElementById(AI_CONFIG.toolbarId);
      if (toolbar && !document.getElementById('btn-ai-rewrite')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'btn-ai-rewrite';
        btn.title = 'Ausgewählten Text förmlicher formulieren (Lokal)';
        btn.setAttribute('aria-label', 'Förmlicher formulieren');
        btn.innerHTML = '✨ <i>Formal</i>';
        btn.style.fontSize = '11px';
        btn.addEventListener('click', () => this.rewriteSelection());
        toolbar.appendChild(btn);
      }
    } catch (e) {}
  }

  /**
   * Schreibt markierten Text förmlicher um
   */
  async rewriteSelection() {
    try {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text) return;

      if (!this.rewriterInstance && window.ai?.rewriter) {
        this.rewriterInstance = await window.ai.rewriter.create({
          tone: 'more-formal',
          length: 'as-is'
        });
      }

      if (this.rewriterInstance) {
        const rewritten = await this.rewriterInstance.rewrite(text);
        if (rewritten && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(rewritten));
        }
      }
    } catch (err) {
      console.warn('[DIN-AI] Umschreiben fehlgeschlagen:', err);
    }
  }

  /**
   * Generiert einen vollständigen Briefentwurf anhand von Stichpunkten
   */
  async draftLetter(prompt) {
    try {
      if (!this.writerInstance && window.ai?.writer) {
        this.writerInstance = await window.ai.writer.create({
          tone: 'formal',
          format: 'plain-text'
        });
      }

      const briefEl = document.getElementById(AI_CONFIG.brieftextId);
      if (!briefEl || !this.writerInstance) return;

      briefEl.textContent = 'Erstelle Entwurf lokal mit Gemini Nano...';
      const result = await this.writerInstance.write(prompt);
      briefEl.textContent = result;
    } catch (err) {
      console.warn('[DIN-AI] Entwurfsgenerierung fehlgeschlagen:', err);
    }
  }
}

// Sichere Selbst-Initialisierung
if (typeof window !== 'undefined') {
  const addon = new AIAssistantAddon();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => addon.init());
  } else {
    addon.init();
  }
  window.dinAIAssistant = addon;
}
