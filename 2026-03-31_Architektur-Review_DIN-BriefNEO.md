# Architektur-Review: DIN-BriefNEO

**Reviewer:** Claude Sonnet 4.6 (Anthropic)
**Datum:** 2026-03-31
**Projekt-Version:** v4.7 Platinum
**Analysierte Artefakte:** `index.html`, `app.js`, `engine.js`, `ui.js`, `logic.js`, `salutation.js`, `style.css`, `01_Architecture_Compliance.md`, `05_Feature_Matrix.md`, `.brain/CONSTITUTION.md`, `.brain/ANTI_PATTERN.md`

---

## 📊 Executive Summary

DIN-BriefNEO ist ein architektonisch ambitioniertes, weitgehend kohärentes Projekt mit klar durchdachten Prinzipien. Die „Pure & Flat"-Doktrin (ADR-017) wird im CSS nahezu vollständig umgesetzt – der `@layer`-Stack, die `oklch()`-Farbsemantik und die Zero-JS-UI-Mechanismen über `:has()` sind handwerklich stark. Die größte Stärke liegt in der konsequenten Anwendung von Chrome 147+ APIs ohne Polyfill-Ballast. Die größte Schwäche ist eine systematische **Verletzung der eigenen Architekturprinzipien im JavaScript-Layer**: ANTI_PATTERN DEP-UI01 (imperatives DOM) und DEP-C004 (setTimeout für UI) werden in `ui.js` aktiv gebrochen, das Profil wird außerhalb des StateManagers in `localStorage` persistiert und `innerHTML` wird im Markdown-Mirror ohne Sanitizer API genutzt. Empfehlung: **Nachbesserungen im Sprint 1 vor nächstem Feature-Work**; kein Major-Refactoring notwendig, aber drei kritische Regressionspunkte müssen geschlossen werden.

---

## ✅ Stärken (What Works Well)

### CSS-Architektur
- **`@layer`-Stack** ist strukturell makellos: `latex.base → ui.theme → din.structure → ui.floating → ui.components → project.overrides → core.immutable` liefert korrekte Kaskadenpriorität ohne Spezifitätskämpfe.
- **`@scope (#paper)`** isoliert DIN-Geometrie sauber und ersetzt Shadow-DOM ohne dessen Nachteile. Exzellente Umsetzung.
- **Variablen-Architektur** mit `@property` für `--din-y-header-start` und vollständig abgeleiteten Folge-Variablen (`calc(var(--din-y-abschnitt) + 58.4mm)`) ist Single-Source-of-Truth korrekt umgesetzt.
- **Form A/B Zero-JS Switch** via `:root:has(#state-layout-a:checked)` ist die sauberste denkbare Implementierung für diesen Use Case.
- **`@container scroll-state(scrollable: block)`** für den Overflow-Alarm (Chrome 147+ exklusiv) ist ein echtes Showcase-Feature, konsequent und korrekt eingesetzt.
- **Print-Layer** mit `@page`, `@counter-style din-pages` und korrektem `@page :first { content: none }` ist vollständig und normkonform.
- **`light-dark()` + `oklch()`** Theming ist ausgewogen, wahrnehmungsgetreu und wartbar.

### JavaScript-Core
- **`StateManager`** ist schlank und korrekt: pub/sub, dot-notation update, kein Framework-Ballast.
- **OPFS → localStorage Fallback** in `engine.js` ist nach ANTI_PATTERN DEP-P001 (PARTIALLY RELAXED) konform und robust durch try/catch abgesichert.
- **`Capabilities`-Objekt** (frozen, logiert Modus) ist elegante Selbstdokumentation zur Laufzeit.
- **`parseMarkdown()`** mit dem Ghosting-Pattern (`.md-marker { width:0; overflow:hidden }`) ist kreativ und funktioniert ohne WYSIWYG-Framework.
- **`SalutationEngine`** deckt alle relevanten Formalitätsstufen ab, Titel-Extraktion mit Regex ist solide, `validateClosing()` ist DIN-konform.
- **Temporal API** wird in `todayISO()` und `formatDate()` konsequent genutzt, kein `new Date()` in Sicht.
- **IBAN-Validierung** via `BigInt` + Modulo-97 ist korrekt und performant.

