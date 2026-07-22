---
aliases:
- constitution
code_links: []
created: '2026-06-26'
depends_on: []
doc_links: []
id: constitution
status: active
tags:
- obsidian
- core
- documentation
title: Verfassung (Constitution) — DIN-BriefNEO
type: policy
updated: '2026-07-07'
---

# Verfassung (Constitution) — DIN-BriefNEO

Dieses Dokument ist das unverrückbare und absolut bindende Regelwerk (Rulebook) des Projekts **DIN-BriefNEO**. Jede technische Entscheidung und Code-Implementierung muss bedingungslos mit dieser Verfassung im Einklang stehen.

---

## 1. Mission & Vision

DIN-BriefNEO ist eine minimalistische, hochperformante und vollkommen autarke Webanwendung zur Erstellung und zum PDF-Druck formaler Briefe nach der deutschen Norm **DIN 5008 (Form A & B)**. 
Das Projekt ist extrem langlebig konzipiert: Es läuft vollständig lokal im Browser, ohne Server und ohne Build-Systeme, und bleibt über Jahrzehnte hinweg direkt ausführbar.

---

## 2. Die fundamentalen Verbote (DONT's)

### ❌ Fette Frameworks & Build-Tools

### ❌ Absolutes Scroll-Verbot

In der gesamten Anwendung darf **kein einziger Scrollbalken** auftauchen – weder vertikal noch horizontal. Jedes UI-Element, jede Sidebar und das Briefblatt selbst müssen sich elastisch und ohne Überlauf innerhalb der exakten Grenzen des Viewports bewegen.

### ❌ Keine Native App & Keine Browser-Erweiterung

DIN-BriefNEO wird ausschließlich als responsive, standardkonforme **Webseite / Web App (PWA)** entwickelt. Es werden unter keinen Umständen native Apps (Electron, Capacitor) oder Browser-Erweiterungen (WebExtensions) gebaut.

### ❌ Keine komplexen Server-Datenbanken

Wir verzichten auf serverseitige Datenbanken oder Speicher-APIs, die einen aktiven Serverkontext zwingend voraussetzen (wie OPFS ohne Service Worker).

### ❌ Keine externen Abhängigkeiten & CDNs (Absolute Dependency Purity)

Es dürfen keine externen CDNs, Bibliotheken, Web-Fonts (z. B. Google Fonts) oder Skripte über das Netzwerk geladen werden. Die Anwendung muss vollkommen autark und isoliert im Offline-Zustand funktionieren. Alle Ressourcen (Schriften, CSS, JS) müssen lokal im Verzeichnis liegen.

---

## 3. Die fundamentalen Gebote (DO's)

### ✅ HTML > CSS > JavaScript

Entwickelt wird streng nach dem Prinzip der absteigenden Komplexität:

1. **HTML First:** Verwendung nativer, semantischer HTML5-Elemente (z. B. `<dialog>`, `<popover>`, `contenteditable="plaintext-only"`).

2. **CSS Second:** Layouts (CSS Grid, Flexbox), Interaktionen (Checked-Tricks, native Popover-Events) und Themes werden vorrangig über CSS gelöst.

3. **JavaScript Last:** JS fungiert ausschließlich als deklarative Logik-Schicht (API-Abfragen, LocalStorage-Sync, Berechnungen).

### ✅ Lokale Persistenz rein über LocalStorage

Alle Briefentwürfe, Profileinstellungen und API-Schlüssel werden ausschließlich über die native **Web Storage API (LocalStorage)** des Browsers gesichert. Dies garantiert maximale Offline-Fähigkeit ohne Server.

### ✅ Nutzung moderner CSS-Features (Chrome 148+ Baseline)

Da die Ziel-Laufzeitumgebung Google Chrome v148+ ist, nutzen wir modernste native CSS-APIs:

- `light-dark()` zur automatischen Theme-Steuerung.

- `oklch()` für exakte, harmonische Farbräume.

- **CSS Anchor Positioning** für Tooltips und Menüs ohne JS.

- `field-sizing: content` für automatisch wachsende Eingaben ohne Scrollbars.

### ✅ Spec-First Workflow

Keine Codeänderung ohne Spezifikation. Jedes neue Feature durchläuft die Stufen:
`Specify` (Anforderung klären) ➔ `Plan` (Technologie wählen) ➔ `Tasks` (Tickets schreiben) ➔ `Implement` (Code schreiben).

### ✅ Technische Schuldenfreiheit

Jede Abweichung von den Kernprinzipien oder jede optionale Erweiterung/Abhängigkeit muss zwingend über eine MADR-konforme ADR begründet, dokumentiert und freigegeben werden. Technische Schulden sind ausgeschlossen.