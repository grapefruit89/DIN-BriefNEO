---
id: web-standards-tracking
title: 'Web Standards Tracking & Testing'
type: guide
status: active
created: '2026-07-21'
updated: '2026-08-07'
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
