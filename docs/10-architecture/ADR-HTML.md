---
id: adr-html
title: "ADR-HTML: HTML Architecture, Constraints & Single Source of Truth (SSOT)"
type: adr
status: active
created: '2026-06-26'
updated: '2026-09-04'
tags:
  - din-briefneo
  - din-briefneo/architecture
  - status/active
  - type/adr
  - tech/html
doc_links:
  - ADR-CSS
  - ADR-JS
  - ADR-ANTIPATTERN
  - longevity-guidelines
code_links:
  - website/index.html
error_patterns:
  - html architektur
  - custom elements
  - contenteditable
  - plaintext-only
  - enterkeyhint
  - popover
  - popover top layer
  - dialog
  - commandfor
  - command invoker
  - input switch
  - din-a4
  - semantik
  - premium ux
  - wysiwyg
  - zero div soup
supersedes:
  - adr-feature
depends_on: []
---

# ADR-HTML: HTML Architecture, Constraints & Single Source of Truth (SSOT)

## 1. Context & Problemstellung

**Strikte HTML5-Semantik und nativer Top-Layer vs. überladene Div-Suppen und JavaScript-Dialoge.**

Klassische Web-Editoren und Office-Nachbildungen leiden häufig unter unübersichtlichen, tief verschachtelten `<div>`-Strukturen, fragilen JavaScript-Dialog-Bibliotheken und asynchron montierten DOM-Knoten. Solche Ansätze führen zu unvorhersehbarem Tastaturfokus, Barrierefreiheitslücken und `z-index`-Konflikten.

In DIN-Brief Neo ist die HTML-Architektur als **minimalistischer, semantischer Dokumenten- und Komponentenbaum** aufgebaut. Durch den konsequenten Einsatz moderner Web-Platform-Standards (Chrome 148+ / Baseline 2024–2026) übernimmt die HTML-Ebene deklarativ Aufgaben, die früher hunderte Zeilen JavaScript erforderten:
- Vollständige Trennung von DIN-Geometriebereichen über semantische Custom Elements (`<din-*>`).
- Native Top-Layer-Platzierung für Popovers, Kontext-Toolbars und Toasts ohne `z-index`.
- Deklarative Modal-Steuerung über native Command Invoker (`commandfor`, `command`).
- Hardwarebeschleunigter Schutz vor Rich-Text- und Zeilenumbruch-Einschleusung via `contenteditable="plaintext-only"` und `enterkeyhint="done"`.
- Semantische Binärschalter über den W3C-Standard `<input type="checkbox" switch>`.

---

## 2. Grundlegende Architektur-Entscheidungen

1. **Semantische Custom Elements als erstklassige DOM-Bürger:**
   Statt nichtssagender `<div>`-Container nutzt das Briefblatt 24 semantische HTML5-Custom-Elements (`<din-a4>`, `<din-anschriftfeld>`, `<din-betreff>`, `<din-text>`, etc.). Dies sorgt für kristallklare DOM-Lesbarkeit und ermöglicht im CSS präzises Scoping via `@scope (din-a4)`.
2. **Strict WYSIWYG & In-Place Editing:**
   Eingaben finden *ausschließlich* direkt auf dem virtuellen Papierbogen statt. Formularfelder werden nicht redundant in einer Seitenleiste gespiegelt. Die Sidebar dient ausschließlich globalen Konfigurationen (Theming, DIN-Layout-Form, Schriftart, API-Schlüssel, Schalter).
3. **Hardwarebeschleunigter Eingabeschutz (`plaintext-only` & `enterkeyhint`):**
   Alle 16 einzeiligen Metadaten- und Anschriftfelder sind mit `contenteditable="plaintext-only"` und `enterkeyhint="done"` geschützt. Unerwünschte Formatierungen (Fett, Kursiv, HTML-Tags) und mehrzeilige Zeilenumbrüche werden direkt von der Browser-Engine in C++ geblockt. JS-Keydown- und BeforeInput-Interzeptoren sind vollständig eliminiert (ADR-ANTIPATTERN Abs. 14).
4. **Strikt reglementierte Rich-Text-Zonen:**
   Ausschließlich der Brieftext (`<din-text id="brieftext">`) und die Anlagenliste (`<ul id="anlagen-text">`) sind mit `contenteditable="true"` deklariert.
