# Fakten zu Zustand und Restore

**Erzeugt von `tools/batch-facts.mjs --scheibe 05` — nicht von Hand bearbeiten.**
`node tools/batch-facts.mjs --scheibe 05 --check` bricht ab, wenn dieses Blatt
nicht mehr zum Quelltext passt. Alle Zeilennummern sind aus den Dateien gelesen.

## 1. Die vier Dateien

| Datei | Zeilen | Methoden | freie Funktionen | Rolle |
|---|---:|---:|---:|---|
| `boot-state.js` | 194 | 0 | 0 | Seeder vor dem ersten Paint (klassisches Skript) |
| `draft-model.js` | 351 | 0 | 11 | Feld-Kern: Selektor, Sanitizer, istAn, ein Wert-Schreiber |
| `draft-manager.js` | 490 | 22 | 0 | Entwurf laden, speichern, zuruecksetzen |
| `persistence.js` | 889 | 4 | 17 | DEFAULT_SETTINGS, STORAGE_KEYS, loadJSON/saveJSON, istAn-Re-Export |
| `main.js` | 317 | 0 | 6 | Boot-Reihenfolge (bootStep) und die Aufrufstellen |

### Methoden und Funktionen mit Zeile

**boot-state.js** — IIFE 30–193 (klassisches Skript, kann nichts importieren)

**draft-model.js** — `sanitizeRichText` (73), `stripHtmlToPlaintext` (122), `readField` (147), `writeField` (166), `normalizeDraftWire` (227), `draftFingerprint` (242), `publishBootFingerprint` (261), `readBootFingerprint` (270), `clearBootFingerprint` (280), `setRootFlags` (295), `applyDraftValues` (316)

**draft-manager.js** — `constructor` (57), `#initEventBus` (69), `#initLifecycleFlush` (91), `flushPendingSave` (115), `#initMultiTabSync` (129), `destroy` (146), `#initShortcuts` (159), `saveDraft` (175), `#caret` (236), `#commitHistory` (256), `#persist` (276), `#restoreCaret` (290), `clearHistory` (299), `loadDraft` (307), `restoreDraft` (333), `#loadWire` (345), `undo` (368), `redo` (387), `resetDraft` (406), `scheduleAutoSave` (436), `#setSaveStatus` (451), `#updateDocumentTitle` (483)

**persistence.js** — `prepare` (260), `_cleanupInjectedTags` (292), `_injectMetaTags` (304), `restore` (330), `load` (94), `save` (108), `remove` (122), `loadJSON` (138), `saveJSON` (167), `requestPersistentStorage` (180), `collectLetterIdentity` (210), `buildLetterFileName` (235), `isPrintTitleActive` (250), `buildDinLetterPayload` (431), `parseDinLetterPayload` (490), `exportDocumentToFile` (637), `registerDraftCollector` (689), `buildDINLetterJSON` (699), `stelleAltenStandWiederHer` (717), `applyImportedData` (733), `initImportExport` (786)

**main.js** — `syncPostvermerkFromSidebar` (27), `zeigeBootFehler` (55), `bootStep` (74), `kritischerWert` (99), `initApp` (109), `setupPhoneFormatting` (300)

## 2. `targetLock`: alle Setzstellen

Gesucht nach `AddressIntelligence.targetLock =` in allen JavaScript-Dateien.

| Datei | Zeile | Zeile im Quelltext |
|---|---:|---|
| `draft-manager.js` | 353 | `AddressIntelligence.targetLock = null;` |
| `draft-manager.js` | 414 | `AddressIntelligence.targetLock = null;` |
| `main.js` | 131 | `AddressIntelligence.targetLock = null;` |
| `main.js` | 189 | `AddressIntelligence.targetLock = null;` |
| `main.js` | 250 | `AddressIntelligence.targetLock = null;` |

## 3. Dynamische Importe

| Datei | Zeile | Ziel |
|---|---:|---|
| `draft-manager.js` | 32 | `./state.js` |
| `draft-manager.js` | 34 | `./state.js` |
| `main.js` | 166 | `./multipage-controller.js` |

## 4. `DEFAULT_SETTINGS` gegen die tatsächliche Nutzung

`DEFAULT_SETTINGS` enthält **8** Schlüssel:
`theme`, `layout`, `marks`, `pluginTestbrief`, `pluginGeschaeftsangaben`, `previewFont`, `formality`, `randU`.

Gelesen oder geschrieben werden über `settings.<key>` **13** verschiedene Schlüssel.
Nicht in `DEFAULT_SETTINGS`:

- `signatureImage` — 3 Stelle(n): `signature.js:47`, `signature.js:226`, `signature.js:327`
- `signatureState` — 2 Stelle(n): `signature.js:225`, `signature.js:328`
- `settings` — 3 Stelle(n): `state-binding.js:171`, `state-binding.js:184`, `state-binding.js:204`
- `isReady` — 3 Stelle(n): `state-binding.js:185`, `state-binding.js:186`, `state-binding.js:190`
- `applySettings` — 1 Stelle(n): `state-binding.js:188`

## 5. Schalter-Semantik (B65)

`istAn(...)` oder `!== false` an **13** Stellen:

- `boot-state.js:47`
- `boot-state.js:48`
- `boot-state.js:51`
- `boot-state.js:65`
- `boot-state.js:84`
- `boot.js:48`
- `boot.js:52`
- `boot.js:62`
- `boot.js:63`
- `draft-model.js:47`
- `settings.js:86`
- `settings.js:87`
- `settings.js:120`

## 6. Allowlist im Restore-Pfad

`EDITABLE_FIELD_SELECTOR` wird in `draft-manager.js` an diesen Stellen geprüft:

| Zeile | Zeile im Quelltext |
|---:|---|

Das ist die Allowlist aus `draft-model.js`; der Restore prueft damit und
`applyDraftValues` schreibt damit. Es gibt seit D2 keine zweite Kopie im
Boot-Pfad — das gemeinsame Modul ist importfähig.
