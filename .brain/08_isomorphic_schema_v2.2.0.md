---
tags: [aviation-grade, platinum-2026, architecture, chrome-146, incremental]
status: cemented
version: 2.2.0
last_audit: 2026-03-21
id: CAA-008
title: Isomorphic Master Registry — Central Architectural Authority
supersedes: 08_isomorphic_schema.md (v2.2.0 — INCIDENT-002 Korrekturdatei)
authority: SUPREME über SPEC-007, index.html, logic.js, devmode.js
traceability: [ADR-008, ADR-009, ADR-010, CAA-008, BRAIN-015]
baseline: Chrome 146+ — Sanitizer API, Anchor Positioning, Invoker Commands
---

# Isomorphic Master Registry (IMR) v2.2
## "Ein Feld — ein Key — ein Tag — eine Wahrheit"

Jedes inhaltstragende Element des DIN-Briefs existiert exakt dreimal:
  1. Als JSON-Key für die Akinator-Engine und den State
  2. Als HTML-Tag im DOM (din-* mit contenteditable="plaintext-only")
  3. Als CMA-Koordinate im @layer din.core (mm-Präzision)

Diese Datei ist die einzige Wahrheit. Abweichungen in Code sind Bugs.

ADR-008 (2026-03-20): Alle din-*-Tags tragen ausnahmslos
contenteditable="plaintext-only". Formatierungen ausschließlich via
Ghost-Mirror (din-body-mirror) — Sektion K.

ADR-009 (2026-03-20): CSS din5008-paper.css :root {} ist primäre SSoT
für CMA-Koordinaten. cma-bridge.js ist dynamischer Konsument für
Form-Toggle only. Statische initCMABridge()-Aufrufe sind Dead Code.

Chrome 146+ Update: Anchor Positioning, Sanitizer API, Invoker Commands
sind vollständig stabil. Kein @supports-Guard nötig.
IMR 4. Dimension: TAG = KEY = KOORDINATE = CSS-ANKER (Sektion L).

---

## SEKTION A: Absender-Block (Sender Zone)

| JSON-Key | HTML-Tag       | CMA-Zone        | top (mm) | left (mm) | Breite | Hinweis                 |
|----------|----------------|-----------------|----------|-----------|--------|-------------------------|
| sender   | din-sender     | SENDER_ZONE_TOP | 27.000   | 25.000    | 165mm  | DIN 5008 §5.1, einzeilig|

---

## SEKTION B: Anschriftzone (85x45mm Hard Constraint)

| JSON-Key  | HTML-Tag       | CMA-Zone      | top (mm)    | left (mm) | Breite | Hinweis                   |
|-----------|----------------|---------------|-------------|-----------|--------|---------------------------|
| note      | din-note       | ADDRESS_TOP_B | 45.000      | 25.000    | 85mm   | Erste 17.7mm (5 Zeilen)   |
| recipient | din-recipient  | ADDRESS_TOP_B | 45.000+17.7 | 25.000    | 85mm   | Restliche 27.3mm (6 Zeilen)|

---

## SEKTION C: Informationsblock (Aviation Grade 97.4mm)

| JSON-Key | HTML-Tag      | CMA-Zone       | top (mm) | left (mm) | Breite | Hinweis               |
|----------|---------------|----------------|----------|-----------|--------|-----------------------|
| date     | din-date      | INFO_BLOCK_TOP | 97.400   | 120.000   | 75mm   | *** AVIATION GRADE ***|
| your_ref | din-your-ref  | INFO_BLOCK_TOP | 97.400   | 25.000    | 44mm   | "Ihr Zeichen"         |
| our_ref  | din-our-ref   | INFO_BLOCK_TOP | 97.400   | 70.000    | 44mm   | "Unser Zeichen"       |

---

## SEKTION D: Betreff-Zone (Aviation Grade 103.4mm)

| JSON-Key | HTML-Tag    | CMA-Zone    | top (mm) | left (mm) | Breite | Hinweis                       |
|----------|-------------|-------------|----------|-----------|--------|-------------------------------|
| subject  | din-subject | SUBJECT_TOP | 103.400  | 25.000    | 165mm  | *** AVIATION GRADE ***; bold  |

---

## SEKTION E: Textbereich (Body Zone)

