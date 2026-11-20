// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {LetterState}
// @adr [[ADR-EVENT-DRIVEN-ARCHITECTURE]]

/**
 * @file state.js — Der Briefzustand als Objekt im Arbeitsspeicher (SSoT der Sitzung).
 *
 * Schichten (Konzept D1):
 *   Wire   localStorage['din_draft_current'] · flach, schema-v5, mit __quelle/__dirty
 *   State  letterState = { werte, meta, rev, ids } + Patch-API
 *   DOM    Projektion, geschrieben nur durch state-binding.render()
 *
 * Regeln, die dieses Modul festhält:
 *  - `werte` enthält nur Feld-IDs, nie `__quelle`/`__dirty`.
 *  - `meta` gehört zum Feld, nicht zum Wert (Herkunft/Absicht/Sperre).
 *  - `ids` ist der Feldsatz, der tatsächlich existiert (DOM beim Start,
 *    gespeicherte Schlüssel beim Import) — nicht das Export-Schema.
 *  - Kein Proxy, kein Reducer: vier Funktionen mit klaren Signaturen.
 *
 * Der Kaltstart bleibt Sonderweg: boot.js/boot-state.js schreiben vor dem
 * ersten Paint direkt aus localStorage in den DOM; danach wird hydratisiert.
 */

import { DOCUMENT_SCHEMA_V5 } from './schema.js';

/**
 * @typedef {'auto' | 'manuell'} Herkunft
 * @typedef {'user'|'logic'|'auto'|'undo'|'redo'|'import'|'remote'|'reset'} Origin
 */

/**
 * Herkunft/Sperre eines Feldes. Gehört NICHT in den Wert:
 * derselbe Text kann vom Nutzer oder vom Helfer stammen.
 * @typedef {object} FeldMeta
 * @property {Herkunft} [herkunft]  // ersetzt data-quelle + data-autofilled
 * @property {boolean}  [userSet]   // ersetzt data-dirty (Datum, Anrede, Gruß)
 * @property {boolean}  [sperre]    // ersetzt data-autofill-aus (Feld-Fähigkeit)
 */

/**
 * @typedef {object} LetterState
 * @property {Record<string, string|boolean>} werte  // ID -> Wert ('text' = sanitized HTML)
 * @property {Record<string, FeldMeta>} meta
 * @property {number} rev                            // monoton, für "hat sich was geändert?"
 * @property {Set<string>} ids                       // gebundene Felder (DOM-Feldsatz)
 * @property {PatchEntry[]} journal                  // Patches seit dem letzten Schnitt (Undo)
 */

/**
 * @typedef {object} PatchEntry
 * @property {string} id
 * @property {{ wert: string|boolean, meta: FeldMeta|null }} prev
 * @property {{ wert: string|boolean, meta: FeldMeta|null }} next
 */

const TOGGLES = new Set(['toggle-anlagen', 'toggle-fuss']);
/** Export-Schema minus reine Layout-Platzhalter. */
const SCHEMA_IDS = DOCUMENT_SCHEMA_V5.filter((id) => id !== 'spacer');

/**
 * Baut einen Zustand aus dem Wire-Format (localStorage/Import).
 * Allowlist: nur String-/Boolean-Werte, nur bekannte Feld-IDs (Schema ∪
 * DOM-Feldsatz), nur erlaubte Herkünfte. Unbekannte Schlüssel fallen weg.
 * @param {Record<string, unknown>} [wire]
 * @param {Iterable<string>} [knownIds] zusätzliche Felder aus dem Dokument
 * @returns {LetterState}
 */
