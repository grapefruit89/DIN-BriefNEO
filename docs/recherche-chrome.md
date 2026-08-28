---
id: chrome-bleeding-edge-recherche
title: 'Chrome 140-151 Feature Recherche'
type: reference
status: active
created: '2026-08-28'
updated: '2026-08-28'
tags:
  - web-platform
  - chrome
  - ui
doc_links: []
code_links: []
error_patterns: []
---

# Neue Chrome Web Platform Features (145-151)
In dieser Recherche wurden die relevantesten Frontend-Features der Chrome Versionen 145 bis 151 gesammelt. Da DIN-Brief Neo einem strikten "Vanilla Web Standards" Mandat folgt, evaluieren wir diese Features direkt auf ihren Nutzen für das Projekt.

## Chrome 151
* **`interesttarget` & `::interest-button` (HTML/CSS):** Ermöglicht native Tooltips oder Popovers bei Hover ohne Javascript.
  * *Nutzen für DIN-Brief Neo:* Wir können die `mouseover`/`mouseleave` Logik für alle Tooltips im Format-Toolbar komplett durch deklaratives HTML ersetzen!
* **Asynchrone Zielverknüpfung für `popovertarget` & `commandfor` (HTML):**
  * *Nutzen für DIN-Brief Neo:* Popovers (wie das Toast oder Address-Suggestions) können per `<button popovertarget="toast-v4">` ohne `element.showPopover()`-JavaScript geöffnet werden. `commandfor` erlaubt weitere native DOM-Aktionen.

## Chrome 150
* **CSS `text-fit`:** Skaliert Schriftgrößen automatisch, sodass sie perfekt in eine Container-Box passen.
  * *Nutzen für DIN-Brief Neo:* Extrem nützlich für die Rücksendezeile oder Adressfelder, in denen Text sonst überlaufen könnte. Ersetzt potenziell unser aktuelles `48-text-fit.js` Script!
* **HTML `focusgroup`:** Deklarative Tastaturnavigation (Pfeiltasten) innerhalb von Gruppenelementen (z.B. Menüs, Toolbars).
  * *Nutzen für DIN-Brief Neo:* Perfekt für das Format-Toolbar, um Tastatur-Fokus-Management ohne Javascript abzubilden.
* **`background-clip: border-area` (CSS):** Native Erstellung von Gradienten auf Rahmen (Borders).

## Chrome 149
* **CSS Gap Decorations (`column-rule-inset`, `row-rule-inset`):**
  * *Nutzen für DIN-Brief Neo:* Ersetzt alte Hacks mit `::before`/`::after` zum Stylen von Abständen in Grid- und Flexbox-Layouts. Super nützlich für die Sidebar!
* **Text Overflow Interaction:** `text-overflow: ellipsis` wechselt nativ zu `clip`, wenn Nutzer im Text navigieren (Caret/Edits).
  * *Nutzen für DIN-Brief Neo:* Genial für die einzeiligen `contenteditable`-Felder, die wir mit "Atomic Line Limits" beschränken.

## Chrome 148
* **Prompt API (`window.ai`):** Erlaubt direkte lokale Abfragen an das On-Device KI-Modell (Gemini Nano) ohne API-Key.
  * *Nutzen für DIN-Brief Neo:* Könnte für eine Offline-KI-Textverbesserung im DIN-Brief Neo genutzt werden (z.B. "Formaler formulieren" im Format-Toolbar).
* **Name-only Container Queries (CSS):**
  * *Nutzen für DIN-Brief Neo:* Macht Media Queries noch kompakter für unser Responsive Design.

## Chrome 145
* **Multi-Column Layout Wrapping (`column-wrap`):** CSS Spalten können sauberer umbrechen.
* **Customizable `<select>`:** Native Anpassung (Listbox Rendering) des Dropdowns ohne Javascript-Wrappers.
  * *Nutzen für DIN-Brief Neo:* Wir könnten eventuelle Dropdown-Menüs (wie das Postvermerk-Dropdown) durch ein natives `<select>` ersetzen, das endlich voll per CSS stylbar ist!

---
**Nächste Schritte:** Wir sollten für `text-fit`, `focusgroup`, `interesttarget` und `popovertarget` Proof-of-Concepts in `sandbox/` bauen und dann die JS-Dateien verschlanken!

