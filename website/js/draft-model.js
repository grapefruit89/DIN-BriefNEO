// @ts-check
// @adr [[ADR-DATA-PERSISTENCE]] {DraftModel}
// @adr [[ADR-JS]]
// @guide [[din-5008-css-architektur]]

/**
 * @file draft-model.js — Der gemeinsame Feld-Kern von Boot und Restore.
 *
 * Warum es diese Datei gibt (D2): `boot-state.js` ist ein klassisches Skript
 * und konnte deshalb nichts importieren. Es trug `istAn` und den
 * Feld-Selektor als lokale Kopie; zwei Tests hielten die Kopien deckungsgleich
 * und verhinderten damit genau die Zusammenlegung. Dieses Modul ist
 * importfähig und damit die EINZIGE Definition von:
 *
 *  - `istAn`            Schalter-Semantik (nur explizites `false` schaltet aus)
 *  - `EDITABLE_FIELD_SELECTOR`  Allowlist der Entwurfsfelder
 *  - `sanitizeRichText`  Allowlist-Sanitizer (A61)
 *  - `stripHtmlToPlaintext` Legacy-`<li>`-Migration
 *  - `readField`/`writeField`  ein Lese- und ein Schreibpfad pro Feld
 *  - `normalizeDraftWire`/`applyDraftValues`  der eine Boot-Schreiber
 *  - `setRootFlags`      die eine Quelle für `data-anlagen`/`data-fuss`
 *
 * Abhängigkeit: nur `field.js` (32 Zeilen). Wer hier `persistence.js`,
 * `format.js` oder `core.js` importiert, zieht den halben Graphen in den
 * Pre-Paint-Pfad — das ist ausdrücklich nicht gewollt (R2 im D2-Konzept).
 *
 * `document.js` und `persistence.js` re-exportieren die verschobenen Namen,
 * damit bestehende Importe unverändert bleiben.
 */

import { Field } from './field.js';

/**
 * Eine Semantik für gespeicherte Schalter (B65).
 *
 * Gespeichert wird echtes JSON-Boolean. **Nur ein explizites `false` schaltet
 * aus**; fehlt der Wert oder ist er `null`, gilt der Default der Einstellung.
 * `'false'` als String bleibt akzeptiert, damit ein von Hand geschriebener
 * Wert in localStorage nicht als „an" gelesen wird.
 *
 * Kanonische Heimat ist seit D2 dieses Modul; `persistence.js` re-exportiert
 * den Namen für die bestehenden Importe (settings.js, Tests).
 *
 * @param {unknown} v
 * @returns {boolean}
 */
export const istAn = (v) => v !== false && v !== 'false';

/* Komma ist CSS-Selektor-Listen-Vereinigung (ODER, nicht UND):
 * Matcht contenteditable-Blattfelder (#text), native Blattfelder
 * (input[data-atom], textarea[data-feldtyp]) und speicherbare Formular-Selects
 * (Postvermerk). Der Kommentar nannte frueher nur contenteditable (B12/S5). */
export const EDITABLE_FIELD_SELECTOR =
  '[contenteditable]:not([data-feldtyp="systemwert"]), textarea[data-feldtyp], input[data-atom], select[data-speichern]';

/**
 * Einzige Sicherheitsgrenze für Rich-Text: DOMParser + exakte Element-Allowlist.
 * Wird von DraftManager (Draft-Restore) und collectDraft genutzt.
 *
 * Bezug: Law Catalog H11 (PREFERRED) & Einleitung (FALLBACK-Klausel):
 * H11 setzt setHTML() als PREFERRED. sanitizeRichText bildet domänenspezifische
 * Anforderungen ab (vollständiges Strippen aller Inline-Attribute, Erhalt der
 * Spezialklasse <span class="brief-kommentar"> bei generischer SPAN-Entfernung,
 * Erzeugung eines DocumentFragment für replaceChildren/collectDraft), die natives
 * setHTML() nicht leistet.
 *
 * Extra-Tags (z. B. UL/LI für Listenfelder wie anlagen-angabe) ergänzen die
 * Basis-Allowlist (ohne Attribute).
 * @param {string} htmlString
 * @param {{ extraTags?: string[] }} [options]
 * @returns {DocumentFragment}
 */
export function sanitizeRichText(htmlString, options = {}) {
  const allowedTags = ['B', 'STRONG', 'S', 'BLOCKQUOTE', 'BR', 'DIV', 'P', 'I', 'EM', ...(options.extraTags || [])];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString || '', 'text/html');

  /**
   * @param {Node} node
   * @returns {Node}
   */
  const sanitizeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(Field.getValue(node));
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createTextNode('');
    }
    const element = /** @type {Element} */ (node);
    let newNode;
    if (allowedTags.includes(element.nodeName)) {
      newNode = document.createElement(element.nodeName.toLowerCase());
    } else if (element.nodeName === 'SPAN' && element.classList.contains('brief-kommentar')) {
      newNode = document.createElement('span');
      newNode.className = 'brief-kommentar';
    } else {
      const frag = document.createDocumentFragment();
      element.childNodes.forEach((child) => {
        frag.appendChild(sanitizeNode(child));
      });
      return frag;
    }
    element.childNodes.forEach((child) => {
      newNode.appendChild(sanitizeNode(child));
    });
    return newNode;
  };

  const frag = document.createDocumentFragment();
  doc.body.childNodes.forEach((child) => {
    frag.appendChild(sanitizeNode(child));
  });
  return frag;
}

