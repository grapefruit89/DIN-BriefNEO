---
id: doc-index-root
title: DIN-BriefNEO OmniTraceability
type: root
status: active
doc_links:
  - "[[OmniTraceability]]"
  - "[[Function-Traceability]]"
  - "[[core/spec]]"
code_links: []
tags:
  - root
  - wiki
---

# 🚀 DIN-BriefNEO: OmniTraceability Hub

Willkommen in der Single Source of Truth (SSoT) des DIN-BriefNEO Projekts. 
Dieses Wiki dient als maschinenlesbarer Navigator durch die Architektur, Spezifikationen und Entscheidungen des Projekts. Es ist das Fundament für unsere kompromisslose Traceability und die Schnittstelle zwischen Mensch (Obsidian) und Maschine (LLM & SQLite).

## 🧭 Kernnavigation

### Das Fundament
- **[[OmniTraceability]]**: Die Systemarchitektur der lückenlosen Nachverfolgbarkeit. Hier erfährst du, wie der Lebenszyklus unserer Software funktioniert und wie du das System langfristig wartest.
- **[[Function-Traceability]]**: Das automatisierte Code-zu-Dokumentation Mapping. Die Matrix, die unsere Code-Base zusammenhält.

### Die Umsetzung
- **[Architektur-Entscheidungen (ADRs)](10-architecture/ADR/ADR-ÜBERSICHT.md)**: Alle verbindlichen Architektur-Regeln. Das "Warum".
- **[Guides & Manuals](20-implementation/Guides/GUIDE-TEMPLATE.md)**: Technische Leitfäden zur Umsetzung (z.B. CSS, Geometry). Das "Wie".
- **[[core/spec]]**: Die unumstößlichen funktionalen und fachlichen Anforderungen an die DIN 5008. Das "Was".

---

## 🧠 Für KI-Agenten (System-Prompt)

> [!TIP]
> Dieses System nutzt bidirektionale Traceability. Es ist dir als KI-Agent **strikt untersagt**, Feature-Branches zu erstellen. Wir arbeiten **branchless auf `main`**.
> 
> Wenn du Code-Dateien in `website/` modifizierst, konsultiere **zwingend** die in der Datei verlinkten ADRs und Guides über die `[[Wikilinks]]` in den Header-Kommentaren. Das Frontmatter dieses Wikis wird nächtlich in eine SQLite-Vektordatenbank kompiliert und muss streng formatiert bleiben. Niemals das Frontmatter-Schema verändern!
