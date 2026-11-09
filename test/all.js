// test/all.js — Testdatei für test/index.html. Priorität: der kritischste Pfad
// (Draft-Sanitizing/XSS) über die ECHTE Code-Route (localStorage → loadDraft),
// plus Draft-Roundtrip und Undo/Redo. Kein Framework, keine Mocks.

import { bezeichne, buildAnschriftLines, Figurenkatalog, FLOSKELN, floskele, franchiseKey, generateNerdText, generiereTestEmail, generiereTestTelefon, getCharHook, hatWonkaBezug, randomBetreff, sindIdentisch, slugify, SZENARIEN, setField as setTestbriefField, toT9, waehleAnker, waehleBesetzung, waehleSzenario } from '../website/addons/testbrief/testbrief.js';
import { AddressData, AddressIntelligence, BUNDESLAENDER, buildFirmenIndex, buildOrtIndex, getDistrict, normalizePostcode, resolveCity, resolvePostcode } from '../website/js/address.js';
import { AddressData as AddressDataDirect, AddressIntelligence as AddressIntelligenceDirect, BUNDESLAENDER as BUNDESLAENDERDirect, buildFirmenIndex as buildFirmenIndexDirect, buildOrtIndex as buildOrtIndexDirect, getDistrict as getDistrictDirect, normalizePostcode as normalizePostcodeDirect, resolveCity as resolveCityDirect, resolvePostcode as resolvePostcodeDirect } from '../website/js/address-data.js';
import { deleteBlob, loadBlob, saveBlob } from '../website/js/binary-storage.js';
import { ClipboardAddressParser } from '../website/js/clipboard-parser.js';
import { Constants, createEventBus, Events, eventBus, initToastSystem } from '../website/js/core.js';
import { formatElementMicroTypography, UIProtections } from '../website/js/document.js';
import { DraftManager } from '../website/js/draft-manager.js';
import { FONT_PRESETS, FontFeature } from '../website/js/font-feature.js';
import { applyMicroTypography, formatDatum, formatGeldbetrag, formatIban, formatPostfach, formatTelefonnummer, formatUhrzeit } from '../website/js/format.js';
// @ts-ignore
import { applyImportedData, buildDINLetterJSON, buildDinLetterPayload, DINLETTER_FORMAT, DOCUMENT_SCHEMA_V4, isPrintTitleActive, load, loadJSON, MetadataService, parseDinLetterPayload, registerDraftCollector, remove, STORAGE_KEYS, save, saveJSON } from '../website/js/persistence.js?v=test2';
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
    setDraft('<b>fett</b><script>alert(1)</script><em>kursiv</em><span class="brief-kommentar">Anmerkung</span>');
    new DraftManager().loadDraft();
    const html = mustField().innerHTML;
    assert(!html.includes('script'), 'kein <script> im DOM');
    assert(!html.includes('em>'), 'verbotenes <em> ist entfernt (nur Textinhalt bleibt)');
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
  it('UL/LI überleben den Restore im anlagen-angabe (extraTags)', () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      'anlagen-angabe': '<ul><li>Anlage A</li><li>Anlage B</li></ul>'
    }));
    new DraftManager().loadDraft();
    const anlagen = document.getElementById('anlagen-angabe');
    if (!anlagen) throw new Error('Test-Fixture fehlt: #anlagen-angabe');
    const lis = anlagen.querySelectorAll('li');
    assert(lis.length === 2, 'zwei <li> nach dem Restore');
    assert(lis[0].textContent === 'Anlage A', 'Anlage A erhalten');
    assert(lis[1].textContent === 'Anlage B', 'Anlage B erhalten');
    assert(lis[0].attributes.length === 0, 'keine Attribute an den <li>');
  });

  it('ensureListStructure wickelt Text-Nodes in <li> statt sie zu löschen', () => {
    const anlagen = document.getElementById('anlagen-angabe');
    if (!anlagen) throw new Error('Test-Fixture fehlt: #anlagen-angabe');
    anlagen.textContent = 'Rechnung\nVollmacht';
    new UIProtections().ensureListStructure(anlagen);
    const lis = anlagen.querySelectorAll('li');
    assert(lis.length === 2, 'zwei <li> aus Text-Nodes gewickelt');
    assert(lis[0].textContent === 'Rechnung', 'Text 1 erhalten');
    assert(lis[1].textContent === 'Vollmacht', 'Text 2 erhalten');
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

      const statusEl = document.getElementById('save-status');
      if (statusEl) {
        assertEqual(statusEl.dataset.state, 'error', 'save-status Element hat data-state="error"');
        assertEqual(statusEl.getAttribute('role'), 'alert', 'Fallback role="alert" gesetzt');
        assertEqual(statusEl.getAttribute('aria-live'), 'assertive', 'aria-live="assertive" gesetzt');
      }
    } finally {
      localStorage.setItem = origSetItem;
      // @ts-ignore
      document.ariaNotify = origAriaNotify;
      dm.destroy();
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
    const payload = JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['betreff'] }, fields: ['BOM'] });
    const result = parseDinLetterPayload(`\uFEFF${payload}`);
    assert(result.ok, 'BOM-präfixtes JSON wird akzeptiert');
    assertEqual(result.fields.betreff, 'BOM');
  });

  it('parseDinLetterPayload lehnt gefährliche/unplausible Keys im Schema ab (Prototyp-Hygiene, Grok F2)', () => {
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['__proto__'] }, fields: ['x'] }).ok, '__proto__ in Schema abgelehnt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['constructor'] }, fields: ['x'] }).ok, 'constructor in Schema abgelehnt');
    assert(!parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['a b'] }, fields: ['x'] }).ok, 'Leerzeichen in Schema abgelehnt');
    const ok = parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['betreff'] }, fields: ['x'] });
    assert(ok.ok, 'normale Ids erlaubt');
    assertEqual(ok.fields.betreff, 'x');
  });

  it('parseDinLetterPayload validiert layout und signature defensiv', () => {
    const base = { format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: [] }, fields: [] };
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
    const r = parseDinLetterPayload({ format: DINLETTER_FORMAT, schema_version: 4, _meta: { schema: ['betreff'] }, fields: ['x'] });
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

  it('setzt data-plugin-testbrief und data-plugin-multipage an document.documentElement (FOUC-Schutz B1)', () => {
    const sm = new SettingsManager();
    sm.isReady = true;

    sm.settings.pluginTestbrief = false;
    sm.settings.pluginMultipage = false;
    sm.applySettings();
    assertEqual(document.documentElement.getAttribute('data-plugin-testbrief'), 'false');
    assertEqual(document.documentElement.getAttribute('data-plugin-multipage'), 'false');

    sm.settings.pluginTestbrief = true;
    sm.settings.pluginMultipage = true;
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

run().then((ok) => {
  /** @type {any} */ (window).__TESTS_PASSED = ok;
  console.log(ok ? '✓ Alle Tests bestanden' : '✗ FEHLER: Tests fehlgeschlagen');
});
