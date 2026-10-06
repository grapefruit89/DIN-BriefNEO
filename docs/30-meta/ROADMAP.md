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

> **Architekturkonzept vorliegend:** Siehe `research/roadmap/MULTI_PAGE_ARCHITECTURE_SPEC.md` für die normgerechte DIN-5008-Zonierung, das horizontale Paging-Modell (Zero-Scroll) und die Druck-Architektur.

**Geklärte Punkte & Vorgaben:**

- Fachliche Trennung: Erstseite (Kopf/Anschrift/Falzmarken) vs. Folgeseite (Folgeseiten-Kopf bei 20 mm, kein Anschriftfeld/Infoblock).
- Zero-Scroll-Garantie im Editor: Horizontales Karussell / Paging-Stepper mit View Transitions API statt vertikalem Scrollen.
- Textfluss: Modell 1 (Explizite Folgeseite per Strg+Enter / Button) statt instabiler DOM-Messschleifen (A49).
- Druckarchitektur: Nativer Umbruch via `page-break-after: always; break-after: page;` und `din-a4:last-of-type { page-break-after: avoid; }`.
- Schlussblock-Integrität: Grußformel und Unterschrift wandern auf die letzte Seite (unter Beachtung der Schusterjungen-Regel).


## Priorität 2 — Adaptive Adresssuche · ✅ ERLEDIGT 2026-10-02

Die 3-Zonen-Trefferlogik aus B19 ist im Kernprodukt vollständig umgesetzt:
- mehr als fünf Treffer: Eingrenzungshinweis statt unübersichtlicher Liste;
- zwei bis fünf Treffer: fokussierbares, tastaturbedienbares Dropdown (`role=listbox`);
- genau ein sicherer Treffer: automatischer Zero-Click-Übernahmepfad.
Ein darüber hinausgehendes bidirektionales Bottom-up-Orchestrieren („Straße zuerst") wurde
zugunsten der Code-Einfachheit (KISS) verworfen. Die lokale Offline-Suche bleibt Primärquelle.

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