## Chrome I/O 2026 Web UI Updates (Chrome 146-150+)
* **light-dark() für Bilder (CSS, Chrome 150):** Die ohnehin schon geniale light-dark() Funktion akzeptiert jetzt nicht mehr nur Farben, sondern auch Bilder.
  * *Nutzen für DIN-Brief Neo:* Wir können Theme-abhängige Hintergrundbilder oder Logos (Hell/Dunkel) mit einem einzigen CSS-Befehl ausliefern, ohne Javascript-Theme-Watcher.
* **contrast-color() (CSS, Chrome 147):** Gibt automatisch white oder lack zurück, je nachdem, was den besseren Kontrast zur Hintergrundfarbe hat.
  * *Nutzen für DIN-Brief Neo:* Perfekt für dynamische Badges oder UI-Elemente, bei denen der Text immer lesbar bleiben muss.

## Chrome 149: Selective Format Read (Async Clipboard API)
* **Performance-Boost beim Einfügen:** 
avigator.clipboard.read() liest Daten aus der Zwischenablage ab sofort *lazy*. Die Metadaten werden sofort geliefert, aber die echten Bytes (z.B. riesiges HTML oder Bilder) werden erst geladen, wenn man explizit getType(mimeType) aufruft.
  * *Nutzen für DIN-Brief Neo:* Da wir bei unseren atomaren Zeilen (z.B. Adressfeld) beim *Paste*-Event extrem streng filtern und HTML-Formatierungen oft absichtlich verwerfen, verschwendet der Browser hier keine Zeit und keinen RAM mehr beim Laden von Inhalten, die wir ohnehin filtern. Das macht das Einfügen im DIN-Brief massiv schneller und flüssiger!


## Chrome 151: Das <usermedia> HTML-Element
* **Ersetzt getUserMedia() in Javascript:** Anstatt den Zugriff auf Kamera und Mikrofon über Javascript zu programmieren, gibt es jetzt ein natives HTML-Element. Der Browser kümmert sich komplett selbst um den Berechtigungs-Dialog (Zulassen/Ablehnen) und liefert den Kamera-Stream.
  * *Nutzen für DIN-Brief Neo:* Wir nutzen aktuell keine Kamera im Projekt (die Unterschrift wird als Bilddatei hochgeladen). **Aber:** Wir könnten damit super einfach ein neues Feature bauen: 'Unterschrift direkt mit der Webcam abfotografieren' – und das fast komplett ohne Javascript-Boilerplate!


## Chrome 138-140 (Rückblick für DIN-Brief Neo)
* **scrollIntoView({container: 'nearest'}) (Chrome 140):** Scrollt ein Element in den Sichtbereich, aber *nur* innerhalb seines direkten Scroll-Containers (z.B. einer Dropdown-Liste).
  * *Nutzen für DIN-Brief Neo:* Wir haben Dropdowns (z.B. Adress-Vorschläge von Geoapify). Wenn man dort mit den Pfeiltasten navigiert, scrollt oft versehentlich das ganze Browserfenster. Mit container: 'nearest' scrollt nur die Liste!
* **ToggleEvent.source (Chrome 140):** Wenn ein Popover durch einen Button mit popovertarget geöffnet wird, enthält das Event nun einen Verweis auf genau diesen Button.
  * *Nutzen für DIN-Brief Neo:* Wenn wir Popovers ohne JS öffnen, weiß unser Javascript jetzt trotzdem, *welcher* Button geklickt wurde, falls wir den Status (z.B. ria-pressed) updaten müssen.
* **equest-close Command (Chrome 139):** Ein nativer HTML-Befehl <button commandfor='mein-popover' command='request-close'>, um Popovers/Dialoge zu schließen, ohne JS.
  * *Nutzen für DIN-Brief Neo:* Perfekt in Kombination mit popovertarget. Damit können wir in Toasts oder Menüs einen Schließen-Button einbauen, der komplett ohne Javascript läuft.
* **CSS stretch Keyword (Chrome 138):** Eine neue Größe (wie 100%), die aber die Margins respektiert, ohne dass man calc(100% - 20px) rechnen muss.
  * *Nutzen für DIN-Brief Neo:* Sehr nützlich für die Layout-Container (z.B. das Briefblatt oder die Sidebar), um sie sauber in den verfügbaren Platz einzupassen.


