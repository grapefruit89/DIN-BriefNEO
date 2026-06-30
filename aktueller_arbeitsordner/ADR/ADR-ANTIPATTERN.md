---
title: "Architectural Decision Record (ADR): Forbidden Practices & Antipatterns"
status: accepted
date: 2026-05-24
deciders: morit, antigravity
tags: [obsidian, adr, antipattern, rules, boundaries, security, local-context]
aliases: ["Architectural Decision Record (ADR): Forbidden Practices & Antipatterns"]
related: ["[[ADR-HTML]]", "[[ADR-CSS]]", "[[ADR-JS]]", "[[ADR-API]]", "[[longevity-guidelines]]"]
---

# Architectural Decision Record (ADR): Forbidden Practices & Antipatterns

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Um die Langlebigkeit, Wartungsfreiheit, extreme Performance und uneingeschränkte Offline-Lauffähigkeit von **DIN-BriefNEO** zu sichern, müssen bestimmte, im modernen Web oft übliche Praktiken strikt verboten werden. Dieses Dokument dient als unnachgiebige "Verfassung" zur Einhaltung der Projekt-Bedingungen.

---

## Verbotene Praktiken (Antipatterns)

### 1. Verwendung von Frameworks & Build-Tools (Striktes Verbot)
Es dürfen **keine** Frameworks wie React, Vue, Svelte, Angular oder Bibliotheken wie jQuery oder TailwindCSS eingebunden werden.
*   **Begründung:** Frameworks führen zu massiver Komplexität, Abhängigkeiten und erfordern Build-Systeme (Vite, Webpack). Die Applikation MUSS reines Vanilla HTML5, Vanilla CSS3 und reines Vanilla JS ES-Modules verwenden, damit sie für den Endanwender für Jahrzehnte wartungsfrei bleibt.

### 2. Externe CDNs & Google Web Fonts (Striktes Verbot)
Es dürfen **keinerlei** externen Scripts, Stylesheets oder Webfonts über CDNs oder externe Server geladen werden (z. B. Google Fonts).
*   **Begründung:** Verstößt gegen die DSGVO (IP-Abfluss) und zerstört die Offline-Lauffähigkeit der App. Alle Assets müssen zu 100 % lokal abgelegt und offline verfügbar sein.
*   **Verweis:** Siehe [[ADR-CSS|ADR-CSS.md]] zur Typografie und [[ADR-FEATURE|ADR-FEATURE.md]] zum Schriftarten-Manager.

### 3. Komplexere lokale Storage-APIs (OPFS, IndexedDB, File System API)
Die Verwendung von IndexedDB, Origin Private File System (OPFS), File System Access API oder der Storage-API im weiteren Sinne ist untersagt.
*   **Begründung:** Diese APIs erfordern zwingend einen sicheren Kontext (HTTPS oder `localhost`). Wird die `index.html` als lokale Datei per Doppelklick geöffnet (`file:///`), werfen diese APIs im Browser Sicherheits-Exceptions und blockieren den Ladezyklus.
*   **Entscheidung:** **LocalStorage** ist die einzige persistente Speicher-API, die unter `file://` garantiert stabil und ausnahmslos in Chrome 148+ funktioniert.

### 4. Veraltetes document.execCommand (Striktes Verbot)
Die Nutzung von `document.execCommand` für selbstentwickelte Editorelemente (wie Zitate) ist untersagt.
*   **Begründung:** Die API ist *deprecated* (veraltet) und wird in modernen Browser-Engines schrittweise entfernt. Für die Toolbar-Formatierung nutzen wir ausschließlich native Browser-Shortcuts oder die zukunftssichere Selection & Range API.
*   **Verweis:** Siehe [[ADR-JS|ADR-JS.md]] zur DOM-Baum-Durchquerung.

### 5. Scrollbalken im Viewport (Striktes Verbot)
Die Sichtbarkeit von Scrollbalken im normalen Anwendungsfenster (ausgenommen bewusster Browser-Zoom des Nutzers) ist verboten.
*   **Begründung:** Stört die Ästhetik des Premium-Designs und beeinträchtigt das WYSIWYG-Konzept des Briefbogens.
*   **Verweis:** Siehe [[ADR-CSS|ADR-CSS.md]] zur Viewport-Sperre.

### 6. Verwendung von Legacy-Datums-APIs (new Date(), moment.js, date-fns) (Striktes Verbot)
Die Verwendung des klassischen JavaScript `Date`-Objekts (`new Date()`) sowie externer Datumsbibliotheken wie `moment.js`, `date-fns` oder `luxon` ist strikt untersagt.
*   **Begründung:** Das klassische `Date`-Objekt gilt in W3C-Standardisierungskreisen als historisch fehlkonstruiert (Veränderbarkeit / Mutability, unzuverlässige Zeitzonenberechnungen, 0-basierte Monatsindizes, fehleranfällige Schaltjahrlogik). Moment.js und Co. blähen die Codebasis auf und verletzen den Zero-Dependency-Pakt.
*   **Entscheidung:** Die zukunftsweisende W3C **Temporal API** (`globalThis.Temporal`) ist die exklusive Datums-Engine der Anwendung. Sie ist vollkommen fehlerfrei, immutable, unterstützt Zeitzonen und deutsche Kalenderformate nativ und läuft vollständig offline ohne eine einzige Library.

