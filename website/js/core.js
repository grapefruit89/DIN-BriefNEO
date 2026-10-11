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
    const msg = (payload && typeof payload.message === 'string') ? payload.message : '❌ Fehler beim Speichern!';
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
