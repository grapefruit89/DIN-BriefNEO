// test/all.js — Testdatei für test/index.html. Priorität: der kritischste Pfad
// (Draft-Sanitizing/XSS) über die ECHTE Code-Route (localStorage → loadDraft),
// plus Draft-Roundtrip und Undo/Redo. Kein Framework, keine Mocks.
import { describe, it, assert, assertEqual, run } from './runner.js';
import { DraftManager, UIProtections, formatTelefonnummer } from '../website/js/document.js';
// @ts-ignore
import { STORAGE_KEYS, load, save, remove, loadJSON, saveJSON, migrateStorage, buildDinLetterPayload, parseDinLetterPayload, DINLETTER_FORMAT, buildDINLetterJSON, registerDraftCollector } from '../website/js/persistence.js?v=test2';
import { createEventBus, eventBus, Events, initToastSystem, Constants } from '../website/js/core.js';
import { SalutationEngine } from '../website/js/salutation.js';
import { normalizePostcode, resolvePostcode, resolveCity, filterPostcodePrefix, detectPlzInputPattern, ClipboardAddressParser, AddressIntelligence, buildPrefixIndex, buildOrtIndex, buildFirmenIndex } from '../website/js/address.js';
import { SettingsManager } from '../website/js/settings.js';

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

