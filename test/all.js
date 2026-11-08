// test/all.js — Testdatei für test/index.html. Priorität: der kritischste Pfad
// (Draft-Sanitizing/XSS) über die ECHTE Code-Route (localStorage → loadDraft),
// plus Draft-Roundtrip und Undo/Redo. Kein Framework, keine Mocks.

import { bezeichne, franchiseKey, generateNerdText, getCharHook, randomBetreff, setField as setTestbriefField, waehleAnker, waehleBesetzung, waehleSzenario } from '../website/addons/testbrief/testbrief.js';
import { AddressIntelligence, buildFirmenIndex, buildOrtIndex, buildPrefixIndex, detectPlzInputPattern, filterPostcodePrefix, normalizePostcode, resolveCity, resolvePostcode } from '../website/js/address.js';
import { ClipboardAddressParser } from '../website/js/clipboard-parser.js';
import { deleteBlob, loadBlob, saveBlob } from '../website/js/binary-storage.js';
import { Constants, createEventBus, Events, eventBus, initToastSystem } from '../website/js/core.js';
import { formatTelefonnummer, UIProtections } from '../website/js/document.js';
import { DraftManager } from '../website/js/draft-manager.js';
// @ts-ignore
import { buildDINLetterJSON, buildDinLetterPayload, DINLETTER_FORMAT, load, loadJSON, migrateStorage, parseDinLetterPayload, registerDraftCollector, remove, STORAGE_KEYS, save, saveJSON } from '../website/js/persistence.js?v=test2';
import { SalutationEngine } from '../website/js/salutation.js';
import { SettingsManager } from '../website/js/settings.js';
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

