// @ts-check

/**
 * @typedef {Object} WindowAI
 * @property {any} [languageModel]
 * @property {any} [assistant]
 */

/**
 * @type {Window & typeof globalThis & { ai?: WindowAI }}
 */
const _window = /** @type {any} */ (window);

document.addEventListener('DOMContentLoaded', () => {
  initPromptAPI();
  initGapDecorations();
  initTextFit();
  initFocusgroup();
});

/**
 * Helper: Update status badge
 * @param {string} badgeId
 * @param {boolean} isSupported
 */
function updateStatus(badgeId, isSupported) {
  const badge = document.getElementById(badgeId);
  if (badge) {
    if (isSupported) {
      badge.textContent = 'Native Support';
      badge.className = 'status-badge supported';
    } else {
      badge.textContent = 'Fallback Active';
      badge.className = 'status-badge unsupported';
    }
  }
}

// ==========================================
// 1. Prompt API (window.ai)
// ==========================================
async function initPromptAPI() {
  const hasPromptAPI = typeof _window.ai !== 'undefined' && 
                       (typeof _window.ai.languageModel !== 'undefined' || typeof _window.ai.assistant !== 'undefined');
  
  updateStatus('status-prompt-api', hasPromptAPI);

  /** @type {HTMLButtonElement | null} */
  const submitBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('prompt-submit'));
  /** @type {HTMLTextAreaElement | HTMLInputElement | null} */
  const inputArea = /** @type {HTMLTextAreaElement | HTMLInputElement | null} */ (document.getElementById('prompt-input'));
  const outputBox = document.getElementById('prompt-output');

  if (!submitBtn || !inputArea || !outputBox) return;

  submitBtn.addEventListener('click', async () => {
    const promptText = inputArea.value.trim();
    if (!promptText) return;

    outputBox.textContent = 'Processing request...';
    submitBtn.disabled = true;

    if (hasPromptAPI && _window.ai) {
      try {
        // Query offline capabilities
        const modelAPI = _window.ai.languageModel || _window.ai.assistant;
        const capabilities = await modelAPI.capabilities();
        
        if (capabilities.available === 'no') {
          outputBox.textContent = 'Error: The offline language model is not supported on this browser profile.';
          submitBtn.disabled = false;
          return;
        }

        // Create AI session
        const session = await modelAPI.create({
          systemPrompt: 'You are a helpful assistant.'
        });

        outputBox.textContent = '';
        
        // Execute prompt streaming
        const stream = session.promptStreaming(promptText);
        for await (const chunk of stream) {
          outputBox.textContent = chunk;
        }
        
        session.destroy();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        outputBox.textContent = `Prompt API Error: ${errorMsg}\n(Make sure Chrome flags are enabled: chrome://flags/#optimization-guide-on-device-model)`;
      }
    } else {
      // Fallback: Mock offline assistant response with typing simulation
      simulateMockAI(promptText, outputBox);
    }
    submitBtn.disabled = false;
  });
}

/**
 * @param {string} prompt
 * @param {HTMLElement} outputElement
 */
function simulateMockAI(prompt, outputElement) {
  const response = `[Mock Offline Assistant Response]\n\nYou asked: "${prompt}"\n\nSince window.ai is not natively available in this browser profile, this is a simulated response. In Chrome 148-150 with window.ai active, Gemini Nano handles this request locally and offline without external API latency.`;
  outputElement.textContent = '';
  let index = 0;
  
  function type() {
    if (index < response.length) {
      outputElement.textContent += response.charAt(index);
      index++;
      setTimeout(type, 15);
    }
  }
  type();
}