### HTML & IMR
- **`contenteditable="plaintext-only"`** ist in allen editierbaren Feldern gesetzt – lückenlos.
- **IMR in `logic.js`** (`Object.freeze([...])`) ist SSoT für Tag↔Key-Mapping, unveränderlich und zentral.
- **Placeholder-Pattern** via CSS Custom Property `--p` (inline `style="--p: &quot;Vorname&quot;"`) ist eine elegante Lösung, die das HTML minimal hält.
- **`<dialog>`-basiertes Modal-System** ist nativer Best Practice, kein JS-Modal-Framework nötig.

### Dokumentation
- **Nummeriertes Dokument-System** mit YAML-Frontmatter ist für Obsidian Dataview und GitHub Pages doppelt verwendbar.
- **`.brain/`-Verzeichnis** mit `CONSTITUTION.md` und `ANTI_PATTERN.md` als architektonische Leitdokumente ist eine starke Governance-Struktur.
- **Compliance-Matrix** in `01_Architecture_Compliance.md` mit Status-Ampel (✅/🟡/📋) ist gut lesbar und aktuell.

---

## ⚠️ Schwächen & Risiken

### 🔴 Kritisch

**SW-01: `innerHTML` im Markdown-Mirror ohne Sanitizer API**
In `ui.js` (`_syncAll()`) und beim `input`-Event auf `din-text` wird `mirror.innerHTML = Logic.parseMarkdown(text)` gesetzt. Die Compliance-Matrix deklariert `Sanitizer API` als ✅ Aktiv. Im Code ist sie nicht implementiert. Da `parseMarkdown()` den Input mit HTML-Entity-Escaping (`&amp;`, `&lt;`, `&gt;`) vorverarbeitet, ist das Risiko gering, aber die Architektur-Compliance ist verletzt. Ein gezielt konstruiertes Emoji oder ein ZWSP kann den Escape umgehen.

**SW-02: Profil-Persistenz außerhalb des StateManagers**
In `_initModals()` (`ui.js`) wird das Profil mit `localStorage.setItem("din_profile", JSON.stringify(data))` gespeichert und beim Reset (`localStorage.clear()`) mit gelöscht – aber nicht über `StateManager.update()` geführt. Das verletzt die SSoT-Doktrin aus `CONSTITUTION.md §III`. Es existieren damit zwei parallele Daten-Stores ohne Synchronisierung: der StateManager-State und `din_profile`.

**SW-03: `innerHTML` für IBAN-Ghost ohne Escaping**
In `_initModals()` wird `ibanGhost.innerHTML = \`<span class="invisible">${invisiblePart}</span>${visiblePart}\`` gesetzt, wobei `invisiblePart = formatted` direkt aus dem IBAN-Input kommt. Obwohl IBAN-Zeichen alphanumerisch sind, ist das Muster unsicher: Es fehlt jegliches Escaping. Ein Nutzer kann `<img src=x onerror=alert(1)>` eingeben, wenn `maxlength="34"` clientseitig umgangen wird.

**SW-04: ANTI_PATTERN DEP-UI01 aktiv verletzt**
`_initModals()` setzt `profileBtn.onclick = ...` imperativ, `btn-confirm-ok` nutzt direkte Event-Listener für DOM-Manipulation. Das ANTI_PATTERN-Register verbietet imperatives DOM-Toggling. Auch in `index.html` gibt es noch `onclick="document.getElementById('profile-dialog').showModal()"` als Inline-Handler – ein weiterer Verstoß.

**SW-05: ANTI_PATTERN DEP-C004 verletzt (setTimeout für UI-Feedback)**
`Toast.show()` nutzt `setTimeout(() => el.hidePopover(), 3000)` für UI-Dismissal. Das Regelwerk erlaubt setTimeout nur für Debouncing/Storage-Sync. Für timed UI state wäre eine CSS-Animation mit `animation-fill-mode: forwards` oder `@keyframes` + `animationend`-Listener die konforme Lösung.

