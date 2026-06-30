---
title: "Architectural Decision Record (ADR): Unified Web Technology Stack & Rationales"
status: accepted
date: 2026-05-24
deciders: morit, antigravity
tags: [obsidian, adr, tech-stack, architecture, choices, rationales, w3c]
aliases: ["Architectural Decision Record (ADR): Unified Web Technology Stack & Rationales"]
related: ["[[ADR-HTML]]", "[[ADR-CSS]]", "[[ADR-JS]]", "[[ADR-API]]", "[[ADR-FEATURE]]", "[[ADR-ANTIPATTERN]]", "[[longevity-guidelines]]"]
---

# Architectural Decision Record (ADR): Unified Web Technology Stack & Rationales

## Status
Akzeptiert

## Kontext & Problemstellung

> [!info] Hintergrund
> Für eine wartungsfreie, performante, datenschutzkonforme und vollständig offline-fähige Anwendung unter der strikten Prämisse der lokalen Kompatibilität (`file:///index.html` per Doppelklick öffnen) müssen alle eingesetzten Webtechnologien sorgfältig ausgewählt werden. Dieses Dokument zentralisiert alle genutzten HTML5-APIs, CSS3-Module und JavaScript-Konstrukte und begründet deren Wahl im Vergleich zu üblichen Alternativen.

---

## 📊 Der Technologie-Stack im Überblick

### 1. HTML (Struktur & Barrierefreiheit)

| Webtechnologie / API | Konkrete Verwendung | Rationale & Vorteile | Verweis |
| :--- | :--- | :--- | :--- |
| **`contenteditable="plaintext-only"`** | Einstellige Metadaten-Felder (Betreff, Anschrift, Datum) | Verhindert nativ (ohne JS-Filter), dass der Benutzer formatierten HTML-Müll aus Word oder Webseiten in DIN-Strukturfelder einfügt. | [[ADR-HTML|ADR-HTML.md]] |
| **`contenteditable="true"`** | Hauptbrieftext (`#brieftext`) | Erlaubt kontrollierte, inline-formatierte Textstrukturen (Fett, Unterstrichen, Zitate). | [[ADR-HTML|ADR-HTML.md]] |
| **Native Popover API (`popover="manual"`)** | Formatierungs-Toolbar und Popover-Toasts | Browser rendert diese Elemente automatisch im **Top-Layer**. Keine CSS `z-index`-Kollisionen mehr, keine Frameworks oder JS-Bibliotheken nötig. | [[ADR-HTML|ADR-HTML.md]], [[ADR-FEATURE|ADR-FEATURE.md]] |
| **HTML5 Custom Elements** | `<din-a4>`, `<din-absender>`, `<din-anschriftfeld>` etc. | Ermöglicht eine glasklare Trennung der DIN 5008 Geometriebereiche im CSS und erhöht die semantische Lesbarkeit des DOM-Baums drastisch. | [[ADR-HTML|ADR-HTML.md]] |
| **A11y ARIA Attributes** | `aria-pressed="true/false"` auf den Formatierungsbuttons | Gewährleistet native Barrierefreiheit und präzise Screenreader-Ansagen über den Format-Status des markierten Textes. | [[ADR-HTML|ADR-HTML.md]] |

---

### 2. CSS (Visuals, Layout & Proportionalität)

| Webtechnologie / API | Konkrete Verwendung | Rationale & Vorteile | Verweis |
| :--- | :--- | :--- | :--- |
| **`oklch()` Farbräume** | Gesamte Farbpalette der Anwendung | Wahrnehmungskonformer (perceptually uniform) Farbraum. Erlaubt präzise, mathematisch stimmige Helligkeitskontrollen und extrem harmonische, augenschonende Farbübergänge. | [[ADR-CSS|ADR-CSS.md]] |
| **`light-dark()` Funktion** | Dynamische Theme-Farben in `variables.css` | Erlaubt eine vollkommen JS-freie Theme-Umschaltung direkt im CSS, indem der Browser je nach `color-scheme` automatisch die passenden Variablen rendert. | [[ADR-CSS|ADR-CSS.md]] |
| **`container-type: size`** | Deklariert auf dem `<din-a4>`-Blatt | Kapselt die physischen A4-Proportionen in einen isolierten Container, um proportionale Layoutberechnungen für Kind-Elemente freizuschalten. | [[ADR-CSS|ADR-CSS.md]] |
| **Container Query Units (`cqw` / `cqh`)** | Alle Margins, Paddings, Positionen & Schriftgrößen | 100% pixelperfektes Vektor-Skalieren! Wächst oder schrumpft das Papier durch Browser-Zoom, skaliert das gesamte DIN-Layout proportional mit. | [[ADR-CSS|ADR-CSS.md]], [[din-5008-geometry|din-5008-geometry.md]] |
| **`aspect-ratio: 210 / 297`** | Größenberechnung des `<din-a4>`-Blatts | Garantiert das mathematisch exakte Seitenverhältnis von DIN A4 auf jedem Bildschirm – vollkommen ohne JavaScript-Hilfen. | [[ADR-CSS|ADR-CSS.md]] |
| **`height: 94vh`** | Höhenlimitierung des Briefbogens | Verhindert, dass das Papier den vertikalen Viewport überschreitet, und passt sich stufenlos und passgenau der Bildschirmhöhe an. | [[ADR-CSS|ADR-CSS.md]] |
| **`overflow: hidden` on Body** | Absolute Viewport-Sperre | Verhindert Doppel-Scrollbalken und garantiert ein echtes, premium-artiges Applikationsgefühl im Full-Screen-Modus. | [[ADR-CSS|ADR-CSS.md]], [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] |
| **`@media print` Overrides** | Druck- und PDF-Erzeugung | Zwingt die Farben des Briefbogens beim Ausdrucken/Drucken in PDF bedingungslos auf einen reinweißen Hintergrund mit schwarzer Tinte (Druck-Souveränität). | [[ADR-CSS|ADR-CSS.md]], [[ADR-FEATURE|ADR-FEATURE.md]] |
| **CSS Anchor Positioning** | Schwebende Formatierungs-Toolbar (`#format-toolbar`) | Ermöglicht das vollkommen JS-freie, rein CSS-basierte Verankern der schwebenden Toolbar direkt an die Textselektion. | [[ADR-CSS|ADR-CSS.md]], [[ADR-FEATURE|ADR-FEATURE.md]] |