// ==========================================
// 2. CSS Gap Decorations
// ==========================================
function initGapDecorations() {
  // row-rule ist eine komplett neue Property (kein Legacy-Multi-Column-Fallback wie column-rule) —
  // deshalb ein eindeutigeres Support-Signal als column-rule, das schon lange vor Gap Decorations existierte.
  const isGapRuleSupported = CSS.supports('row-rule', '1px dashed red');
  
  updateStatus('status-gap-decorations', isGapRuleSupported);

  const container = document.getElementById('gap-container');
  /** @type {HTMLInputElement | null} */
  const toggleCheckbox = /** @type {HTMLInputElement | null} */ (document.getElementById('toggle-fallback-gaps'));

  if (!container || !toggleCheckbox) return;

  function renderDividers() {
    if (!container || !toggleCheckbox) return;
    // Clear existing dividers
    const dividers = container.querySelectorAll('.fallback-gap-divider');
    dividers.forEach(div => div.remove());

    const shouldForceFallback = toggleCheckbox.checked;

    if (!isGapRuleSupported || shouldForceFallback) {
      // Fallback active: manually insert decorative elements between items
      const children = Array.from(container.children).filter(el => !el.classList.contains('fallback-gap-divider'));
      children.forEach((child, index) => {
        if (index < children.length - 1) {
          const divider = document.createElement('div');
          divider.className = 'fallback-gap-divider';
          child.after(divider);
        }
      });
    }
  }

  // Set initial dividers if native support is missing
  renderDividers();

  toggleCheckbox.addEventListener('change', renderDividers);
}

// ==========================================
// 3. text-fit (Auto-scaling container)
// ==========================================
function initTextFit() {
  const isTextFitSupported = CSS.supports('text-fit', 'contain') || 
                             CSS.supports('text-fit: contain');
  
  updateStatus('status-text-fit', isTextFitSupported);

  /** @type {HTMLElement | null} */
  const container = document.getElementById('text-fit-target');
  if (!container) return;
  const parent = container.parentElement;
  if (!parent) return;

  if (!isTextFitSupported) {
    // Fallback: JavaScript ResizeObserver dynamic font sizing
    const resizeObserver = new ResizeObserver(() => {
      fitTextFallback(container, parent);
    });
    resizeObserver.observe(parent);
    fitTextFallback(container, parent); // Initial call
  }
}

/**
 * Binary search implementation for fitting text
 * @param {HTMLElement} element
 * @param {HTMLElement} parent
 */
function fitTextFallback(element, parent) {
  let low = 12;
  let high = 150;
  let optimalSize = 16;

  // Temporarily reset inline styles to get accurate measurements
  element.style.fontSize = '12px';
  element.style.display = 'inline-block';
  element.style.whiteSpace = 'nowrap';

  const maxWidth = parent.clientWidth - 20; // subtracting padding
  const maxHeight = parent.clientHeight - 20;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    element.style.fontSize = mid + 'px';

    if (element.scrollWidth <= maxWidth && element.scrollHeight <= maxHeight) {
      optimalSize = mid;
      low = mid + 1; // Try bigger font size
    } else {
      high = mid - 1; // Try smaller font size
    }
  }

  element.style.fontSize = optimalSize + 'px';
  element.style.display = 'flex';
}

// ==========================================
// 4. focusgroup (Declarative Arrow Navigation)
// ==========================================
function initFocusgroup() {
  const isFocusgroupSupported = 'focusGroup' in HTMLElement.prototype || 
                                'focusgroup' in HTMLElement.prototype;
  
  updateStatus('status-focusgroup', isFocusgroupSupported);

  const container = document.getElementById('focusgroup-target');
  if (!container) return;
  
  if (!isFocusgroupSupported) {
    // Fallback: Manual JavaScript Arrow Navigation Handler
    /** @type {HTMLElement[]} */
    const buttons = Array.from(container.querySelectorAll('.fg-btn'));
    
    // Set initial tab index for roving tabindex
    buttons.forEach((btn, idx) => {
      btn.tabIndex = (idx === 0) ? 0 : -1;
    });

    container.addEventListener('keydown', (e) => {
      const activeElement = /** @type {HTMLElement | null} */ (document.activeElement);
      if (!activeElement || !buttons.includes(activeElement)) return;

      const currentIndex = buttons.indexOf(activeElement);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % buttons.length; // Wrap enabled
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length; // Wrap enabled
        e.preventDefault();
      }

      if (nextIndex !== currentIndex) {
        // Roving tabindex update
        buttons[currentIndex].tabIndex = -1;
        buttons[nextIndex].tabIndex = 0;
        buttons[nextIndex].focus();
      }
    });
  }
}
