// @ts-check
// @adr [[ADR-JS]]
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @adr [[ADR-TOAST-SYSTEM]]
// @guide [[din-5008-css-architektur]]

/**
 * @file core.js — Fundamentale Infrastruktur für DIN-BriefNEO: Nativer EventBus & Toast-System.
 * Bildet das entkoppelte Zero-Dependency-Rückgrat der Anwendung.
 */

/* =========================================================================================
 * 0. SYSTEM- & VALIDIERUNGS-KONSTANTEN & TOASTS
 * ========================================================================================= */

/**
 * System- und Validierungs-Konstanten.
 */
export const Constants = {
  LIMITS: {
    HISTORY_MAX_ITEMS: 50,    // Undo/Redo Cap
    FONT_SIZE_MAX_KB: 400     // Max size für Base64-Schriftarten (< 400 KB)
  },
  SCHEMA_VERSION: 2,
  TOASTS: {
    DRAFT: {
      MULTI_TAB: 'ℹ️ Der Brief wurde in einem anderen Tab aktualisiert.',
      EXPORT_SAVED: '💾 Brief erfolgreich gespeichert.',
      EXPORT_DOWNLOADED: '💾 Brief heruntergeladen.',
      EXPORT_ERROR: '❌ Fehler beim Exportieren.',
      IMPORT_SIZE_ERROR: '❌ Import abgelehnt: Datei zu groß (max. 1 MB).',
      /** @param {string} reason @returns {string} */
      IMPORT_REJECTED: (reason) => `❌ Import abgelehnt: ${reason}`,
      IMPORT_STORAGE_ERROR: '❌ Import fehlgeschlagen (Storage voll?).'
    },
    FONT: {
      SIZE_ERROR: '❌ Datei zu groß! (Schriftarten dürfen maximal 400 KB groß sein)',
      FORMAT_ERROR: '❌ Falsches Dateiformat! (Erlaubt: .woff2, .ttf, .otf)',
      SAVE_ERROR: '❌ Fehler beim dauerhaften Speichern der Schriftart'
    },
    ADDRESS: {
      /** @param {string} name @returns {string} */
      GROSSKUNDE_RECOGNIZED: (name) => `🏛️ Großempfänger erkannt: ${name} (Straße entfällt nach DIN 5008)`
    },
    CLIPBOARD: {
      /** @param {string} label @param {string} ort @returns {string} */
      APPLIED: (label, ort) => `📋 Adresse übernommen: ${label} (${ort})`,
      UNSUPPORTED: '⚠️ Zwischenablage-Zugriff wird von diesem Browser nicht unterstützt.',
      EMPTY: '⚠️ Die Zwischenablage ist leer.',
      NO_ADDRESS: '⚠️ Keine gültige Anschrift in der Zwischenablage gefunden.',
      /** @param {number} n @returns {string} */
      MULTIPLE: (n) => `⚠️ ${n} Adressen gefunden. Bitte Auswahlliste nutzen oder Anschrift manuell einfügen.`,
      PERMISSION_DENIED: '⚠️ Zugriff auf die Zwischenablage verweigert oder blockiert.'
    },
    GEOAPIFY: {
      KEY_INVALID: '❌ Geoapify Key ungültig',
      KEY_EXPIRED: '❌ Geoapify API-Key ist ungültig oder abgelaufen! Bitte neu eintragen.',
      /** @param {number | string} status @returns {string} */
      UNAVAILABLE: (status) => `⚠️ Geoapify vorübergehend nicht erreichbar (Status ${status}).`,
      NETWORK_ERROR: '⚠️ Geoapify-Suche fehlgeschlagen (Netzwerk?). Der Key bleibt erhalten.'
    },
    SALUTATION: {
      PUNCTUATION: '⚠️ Anrede sollte mit einem Komma enden (DIN 5008)',
      CLOSING_PUNCTUATION: '⚠️ Grußformel sollte ohne Komma oder Punkt enden (DIN 5008)'
    },
    SYSTEM: {
      SAVE_ERROR: '❌ Fehler beim Speichern!'
    }
  }
};

/* =========================================================================================
 * 1. NATIVE EVENT BUS (Standard Web APIs: EventTarget & CustomEvent)
 * ========================================================================================= */

export const EVENT_PREFIX = 'dinbrief:';

/**
 * Zentrale typisierte Event-Namen für das Pub/Sub-System.
 */
