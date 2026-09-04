// @ts-check
/**
 * DIN-Brief Neo - Experimentelles On-Device KI-Addon (Gemini Nano)
 * 
 * DESIGN-PRINZIPIEN (ABSTURZSICHERHEIT & DATENSCHUTZ):
 * 1. 100% On-Device: Nutzt Chrome Built-in AI (window.ai.rewriter). Kein Byte verlässt das Gerät.
 * 2. 100% Defensive: Prüft window.ai und API-Verfügbarkeit strikt vor jedem Zugriff.
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
    /** @type {any} */
    this.writerInstance = null;
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

      // 1. Browser-Support prüfen (window.ai)
      // @ts-ignore
      if (typeof window.ai === 'undefined') {
        this._updateUIUnsupported('Nicht vom Browser unterstützt (Chrome 128+ mit Gemini Nano erforderlich)');
        return;
      }

      // 2. Verfügbarkeit der APIs prüfen
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
        this.rewriteBtn.style.display = 'inline-flex';
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
      let rewriterOk = false;
      let writerOk = false;

      // @ts-ignore
      if (window.ai?.rewriter) {
        // @ts-ignore
        const status = await window.ai.rewriter.availability();
        rewriterOk = (status === 'readily' || status === 'after-download');
      }

      // @ts-ignore
      if (window.ai?.writer) {
        // @ts-ignore
        const status = await window.ai.writer.availability();
        writerOk = (status === 'readily' || status === 'after-download');
      }

      const supported = rewriterOk || writerOk;
      return {
        supported,
        statusText: supported ? 'Bereit (Gemini Nano)' : 'Modell nicht geladen'
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
        parent.classList.add('opacity-50');
      }
    }
    if (this.rewriteBtn) {
      this.rewriteBtn.classList.add('hidden');
      this.rewriteBtn.style.display = 'none';
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
        parent.classList.remove('opacity-50');
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
          if (this.enabled) {
            this.rewriteBtn.classList.remove('hidden');
            this.rewriteBtn.style.display = 'inline-flex';
            showToast('✨ Lokale KI aktiviert (Gemini Nano)', 'success');
          } else {
            this.rewriteBtn.classList.add('hidden');
            this.rewriteBtn.style.display = 'none';
            showToast('Lokale KI deaktiviert', 'info');
          }
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

      showToast('✨ Formuliere Text förmlich um (Gemini Nano)...', 'info');

      // @ts-ignore
      if (!this.rewriterInstance && window.ai?.rewriter) {
        // @ts-ignore
        this.rewriterInstance = await window.ai.rewriter.create({
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
          showToast('✅ Text erfolgreich formalisiert', 'success');

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
