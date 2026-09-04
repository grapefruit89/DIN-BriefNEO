# Das verbleibende JavaScript-Kernsystem in DIN-Brief Neo

> **Ausgangslage:** Von ursprünglich ~1.225 Zeilen und 109 Funktionen entfallen ~61 % durch natives HTML5 & CSS 2025/2026.  
> **Verbleibend:** Exakt **6 logische Kernbereiche** mit rund **63 schlanken Funktionen** (~470 Zeilen Code).  
> **Leitprinzip:** JavaScript macht in DIN-Brief Neo nur noch das, wofür es unersetzlich ist: **State Management, Sprach-Algorithmen, Netzwerk und Datei-Verarbeitung.**

---

## Übersicht der 6 verbleibenden JavaScript-Bereiche

| Kernbereich | Datei(en) | Verbleibende Kern-Funktionen | Warum das zwingend in JS bleiben muss |
| :--- | :--- | :--- | :--- |
| **1. Entwurfs- & State-Management** | `01-draft-manager.js`<br>`52-storage.js` | `saveDraft()`, `loadDraft()`, `undo()`, `redo()`, `resetDraft()`, `scheduleAutoSave()` | **Echter Anwendungs-State:** Das Verwalten des History-Stacks (Strg+Z / Strg+Y), Serialisierung in `localStorage` und Auto-Save bei Inaktivität. |
| **2. Salutation & Anrede-Engine** | `41-salutation-engine.js` | `derive()`, `splitTitles()`, `getClosing()`, `_regenerateSalutation()`, `_validatePunctuation()` | **Deutsche Grammatik & Sprachregeln:** Das automatische Erkennen von akademischen Titeln (Dr., Prof.) und die Ableitung der korrekten Anrede („Sehr geehrte Frau Dr. ...“ vs. „Hallo Herr ...“). Das kann kein HTML/CSS. |
| **3. Adress-Suche & Geoapify API** | `43-geoapify.js` | `performAddressSearch()`, `validateKeyWithHeartbeat()`, `getLocalAddressBook()`, `saveToLocalAddressBook()`, `fuzzySearchLocal()` | **Netzwerk & Asynchrone Daten:** Externe HTTP-Abfragen an die Geoapify-Geocoding-API, Caching im lokalen Adressbuch und clientseitige Fuzzy-Suche. |
| **4. Unterschriften-Interaktion** | `42-signature.js` | `processFile()`, `applyTransform()`, `saveState()`, `resetImage()` | **Interaktive Gesten & Bilddaten:** Einlesen der hochgeladenen Bilddatei (PNG/WebP), Drag-, Resize- und Rotations-Gesten auf dem Briefblatt. |
| **5. DIN-Absender-Kürzung** | `44-sender-sync.js` | `abbreviateName()`, `sync()` | **DIN 5008 Formatierungslogik:** Berechnet die 5-mm-Rücksendezeile und kürzt Vor- und Zunamen intelligent ab, wenn die Adresszeile sonst zu lang für das Umschlagfenster wird. |
| **6. App-Bootstrap & Druck-Metadaten** | `main.js`<br>`53-metadata.js` | `initApp()`, `prepare()`, `restore()`, `_injectMetaTags()` | **Lifecycle & PDF-Metadaten:** Initialisiert die Module beim Start und schreibt Autor/Titel/Betreff vor dem Druck als `<meta>` in den Dokumentenkopf. |

---

## Wie diese verbleibenden Bereiche durch 2025/2026 noch besser werden

Auch diese 6 Kernbereiche müssen nicht mehr wie 2018 geschrieben sein, sondern profitieren massiv von den neuen APIs:

1. **Storage mit `CompressionStreams`:**  
   `saveDraft()` komprimiert den gesamten Brief inklusive Unterschrift via `CompressionStream('gzip')`. Das schrumpft die Daten um 90 % und verhindert LocalStorage-Quota-Fehler.
2. **Datums-Handling mit `Temporal`:**  
   Das alte `Date()`-Objekt in `47-date-format.js` schrumpft auf eine einzige Zeile:  
   `Temporal.Now.plainDateISO().toLocaleString('de-DE')`.
3. **Schriftarten mit `window.queryLocalFonts()`:**  
   Der Schriftarten-Manager in `02-settings-manager.js` braucht keine Base64-Strings mehr im Speicher zu halten, sondern liest Windows-Systemschriften direkt aus.
4. **Anlagen-Sortierung mit `moveBefore()`:**  
   Anlagen werden per nativem DOM `moveBefore()` umsortiert, ohne dass Eingabefokus oder Markierungen verloren gehen.

---

## Fazit: Eine ultra-schlanke Codebasis

Wenn die Modernisierung abgeschlossen ist, hast du:
- **Keinen einzigen Zeilenumbruchs-Blocker mehr im JS** (macht `contenteditable="plaintext-only"`).
- **Keine einzige Größen- oder Scroll-Messung mehr im JS** (macht `field-sizing: content`).
- **Keine Animations- oder Timer-Hacks mehr im JS** (macht `@starting-style`).
- **Keine Farbberechnungen mehr im JS** (macht `light-dark()` und `color-mix()`).

Übrig bleibt ein **messerscharfer Kern aus reiner Business-Logik** (Speichern, Grammatik, Adressen, Unterschrift).
