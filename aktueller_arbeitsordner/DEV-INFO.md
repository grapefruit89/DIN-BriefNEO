---
title: Entwicklerbereich & Feature-Prüfung
status: active
tags: [obsidian, core, dev-tools, feature-detection, chrome-baseline, diagnostics, easter-egg]
aliases: ["DEV-INFO"]
created: 2026-05-24
---

# 🛠️ DIN-BriefNEO — Entwicklerbereich & Feature-Prüfung

Dieses Dokument dient als zentrale Single Source of Truth (SSoT) für die Validierung moderner Webtechnologien im Kontext unserer **Chrome 147/148/149+ Baseline**. Es basiert auf der originalen `check_readiness.js` und wurde massiv erweitert, um **25 absolute Bleeding-Edge-Features** der modernen Web-Plattform systematisch zu erkennen. 

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
```css
/* Der Trigger als interaktives Element */
.version-badge {
  cursor: pointer;
  user-select: none;
  font-family: monospace;
}

/* Das Popover: Nutzt den nativen :popover-open Zustand */
.premium-dev-popover {
  border: 1px solid var(--border-color);
  background: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#111111, #eeeeee);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  padding: 24px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  margin: auto; /* Perfekt zentriert im Viewport */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Scrollbarer Tabellenbereich */
.table-scroll-container {
  flex: 1;
  overflow-y: auto;
  margin: 16px 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

/* Tabelle stylen */
.premium-dev-popover #diag-table {
  width: 100%;
  border-collapse: collapse;
  font-family: sans-serif;
  font-size: 0.9rem;
}

.premium-dev-popover #diag-table th, .premium-dev-popover #diag-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.premium-dev-popover #diag-table th {
  background: light-dark(#f4f4f4, #2d2d2d);
  font-weight: bold;
}
```

### ⚡ Die Logik (Ultra-schlanker, performanter JS-Code in `main.js`)
Das JavaScript führt die 25 Diagnosetests im Hintergrund aus, baut die Tabellenzeilen dynamisch auf und verwaltet den 3-Klick-Zustand des Ostereis:

```javascript
(function initDevEasterEgg() {
  const trigger = document.getElementById("dev-easter-egg");
  const popover = document.getElementById("dev-popover");
  
  if (!trigger || !popover) return;
  
  let clickCount = 0;
  let clickTimeout = null;
  
  trigger.addEventListener("click", () => {
    clickCount++;
    
    // Timeout zurücksetzen, um langsame Klicks nicht als Serie zu werten
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => { clickCount = 0; }, 1000);
    
    if (clickCount === 3) {
      clickCount = 0;
      clearTimeout(clickTimeout);
      
      // Live-Diagnose ausführen und Popover öffnen
      runLiveDiagnostics();
      popover.showPopover();
    }
  });
  
  function runLiveDiagnostics() {
    const f = (name, supported, baseline, rec) => ({ name, supported, baseline, rec });
    
    // Die Feature-Liste wird nun automatisch per Compiler (tools/build_healthcheck.js) 
    // aus den `javascript feature-check` Blöcken der ADRs und Guides generiert.
    // Siehe website/js/healthcheck.js für die aggregierte Liste.
    const features = [];
    if (typeof window.DIN_FEATURES !== 'undefined') {
      features.push(...window.DIN_FEATURES);
    }
    
    // Zeitstempel setzen
    document.getElementById("diag-timestamp").textContent = new Date().toLocaleTimeString();
    
    // Tabellen-Inhalt aufbauen
    const tbody = document.getElementById("diag-results");
    tbody.innerHTML = features.map(feat => {
      const statusIcon = feat.supported ? "🟢 READY" : "🔴 PENDING";
      const statusClass = feat.supported ? "ready" : "pending";
      return `
        <tr>
          <td><strong>${feat.name}</strong></td>
          <td class="status-cell ${statusClass}">${statusIcon}</td>
          <td><code>${feat.baseline}</code></td>
          <td><em>${feat.rec}</em></td>
        </tr>
      `;
    }).join("");
  }
})();
```

---

## 💻 Kopierbares All-In-One F12 Diagnose-Skript (25 Features)

Kopiere diesen erweiterten Block und füge ihn in deine Browser-Konsole ein, um das **vollständige 25-Feature-Ergebnis** direkt auszugeben:

