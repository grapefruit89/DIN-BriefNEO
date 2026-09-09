---
id: web-standards-tracking
title: 'Web Standards Tracking & Testing'
type: guide
status: active
created: '2026-07-21'
updated: '2026-09-09'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/guide
  - tech/w3c
  - tech/chrome
doc_links:
  - Architecture-Evolution
  - constitution
code_links:
  - tools/build_db.js
error_patterns:
  - web standards tracking
  - w3c
  - chrome status
  - chromestatus
  - browser features
  - fitness gate
  - proof of concept
supersedes: []
depends_on: []
---

# Web Standards Tracking & Testing

Dieses Dokument dient als zentrales Nachschlagewerk (Sammelbecken) für unsere Recherchen zu neuen W3C-Standards und Chrome-Features. Da DIN-Brief Neo auf einer "Vanilla Web Standards" Architektur aufbaut, ist es entscheidend, die neuesten Browser-APIs frühzeitig zu erkennen und zu nutzen, um JavaScript-Workarounds zu eliminieren.

## 1. Informationsquellen (W3C & Google)

Um zu wissen, was das W3C plant und was Google bereits umsetzt, greifen wir auf folgende primäre Quellen zurück:

* **W3C News Feed (`https://www.w3.org/news/feed/`)**
  * Liefert die offiziellen Status-Updates zu Standards (z.B. von *First Public Working Draft* bis zur *W3C Recommendation*).
* **GitHub: `w3c/browser-specs` & `w3c/webref`**
  * Maschinenlesbare, tagesaktuelle JSON-Listen aller existierenden Spezifikationen und Web-APIs.
* **Chrome Status (`chromestatus.com`)**
  * Die wichtigste Seite, um zu sehen, *wann* Google einen W3C-Standard in Chrome einbaut. Hier steht exakt, ob ein Feature in Chrome 149, 150 oder 151 kommt.
* **Chrome Release Notes (`https://developer.chrome.com/release-notes/<VERSION>`)**
  * Offizielle Release Notes pro Chrome-Version (z.B. `https://developer.chrome.com/release-notes/151`), Index unter `https://developer.chrome.com/release-notes`. Ergänzt Chrome Status um Detail-Beschreibungen und Deprecation-Hinweise; als aktuellste Referenz-URL im Projekt wurde Release Notes 151 gespeichert (Stand 2026-09-09; 152/153 existieren bereits als Beta/Preview).
* **Context7 (MCP Server)**
  * Wir nutzen den Context7 KI-Agenten, um tagesaktuelle Dokumentationen (wie MDN Web Docs oder Chrome Developers) direkt in unseren Projekt-Kontext zu laden.

## 2. Wie testen wir neue Features? (Proof-of-Concepts)

Bevor wir ein Feature in den `main` Branch des DIN-Briefs mergen, durchläuft es diesen Test-Prozess:

1. **Feature Detection & Flags:**
   * Wir prüfen auf `chromestatus.com`, ob das Feature bereits hinter einem Flag versteckt ist.
   * Falls ja, aktivieren wir es lokal in `chrome://flags` oder über unser `Chrome Pro (Dev)` Shortcut.
2. **Isolierte PoCs (Proof of Concepts):**
   * Neue APIs werden **niemals** direkt im komplexen `din-a4` DOM getestet.
   * Wir erstellen isolierte Test-Dateien (z.B. `scratch/test-focusgroup.html`), um das isolierte Verhalten des Browsers ohne CSS-Interferenzen zu verstehen.
3. **Fitness Gate (`.\scripts\start.ps1`):**
   * Erst wenn der PoC erfolgreich war, wird das Feature in `layout.css` oder `main.js` integriert. Danach muss das Fitness Gate zwingend 100% Score anzeigen, um sicherzustellen, dass keine verbotenen Polyfills oder Frameworks eingeschmuggelt wurden.

## 3. Aktuelle Beobachtungen (Stand: Juli 2026)

### WebAuthn Level 3 (Passkeys)
Obwohl Passkeys bereits genutzt werden, formalisiert "Level 3" diese Technologie endgültig als globalen W3C-Standard.
* **Was verbessert sich?**
  * **Conditional UI:** Passkeys integrieren sich nun nahtlos in das AutoFill-Menü des Browsers (direkt im Benutzernamen-Feld), ohne dass sofort ein störendes Betriebssystem-Popup aufspringt.
  * **Cross-Device Authentication (CDA):** Die Synchronisation von Passkeys über Cloud-Provider (iCloud, Google Password Manager) wird fest standardisiert, sodass der Wechsel zwischen Handy und PC reibungslos funktioniert.
  * **Device Public Key (DPK):** Erweiterte Sicherheit für Enterprise-Umgebungen, um das physische Gerät kryptografisch an den Login zu binden.

