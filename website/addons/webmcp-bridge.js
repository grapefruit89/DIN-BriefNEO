// @ts-check
// @adr [[ADR-JS]]

/* addons/webmcp-bridge.js — WebMCP Bridge & Polyfill für DIN-BriefNEO.
 *
 * Verbindet den Browser-Tab direkt und ohne Erweiterung mit einem lokalen
 * Bash-Agenten über ws://127.0.0.1:8333.
 * Stellt window.modelContext bereit (W3C WebMCP Standard).
 */

import { Events, eventBus } from '../js/core.js';

/**
 * Setzt den Inhalt eines Feldes, feuert ein Event und lässt es grün aufleuchten.
 * @param {string} id
 * @param {unknown} value
 */
function setField(id, value) {
  if (value === undefined || value === null) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = String(value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.classList.add('flash-success');
  setTimeout(() => el.classList.remove('flash-success'), 600);
}

/**
 * Polyfill für W3C WebMCP (modelContext).
 */
class WebMCPPolyfill {
  constructor() {
    /** @type {Record<string, any>} */
    this.tools = {};
    /** @type {WebSocket | null} */
    this.socket = null;
    /** @type {number | null} */
    this.retryTimer = null;
    this.initWebSocket();
  }

  /**
   * W3C-konforme Tool-Registrierung
   * @param {any} config
   */
  registerTool(config) {
    if (!config?.name) return;
    this.tools[config.name] = config;
    console.log(`[WebMCP] Werkzeug registriert: ${config.name}`);

    this.sendToAgent({
      type: 'REGISTERED_TOOLS',
      tools: Object.keys(this.tools).map((name) => ({
        name: this.tools[name].name,
        description: this.tools[name].description,
        inputSchema: this.tools[name].inputSchema
      }))
    });
  }

  initWebSocket() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    try {
      this.socket = new WebSocket('ws://127.0.0.1:8333');

      this.socket.onopen = () => {
        console.log('[WebMCP] Verbindung zur lokalen Bash steht (Port 8333).');
        if (Object.keys(this.tools).length > 0) {
          this.sendToAgent({
            type: 'REGISTERED_TOOLS',
            tools: Object.values(this.tools).map((t) => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema
            }))
          });
        }
      };

      this.socket.onmessage = async (event) => {
        try {
          const request = JSON.parse(event.data);
          if (request.action === 'execute_tool' && this.tools[request.name]) {
            console.log(`[WebMCP] Führe Tool aus: ${request.name}`);
            const result = await this.tools[request.name].execute(request.arguments || {});
            this.sendToAgent({
              type: 'TOOL_RESULT',
              callId: request.callId,
              result
            });
          }
        } catch (err) {
          console.error('[WebMCP] Fehler bei Tool-Ausführung:', err);
        }
      };

      this.socket.onerror = () => {
        // Stiller Fehlerfall, falls kein Bash-Gateway läuft
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.retryTimer = /** @type {any} */ (setTimeout(() => this.initWebSocket(), 4000));
      };
    } catch (_) {
      this.retryTimer = /** @type {any} */ (setTimeout(() => this.initWebSocket(), 4000));
    }
  }

  /**
   * @param {any} data
   */
  sendToAgent(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
}

// 1. Polyfill aktivieren falls window.modelContext noch nicht nativ existiert
const globalContext = /** @type {any} */ (window);
if (!globalContext.modelContext) {
  globalContext.modelContext = new WebMCPPolyfill();
}

// 2. DIN-Brief Werkzeug deklarieren
globalContext.modelContext.registerTool({
  name: 'fill_din_letter',
  description: 'Befüllt den DIN-5008 Brief-Editor live mit strukturierten Inhalten aus der Bash.',
  inputSchema: {
    type: 'object',
    properties: {
      betreff: { type: 'string', description: 'Betreffzeile des Briefes' },
      text: { type: 'string', description: 'Briefkern (Haupttext)' },
      anrede: { type: 'string', description: 'Briefanrede (z. B. Sehr geehrte Damen und Herren,)' },
      grussformel: { type: 'string', description: 'Grußformel (z. B. Mit freundlichen Grüßen)' },
      unterschrift: { type: 'string', description: 'Name des Unterzeichners' },
      datum: { type: 'string', description: 'Briefdatum' },
      postvermerk: { type: 'string', description: 'Postvermerk (z. B. Einschreiben)' },
      empfaenger: {
        type: 'object',
        properties: {
          firma: { type: 'string' },
          name: { type: 'string' },
          strasse: { type: 'string' },
          ort: { type: 'string' }
        }
      },
      absender: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          strasse: { type: 'string' },
          ort: { type: 'string' },
          tel: { type: 'string' },
          mail: { type: 'string' }
        }
      }
    },
    required: ['betreff', 'text']
  },
  /** @param {any} args */
  execute: async (args) => {
    // 1. Briefkern
    if (args.betreff) setField('betreff', args.betreff);
    if (args.text) setField('text', args.text);
    if (args.anrede) setField('anrede', args.anrede);
    if (args.grussformel) setField('grussformel', args.grussformel);
    if (args.unterschrift) setField('unterschrift', args.unterschrift);
    if (args.datum) setField('datum', args.datum);
    if (args.postvermerk) setField('postvermerk', args.postvermerk);

    // 2. Empfängerblock
    if (args.empfaenger) {
      if (args.empfaenger.firma !== undefined) setField('empfaenger-firma', args.empfaenger.firma);
      if (args.empfaenger.name !== undefined) setField('empfaenger-namenszeile', args.empfaenger.name);
      if (args.empfaenger.strasse !== undefined) setField('empfaenger-strasse', args.empfaenger.strasse);
      if (args.empfaenger.ort !== undefined) setField('empfaenger-ort', args.empfaenger.ort);
    }

    // 3. Absenderblock
    if (args.absender) {
      if (args.absender.name !== undefined) setField('absender-namenszeile', args.absender.name);
      if (args.absender.strasse !== undefined) setField('absender-strasse', args.absender.strasse);
      if (args.absender.ort !== undefined) setField('absender-ort', args.absender.ort);
      if (args.absender.tel !== undefined) setField('absender-tel', args.absender.tel);
      if (args.absender.mail !== undefined) setField('absender-mail', args.absender.mail);
    }

    // 4. Entwurf sofort im localStorage persistieren
    eventBus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });

    return {
      success: true,
      message: 'Brief erfolgreich im DIN-BriefNEO Editor befüllt und gespeichert.'
    };
  }
});
