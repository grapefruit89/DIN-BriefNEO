/**
 * @file debug-panel.js
 * @description Einheitliches Debug-Panel-Framework für DIN-BriefNEO.
 * Stellt createDebugPanel(rootEl, options) als gemeinsame Basis bereit
 * (Drag & Drop, Snapping, Minimieren, Doppelklick-Reset, Keyboard-A11y, Persistenz)
 * und exportiert mountAutocompletePanel() sowie mountJsonPanel().
 */

// @ts-ignore
import { buildDINLetterJSON } from './persistence.js?v=p1';
import { eventBus, Events } from './core.js';

// ============================================================================
// HELPER: Zeitstempel (Temporal API mit Performance-Fallback)
// ============================================================================

function getTemporalTimeString() {
  try {
    // @ts-ignore
    if (typeof Temporal !== 'undefined' && Temporal.Now) {
      // @ts-ignore
      const zdt = Temporal.Now.zonedDateTimeISO('Europe/Berlin');
      return zdt.toPlainTime().toString().slice(0, 12);
    }
  } catch (_) {}
  return '';
}

function getTemporalEpochMs() {
  try {
    // @ts-ignore
    if (typeof Temporal !== 'undefined' && Temporal.Now) {
      // @ts-ignore
      return Temporal.Now.zonedDateTimeISO('Europe/Berlin').epochMilliseconds;
    }
  } catch (_) {}
  return performance.now();
}

/**
 * @param {string} text
 * @param {HTMLElement | null} [btnEl]
 */
function copyToClipboard(text, btnEl = null) {
  if (typeof text !== 'string') return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    const origText = btnEl ? (btnEl.getAttribute('data-original-text') || btnEl.textContent || '') : '';
    if (btnEl && !btnEl.getAttribute('data-original-text')) {
      btnEl.setAttribute('data-original-text', origText);
    }
    navigator.clipboard.writeText(text).then(() => {
      if (btnEl) {
        btnEl.textContent = '✓ Kopiert';
        setTimeout(() => {
          if (btnEl) {
            btnEl.textContent = btnEl.getAttribute('data-original-text') || origText;
            btnEl.removeAttribute('data-original-text');
          }
        }, 1500);
      }
    }).catch(() => {});
  }
}

/**
 * @typedef {Object} DebugPanelOptions
 * @property {string} storageKey - Eindeutiger Schlüssel für localStorage (z. B. 'autocomplete', 'json')
 * @property {() => (string | Promise<string>)} [onCopy] - Liefert den zu kopierenden String
 * @property {() => void} [onClear] - Wird beim Klick auf Clear ausgeführt
 * @property {boolean} [confirmClear] - Ob vor dem Leeren eine Bestätigung (confirm) nötig ist
 * @property {() => void} [onPause] - Wird beim Pausieren aufgerufen
 * @property {() => void} [onResume] - Wird beim Fortsetzen aufgerufen
 * @property {() => void} [onClose] - Wird beim Schließen ausgeführt
 * @property {() => number} [getStepCount] - Liefert aktuelle Schrittanzahl (für confirm)
 */

/**
 * Initialisiert das Verhalten eines Debug-Panels.
 * @param {HTMLElement} rootEl
 * @param {DebugPanelOptions} options
 */
