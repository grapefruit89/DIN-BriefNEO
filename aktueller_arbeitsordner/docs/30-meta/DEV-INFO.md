---
aliases:
- DEV-INFO
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: dev-info
status: active
tags:
- obsidian
- core
- dev-tools
- feature-detection
- chrome-baseline
- diagnostics
- easter-egg
title: Entwicklerbereich & Feature-Prüfung
type: concept
updated: '2026-07-07'
---

# 🛠️ DIN-BriefNEO — Entwicklerbereich & Feature-Prüfung

Dieses Dokument dient als reines **Live-Diagnose-Tool** und Feature-Erkennungs-Matrix für die Validierung moderner Webtechnologien. Es ist keine Architektur-Vorgabe (diese finden sich in den ADRs) im Kontext unserer **Chrome 147/148/149+ Baseline**. Es basiert auf der originalen `check_readiness.js` und wurde massiv erweitert, um **25 absolute Bleeding-Edge-Features** der modernen Web-Plattform systematisch zu erkennen. 

Darüber hinaus spezifizieren wir hier das Konzept für ein **geheimes Easter-Egg-Entwickler-Overlay**, das später mit minimalem JavaScript-Einsatz direkt in das Frontend integriert werden kann.

---

## 🧐 Rationale & Zweck

Getreu **Säule 3 unserer [[longevity-guidelines|Longevity Guidelines]]** (W3C Living Standards & Native APIs) verzichtet dieses Projekt vollständig auf proprietäre Frameworks. Die Testergebnisse deines Chrome 148+ Browsers haben bewiesen, dass selbst hochinnovative Features wie die `Temporal API`, `CSS if() Logic` und native `Sanitizer` bereits vollständig einsatzbereit sind!

Indem wir ein umfassendes Spektrum an Bleeding-Edge-Features scannen, ermitteln wir exakt, welche modernsten W3C-APIs wir nutzen können, um JavaScript einzusparen und die Codebasis noch schlanker, wartungsfreier und robuster zu gestalten.

---

## 🕵️‍♂️ Das Feature-Prüfungs-Prinzip

Wir unterscheiden bei der Bewertung von Web-APIs drei klar definierte Zustände:

1. **Aktiviert (Produktiv):** Vollständig abwärtskompatible, stabile W3C-Standards, die in allen modernen Browsern (Chrome, Safari, Firefox) nativ implementiert sind.

2. **Future-Proof (Inaktiv):** Modernste W3C-Kandidaten, die bereits in Chromium-Engines bereitstehen, aber mangels breiter Cross-Browser-Stabilität oder aufgrund experimentellen Status noch nicht in den Produktiv-Code einfließen dürfen.

3. **Verboten (Antipattern):** Veraltete (*deprecated*) oder riskante APIs, die laut **[[MASTER-DO-DONT-DEPRECATED|MASTER-DO-DONT-DEPRECATED.md]]** strikt untersagt sind (z. B. `execCommand` oder OPFS/IndexedDB unter `file://`).

---

## 📊 Bleeding-Edge Feature-Prüfungs-Matrix (25 Features)

Die folgende Tabelle listet alle 25 Kernfeatures auf, die wir zur Validierung der Browser-Umgebung überprüfen:

