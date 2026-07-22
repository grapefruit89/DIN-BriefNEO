---
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: spec
status: active
tags:
- documentation
- spec
- requirements
title: Spezifikation (Spec) — DIN-BriefNEO Baseline Features
type: specification
updated: '2026-07-07'
---

# Spezifikation (Spec) — DIN-BriefNEO Baseline Features

> [!NOTE]
> Die exakten Maße und Geometriedaten gemäß dem DIN 5008 Standard findest du in unserem hochpräzisen Dokument. Dieses Dokument dient als Single Source of Truth (SSoT) für alle physischen Abstände.

Dieses Dokument beschreibt die Kernfunktionen des Refactored Prototyps. Jedes Feature ist nach dem **Spec-Kit-Modell** in Anforderung (`Specify`), Plan (`Plan`) und Aufgaben (`Tasks`) unterteilt.

---

## 🟢 Baseline Features (Umgesetzt)

#### Feature 1: Elastischer Viewport (No-Scroll Auto-Zoom)

### 1. Specify (Das "Was")

* **User Story:** Als Anwender möchte ich den virtuellen DIN A4 Briefbogen auf jedem Bildschirm (Desktop, Laptop, Tablet) vollständig und ohne Scrollbalken im Blick haben, damit ich das Brief-Layout direkt bearbeiten kann.

* **Akzeptanzkriterien:**

  - Das Briefblatt behält das exakte Seitenverhältnis von 210:297 (DIN A4).

  - Es entstehen weder vertikale noch horizontale Scrollbalken im Browserfenster.

  - Bei Größenänderung des Browserfensters skaliert das Blatt flüssig.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:** 

  - Wir verzichten vollständig auf JavaScript-basierte Resize-Listener und transform-Skalierungen.

  - Das `<din-a4>` Element erhält eine feste, viewport-relative Höhe (`height: 94vh`) und ein exaktes DIN A4 Seitenverhältnis (`aspect-ratio: 210 / 297`).

  - Wir deklarieren `<din-a4>` als Container (`container-type: size`).

  - Alle Kind-Elemente, Schriftgrößen, Abstände und Positionen auf dem Briefbogen werden über relative Container Query Units (`cqw` und `cqh`) proportional skaliert. Bei Skalierung des Viewports skaliert das gesamte Brief-Layout pixelperfekt mit.

### 3. Tasks (Die Aufgaben)

- [x] `#viewport` und `din-a4` im HTML-Markup anlegen.

- [x] Globales `overflow: hidden` auf `html` und `body` setzen.

- [x] Container Query Units (`cqw`/`cqh`) und container-type deklarieren.

- [x] CSS-Sizing und proportionale Abstände in `css/layout.css` verankern.

---

### Feature 2: DIN Layout-Wechsler (Form A vs. Form B)

### 1. Specify (Das "Was")

* **User Story:** Als Briefschreiber möchte ich zwischen den offiziellen DIN 5008 Layouts "Form A" (Kopfhöhe 27mm) und "Form B" (Kopfhöhe 45mm) wechseln können, um verschiedene Briefbogen-Standards zu bedienen.

* **Akzeptanzkriterien:**

  - Der Wechsel erfolgt über eine Schaltfläche in der Sidebar.

  - Die Abstände von Absender, Empfänger, Infoblock, Faltmarken und Briefkern passen sich augenblicklich an die DIN-Vorgaben an.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Die Sidebar enthält Buttons für "Form A" und "Form B".

  - Das Script fügt bei Klick dem App-Shell-Element die Klasse `.form-a` oder `.form-b` hinzu.

  - Im CSS (`css/layout.css`) sind alle Positionen (z. B. Falzmarken, Top-Positionen des Briefkerns) in Abhängigkeit von dieser Klasse deklariert.

### 3. Tasks (Die Aufgaben)

- [x] Layout-Buttons im HTML-Sidebar-Bereich erstellen.

- [x] CSS-Positionierungsklassen für `.form-a` und `.form-b` schreiben.