export function createDebugPanel(rootEl, options) {
  // @ts-ignore
  if (rootEl.__debugPanelController) {
    // @ts-ignore
    return rootEl.__debugPanelController;
  }

  const storageKey = options.storageKey || 'default';
  const posKey = `debug-panel-pos-${storageKey}`;
  const modeKey = `debug-panel-mode-${storageKey}`;

  const header = /** @type {HTMLElement | null} */ (rootEl.querySelector('.debug-header'));
  const body = /** @type {HTMLElement | null} */ (rootEl.querySelector('[data-role="body"], .debug-body'));
  const badge = /** @type {HTMLElement | null} */ (rootEl.querySelector('.debug-badge'));
  const btnPause = /** @type {HTMLButtonElement | null} */ (rootEl.querySelector('[data-action="pause"], #rec-btn-toggle, #json-btn-toggle'));
  const btnMin = /** @type {HTMLButtonElement | null} */ (rootEl.querySelector('[data-action="minimize"], #rec-btn-min, #json-btn-min'));
  const btnClear = /** @type {HTMLButtonElement | null} */ (rootEl.querySelector('[data-action="clear"], #rec-btn-clear, #json-btn-clear'));
  const btnClose = /** @type {HTMLButtonElement | null} */ (rootEl.querySelector('[data-action="close"], #json-btn-close, #rec-btn-close'));
  const btnCopy = /** @type {HTMLButtonElement | null} */ (rootEl.querySelector('[data-action="copy"], [data-action="copy-all"], #rec-btn-copy-all, #json-btn-copy'));

  let isPaused = false;
  let isMinimized = false;
  let isDragging = false;
  let dragStartPointerX = 0;
  let dragStartPointerY = 0;
  let initialPanelLeft = 0;
  let initialPanelTop = 0;

  /**
   * @param {'right' | 'left' | string} mode
   * @param {boolean} [persist=true]
   */
  function applySnap(mode, persist = true) {
    rootEl.classList.remove('snap-left', 'snap-right');
    delete rootEl.dataset.mode;
    rootEl.style.removeProperty('--drag-x');
    rootEl.style.removeProperty('--drag-y');
    rootEl.style.left = '';
    rootEl.style.top = '';
    rootEl.style.right = '';
    rootEl.style.bottom = '';

    if (mode === 'right') {
      rootEl.dataset.snap = 'right';
      rootEl.classList.add('snap-right');
      if (persist) {
        localStorage.setItem(modeKey, 'right');
        localStorage.removeItem(posKey);
      }
    } else if (mode === 'left') {
      rootEl.dataset.snap = 'left';
      rootEl.classList.add('snap-left');
      if (persist) {
        localStorage.setItem(modeKey, 'left');
        localStorage.removeItem(posKey);
      }
    }
  }

  /**
   * Clamps coordinates so panel stays fully within the visible viewport.
   * Panel right edge never exceeds viewport (all buttons visible).
   * Panel header is always reachable at top and bottom.
   * @param {number} left
   * @param {number} top
   * @returns {{ left: number, top: number }}
   */
  function clampToViewport(left, top) {
    const width = rootEl.offsetWidth || 440;
    const minVisibleHeight = 60;
    const maxLeft = Math.max(0, window.innerWidth - width);
    const maxTop = Math.max(0, window.innerHeight - minVisibleHeight);
    return {
      left: Math.max(0, Math.min(Math.round(left), maxLeft)),
      top: Math.max(0, Math.min(Math.round(top), maxTop))
    };
  }

  /**
   * @param {number} left
   * @param {number} top
   * @param {boolean} [persist=true]
   */
  function applyFloating(left, top, persist = true) {
    rootEl.classList.remove('snap-left', 'snap-right');
    delete rootEl.dataset.snap;
    rootEl.dataset.mode = 'floating';

    rootEl.style.left = '';
    rootEl.style.top = '';
    rootEl.style.right = '';
    rootEl.style.bottom = '';

    const clamped = clampToViewport(left, top);
    rootEl.style.setProperty('--drag-x', `${clamped.left}px`);
    rootEl.style.setProperty('--drag-y', `${clamped.top}px`);

    if (persist) {
      localStorage.setItem(modeKey, 'floating');
      localStorage.setItem(posKey, JSON.stringify({ left: clamped.left, top: clamped.top }));
    }
  }

  function resetToDefault() {
    rootEl.classList.remove('snap-left', 'snap-right');
    delete rootEl.dataset.mode;
    delete rootEl.dataset.snap;
    rootEl.style.removeProperty('--drag-x');
    rootEl.style.removeProperty('--drag-y');
    rootEl.style.left = '';
    rootEl.style.top = '';
    rootEl.style.right = '';
    rootEl.style.bottom = '';
    localStorage.removeItem(modeKey);
    localStorage.removeItem(posKey);
  }

  function restorePosition() {
    try {
      const mode = localStorage.getItem(modeKey);
      if (mode === 'right' || mode === 'left') {
        applySnap(mode, false);
        return;
      }
      const rawPos = localStorage.getItem(posKey);
      if (rawPos) {
        const { left, top } = JSON.parse(rawPos);
        if (typeof left === 'number' && typeof top === 'number') {
          const width = rootEl.offsetWidth || 440;
          const minVisibleHeight = 60;
          const maxLeft = Math.max(0, window.innerWidth - width);
          const maxTop = Math.max(0, window.innerHeight - minVisibleHeight);

          // Validierung: Falls außerhalb des sichtbaren Viewports -> Reset auf Default
          if (left < 0 || left > maxLeft || top < 0 || top > maxTop) {
            resetToDefault();
            return;
          }

          applyFloating(left, top, false);
          return;
        }
      }
    } catch (_) {}
  }

  function toggleMinimize() {
    isMinimized = !isMinimized;
    rootEl.classList.toggle('minimized', isMinimized);
    if (body) body.classList.toggle('is-hidden', isMinimized);
    if (btnMin) btnMin.textContent = isMinimized ? '▢' : '_';
  }

  /**
   * @param {boolean} paused
   */
  function setPaused(paused) {
    isPaused = Boolean(paused);
    if (badge) {
      badge.textContent = isPaused ? 'PAUSE' : 'LIVE';
      badge.setAttribute('data-state', isPaused ? 'pause' : 'live');
    }
    if (btnPause) {
      btnPause.textContent = isPaused ? '▶️' : '⏸️';
    }
    if (isPaused) {
      if (typeof options.onPause === 'function') options.onPause();
    } else {
      if (typeof options.onResume === 'function') options.onResume();
    }
  }

  // Pointer drag & snap
  if (header) {
    header.addEventListener('pointerdown', (e) => {
      if (/** @type {HTMLElement} */ (e.target).closest('button, input, label')) return;
      isDragging = true;
      header.classList.add('is-dragging');
      try {
        header.setPointerCapture(e.pointerId);
      } catch (_) {}

      const rect = rootEl.getBoundingClientRect();
      dragStartPointerX = e.clientX;
      dragStartPointerY = e.clientY;
      const curDragX = parseFloat(rootEl.style.getPropertyValue('--drag-x'));
      const curDragY = parseFloat(rootEl.style.getPropertyValue('--drag-y'));
      initialPanelLeft = !isNaN(curDragX) ? curDragX : (rect.left || 0);
      initialPanelTop = !isNaN(curDragY) ? curDragY : (rect.top || 0);
    });

    header.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartPointerX;
      const deltaY = e.clientY - dragStartPointerY;
      const newLeft = initialPanelLeft + deltaX;
      const newTop = initialPanelTop + deltaY;

      const snapThreshold = 40;
      const width = rootEl.offsetWidth || 440;
      const distRight = window.innerWidth - (newLeft + width);
      const distLeft = newLeft;

      if (distRight <= snapThreshold && distRight >= -40) {
        applySnap('right', false);
      } else if (distLeft <= snapThreshold && distLeft >= -40) {
        applySnap('left', false);
      } else {
        applyFloating(newLeft, newTop, false);
      }
    });

    /** @param {Event | null} [e=null] */
    const endDrag = (e = null) => {
      if (!isDragging) return;
      isDragging = false;
      header.classList.remove('is-dragging');
      if (e && 'pointerId' in e) {
        try {
          header.releasePointerCapture(/** @type {PointerEvent} */ (e).pointerId);
        } catch (_) {}
      }

      if (rootEl.dataset.snap === 'right' || rootEl.classList.contains('snap-right')) {
        localStorage.setItem(modeKey, 'right');
        localStorage.removeItem(posKey);
      } else if (rootEl.dataset.snap === 'left' || rootEl.classList.contains('snap-left')) {
        localStorage.setItem(modeKey, 'left');
        localStorage.removeItem(posKey);
      } else {
        const dragX = parseFloat(rootEl.style.getPropertyValue('--drag-x'));
        const dragY = parseFloat(rootEl.style.getPropertyValue('--drag-y'));
        const clamped = clampToViewport(
          !isNaN(dragX) ? dragX : (rootEl.offsetLeft || 0),
          !isNaN(dragY) ? dragY : (rootEl.offsetTop || 0)
        );
        applyFloating(clamped.left, clamped.top, true);
      }
    };

    header.addEventListener('pointerup', endDrag);
    header.addEventListener('pointercancel', endDrag);
    header.addEventListener('lostpointercapture', endDrag);
    window.addEventListener('blur', () => endDrag(null));

    // Doppelklick -> Default-Position
    header.addEventListener('dblclick', (e) => {
      if (/** @type {HTMLElement} */ (e.target).closest('button, input, label')) return;
      endDrag(null);
      resetToDefault();
    });

    // Keyboard-Steuerung
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        endDrag(null);
        resetToDefault();
        return;
      }
      const step = 10;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const rect = rootEl.getBoundingClientRect();
        const curDragX = parseFloat(rootEl.style.getPropertyValue('--drag-x'));
        const curDragY = parseFloat(rootEl.style.getPropertyValue('--drag-y'));
        let curLeft = !isNaN(curDragX) ? curDragX : (rect.left || 0);
        let curTop = !isNaN(curDragY) ? curDragY : (rect.top || 0);
        if (e.key === 'ArrowLeft') curLeft -= step;
        if (e.key === 'ArrowRight') curLeft += step;
        if (e.key === 'ArrowUp') curTop -= step;
        if (e.key === 'ArrowDown') curTop += step;
        applyFloating(curLeft, curTop, true);
      }
    });
  }

  // Aktionen verdrahten
  if (btnPause) {
    btnPause.addEventListener('click', () => setPaused(!isPaused));
  }

  if (btnMin) {
    btnMin.addEventListener('click', toggleMinimize);
  }

  if (btnClear && typeof options.onClear === 'function') {
    btnClear.addEventListener('click', () => {
      if (options.confirmClear) {
        const count = typeof options.getStepCount === 'function' ? options.getStepCount() : 1;
        if (count > 0) {
          if (!window.confirm('Verlauf leeren?')) return;
        }
      }
      options.onClear?.();
    });
  }

  if (btnCopy && typeof options.onCopy === 'function') {
    btnCopy.addEventListener('click', () => {
      const res = options.onCopy?.();
      if (typeof res === 'string') {
        copyToClipboard(res, btnCopy);
      } else if (res && typeof res.then === 'function') {
        res.then((/** @type {string} */ text) => copyToClipboard(text, btnCopy)).catch(() => {});
      }
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      const debugParam = options.storageKey;
      if (debugParam && window?.location?.href) {
        try {
          const url = new URL(window.location.href);
          const debugVal = url.searchParams.get('debug');
          if (debugVal) {
            const rest = debugVal
              .split(',')
              .map(s => s.trim())
              .filter(x => x && x.toLowerCase() !== debugParam.toLowerCase());
            if (rest.length > 0) {
              url.searchParams.set('debug', rest.join(','));
            } else {
              url.searchParams.delete('debug');
            }
          }
          const cleanSearch = url.search ? url.search.replace(/%2C/gi, ',') : '';
          const newUrl = url.pathname + cleanSearch + url.hash;
          window.history.replaceState(null, '', newUrl);
        } catch (_) {}
      }
      rootEl.hidden = true;
      if (typeof options.onClose === 'function') {
        options.onClose();
      }
    });
  }

  restorePosition();

  // Viewport-Resize: Panel innerhalb der sichtbaren Grenzen halten
  window.addEventListener('resize', () => {
    if (rootEl.dataset.mode === 'floating') {
      const curX = parseFloat(rootEl.style.getPropertyValue('--drag-x'));
      const curY = parseFloat(rootEl.style.getPropertyValue('--drag-y'));
      if (!isNaN(curX) && !isNaN(curY)) {
        const clamped = clampToViewport(curX, curY);
        if (clamped.left !== curX || clamped.top !== curY) {
          applyFloating(clamped.left, clamped.top, true);
        }
      }
    }
  });

  const controller = {
    rootEl,
    applyFloating,
    applySnap,
    resetToDefault,
    toggleMinimize,
    setPaused,
    isPaused: () => isPaused,
    isMinimized: () => isMinimized
  };

  // @ts-ignore
  rootEl.__debugPanelController = controller;
  return controller;
}

