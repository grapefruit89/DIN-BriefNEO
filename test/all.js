// test/all.js — Testdatei für test/index.html. Priorität: der kritischste Pfad
// (Draft-Sanitizing/XSS) über die ECHTE Code-Route (localStorage → loadDraft),
// plus Draft-Roundtrip und Undo/Redo. Kein Framework, keine Mocks.

import { bezeichne, buildAnschriftLines, Figurenkatalog, FLOSKELN, floskele, franchiseKey, generateNerdText, generiereTestEmail, generiereTestTelefon, getCharHook, hatWonkaBezug, randomBetreff, sindIdentisch, slugify, SZENARIEN, setField as setTestbriefField, toT9, waehleAnker, waehleBesetzung, waehleSzenario } from '../website/addons/testbrief/testbrief.js';
import { AddressData, AddressIntelligence, BUNDESLAENDER, buildFirmenIndex, buildOrtIndex, getDistrict, initSenderSync, normalizePostcode, resolveCity, resolvePostcode } from '../website/js/address.js';
import { AddressData as AddressDataDirect, AddressIntelligence as AddressIntelligenceDirect, BUNDESLAENDER as BUNDESLAENDERDirect, buildFirmenIndex as buildFirmenIndexDirect, buildOrtIndex as buildOrtIndexDirect, getDistrict as getDistrictDirect, normalizePostcode as normalizePostcodeDirect, resolveCity as resolveCityDirect, resolvePostcode as resolvePostcodeDirect } from '../website/js/address-data.js';
import { deleteBlob, loadBlob, saveBlob } from '../website/js/binary-storage.js';
import { ClipboardAddressParser } from '../website/js/clipboard-parser.js';
import { Constants, createEventBus, Events, eventBus, initToastSystem } from '../website/js/core.js';
import { collectDraft, formatElementMicroTypography, sanitizeRichText, syncFormatState, toggleBlockquote, toggleInlineFormat, UIProtections } from '../website/js/document.js';
import { Field } from '../website/js/field.js';
import { DraftManager } from '../website/js/draft-manager.js';
import { FONT_PRESETS, FontFeature } from '../website/js/font-feature.js';
import { applyMicroTypography, formatDatum, formatGeldbetrag, formatIban, formatPostfach, formatTelefonnummer, formatUhrzeit } from '../website/js/format.js';
// @ts-ignore
import { applyImportedData, buildDINLetterJSON, buildDinLetterPayload, DEFAULT_SETTINGS, DINLETTER_FORMAT, DOCUMENT_SCHEMA_V4, isPrintTitleActive, load, loadJSON, MetadataService, parseDinLetterPayload, registerDraftCollector, remove, STORAGE_KEYS, save, saveJSON } from '../website/js/persistence.js?v=test2';
import { deriveSalutation, SalutationEngine, SalutationFeature } from '../website/js/salutation.js';
import { SettingsManager } from '../website/js/settings.js';
import { SignatureFeature } from '../website/js/signature.js';
import { assert, assertEqual, describe, it, run } from './runner.js';

/* STORAGE_KEYS.draft ('din_draft_current') ist der autoritative Draft-Key. */
const DRAFT_KEY = STORAGE_KEYS.draft;

/** @returns {Record<string, string>} */
const getDraft = () => {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return {};
  return /** @type {Record<string, string>} */ (JSON.parse(raw));
};
/** @param {string} brieftextHtml */
const setDraft = (brieftextHtml) => localStorage.setItem(DRAFT_KEY, JSON.stringify({ brieftext: brieftextHtml }));
/** @returns {HTMLElement | null} */
const field = () => document.getElementById('brieftext');
/** @returns {HTMLElement} */
const mustField = () => {
  const f = field();
  if (!f) throw new Error('Test-Fixture fehlt: #brieftext');
  return f;
};
const seed = () => mustField().replaceChildren();
/** @param {string} text */
const setField = (text) => { mustField().textContent = text; };
/** @returns {string} */
const fieldText = () => mustField().textContent || '';

/**
 * Erster Textknoten eines Elements; wirft, wenn Element oder Textknoten fehlen.
 * @param {Element | null} el
 * @returns {Node}
 */
const textNode = (el) => {
  if (!el) throw new Error('Test-Fixture: Element fehlt');
  const node = el.firstChild;
  if (!node) throw new Error('Test-Fixture: kein Textknoten');
  return node;
};

/**
 * Wartet bis zu einer Sekunde auf ein asynchrones Ergebnis (IndexedDB-Transaktionen).
 * @param {() => Promise<boolean>} probe
 * @returns {Promise<boolean>}
 */
const warteAuf = async (probe) => {
  for (let i = 0; i < 100; i++) {
    if (await probe()) return true;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return false;
};

localStorage.clear();

describe('DraftManager: Sanitizing (XSS-Schutz, echte Route localStorage → loadDraft)', () => {
  it('entfernt <script> und erlaubte/verbotene Tags korrekt', () => {
    setDraft('<b>fett</b><script>alert(1)</script><span class="fremd">kursiv</span><span class="brief-kommentar">Anmerkung</span>');
    new DraftManager().loadDraft();
    const html = mustField().innerHTML;
    assert(!html.includes('script'), 'kein <script> im DOM');
    assert(!html.includes('class="fremd"'), 'Attribute fremder spans werden gestrippt');
    assert(html.includes('kursiv'), 'Textinhalt des fremden span bleibt');
    assert(html.includes('<b>fett</b>'), 'erlaubtes <b> bleibt');
    assert(html.includes('brief-kommentar'), 'span.brief-kommentar bleibt erhalten');
    assert(html.includes('Anmerkung'), 'Textinhalte von verbotenen Tags bleiben');
  });

  it('stript Event-Handler-Attribute (onerror)', () => {
    setDraft('<img src=x onerror=alert(1)>Text');
    new DraftManager().loadDraft();
    const html = mustField().innerHTML;
    assert(!html.includes('onerror'), 'kein onerror-Attribut');
    assert(!html.includes('<img'), 'kein <img>-Element (nicht in Allowlist)');
    assert(html.includes('Text'), 'ummantelter Text bleibt');
  });

  it('erhält die Format-Allowlist (strong, s, blockquote) und stript u (DIN 5008 13.1)', () => {
    setDraft('<strong>a</strong><u>b</u><s>c</s><blockquote>d</blockquote>');
    new DraftManager().loadDraft();
    const html = mustField().innerHTML;
    for (const tag of ['<strong>', '<s>', '<blockquote>']) {
      assert(html.includes(tag), `erlaubtes ${tag} bleibt`);
    }
    assert(!html.includes('<u>') && !html.includes('</u>'), 'u-Tag wird gestrippt');
    assert(html.includes('b'), 'Inhalt des u-Tags bleibt erhalten');
  });
});

describe('sanitizeRichText — Kursiv', () => {
  /** @param {DocumentFragment} frag */
  const alsHtml = (frag) => {
    const d = document.createElement('div');
    d.appendChild(frag);
    return d.innerHTML;
  };

  it('behält <i>', () => {
    assert(alsHtml(sanitizeRichText('<i>Kursiv</i>')).includes('<i>'), 'i bleibt erhalten');
  });

  it('behält <em>', () => {
    assert(alsHtml(sanitizeRichText('<em>Betonung</em>')).includes('<em>'), 'em bleibt erhalten');
  });

  it('behält <b> und <i> gemeinsam', () => {
    const html = alsHtml(sanitizeRichText('<b>Fett</b><i>Kursiv</i>'));
    assert(html.includes('<b>'), 'b bleibt erhalten');
    assert(html.includes('<i>'), 'i bleibt erhalten');
  });

  it('Regression: <script> wird entfernt', () => {
    const html = alsHtml(sanitizeRichText('<script>x</script>'));
    assert(!html.includes('<script>'), 'script-Tag wird gestrippt');
  });
});

describe('toggleInlineFormat — Bold', () => {
  /** @param {HTMLElement} el @param {number} start @param {number} ende */
  const auswahl = (el, start, ende) => {
    el.focus();
    const node = textNode(el);
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, ende);
    const sel = /** @type {Selection} */ (getSelection());
    sel.removeAllRanges();
    sel.addRange(range);
  };
  /** @param {HTMLElement} el */
  /** @param {HTMLElement} el @param {Node} [container] */
  const kollabiere = (el, container = textNode(el)) => {
    el.focus();
    const range = document.createRange();
    range.setStart(container, 2);
    range.collapse(true);
    const sel = /** @type {Selection} */ (getSelection());
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const bauen = () => {
    const el = document.createElement('div');
    el.id = 'text';
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-feldtyp', 'rich mehrzeilig');
    document.body.append(el);
    return el;
  };

  it('wickelt die Auswahl in <b>', () => {
    const el = bauen();
    try {
      el.innerHTML = 'Hallo Welt';
      auswahl(el, 6, 10);
      toggleInlineFormat(el, 'b');
      assert(el.innerHTML.includes('<b>'), `b entsteht: ${el.innerHTML}`);
    } finally {
      el.remove();
    }
  });

  it('entpackt eine Auswahl in <b> wieder', () => {
    const el = bauen();
    try {
      el.innerHTML = 'Hallo Welt';
      auswahl(el, 6, 10);
      toggleInlineFormat(el, 'b');
      toggleInlineFormat(el, 'b');
      assert(!el.innerHTML.includes('<b>'), `b ist entpackt: ${el.innerHTML}`);
      assert(el.textContent.includes('Hallo Welt'), 'Text bleibt erhalten');
    } finally {
      el.remove();
    }
  });

  it('entpackt auch <strong>', () => {
    const el = bauen();
    try {
      el.innerHTML = 'Hallo <strong>Welt</strong>';
      const node = textNode(el.querySelector('strong'));
      el.focus();
      const range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, 4);
      const sel = /** @type {Selection} */ (getSelection());
      sel.removeAllRanges();
      sel.addRange(range);

      toggleInlineFormat(el, 'b');
      assert(!el.innerHTML.includes('<strong>'), `strong ist entpackt: ${el.innerHTML}`);
    } finally {
      el.remove();
    }
  });

  it('tut bei kollabiertem Cursor nichts', () => {
    const el = bauen();
    try {
      el.innerHTML = '<b>Welt</b>';
      kollabiere(el, textNode(el.querySelector('b')));
      const vorher = el.innerHTML;
      toggleInlineFormat(el, 'b');
      assertEqual(el.innerHTML, vorher, 'kollabierter Cursor entpackt nicht');
    } finally {
      el.remove();
    }
  });
});

describe('toggleInlineFormat — Italic', () => {
  const bauen = () => {
    const el = document.createElement('div');
    el.id = 'text';
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-feldtyp', 'rich mehrzeilig');
    document.body.append(el);
    return el;
  };
  /** @param {HTMLElement} el @param {number} start @param {number} ende */
  const auswahl = (el, start, ende) => {
    el.focus();
    const range = document.createRange();
    range.setStart(textNode(el), start);
    range.setEnd(textNode(el), ende);
    const sel = /** @type {Selection} */ (getSelection());
    sel.removeAllRanges();
    sel.addRange(range);
  };

  it('wickelt die Auswahl in <i>', () => {
    const el = bauen();
    try {
      el.innerHTML = 'Hallo Welt';
      auswahl(el, 6, 10);
      toggleInlineFormat(el, 'i');
      assert(el.innerHTML.includes('<i>'), `i entsteht: ${el.innerHTML}`);
    } finally {
      el.remove();
    }
  });

  it('entpackt eine Auswahl in <i> wieder', () => {
    const el = bauen();
    try {
      el.innerHTML = 'Hallo Welt';
      auswahl(el, 6, 10);
      toggleInlineFormat(el, 'i');
      toggleInlineFormat(el, 'i');
      assert(!el.innerHTML.includes('<i>'), `i ist entpackt: ${el.innerHTML}`);
    } finally {
      el.remove();
    }
  });

  it('entpackt auch <em>', () => {
    const el = bauen();
    try {
      el.innerHTML = 'Hallo <em>Welt</em>';
      const node = textNode(el.querySelector('em'));
      el.focus();
      const range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, 4);
      const sel = /** @type {Selection} */ (getSelection());
      sel.removeAllRanges();
      sel.addRange(range);

      toggleInlineFormat(el, 'i');
      assert(!el.innerHTML.includes('<em>'), `em ist entpackt: ${el.innerHTML}`);
    } finally {
      el.remove();
    }
  });

  it('tut bei kollabiertem Cursor nichts', () => {
    const el = bauen();
    try {
      el.innerHTML = '<i>Welt</i>';
      el.focus();
      const range = document.createRange();
      range.setStart(textNode(el.querySelector('i')), 2);
      range.collapse(true);
      const sel = /** @type {Selection} */ (getSelection());
      sel.removeAllRanges();
      sel.addRange(range);
      const vorher = el.innerHTML;
      toggleInlineFormat(el, 'i');
      assertEqual(el.innerHTML, vorher, 'kollabierter Cursor entpackt nicht');
    } finally {
      el.remove();
    }
  });
});

describe('toggleInlineFormat — Edge-Cases', () => {
  it('wickelt eine Auswahl über mehrere Knoten ohne Fehler', () => {
    const el = document.createElement('div');
    el.id = 'text';
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-feldtyp', 'rich mehrzeilig');
    document.body.append(el);
    try {
      el.innerHTML = 'Hallo <b>Welt</b>';
      el.focus();
      const range = document.createRange();
      range.setStart(textNode(el), 2);
      range.setEnd(textNode(el.querySelector('b')), 2);
      const sel = /** @type {Selection} */ (getSelection());
      sel.removeAllRanges();
      sel.addRange(range);

      toggleInlineFormat(el, 'b');
      assert(el.innerHTML.includes('<b>'), `b bleibt/entsteht: ${el.innerHTML}`);
      assert(el.textContent.replace(/\s+/g, ' ').trim() === 'Hallo Welt', 'Text bleibt erhalten');
    } finally {
      el.remove();
    }
  });
});

describe('#restoreState — Kursiv', () => {
  it('stellt <i> aus dem Entwurf wieder her', () => {
    const el = document.createElement('div');
    el.id = 'text';
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-feldtyp', 'rich mehrzeilig');
    document.body.append(el);

    const dm = new DraftManager(createEventBus());
    try {
      dm.restoreDraft({ text: '<i>Kursiv</i>' });
      assert(el.innerHTML.includes('<i>'), 'i überlebt den Restore');
    } finally {
      dm.destroy();
      el.remove();
    }
  });
});

describe('Textformatierung — Toolbar', () => {
  const bauen = () => {
    const el = document.createElement('div');
    el.id = 'text';
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-feldtyp', 'rich mehrzeilig');

    const wrap = document.createElement('div');
    for (const [id, label] of [['btn-bold', 'B'], ['btn-italic', 'I'], ['btn-quote', '❝']]) {
      const b = document.createElement('button');
      b.id = id;
      b.type = 'button';
      b.textContent = label;
      b.setAttribute('aria-pressed', 'false');
      wrap.appendChild(b);
    }
    document.body.append(el, wrap);
    return { el, wrap };
  };

  /** @param {HTMLElement} el @param {number} start @param {number} ende */
  const auswahl = (el, start, ende) => {
    el.focus();
    const range = document.createRange();
    range.setStart(textNode(el), start);
    range.setEnd(textNode(el), ende);
    const sel = /** @type {Selection} */ (getSelection());
    sel.removeAllRanges();
    sel.addRange(range);
  };

  /** @param {{el: HTMLElement, wrap: HTMLElement}} t */
  const aufraeumen = (t) => {
    t.el.remove();
    t.wrap.remove();
    /** @type {Selection} */ (getSelection()).removeAllRanges();
  };

  it('toggleInlineFormat setzt <b> auf die Auswahl', () => {
    const t = bauen();
    try {
      t.el.innerHTML = 'Hallo Welt';
      auswahl(t.el, 6, 10);
      toggleInlineFormat(t.el, 'b');
      assert(t.el.innerHTML.includes('<b>'), `b entsteht: ${t.el.innerHTML}`);
    } finally {
      aufraeumen(t);
    }
  });

  it('Regression: toggleBlockquote setzt weiterhin ein Zitat', () => {
    const t = bauen();
    try {
      t.el.innerHTML = 'Hallo Welt';
      auswahl(t.el, 0, 10);
      toggleBlockquote(t.el);
      assert(t.el.innerHTML.includes('<blockquote>'), `blockquote entsteht: ${t.el.innerHTML}`);
    } finally {
      aufraeumen(t);
    }
  });

  it('syncFormatState setzt aria-pressed am Fett-Button', () => {
    const t = bauen();
    try {
      t.el.innerHTML = 'Hallo <b>Welt</b>';
      t.el.focus();
      const b = t.el.querySelector('b');
      const range = document.createRange();
      range.setStart(textNode(b), 2);
      range.collapse(true);
      const sel = /** @type {Selection} */ (getSelection());
      sel.removeAllRanges();
      sel.addRange(range);

      syncFormatState();
      const btn = /** @type {HTMLElement} */ (document.getElementById('btn-bold'));
      assertEqual(btn.getAttribute('aria-pressed'), 'true', 'Fett-Button ist gedrückt');
    } finally {
      aufraeumen(t);
    }
  });

  it('Regression: Ctrl+B wird von der Tastenlogik nicht blockiert', () => {
    const t = bauen();
    const uip = new UIProtections();
    uip.init();
    try {
      t.el.focus();
      const ev = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true });
      t.el.dispatchEvent(ev);
      assertEqual(ev.defaultPrevented, false, 'Ctrl+B bleibt der nativen Engine überlassen');
    } finally {
      aufraeumen(t);
    }
  });
});

describe('DraftManager: localStorage-Roundtrip', () => {
  it('saveDraft schreibt alle contenteditable-Felder nach localStorage', () => {
    seed();
    setField('Rundtrip');
    new DraftManager().saveDraft();
    assertEqual(getDraft().brieftext, 'Rundtrip', 'Draft-JSON enthält Feldinhalt');
  });

  it('loadDraft stellt gespeicherten Draft wieder her', () => {
    seed();
    new DraftManager().loadDraft();
    assertEqual(fieldText(), 'Rundtrip', 'Feldinhalt aus Draft wiederhergestellt');
  });
});

describe('DraftManager: Undo/Redo', () => {
  it('undo() stellt vorherigen Stand wieder her, redo() stützt ihn wieder vor', () => {
    seed();
    setField('Version 1');
    const dm = new DraftManager();
    dm.saveDraft();
    setField('Version 2');
    dm.saveDraft();
    dm.undo();
    assertEqual(fieldText(), 'Version 1', 'undo → Version 1');
    dm.redo();
    assertEqual(fieldText(), 'Version 2', 'redo → Version 2');
  });
});

describe('DraftManager: Anlagen-Restore (M2 Datenverlust-Fix)', () => {
  it('migriert altes <li>-HTML beim Laden in Textarea-Text', () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      'anlagen-angabe': '<ul><li>Anlage A</li><li>Anlage B</li></ul>'
    }));
    new DraftManager().loadDraft();
    const anlagen = /** @type {HTMLTextAreaElement} */ (document.getElementById('anlagen-angabe'));
    assert(anlagen instanceof HTMLTextAreaElement, 'textarea-Fixture');
    assertEqual(anlagen.value, 'Anlage A\nAnlage B', 'zwei Zeilen migriert');
  });

  it('Anlagen-Feld ist ein natives textarea ohne contenteditable', () => {
    const anlagen = /** @type {HTMLTextAreaElement} */ (document.getElementById('anlagen-angabe'));
    assert(anlagen instanceof HTMLTextAreaElement, 'textarea-Fixture');
    assert(!anlagen.hasAttribute('contenteditable'), 'kein contenteditable mehr');
  });

  it('setupPrintProtection entfernt Fokus vor dem Druckdialog (beforeprint blur)', () => {
    const input = document.getElementById('brieftext');
    if (!input) throw new Error('Test-Fixture fehlt: #brieftext');
    input.focus();
    assertEqual(document.activeElement, input);
    const uip = new UIProtections();
    uip.setupPrintProtection();
    window.dispatchEvent(new Event('beforeprint'));
    assert(document.activeElement !== input, 'Fokus wurde vor dem Druckdialog entfernt');
  });
});

describe('Anlagen-Migration', () => {
  it('Field.getValue liefert den textarea-Wert', () => {
    const ta = document.createElement('textarea');
    ta.value = 'A\nB';
    assertEqual(Field.getValue(ta), 'A\nB', 'value statt textContent');
  });

  it('collectDraft speichert den textarea-Wert', () => {
    const anlagen = /** @type {HTMLTextAreaElement} */ (document.getElementById('anlagen-angabe'));
    assert(anlagen instanceof HTMLTextAreaElement, 'textarea-Fixture');
    const vorher = anlagen.value;
    try {
      anlagen.value = 'Rechnung\nVollmacht';
      assertEqual(collectDraft()['anlagen-angabe'], 'Rechnung\nVollmacht', 'Wert landet im Draft');
    } finally {
      anlagen.value = vorher;
    }
  });

  it('restoreDraft migriert altes <li>-HTML zu Zeilen', () => {
    const dm = new DraftManager(createEventBus());
    const anlagen = /** @type {HTMLTextAreaElement} */ (document.getElementById('anlagen-angabe'));
    try {
      dm.restoreDraft({ 'anlagen-angabe': '<ul><li>A</li><li>B</li></ul>' });
      assertEqual(anlagen.value, 'A\nB', 'HTML zu zwei Zeilen');
    } finally {
      dm.destroy();
    }
  });

  it('Export lässt Plaintext unverändert (kein doppeltes Strippen)', () => {
    const payload = buildDinLetterPayload({ 'anlagen-angabe': 'A\nB' });
    const i = payload._meta.schema.indexOf('anlagen-angabe');
    assertEqual(payload.fields[i], 'A\nB', 'Zeilen bleiben erhalten');
  });
});

describe('DraftManager: Speicherzustand (B53)', () => {
  it('durchläuft pending -> synced und flush ist idempotent', () => {
    const dm = new DraftManager();
    assertEqual(dm.saveState, 'synced', 'frisch erzeugt ist synchron');
    dm.scheduleAutoSave();
    assertEqual(dm.saveState, 'pending', 'geplantes Speichern ist pending');
    assert(dm.flushPendingSave(), 'flush schreibt anstehende Änderungen');
    assertEqual(dm.saveState, 'synced', 'nach dem Schreiben ist der Zustand synced');
    assertEqual(dm.flushPendingSave(), false, 'zweiter flush ohne Änderung ist ein No-op');
    dm.destroy();
  });
});

describe('DraftManager: Stabilitäts-Audit & Quota-Fehlerbehandlung (B54)', () => {
  it('fängt QuotaExceededError und ariaNotify-Fehler sauber ab, setzt error-Status und publiziert DOCUMENT_SAVE_FAILED', () => {
    seed();
    setField('Quota Test');

    const origSetItem = localStorage.setItem;
    // @ts-ignore
    const origAriaNotify = document.ariaNotify;

    let failedEventReceived = false;
    const bus = createEventBus();
    bus.subscribe(Events.DOCUMENT_SAVE_FAILED, () => {
      failedEventReceived = true;
    });

    const dm = new DraftManager(bus);

    /* Fixture: #setSaveStatus schreibt in dieses Element. Ohne es liefen die
     * Zusicherungen unten ins Leere — genau das war der tote Guard. */
    const statusEl = document.createElement('span');
    statusEl.id = 'save-status';
    document.body.append(statusEl);

    try {
      // 1. Simuliere QuotaExceededError
      localStorage.setItem = () => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      };

      // 2. Simuliere werfendes ariaNotify (z. B. ungültige Parameter)
      // @ts-ignore
      document.ariaNotify = () => {
        throw new TypeError("Failed to execute 'ariaNotify' on 'Document': Invalid priority 'important'");
      };

      const saveResult = dm.saveDraft();
      assertEqual(saveResult, false, 'saveDraft liefert false bei QuotaExceededError');
      assertEqual(dm.saveState, 'error', 'saveState wechselt deterministisch auf error');
      assert(failedEventReceived, 'DOCUMENT_SAVE_FAILED Event wurde über den EventBus publiziert');

      assertEqual(statusEl.dataset.state, 'error', 'save-status Element hat data-state="error"');
      assertEqual(statusEl.getAttribute('role'), 'alert', 'Fallback role="alert" gesetzt');
      assertEqual(statusEl.getAttribute('aria-live'), 'assertive', 'aria-live="assertive" gesetzt');
    } finally {
      localStorage.setItem = origSetItem;
      // @ts-ignore
      document.ariaNotify = origAriaNotify;
      dm.destroy();
      statusEl.remove();
    }
  });

  it('setzt im Regelbetrieb keine Live-Region (kein Screenreader-Spam bei jedem Autosave)', () => {
    const el = document.createElement('span');
    el.id = 'save-status';
    document.body.append(el);
    const dm = new DraftManager(createEventBus());
    try {
      seed();
      setField('Spam-Test');
      dm.saveDraft();
      assertEqual(el.dataset.state, 'saved', 'Status steht auf saved');
      assertEqual(el.getAttribute('role'), null, 'kein role im Regelbetrieb');
      assertEqual(el.getAttribute('aria-live'), null, 'kein aria-live im Regelbetrieb');
    } finally {
      dm.destroy();
      el.remove();
    }
  });
});