- [x] Klick-Listener in `js/main.js` registrieren, der Klassen toggelt und die Einstellungen speichert.

---

### Feature 3: Native Color Schemes (Light- & Dark-Mode)

### 1. Specify (Das "Was")

* **User Story:** Als Anwender möchte ich die App in einem hellen, dunklen oder sich automatisch an das System anpassenden Modus nutzen, um ermüdungsfrei arbeiten zu können.

* **Akzeptanzkriterien:**

  - Umschalter in der Sidebar für "Hell", "Dunkel" und "System".

  - Die Farben passen sich harmonisch an. Das Briefpapier selbst bleibt für die Bearbeitungs-Klarheit weiß (analog zum physischen Druck).

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Nutzung des nativen CSS-Features `color-scheme: light dark` und `light-dark(hell, dunkel)`.

  - Farbzuweisung über OKLCH Custom Properties in `css/variables.css`.

  - JS manipuliert ausschließlich das Attribut `style.colorScheme` des HTML-Elements für manuelles Überschreiben.

### 3. Tasks (Die Aufgaben)

- [x] Theme-Variablen in `css/variables.css` mit `light-dark()` deklarieren.

- [x] Segmented Control in der Sidebar für Themes einrichten.

- [x] Theme-Anwendungslogik in `js/main.js` einbauen.

---

### Feature 4: LocalStorage Auto-Save & Draft-Management

### 1. Specify (Das "Was")

* **User Story:** Als Briefschreiber möchte ich, dass jeder geschriebene Buchstabe im Briefbogen sofort lokal gesichert wird, damit ich bei einem versehentlichen Tab-Schließen oder Browser-Absturz keine Daten verliere.

* **Akzeptanzkriterien:**

  - Automatisches lautloses Speichern im Hintergrund bei Tastatureingaben.

  - Automatisches Wiederherstellen des letzten Entwurfs beim Öffnen der Webseite.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Briefelemente nutzen `contenteditable="plaintext-only"`.

  - Jedes editierbare Element erhält eine eindeutige `id`.

  - Bei jedem `input`-Event auf einem Editier-Feld liest das Script alle Texte aus, baut ein JSON-Objekt und speichert es unter `din_draft_current` im LocalStorage.

  - Beim Laden der Seite (`DOMContentLoaded`) wird das Objekt eingelesen und die Felder befüllt.

### 3. Tasks (Die Aufgaben)

- [x] Eindeutige IDs und `contenteditable="plaintext-only"` im HTML vergeben.

- [x] Hilfsmodul `js/storage.js` für LocalStorage-Verwaltung anlegen.

- [x] Auto-Save Event-Listener in `js/main.js` verknüpfen.

- [x] Lade-Logik beim Systemstart implementieren.

---

### Feature 5: Scroll-freier Multipage-Wechsler (Karussell)

### 1. Specify (Das "Was")

* **User Story:** Als Briefschreiber möchte ich lange Briefe verfassen können, die über eine Seite hinausgehen, ohne dass Scrollbalken entstehen oder Text abgeschnitten wird, indem der Brief nahtlos auf neue, separat navigierbare Seiten paginiert wird.

* **Akzeptanzkriterien:**

  - Der Anwender kann über Navigationsbuttons im Viewport (Zurück, Weiter, Neue Seite) zwischen den Seiten wechseln.

  - Das Briefblatt scrollt nicht, sondern wird horizontal verschoben (Karussell-Effekt).

  - Ein Page-Indicator zeigt die aktuelle Seite und die Gesamtseitenanzahl an (z. B. "Seite 1 / 2").

  - Beim Drucken werden alle Seiten untereinander als reguläre Einzelseiten gedruckt.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Wir fügen einen horizontalen Flexbox-Träger (`#paper`) ein, der mehrere `<din-a4>`-Blätter nebeneinander enthält.

  - Die Navigation erfolgt über ein CSS-Translation-Attribut auf dem `#paper`-Element: `transform: translateX(calc(-100% * (var(--page-current, 1) - 1)))`.

  - JS manipuliert die CSS Variable `--page-current` und die Anzahl der Kind-Elemente.

  - Neue Seiten werden aus einem `<template id="tpl-din-page">` instanziiert und dem DOM hinzugefügt.

  - Für den Druck wird das Karussell per CSS aufgehoben (`transform: none`, `display: block` unter `@media print`).