---

### 3. JavaScript (Logische Begleitschicht)

| Webtechnologie / API | Konkrete Verwendung | Rationale & Vorteile | Verweis |
| :--- | :--- | :--- | :--- |
| **`localStorage` API** | Persistentes Speichern von Entwürfen, API-Schlüsseln, Profilen und Schriften | **Die einzige persistente Speicher-API, die unter `file://` (lokaler Doppelklick) uneingeschränkt funktioniert.** OPFS, IndexedDB und File System Access APIs werden mangels HTTPS/Server-Kontext blockiert. | [[ADR-JS|ADR-JS.md]], [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] |
| **Selection & Range API** | Text-Formatierung (`#brieftext`) | Ermöglicht das präzise Einbetten von Zitat-Wrappern (`blockquote`) und die Handhabung von Textauswahlen ohne veraltete APIs (wie `execCommand`). | [[ADR-JS|ADR-JS.md]] |
| **`AbortController` API** | Abbruch laufender Fetch-Anfragen | Verhindert Race Conditions und unnötige API-Verzögerungen beim schnellen Tippen in den Suchfeldern, indem veraltete Requests abgebrochen werden. | [[ADR-API|ADR-API.md]] |
| **`fetch()` mit `Headers`** | Geoapify Premium Autocomplete Suchen | Übermittelt API-Schlüssel sicher im HTTP-Header (`X-Api-Key`) statt in der URL-Query. Verhindert Key-Leaks in Web-Proxys, DNS-Logs und Browser-Verläufen. | [[ADR-API|ADR-API.md]] |
| **`FileReader` API** | Offline WOFF2-Font-Uploader | Liest die hochgeladene Schriftdatei asynchron als Base64-Data-URL ein, um sie persistent in den LocalStorage zu sichern. | [[ADR-FEATURE|ADR-FEATURE.md]] |
| **Discrete Transitions & Simple JS Timer** | Popover Toast-Lebenszyklus | Nutzt native CSS Discrete Transitions (`transition-behavior: allow-discrete` und `@starting-style` in `floating.css`) und einen simplen 3.000ms JS-Timer (`setTimeout`) für symmetrisches Ein-/Ausblenden auf GPU-Ebene. | [[ADR-FEATURE|ADR-FEATURE.md]] |
| **W3C Temporal API** (`Temporal.Now.plainDateISO()`) | Automatische Befüllung des Datumsfeldes (`#datum`) | Native, vollständig offline-fähige und unveränderliche (immutable) Kalender- und Datumsarithmetik ohne CDN-Abhängigkeiten. Beseitigt legacy Date-Mängel. | [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]], [[ADR-JS|ADR-JS.md]] |
| **`Element.setHTML()`** (Sanitizer API) | XSS-sichere HTML-Eingaben | Sanitiert Rich-HTML-Zuweisungen im Browser nativ gegen Cross-Site-Scripting (XSS). | [[ADR-JS|ADR-JS.md]] |
| **CSS `contrast-color()`** | Barrierefreier Textkontrast | Automatische, browserseitige Kontrastberechnung für primäre Buttons und aktive Steuerelemente. | [[ADR-CSS|ADR-CSS.md]] |


---

## 🚫 Ausgeschlossene Technologien & Antipatterns

Um die kompromisslose Langlebigkeit und Offline-Fähigkeit zu sichern, wurden folgende, im Web oft gängigen Ansätze **explizit verboten**:
1.  **SPA-Frameworks (React, Vue) & CSS-Utility-Frameworks (TailwindCSS):** Verhindert Abhängigkeiten, Build-Komplexität (Vite/Webpack) und garantiert, dass die Anwendung auch in Jahrzehnten ohne Wartung nativ in jedem Browser läuft.
2.  **Externe CDNs (Google Fonts, CDNs):** Zerstört die Offline-Fähigkeit und verletzt die DSGVO (IP-Abfluss an Drittserver).
3.  **IndexedDB / OPFS / File System Access API:** Werfen im lokalen Kontext (`file:///index.html`) schwerwiegende Sicherheits-Exceptions. LocalStorage ist der einzig sichere Weg.
4.  **`document.execCommand`:** Veraltet (*deprecated*) und kurz vor der Entfernung aus modernen Engines. Wir nutzen stattdessen die zukunftssichere Selection & Range API.

---

## Konsequenzen
*   **Vorteile:**
    *   Maximale Zukunftssicherheit durch die ausschließliche Nutzung stabiler, nativer W3C-Standards.
    *   Hervorragende Performance (<18 KB JS, <10 KB CSS) ohne jeglichen Build-Overhead.
    *   100% offline-kompatibel und sofort lauffähig (Doppelklick-Start).
*   **Nachteile:**
    *   Erfordert fundiertes Wissen über native Web-APIs anstelle von vorgefertigten Framework-Abstraktionen.

---

## Verknüpfungen
*   Siehe [[longevity-guidelines|longevity-guidelines.md]] für die übergeordnete W3C-Verfassung zur Wartungsfreiheit.