| JSON-Key   | HTML-Tag        | CMA-Zone         | top (mm)  | left (mm) | Breite | Hinweis                          |
|------------|-----------------|------------------|-----------|-----------|--------|----------------------------------|
| salutation | din-salutation  | nach SUBJECT_TOP | ~113.000  | 25.000    | 165mm  | CSS rendert via data-gender      |
| body       | din-body        | dynamisch        | ~120.000  | 25.000    | 165mm  | plaintext-only + Ghost-Mirror(K) |
| greeting   | din-greeting    | dynamisch        | FOOTER-x  | 25.000    | 165mm  | DIN: kein Komma/Punkt am Ende    |
| signature  | din-signature   | FOOTER_TOP       | 269.000   | 25.000    | 165mm  | 3-Leerzeilen-Gap davor (12.7mm)  |

TOMB-L008 (ADR-008): body war als "HTML-fähig" dokumentiert — FALSCH und BEGRABEN.
din-body trägt contenteditable="plaintext-only". textContent ist IMMER die SSoT.
Formatierungen via Ghost-Mirror. Kein innerHTML für User-Content.

---

## SEKTION F: Profil / Absender-Stammdaten

| JSON-Key       | HTML-Input-ID | Typ   | Validation                      | Hinweis             |
|----------------|---------------|-------|---------------------------------|---------------------|
| author_company | p-company     | text  | —                               | Firma/Organisation  |
| author_name    | p-name        | text  | —                               | Vollständiger Name  |
| author_street  | p-street      | text  | —                               | Straße + Hausnr.    |
| author_zip     | p-zip         | text  | pattern="[0-9]{5}"              | 5-stellige PLZ      |
| author_city    | p-city        | text  | —                               | Ortsname            |
| author_phone   | p-phone       | tel   | pattern="[\d\s\+\-\(\)]{7,20}"  | Telefon             |
| author_email   | p-email       | email | type="email" (nativ)            | E-Mail-Adresse      |
| author_iban    | p-iban        | text  | IBAN-Modulo-97 (JS, Tier-0)     | ghostIBAN-Overlay   |

---

## SEKTION G: Konfigurations-Keys (DOM-State, nicht im JSON-Export)

| Config-Key     | data-Attribut am #paper | Werte                      | Hinweis                      |
|----------------|-------------------------|----------------------------|------------------------------|
| layout         | data-layout             | form-a / form-b            | CSS @layer project.overrides |
| guides         | data-guides             | true / false               | CSS fold-mark Sichtbarkeit   |
| formality      | data-formality          | formal / polite / casual   | Anrede-Matrix-Selektor       |
| recipient_type | data-recipient-type     | none / male / female       | Überschreibt Gender-Erkennung|
| date_format    | data-date-format        | de / long / iso            | Datumsformat                 |

---

## SEKTION H: Akinator-Engine JSON-Schema (SPEC-038)

Kanonisches Schema. Leere Felder = null — explizit, nie weglassen.

```json
{
  "sender": null, "note": null, "recipient": null,
  "date": null, "your_ref": null, "our_ref": null,
  "subject": null, "salutation": null, "body": null,
  "greeting": null, "signature": null,
  "author_company": null, "author_name": null,
  "author_street": null, "author_zip": null, "author_city": null,
  "author_phone": null, "author_email": null, "author_iban": null
}
```

Mapping-Regel: tag.slice(4).replace(/-/g, '_') → JSON-Key.
readDOMasJSON() liest IMMER textContent (ADR-008, TOMB-L008).

---

## SEKTION I: CMA-Koordinaten-Referenz

| CMA-Konstante   | mm-Wert | CSS-Variable        | JSON-Keys            |
|-----------------|---------|---------------------|----------------------|
| SENDER_ZONE_TOP |  27.000 | --sender-zone-top   | sender               |
| ADDRESS_TOP_B   |  45.000 | --address-top       | note, recipient      |
| ADDRESS_TOP_A   |  27.000 | --margin-top-a      | note, recipient (A)  |
| INFO_BLOCK_TOP  |  97.400 | --info-block-top    | date, your_ref, our_ref |
| SUBJECT_TOP     | 103.400 | --subject-top       | subject              |
| FOOTER_TOP      | 269.000 | --footer-top        | signature            |
| ADDRESS_WIDTH   |  85.000 | --address-width     | note, recipient      |
| ADDRESS_HEIGHT  |  45.000 | --address-height    | (Container)          |
| MARGIN_LEFT     |  25.000 | --margin-left       | alle Zonen           |
| MARGIN_RIGHT    |  20.000 | --margin-right      | textbereich right    |