**SW-06: `_onStateChange()` ruft `_syncAll()` bei jedem State-Update**
Jede einzelne Tastatureingabe triggert `_syncAll()`, was über alle IMR-Einträge iteriert und alle nicht-fokussierten Felder setzt. Bei 45+ IMR-Einträgen sind das ~44 querySelector-Aufrufe + DOM-Schreiboperationen pro Keystroke. Das ist kein Problem bei aktuellem Umfang, wird aber zum Bottleneck sobald Brief-Archiv und Serienbrief hinzukommen.

### 🟡 Mittel

**SW-07: `AddressService` in `ui.js` macht direkten `fetch()`-Aufruf**
Die Photon-API-Anbindung (`fetch("https://photon.komoot.io/...")`) ist ohne Error-Handling für Network-Fails implementiert. Timeout fehlt, kein `AbortController`, kein Feedback an den User. Das Resultat wird nur auf `console.log` geschrieben – die Funktion ist faktisch Dead Code in Production.

**SW-08: Salutation Engine-Trigger hat kein Fallback für fehlende Radio-Inputs**
`_updateSalutation()` liest `document.querySelector('input[name="recipientType"]:checked')` – diese Radio-Inputs existieren **nicht** in der aktuellen `index.html`! Die Sidebar enthält nur Form A/B, Theme und Guides. Der `type`-Parameter fällt immer auf `"none"` zurück, was bei Vor- und Nachname immer `"Sehr geehrte Damen und Herren,"` ergibt, auch wenn ein Name eingetragen ist. Das ist ein funktionaler Bug.

**SW-09: Profile-Dialog lädt gespeichertes Profil nicht zurück**
Beim Öffnen des `profile-dialog` werden die Felder nicht mit dem gespeicherten `din_profile` aus localStorage befüllt. Nutzer sehen nach dem ersten Speichern immer leere Felder.

**SW-10: `_syncAll()` überschreibt `din-anrede` und `din-grussformel` mit leerem String**
Der IMR enthält Einträge für `din-anrede` (key: `"anrede"`) und `din-grussformel` (key: `"grussformel"`). `_syncAll()` setzt `el.textContent = this.sm.state.content[entry.key] || ""`. Da die Engine diese Werte via `setAttribute("data-salutation", ...)` setzt (nicht via `sm.update`-Pfad für `textContent`), kann ein State-Reload die Ghost-Werte überschreiben und das Feld leer erscheinen lassen.

**SW-11: Faltmarken-Position abhängig von `--din-y-abschnitt`**
`--din-y-fold-1: calc(var(--din-y-abschnitt) + 60mm)` und `--din-y-fold-2: calc(var(--din-y-abschnitt) + 165mm)`. DIN 5008 definiert Faltmarken als **absolute Positionen vom Blattoberkante**, nicht relativ zum Anschriftfeld. Bei Form A (27mm): Fold-1 = 87mm, Fold-2 = 192mm. DIN 5008 schreibt: erste Faltmarke bei 87mm, zweite bei 192mm von Oberkante. Für Form A stimmt das zufällig. Bei Form B (45mm): Fold-1 = 105mm, Fold-2 = 210mm. DIN 5008 schreibt für Form B: erste Faltmarke bei 105mm, zweite bei 210mm. Auch das stimmt. Die Formel ist also korrekt, aber konzeptionell irreführend – die Faltmarken-Position ist keine Funktion des Anschriftfelds, sondern des Formats.

**SW-12: `--c-text-muted` und `--c-danger` werden im CSS referenziert, aber nie definiert**
`din-fuss { color: var(--c-text-muted) }`, `[aria-invalid="true"] { text-decoration: underline wavy var(--c-danger) }` und `#toast-v4.type-success { border-left: 4px solid var(--c-success) }` referenzieren Custom Properties, die in `:root` nicht definiert sind. Die Werte fallen auf `unset` zurück. Das ist ein stiller Darstellungsfehler.

### 🟢 Niedrig

