---
chosen_option: ''
code_links: []
created: '2026-07-03'
date: 2026-07-03
decision_options: []
depends_on: []
doc_links: []
id: adr-toast-architecture
status: accepted
tags:
- architecture
- ui
- components
- popover
- a11y
title: ADR - Toast Architecture (Next Level)
type: adr
updated: '2026-07-07'
---

# Architecture Decision Record: Next-Level Toast System

## Context

The application required a robust notification system (Toasts). Previous implementations relied on complex `display: none` toggles, manual event listeners for outside clicks, and simplistic JavaScript timeouts that often resulted in "notification spam" when users triggered rapid events (e.g., clicking save repeatedly).
We needed a system that is robust, visually appealing, accessible (a11y), and dependency-free (Vanilla JS/CSS).

## Decision

We decided to completely overhaul the Toast architecture with a "Next Level" approach based purely on modern W3C standards:

1. **Native Popover API (`popover="manual"`)**:

   Instead of using `z-index` wars, the Toast is hoisted to the native Top-Layer of the browser.

2. **CSS `@starting-style` & Discrete Transitions**:

   We eliminated JS-based animation listeners. The browser natively handles symmetric enter/exit animations via `allow-discrete` transitions on the `display` property.

3. **Multi-Stacking (Spam Prevention)**:

   Instead of queuing 10 identical messages, the system deduplicates. If the exact same message is triggered while active, it increments a visual badge (`x2`, `x3`) and triggers a CSS `@keyframes shake` animation to provide feedback without visual clutter.

4. **Actionable & Sticky Toasts**:

   The API allows passing an `action` object (e.g., "Undo" button) and supports a `sticky` mode for progress indicators that do not automatically expire.

5. **W3C Accessibility (ARIA)**:

   The Toast container is strictly marked with `role="alert"`, `aria-live="assertive"`, and `aria-atomic="true"`, ensuring Screenreaders announce notifications immediately.

6. **Swipe-to-Dismiss**:

   Using `PointerEvents`, the Toast can be swiped horizontally to dismiss it intuitively, mimicking native mobile OS behavior.

## Consequences

- **Positive**: Zero external dependencies. Extremely performant. Best-in-class UX and Accessibility. The codebase (`js/toast.js`) is fully decoupled from `main.js`.

- **Negative**: Relies on modern browser features (Popover API, `@starting-style`). Browsers older than ~late 2023 will not render the enter/exit animations gracefully, though the logic degrades safely.