---
tags: [aviation-grade, platinum-2026, spec-kit, architecture, imr]
status: SUPERSEDED
superseded_by: 08_isomorphic_schema_v2.2.0.md
version: 2.2.0-LEGACY
last_audit: 2026-03-20
id: CAA-008
title: Isomorphic Master Registry [SUPERSEDED — Nicht verwenden]
authority: NONE — Nachfolger 08_isomorphic_schema_v2.2.0.md hat Autorität
traceability: [BRAIN-017-K001]
warning: Fehlt Sektion L (Anchor Positioning 4. Dimension) und Sektion M (latex.css ADR-010)
---

> ⛔ **SUPERSEDED — NICHT VERWENDEN**
> Diese Datei ist veraltet. Der Nachfolger ist **08_isomorphic_schema_v2.2.0.md**.
> Fehlende Sektionen: **L** (CSS Anchor Positioning — IMR 4. Dimension) und **M** (latex.css ADR-010).
> Nicht für LLM-Prompts, Akinator-Sessions oder Architektur-Entscheidungen verwenden.
> Befund: BRAIN-017 K-001 | Integrity Report 2026-03-21

---

# Isomorphic Master Registry (IMR) [SUPERSEDED]
## "Ein Feld — ein Key — ein Tag — eine Wahrheit"

Jedes inhaltstragende Element des DIN-Briefs existiert exakt dreimal:
  1. Als **JSON-Key** für die Akinator-Engine und den State
  2. Als **HTML-Tag** im DOM (`<din-*>` mit `contenteditable="plaintext-only"`)
  3. Als **CMA-Koordinate** im `@layer din.core` (mm-Präzision)

Diese Datei ist die einzige Wahrheit. Abweichungen in Code sind Bugs.

**ADR-008 (2026-03-20):** Alle `<din-*>`-Tags tragen ausnahmslos
`contenteditable="plaintext-only"`. Formatierungen werden ausschließlich
über den Ghost-Mirror (`<din-body-mirror>`) visualisiert — Sektion K.

**ADR-009 (2026-03-20):** CSS `din5008-paper.css :root {}` ist die primäre
SSoT für CMA-Koordinaten. `cma-bridge.js` ist dynamischer Konsument für
Form-Toggle only. Statische `initCMABridge()`-Aufrufe sind Dead Code.

---

## SEKTION A: Absender-Block (Sender Zone)

| JSON-Key | HTML-Tag | CMA-Zone | top (mm) | left (mm) | Breite | Hinweis |
|---|---|---|---|---|---|---|
| `sender` | `<din-sender>` | SENDER_ZONE_TOP | 27.000 | 25.000 | 165mm | DIN 5008 §5.1, einzeilig |

---

## SEKTION B: Anschriftzone (85×45mm Hard Constraint)

| JSON-Key | HTML-Tag | CMA-Zone | top (mm) | left (mm) | Breite | Hinweis |
|---|---|---|---|---|---|---|
| `note` | `<din-note>` | ADDRESS_TOP_B | 45.000 | 25.000 | 85mm | Erste 17.7mm (5 Zeilen) |
| `recipient` | `<din-recipient>` | ADDRESS_TOP_B | 45.000+17.7 | 25.000 | 85mm | Restliche 27.3mm (6 Zeilen) |

---

## SEKTION C: Informationsblock (Aviation Grade 97.4mm)

| JSON-Key | HTML-Tag | CMA-Zone | top (mm) | left (mm) | Breite | Hinweis |
|---|---|---|---|---|---|---|
| `date` | `<din-date>` | INFO_BLOCK_TOP | 97.400 | 120.000 | 75mm | *** AVIATION GRADE *** |
| `your_ref` | `<din-your-ref>` | INFO_BLOCK_TOP | 97.400 | 25.000 | 44mm | "Ihr Zeichen" |
| `our_ref` | `<din-our-ref>` | INFO_BLOCK_TOP | 97.400 | 70.000 | 44mm | "Unser Zeichen" |

---

## SEKTION D: Betreff-Zone (Aviation Grade 103.4mm)

| JSON-Key | HTML-Tag | CMA-Zone | top (mm) | left (mm) | Breite | Hinweis |
|---|---|---|---|---|---|---|
| `subject` | `<din-subject>` | SUBJECT_TOP | 103.400 | 25.000 | 165mm | *** AVIATION GRADE ***; font-weight: bold |

---

## SEKTION E: Textbereich (Body Zone)

| JSON-Key | HTML-Tag | CMA-Zone | top (mm) | left (mm) | Breite | Hinweis |
|---|---|---|---|---|---|---|
| `salutation` | `<din-salutation>` | nach SUBJECT_TOP | ~113.000 | 25.000 | 165mm | CSS rendert via data-gender |
| `body` | `<din-body>` | dynamisch | ~120.000 | 25.000 | 165mm | **plaintext-only** + Ghost-Mirror (Sektion K) |
| `greeting` | `<din-greeting>` | dynamisch | FOOTER-x | 25.000 | 165mm | DIN: kein Komma/Punkt am Ende |
| `signature` | `<din-signature>` | FOOTER_TOP | 269.000 | 25.000 | 165mm | 3-Leerzeilen-Gap davor (12.7mm) |

