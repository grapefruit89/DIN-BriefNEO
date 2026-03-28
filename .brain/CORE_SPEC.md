# Core Specification (IMR 4.0)
**Status**: ACTIVE | **Geometry**: DIN 5008:2020-03

## 1. ATOMIC CUSTOM ELEMENTS
The system implements a 19-atom model using native Custom Elements.
- **Header Atoms:** `din-absender-vorname`, `din-absender-nachname`, `din-absender-strasse`, `din-absender-ort`.
- **Recipient Atoms:** `din-empfaenger-firma`, `din-empfaenger-name`, `din-empfaenger-strasse`, `din-empfaenger-ort`.
- **Logic Atoms:** `din-text` (Source), `din-text-mirror` (View).
- **Behavior:** All atoms implement `contenteditable="plaintext-only"` and are bound via `EditContext API`.

## 2. TEMPORAL ENGINE
- **Capture:** `Temporal.Now.plainDateISO(Temporal.Now.timeZoneId())`.
- **Target:** `<din-date>` (Standalone at 50mm Y / 125mm X).

## 3. PHYSICAL GEOMETRY (SSoT)
- **Form A (Small Header):** 27mm top offset for address zone.
- **Form B (Standard Header):** 45mm top offset for address zone.
- **Enforcement:** Zero-JS layout. Logic resides entirely in `app-ui.css` @layer geometry.
