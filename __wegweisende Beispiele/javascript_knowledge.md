# JavaScript Implementation Roadmap (V9 Architect Edition)

## 1. Core Architecture: The "App" Singleton
The application is wrapped in a single `App` object to ensure a clean namespace and high stability.
- `init()`: Startup sequence (load draft, start timers, attach listeners).
- `cacheElements()`: Mapping all `index.html` IDs to `this.elements` for performance.
- `state`: Stores `lastSaved` timestamp and current document metadata.

## 2. Intelligence & Automation
### Return Line Derivation
- **Input**: Sender Block (Name, Street, City).
- **Transformation**: `Max Mustermann` -> `M. Mustermann`. 
- **Formatting**: Result is "M. Mustermann, Street, ZIP City".
- **Target**: `ruecksendeangabe` [contenteditable="false"].

### Date Validation & Auto-Format
- **Regex**: Allow only digits. 
- **Logic**: Automatically insert dots at position 2 and 5 (e.g., `07012026` -> `07.01.2026`).
- **Validation**: Check for realistic ranges (Month 1-12, Day 1-31).

### Salutation & Subject Engine
- **Subject**: Force bold style. Automatically strip the word "Betreff:" if entered.
- **Salutation**: Based on "Stil" dropdown (Förmlich, Standard, Locker) and recipient type.

## 3. UX & Data Integrity
### State Management
- **Auto-Save**: Debounced save to `localStorage` after 1s of inactivity.
- **Relative Status**: Updates a status field every 10s (e.g., "vor 20 Sek. gespeichert").
- **Persistence**: Restore all fields (including multiline placeholders) on reload.

### Security & Robustness
- **Paste Sanitizer**: Intercepts `paste` events to strip HTML tags, ensuring only plain text is inserted into `contenteditable` fields.
- **Single-Line Enforcement**: Prevents `Enter` key on fields where DIN 5008 strictly forbids multiple lines (Subject, Name, Date).