**Korrektur zu früheren Versionen:** `body` war als "HTML-fähig" dokumentiert.
Das ist nach ADR-008 FALSCH und BEGRABEN (TOMB-L008).
`<din-body>` trägt `contenteditable="plaintext-only"`. textContent ist IMMER die SSoT.
Markdown-Syntax wird im Body gespeichert und durch den Ghost-Mirror visualisiert.

---

## SEKTION F: Profil / Absender-Stammdaten (nicht auf Papier sichtbar)

| JSON-Key | HTML-Input-ID | Typ | Validation | Hinweis |
|---|---|---|---|---|
| `author_company` | `p-company` | text | — | Firma / Organisation |
| `author_name` | `p-name` | text | — | Vollständiger Name |
| `author_street` | `p-street` | text | — | Straße + Hausnummer |
| `author_zip` | `p-zip` | text | `pattern="[0-9]{5}"` | 5-stellige PLZ |
| `author_city` | `p-city` | text | — | Ortsname |
| `author_phone` | `p-phone` | tel | `pattern="[\d\s\+\-\(\)]{7,20}"` | Telefon |
| `author_email` | `p-email` | email | `type="email"` (nativ) | E-Mail-Adresse |
| `author_iban` | `p-iban` | text | IBAN-Modulo-97 (JS, Tier-0) | ghostIBAN-Overlay |

---

## SEKTION G: Konfigurations-Keys (nicht im JSON-Export, nur DOM-State)

| Config-Key | data-Attribut am `#paper` | Werte | Hinweis |
|---|---|---|---|
| layout | `data-layout` | `form-a` \| `form-b` | CSS @layer project.overrides |
| guides | `data-guides` | `true` \| `false` | CSS fold-mark Sichtbarkeit |
| formality | `data-formality` | `formal` \| `polite` \| `casual` | Anrede-Matrix-Selektor |
| recipient_type | `data-recipient-type` | `none` \| `male` \| `female` | Überschreibt Gender-Erkennung |
| date_format | `data-date-format` | `de` \| `long` \| `iso` | Datumsformat |

---

## SEKTION H: Akinator-Engine JSON-Schema (SPEC-038)

Kanonisches JSON-Schema für alle KI-Interaktionen.
Leere Felder = `null` (nicht weglassen — explizit null für Vollständigkeit).

```json
{
  "sender":       null,
  "note":         null,
  "recipient":    null,
  "date":         null,
  "your_ref":     null,
  "our_ref":      null,
  "subject":      null,
  "salutation":   null,
  "body":         null,
  "greeting":     null,
  "signature":    null,
  "author_company": null,
  "author_name":    null,
  "author_street":  null,
  "author_zip":     null,
  "author_city":    null,
  "author_phone":   null,
  "author_email":   null,
  "author_iban":    null
}
```

**Mapping-Regel:** `tag.slice(4).replace(/-/g, '_')` → JSON-Key.
`readDOMasJSON()` liest IMMER `textContent` (ADR-008, TOMB-L008).

---

## SEKTION I: CMA-Koordinaten-Referenz

| CMA-Konstante | mm-Wert | CSS-Variable | JSON-Keys |
|---|---|---|---|
| SENDER_ZONE_TOP | 27.000 | `--sender-zone-top` | sender |
| ADDRESS_TOP_B | 45.000 | `--address-top` | note, recipient |
| ADDRESS_TOP_A | 27.000 | `--margin-top-a` | note, recipient (Form A) |
| INFO_BLOCK_TOP | 97.400 | `--info-block-top` | date, your_ref, our_ref |
| SUBJECT_TOP | 103.400 | `--subject-top` | subject |
| FOOTER_TOP | 269.000 | `--footer-top` | signature |
| ADDRESS_WIDTH | 85.000 | `--address-width` | note, recipient |
| ADDRESS_HEIGHT | 45.000 | `--address-height` | (Container-Constraint) |
| MARGIN_LEFT | 25.000 | `--margin-left` | alle Zonen |
| MARGIN_RIGHT | 20.000 | `--margin-right` | textbereich right |

**ADR-009:** Diese Werte sind primär in `css/din5008-paper.css :root {}` definiert.
`constants.js CMA` ist sekundär — nur für JS-Berechnungen (px-Konversion).

---

## SEKTION J: data-cma-* Attribute (IMR 2.1 — Typed attr() Zukunftsspeicher)

