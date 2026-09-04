---
id: constitution
title: 'Verfassung (Constitution) — DIN-BriefNEO'
type: reference
status: active
created: '2026-06-26'
updated: '2026-09-02'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/reference
doc_links:
  - Immutable-Law-Catalog
  - spec
  - longevity-guidelines
  - HYBRID-SPEC-DRIVEN-WORKFLOW
code_links: []
error_patterns:
  - constitution
  - verfassung
  - regelwerk
  - fundamental verbote
  - zero-dependency
  - offline-first
supersedes: []
depends_on: []
---

# Verfassung (Constitution) — DIN-BriefNEO

Dieses Dokument ist das bindende Regelwerk von **DIN-BriefNEO**. Technische Entscheidungen und Code müssen damit im Einklang stehen.

Es enthält Prinzipien, keine Millimeter, keine Atomlisten und keine Kopie des aktuellen `website/index.html`. Verbote und Stufen (HARD BAN / PREFERRED / FALLBACK) stehen im [[Immutable-Law-Catalog]]. Die Browser-Baseline steht nur in [[longevity-guidelines]].

---

## 1. Mission & Vision

DIN-BriefNEO ist eine minimalistische, autarke Webanwendung zur Erstellung und zum PDF-Druck formaler Briefe nach **DIN 5008 (Form A & B)**.
Sie läuft lokal im Browser, ohne Server und ohne Build-System, und soll über Jahre hinweg direkt ausführbar bleiben.

---

## 2. Die fundamentalen Verbote (DONT's)

### ❌ Fette Frameworks & Build-Tools

Keine Runtime-Frameworks, keine Bundler, keine Transpiler als Voraussetzung für die Anwendung.

### ❌ Kein unkontrolliertes Dokument-Scrolling

Das Dokument und das Briefblatt dürfen nicht als Seite scrollen. Kontrolliertes internes Scrollen in abgegrenzter UI (Dialog, Overlay, lange Hilfsliste) MAY existieren. Ein allgemeines „nirgendswo ein Scrollbalken“ ist kein Gesetz.

### ❌ Keine Native App & Keine Browser-Erweiterung

Ausschließlich eine standardkonforme Webseite / Web App. Kein Electron, Capacitor oder WebExtension.

### ❌ Keine serverseitigen Datenbanken für das Produkt

Die Anwendung selbst hängt an keinem Server und keiner Server-DB.

### ❌ Keine fremden Assets & CDNs

Keine CDNs, keine Laufzeit-Bibliotheken, keine Web-Fonts und keine fremden Script-/CSS-Hosts. Produkt-Assets liegen lokal.
Optionale Fach-APIs (reiner Datenabruf) sind davon zu unterscheiden und zulässig, sofern der [[Immutable-Law-Catalog]] sie allowlistet (A38). Sie dürfen kein Script, keine Schrift und kein Stylesheet liefern.

### ❌ Kein `Date` als Zeitquelle im Produkt

`Date` ist in `website/` nicht zulässig. Tooling (`tools/`, `agent/`) ist ausgenommen. `moment.js`, `date-fns` und `luxon` bleiben überall verboten. Zeitmodell: [[Immutable-Law-Catalog]] TM1 / A48.

---

## 3. Die fundamentalen Gebote (DO's)

### ✅ HTML > CSS > JavaScript

1. **HTML First:** Native Semantik und die kanonischen `<din-…>`-Tags für instantierte Fachatome. Native Elemente (`<dialog>`, Popover, `contenteditable`) vor Nachbau.
2. **CSS Second:** Layout, Zustand, Print und Theme in CSS. CSS rendert das IMR-Modell, es erfindet keine zweite Normtabelle.
3. **JavaScript Last:** JS ist die imperative Schicht für echte Dynamik (Persistenz, externe APIs, Verhalten, das HTML/CSS nicht tragen). JS ist nicht „deklarativ“ und definiert keine parallelen DIN-Werte.

Semantisches HTML-Element ≠ JavaScript Custom Element. `customElements.define()` ist für Semantik nicht erforderlich.

### ✅ Eine Wahrheit je Fakt

- Fachliches Vokabular: 45er Registry in der Architecture (Baukasten, keine Pflichtmenge im aktuellen Brief).
- Instantiiertes Atom: kanonisches `<din-…>` ohne JS-Klasse.
- Zonen (`din-a4`, `din-absender`, `din-anschriftfeld`, `din-infoblock`, `din-kern`, `din-fuss`) sind Container, keine der 45 Atome.
- Normatives DIN-Brief-Modell inklusive belegter Geometrie: [[IMR-Registry]] in `docs/10-architecture/`.
- HTML implementiert dieses Modell (aktuell unter anderem über `data-*` am Dokument-Root). Das ist Implementierung, nicht eine zweite Normquelle.
- CSS interpretiert die Implementierung.
- JS verändert und dupliziert die Normwerte nicht.

Vorname und Nachname dürfen als gemeinsame Namenszeile in der zuständigen Zone erscheinen. Das erzeugt kein weiteres Atom.

### ✅ Lokale Persistenz über LocalStorage

Entwürfe, Einstellungen und optionale API-Schlüssel liegen in der **Web Storage API (localStorage)**. Das ist eine bewusste Entscheidung für Offline- und `file://`-Betrieb, kein Urteil über IndexedDB an sich.

### ✅ Native Plattform gemäß Longevity-Baseline

Die einzige projektweite Browser-Baseline steht in [[longevity-guidelines]] (**Chrome 148+**). Constitution wiederholt keine zweite Versionszahl. Bevorzugt werden stabile native CSS/HTML-APIs, sofern die Longevity-Prüfung sie trägt. Farbe folgt der Kette im Catalog (OKLCH zuerst).

### ✅ Anforderung vor Code

Keine wesentliche Änderung ohne geklärte Anforderung. Das Verfahren (Light/Full Mode, Fitness-Gate) beschreibt [[HYBRID-SPEC-DRIVEN-WORKFLOW]] — das ist Prozess, nicht Verfassungsartikel.

### ✅ Technische Schulden nur über ADR

Jede Abweichung von diesen Prinzipien braucht eine MADR-konforme ADR.