5. **Contenteditable Integrity Isolation (Catalog A47):**
   Interaktive oder strukturelle Elemente (wie z. B. `<div id="signature-container">` mit `<img id="signature-image">`) dürfen niemals innerhalb von `contenteditable`-Elementen verschachtelt werden. Sie werden als Geschwister-Elemente in einem isolierten Container platziert, um eine Zerstörung des inneren DOM-Baums bei Texteingaben physisch auszuschließen.
6. **Top-Layer-Mandat für Overlays (Popover API & `<dialog>`):**
   Sämtliche schwebenden Elemente (Format-Toolbar, Adressvorschläge, Clipboard-Kandidaten, Toasts) nutzen die native HTML Popover API (`popover="manual"`, `popover="auto"`, `popover="hint"`). Modale Dialoge nutzen das standardkonforme `<dialog>`-Element mit `<form method="dialog">`.
7. **Deklarative Invoker / Command API:**
   Aktionen zum Öffnen des Zurücksetzen-Dialogs und Formatier-Befehle nutzen native HTML Command Invokers (`commandfor="reset-dialog" command="show-modal"`).
8. **Semantische Schalter (`<input type="checkbox" switch>`):**
   Der Hilfslinien-Schalter nutzt das native HTML-Attribut `switch` für ein barrierefreies, betriebssystemnahes Toggle-Bedienelement ohne redundante Radio-Container.
9. **HTML-Attribute als Single Source of Truth für DIN-Geometrie:**
   Die millimetergenauen Normkoordinaten für Form A und Form B sind als `data-*`-Attribute direkt am `<din-a4>`-Element hinterlegt und werden vom CSS über `attr(data-* type(<number>))` ausgelesen.

---

## 3. Single Source of Truth: HTML-Komponenten- & DOM-Registry

Die gesamte Benutzeroberfläche von DIN-Brief Neo ist in einer einzigen schlanken, semantischen HTML-Datei gebündelt:

```
website/index.html (331 Zeilen | 160 Tags | 67 IDs | 50 Klassen)
```

---

### 1. Document Head & Pre-Hydration Bootstrapper (Zeilen 1–40)

* **Metadaten & Viewport:** Standard-Deklaration `UTF-8`, `viewport: width=device-width, initial-scale=1.0`.
* **Inlined SVG Favicon:** Scharfes, datensparsames Vektor-Brief-Icon ohne externe HTTP-Anfragen.
* **Cascade Layer Vorab-Deklaration:** `<style> @layer reset, tokens, layout, floating; </style>` im `<head>` garantiert die strikte Kaskaden-Hierarchie vor dem Nachladen der Stylesheets.
* **Modulare Stylesheet-Links:**
  * `<link rel="stylesheet" href="css/reset.css" layer="reset">`
  * `<link rel="stylesheet" href="css/variables.css" layer="tokens">`
  * `<link rel="stylesheet" href="css/layout.css" layer="layout">`
  * `<link rel="stylesheet" href="css/floating.css" layer="floating">`
  * `<link rel="stylesheet" href="css/print.css" media="print">`
* **Zero-FOUC Inline-Bootstrapper:**
  * Liest `din_settings` synchron aus dem `localStorage` und setzt `colorScheme` (`light` / `dark`) auf `documentElement` noch vor dem ersten Rendern (verhindert FOUC-Blitzen).
  * Injiziert benutzerdefinierte WOFF2-Schriften (`AptosCustom`) als `@font-face` synchron in `document.head`.
* **Modulares JavaScript-Entrypoint:** `<script type="module" src="js/main.js"></script>`.

---

### 2. App-Shell & Sidebar (`<aside class="no-print">`, Zeilen 42–156)

Die Sidebar beherbergt ausschließlich globale Einstellungen und Werkzeuge:

* **Header & Build-Info:**
  * GitHub-Link (`.sidebar-github-link`) mit integriertem SVG.
  * `#btn-dev-mode`: Build-Timestamp-Anzeige und Umschalter für Entwickler-Features.
* **Theme-Umschalter (`role="group"`):**
  * Segmented Control mit `#btn-theme-light` und `#btn-theme-dark` (`focusgroup="horizontal wrap"`).
* **DIN-5008 Layout-Wahl (Form A / Form B):**
  * `#btn-form-a`: Hoher Briefkopf (Faltmarke 1 bei 87 mm, Anschriftfeld bei 32 mm).
  * `#btn-form-b`: Tiefer Briefkopf (Default, Faltmarke 1 bei 105 mm, Anschriftfeld bei 50 mm).
