---
title: Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md
status: active
tags: [documentation, roadmap, future]
---

# Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md

Dieses Dokument dient als offene Ideensammlung für zukünftige Erweiterungen von **DIN-BriefNEO**. Alle Einträge sind **unverbindlich** und befinden sich im Status des reinen Brainstormings oder wurden aufgrund architektonischer Hürden zurückgestellt. 

---

## 💡 Ideensammlung & Brainstorming

### 1. Mehrseitiges Horizontal-Karussell
*   **Beschreibung:** Ermöglicht das Schreiben von mehrseitigen Briefen, die im Editor horizontal verschoben werden (Karussell-Effekt), um vertikales Scrollen im Viewport komplett zu vermeiden.
*   **Status:** **Zurückgestellt** (Aufgeschoben in Phase 1 / Backlog).
*   **Herausforderung:** Hohe JS-Komplexität bei der Paginierung und automatischen Text-Schnittstelle. Niedrige Priorität, da 95% aller DIN 5008 Briefe auf eine Seite passen.

### 2. Nativer PDF-Export (Client-side)
*   **Beschreibung:** Erzeugung eines echten PDF-Downloads direkt im Browser (z. B. via `pdf-lib` oder `jspdf`), anstatt den System-Druckdialog nutzen zu müssen.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Größeres Datenvolumen durch Bibliotheken. Verletzt die W3C-First und Zero-Dependency Säulen, da Client-Side PDF-Erzeugung im Browser extrem komplex ist. Bevorzugt bleibt der native, wartungsfreie Druckdialog (`window.print()`) mit optimiertem CSS.

### 3. Google Places API (Adress-Autocomplete Alternative)
*   **Beschreibung:** Einbindung der Google Places API als dritter Adress-Provider in der Sidebar für weltweite Premium-Ergebnisse.
*   **Status:** **Zurückgestellt** (Antipattern).
*   **Herausforderung:** Erfordert zwingend das Laden des Google Maps JS SDKs über CDN (verletzt Säule 2 und Säule 4) sowie eine Kreditkarte bei der Registrierung. Da Geoapify und Photon kostenfrei und rein REST-basiert über `fetch` laufen, bietet Google Places keinen architektonischen Benefit.

### 4. Erweiterte Formatierungsoptionen im Markdown-Parser
*   **Beschreibung:** Ausbau des `parseMarkdown`-Moduls in `logic.js` zur nativen Unterstützung von geordneten/ungeordneten Listen, Überschriften (`#`, `##`) und Tabellen im Briefkern.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Muss penibel mit dem WhatsApp-Selection-Popover synchronisiert werden, damit sich Formatierungen nicht gegenseitig blockieren.

### 5. Offline-Service-Worker (PWA)
*   **Beschreibung:** Integration eines Service Workers (`sw.js`) zum Caching aller lokalen Assets, um die Anwendung als installierbare Progressive Web App (PWA) auf dem Desktop zu betreiben.
*   **Status:** **Zurückgestellt**.
*   **Herausforderung:** Service Worker setzen zwingend HTTPS voraus. Unter `file:///` werfen sie Browser-Sicherheitsfehler. Da das Öffnen der lokalen `index.html` per Doppelklick auch ohne Service Worker offline perfekt funktioniert (da alle Assets lokal liegen), ist der Nutzen im Vergleich zum Risiko minimal.

### 6. Sprachsteuerung & Diktat (Web Speech API)
*   **Beschreibung:** Integration der nativen `webkitSpeechRecognition`-Schnittstelle in der Sidebar, um Brieftexte per Stimme einzudiktieren.
*   **Status:** **Brainstorming**.
*   **Herausforderung:** Web Speech ist derzeit noch plattformspezifisch (funktioniert hervorragend in Chrome/Safari, gar nicht in Firefox). Zudem erfordert es eine aktive Internetverbindung zur Google/Apple-Cloud zur Spracherkennung.

---

## 🔗 Verweise
*   Siehe [longevity-guidelines.md](Guides/longevity-guidelines.md) zur Vermeidung von CDN- oder Drittanbieter-Bibliotheken bei diesen Ideen.
*   Siehe [ADR-ANTIPATTERN.md](ADR/ADR-ANTIPATTERN.md) für das strikte Verbot von CDN-Verbindungen.