export function createState(wire = {}, knownIds = []) {
  /** @type {Record<string, string|boolean>} */
  const werte = Object.create(null);
  /** @type {Set<string>} */
  const ids = new Set();
  /** @type {Set<string>} */
  const erlaubt = new Set(SCHEMA_IDS);
  for (const id of knownIds) if (id) erlaubt.add(id);
  for (const id of erlaubt) {
    werte[id] = TOGGLES.has(id) ? false : '';
  }
  /** @type {Record<string, FeldMeta>} */
  const meta = Object.create(null);

  for (const [key, roh] of Object.entries(wire)) {
    if (key === 'datum__dirty') {
      if (roh === true) {
        if (!meta.datum) meta.datum = {};
        meta.datum.userSet = true;
      }
      continue;
    }
    if (key.endsWith('__quelle')) {
      const id = key.slice(0, -'__quelle'.length);
      if ((id in werte) && (roh === 'auto' || roh === 'manuell')) {
        if (!meta[id]) meta[id] = {};
        meta[id].herkunft = roh;
      }
      continue;
    }
    if (!(key in werte)) continue;
    werte[key] = TOGGLES.has(key)
      ? (roh === true || roh === 'true')
      : (typeof roh === 'string' ? roh : '');
    ids.add(key);
  }
  return { werte, meta, rev: 0, ids, journal: [] };
}

/**
 * Bindet zusätzliche Felder, die im Dokument existieren (einmal beim Start).
 * @param {LetterState} state
 * @param {Iterable<string>} ids
 */
export function bindIds(state, ids) {
  for (const id of ids) {
    if (!id) continue;
    if (!(id in state.werte)) state.werte[id] = '';
    state.ids.add(id);
  }
}

/**
 * Wire-Format (localStorage v5, unverändert flach). Deterministische Reihenfolge:
 * Felder in Bindungsreihenfolge, `__quelle` direkt hinter dem Feld, dann
 * `datum__dirty`, zuletzt die Toggles — exakt die Reihenfolge von collectDraft().
 * @param {LetterState} state
 * @returns {Record<string, string|boolean>}
 */
export function toWire(state) {
  /** @type {Record<string, string|boolean>} */
  const out = Object.create(null);
  /** @type {string[]} */
  const toggles = [];
  for (const id of state.ids) {
    if (TOGGLES.has(id)) {
      toggles.push(id);
      continue;
    }
    out[id] = state.werte[id] ?? '';
    const herkunft = state.meta[id]?.herkunft;
    if (herkunft) out[`${id}__quelle`] = herkunft;
  }
  if (state.meta.datum?.userSet) out.datum__dirty = true;
  for (const id of toggles) out[id] = state.werte[id] === true;
  return out;
}

/**
 * Einziger Schreibpfad für Werte. Gibt null zurück, wenn sich nichts geändert
 * hat (dann entsteht kein Undo-Schritt und kein Save-Impuls).
 * @param {LetterState} state
 * @param {string} id
 * @param {string|boolean} wert
 * @param {Origin} [origin]
 * @returns {PatchEntry|null}
 */
export function setWert(state, id, wert, origin = 'logic') {
  if (!(id in state.werte)) return null;
  const prevWert = state.werte[id];
  if (prevWert === wert) return null;
  const prevMeta = state.meta[id] ?? null;
  state.werte[id] = wert;
  state.rev++;
  /* Nur eine programmatische Füllung markiert sich selbst als 'auto'.
     Eine Nutzereingabe erfindet KEINE Herkunft: `__quelle` ist eine Aussage
     über Felder, bei denen Herkunft eine Rolle spielt (Rücksendezeile,
     Adress-Autofill). Sonst würde jeder Tastendruck den Entwurf um
     `__quelle`-Schlüssel aufblähen (Wire-Kompatibilität, Stufe 2). */
  if (origin === 'auto') {
    const m = state.meta[id] ?? {};
    m.herkunft = 'auto';
    state.meta[id] = m;
  }
  const patch = { id, prev: { wert: prevWert, meta: prevMeta }, next: { wert, meta: state.meta[id] ?? null } };
  state.journal.push(patch);
  return patch;
}

/**
 * Einziger Schreibpfad für Feld-Meta (Herkunft, Absicht, Sperre).
 * @param {LetterState} state
 * @param {string} id
 * @param {FeldMeta} metaPatch
 * @returns {PatchEntry|null}
 */
export function setMeta(state, id, metaPatch) {
  if (!(id in state.werte)) return null;
  const prevMeta = state.meta[id] ?? null;
  const nextMeta = { ...(prevMeta ?? {}), ...metaPatch };
  if (JSON.stringify(prevMeta) === JSON.stringify(nextMeta)) return null;
  state.meta[id] = nextMeta;
  state.rev++;
  const patch = { id, prev: { wert: state.werte[id], meta: prevMeta }, next: { wert: state.werte[id], meta: nextMeta } };
  state.journal.push(patch);
  return patch;
}