* **Brief-Stil & Tonalität:**
  * `#btn-style-formal` (Förmlich: "Sehr geehrte(r)... / Mit freundlichen Grüßen").
  * `#btn-style-polite` (Höflich: "Guten Tag... / Freundliche Grüße").
  * `#btn-style-casual` (Locker: "Hallo... / Beste Grüße").
* **Semantischer Hilfslinien-Schalter:**
  * `<input type="checkbox" switch id="btn-guides-switch" checked>`: Nativer Schalter.
* **Postvermerk & Zusatzfunktionen (`.sidebar-zusatz-row`):**
  * `#sidebar-pv-select`: Vollwertiges Dropdown mit `appearance: base-select` und normgerechten Postvermerken (Einschreiben, Persönlich/Vertraulich, Warensendung, etc.).
  * `#toggle-postvermerk` & `#toggle-anlagen`: Ausblendbare State-Checkboxes für CSS `:has()`.
  * `#btn-anlagen-toggle`: Umschalt-Button für die Anlagenzeile (`aria-pressed="false"`).
* **Schriftarten-Manager:**
  * `#btn-font-action`: Upload- und Reset-Button für benutzerdefinierte Schriften.
  * `#font-uploader`: Verstecktes Datei-Upload-Element (`accept=".woff2"`).
  * `#font-status-label`: Dynamische Anzeige der aktiven Schriftfamilie.
* **Signatur-Manager:**
  * `#btn-upload-sig-trigger` / `#sig-uploader`: Datei-Upload für Unterschriften-Bilder (PNG, JPEG, WebP).
  * `#btn-reset-sig`: Löscht die hinterlegte Signatur.
* **Adressdienste & Intelligenter Zwischenablagen-Parser:**
  * `#input-geoapify-key`: Passwort-Feld für den Geoapify-API-Key.
  * `#input-address-search`: Autocomplete-Suchfeld für Remote-Adresssuche.
  * `#address-suggestions`: Native Popover-Vorschlagsliste (`popover="auto"`).
  * `#btn-clipboard-address`: Ein-Klick-Button `📋 Zwischenablage lesen` für Impressumsdaten.
  * `#clipboard-candidates-popover`: Top-Layer Auswahlliste (`popover="auto"`) bei mehreren Standorten.
* **Footer-Aktionen:**
  * `#btn-print`: Primärer Druck-Button für nativen PDF-Export (`window.print()`).
  * `#btn-reset`: Gefahren-Button mit declarativem Invoker: `commandfor="reset-dialog" command="show-modal"`.

---

### 3. Der DIN-A4-Bogen (`<din-a4>`, Zeilen 157–233)

Der virtuelle Papierbogen ist als semantischer Artikel deklariert: `<din-a4 class="paper-theme page-1" role="article" aria-label="DIN 5008 Brief">`.

#### DIN-Geometrie Data-Attribute (SSOT)
* `data-width-mm="210"` & `data-height-mm="297"`: DIN A4 Blattgröße.
* `data-punch-y="148.5"`: Lochmarke zentriert auf Blatthälfte.
* **Form B (Default):** `data-absender-y-b="45"`, `data-empfaenger-y-b="50"`, `data-infoblock-y-b="50"`, `data-datum-y-b="92"`, `data-kern-y-b="109"`, `data-fold-1-b="105"`, `data-fold-2-b="210"`.
* **Form A:** `data-absender-y-a="27"`, `data-empfaenger-y-a="32"`, `data-infoblock-y-a="32"`, `data-datum-y-a="74"`, `data-kern-y-a="91"`, `data-fold-1-a="87"`, `data-fold-2-a="181"`.