## Chrome 141-143 (Weitere Highlights)
* **interestfor Attribut (Chrome 142):** Der Vorläufer (oder die Umbenennung) von interesttarget. Erlaubt es, Popovers nur durch Hovern oder langen Touch (ohne Javascript mouseenter/mouseleave) anzuzeigen.
  * *Nutzen für DIN-Brief Neo:* Wir können Tooltips an den Format-Buttons im Toolbar komplett deklarativ ins HTML schreiben. JS wird überflüssig!
* **input Event mit dataTransfer (Chrome 143):** Wenn Nutzer Text in contenteditable einfügen (Paste/Drop), hat nun auch das ganz normale input-Event Zugriff auf das dataTransfer-Objekt (die Zwischenablage).
  * *Nutzen für DIN-Brief Neo:* Wir können unsere komplexe Copy&Paste-Filterlogik (die aktuell auf dem paste-Event und eforeinput lauscht) stark vereinfachen und vereinheitlichen.
* **@container anchored(fallback) (Chrome 143):** Bei CSS Anchor Positioning kann man nun per Container-Query abfragen, ob das Popover (wegen Platzmangel) nach oben statt nach unten geklappt ist.
  * *Nutzen für DIN-Brief Neo:* Perfekt, um z.B. einen kleinen Pfeil am Popover dynamisch nach oben oder unten zeigen zu lassen, je nachdem wie der Browser das Popover positioniert hat.
* **ARIA Notify API (Chrome 141):** Eine neue Javascript-Funktion riaNotify(), die direkt zu Screenreadern spricht.
  * *Nutzen für DIN-Brief Neo:* Ersetzt alte, unsichtbare ria-live HTML-Container. Wenn wir z.B. einen Toast anzeigen ('Entwurf gespeichert'), können wir das dem Screenreader nun mit einer Zeile nativem JS elegant mitteilen.