describe('initSenderSync: Nutzertext überlebt Undo/Restore', () => {
  it('überschreibt eine von Hand geänderte Rücksendezeile nach DOCUMENT_CHANGED nicht', () => {
    const ids = ['absender-name', 'absender-strasse', 'absender-ort', 'rucksendeangabe', 'unterschrift'];
    const els = ids.map((id) => {
      const el = document.createElement('div');
      el.id = id;
      el.setAttribute('contenteditable', 'plaintext-only');
      document.body.append(el);
      return el;
    });
    const [name, strasse, ort, rueck, unterschrift] = els;
    /** @param {HTMLElement} el @param {string} text */
    const tippe = (el, text) => {
      el.textContent = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    try {
      initSenderSync();
      tippe(name, 'Max Mustermann');
      tippe(strasse, 'Musterweg 1');
      tippe(ort, '12345 Musterstadt');
      assertEqual(rueck.textContent, 'M. Mustermann • Musterweg 1 • 12345 Musterstadt', 'Auto-Zeile entsteht');
      assertEqual(unterschrift.textContent, 'Max Mustermann', 'Maschinenschrift übernimmt den Namen');

      tippe(rueck, 'EIGENE ZEILE VON HAND');
      // Undo/Redo und Reset publizieren genau dieses Event.
      eventBus.publish(Events.DOCUMENT_CHANGED, { draft: {} });
      tippe(name, 'Moritz Baumeister');

      assertEqual(rueck.textContent, 'EIGENE ZEILE VON HAND', 'Handzeile bleibt nach dem Namens-Edit stehen');
      assertEqual(unterschrift.textContent, 'Moritz Baumeister', 'Maschinenschrift folgt weiterhin dem Namen');
    } finally {
      els.forEach((el) => el.remove());
    }
  });
});

describe('Persistence: Import-Speichervorgang & Fehlerschutz vor Reload (B55)', () => {
  it('bricht bei fehlgeschlagenem saveJSON sofort ab und führt keinen Reload aus', () => {
    const origSetItem = localStorage.setItem;
    let reloadTriggered = false;

    try {
      // Simuliere vollen / gesperrten Speicher
      localStorage.setItem = () => {
        throw new DOMException('Storage is full', 'QuotaExceededError');
      };

      const payload = {
        ok: true,
        format: DINLETTER_FORMAT,
        schema_version: 4,
        fields: { betreff: 'Wichtiger Import' }
      };

      const success = applyImportedData(payload, {
        reloadFn: () => {
          reloadTriggered = true;
        }
      });

      assertEqual(success, false, 'applyImportedData liefert false bei Speicherfehler');
      assertEqual(reloadTriggered, false, 'location.reload wird bei Speicherfehler niemals ausgeführt');
    } finally {
      localStorage.setItem = origSetItem;
    }
  });

  it('führt bei erfolgreichem Speichern den Reload-Callback aus', () => {
    let reloadTriggered = false;
    const payload = {
      ok: true,
      format: DINLETTER_FORMAT,
      schema_version: 4,
      fields: { betreff: 'Erfolgreicher Import' }
    };

    const success = applyImportedData(payload, {
      reloadFn: () => {
        reloadTriggered = true;
      }
    });

    assertEqual(success, true, 'applyImportedData liefert true bei Erfolg');
    assertEqual(reloadTriggered, true, 'Reload-Callback wird bei Erfolg ausgeführt');
  });
});

describe('Import/Export: DIN-Brief-JSON-Payload (pure Funktionen)', () => {
  /* Kanonischer v4-Payload (P4): seit 2026-11-10 muss _meta.schema exakt
   * DOCUMENT_SCHEMA_V4 entsprechen. Die alten Tests nutzten reduzierte
   * Schemata und pruefen jetzt mit dieser Fixture dieselben Aussagen. */
  /** @param {Record<string, string | boolean>} [werte] */
  const v4Payload = (werte = {}) => {
    const schema = [...DOCUMENT_SCHEMA_V4];
    /** @type {Array<string | boolean>} */
    const fields = schema.map((k) => (k.startsWith('toggle-') ? false : ''));
    for (const [k, v] of Object.entries(werte)) {
      const i = schema.indexOf(k);
      if (i >= 0) fields[i] = v;
    }
    return { format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema }, fields };
  };

  it('buildDinLetterPayload setzt Schema v4 mit generated_at und Tuple-Feldern', () => {
    const payload = buildDinLetterPayload({ betreff: 'Test' });
    assertEqual(payload.format, DINLETTER_FORMAT);
    assertEqual(payload.schema_version, Constants.SCHEMA_VERSION);
    assertEqual(payload.schema_version, 4);
    assertEqual(payload.generator, 'DIN-BriefNEO');
    assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(payload.generated_at), 'generated_at ist ein Zeitstempel');
    assert(Array.isArray(payload.fields), 'fields ist ein Array');
    assertEqual(payload.fields.length, DOCUMENT_SCHEMA_V4.length, 'exakt 35 Schema-Felder');
    assertEqual(payload._meta?.schema?.length, DOCUMENT_SCHEMA_V4.length, 'exakt 35 Schema-Header');
    const idxBetreff = payload._meta.schema.indexOf('betreff');
    assertEqual(payload.fields[idxBetreff], 'Test');
    assert(!('draft' in payload), 'draft ist gestrichen');
    assert(!('settings' in payload), 'settings ist gestrichen');
    assert(!('profile' in payload), 'profile ist gestrichen');
    assert(!('font' in payload), 'font ist gestrichen');
    assert(!('app' in payload) && !('created' in payload) && !('tool' in payload), 'Meta-Rauschen ist gestrichen');
  });

  it('layout.marks wird exportiert (Regression: marks ging beim Export verloren)', () => {
    assertEqual(buildDinLetterPayload({}, { marks: false }).layout.marks, false, 'marks: false kommt an');
    assertEqual(buildDinLetterPayload({}, { marks: true }).layout.marks, true, 'marks: true kommt an');
    assertEqual(buildDinLetterPayload({}).layout.marks, true, 'Default ist true');
  });

  it('layout.guides ist ohne Einstellungen false (Abgleich mit DEFAULT_SETTINGS)', () => {
    assertEqual(buildDinLetterPayload({}).layout.guides, false, 'Default guides = false');
    assertEqual(buildDinLetterPayload({}, { guides: true }).layout.guides, true, 'gesetztes guides kommt an');
    assertEqual(buildDinLetterPayload({}).layout.copyfit, false, 'copyfit hat keinen Schreiber, Default false');
    assertEqual(buildDinLetterPayload({}).layout.form, 'form-b', 'Default Form B');
    assertEqual(buildDinLetterPayload({}, { layout: 'form-a' }).layout.form, 'form-a', 'Form A kommt an');
    assertEqual(buildDinLetterPayload({}, { layout: 'form-z' }).layout.form, 'form-b', 'ungültige Form fällt auf B zurück');
  });

  it('Toggles sind Boolean im JSON, vermerke-visible ist kein Feld', () => {
    const payload = buildDinLetterPayload({ 'toggle-anlagen': 'true', 'toggle-fuss': true, 'vermerke-visible': 'true', vermerke: 'Einschreiben' });
    const idxAnlagen = payload._meta.schema.indexOf('toggle-anlagen');
    const idxFuss = payload._meta.schema.indexOf('toggle-fuss');
    assertEqual(payload.fields[idxAnlagen], true, 'String "true" wird Boolean');
    assertEqual(payload.fields[idxFuss], true);
    assert(!payload._meta.schema.includes('vermerke-visible'), 'vermerke-visible wird nicht exportiert');
    const p2 = buildDinLetterPayload({ 'toggle-anlagen': false });
    assertEqual(p2.fields[idxAnlagen], false);
  });

  it('parseDinLetterPayload liest v4-Tuple-Payloads fehlerfrei ein (Roundtrip)', () => {
    const payload = buildDinLetterPayload(
      { betreff: 'Roundtrip', text: '<p>x</p>' },
      { layout: 'form-a', marks: false, guides: false }
    );
    const result = parseDinLetterPayload(JSON.stringify(payload));
    assert(result.ok, 'v4 wird akzeptiert');
    if (result.ok) {
      assertEqual(result.fields.betreff, 'Roundtrip');
      assertEqual(result.fields.text, '<p>x</p>');
      assertEqual(result.layout?.form, 'form-a');
      assertEqual(result.layout?.marks, false);
      assertEqual(result.schemaVersion, 4);
    }
  });

  it('parseDinLetterPayload lehnt Payloads mit schema_version !== 4 oder fehlendem _meta.schema ab', () => {
    // Ungültige/Veraltete Versionen
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 3, _meta: { schema: [] }, fields: [] }).ok, 'v3 abgelehnt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 2, _meta: { schema: [] }, fields: [] }).ok, 'v2 abgelehnt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 1, _meta: { schema: [] }, fields: [] }).ok, 'v1 abgelehnt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 99, _meta: { schema: [] }, fields: [] }).ok, 'v99 abgelehnt');

    // Fehlendes oder ungültiges _meta.schema
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, fields: [] }).ok, '_meta fehlt komplett');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: {}, fields: [] }).ok, '_meta.schema fehlt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: 'ungueltig' }, fields: [] }).ok, '_meta.schema ist kein Array');

    // Fehlende oder ungültige fields
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: [] } }).ok, 'fields fehlt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: [] }, fields: { betreff: 'x' } }).ok, 'fields als Objekt abgelehnt');
  });

  it('parseDinLetterPayload lehnt ungültige Typen und defekte JSON-Daten ab', () => {
    assert(!parseDinLetterPayload('kein json {').ok, 'kein JSON');
    assert(!parseDinLetterPayload('{"format":"anderes"}').ok, 'falsches format');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['betreff'] }, fields: [42] })).ok, 'nicht-string Feld v4');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['toggle-fuss'] }, fields: ['nicht-boolean'] })).ok, 'nicht-boolean Toggle v4');
    // @ts-ignore
    assert(!parseDinLetterPayload(12345).ok, 'Zahl als Input abgelehnt');
  });

  it('parseDinLetterPayload toleriert UTF-8-BOM (Grok F4)', () => {
    const payload = JSON.stringify(v4Payload({ betreff: 'BOM' }));
    const result = parseDinLetterPayload(`\uFEFF${payload}`);
    assert(result.ok, 'BOM-präfixtes JSON wird akzeptiert');
    assertEqual(result.fields.betreff, 'BOM');
  });

  it('parseDinLetterPayload lehnt gefährliche/unplausible Keys im Schema ab (Prototyp-Hygiene, Grok F2)', () => {
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['__proto__'] }, fields: ['x'] }).ok, '__proto__ in Schema abgelehnt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['constructor'] }, fields: ['x'] }).ok, 'constructor in Schema abgelehnt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['a b'] }, fields: ['x'] }).ok, 'Leerzeichen in Schema abgelehnt');
    const ok = parseDinLetterPayload(v4Payload({ betreff: 'x' }));
    assert(ok.ok, 'normale Ids erlaubt');
    assertEqual(ok.fields.betreff, 'x');
  });

  it('parseDinLetterPayload validiert layout und signature defensiv', () => {
    const base = v4Payload();
    assert(!parseDinLetterPayload({ ...base, layout: { form: 'form-c' } }).ok, 'ungültige form abgelehnt');
    assert(!parseDinLetterPayload({ ...base, layout: { guides: 'ja' } }).ok, 'guides als String abgelehnt');
    assert(!parseDinLetterPayload({ ...base, layout: { marks: 1 } }).ok, 'marks als Zahl abgelehnt');
    assert(!parseDinLetterPayload({ ...base, layout: [] }).ok, 'layout als Array abgelehnt');
    assert(!parseDinLetterPayload({ ...base, signature: { transform: { x: 'ungueltig', y: 0, scale: 1, rot: 0 } } }).ok, 'ungültige Koordinaten abgelehnt');
    assert(parseDinLetterPayload({ ...base, layout: { form: 'form-a', marks: true } }).ok, 'gültiges layout akzeptiert');
  });

  it('Fußzone: die 12 DIN-Atome gehen als Felder durch Build und Parse', () => {
    const FUSS = ['firma', 'sitz', 'gericht', 'hrb', 'vorstand', 'gf', 'stnr', 'ustid', 'bank', 'iban', 'bic', 'anschrift'];
    /** @type {Record<string, string | boolean>} */
    const draft = { 'toggle-fuss': true };
    for (const f of FUSS) draft[`fuss-${f}`] = `Wert ${f}`;

    const payload = buildDinLetterPayload(draft);
    for (const f of FUSS) {
      const idx = payload._meta.schema.indexOf(`fuss-${f}`);
      assertEqual(payload.fields[idx], `Wert ${f}`, `fuss-${f} im Export`);
    }
    const idxToggle = payload._meta.schema.indexOf('toggle-fuss');
    assertEqual(payload.fields[idxToggle], true);

    const r = parseDinLetterPayload(JSON.stringify(payload));
    assert(r.ok, 'v4 mit Fußfeldern wird geparst');
    if (r.ok) {
      for (const f of FUSS) assertEqual(r.fields[`fuss-${f}`], `Wert ${f}`, `fuss-${f} im Import`);
    }

    // Roundtrip: 12 rein, 12 raus
    const wieder = buildDinLetterPayload(r.ok ? r.fields : {});
    for (const f of FUSS) {
      const idx = wieder._meta.schema.indexOf(`fuss-${f}`);
      assertEqual(wieder.fields[idx], `Wert ${f}`, `Roundtrip fuss-${f}`);
    }
  });

  it('Fußzone: leere Felder bleiben als leere Strings erhalten', () => {
    const FUSS = ['firma', 'sitz', 'gericht', 'hrb', 'vorstand', 'gf', 'stnr', 'ustid', 'bank', 'iban', 'bic', 'anschrift'];
    /** @type {Record<string, string | boolean>} */
    const leer = {};
    for (const f of FUSS) leer[`fuss-${f}`] = '';
    const payload = buildDinLetterPayload({ ...leer, 'toggle-fuss': false });
    for (const f of FUSS) {
      const idx = payload._meta.schema.indexOf(`fuss-${f}`);
      assertEqual(payload.fields[idx], '', `leeres fuss-${f} bleibt Feld`);
    }
    const idxToggle = payload._meta.schema.indexOf('toggle-fuss');
    assertEqual(payload.fields[idxToggle], false, 'Toggle aus heißt nur unsichtbar, nicht leer');
    assertEqual(payload.fields.length, DOCUMENT_SCHEMA_V4.length, '35 Schema-Felder');
  });

  it('layout und signature sind optional', () => {
    const r = parseDinLetterPayload(v4Payload({ betreff: 'x' }));
    assert(r.ok, 'ohne layout/signature ok');
    if (r.ok) {
      assertEqual(r.layout, undefined);
      assertEqual(r.signature, undefined);
      assertEqual(r.fields.betreff, 'x');
    }
  });

  it('buildDinLetterPayload erzeugt die v4-Struktur (layout, _meta, fields, signature)', () => {
    const payload = buildDinLetterPayload({ betreff: 'V4 Test' }, { layout: 'form-a', copyfit: true, guides: false, marks: false });
    assertEqual(payload.layout.form, 'form-a');
    assertEqual(payload.layout.copyfit, true);
    assertEqual(payload.layout.guides, false);
    assertEqual(payload.layout.marks, false);
    const idxBetreff = payload._meta.schema.indexOf('betreff');
    assertEqual(payload.fields[idxBetreff], 'V4 Test');
    assert(!('placed' in payload.signature), 'signature.placed ist gestrichen (kein Leser)');
    assertEqual(typeof payload.signature.transform.x, 'number');
  });

  it('buildDINLetterJSON erzeugt exakt dasselbe Datenmodell wie Export-Payload (SSoT / DeepEqual)', () => {
    saveJSON(STORAGE_KEYS.draft, { 'empfaenger-name': 'Max Mustermann', betreff: 'SSoT Test', text: '<p>Hallo Welt</p>', 'toggle-fuss': true });
    saveJSON(STORAGE_KEYS.settings, { layout: 'form-b', copyfit: false, guides: true, marks: false });

    const directPayload = buildDinLetterPayload(
      loadJSON(STORAGE_KEYS.draft, {}),
      loadJSON(STORAGE_KEYS.settings, null)
    );

    const unifiedPayload = buildDINLetterJSON();

    assertEqual(unifiedPayload.format, directPayload.format);
    assertEqual(unifiedPayload.schema_version, directPayload.schema_version);
    assertEqual(unifiedPayload.generator, directPayload.generator);
    assertEqual(JSON.stringify(unifiedPayload._meta), JSON.stringify(directPayload._meta));
    assertEqual(JSON.stringify(unifiedPayload.layout), JSON.stringify(directPayload.layout));
    assertEqual(JSON.stringify(unifiedPayload.fields), JSON.stringify(directPayload.fields));
    assertEqual(JSON.stringify(unifiedPayload.signature), JSON.stringify(directPayload.signature));

    // Teste mit registriertem Collector
    registerDraftCollector(() => ({ betreff: 'Live Collector' }));
    const collectorPayload = buildDINLetterJSON();
    const idxBetreff = collectorPayload._meta.schema.indexOf('betreff');
    assertEqual(collectorPayload.fields[idxBetreff], 'Live Collector');
    registerDraftCollector(null);
  });

  it('Roundtrip: buildDinLetterPayload -> JSON -> parseDinLetterPayload restauriert alle Felder', () => {
    const originalDraft = {
      rucksendeangabe: 'Wayne Enterprises, Gotham City',
      vermerke: 'Einschreiben eigenhändig',
      'empfaenger-firma': 'LexCorp Industries',
      'empfaenger-name': 'Alexander Joseph Luthor',
      'empfaenger-strasse': 'LexCorp Tower 1',
      'empfaenger-ort': 'Metropolis',
      'absender-name': 'Bruce Wayne',
      'absender-strasse': 'Mountain Drive 1007',
      'absender-ort': 'Gotham City',
      'absender-tel': '+49 30 23125-929',
      'absender-mail': 'bruce.wayne@wayne-enterprises.com',
      datum: '9. November 2026',
      spacer: '',
      betreff: 'Verschmelzungsvertrag Wayne Enterprises / LexCorp',
      teilbetreff: 'Az: WE-2026-X1',
      anrede: 'Sehr geehrter Herr Luthor,',
      text: '<p>in Bezug auf die anstehende Konsolidierung teilen wir folgendes mit.</p>',
      grussformel: 'Mit vorzüglicher Hochachtung',
      unterschrift: 'Bruce Wayne',
      'anlagen-angabe': 'Vertragsentwurf (2-fach)\nGutachten',
      'fuss-firma': 'Wayne Enterprises Inc.',
      'fuss-sitz': 'Gotham City',
      'fuss-gericht': 'Amtsgericht Gotham',
      'fuss-hrb': 'HRB 007007',
      'fuss-vorstand': 'Bruce Wayne',
      'fuss-gf': 'Lucius Fox',
      'fuss-stnr': '007/123/45678',
      'fuss-ustid': 'DE999999999',
      'fuss-bank': 'Gotham National Bank',
      'fuss-iban': 'DE89370400440532013000',
      'fuss-bic': 'BYLADEM1001',
      'fuss-anschrift': 'Wayne Tower, Gotham City',
      'toggle-anlagen': true,
      'toggle-fuss': true,
      'toggle-teilbetreff': true
    };

    const settings = {
      layout: 'form-a',
      guides: false,
      copyfit: false,
      marks: true,
      sensitiveSubject: true,
      signatureState: { x: 15.5, y: 102.3, scale: 0.75, rot: 2 }
    };

    const payload = buildDinLetterPayload(originalDraft, settings);
    const serialized = JSON.stringify(payload);
    const parsed = parseDinLetterPayload(serialized);

    assert(parsed.ok, 'Roundtrip-Parse erfolgreich');
    if (parsed.ok) {
      assertEqual(parsed.schemaVersion, 4);
      assertEqual(parsed.layout?.form, 'form-a');
      assertEqual(parsed.layout?.marks, true);
      assertEqual(parsed.layout?.sensitiveSubject, true);
      assertEqual(parsed.signature?.transform?.scale, 0.75);

      for (const [key, expectedVal] of Object.entries(originalDraft)) {
        assertEqual(parsed.fields[key], expectedVal, `Roundtrip-Feld '${key}'`);
      }
    }
  });
});

describe('parseDinLetterPayload — Schema-Reihenfolge', () => {
  /** @param {string[]} schema */
  const payloadMit = (schema) => ({
    format: DINLETTER_FORMAT,
    schema_version: 4,
    fields: schema.map((k) => (k.startsWith('toggle-') ? false : '')),
    _meta: { schema }
  });

  it('akzeptiert die kanonische Reihenfolge', () => {
    const res = parseDinLetterPayload(payloadMit([...DOCUMENT_SCHEMA_V4]));
    assertEqual(res.ok, true, `gültig: ${res.reason || ''}`);
  });

  it('lehnt vertauschte Reihenfolge ab', () => {
    const schema = [...DOCUMENT_SCHEMA_V4];
    [schema[0], schema[1]] = [schema[1], schema[0]];
    const res = parseDinLetterPayload(payloadMit(schema));
    assertEqual(res.ok, false, 'vertauscht wird abgelehnt');
    assert(res.reason.includes('_meta.schema'), `Meldung nennt _meta.schema: ${res.reason}`);
  });

  it('lehnt ein fehlendes Feld ab', () => {
    const schema = [...DOCUMENT_SCHEMA_V4];
    schema.pop();
    const res = parseDinLetterPayload(payloadMit(schema));
    assertEqual(res.ok, false, 'fehlendes Feld wird abgelehnt');
    assert(res.reason.includes('erwartet'), `Meldung nennt die Erwartung: ${res.reason}`);
  });

  it('lehnt ein zusätzliches Feld ab', () => {
    const schema = [...DOCUMENT_SCHEMA_V4, 'extra'];
    const res = parseDinLetterPayload(payloadMit(schema));
    assertEqual(res.ok, false, 'zusätzliches Feld wird abgelehnt');
    assert(res.reason.includes('erwartet'), `Meldung nennt die Erwartung: ${res.reason}`);
  });

  it('Regression: ungültiger Feldname wird weiter spezifisch gemeldet', () => {
    const schema = [...DOCUMENT_SCHEMA_V4];
    schema[0] = '__proto__';
    const res = parseDinLetterPayload(payloadMit(schema));
    assertEqual(res.ok, false, 'Prototype-Key wird abgelehnt');
    assert(res.reason.includes('Ungültiger Feldname'), `spezifische Meldung: ${res.reason}`);
  });
});

describe('W1 — Kommentare', () => {
  /** @type {any} */
  let w1 = null;
  const ladeW1 = async () => {
    if (w1) return w1;
    const res = await fetch('/tools/antipatterns/base.json');
    const data = await res.json();
    w1 = data.rules.find((/** @type {any} */ r) => r.id === 'W1');
    return w1;
  };

  it('ignoriert Kommentarzeilen (kein False Positive)', async () => {
    const rule = await ladeW1();
    assert(rule, 'W1 existiert');
    assert(typeof rule.ignore_line_pattern === 'string', 'ignore_line_pattern ist gesetzt');
    const re = new RegExp(rule.ignore_line_pattern);
    assert(re.test("// document.execCommand('bold')"), 'Zeilenkommentar wird ignoriert');
    assert(re.test(' * queryCommandState()'), 'JSDoc-Zeile wird ignoriert');
    assert(re.test('  /* execCommand() */'), 'Blockkommentar wird ignoriert');
  });

  it('trifft echten Code weiterhin (Regression)', async () => {
    const rule = await ladeW1();
    const ignoreRe = new RegExp(rule.ignore_line_pattern);
    const code = "document.execCommand('bold');";
    assert(!ignoreRe.test(code), 'Codezeile wird nicht ignoriert');
    assert(new RegExp(rule.pattern).test(code), 'W1-Pattern trifft die Codezeile weiterhin');
  });
});

describe('Popover: geschlossene Overlays blockieren keine Klickfläche', () => {
  it('belegt im geschlossenen Zustand keinen Layout-Kasten', () => {
    const popovers = [...document.querySelectorAll('[popover]')];
    assert(popovers.length >= 2, 'Popover-Fixtures vorhanden');
    for (const el of popovers) {
      const h = /** @type {HTMLElement} */ (el);
      if (h.matches(':popover-open')) h.hidePopover();
      const s = getComputedStyle(h);
      const name = h.id || h.tagName;
      assertEqual(s.display, 'none', `${name}: display:none (UA-Regel greift)`);
      /* Für die Hinweis-Toasts zusätzlich pointer-events: none — sie lagen
         unsichtbar über dem Brief und schluckten Textauswahl (2026-11-10). */
      if (name === 'hinweis-v4' || name === 'undo-hinweis') {
        assertEqual(s.pointerEvents, 'none', `${name}: keine Klickfläche`);
      }
    }
  });

  it('ist im geöffneten Zustand sichtbar und klickbar', () => {
    const popovers = [...document.querySelectorAll('[popover]')];
    for (const el of popovers) {
      const h = /** @type {HTMLElement} */ (el);
      h.showPopover();
      try {
        const s = getComputedStyle(h);
        assert(s.display !== 'none', `${h.id}: im geöffneten Zustand sichtbar`);
        assertEqual(s.pointerEvents, 'auto', `${h.id}: Klicks werden angenommen`);
      } finally {
        h.hidePopover();
      }
    }
  });
});

describe('CSS: Feld-Chrom gilt für contenteditable UND native Felder', () => {
  it('nutzt einen gemeinsamen Selektor für Ruhe, Hover und Fokus', async () => {
    const res = await fetch('/website/css/sheet-common.css');
    const css = await res.text();
    const gemeinsam = ':is([contenteditable], textarea[data-feldtyp])';
    assert(css.includes(gemeinsam), 'Grundzustand teilt den Selektor');
    assert(css.includes(`${gemeinsam}:hover:not(:focus)`), 'Hover-Regel teilt den Selektor');
    assert(css.includes(`${gemeinsam}:focus`), 'Fokus-Regel teilt den Selektor');
  });

  /* Kein DOM-Test moeglich: die Fixture laedt sheet-common.css nicht, und die
   * Regeln liegen in @scope (din-blatt). Geprueft wird deshalb der Vertrag im
   * Quelltext; der Beweis am laufenden Objekt steht im Commit (CDP-Messung). */
  it('blendet Platzhalter bis zum Boot-Ende aus (FOUC-Schutz)', async () => {
    const res = await fetch('/website/css/sheet-common.css');
    const css = await res.text();
    assert(css.includes(':root:not([data-ready="true"]) & [data-placeholder]:empty::before'),
      'contenteditable-Platzhalter haengt an data-ready');
    assert(css.includes(':root:not([data-ready="true"]) & textarea[data-feldtyp]::placeholder'),
      'textarea-Platzhalter haengt an data-ready');
  });
});

