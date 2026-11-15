# Fakten zu Zustand und Restore

**Erzeugt von `tools/batch-facts.mjs --scheibe 05` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --scheibe 05 --check` bricht ab, wenn dieses Blatt
nicht mehr zum Quelltext passt. Alle Zeilennummern sind aus den Dateien gelesen.

## 1. Die vier Dateien

| Datei | Zeilen | Methoden | freie Funktionen | Rolle |
|---|---:|---:|---:|---|
| `boot-state.js` | 183 | 0 | 0 | Seeder vor dem ersten Paint (klassisches Skript) |
| `draft-manager.js` | 551 | 18 | 0 | Entwurf laden, speichern, zuruecksetzen |
| `persistence.js` | 896 | 4 | 18 | DEFAULT_SETTINGS, STORAGE_KEYS, loadJSON/saveJSON, istAn |
| `main.js` | 344 | 0 | 7 | Boot-Reihenfolge (bootStep) und die Aufrufstellen |

### Methoden und Funktionen mit Zeile

**boot-state.js** — IIFE 30–182 (klassisches Skript, kann nichts importieren)

**draft-manager.js** — `constructor` (48), `#initEventBus` (60), `#initLifecycleFlush` (82), `flushPendingSave` (106), `#initMultiTabSync` (120), `destroy` (137), `#initShortcuts` (150), `saveDraft` (166), `loadDraft` (245), `restoreDraft` (263), `#restoreState` (272), `undo` (379), `redo` (389), `#applyHistoryState` (402), `resetDraft` (431), `scheduleAutoSave` (498), `#setSaveStatus` (513), `#updateDocumentTitle` (545)

**persistence.js** — `prepare` (262), `_cleanupInjectedTags` (294), `_injectMetaTags` (306), `restore` (332), `load` (96), `save` (110), `remove` (124), `loadJSON` (140), `saveJSON` (169), `requestPersistentStorage` (182), `collectLetterIdentity` (212), `buildLetterFileName` (237), `isPrintTitleActive` (252), `stripHtmlToPlaintext` (425), `buildDinLetterPayload` (453), `parseDinLetterPayload` (512), `exportDocumentToFile` (659), `registerDraftCollector` (713), `buildDINLetterJSON` (723), `stelleAltenStandWiederHer` (741), `applyImportedData` (755), `initImportExport` (802)

**main.js** — `syncPostvermerkFromSidebar` (25), `zeigeBootFehler` (52), `bootStep` (71), `kritischerWert` (96), `initApp` (106), `initTestData` (283), `setupPhoneFormatting` (327)

## 2. `targetLock`: alle Setzstellen

Gesucht nach `AddressIntelligence.targetLock =` in allen JavaScript-Dateien.

| Datei | Zeile | Zeile im Quelltext |
|---|---:|---|
| `draft-manager.js` | 274 | `AddressIntelligence.targetLock = null;` |
| `draft-manager.js` | 470 | `AddressIntelligence.targetLock = null;` |
| `main.js` | 128 | `AddressIntelligence.targetLock = null;` |
| `main.js` | 215 | `AddressIntelligence.targetLock = null;` |

## 3. Dynamische Importe

| Datei | Zeile | Ziel |
|---|---:|---|
| `main.js` | 151 | `./multipage-controller.js` |
| `main.js` | 288 | `../addons/testbrief/testbrief.js` |
| `main.js` | 302 | `../addons/testbrief/testbrief.js` |
| `main.js` | 314 | `../addons/testbrief/testbrief.js` |

## 4. `DEFAULT_SETTINGS` gegen die tatsächliche Nutzung

`DEFAULT_SETTINGS` enthält **7** Schlüssel:
`theme`, `layout`, `marks`, `pluginTestbrief`, `previewFont`, `formality`, `randU`.

Gelesen oder geschrieben werden über `settings.<key>` **9** verschiedene Schlüssel.
Nicht in `DEFAULT_SETTINGS`:

- `signatureImage` — 3 Stelle(n): `signature.js:47`, `signature.js:226`, `signature.js:320`
- `signatureState` — 2 Stelle(n): `signature.js:225`, `signature.js:321`

## 5. Schalter-Semantik (B65)

`istAn(...)` oder `!== false` an **14** Stellen:

- `boot-state.js:47`
- `boot-state.js:48`
- `boot-state.js:51`
- `boot-state.js:65`
- `boot-state.js:84`
- `boot.js:35`
- `boot.js:39`
- `boot.js:49`
- `boot.js:50`
- `persistence.js:63`
- `persistence.js:76`
- `settings.js:105`
- `settings.js:106`
- `settings.js:138`

## 6. Allowlist im Restore-Pfad

`EDITABLE_FIELD_SELECTOR` wird in `draft-manager.js` an diesen Stellen geprüft:

| Zeile | Zeile im Quelltext |
|---:|---|
| 15 | `import { collectDraft, EDITABLE_FIELD_SELECTOR, getCaretCharacterOffset, sanitizeRichText,` |
| 295 | `if (!elem?.matches(EDITABLE_FIELD_SELECTOR)) return;` |
| 432 | `document.querySelectorAll(EDITABLE_FIELD_SELECTOR).forEach(el => {` |

Das ist die Allowlist, die der Seeder (`boot-state.js`) seit B69 ebenfalls
benutzt — dort als lokale Kopie des Selektors, weil ein klassisches Skript
nichts importieren kann.