ADR-009: Primäre SSoT ist css/din5008-paper.css :root {}.
constants.js CMA ist sekundär — nur für JS-Berechnungen (px-Konversion).

---

## SEKTION J: data-cma-* Attribute (IMR 2.1 — Typed attr() Zukunftsspeicher)

Zweck: Vorbereitung für CSS Values Level 5 (Typed attr()) — Tier-3, ~Chrome 150.
Status: HEUTE schreiben — harmlos (CSS ignoriert), additiv, kein Breaking Change.

Wenn Typed attr() GA: din-subject { top: attr(data-cma-top type(<length>)); }
Bis dahin: css/din5008-paper.css :root {} ist SSoT (ADR-009).

| HTML-Tag       | data-cma-top | data-cma-left | data-cma-width | Hinweis                   |
|----------------|-------------|---------------|----------------|---------------------------|
| din-sender     | 27mm        | 25mm          | 165mm          | Einzeilig                 |
| din-note       | 45mm        | 25mm          | 85mm           | Relativ im Container      |
| din-recipient  | 62.7mm      | 25mm          | 85mm           | 45mm + 17.7mm Vermerkzone |
| din-date       | 97.4mm      | 120mm         | 75mm           | *** AVIATION GRADE ***    |
| din-your-ref   | 97.4mm      | 25mm          | 44mm           | Linke Infospalte          |
| din-our-ref    | 97.4mm      | 70mm          | 44mm           | Mittlere Infospalte       |
| din-subject    | 103.4mm     | 25mm          | 165mm          | *** AVIATION GRADE ***    |
| din-salutation | 113mm       | 25mm          | 165mm          | Dynamisch nach Betreff    |
| din-body       | dynamisch   | 25mm          | 165mm          | Flow — kein festes top    |
| din-greeting   | dynamisch   | 25mm          | 165mm          | Flow — kein festes top    |
| din-signature  | 269mm       | 25mm          | 165mm          | *** AVIATION GRADE ***    |

Warum "dynamisch" für body/greeting:
Beide Felder fließen nach dem Brieftext. top: attr(...) nur sinnvoll bei
festen Koordinaten. Flow-Positionen bleiben CSS position:relative-Sache.

Migrations-Checkliste (wenn Typed attr() GA):
1. data-cma-* sind bereits am Tag ← dieser Schritt (heute)
2. @layer din.core: Tag-Selektoren auf attr(data-cma-top type(<length>)) umstellen
3. @supports als Guard (bis vollständige Baseline)
4. initCMABridge() löschen (bereits Dead Code per ADR-009)
5. cma-bridge.js Datei löschen, Import in app.js entfernen

---

## SEKTION K: Ghost-Mirror — Zero-Width-Marker Pattern (ADR-008)

### Was der Ghost-Mirror ist

  din-body contenteditable="plaintext-only"   ← SSoT, immer Plaintext
  din-body-mirror aria-hidden="true"          ← Nur Visualisierung

### Zero-Width-Marker — display: none im Druckfall

Markdown-Marker in din-body werden im Druck platzneutral entfernt:

  @media print {
    din-body        { display: none !important; }
    din-body-mirror { display: block !important; }
    .md-marker      { display: none !important; }
  }

display: none (nicht visibility: hidden) — platzneutral, kein Leerraum.
Marker wie span.md-marker um ** herum verschwinden ohne Layout-Spur.

### Screen-State-Maschine

  State 1 (Tippen, fokussiert):
    din-body: sichtbar | mirror: opacity:0 | .md-marker: sichtbar

  State 2 (Lesen, kein Fokus):
    din-body: opacity:0 | mirror: opacity:1 | .md-marker: irrelevant

  State 3 (Print):
    din-body: display:none | mirror: display:block | .md-marker: display:none

Invariante: din-body.textContent = IMMER Datenquelle.
readDOMasJSON() liest NIEMALS din-body-mirror.

### Erlaubte Markdown-Syntax + Sanitizer Whitelist

