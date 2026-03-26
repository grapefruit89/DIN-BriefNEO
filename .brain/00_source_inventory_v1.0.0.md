---
tags: [aviation-grade, platinum-2026, source-mapping, inventory]
status: cemented
version: 1.0.0
last_audit: 2026-03-23
id: BRAIN-000-INV
title: Source Inventory — Mapping the Knowledge Shredder Inputs
---

# 00 — Source Inventory v1.0.0

Diese Tabelle gibt eine Übersicht über alle Dokumente im Ordner `.\quellen` und deren architektonischen Nutzwert für das Projekt DIN-BriefNEO.

| Dateiname | Typ | Inhaltlicher Fokus | Arch. Wert | Notiz |
|:---|:---|:---|:---|:---|
| Briefvorlage.html | HTML | Interaktive Briefvorlage | Low | Nutzt Bootstrap & JS-Hacks (Legacy). Gut für Feldnamen. |
| Gemini-Legacy...md | MD | Migration-Spec | High | Basis für SDD-Workflow und IMR-Logik. |
| latex.pdf | PDF | LaTeX Dokumentation | Medium | Inspiration für `latex.base` Layer (Typografie). |
| readme (1).md | MD | CSS Framework Liste | Medium | Übersicht über Pico/Beer CSS (Extract Candidates). |
| HTML_&_CSS_für_Dummies_... | PDF | Grundlagen | Low | Standardwissen, wenig für Aviation-Grade Spezialisierung. |
| Wolf, Jürgen - HTML5... | EPUB | Handbuch | Medium | Umfassendes Nachschlagewerk für native Web-APIs. |
| Peter Müller - Einstieg... | PDF | Responsive Design | Medium | Barrierefreiheit & Grid-Grundlagen. |
| Beer CSS | Info | UI Framework | High | Vorlage für `ui.theme` (Material Design Extract). |
| Pico.css | Info | Classless CSS | High | Vorlage für `ui.theme` (Aria-Invalid/Dialog Extracts). |

## Scouting Ergebnisse: Anti-Pattern Check

Folgende Muster aus den Quellen wurden als **DO NOT ADAPT** markiert (Cemetery of Ideas):

1. **Bootstrap/Grid-Klassen (Briefvorlage.html)**: Widerspricht ADR-002 (Layer-Architektur) und ADR-001 (Framework-Vermeidung).
2. **Inline Script Event-Listener (Briefvorlage.html)**: Widerspricht §1 Constitution (Technologische Hierarchie).
3. **Pixel-basierte Layouts (Diverse Dummies-PDFs)**: Widerspricht MANDATE-VEC (Vektor-Only Policy).

## Nächste Schritte: Integration in Blueprint
- Extraktion von mathematischen `text-box-trim` Ansätzen aus modernen CSS-Artikeln (falls vorhanden).
- Übernahme von `cap-height` basierten Alignment-Strategien in `03_technical_blueprint_v1.3.1.md`.
