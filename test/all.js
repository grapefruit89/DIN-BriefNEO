// test/all.js — Testdatei für test/index.html. Priorität: der kritischste Pfad
// (Draft-Sanitizing/XSS) über die ECHTE Code-Route (localStorage → loadDraft),
// plus Draft-Roundtrip und Undo/Redo. Kein Framework, keine Mocks.
import { describe, it, assert, assertEqual, run } from './runner.js';
import { DraftManager, UIProtections } from '../website/js/01-document.js';
import { StorageManager, STORAGE_KEYS, load, save, remove, loadJSON, saveJSON, migrateStorage, Constants, buildDinLetterPayload, parseDinLetterPayload, DINLETTER_FORMAT } from '../website/js/51-persistence.js';
import { createEventBus, eventBus, Events } from '../website/js/00-event-bus.js';
import { initToastSystem } from '../website/js/32-toast.js';
import { SalutationEngine } from '../website/js/41-salutation-engine.js';
import { normalizePostcode, resolvePostcode, resolveCity, filterPostcodePrefix, detectPlzInputPattern } from '../website/js/44-address-domain.js';
import { ClipboardAddressParser } from '../website/js/45-address.js';

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

  it('erhält die volle Format-Allowlist (strong, u, s, blockquote)', () => {
    setDraft('<strong>a</strong><u>b</u><s>c</s><blockquote>d</blockquote>');
    new DraftManager().loadDraft();
    const html = mustField().innerHTML;
    for (const tag of ['<strong>', '<u>', '<s>', '<blockquote>']) {
      assert(html.includes(tag), `erlaubtes ${tag} bleibt`);
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
  it('UL/LI überleben den Restore im anlagen-text (extraTags)', () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      'anlagen-text': '<ul><li>Anlage A</li><li>Anlage B</li></ul>'
    }));
    new DraftManager().loadDraft();
    const anlagen = document.getElementById('anlagen-text');
    if (!anlagen) throw new Error('Test-Fixture fehlt: #anlagen-text');
    const lis = anlagen.querySelectorAll('li');
    assert(lis.length === 2, 'zwei <li> nach dem Restore');
    assert(lis[0].textContent === 'Anlage A', 'Anlage A erhalten');
    assert(lis[1].textContent === 'Anlage B', 'Anlage B erhalten');
    assert(lis[0].attributes.length === 0, 'keine Attribute an den <li>');
  });

  it('ensureListStructure wickelt Text-Nodes in <li> statt sie zu löschen', () => {
    const anlagen = document.getElementById('anlagen-text');
    if (!anlagen) throw new Error('Test-Fixture fehlt: #anlagen-text');
    anlagen.textContent = 'Rechnung\nVollmacht';
    new UIProtections().ensureListStructure(anlagen);
    const lis = anlagen.querySelectorAll('li');
    assert(lis.length === 2, 'zwei <li> aus Text-Nodes gewickelt');
    assert(lis[0].textContent === 'Rechnung', 'Text 1 erhalten');
    assert(lis[1].textContent === 'Vollmacht', 'Text 2 erhalten');
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
    const result = parseDinLetterPayload('\uFEFF' + payload);
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
      signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
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
    // Ungültiges Signaturbild (kein data:image/ URL)
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: {}, settings: { signatureImage: 'http://malicious.site/sig.png' } })).ok, 'externes Signaturbild abgelehnt');
    // Ungültiger Font (kein data: URL)
    assert(!parseDinLetterPayload(JSON.stringify({ format: DINLETTER_FORMAT, schema_version: 1, draft: {}, font: 'https://evil.com/font.woff2' })).ok, 'externer Font abgelehnt');
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

  it('migrateStorage setzt SCHEMA_VERSION idempotent', () => {
    remove(STORAGE_KEYS.schema);
    migrateStorage();
    assertEqual(load(STORAGE_KEYS.schema), String(Constants.SCHEMA_VERSION), 'Schema-Version initial gesetzt');
    migrateStorage();
    assertEqual(load(STORAGE_KEYS.schema), String(Constants.SCHEMA_VERSION), 'Schema-Version idempotent');
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

describe('DraftManager: EventBus Save-Integration (Phase 4)', () => {
  it('DOCUMENT_SAVE_REQUESTED speichert sofort ohne debounce', () => {
    seed();
    setField('EventBus Sofort-Speichern');
    const bus = createEventBus();
    const dm = new DraftManager(null, bus);
    bus.publish(Events.DOCUMENT_SAVE_REQUESTED, { debounce: false });
    assertEqual(getDraft().brieftext, 'EventBus Sofort-Speichern', 'Draft sofort synchron gespeichert');
    dm.destroy();
  });

  it('saveDraft() publiziert DOCUMENT_SAVED mit draft-Payload', () => {
    seed();
    setField('Payload Test');
    const bus = createEventBus();
    const dm = new DraftManager(null, bus);
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
    const dm = new DraftManager(null, bus);
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
    const dm = new DraftManager(null, bus);
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
  });

  it('unterstützt die Stile formal, polite und casual', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'formal' }), 'Sehr geehrte Frau Schmidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'polite' }), 'Guten Tag Frau Schmidt,');
    assertEqual(SalutationEngine.derive({ rawName: 'Frau Petra Schmidt', formality: 'casual' }), 'Hallo Petra,');
  });

  it('unterstützt "Nachname, Vorname" Notation', () => {
    assertEqual(SalutationEngine.derive({ rawName: 'Herr Müller, Hans', formality: 'formal' }), 'Sehr geehrter Herr Müller,');
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
});

run().then((ok) => {
  /** @type {any} */ (window).__TESTS_PASSED = ok;
  console.log(ok ? '✓ Alle Tests bestanden' : '✗ FEHLER: Tests fehlgeschlagen');
});