/**
 * Wandelt altes `<li>`-HTML in `\n`-Text (einmalige Draft-Migration).
 * Reine String-Funktion, kein DOM — deshalb importfrei nutzbar.
 * @param {string} html
 * @returns {string}
 */
export function stripHtmlToPlaintext(html) {
  if (!html?.includes('<')) return html ? html.trim() : '';
  let str = html
    .replace(/<li[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');
  let prev;
  do {
    prev = str;
    str = str.replace(/<[^>]+>/g, '');
  } while (str !== prev);
  return str
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Liest den Wert genau eines Entwurfsfeldes.
 * Rich-Text-Felder werden vor der Ausgabe mit sanitizeRichText abgesichert
 * (A61: einzige Schreibgrenze). Gegenstück zu `writeField`.
 * @param {Element | HTMLElement | null} elem
 * @returns {string}
 */
export function readField(elem) {
  if (!elem) return '';
  if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
    const isListe = Boolean(elem.getAttribute('data-feldtyp')?.includes('liste'));
    const extra = isListe ? { extraTags: ['UL', 'OL', 'LI'] } : undefined;
    const cleanFrag = sanitizeRichText(/** @type {HTMLElement} */ (elem).innerHTML, extra);
    const container = document.createElement('div');
    container.appendChild(cleanFrag);
    return container.innerHTML;
  }
  return Field.getValue(elem);
}

/**
 * Schreibt einen Wert in genau ein Entwurfsfeld (Projektion des Zustands).
 * Die Allowlist-/Feldtyp-Prüfung bleibt beim Aufrufer (`render`).
 * @param {Element | HTMLElement | null} elem
 * @param {string | boolean} wert
 */
export function writeField(elem, wert) {
  if (!elem) return;
  const text = typeof wert === 'string' ? wert : String(wert ?? '');

  if (elem instanceof HTMLSelectElement) {
    elem.value = text;
    return;
  }

  if (Field.isNative(elem)) {
    /* Migration alter Drafts: <li>-HTML -> \n-Text (einmalig). */
    let val = text;
    if (elem.id === 'anlagen-angabe' && val.includes('<')) {
      val = stripHtmlToPlaintext(val);
    }
    Field.setValue(elem, val);
    return;
  }

  // HTML-Restore ausschließlich über sanitizeRichText (Allowlist)
  if (elem.getAttribute('data-feldtyp')?.includes('rich')) {
    const isListe = Boolean(elem.getAttribute('data-feldtyp')?.includes('liste'));
    if (isListe && !text.includes('<li')) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        elem.replaceChildren(...lines.map((line) => {
          const li = document.createElement('li');
          Field.setValue(li, line);
          return li;
        }));
      } else {
        elem.replaceChildren();
      }
    } else {
      const extra = isListe ? { extraTags: ['UL', 'OL', 'LI'] } : undefined;
      elem.replaceChildren(sanitizeRichText(text, extra));
      if (isListe && elem.children.length === 0) {
        elem.replaceChildren(document.createElement('li'));
      }
    }
    return;
  }

  if (!elem.querySelector('select[data-speichern]')) {
    Field.setValue(elem, text);
  }
}

/** Die Fußzeilen-Felder, aus denen Alt-Entwürfe „Fußzeile war an" ableiten. */
export const FUSS_FELDER = [
  'fuss-firma', 'fuss-sitz', 'fuss-gericht', 'fuss-hrb', 'fuss-vorstand', 'fuss-gf',
  'fuss-stnr', 'fuss-ustid', 'fuss-bank', 'fuss-iban', 'fuss-bic', 'fuss-anschrift',
];

/**
 * Migration: alte Drafts kennen `toggle-fuss` nicht. Vorhandener Text in den
 * Fußzeilenfeldern bedeutet "Fußzeile war an" — sonst wäre er unsichtbar
 * (Befund B11). Liefert eine flache Kopie, das Original bleibt unberührt.
 * @param {Record<string, any>} draft
 * @returns {Record<string, any>}
 */
export function normalizeDraftWire(draft) {
  const wire = { ...draft };
  if (!('toggle-fuss' in wire)) {
    wire['toggle-fuss'] = FUSS_FELDER.some((id) => String(wire[id] ?? '').trim() !== '');
  }
  return wire;
}

/**
 * Fingerprint eines Wire-Entwurfs: exakter `JSON.stringify` des normalisierten
 * Stands (R3 im D2-Konzept — kein Hash, damit eine Kollision nicht zum
 * übersprungenen Schreibvorgang wird).
 * @param {Record<string, any>} draft
 * @returns {string}
 */