**SW-13: `@font-feature-values` für "Inter" / "Aptos"**
`@font-feature-values` ist eine Level-4-CSS-Fonts-Spezifikation. Chrome 147 unterstützt sie, aber die Werte (`tabular-nums: 1`, `slashed-zero: 2`) sind Slot-Definitionen für `@styleset`-Werte, die dann via `font-variant-alternates: styleset(tabular-nums)` aktiviert werden müssen. Im Code wird stattdessen direkt `font-feature-settings: "tnum" on, "zero" on` genutzt – korrekt, aber `@font-feature-values` bleibt damit toter Code.

**SW-14: `manifest.json` nicht geladen**
`index.html` lädt keine `<link rel="manifest">`. Die PWA-Standalone-Fähigkeit (Feature-Matrix: ✅ Aktiv) ist damit nicht aktiviert, obwohl `sw.js` und `manifest.json` existieren. Auch `sw.js` wird nirgendsregistriert.

**SW-15: DevMode-Toggle via `location.reload()`**
`document.getElementById("app-version")?.addEventListener("click", () => { ... location.reload() })` ist ein harter Reload für einen Debug-Toggle. Das löscht ungespeicherten State. Für ein Dev-Tool ist das akzeptabel, aber es sollte dokumentiert sein.

**SW-16: `iban-ghost` Template-String ist für DE-IBAN hardcodiert**
`const ghostTemplate = "DE00 0000 0000 0000 0000 0000 0000"` hat 35 Zeichen, aber `maxlength="34"` ist auf dem Input. Deutsche IBANs sind 22 Zeichen. Internationale IBANs bis 34 Zeichen. Der Ghost überdehnt sich bei kurzen IBANs.

---

## 🚀 Verbesserungsvorschläge (Priorisiert)

### 🔴 Hochpriorität (Sprint 1)

- [ ] **Problem:** SW-01 + SW-03 – `innerHTML` ohne Sanitizer
  **Lösung:** `mirror.setHTML(Logic.parseMarkdown(text))` statt `innerHTML`. Für den IBAN-Ghost: `ibanGhost.innerHTML` durch separates DOM-Building mit `document.createElement()` + `textContent` ersetzen, da kein komplexes Markup nötig.
  **Impact:** Security-Compliance wiederhergestellt, Konformität mit eigenem Architektur-Dokument.

- [ ] **Problem:** SW-08 – Salutation Engine hat keinen Input für Empfänger-Typ
  **Lösung:** Radio-Gruppe für `recipientType` (weiblich/männlich/neutral) und `formality` (formal/polite/casual) in die Sidebar aufnehmen. Zwei `<input type="radio">` Gruppen mit hidden inputs nach dem Schema der bestehenden Layout/Theme-Switcher.
  **Impact:** Kernfunktion der Salutation Engine ist derzeit funktional dead – höchste UX-Priorität.

- [ ] **Problem:** SW-12 – Undefinierte CSS Custom Properties
  **Lösung:** In `:root` ergänzen: `--c-text-muted: oklch(55% 0.03 250)`, `--c-danger: oklch(55% 0.2 30)`, `--c-success: oklch(60% 0.2 145)`.
  **Impact:** Silent rendering failures behoben, Fußzeile und Validation-Tooltips korrekt dargestellt.

- [ ] **Problem:** SW-02 – Profil-Store außerhalb StateManager
  **Lösung:** Profil in `StateManager` unter `state.profile.*` führen. `Storage.save()` und `Storage.load()` verarbeiten damit das Profil automatisch. `din_profile` als Legacy-Key beim ersten Load migrieren und löschen.
  **Impact:** SSoT wiederhergestellt, Reset funktioniert atomar.

- [ ] **Problem:** SW-09 – Profil-Dialog lädt nicht zurück
  **Lösung:** Im `showModal()`-Trigger die gespeicherten Profilwerte aus `sm.state.profile` in die Input-Felder schreiben. Nach der Profil-Store-Migration (SW-02) ergibt sich das von selbst.
  **Impact:** Grundlegende UX-Erwartung erfüllt.

- [ ] **Problem:** SW-14 – PWA nicht aktiviert trotz Feature-Claim
  **Lösung:** In `index.html` `<link rel="manifest" href="manifest.json">` ergänzen. Service Worker in `app.js` registrieren: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js')`.
  **Impact:** Feature-Matrix-Claim korrekt; Offline-Fähigkeit aktiviert.