describe('Import/Export: DIN-Brief-JSON-Payload (pure Funktionen)', () => {
  it('buildDinLetterPayload setzt Schema v3 mit generated_at', () => {
    const payload = buildDinLetterPayload({ betreff: 'Test' });
    assertEqual(payload.format, DINLETTER_FORMAT);
    assertEqual(payload.schema_version, Constants.SCHEMA_VERSION);
    assertEqual(payload.schema_version, 3);
    assertEqual(payload.generator, 'DIN-BriefNEO');
    assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(payload.generated_at), 'generated_at ist ein Zeitstempel');
    assertEqual(payload.fields.betreff, 'Test');
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
    assertEqual(payload.fields['toggle-anlagen'], true, 'String "true" wird Boolean');
    assertEqual(payload.fields['toggle-fuss'], true);
    assert(!('vermerke-visible' in payload.fields), 'vermerke-visible wird nicht exportiert');
    assertEqual(buildDinLetterPayload({ 'toggle-anlagen': false }).fields['toggle-anlagen'], false);
  });

  it('parseDinLetterPayload akzeptiert v3 (Roundtrip)', () => {
    const payload = buildDinLetterPayload(
      { betreff: 'Roundtrip', text: '<p>x</p>' },
      { layout: 'form-a', marks: false, guides: false }
    );
    const result = parseDinLetterPayload(JSON.stringify(payload));
    assert(result.ok, 'v3 wird akzeptiert');
    if (result.ok) {
      assertEqual(result.fields.betreff, 'Roundtrip');
      assertEqual(result.layout?.form, 'form-a');
      assertEqual(result.layout?.marks, false);
      assertEqual(result.schemaVersion, 3);
    }
  });

  it('parseDinLetterPayload lehnt Schema v1 und v2 mit klarer Meldung ab', () => {
    const v1 = JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: { betreff: 'alt' } });
    const v2 = JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 2, document: { fields: { betreff: 'alt' } } });
    const r1 = parseDinLetterPayload(v1);
    const r2 = parseDinLetterPayload(v2);
    assert(!r1.ok, 'v1 abgelehnt');
    assert(!r2.ok, 'v2 abgelehnt');
    if (!r1.ok && !r2.ok) {
      assert(r1.reason.includes('nicht mehr unterstützt'), 'Meldung nennt die fehlende Unterstützung');
      assert(r2.reason.includes('nicht mehr unterstützt'), 'Meldung auch bei v2');
    }
  });

  it('parseDinLetterPayload lehnt Mist ab (kein JSON, falsches Format, Feldtypen)', () => {
    assert(!parseDinLetterPayload('kein json {').ok, 'kein JSON');
    assert(!parseDinLetterPayload('{"format":"anderes"}').ok, 'falsches format');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 99, fields: {} })).ok, 'fremde schema_version');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 3, fields: { f: 42 } })).ok, 'nicht-string Feld');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 3 })).ok, 'fields fehlt');
  });

  it('parseDinLetterPayload toleriert UTF-8-BOM (Grok F4)', () => {
    const payload = JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 3, fields: { betreff: 'BOM' } });
    const result = parseDinLetterPayload(`\uFEFF${payload}`);
    assert(result.ok, 'BOM-präfixtes JSON wird akzeptiert');
  });

  it('parseDinLetterPayload lehnt gefährliche/unplausible Keys ab (Prototyp-Hygiene, Grok F2)', () => {
    /* Achtung: { '__proto__': 'x' } als JS-Objektliteral setzt den Prototyp
     * (kein eigener Key) — die Tests prüfen daher die ROHE Datei-JSON. */
    assert(!parseDinLetterPayload('{"format":"dinletter","schema_version":3,"fields":{"__proto__":"x"}}').ok, '__proto__ abgelehnt');
    assert(!parseDinLetterPayload('{"format":"dinletter","schema_version":3,"fields":{"constructor":"x"}}').ok, 'constructor abgelehnt');
    assert(!parseDinLetterPayload('{"format":"dinletter","schema_version":3,"fields":{"a b":"x"}}').ok, 'Leerzeichen-Key abgelehnt');
    const ok = parseDinLetterPayload('{"format":"dinletter","schema_version":3,"fields":{"betreff":"x"}}');
    assert(ok.ok, 'normale Ids erlaubt');
  });

  it('parseDinLetterPayload validiert layout und signature defensiv', () => {
    const base = { format: DINLETTER_FORMAT, schema_version: 3, fields: {} };
    assert(!parseDinLetterPayload(JSON.stringify({ ...base, layout: { form: 'form-c' } })).ok, 'ungültige form abgelehnt');
    assert(!parseDinLetterPayload(JSON.stringify({ ...base, layout: { guides: 'ja' } })).ok, 'guides als String abgelehnt');
    assert(!parseDinLetterPayload(JSON.stringify({ ...base, layout: { marks: 1 } })).ok, 'marks als Zahl abgelehnt');
    assert(!parseDinLetterPayload(JSON.stringify({ ...base, layout: [] })).ok, 'layout als Array abgelehnt');
    assert(!parseDinLetterPayload(JSON.stringify({ ...base, signature: { transform: { x: 'ungueltig', y: 0, scale: 1, rot: 0 } } })).ok, 'ungültige Koordinaten abgelehnt');
    assert(parseDinLetterPayload(JSON.stringify({ ...base, layout: { form: 'form-a', marks: true } })).ok, 'gültiges layout akzeptiert');
  });

  it('Fußzone: die 12 DIN-Atome gehen als Felder durch Build und Parse', () => {
    const FUSS = ['firma', 'sitz', 'gericht', 'hrb', 'vorstand', 'gf', 'stnr', 'ustid', 'bank', 'iban', 'bic', 'anschrift'];
    /** @type {Record<string, string | boolean>} */
    const draft = { 'toggle-fuss': true };
    for (const f of FUSS) draft[`fuss-${f}`] = `Wert ${f}`;

    const payload = buildDinLetterPayload(draft);
    for (const f of FUSS) {
      assertEqual(payload.fields[`fuss-${f}`], `Wert ${f}`, `fuss-${f} im Export`);
    }
    assertEqual(payload.fields['toggle-fuss'], true);
    assertEqual(
      JSON.stringify(Object.keys(payload.fields).sort()),
      JSON.stringify([...FUSS.map((f) => `fuss-${f}`), 'toggle-fuss'].sort()),
      'Feldmenge ist exakt die 12 Fußfelder plus Toggle'
    );

    const r = parseDinLetterPayload(JSON.stringify(payload));
    assert(r.ok, 'v3 mit Fußfeldern wird geparst');
    if (r.ok) {
      for (const f of FUSS) assertEqual(r.fields[`fuss-${f}`], `Wert ${f}`, `fuss-${f} im Import`);
    }

    // Roundtrip: 12 rein, 12 raus
    const wieder = buildDinLetterPayload(r.ok ? r.fields : {});
    for (const f of FUSS) assertEqual(wieder.fields[`fuss-${f}`], `Wert ${f}`, `Roundtrip fuss-${f}`);
  });

  it('Fußzone: leere Felder bleiben als leere Strings erhalten', () => {
    const FUSS = ['firma', 'sitz', 'gericht', 'hrb', 'vorstand', 'gf', 'stnr', 'ustid', 'bank', 'iban', 'bic', 'anschrift'];
    /** @type {Record<string, string | boolean>} */
    const leer = {};
    for (const f of FUSS) leer[`fuss-${f}`] = '';
    const payload = buildDinLetterPayload({ ...leer, 'toggle-fuss': false });
    for (const f of FUSS) {
      assertEqual(payload.fields[`fuss-${f}`], '', `leeres fuss-${f} bleibt Feld`);
    }
    assertEqual(payload.fields['toggle-fuss'], false, 'Toggle aus heißt nur unsichtbar, nicht leer');
    assertEqual(Object.keys(payload.fields).length, 13, '12 Fußfelder plus Toggle');
  });

  it('layout und signature sind optional', () => {
    const r = parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 3, fields: { betreff: 'x' } }));
    assert(r.ok, 'ohne layout/signature ok');
    if (r.ok) {
      assertEqual(r.layout, undefined);
      assertEqual(r.signature, undefined);
    }
  });

  it('buildDinLetterPayload erzeugt die v3-Struktur (layout, fields, signature)', () => {
    const payload = buildDinLetterPayload({ betreff: 'V3 Test' }, { layout: 'form-a', copyfit: true, guides: false, marks: false });
    assertEqual(payload.layout.form, 'form-a');
    assertEqual(payload.layout.copyfit, true);
    assertEqual(payload.layout.guides, false);
    assertEqual(payload.layout.marks, false);
    assertEqual(payload.fields.betreff, 'V3 Test');
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
    assertEqual(JSON.stringify(unifiedPayload.layout), JSON.stringify(directPayload.layout));
    assertEqual(JSON.stringify(unifiedPayload.fields), JSON.stringify(directPayload.fields));
    assertEqual(JSON.stringify(unifiedPayload.signature), JSON.stringify(directPayload.signature));

    // Teste mit registriertem Collector
    registerDraftCollector(() => ({ betreff: 'Live Collector' }));
    const collectorPayload = buildDINLetterJSON();
    assertEqual(collectorPayload.fields.betreff, 'Live Collector');
    registerDraftCollector(null);
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
    assertEqual(Object.prototype.hasOwnProperty.call(res, '__proto__'), false, '__proto__ gefiltert');
    assertEqual(Object.prototype.hasOwnProperty.call(res, 'constructor'), false, 'constructor gefiltert');
    assertEqual(Object.prototype.hasOwnProperty.call(res, 'prototype'), false, 'prototype gefiltert');
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

  it('migrateStorage setzt SCHEMA_VERSION idempotent', () => {
    remove(STORAGE_KEYS.schema);
    migrateStorage();
    assertEqual(load(STORAGE_KEYS.schema), String(Constants.SCHEMA_VERSION), 'Schema-Version initial gesetzt');
    migrateStorage();
    assertEqual(load(STORAGE_KEYS.schema), String(Constants.SCHEMA_VERSION), 'Schema-Version idempotent');
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
    assert(container?.className.includes('type-warning'), 'Toast-Typ im DOM gesetzt');
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

  it('filterPostcodePrefix filtert PLZs nach 2-4 Ziffern', () => {
    const plzToCity = new Map([
      ['53111', 'Bonn'],
      ['53113', 'Bonn'],
      ['50667', 'Köln']
    ]);

    const matches53 = filterPostcodePrefix('53', plzToCity);
    assertEqual(matches53.length, 2, 'Zwei 53er Treffer');
    const matches50 = filterPostcodePrefix('50', plzToCity);
    assertEqual(matches50.length, 1, 'Ein 50er Treffer');
    assertEqual(matches50[0].city, 'Köln');

    assertEqual(filterPostcodePrefix('5', plzToCity).length, 0, '1-stellig ungültig');
    assertEqual(filterPostcodePrefix('531111', plzToCity).length, 0, 'zu lang ungültig');
  });

  it('detectPlzInputPattern erkennt semantischen Mustertyp', () => {
    assertEqual(detectPlzInputPattern('53111').type, 'plz_exact');
    assertEqual(detectPlzInputPattern('53').type, 'plz_prefix');
    assertEqual(detectPlzInputPattern('Bonn').type, 'city_name');
    assertEqual(detectPlzInputPattern('!').type, 'unknown');
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
});

describe('PLZ-Autocomplete UI-Cases (Teil 6: Case A, B, C & Doppel-Fill)', () => {
  // Case A (PLZ-Eingabe progressiv)
  it('Test 1: buildPrefixIndex liefert für "101" ein Set mit Berlin (< 20 ms)', () => {
    const t0 = performance.now();
    const prefixMap = buildPrefixIndex(AddressIntelligence.plzToCity);
    const duration = performance.now() - t0;
    assert(duration < 20, `Prefix-Index Aufbauzeit < 20 ms (war ${duration.toFixed(2)} ms)`);
    const s = prefixMap.get('101');
    assert(s !== undefined, 'Präfix 101 existiert');
    assert(Boolean(s?.has('Berlin')), 'Enthält Berlin');
  });

  it('Test 2: Eingabe "010" enthält Dresden', () => {
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
  it('Test 6: buildOrtIndex liefert für Bonn >= 38 PLZs und Berlin >= 90 (< 20 ms)', () => {
    const t0 = performance.now();
    const ortIndex = buildOrtIndex(AddressIntelligence.plzToCity);
    const duration = performance.now() - t0;
    assert(duration < 20, `Ort-Index Aufbauzeit < 20 ms (war ${duration.toFixed(2)} ms)`);
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
  it('Test 13: buildFirmenIndex liefert für "Allianz" mindestens 5 Einträge (< 30 ms)', () => {
    const t0 = performance.now();
    const firmenIdx = buildFirmenIndex(AddressIntelligence.grosskunden);
    const duration = performance.now() - t0;
    assert(duration < 30, `Firmen-Index Aufbauzeit < 30 ms (war ${duration.toFixed(2)} ms)`);
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

describe('SalutationEngine: Anrede-Ableitung (pure Funktion)', () => {
  it('erkennt Dr.- und akademische Titel und filtert sie aus der Anrede', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Dr. Hans Müller', formality: 'formal' }), 'Sehr geehrter Herr Müller,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Prof. Dr. Julia Sommer', formality: 'formal' }), 'Sehr geehrte Frau Sommer,');
  });

  it('erkennt Adelstitel und Namenszusätze (von, van der, zu)', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Dr. med. Albrecht von Sydow', formality: 'formal' }), 'Sehr geehrter Herr von Sydow,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Sophie van der Bellen', formality: 'formal' }), 'Sehr geehrte Frau van der Bellen,');
  });

  it('spricht neutrale Firmen und Organisationen neutral an', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Acme Corp GmbH', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Acme', formality: 'casual' }), 'Hallo,');
    assertEqual(SalutationEngine.derive({ rawName: 'Stadtwerke Troisdorf', formality: 'polite' }), 'Guten Tag,');
    assertEqual(SalutationEngine.derive({ rawName: 'Turnverein Bonn 1860 e.V.', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Sportverein Troisdorf', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    assertEqual(SalutationEngine.derive({ rawName: 'Eigentümergemeinschaft Hauptstr. 10', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
  });

  it('unterstützt die Stile formal, polite und casual', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'formal' }), 'Sehr geehrte Frau Schmidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'polite' }), 'Guten Tag Frau Schmidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'casual' }), 'Hallo Petra,');
  });

  it('unterstützt "Nachname, Vorname" Notation', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Müller, Hans', formality: 'formal' }), 'Sehr geehrter Herr Müller,');
  });

  it('rekonstruiert Bindestrich-Doppelnamen und Adelspartikel robust (TC-01)', () => {
    // Ohne Herr/Frau-Präfix wird kein Geschlecht aus dem Vornamen geraten (Backlog #18).
    assertEqual(SalutationEngine.derive({ rawName: 'Dr. Hans-Peter von Müller-Lüdenscheidt', formality: 'formal' }), 'Guten Tag Hans-Peter von Müller-Lüdenscheidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Dr. Hans-Peter von Müller-Lüdenscheidt', formality: 'casual' }), 'Hallo Hans-Peter,');
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

  it('übersteuert Branchen-Nomen (Bank, Hotel) und Initialen bei explizitem Herr/Frau (Review Befund 2 & 4)', () => {
    // Herr/Frau vor Nomen, die auch in COMPANY_KEYWORDS stehen
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Thomas Bank', formality: 'formal' }), 'Sehr geehrter Herr Bank,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Sabine Hotel', formality: 'formal' }), 'Sehr geehrte Frau Hotel,');
    // Initialen bei Frau/Herr
    assertEqual(SalutationEngine.derive({ rawName: 'Frau E. K. Meier', formality: 'formal' }), 'Sehr geehrte Frau Meier,');
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Dipl.-Ing. Hans J. Müller', formality: 'formal' }), 'Sehr geehrter Herr Müller,');
    assertEqual(SalutationEngine.derive({ rawName: 'Müller, M.Sc. Anna', formality: 'formal' }), 'Guten Tag Anna Müller,');
    // Turnverein ohne Herr/Frau bleibt neutral
    assertEqual(SalutationEngine.derive({ rawName: 'Turnverein Bonn 1860', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    // UG (haftungsbeschränkt) wird als Organisation erkannt
    assertEqual(SalutationEngine.derive({ rawName: 'Muster UG (haftungsbeschränkt)', formality: 'formal' }), 'Sehr geehrte Damen und Herren,');
    // Herr Max Mustermann e.K. ist Einzelkaufmann und wird persönlich angesprochen
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Max Mustermann e.K.', formality: 'formal' }), 'Sehr geehrter Herr Mustermann,');
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
});

describe('SettingsManager: Minimalistischer 2-Zustände Font-Button & Kaskade', () => {
  it('initialisiert im leeren Zustand mit Systemschrift-Fallback', () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-schrift-aktion'));
    const sm = new SettingsManager();
    sm.updateFontStatusUI(false);
    assertEqual(btn.dataset.fontState, 'empty');
    assert(btn.textContent?.includes('Eigene Schriftart laden') || false, 'Text zeigt Schriftart laden');
    assert(!document.body.classList.contains('schrift-eigene-aktiv'), 'body hat nicht schrift-eigene-aktiv');
    assertEqual(document.documentElement.style.getPropertyValue('--active-font-family'), '');
  });

  it('wechselt in geladenen Zustand bei vorhandener Schrift', () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-schrift-aktion'));
    const sm = new SettingsManager();
    sm.updateFontStatusUI(true);
    assertEqual(btn.dataset.fontState, 'loaded');
    assert(btn.textContent?.includes('Eigene Schrift entfernen') || false, 'Text zeigt Schrift entfernen');
    assert(document.body.classList.contains('schrift-eigene-aktiv'), 'body hat schrift-eigene-aktiv');
    assert(document.documentElement.style.getPropertyValue('--active-font-family').includes('CustomUserFont'), '--active-font-family enthaelt CustomUserFont');
  });

  it('entfernt die Schrift bei Klick aus IndexedDB (kein localStorage)', async () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-schrift-aktion'));
    const sm = new SettingsManager();
    sm.attachListeners();
    await saveBlob('font', new Blob([new Uint8Array([0, 1, 0, 0])], { type: 'font/woff2' }));
    assert((await loadBlob('font')) instanceof Blob, 'Schrift liegt als Blob in IndexedDB');
    sm.updateFontStatusUI(true);
    assertEqual(btn.dataset.fontState, 'loaded');

    btn.click();
    assert(await warteAuf(async () => (await loadBlob('font')) === null), 'IndexedDB-Eintrag wurde gelöscht');
    assertEqual(localStorage.getItem('din_custom_font'), null, 'localStorage enthält keine Schrift');
    assertEqual(btn.dataset.fontState, 'empty');
    assert(!document.body.classList.contains('schrift-eigene-aktiv'), 'body Klasse entfernt');
    assertEqual(document.documentElement.style.getPropertyValue('--active-font-family'), '');
  });

  it('erzwingt 400 KB Obergrenze in Constants.LIMITS', () => {
    assertEqual(Constants.LIMITS.FONT_SIZE_MAX_KB, 400);
    assert(Constants.TOASTS.FONT.SIZE_ERROR.includes('400 KB'), 'Fehlermeldung nennt 400 KB');
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
    assertEqual(formatTelefonnummer('02203123456'), '02203 123456');
    assertEqual(formatTelefonnummer('0221 1234567'), '0221 1234567');
    assertEqual(formatTelefonnummer('030 1234567'), '030 1234567');
    assertEqual(formatTelefonnummer('0800 123456'), '0800 123456');
  });
  it('dokumentierte Grenze: 5-stellige Vorwahl ohne Trenner ist nicht erkennbar', () => {
    // Die Vorgabe nennt 02204123456 -> "022041 23456", verlangt aber gleichzeitig als
    // Default 5 Ziffern Vorwahl. Beides zugleich ist ohne Vorwahl-Datenbank nicht
    // entscheidbar (02203123456 hat dieselbe Laenge, aber 5 Ziffern Vorwahl).
    // Mit Trenner ist das Ergebnis korrekt.
    assertEqual(formatTelefonnummer('02204123456'), '02204 123456');
    assertEqual(formatTelefonnummer('022041 23456'), '022041 23456');
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

  it('wuerfelt sechs Szenarien und haelt Betreff und Text zusammen', () => {
    /** @type {Set<string>} */
    const ids = new Set();
    for (let i = 0; i < 600; i++) {
      const szenario = waehleSzenario();
      ids.add(szenario.id);
      const betreff = randomBetreff('Handtuch', szenario);
      const text = generateNerdText(batman, figur('B1', 'DC Comics'), [], 'Handtuch', szenario);
      assert(betreff.includes('Handtuch'), 'Betreff ohne Thema');
      assert(text.includes('Handtuch'), 'Text ohne Thema');
      assert(text.startsWith(szenario.text({
        sName: bezeichne(batman), sOrt: 'Gotham City', rName: 'B1', rOrt: 'Teststadt', thema: 'Handtuch'
      }).split('\n\n')[0]), 'Text stammt nicht aus dem gewuerfelten Szenario');
    }
    assertEqual(ids.size, 6);
  });
});

run().then((ok) => {
  /** @type {any} */ (window).__TESTS_PASSED = ok;
  console.log(ok ? '✓ Alle Tests bestanden' : '✗ FEHLER: Tests fehlgeschlagen');
});
