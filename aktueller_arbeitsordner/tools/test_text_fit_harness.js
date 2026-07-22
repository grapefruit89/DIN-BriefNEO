// @ts-check
/**
 * Empirical Test Harness for TextFitEngine & UIProtections
 */

const fs = require('fs');
const path = require('path');

// Mock Browser Environment
class MockRange {
  constructor() {
    /** @type {MockElement | null} */
    this.targetEl = null;
  }
  selectNodeContents(node) {}
  collapse(toStart) {}
  insertNode(node) {
    if (this.targetEl) {
      if (node.nodeType === 3) {
        this.targetEl.textContent += node.textContent;
      } else if (typeof node === 'string') {
        this.targetEl.textContent += node;
      }
    }
  }
  setStart(node, offset) {}
  deleteFromDocument() {
    if (this.targetEl) {
      this.targetEl.textContent = '';
    }
  }
}

class MockSelection {
  constructor() {
    this.selectedText = '';
    this.rangeCount = 1;
    this.range = new MockRange();
  }
  toString() {
    return this.selectedText;
  }
  getRangeAt(idx) {
    return this.range;
  }
  deleteFromDocument() {
    if (this.range) this.range.deleteFromDocument();
  }
  collapseToEnd() {}
  removeAllRanges() {}
  addRange(range) {}
}

class MockElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      contains: (cls) => this.className.split(' ').includes(cls)
    };
    this.attributes = new Map();
    this.style = {
      overflow: '',
      whiteSpace: '',
      removeProperty: (prop) => delete this.style[prop],
      setProperty: (prop, val) => { this.style[prop] = val; }
    };
    this.dataset = {};
    this.listeners = new Map();
    this.textContent = '';
    this.parentElement = null;
    this.children = [];
    
    // Measurement parameters
    this._mockClientWidth = 200;
    this._mockFontScale = 1.0;
  }

  get clientWidth() {
    return this._mockClientWidth;
  }

  get scrollWidth() {
    let group = this.closest('#empfaenger, #infoblock, #briefkern') || this;
    let fit = group.getAttribute('data-text-fit');
    let scale = 1.0;
    if (fit === 'condensed') scale = 0.9;
    if (fit === 'shrink') scale = 0.8;
    return Math.round(this.textContent.length * 10 * scale * this._mockFontScale);
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
  }
  getAttribute(name) {
    return this.attributes.get(name) || null;
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }

  closest(selector) {
    const ids = selector.split(',').map(s => s.trim().replace('#', ''));
    let curr = this;
    while (curr) {
      if (ids.includes(curr.id)) return curr;
      curr = curr.parentElement;
    }
    return null;
  }

  querySelectorAll(selector) {
    let results = [];
    const search = (node) => {
      for (const child of node.children) {
        if (selector.includes('.single-line') && child.className.includes('single-line')) {
          results.push(child);
        }
        search(child);
      }
    };
    search(this);
    return results;
  }

  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }

  dispatchEvent(event) {
    const evt = typeof event === 'string' ? { type: event } : event;
    try {
      Object.defineProperty(evt, 'target', { value: this, configurable: true, writable: true });
    } catch(e) {}
    const list = this.listeners.get(evt.type) || [];
    for (const fn of list) {
      fn(evt);
    }
  }
}

class MockMutationObserver {
  constructor(cb) {}
  observe(el, opts) {}
  disconnect() {}
}

// Global Mocks setup
global.document = {
  querySelectorAll: (selector) => {
    return global.mockDOMNodes || [];
  },
  querySelector: (selector) => {
    return (global.mockDOMNodes && global.mockDOMNodes[0]) || null;
  },
  getElementById: (id) => {
    if (!global.mockDOMNodes) return null;
    return global.mockDOMNodes.find(node => node.id === id) || null;
  },
  createElement: (tag) => new MockElement(tag),
  createTextNode: (str) => ({ nodeType: 3, textContent: str }),
  createRange: () => {
    const range = new MockRange();
    range.targetEl = global.activeMockElement;
    return range;
  }
};

