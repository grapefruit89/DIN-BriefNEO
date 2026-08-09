---
id: guide-toast-system
title: 'Guide: Toast Notifications System'
type: guide
status: active
created: '2026-07-03'
updated: '2026-07-07'
tags:
  - din-briefneo
  - din-briefneo/implementation
  - status/active
  - type/guide
doc_links:
  - adr-toast-system
code_links:
  - website/js/toast.js
error_patterns:
  - toast
  - notification
  - showToast
  - updateToast
  - sticky toast
  - hover-to-pause
  - counter badge
supersedes: []
---

# Guide: Using the Next-Level Toast System

The Toast system is a decoupled, highly advanced UI module located at `js/toast.js`. It leverages modern native W3C specifications (Popover API, Discrete Transitions, ARIA-Live Regions) to provide accessible and smooth notifications.

## Basic Usage

To show a simple notification, import the `showToast` function and pass your message:

```javascript
import { showToast } from './toast.js';

// Info (Default)
showToast('Dies ist eine Info');

// Success
showToast('Speichern erfolgreich!', 'success');

// Warning
showToast('Verbindung langsam...', 'warning');

// Error
showToast('API Key abgelaufen!', 'error');
```

The system will automatically calculate the display duration based on the text length (up to a maximum of 5 seconds) and handle deduplication for you.

## Advanced Features

### 1. Actionable Toasts (Buttons)

You can attach an interactive button to the Toast by passing an `action` object in the options parameter:

```javascript
showToast('Entwurf gelöscht.', 'warning', {
  action: {
    label: 'Rückgängig',
    callback: () => {
      console.log('Rückgängig ausgeführt!');
      // ... restore logic ...
    }
  }
});
```

### 2. Sticky Toasts & Updatable Progress

For background tasks (like PDF generation or bulk sending), you can make a Toast "sticky" so it never automatically disappears. You can then update its content via `updateToast`.

```javascript
import { showToast, updateToast } from './toast.js';

const taskId = 'pdf-gen-123';

// Start a sticky toast
showToast('Generiere 500 PDFs... [░░░░░░] 0%', 'info', {
  sticky: true,
  id: taskId
});

// Later, update it as progress continues
setTimeout(() => {
  updateToast(taskId, 'Generiere 500 PDFs... [████░░] 60%', 'info');
}, 2000);

// Finally, convert it to a success message and let it close naturally or keep it sticky
setTimeout(() => {
  // If you call showToast with the exact same message, it increments the badge.
  // To replace a sticky toast completely with an auto-closing one, you could close it and spawn a new one,
  // or just update it manually. Currently, updateToast just updates the DOM.
  updateToast(taskId, '✅ 500 PDFs fertig!', 'success');
}, 4000);
```

### 3. Built-in User Interactions

You do not need to code anything for these features, they are built-in:

- **Swipe-to-Dismiss**: Users can mouse-drag or touch-swipe the toast to the right to throw it off the screen.

- **Hover-to-Pause**: Hovering the mouse over the toast stops the timeout countdown.

- **Counter Badges (x2, x3)**: Triggering the exact same message while it is already visible will shake the toast and increment a small counter badge, preventing visual spam.