### 7. Verwendung von Nicht-OKLCH Farbräumen (HEX, RGB, RGBA, HSL, HSLA, Named Colors) (Striktes Verbot)
Die Verwendung jeglicher klassischer Farbräume wie HEX-Codes (`#HEX`), RGB/RGBA, HSL/HSLA oder Named CSS Colors (`white`, `black`, `red`, `gray` etc.) in Stylesheets oder inline-Styles ist strikt untersagt.
*   **Begründung:** Der moderne OKLCH-Farbraum ist wahrnehmungslinear (perceptually uniform) und ermöglicht im Gegensatz zu klassischen Modellen mathematisch exakte Helligkeits-, Sättigungs- und Kontrastberechnungen (wichtig für harmonische Relative Color Syntax Formeln). HEX und Co. verhalten sich bei Skalierungen unvorhersehbar und verhindern ein mathematisch konsistentes Themes-Design.
*   **Entscheidung:** Sämtliche Farbdeklarationen dürfen **ausschließlich** im `oklch()` Format deklariert werden. Die einzige Ausnahme bildet das pure CSS-Schlüsselwort `transparent` (welches bevorzugt durch `oklch(0% 0 0 / 0%)` ersetzt wird).

### 8. Verwendung von CSS-Präprozessoren (Sass, Less) oder CSS-in-JS (Striktes Verbot)
Die Verwendung von Sass, Less, Stylus oder JavaScript-basierten Stylesystemen (z. B. Styled Components, Emotion) ist verboten.
*   **Begründung:** CSS Nesting und CSS Custom Properties sind mittlerweile native W3C Living Standards und werden vollumfänglich von der Browser-Engine unterstützt. Präprozessoren erfordern Build-Systeme, und CSS-in-JS erzeugt massiven JS-Laufzeit-Overhead, was unsere Säulen der Einfachheit und Wartungsfreiheit verletzt.

### 9. Externe Icon-CDNs (FontAwesome, Lucide) oder massive Webfonts-Icons (Striktes Verbot)
Die Einbindung von Icon-Fonts (z. B. Material Icons) oder externen Scripts/Stylesheets von Icon-Providern ist strikt untersagt.
*   **Begründung:** Verletzt das DSGVO-Datenschutzprinzip (IP-Abfluss an externe Server) und bricht die Offline-Lauffähigkeit. Icon-Schriften laden oft Hunderte ungenutzte Grafiken und blähen die Ladezeit auf. Icons müssen stattdessen sauber als Inline-SVGs oder hochkomprimierte lokale SVG-Einzeldateien realisiert werden.

### 10. Schwere JS-Hilfsbibliotheken (Lodash, Underscore) & JS-Transpiler (TypeScript, Babel) (Striktes Verbot)
Die Einbindung externer JS-Utility-Suites oder das Erzwingen von TypeScript-Kompilierungsschleifen für den Web-Code ist verboten.
*   **Begründung:** Vanilla ES6+ verfügt über hervorragende native Methoden (`map`, `filter`, `reduce`, `find` etc.), die Bibliotheken wie Lodash komplett obsolet machen. TypeScript-Kompilierer zerstören den unmittelbaren "Doppelklick-Start" der unveränderten lokalen Quelldateien. Wir schreiben reines Vanilla JS ES-Modules.

### 11. JS-gestützte Animationsbibliotheken (GSAP, Anime.js) (Striktes Verbot)
Die Verwendung von Animationsbibliotheken (GSAP, Anime.js, jQuery animate) ist untersagt.
*   **Begründung:** JS-gesteuerte Animationen belasten den Haupt-Thread des Browsers. CSS Transitions, `@starting-style`, `@keyframes` und die native View Transitions API laufen hochoptimiert und hardwarebeschleunigt asynchron auf dem Compositor Thread (Grafikkarte), was flüssige 120Hz-Animationen garantiert.

### 12. Inline-CSS-Styles für Layout, Farben und Positionen (Striktes Verbot)
Die Verwendung von inline `style="..."` Attributen für strukturelle oder gestalterische Zwecke (ausgenommen Koordinaten-Offsets bei Selektionen) ist verboten.
*   **Begründung:** Inline-Styles hebeln die `@scope (din-a4)` Geometrie-Kapselung aus und stören die Wiederverwendbarkeit von CSS OKLCH design tokens. Alle visuellen Anweisungen müssen strikt in den entsprechenden Stylesheets deklariert werden.

---

## Konsequenzen
*   Jede Code-Änderung, die gegen eines dieser zwölf Antipatterns verstößt, wird im Code-Review sofort verworfen.


*   Die Lauffähigkeit unter `file:///index.html` ist die oberste QA-Voraussetzung.

---

## Verknüpfungen
*   Siehe [[ADR-HTML|ADR-HTML.md]] zu `contenteditable` und Popover.
*   Siehe [[ADR-CSS|ADR-CSS.md]] zum reinen CSS-Zoom.
*   Siehe [[ADR-JS|ADR-JS.md]] zur JavaScript-Reglementierung.
*   Siehe [[ADR-API|ADR-API.md]] zur Header-Sicherheit.
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.