```javascript
/**
 * 🛫 DIN-BriefNEO — High-Integrity Bleeding-Edge Report (v26.1)
 * ──────────────────────────────────────────────────────────────
 * Kopiere diesen Code und führe ihn in deiner F12-Konsole aus.
 */
(function checkBleedingEdgeReadiness() {
  const f = (name, supported, baseline, benefit) => ({ name, supported, baseline, benefit });

  const features = [
    f("Temporal API", typeof globalThis.Temporal !== "undefined", "Chrome 146", "Fehlerfreie Datumsarithmetik & Zeitzonen"),
    f("CSS @property (Typed OM)", typeof CSS !== "undefined" && CSS.supports && CSS.supports("--x: 1mm") && typeof window.CSSPropertyRule !== "undefined", "Chrome 146", "Typisierte Custom Properties für CSS-Transitionen"),
    f("CSS @scope (Isolation)", typeof CSSScopeRule !== "undefined", "Chrome 118", "Native Stil-Kapselung ohne Shadow-DOM-Kopfschmerz"),
    f("CSS if() Logic", typeof CSS !== "undefined" && CSS.supports && CSS.supports("top: if(style(--x: 1): 1px; else: 2px)"), "Chrome 148", "Deklarative logische Weichen direkt im Stylesheet"),
    f("Scroll-State Queries", typeof CSS !== "undefined" && CSS.supports && CSS.supports("container-type: scroll-state"), "Chrome 147", "Container Queries basierend auf dem Scroll-Zustand"),
    f("Native Invokers (commandfor)", "commandfor" in document.createElement("button"), "Chrome 147", "Natives Triggern von Popovers ohne JS-Eventlistener"),
    f("Advanced attr() Typisierung", typeof CSS !== "undefined" && CSS.supports && CSS.supports("width: attr(data-x type(<length>))"), "Chrome 133/149", "Attribute direkt als typisierte CSS-Werte einlesen"),
    f("View Transitions (Scoped)", typeof document.startViewTransition !== "undefined", "Chrome 146", "Flüssige, native Animationswechsel bei Seiten-Transitions"),
    f("CSS contrast-color()", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: contrast-color(white)"), "Chrome 147", "Browser-generierter barrierefreier Textkontrast"),
    f("CSS border-shape", typeof CSS !== "undefined" && CSS.supports && CSS.supports("border-shape: circle"), "Chrome 147", "Nicht-rechteckige Elementgrenzen rein über CSS"),
    f("Math.sumPrecise", typeof Math.sumPrecise !== "undefined", "Chrome 147", "Verlustfreie Gleitkomma-Summierung in JS"),
    f("Sanitizer API (Native)", typeof globalThis.Sanitizer !== "undefined", "Chrome 147", "Browser-nativer XSS-Schutz für dynamische HTML-Strings"),
    f("Element.setHTML()", typeof Element.prototype.setHTML !== "undefined", "Chrome 147", "Sicheres HTML-Einfügen über den nativen Sanitizer"),
    f("CSS calc-size(auto)", typeof CSS !== "undefined" && CSS.supports && CSS.supports("height: calc-size(auto, 100%)"), "Chrome 129", "Verlässliche CSS-Transitionen auf die Höhe 'auto'"),
    f("CSS Anchor Positioning", typeof CSS !== "undefined" && CSS.supports && CSS.supports("anchor-name: --foo"), "Chrome 125", "Natives Verankern von Popovers ohne JS-Berechnungen"),
    f("CSS field-sizing: content", typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing: content"), "Chrome 123", "Automatisch mitwachsende Textfelder ohne JS-Listener"),
    f("CSS light-dark()", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: light-dark(black, white)"), "Chrome 123", "Nativer Hell-/Dunkelmodus ohne JS-Klassenspielereien"),
    f("CSS Relative Color Syntax", typeof CSS !== "undefined" && CSS.supports && CSS.supports("color: oklch(from red l c h)"), "Chrome 119", "Farben relativ von Custom-Property-Basen berechnen"),
    f("CSS Scroll-driven Animations", typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: scroll()"), "Chrome 115", "Flüssige, rendering-effiziente Scroll-Animationen"),
    f("CSS Custom State Pseudo-Class", typeof CSS !== "undefined" && CSS.supports && CSS.supports("selector(:state(--foo))"), "Chrome 125", "Custom Elements direkt über native Pseudo-Klassen stylen"),
    f("Navigation API", typeof globalThis.navigation !== "undefined", "Chrome 102", "Ersetzt die fehleranfällige History API im Single-Page-Routing"),
    f("Speculation Rules API", typeof HTMLScriptElement !== "undefined" && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules"), "Chrome 109", "Nicht empfohlen (Verbraucht massive RAM/CPU-Ressourcen im Hintergrund)"),
    f("Array.prototype.toSorted", typeof Array.prototype.toSorted !== "undefined", "Chrome 110", "Mutationsfreie, kopierende Array-Sortierung in JS"),
    f("Object.groupBy()", typeof Object.groupBy !== "undefined", "Chrome 117", "Natives Gruppieren von Daten-Arrays ohne reduce-Kopfstände"),
    f("Promise.withResolvers()", typeof Promise.withResolvers !== "undefined", "Chrome 119", "Promise-Auflösungen von außerhalb der Instanziierung steuern")
  ];

  let timestamp = new Date().toISOString();
  try {
    if (typeof globalThis.Temporal !== "undefined") {
      timestamp = Temporal.Now.plainDateTimeISO().toString();
    }
  } catch (e) {}

  const header =
    `# 🛫 DIN-BriefNEO — Bleeding-Edge W3C Diagnostics\n` +
    `## Live-Diagnose: ${timestamp}\n\n` +
    `| Nr. | Feature / API | Status | Baseline | Architektur-Nutzen (Soll) |\n` +
    `| :--- | :--- | :--- | :--- | :--- |\n`;

  const rows = features
    .map((feat, i) => {
      const icon = feat.supported ? "✅ **READY**" : "⏳ *PENDING*";
      return `| ${(i+1).toString().padStart(2)} | ${feat.name.padEnd(30)} | ${icon.padEnd(12)} | ${feat.baseline.padEnd(14)} | ${feat.benefit} |`;
    })
    .join("\n");

  const footer = `\n\n---\n**Diagnose abgeschlossen.** Dein Chrome 148+ macht dich zum Web-Entwickler der Zukunft.`;

  console.clear();
  console.log(header + rows + footer);
})();
```

---

## 🔗 Verwandte Dokumente
*   ⚖️ **[[MASTER-DO-DONT-DEPRECATED|MASTER-DO-DONT-DEPRECATED.md]]:** Unser unumstößliches Gesetzbuch für technologische Verbote.
*   📚 **[[longevity-guidelines|longevity-guidelines.md]]:** Die W3C-Verfassung von DIN-BriefNEO.
*   🧭 **[[MODERNIZATION-GUIDE|MODERNIZATION-GUIDE.md]]:** Strategische Einschätzungen zu künftigen Technologiewechseln.
*   📄 **[[spec|spec.md]]:** System-Spezifikation für die Baseline-Features.
