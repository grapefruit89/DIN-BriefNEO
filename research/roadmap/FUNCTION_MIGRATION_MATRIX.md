# Exakte Funktions-Migrations-Matrix: DIN-Brief Neo

> **Gesamtanzahl analysierter JavaScript-Funktionen:** 109 Funktionen in 15 Dateien (~1.225 Zeilen)  
> **Ablösbare / stark reduzierbare Funktionen:** 46 Funktionen (~42 % aller Funktionen)  
> **Codezeilen-Einsparung:** ~61 % (~750 Zeilen JavaScript entfallen komplett)

---

## 1. Wohin wandert die Logik? (Übersicht nach Ziel-Technologie)

| Ziel-Technologie | Betroffene JS-Funktionen | Einsparung |
| :--- | :--- | :--- |
| **Natives CSS** (`field-sizing`, `text-box-trim`, `@starting-style`, `light-dark`) | **14 Funktionen** | ~320 Zeilen JS |
| **Natives HTML** (`<input switch>`, `plaintext-only`, `commandfor`, `popover`) | **16 Funktionen** | ~240 Zeilen JS |
| **Native Browser C++ APIs** (Sanitizer API, `Temporal`, `Intl`, Top-Layer) | **16 Funktionen** | ~190 Zeilen JS |
| **Verbleibendes Kern-JS** (App-State, LocalStorage, Salutation-Algorithmus) | **63 Funktionen** | Kernlogik bleibt schlank |

---

## 2. Detail-Aufschlüsselung: Welche Funktionen wohin wandern

### A. Wandert zu 100 % in NATIVES CSS (14 Funktionen entfallen)
1. **`48-text-fit.js` (Komplettes Modul wird obsolet!):**
   - `scanDOM()` ➔ **CSS `field-sizing: content`**
   - `isOverflowing(el)` ➔ **CSS `field-sizing: content`**
   - `attachEventListeners()` ➔ **Entfällt** (kein Input-Polling mehr nötig)
   - `initMutationObserver()` ➔ **Entfällt** (Browser rendert nativ)
   - `restoreCaretToEnd()` ➔ **Entfällt**
   - `notifyToast()` ➔ **Entfällt** (kein Overflow-Absturz mehr möglich)
   - `init()` ➔ **Entfällt**
   - *Ergebnis:* 8 Funktionen (~150 Zeilen) werden durch 2 Zeilen CSS ersetzt!
2. **`32-toast.js` (Animations- & Timer-Hacks):**
   - `startTimer()`, `pauseTimer()`, `resumeTimer()`, `clearTimer()` ➔ **CSS `@starting-style` & Transitions**
3. **`02-settings-manager.js` (Theming-Berechnungen):**
   - `applyThemeDim()` ➔ **CSS `color-mix()` & `light-dark()`**
   - `handleThemeChange()` ➔ **CSS `color-scheme: light dark`**

### B. Wandert zu 100 % in NATIVES HTML (16 Funktionen entfallen)
1. **`03-ui-protections.js` (Eingabeschutz):**
   - `enforceLineLimits()` ➔ **HTML `contenteditable="plaintext-only"` + `enterkeyhint="done"`** (Browser blockiert Enter und HTML-Tags nativ!)
   - `protectAnlagenList()` ➔ **HTML5 List-Constraints**
   - `ensureListStructure()` ➔ **HTML5 List-Constraints**
2. **`02-settings-manager.js` (Schalter-Zustände):**
   - `handleGuidesToggle()` ➔ **HTML `<input type="checkbox" switch id="guides">`** (Zustand wird direkt via CSS `:has(#guides:checked)` ausgewertet, 0 Zeilen JS)
3. **`31-format-toolbar.js` & `main.js` (UI-Buttons & Dialoge):**
   - `attachListeners()` (zu 60%) ➔ **HTML `commandfor="dialog-id" command="show-modal"`**
   - Toolbar-Button Click-Handler ➔ **HTML Invoker Commands**
4. **`32-toast.js`:**
   - `initDOM()` ➔ **HTML `<div id="toast" popover="manual">`**
   - `cleanupPopover()` ➔ **Natives Popover Light-Dismiss**

### C. Wandert in C++ NATIVE BROWSER-APIs (16 Funktionen stark vereinfacht)
1. **`31-format-toolbar.js`:**
   - `sanitizeNode(node)` (60+ Zeilen rekursives JS-DOM-Walking) ➔ **Native Sanitizer API (`Element.setHTMLUnsafe()`)**
2. **`47-date-format.js`:**
   - `formatLetterDate()` & `applyLetterDate()` (Manuelles String-Padding) ➔ **`Temporal.Now.plainDateISO().toLocaleString('de-DE')`**
3. **`32-toast.js`:**
   - `show()`, `update()`, `processQueue()`, `onPointerDown/Move/Up` ➔ **Native Popover API (`showPopover()` / `hidePopover()`)**
4. **`42-signature.js`:**
   - `compressImage(bitmap)` ➔ **Native Compression Streams & `createImageBitmap`**

---

## 3. Fazit & Zusammenfassung

- **1 komplettes Modul (`48-text-fit.js`) wird zu 100 % gelöscht.**
- **3 Module (`03-ui-protections.js`, `32-toast.js`, `02-settings-manager.js`) verlieren zwischen 50 % und 75 % ihres Codes.**
- **46 von 109 Funktionen** werden nicht mehr in JS programmiert, sondern deklarativ dem Browser übergeben.