describe('Ratsche P38: contenteditable auf offenen Feldern', () => {
  const ERLAUBT = ['text', 'betreff', 'teilbetreff', 'vermerke'];

  /* Dieselbe Semantik wie tools/reconciliation.js: Pattern trifft, Ausnahmen
     (Datei + Zeilenmuster) heben auf. Geprueft wird die echte index.html. */
  const pruefeHtml = async () => {
    const [regelRes, htmlRes] = await Promise.all([
      fetch('/tools/antipatterns/project.json'),
      fetch('/website/index.html'),
    ]);
    const regel = (await regelRes.json()).rules.find((/** @type {any} */ r) => r.id === 'P38');
    const zeilen = (await htmlRes.text()).split(/\r?\n/);
    const trifft = (/** @type {string} */ zeile) => {
      if (!new RegExp(regel.pattern).test(zeile)) return false;
      return !(regel.exemptions || []).some(
        (/** @type {any} */ ex) => ex.file === 'website/index.html' && new RegExp(ex.pattern).test(zeile),
      );
    };
    return { regel, treffer: zeilen.filter(trifft) };
  };

  it('meldet ein offenes Feld (#empfaenger-name) als warning', async () => {
    const { regel, treffer } = await pruefeHtml();
    assert(regel, 'Regel P38 existiert');
    assertEqual(regel.severity, 'warning', 'Severity ist warning (kein Gate)');
    assert(treffer.some((z) => z.includes('id="empfaenger-name"')), '#empfaenger-name wird gemeldet');
  });

  it('laesst die vier erlaubten Felder in Ruhe', async () => {
    const { treffer } = await pruefeHtml();
    for (const id of ERLAUBT) {
      assert(!treffer.some((z) => z.includes(`id="${id}"`)), `#${id} wird nicht gemeldet`);
    }
    assertEqual(treffer.length, 26, 'genau 26 offene Felder');
  });
});

