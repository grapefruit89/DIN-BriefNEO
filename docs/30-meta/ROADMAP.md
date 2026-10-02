---
id: roadmap
title: 'Roadmap — echte Zukunft des Produkts'
type: roadmap
status: active
created: '2026-07-07'
updated: '2026-10-02'
tags:
  - din-briefneo
  - din-briefneo/meta
  - status/active
  - type/roadmap
doc_links:
  - spec
  - BACKLOG
  - Feature-Matrix
  - longevity-guidelines
  - research/README
code_links:
  - website/index.html
  - website/js/43-geoapify.js
  - website/css/print.css
error_patterns:
  - roadmap
  - zukunft
  - mehrseitig
  - serienbrief
  - modernisierung
supersedes: []
depends_on: []
---

# Roadmap — echte Zukunft des Produkts

> Diese Datei beschreibt ausschließlich Vorhaben, die **noch nicht Bestandteil** des
> aktuellen Produkts sind. Der Ist-Stand steht in [[Feature-Matrix]], konkrete
> technische Arbeit in [[BACKLOG]]. Abgeschlossene Arbeiten werden hier nicht als
> Sprint-Historie wiederholt.

## Leitplanken

Neue Vorhaben müssen mit der [[spec]], dem [[Immutable-Law-Catalog]] und der
Chrome-150+-Baseline aus [[longevity-guidelines]] vereinbar sein. Research ist
Begründung und Quelle, aber keine automatische Produktanforderung.

## Priorität 1 — Mehrseitige Briefe

**Ziel:** Briefe über mehrere DIN-A4-Seiten hinweg bearbeiten, drucken und als PDF
exportieren können.

**Noch zu klären:**

- fachliche Grenze zwischen Briefkern und Folgeseite;
- Seitenumbrüche ohne unlesbare oder abgeschnittene Inhalte;
- wiederholte Kopf-/Fußbereiche und optionale Seitenzahlen;
- Darstellung mehrerer Blätter im Editor ohne ungewolltes Dokument-Scrolling;
- Persistenz, Undo/Redo und Import/Export für mehrere Seiten;
- Drucktests für Form A und Form B.

**Wichtig:** `@page`-Margin-Boxes und `counter(page)` werden erst nach dieser
Produktentscheidung geprüft. Seitenzahlen sind eine Folge der Mehrseitenarchitektur,
nicht deren Vorab-Ersatz. Umsetzung braucht eine eigene Spec unter `specs/` und ein
ADR; nicht nebenbei in `print.css` einbauen.

## Priorität 2 — Adaptive Adresssuche

Die offene B19-Arbeit aus [[BACKLOG]] wird zum produktiven Adress-UX-Ausbau:

- mehr als fünf Treffer: kein willkürliches Dropdown, sondern ein Hinweis zur
  weiteren Eingrenzung;
- zwei bis fünf Treffer: fokussierbares, tastaturbedienbares Dropdown;
- genau ein sicherer Treffer: optionaler Zero-Click-Übernahmepfad;
- Top-down- und Bottom-up-Eingabe erst nach einem stabilen Basispfad.

Die bereits vorhandene Offline-Suche bleibt Primärquelle. Geoapify bleibt optionaler
Tier-2-Dienst.

## Priorität 3 — Serienbriefe und wiederverwendbare Vorlagen

Ein späterer Serienbrief-Modus könnte mehrere Empfänger auf einen Briefentwurf
anwenden und Vorlagen speichern. Vor einer Umsetzung müssen Datenmodell, Datenschutz,
Import-/Exportformat und die Interaktion mit manuellen Overrides spezifiziert werden.

## Priorität 4 — Fachliche Erweiterungen mit echtem Nutzerwert

Diese Ideen bleiben bewusst nachrangig und werden einzeln bewertet:

- Behördenwegweiser für ausgewählte Schreiben;
- zusätzliche DIN-5008-Formen oder internationale Varianten;
- robuste Vorlagen- und Textbausteinverwaltung.

Keines dieser Themen darf die lokale Kernfunktion oder die Abwesenheit einer
Runtime-Abhängigkeit voraussetzen.

## Bewusst nicht auf dieser Roadmap

- Frameworks, Bundler und externe PDF-Bibliotheken;
- Service-Worker-/PWA-Zwang;
- vCard-QR, Sprachsteuerung und Cloud-LanguageTool;
- ungeprüfte Chrome-Features nur wegen ihrer Neuheit;
- `@page`-Seitenzahlen vor einer Mehrseitenentscheidung;
- `subgrid` als Ersatz für die bestehende IMR-Geometrie.

## Zuständigkeit

- **Produktbestand:** [[Feature-Matrix]]
- **Umsetzbare nächste Aufgaben:** [[BACKLOG]]
- **Architekturentscheidungen:** ADRs in `docs/10-architecture/`
- **Normen:** [[Immutable-Law-Catalog]]
- **Quellen und Experimente:** `research/README.md`
- **Historische Begründungen:** [[DECISION-LOG]]