// ============================================================================
// PANEL A: AUTOCOMPLETE-RECORDER
// ============================================================================

/**
 * @typedef {Object} RecorderStep
 * @property {number} stepIndex
 * @property {string} text
 * @property {string[]} items
 * @property {number} itemCount
 * @property {string} tag
 * @property {number} timestamp
 * @property {string} timeStr
 */

/** @type {RecorderStep[]} */
const recorderSteps = [];
let hideEmptySteps = false;
let recorderActive = true;
/** @type {MutationObserver | null} */
let currentObserver = null;
const MAX_STEPS = 100;

function getDropdownItems() {
  const popover = document.getElementById('plz-suggestions-popover');
  if (!popover) return [];

  let isOpen = false;
  try {
    isOpen = popover.matches(':popover-open');
  } catch (_) {
    isOpen = Boolean(popover.offsetWidth || popover.offsetHeight || popover.getClientRects().length);
  }
  if (!isOpen) return [];

  /** @type {string[]} */
  const items = [];
  const listItems = popover.querySelectorAll('li.suggestion-item, li[role="option"]');
  listItems.forEach(li => {
    const txt = (li.textContent || '').replace(/\s+/g, ' ').trim();
    if (txt) items.push(txt);
  });
  return items;
}

/**
 * @param {RecorderStep} step
 */