/**
 * Entfernt einen Meta-Schlüssel (z. B. „Herkunft wieder offen").
 * @param {LetterState} state
 * @param {string} id
 * @param {keyof FeldMeta} key
 * @returns {PatchEntry|null}
 */
export function unsetMeta(state, id, key) {
  if (!(id in state.werte)) return null;
  const prevMeta = state.meta[id] ?? null;
  if (!prevMeta || !(key in prevMeta)) return null;
  const nextMeta = { ...prevMeta };
  delete nextMeta[key];
  const hatRest = Object.keys(nextMeta).length > 0;
  if (hatRest) state.meta[id] = nextMeta; else delete state.meta[id];
  state.rev++;
  const patch = {
    id,
    prev: { wert: state.werte[id], meta: prevMeta },
    next: { wert: state.werte[id], meta: hatRest ? nextMeta : null }
  };
  state.journal.push(patch);
  return patch;
}

/**
 * Wendet Patches an — Richtung 'prev' = Undo, 'next' = Redo.
 * @param {LetterState} state
 * @param {PatchEntry[]} entries
 * @param {'prev'|'next'} richtung
 * @returns {string[]} betroffene IDs (für render)
 */
export function applyPatch(state, entries, richtung) {
  /** @type {string[]} */
  const ids = [];
  for (const e of entries) {
    if (!(e.id in state.werte)) continue;
    const ziel = e[richtung];
    state.werte[e.id] = ziel.wert;
    if (ziel.meta) state.meta[e.id] = ziel.meta; else delete state.meta[e.id];
    ids.push(e.id);
  }
  state.rev++;
  return ids;
}

/**
 * Vollständiger Austausch (Import, Ladepfad, Multi-Tab).
 * @param {LetterState} state
 * @param {LetterState} next
 * @returns {string[]} betroffene IDs
 */
export function replace(state, next) {
  state.werte = next.werte;
  state.meta = next.meta;
  state.ids = next.ids;
  /* Ein fremder Stand (Ladepfad, Import) entwertet anstehende Patches: sie
     gehörten zu einem anderen Dokument und dürfen nicht als Undo-Schritt in
     das neue hineinragen. */
  state.journal = [];
  state.rev++;
  return [...next.ids];
}

/**
 * Schneidet das Journal: liefert alle Patches seit dem letzten Schnitt und
 * leert es. Der Aufrufer (DraftManager) macht daraus einen Undo-Eintrag.
 * @param {LetterState} state
 * @returns {PatchEntry[]}
 */
export function takeJournal(state) {
  const journal = state.journal;
  state.journal = [];
  return journal;
}

/**
 * Flache Kopie für Rollback (33 Felder ⇒ billig). Enthält die Bindung, damit
 * `replace()` den Zustand vollständig zurückdrehen kann.
 * @param {LetterState} state
 * @returns {{ werte: Record<string, string|boolean>, meta: Record<string, FeldMeta>, ids: Set<string> }}
 */
export function snapshot(state) {
  return { werte: { ...state.werte }, meta: structuredClone(state.meta), ids: new Set(state.ids) };
}

/** Der Sitzungszustand (Singleton wie eventBus). */
export const letterState = createState();

/**
 * Setzt Werte und Meta auf die Schema-Defaults zurück und behält die
 * gebundenen IDs (DOM-Feldsatz). Für resetDraft() und Tests.
 * Der Diff wird als Patches journaliert, damit ein Reset per Undo
 * zurückholbar bleibt.
 */
export function resetState() {
  const vorher = snapshot(letterState);
  const next = createState({}, letterState.ids);
  letterState.werte = next.werte;
  letterState.meta = next.meta;
  for (const id of letterState.ids) {
    const prevWert = vorher.werte[id] ?? '';
    const nextWert = letterState.werte[id] ?? '';
    const prevMeta = vorher.meta[id] ?? null;
    if (prevWert !== nextWert || prevMeta) {
      letterState.journal.push({
        id,
        prev: { wert: prevWert, meta: prevMeta },
        next: { wert: nextWert, meta: null }
      });
    }
  }
  letterState.rev++;
}