### CSS & HTML (Chrome 148-150+)
* `focusgroup` (Tastatur-Navigation ohne JS)
* `column-rule` (Native Gap-Trennlinien)
* `background-clip: border-area` (Native CSS-Gradients auf Borders)
* *Window AI / Prompt API* (Lokales LLM direkt im Browser)

## 4. Release-Notes-Scan Chrome 142-151 (Stand: 2026-09-09)

Vollständiger Scan der letzten zehn Stable-Versionen (Quellen: `https://developer.chrome.com/release-notes/142` bis `/151`, je abgerufen am 2026-09-09). Versionen 152/153 existieren bereits als Beta/Preview. Projekte relevant = DIN-BriefNEO (CSS-First, JS-Kill, Druck-Workflow, AI-Add-on).

### Relevante Features je Version

| Version | Feature | Projekt-Relevanz |
|---|---|---|
| **151** | `position-anchor` Initialwert geändert (`none`→`normal`) | Anchor-Positioning wird intensiv genutzt — aber wir setzen `position-anchor` explizit → **kein Bruch** |
| **151** | `AnimationEvent`/`TransitionEvent` `.animation` | Debugging-Potenzial, gering |
| **150** | **`text-fit` (stable)** — Skaliert Schriftgröße automatisch auf Container-Breite | ⭐ Direkt relevant: Layout-Text-Fit im Briefblatt könnte von JS auf CSS wandern (ADR-CSS prüfen) |
| **150** | **`page-margin-safety` (Descriptor)** — Handling unbedruckbarer Druckerrandzonen | ⭐ Direkt relevant für `print.css` / DIN 5008-Druckworkflow |
| **150** | `flex-wrap: balance` | Für Infoblock/Empfängerzeilen prüfbar |
| **150** | Komma-separierte Container Queries (Fallbacks) | Robustheit für `@container`-Guards |
| **150** | `light-dark()` mit Bildwerten | Gering (keine Bilder im Projekt) |
| **150** | `Focusgroup` | ⭐ JS-Kill: Pfeiltasten-Navigation für Toolbars/Listen ohne JS |
| **150** | `popover=hint`-Verhaltensänderungen | Relevant (Popover-Heavy-Architektur) |
| **150** | `selectedcontent`-Updates | Relevant (base-select wird genutzt) |
| **149** | CSS Gap Decorations (`column-rule`/`row-rule` in Flex/Grid) | Dekorative Trennlinien ohne Pseudo-Elemente |
| **149** | Ellipsis→`clip` bei Interaktion | Besser für Single-Line-Felder beim Editieren |
| **149** | `:hover`/`:active`/`:focus-within` über Top-Layer-Grenze | Hover-Ketten mit Popovers/Anchors |
| **149** | Selective Clipboard Format Read | Perf für 46-Clipboard-Address-Parser |
| **148** | `@supports at-rule()` | Feature-Detection für `@page` etc. |
| **148** | Name-only Container Queries | `@scope`-Ergänzung |
| **148** | `revert-rule` Keyword | Cascade-Werkzeug |
| **148** | Prompt API (stable) | ⭐ AI-Add-on: Prompt API jetzt direkt nutzbar |
| **148** | text-decoration-skip-ink: all | Gering |
| **147** | `contrast-color()` | ⭐ Dynamische Kontrast-Sicherheit ohne Hex/RGB |
| **147** | Element-scoped `startViewTransition()` | Nicht genutzt, Beobachtung |
| **147** | `border-shape` | Gering |
| **147** | `*-width` von `*-style` entkoppelt | Breaking-Watch: computed `border-width` jetzt unabhängig von style |
| **146** | Scroll-triggered Animations (timeline-trigger) | Gering (Zero-Scroll-Projekt) |
| **146** | `meta name="text-scale"` | Potenzial: OS-Textskalierung respektieren |
| **145** | `text-justify` | ⭐ DIN-Blocksatz-Kontrolle (Blocksatz im Brief!) |
| **145** | Prozentwerte für `letter-spacing`/`word-spacing` | Responsive Typografie |
| **145** | Customizable Select: Listbox-Modus (`size`/`multiple`) | base-select-Erweiterung |
| **145** | `focus()` mit `focusVisible`-Option | JS-Kill-Hilfe |
| **144** | ⭐⭐ **Temporal API (stable!)** | HÄRTESTEN relevant: `new Date()`-Ban wird nativ erfüllbar (siehe auch DECISION-LOG) |
| **144** | `@scroll-state` `scrolled` | Zero-Scroll-Projekt: gering |
| **144** | `overscroll-behavior` auf non-scrollable Containern + Keyboard | Scroll-Guards robuster |
| **144** | `caret-shape` | Optisch, gering |
| **144** | Anchor-Positioning mit Transforms | Anchor-Robustheit |
| **144** | `clipboardchange` Event | Clipboard-Monitoring (46-Parser-Umfeld) |
| **143** | `@container anchored(fallback)` | Anchor-Fallback-Styling |
| **143** | `font-language-override` | Gering |
| **143** | ICU 77: **de-DE-Format-Stabilität prüfen** | ⭐ Intl-Formate (47-date-format!) können sich durch ICU-Updates ändern — XSLT-Abschied bestätigt: keine Format-Annahmen hartcoden |
| **142** | Style-Container-Queries & `if()` mit Range-Syntax | ⭐ attr()-basierte Geometrie-Checks ohne JS |
| **142** | Interest Invokers (`interestfor`) | Popover-Ergänzung ohne JS |
| **142** | Select-Rendering-Parität Mobile/Desktop | base-select-Robustheit |