function createStepSummaryDOM(step) {
  const header = document.createElement('div');
  header.className = 'debug-step-header-left';

  const numSpan = document.createElement('span');
  numSpan.className = 'debug-step-num';
  numSpan.textContent = `[${step.stepIndex}]`;
  header.appendChild(numSpan);

  const textSpan = document.createElement('span');
  textSpan.className = 'debug-step-text';
  textSpan.textContent = `"${step.text}"`;
  header.appendChild(textSpan);

  const countSpan = document.createElement('span');
  countSpan.className = 'debug-step-count';
  countSpan.textContent = `– ${step.itemCount} items`;
  header.appendChild(countSpan);

  if (step.tag) {
    const tagSpan = document.createElement('span');
    tagSpan.className = 'debug-step-tag';
    tagSpan.textContent = step.tag;
    header.appendChild(tagSpan);
  }

  return header;
}

/**
 * @param {RecorderStep} step
 */
function createStepContentDOM(step) {
  const content = document.createElement('div');
  content.className = 'debug-step-content';

  const metaRow = document.createElement('div');
  metaRow.className = 'debug-step-meta';

  const timeSpan = document.createElement('span');
  timeSpan.className = 'debug-step-time';
  timeSpan.textContent = step.timeStr;
  metaRow.appendChild(timeSpan);

  content.appendChild(metaRow);

  if (step.items.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'debug-no-items';
    emptyNotice.textContent = '(keine Dropdown-Einträge)';
    content.appendChild(emptyNotice);
  } else {
    const ol = document.createElement('ol');
    ol.className = 'debug-items-list';
    ol.start = 0;

    step.items.forEach((/** @type {string} */ item, /** @type {number} */ idx) => {
      const li = document.createElement('li');

      const idxSpan = document.createElement('span');
      idxSpan.className = 'debug-item-idx';
      idxSpan.textContent = `${idx}:`;

      const valSpan = document.createElement('span');
      valSpan.className = 'debug-item-val';
      valSpan.textContent = item;

      li.appendChild(idxSpan);
      li.appendChild(valSpan);
      ol.appendChild(li);
    });

    content.appendChild(ol);
  }

  return content;
}

