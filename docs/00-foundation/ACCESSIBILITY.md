---
id: accessibility
title: 'Barrierefreiheits-Erklärung (Accessibility Statement)'
type: reference
status: active
created: '2026-10-25'
updated: '2026-11-09'
tags:
  - din-briefneo
  - din-briefneo/foundation
  - status/active
  - type/reference
doc_links:
  - Immutable-Law-Catalog
  - din5008
code_links: []
depends_on: []
supersedes: []
---

# Barrierefreiheits-Erklärung (Accessibility Statement)

DIN-BriefNEO verpflichtet sich zur barrierefreien und inklusiven Nutzbarkeit gemäß internationalen und nationalen Standards. Diese Erklärung beschreibt den Umsetzungsstand, die architektonischen Maßnahmen und die Konformität der Anwendung.

---

## 1. Norm-Basis & Konformitäts-Ziel

DIN-BriefNEO orientiert sich an folgenden Standards:
- **DIN 5008:2020-03:** Schreib- und Gestaltungsregeln für die Text- und Informationsverarbeitung (Form A und Form B).
- **WCAG 2.2 Level AA:** Web Content Accessibility Guidelines des W3C.
- **BITV 2.0:** Barrierefreie-Informationstechnik-Verordnung der Bundesrepublik Deutschland.

Die Anwendung zielt auf einen Lighthouse-Accessibility-Score von **100/100**.

---

## 2. Tastatur-Bedienung & Fokus-Führung

Die gesamte Applikation ist ohne Maus oder Zeigegerät vollständig bedienbar:

- **Sichtbare Fokus-Indikatoren (`:focus-visible`):**
  Alle interaktiven Steuerelemente und editierbaren Felder verfügen über einen kontrastreichen, barrierefreien Fokusring. Das Ausblenden von Fokus-Markierungen (`outline: none`) ohne Ersatz ist strikt verboten.
- **Skip-Link (Sprungmarke):**
  Das erste fokussierbare Element im Dokument ist ein direkt sichtbarer Skip-Link (`<a href="#viewport" class="skip-link">Zum Briefkern springen</a>`), der die Navigation überspringt und den Fokus direkt auf den Briefbogen lenkt.
- **Screen-Tastatur-Optimierung (`enterkeyhint` & `inputmode`):**
  Eingabefelder steuern Bildschirmtastaturen semantisch:
  - `enterkeyhint="next"`: Springt logisch zum nachfolgenden Adress- oder Textfeld.
  - `enterkeyhint="done"`: Beendet die Bearbeitung (z. B. Unterschriftsfeld).
  - `enterkeyhint="enter"`: Erlaubt Zeilenumbrüche ausschließlich im Haupttextfeld.
  - `inputmode="numeric"` auf PLZ- und IBAN-Feldern zur Einblendung der Zifferntastatur.

---

## 3. Screenreader-Unterstützung & Semantische Architektur

DIN-BriefNEO nutzt eine strikte Trennung von visueller DIN-Geometrie und semantischer Baumstruktur:

- **Normative Custom Elements (`<din-*>`):**
  Strukturblöcke tragen semantische ARIA-Rollen (`role="group"` oder `role="region"`), damit Screenreader den Briefbogen nicht als flache Textmenge, sondern als gegliederte Bereiche (Anschriftfeld, Infoblock, Betreff, Text, Grußformel, Anlagen) erfassen.
- **Deklarative Dialoge & Popover API:**
  Modale Fenster (`<dialog>`) und Ausklappmenüs (`popover="auto"`) nutzen die nativen Browser-APIs. Tastaturfokus-Trapping, Light-Dismiss (Schließen bei Klick außerhalb) und die Taste `Escape` werden vom Browser ohne fehleranfälliges JavaScript gesteuert.
- **Barrierefreie Beschriftungen:**
  Icon-Buttons tragen verbindliche, für Screenreader zugängliche `aria-label`-Attribute. Rein dekorative Grafiken und SVGs sind per `aria-hidden="true"` für assistierende Technologien ausgeblendet.

---

## 4. Farbmetrik & Kontraste (100 % OKLCH)

DIN-BriefNEO verzichtet vollständig auf den veralteten sRGB-/Hex-Farbraum zugunsten des perzeptiv gleichförmigen **OKLCH-Farbraums**:

- **Kontrastverhältnisse (WCAG AA):**
  - Fließtext und editierbare DIN-Felder: Kontrastverhältnis $\ge 4{,}5:1$ gegen den Hintergrund.
  - Grafische Bedienelemente, Fokusringe und Rahmen: Kontrastverhältnis $\ge 3:1$.
- **Automatischer Hell-/Dunkelmodus (`light-dark()`):**
  Farbwerte passen sich dem System-Farbschema des Betriebssystems an, ohne inhaltsverfälschende Filter wie `filter: invert`.
- **Druck-Isolation:**
  Beim Druck oder PDF-Export (`@media print`) werden Schattierungen und Hilfslinien automatisch deaktiviert; der Druck erfolgt in normgerechtem Tiefschwarz auf Reinweiß.

---

## 5. Bewegung & Animation

- Alle visuellen Einblendungen und Fokus-Animationen sind in `@media (prefers-reduced-motion: no-preference)` gekapselt.
- Für Nutzer mit vestibulären Einschränkungen oder reduzierter Bewegungswahrnehmung werden Transitionen und Animationen vollständig deaktiviert.

---

## 6. Feedback & Barrieren melden

Sollten Barrieren oder Mängel bei der Bedienung mit assistierenden Technologien auffallen, bitten wir um eine Rückmeldung über die GitHub Issues unseres Repositories:

👉 **[Barriere melden via GitHub Issues](https://github.com/grapefruit89/DIN-BriefNEO/issues/new?template=bug_report.md)**