### 3. Tasks (Die Aufgaben)

- [ ] Multipage-Träger `#paper` in `index.html` einbetten und Navigation-Controls ergänzen.

- [ ] HTML `<template id="tpl-din-page">` für neue Blätter definieren.

- [ ] CSS-Karussell-Transformation und Karussell-Button-Styles in `css/layout.css` implementieren.

- [ ] Druck-Layout in `css/layout.css` anpassen, um alle Seiten untereinander zu drucken.

- [ ] Paginierungs-, Navigations- und Add-Page-Logik in `js/main.js` integrieren.

- [ ] LocalStorage-Sicherungsmodul in `js/main.js` und `js/storage.js` anpassen, um mehrseitige Inhalte zu speichern.

---

### Feature 6: Zentralisierung aller Konstanten und Feedback-Meldungen (Toasts)

### 1. Specify (Das "Was")

* **User Story:** Als Entwickler möchte ich alle Systemgrenzen (z. B. Undo/Redo Limits, Dateigrößen, API-Debounce) und alle Systemrückmeldungen (Erfolgsmeldungen, Warnungen, Validierungsfehler) an einem zentralen Ort pflegen können, um den Code übersichtlich zu halten und spätere Übersetzungen (Lokalisierung) zu vereinfachen.

* **Akzeptanzkriterien:**

  - Keine hartcodierten Strings für Erfolgsmeldungen, Warnungen oder Fehler in den JavaScript-Dateien.

  - Alle Texte und Fehlermeldungen sind in einem zentralen Objekt gekapselt.

  - Systemkonstanten (wie Speicher-Keys oder Dateigrößenbegrenzungen) werden aus derselben SSoT bezogen.

### 2. Plan (Das "Wie")

* **Technischer Ansatz:**

  - Wir erstellen eine eigenständige ES-Moduldatei `js/constants.js`.

  - Alle UI-bezogenen Meldungen (Toasts), Storage-Keys und Grenzwerte werden als exportierbares `Constants`-Objekt bereitgestellt.

  - JS-Module (`js/main.js`, `js/storage.js` etc.) importieren dieses Modul und greifen dynamisch auf die Strings zu (z. B. `Constants.TOASTS.PROFILE_SAVED`).

### 3. Tasks (Die Aufgaben)

- [x] Zentrales Constants-Modul `js/constants.js` anlegen und befüllen.

- [x] JS-Logikdateien umschreiben, um hartcodierte Texte durch Importe aus `constants.js` zu ersetzen.

---

# Zukünftiges Backlog (Phase 3 Feature-Roadmap)

> [!NOTE]
> Die folgenden Features befinden sich im ruhenden Planungs-Backlog und werden aktuell nicht aktiv verfolgt.

## 🟡 Backlog (Geplant / Zurückgestellt)

> [!WARNING]
> Die folgenden Features befinden sich im Backlog und werden aktuell nicht aktiv verfolgt, da sie teilweise den strikten Zero-Dependency und Wartungsfreiheits-Regeln widersprechen könnten.

#### Feature 7: Auto-Kompakt Layout-Modus (Form A/B Auto-Switch)

* **Specify (Das "Was"):** Als Briefschreiber möchte ich, dass die Anwendung bei langem Brieftext automatisch von Form B auf Form A wechselt, falls dadurch der Text gerade so auf eine einzige Seite passt, um Zeit und Papier zu sparen.

