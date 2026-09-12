// @ts-check
/**
 * DIN-Brief Neo - Experimentelles On-Device KI-Addon (Gemini Nano)
 * 
 * DESIGN-PRINZIPIEN (ABSTURZSICHERHEIT & DATENSCHUTZ):
 * 1. 100% On-Device: Nutzt Chrome Built-in AI (globales `Rewriter`, nicht das
 *    obsolet gewordene window.ai). Kein Byte verlässt das Gerät.
 * 2. 100% Defensive: Feature-Detect ('Rewriter' in self) + availability() strikt vor jedem Zugriff.
 * 3. Silent Degradation: Wenn die API nicht existiert oder fehlschlägt, passiert NICHTS.
 * 4. Opt-in: Standardmäßig deaktiviert, kann über den Schalter in der Sidebar aktiviert werden.
 * 5. Zero Core Dependencies: Keine Kopplung an interne Klassen. Standard W3C Selection & Range API.
 */

import { showToast } from '../32-toast.js';

const AI_CONFIG = {
  storageKey: 'din_addon_ai_enabled',
  sidebarToggleId: 'toggle-experimental-ai',
  toolbarRewriteBtnId: 'btn-ai-rewrite',
  brieftextId: 'brieftext'
};

export class AIAssistantAddon {
  constructor() {
    this.enabled = this._readSettings();
    /** @type {any} */
    this.rewriterInstance = null;
    this.toggleEl = /** @type {HTMLInputElement | null} */ (document.getElementById(AI_CONFIG.sidebarToggleId));
    this.rewriteBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById(AI_CONFIG.toolbarRewriteBtnId));
  }

  /**
   * Initialisiert das Addon absturzsicher
   */
  async init() {
    try {
      this.toggleEl = /** @type {HTMLInputElement | null} */ (document.getElementById(AI_CONFIG.sidebarToggleId));
      this.rewriteBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById(AI_CONFIG.toolbarRewriteBtnId));

      // 1+2. Feature-Detect + Verfügbarkeit (Globals, NICHT window.ai — obsolet).
      // Der frühere window.ai-Gate retournierte vor _checkAvailability() und
      // machte den Port auf aktuellen Chrome tot (Grok-Re-Review H5).
      const availability = await this._checkAvailability();
      if (!availability.supported) {
        this._updateUIUnsupported(availability.statusText);
        return;
      }

      // 3. UI für unterstützten Browser scharfschalten
      this._updateUISupported(availability.statusText);

      // 4. Falls vom Nutzer aktiviert: Toolbar-Button einblenden
      if (this.enabled && this.rewriteBtn) {
        this.rewriteBtn.classList.remove('hidden');
      }

      this._attachListeners();
    } catch (err) {
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
      /* Audit H5: window.ai.* ist obsolet (Chromium-Bestätigung) — die
       * APIs leben als Globals (Rewriter, Writer, LanguageModel) und
       * availability() liefert 'available'|'downloadable'|'downloading'|'unavailable'. */
      if (!('Rewriter' in self)) {
        return { supported: false, statusText: 'Rewriter API nicht verfügbar' };
      }
      const status = await /** @type {any} */ (self).Rewriter.availability();
      const supported = status === 'available' || status === 'downloadable' || status === 'downloading';
      return {
        supported,
        statusText: supported ? (status === 'available' ? 'Bereit (Gemini Nano)' : 'Modell-Ladung: ' + status) : 'Modell nicht verfügbar'
      };
    } catch (e) {
      return { supported: false, statusText: 'Nicht verfügbar' };
    }
  }

  /**
   * @param {string} reason
   */
  _updateUIUnsupported(reason) {
    if (this.toggleEl) {
      this.toggleEl.disabled = true;
      this.toggleEl.checked = false;
      this.toggleEl.title = reason;
      const parent = this.toggleEl.closest('.sidebar-switch-row');
      if (parent) {
        parent.setAttribute('title', reason);
      }
    }
    if (this.rewriteBtn) {
      this.rewriteBtn.classList.add('hidden');
    }
  }

  /**
   * @param {string} statusText
   */
  _updateUISupported(statusText) {
    if (this.toggleEl) {
      this.toggleEl.disabled = false;
      this.toggleEl.checked = this.enabled;
      this.toggleEl.title = `On-Device KI: ${statusText}`;
      const parent = this.toggleEl.closest('.sidebar-switch-row');
      if (parent) {
        parent.setAttribute('title', `On-Device KI: ${statusText}`);
      }
    }
  }

  _attachListeners() {
    if (this.toggleEl) {
      this.toggleEl.addEventListener('change', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        this.enabled = target.checked;
        try {
          localStorage.setItem(AI_CONFIG.storageKey, this.enabled ? 'true' : 'false');
        } catch (err) {}

        if (this.rewriteBtn) {
          this.rewriteBtn.classList.toggle('hidden', !this.enabled);
        }
      });
    }

    if (this.rewriteBtn) {
      this.rewriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.rewriteSelection();
      });
    }
  }

  /**
   * Schreibt markierten Text mit Gemini Nano förmlicher um
   */
  async rewriteSelection() {
    try {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text) {
        showToast('Bitte markieren Sie zuerst den umzuformulierenden Text.', 'info');
        return;
      }


      if (!this.rewriterInstance && 'Rewriter' in self) {
        this.rewriterInstance = await /** @type {any} */ (self).Rewriter.create({
          tone: 'more-formal',
          length: 'as-is'
        });
      }

      if (this.rewriterInstance) {
        const rewritten = await this.rewriterInstance.rewrite(text);
        if (rewritten && selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(rewritten));

          // Trigger input event for AutoSave
          const briefEl = document.getElementById(AI_CONFIG.brieftextId);
          if (briefEl) {
            briefEl.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      } else {
        showToast('Gemini Nano Rewriter API steht derzeit nicht bereit.', 'warning');
      }
    } catch (err) {
      console.warn('[DIN-AI] Umschreiben fehlgeschlagen:', err);
      showToast('❌ Umformulierung fehlgeschlagen', 'error');
    }
  }
}

// Sichere Initialisierung bei Laden
if (typeof window !== 'undefined') {
  const addon = new AIAssistantAddon();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => addon.init());
  } else {
    addon.init();
  }
}