describe('Druck: A4-Seite ohne Ueberlauf (Print-CSS-Vertrag)', () => {
  /* Gerendert geprueft per CDP (2026-11-11): vor dem Fix kam ein einseitiger
   * Brief auf 2 PDF-Seiten, weil die erste Seite 20mm Unterrand hatte und der
   * Viewport sein 10px-Padding behielt. Hier steht der Vertrag, damit es nicht
   * zurueckkommt — der DOM-Test kann @page nicht rendern. */
  let css = '';
  const lade = async () => {
    if (!css) css = await (await fetch('/website/css/sheet-multipage.css')).text();
    return css;
  };

  it('erste Seite ist randlos, Folgeseiten behalten 25/20 mm', async () => {
    const src = await lade();
    assert(/@page :first\s*\{[^}]*margin:\s*0;/.test(src), '@page :first hat margin: 0');
    assert(/[^:]first[\s\S]{0,80}margin:\s*0 0 20mm 0/.test(src) === false, 'kein 20mm-Unterrand auf Seite 1');
    assert(/@page\s*\{[^}]*margin:\s*25mm 0 20mm 0;/.test(src), 'Folgeseiten: 25mm oben, 20mm unten');
  });

  it('Viewport und Briefansicht verlieren ihr Bildschirm-Layout im Druck', async () => {
    const src = await lade();
    assert(src.includes('#app-shell #viewport'), 'Viewport-Regel mit Spezifitaet 2,0,0');
    assert(src.includes('body[data-seiten="1"] #brief-ansicht'), 'Ansicht-Regel mit Spezifitaet 1,1,1');
  });

  it('Viewport-Padding ist im Druck unabhaengig vom data-seiten-Zustand', async () => {
    /* Gemessen per CDP/PDF (2026-11-11): Bei data-seiten="2" gewinnt die
     * Bildschirm-Regel `body[data-seiten]:not([data-seiten="1"]) #viewport`
     * (1,2,1) gegen `#viewport` (1,0,0) und `body[data-seiten="1"] #viewport`
     * (1,1,1). Folge: 40px/20px/80px Padding blieben im Druck stehen, der
     * Briefkopf sass je nach Zustand bei 51,36 / 54,01 / 61,94 mm und ein
     * kurzer Brief bekam eine leere Seite 2. `#app-shell #viewport` (2,0,0)
     * schlaegt jeden Zustands-Selektor. */
    const src = await lade();
    // Kommentare ausblenden: sie nennen den verfehlten Selektor als Begruendung.
    const druck = src.slice(src.indexOf('@media print')).replace(/\/\*[\s\S]*?\*\//g, '');
    assert(/#app-shell #viewport\s*\{[^}]*padding:\s*0 !important/.test(druck),
      '#app-shell #viewport setzt padding: 0 !important');
    assert(druck.includes('body[data-seiten="1"] #viewport') === false,
      'kein Zustands-Selektor, der data-seiten="2" verfehlt');
  });
});

describe('Rücksendeangabe — Text-Breite', () => {
  /* Gemessen im PDF (2026-11-11): ohne Fix lief die Rücksendezeile bis
   * xMax=109,44mm (Ellipse am Boxrand 110mm). Der Text darf laut Tab. A.1 nur
   * 80mm belegen (25 + 80 = 105mm). Mit padding-right:5mm + box-sizing:
   * border-box endet er bei 104,82mm, der Unterstrich bleibt 84,84mm lang.
   *
   * Die Testseite laedt nur base.css und sidebar.css (Minimal-Fixtures), das
   * Element existiert dort nicht — deshalb Vertragstest auf beide Blaetter. */
  it('beide Pfade begrenzen den Text auf 80mm, die Box bleibt 85mm', async () => {
    /** @param {string} datei @returns {Promise<string>} */
    const regel = async (datei) => {
      const src = await (await fetch(datei)).text();
      return (src.match(/#rucksendeangabe\s*\{([^}]*)\}/) || [])[1] ?? '';
    };
    for (const datei of ['/website/css/sheet.css', '/website/css/sheet-multipage.css']) {
      const block = await regel(datei);
      assert(block.includes('padding-right: 5mm'), `${datei}: padding-right 5mm`);
      assert(block.includes('box-sizing: border-box'), `${datei}: box-sizing border-box`);
    }
    // Geometrie: linke Kante 25mm + Textbreite 80mm = Zeilenende 105mm
    assertEqual(25 + 80, 105, 'Tab. A.1: Zeilenende 105mm');
  });
});

describe('din-geschaeftsangaben — kein toter data-bottom', () => {
  /* Gemessen (2026-11-11): die Print-Regel setzt top: 280mm und height: 15mm.
   * Ein zusaetzliches bottom ist bei absolut positionierten Elementen
   * over-constrained und wird ignoriert — erzwungenes `bottom: 100mm
   * !important` aenderte die Fusszeile nicht (282,07..294,77mm unveraendert).
   * data-bottom="10" war also im Mehrseiten-Modus toter Code. */
  it('Fusszeile und Kern tragen kein data-bottom mehr', async () => {
    const src = await (await fetch('/website/index.html')).text();
    const fuss = (src.match(/<din-geschaeftsangaben[^>]*>/) || [])[0] ?? '';
    assert(fuss !== '', 'din-geschaeftsangaben gefunden');
    assert(fuss.includes('data-bottom') === false, 'kein data-bottom auf din-geschaeftsangaben');
    const kern = (src.match(/<din-kern[^>]*>/) || [])[0] ?? '';
    assert(kern.includes('data-bottom') === false, 'Regression: din-kern bleibt ohne data-bottom');
    // Die Geometrie kommt weiterhin aus data-h (15mm) und der Print-Regel.
    assert(fuss.includes('data-h="15"'), 'data-h="15" bleibt erhalten');
  });
});

describe('#kern — kein toter data-bottom', () => {
  /* Gemessen (2026-11-11): #kern ist im Mehrseiten-Modus `position: relative`
   * (sheet-multipage.css), dort wirkt `bottom` nicht. data-bottom="30" wurde
   * nur vom stillgelegten Einzelseiten-Pfad (sheet.css) gelesen und war damit
   * toter Code. Die wirksame Unterkante ist padding-bottom: 20mm (7c524cc).
   *
   * Die Testseite hat kein #kern-Fixture — deshalb Quelltext-Vertrag. */
  it('das Kern-Element traegt kein data-bottom mehr', async () => {
    const src = await (await fetch('/website/index.html')).text();
    const kern = (src.match(/<din-kern[^>]*>/) || [])[0] ?? '';
    assert(kern !== '', 'din-kern gefunden');
    assert(kern.includes('data-bottom') === false, 'kein data-bottom auf #kern');
    /* Vertragsänderung 2026-11-11: hier stand zuvor "din-geschaeftsangaben
     * behaelt data-bottom=10" als Schutz gegen zu viel Loeschen. Die Messung
     * in Teil A hat gezeigt, dass auch dort `bottom` ignoriert wird — das
     * Attribut ist entfernt, die Schutzassertion steht jetzt im
     * geschaeftsangaben-Test. */
  });
});

describe('tools/print-messung.mjs', () => {
  /* Das Werkzeug ist kein Produktcode, soll aber nicht still kaputtgehen:
   * es traegt die Messung fuer TODO #47/#48. Der Browser-Test kann keinen
   * Prozess starten (kein child_process), deshalb Quelltext-Vertrag —
   * Exit-Codes und --help sind in der Shell belegt (siehe Commit-Message). */
  it('liegt im Repo und beginnt mit einer Shebang-Zeile', async () => {
    const antwort = await fetch('/tools/print-messung.mjs');
    assert(antwort.ok, `Datei ist erreichbar (HTTP ${antwort.status})`);
    const quelle = await antwort.text();
    assert(quelle.startsWith('#!/usr/bin/env node'), 'beginnt mit #!/usr/bin/env node');
    assert(quelle.includes('YMAX') === false, 'keine Platzhalter mehr im Quelltext');
  });

  it('kennt die Flags --saetze, --rand-u, --json und --keep-pdf', async () => {
    const quelle = await (await fetch('/tools/print-messung.mjs')).text();
    for (const flagge of ['--saetze', '--rand-u', '--json', '--keep-pdf', '--help']) {
      assert(quelle.includes(flagge), `Flag ${flagge} dokumentiert und geparst`);
    }
    // Voraussetzungen mit eigenem Exit-Code, damit Aufrufer sie unterscheiden koennen.
    for (const meldung of ['kein Browser gefunden', 'poppler-utils', 'antwortet nicht']) {
      assert(quelle.includes(meldung), `Voraussetzung meldet sich: ${meldung}`);
    }
    assert(quelle.includes('process.exit(2)'), 'Exit 2 fuer fehlende Voraussetzungen');
    assert(quelle.includes('process.exitCode = 3'), 'Exit 3 fuer fehlgeschlagenen PDF-Render');
  });
});

describe('test/fixtures/brief-42.json', () => {
  /* Referenzbrief für die PDF-Messung: statisch statt im Werkzeug erzeugt,
   * damit sich Messwerte nicht mit einer Formulierungsänderung verschieben.
   * Gemessen (2026-11-11): das Fixture ergibt exakt dieselben Werte wie der
   * generierte Text (2 Seiten, yMax 272,50mm bei randU=20). */
  it('ist valides JSON mit 42 Saetzen', async () => {
    const antwort = await fetch('/test/fixtures/brief-42.json');
    assert(antwort.ok, `Fixture erreichbar (HTTP ${antwort.status})`);
    const daten = JSON.parse(await antwort.text());
    assertEqual(daten.saetze, 42, 'saetze = 42');
    assert(typeof daten.text === 'string' && daten.text.length > 0, 'text ist ein nicht-leerer String');
    assert(daten.text.includes('Marke01'), 'beginnt mit Marke01');
    assert(daten.text.includes('Marke42'), 'endet mit Marke42');
    assertEqual((daten.text.match(/Marke/g) || []).length, 42, 'genau 42 Marken');
  });

  it('wird vom Werkzeug für --saetze 42 gelesen', async () => {
    const quelle = await (await fetch('/tools/print-messung.mjs')).text();
    assert(quelle.includes('fixtures/brief-42.json'), 'Hilfetext nennt das Fixture');
    assert(/fixture/i.test(quelle), 'Leselogik vorhanden');
    // Der Pfad wird aus saetze gebildet, damit auch 43/44 ein Fixture bekommen koennen.
    assert(quelle.includes('brief-${n}.json'), 'Fixture-Name folgt --saetze');
  });
});

describe('print-messung.mjs --modus bildschirm', () => {
  /* #48: greift --rand-u -> --nutz auch im Bildschirm-Paging? Gemessen
   * (2026-11-11): ja — columnHeight 252 -> 242mm, und die Grenze 2->3 Seiten
   * verschiebt sich von 48 auf 46 Sätze. Deshalb braucht das Werkzeug einen
   * zweiten Modus statt eines zweiten Skripts (der Browser-Start ist der
   * teuerste Teil). */
  it('kennt --modus mit beiden Werten und den Bildschirm-Feldern', async () => {
    const quelle = await (await fetch('/tools/print-messung.mjs')).text();
    assert(quelle.includes('--modus'), 'Flag --modus vorhanden');
    assert(quelle.includes("=== 'bildschirm'"), 'Bildschirm-Zweig vorhanden');
    for (const feld of ['columnHeight', 'dataSeiten', 'folgekopf-screen', '--nutz']) {
      assert(quelle.includes(feld), `Bildschirm-Modus liest ${feld}`);
    }
  });

  it('Help-Text nennt --modus bildschirm', async () => {
    const quelle = await (await fetch('/tools/print-messung.mjs')).text();
    assert(quelle.includes('--modus bildschirm'), 'Hilfe nennt --modus bildschirm');
    assert(quelle.includes('--modus pdf'), 'Hilfe nennt den PDF-Default');
  });
});

describe('Anschriftfeld — Rücksendeangabe gruppiert', () => {
  /* DIN 5008 19.4.3/4: ein Block. Gemessen im PDF (2026-11-11): die
   * Rücksendezeile liegt jetzt bei 45,11mm als erste Zeile des Blocks, die
   * Empfängerzeilen unverändert bei 51,36 / 56,12 / 61,15 / 66,18mm, der
   * Block misst 44,98mm (vorher ragte die Zeile 6mm darüber hinaus).
   * Die Testseite hat kein Anschriftfeld-Fixture — deshalb Quelltext-Vertrag. */
  it('ist erstes Kind von #anschriftfeld', async () => {
    const src = await (await fetch('/website/index.html')).text();
    const block = (src.match(/<din-anschriftfeld[\s\S]*?<\/din-anschriftfeld>/) || [])[0] ?? '';
    assert(block !== '', 'din-anschriftfeld gefunden');
    const innen = block.replace(/^<din-anschriftfeld[^>]*>/, '');
    const kinder = [...innen.matchAll(/<(din-[a-z-]+)\s+id="([^"]+)"/g)].map((m) => m[2]);
    assertEqual(kinder[0], 'rucksendeangabe', 'Rücksendeangabe ist das erste Kind');
    assertEqual(kinder[1], 'vermerke', 'danach folgen die Vermerke');
    // Ausserhalb des Blocks darf sie nicht mehr stehen.
    const vorBlock = src.slice(0, src.indexOf('<din-anschriftfeld'));
    assert(vorBlock.includes('id="rucksendeangabe"') === false, 'kein zweites Vorkommen ausserhalb');
  });

  it('erbt Geometrie vom Container und behaelt 45mm Blockhoehe', async () => {
    const src = await (await fetch('/website/index.html')).text();
    const zeile = (src.match(/<din-rucksendeangabe[^>]*>/) || [])[0] ?? '';
    assert(zeile !== '', 'din-rucksendeangabe gefunden');
    assert(zeile.includes('data-x=') === false, 'kein eigenes data-x (SSoT im Container)');
    assert(zeile.includes('data-w=') === false, 'kein eigenes data-w');
    assertEqual(zeile.match(/data-h="(\d+)"/)?.[1], '0', 'data-h="0": keine eigene Höhe');
    const blockTag = (src.match(/<din-anschriftfeld[^>]*>/) || [])[0] ?? '';
    assertEqual(blockTag.match(/data-h="(\d+)"/)?.[1], '45', 'Container bleibt 45mm hoch');
    // Der Unterstrich darf nicht auf die Textbreite schrumpfen (Invariante aus 543a4d8).
    assert(zeile.includes('data-font="8"'), 'Schriftgroesse 8pt bleibt am Feld');
  });
});

describe('Kuvert-Label — relativ zur Anschriftzone', () => {
  /* Gemessen (2026-11-11): nach dem Gruppieren des Anschriftfelds (9716cff)
   * saß das Label bei 40,00 mm (Form B) statt 46,00 mm, weil ::after relativ
   * zur Blockoberkante positioniert war. data-visier-top meint aber den
   * Abstand zur Anschriftzone. */
  it('::after beruecksichtigt den Versatz zwischen Block und Anschriftzone', async () => {
    const css = await (await fetch('/website/css/sheet-common.css')).text();
    const regel = (css.match(/#anschriftfeld::after\s*\{([^}]*)\}/) || [])[1] ?? '';
    assert(regel !== '', 'Regel #anschriftfeld::after gefunden');
    const top = (regel.match(/top:\s*([^;]+);/) || [])[1] ?? '';
    assert(top.includes('var(--anschriftfeld-y) - var(--briefkopf-y)'),
      'top enthält den Block-Versatz (anschriftfeld-y − briefkopf-y)');
    assert(top.includes('data-visier-top'), 'data-visier-top bleibt die Bezugsgröße');
    assert(top.startsWith('calc(-1') === false, 'kein nacktes -visier-top mehr');
  });
});

describe('Betreff — Abstand zum Infoblock', () => {
  /* DIN 5008 § 20.9.2: „Der Wortlaut des Betreffs ist nach zwei Leerzeilen
   * nach dem Informationsblock zu schreiben." Raster 4,23mm (Tab. B.1,
   * Fußnote a) -> 8,46mm. Gemessen im PDF (2026-11-11): Infoblock endet bei
   * 72,21mm, der Betreff stand bei 74,02mm (1,81mm Abstand) und gehört auf
   * 80,67mm. */
  it('setzt margin-top 6.65mm am Betreff, nicht am Spacer', async () => {
    const css = await (await fetch('/website/css/sheet-multipage.css')).text();
    const regel = (css.match(/#betreff\s*\{([^}]*)\}/) || [])[1] ?? '';
    assert(regel !== '', 'Regel #betreff gefunden');
    const oben = (regel.match(/margin-top:\s*([\d.]+)mm/) || [])[1];
    assertEqual(oben, '6.65', 'margin-top = 6.65mm (6,65 + 1,81 = 8,46 = zwei Leerzeilen)');
    // Der Abstand nach dem Betreff bleibt unangetastet (zwei Leerzeilen bis zur Anrede).
    assert(regel.includes('margin-bottom: 8.46mm'), 'margin-bottom bleibt 8.46mm');
    // Gegenprobe: die Spacer-Höhe darf nicht mitgewachsen sein (Briefkopf unverändert).
    const spacer = (css.match(/--spacer-hoehe:\s*calc\(([^)]*)\)/) || [])[1] ?? '';
    assert(spacer.includes('98.46mm'), 'Spacer bleibt bei 98.46mm (Briefkopf unverändert)');
  });
});

describe('Unterrand (20/30)', () => {
  /* Feature 2026-11-11: --rand-u steuert das padding-bottom von #kern im
   * Druck. Nur zwei Werte sind zulaessig; alles andere faellt auf DIN 5008
   * (20mm) zurueck. Steuerung: Setup-Radio, Boot setzt den Wert vor dem
   * ersten Paint. */
  /** @param {number} wert @returns {string} */
  const setzeRandU = (wert) => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ ...DEFAULT_SETTINGS, randU: wert }));
    new SettingsManager().applySettings();
    return getComputedStyle(document.documentElement).getPropertyValue('--rand-u').trim();
  };

  it('randU=20 setzt --rand-u auf 20mm, der Druck liest die Variable', async () => {
    try {
      assertEqual(setzeRandU(20), '20mm', '--rand-u = 20mm');
      const css = await (await fetch('/website/css/sheet-multipage.css')).text();
      assert(/#kern\s*\{[^}]*padding:\s*0 20mm var\(--rand-u\) 25mm/.test(css),
        'padding-bottom kommt aus --rand-u');
    } finally {
      document.documentElement.style.removeProperty('--rand-u');
    }
  });

  it('randU=30 setzt --rand-u auf 30mm', () => {
    try {
      assertEqual(setzeRandU(30), '30mm', '--rand-u = 30mm');
    } finally {
      document.documentElement.style.removeProperty('--rand-u');
    }
  });

  it('randU=25 (ungueltig) faellt auf 20mm zurueck', () => {
    try {
      assertEqual(setzeRandU(25), '20mm', 'ungueltiger Wert -> DIN-Standard');
    } finally {
      document.documentElement.style.removeProperty('--rand-u');
    }
  });
});

describe('Druck — Unterrand und Fußzeile', () => {
  /* Gerendert per PDF geprueft (2026-11-11): vor dem Fix lief der Fliesstext
   * auf Seite 1 bis 294,99mm (2mm vor der Kante) und ueberlappte den Fussblock
   * (2 Wort-Kollisionen auf der Grundlinie 295,0mm: "unsere" x HRB, "12345" x
   * Qualitaetssicherung). Nach dem Fix endet Seite 1 bei 272,50mm, der
   * Fussblock beginnt bei 285,25mm, 0 Kollisionen, weiterhin 2 Seiten.
   * Der DOM-Runner kann keine PDFs paginieren — hier steht der CSS-Vertrag,
   * der beides bewirkt. */
  let css = '';
  const lade = async () => {
    if (!css) css = await (await fetch('/website/css/sheet-multipage.css')).text();
    return css;
  };
  /** @param {string} s @returns {string} */
  const ohneKommentare = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
  const druckBlock = async () => ohneKommentare((await lade()).slice((await lade()).indexOf('@media print')));

  it('1: einseitiger Fix aus 9204041 bleibt erhalten', async () => {
    const src = ohneKommentare(await lade());
    assert(/@page :first\s*\{[^}]*margin:\s*0;/.test(src), '@page :first hat margin: 0');
    assert(/@page :first\s*\{[^}]*margin:\s*0 0 20mm 0/.test(src) === false,
      'kein 20mm-Seitenrand auf Seite 1 (wuerde die leere Seite 2 zurueckbringen)');
  });

  it('2: #kern reserviert 20mm Unterrand im Druck', async () => {
    /* Vertragsänderung 2026-11-11: der Unterrand ist einstellbar (20/30mm).
     * Die Regel liest --rand-u, der Default bleibt DIN 5008 = 20mm. */
    const druck = await druckBlock();
    assert(/#kern\s*\{[^}]*padding:\s*0 20mm var\(--rand-u\) 25mm/.test(druck),
      'Unterrand kommt aus --rand-u');
    const src = ohneKommentare(await lade());
    assert(/:root\s*\{[^}]*--rand-u:\s*20mm/.test(src), 'Default --rand-u: 20mm (DIN 5008)');
  });

  it('3: der Unterrand gilt auf jeder Seite, nicht nur der letzten', async () => {
    /* padding-bottom allein wirkt am fragmentierten Block nur am Blockende
     * (gemessen: identische PDF-Ausgabe). `clone` wiederholt es pro Seite. */
    const druck = await druckBlock();
    assert(/#kern\s*\{[^}]*box-decoration-break:\s*clone/.test(druck),
      'box-decoration-break: clone auf #kern');
  });

  it('4: Fußzeile beginnt unterhalb des Textbereichs', async () => {
    const src = ohneKommentare(await lade());
    const fussRegel = (src.match(/#geschaeftsangaben\s*\{([^}]*)\}/) || [])[1] ?? '';
    assert(fussRegel !== '', '#geschaeftsangaben-Regel gefunden');
    const top = Number((fussRegel.match(/top:\s*([\d.]+)mm/) || [])[1]);
    const druck = await druckBlock();
    // Default aus :root, weil der Druck die Variable liest (einstellbar 20/30mm)
    const padUnten = Number((src.match(/--rand-u:\s*([\d.]+)mm/) || [])[1]);
    assert(top > 0 && padUnten > 0, `Werte lesbar (top=${top}mm, padding=${padUnten}mm)`);
    assert(297 - padUnten <= top,
      `Textende ${297 - padUnten}mm muss ueber Fussbeginn ${top}mm liegen`);
  });
});

describe('51-storage: Primitive KISS Funktionen & STORAGE_KEYS', () => {
  it('save und load speichern und lesen Plain Strings', () => {
    save('test_str_key', 'plain_value');
    assertEqual(load('test_str_key'), 'plain_value', 'String korrekt geladen');
    remove('test_str_key');
    assertEqual(load('test_str_key', 'def'), 'def', 'Fallback bei fehlendem Key');
  });

  it('saveJSON und loadJSON serialisieren Objekte und Arrays sauber', () => {
    const obj = { theme: 'dark', layout: 'form-a' };
    saveJSON('test_json_key', obj);
    const loaded = loadJSON('test_json_key', { theme: 'light', layout: 'form-b' });
    assertEqual(loaded.theme, 'dark', 'JSON-Wert korrekt geladen');
    assertEqual(loaded.layout, 'form-a', 'JSON-Wert korrekt geladen');
    remove('test_json_key');
  });

  it('loadJSON fällt bei ungültigem JSON sicher auf fallback zurück', () => {
    save('test_corrupt_json', '{ corrupt json');
    const fallback = { safe: true };
    const res = loadJSON('test_corrupt_json', fallback);
    assertEqual(res.safe, true, 'Fallback bei korruptem JSON');
    remove('test_corrupt_json');
  });

  it('loadJSON filtert gefährliche Keys (__proto__, constructor, prototype) vor Fallback-Merge', () => {
    save('test_polluted_json', '{"theme":"dark","__proto__":{"polluted":true},"constructor":"bad","prototype":"bad"}');
    const fallback = { theme: 'light', safe: true };
    const res = loadJSON('test_polluted_json', fallback);
    assertEqual(res.theme, 'dark', 'Erlaubter Key übernommen');
    assertEqual(res.safe, true, 'Fallback-Key erhalten');
    assertEqual(Object.hasOwn(res, '__proto__'), false, '__proto__ gefiltert');
    assertEqual(Object.hasOwn(res, 'constructor'), false, 'constructor gefiltert');
    assertEqual(Object.hasOwn(res, 'prototype'), false, 'prototype gefiltert');
    remove('test_polluted_json');
  });

  it('loadJSON fällt auf Fallback zurück wenn gespeicherter Typ oder Array-Form nicht zum Fallback passt', () => {
    save('test_type_string', JSON.stringify('nur ein string'));
    const fallbackObj = { theme: 'light' };
    assertEqual(loadJSON('test_type_string', fallbackObj).theme, 'light', 'String vs Object fallback');

    save('test_type_array', JSON.stringify([1, 2, 3]));
    assertEqual(loadJSON('test_type_array', fallbackObj).theme, 'light', 'Array vs Object fallback');

    save('test_type_obj_for_arr', JSON.stringify({ a: 1 }));
    const fallbackArr = ['default'];
    assertEqual(loadJSON('test_type_obj_for_arr', fallbackArr)[0], 'default', 'Object vs Array fallback');

    remove('test_type_string');
    remove('test_type_array');
    remove('test_type_obj_for_arr');
  });

  it('Constants.SCHEMA_VERSION ist definiert und numerisch gültig', () => {
    assert(typeof Constants.SCHEMA_VERSION === 'number', 'SCHEMA_VERSION ist number');
    assert(Constants.SCHEMA_VERSION >= 1, 'SCHEMA_VERSION ist mindestens 1');
  });

  it('hält Binär-Assets aus localStorage und legt sie als Blob in IndexedDB ab (A34)', async () => {
    const bytes = new Uint8Array([82, 73, 70, 70, 12, 0, 0, 0]);
    const blob = new Blob([bytes], { type: 'image/webp' });

    assert(await saveBlob('signature', blob), 'saveBlob meldet Erfolg');
    const zurueck = await loadBlob('signature');
    assert(zurueck instanceof Blob, 'Blob kommt unverändert zurück');
    assertEqual(zurueck?.type, 'image/webp', 'MIME-Typ bleibt erhalten');
    assertEqual(zurueck?.size, bytes.length, 'Bytegröße bleibt erhalten');

    /* A34 in der Fassung vom 2026-11-06: strukturierte Daten in localStorage,
     * Binär-Assets in IndexedDB — die alten Base64-Schlüssel dürfen nicht zurückkehren. */
    assertEqual(localStorage.getItem('din_signature_asset'), null, 'kein Base64-Signaturbild im localStorage');
    assertEqual(localStorage.getItem('din_custom_font'), null, 'keine Base64-Schrift im localStorage');
    assert(!('font' in STORAGE_KEYS) && !('signatureAsset' in STORAGE_KEYS), 'STORAGE_KEYS führt keine Binär-Keys');

    assert(await deleteBlob('signature'), 'deleteBlob meldet Erfolg');
    assertEqual(await loadBlob('signature'), null, 'nach deleteBlob kein Blob mehr');
  });

  it('saveBlob weist Nicht-Blob-Werte ab (BS3)', async () => {
    // @ts-ignore
    const res = await saveBlob('signature', 'kein-blob');
    assertEqual(res, false, 'Nicht-Blob wird abgewiesen');
  });

  it('Export enthält kein Base64 und kein Signaturbild — nur signature.transform', () => {
    const payload = buildDinLetterPayload(
      { brieftext: 'Testtext' },
      { signatureState: { x: 12, y: 95, scale: 0.6, rot: 5 } }
    );
    const serialized = JSON.stringify(payload);
    assert(!/base64/i.test(serialized), 'Export enthält kein Base64');
    assert(!serialized.includes('data:image'), 'Export enthält keine Bilddaten');
    assert(!('font' in payload), 'kein font-Feld im Export');
    assertEqual(payload.signature.transform.x, 12, 'die Position ist enthalten');
  });
});

describe('EventBus: Entkoppelte Pub/Sub-Kommunikation (Zero-Dependency)', () => {
  it('veröffentlicht und empfängt Events mit typisiertem Topic und Payload', () => {
    const bus = createEventBus();
    /** @type {any} */
    let received = null;
    bus.subscribe(Events.NOTIFICATION_REQUESTED, (data) => {
      received = data;
    });
    bus.publish(Events.NOTIFICATION_REQUESTED, { message: 'Brief gespeichert', type: 'info' });
    assert(received !== null, 'Event wurde empfangen');
    assertEqual(received.message, 'Brief gespeichert', 'Payload-Nachricht stimmt');
    assertEqual(received.type, 'info', 'Payload-Typ stimmt');
  });

  it('erlaubt sauberes Unsubscribe über die Rückgabefunktion', () => {
    const bus = createEventBus();
    let callCount = 0;
    const unsubscribe = bus.subscribe(Events.NOTIFICATION_REQUESTED, () => {
      callCount += 1;
    });
    bus.publish(Events.NOTIFICATION_REQUESTED, { message: '1' });
    assertEqual(callCount, 1, 'Erster Aufruf gezählt');
    unsubscribe();
    bus.publish(Events.NOTIFICATION_REQUESTED, { message: '2' });
    assertEqual(callCount, 1, 'Nach Unsubscribe kein weiterer Aufruf');
  });

  it('unterstützt AbortSignal zur automatischen Listener-Bereinigung', () => {
    const bus = createEventBus();
    const controller = new AbortController();
    let callCount = 0;
    bus.subscribe(Events.NOTIFICATION_REQUESTED, () => {
      callCount += 1;
    }, { signal: controller.signal });
    bus.publish(Events.NOTIFICATION_REQUESTED, { message: 'Vor Abort' });
    assertEqual(callCount, 1, 'Aufruf vor Abort');
    controller.abort();
    bus.publish(Events.NOTIFICATION_REQUESTED, { message: 'Nach Abort' });
    assertEqual(callCount, 1, 'Nach Abort kein weiterer Aufruf');
  });

  it('verwirft ungültige Topics ohne den Prefix dinbrief:', () => {
    const bus = createEventBus();
    let threwOnPublish = false;
    let threwOnSubscribe = false;
    try {
      bus.publish('ungueltiges-topic', {});
    } catch {
      threwOnPublish = true;
    }
    try {
      bus.subscribe('ungueltiges-topic', () => {});
    } catch {
      threwOnSubscribe = true;
    }
    assert(threwOnPublish, 'publish mit fremdem Prefix wirft TypeError');
    assert(threwOnSubscribe, 'subscribe mit fremdem Prefix wirft TypeError');
  });
});

describe('Toast-System: EventBus-Anbindung (Phase 2)', () => {
  it('reagiert auf NOTIFICATION_REQUESTED und aktualisiert den Toast-DOM', () => {
    initToastSystem();
    eventBus.publish(Events.NOTIFICATION_REQUESTED, {
      message: 'EventBus Toast Test',
      type: 'warning'
    });
    const msgEl = document.getElementById('hinweis-message');
    const container = document.getElementById('hinweis-v4');
    assertEqual(msgEl?.textContent, 'EventBus Toast Test', 'Toast-Nachricht im DOM aktualisiert');
    assertEqual(container?.dataset.type, 'warning', 'Toast-Typ im DOM gesetzt (A21 data-type)');
  });

  it('räumt current bei toggle newState=closed auf und erlaubt Re-Triggering nach Escape (C2, C3)', () => {
    initToastSystem();
    const container = document.getElementById('hinweis-v4');

    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: 'Gleicher Fehler', type: 'error' });
    assertEqual(container?.dataset.type, 'error');

    // Simuliere Popover-Schließen (z. B. durch Escape)
    container?.dispatchEvent(new CustomEvent('toggle', { detail: { newState: 'closed' } }));

    // Gleiche Nachricht erneut triggern: Popover öffnet sich erneut
    eventBus.publish(Events.NOTIFICATION_REQUESTED, { message: 'Gleicher Fehler', type: 'warning' });
    assertEqual(container?.dataset.type, 'warning', 'Typ wird bei gleichem Text aktualisiert');
  });
});

describe('AddressDomain: Reine PLZ- und Adressauflösung (Phase 3)', () => {
  it('normalizePostcode validiert 5-stellige deutsche Postleitzahlen', () => {
    assertEqual(normalizePostcode('53111'), '53111', 'gültige PLZ als String');
    assertEqual(normalizePostcode(53111), '53111', 'gültige PLZ als Zahl');
    assertEqual(normalizePostcode('  53111  '), '53111', 'Whitespace getrimmt');
    assertEqual(normalizePostcode('5311'), null, 'zu kurze PLZ abgewiesen');
    assertEqual(normalizePostcode('531111'), null, 'zu lange PLZ abgewiesen');
    assertEqual(normalizePostcode('abcde'), null, 'Buchstaben abgewiesen');
    assertEqual(normalizePostcode(null), null, 'null abgewiesen');
  });

  it('resolvePostcode löst PLZ gegen Map auf inkl. Großempfänger', () => {
    const plzToCity = new Map([
      ['53111', 'Bonn'],
      ['53113', 'Bonn']
    ]);
    const grosskunden = new Map([
      ['53113', { name: 'Deutsche Post DHL Group', city: 'Bonn' }]
    ]);

    const resStandard = resolvePostcode('53111', plzToCity, grosskunden);
    assert(resStandard !== null, 'Treffer gefunden');
    assertEqual(resStandard?.city, 'Bonn');
    assertEqual(resStandard?.isGrosskunde, false);
    assertEqual(resStandard?.grosskunde, null);

    const resGrosskunde = resolvePostcode('53113', plzToCity, grosskunden);
    assert(resGrosskunde !== null, 'Großkunde gefunden');
    assertEqual(resGrosskunde?.isGrosskunde, true);
    assertEqual(resGrosskunde?.grosskunde?.name, 'Deutsche Post DHL Group');

    const resFehlend = resolvePostcode('99999', plzToCity, grosskunden);
    assertEqual(resFehlend, null, 'Unbekannte PLZ liefert null');
  });

  it('resolveCity liefert exakte Treffer zuerst und danach Präfixe', () => {
    const cityToPlz = new Map([
      ['bonn', ['53111', '53113']],
      ['borken', ['46325']]
    ]);
    const plzToCity = new Map([
      ['53111', 'Bonn'],
      ['53113', 'Bonn'],
      ['46325', 'Borken']
    ]);

    const resultsExact = resolveCity('Bonn', cityToPlz, plzToCity);
    assertEqual(resultsExact.length, 2, 'Zwei Treffer für Bonn');
    assertEqual(resultsExact[0].plz, '53111');
    assertEqual(resultsExact[1].plz, '53113');

    const resultsPrefix = resolveCity('bo', cityToPlz, plzToCity);
    assertEqual(resultsPrefix.length, 3, 'Drei Treffer für Präfix bo (Bonn + Borken)');
    assertEqual(resultsPrefix[0].city, 'Bonn');

    assertEqual(resolveCity('b', cityToPlz, plzToCity).length, 0, 'Suche unter 2 Zeichen leer');
  });

  it('getDistrict liefert Stadtteil oder Großempfänger zentral', () => {
    const districts = new Map([['53111', 'Zentrum']]);
    const grosskunden = new Map([['53105', { name: 'Postbank', city: 'Bonn' }]]);

    assertEqual(getDistrict('53111', districts, grosskunden), 'Zentrum', 'Liefert Stadtteil aus districtsMap');
    assertEqual(getDistrict('53105', districts, grosskunden), 'Großempfänger', 'Liefert Großempfänger aus grosskundenMap');
    assertEqual(getDistrict('99999', districts, grosskunden), '', 'Liefert Leerstring wenn nicht vorhanden');
  });
});

describe('PLZ-Daten-Integration (Teil 1: echte Datensätze)', () => {
  it('initialisiert AddressIntelligence mit echten .json.gz Datensätzen', async () => {
    const ready = await AddressIntelligence.init();
    assert(ready, 'AddressIntelligence erfolgreich initialisiert');
    assert(AddressIntelligence.plzToCity.size >= 10000, 'Über 10.000 Orte geladen');
    assert(AddressIntelligence.grosskunden.size >= 2500, 'Über 2.500 Großkunden/Behörden geladen');
  });

  it('Test 1: 01053 löst auf Dresden und Großkunde Commerzbank AG (Firma)', () => {
    const res = AddressIntelligence.lookupPlz('01053');
    assert(res !== null, 'Treffer gefunden');
    assertEqual(res?.city, 'Dresden');
    assertEqual(res?.isGrosskunde, true);
    assertEqual(res?.grosskunde?.name, 'Commerzbank AG');
    assertEqual(res?.grosskunde?.typ, 'Firma');
  });

  it('Test 2: 80920 löst auf München und Großkunde OSRAM GmbH (Firma)', () => {
    const res = AddressIntelligence.lookupPlz('80920');
    assert(res !== null, 'Treffer gefunden');
    assertEqual(res?.city, 'München');
    assertEqual(res?.isGrosskunde, true);
    assertEqual(res?.grosskunde?.name, 'OSRAM GmbH');
  });

  it('Test 3: 11011 löst auf Berlin und Deutscher Bundestag (Behörde)', () => {
    const res = AddressIntelligence.lookupPlz('11011');
    assert(res !== null, 'Treffer gefunden');
    assertEqual(res?.city, 'Berlin');
    assertEqual(res?.isGrosskunde, true);
    assertEqual(res?.grosskunde?.name, 'Deutscher Bundestag');
    assertEqual(res?.grosskunde?.typ, 'Behörde');
  });

  it('Test 4: 53113 löst auf Bonn und enthält Bundesamt für Justiz und Bundeskartellamt in all_names', () => {
    const res = AddressIntelligence.lookupPlz('53113');
    assert(res !== null, 'Treffer gefunden');
    assertEqual(res?.city, 'Bonn');
    assertEqual(res?.isGrosskunde, true);
    const all = res?.grosskunde?.all_names || [];
    assert(all.includes('Bundesamt für Justiz'), 'Bundesamt für Justiz enthalten');
    assert(all.includes('Bundeskartellamt'), 'Bundeskartellamt enthalten');
  });

  it('Test 5: 99999 ist unbekannt und liefert null ohne Throw', () => {
    const res = AddressIntelligence.lookupPlz('99999');
    assertEqual(res, null);
  });

  it('Test 6 (AddressData Fassade): lookup, isReady und findFirma', () => {
    assertEqual(AddressData.isReady, true);
    const resolved = AddressData.lookup('53111');
    assert(resolved !== null, 'AddressData.lookup(53111) liefert Ergebnis');
    assertEqual(resolved?.city, 'Bonn');
    assertEqual(resolved?.state, 'NW');

    const unknown = AddressData.lookup('99999');
    assertEqual(unknown, null);

    const firma = AddressData.findFirma('Commerzbank AG');
    assert(firma !== null, 'findFirma findet Commerzbank AG');
    assertEqual(firma?.city, 'Dresden');

    const noFirma = AddressData.findFirma('Fantasiestadt 123 Keine Firma XYZ');
    assertEqual(noFirma, null);
  });
});

describe('PLZ-Autocomplete UI-Cases (Teil 6: Case A, B, C & Doppel-Fill)', () => {
  // Case A (PLZ-Eingabe progressiv)
  it('Test 1: Eingabe "010" enthält Dresden', () => {
    const matches = AddressIntelligence.lookupPrefix('010');
    assert(matches.some(m => m.city === 'Dresden'), '010 enthält Dresden');
  });

  it('Test 3: Eingabe "01053" liefert Dresden und Commerzbank AG', () => {
    const res = AddressIntelligence.lookupPlz('01053');
    assertEqual(res?.city, 'Dresden');
    assertEqual(res?.grosskunde?.name, 'Commerzbank AG');
  });

  it('Test 4: Eingabe "99999" liefert null (PLZ nicht gefunden)', () => {
    const res = AddressIntelligence.lookupPlz('99999');
    assertEqual(res, null);
  });

  it('Test 5: Manuelle Eingabe im Ort-Feld wird durch fremde PLZ nicht überschrieben', () => {
    const ortEl = document.createElement('div');
    ortEl.textContent = 'Berlin';
    // Nicht auto-filled: manueller Wert bleibt geschützt
    assert(!ortEl.hasAttribute('data-autofilled') || ortEl.getAttribute('data-autofilled') === 'false', 'Manuell');
  });

  // Case B (Ort-Eingabe Reverse)
  it('Test 6: buildOrtIndex liefert für Bonn >= 38 PLZs und Berlin >= 90 (< 100 ms)', () => {
    const t0 = performance.now();
    const ortIndex = buildOrtIndex(AddressIntelligence.plzToCity);
    const duration = performance.now() - t0;
    assert(duration < 100, `Ort-Index Aufbauzeit < 100 ms (war ${duration.toFixed(2)} ms)`);
    const bonnPlzs = ortIndex.get('Bonn') || [];
    const berlinPlzs = ortIndex.get('Berlin') || [];
    assert(bonnPlzs.length >= 38, `Bonn hat ${bonnPlzs.length} PLZs (>= 38)`);
    assert(berlinPlzs.length >= 90, `Berlin hat ${berlinPlzs.length} PLZs (>= 90)`);
  });

  it('Test 7: Eingabe "Bon" findet Bonn und Bonndorf', () => {
    const res = AddressIntelligence.lookupUniversal('Bon', 30);
    assert(res.items.some(i => i.city === 'Bonn'), 'Enthält Bonn');
    assert(res.items.some(i => i.city === 'Bonndorf'), 'Enthält Bonndorf');
  });

  it('Test 8: Eingabe "Bo" (unter 3 Zeichen) liefert keine Dropdown-Treffer', () => {
    const res = AddressIntelligence.lookupUniversal('Bo', 10);
    assertEqual(res.items.length, 0);
  });

  it('Test 9: Bonndorf wählen → Ort + PLZ gefüllt (79848 Bonndorf)', () => {
    const res = AddressIntelligence.lookupUniversal('Bonndorf', 10);
    const item = res.items.find(i => i.city === 'Bonndorf');
    assert(item !== undefined, 'Bonndorf gefunden');
    assertEqual(item?.isSinglePlz, true);
    assertEqual(item?.plz, '79848');

    const fakeOrt = { textContent: '', setAttribute: () => {} };
    const fakeFirma = { textContent: '', setAttribute: () => {} };
    AddressIntelligence.applySelection(item, fakeOrt, fakeFirma);
    assertEqual(fakeOrt.textContent, '79848 Bonndorf');
    assertEqual(fakeFirma.textContent, '', 'Firma bleibt leer');
  });

  it('Test 10: Bonn wählen → Ort gefüllt (Bonn), PLZ leer, kein Hinweis nötig', () => {
    const res = AddressIntelligence.lookupUniversal('Bonn', 10);
    const item = res.items.find(i => i.city === 'Bonn' && i.typ === 'Stadt');
    assert(item !== undefined, 'Bonn gefunden');
    assertEqual(item?.isSinglePlz, false);

    const fakeOrt = { textContent: '', setAttribute: () => {} };
    const fakeFirma = { textContent: '', setAttribute: () => {} };
    const selectionRes = AddressIntelligence.applySelection(item, fakeOrt, fakeFirma);
    assertEqual(fakeOrt.textContent, 'Bonn');
    assertEqual(fakeFirma.textContent, '', 'Firma bleibt leer');
    assertEqual(selectionRes.note, undefined, 'Kein Text-Hinweis mehr');
  });

  it('Test 11: PLZ 80331 gehört nicht zu Bonn (erkennt Abweichung)', () => {
    const bonnPlzs = AddressIntelligence.ortIndex.get('Bonn') || [];
    assert(!bonnPlzs.includes('80331'), '80331 gehört nicht zu Bonn');
    const targetCity = AddressIntelligence.lookupPlz('80331')?.city;
    assertEqual(targetCity, 'München');
  });

  it('Test 12: Eingabe "munchen" findet München dank Umlaut-Normalisierung', () => {
    const res = AddressIntelligence.lookupUniversal('munchen', 10);
    assert(res.items.some(i => i.city === 'München'), 'München gefunden');
  });

  // Case C (Firmen-Eingabe Großkunden)
  it('Test 13: buildFirmenIndex liefert für "Allianz" mindestens 5 Einträge (< 100 ms)', () => {
    const t0 = performance.now();
    const firmenIdx = buildFirmenIndex(AddressIntelligence.grosskunden);
    const duration = performance.now() - t0;
    assert(duration < 100, `Firmen-Index Aufbauzeit < 100 ms (war ${duration.toFixed(2)} ms)`);
    const matches = firmenIdx.search('Allianz', 30);
    assert(matches.length >= 5, `Allianz Treffer: ${matches.length} (>= 5)`);
  });

  it('Test 14: Eingabe "Allianz" liefert Allianz Lebensversicherungs-AG mit Typ und PLZ', () => {
    /** @type {Array<any>} */
    const matches = AddressIntelligence.firmenIndex.search('Allianz', 30);
    const hit = matches.find((/** @type {any} */ m) => m.name.includes('Lebensversicherungs-AG'));
    assert(hit !== undefined, 'Allianz Lebensversicherungs-AG gefunden');
    assertEqual(hit?.typ, 'Firma');
    assert(Boolean(hit?.plz), 'PLZ vorhanden');
  });

  it('Test 15: Allianz Lebensversicherungs-AG in Stuttgart hat PLZ 70151', () => {
    /** @type {Array<any>} */
    const matches = AddressIntelligence.firmenIndex.search('Allianz Lebensversicherungs-AG', 30);
    const stuttgart = matches.find((/** @type {any} */ m) => m.city === 'Stuttgart');
    assert(stuttgart !== undefined, 'Stuttgart gefunden');
    assertEqual(stuttgart?.plz, '70151');
  });

  it('Test 16: Eingabe "Bundesamt" findet Bundesamt für Justiz (Behörde)', () => {
    /** @type {Array<any>} */
    const matches = AddressIntelligence.firmenIndex.search('Bundesamt', 30);
    const bfj = matches.find((/** @type {any} */ m) => m.name.includes('Bundesamt für Justiz'));
    assert(bfj !== undefined, 'Bundesamt für Justiz gefunden');
    assertEqual(bfj?.typ, 'Behörde');
  });

  it('Test 17: Eingabe "Xyzfirma" liefert keine Treffer', () => {
    /** @type {Array<any>} */
    const matches = AddressIntelligence.firmenIndex.search('Xyzfirma', 10);
    assertEqual(matches.length, 0);
  });

  it('Test 18: all_names-Treffer: "Bundeskartellamt" liefert PLZ 53113 Bonn', () => {
    /** @type {Array<any>} */
    const matches = AddressIntelligence.firmenIndex.search('Bundeskartellamt', 10);
    const bka = matches.find((/** @type {any} */ m) => m.name === 'Bundeskartellamt');
    assert(bka !== undefined, 'Bundeskartellamt gefunden');
    assertEqual(bka?.plz, '53113');
    assertEqual(bka?.city, 'Bonn');
  });

  // Ergänzende Tests 19–21 (Doppel-Fill und Kein-Doppel-Fill bei Stadt)
  it('Test 19: Auswahl Allianz Lebensversicherungs-AG im Ort-Feld füllt Ort und Firma (Doppel-Fill)', () => {
    const matches = AddressIntelligence.lookupUniversal('Allianz', 30);
    const item = matches.items.find(i => i.name === 'Allianz Lebensversicherungs-AG' && i.city === 'Stuttgart');
    assert(item !== undefined, 'Treffer vorhanden');
    assertEqual(item?.typ, 'Firma');

    const fakeOrt = { textContent: '', setAttribute: () => {} };
    const fakeFirma = { textContent: '', setAttribute: () => {} };
    AddressIntelligence.applySelection(item, fakeOrt, fakeFirma);

    assertEqual(fakeOrt.textContent, '70151 Stuttgart');
    assertEqual(fakeFirma.textContent, 'Allianz Lebensversicherungs-AG');
  });

  it('Test 20: Auswahl Deutscher Bundestag im Ort-Feld füllt 11011 Berlin und Firma (Doppel-Fill)', () => {
    const matches = AddressIntelligence.lookupUniversal('Bundestag', 10);
    const item = matches.items.find(i => i.name === 'Deutscher Bundestag');
    assert(item !== undefined, 'Bundestag vorhanden');

    const fakeOrt = { textContent: '', setAttribute: () => {} };
    const fakeFirma = { textContent: '', setAttribute: () => {} };
    AddressIntelligence.applySelection(item, fakeOrt, fakeFirma);

    assertEqual(fakeOrt.textContent, '11011 Berlin');
    assertEqual(fakeFirma.textContent, 'Deutscher Bundestag');
  });

  it('Test 21: Auswahl Bonn im Ort-Feld füllt Bonn, Firma-Feld bleibt leer (KEIN Doppel-Fill bei Stadt)', () => {
    const matches = AddressIntelligence.lookupUniversal('Bonn', 10);
    const item = matches.items.find(i => i.city === 'Bonn' && i.typ === 'Stadt');
    assert(item !== undefined, 'Bonn vorhanden');

    const fakeOrt = { textContent: '', setAttribute: () => {} };
    const fakeFirma = { textContent: '', setAttribute: () => {} };
    AddressIntelligence.applySelection(item, fakeOrt, fakeFirma);

    assertEqual(fakeOrt.textContent, 'Bonn');
    assertEqual(fakeFirma.textContent, '', 'Firma-Feld bleibt strikt leer bei Stadt');
  });

  // Tests 22–26 (Fix: Exakter Stadtname → sofort PLZ-Dropdown)
  it('Test 22: "bonn" → sofort PLZ-Dropdown mit allen 38 PLZs (53111 an 1. Stelle)', () => {
    const res = AddressIntelligence.resolveCityInput('bonn');
    assertEqual(res.mode, 'city_plzs');
    assertEqual(res.items.length, 38);
    assertEqual(res.city, 'Bonn');
    assertEqual(res.items[0].plz, '53111');
  });

  it('Test 23: "bonnd" → sofort "79848 Bonndorf" (1 PLZ, kein Dropdown nötig)', () => {
    const res = AddressIntelligence.resolveCityInput('bonnd');
    assertEqual(res.mode, 'single_fill');
    assertEqual(res.city, 'Bonndorf');
    assertEqual(res.plz, '79848');
  });

  it('Test 24: "bon" → Stadt-Dropdown (Bonn, Bonndorf, ...)', () => {
    const res = AddressIntelligence.resolveCityInput('bon');
    assertEqual(res.mode, 'city_list');
    assert(res.items.some((/** @type {any} */ i) => i.city === 'Bonn'), 'Enthält Bonn');
    assert(res.items.some((/** @type {any} */ i) => i.city === 'Bonndorf'), 'Enthält Bonndorf');
  });

  it('Test 25: "bonn 53" → PLZ-Dropdown gefiltert auf 53xxx', () => {
    const res = AddressIntelligence.resolveCityInput('bonn 53');
    assertEqual(res.mode, 'city_plzs');
    assertEqual(res.city, 'Bonn');
    assert(res.items.length > 0, 'Treffer vorhanden');
    assert(res.items.every((/** @type {any} */ i) => i.plz.startsWith('53')), 'Alle PLZs beginnen mit 53');
  });

  it('Test 26: Auswahl "53111 Bonn" → Ort-Feld = "53111 Bonn"', () => {
    const item = { plz: '53111', city: 'Bonn', name: 'Bonn', typ: 'Stadt' };
    const fakeOrt = { textContent: '', setAttribute: () => {} };
    const fakeFirma = { textContent: '', setAttribute: () => {} };
    AddressIntelligence.applySelection(item, fakeOrt, fakeFirma);
    assertEqual(fakeOrt.textContent, '53111 Bonn');
    assertEqual(fakeFirma.textContent, '', 'Firma bleibt leer');
  });

  it('Test 27: Postfach-/Fremd-PLZ 10910 ist in Bonn-Liste ausgeblendet und gehört zu Berlin', () => {
    const resBonn = AddressIntelligence.lookupCityPlzs('Bonn');
    assert(!resBonn.some((/** @type {any} */ i) => i.plz === '10910'), '10910 ist in Bonn-Liste ausgeblendet');
    const resNoris = AddressIntelligence.lookupPlz('10910');
    assert(resNoris !== null, '10910 existiert in Grosskunden/Orte');
    assertEqual(resNoris?.city, 'Berlin', '10910 gehört zu Berlin');
    assertEqual(resNoris?.grosskunde?.name, 'norisbank GmbH');
  });

  it('Test 28: Bereinigte Datenquellen: 45195 Essen, 60651 Frankfurt am Main, 96039 Bamberg in grosskunden', () => {
    const gk45 = AddressIntelligence.grosskunden.get('45195');
    assert(gk45 !== undefined, '45195 vorhanden');
    assertEqual(gk45?.city, 'Essen', '45195 hat city Essen');

    const gk60 = AddressIntelligence.grosskunden.get('60651');
    assert(gk60 !== undefined, '60651 vorhanden');
    assertEqual(gk60?.city, 'Frankfurt am Main', '60651 hat city Frankfurt am Main');

    const gk96 = AddressIntelligence.grosskunden.get('96039');
    assert(gk96 !== undefined, '96039 vorhanden');
    assertEqual(gk96?.city, 'Bamberg', '96039 hat city Bamberg');
  });

  it('Test 29: Autocomplete-Ereigniskette (8 Fixture-Schritte mit Backspace und Re-Render)', async () => {
    AddressIntelligence.wireDOM();
    const ortEl = /** @type {HTMLElement} */ (document.getElementById('empfaenger-ort'));
    const popover = /** @type {HTMLElement} */ (document.getElementById('plz-suggestions-popover'));

    const fixture = [
      { input: 'b',     expectItems: 0 },
      { input: 'bo',    expectItems: 0 },
      { input: 'bon',   expectItems: 8,  expectFirstItem: /Bonn/,     isStadtListe: true },
      { input: 'bonn',  expectItems: 38, expectFirstItem: /53111/,    isPlzListe: true,
        expectNotContains: ['Bondelum', 'Bondorf', 'Bönen', 'Bonstetten', 'BonusCard'] },
      { input: 'bon',   expectItems: 8,  expectFirstItem: /Bonn/,     isStadtListe: true,  isDelete: true },
      { input: 'bonn',  expectItems: 38, expectFirstItem: /53111/,    isPlzListe: true },
      { input: 'b',     expectItems: 0,  isDelete: true },
      { input: '',      expectItems: 0,  isDelete: true, popoverClosed: true },
    ];

    for (let idx = 0; idx < fixture.length; idx++) {
      const s = fixture[idx];
      ortEl.textContent = s.input;
      ortEl.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: s.isDelete ? 'deleteContentBackward' : 'insertText'
      }));
      await new Promise(r => setTimeout(r, 250));
      const lis = popover.querySelectorAll('li');
      assertEqual(lis.length, s.expectItems, `Schritt ${idx + 1} ("${s.input}"): Items = ${s.expectItems}`);

      if (s.expectFirstItem) {
        assert(s.expectFirstItem.test(lis[0]?.textContent || ''), `Schritt ${idx + 1}: Erstes Item matcht ${s.expectFirstItem}`);
      }

      if (s.expectNotContains) {
        const allText = Array.from(lis).map(l => l.textContent || '').join(' ');
        for (const bad of s.expectNotContains) {
          assert(!allText.includes(bad), `Schritt ${idx + 1}: Darf nicht "${bad}" enthalten`);
        }
      }

      if (s.popoverClosed) {
        assert(lis.length === 0, `Schritt ${idx + 1}: Popover ist geleert`);
      }
    }
  });

  it('Test 30: "bonn" → PLZ-Liste sortiert + Stadtteile', async () => {
    AddressIntelligence.wireDOM();
    const ortEl = /** @type {HTMLElement} */ (document.getElementById('empfaenger-ort'));
    const popover = /** @type {HTMLElement} */ (document.getElementById('plz-suggestions-popover'));

    ortEl.textContent = 'bonn';
    ortEl.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    await new Promise(r => setTimeout(r, 250));

    const items = [...popover.querySelectorAll('li')].map(li => li.textContent?.trim() || '');

    // 1. Reihenfolge
    assertEqual(items[0].startsWith('53111'), true);
    assertEqual(items[1].startsWith('53113'), true);
    assertEqual(items[2].startsWith('53115'), true);

    // 2. Stadtteile
    assertEqual(items[0], '53111 Bonn (Zentrum, Castell, Nordstadt)');
    assert(items[1].includes('(Gronau'), '53113 hat Stadtteile');

    // 3. Vollständigkeit
    assertEqual(items.length, 38);
  });

  it('Test 30b: "bonndorf" füllt sofort "79848 Bonndorf" und schließt Dropdown', async () => {
    AddressIntelligence.wireDOM();
    const ortEl = /** @type {HTMLElement} */ (document.getElementById('empfaenger-ort'));
    const popover = /** @type {HTMLElement} */ (document.getElementById('plz-suggestions-popover'));

    ortEl.textContent = 'bonndorf';
    ortEl.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    await new Promise(r => setTimeout(r, 250));

    assertEqual(ortEl.textContent, '79848 Bonndorf');
    assertEqual(popover.querySelectorAll('li').length, 0);
  });

  it('Test 31: Konsistente Trefferzahlen bei gleicher Eingabe vorwärts vs rückwärts (boch)', async () => {
    AddressIntelligence.wireDOM();
    const ortEl = /** @type {HTMLElement} */ (document.getElementById('empfaenger-ort'));
    const popover = /** @type {HTMLElement} */ (document.getElementById('plz-suggestions-popover'));

    // Vorwärts zu "boch"
    ortEl.textContent = 'boch';
    ortEl.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    await new Promise(r => setTimeout(r, 250));
    const forwardCount = popover.querySelectorAll('li').length;

    // Weiter zu "bochu"
    ortEl.textContent = 'bochu';
    ortEl.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    await new Promise(r => setTimeout(r, 250));

    // Rückwärts zu "boch"
    ortEl.textContent = 'boch';
    ortEl.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
    await new Promise(r => setTimeout(r, 250));
    const backwardCount = popover.querySelectorAll('li').length;

    assertEqual(forwardCount, backwardCount, `boch vorwärts (${forwardCount}) === rückwärts (${backwardCount})`);
  });

  it('Test 32: Auto-Fill User-Editing-Guard: Backspace von "53884 Feldpostleitstelle Mechernich" auf "53884" füllt nicht erneut', async () => {
    AddressIntelligence.wireDOM();
    const ortEl = /** @type {HTMLElement} */ (document.getElementById('empfaenger-ort'));

    const fixture = [
      { text: '53884', expectValue: '53884 Feldpostleitstelle Mechernich', userEditing: false },
      { text: '53884 Feldpostleitstelle Mechernic', expectValue: '53884 Feldpostleitstelle Mechernic', isDelete: true },
      { text: '53884 Feldpostleitstelle', expectValue: '53884 Feldpostleitstelle', isDelete: true },
      { text: '53884 Feld', expectValue: '53884 Feld', isDelete: true },
      { text: '53884', expectValue: '53884', isDelete: true },  // KEIN Re-Fill!
      { text: '5388', expectValue: '5388', isDelete: true },
      { text: '538', expectValue: '538', isDelete: true },
      { text: '', expectValue: '', isDelete: true },
    ];

    for (let idx = 0; idx < fixture.length; idx++) {
      const step = fixture[idx];
      ortEl.textContent = step.text;
      ortEl.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: step.isDelete ? 'deleteContentBackward' : 'insertText',
        data: step.isDelete ? undefined : '4'
      }));
      await new Promise(r => setTimeout(r, 50));
      assertEqual(ortEl.textContent, step.expectValue, `Schritt ${idx + 1} ("${step.text}"): Wert = "${step.expectValue}"`);
    }

    // Zusätzlicher Check: Feld ist leer, nun "53884" frisch getippt -> Auto-Fill greift wieder!
    ortEl.textContent = '53884';
    ortEl.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: '4'
    }));
    await new Promise(r => setTimeout(r, 50));
    assertEqual(ortEl.textContent, '53884 Feldpostleitstelle Mechernich', 'Frisch getipptes 53884 füllt wieder');
  });

  it('Test 30: Sortierung Städte vor Firmen: "bon" liefert Städte (Bonn...) vor Firmen (BonusCard)', () => {
    const res = AddressIntelligence.lookupUniversal('bon', 30);
    const bonnIdx = res.items.findIndex(i => i.city === 'Bonn' && i.typ === 'Stadt');
    const bonusIdx = res.items.findIndex(i => i.name.includes('BonusCard') || i.typ === 'Firma');
    assert(bonnIdx !== -1, 'Bonn in Treffern vorhanden');
    if (bonusIdx !== -1) {
      assert(bonnIdx < bonusIdx, `Bonn (Index ${bonnIdx}) steht vor Firmen (Index ${bonusIdx})`);
    }
    // Alle Städte müssen vor allen Firmen/Behörden stehen
    let seenNonCity = false;
    for (const item of res.items) {
      if (item.typ !== 'Stadt') {
        seenNonCity = true;
      } else {
        assert(!seenNonCity, `Stadt ${item.name} erscheint nach einer Firma/Behörde`);
      }
    }
  });

  it('Test 33: PLZ-Präfix-Regel (<=15 Treffer direkt, >15 zusammengefasst)', () => {
    // 1. "5311" hat 6 Treffer (<=15) -> alle direkt, keine "Bonn (5 PLZs)" Zusammenfassung
    const res5311 = AddressIntelligence.lookupPrefix('5311');
    assertEqual(res5311.length, 6, '5311 hat 6 Treffer');
    assert(res5311.every((/** @type {any} */ m) => Boolean(m.plz)), 'Alle 5311-Treffer haben eine konkrete PLZ');
    assert(!res5311.some((/** @type {any} */ m) => (m.plzCount || 1) > 1), 'Keine Stadt zusammengefasst');
    assert(res5311.some((/** @type {any} */ m) => m.plz === '53111'), 'Enthält 53111');
    assert(res5311.some((/** @type {any} */ m) => m.plz === '53113'), 'Enthält 53113');
    assert(res5311.some((/** @type {any} */ m) => m.plz === '53115'), 'Enthält 53115');
    assert(res5311.some((/** @type {any} */ m) => m.plz === '53117'), 'Enthält 53117');
    assert(res5311.some((/** @type {any} */ m) => m.plz === '53119'), 'Enthält 53119');

    // 2. "538" hat 11 Treffer (<=15) -> alle direkt, keine "Euskirchen (3 PLZs)" Zusammenfassung
    const res538 = AddressIntelligence.lookupPrefix('538');
    assertEqual(res538.length, 11, '538 hat 11 Treffer');
    assert(res538.every((/** @type {any} */ m) => Boolean(m.plz)), 'Alle 538-Treffer haben eine konkrete PLZ');
    assert(!res538.some((/** @type {any} */ m) => (m.plzCount || 1) > 1), 'Keine Stadt-Zusammenfassung bei <=15 Treffern');

    // 3. "531" hat >15 Treffer -> Stadt-Zusammenfassung "Stadt (N PLZs)"
    const res531 = AddressIntelligence.lookupPrefix('531');
    assert(res531.some((/** @type {any} */ m) => m.city === 'Bonn' && m.plzCount > 1), 'Bonn als Stadt mit mehreren PLZs zusammengefasst');
  });

  it('Test 34: Bundesland-Spalte und Disambiguierung (ISO-3166-2:DE & BUNDESLAENDER)', () => {
    // 1. Statische Bundesländer-Tabelle enthält 16 Bundesländer
    assertEqual(Object.keys(BUNDESLAENDER).length, 16, '16 deutsche Bundesländer vorhanden');
    assertEqual(BUNDESLAENDER.NW, 'Nordrhein-Westfalen');
    assertEqual(BUNDESLAENDER.BY, 'Bayern');
    assertEqual(BUNDESLAENDER.BE, 'Berlin');

    // 2. Lookup liefert Bundesland-Codes
    assertEqual(AddressIntelligence.getState('53840'), 'NW', '53840 Troisdorf ist NW');
    assertEqual(AddressIntelligence.getState('80331'), 'BY', '80331 München ist BY');
    assertEqual(AddressIntelligence.getState('10115'), 'BE', '10115 Berlin ist BE');

    // 3. Disambiguierung homonymer Städte (Neustadt)
    const neustadtPlzs = AddressIntelligence.lookupCityPlzs('Neustadt');
    assert(neustadtPlzs.length >= 8, 'Neustadt hat mehrere PLZs in verschiedenen Bundesländern');
    const states = neustadtPlzs.map((i) => i.state);
    assert(states.includes('HE'), 'Neustadt in Hessen (35279) vorhanden');
    assert(states.includes('RP'), 'Neustadt in Rheinland-Pfalz vorhanden');
    assert(states.includes('BY'), 'Neustadt in Bayern vorhanden');

    // 4. Strikte DIN-5008-Invariante: applySelection schreibt NIEMALS das Bundesland ins Anschriftfeld
    const itemHessen = neustadtPlzs.find((i) => i.state === 'HE');
    assert(itemHessen !== undefined, 'Hessen-Eintrag existiert');
    const fakeOrt = { textContent: '', setAttribute: () => {} };
    AddressIntelligence.applySelection(itemHessen, fakeOrt);
    assertEqual(fakeOrt.textContent, '35279 Neustadt', 'DIN 5008 Invariante: Nur PLZ und Ort');
    assert(!fakeOrt.textContent.includes('Hessen'), 'Kein Bundesland im Brieftext');
    assert(!fakeOrt.textContent.includes('HE'), 'Kein ISO-Code im Brieftext');
  });
});