| Nr. | Feature / API | Erkennungsmethode (CSS / JS) | Baseline-Plattform | Architektur-Nutzen | Longevity-Status & Empfehlung |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Temporal API** | `typeof globalThis.Temporal !== 'undefined'` | Chrome 146 / Stable | Behebt alle Designfehler des alten `Date`-Objekts. | ✅ **Aktiviert (Produktiv)**<br>Nativ in Chrome 148 im Einsatz. |
| 2 | **CSS @property** | `CSS.supports("--x: 1mm") && typeof window.CSSPropertyRule !== "undefined"` | Chrome 146 / Stable | Ermöglicht typisierte CSS-Variablen für flüssige Transitionen. | ✅ **Aktiviert (Produktiv)**<br>Unser Standard für registered Custom Properties. |
| 3 | **CSS @scope** | `typeof CSSScopeRule !== "undefined"` | Chrome 118 / Stable | Native Kapselung von CSS-Regeln ohne Shadow DOM. | ✅ **Aktiviert (Produktiv)**<br>Kapselt din-a4-Komponenten sauber ab. |
| 4 | **CSS if() Logic** | `CSS.supports("top: if(style(--x: 1): 1px; else: 2px)")` | Chrome 148 | Deklarative logische Weichen direkt im CSS ohne JS. | ⏳ **Future-Proof (Inaktiv)**<br>Revolutionär für Dynamic Styling. |
| 5 | **Scroll-State Queries** | `CSS.supports("container-type: scroll-state")` | Chrome 147 | Container-Abfragen basierend auf dem Scroll-Zustand. | ⏳ **Future-Proof (Inaktiv)**<br>Experimenteller Entwurf. |
| 6 | **Native Invokers** (`commandfor`) | `"commandfor" in document.createElement("button")` | Chrome 147 | Deklarative Trigger für Popovers und Dialoge ohne JS-Listener. | ⏳ **Future-Proof (Inaktiv)**<br>Im Entwurf. |
| 7 | **Advanced attr() Typisierung** | `CSS.supports("width: attr(data-x type(<length>))")` | Chrome 133 / 149 | Liest Daten-Attribute direkt als typisierte CSS-Einheiten ein. | ⏳ **Future-Proof (Inaktiv)**<br>Befindet sich in Standardisierung. |
| 8 | **View Transitions (Scoped)** | `typeof document.startViewTransition !== 'undefined'` | Chrome 146 / Stable | Flüssige, native Übergänge bei Zustands- und Seitenwechseln. | ✅ **Aktiviert (Produktiv)**<br>Steuert stufenlose Layout- und Theme-Wechsel. |
| 9 | **CSS contrast-color()** | `CSS.supports("color: contrast-color(white)")` | Chrome 147 | Automatische, barrierefreie Textkontraste direkt über den Browser. | ✅ **Aktiviert (Produktiv)**<br>Automatischer, barrierefreier Textkontrast. |
| 10 | **CSS border-shape** | `CSS.supports("border-shape: circle")` | Chrome 147 | Deklaratives Abrunden und Formen von Elementrahmen im CSS. | ⏳ **Future-Proof (Inaktiv)**<br>Experimenteller Entwurf. |
| 11 | **Math.sumPrecise** | `typeof Math.sumPrecise !== "undefined"` | Chrome 147 | Verlustfreie und präzise Fließkomma-Additionen direkt in JS. | ⏳ **Future-Proof (Inaktiv)**<br>Befindet sich im Standardisierungsprozess. |
| 12 | **Sanitizer API (Native)** | `typeof globalThis.Sanitizer !== "undefined"` | Chrome 147 | Browser-nativer Schutz vor Cross-Site-Scripting (XSS). | ⏳ **Future-Proof (Inaktiv)**<br>Warten auf Spezifikations-Stabilisierung. |
| 13 | **Element.setHTML()** | `typeof Element.prototype.setHTML !== "undefined"` | Chrome 147 | Sicheres Einfügen von HTML über integrierten Sanitizer. | ⏳ **Future-Proof (Inaktiv)**<br>`textContent` bleibt produktiver Standard. |
| 14 | **CSS calc-size(auto)** | `CSS.supports("height: calc-size(auto, 100%)")` | Chrome 129 / Stable | Ermöglicht mathematische Berechnungen und Transitionen auf `auto`. | ⏳ **Future-Proof (Inaktiv)**<br>Exzellent für flüssige Sidebar-Toggles. |
| 15 | **CSS Anchor Positioning** | `CSS.supports("anchor-name: --foo")` | Chrome 125 / Stable | Nativer Verankerungs-Mechanismus für Popovers ohne JS. | ✅ **Aktiviert (Produktiv)**<br>Positioniert Adress-Dropdown und Format-Toolbar. |
| 16 | **CSS field-sizing: content** | `CSS.supports("field-sizing: content")` | Chrome 123 / Stable | Auto-skalierende Textfelder ohne JS-Resize-Listener. | ✅ **Aktiviert (Produktiv)**<br>Perfekt für `#brieftext`. |
| 17 | **CSS light-dark()** | `CSS.supports("color: light-dark(black, white)")` | Chrome 123 / Stable | Native Theme-Zuweisungen im CSS ohne JS-Klassen-Toggles. | ✅ **Aktiviert (Produktiv)**<br>Unser Standard in `variables.css`. |
| 18 | **CSS Relative Color Syntax** | `CSS.supports("color: oklch(from red l c h)")` | Chrome 119 / Stable | Berechnet neue Farben relativ von einer Basis-Farbvariable. | ✅ **Aktiviert (Produktiv)**<br>Ermöglicht dynamische Farbvarianten im CSS. |
| 19 | **CSS Scroll-driven Animations** | `CSS.supports("animation-timeline: scroll()")` | Chrome 115 / Stable | Renderschleifenfreie Animationen gekoppelt an das Scrollen. | ⏳ **Future-Proof (Inaktiv)**<br>Kann für Premium-Effekte genutzt werden. |
| 20 | **CSS Custom State Pseudo-Class** | `CSS.supports("selector(:state(--foo))")` | Chrome 125 / Stable | Erlaubt das native Stylen von Custom Element States von außen. | ⏳ **Future-Proof (Inaktiv)**<br>Enorm mächtig für Web-Components. |
| 21 | **Navigation API** | `typeof globalThis.navigation !== "undefined"` | Chrome 102 / Stable | Moderne, ereignisgesteuerte Navigation ohne History-API-Schmerz. | ⏳ **Future-Proof (Inaktiv)**<br>Zukunftssicheres Routing. |
| 22 | **Speculation Rules API** | `HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")` | Chrome 109 / Stable | Deklaratives Prerendering und Prefetching von Folgeseiten. | ❌ **Nicht empfohlen (Ressourcen-Fresser)**<br>Prerendering frisst 50-150MB RAM im Hintergrund. Für unseren Autocomplete-Dienst nutzen wir stattdessen schlankes, W3C-natives **ESM Lazy Loading (`import()`)**! |
| 23 | **Array toSorted / toReversed / with** | `typeof Array.prototype.toSorted !== "undefined"` | Chrome 110 / Stable | Kopierende, nicht-destruktive Array-Operationen direkt in JS. | ✅ **Aktiviert (Produktiv)**<br>Schützt Daten-Arrays vor unbeabsichtigter Mutation. |
| 24 | **Object.groupBy()** | `typeof Object.groupBy !== "undefined"` | Chrome 117 / Stable | Nativer Gruppierungs-Mechanismus für Daten-Arrays. | ✅ **Aktiviert (Produktiv)**<br>Ersetzt komplexe `reduce()`-Schleifen. |
| 25 | **Promise.withResolvers()** | `typeof Promise.withResolvers !== "undefined"` | Chrome 119 / Stable | Vereinfachte Zuweisung von Resolve/Reject außerhalb des Promise. | ✅ **Aktiviert (Produktiv)**<br>Macht asynchrone Event-Kopplungen extrem elegant. |