function updateCounterDOM() {
  const counterEl = document.getElementById('rec-counter') || document.querySelector('#panel-autocomplete [data-role="counter"]');
  if (!counterEl) return;
  const totalCount = recorderSteps.length;
  const visibleCount = hideEmptySteps ? recorderSteps.filter(s => s.itemCount > 0).length : totalCount;
  counterEl.textContent = `(${visibleCount} von ${totalCount} Schritten sichtbar)`;
}

/**
 * @param {RecorderStep} step
 * @param {HTMLElement} container
 */
function renderStepElement(step, container) {
  const details = document.createElement('details');
  details.className = 'debug-step';
  details.open = true;
  details.id = `debug-step-${step.stepIndex}`;
  details.setAttribute('data-step-index', String(step.stepIndex));
  details.setAttribute('data-item-count', String(step.itemCount));

  const summary = document.createElement('summary');
  summary.className = 'debug-step-summary';
  summary.appendChild(createStepSummaryDOM(step));
  details.appendChild(summary);

  const content = createStepContentDOM(step);
  details.appendChild(content);

  container.appendChild(details);
}

function renderAllSteps() {
  const bodyEl = document.getElementById('rec-body') || document.querySelector('#panel-autocomplete [data-role="body"]');
  if (!bodyEl) return;

  const existingSteps = bodyEl.querySelectorAll('.debug-step');
  existingSteps.forEach(el => el.remove());

  const emptyEl = document.getElementById('rec-empty');
  const visibleSteps = hideEmptySteps ? recorderSteps.filter(s => s.itemCount > 0) : recorderSteps;

  if (visibleSteps.length === 0) {
    if (emptyEl) {
      emptyEl.classList.remove('is-hidden');
      emptyEl.textContent = recorderSteps.length > 0
        ? 'Alle Schritte wegen Spam-Filter ausgeblendet'
        : 'Warte auf Eingabe in #empfaenger-ort...';
    }
  } else {
    if (emptyEl) emptyEl.classList.add('is-hidden');
    visibleSteps.forEach(s => renderStepElement(s, bodyEl));
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  updateCounterDOM();
}

/**
 * @param {RecorderStep} step
 */
function renderNewStepDOM(step) {
  updateCounterDOM();
  if (hideEmptySteps && step.itemCount === 0) return;

  const emptyEl = document.getElementById('rec-empty');
  if (emptyEl) emptyEl.classList.add('is-hidden');

  const bodyEl = document.getElementById('rec-body') || document.querySelector('#panel-autocomplete [data-role="body"]');
  if (!bodyEl) return;

  renderStepElement(step, bodyEl);
  bodyEl.scrollTop = bodyEl.scrollHeight;
}

/**
 * @param {RecorderStep} step
 */
function updateStepDOM(step) {
  const details = document.getElementById(`debug-step-${step.stepIndex}`);
  if (!details) return;

  const summary = details.querySelector('summary');
  if (summary) {
    summary.replaceChildren(createStepSummaryDOM(step));
  }

  const oldContent = details.querySelector('.debug-step-content');
  if (oldContent) {
    oldContent.replaceWith(createStepContentDOM(step));
  }
}

function recordStep() {
  if (!recorderActive) return;

  const ortEl = document.getElementById('empfaenger-ort');
  if (!ortEl) return;

  const currentText = (ortEl.textContent || '').trim();
  const currentItems = getDropdownItems();
  const itemCount = currentItems.length;
  const firstItem = currentItems[0] || '';

  const lastStep = recorderSteps[recorderSteps.length - 1];

  if (lastStep) {
    // Duplikat-Filter
    if (lastStep.text === currentText && lastStep.itemCount === itemCount && (lastStep.items[0] || '') === firstItem) {
      return;
    }

    // In-Place Update (Debounce catchup)
    if (lastStep.text === currentText && lastStep.itemCount !== itemCount) {
      const wasZero = lastStep.itemCount === 0;
      lastStep.items = currentItems;
      lastStep.itemCount = itemCount;
      lastStep.timestamp = getTemporalEpochMs();
      lastStep.timeStr = getTemporalTimeString();

      if (hideEmptySteps) {
        if (wasZero && itemCount > 0) {
          const emptyEl = document.getElementById('rec-empty');
          if (emptyEl) emptyEl.classList.add('is-hidden');
          const bodyEl = document.getElementById('rec-body') || document.querySelector('#panel-autocomplete [data-role="body"]');
          if (bodyEl) {
            renderStepElement(lastStep, bodyEl);
            bodyEl.scrollTop = bodyEl.scrollHeight;
          }
        } else if (!wasZero && itemCount === 0) {
          const el = document.getElementById(`debug-step-${lastStep.stepIndex}`);
          if (el) el.remove();
        } else if (itemCount > 0) {
          updateStepDOM(lastStep);
        }
      } else {
        updateStepDOM(lastStep);
      }

      updateCounterDOM();
      return;
    }
  }

  let tag = '';
  if (lastStep && currentText.length < lastStep.text.length) {
    tag = 'Backspace';
  }

  const stepIndex = recorderSteps.length + 1;
  const newStep = {
    stepIndex,
    text: currentText,
    items: currentItems,
    itemCount,
    tag,
    timestamp: getTemporalEpochMs(),
    timeStr: getTemporalTimeString()
  };

  recorderSteps.push(newStep);

  if (recorderSteps.length > MAX_STEPS) {
    recorderSteps.shift();
    const bodyEl = document.getElementById('rec-body') || document.querySelector('#panel-autocomplete [data-role="body"]');
    const firstStepEl = bodyEl?.querySelector('.debug-step');
    if (firstStepEl) firstStepEl.remove();
  }

  renderNewStepDOM(newStep);
}

function clearSteps() {
  recorderSteps.length = 0;
  const bodyEl = document.getElementById('rec-body') || document.querySelector('#panel-autocomplete [data-role="body"]');
  if (bodyEl) {
    const existingSteps = bodyEl.querySelectorAll('.debug-step');
    existingSteps.forEach(el => el.remove());
  }
  const emptyEl = document.getElementById('rec-empty');
  if (emptyEl) {
    emptyEl.classList.remove('is-hidden');
    emptyEl.textContent = 'Warte auf Eingabe in #empfaenger-ort...';
  }
  updateCounterDOM();
}

/**
 * Montiert das Autocomplete-Recorder-Panel.
 * @param {boolean} [force=false]
 */
export function mountAutocompletePanel(force = false) {
  const urlParams = new URLSearchParams(window.location.search);
  const debugVal = urlParams.get('debug') || '';
  const debugModes = debugVal.split(',').map(s => s.trim().toLowerCase());
  if (!force && !debugModes.includes('autocomplete')) {
    return;
  }

  const root = /** @type {HTMLElement | null} */ (document.getElementById('panel-autocomplete') || document.getElementById('autocomplete-debug-panel'));
  if (!root) return;
  root.hidden = false;

  const btnCopyReset = /** @type {HTMLElement | null} */ (root.querySelector('[data-action="copy-all"], #rec-btn-copy-all'));
  if (btnCopyReset) btnCopyReset.textContent = '📋 Alles';

  const controller = createDebugPanel(root, {
    storageKey: 'autocomplete',
    confirmClear: true,
    onCopy: () => JSON.stringify(recorderSteps.map(s => ({
      step: s.stepIndex,
      time: s.timeStr,
      text: s.text,
      itemCount: s.itemCount,
      tag: s.tag,
      items: s.items,
      timestamp: s.timestamp
    })), null, 2),
    onClear: () => clearSteps(),
    onPause: () => {
      recorderActive = false;
      if (currentObserver) {
        currentObserver.disconnect();
        currentObserver = null;
      }
    },
    onResume: () => {
      recorderActive = true;
      const popoverEl = document.getElementById('plz-suggestions-popover');
      if (popoverEl && !currentObserver) {
        currentObserver = new MutationObserver(() => recordStep());
        currentObserver.observe(popoverEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'popover'] });
      }
    },
    getStepCount: () => recorderSteps.length
  });

  // Filter-Checkbox verdrahten
  const filterCheckbox = /** @type {HTMLInputElement | null} */ (document.getElementById('rec-filter-empty') || root.querySelector('[data-role="filter-empty"]'));
  if (filterCheckbox) {
    filterCheckbox.checked = hideEmptySteps;
    filterCheckbox.addEventListener('change', () => {
      hideEmptySteps = filterCheckbox.checked;
      renderAllSteps();
    });
  }

  // Observer & Input verdrahten
  const empfOrtEl = document.getElementById('empfaenger-ort');
  const popoverEl = document.getElementById('plz-suggestions-popover');

  if (empfOrtEl) {
    empfOrtEl.addEventListener('input', () => recordStep());
  }

  if (popoverEl) {
    currentObserver = new MutationObserver(() => recordStep());
    currentObserver.observe(popoverEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'popover']
    });
  }

  // Power-User API am window-Objekt
  /** @type {any} */ (window).__rec = {
    get steps() { return recorderSteps; },
    get hideEmptySteps() { return hideEmptySteps; },
    /** @param {boolean} val */
    setHideEmptySteps(val) {
      hideEmptySteps = Boolean(val);
      if (filterCheckbox) filterCheckbox.checked = hideEmptySteps;
      renderAllSteps();
    },
    dump() {
      console.table(recorderSteps.map(s => ({
        step: s.stepIndex,
        text: s.text,
        items: s.itemCount,
        tag: s.tag,
        sample: s.items[0] || ''
      })));
      return recorderSteps;
    },
    dumpJSON() {
      return JSON.stringify(recorderSteps, null, 2);
    },
    clear() {
      clearSteps();
    },
    resetPosition() {
      controller.resetToDefault();
    },
    /** @param {'right' | 'left'} mode */
    snap(mode) {
      controller.applySnap(mode);
    },
    /**
     * @param {number} left
     * @param {number} top
     */
    setPosition(left, top) {
      controller.applyFloating(left, top);
    },
    stop() {
      controller.setPaused(true);
    },
    start() {
      controller.setPaused(false);
    }
  };

  /** @type {any} */ (window).__dumpJSON = () => JSON.stringify(recorderSteps, null, 2);
  /** @type {any} */ (window).__dump = () => (/** @type {any} */ (window).__rec?.dump());

  updateCounterDOM();
}