### 🟡 Mittelpriorität (Sprint 2)

- [ ] **Problem:** SW-06 – `_syncAll()` bei jedem Keystroke
  **Lösung:** `_syncAll()` nur bei State-Changes im `config.*`-Namespace triggern. Für `content.*`-Pfade nur den betroffenen Tag aktualisieren: `_syncField(path)` statt Komplett-Iteration.
  **Impact:** Performance-Grundlage für Brief-Archiv und Serienbrief gelegt.

- [ ] **Problem:** SW-04 – Imperatives DOM (ANTI_PATTERN DEP-UI01)
  **Lösung:** Inline-`onclick` aus `index.html` entfernen, alle Button-Handler zentralisiert in `UIController._initModals()`. `profileBtn.onclick` durch `addEventListener` ersetzen.
  **Impact:** Code-Hygiene, leichteres Testen, Konformität mit eigenem Rulebook.

- [ ] **Problem:** SW-05 – `setTimeout` für Toast-Dismissal (ANTI_PATTERN DEP-C004)
  **Lösung:** Toast über CSS `animation-duration: 3s; animation-fill-mode: forwards` auto-dismissen. `animationend`-Event zum `hidePopover()` nutzen.
  **Impact:** Anti-Pattern aus eigenem Register eliminiert.

- [ ] **Problem:** SW-07 – AddressService ist Dead Code
  **Lösung:** Entweder vollständig implementieren (mit `AbortController`, Error-State, UI-Dropdown) oder aus `ui.js` entfernen und als `#42` offen lassen. Dead Code ist gefährlicher als kein Code.
  **Impact:** Keine stummen Netzwerkfehler in der Console; klares Feature-Flag.

- [ ] **Problem:** SW-10 – `_syncAll()` löscht Ghost-Salutation
  **Lösung:** IMR-Einträge für `din-anrede` und `din-grussformel` mit `{ ..., ghost: true }` markieren. In `_syncAll()` für ghost-Einträge `textContent` nur setzen, wenn `sm.state.content[key]` einen echten Nutzer-Wert enthält (nicht den Engine-generierten).
  **Impact:** Salutation Engine und State-Sync arbeiten ohne Konflikt.

### 🟢 Niedrigpriorität (Backlog)

- [ ] **Problem:** SW-13 – `@font-feature-values` ist toter Code
  **Lösung:** Entweder entfernen oder vollständig auf `font-variant-alternates: styleset(tabular-nums, slashed-zero)` umstellen.
  **Impact:** CSS-Hygiene.

- [ ] **Problem:** SW-16 – IBAN-Ghost Template-Mismatch
  **Lösung:** Template dynamisch an die erkannte IBAN-Länderkennung anpassen (DE = 22 Zeichen, AT = 20, CH = 21 etc.). Fallback: maximale Länge 34.
  **Impact:** Korrekte visuelle Eingabehilfe für nicht-deutsche IBANs.

- [ ] **Problem:** SW-15 – DevMode-Reload löscht State
  **Lösung:** Dev-Panel-Toggle via `document.body.classList.toggle('dev-mode')` + CSS ohne Reload. State bleibt erhalten.
  **Impact:** Bessere DX beim Debugging.

- [ ] **Problem:** Fehlender Entwickler-Setup-Guide
  **Lösung:** `CONTRIBUTING.md` mit lokalem Server-Setup (kein `file://` für OPFS!), Linting (`stylelintrc.json`), Commit-Konventionen.
  **Impact:** Onboarding für neue Contributor oder zukünftigen Mo-nach-3-Monaten-Pause.

---

## 🧠 Architektur-Entscheidungen (Review)

**ADR-017 / Pure & Flat:** Im CSS vollständig umgesetzt. Im JS teilweise verletzt (SW-02, SW-04, SW-05, SW-08). Die Grundidee – flache Hierarchie, keine Abstraktionsebenen für einfache Probleme – ist solide und bleibt der richtige Ansatz für diesen Scope.

**Zero-JS-UI-Doktrin:** Für Layout, Theme, Guides und Faltmarken konsequent implementiert. Lobenswert. Der Widerspruch: Für Salutation-Typ und Formalität gibt es keine CSS-steuerbaren Inputs in der Sidebar – das ist die einzige Stelle, wo die Doktrin hätte angewendet werden müssen, aber nicht wurde.