## Chrome 146
* **meta name=	ext-scale`:** Erlaubt der Webseite, die im Betriebssystem eingestellte Text-Skalierung (z.B. große Schrift für Sehbehinderte) nativ für das Root-Element (em) zu übernehmen.
  * *Nutzen für DIN-Brief Neo:* Wir können die Sidebar (UI) barrierefreier machen, indem sie sich automatisch an die OS-Schriftgröße anpasst, während das DIN-A4-Blatt (Papiermaß) maßstabsgetreu bleibt.
* **dataTransfer.dropEffect Fix:** Endlich wird der in dragover gesetzte dropEffect (z.B. 'copy' vs 'move') korrekt an das finale drop Event weitergereicht.
  * *Nutzen für DIN-Brief Neo:* Wichtig für künftige Drag&Drop Features (z.B. Unterschrift-Bilder auf das Dokument ziehen).

## Chrome 131
* **@page margin boxes:** Erlaubt es, per CSS direkt Ränder (Header/Footer) beim Drucken (bzw. im PDF-Export) zu stylen und Seitenzahlen (page / pages) einzufügen!
  * *Nutzen für DIN-Brief Neo:* **Ein Game-Changer!** Bisher erzeugt der Browser oft hässliche URLs oder Datumsangaben in den PDF-Ecken. Mit @page Margin Boxes haben wir die absolute Kontrolle über die PDF-Ränder und können professionelle 'Seite 1 von X' Fußzeilen rein per CSS für den Mehrseiten-Druck bauen!
* **Styling-Verbesserung für <details> & <summary>:** Neues Pseudo-Element ::details-content, womit man den Inhaltsbereich beim Aufklappen z.B. smooth animieren (Grid-Transition) oder flexibel stylen kann.
  * *Nutzen für DIN-Brief Neo:* Perfekt für sauber aufklappbare Accordion-Menüs in der UI-Sidebar (ohne Javascript).
* **CSS Anchor-Positioning nchor-scope:** Beschränkt die Gültigkeit von Anker-Namen (z.B. --format-btn) auf einen Teilbaum.
  * *Nutzen für DIN-Brief Neo:* Sehr wichtig, falls wir auf der Seite mehrere Toolbars haben (z.B. Absender und Textkörper separat). So kommen sich deren Anker nicht ins Gehege.

## Chrome 130
* **ox-decoration-break: clone (unprefixed):** Wenn ein Element über zwei gedruckte Seiten umbricht (Seitenumbruch), kann man definieren, dass Ränder (Borders, Padding) an der Bruchstelle dupliziert (clone) oder zerschnitten (slice) werden.
  * *Nutzen für DIN-Brief Neo:* Wenn wir in Zukunft mehrseitige Briefe unterstützen, bricht der Fließtext um. Mit clone können wir z.B. Zitate oder Info-Boxen, die genau auf dem Seitenumbruch liegen, optisch sauber schließen und auf der nächsten Seite neu öffnen.
* **Keyboard focusable scrollers:** Scrolbare Bereiche (ohne fokussierbaren Inhalt) sind nun standardmäßig mit der Tastatur erreichbar.
  * *Nutzen für DIN-Brief Neo:* Gratis Barrierefreiheit-Boost für die App.


# Auswertung Chrome 133 - 135 (Kategorisiert)

## 1. Neues Feature, das ein altes gut ersetzen kann
* **Node.prototype.moveBefore() (Chrome 133):** Ersetzt alte Methoden wie ppendChild oder insertBefore. Der Clou: Es verschiebt DOM-Elemente, **ohne** dass deren interner Zustand (Fokus, Cursor-Position, offene Popovers, laufende Animationen) verloren geht!
* **etchLater() (Chrome 135):** Ersetzt das alte 
avigator.sendBeacon(). Garantiert, dass Telemetrie oder Auto-Saves noch gesendet werden, auch wenn der Nutzer den Tab schließt.

## 2. Feature, das Javascript massiv verdrängt (KISS & Vanilla)
* **command und commandfor Attribute (Chrome 135):** Man kann Buttons Aktionen zuweisen, völlig ohne JS-EventListener: <button commandfor=my-dialog command=show-modal>.
* **popover=hint` (Chrome 133):** Eine neue Stufe für Popovers, speziell für Hover-Tooltips. Öffnet man ein Hint-Popover, bleiben andere Popovers offen. Perfekt für Tooltips!
* **CSS ttr() für alles (Chrome 133):** Die CSS ttr() Funktion geht nun nicht mehr nur für content, sondern für **alles**, z.B. width: attr(data-width px). Das erspart es uns, Inline-Styles per Javascript setzen zu müssen!
* **CSS :open Pseudo-Klasse (Chrome 133):** Greift nativ, wenn ein <dialog> oder <details> offen ist. Ersetzt das fehleranfällige Setzen von .active oder [aria-expanded] Klassen per Javascript.
* **<dialog closedby=ny> (Chrome 134):** Das Modalfenster schließt sich automatisch, wenn man daneben (ins Leere) klickt. Bisher brauchte man dafür zwingend einen JS Click-Outside-Listener!
* **CSS Scroll-State Container Queries (Chrome 133):** Man kann per CSS abfragen, ob ein Element z.B. festklebt (stuck bei position: sticky). Das ersetzt aufwändige Javascript IntersectionObserver.
* **::scroll-button() (Chrome 135):** Native Scroll-Pfeile (<, >), die sich per CSS an Scroll-Container heften und bei Klick scrollen. JS überflüssig!
* **Customizable <select> (Chrome 134):** Endlich kann man Standard-Dropdowns per CSS (ppearance: base-select) zu 100% frei stylen. Man muss keine Fake-Dropdowns mehr mit divs und JS nachbauen.

## 3. Feature, von dem das Projekt massiv profitiert
* **Die Kombination aus popover=hint und commandfor:** Das ist der Sargnagel für sämtliche EventListener in unserer 31-format-toolbar.js. Wir können die komplette Hover-Logik, die Tooltips und das Aktivieren von Format-Menüs restlos in reines HTML auslagern. Das reduziert den Code immens.
* **<dialog closedby=ny> und :open:** Wir können jegliche Sidebar-Einstellungs-Modals oder Hinweise als native Dialoge umsetzen, die sich fehlerfrei und ohne JS wieder schließen lassen, wenn der Nutzer auf das Blatt klickt.


## Auswertung Chrome 152 (Kategorisiert)

### 1. Neues Feature, das ein altes gut ersetzen kann
* **OpaqueRange:** (Korrektur 2026: Gilt NUR für <textarea> und form-based inputs! Nicht für unser contenteditable). Damit lassen sich Bounding-Boxen für Markierungen in simplen Textfeldern auslesen. Für uns bedeutet das: Wir müssen für unseren Editor weiterhin den DOM-Proxy #selection-anchor nutzen.