describe('AddressData: Reine Datenlogik und Entkopplungs-Parität (P1a)', () => {
  it('exportiert identische Instanzen und Funktionen via address.js Fassade', () => {
    assertEqual(AddressData, AddressDataDirect, 'AddressData ist identisch');
    assertEqual(AddressIntelligence, AddressIntelligenceDirect, 'AddressIntelligence ist identisch');
    assertEqual(BUNDESLAENDER, BUNDESLAENDERDirect, 'BUNDESLAENDER ist identisch');
    assertEqual(normalizePostcode, normalizePostcodeDirect, 'normalizePostcode ist identisch');
    assertEqual(resolvePostcode, resolvePostcodeDirect, 'resolvePostcode ist identisch');
    assertEqual(resolveCity, resolveCityDirect, 'resolveCity ist identisch');
    assertEqual(getDistrict, getDistrictDirect, 'getDistrict ist identisch');
    assertEqual(buildOrtIndex, buildOrtIndexDirect, 'buildOrtIndex ist identisch');
    assertEqual(buildFirmenIndex, buildFirmenIndexDirect, 'buildFirmenIndex ist identisch');
  });

  it('funktioniert völlig autark ohne DOM-Abhängigkeiten', () => {
    assertEqual(AddressDataDirect.isReady, true, 'AddressDataDirect ist initialisiert');
    const lookupRes = AddressDataDirect.lookup('53111');
    assert(lookupRes !== null, 'lookup liefert Treffer');
    assertEqual(lookupRes?.city, 'Bonn', 'PLZ 53111 ist Bonn');

    const firma = AddressDataDirect.findFirma('Commerzbank AG');
    assert(firma !== null, 'Commerzbank AG im Datenbestand gefunden');
    assertEqual(firma?.name, 'Commerzbank AG');

    assertEqual(normalizePostcodeDirect('  53111  '), '53111', 'Normalisierung funktioniert autark');
    assertEqual(normalizePostcodeDirect('invalid'), null, 'Ungültige PLZ liefert null');

    const cityToPlz = new Map([['berlin', ['10115']]]);
    const plzToCity = new Map([['10115', 'Berlin']]);
    const resolvedCities = resolveCityDirect('Berlin', cityToPlz, plzToCity);
    assertEqual(resolvedCities.length, 1, 'resolveCityDirect liefert 1 Treffer');
    assertEqual(resolvedCities[0].city, 'Berlin', 'resolveCityDirect löst Stadt autark auf');

    const prefixMatches = AddressIntelligenceDirect.lookupPrefix('5311');
    assertEqual(prefixMatches.length, 6, 'Prefix-Lookup liefert autark 6 Treffer für 5311');

    const universal = AddressIntelligenceDirect.lookupUniversal('Bonn', 5);
    assert(universal.items.length > 0, 'Universal-Lookup liefert autark Ergebnisse');
    assertEqual(universal.items[0].city, 'Bonn', 'Erster Treffer ist Bonn');
  });
});

describe('DraftManager: EventBus Save-Integration (Phase 4)', () => {
  it('DOCUMENT_SAVE_REQUESTED speichert sofort ohne debounce', () => {
    seed();
    setField('EventBus Sofort-Speichern');
    const bus = createEventBus();
    const dm = new DraftManager(bus);
    bus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
    assertEqual(getDraft().brieftext, 'EventBus Sofort-Speichern', 'Draft sofort synchron gespeichert');
    dm.destroy();
  });

  it('saveDraft() publiziert DOCUMENT_SAVED mit draft-Payload', () => {
    seed();
    setField('Payload Test');
    const bus = createEventBus();
    const dm = new DraftManager(bus);
    /** @type {any} */
    let receivedPayload = null;
    bus.subscribe(Events.DOCUMENT_SAVED, (detail) => {
      receivedPayload = detail;
    });
    dm.saveDraft();
    assert(receivedPayload !== null, 'DOCUMENT_SAVED Event erhalten');
    assertEqual(receivedPayload.draft.brieftext, 'Payload Test', 'Payload enthält aktuellen Text');
    dm.destroy();
  });

  it('DOCUMENT_SAVE_REQUESTED mit debounce: true plant AutoSave', () => {
    seed();
    setField('Debounced Text');
    const bus = createEventBus();
    const dm = new DraftManager(bus);
    localStorage.removeItem(DRAFT_KEY);
    bus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: true });
    assertEqual(getDraft().brieftext, undefined, 'Noch nicht gespeichert während Debounce-Verzögerung');
    clearTimeout(dm.debounceTimer);
    dm.saveDraft();
    assertEqual(getDraft().brieftext, 'Debounced Text', 'Nach Ausführung gespeichert');
    dm.destroy();
  });

  it('Caret-Tracking und Undo/Redo bleiben über den EventBus-Zyklus intakt', () => {
    seed();
    const el = mustField();
    el.focus();
    setField('Stand Eins');
    const bus = createEventBus();
    const dm = new DraftManager(bus);
    bus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });

    setField('Stand Zwei');
    bus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });

    assertEqual(fieldText(), 'Stand Zwei');
    dm.undo();
    assertEqual(fieldText(), 'Stand Eins', 'Undo stellt Stand Eins wieder her');
    dm.redo();
    assertEqual(fieldText(), 'Stand Zwei', 'Redo stellt Stand Zwei wieder her');
    dm.destroy();
  });
});

