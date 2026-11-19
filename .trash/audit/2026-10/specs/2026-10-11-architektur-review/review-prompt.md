---
id: review-prompt-2026-10-11
title: 'DIN-BriefNEO: Architektur-Review Prompt'
type: meta
status: archived
created: '2026-10-11'
updated: '2026-10-11'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/archived
  - type/meta
doc_links: []
code_links: []
depends_on: []
---

Du bist ein erfahrener Principal Frontend Architect mit Spezialisierung auf moderne, framework-freie Web-Plattform-Architektur (Vanilla JS, Web Components / Custom Elements, native Browser-APIs).

Ich habe ein Tool namens „DIN-BriefNEO“ gebaut – einen reinen clientseitigen, datenschutzfreundlichen Brief-Editor nach DIN 5008. Die Anwendung läuft komplett ohne Frameworks (kein React, kein Vite, kein Tailwind) und setzt radikal auf native Browser-Standards (Chromium 130+, CSS Container Queries, Popover API, light-dark(), Temporal API, DecompressionStream, strikte CSP).

### Das Problem:
Mein Code funktioniert zwar, fühlt sich aber architektonisch nach „Gefrickel“ an:
1. Module sind über direkte Callbacks (onSaveDraft, onToast) in main.js eng gekoppelt.
2. Der Zustand (State) lebt direkt im DOM (contenteditable-Knoten) und wird von überall manipuliert.
3. Dateien wie address-intelligence vermischen reine Fachlogik (PLZ-Maps/gzip) mit DOM-Manipulation und Rendering.
4. Es gibt historisch gewachsene Dateipräfixe (01-*, 41-*, 51-*).

### Mein architektonisches Ziel:
Ich möchte das Projekt in eine saubere, entkoppelte **Event-Driven Service-Architektur (In-Browser Microservices / Pub-Sub)** umbauen:
- **Zero-Dependency & Zero-Framework-Garantie:** Es soll kein Framework und kein Node/npm-Runtime-Zwang eingeführt werden. Alles bleibt reines HTML, CSS und ES-Module.
- **Entkopplung über EventBus:** Module dürfen sich nicht gegenseitig importieren oder Callbacks durchreichen. Kommunikation läuft rein über typisierte CustomEvents (Pub/Sub).
- **Separation of Concerns:** Strikte Trennung von Daten-/Rechenlogik (Pure Functions), State-Management und DOM-Adaptern.
- **Sauberes Zustandsmodell:** Klare Trennung zwischen Dokument-Zustand (Brieftexte, Form A/B, Signatur -> in .json exportierbar) und App-Einstellungen (Theme, API-Keys, Guides -> globaler LocalStorage).

### Deine Aufgabe:
Analysiere den beigefügten Code und liefere mir:
1. **Ziel-Dateistruktur:** Einen konkreten, modernen Ordnerbaum (ohne die alten Zahlen-Präfixe wie 01-*, 45-*).
2. **Event-Bus & Schnittstellen-Katalog:** Die Spezifikation aller Events (Topic-Namen und Payload-Objekte), über die die Services miteinander sprechen (z. B. DocumentService, ToastService, AddressService, SalutationService).
3. **Refactoring-Blaupause:** Zeige an 2–3 konkreten Services (z. B. AddressService und ToastService), wie der Code vorher vs. nachher aussieht.
4. **Schritt-für-Schritt-Migrationsplan:** Wie baue ich das System iterativ um, ohne die bestehende Funktionalität zu zerstören?