global.window = {
  getSelection: () => global.mockSelection || new MockSelection()
};

global.MutationObserver = MockMutationObserver;
global.requestAnimationFrame = (cb) => cb();
global.Temporal = {
  Now: {
    instant: () => ({ epochMilliseconds: Date.now() })
  }
};

// Dynamic import of modules
async function runEmpiricalVerification() {
  console.log('==================================================');
  console.log('EMPIRICAL EDGE-CASE VERIFICATION: TextFitEngine');
  console.log('==================================================\n');

  const { TextFitEngine } = await import('../website/js/20-features/08-text-fit.js');
  const { UIProtections } = await import('../website/js/00-core/03-ui-protections.js');
  const { ToastSystem } = await import('../website/js/10-ui/02-toast.js');

  let results = [];

  // ----------------------------------------------------
  // TEST 1: Multi-line paste into single-line field
  // ----------------------------------------------------
  console.log('[TEST 1] Multi-line paste into single-line field');
  {
    const group = new MockElement('div', 'empfaenger');
    const field = new MockElement('div', 'empfaenger-zeile1', 'single-line');
    field.parentElement = group;
    group.children.push(field);
    field._mockClientWidth = 200; // max length at lvl 0: 20 chars, lvl 1: 22 chars, lvl 2: 25 chars

    global.mockDOMNodes = [group, field];
    
    const mockSel = new MockSelection();
    mockSel.range.targetEl = field;
    global.mockSelection = mockSel;
    global.activeMockElement = field;

    let toastTriggered = false;
    let toastMessage = '';
    const engine = new TextFitEngine({
      onToast: (msg) => { toastTriggered = true; toastMessage = msg; }
    });
    engine.init();

    const uiProt = new UIProtections();
    uiProt.enforceLineLimits();

    // 1a. Normal multi-line paste: "Max\nMustermann" -> "Max Mustermann" (14 chars)
    let pasteEvent = {
      type: 'paste',
      preventDefault: () => {},
      clipboardData: { getData: () => 'Max\nMustermann' }
    };
    field.textContent = '';
    field.dispatchEvent(pasteEvent);

    let test1a_passed = (field.textContent === 'Max Mustermann') && (group.getAttribute('data-text-fit') === null);
    console.log(`  - 1a. Fit multi-line paste ("Max\\nMustermann"): ${test1a_passed ? 'PASS' : 'FAIL'} (Result: "${field.textContent}", Level: ${group.getAttribute('data-text-fit') || 0})`);

    // 1b. Oversized multi-line paste: 30 chars -> level 3 overflow -> rollback to previous valid text ("Max Mustermann")
    toastTriggered = false;
    let pasteEventOver = {
      type: 'paste',
      preventDefault: () => {},
      clipboardData: { getData: () => 'Sehr Langer Name\nDer Die Maximalbreite\nWeit Ueberschreitet' }
    };
    // Focus to set last valid text
    field.dispatchEvent({ type: 'focus' });
    field.dispatchEvent(pasteEventOver);

    let test1b_passed = (field.textContent === 'Max Mustermann') && toastTriggered && (toastMessage === 'Maximalbreite erreicht');
    console.log(`  - 1b. Oversized multi-line paste rollback: ${test1b_passed ? 'PASS' : 'FAIL'} (Text restored to: "${field.textContent}", Toast: "${toastMessage}")`);

    results.push({ test: 'Multi-line paste into single-line field', pass: test1a_passed && test1b_passed });
  }

  // ----------------------------------------------------
  // TEST 2: Rapid backspace / text selection replacement
  // ----------------------------------------------------
  console.log('\n[TEST 2] Rapid backspace / text selection replacement');
  {
    const group = new MockElement('div', 'empfaenger');
    const field = new MockElement('div', 'empfaenger-zeile2', 'single-line');
    field.parentElement = group;
    group.children.push(field);
    field._mockClientWidth = 200; // lvl 0: <=20 chars, lvl 1: <=22 chars, lvl 2: <=25 chars

    global.mockDOMNodes = [group, field];
    const mockSel = new MockSelection();
    mockSel.range.targetEl = field;
    global.mockSelection = mockSel;

    let toastTriggered = false;
    const engine = new TextFitEngine({
      onToast: () => { toastTriggered = true; }
    });
    engine.init();

    // Fill field to Level 2 (24 chars)
    field.textContent = '123456789012345678901234'; // 24 chars -> scrollWidth = 24 * 10 * 0.8 = 192 <= 200 (Level 2 shrink)
    field.dispatchEvent({ type: 'input' });

    let initialLevel = group.getAttribute('data-text-fit');
    console.log(`  - Initial state with 24 chars: Level = "${initialLevel}"`);

    // 2a. Rapid backspacing (delete 6 chars one by one -> 18 chars)
    for (let i = 0; i < 6; i++) {
      let keyEvent = { type: 'keydown', key: 'Backspace', preventDefault: () => {} };
      field.dispatchEvent(keyEvent);
      field.textContent = field.textContent.slice(0, -1);
      field.dispatchEvent({ type: 'input' });
    }

    let levelAfterBackspace = group.getAttribute('data-text-fit');
    let test2a_passed = (field.textContent.length === 18) && (levelAfterBackspace === null);
    console.log(`  - 2a. De-escalation after rapid backspace (18 chars left): ${test2a_passed ? 'PASS' : 'FAIL'} (Level restored to: ${levelAfterBackspace || 0})`);

    // 2b. Text selection replacement while at Level 2 limit
    field.textContent = '1234567890123456789012345'; // 25 chars * 10 * 0.8 = 200
    field.dispatchEvent({ type: 'input' });

    // Select 10 chars and type 'X'
    mockSel.selectedText = '1234567890';
    let keyEventSel = { type: 'keydown', key: 'X', preventDefault: () => {} };
    let keyPrevented = false;
    keyEventSel.preventDefault = () => { keyPrevented = true; };
    field.dispatchEvent(keyEventSel);

    // Replace selected text with 'X' -> 16 chars
    field.textContent = 'X123456789012345';
    mockSel.selectedText = '';
    field.dispatchEvent({ type: 'input' });

    let test2b_passed = (!keyPrevented) && (field.textContent === 'X123456789012345') && (group.getAttribute('data-text-fit') === null);
    console.log(`  - 2b. Selection replacement allowed & level de-escalated: ${test2b_passed ? 'PASS' : 'FAIL'} (Key prevented: ${keyPrevented}, Text: "${field.textContent}", Level: ${group.getAttribute('data-text-fit') || 0})`);

    results.push({ test: 'Rapid backspace / selection replacement', pass: test2a_passed && test2b_passed });
  }

  // ----------------------------------------------------
  // TEST 3: Font loading / window resize / layout shift
  // ----------------------------------------------------
  console.log('\n[TEST 3] Font loading / window resize / layout shift behavior');
  {
    const group = new MockElement('div', 'infoblock');
    const field = new MockElement('div', 'info-zeile1', 'single-line');
    field.parentElement = group;
    group.children.push(field);
    field._mockClientWidth = 200;
    field.textContent = '12345678901234567890'; // 20 chars -> fits Level 0 initially (20*10 = 200)

    global.mockDOMNodes = [group, field];
    const engine = new TextFitEngine();
    engine.init();

    let initialLevel = group.getAttribute('data-text-fit');

    // Simulate font change or window resize: font rendering becomes 20% wider (_mockFontScale = 1.2)
    field._mockFontScale = 1.2;

    // While idle (no event fired), textFitEngine has not re-evaluated yet
    let idleLevel = group.getAttribute('data-text-fit');

    // Trigger explicit check / re-evaluation (e.g. checkAllGroups)
    engine.checkAllGroups();
    let reevaluatedLevel = group.getAttribute('data-text-fit');

    let test3_passed = (initialLevel === null) && (idleLevel === null) && (reevaluatedLevel === 'shrink');
    console.log(`  - 3a. Initial level (normal font): Level 0`);
    console.log(`  - 3b. Font width +20% (idle): Level ${idleLevel || 0} (Requires trigger/interaction to update)`);
    console.log(`  - 3c. Font width +20% (after checkAllGroups): Level "${reevaluatedLevel}"`);
    console.log(`  - 3d. Layout shift re-evaluation check: ${test3_passed ? 'PASS' : 'FAIL'}`);

    results.push({ test: 'Font loading / window resize / layout shift', pass: test3_passed });
  }

  // ----------------------------------------------------
  // TEST 4: Toast trigger popover stacking and swipe-to-dismiss compatibility
  // ----------------------------------------------------
  console.log('\n[TEST 4] Toast trigger popover stacking & swipe-to-dismiss compatibility');
  {
    const toastSys = new ToastSystem();
    const globalToast = new MockElement('div', 'toast-v4');
    const toastMessage = new MockElement('div', 'toast-message');
    const toastBadge = new MockElement('div', 'toast-badge');
    const toastClose = new MockElement('button', 'toast-close');

    toastSys.globalToast = globalToast;
    toastSys.toastMessage = toastMessage;
    toastSys.toastBadge = toastBadge;
    toastSys.toastClose = toastClose;
    globalToast.showPopover = () => {};
    globalToast.hidePopover = () => {};
    globalToast.matches = () => true;
    globalToast.setPointerCapture = () => {};

    // 4a. Rapid repeated toast triggers (Deduplication / Counter)
    toastSys.show('Maximalbreite erreicht', 'warning');
    toastSys.show('Maximalbreite erreicht', 'warning');
    toastSys.show('Maximalbreite erreicht', 'warning');

    let test4a_passed = (toastSys.toastCount === 3) && (toastBadge.textContent === 'x3') && (globalToast.dataset.shake === 'true');
    console.log(`  - 4a. Toast counter & shake on repeat: ${test4a_passed ? 'PASS' : 'FAIL'} (Count: ${toastSys.toastCount}, Badge: "${toastBadge.textContent}", Shake: ${globalToast.dataset.shake})`);

    // 4b. Swipe-to-dismiss threshold test (>80px swipe right)
    toastSys.isSwiping = true;
    toastSys.startX = 100;
    
    // Simulate pointer move to 200 (+100px deltaX)
    let moveEvt = { clientX: 200, preventDefault: () => {} };
    toastSys.onPointerMove(moveEvt);

    let swipeX = globalToast.style['--swipe-x'];
    
    // Simulate pointer up
    toastSys.onPointerUp({});

    let test4b_passed = (swipeX === '100px') && (toastSys.currentToast === null);
    console.log(`  - 4b. Swipe-to-dismiss (>80px threshold): ${test4b_passed ? 'PASS' : 'FAIL'} (SwipeX: ${swipeX}, Toast dismissed cleanly)`);

    results.push({ test: 'Toast popover stacking & swipe-to-dismiss', pass: test4a_passed && test4b_passed });
  }

  // Summary
  console.log('\n==================================================');
  console.log('SUMMARY OF EMPIRICAL TEST HARNESS RESULTS');
  console.log('==================================================');
  let allPassed = true;
  for (const r of results) {
    console.log(`- ${r.test}: ${r.pass ? '✅ PASSED' : '... ' + (r.pass ? 'PASSED' : 'FAILED')}`);
    if (!r.pass) allPassed = false;
  }
  console.log(`\nOverall Test Harness Result: ${allPassed ? 'ALL PASSED (100% SUCCESS)' : 'SOME FAILED'}`);
}

runEmpiricalVerification().catch(err => {
  console.error('Test Harness Error:', err);
  process.exit(1);
});
