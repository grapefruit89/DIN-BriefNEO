---
status: template
type: documentation
tags: [obsidian, markdown, guide]
aliases: ["Obsidian Master Template", "Markdown Guide"]
---

# Obsidian Master Template

> [!info] Über dieses Template
> Dieses Template demonstriert alle nativen Fähigkeiten von Obsidian und Markdown, die wir nutzen können, um unsere Dokumentation interaktiv, vernetzt und maschinenlesbar aufzubauen.

## 1. Dokumenten-Vernetzung (Wiki-Links)
Du kannst Dateien direkt referenzieren. Das baut den Knowledge-Graph auf:
- Link zu unserer Agent-Datei: [[AGENTS]]
- Link mit alternativem Text: [[AGENTS|Zu den Verhaltensregeln]]

## 2. Anker-Links & Überschriften-Referenzen
Wir können punktgenau auf bestimmte Sektionen innerhalb einer Datei springen:
- **Interner Anker:** Springe runter zu [[#5. Mermaid Diagramm (Architektur)]]
- **Externer Anker:** Springe zu den Karpathy-Regeln in [[AGENTS#Andrej Karpathy LLM Coding Principles]]

## 3. Einbetten von Inhalten (Embeds)
Statt nur zu verlinken, können wir den Inhalt einer anderen Datei (oder Sektion) direkt hier anzeigen lassen. 
*Beispiel: (Wenn du den # entfernst, wird der Abschnitt eingebettet)*
![[AGENTS#Andrej Karpathy LLM Coding Principles]]

Du kannst so auch PDF-Dateien, Bilder oder Code-Snippets einbinden.

## 4. Callouts & Alerts (Hervorhebungen)

> [!success] Erfolg
> Dieser Block ist perfekt für abgeschlossene Tasks oder Best-Practices.

> [!warning] Achtung
> Ideal für Architektur-Warnungen (z.B. "Diese Datei nicht manuell bearbeiten, sie wird generiert!").

> [!bug] Bug / Issue
> Nutze dies, um bekannte Fehler zu dokumentieren, die noch behoben werden müssen.

> [!quote]- Zitat (Einklappbar)
> Callouts können auch standardmäßig eingeklappt sein, indem man ein - anhängt. So bleibt die Datei übersichtlich.

## 5. Mermaid Diagramm (Architektur)
Mermaid erlaubt es uns, komplexe Abhängigkeiten und Systemarchitekturen direkt als Code zu schreiben. Obsidian rendert diese automatisch als Grafiken.

`mermaid
graph TD
    %% Styling
    classDef agent fill:#2a9d8f,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#e9c46a,stroke:#333,stroke-width:2px,color:#333;
    classDef user fill:#e76f51,stroke:#fff,stroke-width:2px,color:#fff;

    %% Nodes
    U((Du / User)):::user
    A[KI Agent]:::agent
    MD[Markdown Files]:::db
    SYS[Web App]:::db

    %% Connections
    U -->|Schreibt Prompt| A
    A -->|Liest Kontext & Regeln| MD
    A -->|Editiert Code| SYS
    MD -.->|Liefert Graph-Struktur| U
`

## 6. Code Blöcke mit Syntax Highlighting
`css
/* Eine typische CSS-Regel */
.din-comment {
    border-left: 3px solid var(--border-color);
    font-style: italic;
}
`

## 7. Checklisten & Aufgaben
- [x] Template entwerfen
- [x] YAML Frontmatter erklären
- [x] Mermaid Diagramm einbauen
- [x] In Obsidian testen

