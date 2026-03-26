---
tags: [aviation-grade, platinum-2026, logic, multipage, css-147]
status: cemented
version: 1.0.0
last_audit: 2026-03-23
id: BRAIN-029-SPEC
title: Content Spiller Protokoll — Deklarative Mehrseitigkeit
supersedes: none
---

# 29 — Content Spiller Protokoll v1.0.0

## I. PROBLEMSTELLUNG
Ein DIN-Brief kann über die physische Grenze von Seite 1 (DIN A4 minus Ränder) hinauswachsen. Die Herausforderung besteht darin, diesen Überlauf OHNE JavaScript-Layout-Berechnungen (Jitter-Gefahr) zu erkennen und das UI für Folgeseiten anzupassen.

## II. DEKLARATIVE ÜBERLAUF-ERKENNUNG
Nutzung von **CSS Scroll-State Queries (Chrome 147+)** zur Detektion des Inhaltsflusses.
- **Container-Definition:** Das `#paper` Element fungiert als `@container type: size`.
- **Logic:** Ein unsichtbarer Detektor am Ende von Seite 1 prüft den `scroll-state`.
- **Zustand:** Sobald der `<din-body>` die CMA-Marke `y = 280mm` (Sicherheitsmarge) erreicht, wird der Selektor `:stuck` oder `:overflowing` aktiv.

## III. VERHALTEN VON SEITE 2+ (FOLGESETE)
Wenn der Überlauf detektiert wird, greifen folgende `@layer project.overrides` Regeln:

### §1 Briefkopf-Vaporisierung
- Auf Seite 2+ werden `<din-sender>`, `<din-note>` und `<din-recipient>` mittels `display: none` ausgeblendet.
- Die **Absender-Zweitseiten-Zeile** (Name + Seitenzahl) wird via `::before` im Header von Seite 2 eingeblendet.

### §2 Fußzeilen-Integrität
- Die Fußzeile bleibt stationär am unteren Blattrand (Fixed Position im Druck-Kontext).
- CMA-Koordinate: `bottom: 15mm`.

### §3 Margins & Flow
- Der obere Rand von Seite 2 wird auf `top: 20mm` reduziert (keine Anschriftzone mehr nötig).
- Der Textfluss wird nahtlos fortgesetzt, wobei `orphans: 3` und `widows: 3` eine typografische Mindestqualität garantieren.

## IV. VALIDIERUNG
- **Test-Szenario:** Einfügen eines 5000-Zeichen-Textes in den Body.
- **Erwartung:** Automatisches Rendering von Seite 2 ohne JS-Lag (< 16ms Frame-Time).
