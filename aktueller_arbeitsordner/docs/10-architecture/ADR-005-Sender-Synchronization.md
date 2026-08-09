---
id: ADR-005
title: 'ADR-005: Sender Synchronization Logic (Absenderblock → Rücksendezeile)'
type: adr
status: active
created: '2026-07-07'
updated: '2026-08-08'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
doc_links:
  - ADR-HTML
  - ADR-JS
code_links:
  - website/js/44-sender-sync.js
error_patterns:
  - sender synchronization
  - rücksendezeile
  - absenderblock
  - unterschrift
  - sender-sync
  - maschinenschrift
supersedes: []
---

# ADR-005: Sender Synchronization Logic

## Context

In previous iterations of the DIN-BriefNEO project, the "Informationsblock" (metadata block on the right side of the letter) was removed in an attempt to simplify the UI for private letters. This inadvertently destroyed a core UX feature of the original `din-5008-css` template: The automatic synchronization of the sender's name and address into the `Rücksendezeile` (the tiny return address line above the recipient) and the `Maschinenschrift` (the typed name below the signature).

The user firmly requested this logic to be restored and declared it an invariant principle for the project: Changes to the sender metadata must seamlessly and automatically mirror into the respective letter elements to prevent double data entry.

## Decision

We restore the `<din-infoblock>` (or sender input fields) and introduce a dedicated synchronization script (`sender-sync.js`) that enforces the following data flow:

1. `info-name`, `info-street`, and `info-city` are the single source of truth for the sender's address.

2. An `input` event listener continuously concatenates these fields with a separator (e.g., ` • `) and injects the result into the `<din-absender id="absender">` element (Rücksendezeile).

3. The `info-name` field is additionally mirrored into the `<div id="unterschrift">` (Maschinenschrift) element.

## Consequences

- **Positive:** Restores the beloved "magic" synchronization from the original template, drastically improving UX.

- **Positive:** Prevents the return address line and the signature name from going out of sync with the main sender block.

- **Negative:** Requires strict DOM structure. The `unterschrift` element must be carefully managed so that `contenteditable` does not destroy sibling elements (like the signature image).

## Implementation Rules

- **Rule 1:** The signature image (`#signature-image`) MUST reside in a separate DOM container outside of the `contenteditable` `#unterschrift` element.

- **Rule 2:** The `sender-sync.js` module MUST be loaded during the initial application setup in `main.js`.

- **Rule 3:** This logic is considered **core functionality** and MUST NOT be removed in future refactoring attempts.

> [!WARNING] Stille Abhängigkeit (ergänzt 2026-08-08)
> Es gibt **keinen automatischen Check**, der greift, wenn `info-name`/`info-street`/`info-city` umbenannt oder `44-sender-sync.js` verändert wird — die Rücksendezeile (`#absender`) und `#unterschrift` würden dann stillschweigend aufhören zu synchronisieren, ohne Fehlermeldung. Kein akuter Bug, nur ein Hinweis für den nächsten, der an dieser Datei arbeitet: die drei Feld-IDs oben sind ein informeller Vertrag, kein technisch erzwungener.