// ============================================================================
// PANEL B: DIN-LETTER JSON PANEL
// ============================================================================

let jsonLastString = '';
/** @type {any} */
let jsonDebounceTimer = null;
let jsonIsPaused = false;

function updateJSON(force = false) {
  if (jsonIsPaused && !force) return;
  const root = document.getElementById('panel-json') || document.getElementById('dinletter-json-debug-panel');
  if (root && root.hidden && !force) return;
  const codeEl = document.getElementById('json-debug-code');
  if (!codeEl) return;

  const payload = buildDINLetterJSON();
  const jsonStr = JSON.stringify(payload, null, 2);
  if (jsonStr === jsonLastString && !force) return;

  jsonLastString = jsonStr;
  codeEl.textContent = jsonStr;
}

function scheduleJsonUpdate() {
  if (jsonIsPaused) return;
  if (jsonDebounceTimer) clearTimeout(jsonDebounceTimer);
  jsonDebounceTimer = setTimeout(() => {
    updateJSON();
  }, 200);
}

/**
 * Montiert das DIN-Letter JSON-Panel.
 * @param {boolean} [force=false]
 */
export function mountJsonPanel(force = false) {
  const urlParams = new URLSearchParams(window.location.search);
  const debugVal = urlParams.get('debug') || '';
  const debugModes = debugVal.split(',').map(s => s.trim().toLowerCase());
  if (!force && !debugModes.includes('json')) {
    return;
  }

  const root = /** @type {HTMLElement | null} */ (document.getElementById('panel-json') || document.getElementById('dinletter-json-debug-panel'));
  if (!root) return;
  root.hidden = false;

  const btnCopyReset = /** @type {HTMLElement | null} */ (root.querySelector('[data-action="copy"], #json-btn-copy'));
  if (btnCopyReset) btnCopyReset.textContent = '📋 Kopieren';

  const controller = createDebugPanel(root, {
    storageKey: 'json',
    onCopy: () => JSON.stringify(buildDINLetterJSON(), null, 2),
    onClear: () => {
      const codeEl = document.getElementById('json-debug-code');
      if (codeEl) codeEl.textContent = '';
      jsonLastString = '';
    },
    onPause: () => {
      jsonIsPaused = true;
    },
    onResume: () => {
      jsonIsPaused = false;
      updateJSON();
    }
  });

  // Initiales Rendern
  updateJSON(true);
  setTimeout(() => updateJSON(true), 250);

  // Live-Events abonnieren
  document.addEventListener('input', scheduleJsonUpdate, { passive: true });
  document.addEventListener('change', scheduleJsonUpdate, { passive: true });
  eventBus.subscribe(Events.DOCUMENT_SAVED, scheduleJsonUpdate);
  eventBus.subscribe(Events.DOCUMENT_SAVE_REQUESTED, scheduleJsonUpdate);
  eventBus.subscribe(Events.DOCUMENT_CHANGED, scheduleJsonUpdate);

  try {
    const observer = new MutationObserver(() => scheduleJsonUpdate());
    const target = document.getElementById('letter-page') || document.getElementById('app-shell') || document.body;
    observer.observe(target, { childList: true, subtree: true, characterData: true });
  } catch (_) {}

  // Power-User API am window-Objekt
  /** @type {any} */ (window).__jsonDebug = {
    getJSON() {
      return buildDINLetterJSON();
    },
    getJSONString() {
      return JSON.stringify(buildDINLetterJSON(), null, 2);
    },
    copy() {
      const json = JSON.stringify(buildDINLetterJSON(), null, 2);
      navigator.clipboard.writeText(json).catch(() => {});
      return json;
    },
    pause() {
      controller.setPaused(true);
    },
    resume() {
      controller.setPaused(false);
    },
    refresh() {
      updateJSON(true);
    },
    resetPosition() {
      controller.resetToDefault();
    },
    /** @param {'right' | 'left'} mode */
    snap(mode) {
      controller.applySnap(mode);
    },
    /**
     * @param {number} left
     * @param {number} top
     */
    setPosition(left, top) {
      controller.applyFloating(left, top);
    }
  };
}

// ============================================================================
// KOMPATIBILITÄTS-EXPORTE
// ============================================================================
export { mountAutocompletePanel as initAutocompleteRecorder, mountJsonPanel as initJSONDebugPanel };
