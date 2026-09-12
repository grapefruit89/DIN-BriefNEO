// test/all.js — Testdatei für test/index.html. Priorität: der kritischste Pfad
// (Draft-Sanitizing/XSS) über die ECHTE Code-Route (localStorage → loadDraft),
// plus Draft-Roundtrip und Undo/Redo. Kein Framework, keine Mocks.
import { describe, it, assert, assertEqual, run } from './runner.js';
import { DraftManager } from '../website/js/01-draft-manager.js';
import { StorageManager } from '../website/js/51-storage.js';
import { UIProtections } from '../website/js/03-ui-protections.js';

/* StorageManager persistiert Drafts unter `din_draft_${key}` (key = 'current'). */
const DRAFT_KEY = 'din_draft_current';

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
    setDraft('<b>fett</b><script>alert(1)</script><em>kursiv</em><span class="din-comment">Anmerkung</span>');
    new DraftManager().loadDraft();
    const html = mustField().innerHTML;
    assert(!html.includes('script'), 'kein <script> im DOM');
    assert(!html.includes('em>'), 'verbotenes <em> ist entfernt (nur Textinhalt bleibt)');
    assert(html.includes('<b>fett</b>'), 'erlaubtes <b> bleibt');
    assert(html.includes('din-comment'), 'span.din-comment bleibt erhalten');
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

run().then((ok) => {
  /** @type {any} */ (window).__TESTS_PASSED = ok;
  console.log(ok ? '✓ Alle Tests bestanden' : '✗ FEHLER: Tests fehlgeschlagen');
});
