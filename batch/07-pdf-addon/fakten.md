# Fakten zum PDF-Export

**Erzeugt von `tools/batch-facts.mjs --scheibe 07`.** Zaehlweise und Zeilen
sind aus dem Quelltext gelesen; Groessen sind gemessen (`gzip -9`).

## 1. Was heute gedruckt wird

| Datei | Zeile | Stelle |
|---|---:|---|
| `js/document.js` | 429 | `window.addEventListener('beforeprint', () => {` |
| `js/main.js` | 186 | `window.addEventListener('beforeprint', () => {` |
| `js/main.js` | 189 | `window.addEventListener('afterprint', () => {` |
| `js/main.js` | 198 | `window.print();` |
| `js/multipage-controller.js` | 119 | `window.addEventListener('beforeprint', aktualisieren);` |
| `js/persistence.js` | 246 | `* Kontext-Stack für reentrante beforeprint/afterprint-Zyklen.` |
| `js/persistence.js` | 247 | `* Verhindert Deadlocks und Metadaten-Leaks bei asynchronen oder mehrfa` |
| `js/persistence.js` | 263 | `* Reentrant: Push auf den Kontext-Stack; ein verschachteltes beforepri` |
| `js/draft-manager.js` | 557 | `document.title = betreff;` |
| `js/persistence.js` | 278 | `document.title = fileName;` |
| `js/persistence.js` | 350 | `document.title = restoreTitle;` |

Der Druck laeuft **ausschliesslich** ueber `window.print()` — der
Browser-Dialog erzeugt das PDF. Es gibt keinen eigenen PDF-Writer im Code.

## 2. `@page`-Regeln (das Papier)

| Datei | Zeile | Regel |
|---|---:|---|
| `css/sheet-multipage.css` | 455 | `@page {` |
| `css/sheet-multipage.css` | 473 | `@page :first {` |
| `css/sheet-multipage.css` | 478 | `@page, nicht aus geklontem Padding (gemessen 2026-11-12). */` |
| `css/sheet.css` | 310 | `@page {` |

## 3. Export-Wege, die es heute gibt

| Datei | Zeile | Stelle |
|---|---:|---|
| `js/persistence.js` | 657 | `* Exportiert das DIN-Brief-Payload über die File System Access API (sh` |
| `js/persistence.js` | 663 | `export async function exportDocumentToFile(payload, fileName = buildLe` |
| `js/persistence.js` | 667 | `const savePicker = typeof window !== 'undefined' ? /** @type {any} */` |
| `js/persistence.js` | 694 | `const blob = new Blob([jsonContent], { type: 'application/json' });` |
| `js/persistence.js` | 695 | `const url = URL.createObjectURL(blob);` |
| `js/persistence.js` | 823 | `await exportDocumentToFile(payload);` |
| `js/persistence.js` | 842 | `// Globaler Tastatur-Shortcut: Ctrl + S / Cmd + S triggert exportDocum` |

## 4. Was die Auslieferung wiegt

| Gruppe | Dateien | roh | gzip |
|---|---:|---:|---:|
| JS | 22 | 404 KB | 134 KB |
| CSS | 5 | 109 KB | 36 KB |
| Rest (HTML/JSON/Fonts) | 11 | 289 KB | 137 KB |
| **Summe** | 38 | **802 KB** | **307 KB** |

Die drei groessten Dateien:

| Datei | roh | gzip |
|---|---:|---:|
| `website/addons/testbrief/figuren.json` | 135.1 KB | 36.1 KB |
| `website/fonts/michelangelus-regular.woff2` | 22.7 KB | 22.7 KB |
| `website/addons/testbrief/testbrief.js` | 60.1 KB | 19.3 KB |

## 5. Content-Security-Policy (was geladen werden darf)

```
default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self' data: blob:; img-src 'self' data: blob:; connect-src 'self' https://api.geoapify.com https://api-eu.geoapify.com; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'; worker-src 'none'
```

`script-src 'self'` heisst: eine Bibliothek **im Repo** ist erlaubt, ein CDN
nicht (A38).

## 6. Die Fragen, die eine Bibliothek entscheiden muessten

| Frage | Warum sie vor der Wahl steht |
|---|---|
| Muss das Layout **nachgebaut** werden? | Ja, bei jedem PDF-Writer (jsPDF, pdf-lib, pdfmake). Dann gibt es zwei Layouts — CSS und Code — und das WYSIWYG-Versprechen faellt. |
| Reicht `window.print()`? | Es liefert ein echtes Text-PDF mit korrekter Typografie, aber der Nutzer waehlt im Dialog. Ein Klick weniger ist der einzige Gewinn einer Bibliothek. |
| Sind Metadaten (Titel/Autor) das Argument? | Titel setzt der Druckpfad bereits ueber `document.title` (siehe `MetadataService`). Autor/Subject waeren nur ueber einen eigenen Writer moeglich. |
| Was kostet das im Boot-Pfad? | 0 Byte, solange per `import()` erst beim Klick geladen — aber jede Bibliothek liegt danach im Repo und will gepflegt werden. |
