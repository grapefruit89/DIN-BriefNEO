// @ts-check
// @adr [[ADR-JS]]

/**
 * @file 00-event-bus.js — Leichtgewichtiger, nativer EventBus für DIN-BriefNEO.
 * Ermöglicht lose gekoppelte Kommunikation (Pub/Sub) über standardisierte Browser-APIs (EventTarget / CustomEvent).
 * Keine externen Abhängigkeiten, kein Framework-Zwang.
 */

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