* **Akzeptanzkriterien:**

  - Option "Automatisch" in der Sidebar unter "DIN-Brief Layout".

  - Echtzeit-Berechnung des vertikalen Textüberlaufs über relative Ratios (Grenze: Y: 235mm, Ratio `0.791`).

  - Wenn Text in Form B überläuft, aber in Form A passt, erfolgt ein flüssiger Wechsel zu Form A.

  - Bei Textkürzung erfolgt der automatische Rückwechsel zu Form B.

### Feature 8: Anrede-Stil & Auto-Gender Engine

* **Specify (Das "Was"):** Als Briefschreiber möchte ich den Stil der Anrede (Förmlich, Höflich, Modern) in der Sidebar wählen können, und die Anwendung soll basierend auf dem Empfängernamen automatisch das Geschlecht ermitteln und die passende Anrede und Grußformel vorschlagen.

* **Akzeptanzkriterien:**

  - Segmented Control in der Sidebar für "Anrede-Stil" (Förmlich, Höflich, Modern).

  - Automatisches Scannen des Empfängernamens auf Titel (Dr., Prof.) und Geschlechtsmerkmale via RegExp.

  - Auto-Generierung von Anrede und Grußformel über "Ghost-Sync", solange der Benutzer diese nicht manuell editiert hat. Manual Overrides haben absolute Priorität.

### Feature 9: Integriertes Absender-Profil (Persönliche Daten)

* **Specify (Das "Was"):** Als regelmäßiger Briefschreiber möchte ich meine persönlichen Kontaktdaten, Bankdaten und Footer-Zusätze dauerhaft in der Sidebar speichern können, damit diese bei jedem neuen Brief automatisch in den Briefkopf und die Fußzeile eingepflegt werden.

* **Akzeptanzkriterien:**

  - Einklappbares Formular "Absender-Profil" in der Sidebar.

  - Persistent gespeicherte Profildaten unter `din_profile` im LocalStorage.

  - Automatisches Befüllen von `#absender`, `#info-tel` und Brieffooter beim Speichern und beim Systemstart.

### Feature 10: Premium Ambient Dark Mode (Time- & System-based)

* **Specify (Das "Was"):** Als Benutzer möchte ich abends und nachts dezent und ohne grelles Licht Briefe schreiben, ohne dass eine fehlerhafte Farbinversion die Brief-Ästhetik ruiniert. Der Nachtmodus soll sich abends automatisch aktivieren.

* **Akzeptanzkriterien:**

  - Segmented Control für "Theme" (Hell, Dunkel, Auto).

  - Modus "Auto" schaltet abends/nachts (18:00 - 06:00 Uhr) oder bei System-Dark-Preference automatisch in den Dark Mode um (30s clock interval check).

  - Keine Inversions-Filter! Das Briefpapier wird im Dark Mode in edles, warmes Dunkelgrau (`oklch(28% 0.01 250)`) gefärbt, das die Augen schont.

  - Beim Drucken wird das Papier ausnahmslos reinweiß mit schwarzem Text ausgegeben (Druck-Souveränität).

### Feature 11: Easter-Egg High-Integrity Dev-Panel (Popover-based)

* **Specify (Das "Was"):** Als Entwickler möchte ich ein verstecktes Diagnose-Panel direkt in der Web-App aufrufen können, indem ich 3-mal schnell hintereinander auf das Versions-Badge im Fußbereich klicke, um den Bereitschaftsbericht aller 25 Bleeding-Edge-Features live einzusehen.

* **Akzeptanzkriterien:**

  - 3-Klick-Easter-Egg auf `#dev-easter-egg` im Footer (1000ms Timeout-Fenster).

  - Einblendung über ein natives HTML5 Popover `#dev-popover` (`popover="manual"`) ohne zusätzliche Bibliotheken.

  - Dynamisches Ausführen der 25 Diagnosetests bei jedem Öffnen und Befüllen der Tabelle.

  - Schließen-Button (`&times;`) und ein Button zum manuellen Leeren der Browser-Konsole im Overlay.

  - Perfekte Scrollbarkeit der Tabelle im Overlay ohne Beeinträchtigung des Haupt-Layouts.

  - Vollständig produktiv implementiert und einsatzbereit.