### 2. Feature, das Javascript verdrängt (KISS & Vanilla)
* **Klickbares ::backdrop Pseudo-Element (Chrome 152):** Bisher war es in JS schwer zu unterscheiden, ob ein Nutzer *auf* den Dialog oder *auf den Hintergrund (Backdrop)* geklickt hat (man brauchte komplexe Koordinaten-Berechnungen). Jetzt wird das nativ vom Browser aufgelöst! (Ergänzt sich perfekt mit dem <dialog closedby=ny> aus Chrome 134).
* **Relative Alpha-Farben (lpha()) (Chrome 152):** Man kann in CSS nun eine Farbe referenzieren und nur den Alpha-Kanal (Transparenz) ändern. Das erspart uns, per JS oder mit unzähligen CSS-Variablen transparente Versionen unserer Theme-Farben zu generieren.

### 3. Feature, von dem das Projekt massiv profitiert
* **Globales utocorrect Attribut (Chrome 152):** Gilt jetzt ganz offiziell für contenteditable und beliebige HTML-Elemente. Da unser ganzer DIN-Brief aus editierbaren Textblöcken besteht, gibt uns das endlich die native Kontrolle darüber, wo der Browser des Nutzers wild Wörter korrigieren darf und wo nicht (z.B. bei Namen oder Straßennamen extrem wichtig!).


## Quellen & Referenzen
* **Chrome Release Notes:** https://developer.chrome.com/release-notes?hl=de (inkl. spezifischer Versionen bis https://developer.chrome.com/release-notes/152)
* **CSS-Tricks (Recherche-Abgleich Aug 2026):** Aktuelle Artikel zu *Gap Decorations*, *CSS border-shape*, *Dialog Element* und *Custom Highlight API*. Bestätigen unseren Tech-Stack!


## CSS-Tricks Auswertung (Artikel-Scan Seiten 3-10)

### 1. Neues Feature, das ein altes gut ersetzen kann
* **corner-shape (Folded Corners):** Ersetzt komplexe CSS-Hacks (mit Pseudoelementen und Border-Dreiecken) für abgeschnittene oder gefaltete Ecken. 
* **grid-lanes (Masonry Layout):** Nativer Support für Pinterest-artige Mauerwerk-Layouts im CSS Grid. Ersetzt dicke Javascript-Libraries (wie Masonry.js).
* **HTML Anchor Positioning:** Ersetzt die JS-gesteuerte Platzierung von Popovers. (Bestätigt unsere Funde).
* **object-view-box:** Erlaubt das native Zuschneiden (Cropping) von Bildern direkt im CSS, ähnlich wie iewBox bei SVGs. Ersetzt Wrapper-Divs mit overflow: hidden.
* **andom() in CSS:** Ersetzt Javascript Math.random() für zufällige Stile (Größen, Farben, Animation-Delays).

### 2. Feature, das Javascript verdrängt (KISS & Vanilla)
* **The Radio State Machine:** Zeigt das von uns im *Immutable Law Catalog* geforderte Pattern, komplexe App-Zustände (z.B. verschiedene Menüs) über versteckte HTML-Radio-Buttons und CSS :has() zu steuern, statt mit JS.
* **::search-text:** Ein neues CSS-Pseudoelement, mit dem wir Text-Suchergebnisse auf der Seite stylen können (ersetzt komplexe JS-DOM-Modifikationen mit <span>-Wrappern).
* **Styling ohne Focus Traps:** Ein Artikel bestätigt: Man muss Fokus-Traps für Dialoge nicht mehr per Javascript nachbauen; das native <dialog>-Element (besonders mit closedby=any) übernimmt das alles selbst.
* **Cross-Document View Transitions:** Damit können wir fließende Animationen zwischen verschiedenen HTML-Seiten erzeugen, ohne eine Single-Page-Application (SPA) mit React bauen zu müssen. Pure Vanilla HTML Multi-Page-Apps fühlen sich an wie native Apps.
* **Selecting a Date Range in CSS:** Datumsbereiche markieren ohne Kalender-JS. 
* **::nth-letter Selector:** Theoretischer Ausblick, um einzelne Buchstaben per CSS zu stylen (statt JS split()).

### 3. Feature, von dem das Projekt massiv profitiert
* **Popover API or Dialog API: Which to Choose?:** Eine entscheidende Architektur-Frage. Wir können Toolbars als popover=hint und Einstellungs-Menüs als <dialog> implementieren. Beide kommen ohne Javascript aus.
* **Name-only Containers:** Container Queries, die nur nach ihrem Namen referenziert werden. Macht unser Layout-CSS deutlich schlanker.
* **Approximating contrast-color():** Native CSS-Funktionen, die selbstständig eine gut lesbare Textfarbe (hell oder dunkel) für den jeweiligen Hintergrund berechnen! Das ist Gold wert für unsere Theme-Wechsel, ohne Javascript-Farb-Logik.
* **The State of CSS Centering in 2026:** Bestätigt, dass wir alles Unnötige aus dem CSS werfen können, weil Flexbox/Grid-Zentrierung mittlerweile absolut ausgereift ist.