export function draftFingerprint(draft) {
  return JSON.stringify(normalizeDraftWire(draft));
}

/* Der Boot-Writer ist ein klassisches Skript und kann dieses Modul nicht
 * importieren. Er veröffentlicht seinen Fingerprint deshalb auf `globalThis`;
 * der DraftManager liest ihn genau einmal. Das ist die einzige Naht zwischen
 * den beiden Welten, und sie verschwindet mit `boot-values.js` (Phase 5). */
const BOOT_FINGERPRINT = '__dinBootFingerprint';
/** @type {Record<string, unknown>} */
const bootStore = /** @type {any} */ (globalThis);

/**
 * Meldet, welchen Entwurf der Boot-Writer tatsächlich in den DOM geschrieben
 * hat. Nur aufrufen, wenn das Ergebnis exakt `applyDraftValues` entspricht —
 * sonst wäre der Fingerprint eine Lüge und der Restore würde einen Sprung
 * überspringen, statt ihn zu korrigieren.
 * @param {Record<string, any>} draft
 */
export function publishBootFingerprint(draft) {
  try {
    bootStore[BOOT_FINGERPRINT] = draftFingerprint(draft);
  } catch {
    /* Kein Blocker: ohne Fingerprint schreibt der Restore wie bisher. */
  }
}

/** @returns {string | null} */
export function readBootFingerprint() {
  try {
    const wert = bootStore[BOOT_FINGERPRINT];
    return typeof wert === 'string' ? wert : null;
  } catch {
    return null;
  }
}

/** Einmalig nach dem ersten `loadDraft`: spätere Ladepfade schreiben wieder. */
export function clearBootFingerprint() {
  try {
    delete bootStore[BOOT_FINGERPRINT];
  } catch {
    /* egal */
  }
}

/**
 * Die eine Quelle der CSS-Wahrheit für Anlagen und Fußzeile.
 * `applyDraftValues` (Boot) und `state-binding.renderRootFlags` (Sitzung)
 * schreiben damit denselben Wert auf dieselbe Weise.
 * @param {{ anlagen: boolean, fuss: boolean }} flags
 * @param {HTMLElement} [root]
 */
export function setRootFlags({ anlagen, fuss }, root = document.documentElement) {
  root.setAttribute('data-anlagen', anlagen ? 'true' : 'false');
  root.setAttribute('data-fuss', fuss ? 'true' : 'false');
}

/**
 * Der EINE Schreiber für Feldwerte aus einem Wire-Entwurf (D2).
 *
 * Wird vom Boot (vor dem Reveal) und — nach Fingerprint-Vergleich — vom
 * DraftManager benutzt. Damit ist „Seeder == Restore" per Konstruktion wahr
 * statt per Test. Sanitizing läuft ausschließlich über `writeField` →
 * `sanitizeRichText`; es gibt keinen zweiten, rohen HTML-Pfad mehr.
 *
 * Nicht hier: `datum`-Vorbelegung (heute gehört sie zum Boot, siehe
 * boot-values.js) und Undo/Redo/Reset/Import — das sind Nutzereignisse,
 * keine Boot-Schreiber, und sie dürfen den Lifecycle-Marker nicht berühren.
 *
 * @param {Record<string, any> | null | undefined} draft
 * @param {{ root?: HTMLElement }} [options]
 * @returns {Record<string, any>} der normalisierte Wire-Stand
 */
export function applyDraftValues(draft, { root = document.documentElement } = {}) {
  if (!draft || typeof draft !== 'object') return {};
  const wire = normalizeDraftWire(draft);

  for (const [id, wert] of Object.entries(wire)) {
    if (id.endsWith('__quelle') || typeof wert !== 'string') continue;
    const el = document.getElementById(id);
    if (!el?.matches(EDITABLE_FIELD_SELECTOR)) continue;
    /* Der Restore liest den Vermerk getrimmt (Select-Sync). Ohne denselben
       Schnitt zeigt der Boot "  Unser Zeichen: 4711  " und der Restore danach
       "Unser Zeichen: 4711" — gemessen mit tools/seeder-diff.mjs. */
    writeField(el, el.id === 'vermerke' ? wert.trim() : wert);
  }

  const auswahl = /** @type {HTMLSelectElement | null} */ (
    document.getElementById('seitenleiste-postvermerk-select')
  );
  if (auswahl) {
    auswahl.value = String(wire.vermerke ?? '').trim();
    if (auswahl.selectedIndex === -1) auswahl.selectedIndex = 0;
  }

  const anlagen = wire['toggle-anlagen'] === true || wire['toggle-anlagen'] === 'true';
  const fuss = wire['toggle-fuss'] === true || wire['toggle-fuss'] === 'true';
  for (const [id, an] of /** @type {[string, boolean][]} */ ([
    ['toggle-anlagen', anlagen],
    ['toggle-fuss', fuss],
  ])) {
    const box = document.getElementById(id);
    if (box instanceof HTMLInputElement) box.checked = an;
  }
  setRootFlags({ anlagen, fuss }, root);

  return wire;
}