### Kernerkenntnisse (Kurzfassung)

1. **Temporal ist stable (144)** — der `new Date()`-Ban des Law Catalogs ist jetzt nativ erfüllbar; alle Temporal-Workarounds können langfristig vereinfacht werden.
2. **`text-fit` (150) + `page-margin-safety` (150)** sind die beiden CSS-Features mit direktem DIN-5008-Druck-Bezug → PoC-Kandidaten Nummer 1.
3. **`contrast-color()` (147)** löst Kontrast-Berechnungen ohne Farbwert-Manipulation.
4. **Focusgroup (146/150)** + Interest Invokers (142) erweitern das JS-Kill-Arsenal für interaktive Elemente.
5. **ICU-Updates (143)** sind eine Warnung für 47-date-format.js: `Intl`-Formate sind datengetrieben — Exakt-String-Vergleiche vermeiden.
6. **Kein Breaking-Change** für bestehende Patterns gefunden; einzige Beobachtung: `position-anchor`-Initialwert (151, unkritisch da explizit gesetzt) und `*-width`/`*-style`-Entkopplung (147, Border-Designs prüfen).

### DevTools-Test-Hinweise (Stand: 2026-09-09)

- **Darkmode-Test**: Rendering-Tab → *Emulate CSS media feature* → `prefers-color-scheme: dark` (Quelle: `/docs/devtools/rendering/emulate-css`) — sauberster Weg, das BriefNEO-Dark-Theme zu prüfen, ohne das OS umzuschalten.
- **Auto Dark Theme**: Rendering-Tab → *Enable automatic dark mode* (Quelle: `/docs/devtools/rendering/apply-effects`, Chrome 96+) — emuliert die *automatisch generierte* Dunkelthema-Erzwingung für Light-Only-Seiten; für BriefNEO (eigenes Dark-Theme via `prefers-color-scheme`) nur als Fallback-Test relevant. Achtung: Bei aktivem Auto Dark wird die `prefers-color-scheme`-Emulation automatisch auf `dark` fixiert.
- **Print-Check**: Beide Optionen kombinierbar mit *Emulate CSS media type: print* — verifiziert, dass der Brief trotz dunklem Theme hell druckt (Relevanz für `print.css` / `page-margin-safety`-PoC).

### PoC-Ergebnisse text-fit + page-margin-safety (Chrome 151, Stand: 2026-09-09)

Verifiziert in Helium (Chrome/151.0.7922.137) via CDP, Testdateien: `scratch/test-text-fit.html`, `scratch/test-page-margin-safety.html` (Auswertung: `scratch/cdp-eval.js`).

**`text-fit` (css-text-5)** — CSSOM-Verhaltenstest:

| Wert | CSSOM-Resultat | Verhalten (scrollWidth in 6em-Box, Text 378px) |
|---|---|---|
| `none` | gültig | kein Fit (378) |
| `contain` | **VERWORFEN** — ungültig laut Spec-Grammatik | kein Fit (378) |
| `shrink` | gültig | **skaliert** (378 → 84) |
| `shrink 60%` | gültig | skaliert, limitiert (→ 227) |
| `grow` | gültig | kein Shrink (erwartet) |
| `shrink per-line 50%` | gültig | Skalierung pro Zeile |
| `consistent shrink` / `per-line shrink` | verworfen (falsche Reihenfolge) | — |

→ **Fix in `layout.css` umgesetzt**: `text-fit: contain` (Z. 337, 393, 769) → `text-fit: shrink`. Live-Verifikation über die laufende App: `#absender`, `#betreff`, `.single-line` rechnen jetzt `shrink` (vorher ungültig → Deklaration tot). Spec-Grammatik bestätigt: `[none|grow|shrink] [consistent|per-line|per-line-all]? <percentage>?` — Reihenfolge der Keywords ist verbindlich.

**`page-margin-safety` (css-page-3, `@page`-Descriptor)** — CSSOM-Parsing-Test: `none`, `clamp`, `add` parsen alle; Garbage verworfen; `@page :first` akzeptiert den Descriptor. Semantik laut Spec (§7.6): `clamp` = max(Setterwert, `<safe-printable-inset>`), `add` = Setterwert + Inset — greift nur an Blatträndern, nicht am Seitenbereich. → Integration in `print.css` (DIN-5008-Druckworkflow) offen.