## CSS-Tricks Auswertung (Artikel-Scan Seiten 11-20)

### 1. Neues Feature, das ein altes gut ersetzen kann
* **if() Funktion in CSS:** (Chrome 137+) Erlaubt es, echte Bedingungen im CSS zu schreiben (color: if(style(--theme: dark), white, black)). Ersetzt unzählige Javascript-Klassen-Toggles und komplexe CSS-Variablen-Hacks.
* **width/height: stretch:** Ein neues Schlüsselwort für Größen. Ersetzt oft komplizierte lex: 1 oder calc(100% - padding) Hacks.
* **Native shape() Befehle:** Das Erstellen komplexer Formen wandert direkt in die CSS shape() Funktion.

### 2. Feature, das Javascript verdrängt (KISS & Vanilla)
* **Pure CSS Tabs & CSS State Machines:** Mehrere Artikel ("CSS Elevator", "Radio Button Shopping Cart", "Pure CSS Tabs") beweisen: Wir können komplexe UI-Zustände (wie Tabs, Navigation, Warenkörbe) komplett ohne Javascript bauen, indem wir Radio-Buttons, <details> und :has() kombinieren.
* **Interest Invoker API (interesttarget):** Ein weiterer Deep-Dive zu dem Feature, mit dem Hover-Tooltips ohne JS EventListener getriggert werden.
* **Auto-Closing Notification With an HTML Popover:** Toast-Notifications, die sich nach Zeit selbst schließen – komplett in HTML und CSS gebaut, ohne setTimeout in Javascript!

### 3. Feature, von dem das Projekt massiv profitiert
* **Is it Time to Un-Sass? / So, You Want to Give Up CSS Preprocessors:** Die Entwickler-Community diskutiert genau unseren Ansatz! Native CSS-Features (wie Nesting, Variablen, @function, color-mix, andom, if) machen Build-Tools wie SASS oder PostCSS überflüssig. Das ist eine massive Bestätigung für unser Zero-Build Setup!
* **A Primer on Focus Trapping:** Ein Rückblick darauf, wie schwer Focus-Trapping in JS war, und dass native <dialog>-Elemente das heute kostenlos mitbringen.

## CSS-Tricks Almanac Auswertung (Pseudos & At-Rules)

### 1. Neues Feature, das ein altes gut ersetzen kann
* **@scope:** Ersetzt komplexe Namenskonventionen (wie BEM) oder CSS-Module. Erlaubt es, CSS streng auf einen HTML-Baum zu begrenzen (z.B. nur innerhalb der Sidebar).
* **@layer:** Ersetzt Spezifitäts-Kriege und !important. Wir können klare Hierarchien (Reset, Base, Components, Utilities) für unser CSS definieren.
* **:focus-visible:** Ersetzt das alte :focus. Zeigt den Fokus-Rahmen nur, wenn der Nutzer mit der Tastatur navigiert (nicht, wenn er mit der Maus klickt). Macht die App schöner und barrierefreier zugleich.

### 2. Feature, das Javascript verdrängt (KISS & Vanilla)
* **::picker() und ::picker-icon:** Erlaubt das vollständige, native Styling des Ausklappmenüs und des Pfeils eines <select>-Dropdowns. Riesige Custom-Dropdown-Scripts werden dadurch völlig überflüssig.
* **@starting-style:** Macht CSS-Animationen für Elemente möglich, die von display: none kommen (wie Dialoge oder Popovers). Das war bisher der Hauptgrund, warum Entwickler für Mount/Unmount-Animationen auf JS-Libraries angewiesen waren!
* **@position-try:** Native Kollisionsabfrage für die Anchor-Positioning-API. Verhindert, dass Tooltips oder Popovers aus dem Bildschirm ragen, indem es alternative Positionen durchprobiert – ganz ohne Javascript-BoundingBox-Berechnungen.
* **::details-content:** Erlaubt es, den aufklappenden Bereich eines <details> Akkordeons nativ mit CSS weich zu animieren. JS-Höhenberechnungen entfallen.
* **::checkmark:** Ein natives Pseudo-Element, mit dem wir den Haken von ausgewählten Optionen/Checkboxes frei stylen können, ohne versteckte HTML-Inputs und SVG-Hacks zu basteln.