export const Events = Object.freeze({
  NOTIFICATION_REQUESTED: 'dinbrief:notification.requested',
  DOCUMENT_SAVE_REQUESTED: 'dinbrief:document.save.requested',
  DOCUMENT_SAVED: 'dinbrief:document.saved',
  DOCUMENT_SAVE_FAILED: 'dinbrief:document.save.failed',
  DOCUMENT_CHANGED: 'dinbrief:document.changed'
});

/**
 * Erzeugt eine isolierte EventBus-Instanz.
 * @param {EventTarget} [target]
 */
export function createEventBus(target = new EventTarget()) {
  return Object.freeze({
    /**
     * Publiziert ein typisiertes Event an alle aktiven Subscriber.
     * @param {string} topic
     * @param {Record<string, unknown>} [payload]
     */
    publish(topic, payload = {}) {
      if (!topic.startsWith(EVENT_PREFIX)) {
        throw new TypeError(`Ungültiges Event-Topic: "${topic}". Topic muss mit "${EVENT_PREFIX}" beginnen.`);
      }

      target.dispatchEvent(
        new CustomEvent(topic, {
          detail: payload
        })
      );
    },

    /**
     * Registriert einen Handler für ein bestimmtes Topic.
     * @param {string} topic
     * @param {(detail: any) => void} handler
     * @param {{ signal?: AbortSignal }} [options]
     * @returns {() => void} Unsubscribe-Funktion
     */
    subscribe(topic, handler, options = {}) {
      if (!topic.startsWith(EVENT_PREFIX)) {
        throw new TypeError(`Ungültiges Event-Topic: "${topic}". Topic muss mit "${EVENT_PREFIX}" beginnen.`);
      }

      /**
       * @param {Event} event
       */
      const listener = (event) => {
        if (event instanceof CustomEvent) {
          handler(event.detail);
        }
      };

      target.addEventListener(topic, /** @type {EventListener} */ (listener), {
        signal: options.signal
      });

      return () => {
        target.removeEventListener(topic, /** @type {EventListener} */ (listener));
      };
    }
  });
}

/**
 * App-weiter Default-EventBus für die Modul-Orchestrierung.
 */
export const eventBus = createEventBus();

/* =========================================================================================
 * 2. NATIVE TOAST SYSTEM (Popover API & Top-Layer)
 * ========================================================================================= */

/** @type {{ global: HTMLElement, message: HTMLElement, close: HTMLElement } | null} */
let dom = null;
/** @type {{ message: string } | null} */
let current = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let timer = null;
/** @type {CloseWatcher | null} */
let closer = null;

export function initToastSystem() {
  const global = document.getElementById('hinweis-v4');
  const message = document.getElementById('hinweis-message');
  const close = document.getElementById('hinweis-close');
  if (!global || !message || !close) {
    console.warn('[Toast] DOM elements missing.');
    return;
  }
  dom = { global, message, close };
  close.addEventListener('click', hide);

  eventBus.subscribe(Events.NOTIFICATION_REQUESTED, (payload) => {
    if (payload && typeof payload.message === 'string') {
      showToast(payload.message, payload.type || 'info');
    }
  });

  eventBus.subscribe(Events.DOCUMENT_SAVE_FAILED, (payload) => {
    const msg = (payload && typeof payload.message === 'string') ? payload.message : Constants.TOASTS.SYSTEM.SAVE_ERROR;
    showToast(msg, 'error');
  });
}

/**
 * @param {string} message
 * @param {string} [type]
 */
export function showToast(message, type = 'info') {
  if (!dom) return;

  if (current?.message === message) {
    startTimer(message);
    return;
  }

  dom.message.textContent = message;
  dom.global.className = `hinweis-container type-${type}`;
  current = { message };

  if (!dom.global.matches(':popover-open')) {
    try { dom.global.showPopover(); } catch (e) {
      console.warn('[Toast] Popover API failure:', e);
      return;
    }
  }

  startTimer(message);
  armCloseWatcher();
}

/** @param {string} message */
function startTimer(message) {
  if (timer !== null) clearTimeout(timer);
  const duration = Math.min(5000, 2000 + message.length * 30);
  timer = setTimeout(hide, duration);
}

function armCloseWatcher() {
  closer?.destroy();
  closer = new CloseWatcher();
  closer.addEventListener('close', hide);
}

function hide() {
  if (timer !== null) { clearTimeout(timer); timer = null; }
  closer?.destroy();
  closer = null;
  current = null;
  if (dom?.global.matches(':popover-open')) {
    try { dom.global.hidePopover(); } catch {}
  }
}