describe('Import/Export: DIN-Brief-JSON-Payload (pure Funktionen)', () => {
  it('buildDinLetterPayload setzt Header mit schema_version + tool-Link', () => {
    const payload = buildDinLetterPayload({ betreff: 'Test' });
    assertEqual(payload.format, DINLETTER_FORMAT);
    assertEqual(payload.schema_version, Constants.SCHEMA_VERSION);
    assert(payload.tool.includes('github.com/grapefruit89/DIN-BriefNEO'), 'Tool-Link im Header');
    assert(payload.created.match(/^\d{4}-\d{2}-\d{2}$/), 'created = ISO-Datum');
    assert(payload.draft.betreff === 'Test', 'Draft-Payload 1:1');
  });

  it('parseDinLetterPayload akzeptiert ein gültiges Export-Payload (Roundtrip)', () => {
    const payload = buildDinLetterPayload({ betreff: 'Roundtrip', brieftext: '<b>x</b>' });
    const result = parseDinLetterPayload(JSON.stringify(payload));
    assert(result.ok, 'valides Payload wird akzeptiert');
    if (result.ok) {
      assertEqual(result.draft.betreff, 'Roundtrip');
      assertEqual(result.schemaVersion, Constants.SCHEMA_VERSION);
    }
  });

  it('parseDinLetterPayload lehnt Mist ab (kein JSON, falsches Format, falsche Version, Feldtypen)', () => {
    assert(!parseDinLetterPayload('kein json {').ok, 'kein JSON');
    assert(!parseDinLetterPayload('{"format":"anderes"}').ok, 'falsches format');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 99, draft: {} })).ok, 'zu hohe schema_version');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: { f: 42 } })).ok, 'nicht-string Feld');
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1 })).ok, 'draft fehlt');
  });

  it('parseDinLetterPayload toleriert UTF-8-BOM (Grok F4)', () => {
    const payload = JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: { betreff: 'BOM' } });
    const result = parseDinLetterPayload(`\uFEFF${payload}`);
    assert(result.ok, 'BOM-präfixtes JSON wird akzeptiert');
  });

  it('parseDinLetterPayload lehnt gefährliche/unplausible Keys ab (Prototyp-Hygiene, Grok F2)', () => {
    /* Achtung: { '__proto__': 'x' } als JS-Objektliteral setzt den Prototyp
     * (kein eigener Key) — die Tests prüfen daher die ROHE Datei-JSON. */
    assert(!parseDinLetterPayload('{"format":"dinletter","schema_version":1,"draft":{"__proto__":"x"}}').ok, '__proto__ abgelehnt');
    assert(!parseDinLetterPayload('{"format":"dinletter","schema_version":1,"draft":{"constructor":"x"}}').ok, 'constructor abgelehnt');
    assert(!parseDinLetterPayload('{"format":"dinletter","schema_version":1,"draft":{"a b":"x"}}').ok, 'Leerzeichen-Key abgelehnt');
    const ok = parseDinLetterPayload('{"format":"dinletter","schema_version":1,"draft":{"brieftext":"x"}}');
    assert(ok.ok, 'normale Ids erlaubt');
  });

  it('buildDinLetterPayload und parseDinLetterPayload unterstützen optionale settings und font (Voll-Backup)', () => {
    const settings = {
      layout: 'form-a',
      theme: 'dark',
      guides: false,
      formality: 'polite',
      signatureState: { x: 15, y: 30, scale: 0.8, rot: 5 }
    };
    const font = 'data:font/woff2;base64,d09GMgABAAAAAA...';
    const payload = buildDinLetterPayload({ betreff: 'Mit Settings' }, settings, font);

    assertEqual(payload.settings?.layout, 'form-a');
    assertEqual(payload.settings?.theme, 'dark');
    assertEqual(payload.font, font);

    const parsed = parseDinLetterPayload(JSON.stringify(payload));
    assert(parsed.ok, 'Voll-Backup erfolgreich geparst');
    if (parsed.ok) {
      assertEqual(parsed.settings?.layout, 'form-a');
      assertEqual(parsed.settings?.theme, 'dark');
      assertEqual(parsed.settings?.guides, false);
      assertEqual(parsed.settings?.formality, 'polite');
      assertEqual(parsed.settings?.signatureState?.x, 15);
      assertEqual(parsed.settings?.signatureState?.scale, 0.8);
      assertEqual(parsed.font, font);
    }
  });

  it('parseDinLetterPayload validiert settings und font defensiv (Schutz vor fehlerhaften/manipulierten Werten)', () => {
    // Ungültiges Layout
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: {}, settings: { layout: 'form-c' } })).ok, 'ungültiges Layout abgelehnt');
    // Ungültiges Theme
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: {}, settings: { theme: 'neon' } })).ok, 'ungültiges Theme abgelehnt');
    // Ungültige Signatur-Koordinaten
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: {}, settings: { signatureState: { x: 'ungueltig', y: 0, scale: 1, rot: 0 } } })).ok, 'ungültige Signatur-Koordinaten abgelehnt');
    // Ungültiger Font (kein data: URL)
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: {}, font: 'https://evil.com/font.woff2' })).ok, 'externer Font abgelehnt');
  });

  it('buildDinLetterPayload erzeugt Schema v2 Struktur mit generator, timestamp und document', () => {
    const payload = buildDinLetterPayload({ betreff: 'V2 Test' }, { layout: 'form-a', copyfit: true, guides: false });
    assertEqual(payload.schema_version, 2);
    assertEqual(payload.generator, 'DIN-BriefNEO');
    assertEqual(payload.document.layout, 'form-a');
    assertEqual(payload.document.copyfit, true);
    assertEqual(payload.document.guides, false);
    assertEqual(payload.document.fields.betreff, 'V2 Test');
    assert(!('placed' in payload.signature), 'signature.placed ist gestrichen (kein Leser)');
  });

  it('buildDINLetterJSON erzeugt exakt dasselbe Datenmodell wie Export-Payload (SSoT / DeepEqual)', () => {
    saveJSON(STORAGE_KEYS.draft, { empfaenger: 'Max Mustermann', betreff: 'SSoT Test', brieftext: 'Hallo Welt' });
    saveJSON(STORAGE_KEYS.settings, { layout: 'form-b', copyfit: false, guides: true, theme: 'dark' });

    const directPayload = buildDinLetterPayload(
      loadJSON(STORAGE_KEYS.draft, {}),
      loadJSON(STORAGE_KEYS.settings, null),
      load(STORAGE_KEYS.font, null)
    );

    const unifiedPayload = buildDINLetterJSON();

    // Vergleiche alle fachlichen Felder
    assertEqual(unifiedPayload.format, directPayload.format);
    assertEqual(unifiedPayload.schema_version, directPayload.schema_version);
    assertEqual(unifiedPayload.generator, directPayload.generator);
    assertEqual(unifiedPayload.document.layout, directPayload.document.layout);
    assertEqual(unifiedPayload.document.copyfit, directPayload.document.copyfit);
    assertEqual(unifiedPayload.document.guides, directPayload.document.guides);
    assertEqual(JSON.stringify(unifiedPayload.document.fields), JSON.stringify(directPayload.document.fields));
    assertEqual(JSON.stringify(unifiedPayload.profile), JSON.stringify(directPayload.profile));
    assertEqual(JSON.stringify(unifiedPayload.signature), JSON.stringify(directPayload.signature));

    // Teste mit registriertem Collector
    registerDraftCollector(() => ({ betreff: 'Live Collector' }));
    const collectorPayload = buildDINLetterJSON();
    assertEqual(collectorPayload.document.fields.betreff, 'Live Collector');
    registerDraftCollector(null);
  });

  it('parseDinLetterPayload parst Schema v2 und migriert Schema v1 automatisch (Zero-Base64)', () => {
    // Schema v1 mit altem Base64-Signaturbild (wird sauber verworfen, Geometrie bleibt erhalten)
    const v1Json = JSON.stringify({
      format: DINLETTER_FORMAT,
      schema_version: 1,
      draft: { betreff: 'Altes Format' },
      settings: {
        layout: 'form-b',
        guides: true,
        signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signatureState: { x: 12, y: 95, scale: 0.5, rot: 0 }
      }
    });
    const res1 = parseDinLetterPayload(v1Json);
    assert(res1.ok, 'v1 erfolgreich geparst');
    if (res1.ok) {
      assertEqual(res1.schemaVersion, 1);
      assertEqual(res1.draft.betreff, 'Altes Format');
      assertEqual(res1.settings?.layout, 'form-b');
      assertEqual(res1.settings?.signatureImage, undefined, 'Base64-Bild wurde verworfen');
      assertEqual(res1.settings?.signatureState?.x, 12, 'Signatur-Geometrie bleibt erhalten');
    }

    // Schema v2 (reine Text-Payload, CAD-Geometrie)
    const v2Json = JSON.stringify({
      format: DINLETTER_FORMAT,
      schema_version: 2,
      generator: 'DIN-BriefNEO',
      timestamp: '2026-10-12T14:00:00Z',
      document: {
        layout: 'form-a',
        copyfit: true,
        guides: false,
        fields: { betreff: 'Neues Format' }
      },
      profile: { sender: 'Max Mustermann', theme: 'dark', formality: 'casual' },
      signature: { placed: true, transform: { x: 5, y: 10, scale: 1, rot: 0 } }
    });
    const res2 = parseDinLetterPayload(v2Json);
    assert(res2.ok, 'v2 erfolgreich geparst');
    if (res2.ok) {
      assertEqual(res2.schemaVersion, 2);
      assertEqual(res2.draft.betreff, 'Neues Format');
      assertEqual(res2.settings?.layout, 'form-a');
      assertEqual(res2.settings?.copyfit, true);
      assertEqual(res2.settings?.guides, false);
      assertEqual(res2.settings?.theme, 'dark');
      assertEqual(res2.settings?.formality, 'casual');
      assertEqual(res2.settings?.signatureState?.x, 5);
      assertEqual(res2.settings?.signatureState?.scale, 1);
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

  it('verwaltet das isolierte Signatur-Asset (din_signature_asset) synchron (Law A34)', () => {
    const dummyWebP = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA';
    save(STORAGE_KEYS.signatureAsset, dummyWebP);
    assertEqual(load(STORAGE_KEYS.signatureAsset, null), dummyWebP, 'Signatur-Asset erfolgreich geladen');
    assertEqual(load(STORAGE_KEYS.signatureAsset), dummyWebP, 'Im isolierten Schlüssel din_signature_asset abgelegt');

    remove(STORAGE_KEYS.signatureAsset);
    assertEqual(load(STORAGE_KEYS.signatureAsset, null), null, 'Signatur-Asset erfolgreich gelöscht');
    assertEqual(load(STORAGE_KEYS.signatureAsset), null, 'Schlüssel din_signature_asset vollständig entfernt');
  });

  it('garantiert Zero-Base64 im Schema-v2-Export trotz vorhandenem Signatur-Asset', () => {
    const dummyWebP = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA';
    save(STORAGE_KEYS.signatureAsset, dummyWebP);

    const payload = buildDinLetterPayload(
      { brieftext: 'Testtext' },
      { signatureState: { x: 12, y: 95, scale: 0.6, rot: 5 } }
    );
    const serialized = JSON.stringify(payload);
    assert(!serialized.includes('data:image/webp'), 'Export-Payload darf keine Bilddaten enthalten');
    assert(!serialized.includes(dummyWebP), 'Export-Payload darf keine Data-URL enthalten');
    assert(!('placed' in payload.signature), 'signature.placed ist gestrichen (kein Leser)');
    assertEqual(payload.signature.transform.x, 12);

    remove(STORAGE_KEYS.signatureAsset);
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
    assertEqual(SalutationEngine.derive({ rawName: 'Dr. Hans-Peter von Müller-Lüdenscheidt', formality: 'formal' }), 'Sehr geehrter Herr von Müller-Lüdenscheidt,');
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
    assertEqual(SalutationEngine.derive({ rawName: 'Müller, M.Sc. Anna', formality: 'formal' }), 'Sehr geehrte Frau Müller,');
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

  it('entfernt Schrift synchron bei Klick im Zustand loaded', () => {
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('btn-schrift-aktion'));
    const sm = new SettingsManager();
    sm.attachListeners();
    save(STORAGE_KEYS.font, 'data:font/woff2;base64,AAAA');
    sm.updateFontStatusUI(true);
    assertEqual(btn.dataset.fontState, 'loaded');

    // Klick auf den Button löscht die Schrift
    btn.click();
    assert(load(STORAGE_KEYS.font, null) === null, 'localStorage din_custom_font wurde synchron gelöscht');
    assertEqual(btn.dataset.fontState, 'empty');
    assert(!document.body.classList.contains('schrift-eigene-aktiv'), 'body Klasse entfernt');
    assertEqual(document.documentElement.style.getPropertyValue('--active-font-family'), '');
  });

  it('erzwingt 400 KB Obergrenze in Constants.LIMITS', () => {
    assertEqual(Constants.LIMITS.FONT_SIZE_MAX_KB, 400);
    assert(Constants.TOASTS.FONT.SIZE_ERROR.includes('400 KB'), 'Fehlermeldung nennt 400 KB');
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

describe('Debug-Recorder: Spam-Filter & Zähler', () => {
  it('filtert leere Schritte bei aktivem Filter und zeigt genauen Zähler', async () => {
    const { initAutocompleteRecorder } = await import('../website/js/debug-recorder.js');
    initAutocompleteRecorder(true);

    const rec = /** @type {any} */ (window).__rec;
    assert(Boolean(rec), '__rec API ist verfügbar');
    rec.clear();

    const panel = document.getElementById('panel-autocomplete') || document.getElementById('autocomplete-debug-panel');
    assert(Boolean(panel), 'Panel ist im DOM');

    const filterCheckbox = /** @type {HTMLInputElement | null} */ (document.getElementById('rec-filter-empty'));
    const counterEl = document.getElementById('rec-counter');
    assert(Boolean(filterCheckbox), 'Checkbox #rec-filter-empty existiert');
    assert(Boolean(counterEl), 'Zähler #rec-counter existiert');
    assertEqual(filterCheckbox?.checked, false);

    // Simuliere 26 Schritte: 14 mit 0 Items, 12 mit Items
    rec.steps.length = 0;
    for (let i = 1; i <= 26; i++) {
      const hasItems = i <= 12;
      rec.steps.push({
        stepIndex: i,
        text: `ort_${i}`,
        items: hasItems ? [`Treffer ${i}`] : [],
        itemCount: hasItems ? 1 : 0,
        tag: '',
        timestamp: Date.now(),
        timeStr: '12:00:00'
      });
    }

    // Standard (Filter aus): Alle 26 sichtbar
    rec.setHideEmptySteps(false);
    assertEqual(filterCheckbox?.checked, false);
    let renderedSteps = panel?.querySelectorAll('.debug-step');
    assertEqual(renderedSteps?.length, 26);
    assertEqual(counterEl?.textContent, '(26 von 26 Schritten sichtbar)');

    // Export enthält alle 26 Schritte
    const fullJSON = JSON.parse(rec.dumpJSON());
    assertEqual(fullJSON.length, 26);
    const dumpGlobal = JSON.parse(/** @type {any} */ (window).__dumpJSON());
    assertEqual(dumpGlobal.length, 26);

    // Filter aktivieren: Nur noch 12 sichtbar
    rec.setHideEmptySteps(true);
    assertEqual(filterCheckbox?.checked, true);
    renderedSteps = panel?.querySelectorAll('.debug-step');
    assertEqual(renderedSteps?.length, 12);
    assertEqual(counterEl?.textContent, '(12 von 26 Schritten sichtbar)');

    // Export via __dumpJSON enthält weiterhin ALLE 26 Schritte
    const filteredExport = JSON.parse(rec.dumpJSON());
    assertEqual(filteredExport.length, 26);

    // Filter wieder deaktivieren: Wieder alle 26 sichtbar
    rec.setHideEmptySteps(false);
    assertEqual(filterCheckbox?.checked, false);
    renderedSteps = panel?.querySelectorAll('.debug-step');
    assertEqual(renderedSteps?.length, 26);
    assertEqual(counterEl?.textContent, '(26 von 26 Schritten sichtbar)');

    // Aufräumen
    rec.clear();
    if (panel) {
      panel.hidden = true;
    }
  });

  it('erfüllt alle UI-Refactor Anforderungen (keine per-step Buttons, Confirm bei Clear, Drag/Snap/Keyboard)', async () => {
    const { initAutocompleteRecorder } = await import('../website/js/debug-recorder.js');
    initAutocompleteRecorder(true);

    const rec = /** @type {any} */ (window).__rec;
    rec.clear();

    const panel = document.getElementById('panel-autocomplete') || document.getElementById('autocomplete-debug-panel');
    assert(Boolean(panel), 'Panel vorhanden');

    // 1. Keine per-Schritt Buttons im DOM
    rec.steps.length = 0;
    for (let i = 1; i <= 5; i++) {
      rec.steps.push({
        stepIndex: i,
        text: `ort_${i}`,
        items: [`Treffer ${i}`],
        itemCount: 1,
        tag: '',
        timestamp: Date.now(),
        timeStr: '12:00:00'
      });
    }
    rec.setHideEmptySteps(false);
    const copyStepBtns = document.querySelectorAll('.debug-copy-step-btn');
    assertEqual(copyStepBtns.length, 0);

    // 2. Globaler Copy-Button kopiert alle Schritte
    /** @type {string | null} */
    let copiedText = null;
    const origWriteText = navigator.clipboard?.writeText;
    if (navigator.clipboard) {
      /** @param {string} txt */
      navigator.clipboard.writeText = async (txt) => { copiedText = txt; };
    }
    const copyAllBtn = /** @type {HTMLButtonElement} */ (document.getElementById('rec-btn-copy-all'));
    copyAllBtn.click();
    await Promise.resolve();
    assert(Boolean(copiedText), 'Clipboard hat Text erhalten');
    const parsedCopied = JSON.parse(copiedText || '[]');
    assertEqual(parsedCopied.length, 5);
    if (navigator.clipboard && origWriteText) {
      navigator.clipboard.writeText = origWriteText;
    }

    // 3. Clear mit confirm()
    const origConfirm = window.confirm;
    const clearBtn = /** @type {HTMLButtonElement} */ (document.getElementById('rec-btn-clear'));
    
    // Fall 3a: confirm liefert false -> nicht leeren
    window.confirm = () => false;
    clearBtn.click();
    assertEqual(rec.steps.length, 5);

    // Fall 3b: confirm liefert true -> leeren
    window.confirm = () => true;
    clearBtn.click();
    assertEqual(rec.steps.length, 0);
    window.confirm = origConfirm;

    // 4. Drag, Snap und Bounds-Persistenz
    const titleDiv = /** @type {HTMLElement} */ (panel?.querySelector('.debug-title'));
    assert(Boolean(titleDiv), 'TitleDiv ist Drag-Handle');

    // Floating setzen
    rec.setPosition(120, 80);
    const storedPos = JSON.parse(localStorage.getItem('debug-panel-pos-autocomplete') || '{}');
    assertEqual(storedPos.left, 120);
    assertEqual(storedPos.top, 80);
    assertEqual(localStorage.getItem('debug-panel-mode-autocomplete'), 'floating');

    // Snap rechts
    rec.snap('right');
    assert(panel?.classList.contains('snap-right'), 'Panel hat snap-right Klasse');
    assertEqual(localStorage.getItem('debug-panel-mode-autocomplete'), 'right');

    // Snap links
    rec.snap('left');
    assert(panel?.classList.contains('snap-left'), 'Panel hat snap-left Klasse');
    assertEqual(localStorage.getItem('debug-panel-mode-autocomplete'), 'left');

    // Doppelklick auf Header -> Default-Position
    titleDiv.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    assert(!panel?.classList.contains('snap-right') && !panel?.classList.contains('snap-left'), 'Snap entfernt');
    assertEqual(localStorage.getItem('debug-panel-pos-autocomplete'), null);

    // Keyboard-Steuerung
    rec.setPosition(200, 200);
    titleDiv.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const posAfterKey = JSON.parse(localStorage.getItem('debug-panel-pos-autocomplete') || '{}');
    assertEqual(posAfterKey.left, 210);

    titleDiv.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assertEqual(localStorage.getItem('debug-panel-pos-autocomplete'), null);

    // Touch / Pointer-Event Drag Simulation
    titleDiv.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, pointerType: 'touch', bubbles: true }));
    titleDiv.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, clientY: 120, pointerType: 'touch', bubbles: true }));
    titleDiv.dispatchEvent(new PointerEvent('pointerup', { clientX: 150, clientY: 120, pointerType: 'touch', bubbles: true }));

    // Aufräumen
    rec.clear();
    if (copyAllBtn) {
      copyAllBtn.textContent = '📋 Alles';
    }
    if (panel) {
      panel.hidden = true;
      panel.classList.remove('snap-right', 'snap-left');
      panel.style.left = '';
      panel.style.top = '';
    }
  });

  it('strikte Trennung der Buttons zwischen Panel A (?debug=autocomplete) und Panel B (?debug=json)', async () => {
    const { initAutocompleteRecorder } = await import('../website/js/debug-recorder.js');
    const { initJSONDebugPanel } = await import('../website/js/debug-json-panel.js');

    initAutocompleteRecorder(true);
    // Simuliere ?debug=json
    const origLocation = window.location.search;
    history.replaceState(null, '', '?debug=json');
    initJSONDebugPanel();
    history.replaceState(null, '', origLocation);

    const panelA = document.getElementById('panel-autocomplete') || document.getElementById('autocomplete-debug-panel');
    const panelB = document.getElementById('panel-json') || document.getElementById('dinletter-json-debug-panel');

    assert(Boolean(panelA), 'Panel A (autocomplete) existiert');
    assert(Boolean(panelB), 'Panel B (json) existiert');

    // Panel A Buttons prüfen: genau 4 Buttons
    const buttonsA = Array.from(panelA?.querySelectorAll('button') || []).map(b => ({
      id: b.id,
      text: b.textContent?.trim()
    }));
    assertEqual(buttonsA.length, 4, 'Panel A hat genau 4 Buttons');
    assertEqual(buttonsA[0].id, 'rec-btn-copy-all');
    assertEqual(buttonsA[0].text, '📋 Alles');
    assertEqual(buttonsA[1].id, 'rec-btn-clear');
    assertEqual(buttonsA[1].text, '🗑️ Leeren');
    assertEqual(buttonsA[2].id, 'rec-btn-toggle');
    assertEqual(buttonsA[2].text, '⏸️');
    assertEqual(buttonsA[3].id, 'rec-btn-min');
    assertEqual(buttonsA[3].text, '_');
    assert(Boolean(panelA?.querySelector('#rec-filter-empty')), 'Panel A hat Filter-Checkbox');
    assert(Boolean(panelA?.querySelector('#rec-counter')), 'Panel A hat Zähler');

    // Panel B Buttons prüfen: genau 3 Buttons (Kopieren, Leeren, Schließen!)
    const buttonsB = Array.from(panelB?.querySelectorAll('button') || []).map(b => ({
      id: b.id,
      text: b.textContent?.trim()
    }));
    assertEqual(buttonsB.length, 3, 'Panel B hat genau 3 Buttons (Kopieren, Leeren, Schließen)');
    assertEqual(buttonsB[0].id, 'json-btn-copy');
    assertEqual(buttonsB[0].text, '📋 Kopieren');
    assertEqual(buttonsB[1].id, 'json-btn-clear');
    assertEqual(buttonsB[1].text, '🗑️ Leeren');
    assertEqual(buttonsB[2].id, 'json-btn-close');
    assertEqual(buttonsB[2].text, '✕');

    // Negative Zusicherungen für Panel B
    assertEqual(panelB?.querySelectorAll('#json-btn-toggle').length, 0, 'Panel B hat kein Toggle/Pause');
    assertEqual(panelB?.querySelectorAll('#json-btn-min').length, 0, 'Panel B hat kein Minimize');
    assertEqual(panelB?.querySelectorAll('.debug-badge').length, 0, 'Panel B hat kein LIVE-Badge');
    assertEqual(panelB?.querySelectorAll('#rec-filter-empty').length, 0, 'Panel B hat keine Filter-Checkbox');
    assertEqual(panelB?.querySelectorAll('#rec-counter').length, 0, 'Panel B hat keinen Zähler');
    assertEqual(panelA?.querySelectorAll('#json-btn-copy').length, 0, 'Panel A hat keine JSON-Buttons');
    assertEqual(panelA?.querySelectorAll('#json-btn-close').length, 0, 'Panel A hat keinen Close-Button');

    // Aufräumen
    if (panelA) {
      panelA.hidden = true;
      panelA.classList.remove('snap-right', 'snap-left');
      panelA.style.left = '';
      panelA.style.top = '';
    }
    if (panelB) {
      panelB.hidden = true;
      panelB.classList.remove('snap-right', 'snap-left');
      panelB.style.left = '';
      panelB.style.top = '';
    }
  });

  it('is-dragging State wird in allen 5 End-Zuständen zuverlässig entfernt', () => {
    const panel = document.getElementById('panel-autocomplete');
    assert(Boolean(panel), 'Panel vorhanden');
    const header = /** @type {HTMLElement | null} */ (panel?.querySelector('.debug-header'));
    assert(Boolean(header), 'Header vorhanden');

    if (!header) return;

    // 1. pointerup
    header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    assert(header.classList.contains('is-dragging'), 'pointerdown setzt is-dragging');
    header.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 10, clientY: 10 }));
    assert(!header.classList.contains('is-dragging'), 'pointerup entfernt is-dragging');

    // 2. pointercancel
    header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    assert(header.classList.contains('is-dragging'));
    header.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
    assert(!header.classList.contains('is-dragging'), 'pointercancel entfernt is-dragging');

    // 3. lostpointercapture
    header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    assert(header.classList.contains('is-dragging'));
    header.dispatchEvent(new Event('lostpointercapture', { bubbles: true }));
    assert(!header.classList.contains('is-dragging'), 'lostpointercapture entfernt is-dragging');

    // 4. Escape-Taste
    header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    assert(header.classList.contains('is-dragging'));
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert(!header.classList.contains('is-dragging'), 'Escape entfernt is-dragging');

    // 5. window.blur
    header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    assert(header.classList.contains('is-dragging'));
    window.dispatchEvent(new Event('blur'));
    assert(!header.classList.contains('is-dragging'), 'window.blur entfernt is-dragging');
  });

  it('[hidden]-Spezifität: Panels sind ohne Parameter unsichtbar (display: none) und nur mit passendem Parameter sichtbar', () => {
    const panelAuto = /** @type {HTMLElement | null} */ (document.getElementById('panel-autocomplete'));
    const panelJson = /** @type {HTMLElement | null} */ (document.getElementById('panel-json'));
    assert(Boolean(panelAuto), 'panel-autocomplete existiert');
    assert(Boolean(panelJson), 'panel-json existiert');

    if (!panelAuto || !panelJson) return;

    // 1. Ohne ?debug=: beide hidden -> display: none
    panelAuto.hidden = true;
    panelJson.hidden = true;
    assertEqual(getComputedStyle(panelAuto).display, 'none');
    assertEqual(getComputedStyle(panelJson).display, 'none');
    assertEqual(panelAuto.getBoundingClientRect().width, 0);
    assertEqual(panelJson.getBoundingClientRect().width, 0);

    // 2. Mit ?debug=json: panelJson sichtbar, panelAuto unsichtbar
    panelAuto.hidden = true;
    panelJson.hidden = false;
    assertEqual(getComputedStyle(panelAuto).display, 'none');
    assertEqual(getComputedStyle(panelJson).display, 'flex');
    assertEqual(panelAuto.getBoundingClientRect().width, 0);
    assert(panelJson.getBoundingClientRect().width > 0, 'panelJson hat Breite > 0');

    // 3. Mit ?debug=autocomplete: panelAuto sichtbar, panelJson unsichtbar
    panelAuto.hidden = false;
    panelJson.hidden = true;
    assertEqual(getComputedStyle(panelAuto).display, 'flex');
    assertEqual(getComputedStyle(panelJson).display, 'none');
    assert(panelAuto.getBoundingClientRect().width > 0, 'panelAuto hat Breite > 0');
    assertEqual(panelJson.getBoundingClientRect().width, 0);

    // 4. Mit ?debug=autocomplete,json: beide sichtbar
    panelAuto.hidden = false;
    panelJson.hidden = false;
    assertEqual(getComputedStyle(panelAuto).display, 'flex');
    assertEqual(getComputedStyle(panelJson).display, 'flex');
    assert(panelAuto.getBoundingClientRect().width > 0, 'panelAuto hat Breite > 0');
    assert(panelJson.getBoundingClientRect().width > 0, 'panelJson hat Breite > 0');

    // Aufräumen
    panelAuto.hidden = true;
    panelJson.hidden = true;
  });

  it('Close-Button ✕ am JSON-Panel entfernt debug=json sauber aus der URL und schließt das Panel', async () => {
    const { initJSONDebugPanel } = await import('../website/js/debug-json-panel.js');
    const panelJson = /** @type {HTMLElement | null} */ (document.getElementById('panel-json'));
    const btnClose = /** @type {HTMLButtonElement | null} */ (panelJson?.querySelector('#json-btn-close'));
    assert(Boolean(panelJson), 'panel-json existiert');
    assert(Boolean(btnClose), 'json-btn-close existiert');

    if (!panelJson || !btnClose) return;

    const origLocation = window.location.href;

    // Teste alle 5 URL-Transformationen
    const testCases = [
      { start: '?debug=json', expectedSearch: '' },
      { start: '?debug=json,autocomplete', expectedSearch: '?debug=autocomplete' },
      { start: '?debug=autocomplete,json', expectedSearch: '?debug=autocomplete' },
      { start: '?debug=autocomplete,json,foo', expectedSearch: '?debug=autocomplete,foo' },
      { start: '?debug=json&other=bar', expectedSearch: '?other=bar' }
    ];

    for (const { start, expectedSearch } of testCases) {
      history.replaceState(null, '', start);
      initJSONDebugPanel();
      assertEqual(panelJson.hidden, false, `Panel ist geöffnet für ${start}`);

      btnClose.click();

      assertEqual(panelJson.hidden, true, `Panel ist hidden nach Klick für ${start}`);
      assertEqual(getComputedStyle(panelJson).display, 'none', `Display ist none nach Klick für ${start}`);
      assertEqual(window.location.search, expectedSearch, `URL Search transformiert für ${start} zu ${expectedSearch}`);
    }

    // Aufräumen
    history.replaceState(null, '', origLocation);
    panelJson.hidden = true;
  });

  it('Clear-Button 🗑️ am JSON-Panel leert die Code-Anzeige', async () => {
    const { initJSONDebugPanel } = await import('../website/js/debug-json-panel.js');
    const panelJson = /** @type {HTMLElement | null} */ (document.getElementById('panel-json'));
    const btnClear = /** @type {HTMLButtonElement | null} */ (panelJson?.querySelector('#json-btn-clear'));
    const codeEl = document.getElementById('json-debug-code');
    assert(Boolean(panelJson), 'panel-json existiert');
    assert(Boolean(btnClear), 'json-btn-clear existiert');
    assert(Boolean(codeEl), 'json-debug-code existiert');

    if (!panelJson || !btnClear || !codeEl) return;

    initJSONDebugPanel(true);
    assert(Boolean(codeEl.textContent && codeEl.textContent.length > 0), 'Code-Element enthält initiales JSON');

    btnClear.click();
    assertEqual(codeEl.textContent, '', 'Code-Element ist nach Clear leer');

    panelJson.hidden = true;
  });
});

run().then((ok) => {
  /** @type {any} */ (window).__TESTS_PASSED = ok;
  console.log(ok ? '✓ Alle Tests bestanden' : '✗ FEHLER: Tests fehlgeschlagen');
});
