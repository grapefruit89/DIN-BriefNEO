---
status: active
type: reference
tags: [din5008, briefneo, antipattern, verworfen, anti-nuggets]
summary: "Kompakte Übersicht aller verworfenen Funktionen, Anti-Nuggets und Fehlkonzepte mit Begründung."
---

# Verworfen / Anti-Nuggets — Was wir nicht bauen (und warum)

> **Zweck dieser Liste:** Dieses Dokument sammelt Ideen, Code-Muster und Vorschläge, über die nachgedacht wurde, die aber nach eingehender Prüfung **bewusst und mit guten Gründen verworfen wurden**.  
> Es schützt das Projekt vor Feature Creep, Regressionen und wiederkehrenden Schein-Optimierungen durch Entwickler und KI-Agenten.

---

## 🚫 Übersicht der verworfenen Konzepte & Anti-Nuggets

| Was (Vorschlag / Idee) | Warum verworfen (Begründung) | Norm / Gesetz / Bezug |
|---|---|---|
| **`contenteditable`-Toggle per `isEditing`-Flag** | Anti-Pattern: Erzeugt unnötigen State, Fokus-Verlust und Klick-Verzögerung. `contenteditable="plaintext-only"` schützt direkt nativ auf C++-Ebene ohne Umschalt-Logik. | **H3**, **A55** |
| **`setTimeout(blur, 150)`** | Race-Condition: Asynchrone Timeouts sind brüchig bei schnellem Fokuswechsel, Fenstertab-Wechsel oder Mobile-Keyboards. Stattdessen native Events (`blur`, `afterprint`). | **P2-5**, **KISS** |
| **Transparenter `<select opacity: 0>`** | A11y-Albtraum: Unsichtbarer nativer Tastaturfokus, Screenreader-Verwirrung, unzuverlässige Touch-Trefferflächen auf mobilen Endgeräten. | **H10**, **WCAG 2.2** |
| **`.show`-Klassen-Toggle für UI-Bereiche** | Kein nativer Tastatur- und Screenreader-Zugriff. Erzeugt doppelte State-Synchronisation. Stattdessen native Checkboxen (`:has(:checked)`), Popover API oder `<details>`. | **A60**, **A62** |
| **`innerHTML`-Restore ohne Sanitizer** | Kritisches Sicherheitsrisiko (XSS-Vektor beim Laden von Drafts/Backups/History). Entwürfe müssen immer gefiltert (`setHTML()` oder Allowlist `sanitizeRichText`) restauriert werden. | **H11**, **A61** |
| **`document.execCommand('insertText')`** | Deprecated / veraltet, browserabhängiges Verhalten, kollidiert mit dem History-Stack des DraftManagers. Stattdessen Selection & Range API oder `textContent`. | **A52** |
| **jQuery / Tailwind-CDN / html2canvas / jsPDF** | Externe Dependencies: Zerstören das Zero-Dependency- und Offline-First-Prinzip. Verursachen Vendor-Lock-in und Ladezeit. Nativer Browser-Druck und Vanilla JS sind robuster. | **T1**, **T2**, **A38**, **A51** |
| **Canvas-Textbreiten-Messung (Layout-Polling)** | Verursacht Layout Thrashing und Ruckeln. Durch modernes deklaratives CSS (`overflow: clip`, `text-wrap: balance/pretty`, CSS `text-fit: shrink 60%`) ersetzt. | **A49** |
| **`text-transform: capitalize`** | Verfälscht Namen unrettbar (z. B. werden Adelstitel oder Eigennamen wie „von Bismarck“, „McDonald“ oder „de Gruyter“ fehlerhaft großgeschrieben). | **Fachliche Typografie** |
| **`Intl.DateTimeFormat` / `new Date()` statt `Temporal`** | Zeitzonenblind: Nutzt implizit die System-/Serverzeitzone (UTC). Zwischen 00:00 und 02:00 Uhr deutscher Zeit liefert es den Vortag. Nur `Temporal` mit IANA-Zone `Europe/Berlin` ist exakt. | **A48**, **A50**, **TM1** |
| **Google Fonts via CDN** | Verstößt gegen DSGVO (Abmahnrisiko) und bricht die Offline-Fähigkeit. Stattdessen moderne Systemfont-Stacks und lokale Base64-WOFF2-Schriften. | **T3**, **A38**, **A41** |
| **Falzmarken 87/192 → 105/210 „korrigieren“** | Typischer Denkfehler: Verwechselt Form A mit Form B. DIN 5008 definiert zwei normgerechte Bogenformen: Form A (87/192 mm) und Form B (105/210 mm). Beide sind gültig! | **DIN 5008 Kap. 20.3**, **IMR** |
| **`contenteditable` durch `<input>` ersetzen** | Zerstört den WYSIWYG-Charakter, bricht die exakte typografische DIN-Millimeter-Positionierung und erfordert künstliche Overlays. `plaintext-only` ist die richtige Lösung. | **H3**, **H4** |
| **`<svg>`-Falzmarken inline erzwingen** | Kein praktischer Vorteil gegenüber optimiertem CSS-Border bei 100% Zoom; birgt das Risiko, von aggressiven `@media print`-Regeln ausgeblendet zu werden (siehe B35). | **B35**, **KISS** |
| **`page-break-after: always` auf Layout-Wurzeln** | Multi-Page gehört in die geplante Architektur (B27/B34). Im Einzelseiten-Editor führt dies zu leeren Geisterseiten beim PDF-Export. | **A46** |
| **Ankerpunkt-Experiment (Padding am `<din-5008>`)** | Führt zu doppelten Offsets, bricht das Millimeter-Koordinatensystem und verletzt die Geometrie-SSoT der IMR-Registry. | **MUST-NOT 5**, **IMR** |
| **Statische Inline-Style-Positionen (`style="top: 45mm"`)** | Verletzt die Geometrie-SSoT. Alle normativen Abstände müssen als deklarative `data-*`-Attribute am Container leben und von `sheet.css` via `attr()` gelesen werden. | **A25**, **IMR-Registry** |
| **Eigene `updateAnredeDynamisch`-Heuristik-Engine** | Eigenmächtige Regex-Namensfilter sind fehleranfällig (400+ Namen-Listen veralten sofort). Die modulare `SalutationEngine` mit neutralen Fallbacks ist überlegen. | **ADR-ANTIPATTERN**, **A3** |
| **`field-sizing: content`** | Funktioniert nicht auf `contenteditable` oder benutzerdefinierten Elementen – nur auf `<textarea>`, `<input>`, `<select>`. Die Brief-Felder sind `contenteditable`. Im CSS-Kommentar (`sheet.css`) bereits korrekt erkannt. | **CSS UI 4**, **H3/H4** |
| **Native Sanitizer API (`setHTMLUnsafe`)** | `sanitizeRichText` hat domänenspezifische Anforderungen (strikte Allowlist, `brief-kommentar`-Erhalt, DIN-13.1-Filter), die die generische native API nicht abbildet. Bewusste architektonische Entscheidung im Code. | **H11**, **A61** |
| **CSS Custom Highlight API (`::highlight()`)** | Kein aktuelles Feature in der App. Würde ein neues Feature bedeuten, kein Refactoring oder Optimierung bestehender Kernfunktionen. | **KISS**, **YAGNI** |
| **CSS `subgrid`** | Das DIN-5008-Bogenlayout basiert auf millimetergenauen Zonen (`position: absolute` mit CSS-Funktionen `--mm-x`/`--mm-y`). `subgrid` würde ein komplett anderes Layout-Modell erzwingen. | **IMR-SSoT**, **ADR-CSS** |
| **`window.queryLocalFonts()`** | Stark Chromium-spezifisch, erfordert explizite Nutzerberechtigung (Permission-Prompt) und aufwendigen Umbau des minimalistischen Font-Managers. Kein akuter Mehrwert. | **A41**, **KISS** |
| **`CompressionStreams` für `localStorage`** | Aktuell unkritisch, da Entwürfe (`briefDraft`) sehr klein sind. Wäre erst relevant, falls übergroße Assets den Quota gefährden (Signatur ist bereits isoliertes Asset). | **A34**, **YAGNI** |
| **`focusgroup`-Attribut** | Nicht erforderlich – native HTML-Radiobuttons (`<input type="radio">`) und Tastatur-Controls verfügen von Haus aus über Roving Tabindex. | **A11y**, **HTML-First** |
| **`interesttarget`-Attribut** | Plattform-API in Chromium 150+ noch experimentell / nicht stabil verfügbar. Keine verfrühte Bindung an instabile Entwürfe. | **Baseline**, **KISS** |
| **8pt-Grid-Umstellung (DS-2/DS-3)** | Verworfen (Nutzerentscheid 2026-10-26): Kein DIN-Risiko. Das Bogenlayout folgt strikten DIN-Millimetern, die Seitenleiste ist visuell ausbalanciert; pauschale 8pt-Zwangsabstände würden bestehende Proportionen gefährden. | **KISS**, **DIN 5008** |
| **`address.js`-Modularisierung** | **2026-11-08 präzisiert:** Die pauschale 4-fach-Aufteilung bleibt verworfen (Nutzerentscheid 2026-10-26, Datei-Explosion). Ausgelagert ist nur der `ClipboardAddressParser` (`clipboard-parser.js`), weil er reine String-/Regex-Logik ohne Adressbestände ist und dadurch isoliert testbar wird. `AddressIntelligence` und Geoapify bleiben zusammen. | **KISS**, **Simplicity First** |
| **DIN 5008 Kapitel 22–25 (E-Mail, Präsentationen, Excel-Tabellen, Protokolle, Dateiablage)** | **Scope Creep & Feature-Bloat:** DIN-BriefNEO ist ein fokussierter DIN-5008-**Brief**-Editor nach Karpathy (Simplicity First). PowerPoint-Slides, Besprechungsprotokolle oder Datei-Ablagebäume gehören nicht in eine Brief-App. | **Karpathy-Prinzip**, **Simplicity First**, **YAGNI** |
| **Starres 4,23-mm-Schreibmaschinen-Raster (DIN 5008 § 19.3 / 12pt Line-Grid)** | Veraltetes mechanisches Schreibmaschinen-Relikt. Führt bei modernen Proportional-Webfonts (Aptos, Liberation Sans, Inter) zu unnatürlichen Abständen, vertikalem Text-Clipping und starrer Inflexibilität. Natives CSS mit `line-height: 4.5mm` ist visuell überlegen. | **CSS Platform-First**, **KISS** |
| **Custom-Popover als `<select>`-Ersatz** | JS-gestützter Nachbau nativer Auswahllisten erzeugt doppelten State, A11y-Races (`aria-selected`, `aria-activedescendant`) und zerstört natives OS-Autofill. Stattdessen echte `<select>`-Elemente oder native Form-Controls verwenden. | **H10**, **WCAG 4.1.2** |
| **Synthetische Rollen auf nativ gekoppelten Labels** | Ein `<label for="...">` mit `role="button"` und `aria-pressed` über einer Checkbox dupliziert das Steuerelement im Accessibility-Tree. Der Zustand gehört exklusiv auf das native `<input>`. | **WCAG 1.3.1**, **APG** |
| **Manuelle bedingte Trennstriche (`&shy;` / `¬` nach DIN 5008 § 6.1)** | Durch modernes natives CSS (`hyphens: auto; lang="de"` und `text-wrap: pretty;`) auf Chromium 150+ vollständig obsolet. Manuelle HTML-Trennmarken zerstören den sauberen DOM-Text und machen Änderungen wartungsfeindlich. | **Rule 12 (Chromium 150+)**, **KISS** |

---

## 🔗 Verwandte Referenzen im Repository

- **Maschinell erzwungene Gesetze:** [`/home/moritz/repos/DIN-BriefNEO/docs/00-foundation/Immutable-Law-Catalog.md`](../docs/00-foundation/Immutable-Law-Catalog.md)
- **Historische Beschluss-Chronik:** [`/home/moritz/repos/DIN-BriefNEO/docs/30-meta/DECISION-LOG.md`](../docs/30-meta/DECISION-LOG.md)
- **Zentrale Aufgaben & Roadmap:** [`/home/moritz/repos/DIN-BriefNEO/todo/README.md`](README.md)