#### Die 24 Custom Elements & 18 ContentEditable-Felder
1. `<din-falz-oben>`: Obere Faltmarke (auf 8 mm Randbreite begrenzt).
2. `<din-falz-unten>`: Untere Faltmarke (auf 8 mm Randbreite begrenzt).
3. `<din-lochmarke>`: Genormte Lochmarke (auf 8 mm Randbreite begrenzt).
4. `<din-rucksendezeile id="absender">`: Einzeilige Absenderzeile über dem Fenster (`plaintext-only`, `enterkeyhint="done"`).
5. `<din-anschriftfeld id="empfaenger">` (`role="group"`):
   * `<din-postvermerk id="postvermerk">`: Postvermerke (`plaintext-only`).
   * `<din-empfaenger-firma id="empfaenger-firma">`: Firma (`plaintext-only`, `enterkeyhint="done"`).
   * `<div id="empfaenger-name">`: Ansprechpartner (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-empfaenger-strasse id="empfaenger-strasse">`: Straße & Hausnummer (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-empfaenger-ort id="empfaenger-ort">`: PLZ & Ort (`plaintext-only`, `enterkeyhint="done"`).
6. `<din-infoblock id="infoblock">` (`role="group"`):
   * `<div id="info-name">`: Absender-Name (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-absender-strasse id="info-street">`: Absender-Straße (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-absender-ort id="info-city">`: Absender-Ort (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-absender-tel id="info-tel">`: Absender-Telefon (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-absender-mail id="info-email">`: Absender-E-Mail (`plaintext-only`, `enterkeyhint="done"`).
7. `<din-datum id="datum">`: Tagesdatum (`plaintext-only`, `enterkeyhint="done"`).
8. `<din-kern id="briefkern">`:
   * `<din-betreff id="betreff">`: Betreffzeile (`plaintext-only`, max. 2 Zeilen via UI-Protection).
   * `<din-anrede id="anrede">`: Briefanrede (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-text id="brieftext">`: **Rich-Text Fließtext** (`contenteditable="true"`).
   * `<din-grussformel id="grussformel">`: Grußformel (`plaintext-only`, `enterkeyhint="done"`).
   * `<div class="signature-wrapper">` mit `<din-unterschrift id="unterschrift">`: Getippter Name (`plaintext-only`, `enterkeyhint="done"`).
   * `<din-anlagen id="anlagen">`: Anlagenvermerk mit `<ul id="anlagen-text" contenteditable="true">`.
9. `<din-fuss id="brief-fuss">`: Fußzeilenbereich (`role="contentinfo"`).
10. `#signature-container` (Isoliert außerhalb von ContentEditable):
    * `.sig-bounding-box` mit Transformations-Handles (`.top-left`, `.top-right`, `.bottom-left`, `.bottom-right`, `.sig-rotate-handle`).
    * `<img id="signature-image" alt="Unterschrift" draggable="false">`: Bild-Signatur ohne Textfluss-Interferenz.

---

### 4. Schwebende Top-Layer Overlays & Dialoge (Zeilen 235–265)

* **Format-Toolbar (`#format-toolbar`):**
  * `popover="hint"`: Schließt automatisch bei Klick außerhalb oder Selektionsverlust.
  * Verankert per CSS Anchor Positioning an `#selection-anchor`.
  * Command Invoker Buttons für Fett (`--bold`), Unterstrichen (`--underline`), Zitat (`--quote`) und Kommentar (`--comment`).
* **Toast-Benachrichtigungssystem (`#toast-v4`):**
  * `popover="manual"`: Rendert direkt im Top-Layer über allen Dialogen ohne `z-index`.
  * `#toast-message`: Textkörper für Statusinformationen.
  * `#toast-badge`: Badge-Zähler für Toast-Deduplizierung (`x2`, `x3`).
  * `#toast-action`: Optionaler Inline-Aktions-Button (z. B. Undo).
  * `#toast-close`: Schließen-Button (`×`).
* **Zurücksetzen-Modal (`<dialog id="reset-dialog">`):**
  * Nativer HTML5 `<dialog>` mit Glassmorphism-Backdrop.
  * `<form method="dialog">`: Schließt den Dialog nativ ohne JavaScript bei Klick auf "Abbrechen" (`value="cancel"`).
  * `#btn-confirm-reset`: Bestätigungs-Button (`value="confirm"`).

---

### 5. Post-DOM Inline Rehydration (Zeilen 266–328)

* Synchronisiert Radio-Buttons und Checkboxen sofort nach DOM-Erstellung mit gespeicherten Einstellungen.
* Füllt ContentEditable-Felder aus `localStorage` (`din_draft_current`) noch vor dem Start externer Module.
* Synchronisiert Postvermerke sofort reaktiv mit `#sidebar-pv-select`.

---

## 4. Antipattern- & Deprecation-Registry (Verbotene HTML-Praktiken)

Folgende HTML-Strukturen und Alt-Muster sind im gesamten Repository **strikt verboten (HARD BAN)**:

| HTML-Konstrukt / Antipattern | Frühere Verwendung | Status | Verboten durch | Moderner Ersatz (Web Platform 2026) |
| :--- | :--- | :---: | :--- | :--- |
| **Generische Div-Suppe** | Reine `<div>`-Verschachtelungen für Briefelemente | 🚫 **HARD BAN** | Longevity Guidelines, ADR-HTML | Semantische HTML5 Custom Elements (`<din-a4>`, `<din-betreff>`, etc.). |
| **Mirror-Editing in Sidebar** | Doppelte Textfelder in Sidebar und Blatt | 🚫 **HARD BAN** | ADR-HTML Abs. 2, WYSIWYG | Reines In-Place WYSIWYG Editing direkt auf dem `<din-a4>`-Blatt. |
| **`contenteditable="true"` auf Einzeilern** | Standard-Editable für Anschrift, Betreff, Datum | 🚫 **HARD BAN** | ADR-ANTIPATTERN Abs. 14, Probe P4 | `contenteditable="plaintext-only"` mit `enterkeyhint="done"`. C++ blockiert Formatierung nativ. |
| **`<img>` innerhalb von `contenteditable`** | Unterschriften-Grafik im Fließtext | 🚫 **HARD BAN** | Immutable Law Catalog A47 | Kapselung in separatem `#signature-container` als Geschwister-Element außerhalb von ContentEditable. |
| **Eigene `<div>`-Modals mit `z-index`** | Manuell geschichtete Overlays und Dialoge | 🚫 **HARD BAN** | ADR-ANTIPATTERN Abs. 15, Probe P5 | Native HTML Popover API (`popover`) und `<dialog>` im Browser-Top-Layer. |
| **JS-Event-Listener für Dialog-Öffnung** | `btn.addEventListener('click', () => dialog.showModal())` | 🚫 **HARD BAN** | Modern DOM Standards 2026 | Deklarative HTML Command Invokers (`commandfor="reset-dialog" command="show-modal"`). |
| **Radio-Controls für Binärschalter** | Segmented Control ("An" / "Aus") für Hilfslinien | ⚠️ **DEPRECATED** | ADR-ANTIPATTERN Abs. 16, Prio 5 | Semantisches `<input type="checkbox" switch id="btn-guides-switch">`. |
| **`scroll`-relevante Attribute / Tags** | Scroll-Container, `overflow-scroll`-Klassen | 🚫 **HARD BAN** | Zero-Scroll-Mandat, CI-Gate | Physisches A4-Papier scrollt niemals. Der Begriff `scroll` ist in `website/*.html` komplett verboten. |

---

## 5. Konsequenzen & Entwickler-Direktiven

1. **Zero Div Soup:** Neue Komponenten müssen semantisch benannt und als eigenständige HTML-Tags realisiert werden.
2. **Top-Layer First:** Jedes Menü, Dropdown und jeder Dialog muss native Popovers oder das `<dialog>`-Element nutzen.
3. **Plaintext-Schutz:** Jedes neu hinzukommende Datenfeld auf dem Briefbogen muss zwingend mit `contenteditable="plaintext-only"` und `enterkeyhint="done"` versehen werden.
4. **Single Source of Truth:** Jedes neue Attribut, Custom Element oder Steuerelement in `website/index.html` muss zwingend in diesem Dokument (`ADR-HTML.md`) nachgeführt werden.

---

## 6. Related Documents

- [[ADR-CSS]]
- [[ADR-JS]]
- [[ADR-ANTIPATTERN]]
- [[longevity-guidelines]]

---

### Feature Checks

```javascript feature-check
// f("Feature Name", Bedingung, "Chrome XXX", "Status")
f("HTML Popover API", typeof HTMLElement !== "undefined" && "popover" in HTMLElement.prototype, "Chrome 114", "Produktiv"),
f("HTML Dialog Element", typeof HTMLDialogElement !== "undefined", "Chrome 37", "Produktiv"),
f("HTML contenteditable plaintext-only", typeof document !== "undefined" && "plaintextOnly" in document.createElement("div"), "Chrome 131", "Produktiv"),
f("HTML Checkbox Switch", typeof document !== "undefined" && "switch" in document.createElement("input"), "Chrome 135", "Produktiv"),
f("HTML Command Invoker API", typeof HTMLButtonElement !== "undefined" && "commandForElement" in HTMLButtonElement.prototype, "Chrome 135", "Produktiv"),
f("HTML enterkeyhint Attribut", typeof document !== "undefined" && "enterKeyHint" in document.createElement("input"), "Chrome 77", "Produktiv")
```