---

## 🏛️ Konzept: Geheimer Easter-Egg Entwickler-Bereich

Um diese detaillierten Infos direkt in deiner Web-App abrufbar zu machen, implementieren wir ein **Easter-Egg-Konzept**, das die Einhaltung unserer W3C-Verfassung perfekt wahrt: Es nutzt die native **HTML5 Popover API** zur Darstellung des Overlays, wodurch wir komplexe UI-Modul-Bibliotheken einsparen und mit minimalem JavaScript-Kleber auskommen.

### 📐 Das HTML-Markup (In der Sidebar oder im Fußbereich)

Der Text der Versionsnummer im Fußbereich dient als Klick-Trigger. Das Popover-Element selbst liegt unauffällig am Ende des HTML-Bodys:

```html
<!-- Klick-Trigger im Footer -->
<div class="footer-version">
  <span>DIN-BriefNEO</span>
  <!-- Das ID-Attribut für die JS-Kopplung -->
  <span id="dev-easter-egg" class="version-badge" title="3x schnell klicken für Systemdiagnose">v26.0</span>
</div>

<!-- Das native Popover-Overlay -->
<div id="dev-popover" popover="manual" class="premium-dev-popover">
  <div class="popover-header">
    <h3>🛫 System-Diagnose & W3C-Ready Report</h3>
    <button popovertarget="dev-popover" popovertargetaction="hide" class="close-btn">&times;</button>
  </div>
  <div class="popover-body">
    <p class="diagnostic-meta">
      <strong>Zielplattform:</strong> Chrome 147+ Baseline | 
      <strong>Echtzeit-Status:</strong> <span id="diag-timestamp"></span>
    </p>
    <div class="table-scroll-container">
      <table id="diag-table">
        <thead>
          <tr>
            <th>Feature / API</th>
            <th>Status</th>
            <th>Baseline</th>
            <th>Empfehlung</th>
          </tr>
        </thead>
        <tbody id="diag-results">
          <!-- Wird dynamisch befüllt -->
        </tbody>
      </table>
    </div>
    <div class="popover-footer">
      <span>Entwicklungs-Status: <code>Produktiv aktiv</code></span>
      <button onclick="console.clear(); console.log('Konsole zurückgesetzt.');" class="action-btn">Konsole leeren</button>
    </div>
  </div>
</div>
```

### 🎨 Das Styling (Strikte CSS-Kapselung in `floating.css`)

### ⚡ Die Logik (Ultra-schlanker, performanter JS-Code in `main.js`)

Das JavaScript führt die 25 Diagnosetests im Hintergrund aus, baut die Tabellenzeilen dynamisch auf und verwaltet den 3-Klick-Zustand des Ostereis:

---

## 💻 Kopierbares All-In-One F12 Diagnose-Skript (25 Features)

Kopiere diesen erweiterten Block und füge ihn in deine Browser-Konsole ein, um das **vollständige 25-Feature-Ergebnis** direkt auszugeben:

---

## 🔗 Verwandte Dokumente

*   ⚖️ **[[MASTER-DO-DONT-DEPRECATED|MASTER-DO-DONT-DEPRECATED.md]]:** Unser unumstößliches Gesetzbuch für technologische Verbote.

*   📚 **[[longevity-guidelines|longevity-guidelines.md]]:** Die W3C-Verfassung von DIN-BriefNEO.

*   🧭 **[[MODERNIZATION-GUIDE|MODERNIZATION-GUIDE.md]]:** Strategische Einschätzungen zu künftigen Technologiewechseln.

*   📄 **[[spec|spec.md]]:** System-Spezifikation für die Baseline-Features.