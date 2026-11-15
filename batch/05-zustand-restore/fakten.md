# Fakten zu Zustand und Restore

**Erzeugt von `tools/batch-facts.mjs --scheibe 05` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --scheibe 05 --check` bricht ab, wenn dieses Blatt
nicht mehr zum Quelltext passt. Alle Zeilennummern sind aus den Dateien gelesen.

## 1. Die vier Dateien

| Datei | Zeilen | Methoden | freie Funktionen | Rolle |
|---|---:|---:|---:|---|
| `boot-state.js` | 189 | 0 | 0 | Seeder vor dem ersten Paint (klassisches Skript) |
| `draft-manager.js` | 560 | 18 | 0 | Entwurf laden, speichern, zuruecksetzen |
| `persistence.js` | 900 | 4 | 18 | DEFAULT_SETTINGS, STORAGE_KEYS, loadJSON/saveJSON, istAn |
| `main.js` | 344 | 0 | 7 | Boot-Reihenfolge (bootStep) und die Aufrufstellen |

### Methoden und Funktionen mit Zeile

**boot-state.js** — IIFE 30–188 (klassisches Skript, kann nichts importieren)

**draft-manager.js** — `constructor` (48), `#initEventBus` (60), `#initLifecycleFlush` (82), `flushPendingSave` (106), `#initMultiTabSync` (120), `destroy` (137), `#initShortcuts` (150), `saveDraft` (166), `loadDraft` (245), `restoreDraft` (263), `#restoreState` (272), `undo` (388), `redo` (398), `#applyHistoryState` (411), `resetDraft` (440), `scheduleAutoSave` (507), `#setSaveStatus` (522), `#updateDocumentTitle` (554)

**persistence.js** — `prepare` (266), `_cleanupInjectedTags` (298), `_injectMetaTags` (310), `restore` (336), `load` (100), `save` (114), `remove` (128), `loadJSON` (144), `saveJSON` (173), `requestPersistentStorage` (186), `collectLetterIdentity` (216), `buildLetterFileName` (241), `isPrintTitleActive` (256), `stripHtmlToPlaintext` (429), `buildDinLetterPayload` (457), `parseDinLetterPayload` (516), `exportDocumentToFile` (663), `registerDraftCollector` (717), `buildDINLetterJSON` (727), `stelleAltenStandWiederHer` (745), `applyImportedData` (759), `initImportExport` (806)

**main.js** — `syncPostvermerkFromSidebar` (25), `zeigeBootFehler` (52), `bootStep` (71), `kritischerWert` (96), `initApp` (106), `initTestData` (283), `setupPhoneFormatting` (327)

## 2. `targetLock`: alle Setzstellen

Gesucht nach `AddressIntelligence.targetLock =` in allen JavaScript-Dateien.

| Datei | Zeile | Zeile im Quelltext |
|---|---:|---|
| `draft-manager.js` | 274 | `AddressIntelligence.targetLock = null;` |
| `draft-manager.js` | 479 | `AddressIntelligence.targetLock = null;` |
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

`DEFAULT_SETTINGS` enthält **8** Schlüssel:
`theme`, `layout`, `marks`, `pluginTestbrief`, `pluginGeschaeftsangaben`, `previewFont`, `formality`, `randU`.

Gelesen oder geschrieben werden über `settings.<key>` **10** verschiedene Schlüssel.
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
- `boot.js:36`
- `boot.js:40`
- `boot.js:50`
- `boot.js:51`
- `persistence.js:67`
- `persistence.js:80`
- `settings.js:106`
- `settings.js:107`
- `settings.js:140`

## 6. Allowlist im Restore-Pfad

`EDITABLE_FIELD_SELECTOR` wird in `draft-manager.js` an diesen Stellen geprüft:

| Zeile | Zeile im Quelltext |
|---:|---|
| 15 | `import { collectDraft, EDITABLE_FIELD_SELECTOR, getCaretCharacterOffset, sanitizeRichText,` |
| 295 | `if (!elem?.matches(EDITABLE_FIELD_SELECTOR)) return;` |
| 441 | `document.querySelectorAll(EDITABLE_FIELD_SELECTOR).forEach(el => {` |

Das ist die Allowlist, die der Seeder (`boot-state.js`) seit B69 ebenfalls
benutzt — dort als lokale Kopie des Selektors, weil ein klassisches Skript
nichts importieren kann.
