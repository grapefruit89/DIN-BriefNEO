# Fakten zum PDF-Export

**Erzeugt von `tools/batch-facts.mjs --scheibe 07`.** Zaehlweise und Zeilen
sind aus dem Quelltext gelesen; Groessen sind gemessen (`gzip -9`).

## 1. Was heute gedruckt wird

| Datei | Zeile | Stelle |
|---|---:|---|
| `js/document.js` | 385 | `window.addEventListener('beforeprint', () => {` |
| `js/main.js` | 221 | `window.addEventListener('beforeprint', () => {` |
| `js/main.js` | 224 | `window.addEventListener('afterprint', () => {` |
| `js/main.js` | 233 | `window.print();` |
| `js/multipage-controller.js` | 119 | `window.addEventListener('beforeprint', aktualisieren);` |
| `js/persistence.js` | 240 | `* Kontext-Stack für reentrante beforeprint/afterprint-Zyklen.` |
| `js/persistence.js` | 241 | `* Verhindert Deadlocks und Metadaten-Leaks bei asynchronen oder mehrfa` |
| `js/persistence.js` | 257 | `* Reentrant: Push auf den Kontext-Stack; ein verschachteltes beforepri` |
| `js/draft-manager.js` | 487 | `document.title = betreff;` |
| `js/persistence.js` | 272 | `document.title = fileName;` |
| `js/persistence.js` | 344 | `document.title = restoreTitle;` |

Der Druck laeuft **ausschliesslich** ueber `window.print()` — der
Browser-Dialog erzeugt das PDF. Es gibt keinen eigenen PDF-Writer im Code.

## 2. `@page`-Regeln (das Papier)

| Datei | Zeile | Regel |
|---|---:|---|
| `css/sheet-multipage.css` | 445 | `@page {` |
| `css/sheet-multipage.css` | 463 | `@page :first {` |
| `css/sheet-multipage.css` | 468 | `@page, nicht aus geklontem Padding (gemessen 2026-11-12). */` |
| `css/sheet.css` | 310 | `@page {` |

## 3. Export-Wege, die es heute gibt

| Datei | Zeile | Stelle |
|---|---:|---|
| `js/persistence.js` | 631 | `* Exportiert das DIN-Brief-Payload über die File System Access API (sh` |
| `js/persistence.js` | 637 | `export async function exportDocumentToFile(payload, fileName = buildLe` |
| `js/persistence.js` | 641 | `const savePicker = typeof window !== 'undefined' ? /** @type {any} */` |
| `js/persistence.js` | 667 | `const blob = new Blob([jsonContent], { type: 'application/json' });` |
| `js/persistence.js` | 668 | `const url = URL.createObjectURL(blob);` |
| `js/persistence.js` | 803 | `await exportDocumentToFile(payload);` |
| `js/persistence.js` | 831 | `// Globaler Tastatur-Shortcut: Ctrl + S / Cmd + S triggert exportDocum` |

## 4. Was die Auslieferung wiegt

| Gruppe | Dateien | roh | gzip |
|---|---:|---:|---:|
| JS | 28 | 441 KB | 150 KB |
| CSS | 5 | 114 KB | 37 KB |
| Rest (HTML/JSON/Fonts) | 11 | 290 KB | 138 KB |
| **Summe** | 44 | **844 KB** | **325 KB** |

Die drei groessten Dateien:

| Datei | roh | gzip |
|---|---:|---:|
| `website/addons/testbrief/figuren.json` | 135.1 KB | 36.1 KB |
| `website/fonts/michelangelus-regular.woff2` | 22.7 KB | 22.7 KB |
| `website/addons/testbrief/testbrief.js` | 67.2 KB | 22.2 KB |

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
