---
aliases:
- ROADMAP
code_links: []
created: '2026-07-07'
depends_on: []
doc_links: []
id: roadmap
status: active
tags:
- obsidian
- core
- documentation
- roadmap
- future
title: 'Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md'
type: roadmap
updated: '2026-07-07'
---

# Zukunfts-Roadmap (Lose Zukunftsplanungen): ROADMAP.md

Dieses Dokument dient als offene Ideensammlung fÃ¼r zukÃ¼nftige Erweiterungen von **DIN-BriefNEO**. Alle EintrÃ¤ge sind **unverbindlich** und befinden sich im Status des reinen Brainstormings oder wurden aufgrund architektonischer HÃ¼rden zurÃ¼ckgestellt. 

---

## ðŸ’¡ Ideensammlung & Brainstorming

### 1. Mehrseitiges Horizontal-Karussell

*   **Beschreibung:** ErmÃ¶glicht das Schreiben von mehrseitigen Briefen, die im Editor horizontal verschoben werden (Karussell-Effekt), um vertikales Scrollen im Viewport komplett zu vermeiden.

*   **Status:** **ZurÃ¼ckgestellt** (Aufgeschoben in Phase 1 / Backlog).

*   **Herausforderung:** Hohe JS-KomplexitÃ¤t bei der Paginierung und automatischen Text-Schnittstelle. Niedrige PrioritÃ¤t, da 95% aller DIN 5008 Briefe auf eine Seite passen.

### 2. Nativer PDF-Export (Client-side)

*   **Beschreibung:** Erzeugung eines echten PDF-Downloads direkt im Browser (z. B. via `pdf-lib` oder `jspdf`), anstatt den System-Druckdialog nutzen zu mÃ¼ssen.

*   **Status:** **Brainstorming**.

*   **Herausforderung:** GrÃ¶ÃŸeres Datenvolumen durch Bibliotheken. Verletzt die W3C-First und Zero-Dependency SÃ¤ulen, da Client-Side PDF-Erzeugung im Browser extrem komplex ist. Bevorzugt bleibt der native, wartungsfreie Druckdialog (`window.print()`) mit optimiertem CSS.

### 3. Google Places API (Adress-Autocomplete Alternative)

*   **Beschreibung:** Einbindung der Google Places API als dritter Adress-Provider in der Sidebar fÃ¼r weltweite Premium-Ergebnisse.

*   **Status:** **ZurÃ¼ckgestellt** (Antipattern).

*   **Herausforderung:** Erfordert zwingend das Laden des Google Maps JS SDKs Ã¼ber CDN (verletzt SÃ¤ule 2 und SÃ¤ule 4) sowie eine Kreditkarte bei der Registrierung. Da Geoapify und Photon kostenfrei und rein REST-basiert Ã¼ber `fetch` laufen, bietet Google Places keinen architektonischen Benefit.

### 4. Erweiterte Formatierungsoptionen im Markdown-Parser

*   **Beschreibung:** Ausbau des `parseMarkdown`-Moduls in `logic.js` zur nativen UnterstÃ¼tzung von geordneten/ungeordneten Listen, Ãœberschriften (`#`, `##`) und Tabellen im Briefkern.

*   **Status:** **Brainstorming**.

*   **Herausforderung:** Muss penibel mit dem WhatsApp-Selection-Popover synchronisiert werden, damit sich Formatierungen nicht gegenseitig blockieren.

### 5. Offline-Service-Worker (PWA)

*   **Beschreibung:** Integration eines Service Workers (`sw.js`) zum Caching aller lokalen Assets, um die Anwendung als installierbare Progressive Web App (PWA) auf dem Desktop zu betreiben.

*   **Status:** **ZurÃ¼ckgestellt**.

*   **Herausforderung:** Service Worker setzen zwingend HTTPS voraus. Unter `file:///` werfen sie Browser-Sicherheitsfehler. Da das Ã–ffnen der lokalen `index.html` per Doppelklick auch ohne Service Worker offline perfekt funktioniert (da alle Assets lokal liegen), ist der Nutzen im Vergleich zum Risiko minimal.

### 6. Sprachsteuerung & Diktat (Web Speech API)

*   **Beschreibung:** Integration der nativen `webkitSpeechRecognition`-Schnittstelle in der Sidebar, um Brieftexte per Stimme einzudiktieren.

*   **Status:** **Brainstorming**.

*   **Herausforderung:** Web Speech ist derzeit noch plattformspezifisch (funktioniert hervorragend in Chrome/Safari, gar nicht in Firefox). Zudem erfordert es eine aktive Internetverbindung zur Google/Apple-Cloud zur Spracherkennung.

---

## ðŸ”— Verweise

*   Siehe [[longevity-guidelines|longevity-guidelines.md]] zur Vermeidung von CDN- oder Drittanbieter-Bibliotheken bei diesen Ideen.

*   Siehe [[ADR-ANTIPATTERN|ADR-ANTIPATTERN.md]] fÃ¼r das strikte Verbot von CDN-Verbindungen.

- [ ] **Client-Side AI Integration**: API Key Eingabe via Settings-Modal (gespeichert in localStorage). Direkte Anbindung an OpenAI/Anthropic/Gemini via 

etch für Text-Expansion, Tonfall-Änderung und Rechtschreibkorrektur.

### 4. LLM-Features in der App (Zauberstab / Roter Faden)

*   **Beschreibung:** API-Keys im LocalStorage speichern und direkt im Dev-Sidebar oder im UI Buttons anbieten, um den Text per Knopfdruck 'frmlich zu formulieren' oder 'Fllwrter zu entfernen'.

*   **Status:** **Geplant** (Auf Wunsch von Moritz fr zuknftige Diskussion aufgenommen).

*   **Herausforderung:** LLM-Client (OpenAI/Gemini) in Vanilla JS schreiben, ohne dass die Bundle-Size explodiert oder npm-Pakete ntig werden. Sichere Aufbewahrung der API-Keys im Browser.