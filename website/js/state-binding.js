// @ts-check
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]
// @adr [[ADR-DATA-PERSISTENCE]] {LetterState}

/**
 * @file state-binding.js — Die Naht zwischen DOM und Zustand.
 *
 * Ein delegierter input/change-Listener pro Dokument, ein Lese-Zweig
 * (readField), ein Schreib-Zweig (writeField). Echo-Regel:
 *   origin 'user'   — der DOM ist während des Events die Quelle, der Zustand
 *                     übernimmt den Endwert; das aktive Feld wird NICHT
 *                     zurückgeschrieben (Caret/IME bleiben unberührt).
 *   alle anderen    — der Zustand ist die Quelle, der DOM wird geschrieben.
 *
 * Der Listener hängt bewusst in der Bubble-Phase und wird in main.js NACH
 * UIProtections registriert: so liest der Commit den bereits gekürzten
 * (Zeichen-/Breitenlimit) Endwert. Ein Capture-Listener liefe vor der
 * Begrenzung und würde den ungekürzten Wert speichern.
 */

import { Events, eventBus } from './core.js';
import { collectDraft, draftFieldIds, EDITABLE_FIELD_SELECTOR, readField, writeField } from './document.js';
import { bindIds, createState, letterState, replace, setWert } from './state.js';

const TOGGLE_IDS = new Set(['toggle-anlagen', 'toggle-fuss']);

/**
 * @param {EventTarget & ParentNode} [root]
 * @param {{ bus?: ReturnType<typeof import('./core.js').createEventBus> }} [options]
 */
export function initStateBinding(root = document, { bus = eventBus } = {}) {
  bindIds(letterState, draftFieldIds(document));

  /** @param {Element | null} el */
  const istFeld = (el) =>
    el instanceof HTMLElement && Boolean(el.id) && (el.matches(EDITABLE_FIELD_SELECTOR) || TOGGLE_IDS.has(el.id));

  /** @param {Element | null} el @param {'user'|'logic'} origin @param {{ renderIt?: boolean }} [opts] */
  const commit = (el, origin, { renderIt = true } = {}) => {
    if (!istFeld(el)) return;
    const patch = commitElement(el, origin, { renderIt });
    if (patch) bus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
  };

  root.addEventListener('input', (event) => {
    /* IME: während der Komposition ist der DOM-Wert nur ein Zwischenstand. */
    if (event instanceof InputEvent && event.isComposing) return;
    const el = event.target instanceof Element ? event.target.closest(EDITABLE_FIELD_SELECTOR) : null;
    commit(el, 'user');
  });

  root.addEventListener('change', (event) => {
    const el = event.target instanceof Element ? event.target : null;
    if (el instanceof HTMLInputElement && TOGGLE_IDS.has(el.id)) commit(el, 'user');
  });

  /* Mikrotypografie beim Verlassen: UIProtections (vorher registriert) hat die
     geschützten Leerzeichen schon eingesetzt — hier wird nur der Endwert in den
     Zustand übernommen. Kein Rückschreiben, der DOM ist die Quelle. */
  root.addEventListener('focusout', (event) => {
    const el = event.target instanceof Element
      ? event.target.closest('[contenteditable], input[data-atom], textarea[data-feldtyp]')
      : null;
    commit(el, 'logic', { renderIt: false });
  });
}

/**
 * Übernimmt den Wert eines Feldes in den Zustand (ohne Save-Impuls).
 * @param {Element | null} el
 * @param {'user'|'logic'|'auto'} [origin]
 * @param {{ renderIt?: boolean }} [opts]
 * @returns {import('./state.js').PatchEntry | null}
 */
export function commitElement(el, origin = 'user', { renderIt = true } = {}) {
  if (!(el instanceof HTMLElement) || !el.id) return null;
  /* Ein DOM-Feld ist per Definition Teil des Feldsatzes — auch wenn sein Wert
     (noch) dem Default entspricht. Sonst ginge ein unverändert übernommenes
     Feld beim nächsten toWire verloren. */
  bindIds(letterState, [el.id]);

  const wert = TOGGLE_IDS.has(el.id)
    ? /** @type {HTMLInputElement} */ (el).checked
    : readField(el);
  const patch = setWert(letterState, el.id, wert, origin);
  if (!patch) return null;

  if (renderIt) render([el.id], origin);
  return patch;
}

/**
 * Setzt einen Wert aus der Logik (Autofill, Anrede-Seed, Datum, Undo) und
 * projiziert ihn sofort in den DOM.
 * @param {string} id
 * @param {string|boolean} wert
 * @param {import('./state.js').Origin} [origin]
 * @returns {import('./state.js').PatchEntry | null}
 */
export function applyValue(id, wert, origin = 'logic') {
  if (!(id in letterState.werte)) {
    if (!document.getElementById(id)) return null;
    bindIds(letterState, [id]);
  }
  const patch = setWert(letterState, id, wert, origin);
  if (patch) render([id], origin);
  return patch;
}

/**
 * Schreibt nur die betroffenen Felder aus dem Zustand in den DOM.
 * @param {Iterable<string>} ids
 * @param {import('./state.js').Origin} [origin]
 */
export function render(ids, origin = 'logic') {
  const aktiv = document.activeElement;
  for (const id of ids) {
    if (origin === 'user' && aktiv instanceof HTMLElement && aktiv.id === id) continue;
    const el = document.getElementById(id);
    if (!el) continue;
    if (TOGGLE_IDS.has(id)) {
      if (el instanceof HTMLInputElement) el.checked = letterState.werte[id] === true;
      continue;
    }
    if (!el.matches(EDITABLE_FIELD_SELECTOR)) continue;
    if (el.getAttribute('data-feldtyp') === 'systemwert' && el.id !== 'datum') continue;
    writeField(el, letterState.werte[id]);
  }
  renderRootFlags();
}

/** Einziger Schreiber der CSS-Wahrheit für Anlagen/Fußzeile. */
export function renderRootFlags() {
  const root = document.documentElement;
  root.setAttribute('data-anlagen', letterState.werte['toggle-anlagen'] === true ? 'true' : 'false');
  root.setAttribute('data-fuss', letterState.werte['toggle-fuss'] === true ? 'true' : 'false');
}

/**
 * Hydratisiert den Zustand aus dem Live-DOM. Nur für Pfade, in denen der DOM
 * die Quelle ist: Kaltstart-Restore, Migration alter Entwürfe, Reset.
 * @returns {string[]} die gebundenen IDs
 */
export function hydrateStateFromDom() {
  const wire = collectDraft();
  const next = createState(wire, draftFieldIds(document));
  replace(letterState, next);
  bindIds(letterState, draftFieldIds(document));
  return [...letterState.ids];
}