**Chrome-147-Baseline:** Wird ohne Polyfills konsequent genutzt. `@container scroll-state`, `@position-try`, `@starting-style`, Popover API – alles zeitgemäß. Die Entscheidung, keine `@supports`-Guards zu setzen, ist für ein Einzel-Browser-Produkt korrekt und reduziert Code-Ballast. Für 2026/2027 bleibt die Baseline zukunftssicher: Alle genutzten APIs sind Blink-stabil und werden nicht deprecated.

**Plaintext-Only contenteditable:** Lückenlos umgesetzt in allen editierbaren Feldern. Die Kombination mit Ghost-Mirror für `din-text` ist die technisch beste Lösung für WYSIWYG ohne Framework.

**`@scope`-Strategie:** In `style.css` via `@scope (#paper)` für DIN-Geometrie bereits aktiv. In `01_Architecture_Compliance.md` steht `@scope` noch als 🟡 Geplant. Dokument ist veraltet – bitte aktualisieren.

---

## 📋 Offene Fragen & Unklarheiten

1. **Welche Daten lädt das Profil-Formular beim Öffnen?** – Aktuell: nichts (SW-09). Klärt zugleich SW-02 (Store-Konsolidierung).

2. **Ist `recipientType` / `formality` absichtlich aus der Sidebar entfernt?** – Die Salutation Engine wartet darauf; ohne diese Inputs ist die Engine kalt. Bewusste Entscheidung oder vergessenes Feature?

3. **Wie wird der Service Worker aktuell auf Änderungen eingespielt?** – `sw.js` ist nicht referenziert; ohne Cache-Busting-Strategie sind zukünftige Deployments problematisch.

4. **Ist `din-branding-logo` bereits an eine Upload-Logik angebunden?** – IMR enthält den Key `logo`, aber weder HTML noch JS zeigen Implementierung.

5. **Warum ist `--din-y-header-start` via `@property` registriert, aber im Code nicht verwendet?** – Es gibt nur `--din-y-abschnitt` als aktive Variable. Ist `--din-y-header-start` ein veraltetes Artefakt?

6. **Was genau tut `Flight Recorder` (Feature-Matrix: ✅ Aktiv, Issue #59)?** – Im Code ist kein Telemetrie-System erkennbar. Ist das ein anderer Codepfad oder ist der Feature-Status falsch?

---

## 🎯 Fazit & Nächste Schritte

**Gesamturteil: Nachbesserungen nötig – Sprint 1 vor Feature-Arbeit.**

Das Fundament ist stark. Die CSS-Architektur ist production-ready. Der StateManager ist sauber. Die Salutation Engine ist korrekt. Aber drei Bereiche blockieren einen sauberen Release:

1. **Security:** `innerHTML` ohne Sanitizer (SW-01, SW-03) muss vor Produktiv-Einsatz geschlossen werden.
2. **Funktionalität:** Die Salutation Engine ist ohne Sidebar-Inputs faktisch deaktiviert (SW-08). Das ist der sichtbarste Bug für jeden Nutzer.
3. **Datenkonsistenz:** Zwei parallele Stores (StateManager vs. `localStorage["din_profile"]`) sind eine Zeitbombe für den geplanten Brief-Archiv-Feature (SW-02).

Empfohlene Sprint-1-Reihenfolge: SW-12 (3 Minuten, definiere fehlende CSS-Vars) → SW-01/SW-03 (Sanitizer, 30 Minuten) → SW-08 (Sidebar-Inputs, 1 Stunde) → SW-02/SW-09 (Store-Konsolidierung, 2 Stunden) → SW-14 (PWA-Aktivierung, 15 Minuten).

Nach Sprint 1 ist das Projekt **Release Candidate** für den aktuellen Feature-Scope.

---

*Review-Dokument erzeugt durch statische Code-Analyse. Laufzeit-Verhalten (z.B. tatsächliches `@container scroll-state`-Triggering, OPFS-Verfügbarkeit) wurde nicht getestet.*
