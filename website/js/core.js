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
    FONT_SIZE_MAX_KB: 400     // Max size für Schriftdateien (< 400 KB)
  },
  SCHEMA_VERSION: 5,
  TOASTS: {
    DRAFT: {
      MULTI_TAB: 'ℹ️ Der Brief wurde in einem anderen Tab aktualisiert.',
      EXPORT_SAVED: '💾 Brief erfolgreich gespeichert.',
      EXPORT_DOWNLOADED: '💾 Brief heruntergeladen.',
      EXPORT_CLIPBOARD: '📋 Brief-JSON in die Zwischenablage kopiert.',
      EXPORT_ERROR: '❌ Fehler beim Exportieren.',
      IMPORT_SIZE_ERROR: '❌ Import abgelehnt: Datei zu groß (max. 1 MB).',
      /** @param {string} reason @returns {string} */
      IMPORT_REJECTED: (reason) => `❌ Import abgelehnt: ${reason}`,
      IMPORT_STORAGE_ERROR: '❌ Fehler beim Speichern des Imports (Speicher voll oder gesperrt).'
    },
    FONT: {
      SIZE_ERROR: '❌ Datei zu groß! (Schriftarten dürfen maximal 400 KB groß sein)',
      FORMAT_ERROR: '❌ Falsches Dateiformat! (Erlaubt: .woff2, .ttf, .otf)',
      SAVE_ERROR: '❌ Fehler beim dauerhaften Speichern der Schriftart'
    },
    SIGNATURE: {
      SAVE_ERROR: '❌ Signaturbild konnte nicht dauerhaft gespeichert werden',
      DECODE_ERROR: '❌ Bild nicht lesbar — bitte PNG, JPG oder WebP verwenden'
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
  PLUGIN_MULTIPAGE_TOGGLED: 'dinbrief:plugin.multipage.toggled',
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

/** @type {{ global: HTMLElement, message: HTMLElement } | null} */
let dom = null;
/** @type {{ message: string } | null} */
let current = null;
/* Einmal-Initialisierung: im Boot-Pfad gibt es genau einen Aufrufer, aber ein
   spaeterer Re-Init (Einstellungen neu anwenden) wuerde sonst ein zweites
   `toggle`-Abo und zwei EventBus-Abos auf dasselbe Element legen. Ein
   doppelter Toast waere die Folge, ohne dass ein Fehler sichtbar wird. */
let toastInitialisiert = false;

export function initToastSystem() {
  if (toastInitialisiert) return;
  const global = document.getElementById('hinweis-v4');
  const message = document.getElementById('hinweis-message');
  if (!global || !message) {
    console.warn('[Toast] DOM elements missing.');
    return;
  }
  toastInitialisiert = true;
  dom = { global, message };
  // Schließen läuft 100% deklarativ über HTML (popovertargetaction="hide"), Esc oder Klick außerhalb;
  // das native toggle-Event räumt dabei den Auto-Dismiss-Timer auf.
  global.addEventListener('toggle', (e) => {
    if (/** @type {ToggleEvent} */ (e).newState === 'closed') {
      current = null;
    }
  });

  /* Der Toast schliesst sich, wenn seine CSS-Animation endet. Das ist der
     einzige Ausloeser fuer den Auto-Abbau — kein Timer, kein Aufraeumpfad. */
  global.addEventListener('animationend', (e) => {
    if (/** @type {AnimationEvent} */ (e).animationName === 'hinweis-lebensdauer') hide();
  });

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
    if (dom.global.dataset.type !== type) {
      dom.global.dataset.type = type;
    }
    setzeLebensdauer(message);
    showPopoverSafe(dom.global);
    return;
  }

  dom.message.textContent = message;
  dom.global.dataset.type = type;
  current = { message };

  setzeLebensdauer(message);
  showPopoverSafe(dom.global);
}

/**
 * Setzt die Lebensdauer als CSS-Variable. Die Zeit selbst laeuft in CSS
 * (`animation: hinweis-lebensdauer`), nicht in einem `setTimeout` — damit gibt
 * es keinen Timer, der beim manuellen Schliessen aufgeraeumt werden muss.
 * @param {string} message
 */
function setzeLebensdauer(message) {
  const dauer = Math.min(5000, 2000 + message.length * 30);
  dom?.global?.style.setProperty('--hinweis-dauer', `${dauer}ms`);
}

function hide() {
  current = null;
  hidePopoverSafe(dom?.global);
}

/**
 * Publiziert eine Toast-Benachrichtigung zentral über den EventBus.
 * @param {string} message
 * @param {'info' | 'warning' | 'error' | 'success'} [type='info']
 */
export function notify(message, type = 'info') {
  eventBus.publish(Events.NOTIFICATION_REQUESTED, { message, type });
}

/**
 * Führt `fn` in einer View Transition aus, wenn das gefahrlos geht.
 *
 * Vier Guards, jeder mit Grund (geprüft 2026-11-16 gegen GitHub #26):
 *   1. `prefers-reduced-motion`  — wer Bewegung ablehnt, bekommt keinen Snapshot
 *   2. Methode vorhanden         — `typeof` statt `CSS.supports()`, es geht um
 *                                  eine Methode am Element, nicht um eine Property
 *   3. Tab sichtbar              — im Hintergrund liefert der Snapshot nichts
 *   4. Element hat einen Kasten  — bei 0×0 (z. B. `[hidden]`) hängt `finished`
 *
 * Danach fällt jede Transition auf den direkten Aufruf zurück: die Funktion
 * darf nie verschluckt werden.
 * @param {any} target
 * @param {() => void} fn
 */
export function transitionOn(target, fn) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fn();
    return;
  }
  const hatKasten = typeof target?.getBoundingClientRect === 'function' && target.getBoundingClientRect().width > 0;
  if (typeof target.startViewTransition !== 'function' || document.visibilityState !== 'visible' || !hatKasten) {
    fn();
    return;
  }
  try {
    target.startViewTransition(fn).finished.catch(() => {});
  } catch (err) {
    console.debug('[ViewTransition] übersprungen:', err instanceof Error ? err.name : err);
    fn();
  }
}

/**
 * Zeigt ein Popover an — nur wenn es nicht schon offen ist.
 *
 * Vorher stand hier ein try/catch gegen den InvalidStateError, der bei
 * doppeltem `showPopover()` fliegt. `:popover-open` ist genau dieser Zustand;
 * die Abfrage ist billiger und erzeugt kein Konsolen-Rauschen.
 * @param {Element | null | undefined} el
 */
export function showPopoverSafe(el) {
  const popover = /** @type {HTMLElement & { showPopover: () => void } | null} */ (el ?? null);
  if (!popover || typeof popover.showPopover !== 'function') return;
  if (!popover.matches(':popover-open')) popover.showPopover();
}

/**
 * Schließt ein Popover — nur wenn es offen ist (siehe `showPopoverSafe`).
 * @param {Element | null | undefined} el
 */
export function hidePopoverSafe(el) {
  const popover = /** @type {HTMLElement & { hidePopover: () => void } | null} */ (el ?? null);
  if (!popover || typeof popover.hidePopover !== 'function') return;
  if (popover.matches(':popover-open')) popover.hidePopover();
}