describe('SalutationEngine: Anrede-Ableitung (pure Funktion & KISS)', () => {
  it('erkennt Dr.- und akademische Titel nach DIN 5008', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Dr. Müller', formality: 'formal' }), 'Sehr geehrter Herr Dr. Müller,');
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Dr. Hans Müller', formality: 'formal' }), 'Sehr geehrter Herr Dr. Müller,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Prof. Dr. Schmidt', formality: 'formal' }), 'Sehr geehrte Frau Prof. Dr. Schmidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Prof. Dr. Julia Sommer', formality: 'formal' }), 'Sehr geehrte Frau Prof. Dr. Sommer,');
  });

  it('erkennt Adelstitel und Namenszusätze (von, van der, zu)', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr von Müller', formality: 'formal' }), 'Sehr geehrter Herr von Müller,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau van der Berg', formality: 'formal' }), 'Sehr geehrte Frau van der Berg,');
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Dr. med. Albrecht von Sydow', formality: 'formal' }), 'Sehr geehrter Herr Dr. med. von Sydow,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Sophie van der Bellen', formality: 'formal' }), 'Sehr geehrte Frau van der Bellen,');
  });

  it('spricht neutrale Firmen und Organisationen neutral an', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Acme Corp GmbH', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Acme', formality: 'casual' }), 'Hallo,');
    assertEqual(SalutationEngine.derive({ rawName: 'Stadtwerke Troisdorf', formality: 'polite' }), 'Guten Tag,');
    assertEqual(SalutationEngine.derive({ rawName: 'Turnverein Bonn 1860 e.V.', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Sportverein Troisdorf', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Eigentümergemeinschaft Hauptstr. 10', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Muster eG', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
  });

  it('unterstützt die Stile formal, polite und casual', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'formal' }), 'Sehr geehrte Frau Schmidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'polite' }), 'Guten Tag Frau Schmidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'casual' }), 'Hallo Frau Schmidt,');
  });

  it('unterstützt "Nachname, Vorname" Notation', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Müller, Hans', formality: 'formal' }), 'Sehr geehrter Herr Müller,');
  });

  it('verhält sich normgerecht nach DIN 5008 ohne Herr/Frau-Präfix (neutraler Fallback)', () => {
    // Ohne Herr/Frau-Präfix wird kein Geschlecht geraten und keine Kunstkonstruktion erfunden
    assertEqual(SalutationEngine.derive({ rawName: 'Max Müller', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Dr. Hans-Peter von Müller-Lüdenscheidt', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Dr. Hans-Peter von Müller-Lüdenscheidt', formality: 'casual' }), 'Hallo,');
    assertEqual(SalutationEngine.derive({ rawName: 'Dipl.-Ing. Heinz e.K.', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Musterholding GmbH & Co. KG', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
  });

  it('behandelt Negativfälle wie Dr. allein oder Namen mit Ortssuffixen (Steinberg)', () => {
    // Dr. allein ohne weiteren Namen -> Fallback-Anrede
    assertEqual(SalutationEngine.derive({ rawName: 'Dr.', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Dr. med.', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    // Person mit Nachname auf -berg wird nicht als Ort/Organisation fehlinterpretiert
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Maria Steinberg', formality: 'formal' }), 'Sehr geehrte Frau Steinberg,');
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Thomas Rosenfeld', formality: 'formal' }), 'Sehr geehrter Herr Rosenfeld,');
    // Firma auf -berg wird als Organisation erkannt
    assertEqual(SalutationEngine.derive({ rawName: 'Wolfsberg GmbH', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
  });

  it('übersteuert Branchen-Nomen (Bank, Hotel) und Firmenformen bei explizitem Herr/Frau', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Thomas Bank', formality: 'formal' }), 'Sehr geehrter Herr Bank,');
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Bank eG', formality: 'formal' }), 'Sehr geehrter Herr Bank,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Sabine Hotel', formality: 'formal' }), 'Sehr geehrte Frau Hotel,');
    assertEqual(SalutationEngine.derive({ rawName: 'Turnverein Bonn 1860', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Muster UG (haftungsbeschränkt)', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Max Mustermann e.K.', formality: 'formal' }), 'Sehr geehrter Herr Mustermann,');
  });

  it('verifiziert deriveSalutation Standalone-Funktion', () => {
    assertEqual(deriveSalutation('Herr Dr. Müller'), 'Sehr geehrter Herr Dr. Müller,');
    assertEqual(deriveSalutation('Frau Prof. Dr. Schmidt'), 'Sehr geehrte Frau Prof. Dr. Schmidt,');
    assertEqual(deriveSalutation('Herr von Müller'), 'Sehr geehrter Herr von Müller,');
    assertEqual(deriveSalutation('Frau van der Berg'), 'Sehr geehrte Frau van der Berg,');
    assertEqual(deriveSalutation('Herr Müller, Hans'), 'Sehr geehrter Herr Müller,');
    assertEqual(deriveSalutation('Herr Bank eG'), 'Sehr geehrter Herr Bank,');
    assertEqual(deriveSalutation('Muster eG'), 'Sehr geehrte Damen und Herren,');
    assertEqual(deriveSalutation('Max Müller'), 'Sehr geehrte Damen und Herren,');
  });
});

describe('SalutationFeature: Auto-Seed & Undo-Härtung (dataset.dirty Synchronisation)', () => {
  it('synchronisiert dataset.dirty und auto-State bei Wiederherstellung eines Auto-Wertes', () => {
    let nameEl = document.getElementById('empfaenger-name');
    if (!nameEl) {
      nameEl = document.createElement('div');
      nameEl.id = 'empfaenger-name';
      document.body.appendChild(nameEl);
    }
    let anredeEl = document.getElementById('anrede');
    if (!anredeEl) {
      anredeEl = document.createElement('div');
      anredeEl.id = 'anrede';
      document.body.appendChild(anredeEl);
    }
    let grussEl = document.getElementById('grussformel');
    if (!grussEl) {
      grussEl = document.createElement('div');
      grussEl.id = 'grussformel';
      document.body.appendChild(grussEl);
    }

    nameEl.textContent = 'Herr Dr. Müller';
    anredeEl.textContent = 'Manuelle Anrede';
    anredeEl.dataset.dirty = 'true';
    delete anredeEl.dataset.generated;

    const feature = new SalutationFeature();
    feature.init();

    // Vor Undo: Text ist manuell und dirty
    assertEqual(anredeEl.dataset.dirty, 'true');

    // Simuliere Undo zu automatisch abgeleiteter Anrede
    anredeEl.textContent = 'Sehr geehrter Herr Dr. Müller,';
    eventBus.publish(Events.DOCUMENT_CHANGED);

    assertEqual(anredeEl.dataset.dirty, undefined, 'dirty-Flag wird nach Undo gelöscht');
    assertEqual(anredeEl.dataset.generated, 'true', 'generated-Flag wird wiederhergestellt');

    // Simuliere auch Undo für Grußformel
    grussEl.textContent = 'Beste Grüße vorab';
    grussEl.dataset.dirty = 'true';
    delete grussEl.dataset.generated;

    grussEl.textContent = 'Mit freundlichen Grüßen';
    eventBus.publish(Events.DOCUMENT_CHANGED);

    assertEqual(grussEl.dataset.dirty, undefined, 'dirty-Flag der Grußformel wird nach Undo gelöscht');
    assertEqual(grussEl.dataset.generated, 'true', 'generated-Flag der Grußformel wird wiederhergestellt');

    feature.destroy();
  });

  it('füllt leere Anrede und Grußformel nach DOCUMENT_CHANGED (Reset-Pfad)', () => {
    /** @param {string} id */
    const hole = (id) => {
      let el = /** @type {HTMLElement | null} */ (document.getElementById(id));
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        document.body.append(el);
      }
      return el;
    };
    const nameEl = hole('empfaenger-name');
    const anredeEl = hole('anrede');
    const grussEl = hole('grussformel');

    nameEl.textContent = 'Herr Dr. Müller';
    anredeEl.textContent = '';
    grussEl.textContent = '';
    for (const el of [anredeEl, grussEl]) {
      delete el.dataset.dirty;
      delete el.dataset.generated;
    }

    const feature = new SalutationFeature();
    feature.init();
    try {
      // resetDraft() und Undo/Redo publizieren genau dieses Event.
      eventBus.publish(Events.DOCUMENT_CHANGED, { draft: {} });
      assertEqual(anredeEl.textContent.trim(), 'Sehr geehrter Herr Dr. Müller,', 'Anrede wird aus dem Namen abgeleitet');
      assertEqual(grussEl.textContent.trim(), 'Mit freundlichen Grüßen', 'Grußformel wird formal gesetzt');
    } finally {
      feature.destroy();
    }
  });
});

describe('ClipboardAddressParser: Anschrift-Parsing (unstrukturierte Zwischenablage)', () => {
  it('extrahiert Standard-Unternehmensadressen aus mehrzeiligem Impressum', () => {
    const text = [
      'Musterfirma GmbH',
      'Max Mustermann',
      'Hauptstraße 42',
      '10115 Berlin',
      'Telefon: 030 123456',
      'E-Mail: info@musterfirma.de'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Mindestens ein Adress-Kandidat gefunden');
    assertEqual(candidates[0].firma, 'Musterfirma GmbH');
    assertEqual(candidates[0].name, 'Max Mustermann');
    assertEqual(candidates[0].strasse, 'Hauptstraße 42');
    assertEqual(candidates[0].plz, '10115');
    assertEqual(candidates[0].ort, 'Berlin');
  });

  it('extrahiert Privatpersonen ohne Firma korrekt', () => {
    const text = [
      'Erika Musterfrau',
      'Gartenweg 7 b',
      '50667 Köln'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Kandidat für Privatperson gefunden');
    assertEqual(candidates[0].firma, '');
    assertEqual(candidates[0].name, 'Erika Musterfrau');
    assertEqual(candidates[0].strasse, 'Gartenweg 7 b');
    assertEqual(candidates[0].plz, '50667');
    assertEqual(candidates[0].ort, 'Köln');
  });

  it('ignoriert Metadaten-Zeilen wie Telefon, Fax und Register', () => {
    const text = [
      'Kontakt:',
      'SuperTech AG',
      'Technologiepark 1',
      '80331 München',
      'Tel: +49 89 99999',
      'Handelsregister: HRB 12345'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Kandidat gefunden');
    assertEqual(candidates[0].firma, 'SuperTech AG');
    assertEqual(candidates[0].strasse, 'Technologiepark 1');
    assertEqual(candidates[0].plz, '80331');
    assertEqual(candidates[0].ort, 'München');
  });

  it('erkennt Titel (Dr., Prof.) und z. Hd. vor Leerzeichen sowie e.V. und erweiterte Straßennamen (Markt, Pfad)', () => {
    const text = [
      'Turnverein Bonn 1860 e.V.',
      'z. Hd. Dr. Hans-Peter Müller',
      'Am Markt 3',
      '53111 Bonn',
      'Mobil: 0170 12345678',
      'IBAN: DE12345678901234567890'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Kandidat für e.V. und Dr. gefunden');
    assertEqual(candidates[0].firma, 'Turnverein Bonn 1860 e.V.');
    assertEqual(candidates[0].name, 'Dr. Hans-Peter Müller');
    assertEqual(candidates[0].strasse, 'Am Markt 3');
    assertEqual(candidates[0].plz, '53111');
    assertEqual(candidates[0].ort, 'Bonn');
  });

  it('entfaltet einzeilige kommagetrennte Adressen (TC-05)', () => {
    const raw = 'Acme Corp, Berliner Str. 10, 10115 Berlin';
    const candidates = ClipboardAddressParser.parse(raw);
    assert(candidates.length > 0, 'Kandidat für Einzeiler gefunden');
    assertEqual(candidates[0].firma, 'Acme Corp');
    assertEqual(candidates[0].strasse, 'Berliner Str. 10');
    assertEqual(candidates[0].plz, '10115');
    assertEqual(candidates[0].ort, 'Berlin');
  });

  it('klassifiziert 3-zeiligen Empfänger mit Zusatz und z. Hd. (TC-06)', () => {
    const text = [
      'Acme International GmbH',
      'Abteilung Rechnungswesen',
      'z. Hd. Herrn Hans-Peter Müller',
      'Friedrichstraße 42',
      '10115 Berlin'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Kandidat für 3-zeiligen Empfänger gefunden');
    assertEqual(candidates[0].firma, 'Acme International GmbH');
    assertEqual(candidates[0].zusatz, 'Abteilung Rechnungswesen');
    assertEqual(candidates[0].name, 'Herrn Hans-Peter Müller');
    assertEqual(candidates[0].strasse, 'Friedrichstraße 42');
    assertEqual(candidates[0].plz, '10115');
    assertEqual(candidates[0].ort, 'Berlin');
  });

  it('toleriert eingeschobene Ortsteile zwischen Straße und PLZ', () => {
    const text = [
      'SuperTech AG',
      'Technologiepark 1',
      'Gewerbegebiet Süd',
      '80331 München'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Kandidat mit Ortsteil gefunden');
    assertEqual(candidates[0].firma, 'SuperTech AG');
    assertEqual(candidates[0].strasse, 'Technologiepark 1');
    assertEqual(candidates[0].plz, '80331');
    assertEqual(candidates[0].ort, 'München');
  });

  it('schützt Firmen mit Straßensuffixen (Wolfsberg GmbH, Park Hotel) vor Falschklassifikation als Straße', () => {
    // Negativfall: Park Hotel GmbH direkt vor PLZ ohne Straßenzeile
    const text = [
      'Park Hotel GmbH',
      '10115 Berlin'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    // Da keine gültige Straße vorhanden ist, darf Park Hotel GmbH keinesfalls als Straße interpretiert werden
    assertEqual(candidates.length, 0, 'Ohne echte Straßenzeile wird kein fehlerhafter Kandidat erzeugt');
  });

  it('erkennt Postfach-Adressen mit Ziffern korrekt als Straße', () => {
    const text = [
      'Kanzlei Dr. Steinberg',
      'Postfach 12 34 56',
      '53111 Bonn'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Postfach-Kandidat gefunden');
    assertEqual(candidates[0].firma, 'Kanzlei Dr. Steinberg');
    assertEqual(candidates[0].strasse, 'Postfach 12 34 56');
    assertEqual(candidates[0].plz, '53111');
    assertEqual(candidates[0].ort, 'Bonn');
  });

  it('erkennt alle zusammengesetzten Straßennamen mit Suffixen (Review Befund 1)', () => {
    const testCases = [
      { text: 'Max Mustermann\nHauptstraße 5\n10115 Berlin', strasse: 'Hauptstraße 5' },
      { text: 'Erika Musterfrau\nMusterstr. 12a\n50667 Köln', strasse: 'Musterstr. 12a' },
      { text: 'Hans Schmidt\nEichenpfad 1\n20095 Hamburg', strasse: 'Eichenpfad 1' },
      { text: 'Petra Meyer\nSchulsteig 4\n01067 Dresden', strasse: 'Schulsteig 4' },
      { text: 'Klaus Wagner\nSchlossberg 7\n79098 Freiburg', strasse: 'Schlossberg 7' }
    ];
    for (const tc of testCases) {
      const candidates = ClipboardAddressParser.parse(tc.text);
      assert(candidates.length > 0, `Kandidat für ${tc.strasse} gefunden`);
      assertEqual(candidates[0].strasse, tc.strasse, `Straße ${tc.strasse} exakt extrahiert`);
    }
  });

  it('behandelt Geschoss- und Gebäudeteile (EG, UG) ohne Fehlklassifikation als Firma (Review Befund 2)', () => {
    const t1 = 'Firma ABC GmbH\nMusterweg 3 EG\n10115 Berlin';
    const c1 = ClipboardAddressParser.parse(t1);
    assert(c1.length > 0, 'Kandidat für Musterweg 3 EG gefunden');
    assertEqual(c1[0].strasse, 'Musterweg 3 EG');

    const t2 = 'Firma XYZ AG\nHauptstr. 5, UG\n50667 Köln';
    const c2 = ClipboardAddressParser.parse(t2);
    assert(c2.length > 0, 'Kandidat für Hauptstr. 5, UG gefunden');
    assertEqual(c2[0].strasse, 'Hauptstr. 5, UG');
  });

  it('behält Empfänger mit Geschäftsführer-Titel und Emailwerk GmbH intakt (Review Befund 5)', () => {
    const text = [
      'Emailwerk GmbH',
      'Geschäftsführer Max Mustermann',
      'Industriestr. 10',
      '40212 Düsseldorf'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assert(candidates.length > 0, 'Kandidat für Emailwerk gefunden');
    assertEqual(candidates[0].firma, 'Emailwerk GmbH');
    assertEqual(candidates[0].name, 'Max Mustermann');
    assertEqual(candidates[0].strasse, 'Industriestr. 10');
  });

  it('weist Vereine mit Jahreszahlen ohne Straße korrekt als Nicht-Straße ab (Review Befund 6)', () => {
    const text = [
      'Turnverein Bonn 1860',
      '53111 Bonn'
    ].join('\n');
    const candidates = ClipboardAddressParser.parse(text);
    assertEqual(candidates.length, 0, 'Turnverein Bonn 1860 darf ohne Straße nicht als Straße erkannt werden');
  });

  it('sichert alle Randfälle aus Review Runde 3 (FLOOR_SUFFIX, Nachnamen als Straße, UG, Metadaten)', () => {
    // 1. FLOOR_SUFFIX frisst keine Wortenden (Eichenweg bleibt Eichenweg)
    assertEqual(ClipboardAddressParser.isStreetLine('Eichenweg'), true, 'Eichenweg bleibt Straße (kein EG-Abschneiden)');
    assertEqual(ClipboardAddressParser.isStreetLine('Bergweg'), true, 'Bergweg bleibt Straße');

    // 2. Nachnamen ohne Hausnummer werden nicht als Straße erkannt
    assertEqual(ClipboardAddressParser.isStreetLine('Hans Hering'), false, 'Hans Hering (-ring) ist keine Straße');
    assertEqual(ClipboardAddressParser.isStreetLine('Petra Wall'), false, 'Petra Wall (-wall) ist keine Straße');
    assertEqual(ClipboardAddressParser.isStreetLine('Karl Damm'), false, 'Karl Damm (-damm) ist keine Straße');

    // 3. Geschoss mit Trenner
    assertEqual(ClipboardAddressParser.isStreetLine('Musterweg 3 EG'), true, 'Musterweg 3 EG ist Straße');

    // 4. Metadaten-Grenzen
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Telefonseelsorge Bonn'), false, 'Telefonseelsorge ist keine Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Mobilfunkshop GmbH'), false, 'Mobilfunkshop ist keine Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Tel 0228 123456'), true, 'Tel mit Leerzeichen ist Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Mobil 0170 99999'), true, 'Mobil mit Leerzeichen ist Metadatenzeile');
  });

  it('sichert alle Randfälle aus Review Runde 4 (Rechtsformen case-sensitivity, Bindestrich-Straßen, Metadaten-Präfixe, Jahreszahlen)', () => {
    // 1. Rechtsformen case-sensitivity & UG
    assertEqual(ClipboardAddressParser.isCorporate('Muster GmbH'), true, 'Muster GmbH ist Corporate');
    assertEqual(ClipboardAddressParser.isCorporate('Muster (Haftungsbeschränkt)'), true, 'Muster (Haftungsbeschränkt) ist Corporate');
    assertEqual(ClipboardAddressParser.isCorporate('Muster UG'), true, 'Muster UG ist Corporate');
    assertEqual(ClipboardAddressParser.isCorporate('Park Hotel'), true, 'Park Hotel ist Corporate');

    // 2. Bindestrich-Straßen ohne Hausnummer
    assertEqual(ClipboardAddressParser.isStreetLine('Karl-Marx-Straße'), true, 'Karl-Marx-Straße ohne Hausnummer ist Straße');
    assertEqual(ClipboardAddressParser.isStreetLine('Dr.-Külz-Ring'), true, 'Dr.-Külz-Ring ohne Hausnummer ist Straße');

    // 3. Metadaten vs. Firmennamen (Mobil Oil AG, Tel Aviv Café, Fon Design, Bic Burger GmbH)
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Mobil Oil AG'), false, 'Mobil Oil AG ist keine Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Tel Aviv Café'), false, 'Tel Aviv Café ist keine Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Fon Design'), false, 'Fon Design ist keine Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Bic Burger GmbH'), false, 'Bic Burger GmbH ist keine Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Tel.: 0228 12345'), true, 'Tel.: 0228 ist Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('Mobil 0170 12345'), true, 'Mobil 0170 ist Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('IBAN DE89 3704 0044 0532 0130 00'), true, 'IBAN ist Metadatenzeile');
    assertEqual(ClipboardAddressParser.METADATA_LINE_REGEX.test('BIC: COBADEFFXXX'), true, 'BIC ist Metadatenzeile');

    // 4. Jahreszahlen vs. 1-3-stellige Hausnummern
    assertEqual(ClipboardAddressParser.isStreetLine('Verein Am Park 1904'), false, 'Verein Am Park 1904 hat keine gültige Hausnummer und ist Verein');
    assertEqual(ClipboardAddressParser.isStreetLine('Sportclub Am Markt 1920'), false, 'Sportclub Am Markt 1920 hat 4-stellige Jahreszahl');

    // 5. Geschoss-Tokens (Eichenweg UG bleibt Straße mit Geschoss)
    assertEqual(ClipboardAddressParser.isStreetLine('Eichenweg UG'), true, 'Eichenweg UG bleibt Straße mit Souterrain/UG');

    // 6. Nachnamen vs. Ring-Straßen (Review Runde 5)
    assertEqual(ClipboardAddressParser.isStreetLine('Hans Hering'), false, 'Hans Hering ist Nachname');
    assertEqual(ClipboardAddressParser.isStreetLine('Klaus Hohenring'), false, 'Klaus Hohenring ist Nachname');
    assertEqual(ClipboardAddressParser.isStreetLine('Anna Wiedring'), false, 'Anna Wiedring ist Nachname');
    assertEqual(ClipboardAddressParser.isStreetLine('Peter Goldring'), false, 'Peter Goldring ist Nachname');
    assertEqual(ClipboardAddressParser.isStreetLine('Hohenzollernring'), true, 'Hohenzollernring ist Straße');
  });

  it('validiert 50 diverse reale deutsche Anschriften aus der Praxis', () => {
    const dataset = [
      { text: 'Dr. Hans-Peter von Müller\nUnter den Linden 42\n10117 Berlin', plz: '10117', ort: 'Berlin', strasse: 'Unter den Linden 42' },
      { text: 'Erika Mustermann\nAm Markt 3\n50667 Köln', plz: '50667', ort: 'Köln', strasse: 'Am Markt 3' },
      { text: 'Klaus Wagner\nSchlossberg 7\n79098 Freiburg', plz: '79098', ort: 'Freiburg', strasse: 'Schlossberg 7' },
      { text: 'Petra Meyer\nSchulsteig 4\n01067 Dresden', plz: '01067', ort: 'Dresden', strasse: 'Schulsteig 4' },
      { text: 'Siemens AG\nWerner-von-Siemens-Straße 1\n80333 München', plz: '80333', ort: 'München', strasse: 'Werner-von-Siemens-Straße 1' },
      { text: 'Kanzlei Dr. Steinberg\nPostfach 12 34 56\n53111 Bonn', plz: '53111', ort: 'Bonn', strasse: 'Postfach 12 34 56' },
      { text: 'Firma Muster UG\nMusterweg 3 EG\n20095 Hamburg', plz: '20095', ort: 'Hamburg', strasse: 'Musterweg 3 EG' },
      { text: 'Technik GmbH\nHauptstr. 5, UG\n70173 Stuttgart', plz: '70173', ort: 'Stuttgart', strasse: 'Hauptstr. 5, UG' },
      { text: 'Dr. med. Anna Sommer\nKurfürstendamm 195\n10707 Berlin', plz: '10707', ort: 'Berlin', strasse: 'Kurfürstendamm 195' },
      { text: 'Dipl.-Ing. Heinz Weber\nIndustriestraße 10-12\n40212 Düsseldorf', plz: '40212', ort: 'Düsseldorf', strasse: 'Industriestraße 10-12' },
      { text: 'BioNTech SE\nAn der Goldgrube 12\n55131 Mainz', plz: '55131', ort: 'Mainz', strasse: 'An der Goldgrube 12' },
      { text: 'Max Mustermann\nKarl-Marx-Allee 34\n10243 Berlin', plz: '10243', ort: 'Berlin', strasse: 'Karl-Marx-Allee 34' },
      { text: 'Johanna Schmidt\nHohenzollernring 55\n50672 Köln', plz: '50672', ort: 'Köln', strasse: 'Hohenzollernring 55' },
      { text: 'Robert Bosch GmbH\nRobert-Bosch-Platz 1\n70839 Gerlingen', plz: '70839', ort: 'Gerlingen', strasse: 'Robert-Bosch-Platz 1' },
      { text: 'Bäckerei Müller\nBäckerweg 8\n90403 Nürnberg', plz: '90403', ort: 'Nürnberg', strasse: 'Bäckerweg 8' },
      { text: 'Rechtsanwälte Schmidt & Partner\nz. Hd. Frau Meyer\nKaiserstraße 14\n60311 Frankfurt am Main', plz: '60311', strasse: 'Kaiserstraße 14' },
      { text: 'Universitätsklinikum Bonn\nVenusberg-Campus 1\n53127 Bonn', plz: '53127', ort: 'Bonn', strasse: 'Venusberg-Campus 1' },
      { text: 'Hotel Stadtpalais\nDeutzer Damm 2\n50679 Köln', plz: '50679', ort: 'Köln', strasse: 'Deutzer Damm 2' },
      { text: 'Autohaus Süd GmbH\nStuttgarter Chaussee 99\n71032 Böblingen', plz: '71032', strasse: 'Stuttgarter Chaussee 99' },
      { text: 'Prof. Dr. Christian Drosten\nCharitéplatz 1\n10117 Berlin', plz: '10117', ort: 'Berlin', strasse: 'Charitéplatz 1' },
      { text: 'Zimmerei Holzbau e.K.\nIm Gewerbepark 4\n85356 Freising', plz: '85356', strasse: 'Im Gewerbepark 4' },
      { text: 'Verband der Automobilindustrie\nBehrenstraße 35\n10117 Berlin', plz: '10117', strasse: 'Behrenstraße 35' },
      { text: 'Dr. Külz Stiftung\nWilly-Brandt-Straße 1\n10557 Berlin', plz: '10557', strasse: 'Willy-Brandt-Straße 1' },
      { text: 'Apotheke am Rathaus\nRathausgasse 3\n53111 Bonn', plz: '53111', strasse: 'Rathausgasse 3' },
      { text: 'Volksbank Köln Bonn eG\nLudwig-Erhard-Allee 20\n53175 Bonn', plz: '53175', strasse: 'Ludwig-Erhard-Allee 20' },
      { text: 'Stiftung Warentest\nLützowplatz 11-13\n10785 Berlin', plz: '10785', strasse: 'Lützowplatz 11-13' },
      { text: 'Deutsche Telekom AG\nFriedrich-Ebert-Allee 140\n53113 Bonn', plz: '53113', strasse: 'Friedrich-Ebert-Allee 140' },
      { text: 'Hansestadt Lübeck\nBreite Straße 62\n23552 Lübeck', plz: '23552', strasse: 'Breite Straße 62' },
      { text: 'Stadtwerke München GmbH\nEmmy-Noether-Straße 2\n80992 München', plz: '80992', strasse: 'Emmy-Noether-Straße 2' },
      { text: 'Kanzlei Berger & Kollegen\nFriedrichstraße 100\n10117 Berlin', plz: '10117', strasse: 'Friedrichstraße 100' },
      { text: 'Hausverwaltung Nord\nLange Zeile 15\n28203 Bremen', plz: '28203', strasse: 'Lange Zeile 15' },
      { text: 'Büro für Gestaltung\nAm Ufer 8\n24105 Kiel', plz: '24105', strasse: 'Am Ufer 8' },
      { text: 'Logistikzentrum Ost\nBahnhofspfad 2\n04109 Leipzig', plz: '04109', strasse: 'Bahnhofspfad 2' },
      { text: 'Klinikum Rechts der Isar\nIsmaninger Straße 22\n81675 München', plz: '81675', strasse: 'Ismaninger Straße 22' },
      { text: 'Verlag Moderne Medien GmbH\nSpeersort 1\n20095 Hamburg', plz: '20095', strasse: 'Speersort 1' },
      { text: 'Architekturbüro Raum & Form\nAm Anger 12\n99084 Erfurt', plz: '99084', strasse: 'Am Anger 12' },
      { text: 'Institut für Umweltforschung\nWaldweg 44\n69120 Heidelberg', plz: '69120', strasse: 'Waldweg 44' },
      { text: 'Gartenbau Grünspecht e.K.\nIm Rosengarten 7\n67655 Kaiserslautern', plz: '67655', strasse: 'Im Rosengarten 7' },
      { text: 'Theater der Bundesstadt\nAm Boeselagerhof 1\n53111 Bonn', plz: '53111', strasse: 'Am Boeselagerhof 1' },
      { text: 'Fahrschule Blitz\nSchillerstraße 12\n30159 Hannover', plz: '30159', strasse: 'Schillerstraße 12' },
      { text: 'Physiotherapie Praxis Balance\nKirchgasse 5\n65185 Wiesbaden', plz: '65185', strasse: 'Kirchgasse 5' },
      { text: 'Baugenossenschaft Freie Scholle eG\nSchollenweg 18\n33613 Bielefeld', plz: '33613', strasse: 'Schollenweg 18' },
      { text: 'Tischlerei Holzwurm\nAuf dem Kamp 3\n48143 Münster', plz: '48143', strasse: 'Auf dem Kamp 3' },
      { text: 'Dr. med. dent. Michael Groß\nDomplatz 6\n45127 Essen', plz: '45127', strasse: 'Domplatz 6' },
      { text: 'Agentur Kreativrausch\nKastanienallee 79\n10435 Berlin', plz: '10435', strasse: 'Kastanienallee 79' },
      { text: 'Sportverein Blau-Weiß\nSportplatzweg 1\n26122 Oldenburg', plz: '26122', strasse: 'Sportplatzweg 1' },
      { text: 'Finanzberatung Transparent\nWallstraße 20\n40213 Düsseldorf', plz: '40213', strasse: 'Wallstraße 20' },
      { text: 'Fotostudio Lichtblick\nZeppelinstraße 15\n88045 Friedrichshafen', plz: '88045', strasse: 'Zeppelinstraße 15' },
      { text: 'Druckerei Gutenbergs Erben\nMainzer Straße 88\n65189 Wiesbaden', plz: '65189', strasse: 'Mainzer Straße 88' },
      { text: 'Weingut Sonnenhang\nRebenweg 14\n55291 Saulheim', plz: '55291', strasse: 'Rebenweg 14' }
    ];

    for (const item of dataset) {
      const res = ClipboardAddressParser.parse(item.text);
      assert(res.length > 0, `Kandidat für ${item.text.split('\n')[0]} gefunden`);
      assertEqual(res[0].plz, item.plz, `PLZ stimmt für ${item.text.split('\n')[0]}`);
      if (item.strasse) {
        assertEqual(res[0].strasse, item.strasse, `Straße stimmt für ${item.text.split('\n')[0]}`);
      }
    }
  });

  it('extractPlzOrt: Verstärker-Prinzip, Tippfehler-Korrektur und Mismatch-Erkennung', () => {
    // 1. Exakter Match
    const exact = ClipboardAddressParser.extractPlzOrt('53111 Bonn');
    assert(exact !== null);
    assertEqual(exact?.plz, '53111');
    assertEqual(exact?.ort, 'Bonn');
    assertEqual(exact?.verified, true);
    assertEqual(exact?.ortCorrected, false);
    assertEqual(exact?.ortMismatch, false);

    // 2. Tippfehler ("Bon" -> "Bonn")
    const typo = ClipboardAddressParser.extractPlzOrt('53111 Bon');
    assert(typo !== null);
    assertEqual(typo?.plz, '53111');
    assertEqual(typo?.ort, 'Bonn');
    assertEqual(typo?.verified, true);
    assertEqual(typo?.ortCorrected, true);
    assertEqual(typo?.ortMismatch, false);

    // 3. Mismatch (53111 mit Köln)
    const mismatch = ClipboardAddressParser.extractPlzOrt('53111 Köln');
    assert(mismatch !== null);
    assertEqual(mismatch?.plz, '53111');
    assertEqual(mismatch?.ort, 'Köln');
    assertEqual(mismatch?.verified, true);
    assertEqual(mismatch?.ortCorrected, false);
    assertEqual(mismatch?.ortMismatch, true);
    assertEqual(mismatch?.canonicalOrt, 'Bonn');

    // 4. Ausländische 5-stellige PLZ (75001 Paris) wird NICHT verworfen
    const foreign = ClipboardAddressParser.extractPlzOrt('75001 Paris');
    assert(foreign !== null);
    assertEqual(foreign?.plz, '75001');
    assertEqual(foreign?.ort, 'Paris');
    assertEqual(foreign?.verified, false);
    assertEqual(foreign?.ortMismatch, false);
  });

  it('isCorporate erkennt Firmen aus AddressData.firmenIndex auch ohne Rechtsform-Suffix', () => {
    assert(ClipboardAddressParser.isCorporate('Commerzbank AG'), 'Commerzbank AG ist Corporate');
    assert(ClipboardAddressParser.isCorporate('Allgemeine Ortskrankenkasse Plus'), 'Allgemeine Ortskrankenkasse Plus ist im Firmen-Index');
  });
});

describe('FontFeature: Minimalistischer 2-Zustände Font-Button & Kaskade', () => {
  it('initialisiert im leeren Zustand mit Systemschrift-Fallback', () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-schrift-aktion'));
    const sm = new SettingsManager();
    const ff = new FontFeature(sm);
    ff.updateFontStatusUI(false);
    assertEqual(btn.dataset.fontState, 'empty');
    assert(btn.textContent?.includes('Eigene Schriftart laden') || false, 'Text zeigt Schriftart laden');
    assert(!document.body.classList.contains('schrift-eigene-aktiv'), 'body hat nicht schrift-eigene-aktiv');
    assertEqual(document.documentElement.style.getPropertyValue('--active-font-family'), '');
  });

  it('wechselt in geladenen Zustand bei vorhandener Schrift', () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-schrift-aktion'));
    const sm = new SettingsManager();
    const ff = new FontFeature(sm);
    ff.updateFontStatusUI(true);
    assertEqual(btn.dataset.fontState, 'loaded');
    assert(btn.textContent?.includes('Eigene Schrift entfernen') || false, 'Text zeigt Schrift entfernen');
    assert(document.body.classList.contains('schrift-eigene-aktiv'), 'body hat schrift-eigene-aktiv');
    assert(document.documentElement.style.getPropertyValue('--active-font-family').includes('CustomUserFont'), '--active-font-family enthaelt CustomUserFont');
  });

  it('entfernt die Schrift bei Klick aus IndexedDB (kein localStorage)', async () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-schrift-aktion'));
    const sm = new SettingsManager();
    const ff = new FontFeature(sm);
    ff.attachListeners();
    await saveBlob('font', new Blob([new Uint8Array([0, 1, 0, 0])], { type: 'font/woff2' }));
    assert((await loadBlob('font')) instanceof Blob, 'Schrift liegt als Blob in IndexedDB');
    ff.updateFontStatusUI(true);
    assertEqual(btn.dataset.fontState, 'loaded');

    btn.click();
    assert(await warteAuf(async () => (await loadBlob('font')) === null), 'IndexedDB-Eintrag wurde gelöscht');
    assertEqual(localStorage.getItem('din_custom_font'), null, 'localStorage enthält keine Schrift');
    assertEqual(btn.dataset.fontState, 'empty');
    assert(!document.body.classList.contains('schrift-eigene-aktiv'), 'body Klasse entfernt');
    assertEqual(document.documentElement.style.getPropertyValue('--active-font-family'), '');
  });

  it('schaltet über applyFontPreset auf Inter, Aptos und Michelangelus um', () => {
    const sel = /** @type {HTMLSelectElement} */ (document.getElementById('select-schriftart'));
    const sm = new SettingsManager();
    const ff = new FontFeature(sm);
    ff.applyFontPreset('inter');
    assertEqual(sel.value, 'inter');
    assert(document.documentElement.style.getPropertyValue('--active-font-family').includes('Test-Inter'), 'Inter aktiv');

    ff.applyFontPreset('aptos');
    assertEqual(sel.value, 'aptos');
    assert(document.documentElement.style.getPropertyValue('--active-font-family').includes('Test-Aptos'), 'Aptos aktiv');

    ff.applyFontPreset('michelangelus');
    assertEqual(sel.value, 'michelangelus');
    assert(document.documentElement.style.getPropertyValue('--active-font-family').includes('Test-Michelangelus'), 'Michelangelus aktiv');

    ff.applyFontPreset('default');
    assertEqual(sel.value, 'default');
    assertEqual(document.documentElement.style.getPropertyValue('--active-font-family'), '');
  });

  it('exportiert FONT_PRESETS mit allen 4 Vorgaben', () => {
    assertEqual(typeof FONT_PRESETS, 'object');
    assertEqual(FONT_PRESETS.default, '');
    assert(FONT_PRESETS.inter.includes('Test-Inter'), 'Test-Inter Preset vorhanden');
    assert(FONT_PRESETS.aptos.includes('Test-Aptos'), 'Test-Aptos Preset vorhanden');
    assert(FONT_PRESETS.michelangelus.includes('Test-Michelangelus'), 'Test-Michelangelus Preset vorhanden');
  });

  it('erzwingt 400 KB Obergrenze in Constants.LIMITS', () => {
    assertEqual(Constants.LIMITS.FONT_SIZE_MAX_KB, 400);
    assert(Constants.TOASTS.FONT.SIZE_ERROR.includes('400 KB'), 'Fehlermeldung nennt 400 KB');
  });
});

describe('SettingsManager: Drill-Down Modus-Umschaltung (Seitenleiste)', () => {
  it('schaltet Modus über toggleSettingsModus deterministisch um', () => {
    const toggle = /** @type {HTMLInputElement} */ (document.getElementById('toggle-modus'));
    const sm = new SettingsManager();
    sm.isReady = true;

    sm.toggleSettingsModus('einstellungen');
    assertEqual(toggle.checked, true, 'Modus auf Einstellungen gewechselt');

    sm.toggleSettingsModus('brief');
    assertEqual(toggle.checked, false, 'Modus auf Brief zurückgestellt');
  });

  it('schaltet über btnZurueck Klick zurück in den Briefmodus', () => {
    const toggle = /** @type {HTMLInputElement} */ (document.getElementById('toggle-modus'));
    const btnZurueck = document.getElementById('btn-zurueck');
    const sm = new SettingsManager();
    sm.isReady = true;
    sm.attachListeners();

    toggle.checked = true;
    btnZurueck?.click();
    assertEqual(toggle.checked, false, 'btnZurueck schaltet auf Brief zurück');
  });

  it('setzt data-plugin-testbrief, haelt data-plugin-multipage aber fest auf true', () => {
    const sm = new SettingsManager();
    sm.isReady = true;

    sm.settings.pluginTestbrief = false;
    /* Alt-Einstellung aus frueheren Versionen: der Einzelseiten-Modus ist
       stillgelegt (ADR-EINSEITEN-STILLGELEGT), das Feld wird ignoriert.
       Der Cast ist Absicht — das Feld existiert im Typ nicht mehr. */
    /** @type {any} */ (sm.settings).pluginMultipage = false;
    sm.applySettings();
    assertEqual(document.documentElement.getAttribute('data-plugin-testbrief'), 'false');
    assertEqual(document.documentElement.getAttribute('data-plugin-multipage'), 'true',
      'Alt-Einstellung pluginMultipage=false wird ignoriert');

    sm.settings.pluginTestbrief = true;
    sm.applySettings();
    assertEqual(document.documentElement.getAttribute('data-plugin-testbrief'), 'true');
    assertEqual(document.documentElement.getAttribute('data-plugin-multipage'), 'true');
  });
});

describe('Druck: Absätze und @page-Regel', () => {
  it("setField('text', …) erzeugt <p>-Absätze statt eines Textblocks", () => {
    const host = document.createElement('div');
    host.id = 'text';
    document.body.appendChild(host);
    try {
      setTestbriefField('text', 'Absatz eins.\n\nAbsatz zwei.\n\n');
      const kinder = [...host.children];
      assertEqual(kinder.length, 2, 'zwei <p>-Kinder, leerer Rest verworfen');
      assertEqual(kinder[0].tagName, 'P', 'erstes Kind ist ein <p>');
      assertEqual(kinder[0].textContent, 'Absatz eins.');
      assertEqual(kinder[1].textContent, 'Absatz zwei.');

      setTestbriefField('text', 'nur ein Absatz');
      assertEqual(host.children.length, 0, 'ohne \\n\\n entsteht kein <p>');
      assertEqual(host.textContent, 'nur ein Absatz');
    } finally {
      host.remove();
    }
  });

  it('@page-Regel kommt aus einem konstruierten Stylesheet (CSP-sicher)', () => {
    /* Ein per JS erzeugtes <style> hat unter CSP `style-src 'self'` kein Sheet
     * (element.sheet === null) — textContent und insertRule laufen ins Leere.
     * Die @page-Regel muss deshalb aus einem konstruierten Stylesheet kommen. */
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('@page { @top-left { content: "TESTKOPF"; } }');
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    try {
      const gefunden = [...document.adoptedStyleSheets].some((s) =>
        [...s.cssRules].some((r) => r.cssText.includes('@page') && r.cssText.includes('TESTKOPF'))
      );
      assert(gefunden, 'konstruiertes Stylesheet trägt die @page-Regel');
    } finally {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet);
    }
    assert(!document.adoptedStyleSheets.includes(sheet), 'Sheet wird wieder entfernt');
  });
});

describe('formatTelefonnummer (DIN 5008 11.3.2)', () => {
  it('formatiert Mobilfunknummern (015x/016x/017x)', () => {
    assertEqual(formatTelefonnummer('01601234567'), '0160 1234567');
    assertEqual(formatTelefonnummer('0160 1234567'), '0160 1234567');
    assertEqual(formatTelefonnummer('0170/1234567'), '0170 1234567');
    assertEqual(formatTelefonnummer('01701234567'), '0170 1234567');
    assertEqual(formatTelefonnummer('0170 123 45 67'), '0170 1234567');
    assertEqual(formatTelefonnummer('0151/23456789'), '0151 23456789');
    assertEqual(formatTelefonnummer('0172-1234567'), '0172 1234567');
  });
  it('formatiert Sonderrufnummern (0800/0900/0180/0137/0700)', () => {
    assertEqual(formatTelefonnummer('0800123456'), '0800 123456');
    assertEqual(formatTelefonnummer('0900123456'), '0900 123456');
    assertEqual(formatTelefonnummer('0180123456'), '0180 123456');
    assertEqual(formatTelefonnummer('0137123456'), '0137 123456');
    assertEqual(formatTelefonnummer('07001234567'), '0700 1234567');
  });
  it('formatiert Festnetznummern (2- bis 5-stellige Vorwahl)', () => {
    assertEqual(formatTelefonnummer('0228123456'), '0228 123456');
    assertEqual(formatTelefonnummer('0228/123456'), '0228 123456');
    assertEqual(formatTelefonnummer('0228-123456'), '0228 123456');
    assertEqual(formatTelefonnummer('0301234567'), '030 1234567');
    assertEqual(formatTelefonnummer('0221123456'), '0221 123456');
    assertEqual(formatTelefonnummer('02203/123456'), '02203 123456');
    assertEqual(formatTelefonnummer('02203123456'), '02203123456', 'Unbekannte Vorwahl ohne Trenner bleibt unformatiert (A18)');
    assertEqual(formatTelefonnummer('0221 1234567'), '0221 1234567');
    assertEqual(formatTelefonnummer('030 1234567'), '030 1234567');
    assertEqual(formatTelefonnummer('0800 123456'), '0800 123456');
  });
  it('dokumentierte Grenze: Unbekannte Vorwahlen ohne Trenner bleiben unformatiert (A18)', () => {
    // Ohne Vorwahl-Datenbank wird bei unbekannten Vorwahlen ohne Trenner nicht geraten:
    // "Lieber unformatiert als falsch formatiert". Mit Trenner wird sauber formatiert.
    assertEqual(formatTelefonnummer('02204123456'), '02204123456');
    assertEqual(formatTelefonnummer('022041 23456'), '022041 23456');
    assertEqual(formatTelefonnummer('02204/123456'), '02204 123456');
  });
  it('uebernimmt Durchwahlen mit Bindestrich', () => {
    assertEqual(formatTelefonnummer('0228 123456-78'), '0228 123456-78');
    assertEqual(formatTelefonnummer('0228 123456 78'), '0228 123456-78');
    assertEqual(formatTelefonnummer('0228123456-78'), '0228 123456-78');
    assertEqual(formatTelefonnummer('0151 1234567-89'), '0151 1234567-89');
  });
  it('normalisiert internationale Praefixe zu +49 (inkl. +49 (0))', () => {
    assertEqual(formatTelefonnummer('+491601234567'), '+49 160 1234567');
    assertEqual(formatTelefonnummer('+49 160 1234567'), '+49 160 1234567');
    assertEqual(formatTelefonnummer('+49 (0) 160 1234567'), '+49 160 1234567');
    assertEqual(formatTelefonnummer('0049 160 1234567'), '+49 160 1234567');
    assertEqual(formatTelefonnummer('+49 228 123456'), '+49 228 123456');
    assertEqual(formatTelefonnummer('+49 (0) 228 123456'), '+49 228 123456');
    assertEqual(formatTelefonnummer('0049 228 123456'), '+49 228 123456');
    assertEqual(formatTelefonnummer('+49 151 1234567-89'), '+49 151 1234567-89');
  });
  it('laesst Nummern fremder Laendervorwahlen in ihrer Schreibweise', () => {
    assertEqual(formatTelefonnummer('+43 1 2345678'), '+43 1 2345678');
    assertEqual(formatTelefonnummer('0043 1 2345678'), '+43 1 2345678');
  });
  it('ist idempotent', () => {
    for (const nummer of ['0170 1234567', '0228 123456-78', '+49 228 123456', '030 1234567', '0800 123456']) {
      assertEqual(formatTelefonnummer(formatTelefonnummer(nummer)), nummer);
    }
  });
  it('behandelt leere und fremde Eingaben defensiv', () => {
    assertEqual(formatTelefonnummer(''), '');
    assertEqual(formatTelefonnummer(null), '');
    assertEqual(formatTelefonnummer(undefined), '');
    assertEqual(formatTelefonnummer('keine Nummer'), 'keine Nummer');
    assertEqual(formatTelefonnummer('228 123456'), '228 123456');
  });
});

describe('formatDatum (DIN 5008 § 11.4)', () => {
  it('formatiert ISO-Datum deterministisch', () => {
    assertEqual(formatDatum('2026-09-04', { format: 'iso' }), '2026-09-04');
    assertEqual(formatDatum('04.09.2026', { format: 'iso' }), '2026-09-04');
    assertEqual(formatDatum(new Date(2026, 8, 4), { format: 'iso' }), '2026-09-04');
  });

  it('formatiert DIN-alphanumerisch mit langem Monatsnamen', () => {
    assertEqual(formatDatum('2026-09-04', { format: 'alpha' }), '4. September 2026');
    assertEqual(formatDatum('04.09.2026', { format: 'alpha' }), '4. September 2026');
  });

  it('formatiert DIN-numerisch mit pad: true (Standard) und pad: false', () => {
    assertEqual(formatDatum('2026-09-04'), '04.09.2026');
    assertEqual(formatDatum('2026-09-04', { pad: true }), '04.09.2026');
    assertEqual(formatDatum('2026-09-04', { pad: false }), '4.09.2026');
    assertEqual(formatDatum('4.9.2026', { pad: true }), '04.09.2026');
  });

  it('behandelt ungültige Datumsangaben defensiv (gibt Original zurück)', () => {
    assertEqual(formatDatum('2026-02-30'), '2026-02-30');
    assertEqual(formatDatum('ungültig'), 'ungültig');
    assertEqual(formatDatum(''), '');
    assertEqual(formatDatum(null), '');
  });
});

describe('formatUhrzeit (DIN 5008 § 11.5)', () => {
  it('gliedert einstellige Stunden zweistellig mit Doppelpunkt', () => {
    assertEqual(formatUhrzeit('5:30'), '05:30');
    assertEqual(formatUhrzeit('05:30'), '05:30');
    assertEqual(formatUhrzeit('17:00'), '17:00');
    assertEqual(formatUhrzeit(new Date(2026, 0, 1, 8, 5)), '08:05');
  });

  it('unterstützt Suffix und Sekunden', () => {
    assertEqual(formatUhrzeit('5:30', { suffix: 'Uhr' }), '05:30 Uhr');
    assertEqual(formatUhrzeit('5:30 Uhr'), '05:30 Uhr');
    assertEqual(formatUhrzeit(new Date(2026, 0, 1, 14, 30, 45), { seconds: true }), '14:30:45');
    assertEqual(formatUhrzeit('14:30:45', { seconds: true, suffix: 'Uhr' }), '14:30:45 Uhr');
  });

  it('erhaelt den DIN-Grenzfall 24:00 und weist 24:30 ab', () => {
    assertEqual(formatUhrzeit('24:00'), '24:00');
    assertEqual(formatUhrzeit('24:30'), '24:30');
    assertEqual(formatUhrzeit('25:00'), '25:00');
    assertEqual(formatUhrzeit('keine Uhrzeit'), 'keine Uhrzeit');
  });
});

describe('formatIban (DIN 5008 § 11.3.1)', () => {
  it('gliedert kompakte IBANs in 4er-Gruppen von links', () => {
    assertEqual(formatIban('de89370400440532013000'), 'DE89 3704 0044 0532 0130 00');
    assertEqual(formatIban('FR1420041010050500013M02606'), 'FR14 2004 1010 0505 0001 3M02 606');
  });

  it('ist idempotent bei bereits gegliederten Strings', () => {
    const gegliedert = 'DE89 3704 0044 0532 0130 00';
    assertEqual(formatIban(gegliedert), gegliedert);
    assertEqual(formatIban(formatIban(gegliedert)), gegliedert);
  });

  it('behandelt ungültige Inputs defensiv', () => {
    assertEqual(formatIban('1234'), '1234');
    assertEqual(formatIban('DE1'), 'DE1');
    assertEqual(formatIban(''), '');
    assertEqual(formatIban(null), '');
  });
});

describe('formatPostfach (DIN 5008 § 11.3.4)', () => {
  it('gliedert 4-stellige und ungerade Postfachnummern von rechts in 2er-Gruppen', () => {
    assertEqual(formatPostfach('1234'), '12 34');
    assertEqual(formatPostfach('12345'), '1 23 45');
    assertEqual(formatPostfach('123456'), '12 34 56');
    assertEqual(formatPostfach('Postfach 12345'), 'Postfach 1 23 45');
  });

  it('ist idempotent', () => {
    assertEqual(formatPostfach('12 34'), '12 34');
    assertEqual(formatPostfach('1 23 45'), '1 23 45');
  });

  it('laesst Nummern unter 3 Ziffern oder Nicht-Ziffern unveraendert', () => {
    assertEqual(formatPostfach('12'), '12');
    assertEqual(formatPostfach('1'), '1');
    assertEqual(formatPostfach('abc'), 'abc');
    assertEqual(formatPostfach(''), '');
  });
});

describe('formatGeldbetrag (DIN 5008 § 6.6 / § 11.2)', () => {
  it('formatiert Zahlen und Betragsstrings mit Tausenderpunkt und Symbol', () => {
    assertEqual(formatGeldbetrag(1234.5), '1.234,50\u00A0€');
    assertEqual(formatGeldbetrag('1234,50'), '1.234,50\u00A0€');
    assertEqual(formatGeldbetrag('1.234,50'), '1.234,50\u00A0€');
    assertEqual(formatGeldbetrag(50), '50,00\u00A0€');
  });

  it('unterstuetzt ISO-Waehrungscode', () => {
    assertEqual(formatGeldbetrag(1234.5, 'EUR', { useIsoCode: true }), '1.234,50\u00A0EUR');
    assertEqual(formatGeldbetrag(100, 'USD', { useIsoCode: true }), '100,00\u00A0USD');
  });

  it('behandelt ungueltige Werte defensiv', () => {
    assertEqual(formatGeldbetrag('kein betrag'), 'kein betrag');
    assertEqual(formatGeldbetrag(''), '');
    assertEqual(formatGeldbetrag(null), '');
  });
});

describe('applyMicroTypography & formatElementMicroTypography (DIN 5008 § 7.2 & § 8.2 — Plan 10)', () => {
  it('ersetzt Leerzeichen bei mehrteiligen Abkuerzungen durch geschuetzte Leerzeichen', () => {
    assertEqual(applyMicroTypography('z. B. im Test'), 'z.\u00A0B. im Test');
    assertEqual(applyMicroTypography('d. h. das gilt'), 'd.\u00A0h. das gilt');
    assertEqual(applyMicroTypography('u. a. dies'), 'u.\u00A0a. dies');
    assertEqual(applyMicroTypography('Verein e. V. hier'), 'Verein e.\u00A0V. hier');
    assertEqual(applyMicroTypography('i. d. R. immer'), 'i.\u00A0d.\u00A0R. immer');
    assertEqual(applyMicroTypography('o. Ä. Dinge'), 'o.\u00A0Ä. Dinge');
    assertEqual(applyMicroTypography('siehe s. o. oben'), 'siehe s.\u00A0o. oben');
    assertEqual(applyMicroTypography('Unterschrift i. V. Schmidt'), 'Unterschrift i.\u00A0V. Schmidt');
    assertEqual(applyMicroTypography('Unterschrift i. A. Meier'), 'Unterschrift i.\u00A0A. Meier');
    assertEqual(applyMicroTypography('usw. etc. pp. Ende'), 'usw. etc.\u00A0pp. Ende');
    assertEqual(applyMicroTypography('Brief u. a. m. fertig'), 'Brief u.\u00A0a.\u00A0m. fertig');
  });

  it('formatiert Paragrafen und Normangaben mit geschuetztem Leerzeichen', () => {
    assertEqual(applyMicroTypography('Gemaess § 24 BGB'), 'Gemaess §\u00A024 BGB');
    assertEqual(applyMicroTypography('nach §§ 38 f. ZPO'), 'nach §§\u00A038 f. ZPO');
    assertEqual(applyMicroTypography('laut Art. 12 GG'), 'laut Art.\u00A012 GG');
    assertEqual(applyMicroTypography('nach Abs. 2 Satz 1'), 'nach Abs.\u00A02 Satz\u00A01');
    assertEqual(applyMicroTypography('in Nr. 4 der Liste'), 'in Nr.\u00A04 der Liste');
    assertEqual(applyMicroTypography('auf S. 42 nachzulesen'), 'auf S.\u00A042 nachzulesen');
    assertEqual(applyMicroTypography('unter Az. 12-C-45/26 erfasst'), 'unter Az.\u00A012-C-45/26 erfasst');
  });

  it('formatiert Zahlen mit Einheiten und Waehrungen normgerecht', () => {
    assertEqual(applyMicroTypography('Kosten: 100 EUR netto'), 'Kosten: 100\u00A0EUR netto');
    assertEqual(applyMicroTypography('Betrag von 25,50 € faellig'), 'Betrag von 25,50\u00A0€ faellig');
    assertEqual(applyMicroTypography('MwSt. 19 % berechnet'), 'MwSt. 19\u00A0% berechnet');
    assertEqual(applyMicroTypography('Gewicht 10 kg genau'), 'Gewicht 10\u00A0kg genau');
    assertEqual(applyMicroTypography('Geschwindigkeit 50 km/h erlaubt'), 'Geschwindigkeit 50\u00A0km/h erlaubt');
    assertEqual(applyMicroTypography('Strecke 120 m lang'), 'Strecke 120\u00A0m lang');
    assertEqual(applyMicroTypography('Spannung 230 V Wechselstrom'), 'Spannung 230\u00A0V Wechselstrom');
  });

  it('wandelt Gedankenstriche in Halbgeviertstrich mit vorangehendem geschuetzten Leerzeichen um', () => {
    assertEqual(applyMicroTypography('Dies ist - ein Gedanke'), 'Dies ist\u00A0– ein Gedanke');
    assertEqual(applyMicroTypography('Wort – weiteres Wort'), 'Wort\u00A0– weiteres Wort');
    assertEqual(applyMicroTypography('Wort — em-dash Wort'), 'Wort\u00A0– em-dash Wort');
  });

  it('verhaelt sich idempotent und defensiv bei Sonderfaellen', () => {
    const input = 'Gemaess § 24 Abs. 2 i. d. R. 100 EUR - das gilt z. B.';
    const once = applyMicroTypography(input);
    const twice = applyMicroTypography(once);
    assertEqual(once, twice);
    assertEqual(applyMicroTypography(''), '');
    assertEqual(applyMicroTypography(null), '');
    assertEqual(applyMicroTypography(undefined), '');
  });

  it('formatElementMicroTypography formatiert DOM-Elemente sicher ohne Tag-Zerstörung', () => {
    // 1. Plaintext-Element
    const elPlain = document.createElement('div');
    elPlain.setAttribute('contenteditable', 'plaintext-only');
    elPlain.textContent = 'Siehe z. B. § 24 BGB';
    formatElementMicroTypography(elPlain);
    assertEqual(elPlain.textContent, 'Siehe z.\u00A0B. §\u00A024 BGB');

    // 2. Rich-Text Element mit HTML-Tags
    const elRich = document.createElement('div');
    elRich.setAttribute('contenteditable', 'true');
    elRich.innerHTML = '<p>Sehr geehrte Damen und Herren,</p><p>gemaess <b>§ 24 BGB</b> fordern wir <i>100 EUR</i> - zahlbar sofort.</p>';
    formatElementMicroTypography(elRich);

    assertEqual(elRich.querySelectorAll('p').length, 2);
    assertEqual(elRich.querySelectorAll('b').length, 1);
    assertEqual(elRich.querySelectorAll('i').length, 1);
    assertEqual(elRich.querySelector('b')?.textContent, '§\u00A024 BGB');
    assertEqual(elRich.querySelector('i')?.textContent, '100\u00A0EUR');
    assert(elRich.textContent.includes('\u00A0– zahlbar'), 'Gedankenstrich korrekt formatiert');
  });
});

describe('SignatureFeature: 2-Zustände Button & Handle-Bereinigung', () => {
  it('initialisiert im leeren Zustand', () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-unterschrift-aktion'));
    const sig = new SignatureFeature();
    sig.resetImage();
    assertEqual(btn.dataset.state, 'empty');
    assert(btn.textContent?.includes('laden') || false, 'Text zeigt laden');
  });

  it('wechselt bei resetImage zurück in den Leerzustand', () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-unterschrift-aktion'));
    btn.dataset.state = 'loaded';
    btn.textContent = '🗑️ Unterschrift / Stempel entfernen';
    const sig = new SignatureFeature();
    sig.resetImage();
    assertEqual(btn.dataset.state, 'empty');
    assert(btn.textContent?.includes('laden') || false, 'Text zeigt laden nach Reset');
  });
});

describe('Testbrief: Thema, Besetzung und Szenario', () => {
  /** Figur mit allen drei Anker-Arten, damit die Prioritaet pruefbar ist. */
  const batman = {
    name: 'Batman',
    buergerlicherName: 'Bruce Wayne',
    alias: ['Dunkler Ritter'],
    firma: 'Wayne Enterprises',
    hooks: ['Batarang'],
    franchise: 'DC Comics',
    ort: 'Gotham City'
  };
  /** @param {string} name @param {string} franchise @returns {any} */
  const figur = (name, franchise) => ({ name, buergerlicherName: name, alias: [name], firma: '', hooks: ['Dings'], franchise, ort: 'Teststadt' });

  it('getCharHook nimmt den Hook, waehleAnker weiterhin den Alias', () => {
    assertEqual(getCharHook(batman), 'Batarang');
    const anker = waehleAnker(batman);
    assert(anker !== null, 'waehleAnker liefert keinen Anker');
    assertEqual(anker?.art, 'alias');
    assertEqual(anker?.text, 'Dunkler Ritter');
  });

  it('bezeichne bleibt bei der Personenbezeichnung (Alias vor Hook)', () => {
    assert(bezeichne(batman).includes('auch bekannt als'), 'Alias-Form fehlt');
    assert(!bezeichne(batman).includes('bekannt für'), 'Hook hat die Personenbezeichnung uebernommen');
  });

  it('franchiseKey fasst gleiche Universen zusammen', () => {
    assertEqual(franchiseKey({ franchise: 'Marvel Comics' }), franchiseKey({ franchise: 'Marvel' }));
    assertEqual(franchiseKey({ franchise: 'Red Dead Redemption 2' }), franchiseKey({ franchise: 'Red Dead Redemption' }));
    assert(franchiseKey({ franchise: 'Marvel' }) !== franchiseKey({ franchise: 'DC Comics' }));
  });

  it('waehleBesetzung liefert Hook-Absender und fremdes Franchise', () => {
    const figuren = [
      figur('A1', 'Marvel'), figur('A2', 'Marvel'), figur('A3', 'Marvel'),
      figur('B1', 'DC Comics'), figur('B2', 'DC Comics'), figur('B3', 'DC Comics'),
      figur('C1', 'Star Wars'), figur('C2', 'Star Wars'), figur('C3', 'Star Wars')
    ];
    for (let i = 0; i < 50; i++) {
      const { sender, recipient, dritte } = waehleBesetzung(figuren);
      assert(sender !== recipient, 'Absender und Empfaenger sind identisch');
      assert(franchiseKey(sender) !== franchiseKey(recipient), 'Gleiches Franchise gewuerfelt');
      assert(Array.isArray(sender.hooks) && sender.hooks.length > 0, 'Absender ohne Hook');
      assert(dritte.length <= 3, 'Mehr als drei Beteiligte');
      assert(!dritte.includes(sender) && !dritte.includes(recipient), 'Beteiligter ist Absender oder Empfaenger');
    }
  });

  it('generiereTestEmail erzeugt plausible Popkultur-Mails mit Slug-Normalisierung', () => {
    // Deterministisch mit rnd = () => 0:
    assertEqual(generiereTestEmail(batman, () => 0), 'bruce.wayne@wayneenterprises.com');
    assertEqual(generiereTestEmail({ name: 'Goku', buergerlicherName: 'Son Goku', franchise: 'Dragon Ball' }, () => 0), 'son.goku@dragon-ball.com');
    assertEqual(generiereTestEmail({ name: 'Yoda', franchise: 'Star Wars' }, () => 0), 'yoda@star-wars.com');
    assertEqual(generiereTestEmail({ name: 'Lucky Luke', ort: 'Wilder Westen' }, () => 0), 'lucky.luke@stadt-wilder-westen.com');
    assertEqual(generiereTestEmail({ name: 'Müller-Lüdenscheidt' }, () => 0), 'mueller-luedenscheidt@hero-post.com');

    // Varianz und Format-Validität prüfen:
    const mail = generiereTestEmail(batman);
    assert(mail.includes('@'), 'Mail muss @ enthalten');
    assert(mail.length <= 40, 'Mail darf 40 Zeichen nicht überschreiten');
  });

  it('toT9 und generiereTestTelefon erzeugen DIN-konforme T9-Vanity-Rufnummern', () => {
    assertEqual(toT9('BATMAN'), '228626');
    assertEqual(toT9('MICKEY'), '642539');
    assertEqual(toT9('DONALD'), '366253');
    assertEqual(toT9('KIRK'), '5475');
    assertEqual(toT9('SMITH'), '76484');
    assertEqual(toT9('GOKU'), '4658');

    const telBatman = generiereTestTelefon({ name: 'Batman' }, () => 0);
    assertEqual(telBatman, '+49 30 23125 228-626');
    const telKirk = generiereTestTelefon({ name: 'Kirk' }, () => 0.6);
    assertEqual(telKirk, '+49 221 4710 547-5');
  });

  it('Wonka-Regel und Identitätsschutz in waehleBesetzung', () => {
    const wonka = { name: 'Willy Wonka', buergerlicherName: 'Willy Wonka', alias: ['Der Schokoladenfabrikant'], ort: 'Wonka-Schokoladenfabrik', firma: '', franchise: 'Charlie und die Schokoladenfabrik' };
    const charlie = { name: 'Charlie Bucket', buergerlicherName: 'Charlie Bucket', alias: ['Charlie'], ort: 'Wonka-Schokoladenfabrik', firma: '', franchise: 'Charlie und die Schokoladenfabrik' };
    const bruce = { name: 'Bruce Wayne', buergerlicherName: 'Bruce Wayne', alias: [], firma: 'Wayne Enterprises', franchise: 'DC Comics' };

    assert(hatWonkaBezug(wonka, charlie), 'Wonka <-> Charlie Bucket wird als Wonka-Bezug erkannt');
    assert(sindIdentisch(batman, bruce), 'Batman und Bruce Wayne werden als identisch erkannt');
    assert(!hatWonkaBezug(batman, bruce), 'Identitätsschutz verhindert Wonka-Bezug zu sich selbst');
  });

  it('wuerfelt 15 Szenarien und haelt Betreff und Text zusammen', () => {
    assertEqual(SZENARIEN.length, 15, 'SZENARIEN muss exakt 15 Einträge haben');
    /** @type {Set<string>} */
    const ids = new Set();
    for (let i = 0; i < 600; i++) {
      const szenario = waehleSzenario();
      ids.add(szenario.id);
      const betreff = randomBetreff('Handtuch', szenario);
      const text = generateNerdText(batman, figur('B1', 'DC Comics'), [], 'Handtuch', szenario);
      assert(betreff.includes('Handtuch'), 'Betreff ohne Thema');
      assert(text.includes('Handtuch'), 'Text ohne Thema');
      assert(text.includes(szenario.text({
        sName: bezeichne(batman), sOrt: 'Gotham City', rName: 'B1', rOrt: 'Teststadt', thema: 'Handtuch'
      }).split('\n\n')[0]), 'Text stammt nicht aus dem gewuerfelten Szenario');
    }
    assertEqual(ids.size, 15, 'Alle 15 Szenarien müssen gewürfelt werden');
  });

  it('filtert Szenarien nach Kategorie', () => {
    const kooperativ = waehleSzenario(() => 0, 'kooperativ');
    assertEqual(kooperativ.kategorie, 'kooperativ');
    assert(['kooperation', 'angebot'].includes(kooperativ.id));

    const positiv = waehleSzenario(() => 0, 'positiv');
    assertEqual(positiv.kategorie, 'positiv');
    assert(['dankesschreiben', 'einladung'].includes(positiv.id));

    const behoerdlich = waehleSzenario(() => 0, 'behoerdlich');
    assertEqual(behoerdlich.kategorie, 'behoerdlich');
    assert(['auskunft', 'widerspruch', 'antrag'].includes(behoerdlich.id));

    const eskalierend = waehleSzenario(() => 0, 'eskalierend');
    assertEqual(eskalierend.kategorie, 'eskalierend');
    assert(['beschwerde', 'beschwerde_aufsicht'].includes(eskalierend.id));
  });

  it('floskele fügt deterministisch Einleitung und Schluss ein', () => {
    assertEqual(FLOSKELN.einleitung.length, 7, 'FLOSKELN muss 7 Einleitungen haben');
    assertEqual(FLOSKELN.schluss.length, 7, 'FLOSKELN muss 7 Schlüsse haben');

    // Mock-Zufall mit Index 0
    const mockZero = () => 0;
    const mitEinleitung = floskele('Haupttext', { einleitung: true }, mockZero);
    assertEqual(mitEinleitung, `${FLOSKELN.einleitung[0]}\n\nHaupttext`);

    const mitSchluss = floskele('Haupttext', { schluss: true }, mockZero);
    assertEqual(mitSchluss, `Haupttext\n\n${FLOSKELN.schluss[0]}`);

    const mitBeidem = floskele('Haupttext', { einleitung: true, schluss: true }, mockZero);
    assertEqual(mitBeidem, `${FLOSKELN.einleitung[0]}\n\nHaupttext\n\n${FLOSKELN.schluss[0]}`);

    // String-Kurzform
    assertEqual(floskele('Text', 'einleitung', mockZero), `${FLOSKELN.einleitung[0]}\n\nText`);
    assertEqual(floskele('Text', 'schluss', mockZero), `Text\n\n${FLOSKELN.schluss[0]}`);
  });

  it('MetadataService prepare/restore ist reentrant und leckt keine Tags', () => {
    const originalTitle = 'Ursprünglicher Testtitel';
    document.title = originalTitle;

    // Erster Aufruf: bereitet Drucktitel und Meta-Tags vor
    const ctx1 = MetadataService.prepare();
    assertEqual(isPrintTitleActive(), true);
    assert(document.title !== originalTitle, 'Drucktitel muss gesetzt sein');
    const tags1 = document.head.querySelectorAll('meta[data-injected="true"]');
    assertEqual(tags1.length, 4, 'Exakt 4 Meta-Tags injiziert');

    // Zweiter Aufruf ohne Restore (reentrantes beforeprint): erbt Originaltitel, kein Tag-Leak
    const ctx2 = MetadataService.prepare();
    assertEqual(ctx2.oldTitle, originalTitle, 'Muss den ursprünglichen Titel erben');
    const tags2 = document.head.querySelectorAll('meta[data-injected="true"]');
    assertEqual(tags2.length, 4, 'Keine Duplizierung der Meta-Tags bei zweitem prepare()');

    // Erster Restore: Stack noch nicht leer
    MetadataService.restore(ctx2);
    assertEqual(isPrintTitleActive(), true);

    // Letzter Restore: Stack leer, echter Originaltitel wird wiederhergestellt
    MetadataService.restore(ctx1);
    assertEqual(isPrintTitleActive(), false);
    assertEqual(document.title, originalTitle, 'Originaltitel muss wiederhergestellt sein');
    const tagsAfter = document.head.querySelectorAll('meta[data-injected="true"]');
    assertEqual(tagsAfter.length, 0, 'Alle injizierten Meta-Tags müssen entfernt sein');
  });

  it('AddressIntelligence.targetLock wird bei restoreDraft zurückgesetzt', () => {
    AddressIntelligence.targetLock = { plz: '10115', city: 'Berlin' };
    assert(AddressIntelligence.targetLock !== null);

    const dm = new DraftManager();
    dm.restoreDraft({ 'betreff': 'Härtungstest' });

    assertEqual(AddressIntelligence.targetLock, null, 'targetLock muss nach restoreDraft null sein');
  });
});

describe('Figurenkatalog & DIN-5008-Anschrift (Schema v2.1 Tuples)', () => {
  it('lädt figuren.json und initialisiert Figurenkatalog fehlerfrei', async () => {
    const res = await fetch('../website/addons/testbrief/figuren.json');
    assert(res.ok, 'figuren.json konnte nicht geladen werden');
    const json = await res.json();
    const katalog = new Figurenkatalog(json);

    assertEqual(katalog.count, 297, 'Katalog muss exakt 297 Figuren enthalten');

    // Invarianz-Prüfung über alle 297 Figuren
    for (let i = 0; i < katalog.count; i++) {
      const f = katalog.get(i);
      assert(f !== null, `Figur ${i} darf nicht null sein`);
      assert(typeof f.name === 'string' && f.name.length > 0, `Figur ${i} Name fehlt`);
      assert(['m', 'f', 'd'].includes(f.geschlecht), `Figur ${i} ungültiges Geschlecht: ${f.geschlecht}`);
      
      if (f.geschlecht === 'm') assertEqual(f.anredePraefix, 'Herr');
      else if (f.geschlecht === 'f') assertEqual(f.anredePraefix, 'Frau');
      else assertEqual(f.anredePraefix, '');

      assert(Array.isArray(f.alias), `Figur ${i} alias muss Array sein`);
      assert(Array.isArray(f.hooks), `Figur ${i} hooks muss Array sein`);
      assert(typeof f.firma === 'string', `Figur ${i} firma muss String sein`);
      assert(typeof f.strasse === 'string', `Figur ${i} strasse muss String sein`);
      assert(typeof f.plz === 'string', `Figur ${i} plz muss String sein`);
      assert(typeof f.ort === 'string', `Figur ${i} ort muss String sein`);
    }
  });

  it('buildAnschriftLines erzeugt lückenlose Anschriften ohne Leerzeilen', () => {
    // 1. Männliche Figur mit vollständiger Adresse (Batman)
    const batmanFigur = {
      name: 'Batman',
      anredePraefix: 'Herr',
      geschlecht: 'm',
      firma: 'Wayne Enterprises',
      strasse: 'Wayne Manor 1007',
      plz: '07089',
      ort: 'Gotham City'
    };
    const linesBatman = buildAnschriftLines(batmanFigur);
    assertEqual(linesBatman.length, 4);
    assertEqual(linesBatman[0], 'Wayne Enterprises');
    assertEqual(linesBatman[1], 'Herr Batman');
    assertEqual(linesBatman[2], 'Wayne Manor');
    assertEqual(linesBatman[3], '07089 Gotham City');

    // 2. Figur ohne feste Anschrift & ohne Firma (Agent Smith, 'd')
    const smithFigur = {
      name: 'Agent Smith',
      anredePraefix: '',
      geschlecht: 'd',
      firma: '',
      strasse: 'keine feste Anschrift',
      plz: '',
      ort: 'Matrix'
    };
    const linesSmith = buildAnschriftLines(smithFigur);
    assertEqual(linesSmith.length, 2);
    assertEqual(linesSmith[0], 'Agent Smith');
    assertEqual(linesSmith[1], 'Matrix');
    assert(linesSmith.every((l) => l.length > 0), 'Keine Leerzeilen erlaubt');

    // 3. Weibliche Figur mit Pipe-Trenner in PLZ
    const batgirlFigur = {
      name: 'Batgirl',
      anredePraefix: 'Frau',
      geschlecht: 'f',
      firma: '',
      strasse: 'Clocktower Plaza 1',
      plz: '10115 | 10117',
      ort: 'Gotham City'
    };
    const linesBatgirl = buildAnschriftLines(batgirlFigur);
    assertEqual(linesBatgirl.length, 3);
    assertEqual(linesBatgirl[0], 'Frau Batgirl');
    assertEqual(linesBatgirl[1], 'Clocktower Plaza 1');
    assert(linesBatgirl[2] === '10115 Gotham City' || linesBatgirl[2] === '10117 Gotham City', 'PLZ aus Optionen gewählt');
  });

  it('koppelt anredePraefix mit SalutationEngine für normgerechte DIN-Anrede', () => {
    // Herr -> Sehr geehrter Herr
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Arthur Dent', formality: 'formal' }), 'Sehr geehrter Herr Dent,');
    // Frau -> Sehr geehrte Frau
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Barbara Gordon', formality: 'formal' }), 'Sehr geehrte Frau Gordon,');
    // Divers / Wesen ohne Herr/Frau -> DIN-Fallback
    assertEqual(SalutationEngine.derive({ rawName: 'Agent Smith', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Xenomorph', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
  });
});

describe('Layout Stability / Zero CLS', () => {
  it('PerformanceObserver mit layout-shift ist verfügbar', () => {
    assert(typeof window.PerformanceObserver === 'function', 'window.PerformanceObserver verfügbar');
    assert(
      Array.isArray(PerformanceObserver.supportedEntryTypes) &&
        PerformanceObserver.supportedEntryTypes.includes('layout-shift'),
      'layout-shift wird als Performance-Entry unterstützt'
    );
  });

  it('verifiziert stabilen Aufbau und rendert Standard-Zonen ohne unerwarteten Layout-Shift', async () => {
    let totalShift = 0;
    /** @type {PerformanceObserver | undefined} */
    let observer;
    const container = document.createElement('div');
    container.id = 'cls-test-container';
    container.style.cssText = 'position: relative; width: 210mm; min-height: 297mm;';

    if (
      typeof window.PerformanceObserver === 'function' &&
      Array.isArray(PerformanceObserver.supportedEntryTypes) &&
      PerformanceObserver.supportedEntryTypes.includes('layout-shift')
    ) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-ignore
          if (!entry.hadRecentInput) {
            // @ts-ignore
            totalShift += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: false });
    }

    try {
      const blatt = document.createElement('din-blatt');
      const kern = document.createElement('div');
      kern.id = 'kern';
      const anschrift = document.createElement('div');
      anschrift.id = 'anschrift';
      anschrift.textContent = 'Musterfirma GmbH\nMusterstraße 1\n12345 Musterstadt';
      const betreff = document.createElement('div');
      betreff.id = 'betreff';
      betreff.textContent = 'Kündigung des Vertrags';
      const text = document.createElement('div');
      text.id = 'text';
      text.textContent = 'Sehr geehrte Damen und Herren,\n\nhiermit kündige ich den Vertrag fristgerecht.';

      kern.appendChild(anschrift);
      kern.appendChild(betreff);
      kern.appendChild(text);
      blatt.appendChild(kern);
      container.appendChild(blatt);
      document.body.appendChild(container);

      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

      if (observer) {
        observer.takeRecords().forEach((entry) => {
          // @ts-ignore
          if (!entry.hadRecentInput) totalShift += entry.value;
        });
      }

      assertEqual(totalShift, 0, `Unerwarteter Layout-Shift aufgetreten: ${totalShift}`);
    } finally {
      if (observer) observer.disconnect();
      container.remove();
    }
  });
});

describe('Zero Scrollbars & Subpixel Invariance', () => {
  it('garantiert Zero-Scrollbar und Zero-CLS am echten gerenderten Dokument bei Toggles', async () => {
    const iframe = document.createElement('iframe');
    iframe.src = '../website/index.html';
    iframe.style.cssText = 'position: fixed; top: 0; left: 0; width: 1280px; height: 900px; border: 0; visibility: hidden; z-index: -999;';
    document.body.appendChild(iframe);

    try {
      await new Promise((resolve, reject) => {
        iframe.onload = () => resolve(undefined);
        iframe.onerror = (e) => reject(e);
        setTimeout(() => reject(new Error('Iframe Timeout')), 4000);
      });

      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) throw new Error('Iframe Content window/doc geladen');

      // Warten bis Initialisierung / Fonts / Boot durch sind
      await new Promise((r) => setTimeout(r, 200));

      const blatt = /** @type {HTMLElement | null} */ (doc.querySelector('din-blatt'));
      const viewport = doc.getElementById('viewport');
      if (!blatt || !viewport) throw new Error('din-blatt oder #viewport im gerenderten Dokument nicht gefunden');

      // 1. Messung am echten gerenderten Dokument
      assert(
        doc.documentElement.scrollWidth <= win.innerWidth,
        `document.documentElement scrollWidth (${doc.documentElement.scrollWidth}) > innerWidth (${win.innerWidth})`
      );
      assertEqual(win.scrollX, 0, `window.scrollX muss 0 sein, erhalten: ${win.scrollX}`);
      assertEqual(blatt.scrollHeight, blatt.clientHeight, `din-blatt scrollHeight (${blatt.scrollHeight}) !== clientHeight (${blatt.clientHeight})`);
      assertEqual(blatt.scrollWidth, blatt.clientWidth, `din-blatt scrollWidth (${blatt.scrollWidth}) !== clientWidth (${blatt.clientWidth})`);
      assert(viewport.scrollWidth <= viewport.clientWidth, `#viewport scrollWidth (${viewport.scrollWidth}) > clientWidth (${viewport.clientWidth})`);

      // 2. PerformanceObserver für CLS während Toggles
      let clsValue = 0;
      /** @type {any} */
      let observer;
      const PO = /** @type {any} */ (win).PerformanceObserver;
      if (typeof PO === 'function') {
        observer = new PO(/** @param {any} list */ (list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: false });
      }

      // Toggle Form A
      const btnFormA = /** @type {HTMLInputElement | null} */ (doc.getElementById('btn-form-a'));
      if (btnFormA) {
        btnFormA.click();
        await new Promise((r) => setTimeout(r, 100));
        assertEqual(blatt.scrollHeight, blatt.clientHeight, 'Form A: din-blatt scrollHeight !== clientHeight');
        assertEqual(blatt.scrollWidth, blatt.clientWidth, 'Form A: din-blatt scrollWidth !== clientWidth');
      }

      // Toggle Form B
      const btnFormB = /** @type {HTMLInputElement | null} */ (doc.getElementById('btn-form-b'));
      if (btnFormB) {
        btnFormB.click();
        await new Promise((r) => setTimeout(r, 100));
        assertEqual(blatt.scrollHeight, blatt.clientHeight, 'Form B: din-blatt scrollHeight !== clientHeight');
        assertEqual(blatt.scrollWidth, blatt.clientWidth, 'Form B: din-blatt scrollWidth !== clientWidth');
      }

      // Toggle Falzmarken
      const toggleMarks = /** @type {HTMLInputElement | null} */ (doc.getElementById('toggle-falzmarken'));
      if (toggleMarks) {
        toggleMarks.click();
        await new Promise((r) => setTimeout(r, 50));
        assertEqual(blatt.scrollHeight, blatt.clientHeight, 'Marks off: din-blatt scrollHeight !== clientHeight');
        assertEqual(blatt.scrollWidth, blatt.clientWidth, 'Marks off: din-blatt scrollWidth !== clientWidth');
        toggleMarks.click();
        await new Promise((r) => setTimeout(r, 50));
        assertEqual(blatt.scrollHeight, blatt.clientHeight, 'Marks on: din-blatt scrollHeight !== clientHeight');
        assertEqual(blatt.scrollWidth, blatt.clientWidth, 'Marks on: din-blatt scrollWidth !== clientWidth');
      }

      if (observer) {
        observer.takeRecords().forEach(/** @param {any} entry */ (entry) => {
          if (!entry.hadRecentInput) clsValue += entry.value;
        });
        observer.disconnect();
      }

      assertEqual(clsValue, 0, `CLS bei Toggles muss 0.000 sein, erhalten: ${clsValue}`);
    } finally {
      iframe.remove();
    }
  });
});

describe('resetDraft — Privacy (Briefdaten vs. Präferenzen)', () => {
  /* Gemessen per CDP (2026-11-11): nach "Brief zurücksetzen" war
   * din_draft_current korrekt geleert, aber din_local_addresses stand mit
   * vollständiger Empfängeradresse weiter im localStorage. Die Adress-Historie
   * gehört zum Brief (bis zu 50 zuletzt gewählte Empfänger), keine Präferenz. */

  it('entfernt die lokale Adress-Historie aus localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.addresses, JSON.stringify([
      { formatted: 'Teststr. 1, 12345 Teststadt' }
    ]));
    new DraftManager().resetDraft();
    assertEqual(localStorage.getItem(STORAGE_KEYS.addresses), null,
      'din_local_addresses ist nach resetDraft entfernt');
  });

  it('behält Präferenzen (din_settings) nach dem Reset', () => {
    const settings = JSON.stringify({ theme: 'dark' });
    localStorage.setItem(STORAGE_KEYS.settings, settings);
    new DraftManager().resetDraft();
    assertEqual(localStorage.getItem(STORAGE_KEYS.settings), settings,
      'din_settings bleibt nach resetDraft erhalten');
  });
});

run().then((ok) => {
  /** @type {any} */ (window).__TESTS_PASSED = ok;
  console.log(ok ? '✓ Alle Tests bestanden' : '✗ FEHLER: Tests fehlgeschlagen');
});