| Syntax       | Gerendert als  | Platzneutral |
|--------------|----------------|--------------|
| **fett**     | strong         | Ja           |
| *kursiv*     | em             | Ja           |
| ~~gestrichen | del            | Ja           |
| `code`       | code           | Ja           |
| > Zitat      | blockquote     | Ja           |
| - Liste      | ul > li        | Ja           |
| 1. Liste     | ol > li        | Ja           |
| \n\n         | br br          | Ja — kein Marker|

Ghost-Mirror Sanitization via Sanitizer API (Chrome 146+ Baseline):
element.setHTML(html, { sanitizer: new Sanitizer({
  allowElements: ['strong','em','del','code','blockquote','ul','ol','li','br']
}) })

---

## SEKTION L: IMR 4. Dimension — CSS Anchor Positioning (Chrome 146+)

NEU in v2.2. Referenz: BRAIN-015 Block C.

Das Drei-Einheits-Prinzip wird zur Vier-Einheit:

  TAG = JSON-KEY = CMA-KOORDINATE = CSS-ANKER

Jeder din-*-Tag erhält anchor-name: --din-[key]:

| HTML-Tag       | anchor-name          | Nutzen                              |
|----------------|----------------------|-------------------------------------|
| din-sender     | --din-sender         | Tooltip für Rücksendezeile          |
| din-subject    | --din-subject        | "Betreff zu lang"-Hinweis           |
| din-greeting   | --din-greeting       | "Kein Satzzeichen"-Validierung      |
| din-body       | --din-body           | Markdown-Cheatsheet Popover         |
| din-date       | --din-date           | Datumsformat-Tooltip                |
| din-signature  | --din-signature      | Signatur-Hinweis                    |

Prinzip:
  din-subject { anchor-name: --din-subject; }
  .subject-hint { position-anchor: --din-subject; left: anchor(right); }

Kein getBoundingClientRect. Kein JS-Positions-Rechner. CSS-only.

---

## SEKTION M: latex.css Audit (ADR-010 Entscheidung)

Durchgeführt: 2026-03-21 via Context7.

### Befund

latex.css (der bekannte LaTeX-Typografie-Stylesheet von vincent/latex.css)
verwendet konsequent relative Einheiten:
- font-size auf html/body in rem/em
- line-height als dimensionsloser Faktor (1.4, 1.5)
- margin/padding in em
- Schrift-Stacks auf Latin Modern / Computer Modern

Kernkonflikt mit DIN-BriefNEO:
latex.css setzt globale body/html-Resets die in UNSERE CMA-Variablen
kaskadieren würden, wenn diese in pt ausgedrückt sind. Konkret:
--font-size-body: 11pt würde durch einen latex.css body { font-size: 10pt }
reset überschrieben, wenn latex.css nach unseren Regeln geladen wird.

### Entscheidung: Pattern Mining, KEIN Full Import

Full Import = NEIN. Begründung:
latex.css greift global auf html, body, p, h1-h6 zu.
Ein @import in @layer latex.base würde die Kaskade zähmen,
aber latex.css' Resets wären immer noch sichtbar im latex.base-Layer.
Das ist nicht schädlich wenn @layer latex.base UNTERHALB von din.core liegt,
aber es erzeugt überflüssige Komplexität — Regeln die nichts tun außer overridden werden.

Safe Extracts (Pattern Mining):

  1. Hyphenation-Regeln (kein Konflikt, reine Text-Property):
     hyphens: auto;
     hyphenate-limit-chars: 6 3 2;
     text-align: justify; (nur in @layer ui.theme für body-Text)

  2. Font-Rendering (kein Layout-Impact):
     text-rendering: optimizeLegibility;
     font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
     font-kerning: normal;

  3. Schrift-Stack (in --font-paper Variable eintragen):
     'Latin Modern', 'Computer Modern', 'Libertinus Serif', ...
     Als optionaler Fallback in typography.css wenn Schriften lokal vorhanden.

Was wir NICHT extrahieren:
- body/html Margins, Padding, font-size Resets
- h1-h6 Größen-Hierarchien (DIN-Briefe haben keine Überschriften-Hierarchie)
- page-Margins (DIN 5008 definiert diese präzise in mm, nicht in em)

Implementation-Pfad:
@layer latex.base enthält nur die 3 Safe-Extracts.
@layer din.core bleibt unberührt und hat Priorität über latex.base.
latex.base deklaration steht ZUERST in der Layer-Reihenfolge:

  @layer latex.base, din.core, ui.theme, project.overrides;