### 3. Feature, von dem das Projekt massiv profitiert
* **@page und :first:** Die Königsdisziplin für den DIN-Brief. Damit definieren wir die exakten physischen Ränder (Margins) für das finale DIN-A4-Papier, wenn der Nutzer auf Drucken/PDF-Export klickt. Mit :first können wir der allerersten Seite (die das Sichtfenster hat) andere Ränder geben als den Folgeseiten!
* **@property:** Wir können unsere CSS-Variablen typisieren (z.B. als <color> oder <length>). Dadurch lassen sich CSS-Variablen auf einmal stufenlos animieren (z.B. ein weicher Fade zwischen zwei Theme-Farben).

## CSS-Tricks Almanac Auswertung (CSS-Funktionen)

### 1. Neues Feature, das ein altes gut ersetzen kann
* **light-dark():** Macht Dark-Mode-Themes lächerlich einfach. Statt riesiger @media (prefers-color-scheme: dark)-Blöcke schreibt man nur noch color: light-dark(black, white);.
* **color-mix():** Ersetzt SASS-Funktionen wie darken() oder lighten(). Wir können Hover-Effekte bauen, indem wir unsere Theme-Farbe einfach mit 10% Schwarz mischen (color-mix(in srgb, var(--primary), black 10%)).
* **calc-size():** Der Heilige Gral der Webentwicklung! Bisher konnte man height: 0 nicht zu height: auto animieren (z.B. für Dropdowns). Man musste mit JS die exakte Pixelhöhe auslesen. Mit calc-size(auto, size) geht diese Animation endlich flüssig in purem CSS!

### 2. Feature, das Javascript verdrängt (KISS & Vanilla)
* **nchor() und nchor-size():** Das ist das fehlende Teil für unsere Format-Toolbar! Wir binden die Toolbar an das markierte Wort und sagen: left: anchor(--markierung center). Und falls die Toolbar exakt so breit sein soll wie das Wort: width: anchor-size(width). Absolute JS-Zerstörung!
* **sibling-index() und sibling-count():** Damit weiß ein Element per CSS, das wievielte Kind es in einer Liste ist (z.B. bei unseren "Anlagen"). Bisher brauchte man dafür Javascript-Schleifen, um z.B. gestaffelte Einblend-Animationen (Delay = Index * 100ms) zu bauen.
* **Math-Funktionen (bs(), ound(), mod(), sin(), cos()):** Jegliche mathematische Layout-Berechnung (z.B. Raster-Aufrundungen, versetzte Schatten) kann jetzt direkt im CSS passieren. Javascript Math.* ist für Layouts tot.

### 3. Feature, von dem das Projekt massiv profitiert
* **contrast-color():** (Hatten wir schon gesichtet, steht hier aber nochmal stolz). Berechnet eigenständig, ob der Text auf einem Element weiß oder schwarz sein muss.


### Address Autocomplete APIs (Stand Sommer 2026)
* **Geoapify:** 3.000 Requests/Tag dauerhaft kostenlos. Perfekt für Open-Source und client-side Apps, da keine Kreditkarte benötigt wird. Authentifizierung erfolgt zwingend über den URL-Parameter &apiKey=... (nicht per X-Api-Key Header, da dies CORS-Preflights erzwingt).
* **Google Maps Places API:** Bietet zwar 200$ Free-Tier (reicht für ca. 70.000 Autocomplete-Requests/Monat), erfordert aber zwingend eine hinterlegte Kreditkarte. Bei Scraping-Angriffen oder Überschreitung des Limits drohen sofortige Kosten. Für ein lokales "Bring Your Own Key"-Modell wie in DIN-BriefNEO ist Google Maps daher riskant und nutzerunfreundlich.
* **Geoapify UI-Widget (Verboten):** Es existiert ein offizielles UI-Widget (@geoapify/geocoder-autocomplete). Dieses wird im Projekt **NICHT** verwendet! Fremde JS-Widgets bringen eigenes CSS/DOM mit und verletzen unsere Vanilla- und KISS-Prinzipien. Wir feuern ausschließlich nackte etch()-Requests gegen die REST-API und rendern das Dropdown selbst mit modernem Anchor Positioning (position-anchor).