*Zweck: Vorbereitung für CSS Values Level 5 (Typed attr()) — BRAIN-010 Tier-3.*
*Status: HEUTE SCHREIBEN — harmlos, additiv, null Breaking Change.*
*Chrome 146+: Typed attr() noch experimentell — @supports-Guard erforderlich.*

Wenn CSS Values Level 5 (Typed `attr()`) Baseline wird:
```css
din-subject { top: attr(data-cma-top type(<length>)); }
```
Bis dahin: `css/din5008-paper.css :root {}` ist SSoT (ADR-009).

### Vollständige Attribut-Tabelle (kanonisch)

| HTML-Tag | data-cma-top | data-cma-left | data-cma-width | Hinweis |
|---|---|---|---|---|
| `<din-sender>` | `27mm` | `25mm` | `165mm` | Einzeilig, kein festes height |
| `<din-note>` | `45mm` | `25mm` | `85mm` | Relativ im Anschrift-Container |
| `<din-recipient>` | `62.7mm` | `25mm` | `85mm` | 45mm + 17.7mm Vermerkzone |
| `<din-date>` | `97.4mm` | `120mm` | `75mm` | *** AVIATION GRADE *** |
| `<din-your-ref>` | `97.4mm` | `25mm` | `44mm` | Linke Infospalte |
| `<din-our-ref>` | `97.4mm` | `70mm` | `44mm` | Mittlere Infospalte |
| `<din-subject>` | `103.4mm` | `25mm` | `165mm` | *** AVIATION GRADE *** |
| `<din-salutation>` | `113mm` | `25mm` | `165mm` | Dynamisch nach Betreff |
| `<din-body>` | dynamisch | `25mm` | `165mm` | Kein festes top — flow |
| `<din-greeting>` | dynamisch | `25mm` | `165mm` | Kein festes top — flow |
| `<din-signature>` | `269mm` | `25mm` | `165mm` | *** AVIATION GRADE *** |

**Warum `dynamisch` für body/greeting:**
Beide Felder fließen nach dem Brieftext. `top: attr(...)` ist nur sinnvoll
bei festen Koordinaten. Flow-Positionen bleiben CSS-`position:relative`-Sache.

### Migrations-Checkliste (wenn Typed attr() GA)
1. `data-cma-*` Attribute sind bereits am Tag ← dieser Schritt (heute)
2. `@layer din.core`: Tag-Selektoren auf `attr(data-cma-top type(<length>))` umstellen
3. `@supports (top: attr(data-cma-top type(<length>)))` als Guard
4. `cma-bridge.js: initCMABridge()` löschen (bereits Dead Code per ADR-009)
5. `cma-bridge.js` gesamte Datei löschen, Import in app.js entfernen

---

## SEKTION K: Ghost-Mirror — Zero-Width-Marker Pattern (ADR-008)

*Hinzugefügt: 2026-03-20. Chrome 146+: Sanitizer API für setHTML() sofort nutzbar.*

### Was der Ghost-Mirror ist

```html
<din-body contenteditable="plaintext-only">   ← SSoT, immer Plaintext
<din-body-mirror aria-hidden="true">          ← Nur Visualisierung
```

### Das Zero-Width-Marker Pattern

Markdown-Marker in `<din-body>` werden im Druckfall platzneutral entfernt:

```css
@media print {
  din-body        { display: none !important; }
  din-body-mirror { display: block !important; }
  .md-marker      { display: none !important; }
}
```

`display: none` (nicht `visibility: hidden`) — **platzneutral, kein Leerraum**.

### Screen-State-Maschine

```
State 1: Nutzer tippt (din-body fokussiert)
  → din-body: sichtbar | din-body-mirror: opacity:0 | .md-marker: sichtbar

State 2: Nutzer liest (kein Fokus)
  → din-body: opacity:0 | din-body-mirror: opacity:1 | .md-marker: irrelevant

State 3: Print
  → din-body: display:none | din-body-mirror: display:block | .md-marker: display:none
```

**Invariante:** `din-body.textContent` = IMMER die Datenquelle.
`readDOMasJSON()` liest NIEMALS `din-body-mirror`.

### Erlaubte Markdown-Syntax

| Syntax | Gerendert als | Platzneutral? |
|---|---|---|
| `**fett**` | `<strong>` | Ja |
| `*kursiv*` | `<em>` | Ja |
| `~~durch~~` | `<del>` | Ja |
| `` `code` `` | `<code>` | Ja |
| `> Zitat` | `<blockquote>` | Ja |
| `- Liste` | `<ul><li>` | Ja |
| `1. Liste` | `<ol><li>` | Ja |
| `\n\n` | `<br><br>` | Ja — kein Marker |

**Ghost-Mirror-Sanitization (Chrome 146+ — sofort nutzbar):**
`setHTML()` mit nativer Sanitizer API. Whitelist:
`['strong','em','del','code','blockquote','ul','ol','li','br']`
Alle anderen Tags → automatisch entfernt. Kein XSS-Risiko.
