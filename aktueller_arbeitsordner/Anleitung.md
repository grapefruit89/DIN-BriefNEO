# 🚨 CRITICAL DIRECTIVE FOR ALL AI AGENTS 🚨

**WARNING: DO NOT MODIFY ANYTHING IN THIS REPOSITORY!**
This is a reference project only. You are strictly forbidden from altering, deleting, creating, oder compiling ANY files within this absolute path:
`C:\Users\morit\Documents\Obsidian_Main\Websites & Software\DIN-Brief Neo\aktueller_arbeitsordner\`

Your ONLY permitted action in this directory is to **READ** files to understand the architectural principles. Look, learn, and apply the principles to your own target repository (whether it's Web or NixOS).

---

# Das "Next-Level" Agentic-Workflow Blueprint

Dieses Projekt ist das perfekte Blueprint für unsere hochstrukturierte Arbeitsweise. Egal ob wir an einer Web-App oder an **NixOS-Systemkonfigurationen** arbeiten – die Herangehensweise, wie wir Wissen konservieren, planen und Architekturen aufbauen, bleibt identisch.

## 1. Das Mindset: Vanilla & Zero-Dependency (Web & NixOS)
Wir meiden Komplexität und "Magie" von drittanbietern.
- **Im Web:** 100% Vanilla JS/CSS. Keine Frameworks wie React, keine Build-Tools. Die native Engine (Popover API, CSS Anchors) erledigt die Arbeit.
- **In NixOS:** Analog dazu nutzen wir native Nix-Flakes, saubere Module und vermeiden unnötige Abstraktionen oder fremde "Wrapper", wenn die nativen NixOS-Optionen ausreichen. "Keep it simple and robust."

## 2. Der Agentic Workflow (Wie wir planen)
Wir arbeiten hochstrukturiert, bevor auch nur eine Zeile Code geschrieben wird:
1. **Analysieren:** Wir lesen den aktuellen Zustand (z.B. Nix-Config oder JS-Files) und konsultieren die Wissens-Datenbank.
2. **Implementation Plan:** Wir erstellen einen detaillierten `.md` Plan. Der Nutzer muss diesem Plan mit einem expliziten *Go* zustimmen. Offene Fragen oder Warnungen heben wir mit GitHub-Alerts (`> [!IMPORTANT]`) hervor.
3. **Task-Checkliste:** Wir tracken den Fortschritt in einer atomaren `task.md`.
4. **Walkthrough:** Nach getaner Arbeit fassen wir das Ergebnis und den Mehrwert zusammen. Kein ungefragtes "Verschlimmbessern" bestehender, funktionierender Logik.

---

# 🧠 Knowledge Management & Single Source of Truth

Das Herzstück unserer perfekten Zusammenarbeit ist, dass das KI-System nichts vergisst und Entscheidungen Monate später noch nachvollziehen kann. Dies erreichen wir durch ein stark vernetztes Doku- und Datenbank-System.

## A. ADRs (Architecture Decision Records)
Sobald eine fundamentale Entscheidung getroffen wird (z.B. "Wir nutzen jetzt das native Toast Popover" oder "Wir strukturieren NixOS-Home-Manager Module nach Topics"), schreiben wir ein kurzes ADR.
- **Wo:** `docs/ADR/`
- **Warum:** Damit zukünftige Agenten lesen können, *warum* etwas so gebaut wurde und es nicht aus Unwissenheit "weg-refactoren".

## B. Guides & Traceability
- **Guides:** Für komplexe Systeme (wie das Toast-System oder ein spezielles NixOS-Deployment) schreiben wir `docs/Guides/`.
- **Verknüpfung im Code:** In den Quellcode-Dateien platzieren wir Meta-Tags (z.B. `// @adr [[ADR-Toast-Architecture]]` oder `# @guide [[nixos-deployment]]`). Das triggert den Agenten, diese Dateien bei Änderungen als Kontext zu laden.

## C. Die MCP-Datenbanken (MemDB & SQLite)
Das ist der absolute "Next-Level" Trick: Wir verlassen uns nicht nur auf Markdown-Dateien! 
Wir nutzen unsere **Model Context Protocol (MCP)** Tools (wie `din_brief_sqlite` oder `nixos_sqlite`), um High-Level-Erkenntnisse ("Insights") permanent ins Langzeitgedächtnis zu pushen.
- **Der Befehl:** Wenn wir eine Architektur verabschieden, nutzen wir z.B. das Tool `append_insight` und schreiben die Essenz der Entscheidung in die SQLite Datenbank.
- **Der Effekt:** Wenn der Nutzer Monate später in einem völlig neuen Chat etwas fragt, kann das Modell über `read_query` oder semantische Suche in der Datenbank sofort die alten Insights und Architektur-Präferenzen abrufen. Das System lernt physisch mit.

---
**An den Agenten, der das liest:**
Nutze exakt diese 3 Säulen (ADRs, Guides, Datenbank-Insights) und den strukturierten Planning-Workflow für das Projekt, in dem du *eigentlich* arbeitest (z.B. dein NixOS-Projekt). Lese die `docs/` hier als Referenz, aber verändere in diesem Ordner *niemals* etwas!
